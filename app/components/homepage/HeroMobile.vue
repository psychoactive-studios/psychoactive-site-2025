<script setup>
import gsap from 'gsap';
import useScrollSmoother from '~/composables/useScrollSmoother';
import { heroInitAnimationMobile } from '~/utils';
import PlayIcon from '~/assets/icons/icon-play.svg';
import IconPlus from '~/assets/icons/icon-plus-1.svg';
import useNavigation from '~/composables/useNavigation';

const container = ref(null);

let ctx = null;
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

const { scrollSmoother } = useScrollSmoother();
const { navigationMobileRef } = useNavigation();
const mainVideo = ref(null);

onMounted(() => {
  if (container.value) {
    ctx = gsap.context(() => {}, container.value);
    heroInitAnimationMobile(ctx, scrollSmoother);

    // Initialize DOM elements
    currentNavigation = container.value.querySelector(
      '.hero-mobile__navigation'
    );
    currentNavigationLogo = container.value.querySelector(
      '.hero-mobile__navigation img'
    );
    currentNavigationText = container.value.querySelector(
      '.hero-mobile__navigation .text'
    );
    currentNavigationButton = container.value.querySelector(
      '.hero-mobile__navigation_button'
    );
    currentNavigationButtonIcon = container.value.querySelector(
      '.hero-mobile__navigation_button .icon'
    );
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
  }
});

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
</script>

<template>
  <div ref="container" class="hero-mobile">
    <div class="hero-mobile__player">
      <video
        class="hero-mobile__player_preview"
        src="/video/preview_reel.mp4"
        autoplay
        loop
        muted
        playsinline
      />
      <video
        ref="mainVideo"
        class="hero-mobile__player_video"
        src="https://vjs.zencdn.net/v/oceans.mp4"
        playsinline
        muted
        @click="videoPlayPauseHandler"
      />
      <div class="hero-mobile__player_overlay" />
      <div class="hero-mobile__player_controls">
        <div class="controls-text">PLAY REEL</div>
        <button
          class="controls-button"
          ria-label="Play video"
          @click="clickVideoPlayHandler"
        >
          <PlayIcon />
        </button>
        <div class="controls-text">00:47 sec</div>
      </div>
    </div>
    <div class="hero-mobile__navigation">
      <img src="/img/logo-1.svg" alt="Psychoactive" />
      <span class="text">psychoactive®</span>
      <button
        class="hero-mobile__navigation_button"
        @click="clickVideoCloseHandler"
      >
        <IconPlus class="icon" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;

.hero-mobile {
  width: 100%;
  height: 100vh;
  position: relative;
  display: block;
  &__navigation {
    display: none;
    justify-content: center;
    align-items: center;
    position: fixed;
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    height: 42px;
    z-index: 101;
    color: $color-background;
    font-family: 'RoobertMono', sans-serif;
    font-size: getRem(14);
    font-weight: 500;
    text-transform: uppercase;
    padding: 0;
    transform-origin: center;
    img {
      position: absolute;
      top: 4px;
      left: 10px;
      width: 36px;
      height: 36px;
      mix-blend-mode: difference;
      transform: scale(0.72);
      z-index: 1;
    }
    .text {
      position: absolute;
      top: 50%;
      left: getRem(58);
      z-index: 1;
      translate: 0 -50%;
    }
    &_button {
      // position: absolute;
      // right: 0;
      // top: 0;
      width: 100%;
      height: 100%;
      background-color: $color-foreground;
      border-radius: 1rem;
      justify-content: flex-end;
      padding-right: 14px;
      z-index: 0;
    }
  }
  &__player {
    width: 100%;
    height: 100%;
    @include flex-center;
    flex-direction: column;
    &_preview {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 0;
    }
    &_video {
      position: absolute;
      inset: 0;
      object-fit: cover;
      width: 100%;
      height: 100%;
      z-index: 2;
      opacity: 0;
      pointer-events: none;
    }
    &_overlay {
      background: url('/img/video-player-dots-overlay.svg') repeat;
      position: absolute;
      inset: 0;
      z-index: 1;
    }
    &_controls {
      position: relative;
      z-index: 2;
      @include flex-center;
      gap: 24px;
      .controls-text {
        font-family: 'RoobertMono', sans-serif;
        font-size: getRem(14);
        text-transform: uppercase;
        color: white(80);
      }
      .controls-button {
        width: getRem(96);
        height: getRem(48);
        border: 1px solid white(20);
        border-radius: getRem(48);
        color: $color-background;
        position: relative;
        .nuxt-icon {
          position: relative;
          z-index: 1;
          transition: color 0.075s ease-out;
          height: 12px;
        }
        &::before {
          content: '';
          position: absolute;
          inset: 0;
          background-color: $color-foreground;
          border-radius: getRem(48);
          z-index: 1;
          transform: scale(1);
          transition: transform 0.4s cubic-bezier(0, 0, 0.02, 0.99);
          will-change: transform;
        }
        &:hover {
          .nuxt-icon {
            color: $color-foreground;
          }
          &::before {
            transform: scale(0);
          }
        }
      }
    }
  }
  &__main {
    position: absolute;
    inset: 0;
    opacity: 0;
    &_video {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
