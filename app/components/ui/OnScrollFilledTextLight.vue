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
  // "supporting" phrases so the un-wrapped phrases pop. Use opacity
  // (not a separate gradient) so the parent's gradient sweep stays
  // a single continuous reveal across the whole text — earlier
  // approach gave each dark span its own gradient which produced
  // multiple visible sweep edges.
  :deep(.dark) {
    opacity: 0.45;
  }
}
</style>
