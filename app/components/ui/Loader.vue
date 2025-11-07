<script setup>
import MainAnimatedLogo from './MainAnimatedLogo.vue';
</script>

<template>
  <div class="loader">
    <MainAnimatedLogo id="loader-logo" aria-label="Loading..." loop />
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
}
</style>
