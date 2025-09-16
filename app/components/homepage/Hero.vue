<script setup lang="ts">
import { partnersData } from '~/data/partnersData';
import Circle from '../ui/Circle.vue';
</script>

<template>
  <div class="hero">
    <div class="hero__intro">
      <section class="hero__intro_wrapper">
        <div class="scene">
          <Circle class="circle" />
        </div>
      </section>
      <section class="hero__intro_partners">
        <NuxtImg
          v-for="partner in partnersData"
          :key="partner.id"
          :src="partner.logo"
          :alt="partner.name"
          :class="partner.id"
        />
      </section>
    </div>
    <div class="hero__player">222</div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/functions' as *;
.hero {
  &__intro {
    height: 100dvh;
    display: flex;
    flex-direction: column;
    padding: 0 0 48px 0;
    &_wrapper {
      flex-grow: 1;
      @include flex-center;
      .scene {
        aspect-ratio: 2.43;
        border: 2px dashed white(40);
        width: 100%;
        position: relative;
        .circle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(30deg);
          width: 50%;
        }
      }
    }
    &_partners {
      display: flex;
      justify-content: space-between;
      align-items: center;
      img {
        height: auto;
        object-fit: contain;
      }
      .partner-super-ai {
        width: 6.5%;
      }
      .partner-adidas {
        width: 6.12%;
      }
      .partner-ray-white {
        width: 6.625%;
      }
      .partner-hellboy {
        width: 7.75%;
      }
      .partner-blackbird {
        width: 7.06%;
      }
      .partner-wow {
        width: 7.56%;
      }
      .partner-one {
        width: 7.75%;
      }
      .partner-all-blacks {
        width: 5.25%;
      }
      .partner-burgerfuel {
        width: 7%;
      }
      .partner-summer-game {
        width: 5.62%;
      }
    }
  }
  &__player {
    height: 100dvh;
  }
}
</style>
