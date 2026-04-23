<script setup>
/**
 * Social share card for /design-audit.
 *
 * Rendered by nuxt-og-image at request time to produce the 1200x630
 * PNG that appears when someone shares a design-audit link on X,
 * LinkedIn, etc. Generic version for this pass — shows Psychoactive
 * branding + "Free design audit" CTA + the audited hostname if the
 * link includes ?url=X. A per-audit version with the actual score
 * would need a shareable audit-id URL (follow-up).
 *
 * Notes for Satori compatibility:
 *   - Every non-leaf element needs an explicit display: flex (or block
 *     for text-only runs). Satori can't infer it.
 *   - Only a subset of CSS works. No grid, no relative units like em,
 *     no complex selectors. Inline styles only.
 *   - Fonts have to be declared in nuxt.config.ts ogImage.fonts and
 *     referenced by name.
 */

const props = defineProps({
  auditedUrl: {
    type: String,
    default: '',
  },
});

const hostname = computed(() => {
  if (!props.auditedUrl) return '';
  try {
    return new URL(props.auditedUrl).hostname.replace(/^www\./, '');
  } catch {
    return props.auditedUrl;
  }
});
</script>

<template>
  <div
    :style="{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      width: '100%',
      height: '100%',
      padding: '80px',
      background: '#0b0b0b',
      color: '#ffffff',
      fontFamily: 'Inter, sans-serif',
    }"
  >
    <!-- Top eyebrow -->
    <div
      :style="{
        display: 'flex',
        color: '#8a8a8a',
        fontSize: '22px',
        fontWeight: '500',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }"
    >
      Psychoactive Studios · Design Audit
    </div>

    <!-- Middle: big headline / audited hostname -->
    <div
      :style="{
        display: 'flex',
        flexDirection: 'column',
      }"
    >
      <div
        v-if="hostname"
        :style="{
          display: 'flex',
          color: '#8a8a8a',
          fontSize: '32px',
          fontWeight: '500',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }"
      >
        {{ hostname }}
      </div>
      <div
        :style="{
          display: 'flex',
          color: '#ffffff',
          fontSize: '120px',
          fontWeight: '600',
          letterSpacing: '-0.04em',
          lineHeight: '0.95',
          maxWidth: '1000px',
        }"
      >
        What does your site say in the first five seconds?
      </div>
    </div>

    <!-- Bottom row: CTA + domain sig -->
    <div
      :style="{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }"
    >
      <div
        :style="{
          display: 'flex',
          alignItems: 'center',
          color: '#ffffff',
          fontSize: '26px',
          fontWeight: '600',
          padding: '18px 28px',
          border: '2px solid #ffffff',
          borderRadius: '999px',
          letterSpacing: '0.02em',
        }"
      >
        Run a free audit →
      </div>
      <div
        :style="{
          display: 'flex',
          color: '#6a6a6a',
          fontSize: '22px',
          fontWeight: '500',
          letterSpacing: '0.04em',
        }"
      >
        psychoactive.co.nz
      </div>
    </div>
  </div>
</template>
