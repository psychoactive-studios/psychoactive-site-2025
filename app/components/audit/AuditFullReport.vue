<script setup>
import gsap from 'gsap';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '#shared/audit-types';
import ButtonOutline from '~/components/ui/ButtonOutline.vue';

const props = defineProps({
  report: {
    type: Object,
    required: true,
  },
  // The normalised URL that was audited. Used in the share text so
  // the destination post names the site specifically.
  auditedUrl: {
    type: String,
    default: '',
  },
});

// Copy-to-clipboard state for the "Copy link" share action. Flips
// for ~2s after a successful copy to give visual feedback.
const copyConfirmed = ref(false);
let copyResetTimer = null;

const shareUrl = computed(() => {
  if (typeof window === 'undefined') return '';
  const u = new URL('/design-audit', window.location.origin);
  if (props.auditedUrl) u.searchParams.set('url', props.auditedUrl);
  return u.toString();
});

const shareText = computed(() => {
  const score = props.report?.overall_score ?? '';
  const site = props.auditedUrl
    ? props.auditedUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : 'my site';
  return `I audited ${site} with Psychoactive's AI design audit and scored ${score}/100. Run yours →`;
});

function openTwitter() {
  const intent = new URL('https://twitter.com/intent/tweet');
  intent.searchParams.set('text', shareText.value);
  intent.searchParams.set('url', shareUrl.value);
  window.open(intent.toString(), '_blank', 'noopener,noreferrer');
}

function openLinkedIn() {
  // LinkedIn's share intent takes only the URL — it scrapes OG tags
  // from the page for the preview.
  const intent = new URL('https://www.linkedin.com/sharing/share-offsite/');
  intent.searchParams.set('url', shareUrl.value);
  window.open(intent.toString(), '_blank', 'noopener,noreferrer');
}

async function copyShareLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value);
    copyConfirmed.value = true;
    if (copyResetTimer) clearTimeout(copyResetTimer);
    copyResetTimer = setTimeout(() => {
      copyConfirmed.value = false;
    }, 2000);
  } catch (err) {
    console.warn('Clipboard copy failed:', err);
  }
}

onUnmounted(() => {
  if (copyResetTimer) clearTimeout(copyResetTimer);
});

const categories = computed(() =>
  CATEGORY_ORDER.map((key) => ({
    key,
    label: CATEGORY_LABELS[key],
    data: props.report?.categories?.[key] || {
      score: 0,
      findings: [],
      next_action: '',
    },
  }))
);

const FINDING_LABEL = {
  win: 'Win',
  issue: 'Issue',
  opportunity: 'Opportunity',
};

const rootRef = ref(null);

// Progressive reveal on mount — the full report mounts the moment
// the email gate unlocks, and we want it to feel like it's being
// written rather than dropped in all at once. Staggered fade-up of
// the top-level sections (eyebrow, title, each category, CTA) gives
// a Claude-streaming feel without actually simulating typing.
onMounted(async () => {
  await nextTick();
  const root = rootRef.value;
  if (!root) return;

  const items = [
    root.querySelector('.full-report__eyebrow'),
    root.querySelector('.full-report__title'),
    ...Array.from(root.querySelectorAll('.category')),
    root.querySelector('.full-report__cta'),
  ].filter(Boolean);

  if (!items.length) return;

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    gsap.set(items, { opacity: 1, y: 0 });
    return;
  }

  gsap.from(items, {
    opacity: 0,
    y: 14,
    duration: 0.45,
    ease: 'power3.out',
    stagger: 0.12,
  });
});
</script>

<template>
  <section ref="rootRef" class="full-report">
    <div class="container">
      <p class="full-report__eyebrow subheader--mobile">
        The full report
      </p>
      <h2 class="full-report__title heading-h3--mobile">
        Every finding, broken down by category.
      </h2>

      <div class="full-report__categories">
        <article
          v-for="cat in categories"
          :key="cat.key"
          class="category"
        >
          <header class="category__header">
            <h3 class="category__label heading-h4--mobile">
              {{ cat.label }}
            </h3>
            <div class="category__score">
              <span class="category__score-num">{{ cat.data.score }}</span>
              <span class="category__score-total">/20</span>
            </div>
          </header>

          <ul v-if="cat.data.findings?.length" class="category__findings">
            <li
              v-for="(finding, i) in cat.data.findings"
              :key="i"
              class="finding"
              :class="`finding--${finding.type}`"
            >
              <span class="finding__tag subheader-small">
                {{ FINDING_LABEL[finding.type] || finding.type }}
              </span>
              <p class="finding__text body--mobile">
                {{ finding.text }}
              </p>
              <p
                v-if="finding.quote"
                class="finding__quote body-small--mobile"
              >
                “{{ finding.quote }}”
              </p>
            </li>
          </ul>

          <div v-if="cat.data.next_action" class="category__next">
            <span class="category__next-label subheader-small">
              Fix this first
            </span>
            <p class="category__next-text body--mobile">
              {{ cat.data.next_action }}
            </p>
          </div>
        </article>
      </div>

      <div class="full-report__share">
        <p class="full-report__share-label subheader-small">
          Share your score
        </p>
        <div class="full-report__share-actions">
          <button
            type="button"
            class="full-report__share-btn"
            @click="openTwitter"
          >
            Post on X
          </button>
          <button
            type="button"
            class="full-report__share-btn"
            @click="openLinkedIn"
          >
            Share on LinkedIn
          </button>
          <button
            type="button"
            class="full-report__share-btn"
            @click="copyShareLink"
          >
            {{ copyConfirmed ? 'Link copied ✓' : 'Copy link' }}
          </button>
        </div>
      </div>

      <div class="full-report__cta">
        <h2 class="full-report__cta-title heading-h2--mobile">
          Like what you're reading?
        </h2>
        <p class="full-report__cta-lede body-large--mobile">
          This is the short version. Give us an hour on a call and we'll
          walk you through how we'd rebuild your site to fix all of it.
        </p>
        <ButtonOutline href="/contact" class="full-report__cta-button">
          Start a conversation
        </ButtonOutline>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;

.full-report {
  padding: 6dvh 0 14dvh 0;

  .container {
    @include container;
    max-width: 1280px;
  }

  &__eyebrow {
    color: white(50);
    margin-bottom: 24px;
  }

  &__title {
    color: $color-foreground;
    margin-bottom: 64px;
    max-width: 28ch;
    @include respond(mobile) {
      margin-bottom: 40px;
    }
  }

  &__categories {
    display: flex;
    flex-direction: column;
    gap: 72px;
    margin-bottom: 72px;
    @include respond(mobile) {
      gap: 56px;
      margin-bottom: 56px;
    }
  }

  // Share row — sits between the category findings and the main CTA.
  // Low-key visual weight (not a primary action) but easy reach for
  // anyone who wants to post their score.
  &__share {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 20px 28px;
    padding: 32px 0;
    margin-bottom: 48px;
    border-top: 1px solid white(10);
    border-bottom: 1px solid white(10);
  }

  &__share-label {
    color: white(60);
    font-family: 'RoobertMono';
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-size: getRem(12);
    margin: 0;
  }

  &__share-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  &__share-btn {
    background: none;
    border: 1px solid white(20);
    color: $color-foreground;
    font-family: 'RoobertMono';
    font-size: getRem(12);
    font-weight: 500;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 10px 16px;
    border-radius: 999px;
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      color 0.2s ease;

    &:hover {
      background-color: white(5);
      border-color: white(50);
    }

    &:focus-visible {
      outline: 2px solid white(40);
      outline-offset: 3px;
    }
  }

  &__cta {
    border-top: 1px solid white(10);
    padding-top: 72px;
    @include respond(mobile) {
      padding-top: 48px;
    }
  }

  &__cta-title {
    color: $color-foreground;
    margin-bottom: 20px;
  }

  &__cta-lede {
    color: white(70);
    max-width: 60ch;
    margin-bottom: 40px;
  }
}

.category {
  border-top: 1px solid white(10);
  padding-top: 32px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 16px;
    margin-bottom: 32px;
    flex-wrap: wrap;
  }

  &__label {
    color: $color-foreground;
    max-width: 32ch;
  }

  &__score {
    font-family: 'RoobertMono';
    color: white(70);
    font-variant-numeric: tabular-nums;
    display: flex;
    align-items: baseline;
  }

  &__score-num {
    font-size: 2rem;
    color: $color-foreground;
  }

  &__score-total {
    font-size: 1rem;
    color: white(40);
    margin-left: 4px;
  }

  &__findings {
    list-style: none;
    padding: 0;
    margin: 0 0 32px 0;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__next {
    background-color: white(4);
    border-left: 2px solid $color-foreground;
    padding: 20px 24px;
    @include respond(mobile) {
      padding: 16px 20px;
    }
  }

  &__next-label {
    color: white(50);
    display: block;
    margin-bottom: 10px;
  }

  &__next-text {
    color: white(90);
    margin: 0;
  }
}

.finding {
  padding-left: 20px;
  border-left: 2px solid white(20);

  &--win {
    border-left-color: #7cd99a;
    .finding__tag { color: #7cd99a; }
  }
  &--issue {
    border-left-color: #ff8a8a;
    .finding__tag { color: #ff8a8a; }
  }
  &--opportunity {
    border-left-color: $color-blue;
    .finding__tag { color: #5ea1ff; }
  }

  &__tag {
    display: inline-block;
    margin-bottom: 10px;
    letter-spacing: 0.04em;
  }

  &__text {
    color: white(90);
    margin: 0 0 12px 0;
  }

  &__quote {
    color: white(55);
    font-style: italic;
    margin: 0;
    padding-left: 14px;
    border-left: 1px solid white(15);
  }
}
</style>
