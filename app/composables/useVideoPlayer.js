// composables/useLoader.js
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { ref } from 'vue';
import useScrollSmoother from '~/composables/useScrollSmoother';

const { enableScroll } = useScrollSmoother();

const currentPreview = ref(null);
const videoPlayerModalRef = ref(null);
const videoElementRef = ref(null);
const PLAYBACK_ID = ref('SI302H5Ba02lRf3VJHai4txfl6IoU48sA4B1zYLofR2fo');
const isOpen = ref(false);
const isPlaying = ref(false);
const isMuted = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const progress = ref(0);

export default function () {
  const onPlayerOpen = async (previewId) => {
    // get the elements
    const playerWrapper = document.querySelector(`#${previewId}`);
    if (!playerWrapper) return;

    const preview = playerWrapper.querySelector('.player__preview');
    const previewVideo = playerWrapper.querySelector('.player__preview_video');
    const previewControlsButton = playerWrapper.querySelector(
      '.player__preview_controls .play-button'
    );

    const previewControlsPlus = gsap.utils.toArray(
      playerWrapper.querySelectorAll('.player__preview_controls .plus')
    );
    const previewControlsTexts = gsap.utils.toArray(
      playerWrapper.querySelectorAll(
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
    const modal = videoPlayerModalRef.value.querySelector('.modal__player');
    const videoPlayer = videoElementRef.value;

    // get the state of the elements before the transition
    const state = Flip.getState(playerWrapper);

    // animate the button and texts out first before the
    gsap
      .timeline({ id: 'open-video-modal-timeline' })
      .add(() => previewVideo.pause())
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
      .to(
        preview,
        {
          scale: 1,
          clipPath: 'inset(0% 0% round 20px)',
          duration: 1,
          ease: 'power3.inOut',
        },
        '<+=0.1'
      )
      .add(async () => {
        // set the full screen to true to trigger the modal to open
        currentPreview.value = previewId;
        await nextTick();
        Flip.from(state, {
          duration: 1,
          ease: 'power3.inOut',
          absolute: true,
        });
      }, '<')
      .add(() => (isOpen.value = true), '<')
      .to(
        previewVideo,
        {
          opacity: 0,
          duration: 0.6,
          ease: 'power3.inOut',
        },
        '<+=0.3'
      )
      .set(modal, { display: 'block' }, '-=0.2')
      .fromTo(
        modal,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'power3.inOut' },
        '<'
      )
      .add(() => {
        isPlaying.value = true;
        videoPlayer.currentTime = 0;
        videoPlayer.play();
      }, '<')
      .fromTo(
        playerButtons,
        { scale: 0 },
        { scale: 1, duration: 0.5, ease: 'power3.Out' },
        '<+=0.35'
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
    // get the elements
    const stateContainer = document.querySelector(
      '.player__container[data-flip-id="' + currentPreview.value + '"]'
    );
    const playerWrapper = document.querySelector(`#${currentPreview.value}`);
    // const preview = playerWrapper.querySelector('.player__preview');
    const previewVideo = playerWrapper.querySelector('.player__preview_video');
    const previewControlsButton = playerWrapper.querySelector(
      '.player__preview_controls .play-button'
    );
    const previewControlsPlus = gsap.utils.toArray(
      playerWrapper.querySelectorAll('.player__preview_controls .plus')
    );
    const previewControlsTexts = gsap.utils.toArray(
      playerWrapper.querySelectorAll(
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
    const videoPlayerBox =
      videoPlayerModalRef.value.querySelector('.modal__player');
    const videoPlayer = videoElementRef.value;

    // get the state of the elements before the transition
    const state = Flip.getState(stateContainer);

    videoPlayer.pause();
    isPlaying.value = false;
    isOpen.value = false;

    gsap
      .timeline({ id: 'close-video-modal-timeline' })
      .set(previewVideo, {
        opacity: 1,
      })
      .to(
        playerButtons,
        { scale: 0, duration: 0.5, ease: 'power3.In' },
        'close'
      )
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
        'close'
      )
      .to(videoPlayerBox, { opacity: 0, duration: 0.5 }, 'close')
      .to(
        previewVideo,
        {
          opacity: 1,
          duration: 0.6,
          ease: 'power3.inOut',
        },
        'close+=0.2'
      )
      .add(() => {
        // set the full screen to true to trigger the modal to open
        Flip.to(state, {
          targets: playerWrapper,
          duration: 0.7,
          ease: 'power3.Out',
          absolute: true,
          onComplete: () => {
            currentPreview.value = null;
            gsap.set(playerWrapper, { clearProps: 'all' });
          },
        });
        previewVideo.play();
      }, 'close+=0.1')
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
      .set(videoPlayerBox, { display: 'none' }, '<')
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

    videoElement.addEventListener('click', playHandler);
    // videoElement.addEventListener('pause', playHandler);

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
    videoElementRef,
    currentPreview,
    PLAYBACK_ID,
    isOpen,
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
