<script setup>
import { Flip } from 'gsap/Flip';
import gsap from 'gsap';
import { Teleport } from 'vue';

const { stopLoading } = useLoader();
stopLoading();

const scrollSmoother = inject('scrollSmoother');

watch(scrollSmoother, (scroll) => {
  scroll.paused(false);
  console.log('scrollSmoother', scroll);
});
// Refs
const preview = ref(null);
const isFullscreen = ref(false);

// Flip fullscreen toggle
const toggleFullscreen = async () => {
  const state = Flip.getState('.video-player', { props: 'backgroundColor' });

  // preview.value.classList.toggle('active');
  // document.querySelector('.full-screen')?.classList.toggle('active');
  // document.querySelector('#video-player-modal').appendChild(preview.value);
  isFullscreen.value = !isFullscreen.value;

  await nextTick();

  Flip.from(state, {
    duration: 1,
    ease: 'power3.inOut',
    fade: true,
    absolute: true,
  });
};
</script>
<template>
  <div class="scooterok" @click="toggleFullscreen">
    <Teleport to="#video-player-modal" :disabled="!isFullscreen">
      <div ref="preview" data-flip-id="img" class="video-player active">
        <h1>Hello</h1>
      </div>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;

.scooterok {
  @include flex-center;
  height: 100vh;
  .video-player {
    @include flex-center;
    width: 75%;
    aspect-ratio: 2.2222;
    background-color: cadetblue;
    position: relative;
    display: none;
    &.active {
      display: flex;
    }
  }
  .box {
    @include flex-center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw; // ensure full width
    height: 100vh; // ensure full height
    z-index: 1000;
  }
}
</style>
