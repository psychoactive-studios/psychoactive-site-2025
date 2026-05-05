<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import * as THREE from 'three';
import gsap from 'gsap';
import { useMediaQuery, usePointer } from '@vueuse/core';

import vertexShader from '@/utils/glsl/showreelHologram.vert?raw';
import fragmentShader from '@/utils/glsl/showreelHologram.frag?raw';

import useMuxVideo from '~/composables/useMuxVideo';

/**
 * ShowreelHoverBackground
 *
 * Fullscreen hologram-style backdrop that fades in when the user hovers
 * the showreel preview. Renders a single fullscreen plane with the eye
 * video as a texture, distorted as if projected from the preview rectangle.
 *
 * Driven by a mix prop (0..1) so the parent owns the timing and can
 * synchronise it with the foreground morph effect.
 */
const props = defineProps({
  /** Mux Playback ID of the video to project as the hologram. Streams
   *  via HLS — see useMuxVideo composable. */
  playbackId: { type: String, required: true },

  /**
   * 0..1 — how strongly the hologram is showing. Driven externally so it
   * can be tweened in lockstep with the foreground morph.
   */
  mix: { type: Number, default: 0 },

  /** CSS selector for the rectangle we're "projecting from" (centres
   *  distortion / vignette on its centre). Falls back to viewport centre. */
  centerTarget: { type: String, default: null },

  // Tunable knobs (all live-watched)
  strength:         { type: Number, default: 0.55 },
  vignette:         { type: Number, default: 1.05 },
  aberration:       { type: Number, default: 0.018 },
  scanlineFreq:     { type: Number, default: 3.0 },
  scanlineStrength: { type: Number, default: 0.18 },
  scanRollSpeed:    { type: Number, default: 0.06 },
  barrel:           { type: Number, default: 0.85 },
  parallax:         { type: Number, default: 0.04 },
  // Dark hole IN PIXELS centred on the rectangle so the play button
  // isn't sitting visually inside the hologram. Sized to just cover
  // the play button (~96x48px) without bleeding into the rectangle.
  holeRadius:       { type: Number, default: 70 },
  holeSoftness:     { type: Number, default: 50 },

  // Dev-only: force the hologram visible regardless of the mix prop.
  // Lets you preview the hologram + tune its knobs without having to
  // hover the play button.
  forceVisible:     { type: Boolean, default: false },

  /**
   * When true, bump the hologram's z-index ABOVE the video-player modal
   * (z-index 100) so it can paint over the rectangle during open/close
   * transitions — when the rectangle is teleported INTO the modal at
   * z-index 100 and would otherwise occlude the hologram. Default is
   * false (z-index 2), which sits above `.scene` (z-index 1) but below
   * the modal so the modal showreel content isn't tinted by the
   * hologram during fullscreen viewing. Hero.vue toggles this true
   * during the open + close sequences and back to false once the
   * rectangle has reparented out of the modal.
   */
  aboveModal:       { type: Boolean, default: false },
});

const rootRef = ref(null);
const canvasRef = ref(null);
const videoRef = ref(null);
const isMobile = useMediaQuery('(max-width: 768px)');
const { x: pointerX, y: pointerY, pointerType } = usePointer();

// NOTE: do not gate on pointerType !== 'touch'. Chrome DevTools Responsive
// mode reports all events as 'touch' even on desktop, which kills WebGL
// during dev. isMobile (viewport) is the right check for real mobiles.
const enabled = computed(
  () => !!props.playbackId && !isMobile.value,
);

// Stream the hologram video via Mux HLS. videoRef points at an
// off-screen <video> that's used purely as a WebGL texture source.
useMuxVideo(videoRef, () => props.playbackId);

// --- Three.js state ------------------------------------------------------
let renderer = null;
let scene = null;
let camera = null;
let mesh = null;
let material = null;
let texture = null;
let tickerFn = null;
let resizeObserver = null;

const center = new THREE.Vector2(0.5, 0.5);
const mouse = new THREE.Vector2(0.5, 0.5);
const lerpedMouse = new THREE.Vector2(0.5, 0.5);
const internalMix = ref(0);

function ensureVideoPlaying() {
  const v = videoRef.value;
  if (!v) return;
  if (v.paused || v.readyState < 2) {
    const p = v.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }
}

function initScene() {
  if (!videoRef.value || !canvasRef.value) return;

  // Off-screen videos can be paused by the browser as a power-save measure.
  // Force-play (muted videos are always allowed to autoplay) and also
  // re-play whenever metadata loads, in case the initial autoplay was
  // dropped by the off-screen heuristic.
  ensureVideoPlaying();
  videoRef.value.addEventListener('loadeddata', ensureVideoPlaying);
  videoRef.value.addEventListener('pause', ensureVideoPlaying);

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    alpha: true,
    antialias: false,
    premultipliedAlpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  texture = new THREE.VideoTexture(videoRef.value);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBAFormat;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;

  const initialW = videoRef.value.videoWidth || 1920;
  const initialH = videoRef.value.videoHeight || 1080;

  material = new THREE.ShaderMaterial({
    uniforms: {
      uTexture:           { value: texture },
      uResolution:        { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uTextureResolution: { value: new THREE.Vector2(initialW, initialH) },
      uCenter:            { value: center },
      uMouse:             { value: lerpedMouse },
      uTime:              { value: 0 },
      uMix:               { value: 0 },
      uStrength:          { value: props.strength },
      uVignette:          { value: props.vignette },
      uAberration:        { value: props.aberration },
      uScanlineFreq:      { value: props.scanlineFreq },
      uScanlineStrength:  { value: props.scanlineStrength },
      uScanRollSpeed:     { value: props.scanRollSpeed },
      uBarrel:            { value: props.barrel },
      uParallax:          { value: props.parallax },
      uHoleRadius:        { value: props.holeRadius },
      uHoleSoftness:      { value: props.holeSoftness },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  // Pick up real video dimensions when metadata is available
  const onMeta = () => {
    if (!material || !videoRef.value) return;
    material.uniforms.uTextureResolution.value.set(
      videoRef.value.videoWidth || initialW,
      videoRef.value.videoHeight || initialH,
    );
  };
  if (videoRef.value.videoWidth > 0) onMeta();
  else videoRef.value.addEventListener('loadedmetadata', onMeta, { once: true });

  const geometry = new THREE.PlaneGeometry(2, 2);
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  syncSize();

  // Canvas is viewport-sized — observe the document element so we
  // catch viewport resizes (which is what actually matters here).
  resizeObserver = new ResizeObserver(syncSize);
  resizeObserver.observe(document.documentElement);

  window.addEventListener('resize', syncSize);

  tickerFn = animate;
  gsap.ticker.add(tickerFn);
}

function syncSize() {
  if (!renderer || !material) return;
  // Canvas is fixed to the viewport (teleported to body) — use window
  // dimensions for the WebGL drawing buffer + shader uniforms.
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  material.uniforms.uResolution.value.set(w, h);
  updateCenter();
}

function updateCenter() {
  if (!material) return;
  if (!props.centerTarget) {
    center.set(0.5, 0.5);
    return;
  }
  const el = document.querySelector(props.centerTarget);
  if (!el) {
    center.set(0.5, 0.5);
    return;
  }
  // Centre target normalised to viewport UV. Recomputed every frame
  // (in animate()) so it tracks the rectangle as the page scrolls.
  const rect = el.getBoundingClientRect();
  const cx = (rect.left + rect.right) / 2 / window.innerWidth;
  const cy = 1.0 - (rect.top + rect.bottom) / 2 / window.innerHeight;
  center.set(cx, cy);
}

function animate() {
  if (!renderer || !material) return;

  // forceVisible (dev tuner toggle) overrides the mix prop so the
  // hologram is always visible at full strength.
  const target = props.forceVisible ? 1 : props.mix;

  // Smoothly approach the target so the fade is buttery.
  internalMix.value = gsap.utils.interpolate(internalMix.value, target, 0.18);

  // Skip rendering when fully faded out — saves a fullscreen draw call
  if (internalMix.value < 0.002 && props.mix < 0.002) {
    if (canvasRef.value) canvasRef.value.style.opacity = '0';
    return;
  }
  if (canvasRef.value && canvasRef.value.style.opacity !== '1') {
    canvasRef.value.style.opacity = '1';
    // Canvas just woke up — make sure the video isn't sleeping
    ensureVideoPlaying();
  }

  // Recompute the rectangle centre each frame in case scroll / layout moved
  updateCenter();

  // Mouse — normalised viewport UV (canvas is fixed to the viewport).
  if (pointerType.value === 'mouse') {
    mouse.x = gsap.utils.clamp(0, 1, pointerX.value / window.innerWidth);
    mouse.y = gsap.utils.clamp(0, 1, 1.0 - pointerY.value / window.innerHeight);
  }
  lerpedMouse.x = gsap.utils.interpolate(lerpedMouse.x, mouse.x, 0.06);
  lerpedMouse.y = gsap.utils.interpolate(lerpedMouse.y, mouse.y, 0.06);

  material.uniforms.uMix.value = internalMix.value;
  material.uniforms.uTime.value += 0.01;

  renderer.render(scene, camera);
}

function destroyScene() {
  if (tickerFn) {
    gsap.ticker.remove(tickerFn);
    tickerFn = null;
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  window.removeEventListener('resize', syncSize);
  if (texture) { texture.dispose(); texture = null; }
  if (material) { material.dispose(); material = null; }
  if (mesh && mesh.geometry) { mesh.geometry.dispose(); mesh = null; }
  if (renderer) { renderer.dispose(); renderer = null; }
  scene = null;
  camera = null;
  internalMix.value = 0;
}

// Live-update knobs --------------------------------------------------------
watch(() => props.strength,         (v) => { if (material) material.uniforms.uStrength.value = v; });
watch(() => props.vignette,         (v) => { if (material) material.uniforms.uVignette.value = v; });
watch(() => props.aberration,       (v) => { if (material) material.uniforms.uAberration.value = v; });
watch(() => props.scanlineFreq,     (v) => { if (material) material.uniforms.uScanlineFreq.value = v; });
watch(() => props.scanlineStrength, (v) => { if (material) material.uniforms.uScanlineStrength.value = v; });
watch(() => props.scanRollSpeed,    (v) => { if (material) material.uniforms.uScanRollSpeed.value = v; });
watch(() => props.barrel,           (v) => { if (material) material.uniforms.uBarrel.value = v; });
watch(() => props.parallax,         (v) => { if (material) material.uniforms.uParallax.value = v; });
watch(() => props.holeRadius,       (v) => { if (material) material.uniforms.uHoleRadius.value = v; });
watch(() => props.holeSoftness,     (v) => { if (material) material.uniforms.uHoleSoftness.value = v; });

watch(enabled, (val) => {
  if (val) nextTick(() => initScene());
  else destroyScene();
});

onMounted(() => {
  if (enabled.value) nextTick(() => initScene());
});

onUnmounted(() => {
  destroyScene();
});
</script>

<template>
  <Teleport to="body">
    <div
      ref="rootRef"
      :class="['hologram', { 'hologram--above-modal': aboveModal }]"
    >
      <!-- crossorigin REQUIRED — this video is used as a WebGL
           VideoTexture by the hologram shader, which can only read
           pixels from cross-origin sources when the element opts into
           CORS. Mux serves Access-Control-Allow-Origin: *. -->
      <video
        v-if="playbackId"
        ref="videoRef"
        crossorigin="anonymous"
        autoplay
        loop
        muted
        playsinline
        class="hologram__source"
      />
      <canvas
        v-show="enabled"
        ref="canvasRef"
        class="hologram__canvas"
      />
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.hologram {
  /*
    Teleported to <body> and fixed to the viewport so the canvas
    paints OVER the hero content (rectangle, dots, headline) rather
    than behind it. The hologram shader outputs alpha based on
    uMix * uStrength * vignette, so it acts as a translucent overlay
    — the rectangle's pixels show through where alpha is low,
    creating the "hover-state aura" interaction with the rectangle.
    A separate bottom-fade gradient inside .hero__intro masks the
    cut where this fixed canvas meets the next page section.

    Z-INDEX: must be HIGHER than `.scene` (z-index 1) which holds
    the rectangle, dot scene, and hero text — otherwise this canvas
    sits BEHIND the rectangle and the swirls only ever appear
    around it, never inside it. Stays well below the modal (100),
    the floating play button (50), the hamburger nav (99) and the
    transition overlay (110), so all of those still composite over
    the hologram correctly.
  */
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  overflow: hidden;

  /*
    Driven by Hero.vue during the open + close transitions. With the
    rectangle teleported INTO #video-player-modal (z-index 100), a
    z-index of 2 leaves the hologram trapped behind the modal and the
    rectangle stops "reacting" to it during the scale animations.
    Bumping to 105 puts the hologram over the modal for the duration
    of the transition; Hero.vue is responsible for fading the alpha
    appropriately so the hologram never obscures the actual showreel
    during fullscreen viewing. Stays below the transition overlay
    (110) so a black-out can still cover the hologram during the
    handoff into fullscreen.
  */
  &--above-modal {
    z-index: 105;
  }
  &__source {
    /* Off-screen — used only as a WebGL texture source */
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
    left: -9999px;
  }
  &__canvas {
    width: 100%;
    height: 100%;
    display: block;
    opacity: 0; /* JS toggles to 1 once mix > 0 — shader handles the fade */
  }
}
</style>
