<script setup>
import gsap from 'gsap';
import HeroCenterLine from './HeroCenterLine.vue';
import useLoader from '~/composables/useLoader';
import {
  heroInitAnimation,
  heroScrollAnimation,
} from '~/utils/animations/about';

// console.log('heroInitAnimation', heroInitAnimation);

const containerRef = ref(null);
const heroVideoResource = ref(null);
const heroVideoplayerRef = ref(null);
let ctx = null;

const { isLoading, addResourceToLoad, resourceLoaded } = useLoader();
const { scrollSmoother } = useScrollSmoother();

// Indicate that this component has a resource to load
addResourceToLoad(1);

onMounted(async () => {
  ctx = gsap.context(() => {}, containerRef.value);
  heroScrollAnimation(ctx, containerRef.value);
  const blob = await $fetch('/video/service_04.mp4', {
    responseType: 'blob',
  });
  heroVideoResource.value = URL.createObjectURL(blob);
  resourceLoaded();
});

onUnmounted(() => {
  ctx.revert();
});

watch(isLoading, (newVal) => {
  if (!newVal) {
    heroVideoplayerRef.value.play();
    heroInitAnimation(ctx, scrollSmoother);
  }
});
</script>

<template>
  <section ref="containerRef" class="hero">
    <div class="hero__wrapper">
      <video
        ref="heroVideoplayerRef"
        class="hero__video"
        :src="heroVideoResource"
        loop
        muted
        playsinline
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
  pointer-events: none;
  background-color: $color-background;
  &__wrapper {
    @include flex-center;
    flex-direction: column;
    height: 100dvh;
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
  }
  &__video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    z-index: -1;
    mix-blend-mode: lighten;
    &-overlay {
      position: absolute;
      inset: 0;
      z-index: -1;
      inset: 0;
      background: url('/img/video-player-dots-overlay.svg') repeat center;
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
  }
}
</style>
