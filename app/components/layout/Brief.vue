<script setup>
import PlusIcon from '~/assets/icons/icon-plus.svg';
import LinkWithHover from '../ui/LinkWithHover.vue';
import gsap from 'gsap';
import BriefOurAIAgent from '~/assets/img/brief-our-AI-agent.svg';

const { playInteractionSound } = useAudioManager();

let footerBriefTimeline;
const briefRef = ref(null);

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
    ease: 'power3.out',
    overwrite: 'auto',
  });
  footerBriefTimeline.repeat(-1).restart();
  playInteractionSound('ai-hover');
};
const briefMouseLeaveHandler = () => {
  gsap.to(briefRef.value.querySelector('.brief__title_text--mask'), {
    duration: 0.8,
    clipPath: 'polygon(55% 0, 55% 0, 55% 100%, 55% 100%)',
    ease: 'power3.out',
    overwrite: 'auto',
  });
  footerBriefTimeline.repeat(0).reverse();
};
</script>

<template>
  <section class="brief">
    <div class="container">
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
          <BriefOurAIAgent class="brief__title_text--original" />
          <BriefOurAIAgent class="brief__title_text--mask" />
          <div class="brief__title_dots">
            <span class="dot-left" />
            <span class="dot-center" />
            <span class="dot-right" />
          </div>
        </NuxtLink>
      </div>
      <div class="brief__email">
        Or email the old fashioned way:
        <LinkWithHover href="mailto:hello@psychoactive.co.nz">
          hello@psychoactive.co.nz
        </LinkWithHover>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;

.brief {
  font-size: getRem(24);
  line-height: 1.16;
  color: white(50);
  &__idea {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 60px;
    @include respond(mobile) {
      font-size: getRem(14);
      margin-bottom: 48px;
    }
    &_plus {
      display: flex;
      align-items: center;
      width: getRem(140);
      justify-content: space-between;
      @include respond(mobile) {
        display: none;
      }
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
      color: white(100);
      margin: 0 0 getRem(80) 0;
      display: block;
      position: relative;
      svg {
        // color: #ffffff;
        width: 100%;
        height: auto;
      }
      @include respond(mobile) {
        font-size: clamp(getRem(48), 12.448vw, getRem(76));
      }
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
        * {
          fill-opacity: 1;
        }
      }
    }
    &_dots {
      position: absolute;
      left: 50.8%;
      right: 38%;
      bottom: 7%;
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
        @include respond(mobile) {
          width: 4px;
          height: 4px;
        }
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
        @include respond(mobile) {
          width: 4px;
          height: 4px;
        }
      }
      .dot-center {
        display: block;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background-color: $color-dots;
        position: absolute;
        top: 0;
        left: calc(50% - 2px);
        @include respond(mobile) {
          width: 4px;
          height: 4px;
        }
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
          @include respond(mobile) {
            width: 4px;
            height: 4px;
            top: -2px;
          }
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
          @include respond(mobile) {
            width: 4px;
            height: 4px;
            top: -2px;
          }
        }
        &.dot-left {
          left: 0px;
          top: 3px;
          @include respond(mobile) {
            &::after {
              right: -2px;
            }
            top: 2px;
          }
          // background-color: red;
        }
        &.dot-right {
          right: 0px;
          top: 3px;
          @include respond(mobile) {
            &::before {
              left: -2px;
            }
            &::after {
              left: -2px;
            }
            top: 2px;
          }
          // background-color: green;
        }
      }
    }
  }

  &__email {
    text-align: center;
    @include respond(mobile) {
      font-size: getRem(14);
    }
    a {
      color: white(100);
      display: inline-block;
      @include respond(mobile) {
        margin-top: getRem(8);
        display: block;
      }
    }
  }
}
</style>
