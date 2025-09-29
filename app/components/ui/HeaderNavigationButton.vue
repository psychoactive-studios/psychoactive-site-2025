<script setup>
import useNavigation from '~/composables/useNavigation';

const { isOpen, openNavigation, closeNavigation } = useNavigation();

const onClickHandler = () => {
  if (isOpen.value) {
    closeNavigation();
  } else {
    openNavigation();
  }
};
</script>
<template>
  <button
    id="header-navigation-button"
    class="header__navigation-button"
    @click="onClickHandler"
  >
    <span class="dot dot-1" />
    <span class="dot dot-2" />
    <span class="dot dot-3" />
    <span class="dot dot-4" />
  </button>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables' as *;
$flicker-time: 0.5s;
$flicker-ease: ease;
.header__navigation-button {
  position: fixed;
  top: 48px;
  right: 48px;
  width: 48px;
  height: 48px;
  color: $color-background;
  border-radius: 50%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  place-items: center;
  gap: 2px;
  z-index: 1000;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background-color: $color-foreground;
    transition: opacity 0.3s ease;
    z-index: 0;
    transition: scale 0.3s cubic-bezier(0.33, 1, 0.68, 1);
  }
  & > span {
    width: 6px;
    height: 6px;
    background: currentColor;
    border-radius: 50%;
    position: relative;
    z-index: 1;
    &:nth-child(1) {
      align-self: self-end;
      justify-self: self-end;
    }
    &:nth-child(2) {
      align-self: self-end;
      justify-self: self-start;
    }
    &:nth-child(3) {
      align-self: self-start;
      justify-self: self-end;
    }
    &:nth-child(4) {
      align-self: self-start;
      justify-self: self-start;
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
