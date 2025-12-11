<template>
  <div class="progress">
    <div class="progress__bar" />
    <div class="progress__indicator" />
  </div>
</template>
<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;
.progress {
  position: fixed;
  right: 48px;
  bottom: 48px;
  width: 48px;
  height: 48px;
  border: 1px solid white(20);
  border-radius: 50%;
  transform-origin: right bottom;
  &::before {
    content: '';
    display: block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: $color-foreground;
    position: absolute;
    left: 50%;
    top: -3px;
    translate: -50% 0%;
  }
  &::after {
    content: '';
    display: block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: $color-foreground;
    position: absolute;
    left: 50%;
    top: 50%;
    translate: -50% -50%;
  }
  &__bar {
    border: 1px solid white(100);
    border-radius: 50%;
    position: absolute;
    inset: -1px;
    mask: conic-gradient(black 0%, transparent 0);
  }
  &__indicator {
    position: absolute;
    inset: 0;
    &::before {
      content: '';
      display: block;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background-color: $color-foreground;
      position: absolute;
      top: -3px;
      left: 50%;
      translate: -50% 0%;
    }
    &::after {
      content: '';
      display: block;
      width: 1px;
      height: 24px;
      background-color: $color-foreground;
      position: absolute;
      top: 0;
      left: 50%;
      translate: -50% 0%;
    }
  }
}
</style>
