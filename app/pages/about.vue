<script setup>
import gsap from 'gsap';
import Hero from '~/components/about/Hero.vue';
import TextWithTitle from '~/components/about/TextWithTitle.vue';
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
    <TextWithTitle title="BORN AMPHIBIOUS">
      <p>
        Psychoactive is a global design agency shaping digital experiences for
        ambitious brands. We create immersive, scalable websites that push the
        boundaries of design and technology. Our remote-first team spans time
        zones, with our primary studio based in Wellington, New Zealand.
      </p>
      <p>
        Just as frogs breathe both water & air, we breathe design and
        innovation. We’re constantly hatching fresh and beautifully intuitive
        ways to stimulate the Metamorphosis of projects & brands.
      </p>
    </TextWithTitle>
  </main>
</template>
