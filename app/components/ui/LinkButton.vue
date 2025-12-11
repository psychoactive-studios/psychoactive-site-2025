<script setup>
import gsap from 'gsap';
import useAudioManager from '~/composables/useAudioManager';

const { playInteractionSound } = useAudioManager();

const letsTalkButtonRef = ref(null);

defineProps({
  href: {
    type: String,
    required: true,
  },
  target: {
    type: String,
    default: '_blank',
  },
  mode: {
    type: String,
    default: 'light',
  },
});

const talkButtonHoverHandler = () => {
  playInteractionSound();
  if (gsap.isTweening(letsTalkButtonRef.value)) return;
  gsap.to(letsTalkButtonRef.value, {
    duration: 0.5,
    ease: 'none',
    scrambleText: {
      text: '{original}',
      chars: '0123456789!@#$%^&*()-_=+[]{};:<>/?,.',
      tweenLength: false,
    },
  });
};
</script>
<template>
  <a
    ref="letsTalkButtonRef"
    :href="href"
    :target="target"
    rel="noopener noreferrer"
    :class="['link-button', mode]"
    @mouseenter="talkButtonHoverHandler"
    @focus="talkButtonHoverHandler"
  >
    <slot />
  </a>
</template>
<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;
.link-button {
  @include flex-center;
  width: 222px;
  position: relative;
  isolation: isolate;
  text-decoration: none;
  height: 64px;
  padding: 0 getRem(48);
  border-radius: 32px;
  font-family: 'RoobertMono';
  font-size: 1rem;
  font-style: normal;
  font-weight: 500;
  line-height: 1.68; /* 168.75% */
  text-transform: uppercase;
  white-space: nowrap;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 48px;
    z-index: -1;
    transition: scale 0.3s cubic-bezier(0.33, 1, 0.68, 1);
  }
  &:hover {
    &::before {
      scale: 0.85;
    }
  }
  &.light {
    color: $color-background;
    &::before {
      background-color: $color-foreground;
    }
  }
  &.dark {
    color: $color-foreground;
    &::before {
      background-color: $color-background;
    }
  }
}
</style>
