import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

const videoCircle = '.scene .video';
const dotsWrapper = '.scene .dots';
const dots = '.scene .dots span';
const circle = '.scene .circle-wrapper';
const title = '.left-text h1';
const titleLetters = '.left-text h1 .char-center';
const leftGreyText = '.left-text .grey-text';
const leftGreyTextLetters = '.left-text .grey-text .char-center';
const rightGreyTextLetters = '.right-text .grey-text .char-center';
const rightLabel = '.right-text__label';

/* ======== Player elements ========= */
const player = '.video-reel__video';
const playerPreview = '.player.video-reel__video .player__preview';
const playerControlTexts =
  '.player.video-reel__video .play-reel-text .char-center, .player.video-reel__video .play-time-text .char-center';
const playerControlePlus =
  '.player.video-reel__video .player__preview_controls .plus';

export const heroInitSplitText = () => {
  SplitText.create(gsap.utils.toArray(['.grey-text', '.left-text h1 span']), {
    type: 'chars',
    charsClass: 'char-center',
  }).chars;
};

/* ====================================================
                  Initial animation
=======================================================*/
export const heroInitAnimation = (ctx, scrollSmoother) => {
  let matchMedia = gsap.matchMedia();
  ctx.add(() => {
    matchMedia.add(
      {
        // set up any number of arbitrarily-named conditions. The function below will be called when ANY of them match.
        isDesktop: `(min-width: 768px)`,
        isMobile: `(max-width: 767px)`,
      },
      (context) => {
        // context.conditions has a boolean property for each condition defined above indicating if it's matched or not.
        let { isDesktop } = context.conditions;

        const layoutElements = gsap.utils.toArray([
          document.querySelector('#header-logo'),
          document.querySelector('#header-navigation-button'),
          document.querySelector('#header-sound-button'),
        ]);

        const timeline = gsap
          .timeline({ id: 'webflow-hero-init-animation' })
          /* ======= Video circle part ========= */
          .fromTo(
            videoCircle,
            { clipPath: 'circle(0% at 50% 50%)' },
            {
              clipPath: 'circle(50% at 50% 50%)',
              duration: 1.8,
              ease: 'power3.out',
            },
            'firstPart'
          )
          /* ======= Dots wrapper part ========= */
          .fromTo(
            dotsWrapper,
            { scale: 0.2 },
            { scale: 1, duration: 2, ease: 'power3.out' },
            'firstPart'
          )
          .fromTo(
            dots,
            { scale: 2.3 },
            { scale: 1, duration: 2, ease: 'power3.out' },
            'firstPart'
          )
          .add('secondPart', '-=1.2')
          /* ======= Circle dots part ========= */
          .fromTo(
            '.circle-dots-start, .circle-dots-end',
            { opacity: 0 },
            { opacity: 1, duration: 0.3 },
            'firstPart+=0.8'
          )
          .fromTo(
            '.circle-dots-end',
            { rotate: 0 },
            { rotate: 91, duration: 1.2, ease: 'power2.inOut' },
            'firstPart+=0.8'
          )
          .fromTo(
            '.circle-path-1, .circle-path-2',
            { strokeDashoffset: 626.43 },
            { strokeDashoffset: 467.92, duration: 1.2, ease: 'power2.inOut' },
            'firstPart+=0.8'
          )
          /* ======= Center and sight part ========= */
          .fromTo(
            '.center, .sight',
            { scaleX: 0 },
            { scaleX: 1, duration: 1, ease: 'power3.out' },
            'firstPart+=0.8'
          )
          /* ======= Left grey text part ========= */
          .to(
            leftGreyTextLetters,
            {
              duration: 2.2,
              scrambleText: {
                text: '{original}',
                chars: '0123456789!@#$%^&*()-_=+[]{};:<>/?,.',
                tweenLength: false,
              },
            },
            'secondPart'
          )
          .from(
            leftGreyTextLetters,
            {
              opacity: 0,
              duration: 0.01,
              stagger: {
                amount: 0.8,
                from: 'random',
              },
            },
            'secondPart'
          )
          /* ======= Right grey text part ========= */
          .to(
            rightGreyTextLetters,
            {
              duration: 2.5,
              scrambleText: {
                text: '{original}',
                chars: '0123456789!@#$%^&*()-_=+[]{};:<>/?,.',
                tweenLength: false,
              },
            },
            'secondPart'
          )
          .from(
            rightGreyTextLetters,
            {
              opacity: 0,
              duration: 0.01,
              stagger: {
                amount: 0.8,
                from: 'random',
              },
            },
            'secondPart'
          )
          /* ======= Title part ========= */
          .fromTo(
            titleLetters,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.1,
              stagger: {
                amount: 0.8,
                from: 'random',
              },
              ease: 'power3.out',
            },
            'secondPart'
          )
          /* ======= Dots arrow part ========= */
          .fromTo(
            '.dots-arrow__icon_dot',
            { opacity: 0 },
            {
              opacity: 1,
              duration: 1,
              stagger: { each: 0.05, from: 'random' },
              ease: "rough({ template: power1.out, strength: 5, points: 20, taper: 'none', randomize: true, clamp: false})",
            },
            'secondPart+=0.5'
          );
        if (isDesktop) {
          /* ======= Label part desktop ========= */
          timeline
            .fromTo(
              rightLabel,
              { xPercent: 200 },
              { xPercent: 0, duration: 1.15, ease: 'power4.out' },
              'secondPart'
            )
            /* ======= Layout elements part desktop ========= */
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
        } else {
          /* ======= Label part mobile ========= */
          timeline
            .fromTo(
              rightLabel,
              { yPercent: -200 },
              { yPercent: 0, duration: 1.15, ease: 'power4.out' },
              'secondPart'
            )
            /* ======= Layout elements part mobile ========= */
            .fromTo(
              document.querySelector('.navigation-mobile'),
              { yPercent: 200 },
              {
                yPercent: 0,
                duration: 1,
                ease: 'power3.out',
              },
              'secondPart+=0.2'
            );
        }
        timeline.add(() => {
          scrollSmoother.value.paused(false);
        }, '-=0.5');
      }
    );
  });
};

/* ====================================================
                  Hero Scroll animation
=======================================================*/
const inputTime = 1;
const circleTime = 0.5;
export const heroScrollAnimation = (ctx) => {
  let matchMedia = gsap.matchMedia();
  ctx.add(() => {
    matchMedia.add(
      {
        // set up any number of arbitrarily-named conditions. The function below will be called when ANY of them match.
        isDesktop: `(min-width: 768px)`,
        isMobile: `(max-width: 767px)`,
      },
      (context) => {
        // context.conditions has a boolean property for each condition defined above indicating if it's matched or not.
        let { isDesktop } = context.conditions;
        if (isDesktop) {
          gsap
            .timeline({
              id: 'webflow-scroll-animation',
              scrollTrigger: {
                id: 'webflow-hero-scrolltrigger',
                trigger: '.container',
                pin: true, // pin the trigger element while active
                start: 'top top', // when the top of the trigger hits the top of the viewport
                end: 'bottom top', // end after scrolling 500px beyond the start
                scrub: 0.5, // smooth scrubbing, takes 1 second to "catch up" to the scrollbar
                invalidateOnRefresh: true,
                markers: true,
              },
            })
            .fromTo(
              videoCircle,
              { clipPath: 'circle(50% at 50% 50%)' },
              {
                clipPath: 'circle(0% at 50% 50%)',
                duration: circleTime,
                // ease: 'power1.in',
              },
              'start'
            )
            .to(
              circle,
              {
                scale: 0,
                opacity: 0,
                duration: circleTime,
                // ease: 'power1.in',
              },
              'start'
            )
            .to(
              dots,
              {
                scale: 1.7,
                duration: circleTime,
                // ease: 'power2.in',
              },
              'start'
            )
            .to(
              dotsWrapper,
              {
                scale: 0,
                duration: circleTime,
                // ease: 'power2.in',
              },
              'start'
            );

          gsap
            .timeline({
              id: 'webflow-scroll-animation',
              scrollTrigger: {
                id: 'webflow-hero-scrolltrigger',
                trigger: '.hero__wrapper',
                //pin: true, // pin the trigger element while active
                start: 'top top', // when the top of the trigger hits the top of the viewport
                end: '150% top', // end after scrolling 500px beyond the start
                scrub: 0.5, // smooth scrubbing, takes 1 second to "catch up" to the scrollbar
                invalidateOnRefresh: true,
                markers: true,
              },
            })

            .to(
              title,
              {
                scale: 2.2,
                duration: inputTime,
                // ease: 'power1.in',
              },
              'start'
            )
            .to(
              leftGreyText,
              {
                y: '-15.3vw',
                duration: inputTime,
                // ease: 'power1.in',
              },
              'start'
            );
        }
        // if (isMobile) {
        //   gsap
        //     .timeline({
        //       id: 'webflow-scroll-animation',
        //       scrollTrigger: {
        //         id: 'webflow-hero-scrolltrigger',
        //         trigger: '.container',
        //         pin: true, // pin the trigger element while active
        //         start: 'top top', // when the top of the trigger hits the top of the viewport
        //         end: 'bottom top', // end after scrolling 500px beyond the start
        //         scrub: 0.5, // smooth scrubbing, takes 1 second to "catch up" to the scrollbar
        //         invalidateOnRefresh: true,
        //         // markers: true,
        //       },
        //     })
        //     .to(
        //       videoCircle,
        //       {
        //         clipPath: 'circle(30% at 50% 50%)',
        //         duration: inputTime,
        //         // ease: 'power3.in',
        //       },
        //       'start'
        //     )
        //     .to(
        //       circle,
        //       {
        //         scale: 0.7,
        //         opacity: 0,
        //         duration: inputTime,
        //         // ease: 'power3.in',
        //       },
        //       'start'
        //     )
        //     .to(
        //       dots,
        //       {
        //         scale: 1.7,
        //         duration: inputTime,
        //         // ease: 'power3.in',
        //       },
        //       'start'
        //     )
        //     .to(
        //       dotsWrapper,
        //       {
        //         scale: 0.55,
        //         duration: inputTime,
        //         // ease: 'power1.in',
        //       },
        //       'start'
        //     )
        //     .to(
        //       title,
        //       {
        //         scale: 1.55,
        //         duration: inputTime,
        //         // ease: 'power3.in',
        //       },
        //       'start'
        //     )
        //     .to(
        //       leftGreyText,
        //       {
        //         y: '-7vw',
        //         duration: inputTime,
        //         // ease: 'power3.in',
        //       },
        //       'start'
        //     );
        // }
      }
    );
  });
};

const DOT_OFFSET_PX = -48; // Offset in pixels for player dots positioning
const getDotsPercent = () => {
  const playerElement = document.querySelector(player);
  if (
    !playerElement ||
    !playerElement.offsetWidth ||
    !playerElement.offsetHeight
  ) {
    return { xPercent: '0%', yPercent: '0%' };
  }
  const xPercent = (DOT_OFFSET_PX / playerElement.offsetWidth) * 100;
  const yPercent = (DOT_OFFSET_PX / playerElement.offsetHeight) * 100;

  return { xPercent: `${xPercent}%`, yPercent: `${yPercent}%` };
};

/* ====================================================
                Video Reel Scroll animation
=======================================================*/
const outputTime = 1;

export const videoReelsScrollAnimation = (ctx) => {
  let matchMedia = gsap.matchMedia();
  ctx.add(() => {
    matchMedia.add(
      {
        // set up any number of arbitrarily-named conditions. The function below will be called when ANY of them match.
        isPortrait: `(orientation: portrait)`,
        isDesktop: `(min-width: 768px)`,
      },
      (context) => {
        // context.conditions has a boolean property for each condition defined above indicating if it's matched or not.
        let { isDesktop, isPortrait } = context.conditions;

        if (isDesktop) {
          gsap
            .timeline({
              id: 'webflow-video-reel-scroll-animation',
              scrollTrigger: {
                id: 'webflow-video-reel-scrolltrigger',
                trigger: '.video-reel__inner',
                //pin: true, // pin the trigger element while active
                start: '30% bottom', // when the top of the trigger hits the top of the viewport
                end: 'center center', // end after scrolling 500px beyond the start
                scrub: 0.5, // smooth scrubbing, takes 1 second to "catch up" to the scrollbar
                invalidateOnRefresh: true,
                // markers: true,
              },
            })
            /* ======= Player part ========= */
            .fromTo(
              '.player__dots--tl',
              {
                top: isPortrait ? '20%' : '34%',
                left: isPortrait ? '12%' : '26.5%',
              },
              {
                top: () => getDotsPercent().yPercent,
                left: () => getDotsPercent().xPercent,
                duration: outputTime,
                // ease: 'power1.inOut',
              },
              'output-of-elements'
            )
            .fromTo(
              '.player__dots--tr',
              {
                top: isPortrait ? '20%' : '34%',
                right: isPortrait ? '12%' : '26.5%',
              },
              {
                top: getDotsPercent().yPercent,
                right: getDotsPercent().xPercent,
                duration: outputTime,
                // ease: 'power1.inOut',
              },
              'output-of-elements'
            )
            .fromTo(
              '.player__dots--bl',
              {
                bottom: isPortrait ? '20%' : '34%',
                left: isPortrait ? '12%' : '26.5%',
              },
              {
                bottom: getDotsPercent().yPercent,
                left: getDotsPercent().xPercent,
                duration: outputTime,
                // ease: 'power1.inOut',
              },
              'output-of-elements'
            )
            .fromTo(
              '.player__dots--br',
              {
                bottom: isPortrait ? '20%' : '34%',
                right: isPortrait ? '12%' : '26.5%',
              },
              {
                bottom: getDotsPercent().yPercent,
                right: getDotsPercent().xPercent,
                duration: outputTime,
                // ease: 'power1.inOut',
              },
              'output-of-elements'
            )
            .to(
              gsap.utils.toArray([
                '.player__dots--tl',
                '.player__dots--tr',
                '.player__dots--bl',
                '.player__dots--br',
              ]),
              { width: 140, duration: 1, ease: 'none' },
              'output-of-elements+=0.75'
            )
            .fromTo(
              playerPreview,
              {
                scale: isPortrait ? 0.7 : 0.45,
                clipPath: isPortrait
                  ? 'inset(15% 0% round 20px)'
                  : 'inset(20% 0% round 20px)',
              },
              {
                scale: 1,
                clipPath: 'inset(0% 0% round 20px)',
                // aspectRatio: 2.222,
                duration: outputTime + 0.5,
                // ease: 'power1.inOut',
                // ease: 'power1.inOut',
              },
              'output-of-elements'
            )
            .set(
              playerControlTexts,
              { visibility: 'visible' },
              'output-of-elements'
            )
            .to(
              playerControlTexts,
              {
                duration: 2,
                scrambleText: {
                  text: '{original}',
                  chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%=+<>/?',
                  tweenLength: false,
                },
              },
              'output-of-elements+=0.3'
            )
            .from(
              playerControlTexts,
              {
                opacity: 0,
                duration: 0.01,
                stagger: {
                  amount: 0.5,
                  from: 'random',
                },
              },
              'output-of-elements+=0.3'
            )
            .from(
              playerControlePlus,
              {
                autoAlpha: 0,
                duration: outputTime,
                stagger: { each: 0.04, from: 'random' },
                ease: "rough({ template: circ.easeOut, strength: 5, points: 20, taper: 'out', randomize: true, clamp:  true})",
              },
              'output-of-elements+=0.3'
            );
        }
      }
    );
  });
};

/* ====================================================
                Timeline Scroll animation
=======================================================*/

export const timelineData = {
  currentYear: 2015,
};

const introDuctionTime = 0.2;
const mainDuctionTime = 0.5;
export const timelineScrollAnimation = (ctx, currentYear) => {
  ctx.add(() => {
    gsap
      .timeline({
        id: 'webflow-timeline-scroll-animation',
        scrollTrigger: {
          id: 'webflow-timeline-scrolltrigger',
          trigger: '.timeline__inner',
          //pin: true, // pin the trigger element while active
          start: 'top bottom-=20%', // when the top of the trigger hits the top of the viewport
          end: 'bottom -100%', // end after scrolling 500px beyond the start
          scrub: 0.5, // smooth scrubbing, takes 1 second to "catch up" to the scrollbar
          invalidateOnRefresh: true,
          // markers: true,
        },
      })
      .fromTo(
        currentYear,
        { value: 2015 },
        {
          value: 2018,
          duration: introDuctionTime,
          ease: 'none',
          //ease: 'power1.in',
        },
        'intro'
      )
      .fromTo(
        '.timeline__yearline_list',
        { xPercent: 0 },
        {
          xPercent: -18,
          duration: introDuctionTime,
          ease: 'none',
          //ease: 'power1.in',
        },
        'intro'
      )
      .fromTo(
        '.timeline__arrow',
        { xPercent: -50 },
        {
          xPercent: 0,
          duration: introDuctionTime,
          ease: 'none',
        },
        'intro'
      )
      .fromTo(
        '.timeline__arrow_blick',
        { rotate: -90, scale: 0.5 },
        {
          rotate: -60,
          scale: 0.75,
          duration: introDuctionTime,
          ease: 'none',
        },
        'intro'
      )
      .fromTo(
        '.timeline__through_list .item.entry .item__title',
        { opacity: 0.2 },
        { opacity: 1, duration: introDuctionTime, ease: 'none' },
        'intro'
      )
      .fromTo(
        '.timeline__arrow',
        { x: '0vw' },
        {
          x: '115vw',
          duration: mainDuctionTime,
          ease: 'none',
        },
        'main'
      )
      .fromTo(
        '.timeline__arrow_blick',
        { rotate: -60, scale: 0.75, opacity: 0 },
        {
          rotate: 0,
          scale: 1,
          opacity: 1,
          duration: mainDuctionTime / 2,
          ease: 'none',
        },
        'main'
      )
      .fromTo(
        currentYear,
        { value: 2018 },
        {
          value: 2030,
          duration: mainDuctionTime / 1.3,
          ease: 'none',
          //ease: 'power1.in',
        },
        'main'
      )
      .fromTo(
        '.timeline__yearline_list',
        { xPercent: -18 },
        {
          xPercent: -100,
          duration: mainDuctionTime,
          ease: 'none',
          //ease: 'power1.in',
        },
        'main'
      );
    gsap
      .timeline({
        id: 'webflow-timeline-scroll-animation',
        scrollTrigger: {
          id: 'webflow-timeline-scrolltrigger',
          trigger: '.timeline__inner',
          pin: true, // pin the trigger element while active
          start: 'top top', // when the top of the trigger hits the top of the viewport
          end: 'bottom top', // end after scrolling 500px beyond the start
          scrub: 0.5, // smooth scrubbing, takes 1 second to "catch up" to the scrollbar
          invalidateOnRefresh: true,
          // markers: true,
        },
      })
      .fromTo(
        '.timeline__arrow_line',
        {
          scaleX: 1,
          background: 'linear-gradient(90deg, #000 0%, #fff 100%)',
        },
        {
          scaleX: 3,
          background: 'linear-gradient(90deg, #000 0%, #136DF4 100%)',
          duration: 1,
          ease: 'none',
          //ease: 'none',
          immediateRender: false,
        }
      )
      .fromTo(
        '.timeline__arrow_dot',
        {
          backgroundColor: '#fff',
        },
        {
          backgroundColor: '#136DF4',
          duration: 1,
          ease: 'none',
          //ease: 'none',
          immediateRender: false,
        },
        '<'
      )
      .fromTo(
        '.timeline__year',
        {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        {
          color: '#136DF4',
          duration: 1,
          ease: 'none',
          //ease: 'none',
          immediateRender: false,
        },
        '<'
      )

      .fromTo(
        gsap.utils.toArray('.timeline__through_list .item.main .item__title'),
        { opacity: 0.2 },
        {
          opacity: 1,
          duration: introDuctionTime,
          ease: 'none',
          stagger: 0.3,
        },
        '<'
      )
      .fromTo(
        gsap.utils.toArray('.timeline__through_list .item.main .item__dot'),
        { opacity: 0.2 },
        {
          opacity: 1,
          duration: introDuctionTime,
          ease: 'none',
          stagger: 0.3,
        },
        '<'
      )
      .fromTo(
        gsap.utils.toArray('.timeline__through_list .item.main .item__info h4'),
        { opacity: 0.5 },
        {
          opacity: 1,
          duration: introDuctionTime,
          ease: 'none',
          stagger: 0.3,
        },
        '<'
      )
      .fromTo(
        gsap.utils.toArray(
          '.timeline__through_list .item.main .item__info_text'
        ),
        { opacity: 0.01 },
        {
          opacity: 1,
          duration: introDuctionTime,
          ease: 'none',
          stagger: 0.3,
        },
        '<'
      )
      .to(
        gsap.utils.toArray(
          '.timeline__through_list .item.main .item__info_text p:nth-child(1)'
        ),
        {
          duration: introDuctionTime,
          ease: 'none',
          stagger: 0.28,
          scrambleText: {
            text: '{original}',
            chars:
              '//⟟+o  [_⋉o.⌿..⟟..+o] ⏃⟟+ //: ⌿+⟟⏁ / +o...[++_⋉//⟟+o..⌿..⟟..+o] ⏃',
            tweenLength: false,
          },
        },
        '<'
      )
      .to(
        gsap.utils.toArray(
          '.timeline__through_list .item.main .item__info_text p:nth-child(2)'
        ),
        {
          duration: introDuctionTime,
          ease: 'none',
          stagger: 0.28,
          scrambleText: {
            text: '{original}',
            chars:
              '//⟟+o  [_⋉o.⌿..⟟..+o] ⏃⟟+ //: ⌿+⟟⏁ / +o...[++_⋉//⟟+o..⌿..⟟..+o] ⏃',
            tweenLength: false,
          },
        },
        '<'
      );
  });
};
