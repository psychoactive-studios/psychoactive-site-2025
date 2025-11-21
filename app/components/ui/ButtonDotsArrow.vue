<script setup>
import useAudioManager from '~/composables/useAudioManager';

defineProps({
  direction: {
    type: String,
    default: 'down',
  },
  rounded: {
    type: Boolean,
    default: true,
  },
  bordered: {
    type: Boolean,
    default: false,
  },
});

const { playInteractionSound } = useAudioManager();
</script>
<template>
  <button
    :class="[
      'dots-arrow',
      `dots-arrow--${direction}`,
      { 'dots-arrow--rounded': rounded },
      { 'dots-arrow--bordered': bordered },
    ]"
    aria-label="Scroll down"
    @mouseenter="playInteractionSound"
    @focus="playInteractionSound"
  >
    <div class="dots-arrow__icon">
      <span class="dots-arrow__icon_dot dots-arrow__icon_dot--1" />
      <span class="dots-arrow__icon_dot dots-arrow__icon_dot--2" />
      <span class="dots-arrow__icon_dot dots-arrow__icon_dot--3" />
    </div>
  </button>
</template>
<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;
.dots-arrow {
  @include flex-center;
  width: 48px;
  height: 48px;
  &:disabled {
    opacity: 0.4;
    pointer-events: none;
  }
  &:hover {
    .dots-arrow__icon {
      &_dot {
        &--1 {
          animation: flicker-effect-1 0.6s ease;
        }
        &--2 {
          animation: flicker-effect-3 0.6s ease;
        }
        &--3 {
          animation: flicker-effect-5 0.6s ease;
        }
      }
    }
  }
  &__icon {
    width: 16px;
    height: 16px;
    position: relative;
    &_dot {
      display: block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      position: absolute;
      background-color: $color-foreground;
      &--1 {
        top: 2px;
        left: 1px;
      }
      &--2 {
        top: 2px;
        right: 1px;
      }
      &--3 {
        bottom: 1px;
        left: calc(50% - 3px);
      }
    }
  }
  &--bordered {
    border: 1px solid white(10);
  }
  &--rounded {
    border-radius: 50%;
  }
  &--down {
    .dots-arrow__icon {
      transform: rotate(0deg);
    }
  }
  &--up {
    .dots-arrow__icon {
      transform: rotate(180deg);
    }
  }
  &--left {
    .dots-arrow__icon {
      transform: rotate(90deg);
    }
  }
  &--right {
    .dots-arrow__icon {
      transform: rotate(270deg);
    }
  }
}
</style>
