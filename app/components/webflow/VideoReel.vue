<script setup>
import { videoReelsScrollAnimation } from '~/utils/animations/webflow';
import VideoPreview from '../ui/VideoPreview.vue';
import gsap from 'gsap';

const containerRef = ref(null);
let ctx = null;

watch(containerRef, (val) => {
  if (val) {
    ctx = gsap.context(() => {}, val);
    videoReelsScrollAnimation(ctx);
  }
});

onUnmounted(() => {
  ctx.revert();
});
</script>
<template>
  <div ref="containerRef">
    <div class="video-reel__inner">
      <VideoPreview
        class="video-reel__video homehero-prepared"
        preview-playback-id="L4cwV1O9pQPNJ1px400NV3sNGpNbbX6V3rbrybMq9a6A"
        src="https://vjs.zencdn.net/v/oceans.mp4"
        aspect-ratio="2.22"
      />
    </div>
  </div>
</template>
