<template>
  <div
    id="work-scroll-progress"
    class="progress"
    style="--work-scroll-progress: 0"
  >
    <div class="progress__bar" />
    <div class="progress__indicator" />
  </div>
</template>
<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;
.progress {
  position: fixed;
  right: 48px;
  bottom: 48px;
  width: 48px;
  height: 48px;
  border: 1px solid white(20);
  border-radius: 50%;
  // transform-origin: right bottom;
  z-index: 1;
  mix-blend-mode: exclusion;
  pointer-events: none;
  display: none;
  @include respond(mobile) {
    visibility: hidden;    
  }

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
    mask: conic-gradient(
      black calc(var(--work-scroll-progress) * 1%),
      transparent 0
    );
  }
  &__indicator {
    position: absolute;
    inset: 0;
    rotate: calc(var(--work-scroll-progress) * 3.6deg);
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
