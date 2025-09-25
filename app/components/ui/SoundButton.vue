<script setup>
defineProps({
  mode: {
    type: String,
    default: 'outline', // or 'outline'
  },
  muted: {
    type: Boolean,
    default: false,
  },
});
</script>
<template>
  <button
    :class="[
      'sound-button',
      `sound-button--${mode}`,
      `sound-button--${muted ? 'muted' : 'unmuted'}`,
    ]"
  >
    <span />
  </button>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/functions' as *;

.sound-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  &::after {
    content: '';
    position: absolute;
    top: calc(50% - 3px);
    left: calc(50% - 3px);
    width: 6px;
    height: 6px;
    background: $color-foreground;
    border-radius: 50%;
    z-index: 1;
  }
  &--unmuted {
    & > span {
      width: 6px;
      height: 6px;
      position: relative;
      z-index: 1;
      &::before,
      &::after {
        content: '';
        position: absolute;
        border-radius: 50%;
        animation: pulse 1.6s linear infinite;
        width: 48px;
        height: 48px;
        border: 2px solid white(100);
        top: -21px;
        left: -21px;
      }
      &::before {
        animation-delay: 0.5s;
      }
    }
  }
  &--filled {
    &::after {
      background-color: $color-background;
    }
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: $color-foreground;
      transition: scale 0.3s cubic-bezier(0.33, 1, 0.68, 1);
      z-index: 0;
    }
    & > span {
      &::before,
      &::after {
        border-color: $color-background;
      }
    }
    &:hover {
      &::before {
        scale: 0.85;
      }
    }
  }
  &:hover {
    &::after {
      animation: flicker-effect 0.6s ease;
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

@keyframes flicker-effect {
  0% {
    opacity: 1;
  }
  4% {
    opacity: 0.1;
  }
  // 9% {
  //   opacity: 0.8;
  // }
  15% {
    opacity: 0.9;
  }
  21% {
    opacity: 0.1;
  }
  26% {
    opacity: 0.9;
  }
  32% {
    opacity: 0;
  }
  // 40% {
  //   opacity: 0.2;
  // }
  48% {
    opacity: 1;
  }
  56% {
    opacity: 0.1;
  }
  // 62% {
  //   opacity: 1;
  // }
  70% {
    opacity: 1;
  }
  78% {
    opacity: 0;
  }
  86% {
    opacity: 1;
  }
  93% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
