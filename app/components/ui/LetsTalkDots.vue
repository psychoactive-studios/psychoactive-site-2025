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

defineProps({
  mode: {
    type: String,
    default: 'dark', // 'dark' or 'light'
  },
});

// Register GSAP plugins
gsap.registerPlugin(InertiaPlugin, ScrollTrigger);

const { pointerType: _pointerType, x: eventX, y: eventY } = usePointer();
const { scrollSmoother } = useScrollSmoother();

const dotsContainerRef = ref(null);

let dots = [];
let dotCenters = [];
let lastTime = 0;
let lastX = 0;
let lastY = 0;
const lastMousePosition = { x: 0, y: 0 }; // Last known global mouse position
let scrollTriggerInstance = null;

const opacity = { base: 0.1, active: 1 };
const threshold = 150;
const speedThreshold = 150;
const shockRadius = 250;
const shockPower = 5;
const maxSpeed = 5000;
const centerHole = false;

function buildGrid() {
  if (!dotsContainerRef.value) return;

  const container = dotsContainerRef.value;
  container.innerHTML = '';
  dots = [];
  dotCenters = [];

  const style = getComputedStyle(container);
  const dotPx = parseFloat(style.fontSize);
  const gapPx = dotPx * 2;
  const contW = container.clientWidth;
  const contH = container.clientHeight;

  const cols = Math.floor((contW + gapPx) / (dotPx + gapPx));
  const rows = Math.floor((contH + gapPx) / (dotPx + gapPx));
  const total = cols * rows;

  const holeCols = centerHole ? (cols % 2 === 0 ? 4 : 5) : 0;
  const holeRows = centerHole ? (rows % 2 === 0 ? 4 : 5) : 0;
  const startCol = (cols - holeCols) / 2;
  const startRow = (rows - holeRows) / 2;

  for (let i = 0; i < total; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const isHole =
      centerHole &&
      row >= startRow &&
      row < startRow + holeRows &&
      col >= startCol &&
      col < startCol + holeCols;

    const d = document.createElement('div');
    d.classList.add('dot');

    if (isHole) {
      d.style.visibility = 'hidden';
      d._isHole = true;
    } else {
      gsap.set(d, { x: 0, y: 0, opacity: opacity.base });
      d._inertiaApplied = false;
    }

    container.appendChild(d);
    dots.push(d);
  }

  gsap.ticker.add(() => {
    dotCenters = dots
      .filter((d) => !d._isHole)
      .map((d) => {
        const r = d.getBoundingClientRect();
        // Use current animated scroll position
        const currentScrollY = scrollSmoother.value
          ? scrollSmoother.value.scrollTop()
          : window.scrollY;
        const currentScrollX = window.scrollX;
        return {
          el: d,
          x: r.left + currentScrollX + r.width / 2,
          y: r.top + currentScrollY + r.height / 2,
        };
      });
  }, true);
}

function handleMouseMove() {
  // Get current smooth scroll position
  const currentScrollY = scrollSmoother.value
    ? scrollSmoother.value.scrollTop()
    : window.scrollY;
  const currentScrollX = window.scrollX; // Usually X doesn't animate

  // Convert viewport coordinates to page coordinates using current animated scroll
  const pageX = eventX.value + currentScrollX;
  const pageY = eventY.value + currentScrollY;

  // Store global mouse position
  lastMousePosition.x = pageX;
  lastMousePosition.y = pageY;

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

  dotCenters.forEach(({ el, x, y }) => {
    const dist = Math.hypot(x - pageX, y - pageY);
    const t = Math.max(0, 1 - dist / threshold);
    const opacityValue = gsap.utils.interpolate(
      opacity.base,
      opacity.active,
      t
    );
    gsap.set(el, { opacity: opacityValue });

    if (speed > speedThreshold && dist < threshold && !el._inertiaApplied) {
      el._inertiaApplied = true;
      const pushX = x - pageX + vx * 0.005;
      const pushY = y - pageY + vy * 0.005;

      gsap.to(el, {
        inertia: { x: pushX, y: pushY, resistance: 750 },
        onComplete() {
          gsap.to(el, {
            x: 0,
            y: 0,
            duration: 1.5,
            ease: 'elastic.out(1,0.75)',
          });
          el._inertiaApplied = false;
        },
      });
    }
  });
}

function handleScroll() {
  // Get current smooth scroll position (the animated position, not target)
  const currentScrollY = scrollSmoother.value
    ? scrollSmoother.value.scrollTop()
    : window.scrollY;
  const currentScrollX = window.scrollX;

  // Update lastMousePosition with current pointer position during scroll
  const pageX = eventX.value + currentScrollX;
  const pageY = eventY.value + currentScrollY;

  lastMousePosition.x = pageX;
  lastMousePosition.y = pageY;

  // Update effect during scroll using current mouse position
  dotCenters.forEach(({ el, x, y }) => {
    const dist = Math.hypot(x - pageX, y - pageY);
    const t = Math.max(0, 1 - dist / threshold);
    const opacityValue = gsap.utils.interpolate(
      opacity.base,
      opacity.active,
      t
    );
    gsap.set(el, { opacity: opacityValue });
  });
}

function handleClick(e) {
  dotCenters.forEach(({ el, x, y }) => {
    const dist = Math.hypot(x - e.pageX, y - e.pageY);
    if (dist < shockRadius && !el._inertiaApplied) {
      el._inertiaApplied = true;
      const falloff = Math.max(0, 1 - dist / shockRadius);
      const pushX = (x - e.pageX) * shockPower * falloff;
      const pushY = (y - e.pageY) * shockPower * falloff;

      gsap.to(el, {
        inertia: { x: pushX, y: pushY, resistance: 750 },
        onComplete() {
          gsap.to(el, {
            x: 0,
            y: 0,
            duration: 1.5,
            ease: 'elastic.out(1,0.75)',
          });
          el._inertiaApplied = false;
        },
      });
    }
  });
}

function initScrollTrigger() {
  if (!dotsContainerRef.value) return;

  scrollTriggerInstance = ScrollTrigger.create({
    trigger: dotsContainerRef.value,
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
  // Initialize lastMousePosition with current pointer position
  const currentScrollY = scrollSmoother.value
    ? scrollSmoother.value.scrollTop()
    : window.scrollY;
  const currentScrollX = window.scrollX;
  lastMousePosition.x = eventX.value + currentScrollX;
  lastMousePosition.y = eventY.value + currentScrollY;

  // Initialize ScrollTrigger after a small delay to ensure grid is built
  setTimeout(() => {
    buildGrid();
    initScrollTrigger();
  }, 100);

  window.addEventListener('resize', buildGrid);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('click', handleClick);
});

onUnmounted(() => {
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
      <div ref="dotsContainerRef" class="dots-container" />
    </div>
    <a
      ref="letsTalkButtonRef"
      href="/"
      class="lets-talk__link"
      @mouseenter="talkButtonHoverHandler"
      @focus="talkButtonHoverHandler"
    >
      let's talk
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
  // aspect-ratio: 1.85;
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
    line-height: 1.68; /* 168.75% */
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
    :deep(.dot) {
      background-color: #ffffff;
    }
  }
  &--light {
    .lets-talk__link {
      color: $color-foreground;
      &::before {
        background-color: $color-background;
      }
    }
    :deep(.dot) {
      background-color: $color-background;
    }
  }
}

.dots-wrap {
  width: 100%;
  aspect-ratio: 1.85;
  // height: 100%;
  position: relative;
}

.dots-container {
  grid-column-gap: 2em;
  grid-row-gap: 2em;
  pointer-events: none;
  flex-flow: wrap;
  grid-template-rows: auto;
  grid-template-columns: 1fr;
  grid-auto-columns: 1fr;
  justify-content: center;
  align-items: center;
  display: flex;
  position: absolute;
  inset: 0em;
  font-size: 0.5rem;
}

:deep(.dot) {
  will-change: transform, opacity;
  transform-origin: center;
  background-color: #ffffff;
  border-radius: 50%;
  width: 1em;
  height: 1em;
  position: relative;
  transform: translate3d(0);
}
</style>
