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
  display: flex;
  justify-content: space-between;
  align-items: center;

  @include respond(mobile) {
    display: block;
  }

  // Per-logo heights, not a single shared height. Logos with very
  // different aspect ratios (a wide wordmark like BLACKBIRD vs a
  // compact emblem like WOW) need different heights to read with
  // similar optical weight in the row. Heights cluster within a 1.5×
  // range so the row still feels coherent — wider lockups sit a
  // touch shorter, compact emblems and dense wordmarks sit taller.
  img {
    width: auto;
    object-fit: contain;
  }

  // Combined lockups (Adidas, All Blacks) — moderate height; the
  // peak / fern gives them visual presence without needing extra
  // height.
  .partner-adidas {
    height: clamp(28px, 2.4vw, 48px);
  }
  .partner-all-blacks {
    height: clamp(28px, 2.4vw, 48px);
  }

  // Compact decorative wordmarks (Hellboy) — taller so the
  // distinctive lettering reads at the same weight as the wider
  // logos.
  .partner-hellboy {
    height: clamp(34px, 2.9vw, 56px);
  }

  // Compact emblem (WOW) — taller still; emblems need extra size to
  // hold their own next to wordmarks.
  .partner-wow {
    height: clamp(36px, 3vw, 60px);
  }

  // Wide wordmarks (Blackbird, Token2049) — shorter; their width
  // already gives them plenty of presence in the row.
  .partner-blackbird {
    height: clamp(22px, 1.9vw, 36px);
  }
  .partner-token-2049 {
    height: clamp(24px, 2vw, 38px);
  }

  // SuperAI — wordmark with chip; medium-wide aspect, mid-range
  // height so the chip detail stays legible.
  .partner-super-ai {
    height: clamp(28px, 2.4vw, 46px);
  }
}
</style>
