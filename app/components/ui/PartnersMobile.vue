<script setup>
import { partnersData } from '~/data/partnersData';
</script>

<template>
  <Vue3Marquee :duration="30" :pause-on-hover="true" class="partners-mobile">
    <img
      v-for="partner in partnersData"
      :key="partner.id"
      :src="partner.logo"
      :alt="partner.alt || `${partner.name} client logo`"
      :class="partner.id"
      loading="lazy"
      decoding="async"
    />
  </Vue3Marquee>
</template>

<style scoped lang="scss">
.partners-mobile {
  img {
    margin: 0 12px;
  }
  .partner-super-ai {
    width: 104px;
  }
  .partner-adidas {
    width: 98px;
  }
  .partner-ray-white {
    width: 106px;
  }
  .partner-hellboy {
    width: 124px;
  }
  .partner-blackbird {
    width: 113px;
  }
  .partner-wow {
    width: 121px;
  }
  .partner-one {
    width: 124px;
  }
  .partner-all-blacks {
    width: 84px;
  }
  .partner-burgerfuel {
    width: 112px;
  }
  .partner-summer-game {
    width: 90px;
  }
}
</style>
