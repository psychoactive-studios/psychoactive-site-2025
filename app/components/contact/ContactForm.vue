<script setup>
import gsap from 'gsap';

import useLoader from '~/composables/useLoader';
import useContact from '~/composables/useContact';
import useAudioManager from '~/composables/useAudioManager';

import ContactNameForm from './ContactNameForm.vue';
import LinkButton from '../ui/LinkButton.vue';
import ButtonOutline from '../ui/ButtonOutline.vue';

import { tadiSteps } from '~/data/contactData';
import ContactRoleForm from './ContactRoleForm.vue';
import ContactGoalButtons from './ContactGoalButtons.vue';
import ContactBudgetButtons from './ContactBudgetButtons.vue';
import ContactTimelineButtons from './ContactTimelineButtons.vue';
import ContactDateForm from './ContactDateForm.vue';
import ContactDescriptionForm from './ContactDescriptionForm.vue';





const {
  sceneRef,
  dotsRef,
  previousSectionRef,
  currentSectionRef,
  currentSectionTextRef,
  enterAnimation,
  currentMessage,
  previousMessage,
  actionsRef,
  handleTestClick,
  handleNextStep,
  getRandomMessage,
  currentStepId,
  dotsTimeline,
} = useContact();

const { isLoading } = useLoader();
const {
  playInteractionSound,
  playRandomSound,
  isSoundApproved,
  hasInteracted,
} = useAudioManager();

onMounted(() => {
  currentMessage.value = getRandomMessage(tadiSteps[currentStepId.value]?.messages[0]?.variations);

  const dotsLeft = dotsRef.value.querySelector('.contact-form__dots .dot-left');
  const dotsRight = dotsRef.value.querySelector(
    '.contact-form__dots .dot-right'
  );
  dotsTimeline.value = gsap
    .timeline({ paused: true })
    .to(gsap.utils.toArray([dotsLeft, dotsRight]), {
      duration: 0.8,
      width: '0%',
      ease: 'power1.in',
      overwrite: 'auto',
    })
    .set(dotsLeft, {
      left: '50%',
    })
    .set(dotsRight, {
      right: '50%',
    })
    .to(gsap.utils.toArray([dotsLeft, dotsRight]), {
      duration: 0.8,
      width: '50%',
      ease: 'power1.out',
      overwrite: 'auto',
    });

  dotsTimeline.value.restart();
});

watch(isLoading, (newVal) => {
  if (!newVal) {
    enterAnimation();
  }
});


</script>

<!-- Oh look, a visitor! I should start charging admission. Need anything? -->

<template>
  <div class="contact-form">
    <div ref="dotsRef" class="contact-form__dots">
      <span class="dot-left" />
      <span class="dot-center" />
      <span class="dot-right" />
    </div>

    <ButtonOutline class="contact-back-button" @click="playRandomSound('click')"
      >Back</ButtonOutline
    >

    <div class="contact-form__content">
      <div ref="previousSectionRef" class="contact-form__previous">
        {{ previousMessage }}
      </div>
      <div ref="currentSectionRef" class="contact-form__step">
        <span ref="currentSectionTextRef">{{ currentMessage }}</span>
      </div>
      <div class="contact-form__action">
        <div
          :ref="(el) => (actionsRef.introButtons = el)"
          class="contact-form__action_item -buttons"
        >
          <LinkButton
            class="contact-form__action_button"
            size="small"
            data-index="0"
            @click="(e) => handleNextStep('ask_name', e)"
          >
            start a project
          </LinkButton>
          <LinkButton
            class="contact-form__action_button"
            size="small"
            data-index="1"
            @mouseenter="playRandomSound('text-hover')"
            @click="handleTestClick"
          >
            Join the team
          </LinkButton>
          <LinkButton
            class="contact-form__action_button"
            size="small"
            data-index="2"
            @mouseenter="playRandomSound('text-hover')"
            @click="handleTestClick"
          >
            Contacts
          </LinkButton>
        </div>
        <div
          :ref="(el) => (actionsRef.nameForm = el)"
          class="contact-form__action_item -name-form"
        >
          <ContactNameForm />
        </div>
        <div
          :ref="(el) => (actionsRef.roleForm = el)"
          class="contact-form__action_item -role-form"
        >
          <ContactRoleForm />
        </div>
        <div
          :ref="(el) => (actionsRef.goalButtons = el)"
          class="contact-form__action_item -buttons"
        >
          <ContactGoalButtons />
        </div>
        <div
          :ref="(el) => (actionsRef.budgetButtons = el)"
          class="contact-form__action_item -buttons"
        >
          <ContactBudgetButtons />
        </div>
        <div
          :ref="(el) => (actionsRef.timelineButtons = el)"
          class="contact-form__action_item -buttons"
        >
          <ContactTimelineButtons />
        </div>
        <div
          :ref="(el) => (actionsRef.dateForm = el)"
          class="contact-form__action_item -date-form"
        >
          <ContactDateForm />
        </div>
        <div
          :ref="(el) => (actionsRef.descriptionForm = el)"
          class="contact-form__action_item -description-form"
        >
          <ContactDescriptionForm />
        </div>

        

        

        

        
        
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;
.contact-form {
  .contact-back-button {
    position: absolute;
    top: 46px;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    scale: 0;
  }
  &__dots {
    position: relative;
    width: 15%;
    height: 1px;
    opacity: 0;
    &::before {
      content: '';
      display: block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: $color-dots;
      position: absolute;
      top: 0;
      left: calc(0% - 3px);
      z-index: 1;
      @include respond(mobile) {
        width: 4px;
        height: 4px;
      }
    }
    &::after {
      content: '';
      display: block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: $color-dots;
      position: absolute;
      top: 0;
      right: calc(0% - 4px);
      z-index: 1;
      @include respond(mobile) {
        width: 4px;
        height: 4px;
      }
    }
    .dot-center {
      display: block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: $color-dots;
      position: absolute;
      top: 0;
      left: calc(50% - 2px);
      @include respond(mobile) {
        width: 4px;
        height: 4px;
      }
    }
    .dot-left,
    .dot-right {
      display: block;
      width: 50%;
      height: 1px;
      background-color: white(20);
      position: absolute;
      &::before {
        content: '';
        position: absolute;
        width: 7px;
        height: 7px;
        background: $color-dots;
        border-radius: 50%;
        top: -3px;
        left: -3px;
        @include respond(mobile) {
          width: 4px;
          height: 4px;
          top: -2px;
        }
      }
      &::after {
        content: '';
        position: absolute;
        width: 7px;
        height: 7px;
        background: $color-dots;
        border-radius: 50%;
        top: -3px;
        right: -4px;
        @include respond(mobile) {
          width: 4px;
          height: 4px;
          top: -2px;
        }
      }
      &.dot-left {
        left: 0px;
        top: 3px;
        @include respond(mobile) {
          &::after {
            right: -2px;
          }
          top: 2px;
        }
        // background-color: red;
      }
      &.dot-right {
        right: 0px;
        top: 3px;
        @include respond(mobile) {
          &::before {
            left: -2px;
          }
          &::after {
            left: -2px;
          }
          top: 2px;
        }
        // background-color: green;
      }
    }
  }
  &__content {
    margin-top: 48px;
    font-size: 40px;
    font-style: normal;
    font-weight: 400;
    line-height: 100%;
    letter-spacing: -0.8px;
    position: relative;
  }

  &__step {
    transform-origin: top left;
    & > span {
      color: transparent;
      background: linear-gradient(to right, transparent 50%, white 50%);
      background-size: 200% 100%;
      background-position-x: 0%;
      background-position-y: center;
      color: transparent;
      background-clip: text;
    }
  }

  &__previous {
    position: absolute;
    transform: translateY(calc(-100% - 48px - 0.65em));
    opacity: 0.2;
    width: 100%;
  }

  &__action {
    margin-top: 48px;
    position: relative;
    &_item {
      display: flex;
      gap: getRem(12);
      position: absolute;
      width: 100%;      
      &.-buttons {
        visibility: hidden;
      }
      &.-name-form {
        visibility: hidden;
      }
      &.-date-form {
        visibility: hidden;
      }
      &.-role-form {
        visibility: hidden;
      }
    }
  }
}
</style>
