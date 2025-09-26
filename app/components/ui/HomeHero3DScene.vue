<script setup>
import { onMounted, onUnmounted, ref, nextTick } from 'vue';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';

const canvasElement = ref(null);

// --- Scene, camera, and renderer initialization ---
let scene, camera, renderer; // controls removed
let spherePoints;
const clock = new THREE.Clock();
const simplex = createNoise3D();
let animationFrameId;

// --- Gradient color palette ---
const colorPalette = [
  new THREE.Color('#CC4F8C'),
  new THREE.Color('#E4393C'),
  new THREE.Color('#23CF48'),
  new THREE.Color('#17FFFF'),
  new THREE.Color('#0646FF'),
  // new THREE.Color('#101012'),
];

// --- Interactivity variables ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(-10, -10); // Initial position off-screen
const lastMousePos = new THREE.Vector2();
const mouseMove = new THREE.Vector2();
let velocities; // Array to store the velocity of each point

// --- Physics constants ---
const PUSH_STRENGTH = 0.03; // "Push" strength from the cursor
const SPRING_CONSTANT = 0.0008; // Spring constant that returns points
const DAMPING = 0.96; // Damping (resistance to motion)

function getCanvasSize() {
  const canvas = canvasElement.value;
  const container = canvas && canvas.parentElement;
  return {
    width: container ? container.clientWidth : 0,
    height: container ? container.clientHeight : 0,
  };
}

function updateRendererSize() {
  if (!renderer || !canvasElement.value) return;

  const { width, height } = getCanvasSize();
  const pixelRatio = Math.min(window.devicePixelRatio, 2);

  renderer.setSize(width, height, false);
  renderer.setPixelRatio(pixelRatio);

  if (camera) {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

function init() {
  if (!canvasElement.value) return;

  scene = new THREE.Scene();

  // --- FOG ADDED ---
  scene.fog = new THREE.FogExp2(0x000000, 0.55);

  const { width, height } = getCanvasSize();

  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 4;

  renderer = new THREE.WebGLRenderer({
    canvas: canvasElement.value,
    antialias: true,
    alpha: true,
  });
  renderer.setClearColor(0x000000, 0); // Set transparent background

  // Properly set size and pixel ratio for sharp rendering
  updateRendererSize();

  /*
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  */

  const geometry = new THREE.SphereGeometry(1.5, 256, 256);
  const positions = geometry.attributes.position.array;
  const originalPositions = new Float32Array(positions.length);
  velocities = new Float32Array(positions.length);
  const colors = new Float32Array(positions.length); // Array for colors

  for (let i = 0; i < positions.length; i++) {
    originalPositions[i] = positions[i];
    velocities[i] = 0;
  }
  geometry.setAttribute(
    'originalPosition',
    new THREE.BufferAttribute(originalPositions, 3)
  );
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3)); // Add color attribute

  const material = new THREE.PointsMaterial({
    vertexColors: true, // Specify that color is taken from geometry attributes
    size: 0.008,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
  });

  spherePoints = new THREE.Points(geometry, material);
  scene.add(spherePoints);

  raycaster.params.Points.threshold = 0.15;

  window.addEventListener('resize', onWindowResize, false);
  canvasElement.value.addEventListener('mousemove', onDocumentMouseMove, false);
}

function onWindowResize() {
  updateRendererSize();
}

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

function animate() {
  animationFrameId = requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  // --- Slow camera rotation added ---
  const rotationSpeed = 0.06;
  camera.position.x = Math.sin(elapsedTime * rotationSpeed) * 4;
  camera.position.z = Math.cos(elapsedTime * rotationSpeed) * 4;
  camera.lookAt(scene.position); // Camera always looks at the scene center

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
    timeFactor = 0.08;
  const colorFrequency = 0.4,
    colorTimeFactor = 0.08;

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

  // controls.update(); // Removed
  renderer.render(scene, camera);
}

onMounted(() => {
  nextTick(() => {
    init();
    animate();
  });
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener('resize', onWindowResize);
  if (canvasElement.value) {
    canvasElement.value.removeEventListener('mousemove', onDocumentMouseMove);
  }
  if (renderer) {
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
  <div class="scene-container">
    <canvas ref="canvasElement" class="scene-canvas" />
  </div>
</template>

<style lang="scss" scoped>
.scene-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
  position: relative;
}

.scene-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
