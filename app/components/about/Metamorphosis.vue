<script setup>
import gsap from 'gsap';
import useAudioManager from '~/composables/useAudioManager';
import SoundButton from '../ui/SoundButton.vue';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const { playInteractionSound, playRandomSound } = useAudioManager();

const letsTalkButtonRef = ref(null);
const isOpen = ref(false);
const isMuted = ref(true);

const handleHoverEffect = () => {
  const el = letsTalkButtonRef.value;
  // Stop any ongoing animations on this element
  if (gsap.isTweening(el)) return;

  // Set the width to prevent layout shift
  const width = el.offsetWidth;
  gsap.set(el, { width });

  playRandomSound('text-hover');

  // Store the original text
  gsap.to(el, {
    duration: 0.7,
    ease: 'none',
    scrambleText: {
      text: '{original}',
      chars: '0123456789!@#$%^&*()-_=+[]{};:<>/?,.',
      tweenLength: false,
    },
    overwrite: true,
    onComplete: () => {
      gsap.set(el, { clearProps: 'all' });
    },
  });
};

const handleClick = (e) => {
  playRandomSound('click');
  playInteractionSound('menu-');
  const button = e.currentTarget;
  const el = letsTalkButtonRef.value;

  // if (gsap.isTweening(el)) return;

  gsap.to(button, {
    width: isOpen.value ? 390 : 240,
    duration: 0.5,
    ease: 'power2.inOut',
  });
  gsap.to(el, {
    duration: 0.7,
    ease: 'none',
    delay: isOpen.value ? 0.3 : 0,
    scrambleText: {
      text: isOpen.value ? 'METAMORPHOSIS DEFINITION' : 'Show less',
      chars: '0123456789!@#$%^&*()-_=+[]{};:<>/?,.',
      tweenLength: false,
    },
    overwrite: true,
    onComplete: () => {
      gsap.set(el, { clearProps: 'all' });
      ScrollTrigger.refresh();
    },
  });
  isOpen.value = !isOpen.value;
};

</script>
<template>
  <div class="metamorphosis">
    <div :class="['metamorphosis__wrapper', { open: isOpen }]">
      <div class="metamorphosis__content">
        <div class="container">
          <div
            class="metamorphosis__title"
            @mouseenter="
              ((isMuted = false), playInteractionSound('accordion-close'))
            "
            @mouseleave="() => (isMuted = true)"
            @click="() => playInteractionSound('frog-new')"
          >
            <div class="metamorphosis__title_media">
              <video
                src="/video/service_03.mp4"
                autoplay
                muted
                loop
                playsinline
              />
              <div class="metamorphosis__title_button">
                <SoundButton :muted="isMuted" />
              </div>
              <div class="dots-top" />
              <div class="dots-bottom" />
            </div>
            <div class="metamorphosis__title_text">
              <h2 class="display-2xl--medium">Metamorphosis</h2>
              <p class="body-large--mobile">/ˌmɛtəˈmɔːfəsɪs,ˌmɛtəmɔːˈfəʊsɪs/</p>
            </div>
          </div>
        </div>

        <div class="metamorphosis__definition">
          <div class="metamorphosis__definition_section">
            <p>
              Noun <span class="digital-label">DIGITAL TRANSFORMATION</span
              ><br />
              noun: <b>metamorphosis</b>; plural noun: <b>metamorphoses</b>
            </p>
            <p class="body--mobile">
              (in a brand or organisation) the process of transformation from an
              outdated or underperforming digital presence into a distinctive,
              intelligent, and high-performing web experience
            </p>
            <p class="body-large--mobile">
              “After working with Psychoactive, the brand underwent digital
              metamorphosis.”
            </p>
          </div>
          <div class="metamorphosis__definition_section">
            <h3 class="body-large--mobile">Outcomes:</h3>
            <ul class="tags-list">
              <li class="tag">transformation</li>
              <li class="tag">clarity</li>
              <li class="tag">emotion</li>
              <li class="tag">identity</li>
              <li class="tag">scalability</li>
              <li class="tag">performance</li>
              <li class="tag">growth</li>
            </ul>
          </div>
          <div class="metamorphosis__definition_section origin">
            <h3 class="body-large--mobile">Origin:</h3>
            <ul class="origin-list">
              <li>
                <div class="origin-title">
                  <div class="tag">GREEK</div>
                  <div class="line" />
                </div>
                <div class="origin-definition">
                  <div class="body-large--mobile">metamorphoun</div>
                  <div>(to transform, change shape)</div>
                </div>
              </li>
              <li>
                <div class="origin-title">
                  <div class="tag">LATIN</div>
                  <div class="line" />
                </div>
                <div class="origin-definition">
                  <div class="body-large--mobile">metamorphosis</div>
                  <div>(late Middle English)</div>
                </div>
              </li>
              <li>
                <div class="origin-title">
                  <div class="tag">NEW ZEALAND</div>
                  <div class="line" />
                </div>
                <div class="origin-definition">
                  <div class="body-large--mobile">metamorphosis</div>
                  <div>(Psychoactive definition)</div>
                </div>
              </li>
            </ul>
          </div>
          <div class="metamorphosis__definition_section body--mobile">
            Redefined by Psychoactive Studios to describe the digital evolution
            of brands through strategy, design, and technology.
          </div>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="metamorphosis__button">
        <div class="metamorphosis__button_line">
          <span class="line" />
        </div>
        <button
          class="button body-button"
          @mouseenter="handleHoverEffect"
          @click="handleClick"
        >
          <span ref="letsTalkButtonRef">METAMORPHOSIS DEFINITION</span>
          <span class="button__dots">
            <i />
            <i />
            <i />
          </span>
        </button>
        <div class="metamorphosis__button_line">
          <span class="line" />
        </div>
      </div>
      <div class="metamorphosis__video">
        <video
          src="/video/metamorphosis-bg.mp4"
          autoplay
          muted
          loop
          playsinline
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/typography' as *;

@keyframes sound-impulse {
  0% {
    opacity: 0.1;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.1;
  }
}

.metamorphosis {
  padding-bottom: 160px;
  @include respond(portrait) {
    padding-top: 60px;
    padding-bottom: 0;
  }
  .tag {
    @extend .subheader--mobile;
    white-space: nowrap;
    border-radius: 30px;
    border: 1px solid white(20);
    padding: 10px 12px;
  }
  &__wrapper {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.5s cubic-bezier(0.66, 0, 0.34, 1);
    overflow: hidden;
    &.open {
      grid-template-rows: 1fr;
    }
  }
  &__content {
    min-height: 0;
    min-width: 0;
  }
  &__title {
    // display: flex;
    // gap: 32px;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 32px;
    position: relative;
    cursor: pointer;
    @include respond(mobile) {
      gap: 16px;
      align-items: center;
    }
    &::before,
    &::after {
      content: '';
      position: absolute;
      right: 0;
      width: 7px;
      height: 7px;
      background-color: $color-dots;
      border-radius: 50%;
    }
    &::before {
      top: 0;
    }
    &::after {
      bottom: 0;
    }

    &_media {
      @include flex-center;
      position: relative;
      aspect-ratio: 1;
      @include respond(mobile) {
        width: 72px;
      }
      video {
        position: absolute;
        inset: 0;
        clip-path: circle(50% at 50% 50%);
        @include respond(mobile) {
          display: none;
        }
      }
      .dots-top,
      .dots-bottom {
        &::before,
        &::after {
          content: '';
          position: absolute;
          width: 7px;
          height: 7px;
          background-color: $color-dots;
          border-radius: 50%;
        }
      }
      .dots-top {
        &::before {
          top: 0;
          left: 0;
        }
        &::after {
          top: 0;
          right: 0;
        }
      }
      .dots-bottom {
        &::before {
          bottom: 0;
          left: 0;
        }
        &::after {
          bottom: 0;
          right: 0;
        }
      }
    }
    &_button {
      // width: 34%;
      aspect-ratio: 1;
      background-color: $color-background;
      position: relative;
      z-index: 1;
      border-radius: 50%;
      padding: 12px;
    }
    &_text {
      & > h2 {
        background: linear-gradient(to right, white(50) 50%, white 50%);
        background-size: 200% 100%;
        background-position-x: 0%;
        background-position-y: center;
        color: transparent;
        background-clip: text;
        transition: background-position-x 0.5s ease-in-out;
        @include respond(mobile) {
          color: $color-foreground;
        }
      }
      .body-large--mobile {
        opacity: 0.5;
        margin-top: 16px;
        @include respond(mobile) {
          opacity: 0.8;
          margin-top: 2px;
        }
      }
    }
    &:hover {
      .metamorphosis__title_button {
        .path-2 {
          animation: sound-impulse 1s ease-in-out infinite;
        }
        .path-1 {
          animation: sound-impulse 1s ease-in-out infinite 0.25s;
        }
      }
      .metamorphosis__title_text {
        h2 {
          background-position-x: -100%;
        }
      }
    }
  }
  &__definition {
    max-width: 41.25%;
    margin: 80px auto 0 auto;
    display: flex;
    flex-direction: column;
    gap: 48px;
    color: white(80);
    padding-bottom: 80px;
    @include respond(laptop) {
      max-width: 60%;
    }
    @include respond(mobile) {
      max-width: 100%;
      margin-top: 48px;
      padding-bottom: 48px;
    }

    &_section {
      @include respond(mobile) {
        &:not(.origin) {
          @include container;
        }
        &.origin {
          h3 {
            @include container;
            margin-bottom: 1em;
          }
        }
      }
      b {
        font-weight: 750;
      }
      & > p {
        margin-bottom: 1.2em;
      }
      & > h3 {
        color: $color-foreground;
        margin-bottom: 1em;
      }
      .tags-list {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      .origin-list {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        @include respond(mobile) {
          display: flex;
          overflow: auto;
          padding: 0 1rem;
          // margin-left: -1rem;
          // margin-right: -1rem;
        }
        & > li {
          min-width: 0;
          @include respond(mobile) {
            flex-grow: 1;
            min-width: 160px;
            flex-shrink: 0;
          }
          &:last-child {
            .origin-title {
              .line {
                display: none;
              }
            }
          }
          .origin-title {
            display: flex;
            gap: 10px;
            align-items: center;
            .line {
              flex-grow: 1;
              height: 1px;
              background: white(20);
              position: relative;
              &::after {
                content: '';
                position: absolute;
                width: 7px;
                height: 7px;
                background-color: white(50);
                border-radius: 50%;
                top: -3px;
                right: -4px;
              }
            }
          }
          .origin-definition {
            margin-top: 8px;
            @include respond(mobile) {
              font-size: 12px;
            }
          }
        }
      }
    }
    .digital-label {
      display: inline-block;
      background-color: white(10);
      padding: 0 6px;
      border-radius: 4px;
    }
  }
  &__button {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 36px;
    @include respond(mobile) {
      display: block;
      text-align: center;
    }
    .button {
      padding: 12px 48px;
      border: 1px solid white(20);
      border-radius: 48px;
      min-height: 48px;
      width: 390px;
      & > span:first-child {
        white-space: nowrap;
      }
      @include respond(mobile) {
        width: 100%;
        max-width: 360px;
        padding: 12px 24px 12px 24px;
      }
      &__dots {
        display: inline-flex;
        gap: 2px;
        margin-left: 24px;
        @include respond(mobile) {
          margin-left: auto;
        }
        i {
          width: 7px;
          height: 7px;
          background-color: $color-foreground;
          border-radius: 50%;
          display: inline-block;
        }
      }
      &:hover {
        .button__dots {
          i {
            &:nth-child(1) {
              animation: flicker-effect-3 0.5s forwards;
            }
            &:nth-child(2) {
              animation: flicker-effect-3 0.5s forwards 0.2s;
            }
            &:nth-child(3) {
              animation: flicker-effect-3 0.5s forwards 0.3s;
            }
          }
        }
      }
    }
    &_line {
      @include respond(mobile) {
        display: none;
      }
      .line {
        display: block;
        width: 100%;
        height: 1px;
        background: white(10);
        position: relative;
        will-change: width;
        &::before,
        &::after {
          content: '';
          position: absolute;
          width: 7px;
          height: 7px;
          background-color: white(50);
          border-radius: 50%;
        }
        &::before {
          top: -3px;
          left: -3px;
        }
        &::after {
          top: -3px;
          right: -4px;
        }
      }
    }
  }
  &__video {
    margin-top: 120px;
    border-radius: 12px;
    overflow: hidden;
    @include respond(mobile) {
      margin-top: 60px;
    }
    video {
      width: 100%;
      height: auto;
      object-fit: cover;
      @include respond(mobile) {
        aspect-ratio: 1;
      }
    }
  }
}
</style>
