<script setup>
import gsap from 'gsap';
import HeroCenterLine from './HeroCenterLine.vue';
import useLoader from '~/composables/useLoader';
import {
  heroInitAnimation,
  heroScrollAnimation,
} from '~/utils/animations/about';
import useAudioManager from '~/composables/useAudioManager';
import useMuxVideo from '~/composables/useMuxVideo';
import BulgeVideo from '../ui/BulgeVideo.vue';
import { useMediaQuery } from '@vueuse/core';


const containerRef = ref(null);
const mobileVideoRef = ref(null);
let ctx = null;

// Mux Playback ID for the about-page hero video (service_04 asset).
const HERO_VIDEO_PLAYBACK_ID = 'Gs9aZT00jpkPxKzJmbajcZES7rw2WYYaTmLFIu00Gt5f4';

// On mobile we show a plain <video>; on desktop the BulgeVideo
// component creates its own <video> internally and handles streaming.
useMuxVideo(mobileVideoRef, HERO_VIDEO_PLAYBACK_ID);

const { isLoading, addResourceToLoad, resourceLoaded } = useLoader();
const { scrollSmoother } = useScrollSmoother();
const { playInteractionSound, isSoundApproved, hasInteracted } = useAudioManager();
const isMobile = useMediaQuery('(max-width: 768px)');

// Indicate that this component has a resource to load
addResourceToLoad(1);

onMounted(() => {
  ctx = gsap.context(() => {}, containerRef.value);
  heroScrollAnimation(ctx, containerRef.value);
  // No more blob fetch — the hero video streams from Mux directly via
  // useMuxVideo (mobile) and BulgeVideo's internal useMuxVideo
  // (desktop). Resolve the loader resource immediately.
  resourceLoaded();
});

onUnmounted(() => {
  ctx.revert();
});

watch(isLoading, (newVal) => {
  if (!newVal) {
    // heroVideoplayerRef.value.play();
    heroInitAnimation(ctx, scrollSmoother);
    if (isSoundApproved.value && hasInteracted.value) playInteractionSound('about-load');
  }
});
</script>

<template>  
  <section ref="containerRef" class="hero">    
    <div class="hero__wrapper">      
      <video
        v-if="isMobile"
        ref="mobileVideoRef"
        class="hero__video"
        loop
        muted
        playsinline
        autoplay
      />
      <BulgeVideo
        v-else
        :playback-id="HERO_VIDEO_PLAYBACK_ID"
        class="hero__video"
      />
      <div class="hero__video-overlay" />
      <HeroCenterLine class="hero__center-line" />
      <div class="container">
        <h1 class="hero__title display-4xl">
          <span class="grey">Digital</span>
          <span class="white">Amphibians</span>
        </h1>
      </div>
    </div>
  </section>
</template>
<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;
.hero {
  // pointer-events: none;
  background-color: $color-background;
  &__wrapper {
    @include flex-center;
    flex-direction: column;
    height: 100svh;
    position: relative;
    @include respond(portrait) {
      padding-top: 160px;
      padding-bottom: 160px;
      justify-content: flex-start;
    }
    @include respond(mobile) {
      // display: block;
      padding-top: 24px;
      padding-bottom: 74px;
    }
    .container {
      pointer-events: none;
      position: relative;
      z-index: 2;
    }
  }
  &__video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    z-index: 0;
    mix-blend-mode: lighten;
    &-overlay {
      position: absolute;
      inset: 0;
      z-index: 1;
      inset: 0;
      background: url('/img/video-player-dots-overlay.svg') repeat center;
      pointer-events: none;
    }
  }
  &__title {
    span {
      display: block;
      text-align: right;
      white-space: nowrap;
      &.grey {
        text-align: left;
        color: white(50);
      }
    }
  }
  &__center-line {
    top: calc(50% - 1.9vw);
    pointer-events: none;
  }
}
</style>
