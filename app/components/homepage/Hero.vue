<script setup lang="ts">
import { partnersData } from '~/data/partnersData';
import Circle from '../ui/Circle.vue';
import PlusIcon from '~/assets/icons/icon-plus.svg';
import VideoPlayer from '../ui/VideoPlayer.vue';
import HomeHero3DScene from '../ui/HomeHero3DScene.vue';
import gsap from 'gsap';

import { heroInitAnimation } from '~/utils';

const container = ref<HTMLElement | null>(null);
let ctx;

onMounted(() => {
  if (container.value) {
    ctx = gsap.context(() => {}, container.value);
    heroInitAnimation(ctx);
  }
});
</script>

<template>
  <div class="hero">
    <div ref="container" class="hero__intro">
      <section class="hero__intro_wrapper">
        <div class="scene">
          <Circle class="circle" />
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
            <a href="https://webflow.com/@Psychoactive-Studios" target="_blank">
              <img
                class="top-text__label"
                src="/img/Webflow_label.svg"
                alt=""
              />
            </a>
            <div class="top-text__agency">Digital First design agency</div>
            <div class="top-text__innovation grey-text">Innovate</div>
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
          <div class="bottom-text">
            <div class="bottom-text__imagine grey-text">Imagine</div>
            <div class="bottom-text__scale">
              scale
              <div class="bottom-text__scale-arrows">
                <span>&larr;</span><span>&rarr;</span>
              </div>
            </div>
          </div>
          <div class="dots-arrow">
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
          </div>

          <HomeHero3DScene class="homehero-3d-scene" />

          <VideoPlayer
            class="video-player homehero-prepared"
            preview="/video/short-planet-reel-ps.mp4"
            src="/video/short-planet-reel-ps.mp4"
            transparent-button
          />
        </div>
      </section>
      <section class="hero__intro_partners">
        <NuxtImg
          v-for="partner in partnersData"
          :key="partner.id"
          :src="partner.logo"
          :alt="partner.name"
          :class="partner.id"
        />
      </section>
    </div>
    <div class="hero__player">
      <h1 id="scooterok">Digital First design agency</h1>
    </div>
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
  &__intro {
    height: 100dvh;
    display: flex;
    flex-direction: column;
    padding: 0 0 48px 0;
    &_wrapper {
      flex-grow: 1;
      @include flex-center;
      .scene {
        aspect-ratio: 2.43;
        width: 100%;
        position: relative;
        will-change: transform;
        .psychoactive {
          position: absolute;
          z-index: 2;
          top: 0;
          left: 0;
          font-family: 'RoobertMono', sans-serif;
          color: white(50);
          font-size: 18px;
          font-style: normal;
          line-height: 1;
          text-transform: uppercase;
          padding: 0 48px 48px 0;
          &__horizontal {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            visibility: hidden;
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
            .psychoactive__icon {
              top: 100%;
            }
          }
          &__icon {
            position: absolute;
            width: 7px;
            height: 7px;
            stroke: white(50);
          }
        }
        .grey-text {
          color: $color-grey;
          font-size: 4.79vw;
          font-style: normal;
          font-weight: 400;
          line-height: 88%;
          letter-spacing: -0.2874vw;
          will-change: transform;
        }
        .circle {
          position: absolute;
          z-index: 1;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(30deg);
          width: 50%;
        }
        .top-text {
          position: absolute;
          z-index: 4;
          top: 0;
          right: 0;
          text-align: right;
          &__label {
            width: auto;
            height: 48px;
          }
          &__agency {
            font-family: 'RoobertMono', sans-serif;
            color: white(80);
            font-size: 18px;
            font-style: normal;
            line-height: 1;
            text-transform: uppercase;
            margin: 24px 0 32px 0;
          }
          &__innovation {
            line-height: 65%;
          }
        }
        .bottom-text {
          position: absolute;
          z-index: 2;
          bottom: 0;
          left: 0;
          &__imagine {
            line-height: 77%;
          }
          &__scale {
            color: $color-foreground;
            font-size: 12.6vw;
            font-style: normal;
            font-weight: 400;
            line-height: 77%;
            letter-spacing: -0.756vw;
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
              }
            }
            &--right {
              right: 0;
              .center__part_dot {
                right: 0;
              }
              .center__text {
                right: 0;
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
            &--play {
              left: 20%;
              top: 10px;
            }
            &--time {
              right: 20%;
              top: 10px;
            }
          }
        }
        .dots-arrow {
          position: absolute;
          z-index: 2;
          right: -3px;
          bottom: -3px;
          width: 62px;
          height: 62px;
          @include flex-center;
          visibility: hidden;
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
        }
        .homehero-3d-scene {
          position: absolute;
          z-index: 1;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 150%;
          will-change: transform;
        }
      }
    }
    &_partners {
      display: flex;
      justify-content: space-between;
      align-items: center;
      will-change: transform;
      img {
        height: auto;
        object-fit: contain;
      }
      .partner-super-ai {
        width: 6.5%;
      }
      .partner-adidas {
        width: 6.12%;
      }
      .partner-ray-white {
        width: 6.625%;
      }
      .partner-hellboy {
        width: 7.75%;
      }
      .partner-blackbird {
        width: 7.06%;
      }
      .partner-wow {
        width: 7.56%;
      }
      .partner-one {
        width: 7.75%;
      }
      .partner-all-blacks {
        width: 5.25%;
      }
      .partner-burgerfuel {
        width: 7%;
      }
      .partner-summer-game {
        width: 5.62%;
      }
    }
  }
  &__player {
    height: 100dvh;
    @include flex-center;
  }
}
</style>
