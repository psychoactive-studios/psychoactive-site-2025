<script setup>
import BulgeImage from '@/components/ui/BulgeImage.vue';
import useAudioManager from '~/composables/useAudioManager';
import gsap from 'gsap';

const { playInteractionSound, playRandomSound } = useAudioManager();
const containerRef = ref(null);
const titleRef = ref(null);
const imageRef = ref(null);

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const { mainImage, slug, mainTitle, hero } = props?.data || {};

const handleMouseEnter = () => {
  // Stop any ongoing animations on this element
  if (gsap.isTweening(titleRef.value)) return;

  // Set the width to prevent layout shift
  const width = titleRef.value.offsetWidth;
  gsap.set(titleRef.value, { width });

  playRandomSound('text-hover');

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

const handleClick = () => {
  playRandomSound('click');
  playInteractionSound('menu-close', 150);
  if (imageRef.value && imageRef.value.handleClick) {
    gsap.set(containerRef.value, { zIndex: 2 });
    imageRef.value.handleClick(`/work/${slug}`);
  }
};
</script>

<template>
  <div
    ref="containerRef"
    class="case-study-preview"
    @mouseenter="handleMouseEnter"
    @click="handleClick"
  >
    <div ref="mediaElement" class="case-study-preview__media">
      <!-- <img :src="mainImage?.url" alt="" /> -->
      <BulgeImage ref="imageRef" :src="mainImage?.url" />
    </div>
    <div class="case-study-preview__content">
      <div class="case-study-preview__title">
        <div class="case-study-preview__title-wapper">
          <div class="case-study-preview__title-text">{{ mainTitle }}</div>
          <h3 ref="titleRef" class="body-large--mobile">
            <NuxtLink :to="`/work/${slug}`" @click.prevent.stop="handleClick">{{
              mainTitle
            }}</NuxtLink>
          </h3>
        </div>
        <p class="subheader--mobile">{{ hero?.subTitle }}</p>
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
    aspect-ratio: 1.95;
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
    flex-grow: 1;
    &-wapper {
      position: relative;
      h3 {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
    }
    &-text {
      visibility: hidden;
    }
    p {
      margin-top: getRem(8);
      opacity: 0.5;
      mix-blend-mode: difference;
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
