<script setup>
import Circle from '../ui/Circle.vue';
import PlusIcon from '~/assets/icons/icon-plus.svg';
import ServicesHero3DScene from '../ui/ServicesHero3DScene.vue';
import gsap from 'gsap';
import useVideoPlayer from '~/composables/useVideoPlayer';
import useLoader from '~/composables/useLoader';

import {
  heroInitSplitText,
  heroInitAnimation,
  heroScrollAnimation,
} from '~/utils';
import VideoPreview from '../ui/VideoPreview.vue';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useScrollSmoother from '~/composables/useScrollSmoother';
import useAudioManager from '~/composables/useAudioManager';
import WebflowBlackLabel from '../ui/WebflowBlackLabel.vue';

const { disableScroll, scrollSmoother } = useScrollSmoother();
const { onPlayerOpen } = useVideoPlayer();
const { playInteractionSound } = useAudioManager();
const { isLoading } = useLoader();

const container = ref(null);
const isPlaying = ref(true);
let ctx;

onMounted(() => {
  if (container.value) {
    ctx = gsap.context(() => {}, container.value);

    heroInitSplitText();
    heroScrollAnimation(ctx, isPlaying);

    // heroInitAnimation(ctx, scrollSmoother);
  }
});

onUnmounted(() => {
  ctx.revert();
});

watch(isLoading, (newVal) => {
  if (!newVal) {
    heroInitAnimation(ctx, scrollSmoother);
  }
});

// const MAX_SCROLL_DURATION = 1.5; // Maximum duration (in seconds) for scroll animation

const onPlayVideoHandler = (playerContainerRef) => {
  // Get ScrollTrigger by ID
  const trigger = ScrollTrigger.getById('homepage-hero-scrolltrigger');

  // Calculate the target scroll position based on progress
  const y = trigger?.end;

  gsap
    .timeline()
    .add(() => {
      disableScroll();
      onPlayerOpen(playerContainerRef);
    })
    .add(() => {
      scrollSmoother.value.scrollTo(y, {
        immediate: true,
        lock: true,
        force: true,
      });
    }, '+=2');

  //

  // Duration is proportional to the remaining scroll distance
  // const duration = MAX_SCROLL_DURATION * (1 - progress);

  // Smoothly scroll to the target position and then open the video player
  // gsap
  //   .timeline()
  //   .to(scrollSmoother.value, {
  //     scrollTop: y,
  //     duration,
  //     ease: 'power3.inOut',
  //     onComplete: () => disableScroll(),
  //   })
  //   .add(() => onPlayerOpen(playerContainerRef));
};

const onScrollDownHandler = () => {
  // Get ScrollTrigger by ID
  const trigger = ScrollTrigger.getById('homepage-hero-scrolltrigger');
  if (!scrollSmoother.value || !trigger) return;
  // Check if scrollSmoother and trigger exist
  const y = trigger?.end;

  scrollSmoother.value.scrollTo(y, {
    duration: 1.5,
    force: true,
    easing: (x) =>
      x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2,
  });
};
</script>

<template>
  <div ref="container" class="hero">
    <div class="hero__intro">
      <section class="hero__intro_wrapper">
        <div class="homehero-3d-scene--wrapper">
          <ServicesHero3DScene
            :is-playing="isPlaying"
            class="homehero-3d-scene"
          />
          <!-- <HomeHero3DScene class="homehero-3d-scene" /> -->
        </div>
        <div class="scene">
          <div class="circle--wrapper">
            <Circle class="circle" />
          </div>
          <div class="psychoactive">
            <div class="psychoactive__text">psychoactive®</div>
            <div class="psychoactive__horizontal">
              <PlusIcon class="psychoactive__icon" />
            </div>
            <div class="psychoactive__vertical">
              <PlusIcon class="psychoactive__icon" />
            </div>
          </div>
          <div class="top-text">
            <div class="top-text__agency">Digital-First design agency</div>
            <div class="top-text__innovation grey-text">innovate</div>
            <a
              href="https://webflow.com/@Psychoactive-Studios"
              target="_blank"
              @mouseenter="playInteractionSound"
              @focus="playInteractionSound"
            >
              <!-- <WebflowLabel class="top-text__label" /> -->
              <WebflowBlackLabel class="top-text__label" />
            </a>
          </div>
          <div class="center">
            <div class="center__line" />
            <div class="center__part center__part--left">
              <div class="center__part_dot" />
              <div class="center__text">-41.2925°</div>
            </div>
            <div class="center__part center__part--right">
              <div class="center__part_dot" />
              <div class="center__text">174.7783°</div>
            </div>
            <div class="center__text center__text--play">PLAY REEL</div>
            <div class="center__text center__text--time">01:16 SEC</div>
          </div>
          <button
            class="dots-arrow"
            aria-label="Scroll down"
            @click="onScrollDownHandler"
            @mouseenter="playInteractionSound"
            @focus="playInteractionSound"
          >
            <div class="dots-arrow__icon">
              <span class="dots-arrow__icon_dot dots-arrow__icon_dot--1" />
              <span class="dots-arrow__icon_dot dots-arrow__icon_dot--2" />
              <span class="dots-arrow__icon_dot dots-arrow__icon_dot--3" />
            </div>
            <div class="dots-arrow__horizontal">
              <PlusIcon class="dots-arrow__plus" />
            </div>
            <div class="dots-arrow__vertical">
              <PlusIcon class="dots-arrow__plus" />
            </div>
            <PlusIcon class="dots-arrow__plus dots-arrow__plus--br" />
          </button>

          <VideoPreview
            class="video-player homehero-prepared"
            preview="/video/preview_reel.mp4"
            src="https://vjs.zencdn.net/v/oceans.mp4"
            transparent-button
            :custom-handler="onPlayVideoHandler"
            aspect-ratio="2.22"
          />
          <div class="bottom-text">
            <div class="bottom-text__imagine grey-text">Imagine</div>
            <div class="bottom-text__scale">
              scale
              <div class="bottom-text__scale-arrows">
                <span>&larr;</span><span>&rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    <!-- <div class="hero__player" /> -->
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;

.hero__player {
  * {
    fill: #fff;
  }
}
.hero {
  @include respond(mobile) {
    display: none;
  }
  &__intro {
    height: 100dvh;
    display: flex;
    flex-direction: column;
    padding: 0;
    // padding: 0 0 48px 0;
    &_wrapper {
      flex-grow: 1;
      position: relative;
      @include flex-center;
      // padding-left: clamp(88px, 8vw, 160px);
      // padding-right: clamp(88px, 8vw, 160px);
      padding-left: 160px;
      padding-right: 160px;
      @include respond(portrait) {
        padding-top: 160px;
        padding-bottom: 48px;
        padding-left: 24px;
        padding-right: 24px;
      }
      @include respond(mobile) {
        padding-top: 27px;
        padding-bottom: 24px;
      }
      .homehero-3d-scene--wrapper {
        position: absolute;
        z-index: 1;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        height: 100%;
        @include respond(portrait) {
          height: auto;
          aspect-ratio: 1;
        }
        @include respond(mobile) {
          display: none;
        }
        .homehero-3d-scene {
          width: 100%;
          height: 100%;
          will-change: transform;
        }
      }
      .scene {
        aspect-ratio: 2;
        width: 100%;
        position: relative;
        z-index: 1;
        will-change: transform;
        pointer-events: none;
        @include respond(portrait) {
          aspect-ratio: auto;
          height: 100%;
        }
        @include respond(mobile) {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          padding-top: 24px;
        }
        .psychoactive {
          position: absolute;
          z-index: 2;
          top: 0;
          left: 0;
          font-family: 'RoobertMono', sans-serif;
          color: white(50);
          font-size: clamp(16px, 0.938vw, 18px);
          font-style: normal;
          line-height: 1;
          text-transform: uppercase;
          padding: 0 48px 48px 0;
          @include respond(mobile) {
            right: 0;
            text-align: center;
            font-size: clamp(14px, 0.938vw, 18px);
            padding: 0;
          }
          &__horizontal {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            visibility: hidden;
            @include respond(mobile) {
              display: none;
            }
            .psychoactive__icon {
              left: 100%;
            }
          }
          &__vertical {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 7px;
            visibility: hidden;
            @include respond(mobile) {
              display: none;
            }
            .psychoactive__icon {
              top: 100%;
            }
          }
          &__icon {
            position: absolute;
            width: 7px;
            height: 7px;
            color: white(50);
          }
        }
        .grey-text {
          color: $color-grey;
          font-size: clamp(48px, 4.79vw, 92px);
          font-style: normal;
          font-weight: 400;
          line-height: 88%;
          letter-spacing: -0.2874vw;
          will-change: transform;
          @include respond(mobile) {
            font-size: clamp(36px, 9.6vw, 48px);
          }
        }
        .circle--wrapper {
          position: absolute;
          z-index: 1;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(30deg);
          width: 50%;
          @include respond(mobile) {
            display: none;
          }
          .circle {
            width: 100%;
            height: 100%;
          }
        }

        .top-text {
          position: absolute;
          z-index: 4;
          top: 0;
          right: 0;
          text-align: right;
          @include respond(mobile) {
            position: static;
          }
          &__agency {
            font-family: 'RoobertMono';
            font-size: 16px;
            font-style: normal;
            font-weight: 500;
            line-height: 100%; /* 16px */
            text-transform: uppercase;
            opacity: 0.5;
            @include respond(mobile) {
              font-size: 14px;
              margin: 20px 0 16px 0;
            }
          }
          &__innovation {
            margin-bottom: 24px;
          }
          &__label {
            width: auto;
            height: clamp(36px, 2.5vw, 48px);
            margin-left: auto;
            pointer-events: all;
          }
        }
        .bottom-text {
          position: absolute;
          z-index: 2;
          bottom: 0;
          left: 0;
          @include respond(mobile) {
            position: static;
            align-self: flex-start;
          }
          &__imagine {
            line-height: 77%;
          }
          &__scale {
            color: $color-foreground;
            font-size: clamp(128px, 12.6vw, 242px);
            font-style: normal;
            font-weight: 400;
            line-height: 77%;
            letter-spacing: -0.756vw;
            @include respond(mobile) {
              font-size: clamp(84px, 22vw, 112px);
            }
            &-arrows {
              color: $color-grey;
              font-size: 5.5vw;
              line-height: 0.5;
              position: absolute;
              top: 0;
              left: 95%;
              letter-spacing: -1.5vw;
            }
          }
        }
        .center {
          position: absolute;
          z-index: 2;
          top: 50%;
          left: 0;
          right: 0;
          @include respond(mobile) {
            display: none;
          }
          &__line {
            background: white(10);
            height: 1px;
            will-change: transform;
          }
          &__part {
            position: absolute;
            top: 0;
            width: 50%;
            will-change: transform;
            .center__text {
              top: 10px;
            }
            &_dot {
              width: 7px;
              height: 7px;
              border-radius: 50%;
              background: $color-dots;
              position: absolute;
              top: -3px;
            }
            &--left {
              left: 0;
              .center__part_dot {
                left: 0;
              }
              .center__text {
                left: 0;
                @include respond(portrait) {
                  display: none;
                }
              }
            }
            &--right {
              right: 0;
              .center__part_dot {
                right: 0;
              }
              .center__text {
                right: 0;
                @include respond(portrait) {
                  display: none;
                }
              }
            }
          }

          &__text {
            color: white(80);
            font-family: 'RoobertMono', sans-serif;
            font-size: 12px;
            font-style: normal;
            line-height: 1;
            text-transform: uppercase;
            opacity: 0.5;
            position: absolute;
            @include respond(portrait) {
            }
            &--play {
              left: 20%;
              top: 10px;
              @include respond(portrait) {
                left: 0%;
              }
            }
            &--time {
              right: 20%;
              top: 10px;
              @include respond(portrait) {
                right: 0%;
              }
            }
          }
        }
        .dots-arrow {
          position: absolute;
          z-index: 5;
          right: -3px;
          bottom: -3px;
          width: 62px;
          height: 62px;
          @include flex-center;
          visibility: hidden;
          pointer-events: all;
          @include respond(mobile) {
            display: none;
          }
          &:hover {
            .dots-arrow__icon {
              &_dot {
                &--1 {
                  animation: flicker-effect-1 0.6s ease;
                }
                &--2 {
                  animation: flicker-effect-3 0.6s ease;
                }
                &--3 {
                  animation: flicker-effect-5 0.6s ease;
                }
              }
            }
          }
          &__icon {
            width: 16px;
            height: 16px;
            position: relative;
            &_dot {
              display: block;
              width: 6px;
              height: 6px;
              border-radius: 50%;
              position: absolute;
              background-color: $color-foreground;
              &--1 {
                top: 2px;
                left: 1px;
              }
              &--2 {
                top: 2px;
                right: 1px;
              }
              &--3 {
                bottom: 1px;
                left: calc(50% - 3px);
              }
            }
          }
          &__plus {
            position: absolute;
            width: 7px;
            height: 7px;
            color: white(50);
            &--tr {
              top: 0;
              right: 0;
            }
            &--br {
              bottom: 0;
              right: 0;
            }
            &--bl {
              bottom: 0;
              left: 0;
            }
          }
          &__horizontal {
            position: absolute;
            bottom: 0.125em;
            right: 0;
            width: 100%;
            height: 7px;
          }
          &__vertical {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 7px;
            height: 100%;
          }
        }
        .video-player {
          position: absolute;
          z-index: 3;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          aspect-ratio: 2.22;
          @include respond(mobile) {
            position: relative;
            top: 0 !important;
            left: 0;
            transform: none;
          }
        }
      }
    }
  }
  // &__player {
  //   background-color: red;
  //   height: calc(100vh - 48px - 48px);
  // }
}
</style>
