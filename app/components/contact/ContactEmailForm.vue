<script setup>
import { useField, useForm } from 'vee-validate';
import { tadiSteps } from '~/data/contactData';
import ButtonDotsArrow from '../ui/ButtonDotsArrow.vue';
import TextField from '../ui/TextField.vue';
import useContact from '~/composables/useContact';
import LinkButton from '../ui/LinkButton.vue';

const { userData, currentStepId, handleNextStep } = useContact();

const { handleSubmit } = useForm();

const { value: email, errorMessage: emailError } = useField(
  'email',
  (value) => {
    if (!value || !value.trim()) {
      return 'Fill your email please';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Enter a valid email';
    }
    return true;
  },
  {
    initialValue: userData.email,
  }
);

const onSubmit = handleSubmit((values, event) => {  
  userData.email = values.email;
  const nextStepId = tadiSteps[currentStepId.value]?.nextStep;
  handleNextStep(nextStepId, event.evt);
});
</script>

<template>
  <form class="email-form" @submit="onSubmit">
    <div class="email-form__inner">      
      <TextField
        v-model="email"
        placeholder="Type your email"
        class="email-form__input"
        :error-message="emailError"        
      />
    </div>
    <div class="contact-form__subtext body">We’ll only use this to follow up on your project. No mailing lists, no automated emails.</div>
    <LinkButton class="email-form__button" size="small">submit</LinkButton>
    <!-- <ButtonDotsArrow direction="right" class="name-form__button" /> -->
  </form>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;

.email-form {
  width: 100%;

  &__inner {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    gap: getRem(24);
  }

  &__input {
    width: 100%;
  }

  &__button {
    margin-top: 42px;
    @include respond(laptop-small) {
      margin-top: 24px;
    }
    // width: 96px;
    // height: 100%;
    // border-radius: 48px;
    // background: #fff;
    // :deep(.dots-arrow__icon_dot) {
    //   background-color: $color-background;
    // }
  }
  .contact-form__subtext {
    color: white(80);
    display: block;
    margin-top: getRem(48);
  }
}
</style>
