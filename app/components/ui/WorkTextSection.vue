<script setup>
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

defineProps({
  title: {
    type: String,
    required: true,
  },
});

let ctx;

const sectionRef = ref(null);
const titleRef = ref(null);
const textRef = ref(null);

onMounted(async () => {
  SplitText.create(titleRef.value, {
    type: 'words,chars',
    charsClass: 'char-center',
  });

  await nextTick();

  ctx = gsap.context(() => {
    const title = titleRef.value.querySelectorAll('.char-center');

    gsap
      .timeline({
        scrollTrigger: {
          trigger: sectionRef.value,
          start: 'top bottom',
          end: 'bottom bottom',
        },
      })
      .to(title, {
        duration: 2.3,
        scrambleText: {
          text: '{original}',
          chars: 'uppercase',
          tweenLength: false,
        },
      })
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
      )
      .fromTo(
        textRef.value,
        {
          backgroundPosition: '100% 0%',
        },
        {
          backgroundPosition: '0% 0%',
          duration: 2,
          ease: 'power3.inOut',
        },
        '<'
      );
  }, sectionRef.value);
});

onUnmounted(() => {
  if (ctx) ctx.revert();
});
</script>
<template>
  <div ref="sectionRef" class="section">
    <h2 ref="titleRef" class="section__title">{{ title }}</h2>
    <div class="section__description">
      <div ref="textRef" class="section__description_text">
        <slot />
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;
.section {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  @include respond(mobile) {
    grid-template-columns: 1fr;
    gap: 24px;
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
    min-width: 0;
    @include respond(mobile) {
      font-size: max(3.2vw, 12px);
      font-style: normal;
      font-weight: 500;
      line-height: 72%;
    }
  }
  &__description {
    font-size: max(1.666666vw, 22px);
    font-style: normal;
    font-weight: 400;
    line-height: 112.5%;
    min-width: 0;
    @include respond(mobile) {
      font-size: 4.27vw;
      font-style: normal;
      font-weight: 400;
      line-height: 140%;
    }
    &_text {
      background: linear-gradient(90deg, $color-background 50%, transparent 0%);
      background-size: 200% 100%;
      background-position: 100% 0%;
      background-repeat: no-repeat;
      background-clip: text;
      color: transparent;
      display: inline;
      &::before {
        content: '';
        display: inline-block;
        width: 4.8vw;
      }
    }
  }
}
</style>
