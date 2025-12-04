<script setup>
import gsap from 'gsap';
import Circle from '../ui/Circle.vue';
import ServicesHero3DScene from '../ui/ServicesHero3DScene.vue';
import WebflowLabel from '../ui/WebflowLabel.vue';
import HeroCenterLine from './HeroCenterLine.vue';
import useLoader from '~/composables/useLoader';
import useScrollSmoother from '~/composables/useScrollSmoother';
import {
  heroInitAnimation,
  heroScrollAnimation,
} from '~/utils/animations/services.js';

const { isLoading } = useLoader();
const { scrollSmoother } = useScrollSmoother();

const containerRef = ref(null);
let ctx;

onMounted(() => {
  if (containerRef.value) {
    ctx = gsap.context(() => {}, containerRef.value);

    heroScrollAnimation(ctx, containerRef.value);

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
</script>

<template>
  <section ref="containerRef" class="hero">
    <div class="hero__wrapper">
      <div class="container">
        <div class="scene">
          <h1 class="title">OUR SERVICES</h1>
          <div class="circle--wrapper">
            <Circle class="circle" />
          </div>
          <div class="services-3d-scene--wrapper">
            <ServicesHero3DScene class="services-3d-scene" />
          </div>
          <HeroCenterLine />
          <div class="top-text">
            <p class="grey">for brands that</p>
            <p>dare to stand out</p>
          </div>
          <div class="bottom-text">
            <div class="bottom-text__shape">We shape</div>
            <div class="bottom-text__web">the Web</div>
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
  .container {
    @include flex-center;
    flex-direction: column;
    height: 100dvh;
  }
  .scene {
    width: 100%;
    aspect-ratio: 2;
    position: relative;
    @include flex-center;
    position: relative;
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
    .services-3d-scene--wrapper {
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
      .services-3d-scene {
        width: 100%;
        height: 100%;
        will-change: transform;
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
      .grey {
        color: white(80);
      }
    }
    .bottom-text {
      position: absolute;
      bottom: 0;
      left: 0;
      &__shape {
        font-size: 2.5vw;
        font-style: normal;
        font-weight: 400;
        line-height: 120%;
        letter-spacing: -0.02em;
        color: #cfcfd0;
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
      }
    }
    .right-label {
      position: absolute;
      right: 0;
      bottom: 0;
      &__svg {
        width: auto;
        height: clamp(36px, 2.5vw, 48px);
      }
    }
  }
}
</style>
