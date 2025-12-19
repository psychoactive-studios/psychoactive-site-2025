<script setup>
import { onMounted } from 'vue';
import useScrollSmoother from '~/composables/useScrollSmoother';

const { initScrollSmoother } = useScrollSmoother();

onMounted(() => {
  // Initialize ScrollSmoother when the component is mounted
  initScrollSmoother();
});
</script>

<template>
  <slot />
</template>
