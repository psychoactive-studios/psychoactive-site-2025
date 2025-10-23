<script setup>
import { ref } from 'vue';
import BulgeImage from '@/components/ui/BulgeImage.vue';

const isHovered = ref(false);

const handleMouseEnter = () => {
  isHovered.value = true;
};

const handleMouseLeave = () => {
  isHovered.value = false;
};
</script>

<template>
  <div
    class="case-study-preview"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div ref="mediaElement" class="case-study-preview__media">
      <BulgeImage src="/img/cases/case-super-ai.png" :is-visible="isHovered" />
      <!-- <img
        src="/img/cases/case-super-ai.png"
        alt="Super AI Case"
        class="case-study-preview__image"
      /> -->
    </div>
    <div class="case-study-preview__content">
      <div class="case-study-preview__title">
        <h3>SuperAI Conference</h3>
        <p>Worlds largest AI event</p>
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

.case-study-preview {
  position: relative;
  cursor: pointer;

  &__media {
    overflow: hidden;
    border-radius: 16px;
    aspect-ratio: 1.85;
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
    h3 {
      font-size: getRem(20);
      line-height: 1.5;
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
}
</style>
