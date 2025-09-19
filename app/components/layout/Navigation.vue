<template>
  <nav class="navigation">
    <button id="header-navigation-button" class="navigation__button">
      <span />
      <span />
      <span />
      <span />
    </button>
  </nav>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables' as *;

.navigation {
  &__button {
    position: fixed;
    top: 48px;
    right: 48px;
    width: 48px;
    height: 48px;
    background: $color-foreground;
    color: $color-background;
    border-radius: 50%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    place-items: center;
    gap: 2px;
    & > span {
      width: 6px;
      height: 6px;
      background: currentColor;
      border-radius: 50%;
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
  }
}
</style>
