<script setup>
import { useMediaQuery } from '@vueuse/core';
import Hero from '~/components/homepage/Hero.vue';
import HeroMobile from '~/components/homepage/HeroMobile.vue';
import CaseStadyPreview from '~/components/ui/CaseStadyPreview.vue';
import { partnersData } from '~/data/partnersData';
import { useLoader } from '~/composables/useLoader';
import useScrollSmoother from '~/composables/useScrollSmoother';

const isMobile = useMediaQuery('(max-width: 768px)');

// TODO: Remove when loader is removed
const { stopLoading } = useLoader();
const { enableScroll } = useScrollSmoother();

onMounted(() => {
  stopLoading();
  setTimeout(enableScroll, 1000);
});
</script>

<template>
  <main class="homepage">
    <ClientOnly>
      <!-- Hero Section -->
      <section class="hero">
        <!-- <Hero v-if="!isMobile" /> -->
        <!-- <HeroMobile v-if="isMobile" /> -->
      </section>

      <!-- Partners Section -->
      <section class="partners">
        <div class="container">
          <div class="list">
            <Vue3Marquee v-if="isMobile" :duration="30" :pause-on-hover="true">
              <NuxtImg
                v-for="partner in partnersData"
                :key="partner.id"
                :src="partner.logo"
                :alt="partner.name"
                :class="partner.id"
              />
            </Vue3Marquee>
            <NuxtImg
              v-for="partner in partnersData"
              v-else
              :key="partner.id"
              :src="partner.logo"
              :alt="partner.name"
              :class="partner.id"
            />
          </div>
        </div>
      </section>

      <!-- Cases Section -->
      <section class="cases">
        <div class="container">
          <CaseStadyPreview />
        </div>
      </section>
    </ClientOnly>
  </main>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;

.partners {
  position: relative;
  z-index: 1;
  background-color: $color-background;
  .container {
    @include respond(mobile) {
      padding: 36px 0 0 0;
    }
  }
  .list {
    display: flex;
    justify-content: space-between;
    align-items: center;
    @include respond(mobile) {
      display: block;
    }
  }
  img {
    height: auto;
    object-fit: contain;
    margin: 0 20px;
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
.cases {
  margin-top: 160px;
}
</style>
