<script setup>
import gsap from 'gsap';
import Header from '~/components/layout/Header.vue';
import ScrollProvider from '~/components/layout/ScrollProvider.vue';
import FixedTarget from '~/components/layout/FixedTarget.vue';
import ModalContainer from '~/components/ui/VideoPlayerModal.vue';
import useAudioManager from '~/composables/useAudioManager';
import useVideoPlayer from '~/composables/useVideoPlayer';
import useLoader from '~/composables/useLoader';
import { navigationData } from '~/data/navigationData';
import useNavigation from '~/composables/useNavigation';

const { loadSounds } = useAudioManager();
const { previewVideoData } = useVideoPlayer();
const { addResourceToLoad, resourceLoaded } = useLoader();
const { showLayoutElementsRequired } = useNavigation();

// Indicate that this component has a resource to load
addResourceToLoad(1);

const route = useRoute();

onMounted(async () => {
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
    const isTargetWithLoader =
      newPath === '/' ||
      navigationData?.find((item) => item.url === newPath)?.loader;

    if (isTargetWithLoader) {      
      const layoutElements = gsap.utils.toArray([
        '#header-logo',
        '#header-navigation-button',
        // '#header-navigation-mobile',
        '#header-sound-button',
      ]);

      gsap.to(layoutElements, {
        scale: 0,
        duration: 0.8,
        ease: 'power4.in',
      });
      gsap.to('#header-navigation-mobile', {
        y: 64,
        opacity: 0,
        duration: 0.8,
        ease: 'power4.in',
      })
    } else {      
      showLayoutElementsRequired.value = true;
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

<style>
#header-logo,
#header-navigation-button,
#header-sound-button {
  scale: 0;
}
</style>
