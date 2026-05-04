<script setup>
// Hero pill link — recreates the look + interaction of the original
// WebflowBlackLabel SVG button, but with editable text. Used in the
// hero (desktop + mobile-digital section) so the button replacing
// the old Webflow Enterprise Partner badge keeps the same border,
// background fade, character stagger, and sound treatment.
import gsap from 'gsap';
import useAudioManager from '~/composables/useAudioManager';

defineProps({
  href: { type: String, required: true },
  label: { type: String, required: true },
});

const { playInteractionSound } = useAudioManager();

const labelRef = ref(null);

const mouseEnterHandler = () => {
  playInteractionSound('text-hover-short', 100);
  if (!labelRef.value) return;
  gsap
    .timeline()
    .set(
      labelRef.value.querySelectorAll('.char'),
      {
        opacity: 0,
        stagger: { amount: 0.28, grid: 'auto', from: 'random' },
      },
      '<'
    )
    .set(labelRef.value.querySelectorAll('.char'), {
      opacity: 1,
      stagger: { amount: 0.28, grid: 'auto', from: 'random' },
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
    class="hero-pill-link"
    target="_self"
    @mouseenter="mouseEnterHandler"
    @click="clickHandler"
  >
    <span class="hero-pill-link__bg" aria-hidden="true" />
    <span class="hero-pill-link__text">
      <span
        v-for="(char, i) in label.split('')"
        :key="i"
        class="char"
        aria-hidden="true"
      >{{ char === ' ' ? ' ' : char }}</span>
      <span class="hero-pill-link__sr">{{ label }}</span>
    </span>
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

  &__text {
    display: inline-flex;
    position: relative;
  }

  &__sr {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .char {
    display: inline-block;
    will-change: opacity;
  }
}
</style>
