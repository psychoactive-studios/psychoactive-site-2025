<script setup>
import { featuredInData } from '~/data/featuredInData';
</script>

<template>
  <section class="featured-in">
    <div class="container">
      <h2 class="featured-in__title subheader">
        As Featured In
      </h2>
      <div class="featured-in__logos">
        <div
          v-for="item in featuredInData"
          :key="item.id"
          class="featured-in__logo"
          :class="item.id"
        >
          <img :src="item.logo" :alt="item.name" />
          <span v-if="item.label" class="featured-in__logo-label">
            {{ item.label }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;

// Baseline logo height. The PNG/SVG assets have been pre-trimmed
// (no transparent padding) so CSS heights map 1:1 to visible logo
// heights. Per-logo tweaks are now only for genuine optical-weight
// differences (chunky lockups vs delicate wordmarks).
$base-logo-height: 32px;
$base-logo-height-mobile: 22px;

.featured-in {
  position: relative;
  z-index: 1;

  &__title {
    text-align: center;
    opacity: 0.5;
    margin-bottom: 3vw;
    @include respond(mobile) {
      margin-bottom: getRem(40);
    }
  }

  &__logos {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: clamp(24px, 3vw, 64px);

    @include respond(mobile) {
      flex-wrap: wrap;
      justify-content: center;
      gap: getRem(32) getRem(44);
    }
  }

  &__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    opacity: 0.6;
    transition: opacity 0.3s ease;

    @include respond(mobile) {
      gap: 8px;
    }

    img {
      width: auto;
      object-fit: contain;
      display: block;
      height: $base-logo-height;
      flex-shrink: 0;

      @include respond(mobile) {
        height: $base-logo-height-mobile;
      }
    }

    // Text label shown next to emblem-only logos (W3, Best) so they
    // carry visual weight comparable to the wordmark-based logos.
    &-label {
      font-family: 'RoobertMono', monospace;
      font-size: 11px;
      font-weight: 500;
      line-height: 1;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: white;
      white-space: nowrap;

      @include respond(mobile) {
        font-size: 9px;
      }
    }

    // Per-logo optical tweaks. With trimmed assets, most logos sit
    // at baseline — only outliers with unusual visual weight need
    // adjusting.
    &.featured-webflow img {
      // Chunky mark + wordmark lockup — reads heavier than a pure wordmark.
      height: calc(#{$base-logo-height} - 6px);
      @include respond(mobile) {
        height: calc(#{$base-logo-height-mobile} - 4px);
      }
    }
    &.featured-best-design-awards img {
      // Small circular dot — a touch taller to match optical weight.
      height: calc(#{$base-logo-height} + 4px);
      @include respond(mobile) {
        height: calc(#{$base-logo-height-mobile} + 3px);
      }
    }
  }
}
</style>
