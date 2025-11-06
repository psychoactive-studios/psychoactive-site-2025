<script setup>
import gsap from 'gsap';
import Header from '~/components/layout/Header.vue';
import ScrollProvider from '~/components/layout/ScrollProvider.vue';
import ModalContainer from '~/components/ui/VideoPlayerModal.vue';
import useAudioManager from '~/composables/useAudioManager';

const { loadSounds } = useAudioManager();

const route = useRoute();

onMounted(() => {
  const layoutElements = gsap.utils.toArray([
    '#header-logo',
    '#header-navigation-button',
    '#header-sound-button',
  ]);
  gsap.set(layoutElements, { scale: 0 });
  loadSounds();
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
    <ScrollProvider>
      <slot />
    </ScrollProvider>
  </div>
</template>


