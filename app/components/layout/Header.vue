<script setup>
import IconPlus from '~/assets/icons/icon-plus-1.svg';
import Navigation from '~/components/layout/Navigation.vue';
import SoundButton from '../ui/SoundButton.vue';
import HeaderNavigationButton from '../ui/HeaderNavigationButton.vue';
import useNavigation from '~/composables/useNavigation';
import useAudioManager from '~/composables/useAudioManager';
import useHomeVideoPlayerMobile from '~/composables/useHomeVideoPlayerMobile';
import MainAnimatedLogo from '../ui/MainAnimatedLogo.vue';
import NavigationMobile from './NavigationMobile.vue';
import { useMediaQuery } from '@vueuse/core';
import gsap from 'gsap';

const mainLogoRef = ref(null);
const { isOpen, transitionFromNavigation } = useNavigation();
const {
  playInteractionSound,
  playContinuousSound,
  stopContinuousSound,
  isMuted,
} = useAudioManager();
const { clickVideoCloseHandler } = useHomeVideoPlayerMobile();

const isMobile = useMediaQuery('(max-width: 768px)');
const isReady = ref(false);

onMounted(() => {
  isReady.value = true;
});

const onSoundChangeHandler = () => {
  isMuted.value = !isMuted.value;
};

const onLogoClickHandler = (e) => {
  const isHomePage = e.currentTarget.classList.contains(
    'router-link-exact-active'
  );
  if (!isOpen.value && !isHomePage) {
    playInteractionSound('click-3');
    playInteractionSound('menu-close', 250);
  }
  const isAnimating = gsap.getById('open-timeline-main')?.isActive();
  if (isAnimating) {
    e.preventDefault();
    return;
  }
  if (isOpen.value) {
    transitionFromNavigation.value = true;
    document.querySelector('#header-navigation-button').click();
  }
};

const onLogoHoverHandler = (e) => {
  if (mainLogoRef.value && e.type === 'mouseenter') {
    mainLogoRef.value.animationInstance.loop = true;
    mainLogoRef.value.animationInstance.play();
    playContinuousSound('home-hover-latest');
  }
  if (mainLogoRef.value && e.type === 'mouseleave') {
    mainLogoRef.value.animationInstance.loop = false;
    stopContinuousSound();
  }
};
</script>

<template>
  <header class="header">
    <NuxtLink
      to="/"
      class="logo"
      aria-label="Go to homepage"
      aria-describedby="main-logo"
      @click.capture="onLogoClickHandler"
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
      v-if="isReady && !isMobile"
      id="header-sound-button"
      class="header__sound-button"
      :muted="isMuted"
      @click="onSoundChangeHandler"
      @mouseenter="() => playInteractionSound('btn-hover-simple', 200)"
    />
    <ClientOnly>
      <Navigation v-if="!isMobile" />
      <NavigationMobile v-if="isMobile" />
      <div class="hero-mobile__navigation">
        <img src="/img/logo-2.svg" alt="Psychoactive" />
        <span class="text">psychoactive®</span>
        <button
          class="hero-mobile__navigation_button"
          @click="clickVideoCloseHandler"
        >
          <IconPlus class="icon" />
        </button>
      </div>
    </ClientOnly>
  </header>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/functions' as *;
.header {
  position: relative;
  .logo {
    position: fixed;
    top: 48px;
    left: 48px;
    z-index: 100;
    mix-blend-mode: exclusion;
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
    position: fixed !important;
    top: 110px;
    right: 48px;
    z-index: 100;
    mix-blend-mode: exclusion;
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

.hero-mobile__navigation {
  display: none;
  justify-content: center;
  align-items: center;
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  height: 42px;
  z-index: 101000;
  color: $color-background;
  font-family: 'RoobertMono', sans-serif;
  font-size: getRem(14);
  font-weight: 500;
  text-transform: uppercase;
  padding: 0;
  transform-origin: center;
  img {
    position: absolute;
    top: 4px;
    left: 10px;
    width: 36px;
    height: 36px;
    transform: scale(0.72);
    z-index: 1;
  }
  .text {
    position: absolute;
    top: 50%;
    left: getRem(58);
    z-index: 1;
    translate: 0 -50%;
  }
  &_button {
    // position: absolute;
    // right: 0;
    // top: 0;
    width: 100%;
    height: 100%;
    background-color: $color-foreground;
    border-radius: 1rem;
    justify-content: flex-end;
    padding-right: 14px;
    z-index: 0;
  }
}
</style>
