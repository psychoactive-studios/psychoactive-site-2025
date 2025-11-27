<script setup>
import { Splide, SplideSlide } from '@splidejs/vue-splide';
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll';
import ClientsSaySlide from './ClientsSaySlide.vue';
import { clientsData } from '~/data/clientsData';
</script>
<template>
  <Splide
    :extensions="{ AutoScroll }"
    :options="{
      type: 'loop',
      drag: 'free',
      focus: 'center',
      perPage: 2,
      gap: 20,
      arrows: false,
      pagination: false,
      autoScroll: {
        speed: 1,
        pauseOnHover: true,
        pauseOnFocus: false,
      },
      breakpoints: {
        1200: {
          perPage: 1,
        },
        768: {
          drag: true,
          gap: 16,
          autoScroll: false,
        },
      },
    }"
    aria-label="Clients testimonials"
    class="clients-swiper"
  >
    <SplideSlide v-for="client in clientsData" :key="client.id">
      <ClientsSaySlide :client="client" />
    </SplideSlide>
  </Splide>
</template>
<style scoped lang="scss">
.clients-swiper {
  &:deep(.splide__track) {
    overflow: visible;
  }
}
</style>
