<script setup>
import gsap from 'gsap';
import ContactForm from '~/components/contact/ContactForm.vue';

import LetsTalkScene from '~/components/ui/LetsTalkScene.vue';
import useScrollSmoother from '~/composables/useScrollSmoother';
import useContact from '~/composables/useContact';
import LinkWithHover from '~/components/ui/LinkWithHover.vue';
import Circle from '~/components/ui/Circle.vue';

const { enableScroll } = useScrollSmoother();

const { sceneRef } = useContact();

onMounted(async () => {
  await nextTick();
  enableScroll();
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
    height: 100dvh;
    display: flex;
    flex-direction: column;
    padding-left: 0;
  }
  &__grid {
    display: grid;
    grid-template-columns: 50vw 1fr;
    align-items: center;
    flex-grow: 1;
    padding-top: 96px;
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
      .circle {
        animation: rotate 90s linear infinite;
      }
    }
    &_scene {
      aspect-ratio: 1;
      padding: min(5.89vw, 120px);
      overflow: hidden;
    }
  }
  &__conversation {
    height: 100%;
    padding-top: calc(45dvh - 96px - 48px);
  }
  &__footer {
    padding-bottom: 48px;
    display: flex;
    justify-content: center;
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
