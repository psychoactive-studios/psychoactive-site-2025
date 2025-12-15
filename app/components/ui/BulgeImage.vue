<template>
  <div
    ref="rootEl"
    class="bulge-image-scene"
    :style="{ backgroundImage: `url(${src})` }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousemove="handleMouseMove"
    @touchmove="handleMouseMove"
  >
    <canvas v-if="shouldActivate" ref="canvasEl" />
    <div v-if="shouldActivate" ref="cursorRef" class="cursor">Open</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue';
import * as THREE from 'three';
import vertexShader from '@/utils/glsl/main.vert?raw';
import fragmentShader from '@/utils/glsl/main.frag?raw';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMediaQuery, usePointer } from '@vueuse/core';
import { Flip } from 'gsap/Flip';
import useWorks from '~/composables/useWorks.js';
import useScrollSmoother from '~/composables/useScrollSmoother';

const { pointerType, x: eventX, y: eventY } = usePointer();
const isMobile = useMediaQuery('(max-width: 768px)');
const { currentTransitionImage } = useWorks();
const { scrollSmoother, disableScroll } = useScrollSmoother();
const router = useRouter();

const isHovered = ref(false);
const cursorRef = ref(null);

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

const mouse = new THREE.Vector2(0.5, 0.5); // Raw mouse position
const lerpedMouse = new THREE.Vector2(0.5, 0.5); // Smoothed mouse position for shader
const targetStrength = ref(0);
const lastMousePosition = { x: 0, y: 0 }; // Last known global mouse position
let scrollTriggerInstance = null;

const settings = {
  animationDuration: 0.5,
  maxStrength: 0.7,
  lerpFactor: 0.05, // Interpolation factor
};

const shouldActivate = computed(
  () => !isMobile.value && pointerType.value === 'mouse'
);

function init() {
  initScene();
  initScrollTrigger();
  addEventListeners();
  gsap.ticker.add(animate);
}

function destroy() {
  removeEventListeners();
  cleanupScrollTrigger();
  gsap.ticker.remove(animate);
  // Clean up Three.js resources
  if (renderer) {
    renderer.dispose();
    renderer = null;
  }
  if (material) {
    if (material.uniforms.uTexture.value) {
      material.uniforms.uTexture.value.dispose();
    }
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
  // Ensure DOM is ready before initializing
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

  // Store global mouse position
  lastMousePosition.x = eventX.value;
  lastMousePosition.y = eventY.value;

  if (pointerType.value !== 'mouse') {
    return; // Skip cursor animation for non-mouse pointers
  }

  // Calculate mouse position relative to the element (0 to 1)
  const rect = rootEl.value.getBoundingClientRect();
  const relativeX = eventX.value - rect.left;
  const relativeY = eventY.value - rect.top;

  gsap.set(cursorRef.value, {
    x: relativeX + 16,
    y: relativeY + 16,
  });
  gsap.to(cursorRef.value, {
    scale: 1,
    duration: 0.3,
    ease: 'power3.out',
  });
};

const handleMouseLeave = () => {
  if (!shouldActivate.value) return;
  isHovered.value = false;
  if (pointerType.value !== 'mouse') {
    return; // Skip cursor animation for non-mouse pointers
  }
  gsap.to(cursorRef.value, {
    scale: 0,
    duration: 0.3,
    ease: 'power3.out',
  });
};

const handleClick = (href) => {
  if (isMobile.value) {
    router.push(href);
    return;
  }

  disableScroll();
  const target = document.querySelector('.work-transition');
  const duration = 1.5;

  gsap
    .timeline()
    .to(cursorRef.value, {
      scale: 0,
      duration: 0.5,
      ease: 'power4.inOut',
    })
    .to(
      targetStrength,
      {
        value: 0,
        duration: duration,
        ease: 'power4.inOut',
      },
      '<'
    )
    .to(
      rootEl.value,
      {
        borderRadius: 0,
        duration: duration,
        ease: 'power4.inOut',
      },
      '<'
    )
    .add(() => {
      Flip.fit(rootEl.value, target, {
        absolute: true,
        duration: duration,
        ease: 'power4.inOut',
        onUpdate: () => {
          handleResize();
        },
      });
    }, '<')
    .add(() => {
      currentTransitionImage.value = props.src;
    })
    .add(() => {
      scrollSmoother.value.scrollTop(0, false);
      router.push(href);
    }, '+=0.2');
};

defineExpose({
  handleClick,
});

watch(isHovered, (newValue) => {
  gsap.to(targetStrength, {
    value: newValue ? settings.maxStrength : 0,
    duration: settings.animationDuration,
  });
});

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

  const loader = new THREE.ImageBitmapLoader();
  let texture;
  loader.setOptions({ imageOrientation: 'flipY' });
  loader.load(props.src, (imageBitmap) => {
    texture = new THREE.CanvasTexture(imageBitmap);

    // Далі ваші налаштування текстури залишаються тими ж
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.needsUpdate = true;

    // Оновлюємо матеріал
    if (material) {
      material.uniforms.uTexture.value = texture;
      material.uniforms.uTextureResolution.value.set(
        imageBitmap.width,
        imageBitmap.height
      );
    }

    // Initial render to avoid black screen
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  });

  // const textureLoader = new THREE.TextureLoader();
  // const texture = textureLoader.load(props.src, (tex) => {
  //   tex.generateMipmaps = true;
  //   tex.minFilter = THREE.LinearMipmapLinearFilter;
  //   tex.magFilter = THREE.LinearFilter;
  //   tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  //   tex.needsUpdate = true;

  //   if (material) {
  //     material.uniforms.uTextureResolution.value.set(
  //       tex.image.width,
  //       tex.image.height
  //     );
  //   }
  //   // Initial render to avoid black screen
  //   if (renderer && scene && camera) {
  //     renderer.render(scene, camera);
  //   }
  // });

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
  const rect = rootEl.value.getBoundingClientRect();
  // const isTouch = e.touches && e.touches.length > 0;
  // const eventX = isTouch ? e.touches[0].clientX : e.clientX;
  // const eventY = isTouch ? e.touches[0].clientY : e.clientY;

  // Store global mouse position
  lastMousePosition.x = eventX.value;
  lastMousePosition.y = eventY.value;

  // Calculate mouse position relative to the element (0 to 1)
  const relativeX = eventX.value - rect.left;
  const relativeY = eventY.value - rect.top;

  gsap.to(cursorRef.value, {
    x: relativeX + 16,
    y: relativeY + 16,
    duration: 0.5,
    ease: 'power2.out',
    overwrite: 'auto',
  });

  mouse.x = gsap.utils.clamp(0, 1, relativeX / rect.width);
  mouse.y = gsap.utils.clamp(0, 1, 1.0 - relativeY / rect.height);
}

function handleScroll() {
  if (!isHovered.value || !rootEl.value) return;

  const rect = rootEl.value.getBoundingClientRect();

  // Calculate mouse position relative to the element using last known global position
  const relativeX = lastMousePosition.x - rect.left;
  const relativeY = lastMousePosition.y - rect.top;

  // Update cursor position
  gsap.to(cursorRef.value, {
    x: relativeX + 16,
    y: relativeY + 16,
    duration: 0.3,
    ease: 'power2.out',
    overwrite: 'auto',
  });

  // Update mouse coordinates for shader
  mouse.x = gsap.utils.clamp(0, 1, relativeX / rect.width);
  mouse.y = gsap.utils.clamp(0, 1, 1.0 - relativeY / rect.height);
}

function initScrollTrigger() {
  if (!rootEl.value) return;

  scrollTriggerInstance = ScrollTrigger.create({
    trigger: rootEl.value,
    start: 'top bottom',
    end: 'bottom top',
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
  const isActive = isHovered.value || targetStrength.value > 0.001;

  if (renderer && scene && camera && material && isActive) {
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

    material.uniforms.uStrength.value = targetStrength.value;
    material.uniforms.uTime.value += 0.01;
    // The uMouse uniform is already linked to lerpedMouse, so no change needed here
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
.bulge-image-scene {
  width: 100%;
  height: 100%;
  position: relative;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  z-index: 1;
  border-radius: 10px;
  canvas {
    width: 100%;
    height: 100%;
    border-radius: inherit;
  }
  .cursor {
    @include flex-center;
    width: 96px;
    height: 48px;
    color: $color-background;
    font-family: 'RoobertMono';
    font-size: 1rem;
    font-weight: 500;
    text-transform: uppercase;
    background-color: $color-foreground;
    border-radius: 48px;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    will-change: transform;
    transform: scale(0);
  }
}
</style>
