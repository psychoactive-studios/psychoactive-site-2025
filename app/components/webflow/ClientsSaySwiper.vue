<script setup>
import { Splide, SplideSlide } from '@splidejs/vue-splide';
</script>
<template>
  <Splide
    :options="{ type: 'loop', arrows: false }"
    aria-label="My Favorite Images"
  >
    <SplideSlide> 111111 </SplideSlide>
    <SplideSlide> 222222 </SplideSlide>
  </Splide>
</template>
<style></style>
