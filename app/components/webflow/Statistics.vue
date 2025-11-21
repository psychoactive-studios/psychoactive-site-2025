<template>
  <ul class="grid">
    <li class="grid__item">
      <div class="grid__item_number">7,000+</div>
      <div class="grid__item_info">World of WearableArt</div>
    </li>
    <li class="grid__item">
      <div class="grid__item_number">1,000+</div>
      <div class="grid__item_info">Summer Game Fest</div>
    </li>
    <li class="grid__item">
      <div class="grid__item_number">100+</div>
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
