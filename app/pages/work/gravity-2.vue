<script setup>
import { useMediaQuery } from '@vueuse/core';
import gsap from 'gsap';
import Brief from '~/components/layout/Brief.vue';
import WorkTextSection from '~/components/ui/WorkTextSection.vue';
import WorkCTAButton from '~/components/work/WorkCTAButton.vue';

import useWorks from '~/composables/useWorks.js';
import useLoader from '~/composables/useLoader';

const isMobile = useMediaQuery('(max-width: 768px)');
const { isLoading } = useLoader();
const { workPageInit, footerTextAnimationInit } = useWorks();

let ctx;

const footerScrollTextRef = ref(null);

watch(isLoading, (newVal) => {
  if (!newVal) {
    workPageInit();
  }
});

onMounted(async () => {
  ctx = gsap.context(() => {});
  await nextTick();
  animationsInit();
  footerTextAnimationInit(ctx, footerScrollTextRef.value);
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
      const { workPageInit } = useWorks();
      done();
      workPageInit();
    },
    onLeave: (el, done) => {
      const { transitionFromNavigation } = useNavigation();
      if (transitionFromNavigation.value) {
        gsap
          .timeline()
          .set(el, { opacity: 0 })
          .set('#work-scroll-progress', { display: 'none' })
          .add(() => {
            transitionFromNavigation.value = false;
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
          done();
        }, '+=0.1');
    },
  },
});

function animationsInit() {
  ctx.add(() => {
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
  <main class="work">
    <div class="work__header--desktop">
      <!-- Illustration section -->
      <section class="work__illustration">
        <NuxtImg
          src="/img/work/hero-gravity.jpg"
          sizes="sm:768px md:1200px xl:100vw"
          preload
          quality="90"
        />
      </section>

      <!-- Hero section -->
      <section class="work__hero">
        <div class="container">
          <h1 class="work__hero_title">Gravity</h1>
          <div class="work__hero_sub-title">
            Enterprise-Grade Product Development
          </div>
          <ul class="work__hero_info">
            <li><span>WHAT WE DID:</span> Strategy, Design, Development</li>
            <li><span>CLIENT:</span> GRAVITY</li>
          </ul>
          <div class="work__hero_description">
            <p>
              Gravity partnered with Psychoactive to create a new website that
              reflects their evolution into a specialist early-stage innovation
              team delivering market-ready products.
            </p>
            <p>
              Psychoactive shaped a clear narrative, refined the brand
              expression, and built a modern Webflow site that presents
              Gravity’s services, process and work with clarity and confidence.
            </p>
          </div>
        </div>
      </section>
    </div>

    <div class="work__header--mobile">
      <section class="work__hero">
        <div class="container">
          <h1 class="work__hero_title">Gravity</h1>
          <div class="work__hero_sub-title">
            Enterprise-Grade Product Development
          </div>
          <ul class="work__hero_info">
            <li><span>WHAT WE DID:</span> Strategy, Design, Development</li>
            <li><span>CLIENT:</span> GRAVITY</li>
          </ul>
          <div class="work__illustration">
            <NuxtImg
              src="/img/work/hero-gravity.jpg"
              sizes="sm:768px md:1200px xl:100vw"
              preload
              quality="90"
            />
            <div class="work__illustration_bg" />
          </div>
        </div>
      </section>
      <div class="container">
        <div class="work__hero_description">
          <p>
            Gravity partnered with Psychoactive to create a new website that
            reflects their evolution into a specialist early-stage innovation
            team delivering market-ready products.
          </p>
          <p>
            Psychoactive shaped a clear narrative, refined the brand expression,
            and built a modern Webflow site that presents Gravity’s services,
            process and work with clarity and confidence.
          </p>
        </div>
      </div>
    </div>

    <!-- Image 1 section -->
    <section class="work__full-image">
      <div class="container">
        <NuxtImg
          src="/img/work/gravity-1.jpg"
          sizes="sm:768px md:1200px xl:100vw"
          preload
          quality="90"
        />
      </div>
    </section>

    <!-- Text section -->
    <section class="gravity__text-section">
      <div class="container">
        <WorkTextSection title="Defining Gravity’s offer">
          Psychoactive distilled Gravity’s value into simple, direct messaging
          that speaks to enterprise clients and impact ventures. The content
          highlights their ability to move from idea to market with speed,
          precision and commercial focus.
        </WorkTextSection>
      </div>
    </section>

    <!-- Image 2 section -->
    <section class="work__full-image">
      <div class="container">
        <NuxtImg
          src="/img/work/gravity-2.jpg"
          sizes="sm:768px md:1200px xl:100vw"
          preload
          quality="90"
        />
      </div>
    </section>

    <!-- Text section -->
    <section class="gravity__text-section">
      <div class="container">
        <WorkTextSection title="Creating a scalable digital framework">
          Psychoactive designed a site architecture that supports Gravity’s
          current needs and future plans. The CMS-driven structure allows
          Gravity to present their services and case studies in a consistent and
          compelling way, guiding visitors from problem to solution.
        </WorkTextSection>
      </div>
    </section>

    <!-- Image 3 section -->
    <section class="work__full-image">
      <div class="container">
        <NuxtImg
          src="/img/work/gravity-3.jpg"
          sizes="sm:768px md:1200px xl:100vw"
          preload
          quality="90"
        />
      </div>
    </section>

    <!-- Text section -->
    <section class="gravity__text-section">
      <div class="container">
        <WorkTextSection title="Extending the Brand">
          Working from brand foundations created by Gravity’s brand agency,
          Psychoactive introduced refined visuals, motion and interaction
          design. Liquid textures, animated elements and a custom logo sequence
          create a sense of energy and momentum that reflects Gravity’s
          approach.</WorkTextSection
        >
      </div>
    </section>

    <!-- Image 4 section -->
    <section class="work__full-image">
      <div class="container">
        <NuxtImg
          src="/img/work/gravity-4.jpg"
          sizes="sm:768px md:1200px xl:100vw"
          preload
          quality="90"
        />
      </div>
    </section>

    <!-- Text section -->
    <section class="gravity__text-section">
      <div class="container">
        <WorkTextSection title="Built for Performance">
          Psychoactive delivered a fully custom Webflow site with strong
          performance, smooth interactions and a robust CMS structure. The build
          ensures consistency, scalability and a polished digital experience
          across all devices.
        </WorkTextSection>
      </div>
    </section>

    <!-- Image 5 section -->
    <section class="work__full-image">
      <div class="container">
        <NuxtImg
          src="/img/work/gravity-5.jpg"
          sizes="sm:768px md:1200px xl:100vw"
          preload
          quality="90"
        />
      </div>
    </section>

    <!-- CTA section -->
    <WorkCTAButton>
      A confident digital presence that strengthens Gravity’s position as a
      leader in early-stage innovation.
    </WorkCTAButton>

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
</template>
<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;
.gravity {
  .work__header--mobile {
    padding-bottom: 60px;
  }
  &__text-section {
    padding: 240px 0;
    position: relative;
    @include respond(mobile) {
      padding: 60px 0;
    }
  }
  .work__full-image {
    position: relative;
  }
}
</style>
