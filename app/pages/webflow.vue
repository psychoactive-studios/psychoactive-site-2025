<script setup>
import gsap from 'gsap';
import Hero from '~/components/webflow/Hero.vue';

onMounted(() => {
  const layoutElements = gsap.utils.toArray([
    '#header-logo',
    '#header-navigation-button',
    '#header-sound-button',
  ]);
  setTimeout(() => {
    gsap.set(layoutElements, { scale: 1 });
  }, 100);
});
</script>

<template>
  <Hero />
</template>
