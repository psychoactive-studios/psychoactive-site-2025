import gsap from 'gsap';
import { tadiSteps } from '~/data/contactData';

const MESSAGE_DELAY = 0.1;

let dotsTimeline  = ref(null);
const sceneRef = ref(null);
const dotsRef = ref(null);

const previousSectionRef = ref(null);
const currentSectionRef = ref(null);
const currentSectionTextRef = ref(null);
const currentMessage = ref('Hi I’m Psycho AI Agent. This is default message');
const previousMessage = ref(null);
const actionsRef = reactive({
  introButtons: null,
  nameForm: null,
  roleForm: null,
  goalButtons: null,
  budgetButtons: null,
  timelineButtons: null,
  dateForm: null,
  descriptionForm: null,
});

const userData = reactive({
  name: null,
  company: null,
  role: null,
  goal: null,
  budget: null,
  deadline: null,
  description: null,
  file: null,
});

const currentStepId = ref('intro');

const getRandomMessage = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};


export default function useContact() {
  function enterAnimation() {
    const circlePath1 = '.contact__media_circle-wrapper .circle .circle-path-1';
    const circlePath2 = '.contact__media_circle-wrapper .circle .circle-path-2';
    const circleDots = '.contact__media_circle-wrapper .circle .circle-dots';

    const layoutElements = gsap.utils.toArray([
      '#header-logo',
      '#header-navigation-button',
      '#header-sound-button',
      '.contact-back-button',
    ]);
    
    const nextMessage = getRandomMessage(tadiSteps[currentStepId.value]?.messages[1]?.variations);

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
          opacity: 0.2,
          ease: 'power4.out',
        },
        '+=1'
      )
      .add(() => {
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
        actionsRef.introButtons.querySelectorAll('.contact-form__action_button'),
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
      .add(() => dotsTimeline.value.repeat(-1).restart());
  }

  const handleNextStep = (stepId, event) => {
    const timeline = gsap.timeline();

    const currentStep = tadiSteps[currentStepId.value];
    const targetStep = tadiSteps[stepId];
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
                each: 0.15,
                from: 'random',
              },
            },
            '<+0.15'
          );
      }
      // Text field leave animation
      if (currentStep.type === 'textField') {        
        const button = event.currentTarget.querySelector('.name-form__button');
        const fields = event.currentTarget.querySelectorAll('.name-form__inner > *, .description-form__inner > *');        
        
        timeline          
          .to(
            button,
            {
              opacity: 0,
              scale: 0.8,
              duration: 0.5,
              ease: 'power4.out',              
            }            
          )
          .to(
            fields, {
              autoAlpha: 0,
              yPercent: -50,              
              duration: 0.5,
              ease: 'power3.in',
              stagger: 0.1,
            }, '<');
      }
      timeline.set(actionsRef[currentStep.cta], { autoAlpha: 0 });
    }

    // Confirm message animation
    if (currentStep.confirmMessages) {      
      currentStep.confirmMessages.forEach((message, index) => {

        const confirmMessage = getRandomMessage(message.variations).replace('[Name]', userData.name);
        const delay = index === 0 ? `-=0.5` : `+=${MESSAGE_DELAY}`;
        
        timeline.to(
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
        .to({}, {duration: MESSAGE_DELAY})
      });
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
          currentMessage.value = getRandomMessage(message.variations).replace('[Name]', userData.name);
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
    });
  };

  return {
    sceneRef,
    dotsRef,
    previousSectionRef,
    currentSectionRef,
    currentSectionTextRef,
    currentMessage,
    previousMessage,
    currentStepId,
    actionsRef,
    enterAnimation,
    handleNextStep,
    userData,
    getRandomMessage,
    dotsTimeline,
  };
}
