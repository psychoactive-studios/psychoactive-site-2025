<script setup>
import { videoReelsScrollAnimation } from '~/utils/animations/webflow';
import VideoPreview from '../ui/VideoPreview.vue';
import gsap from 'gsap';
import useVideoPlayer from '~/composables/useVideoPlayer';

const containerRef = ref(null);
let ctx = null;

const { previewVideoData } = useVideoPlayer();

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
        :preview="previewVideoData || '/video/preview_reel.mp4'"
        src="https://vjs.zencdn.net/v/oceans.mp4"
        aspect-ratio="2.22"
      />
    </div>
  </div>
</template>
