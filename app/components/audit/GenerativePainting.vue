<script setup>
/**
 * GenerativePainting — full-screen generative art that paints itself
 * across the Design Audit's ~40s run, seeded deterministically by the
 * audited URL. The same URL always produces the same painting; every
 * URL produces a distinct one.
 *
 * Design intent (world-class, not wallpaper):
 *  - Disciplined palette. A single hue family + one accent, not rainbow.
 *    Session 2 will replace this with dominant colours extracted from
 *    the audited site itself.
 *  - Layered composition. Four passes build the piece: a diffuse wash,
 *    a mid-weight flowing layer, sharper accent strokes, and micro
 *    detail at the end. Each pass has a distinct texture budget so the
 *    painting reads as depth, not noise.
 *  - Progressive reveal. Strokes appear over the full audit window so
 *    the user watches the piece emerge. Cache-hit audits (<10s) burst
 *    the remaining strokes at teaser transition so the snapshot still
 *    looks complete.
 *  - Subtle cursor agency. The cursor nudges the flow field locally
 *    (tangential swirl, like disturbing ink in water) and click spawns
 *    a localised bloom of fresh strokes. Never jarring.
 *  - Snapshot-ready. On audit completion, `captureSnapshot()` returns a
 *    data URL for embedding next to the score card + in the OG image.
 *
 * Performance:
 *  - Finished strokes blit to an offscreen canvas and are forgotten, so
 *    we only re-draw in-progress work each frame.
 *  - DPR capped at 2.
 *  - prefers-reduced-motion renders a finished painting instantly,
 *    no RAF loop.
 */

import { createNoise2D } from 'simplex-noise';

const props = defineProps({
  // Audit state — painting only runs during 'auditing'. On transition
  // to 'teaser' the remaining strokes burst so the snapshot looks
  // complete even for short (cached) audits.
  state: {
    type: String,
    default: 'idle',
  },
  // URL being audited — used as the deterministic seed.
  url: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['snapshot']);

const canvasRef = ref(null);
let ctx = null;
// Offscreen "archive" canvas — completed strokes blit here so the live
// canvas only renders in-progress work plus a single copy of the archive.
let archiveCanvas = null;
let archiveCtx = null;

let raf = null;
let width = 0;
let height = 0;
let dpr = 1;

// Runtime state
let strokes = [];           // in-progress strokes
let pendingSpawns = [];     // queued stroke descriptors waiting to spawn
let startTime = 0;
let lastT = 0;
let noise2D = null;
let palette = null;
let params = null;          // composition-level parameters derived from seed
let cursor = { x: 0, y: 0, active: false, pressed: false };
let painted = false;        // true once we've emitted the snapshot
let running = false;
let reduceMotion = false;

// ──────────────────────────────────────────────────────────────
// Deterministic PRNG from URL string → seeded noise + palette.
// ──────────────────────────────────────────────────────────────
function hashString(s) {
  // FNV-1a, then folded to 32-bit unsigned.
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Palette: disciplined, dark-bg friendly. One hue family + one accent
// that sits across the wheel. Tones favour the lighter half so strokes
// read as ink/paint on the #101012 page background.
function derivePalette(rng) {
  const baseHue = Math.floor(rng() * 360);
  const accentHue = (baseHue + 150 + Math.floor(rng() * 60)) % 360;
  // Saturation kept low-ish so the painting reads as muted + premium.
  const baseSat = 6 + Math.floor(rng() * 10);
  const accentSat = 60 + Math.floor(rng() * 25);
  return {
    baseHue,
    accentHue,
    wash: `hsla(${baseHue}, ${baseSat}%, 85%, 0.06)`,
    mid1: `hsla(${baseHue}, ${baseSat}%, 80%, 0.45)`,
    mid2: `hsla(${baseHue}, ${Math.max(4, baseSat - 2)}%, 68%, 0.55)`,
    fine: `hsla(${baseHue}, ${baseSat}%, 92%, 0.75)`,
    accent: `hsla(${accentHue}, ${accentSat}%, 62%, 0.7)`,
    accentFaint: `hsla(${accentHue}, ${accentSat}%, 62%, 0.18)`,
  };
}

// Composition-level parameters. Same seed ⇒ same painting.
function deriveParams(rng) {
  return {
    // Flow-field scale — smaller = broader arcs, bigger = tighter curls.
    flowScaleA: 0.0018 + rng() * 0.0012,
    flowScaleB: 0.0055 + rng() * 0.0020,
    // Relative stroke counts per pass (total scales with viewport).
    ratioWash: 0.14 + rng() * 0.06,
    ratioMid: 0.46 + rng() * 0.08,
    ratioAccent: 0.22 + rng() * 0.06,
    // (Detail pass takes the rest.)
    // Focal point — strokes concentrate here for composition.
    focal: {
      x: 0.35 + rng() * 0.30,
      y: 0.35 + rng() * 0.30,
    },
    focalStrength: 0.15 + rng() * 0.20,
    // Overall feel — slight bias toward horizontal or vertical flow.
    biasAngle: rng() * Math.PI * 2,
    biasStrength: 0.10 + rng() * 0.25,
  };
}

function totalStrokeCount() {
  // Scales with viewport so large screens don't feel sparse.
  const base = Math.sqrt(width * height) * 0.22;
  return Math.max(80, Math.round(base));
}

// ──────────────────────────────────────────────────────────────
// Flow field — two-scale noise + cursor-swirl + focal pull + global
// bias. The cursor swirl is tangential (rotates around the cursor) so
// interaction reads as "disturbance", not "push".
// ──────────────────────────────────────────────────────────────
function sampleFlow(x, y, phase) {
  const a = noise2D(x * params.flowScaleA, y * params.flowScaleA + phase * 0.0005);
  const b = noise2D(x * params.flowScaleB + 100, y * params.flowScaleB + phase * 0.001);
  let angle = (a * 0.75 + b * 0.25) * Math.PI * 2;

  // Global directional bias gives each painting a personality.
  let vx = Math.cos(angle) + Math.cos(params.biasAngle) * params.biasStrength;
  let vy = Math.sin(angle) + Math.sin(params.biasAngle) * params.biasStrength;

  // Focal pull — strokes drift toward the painting's focal point.
  const fx = params.focal.x * width;
  const fy = params.focal.y * height;
  const dx = fx - x;
  const dy = fy - y;
  const d = Math.hypot(dx, dy) || 1;
  vx += (dx / d) * params.focalStrength * 0.15;
  vy += (dy / d) * params.focalStrength * 0.15;

  // Cursor tangential swirl.
  if (cursor.active) {
    const cdx = x - cursor.x;
    const cdy = y - cursor.y;
    const cd2 = cdx * cdx + cdy * cdy;
    const R = 220;
    if (cd2 < R * R && cd2 > 1) {
      const cd = Math.sqrt(cd2);
      const falloff = 1 - cd / R;
      const strength = falloff * falloff * 2.2;
      vx += (-cdy / cd) * strength;
      vy += (cdx / cd) * strength;
    }
  }

  const mag = Math.hypot(vx, vy) || 1;
  return { x: vx / mag, y: vy / mag };
}

// ──────────────────────────────────────────────────────────────
// Stroke spawning. Four passes, each with distinct character.
// Spawns are queued across the audit window; the loop pops them in
// order so we get visible progression (wash first, detail last).
// ──────────────────────────────────────────────────────────────
function buildSpawnPlan(rng) {
  const total = totalStrokeCount();
  const counts = {
    wash: Math.round(total * params.ratioWash),
    mid: Math.round(total * params.ratioMid),
    accent: Math.round(total * params.ratioAccent),
  };
  counts.detail = Math.max(0, total - counts.wash - counts.mid - counts.accent);

  const plan = [];

  for (let i = 0; i < counts.wash; i++) {
    plan.push({
      layer: 'wash',
      startRatio: rng() * 0.12, // front-loaded
    });
  }
  for (let i = 0; i < counts.mid; i++) {
    plan.push({
      layer: 'mid',
      startRatio: 0.08 + rng() * 0.50,
    });
  }
  for (let i = 0; i < counts.accent; i++) {
    plan.push({
      layer: 'accent',
      startRatio: 0.35 + rng() * 0.45,
    });
  }
  for (let i = 0; i < counts.detail; i++) {
    plan.push({
      layer: 'detail',
      startRatio: 0.70 + rng() * 0.30,
    });
  }

  plan.sort((a, b) => a.startRatio - b.startRatio);
  return plan;
}

function makeStroke(layer, rng) {
  // Seed each stroke with a local rng burst so per-stroke variation
  // doesn't consume the main deterministic stream.
  const sx = rng() * width;
  const sy = rng() * height;

  switch (layer) {
    case 'wash':
      return {
        x: sx, y: sy,
        color: palette.wash,
        width: 40 + rng() * 55,
        segments: 0, maxSegments: 80 + Math.floor(rng() * 80),
        stepSize: 3.0,
        alpha: 1,
        layer,
        widthMul: 1 + rng() * 0.5,
        wobble: rng() * 0.4,
      };
    case 'mid': {
      const color = rng() < 0.6 ? palette.mid1 : palette.mid2;
      return {
        x: sx, y: sy,
        color,
        width: 2.5 + rng() * 6,
        segments: 0, maxSegments: 60 + Math.floor(rng() * 140),
        stepSize: 2.2,
        alpha: 1,
        layer,
        widthMul: 1,
        wobble: rng() * 0.2,
      };
    }
    case 'accent': {
      const isAccent = rng() < 0.35;
      return {
        x: sx, y: sy,
        color: isAccent ? palette.accent : palette.fine,
        width: 0.8 + rng() * 1.6,
        segments: 0, maxSegments: 40 + Math.floor(rng() * 120),
        stepSize: 1.8,
        alpha: 1,
        layer,
        widthMul: 1,
        wobble: rng() * 0.15,
      };
    }
    case 'detail':
    default: {
      // Micro accents — short sharp flecks, occasional bloom.
      const isBloom = rng() < 0.18;
      return {
        x: sx, y: sy,
        color: isBloom ? palette.accent : palette.fine,
        width: isBloom ? 4 + rng() * 6 : 0.4 + rng() * 0.8,
        segments: 0, maxSegments: isBloom ? 1 : 14 + Math.floor(rng() * 20),
        stepSize: 1.2,
        alpha: 1,
        layer,
        widthMul: 1,
        isBloom,
        wobble: rng() * 0.1,
      };
    }
  }
}

// Draw one step of a stroke into ctx. Returns true if stroke completed.
function stepStroke(targetCtx, s, phase) {
  if (s.isBloom) {
    // Single blooming circle.
    targetCtx.fillStyle = s.color;
    targetCtx.beginPath();
    targetCtx.arc(s.x, s.y, s.width, 0, Math.PI * 2);
    targetCtx.fill();
    s.segments = s.maxSegments;
    return true;
  }

  const flow = sampleFlow(s.x, s.y, phase);
  // Slight wobble so strokes feel handmade, not perfectly field-aligned.
  const wobbleAngle = Math.sin(phase * 0.003 + s.x * 0.01) * s.wobble;
  const cos = Math.cos(wobbleAngle);
  const sin = Math.sin(wobbleAngle);
  const dx = flow.x * cos - flow.y * sin;
  const dy = flow.x * sin + flow.y * cos;

  const nx = s.x + dx * s.stepSize;
  const ny = s.y + dy * s.stepSize;

  // Taper width along length for a more organic line.
  const progress = s.segments / s.maxSegments;
  const taper = Math.sin(progress * Math.PI); // fat in the middle
  const w = s.width * (0.35 + taper * 0.65) * s.widthMul;

  targetCtx.strokeStyle = s.color;
  targetCtx.lineWidth = w;
  targetCtx.lineCap = 'round';
  targetCtx.beginPath();
  targetCtx.moveTo(s.x, s.y);
  targetCtx.lineTo(nx, ny);
  targetCtx.stroke();

  s.x = nx;
  s.y = ny;
  s.segments += 1;

  // Kill if out of bounds or at max length.
  const oob = nx < -40 || nx > width + 40 || ny < -40 || ny > height + 40;
  return s.segments >= s.maxSegments || oob;
}

// ──────────────────────────────────────────────────────────────
// Lifecycle / loop.
// ──────────────────────────────────────────────────────────────
function initialiseSeed() {
  const seed = hashString(props.url || 'psychoactive');
  const rng = mulberry32(seed);
  noise2D = createNoise2D(rng);
  palette = derivePalette(rng);
  params = deriveParams(rng);

  // Separate rng stream for spawns so cursor interactions (which add
  // extra strokes) don't desync the deterministic core.
  const spawnRng = mulberry32(seed ^ 0xabcdef);
  pendingSpawns = buildSpawnPlan(spawnRng);
  // Store an rng for use during spawning.
  spawnRng._rng = mulberry32(seed ^ 0x12345);
  pendingSpawns.rng = mulberry32(seed ^ 0x55aaff);
}

function resize() {
  const canvas = canvasRef.value;
  if (!canvas || !ctx) return;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  archiveCanvas.width = Math.round(width * dpr);
  archiveCanvas.height = Math.round(height * dpr);
  archiveCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function onPointerMove(e) {
  cursor.x = e.clientX;
  cursor.y = e.clientY;
  cursor.active = true;
}

function onPointerLeave() {
  cursor.active = false;
  cursor.pressed = false;
}

function onPointerDown() {
  cursor.pressed = true;
  // Click bloom: inject a localised burst of strokes at the cursor.
  if (!pendingSpawns.rng) return;
  const rng = pendingSpawns.rng;
  const burst = 8 + Math.floor(rng() * 8);
  for (let i = 0; i < burst; i++) {
    const angle = rng() * Math.PI * 2;
    const r = rng() * 40;
    const s = makeStroke('accent', rng);
    s.x = cursor.x + Math.cos(angle) * r;
    s.y = cursor.y + Math.sin(angle) * r;
    s.maxSegments = 20 + Math.floor(rng() * 30);
    strokes.push(s);
  }
}

function onPointerUp() {
  cursor.pressed = false;
}

function step(now) {
  if (!ctx || !running) return;

  const dt = Math.min(64, now - lastT) || 16;
  lastT = now;
  const t = now - startTime;
  // Normalised audit progress assumed to target ~42s; cap at 1.
  const NORMAL_DURATION = 42000;
  const progress = Math.min(1, t / NORMAL_DURATION);

  const rng = pendingSpawns.rng;

  // Spawn any strokes whose startRatio has been reached.
  while (pendingSpawns.length && pendingSpawns[0].startRatio <= progress) {
    const spec = pendingSpawns.shift();
    strokes.push(makeStroke(spec.layer, rng));
  }

  // Render: clear live canvas, blit archive, then draw in-progress.
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(archiveCanvas, 0, 0, width, height);

  // Advance each in-progress stroke. Steps-per-frame scales with dt so
  // painting speed is consistent across machines.
  const stepsPerFrame = Math.max(1, Math.round(dt / 16));
  for (let i = strokes.length - 1; i >= 0; i--) {
    const s = strokes[i];
    let done = false;
    for (let k = 0; k < stepsPerFrame && !done; k++) {
      done = stepStroke(ctx, s, t);
    }
    if (done) {
      // Commit stroke's final state to the archive. We replay the last
      // segment once more on the archive so the trailing line is
      // captured — the live ctx already drew it, but the archive needs
      // a copy. Cheapest path: blit the live canvas delta via drawImage
      // of the whole thing would be wasteful; instead we use a cached
      // "second pass" — we draw the just-finished stroke's final segment
      // onto the archive. For simplicity + correctness we blit the
      // whole live canvas onto the archive once done strokes exist this
      // frame, tracked by `didComplete`.
      didCompleteThisFrame = true;
      strokes.splice(i, 1);
    }
  }

  // If any strokes completed, blit the live canvas into the archive so
  // their final trails are permanent. This keeps per-frame cost low
  // (strokes don't need to be re-rendered next frame).
  if (didCompleteThisFrame) {
    archiveCtx.drawImage(canvasRef.value, 0, 0, width, height);
    didCompleteThisFrame = false;
  }

  raf = requestAnimationFrame(step);
}

let didCompleteThisFrame = false;

function startPainting() {
  if (running) return;
  if (!ctx) return;
  initialiseSeed();
  // Wipe both canvases.
  ctx.clearRect(0, 0, width, height);
  archiveCtx.clearRect(0, 0, width, height);
  strokes = [];
  painted = false;
  running = true;
  startTime = performance.now();
  lastT = startTime;
  raf = requestAnimationFrame(step);
}

function stopPainting() {
  running = false;
  if (raf) cancelAnimationFrame(raf);
  raf = null;
}

// Fast-complete any outstanding strokes + pending spawns to a natural-
// looking end. Used when the audit finishes earlier than expected
// (cache hits), so the snapshot isn't a half-painted canvas.
function burstRemaining() {
  if (!ctx) return;
  const rng = pendingSpawns.rng;
  // Materialise all pending spawns as strokes.
  while (pendingSpawns.length) {
    const spec = pendingSpawns.shift();
    strokes.push(makeStroke(spec.layer, rng));
  }
  // Run each stroke to completion on the archive directly.
  const PHASE = performance.now() - startTime + 1;
  for (const s of strokes) {
    let done = false;
    let guard = 0;
    while (!done && guard < 400) {
      done = stepStroke(archiveCtx, s, PHASE + guard * 4);
      guard++;
    }
  }
  strokes = [];
  // Sync live canvas with archive (so the visible frame matches the snapshot).
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(archiveCanvas, 0, 0, width, height);
}

function captureSnapshot() {
  if (!canvasRef.value) return null;
  return canvasRef.value.toDataURL('image/png');
}

// Watch state transitions to run / stop / snapshot.
watch(
  () => props.state,
  (newState, oldState) => {
    if (newState === 'auditing') {
      if (reduceMotion) {
        // Static: initialise seed, paint everything instantly to archive.
        initialiseSeed();
        ctx.clearRect(0, 0, width, height);
        archiveCtx.clearRect(0, 0, width, height);
        burstRemaining();
        return;
      }
      startPainting();
    } else if (oldState === 'auditing' && !painted) {
      // Audit finished (teaser / error / unlocked). Fast-complete + snapshot.
      if (!reduceMotion) burstRemaining();
      stopPainting();
      painted = true;
      const dataUrl = captureSnapshot();
      if (dataUrl) emit('snapshot', dataUrl);
    }
  },
);

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  archiveCanvas = document.createElement('canvas');
  archiveCtx = archiveCanvas.getContext('2d', { alpha: true });

  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  reduceMotion = mq.matches;

  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave, { passive: true });
  window.addEventListener('pointerdown', onPointerDown, { passive: true });
  window.addEventListener('pointerup', onPointerUp, { passive: true });

  // If we mount mid-audit (page reload with ?url=), start immediately.
  if (props.state === 'auditing') {
    if (reduceMotion) {
      initialiseSeed();
      burstRemaining();
    } else {
      startPainting();
    }
  }
});

onUnmounted(() => {
  stopPainting();
  window.removeEventListener('resize', resize);
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerleave', onPointerLeave);
  window.removeEventListener('pointerdown', onPointerDown);
  window.removeEventListener('pointerup', onPointerUp);
  ctx = null;
  archiveCanvas = null;
  archiveCtx = null;
  strokes = [];
  pendingSpawns = [];
});
</script>

<template>
  <!--
    Full-viewport fixed canvas. pointer-events: auto so cursor
    interactions register; the audit UI sits above us via page-level
    z-index, and its own elements capture their own clicks.
    aria-hidden because it's decoration.
  -->
  <canvas
    ref="canvasRef"
    class="generative-painting"
    :data-visible="props.state === 'auditing'"
    aria-hidden="true"
  />
</template>

<style scoped lang="scss">
.generative-painting {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 0;
  opacity: 0;
  transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1);

  // Painting is only visible during the audit itself; fades in/out
  // cleanly either side. The snapshot is captured while it's still on
  // screen at teaser transition, so the thumbnail carries the piece
  // forward into the result view.
  &[data-visible='true'] {
    opacity: 1;
    // Cursor still passes through to the UI behind (UI is z-indexed
    // above us), but the canvas itself picks up pointer events via
    // the window listeners so the swirl still works.
  }
}

@media (prefers-reduced-motion: reduce) {
  .generative-painting {
    transition: none;
  }
}
</style>
