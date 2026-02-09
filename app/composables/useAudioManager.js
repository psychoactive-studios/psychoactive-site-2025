import useLoader from '~/composables/useLoader';
import { useMediaQuery } from '@vueuse/core';
import { Howl } from 'howler';
import { ref } from 'vue';

const fileList = [
  '/sound/warp-hover.mp3',
  '/sound/logo-hover.wav',
  '/sound/frog-new.mp3',
  '/sound/slider-2.mp3',
  '/sound/slider-3.mp3',
  '/sound/contact-load.mp3',
  '/sound/content-load.mp3',
  '/sound/work-load.mp3',
  '/sound/about-load.mp3',
  '/sound/webflow-load.mp3',
  '/sound/home-load.mp3',
  '/sound/services-load.mp3',
  '/sound/sound-btn-hover-1.mp3',
  '/sound/accordion-open.mp3',
  '/sound/accordion-close.mp3',
  '/sound/talk-btn-hover.mp3',
  '/sound/ai-hover.mp3',
  '/sound/text-hover-short.mp3',
  '/sound/text-hover-1.mp3',
  '/sound/text-hover-2.mp3',
  '/sound/text-hover-3.mp3',
  '/sound/text-hover-4.mp3',
  '/sound/text-hover-5.mp3',
  '/sound/card-hover.mp3',
  '/sound/click-1.mp3',
  '/sound/click-2.mp3',
  '/sound/click-3.mp3',
  '/sound/click-4.mp3',
  '/sound/click-5.mp3',
  '/sound/menu-close.mp3',
  '/sound/menu-hover-close.mp3',
  '/sound/menu-hover-1.mp3',
  '/sound/menu-open.mp3',
  '/sound/mute-hover.mp3',
  '/sound/showreel-hover-1.mp3',
  '/sound/showreel-hover-2.mp3',
  '/sound/showreel-hover-3.mp3',
  '/sound/showreel-open-1.mp3',
  '/sound/scroll-btn-hover.mp3',
  '/sound/btn-hover-down.mp3',
  '/sound/btn-hover-simple.mp3',
  '/sound/play-hover-simple.mp3',
  '/sound/play-hover-menu.mp3',
  '/sound/share-hover.mp3',
  '/sound/awards-footer-hover-1.mp3',
  '/sound/awards-footer-hover-2.mp3',
  '/sound/awards-footer-hover-3.mp3',
  '/sound/awards-footer-hover-4.mp3',
  '/sound/awards-footer-hover-5.mp3',
];

const sounds = {};
const isMuted = ref(false);
const isSoundApproved = ref(false);
const hasInteracted = ref(false);
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
      const frogSound = '/sound/frog-new.wav';

      if (sounds[frogSound]) return;

      addResourceToLoad(1);

      const sound = new Howl({
        src: frogSound,
        volume: 0.5,
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
          volume: 0.5,
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
      if (delay === 0) {
        sound.play();
        console.log(`Playing sound (sync): ${name}`);
      } else {
        setTimeout(() => {
          sound.play();
          console.log(`Playing sound (async): ${name} with delay: ${delay}ms`);
        }, delay);
      }
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
    const isLogoSound = name === 'logo-hover';

    const loopDuration = isLogoSound ? 1250 : sound.duration() * 1000;
    const crossfadeTime = 20;
    const masterFadeIn = 300;
    let isFirstPlay = true;

    const playTick = () => {
      currentLoopStartTime.value = Date.now();
      const id = sound.play();
      currentLoopId.value = id;

      sound.volume(0, id);
      sound.fade(0, 0.5, isFirstPlay ? masterFadeIn : crossfadeTime, id);
      isFirstPlay = false;

      if (fadeTimer.value) clearTimeout(fadeTimer.value);

      fadeTimer.value = setTimeout(() => {
        if (sound.playing(id)) {
          sound.fade(0.5, 0, crossfadeTime, id);
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
  function setSoundVolume(name, volume) {
    const fullPath = fileList.find((path) => path.includes(name));

    if (!fullPath || !sounds[fullPath]) {
      console.warn(
        `Cannot set volume: Sound '${name}' not found or not loaded.`
      );
      return;
    }

    sounds[fullPath].volume(volume);
  }

  return {
    isMuted,
    loadSounds,
    playInteractionSound,
    playRandomSound,
    setSoundVolume,
    playContinuousSound,
    stopContinuousSound,
    isSoundApproved,
    hasInteracted,
  };
}
