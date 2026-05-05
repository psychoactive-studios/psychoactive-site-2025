<script setup>
/**
 * ServicesHero3DSceneV2 — particle scene rebuild.
 *
 * Replaces the original ServicesHero3DScene with a cleaner architecture
 * that supports multiple formations, real spring physics, and a
 * dramatic click explosion. Same external API surface as the original
 * (`setFormation`, `fireRipple`/`fireExplosion`) so Hero.vue can swap
 * back to the old component just by changing one import line.
 *
 * What changed vs the original:
 *  - Particle data is split clearly: `restSphere`, `restGrid`,
 *    `positions` (current), `velocities`. The "rest target" is lerped
 *    between formations; physics drives the rendered position toward it.
 *  - Spring physics is back, properly tuned (k ~ 0.06, damping ~ 0.86)
 *    so morphs feel organic instead of being instantly snapped.
 *  - Sphere->grid particle mapping uses the SphereGeometry's natural
 *    row/col vertex order, so neighbours on the sphere stay neighbours
 *    on the grid — no more chaotic crossover during the morph.
 *  - Noise displacement direction lerps between sphere normal (when
 *    sphere) and +Z (when grid), so the grid wiggles in/out of plane
 *    rather than sideways.
 *  - Click `fireExplosion` injects an initial outward impulse plus a
 *    decaying outward bias for ~1.6s. Particles fly out, slow, then
 *    snap back to formation via the existing springs — gets out of
 *    the modal's way fast, snaps back when the modal closes.
 *  - Camera pivots from rotating-orbit (sphere) to face-on (grid)
 *    based on formation mix. Sphere rotation also damps to 0 in grid.
 */
import { onMounted, onUnmounted, ref, watch } from 'vue';
import * as THREE from 'three';
import gsap from 'gsap';
import { createNoise3D } from 'simplex-noise';
import { useDebounceFn, useEventListener } from '@vueuse/core';

const props = defineProps({
  isPlaying: { type: Boolean, default: true },

  // --- Tunable knobs (live-watched) ---
  // Defaults below are the values Andrew dialled in via /dev/dots —
  // dense centre with edge bleed, near-orthographic grid, no rotation.
  // Number of segments per axis on the source SphereGeometry. Total
  // particle count ≈ (density + 1)² (190 → ~36,500). Higher = denser
  // sphere AND grid; expensive: per-frame work scales linearly.
  // Changing this REBUILDS the geometry (debounced, see watcher).
  particleDensity: { type: Number, default: 124 },
  particleSize:    { type: Number, default: 0.008 },
  particleOpacity: { type: Number, default: 0.82 },
  fogDensity:      { type: Number, default: 0.235 },
  cameraDistance:  { type: Number, default: 4.95 },
  pointsScale:     { type: Number, default: 0.66 },
  // Sphere FOV is the "normal" perspective look. Grid FOV is tiny so
  // the projection is effectively orthographic when viewing the grid
  // — no perspective foreshortening, dots stay the same size across
  // the whole grid. Camera is automatically pulled back to keep the
  // visible area the same size.
  sphereFov:       { type: Number, default: 66 },
  gridFov:         { type: Number, default: 1 },
  // Grid layout —
  //   gridSize   : total span of the grid in world units. Bigger than
  //                the visible viewport = grid bleeds off-screen.
  //   gridSpread : power-curve exponent for spacing.
  //                1.0 = uniform.
  //                2.0 = quadratic, dense middle, sparse edges.
  //                3.0+ = very dense middle, dramatic spread to edges.
  gridSize:        { type: Number, default: 20 },
  gridSpread:      { type: Number, default: 3.05 },
  noiseAmp:        { type: Number, default: 0.67 },
  noiseFreq:       { type: Number, default: 2.05 },
  springConstant:  { type: Number, default: 0.047 },
  damping:         { type: Number, default: 0.56 },
  rotateSpeed:     { type: Number, default: 0 },

  // Sphere jitter — tiny random offset added to each particle's sphere
  // rest position. Breaks up SphereGeometry's visible lat/long ring
  // structure so the sphere reads as scattered particles instead of
  // visible curves/lines (especially at the poles where vertices
  // collapse together).
  sphereJitter:    { type: Number, default: 0.024 },

  // Hover interaction —
  //   'push'    : raycaster-based, particles get pushed in cursor-move
  //               direction (the original interaction).
  //   'attract' : particles within hoverRadius get pulled toward cursor.
  //   'repel'   : particles within hoverRadius get pushed away from cursor.
  //   'vortex'  : particles within hoverRadius swirl tangentially around it.
  //   'part'    : strong radial push, creates a clear hole around cursor.
  //   'none'    : no hover effect.
  hoverMode:       { type: String, default: 'repel' },
  hoverRadius:     { type: Number, default: 5.1 },
  hoverStrength:   { type: Number, default: 0.027 },

  // Click explosion knobs
  explosionDuration:     { type: Number, default: 1.5 },
  explosionInitialBurst: { type: Number, default: 0.08 },
  explosionOutwardBias:  { type: Number, default: 0.18 },
  explosionJitter:       { type: Number, default: 0.40 },
});

const canvasElement = ref(null);

// === Three globals ===
let scene, camera, renderer;
let points, geometry, material;
let animationFrameId = null;
let isLooping = false;
let totalTime = 0;
let frameCount = 0; // diagnostic — exposed via getFrameCount()
const clock = new THREE.Clock();
const simplex = createNoise3D();
let removeResizeListener = null;

// === Per-particle data (allocated in init()) ===
let particleCount = 0;
let positions;     // Float32Array — current rendered position
let restSphere;    // Float32Array — sphere formation target
let restGrid;      // Float32Array — grid formation target
let velocities;    // Float32Array — physics velocity
let colors;        // Float32Array — vertex colours
let gridCols = 0;  // captured at init so we can recompute grid layout
let gridRows = 0;

// === Reusable scratch ===
const _tempColor = new THREE.Color();
const mouse = new THREE.Vector2(-10, -10);
// Cursor projected onto the z=0 plane in world space — used by ALL
// hover modes (push / attract / repel / vortex / part). Tracking the
// world-space cursor position (rather than NDC mouse) means the
// cursor effect works the same regardless of camera FOV / distance.
const _cursorWorld = new THREE.Vector3();
const _cursorPrevWorld = new THREE.Vector3();
const _cursorWorldDelta = new THREE.Vector3();
const _cursorNdc = new THREE.Vector3();
const _cursorRay = new THREE.Vector3();
let cursorActive = false;
let cursorPrevValid = false; // true once we have a previous world pos

// === Palette (carried over from the original) ===
const colorPalette = [
  new THREE.Color('#CC4F8C'),
  new THREE.Color('#E4393C'),
  new THREE.Color('#23CF48'),
  new THREE.Color('#17FFFF'),
  new THREE.Color('#0646FF'),
];

// === Tunable constants ===
// Most of these are now driven by props (so the lab page can tweak
// them live). Anything left as a const is rarely worth touching.
const NOISE_TIME_SPEED = 0.08;
const COLOR_FREQ = 0.4;

// === Formation morph (sphere <-> grid) ===
const formationMixObj = { value: 0 }; // 0 = sphere, 1 = grid
let formationMix = 0;

// === Click explosion ===
// On fire: inject a one-shot outward velocity impulse to every particle,
// plus a sustained outward bias that decays over explosionDuration.
// Springs keep pulling particles back to the formation rest the whole
// time, so once the bias fades they reform naturally.
let explosionStartTime = -1;

function init() {
  if (!canvasElement.value) return;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, props.fogDensity);

  // FOV starts at sphereFov; grid morph drives it toward gridFov. The
  // far plane needs to be generous because we pull the camera way back
  // when collapsing to ortho-like grid view (camera distance can grow
  // 10x+ when gridFov is small).
  camera = new THREE.PerspectiveCamera(
    props.sphereFov,
    canvasElement.value.clientWidth / canvasElement.value.clientHeight,
    0.1,
    2000,
  );
  camera.position.set(0, 0, props.cameraDistance);

  renderer = new THREE.WebGLRenderer({
    canvas: canvasElement.value,
    antialias: true,
    alpha: true,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(
    canvasElement.value.clientWidth,
    canvasElement.value.clientHeight,
    false,
  );
  renderer.setPixelRatio(window.devicePixelRatio);

  // Material is created once here and reused across particle rebuilds.
  // (Geometry/buffers ARE recreated when particleDensity changes — see
  // rebuildParticles below.)
  material = new THREE.PointsMaterial({
    vertexColors: true,
    size: props.particleSize,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: props.particleOpacity,
    sizeAttenuation: true,
  });

  rebuildParticles();

  removeResizeListener = useEventListener(window, 'resize', onWindowResize);
  canvasElement.value.addEventListener('mousemove', onDocumentMouseMove, false);
  canvasElement.value.addEventListener('mouseleave', onDocumentMouseLeave, false);
}

/**
 * Build (or rebuild) the renderable particles at the current
 * `particleDensity`. Allocates fresh per-particle buffers, sources a
 * SphereGeometry to seed the rest positions, applies jitter, computes
 * the grid layout, and swaps the new geometry onto the existing
 * `points` mesh.
 *
 * Called once from init() and again from a (debounced) watcher when
 * `particleDensity` changes. The material is reused — we only swap
 * the geometry — so look-related props keep working without a
 * material rebuild.
 */
function rebuildParticles() {
  if (!scene) return; // not yet initialised

  // Dispose the previous geometry / remove the previous mesh from
  // the scene if there is one.
  if (points) {
    scene.remove(points);
  }
  if (geometry) {
    geometry.dispose();
  }

  const segs = Math.max(8, Math.round(props.particleDensity));
  const sphereGeo = new THREE.SphereGeometry(2, segs, segs);
  const spherePositions = sphereGeo.attributes.position.array;
  particleCount = spherePositions.length / 3;

  positions   = new Float32Array(spherePositions);
  restSphere  = new Float32Array(spherePositions);
  restGrid    = new Float32Array(spherePositions.length);
  velocities  = new Float32Array(spherePositions.length);
  colors      = new Float32Array(spherePositions.length);

  // SphereGeometry vertex order is row-major over (heightSegs+1) lines
  // of latitude × (widthSegs+1) longitudes. We use those same row/col
  // indices to place each particle on a flat grid, so neighbours on
  // the sphere stay neighbours on the grid — radial sweep instead of
  // a tangle of crossing trajectories during the morph.
  gridCols = segs + 1;
  gridRows = segs + 1;

  applySphereJitter();
  computeGridPositions();
  sphereGeo.dispose();

  geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color',    new THREE.BufferAttribute(colors,    3));

  points = new THREE.Points(geometry, material);
  points.scale.setScalar(props.pointsScale);
  scene.add(points);
}

/**
 * Apply random jitter to the sphere rest positions to break up the
 * regular lat/long structure that SphereGeometry produces. We start
 * from the original sphere coords (radius 2) and add a small random
 * offset along each axis. Without this, particles align in visible
 * curves/lines (especially noticeable at the poles).
 *
 * Stored in restSphere so the morph (sphere ↔ grid) carries the
 * jittered sphere → clean grid, which actually looks great in motion.
 */
function applySphereJitter() {
  if (!restSphere || !positions) return;
  const widthSegs = gridCols - 1 || 190;
  const heightSegs = gridRows - 1 || 190;
  // Re-derive the original sphere positions so jitter is applied
  // fresh each time (instead of compounding on a previously-jittered
  // buffer when the slider moves).
  const sphereGeo = new THREE.SphereGeometry(2, widthSegs, heightSegs);
  const src = sphereGeo.attributes.position.array;
  const j = props.sphereJitter;
  for (let i = 0; i < src.length; i += 3) {
    restSphere[i]     = src[i]     + (Math.random() - 0.5) * 2 * j;
    restSphere[i + 1] = src[i + 1] + (Math.random() - 0.5) * 2 * j;
    restSphere[i + 2] = src[i + 2] + (Math.random() - 0.5) * 2 * j;
  }
  sphereGeo.dispose();
}

/**
 * Compute (or recompute) the grid rest positions using the current
 * `gridSize` and `gridSpread` props. Called from init() once and from
 * a watcher whenever either prop changes, so the grid morph stays
 * up-to-date when you tune sliders in the lab.
 *
 * Spacing curve: each axis uses `f(u) = sign(u) * |u|^spread` mapped
 * over normalised coords u ∈ [-1, +1], then scaled to the half-size.
 *   - spread = 1.0  → linear, uniform spacing.
 *   - spread = 2.0  → quadratic, dense in centre, sparse at edges.
 *   - spread = 3.0+ → very dense centre, dramatic spread to edges.
 * `gridSize` controls the OUTER bound — set it bigger than the
 * visible area to let the grid bleed off-screen.
 */
function computeGridPositions() {
  if (!restGrid || !gridCols || !gridRows) return;
  const cols = gridCols;
  const rows = gridRows;
  const halfSize = props.gridSize / 2;
  const spread = props.gridSpread;
  const halfColIdx = (cols - 1) / 2;
  const halfRowIdx = (rows - 1) / 2;

  for (let i = 0; i < particleCount; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const ix = i * 3;

    // Normalised coords ∈ [-1, +1]
    const u = (col - halfColIdx) / halfColIdx;
    const v = (row - halfRowIdx) / halfRowIdx;

    // Power-curve spacing — derivative is 0 at u=0 and grows with |u|,
    // which means dots are tightly packed near the centre and rapidly
    // spaced apart toward the edges.
    const fu = Math.sign(u) * Math.pow(Math.abs(u), spread);
    const fv = Math.sign(v) * Math.pow(Math.abs(v), spread);

    restGrid[ix]     = fu * halfSize;
    restGrid[ix + 1] = -fv * halfSize; // row 0 = top of screen
    restGrid[ix + 2] = 0;
  }
}

const onWindowResize = useDebounceFn(() => {
  if (!canvasElement.value) return;
  camera.aspect =
    canvasElement.value.clientWidth / canvasElement.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(
    canvasElement.value.clientWidth,
    canvasElement.value.clientHeight,
    false,
  );
}, 200);

function onDocumentMouseMove(event) {
  if (!canvasElement.value) return;
  const rect = canvasElement.value.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  cursorActive = true;
}

function onDocumentMouseLeave() {
  cursorActive = false;
  cursorPrevValid = false;
}

/**
 * Project the screen-space cursor (NDC) onto the world-space z=0
 * plane. Used by all distance-based hover modes so the cursor's
 * effective position is in the same coordinate space as particles
 * (which sit on z=0 in grid mode and around z=0 in sphere mode).
 *
 * Updates `_cursorWorld` in place. Returns true if a valid cursor
 * world position was computed, false if the cursor isn't active.
 */
function updateCursorWorld() {
  if (!cursorActive) return false;
  // Unproject NDC → world space, then ray-cast to z=0 plane.
  _cursorNdc.set(mouse.x, mouse.y, 0.5);
  _cursorNdc.unproject(camera);
  _cursorRay.copy(_cursorNdc).sub(camera.position).normalize();
  if (Math.abs(_cursorRay.z) < 1e-6) return false;
  const t = -camera.position.z / _cursorRay.z;
  if (t < 0) return false;
  _cursorWorld.copy(camera.position).addScaledVector(_cursorRay, t);

  // Track cursor world-space delta for the 'push' mode. First frame
  // we don't have a previous position yet — set it and skip delta.
  if (cursorPrevValid) {
    _cursorWorldDelta.copy(_cursorWorld).sub(_cursorPrevWorld);
  } else {
    _cursorWorldDelta.set(0, 0, 0);
    cursorPrevValid = true;
  }
  _cursorPrevWorld.copy(_cursorWorld);
  return true;
}

// === Animation loop control ===
function startAnimation() {
  if (isLooping) return;
  isLooping = true;
  clock.getDelta(); // discard accumulated delta after pause
  animate();
}

function stopAnimation() {
  isLooping = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function animate() {
  if (!isLooping) return;
  animationFrameId = requestAnimationFrame(animate);

  const delta = clock.getDelta();
  totalTime += delta;
  frameCount++;
  const t = totalTime;
  const fmix = formationMix;

  // === Camera ===
  // Sphere mode: orbits at sphereFov, normal perspective.
  // Grid mode: tiny FOV (gridFov) with the camera pulled back so the
  // visible area stays the same size — projection becomes effectively
  // orthographic (no perspective foreshortening across the grid).
  // Distance multiplier = tan(sphereFov/2) / tan(gridFov/2).
  const sphereFov = props.sphereFov;
  const gridFov = props.gridFov;
  const fov = sphereFov + (gridFov - sphereFov) * fmix;
  const distMultiplier =
    Math.tan((sphereFov * 0.5 * Math.PI) / 180) /
    Math.tan((fov * 0.5 * Math.PI) / 180);

  const orbitDist = props.cameraDistance;             // sphere orbit radius
  const gridDist  = props.cameraDistance * distMultiplier; // pulled back

  const rotSpeed = props.rotateSpeed;
  const baseX = Math.sin(t * rotSpeed) * orbitDist;
  const baseZ = Math.cos(t * rotSpeed) * orbitDist;
  camera.position.x = baseX * (1 - fmix);
  camera.position.z = baseZ * (1 - fmix) + gridDist * fmix;
  camera.fov = fov;
  camera.updateProjectionMatrix();
  camera.lookAt(scene.position);

  // Compensate fog for the camera pull-back. FogExp2 falls off
  // exponentially with distance — when distMultiplier balloons (e.g.
  // 14x at gridFov=6), particles 60 units away get e^(-0.15*60) ≈ 0
  // brightness and the entire grid vanishes. Scaling density down by
  // the same multiplier keeps `density * effectiveDistance` constant,
  // so the visual fog amount stays the same regardless of FOV.
  if (scene.fog) {
    scene.fog.density = props.fogDensity / distMultiplier;
  }

  // PointsMaterial.size with sizeAttenuation also shrinks as the
  // camera pulls back, so dots in grid mode would render tiny. Scale
  // the material size up by the same multiplier so they keep their
  // on-screen size as the FOV collapses.
  if (material) {
    material.size = props.particleSize * distMultiplier;
  }

  // === Hover interaction ===
  // All modes (push / attract / repel / vortex / part) work in
  // world-space — the cursor is projected onto the z=0 plane every
  // frame, then each particle within hoverRadius gets a velocity
  // injection inside the per-particle loop below. This means the
  // effect is FOV-independent: it works the same in sphere mode
  // (perspective, camera ~5 units away) and grid mode (near-ortho,
  // camera ~70 units away).
  //
  // Push uses the cursor's world-space delta (this frame minus last
  // frame) as the velocity direction — so it feels like dragging
  // dots with your mouse. All other modes use the cursor position.
  const hoverMode = props.hoverMode;
  const useFieldHover = hoverMode !== 'none';
  const cursorOk = useFieldHover && updateCursorWorld();
  const hoverRadius = props.hoverRadius;
  const hoverRadiusSq = hoverRadius * hoverRadius;
  const hoverStrength = props.hoverStrength;
  const cursorX = cursorOk ? _cursorWorld.x : 0;
  const cursorY = cursorOk ? _cursorWorld.y : 0;
  // Cursor world-space velocity (used by push). Multiplier tunes how
  // hard the drag feels — kept as a const so the strength slider
  // controls overall force consistently across all modes.
  const PUSH_VELOCITY_GAIN = 6.0;
  const cursorDx = cursorOk ? _cursorWorldDelta.x : 0;
  const cursorDy = cursorOk ? _cursorWorldDelta.y : 0;

  // === Click explosion: how strong is the outward bias this frame? ===
  let explosionAmp = 0;
  if (explosionStartTime >= 0) {
    const et = t - explosionStartTime;
    if (et > props.explosionDuration) {
      explosionStartTime = -1;
    } else {
      const decay = 1 - et / props.explosionDuration;
      explosionAmp = props.explosionOutwardBias * decay * decay;
    }
  }

  const noiseFreq = props.noiseFreq;
  const noiseAmp = props.noiseAmp;
  const springK = props.springConstant;
  const damp = props.damping;

  // === Per-particle update ===
  for (let i = 0; i < positions.length; i += 3) {
    const sx = restSphere[i];
    const sy = restSphere[i + 1];
    const sz = restSphere[i + 2];
    const gx = restGrid[i];
    const gy = restGrid[i + 1];
    const gz = restGrid[i + 2];

    // Lerp the rest target between sphere and grid
    const rx = sx + (gx - sx) * fmix;
    const ry = sy + (gy - sy) * fmix;
    const rz = sz + (gz - sz) * fmix;

    // Direction for the noise wiggle:
    //  - Sphere mode: along the sphere's outward normal (always non-zero)
    //  - Grid mode:   along +Z (in/out of the grid plane)
    // Lerping these two means the wiggle never goes to zero and never
    // produces NaN. Sphere normal is sx/sy/sz / |sphere radius| = / 2.
    const sLen = Math.sqrt(sx * sx + sy * sy + sz * sz) || 1;
    const sNx = sx / sLen;
    const sNy = sy / sLen;
    const sNz = sz / sLen;
    const dirX = sNx * (1 - fmix);
    const dirY = sNy * (1 - fmix);
    const dirZ = sNz * (1 - fmix) + 1 * fmix;

    const noise = simplex(
      rx * noiseFreq,
      ry * noiseFreq,
      rz * noiseFreq + t * NOISE_TIME_SPEED,
    );
    const wiggle = noise * noiseAmp;

    const tx = rx + dirX * wiggle;
    const ty = ry + dirY * wiggle;
    const tz = rz + dirZ * wiggle;

    // Spring physics: pull toward the wiggling target
    velocities[i]     += (tx - positions[i])     * springK;
    velocities[i + 1] += (ty - positions[i + 1]) * springK;
    velocities[i + 2] += (tz - positions[i + 2]) * springK;

    // Sustained explosion bias: push outward from origin
    if (explosionAmp > 0) {
      const px = positions[i];
      const py = positions[i + 1];
      const pz = positions[i + 2];
      const pLen = Math.sqrt(px * px + py * py + pz * pz) || 1;
      velocities[i]     += (px / pLen) * explosionAmp;
      velocities[i + 1] += (py / pLen) * explosionAmp;
      velocities[i + 2] += (pz / pLen) * explosionAmp;
    }

    // Field-hover effect (attract / repel / vortex / part). Distance
    // is measured in 2D (x,y) — feels right for both sphere and grid
    // because the cursor is always projected to the z=0 plane.
    if (cursorOk) {
      const dxh = positions[i]     - cursorX;
      const dyh = positions[i + 1] - cursorY;
      const distHSq = dxh * dxh + dyh * dyh;
      if (distHSq < hoverRadiusSq) {
        const distH = Math.sqrt(distHSq) || 1e-6;
        const normFalloff = 1 - distH / hoverRadius;
        const fall = normFalloff * normFalloff; // quadratic
        const nx = dxh / distH;
        const ny = dyh / distH;
        switch (hoverMode) {
          case 'push':
            // Drag — particles get the cursor's world-space velocity
            // applied (scaled by strength × falloff × gain). Faster
            // mouse = harder push. Direction = wherever you swipe.
            velocities[i]     += cursorDx * hoverStrength * fall * PUSH_VELOCITY_GAIN;
            velocities[i + 1] += cursorDy * hoverStrength * fall * PUSH_VELOCITY_GAIN;
            break;
          case 'attract':
            velocities[i]     -= nx * hoverStrength * fall;
            velocities[i + 1] -= ny * hoverStrength * fall;
            break;
          case 'repel':
            velocities[i]     += nx * hoverStrength * fall;
            velocities[i + 1] += ny * hoverStrength * fall;
            break;
          case 'vortex':
            // Tangent = perpendicular to (nx, ny) in 2D
            velocities[i]     += -ny * hoverStrength * fall;
            velocities[i + 1] +=  nx * hoverStrength * fall;
            break;
          case 'part':
            // Hard radial push — like Moses parting the sea
            velocities[i]     += nx * hoverStrength * 3 * fall;
            velocities[i + 1] += ny * hoverStrength * 3 * fall;
            break;
        }
      }
    }

    // Damp + integrate
    velocities[i]     *= damp;
    velocities[i + 1] *= damp;
    velocities[i + 2] *= damp;
    positions[i]     += velocities[i];
    positions[i + 1] += velocities[i + 1];
    positions[i + 2] += velocities[i + 2];

    // Colour: same simplex-driven palette blend as the original
    const cn = simplex(
      rx * COLOR_FREQ,
      ry * COLOR_FREQ,
      rz * COLOR_FREQ + t * NOISE_TIME_SPEED,
    );
    const cIdxF = ((cn + 1) / 2) * (colorPalette.length - 1);
    const i1 = Math.floor(cIdxF);
    const i2 = Math.min(i1 + 1, colorPalette.length - 1);
    _tempColor.copy(colorPalette[i1]).lerp(colorPalette[i2], cIdxF - i1);
    colors[i]     = _tempColor.r;
    colors[i + 1] = _tempColor.g;
    colors[i + 2] = _tempColor.b;
  }

  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.color.needsUpdate = true;
  // Slow Y rotation, damped out as we morph to grid
  points.rotation.y += 0.0005 * (1 - fmix);

  renderer.render(scene, camera);
}

// === External API ===

/**
 * Morph particles between formations.
 * @param target  0 = sphere, 1 = grid
 * @param duration seconds for the GSAP tween
 */
function setFormation(target, duration = 1.2) {
  gsap.to(formationMixObj, {
    value: target,
    duration,
    ease: 'power2.inOut',
    overwrite: true,
    onUpdate: () => {
      formationMix = formationMixObj.value;
    },
  });
}

/**
 * Click "blow up" — inject a strong outward velocity impulse into every
 * particle, plus start a sustained outward bias that fades over
 * EXPLOSION_DURATION. Springs continue pulling particles back to the
 * current formation, so once the bias fades they reform naturally.
 */
function fireExplosion() {
  explosionStartTime = totalTime;
  const burst = props.explosionInitialBurst;
  const jit = props.explosionJitter;
  for (let i = 0; i < positions.length; i += 3) {
    const px = positions[i];
    const py = positions[i + 1];
    const pz = positions[i + 2];
    const pLen = Math.sqrt(px * px + py * py + pz * pz) || 1;
    const jx = (Math.random() - 0.5) * jit;
    const jy = (Math.random() - 0.5) * jit;
    const jz = (Math.random() - 0.5) * jit;
    velocities[i]     += (px / pLen + jx) * burst;
    velocities[i + 1] += (py / pLen + jy) * burst;
    velocities[i + 2] += (pz / pLen + jz) * burst;
  }
}

// Backwards-compat alias so Hero.vue (which currently calls
// `fireRipple(0,0,0)`) keeps working without edits — same behaviour
// as fireExplosion. The position args are ignored; the explosion is
// always centred on the scene origin.
const fireRipple = () => fireExplosion();

// Diagnostic: lets the lab page poll whether the animate loop is alive.
function getFrameCount() {
  return frameCount;
}

defineExpose({ setFormation, fireExplosion, fireRipple, getFrameCount });

// === Lifecycle ===

watch(
  () => props.isPlaying,
  (val) => {
    if (val) startAnimation();
    else stopAnimation();
  },
);

// Live-update knobs that aren't already read every frame in animate().
// (particleSize and fogDensity ARE read every frame — they get scaled
// by the FOV-driven distMultiplier — so they don't need watchers.)
watch(() => props.particleOpacity, (v) => {
  if (material) { material.opacity = v; material.needsUpdate = true; }
});
watch(() => props.pointsScale, (v) => {
  if (points) points.scale.setScalar(v);
});

// Grid layout depends on gridSize / gridSpread — recompute the rest
// positions when either changes so live tuning updates immediately.
watch([() => props.gridSize, () => props.gridSpread], () => {
  computeGridPositions();
});

// Sphere jitter — recompute when the slider moves. The init() call
// already applies the initial jitter; this keeps live tuning working.
watch(() => props.sphereJitter, () => {
  applySphereJitter();
});

// Particle density — rebuild the geometry. Debounced so dragging the
// slider doesn't re-allocate ~5 Float32Arrays of ~150KB each per
// frame; we wait until the slider stops moving for a moment.
const rebuildParticlesDebounced = useDebounceFn(rebuildParticles, 120);
watch(() => props.particleDensity, () => {
  rebuildParticlesDebounced();
});

onMounted(() => {
  init();
  if (props.isPlaying) startAnimation();
});

onUnmounted(() => {
  stopAnimation();
  if (removeResizeListener) removeResizeListener();
  if (canvasElement.value) {
    canvasElement.value.removeEventListener('mousemove', onDocumentMouseMove);
    canvasElement.value.removeEventListener('mouseleave', onDocumentMouseLeave);
  }
  if (geometry) geometry.dispose();
  if (material) material.dispose();
  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
  }
});
</script>

<template>
  <div class="scene-container">
    <canvas ref="canvasElement" class="three-canvas" />
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables' as *;
.scene-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
.three-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
