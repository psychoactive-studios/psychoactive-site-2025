<script setup lang="ts">
import Navigation from '~/components/layout/Navigation.vue';
import SoundButton from '../ui/SoundButton.vue';
</script>

<template>
  <header class="header">
    <NuxtLink to="/" class="logo">
      <img id="header-logo" src="/img/logo-1.svg" alt="psychoactive logo" />
    </NuxtLink>
    <Navigation />
    <SoundButton id="header-sound-button" class="header__sound-button" />
  </header>
</template>

<style lang="scss" scoped>
.header {
  position: relative;
  z-index: 100;
  .logo {
    position: fixed;
    top: 48px;
    left: 48px;
  }
  &__sound-button {
    position: fixed;
    top: 110px;
    right: 48px;
  }
}
</style>
