<script setup>
/**
 * AuditRecentTicker — social proof strip on /design-audit.
 *
 * Shows the last handful of audits (hostname + score + relative time)
 * so a first-time visitor sees the tool is already in use and sparks
 * the "huh, what'd I score?" instinct. Real data, pulled from the
 * /api/audit-recent endpoint which only exposes hostname + score
 * (never the full URL or any PII).
 *
 * Fetched client-side on mount (keeps SSR fast, data is social-proof
 * not critical-path). Gracefully renders nothing if the fetch fails
 * or there's no data yet.
 */

const items = ref([]);
const loaded = ref(false);

onMounted(async () => {
  try {
    const res = await $fetch('/api/audit-recent');
    items.value = res?.items || [];
  } catch (err) {
    console.warn('Recent audits fetch failed:', err);
  } finally {
    loaded.value = true;
  }
});

function scoreBand(score) {
  if (score >= 85) return 'score--gold';
  if (score >= 70) return 'score--warm';
  if (score >= 55) return 'score--neutral';
  if (score >= 35) return 'score--cool';
  return 'score--cold';
}

function timeAgo(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}
</script>

<template>
  <!-- Hidden entirely until we know whether there's data — avoids a
       layout flash on first paint. -->
  <section v-if="loaded && items.length" class="recent-ticker">
    <div class="container">
      <p class="recent-ticker__eyebrow subheader-small">
        Recently audited
      </p>
      <ul class="recent-ticker__list">
        <li
          v-for="item in items"
          :key="item.hostname + item.createdAt"
          class="recent-ticker__item"
        >
          <span class="recent-ticker__host">{{ item.hostname }}</span>
          <span
            class="recent-ticker__score"
            :class="scoreBand(item.score)"
          >
            {{ item.score }}/100
          </span>
          <span class="recent-ticker__time">{{ timeAgo(item.createdAt) }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;

.recent-ticker {
  padding: 4dvh 0 8dvh 0;

  .container {
    @include container;
    max-width: 1280px;
  }

  &__eyebrow {
    color: white(50);
    font-family: 'RoobertMono';
    font-size: getRem(12);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin: 0 0 20px 0;
  }

  &__list {
    list-style: none;
    padding: 0;
    margin: 0;
    border-top: 1px solid white(10);
  }

  &__item {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 16px 32px;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid white(10);
    font-family: 'RoobertMono';
    font-size: getRem(14);

    @include respond(mobile) {
      grid-template-columns: 1fr auto;
      grid-template-rows: auto auto;
      gap: 4px 16px;
    }
  }

  &__host {
    color: white(85);
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }

  &__score {
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid white(15);
    color: white(80);
    letter-spacing: 0.02em;
    font-size: getRem(12);

    // Matches the band accent tints on the score card so scores feel
    // consistent across the tool.
    &.score--gold {
      color: #f0d58a;
      border-color: rgba(240, 213, 138, 0.35);
    }
    &.score--warm {
      color: #e5cba0;
      border-color: rgba(229, 203, 160, 0.25);
    }
    &.score--neutral {
      color: white(80);
      border-color: white(20);
    }
    &.score--cool {
      color: #b6c4d4;
      border-color: rgba(182, 196, 212, 0.25);
    }
    &.score--cold {
      color: #a9b6c8;
      border-color: rgba(169, 182, 200, 0.3);
    }
  }

  &__time {
    color: white(40);
    font-size: getRem(12);
    letter-spacing: 0.02em;

    @include respond(mobile) {
      grid-column: 1 / -1;
    }
  }
}
</style>
