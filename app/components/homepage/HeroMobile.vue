<script setup>
import gsap from 'gsap';
import useScrollSmoother from '~/composables/useScrollSmoother';
import useHomeVideoPlayerMobile from '~/composables/useHomeVideoPlayerMobile';
import { heroInitAnimationMobile } from '~/utils';
import PlayIcon from '~/assets/icons/icon-play.svg';
import '@mux/videojs-kit/dist/index.css';

const containerRef = ref(null);
let ctx = null;

const { scrollSmoother } = useScrollSmoother();
const {
  mainVideoRef,
  player,
  initializeElements,
  clickVideoPlayHandler,
  videoPlayPauseHandler,
} = useHomeVideoPlayerMobile();

onMounted(async () => {
  if (containerRef.value) {
    ctx = gsap.context(() => {}, containerRef.value);
    heroInitAnimationMobile(ctx, scrollSmoother);
    initializeElements(containerRef.value);
  }

  // Initialize Video.js with Mux
  if (import.meta.client && mainVideoRef.value) {
    const { default: videojs } = await import('@mux/videojs-kit');

    player.value = videojs(mainVideoRef.value, {
      controls: false,
      // responsive: true,
      // fluid: true,
    });

    player.value.src({
      src: 'DGN9W75V8nDh4aERGzkYEbj4VOptDviiaNfPY6gA6Is',
      type: 'video/mux',
    });
  }
});

onBeforeUnmount(() => {
  if (player.value) {
    player.value.dispose();
    player.value = null;
  }
});
</script>

<template>
  <div ref="containerRef" class="hero-mobile" data-speed="0.5">
    <div class="hero-mobile__player">
      <video
        class="hero-mobile__player_preview"
        src="/video/psreel_mob_preview.mp4"
        autoplay
        loop
        muted
        playsinline
      />
      <video
        ref="mainVideoRef"
        class="video-js hero-mobile__player_video"
        playsinline
      />
      <div
        class="hero-mobile__player_video-handler"
        @click="videoPlayPauseHandler"
      />
      <div class="hero-mobile__player_overlay" />
      <div class="hero-mobile__player_controls">
        <div class="controls-text">PLAY REEL</div>
        <button
          class="controls-button"
          aria-label="Play video"
          @click="clickVideoPlayHandler"
        >
          <PlayIcon />
        </button>
        <div class="controls-text">00:47 sec</div>
      </div>
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
      background: url('/img/ps_mob_preview.jpg') no-repeat center / cover;
    }
    &_video {
      position: absolute;
      inset: 0;
      object-fit: cover;
      width: 100%;
      height: 100%;
      z-index: 2;
      opacity: 0;
      &-handler {
        position: absolute;
        inset: 0;
        z-index: 3;
        pointer-events: none;
      }
      &.is-playing {
        pointer-events: auto;
      }
      video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    &_overlay {
      background: url('/img/video-player-dots-overlay-mobile.png') repeat;
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
