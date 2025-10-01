<script setup>
import PlusIcon from '~/assets/icons/icon-plus.svg';
import PlayIcon from '~/assets/icons/icon-play.svg';

import useVideoPlayer from '~/composables/useVideoPlayer';
import { SplitText } from 'gsap/SplitText';

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
  customHandler: {
    type: Function,
    default: null,
  },
  dots: {
    type: Boolean,
    default: true,
  },
  autoplay: {
    type: Boolean,
    default: true,
  },
});

onMounted(() => {
  SplitText.create(
    '.player .player__preview_controls .play-reel-text, .player .player__preview_controls .play-time-text',
    {
      type: 'chars',
      charsClass: 'char-center',
    }
  );
});

const playerContainerRef = ref(null);
const { isFullScreen, onPlayerOpen } = useVideoPlayer();
</script>
<template>
  <div class="player">
    <div v-if="dots" class="player__dots player__dots--tl" />
    <div v-if="dots" class="player__dots player__dots--tr" />
    <div v-if="dots" class="player__dots player__dots--bl" />
    <div v-if="dots" class="player__dots player__dots--br" />

    <div
      ref="playerContainerRef"
      :class="['player__container', { active: !isFullScreen }]"
      data-flip-id="video-player"
    >
      <div class="player__preview">
        <video
          class="player__preview_video"
          :src="preview"
          :autoplay="autoplay"
          loop
          muted
          playsinline
        />
        <div class="player__preview_overlay" />
      </div>
      <div class="player__preview_controls">
        <PlusIcon class="plus" />
        <PlusIcon class="plus" />
        <div class="play-reel-text">PLAY REEL</div>
        <button
          :class="[
            'play-button',
            { 'play-button--transparent': transparentButton },
          ]"
          aria-label="Play video"
          @click="
            customHandler
              ? customHandler(playerContainerRef)
              : onPlayerOpen(playerContainerRef)
          "
        >
          <PlayIcon />
        </button>
        <div class="play-time-text">00:47 sec</div>
        <PlusIcon class="plus" />
        <PlusIcon class="plus" />
      </div>
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
      will-change: transform;
      &.player__dots--tl {
        top: 34%;
        left: 26.5%;
      }
      &.player__dots--tr {
        top: 34%;
        right: 26.5%;
      }
      &.player__dots--bl {
        bottom: 33%;
        left: 26.5%;
      }
      &.player__dots--br {
        bottom: 33%;
        right: 26.5%;
      }
    }
    .player__main {
      position: absolute;
      inset: 0;
      z-index: 1;
      opacity: 0;
    }
    .player__preview {
      clip-path: inset(20% 0% round 20px);
      border-radius: 20px;
      transform: scale(0.45);
      &_controls {
        .plus,
        .play-reel-text,
        .play-time-text {
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
    margin: 0;
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
  &__container {
    position: relative;
    aspect-ratio: inherit;
    @include flex-center;
    width: 100%;
    display: none;
    &.active {
      display: flex;
    }
    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  &__preview {
    clip-path: inset(50% 0% round 20px);
    @include flex-center;
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    aspect-ratio: inherit;
    will-change: clip-path, transform;
    &_video {
      aspect-ratio: inherit;
      object-fit: cover;
      width: 100%;
    }
    &_overlay {
      background: url('/img/video-player-dots-overlay.svg') repeat;
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
      .play-reel-text,
      .play-time-text {
        color: white(80);
      }
      .play-button {
        width: getRem(96);
        height: getRem(48);
        border: 1px solid white(20);
        border-radius: getRem(48);
        background-color: $color-foreground;
        color: $color-background;
        &::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: getRem(48);
          z-index: 1;
          transform: scale(0);
          transition: transform 0.4s cubic-bezier(0, 0, 0.02, 0.99);
          will-change: transform;
        }
        &--transparent {
          background-color: transparent;
          color: $color-foreground;
          .nuxt-icon {
            position: relative;
            z-index: 1;
            transition: color 0.075s ease-out;
          }
          &::before {
            background: $color-foreground;
          }
          &:hover {
            .nuxt-icon {
              color: $color-background;
            }
          }
        }
        &:hover {
          &::before {
            transform: scale(1);
          }
        }
      }
    }
  }
}
</style>
