import gsap from 'gsap';
import { RoughEase } from 'gsap/EasePack';
import ScrambleTextPlugin from 'gsap/ScrambleTextPlugin';
import { SplitText } from 'gsap/SplitText';

export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    gsap.registerPlugin(ScrambleTextPlugin, RoughEase, SplitText);
  }
});
