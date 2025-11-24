<script setup>
import ServicesAccordion from '../ui/ServicesAccordion.vue';

const list = [
  {
    title: 'Webflow Design & Development',
    content:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Animi natus facilis quasi, eligendi autem beatae nemo consequatur magnam hic odit enim odio sed architecto maxime id.',
  },
  {
    title: 'Custom Code & Integrations',
    content:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Animi natus facilis quasi, eligendi autem beatae nemo consequatur magnam hic odit enim odio sed architecto maxime id.',
  },
  {
    title: 'Enterprise Solutions & Scalability',
    content:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Animi natus facilis quasi, eligendi autem beatae nemo consequatur magnam hic odit enim odio sed architecto maxime id.',
  },
  {
    title: 'SEO & AI Optimisation',
    content:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Animi natus facilis quasi, eligendi autem beatae nemo consequatur magnam hic odit enim odio sed architecto maxime id.',
  },
  {
    title: 'Maintenance & Partnership',
    content:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Animi natus facilis quasi, eligendi autem beatae nemo consequatur magnam hic odit enim odio sed architecto maxime id.',
  },
];
</script>

<template>
  <div class="our-services">
    <div class="our-services__accordion">
      <h2>OUR SERVICES</h2>
      <ServicesAccordion :list="list" :default-open="0" />
    </div>
    <div class="our-services__media">
      <NuxtImg
        src="/img/test-webflow-our-services.jpg"
        sizes="100vw md:50vw"
        alt="Our Services Image"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;

.our-services {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: getRem(24);
  &__accordion {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    h2 {
      font-family: 'RoobertMono';
      font-size: 1rem;
      font-style: normal;
      font-weight: 500;
      line-height: 100%; /* 16px */
      text-transform: uppercase;
      color: white(50);
      margin-bottom: 1rem;
    }
  }
  &__media {
    aspect-ratio: 1.31;
    border-radius: getRem(10);
    overflow: hidden;
    background-color: $color-foreground;
    & > * {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}
</style>
