<script setup>
import loaderData from '~/assets/lottie/logo-V02.json';
const animationRef = ref(null);
</script>

<template>
  <div class="loader">
    <div class="loader__animation">
      <Lottie ref="animationRef" :data="loaderData" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;

.loader {
  @include flex-center;
  position: fixed;
  inset: 0;
  background-color: $color-background;
  z-index: 9999; /* Ensure it overlays other content */
  &__animation {
    width: 48px;
    height: auto;
    * {
      fill: $color-foreground;
    }
  }
}
</style>
