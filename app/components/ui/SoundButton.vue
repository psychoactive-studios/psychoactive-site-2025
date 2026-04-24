<script setup>
import gsap from 'gsap';
import useHeader from '~/composables/useHeader';

const props = defineProps({
  mode: {
    type: String,
    default: 'outline', // or 'outline'
  },
  muted: {
    type: Boolean,
    default: false,
  },
  speed: {
    type: Number,
    default: 1.5,
  },
});

const lines = ref([]);

const { mode: colorMode } = useHeader();

const animateLine = (index) => {
  const line = lines.value[index];
  if (!line || props.muted) return;

  const targetScale = 1 + Math.random() * 6;
  const duration = (0.2 + Math.random() * 0.4) / props.speed;

  gsap.to(line, {
    scaleY: targetScale,
    duration: duration,
    ease: 'power1.inOut',
    onComplete: () => animateLine(index),
  });
};

const startAnimation = () => {
  lines.value.forEach((line, index) => {
    if (line) {
      gsap.killTweensOf(line);
      animateLine(index);
    }
  });
};

const stopAnimation = () => {
  lines.value.forEach((line) => {
    if (line) {
      gsap.killTweensOf(line);
      gsap.to(line, {
        scaleY: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  });
};

watch(
  () => props.muted,
  (isMuted) => {
    if (isMuted) {
      stopAnimation();
    } else {
      nextTick(() => {
        startAnimation();
      });
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  lines.value.forEach((line) => line && gsap.killTweensOf(line));
});
</script>
<template>
  <button
    :class="[
      'sound-button',
      `sound-button--${mode}`,
      `sound-button--${muted ? 'muted' : 'unmuted'}`,
      `sound-button--${colorMode}`,
    ]"
    :aria-label="muted ? 'Unmute sound' : 'Mute sound'"
    :aria-pressed="!muted"
  >
    <span
      v-for="i in 6"
      :key="i"
      :ref="(el) => (lines[i - 1] = el)"
      :class="['sound-button__line', `line--${i}`]"
    />
  </button>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/functions' as *;

.sound-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  border: 1px solid white(20);
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2px;
  transition:
    border-color $transition-easeOutCubic,
    background-color $transition-easeOutCubic;

  // &::before {
  //   content: '';
  //   position: absolute;
  //   display: block;
  //   inset: 0;
  //   background: white(20);
  //   border-radius: 50%;
  //   z-index: 1;
  //   opacity: 0;
  //   transition: opacity 0.2s ease-in-out;
  // }
  &:hover {
    border-color: transparent;
    background-color: white(20);
  }
  &__line {
    width: 1px;
    height: 2px;
    background-color: $color-foreground;
    display: inline-block;
    // transform-origin: center bottom;
    z-index: 2;
    position: relative;
    transition: background-color $transition-easeOutCubic;
  }
  &--dark {
    border-color: rgbaColor(#101012, 20);
    .sound-button__line {
      background: $color-background;
    }
    &:hover {
      border-color: transparent;
      background-color: rgbaColor(#101012, 20);
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}
</style>
