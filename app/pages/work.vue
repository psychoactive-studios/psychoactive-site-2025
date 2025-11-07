<script setup>
import gsap from 'gsap';
import CaseStadyPreview from '~/components/ui/CaseStadyPreview.vue';
import LetsTalkDots from '~/components/ui/LetsTalkDots.vue';
import useScrollSmoother from '~/composables/useScrollSmoother';
import { worksData } from '~/data/worksData';
import useLoader from '~/composables/useLoader';
import { SplitText } from 'gsap/SplitText';
import { leaveAnimation } from '~/utils/animations/transitions';
import Footer from '~/components/layout/Footer.vue';
import useNavigation from '~/composables/useNavigation';

const { isFirstLoad, isLoading } = useLoader();
const { scrollSmoother } = useScrollSmoother();
const { transitionFromNavigation } = useNavigation();

const titleRef = ref(null);

onMounted(() => {
  SplitText.create(titleRef.value.querySelector('p'), {
    type: 'words,chars',
    charsClass: 'char-center',
  });

  // if (isFirstLoad.value) {
  //   enterAnimation();
  // }
  // stopLoading();
  // await nextTick();
  // scrollSmoother.value.paused(false);
});

watch([isLoading, isFirstLoad], ([loading, firstLoad]) => {
  if (!loading && firstLoad) {
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
        // scrollSmoother.value.scrollTop(0, false);
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
        // ease: 'power3.out',
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
    .add(() => scrollSmoother.value.paused(false), '<');
  // if (isFirstLoad.value) {
  //   tl.from(
  //     layoutElements,
  //     { scale: 0, duration: 0.75, ease: 'power3.out' },
  //     '<+=1'
  //   ).add(() => {
  //     isFirstLoad.value = false;
  //   });

  // tl.add(() => scrollSmoother.value.paused(false), '<');
}
</script>
<template>
  <main class="works">
    <div class="container">
      <div ref="titleRef" class="works__title">
        <h1>OUR Projects</h1>
        <p>
          Where bold ideas become living, breathing digital experiences. Crafted
          with intention and built to perform.
        </p>
      </div>
      <div class="works__grid">
        <template v-for="work in worksData" :key="work.id">
          <LetsTalkDots v-if="work.id === 'letstalk'" />
          <CaseStadyPreview
            v-else
            :src="work.src"
            :title="work.title"
            :description="work.description"
          />
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
    font-size: getRem(32);
    font-style: normal;
    font-weight: 400;
    line-height: 121%;
    letter-spacing: -1.52px;
    @include respond('mobile') {
      max-width: 100%;
      font-size: max(24px, 6.4vw);
      margin-bottom: 120px;
    }
    & > h1 {
      font-family: 'RoobertMono';
      font-size: 1rem;
      font-style: normal;
      font-weight: 500;
      line-height: 146%; /* 23.36px */
      text-transform: uppercase;
      color: white(60);
      margin-bottom: getRem(20);
      @include respond('mobile') {
        font-size: getRem(14);
      }
    }
  }
  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: getRem(20);
    direction: rtl;
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
