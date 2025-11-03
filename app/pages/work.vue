<script setup>
import CaseStadyPreview from '~/components/ui/CaseStadyPreview.vue';
import LetsTalkDots from '~/components/ui/LetsTalkDots.vue';
import { useLoader } from '~/composables/useLoader';
import useScrollSmoother from '~/composables/useScrollSmoother';
import { worksData } from '~/data/worksData';

const { stopLoading } = useLoader();
const { scrollSmoother } = useScrollSmoother();

onMounted(async () => {
  stopLoading();
  await nextTick();
  scrollSmoother.value.paused(false);
});
</script>
<template>
  <div class="container">
    <div class="works">
      <div class="works__title">
        <h1>OUR Projects</h1>
        <p>
          Where bold ideas become living, breathing digital experiences. Crafted
          with intention and built to perform.
        </p>
      </div>
      <div class="works__grid">
        <template v-for="work in worksData" :key="work.id">
          <LetsTalkDots v-if="work.id === 'letstalk'" />
          <CaseStadyPreview
            v-else
            :src="work.src"
            :title="work.title"
            :description="work.description"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
.works {
  margin-top: 160px;
  &__title {
    margin-bottom: 200px;
    max-width: calc(50% - getRem(10));
    font-size: getRem(32);
    font-style: normal;
    font-weight: 400;
    line-height: 121%; /* 45.98px */
    letter-spacing: -1.52px;
    & > h1 {
      font-family: 'RoobertMono';
      font-size: 1rem;
      font-style: normal;
      font-weight: 500;
      line-height: 146%; /* 23.36px */
      text-transform: uppercase;
      color: white(60);
      margin-bottom: getRem(20);
    }
  }
  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: getRem(20);
    direction: rtl;
    & > * {
      direction: ltr;
      &:nth-child(even) {
        margin-top: 25%;
      }
      &:nth-child(odd) {
        margin-bottom: 32%;
        margin-top: -70px;
      }
    }
  }
}
</style>
