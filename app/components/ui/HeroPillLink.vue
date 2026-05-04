<script setup>
// Hero pill link — same pill shape as the original WebflowBlackLabel
// (border, background fade-in on hover) but with editable text plus
// the scrambleText hover effect used by the rest of the site's CTAs.
//
// Load-in: the element carries the `top-text__label` class so it
// gets picked up by the existing `heroInitAnimation` slide-from-
// right tween in app/utils/animations/homepage.js — keeps the
// timing in sync with the other hero elements.
import gsap from 'gsap';
import useAudioManager from '~/composables/useAudioManager';

defineProps({
  href: { type: String, required: true },
  label: { type: String, required: true },
});

const { playInteractionSound } = useAudioManager();

const labelRef = ref(null);

const mouseEnterHandler = (e) => {
  playInteractionSound('text-hover-short', 100);
  const textEl = e.currentTarget?.querySelector('.hero-pill-link__visible');
  if (!textEl || gsap.isTweening(textEl)) return;
  gsap.to(textEl, {
    duration: 0.5,
    ease: 'none',
    scrambleText: {
      text: '{original}',
      chars: '0123456789!@#$%^&*()-_=+[]{};:<>/?,.',
      tweenLength: false,
    },
  });
};

const clickHandler = () => {
  playInteractionSound('click-1');
  playInteractionSound('menu-close', 150);
};
</script>

<template>
  <NuxtLink
    :to="href"
    ref="labelRef"
    class="hero-pill-link top-text__label"
    target="_self"
    @mouseenter="mouseEnterHandler"
    @focus="mouseEnterHandler"
    @click="clickHandler"
  >
    <span class="hero-pill-link__bg" aria-hidden="true" />
    <!-- Hidden copy holds the layout space so the visible (scrambling)
         text doesn't reflow the button width during the hover tween. -->
    <span class="hero-pill-link__hidden">{{ label }}</span>
    <span class="hero-pill-link__visible">{{ label }}</span>
  </NuxtLink>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;

.hero-pill-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  isolation: isolate;
  border: 1px solid white(20);
  border-radius: getRem(24);
  padding: getRem(13) getRem(22);
  text-decoration: none;
  color: $color-foreground;
  font-family: 'RoobertMono', monospace;
  font-size: clamp(11px, 0.78vw, 14px);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  line-height: 1;
  pointer-events: all;
  transition: border-color $transition-easeOutCubic;
  white-space: nowrap;

  &:hover {
    border-color: transparent;

    .hero-pill-link__bg {
      opacity: 1;
    }
  }

  &__bg {
    position: absolute;
    inset: 0;
    background: white(10);
    border-radius: getRem(24);
    opacity: 0;
    transition: opacity $transition-easeOutCubic;
    z-index: -1;
  }

  &__hidden {
    visibility: hidden;
  }

  &__visible {
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    white-space: nowrap;
  }
}
</style>
