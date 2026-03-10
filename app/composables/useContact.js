import { useThrottleFn } from '@vueuse/core';
import gsap from 'gsap';
import { tadiSteps } from '~/data/contactData';

const MESSAGE_DELAY = 2;

let mainTimeline = null;
let historyTimeline = null;
let dotsTimeline  = ref(null);
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
const historySteps = ref([]);

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
        historySteps.value.push({
          message: null,
          nextMessage: nextMessage,
          cta: 'introButtons',
          sceneShape: null,
          stepId: 'intro'
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

  const handleNextStepFn = (stepId, event) => {
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
        const button = event.currentTarget.querySelector('.name-form__button');
        const fields = event.currentTarget.querySelectorAll('.name-form__inner > *, .description-form__inner > *');        
        
        mainTimeline          
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
            }, '<')
            .set([button, fields], { clearProps: 'all' });;
      }
      mainTimeline.set(actionsRef[currentStep.cta], { autoAlpha: 0 });
    }

    // Confirm message animation
    if (currentStep.confirmMessages) {      
      currentStep.confirmMessages.forEach((message, index, array) => {

        const confirmMessage = getRandomMessage(message.variations).replace('[Name]', userData.name);
        const delay = index === 0 ? `-=0.5` : `+=${MESSAGE_DELAY}`;        
        
        mainTimeline.to(
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
    mainTimeline.add(() => {
      sceneRef.value.nextShape(targetStep.sceneShape);
    });

    
    

    targetStep.messages.forEach((message, index, array) => {
      const delay = index === 0 ? `-=0.5` : `+=${MESSAGE_DELAY}`;
      const isFirstMessage = index === 0;
      const isLastMessage = index === array.length - 1;

      let historyCTA;
      if(isFirstMessage && currentStep.cta) historyCTA = currentStep.cta;
      if(isLastMessage && targetStep.cta) historyCTA = targetStep.cta;

      const nextMessage = getRandomMessage(message.variations)
            .replace('[email]', '<a href="mailto:careers@psychoactive.co">careers@psychoactive.co</a>')
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
            opacity: 0.2,
            ease: 'power3.out',
          },
          '<'
        )
        .add(() => {
          // Add to history steps
          historySteps.value.push({
            message: previousMessage.value,
            nextMessage: index > 0 ? nextMessage : null,
            cta: historyCTA,
            sceneShape: targetStep.sceneShape,
            stepId: currentStepId.value
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
    if(!targetStep.nextStep) {
      mainTimeline.add(() => {
        dotsTimeline.value.repeat(0).play();
      });      
    }    
  };

  const handlePrevStep = () => {
    const beforeMessage = historySteps.value.at(-2)?.message;
    const rawStep = historySteps.value.pop();
    const lastStep = JSON.parse(JSON.stringify(rawStep));
    // const lastStep = structuredClone(historySteps.value.pop());    
    
    if(!lastStep) return;

    currentStepId.value = lastStep.stepId;

    mainTimeline?.kill();
    historyTimeline?.kill();

    const currentStep = tadiSteps[currentStepId.value];    

    historyTimeline = gsap.timeline();

    historyTimeline
    .to(
        currentSectionRef.value,
        {
          opacity: 0,
          scale: 0.9,
          duration: 0.5,
          ease: 'power3.out',
        }        
      )
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
    .to(historyMessageRef.value, {
      scale: 1,
      opacity: 0.2,
      yPercent: -100,
      y: -74,
      visibility: 'visible',
      duration: 0.5,
      ease: 'power3.out',
    }, '<');   
    
    if (currentStep.cta) {
      historyTimeline.to(actionsRef[currentStep.cta], {
        opacity: 0,
        scale: 0.9,
        duration: 0.5,
        visibility: 'hidden',
        ease: 'power3.out',
      }, '<')
      .set(actionsRef[currentStep.cta], { clearProps: 'all' });
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
      })
    });

    if(lastStep.nextMessage) {
      historyTimeline.to(
        currentSectionRef.value,
        {
          transform: 'translateY(calc(-100% - 48px - 0.65em))',
          duration: 0.8,
          opacity: 0.2,
          ease: 'power4.out',
        }, '+=2'
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
        gsap.set([currentSectionRef.value, currentSectionTextRef.value, previousSectionRef.value], {
          clearProps: 'all',
        });
        if(lastStep.nextMessage) {          
        console.log('PUSHED LAST STEP', lastStep);
          historySteps.value.push(lastStep);          
        }
      })
      .to(currentSectionTextRef.value, {
        backgroundPositionX: '-100%',
        duration: 1,
        ease: 'power2.inOut',
      });
    }
    
    if (lastStep.cta) {      
      historyTimeline.fromTo(
        actionsRef[lastStep.cta],
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

    // if(lastStep.nextMessage) {
    //   historyTimeline.add(() => {
    //     console.log('PUSHED LAST STEP', lastStep);
    //     historySteps.value.push(lastStep);
    //   });
    // }
    
  };

  const handleNextStep = useThrottleFn(handleNextStepFn, 2000);


  const handleSendEmail = async () => {
    console.log('handleSendEmail', );

    const userTestData = {
      name: 'Test Name',
      company: 'Test Company',
      role: 'Test Role',
      goal: 'Test Goal',
      budget: 'Test Budget',
      deadline: 'Test Deadline',
      description: 'Test Description',
      // file: 'Test File',
    };

    try {
      const formData = new FormData();
      
      // Додаємо всі ключі з userData у FormData
      Object.keys(userTestData).forEach((key) => {
        console.log(key, userTestData[key]);
        
        if (userTestData[key]) {
          formData.append(key, userTestData[key]);
        }
      });     

      
      

      const response = await $fetch('https://formspree.io/f/xeeranzd', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'          
        }        
      });

      console.log('Лист успішно відправлено!', response);
      
      // Тут можна викликати логіку переходу на фінальний крок 'sey_thanks'
      
    } catch (error) {
      console.error('Помилка відправки форми:', error);
      // Тут можна показати повідомлення про помилку користувачу
    } finally {
      // Зупиняємо лоадер після завершення циклу
      // dotsTimeline.value.repeat(0);
    }
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
  };
}
