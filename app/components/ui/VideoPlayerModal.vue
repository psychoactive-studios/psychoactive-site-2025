<script setup>
import useVideoPlayer from '~/composables/useVideoPlayer';
import PlayIcon from '~/assets/icons/icon-play.svg';
import PauseIcon from '~/assets/icons/icon-pause.svg';
import SoundButton from './SoundButton.vue';
import '@mux/videojs-kit/dist/index.css';

let player = null;

const {
  PLAYBACK_ID,
  videoElementRef,
  isPlaying,
  currentTime,
  isMuted,
  progress,
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
  const videoElement = videoElementRef.value;
  if (videoElement) {
    if (state) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
  }
});

watch(PLAYBACK_ID, (newPlaybackId) => {
  if (player && newPlaybackId) {
    player.src({
      src: newPlaybackId,
      type: 'video/mux',
    });
  }
});

onMounted(async () => {
  if (import.meta.client) {
    const { default: videojs } = await import('@mux/videojs-kit');

    if (videoElementRef.value) {
      player = videojs(videoElementRef.value, {
        controls: false,
        // responsive: true,
        // fluid: true,
        preload: 'auto',
      });

      // const qualityLevels = player.qualityLevels();

      // qualityLevels.on('addqualitylevel', function (event) {
      //   const qualityLevel = event.qualityLevel;

      //   if (qualityLevel.height > 720) {
      //     console.log('qualityLevel', qualityLevel);
      //     qualityLevel.enabled = true;
      //   } else {
      //     qualityLevel.enabled = false;
      //   }
      // });

      if (PLAYBACK_ID.value) {
        player.src({
          src: PLAYBACK_ID.value,
          type: 'video/mux',
        });
      }

      // enableQualityLevel(4);

      setupVideoListeners(videoElementRef.value);
    }
  }
});

const handleHoverProgressBar = (event) => {
  const progressBar = event.currentTarget;
  const rect = progressBar.getBoundingClientRect();
  const offsetX = event.clientX - rect.left;
  const hoverPercent = (offsetX / rect.width) * 100;

  const hoverLine = progressBar.querySelector('.progress-hover-line');
  if (hoverLine) {
    hoverLine.style.width = `calc(${hoverPercent}% - 3px)`;
  }
};

const handleCliclProgressBar = (event) => {
  const progressBar = event.currentTarget;
  const rect = progressBar.getBoundingClientRect();
  const offsetX = event.clientX - rect.left;
  const clickPercent = offsetX / rect.width;

  const videoElement = videoElementRef.value;
  if (videoElement) {
    videoElement.currentTime = videoElement.duration * clickPercent;
  }
};
</script>

<template>
  <div id="video-player-modal" ref="videoPlayerModalRef">
    <div class="modal__player">
      <ClientOnly>
        <video
          ref="videoElementRef"
          class="video-js player__main_video"
          type="video/mux"
          preload="auto"
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
          <div
            class="progress-bar"
            @mousemove="handleHoverProgressBar"
            @click="handleCliclProgressBar"
          >
            <div class="progress-hover-line" />
            <div class="progress-line">
              <div class="progress-fill" :style="{ width: `${progress}%` }" />
            </div>
          </div>
        </div>
      </ClientOnly>
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
  z-index: 100;
  .modal__player {
    @include flex-center;
    width: 100%;
    height: 100vh;
    display: none;
    position: relative;
    z-index: 1;
  }

  .player__main_video {
    width: 100%;
    height: 100%;
    object-fit: cover;
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
      display: flex;
      align-items: center;
      height: 24px;
      position: relative;
      cursor: pointer;
      &:hover {
        .progress-hover-line {
          opacity: 1;
        }
      }
      .progress-hover-line {
        width: 50%;
        height: 3px;
        background-color: rgbaColor($color-foreground, 50);
        position: absolute;
        border-radius: 3px;
        left: 0px;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
        &::after {
          content: '';
          position: absolute;
          top: calc(50% - 3px);
          left: calc(100%);
          width: 7px;
          height: 7px;
          background-color: $color-foreground;
          border-radius: 50%;
          z-index: 0;
        }
      }
      .progress-line {
        width: 100%;
        height: 1px;
        background-color: white(20);
        position: relative;
        border-radius: 2px;
      }
      &::before {
        content: '';
        position: absolute;
        top: calc(50% - 3px);
        left: -3px;
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
          left: calc(100% - 3px);
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
      background-color: $color-black;
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
