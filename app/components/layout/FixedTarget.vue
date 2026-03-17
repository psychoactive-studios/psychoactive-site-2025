<script setup>
import { stepperTextsData, stepperTitlesData } from '~/data/servicesData';
import HeroCenterLine from '../services/HeroCenterLine.vue';
import StepperPagination from '../services/StepperPagination.vue';
import { useMediaQuery } from '@vueuse/core';
import WebflowBlackLabel from '../ui/WebflowBlackLabel.vue';
import WorkScrollProgressCircle from '../ui/WorkScrollProgressCircle.vue';
import useWorks from '~/composables/useWorks.js';
import ClickCursor from '../ui/ClickCursor.vue';
import TopBackButton from '../ui/BackButton.vue';

const isMobile = useMediaQuery('(max-width: 768px)');
const { currentTransitionImage } = useWorks();
</script>
<template>
  <div>
    <section class="work-transition">
      <img v-if="currentTransitionImage" :src="currentTransitionImage" />
    </section>
    <WorkScrollProgressCircle />
    <TopBackButton />

    <ClickCursor />

    <section id="services-fixed-section" class="services">
      <!-- Fixed target for Services List animations -->
      <ClientOnly>
        <div v-if="!isMobile" class="services-list__video">
          <video
            id="services-list-video"
            class="services-list__video_player"
            src="/video/services_grid.mp4"
            loop
            muted
            playsinline
          />
        </div>

        <!-- Fixed target for Stepper animations -->
        <div v-if="!isMobile" id="stepper" class="services-stepper">
          <div class="container">
            <div class="stepper__scene">
              <div class="stepper__videos">
                <div class="stepper__videos_overlay" />
                <video
                  id="services-stepper-video-1"
                  class="video step-1"
                  src="/video/service_01.mp4"
                  loop
                  muted
                  playsinline
                />
                <video
                  id="services-stepper-video-2"
                  class="video step-2"
                  src="/video/service_02.mp4"
                  loop
                  muted
                  playsinline
                />
                <video
                  id="services-stepper-video-3"
                  class="video step-3"
                  src="/video/service_03.mp4"
                  loop
                  muted
                  playsinline
                />
                <video
                  id="services-stepper-video-4"
                  class="video step-4"
                  src="/video/service_04.mp4"
                  loop
                  muted
                  playsinline
                />
              </div>

              <div class="stepper__step-texts body">
                <div
                  v-for="item in stepperTextsData"
                  :key="item.id"
                  :class="`text ${item.id}`"
                >
                  {{ item.text }}
                </div>
              </div>
              <NuxtLink to="/webflow-enterprise-agency" class="stepper__label">
                <WebflowBlackLabel />
              </NuxtLink>
              <HeroCenterLine />
              <StepperPagination />
              <ul class="stepper__titles">
                <li
                  v-for="item in stepperTitlesData"
                  :key="item.number"
                  class="stepper__titles_title"
                >
                  <div class="title-number">{{ item.number }}</div>
                  <h2 class="title-text display-4xl">{{ item.title }}</h2>
                  <div class="title-right">
                    <ul class="title-services">
                      <li v-for="service in item.list" :key="service">
                        {{ service }}
                      </li>
                    </ul>
                    <div class="title-number">{{ item.number }}</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Fixed footer video -->
        <div v-if="!isMobile" class="stepper__footer-video">
          <video
            id="services-footer-video"
            class="video"
            src="/video/preview_reel.mp4"
            loop
            muted
            playsinline
          />
        </div>
      </ClientOnly>
    </section>
  </div>
</template>
<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;

section.work-transition {
  position: fixed;
  inset: 0;
  z-index: 10;
  pointer-events: none;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

// Serives page section styles
section.services {
  display: none;
  .services-list__video {
    width: calc((100% - 160px - 160px) * 0.4);
    aspect-ratio: 1;
    margin: auto;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    display: none;
    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      clip-path: circle(0% at 50% 50%);
    }
  }

  .services-stepper,
  .stepper {
    @include flex-center;
    display: none;
    transform-origin: center;
    background-color: $color-foreground;
    min-height: 100svh;
    position: fixed;
    inset: 0;
    -webkit-mask-image: radial-gradient(
      circle at center,
      black 0%,
      transparent 0%
    );
    mask-image: radial-gradient(circle at center, black 0%, transparent 0%);
    pointer-events: none;
    // TODO: remove zIndex
    // z-index: 5;

    &__label {
      position: fixed;
      top: 48px;
      right: 160px;
      height: 48px;
      pointer-events: all;
      & > svg {
        width: auto;
        height: 48px;
      }
      :deep(.label-border) {
        border-color: rgba(0, 0, 0, 0.2);
      }
      :deep(.label-background) {
        fill: rgba(0, 0, 0, 0.1);
      }
      :deep(.char) {
        fill: $color-background;
      }
      :deep(.shape) {
        fill: $color-background;
      }
    }

    &__videos {
      position: absolute;
      z-index: 1;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(0deg);
      width: 57.5%;
      aspect-ratio: 1;
      margin: auto;
      &_overlay {
        position: absolute;
        inset: 0;
        background: url('/img/video-player-dots-overlay.svg') repeat center;
        clip-path: circle(0% at 50% 50%);
        z-index: 10;
      }
      .video {
        width: 100%;
        height: 100%;
        object-fit: cover;
        clip-path: circle(0% at 50% 50%);
        position: absolute;
        inset: 0;
      }
    }

    &__scene {
      width: 100%;
      height: calc(85dvh);
      // aspect-ratio: 2;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }
    &__step-texts {
      position: absolute;
      top: 0;
      left: 0;
      font-size: clamp(16px, 1.25vw, 24px);
      width: 25%;
      color: $color-background;
      .text {
        position: absolute;
        width: 100%;
        &:deep(.char-center) {
          opacity: 0;
        }
      }
    }
    &__titles {
      position: absolute;
      z-index: 2;
      bottom: 0;
      left: 0;
      display: flex;
      gap: 5vw;
      color: $color-foreground;
      mix-blend-mode: difference;
      translate: 0%;
      &_title {
        display: flex;
        align-items: flex-end;
        .title-number {
          font-family: 'RoobertMono';
          font-size: max(0.833333vw, 14px);
          font-style: normal;
          font-weight: 500;
          line-height: 100%; /* 16px */
          letter-spacing: -0.32px;
          margin-bottom: 9.5vw;
        }
        .title-text {
          line-height: 77%;
          white-space: nowrap;
          opacity: 0.94;
        }
        .title-right {
          margin-left: 11.5vw;
          .title-number {
            margin-top: 3.15vw;
            margin-bottom: 0;
          }
        }
        .title-services {
          font-size: clamp(16px, 1.044vw, 20px);
          font-style: normal;
          font-weight: 400;
          line-height: 130%; /* 26px */
          & > li {
            white-space: nowrap;
          }
        }
      }
    }
    &__footer-video {
      display: none;
      position: fixed;
      inset: 0;
      -webkit-mask-image: radial-gradient(
        circle at center,
        black 0%,
        transparent 0%
      );
      mask-image: radial-gradient(circle at center, black 0%, transparent 0%);
      background-color: $color-background;
      .video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}
</style>
