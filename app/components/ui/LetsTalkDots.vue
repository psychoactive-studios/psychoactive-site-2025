<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';
import { usePointer } from '@vueuse/core';
import useScrollSmoother from '@/composables/useScrollSmoother';
import LinkButton from './LinkButton.vue';

const props = defineProps({
  mode: {
    type: String,
    default: 'dark', // 'dark' or 'light'
  },
  text: {
    type: String,
    default: "let's talk",
  },
  href: {
    type: String,
    default: '/',
  },
  scale: {
    type: Number,
    default: 1.0,
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
let dotSize = 8;
let dotGap = 16;

// Buffers and attributes
let positionBuffer = null;
let offsetBuffer = null;
let basePositions = null; // Float32Array [x, y, x, y, ...]
let currentPositions = null; // Float32Array for final combined offsets [x, y, x, y, ...]
let interactionOffsets = null; // Float32Array for mouse interaction offsets
let opacityBuffer = null;
let opacities = null; // Float32Array for mouse proximity
let velocities = null; // Float32Array for physics

// Mouse tracking
let lastTime = 0;
let lastX = 0;
let lastY = 0;
const lastMousePosition = { x: 0, y: 0 };

// Constants
const baseOpacity = props.mode === 'light' ? 0.15 : 0.3;
const activeOpacity = props.mode === 'light' ? 0.7 : 1;
const opacity = { base: baseOpacity, active: activeOpacity };
let threshold = 70; // Will be calculated as 25% of canvas width
const speedThreshold = 150;
let shockRadius = 150; // Will be calculated based on canvas width
const shockPower = 5;
const maxSpeed = 5000;

// Shaders
const vertexShaderSource = `
  attribute vec2 a_basePosition;
  attribute vec2 a_offset;
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

    v_alpha = a_opacity;
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
    return false;
  }

  gl = canvasRef.value.getContext('webgl', {
    alpha: true,
    antialias: true,
    premultipliedAlpha: true,
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
  opacityBuffer = gl.createBuffer();

  return true;
}

function buildGrid() {
  if (!canvasRef.value || !gl) {
    return;
  }

  const width = window.innerWidth;
  if (width < 768) {
    dotSize = 4;
    dotGap = 8;
  } else if (width < 1600) {
    dotSize = 4;
    dotGap = 12;
  } else {
    dotSize = 6;
    dotGap = 16;
  }

  const canvas = canvasRef.value;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  gl.viewport(0, 0, canvas.width, canvas.height);

  const contW = rect.width;
  const contH = rect.height;

  // Calculate usable area for dots (original size before scale)
  const usableW = contW / props.scale;
  const usableH = contH / props.scale;

  // Calculate threshold as 10% of usable width
  threshold = usableW * 0.1;
  // Calculate shockRadius as 15% of usable width
  shockRadius = usableW * 0.15;

  const cols = Math.floor((usableW + dotGap) / (dotSize + dotGap));
  const rows = Math.floor((usableH + dotGap) / (dotSize + dotGap));
  dotCount = cols * rows;

  const totalGridWidth = cols * dotSize + (cols - 1) * dotGap;
  const totalGridHeight = rows * dotSize + (rows - 1) * dotGap;
  const offsetX = (contW - totalGridWidth) / 2;
  const offsetY = (contH - totalGridHeight) / 2;

  // Initialize arrays
  basePositions = new Float32Array(dotCount * 2);
  currentPositions = new Float32Array(dotCount * 2);
  interactionOffsets = new Float32Array(dotCount * 2);
  opacities = new Float32Array(dotCount);
  velocities = new Float32Array(dotCount * 2);

  for (let i = 0; i < dotCount; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;

    const baseX = offsetX + col * (dotSize + dotGap) + dotSize / 2;
    const baseY = offsetY + row * (dotSize + dotGap) + dotSize / 2;

    basePositions[i * 2] = baseX;
    basePositions[i * 2 + 1] = baseY;
    currentPositions[i * 2] = 0;
    currentPositions[i * 2 + 1] = 0;
    interactionOffsets[i * 2] = 0;
    interactionOffsets[i * 2 + 1] = 0;
    opacities[i] = opacity.base;
    velocities[i * 2] = 0;
    velocities[i * 2 + 1] = 0;
  }

  // Upload base positions (static)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, basePositions, gl.STATIC_DRAW);

  startRenderLoop();
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
    const dotX = basePositions[i * 2] + interactionOffsets[i * 2];
    const dotY = basePositions[i * 2 + 1] + interactionOffsets[i * 2 + 1];
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
    const dotX = basePositions[i * 2] + interactionOffsets[i * 2];
    const dotY = basePositions[i * 2 + 1] + interactionOffsets[i * 2 + 1];
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
    const dotX = basePositions[i * 2] + interactionOffsets[i * 2];
    const dotY = basePositions[i * 2 + 1] + interactionOffsets[i * 2 + 1];
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
  }
}

function render() {
  if (!gl || !program || !basePositions) return;

  const canvas = canvasRef.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  // Update physics
  updateSpringBack();

  // Copy interaction offsets to current positions
  for (let i = 0; i < dotCount; i++) {
    currentPositions[i * 2] = interactionOffsets[i * 2];
    currentPositions[i * 2 + 1] = interactionOffsets[i * 2 + 1];
  }

  // Clear
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.enable(gl.BLEND);
  gl.blendFuncSeparate(
    gl.SRC_ALPHA,
    gl.ONE_MINUS_SRC_ALPHA,
    gl.ONE,
    gl.ONE_MINUS_SRC_ALPHA
  );

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

onMounted(() => {
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
      <canvas
        ref="canvasRef"
        class="dots-canvas"
        :style="{ transform: `scale(${scale})` }"
      />
    </div>
    <LinkButton :href="href" :mode="props.mode === 'light' ? 'dark' : 'light'" class="lets-talk__link" size="small" target="_self">
      {{ text }}
    </LinkButton>    
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

  a.lets-talk__link, button.lets-talk__link {
    // width: 214px;    
    text-decoration: none;
    position: absolute;
    z-index: 0;    
  }  
}

.dots-wrap {
  width: 100%;
  aspect-ratio: 1.85;
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
