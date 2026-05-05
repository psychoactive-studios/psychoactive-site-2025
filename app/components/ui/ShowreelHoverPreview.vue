<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, useId } from 'vue';
import * as THREE from 'three';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useMediaQuery, usePointer } from '@vueuse/core';

import PlusIcon from '~/assets/icons/icon-plus.svg';
import PlayIcon from '~/assets/icons/icon-play.svg';
import useAudioManager from '~/composables/useAudioManager';
import useVideoPlayer from '~/composables/useVideoPlayer';
import useLoader from '~/composables/useLoader';
import useMuxVideo from '~/composables/useMuxVideo';

import vertexShader from '@/utils/glsl/showreelMorph.vert?raw';
import fragmentShader from '@/utils/glsl/showreelMorph.frag?raw';

/**
 * ShowreelHoverPreview
 *
 * Drop-in replacement for VideoPreview that adds a Three.js shader morph
 * between the colourful "preview" video and a "previewHover" video when
 * the play button is hovered. Click-to-expand flow (teleport + Flip + modal)
 * is preserved unchanged.
 *
 * Falls back to the standard VideoPreview behaviour on mobile / touch
 * devices, or when previewHover is not provided.
 */
const props = defineProps({
  // Mux Playback ID for the primary visible video (the colourful
  // psychedelic preview shown at uMix=0). Streams via HLS — see
  // useMuxVideo composable.
  previewPlaybackId: { type: String, required: true },
  /** Mux Playback ID for the optional hover-state video (the eye loop
   *  shown at uMix=1). Streams via HLS. */
  previewHoverPlaybackId: { type: String, default: null },
  src: { type: String, required: true },
  transparentButton: { type: Boolean, default: false },
  customHandler: { type: Function, default: null },
  dots: { type: Boolean, default: true },
  autoplay: { type: Boolean, default: true },
  aspectRatio: { type: [Number, String], default: null },

  // Shader knobs — easy to tune from the parent if needed
  noiseScale:   { type: Number, default: 3.0 },
  displacement: { type: Number, default: 0.09 },
  aberration:   { type: Number, default: 0.018 },
  hueShift:     { type: Number, default: 0.55 },

  /** How long the morph in/out lasts, in seconds. */
  morphDuration: { type: Number, default: 0.65 },

  /**
   * If set to a number 0..1, overrides hover and locks the morph to that
   * value. Useful for live tuning. Pass null (default) for normal hover.
   */
  forceMix: { type: Number, default: null },

  // Click-pulse knobs (the psychedelic burst on click)
  clickAmplify:    { type: Number, default: 1.8 },  // effect multiplier at peak
  clickScanline:   { type: Number, default: 0.05 }, // scanline tear amount
  clickRise:       { type: Number, default: 0.12 }, // rise duration (s)
  clickFall:       { type: Number, default: 0.55 }, // fall duration (s)
});

const emit = defineEmits(['hover-start', 'hover-end']);

const playerContainerRef = ref(null);
const previewWrapperRef = ref(null);
const playButtonRef = ref(null);

// Position + transform tracking for the floating play-button clone
// (rendered via Teleport at body level so it sits above the hologram).
//
// We mirror BOTH the ghost button's screen position AND its computed
// transform onto the clone every frame. That way any GSAP timeline
// targeting the in-place ghost (`.video-player .play-button`) — for
// example the page-load `from(playerButton, { scale: 0 })` step in
// `heroInitAnimation` — animates the clone too, without GSAP needing
// to know the clone exists.
const playButtonRect = ref(null);
const playButtonTransform = ref('none');
let playButtonRafId = null;

function trackPlayButtonPosition() {
  const el = playButtonRef.value;
  if (el) {
    const rect = el.getBoundingClientRect();
    // Use offsetWidth/Height for the clone's size — these report the
    // element's untransformed dimensions, so when the ghost is scaled
    // to 0 we still know the natural size of the clone (96x48).
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (w > 0 && h > 0) {
      // The CSS centre of the (possibly transformed) ghost. When
      // scale = 0, rect.width = 0 and rect.left = rect.right = cx,
      // so this still gives us the correct centre point.
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      playButtonRect.value = {
        top: cy - h / 2,
        left: cx - w / 2,
        width: w,
        height: h,
      };
    }
    // Mirror the ghost's full transform string. `getComputedStyle`
    // returns `none` for an untransformed element and a `matrix(...)`
    // string when GSAP has touched it. Apply directly to the clone so
    // any animation on the ghost cascades visually.
    playButtonTransform.value = getComputedStyle(el).transform;
  }
  playButtonRafId = requestAnimationFrame(trackPlayButtonPosition);
}

const floatingPlayStyle = computed(() => {
  if (!playButtonRect.value) return null;
  return {
    position: 'fixed',
    top: `${playButtonRect.value.top}px`,
    left: `${playButtonRect.value.left}px`,
    width: `${playButtonRect.value.width}px`,
    height: `${playButtonRect.value.height}px`,
    // Sit above hero content (which lives at body z-index ~auto/0)
    // but BELOW the hamburger navigation (z-index 99 in default.vue).
    // That way when the nav opens, its background covers the clone the
    // same way it covers the original (in-place) play button — both
    // visually and for pointer events.
    zIndex: 50,
    pointerEvents: 'all',
    margin: 0,
    transform:
      playButtonTransform.value === 'none' ? '' : playButtonTransform.value,
    transformOrigin: 'center center',
  };
});

const showFloatingPlay = computed(
  () =>
    isLoaderDone.value &&
    !isOpening.value &&
    currentPreview.value !== uniqueId &&
    floatingPlayStyle.value !== null,
);
const videoARef = ref(null);
const videoBRef = ref(null);
const canvasRef = ref(null);

const { playInteractionSound } = useAudioManager();
const { currentPreview, onPlayerOpen, isOpen } = useVideoPlayer();
// `pointerType` was deliberately removed from this destructure: gating
// the morph on pointerType !== 'touch' broke the canvas in Chrome
// DevTools' Responsive mode (which reports all events as 'touch' on
// desktop). isMobile (viewport-based) is the right check instead.
const { x: pointerX, y: pointerY } = usePointer();
const isMobile = useMediaQuery('(max-width: 768px)');
const { isLoading } = useLoader();

// Don't reveal the floating clone until the preloader finishes AND the
// page-load `from(playerButton, { scale: 0 })` step in heroInitAnimation
// has had a chance to set the ghost's transform to scale 0. Without this
// the clone would be visible at full size during the preloader and then
// snap to scale 0 when heroInit fires — visually wrong. Two RAF ticks:
// one for GSAP's immediateRender to settle, one for our position-tracking
// RAF to mirror the new transform onto the (about-to-mount) clone.
const isLoaderDone = ref(false);

function revealFloatingPlayWhenReady() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      isLoaderDone.value = true;
    });
  });
}

watch(
  isLoading,
  (val) => {
    if (!val) revealFloatingPlayWhenReady();
  },
  { immediate: true },
);

const uniqueId = `player-preview-${useId()}`;

// Whether we should run the WebGL morph at all. Skip on real mobile
// devices (viewport-based check); see the usePointer destructure
// above for why we don't gate on pointerType.
const morphEnabled = computed(
  () => !!props.previewHoverPlaybackId && !isMobile.value,
);

// Attach Mux HLS streams to videoA (preview) and videoB (hover).
// useMuxVideo handles native HLS in Safari and hls.js everywhere
// else, plus disposal on unmount.
useMuxVideo(videoARef, () => props.previewPlaybackId);
useMuxVideo(videoBRef, () => props.previewHoverPlaybackId);

// True from click until the modal has been closed again — used to lock
// uMix at 1 and prevent hover-leave from animating it back during the
// expand/playback.
const isOpening = ref(false);

// --- Aspect ratio (kept identical to VideoPreview) -----------------------
const currentAspectRatio = computed(() => {
  if (props.aspectRatio) return props.aspectRatio;
  if (playerContainerRef.value) {
    return (
      playerContainerRef.value.clientWidth /
      playerContainerRef.value.clientHeight
    );
  }
  return 'inherit';
});

// Trigger the click-pulse burst. Extracted so the dev tuner can fire
// it standalone (without actually opening the modal) for visual tuning.
function triggerClickPulse() {
  gsap.killTweensOf(clickPulse);
  clickPulse.value = 0;
  gsap.timeline()
    .to(clickPulse, { value: 1, duration: props.clickRise, ease: 'power3.out' })
    .to(clickPulse, { value: 0, duration: props.clickFall, ease: 'power3.in' });
}

// Expose triggerClickPulse so a parent ref can call it (used by the tuner).
defineExpose({ triggerClickPulse });

// --- Click handler (preserved from VideoPreview) -------------------------
const handleVideoClick = () => {
  isOpening.value = true;
  if (videoBRef.value && videoBRef.value.paused) {
    videoBRef.value.play().catch(() => {});
  }
  // Cap target at 0.92 (matches handlePointerEnter). At uMix=1 the
  // dissolve completes for all pixels and the canvas shows pure eye
  // — the rectangle "disconnects" from the hologram. Capping at 0.92
  // keeps high-noise pixels mid-blend, preserving the colourful
  // eye+psychedelic mixing that gives the rectangle its character.
  gsap.killTweensOf(targetMix);
  targetMix.value = 0.92;

  // Trigger the click-pulse: a transient psychedelic burst that
  // amplifies aberration / displacement / hue spin and adds a
  // scanline-tearing glitch. Fast rise (~0.12s), slow fall (~0.6s).
  // The dramatic distortion masks any visual hiccup as the rectangle
  // scales up, and gives the click a satisfying "explosion" feel.
  triggerClickPulse();

  // Override the modal's CSS that gives .player__preview a fullscreen
  // black background once teleported.
  if (previewWrapperRef.value) {
    previewWrapperRef.value.style.backgroundColor = 'transparent';
  }

  // ALWAYS swap on click. videoB is promoted to fill the rectangle as
  // a safety underneath layer. videoA (psychedelic) is hidden so it
  // can't flash through. The canvas stays VISIBLE ON TOP, so when the
  // shader is rendering normally the user sees the canvas's shader
  // output (blended aesthetic). If the canvas momentarily fails to
  // render (e.g. WebGL drawing buffer reallocation during teleport),
  // the canvas is transparent and videoB shows through underneath —
  // user still sees the eye, just without the shader effects.
  swapToTakeover();

  playInteractionSound('click-1');
  playInteractionSound('showreel-open-1', 100);
  if (props.customHandler) {
    props.customHandler(uniqueId);
  } else {
    onPlayerOpen(uniqueId);
  }
};

// Promotes videoB (raw eye) and hides videoA (psychedelic). Canvas
// stays visible on top so its shader output is what the user sees in
// the normal case. videoB only becomes visible when the canvas is
// transparent (shader not rendering / WebGL stuttered).
function swapToTakeover() {
  if (videoBRef.value) {
    videoBRef.value.classList.add('player__preview_video--takeover');
    if (videoBRef.value.paused) videoBRef.value.play().catch(() => {});
  }
  if (videoARef.value) {
    videoARef.value.style.opacity = '0';
  }
  // canvas stays visible — its shader output covers videoB when WebGL is
  // working. Don't touch its opacity here.
}

function restoreFromTakeover() {
  if (videoBRef.value) {
    videoBRef.value.classList.remove('player__preview_video--takeover');
  }
  if (videoARef.value) {
    videoARef.value.style.opacity = '';
  }
}

// --- Three.js scene state ------------------------------------------------
let renderer = null;
let scene = null;
let camera = null;
let mesh = null;
let material = null;
let textureA = null;
let textureB = null;
let rafTickerFn = null;
let resizeObserver = null;

const targetMix = { value: 0 };          // animated by GSAP
const lerpedMix = ref(0);
const mouse = new THREE.Vector2(0.5, 0.5);
const lerpedMouse = new THREE.Vector2(0.5, 0.5);
// Transient psychedelic burst on click. GSAP timeline animates this
// from 0 → 1 → 0 over ~0.7s. The shader uses it to amplify aberration,
// displacement, hue shift, and add a scanline-tearing glitch.
const clickPulse = { value: 0 };

function initWebGL() {
  if (!videoARef.value || !videoBRef.value || !canvasRef.value) return;

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    alpha: true,
    antialias: false,
    premultipliedAlpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // Default clearColor (transparent) — when the shader doesn't paint
  // for any reason, the canvas is transparent and videoB underneath
  // (the raw eye, promoted on click) shows through. No black flash.

  // FALLBACK: if WebGL context is lost (some browsers can drop it on
  // DOM detach during teleport), promote videoB so the user still sees
  // the eye instead of a blank canvas.
  canvasRef.value.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    if (isOpening.value || currentPreview.value === uniqueId) {
      swapToTakeover();
    }
  });

  const makeTexture = (videoEl) => {
    const t = new THREE.VideoTexture(videoEl);
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.format = THREE.RGBAFormat;
    t.colorSpace = THREE.SRGBColorSpace;
    t.generateMipmaps = false;
    return t;
  };

  textureA = makeTexture(videoARef.value);
  textureB = makeTexture(videoBRef.value);

  // videoB is positioned off-screen (1px, left -9999px) so the browser
  // can decide to pause it as a power-save. Re-play it whenever it
  // pauses if we're in a state that needs it (hovering OR a click is
  // mid-flight). Without this, the canvas's eye texture would freeze.
  videoBRef.value.addEventListener('pause', () => {
    if (isHovering.value || isOpening.value) {
      videoBRef.value.play().catch(() => {});
    }
  });

  const initialW = videoARef.value.videoWidth || 1920;
  const initialH = videoARef.value.videoHeight || 1080;

  material = new THREE.ShaderMaterial({
    uniforms: {
      uTime:               { value: 0 },
      uMix:                { value: 0 },
      uMouse:              { value: lerpedMouse },
      uTextureA:           { value: textureA },
      uTextureB:           { value: textureB },
      uTextureResolution:  { value: new THREE.Vector2(initialW, initialH) },
      uResolution:         { value: new THREE.Vector2(1, 1) },
      uNoiseScale:         { value: props.noiseScale },
      uDisplacement:       { value: props.displacement },
      uAberration:         { value: props.aberration },
      uHueShift:           { value: props.hueShift },
      uClickPulse:         { value: 0 },
      uClickAmplify:       { value: props.clickAmplify },
      uClickScanline:      { value: props.clickScanline },
    },
    vertexShader,
    fragmentShader,
    transparent: false,
  });

  // Pick up the real video resolution once metadata is loaded
  const onMeta = () => {
    if (!material || !videoARef.value) return;
    const w = videoARef.value.videoWidth || initialW;
    const h = videoARef.value.videoHeight || initialH;
    material.uniforms.uTextureResolution.value.set(w, h);
  };
  if (videoARef.value.videoWidth > 0) onMeta();
  else videoARef.value.addEventListener('loadedmetadata', onMeta, { once: true });

  const geometry = new THREE.PlaneGeometry(2, 2);
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  syncRendererSize();

  // Track box resize so the cover-UV stays correct
  if (typeof ResizeObserver !== 'undefined' && previewWrapperRef.value) {
    resizeObserver = new ResizeObserver(syncRendererSize);
    resizeObserver.observe(previewWrapperRef.value);
  }

  // First paint to avoid an empty canvas flash
  renderer.render(scene, camera);

  rafTickerFn = animate;
  gsap.ticker.add(rafTickerFn);
}

function syncRendererSize() {
  if (!renderer || !material || !previewWrapperRef.value) return;
  // CRITICAL: skip resize during the click → expand sequence. Otherwise
  // the teleport instantly changes the wrapper layout from rectangle to
  // fullscreen, ResizeObserver fires, the WebGL drawing buffer is
  // reallocated, and for 1-2 frames the canvas is empty (showing the
  // clear color). The user perceives this as a black flash that hides
  // the eye. By skipping the resize, the canvas keeps rendering at its
  // pre-click resolution; CSS scales the canvas visually up to fit the
  // expanding wrapper. Slightly blurry during the ~1s scale-up but the
  // eye stays visible continuously.
  if (isOpening.value) return;
  const w = previewWrapperRef.value.clientWidth;
  const h = previewWrapperRef.value.clientHeight;
  if (w === 0 || h === 0) return;
  renderer.setSize(w, h, false);
  material.uniforms.uResolution.value.set(w, h);
}

function animate() {
  if (!renderer || !material) return;

  // forceMix overrides hover when provided — useful for tuning
  const useForce = props.forceMix !== null && props.forceMix !== undefined;
  const target = useForce ? props.forceMix : targetMix.value;

  // Smooth the mix towards the target
  lerpedMix.value = gsap.utils.interpolate(lerpedMix.value, target, useForce ? 0.4 : 0.18);

  // Smooth the mouse so the bulge centre lags slightly
  lerpedMouse.x = gsap.utils.interpolate(lerpedMouse.x, mouse.x, 0.12);
  lerpedMouse.y = gsap.utils.interpolate(lerpedMouse.y, mouse.y, 0.12);

  material.uniforms.uMix.value = lerpedMix.value;
  material.uniforms.uTime.value += 0.012;
  material.uniforms.uClickPulse.value = clickPulse.value;

  renderer.render(scene, camera);
}

// --- Live updates of shader knobs (for dev tuning) -----------------------
watch(() => props.noiseScale, (v) => {
  if (material) material.uniforms.uNoiseScale.value = v;
});
watch(() => props.displacement, (v) => {
  if (material) material.uniforms.uDisplacement.value = v;
});
watch(() => props.aberration, (v) => {
  if (material) material.uniforms.uAberration.value = v;
});
watch(() => props.hueShift, (v) => {
  if (material) material.uniforms.uHueShift.value = v;
});
watch(() => props.clickAmplify, (v) => {
  if (material) material.uniforms.uClickAmplify.value = v;
});
watch(() => props.clickScanline, (v) => {
  if (material) material.uniforms.uClickScanline.value = v;
});

function destroyWebGL() {
  if (rafTickerFn) {
    gsap.ticker.remove(rafTickerFn);
    rafTickerFn = null;
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (textureA) { textureA.dispose(); textureA = null; }
  if (textureB) { textureB.dispose(); textureB = null; }
  if (material) { material.dispose(); material = null; }
  if (mesh && mesh.geometry) { mesh.geometry.dispose(); mesh = null; }
  if (renderer) { renderer.dispose(); renderer = null; }
  scene = null;
  camera = null;
  lerpedMix.value = 0;
}

// --- Hover handling ------------------------------------------------------
const isHovering = ref(false);

function handlePointerEnter() {
  if (!morphEnabled.value) return;
  isHovering.value = true;
  emit('hover-start');
  // Make sure the hover video is playing (and starts from where it left off)
  if (videoBRef.value && videoBRef.value.paused) {
    videoBRef.value.play().catch(() => {});
  }
  // Cap target at 0.92 (not 1.0): at uMix exactly 1, the dissolve
  // mask completes for ALL pixels and the canvas shows pure eye with
  // no psychedelic mixing — the rectangle suddenly looks "clean and
  // disconnected from the hologram". At 0.92, ~30% of pixels (the
  // high-noise ones) stay mid-blend, keeping the colorful eye+psy
  // mixing that gives the rectangle its "alive" character.
  gsap.to(targetMix, {
    value: 0.92,
    duration: props.morphDuration,
    ease: 'power2.out',
    overwrite: true,
  });
}

function handlePointerLeave() {
  if (!morphEnabled.value) return;
  // ALWAYS clear the hover-tracking flag — when the rectangle teleports
  // into the modal, mouseleave fires on the original button position,
  // and we need to remember that the cursor is no longer hovering. If
  // we skipped this, on modal close the watch below would think we
  // were still hovering and would not revert to the un-hovered state.
  isHovering.value = false;
  // Don't run the visual morph-back while the modal is opening / open
  // / closing — the watch on currentPreview handles that on modal close.
  if (isOpening.value) return;
  emit('hover-end');
  gsap.to(targetMix, {
    value: 0,
    duration: props.morphDuration,
    ease: 'power2.in',
    overwrite: true,
  });
}

// CLOSE START: watch isOpen rather than currentPreview, because
// currentPreview only resets at the END of the close (after the un-flip
// completes ~0.7s later). isOpen flips to false synchronously at the
// very start of onPlayerClose, before any animation runs. Snapping
// uMix here means the canvas shows pure psychedelic from the moment
// the user clicks close — no eye is visible during the un-flip.
//
// We DELIBERATELY don't emit 'hover-end' here, even if !isHovering.
// That used to trigger Hero.vue's slow ~1.26s hologram fade-out, which
// outlasted the rectangle's un-flip (~0.8s) and produced a visible
// "ghost fade" after the rectangle had already landed. Hero.vue now
// owns the modal-close hologram fade via its own watch on isOpen,
// using a fast tween that finishes alongside the un-flip.
watch(isOpen, (newVal, oldVal) => {
  if (oldVal === true && newVal === false && currentPreview.value === uniqueId) {
    // Restore canvas/videoA visibility (hide videoB takeover) so the
    // canvas's psychedelic is what shows during the un-flip.
    restoreFromTakeover();
    gsap.killTweensOf(targetMix);
    targetMix.value = 0;
    lerpedMix.value = 0;
  }
});

// CLOSE END: the un-flip animation has completed and the rectangle is
// back at the hero. Just clear the open lock — DON'T reset the inline
// `backgroundColor: transparent`. If we cleared it, the modal CSS
// rule (#video-player-modal .player__wrapper .player__preview {
// background-color: $color-black }) would kick in for the one frame
// between this watcher firing and Vue patching the Teleport back to
// the hero — visible as a black flash at the very end of the shrink.
// Keeping the inline transparent forever is harmless: the wrapper
// has no visible bg in either location, and the canvas / preview
// video provide their own pixels.
watch(currentPreview, (newVal, oldVal) => {
  if (oldVal === uniqueId && newVal !== uniqueId) {
    isOpening.value = false;
  }
});

function handlePointerMove() {
  if (!morphEnabled.value || !previewWrapperRef.value) return;
  const rect = previewWrapperRef.value.getBoundingClientRect();
  const px = (pointerX.value - rect.left) / rect.width;
  const py = 1.0 - (pointerY.value - rect.top) / rect.height;
  mouse.x = gsap.utils.clamp(0, 1, px);
  mouse.y = gsap.utils.clamp(0, 1, py);
}

// --- Lifecycle / activation ---------------------------------------------
function activate() {
  nextTick(() => initWebGL());
}

watch(morphEnabled, (val) => {
  if (val) activate();
  else destroyWebGL();
});

onMounted(() => {
  // SplitText for the controls (kept identical to VideoPreview)
  SplitText.create(
    `#${uniqueId} .play-reel-text, #${uniqueId} .play-time-text`,
    { type: 'chars', charsClass: 'char-center' },
  );

  if (morphEnabled.value) activate();

  // Start tracking the play button's screen position for the
  // floating clone (which is at body level z-index 9999).
  trackPlayButtonPosition();
});

onUnmounted(() => {
  destroyWebGL();
  if (playButtonRafId) cancelAnimationFrame(playButtonRafId);
});
</script>

<template>
  <div class="player">
    <div v-if="dots" class="player__dots player__dots--tl" />
    <div v-if="dots" class="player__dots player__dots--tr" />
    <div v-if="dots" class="player__dots player__dots--bl" />
    <div v-if="dots" class="player__dots player__dots--br" />

    <div
      ref="playerContainerRef"
      class="player__container"
      :style="currentAspectRatio && { 'aspect-ratio': currentAspectRatio }"
      :data-flip-id="uniqueId"
    >
      <Teleport
        to="#video-player-modal"
        :disabled="currentPreview !== uniqueId"
      >
        <div :id="uniqueId" :data-flip-id="uniqueId" class="player__wrapper">
          <div ref="previewWrapperRef" class="player__preview">
            <!-- Primary visible video (the colourful one). When the morph is
                 active, the canvas is drawn on top — but we keep this video
                 mounted for clean pixel-perfect rendering at uMix = 0 and so
                 the existing Flip-to-fullscreen animation has something to
                 measure / animate.
                 src is set imperatively by useMuxVideo() (HLS stream).
                 crossorigin REQUIRED — this video is used as a WebGL
                 VideoTexture by the morph shader, which can only read
                 pixels from cross-origin sources when the element opts
                 into CORS. Mux serves Access-Control-Allow-Origin: *. -->
            <video
              ref="videoARef"
              class="player__preview_video"
              :autoplay="autoplay"
              :style="currentAspectRatio && { 'aspect-ratio': currentAspectRatio }"
              crossorigin="anonymous"
              loop
              muted
              playsinline
            />

            <!-- Secondary video used as a texture only — kept off-screen.
                 src is set imperatively by useMuxVideo() (HLS stream).
                 crossorigin required for WebGL — see videoA above. -->
            <video
              v-if="previewHoverPlaybackId"
              ref="videoBRef"
              class="player__preview_video player__preview_video--hidden"
              crossorigin="anonymous"
              autoplay
              loop
              muted
              playsinline
            />

            <!-- Three.js morph canvas — covers the preview when active. -->
            <canvas
              v-show="morphEnabled"
              ref="canvasRef"
              class="player__preview_canvas"
            />

            <div class="player__preview_overlay" />
          </div>

          <div class="player__preview_controls">
            <PlusIcon class="plus" />
            <PlusIcon class="plus" />
            <div class="play-reel-text subheader--mobile">PLAY REEL</div>
            <!--
              ORIGINAL play button — hidden via .play-button--ghost. Stays
              in the DOM so the existing onPlayerOpen GSAP timeline can
              still find and animate it (`.player__preview_controls .play-button`
              selector). The user actually interacts with the floating
              clone teleported to body below.
            -->
            <button
              ref="playButtonRef"
              :class="[
                'play-button',
                'play-button--ghost',
                { 'play-button--transparent': transparentButton },
              ]"
              aria-label="Play video"
              tabindex="-1"
              @click="handleVideoClick"
            >
              <PlayIcon />
            </button>
            <div class="play-time-text subheader--mobile">00:47 sec</div>
            <PlusIcon class="plus" />
            <PlusIcon class="plus" />
          </div>
        </div>
      </Teleport>
    </div>

    <!--
      FLOATING CLONE of the play button. Teleported to <body> so it sits
      at the root stacking context with z-index 9999 — clearly above the
      hologram (body z-index 0) and any other hero content. Position is
      tracked via getBoundingClientRect of the original on every frame
      so it stays pinned to the original's screen position. Hidden when
      the modal is opening / open so it doesn't visually conflict with
      the existing modal-open animations.
    -->
    <Teleport to="body">
      <button
        v-if="showFloatingPlay"
        :class="[
          'play-button',
          'play-button--floating',
          { 'play-button--transparent': transparentButton },
        ]"
        :style="floatingPlayStyle"
        aria-label="Play video"
        @click="handleVideoClick"
        @mouseenter="
          playInteractionSound('play-hover-menu', 200);
          handlePointerEnter();
        "
        @mouseleave="handlePointerLeave"
        @mousemove="handlePointerMove"
        @focus="handlePointerEnter"
        @blur="handlePointerLeave"
      >
        <PlayIcon />
      </button>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/functions' as *;

/* Inherits the exact same visual layout as VideoPreview. The only addition
   is a positioned canvas + a hidden second video. Anything not noted below
   is duplicated 1:1 from VideoPreview.vue so the Flip / teleport flow keeps
   working with no behavioural change. */

.player {
  position: relative;
  @include flex-center;
  &.homehero-prepared {
    width: 100%;
    .player__dots {
      width: 1px;
      &.player__dots--tl {
        top: 34%;
        left: 26.5%;
        @include respond(portrait) { top: 20%; left: 12%; }
        @include respond(mobile) { top: -8px; left: -8px; }
      }
      &.player__dots--tr {
        top: 34%;
        right: 26.5%;
        @include respond(portrait) { top: 20%; right: 12%; }
        @include respond(mobile) { top: -8px; right: -8px; }
      }
      &.player__dots--bl {
        bottom: 33%;
        left: 26.5%;
        @include respond(portrait) { bottom: 20%; left: 12%; }
        @include respond(mobile) { bottom: -8px; left: -8px; }
      }
      &.player__dots--br {
        bottom: 33%;
        right: 26.5%;
        @include respond(portrait) { bottom: 20%; right: 12%; }
        @include respond(mobile) { bottom: -8px; right: -8px; }
      }
    }
    .player__main {
      position: absolute;
      inset: 0;
      z-index: 1;
      opacity: 0;
    }
    .player__preview {
      clip-path: inset(20% 0% round 20px);
      border-radius: 20px;
      transform: scale(0.45);
      @include respond(portrait) {
        transform: scale(0.7);
        clip-path: inset(15% 0% round 20px);
      }
      @include respond(mobile) {
        transform: scale(1);
        clip-path: none;
        border-radius: getRem(6);
      }
      &_controls {
        .plus,
        .play-reel-text,
        .play-time-text {
          visibility: hidden;
        }
        @include respond(mobile) {
          .plus { display: none; }
          .play-reel-text,
          .play-time-text { visibility: visible; }
        }
      }
    }
  }
  .plus {
    width: 7px;
    height: 7px;
    color: white(50);
    margin: 0;
  }
  &__dots {
    position: absolute;
    width: 136px;
    height: 1px;
    z-index: 1;
    &::before {
      content: '';
      position: absolute;
      width: 7px;
      height: 7px;
      background: $color-dots;
      border-radius: 50%;
      top: -3px;
      left: -3px;
      @include respond(mobile) { top: 0; left: 0; width: 4px; height: 4px; }
    }
    &::after {
      content: '';
      position: absolute;
      width: 7px;
      height: 7px;
      background: $color-dots;
      border-radius: 50%;
      bottom: -3px;
      right: -3px;
      @include respond(mobile) { width: 4px; height: 4px; }
    }
    &--tl {
      top: -48px;
      left: -48px;
      transform: rotate(45deg);
      transform-origin: left;
    }
    &--tr {
      top: -48px;
      right: -48px;
      transform: rotate(-45deg);
      transform-origin: right;
    }
    &--bl {
      bottom: -48px;
      left: -48px;
      transform: rotate(-45deg);
      transform-origin: left;
    }
    &--br {
      bottom: -48px;
      right: -48px;
      transform: rotate(45deg);
      transform-origin: right;
    }
  }
  &__container {
    position: relative;
    aspect-ratio: inherit;
    @include flex-center;
    width: 100%;
    height: 100%;
    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  &__wrapper { width: 100%; }
  &__preview {
    @include flex-center;
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    aspect-ratio: inherit;
    will-change: clip-path, transform;
    &_image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
    }
    &_video {
      aspect-ratio: inherit;
      object-fit: cover;
      width: 100%;
    }
    /* Hidden second video — used only as a WebGL texture source. */
    &_video--hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
      pointer-events: none;
      left: -9999px;
    }
    /*
      Takeover state: when the user clicks play, we promote the hidden
      eye video (videoB) to fill the rectangle so the teleport + Flip
      animation can carry a regular DOM <video> to fullscreen instead
      of relying on the WebGL canvas surviving teleport.
    */
    &_video--takeover {
      position: absolute !important;
      inset: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      opacity: 1 !important;
      object-fit: cover;
      pointer-events: none;
      z-index: 1;
    }
    /* Morph canvas overlays the preview pixel-for-pixel. */
    &_canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      pointer-events: none;
      z-index: 1;
      border-radius: inherit;
    }
    &_overlay {
      background: url('/img/video-player-dots-overlay.svg') repeat;
      position: absolute;
      inset: 0;
      z-index: 2;
    }
    &_controls {
      @include flex-center;
      gap: 6%;
      position: absolute;
      inset: 50% 0 auto 0;
      transform: translateY(-50%);
      z-index: 3;
      .play-reel-text,
      .play-time-text {
        color: white(80);
        @include respond(mobile) {
          font-size: getRem(12);
          opacity: 0.5;
        }
      }
      .play-button {
        width: getRem(96);
        height: getRem(48);
        border-radius: getRem(48);
        color: $color-background;
        border: 1px solid white(20);
        position: relative;
        overflow: hidden;
        pointer-events: all;
        // Force the play button to sit above the hologram with a high
        // z-index + isolated stacking context, like the nav items.
        z-index: 50;
        isolation: isolate;
        @include respond(mobile) {
          width: 70px;
          height: 36px;
        }
        .nuxt-icon {
          position: relative;
          z-index: 1;
          transition: color 0.075s ease-out;
          translate: 2px 0px;
          @include respond(mobile) { height: 12px; }
        }
        &::before {
          content: '';
          position: absolute;
          inset: -2px;
          border: 26px solid $color-foreground;
          border-radius: getRem(48);
          z-index: 1;
          transition: border 0.2s cubic-bezier(0, 0, 0.02, 0.99);
          will-change: transform;
        }
        &:hover {
          .nuxt-icon { color: $color-foreground; }
          &::before { border: 1px solid white(100); }
        }
        &--transparent {
          color: $color-foreground;
          &::before {
            border: 1px solid white(100);
          }
          &:hover {
            .nuxt-icon {
              animation:
                change-color 0.00001s forwards 0.3s,
                flicker-effect-3 0.3s ease forwards 0.3s;
            }
            &::before { border: 26px solid $color-foreground; }
          }
        }
      }
    }
  }
}

@keyframes change-color {
  0% { color: $color-foreground; }
  100% { color: $color-background; }
}

// Hide the original play button visually but keep it in the DOM so
// the existing onPlayerOpen GSAP timeline can find/animate it.
.play-button--ghost {
  opacity: 0;
  pointer-events: none;
}
</style>

<!-- NON-scoped block: styles for the teleported play button clone.
     Scoped CSS rules nested under .player don't match the teleported
     element (different DOM ancestry), so we mirror the relevant
     styles here at the global level. -->
<style lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/functions' as *;

.play-button--floating {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: getRem(96);
  height: getRem(48);
  border-radius: getRem(48);
  border: 1px solid white(20);
  overflow: hidden;
  background: transparent;
  cursor: pointer;
  margin: 0;
  padding: 0;
  color: $color-background;

  @include respond(mobile) {
    width: 70px;
    height: 36px;
  }

  // Filled white pill (default variant)
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border: 26px solid $color-foreground;
    border-radius: getRem(48);
    z-index: 1;
    transition: border 0.2s cubic-bezier(0, 0, 0.02, 0.99);
    will-change: transform;
  }

  .nuxt-icon {
    position: relative;
    z-index: 2;
    transition: color 0.075s ease-out;
    translate: 2px 0px;
    @include respond(mobile) { height: 12px; }
  }

  &:hover {
    .nuxt-icon { color: $color-foreground; }
    &::before { border: 1px solid white(100); }
  }

  // Transparent ring variant (used on the homepage)
  &.play-button--transparent {
    color: $color-foreground;
    &::before { border: 1px solid white(100); }
    &:hover {
      .nuxt-icon {
        animation:
          change-color-floating 0.00001s forwards 0.3s;
      }
      &::before { border: 26px solid $color-foreground; }
    }
  }
}

@keyframes change-color-floating {
  0% { color: $color-foreground; }
  100% { color: $color-background; }
}
</style>
