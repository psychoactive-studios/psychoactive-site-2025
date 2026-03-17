import gsap from 'gsap';
import DrawSVGPlugin from 'gsap/DrawSVGPlugin';
import { RoughEase } from 'gsap/EasePack';
import { Flip } from 'gsap/Flip';
import { GSDevTools } from 'gsap/GSDevTools';
import MotionPathPlugin from 'gsap/MotionPathPlugin';
import ScrambleTextPlugin from 'gsap/ScrambleTextPlugin';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    gsap.registerPlugin(
      ScrollTrigger,
      ScrollSmoother,
      ScrollToPlugin,
      ScrambleTextPlugin,
      RoughEase,
      SplitText,
      Flip,
      DrawSVGPlugin,
      MotionPathPlugin,
      GSDevTools
    );
  }
});
