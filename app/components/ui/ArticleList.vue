<script setup>
defineProps({
  item: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <ul v-if="item.format === 'unordered'">
    <template v-for="(child, index) in item.children || []" :key="index">
      <li v-if="child.type === 'list-item'">
        <template v-for="(textNode, tIndex) in child.children || []" :key="tIndex">
          {{ textNode.text }}
        </template>
      </li>
      <ArticleList v-else-if="child.type === 'list'" :item="child" />
    </template>
  </ul>
  <ol v-else-if="item.format === 'ordered'">
    <template v-for="(child, index) in item.children || []" :key="index">
      <li v-if="child.type === 'list-item'">
        <template v-for="(textNode, tIndex) in child.children || []" :key="tIndex">
          {{ textNode.text }}
        </template>
      </li>
      <ArticleList v-else-if="child.type === 'list'" :item="child" />
    </template>
  </ol>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;

ol,
ul {
  font-size: inherit;
  font-style: normal;
  font-weight: 400;
  line-height: 1.25;
  padding-left: getRem(32);
  list-style-type: disc;
  li {
    margin-bottom: 1.67em;    
  }
  ul {
    list-style-type: circle;
  }
}
ol {
  list-style-type: decimal;
}
</style>
