<script setup>
import gsap from 'gsap';

import Brief from '~/components/layout/Brief.vue';
import useNavigation from '~/composables/useNavigation';
import useHeader from '~/composables/useHeader';
import useWorks from '~/composables/useWorks';

import { useDebounceFn, useMediaQuery } from '@vueuse/core';
import LinkButton from '~/components/ui/LinkButton.vue';
import WorkArticleContent from '~/components/work/WorkArticleContent.vue';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ButtonDotsArrow from '~/components/ui/ButtonDotsArrow.vue';
import useAudioManager from '~/composables/useAudioManager';
import useScrollSmoother from '~/composables/useScrollSmoother';

// Config Strapi variables
const config = useRuntimeConfig();

const isMobile = useMediaQuery('(max-width: 768px)');
const { workPageInit, footerTextAnimationInit } = useWorks();
const { mode } = useHeader();
const { playInteractionSound } = useAudioManager();
const { scrollSmoother } = useScrollSmoother();

const illustrationRef = ref(null);
const footerRef = ref(null);

const { params, query } = useRoute();


if(query.secret !== config.public.strapiPreviewSecret) {
  useRouter().replace('/not-found');
}

console.log('URL: ', `${config.public.strapiBaseUrl}/api/works/${params.slug}?status=${query.status || 'published'}`);
console.log('API: ', config.public.strapiApiKey);


const { data: workData, error } = await useFetch(`/api/works/${params.slug}?status=${query.status || 'published'}`, {
  server: false,
  lazy: true,
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

if (error.value || !workData.value?.data) {  
  throw createError({
    statusCode: 404,
    statusMessage: 'Case Study Not Found',    
  });
}

// SEO meta from workData.data.seo – only set when fields exist
const seoMeta = computed(() => {
  const seo = workData.value?.data?.seo;
  if (!seo) return {};
  const meta = {};
  if (seo.metaTitle) meta.title = seo.metaTitle;
  if (seo.metaDescription) meta.description = seo.metaDescription;
  if (seo.shareImage) {
    const url =
      typeof seo.shareImage === 'string'
        ? seo.shareImage
        : seo.shareImage?.url;
    if (url) {
      meta.ogImage = url.startsWith('http') ? url : `${config.public.strapiBaseUrl}${url}`;
    }
  }
  return meta;
});
useSeoMeta(seoMeta);

const mainTitle = computed(() => workData.value?.data?.mainTitle);
const mainImage = computed(() => workData.value?.data?.mainImage);
const hero = computed(() => workData.value?.data?.hero);
const article = computed(() => workData.value?.data?.article);

// Activate animations and functions only after workData is loaded
watch(
  () => workData.value?.data,
  async (data) => {
    if (!data) return;
    ctx?.revert();
    await nextTick();
    ctx = gsap.context(() => {});
    animationsInit(ctx);
    footerTextAnimationInit(ctx, footerRef.value);
    workPageInit();
    mode.value = 'light';
  },
  { immediate: true }
);

let ctx;
let resizeObserver;

// Debounce to optimize the number of ScrollTrigger.refresh() calls on resize
const refreshScrollTrigger = useDebounceFn(() => {
  ScrollTrigger.refresh();
}, 200);

onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    refreshScrollTrigger();
  });
  resizeObserver.observe(document.body);
});

onUnmounted(() => {
  ctx?.revert();
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

definePageMeta({
  scrollToTop: true,
  pageTransition: {
    css: false,
    mode: 'out-in',
    onEnter: (_, done) => {
      const { showLayoutElementsRequired } = useNavigation();
      done();
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
          .set('#work-back-button', { display: 'none', scale: 0 })
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
        .to('#work-back-button', { scale: 0 })
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
      onLeave: () => {
        mode.value = 'dark';
      },
      onEnterBack: () => {
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

const onClickHandler = (e) => {
  playInteractionSound('click-1');
  playInteractionSound('menu-close', 100);

  const windowHeight = window.innerHeight;
  const y = windowHeight;

  gsap
    .timeline()
    .set(e.currentTarget, { pointerEvents: 'none' })
    .set(e.currentTarget, { clearProps: 'pointerEvents' }, '+=1.5');

  scrollSmoother.value.scrollTo(y, {
    duration: 1.5,
    force: true,
    easing: (x) =>
      x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2,
  });
};
</script>
<template>
  <main v-if="workData?.data" class="work">
    <div class="work__header--desktop">
      <!-- Illustration section -->
      <section ref="illustrationRef" class="work__illustration">
        <img :src="mainImage.url" alt="SuperAI Conference Illustration" />
        <div class="work__illustration_scroll">
          <div id="work-scroll-down-text" class="body-button">scroll down</div>
          <ButtonDotsArrow
            id="work-scroll-down-button"
            @click="onClickHandler"
          />
        </div>
      </section>

      <!-- Hero section -->
      <section id="work-hero" class="work__hero">
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
            <img :src="mainImage?.formats?.medium?.url || mainImage?.url" :alt="mainTitle" />
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
    <footer ref="footerRef" class="work__footer">
      <div class="work__footer_brief">
        <Brief />
      </div>
      <div class="container">
        <div class="work__footer_scroll">
          <div class="body-large--mobile">
            Keep scrolling to go back to <img src="/img/arrow-right-long.svg" />
          </div>
          <div class="work__footer_scroll--progress">
            <img
              v-for="n in 15"
              :key="n"
              :src="`/img/frog_steps/progress-logo-${n - 1}.svg`"
              alt=""
            />
          </div>
          <div class="heading-h2--mobile">Work page</div>
        </div>
      </div>
    </footer>
  </main>
  <div v-else>
    <div class="no-data">
      <p>Loading, please wait...</p>
    </div>  
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
        &_scroll {
          position: absolute;
          bottom: 48px;
          left: 0;
          right: 0;
          margin: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: $color-foreground;
          :deep(.char-center) {
            will-change: opacity;
            opacity: 0;
          }
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
    gap: 23dvh;
    background-color: $color-background;
    min-height: 100dvh;
    justify-content: center;
    position: relative;
    z-index: 1;
    @include respond(laptop) {
      gap: 10dvh;
    }
    @include respond(mobile) {
      gap: 0;
      &::before,
      &::after {
        content: '';
        display: block;
        flex-grow: 1;
        background: url('/img/icon-plus.svg') center center no-repeat;
        opacity: 0.5;
      }
    }
    &_brief {
      padding: 0;
      @include respond(mobile) {
        display: none;
      }
    }
    .container {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 48px;
      @include respond(desktop) {
        gap: 24px;
      }
      @include respond(laptop) {
        width: 100%;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 48px;
      }
      .body-large--mobile {
        max-width: 230px;
        @include respond(laptop) {
          max-width: none;
        }
        @include respond(mobile) {
          color: white(50);
          text-align: center;
          max-width: 150px;
        }
        img {
          display: inline-block;
          width: auto;
          height: 14px;
          vertical-align: middle;
          margin-left: 0.5rem;
          @include respond(mobile) {
            display: none;
          }
        }
      }
      .heading-h2--mobile {
        white-space: nowrap;
      }
    }
    &_scroll {
      color: $color-foreground;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 48px;
      width: 100%;
      @include respond(desktop) {
        gap: 24px;
      }
      @include respond(laptop) {
        width: 100%;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 48px;
      }
      @include respond(mobile) {
        width: 100%;
        flex-shrink: 0;
        aspect-ratio: 1;
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 16px;
      }
      &--progress {
        display: flex;
        justify-content: space-between;
        flex-grow: 1;
        @include respond(laptop) {
          gap: 3vw;
        }
        @include respond(mobile) {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          container-type: inline-size;
          --icon-count: 15;
        }
        img {
          flex-shrink: 0;
          width: 22px;
          height: 22px;
          opacity: 0.2;
          @include respond(mobile) {
            position: absolute;
            top: 50%;
            left: 50%;
            margin-left: -11px;
            margin-top: -11px;
            --radius: 44cqw;
            --angle: calc(360deg / var(--icon-count) * var(--i) - 90deg);
            transform: 
                /* 1. Rotate the coordinate axis to the desired angle */ rotate(
                var(--angle)
              )
              /* 2. Translate the icon along this axis by the radius */
              translateX(var(--radius))
              /* 3. Compensate the rotation of the icon itself to keep it upright
                      (multiply the angle by -1) */
              rotate(calc(var(--angle) * -1));
          }
        }
        @include respond(mobile) {
          img {
            &:nth-child(1) {
              --i: 0;
            }
            &:nth-child(2) {
              --i: 1;
            }
            &:nth-child(3) {
              --i: 2;
            }
            &:nth-child(4) {
              --i: 3;
            }
            &:nth-child(5) {
              --i: 4;
            }
            &:nth-child(6) {
              --i: 5;
            }
            &:nth-child(7) {
              --i: 6;
            }
            &:nth-child(8) {
              --i: 7;
            }
            &:nth-child(9) {
              --i: 8;
            }
            &:nth-child(10) {
              --i: 9;
            }
            &:nth-child(11) {
              --i: 10;
            }
            &:nth-child(12) {
              --i: 11;
            }
            &:nth-child(13) {
              --i: 12;
            }
            &:nth-child(14) {
              --i: 13;
            }
            &:nth-child(15) {
              --i: 14;
            }
          }
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
