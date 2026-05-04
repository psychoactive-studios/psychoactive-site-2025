<script setup>
// Match the desktop hero strip — show only the featured (most
// internationally recognisable) clients in the marquee.
import { featuredPartnersData } from '~/data/partnersData';
</script>

<template>
  <Vue3Marquee :duration="30" :pause-on-hover="true" class="partners-mobile">
    <img
      v-for="partner in featuredPartnersData"
      :key="partner.id"
      :src="partner.logo"
      :alt="partner.alt || `${partner.name} client logo`"
      :class="partner.id"
      loading="lazy"
      decoding="async"
    />
  </Vue3Marquee>
</template>

<style scoped lang="scss">
.partners-mobile {
  // Per-logo heights for optical balance (mirrors the desktop
  // PartnersDesktop approach). The new SVG assets have very
  // different aspect ratios from the old PNGs, so the previous
  // per-mark fixed pixel widths produced inconsistent visible
  // heights. Heights scale with viewport so the marquee stays
  // proportional across mobile widths.
  img {
    width: auto;
    margin: 0 16px;
    object-fit: contain;
    opacity: 0.8;
  }

  // Combined lockups (Adidas trefoil + wordmark, All Blacks fern +
  // wordmark)
  .partner-adidas {
    height: 24px;
  }
  .partner-all-blacks {
    height: 30px;
  }

  // Decorative wordmarks
  .partner-hellboy {
    height: 28px;
  }

  // Compact emblems
  .partner-wow {
    height: 32px;
  }

  // Wide wordmarks — shorter so width doesn't dominate
  .partner-blackbird {
    height: 20px;
  }
  .partner-token-2049 {
    height: 22px;
  }

  // Mid-range
  .partner-super-ai {
    height: 24px;
  }
}
</style>
