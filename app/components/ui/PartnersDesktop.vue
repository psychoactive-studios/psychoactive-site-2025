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
  // via space-between. `gap` is a minimum-spacing safety net.
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: clamp(16px, 1.5vw, 40px);

  @include respond(mobile) {
    display: block;
  }

  // Per-logo heights, not a single shared height. Heights are
  // calibrated so the COMBINED rendered width of all 7 logos +
  // their gaps fits inside the standard .container at viewport
  // widths down to 1440px (the smallest desktop we target).
  //
  // Aspect ratios from the SVG viewBoxes:
  //   adidas      5.93   →  small height, long width
  //   hellboy     2.80   →  compact, taller height ok
  //   all-blacks  7.74   →  long; small height
  //   wow         2.83   →  compact emblem, taller
  //   blackbird   8.83   →  longest; smallest height
  //   super-ai    5.79   →  long; small height
  //   token-2049  8.03   →  long; small height
  //
  // At 1440px viewport (.container = 1120px), totals ~980px of logos
  // + ~140px of distributed gaps. At 1920px viewport, gaps grow.
  img {
    width: auto;
    object-fit: contain;
    // Sit at the same visual weight as the stats numbers below
    // (both use white at ~80% opacity). Keeps the partners + stats
    // section coherent and lets the case studies / hero / headlines
    // remain the brightest content on the page.
    opacity: 0.8;
  }

  // Combined lockups
  .partner-adidas {
    height: clamp(18px, 1.5vw, 28px);
  }
  .partner-all-blacks {
    height: clamp(22px, 2vw, 36px);
  }

  // Decorative wordmark (Hellboy) — compact aspect, taller height
  // so the lettering reads at the same weight as the wider logos.
  .partner-hellboy {
    height: clamp(22px, 1.9vw, 32px);
  }

  // Compact emblem (WOW) — emblems need a bit more height to hold
  // their own next to wordmarks.
  .partner-wow {
    height: clamp(24px, 2.2vw, 38px);
  }

  // Wide wordmarks — width already gives them plenty of presence,
  // so shorter heights keep the row from feeling lopsided.
  .partner-blackbird {
    height: clamp(14px, 1.3vw, 22px);
  }
  .partner-token-2049 {
    height: clamp(16px, 1.4vw, 24px);
  }

  // SuperAI — wordmark with chip; mid-range height so the chip stays
  // legible.
  .partner-super-ai {
    height: clamp(18px, 1.6vw, 28px);
  }
}
</style>
