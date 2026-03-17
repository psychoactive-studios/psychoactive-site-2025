<script setup>
import { useField, useForm } from 'vee-validate';
import { tadiSteps } from '~/data/contactData';
import ButtonDotsArrow from '../ui/ButtonDotsArrow.vue';
import TextField from '../ui/TextField.vue';
import useContact from '~/composables/useContact';
import LinkButton from '../ui/LinkButton.vue';

const { userData, currentStepId, handleNextStep } = useContact();

const { handleSubmit } = useForm();

const { value: company, errorMessage: companyErrorMessage } = useField(
  'company',
  (value) => {
    if (!value || !value.trim()) {
      return 'Fill your company name please';
    }
    return true;
  },
  {
    initialValue: userData.company,
  }
);


const { value: role, errorMessage: roleErrorMessage } = useField(
  'role',
  (value) => {
    if (!value || !value.trim()) {
      return 'Fill your role please';
    }
    return true;
  },
  {
    initialValue: userData.role,
  }
);

const onSubmit = handleSubmit((values, event) => {  
  userData.company = values.company;
  userData.role = values.role;  
  const nextStepId = tadiSteps[currentStepId.value]?.nextStep; 
  handleNextStep(nextStepId, event.evt);
});
</script>

<template>
  <form class="name-form" @submit="onSubmit">
    <div class="name-form__inner">
      <TextField
        v-model="company"
        placeholder="Type your company"
        class="name-form__input"
        :error-message="companyErrorMessage"
      />  
      <TextField
        v-model="role"
        placeholder="Type your role"
        class="name-form__input"
        :error-message="roleErrorMessage"
      />    
    </div>    
    <LinkButton class="name-form__button" size="small">submit</LinkButton>
    <!-- <ButtonDotsArrow direction="right" class="name-form__button" /> -->
  </form>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;

.name-form {
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
}
</style>
