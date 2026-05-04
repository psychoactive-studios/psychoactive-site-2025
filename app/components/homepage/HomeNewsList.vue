<script setup>
import HomeNewsCard from './HomeNewsCard.vue';
import SectionMoreLink from '../ui/SectionMoreLink.vue';

defineProps({
  data: {
    type: Array,
    required: true,
  },
});

const getHref = (news) => {
  if (news.externalLink) {
    return news.externalLink;
  }
  if (news.work && news.work.slug) {
    return `/work/${news.work.slug}`;
  }
  return `/content-hub/${news.slug}`;
};
</script>

<template>
  <section class="news-list">
    <div class="container">
      <h2 class="news-list__title">From the feed</h2>
      <div class="news-list__grid">
        <HomeNewsCard
          v-for="news in data"
          :key="news.id"
          :title="news.title"
          :category="news.category?.name"
          :date="news.updatedAt"
          :src="news.preview?.formats?.medium?.url || news.preview?.url"
          :href="getHref(news)"
        />
      </div>
      <SectionMoreLink
        href="/content-hub"
        label="Explore Our Content Hub"
        class="news-list__more"
      />
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
.news-list {
  margin-top: 160px;
  @include respond('mobile') {
    margin-top: 60px;
  }
  &__title {
    display: none;
    @include respond('mobile') {
      display: block;
      font-size: 9.6vw;
      font-style: normal;
      font-weight: 400;
      line-height: 88%;
      letter-spacing: -0.06em;
      margin-bottom: 9.6vw;
    }
  }
  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
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
    @include respond(mobile) {
      margin-top: getRem(64);
    }
  }
}
</style>
