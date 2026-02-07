<script setup>
import gsap from 'gsap';
import useAudioManager from '~/composables/useAudioManager';

const { playInteractionSound } = useAudioManager();
const buttonRef = ref(null);

const talkButtonHoverHandler = () => {
  playInteractionSound();
  const el = buttonRef.value?.querySelector('.button__visible-text');
  if (!el || gsap.isTweening(el)) return;
  // Set the width to prevent layout shift
  // const width = el.offsetWidth;
  // gsap.set(el, { width });

  gsap.to(el, {
    duration: 0.5,
    ease: 'none',
    scrambleText: {
      text: '{original}',
      chars: '0123456789!@#$%^&*()-_=+[]{};:<>/?,.',
      tweenLength: false,
    },
    // onComplete: () => {
    //   gsap.set(el, { clearProps: 'all' });
    // },
  });
};
</script>
<template>
  <button
    ref="buttonRef"
    class="button"
    type="button"
    @mouseenter="talkButtonHoverHandler"
    @focus="talkButtonHoverHandler"
  >
    <span class="button__hidden-text">
      <slot />
    </span>
    <span class="button__visible-text">
      <slot />
    </span>
  </button>
</template>
<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;
.button {
  @include flex-center;
  font-family: 'RoobertMono';
  font-size: 1rem;
  font-style: normal;
  font-weight: 500;
  line-height: 100%;
  text-transform: uppercase;
  padding: 12px 24px;
  min-width: 96px;
  height: 48px;
  border-radius: 48px;
  background-color: transparent;
  color: white(80);
  font-size: 16px;
  cursor: pointer;
  position: relative;
  border: 1px solid white(20);
  transition:
    background-color $transition-easeOutCubic,
    border-color $transition-easeOutCubic;
  &:hover {
    background-color: white(20);
    border-color: transparent;
  }
  &__hidden-text {
    visibility: hidden;
  }
  &__visible-text {
    position: absolute;
    z-index: 1;
  }
}
</style>
