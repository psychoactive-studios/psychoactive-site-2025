<script setup>
import gsap from 'gsap';
import Hero from '~/components/about/Hero.vue';
import Metamorphosis from '~/components/about/Metamorphosis.vue';
import Team from '~/components/about/Team.vue';
import TextWithTitle from '~/components/about/TextWithTitle.vue';
import useScrollSmoother from '~/composables/useScrollSmoother';
const { enableScroll } = useScrollSmoother();

onMounted(() => {
  const layoutElements = gsap.utils.toArray([
    '#header-logo',
    '#header-navigation-button',
    '#header-sound-button',
  ]);
  setTimeout(() => {
    gsap.to(
      layoutElements,
      { scale: 1, opacity: 1, duration: 0.75, ease: 'power3.out' },
      '<+=1'
    );
    enableScroll();
  }, 100);
});
</script>

<template>
  <main class="about">
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
      <TextWithTitle title="THRIVE THROUGH COLLABORATION">
        A global network of designers, developers, creative thinkers, and
        strange creatures.
      </TextWithTitle>
    </section>

    <section class="about__team">
      <div class="container">
        <Team />
      </div>
    </section>
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
    :deep(.text-section) {
      .container {
        flex-direction: column;
        gap: getRem(24);
      }
      .text-section__content {
        width: 90%;
      }
      .text-block {
        font-size: 5vw;
        font-style: normal;
        font-weight: 400;
        line-height: 100%;
        letter-spacing: -0.056em;
      }
    }
  }
  &__team {
    margin-top: 160px;
  }
}
</style>
