<script setup>
import { useMediaQuery } from '@vueuse/core';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import Brief from '~/components/layout/Brief.vue';
import LinkButton from '~/components/ui/LinkButton.vue';
import WorkTextSection from '~/components/ui/WorkTextSection.vue';
import WorkCTAButton from '~/components/work/WorkCTAButton.vue';
import useScrollSmoother from '~/composables/useScrollSmoother';

const { enableScroll } = useScrollSmoother();
const isMobile = useMediaQuery('(max-width: 768px)');

let ctx;
const numbersRef = ref(null);
const footerScrollTextRef = ref(null);

const data = ref({
  attendees: 7000,
  companies: 1000,
  countries: 100,
  websites: 826,
  googleSearches: 230,
  mediaStories: 1200,
});

const router = useRouter();

onMounted(async () => {
  ctx = gsap.context(() => {});

  setTimeout(() => {
    const layoutElements = gsap.utils.toArray([
      '#header-logo',
      '#header-navigation-button',
      '#header-sound-button',
    ]);
    gsap.to(layoutElements, {
      scale: 1,
      opacity: 1,
      duration: 0.75,
      ease: 'power3.out',
    });
    enableScroll();
  }, 200);
  await nextTick();
  animationsInit();
  footerTextAnimationInit();
});

onUnmounted(() => {
  ctx.revert();
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

async function footerTextAnimationInit() {
  SplitText.create(footerScrollTextRef.value, {
    type: 'words,chars',
    charsClass: 'char-center',
  });

  await nextTick();

  ctx.add(() => {
    gsap.to(footerScrollTextRef.value.querySelectorAll('.char-center'), {
      scrollTrigger: {
        trigger: footerScrollTextRef.value,
        start: 'top bottom',
        end: () =>
          document.querySelector('.work__footer_scroll').getBoundingClientRect()
            .top,
        scrub: true,
        invalidateOnRefresh: true,
        onLeave: () => {
          router.push('/work');
        },
      },
      opacity: 1,
      duration: 0.1,
      stagger: 0.05,
    });
  });
}
</script>
<template>
  <main class="work gravity">
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
