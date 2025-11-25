import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import useLoader from '~/composables/useLoader';

const videoCircle = '.scene .video';
const dotsWrapper = '.scene .dots';
const dots = '.scene .dots span';
const circle = '.scene .circle-wrapper';
const title = '.left-text h1';
const greyText = '.left-text .grey-text';

/* ======== Player elements ========= */
const player = '.video-reel__video';
const playerPreview = '.player.video-reel__video .player__preview';
const playerControlTexts =
  '.player.video-reel__video .play-reel-text .char-center, .player.video-reel__video .play-time-text .char-center';
const playerControlePlus =
  '.player.video-reel__video .player__preview_controls .plus';

/* ====================================================
                  Initial animation
=======================================================*/

/* ====================================================
                  Initial animation mobile
=======================================================*/

/* ====================================================
                  Scroll animation
=======================================================*/

const inputTime = 1;
export const heroScrollAnimation = (ctx) => {
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
              // markers: true,
            },
          })
          .to(
            videoCircle,
            {
              clipPath: 'circle(30% at 50% 50%)',
              duration: inputTime,
              ease: 'power3.in',
            },
            'start'
          )
          .to(
            circle,
            {
              scale: 0.7,
              opacity: 0,
              duration: inputTime,
              ease: 'power3.in',
            },
            'start'
          )
          .to(
            dots,
            {
              scale: 1.7,
              duration: inputTime,
              ease: 'power3.in',
            },
            'start'
          )
          .to(
            dotsWrapper,
            {
              scale: 0.55,
              duration: inputTime,
              ease: 'power1.in',
            },
            'start'
          )
          .to(
            title,
            {
              scale: 1.55,
              duration: inputTime,
              ease: 'power3.in',
            },
            'start'
          )
          .to(
            greyText,
            {
              y: '-7vw',
              duration: inputTime,
              ease: 'power3.in',
            },
            'start'
          );
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

const outputTime = 1;
export const videoReelsScrollAnimation = (ctx) => {
  console.log('ctx1', ctx);
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
                start: 'top center', // when the top of the trigger hits the top of the viewport
                end: 'bottom center', // end after scrolling 500px beyond the start
                scrub: 0.5, // smooth scrubbing, takes 1 second to "catch up" to the scrollbar
                invalidateOnRefresh: true,
                markers: true,
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
  });
};
