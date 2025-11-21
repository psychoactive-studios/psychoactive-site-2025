import useLoader from '~/composables/useLoader';
import { Howl } from 'howler';

const fileList = [
  // '/sound/deep-futuristic1.mp3',
  // '/sound/deep-futuristic2.mp3',
  // '/sound/deep-futuristic3.mp3',
  // '/sound/deep-futuristic4.mp3',
  // '/sound/deep-futuristic5.mp3',
  // '/sound/deep-futuristic6.mp3',
  // '/sound/deep-futuristic7.mp3',
  // '/sound/deep-futuristic8.mp3',
  // '/sound/Super-Low-Hummm1.mp3',
  // '/sound/Super-Low-Hummm2.mp3',
  // '/sound/Super-Low-Hummm3.mp3',
  // '/sound/Super-Low-Hummm4.mp3',
  // '/sound/Super-Low-Hummm5.mp3',
  // '/sound/Super-Low-Hummm6.mp3',
  // '/sound/Super-Low-Hummm7.mp3',
  // '/sound/Super-Low-Hummm8.mp3',
  '/sound/Medium-Hum1.mp3',
  '/sound/Medium-Hum2.mp3',
  '/sound/Medium-Hum3.mp3',
  '/sound/Medium-Hum4.mp3',
  '/sound/Medium-Hum5.mp3',
  '/sound/Medium-Hum6.mp3',
  '/sound/Medium-Hum7.mp3',
  '/sound/Medium-Hum8.mp3',
];
const sounds = {};
const isMuted = ref(false);

const { addResourceToLoad, resourceLoaded } = useLoader();

addResourceToLoad(fileList.length);

export default function () {
  function loadSounds() {
    fileList.forEach((file) => {
      if (sounds[file]) return;

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

  function playInteractionSound() {
    if (isMuted.value) return;
    const randomIndex = Math.floor(Math.random() * fileList.length);
    const sound = sounds[fileList[randomIndex]];

    if (sound) {
      sound.play();
    }
  }
  return {
    isMuted,
    loadSounds,
    playInteractionSound,
  };
}
