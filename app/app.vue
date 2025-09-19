<script setup>
import ScrollProvider from './components/layout/ScrollProvider.vue';
import Loader from './components/ui/Loader.vue';
import { useLoader } from '~/composables/useLoader';

const { isLoading } = useLoader();
</script>

<template>
  <Loader v-if="isLoading" />
  <ScrollProvider>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </ScrollProvider>
</template>
