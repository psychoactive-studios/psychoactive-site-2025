<script setup>
import gsap from 'gsap';
import OnScrollFilledText from '../ui/OnScrollFilledText.vue';
import { SplitText } from 'gsap/SplitText';

let ctx;
const containerRef = ref(null);

defineProps({
  title: {
    type: String,
    required: true,
  },
});

onMounted(async () => {
  SplitText.create(
    gsap.utils.toArray(
      containerRef.value.querySelector('.text-section__title')
    ),
    {
      type: 'words,chars',
      charsClass: 'char-center',
    }
  );
  await nextTick();

  const title = containerRef.value.querySelectorAll(
    '.text-section__title .char-center'
  );

  ctx = gsap.context(() => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: containerRef.value,
          start: 'top bottom',
          markers: true,
        },
      })
      .to(
        title,
        {
          duration: 2.3,
          scrambleText: {
            text: '{original}',
            chars: 'uppercase',
            tweenLength: false,
          },
        },
        '<+=0.2'
      )
      .from(
        title,
        {
          opacity: 0,
          duration: 0.01,
          stagger: {
            amount: 0.9,
            from: 'random',
          },
        },
        '<'
      );
  }, containerRef.value);
});

onUnmounted(() => {
  ctx.revert();
});
</script>

<template>
  <section ref="containerRef" class="text-section">
    <div class="container">
      <h2 class="text-section__title">{{ title }}</h2>
      <div class="text-section__content">
        <OnScrollFilledText>
          <slot />
        </OnScrollFilledText>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
.text-section {
  .container {
    display: flex;
    justify-content: space-between;
    gap: getRem(48);
  }
  &__title {
    font-family: 'RoobertMono';
    font-size: clamp(0.75rem, 1.333vw, 1rem);
    font-style: normal;
    font-weight: 500;
    line-height: 100%;
    text-transform: uppercase;
    white-space: nowrap;
    margin-top: 0.4rem;
    color: white(50);
  }
  &__content {
    width: 72.5%;
    :deep(p) {
      &::before {
        content: '';
        display: inline-block;
        width: 7vw;
      }
      margin-bottom: 1.2em;
      &:last-child {
        &::before {
          display: none;
        }
        margin-bottom: 0;
      }
    }
  }
}
</style>
