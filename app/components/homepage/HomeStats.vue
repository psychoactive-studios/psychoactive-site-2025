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
      <!-- Mirrors the layout of the Webflow page Statistics component:
           flex with space-between, no equal-width columns, so each
           number takes its natural width and "50 million+" doesn't
           wrap. First item left, third item right-aligned. -->
      <ul class="home-stats__list">
        <li v-for="stat in stats" :key="stat.client" class="home-stats__item">
          <div class="home-stats__number display-xl--mobile">
            {{ stat.number }}
          </div>
          <div class="home-stats__info">
            <label>{{ stat.label }}</label>
            <span>{{ stat.client }}</span>
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

  &__item {
    display: flex;
    flex-direction: column;
    gap: getRem(16);

    // Mirror the Webflow page's left/right edge alignment so the row
    // visually anchors to the section edges.
    &:last-child {
      align-items: flex-end;
      text-align: right;

      @include respond(mobile) {
        align-items: flex-start;
        text-align: left;
      }
    }
  }

  &__number {
    // Typography (font-size, line-height, letter-spacing) is inherited
    // from the .display-xl--mobile class on the element itself — same
    // class the Webflow page Statistics component uses, so the numbers
    // match in size and weight. We only override what's specific to
    // this layout.
    color: white(80);
    white-space: nowrap;

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
