<script setup>
import Footer from '~/components/layout/Footer.vue';
import Hero from '~/components/services/Hero.vue';
import ServicesList from '~/components/services/ServicesList.vue';
import Stepper from '~/components/services/Stepper.vue';
import OnScrollFilledText from '~/components/ui/OnScrollFilledText.vue';
import useScrollSmoother from '~/composables/useScrollSmoother';
import useLoader from '~/composables/useLoader';
import useNavigation from '~/composables/useNavigation';
import { leaveAnimation, navTransitionOut } from '~/utils/animations/transitions';
import { stepperTitlesData } from '~/data/servicesData';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LinkWithHover from '~/components/ui/LinkWithHover.vue';

const { scrollSmoother } = useScrollSmoother();
const { startLoading } = useLoader();

// Fade-to-black transition for phase-jump navigation.
// Scrolling through the stepper at speed looks janky because GSAP has
// to interpolate through ~9vh of heavy animations in a compressed
// window. Instead: fade the screen to black, jump to the target
// instantly, then fade back in. Feels premium and masks the animation
// cost entirely.
const phaseTransitionRef = ref(null);

// Per-phase landing offsets (in units of viewport height).
//
// The stepper animations don't have uniform intervals — each phase
// transition covers a different xPercent range, so the scroll position
// where a given phase is "fully revealed" differs by phase.
//
// Tuning rule:
//   - Negative values = scroll LESS than the anchor's position
//   - More negative = land earlier in the scroll journey (shows
//     content before the target phase's transition completes)
//   - Less negative (or positive) = land later (further into the
//     stepper, past the target phase's transition completion)
//
// If a phase lands showing previous phase's content → make LESS
// negative. If it overshoots into the next phase → make MORE negative.
const phaseOffsetMultipliers = {
  1: -1.0,   // verified correct
  2: -0.85,  // slightly more negative than -0.75 to pull title back
  3: -0.85,
  4: -0.85,
};

const scrollToPhase = (phaseNumber) => {
  const el = document.querySelector(`#phase-${phaseNumber}`);
  const overlay = phaseTransitionRef.value;
  if (!el || !scrollSmoother.value || !overlay) return;

  const offsetMultiplier = phaseOffsetMultipliers[phaseNumber] ?? -1;

  gsap
    .timeline()
    .to(overlay, {
      opacity: 1,
      duration: 0.3,
      ease: 'power2.inOut',
    })
    .add(() => {
      scrollSmoother.value.scrollTo(el, {
        immediate: true,
        force: true,
        offset: offsetMultiplier * window.innerHeight,
      });
      ScrollTrigger.update();
    })
    .to({}, { duration: 0.3 })
    .to(overlay, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.inOut',
    });
};

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
        navTransitionOut(el, done, {
          alsoHide: () => {
            gsap.set('#services-fixed-section', { display: 'none' });
          },
        });
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

    <!--
      Services list (with circular video) sits BEFORE the phase nav on
      desktop so the video reveal lands above/ahead of the nav in the
      scroll sequence. On mobile, phase-nav is `display: none` so its
      position in the DOM doesn't affect the visual flow.
    -->
    <section class="services__list">
      <ServicesList />
    </section>

    <div class="container">
      <nav class="phase-navigation" aria-label="Jump to service phase">
        <ul class="links">
          <template
            v-for="(phase, index) in stepperTitlesData"
            :key="phase.number"
          >
            <li class="link body-button">
              <a
                :href="`#phase-${index + 1}`"
                @click.prevent="scrollToPhase(index + 1)"
              >
                <LinkWithHover>{{ phase.title }}</LinkWithHover>
              </a>
            </li>
            <li
              v-if="index < stepperTitlesData.length - 1"
              class="separator"
            />
          </template>
        </ul>
      </nav>
    </div>

    <!-- Fade-to-black overlay used by the phase-link navigation. -->
    <div ref="phaseTransitionRef" class="services__phase-transition" aria-hidden="true" />
    <section class="services__stepper">
      <Stepper />
    </section>
    <Footer transparent />
  </main>
</template>

<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/functions' as *;
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
    // Larger bottom padding on desktop creates breathing room before
    // the services-list section (with its circular video) begins.
    @include flex-center;
    padding: 6dvh 0 14dvh 0;
    max-width: 57vw;
    margin: auto;
    font-size: 0.85em;
    opacity: 0.9;
    @include respond(mobile) {
      max-width: 100%;
      padding: 4dvh 0 3dvh 0;
    }
  }

  // Phase-jump navigation. Literal copy of the footer nav pattern
  // (class names, structure, separator treatment) — just scoped here
  // with a different outer class to avoid clashing with the real footer.
  // Sits below the AI thesis paragraph and lets users jump to any
  // stepper phase. Hidden on mobile where the stepper is a flat list.
  .phase-navigation {
    // Top padding matches the 423px gap between items in ServicesList
    // so the phase-nav reads as another "row" in that vertical rhythm.
    // ServicesList has its desktop bottom padding zeroed to avoid a
    // double-up. Mobile is display:none so the padding doesn't apply.
    padding: 423px 0 4dvh 0;
    position: relative;
    z-index: 3;
    @include respond(mobile) {
      display: none;
    }
    .links {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: getRem(24);
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .link {
      a {
        display: block;
        color: inherit;
        text-decoration: none;
        cursor: pointer;
      }
      // LinkWithHover renders a <span> when used without href. Spans
      // are display: inline by default, which means the width-fix in
      // LinkWithHover (gsap.set width) has no effect — the scramble
      // text then changes the element's natural width and pushes the
      // flex siblings around. Making it inline-block lets the fixed
      // width actually hold.
      :deep(.link-with-hover) {
        display: inline-block;
      }
    }
    .separator {
      flex-grow: 1;
      height: 1px;
      background-color: white(20);
      position: relative;
      &::before {
        content: '';
        position: absolute;
        top: -3px;
        left: -4px;
        width: 7px;
        height: 7px;
        background-color: white(50);
        border-radius: 50%;
      }
      &::after {
        content: '';
        position: absolute;
        top: -3px;
        right: -4px;
        width: 7px;
        height: 7px;
        background-color: white(50);
        border-radius: 50%;
      }
    }
  }

  // Full-screen black overlay used by the phase-link transition.
  // Normally opacity 0 with `pointer-events: none` so it doesn't
  // intercept clicks. GSAP animates opacity up during the jump.
  &__phase-transition {
    position: fixed;
    inset: 0;
    background-color: $color-background;
    z-index: 9999;
    opacity: 0;
    pointer-events: none;
  }
}
</style>
