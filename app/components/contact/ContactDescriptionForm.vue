<script setup>
import { useField, useForm } from 'vee-validate';
import { tadiSteps } from '~/data/contactData';
import ButtonDotsArrow from '../ui/ButtonDotsArrow.vue';
import TextField from '../ui/TextField.vue';
import useContact from '~/composables/useContact';
import LinkButton from '../ui/LinkButton.vue';

const { userData, currentStepId, handleNextStep } = useContact();

// Налаштування форми та валідації
const { handleSubmit } = useForm();

const { value: description, errorMessage } = useField(
  'name',
  (value) => {
    if (!value || !value.trim()) {
      return 'Fill your name please';
    }
    return true;
  },
  {
    initialValue: userData.name, // Ініціалізуємо поточним значенням, якщо воно є
  }
);

// Обробка відправки тільки якщо валідація пройшла успішно
const onSubmit = handleSubmit((values, event) => {
  console.log('userData.name', userData.name, values, event.evt);
  userData.name = values.name;
  const nextStepId = tadiSteps[currentStepId.value]?.nextStep;
  handleNextStep(nextStepId, event.evt);
});
</script>

<template>
  <form class="name-form" @submit="onSubmit">
    <div class="name-form__inner">
      <TextField
        rows="4"
        type="textarea"
        v-model="description"
        placeholder="Describe your project"
        class="name-form__input"
        :error-message="errorMessage"
      />
    </div>
    <LinkButton class="name-form__button" size="small">submit</LinkButton>
    <!-- <ButtonDotsArrow direction="right" class="name-form__button" /> -->
  </form>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/functions' as *;

.name-form {
  width: 100%;

  &__inner {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  &__input {
    width: 100%;
  }

  &__button {
    margin-top: 42px;
    // width: 96px;
    // height: 100%;
    // border-radius: 48px;
    // background: #fff;
    // :deep(.dots-arrow__icon_dot) {
    //   background-color: $color-background;
    // }
  }
}
</style>
