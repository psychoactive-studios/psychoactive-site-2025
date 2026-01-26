import useLoader from '~/composables/useLoader';
import { useMediaQuery } from '@vueuse/core';
import { Howl } from 'howler';
import { ref } from 'vue';

const fileList = [
  '/sound/temp/frog-new.wav',
  '/sound/temp/slider-2.wav',
  '/sound/temp/slider-3.wav',
  '/sound/temp/contact-load.wav',
  '/sound/temp/content-load.wav',
  '/sound/temp/work-load.wav',
  '/sound/temp/about-load.wav',
  '/sound/temp/webflow-load.wav',
  '/sound/temp/home-load.wav',
  '/sound/temp/services-load.wav',
  '/sound/temp/sound-btn-hover-1.wav',
  '/sound/temp/accordion-open.wav',
  '/sound/temp/accordion-close.wav',
  '/sound/temp/home-hover.wav',
  '/sound/temp/home-hover-latest.wav',
  '/sound/temp/talk-btn-hover.wav',
  '/sound/temp/ai-hover.wav',
  '/sound/temp/text-hover-short.wav',
  '/sound/temp/text-hover-1.wav',
  '/sound/temp/text-hover-2.wav',
  '/sound/temp/text-hover-3.wav',
  '/sound/temp/text-hover-4.wav',
  '/sound/temp/text-hover-5.wav',
  '/sound/temp/card-hover.wav',
  '/sound/temp/click-1.wav',
  '/sound/temp/click-2.wav',
  '/sound/temp/click-3.wav',
  '/sound/temp/click-4.wav',
  '/sound/temp/click-5.wav',
  '/sound/temp/menu-close.wav',
  '/sound/temp/menu-hover-close.wav',
  '/sound/temp/menu-hover-1.wav',
  '/sound/temp/menu-open.wav',
  '/sound/temp/mute-hover.wav',
  '/sound/temp/showreel-hover-1.wav',
  '/sound/temp/showreel-hover-2.wav',
  '/sound/temp/showreel-hover-3.wav',
  '/sound/temp/showreel-open-1.wav',
  '/sound/temp/scroll-btn-hover.wav',
  '/sound/temp/btn-hover-down.wav',
  '/sound/temp/btn-hover-simple.wav',
  '/sound/temp/play-hover-simple.wav',
  '/sound/temp/play-hover-menu.wav',
  '/sound/temp/share-hover.wav',
  '/sound/temp/awards-footer-hover-1.wav',
  '/sound/temp/awards-footer-hover-2.wav',
  '/sound/temp/awards-footer-hover-3.wav',
  '/sound/temp/awards-footer-hover-4.wav',
  '/sound/temp/awards-footer-hover-5.wav',
];

const sounds = {};
const isMuted = ref(false);
const isSoundApproved = ref(false);
const lastPlayedIndices = new Map();
const loopTimer = ref(null);
const fadeTimer = ref(null);
const currentLoopSound = ref(null);
const currentLoopId = ref(null);
const currentLoopStartTime = ref(0);

const { addResourceToLoad, resourceLoaded } = useLoader();

export default function () {
  const isMobile = useMediaQuery('(max-width: 768px)');

  function loadSounds() {
    if (isMobile.value) {
      const frogSound = '/sound/temp/frog-new.wav';

      if (sounds[frogSound]) return;

      addResourceToLoad(1);

      const sound = new Howl({
        src: frogSound,
        volume: 1,
        onload: () => {
          resourceLoaded();
        },
        onloaderror: () => {
          resourceLoaded();
        },
      });
      sounds[frogSound] = sound;
    } else {
      const newSounds = fileList.filter((file) => !sounds[file]);

      if (newSounds.length === 0) return;

      addResourceToLoad(newSounds.length);

      newSounds.forEach((file) => {
        const sound = new Howl({
          src: [file],
          volume: 1,
          onload: () => {
            resourceLoaded();
          },
          onloaderror: () => {
            resourceLoaded();
          },
        });
        sounds[file] = sound;
      });
    }
  }

  function playInteractionSound(name = 'text-hover-short', delay = 0) {
    if (isMuted.value) return;

    const isMetamorphosis = name === 'frog-new';
    if (isMobile.value && !isMetamorphosis) return;

    const fullPath = fileList.find((path) => path.includes(name));

    if (!fullPath) {
      console.warn(`Sound not found: ${name}`);
      return;
    }

    const sound = sounds[fullPath];

    if (sound) {
      setTimeout(() => {
        sound.play();
        console.log(`Playing sound: ${name} with delay: ${delay}ms`);
      }, delay);
    }
  }

  function playRandomSound(name = 'text-hover', delay = 0) {
    if (isMuted.value || isMobile.value) return;

    let randomIndexBetweenOneAndFive;

    const lastIndex = lastPlayedIndices.get(name);

    do {
      randomIndexBetweenOneAndFive = Math.floor(Math.random() * 5) + 1;
    } while (randomIndexBetweenOneAndFive === lastIndex);

    lastPlayedIndices.set(name, randomIndexBetweenOneAndFive);

    const sound =
      sounds[
        fileList.find((path) =>
          path.includes(`${name}-${randomIndexBetweenOneAndFive}`)
        )
      ];
    if (!sound) {
      console.warn(`Sound not found: ${name}`);
      return;
    }

    if (sound) {
      setTimeout(() => {
        sound.play();
        console.log(`Playing sound: ${sound} with delay: ${delay}ms`);
      }, delay);
    }
  }

  function playContinuousSound(name) {
    if (isMuted.value || isMobile.value) return;

    const fullPath = fileList.find((path) => path.includes(name));
    if (!fullPath || !sounds[fullPath]) return;

    const sound = sounds[fullPath];
    sound.loop(false);

    currentLoopSound.value = sound;

    const loopDuration = 1250;
    const crossfadeTime = 20;
    const masterFadeIn = 300;
    let isFirstPlay = true;

    const playTick = () => {
      currentLoopStartTime.value = Date.now();
      const id = sound.play();
      currentLoopId.value = id;

      sound.volume(0, id);
      sound.fade(0, 1, isFirstPlay ? masterFadeIn : crossfadeTime, id);
      isFirstPlay = false;

      if (fadeTimer.value) clearTimeout(fadeTimer.value);

      fadeTimer.value = setTimeout(() => {
        if (sound.playing(id)) {
          sound.fade(1, 0, crossfadeTime, id);
        }
      }, loopDuration - crossfadeTime);

      loopTimer.value = setTimeout(playTick, loopDuration);
    };

    playTick();
  }

  function stopContinuousSound() {
    if (loopTimer.value) {
      clearTimeout(loopTimer.value);
      loopTimer.value = null;
    }

    if (fadeTimer.value) {
      clearTimeout(fadeTimer.value);
      fadeTimer.value = null;
    }

    if (currentLoopSound.value && currentLoopId.value !== null) {
      const sound = currentLoopSound.value;
      const id = currentLoopId.value;
      const loopDuration = 1250;

      const now = Date.now();
      const elapsed = now - currentLoopStartTime.value;
      let remaining = loopDuration - elapsed;
      if (remaining < 300) remaining = 300;

      const currentVol =
        typeof sound.volume(id) === 'number' ? sound.volume(id) : 1;

      sound.fade(currentVol, 0, remaining, id);

      currentLoopSound.value = null;
      currentLoopId.value = null;
    }
  }

  return {
    isMuted,
    loadSounds,
    playInteractionSound,
    playRandomSound,
    playContinuousSound,
    stopContinuousSound,
    isSoundApproved,
  };
}
