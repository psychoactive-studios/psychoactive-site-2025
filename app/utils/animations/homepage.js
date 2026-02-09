import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import useLoader from '~/composables/useLoader';

/* ======== Player elements ========= */
const player = '.video-player.homehero-prepared';
const playerPreview = '.video-player .player__preview';
const playerDotsL = '.player__dots--tl, .player__dots--bl';
const playerDotsR = '.player__dots--tr, .player__dots--br';
const playerButton = '.video-player .play-button';
const playerControlePlus = '.player__preview_controls .plus';
const playerControlTexts =
  '.player.homehero-prepared .play-reel-text .char-center, .player.homehero-prepared .play-time-text .char-center';

/* ======== Center line elements ========== */
const centerLine = '.center__line';
const centerLeft = '.center__part--left';
const centerRight = '.center__part--right';
let centerTexts, centerControlTexts;

/* ======== Canvas element ========== */
const canvas = '.homehero-3d-scene';

/* ======== Circle elements ========== */
const circleContainer = '.circle';
const circlePath1 = '.circle .circle-path-1';
const circlePath2 = '.circle .circle-path-2';
const circleDots = '.circle .circle-dots';

/* ======== Psychoactive block elements ========== */
let psychoactiveText;
const psychoactiveIconH = '.psychoactive__horizontal';
const psychoactiveIconV = '.psychoactive__vertical';

/* ======== Bottom text elements ========== */
const imagineContainer = '.bottom-text__imagine';
let imagineText;

const scaleText = '.bottom-text__scale';
const arrows = '.bottom-text__scale-arrows';

/* ======== Top text elements ========== */
const labelImage = '.top-text__label';
const innovationContainer = '.top-text__innovation';
let agencyText, innovationText;

/* ======== Dots arrow elements ========== */
const dotsArrowBox = '.dots-arrow';
const dotsArrowIcon = '.dots-arrow__icon_dot';
const dotsArrowPlusH = '.dots-arrow__horizontal';
const dotsArrowPlusV = '.dots-arrow__vertical';
const dotsArrowPlusIcons = '.dots-arrow__plus';

/* ====================================================
              Split text initialization
=======================================================*/
export const heroInitSplitText = () => {
  centerTexts = SplitText.create('.center__part .center__text', {
    type: 'chars',
    charsClass: 'char-center',
  }).chars;

  centerControlTexts = SplitText.create(
    '.center__text--play, .center__text--time',
    { type: 'chars', charsClass: 'char-control' }
  ).chars;

  psychoactiveText = SplitText.create('.psychoactive__text', {
    type: 'chars',
    charsClass: 'char-psycho',
  }).chars;

  imagineText = SplitText.create('.bottom-text__imagine', {
    type: 'chars',
    charsClass: 'char-imagine',
  }).chars;

  agencyText = SplitText.create('.top-text__agency', {
    type: 'chars',
    charsClass: 'char-agency',
  }).chars;

  innovationText = SplitText.create('.top-text__innovation', {
    type: 'chars',
    charsClass: 'char-inno',
  }).chars;
};

/* ====================================================
                  Initial animation
=======================================================*/
export const heroInitAnimation = (ctx, scrollSmoother) => {
  // const { isFirstLoad } = useLoader();

  /* ======== Layout elements Animation ========= */
  const layoutElements = gsap.utils.toArray([
    '#header-logo',
    '#header-navigation-button',
    '#header-sound-button',
  ]);

  // const loaderElement = document.querySelector('#loader-logo');

  const ease1 = 'power3.out';
  const duration1 = 2;
  const easeCircle = 'power3.inOut';

  // ctx.add(() => {
  gsap
    .timeline({ id: 'homepage-initial-animation' })
    // .to(loaderElement, {
    //   scale: 0,
    //   duration: 0.5,
    //   ease: 'power3.out',
    //   delay: 1.6,
    // })
    // .add(() => {
    //   stopLoading();
    // })
    /* =======Player part ========= */
    .from(
      playerPreview,
      {
        clipPath: 'inset(20% 50% round 20px)',
        duration: duration1,
        ease: ease1,
      },
      'firstPart'
    )
    .from(
      playerDotsL,
      { left: '50%', duration: duration1, ease: ease1 },
      'firstPart'
    )
    .from(
      playerDotsR,
      { right: '50%', duration: duration1, ease: ease1 },
      'firstPart'
    )
    .from(playerButton, { scale: 0, duration: 0.3 }, 'firstPart+=1')
    /* ======= Center line part ========= */
    .fromTo(
      centerLine,
      { scaleX: 0, visibility: 'hidden' },
      { scaleX: 1, visibility: 'visible', duration: duration1, ease: ease1 },
      'firstPart'
    )
    .fromTo(
      centerLeft,
      { xPercent: 100, x: -4 },
      {
        xPercent: 0,
        x: 0,
        duration: duration1,
        ease: ease1,
      },
      'firstPart'
    )
    .fromTo(
      centerRight,
      { xPercent: -100, x: 3 },
      {
        xPercent: 0,
        x: 0,
        duration: duration1,
        ease: ease1,
      },
      'firstPart'
    )
    .to(
      centerTexts,
      {
        duration: 4.5,
        scrambleText: {
          text: '{original}',
          chars: '0123456789!@#$%^&*()-_=+[]{};:<>/?,.',
          tweenLength: false,
        },
      },
      'firstPart'
    )
    .from(
      centerTexts,
      {
        opacity: 0,
        duration: 0.01,
        stagger: {
          amount: 1,
          from: 'random',
        },
      },
      'firstPart'
    )
    .to(
      centerControlTexts,
      {
        duration: 2.3,
        scrambleText: {
          text: '{original}',
          chars: 'uppercase',
          tweenLength: false,
        },
      },
      'firstPart+=0.5'
    )
    .from(
      centerControlTexts,
      {
        opacity: 0,
        duration: 0.01,
        stagger: {
          amount: 0.9,
          from: 'random',
        },
      },
      'firstPart+=0.5'
    )
    /* ======= Canvas part ========= */
    .fromTo(
      canvas,
      { scale: 0.7, visibility: 'hidden' },
      { scale: 1, visibility: 'visible', duration: 2, ease: 'power3.out' },
      'firstPart'
    )
    .fromTo(
      canvas,
      { opacity: 0 },
      { opacity: 1, duration: 2, ease: 'power1.out' },
      'firstPart'
    )
    /* ======= Circle part ========= */
    .from(
      [circlePath1, circlePath2],
      {
        strokeDashoffset: 626.43,
        duration: 1.85,
        ease: easeCircle,
      },
      'firstPart+=0.3'
    )
    .from(
      circleDots,
      { autoAlpha: 0, rotate: 0, duration: 1.85, ease: easeCircle },
      'firstPart+=0.3'
    )
    .add('secondPart', 'firstPart+=1.2')

    /* ======= Psychoactive part ========= */
    .to(
      psychoactiveText,
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
      psychoactiveText,
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
    .set(
      [psychoactiveIconH, psychoactiveIconV],
      { visibility: 'visible' },
      'secondPart'
    )
    .from(
      psychoactiveIconH,
      {
        xPercent: -100,
        duration: 1.85,
        ease: 'power4.out',
      },
      'secondPart'
    )
    .from(
      psychoactiveIconV,
      {
        yPercent: -100,
        duration: 1.85,
        ease: 'power4.out',
      },
      'secondPart'
    )
    /* ======= Top text part ========= */
    .fromTo(
      labelImage,
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
      agencyText,
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
      agencyText,
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
    .from(
      innovationText,
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
    /* ======= Bottom text part ========= */
    .fromTo(
      scaleText,
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
      imagineText,
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
    .from(
      arrows,
      {
        opacity: 0,
        duration: 1.15,
        letterSpacing: '-3.5vw',
        ease: 'power4.out',
      },
      'secondPart+=0.25'
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
    /* ======= Layout elements part ========= */
    // if (isFirstLoad.value) {
    //   tl.to(
    //     layoutElements,
    //     { scale: 1, opacity: 1, duration: 0.75, ease: 'power3.out' },
    //     'secondPart+=0.2'
    //   );
    //   isFirstLoad.value = false;
    // }

    /* ======= Dots arrow part ========= */
    .add('finalPart', 'secondPart+=1.2')
    .set(dotsArrowBox, { visibility: 'visible' }, 'finalPart')
    .from(
      dotsArrowPlusH,
      {
        xPercent: 100,
        duration: 1.85,
        ease: 'power4.out',
      },
      'finalPart'
    )
    .from(
      dotsArrowPlusV,
      {
        yPercent: 100,
        duration: 1.85,
        ease: 'power4.out',
      },
      'finalPart'
    )
    .fromTo(
      dotsArrowIcon,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1,
        stagger: { each: 0.05, from: 'random' },
        ease: "rough({ template: power1.out, strength: 5, points: 20, taper: 'none', randomize: true, clamp: false})",
      },
      'finalPart'
    )
    // The '-=1' offset ensures heroScrollAnimation and scrollSmoother resume 1 second before the timeline ends for a smoother transition.
    .add(() => {
      scrollSmoother.value.start();
    }, '-=1');
  // });
};

/* ====================================================
                  Initial animation mobile
=======================================================*/
export const heroInitAnimationMobile = (ctx) => {
  const { stopLoading } = useLoader();

  ctx.add(() => {
    const loaderElement = document.querySelector('#loader-logo');

    const centerControlTexts = SplitText.create(
      '.hero-mobile__player_controls .controls-text',
      { type: 'chars', charsClass: 'char-control' }
    ).chars;

    gsap
      .timeline({ id: 'homepage-initial-animation-mobile' })
      .to(loaderElement, {
        scale: 0,
        duration: 0.5,
        ease: 'power3.out',
        delay: 1.6,
      })
      .add(() => {
        stopLoading();
      })
      .from('.hero-mobile__preview', {
        opacity: 0,
        duration: 0.5,
      })
      .from('.controls-button', { scale: 0, duration: 0.5 }, '<')
      .to(
        centerControlTexts,
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
        centerControlTexts,
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
      .fromTo(
        document.querySelector('.navigation-mobile'),
        {
          y: 64,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
        },
        '<+=0.5'
      )
      .add(() => {
        stopLoading();
        // scrollSmoother.value.start();
      });
  });
};

/* ====================================================
                  Scroll animation
=======================================================*/

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

const outputTime = 1.3;
export const heroScrollAnimation = (ctx, isPlaying) => {
  const matchMedia = gsap.matchMedia();
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
              id: 'homepage-scroll-animation',
              scrollTrigger: {
                id: 'homepage-hero-scrolltrigger',
                trigger: '.hero__intro',
                pin: true, // pin the trigger element while active
                pinType: 'transform',
                start: 'top top', // when the top of the trigger hits the top of the viewport
                end: 'bottom top', // end after scrolling 500px beyond the start
                scrub: 0.5, // smooth scrubbing, takes 1 second to "catch up" to the scrollbar
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                  if (self.progress > 0.45) {
                    isPlaying.value = false;
                  } else {
                    isPlaying.value = true;
                  }
                },
                // markers: true,
              },
            })
            .fromTo(
              scaleText,
              { xPercent: 0 },
              { xPercent: -175, duration: outputTime, ease: 'power1.out' },
              'output-of-elements'
            )
            .fromTo(
              imagineContainer,
              { xPercent: 0 },
              { xPercent: -125, duration: outputTime },
              'output-of-elements'
            )
            /* ======= Top text part ========= */
            .fromTo(
              labelImage,
              { xPercent: 0 },
              { xPercent: 175, duration: outputTime, ease: 'power1.out' },
              'output-of-elements'
            )
            .fromTo(
              agencyText,
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
              innovationContainer,
              { xPercent: 0 },
              { xPercent: 175, duration: outputTime, ease: 'power1.out' },
              'output-of-elements'
            )
            /* ======= Psychoactive part ========= */
            .fromTo(
              psychoactiveText,
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
              gsap.utils.toArray([psychoactiveIconH, psychoactiveIconV]),
              {
                opacity: 0,
                duration: 0.01,
              },
              'output-of-elements+=0.15'
            )
            /* ======= Dots arrow part ========= */
            .fromTo(
              gsap.utils.toArray([dotsArrowIcon, dotsArrowPlusIcons]),
              { autoAlpha: 1 },
              {
                autoAlpha: 0,
                duration: 0.5,
                stagger: { each: 0.04, from: 'random' },
                ease: "rough({ template: circ.easeOut, strength: 5, points: 20, taper: 'out', randomize: true, clamp:  true})",
              },
              'output-of-elements'
            )
            .set(dotsArrowBox, { visibility: 'hidden' })
            /* ======= Canvas part ========= */
            .fromTo(
              canvas,
              { scale: 1 },
              { scale: 0.4, duration: outputTime, ease: 'power1.out' },
              'output-of-elements'
            )
            /* ======= Circle part ========= */
            .to(
              circleContainer,
              {
                rotate: 120,
                opacity: 0,
                duration: outputTime,
                ease: 'power1.out',
              },
              'output-of-elements'
            )
            /* ======= Center line part ========= */
            .fromTo(
              centerLine,
              { scaleX: 1 },
              { scaleX: 0, duration: outputTime, ease: 'power3.out' },
              'output-of-elements'
            )
            .fromTo(
              centerLeft,
              { xPercent: 0, x: 0 },
              {
                xPercent: 100,
                x: -4,
                duration: outputTime,
                ease: 'power3.out',
              },
              'output-of-elements'
            )
            .fromTo(
              centerRight,
              { xPercent: 0, x: 0 },
              {
                xPercent: -100,
                x: 3,
                duration: outputTime,
                ease: 'power3.out',
              },
              'output-of-elements'
            )
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
                ease: 'power1.out',
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
                ease: 'power1.out',
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
                ease: 'power1.out',
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
                ease: 'power1.out',
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
              { width: 140, duration: 1, ease: 'power1.out' },
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
                ease: 'power1.out',
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
    return () => matchMedia.revert();
  });
};
