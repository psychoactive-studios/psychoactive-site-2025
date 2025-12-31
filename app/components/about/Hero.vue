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
  const blob = await $fetch('/video/ps_service_05.mp4', {
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
      <HeroCenterLine class="hero__center-line" />
      <div class="container">
        <h1 class="hero__title">
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
.hero {
  pointer-events: none;
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
    object-fit: cover;
    z-index: -1;
  }
  &__title {
    font-size: 14.588vw;
    font-style: normal;
    font-weight: 400;
    line-height: 100%;
    letter-spacing: -0.07em;
    span {
      display: block;
      text-align: right;
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
