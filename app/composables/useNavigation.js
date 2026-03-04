// composables/useNavigation.js
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ref } from 'vue';
import useScrollSmoother from '~/composables/useScrollSmoother';
import useHeader from '~/composables/useHeader';

const { enableScroll, disableScroll } = useScrollSmoother();

// Reactive state to track if the navigation is open
const isOpen = ref(false);
const savedColorMode = ref(null); // To track the history of color modes for proper restoration

// Ref to the navigation DOM element
const navigationRef = ref(null);
const navigationMobileRef = ref(null);
const backButtonRef = ref(null);
const backButtonHref = ref(null);

// Reactive state to track if the transition is from navigation
const transitionFromNavigation = ref(false);
const showLayoutElementsRequired = ref(false);

// GSAP timelines for animations
let openTimelineMain, openTimelineItems, closeTimeline;

// DOM elements for animation
let navBackground,
  navWrapper,
  navVideo,
  navVideoPlayer,
  // navVideoPoster,
  navItems,
  navPlayerText,
  navLines,
  letsBlock,
  letsButton,
  letsLines;

// Store SplitText instances for cleanup
let splitTextInstances = [];

export default function () {
  /**
   * Cleans up all animations and GSAP instances to prevent memory leaks
   */
  function cleanupNavigation() {
    // Kill all timelines
    if (openTimelineMain) {
      openTimelineMain.kill();
      openTimelineMain = null;
    }
    if (openTimelineItems) {
      openTimelineItems.kill();
      openTimelineItems = null;
    }
    if (closeTimeline) {
      closeTimeline.kill();
      closeTimeline = null;
    }

    // Revert all SplitText instances
    splitTextInstances.forEach((instance) => {
      if (instance && instance.revert) {
        instance.revert();
      }
    });
    splitTextInstances = [];

    savedColorMode.value = null; // Clear saved color mode
  }

  function initNavigation() {
    // Clean up existing animations before reinitializing
    cleanupNavigation();

    const { mode } = useHeader();

    const splitTextInstance = SplitText.create(
      '#main-navigation .navigation__item a',
      {
        type: 'chars',
        charsClass: 'char-center',
      }
    );
    splitTextInstances.push(splitTextInstance);
    SplitText.create('#main-navigation .navigation__item a', {
      type: 'chars',
      charsClass: 'char-center',
    });

    // Select DOM elements for animations
    navBackground = navigationRef?.value?.querySelector(
      '.navigation__background'
    );

    navWrapper = navigationRef?.value?.querySelector('.navigation__wrapper');

    navVideo = navigationRef?.value?.querySelector(
      '.video-player .player__preview'
    );

    navVideoPlayer = navigationRef?.value?.querySelector(
      '.video-player .player__preview video'
    );

    // navVideoPoster = navigationRef?.value?.querySelector(
    //   '.video-player .player__preview_image'
    // );

    navItems = gsap.utils.toArray(
      navigationRef?.value?.querySelectorAll('.navigation__item')
    );

    navPlayerText = gsap.utils.toArray(
      navigationRef?.value?.querySelectorAll(
        '.video-player .player__preview_controls .char-center'
      )
    );

    navLines = gsap.utils.toArray(
      navigationRef?.value?.querySelectorAll(
        '.navigation__list .navigation__item .line'
      )
    );

    letsButton = navigationRef?.value?.querySelector(
      '.navigation__talk_button'
    );

    letsBlock = gsap.utils.toArray(
      navigationRef?.value?.querySelectorAll('.navigation__talk')
    );

    letsLines = gsap.utils.toArray(
      navigationRef?.value?.querySelectorAll('.navigation__talk_line > span')
    );

    // Create a timeline for staggered animations of navigation items
    openTimelineItems = gsap.timeline({
      delay: 0.3,
      paused: true,
    });
    const itemsTweens = [];

    // Animate each navigation item with staggered opacity
    navItems.forEach((item) => {
      const chars = item.querySelectorAll('.char-center');
      const tween = gsap.fromTo(
        chars,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.01,
          stagger: {
            amount: 0.22,
            from: 'random',
          },
        }
      );
      itemsTweens.push(tween);
    });

    // Add tweens to the timeline
    itemsTweens.forEach((tween) => openTimelineItems.add(tween, '<+=0.15'));

    // Main timeline for opening animations
    openTimelineMain = gsap
      .timeline({ id: 'open-timeline-main', paused: true })
      // .set(navVideoPlayer, { display: 'none' })
      .set([navItems, letsBlock], { clearProps: 'all' })
      .to(
        navBackground,
        {
          scaleY: 1,
          duration: 1,
          ease: 'expo.inOut',
        },
        'step1'
      )
      .to(
        navWrapper,
        {
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          duration: 1,
          ease: 'expo.inOut',
        },
        'step1'
      )
      .fromTo(
        navVideo,
        { clipPath: 'inset(50% 0% round 20px)' },
        {
          clipPath: 'inset(0% 0% round 20px)',
          duration: 1,
          ease: 'power4.inOut',
        },
        'step1+=0.1'
      )
      .fromTo(
        navLines,
        { width: '0%' },
        { width: '100%', duration: 1.5, ease: 'power2.inOut', stagger: 0.07 },
        'step1'
      )
      .add(() => {
        if (mode.value === 'light') mode.value = 'dark'; // Set mode to 'dark' when navigation opens
      }, 'step1+=0.2')
      .fromTo(
        navPlayerText,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.01,
          stagger: {
            amount: 0.3,
            from: 'random',
          },
        },
        'step1+=0.6'
      )
      .fromTo(
        letsButton,
        { scale: 0 },
        { scale: 1, duration: 0.5, ease: 'power2.in' },
        'step1+=0.25'
      )
      .fromTo(
        letsButton,
        { clipPath: 'inset(0% 35% round 64px)' },
        {
          clipPath: 'inset(0% 0% round 64px)',
          duration: 1,
          ease: 'power2.out',
        },
        '>'
      )
      .fromTo(
        letsLines,
        { width: '0%' },
        { width: '100%', duration: 1, ease: 'power3.inOut' },
        '<'
      )
      .to(
        letsButton,
        {
          duration: 1,
          ease: 'none',
          scrambleText: {
            text: '{original}',
            chars: '0123456789!@#$%^&*()-_=+[]{};:<>/?,.',
            tweenLength: false,
          },
        },
        '<'
      )
      // .set(navVideoPlayer, { visibility: 'visible' })
      // .set(navVideoPoster, { visibility: 'hidden' })
      .add(() => navVideoPlayer.play());

    closeTimeline = gsap
      .timeline({ id: 'close-timeline', paused: true })
      .add(() => navVideoPlayer.pause())
      .to(
        letsBlock,
        {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out',
        },
        'init'
      )
      .to(
        navItems,
        {
          opacity: 0,
          duration: 0.2,
          ease: 'power2.out',
          stagger: {
            amount: 0.2,
            from: 'end',
          },
        },
        'init+=0.1'
      )
      .fromTo(
        navVideo,
        { clipPath: 'inset(0% 0% round 20px)' },
        {
          clipPath: 'inset(50% 0% round 20px)',
          duration: 1,
          ease: 'power4.inOut',
        },
        'init'
      )
      .to(
        navBackground,
        {
          duration: 1,
          ease: 'expo.inOut',
          scaleY: 0,
        },
        'init'
      )
      .to(
        navWrapper,
        {
          clipPath: 'polygon(0 0, 100% 0, 100% 0%, 0 0%)',
          duration: 1,
          ease: 'expo.inOut',
        },
        'init'
      )
      .add(() => {
        // Enable scrolling
        if (!transitionFromNavigation.value) enableScroll();
        isOpen.value = false;
      }, 'init+=0.2')
      .add(() => {
        if (savedColorMode.value) mode.value = savedColorMode.value; // Restore the previous color mode
      }, 'init+=0.6')
      .add(() => {
        // Clean up and reinitialize navigation to prevent memory leaks
        initNavigation();
      });
  }

  /**
   * Opens the navigation menu with GSAP animations.
   * Animates various elements like video preview, lines, and text.
   */
  function openNavigation() {
    // Prevent multiple clicks during animation
    const isAnimating = gsap.getById('close-timeline')?.isActive();
    if (isAnimating) return;

    const { mode } = useHeader();

    // Disable page scrolling when navigation is open
    disableScroll();
    // Set navigation state to open
    isOpen.value = true;
    savedColorMode.value = mode.value; // Save the current color mode

    openTimelineMain.restart();
    openTimelineItems.restart();
  }

  /**
   * Closes the navigation menu with GSAP animations.
   * Resets the navigation state after the animation completes.
   */
  function closeNavigation() {
    // Prevent multiple clicks during animation
    const isAnimating = gsap.getById('open-timeline-main')?.isActive();
    if (isAnimating) return;

    closeTimeline.restart();
  }

  // Return the reactive state and methods
  return {
    isOpen,
    navigationRef,
    navigationMobileRef,
    backButtonRef,
    backButtonHref,
    initNavigation,
    openNavigation,
    closeNavigation,
    transitionFromNavigation,
    showLayoutElementsRequired,
  };
}
