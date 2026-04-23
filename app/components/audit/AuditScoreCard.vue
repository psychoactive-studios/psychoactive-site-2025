<script setup>
import gsap from 'gsap';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '#shared/audit-types';
import AuditShare from '~/components/audit/AuditShare.vue';

const props = defineProps({
  report: {
    type: Object,
    required: true,
  },
  auditedUrl: {
    type: String,
    default: '',
  },
  // og:image / twitter:image / apple-touch-icon from the audited page,
  // if any. Shown as a preview so the user has a visual anchor for
  // "this is what was audited" rather than just the URL. Null-safe —
  // the preview hides cleanly when no image is available.
  heroImageUrl: {
    type: String,
    default: '',
  },
  // <title> of the audited page. Shown as a caption below the preview
  // so the user sees what the page is actually about, not just a URL.
  pageTitle: {
    type: String,
    default: '',
  },
});

// If the preview image fails to load (404, CORS block, broken path),
// hide it rather than showing a broken-image icon.
const imageBroken = ref(false);

const showPreview = computed(
  () => !!props.heroImageUrl && !imageBroken.value
);

const categories = computed(() =>
  CATEGORY_ORDER.map((key) => {
    const c = props.report?.categories?.[key] || {};
    return {
      key,
      label: CATEGORY_LABELS[key],
      score: typeof c.score === 'number' ? c.score : 0,
      findings: Array.isArray(c.findings) ? c.findings : [],
    };
  })
);

// Verbal band + accent tint for the overall score. Friendlier than
// "MID" / "EXCELLENT" — reads as an assessment rather than a grade.
// The accent name maps to a CSS class that tints the band pill.
const overallAssessment = computed(() => {
  const s = props.report?.overall_score || 0;
  if (s >= 85) return { label: 'Exceptional', accent: 'gold' };
  if (s >= 70) return { label: 'Strong foundations', accent: 'warm' };
  if (s >= 55) return { label: 'Room to grow', accent: 'neutral' };
  if (s >= 35) return { label: 'Needs work', accent: 'cool' };
  return { label: 'Struggling', accent: 'cold' };
});

// Animated mirror of the overall score — GSAP counts this up from 0
// to the real value on mount, so the reveal feels like a scoreboard
// flip rather than a static number appearing. Prefers-reduced-motion
// users skip the tween and see the final number immediately.
const animatedScore = ref(0);
const rootRef = ref(null);

onMounted(async () => {
  await nextTick();
  const target = props.report?.overall_score ?? 0;

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    animatedScore.value = target;
    return;
  }

  // Count-up tween — ease-out-quart so it slows into the final number.
  const scoreObj = { value: 0 };
  gsap.to(scoreObj, {
    value: target,
    duration: 1.4,
    ease: 'power4.out',
    onUpdate: () => {
      animatedScore.value = Math.round(scoreObj.value);
    },
  });

  // Category bars fill in sequence — each scales from 0 to its target
  // width. Starts ~200ms after the score begins counting so the big
  // number is the first thing the eye catches.
  const bars = rootRef.value?.querySelectorAll('.score-card__bar-fill') || [];
  bars.forEach((bar, i) => {
    const target = parseFloat(bar.dataset.target) || 0;
    gsap.fromTo(
      bar,
      { scaleX: 0 },
      {
        scaleX: target,
        duration: 1.0,
        delay: 0.2 + i * 0.1,
        ease: 'power3.out',
      }
    );
  });
});

// Counts across all findings for the teaser summary row.
const findingCounts = computed(() => {
  const out = { win: 0, issue: 0, opportunity: 0 };
  categories.value.forEach((c) => {
    c.findings.forEach((f) => {
      if (out[f.type] !== undefined) out[f.type] += 1;
    });
  });
  return out;
});
</script>

<template>
  <section ref="rootRef" class="score-card">
    <div class="container">
      <!--
        Editorial split lockup: preview image on the left, score + band
        on the right. Falls back to score-only (full-width) when the
        audited site has no og:image. Inspired by project-header layouts
        from award sites — image anchors the page visually, big score
        typography carries the rating.
      -->
      <div
        class="score-card__lockup"
        :class="{ 'score-card__lockup--with-preview': showPreview }"
      >
        <figure v-if="showPreview" class="score-card__preview">
          <a
            :href="auditedUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="score-card__preview-link"
            :title="`Open ${auditedUrl} in a new tab`"
          >
            <img
              :src="heroImageUrl"
              :alt="`Preview of ${auditedUrl}`"
              class="score-card__preview-img"
              loading="lazy"
              decoding="async"
              referrerpolicy="no-referrer"
              @error="imageBroken = true"
            />
          </a>
          <figcaption v-if="pageTitle" class="score-card__preview-caption">
            {{ pageTitle }}
          </figcaption>
        </figure>

        <div class="score-card__headline">
          <div class="score-card__overall">
            <span class="score-card__overall-number">
              {{ animatedScore }}
            </span>
            <span class="score-card__overall-total">/100</span>
          </div>
          <p
            class="score-card__band subheader--mobile"
            :class="`score-card__band--${overallAssessment.accent}`"
          >
            {{ overallAssessment.label }}
          </p>
        </div>
      </div>

      <p class="score-card__summary body-large--mobile">
        {{ report.summary }}
      </p>

      <ul class="score-card__categories">
        <li
          v-for="cat in categories"
          :key="cat.key"
          class="score-card__category"
        >
          <div class="score-card__category-row">
            <span class="score-card__category-label body-small--mobile">
              {{ cat.label }}
            </span>
            <span class="score-card__category-score subheader--mobile">
              {{ cat.score }}/20
            </span>
          </div>
          <div class="score-card__bar">
            <div
              class="score-card__bar-fill"
              :data-target="Math.max(0, Math.min(cat.score, 20)) / 20"
            />
          </div>
        </li>
      </ul>

      <div class="score-card__tally">
        <span class="score-card__tally-item">
          <strong>{{ findingCounts.win }}</strong> wins
        </span>
        <span class="score-card__tally-sep">·</span>
        <span class="score-card__tally-item">
          <strong>{{ findingCounts.issue }}</strong> issues
        </span>
        <span class="score-card__tally-sep">·</span>
        <span class="score-card__tally-item">
          <strong>{{ findingCounts.opportunity }}</strong> opportunities
        </span>
        <span class="score-card__tally-suffix">to unlock below.</span>
      </div>

      <!--
        Inline share row at the end of the teaser. Keeps the social
        loop available even for people who don't unlock the full
        report. Subtle variant so it doesn't compete with the teaser's
        primary job (getting the email).
      -->
      <AuditShare
        v-if="auditedUrl"
        class="score-card__share"
        :audited-url="auditedUrl"
        :score="report?.overall_score ?? null"
        variant="subtle"
      />
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;

.score-card {
  padding: 4dvh 0 8dvh 0;

  .container {
    @include container;
    max-width: 1280px;
  }

  &__meta {
    display: flex;
    align-items: baseline;
    gap: 16px;
    margin-bottom: 48px;
    flex-wrap: wrap;
    @include respond(mobile) {
      margin-bottom: 32px;
    }
  }

  &__eyebrow {
    color: white(50);
  }

  &__url {
    color: white(80);
    word-break: break-all;
  }

  // Editorial split lockup — image on the left, score + band on the
  // right. Asymmetric 1.4fr / 1fr ratio pushes the image into the
  // dominant visual slot while the score floats on the right edge as
  // a rating "stamp". Aligned to the bottom of both columns so the
  // big score number sits on the same baseline as the image — creates
  // a strong horizon line across the composition (Awwwards / FWA
  // project-header pattern).
  &__lockup {
    margin-bottom: 48px;
    @include respond(mobile) {
      margin-bottom: 32px;
    }

    &--with-preview {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 48px;
      align-items: end;

      @include respond(mobile) {
        grid-template-columns: 1fr;
        gap: 24px;
        align-items: stretch;
      }

      // Inside the split lockup, stack the score vertically and push
      // it to the page edge. Big number + /100 on top, small band
      // pill below as a caption. Reads like a rating stamp on a
      // magazine cover.
      .score-card__headline {
        flex-direction: column;
        align-items: flex-end;
        text-align: right;
        gap: 14px;
        margin-bottom: 0;

        @include respond(mobile) {
          align-items: flex-start;
          text-align: left;
        }
      }
    }
  }

  // Preview block: thumbnail image + page-title caption. The image
  // sits in a 16:9 frame so odd og:image dimensions don't blow up the
  // layout, and it's wrapped in a link so clicking opens the live
  // site in a new tab — lets the user flick between the audit and
  // the real thing without losing their place.
  &__preview {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  &__preview-link {
    display: block;
    aspect-ratio: 16 / 9;
    border: 1px solid white(10);
    border-radius: 8px;
    overflow: hidden;
    background: #1b1b1b;
    position: relative;
    text-decoration: none;
    transition: border-color 0.3s ease, transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);

    &:hover {
      border-color: white(30);
      transform: translateY(-2px);
    }

    &:focus-visible {
      outline: 2px solid white(50);
      outline-offset: 3px;
    }
  }

  &__preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.6s cubic-bezier(0.32, 0.72, 0, 1);
  }

  &__preview-link:hover &__preview-img {
    transform: scale(1.02);
  }

  // Caption below the preview image — shows the audited page's <title>
  // so the user sees what the page is actually called, not just the
  // hostname. Hidden cleanly when the site has no meaningful title.
  &__preview-caption {
    color: white(55);
    font-family: 'RoobertMono';
    font-size: getRem(12);
    line-height: 1.4;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    margin: 0;
    // Clamp to one line so longer titles don't throw the lockup
    // baseline out of alignment with the score.
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__headline {
    display: flex;
    align-items: baseline;
    gap: 24px;
    margin-bottom: 32px;
    flex-wrap: wrap;
  }

  &__overall {
    display: flex;
    align-items: baseline;
    color: $color-foreground;
  }

  &__overall-number {
    font-size: clamp(88px, 11vw, 180px);
    line-height: 0.9;
    letter-spacing: -0.06em;
    font-weight: 400;
  }

  &__overall-total {
    font-size: clamp(28px, 3vw, 48px);
    color: white(40);
    margin-left: 8px;
    letter-spacing: -0.04em;
  }

  &__band {
    color: white(70);
    padding: 8px 14px;
    border: 1px solid white(20);
    border-radius: 999px;
    // Accent tints based on the overall-score band. Kept restrained on
    // purpose — not a traffic-light, just a gentle hue shift so the
    // eye registers "good" vs "needs work" without the UI shouting.
    &--gold {
      color: #f0d58a;
      border-color: rgba(240, 213, 138, 0.35);
      background: rgba(240, 213, 138, 0.06);
    }
    &--warm {
      color: #e5cba0;
      border-color: rgba(229, 203, 160, 0.25);
      background: rgba(229, 203, 160, 0.04);
    }
    &--neutral {
      color: white(75);
      border-color: white(20);
    }
    &--cool {
      color: #b6c4d4;
      border-color: rgba(182, 196, 212, 0.25);
      background: rgba(182, 196, 212, 0.04);
    }
    &--cold {
      color: #a9b6c8;
      border-color: rgba(169, 182, 200, 0.3);
      background: rgba(169, 182, 200, 0.05);
    }
  }

  &__summary {
    color: white(85);
    max-width: 72ch;
    margin-bottom: 72px;
    @include respond(mobile) {
      margin-bottom: 48px;
    }
  }

  &__categories {
    list-style: none;
    padding: 0;
    margin: 0 0 48px 0;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__category-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 10px;
    gap: 16px;
  }

  &__category-label {
    color: white(90);
  }

  &__category-score {
    color: white(60);
    font-variant-numeric: tabular-nums;
  }

  &__bar {
    width: 100%;
    height: 4px;
    background-color: white(8);
    border-radius: 2px;
    overflow: hidden;
  }

  &__bar-fill {
    width: 100%;
    height: 100%;
    background-color: $color-foreground;
    transform-origin: left;
    // Start collapsed so GSAP can scale it up on mount. Without this,
    // the bar flashes to full width before the tween runs.
    transform: scaleX(0);
  }

  &__tally {
    color: white(60);
    font-family: 'RoobertMono';
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    strong {
      color: $color-foreground;
      font-weight: 500;
    }
  }

  &__tally-sep {
    color: white(30);
  }

  &__tally-suffix {
    text-transform: none;
    font-family: 'Roobert';
    font-size: 1rem;
    color: white(50);
    margin-left: 8px;
  }

  // Subtle share row at the tail of the teaser. Small top margin so
  // it reads as a quiet follow-on to the tally, not a new section.
  &__share {
    margin-top: 32px;
  }
}
</style>
