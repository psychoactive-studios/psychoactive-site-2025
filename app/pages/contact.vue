<script setup>
import gsap from 'gsap';
import ContactForm from '~/components/contact/ContactForm.vue';

import LetsTalkScene from '~/components/ui/LetsTalkScene.vue';
import useScrollSmoother from '~/composables/useScrollSmoother';
import useContact from '~/composables/useContact';

const { enableScroll } = useScrollSmoother();

const { sceneRef } = useContact();

onMounted(async () => {
  await nextTick();
  enableScroll();
  const layoutElements = gsap.utils.toArray([
    '#header-logo',
    '#header-navigation-button',
    '#header-sound-button',
  ]);

  gsap.to(layoutElements, {
    scale: 1,
    opacity: 1,
    duration: 0.75,
    ease: 'power3.out',
  });
});
</script>

<template>
  <main class="contact">
    <div class="container">
      <div class="contact__grid">
        <section class="contact__media">
          <LetsTalkScene
            ref="sceneRef"
            class="contact__media_scene"
            :auto-play="false"
            :svg-urls="[
              '/img/frog_steps/frog01.svg',
              '/img/frog_steps/frog02.svg',
              '/img/frog_steps/frog03.svg',
              '/img/frog_steps/frog04.svg',
              '/img/frog_steps/frog05.svg',
            ]"
          />
        </section>
        <section class="contact__conversation">
          <ContactForm :scene-ref="sceneRef" />
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
.contact {
  position: relative;
  &__grid {
    height: 100dvh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    & > * {
      min-width: 0;
      min-height: 0;
    }
  }
  &__media {
    padding-right: 48px;
    &_scene {
      aspect-ratio: 1;
    }
  }
  &__conversation {
    height: 100%;
    padding-top: 45dvh;
  }
}
</style>
