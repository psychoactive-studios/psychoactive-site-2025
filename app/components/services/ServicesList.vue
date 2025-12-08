<script setup>
import gsap from 'gsap';
import { listData } from '~/data/servicesData';
import { servicesListAnimation } from '~/utils/animations/services';

const containerRef = ref(null);
let ctx = null;

onMounted(async () => {
  await nextTick();
  ctx = gsap.context(() => {}, containerRef.value);
  servicesListAnimation(ctx, containerRef.value);
});

onUnmounted(() => {
  if (ctx) ctx.revert();
});
</script>

<template>
  <div ref="containerRef" class="services-list">
    <div class="container">
      <ul class="services-list__items">
        <li
          v-for="item in listData"
          :key="item.title"
          class="services-list__item"
        >
          <h3 class="services-list__item_title">{{ item.title }}</h3>
          <div class="services-list__item_divider">
            <span class="line" />
          </div>
          <div class="services-list__item_description">
            {{ item.description }}
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;
.services-list {
  padding: 50dvh 0 30dvh 0;
  &__video {
    width: calc((100% - 160px - 160px) * 0.4);
    aspect-ratio: 1;
    margin: auto;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      clip-path: circle(0% at 50% 50%);
    }
  }
  &__items {
    display: flex;
    flex-direction: column;
    gap: 423px;
  }
  &__item {
    display: flex;
    gap: getRem(24);
    &_title {
      font-family: 'RoobertMono';
      font-size: 1rem;
      font-style: normal;
      font-weight: 500;
      line-height: 100%;
      text-transform: uppercase;
      white-space: nowrap;
      margin-top: 0.4rem;
    }
    &_divider {
      flex-grow: 1;
      .line {
        display: block;
        height: 1px;
        background: rgba(217, 217, 217, 0.2);
        position: relative;
        will-change: width;
        mix-blend-mode: difference;
        margin-top: 0.9rem;
        &::before,
        &::after {
          content: '';
          position: absolute;
          width: 7px;
          height: 7px;
          background-color: $color-dots;
          border-radius: 50%;
        }
        &::before {
          top: -3px;
          left: -3px;
        }
        &::after {
          top: -3px;
          right: -4px;
        }
      }
    }
    &_description {
      font-size: 24px;
      font-style: normal;
      font-weight: 400;
      line-height: 30px; /* 125% */
      color: white(80);
      width: 380px;
    }
  }
}
</style>
