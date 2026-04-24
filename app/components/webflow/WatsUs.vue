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
    ]),
    {
      type: 'words,chars',
      charsClass: 'char-center',
    }
  );
  ctx = gsap.context(() => {
    // Heading animates on its own trigger — fires when the heading
    // itself scrolls into view.
    gsap.from(
      containerRef.value.querySelectorAll('h2 .char-center'),
      {
        scrollTrigger: {
          trigger: containerRef.value.querySelector('h2'),
          start: 'top 85%',
        },
        duration: 0.1,
        opacity: 0,
        stagger: 0.02,
      }
    );

    // Each accordion item gets its OWN ScrollTrigger, so rows reveal
    // one-by-one as the user scrolls into each row — rather than all
    // staggering together off a single section-level trigger.
    const items = containerRef.value.querySelectorAll('.accordion__item');
    items.forEach((item) => {
      const icon = item.querySelector('.accordion__header_icon');
      const border = item.querySelector('.accordion__header_border');
      const titleChars = item.querySelectorAll('.accordion__title .char-center');

      gsap
        .timeline({
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
          },
        })
        .from(icon, {
          scale: 0,
          duration: 0.5,
          ease: 'power3.out',
        })
        .from(
          border,
          {
            opacity: 0,
            duration: 0.4,
          },
          '<'
        )
        .fromTo(
          border,
          { width: '0%' },
          {
            width: '100%',
            duration: 1.2,
            ease: 'power3.inOut',
          },
          '<+=0.1'
        )
        .fromTo(
          titleChars,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.1,
            stagger: {
              each: 0.02,
              from: 'random',
            },
          },
          '<+=0.2'
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
        <h2 class="heading-h1--mobile">What sets us apart</h2>
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
  background-color: $color-foreground;
  color: $color-background;
  min-height: 100svh;
  padding: 160px 0;
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
