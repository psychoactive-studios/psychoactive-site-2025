<script setup>
import gsap from 'gsap';
import IconPlus from '~/assets/icons/icon-plus-1.svg';
import LinkWithHover from '../ui/LinkWithHover.vue';
import useNavigation from '~/composables/useNavigation';

// Reactive state to track if the navigation is open
const isOpen = ref(false);

// Ref to the navigation DOM element
const { navigationMobileRef } = useNavigation();

const onToggleNavigation = () => {
  if (!isOpen.value) {
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
          rotate: 360,
          duration: 1.1,
          ease: 'expo.inOut',
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
          top: 3,
          left: 10,
          scale: 0.72,
          rotate: -360,
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
</script>

<template>
  <div
    ref="navigationMobileRef"
    :class="['navigation-mobile', { opened: isOpen }]"
  >
    <button class="navigation-mobile__button" @click="onToggleNavigation">
      <span class="text">psychoactive®</span>
      <IconPlus class="icon" />
    </button>
    <div class="navigation-mobile__background">
      <a href="" class="navigation-mobile__logo">
        <img src="/img/logo-1.svg" alt="Psychoactive" />
      </a>
    </div>
    <div class="navigation-mobile__wrapper">
      <div class="navigation-mobile__talk">
        <button class="navigation-mobile__talk-button">let's talk</button>
      </div>
      <ul class="navigation-mobile__list">
        <li class="navigation-mobile__item">
          <LinkWithHover href="/">About</LinkWithHover>
          <div class="navigation-mobile__item-line">
            <span class="line" />
          </div>
        </li>
        <li class="navigation-mobile__item">
          <LinkWithHover href="/">Work</LinkWithHover>
          <div class="navigation-mobile__item-line">
            <span class="line" />
          </div>
        </li>
        <li class="navigation-mobile__item">
          <LinkWithHover href="/">Services</LinkWithHover>
          <div class="navigation-mobile__item-line">
            <span class="line" />
          </div>
        </li>
        <li class="navigation-mobile__item">
          <LinkWithHover href="/">Webflow</LinkWithHover>
          <div class="navigation-mobile__item-line">
            <span class="line" />
          </div>
        </li>
        <li class="navigation-mobile__item">
          <LinkWithHover href="/">Content</LinkWithHover>
          <div class="navigation-mobile__item-line">
            <span class="line" />
          </div>
        </li>
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
  }
  &__background {
    background-color: $color-foreground;
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
    mix-blend-mode: difference;
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
    font-size: clamp(48px, 3.646vw, 70px);
    line-height: 74%;
    display: flex;
    gap: 1.5vw;
    align-items: center;
    @include respond(mobile) {
      font-size: getRem(36);
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
