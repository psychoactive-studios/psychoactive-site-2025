<script setup>
import { footerData } from '~/data/footerData';
import LinkWithHover from '../ui/LinkWithHover.vue';
import useAudioManager from '~/composables/useAudioManager';
import WebflowLabel from '../ui/WebflowLabel.vue';
import Brief from './Brief.vue';
import AnalogClock from '../ui/AnalogClock.vue';

const { playInteractionSound } = useAudioManager();

defineProps({
  transparent: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <footer :class="['footer', { 'footer--transparent': transparent }]">
    <section class="navigation">
      <ul class="links">
        <template v-for="(link, index) in footerData.links" :key="link.title">
          <li class="link">
            <LinkWithHover :href="link.url">{{ link.title }}</LinkWithHover>
          </li>
          <li v-if="index < footerData.links.length - 1" class="separator" />
        </template>
      </ul>
    </section>
    <Brief />

    <section class="awards">
      <ul class="awards__list">
        <li v-for="award in footerData.awards" :key="award.name">
          <a
            :href="award.url"
            target="_blank"
            @mouseenter="playInteractionSound"
            @focus="playInteractionSound"
          >
            <NuxtImg :src="award.icon" :alt="award.name" />
          </a>
        </li>
      </ul>
      <div class="awards__clocks">
        <AnalogClock city="WLG" />
        <AnalogClock city="MELB" />
        <AnalogClock city="SING" />
        <AnalogClock city="CALI" />
      </div>
      <div class="awards__label">
        <a
          href="https://webflow.com/@Psychoactive-Studios"
          target="_blank"
          @mouseenter="playInteractionSound"
          @focus="playInteractionSound"
        >
          <WebflowLabel />
        </a>
      </div>
    </section>
  </footer>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;
.footer {
  height: 100vh;
  padding-top: getRem(60);
  padding-bottom: getRem(48);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  z-index: 1;
  background-color: $color-background;
  &--transparent {
    background-color: transparent;
  }
  @include respond(portrait) {
    padding-top: 160px;
  }
  @include respond(mobile) {
    padding-top: 80px;
    justify-content: space-around;
  }
  .navigation {
    @include respond(mobile) {
      display: none;
    }
    .links {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: getRem(24);
      padding: 0 160px;
      @include respond(portrait) {
        padding: 0 48px;
        flex-wrap: wrap;
        gap: getRem(16) getRem(24);
        & > li:nth-child(6) {
          width: 100%;
          visibility: hidden;
          height: 0;
        }
      }

      @include respond(mobile) {
        padding-left: 24px;
        padding-right: 24px;
        flex-wrap: wrap;
        gap: getRem(12) getRem(12);
        & > li:nth-child(6) {
          width: 100%;
          visibility: hidden;
          height: 0;
        }
      }

      .link {
        font-family: 'RoobertMono', sans-serif;
        text-transform: uppercase;
        @include respond(mobile) {
          font-size: getRem(14);
        }
        a {
          display: block;
        }
      }
      .separator {
        flex-grow: 1;
        height: 1px;
        background-color: white(20);
        position: relative;
        &::before {
          content: '';
          position: absolute;
          top: -3px;
          left: -4px;
          width: 7px;
          height: 7px;
          background-color: white(50);
          border-radius: 50%;
        }
        &::after {
          content: '';
          position: absolute;
          top: -3px;
          right: -4px;
          width: 7px;
          height: 7px;
          background-color: white(50);
          border-radius: 50%;
        }
      }
    }
  }

  .awards {
    display: flex;
    justify-content: space-between;
    padding: 0 getRem(48);
    @include respond(portrait) {
      flex-direction: column;
      align-items: center;
      gap: getRem(32);
    }
    @include respond(desktop) {
      flex-direction: column;
      align-items: center;
      gap: getRem(32);
    }
    @include respond(mobile) {
      padding: 0 getRem(24);
    }
    &__list {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 2.5vw;
      @include respond(mobile) {
        width: 280px;
        justify-content: space-around;
        gap: initial;
      }
      li {
        img {
          height: 28px;
          @include respond(mobile) {
            height: 24px;
          }
        }
        a {
          opacity: 0.5;
          &:hover {
            transition: none;
            animation: flicker-effect-3 0.4s ease forwards;
          }
        }
      }
    }
    &__clocks {
      display: flex;
      gap: 2.5vw;
      @include respond(mobile) {
        display: none;
      }
    }
    &__label {
      img,
      svg {
        height: clamp(36px, 2.5vw, 48px);
        width: auto;
        @include respond(mobile) {
          height: 36px;
        }
      }
    }
  }
}
</style>
