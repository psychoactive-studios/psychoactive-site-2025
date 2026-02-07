<script setup>
import gsap from 'gsap';
import CircleDashed from '../ui/CircleDashed.vue';
import HeroCenterLine from './HeroCenterLine.vue';
import useAudioManager from '~/composables/useAudioManager';
import WebflowLabel from '../ui/WebflowLabel.vue';
import useLoader from '~/composables/useLoader';
import ButtonDotsArrow from '../ui/ButtonDotsArrow.vue';
import {
  heroInitSplitText,
  heroInitAnimation,
  heroScrollAnimation,
} from '~/utils/animations/webflow.js';

const { playInteractionSound, isSoundApproved, hasInteracted } = useAudioManager();
const { scrollSmoother } = useScrollSmoother();

const { isLoading, addResourceToLoad, resourceLoaded } = useLoader();

// Indicate that this component has a resource to load
addResourceToLoad(1);

const containerRef = ref(null);
let ctx;

const heroVideoResource = ref(null);

onMounted(async () => {
  if (containerRef.value) {
    ctx = gsap.context(() => {}, containerRef.value);
    heroInitSplitText();
    heroScrollAnimation(ctx);
  }

  const blob = await $fetch('/video/service_03.mp4', {
    responseType: 'blob',
  });
  heroVideoResource.value = URL.createObjectURL(blob);
  resourceLoaded();

  // setTimeout(() => heroScrollAnimation(ctx), 200);
});

onUnmounted(() => {
  ctx.revert();
});

watch(isLoading, (newVal) => {
  if (!newVal) {
    heroInitAnimation(ctx, scrollSmoother);
    if (isSoundApproved.value && hasInteracted.value)
      playInteractionSound('webflow-load');
  }
});

const onClickHandler = (e) => {
  playInteractionSound('click-1');
  playInteractionSound('menu-close', 100);
  const targetElement = document.querySelector('.webflow__onscroll-text');
  const elementY = targetElement.getBoundingClientRect().top;
  const elementHeight = targetElement.getBoundingClientRect().height;
  const windowHeight = window.innerHeight;
  const y = elementY - (windowHeight - elementHeight) / 2;

  gsap
    .timeline()
    .set(e.currentTarget, { pointerEvents: 'none' })
    .set(e.currentTarget, { clearProps: 'pointerEvents' }, '+=1.5');

  scrollSmoother.value.scrollTo(y, {
    duration: 1.5,
    force: true,
    easing: (x) =>
      x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2,
  });
};
</script>

<template>
  <section ref="containerRef" class="hero">
    <div class="hero__wrapper">
      <div class="container">
        <div class="scene">
          <div class="video">
            <video
              v-if="heroVideoResource"
              :src="heroVideoResource"
              autoplay
              loop
              muted
              playsinline
            />
          </div>
          <div class="circle-wrapper">
            <CircleDashed />
          </div>
          <div class="sight" />
          <HeroCenterLine />
          <div class="dots">
            <span class="dots--tl" />
            <span class="dots--tr" />
            <span class="dots--bl" />
            <span class="dots--br" />
          </div>
          <div class="left-text" @click="onClickHandler">
            <div class="grey-text subheader--mobile">The Bolest</div>
            <h1 class="display-large--mobile">
              <span class="blue">Webflow</span>
              <span>Enterprise</span>
              <span>Partner</span>
            </h1>
          </div>
          <div class="right-text">
            <div class="grey-text subheader--mobile">
              Pushing the boundaries of the web
            </div>
            <a
              href="https://webflow.com/@Psychoactive-Studios"
              target="_blank"
              @mouseenter="() => playInteractionSound('text-hover-short', 100)"
              @click="() => playInteractionSound('click-1')"
            >
              <WebflowLabel class="right-text__label" />
            </a>
          </div>
          <ButtonDotsArrow
            class="bottom-down"
            @click="onClickHandler"
            @mouseenter="() => playInteractionSound('scroll-btn-hover', 100)"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;
.grey-text {
  color: white(50);
  // font-family: 'RoobertMono';
  // font-size: clamp(12px, 0.938vw, 18px);
  // font-style: normal;
  // font-weight: 500;
  // line-height: 100%; /* 16px */
  // text-transform: uppercase;
}
.hero {
  .container {
    @include flex-center;
    flex-direction: column;
    height: 100dvh;
    @include respond(portrait) {
      padding-top: 160px;
      padding-bottom: 48px;
    }
    @include respond(mobile) {
      padding-top: 24px;
      padding-bottom: 74px;
    }
  }
}
.scene {
  width: 100%;
  aspect-ratio: 2;
  position: relative;
  @include flex-center;
  position: relative;
  @include respond(portrait) {
    aspect-ratio: auto;
    height: 100%;
  }
}
.video {
  width: 50%;
  aspect-ratio: 1 / 1;
  background-color: $color-foreground;
  position: absolute;
  clip-path: circle(50% at 50% 50%);
  @include respond(mobile) {
    width: calc(100% - 48px);
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
.circle-wrapper {
  position: absolute;
  width: 44%;
  aspect-ratio: 1 / 1;
  transform: rotate(-45deg);
  @include respond(mobile) {
    width: calc(89% - 48px);
  }
  svg {
    width: 100%;
    height: 100%;
  }
}
.sight {
  position: absolute;
  &::before {
    content: '';
    position: absolute;
    width: 62px;
    height: 1px;
    background: rgbaColor(#000, 50);
    left: calc(50% - 31px);
  }
  &::after {
    content: '';
    position: absolute;
    width: 1px;
    height: 7px;
    background: rgbaColor(#000, 50);
    top: calc(50% - 3px);
  }
}
.dots {
  position: absolute;
  width: 50%;
  aspect-ratio: 1.2;
  @include respond(mobile) {
    width: calc(100% - 48px);
  }
  span {
    display: block;
    width: 6px;
    height: 6px;
    background: $color-dots;
    position: absolute;
    border-radius: 50%;
  }
  &--tl {
    top: 0;
    left: 0;
  }
  &--tr {
    top: 0;
    right: 0;
  }
  &--bl {
    bottom: 0;
    left: 0;
  }
  &--br {
    bottom: 0;
    right: 0;
  }
}
.left-text {
  position: absolute;
  left: 0;
  bottom: 0;
  h1 {
    margin-top: getRem(4);
    transform-origin: left bottom;
    span {
      display: block;
      &.blue {
        color: #136df4;
      }
    }
    @include respond(mobile) {
      span {
        display: inline-block;
        margin-right: 0.3em;
        &.blue {
          display: block;
        }
      }
    }
  }
}
.right-text {
  position: absolute;
  right: 0;
  bottom: 0;
  text-align: right;
  @include respond(mobile) {
    bottom: auto;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    &__label {
      order: 1;
      margin-top: 0;
      margin-bottom: 1rem;
    }
    .grey-text {
      order: 2;
    }
  }
  &__label {
    margin-top: min(1.56vw, 30px);
    margin-left: auto;
    height: clamp(36px, 2.5vw, 48px);
    width: auto;
  }
}
.bottom-down {
  position: absolute;
  bottom: 24px;
  z-index: 1;
  mix-blend-mode: difference;
  @include respond(mobile) {
    display: none;
  }
}
</style>
