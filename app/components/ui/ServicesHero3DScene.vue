<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import * as THREE from 'three';
import gsap from 'gsap';
import { createNoise3D } from 'simplex-noise';
import { useDebounceFn, useEventListener } from '@vueuse/core';

// 1. Prop to control pause externally
const props = defineProps({
  isPlaying: {
    type: Boolean,
    default: true,
  },
});

const canvasElement = ref(null);

// --- Scene globals ---
let scene, camera, renderer;
let spherePoints;
const clock = new THREE.Clock(); // Three.js Clock
const simplex = createNoise3D();
let animationFrameId;
let removeResizeListener;
let isLooping = false;
let totalTime = 0; // Variable to accumulate time (so pause works)

// --- Reusable Objects (POOLING) ---
// Create objects once to avoid memory clutter in the loop
const _tempNormal = new THREE.Vector3();
const _targetPos = new THREE.Vector3();
const _currentPos = new THREE.Vector3();
const _springForce = new THREE.Vector3();
const _tempColor = new THREE.Color();
const _pushForce = new THREE.Vector3();

// --- Palette ---
const colorPalette = [
  new THREE.Color('#CC4F8C'),
  new THREE.Color('#E4393C'),
  new THREE.Color('#23CF48'),
  new THREE.Color('#17FFFF'),
  new THREE.Color('#0646FF'),
];

// --- Interactivity ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(-10, -10);
const lastMousePos = new THREE.Vector2();
const mouseMove = new THREE.Vector2();
let velocities;

// --- Constants ---
const PUSH_STRENGTH = 0.1;
const SPRING_CONSTANT = 0.001;
const DAMPING = 0.96;

// --- Formation morph (sphere ↔ grid) ---
// Particles' "rest" target lerps between sphere positions and grid
// positions based on formationMix. Driven externally via setFormation().
let sphereOriginalPositions = null; // Float32Array of original sphere positions
let gridPositions = null;            // Float32Array of grid target positions
const formationMixObj = { value: 0 }; // 0 = sphere, 1 = grid
let formationMix = 0;

// --- Click ripple ---
// Radial wave pushes particles outward from a center point. Faded over
// rippleDuration. Driven externally via fireRipple().
let rippleStartTime = -1;
const rippleCenter = new THREE.Vector3();
const RIPPLE_DURATION = 1.8;
const RIPPLE_SPEED = 3.0;
const RIPPLE_WIDTH = 0.45;
const RIPPLE_AMP = 0.35;

function init() {
  if (!canvasElement.value) return;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.57);

  camera = new THREE.PerspectiveCamera(
    75,
    canvasElement.value.clientWidth / canvasElement.value.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 4;

  renderer = new THREE.WebGLRenderer({
    canvas: canvasElement.value,
    antialias: true, // Can be disabled if there are lags on weak PCs
    alpha: true,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(
    canvasElement.value.clientWidth,
    canvasElement.value.clientHeight,
    false
  );
  renderer.setPixelRatio(window.devicePixelRatio);

  // Optimized geometry (180x180 instead of 240x240) - visually almost the same, but 40% lighter
  const geometry = new THREE.SphereGeometry(2, 190, 190);
  const positions = geometry.attributes.position.array;

  const originalPositions = new Float32Array(positions.length);
  velocities = new Float32Array(positions.length);
  const colors = new Float32Array(positions.length);

  for (let i = 0; i < positions.length; i++) {
    originalPositions[i] = positions[i];
    velocities[i] = 0;
  }

  // Pre-compute grid positions (used as the alternate "rest" target
  // when formationMix → 1). The geometry is 190x190 so we map each
  // particle to a 190x190 plane grid.
  const totalParticles = positions.length / 3;
  const cols = 190;
  const rows = Math.ceil(totalParticles / cols);
  const gridSize = 4.0; // total span (units)
  const gridStep = gridSize / (cols - 1);

  sphereOriginalPositions = new Float32Array(positions.length);
  gridPositions = new Float32Array(positions.length);
  for (let i = 0; i < totalParticles; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const ix = i * 3;
    sphereOriginalPositions[ix]     = positions[ix];
    sphereOriginalPositions[ix + 1] = positions[ix + 1];
    sphereOriginalPositions[ix + 2] = positions[ix + 2];
    gridPositions[ix]     = (col - cols / 2) * gridStep;
    gridPositions[ix + 1] = (row - rows / 2) * gridStep;
    gridPositions[ix + 2] = 0;
  }

  geometry.setAttribute(
    'originalPosition',
    new THREE.BufferAttribute(originalPositions, 3)
  );
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    vertexColors: true,
    size: 0.011,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
  });

  spherePoints = new THREE.Points(geometry, material);
  spherePoints.scale.set(0.7, 0.7, 0.7);
  scene.add(spherePoints);

  raycaster.params.Points.threshold = 0.35;

  removeResizeListener = useEventListener(window, 'resize', onWindowResize);
  canvasElement.value.addEventListener('mousemove', onDocumentMouseMove, false);
}

const onWindowResize = useDebounceFn(() => {
  if (!canvasElement.value) return;
  camera.aspect =
    canvasElement.value.clientWidth / canvasElement.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(
    canvasElement.value.clientWidth,
    canvasElement.value.clientHeight,
    false
  );
}, 200);

function onDocumentMouseMove(event) {
  if (!canvasElement.value) return;
  const rect = canvasElement.value.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  if (lastMousePos.x !== 0 && lastMousePos.y !== 0) {
    mouseMove.subVectors(mouse, lastMousePos);
  }
  lastMousePos.copy(mouse);
}

// --- Logic Control ---

const startAnimation = () => {
  if (isLooping) return;
  isLooping = true;
  // Reset delta to avoid time jump after long pause
  clock.getDelta();
  animate();
};

const stopAnimation = () => {
  isLooping = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  // totalTime is not reset, so the animation is put on "pause"
};

function animate() {
  if (!isLooping) return;

  animationFrameId = requestAnimationFrame(animate);

  // Calculate time manually to support pause
  const delta = clock.getDelta();
  totalTime += delta;
  const elapsedTime = totalTime;

  // Camera sway. When morphed to grid (formationMix → 1), pivot the
  // camera to face-on (0, 0, 4) — otherwise the rotating camera sees
  // the flat grid edge-on and it collapses to a vertical line.
  const rotationSpeed = 0.06;
  const baseX = Math.sin(elapsedTime * rotationSpeed) * 4;
  const baseZ = Math.cos(elapsedTime * rotationSpeed) * 4;
  camera.position.x = baseX * (1 - formationMix);
  camera.position.z = baseZ * (1 - formationMix) + 4 * formationMix;
  camera.lookAt(scene.position);

  // Mouse Interaction
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(spherePoints);

  if (intersects.length > 0) {
    _pushForce.set(mouseMove.x, mouseMove.y, 0).multiplyScalar(PUSH_STRENGTH);
    const threshold = raycaster.params.Points.threshold;

    for (const intersect of intersects) {
      const index = intersect.index * 3;
      const dist = intersect.distanceToRay;

      let forceFactor = (threshold - dist) / threshold;
      forceFactor = Math.max(0, forceFactor);
      forceFactor = forceFactor * forceFactor; // quadratic falloff

      velocities[index] += _pushForce.x * forceFactor;
      velocities[index + 1] += _pushForce.y * forceFactor;
    }
  }
  mouseMove.set(0, 0);

  // Particles Physics
  const positions = spherePoints.geometry.attributes.position.array;
  const originalPositions =
    spherePoints.geometry.attributes.originalPosition.array;
  const colors = spherePoints.geometry.attributes.color.array;

  const frequency = 1.5;
  const amplitude = 0.5;
  const timeFactor = 0.08;
  const colorFrequency = 0.4;

  const paletteLengthMinusOne = colorPalette.length - 1;

  // Apply ripple wave (one pass before particle physics) — pushes
  // particles outward from rippleCenter at radius growing over time.
  if (rippleStartTime >= 0) {
    const rt = elapsedTime - rippleStartTime;
    if (rt > RIPPLE_DURATION) {
      rippleStartTime = -1;
    } else {
      const rippleRadius = rt * RIPPLE_SPEED;
      const decay = 1 - rt / RIPPLE_DURATION;
      for (let i = 0; i < positions.length; i += 3) {
        const dx = positions[i] - rippleCenter.x;
        const dy = positions[i + 1] - rippleCenter.y;
        const dz = positions[i + 2] - rippleCenter.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const distFromRipple = Math.abs(dist - rippleRadius);
        if (distFromRipple < RIPPLE_WIDTH && dist > 0.001) {
          const intensity =
            (1 - distFromRipple / RIPPLE_WIDTH) * RIPPLE_AMP * decay;
          const inv = 1 / dist;
          velocities[i]     += dx * inv * intensity;
          velocities[i + 1] += dy * inv * intensity;
          velocities[i + 2] += dz * inv * intensity;
        }
      }
    }
  }

  const fmix = formationMix;

  for (let i = 0; i < positions.length; i += 3) {
    // Lerp the "rest" target between sphere and grid based on
    // formationMix. Spring physics will pull each particle toward this.
    const sox = sphereOriginalPositions[i];
    const soy = sphereOriginalPositions[i + 1];
    const soz = sphereOriginalPositions[i + 2];
    const gox = gridPositions[i];
    const goy = gridPositions[i + 1];
    const goz = gridPositions[i + 2];
    const ox = sox + (gox - sox) * fmix;
    const oy = soy + (goy - soy) * fmix;
    const oz = soz + (goz - soz) * fmix;

    const noise = simplex(
      ox * frequency,
      oy * frequency,
      oz * frequency + elapsedTime * timeFactor
    );

    // CRITICAL: use the SPHERE's original normal (sox/soy/soz) for the
    // displacement direction. The sphere normal always has length > 0
    // (radius = 2). If we used the lerped (ox/oy/oz), particles whose
    // grid position is at (0,0,0) would have a zero-length vector at
    // formationMix = 1 → normalize() returns NaN → NaN positions →
    // particles vanish or render glitchily. That's what was making the
    // grid morph "janky / completely wrong".
    _tempNormal.set(sox, soy, soz).normalize();
    const dispScalar = noise * amplitude;

    // Target position = lerped rest pos (sphere ↔ grid) + noise wiggle.
    // We assign the position directly (rather than via the original
    // weak spring physics) so the morph completes within the tween
    // duration. The slow spring (SPRING_CONSTANT = 0.001) takes
    // thousands of frames to converge — fine for tiny noise wiggles
    // around a fixed sphere, but meant the grid morph never visually
    // completed. Mouse-push velocities are still added on top so the
    // interactive push behaviour is preserved.
    positions[i]     = ox + _tempNormal.x * dispScalar + velocities[i];
    positions[i + 1] = oy + _tempNormal.y * dispScalar + velocities[i + 1];
    positions[i + 2] = oz + _tempNormal.z * dispScalar + velocities[i + 2];

    velocities[i]     *= DAMPING;
    velocities[i + 1] *= DAMPING;
    velocities[i + 2] *= DAMPING;

    // Colors
    const colorNoise = simplex(
      ox * colorFrequency,
      oy * colorFrequency,
      oz * colorFrequency + elapsedTime * timeFactor
    );
    const normalizedColorNoise = (colorNoise + 1) / 2;
    const colorIndex = normalizedColorNoise * paletteLengthMinusOne;

    const index1 = Math.floor(colorIndex);
    const index2 = Math.min(index1 + 1, paletteLengthMinusOne);
    const blendFactor = colorIndex - index1;

    _tempColor
      .copy(colorPalette[index1])
      .lerp(colorPalette[index2], blendFactor);

    colors[i] = _tempColor.r;
    colors[i + 1] = _tempColor.g;
    colors[i + 2] = _tempColor.b;
  }

  spherePoints.geometry.attributes.position.needsUpdate = true;
  spherePoints.geometry.attributes.color.needsUpdate = true;
  spherePoints.rotation.y += 0.0005;

  renderer.render(scene, camera);
}

// --- External controls ----------------------------------------------------

/**
 * Morph particles between sphere (0) and grid (1).
 * @param target  0..1 — 0 = sphere, 1 = grid
 * @param duration seconds for the GSAP tween
 */
function setFormation(target, duration = 1.2) {
  gsap.to(formationMixObj, {
    value: target,
    duration,
    ease: 'power2.inOut',
    onUpdate: () => {
      formationMix = formationMixObj.value;
    },
  });
}

/**
 * Fire a radial ripple wave through the particles starting from the
 * given center (defaults to scene origin, which sits behind the play
 * button visually).
 */
function fireRipple(x = 0, y = 0, z = 0) {
  rippleStartTime = totalTime;
  rippleCenter.set(x, y, z);
}

defineExpose({ setFormation, fireRipple });

// --- Watchers & Lifecycle ---

watch(
  () => props.isPlaying,
  (newVal) => {
    if (newVal) {
      startAnimation();
    } else {
      stopAnimation();
    }
  }
);

onMounted(() => {
  init();
  if (props.isPlaying) {
    startAnimation();
  }
});

onUnmounted(() => {
  stopAnimation();

  if (removeResizeListener) removeResizeListener();
  if (canvasElement.value) {
    canvasElement.value.removeEventListener('mousemove', onDocumentMouseMove);
  }

  // Dispose Three.js resources
  if (scene) {
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((m) => m.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }
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
