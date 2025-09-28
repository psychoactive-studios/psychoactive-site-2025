<script setup lang="ts">
import Navigation from '~/components/layout/Navigation.vue';
import SoundButton from '../ui/SoundButton.vue';
import Logo from '~/assets/img/logo-1.svg';
</script>

<template>
  <header class="header">
    <NuxtLink
      to="/"
      class="logo"
      aria-label="Go to homepage"
      aria-describedby="main-logo"
    >
      <Logo id="header-logo" alt="psychoactive logo" />
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
    z-index: 1000;
    .nuxt-icon {
      width: 48px;
      height: auto;
    }
  }
  &__sound-button {
    position: fixed;
    top: 110px;
    right: 48px;
    z-index: 1000;
  }
}
</style>
