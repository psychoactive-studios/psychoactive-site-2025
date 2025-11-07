<script setup>
import BulgeImage from '@/components/ui/BulgeImage.vue';
import useAudioManager from '~/composables/useAudioManager';
import gsap from 'gsap';

const { playInteractionSound } = useAudioManager();

const titleRef = ref(null);

defineProps({
  src: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
    default: '',
  },
});

const handleMouseEnter = () => {
  // Stop any ongoing animations on this element
  if (gsap.isTweening(titleRef.value)) return;

  // Set the width to prevent layout shift
  const width = titleRef.value.offsetWidth;
  gsap.set(titleRef.value, { width });

  playInteractionSound();

  // Store the original text
  gsap.to(titleRef.value, {
    duration: 0.7,
    ease: 'none',
    scrambleText: {
      text: '{original}',
      chars: '0123456789!@#$%^&*()-_=+[]{};:<>/?,.',
      tweenLength: false,
    },
    overwrite: true,
    onComplete: () => {
      gsap.set(titleRef.value, { clearProps: 'all' });
    },
  });
};
</script>

<template>
  <div class="case-study-preview" @mouseenter="handleMouseEnter">
    <div ref="mediaElement" class="case-study-preview__media">
      <BulgeImage :src="src" />
    </div>
    <div class="case-study-preview__content">
      <div class="case-study-preview__title">
        <h3 ref="titleRef">{{ title }}</h3>
        <p>{{ description }}</p>
      </div>
      <div class="case-study-preview__dots">
        <span />
        <span />
        <span />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;

.case-study-preview {
  position: relative;
  cursor: pointer;

  &__media {
    overflow: hidden;
    border-radius: 10px;
    aspect-ratio: 1.85;
    @include respond(mobile) {
      border-radius: 6px;
    }
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }

  &:hover &__image {
    transform: scale(1.05);
    opacity: 0;
  }

  &__content {
    margin-top: getRem(24);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  &__title {
    color: $color-foreground;
    margin-top: getRem(-7);
    h3 {
      font-size: getRem(20);
      line-height: 1.4;
      font-weight: 400;
    }
    p {
      font-family: 'RoobertMono';
      font-size: getRem(16);
      font-weight: 500;
      line-height: 1.5;
      text-transform: uppercase;
      opacity: 0.5;
      mix-blend-mode: difference;
      @include respond(mobile) {
        font-size: getRem(14);
      }
    }
  }

  &__dots {
    display: grid;
    grid-template-columns: repeat(2, auto);
    gap: 2px;
    rotate: 90deg;
    span {
      display: block;
      width: 6px;
      height: 6px;
      background-color: $color-foreground;
      border-radius: 50%;
    }
  }

  &:hover {
    .case-study-preview__dots {
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
</style>
