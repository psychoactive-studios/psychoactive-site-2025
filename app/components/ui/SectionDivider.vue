<script setup>
// Thin horizontal line with a small dot at each end. Brand pattern
// reused from the homepage hero (the latitude/longitude timeline).
// Use as a low-key visual break between adjacent sections that
// would otherwise stack visually.
//
// Decorative only — exposes role="presentation" so screen readers
// skip it.
</script>

<template>
  <div class="section-divider" role="presentation">
    <span class="section-divider__dot" />
    <span class="section-divider__line" />
    <span class="section-divider__dot" />
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/functions' as *;

.section-divider {
  display: flex;
  align-items: center;
  gap: getRem(8);
  width: 100%;

  &__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: $color-dots;
    flex-shrink: 0;
  }

  &__line {
    flex: 1;
    height: 1px;
    background: white(10);
  }
}
</style>
