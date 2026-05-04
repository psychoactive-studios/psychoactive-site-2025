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
import { leaveAnimation, navTransitionOut } from '~/utils/animations/transitions';
import Footer from '~/components/layout/Footer.vue';
import useLoader from '~/composables/useLoader';
import useScrollSmoother from '~/composables/useScrollSmoother';
import useNavigation from '~/composables/useNavigation';
import gsap from 'gsap';
import PartnersDesktop from '~/components/ui/PartnersDesktop.vue';
import WebflowBlackLabel from '~/components/ui/WebflowBlackLabel.vue';
import HomeStats from '~/components/homepage/HomeStats.vue';
import SectionDivider from '~/components/ui/SectionDivider.vue';
import SectionMoreLink from '~/components/ui/SectionMoreLink.vue';

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

// Reactive wrappers around the Strapi response. Using computed refs
// means the UI re-renders when homePageData.value populates — critical
// on cold page loads where the external _payload.json is fetched
// asynchronously and setup runs before the data has landed.
const works = computed(() => homePageData.value?.data?.works || []);
const articles = computed(() => homePageData.value?.data?.articles || []);

const { scrollSmoother } = useScrollSmoother();

const isMobile = useMediaQuery('(max-width: 768px)');
const { startLoading } = useLoader();

// Mobile keeps its existing iteration with the mobile-scale text
// marker. The intro paragraph is no longer inserted into either
// iteration — it's now rendered as a dedicated SSR section
// (mobile-intro under the hero, desktop-intro between the two
// case-study halves).
const worksList = computed(() => {
  const mobileScale = { id: 'mobile-scale' };
  const result = works.value.length ? [...works.value] : [];
  if (isMobile.value) {
    result.splice(3, 0, mobileScale);
  }
  return result;
});

// Desktop case studies are split into two grids so an SSR-rendered
// intro paragraph can sit between them. First three case studies in
// `worksFirst`, the rest in `worksRest`.
const DESKTOP_CASES_BEFORE_INTRO = 3;
const worksFirst = computed(() =>
  works.value.slice(0, DESKTOP_CASES_BEFORE_INTRO)
);
const worksRest = computed(() =>
  works.value.slice(DESKTOP_CASES_BEFORE_INTRO)
);

// Homepage uses the global meta defaults defined in nuxt.config.ts
// (DEFAULT_TITLE / DEFAULT_DESCRIPTION). No per-page override needed —
// the homepage IS the canonical use of those defaults.

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
        navTransitionOut(el, done);
        return;
      }
      leaveAnimation(el, done);
    },
  },
});
</script>

<template>
  <main class="homepage">
    <!-- Pre-rendered headline. Visually hidden because the visual hero
         (3D scene + animated marks) serves as the human-facing identity.
         This h1 is what crawlers, audit tools, and screen readers see. -->
    <h1 class="sr-only">
      Psychoactive Studios — AI-era design and development agency for
      ambitious brands.
    </h1>

    <!-- Hero stays inside ClientOnly because of the 3D scene, GSAP
         timelines, video player, and scroll-triggered animations. -->
    <ClientOnly>
      <section class="hero">
        <Hero v-if="!isMobile" />
        <HeroMobile v-if="isMobile" />
      </section>
    </ClientOnly>

    <!-- Mobile-only intro paragraph, sits directly under the hero.
         Rendered SSR so it's also picked up by crawlers. Hidden on
         desktop via CSS — the desktop version still appears between
         case studies (animated, inside ClientOnly) so the existing
         desktop design is preserved. -->
    <section class="mobile-intro">
      <div class="container">
        <HomeOnScrollFilledText>
          <span class="dark">We work at the intersection of</span>
          design, technology, and strategy,
          <span class="dark">building</span>
          high performance
          <span class="dark"
            >websites and digital experiences for some of the world’s most</span
          >
          ambitious brands.
          <span class="dark"
            >From sold-out global events seen by millions, to award-winning brand platforms and AI-era digital experiences,</span
          >
          we’re completely obsessed.
        </HomeOnScrollFilledText>
      </div>
    </section>

    <div class="homepage__content">
      <!-- Partners — rendered server-side so the audit tool / Google /
           LinkedIn previews see the client logo strip. The component
           itself is purely declarative (just <img> tags) so it's
           SSR-safe with no hydration risk.
           No visible heading — the logos communicate the point on
           their own. An sr-only h2 keeps the document outline tidy
           for screen readers and crawlers. -->
      <section class="partners" aria-labelledby="partners-heading">
        <div class="container">
          <h2 id="partners-heading" class="sr-only">
            Selected clients
          </h2>
          <PartnersDesktop />
        </div>
      </section>

      <!-- Subtle divider between the logos and the stats. Brand-pattern
           thin line with a dot at each end. Sits inside .container so
           the line spans the same gutter as the stats below. -->
      <div class="partners-stats-divider">
        <div class="container">
          <SectionDivider />
        </div>
      </div>

      <!-- Stats strip — three real numbers from headline projects.
           SSR-rendered for trust signals visible to crawlers. Mirrors
           the treatment used on the Webflow page. -->
      <HomeStats />

      <ClientOnly>
        <!-- Mobile Digital Text Section -->
        <section v-if="isMobile" class="mobile-digital">
          <div class="container">
            <h2 class="subheader--mobile">
              AI-era design and development<br>
              for ambitious brands
            </h2>
            <NuxtLink
              href="/webflow-enterprise-agency"
              @mouseenter="() => playInteractionSound('text-hover-short', 100)"
              @click="() => playInteractionSound('click-1')"
            >
              <!-- <WebflowLabel class="top-text__label" /> -->
              <WebflowBlackLabel class="top-text__label" />
            </NuxtLink>
          </div>
        </section>

        <!-- Desktop: first half of case studies. Wrapped in ClientOnly
             via the parent above; the intro paragraph below sits
             OUTSIDE this block so it renders in SSR. -->
        <section v-if="!isMobile" class="cases cases--top">
          <div class="container">
            <CaseStadyPreview
              v-for="work in worksFirst"
              :key="work.id"
              :data="work"
            />
          </div>
        </section>
      </ClientOnly>

      <!-- Desktop intro paragraph — SSR-rendered, sits between the two
           case-study grids. Hidden on mobile (mobile uses .mobile-intro
           under the hero instead). -->
      <section class="desktop-intro">
        <div class="container">
          <HomeOnScrollFilledText>
            <span class="dark">We work at the intersection of</span>
            design, technology, and strategy,
            <span class="dark">building</span>
            high performance
            <span class="dark"
              >websites and digital experiences for some of the world’s most</span
            >
            ambitious brands.
            <span class="dark"
              >From sold-out global events seen by millions, to award-winning brand platforms and AI-era digital experiences,</span
            >
            we’re completely obsessed.
          </HomeOnScrollFilledText>
        </div>
      </section>

      <ClientOnly>
        <!-- Desktop: remaining case studies. Same .cases grid styling
             as the top block. -->
        <section v-if="!isMobile" class="cases cases--rest">
          <div class="container">
            <CaseStadyPreview
              v-for="work in worksRest"
              :key="work.id"
              :data="work"
            />
          </div>
        </section>

        <section v-if="isMobile" class="cases">
          <div class="container">
            <template v-for="work in worksList" :key="work.id">
              <!-- Mobile Scale Text Section -->
              <section
                v-if="work.id === 'mobile-scale'"
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

        <!-- "View our work" CTA — sits under the case studies on both
             desktop and mobile. Mirrors the "Explore Our Content Hub"
             treatment used under the news list. Gives visitors a clear
             route to the full /work page directly from the homepage. -->
        <section class="work-more">
          <div class="container">
            <SectionMoreLink href="/work" label="View all work" />
          </div>
        </section>

        <!-- News Section -->
        <HomeNewsList :data="articles" />
        <!-- Awards Section -->
        <HomeAwards />
      </ClientOnly>
    </div>
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

// Mobile-only intro paragraph that sits directly under the hero.
// Hidden on desktop (the desktop layout still shows the animated
// intro paragraph between case studies). Rendered SSR so it's also
// picked up by crawlers on mobile.
.mobile-intro {
  display: none;

  @include respond(mobile) {
    display: block;
    position: relative;
    z-index: 1;
    background-color: $color-background;
    padding: getRem(60) 0 getRem(40);
  }
}

.partners {
  position: relative;
  z-index: 1;
  background-color: $color-background;
  // Logos sit within the standard .container gutter (matches the rest
  // of the page content). The dropped headline used to add 3vw bottom
  // margin between caption and logos — keeping a similar amount of
  // top breathing room here so the section doesn't crash into the
  // hero above.
  padding-top: 4vw;
  @include respond(mobile) {
    display: none;
  }
}

// Container for the section divider that sits between the partner
// logos and the stats strip. Uses the standard .container inside so
// the divider line matches the stats content gutter below — nicely
// contrasting against the wider logo strip.
.partners-stats-divider {
  position: relative;
  z-index: 1;
  background-color: $color-background;
  padding: getRem(64) 0 0;

  @include respond(mobile) {
    display: none;
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

// Second cases grid (sits below the SSR desktop intro paragraph).
// Two things going on:
//   1. Strip the top margin — the .desktop-intro section already has
//      160px bottom padding so we don't need to double up.
//   2. Restore the tile rhythm. Splitting the cases section into two
//      grids resets the nth-child counter, so without overriding the
//      default the first tile of cases--rest would render full-width
//      and every subsequent tile would shift. Andrew confirmed the
//      desired post-intro order: case 4 + case 5 on one row, case 6
//      (WOW) full-width, case 7 + case 8 on the next row.
//
// IMPORTANT: this block must come AFTER the .cases > .container >
// *:nth-child(3n + 1) rule above. Both selectors have the same
// specificity (single class), so source order is what makes the
// override win.
// "View all work" CTA — sits between the cases grid and the news
// list. Generous space above (rhythm with the cases section) and
// the news list below has been retuned so the news cards sit close
// to symmetrically between this CTA and the content-hub CTA below.
.work-more {
  margin-top: 160px;
  @include respond(mobile) {
    margin-top: getRem(80);
  }
}

.cases.cases--rest {
  margin-top: 0;
  & > .container {
    & > *:nth-child(3n + 1) {
      grid-column: auto;
    }
    & > *:nth-child(3n) {
      grid-column: 1 / 3;
    }
  }
}

// Desktop-only SSR intro paragraph that sits between the two
// case-study grids. Hidden on mobile (mobile uses .mobile-intro
// directly under the hero). 160px vertical spacing matches the
// original .filled-text positioning before the cases grid was split —
// horizontal padding is already handled by HomeOnScrollFilledText.
.desktop-intro {
  position: relative;
  z-index: 1;
  background-color: $color-background;
  padding: 160px 0;

  @include respond(mobile) {
    display: none;
  }
}

.mobile-cases-second-part {
  :deep(.case-study-preview) {
    margin-bottom: 64px;
  }
}

.filled-text {
  margin-top: 160px;
  margin-bottom: 160px;
  @include respond(mobile) {
    margin-top: 120px;
    margin-bottom: 110px;
  }
}
</style>
