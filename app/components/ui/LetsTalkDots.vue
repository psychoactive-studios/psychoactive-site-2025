<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { gsap } from 'gsap';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

// Register GSAP plugin
gsap.registerPlugin(InertiaPlugin);

const dotsContainerRef = ref(null);

let dots = [];
let dotCenters = [];
let lastTime = 0;
let lastX = 0;
let lastY = 0;

const opacity = { base: 0.2, active: 1 };
const threshold = 150;
const speedThreshold = 50;
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

  requestAnimationFrame(() => {
    dotCenters = dots
      .filter((d) => !d._isHole)
      .map((d) => {
        const r = d.getBoundingClientRect();
        return {
          el: d,
          x: r.left + window.scrollX + r.width / 2,
          y: r.top + window.scrollY + r.height / 2,
        };
      });
  });
}

function handleMouseMove(e) {
  const now = performance.now();
  const dt = now - lastTime || 16;
  const dx = e.pageX - lastX;
  const dy = e.pageY - lastY;
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
  lastX = e.pageX;
  lastY = e.pageY;

  requestAnimationFrame(() => {
    dotCenters.forEach(({ el, x, y }) => {
      const dist = Math.hypot(x - e.pageX, y - e.pageY);
      const t = Math.max(0, 1 - dist / threshold);
      const opacityValue = gsap.utils.interpolate(
        opacity.base,
        opacity.active,
        t
      );
      gsap.set(el, { opacity: opacityValue });

      if (speed > speedThreshold && dist < threshold && !el._inertiaApplied) {
        el._inertiaApplied = true;
        const pushX = x - e.pageX + vx * 0.005;
        const pushY = y - e.pageY + vy * 0.005;

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

onMounted(() => {
  buildGrid();
  window.addEventListener('resize', buildGrid);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('click', handleClick);
});

onUnmounted(() => {
  window.removeEventListener('resize', buildGrid);
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('click', handleClick);
});
</script>

<template>
  <section class="lets-talk">
    <div class="dots-wrap">
      <div ref="dotsContainerRef" class="dots-container" />
    </div>
    <a href="/" class="lets-talk__link"> let's talk </a>
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
    color: currentColor;
    text-decoration: none;
    position: absolute;
    @include flex-center;
    height: 64px;
    background-color: $color-foreground;
    color: $color-background;
    padding: 0 getRem(56);
    border-radius: 32px;
    font-family: 'RoobertMono';
    font-size: 1rem;
    font-style: normal;
    font-weight: 500;
    line-height: 1.68; /* 168.75% */
    text-transform: uppercase;
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
  opacity: 0.2;
  border-radius: 50%;
  width: 1em;
  height: 1em;
  position: relative;
  transform: translate(0);
}
</style>
