<script setup>
import gsap from 'gsap';
import useAudioManager from '~/composables/useAudioManager';

const { playInteractionSound, playRandomSound } = useAudioManager();

const props = defineProps({
  href: {
    type: String,
    default: null,
  },
});

const handleHoverEffect = (el) => {
  // Stop any ongoing animations on this element
  if (gsap.isTweening(el)) return;

  // Set the width to prevent layout shift
  const width = el.offsetWidth;
  gsap.set(el, { width });

  // Store the original text
  gsap.to(el, {
    duration: 0.7,
    ease: 'none',
    scrambleText: {
      text: '{original}',
      chars: '0123456789!@#$%^&*()-_=+[]{};:<>/?,.',
      tweenLength: false,
    },
    overwrite: true,
    onComplete: () => {
      gsap.set(el, { clearProps: 'all' });
    },
  });
};

const onMouseEnterHandler = (e) => {
  if (gsap.isTweening(e.target)) return;
  if (props.href && props.href.includes('hello@psychoactive.co.nz')) {
    playInteractionSound('scroll-btn-hover');
  } else {
    playRandomSound('text-hover');
  }
  handleHoverEffect(e.target);
};

const onFocusHandler = (e) => {
  handleHoverEffect(e.target);
};
</script>
<template>
  <NuxtLink
    :to="href"
    class="link-with-hover"
    @mouseenter="onMouseEnterHandler"
    @focus="onFocusHandler"
  >
    <slot />
  </NuxtLink>
</template>

<style lang="scss" scoped>
.link-with-hover {
  white-space: nowrap;
}
</style>
