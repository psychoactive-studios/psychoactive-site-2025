<script setup>
import gsap from 'gsap';

const containerRef = ref(null);
const data = ref({
  worldOfWearableArt: 7000,
  summerGameFest: 1000,
  superAI: 100,
});

let ctx = null;

onMounted(() => {
  ctx = gsap.context(() => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: containerRef.value,
          start: 'top center',
          end: 'bottom center',
        },
      })
      .from(
        '.grid__item',
        {
          opacity: 0,
          duration: 1.5,
          stagger: 0.3,
        },
        'start'
      )
      .fromTo(
        data.value,
        {
          worldOfWearableArt: 0,
        },
        {
          worldOfWearableArt: 7000,
          duration: 1.5,
        },
        'start'
      )
      .fromTo(
        data.value,
        {
          summerGameFest: 0,
        },
        {
          summerGameFest: 1000,
          duration: 1.5,
        },
        'start+=0.2'
      )
      .fromTo(
        data.value,
        {
          superAI: 0,
        },
        {
          superAI: 100,
          duration: 1.5,
        },
        'start+=0.4'
      )
      .fromTo(
        '.grid__item_info',
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 1, stagger: 0.3 },
        'start+=1.0'
      );
  }, containerRef.value);
});

onUnmounted(() => {
  if (ctx) ctx.revert();
});
</script>
<template>
  <ul ref="containerRef" class="grid">
    <li class="grid__item">
      <div class="grid__item_number">
        {{ Math.floor(data.worldOfWearableArt).toLocaleString('en-US') }}+
      </div>
      <div class="grid__item_info">World of WearableArt</div>
    </li>
    <li class="grid__item">
      <div class="grid__item_number">
        {{ Math.floor(data.summerGameFest).toLocaleString('en-US') }}+
      </div>
      <div class="grid__item_info">Summer Game Fest</div>
    </li>
    <li class="grid__item">
      <div class="grid__item_number">
        {{ Math.floor(data.superAI).toLocaleString('en-US') }}+
      </div>
      <div class="grid__item_info">SuperAI</div>
    </li>
  </ul>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
.grid {
  display: flex;
  justify-content: space-between;
  &__item {
    &_number {
      font-size: 6.25vw;
      font-style: normal;
      font-weight: 400;
      line-height: 100%; /* 120px */
      letter-spacing: -0.06em;
      color: white(80);
    }
    &_info {
      margin-top: getRem(46);
      font-size: getRem(20);
      font-style: normal;
      font-weight: 400;
      line-height: 130%; /* 26px */
      display: inline-flex;
      align-items: center;
      gap: getRem(12);
      clip-path: inset(0 100% 0 0);
      &::before {
        content: 'Sold out event';
        border-radius: 50%;
        font-family: 'RoobertMono';
        font-size: 1rem;
        font-style: normal;
        font-weight: 500;
        line-height: 100%; /* 16px */
        text-transform: uppercase;
        border-radius: 6px;
        background: #136df4;
        padding: 4px 12px;
      }
    }
  }
}
</style>
