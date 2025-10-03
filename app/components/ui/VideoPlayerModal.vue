<script setup>
import useVideoPlayer from '~/composables/useVideoPlayer';
import PlayIcon from '~/assets/icons/icon-play.svg';
import PauseIcon from '~/assets/icons/icon-pause.svg';
import SoundButton from './SoundButton.vue';
import CloseButton from './CloseButton.vue';
const {
  isPlaying,
  currentTime,
  isMuted,
  progress,
  onPlayerClose,
  videoPlayerModalRef,
  playHandler,
  formatTime,
  setupVideoListeners,
} = useVideoPlayer();

const formattedTime = computed(() => {
  const time = formatTime(currentTime.value);
  return {
    minutes: time.minutes.split(''),
    seconds: time.seconds.split(''),
  };
});

const soundHandler = () => {
  isMuted.value = !isMuted.value;
};

watch(isPlaying, (state) => {
  const videoElement = videoPlayerModalRef.value?.querySelector('video');
  if (videoElement) {
    if (state) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
  }
});

onMounted(() => {
  const videoElement = videoPlayerModalRef.value?.querySelector('video');
  if (videoElement) {
    setupVideoListeners(videoElement);
  }
});
</script>

<template>
  <div id="video-player-modal" ref="videoPlayerModalRef">
    <div class="modal__player">
      <CloseButton class="close-button" @click="onPlayerClose" />
      <video
        class="player__main_video"
        src="https://vjs.zencdn.net/v/oceans.mp4"
        playsinline
        :muted="isMuted"
      />
      <div class="player__controls">
        <button
          :class="['control-button', isPlaying ? 'played' : 'paused']"
          @click="playHandler"
        >
          <PlayIcon class="icon-play" />
          <PauseIcon class="icon-pause" />
        </button>
        <SoundButton mode="filled" :muted="isMuted" @click="soundHandler" />
        <div class="play-time-text">
          <div class="char-center">{{ formattedTime.minutes[0] }}</div>
          <div class="char-center">{{ formattedTime.minutes[1] }}</div>
          <div class="char-center">:</div>
          <div class="char-center">{{ formattedTime.seconds[0] }}</div>
          <div class="char-center">{{ formattedTime.seconds[1] }}</div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/functions' as *;
#video-player-modal {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  .modal__player {
    @include flex-center;
    width: 100%;
    height: 100vh;
    display: none;
    position: relative;
    z-index: 1;
  }

  .close-button {
    position: absolute;
    top: 48px;
    right: 48px;
    z-index: 1;
  }
  .player__controls {
    @include flex-center;
    gap: 24px;
    position: absolute;
    right: 48px;
    bottom: 48px;
    left: 48px;
    width: auto;
    .control-button {
      @include flex-center;
      flex-shrink: 0;
      width: 96px;
      height: 48px;
      position: relative;
      color: $color-background;
      border-radius: 48px;
      overflow: hidden;
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: $color-foreground;
        border-radius: 48px;
        z-index: 0;
        transition: scale 0.3s cubic-bezier(0.33, 1, 0.68, 1);
      }
      &:hover {
        &::before {
          scale: 0.85;
        }
      }
      .nuxt-icon {
        position: absolute;
        opacity: 0;
        scale: 0;
        transition: scale 0.25s ease, opacity 0.25s ease;
      }
      &.played {
        .icon-pause {
          opacity: 1;
          scale: 1;
        }
        .icon-play {
          opacity: 0;
          scale: 0;
        }
      }
      &.paused {
        .icon-pause {
          opacity: 0;
          scale: 0;
        }
        .icon-play {
          opacity: 1;
          scale: 1;
        }
      }
    }
    .play-time-text {
      font-family: 'RoobertMono', sans-serif;
      display: flex;
      color: white(80);
    }
    .progress-bar {
      flex-grow: 1;
      height: 1px;
      background-color: white(20);
      position: relative;
      border-radius: 2px;
      &::before {
        content: '';
        position: absolute;
        top: calc(50% - 3px);
        left: 0;
        width: 7px;
        height: 7px;
        background-color: $color-foreground;
        border-radius: 50%;
        z-index: 0;
      }
      .progress-fill {
        height: 100%;
        background-color: $color-foreground;
        border-radius: 2px;
        transition: width 0.3s linear;
        position: relative;
        &::before {
          content: '';
          position: absolute;
          top: calc(50% - 3px);
          left: 100%;
          width: 7px;
          height: 7px;
          background-color: $color-foreground;
          border-radius: 50%;
          z-index: 0;
        }
      }
    }
  }
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .player__wrapper {
    position: fixed;
    inset: 0;
    .player__preview {
      @include flex-center;
      width: 100%;
      height: 100%;
      position: relative;
      border-radius: 10px;
      overflow: hidden;
      aspect-ratio: inherit;
      will-change: clip-path, transform;
      clip-path: inherit;
      background-color: $color-background;
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
        .plus {
          width: 7px;
          height: 7px;
          color: white(50);
          margin: 0;
        }
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
}
</style>
