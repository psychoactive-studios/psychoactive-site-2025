<script setup>
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

const elementRef = ref(null);
const currenTime = new Date().toLocaleTimeString([], {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Pacific/Auckland',
});

const currentDay = computed(() => {
  const startDate = new Date('2018-10-01');
  const today = new Date();
  const diffTime = Math.abs(today - startDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

onMounted(async () => {
  SplitText.create(elementRef.value, {
    type: 'words,chars',
    charsClass: 'char-center',
  });

  await nextTick();

  gsap.to(elementRef.value.querySelectorAll('.char-center'), {
    scrollTrigger: {
      trigger: elementRef.value,
      start: '-15% 50%',
      end: '115% 50%',
      scrub: true,
    },
    opacity: 1,
    duration: 0.1,
    stagger: 0.05,
  });
});
</script>
<template>
  <div
    ref="elementRef"
    class="text-block"
    :data-current-time="`${currenTime} NZT`"
    :data-current-days="`${currentDay} days`"
  >
    <slot />
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
.text-block {
  color: $color-foreground;
  font-size: 3.646vw;
  font-style: normal;
  font-weight: 400;
  line-height: 110%;
  letter-spacing: getRem(-1.4);
  position: relative;
  padding-bottom: 0.15vw;
  @include respond(mobile) {
    font-size: 8vw;
  }

  :deep(.dark) {
    color: white(50);
  }
  :deep(img) {
    display: inline-block;
    margin: 0 getRem(16);
    @include respond(mobile) {
      margin: 0 getRem(12);
      height: 5vw;
      width: auto;
    }
  }
  &::before,
  &::after {
    content: attr(data-current-days);
    display: inline-block;
    width: 10%;
    font-family: 'RoobertMono';
    font-style: normal;
    font-size: 1rem;
    font-weight: 500;
    line-height: 1;
    text-transform: uppercase;
    color: white(50);
    vertical-align: top;
    margin-top: 0.85rem;
    @include respond(mobile) {
      visibility: hidden;
    }
  }
  &::after {
    content: attr(data-current-time);
    width: auto;
    vertical-align: bottom;
    margin-top: 0;
    margin-bottom: 0.6rem;
    position: absolute;
    right: 0;
    bottom: 0;
  }
  :deep(.char-center) {
    will-change: opacity;
    backface-visibility: hidden;
    opacity: 0.3;
  }
  & > :deep(div:last-child) {
    margin-right: getRem(100);
  }
}
</style>
