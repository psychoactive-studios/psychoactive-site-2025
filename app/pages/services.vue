<script setup lang="ts">
import Hero from '~/components/services/Hero.vue';
import ServicesList from '~/components/services/ServicesList.vue';
import Stepper from '~/components/services/Stepper.vue';
import OnScrollFilledText from '~/components/ui/OnScrollFilledText.vue';
import useScrollSmoother from '~/composables/useScrollSmoother';

const { enableScroll } = useScrollSmoother();

onMounted(() => {
  setTimeout(() => {
    enableScroll();
  }, 100);
});
</script>

<template>
  <main class="services">
    <!-- <Hero /> -->
    <div class="container">
      <section class="services__onscroll-text">
        <OnScrollFilledText>
          <span class="dark">Our work lives at the intersection of</span> art,
          technology <span class="dark">and</span> strategy.
          <span class="dark">From world-class</span>
          creative direction <span class="dark">to</span> custom code
          <span class="dark">and</span> enterprise-grade Webflow development,
          <span class="dark"
            >we help ambitious brands evolve, scale and lead with
            confidence.</span
          >
        </OnScrollFilledText>
      </section>
    </div>
    <section class="services__list">
      <ServicesList />
    </section>
    <section class="services__stepper">
      <Stepper />
    </section>
  </main>
</template>

<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
.services {
  &__onscroll-text {
    @include flex-center;
    min-height: 100dvh;
    max-width: 57vw;
    margin: auto;
    &:deep(.text-block) {
      &::before {
        content: '';
        display: inline-block;
        width: 10vw;
      }
    }
  }
}
</style>
