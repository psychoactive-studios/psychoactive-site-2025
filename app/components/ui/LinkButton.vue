<script setup>
import gsap from 'gsap';
import useAudioManager from '~/composables/useAudioManager';

const { playInteractionSound } = useAudioManager();

const letsTalkButtonRef = ref(null);

defineProps({
  href: {
    type: [String, Boolean],
    default: false,
  },
  target: {
    type: String,
    default: '_blank',
  },
  mode: {
    type: String,
    default: 'light',
  },
  size: {
    type: String,
    default: 'medium',
  },
});

const talkButtonHoverHandler = (e) => {
  // const buttonType = props.mode === 'light' ? 'dark' : 'light';
  playInteractionSound('talk-btn-hover');

  const el = e.currentTarget?.querySelector('.link-button__visible-text');
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
  <NuxtLink
    v-if="href"
    ref="letsTalkButtonRef"
    :to="href"
    :target="target"
    rel="noopener noreferrer"
    :class="['link-button', mode, size]"
    @mouseenter="talkButtonHoverHandler"
    @focus="talkButtonHoverHandler"
  >
    <span class="link-button__hidden-text">
      <slot />
    </span>
    <span class="link-button__visible-text">
      <slot />
    </span>
  </NuxtLink>
  <button
    v-else
    ref="letsTalkButtonRef"
    :class="['link-button', mode, size]"
    @mouseenter="talkButtonHoverHandler"
    @click="() => playInteractionSound('click-3')"
  >
    <span class="link-button__hidden-text">
      <slot />
    </span>
    <span class="link-button__visible-text">
      <slot />
    </span>
  </button>
</template>
<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;
.link-button {
  @include flex-center;
  display: inline-flex;
  position: relative;
  isolation: isolate;
  text-decoration: none;
  border-radius: 32px;
  font-family: 'RoobertMono';
  font-size: 1rem;
  font-style: normal;
  font-weight: 500;
  line-height: 1.68; /* 168.75% */
  text-transform: uppercase;
  white-space: nowrap;
  &__hidden-text {
    visibility: hidden;
  }
  &__visible-text {
    position: absolute;
    z-index: 1;
  }
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
  &.medium {
    height: 64px;
    padding: 0 getRem(48);
  }
  &.small {
    height: 48px;
    padding: 0 getRem(32);
  }
}
</style>
