import gsap from 'gsap';
import { tadiSteps } from '~/data/contactData';
import { testClickAnimation } from '~/utils/animations/contact';

const MESSAGE_DELAY = 2;

const sceneRef = ref(null);

const previousSectionRef = ref(null);
const currentSectionRef = ref(null);
const currentSectionTextRef = ref(null);
const currentMessage = ref('Hi I’m Psycho AI Agent');
const previousMessage = ref(null);
const actionsRef = reactive({
  introButtons: null,
  nameForm: null,
});

const userData = reactive({
  name: null,
});

const currentStepId = ref('intro');

const getRandomMessage = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

export default function useContact() {
  const handleTestClick = (e) =>
    testClickAnimation(e, {
      sceneRef,
      previousSectionRef,
      currentSectionRef,
      currentSectionTextRef,
      currentMessage,
      previousMessage,
      actionsRef,
    });

  const handleNextStep = (stepId, event) => {
    const timeline = gsap.timeline();

    const currentStep = tadiSteps[currentStepId.value];
    const targetStep = tadiSteps[stepId];
    console.log('currentStep', targetStep, actionsRef[currentStep.cta]);

    // Leave animation for actions
    if (currentStep.cta) {
      // Buttons leave animation
      if (currentStep.type === 'buttons') {
        const index = parseInt(event.currentTarget.dataset.index);
        const buttons = event.currentTarget
          .closest('.-buttons')
          .querySelectorAll(
            `.contact-form__action_button:not([data-index="${index}"])`
          );

        timeline
          .to(
            event.currentTarget,
            {
              opacity: 0,
              scale: 0.8,
              duration: 0.8,
              ease: 'power4.out',
            },
            'start'
          )
          .to(
            buttons,
            {
              opacity: 0,
              scale: 0.8,
              duration: 0.8,
              ease: 'power4.out',
              stagger: {
                each: 0.25,
                from: 'random',
              },
            },
            '<+0.25'
          );
      }
      timeline.set(actionsRef[currentStep.cta], { autoAlpha: 0 });
    }

    // Update current step
    timeline.add(() => {
      sceneRef.value.nextShape(targetStep.sceneShape);
    });

    targetStep.messages.forEach((message, index, array) => {
      const delay = index === 0 ? `-=0.5` : `+=${MESSAGE_DELAY}`;
      const isLastMessage = index === array.length - 1;

      timeline
        .to(
          previousSectionRef.value,
          {
            opacity: 0,
            scale: 0.9,
            duration: 0.8,
            ease: 'power3.out',
          },
          delay
        )
        .to(
          currentSectionRef.value,
          {
            transform: 'translateY(calc(-100% - 48px - 0.65em))',
            duration: 0.8,
            opacity: 0.2,
            ease: 'power3.out',
          },
          '<'
        )
        .add(() => {
          previousMessage.value = currentMessage.value;
          currentMessage.value = getRandomMessage(message.variations);
          gsap.set(
            [
              currentSectionRef.value,
              currentSectionTextRef.value,
              previousSectionRef.value,
            ],
            {
              clearProps: 'all',
            }
          );
        })
        .to(currentSectionTextRef.value, {
          backgroundPositionX: '-100%',
          duration: 1,
          ease: 'power2.inOut',
        });

      if (isLastMessage && targetStep.cta) {
        timeline.fromTo(
          actionsRef[targetStep.cta],
          { autoAlpha: 0, scaleY: 0.8, yPercent: 50 },
          {
            autoAlpha: 1,
            yPercent: 0,
            scaleY: 1,
            duration: 1,
            ease: 'power3.out',
          }
        );
      }

      // Update current step id
      timeline.add(() => {
        currentStepId.value = stepId;
      });

      console.log('message', getRandomMessage(message.variations));
    });
  };

  return {
    sceneRef,
    previousSectionRef,
    currentSectionRef,
    currentSectionTextRef,
    currentMessage,
    previousMessage,
    currentStepId,
    actionsRef,
    handleNextStep,
    userData,
  };
}
