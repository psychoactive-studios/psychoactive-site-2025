<script setup>
import gsap from 'gsap';
import qs from 'qs';
import CaseStadyPreview from '~/components/ui/CaseStadyPreview.vue';
import LetsTalkDots from '~/components/ui/LetsTalkDots.vue';
import useScrollSmoother from '~/composables/useScrollSmoother';
// import { worksData } from '~/data/worksData';
import useLoader from '~/composables/useLoader';
import { SplitText } from 'gsap/SplitText';
import { leaveAnimation } from '~/utils/animations/transitions';
import Footer from '~/components/layout/Footer.vue';
import useNavigation from '~/composables/useNavigation';
import useAudioManager from '~/composables/useAudioManager';

// Config Strapi variables
const config = useRuntimeConfig();

const { playInteractionSound } = useAudioManager();
// Build query params for Strapi API
// Strapi recommends using the 'qs' library to parse and stringify nested
// objects for complex query URLs instead of creating them manually.
const params = qs.stringify({
  populate: {
    hero: {
      fields: ['subTitle'],
    },
    mainImage: {
      fields: [
        'name',
        'alternativeText',
        'caption',
        'width',
        'height',
        'hash',
        'ext',
        'mime',
        'size',
        'url',
        'previewUrl',
        'provider',
        'provider_metadata',
        'createdAt',
        'updatedAt',
      ],
    },
  },
});

const { data: worksData, error } = await useFetch(`/api/works?${params}`, {
  baseURL: config.public.strapiBaseUrl,
  headers: {
    Authorization: `Bearer ${config.public.strapiApiKey}`,
  },
  key: `works-list`,
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

const { isLoading } = useLoader();
const { scrollSmoother } = useScrollSmoother();

const titleRef = ref(null);
const displayedCount = ref(4);
const allWorks = computed(() => {
  const works = worksData?.value?.data ? [...worksData.value.data] : [];
  const letstalkItem = { id: 'letstalk' };

  if (works.length < 3) {
    works.push(letstalkItem);
  } else {
    const middleIndex = Math.floor(works.length / 2);
    works.splice(middleIndex, 0, letstalkItem);
  }
  return works;
});

const displayedWorks = computed(() => {
  return allWorks.value.slice(0, displayedCount.value);
});
let loadInterval;

onMounted(() => {
  SplitText.create(titleRef.value.querySelector('p'), {
    type: 'words,chars',
    charsClass: 'char-center',
  });

  loadInterval = setInterval(() => {
    if (displayedCount.value < allWorks.value.length) {
      displayedCount.value += 1;
    } else {
      clearInterval(loadInterval);
    }
  }, 200);
});

onUnmounted(() => {
  if (loadInterval) clearInterval(loadInterval);
});

watch(isLoading, (newVal) => {
  if (!newVal) {
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
      gsap.set(el, { visibility: 'hidden' });

      setTimeout(() => {
        scrollSmoother.value.scrollTo(0, {
          immediate: true,
          lock: true,
          force: true,
        });
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
  playInteractionSound('work-load');

  const layoutElements = gsap.utils.toArray([
    '#header-logo',
    '#header-navigation-button',
    '#header-sound-button',
  ]);

  if (el) gsap.set(el, { visibility: 'visible' });

  gsap
    .timeline()
    .from('.works .works__title', {
      y: 400,
      opacity: 0,
      duration: 1.2,
      ease: 'power4.out',
    })
    .to(
      '.works .works__title h1',
      {
        duration: 1.5,
        ease: 'none',
        scrambleText: {
          text: '{original}',
          // chars: '0123456789!@#$%^&*()-_=+[]{};:<>/?,.',
          tweenLength: false,
        },
      },
      '<'
    )
    .from(
      '.works .works__title p .char-center',
      {
        opacity: 0,
        duration: 0.0001,
        stagger: 0.015,
      },
      '<'
    )
    .from(
      '.works .works__grid > *',
      {
        y: '100vh',
        duration: 1.2,
        ease: 'power4.out',
        stagger: 0.15,
      },
      '<+=0.3'
    )
    .to(
      layoutElements,
      { scale: 1, opacity: 1, duration: 0.75, ease: 'power3.out' },
      '<+=1'
    )
    .add(() => scrollSmoother.value.start(), '<');
  // if (isFirstLoad.value) {
  //   tl.from(
  //     layoutElements,
  //     { scale: 0, duration: 0.75, ease: 'power3.out' },
  //     '<+=1'
  //   ).add(() => {
  //     isFirstLoad.value = false;
  //   });

  // tl.add(() => scrollSmoother.value.start(), '<');
}
</script>
<template>
  <main class="works">
    <div class="container">
      <div ref="titleRef" class="works__title">
        <h1 class="subheader--mobile">OUR Projects</h1>
        <p class="heading-h5--mobile">
          Where bold ideas become living, breathing digital experiences. Crafted
          with intention and built to perform.
        </p>
      </div>
      <div class="works__grid">
        <template v-for="work in displayedWorks" :key="work.id">
          <LetsTalkDots v-if="work.id === 'letstalk'" :scale="1.2" />
          <CaseStadyPreview v-else :data="work" />
        </template>
      </div>
    </div>
    <Footer />
  </main>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
.works {
  padding-top: 160px;
  @include respond('mobile') {
    padding-top: 24px;
  }
  &__title {
    margin-bottom: 200px;
    max-width: calc(50% - getRem(10));
    @include respond('mobile') {
      max-width: 100%;
      margin-bottom: 120px;
    }
    & > h1 {
      color: white(60);
      margin-bottom: getRem(24);
    }
  }
  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: getRem(20);
    direction: rtl;
    position: relative;
    z-index: 2;
    @include respond('mobile') {
      grid-template-columns: 1fr;
      direction: ltr;
    }
    & > * {
      direction: ltr;
      &:nth-child(even) {
        margin-top: 25%;
      }
      &:nth-child(odd) {
        margin-bottom: 32%;
        margin-top: -70px;
      }
      @include respond('mobile') {
        &:nth-child(even),
        &:nth-child(odd) {
          margin: 0 0 getRem(62) 0;
        }
      }
    }
  }
}
</style>
