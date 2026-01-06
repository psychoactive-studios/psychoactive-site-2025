<script setup>
import { Splide, SplideSlide } from '@splidejs/vue-splide';
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll';
import ClientsSaySlide from './ClientsSaySlide.vue';

const containerRef = ref(null);

defineProps({
  data: {
    type: Array,
    required: true,
  },
});

onBeforeUnmount(() => {
  const originalSlider = containerRef.value.root;
  const clonedSlider = containerRef.value.root.cloneNode(true);
  originalSlider.replaceWith(clonedSlider);
});
</script>
<template>
  <Splide
    ref="containerRef"
    :extensions="{ AutoScroll }"
    :options="{
      type: 'loop',
      drag: true,
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
    <SplideSlide v-for="feedback in data" :key="feedback.id">
      <ClientsSaySlide :feedback="feedback" />
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
