<script setup>
/**
 * CategoryHint — small "what does this mean?" affordance.
 *
 * Renders a tiny `?` marker next to a category label. Hovering (on
 * desktop) or tapping (on mobile) reveals a short popover explaining
 * what the category measures. Used on the score card and full report
 * so the 5 audit criteria feel like a teaching tool, not a mystery
 * score.
 *
 * Accessible — the description is also in an sr-only span so screen
 * readers get the context without needing hover/tap.
 */

defineProps({
  text: {
    type: String,
    required: true,
  },
});

const open = ref(false);
const rootRef = ref(null);

function close() {
  open.value = false;
}

// Click-outside to dismiss on mobile after a tap.
function onDocClick(e) {
  if (rootRef.value && !rootRef.value.contains(e.target)) close();
}

onMounted(() => {
  document.addEventListener('click', onDocClick, { passive: true });
});

onUnmounted(() => {
  document.removeEventListener('click', onDocClick);
});
</script>

<template>
  <span
    ref="rootRef"
    class="category-hint"
    @mouseenter="open = true"
    @mouseleave="open = false"
  >
    <button
      type="button"
      class="category-hint__trigger"
      :aria-expanded="open"
      :aria-label="`What does this mean? ${text}`"
      @click.stop="open = !open"
      @focus="open = true"
      @blur="open = false"
    >
      ?
    </button>
    <span
      v-show="open"
      class="category-hint__popover"
      role="tooltip"
    >
      {{ text }}
    </span>
  </span>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;

.category-hint {
  display: inline-flex;
  position: relative;
  vertical-align: middle;
  margin-left: 6px;

  &__trigger {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1px solid white(25);
    background: transparent;
    color: white(55);
    font-family: 'RoobertMono';
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
    cursor: help;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      background-color 0.2s ease;

    &:hover,
    &[aria-expanded='true'] {
      color: $color-foreground;
      border-color: white(60);
      background-color: white(5);
    }

    &:focus-visible {
      outline: 2px solid white(40);
      outline-offset: 3px;
    }
  }

  &__popover {
    // Positioned above the trigger, horizontally centred. Arrow
    // styling is kept out so the popover reads as a plain info chip.
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    width: max-content;
    max-width: 280px;
    padding: 10px 14px;
    background: #1b1b1b;
    border: 1px solid white(15);
    border-radius: 8px;
    color: white(80);
    font-family: 'Roobert';
    font-size: 13px;
    font-weight: 400;
    line-height: 1.5;
    letter-spacing: 0;
    text-transform: none;
    white-space: normal;
    z-index: 10;
    pointer-events: none;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);

    // On narrow viewports, a wide popover could overflow. Clamp
    // width and prefer a right-edge anchor if centering pushes it
    // off the screen.
    @include respond(mobile) {
      max-width: 240px;
      // Anchor left so the popover doesn't overflow right edge on
      // mobile rows where the trigger is far right.
      left: auto;
      right: 0;
      transform: none;
    }
  }
}
</style>
