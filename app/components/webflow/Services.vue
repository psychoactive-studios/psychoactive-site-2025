<script setup>
import gsap from 'gsap';
import ServicesAccordion from '../ui/ServicesAccordion.vue';
import { SplitText } from 'gsap/SplitText';
import LetsTalkScene from '../ui/LetsTalkScene.vue';
import LetsTalkSceneGL from '../ui/LetsTalkSceneGL.vue';

defineProps({
  data: {
    type: Array,
    required: true,
  },
});

const containerRef = ref(null);
const accordionRef = ref(null);
const sceneRef = ref(null);
let ctx = null;

onMounted(async () => {
  const { chars } = SplitText.create(containerRef.value.querySelector('h2'), {
    type: 'words,chars',
    charsClass: 'char-center',
  });
  await nextTick();
  ctx = gsap.context(() => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: containerRef.value,
          start: 'top center',
          end: 'bottom center',
          invalidateOnRefresh: true,
        },
      })
      .to(
        'h2 .char-center',
        {
          duration: 3,
          scrambleText: {
            text: '{original}',
            chars: '0123456789!@#$%^&*()-_=+[]{};:<>/?,.',
            tweenLength: false,
          },
        },
        'firstPart'
      )
      .to(
        chars,
        {
          opacity: 1,
          duration: 0.01,
          stagger: {
            amount: 1,
            from: 'random',
          },
        },
        'firstPart'
      )
      .add(() => {
        accordionRef.value.toggle(0);
      }, 'firstPart+=0.8');
  }, containerRef.value);
});

onUnmounted(() => {
  if (ctx) ctx.revert();
});

const handleToggle = (index) => {
  sceneRef.value.nextShape(index);
};
</script>

<template>
  <div ref="containerRef" class="our-services">
    <div class="our-services__accordion">
      <h2 class="subheader--mobile">Full-service Webflow expertise</h2>
      <ServicesAccordion
        ref="accordionRef"
        :list="data"
        :prevent-closing-all="true"
        @toggle="handleToggle"
      />
    </div>
    <div class="our-services__media">
      <!-- <img src="/img/test-webflow-our-services.jpg" alt="Our Services Image" /> -->
      <LetsTalkSceneGL
        ref="sceneRef"
        class="our-services__media_scene"
        :auto-play="false"
        :svg-urls="[
          '/img/webflow/icon_01.svg',
          '/img/webflow/icon_02.svg',
          '/img/webflow/icon_03.svg',
          '/img/webflow/icon_04.svg',
          '/img/webflow/icon_05.svg',
        ]"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;

.our-services {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: getRem(24);
  width: 100%;
  @include respond(mobile) {
    grid-template-columns: 1fr;
  }
  &__accordion {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-right: 15%;
    @include respond(mobile) {
      order: 2;
    }
    h2 {
      color: white(50);
      margin-bottom: 1rem;
      :deep(.char-center) {
        opacity: 0;
      }
    }
  }
  &__media {
    aspect-ratio: 1;
    // border-radius: getRem(10);
    // overflow: hidden;
    // background-color: $color-foreground;
    min-width: 0;
    width: 100%;
    @include respond(mobile) {
      order: 1;
    }
    // & > * {
    //   width: 100%;
    //   height: 100%;
    //   object-fit: contain;
    // }
  }
}
</style>
