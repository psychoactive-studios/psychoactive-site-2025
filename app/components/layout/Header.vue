<script setup>
import Navigation from '~/components/layout/Navigation.vue';
import SoundButton from '../ui/SoundButton.vue';
import HeaderNavigationButton from '../ui/HeaderNavigationButton.vue';
import useNavigation from '~/composables/useNavigation';
import useAudioManager from '~/composables/useAudioManager';
import MainAnimatedLogo from '../ui/MainAnimatedLogo.vue';
import NavigationMobile from './NavigationMobile.vue';
import { useMediaQuery } from '@vueuse/core';

const mainLogoRef = ref(null);
const { isOpen } = useNavigation();
const { playInteractionSound, isMuted } = useAudioManager();

const isMobile = useMediaQuery('(max-width: 768px)');

const onSoundChangeHandler = () => {
  isMuted.value = !isMuted.value;
};

const onLogoHoverHandler = (e) => {
  if (mainLogoRef.value && e.type === 'mouseenter') {
    mainLogoRef.value.animationInstance.loop = true;
    mainLogoRef.value.animationInstance.play();
  }
  if (mainLogoRef.value && e.type === 'mouseleave') {
    mainLogoRef.value.animationInstance.loop = false;
  }
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
      <MainAnimatedLogo
        id="header-logo"
        ref="mainLogoRef"
        alt="Psychoactive"
        @mouseenter="onLogoHoverHandler"
        @mouseleave="onLogoHoverHandler"
      />
    </NuxtLink>
    <HeaderNavigationButton />
    <SoundButton
      id="header-sound-button"
      :class="['header__sound-button', { dark: isOpen }]"
      :muted="isMuted"
      @click="onSoundChangeHandler"
      @mouseenter="playInteractionSound"
      @focus="playInteractionSound"
    />
    <ClientOnly>
      <Navigation v-if="!isMobile" />
      <NavigationMobile v-if="isMobile" />
    </ClientOnly>
  </header>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;
.header {
  position: relative;
  .logo {
    position: fixed;
    top: 48px;
    left: 48px;
    z-index: 100;
    & * {
      transition: fill 0.3s ease;
      transition-delay: 0.3s;
    }
    &.dark {
      & * {
        fill: $color-background;
      }
    }
    .nuxt-icon {
      width: 48px;
      height: auto;
    }
    @include respond(portrait) {
      left: 24px;
    }
    @include respond(mobile) {
      display: none;
    }
  }
  &__sound-button {
    position: fixed;
    top: 110px;
    right: 48px;
    z-index: 100;
    &::after {
      transition: background-color 0.3s ease;
      transition-delay: 0.3s;
    }
    :deep(span) {
      &::before,
      &::after {
        transition: border-color 0.3s ease;
        transition-delay: 0.3s;
      }
    }
    &.dark {
      &::after {
        background-color: $color-background;
      }
      :deep(span) {
        &::before,
        &::after {
          border-color: $color-background;
        }
      }
    }
    @include respond(portrait) {
      right: 24px;
    }
    @include respond(mobile) {
      display: none;
    }
  }
}
</style>
