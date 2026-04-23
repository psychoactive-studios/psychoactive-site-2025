<script setup>
import gsap from 'gsap';

import Footer from '~/components/layout/Footer.vue';
import AuditHero from '~/components/audit/AuditHero.vue';
import AuditScoreCard from '~/components/audit/AuditScoreCard.vue';
import AuditEmailGate from '~/components/audit/AuditEmailGate.vue';
import AuditFullReport from '~/components/audit/AuditFullReport.vue';

import useDesignAudit from '~/composables/useDesignAudit';
import useScrollSmoother from '~/composables/useScrollSmoother';
import useNavigation from '~/composables/useNavigation';
import useLoader from '~/composables/useLoader';
import { leaveAnimation } from '~/utils/animations/transitions';

const {
  url,
  report,
  auditedUrl,
  errorMessage,
  leadForm,
  leadError,
  isAuditing,
  isTeaser,
  isSubmitting,
  isUnlocked,
  runAudit,
  submitLead,
} = useDesignAudit();

const { scrollSmoother, enableScroll } = useScrollSmoother();
const { showLayoutElementsRequired } = useNavigation();
const { isLoading } = useLoader();

// Watch for the teaser/unlocked transitions so we can bring the results
// into view cleanly.
const scoreCardRef = ref(null);
const emailGateRef = ref(null);
const fullReportRef = ref(null);

// Track whether the entry animation has run — so we only reveal the
// page content once even if both onMounted and onEnter fire.
let hasEntered = false;

function enterAnimation(el) {
  if (hasEntered) {
    // Still make sure scroll is live in case we re-enter.
    enableScroll();
    return;
  }
  hasEntered = true;

  const layoutElements = gsap.utils.toArray([
    '#header-logo',
    '#header-navigation-button',
    '#header-sound-button',
  ]);
  if (el) gsap.set(el, { visibility: 'visible' });

  gsap
    .timeline()
    .to(layoutElements, {
      scale: 1,
      opacity: 1,
      duration: 0.6,
      ease: 'power3.out',
    })
    .add(() => {
      enableScroll();
      showLayoutElementsRequired.value = false;
    });
}

// Fire once on first mount — covers the direct-load case where the
// pageTransition onEnter hook doesn't fire.
onMounted(async () => {
  await nextTick();
  const el = document.querySelector('.design-audit');
  const reveal = () => {
    enterAnimation(el);
    maybeAutoRunFromQuery();
  };

  if (isLoading.value) {
    const stopWatch = watch(isLoading, (loading) => {
      if (!loading) {
        reveal();
        stopWatch();
      }
    });
  } else {
    reveal();
  }
});

// If the page was opened with ?url=…, pre-fill the input and kick off
// the audit. Gives us one-click entry from the content-hub promo card.
const route = useRoute();
function maybeAutoRunFromQuery() {
  const q = route.query.url;
  const initial = Array.isArray(q) ? q[0] : q;
  if (!initial || typeof initial !== 'string') return;
  url.value = initial;
  // Small delay so the hero is visible briefly before the state flips
  // to "auditing" — otherwise the transition feels abrupt.
  setTimeout(() => {
    runAudit(initial);
  }, 250);
}

async function onAuditSubmit() {
  await runAudit();
  if (!isTeaser.value) return;
  await nextTick();
  // New content has appeared below the hero — let Lenis recalc page height.
  scrollSmoother.value?.resize?.();
  scrollTo(scoreCardRef.value);
}

async function onLeadSubmit() {
  await submitLead();
  if (!isUnlocked.value) return;
  await nextTick();
  scrollSmoother.value?.resize?.();
  scrollTo(fullReportRef.value);
}

function scrollTo(el) {
  if (!el) return;
  // Prefer the site's smooth scroller when it's available.
  const smoother = scrollSmoother.value;
  if (smoother?.scrollTo) {
    smoother.scrollTo(el, true, 'top 80px');
    return;
  }
  const rect = el.getBoundingClientRect();
  const top = rect.top + window.scrollY - 80;
  window.scrollTo({ top, behavior: 'smooth' });
}

useSeoMeta({
  title: 'Free Design Audit | Psychoactive Studios',
  description:
    "Get a free design audit of your website in about a minute. We'll score it across clarity, conversion, copy, structure, and trust — with specific findings and the one thing to fix first.",
  ogTitle: 'Free Design Audit | Psychoactive Studios',
  ogDescription:
    "Get a free design audit of your website in about a minute. We'll score it across clarity, conversion, copy, structure, and trust.",
});

definePageMeta({
  scrollToTop: true,
  pageTransition: {
    css: false,
    mode: 'out-in',
    onEnter: (el, done) => {
      done();
      scrollSmoother.value?.scrollTo?.(0, {
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
</script>

<template>
  <main class="design-audit">
    <AuditHero
      v-model="url"
      :is-auditing="isAuditing"
      :error-message="errorMessage"
      @submit="onAuditSubmit"
    />

    <div v-if="isAuditing" class="design-audit__loading">
      <div class="container">
        <p class="design-audit__loading-line subheader--mobile">
          Reading the page…
        </p>
        <p class="design-audit__loading-line subheader--mobile">
          Scoring it against the rubric…
        </p>
        <p class="design-audit__loading-line subheader--mobile">
          Writing the findings…
        </p>
        <p class="design-audit__loading-hint body-small--mobile">
          This takes about 30-60 seconds.
        </p>
      </div>
    </div>

    <div v-if="isTeaser || isSubmitting || isUnlocked" ref="scoreCardRef">
      <AuditScoreCard
        v-if="report"
        :report="report"
        :audited-url="auditedUrl"
      />
    </div>

    <div v-if="isTeaser || isSubmitting" ref="emailGateRef">
      <AuditEmailGate
        :lead-form="leadForm"
        :is-submitting="isSubmitting"
        :error-message="leadError"
        @submit="onLeadSubmit"
      />
    </div>

    <div v-if="isUnlocked" ref="fullReportRef">
      <AuditFullReport v-if="report" :report="report" />
    </div>

    <Footer />
  </main>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;

.design-audit {
  &__loading {
    padding: 4dvh 0 12dvh 0;
    .container {
      @include container;
      max-width: 1280px;
    }
  }

  &__loading-line {
    color: white(50);
    padding: 12px 0;
    border-bottom: 1px solid white(10);
    opacity: 0;
    animation: audit-loading-fade 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 1.5s; }
    &:nth-child(3) { animation-delay: 3s; }
  }

  &__loading-hint {
    color: white(35);
    margin-top: 24px;
  }
}

@keyframes audit-loading-fade {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .design-audit__loading-line {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
