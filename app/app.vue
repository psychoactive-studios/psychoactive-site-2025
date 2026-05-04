<script setup>
import Loader from './components/ui/Loader.vue';
import useLoader from '~/composables/useLoader';
import useAudioManager from '~/composables/useAudioManager';
import useScrollSmoother from '~/composables/useScrollSmoother';

const { isLoading } = useLoader();
const { playInteractionSound, hasInteracted } = useAudioManager();
const { scrollSmoother } = useScrollSmoother();

onBeforeMount(() => {
  // Check if we are on the client
  if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
    // Disable automatic browser scroll restoration
    history.scrollRestoration = 'manual';
  }
});

// Force scroll-to-top on every refresh / initial load. Browser
// scroll restoration is disabled (above) but layout shifts during
// hydration + ScrollSmoother init were still letting the page land
// at a non-zero position. Three defensive scrolls cover the bases:
//   1. Immediate on mount — before any rendering.
//   2. After nextTick — once Vue has finished initial render.
//   3. After the loader finishes — once content + animations are
//      settled.
const scrollHomeToTop = () => {
  if (typeof window === 'undefined') return;
  window.scrollTo(0, 0);
  if (scrollSmoother.value) {
    scrollSmoother.value.scrollTo(0, { immediate: true, force: true });
  }
};

onMounted(async () => {
  scrollHomeToTop();
  await nextTick();
  scrollHomeToTop();

  window.addEventListener('click', handleGlobalClick);
});

// Run again the moment the loader hides — by then the page has
// fully rendered, fonts have loaded, and any layout shifts are done.
// This is the catch-all that covers every page on every refresh.
watch(isLoading, (loading) => {
  if (!loading) scrollHomeToTop();
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
