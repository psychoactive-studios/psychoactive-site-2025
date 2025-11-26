<template>
  <div>
    <div class="circle-dots-start" />
    <div class="circle-dots-end" />
    <svg viewBox="0 0 200 200">
      <!-- This is an invisible circle that defines the shape -->
      <!-- <circle
      cx="100"
      cy="100"
      r="99.7"
      fill="none"
      stroke="#ffffff"
      stroke-width="0.3"
    /> -->

      <defs>
        <linearGradient
          id="gradient_circle_1"
          x1="0"
          y1="0"
          x2="200"
          y2="200"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#FF9A9A" />
          <stop offset="0.432692" stop-color="#FFD79B" />
          <stop offset="0.745" stop-color="#CCF0FF" />
          <stop offset="1" stop-color="#6397FF" />
        </linearGradient>
      </defs>
      <defs>
        <linearGradient
          id="gradient_circle_2"
          x1="200"
          y1="200"
          x2="0"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#FF9A9A" />
          <stop offset="0.432692" stop-color="#FFD79B" />
          <stop offset="0.745" stop-color="#CCF0FF" />
          <stop offset="1" stop-color="#6397FF" />
        </linearGradient>
      </defs>
      <defs>
        <mask id="circleMask">
          <circle cx="100" cy="100" r="99.7" class="mask-circle" />
        </mask>
      </defs>

      <!-- This is the first animated line. It starts from the top. -->
      <circle
        class="circle-path-1"
        cx="100"
        cy="100"
        r="99.7"
        fill="none"
        stroke="url(#gradient_circle_1)"
        stroke-width="0.3"
        stroke-linecap="round"
        mask="url(#circleMask)"
      />
      <!-- This is the second animated line. It starts from the bottom. -->
      <circle
        class="circle-path-2"
        cx="100"
        cy="100"
        r="99.7"
        fill="none"
        stroke="url(#gradient_circle_2)"
        stroke-width="0.3"
        stroke-linecap="round"
        mask="url(#circleMask)"
      />
    </svg>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;

.mask-circle {
  fill: none;
  stroke: #ffffff;
  stroke-dasharray: 45px 19px;
  stroke-dashoffset: 7px;
}

.circle-path-1,
.circle-path-2 {
  opacity: 0.5;
  stroke-dasharray: 626.43; /* 2 * PI * 99.7 */
  // stroke-dashoffset: 626.43;
  transform-origin: center;
  @include respond(portrait) {
    opacity: 0.4;
  }
}
.circle-path-1 {
  stroke-dashoffset: 467.92;
}
.circle-path-2 {
  stroke-dashoffset: 470.22;
  transform: rotate(180deg);
}
.circle-dots-start {
  position: absolute;
  inset: 0;
  transform-origin: center;
  transform: rotate(0deg);
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }
  &::before {
    top: calc(50% - 2px);
    left: -2px;
    background: rgba(255, 226, 183, 0.5);
  }
  &::after {
    top: 50%;
    right: -2px;
    background: #eaf5f6;
  }
}
.circle-dots-end {
  position: absolute;
  inset: 0;
  transform-origin: center;
  transform: rotate(91deg);
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }
  &::before {
    top: calc(50%);
    left: -2px;
    background: rgba(255, 154, 154, 0.5);
  }
  &::after {
    top: 50%;
    right: -2px;
    background: rgba(99, 151, 255, 0.5);
  }
}
</style>
