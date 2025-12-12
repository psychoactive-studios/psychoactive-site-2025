<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>
<template>
  <div class="section">
    <h2 class="section__title">{{ title }}</h2>
    <div class="section__description">
      <slot />
    </div>
  </div>
</template>
<style scoped lang="scss">
.section {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  &__title {
    font-family: 'RoobertMono';
    font-size: clamp(0.75rem, 1.333vw, 1rem);
    font-style: normal;
    font-weight: 500;
    line-height: 100%;
    text-transform: uppercase;
    white-space: nowrap;
    margin-top: 0.4rem;
    min-width: 0;
  }
  &__description {
    font-size: max(1.666666vw, 22px);
    font-style: normal;
    font-weight: 400;
    line-height: 112.5%;
    min-width: 0;
    &::before {
      content: '';
      display: inline-block;
      width: 4.8vw;
    }
  }
}
</style>
