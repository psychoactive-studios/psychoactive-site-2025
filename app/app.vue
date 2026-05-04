<script setup>
import Loader from './components/ui/Loader.vue';
import useLoader from '~/composables/useLoader';
import useAudioManager from '~/composables/useAudioManager';

const { isLoading } = useLoader();
const { playInteractionSound, hasInteracted } = useAudioManager();

// Disable browser scroll restoration as early as possible so the
// browser doesn't try to restore the previous scroll position on
// refresh. We do this in a top-level synchronous block (not in
// onMounted) so it runs before the browser has a chance to restore.
if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
  // Force the document straight to scroll position 0 before any
  // rendering happens — no animation, no lenis smoothing,
  // no visible motion.
  window.scrollTo(0, 0);
}

onMounted(() => {
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
