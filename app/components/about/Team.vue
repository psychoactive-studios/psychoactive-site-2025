<script setup>
import { Splide, SplideSlide, SplideTrack } from '@splidejs/vue-splide';
import { useMediaQuery } from '@vueuse/core';

const isMobile = useMediaQuery('(max-width: 768px)');

console.log();
</script>
<template>
  <section class="team">
    <ClientOnly>
      <ul v-if="!isMobile" class="team__list">
        <li class="team__list_item">
          <div class="item__img">
            <img src="/img/team-Andrew.jpg" alt="" />
          </div>
          <h3 class="item__name">Andrew</h3>
        </li>
        <li class="team__list_item">
          <div class="item__img">
            <img src="/img/team-Luca.jpg" alt="" />
          </div>
          <h3 class="item__name">Luca</h3>
        </li>
        <li class="team__list_item">
          <div class="item__img">
            <img src="/img/team-Sheridan.jpg" alt="" />
          </div>
          <h3 class="item__name">Sheridan</h3>
        </li>
        <li class="team__list_item">
          <div class="item__img">
            <img src="/img/team-Alex.jpg" alt="" />
          </div>
          <h3 class="item__name">Alex</h3>
        </li>
        <li class="team__list_item">
          <div class="item__img">
            <img src="/img/team-Andrew.jpg" alt="" />
          </div>
          <h3 class="item__name">Andrew</h3>
        </li>
        <li class="team__list_item">
          <div class="item__img">
            <img src="/img/team-Luca.jpg" alt="" />
          </div>
          <h3 class="item__name">Luca</h3>
        </li>
        <li class="team__list_item">
          <div class="item__img">
            <img src="/img/team-Sheridan.jpg" alt="" />
          </div>
          <h3 class="item__name">Sheridan</h3>
        </li>
        <li class="team__list_item">
          <div class="item__img">
            <img src="/img/team-Alex.jpg" alt="" />
          </div>
          <h3 class="item__name">Alex</h3>
        </li>
      </ul>

      <Splide
        v-else
        class="team__swiper"
        :has-track="false"
        :options="{
          type: 'loop',
          gap: 16,
          speed: 600,
          arrows: false,
          // easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
        }"
        aria-label="Our team"
      >
        <SplideTrack>
          <SplideSlide>
            <div class="item__img">
              <img src="/img/team-Luca.jpg" alt="" />
            </div>
            <h3 class="item__name">Luca</h3>
          </SplideSlide>
          <SplideSlide>
            <div class="item__img">
              <img src="/img/team-Sheridan.jpg" alt="" />
            </div>
            <h3 class="item__name">Sheridan</h3>
          </SplideSlide>
          <SplideSlide>
            <div class="item__img">
              <img src="/img/team-Alex.jpg" alt="" />
            </div>
            <h3 class="item__name">Alex</h3>
          </SplideSlide>
          <SplideSlide>
            <div class="item__img">
              <img src="/img/team-Andrew.jpg" alt="" />
            </div>
            <h3 class="item__name">Andrew</h3>
          </SplideSlide>
          <SplideSlide>
            <div class="item__img">
              <img src="/img/team-Luca.jpg" alt="" />
            </div>
            <h3 class="item__name">Alex</h3>
          </SplideSlide>
        </SplideTrack>
      </Splide>
    </ClientOnly>
  </section>
</template>
<style lang="scss" scoped>
.team {
  &__list {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 48px;
  }
  &__list_item {
    display: flex;
    flex-direction: column;
    gap: 24px;
    .item__img {
      aspect-ratio: 0.69;
      border-radius: 10px;
      overflow: hidden;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    .item__name {
      font-size: 1.044vw;
      font-style: normal;
      font-weight: 400;
      line-height: 130%;
    }
  }
  &__swiper {
    padding-right: 24px;
    .splide__track {
      overflow: visible;
    }
    .splide__slide {
      .item__img {
        aspect-ratio: 0.69;
        border-radius: 10px;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      .item__name {
        font-size: 5.33333vw;
        font-style: normal;
        font-weight: 400;
        line-height: 130%;
        margin-top: 4.27vw;
      }
    }
  }
}
</style>
