<script setup>
import PlusIcon from '~/assets/icons/icon-plus.svg';
</script>
<template>
  <div class="center">
    <div class="center__left">
      <div class="center__tunnel">
        <span v-for="i in 5" :key="i">
          <PlusIcon />
          <PlusIcon />
        </span>
      </div>
    </div>
    <div class="center__right">
      <div class="center__tunnel">
        <span v-for="i in 5" :key="i">
          <PlusIcon />
          <PlusIcon />
        </span>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
@use 'sass:math';
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/animations';
@use '~/assets/styles/mixins' as *;
.center {
  position: absolute;
  top: calc(50% - 3px);
  z-index: 1;
  mix-blend-mode: exclusion;
  &__left {
    position: absolute;
    width: 51vw;
    right: calc(50% - 3px);
    overflow: hidden;
    .center__tunnel {
      flex-direction: row-reverse;
    }
  }
  &__right {
    position: absolute;
    width: 51vw;
    left: calc(50% - 3px);
    overflow: hidden;
    .center__tunnel span {
      animation-name: tunnel-right;
    }
  }
  &__tunnel {
    display: flex;
    gap: 10vw;
    justify-content: flex-start;
    @include respond(mobile) {
      gap: 25vw;
    }
    span {
      width: 64px;
      display: flex;
      flex-shrink: 0;
      justify-content: space-between;
      color: white(50);
      animation: tunnel-left 10s linear infinite;
      svg {
        width: 7px;
        height: 7px;
      }

      @for $i from 1 through 5 {
        &:nth-child(#{$i}) {
          svg:nth-child(1) {
            animation: flicker-pause-#{math.random(3)} 3s linear infinite;
            animation-delay: #{math.div(math.random(20), 10)}s;
          }
          svg:nth-child(2) {
            animation: flicker-pause-#{math.random(3)} 3s linear infinite;
            animation-delay: #{math.div(math.random(20), 10)}s;
          }
        }
      }
    }
  }
  @keyframes tunnel-left {
    from {
      transform: translateX(calc(10vw + 64px));
    }
    to {
      transform: translateX(0);
    }
  }
  @keyframes tunnel-right {
    from {
      transform: translateX(calc(-10vw - 64px));
    }
    to {
      transform: translateX(0);
    }
  }
  @keyframes flicker-pause-1 {
    0% {
      opacity: 1;
    }
    2% {
      opacity: 0.1;
    }
    5% {
      opacity: 0.9;
    }
    8% {
      opacity: 0;
    }
    12% {
      opacity: 1;
    }
    100% {
      opacity: 1;
    }
  }
  @keyframes flicker-pause-2 {
    0% {
      opacity: 0.8;
    }
    2% {
      opacity: 0;
    }
    5% {
      opacity: 1;
    }
    8% {
      opacity: 0.2;
    }
    12% {
      opacity: 0.9;
    }
    100% {
      opacity: 1;
    }
  }
  @keyframes flicker-pause-3 {
    0% {
      opacity: 0.5;
    }
    3% {
      opacity: 1;
    }
    5% {
      opacity: 0;
    }
    9% {
      opacity: 0.8;
    }
    12% {
      opacity: 0.1;
    }
    15% {
      opacity: 1;
    }
    100% {
      opacity: 1;
    }
  }
}
</style>
