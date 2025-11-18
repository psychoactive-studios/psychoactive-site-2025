<script setup>
import gsap from 'gsap';
import Footer from '~/components/layout/Footer.vue';
import useScrollSmoother from '~/composables/useScrollSmoother';
import useNavigation from '~/composables/useNavigation';
import NewsCard from '~/components/ui/NewsCard.vue';
import useLoader from '~/composables/useLoader';

import { leaveAnimation } from '~/utils/animations/transitions';

// Config Strapi variables
const config = useRuntimeConfig();

const { transitionFromNavigation } = useNavigation();
const { scrollSmoother } = useScrollSmoother();
const { isLoading } = useLoader();

const { data: articlesData, error } = await useFetch(`/api/articles`, {
  baseURL: config.public.strapiBaseUrl,
  query: {
    populate: ['category', 'preview'],
  },
  headers: {
    Authorization: `Bearer ${config.public.strapiApiKey}`,
  },
  key: `article-list`,
  // Get cached data to prevent refetching
  getCachedData(key) {
    const nuxtApp = useNuxtApp();
    const data = nuxtApp.payload.data[key] || nuxtApp.static.data[key];
    if (data) {
      return data;
    }
  },
});

if (error.value) {
  console.error('Error fetching article data:', error.value);
}

console.log('articlesData', articlesData.value);

watch(isLoading, (loading) => {
  if (!loading) {
    enterAnimation();
  }
});

definePageMeta({
  scrollToTop: true,
  pageTransition: {
    css: false,
    mode: 'out-in',
    onEnter: (el, done) => {
      done();
      scrollSmoother.value.scrollTop(0, false);
      gsap.set(el, { visibility: 'hidden' });
      setTimeout(() => {
        enterAnimation(el);
      }, 50);
    },
    onLeave: (el, done) => {
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

function enterAnimation(el) {
  const layoutElements = gsap.utils.toArray([
    '#header-logo',
    '#header-navigation-button',
    '#header-sound-button',
  ]);

  if (el) gsap.set(el, { visibility: 'visible' });

  gsap
    .timeline()
    .from('.content-hub .content-hub__title', {
      y: 400,
      opacity: 0,
      duration: 1.2,
      ease: 'power4.out',
    })
    .from(
      '.content-hub .content-hub__grid > *',
      {
        y: '100vh',
        duration: 1.2,
        ease: 'power4.out',
        stagger: 0.1,
      },
      '<+=0.3'
    )
    .to(
      layoutElements,
      { scale: 1, opacity: 1, duration: 0.75, ease: 'power3.out' },
      '<+=1'
    )
    .add(() => scrollSmoother.value.paused(false), '<');
}
</script>
<template>
  <main class="content-hub">
    <div class="container">
      <h1 class="content-hub__title">Content <sup>HUB</sup></h1>
      <div v-if="articlesData?.data" class="content-hub__grid">
        <NewsCard
          v-for="news in articlesData?.data"
          :key="news.documentId"
          :data="news"
        />
      </div>
      <div v-else class="no-data">
        <p>Something went wrong.</p>
        <p>No data available.</p>
      </div>
    </div>
    <Footer />
  </main>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;

.content-hub {
  padding-top: 160px;
  @include respond('mobile') {
    padding-top: 24px;
  }
  &__title {
    font-size: clamp(96px, 6.25vw, 120px);
    font-style: normal;
    font-weight: 400;
    line-height: 100%;
    letter-spacing: -0.06em;
    margin-bottom: 160px;
    @include respond('mobile') {
      font-size: max(24px, 6.4vw);
      margin-bottom: 120px;
    }
    sup {
      font-family: 'RoobertMono';
      font-size: 0.167em;
      font-style: normal;
      font-weight: 500;
      line-height: 150%;
      letter-spacing: 0.6px;
      vertical-align: top;
      margin-top: 0.7em;
      display: inline-block;
      color: white(80);
    }
  }
  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: getRem(20);
    margin-bottom: 120px;
    @include respond('mobile') {
      grid-template-columns: 1fr;
    }
  }
}
.no-data {
  @include flex-center;
  font-size: 48px;
  flex-direction: column;
  padding: 20vh 0;
  opacity: 0.5;
}
</style>
