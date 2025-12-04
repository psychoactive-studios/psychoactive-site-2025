<script setup>
import { stepperTitlesData } from '~/data/servicesData';
import HeroCenterLine from './HeroCenterLine.vue';
import StepperPagination from './StepperPagination.vue';
</script>

<template>
  <div id="stepper" class="stepper">
    <div class="container">
      <div class="stepper__scene">
        <div class="stepper__start-video">
          <video
            class="hero-mobile__player_preview"
            src="/video/preview_reel.mp4"
            autoplay
            loop
            muted
            playsinline
          />
        </div>

        <div class="stepper__step-text">
          We start by defining your digital DNA. Strategy, identity, content and
          messaging built for growth.
        </div>
        <HeroCenterLine />
        <StepperPagination />
        <ul class="stepper__titles">
          <li
            v-for="item in stepperTitlesData"
            :key="item.number"
            class="stepper__titles_title"
          >
            <div class="title-number">{{ item.number }}</div>
            <h2 class="title-text">{{ item.title }}</h2>
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
</template>

<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;
.stepper {
  @include flex-center;
  min-height: 100dvh;
  background-color: $color-foreground;
  &__start-video {
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
    width: 57.5%;
    aspect-ratio: 1;
    clip-path: circle(50% at 50% 50%);
    margin: auto;
    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
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
    border: 2px dashed rgb(29 0 40 / 25%);
  }
  &__step-text {
    position: absolute;
    top: 0;
    left: 0;
    font-size: clamp(16px, 1.25vw, 24px);
    font-style: normal;
    font-weight: 400;
    line-height: 1.25; /* 125% */
    width: 25%;
    color: $color-background;
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
        font-size: 14.588vw;
        font-style: normal;
        font-weight: 400;
        line-height: 77%;
        letter-spacing: -0.07em;
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
}
</style>
