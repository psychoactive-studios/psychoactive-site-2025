<script setup>
const props = defineProps({
  feedback: {
    type: Object,
    required: true,
  },
});

const { feedback } = props;
</script>

<template>
  <div class="slide">
    <div class="slide__photo">
      <img
        v-if="feedback?.client?.photo?.url"
        :src="feedback?.client?.photo?.url"
        alt=""
      />
    </div>
    <div class="slide__body">
      <h3 class="subheader--mobile">CLIENT SAY</h3>
      <div class="slide__body-text body--mobile">
        {{ feedback.feedback }}
      </div>
      <div class="slide__body-author">
        <div class="slide__body-author-name body-large--mobile">
          {{ feedback.client?.name }}
        </div>
        <div class="slide__body-author-position subheader--mobile">
          {{ feedback.client?.position }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/typography' as *;
.slide {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  border-radius: 24px;
  background: #1b1b1b;
  padding: getRem(24);
  height: 100%;
  @include respond(mobile) {
    display: flex;
    flex-direction: column;
    gap: getRem(12);
    padding: getRem(12);
    border-radius: getRem(12);
  }
  &__photo {
    aspect-ratio: 0.53;
    @include respond(mobile) {
      aspect-ratio: 1;
      overflow: hidden;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top;
      border-radius: getRem(12);
    }
  }
  &__body {
    display: flex;
    flex-direction: column;
    @include respond(mobile) {
      flex-grow: 1;
    }
    h3 {
      color: white(50);
      margin-bottom: getRem(48);
      @include respond(mobile) {
        margin-bottom: getRem(24);
      }
    }
    &-text {
      margin-bottom: getRem(24);
    }
    &-author {
      margin-top: auto;
      &-name {
        // font-size: max(1.25vw, 16px);
        // font-style: normal;
        // font-weight: 400;
        // line-height: 125%;
        color: white(80);
        margin-bottom: getRem(12);
      }
      &-position {
        color: white(50);
      }
    }
  }
}
</style>
