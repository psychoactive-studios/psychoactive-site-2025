<script setup>
import { useMediaQuery } from '@vueuse/core';
import gsap from 'gsap';
import { listData } from '~/data/servicesData';
import { servicesListAnimation } from '~/utils/animations/services';

const isMobile = useMediaQuery('(max-width: 768px)');

const containerRef = ref(null);
let ctx = null;

onMounted(async () => {
  await nextTick();
  ctx = gsap.context(() => {}, containerRef.value);
  servicesListAnimation(ctx, containerRef.value);
});

onUnmounted(() => {
  if (ctx) ctx.revert();
});
</script>

<template>
  <div ref="containerRef" class="services-list">
    <div class="container">
      <ClientOnly>
        <div v-if="isMobile" class="services-list__video">
          <video
            class="services-list__video_player"
            src="/video/services_grid.mp4"
            autoplay
            loop
            muted
            playsinline
          />
        </div>
      </ClientOnly>
      <ul class="services-list__items">
        <li
          v-for="item in listData"
          :key="item.title"
          class="services-list__item"
        >
          <h3 class="services-list__item_title subheader--mobile">
            {{ item.title }}
          </h3>
          <div class="services-list__item_divider">
            <span class="line" />
          </div>
          <div class="services-list__item_description body-large--mobile">
            {{ item.description }}
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;
.services-list {
  padding: 50dvh 0 30dvh 0;
  @include respond(mobile) {
    padding: 120px 0;
  }
  &__video {
    aspect-ratio: 1;
    margin: 0 1rem;
    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      clip-path: circle(50% at 50% 50%);
    }
  }
  &__items {
    display: flex;
    flex-direction: column;
    gap: 423px;
    @include respond(mobile) {
      margin-top: 64px;
      gap: 64px;
    }
  }
  &__item {
    display: flex;
    gap: getRem(24);
    @include respond(mobile) {
      flex-direction: column;
    }
    &_title {
      white-space: nowrap;
      margin-top: 0.4rem;
      color: white(50);
    }
    &_divider {
      flex-grow: 1;
      @include respond(mobile) {
        display: none;
      }
      .line {
        display: block;
        height: 1px;
        background: rgba(217, 217, 217, 0.2);
        position: relative;
        will-change: width;
        mix-blend-mode: difference;
        margin-top: 0.9rem;
        &::before,
        &::after {
          content: '';
          position: absolute;
          width: 7px;
          height: 7px;
          background-color: $color-dots;
          border-radius: 50%;
        }
        &::before {
          top: -3px;
          left: -3px;
        }
        &::after {
          top: -3px;
          right: -4px;
        }
      }
    }
    &_description {
      // font-size: clamp(getRem(20), 1.333vw, getRem(24));
      // font-style: normal;
      // font-weight: 400;
      // line-height: 125%;
      color: white(80);
      width: 380px;
    }
  }
}
</style>
