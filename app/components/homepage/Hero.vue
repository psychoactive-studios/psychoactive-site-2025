<script setup lang="ts">
import { partnersData } from '~/data/partnersData';
import Circle from '../ui/Circle.vue';
import PlusIcon from '~/assets/icons/icon-plus.svg';
import DotsArrowIcon from '~/assets/icons/icon-dots-arrow-down.svg';
import VideoPlayer from '../ui/VideoPlayer.vue';
</script>

<template>
  <div class="hero">
    <div class="hero__intro">
      <section class="hero__intro_wrapper">
        <div class="scene">
          <Circle class="circle" />
          <div class="psychoactive">
            psychoactive®
            <PlusIcon class="psychoactive__icon psychoactive__icon--right" />
            <PlusIcon class="psychoactive__icon psychoactive__icon--bottom" />
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
          <div class="line">
            <div class="line__text line__text--left">-41.2925°</div>
            <div class="line__text line__text--right">174.7783°</div>
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
            <DotsArrowIcon class="dots-arrow__icon" />
            <PlusIcon class="dots-arrow__plus dots-arrow__plus--tr" />
            <PlusIcon class="dots-arrow__plus dots-arrow__plus--br" />
            <PlusIcon class="dots-arrow__plus dots-arrow__plus--bl" />
          </div>

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
    <div class="hero__player">222</div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;
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
        border: 2px dashed white(40);
        width: 100%;
        position: relative;
        .psychoactive {
          position: absolute;
          top: 0;
          left: 0;
          font-family: 'RoobertMono', sans-serif;
          color: white(50);
          font-size: 18px;
          font-style: normal;
          line-height: 1;
          text-transform: uppercase;
          padding: 0 48px 48px 0;
          &__icon {
            position: absolute;
            width: 7px;
            height: 7px;
            stroke: white(50);
            &--right {
              top: 0;
              right: 0;
            }
            &--bottom {
              bottom: 0;
              left: -3px;
            }
          }
        }
        .grey-text {
          color: $color-grey;
          font-size: 4.79vw;
          font-style: normal;
          font-weight: 400;
          line-height: 88%;
          letter-spacing: -0.2874vw;
        }
        .circle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(30deg);
          width: 50%;
        }
        .top-text {
          position: absolute;
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
              position: absolute;
              top: 0;
              left: 95%;
              letter-spacing: -1.5vw;
            }
          }
        }
        .line {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: white(10);
          &::before,
          &::after {
            content: '';
            position: absolute;
            top: -3px;
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: $color-dots;
          }
          &::before {
            left: -3px;
          }
          &::after {
            right: -3px;
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
            &--left {
              left: 0;
              top: 10px;
            }
            &--right {
              right: 0;
              top: 10px;
            }
          }
        }
        .dots-arrow {
          position: absolute;
          right: -3px;
          bottom: -3px;
          width: 62px;
          height: 62px;
          @include flex-center;
          &__icon {
            width: 16px;
            height: auto;
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
        }
        .video-player {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          aspect-ratio: 2.22;
        }
      }
    }
    &_partners {
      display: flex;
      justify-content: space-between;
      align-items: center;
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
