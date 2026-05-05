<script setup>
import gsap from 'gsap';
import LinkWithHover from '../ui/LinkWithHover.vue';
import useNavigation from '~/composables/useNavigation';
import loaderData from '~/assets/lottie/logo-V02.json';
import lottie from 'lottie-web';
import { onClickOutside } from '@vueuse/core';
import { navigationData } from '~/data/navigationData';
import IconMenuDots from '../ui/IconMenuDots.vue';

// Reactive state to track if the navigation is open
const isOpen = ref(false);
const lottieLogoContainerRef = ref(null);
const lottieLogoAnimationRef = ref(null);

// Ref to the navigation DOM element
const { navigationMobileRef } = useNavigation();

onMounted(() => {
  if (lottieLogoContainerRef.value) {
    lottieLogoAnimationRef.value = lottie.loadAnimation({
      container: lottieLogoContainerRef.value,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      animationData: loaderData,
    });
    // Set the animation speed (1 = normal, 2 = twice as fast, 0.5 = half as fast)
    lottieLogoAnimationRef.value.setSpeed(1.25);
  }
});

const onToggleNavigation = () => {
  if (!isOpen.value) {
    lottieLogoAnimationRef?.value?.setDirection(1);
    lottieLogoAnimationRef?.value?.play();
    gsap
      .timeline({ paused: false })
      .to(
        '.navigation-mobile__background',
        {
          height: '100%',
          duration: 1,
          ease: 'expo.inOut',
        },
        'open'
      )
      .to(
        '.navigation-mobile__logo',
        {
          top: 16,
          left: 16,
          scale: 1,
          duration: 1.1,
          ease: 'expo.inOut',
        },
        'open'
      )
      .to(
        '.navigation-mobile__button .icon-text',
        {
          duration: 1,
          scrambleText: {
            text: 'CLOSE',
            chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%=+<>/?',
            tweenLength: false,
          },
        },
        'open'
      )
      .to(
        '.navigation-mobile__button .icon',
        { rotate: 45, duration: 1, ease: 'expo.inOut' },
        'open'
      )
      .to(
        '.navigation-mobile__wrapper',
        {
          clipPath: 'polygon(0px 0px, 100% 0px, 100% 100%, 0px 100%)',
          duration: 1,
          ease: 'expo.inOut',
        },
        'open'
      )
      .to(
        '.navigation-mobile__button .text',
        { opacity: 0, duration: 0.3 },
        'open+=0.3'
      )
      .fromTo(
        gsap.utils.toArray('.navigation-mobile__item'),
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.5,
          stagger: {
            each: 0.07,
            from: 'end',
          },
        },
        'open+=0.4'
      )
      .fromTo(
        gsap.utils.toArray('.navigation-mobile__item-line span'),
        { width: '0%' },
        {
          width: '100%',
          duration: 1,
          ease: 'power2.inOut',
          stagger: {
            each: 0.07,
            from: 'end',
          },
        },
        'open+=0.1'
      )
      .fromTo(
        '.navigation-mobile__talk-button',
        { clipPath: 'inset(50% 0% round 36px)' },
        {
          clipPath: 'inset(0% 0% round 36px)',
          duration: 0.7,
          ease: 'power2.inOut',
        },
        'open+=0.5'
      );
  } else {
    lottieLogoAnimationRef?.value?.setDirection(-1);
    lottieLogoAnimationRef?.value?.play();
    gsap
      .timeline({ paused: false })
      .fromTo(
        '.navigation-mobile__talk-button',
        { clipPath: 'inset(0% 0% round 36px)' },
        {
          clipPath: 'inset(50% 0% round 36px)',
          duration: 0.5,
          ease: 'power3.inOut',
        },
        'open'
      )
      .to(
        gsap.utils.toArray('.navigation-mobile__item'),
        {
          opacity: 0,
          duration: 0.5,
          stagger: {
            each: 0.04,
            from: 'start',
          },
        },
        'open'
      )
      .to(
        '.navigation-mobile__logo',
        {
          top: 4,
          left: 10,
          scale: 0.72,
          duration: 0.9,
          ease: 'expo.inOut',
        },
        'open'
      )
      .fromTo(
        '.navigation-mobile__wrapper',
        {
          clipPath: 'polygon(0px 0px, 100% 0px, 100% 100%, 0px 100%)',
        },
        {
          clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0 100%)',
          duration: 1,
          ease: 'expo.inOut',
        },
        'open'
      )
      .to(
        '.navigation-mobile__background',
        {
          height: 42,
          duration: 1,
          ease: 'expo.inOut',
        },
        'open'
      )
      .to(
        '.navigation-mobile__button .icon-text',
        {
          duration: 1,
          scrambleText: {
            text: 'MENU',
            chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%=+<>/?',
            tweenLength: false,
          },
        },
        'open'
      )
      .to(
        '.navigation-mobile__button .icon',
        { rotate: 0, duration: 1, ease: 'expo.inOut' },
        'open'
      )
      .to(
        '.navigation-mobile__button .text',
        { opacity: 1, duration: 0.3 },
        'open+=0.4'
      );
  }
  isOpen.value = !isOpen.value;
};

// Close the navigation when clicking outside
onClickOutside(navigationMobileRef, () => {
  if (isOpen.value) {
    onToggleNavigation();
  }
});
</script>

<template>
  <div
    id="header-navigation-mobile"
    ref="navigationMobileRef"
    :class="['navigation-mobile', { opened: isOpen }]"
  >
    <button
      class="navigation-mobile__button"
      @pointerup.prevent="onToggleNavigation"
    >
      <span class="text">psychoactive®</span>
      <div class="icon-wrapper">
        <span class="icon-text">MENU</span>
        <IconMenuDots class="icon" />
      </div>
    </button>
    <div class="navigation-mobile__background">
      <NuxtLink
        to="/"
        class="navigation-mobile__logo"
        aria-label="Psychoactive Studios — home"
        @click="onToggleNavigation"
      >
        <span ref="lottieLogoContainerRef" aria-hidden="true" />
      </NuxtLink>
    </div>
    <div class="navigation-mobile__wrapper">
      <div class="navigation-mobile__talk">
        <NuxtLink href="/contact" class="navigation-mobile__talk-button" @click="onToggleNavigation">let's talk</NuxtLink>
      </div>
      <ul class="navigation-mobile__list">
        <li class="navigation-mobile__item heading-h2--mobile-menu">
          <LinkWithHover href="/" @click="onToggleNavigation">
            Home
          </LinkWithHover>
          <div class="navigation-mobile__item-line">
            <span class="line" />
          </div>
        </li>

        <li
          v-for="item in navigationData.filter(item => !item.hidden)"
          :key="item.id"
          class="navigation-mobile__item heading-h2--mobile-menu"
        >
          <LinkWithHover
            :href="item.url"
            :data-sup="item.sup || null"
            @click="onToggleNavigation"
          >
            {{ item.title }}
          </LinkWithHover>
          <div class="navigation-mobile__item-line">
            <span class="line" />
          </div>
        </li>
        <!-- <li class="navigation-mobile__item">
          <LinkWithHover href="/work" @click="onToggleNavigation">
            Work
          </LinkWithHover>
          <div class="navigation-mobile__item-line">
            <span class="line" />
          </div>
        </li>
        <li class="navigation-mobile__item">
          <LinkWithHover href="/services" @click="onToggleNavigation">
            Services
          </LinkWithHover>
          <div class="navigation-mobile__item-line">
            <span class="line" />
          </div>
        </li>
        <li class="navigation-mobile__item">
          <LinkWithHover href="/webflow" @click="onToggleNavigation">
            Webflow
          </LinkWithHover>
          <div class="navigation-mobile__item-line">
            <span class="line" />
          </div>
        </li>
        <li class="navigation-mobile__item">
          <LinkWithHover href="/content-hub" @click="onToggleNavigation">
            Content
          </LinkWithHover>
          <div class="navigation-mobile__item-line">
            <span class="line" />
          </div>
        </li> -->
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
.navigation-mobile {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  left: 1rem;
  z-index: 101;
  color: $color-background;
  padding-bottom: 42px;
  border-radius: 1rem;
  overflow: hidden;
  pointer-events: none;
  min-height: 560px;
  height: 75%;
  &.opened {
    pointer-events: all;
  }
  &__button {
    width: 100%;
    height: 42px;
    // background-color: $color-foreground;
    border-radius: 1rem;
    color: $color-background;
    font-family: 'RoobertMono', sans-serif;
    font-size: getRem(14);
    font-weight: 500;
    text-transform: uppercase;
    justify-content: space-between;
    padding: 0 getRem(14) 0 getRem(58);
    margin-top: auto;
    position: absolute;
    bottom: 0;
    transform-origin: center;
    pointer-events: all;
    .icon-wrapper {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      .icon-text {
        font-family: 'RoobertMono', sans-serif;
        font-size: 14px;
        font-style: normal;
        font-weight: 500;
        line-height: 146%; /* 20.44px */
        text-transform: uppercase;
      }
    }
  }
  &__background {
    background-color: #f1f1f1;
    border-radius: 1rem;
    position: absolute;
    width: 100%;
    height: 42px;
    left: 0;
    bottom: 0;
    z-index: -1;
    will-change: height;
  }
  &__logo {
    width: 36px;
    height: 36px;
    position: absolute;
    top: 4px;
    left: 10px;
    transform: scale(0.72);
    img {
      width: 100%;
      height: 100%;
    }
  }
  &__wrapper {
    height: 100%;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0 100%);
  }
  &__talk {
    text-align: right;
    &-button {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      pointer-events: all;
      font-family: 'RoobertMono', sans-serif;
      font-size: 1rem;
      color: $color-foreground;
      cursor: pointer;
      padding: 0 24px;
      border-radius: 48px;
      position: relative;
      z-index: 1;
      text-transform: uppercase;
      width: 160px;
      height: 36px;
      font-size: getRem(14);
      font-weight: 600;
      white-space: nowrap;
      clip-path: inset(50% 0% round 36px);
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: $color-background;
        border-radius: 48px;
        z-index: -1;
        transition: scale 0.3s cubic-bezier(0.33, 1, 0.68, 1);
      }
      &:hover {
        &::before {
          scale: 0.85;
        }
      }
    }
  }
  &__list {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: getRem(32);
  }
  &__item {
    // font-size: clamp(48px, 3.646vw, 70px);
    line-height: 74%;
    display: flex;
    gap: 1.5vw;
    align-items: center;
    a[data-sup] {
      position: relative;
      &::after {
        content: attr(data-sup);
        display: inline-block;
        font-family: 'RoobertMono';
        font-size: 12px;
        font-style: normal;
        font-weight: 500;
        line-height: 100%;
        text-transform: uppercase;
        color: $color-background;
        letter-spacing: 1px;
        position: absolute;
        left: calc(100% + 8px);
        top: 0;
        opacity: 0.5;
      }
    }
    @include respond(mobile) {
      // font-size: getRem(36);
      line-height: 1;
      gap: getRem(12);
      margin-right: 8px;
    }
    &-line {
      flex-grow: 1;
      .line {
        display: block;
        height: 1px;
        background: rgbaColor(#000000, 10);
        margin-top: 0.5vw;
        position: relative;
        will-change: width;
        &::before {
          content: '';
          position: absolute;
          width: 7px;
          height: 7px;
          background-color: rgbaColor(#000000, 50);
          border-radius: 50%;
          top: -3px;
          left: -3px;
        }
        &::after {
          content: '';
          position: absolute;
          width: 7px;
          height: 7px;
          background-color: rgbaColor(#000000, 50);
          border-radius: 50%;
          top: -3px;
          right: -4px;
        }
      }
    }
  }
}
</style>
