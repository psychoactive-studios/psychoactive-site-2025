<script setup>
// Use the featured-only subset so the homepage hero strip stays
// uncluttered (~7 most internationally recognisable marks) rather
// than rendering every client we've ever shipped for.
import { featuredPartnersData } from '~/data/partnersData';
</script>

<template>
  <div class="partners-desktop">
    <template v-for="partner in featuredPartnersData" :key="partner.id">
      <!-- Combined-lockup partners (have a `wordmark` field): render
           the emblem image alongside the wordmark text so the row
           reads as a complete brand identity rather than the emblem
           on its own. Currently used for All Blacks (silver fern +
           "ALL BLACKS"). -->
      <div
        v-if="partner.wordmark"
        class="partners-desktop__lockup"
        :class="partner.id"
      >
        <img
          :src="partner.logo"
          :alt="partner.alt || `${partner.name} client logo`"
          loading="lazy"
          decoding="async"
        />
        <span class="partners-desktop__wordmark">{{ partner.wordmark }}</span>
      </div>
      <!-- Standard partners: just the image. -->
      <img
        v-else
        :src="partner.logo"
        :alt="partner.alt || `${partner.name} client logo`"
        :class="partner.id"
        loading="lazy"
        decoding="async"
      />
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/functions' as *;

.partners-desktop {
  // Edge-to-edge within the standard .container gutter. First logo
  // sits at the left edge, last at the right, the rest distributed
  // evenly via space-between.
  display: flex;
  justify-content: space-between;
  align-items: center;

  @include respond(mobile) {
    display: block;
  }

  // All logos render at the same height so the row reads as a
  // consistent strip. Width is auto-derived from each logo's native
  // aspect ratio.
  img {
    height: clamp(28px, 2.4vw, 48px);
    width: auto;
    object-fit: contain;
  }

  // Combined-lockup wrapper (image + wordmark text). Used for clients
  // whose existing asset is just the emblem and we want to render the
  // wordmark next to it without baking it into the image (currently
  // All Blacks).
  &__lockup {
    display: inline-flex;
    align-items: center;
    gap: clamp(6px, 0.6vw, 10px);
    height: clamp(28px, 2.4vw, 48px);

    img {
      height: 100%;
      width: auto;
      object-fit: contain;
    }
  }

  &__wordmark {
    color: $color-foreground;
    opacity: 0.85;
    font-family: 'Helvetica Neue', 'Arial Black', Arial, sans-serif;
    font-weight: 900;
    font-size: clamp(11px, 0.95vw, 18px);
    letter-spacing: 0.04em;
    white-space: nowrap;
    line-height: 1;
  }

  // Per-mark height nudges where the native lockup needs slight
  // optical compensation. Tweak to taste without the row losing its
  // rhythm.
  //
  // Adidas SVG combines peak + wordmark in one file; the wordmark
  // glyphs have no descender so the file reads slightly taller than
  // a wordmark-with-descender like Summer Game Fest. Keep the SVG
  // at the standard row height — no nudge needed now that it's
  // packaged as the combined lockup.
  //
  // Blackbird's wordmark reads slightly larger than the others
  // because its glyphs are tighter — pull it back a notch.
  .partner-blackbird {
    height: clamp(24px, 2vw, 40px);
  }

  // The All Blacks fern (inside __lockup) reads tall and thin —
  // bumping the lockup height a touch so the fern matches the other
  // wordmarks visually. The wordmark text is sized via __wordmark
  // above and stays in proportion with the rest of the row.
  .partner-all-blacks {
    height: clamp(34px, 2.9vw, 56px);
  }
}
</style>
