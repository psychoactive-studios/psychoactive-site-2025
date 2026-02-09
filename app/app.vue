<script setup>
import Loader from './components/ui/Loader.vue';
import useLoader from '~/composables/useLoader';
import useAudioManager from '~/composables/useAudioManager';

const { isLoading } = useLoader();
const { playInteractionSound, hasInteracted } = useAudioManager();

onBeforeMount(() => {
  // Check if we are on the client
  if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
    // Disable automatic browser scroll restoration
    history.scrollRestoration = 'manual';
  }
});

onMounted(() => {
  // Force scroll to top on start
  window.scrollTo(0, 0);
  window.addEventListener('click', handleGlobalClick);
});

const handleGlobalClick = (event) => {
  if (hasInteracted.value) return;
  const target = event.target;

  const isInteractive = target.closest(
    'a, button, input, textarea, select, [role="button"]'
  );

  if (!isInteractive) playInteractionSound('sound-btn-hover-1');

  hasInteracted.value = true;
  window.removeEventListener('click', handleGlobalClick);
};
</script>

<template>
  <Loader v-if="isLoading" />
  <NuxtLayout>
    <NuxtPage :transition="{ mode: 'out-in' }" />
  </NuxtLayout>
</template>
