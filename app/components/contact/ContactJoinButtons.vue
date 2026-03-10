<script setup>
import { tadiSteps } from '~/data/contactData';
import useContact from '~/composables/useContact';
import LinkButton from '../ui/LinkButton.vue';

const { userData, currentStepId, handleNextStep } = useContact();

const onSubmit = (event, value) => {   
  // userData.budget = value;
  const nextStepId = tadiSteps[currentStepId.value]?.nextStep;
  handleNextStep(nextStepId, event);
};
</script>

<template>
  <div class="join-team-buttons">
    <LinkButton
      class="contact-form__action_button"
      size="small"
      data-index="0"
      @click="(e) => onSubmit(e, 'Design')"
    >
      Design
    </LinkButton>
    <LinkButton
      class="contact-form__action_button"
      size="small"
      data-index="1"
      @click="(e) => onSubmit(e, 'Development')"
    >
      Development
    </LinkButton>
    <LinkButton
      class="contact-form__action_button"
      size="small"
      data-index="2"
      @click="(e) => onSubmit(e, 'Motion / 3D')"
    >
      Motion / 3D
    </LinkButton>
    <LinkButton
      class="contact-form__action_button"
      size="small"
      data-index="3"
      @click="(e) => onSubmit(e, 'Strategy / Content')"
    >
      Strategy / Content
    </LinkButton>
    
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/functions' as *;

.join-team-buttons {
  width: 100%;  
  display: flex;
  gap: getRem(12);
  align-items: center;
  flex-wrap: wrap;
}
</style>
