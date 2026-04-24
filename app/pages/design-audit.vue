<script setup>
import gsap from 'gsap';

import Footer from '~/components/layout/Footer.vue';
import AuditHero from '~/components/audit/AuditHero.vue';
import AuditScoreCard from '~/components/audit/AuditScoreCard.vue';
import AuditEmailGate from '~/components/audit/AuditEmailGate.vue';
import AuditFullReport from '~/components/audit/AuditFullReport.vue';
import AuditRecentTicker from '~/components/audit/AuditRecentTicker.vue';
import GenerativePainting from '~/components/audit/GenerativePainting.vue';

import useDesignAudit from '~/composables/useDesignAudit';
import useScrollSmoother from '~/composables/useScrollSmoother';
import useNavigation from '~/composables/useNavigation';
import useLoader from '~/composables/useLoader';
import { leaveAnimation } from '~/utils/animations/transitions';

const {
  state,
  url,
  report,
  auditedUrl,
  heroImageUrl,
  pageTitle,
  errorMessage,
  leadForm,
  leadError,
  isAuditing,
  isTeaser,
  isSubmitting,
  isUnlocked,
  hasError,
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

// Generative painting snapshot — emitted by GenerativePainting once the
// audit lands. Passed into AuditScoreCard as the "painting your site
// inspired" thumbnail. Null until the first audit completes.
const paintingSnapshot = ref(null);
function onPaintingSnapshot(dataUrl) {
  paintingSnapshot.value = dataUrl;
}

// Progressive loading indicator — steps through 0/1/2 during an audit
// so the user gets visual feedback that something's happening rather
// than staring at static text for 30-60s.
// Tuning: real audit time averages ~40s, so stepping every ~18s means
// most audits hit "Writing findings" just before resolving.
const loadingStep = ref(0);
const LOADING_STEP_INTERVAL_MS = 18000;
let loadingStepTimer = null;

watch(isAuditing, (auditing) => {
  if (auditing) {
    loadingStep.value = 0;
    if (loadingStepTimer) clearInterval(loadingStepTimer);
    loadingStepTimer = setInterval(() => {
      if (loadingStep.value < 2) loadingStep.value += 1;
    }, LOADING_STEP_INTERVAL_MS);
  } else {
    if (loadingStepTimer) {
      clearInterval(loadingStepTimer);
      loadingStepTimer = null;
    }
    loadingStep.value = 0;
  }
});

onUnmounted(() => {
  if (loadingStepTimer) clearInterval(loadingStepTimer);
});

function stepState(idx) {
  if (idx < loadingStep.value) return 'done';
  if (idx === loadingStep.value) return 'active';
  return 'pending';
}

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
//
// Auto-start is decoupled from the loader: the audit should kick off
// as soon as we have a URL to work with, regardless of whether the
// global mushroom loader has finished its animation cycle. The visual
// reveal still waits on the loader so the page doesn't flash in
// behind the spinning logo.
onMounted(async () => {
  await nextTick();
  const el = document.querySelector('.design-audit');

  // Auto-start from ?url= immediately — by the time the audit returns
  // (~30-60s), the loader will be long gone and the teaser will pop in.
  maybeAutoRunFromQuery();

  if (isLoading.value) {
    const stopWatch = watch(isLoading, (loading) => {
      if (!loading) {
        enterAnimation(el);
        stopWatch();
      }
    });
  } else {
    enterAnimation(el);
  }
});

// If the page was opened with ?url=…, pre-fill the input and kick off
// the audit. Gives us one-click entry from the content-hub promo card.
const route = useRoute();

// Set at setup time (not in onMounted) so the hero renders directly
// in its compressed form on first paint rather than flashing the
// expanded layout for a frame before onMounted runs. Cleared after
// the first beat so subsequent state transitions animate normally.
const hasQueryUrl = computed(() => !!route.query.url);
const skipInitialTransition = ref(hasQueryUrl.value);

// Same reason — compress the hero on first render if we're about to
// auto-run from the query param, even before the state machine flips
// to AUDITING. State flags still drive compression post-first-render.
// hasError is included so the hero doesn't snap back to its expanded
// state after a failed audit — smoother visual continuity, error
// displays in the compressed layout.
const isHeroCompressed = computed(
  () =>
    isAuditing.value ||
    isTeaser.value ||
    isSubmitting.value ||
    isUnlocked.value ||
    hasError.value ||
    hasQueryUrl.value
);

// Dev-only: ?paintOnly=<ms> forces the page into the AUDITING state
// for the given duration so we can preview the generative painting
// locally without needing API env vars. Stripped from production
// bundles via import.meta.dev.
//
// Values:
//   ?paintOnly=1      → 42s default duration
//   ?paintOnly=30000  → explicit 30s (anything >=1000 is treated as ms)
//   ?paintOnly=1&url=https://apple.com → also seeds the painting
function maybeDevPaintOnly() {
  if (!import.meta.dev) return false;
  const q = route.query.paintOnly;
  if (!q) return false;
  const parsed = parseInt(q, 10) || 0;
  // Small values (e.g. 1) mean "on with default duration".
  // Values >=1000 are interpreted as explicit milliseconds.
  const ms = parsed >= 1000 ? Math.min(120000, parsed) : 42000;
  const devUrl =
    (typeof route.query.url === 'string' ? route.query.url : '') ||
    'https://psychoactive.co.nz';
  // Use the page-level destructured state/auditedUrl refs directly.
  // Calling useDesignAudit() fresh here would return new refs that
  // aren't the ones driving the template — a subtle bug I hit on the
  // first pass. This mutation flows through to GenerativePainting via
  // the :state="state" binding in the template.
  url.value = devUrl;
  auditedUrl.value = devUrl;
  state.value = 'auditing';
  setTimeout(() => {
    state.value = 'idle';
  }, ms);
  return true;
}

function maybeAutoRunFromQuery() {
  if (maybeDevPaintOnly()) return;
  const q = route.query.url;
  const initial = Array.isArray(q) ? q[0] : q;
  if (!initial || typeof initial !== 'string') return;
  url.value = initial;
  runAudit(initial);

  // Re-enable transitions a beat later so *future* state changes
  // (e.g. "Run another?" → user types → new audit) animate normally.
  setTimeout(() => {
    skipInitialTransition.value = false;
  }, 300);
}

async function onAuditSubmit() {
  await runAudit();
  if (!isTeaser.value) return;
  await nextTick();
  // New content has appeared below the hero — let Lenis recalc page
  // height. We used to force-scroll to the score card here, but the
  // compressed hero pattern already shifts focus to the results below,
  // so pushing the scroll on top of that felt heavy-handed. Let the
  // user scroll at their own pace.
  scrollSmoother.value?.resize?.();
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

// Dynamic SEO meta — when the page is loaded with ?url=X, the title
// and OG text name that specific site, so shared links read better
// than a generic "Free Design Audit". The actual score isn't
// available at SSR time (audit hasn't run yet), so the content stays
// invitational rather than result-specific.
const targetHostname = computed(() => {
  const q = route.query.url;
  const raw = Array.isArray(q) ? q[0] : q;
  if (!raw || typeof raw !== 'string') return '';
  try {
    return new URL(raw).hostname.replace(/^www\./, '');
  } catch {
    return raw.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }
});

useSeoMeta({
  title: () =>
    targetHostname.value
      ? `Design audit: ${targetHostname.value} | Psychoactive Studios`
      : 'Free Design Audit | Psychoactive Studios',
  description: () =>
    targetHostname.value
      ? `A free design audit of ${targetHostname.value} — scored across clarity, conversion, copy, structure, and trust. Specific findings, one fix-first per category.`
      : "Get a free design audit of your website in about a minute. We'll score it across clarity, conversion, copy, structure, and trust — with specific findings and the one thing to fix first.",
  ogTitle: () =>
    targetHostname.value
      ? `Design audit: ${targetHostname.value}`
      : 'Free Design Audit | Psychoactive Studios',
  ogDescription: () =>
    targetHostname.value
      ? `A free design audit of ${targetHostname.value} — scored across clarity, conversion, copy, structure, and trust.`
      : "Get a free design audit of your website in about a minute. We'll score it across clarity, conversion, copy, structure, and trust.",
});

// Tell nuxt-og-image to render the DesignAuditOg component at
// request time for this page's og:image. Props are scraped into the
// generator URL so the image varies per shared link.
defineOgImageComponent('DesignAuditOg', {
  auditedUrl: computed(() => {
    const q = route.query.url;
    const raw = Array.isArray(q) ? q[0] : q;
    return raw || '';
  }),
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
    <!--
      Generative painting that writes itself across the full viewport
      while the audit runs. URL-seeded so the same site always produces
      the same piece; every URL produces a distinct one. Hidden outside
      the auditing state. On completion it emits a snapshot which we
      pass down to the score card as a keepsake thumbnail.
    -->
    <GenerativePainting
      :state="state"
      :url="auditedUrl || url"
      @snapshot="onPaintingSnapshot"
    />

    <AuditHero
      v-model="url"
      :is-auditing="isAuditing"
      :is-compressed="isHeroCompressed"
      :audited-url="auditedUrl || ''"
      :skip-initial-transition="skipInitialTransition"
      :error-message="errorMessage"
      @submit="onAuditSubmit"
    />

    <!--
      Social-proof ticker — only shown in the idle state (before the
      user has submitted a URL). Once they've kicked off an audit the
      focus should be on their own results, not other people's.
    -->
    <AuditRecentTicker v-if="!isHeroCompressed" />

    <div v-if="isAuditing" class="design-audit__loading">
      <div class="container">
        <ul class="design-audit__steps">
          <li
            class="design-audit__step"
            :data-state="stepState(0)"
          >
            <span class="design-audit__step-marker" aria-hidden="true" />
            <span class="design-audit__step-label subheader--mobile">
              Reading the page
            </span>
          </li>
          <li
            class="design-audit__step"
            :data-state="stepState(1)"
          >
            <span class="design-audit__step-marker" aria-hidden="true" />
            <span class="design-audit__step-label subheader--mobile">
              Scoring across five categories
            </span>
          </li>
          <li
            class="design-audit__step"
            :data-state="stepState(2)"
          >
            <span class="design-audit__step-marker" aria-hidden="true" />
            <span class="design-audit__step-label subheader--mobile">
              Writing the findings
            </span>
          </li>
        </ul>
        <p class="design-audit__loading-hint body-small--mobile">
          This usually takes 30-60 seconds.
        </p>
      </div>
    </div>

    <!--
      Score card sits below the hero. Its reveal is delayed slightly
      via CSS transition (see .design-audit__result-slot) so it fades
      in AFTER the hero finishes compressing — the user's eye tracks
      the state change top-to-bottom instead of everything moving at
      once.
    -->
    <div
      v-if="isTeaser || isSubmitting || isUnlocked"
      ref="scoreCardRef"
      class="design-audit__result-slot"
    >
      <AuditScoreCard
        v-if="report"
        :report="report"
        :audited-url="auditedUrl"
        :hero-image-url="heroImageUrl"
        :page-title="pageTitle"
        :painting-snapshot="paintingSnapshot"
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
      <AuditFullReport
        v-if="report"
        :report="report"
        :audited-url="auditedUrl || ''"
      />
    </div>

    <!--
      Visually-hidden live region so screen readers get told when the
      audit starts + finishes. `polite` doesn't interrupt the user's
      current reading — just queues the announcement.
    -->
    <div class="sr-only" aria-live="polite" aria-atomic="true">
      <span v-if="isAuditing">Running audit. This usually takes 30 to 60 seconds.</span>
      <span v-else-if="isTeaser && report">
        Audit complete. Your site scored {{ report.overall_score }} out of 100.
      </span>
      <span v-else-if="isUnlocked">Full report unlocked.</span>
    </div>

    <Footer />
  </main>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;

.design-audit {
  // Make sure all direct children layer above the fixed tadpole canvas
  // (which sits at z-index: 0). The canvas has pointer-events: none so
  // this is purely a visual stacking concern.
  position: relative;
  z-index: 1;

  &__loading {
    padding: 4dvh 0 12dvh 0;
    .container {
      @include container;
      max-width: 1280px;
    }
  }

  // Progressive step list — three rows, each with a marker dot that
  // reflects state (pending / active / done). The active dot pulses
  // so the user always has something live to look at during the
  // 30-60s audit window.
  &__steps {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
  }

  &__step {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid white(10);
    opacity: 0;
    animation: audit-loading-fade 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    transition:
      opacity 0.4s ease,
      color 0.4s ease;
    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.9s; }
    &:nth-child(3) { animation-delay: 1.8s; }

    &[data-state='pending'] {
      color: white(30);
    }
    &[data-state='active'] {
      color: white(85);
    }
    &[data-state='done'] {
      color: white(50);
    }
  }

  &__step-marker {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
    position: relative;
    transition:
      background-color 0.4s ease,
      border-color 0.4s ease,
      transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);

    .design-audit__step[data-state='pending'] & {
      background: transparent;
      border: 1px solid white(20);
    }

    .design-audit__step[data-state='active'] & {
      background: white(80);
      border: 1px solid white(80);
      animation: audit-step-pulse 1.6s ease-in-out infinite;
    }

    .design-audit__step[data-state='done'] & {
      background: white(45);
      border: 1px solid white(45);
      // Small inner dot indicates "completed" without needing a
      // checkmark icon — fits the minimal aesthetic.
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: #1b1b1b;
        transform: translate(-50%, -50%);
      }
    }
  }

  &__step-label {
    font-family: 'RoobertMono';
    text-transform: uppercase;
    letter-spacing: 0.02em;
    font-size: getRem(14);
  }

  &__loading-hint {
    color: white(35);
    margin-top: 24px;
  }

  // Sequences the score card's reveal to happen AFTER the hero
  // compression animation (~550ms) completes, so the user's eye
  // tracks the state change top-to-bottom instead of everything
  // animating at once.
  &__result-slot {
    animation: audit-result-reveal 0.5s cubic-bezier(0.32, 0.72, 0, 1) 0.45s backwards;
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

@keyframes audit-result-reveal {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Active step indicator pulses gently — 1.6s cycle is slow enough to
// read as "thinking" rather than "error/alert" and fast enough to
// feel alive.
@keyframes audit-step-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.35);
  }
  50% {
    transform: scale(1.15);
    box-shadow: 0 0 0 6px rgba(255, 255, 255, 0);
  }
}

// Visually hidden but still announced by screen readers. Used for the
// aria-live audit-status region.
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .design-audit__step,
  .design-audit__step-marker,
  .design-audit__result-slot {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
