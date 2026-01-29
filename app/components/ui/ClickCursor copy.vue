<template>
  <div id="click-cursor" class="click-cursor">CLICK ME</div>
</template>
<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/functions' as *;
.click-cursor {
  @include flex-center;
  min-width: 96px;
  height: 48px;
  padding: getRem(8) getRem(24);
  color: $color-background;
  font-family: 'RoobertMono';
  font-size: 1rem;
  font-weight: 500;
  text-transform: uppercase;
  background-color: $color-foreground;
  border-radius: 48px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  will-change: transform;
  transform: scale(0);
  pointer-events: none;
}
</style>
