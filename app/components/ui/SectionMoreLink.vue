<script setup>
// Section "more" link — a wordmark CTA flanked by thin lines with a
// dot at each end. Pattern lifted from the homepage news list
// ("Explore Our Content Hub"); shared so other section footers can
// reuse it (e.g. "View our work →" under the case-studies section).
//
// Click sound is fired by the parent's audio manager — keep this
// component dumb so it can be used outside the homepage too.
import LinkWithHover from './LinkWithHover.vue';
import useAudioManager from '~/composables/useAudioManager';

defineProps({
  href: { type: String, required: true },
  label: { type: String, required: true },
});

const { playRandomSound } = useAudioManager();
</script>

<template>
  <div class="section-more body-button">
    <div class="section-more__line" />
    <LinkWithHover
      :href="href"
      @click="() => playRandomSound('click')"
    >
      {{ label }}
    </LinkWithHover>
    <div class="section-more__line" />
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;

.section-more {
  display: flex;
  align-items: center;
  gap: 1rem;
  line-height: 27px;

  &__line {
    flex-grow: 1;
    height: 1px;
    background-color: white(20);
    position: relative;

    &::before,
    &::after {
      content: '';
      position: absolute;
      top: -3px;
      width: 7px;
      height: 7px;
      background-color: white(50);
      border-radius: 50%;
    }
    &::before {
      left: -4px;
    }
    &::after {
      right: -4px;
    }
  }
}
</style>
