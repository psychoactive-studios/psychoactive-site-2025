<script setup>
import { partnersData } from '~/data/partnersData';
</script>

<template>
  <Vue3Marquee :duration="30" :pause-on-hover="true">
    <NuxtImg
      v-for="partner in partnersData"
      :key="partner.id"
      :src="partner.logo"
      :alt="partner.name"
      :class="partner.id"
    />
  </Vue3Marquee>
</template>
