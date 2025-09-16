<script setup lang="ts">
import { partnersData } from '~/data/partnersData';
import Circle from '../ui/Circle.vue';
import PlusIcon from '~/assets/icons/plus.svg';
</script>

<template>
  <div class="hero">
    <div class="hero__intro">
      <section class="hero__intro_wrapper">
        <div class="scene">
          <Circle class="circle" />
          <div class="psychoactive">
            psychoactive®
            <PlusIcon class="psychoactive__icon psychoactive_icon--right" />
            <PlusIcon class="psychoactive__icon psychoactive_icon--bottom" />
          </div>
          <div class="top-text">
            <img class="top-text__label" src="/img/Webflow_label.svg" alt="" />
            <div class="top-text__agency">Digital First design agency</div>
            <div class="top-text__innovation grey-text">Innovate</div>
          </div>
          <div class="bottom-text">
            <div class="bottom-text__imagine grey-text">Imagine</div>
            <div class="bottom-text__scale">scale</div>
          </div>
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
@use '~/assets/styles/variables' as *;
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
        .psychoactive {
          position: absolute;
          top: 0;
          left: 0;
          font-family: 'RoobertMono', sans-serif;
          color: white(50);
          font-size: 18px;
          font-style: normal;
          line-height: 1;
          text-transform: uppercase;
          padding: 0 48px 48px 0;
          &__icon {
            position: absolute;
            width: 7px;
            height: 7px;
            stroke: white(50);
          }
          .psychoactive_icon--right {
            top: 0;
            right: 0;
          }
          .psychoactive_icon--bottom {
            bottom: 0;
            left: 0;
          }
        }
        .grey-text {
          color: $color-grey;
          font-size: 4.79vw;
          font-style: normal;
          font-weight: 400;
          line-height: 88%;
          letter-spacing: -0.2874vw;
        }
        .circle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(30deg);
          width: 50%;
        }
        .top-text {
          position: absolute;
          top: 0;
          right: 0;
          text-align: right;
          &__label {
            width: auto;
            height: 48px;
          }
          &__agency {
            font-family: 'RoobertMono', sans-serif;
            color: white(80);
            font-size: 18px;
            font-style: normal;
            line-height: 1;
            text-transform: uppercase;
            margin: 24px 0 32px 0;
          }
          &__innovation {
            line-height: 65%;
          }
        }
        .bottom-text {
          position: absolute;
          bottom: 0;
          left: 0;
          &__imagine {
            line-height: 77%;
          }
          &__scale {
            color: $color-foreground;
            font-size: 12.6vw;
            font-style: normal;
            font-weight: 400;
            line-height: 77%;
            letter-spacing: -0.756vw;
          }
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
