<script setup>
import { useDateFormat, usePointer } from '@vueuse/core';
import gsap from 'gsap';
import useAudioManager from '~/composables/useAudioManager';

const { playInteractionSound, playRandomSound } = useAudioManager();
const { pointerType } = usePointer();

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const { data } = props;

const titleRef = ref(null);

const formatter = shallowRef('MMM YY');
const lang = shallowRef('en-US');
const publishedAt = useDateFormat(data.publishedAt, formatter, {
  locales: lang,
});

const href = computed(() => {
  if (data.externalLink) {
    return data.externalLink;
  }
  if (data.work && data.work.slug) {
    return `/work/${data.work.slug}`;
  }
  return `/content-hub/${data.slug}`;
});

const handleHoverEffect = () => {
  // Stop any ongoing animations on this element
  if (gsap.isTweening(titleRef.value) || pointerType.value === 'touch') return;

  // Set the width to prevent layout shift
  const width = titleRef.value.offsetWidth;
  const height = titleRef.value.offsetHeight;
  gsap.set(titleRef.value, { width, height });

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
  playRandomSound('text-hover');
  handleHoverEffect(e.target);
};

const onFocusHandler = (e) => {
  handleHoverEffect(e.target);
};

const handleSoundClick = () => {
  playRandomSound('click');
  playInteractionSound('menu-close', 150);
};
</script>

<template>
  <NuxtLink
    :to="href"
    :target="data.externalLink ? '_blank' : '_self'"
    class="news-card"
    @mouseenter="onMouseEnterHandler"
    @focus="onFocusHandler"
    @click="handleSoundClick"
  >
    <div class="news-card__description">
      <div class="news-card__description_info">
        <div class="news-card__description_info--category">
          {{ data.category.name }}
        </div>
        <div class="news-card__description_info--date">
          {{ publishedAt }}
        </div>
      </div>
      <h3 ref="titleRef" class="news-card__description_title">
        {{ data.title }}
      </h3>
    </div>
    <div class="news-card__image">
      <div class="news-card__image_wrapper">
        <NuxtImg
          :src="data?.preview?.url"
          :alt="data.title"
          width="230"
          height="230"
        />
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
.news-card {
  border-radius: 8px;
  background: #1b1b1b;
  padding: 1rem;
  display: flex;
  gap: 1rem;
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
      font-size: getRem(12);
      font-style: normal;
      font-weight: 500;
      line-height: 1.75;
      text-transform: uppercase;
      color: white(70);
      padding-left: 14px;
      position: relative;
      white-space: nowrap;
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
      font-size: clamp(24px, 1.67vw, 32px);
      font-style: normal;
      font-weight: 400;
      line-height: 1.12;
      margin-top: auto;
      margin-right: 6px;
      overflow: hidden;
    }
  }
  &__image {
    width: 30.3%;
    flex-shrink: 0;
    &_wrapper {
      width: 100%;
      aspect-ratio: 1 / 1;
      overflow: hidden;
      border-radius: 8px;
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
