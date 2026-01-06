<script setup>
import gsap from 'gsap';
import SetsUpAccordion from '../ui/SetsUpAccordion.vue';
// import useAudioManager from '~/composables/useAudioManager';
import { SplitText } from 'gsap/SplitText';

defineProps({
  data: {
    type: Array,
    required: true,
  },
});

// const { playInteractionSound } = useAudioManager();
const containerRef = ref(null);
// const showMoreRef = ref(null);

let ctx = null;

onMounted(async () => {
  SplitText.create(
    gsap.utils.toArray([
      containerRef.value.querySelector('h2'),
      containerRef.value.querySelectorAll('.accordion__title'),
      containerRef.value.querySelectorAll(
        '.what-sets-us__show-more button > span'
      ),
    ]),
    {
      type: 'words,chars',
      charsClass: 'char-center',
    }
  );
  ctx = gsap.context(() => {
    const mainTl = gsap
      .timeline({
        scrollTrigger: {
          trigger: containerRef.value,
          start: 'top center',
          end: 'bottom center',
        },
      })
      .from(
        'h2 .char-center',
        {
          duration: 0.1,
          opacity: 0,
          stagger: 0.02,
        },
        'firstPart'
      )
      .from(
        '.accordion__header_icon svg',
        {
          scale: 0,
          duration: 0.6,
          stagger: 0.05,
        },
        'secotndPart+=0.8'
      )
      .from(
        '.accordion__header_border',
        {
          opacity: 0,
          duration: 0.6,
          stagger: 0.05,
        },
        'secotndPart'
      )
      .fromTo(
        '.accordion__header_border',
        {
          width: '0%',
        },
        {
          width: '100%',
          duration: 1.5,
          stagger: 0.1,
          ease: 'power3.inOut',
        },
        'secotndPart+=0.2'
      )
      .from(
        '.what-sets-us__show-more',
        {
          scaleX: 0,
          duration: 0.6,
          ease: 'power3.inOut',
        },
        '-=0.8'
      )
      .to('.what-sets-us__show-more .char-center', {
        duration: 3,
        scrambleText: {
          text: '{original}',
          chars: '0123456789!@#$%^&*()-_=+[]{};:<>/?,.',
          tweenLength: false,
        },
      })
      .from(
        '.what-sets-us__show-more .char-center',
        {
          opacity: 0,
          duration: 0.01,
          stagger: {
            amount: 1,
            from: 'random',
          },
        },
        '<'
      )
      .from(
        '.what-sets-us__show-more_dots span',
        {
          opacity: 0,
          duration: 0.4,
          stagger: 0.1,
        },
        '<+=0.3'
      );

    containerRef.value
      .querySelectorAll('.accordion__title')
      .forEach((value, index) => {
        mainTl.fromTo(
          value.querySelectorAll('.char-center'),
          {
            opacity: 0,
          },
          {
            duration: 0.1,
            opacity: 1,
            stagger: {
              each: 0.02,
              from: 'random',
            },
          },
          `secotndPart+=${0.5 + index * 0.2}`
        );
      });
  }, containerRef.value);
});

onUnmounted(() => {
  if (ctx) ctx.revert();
});

// const handleHoverEffect = () => {
//   const el = showMoreRef.value;
//   // Stop any ongoing animations on this element
//   if (gsap.isTweening(el)) return;

//   // Set the width to prevent layout shift
//   const width = el.offsetWidth;
//   gsap.set(el, { width });

//   playInteractionSound();

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

// const onMouseEnterHandler = () => {
//   handleHoverEffect();
// };

// const onFocusHandler = () => {
//   handleHoverEffect();
// };
</script>

<template>
  <div ref="containerRef" class="what-sets-us">
    <div class="container">
      <div class="what-sets-us__wrapper">
        <h2>What sets us apart</h2>
        <SetsUpAccordion :list="data" :multiple="true" />
        <!-- <div class="what-sets-us__show-more">
          <button @mouseenter="onMouseEnterHandler" @focus="onFocusHandler">
            <span ref="showMoreRef">Show More</span>
            <div class="what-sets-us__show-more_dots">
              <span />
              <span />
              <span />
            </div>
          </button>
        </div> -->
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;

.what-sets-us {
  @include flex-center;
  background-color: $color-foreground;
  color: $color-background;
  min-height: 100dvh;
  padding: 60px 0 60px 0;
  @include respond(mobile) {
    min-height: auto;
    padding: 48px 0 120px 0;
  }
  &__wrapper {
    max-width: 83.125%;
    margin: auto;
    @include respond(tablet) {
      max-width: 100%;
    }
  }
  h2 {
    font-size: clamp(32px, 5vw, 96px);
    font-style: normal;
    font-weight: 400;
    line-height: 100%;
    letter-spacing: -0.06em;
    margin-bottom: clamp(24px, 4.18vw, 80px);
  }
  &__show-more {
    margin-top: 48px;
    transform-origin: left;
    @include respond(mobile) {
      text-align: center;
    }
    button {
      padding-bottom: 12px;
      border-bottom: 1px dotted $color-background;
      font-family: 'RoobertMono';
      font-size: 1rem;
      font-style: normal;
      font-weight: 500;
      line-height: 1;
      text-transform: uppercase;
      padding-right: 44px;
      position: relative;
      min-width: 134px;
    }
    &_dots {
      display: inline-flex;
      gap: 2px;
      position: absolute;
      right: 0;
      span {
        width: 6px;
        height: 6px;
        background-color: $color-background;
        border-radius: 50%;
        display: inline-block;
      }
    }
    &:hover {
      .what-sets-us__show-more_dots {
        span {
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
}
</style>
