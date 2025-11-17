<script setup>
import LetsTalkDots from './LetsTalkDots.vue';

defineProps({
  data: {
    type: Array,
    required: false,
    default: () => [],
  },
});
</script>

<template>
  <article v-if="data && data.length > 0" class="article">
    <template v-for="(block, index) in data" :key="index">
      <!-- Rich Text Component -->
      <div
        v-if="block.__component === 'shared.rich-text'"
        class="rich-text-block"
      >
        <template v-for="(item, itemIndex) in block.body" :key="itemIndex">
          <!-- Headings -->
          <h2 v-if="item.type === 'heading' && item.level === 2">
            <template
              v-for="(child, childIndex) in item.children"
              :key="childIndex"
            >
              {{ child.text }}
            </template>
          </h2>

          <h3 v-else-if="item.type === 'heading' && item.level === 3">
            <template
              v-for="(child, childIndex) in item.children"
              :key="childIndex"
            >
              {{ child.text }}
            </template>
          </h3>

          <h4 v-else-if="item.type === 'heading' && item.level === 4">
            <template
              v-for="(child, childIndex) in item.children"
              :key="childIndex"
            >
              {{ child.text }}
            </template>
          </h4>

          <p
            v-else-if="item.type === 'heading' && item.level === 5"
            class="large-body"
          >
            <template
              v-for="(child, childIndex) in item.children"
              :key="childIndex"
            >
              {{ child.text }}
            </template>
          </p>

          <h6 v-else-if="item.type === 'heading' && item.level === 6">
            <template
              v-for="(child, childIndex) in item.children"
              :key="childIndex"
            >
              {{ child.text }}
            </template>
          </h6>

          <!-- Paragraphs -->
          <p v-else-if="item.type === 'paragraph'">
            <template
              v-for="(child, childIndex) in item.children"
              :key="childIndex"
            >
              {{ child.text }}
            </template>
          </p>

          <!-- Ordered List -->
          <ol v-else-if="item.type === 'list' && item.format === 'ordered'">
            <li v-for="(listItem, listIndex) in item.children" :key="listIndex">
              <template
                v-for="(child, childIndex) in listItem.children"
                :key="childIndex"
              >
                {{ child.text }}
              </template>
            </li>
          </ol>

          <!-- Unordered List -->
          <ul v-else-if="item.type === 'list' && item.format === 'unordered'">
            <li v-for="(listItem, listIndex) in item.children" :key="listIndex">
              <template
                v-for="(child, childIndex) in listItem.children"
                :key="childIndex"
              >
                {{ child.text }}
              </template>
            </li>
          </ul>
        </template>
      </div>

      <!-- Media Component -->
      <div v-else-if="block.__component === 'shared.media'" class="image">
        <NuxtImg :src="block.file.url" sizes="100vw md:70vw xl:1600px" />
        <!-- <NuxtImg
          provider="cloudinary"
          :public-id="block.file.url"
          width="1000"
          height="563"
          alt="Article image"
        /> -->
      </div>

      <!-- Quote Component -->
      <div v-else-if="block.__component === 'shared.quote'" class="quote">
        <div class="quote__wrapper">
          <blockquote>
            {{ block.body }}
          </blockquote>
        </div>
        <div class="quote__author">{{ block.author }}</div>
      </div>

      <!-- CTA Component -->
      <div v-else-if="block.__component === 'shared.cta'" class="cta">
        <LetsTalkDots mode="light" :text="block.buttonText" />
      </div>

      <!-- Media Grid Component -->
      <div
        v-else-if="block.__component === 'shared.media-grid'"
        class="image-double"
      >
        <img
          v-for="image in block.mediaGrid"
          :key="image.id"
          :src="image.url"
          alt=""
        />
      </div>
    </template>
  </article>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;

.article {
  & > *:first-child {
    margin-top: 0;
  }
  & > *:last-child {
    margin-bottom: 0;
  }
  & > * {
    width: 50%;
    margin-left: auto;
    margin-right: auto;
  }
  h2 {
    margin-bottom: 60px;
    font-size: getRem(64);
    font-style: normal;
    font-weight: 400;
    line-height: 100%; /* 64px */
    letter-spacing: -0.05em;
  }
  h3 {
    margin-bottom: 60px;
    font-size: getRem(56);
    font-style: normal;
    font-weight: 400;
    line-height: 100%;
    letter-spacing: -0.04em;
  }
  h4 {
    margin-bottom: 60px;
    font-size: getRem(48);
    font-style: normal;
    font-weight: 400;
    line-height: 120%;
    letter-spacing: -0.04em;
  }
  h5 {
    margin-bottom: 60px;
    font-size: getRem(40);
    font-style: normal;
    font-weight: 400;
    line-height: 100%; /* 40px */
    letter-spacing: -0.04em;
  }
  h6 {
    font-family: 'RoobertMono';
    font-size: 1rem;
    font-style: normal;
    font-weight: 500;
    line-height: 100%;
    text-transform: uppercase;
    margin-bottom: getRem(12);
  }
  p {
    font-size: getRem(24);
    font-style: normal;
    font-weight: 400;
    line-height: 1.25; /* 125% */
    margin-bottom: getRem(40);
    &.large-body {
      font-size: getRem(32);
      line-height: 112.5%;
    }
  }
  .image {
    margin-top: 120px;
    margin-bottom: 120px;
    width: 100%;
    img {
      width: 100%;
      height: auto;
    }
    &-double {
      margin-top: 120px;
      margin-bottom: 120px;
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: getRem(20);
      img {
        width: 100%;
        aspect-ratio: 1 / 1;
        object-fit: cover;
      }
    }
  }
  .quote {
    margin-bottom: getRem(60);
    &__wrapper {
      position: relative;
      &::before {
        content: '';
        display: block;
        width: 1px;
        position: absolute;
        top: 0.8rem;
        left: 3px;
        bottom: 0.8rem;
        background-color: $color-background;
        opacity: 0.2;
      }
      blockquote {
        font-size: getRem(38);
        font-style: normal;
        font-weight: 400;
        line-height: 120%; /* 45.6px */
        letter-spacing: -0.04em;
        padding-left: 50px;
        margin-bottom: 48px;
        &::before {
          content: '';
          display: block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: $color-background;
          position: absolute;
          top: 0.6rem;
          left: 0;
          opacity: 0.5;
        }
        &::after {
          content: '';
          display: block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: $color-background;
          position: absolute;
          bottom: 0.6rem;
          left: 0;
          opacity: 0.5;
        }
      }
    }
    &__author {
      font-family: 'RoobertMono';
      font-size: 1rem;
      font-style: normal;
      font-weight: 500;
      line-height: 100%;
      text-transform: uppercase;
    }
  }
  .spacer {
    overflow: hidden;
  }
  .cta {
    margin-top: 120px;
    margin-bottom: 120px;
  }
  ol,
  ul {
    font-size: getRem(24);
    font-style: normal;
    font-weight: 400;
    line-height: 1.25;
    padding-left: getRem(32);
    li {
      margin-bottom: getRem(40);
    }
  }
  ol {
    list-style-type: decimal;
  }
  ul {
    list-style-type: disc;
  }
}
</style>
