import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useLoader } from '~/composables/useLoader';

/* ======== Player elements ========= */
const playerPreview = '.video-player .player__preview';
const playerDotsL = '.player__dots--tl, .player__dots--bl';
const playerDotsR = '.player__dots--tr, .player__dots--br';
const playerButton = '.video-player .play-button';
const playerControlePlus = '.player__preview_controls .plus';
let playerControlTexts;

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

/* ======== Partners elements ========== */
const partnersContainer = '.hero__intro_partners';
const partnersLogos = '.hero__intro_partners .list';

/* ====================================================
              Split text initialization
=======================================================*/
export const heroInitSplitText = () => {
  playerControlTexts = SplitText.create(
    '.player__preview_controls .play-reel-text, .player__preview_controls .play-time-text',
    {
      type: 'chars',
      charsClass: 'char-center',
    }
  ).chars;
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
  const { stopLoading } = useLoader();

  /* ======== Layout elements Animation ========= */
  const layoutElements = gsap.utils.toArray(
    ['#header-logo', '#header-navigation-button', '#header-sound-button'],
    document
  );

  const loaderElement = document.querySelector('.loader__animation');

  const ease1 = 'power3.out';
  const duration1 = 2;
  const easeCircle = 'power3.inOut';

  ctx.add(() => {
    gsap
      .timeline({ onComplete: () => scrollSmoother.value.paused(false) })
      .to(loaderElement, {
        scale: 0,
        duration: 0.5,
        ease: 'power3.out',
        delay: 1.6,
      })
      .add(() => {
        stopLoading();
      })
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
      .from(
        centerLine,
        { scaleX: 0, duration: duration1, ease: ease1 },
        'firstPart'
      )
      .from(
        centerLeft,
        {
          xPercent: 100,
          x: -4,
          duration: duration1,
          ease: ease1,
        },
        'firstPart'
      )
      .from(
        centerRight,
        {
          xPercent: -100,
          x: 3,
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
      .from(
        canvas,
        { scale: 0.7, duration: 2, ease: 'power3.out' },
        'firstPart'
      )
      .from(
        canvas,
        { opacity: 0, duration: 2, ease: 'power1.out' },
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
      .from(
        psychoactiveText,
        {
          opacity: 0,
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
      .from(
        labelImage,
        { xPercent: 175, duration: 1.15, ease: 'power4.out' },
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
      .from(
        agencyText,
        {
          opacity: 0,
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
      .from(
        scaleText,
        { xPercent: -175, duration: 1.15, ease: 'power4.out' },
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
      .from(
        partnersLogos,
        { opacity: 0, yPercent: 35, duration: 0.9, ease: 'power4.out' },
        'secondPart+=0.85'
      )
      /* ======= Layout elements part ========= */
      .from(
        layoutElements,
        { scale: 0, duration: 0.75, ease: 'power3.out' },
        'secondPart+=0.2'
      )
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
      .from(
        dotsArrowIcon,
        {
          autoAlpha: 0,
          duration: 2,
          stagger: { each: 0.05, from: 'random' },
          ease: "rough({ template: circ.easeOut, strength: 5, points: 20, taper: 'out', randomize: true, clamp:  true})",
        },
        'finalPart'
      );
  });
};

const outputTime = 1.3;
/* ====================================================
                  Scroll animation
=======================================================*/
export const heroScrollAnimation = (ctx) => {
  ctx.add(() => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: '.hero__intro',
          pin: true, // pin the trigger element while active
          start: 'top top', // when the top of the trigger hits the top of the viewport
          end: 'bottom 15%', // end after scrolling 500px beyond the start
          scrub: 0.5, // smooth scrubbing, takes 1 second to "catch up" to the scrollbar
          markers: true,
        },
      })
      .to(
        scaleText,
        { xPercent: -175, duration: outputTime, ease: 'power4.out' },
        'output-of-elements'
      )
      .to(
        imagineContainer,
        { xPercent: -125, duration: outputTime, ease: 'power2.out' },
        'output-of-elements'
      )
      /* ======= Top text part ========= */
      .to(
        labelImage,
        { xPercent: 175, duration: outputTime, ease: 'power4.out' },
        'output-of-elements'
      )
      .to(
        agencyText,
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
        innovationContainer,
        { xPercent: 175, duration: outputTime, ease: 'power4.out' },
        'output-of-elements'
      )
      /* ======= Psychoactive part ========= */
      .to(
        psychoactiveText,
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
      ) /* ======= Dots arrow part ========= */
      .to(
        gsap.utils.toArray([dotsArrowIcon, dotsArrowPlusIcons]),
        {
          autoAlpha: 0,
          duration: 0.5,
          stagger: { each: 0.04, from: 'random' },
          ease: "rough({ template: circ.easeOut, strength: 5, points: 20, taper: 'out', randomize: true, clamp:  true})",
        },
        'output-of-elements'
      )
      /* ======= Canvas part ========= */
      .to(
        canvas,
        { scale: 0.4, duration: outputTime, ease: 'power4.out' },
        'output-of-elements'
      )
      /* ======= Circle part ========= */
      .to(
        circleContainer,
        { rotate: 120, opacity: 0, duration: outputTime, ease: 'power4.out' },
        'output-of-elements'
      )
      /* ======= Center line part ========= */
      .to(
        centerLine,
        { scaleX: 0, duration: outputTime, ease: 'power3.out' },
        'output-of-elements'
      )
      .to(
        centerLeft,
        {
          xPercent: 100,
          x: -4,
          duration: outputTime,
          ease: 'power3.out',
        },
        'output-of-elements'
      )
      .to(
        centerRight,
        {
          xPercent: -100,
          x: 3,
          duration: outputTime,
          ease: 'power3.out',
        },
        'output-of-elements'
      )
      /* ======= Partners part ========= */
      .to(
        partnersContainer,
        { height: 0, duration: 1, ease: 'power4.out' },
        'output-of-elements'
      )
      .to(
        partnersLogos,
        { yPercent: 300, duration: 1, ease: 'power4.out' },
        'output-of-elements'
      )
      /* ======= Player part ========= */
      .to(
        '.player__dots--tl',
        { top: -48, left: -48, duration: outputTime, ease: 'power4.out' },
        'output-of-elements'
      )
      .to(
        '.player__dots--tr',
        { top: -48, right: -48, duration: outputTime, ease: 'power4.out' },
        'output-of-elements'
      )
      .to(
        '.player__dots--bl',
        { bottom: -48, left: -48, duration: outputTime, ease: 'power4.out' },
        'output-of-elements'
      )
      .to(
        '.player__dots--br',
        {
          bottom: -48,
          right: -48,
          duration: outputTime + 0.5,
          ease: 'power4.out',
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
        { width: 140, duration: 1, ease: 'power4.out' },
        'output-of-elements+=0.75'
      )
      .to(
        playerPreview,
        {
          scale: 1,
          clipPath: 'inset(0% 0% round 20px)',
          duration: outputTime + 0.5,
          ease: 'power4.out',
        },
        'output-of-elements'
      )
      .set(playerControlTexts, { visibility: 'visible' }, 'output-of-elements')
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
  });

  // playerControlTexts
  // const playerPreview = '.video-player .player__preview';
  // const playerDotsL = '.player__dots--tl, .player__dots--bl';
  // const playerDotsR = '.player__dots--tr, .player__dots--br';
  // const playerButton = '.video-player .play-button';

  console.log('heroScrollAnimation click!!!!');
};
