<script setup>
import gsap from 'gsap';

import useLoader from '~/composables/useLoader';
import useContact from '~/composables/useContact';

import ContactNameForm from './ContactNameForm.vue';
import LinkButton from '../ui/LinkButton.vue';

let dotsTimeline;
const dotsRef = ref(null);

const {
  sceneRef,
  previousSectionRef,
  stepSectionRef,
  stepSectionTextRef,
  stepMessage,
  previousMessage,
  actionsRef,
  handleTestClick,
} = useContact();

const { isLoading } = useLoader();

onMounted(() => {
  const dotsLeft = dotsRef.value.querySelector('.contact-form__dots .dot-left');
  const dotsRight = dotsRef.value.querySelector(
    '.contact-form__dots .dot-right'
  );
  dotsTimeline = gsap
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

  dotsTimeline.restart();
});

watch(isLoading, (newVal) => {
  if (!newVal) {
    enterAnimation();
  }
});

function enterAnimation() {
  sceneRef.value.play();

  gsap
    .timeline()
    .to(stepSectionTextRef.value, {
      backgroundPositionX: '-100%',
      duration: 1,
      ease: 'power2.inOut',
    })
    .to(dotsRef.value, {
      opacity: 1,
      duration: 0.5,
    })
    .to(
      stepSectionRef.value,
      {
        transform: 'translateY(calc(-100% - 24px - 0.65em))',
        duration: 0.8,
        opacity: 0.2,
        ease: 'power3.out',
      },
      '+=1'
    )
    .add(() => {
      previousMessage.value = stepMessage.value;
      stepMessage.value =
        'Oh look, a visitor! I should start charging admission. Need anything?';
      gsap.set([stepSectionRef.value, stepSectionTextRef.value], {
        clearProps: 'all',
      });
    })
    .to(stepSectionTextRef.value, {
      backgroundPositionX: '-100%',
      duration: 1,
      ease: 'power2.inOut',
    })
    .set(actionsRef.buttons, {
      autoAlpha: 1,
    })
    .from(actionsRef.buttons.querySelectorAll('.contact-form__action_button'), {
      opacity: 0,
      scale: 0.9,
      duration: 1,
      stagger: 0.25,
    })
    .to(
      actionsRef.buttons.querySelectorAll(
        '.contact-form__action_button .link-button__visible-text'
      ),
      {
        duration: 1,
        scrambleText: {
          text: '{original}',
          chars: '0123456789!@#$%^&*()-_=+[]{};:<>/?,.',
          // tweenLength: false,
        },
        stagger: 0.25,
      },
      '<'
    )
    .add(() => dotsTimeline.repeat(-1).restart());
}
</script>

<!-- Oh look, a visitor! I should start charging admission. Need anything? -->

<template>
  <div class="contact-form">
    <div ref="dotsRef" class="contact-form__dots">
      <span class="dot-left" />
      <span class="dot-center" />
      <span class="dot-right" />
    </div>

    <div class="contact-form__content">
      <div ref="previousSectionRef" class="contact-form__previous">
        {{ previousMessage }}
      </div>
      <div ref="stepSectionRef" class="contact-form__step">
        <span ref="stepSectionTextRef">{{ stepMessage }}</span>
      </div>
      <div class="contact-form__action">
        <div
          :ref="(el) => (actionsRef.buttons = el)"
          class="contact-form__action_item -buttons"
        >
          <LinkButton
            class="contact-form__action_button"
            size="small"
            data-index="0"
            @click="handleTestClick"
          >
            start a project
          </LinkButton>
          <LinkButton
            class="contact-form__action_button"
            size="small"
            data-index="1"
            @click="handleTestClick"
          >
            Join the team
          </LinkButton>
          <LinkButton
            class="contact-form__action_button"
            size="small"
            data-index="2"
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
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;
.contact-form {
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
    margin-top: 24px;
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
    transform: translateY(calc(-100% - 24px - 0.65em));
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
    }
  }
}
</style>
