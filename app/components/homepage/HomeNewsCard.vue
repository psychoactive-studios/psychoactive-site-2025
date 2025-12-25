<script setup>
import { useDateFormat, usePointer } from '@vueuse/core';
import gsap from 'gsap';
import useAudioManager from '~/composables/useAudioManager';

const { playInteractionSound } = useAudioManager();
const { pointerType } = usePointer();

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  src: {
    type: String,
    required: true,
  },
  href: {
    type: String,
    required: true,
  },
});

const formatter = shallowRef('MMM YY');
const lang = shallowRef('en-US');
const publishedAt = useDateFormat(props.date, formatter, {
  locales: lang,
});

const titleRef = ref(null);

const handleHoverEffect = () => {
  // Stop any ongoing animations on this element
  if (gsap.isTweening(titleRef.value) || pointerType.value === 'touch') return;

  // Set the width to prevent layout shift
  const width = titleRef.value.offsetWidth;
  const height = titleRef.value.offsetHeight;
  gsap.set(titleRef.value, { width, height });

  playInteractionSound();

  // Store the original text
  gsap.to(titleRef.value, {
    duration: 1.5,
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

const onMouseEnterHandler = (e) => {
  handleHoverEffect(e.target);
};

const onFocusHandler = (e) => {
  handleHoverEffect(e.target);
};
</script>

<template>
  <NuxtLink
    :to="href"
    class="news-card"
    @mouseenter="onMouseEnterHandler"
    @focus="onFocusHandler"
  >
    <div class="news-card__description">
      <div class="news-card__description_info">
        <div class="news-card__description_info--category">{{ category }}</div>
        <div class="news-card__description_info--date">{{ publishedAt }}</div>
      </div>
      <h3 ref="titleRef" class="news-card__description_title">
        {{ title }}
      </h3>
    </div>
    <div class="news-card__image">
      <div class="news-card__image_wrapper">
        <NuxtImg :src="src" :alt="title" width="200" height="200" />
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
.news-card {
  border-radius: 8px;
  background: #1b1b1b;
  padding: clamp(0.625rem, 0.833vw, 1rem);
  display: flex;
  gap: 1rem;
  @media screen and (max-width: 1400px) {
    padding: 1rem;
  }
  &__description {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex-grow: 1;
    &_info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'RoobertMono';
      font-size: clamp(0.625rem, 0.64vw, 0.75rem);
      font-style: normal;
      font-weight: 500;
      line-height: 1;
      text-transform: uppercase;
      color: white(70);
      padding-left: 14px;
      position: relative;
      white-space: nowrap;
      @media screen and (max-width: 1400px) {
        font-size: 0.75rem;
      }
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 6px;
        height: 6px;
        background-color: white(100);
        opacity: 0.5;
        border-radius: 50%;
      }
    }
    &_title {
      font-size: min(1rem, 0.833vw);
      font-style: normal;
      font-weight: 400;
      line-height: 131%;
      margin-top: auto;
      overflow: hidden;
      @media screen and (max-width: 1400px) {
        font-size: 1rem;
      }
    }
  }
  &__image {
    width: 30%;
    flex-shrink: 0;
    @media screen and (max-width: 1400px) {
      width: 115px;
    }
    &_wrapper {
      overflow: hidden;
      border-radius: 8px;
      width: 100%;
      aspect-ratio: 1 / 1;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 1s cubic-bezier(0.33, 1, 0.68, 1);
      will-change: transform;
      backface-visibility: hidden;
    }
  }
  &:hover {
    .news-card__image img {
      transform: scale(1.25);
    }
    .news-card__description_info::before {
      animation: flicker-effect-5 0.5s forwards;
    }
  }
}
</style>
