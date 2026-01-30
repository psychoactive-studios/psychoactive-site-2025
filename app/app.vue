<script setup>
import Loader from './components/ui/Loader.vue';
import useLoader from '~/composables/useLoader';

const { isLoading } = useLoader();

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
});
</script>

<template>
  <Loader v-if="isLoading" />
  <NuxtLayout>
    <NuxtPage :transition="{ mode: 'out-in' }" />
  </NuxtLayout>
</template>
