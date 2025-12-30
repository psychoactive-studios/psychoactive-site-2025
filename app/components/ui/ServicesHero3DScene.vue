<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import * as THREE from 'three';
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

  // Camera sway
  const rotationSpeed = 0.06;
  camera.position.x = Math.sin(elapsedTime * rotationSpeed) * 4;
  camera.position.z = Math.cos(elapsedTime * rotationSpeed) * 4;
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

  for (let i = 0; i < positions.length; i += 3) {
    const ox = originalPositions[i];
    const oy = originalPositions[i + 1];
    const oz = originalPositions[i + 2];

    const noise = simplex(
      ox * frequency,
      oy * frequency,
      oz * frequency + elapsedTime * timeFactor
    );

    // Reuse objects to prevent Garbage Collection lag
    _tempNormal.set(ox, oy, oz).normalize();
    const dispScalar = noise * amplitude;

    _targetPos.set(
      ox + _tempNormal.x * dispScalar,
      oy + _tempNormal.y * dispScalar,
      oz + _tempNormal.z * dispScalar
    );

    _currentPos.set(positions[i], positions[i + 1], positions[i + 2]);

    _springForce
      .subVectors(_targetPos, _currentPos)
      .multiplyScalar(SPRING_CONSTANT);

    velocities[i] += _springForce.x;
    velocities[i + 1] += _springForce.y;
    velocities[i + 2] += _springForce.z;

    velocities[i] *= DAMPING;
    velocities[i + 1] *= DAMPING;
    velocities[i + 2] *= DAMPING;

    positions[i] += velocities[i];
    positions[i + 1] += velocities[i + 1];
    positions[i + 2] += velocities[i + 2];

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
