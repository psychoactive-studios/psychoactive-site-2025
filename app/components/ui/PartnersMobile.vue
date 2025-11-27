<script setup>
import { partnersData } from '~/data/partnersData';
</script>

<template>
  <Vue3Marquee :duration="30" :pause-on-hover="true" class="partners-mobile">
    <NuxtImg
      v-for="partner in partnersData"
      :key="partner.id"
      :src="partner.logo"
      :alt="partner.name"
      :class="partner.id"
    />
  </Vue3Marquee>
</template>

<style scoped lang="scss">
.partners-mobile {
  img {
    margin: 0 12px;
  }
}
</style>
