<script setup>
import { Splide, SplideSlide, SplideTrack } from '@splidejs/vue-splide';
import ButtonDotsArrow from '../ui/ButtonDotsArrow.vue';
import CaseStadyPreview from '../ui/CaseStadyPreview.vue';
import { useMediaQuery } from '@vueuse/core';

defineProps({
  data: {
    type: Array,
    required: true,
  },
});

const wrapperRef = ref(null);
const containerRef = ref(null);

const isMobile = useMediaQuery('(max-width: 768px)');

onMounted(() => {
  setTimeout(() => containerRef.value.splide.refresh(), 100);
});

onBeforeUnmount(() => {
  const originalSlider = containerRef.value.root;
  const clonedSlider = containerRef.value.root.cloneNode(true);
  originalSlider.parentNode.replaceChild(clonedSlider, originalSlider);
});

// Functions for navigation buttons
</script>

<template>
  <div ref="wrapperRef" class="cases-swiper">
    <Splide
      ref="containerRef"
      :has-track="false"
      :options="{
        type: 'loop',
        gap: isMobile ? 16 : 20,
        speed: 600,
        easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
      }"
      aria-label="Case studies showcase"
    >
      <SplideTrack>
        <SplideSlide v-for="(work, index) in data" :key="index">
          <CaseStadyPreview :data="work" />
        </SplideSlide>
      </SplideTrack>
      <div class="splide__arrows">
        <ButtonDotsArrow
          direction="left"
          bordered
          class="cases-swiper__button cases-swiper__button--prev splide__arrow splide__arrow--prev"
        />
        <ButtonDotsArrow
          direction="right"
          bordered
          class="cases-swiper__button cases-swiper__button--next splide__arrow splide__arrow--next"
        />
      </div>
    </Splide>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;
.cases-swiper {
  position: relative;
  width: 100%;

  &::before {
    content: '';
    display: block;
    position: absolute;
    z-index: 1;
    top: 0;
    right: 100%;
    bottom: 0;
    width: 50%;
    background-color: $color-background;
    background: linear-gradient(90deg, $color-background 60%, transparent 100%);
    opacity: 0.8;
  }
  &::after {
    content: '';
    display: block;
    position: absolute;
    z-index: 1;
    top: 0;
    left: 100%;
    bottom: 0;
    width: 50%;
    background-color: $color-background;
    background: linear-gradient(90deg, transparent 0%, $color-background 40%);
    opacity: 0.8;
  }
  // .splide__slide {
  //   opacity: 0.2;
  //   transition: opacity 0.3s ease;
  //   &.is-active {
  //     opacity: 1;
  //   }
  // }
  &__button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    &--prev {
      left: -80px;
    }
    &--next {
      right: -80px;
    }
    @include respond(mobile) {
      display: none;
    }
  }
  .splide__track {
    overflow: visible;
  }
}
</style>
