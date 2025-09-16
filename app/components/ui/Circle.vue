<template>
  <div>
    <div class="circle-dots" />
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

      <!-- This is the first animated line. It starts from the top. -->
      <circle
        class="circle-path-1"
        cx="100"
        cy="100"
        r="99.7"
        fill="none"
        stroke="#ffffff"
        stroke-width="0.3"
        stroke-linecap="round"
      />
      <!-- This is the second animated line. It starts from the bottom. -->
      <circle
        class="circle-path-2"
        cx="100"
        cy="100"
        r="99.7"
        fill="none"
        stroke="#ffffff"
        stroke-width="0.3"
        stroke-linecap="round"
      />
    </svg>
  </div>
</template>

<style lang="scss">
@use '~/assets/styles/functions' as *;

.circle-path-1,
.circle-path-2 {
  opacity: 0.2;
  stroke-dasharray: 626.43; /* 2 * PI * 99.7 */
  // stroke-dashoffset: 626.43;
  transform-origin: center;
}
.circle-path-1 {
  stroke-dashoffset: 469.82;
}
.circle-path-2 {
  stroke-dashoffset: 469.82;
  transform: rotate(180deg);
}
.circle-dots {
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
    background: white(50);
    border-radius: 50%;
  }
  &::before {
    top: 50%;
    left: -3px;
  }
  &::after {
    top: 50%;
    right: -3px;
  }
}
</style>
