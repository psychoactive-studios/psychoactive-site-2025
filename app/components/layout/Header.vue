<script setup lang="ts">
import Navigation from '~/components/layout/Navigation.vue';
import SoundButton from './SoundButton.vue';
</script>

<template>
  <header>
    <NuxtLink to="/" class="logo">
      <img src="/img/logo-1.svg" alt="psychoactive logo" />
    </NuxtLink>
    <Navigation />
    <SoundButton />
  </header>
</template>

<style lang="scss" scoped>
header {
  .logo {
    position: fixed;
    top: 48px;
    left: 48px;
  }
}
</style>
