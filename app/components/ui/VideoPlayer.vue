<script setup>
import PlusIcon from '~/assets/icons/icon-plus.svg';
import PlayIcon from '~/assets/icons/icon-play.svg';

defineProps({
  preview: {
    type: String,
    required: true,
  },
  src: {
    type: String,
    required: true,
  },
  transparentButton: {
    type: Boolean,
    default: false,
  },
});
</script>
<template>
  <div class="player">
    <div class="player__dots player__dots--tl" />
    <div class="player__dots player__dots--tr" />
    <div class="player__dots player__dots--bl" />
    <div class="player__dots player__dots--br" />
    <div class="player__preview">
      <video
        class="player__preview_video"
        :src="preview"
        autoplay
        loop
        muted
        playsinline
      />
      <div class="player__preview_overlay" />
    </div>
    <div class="player__preview_controls">
      <PlusIcon class="plus" />
      <PlusIcon class="plus" />
      <span>PLAY REEL</span>
      <button
        :class="[
          'play-button',
          { 'play-button--transparent': transparentButton },
        ]"
        aria-label="Play video"
      >
        <PlayIcon />
      </button>
      <span>00:47 sec</span>
      <PlusIcon class="plus" />
      <PlusIcon class="plus" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/functions' as *;
.player {
  position: relative;
  @include flex-center;
  &.homehero-prepared {
    width: 100%;
    .player__dots {
      width: 1px;
      transition: all 0.5s ease-out;
      &.player__dots--tl {
        top: 34%;
        left: 26.5%;
      }
      &.player__dots--tr {
        top: 34%;
        right: 26.5%;
      }
      &.player__dots--bl {
        top: 66%;
        left: 26.5%;
      }
      &.player__dots--br {
        top: 66%;
        right: 26.5%;
      }
    }
    .player__preview {
      // clip-path: polygon(0% 20%, 100% 20%, 100% 80%, 0% 80%);
      border-radius: 20px;
      aspect-ratio: 3.376;
      transition: all 0.5s ease-out;
      transform: scale(0.45);
      &_controls {
        .plus,
        span {
          visibility: hidden;
        }
      }
      // video {
      //   transition: transform 0.5s ease-in-out;
      //   transform: translateY(10%);
      // }
    }
    // &:hover {
    //   width: 100%;
    //   .player__dots {
    //     &.player__dots--tl {
    //       top: -48px;
    //       left: -48px;
    //     }
    //   }
    //   .player__preview {
    //     transform: scale(1);
    //     aspect-ratio: inherit;
    //     border-radius: 10px;
    //     video {
    //       transform: translateY(0);
    //     }
    //   }
    // }
  }
  .plus {
    width: 7px;
    height: 7px;
    color: white(50);
  }
  &__dots {
    position: absolute;
    width: 136px;
    height: 1px;
    z-index: 1;
    &::before {
      content: '';
      position: absolute;
      width: 7px;
      height: 7px;
      background: $color-dots;
      border-radius: 50%;
      top: -3px;
      left: -3px;
    }
    &::after {
      content: '';
      position: absolute;
      width: 7px;
      height: 7px;
      background: $color-dots;
      border-radius: 50%;
      bottom: -3px;
      right: -3px;
    }
    &--tl {
      top: -48px;
      left: -48px;
      transform: rotate(45deg);
      transform-origin: left;
    }
    &--tr {
      top: -48px;
      right: -48px;
      transform: rotate(-45deg);
      transform-origin: right;
    }
    &--bl {
      bottom: -48px;
      left: -48px;
      transform: rotate(-45deg);
      transform-origin: left;
    }
    &--br {
      bottom: -48px;
      right: -48px;
      transform: rotate(45deg);
      transform-origin: right;
    }
  }
  &__preview {
    @include flex-center;
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    aspect-ratio: inherit;
    &_video {
      aspect-ratio: inherit;
      object-fit: cover;
    }
    &_overlay {
      background: url('/img/video-player-dots-overlay.svg') repeat center;
      position: absolute;
      inset: 0;
    }
    &_controls {
      @include flex-center;
      gap: 6%;
      position: absolute;
      inset: 50% 0 auto 0;
      transform: translateY(-50%);
      font-family: 'RoobertMono', sans-serif;
      text-transform: uppercase;
      span {
        color: white(80);
      }
      .play-button {
        width: getRem(96);
        height: getRem(48);
        border: 1px solid white(20);
        border-radius: getRem(48);
        background-color: $color-foreground;
        color: $color-background;
        transition: background-color 0.5s ease, color 0.5s ease;
        &--transparent {
          background-color: transparent;
          color: $color-foreground;
        }
      }
    }
  }
}
</style>
