<script setup>
import Navigation from '~/components/layout/Navigation.vue';
import SoundButton from '../ui/SoundButton.vue';
import Logo from '~/assets/img/logo-1.svg';
import HeaderNavigationButton from '../ui/HeaderNavigationButton.vue';
import useNavigation from '~/composables/useNavigation';
import useAudioManager from '~/composables/useAudioManager';

const { isOpen } = useNavigation();
const { playInteractionSound, isMuted } = useAudioManager();

const onSoundChangeHandler = () => {
  isMuted.value = !isMuted.value;
};
</script>

<template>
  <header class="header">
    <NuxtLink
      to="/"
      :class="['logo', { dark: isOpen }]"
      aria-label="Go to homepage"
      aria-describedby="main-logo"
      @mouseenter="playInteractionSound"
      @focus="playInteractionSound"
    >
      <Logo id="header-logo" alt="psychoactive logo" />
    </NuxtLink>
    <HeaderNavigationButton />
    <SoundButton
      id="header-sound-button"
      class="header__sound-button"
      :muted="isMuted"
      @click="onSoundChangeHandler"
      @mouseenter="playInteractionSound"
      @focus="playInteractionSound"
    />
    <Navigation />
  </header>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables' as *;
.header {
  position: relative;
  .logo {
    position: fixed;
    top: 48px;
    left: 48px;
    z-index: 99;
    transition: color 0.3s ease;
    transition-delay: 0.3s;
    &.dark {
      color: $color-background;
    }
    .nuxt-icon {
      width: 48px;
      height: auto;
    }
  }
  &__sound-button {
    position: fixed;
    top: 110px;
    right: 48px;
    z-index: 99;
  }
}
</style>
