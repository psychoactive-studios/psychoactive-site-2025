<template>
  <section class="team">
    <ul class="team__list">
      <li class="team__list_item">
        <div class="item__img">
          <img src="/img/team-Andrew.jpg" alt="" />
        </div>
        <h3 class="item__name">Andrew</h3>
      </li>
      <li class="team__list_item">
        <div class="item__img">
          <img src="/img/team-Luca.jpg" alt="" />
        </div>
        <h3 class="item__name">Luca</h3>
      </li>
      <li class="team__list_item">
        <div class="item__img">
          <img src="/img/team-Sheridan.jpg" alt="" />
        </div>
        <h3 class="item__name">Sheridan</h3>
      </li>
      <li class="team__list_item">
        <div class="item__img">
          <img src="/img/team-Alex.jpg" alt="" />
        </div>
        <h3 class="item__name">Alex</h3>
      </li>
      <li class="team__list_item">
        <div class="item__img">
          <img src="/img/team-Andrew.jpg" alt="" />
        </div>
        <h3 class="item__name">Andrew</h3>
      </li>
      <li class="team__list_item">
        <div class="item__img">
          <img src="/img/team-Luca.jpg" alt="" />
        </div>
        <h3 class="item__name">Luca</h3>
      </li>
      <li class="team__list_item">
        <div class="item__img">
          <img src="/img/team-Sheridan.jpg" alt="" />
        </div>
        <h3 class="item__name">Sheridan</h3>
      </li>
      <li class="team__list_item">
        <div class="item__img">
          <img src="/img/team-Alex.jpg" alt="" />
        </div>
        <h3 class="item__name">Alex</h3>
      </li>
    </ul>
  </section>
</template>
<style lang="scss" scoped>
.team {
  &__list {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 48px;
  }
  &__list_item {
    display: flex;
    flex-direction: column;
    gap: 24px;
    .item__img {
      aspect-ratio: 0.69;
      border-radius: 10px;
      overflow: hidden;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    .item__name {
      font-size: 1.044vw;
      font-style: normal;
      font-weight: 400;
      line-height: 130%;
    }
  }
}
</style>
