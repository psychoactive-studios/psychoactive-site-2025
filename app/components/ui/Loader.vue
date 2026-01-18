<script setup>
import MainAnimatedLogo from './MainAnimatedLogo.vue';
import SoundCursor from './SoundCursor.vue';
import useAudioManager from '~/composables/useAudioManager';

const { isSoundApproved } = useAudioManager();
</script>

<template>
  <div class="loader">
    <MainAnimatedLogo id="loader-logo" aria-label="Loading..." loop />
    <ClientOnly>
      <SoundCursor v-if="!isSoundApproved" />
    </ClientOnly>
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
  cursor: none;
}
</style>
