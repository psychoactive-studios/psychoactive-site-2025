<script setup>
/**
 * TadpoleBackground — ambient bioluminescent tadpoles drifting through
 * a noise-driven flow field behind the Design Audit UI.
 *
 * Design intent:
 *  - Brand-true: Psychoactive = Digital Amphibians. Tadpoles + a dream-
 *    pond mood tie the audit experience to the core metaphor.
 *  - Never compete with the audit result. Fixed, behind-everything,
 *    pointer-events: none, dims when the score lands so the card and
 *    full report stay visually clean.
 *  - State-reactive. The flock's mood shifts with the audit: cool drift
 *    in idle, animated swim-in during the audit, score-coloured mood
 *    at teaser, gentle dispersal when the full report unlocks.
 *  - Cursor creates currents, not repulsion. A radial swirl is added to
 *    the base flow field in a neighbourhood of the cursor. Tadpoles ride
 *    the current rather than dodging the mouse.
 *
 * Performance:
 *  - Canvas 2D with additive blend for cheap bioluminescence.
 *  - simplex-noise (already a project dep) for the base flow field.
 *  - DPR-capped at 2 so Retina doesn't tank low-end machines.
 *  - Particle count scales with viewport width; mobile gets fewer.
 *  - Lazy boot: canvas + RAF loop only spin up once the component mounts.
 *    On unmount we release the RAF, listeners, and canvas ref.
 *  - prefers-reduced-motion: we render static tadpoles (no motion, no
 *    RAF loop) so users on reduced-motion still get the brand cue
 *    without the animation.
 */

import { createNoise3D } from 'simplex-noise';

const props = defineProps({
  // Current audit state — drives mood + spawn/despawn logic.
  // 'idle' | 'auditing' | 'teaser' | 'submitting' | 'unlocked' | 'error'
  state: {
    type: String,
    default: 'idle',
  },
  // Overall audit score 0-100, or null if not yet known.
  score: {
    type: Number,
    default: null,
  },
});

const canvasRef = ref(null);
const reduceMotion = ref(false);

// ─────────────────────────────────────────────────────────────
// Palette — bioluminescent set. Additive blending on #101012 gives
// each tadpole a glowing feel without needing real shaders.
// ─────────────────────────────────────────────────────────────
const PALETTES = {
  // Cool dream-pond default: cyans + violets + a splash of teal green.
  cool: [
    { h: 185, s: 100, l: 60 },  // cyan
    { h: 200, s: 100, l: 65 },  // electric blue
    { h: 270, s: 85,  l: 65 },  // violet
    { h: 290, s: 90,  l: 70 },  // magenta-violet
    { h: 160, s: 95,  l: 60 },  // aqua green
  ],
  // High-score state — pushes lighter, brighter, more harmonious.
  high: [
    { h: 175, s: 100, l: 70 },
    { h: 190, s: 100, l: 75 },
    { h: 150, s: 100, l: 70 },
    { h: 280, s: 100, l: 80 },
  ],
  // Low-score state — warmer, slightly anxious.
  low: [
    { h: 340, s: 95,  l: 62 },  // hot pink
    { h: 15,  s: 100, l: 65 },  // coral
    { h: 295, s: 90,  l: 60 },  // magenta
    { h: 265, s: 80,  l: 55 },  // deep purple
  ],
};

function paletteForState(state, score) {
  if (state === 'teaser' || state === 'submitting' || state === 'unlocked') {
    if (typeof score === 'number') {
      if (score >= 75) return PALETTES.high;
      if (score <= 45) return PALETTES.low;
    }
  }
  return PALETTES.cool;
}

// Scaled speed by state — visually communicates what's happening.
function speedForState(state, score) {
  switch (state) {
    case 'idle': return 0.6;      // slow ambient drift
    case 'auditing': return 1.0;  // purposeful swimming
    case 'teaser':
    case 'submitting': {
      // Low score = more urgent, high score = calmer.
      if (typeof score === 'number') {
        if (score <= 45) return 1.3;
        if (score >= 75) return 0.7;
      }
      return 0.9;
    }
    case 'unlocked': return 0.5;  // dispersing, softening
    case 'error': return 1.4;     // scattered
    default: return 0.8;
  }
}

// How visible the flock is — drops post-score so the card/report stay
// visually clean, drops further when the report unlocks.
function alphaForState(state) {
  switch (state) {
    case 'idle': return 0.55;
    case 'auditing': return 1.0;
    case 'teaser': return 0.5;
    case 'submitting': return 0.45;
    case 'unlocked': return 0.25;
    case 'error': return 0.7;
    default: return 0.6;
  }
}

// ─────────────────────────────────────────────────────────────
// Tadpole — a spine of chained points that follow the head with
// spring-like lag. Head is an ellipse; tail tapers to zero along the
// chain. Tail undulation comes from a sine wave added perpendicular to
// the body direction, phase-offset per tadpole.
// ─────────────────────────────────────────────────────────────
const SEGMENTS = 14;     // spine segment count — smooth tail curve
const SEG_SPACING = 4.2; // px between segments (scaled by size)

function makeTadpole(w, h, paletteEntry, opts = {}) {
  const size = 0.75 + Math.random() * 0.8; // 0.75x – 1.55x
  const side = Math.floor(Math.random() * 4); // 0=top,1=right,2=bottom,3=left
  let x = Math.random() * w;
  let y = Math.random() * h;
  if (opts.offscreen) {
    const margin = 80 + Math.random() * 120;
    if (side === 0) y = -margin;
    else if (side === 1) x = w + margin;
    else if (side === 2) y = h + margin;
    else x = -margin;
  }

  const segs = [];
  for (let i = 0; i < SEGMENTS; i++) {
    segs.push({ x, y });
  }

  return {
    x,
    y,
    vx: 0,
    vy: 0,
    size,
    phase: Math.random() * Math.PI * 2,
    wavePhase: Math.random() * Math.PI * 2,
    segs,
    hue: paletteEntry.h + (Math.random() - 0.5) * 14, // slight per-tadpole variance
    sat: paletteEntry.s,
    lit: paletteEntry.l,
    life: 0, // frames alive — lets us fade in
  };
}

// ─────────────────────────────────────────────────────────────
// Flow field — simplex noise at two scales (coarse direction + fine
// turbulence) mixed for a more organic result than a single-scale
// field. Cursor injects a tangential swirl in a radius — looks like
// cursor disturbance in water rather than direct repulsion.
// ─────────────────────────────────────────────────────────────
const noise3D = createNoise3D();

const COARSE_SCALE = 0.0015;
const FINE_SCALE = 0.0060;
const CURSOR_INFLUENCE_RADIUS = 220;
const CURSOR_INFLUENCE_STRENGTH = 2.4;

function sampleFlow(x, y, t, cursor) {
  const a = noise3D(x * COARSE_SCALE, y * COARSE_SCALE, t * 0.00018);
  const b = noise3D(x * FINE_SCALE, y * FINE_SCALE, t * 0.00045);
  const angle = (a * 0.8 + b * 0.2) * Math.PI * 2;
  let vx = Math.cos(angle);
  let vy = Math.sin(angle);

  if (cursor.active) {
    const dx = x - cursor.x;
    const dy = y - cursor.y;
    const d2 = dx * dx + dy * dy;
    const r2 = CURSOR_INFLUENCE_RADIUS * CURSOR_INFLUENCE_RADIUS;
    if (d2 < r2 && d2 > 0.001) {
      const d = Math.sqrt(d2);
      const falloff = 1 - d / CURSOR_INFLUENCE_RADIUS;
      const swirl = falloff * falloff * CURSOR_INFLUENCE_STRENGTH;
      // Tangent (perpendicular to radial) — creates a gentle swirl
      // around the cursor rather than shoving things away.
      vx += (-dy / d) * swirl;
      vy += (dx / d) * swirl;
    }
  }

  // Normalise.
  const mag = Math.hypot(vx, vy) || 1;
  return { x: vx / mag, y: vy / mag };
}

// ─────────────────────────────────────────────────────────────
// Animation loop
// ─────────────────────────────────────────────────────────────
let ctx = null;
let raf = null;
let tadpoles = [];
let cursor = { x: 0, y: 0, active: false };
let width = 0;
let height = 0;
let dpr = 1;
let t0 = 0;
let lastT = 0;
let currentAlpha = 0;   // eased toward target alpha
let currentSpeed = 0.8; // eased toward target speed
let visible = true;

// Target count per viewport. Mobile reduces for perf.
// Idle state has zero tadpoles — they appear when the audit starts,
// swimming in from off-screen to visually mark "something's happening".
function targetCount() {
  if (!width) return 0;
  if (props.state === 'idle') return 0;
  if (width < 640) return 5;
  if (width < 1024) return 9;
  if (width < 1600) return 14;
  return 18;
}

function resize() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function onPointerMove(e) {
  cursor.x = e.clientX;
  cursor.y = e.clientY;
  cursor.active = true;
}

function onPointerLeave() {
  cursor.active = false;
}

function onVisibilityChange() {
  visible = !document.hidden;
  if (visible && raf == null && !reduceMotion.value) {
    lastT = performance.now();
    raf = requestAnimationFrame(step);
  }
}

function ensurePopulation() {
  const target = targetCount();
  const palette = paletteForState(props.state, props.score);

  // Spawn missing tadpoles off-screen so they swim in naturally.
  while (tadpoles.length < target) {
    const p = palette[tadpoles.length % palette.length];
    tadpoles.push(
      makeTadpole(width, height, p, { offscreen: true }),
    );
  }

  // Trim logic. Usually only fires on viewport shrink. Special case:
  // when returning to idle (target = 0), we don't slice immediately —
  // we let the dispersing bias carry each tadpole off-screen first,
  // then remove it. That way the user sees them swim away rather than
  // blink out.
  if (target === 0) {
    const M = 220;
    tadpoles = tadpoles.filter(
      (p) => p.x > -M && p.x < width + M && p.y > -M && p.y < height + M,
    );
  } else if (tadpoles.length > target) {
    tadpoles.length = target;
  }

  // Re-tint existing tadpoles on state change (eased via per-frame lerp
  // elsewhere would be nicer, but a snap is acceptable here — palette
  // shifts are rare and happen with other visual transitions).
  for (let i = 0; i < tadpoles.length; i++) {
    const p = palette[i % palette.length];
    tadpoles[i].hue += (p.h - tadpoles[i].hue) * 0.02;
    tadpoles[i].sat += (p.s - tadpoles[i].sat) * 0.02;
    tadpoles[i].lit += (p.l - tadpoles[i].lit) * 0.02;
  }
}

function step(now) {
  if (!ctx) return;
  if (!visible) {
    raf = null;
    return;
  }

  const dt = Math.min(32, now - lastT) || 16;
  lastT = now;
  const t = now - t0;

  ensurePopulation();

  // Ease global alpha + speed toward the state's targets.
  const targetAlpha = alphaForState(props.state);
  const targetSpeed = speedForState(props.state, props.score);
  currentAlpha += (targetAlpha - currentAlpha) * 0.04;
  currentSpeed += (targetSpeed - currentSpeed) * 0.03;

  // Dispersing — tadpoles drift outward to clear the screen. Triggered
  // when the user unlocks the full report, or returns to idle with
  // existing tadpoles on screen.
  const dispersing = props.state === 'unlocked' || props.state === 'idle';

  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'lighter';

  const baseSpeed = 0.9; // px / frame @ speed 1
  for (let i = 0; i < tadpoles.length; i++) {
    const p = tadpoles[i];
    p.life += 1;

    const flow = sampleFlow(p.x, p.y, t, cursor);
    const spd = baseSpeed * currentSpeed;

    // Dispersal bias toward nearest edge.
    let dvx = flow.x;
    let dvy = flow.y;
    if (dispersing) {
      const cx = width / 2;
      const cy = height / 2;
      const dx = p.x - cx;
      const dy = p.y - cy;
      const mag = Math.hypot(dx, dy) || 1;
      dvx += (dx / mag) * 0.5;
      dvy += (dy / mag) * 0.5;
      const n = Math.hypot(dvx, dvy) || 1;
      dvx /= n;
      dvy /= n;
    }

    p.vx += (dvx - p.vx) * 0.08;
    p.vy += (dvy - p.vy) * 0.08;

    p.x += p.vx * spd;
    p.y += p.vy * spd;

    // Screen wrap with margin so tadpoles don't pop at edges.
    // Exception: when heading back to idle we WANT tadpoles to exit
    // and be culled, so wrap is disabled during idle-dispersal.
    if (props.state !== 'idle') {
      const M = 120;
      if (p.x < -M) p.x = width + M;
      if (p.x > width + M) p.x = -M;
      if (p.y < -M) p.y = height + M;
      if (p.y > height + M) p.y = -M;
    }

    // Advance spine: each segment follows the previous with spring lag.
    const prev = { x: p.x, y: p.y };
    for (let s = 0; s < p.segs.length; s++) {
      const seg = p.segs[s];
      const targetX = prev.x;
      const targetY = prev.y;
      const dx = targetX - seg.x;
      const dy = targetY - seg.y;
      const d = Math.hypot(dx, dy) || 1;
      const spacing = SEG_SPACING * p.size;
      if (d > spacing) {
        const k = (d - spacing) / d;
        seg.x += dx * k;
        seg.y += dy * k;
      }
      prev.x = seg.x;
      prev.y = seg.y;
    }

    drawTadpole(p, t);
  }

  raf = requestAnimationFrame(step);
}

// ─────────────────────────────────────────────────────────────
// Draw one tadpole — head + tapered body with wavy undulation.
// ─────────────────────────────────────────────────────────────
function drawTadpole(p, t) {
  // Fade in for new spawns so they don't snap into existence.
  const lifeAlpha = Math.min(1, p.life / 60);
  const a = currentAlpha * lifeAlpha;
  if (a < 0.005) return;

  const { segs, hue, sat, lit, size, wavePhase } = p;

  // Build the body outline. Each segment gets a perpendicular pair of
  // points — one on each side of the spine — to form the ribbon.
  const headR = 6.5 * size;
  const N = segs.length;

  // Direction per segment — from this seg to the next.
  const dirs = [];
  for (let i = 0; i < N; i++) {
    const cur = segs[i];
    const nxt = i < N - 1 ? segs[i + 1] : cur;
    dirs.push({ x: nxt.x - cur.x, y: nxt.y - cur.y });
  }

  // Head direction — from tadpole head toward first segment.
  const headDir = {
    x: p.x - segs[0].x,
    y: p.y - segs[0].y,
  };
  const headMag = Math.hypot(headDir.x, headDir.y) || 1;
  headDir.x /= headMag;
  headDir.y /= headMag;

  // ── Body ribbon ──
  ctx.beginPath();

  // Walk down the right side from head to tail.
  for (let i = 0; i < N; i++) {
    const d = dirs[i];
    const m = Math.hypot(d.x, d.y) || 1;
    const nx = -d.y / m;
    const ny = d.x / m;

    // Tail widths taper to zero; undulation amplifies toward tail.
    const taper = 1 - i / (N - 1);
    const w = headR * 0.55 * taper;
    // Side-to-side wave, phase shift based on tadpole + position down the spine.
    const wave = Math.sin(t * 0.006 + wavePhase + i * 0.55) * (i / N) * 4.5;

    const ox = nx * (w + wave);
    const oy = ny * (w + wave);

    const x = segs[i].x + ox;
    const y = segs[i].y + oy;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  // Walk back up the left side from tail to head.
  for (let i = N - 1; i >= 0; i--) {
    const d = dirs[i];
    const m = Math.hypot(d.x, d.y) || 1;
    const nx = -d.y / m;
    const ny = d.x / m;
    const taper = 1 - i / (N - 1);
    const w = headR * 0.55 * taper;
    const wave = Math.sin(t * 0.006 + wavePhase + i * 0.55) * (i / N) * 4.5;
    const ox = -nx * (w - wave);
    const oy = -ny * (w - wave);
    ctx.lineTo(segs[i].x + ox, segs[i].y + oy);
  }

  ctx.closePath();

  // Soft-edged fill for the body: radial-ish gradient using two passes.
  // Inner translucent fill + blurred shadow = cheap bioluminescence.
  const bodyInner = `hsla(${hue}, ${sat}%, ${lit}%, ${0.32 * a})`;
  const bodyGlow = `hsla(${hue}, ${sat}%, ${Math.min(90, lit + 15)}%, ${0.6 * a})`;

  ctx.shadowColor = bodyGlow;
  ctx.shadowBlur = 18 * size;
  ctx.fillStyle = bodyInner;
  ctx.fill();
  ctx.shadowBlur = 0;

  // ── Head ──
  // Slight elongation in direction of travel — gives a more tadpole-
  // like teardrop silhouette than a pure circle.
  ctx.save();
  ctx.translate(p.x, p.y);
  const heading = Math.atan2(headDir.y, headDir.x);
  ctx.rotate(heading);
  ctx.beginPath();
  ctx.ellipse(0, 0, headR * 1.05, headR * 0.9, 0, 0, Math.PI * 2);
  const headGrad = ctx.createRadialGradient(0, 0, headR * 0.15, 0, 0, headR * 1.2);
  headGrad.addColorStop(0, `hsla(${hue}, ${sat}%, ${Math.min(95, lit + 25)}%, ${0.95 * a})`);
  headGrad.addColorStop(0.6, `hsla(${hue}, ${sat}%, ${lit}%, ${0.55 * a})`);
  headGrad.addColorStop(1, `hsla(${hue}, ${sat}%, ${lit}%, 0)`);
  ctx.fillStyle = headGrad;
  ctx.shadowColor = `hsla(${hue}, ${sat}%, ${Math.min(90, lit + 15)}%, ${0.7 * a})`;
  ctx.shadowBlur = 22 * size;
  ctx.fill();
  ctx.restore();
  ctx.shadowBlur = 0;
}

// Static render for prefers-reduced-motion users — drops a handful of
// stationary tadpoles so the brand beat is still there.
function drawStaticSnapshot() {
  if (!ctx) return;
  // Idle = nothing to show. Keeps reduced-motion users consistent
  // with the animated experience: tadpoles only appear from the
  // audit start onwards.
  if (props.state === 'idle') {
    ctx.clearRect(0, 0, width, height);
    return;
  }
  const palette = paletteForState(props.state, props.score);
  const N = Math.min(targetCount(), 8);
  tadpoles = [];
  for (let i = 0; i < N; i++) {
    const p = palette[i % palette.length];
    tadpoles.push(makeTadpole(width, height, p, { offscreen: false }));
  }
  currentAlpha = alphaForState(props.state) * 0.7;
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'lighter';
  for (const p of tadpoles) {
    // Snap spine tight so they look settled.
    for (let s = 0; s < p.segs.length; s++) {
      p.segs[s].x = p.x - (s + 1) * SEG_SPACING * p.size;
      p.segs[s].y = p.y;
    }
    drawTadpole(p, 0);
  }
}

// Watch state/score changes so ensurePopulation re-tints immediately on
// the next frame (no render-gap flicker).
watch(
  () => [props.state, props.score],
  () => {
    if (reduceMotion.value) drawStaticSnapshot();
  },
);

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  // Respect the OS-level reduced motion preference.
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  reduceMotion.value = mq.matches;

  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);

  if (reduceMotion.value) {
    drawStaticSnapshot();
    return;
  }

  t0 = performance.now();
  lastT = t0;
  raf = requestAnimationFrame(step);
});

onUnmounted(() => {
  if (raf) cancelAnimationFrame(raf);
  raf = null;
  window.removeEventListener('resize', resize);
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerleave', onPointerLeave);
  document.removeEventListener('visibilitychange', onVisibilityChange);
  ctx = null;
  tadpoles = [];
});
</script>

<template>
  <!--
    Fixed behind all content. pointer-events: none lets the cursor
    reach the actual UI while still being tracked via window-level
    pointermove. aria-hidden because it's pure decoration.
  -->
  <canvas
    ref="canvasRef"
    class="tadpole-background"
    aria-hidden="true"
  />
</template>

<style scoped lang="scss">
.tadpole-background {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 0;
  // The audit page sits on #101012; this canvas renders additive colour
  // on top of the page background, so no background-color here.
  mix-blend-mode: normal;
}
</style>
