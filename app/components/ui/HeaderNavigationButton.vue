<script setup>
import gsap from 'gsap';
import useNavigation from '~/composables/useNavigation';
import useVideoPlayer from '~/composables/useVideoPlayer';
import useAudioManager from '~/composables/useAudioManager';
import { useMediaQuery } from '@vueuse/core';

const buttonRef = ref(null);
const { isOpen: isNavOpen, openNavigation, closeNavigation } = useNavigation();
const { isOpen: isVideoOpen, onPlayerClose } = useVideoPlayer();
const { playInteractionSound } = useAudioManager();

const isMobile = useMediaQuery('(max-width: 768px)');
const isTouchDevice = useMediaQuery('(pointer: coarse)');

let ctx;
let hoverTimelineIn, hoverTimelineOut;
let hoverTimelineCloseIn, hoverTimelineCloseOut;
let transitionTimelineIn, transitionTimelineOut;
let transitionFromVideoTimelineIn;

const createTimelines = () => {
  ctx = gsap.context(() => {
    const dots = buttonRef.value.querySelectorAll('.dot');
    const dot1 = buttonRef.value.querySelector('.dot-1');
    const dot2 = buttonRef.value.querySelector('.dot-2');
    const dot3 = buttonRef.value.querySelector('.dot-3');
    const dot4 = buttonRef.value.querySelector('.dot-4');
    const lines = buttonRef.value.querySelectorAll('.line');
    hoverTimelineIn = gsap
      .timeline({ paused: true })
      .to(dots, {
        opacity: 0,
        duration: 0.001,
        stagger: {
          amount: 0.15,
          from: 'random',
        },
        overwrite: 'auto',
      })
      .set(dot1, {
        x: isMobile.value ? 3.5 : 5,
        y: isMobile.value ? 3.5 : 5,
      })
      .set(dot2, {
        x: isMobile.value ? -3.5 : -5,
        y: isMobile.value ? 3.5 : 5,
      })
      .set(dot3, {
        x: isMobile.value ? 3.5 : 5,
        y: isMobile.value ? -3.5 : -5,
      })
      .set(dot4, {
        x: isMobile.value ? -3.5 : -5,
        y: isMobile.value ? -3.5 : -5,
      })
      .to(dots, { opacity: 1, duration: 0.001 }, '+=0.1');

    hoverTimelineOut = gsap
      .timeline({ paused: true })
      .to(dots, { opacity: 0, duration: 0.001 }, '+=0.1')
      .set(dot1, { x: 0, y: 0 })
      .set(dot2, { x: 0, y: 0 })
      .set(dot3, { x: 0, y: 0 })
      .set(dot4, { x: 0, y: 0 })
      .to(
        dots,
        {
          opacity: 1,
          duration: 0.001,
          stagger: {
            amount: 0.15,
            from: 'random',
          },
          overwrite: 'auto',
        },
        '+=0.1'
      );

    hoverTimelineCloseIn = gsap
      .timeline({ paused: true })
      .to(dot1, { x: -2, y: -2, duration: 0.3, ease: 'power2.inOut' }, 'init')
      .to(dot2, { x: 2, y: -2, duration: 0.3, ease: 'power2.inOut' }, 'init')
      .to(dot3, { x: -2, y: 2, duration: 0.3, ease: 'power2.inOut' }, 'init')
      .to(dot4, { x: 2, y: 2, duration: 0.3, ease: 'power2.inOut' }, 'init')
      .fromTo(
        lines,
        { scaleX: 1 },
        { scaleX: 1.4, duration: 0.3, ease: 'power2.inOut' },
        'init'
      );

    hoverTimelineCloseOut = gsap
      .timeline({ paused: true })
      .to(dot1, { x: 0, y: 0, duration: 0.3, ease: 'power2.inOut' }, 'init')
      .to(dot2, { x: 0, y: 0, duration: 0.3, ease: 'power2.inOut' }, 'init')
      .to(dot3, { x: 0, y: 0, duration: 0.3, ease: 'power2.inOut' }, 'init')
      .to(dot4, { x: 0, y: 0, duration: 0.3, ease: 'power2.inOut' }, 'init')
      .to(lines, { scaleX: 1, duration: 0.3, ease: 'power2.inOut' }, 'init');

    transitionTimelineIn = gsap
      .timeline({ paused: true })
      .to(dot1, { x: -2, y: -2, duration: 0.3, ease: 'power2.inOut' }, 'init')
      .to(dot2, { x: 2, y: -2, duration: 0.3, ease: 'power2.inOut' }, 'init')
      .to(dot3, { x: -2, y: 2, duration: 0.3, ease: 'power2.inOut' }, 'init')
      .to(dot4, { x: 2, y: 2, duration: 0.3, ease: 'power2.inOut' }, 'init')
      .to(lines, { scaleX: 1.4, duration: 0.3, ease: 'power2.inOut' }, 'init');

    transitionTimelineOut = gsap
      .timeline({ paused: true })
      .to(
        dot1,
        {
          x: isMobile ? 0 : 5,
          y: isMobile ? 0 : 5,
          duration: 0.3,
          ease: 'power2.inOut',
        },
        'init'
      )
      .to(
        dot2,
        {
          x: isMobile ? 0 : -5,
          y: isMobile ? 0 : 5,
          duration: 0.3,
          ease: 'power2.inOut',
        },
        'init'
      )
      .to(
        dot3,
        {
          x: isMobile ? 0 : 5,
          y: isMobile ? 0 : -5,
          duration: 0.3,
          ease: 'power2.inOut',
        },
        'init'
      )
      .to(
        dot4,
        {
          x: isMobile ? 0 : -5,
          y: isMobile ? 0 : -5,
          duration: 0.3,
          ease: 'power2.inOut',
        },
        'init'
      )
      .to(lines, { scaleX: 0, duration: 0.3, ease: 'power2.inOut' }, 'init');

    transitionFromVideoTimelineIn = gsap
      .timeline({ paused: true })
      .to(lines, { scaleX: 1.4, duration: 0.3, ease: 'power2.inOut' }, 'init');

    // Initial state for lines
    gsap.set('.line-1', {
      xPercent: -50,
      yPercent: -50,
      rotation: 45,
      scaleX: 0,
    });
    gsap.set('.line-2', {
      xPercent: -50,
      yPercent: -50,
      rotation: -45,
      scaleX: 0,
    });
  }, buttonRef.value);
};

onMounted(() => {
  createTimelines();
  watch(isMobile, () => {
    ctx.revert();
    createTimelines();
  });
});

onUnmounted(() => {
  ctx.revert();
});

watch(isVideoOpen, (newVal) => {
  if (newVal) {
    // If video is open, ensure button is in closed state
    transitionFromVideoTimelineIn.restart();
  } else {
    // If video is closed, reset button to initial state
    if (!isNavOpen.value) transitionTimelineOut.restart();
  }
});

const onClickHandler = () => {
  // Prevent multiple clicks during animation
  const isAnimating =
    gsap.getById('open-timeline-main')?.isActive() ||
    gsap.getById('close-timeline')?.isActive() ||
    gsap.getById('open-video-modal-timeline')?.isActive() ||
    gsap.getById('close-video-modal-timeline')?.isActive();
  if (isAnimating) return;

  if (isVideoOpen.value) {
    onPlayerClose();
    return;
  }

  // Toggle navigation state
  if (isNavOpen.value) {
    transitionTimelineOut.restart();
    closeNavigation();
  } else {
    transitionTimelineIn.restart();
    openNavigation();
  }
};

const onMouseEnterHandler = () => {
  console.log('isTouchDevice', isTouchDevice.value);

  playInteractionSound();
  if (isNavOpen.value || isVideoOpen.value) {
    hoverTimelineCloseIn.restart();
  } else {
    hoverTimelineIn.restart();
  }
};

const onMouseLeaveHandler = () => {
  if (isNavOpen.value || isVideoOpen.value) {
    hoverTimelineCloseOut.restart();
  } else {
    hoverTimelineOut.restart();
  }
};
</script>
<template>
  <button
    id="header-navigation-button"
    ref="buttonRef"
    :class="['header__navigation-button', { dark: isNavOpen && !isVideoOpen }]"
    @click="onClickHandler"
    @mouseenter="onMouseEnterHandler"
    @mouseleave="onMouseLeaveHandler"
  >
    <span class="dot dot-1" />
    <span class="dot dot-2" />
    <span class="dot dot-3" />
    <span class="dot dot-4" />
    <span class="line line-1" />
    <span class="line line-2" />
  </button>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
$flicker-time: 0.5s;
$flicker-ease: ease;
.header__navigation-button {
  position: fixed;
  top: 48px;
  right: 48px;
  width: 48px;
  height: 48px;
  color: $color-background;
  border-radius: 50%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  place-items: center;
  gap: 4px;
  z-index: 102;
  transition: color 0.3s ease;
  transition-delay: 0.3s;
  &.dark {
    color: $color-foreground;
    &::before {
      background-color: $color-background;
    }
    .line {
      background-color: white(50);
    }
  }
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background-color: $color-foreground;
    transition: opacity 0.3s ease;
    z-index: 0;
    transition: scale 0.3s ease-in-out, background-color 0.3s ease 0.3s;
  }
  .dot {
    width: 6px;
    height: 6px;
    background: currentColor;
    border-radius: 50%;
    position: relative;
    z-index: 1;
    @include respond(mobile) {
      width: 5px;
      height: 5px;
    }
    &.dot-1 {
      align-self: self-end;
      justify-self: self-end;
    }
    &.dot-2 {
      align-self: self-end;
      justify-self: self-start;
    }
    &.dot-3 {
      align-self: self-start;
      justify-self: self-end;
    }
    &.dot-4 {
      align-self: self-start;
      justify-self: self-start;
    }
  }
  .line {
    display: block;
    height: 1px;
    width: 10px;
    background-color: rgbaColor($color-background, 50);
    position: absolute;
    top: 50%;
    left: 50%;
  }
  &:hover {
    &::before {
      scale: 0.85;
    }
  }
  @include respond(portrait) {
    right: 24px;
  }
  @include respond(mobile) {
    top: 16px;
    right: 16px;
    width: 36px;
    height: 36px;
    gap: 2px;
  }
}
</style>
