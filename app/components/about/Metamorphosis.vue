<script setup>
import gsap from 'gsap';
import useAudioManager from '~/composables/useAudioManager';
import useCursor from '~/composables/useCursor';
import LinkWithHover from '../ui/LinkWithHover.vue';

const { playInteractionSound } = useAudioManager();

const { pointerX, pointerY, cursorRef, cursorText } = useCursor();

// const letsTalkButtonRef = ref(null);
const isOpen = ref(true);
const isMuted = ref(true);
const isCursorVisible = ref(false);

// const handleHoverEffect = () => {
//   const el = letsTalkButtonRef.value;
//   // Stop any ongoing animations on this element
//   if (gsap.isTweening(el)) return;

//   // Set the width to prevent layout shift
//   const width = el.offsetWidth;
//   gsap.set(el, { width });

//   playRandomSound('text-hover');

//   // Store the original text
//   gsap.to(el, {
//     duration: 0.7,
//     ease: 'none',
//     scrambleText: {
//       text: '{original}',
//       chars: '0123456789!@#$%^&*()-_=+[]{};:<>/?,.',
//       tweenLength: false,
//     },
//     overwrite: true,
//     onComplete: () => {
//       gsap.set(el, { clearProps: 'all' });
//     },
//   });
// };

// const handleClick = (e) => {
//   playRandomSound('click');
//   playInteractionSound('menu-');
//   const button = e.currentTarget;
//   const el = letsTalkButtonRef.value;

//   // if (gsap.isTweening(el)) return;

//   gsap.to(button, {
//     width: isOpen.value ? 390 : 240,
//     duration: 0.5,
//     ease: 'power2.inOut',
//   });
//   gsap.to(el, {
//     duration: 0.7,
//     ease: 'none',
//     delay: isOpen.value ? 0.3 : 0,
//     scrambleText: {
//       text: isOpen.value ? 'METAMORPHOSIS DEFINITION' : 'Show less',
//       chars: '0123456789!@#$%^&*()-_=+[]{};:<>/?,.',
//       tweenLength: false,
//     },
//     overwrite: true,
//     onComplete: () => {
//       gsap.set(el, { clearProps: 'all' });
//       ScrollTrigger.refresh();
//     },
//   });
//   isOpen.value = !isOpen.value;
// };

const handlemouseEnter = () => {
  gsap.killTweensOf('#click-cursor');
  cursorText.value = 'CLICK for sound';
  isMuted.value = false;
  isCursorVisible.value = true;
  playInteractionSound('accordion-close');
  gsap
    .timeline()
    .set(cursorRef.value, { x: pointerX.value + 8, y: pointerY.value + 8 })
    .to(cursorRef.value, {
      scale: 1,
      duration: 0.3,
      ease: 'power3.out',
    });
};

const handlemouseLeave = () => {
  isMuted.value = true;
  gsap.to(cursorRef.value, {
    scale: 0,
    duration: 0.3,
    ease: 'power3.in',
    overwrite: true,
    onComplete: () => {
      isCursorVisible.value = false;
    },
  });
};

watch([isCursorVisible, pointerX, pointerY], (newVal) => {
  if (newVal[0]) {
    gsap.to(cursorRef.value, {
      x: newVal[1] + 8,
      y: newVal[2] + 8,
      duration: 0.1,
    });
  }
});
</script>
<template>
  <div class="metamorphosis">
    <div class="container">
      <div class="metamorphosis__video">
        <video
          src="/video/metamorphosis-bg.mp4"
          autoplay
          muted
          loop
          playsinline
        />
      </div>
      <div class="metamorphosis__video_title">
        <h3 class="subheader">
          Metamorphosis Tessellation. Alexandre Bannwarth (2020). Commissioned by Psychoactive.
        </h3>
        <!-- <div class="metamorphosis__video_title-link">
          <div class="line" />
          <LinkWithHover href="/" class="subheader">
            Read more: How we designed the Psychoactive brand identity
          </LinkWithHover>
          <div class="line" />
        </div> -->
      </div>
    </div>
    <div :class="['metamorphosis__wrapper', { open: isOpen }]">
      <div class="metamorphosis__content">
        <div class="container">
          <div
            class="metamorphosis__title"
            @mouseenter="handlemouseEnter"
            @mouseleave="handlemouseLeave"
            @click="() => playInteractionSound('frog-new')"
          >
            <div class="metamorphosis__title_media">
              <div class="metamorphosis__title_video">
                <video
                  src="/video/service_03.mp4"
                  autoplay
                  muted
                  loop
                  playsinline
                />
              </div>
              <button class="metamorphosis__title_button">
                <svg
                  width="29"
                  height="21"
                  viewBox="0 0 29 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.17157 14.6756H2C0.895431 14.6756 0 13.7802 0 12.6756V8.17558C0 7.07101 0.89543 6.17558 2 6.17558H5.17157C5.70201 6.17558 6.21071 5.96487 6.58579 5.5898L11.5858 0.589796C12.8457 -0.670134 15 0.222199 15 2.00401V18.8472C15 20.629 12.8457 21.5213 11.5858 20.2614L6.58579 15.2614C6.21071 14.8863 5.70201 14.6756 5.17157 14.6756Z"
                    fill="currentColor"
                  />
                  <path
                    d="M23.2405 17.3996C27.2696 13.1701 27.2111 6.68034 23.2423 2.89957C22.8424 2.51864 22.8271 1.88566 23.208 1.48577C23.5889 1.08589 24.2219 1.07053 24.6218 1.45146C29.4504 6.05125 29.4211 13.8112 24.6886 18.7791C24.3077 19.1789 23.6747 19.1943 23.2748 18.8134C22.875 18.4324 22.8596 17.7995 23.2405 17.3996Z"
                    fill="currentColor"
                    class="path-1"
                  />
                  <path
                    d="M18.6948 12.5337C20.0512 11.0005 19.9274 8.95108 18.767 7.92447C18.3533 7.55853 18.3147 6.92654 18.6806 6.51289C19.0465 6.09925 19.6785 6.06057 20.0922 6.42651C22.2409 8.32743 22.1299 11.6692 20.1928 13.8589C19.8269 14.2725 19.1949 14.3112 18.7812 13.9452C18.3676 13.5793 18.3289 12.9473 18.6948 12.5337Z"
                    fill="currentColor"
                    class="path-2"
                  />
                </svg>
              </button>
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
        <div class="container metamorphosis__bottom-dots" />
      </div>
    </div>
    <!-- <div class="container">
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
    </div> -->
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
    margin-top: 160px;
    @include respond(mobile) {
      margin-top: 60px;
    }
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

    &_video {
      position: absolute;
      inset: 0;
      clip-path: circle(50% at 50% 50%);
      @include respond(mobile) {
        display: none;
      }
      video {
        position: absolute;
        inset: -30%;
        max-width: none;
        width: 160%;
        translate: 0px 5%;
      }
    }
    &_media {
      @include flex-center;
      position: relative;
      aspect-ratio: 1;
      @include respond(mobile) {
        width: 72px;
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
    @include respond(laptop) {
      max-width: 60%;
    }
    @include respond(mobile) {
      max-width: 100%;
      margin-top: 48px;
      // padding-bottom: 48px;
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
    position: relative;
    @include respond(mobile) {
      margin-top: 60px;
    }
    &_title {
      margin-top: 24px;
      text-align: center;
      text-transform: uppercase;
      color: white(50);
      position: relative;
      z-index: 1;
      @include respond(mobile) {
        text-align: left;
      }
      &-link {
        display: flex;
        gap: 40px;
        justify-content: center;
        align-items: center;
        margin-top: 8px;
        @include respond(mobile) {
          margin-top: 16px;
        }
        a {
          display: inline-block;
          color: $color-foreground;
          white-space: inherit;
        }
        .line {
          flex-grow: 1;
          height: 1px;
          background-color: white(10);
          position: relative;
          @include respond(tablet) {
            display: none;
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
    video {
      width: 100%;
      height: auto;
      object-fit: cover;
      border-radius: 12px;
      overflow: hidden;
      @include respond(mobile) {
        aspect-ratio: 1;
      }
    }
  }
  &__bottom-dots {
    display: flex;
    justify-content: space-between;
    @include respond(mobile) {
      display: none;
    }
    &::before,
    &::after {
      content: '';
      width: 7px;
      height: 7px;
      background-color: $color-dots;
      border-radius: 50%;
    }
  }
}
</style>
