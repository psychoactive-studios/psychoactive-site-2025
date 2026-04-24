<script setup>
/**
 * Social share card for /design-audit.
 *
 * Rendered by nuxt-og-image at request time to produce the 1200x630
 * PNG that appears when someone shares a design-audit link on X,
 * LinkedIn, etc.
 *
 * Design intent (notes for future-me so the rationale doesn't get
 * lost the next time someone "just tweaks" the layout):
 *
 * - ONE dominant element — a huge `?/100` as a score placeholder.
 *   Reads instantly as "a number is about to go here", which creates
 *   the curiosity gap that drives clicks. Same pattern Vercel / Linear
 *   use on their generic OG cards.
 * - Monochrome black + white. A single warm accent on the `?`
 *   implies the "gold-tier score" outcome without colouring outside
 *   the brand palette.
 * - Concrete value row ("Free · 5 categories · 60 seconds") beats
 *   the previous rhetorical question — people click when they can
 *   imagine getting a specific result, not when they're asked to
 *   philosophise.
 * - CTA pill pushed to the bottom-left as a strong corner anchor,
 *   domain to the bottom-right so the eye can track both without
 *   competing with the hook.
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
      padding: '72px 80px',
      background: '#0b0b0b',
      color: '#ffffff',
      fontFamily: 'Inter, sans-serif',
    }"
  >
    <!-- Top eyebrow -->
    <div
      :style="{
        display: 'flex',
        alignItems: 'center',
        color: '#8a8a8a',
        fontSize: '22px',
        fontWeight: '600',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
      }"
    >
      Psychoactive Studios · Design Audit
    </div>

    <!-- Middle: huge "?" / 100 as the curiosity hook, then a specific headline -->
    <div
      :style="{
        display: 'flex',
        flexDirection: 'column',
      }"
    >
      <!-- The score placeholder. Warm-tinted `?` implies the high-tier
           outcome people are imagining for their own site. -->
      <div
        :style="{
          display: 'flex',
          alignItems: 'flex-end',
          marginBottom: '28px',
        }"
      >
        <div
          :style="{
            display: 'flex',
            color: '#f0d58a',
            fontSize: '280px',
            fontWeight: '700',
            lineHeight: '0.85',
            letterSpacing: '-0.08em',
          }"
        >
          ?
        </div>
        <div
          :style="{
            display: 'flex',
            color: '#6a6a6a',
            fontSize: '72px',
            fontWeight: '500',
            letterSpacing: '-0.04em',
            marginLeft: '16px',
            marginBottom: '28px',
          }"
        >
          /100
        </div>
      </div>

      <!-- Headline — short, concrete, benefit-first. Varies slightly
           based on whether the link points to a specific audit. -->
      <div
        :style="{
          display: 'flex',
          color: '#ffffff',
          fontSize: '58px',
          fontWeight: '600',
          letterSpacing: '-0.02em',
          lineHeight: '1.08',
          maxWidth: '820px',
        }"
      >
        {{
          hostname
            ? `See how ${hostname} scores across five things that actually matter.`
            : `Get your website's design audit score in 60 seconds.`
        }}
      </div>

      <!-- Value-bullet row. Specific, not abstract. -->
      <div
        :style="{
          display: 'flex',
          marginTop: '20px',
          color: '#8a8a8a',
          fontSize: '24px',
          fontWeight: '500',
          letterSpacing: '0.01em',
        }"
      >
        Free · 5 categories · Specific findings
      </div>
    </div>

    <!-- Bottom row: CTA pill + domain sig -->
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
          color: '#0b0b0b',
          background: '#ffffff',
          fontSize: '26px',
          fontWeight: '700',
          padding: '20px 32px',
          borderRadius: '999px',
          letterSpacing: '0.01em',
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
