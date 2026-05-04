<script setup>
import gsap from 'gsap';

const elementRef = ref(null);

onMounted(async () => {
  gsap.fromTo(
    elementRef.value,
    {
      '--bg-width': 0,
    },
    {
      scrollTrigger: {
        trigger: elementRef.value,
        start: 'top-=50% 50%',
        end: 'bottom+=50% 50%',
        scrub: true,
        invalidateOnRefresh: true,
      },
      '--bg-width': 100,
      duration: 0.1,
    }
  );
});
</script>
<template>
  <div ref="elementRef" class="text-block" style="--bg-width: 50">
    <slot />
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/functions' as *;
.text-block {
  color: transparent;
  font-size: inherit;
  font-style: inherit;
  font-weight: inherit;
  line-height: inherit;
  letter-spacing: inherit;
  display: inline;

  background: linear-gradient(
    90deg,
    white(100) calc(var(--bg-width) * 1%),
    white(30) 0%
  );
  background-clip: text;
  -webkit-background-clip: text;

  // Highlight pattern — <span class="dark"> wrappers dim
  // "supporting" phrases so the un-wrapped phrases pop. Set a
  // constant 50% white fill that overrides the parent's gradient
  // — dark spans stay visibly-but-dimmer regardless of sweep
  // position. Earlier opacity-on-gradient approach made dark spans
  // disappear in the unrevealed area (30% × 0.45 ≈ 13% white,
  // basically invisible on the dark background).
  :deep(.dark) {
    -webkit-text-fill-color: white(50);
    color: white(50);
    background: none;
    -webkit-background-clip: initial;
    background-clip: initial;
  }
}
</style>
