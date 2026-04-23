<script setup>
/**
 * AuditShare — three buttons for sharing an audit result.
 *
 * Lives in both the score card (teaser, pre-unlock) and the full
 * report (post-unlock). Same component, different contexts — the
 * teaser version uses the subtle variant, the full-report version
 * uses the prominent variant.
 *
 * Each button opens a pre-filled share intent in a new tab, or copies
 * a link back to /design-audit?url=X to the clipboard.
 */

const props = defineProps({
  // Normalised URL that was audited — drives both the share text and
  // the destination link.
  auditedUrl: {
    type: String,
    required: true,
  },
  // Overall score out of 100 — used in the share text.
  score: {
    type: Number,
    default: null,
  },
  // 'subtle' for inline placement (teaser score card); 'prominent'
  // for the bordered section in the full report.
  variant: {
    type: String,
    default: 'subtle',
    validator: (v) => ['subtle', 'prominent'].includes(v),
  },
  // Optional heading — shown only on the prominent variant.
  label: {
    type: String,
    default: 'Share your score',
  },
});

const copyConfirmed = ref(false);
let copyResetTimer = null;

const shareUrl = computed(() => {
  if (typeof window === 'undefined') return '';
  const u = new URL('/design-audit', window.location.origin);
  if (props.auditedUrl) u.searchParams.set('url', props.auditedUrl);
  return u.toString();
});

const shareText = computed(() => {
  const site = props.auditedUrl
    ? props.auditedUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : 'my site';
  if (props.score != null) {
    return `I audited ${site} with Psychoactive's AI design audit and scored ${props.score}/100. Run yours →`;
  }
  return `I ran Psychoactive's AI design audit on ${site}. Run yours →`;
});

function openTwitter() {
  const intent = new URL('https://twitter.com/intent/tweet');
  intent.searchParams.set('text', shareText.value);
  intent.searchParams.set('url', shareUrl.value);
  window.open(intent.toString(), '_blank', 'noopener,noreferrer');
}

function openLinkedIn() {
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
</script>

<template>
  <div class="audit-share" :class="`audit-share--${variant}`">
    <p v-if="variant === 'prominent'" class="audit-share__label subheader-small">
      {{ label }}
    </p>
    <div class="audit-share__actions">
      <button type="button" class="audit-share__btn" @click="openTwitter">
        Post on X
      </button>
      <button type="button" class="audit-share__btn" @click="openLinkedIn">
        Share on LinkedIn
      </button>
      <button type="button" class="audit-share__btn" @click="copyShareLink">
        {{ copyConfirmed ? 'Link copied ✓' : 'Copy link' }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;

.audit-share {
  &--prominent {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 20px 28px;
    padding: 32px 0;
    border-top: 1px solid white(10);
    border-bottom: 1px solid white(10);
  }

  &--subtle {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__label {
    color: white(60);
    font-family: 'RoobertMono';
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-size: getRem(12);
    margin: 0;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  &__btn {
    background: none;
    border: 1px solid white(20);
    color: $color-foreground;
    font-family: 'RoobertMono';
    font-size: getRem(11);
    font-weight: 500;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 9px 14px;
    border-radius: 999px;
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      color 0.2s ease;

    .audit-share--subtle & {
      border-color: white(15);
      color: white(65);
      padding: 7px 12px;

      &:hover {
        color: $color-foreground;
        border-color: white(40);
        background-color: white(5);
      }
    }

    .audit-share--prominent &:hover {
      background-color: white(5);
      border-color: white(50);
    }

    &:focus-visible {
      outline: 2px solid white(40);
      outline-offset: 3px;
    }
  }
}
</style>
