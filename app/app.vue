<script setup lang="ts">
import ScrollProvider from './components/layout/ScrollProvider.vue';
</script>

<template>
  <ScrollProvider>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </ScrollProvider>
</template>
