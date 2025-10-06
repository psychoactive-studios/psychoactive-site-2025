// composables/useLoader.js
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { ref } from 'vue';

const scrollSmoother = ref(false); // global state

export default function () {
  // methods for managing loading state
  const initScrollSmoother = () => {
    scrollSmoother.value = ScrollSmoother.create({
      smooth: 2,
      // effects: true,
      normalizeScroll: true,
    });
    scrollSmoother.value.scrollTo(0, false);
    scrollSmoother.value.paused(true);
  };

  // Disable and enable scrolling
  const disableScroll = () => scrollSmoother.value.paused(true);

  // Enable and enable scrolling
  const enableScroll = () => scrollSmoother.value.paused(false);

  return {
    scrollSmoother,
    initScrollSmoother,
    disableScroll,
    enableScroll,
  };
}
