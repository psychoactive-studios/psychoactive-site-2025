<script setup>
import gsap from 'gsap';
import ContactForm from '~/components/contact/ContactForm.vue';

import LetsTalkScene from '~/components/ui/LetsTalkScene.vue';
import useScrollSmoother from '~/composables/useScrollSmoother';
import useContact from '~/composables/useContact';
import LinkWithHover from '~/components/ui/LinkWithHover.vue';
import Circle from '~/components/ui/Circle.vue';
import LetsTalkSceneGL from '~/components/ui/LetsTalkSceneGL.vue';

const { enableScroll, scrollSmoother } = useScrollSmoother();

const { sceneRef } = useContact();

onMounted(async () => {
  await nextTick();
  setTimeout(() => {
    enableScroll();
  }, 100);
});
</script>

<template>
  <main class="contact">
    <div class="container">
      <div class="contact__grid">
        <section class="contact__media">
          <div class="contact__media_circle-wrapper">
            <Circle class="circle" />
          </div>
          <LetsTalkSceneGL
            ref="sceneRef"
            class="contact__media_scene"
            :auto-play="false"
            :svg-urls="[
              '/img/contact/step_01.svg',
              '/img/contact/step_02.svg',
              '/img/contact/step_03.svg',
              '/img/contact/step_04.svg',
              '/img/contact/step_05.svg',
              '/img/contact/step_06.svg',
              '/img/contact/step_07.svg',
            ]"
            :scale="1"
          />          
        </section>
        <section class="contact__conversation">
          <ContactForm :scene-ref="sceneRef" />
        </section>
      </div>
      <div class="contact__footer">
        <div class="contact__footer_email">
          Or email the old fashioned way:
          <LinkWithHover href="mailto:hello@psychoactive.co.nz">
            hello@psychoactive.co.nz
          </LinkWithHover>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
.contact {
  position: relative;
  .container {
    display: flex;
    flex-direction: column;
    padding-left: 0;
    min-height: 100dvh;
  }
  &__grid {
    display: grid;
    grid-template-columns: 50vw 1fr;
    align-items: center;
    flex-grow: 1;
    padding-top: 96px;
    padding-bottom: 96px;
    & > * {
      min-width: 0;
      min-height: 0;
    }
  }
  &__media {
    margin: 0 48px;
    position: relative;
    &_circle-wrapper {
      position: absolute;
      width: 100%;
      overflow: hidden;
      max-width: 80vh;
      .circle {
        animation: rotate 90s linear infinite;
      }
    }
    &_scene {
      aspect-ratio: 1;
      padding: min(5.89vw, 120px);
      overflow: hidden;
      max-width: 80vh;
    }
  }
  &__conversation {
    height: 100%;
    padding-top: calc(45dvh - 96px - 48px);
  }
  &__footer {
    display: flex;
    justify-content: center;
    position: absolute;
    width: 100%;
    bottom: 48px;
    &_email {
      font-size: 1.5rem;
      line-height: 1.16;
      color: rgba(255, 255, 255, 0.5);
      a {
        color: white;
        display: inline-block;
      }
    }
  }
}
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
