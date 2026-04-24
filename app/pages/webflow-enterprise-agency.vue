<script setup>
import gsap from 'gsap';
import qs from 'qs';
import Footer from '~/components/layout/Footer.vue';
import OnScrollFilledText from '~/components/ui/OnScrollFilledText.vue';
import PartnersDesktop from '~/components/ui/PartnersDesktop.vue';
import CasesSwiper from '~/components/webflow/CasesSwiper.vue';
import ClientsSaySwiper from '~/components/webflow/ClientsSaySwiper.vue';
import Hero from '~/components/webflow/Hero.vue';
import Services from '~/components/webflow/Services.vue';
import Statistics from '~/components/webflow/Statistics.vue';
import Timeline from '~/components/webflow/Timeline.vue';
import VideoReel from '~/components/webflow/VideoReel.vue';
import WatsUs from '~/components/webflow/WatsUs.vue';
import useScrollSmoother from '~/composables/useScrollSmoother';
import useLoader from '~/composables/useLoader';
import useNavigation from '~/composables/useNavigation';
import { leaveAnimation } from '~/utils/animations/transitions';
import { useMediaQuery } from '@vueuse/core';
import VideoReelMobile from '~/components/webflow/VideoReelMobile.vue';
import PartnersMobile from '~/components/ui/PartnersMobile.vue';

const params = qs.stringify({
  populate: {
    works: {
      populate: ['mainImage', 'hero'],
    },
    feedbacks: {
      populate: {
        client: {
          populate: ['photo'],
        },
      },
    },
    services: '*',
    whatSetsUsApart: '*',
  },
});

// Config Strapi variables
const config = useRuntimeConfig();

const { data: webflowPageData, error } = await useFetch(
  `/api/webflow?${params}`,
  {
    baseURL: config.public.strapiBaseUrl,
    headers: {
      Authorization: `Bearer ${config.public.strapiApiKey}`,
    },
    key: `webflow-page-data`,
    // Get cached data to prevent refetching
    getCachedData(key) {
      const nuxtApp = useNuxtApp();
      const data = nuxtApp.payload.data[key] || nuxtApp.static.data[key];
      if (data) {
        return data;
      }
    },
  }
);

if (error.value) {
  console.error('Error fetching article data:', error.value);
}

const { works, feedbacks, services, whatSetsUsApart } =
  webflowPageData.value?.data || {};

const { scrollSmoother } = useScrollSmoother();
const { startLoading } = useLoader();

const isMobile = useMediaQuery('(max-width: 768px)');

useSeoMeta({
  title: 'Webflow Enterprise Agency | Psychoactive Studios',
  description:
    "New Zealand's first Premium Webflow Enterprise Partner. AI-era Webflow development for global brands. Performance, animation, and custom code at scale.",
  ogTitle: 'Webflow Enterprise Agency | Psychoactive Studios',
  ogDescription:
    "New Zealand's first Premium Webflow Enterprise Partner. AI-era Webflow development for global brands. Performance, animation, and custom code at scale.",
});

definePageMeta({
  scrollToTop: true,
  pageTransition: {
    css: false,
    mode: 'out-in',
    onEnter: (_, done) => {
      startLoading();
      setTimeout(() => {
        scrollSmoother.value.scrollTo(0, {
          immediate: true,
          lock: true,
          force: true,
        });
        done();
      }, 50);
    },
    onLeave: (el, done) => {
      const { transitionFromNavigation } = useNavigation();
      if (transitionFromNavigation.value) {
        gsap
          .timeline()
          .set(el, { opacity: 0 })
          .add(() => {
            transitionFromNavigation.value = false;
            done();
          }, '+=1');
        return;
      }
      leaveAnimation(el, done);
    },
  },
});
</script>

<template>
  <main class="webflow">
    <ClientOnly>
      <Hero />
      <div class="container">
        <section class="webflow__onscroll-text">
          <OnScrollFilledText>
            <p>
              Webflow development <span class="dark">for</span> innovative
              brands.
            </p>
            <p>
              Custom code <span class="dark">and</span> enterprise-grade builds,
              <span class="dark">crafted for</span>
              performance, scalability <span class="dark">and</span> visibility
              <span class="dark">in an AI-driven world</span>.
            </p>
          </OnScrollFilledText>
        </section>
      </div>
      <section class="webflow__video-reels">
        <div v-if="!isMobile" class="container">
          <VideoReel />
        </div>
        <VideoReelMobile v-if="isMobile" />
      </section>
      <div class="container">
        <section v-if="!isMobile" class="webflow__timeline">
          <Timeline />
        </section>
        <section v-if="services" class="webflow__services">
          <Services :data="services" />
        </section>
      </div>
      <section class="webflow__partners">
        <div v-if="!isMobile" class="container">
          <h2 class="webflow__partners_title--desktop subheader">
            Partner to the world’s leading innovation brands and events
          </h2>
          <PartnersDesktop />
        </div>
        <div v-if="isMobile">
          <div class="container">
            <h2 class="webflow__partners_title--mobile subheader--mobile">
              Partner to the world’s leading innovation brands and events
            </h2>
          </div>
          <PartnersMobile />
        </div>
      </section>
      <div class="container">
        <section v-if="works" class="webflow__cases">
          <CasesSwiper :data="works" />
        </section>

        <section class="webflow__statistics">
          <Statistics />
        </section>

        <section class="webflow__clients-say">
          <ClientsSaySwiper v-if="feedbacks" :data="feedbacks" />
        </section>
      </div>

      <section class="webflow__sets-us">
        <WatsUs v-if="whatSetsUsApart" :data="whatSetsUsApart" />
      </section>
    </ClientOnly>
    <Footer />
  </main>
</template>

<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/functions' as *;
.webflow {
  &__onscroll-text {
    display: flex;
    align-items: center;
    min-height: 100svh;
    max-width: 56vw;
    margin: 0 auto;
    text-align: center;
    @include respond(mobile) {
      min-height: auto;
      max-width: initial;
      margin-top: getRem(80);
    }
  }
  &__video-reels {
    @include respond(mobile) {
      margin-top: 52px;
    }
  }
  &__services {
    @include flex-center;
    min-height: 100svh;
    @include respond(mobile) {
      margin-top: 120px;
      min-height: auto;
    }
  }
  &__partners {
    @include respond(mobile) {
      margin-top: 120px;
    }
    &_title {
      &--desktop {
        margin-bottom: 2.5vw;
        text-align: center;
        color: white(50);
      }
      &--mobile {
        text-align: center;
        color: white(50);
        margin-bottom: 24px;
      }
    }
  }
  &__cases {
    margin-top: 160px;
    @include flex-center;
    min-height: 100svh;
    @include respond(mobile) {
      min-height: auto;
      margin-top: 120px;
      padding-right: 24px;
    }
  }
  &__statistics {
    margin-top: 80px;
    @include respond(mobile) {
      margin-top: 60px;
    }
  }
  &__clients-say {
    margin: 160px -112px 0 -112px;
    @include respond(laptop) {
      margin: 120px auto 0 auto;
    }
    @include respond(mobile) {
      margin-top: 64px;
      padding-right: 10%;
    }
  }
  &__sets-us {
    margin-top: 240px;
    margin-bottom: 100px;
    @include respond(mobile) {
      margin-top: 64px;
      margin-bottom: 0;
    }
  }
}
</style>
