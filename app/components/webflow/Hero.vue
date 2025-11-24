<script setup>
import gsap from 'gsap';
import CircleDashed from '../ui/CircleDashed.vue';
import HeroCenterLine from './HeroCenterLine.vue';
import useAudioManager from '~/composables/useAudioManager';
import WebflowLabel from '../ui/WebflowLabel.vue';
import useLoader from '~/composables/useLoader';
import ButtonDotsArrow from '../ui/ButtonDotsArrow.vue';
import { heroScrollAnimation } from '~/utils/animations/webflow.js';

const { playInteractionSound } = useAudioManager();

const { addResourceToLoad, resourceLoaded } = useLoader();

// Indicate that this component has a resource to load
addResourceToLoad(1);

const containerRef = ref(null);
let ctx;

const onClickHandler = () => {
  gsap.to('h1', { duration: 1, scale: 1.3, ease: 'power3.out' });
  gsap.to('.left-text .grey-text', {
    duration: 1,
    y: '-3.5vw',
    ease: 'power3.out',
  });
};

const heroVideoResource = ref(null);

onMounted(async () => {
  if (containerRef.value) {
    ctx = gsap.context(() => {}, containerRef.value);

    // heroInitSplitText();
    // heroScrollAnimation(ctx);

    // heroInitAnimation(ctx, scrollSmoother);
  }

  const blob = await $fetch('/video/webflow_frog3.mp4', {
    responseType: 'blob',
  });
  heroVideoResource.value = URL.createObjectURL(blob);
  resourceLoaded();

  heroScrollAnimation(ctx);
});

onUnmounted(() => {
  ctx.revert();
});
</script>

<template>
  <section ref="containerRef" class="hero">
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
          <div class="grey-text">Premium</div>
          <h1>
            <span>Webflow</span>
            <br />
            Enterprise
            <br />
            Partner
          </h1>
        </div>
        <div class="right-text">
          <div class="grey-text">Pushing the boundaries of the web</div>
          <a
            href="https://webflow.com/@Psychoactive-Studios"
            target="_blank"
            @mouseenter="playInteractionSound"
            @focus="playInteractionSound"
          >
            <WebflowLabel class="right-text__label" />
          </a>
        </div>
        <ButtonDotsArrow class="bottom-down" />
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
  font-family: 'RoobertMono';
  font-size: 1rem;
  font-style: normal;
  font-weight: 500;
  line-height: 100%; /* 16px */
  text-transform: uppercase;
}
.hero {
  .container {
    @include flex-center;
    flex-direction: column;
    height: 100dvh;
  }
}
.scene {
  width: 100%;
  aspect-ratio: 2;
  position: relative;
  @include flex-center;
  position: relative;
}
.video {
  width: 50%;
  aspect-ratio: 1 / 1;
  background-color: $color-foreground;
  position: absolute;
  clip-path: circle(50% at 50% 50%);

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
    font-size: 4.8vw;
    font-style: normal;
    font-weight: 400;
    line-height: 88%; /* 80.96px */
    letter-spacing: -0.06em;
    transform-origin: left bottom;
    span {
      color: #136df4;
    }
  }
}
.right-text {
  position: absolute;
  right: 0;
  bottom: 0;
  text-align: right;
  &__label {
    margin-top: getRem(30);
  }
}
.bottom-down {
  position: absolute;
  bottom: 24px;
  z-index: 1;
  mix-blend-mode: difference;
}
</style>
