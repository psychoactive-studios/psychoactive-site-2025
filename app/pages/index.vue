<script setup>
import { useMediaQuery } from '@vueuse/core';
import Hero from '~/components/homepage/Hero.vue';
import HeroMobile from '~/components/homepage/HeroMobile.vue';
import CaseStadyPreview from '~/components/ui/CaseStadyPreview.vue';
import { partnersData } from '~/data/partnersData';

const isMobile = useMediaQuery('(max-width: 768px)');
</script>

<template>
  <main class="homepage">
    <ClientOnly>
      <!-- Hero Section -->
      <section class="hero">
        <Hero v-if="!isMobile" />
        <HeroMobile v-if="isMobile" />
      </section>

      <div class="homepage__content">
        <!-- Partners Section -->
        <section class="partners">
          <div class="container">
            <div class="list">
              <Vue3Marquee
                v-if="isMobile"
                :duration="30"
                :pause-on-hover="true"
              >
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
      </div>
    </ClientOnly>
  </main>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;

.homepage {
  &__content {
    background-color: $color-background;
    position: relative;
    z-index: 1;
  }
}

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
    &:first-child {
      margin-left: 0;
    }
    &:last-child {
      margin-right: 0;
    }
    @include respond(mobile) {
      margin: 0 20px;
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
.cases {
  margin-top: 160px;
}
</style>
