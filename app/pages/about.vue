<script setup>
import gsap from 'gsap';
import Ethos from '~/components/about/Ethos.vue';
import FeaturedIn from '~/components/about/FeaturedIn.vue';
import Hero from '~/components/about/Hero.vue';
import Metamorphosis from '~/components/about/Metamorphosis.vue';
import OurStory from '~/components/about/OurStory.vue';
import Team from '~/components/about/Team.vue';
import TextWithTitle from '~/components/about/TextWithTitle.vue';
import Footer from '~/components/layout/Footer.vue';
import useLoader from '~/composables/useLoader';
import useNavigation from '~/composables/useNavigation';
import useScrollSmoother from '~/composables/useScrollSmoother';
import useCursor from '~/composables/useCursor';

import { aboutPageInitAnimation } from '~/utils/animations/about';
import { leaveAnimation } from '~/utils/animations/transitions';

const { scrollSmoother } = useScrollSmoother();
const { startLoading } = useLoader();

const containerRef = ref(null);
let ctx = null;

onMounted(() => {
  ctx = gsap.context(() => {}, containerRef.value);
  setTimeout(() => aboutPageInitAnimation(ctx, containerRef.value), 100);
});

onUnmounted(() => {
  if (ctx) ctx.revert();
});

useSeoMeta({
  title: 'About | AI-era Webflow Agency | Psychoactive Studios',
  description:
    'Remote-first digital design agency founded 2018 in Wellington, New Zealand. AI-era Webflow Enterprise Partner building for ambitious brands worldwide.',
  ogTitle: 'About | AI-era Webflow Agency | Psychoactive Studios',
  ogDescription:
    'Remote-first digital design agency founded 2018 in Wellington, New Zealand. AI-era Webflow Enterprise Partner building for ambitious brands worldwide.',
});

definePageMeta({
  scrollToTop: true,
  pageTransition: {
    css: false,
    mode: 'out-in',
    onEnter: (_, done) => {
      startLoading();
      setTimeout(() => {
        scrollSmoother.value.scrollTo(0, {
          immediate: true,
          lock: true,
          force: true,
        });
        done();
      }, 50);
    },
    onLeave: (el, done) => {
      const { cursorRef } = useCursor();
      const { transitionFromNavigation } = useNavigation();
      gsap.set(cursorRef.value, {
        scale: 0,
        duration: 0.3,
        ease: 'power3.in',
        overwrite: true,
      });
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
  <main ref="containerRef" class="about">
    <Hero />
    <section class="about__amphibious">
      <TextWithTitle title="BORN AMPHIBIOUS">
        <p>
          <span class="dark">Psychoactive is a</span> global design agency
          <span class="dark">building</span> digital experiences
          <span class="dark">for</span> ambitious brands.
          <span class="dark">We’re</span> remote-first, award-winning,
          <span class="dark">and</span> obsessively focused
          <span class="dark">on the moment your</span>
          audience encounters your brand online.
        </p>
        <p>
          <span class="dark">Just as frogs breathe both</span>
          water and air,
          <span class="dark">we breathe</span>
          design and innovation,
          <span class="dark">constantly finding</span>
          fresh, intuitive
          <span class="dark">ways to drive brand</span>
          Metamorphosis.
        </p>
      </TextWithTitle>
    </section>

    <section class="about__featured-in">
      <FeaturedIn />
    </section>

    <section class="about__metamorphosis">
      <Metamorphosis />
    </section>

    <section class="about__collaboration">
      <div class="container">
        <div class="about__collaboration_title">
          <h2 class="subheader--mobile">THRIVE THROUGH COLLABORATION</h2>
          <div class="title-line">
            <span class="line" />
          </div>
        </div>
        <div class="about__collaboration_text heading-h1--mobile">
          A global network of designers, developers, creative thinkers, and
          strange creatures.
        </div>
      </div>
    </section>

    <section class="about__team">
      <div class="container">
        <Team />
      </div>
    </section>

    <section class="about__story">
      <div class="container">
        <OurStory />
      </div>
    </section>

    <section class="about__ethos">
      <Ethos />
    </section>
    <Footer />
  </main>
</template>
<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
.about {
  &__amphibious {
    @include flex-center;
    min-height: 100vh;
    @include respond(mobile) {
      min-height: initial;
    }
  }
  // &__metamorphosis {
  // }
  &__collaboration {
    margin-top: 240px;
    @include respond(mobile) {
      margin-top: 120px;
    }
    &_title {
      margin-bottom: getRem(24);
      display: flex;
      align-items: center;
      gap: getRem(48);
      h2 {
        white-space: nowrap;
        color: white(50);
      }
      .title-line {
        flex-grow: 1;
        @include respond(mobile) {
          display: none;
        }
        .line {
          display: block;
          width: 100%;
          height: 1px;
          background: white(10);
          position: relative;
          will-change: width;
          &::before,
          &::after {
            content: '';
            position: absolute;
            width: 7px;
            height: 7px;
            background-color: white(50);
            border-radius: 50%;
          }
          &::before {
            top: -3px;
            left: -3px;
          }
          &::after {
            top: -3px;
            right: -4px;
          }
        }
      }
    }

    &_text {
      display: inline;
      font-size: 5vw;
      font-style: normal;
      font-weight: 400;
      line-height: 100%;
      letter-spacing: -0.056em;
      background: linear-gradient(to right, white 50%, transparent 50%);
      background-size: 200% 100%;
      background-position-x: 50%;
      background-position-y: center;
      color: transparent;
      background-clip: text;
    }
  }
  &__team {
    margin-top: 160px;
    @include respond(mobile) {
      margin-top: 60px;
    }
  }
  &__story {
    margin-top: 240px;
    @include respond(mobile) {
      margin-top: 60px;
    }
  }
  &__ethos {
    padding-bottom: 240px;
    @include respond(mobile) {
      margin-top: 120px;
      padding-bottom: 120px;
    }
  }
  &__featured-in {
    // Matches the homepage Partners section rhythm:
    //   - no explicit top margin (the section above provides natural space)
    //   - 160px bottom margin (same as .cases margin-top on homepage)
    margin-bottom: 160px;
    @include respond(mobile) {
      margin-top: 80px;
      margin-bottom: 30px;
    }
  }
}
</style>
