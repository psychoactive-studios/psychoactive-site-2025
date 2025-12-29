<script setup>
import { SplitText } from 'gsap/SplitText';
import VideoPreview from '../ui/VideoPreview.vue';
import useNavigation from '~/composables/useNavigation';
import LinkWithHover from '../ui/LinkWithHover.vue';
import useAudioManager from '~/composables/useAudioManager';
import gsap from 'gsap';
import { navigationData } from '~/data/navigationData';

const { initNavigation, transitionFromNavigation } = useNavigation();
const { playInteractionSound } = useAudioManager();

let talkButtonHoverTween;

onMounted(() => {
  SplitText.create('#main-navigation .navigation__item a', {
    type: 'chars',
    charsClass: 'char-center',
  });
  initNavigation();
  talkButtonHoverTween = gsap.to('.navigation__talk_button', {
    duration: 0.5,
    ease: 'none',
    scrambleText: {
      text: '{original}',
      chars: '0123456789!@#$%^&*()-_=+[]{};:<>/?,.',
      tweenLength: false,
    },
  });
});

const talkButtonHoverHandler = () => {
  playInteractionSound();
  if (gsap.isTweening('.navigation__talk_button')) return;
  talkButtonHoverTween.restart();
};

const clickOnLinkHandler = (e) => {
  console.log('e', e.target);
  const isAnimating = gsap.getById('open-timeline-main')?.isActive();
  if (isAnimating) {
    e.preventDefault();
    return;
  }

  transitionFromNavigation.value = true;
  document.querySelector('#header-navigation-button').click();
  // scrollSmoother.value.stop();
};
</script>

<template>
  <nav
    id="main-navigation"
    ref="navigationRef"
    class="navigation"
    aria-label="Main navigation"
  >
    <div class="navigation__background" />
    <div class="navigation__wrapper">
      <div class="navigation__grid">
        <div class="navigation__video">
          <VideoPreview
            class="video-player"
            preview="/video/preview_reel.mp4"
            src="https://vjs.zencdn.net/v/oceans.mp4"
            :dots="false"
            :autoplay="false"
          />
        </div>
        <div class="navigation__menu">
          <ul class="navigation__list">
            <li
              v-for="item in navigationData"
              :key="item.id"
              class="navigation__item"
            >
              <LinkWithHover
                :href="item.url"
                @click.capture="clickOnLinkHandler"
                >{{ item.title }}</LinkWithHover
              >
              <div class="navigation__item-line">
                <span class="line" />
              </div>
            </li>
          </ul>
        </div>
        <div class="navigation__talk">
          <div class="navigation__talk_line">
            <span />
          </div>
          <button
            class="navigation__talk_button"
            @mouseenter="talkButtonHoverHandler"
            @focus="talkButtonHoverHandler"
          >
            Let’s talk
          </button>
          <div class="navigation__talk_line">
            <span />
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/functions' as *;

.navigation {
  color: $color-background;
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: 99;
  pointer-events: none;
  &__background {
    position: absolute;
    inset: 0;
    background-color: $color-foreground;
    z-index: -1;
    transform: scaleY(0);
    transform-origin: top;
    will-change: transform;
    pointer-events: none;
  }

  &__wrapper {
    @include flex-center;
    flex-direction: column;
    height: 100%;
    padding: 120px 48px;
    overflow: clip;
    clip-path: polygon(0 0, 100% 0, 100% 0%, 0 0%);
    will-change: transform, clip-path;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    @include respond(portrait) {
      padding: 170px 24px 48px 24px;
      @include respond(mobile) {
        padding: 80px 16px 16px 16px;
      }
    }
  }
  &__grid {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr; // Two 50% columns
    gap: 48px;
    align-items: center;
    pointer-events: all;
    @include respond(portrait) {
      display: flex;
      flex-direction: column;
      gap: 24px;
      height: 100%;
      justify-content: space-between;
    }
  }
  &__video {
    width: 100%;
    min-width: 0;
    @include respond(portrait) {
      order: 3;
      @include respond(mobile) {
        margin-top: auto;
      }
    }
    .video-player {
      aspect-ratio: 1.78;
    }
    // :deep(.video-player) {
    //   transform: translate3d(0, 0, 0);
    //   backface-visibility: hidden;
    //   will-change: transform, clip-path;
    //   .player__preview {
    //     transform: translate3d(0, 0, 0);
    //     backface-visibility: hidden;
    //   }
    //   video {
    //     transform: translate3d(0, 0, 0);
    //     backface-visibility: hidden;
    //   }
    // }
  }
  &__menu {
    min-width: 0;
  }
  &__list {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2.5vw;
    min-width: 0;
    @include respond(portrait) {
      order: 1;
      @include respond(mobile) {
        gap: getRem(24);
      }
    }
  }
  &__menu {
    @include respond(portrait) {
      width: 100%;
      @include respond(mobile) {
        margin: auto 0;
      }
    }
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
  &__talk {
    grid-column: span 2 / span 2;
    grid-row-start: 2;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 48px;
    position: absolute;
    bottom: 48px;
    left: 48px;
    right: 48px;
    @include respond(portrait) {
      width: 100%;
      order: 2;
      position: static;
      margin-right: 8px;
    }
    @include respond(mobile) {
      gap: getRem(12);
    }

    &_line {
      &:first-child {
        & > span {
          margin-left: auto;
        }
      }
      & > span {
        display: block;
        width: 100%;
        height: 1px;
        background: rgbaColor(#000000, 10);
        position: relative;
        will-change: width;
        &::before {
          content: '';
          position: absolute;
          width: 7px;
          height: 7px;
          background: rgbaColor(#000000, 50);
          border-radius: 50%;
          top: -3px;
          left: -3px;
        }
        &::after {
          content: '';
          position: absolute;
          width: 7px;
          height: 7px;
          background: rgbaColor(#000000, 50);
          border-radius: 50%;
          top: -3px;
          right: -3px;
        }
      }
    }

    &_button {
      pointer-events: all;
      font-family: 'RoobertMono', sans-serif;
      font-size: 1rem;
      color: $color-foreground;
      cursor: pointer;
      padding: 0 24px;
      border-radius: 48px;
      position: relative;
      z-index: 1;
      height: 64px;
      text-transform: uppercase;
      width: 212px;
      @include respond(mobile) {
        width: 180px;
        height: 36px;
        font-size: getRem(14);
      }
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
}
</style>
