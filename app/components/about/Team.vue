<script setup>
import { Splide, SplideSlide, SplideTrack } from '@splidejs/vue-splide';
import { useMediaQuery } from '@vueuse/core';
import { teamData } from '~/data/teamData.js';
import BulgeImage from '../ui/BulgeImage.vue';
import useAudioManager from '~/composables/useAudioManager';

const isMobile = useMediaQuery('(max-width: 768px)');
const { playContinuousSound, stopContinuousSound } = useAudioManager();
</script>
<template>
  <section class="team">
    <ClientOnly>
      <ul v-if="!isMobile" class="team__list">
        <li
          v-for="person in teamData"
          :key="person.name"
          class="team__list_item"
        >
          <BulgeImage
            ref="imageRef"
            class="item__img"
            :src="person.photo"
            :cursor="false"
            :strength="0.3"
            @mouseenter="() => playContinuousSound('warp-hover')"
            @mouseleave="() => stopContinuousSound()"
          />
          <!-- <div class="item__img">
            <img :src="person.photo" alt="" />
          </div> -->
          <h3 class="item__name">{{ person.name }}</h3>
          <div class="item__role">{{ person.role }}</div>
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
          <SplideSlide v-for="person in teamData" :key="person.name">
            <div class="item__img">
              <img :src="person.photo" :alt="person.name" />
            </div>
            <h3 class="item__name">{{ person.name }}</h3>
            <div class="item__role">{{ person.role }}</div>
          </SplideSlide>          
        </SplideTrack>
      </Splide>
    </ClientOnly>
  </section>
</template>
<style lang="scss" scoped>
@use '~/assets/styles/typography' as *;
@use '~/assets/styles/functions' as *;
.team {
  &__list {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 48px;
  }
  &__list_item {
    display: flex;
    flex-direction: column;
    min-width: 0;
    .item__img {
      aspect-ratio: 0.69;      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 10px;
        overflow: hidden;
      }
    }
    .item__name {
      @extend .body--mobile;
      margin-top: 1.25vw;
    }
    .item__role {
      @extend .subheader-small;
      color: white(50);
      margin-top: 0.625vw;
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
      .item__role {
        @extend .subheader-small;
        color: white(50);
        margin-top: 0.625vw;
      }
    }
  }
}
</style>
