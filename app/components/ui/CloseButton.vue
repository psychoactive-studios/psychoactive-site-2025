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
    <span class="line line-1" />
    <span class="line line-2" />
  </button>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/functions' as *;

.button-close {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  position: relative;

  color: $color-background;
  border-radius: 50%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  place-items: center;
  gap: 4px;
  transition: color 0.3s ease;
  transition-delay: 0.3s;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background-color: $color-foreground;
    transition: opacity 0.3s ease;
    z-index: 0;
    transition: scale 0.3s cubic-bezier(0.33, 1, 0.68, 1), background-color 0.2s;
  }
  .dot {
    width: 6px;
    height: 6px;
    background: currentColor;
    border-radius: 50%;
    position: relative;
    z-index: 1;
    transition: transform 0.3s cubic-bezier(0.33, 1, 0.68, 1);
    &.dot-1 {
      align-self: self-end;
      justify-self: self-end;
    }
    &.dot-2 {
      align-self: self-end;
      justify-self: self-start;
    }
    &.dot-3 {
      align-self: self-start;
      justify-self: self-end;
    }
    &.dot-4 {
      align-self: self-start;
      justify-self: self-start;
    }
  }
  .line {
    display: block;
    height: 1px;
    width: 10px;
    background-color: rgbaColor($color-background, 20);
    position: absolute;
    top: 50%;
    left: 50%;
    transition: transform 0.3s cubic-bezier(0.33, 1, 0.68, 1);
    &.line-1 {
      transform: translate(-50%, -50%) rotate(45deg);
    }
    &.line-2 {
      transform: translate(-50%, -50%) rotate(-45deg);
    }
  }
  &:hover {
    .dot-1 {
      transform: translate(-2px, -2px);
    }
    .dot-2 {
      transform: translate(2px, -2px);
    }
    .dot-3 {
      transform: translate(-2px, 2px);
    }
    .dot-4 {
      transform: translate(2px, 2px);
    }
    .line-1 {
      transform: translate(-50%, -50%) rotate(45deg) scaleX(1.5);
    }
    .line-2 {
      transform: translate(-50%, -50%) rotate(-45deg) scaleX(1.5);
    }
    &::before {
      scale: 0.85;
    }
  }
}
</style>
