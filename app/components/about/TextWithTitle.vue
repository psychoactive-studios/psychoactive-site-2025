<script setup>
import OnScrollFilledText from '../ui/OnScrollFilledText.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>
<template>
  <section class="text-section">
    <div class="container">
      <h2 class="text-section__title">{{ title }}</h2>
      <div class="text-section__content">
        <OnScrollFilledText>
          <slot />
        </OnScrollFilledText>
      </div>
    </div>
  </section>
</template>
<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
.text-section {
  .container {
    display: flex;
    justify-content: space-between;
    gap: getRem(48);
  }
  &__title {
    font-family: 'RoobertMono';
    font-size: clamp(0.75rem, 1.333vw, 1rem);
    font-style: normal;
    font-weight: 500;
    line-height: 100%;
    text-transform: uppercase;
    white-space: nowrap;
    margin-top: 0.4rem;
    color: white(50);
  }
  &__content {
    width: 72.5%;
    :deep(p) {
      &::before {
        content: '';
        display: inline-block;
        width: 7vw;
      }
      margin-bottom: 1.2em;
      &:last-child {
        &::before {
          display: none;
        }
        margin-bottom: 0;
      }
    }
  }
}
</style>
