<script setup>
import gsap from 'gsap';
import Header from '~/components/layout/Header.vue';
import ScrollProvider from '~/components/layout/ScrollProvider.vue';
import FixedTarget from '~/components/layout/FixedTarget.vue';
import ModalContainer from '~/components/ui/VideoPlayerModal.vue';
import useAudioManager from '~/composables/useAudioManager';
import useVideoPlayer from '~/composables/useVideoPlayer';
import useLoader from '~/composables/useLoader';

const { loadSounds } = useAudioManager();
const { previewVideoData } = useVideoPlayer();
const { addResourceToLoad, resourceLoaded } = useLoader();

// Indicate that this component has a resource to load
addResourceToLoad(1);

const route = useRoute();

onMounted(async () => {
  const layoutElements = gsap.utils.toArray([
    '#header-logo',
    '#header-navigation-button',
    '#header-sound-button',
  ]);
  gsap.set(layoutElements, { scale: 0 });
  loadSounds();

  const blob = await $fetch('/video/preview_reel.mp4', {
    responseType: 'blob',
  });
  previewVideoData.value = URL.createObjectURL(blob);
  resourceLoaded();
});

watch(
  () => route.fullPath,
  (newPath) => {
    if (newPath === '/') {
      const layoutElements = gsap.utils.toArray([
        '#header-logo',
        '#header-navigation-button',
        '#header-sound-button',
      ]);
      gsap.to(layoutElements, {
        opacity: 0,
        duration: 0.8,
        ease: 'power4.in',
      });
    }
  }
);
</script>
<template>
  <div>
    <Header />
    <ModalContainer />
    <FixedTarget />
    <ScrollProvider>
      <slot />
    </ScrollProvider>
  </div>
</template>
