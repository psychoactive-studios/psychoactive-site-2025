<script setup>
// Stats strip — three real numbers from headline projects.
// Rendered server-side (outside <ClientOnly>) so the audit tool,
// Google, and LinkedIn previews see real proof points in the static
// HTML. Mirrors the treatment used on the Webflow page Statistics
// component, including the scroll-triggered count-up animation.
//
// SSR safety: `data` is initialised to the target values, so the
// static HTML serves real numbers (not zeros). GSAP only resets to
// 0 and animates back up once the user scrolls the section into
// view — and by then the section is just entering the viewport, so
// the snap-back isn't visible to the user.

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const containerRef = ref(null);
let ctx;

const data = ref({
  worldOfWearableArt: 60000,
  summerGameFest: 50,
  superAI: 7000,
});

const stats = computed(() => [
  {
    number: `${Math.floor(data.value.worldOfWearableArt).toLocaleString('en-US')}+`,
    label: 'Attendees each season',
    client: 'World of WearableArt',
  },
  {
    number: `${Math.floor(data.value.summerGameFest).toLocaleString('en-US')} million+`,
    label: 'Livestream views',
    client: 'Summer Game Fest',
  },
  {
    number: `${Math.floor(data.value.superAI).toLocaleString('en-US')}+`,
    label: 'Sell-out event',
    client: 'SuperAI',
  },
]);

onMounted(() => {
  if (!containerRef.value) return;
  ctx = gsap.context(() => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: containerRef.value,
          start: 'top 90%',
          end: 'bottom center',
        },
      })
      .from(
        '.home-stats__item',
        {
          opacity: 0,
          y: 24,
          duration: 1.2,
          stagger: 0.2,
          ease: 'power3.out',
        },
        'start'
      )
      .fromTo(
        data.value,
        { worldOfWearableArt: 0 },
        { worldOfWearableArt: data.value.worldOfWearableArt, duration: 1.4, ease: 'power2.out' },
        'start'
      )
      .fromTo(
        data.value,
        { summerGameFest: 0 },
        { summerGameFest: data.value.summerGameFest, duration: 1.4, ease: 'power2.out' },
        'start+=0.2'
      )
      .fromTo(
        data.value,
        { superAI: 0 },
        { superAI: data.value.superAI, duration: 1.4, ease: 'power2.out' },
        'start+=0.4'
      );
  }, containerRef.value);
});

onUnmounted(() => {
  if (ctx) ctx.revert();
});
</script>

<template>
  <section
    ref="containerRef"
    class="home-stats"
    aria-labelledby="home-stats-heading"
  >
    <div class="container">
      <h2 id="home-stats-heading" class="sr-only">
        Numbers from recent client work
      </h2>
      <!-- Mirrors the layout of the Webflow page Statistics component:
           flex with space-between, no equal-width columns, so each
           number takes its natural width and "50 million+" doesn't
           wrap. First item left, third item right-aligned. -->
      <ul class="home-stats__list">
        <li v-for="stat in stats" :key="stat.client" class="home-stats__item">
          <div class="home-stats__inner">
            <div class="home-stats__number display-xl--mobile">
              {{ stat.number }}
            </div>
            <div class="home-stats__info">
              <label>{{ stat.label }}</label>
              <span>{{ stat.client }}</span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/functions' as *;

.home-stats {
  position: relative;
  z-index: 1;
  background-color: $color-background;
  padding: getRem(80) 0 getRem(80);

  // Hidden on mobile — the mobile flow runs hero → intro paragraph
  // → cases for a tighter, less cluttered top of page. The stats
  // still appear in the SSR HTML for crawlers; they just don't
  // render visually on mobile.
  @include respond(mobile) {
    display: none;
  }

  &__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: getRem(24);

    @include respond(mobile) {
      flex-direction: column;
      align-items: stretch;
      gap: getRem(60);
    }
  }

  // Each item is just a positioning wrapper — the actual layout
  // (number above, chip+client below) lives inside __inner. This
  // lets the third item sit at the right edge of the section while
  // the chip+client name left-aligns to the start of "7,000+" rather
  // than to the right edge of the page.
  &__item {
    display: flex;
  }

  &__inner {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: getRem(16);
  }

  &__number {
    // Sized down from the Webflow page Statistics treatment (6.25vw)
    // to 5vw so the stats don't dominate the homepage hero stack —
    // they were competing with the partner logos and the case-study
    // grid for visual weight. Still big and confident, but the row
    // feels lighter.
    // Line-height + letter-spacing inherit from .display-xl--mobile.
    color: white(80);
    white-space: nowrap;
    font-size: 5vw;

    @include respond(mobile) {
      font-size: max(10.25vw, 42px);
    }
  }

  &__info {
    margin-top: 2.4vw;
    font-size: clamp(12px, 1.042vw, 20px);
    font-weight: 400;
    line-height: 130%;
    display: inline-flex;
    align-items: center;
    gap: getRem(12);
    color: white(85);

    @include respond(mobile) {
      margin-top: getRem(12);
    }

    label {
      font-family: 'RoobertMono', monospace;
      font-size: clamp(12px, 0.833vw, 16px);
      font-weight: 500;
      line-height: 100%;
      text-transform: uppercase;
      border-radius: 6px;
      background: $color-blue;
      color: $color-foreground;
      padding: 4px 12px;
    }
  }
}
</style>
