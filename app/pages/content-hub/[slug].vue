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
import { useMediaQuery } from '@vueuse/core';

// Config Strapi variables
const config = useRuntimeConfig();

const { scrollSmoother } = useScrollSmoother();
const { playInteractionSound, playRandomSound } = useAudioManager();

const { isLoading, isFirstLoad } = useLoader();
const router = useRouter();
const { showLayoutElementsRequired } = useNavigation();

const footerScrollTextRef = ref(null);
const articleBodyRef = ref(null);

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

if (error.value) {
  console.error('Error fetching article data:', error.value);
}

const readingTime = computed(() => {
  const plainText =
    articleBodyRef.value?.innerText || articleBodyRef?.value?.textContent || '';
  return calculateReadingTime(plainText);
});

onMounted(async () => {
  SplitText.create(footerScrollTextRef.value, {
    type: 'words,chars',
    charsClass: 'char-center',
  });
  setTimeout(footerTextAnimationInit, 100);
  await nextTick();
});

onUnmounted(() => {
  ScrollTrigger.getAll().forEach((st) => st.kill());
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
  playInteractionSound('about-load');
  const isMobile = useMediaQuery('(max-width: 768px)');

  const layoutElements = gsap.utils.toArray([
    '#header-logo',
    '#header-navigation-button',
    '#header-sound-button',
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
  gsap.to(footerScrollTextRef.value.querySelectorAll('.char-center'), {
    scrollTrigger: {
      trigger: footerScrollTextRef.value,
      start: 'top bottom',
      end: () =>
        document
          .querySelector('.article__footer_scroll')
          .getBoundingClientRect().top,
      scrub: true,
      invalidateOnRefresh: true,
      onLeave: () => {
        router.push('/content-hub');
      },
    },
    opacity: 1,
    duration: 0.1,
    stagger: 0.05,
  });
}
</script>
<template>
  <main v-if="articleData?.data" class="article">
    <div class="article__hero">
      <div class="container">
        <div class="article__hero_grid">
          <div class="article__hero_info">
            <ul>
              <li>Author</li>
              <li>{{ articleData?.data?.author?.name }}</li>
            </ul>
            <ul>
              <li>Published</li>
              <li>
                {{ formatDate(articleData?.data?.createdAt) }}
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
              href="#"
              aria-label="Share on Facebook"
              @mouseenter="() => playInteractionSound('share-hover')"
              @click="() => playRandomSound('click')"
            >
              <img src="/img/icon-x.svg" alt="" />
            </a>
            <a
              href="#"
              aria-label="Share on Facebook"
              @mouseenter="() => playInteractionSound('share-hover')"
              @click="() => playRandomSound('click')"
            >
              <img src="/img/icon-f.svg" alt="" />
            </a>
            <a
              href="#"
              aria-label="Share on Facebook"
              @mouseenter="() => playInteractionSound('share-hover')"
              @click="() => playRandomSound('click')"
            >
              <img src="/img/icon-in.svg" alt="" />
            </a>
          </div>
          <ArticleContent :data="articleData?.data?.article" />
          <!-- <article>
            <h2>
              Small business owners with their sights on the future are
              recognising the value of collaboration.
            </h2>

            <p class="large-body">
              Through the Te Puni Kōkiri Cadetship programme, three creative
              companies are sharing their baskets of knowledge, so their kaimahi
              and businesses can thrive. Watch this video about their
              collaboration.
            </p>
            <p>
              Andrew Hillstead founded Psychoactive Studios digital design
              agency to create beautiful, interactive, user friendly web
              products and experiences. He is now teaming up with cultural
              storytelling tech company VAKA and cultural photography business
              Soldiers Rd Portraits. All three are on the brink of big, bold
              expansion.
            </p>
            <p>Find out more about Vaka’s basket of knowledge.</p>
            <p>Find out more about Soldiers Rd’s basket of knowledge.</p>

            <div class="image">
              <NuxtImg
                src="/img/test-article-image-2.jpg"
                sizes="100vw md:70vw xl:1600px"
              />
            </div>

            <h2>Knowledge is community</h2>

            <div class="quote">
              <div class="quote__wrapper">
                <blockquote>
                  “We want to connect Jesse with my employee Callum Mudgway to
                  create a supportive environment where he can grow. Callum’s an
                  amazing designer. He now needs to be able to stand with mana
                  and strength to present and work with clients every day,”
                </blockquote>
              </div>
              <div class="quote__author">– says Andrew.</div>
            </div>

            <p>
              At the same time, Andrew is sharing his web skills with the owners
              of cultural portrait photography business, Soldiers Rd Portraits.
            </p>
            <p>
              For nearly eight years, sisters-in-law Taaniko and Vienna
              Nordstrom have been styling customers in Māori regalia for
              indigenous inspired vintage portraits that plant a seed of
              cultural identity and integrity. The business is now preparing to
              expand nationwide.
            </p>
            <p>
              Andrew’s helping us to bring the visual side of our business to
              life in a way that will be perfect for expanding and telling our
              stories explains Taaniko (Ngāti Hine, Ngāti Kahungunu ki Te
              Wairoa, Rongomaiwahine, Waikato-Tainui).
            </p>

            <p class="spacer" />

            <h3>Knowledge is community text community text</h3>

            <p>
              At the same time, Andrew is sharing his web skills with the owners
              of cultural portrait photography business, Soldiers Rd Portraits:
            </p>
            <ol>
              <li>
                For nearly eight years, sisters-in-law Taaniko and Vienna
                Nordstrom have been styling customers in Māori regalia for
                indigenous inspired vintage portraits that plant a seed of
                cultural identity and integrity. The business is now preparing
                to expand nationwide.
              </li>
              <li>
                Andrew’s helping us to bring the visual side of our business to
                life in a way that will be perfect for expanding and telling our
                stories” explains Taaniko (Ngāti Hine, Ngāti Kahungunu ki Te
                Wairoa, Rongomaiwahine, Waikato-Tainui).
              </li>
            </ol>
            <p>“He’s showing us how to update our website</p>
            <p>
              He’s showing us how to update our website so that it's fresh,
              modern, showcases our work and gives people an idea of what we do
              at a glance,” agrees Vienna (Ngāti Porou).
            </p>
            <div class="cta">
              <LetsTalkDots mode="light" />
            </div>
            <h6>sub header text</h6>
            <h2>Knowledge is community</h2>
            <p>
              At the same time, Andrew is sharing his web skills with the owners
              of cultural portrait photography business, Soldiers Rd Portraits.
            </p>

            <ul>
              <li>
                For nearly eight years, sisters-in-law Taaniko and Vienna
                Nordstrom have been styling customers in Māori regalia for
                indigenous inspired vintage portraits that plant a seed of
                cultural identity and integrity. The business is now preparing
                to expand nationwide.
              </li>
              <li>
                Andrew’s helping us to bring the visual side of our business to
                life in a way that will be perfect for expanding and telling our
                stories” explains Taaniko (Ngāti Hine, Ngāti Kahungunu ki Te
                Wairoa, Rongomaiwahine, Waikato-Tainui).
              </li>
              <li>
                He’s showing us how to update our website so that it's fresh,
                modern, showcases our work and gives people an idea of what we
                do at a glance,” agrees Vienna (Ngāti Porou).
              </li>
              <li>
                As Cadets, Taaniko and Vienna see Andrew’s support as crucial to
                helping them achieve their business goals.
              </li>
            </ul>
            <div class="image-double">
              <img src="/img/test-article-image-2.jpg" alt="" />
              <img src="/img/news/news-image-3.png" alt="" />
            </div>
            <p>
              At the same time, Andrew is sharing his web skills with the owners
              of cultural portrait photography business, Soldiers Rd Portraits.
            </p>
            <p>
              For nearly eight years, sisters-in-law Taaniko and Vienna
              Nordstrom have been styling customers in Māori regalia for
              indigenous inspired vintage portraits that plant a seed of
              cultural identity and integrity. The business is now preparing to
              expand nationwide.
            </p>
            <p>
              “Andrew’s helping us to bring the visual side of our business to
              life in a way that will be perfect for expanding and telling our
              stories” explains Taaniko (Ngāti Hine, Ngāti Kahungunu ki Te
              Wairoa, Rongomaiwahine, Waikato-Tainui).
            </p>
            <p>
              “He’s showing us how to update our website so that it's fresh,
              modern, showcases our work and gives people an idea of what we do
              at a glance,” agrees Vienna (Ngāti Porou).
            </p>
            <p>
              As Cadets, Taaniko and Vienna see Andrew’s support as crucial to
              helping them achieve their business goals.
            </p>

            <h2>
              Title H2 Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Quae, praesentium?
            </h2>
            <h3>
              Title H3 Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Quae, praesentium?
            </h3>
            <h4>
              Title H4 Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Quae, praesentium?
            </h4>
            <h5>
              Title H5 Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Quae, praesentium?
            </h5>
          </article> -->
        </div>
      </div>
    </div>
    <footer class="article__footer">
      <div class="article__footer_brief">
        <Brief />
      </div>
      <div class="article__footer_scroll">
        <div class="container">
          <h2 ref="footerScrollTextRef">Scroll to back Content Hub</h2>
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
        gap: getRem(120);
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
        &:hover {
          animation: flicker-effect-1 0.5s forwards;
        }
      }
    }
  }
  &__footer {
    display: flex;
    flex-direction: column;
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
