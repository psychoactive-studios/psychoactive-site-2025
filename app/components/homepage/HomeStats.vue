<script setup>
// Stats strip — three real numbers from headline projects.
// Rendered server-side (outside <ClientOnly>) so the audit tool,
// Google, and LinkedIn previews see real proof points in the static
// HTML. Mirrors the treatment used on the Webflow page.

const stats = [
  {
    number: '60,000+',
    label: 'Attendees each season',
    client: 'World of WearableArt',
  },
  {
    number: '50 million+',
    label: 'Livestream views',
    client: 'Summer Game Fest',
  },
  {
    number: '7,000+',
    label: 'Sell-out event',
    client: 'SuperAI',
  },
];
</script>

<template>
  <section class="home-stats" aria-labelledby="home-stats-heading">
    <div class="container">
      <h2 id="home-stats-heading" class="sr-only">
        Numbers from recent client work
      </h2>
      <ul class="home-stats__list">
        <li v-for="stat in stats" :key="stat.client" class="home-stats__item">
          <div class="home-stats__number">{{ stat.number }}</div>
          <div class="home-stats__meta">
            <span class="home-stats__label">{{ stat.label }}</span>
            <span class="home-stats__client">{{ stat.client }}</span>
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

  @include respond(mobile) {
    padding: getRem(48) 0;
  }

  &__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: clamp(24px, 4vw, 80px);

    @include respond(mobile) {
      grid-template-columns: 1fr;
      gap: getRem(36);
    }
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: getRem(16);
  }

  &__number {
    font-size: clamp(48px, 6.25vw, 120px);
    font-weight: 400;
    line-height: 0.95;
    letter-spacing: -0.02em;
    color: white(85);

    @include respond(mobile) {
      font-size: clamp(56px, 16vw, 96px);
    }
  }

  &__meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: getRem(12);
  }

  &__label {
    display: inline-block;
    background: $color-blue;
    color: $color-foreground;
    text-transform: uppercase;
    font-family: 'RoobertMono', monospace;
    font-size: clamp(10px, 0.7vw, 12px);
    letter-spacing: 0.06em;
    padding: getRem(6) getRem(12);
    border-radius: getRem(4);
    line-height: 1;
  }

  &__client {
    color: white(85);
    font-size: clamp(14px, 1vw, 18px);
  }
}
</style>
