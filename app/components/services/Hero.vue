<script setup>
import gsap from 'gsap';
import Circle from '../ui/Circle.vue';
import WebflowLabel from '../ui/WebflowLabel.vue';
import HeroCenterLine from './HeroCenterLine.vue';
import useLoader from '~/composables/useLoader';
import useScrollSmoother from '~/composables/useScrollSmoother';
import {
  heroInitAnimation,
  heroScrollAnimation,
} from '~/utils/animations/services.js';
import ServicesHero3DSceneMobile from '../ui/ServicesHero3DSceneMobile.vue';
import { useMediaQuery } from '@vueuse/core';
import ServicesHero3DScene from '../ui/ServicesHero3DScene.vue';

const { isLoading } = useLoader();
const { scrollSmoother } = useScrollSmoother();
const isMobile = useMediaQuery('(max-width: 768px)');

const containerRef = ref(null);
let ctx;

onMounted(() => {
  if (containerRef.value) {
    ctx = gsap.context(() => {}, containerRef.value);
    heroScrollAnimation(ctx, containerRef.value);
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
</script>

<template>
  <section ref="containerRef" class="hero">
    <div class="hero__wrapper">
      <div class="services-3d-scene--wrapper">
        <ServicesHero3DScene v-if="!isMobile" class="services-3d-scene" />
        <ServicesHero3DSceneMobile v-if="isMobile" class="services-3d-scene" />
      </div>
      <div class="container">
        <div class="scene">
          <h1 class="title">OUR SERVICES</h1>
          <div class="circle--wrapper">
            <Circle class="circle" />
          </div>
          <HeroCenterLine />
          <div class="top-text">
            <p class="grey">for brands that</p>
            <p>dare to stand out</p>
            <a
              href="https://webflow.com/@Psychoactive-Studios"
              target="_blank"
              class="top-text__label"
              @mouseenter="playInteractionSound"
              @focus="playInteractionSound"
            >
              <WebflowLabel class="right-label__svg" />
            </a>
          </div>
          <div class="bottom-text">
            <div class="bottom-text__shape">We shape</div>
            <div class="bottom-text__web">the Web</div>
            <div class="bottom-text__web-svg">
              <img src="/img/the-web.svg" alt="" />
            </div>
          </div>
          <div class="right-label">
            <a
              href="https://webflow.com/@Psychoactive-Studios"
              target="_blank"
              @mouseenter="playInteractionSound"
              @focus="playInteractionSound"
            >
              <WebflowLabel class="right-label__svg" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;
.hero {
  &__wrapper {
    position: relative;
    // height: 100dvh;
  }
  .container {
    @include flex-center;
    flex-direction: column;
    height: 100dvh;
    @include respond(portrait) {
      padding-top: 160px;
      padding-bottom: 48px;
    }
    @include respond(mobile) {
      padding-top: 24px;
      padding-bottom: 74px;
    }
  }
  .services-3d-scene--wrapper {
    position: absolute;
    z-index: 0;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100dvh;
    @include respond(portrait) {
      inset: 160px 48px 48px 48px;
      transform: translate(0);
      width: auto;
      height: auto;
    }
    @include respond(mobile) {
      inset: 0;
    }
    .services-3d-scene {
      width: 100%;
      height: 100%;
      will-change: transform;
    }
  }
  .scene {
    @include flex-center;
    width: 100%;
    aspect-ratio: 2;
    position: relative;
    pointer-events: none;
    position: relative;
    z-index: 1;
    @include respond(portrait) {
      aspect-ratio: auto;
      height: 100%;
    }
    .title {
      position: absolute;
      z-index: 2;
      top: 0;
      left: 0;
      font-family: 'RoobertMono', sans-serif;
      color: white(50);
      font-size: clamp(16px, 0.938vw, 18px);
      font-weight: 500;
      font-style: normal;
      line-height: 1;
      text-transform: uppercase;
      @include respond(mobile) {
        font-size: getRem(12);
      }
    }
    .circle--wrapper {
      position: absolute;
      z-index: 1;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(90deg);
      width: 60%;
      @include respond(mobile) {
        display: none;
      }
      .circle {
        width: 100%;
        height: 100%;
        &:deep(.circle-path-1) {
          stroke-dashoffset: 783.3;
        }
        &:deep(.circle-path-2) {
          stroke-dashoffset: 783.3;
        }
        &:deep(.circle-dots) {
          transform: rotate(-90deg);
          &::before {
            top: 50%;
          }
        }
      }
    }
    .top-text {
      position: absolute;
      top: 0;
      right: 0;
      font-size: 4.792vw;
      font-style: normal;
      font-weight: 400;
      line-height: 88%; /* 80.96px */
      letter-spacing: -0.06em;
      text-align: right;
      @include respond(mobile) {
        font-size: 8.55vw;
        line-height: 121%;
      }
      &__label {
        display: none;
        margin-top: 3.8vw;
        @include respond(mobile) {
          display: block;
          text-align: right;
          svg {
            margin-left: auto;
          }
        }
      }
      .grey {
        color: white(80);
      }
    }
    .bottom-text {
      position: absolute;
      bottom: 0;
      left: 0;
      @include respond(mobile) {
        width: 100%;
      }
      &__shape {
        font-size: 2.5vw;
        font-style: normal;
        font-weight: 400;
        line-height: 120%;
        letter-spacing: -0.02em;
        color: #cfcfd0;
        @include respond(mobile) {
          font-size: 8.55vw;
          line-height: 121%;
        }
      }
      &__web {
        font-size: 14.585vw;
        font-style: normal;
        font-weight: 400;
        line-height: 100%; /* 280px */
        letter-spacing: -0.07em;
        mix-blend-mode: difference;
        color: $color-foreground;
        margin-bottom: -0.11em;
        @include respond(mobile) {
          display: none;
        }
        &-svg {
          display: none;
          width: 100%;
          margin-top: 1vw;
          img {
            width: 100%;
          }
          @include respond(mobile) {
            display: block;
          }
        }
      }
    }
    .right-label {
      position: absolute;
      right: 0;
      bottom: 0;
      @include respond(mobile) {
        display: none;
      }
      &__svg {
        width: auto;
        height: clamp(36px, 2.5vw, 48px);
        pointer-events: all;
      }
    }
  }
}
</style>
