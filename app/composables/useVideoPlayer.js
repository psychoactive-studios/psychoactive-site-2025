// composables/useLoader.js
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { ref } from 'vue';
import useScrollSmoother from '~/composables/useScrollSmoother';

const { enableScroll } = useScrollSmoother();

const isFullScreen = ref(false);
const currentPreview = ref(null);
const videoPlayerModalRef = ref(null);
const isPlaying = ref(false);
const isMuted = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const progress = ref(0);

const flipAnimation = (state) => {
  Flip.from(state, {
    duration: 0.9,
    ease: 'power2.inOut',
    fade: true,
    scale: true,
    absolute: true,
  });
};

export default function () {
  const onPlayerOpen = async (previewElement) => {
    const previewControlsButton = previewElement.querySelector(
      '.player__preview_controls .play-button'
    );
    const previewControlsPlus = gsap.utils.toArray(
      previewElement.querySelectorAll('.player__preview_controls .plus')
    );
    const previewControlsTexts = gsap.utils.toArray(
      previewElement.querySelectorAll(
        '.player__preview_controls .play-reel-text .char-center, .player__preview_controls .play-time-text .char-center'
      )
    );
    const playerButtons = gsap.utils.toArray(
      videoPlayerModalRef.value.querySelectorAll(
        '.player__controls .control-button, .player__controls .sound-button, .button-close'
      )
    );
    const playerTimerText = gsap.utils.toArray(
      videoPlayerModalRef.value.querySelectorAll(
        '.player__controls .play-time-text .char-center'
      )
    );
    const videoPlayer = videoPlayerModalRef.value.querySelector(
      '.player__main_video'
    );

    currentPreview.value = previewElement;
    // get the state of the elements before the transition
    const state = Flip.getState(
      gsap.utils.toArray([currentPreview.value, '#video-player-modal'])
    );

    // wait for the DOM to update

    // animate the button and texts out first before the
    gsap
      .timeline()
      .to(previewControlsButton, {
        scale: 0,
        duration: 0.5,
        ease: 'power3.inOut',
      })
      .to(
        previewControlsPlus,
        { autoAlpha: 0, duration: 0.5, ease: 'power3.inOut' },
        '<+=0.2'
      )
      .to(
        previewControlsTexts,
        {
          opacity: 0,
          duration: 0.01,
          stagger: {
            amount: 0.25,
            from: 'random',
          },
          ease: 'power3.inOut',
        },
        '<'
      )
      // animate the transition using Flip
      .add(async () => {
        // set the full screen to true to trigger the modal to open
        isFullScreen.value = true;
        await nextTick();
        flipAnimation(state);
      }, '<')
      .fromTo(videoPlayer, { opacity: 0 }, { opacity: 1, duration: 0.5 }, '<')
      .add(() => {
        isPlaying.value = true;
        videoPlayer.currentTime = 0;
        videoPlayer.play();
      }, '<')
      .fromTo(
        playerButtons,
        { scale: 0 },
        { scale: 1, duration: 0.5, ease: 'power3.Out' },
        '<+=0.65'
      )
      .to(
        playerTimerText,
        {
          duration: 1.5,
          scrambleText: {
            text: '{original}',
            chars: '0123456789!@#$%^&*()-_=+[]{};:<>/?,.',
            tweenLength: false,
          },
        },
        '<'
      )
      .fromTo(
        playerTimerText,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.01,
          stagger: {
            amount: 0.5,
            from: 'random',
          },
        },
        '<'
      );
  };

  const onPlayerClose = async () => {
    // get the state of the elements before the transition
    const state = Flip.getState(
      gsap.utils.toArray([currentPreview.value, '#video-player-modal'])
    );

    const previewControlsButton = currentPreview.value.querySelector(
      '.player__preview_controls .play-button'
    );

    const previewControlsPlus = gsap.utils.toArray(
      currentPreview.value.querySelectorAll('.player__preview_controls .plus')
    );

    const previewControlsTexts = gsap.utils.toArray(
      currentPreview.value.querySelectorAll(
        '.player__preview_controls .play-reel-text .char-center, .player__preview_controls .play-time-text .char-center'
      )
    );

    const playerButtons = gsap.utils.toArray(
      videoPlayerModalRef.value.querySelectorAll(
        '.player__controls .control-button, .player__controls .sound-button, .button-close'
      )
    );

    const playerTimerText = gsap.utils.toArray(
      videoPlayerModalRef.value.querySelectorAll(
        '.player__controls .play-time-text .char-center'
      )
    );

    const videoPlayer = videoPlayerModalRef.value.querySelector(
      '.player__main_video'
    );

    videoPlayer.pause();
    isPlaying.value = false;

    console.log(
      'preview',
      currentPreview.value.querySelectorAll('.player__preview_controls')
    );

    gsap
      .timeline()
      .to(playerButtons, { scale: 0, duration: 0.5, ease: 'power3.In' })
      .to(
        playerTimerText,
        {
          opacity: 0,
          duration: 0.01,
          stagger: {
            amount: 0.5,
            from: 'random',
          },
        },
        '<'
      )
      .to(videoPlayer, { opacity: 0, duration: 0.5 }, '<')
      .add(async () => {
        // set the full screen to true to trigger the modal to open
        isFullScreen.value = false;
        await nextTick();
        flipAnimation(state);
      }, '<+=0.25')
      .to(
        previewControlsPlus,
        { autoAlpha: 1, duration: 0.5, ease: 'power3.inOut' },
        '<+=0.2'
      )
      .to(
        previewControlsTexts,
        {
          duration: 2.3,
          scrambleText: {
            text: '{original}',
            chars: 'uppercase',
            tweenLength: false,
          },
        },
        '<'
      )
      .to(
        previewControlsTexts,
        {
          opacity: 1,
          duration: 0.01,
          stagger: {
            amount: 0.9,
            from: 'random',
          },
        },
        '<'
      )
      .to(
        previewControlsButton,
        {
          scale: 1,
          duration: 0.5,
          ease: 'power3.inOut',
        },
        '<+=0.25'
      )
      .add(() => enableScroll(), '<');
  };

  const playHandler = () => {
    isPlaying.value = !isPlaying.value;
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return {
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(remainingSeconds).padStart(2, '0'),
    };
  };

  const updateVideoTime = (videoElement) => {
    currentTime.value = videoElement.currentTime;
    duration.value = videoElement.duration || 0;
    progress.value =
      duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0;
  };

  const setupVideoListeners = (videoElement) => {
    if (!videoElement) return;

    videoElement.addEventListener('timeupdate', () =>
      updateVideoTime(videoElement)
    );
    videoElement.addEventListener('loadedmetadata', () =>
      updateVideoTime(videoElement)
    );
    videoElement.addEventListener('durationchange', () =>
      updateVideoTime(videoElement)
    );
  };

  return {
    videoPlayerModalRef,
    isFullScreen,
    isPlaying,
    isMuted,
    currentTime,
    duration,
    progress,
    onPlayerOpen,
    onPlayerClose,
    playHandler,
    formatTime,
    setupVideoListeners,
  };
}
