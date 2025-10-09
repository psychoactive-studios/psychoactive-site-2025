<script setup>
import { footerData } from '~/data/footerData';
import PlusIcon from '~/assets/icons/icon-plus.svg';
import LinkWithHover from '../ui/LinkWithHover.vue';
import useAudioManager from '~/composables/useAudioManager';
import gsap from 'gsap';
import WebflowLabel from '../ui/WebflowLabel.vue';

let footerBriefTimeline;
const briefRef = ref(null);

const { playInteractionSound } = useAudioManager();

onMounted(() => {
  const dotsLeft = briefRef.value.querySelector('.brief__title_dots .dot-left');
  const dotsRight = briefRef.value.querySelector(
    '.brief__title_dots .dot-right'
  );
  footerBriefTimeline = gsap
    .timeline({ paused: true })
    .to(gsap.utils.toArray([dotsLeft, dotsRight]), {
      duration: 0.8,
      width: '0%',
      ease: 'power1.in',
      overwrite: 'auto',
    })
    .set(dotsLeft, {
      left: '50%',
    })
    .set(dotsRight, {
      right: '50%',
    })
    .to(gsap.utils.toArray([dotsLeft, dotsRight]), {
      duration: 0.8,
      width: '50%',
      ease: 'power1.out',
      overwrite: 'auto',
    });
});

const briefMouseEnterHandler = () => {
  gsap.to(briefRef.value.querySelector('.brief__title_text--mask'), {
    duration: 0.8,
    clipPath: 'polygon(0% 0, 100% 0, 100% 100%, 0% 100%)',
    ease: 'power2.in',
    overwrite: 'auto',
  });
  footerBriefTimeline.repeat(-1).restart();
};
const briefMouseLeaveHandler = () => {
  gsap.to(briefRef.value.querySelector('.brief__title_text--mask'), {
    duration: 0.8,
    clipPath: 'polygon(55% 0, 55% 0, 55% 100%, 55% 100%)',
    ease: 'power2.in',
    overwrite: 'auto',
  });
  footerBriefTimeline.repeat(0).reverse();
};
</script>

<template>
  <footer class="footer">
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
    <section class="brief">
      <div class="brief__idea">
        <div class="brief__idea_plus">
          <PlusIcon />
          <PlusIcon />
        </div>
        <div class="brief__idea_text">Have an idea?</div>
        <div class="brief__idea_plus">
          <PlusIcon />
          <PlusIcon />
        </div>
      </div>
      <div
        ref="briefRef"
        class="brief__title"
        @mouseenter="briefMouseEnterHandler"
        @mouseleave="briefMouseLeaveHandler"
      >
        <NuxtLink href="/" class="brief__title_text">
          <div class="brief__title_text--original">
            Brief our
            <div class="text-ai">
              <span>AI</span>
              <div class="brief__title_dots">
                <span class="dot-left" />
                <span class="dot-center" />
                <span class="dot-right" />
              </div>
            </div>
            agent
          </div>
          <div class="brief__title_text--mask">
            Brief our
            <div class="text-ai">AI</div>
            agent
          </div>
        </NuxtLink>
      </div>
      <div class="brief__email">
        Or email the old fashioned way:
        <LinkWithHover href="mailto:hello@psychoactive.co.nz">
          hello@psychoactive.co.nz
        </LinkWithHover>
      </div>
    </section>

    <section class="awards">
      <ul class="awards__list">
        <li v-for="award in footerData.awards" :key="award.name">
          <a
            :href="award.url"
            target="_blank"
            @mouseenter="playInteractionSound"
            @focus="playInteractionSound"
          >
            <NuxtImg :src="award.icon" :alt="award.name" height="28" />
          </a>
        </li>
      </ul>
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
.footer {
  height: 100vh;
  padding-top: getRem(60);
  padding-bottom: getRem(48);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  z-index: 1;
  .navigation {
    .links {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: getRem(24);
      padding: 0 $main-padding;
      .link {
        font-family: 'RoobertMono', sans-serif;
        text-transform: uppercase;
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
    font-size: getRem(24);
    line-height: 1.16;
    color: white(50);
    &__idea {
      display: flex;
      align-items: center;
      justify-content: center;
      &_plus {
        display: flex;
        align-items: center;
        width: getRem(140);
        justify-content: space-between;
        & > svg {
          width: getRem(7);
          height: getRem(7);
        }
      }
      &_text {
        margin: 0 getRem(84);
      }
    }

    &__title {
      position: relative;
      &_text {
        font-size: 12.448vw;
        line-height: 1.16;
        letter-spacing: getRem(-16);
        color: white(20);
        text-align: center;
        margin: 0 0 getRem(80) 0;
        display: block;
        position: relative;
        .text-ai {
          display: inline-block;
          color: white(100);
          position: relative;
          &::after {
            content: '';
            position: absolute;
            bottom: getRem(24);
            left: 0;
            width: 100%;
          }
        }
        &--mask {
          position: absolute;
          inset: 0;
          color: white(100);
          clip-path: polygon(55% 0, 55% 0, 55% 100%, 55% 100%);
        }
      }
      &_dots {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 3%;
        &::before {
          content: '';
          display: block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: $color-dots;
          position: absolute;
          top: 0;
          left: calc(0% - 3px);
          z-index: 1;
        }
        &::after {
          content: '';
          display: block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: $color-dots;
          position: absolute;
          top: 0;
          right: calc(0% - 4px);
          z-index: 1;
        }
        .dot-center {
          display: block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: $color-dots;
          position: absolute;
          top: 0;
          left: calc(50% - 3px);
        }
        .dot-left,
        .dot-right {
          display: block;
          width: 50%;
          height: 1px;
          background-color: white(20);
          position: absolute;
          &::before {
            content: '';
            position: absolute;
            width: 7px;
            height: 7px;
            background: $color-dots;
            border-radius: 50%;
            top: -3px;
            left: -3px;
          }
          &::after {
            content: '';
            position: absolute;
            width: 7px;
            height: 7px;
            background: $color-dots;
            border-radius: 50%;
            top: -3px;
            right: -4px;
          }
          &.dot-left {
            left: 0px;
            top: 3px;
            // background-color: red;
          }
          &.dot-right {
            right: 0px;
            top: 3px;
            // background-color: green;
          }
        }
      }
    }

    &__email {
      text-align: center;
      a {
        color: white(100);
        display: inline-block;
      }
    }
  }

  .awards {
    display: flex;
    justify-content: space-between;
    padding: 0 getRem(48);
    &__list {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: getRem(108);
      li {
        a {
          opacity: 0.5;
          &:hover {
            transition: none;
            animation: flicker-effect-3 0.4s ease forwards;
          }
        }
      }
    }
    &__label {
      & > img {
        height: 48px;
        width: auto;
      }
    }
  }
}
</style>
