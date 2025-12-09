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
const { transitionFromNavigation } = useNavigation();

definePageMeta({
  scrollToTop: true,
  pageTransition: {
    css: false,
    mode: 'out-in',
    onEnter: (_, done) => {
      startLoading();
      scrollSmoother.value.scrollTop(0, false);
      gsap.set(
        gsap.utils.toArray([
          '.services-list__video_player, .services-stepper, .stepper__footer-video, .stepper__footer-video .video',
        ]),
        { clearProps: 'all' }
      );
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
        .set(
          gsap.utils.toArray([
            '.services-list__video_player, .services-stepper, .stepper__footer-video',
          ]),
          { display: 'none' }
        );
      leaveAnimation(el, done);
    },
  },
});

// onMounted(() => {
//   setTimeout(() => {
//     enableScroll();
//   }, 100);
// });
</script>

<template>
  <main class="services">
    <Hero />
    <div class="container">
      <section class="services__onscroll-text">
        <OnScrollFilledText>
          <span class="dark">Our work lives at the intersection of</span> art,
          technology <span class="dark">and</span> strategy.
          <span class="dark">From world-class</span>
          creative direction <span class="dark">to</span> custom code
          <span class="dark">and</span> enterprise-grade Webflow development,
          <span class="dark"
            >we help ambitious brands evolve, scale and lead with
            confidence.</span
          >
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
    // min-height: 100dvh;
    padding: 15dvh 0 0 0;
    max-width: 57vw;
    margin: auto;
    &:deep(.text-block) {
      &::before {
        content: '';
        display: inline-block;
        width: 10vw;
      }
    }
  }
}
</style>
