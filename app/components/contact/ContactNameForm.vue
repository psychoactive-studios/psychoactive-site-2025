<script setup lang="ts">
import ButtonDotsArrow from '../ui/ButtonDotsArrow.vue';
import TextField from '../ui/TextField.vue';
</script>

<template>
  <form action="" class="name-form">
    <TextField placeholder="Type your name" class="name-form__input" />
    <ButtonDotsArrow direction="right" class="name-form__button" />
  </form>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
.name-form {
  display: flex;
  gap: 24px;
  width: 100%;
  &__input {
    flex-grow: 1;
  }
  &__button {
    width: 96px;
    height: 100%;
    border-radius: 48px;
    background: #fff;
    :deep(.dots-arrow__icon_dot) {
      background-color: $color-background;
    }
  }
}
</style>
