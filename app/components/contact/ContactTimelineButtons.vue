<script setup>
import { tadiSteps } from '~/data/contactData';
import useContact from '~/composables/useContact';
import LinkButton from '../ui/LinkButton.vue';

const { userData, confirmMessagesRelations, currentStepId, handleNextStep } = useContact();

const onSubmit = (event, value, type) => {
  let nextStepId = null;
  if(value) {
    userData.deadline = value;    
    nextStepId = tadiSteps[currentStepId.value]?.nextStep;
  }else{
    nextStepId = 'ask_date';
  }
  confirmMessagesRelations[currentStepId.value] = type;  
  handleNextStep(nextStepId, event);
};
</script>

<template>
  <div class="goal-buttons">
    <LinkButton
      class="contact-form__action_button"
      size="small"
      data-index="0"
      @click="(e) => onSubmit(e, 'ASAP', 'asap')"
    >
      ASAP
    </LinkButton>
    <LinkButton
      class="contact-form__action_button"
      size="small"
      data-index="1"
      @click="(e) => onSubmit(e, 'Within 6 months', 'within_6_months')"
    >
      Within 6 months
    </LinkButton>
    <LinkButton
      class="contact-form__action_button"
      size="small"
      data-index="2"
      @click="(e) => onSubmit(e, 'Flexible', 'flexible')"
    >
      Flexible
    </LinkButton>
    <LinkButton
      class="contact-form__action_button"
      size="small"
      data-index="3"
      @click="(e) => onSubmit(e, null, 'ask_date')"
    >
      I have a set date
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
