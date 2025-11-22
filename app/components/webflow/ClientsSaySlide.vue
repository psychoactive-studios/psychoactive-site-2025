<script setup>
defineProps({
  client: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div class="slide">
    <div class="slide__photo">
      <img :src="client.src" alt="" />
    </div>
    <div class="slide__body">
      <h3>CLIENT SAY</h3>
      <div class="slide__body-text">
        {{ client.feedback }}
      </div>
      <div class="slide__body-author">
        <div class="slide__body-author-name">
          {{ client.name }}
        </div>
        <div class="slide__body-author-position">{{ client.position }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
.slide {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  border-radius: 24px;
  background: #1b1b1b;
  padding: getRem(24);
  &__photo {
    aspect-ratio: 0.53;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: getRem(10);
    }
  }
  &__body {
    display: flex;
    flex-direction: column;
    h3 {
      font-family: 'RoobertMono';
      font-size: 0.835vw;
      font-style: normal;
      font-weight: 500;
      line-height: 100%; /* 16px */
      text-transform: uppercase;
      color: white(50);
      margin-bottom: getRem(48);
    }
    &-text {
      font-size: 1.25vw;
      font-style: normal;
      font-weight: 400;
      line-height: 125%;
    }
    &-author {
      margin-top: auto;
      &-name {
        font-size: 1.25vw;
        font-style: normal;
        font-weight: 400;
        line-height: 125%;
        color: white(80);
        margin-bottom: getRem(12);
      }
      &-position {
        font-family: 'RoobertMono';
        font-size: 0.835vw;
        font-style: normal;
        font-weight: 500;
        line-height: 100%; /* 16px */
        text-transform: uppercase;
        color: white(50);
      }
    }
  }
}
</style>
