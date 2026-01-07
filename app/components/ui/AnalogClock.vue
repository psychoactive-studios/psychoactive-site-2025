<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  city: {
    type: String,
    default: 'MELB',
  },
});

const timezoneMap = {
  WLG: 'Pacific/Auckland',
  MELB: 'Australia/Melbourne',
  SING: 'Asia/Singapore',
  CALI: 'America/Los_Angeles',
};

const currentZone = computed(
  () => timezoneMap[props.city] || 'Australia/Melbourne'
);

const currentTime = ref(new Date());
let timer;

const updateTime = () => {
  currentTime.value = new Date();
};

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

// Helper to get time parts for current city
const getTimeParts = (date) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: currentZone.value,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
  return formatter.formatToParts(date);
};

const rotation = computed(() => {
  const parts = getTimeParts(currentTime.value);
  const hPart = parts.find((p) => p.type === 'hour');
  const mPart = parts.find((p) => p.type === 'minute');

  let h = hPart ? parseInt(hPart.value) : 0;
  const m = mPart ? parseInt(mPart.value) : 0;

  // Handle edge case where 24 might be returned
  if (h === 24) h = 0;

  return {
    h: ((h % 12) + m / 60) * 30,
    m: m * 6,
  };
});

const formattedTime = computed(() => {
  return currentTime.value.toLocaleTimeString('en-US', {
    timeZone: currentZone.value,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
});
</script>

<template>
  <div class="timezone">
    <div class="timezone__label">{{ city }}</div>
    <div class="timezone__clock">
      <svg
        width="17"
        height="17"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle class="clock__circle" cx="7" cy="7" r="6.5" />
        <line
          class="clock__hand hour"
          x1="7"
          y1="7"
          x2="7"
          y2="3.5"
          stroke-linecap="square"
          :transform="`rotate(${rotation.h}, 7, 7)`"
        />
        <line
          class="clock__hand minute"
          x1="7"
          y1="7"
          x2="7"
          y2="1.8"
          stroke-linecap="square"
          :transform="`rotate(${rotation.m}, 7, 7)`"
        />
      </svg>
    </div>
    <div class="clock__time">{{ formattedTime }}</div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;

.timezone {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'RoobertMono';
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  text-transform: uppercase;
  color: white(60);

  &__clock {
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;

    .clock__circle {
      stroke: white(20);
    }

    .clock__hand {
      &.hour {
        stroke: white(60);
      }
      &.minute {
        stroke: white(40);
      }
    }

    svg {
      display: block;
    }
  }
}
</style>
