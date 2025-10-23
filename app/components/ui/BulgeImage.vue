<template>
  <div ref="rootEl" class="bulge-image-scene">
    <canvas ref="canvasEl" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';
import vertexShader from '@/utils/glsl/main.vert?raw';
import fragmentShader from '@/utils/glsl/main.frag?raw';
import gsap from 'gsap';

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  isVisible: {
    type: Boolean,
    default: false,
  },
});

const rootEl = ref(null);
const canvasEl = ref(null);
let renderer;
let scene;
let camera;
let mesh;
let material;
let animationFrameId;

const mouse = new THREE.Vector2(0.5, 0.5); // Raw mouse position
const lerpedMouse = new THREE.Vector2(0.5, 0.5); // Smoothed mouse position for shader
const targetStrength = ref(0);

const settings = {
  animationDuration: 0.5,
  maxStrength: 0.7,
  lerpFactor: 0.05, // Interpolation factor
};

onMounted(() => {
  initScene();
  addEventListeners();
  animate(); // Start animation loop immediately
});

onUnmounted(() => {
  removeEventListeners();
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  // Clean up Three.js resources
  if (renderer) {
    renderer.dispose();
  }
  if (material) {
    if (material.uniforms.uTexture.value) {
      material.uniforms.uTexture.value.dispose();
    }
    material.dispose();
  }
  if (mesh && mesh.geometry) {
    mesh.geometry.dispose();
  }
});

watch(
  () => props.isVisible,
  (newValue) => {
    gsap.to(targetStrength, {
      value: newValue ? settings.maxStrength : 0,
      duration: settings.animationDuration,
    });
  }
);

function initScene() {
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  renderer = new THREE.WebGLRenderer({
    canvas: canvasEl.value,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  handleResize();

  const geometry = new THREE.PlaneGeometry(2, 2);
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(props.src, (tex) => {
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    tex.needsUpdate = true;

    if (material) {
      material.uniforms.uTextureResolution.value.set(
        tex.image.width,
        tex.image.height
      );
    }
    // Initial render to avoid black screen
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  });

  material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uTexture: { value: texture },
      uTextureResolution: { value: new THREE.Vector2(0, 0) },
      uResolution: {
        value: new THREE.Vector2(
          rootEl.value?.clientWidth || 0,
          rootEl.value?.clientHeight || 0
        ),
      },
      uMouse: { value: lerpedMouse }, // Use the smoothed mouse position
      uStrength: { value: 0 },
      uRadius: { value: 0.6 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
  });

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  handleResize();
}

function addEventListeners() {
  window.addEventListener('resize', handleResize, false);
  window.addEventListener('mousemove', handleMouseMove, false);
  window.addEventListener('touchmove', handleMouseMove, { passive: false });
}

function removeEventListeners() {
  window.removeEventListener('resize', handleResize, false);
  window.removeEventListener('mousemove', handleMouseMove, false);
  window.removeEventListener('touchmove', handleMouseMove, false);
}

function handleResize() {
  if (renderer && material) {
    const width = rootEl.value.clientWidth;
    const height = rootEl.value.clientHeight;
    renderer.setSize(width, height);
    material.uniforms.uResolution.value.set(width, height);
  }
}

function handleMouseMove(e) {
  if (!rootEl.value) return;
  const rect = rootEl.value.getBoundingClientRect();
  const isTouch = e.touches && e.touches.length > 0;
  const eventX = isTouch ? e.touches[0].clientX : e.clientX;
  const eventY = isTouch ? e.touches[0].clientY : e.clientY;

  // Just update the raw mouse position
  mouse.x = gsap.utils.clamp(0, 1, (eventX - rect.left) / rect.width);
  mouse.y = gsap.utils.clamp(0, 1, 1.0 - (eventY - rect.top) / rect.height);
}

function animate() {
  animationFrameId = requestAnimationFrame(animate);

  // Interpolate mouse position in each frame
  lerpedMouse.x = gsap.utils.interpolate(
    lerpedMouse.x,
    mouse.x,
    settings.lerpFactor
  );
  lerpedMouse.y = gsap.utils.interpolate(
    lerpedMouse.y,
    mouse.y,
    settings.lerpFactor
  );

  if (renderer && scene && camera && material) {
    material.uniforms.uStrength.value = targetStrength.value;
    material.uniforms.uTime.value += 0.01;
    // The uMouse uniform is already linked to lerpedMouse, so no change needed here
    renderer.render(scene, camera);
  }
}
</script>

<style scoped lang="scss">
.bulge-image-scene {
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
  canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
