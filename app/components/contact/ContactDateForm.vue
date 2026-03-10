<script setup>
import { useField, useForm } from 'vee-validate';
import { tadiSteps } from '~/data/contactData';
import ButtonDotsArrow from '../ui/ButtonDotsArrow.vue';
import TextField from '../ui/TextField.vue';
import useContact from '~/composables/useContact';
import LinkButton from '../ui/LinkButton.vue';

const { userData, currentStepId, handleNextStep } = useContact();

const { handleSubmit } = useForm();

const { value: date, errorMessage } = useField(
  'name',
  (value) => {
    if (!value || !value.trim()) {
      return 'Fill your deadline date';
    }
    return true;
  },
  {
    initialValue: userData.deadline,
  }
);

const onSubmit = handleSubmit((values, event) => {  
  userData.date = values;
  const nextStepId = tadiSteps[currentStepId.value]?.nextStep;
  handleNextStep(nextStepId, event.evt);
});
</script>

<template>
  <form class="name-form" @submit="onSubmit">
    <div class="name-form__inner">
      <TextField
        v-model="date"
        type="month"
        placeholder="Type your name"
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
