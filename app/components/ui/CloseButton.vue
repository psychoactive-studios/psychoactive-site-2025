<script setup>
defineProps({
  mode: {
    type: String,
    default: 'light',
  },
  ariaLabel: {
    type: String,
    default: 'Close video player',
  },
});
</script>
<template>
  <button
    :class="['button-close', `button-close--${mode}`]"
    :aria-label="ariaLabel"
  >
    <span class="dot dot-1" />
    <span class="dot dot-2" />
    <span class="dot dot-3" />
    <span class="dot dot-4" />
    <span class="dot dot-5" />
  </button>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables' as *;
$flicker-time: 0.5s;
$flicker-ease: ease;
.button-close {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  .dot {
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: currentColor;
    position: absolute;
    z-index: 2;
    &-1 {
      top: calc(50% - 8px);
      left: calc(50% - 8px);
    }
    &-2 {
      top: calc(50% - 8px);
      right: calc(50% - 8px);
    }
    &-3 {
      top: calc(50% - 3px);
      left: calc(50% - 3px);
    }
    &-4 {
      bottom: calc(50% - 8px);
      left: calc(50% - 8px);
    }
    &-5 {
      bottom: calc(50% - 8px);
      right: calc(50% - 8px);
    }
  }
  &__icon {
    width: 16px;
    height: 16px;
    position: relative;
    z-index: 1;
  }
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    z-index: 0;
    transition: scale 0.3s cubic-bezier(0.33, 1, 0.68, 1);
  }
  &--light {
    color: $color-background;
    &::before {
      background: $color-foreground;
    }
  }
  &:hover {
    &::before {
      scale: 0.85;
    }
    .dot {
      &-1 {
        animation: flicker-effect-1 $flicker-time $flicker-ease;
      }
      &-2 {
        animation: flicker-effect-2 $flicker-time $flicker-ease;
      }
      &-3 {
        animation: flicker-effect-3 $flicker-time $flicker-ease;
      }
      &-4 {
        animation: flicker-effect-4 $flicker-time $flicker-ease;
      }
      &-5 {
        animation: flicker-effect-5 $flicker-time $flicker-ease;
      }
    }
  }
}


</style>
