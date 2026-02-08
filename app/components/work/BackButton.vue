<script setup>
import ButtonOutline from '../ui/ButtonOutline.vue';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import gsap from 'gsap';
import useHeader from '~/composables/useHeader';

const { playRandomSound } = useAudioManager();
const { scrollSmoother } = useScrollSmoother();
const { mode } = useHeader();

const backRef = ref(null);
let cleanUpLenis = () => {};

onMounted(() => {
  if (!backRef.value) return;

  const setY = gsap.quickSetter(backRef.value, 'y', 'px');
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
  <div class="work__back" ref="backRef">
    <ButtonOutline
      href="/work"
      class="work__back_button"
      :mode="mode"
      @click="playRandomSound('click')"
    >
      Back
    </ButtonOutline>
  </div>
</template>

<style scoped lang="scss">
.work__back {
  position: fixed;
  inset: 48px 0 auto 0;
  margin: auto;
  z-index: 1;
  display: flex;
  justify-content: center;
}
</style>
