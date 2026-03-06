<script setup>
import { tadiSteps } from '~/data/contactData';
import useContact from '~/composables/useContact';
import LinkButton from '../ui/LinkButton.vue';

const { userData, currentStepId, handleNextStep } = useContact();

const onSubmit = (event, value) => {   
  userData.budget = value;
  const nextStepId = tadiSteps[currentStepId.value]?.nextStep;
  handleNextStep(nextStepId, event);
};
</script>

<template>
  <div class="goal-buttons">
    <LinkButton
      class="contact-form__action_button"
      size="small"
      data-index="0"
      @click="(e) => onSubmit(e, 'Branding')"
    >
      $50K–$75K
    </LinkButton>
    <LinkButton
      class="contact-form__action_button"
      size="small"
      data-index="1"      
      @click="(e) => onSubmit(e, 'Website')"
    >
      $75K–$100K
    </LinkButton>
    <LinkButton
      class="contact-form__action_button"
      size="small"
      data-index="2"      
      @click="(e) => onSubmit(e, 'Branding & Website')"
    >
      $100K+
    </LinkButton>    
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/functions' as *;

.goal-buttons {
  width: 100%;  
  display: flex;
  gap: getRem(12);
  align-items: center;
  flex-wrap: wrap;
}
</style>
