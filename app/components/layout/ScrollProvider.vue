<script setup>
import { onMounted, provide } from 'vue';
import useScrollSmoother from '~/composables/useScrollSmoother';

const { scrollSmoother, initScrollSmoother } = useScrollSmoother();

onMounted(() => {
  // Initialize ScrollSmoother when the component is mounted
  initScrollSmoother();
});

// Provide the ScrollSmoother instance to child components
provide('scrollSmoother', scrollSmoother);
</script>

<template>
  <div id="smooth-wrapper">
    <div id="smooth-content">
      <slot />
    </div>
  </div>
</template>
