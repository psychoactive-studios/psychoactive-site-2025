<script setup>
import { partnersData } from '~/data/partnersData';
</script>

<template>
  <div class="partners-desktop">
    <NuxtImg
      v-for="partner in partnersData"
      :key="partner.id"
      :src="partner.logo"
      :alt="partner.name"
      :class="partner.id"
    />
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
.partners-desktop {
  display: flex;
  justify-content: space-between;
  align-items: center;
  @include respond(mobile) {
    display: block;
  }
  img {
    height: auto;
    object-fit: contain;
    margin: 0 clamp(8px, 1.042vw, 20px);
    &:first-child {
      margin-left: 0;
    }
    &:last-child {
      margin-right: 0;
    }
  }
  .partner-super-ai {
    width: 6.5%;
  }
  .partner-adidas {
    width: 6.12%;
  }
  .partner-ray-white {
    width: 6.625%;
  }
  .partner-hellboy {
    width: 7.75%;
  }
  .partner-blackbird {
    width: 7.06%;
  }
  .partner-wow {
    width: 7.56%;
  }
  .partner-one {
    width: 7.75%;
  }
  .partner-all-blacks {
    width: 5.25%;
  }
  .partner-burgerfuel {
    width: 7%;
  }
  .partner-summer-game {
    width: 5.62%;
  }
}
</style>
