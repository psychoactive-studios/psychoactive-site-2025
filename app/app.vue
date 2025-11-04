<script setup>
import Loader from './components/ui/Loader.vue';
import useLoader from '~/composables/useLoader';
const { isLoading } = useLoader();
</script>

<template>
  <Loader v-if="isLoading" />
  <NuxtLayout>
    <NuxtPage :transition="{ mode: 'out-in' }" />
  </NuxtLayout>
</template>
