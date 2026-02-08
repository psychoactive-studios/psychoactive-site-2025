<script setup>
import gsap from 'gsap';

import Brief from '~/components/layout/Brief.vue';
import useNavigation from '~/composables/useNavigation';
import useLoader from '~/composables/useLoader';
import useHeader from '~/composables/useHeader';
import useWorks from '~/composables/useWorks';

import { useMediaQuery } from '@vueuse/core';
import LinkButton from '~/components/ui/LinkButton.vue';
import WorkArticleContent from '~/components/work/WorkArticleContent.vue';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Config Strapi variables
const config = useRuntimeConfig();

const isMobile = useMediaQuery('(max-width: 768px)');
const { isLoading } = useLoader();
const { workPageInit, footerTextAnimationInit } = useWorks();
const { mode } = useHeader();

const illustrationRef = ref(null);
const footerScrollTextRef = ref(null);

const { params } = useRoute();

const { data: workData, error } = await useFetch(`/api/works/${params.slug}`, {
  baseURL: config.public.strapiBaseUrl,
  headers: {
    Authorization: `Bearer ${config.public.strapiApiKey}`,
  },
  key: `work-${params.slug}`,
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
  console.error('Error fetching work data:', error.value);
}

const { mainTitle, mainImage, hero, article } = workData?.value?.data || {};

watch(isLoading, (newVal) => {
  if (!newVal) {
    workPageInit();
  }
});

let ctx;

onMounted(async () => {
  ctx = gsap.context(() => {});
  await nextTick();
  animationsInit(ctx);
  footerTextAnimationInit(ctx, footerScrollTextRef.value);
  mode.value = 'light';
  console.log('onMounted');
});

onUnmounted(() => {
  ctx.revert();
});

definePageMeta({
  scrollToTop: true,
  pageTransition: {
    css: false,
    mode: 'out-in',
    onEnter: (_, done) => {
      const { showLayoutElementsRequired } = useNavigation();
      const { workPageInit } = useWorks();
      done();
      workPageInit(ctx);
      console.log('onEnter');
      showLayoutElementsRequired.value = false;
    },
    onLeave: (el, done) => {
      const { transitionFromNavigation } = useNavigation();
      const { mode } = useHeader();
      if (transitionFromNavigation.value) {
        gsap
          .timeline()
          .set(el, { opacity: 0 })
          .set('#work-scroll-progress', { display: 'none' })
          .add(() => {
            transitionFromNavigation.value = false;
            mode.value = 'mixed';
            done();
          }, '+=1');
        return;
      }
      gsap
        .timeline()
        .to(el, {
          opacity: 0,
          duration: 0.8,
          ease: 'power4.in',
        })
        .to(
          '#work-scroll-progress',
          {
            scale: 0,
            // opacity: 0,
            duration: 0.8,
            ease: 'power3.in',
          },
          '<'
        )
        .set('#work-scroll-progress', { display: 'none' })
        .add(() => {
          mode.value = 'mixed';
          done();
        }, '+=0.1');
    },
  },
});

function animationsInit(ctx) {
  ctx.add(() => {
    ScrollTrigger.create({
      trigger: illustrationRef.value,
      start: 'top top',
      end: 'bottom 104px',
      invalidateOnRefresh: true,
      markers: true,
      onLeave: () => {
        console.log('onLeave');
        mode.value = 'dark';
      },
      onEnterBack: () => {
        console.log('onEnterBack');
        mode.value = 'light';
      },
    });

    // Scroll progress circle animation
    if (!isMobile.value) {
      gsap.to('#work-scroll-progress', {
        '--work-scroll-progress': 100,
        scrollTrigger: {
          scrub: true,
          start: 'top top',
          end: 'bottom top',
          invalidateOnRefresh: true,
        },
      });
    }
  });
}
</script>
<template>
  <main v-if="workData?.data" class="work">
    <div class="work__header--desktop">
      <!-- Illustration section -->
      <section ref="illustrationRef" class="work__illustration">
        <img :src="mainImage.url" alt="SuperAI Conference Illustration" />
      </section>

      <!-- Hero section -->
      <section class="work__hero">
        <div class="container">
          <h1 class="work__hero_title">{{ mainTitle }}</h1>
          <div class="work__hero_sub-title">{{ hero?.subTitle }}</div>
          <ul class="work__hero_info">
            <li><span>WHAT WE DID:</span> {{ hero?.whatWeDid }}</li>
            <li><span>CLIENT:</span> {{ hero?.client }}</li>
          </ul>
          <div class="work__hero_link">
            <LinkButton
              v-if="hero?.websiteLink"
              :href="hero?.websiteLink"
              mode="dark"
            >
              launch website
            </LinkButton>
          </div>
          <div class="work__hero_description">
            <p v-for="(para, index) in hero?.description" :key="index">
              {{ para.children[0].text }}
            </p>
          </div>
        </div>
      </section>
    </div>

    <div class="work__header--mobile">
      <section class="work__hero">
        <div class="container">
          <h1 class="work__hero_title">{{ mainTitle }}</h1>
          <div class="work__hero_sub-title">{{ hero?.subTitle }}</div>
          <ul class="work__hero_info">
            <li><span>WHAT WE DID:</span> {{ hero?.whatWeDid }}</li>
            <li><span>CLIENT:</span> {{ hero?.client }}</li>
          </ul>
          <div class="work__illustration">
            <img :src="mainImage.formats.medium.url" :alt="mainTitle" />
            <div class="work__illustration_bg" />
          </div>
        </div>
      </section>
      <div class="work__hero_link">
        <LinkButton href="https://superai.com" mode="dark">
          launch website
        </LinkButton>
      </div>
      <div class="container">
        <div class="work__hero_description">
          <p v-for="(para, index) in hero?.description" :key="index">
            {{ para.children[0].text }}
          </p>
        </div>
      </div>
    </div>

    <WorkArticleContent :data="article" :website-link="hero?.websiteLink" />

    <!-- Footer section -->
    <footer class="work__footer">
      <div class="work__footer_brief">
        <Brief />
      </div>
      <div class="work__footer_scroll">
        <div class="container">
          <h2 ref="footerScrollTextRef">Scroll to go back to work page</h2>
        </div>
      </div>
    </footer>
  </main>
  <div v-else class="no-data">
    <p>Something went wrong.</p>
    <p>No data available.</p>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;
.work {
  background-color: $color-foreground;
  color: $color-background;
  &__header {
    &--desktop {
      .work__illustration {
        position: relative;
        width: 100%;
        height: 100dvh;
        overflow: hidden;
        z-index: 2;

        img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }
      }
      .work__hero {
        padding: 120px 0;
        &_title {
          font-size: 8.33333vw;
          font-style: normal;
          font-weight: 400;
          line-height: 100%;
          letter-spacing: -0.07em;
        }
        &_sub-title {
          margin-top: 4.166666vw;
          font-size: 1.666666vw;
          font-style: normal;
          font-weight: 400;
          line-height: 112.5%;
          max-width: 50%;
        }
        &_info {
          margin-top: 2.5vw;
          font-family: 'RoobertMono';
          font-size: max(0.833333vw, 14px);
          font-style: normal;
          font-weight: 500;
          line-height: 100%;
          text-transform: uppercase;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 50%;
          span {
            opacity: 0.6;
          }
        }
        &_link {
          margin-top: 40px;
          .link-button {
            width: 222px;
          }
        }
        &_description {
          max-width: 47%;
          margin-left: auto;
          margin-top: 16px;
          font-size: max(1.25vw, 18px);
          font-style: normal;
          font-weight: 400;
          line-height: 125%;
          & > *:first-child {
            &::before {
              content: '';
              display: inline-block;
              width: 3.9vw;
            }
          }
          p {
            margin-bottom: 1.5em;
            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
      @include respond(mobile) {
        display: none;
      }
    }
    &--mobile {
      display: none;
      @include respond(mobile) {
        display: block;
        .work__hero {
          padding-top: 30px;
          background-color: $color-background;
          color: $color-foreground;
          &_title {
            font-size: max(8.53333vw, 32px);
            line-height: 121%;
            letter-spacing: -0.03em;
            margin-bottom: 6.4vw;
          }
          &_sub-title {
            font-size: max(6.4vw, 24px);
            font-style: normal;
            font-weight: 400;
            line-height: 121%;
            letter-spacing: -0.02em;
            margin-bottom: 6.4vw;
          }
          &_info {
            font-family: 'RoobertMono';
            font-size: max(3.2vw, 12px);
            font-style: normal;
            font-weight: 500;
            line-height: 100%;
            text-transform: uppercase;
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 120px;
            span {
              opacity: 0.6;
            }
          }
          &_description {
            position: relative;
            margin-top: 60px;
            font-size: 4.27vw;
            font-style: normal;
            font-weight: 400;
            line-height: 140%; /* 22.4px */

            & > *:first-child {
              &::before {
                content: '';
                display: inline-block;
                width: 10vw;
              }
            }
            p {
              margin-bottom: 1.5em;
              &:last-child {
                margin-bottom: 0;
              }
            }
          }
        }
        .work__illustration {
          position: relative;
          isolation: isolate;
          margin-bottom: 6.4vw;
          img {
            width: 100%;
            height: auto;
            border-radius: getRem(6);
            display: block;
            object-fit: cover;
          }
          &_bg {
            position: absolute;
            top: 50%;
            left: -50vw;
            right: -50vw;
            height: 100vh;
            background-color: #ffffff;
            z-index: -1;
          }
        }
        .work__hero_link {
          text-align: center;
        }
      }
    }
  }

  &__footer {
    display: flex;
    flex-direction: column;
    background-color: $color-background;
    &_brief {
      padding: 160px 0;
    }
    &_scroll {
      min-height: 100dvh;
      display: flex;
      align-items: center;
      h2 {
        font-size: clamp(48px, 3.65vw, 70px);
        font-style: normal;
        font-weight: 400;
        line-height: 88%; /* 61.6px */
        letter-spacing: -0.035em;
        color: $color-foreground;
        text-align: center;
        @include respond(mobile) {
          font-size: max(5.33333vw, 20px);
          font-style: normal;
          font-weight: 400;
          line-height: 130%;
        }
        :deep(.char-center) {
          will-change: opacity;
          backface-visibility: hidden;
          opacity: 0.3;
        }
      }
    }
  }
}
.no-data {
  @include flex-center;
  font-size: 48px;
  flex-direction: column;
  min-height: 100vh;
  opacity: 0.5;
}
</style>
