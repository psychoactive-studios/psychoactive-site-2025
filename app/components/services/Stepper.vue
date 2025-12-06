<script setup>
import { stepperTextsData, stepperTitlesData } from '~/data/servicesData';
import HeroCenterLine from './HeroCenterLine.vue';
import StepperPagination from './StepperPagination.vue';
import { stepperAnimation } from '~/utils/animations/services';
import gsap from 'gsap';

const containerRef = ref(null);
let ctx = null;

onMounted(async () => {
  ctx = gsap.context(() => {});
  await nextTick();
  stepperAnimation(ctx, containerRef.value);
});
</script>

<template>
  <div ref="containerRef" class="stepper">
    <ClientOnly>
      <Teleport to="#services-list-video-teleport">
        <div id="stepper" class="stepper__fixed">
          <!-- <div class="stepper__background" /> -->

          <div class="container">
            <div class="stepper__scene">
              <div class="stepper__videos">
                <div class="stepper__videos_overlay" />
                <video
                  class="video step-1"
                  src="/video/ps_service_01.mp4"
                  autoplay
                  loop
                  muted
                  playsinline
                />
                <video
                  class="video step-2"
                  src="/video/ps_service_03.mp4"
                  autoplay
                  loop
                  muted
                  playsinline
                />
                <video
                  class="video step-3"
                  src="/video/preview_reel.mp4"
                  autoplay
                  loop
                  muted
                  playsinline
                />
                <video
                  class="video step-4"
                  src="/video/ps_service_05.mp4"
                  autoplay
                  loop
                  muted
                  playsinline
                />
              </div>

              <div class="stepper__step-texts">
                <div
                  v-for="item in stepperTextsData"
                  :key="item.id"
                  :class="`text ${item.id}`"
                >
                  {{ item.text }}
                </div>
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
        <div class="stepper__footer-video">
          <video
            class="video"
            src="/video/preview_reel.mp4"
            autoplay
            loop
            muted
            playsinline
          />
        </div>
      </Teleport>
    </ClientOnly>

    <div class="stepper__trigger_intro" />
    <div class="stepper__trigger_step-1" />
    <div class="stepper__trigger_step-2" />
    <div class="stepper__trigger_step-3" />
    <div class="stepper__trigger_step-4" />
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;

.stepper {
  &__fixed {
    @include flex-center;
    background-color: $color-foreground;
    min-height: 100dvh;
    position: fixed;
    inset: 0;
    -webkit-mask-image: radial-gradient(
      circle at center,
      black 0%,
      transparent 0%
    );
    mask-image: radial-gradient(circle at center, black 0%, transparent 0%);
    // TODO: remove zIndex
    // z-index: 5;
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
    font-style: normal;
    font-weight: 400;
    line-height: 1.25; /* 125% */
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
  &__trigger {
    &_intro {
      height: 150dvh;
    }
    &_step-1 {
      height: 150dvh;
    }
    &_step-2 {
      height: 150dvh;
    }
    &_step-3 {
      height: 150dvh;
    }
    &_step-4 {
      height: 150dvh;
    }
  }
  &__footer-video {
    position: fixed;
    inset: 0;
    -webkit-mask-image: radial-gradient(
      circle at center,
      black 0%,
      transparent 0%
    );
    mask-image: radial-gradient(circle at center, black 0%, transparent 0%);
    .video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}
</style>
