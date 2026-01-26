<script setup>
import MainAnimatedLogo from './MainAnimatedLogo.vue';
import SoundCursor from './SoundCursor.vue';
import useAudioManager from '~/composables/useAudioManager';
import { useMediaQuery } from '@vueuse/core';

const { isSoundApproved } = useAudioManager();
const isMobile = useMediaQuery('(max-width: 768px)');
</script>

<template>
  <div :class="['loader', isSoundApproved && 'loader--no-sound-cursor']">
    <MainAnimatedLogo id="loader-logo" aria-label="Loading..." loop />
    <ClientOnly>
      <SoundCursor v-if="!isSoundApproved && !isMobile" />
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
  &--no-sound-cursor {
    cursor: default;
  }
}
</style>
