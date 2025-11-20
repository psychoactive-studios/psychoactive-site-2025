<script setup>
import gsap from 'gsap';
import Footer from '~/components/layout/Footer.vue';
import OnScrollFilledText from '~/components/ui/OnScrollFilledText.vue';
import Hero from '~/components/webflow/Hero.vue';
import useScrollSmoother from '~/composables/useScrollSmoother';

const { enableScroll } = useScrollSmoother();

onMounted(() => {
  const layoutElements = gsap.utils.toArray([
    '#header-logo',
    '#header-navigation-button',
    '#header-sound-button',
  ]);
  setTimeout(() => {
    gsap.set(layoutElements, { scale: 1 });
    enableScroll();
  }, 100);
});
</script>

<template>
  <main class="webflow">
    <Hero />
    <div class="container">
      <section class="webflow__onscroll-text">
        <OnScrollFilledText>
          <p>
            Webflow development <span class="dark">for</span> innovative brands.
          </p>
          <p>
            Custom code <span class="dark">and</span> enterprise-grade builds,
            <span class="dark">crafted for</span>
            performance, scalability <span class="dark">and</span> visibility
            <span class="dark">in an AI-driven world</span>.
          </p>
        </OnScrollFilledText>
      </section>
    </div>
    <Footer />
  </main>
</template>

<style scoped lang="scss">
.webflow {
  &__onscroll-text {
    max-width: 56vw;
    margin: 0 auto 120px auto;
    text-align: center;
  }
}
</style>
