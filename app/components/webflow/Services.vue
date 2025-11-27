<script setup>
import gsap from 'gsap';
import ServicesAccordion from '../ui/ServicesAccordion.vue';
import { SplitText } from 'gsap/SplitText';

const list = [
  {
    title: 'Webflow Design & Development',
    content:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Animi natus facilis quasi, eligendi autem beatae nemo consequatur magnam hic odit enim odio sed architecto maxime id.',
  },
  {
    title: 'Custom Code & Integrations',
    content:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Animi natus facilis quasi, eligendi autem beatae nemo consequatur magnam hic odit enim odio sed architecto maxime id.',
  },
  {
    title: 'Enterprise Solutions & Scalability',
    content:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Animi natus facilis quasi, eligendi autem beatae nemo consequatur magnam hic odit enim odio sed architecto maxime id.',
  },
  {
    title: 'SEO & AI Optimisation',
    content:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Animi natus facilis quasi, eligendi autem beatae nemo consequatur magnam hic odit enim odio sed architecto maxime id.',
  },
  {
    title: 'Maintenance & Partnership',
    content:
      'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Animi natus facilis quasi, eligendi autem beatae nemo consequatur magnam hic odit enim odio sed architecto maxime id.',
  },
];

const containerRef = ref(null);
const accordionRef = ref(null);
let ctx = null;

onMounted(async () => {
  SplitText.create(containerRef.value.querySelector('h2'), {
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
      .from(
        'h2 .char-center',
        {
          opacity: 0,
          duration: 0.01,
          stagger: {
            amount: 1,
            from: 'random',
          },
        },
        'firstPart'
      )
      .add(() => accordionRef.value.toggle(0), 'firstPart+=0.8');
  }, containerRef.value);
});

onUnmounted(() => {
  if (ctx) ctx.revert();
});
</script>

<template>
  <div ref="containerRef" class="our-services">
    <div class="our-services__accordion">
      <h2>OUR SERVICES</h2>
      <ServicesAccordion ref="accordionRef" :list="list" />
    </div>
    <div class="our-services__media">
      <NuxtImg
        src="/img/test-webflow-our-services.jpg"
        sizes="100vw md:50vw"
        alt="Our Services Image"
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
  gap: getRem(24);
  @include respond(mobile) {
    grid-template-columns: 1fr;
  }
  &__accordion {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    @include respond(mobile) {
      order: 2;
    }
    h2 {
      font-family: 'RoobertMono';
      font-size: clamp(12px, 0.8333vw, 16px);
      font-style: normal;
      font-weight: 500;
      line-height: 100%; /* 16px */
      text-transform: uppercase;
      color: white(50);
      margin-bottom: 1rem;
    }
  }
  &__media {
    aspect-ratio: 1.31;
    border-radius: getRem(10);
    overflow: hidden;
    background-color: $color-foreground;
    @include respond(mobile) {
      order: 1;
    }
    & > * {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}
</style>
