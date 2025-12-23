import gsap from 'gsap';

export const heroInitAnimation = (ctx, scrollSmoother) => {
  const layoutElements = gsap.utils.toArray([
    '#header-logo',
    '#header-navigation-button',
    '#header-sound-button',
  ]);
  ctx.add(() => {
    gsap
      .timeline()
      .fromTo(
        '.hero__center-line',
        { scaleX: 0 },
        { scaleX: 1, duration: 1, ease: 'power3.out' }
      )
      .fromTo(
        '.hero__title .grey',
        { xPercent: -175 },
        {
          xPercent: 0,
          duration: 1,
          ease: 'power2.out',
        },
        '<'
      )
      .fromTo(
        '.hero__title .white',
        { xPercent: 175 },
        {
          xPercent: 0,
          duration: 1,
          ease: 'power2.out',
        },
        '<'
      )
      .add(() => scrollSmoother.value.start())
      .to(
        layoutElements,
        {
          scale: 1,
          opacity: 1,
          duration: 0.75,
          ease: 'power3.out',
        },
        'secondPart+=0.2'
      );
  });
};

export const heroScrollAnimation = (ctx, root) => {
  ctx.add(() => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom top',
          pin: true,
          scrub: 0.5,
          markers: true,
          pinSpacing: false,
        },
      })
      .to('.hero__center-line', { scaleX: 1, opacity: 0, duration: 1 })
      .fromTo(
        '.hero__title .grey',
        { xPercent: 0 },
        {
          xPercent: -175,
          duration: 1,
        },
        '<'
      )
      .fromTo(
        '.hero__title .white',
        { xPercent: 0 },
        {
          xPercent: 175,
          duration: 1,
        },
        '<'
      )
      .to('.hero__video', { opacity: 0, duration: 1 }, '<');
  });
};
