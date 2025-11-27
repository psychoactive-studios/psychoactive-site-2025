<script setup>
import { Splide, SplideSlide, SplideTrack } from '@splidejs/vue-splide';
import ButtonDotsArrow from '../ui/ButtonDotsArrow.vue';
import CaseStadyPreview from '../ui/CaseStadyPreview.vue';

const containerRef = ref(null);

// Functions for navigation buttons
</script>

<template>
  <div class="cases-swiper">
    <Splide
      ref="containerRef"
      :has-track="false"
      :options="{
        gap: 20,
        speed: 600,
        easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
      }"
      aria-label="My Favorite Images"
    >
      <SplideTrack>
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
  .splide__track {
    overflow: visible;
  }
}
</style>
