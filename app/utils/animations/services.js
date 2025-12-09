import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

export const heroInitAnimation = (ctx, scrollSmoother) => {
  /* ======== Layout elements Animation ========= */
  const layoutElements = gsap.utils.toArray([
    '#header-logo',
    '#header-navigation-button',
    '#header-sound-button',
  ]);

  const ease1 = 'power3.out';
  const duration1 = 2;
  const easeCircle = 'power3.inOut';

  ctx.add(() => {
    gsap
      .timeline({ id: 'services-initial-animation' })
      .from(
        '.services-3d-scene--wrapper',
        {
          scale: 0,
          duration: duration1,
          ease: ease1,
        },
        'firstPart'
      )
      .from(
        '.center',
        { scaleX: 0, ease: ease1, duration: duration1 },
        'firstPart+=0.4'
      )
      .from(
        '.circle-path-1, .circle-path-2',
        {
          strokeDashoffset: 626.43,
          duration: 1.85,
          ease: easeCircle,
        },
        'firstPart+=0.3'
      )
      .from(
        '.circle-dots',
        { autoAlpha: 0, rotate: 0, duration: 1.85, ease: easeCircle },
        'firstPart+=0.3'
      )
      .add('secondPart', 'firstPart+=1.2')
      .to(
        'h1.title .char-center',
        {
          duration: 3.2,
          scrambleText: {
            text: '{original}',
            chars: 'uppercase',
            tweenLength: false,
          },
        },
        'secondPart'
      )
      .fromTo(
        'h1.title .char-center',
        { opacity: 0, visibility: 'hidden' },
        {
          opacity: 1,
          visibility: 'visible',
          duration: 0.01,
          stagger: {
            amount: 0.85,
            from: 'random',
          },
        },
        'secondPart'
      )
      .fromTo(
        '.bottom-text__web, .bottom-text__web-svg',
        { xPercent: -175, visibility: 'hidden' },
        {
          xPercent: 0,
          visibility: 'visible',
          duration: 1.15,
          ease: 'power4.out',
        },
        'secondPart'
      )
      .from(
        '.bottom-text__shape .char-center, .top-text .char-center',
        {
          opacity: 0,
          duration: 0.01,
          stagger: {
            amount: 0.4,
            from: 'random',
          },
        },
        'secondPart'
      )
      .fromTo(
        '.right-label, .top-text__label',
        { xPercent: 175, visibility: 'hidden' },
        {
          xPercent: 0,
          visibility: 'visible',
          duration: 1.15,
          ease: 'power4.out',
        },
        'secondPart'
      )
      .to(
        layoutElements,
        {
          scale: 1,
          opacity: 1,
          duration: 0.75,
          ease: 'power3.out',
        },
        'secondPart+=0.2'
      )
      .add(() => {
        scrollSmoother.value.paused(false);
      }, '-=1');
  });
};

export const heroScrollAnimation = (ctx) => {
  const outputTime = 1.3;

  SplitText.create('h1.title, .bottom-text__shape, .top-text p', {
    type: 'words,chars',
    charsClass: 'char-center',
  });

  ctx.add(() => {
    gsap
      .timeline({
        id: 'services-scroll-animation',
        scrollTrigger: {
          id: 'services-hero-scrolltrigger',
          trigger: '.hero__wrapper',
          pin: true, // pin the trigger element while active
          pinSpacing: false,
          start: 'top top', // when the top of the trigger hits the top of the viewport
          end: '75% top', // end after scrolling 500px beyond the start
          scrub: 0.5, // smooth scrubbing, takes 1 second to "catch up" to the scrollbar
          invalidateOnRefresh: true,
          // markers: true,
        },
      })
      .fromTo(
        '.bottom-text__web, .bottom-text__web-svg',
        { xPercent: 0 },
        { xPercent: -175, duration: outputTime, ease: 'power2.out' },
        'output-of-elements'
      )
      .fromTo(
        '.bottom-text__shape',
        { xPercent: 0 },
        { xPercent: -125, duration: outputTime },
        'output-of-elements'
      )
      .fromTo(
        '.right-label, .top-text__label',
        { xPercent: 0 },
        { xPercent: 175, duration: outputTime, ease: 'power1.out' },
        'output-of-elements'
      )
      .fromTo(
        '.top-text .char-center',
        { opacity: 1 },
        {
          opacity: 0,
          duration: 0.01,
          stagger: {
            amount: 0.4,
            from: 'random',
          },
        },
        'output-of-elements'
      )
      .fromTo(
        'h1.title .char-center',
        { opacity: 1 },
        {
          opacity: 0,
          duration: 0.01,
          stagger: {
            amount: 0.4,
            from: 'random',
          },
        },
        'output-of-elements'
      )
      .to(
        '.circle--wrapper .circle',
        {
          rotate: -90,
          opacity: 0,
          duration: outputTime,
          ease: 'power1.out',
        },
        'output-of-elements'
      )
      .to(
        '.services-3d-scene',
        {
          scale: 0,
          opacity: 0,
          duration: outputTime,
          ease: 'power1.out',
        },
        'output-of-elements'
      )
      .to(
        '.center',
        { scaleX: 0, ease: 'power1.out', duration: outputTime },
        'output-of-elements'
      );
  });
};

export const servicesListAnimation = (ctx, root) => {
  SplitText.create(
    '.services-list__item_title, .services-list__item_description',
    {
      type: 'words,chars',
      charsClass: 'char-center',
    }
  );
  ctx.add(() => {
    gsap.to(document.querySelector('.services-list__video_player'), {
      clipPath: 'circle(50% at 50% 50%)',
      duration: 1,
      scrollTrigger: {
        trigger: root,
        start: 'top center',
        end: () => `${window.innerHeight * 0.5} center`,
        scrub: true,
      },
    });

    gsap.utils.toArray('.services-list__item').forEach((item) => {
      const title = item.querySelectorAll(
        '.services-list__item_title .char-center'
      );
      const description = item.querySelectorAll(
        '.services-list__item_description  .char-center'
      );
      const line = item.querySelector('.services-list__item_divider .line');

      gsap
        .timeline({
          scrollTrigger: {
            trigger: item,
            start: 'top bottom',
            end: 'bottom bottom',
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
        .from(line, { opacity: 0, duration: 0.5 }, '<+=0.5')
        .fromTo(
          line,
          { width: '0%' },
          { width: '100%', duration: 1.2, ease: 'power4.inOut' },
          '<+=0.2'
        )
        .from(
          description,
          {
            opacity: 0,
            duration: 0.0001,
            stagger: 0.015,
          },
          '-=0.75'
        );
    });
    // ScrollTrigger.create({
    //   trigger: '.services-list',
    //   start: 'top center',
    //   end: 'bottom center',
    //   markers: true,
    // });
  });
};

export const stepperAnimation = (ctx) => {
  SplitText.create('.stepper__step-texts .text', {
    type: 'words,chars',
    charsClass: 'char-center',
  });

  ctx.add(() => {
    const params = {
      intro: {
        introDuration: 7,
        paginatorDuration: 5,
        paginatorOffset: 3,
        stepOffset: 7,
      },
      step: {
        outDuration: 2.5,
        outOffset: 5,
        videoDuration: 5,
        videoOffset: 5,
        inDuration: 2.5,
        inOffset: 7.5,
      },
    };

    /* ==============================================
                      Intro Animation
       =============================================*/
    gsap
      .timeline({
        scrollTrigger: {
          id: 'stepper-intro-animation',
          trigger: '.stepper__trigger_intro',
          start: 'top center',
          end: 'bottom bottom',
          scrub: true,
          // invalidateOnRefresh: true,
        },
      })
      /* ======== Mask background Animation ========= */
      .to(
        document.querySelector('.services-stepper'),
        {
          webkitMaskImage:
            'radial-gradient(circle at center, black 100%, transparent 0%)',
          duration: params.intro.introDuration,
        },
        'start'
      )
      /* ======== Mask video Animation ========= */
      .to(
        '.stepper__videos_overlay, .stepper__videos .video.step-1',
        {
          clipPath: 'circle(50% at 50% 50%)',
          duration: params.intro.introDuration,
        },
        'start+=1.5'
      )
      /* ======== Pagination intro Animation ========= */
      .fromTo(
        '.stepper__pagination .step-1 .path-grey path, .stepper__pagination .step-3 .path-grey path',
        { drawSVG: '100% 100%' },
        { drawSVG: '100% 0%', duration: params.intro.paginatorDuration },
        `start+=${params.intro.paginatorOffset}`
      )
      .fromTo(
        '.stepper__pagination .step-2 .path-grey path, .stepper__pagination .step-4 .path-grey path',
        { drawSVG: '0% 0%' },
        { drawSVG: '0% 100%', duration: params.intro.paginatorDuration },
        `start+=${params.intro.paginatorOffset}`
      )
      .to(
        '.stepper__pagination .step-1 .dot-end',
        {
          motionPath: {
            path: '.stepper__pagination .step-1 .path-grey path',
            align: '.stepper__pagination .step-1 .path-grey path',
            alignOrigin: [0.5, 0.5],
            start: 1,
            end: 0,
            fromCurrent: true,
          },
          duration: params.intro.paginatorDuration,
        },
        `start+=${params.intro.paginatorOffset}`
      )
      .to(
        '.stepper__pagination .step-2 .dot-end',
        {
          motionPath: {
            path: '.stepper__pagination .step-2 .path-grey path',
            align: '.stepper__pagination .step-2 .path-grey path',
            alignOrigin: [0.5, 0.5],
            start: 0,
            end: 1,
            fromCurrent: true,
          },
          duration: params.intro.paginatorDuration,
        },
        `start+=${params.intro.paginatorOffset}`
      )
      .to(
        '.stepper__pagination .step-3 .dot-end',
        {
          motionPath: {
            path: '.stepper__pagination .step-3 .path-grey path',
            align: '.stepper__pagination .step-3 .path-grey path',
            alignOrigin: [0.5, 0.5],
            start: 1,
            end: 0,
            fromCurrent: true,
          },
          duration: params.intro.paginatorDuration,
        },
        `start+=${params.intro.paginatorOffset}`
      )
      .to(
        '.stepper__pagination .step-4 .dot-end',
        {
          motionPath: {
            path: '.stepper__pagination .step-4 .path-grey path',
            align: '.stepper__pagination .step-4 .path-grey path',
            alignOrigin: [0.5, 0.5],
            start: 0,
            end: 1,
            fromCurrent: true,
          },
          duration: params.intro.paginatorDuration,
        },
        `start+=${params.intro.paginatorOffset}`
      )
      /* ======== Step Text Animation ========= */
      .fromTo(
        '.stepper__step-texts .text.step-1 .char-center',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.01,
          stagger: {
            amount: 10,
          },
        },
        `start+=${params.intro.stepOffset}`
      )
      /* ======== Step Title Animation ========= */
      .from(
        '.stepper__titles',
        {
          xPercent: 20,
          duration: 10,
          ease: 'none',
        },
        `start+=${params.intro.stepOffset}`
      )
      .from(
        '.stepper__pagination .step-1 .dot-active-start, .stepper__pagination .step-1 .dot-active-end',
        {
          opacity: 0,
          duration: 0.1,
        },
        `start+=${params.intro.stepOffset}`
      )
      .fromTo(
        '.stepper__pagination .step-1 .path-active path',
        { drawSVG: '100% 100%' },
        { drawSVG: '100% 0%', duration: 10 },
        `start+=${params.intro.stepOffset}`
      )
      .to(
        '.stepper__pagination .step-1 .dot-active-end',
        {
          motionPath: {
            path: '.stepper__pagination .step-1 .path-grey path',
            align: '.stepper__pagination .step-1 .path-grey path',
            alignOrigin: [0.5, 0.5],
            start: 1,
            end: 0,
            fromCurrent: true,
          },
          duration: 10,
        },
        `start+=${params.intro.stepOffset}`
      )
      .from(
        '.stepper__pagination .step-1 .number',
        {
          opacity: 0,
          duration: 2,
        },
        'start+=15'
      );

    /* ==============================================
                      Step 1 Animation
       =============================================*/
    gsap
      .timeline({
        scrollTrigger: {
          id: 'stepper-step-1-animation',
          trigger: '.stepper__trigger_step-1',
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
      .to(
        '.stepper__titles',
        {
          xPercent: -30,
          duration: 10,
          ease: 'none',
        },
        'start'
      )
      .to(
        '.stepper__videos .video.step-2',
        {
          clipPath: 'circle(50% at 50% 50%)',
          duration: params.step.videoDuration,
        },
        `start+=${params.step.videoOffset}`
      )
      .to(
        '.stepper__step-texts .text.step-1 .char-center',
        {
          opacity: 0,
          duration: 0.01,
          stagger: {
            amount: params.step.outDuration,
            from: 'random',
          },
          // immediateRender: false,
        },
        `start+=${params.step.outOffset}`
      )
      .fromTo(
        '.stepper__step-texts .text.step-2 .char-center',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.01,
          stagger: {
            amount: params.step.inDuration,
          },
        },
        `start+=${params.step.inOffset}`
      )
      .to(
        '.stepper__pagination .step-1 .path-active path',
        { drawSVG: '0% 0%', duration: params.step.outDuration },
        `start+=${params.step.outOffset}`
      )
      .to(
        '.stepper__pagination .step-1 .dot-active-start',
        {
          motionPath: {
            path: '.stepper__pagination .step-1 .path-grey path',
            align: '.stepper__pagination .step-1 .path-grey path',
            alignOrigin: [0.5, 0.5],
            start: 1,
            end: 0,
            fromCurrent: true,
          },
          duration: params.step.outDuration,
        },
        `start+=${params.step.outOffset}`
      )
      .to(
        '.stepper__pagination .step-1 .number',
        {
          opacity: 0,
          duration: 0.1,
        },
        `start+=${params.step.inOffset}`
      )
      .from(
        '.stepper__pagination .step-2 .dot-active-start, .stepper__pagination .step-2 .dot-active-end',
        {
          opacity: 0,
          duration: 0.1,
        },
        `start+=${params.step.inOffset}`
      )
      .fromTo(
        '.stepper__pagination .step-2 .path-active path',
        { drawSVG: '0% 0%' },
        { drawSVG: '0% 100%', duration: params.step.inDuration },
        `start+=${params.step.inOffset}`
      )
      .to(
        '.stepper__pagination .step-2 .dot-active-end',
        {
          motionPath: {
            path: '.stepper__pagination .step-2 .path-grey path',
            align: '.stepper__pagination .step-2 .path-grey path',
            alignOrigin: [0.5, 0.5],
            start: 0,
            end: 1,
            fromCurrent: true,
          },
          duration: params.step.inDuration,
        },
        `start+=${params.step.inOffset}`
      )
      .from(
        '.stepper__pagination .step-2 .number',
        {
          opacity: 0,
          duration: 0.5,
        },
        'start+=9.5'
      );

    /* ==============================================
                      Step 2 Animation
       =============================================*/
    gsap
      .timeline({
        scrollTrigger: {
          id: 'stepper-step-2-animation',
          trigger: '.stepper__trigger_step-2',
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
      .to(
        '.stepper__titles',
        {
          xPercent: -53,
          duration: 10,
          ease: 'none',
        },
        'start'
      )
      .to(
        '.stepper__videos .video.step-3',
        {
          clipPath: 'circle(50% at 50% 50%)',
          duration: params.step.videoDuration,
        },
        `start+=${params.step.videoOffset}`
      )
      .to(
        '.stepper__step-texts .text.step-2 .char-center',
        {
          opacity: 0,
          duration: 0.01,
          stagger: {
            amount: params.step.outDuration,
            from: 'random',
          },
          // immediateRender: false,
        },
        `start+=${params.step.outOffset}`
      )
      .fromTo(
        '.stepper__step-texts .text.step-3 .char-center',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.01,
          stagger: {
            amount: params.step.inDuration,
          },
        },
        `start+=${params.step.inOffset}`
      )
      .to(
        '.stepper__pagination .step-2 .path-active path',
        { drawSVG: '100% 100%', duration: params.step.outDuration },
        `start+=${params.step.outOffset}`
      )
      .to(
        '.stepper__pagination .step-2 .dot-active-start',
        {
          motionPath: {
            path: '.stepper__pagination .step-2 .path-grey path',
            align: '.stepper__pagination .step-2 .path-grey path',
            alignOrigin: [0.5, 0.5],
            start: 0,
            end: 1,
            fromCurrent: true,
          },
          duration: params.step.outDuration,
        },
        `start+=${params.step.outOffset}`
      )
      .to(
        '.stepper__pagination .step-2 .number',
        {
          opacity: 0,
          duration: 0.1,
        },
        `start+=${params.step.inOffset}`
      )
      .from(
        '.stepper__pagination .step-3 .dot-active-start, .stepper__pagination .step-3 .dot-active-end',
        {
          opacity: 0,
          duration: 0.1,
        },
        `start+=${params.step.inOffset}`
      )
      .fromTo(
        '.stepper__pagination .step-3 .path-active path',
        { drawSVG: '0% 0%' },
        { drawSVG: '100% 0%', duration: params.step.inDuration },
        `start+=${params.step.inOffset}`
      )
      .to(
        '.stepper__pagination .step-3 .dot-active-end',
        {
          motionPath: {
            path: '.stepper__pagination .step-3 .path-grey path',
            align: '.stepper__pagination .step-3 .path-grey path',
            alignOrigin: [0.5, 0.5],
            start: 1,
            end: 0,
            fromCurrent: true,
          },
          duration: params.step.inDuration,
        },
        `start+=${params.step.inOffset}`
      )
      .from(
        '.stepper__pagination .step-3 .number',
        {
          opacity: 0,
          duration: 0.5,
        },
        'start+=9.5'
      );

    /* ==============================================
                      Step 3 Animation
       =============================================*/
    gsap
      .timeline({
        scrollTrigger: {
          id: 'stepper-step-3-animation',
          trigger: '.stepper__trigger_step-3',
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
      .to(
        '.stepper__titles',
        {
          xPercent: -72,
          duration: 10,
          ease: 'none',
        },
        'start'
      )
      .to(
        '.stepper__videos .video.step-4',
        {
          clipPath: 'circle(50% at 50% 50%)',
          duration: params.step.videoDuration,
        },
        `start+=${params.step.videoOffset}`
      )
      .to(
        '.stepper__step-texts .text.step-3 .char-center',
        {
          opacity: 0,
          duration: 0.01,
          stagger: {
            amount: params.step.outDuration,
            from: 'random',
          },
          // immediateRender: false,
        },
        `start+=${params.step.outOffset}`
      )
      .fromTo(
        '.stepper__step-texts .text.step-4 .char-center',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.01,
          stagger: {
            amount: params.step.inDuration,
          },
        },
        `start+=${params.step.inOffset}`
      )
      .to(
        '.stepper__pagination .step-3 .path-active path',
        { drawSVG: '0% 0%', duration: params.step.outDuration },
        `start+=${params.step.outOffset}`
      )
      .to(
        '.stepper__pagination .step-3 .dot-active-start',
        {
          motionPath: {
            path: '.stepper__pagination .step-3 .path-grey path',
            align: '.stepper__pagination .step-3 .path-grey path',
            alignOrigin: [0.5, 0.5],
            start: 1,
            end: 0,
            fromCurrent: true,
          },
          duration: params.step.outDuration,
        },
        `start+=${params.step.outOffset}`
      )
      .to(
        '.stepper__pagination .step-3 .number',
        {
          opacity: 0,
          duration: 0.1,
        },
        `start+=${params.step.inOffset}`
      )
      .from(
        '.stepper__pagination .step-4 .dot-active-start, .stepper__pagination .step-4 .dot-active-end',
        {
          opacity: 0,
          duration: 0.1,
        },
        `start+=${params.step.inOffset}`
      )
      .fromTo(
        '.stepper__pagination .step-4 .path-active path',
        { drawSVG: '0% 0%' },
        { drawSVG: '0% 100%', duration: params.step.inDuration },
        `start+=${params.step.inOffset}`
      )
      .to(
        '.stepper__pagination .step-4 .dot-active-end',
        {
          motionPath: {
            path: '.stepper__pagination .step-4 .path-grey path',
            align: '.stepper__pagination .step-4 .path-grey path',
            alignOrigin: [0.5, 0.5],
            start: 0,
            end: 1,
            fromCurrent: true,
          },
          duration: params.step.inDuration,
        },
        `start+=${params.step.inOffset}`
      )
      .from(
        '.stepper__pagination .step-4 .number',
        {
          opacity: 0,
          duration: 0.5,
        },
        'start+=9.5'
      );

    /* ==============================================
                      Step 4 Animation
       =============================================*/
    gsap
      .timeline({
        scrollTrigger: {
          id: 'stepper-step-4-animation',
          trigger: '.stepper__trigger_step-4',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
      .to(
        '.stepper__titles',
        {
          xPercent: -102,
          duration: 5,
          ease: 'none',
        },
        'start'
      )
      .to(
        '.stepper__footer-video',
        {
          webkitMaskImage:
            'radial-gradient(circle at center, black 100%, transparent 0%)',
          duration: 3,
        },
        `start+=3.5`
      )
      .to('.stepper__footer-video .video', {
        opacity: 0,
        duration: 5,
      });
  });
};
