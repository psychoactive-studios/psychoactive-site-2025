<script setup>
import ButtonOutline from '../ui/ButtonOutline.vue';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import gsap from 'gsap';
import useHeader from '~/composables/useHeader';
import useNavigation from '~/composables/useNavigation';

const { playRandomSound } = useAudioManager();
const { scrollSmoother } = useScrollSmoother();
const { mode } = useHeader();
const { backButtonRef, backButtonHref } = useNavigation();


let cleanUpLenis = () => {};

onMounted(() => {
  if (!backButtonRef.value) return;

  const setY = gsap.quickSetter(backButtonRef.value, 'y', 'px');
  let currentY = 0;
  let lastScroll = 0;
  const hideOffset = -150;

  const onScroll = (e) => {
    const scroll = e.scroll;
    const delta = scroll - lastScroll;
    lastScroll = scroll;

    currentY -= delta;

    if (currentY > 0) currentY = 0;
    if (currentY < hideOffset) currentY = hideOffset;
    if (scroll <= 0) currentY = 0;

    setY(currentY);
  };

  const init = (lenis) => {
    lastScroll = lenis.scroll;
    lenis.on('scroll', onScroll);
    cleanUpLenis = () => lenis.off('scroll', onScroll);
  };

  if (scrollSmoother.value) {
    init(scrollSmoother.value);
  } else {
    const unwatch = watch(scrollSmoother, (newVal) => {
      if (newVal) {
        init(newVal);
        unwatch();
      }
    });
  }
});

onUnmounted(() => {
  cleanUpLenis();
});
</script>

<template>
  <div id="top-back-button" ref="backButtonRef" class="work__back">
    <ButtonOutline
      v-if="backButtonHref"
      :href="`/${backButtonHref}`"
      class="work__back_button"
      :mode="mode"
      @click="playRandomSound('click')"
    >
      Back
    </ButtonOutline>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
.work__back {
  position: fixed;
  inset: 48px 0 auto 0;
  margin: auto;
  z-index: 90;
  display: flex;
  justify-content: center;
  display: none;
  scale: 0;
  @include respond(mobile) {
    visibility: hidden;
  }
}
</style>
