<script setup>
import { CATEGORY_LABELS, CATEGORY_ORDER } from '#shared/audit-types';

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

// Band for the overall score — a gentle verbal cue alongside the number.
const overallBand = computed(() => {
  const s = props.report?.overall_score || 0;
  if (s >= 85) return 'Excellent';
  if (s >= 70) return 'Strong';
  if (s >= 55) return 'Mid';
  if (s >= 35) return 'Rough';
  return 'Needs work';
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
  <section class="score-card">
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
          <img
            :src="heroImageUrl"
            :alt="`Preview of ${auditedUrl}`"
            class="score-card__preview-img"
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer"
            @error="imageBroken = true"
          />
        </figure>

        <div class="score-card__headline">
          <div class="score-card__overall">
            <span class="score-card__overall-number">
              {{ report.overall_score }}
            </span>
            <span class="score-card__overall-total">/100</span>
          </div>
          <p class="score-card__band subheader--mobile">
            {{ overallBand }}
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
              :style="{ transform: `scaleX(${Math.max(0, Math.min(cat.score, 20)) / 20})` }"
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
  // right. Two-column grid with a generous gap so the elements read
  // as paired-but-distinct, not glued together. Aligns to the bottom
  // of both columns so the big score sits on the same baseline as the
  // image, which creates a strong horizon line.
  &__lockup {
    margin-bottom: 48px;
    @include respond(mobile) {
      margin-bottom: 32px;
    }

    &--with-preview {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 48px;
      align-items: end;

      @include respond(mobile) {
        grid-template-columns: 1fr;
        gap: 24px;
        align-items: stretch;
      }
    }
  }

  // Preview image of the audited page. Constrained aspect ratio (16:9)
  // and border so a weird og:image doesn't blow up the layout. Sits in
  // the left column of the lockup grid.
  &__preview {
    margin: 0;
    aspect-ratio: 16 / 9;
    border: 1px solid white(10);
    border-radius: 8px;
    overflow: hidden;
    background: #1b1b1b;
    width: 100%;
  }

  &__preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
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
    transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
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
}
</style>
