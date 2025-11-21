<script setup>
import { Splide, SplideSlide } from '@splidejs/vue-splide';
import ButtonDotsArrow from '../ui/ButtonDotsArrow.vue';
import CaseStadyPreview from '../ui/CaseStadyPreview.vue';

const containerRef = ref(null);
const activeIndex = ref(0);

const onSlideChange = (e) => {
  const swiperInstance = e.detail[0];
  activeIndex.value = swiperInstance.activeIndex;
};

// Functions for navigation buttons
const next = () => containerRef.value?.swiper.slideNext();
const prev = () => containerRef.value?.swiper.slidePrev();
</script>

<template>
  <ClientOnly>
    <div class="cases-swiper">
      <Splide
        :options="{ type: 'loop', arrows: false, gap: 20 }"
        aria-label="My Favorite Images"
      >
        <SplideSlide>
          <CaseStadyPreview
            src="/img/cases/case-super-ai.jpg"
            title="SuperAI Conference"
            description="Worlds largest AI event"
          />
        </SplideSlide>
        <SplideSlide>
          <CaseStadyPreview
            src="/img/cases/case-burgerfuel.jpg"
            title="Burgerfuel"
            description="New Zealand’s favourite burger"
          />
        </SplideSlide>
        <SplideSlide
          ><CaseStadyPreview
            src="/img/cases/case-hellboy.jpg"
            title="Hellboy Web of Wyrd"
            description="beat 'em up roguelike Video game"
        /></SplideSlide>
        <SplideSlide
          ><CaseStadyPreview
            src="/img/cases/case-world-of-wearableArt.jpg"
            title="World of WearableArt"
            description="New Zealand's Largest theatrical Spectacle"
        /></SplideSlide>
      </Splide>

      <ButtonDotsArrow
        direction="left"
        bordered
        class="cases-swiper__button cases-swiper__button--prev"
        :disabled="activeIndex === 0"
        @click="prev()"
      />

      <ButtonDotsArrow
        direction="right"
        bordered
        class="cases-swiper__button cases-swiper__button--next"
        :disabled="activeIndex === containerRef?.swiper?.slides.length - 1"
        @click="next()"
      />
    </div>
  </ClientOnly>
</template>

<style scoped lang="scss">
.cases-swiper {
  position: relative;
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
  }
  swiper-container {
    &::part(container) {
      overflow: visible;
    }
    &::part(wrapper) {
      transition-duration: 0.8s;
      transition-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
    }
  }
}
</style>
