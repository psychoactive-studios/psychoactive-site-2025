<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { gsap } from 'gsap';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePointer } from '@vueuse/core';
import useScrollSmoother from '@/composables/useScrollSmoother';
import useAudioManager from '~/composables/useAudioManager';

const { playInteractionSound } = useAudioManager();

const letsTalkButtonRef = ref(null);

const props = defineProps({
  mode: {
    type: String,
    default: 'dark', // 'dark' or 'light'
  },
  text: {
    type: String,
    default: "let's talk",
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

  const holeCols = centerHole ? (cols % 2 === 0 ? 4 : 5) : 0;
  const holeRows = centerHole ? (rows % 2 === 0 ? 4 : 5) : 0;
  const startCol = (cols - holeCols) / 2;
  const startRow = (rows - holeRows) / 2;

  // Calculate grid offset to center it
  const totalGridWidth = cols * dotSize + (cols - 1) * dotGap;
  const totalGridHeight = rows * dotSize + (rows - 1) * dotGap;
  const offsetX = (contW - totalGridWidth) / 2;
  const offsetY = (contH - totalGridHeight) / 2;

  for (let i = 0; i < total; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const isHole =
      centerHole &&
      row >= startRow &&
      row < startRow + holeRows &&
      col >= startCol &&
      col < startCol + holeCols;

    if (!isHole) {
      const baseX = offsetX + col * (dotSize + dotGap) + dotSize / 2;
      const baseY = offsetY + row * (dotSize + dotGap) + dotSize / 2;

      const dot = {
        baseX,
        baseY,
        x: 0,
        y: 0,
        opacity: opacity.base,
        inertiaApplied: false,
      };

      dots.push(dot);
    }
  }

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
    const x = dot.baseX + dot.x;
    const y = dot.baseY + dot.y;

    ctx.globalAlpha = dot.opacity;
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
  cleanupScrollTrigger();
  window.removeEventListener('resize', buildGrid);
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('click', handleClick);
});

const talkButtonHoverHandler = () => {
  playInteractionSound();
  if (gsap.isTweening(letsTalkButtonRef.value)) return;
  gsap.to(letsTalkButtonRef.value, {
    duration: 0.5,
    ease: 'none',
    scrambleText: {
      text: '{original}',
      chars: '0123456789!@#$%^&*()-_=+[]{};:<>/?,.',
      tweenLength: false,
    },
  });
};
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
    <a
      ref="letsTalkButtonRef"
      href="/"
      class="lets-talk__link"
      @mouseenter="talkButtonHoverHandler"
      @focus="talkButtonHoverHandler"
    >
      {{ text }}
    </a>
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
