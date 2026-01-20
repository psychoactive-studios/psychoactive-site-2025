<script setup>
import { tadiSteps } from '~/data/contactData';
import ButtonDotsArrow from '../ui/ButtonDotsArrow.vue';
import TextField from '../ui/TextField.vue';
import useContact from '~/composables/useContact';

const { userData, currentStepId, handleNextStep } = useContact();

const onSubmit = (e) => {
  e.preventDefault();
  if (!userData.name?.trim()) return;
  console.log('userData.name', userData.name);

  // const nextStepId = tadiSteps[currentStepId.value]?.nextStep;
  // handleNextStep(nextStepId);
};
</script>

<template>
  <form class="name-form" @submit="onSubmit">
    <TextField
      v-model="userData.name"
      placeholder="Type your name"
      class="name-form__input"
    />
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
