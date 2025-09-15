<template>
  <button class="sound-button">
    <span />
  </button>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/functions' as *;

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

.sound-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  position: fixed;
  top: 110px;
  right: 48px;
  & > span {
    width: 6px;
    height: 6px;
    background: $color-foreground;
    border-radius: 50%;
    position: relative;
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
      // width: 22px;
      // height: 22px;
      // border: 2px solid white(100);
      // top: -8px;
      // left: -8px;
      animation-delay: 0.5s;
    }
    // &::after {
    //   width: 48px;
    //   height: 48px;
    //   border: 2px solid white(100);
    //   top: -21px;
    //   left: -21px;
    // }
  }
}
</style>
