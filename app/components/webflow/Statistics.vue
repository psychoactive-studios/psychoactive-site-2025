<script setup>
import gsap from 'gsap';

const containerRef = ref(null);
const data = ref({
  worldOfWearableArt: 60000,
  summerGameFest: 50,
  superAI: 7000,
});

let ctx = null;

onMounted(() => {
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
          worldOfWearableArt: data.value.worldOfWearableArt,
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
          summerGameFest: data.value.summerGameFest,
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
          superAI: data.value.superAI,
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
      <div class="grid__item_number display-xl--mobile">
        {{ Math.floor(data.worldOfWearableArt).toLocaleString('en-US') }}+
      </div>
      <div class="grid__item_info">
        <label>ATTENDEES EACH SEASON</label>
        <span>World of WearableArt</span>
      </div>
    </li>
    <li class="grid__item">
      <div class="grid__item_number display-xl--mobile">
        {{ Math.floor(data.summerGameFest).toLocaleString('en-US') }} million+
      </div>
      <div class="grid__item_info">
        <label>LIVESTREAM VIEWS</label>
        <span>Summer Game Fest</span>
      </div>
    </li>
    <li class="grid__item">
      <div class="grid__item_number display-xl--mobile">
        {{ Math.floor(data.superAI).toLocaleString('en-US') }}+
      </div>
      <div class="grid__item_info">
        <label>SELL OUT EVENT</label>
        <span>SuperAI</span>
      </div>
    </li>
  </ul>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
.grid {
  display: flex;
  justify-content: space-between;
  @include respond(mobile) {
    flex-direction: column;
    gap: getRem(60);
  }
  &__item {
    &_number {
      color: white(80);
      // Prevent the number wrapping onto two lines (e.g. "50 million+")
      // when the column gets squeezed on intermediate viewport widths.
      white-space: nowrap;
      @include respond(mobile) {
        font-size: max(10.25vw, 42px);
      }
    }
    &_info {
      margin-top: 2.4vw;
      font-size: clamp(12px, 1.042vw, 20px);
      font-style: normal;
      font-weight: 400;
      line-height: 130%; /* 26px */
      display: inline-flex;
      align-items: center;
      gap: getRem(12);
      clip-path: inset(0 100% 0 0);
      position: relative;
      label {
        border-radius: 50%;
        font-family: 'RoobertMono';
        font-size: clamp(12px, 0.833vw, 16px);
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
