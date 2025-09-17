<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createNoise3D } from 'simplex-noise';

const canvasContainer = ref(null);

// --- Ініціалізація сцени, камери та рендерера ---
let scene, camera, renderer, controls;
let spherePoints;
const clock = new THREE.Clock();
const simplex = createNoise3D();
let animationFrameId;

// --- Палітра кольорів для градієнта ---
const colorPalette = [
  new THREE.Color('#30d5f0'), // cyan
  new THREE.Color('#22a275'), // green
  new THREE.Color('#2b5cc1'), // blue
  new THREE.Color('#d90000'), // red
];

// --- Змінні для інтерактивності ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(-10, -10); // Початкова позиція за межами екрану
const lastMousePos = new THREE.Vector2();
const mouseMove = new THREE.Vector2();
let velocities; // Масив для зберігання швидкостей кожної точки

// --- Фізичні константи ---
const PUSH_STRENGTH = 0.03; // Сила "штовхання" від курсора
const SPRING_CONSTANT = 0.0008; // Жорсткість пружини, що повертає точки
const DAMPING = 0.96; // Демпфування (опір руху)

function init() {
  if (!canvasContainer.value) return;

  scene = new THREE.Scene();

  // --- ДОДАНО ТУМАН ---
  scene.fog = new THREE.FogExp2(0x000000, 0.4);

  camera = new THREE.PerspectiveCamera(
    75,
    canvasContainer.value.clientWidth / canvasContainer.value.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0); // Встановлюємо прозорий фон
  renderer.setSize(
    canvasContainer.value.clientWidth,
    canvasContainer.value.clientHeight
  );
  canvasContainer.value.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  const geometry = new THREE.SphereGeometry(1.5, 128, 128);
  const positions = geometry.attributes.position.array;
  const originalPositions = new Float32Array(positions.length);
  velocities = new Float32Array(positions.length);
  const colors = new Float32Array(positions.length); // Масив для кольорів

  for (let i = 0; i < positions.length; i++) {
    originalPositions[i] = positions[i];
    velocities[i] = 0;
  }
  geometry.setAttribute(
    'originalPosition',
    new THREE.BufferAttribute(originalPositions, 3)
  );
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3)); // Додаємо атрибут кольору

  const material = new THREE.PointsMaterial({
    vertexColors: true, // Вказуємо, що колір береться з атрибутів геометрії
    size: 0.015,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
  });

  spherePoints = new THREE.Points(geometry, material);
  scene.add(spherePoints);

  raycaster.params.Points.threshold = 0.15;

  window.addEventListener('resize', onWindowResize, false);
  renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
}

function onWindowResize() {
  if (!canvasContainer.value) return;
  camera.aspect =
    canvasContainer.value.clientWidth / canvasContainer.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(
    canvasContainer.value.clientWidth,
    canvasContainer.value.clientHeight
  );
}

function onDocumentMouseMove(event) {
  if (!canvasContainer.value) return;
  const rect = canvasContainer.value.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  if (lastMousePos.x !== 0 && lastMousePos.y !== 0) {
    mouseMove.subVectors(mouse, lastMousePos);
  }
  lastMousePos.copy(mouse);
}

function animate() {
  animationFrameId = requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(spherePoints);

  if (intersects.length > 0) {
    const pushForce = new THREE.Vector3(
      mouseMove.x,
      mouseMove.y,
      0
    ).multiplyScalar(PUSH_STRENGTH);
    for (const intersect of intersects) {
      const index = intersect.index * 3;
      velocities[index] += pushForce.x;
      velocities[index + 1] -= pushForce.y;
    }
  }
  mouseMove.set(0, 0);

  const positions = spherePoints.geometry.attributes.position.array;
  const originalPositions =
    spherePoints.geometry.attributes.originalPosition.array;
  const colors = spherePoints.geometry.attributes.color.array;

  const frequency = 1.5,
    amplitude = 0.5,
    timeFactor = 0.1;
  const colorFrequency = 0.8,
    colorTimeFactor = 0.2;

  for (let i = 0; i < positions.length; i += 3) {
    const ox = originalPositions[i],
      oy = originalPositions[i + 1],
      oz = originalPositions[i + 2];

    const noise = simplex(
      ox * frequency,
      oy * frequency,
      oz * frequency + elapsedTime * timeFactor
    );
    const displacement = new THREE.Vector3(ox, oy, oz)
      .normalize()
      .multiplyScalar(noise * amplitude);
    const targetPosition = new THREE.Vector3(
      ox + displacement.x,
      oy + displacement.y,
      oz + displacement.z
    );

    const currentPosition = new THREE.Vector3(
      positions[i],
      positions[i + 1],
      positions[i + 2]
    );
    const springForce = new THREE.Vector3()
      .subVectors(targetPosition, currentPosition)
      .multiplyScalar(SPRING_CONSTANT);

    velocities[i] += springForce.x;
    velocities[i + 1] += springForce.y;
    velocities[i + 2] += springForce.z;
    velocities[i] *= DAMPING;
    velocities[i + 1] *= DAMPING;
    velocities[i + 2] *= DAMPING;
    positions[i] += velocities[i];
    positions[i + 1] += velocities[i + 1];
    positions[i + 2] += velocities[i + 2];

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

    const finalColor = new THREE.Color().copy(color1).lerp(color2, blendFactor);

    colors[i] = finalColor.r;
    colors[i + 1] = finalColor.g;
    colors[i + 2] = finalColor.b;
  }

  spherePoints.geometry.attributes.position.needsUpdate = true;
  spherePoints.geometry.attributes.color.needsUpdate = true;
  spherePoints.rotation.y += 0.0005;

  controls.update();
  renderer.render(scene, camera);
}

onMounted(() => {
  init();
  animate();
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener('resize', onWindowResize);
  if (renderer) {
    renderer.domElement.removeEventListener('mousemove', onDocumentMouseMove);
    renderer.dispose();
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
});
</script>

<template>
  <div class="scene-container" ref="canvasContainer" />
</template>

<style lang="scss" scoped>
.scene-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  /* background-color: #050a14; видалено для прозорості */
  font-family: 'Inter', sans-serif;
  position: relative;
}

canvas {
  display: block;
}

.info {
  position: absolute;
  top: 10px;
  width: 100%;
  text-align: center;
  z-index: 100;
  display: block;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  pointer-events: none; // щоб не перехоплювати події миші
}
</style>
