<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';
import { usePointer } from '@vueuse/core';
import useScrollSmoother from '@/composables/useScrollSmoother';

const props = defineProps({
  mode: {
    type: String,
    default: 'dark',
  },
  svgUrls: {
    type: Array,
    default: () => [],
  },
  morphInterval: {
    type: Number,
    default: 5000,
  },
  autoPlay: {
    type: Boolean,
    default: true,
  },
});

gsap.registerPlugin(ScrollTrigger);

const { x: eventX, y: eventY } = usePointer();
const { scrollSmoother } = useScrollSmoother();

const canvasRef = ref(null);
let gl = null;
let program = null;
let animationFrameId = null;
let scrollTriggerInstance = null;

// Dot grid data
let dotCount = 0;
let dotSize = 6;
let dotGap = 6;

// Buffers and attributes
let positionBuffer = null;
let offsetBuffer = null;
let basePositions = null; // Float32Array [x, y, x, y, ...]
let currentPositions = null; // Float32Array for final combined offsets [x, y, x, y, ...]
let animationOffsets = null; // Float32Array for morph animation offsets
let interactionOffsets = null; // Float32Array for mouse interaction offsets
let startPositions = null; // Float32Array for animation start positions
let targetPositions = null; // Float32Array for target offsets
let visibilityBuffer = null;
let currentVisibility = null; // Float32Array [v, v, v, ...]
let startVisibility = null; // Float32Array for animation start visibility
let targetVisibility = null; // Float32Array
let opacityBuffer = null;
let opacities = null; // Float32Array for mouse proximity
let velocities = null; // Float32Array for physics

// Animation state
let isAnimating = false;
const animationDuration = 1.5; // seconds
let animationStartTime = 0;

// Per-dot animation delays for staggered effect
let animationDelays = null; // Float32Array

// SVG data
const svgsData = ref([]);
const currentSvgIndex = ref(0);
const isStarted = ref(props.autoPlay);

// Mouse tracking
let lastTime = 0;
let lastX = 0;
let lastY = 0;
const lastMousePosition = { x: 0, y: 0 };

// Constants
const opacity = { base: 0.6, active: 1 };
const threshold = 100;
const speedThreshold = 150;
const shockRadius = 200;
const shockPower = 3;
const maxSpeed = 5000;

// Shaders
const vertexShaderSource = `
  attribute vec2 a_basePosition;
  attribute vec2 a_offset;
  attribute float a_visibility;
  attribute float a_opacity;

  uniform vec2 u_resolution;
  uniform float u_pointSize;

  varying float v_alpha;

  void main() {
    vec2 position = a_basePosition + a_offset;

    // Convert to clip space (-1 to 1)
    vec2 clipSpace = (position / u_resolution) * 2.0 - 1.0;
    clipSpace.y = -clipSpace.y; // Flip Y

    gl_Position = vec4(clipSpace, 0.0, 1.0);
    gl_PointSize = u_pointSize;

    v_alpha = a_visibility * a_opacity;
  }
`;

const fragmentShaderSource = `
  precision mediump float;

  uniform vec3 u_color;

  varying float v_alpha;

  void main() {
    // Create circular point
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);

    if (dist > 0.5) {
      discard;
    }

    gl_FragColor = vec4(u_color, v_alpha);
  }
`;

function play() {
  isStarted.value = true;
  updateShapeVisibility(true);
}

function nextShape(index) {
  console.log(
    'LetsTalkSceneGL: nextShape called with index:',
    index,
    'svgsData.length:',
    svgsData.value.length
  );
  isStarted.value = true;

  // If no SVGs loaded yet, just mark as started
  if (svgsData.value.length === 0) {
    console.log('LetsTalkSceneGL: No SVGs loaded yet, waiting...');
    return;
  }

  if (typeof index === 'number') {
    currentSvgIndex.value = index % svgsData.value.length;
  } else {
    currentSvgIndex.value = (currentSvgIndex.value + 1) % svgsData.value.length;
  }
  console.log('LetsTalkSceneGL: currentSvgIndex:', currentSvgIndex.value);
  updateShapeVisibility(true);
}

defineExpose({
  play,
  nextShape,
});

function createShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(vertexShader, fragmentShader) {
  const prog = gl.createProgram();
  gl.attachShader(prog, vertexShader);
  gl.attachShader(prog, fragmentShader);
  gl.linkProgram(prog);

  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(prog));
    return null;
  }
  return prog;
}

function initWebGL() {
  if (!canvasRef.value) {
    console.log('LetsTalkSceneGL: initWebGL - no canvas ref');
    return false;
  }

  gl = canvasRef.value.getContext('webgl', {
    alpha: true,
    antialias: true,
    premultipliedAlpha: false,
  });

  if (!gl) {
    console.error('WebGL not supported');
    return false;
  }

  const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

  if (!vertexShader || !fragmentShader) return false;

  program = createProgram(vertexShader, fragmentShader);
  if (!program) return false;

  // Create buffers
  positionBuffer = gl.createBuffer();
  offsetBuffer = gl.createBuffer();
  visibilityBuffer = gl.createBuffer();
  opacityBuffer = gl.createBuffer();

  console.log('LetsTalkSceneGL: WebGL initialized successfully');
  return true;
}

function buildGrid() {
  console.log('LetsTalkSceneGL: buildGrid called');
  if (!canvasRef.value || !gl) {
    console.log(
      'LetsTalkSceneGL: buildGrid early return - canvas:',
      !!canvasRef.value,
      'gl:',
      !!gl
    );
    return;
  }

  const width = window.innerWidth;
  if (width < 768) {
    dotSize = 3;
    dotGap = 3;
  } else if (width < 1600) {
    dotSize = 4;
    dotGap = 4;
  } else {
    dotSize = 6;
    dotGap = 6;
  }

  const canvas = canvasRef.value;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  gl.viewport(0, 0, canvas.width, canvas.height);

  const contW = rect.width;
  const contH = rect.height;

  const cols = Math.floor((contW + dotGap) / (dotSize + dotGap));
  const rows = Math.floor((contH + dotGap) / (dotSize + dotGap));
  dotCount = cols * rows;

  const totalGridWidth = cols * dotSize + (cols - 1) * dotGap;
  const totalGridHeight = rows * dotSize + (rows - 1) * dotGap;
  const offsetX = (contW - totalGridWidth) / 2;
  const offsetY = (contH - totalGridHeight) / 2;

  // Initialize arrays
  basePositions = new Float32Array(dotCount * 2);
  currentPositions = new Float32Array(dotCount * 2);
  animationOffsets = new Float32Array(dotCount * 2);
  interactionOffsets = new Float32Array(dotCount * 2);
  startPositions = new Float32Array(dotCount * 2);
  targetPositions = new Float32Array(dotCount * 2);
  currentVisibility = new Float32Array(dotCount);
  startVisibility = new Float32Array(dotCount);
  targetVisibility = new Float32Array(dotCount);
  opacities = new Float32Array(dotCount);
  velocities = new Float32Array(dotCount * 2);
  animationDelays = new Float32Array(dotCount);

  for (let i = 0; i < dotCount; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;

    const baseX = offsetX + col * (dotSize + dotGap) + dotSize / 2;
    const baseY = offsetY + row * (dotSize + dotGap) + dotSize / 2;

    basePositions[i * 2] = baseX;
    basePositions[i * 2 + 1] = baseY;
    currentPositions[i * 2] = 0;
    currentPositions[i * 2 + 1] = 0;
    animationOffsets[i * 2] = 0;
    animationOffsets[i * 2 + 1] = 0;
    interactionOffsets[i * 2] = 0;
    interactionOffsets[i * 2 + 1] = 0;
    startPositions[i * 2] = 0;
    startPositions[i * 2 + 1] = 0;
    targetPositions[i * 2] = 0;
    targetPositions[i * 2 + 1] = 0;
    currentVisibility[i] = 0;
    startVisibility[i] = 0;
    targetVisibility[i] = 0;
    opacities[i] = opacity.base;
    velocities[i * 2] = 0;
    velocities[i * 2 + 1] = 0;
    animationDelays[i] = 0;
  }

  // Upload base positions (static)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, basePositions, gl.STATIC_DRAW);

  if (isStarted.value) {
    updateShapeVisibility(false);
  }

  startRenderLoop();
}

async function loadSvgs() {
  if (typeof window === 'undefined') return;

  const urls = props.svgUrls;
  svgsData.value = [];

  console.log('LetsTalkSceneGL: Loading SVGs:', urls);

  for (const url of urls) {
    try {
      const response = await fetch(url);
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'image/svg+xml');
      const svgElement = doc.querySelector('svg');
      if (!svgElement) {
        console.warn('LetsTalkSceneGL: No SVG element found in:', url);
        continue;
      }

      let viewBox = [0, 0, 100, 100];
      const viewBoxAttr = svgElement.getAttribute('viewBox');
      if (viewBoxAttr) {
        viewBox = viewBoxAttr.split(' ').map(Number);
      } else {
        const width = parseFloat(svgElement.getAttribute('width')) || 100;
        const height = parseFloat(svgElement.getAttribute('height')) || 100;
        viewBox = [0, 0, width, height];
      }

      const pathElements = Array.from(doc.querySelectorAll('path'));
      const paths = pathElements
        .map((el) => {
          const d = el.getAttribute('d');
          if (!d) return null;
          const rawFillRule = (
            el.getAttribute('fill-rule') || ''
          ).toLowerCase();
          const fillRule = rawFillRule === 'evenodd' ? 'evenodd' : 'nonzero';
          return { path: new Path2D(d), fillRule };
        })
        .filter(Boolean);

      if (paths.length > 0) {
        svgsData.value.push({ paths, viewBox });
        console.log(
          'LetsTalkSceneGL: Loaded SVG:',
          url,
          'paths:',
          paths.length
        );
      } else {
        console.warn('LetsTalkSceneGL: No paths found in:', url);
      }
    } catch (e) {
      console.error('Error loading SVG:', url, e);
    }
  }

  console.log(
    'LetsTalkSceneGL: Total SVGs loaded:',
    svgsData.value.length,
    'isStarted:',
    isStarted.value
  );

  if (svgsData.value.length > 0 && isStarted.value) {
    updateShapeVisibility(false);
  }
}

function updateShapeVisibility(animate = true) {
  console.log(
    'LetsTalkSceneGL: updateShapeVisibility called, animate:',
    animate,
    'dotCount:',
    dotCount
  );
  if (!canvasRef.value || !basePositions) {
    console.log(
      'LetsTalkSceneGL: updateShapeVisibility early return - canvas:',
      !!canvasRef.value,
      'basePositions:',
      !!basePositions
    );
    return;
  }

  const canvas = canvasRef.value;
  const rect = canvas.getBoundingClientRect();
  const contW = rect.width;
  const contH = rect.height;

  // Create temporary 2D canvas for path testing
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = 1;
  tempCanvas.height = 1;
  const ctx = tempCanvas.getContext('2d');

  let paths = [];
  let svgScale = 1;
  let svgStartX = 0;
  let svgStartY = 0;
  let vbX = 0,
    vbY = 0;

  if (svgsData.value.length > 0) {
    const data = svgsData.value[currentSvgIndex.value];
    if (data) {
      paths = data.paths;
      [vbX, vbY] = data.viewBox;
      const vbW = data.viewBox[2];
      const vbH = data.viewBox[3];

      const scaleX = contW / vbW;
      const scaleY = contH / vbH;
      svgScale = Math.min(scaleX, scaleY) * 0.9;

      const drawW = vbW * svgScale;
      const drawH = vbH * svgScale;
      svgStartX = (contW - drawW) / 2;
      svgStartY = (contH - drawH) / 2;
    }
  }

  for (let i = 0; i < dotCount; i++) {
    const baseX = basePositions[i * 2];
    const baseY = basePositions[i * 2 + 1];

    const localX = (baseX - svgStartX) / svgScale + vbX;
    const localY = (baseY - svgStartY) / svgScale + vbY;

    const insideAny = paths.some((p) =>
      ctx.isPointInPath(p.path, localX, localY, p.fillRule)
    );

    const target = insideAny ? 1 : 0;
    const prevVis = currentVisibility[i];
    const prevAnimX = animationOffsets[i * 2];
    const prevAnimY = animationOffsets[i * 2 + 1];

    // Store start values for animation
    startVisibility[i] = prevVis;
    startPositions[i * 2] = prevAnimX;
    startPositions[i * 2 + 1] = prevAnimY;

    targetVisibility[i] = target;

    if (animate) {
      // Set animation delay for staggered effect
      animationDelays[i] = Math.random() * 0.2;

      if (target === 1 && prevVis < 0.5) {
        // Appearing - start from random position
        startPositions[i * 2] = (Math.random() - 0.5) * 200;
        startPositions[i * 2 + 1] = (Math.random() - 0.5) * 200;
        animationOffsets[i * 2] = startPositions[i * 2];
        animationOffsets[i * 2 + 1] = startPositions[i * 2 + 1];
        targetPositions[i * 2] = 0;
        targetPositions[i * 2 + 1] = 0;
      } else if (target === 0 && prevVis >= 0.5) {
        // Disappearing - animate to random position
        targetPositions[i * 2] = (Math.random() - 0.5) * 200;
        targetPositions[i * 2 + 1] = (Math.random() - 0.5) * 200;
      } else {
        // Stay in place or animate to center
        targetPositions[i * 2] = 0;
        targetPositions[i * 2 + 1] = 0;
      }
    } else {
      // Instant update
      currentVisibility[i] = target;
      animationOffsets[i * 2] = 0;
      animationOffsets[i * 2 + 1] = 0;
      startPositions[i * 2] = 0;
      startPositions[i * 2 + 1] = 0;
      targetPositions[i * 2] = 0;
      targetPositions[i * 2 + 1] = 0;
    }
  }

  if (animate) {
    animationStartTime = performance.now();
    isAnimating = true;
  }
}

// Elastic out easing function
function elasticOut(t) {
  if (t === 0 || t === 1) return t;
  const p = 0.5;
  return Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1;
}

// Power2 in easing for disappearing dots
function power2In(t) {
  return t * t;
}

// Linear interpolation
function lerp(start, end, t) {
  return start + (end - start) * t;
}

function updateAnimation() {
  if (!isAnimating) return;

  const elapsed = (performance.now() - animationStartTime) / 1000;

  let allDone = true;

  for (let i = 0; i < dotCount; i++) {
    const delay = animationDelays[i];
    const targetVis = targetVisibility[i];
    const isAppearing = targetVis === 1;

    // Calculate progress for this dot considering its delay
    const dotElapsed = Math.max(0, elapsed - delay);
    const duration = isAppearing ? animationDuration : 0.8;
    const dotProgress = Math.min(dotElapsed / duration, 1);

    if (dotProgress < 1) {
      allDone = false;
    }

    // Use different easing for appearing vs disappearing
    const t = isAppearing ? elasticOut(dotProgress) : power2In(dotProgress);

    // Interpolate animation offset from start to target
    animationOffsets[i * 2] = lerp(
      startPositions[i * 2],
      targetPositions[i * 2],
      t
    );
    animationOffsets[i * 2 + 1] = lerp(
      startPositions[i * 2 + 1],
      targetPositions[i * 2 + 1],
      t
    );

    // Interpolate visibility
    currentVisibility[i] = lerp(startVisibility[i], targetVis, t);
  }

  if (allDone) {
    // Snap to final values
    for (let i = 0; i < dotCount; i++) {
      animationOffsets[i * 2] = targetPositions[i * 2];
      animationOffsets[i * 2 + 1] = targetPositions[i * 2 + 1];
      currentVisibility[i] = targetVisibility[i];
    }
    isAnimating = false;
  }
}

function handleMouseMove() {
  if (!canvasRef.value || !basePositions) return;

  const canvas = canvasRef.value;
  const rect = canvas.getBoundingClientRect();

  const currentScrollY = scrollSmoother.value
    ? scrollSmoother.value.scroll
    : window.scrollY;
  const currentScrollX = window.scrollX;

  const pageX = eventX.value + currentScrollX;
  const pageY = eventY.value + currentScrollY;

  const canvasPageX = rect.left + currentScrollX;
  const canvasPageY = rect.top + currentScrollY;
  const localX = pageX - canvasPageX;
  const localY = pageY - canvasPageY;

  lastMousePosition.x = localX;
  lastMousePosition.y = localY;

  const now = performance.now();
  const dt = now - lastTime || 16;
  const dx = pageX - lastX;
  const dy = pageY - lastY;
  let vx = (dx / dt) * 1000;
  let vy = (dy / dt) * 1000;
  let speed = Math.hypot(vx, vy);

  if (speed > maxSpeed) {
    const scale = maxSpeed / speed;
    vx *= scale;
    vy *= scale;
    speed = maxSpeed;
  }

  lastTime = now;
  lastX = pageX;
  lastY = pageY;

  // Update opacities based on mouse proximity
  for (let i = 0; i < dotCount; i++) {
    const dotX =
      basePositions[i * 2] +
      animationOffsets[i * 2] +
      interactionOffsets[i * 2];
    const dotY =
      basePositions[i * 2 + 1] +
      animationOffsets[i * 2 + 1] +
      interactionOffsets[i * 2 + 1];
    const dist = Math.hypot(dotX - localX, dotY - localY);
    const t = Math.max(0, 1 - dist / threshold);
    opacities[i] = opacity.base + (opacity.active - opacity.base) * t;

    // Push dots on fast mouse movement
    if (speed > speedThreshold && dist < threshold) {
      const pushX = (dotX - localX + vx * 0.005) * 0.1;
      const pushY = (dotY - localY + vy * 0.005) * 0.1;
      interactionOffsets[i * 2] += pushX;
      interactionOffsets[i * 2 + 1] += pushY;
    }
  }
}

function handleScroll() {
  if (!canvasRef.value || !basePositions) return;

  const canvas = canvasRef.value;
  const rect = canvas.getBoundingClientRect();

  const currentScrollY = scrollSmoother.value
    ? scrollSmoother.value.scroll
    : window.scrollY;
  const currentScrollX = window.scrollX;

  const pageX = eventX.value + currentScrollX;
  const pageY = eventY.value + currentScrollY;

  const canvasPageX = rect.left + currentScrollX;
  const canvasPageY = rect.top + currentScrollY;
  const localX = pageX - canvasPageX;
  const localY = pageY - canvasPageY;

  lastMousePosition.x = localX;
  lastMousePosition.y = localY;

  for (let i = 0; i < dotCount; i++) {
    const dotX =
      basePositions[i * 2] +
      animationOffsets[i * 2] +
      interactionOffsets[i * 2];
    const dotY =
      basePositions[i * 2 + 1] +
      animationOffsets[i * 2 + 1] +
      interactionOffsets[i * 2 + 1];
    const dist = Math.hypot(dotX - localX, dotY - localY);
    const t = Math.max(0, 1 - dist / threshold);
    opacities[i] = opacity.base + (opacity.active - opacity.base) * t;
  }
}

function handleClick(e) {
  if (!canvasRef.value || !basePositions) return;

  const canvas = canvasRef.value;
  const rect = canvas.getBoundingClientRect();

  const currentScrollY = scrollSmoother.value
    ? scrollSmoother.value.scroll
    : window.scrollY;
  const currentScrollX = window.scrollX;

  const canvasPageX = rect.left + currentScrollX;
  const canvasPageY = rect.top + currentScrollY;
  const localX = e.pageX - canvasPageX;
  const localY = e.pageY - canvasPageY;

  for (let i = 0; i < dotCount; i++) {
    const dotX =
      basePositions[i * 2] +
      animationOffsets[i * 2] +
      interactionOffsets[i * 2];
    const dotY =
      basePositions[i * 2 + 1] +
      animationOffsets[i * 2 + 1] +
      interactionOffsets[i * 2 + 1];
    const dist = Math.hypot(dotX - localX, dotY - localY);

    if (dist < shockRadius) {
      const falloff = Math.max(0, 1 - dist / shockRadius);
      // Apply impulse to velocity instead of position for smooth acceleration
      const pushX = (dotX - localX) * shockPower * falloff * 0.1;
      const pushY = (dotY - localY) * shockPower * falloff * 0.1;
      velocities[i * 2] += pushX;
      velocities[i * 2 + 1] += pushY;
    }
  }
}

// Spring back animation with physics (velocity + friction)
function updateSpringBack() {
  const springStrength = 0.01; // Stiffness (Lower = slower return, e.g. 0.01)
  const friction = 0.9; // Damping (Higher = more slippery/floaty, e.g. 0.9)

  for (let i = 0; i < dotCount; i++) {
    // Only spring back dots that should be visible
    if (targetVisibility[i] > 0.5) {
      const idxX = i * 2;
      const idxY = i * 2 + 1;

      // Force towards center (0,0) - Hooke's Law: F = -kx
      const dx = -interactionOffsets[idxX];
      const dy = -interactionOffsets[idxY];

      // Apply spring force to velocity
      velocities[idxX] += dx * springStrength;
      velocities[idxY] += dy * springStrength;

      // Apply friction
      velocities[idxX] *= friction;
      velocities[idxY] *= friction;

      // Apply velocity to interaction offset
      interactionOffsets[idxX] += velocities[idxX];
      interactionOffsets[idxY] += velocities[idxY];
    } else {
      // Reset velocities for hidden dots
      velocities[i * 2] = 0;
      velocities[i * 2 + 1] = 0;
    }
  }
}

function render() {
  if (!gl || !program || !basePositions) return;

  const canvas = canvasRef.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  // Update animations
  updateAnimation();
  updateSpringBack();

  // Combine animation and interaction offsets
  for (let i = 0; i < dotCount; i++) {
    currentPositions[i * 2] =
      animationOffsets[i * 2] + interactionOffsets[i * 2];
    currentPositions[i * 2 + 1] =
      animationOffsets[i * 2 + 1] + interactionOffsets[i * 2 + 1];
  }

  // Clear
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  gl.useProgram(program);

  // Set uniforms
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  gl.uniform2f(resolutionLocation, rect.width, rect.height);

  const pointSizeLocation = gl.getUniformLocation(program, 'u_pointSize');
  gl.uniform1f(pointSizeLocation, dotSize * dpr);

  const colorLocation = gl.getUniformLocation(program, 'u_color');
  if (props.mode === 'light') {
    gl.uniform3f(colorLocation, 0, 0, 0);
  } else {
    gl.uniform3f(colorLocation, 1, 1, 1);
  }

  // Base positions
  const basePositionLocation = gl.getAttribLocation(program, 'a_basePosition');
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.enableVertexAttribArray(basePositionLocation);
  gl.vertexAttribPointer(basePositionLocation, 2, gl.FLOAT, false, 0, 0);

  // Offsets (current positions)
  const offsetLocation = gl.getAttribLocation(program, 'a_offset');
  gl.bindBuffer(gl.ARRAY_BUFFER, offsetBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, currentPositions, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(offsetLocation);
  gl.vertexAttribPointer(offsetLocation, 2, gl.FLOAT, false, 0, 0);

  // Visibility
  const visibilityLocation = gl.getAttribLocation(program, 'a_visibility');
  gl.bindBuffer(gl.ARRAY_BUFFER, visibilityBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, currentVisibility, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(visibilityLocation);
  gl.vertexAttribPointer(visibilityLocation, 1, gl.FLOAT, false, 0, 0);

  // Opacity
  const opacityLocation = gl.getAttribLocation(program, 'a_opacity');
  gl.bindBuffer(gl.ARRAY_BUFFER, opacityBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, opacities, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(opacityLocation);
  gl.vertexAttribPointer(opacityLocation, 1, gl.FLOAT, false, 0, 0);

  // Draw
  gl.drawArrays(gl.POINTS, 0, dotCount);

  animationFrameId = requestAnimationFrame(render);
}

function startRenderLoop() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  render();
}

function stopRenderLoop() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function initScrollTrigger() {
  if (!canvasRef.value) return;

  scrollTriggerInstance = ScrollTrigger.create({
    trigger: canvasRef.value,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: () => {
      handleScroll();
    },
  });
}

function cleanupScrollTrigger() {
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill();
    scrollTriggerInstance = null;
  }
}

watch(() => props.svgUrls, loadSvgs, { deep: true });

onMounted(() => {
  if (props.svgUrls.length > 0) {
    loadSvgs();
  }

  setTimeout(() => {
    if (initWebGL()) {
      buildGrid();
      initScrollTrigger();
    }
  }, 100);

  window.addEventListener('resize', () => {
    stopRenderLoop();
    buildGrid();
  });
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('click', handleClick);
});

onUnmounted(() => {
  stopRenderLoop();
  cleanupScrollTrigger();
  window.removeEventListener('resize', buildGrid);
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('click', handleClick);

  // Cleanup WebGL
  if (gl) {
    if (positionBuffer) gl.deleteBuffer(positionBuffer);
    if (offsetBuffer) gl.deleteBuffer(offsetBuffer);
    if (visibilityBuffer) gl.deleteBuffer(visibilityBuffer);
    if (opacityBuffer) gl.deleteBuffer(opacityBuffer);
    if (program) gl.deleteProgram(program);
  }
});
</script>

<template>
  <section
    :class="[
      'lets-talk',
      mode === 'light' ? 'lets-talk--light' : 'lets-talk--dark',
    ]"
  >
    <div class="dots-wrap">
      <canvas ref="canvasRef" class="dots-canvas" />
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/functions' as *;

.lets-talk {
  justify-content: center;
  align-items: center;
  display: flex;
  position: relative;
  width: 100%;
  height: 100%;

  &__link {
    width: 214px;
    color: currentColor;
    text-decoration: none;
    position: absolute;
    z-index: 0;
    @include flex-center;
    height: 64px;
    padding: 0 getRem(56);
    border-radius: 32px;
    font-family: 'RoobertMono';
    font-size: 1rem;
    font-style: normal;
    font-weight: 500;
    line-height: 1.68;
    text-transform: uppercase;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 48px;
      z-index: -1;
      transition: scale 0.3s cubic-bezier(0.33, 1, 0.68, 1);
    }

    &:hover {
      &::before {
        scale: 0.85;
      }
    }
  }

  &--dark {
    .lets-talk__link {
      color: $color-background;
      &::before {
        background-color: $color-foreground;
      }
    }
  }

  &--light {
    .lets-talk__link {
      color: $color-foreground;
      &::before {
        background-color: $color-background;
      }
    }
  }
}

.dots-wrap {
  width: 100%;
  height: 100%;
  position: relative;
}

.dots-canvas {
  pointer-events: none;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
