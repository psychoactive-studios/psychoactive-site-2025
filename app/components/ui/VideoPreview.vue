<script setup>
import PlusIcon from '~/assets/icons/icon-plus.svg';
import PlayIcon from '~/assets/icons/icon-play.svg';
import useAudioManager from '~/composables/useAudioManager';
import useVideoPlayer from '~/composables/useVideoPlayer';
import { SplitText } from 'gsap/SplitText';

const props = defineProps({
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
  aspectRatio: {
    type: [Number, String],
    default: null,
  },
});

const playerContainerRef = ref(null);
const { playInteractionSound } = useAudioManager();

onMounted(() => {
  SplitText.create(
    '.player .player__preview_controls .play-reel-text, .player .player__preview_controls .play-time-text',
    {
      type: 'chars',
      charsClass: 'char-center',
    }
  );

  // Set initial aspect ratio based on container size
});

const currentAspectRatio = computed(() => {
  // If aspectRatio prop is provided, use it
  if (props.aspectRatio) {
    return props.aspectRatio;
  }

  // Otherwise, calculate based on container dimensions
  if (currentAspectRatio.value) {
    return (
      playerContainerRef.value.clientWidth /
      playerContainerRef.value.clientHeight
    );
  }

  // If container is not yet available,
  return 'inherit'; // або будь-яке інше стандартне значення
});

const uniqueId = `player-preview-${useId()}`;

const { currentPreview, onPlayerOpen } = useVideoPlayer();

const handleVideoClick = () => {
  playInteractionSound('click-1');
  playInteractionSound('showreel-open-1', 100);
  if (props.customHandler) {
    props.customHandler(uniqueId);
  } else {
    onPlayerOpen(uniqueId);
  }
};
</script>
<template>
  <div class="player">
    <div v-if="dots" class="player__dots player__dots--tl" />
    <div v-if="dots" class="player__dots player__dots--tr" />
    <div v-if="dots" class="player__dots player__dots--bl" />
    <div v-if="dots" class="player__dots player__dots--br" />

    <div
      ref="playerContainerRef"
      class="player__container"
      :style="currentAspectRatio && { 'aspect-ratio': currentAspectRatio }"
      :data-flip-id="uniqueId"
    >
      <Teleport
        to="#video-player-modal"
        :disabled="currentPreview !== uniqueId"
      >
        <div :id="uniqueId" :data-flip-id="uniqueId" class="player__wrapper">
          <div class="player__preview">
            <video
              class="player__preview_video"
              :src="preview"
              :autoplay="autoplay"
              :style="
                currentAspectRatio && { 'aspect-ratio': currentAspectRatio }
              "
              loop
              muted
              playsinline
            />
            <div class="player__preview_overlay" />
          </div>
          <div class="player__preview_controls">
            <PlusIcon class="plus" />
            <PlusIcon class="plus" />
            <div class="play-reel-text subheader--mobile">PLAY REEL</div>
            <button
              :class="[
                'play-button',
                { 'play-button--transparent': transparentButton },
              ]"
              aria-label="Play video"
              @click="handleVideoClick"
              @mouseenter="playInteractionSound('play-hover-menu', 200)"
            >
              <PlayIcon />
            </button>
            <div class="play-time-text subheader--mobile">00:47 sec</div>
            <PlusIcon class="plus" />
            <PlusIcon class="plus" />
          </div>
        </div>
      </Teleport>
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
      &.player__dots--tl {
        top: 34%;
        left: 26.5%;
        @include respond(portrait) {
          top: 20%;
          left: 12%;
        }
        @include respond(mobile) {
          top: -8px;
          left: -8px;
        }
      }
      &.player__dots--tr {
        top: 34%;
        right: 26.5%;
        @include respond(portrait) {
          top: 20%;
          right: 12%;
        }
        @include respond(mobile) {
          top: -8px;
          right: -8px;
        }
      }
      &.player__dots--bl {
        bottom: 33%;
        left: 26.5%;
        @include respond(portrait) {
          bottom: 20%;
          left: 12%;
        }
        @include respond(mobile) {
          bottom: -8px;
          left: -8px;
        }
      }
      &.player__dots--br {
        bottom: 33%;
        right: 26.5%;
        @include respond(portrait) {
          bottom: 20%;
          right: 12%;
        }
        @include respond(mobile) {
          bottom: -8px;
          right: -8px;
        }
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
      @include respond(portrait) {
        transform: scale(0.7);
        clip-path: inset(15% 0% round 20px);
      }
      @include respond(mobile) {
        transform: scale(1);
        clip-path: none;
        border-radius: getRem(6);
      }
      &_controls {
        .plus,
        .play-reel-text,
        .play-time-text {
          visibility: hidden;
        }
        @include respond(mobile) {
          .plus {
            display: none;
          }
          .play-reel-text,
          .play-time-text {
            visibility: visible;
          }
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
      @include respond(mobile) {
        top: 0;
        left: 0;
        width: 4px;
        height: 4px;
      }
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
      @include respond(mobile) {
        width: 4px;
        height: 4px;
      }
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
    height: 100%;
    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  &__wrapper {
    width: 100%;
    // height: 100%;
  }
  &__preview {
    @include flex-center;
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    aspect-ratio: inherit;
    will-change: clip-path, transform;
    &_image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
    }
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
      // font-family: 'RoobertMono', sans-serif;
      // text-transform: uppercase;
      .play-reel-text,
      .play-time-text {
        color: white(80);
        @include respond(mobile) {
          font-size: getRem(12);
          opacity: 0.5;
        }
      }
      .play-button {
        width: getRem(96);
        height: getRem(48);
        border-radius: getRem(48);
        color: $color-background;
        border: 1px solid white(20);
        position: relative;
        overflow: hidden;
        pointer-events: all;
        @include respond(mobile) {
          width: 70px;
          height: 36px;
        }
        .nuxt-icon {
          position: relative;
          z-index: 1;
          transition: color 0.075s ease-out;
          translate: 2px 0px;
          @include respond(mobile) {
            height: 12px;
          }
        }
        &::before {
          content: '';
          position: absolute;
          inset: -2px;
          border: 26px solid $color-foreground;
          border-radius: getRem(48);
          z-index: 1;
          transition: border 0.2s cubic-bezier(0, 0, 0.02, 0.99);
          will-change: transform;
        }
        &:hover {
          .nuxt-icon {
            color: $color-foreground;
          }
          &::before {
            border: 1px solid white(100);
          }
        }
        &--transparent {
          color: $color-foreground;
          &::before {
            border: 1px solid white(100);
          }
          &:hover {
            .nuxt-icon {
              animation: change-color 0.00001s forwards 0.3s,
                flicker-effect-3 0.3s ease forwards 0.3s;
            }
            &::before {
              border: 26px solid $color-foreground;
            }
          }
        }
      }
    }
  }
}
@keyframes change-color {
  0% {
    color: $color-foreground;
  }
  100% {
    color: $color-background;
  }
}
</style>
