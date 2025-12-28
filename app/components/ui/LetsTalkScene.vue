<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { gsap } from 'gsap';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePointer } from '@vueuse/core';
import useScrollSmoother from '@/composables/useScrollSmoother';

const props = defineProps({
  mode: {
    type: String,
    default: 'dark', // 'dark' or 'light'
  },
  text: {
    type: String,
    default: "let's talk",
  },
  shape: {
    type: String,
    default: 'circle', // 'rectangle', 'circle', 'svg'
  },
  svgUrls: {
    type: Array,
    default: () => [],
  },
  morphInterval: {
    type: Number,
    default: 5000,
  },
});

// Register GSAP plugins
gsap.registerPlugin(InertiaPlugin, ScrollTrigger);

const { pointerType: _pointerType, x: eventX, y: eventY } = usePointer();
const { scrollSmoother } = useScrollSmoother();

const canvasRef = ref(null);
let ctx = null;

let dots = [];
let lastTime = 0;
let lastX = 0;
let lastY = 0;
const lastMousePosition = { x: 0, y: 0 };
let scrollTriggerInstance = null;
let animationFrameId = null;

const opacity = { base: 0.1, active: 1 };
const threshold = 150;
const speedThreshold = 150;
const shockRadius = 250;
const shockPower = 5;
const maxSpeed = 5000;
const centerHole = false;
const dotSize = 8; // 0.5rem * 16 = 8px
const dotGap = 16; // 2em gap

const svgsData = ref([]);
const currentSvgIndex = ref(0);
let morphIntervalId = null;

async function loadSvgs() {
  const urls = props.svgUrls;

  svgsData.value = [];

  for (const url of urls) {
    try {
      const response = await fetch(url);
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'image/svg+xml');
      const svgElement = doc.querySelector('svg');
      if (!svgElement) continue;

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

          return {
            path: new Path2D(d),
            fillRule,
          };
        })
        .filter(Boolean);

      if (paths.length > 0) {
        svgsData.value.push({
          paths,
          viewBox,
        });
      }
    } catch (e) {
      console.error('ScooterOk: Error loading SVG:', url, e);
    }
  }

  if (svgsData.value.length > 0) {
    updateShapeVisibility(false);
    if (svgsData.value.length > 1) {
      startMorphInterval();
    }
  }
}

function startMorphInterval() {
  if (morphIntervalId) clearInterval(morphIntervalId);
  morphIntervalId = setInterval(() => {
    nextShape();
  }, props.morphInterval);
}

function nextShape() {
  if (svgsData.value.length <= 1) return;
  currentSvgIndex.value = (currentSvgIndex.value + 1) % svgsData.value.length;
  updateShapeVisibility(true);
}

watch(() => props.svgUrls, loadSvgs, { deep: true });

function updateShapeVisibility(animate = true) {
  if (!canvasRef.value) return;

  const canvas = canvasRef.value;
  const rect = canvas.getBoundingClientRect();
  const contW = rect.width;
  const contH = rect.height;

  // Grid params for hole calculation
  const cols = Math.floor((contW + dotGap) / (dotSize + dotGap));
  const rows = Math.floor((contH + dotGap) / (dotSize + dotGap));
  const holeCols = centerHole ? (cols % 2 === 0 ? 4 : 5) : 0;
  const holeRows = centerHole ? (rows % 2 === 0 ? 4 : 5) : 0;
  const startCol = (cols - holeCols) / 2;
  const startRow = (rows - holeRows) / 2;

  // Circle parameters
  const centerX = contW / 2;
  const centerY = contH / 2;
  const radius = Math.min(contW, contH) / 2.5;

  // SVG Setup
  let paths = null;
  let svgScale = 1;
  let svgStartX = 0;
  let svgStartY = 0;
  let vbX = 0,
    vbY = 0;

  if (props.shape === 'svg' && svgsData.value.length > 0) {
    const data = svgsData.value[currentSvgIndex.value];
    if (data) {
      paths = data.paths;
      [vbX, vbY] = data.viewBox;
      const vbW = data.viewBox[2];
      const vbH = data.viewBox[3];

      // Calculate scale to fit container (contain)
      const scaleX = contW / vbW;
      const scaleY = contH / vbH;
      svgScale = Math.min(scaleX, scaleY) * 0.9;

      const drawW = vbW * svgScale;
      const drawH = vbH * svgScale;
      svgStartX = (contW - drawW) / 2;
      svgStartY = (contH - drawH) / 2;
    }
  }

  // Temporarily reset transform for isPointInPath checks if using SVG
  if (props.shape === 'svg') {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  dots.forEach((dot) => {
    let isVisible = true;

    if (props.shape === 'circle') {
      const dist = Math.hypot(dot.baseX - centerX, dot.baseY - centerY);
      if (dist > radius) {
        isVisible = false;
      }
    } else if (props.shape === 'rectangle') {
      const isHole =
        centerHole &&
        dot.row >= startRow &&
        dot.row < startRow + holeRows &&
        dot.col >= startCol &&
        dot.col < startCol + holeCols;

      if (isHole) {
        isVisible = false;
      }
    } else if (props.shape === 'svg' && paths && paths.length > 0) {
      const localX = (dot.baseX - svgStartX) / svgScale + vbX;
      const localY = (dot.baseY - svgStartY) / svgScale + vbY;

      const insideAny = paths.some((p) =>
        ctx.isPointInPath(p.path, localX, localY, p.fillRule)
      );
      if (!insideAny) isVisible = false;
    }

    const target = isVisible ? 1 : 0;

    if (animate) {
      // Explosion effect before morphing
      if (target === 1 && dot.shapeVisibility === 0) {
        // Dot is appearing
        gsap.fromTo(
          dot,
          {
            x: (Math.random() - 0.5) * 200,
            y: (Math.random() - 0.5) * 200,
            shapeVisibility: 0,
          },
          {
            x: 0,
            y: 0,
            shapeVisibility: 1,
            duration: 1.5,
            ease: 'elastic.out(1, 0.5)',
            delay: Math.random() * 0.2,
          }
        );
      } else if (target === 0 && dot.shapeVisibility === 1) {
        // Dot is disappearing
        gsap.to(dot, {
          x: (Math.random() - 0.5) * 200,
          y: (Math.random() - 0.5) * 200,
          shapeVisibility: 0,
          duration: 0.8,
          ease: 'power2.in',
          onComplete: () => {
            dot.x = 0;
            dot.y = 0;
          },
        });
      } else {
        // Just visibility change if needed
        gsap.to(dot, { shapeVisibility: target, duration: 0.5 });
      }
    } else {
      dot.shapeVisibility = target;
    }
  });

  if (props.shape === 'svg') {
    ctx.restore();
  }
}

function buildGrid() {
  if (!canvasRef.value) return;

  const canvas = canvasRef.value;
  const rect = canvas.getBoundingClientRect();

  // Set canvas size with device pixel ratio for crisp rendering
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  dots = [];

  const contW = rect.width;
  const contH = rect.height;

  const cols = Math.floor((contW + dotGap) / (dotSize + dotGap));
  const rows = Math.floor((contH + dotGap) / (dotSize + dotGap));
  const total = cols * rows;

  // Calculate grid offset to center it
  const totalGridWidth = cols * dotSize + (cols - 1) * dotGap;
  const totalGridHeight = rows * dotSize + (rows - 1) * dotGap;
  const offsetX = (contW - totalGridWidth) / 2;
  const offsetY = (contH - totalGridHeight) / 2;

  for (let i = 0; i < total; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;

    const baseX = offsetX + col * (dotSize + dotGap) + dotSize / 2;
    const baseY = offsetY + row * (dotSize + dotGap) + dotSize / 2;

    const dot = {
      baseX,
      baseY,
      x: 0,
      y: 0,
      row,
      col,
      opacity: opacity.base,
      shapeVisibility: 0, // Initially invisible until updateShapeVisibility is called
      inertiaApplied: false,
    };

    dots.push(dot);
  }

  updateShapeVisibility(false);

  startRenderLoop();
}

function handleMouseMove() {
  if (!canvasRef.value) return;

  const canvas = canvasRef.value;
  const rect = canvas.getBoundingClientRect();

  // Get current smooth scroll position
  const currentScrollY = scrollSmoother.value
    ? scrollSmoother.value.scroll
    : window.scrollY;
  const currentScrollX = window.scrollX;

  // Convert viewport coordinates to page coordinates
  const pageX = eventX.value + currentScrollX;
  const pageY = eventY.value + currentScrollY;

  // Convert to canvas-relative coordinates
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

  dots.forEach((dot) => {
    const dotX = dot.baseX + dot.x;
    const dotY = dot.baseY + dot.y;
    const dist = Math.hypot(dotX - localX, dotY - localY);
    const t = Math.max(0, 1 - dist / threshold);
    const opacityValue = gsap.utils.interpolate(
      opacity.base,
      opacity.active,
      t
    );

    dot.opacity = opacityValue;

    if (speed > speedThreshold && dist < threshold && !dot.inertiaApplied) {
      dot.inertiaApplied = true;
      const pushX = dotX - localX + vx * 0.005;
      const pushY = dotY - localY + vy * 0.005;

      gsap.to(dot, {
        inertia: { x: pushX, y: pushY, resistance: 750 },
        onComplete() {
          gsap.to(dot, {
            x: 0,
            y: 0,
            duration: 1.5,
            ease: 'elastic.out(1,0.75)',
          });
          dot.inertiaApplied = false;
        },
      });
    }
  });
}

function handleScroll() {
  if (!canvasRef.value) return;

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

  dots.forEach((dot) => {
    const dotX = dot.baseX + dot.x;
    const dotY = dot.baseY + dot.y;
    const dist = Math.hypot(dotX - localX, dotY - localY);
    const t = Math.max(0, 1 - dist / threshold);
    const opacityValue = gsap.utils.interpolate(
      opacity.base,
      opacity.active,
      t
    );
    dot.opacity = opacityValue;
  });
}

function handleClick(e) {
  if (!canvasRef.value) return;

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

  dots.forEach((dot) => {
    const dotX = dot.baseX + dot.x;
    const dotY = dot.baseY + dot.y;
    const dist = Math.hypot(dotX - localX, dotY - localY);

    if (dist < shockRadius && !dot.inertiaApplied) {
      dot.inertiaApplied = true;
      const falloff = Math.max(0, 1 - dist / shockRadius);
      const pushX = (dotX - localX) * shockPower * falloff;
      const pushY = (dotY - localY) * shockPower * falloff;

      gsap.to(dot, {
        inertia: { x: pushX, y: pushY, resistance: 750 },
        onComplete() {
          gsap.to(dot, {
            x: 0,
            y: 0,
            duration: 1.5,
            ease: 'elastic.out(1,0.75)',
          });
          dot.inertiaApplied = false;
        },
      });
    }
  });
}

function drawCanvas() {
  if (!ctx || !canvasRef.value) return;

  const canvas = canvasRef.value;
  const rect = canvas.getBoundingClientRect();

  // Clear canvas
  ctx.clearRect(0, 0, rect.width, rect.height);

  // Get dot color based on mode
  const dotColor = props.mode === 'light' ? '#000000' : '#ffffff';

  // Draw dots
  dots.forEach((dot) => {
    const finalOpacity =
      dot.opacity *
      (dot.shapeVisibility !== undefined ? dot.shapeVisibility : 1);
    if (finalOpacity < 0.01) return;

    const x = dot.baseX + dot.x;
    const y = dot.baseY + dot.y;

    ctx.globalAlpha = finalOpacity;
    ctx.fillStyle = dotColor;
    ctx.beginPath();
    ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalAlpha = 1;
}

function startRenderLoop() {
  const render = () => {
    drawCanvas();
    animationFrameId = requestAnimationFrame(render);
  };
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
if (props.svgUrls.length > 0 || props.svgUrl) {
  loadSvgs();
}

onMounted(() => {
  setTimeout(() => {
    buildGrid();
    initScrollTrigger();
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
  if (morphIntervalId) clearInterval(morphIntervalId);
  cleanupScrollTrigger();
  window.removeEventListener('resize', buildGrid);
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('click', handleClick);
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
