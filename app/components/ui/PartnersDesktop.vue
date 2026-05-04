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
@use '~/assets/styles/functions' as *;

.partners-desktop {
  // Edge-to-edge: first logo touches the left padding, last touches
  // the right. justify-content: space-between distributes the rest
  // evenly between them.
  display: flex;
  justify-content: space-between;
  align-items: center;

  @include respond(mobile) {
    display: block;
  }

  // All logos render at the same height so the row reads as a
  // consistent strip — width is auto-derived from each logo's native
  // aspect ratio, so wider marks (e.g. Summer Game Fest) take up more
  // horizontal space than tighter ones (e.g. SuperAI). Some logo
  // assets — Adidas, All Blacks — currently ship as just the
  // wordmark or just the emblem rather than the combined lockup; if
  // those land as combined-lockup PNGs the visual height will match
  // the others without any code change.
  img {
    height: clamp(28px, 2.4vw, 48px);
    width: auto;
    object-fit: contain;
  }

  // Per-mark height nudges where the native lockup needs slight
  // optical compensation. Wordmark-only logos (Adidas) read taller
  // because there's no descender; emblem-only logos (All Blacks)
  // read smaller because the silhouette doesn't fill its bbox.
  // Tweak to taste without the row losing its rhythm.
  .partner-adidas {
    height: clamp(22px, 1.9vw, 38px);
  }
  .partner-all-blacks {
    height: clamp(34px, 2.9vw, 56px);
  }
  .partner-blackbird {
    height: clamp(24px, 2vw, 40px);
  }
}
</style>
