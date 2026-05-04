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
  // Reduced from 160px so the news cards sit closer to the
  // "View all work" CTA above. Combined with the larger gap below
  // the cards (news-list__more margin-top), the cards read as
  // visually framed by the two CTAs at near-symmetric distance.
  margin-top: 100px;
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
    // Bumped from 85px so the gap above the content-hub CTA matches
    // the gap above the news cards (news-list margin-top: 100px).
    // Symmetric framing — see comment on .news-list above.
    margin-top: 100px;
    @include respond(mobile) {
      margin-top: getRem(64);
    }
  }
}
</style>
