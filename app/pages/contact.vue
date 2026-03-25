<script setup>
import gsap from 'gsap';
import ContactForm from '~/components/contact/ContactForm.vue';

import LetsTalkScene from '~/components/ui/LetsTalkScene.vue';
import useScrollSmoother from '~/composables/useScrollSmoother';
import useContact from '~/composables/useContact';
import LinkWithHover from '~/components/ui/LinkWithHover.vue';
import Circle from '~/components/ui/Circle.vue';
import LetsTalkSceneGL from '~/components/ui/LetsTalkSceneGL.vue';
import useLoader from '~/composables/useLoader';
import useNavigation from '~/composables/useNavigation';
import { leaveAnimation } from '~/utils/animations/transitions';


const { enableScroll } = useScrollSmoother();

const { sceneRef, resetContactState } = useContact();

const { startLoading } = useLoader();
const { scrollSmoother } = useScrollSmoother();

onMounted(async () => {
  await nextTick();
  setTimeout(() => {
    enableScroll();
  }, 100);
});

onUnmounted(() => {
  resetContactState();
});


definePageMeta({
  scrollToTop: true,
  pageTransition: {
    css: false,
    mode: 'out-in',
    onEnter: (_, done) => {
      startLoading();
      scrollSmoother.value.scrollTo(0, {
        immediate: true,
        lock: true,
        force: true,
      });
      done();
    },
    onLeave: (el, done) => {
      const { transitionFromNavigation } = useNavigation();
      if (transitionFromNavigation.value) {
        gsap
          .timeline()
          .set(el, { opacity: 0 })
          .add(() => {
            transitionFromNavigation.value = false;
            done();
          }, '+=1');
        return;
      }
      leaveAnimation(el, done);
    },
  },
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
              '/img/contact/step_00.svg',
              '/img/contact/step_01.svg',
              '/img/contact/step_02.svg',
              '/img/contact/step_03.svg',
              '/img/contact/step_04.svg',
              '/img/contact/step_05.svg',
              '/img/contact/step_06.svg',
              '/img/contact/step_07.svg',
            ]"
            :scale="1.2"
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
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/breakpoints' as *;
.contact {
  // position: relative;
  // @include respond(laptop-small) {
  //   position: initial;
  // }
  max-height: 100svh;
  .container {
    display: flex;
    flex-direction: column;
    padding-left: 0;
    min-height: 100svh;
    @include respond(laptop-small) {
      padding-left: 160px;      
      @include respond(portrait) {
        padding-left: 48px;        
      }
    }
    @include respond(mobile) {
      padding-left: 1rem;      
    }
  }
  &__grid {
    display: grid;
    grid-template-columns: 50vw 1fr;
    align-items: center;
    flex-grow: 1;
    padding-top: 96px;
    padding-bottom: 96px;
    @include respond(laptop-small) {
      display: flex;
      flex-direction: column;
      padding-top: 30vh;
      padding-bottom: 48px;
    }
    & > * {
      min-width: 0;
      min-height: 0;
    }
  }
  &__media {
    margin: 0 48px;
    position: relative;    
    @include respond(laptop-small) {
      display: none;
      width: auto;
      height: 40vh;
    }
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
    @include respond(laptop-small) {
      padding-top: 24px;
      width: 100%;
    }
  }
  &__footer {
    display: flex;
    justify-content: center;
    position: absolute;
    width: 100%;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 80px 48px 48px 48px;
    background: linear-gradient(180deg, rgba(16, 16, 18, 0.00) 5.93%, rgba(16, 16, 18, 0.90) 40.46%);
    z-index: 1;
    pointer-events: none;
    // @include respond(laptop-small) {
    //   left: 48px;
    //   right: 48px;
    //   width: auto;
    // }
    @include respond(mobile) {
      padding: 66px 16px 86px 16px;
    }
    &_email {
      font-size: 1.5rem;
      line-height: 1.16;
      color: rgba(255, 255, 255, 0.5);
      pointer-events: all;
      @include respond(laptop-small) {
        font-size: 1rem;
      }
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
