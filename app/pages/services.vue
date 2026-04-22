<script setup>
import Footer from '~/components/layout/Footer.vue';
import Hero from '~/components/services/Hero.vue';
import ServicesList from '~/components/services/ServicesList.vue';
import Stepper from '~/components/services/Stepper.vue';
import OnScrollFilledText from '~/components/ui/OnScrollFilledText.vue';
import useScrollSmoother from '~/composables/useScrollSmoother';
import useLoader from '~/composables/useLoader';
import useNavigation from '~/composables/useNavigation';
import { leaveAnimation } from '~/utils/animations/transitions';
import gsap from 'gsap';

const { scrollSmoother } = useScrollSmoother();
const { startLoading } = useLoader();

useSeoMeta({
  title: 'Services | Design, AI & Webflow Development | Psychoactive',
  description:
    'Brand strategy, UX, Webflow development, custom code, and AI integration. End-to-end digital services for ambitious brands across every phase of growth.',
  ogTitle: 'Services | Design, AI & Webflow Development | Psychoactive',
  ogDescription:
    'Brand strategy, UX, Webflow development, custom code, and AI integration. End-to-end digital services for ambitious brands across every phase of growth.',
});

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
      gsap.set(
        gsap.utils.toArray([
          '.services-list__video_player, .services-stepper, .stepper__footer-video, .stepper__footer-video .video',
        ]),
        { clearProps: 'all' }
      );
      done();
    },
    onLeave: (el, done) => {
      const { transitionFromNavigation } = useNavigation();
      if (transitionFromNavigation.value) {
        // When leaving via the nav menu, the menu overlay handles the
        // visual transition. We need to hide both the page wrapper (`el`)
        // AND the pinned stepper content (`#services-fixed-section`) —
        // otherwise, scrolling past the hero and navigating away leaves
        // the stepper videos/titles visible behind the folding menu,
        // causing a flash of the old page before the new one mounts.
        gsap
          .timeline()
          .set(el, { opacity: 0 })
          .set('#services-fixed-section', { display: 'none' })
          .add(() => {
            transitionFromNavigation.value = false;
            done();
          }, '+=1');
        return;
      }

      gsap
        .timeline()
        .to(
          gsap.utils.toArray([
            '.services-list__video_player, .services-stepper, .stepper__footer-video .video',
          ]),
          {
            opacity: 0,
            duration: 0.8,
            ease: 'power4.in',
          },
          '<'
        )
        .set('#services-fixed-section', { display: 'none' });
      leaveAnimation(el, done);
    },
  },
});

onMounted(() => {
  gsap.set('#services-fixed-section', { display: 'block' });
});
</script>

<template>
  <main class="services">
    <ClientOnly>
      <Hero />
    </ClientOnly>
    <div class="container">
      <section class="services__onscroll-text">
        <OnScrollFilledText>
          <span class="dark">From world-class</span>
          creative direction
          <span class="dark">to</span>
          custom code,
          <span class="dark">enterprise</span>
          Webflow,
          <span class="dark">and</span>
          AI-era digital experiences.
          <span class="dark">We help ambitious brands evolve, scale, and lead with confidence.</span>
        </OnScrollFilledText>
      </section>

      <section class="services__ai-layer">
        <OnScrollFilledText>
          <span class="dark">AI runs through</span>
          every phase
          <span class="dark">of our pipeline. It</span>
          sharpens research,
          <span class="dark">accelerates</span>
          design,
          <span class="dark">and automates what used to slow us down,</span>
          without ever replacing the craft.
        </OnScrollFilledText>
      </section>
    </div>
    <section class="services__list">
      <ServicesList />
    </section>
    <section class="services__stepper">
      <Stepper />
    </section>
    <Footer transparent />
  </main>
</template>

<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
.services {
  &__onscroll-text {
    @include flex-center;
    // min-height: 100svh;
    padding: 15dvh 0 0 0;
    max-width: 57vw;
    margin: auto;
    &:deep(.text-block) {
      &::before {
        content: '';
        display: inline-block;
        width: 10vw;
        @include respond(mobile) {
          width: 25vw;
        }
      }
    }
    @include respond(mobile) {
      max-width: 100%;
    }
  }
  &__ai-layer {
    // Secondary AI thesis paragraph — sits below the main intro,
    // slightly smaller and softer so it reads as supporting context
    // rather than duplicating the primary beat. Width matches the
    // intro paragraph above so both blocks share the same column.
    // No leading indent — flush left.
    @include flex-center;
    padding: 6dvh 0 10dvh 0;
    max-width: 57vw;
    margin: auto;
    font-size: 0.85em;
    opacity: 0.9;
    @include respond(mobile) {
      max-width: 100%;
      padding: 4dvh 0 6dvh 0;
    }
  }
}
</style>
