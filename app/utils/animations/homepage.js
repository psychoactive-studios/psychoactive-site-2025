import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

export const heroInitAnimation = (ctx) => {
  /* ======== Player elements ========= */
  const playerPreview = '.video-player .player__preview';
  const playerDotsL = '.player__dots--tl, .player__dots--bl';
  const playerDotsR = '.player__dots--tr, .player__dots--br';
  const playerButton = '.video-player .play-button';

  /* ======== Center line elements ========== */
  const centerLine = '.center__line';
  const centerLeft = '.center__part--left';
  const centerRight = '.center__part--right';
  const centerTexts = SplitText.create('.center__part .center__text', {
    type: 'chars',
    charsClass: 'char-center',
  }).chars;

  const centerControlTexts = SplitText.create(
    '.center__text--play, .center__text--time',
    { type: 'chars', charsClass: 'char-control' }
  ).chars;

  /* ======== Canvas element ========== */
  const canvas = '.homehero-3d-scene';

  /* ======== Circle elements ========== */
  const circlePath1 = '.circle .circle-path-1';
  const circlePath2 = '.circle .circle-path-2';
  const circleDots = '.circle .circle-dots';

  /* ======== Psychoactive block elements ========== */
  const psychoactiveText = SplitText.create('.psychoactive__text', {
    type: 'chars',
    charsClass: 'char-psycho',
  }).chars;

  const psychoactiveIconH = '.psychoactive__horisontal';
  const psychoactiveIconV = '.psychoactive__vertical';

  /* ======== Bottom text elements ========== */
  const imagineText = SplitText.create('.bottom-text__imagine', {
    type: 'chars',
    charsClass: 'char-imagine',
  }).chars;

  const scaleText = '.bottom-text__scale';
  const arrows = '.bottom-text__scale-arrows';

  /* ======== Top text elements ========== */
  const labelImage = '.top-text__label';
  const agencyText = SplitText.create('.top-text__agency', {
    type: 'chars',
    charsClass: 'char-agency',
  }).chars;

  const innovationText = SplitText.create('.top-text__innovation', {
    type: 'chars',
    charsClass: 'char-inno',
  }).chars;

  /* ======== Dots arrow elements ========== */
  const dotsArrowBox = '.dots-arrow';
  const dotsArrowIcon = '.dots-arrow__icon_dot';
  const dotsArrowPlusH = '.dots-arrow__horizontal';
  const dotsArrowPlusV = '.dots-arrow__vertical';

  /* ======== Partners elements ========== */
  const partnersLogos = '.hero__intro_partners';

  /* ======== Layout elements Animation ========= */
  const layoutElements = gsap.utils.toArray(
    ['#header-logo', '#header-navigation-button', '#header-sound-button'],
    document
  );

  const ease1 = 'power3.out';
  const duration1 = 2;
  const easeCircle = 'power3.inOut';

  ctx.add(() => {
    gsap
      .timeline({ delay: 1, paused: false })
      // .timeScale(0.25)
      /* =======Player part ========= */
      .from(
        playerPreview,
        {
          clipPath: 'polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)',
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
