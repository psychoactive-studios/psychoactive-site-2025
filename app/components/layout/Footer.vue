<script setup>
import { footerData } from '~/data/footerData';
import LinkWithHover from '../ui/LinkWithHover.vue';
import useAudioManager from '~/composables/useAudioManager';
import WebflowLabel from '../ui/WebflowLabel.vue';
import Brief from './Brief.vue';
import AnalogClock from '../ui/AnalogClock.vue';
import LinkButton from '../ui/LinkButton.vue';

const { playInteractionSound, playRandomSound } = useAudioManager();

defineProps({
  transparent: {
    type: Boolean,
    default: false,
  },
});
const handleClick = () => {
  playRandomSound('click');
  playInteractionSound('menu-close', 200);
};
</script>

<template>
  <footer :class="['footer', { 'footer--transparent': transparent }]">
    <section class="navigation">
      <ul class="links">
        <template v-for="(link, index) in footerData.links" :key="link.title">
          <li class="link body-button" @click="handleClick">
            <LinkWithHover :href="link.url">{{ link.title }}</LinkWithHover>
          </li>
          <li v-if="index < footerData.links.length - 1" class="separator" />
        </template>
      </ul>
    </section>
    <Brief class="brief" />

    <div class="container mobile-cta">
      <section class="mobile-cta__wrapper">
        <h2 class="mobile-cta__title">Have an idea?</h2>
        <LinkButton href="https://superai.com" size="small">
          let’s talk
        </LinkButton>
      </section>
    </div>

    <section class="awards">
      <ul class="awards__list">
        <li v-for="award in footerData.awards" :key="award.name">
          <a
            :href="award.url"
            target="_blank"
            @mouseenter="() => playRandomSound('awards-footer-hover')"
            @click="playRandomSound('click')"
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
          @mouseenter="() => playInteractionSound('text-hover-short', 100)"
          @click="playInteractionSound('click-1')"
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
    padding-top: 24px;
    padding-bottom: 116px;
    gap: 48px;
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

  .brief {
    @include respond(mobile) {
      display: none;
    }
  }

  .mobile-cta {
    flex-grow: 1;
    display: none;
    @include respond(mobile) {
      display: block;
    }
    &__wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: getRem(32);
      background-color: #1b1b1b;
      border-radius: getRem(12);
      height: 100%;
    }
    &__title {
      font-family: 'RoobertMono';
      font-size: 1rem;
      font-style: normal;
      font-weight: 500;
      line-height: 120%;
      text-transform: uppercase;
      position: relative;
      display: inline-flex;
      align-items: center;
      padding: 0 getRem(32);
      position: relative;
      &::before,
      &::after {
        content: '';
        display: block;
        width: 8px;
        height: 8px;
        position: absolute;
        background: url('/img/icon-plus.svg') no-repeat center center;
        opacity: 0.5;
      }
      &::before {
        left: 100%;
      }
      &::after {
        right: 100%;
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
        width: 100%;
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
      @include respond(mobile) {
        display: none;
      }
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
