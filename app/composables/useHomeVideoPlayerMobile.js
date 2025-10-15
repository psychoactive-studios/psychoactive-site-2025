import { ref } from 'vue';
import gsap from 'gsap';
import useNavigation from '~/composables/useNavigation';

const container = ref(null);
const mainVideo = ref(null);

let currentNavigation = null;
let currentNavigationLogo = null;
let currentNavigationText = null;
let currentNavigationButton = null;
let currentNavigationButtonIcon = null;
let button = null;
let controls = null;
let controlsTexts = null;
let videoPreview = null;
let videoPreviewOverlay = null;
let playTimeline = null;
let closeTimeline = null;
let playPauseTimeline = null;

export default function useHomeVideoPlayerMobile() {
  const { navigationMobileRef } = useNavigation();

  const initializeElements = (containerRef) => {
    container.value = containerRef;

    if (!container.value) return;

    // Initialize DOM elements
    currentNavigation = '.hero-mobile__navigation';
    currentNavigationLogo = '.hero-mobile__navigation img';
    currentNavigationText = '.hero-mobile__navigation .text';
    currentNavigationButton = '.hero-mobile__navigation_button';
    currentNavigationButtonIcon = '.hero-mobile__navigation_button .icon';

    button = container.value.querySelector(
      '.hero-mobile__player_controls .controls-button'
    );
    controls = container.value.querySelectorAll(
      '.hero-mobile__player_controls'
    );
    controlsTexts = container.value.querySelectorAll(
      '.hero-mobile__player_controls .controls-text .char-control'
    );
    videoPreview = container.value.querySelector(
      '.hero-mobile__player_preview'
    );
    videoPreviewOverlay = container.value.querySelector(
      '.hero-mobile__player_overlay'
    );
  };

  const clickVideoPlayHandler = () => {
    // Prevent re-triggering while animation is running
    if (playTimeline?.isActive() || closeTimeline?.isActive()) {
      return;
    }

    playTimeline = gsap
      .timeline()
      .set(navigationMobileRef.value, { display: 'none' })
      .set(currentNavigation, { display: 'flex' })
      .to(gsap.utils.toArray([currentNavigationLogo, currentNavigationText]), {
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
      })
      .to(
        currentNavigationButton,
        {
          width: 42,
          borderRadius: 21,
          duration: 0.8,
          ease: 'power4.inOut',
        },
        '<'
      )
      .to(
        currentNavigationButtonIcon,
        { rotate: 45, duration: 0.8, ease: 'power4.inOut' },
        '<'
      )
      .to(
        button,
        {
          scale: 0,
          duration: 0.5,
          ease: 'power4.inOut',
        },
        '<'
      )
      .to(
        controlsTexts,
        {
          opacity: 0,
          duration: 0.01,
          stagger: {
            amount: 0.25,
            from: 'random',
          },
          ease: 'power3.inOut',
        },
        '<+=0.1'
      )
      .to(
        gsap.utils.toArray([videoPreview, videoPreviewOverlay]),
        {
          opacity: 0,
          duration: 1,
          ease: 'power3.inOut',
        },
        '<+=0.2'
      )
      .to(
        mainVideo.value,
        {
          opacity: 1,
          duration: 1,
          ease: 'power3.inOut',
          onStart: () => {
            mainVideo.value.currentTime = 0;
            mainVideo.value.play();
            gsap.set(controls, { pointerEvents: 'none' });
            gsap.set(mainVideo.value, { pointerEvents: 'all' });
          },
        },
        '<+=0.5'
      );
  };

  const clickVideoCloseHandler = () => {
    // Prevent re-triggering while animation is running
    if (playTimeline?.isActive() || closeTimeline?.isActive()) {
      return;
    }

    closeTimeline = gsap
      .timeline()
      .set(mainVideo.value, { pointerEvents: 'none' })
      .to(
        currentNavigationButton,
        {
          width: '100%',
          borderRadius: 16,
          duration: 0.8,
          ease: 'power4.inOut',
        },
        'start'
      )
      .to(
        currentNavigationButtonIcon,
        { rotate: 0, duration: 0.8, ease: 'power4.inOut' },
        'start'
      )
      .to(
        gsap.utils.toArray([currentNavigationLogo, currentNavigationText]),
        {
          opacity: 1,
          duration: 0.5,
          stagger: {
            each: 0.1,
            from: 'end',
          },
        },
        'start+=0.5'
      )
      .set(navigationMobileRef.value, { display: 'block' })
      .set(currentNavigation, { display: 'none' })
      .to(
        mainVideo.value,
        {
          opacity: 0,
          duration: 1,
          ease: 'power3.inOut',
        },
        'start'
      )
      .to(
        gsap.utils.toArray([videoPreview, videoPreviewOverlay]),
        {
          opacity: 1,
          duration: 1,
          ease: 'power3.inOut',
        },
        'start+=0.2'
      )
      .to(button, { scale: 1, duration: 0.5 }, 'start+=0.7')
      .to(
        controlsTexts,
        {
          duration: 2.3,
          scrambleText: {
            text: '{original}',
            chars: 'uppercase',
            tweenLength: false,
          },
        },
        'start+=0.4'
      )
      .fromTo(
        controlsTexts,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.01,
          stagger: {
            amount: 0.9,
            from: 'random',
          },
        },
        'start+=0.4'
      )
      .add(() => {
        gsap.set(controls, { pointerEvents: 'all' });
      });
  };

  const videoPlayPauseHandler = () => {
    // Prevent re-triggering while animation is running
    if (playPauseTimeline?.isActive()) {
      return;
    }

    playPauseTimeline = gsap.to(button, {
      scale: mainVideo.value.paused ? 0 : 1,
      duration: 0.5,
      ease: 'power4.inOut',
    });

    if (mainVideo.value.paused) {
      mainVideo.value.play();
    } else {
      mainVideo.value.pause();
    }
  };

  return {
    container,
    mainVideo,
    initializeElements,
    clickVideoPlayHandler,
    clickVideoCloseHandler,
    videoPlayPauseHandler,
  };
}
