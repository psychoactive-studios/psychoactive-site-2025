<script setup>
import HeroCenterLine from './HeroCenterLine.vue';

const videoRef = ref(null);

onMounted(() => {
  setTimeout(() => {
    videoRef.value.play();
    console.log('Hero init', videoRef.value);
  }, 3000);
});
</script>

<template>
  <section class="hero">
    <div class="hero__wrapper">
      <video
        ref="videoRef"
        class="hero__video"
        src="/video/ps_service_05.mp4"
        autoplay
        :loop="false"
        muted
        playsinline
      />
      <HeroCenterLine class="hero__center-line" />
      <div class="container">
        <h1 class="hero__title">
          <span class="grey">Digital</span>
          <span>Amphibians</span>
        </h1>
      </div>
    </div>
  </section>
</template>
<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/functions' as *;
.hero {
  &__wrapper {
    @include flex-center;
    flex-direction: column;
    height: 100dvh;
    position: relative;
    @include respond(portrait) {
      padding-top: 160px;
      padding-bottom: 48px;
    }
    @include respond(mobile) {
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
