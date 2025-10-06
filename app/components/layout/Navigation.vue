<script setup lang="ts">
import { SplitText } from 'gsap/SplitText';
import VideoPreview from '../ui/VideoPreview.vue';
import useNavigation from '~/composables/useNavigation';

const { navigationRef, initNavigation } = useNavigation();

onMounted(() => {
  SplitText.create(
    '#main-navigation .navigation__item a, .navigation__talk_button',
    {
      type: 'chars',
      charsClass: 'char-center',
    }
  );
  initNavigation();
});
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
            <li class="navigation__item">
              <a href="/">About</a>
              <div class="navigation__item-line">
                <span class="line" />
              </div>
            </li>
            <li class="navigation__item">
              <a href="/">Work</a>
              <div class="navigation__item-line">
                <span class="line" />
              </div>
            </li>
            <li class="navigation__item">
              <a href="/">Services</a>
              <div class="navigation__item-line">
                <span class="line" />
              </div>
            </li>
            <li class="navigation__item">
              <a href="/">Webflow</a>
              <div class="navigation__item-line">
                <span class="line" />
              </div>
            </li>
            <li class="navigation__item">
              <a href="/">Content</a>
              <div class="navigation__item-line">
                <span class="line" />
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="navigation__talk">
        <div class="navigation__talk_line">
          <span />
        </div>
        <button class="navigation__talk_button">Let’s talk</button>
        <div class="navigation__talk_line">
          <span />
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
  z-index: 100;
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
  }
  &__grid {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr; // Two 50% columns
    gap: 48px;
    align-items: center;
    pointer-events: all;
  }
  &__video {
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
  }
  &__list {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2.5vw;
  }
  &__item {
    font-size: clamp(48px, 3.646vw, 70px);
    line-height: 74%;
    display: flex;
    gap: 1.5vw;
    align-items: center;
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
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 48px;
    position: absolute;
    bottom: 48px;
    left: 48px;
    right: 48px;

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
      padding: 0 56px;
      border-radius: 48px;
      position: relative;
      z-index: 1;
      height: 64px;
      text-transform: uppercase;
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
