<script setup>
// Use the featured-only subset so the homepage hero strip stays
// uncluttered (~7 most internationally recognisable marks) rather
// than rendering every client we've ever shipped for.
import { featuredPartnersData } from '~/data/partnersData';
</script>

<template>
  <div class="partners-desktop">
    <img
      v-for="partner in featuredPartnersData"
      :key="partner.id"
      :src="partner.logo"
      :alt="partner.alt || `${partner.name} client logo`"
      :class="partner.id"
      loading="lazy"
      decoding="async"
    />
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/functions' as *;

.partners-desktop {
  // Edge-to-edge within the standard .container gutter. First logo
  // sits at the left, last at the right, the rest distributed evenly
  // via space-between.
  //
  // The `gap` is a safety net — it guarantees minimum spacing
  // between adjacent logos even if their combined width is tight
  // against the container. space-between then adds extra space on
  // top of that gap when there's room to spare.
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: clamp(16px, 1.5vw, 40px);

  @include respond(mobile) {
    display: block;
  }

  // Per-logo heights, not a single shared height. Logos with very
  // different aspect ratios (a wide wordmark like BLACKBIRD vs a
  // compact emblem like WOW) need different heights to read with
  // similar optical weight in the row. Heights chosen so each logo's
  // visible "type" sits at a comparable size, even when the SVG
  // viewBox includes surrounding whitespace (notably All Blacks,
  // where the silver fern extends well above the wordmark in the
  // viewBox).
  img {
    width: auto;
    object-fit: contain;
    flex-shrink: 0;
  }

  // Combined lockups —
  // Adidas: wordmark + trefoil, modest height keeps the row tidy
  // alongside the wider logos.
  .partner-adidas {
    height: clamp(22px, 1.9vw, 36px);
  }

  // All Blacks: the fern occupies the full viewBox height while the
  // wordmark sits below it, so the visible text reads small relative
  // to the SVG height. Bumped up so the wordmark text matches the
  // weight of the other logos and the fern naturally extends taller.
  .partner-all-blacks {
    height: clamp(28px, 2.4vw, 46px);
  }

  // Decorative wordmark (Hellboy) — slightly taller so the unique
  // lettering carries presence.
  .partner-hellboy {
    height: clamp(28px, 2.4vw, 44px);
  }

  // Compact emblem (WOW) — taller; emblems need extra size to hold
  // their own next to wordmarks.
  .partner-wow {
    height: clamp(30px, 2.6vw, 48px);
  }

  // Wide wordmarks (Blackbird, Token2049) — shorter; their width
  // already gives them plenty of presence in the row.
  .partner-blackbird {
    height: clamp(18px, 1.6vw, 28px);
  }
  .partner-token-2049 {
    height: clamp(20px, 1.7vw, 30px);
  }

  // SuperAI — wordmark with chip; mid-range height so the chip
  // detail stays legible.
  .partner-super-ai {
    height: clamp(22px, 1.9vw, 36px);
  }
}
</style>
