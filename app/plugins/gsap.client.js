import gsap from 'gsap';
import { RoughEase } from 'gsap/EasePack';
import ScrambleTextPlugin from 'gsap/ScrambleTextPlugin';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    gsap.registerPlugin(
      ScrollTrigger,
      ScrollSmoother,
      ScrambleTextPlugin,
      RoughEase,
      SplitText
    );
  }
});
