<script setup>
import qs from 'qs';
import { useMediaQuery } from '@vueuse/core';
import Hero from '~/components/homepage/Hero.vue';
import HeroMobile from '~/components/homepage/HeroMobile.vue';
import HomeAwards from '~/components/homepage/HomeAwards.vue';
import HomeNewsList from '~/components/homepage/HomeNewsList.vue';
import CaseStadyPreview from '~/components/ui/CaseStadyPreview.vue';
import HomeOnScrollFilledText from '~/components/homepage/HomeOnScrollFilledText.vue';
import WebflowLabel from '~/components/ui/WebflowLabel.vue';
import ScaleMobileText from '~/assets/img/scale.svg';
import { leaveAnimation } from '~/utils/animations/transitions';
import Footer from '~/components/layout/Footer.vue';
import useLoader from '~/composables/useLoader';
import useScrollSmoother from '~/composables/useScrollSmoother';
import useNavigation from '~/composables/useNavigation';
import gsap from 'gsap';
import PartnersDesktop from '~/components/ui/PartnersDesktop.vue';

const params = qs.stringify({
  populate: {
    works: {
      populate: ['mainImage', 'hero'],
    },
    articles: {
      populate: ['category', 'preview', 'work'],
    },
  },
});

// Config Strapi variables
const config = useRuntimeConfig();

const { data: homePageData, error } = await useFetch(
  `/api/homepage?${params}`,
  {
    baseURL: config.public.strapiBaseUrl,
    headers: {
      Authorization: `Bearer ${config.public.strapiApiKey}`,
    },
    key: `homepage-data`,
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

const { works, articles } = homePageData.value?.data || {};

const { scrollSmoother } = useScrollSmoother();

const isMobile = useMediaQuery('(max-width: 768px)');
const { startLoading } = useLoader();

const worksList = computed(() => {
  const letstalkItem = { id: 'filled-text' };
  const mobileScale = { id: 'mobile-scale' };
  const result = works ? [...works] : [];
  if (isMobile.value) {
    result.splice(3, 0, mobileScale);
    result.splice(6, 0, letstalkItem);
  } else {
    result.splice(3, 0, letstalkItem);
  }
  return result;
});

definePageMeta({
  scrollToTop: true,
  pageTransition: {
    css: false,
    mode: 'out-in',
    onEnter: (_, done) => {
      startLoading();
      scrollSmoother.value.scrollTo(0, {
        immediate: true,
        lock: true,
        force: true,
      });
      done();
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
            <h2 class="partners__title subheader">
              Partner to the world’s leading innovation brands and events
            </h2>
            <PartnersDesktop />
          </div>
        </section>

        <!-- Mobile Digital Text Section -->
        <section v-if="isMobile" class="mobile-digital">
          <div class="container">
            <h2 class="subheader--mobile">Digital First design agency</h2>
            <a href="https://webflow.com/@Psychoactive-Studios" target="_blank">
              <WebflowLabel />
            </a>
          </div>
        </section>

        <section v-if="!isMobile" class="cases">
          <div class="container">
            <template v-for="work in worksList" :key="work.id">
              <!-- Filled Text Section -->
              <section v-if="work.id === 'filled-text'" class="filled-text">
                <HomeOnScrollFilledText>
                  <span class="dark">What sets us apart is our</span>
                  <img src="/img/text-icon-1.svg" alt="icon1" />obsession
                  <span class="dark"
                    >with the moment your audience first encounters your brand
                    online. That split second where</span
                  >
                  <img
                    src="/img/text-icon-2.svg"
                    class="icon-large"
                    alt="icon2"
                  />curiosity
                  <span class="dark">transforms into</span>
                  <img src="/img/text-icon-3.svg" alt="icon3" />connection.
                  <span class="dark"
                    >We don't just build websites; we architect</span
                  >
                  <img src="/img/text-icon-4.svg" alt="icon4" />experiences
                  <span class="dark">that linger in the mind.</span>
                </HomeOnScrollFilledText>
              </section>
              <CaseStadyPreview v-else :data="work" />
            </template>
          </div>
        </section>

        <section v-if="isMobile" class="cases">
          <div class="container">
            <template v-for="work in worksList" :key="work.id">
              <!-- Filled Text Section -->
              <section v-if="work.id === 'filled-text'" class="filled-text">
                <HomeOnScrollFilledText>
                  <span class="dark">What sets us apart is our</span>
                  <img src="/img/text-icon-1.svg" alt="icon1" />obsession
                  <span class="dark"
                    >with the moment your audience first encounters your brand
                    online. That split second where</span
                  >
                  <img
                    src="/img/text-icon-2.svg"
                    class="icon-large"
                    alt="icon2"
                  />curiosity
                  <span class="dark">transforms into</span>
                  <img src="/img/text-icon-3.svg" alt="icon3" />connection.
                  <span class="dark"
                    >We don't just build websites; we architect</span
                  >
                  <img src="/img/text-icon-4.svg" alt="icon4" />experiences
                  <span class="dark">that linger in the mind.</span>
                </HomeOnScrollFilledText>
              </section>

              <!-- Mobile Scale Text Section -->
              <section
                v-else-if="work.id === 'mobile-scale'"
                class="mobile-scale"
              >
                <div class="container">
                  <div class="mobile-scale__imagine display-large--mobile">
                    Imagine
                  </div>
                  <div class="mobile-scale__scale">
                    <ScaleMobileText />
                    <div class="mobile-scale__scale-arrows">
                      <span>&larr;</span><span>&rarr;</span>
                    </div>
                  </div>
                  <div class="mobile-scale__innovate display-large--mobile">
                    Innovate
                  </div>
                </div>
              </section>

              <CaseStadyPreview v-else :data="work" />
            </template>
          </div>
        </section>

        <!-- News Section -->
        <HomeNewsList :data="articles" />

        <!-- Awards Section -->
        <HomeAwards />
      </div>
    </ClientOnly>
    <Footer />
  </main>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/functions' as *;

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
  &__title {
    text-align: center;
    opacity: 0.5;
    margin-bottom: 3vw;
  }
  @include respond(mobile) {
    display: none;
  }
  .container {
    @include respond(mobile) {
      padding: 36px 0 0 0;
    }
  }
}

.mobile-digital {
  padding-top: getRem(42);
  text-align: center;
  h2 {
    line-height: 146%;
    color: white(80);
    margin-bottom: getRem(22);
  }
  a {
    display: inline-block;
  }
}

.mobile-scale {
  margin-top: 60px;
  margin-bottom: 60px;
  &__imagine,
  &__innovate {
    color: $color-grey;
  }
  &__innovate {
    text-align: right;
    margin-top: getRem(26);
  }
  &__scale {
    position: relative;
    svg {
      width: 100%;
      height: auto;
    }
    &-arrows {
      color: $color-grey;
      font-size: 14.67vw;
      line-height: 0.5;
      position: absolute;
      bottom: 100%;
      right: 0;
      letter-spacing: -1.5vw;
    }
  }
}

.cases {
  margin-top: 160px;
  @include respond(mobile) {
    margin-top: 60px;
  }
  & > .container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: 24px;
    row-gap: 80px;
    & > *:nth-child(3n + 1) {
      grid-column: 1 / 3;
    }
    .filled-text {
      grid-column: 1 / 3;
    }
    @include respond(mobile) {
      display: flex;
      flex-direction: column;
      gap: 64px;
    }
  }
}

.mobile-cases-second-part {
  :deep(.case-study-preview) {
    margin-bottom: 64px;
  }
}

.filled-text {
  margin-top: 150px;
  @include respond(mobile) {
    margin-top: 120px;
    margin-bottom: 110px;
  }
}
</style>
