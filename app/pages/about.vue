<script setup>
import gsap from 'gsap';
import Hero from '~/components/about/Hero.vue';
import useScrollSmoother from '~/composables/useScrollSmoother';
const { enableScroll } = useScrollSmoother();

onMounted(() => {
  const layoutElements = gsap.utils.toArray([
    '#header-logo',
    '#header-navigation-button',
    '#header-sound-button',
  ]);
  setTimeout(() => {
    gsap.to(
      layoutElements,
      { scale: 1, opacity: 1, duration: 0.75, ease: 'power3.out' },
      '<+=1'
    );
    enableScroll();
  }, 100);
});
</script>

<template>
  <main class="about">
    <Hero />
  </main>
</template>
