<script setup>
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

import Brief from '~/components/layout/Brief.vue';
import ArticleContent from '~/components/ui/ArticleContent.vue';
import useScrollSmoother from '~/composables/useScrollSmoother';
import useNavigation from '~/composables/useNavigation';
import useLoader from '~/composables/useLoader';
import useAudioManager from '~/composables/useAudioManager';
import { calculateReadingTime } from '~/utils/comput';
import { leaveAnimation } from '~/utils/animations/transitions';
import { useDebounceFn, useMediaQuery } from '@vueuse/core';
import ButtonOutline from '~/components/ui/ButtonOutline.vue';

// Config Strapi variables
const config = useRuntimeConfig();

let ctx;
let resizeObserver;

const { scrollSmoother } = useScrollSmoother();
const {
  playInteractionSound,
  playRandomSound,
  isSoundApproved,
  hasInteracted,
} = useAudioManager();

const { isLoading, isFirstLoad } = useLoader();
const router = useRouter();
const { showLayoutElementsRequired, backButtonHref } = useNavigation();

const footerScrollTextRef = ref(null);
const articleBodyRef = ref(null);
const footerRef = ref(null);

const { params } = useRoute();

const { data: articleData, error } = await useFetch(
  `/api/articles/${params.slug}`,
  {
    baseURL: config.public.strapiBaseUrl,
    headers: {
      Authorization: `Bearer ${config.public.strapiApiKey}`,
    },
    key: `article-${params.slug}`,
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

if (error.value || !articleData.value?.data) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Article Not Found',
  });
}

// SEO meta from articleData.data.seo – only set when fields exist
const seoMeta = computed(() => {
  const seo = articleData.value?.data?.seo;
  if (!seo) return {};
  const meta = {};
  if (seo.metaTitle) meta.title = seo.metaTitle;
  if (seo.metaDescription) meta.description = seo.metaDescription;
  if (seo.shareImage) {
    const url =
      typeof seo.shareImage === 'string' ? seo.shareImage : seo.shareImage?.url;
    if (url) {
      meta.ogImage = url.startsWith('http')
        ? url
        : `${config.public.strapiBaseUrl}${url}`;
    }
  }
  return meta;
});

useSeoMeta(seoMeta.value);

const readingTime = computed(() => {
  const plainText =
    articleBodyRef.value?.innerText || articleBodyRef?.value?.textContent || '';
  return calculateReadingTime(plainText);
});

// Debounce to optimize the number of ScrollTrigger.refresh() calls on resize
const refreshScrollTrigger = useDebounceFn(() => {
  ScrollTrigger.refresh();
}, 200);

onMounted(async () => {
  resizeObserver = new ResizeObserver(() => {
    refreshScrollTrigger();
  });

  // Observe the body for any size changes to trigger ScrollTrigger refresh
  resizeObserver.observe(document.body);
  ctx = gsap.context(() => {});

  await nextTick();

  SplitText.create(footerScrollTextRef.value, {
    type: 'words,chars',
    charsClass: 'char-center',
  });
  await nextTick();
  setTimeout(footerTextAnimationInit, 200);
});

onUnmounted(() => {
  ScrollTrigger.getAll().forEach((st) => st.kill());
  ctx.revert();
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

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
        enterAnimation(el);
      }, 50);
    },
    onLeave: (el, done) => {
      const { transitionFromNavigation } = useNavigation();
      if (transitionFromNavigation.value) {
        gsap
          .timeline()
          .set(el, { opacity: 0 })
          .add(() => {
            backButtonHref.value = null;
          })
          .add(() => {
            transitionFromNavigation.value = false;
            done();
          }, '+=1');
        return;
      }
      gsap
        .timeline()
        .to('#top-back-button', { scale: 0 })
        .add(() => {
          backButtonHref.value = null;
        }, '+=0.1');
      leaveAnimation(el, done);
    },
  },
});

function enterAnimation(el) {
  if (isSoundApproved.value && hasInteracted.value)
    playInteractionSound('about-load');
  const isMobile = useMediaQuery('(max-width: 768px)');
  backButtonHref.value = 'content-hub';

  const layoutElements = gsap.utils.toArray([
    '#header-logo',
    '#header-navigation-button',
    '#header-sound-button',
    '#top-back-button',
  ]);

  if (el) gsap.set(el, { visibility: 'visible' });

  const timeline = gsap
    .timeline()
    .from('.article__hero_image--bg', {
      y: '100vh',
      duration: 1,
      ease: 'power4.out',
    })
    .from(
      '.article__hero_image img',
      {
        y: '100vh',
        duration: 1,
        ease: 'power4.out',
      },
      '<0.3'
    )
    .from(
      '.article__hero_title h1',
      {
        y: '100vh',
        duration: 1,
        ease: 'power4.out',
      },
      '<0.2'
    )
    .to(
      layoutElements,
      {
        scale: 1,
        opacity: 1,
        duration: 0.75,
        ease: 'power3.out',
      },
      '<0.5'
    )
    .from(
      '.article__hero_info, .article__body',
      {
        opacity: 0,
        duration: 0.75,
        ease: 'power3.out',
      },
      '<'
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

function footerTextAnimationInit() {
  const footer = footerRef.value;

  let tween = null;
  ctx.add(() => {
    tween = gsap.to(
      footer.querySelectorAll('.article__footer_scroll--progress img'),
      {
        scrollTrigger: {
          trigger: footer,
          start: 'top top',
          end: 'bottom 1%',
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          // onEnter: () => {
          //   mode.value = 'light';
          // },
          // onLeaveBack: () => {
          //   mode.value = 'dark';
          // },
        },
        opacity: 1,
        duration: 0.1,
        stagger: 0.05,
        onUpdate: () => {
          if (tween?.progress() > 0.95) router.push('/content-hub');
        },
      }
    );
  });
}
</script>
<template>
  <main v-if="articleData?.data" class="article">
    <div class="article__hero">
      <div class="container">
        <ButtonOutline
          href="/content-hub"
          class="article__back_button"
          mode="light"
          @click="playRandomSound('click')"
        >
          Back
        </ButtonOutline>
        <div class="article__hero_grid">
          <div class="article__hero_info">
            <ul>
              <li>Author</li>
              <li>{{ articleData?.data?.author?.name }}</li>
            </ul>
            <ul>
              <li>Published</li>
              <li>
                {{
                  formatDate(
                    articleData?.data?.published || articleData?.data?.createdAt
                  )
                }}
              </li>
            </ul>
            <ul>
              <li>Updated</li>
              <li>
                {{ formatDate(articleData?.data?.updatedAt) }}
              </li>
            </ul>
            <ul>
              <li>TIME</li>
              <li>{{ readingTime }} min</li>
            </ul>
          </div>
          <div class="article__hero_title">
            <h1>{{ articleData?.data?.title }}</h1>
          </div>
        </div>
        <div class="article__hero_image">
          <NuxtImg
            :src="articleData?.data?.cover?.url"
            sizes="100vw md:70vw xl:1600px"
          />
          <div class="article__hero_image--bg" />
        </div>
      </div>
    </div>
    <div ref="articleBodyRef" class="article__body">
      <div class="container">
        <div class="article__body_wrapper">
          <div class="article__body_share">
            <h3>Share:</h3>
            <a
              href="https://x.com/psychoactiveltd"
              target="_blank"
              aria-label="Share on Facebook"
              @mouseenter="() => playInteractionSound('mute-hover')"
              @click="() => playRandomSound('click')"
            >
              <img src="/img/icon-x.svg" alt="" />
            </a>
            <a
              href="https://www.facebook.com/Psychoactive.Studios.NZ/"
              target="_blank"
              aria-label="Share on Facebook"
              @mouseenter="() => playInteractionSound('mute-hover')"
              @click="() => playRandomSound('click')"
            >
              <img src="/img/icon-f.svg" alt="" />
            </a>
            <a
              href="https://www.linkedin.com/company/psychoactivestudios/"
              target="_blank"
              aria-label="Share on Facebook"
              @mouseenter="() => playInteractionSound('mute-hover')"
              @click="() => playRandomSound('click')"
            >
              <img src="/img/icon-in.svg" alt="" />
            </a>
          </div>
          <ArticleContent :data="articleData?.data?.article" />
        </div>
      </div>
    </div>
    <!-- Footer section -->
    <footer ref="footerRef" class="article__footer">
      <div class="article__footer_brief">
        <Brief />
      </div>
      <div class="container">
        <div class="article__footer_scroll">
          <div class="body-large--mobile">
            Keep scrolling to go back to <img src="/img/arrow-right-long.svg" />
          </div>
          <div class="article__footer_scroll--progress">
            <img
              v-for="n in 15"
              :key="n"
              :src="`/img/frog_steps/progress-logo-${n - 1}.svg`"
              alt=""
            />
          </div>
          <div class="heading-h2--mobile">Content hub</div>
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
.article {
  &__back_button {
    display: none;
    margin-bottom: 32px;
    @include respond(mobile) {
      display: inline-flex;
    }
  }
  &__hero {
    padding-top: 160px;
    @include respond(mobile) {
      padding-top: 24px;
    }
    &_grid {
      display: grid;
      grid-template-columns: 1fr 74%;
      gap: getRem(24);
      margin-bottom: 80px;
      @include respond(tablet) {
        margin-bottom: 60px;
      }
      @include respond(mobile) {
        grid-template-columns: 1fr;
        gap: getRem(24);
        margin-bottom: getRem(48);
      }
    }
    &_info {
      @include respond(mobile) {
        display: grid;
        grid-template-columns: repeat(2, auto);
        gap: getRem(16);
      }
      & > ul {
        position: relative;
        padding: 15px 0 11px 0;
        display: flex;
        flex-direction: column;
        gap: getRem(12);
        @include respond(mobile) {
          padding: 0;
          &:nth-child(1) {
            order: 1;
          }
          &:nth-child(2) {
            order: 3;
          }
          &:nth-child(3) {
            order: 4;
          }
          &:nth-child(4) {
            order: 2;
          }
        }
        &::before {
          content: '';
          position: absolute;
          top: 1.45rem;
          left: 3px;
          bottom: 1.55rem;
          width: 1px;
          background-color: white(20);
          @include respond(mobile) {
            top: 0.55rem;
            bottom: 0.35rem;
          }
        }
        & > li {
          padding-left: 17px;
          position: relative;
          @include respond(tablet) {
            font-size: getRem(14);
          }
          @include respond(mobile) {
            font-size: getRem(12);
          }
          &::before {
            content: '';
            position: absolute;
            left: 0;
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background-color: white(50);
          }
          &:first-child {
            font-family: 'RoobertMono';
            font-weight: 500;
            line-height: 1;
            text-transform: uppercase;
            color: white(50);
            &::before {
              top: 0.3rem;
            }
          }
          &:last-child {
            font-weight: 400;
            line-height: 1.7;
            color: $color-grey;
            &::before {
              top: 0.65rem;
            }
          }
        }
      }
    }
    &_title {
      h1 {
        font-size: clamp(getRem(32), 5vw, getRem(96));
        font-style: normal;
        font-weight: 400;
        line-height: 100%; /* 96px */
        letter-spacing: -0.057em;
      }
    }
    &_image {
      position: relative;
      &--bg {
        position: absolute;
        top: 50%;
        left: -50vw;
        right: -50vw;
        height: 100vh;
        background-color: $color-foreground;
        z-index: -1;
      }
      img {
        width: 100%;
        height: auto;
        border-radius: getRem(10);
        @include respond(mobile) {
          border-radius: getRem(6);
        }
      }
    }
  }
  &__body {
    background-color: $color-foreground;
    color: $color-background;
    padding-top: 120px;
    padding-bottom: 160px;
    @include respond(mobile) {
      padding-top: getRem(16);
      padding-bottom: getRem(80);
    }
    &_wrapper {
      position: relative;
    }
    &_share {
      display: flex;
      flex-direction: column;
      gap: getRem(12);
      position: absolute;
      top: 0;
      left: 0;
      @include respond(mobile) {
        position: static;
        flex-direction: row;
        margin-bottom: getRem(48);
        flex-wrap: wrap;
      }
      & > h3 {
        font-family: 'RoobertMono';
        font-size: 1rem;
        font-style: normal;
        font-weight: 500;
        line-height: 100%;
        text-transform: uppercase;
        @include respond(mobile) {
          width: 100%;
        }
      }
      & > a {
        @include flex-center;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 1px solid rgbaColor($color-background, 20);
        background-color: transparent;
        transition:
          background-color $transition-easeOutCubic,
          border-color $transition-easeOutCubic;
        &:hover {
          background-color: rgbaColor($color-background, 20);
          border: transparent;
        }
      }
    }
  }
  &__footer {
    display: flex;
    flex-direction: column;
    gap: 23dvh;
    background-color: $color-background;
    min-height: 100svh;
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
  :deep(.pin-spacer) {
    background-color: $color-background;
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
