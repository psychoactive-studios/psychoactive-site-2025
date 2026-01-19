import useLoader from '~/composables/useLoader';
import { Howl } from 'howler';

const fileList = [
  '/sound/temp/home-hover.wav',
  '/sound/temp/ai-hover.wav',
  '/sound/temp/text-hover.wav',
  '/sound/temp/card-hover.wav',
  '/sound/temp/click-1.wav',
  '/sound/temp/menu-close.wav',
  '/sound/temp/menu-hover-close.wav',
  '/sound/temp/menu-hover-1.wav',
  '/sound/temp/menu-open.wav',
  '/sound/temp/mute-hover.wav',
  '/sound/temp/showreel-hover-1.wav',
  '/sound/temp/showreel-hover-2.wav',
  '/sound/temp/showreel-hover-3.wav',
  '/sound/temp/showreel-open-1.wav',
];

const sounds = {};
const isMuted = ref(false);
const isSoundApproved = ref(false);

const { addResourceToLoad, resourceLoaded } = useLoader();

addResourceToLoad(fileList.length);

export default function () {
  function loadSounds() {
    fileList.forEach((file) => {
      if (sounds[file]) return;

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

  function playInteractionSound(name = 'text-hover') {
    if (isMuted.value) return;

    const fullPath = fileList.find((path) => path.includes(name));

    if (!fullPath) {
      console.warn(`Sound not found: ${name}`);
      return;
    }

    const sound = sounds[fullPath];

    if (sound) {
      sound.play();
      console.log(`Playing sound: ${name}`);
    }
  }

  // function playRandomSound() {
  //   if (isMuted.value) return;
  //   const randomIndex = Math.floor(Math.random() * fileList.length);
  //   const sound = sounds[fileList[randomIndex]];

  //   if (sound) {
  //     sound.play();
  //   }
  // }
  return {
    isMuted,
    loadSounds,
    playInteractionSound,
    isSoundApproved,
  };
}
