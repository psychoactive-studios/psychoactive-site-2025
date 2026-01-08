import gsap from 'gsap';

export const testClickAnimation = (e, refs) => {
  const index = parseInt(e.currentTarget.dataset.index);
  const buttons = e.currentTarget
    .closest('.-buttons')
    .querySelectorAll(
      `.contact-form__action_button:not([data-index="${index}"])`
    );

  gsap
    .timeline()
    .to(
      e.currentTarget,
      {
        opacity: 0,
        scale: 0.8,
        duration: 0.8,
        ease: 'power3.out',
      },
      'start'
    )
    .to(
      buttons,
      {
        opacity: 0,
        scale: 0.8,
        duration: 0.8,
        ease: 'power3.out',
        stagger: {
          each: 0.25,
          from: 'random',
        },
      },
      '<+0.25'
    )
    .add(() => {
      refs.sceneRef.value.nextShape(1);
    })
    .to(
      refs.previousSectionRef.value,
      {
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        ease: 'power3.out',
      },
      'start+=0.5'
    )
    .to(
      refs.stepSectionRef.value,
      {
        transform: 'translateY(calc(-100% - 24px - 0.65em))',
        duration: 0.8,
        opacity: 0.2,
        ease: 'power3.out',
      },
      '<'
    )
    .add(() => {
      refs.previousMessage.value = refs.stepMessage.value;
      refs.stepMessage.value =
        'Ah, the sweet scent of collaboration. Let’s make some digital magic.';
      gsap.set(
        [
          refs.stepSectionRef.value,
          refs.stepSectionTextRef.value,
          refs.previousSectionRef.value,
        ],
        {
          clearProps: 'all',
        }
      );
    })
    .to(refs.stepSectionTextRef.value, {
      backgroundPositionX: '-100%',
      duration: 1,
      ease: 'power2.inOut',
    })
    .to(
      refs.previousSectionRef.value,
      {
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        ease: 'power3.out',
      },
      '+=2'
    )
    .to(
      refs.stepSectionRef.value,
      {
        transform: 'translateY(calc(-100% - 24px - 0.65em))',
        duration: 0.8,
        opacity: 0.2,
        ease: 'power3.out',
      },
      '<'
    )
    .add(() => {
      refs.previousMessage.value = refs.stepMessage.value;
      refs.stepMessage.value =
        'Alright, let’s not be strangers. What should I call the genius behind this project?';
      gsap.set(
        [
          refs.stepSectionRef.value,
          refs.stepSectionTextRef.value,
          refs.previousSectionRef.value,
        ],
        {
          clearProps: 'all',
        }
      );
    })
    .to(refs.stepSectionTextRef.value, {
      backgroundPositionX: '-100%',
      duration: 1,
      ease: 'power2.inOut',
    })
    .fromTo(
      refs.actionsRef.nameForm,
      { autoAlpha: 0, scaleY: 0.8, yPercent: 50 },
      {
        autoAlpha: 1,
        yPercent: 0,
        scaleY: 1,
        duration: 1,
        ease: 'power3.out',
      }
    );
};
