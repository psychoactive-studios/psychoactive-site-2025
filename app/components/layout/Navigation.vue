<script setup lang="ts">
import VideoPreview from '../ui/VideoPreview.vue';
</script>

<template>
  <div class="navigation">
    <button id="header-navigation-button" class="navigation__button">
      <span class="dot dot-1" />
      <span class="dot dot-2" />
      <span class="dot dot-3" />
      <span class="dot dot-4" />
    </button>
    <nav class="navigation-body" aria-label="Main navigation">
      <div class="navigation__wrapper">
        <div class="navigation__grid">
          <div class="navigation__video">
            <VideoPreview
              class="video-player"
              preview="/video/short-planet-reel-ps.mp4"
              src="https://vjs.zencdn.net/v/oceans.mp4"
              :dots="false"
            />
          </div>
          <div class="navigation__menu">
            <ul class="navigation__list">
              <li class="navigation__item">
                <a href="/">About</a>
                <div class="navigation__item-line">
                  <span class="dot-l" />
                  <span class="dot-r" />
                </div>
              </li>
              <li class="navigation__item">
                <a href="/">Work</a>
                <div class="navigation__item-line">
                  <span class="dot dot-l" />
                  <span class="dot dot-r" />
                </div>
              </li>
              <li class="navigation__item">
                <a href="/">Services</a>
                <div class="navigation__item-line">
                  <span class="dot dot-l" />
                  <span class="dot dot-r" />
                </div>
              </li>
              <li class="navigation__item">
                <a href="/">Webflow</a>
                <div class="navigation__item-line">
                  <span class="dot dot-l" />
                  <span class="dot dot-r" />
                </div>
              </li>
              <li class="navigation__item">
                <a href="/">Content</a>
                <div class="navigation__item-line">
                  <span class="dot dot-l" />
                  <span class="dot dot-r" />
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
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/functions' as *;

$flicker-time: 0.5s;
$flicker-ease: ease;

.navigation {
  color: $color-background;
  &__button {
    position: fixed;
    top: 48px;
    right: 48px;
    width: 48px;
    height: 48px;
    color: $color-background;
    border-radius: 50%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    place-items: center;
    gap: 2px;
    z-index: 1000;
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background-color: $color-foreground;
      transition: opacity 0.3s ease;
      z-index: 0;
      transition: scale 0.3s cubic-bezier(0.33, 1, 0.68, 1);
    }
    & > span {
      width: 6px;
      height: 6px;
      background: currentColor;
      border-radius: 50%;
      position: relative;
      z-index: 1;
      &:nth-child(1) {
        align-self: self-end;
        justify-self: self-end;
      }
      &:nth-child(2) {
        align-self: self-end;
        justify-self: self-start;
      }
      &:nth-child(3) {
        align-self: self-start;
        justify-self: self-end;
      }
      &:nth-child(4) {
        align-self: self-start;
        justify-self: self-start;
      }
    }
    &:hover {
      &::before {
        scale: 0.85;
      }
      .dot {
        &-1 {
          animation: flicker-effect-1 $flicker-time $flicker-ease;
        }
        &-2 {
          animation: flicker-effect-2 $flicker-time $flicker-ease;
        }
        &-3 {
          animation: flicker-effect-3 $flicker-time $flicker-ease;
        }
        &-4 {
          animation: flicker-effect-4 $flicker-time $flicker-ease;
        }
        &-5 {
          animation: flicker-effect-5 $flicker-time $flicker-ease;
        }
      }
    }
  }
  .navigation-body {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 0vh;
    overflow: hidden;
    z-index: 999;
  }
  &__wrapper {
    @include flex-center;
    flex-direction: column;
    background-color: $color-foreground;
    height: 100%;
    padding: 120px 48px;
  }
  &__grid {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr; // Two 50% columns
    gap: 48px;
    align-items: center;
  }
  &__video {
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
      height: 1px;
      background: rgbaColor(#000000, 10);
      margin-top: 0.5vw;
      position: relative;
      .dot {
        display: block;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background-color: rgbaColor(#000000, 50);
        position: absolute;
        top: -3px;
        &.dot-l {
          left: -3px;
        }
        &.dot-r {
          right: -3px;
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
      & > span {
        display: block;
        width: 100%;
        height: 1px;
        background: rgbaColor(#000000, 10);
        position: relative;
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
