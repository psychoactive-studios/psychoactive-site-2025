<script setup>
import gsap from 'gsap';

const numbersRef = ref(null);

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const displayItems = ref([]);
let tl = null;

const initAnimation = () => {
  if (!numbersRef.value || !displayItems.value.length) return;

  // Kill previous timeline if exists
  if (tl) tl.kill();

  tl = gsap.timeline({
    scrollTrigger: {
      trigger: numbersRef.value,
      start: 'top 90%',
      end: 'bottom center',
    },
  });

  tl.from(
    '.work__numbers_list > li',
    {
      opacity: 0,
      duration: 1.5,
      stagger: 0.3,
    },
    'start'
  );

  displayItems.value.forEach((item, index) => {
    const position = index === 0 ? 'start' : 'start+=0.2';
    tl.from(
      item,
      {
        number: 0,
        duration: 1.5,
        ease: 'power1.out',
      },
      position
    );
  });

  tl.fromTo(
    '.work__numbers_title-text',
    { clipPath: 'inset(0 100% 0 0)' },
    {
      clipPath: 'inset(0 0% 0 0)',
      duration: 1,
      stagger: 0.1,
      ease: 'power2.in',
    },
    'start'
  ).fromTo(
    '.work__numbers_title-line .line',
    { width: '0%' },
    { width: '100%', duration: 1, stagger: 0.1, ease: 'power2.out' },
    'start+=0.8'
  );
};

watch(
  () => props.data,
  (newData) => {
    if (newData && newData.numberItem) {
      displayItems.value = newData.numberItem.map((item) => ({
        ...item,
        number: Number(item.number),
      }));

      nextTick(() => {
        initAnimation();
      });
    }
  },
  { immediate: true, deep: true }
);

onMounted(() => {
  initAnimation();
});

onUnmounted(() => {
  if (tl) tl.kill();
});
</script>

<template>
  <section ref="numbersRef" class="work__numbers">
    <div class="container">
      <ul class="work__numbers_list">
        <li v-for="item in displayItems" :key="item.id">
          <div class="work__numbers_number">
            {{ Math.floor(item.number).toLocaleString('en-US')
            }}{{ item.suffix }}
          </div>
          <div class="work__numbers_title">
            <div class="work__numbers_title-text">{{ item.title }}</div>
            <div class="work__numbers_title-line">
              <span class="line" />
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
.work__numbers {
  padding: 120px 0;
  @include respond(mobile) {
    padding: 60px 0;
    position: relative;
  }
  &_list {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    column-gap: 48px;
    row-gap: 12.5vw;
    @include respond(mobile) {
      margin-top: 60px;
      grid-template-columns: 1fr;
    }
    li {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  }
  &_number {
    font-size: max(6.25vw, 64px);
    font-style: normal;
    font-weight: 400;
    line-height: 100%;
    letter-spacing: -0.06em;
    @include respond(mobile) {
      font-size: 11.2vw;
      font-style: normal;
      font-weight: 400;
      line-height: 121%; /* 50.82px */
      letter-spacing: -0.22vw;
    }
  }
  &_title {
    margin-top: 24px;
    display: flex;
    gap: getRem(12);
    @include respond(mobile) {
      margin-top: 0;
    }
    &-text {
      font-family: 'RoobertMono';
      font-size: max(0.833333vw, 14px);
      font-style: normal;
      font-weight: 500;
      line-height: 100%; /* 16px */
      text-transform: uppercase;
    }
    &-line {
      flex-grow: 1;
      align-self: center;
      .line {
        display: block;
        height: 1px;
        background: rgba(0, 0, 0, 0.1);
        position: relative;
        will-change: width;
        &::before,
        &::after {
          content: '';
          position: absolute;
          width: 7px;
          height: 7px;
          background-color: rgba(0, 0, 0, 0.5);
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
  }
}
</style>
