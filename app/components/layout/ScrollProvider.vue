<script setup>
import { onMounted, provide } from 'vue';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

const scrollSmoother = ref(null);

onMounted(() => {
  // Initialize ScrollSmoother when the component is mounted
  scrollSmoother.value = ScrollSmoother.create({
    smooth: 2,
    // effects: true,
    normalizeScroll: true,
  });
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
