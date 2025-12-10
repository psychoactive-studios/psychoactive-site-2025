<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';
import { useDebounceFn, useEventListener } from '@vueuse/core';

const canvasElement = ref(null);

// --- Scene, camera, and renderer initialization ---
let scene, camera, renderer;
let spherePoints;
const clock = new THREE.Clock();
const simplex = createNoise3D();
let animationFrameId;
let removeResizeListener;
let observer;
let isLooping = false;

// --- Gradient color palette ---
const colorPalette = [
  new THREE.Color('#CC4F8C'),
  new THREE.Color('#E4393C'),
  new THREE.Color('#23CF48'),
  new THREE.Color('#17FFFF'),
  new THREE.Color('#0646FF'),
];

// Reusable objects to avoid GC
const tempColor = new THREE.Color();

function init() {
  if (!canvasElement.value) return;

  scene = new THREE.Scene();

  // --- FOG ADDED ---
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
    antialias: true,
    alpha: true,
  });
  renderer.setClearColor(0x000000, 0); // Set transparent background

  renderer.setSize(
    canvasElement.value.clientWidth,
    canvasElement.value.clientHeight,
    false
  );
  // Limit pixel ratio for performance on high-DPI mobile screens
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Reduced geometry segments slightly for mobile performance while maintaining look
  const geometry = new THREE.SphereGeometry(2, 180, 180);
  const positions = geometry.attributes.position.array;
  const originalPositions = new Float32Array(positions.length);
  const colors = new Float32Array(positions.length);

  for (let i = 0; i < positions.length; i++) {
    originalPositions[i] = positions[i];
  }
  geometry.setAttribute(
    'originalPosition',
    new THREE.BufferAttribute(originalPositions, 3)
  );
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    vertexColors: true,
    size: 0.008,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
  });

  spherePoints = new THREE.Points(geometry, material);
  spherePoints.scale.set(0.7, 0.7, 0.7);
  scene.add(spherePoints);

  // Save the unsubscribe function for resize event
  removeResizeListener = useEventListener(window, 'resize', onWindowResize);
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

function animate() {
  animationFrameId = requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  // --- Slow camera rotation ---
  const rotationSpeed = 0.06;
  camera.position.x = Math.sin(elapsedTime * rotationSpeed) * 4;
  camera.position.z = Math.cos(elapsedTime * rotationSpeed) * 4;
  camera.lookAt(scene.position);

  const positions = spherePoints.geometry.attributes.position.array;
  const originalPositions =
    spherePoints.geometry.attributes.originalPosition.array;
  const colors = spherePoints.geometry.attributes.color.array;

  const frequency = 1.5;
  const amplitude = 0.5;
  const timeFactor = 0.08;
  const colorFrequency = 0.4;
  const colorTimeFactor = 0.08;

  // Optimized loop: removed vector allocations and physics simulation
  for (let i = 0; i < positions.length; i += 3) {
    const ox = originalPositions[i];
    const oy = originalPositions[i + 1];
    const oz = originalPositions[i + 2];

    // 1. Position Noise
    const noise = simplex(
      ox * frequency,
      oy * frequency,
      oz * frequency + elapsedTime * timeFactor
    );

    // Direct displacement:
    // The sphere radius is 2. The normal vector is (ox/2, oy/2, oz/2).
    // Displacement = normal * noise * amplitude.
    // New Pos = Original + Displacement
    //         = Original + (Original / 2) * noise * amplitude
    //         = Original * (1 + noise * amplitude / 2)

    const scaleFactor = 1 + (noise * amplitude) / 2;

    positions[i] = ox * scaleFactor;
    positions[i + 1] = oy * scaleFactor;
    positions[i + 2] = oz * scaleFactor;

    // 2. Color Noise
    const colorNoise = simplex(
      ox * colorFrequency,
      oy * colorFrequency,
      oz * colorFrequency + elapsedTime * colorTimeFactor
    );
    const normalizedColorNoise = (colorNoise + 1) / 2;

    const colorIndex = normalizedColorNoise * (colorPalette.length - 1);
    const index1 = Math.floor(colorIndex);
    const index2 = Math.min(index1 + 1, colorPalette.length - 1);
    const blendFactor = colorIndex - index1;

    const color1 = colorPalette[index1];
    const color2 = colorPalette[index2];

    // Use reusable tempColor to avoid creating new objects
    tempColor.copy(color1).lerp(color2, blendFactor);

    colors[i] = tempColor.r;
    colors[i + 1] = tempColor.g;
    colors[i + 2] = tempColor.b;
  }

  spherePoints.geometry.attributes.position.needsUpdate = true;
  spherePoints.geometry.attributes.color.needsUpdate = true;
  spherePoints.rotation.y += 0.0005;

  renderer.render(scene, camera);
}

onMounted(() => {
  init();

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (!isLooping) {
          isLooping = true;
          animate();
        }
      } else {
        isLooping = false;
        cancelAnimationFrame(animationFrameId);
      }
    });
  });

  if (canvasElement.value) {
    observer.observe(canvasElement.value);
  }
});

onUnmounted(() => {
  if (observer) observer.disconnect();
  cancelAnimationFrame(animationFrameId);

  // Remove resize event listeners
  if (removeResizeListener) {
    removeResizeListener();
  }

  if (scene) {
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }
  if (renderer) {
    renderer.dispose();
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
