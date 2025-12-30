<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';
import { useDebounceFn, useEventListener } from '@vueuse/core';

const canvasElement = ref(null);

// --- Scene globals ---
let scene, camera, renderer;
let spherePoints;
const clock = new THREE.Clock();
const simplex = createNoise3D();
let animationFrameId;
let removeResizeListener;
let observer;
let isLooping = false;

// --- Optimization: Pre-calculate palette colors as raw numbers ---
// Це дозволяє уникнути виклику методів .copy() та .lerp() 30 тис. разів за кадр
const sourcePalette = [
  new THREE.Color('#CC4F8C'),
  new THREE.Color('#E4393C'),
  new THREE.Color('#23CF48'),
  new THREE.Color('#17FFFF'),
  new THREE.Color('#0646FF'),
];
const paletteR = new Float32Array(sourcePalette.map((c) => c.r));
const paletteG = new Float32Array(sourcePalette.map((c) => c.g));
const paletteB = new Float32Array(sourcePalette.map((c) => c.b));
const paletteMaxIndex = sourcePalette.length - 1;

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
    antialias: true,
    alpha: true,
  });
  renderer.setClearColor(0x000000, 0);

  // Оптимізація DPI: на мобільних телефонах (DPI 3) це сильно їсть батарею,
  // тому обмежуємо до 1.5 або 2 максимум.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  renderer.setSize(
    canvasElement.value.clientWidth,
    canvasElement.value.clientHeight,
    false
  );

  const geometry = new THREE.SphereGeometry(2, 120, 120);
  const positions = geometry.attributes.position.array;

  // Використовуємо Float32Array для кращої типізації
  const originalPositions = new Float32Array(positions);
  const colors = new Float32Array(positions.length);

  geometry.setAttribute(
    'originalPosition',
    new THREE.BufferAttribute(originalPositions, 3)
  );
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    vertexColors: true,
    size: 0.012,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
  });

  spherePoints = new THREE.Points(geometry, material);
  spherePoints.scale.set(0.7, 0.7, 0.7);
  scene.add(spherePoints);

  removeResizeListener = useEventListener(window, 'resize', onWindowResize);
}

const onWindowResize = useDebounceFn(() => {
  if (!canvasElement.value || !camera || !renderer) return;
  camera.aspect =
    canvasElement.value.clientWidth / canvasElement.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(
    canvasElement.value.clientWidth,
    canvasElement.value.clientHeight,
    false
  );
}, 200);

// Змінні для циклу винесені назовні, щоб уникнути GC
let i, ox, oy, oz, noise, scaleFactor;
let colorNoise, normalizedColorNoise, colorIndex, index1, index2, blendFactor;

function animate() {
  animationFrameId = requestAnimationFrame(animate);

  // Якщо сфера ще не ініціалізована - пропускаємо кадр
  if (!spherePoints) return;

  const elapsedTime = clock.getElapsedTime();

  // Camera rotation
  const rotationSpeed = 0.06;
  camera.position.x = Math.sin(elapsedTime * rotationSpeed) * 4;
  camera.position.z = Math.cos(elapsedTime * rotationSpeed) * 4;
  camera.lookAt(scene.position);

  // Отримуємо прямий доступ до типізованих масивів
  const positions = spherePoints.geometry.attributes.position.array;
  const originalPositions =
    spherePoints.geometry.attributes.originalPosition.array;
  const colors = spherePoints.geometry.attributes.color.array;
  const count = positions.length;

  const frequency = 1.5;
  // const amplitude = 0.5;
  const timeFactor = 0.08;
  const colorFrequency = 0.4;
  const colorTimeFactor = 0.08;

  // Кешуємо значення часу для циклу
  const timePos = elapsedTime * timeFactor;
  const timeCol = elapsedTime * colorTimeFactor;

  // Оптимізований цикл
  for (i = 0; i < count; i += 3) {
    ox = originalPositions[i];
    oy = originalPositions[i + 1];
    oz = originalPositions[i + 2];

    // --- Position Calculation ---
    noise = simplex(ox * frequency, oy * frequency, oz * frequency + timePos);

    // Math optimization: (1 + noise * amplitude / 2) -> (1 + noise * 0.25)
    scaleFactor = 1 + noise * 0.25;

    positions[i] = ox * scaleFactor;
    positions[i + 1] = oy * scaleFactor;
    positions[i + 2] = oz * scaleFactor;

    // --- Color Calculation (Manual Lerp) ---
    colorNoise = simplex(
      ox * colorFrequency,
      oy * colorFrequency,
      oz * colorFrequency + timeCol
    );

    // Normalization (-1..1 -> 0..1)
    normalizedColorNoise = (colorNoise + 1) * 0.5;

    colorIndex = normalizedColorNoise * paletteMaxIndex;
    index1 = Math.floor(colorIndex);
    // Використовуємо побітове "або" з 0 для швидкого floor, але Math.floor надійніше для від'ємних (тут їх нема)
    // index2 не може вийти за межі, бо index1 макс = length-1
    index2 = index1 < paletteMaxIndex ? index1 + 1 : paletteMaxIndex;

    blendFactor = colorIndex - index1;

    // Manual Lerp: A + (B - A) * t
    // Це набагато швидше ніж tempColor.copy().lerp()
    colors[i] =
      paletteR[index1] + (paletteR[index2] - paletteR[index1]) * blendFactor;
    colors[i + 1] =
      paletteG[index1] + (paletteG[index2] - paletteG[index1]) * blendFactor;
    colors[i + 2] =
      paletteB[index1] + (paletteB[index2] - paletteB[index1]) * blendFactor;
  }

  spherePoints.geometry.attributes.position.needsUpdate = true;
  spherePoints.geometry.attributes.color.needsUpdate = true;
  spherePoints.rotation.y += 0.0005;

  renderer.render(scene, camera);
}

// Функція обробки видимості вкладки
const handleVisibilityChange = () => {
  if (document.hidden) {
    if (isLooping) {
      cancelAnimationFrame(animationFrameId);
      isLooping = false;
    }
  } else {
    // Перевіряємо, чи ми все ще у в'юпорті перед відновленням
    if (!isLooping && canvasElement.value) {
      // Тут можна просто відновити, observer сам розбереться,
      // але для надійності краще залишити логіку на observer
    }
  }
};

onMounted(() => {
  init();

  // Додаткова оптимізація: зупинка при перемиканні вкладок
  document.addEventListener('visibilitychange', handleVisibilityChange);

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !document.hidden) {
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
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  if (observer) observer.disconnect();
  cancelAnimationFrame(animationFrameId);
  if (removeResizeListener) removeResizeListener();

  // Ретельне очищення Three.js
  if (spherePoints) {
    scene.remove(spherePoints);
    spherePoints.geometry.dispose();
    spherePoints.material.dispose();
    spherePoints = null; // прибираємо посилання
  }

  if (renderer) {
    renderer.dispose();
    // renderer.forceContextLoss(); // Іноді корисно, але зазвичай dispose достатньо
    renderer = null;
  }
});
</script>

<template>
  <div class="scene-container">
    <canvas ref="canvasElement" class="three-canvas" />
  </div>
</template>

<style lang="scss" scoped>
// Стилі без змін
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
