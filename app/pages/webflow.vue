<script setup>
import gsap from 'gsap';
import Footer from '~/components/layout/Footer.vue';
import OnScrollFilledText from '~/components/ui/OnScrollFilledText.vue';
import PartnersDesktop from '~/components/ui/PartnersDesktop.vue';
import CasesSwiper from '~/components/webflow/CasesSwiper.vue';
import ClientsSaySwiper from '~/components/webflow/ClientsSaySwiper.vue';
import Hero from '~/components/webflow/Hero.vue';
import Services from '~/components/webflow/Services.vue';
import Statistics from '~/components/webflow/Statistics.vue';
import Timeline from '~/components/webflow/Timeline.vue';
import VideoReel from '~/components/webflow/VideoReel.vue';
import WatsUs from '~/components/webflow/WatsUs.vue';
import useScrollSmoother from '~/composables/useScrollSmoother';
import useLoader from '~/composables/useLoader';
import useNavigation from '~/composables/useNavigation';
import { leaveAnimation } from '~/utils/animations/transitions';
import HeroMobile from '~/components/homepage/HeroMobile.vue';
import { useMediaQuery } from '@vueuse/core';
import VideoReelMobile from '~/components/webflow/VideoReelMobile.vue';

const { scrollSmoother, enableScroll } = useScrollSmoother();
const { startLoading } = useLoader();
const { transitionFromNavigation } = useNavigation();

const isMobile = useMediaQuery('(max-width: 768px)');

onMounted(() => {
  setTimeout(() => {
    enableScroll();
  }, 100);
});

definePageMeta({
  scrollToTop: true,
  pageTransition: {
    css: false,
    mode: 'out-in',
    onEnter: (_, done) => {
      startLoading();
      scrollSmoother.value.scrollTop(0, false);
      done();
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
</script>

<template>
  <main class="webflow">
    <Hero />
    <div class="container">
      <section class="webflow__onscroll-text">
        <OnScrollFilledText>
          <p>
            Webflow development <span class="dark">for</span> innovative brands.
          </p>
          <p>
            Custom code <span class="dark">and</span> enterprise-grade builds,
            <span class="dark">crafted for</span>
            performance, scalability <span class="dark">and</span> visibility
            <span class="dark">in an AI-driven world</span>.
          </p>
        </OnScrollFilledText>
      </section>
    </div>
    <section class="webflow__video-reels">
      <ClientOnly>
        <div v-if="!isMobile" class="container">
          <VideoReel />
        </div>
        <VideoReelMobile v-if="isMobile" />
      </ClientOnly>
    </section>
    <div class="container">
      <section v-if="!isMobile" class="webflow__timeline">
        <Timeline />
      </section>
      <section class="webflow__services">
        <Services />
      </section>
      <section class="webflow__partners">
        <PartnersDesktop />
      </section>

      <section class="webflow__cases">
        <CasesSwiper />
      </section>

      <section class="webflow__statistics">
        <Statistics />
      </section>

      <section class="webflow__clients-say">
        <ClientsSaySwiper />
      </section>
    </div>
    <section class="webflow__sets-us">
      <WatsUs />
    </section>
    <Footer />
  </main>
</template>

<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
.webflow {
  &__onscroll-text {
    max-width: 56vw;
    margin: 0 auto 120px auto;
    text-align: center;
    @include respond(mobile) {
      max-width: initial;
      margin-top: 1rem;
    }
  }
  &__timeline {
  }
  &__partners {
    margin-top: 240px;
  }
  &__cases {
    margin-top: 160px;
  }
  &__statistics {
    margin-top: 160px;
  }
  &__clients-say {
    margin-top: 160px;
  }
  &__sets-us {
    margin-top: 240px;
    margin-bottom: 100px;
  }
}
</style>
