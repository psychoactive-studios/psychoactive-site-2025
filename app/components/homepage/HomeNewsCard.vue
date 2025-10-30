<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  src: {
    type: String,
    required: true,
  },
  href: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <NuxtLink :to="href" class="news-card">
    <div class="news-card__description">
      <div class="news-card__description_info">
        <div class="news-card__description_info--category">{{ category }}</div>
        <div class="news-card__description_info--date">{{ date }}</div>
      </div>
      <h3 class="news-card__description_title">
        {{ title }}
      </h3>
    </div>
    <div class="news-card__image">
      <NuxtImg :src="src" :alt="title" width="200" height="200" />
    </div>
  </NuxtLink>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
.news-card {
  border-radius: 8px;
  background: #1b1b1b;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  &__description {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    &_info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'RoobertMono';
      font-size: getRem(12);
      font-style: normal;
      font-weight: 500;
      line-height: 1.75;
      text-transform: uppercase;
      color: white(70);
      padding-left: 14px;
      position: relative;
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 6px;
        height: 6px;
        background-color: white(50);
        border-radius: 50%;
      }
    }
    &_title {
      font-size: getRem(16);
      font-style: normal;
      font-weight: 400;
      line-height: getRem(21);
      margin-top: auto;
      margin-right: 6px;
    }
  }
  &__image {
    width: 115px;
    height: 115px;
    flex-shrink: 0;
    img {
      width: 100%;
      height: 100%;
      border-radius: 8px;
      object-fit: cover;
    }
  }
}
</style>
