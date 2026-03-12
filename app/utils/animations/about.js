import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

export const heroInitAnimation = (ctx, scrollSmoother) => {
  const layoutElements = gsap.utils.toArray([
    '#header-logo',
    '#header-navigation-button',
    '#header-sound-button',
  ]);
  const matchMedia = gsap.matchMedia();
  ctx.add(() => {
    matchMedia.add(
      {
        isDesktop: `(min-width: 768px)`,
        isMobile: `(max-width: 767px)`,
      },
      (context) => {
        let { isDesktop, isMobile } = context.conditions;
        const tl = gsap
          .timeline()
          .fromTo(
            '.hero__video',
            { opacity: 0 },
            { opacity: 1, duration: 0.7, ease: 'power2.in' }
          )
          .fromTo(
            '.hero__center-line',
            { scaleX: 0 },
            { scaleX: 1, duration: 1, ease: 'power3.out' },
            '<'
          )
          .fromTo(
            '.hero__title .grey',
            { xPercent: -175 },
            {
              xPercent: 0,
              duration: 1,
              ease: 'power3.out',
            },
            '<'
          )
          .fromTo(
            '.hero__title .white',
            { xPercent: 175 },
            {
              xPercent: 0,
              duration: 1,
              ease: 'power3.out',
            },
            '<'
          )
          .add(() => scrollSmoother.value.start());
        if (isDesktop) {
          tl.to(
            layoutElements,
            {
              scale: 1,
              opacity: 1,
              duration: 0.75,
              ease: 'power3.out',
            },
            '<+=0.2'
          );
        }
        if (isMobile) {          
          /* ======= Layout elements part mobile ========= */
          tl.fromTo(
            document.querySelector('.navigation-mobile'),
            { y: 64, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1,
              ease: 'power3.out',
            },
            '<-=0.5'
          );
        }
      }
    );
    return () => matchMedia.revert();
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
          pinType: 'transform',
          scrub: 0.5,
          pinSpacing: false,
        },
      })
      .to('.hero__center-line', { scaleY: 0, opacity: 0, duration: 1 })
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

export const aboutPageInitAnimation = (ctx, root) => {
  SplitText.create(
    gsap.utils.toArray([root.querySelector('.about__collaboration_title h2')]),
    {
      type: 'words,chars',
      charsClass: 'char-center',
    }
  );

  ctx.add(() => {
    // About collaboration animation init;
    const title = gsap.utils.toArray(
      root.querySelectorAll('.about__collaboration_title h2 .char-center')
    );
    gsap
      .timeline({
        scrollTrigger: {
          trigger: root.querySelector('.about__collaboration'),
          start: 'top bottom',
        },
      })
      .to(
        title,
        {
          duration: 2.3,
          scrambleText: {
            text: '{original}',
            chars: 'uppercase',
            tweenLength: false,
          },
        },
        '<+=0.2'
      )
      .from(
        title,
        {
          opacity: 0,
          duration: 0.01,
          stagger: {
            amount: 0.9,
            from: 'random',
          },
        },
        '<'
      )
      .from(
        '.about__collaboration_title .title-line .line',
        { opacity: 0, duration: 0.5 },
        '<+=0.5'
      )
      .fromTo(
        '.about__collaboration_title .title-line .line',
        { width: '0%' },
        { width: '100%', duration: 1.2, ease: 'power4.inOut' },
        '<+=0.2'
      )
      .fromTo(
        '.about__collaboration_text',
        {
          backgroundPosition: '100% 0%',
        },
        {
          backgroundPosition: '0% 0%',
          duration: 2,
          ease: 'power3.inOut',
        },
        '<'
      );
  });
};
