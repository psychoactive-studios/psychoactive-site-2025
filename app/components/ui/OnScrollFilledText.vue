<script setup>
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

const elementRef = ref(null);

onMounted(async () => {
  await nextTick();
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
  <div ref="elementRef" class="text-block">
    <slot />
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
.text-block {
  color: $color-foreground;
  font-size: 2.5vw;
  font-style: normal;
  font-weight: 400;
  line-height: 120%;
  letter-spacing: -0.02em;
  position: relative;
  :deep(.dark) {
    color: white(50);
  }
  :deep(.char-center) {
    will-change: opacity;
    backface-visibility: hidden;
    opacity: 0.3;
  }
}
</style>
