<script setup>
import gsap from 'gsap';
import Ethos from '~/components/about/Ethos.vue';
import Hero from '~/components/about/Hero.vue';
import Metamorphosis from '~/components/about/Metamorphosis.vue';
import OurStory from '~/components/about/OurStory.vue';
import Team from '~/components/about/Team.vue';
import TextWithTitle from '~/components/about/TextWithTitle.vue';
import Footer from '~/components/layout/Footer.vue';

import { aboutPageInitAnimation } from '~/utils/animations/about';

const containerRef = ref(null);
let ctx = null;

onMounted(() => {
  ctx = gsap.context(() => {}, containerRef.value);
  aboutPageInitAnimation(ctx, containerRef.value);
});

onUnmounted(() => {
  if (ctx) ctx.revert();
});
</script>

<template>
  <main ref="containerRef" class="about">
    <Hero />
    <section class="about__amphibious">
      <TextWithTitle title="BORN AMPHIBIOUS">
        <p>
          Psychoactive is a global design agency shaping digital experiences for
          ambitious brands. We create immersive, scalable websites that push the
          boundaries of design and technology. Our remote-first team spans time
          zones, with our primary studio based in Wellington, New Zealand.
        </p>
        <p>
          Just as frogs breathe both water & air, we breathe design and
          innovation. We’re constantly hatching fresh and beautifully intuitive
          ways to stimulate the Metamorphosis of projects & brands.
        </p>
      </TextWithTitle>
    </section>
    <section class="about__metamorphosis">
      <div class="container">
        <Metamorphosis />
      </div>
    </section>

    <section class="about__collaboration">
      <div class="container">
        <div class="about__collaboration_title">
          <h2>THRIVE THROUGH COLLABORATION</h2>
          <div class="title-line">
            <span class="line" />
          </div>
        </div>
        <div class="about__collaboration_text">
          A global network of designers, developers, creative thinkers, and
          strange creatures.
        </div>
      </div>
    </section>

    <section class="about__team">
      <div class="container">
        <Team />
      </div>
    </section>

    <section class="about__story">
      <div class="container">
        <OurStory />
      </div>
    </section>

    <section class="about__ethos">
      <Ethos />
    </section>
    <Footer />
  </main>
</template>
<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
.about {
  &__amphibious {
    @include flex-center;
    min-height: 100vh;
  }
  &__metamorphosis {
  }
  &__collaboration {
    margin-top: 240px;
    &_title {
      margin-bottom: getRem(24);
      display: flex;
      align-items: center;
      gap: getRem(48);
      h2 {
        font-family: 'RoobertMono';
        font-size: clamp(0.75rem, 1.333vw, 1rem);
        font-style: normal;
        font-weight: 500;
        line-height: 100%;
        text-transform: uppercase;
        white-space: nowrap;
        color: white(50);
      }
      .title-line {
        flex-grow: 1;
        .line {
          display: block;
          width: 100%;
          height: 1px;
          background: white(10);
          position: relative;
          will-change: width;
          &::before,
          &::after {
            content: '';
            position: absolute;
            width: 7px;
            height: 7px;
            background-color: white(50);
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

    &_text {
      display: inline;
      font-size: 5vw;
      font-style: normal;
      font-weight: 400;
      line-height: 100%;
      letter-spacing: -0.056em;
      background: linear-gradient(to right, white 50%, transparent 50%);
      background-size: 200% 100%;
      background-position-x: 50%;
      background-position-y: center;
      color: transparent;
      background-clip: text;
    }
  }
  &__team {
    margin-top: 160px;
  }
  &__story {
    margin-top: 240px;
  }
  &__ethos {
    padding-bottom: 240px;
  }
}
</style>
