<script setup>
import gsap from 'gsap';
import Footer from '~/components/layout/Footer.vue';
import useScrollSmoother from '~/composables/useScrollSmoother';
import useNavigation from '~/composables/useNavigation';
import NewsCard from '~/components/ui/NewsCard.vue';
import DesignAuditPromoCard from '~/components/content-hub/DesignAuditPromoCard.vue';
import useLoader from '~/composables/useLoader';
import useAudioManager from '~/composables/useAudioManager';
import { leaveAnimation, navTransitionOut } from '~/utils/animations/transitions';
import { useMediaQuery } from '@vueuse/core';
import HomeNewsCard from '~/components/homepage/HomeNewsCard.vue';
import useHeader from '~/composables/useHeader';

// Config Strapi variables
const config = useRuntimeConfig();

const { playInteractionSound, isSoundApproved, hasInteracted } = useAudioManager();

const { scrollSmoother } = useScrollSmoother();
const { isLoading, isFirstLoad } = useLoader();
const { showLayoutElementsRequired } = useNavigation();
const isMobile = useMediaQuery('(max-width: 768px)');
const { mode } = useHeader();
const { data: articlesData, error } = await useFetch(`/api/articles`, {
  baseURL: config.public.strapiBaseUrl,
  query: {
    populate: ['category', 'preview', 'work'],
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
      scrollSmoother.value.scrollTo(0, {
        immediate: true,
        lock: true,
        force: true,
      });
      gsap.set(el, { visibility: 'hidden' });
      setTimeout(() => {
        mode.value = 'mixed';
        enterAnimation(el);
      }, 50);
    },
    onLeave: (el, done) => {
      const { transitionFromNavigation } = useNavigation();
      if (transitionFromNavigation.value) {
        navTransitionOut(el, done);
        return;
      }
      leaveAnimation(el, done);
    },
  },
});

function enterAnimation(el) {
  if (isSoundApproved.value && hasInteracted.value)
    playInteractionSound('content-load');
  const isMobile = useMediaQuery('(max-width: 768px)');

  const layoutElements = gsap.utils.toArray([
    '#header-logo',
    '#header-navigation-button',
    '#header-sound-button',
  ]);

  if (el) gsap.set(el, { visibility: 'visible' });

  const timeline = gsap
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
    );
  if (isMobile && isFirstLoad.value) {
    timeline.fromTo(
      document.querySelector('.navigation-mobile'),
      {
        y: 64,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
      },
      '<+=0.5'
    );
  }
  timeline
    .add(() => scrollSmoother.value.start(), '<')
    .add(() => (showLayoutElementsRequired.value = false));
}

const getHref = (news) => {
  if (news.externalLink) {
    return news.externalLink;
  }
  if (news.work && news.work.slug) {
    return `/work/${news.work.slug}`;
  }
  return `/content-hub/${news.slug}`;
};

// Insert the Design Audit promo card after a handful of articles so it
// feels embedded in the content rather than dropped on top. Split the
// article list into "before" and "after" slices at a fixed index.
const PROMO_CARD_POSITION = 4;

const articlesBeforePromo = computed(() =>
  (articlesData.value?.data || []).slice(0, PROMO_CARD_POSITION)
);

const articlesAfterPromo = computed(() =>
  (articlesData.value?.data || []).slice(PROMO_CARD_POSITION)
);

</script>
<template>
  <main class="content-hub">
    <div class="container">
      <h1 class="content-hub__title">Content <sup>HUB</sup></h1>
      <div v-if="articlesData?.data" class="content-hub__grid">
        <template v-if="!isMobile">
          <NewsCard
            v-for="news in articlesBeforePromo"
            :key="news.documentId"
            :data="news"
          />
          <DesignAuditPromoCard />
          <NewsCard
            v-for="news in articlesAfterPromo"
            :key="news.documentId"
            :data="news"
          />
        </template>
        <template v-if="isMobile">
          <HomeNewsCard
            v-for="news in articlesBeforePromo"
            :key="news.documentId"
            :title="news.title"
            :category="news.category?.name"
            :date="news.updatedAt"
            :src="news.preview?.formats?.medium?.url || news.preview?.url"
            :href="getHref(news)"
          />
          <DesignAuditPromoCard />
          <HomeNewsCard
            v-for="news in articlesAfterPromo"
            :key="news.documentId"
            :title="news.title"
            :category="news.category?.name"
            :date="news.updatedAt"
            :src="news.preview?.formats?.medium?.url || news.preview?.url"
            :href="getHref(news)"
          />
        </template>
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
