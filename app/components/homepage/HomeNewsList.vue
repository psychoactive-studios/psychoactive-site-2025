<script setup>
import { newsData } from '~/data/newsData';
import HomeNewsCard from './HomeNewsCard.vue';
import LinkWithHover from '../ui/LinkWithHover.vue';
</script>

<template>
  <section class="news-list">
    <div class="container">
      <div class="news-list__grid">
        <HomeNewsCard
          v-for="news in newsData"
          :key="news.id"
          :title="news.title"
          :category="news.category"
          :date="news.date"
          :src="news.src"
          :href="news.href"
        />
      </div>
      <div class="news-list__more">
        <div class="news-list__more_line" />
        <LinkWithHover href="/content-hub">
          Explore Our Content Hub
        </LinkWithHover>
        <div class="news-list__more_line" />
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
.news-list {
  margin-top: 160px;
  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: getRem(16);
    @media screen and (max-width: 1400px) {
      grid-template-columns: repeat(2, 1fr);
    }
    @include respond(mobile) {
      grid-template-columns: 1fr;
    }
  }
  &__more {
    margin-top: 85px;
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 1rem;
    font-family: 'RoobertMono';
    font-style: normal;
    font-weight: 500;
    line-height: 27px; /* 168.75% */
    text-transform: uppercase;
    @include respond(mobile) {
      margin-top: getRem(64);
    }
    &_line {
      flex-grow: 1;
      height: 1px;
      background-color: white(20);
      position: relative;
      &::before {
        content: '';
        position: absolute;
        top: -3px;
        left: -4px;
        width: 7px;
        height: 7px;
        background-color: white(50);
        border-radius: 50%;
      }
      &::after {
        content: '';
        position: absolute;
        top: -3px;
        right: -4px;
        width: 7px;
        height: 7px;
        background-color: white(50);
        border-radius: 50%;
      }
    }
  }
}
</style>
