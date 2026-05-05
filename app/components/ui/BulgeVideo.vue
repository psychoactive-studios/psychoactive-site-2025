<template>
  <div
    ref="rootEl"
    class="bulge-video-scene"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousemove="handleMouseMove"
    @touchmove="handleMouseMove"
  >
    <!-- src is set imperatively by useMuxVideo() (HLS stream from Mux).
         crossorigin REQUIRED — the bulge effect uses this video as a
         WebGL VideoTexture, which can only read pixels from
         cross-origin sources when the element opts into CORS. Mux
         serves Access-Control-Allow-Origin: *. -->
    <video
      ref="videoEl"
      crossorigin="anonymous"
      muted
      autoplay
      loop
      playsinline
    />
    <canvas v-if="shouldActivate" ref="canvasEl" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue';
import * as THREE from 'three';
import vertexShader from '@/utils/glsl/video.vert?raw';
import fragmentShader from '@/utils/glsl/video.frag?raw';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMediaQuery, usePointer } from '@vueuse/core';
import useMuxVideo from '~/composables/useMuxVideo';

const { pointerType, x: eventX, y: eventY } = usePointer();
const isMobile = useMediaQuery('(max-width: 768px)');

const isHovered = ref(false);
const isInView = ref(false);

const props = defineProps({
  // Mux Playback ID. Streams via HLS — see useMuxVideo composable.
  playbackId: {
    type: String,
    default: null,
  },
  strength: {
    type: Number,
    default: 0.7,
  },
});

const rootEl = ref(null);
const canvasEl = ref(null);
const videoEl = ref(null);
let renderer;
let scene;
let camera;
let mesh;
let material;
let videoTexture;

const mouse = new THREE.Vector2(0.5, 0.5);
const lerpedMouse = new THREE.Vector2(0.5, 0.5);
const targetStrength = ref(0);
const lastMousePosition = { x: 0, y: 0 };
let scrollTriggerInstance = null;

const settings = {
  animationDuration: 0.5,
  maxStrength: props.strength,
  lerpFactor: 0.05,
};

const shouldActivate = computed(
  () => !isMobile.value && pointerType.value === 'mouse' && !!props.playbackId
);

// Stream the video from Mux HLS into the local <video> element.
useMuxVideo(videoEl, () => props.playbackId);

function init() {
  if (!videoEl.value || !canvasEl.value) return;
  initScene();
  initScrollTrigger();
  addEventListeners();
  gsap.ticker.add(animate);
}

function destroy() {
  removeEventListeners();
  cleanupScrollTrigger();
  gsap.ticker.remove(animate);
  if (renderer) {
    renderer.dispose();
    renderer = null;
  }
  if (videoTexture) {
    videoTexture.dispose();
    videoTexture = null;
  }
  if (material) {
    material.dispose();
    material = null;
  }
  if (mesh && mesh.geometry) {
    mesh.geometry.dispose();
  }
  if (scene) {
    scene.clear();
    scene = null;
  }
}

watch(shouldActivate, (val) => {
  if (val) {
    nextTick(() => {
      init();
    });
  } else {
    destroy();
  }
});

onMounted(() => {
  nextTick(() => {
    if (shouldActivate.value) {
      init();
    }
  });
});

onUnmounted(() => {
  destroy();
});

const handleMouseEnter = () => {
  if (!shouldActivate.value) return;
  isHovered.value = true;

  lastMousePosition.x = eventX.value;
  lastMousePosition.y = eventY.value;
};

const handleMouseLeave = () => {
  if (!shouldActivate.value) return;
  isHovered.value = false;
};

watch(isHovered, (newValue) => {
  gsap.to(targetStrength, {
    value: newValue ? settings.maxStrength : 0,
    duration: settings.animationDuration,
  });
});

function initScene() {
  if (!videoEl.value) return;

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  renderer = new THREE.WebGLRenderer({
    canvas: canvasEl.value,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  handleResize();

  const geometry = new THREE.PlaneGeometry(2, 2);

  videoTexture = new THREE.VideoTexture(videoEl.value);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.format = THREE.RGBAFormat;

  material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uTexture: { value: videoTexture },
      uTextureResolution: {
        value: new THREE.Vector2(
          videoEl.value.videoWidth || 1920,
          videoEl.value.videoHeight || 1080
        ),
      },
      uResolution: {
        value: new THREE.Vector2(
          rootEl.value?.clientWidth || 0,
          rootEl.value?.clientHeight || 0
        ),
      },
      uMouse: { value: lerpedMouse },
      uStrength: { value: 0 },
      uRadius: { value: 0.6 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
  });

  // Update texture resolution once video metadata is loaded
  if (videoEl.value.videoWidth > 0) {
    material.uniforms.uTextureResolution.value.set(
      videoEl.value.videoWidth,
      videoEl.value.videoHeight
    );
  } else {
    videoEl.value.addEventListener(
      'loadedmetadata',
      () => {
        if (material) {
          material.uniforms.uTextureResolution.value.set(
            videoEl.value.videoWidth,
            videoEl.value.videoHeight
          );
        }
      },
      { once: true }
    );
  }

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  handleResize();

  // Initial render to avoid flash of empty canvas
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

function handleResize() {
  if (renderer && material) {
    const width = rootEl.value.clientWidth;
    const height = rootEl.value.clientHeight;
    renderer.setSize(width, height, false);
    material.uniforms.uResolution.value.set(width, height);
  }
}

function handleMouseMove() {
  if (!rootEl.value || !shouldActivate.value) return;
  if (!isHovered.value) isHovered.value = true;
  const rect = rootEl.value.getBoundingClientRect();

  lastMousePosition.x = eventX.value;
  lastMousePosition.y = eventY.value;

  const relativeX = eventX.value - rect.left;
  const relativeY = eventY.value - rect.top;

  mouse.x = gsap.utils.clamp(0, 1, relativeX / rect.width);
  mouse.y = gsap.utils.clamp(0, 1, 1.0 - relativeY / rect.height);
}

function handleScroll() {
  if (!isHovered.value || !rootEl.value) return;

  const rect = rootEl.value.getBoundingClientRect();
  const relativeX = lastMousePosition.x - rect.left;
  const relativeY = lastMousePosition.y - rect.top;

  mouse.x = gsap.utils.clamp(0, 1, relativeX / rect.width);
  mouse.y = gsap.utils.clamp(0, 1, 1.0 - relativeY / rect.height);
}

function initScrollTrigger() {
  if (!rootEl.value) return;

  scrollTriggerInstance = ScrollTrigger.create({
    trigger: rootEl.value,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      isInView.value = self.isActive;
      if (videoEl.value) {
        self.isActive ? videoEl.value.play() : videoEl.value.pause();
      }
    },
    onUpdate: () => {
      handleScroll();
    },
  });
}

function cleanupScrollTrigger() {
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill();
    scrollTriggerInstance = null;
  }
}

function animate() {
  const isActive = isInView.value && (isHovered.value || targetStrength.value > 0.001);

  if (renderer && scene && camera && material && isActive) {
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

    material.uniforms.uStrength.value = targetStrength.value;
    material.uniforms.uTime.value += 0.01;
    renderer.render(scene, camera);
  }
}

function addEventListeners() {
  window.addEventListener('resize', handleResize, false);
}

function removeEventListeners() {
  window.removeEventListener('resize', handleResize, false);
}
</script>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;
.bulge-video-scene {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
  border-radius: 10px;
  overflow: hidden;
  @include respond(mobile) {
    border-radius: 6px;
  }
  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    border-radius: inherit;
  }
  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border-radius: inherit;
  }
}
</style>
