import Lenis from 'lenis';
import { ref } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const scrollSmoother = ref(null); // global state

export default function () {
  // methods for managing loading state
  const initScrollSmoother = () => {
    const lenis = new Lenis({
      // duration: 1.2,
      // easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // direction: 'vertical',
      // gestureDirection: 'vertical',
      // smooth: true,
      // mouseMultiplier: 1,
      // smoothTouch: false,
      // touchMultiplier: 2,
    });

    // Add compatibility methods for GSAP ScrollSmoother
    // lenis.scrollTop = function (value, smooth = true) {
    //   if (arguments.length) {
    //     this.scrollTo(value, { immediate: !smooth });
    //   } else {
    //     return this.scroll;
    //   }
    // };

    // lenis.paused = function (isPaused) {
    //   if (isPaused) this.stop();
    //   else this.start();
    // };

    // lenis.refresh = function () {
    //   this.resize();
    // };

    scrollSmoother.value = lenis;

    // Integrate with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Initial state
    lenis.scrollTo(0, { immediate: true });
    lenis.stop();
  };

  // Disable and enable scrolling
  const disableScroll = () => scrollSmoother.value?.stop();

  // Enable and enable scrolling
  const enableScroll = () => scrollSmoother.value?.start();

  return {
    scrollSmoother,
    initScrollSmoother,
    disableScroll,
    enableScroll,
  };
}
