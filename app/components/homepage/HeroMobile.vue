<script setup>
import gsap from 'gsap';
import useScrollSmoother from '~/composables/useScrollSmoother';
import { heroInitAnimation } from '~/utils';
import PlayIcon from '~/assets/icons/icon-play.svg';

const container = ref(null);

let ctx = null;

const { disableScroll, scrollSmoother } = useScrollSmoother();

onMounted(() => {
  if (container.value) {
    ctx = gsap.context(() => {}, container.value);
    heroInitAnimation(ctx, scrollSmoother);
  }
});
</script>

<template>
  <div ref="container" class="hero-mobile">
    <div class="hero-mobile__preview">
      <video
        class="hero-mobile__preview_video"
        src="/video/preview_reel.mp4"
        autoplay
        loop
        muted
        playsinline
      />
      <div class="hero-mobile__preview_overlay" />
      <div class="hero-mobile__preview_controls">
        <div class="controls-text">PLAY REEL</div>
        <button class="controls-button" ria-label="Play video">
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
  &__preview {
    width: 100%;
    height: 100%;
    @include flex-center;
    flex-direction: column;
    &_video {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 0;
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
}
</style>
