import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import useLoader from '~/composables/useLoader';

const videoCircle = '.scene .video';
const dotsWrapper = '.scene .dots';
const dots = '.scene .dots span';
const circle = '.scene .circle-wrapper';
const title = '.left-text h1';
const greyText = '.left-text .grey-text';

/* ====================================================
                  Initial animation
=======================================================*/

/* ====================================================
                  Initial animation mobile
=======================================================*/

/* ====================================================
                  Scroll animation
=======================================================*/

const outputTime = 1;
export const heroScrollAnimation = (ctx) => {
  console.log('ctx', ctx);

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
              markers: true,
            },
          })
          .to(
            videoCircle,
            {
              clipPath: 'circle(30% at 50% 50%)',
              duration: outputTime,
              ease: 'power3.inOut',
            },
            'start'
          )
          .to(
            circle,
            {
              scale: 0.7,
              opacity: 0,
              duration: outputTime,
              ease: 'power3.inOut',
            },
            'start'
          )
          .to(
            dots,
            {
              scale: 1.7,
              duration: outputTime,
              ease: 'power3.inOut',
            },
            'start'
          )
          .to(
            dotsWrapper,
            {
              scale: 0.55,
              duration: outputTime,
              ease: 'power1.inOut',
            },
            'start'
          )
          .to(
            title,
            {
              scale: 1.55,
              duration: outputTime,
              ease: 'power3.inOut',
            },
            'start'
          )
          .to(
            greyText,
            {
              y: '-7vw',
              duration: outputTime,
              ease: 'power3.inOut',
            },
            'start'
          );
      }
    );
  });
};
