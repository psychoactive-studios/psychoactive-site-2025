import { useThrottleFn } from '@vueuse/core';
import gsap from 'gsap';
import { tadiSteps } from '~/data/contactData';
import useAudioManager from '~/composables/useAudioManager';

const { playInteractionSound } = useAudioManager();

const MESSAGE_DELAY = 2;

let mainTimeline = null;
let historyTimeline = null;
let dotsTimeline = ref(null);
const sceneRef = ref(null);
const dotsRef = ref(null);

const previousSectionRef = ref(null);
const currentSectionRef = ref(null);
const historyMessageRef = ref(null);
const currentSectionTextRef = ref(null);
const currentMessage = ref('Hi I’m Psycho AI Agent. This is default message');
const previousMessage = ref(null);
const historyMessage = ref(null);
const actionsRef = reactive({
  introButtons: null,
  nameForm: null,
  roleForm: null,
  goalButtons: null,
  budgetButtons: null,
  timelineButtons: null,
  dateForm: null,
  descriptionForm: null,
  joinTeamButtons: null,
  finishHomeButton: null,
});

const userData = reactive({
  name: null,
  email: null,
  company: null,
  role: null,
  goal: null,
  budget: null,
  deadline: null,
  date: null,
  description: null,
  file: null,
});

const currentStepId = ref('intro');
const historySteps = ref([]);

const getRandomMessage = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * Returns section opacity based on viewport: 0.2 when > 1024px, 0 when <= 1024px.
 * Uses matchMedia for performant responsive behavior.
 */
const getSectionOpacity = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(min-width: 1025px)').matches
    ? 0.2
    : 0.2;

export default function useContact() {
  // Config Strapi variables
  const config = useRuntimeConfig();

  function enterAnimation() {
    const circlePath1 = '.contact__media_circle-wrapper .circle .circle-path-1';
    const circlePath2 = '.contact__media_circle-wrapper .circle .circle-path-2';
    const circleDots = '.contact__media_circle-wrapper .circle .circle-dots';

    const layoutElements = gsap.utils.toArray([
      '#header-logo',
      '#header-navigation-button',
      '#header-sound-button',
      // '.contact-back-button',
    ]);

    const nextMessage = getRandomMessage(
      tadiSteps[currentStepId.value]?.messages[1]?.variations
    );

    gsap
      .timeline()
      /* ======= Circle part ========= */
      .from(
        [circlePath1, circlePath2],
        {
          strokeDashoffset: 626.43,
          duration: 1.85,
          ease: 'power3.inOut',
        },
        'start'
      )
      .from(
        circleDots,
        { autoAlpha: 0, rotate: 0, duration: 1.85, ease: 'power3.inOut' },
        'start'
      )
      .add(() => sceneRef.value.play(), 'start+=0.5')
      // First message
      .to(
        currentSectionTextRef.value,
        {
          backgroundPositionX: '-100%',
          duration: 1,
          ease: 'power2.inOut',
        },
        'start+=0.5'
      )
      .to(layoutElements, {
        scale: 1,
        opacity: 1,
        duration: 0.75,
        ease: 'power3.out',
      })
      .to(
        dotsRef.value,
        {
          opacity: 1,
          duration: 0.5,
        },
        '<'
      )
      // First message transition
      .to(
        currentSectionRef.value,
        {
          transform: 'translateY(calc(-100% - 48px - 0.65em))',
          duration: 0.8,
          opacity: getSectionOpacity(),
          ease: 'power4.out',
        },
        '+=1'
      )
      .add(() => {
        historySteps.value.push({
          message: null,
          nextMessage: nextMessage,
          ctaIn: 'introButtons',
          ctaOut: 'introButtons',
          sceneShape: 0,
          stepId: 'intro',
        });
        previousMessage.value = currentMessage.value;
        currentMessage.value = nextMessage;
        gsap.set([currentSectionRef.value, currentSectionTextRef.value], {
          clearProps: 'all',
        });
      })

      // Second message transition
      .to(currentSectionTextRef.value, {
        backgroundPositionX: '-100%',
        duration: 1,
        ease: 'power2.inOut',
      })
      .set(actionsRef.introButtons, {
        autoAlpha: 1,
      })
      .from(
        actionsRef.introButtons.querySelectorAll(
          '.contact-form__action_button'
        ),
        {
          opacity: 0,
          scale: 0.9,
          duration: 1,
          stagger: 0.25,
        }
      )
      .to(
        actionsRef.introButtons.querySelectorAll(
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
      .from(
        '.contact__footer_email',
        {
          autoAlpha: 0,
          scaleY: 0.8,
          yPercent: 50,
          ease: 'power3.out',
          duration: 1,
        },
        '<'
      )
      .to(
        '.contact-back-button',
        {
          scale: 1,
          opacity: 1,
          duration: 0.75,
          ease: 'power3.out',
        },
        '<'
      )
      .fromTo(
        document.querySelector('.navigation-mobile'),
        { y: 64, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
        },
        '<'
      )
      .add(() => dotsTimeline.value.repeat(-1).play());
  }

  const handleNextStepFn = (stepId, event) => {
    const isShortVersion =
      stepId === 'ask_project_goal' ||
      stepId === 'ask_date' ||
      stepId === 'ask_description' ||
      stepId === 'sey_thanks';
    playInteractionSound(
      isShortVersion ? 'contact-response-short' : 'contact-responses',
      300
    );
    mainTimeline = gsap.timeline();

    const currentStep = tadiSteps[currentStepId.value];
    const targetStep = tadiSteps[stepId];
    // Leave animation for actions
    if (currentStep?.cta) {
      // Buttons leave animation
      if (currentStep.type === 'buttons') {
        const index = parseInt(event.currentTarget.dataset.index);
        const buttons = event.currentTarget
          .closest('.contact-form__action_item')
          .querySelectorAll(
            `.contact-form__action_button:not([data-index="${index}"])`
          );

        mainTimeline
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
                each: 0.15,
                from: 'random',
              },
            },
            '<+0.15'
          )
          .set([event.currentTarget, buttons], { clearProps: 'all' });
      }
      // Text field leave animation
      if (currentStep.type === 'textField') {
        const button = event.currentTarget.querySelector(
          '.name-form__button, .description-form__button'
        );
        const fields = event.currentTarget.querySelectorAll(
          '.name-form__inner > *, .description-form__inner > *'
        );

        mainTimeline
          .to(button, {
            opacity: 0,
            scale: 0.8,
            duration: 0.5,
            ease: 'power4.out',
          })
          .to(
            fields,
            {
              autoAlpha: 0,
              yPercent: -50,
              duration: 0.5,
              ease: 'power3.in',
              stagger: 0.1,
            },
            '<'
          )
          .set([button, fields], { clearProps: 'all' });
      }
      mainTimeline.set(actionsRef[currentStep.cta], { autoAlpha: 0 });
    }

    // Confirm message animation
    if (currentStep.confirmMessages) {
      currentStep.confirmMessages.forEach((message, index, array) => {
        const confirmMessage = getRandomMessage(message.variations).replace(
          '[Name]',
          userData.name
        );
        const delay = index === 0 ? `-=0.5` : `+=${MESSAGE_DELAY}`;

        mainTimeline
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
              opacity: getSectionOpacity(),
              ease: 'power3.out',
            },
            '<'
          )
          .add(() => {
            previousMessage.value = currentMessage.value;
            currentMessage.value = confirmMessage;
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
          })
          .to({}, { duration: MESSAGE_DELAY });
      });
    }

    // Update current step
    mainTimeline.add(() => {
      sceneRef.value.nextShape(targetStep.sceneShape);
    });

    targetStep.messages.forEach((message, index, array) => {
      const delay = index === 0 ? `-=0.5` : `+=${MESSAGE_DELAY}`;
      const isFirstMessage = index === 0;
      const isLastMessage = index === array.length - 1;

      let historyCtaIn;
      let historyCtaOut;
      let historySceneShape;

      if (array.length === 1) {
        historyCtaIn = currentStep.cta;
        historyCtaOut = targetStep.cta;
        historySceneShape = currentStep.sceneShape;
      } else {
        if (isLastMessage && targetStep.cta) {
          historyCtaIn = targetStep.cta;
          historyCtaOut = targetStep.cta;
          historySceneShape = targetStep.sceneShape;
        }
        if (isFirstMessage && currentStep.cta) {
          historyCtaIn = currentStep.cta;
          historyCtaOut = currentStep.cta;
          historySceneShape = currentStep.sceneShape;
        }
      }

      const nextMessage = getRandomMessage(message.variations)
        .replace(
          '[email]',
          '<a href="mailto:careers@psychoactive.co.nz">careers@psychoactive.co.nz</a>'
        )
        .replace('[Name]', userData.name)
        .replace(/\n/g, '<br>');

      mainTimeline
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
            opacity: getSectionOpacity(),
            ease: 'power3.out',
          },
          '<'
        )
        .add(() => {
          // Add to history steps
          historySteps.value.push({
            message: previousMessage.value,
            nextMessage: index > 0 ? nextMessage : null,
            ctaIn: historyCtaIn,
            ctaOut: historyCtaOut,
            sceneShape: historySceneShape,
            stepId: currentStepId.value,
          });

          historyMessage.value = previousMessage.value;

          previousMessage.value = currentMessage.value;
          currentMessage.value = nextMessage;
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
        mainTimeline.fromTo(
          actionsRef[targetStep.cta],
          { opacity: 0.3, scaleY: 0.8, yPercent: 50, visibility: 'hidden' },
          {
            opacity: 1,
            visibility: 'visible',
            yPercent: 0,
            scaleY: 1,
            duration: 1,
            ease: 'power3.out',
          }
        );
      }
      // Update current step id
      mainTimeline.add(() => {
        currentStepId.value = stepId;
      });
    });
    if (!targetStep.nextStep) {
      if (targetStep.callback === 'submit') {
        handleSendEmail();
      }
      mainTimeline
        .add(() => {
          dotsTimeline.value.tweenTo(dotsTimeline.value.duration());
        })
        .to('.contact-back-button', {
          scale: 0,
          opacity: 0,
          duration: 0.75,
          ease: 'power3.in',
        });
    }
  };

  const handlePrevStepFn = () => {
    const beforeMessage = historySteps.value.at(-2)?.message;
    const rawStep = historySteps.value.pop();
    const lastStep = rawStep ? JSON.parse(JSON.stringify(rawStep)) : null;
    const isHideBackButton =
      lastStep?.stepId === 'intro' && lastStep?.message === null;
    // const lastStep = structuredClone(historySteps.value.pop());

    if (!lastStep) return;

    currentStepId.value = lastStep.stepId;

    mainTimeline?.kill();
    historyTimeline?.kill();

    historyTimeline = gsap.timeline();

    sceneRef.value.nextShape(lastStep.sceneShape);

    if (isHideBackButton) {
      historyTimeline.to('.contact-back-button', {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
      });
    }

    historyTimeline
      .to(currentSectionRef.value, {
        opacity: 0,
        scale: 0.9,
        duration: 0.5,
        ease: 'power3.out',
      })
      .to(
        previousSectionRef.value,
        {
          y: 0,
          duration: 0.5,
          opacity: 1,
          ease: 'power3.out',
        },
        '<'
      )
      .to(
        historyMessageRef.value,
        {
          scale: 1,
          opacity: 0.2,
          transform: 'translateY(calc(-100% - 48px - 0.65em))',
          // yPercent: -100,
          // y: -74,
          visibility: 'visible',
          duration: 0.5,
          ease: 'power3.out',
        },
        '<'
      );

    if (lastStep.ctaOut) {
      historyTimeline
        .to(
          actionsRef[lastStep.ctaOut],
          {
            opacity: 0,
            scale: 0.9,
            duration: 0.5,
            visibility: 'hidden',
            ease: 'power3.out',
          },
          '<'
        )
        .set(actionsRef[lastStep.ctaOut], { clearProps: 'all' });
    }
    historyTimeline.add(() => {
      currentMessage.value = previousMessage.value;
      previousMessage.value = lastStep.message;
      historyMessage.value = beforeMessage;
      gsap.set(
        [
          currentSectionRef.value,
          currentSectionTextRef.value,
          previousSectionRef.value,
          historyMessageRef.value,
        ],
        {
          clearProps: 'all',
        }
      );
      gsap.set(currentSectionTextRef.value, {
        backgroundPositionX: '-100%',
      });
    });

    if (lastStep.nextMessage) {
      historyTimeline
        .to(
          currentSectionRef.value,
          {
            transform: 'translateY(calc(-100% - 48px - 0.65em))',
            duration: 0.8,
            opacity: 0.2,
            ease: 'power4.out',
          },
          '+=2'
        )
        .to(
          previousSectionRef.value,
          {
            opacity: 0,
            scale: 0.9,
            duration: 0.8,
            ease: 'power3.out',
          },
          '<'
        )
        .add(() => {
          previousMessage.value = currentMessage.value;
          currentMessage.value = lastStep.nextMessage;
          historyMessage.value = lastStep.message;
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
          if (lastStep.nextMessage) {
            historySteps.value.push(lastStep);
          }
        })
        .to(currentSectionTextRef.value, {
          backgroundPositionX: '-100%',
          duration: 1,
          ease: 'power2.inOut',
        });
    }

    if (lastStep.ctaIn) {
      historyTimeline.fromTo(
        actionsRef[lastStep.ctaIn],
        { opacity: 0.3, scaleY: 0.8, yPercent: 50, visibility: 'hidden' },
        {
          opacity: 1,
          visibility: 'visible',
          yPercent: 0,
          scaleY: 1,
          duration: 1,
          ease: 'power3.out',
        }
      );
    }

    if (isHideBackButton) {
      historyTimeline.to(
        '.contact-back-button',
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: 'power3.out',
        },
        '<'
      );
    }

    // if(lastStep.nextMessage) {
    //   historyTimeline.add(() => {
    //     console.log('PUSHED LAST STEP', lastStep);
    //     historySteps.value.push(lastStep);
    //   });
    // }
  };

  const handleNextStep = useThrottleFn(handleNextStepFn, 2000);
  const handlePrevStep = useThrottleFn(handlePrevStepFn, 1000);

  const handleSendEmail = async () => {
    try {
      const baseUrl = config.public.strapiBaseUrl;
      const authHeaders = {
        Authorization: `Bearer ${config.public.strapiApiKey}`,
      };

      const payload = {
        name: userData.name,
        email: userData.email,
        company: userData.company,
        role: userData.role,
        goal: userData.goal,
        budget: userData.budget,
        deadline: userData.deadline || userData.date || '',
        description: userData.description,
      };

      console.log('payload', payload);

      // Step 1: if a file is attached — upload it first and get the file ID
      if (userData.file && userData.file[0]) {
        const uploadForm = new FormData();
        uploadForm.append('files', userData.file[0]);

        const uploadResponse = await $fetch(`${baseUrl}/api/upload`, {
          method: 'POST',
          headers: authHeaders,
          body: uploadForm,
        });

        const fileId = uploadResponse?.[0]?.id;
        if (fileId) {
          payload.file = fileId;
        }
      }

      // Step 2: create the lead with all data (including file ID if present)
      const leadResponse = await $fetch(`${baseUrl}/api/leads`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: payload }),
      });

      console.log('Success!', leadResponse);
    } catch (error) {
      console.error('Error:', error.data || error);
    }
  };

  const resetContactState = () => {
    // Kill active timelines
    mainTimeline?.kill();
    mainTimeline = null;

    historyTimeline?.kill();
    historyTimeline = null;

    if (dotsTimeline.value) {
      dotsTimeline.value.kill();
      dotsTimeline.value = null;
    }

    // Reset primitives and refs
    currentStepId.value = 'intro';
    historySteps.value = [];
    currentMessage.value = 'Hi I’m Psycho AI Agent. This is default message';
    previousMessage.value = null;
    historyMessage.value = null;

    // Reset user data
    Object.keys(userData).forEach((key) => {
      userData[key] = null;
    });

    // Reset actions refs (DOM elements)
    Object.keys(actionsRef).forEach((key) => {
      actionsRef[key] = null;
    });

    // Clear GSAP props from main refs if they exist
    const elementsToClear = [
      sceneRef.value,
      dotsRef.value,
      previousSectionRef.value,
      currentSectionRef.value,
      historyMessageRef.value,
      currentSectionTextRef.value,
    ];

    elementsToClear.forEach((el) => {
      if (el) gsap.set(el, { clearProps: 'all' });
    });
  };

  return {
    sceneRef,
    dotsRef,
    previousSectionRef,
    currentSectionRef,
    historyMessageRef,
    currentSectionTextRef,
    currentMessage,
    previousMessage,
    historyMessage,
    currentStepId,
    actionsRef,
    enterAnimation,
    handleNextStep,
    handlePrevStep,
    userData,
    getRandomMessage,
    dotsTimeline,
    handleSendEmail,
    resetContactState,
  };
}
