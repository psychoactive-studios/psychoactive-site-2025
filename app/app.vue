<script setup>
import Loader from './components/ui/Loader.vue';
import useLoader from '~/composables/useLoader';
const { isLoading } = useLoader();

onMounted(() => {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
    console.log('scrollRestoration!!!!!', history.scrollRestoration);
  }
});
</script>

<template>
  <Loader v-if="isLoading" />
  <NuxtLayout>
    <NuxtPage :transition="{ mode: 'out-in' }" />
  </NuxtLayout>
</template>
