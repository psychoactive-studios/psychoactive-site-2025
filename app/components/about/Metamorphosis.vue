<script setup>
import gsap from 'gsap';
import useAudioManager from '~/composables/useAudioManager';

const { playInteractionSound } = useAudioManager();

const letsTalkButtonRef = ref(null);

const handleHoverEffect = () => {
  const el = letsTalkButtonRef.value;
  // Stop any ongoing animations on this element
  if (gsap.isTweening(el)) return;

  // Set the width to prevent layout shift
  const width = el.offsetWidth;
  gsap.set(el, { width });

  playInteractionSound();

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
</script>
<template>
  <div class="metamorphosis">
    <div class="metamorphosis__button">
      <div class="metamorphosis__button_line">
        <span class="line" />
      </div>
      <button class="button" @mouseenter="handleHoverEffect">
        <span ref="letsTalkButtonRef">METAMORPHOSIS DEFINITION</span>
        <span class="button__dots">
          <i />
          <i />
          <i />
        </span>
      </button>
      <div class="metamorphosis__button_line">
        <span class="line" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
.metamorphosis {
  padding-bottom: 160px;
  @include respond(portrait) {
    padding-top: 60px;
    padding-bottom: 0;
  }
  &__button {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 36px;
    @include respond(mobile) {
      display: block;
    }
    .button {
      font-family: 'RoobertMono';
      font-size: 1rem;
      font-style: normal;
      font-weight: 500;
      line-height: 100%;
      text-transform: uppercase;
      padding: 12px 24px 12px 80px;
      border: 1px solid white(20);
      border-radius: 48px;
      @include respond(mobile) {
        width: 100%;
        max-width: 360px;
        padding: 12px 24px 12px 24px;
      }
      &__dots {
        display: inline-flex;
        gap: 2px;
        margin-left: 60px;
        @include respond(mobile) {
          margin-left: auto;
        }
        i {
          width: 6px;
          height: 6px;
          background-color: $color-foreground;
          border-radius: 50%;
          display: inline-block;
        }
      }
      &:hover {
        .button__dots {
          i {
            &:nth-child(1) {
              animation: flicker-effect-3 0.5s forwards;
            }
            &:nth-child(2) {
              animation: flicker-effect-3 0.5s forwards 0.2s;
            }
            &:nth-child(3) {
              animation: flicker-effect-3 0.5s forwards 0.3s;
            }
          }
        }
      }
    }
    &_line {
      @include respond(mobile) {
        display: none;
      }
      .line {
        display: block;
        width: 100%;
        height: 1px;
        background: white(10);
        position: relative;
        will-change: width;
        &::before,
        &::after {
          content: '';
          position: absolute;
          width: 7px;
          height: 7px;
          background-color: white(50);
          border-radius: 50%;
        }
        &::before {
          top: -3px;
          left: -3px;
        }
        &::after {
          top: -3px;
          right: -4px;
        }
      }
    }
  }
}
</style>
