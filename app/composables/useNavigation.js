// composables/useNavigation.js
import gsap from 'gsap';
import { ref } from 'vue';
import useScrollSmoother from '~/composables/useScrollSmoother';

const { enableScroll, disableScroll } = useScrollSmoother();

// Reactive state to track if the navigation is open
const isOpen = ref(false);

// Ref to the navigation DOM element
const navigationRef = ref(null);

export default function () {
  /**
   * Opens the navigation menu with GSAP animations.
   * Animates various elements like video preview, lines, and text.
   */
  function openNavigation() {
    // Disable page scrolling when navigation is open
    disableScroll();

    // Select DOM elements for animations
    const navVideo = navigationRef?.value?.querySelector('.navigation__video');

    const navItems = gsap.utils.toArray(
      navigationRef?.value?.querySelectorAll('.navigation__item')
    );

    const navPlayerText = gsap.utils.toArray(
      navigationRef?.value?.querySelectorAll(
        '.video-player .player__preview_controls .char-center'
      )
    );

    const navLines = gsap.utils.toArray(
      navigationRef?.value?.querySelectorAll(
        '.navigation__list .navigation__item .line'
      )
    );

    const letsButton = navigationRef?.value?.querySelector(
      '.navigation__talk_button'
    );

    const navLetsText = gsap.utils.toArray(
      navigationRef?.value?.querySelectorAll(
        '.navigation__talk_button .char-center'
      )
    );

    const letsLines = gsap.utils.toArray(
      navigationRef?.value?.querySelectorAll('.navigation__talk_line > span')
    );

    // Set navigation state to open
    isOpen.value = true;

    // Create a timeline for staggered animations of navigation items
    const itemsTl = gsap.timeline({
      delay: 0.3,
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
    itemsTweens.forEach((tween) => itemsTl.add(tween, '<+=0.15'));

    // Main timeline for opening animations
    gsap
      .timeline()
      .set(navVideo, { transformOrigin: 'top' })
      .to(
        navigationRef.value,
        {
          duration: 1,
          ease: 'expo.inOut',
          '--scY': 1,
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
      // .fromTo(
      //   navPlayerText,
      //   { opacity: 0 },
      //   {
      //     opacity: 1,
      //     duration: 0.01,
      //     stagger: {
      //       amount: 0.3,
      //       from: 'random',
      //     },
      //   },
      //   'step1+=2'
      // )
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
      .fromTo(
        navLetsText,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.01,
          stagger: {
            amount: 0.22,
            from: 'random',
          },
        },
        '<+=0.2'
      );
  }

  /**
   * Closes the navigation menu with GSAP animations.
   * Resets the navigation state after the animation completes.
   */
  function closeNavigation() {
    gsap
      .timeline()
      .to(navigationRef.value, {
        duration: 1,
        ease: 'expo.inOut',
        '--scY': 0,
      })
      .add(() => {
        // Enable scrolling
        enableScroll();
        isOpen.value = false;
      }, '<+=0.2');
  }

  // Return the reactive state and methods
  return {
    isOpen,
    navigationRef,
    openNavigation,
    closeNavigation,
  };
}
