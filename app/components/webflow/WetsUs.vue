<script setup>
import gsap from 'gsap';
import SetsUpAccordion from '../ui/SetsUpAccordion.vue';
import useAudioManager from '~/composables/useAudioManager';

const list = [
  {
    title: 'Webflow Design & Development',
    content:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Animi natus facilis quasi, eligendi autem beatae nemo consequatur magnam hic odit enim odio sed architecto maxime id.',
  },
  {
    title: 'Custom Code & Integrations',
    content:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Animi natus facilis quasi, eligendi autem beatae nemo consequatur magnam hic odit enim odio sed architecto maxime id.',
  },
  {
    title: 'Enterprise Solutions & Scalability',
    content:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Animi natus facilis quasi, eligendi autem beatae nemo consequatur magnam hic odit enim odio sed architecto maxime id.',
  },
  {
    title: 'SEO & AI Optimisation',
    content:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Animi natus facilis quasi, eligendi autem beatae nemo consequatur magnam hic odit enim odio sed architecto maxime id.',
  },
  {
    title: 'Maintenance & Partnership',
    content:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Animi natus facilis quasi, eligendi autem beatae nemo consequatur magnam hic odit enim odio sed architecto maxime id.',
  },
];

const { playInteractionSound } = useAudioManager();
const showMoreRef = ref(null);

const handleHoverEffect = () => {
  const el = showMoreRef.value;
  // Stop any ongoing animations on this element
  if (gsap.isTweening(el)) return;

  // Set the width to prevent layout shift
  const width = el.offsetWidth;
  gsap.set(el, { width });

  playInteractionSound();

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

const onMouseEnterHandler = () => {
  handleHoverEffect();
};

const onFocusHandler = () => {
  handleHoverEffect();
};
</script>

<template>
  <div class="what-sets-us">
    <div class="container">
      <div class="what-sets-us__wrapper">
        <h2>What sets us apart</h2>
        <SetsUpAccordion :list="list" :multiple="true" />
        <div class="what-sets-us__show-more">
          <button @mouseenter="onMouseEnterHandler" @focus="onFocusHandler">
            <span ref="showMoreRef">Show More</span>
            <div class="what-sets-us__show-more_dots">
              <span />
              <span />
              <span />
            </div>
          </button>
        </div>
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
  padding: 160px 0 190px 0;
  &__wrapper {
    max-width: 83.125%;
    margin: auto;
  }
  h2 {
    font-size: clamp(64px, 5vw, 96px);
    font-style: normal;
    font-weight: 400;
    line-height: 100%;
    letter-spacing: -0.06em;
    margin-bottom: 80px;
  }
  &__show-more {
    margin-top: 48px;
    @include respond(mobile) {
      margin-top: getRem(24);
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
