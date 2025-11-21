<script setup>
import gsap from 'gsap';
import Footer from '~/components/layout/Footer.vue';
import OnScrollFilledText from '~/components/ui/OnScrollFilledText.vue';
import PartnersDesktop from '~/components/ui/PartnersDesktop.vue';
import VideoPreview from '~/components/ui/VideoPreview.vue';
import CasesSwiper from '~/components/webflow/CasesSwiper.vue';
import ClientsSaySwiper from '~/components/webflow/ClientsSaySwiper.vue';
import Hero from '~/components/webflow/Hero.vue';
import Statistics from '~/components/webflow/Statistics.vue';
import Timeline from '~/components/webflow/Timeline.vue';
import useScrollSmoother from '~/composables/useScrollSmoother';

const { enableScroll } = useScrollSmoother();

onMounted(() => {
  const layoutElements = gsap.utils.toArray([
    '#header-logo',
    '#header-navigation-button',
    '#header-sound-button',
  ]);
  setTimeout(() => {
    gsap.set(layoutElements, { scale: 1 });
    enableScroll();
  }, 100);
});
</script>

<template>
  <main class="webflow">
    <Hero />
    <div class="container">
      <section class="webflow__onscroll-text">
        <OnScrollFilledText>
          <p>
            Webflow development <span class="dark">for</span> innovative brands.
          </p>
          <p>
            Custom code <span class="dark">and</span> enterprise-grade builds,
            <span class="dark">crafted for</span>
            performance, scalability <span class="dark">and</span> visibility
            <span class="dark">in an AI-driven world</span>.
          </p>
        </OnScrollFilledText>
      </section>
      <section class="webflow__video-reels">
        <VideoPreview
          preview="/video/preview_reel.mp4"
          src="https://vjs.zencdn.net/v/oceans.mp4"
          aspect-ratio="2.22"
        />
      </section>
      <section class="webflow__timeline">
        <Timeline />
      </section>
      <section class="webflow__partners">
        <PartnersDesktop />
      </section>

      <section class="webflow__cases">
        <CasesSwiper />
      </section>

      <section class="webflow__statistics">
        <Statistics />
      </section>

      <section class="webflow__clients-say">
        <ClientsSaySwiper />
      </section>
    </div>
    <Footer />
  </main>
</template>

<style scoped lang="scss">
.webflow {
  &__onscroll-text {
    max-width: 56vw;
    margin: 0 auto 120px auto;
    text-align: center;
  }
  &__timeline {
  }
  &__partners {
  }
  &__cases {
    margin-top: 160px;
  }
  &__statistics {
    margin-top: 160px;
  }
  &__clients-say {
    margin-top: 160px;
  }
}
</style>
