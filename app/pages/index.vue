<script setup>
import { useMediaQuery } from '@vueuse/core';
import Hero from '~/components/homepage/Hero.vue';
import HeroMobile from '~/components/homepage/HeroMobile.vue';
import HomeAwards from '~/components/homepage/HomeAwards.vue';
import HomeNewsList from '~/components/homepage/HomeNewsList.vue';
import CaseStadyPreview from '~/components/ui/CaseStadyPreview.vue';
import OnScrollFilledText from '~/components/ui/OnScrollFilledText.vue';
import WebflowLabel from '~/components/ui/WebflowLabel.vue';
import { partnersData } from '~/data/partnersData';
import ScaleMobileText from '~/assets/img/scale.svg';
import { leaveAnimation } from '~/utils/animations/transitions';
import Footer from '~/components/layout/Footer.vue';
import useLoader from '~/composables/useLoader';
import useScrollSmoother from '~/composables/useScrollSmoother';
import useNavigation from '~/composables/useNavigation';
import gsap from 'gsap';

const { scrollSmoother } = useScrollSmoother();

const isMobile = useMediaQuery('(max-width: 768px)');
const { startLoading } = useLoader();
const { transitionFromNavigation } = useNavigation();

definePageMeta({
  scrollToTop: true,
  pageTransition: {
    css: false,
    mode: 'out-in',
    onEnter: (_, done) => {
      startLoading();
      scrollSmoother.value.scrollTop(0, false);
      done();
    },
    onLeave: (el, done) => {
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
  <main class="homepage">
    <ClientOnly>
      <!-- Hero Section -->
      <section class="hero">
        <Hero v-if="!isMobile" />
        <HeroMobile v-if="isMobile" />
      </section>

      <div class="homepage__content">
        <!-- Partners Section -->
        <section class="partners">
          <div class="container">
            <div class="list">
              <NuxtImg
                v-for="partner in partnersData"
                :key="partner.id"
                :src="partner.logo"
                :alt="partner.name"
                :class="partner.id"
              />
            </div>
          </div>
        </section>

        <!-- Mobile Digital Text Section -->
        <section v-if="isMobile" class="mobile-digital">
          <div class="container">
            <h2>Digital First design agency</h2>
            <a href="https://webflow.com/@Psychoactive-Studios" target="_blank">
              <WebflowLabel />
            </a>
          </div>
        </section>

        <!-- Cases Section First Part -->
        <section class="cases">
          <div class="container">
            <CaseStadyPreview
              src="/img/cases/case-super-ai.png"
              title="SuperAI Conference"
              description="Worlds largest AI event"
            />
            <CaseStadyPreview
              src="/img/cases/case-burgerfuel.png"
              title="Burgerfuel"
              description="New Zealand’s favourite burger"
            />
            <CaseStadyPreview
              src="/img/cases/case-hellboy.jpg"
              title="Hellboy Web of Wyrd"
              description="beat 'em up roguelike Video game"
            />
          </div>
        </section>

        <!-- Filled Text Section -->
        <section v-if="!isMobile" class="filled-text">
          <div class="container">
            <OnScrollFilledText>
              What sets us apart is our
              <img src="/img/text-icon-1.svg" alt="icon1" />
              <span class="dark">obsession</span> with the moment your audience
              first encounters your brand online. That split second where
              <img src="/img/text-icon-2.svg" alt="icon2" />
              <span class="dark">curiosity</span>
              transforms into
              <img src="/img/text-icon-3.svg" alt="icon3" />
              <span class="dark">connection</span>. We don't just build
              websites; we architect
              <img src="/img/text-icon-4.svg" alt="icon4" />
              <span class="dark">experiences</span> that linger in minds long
              after the screen goes dark.
            </OnScrollFilledText>
          </div>
        </section>

        <!-- Mobile Scale Text Section -->
        <section v-if="isMobile" class="mobile-scale">
          <div class="container">
            <div class="mobile-scale__imagine">Imagine</div>
            <div class="mobile-scale__scale">
              <ScaleMobileText />
              <div class="mobile-scale__scale-arrows">
                <span>&larr;</span><span>&rarr;</span>
              </div>
            </div>
            <div class="mobile-scale__innovate">Innovate</div>
          </div>
        </section>

        <!-- Cases Section Second Part Desktop -->
        <section v-if="!isMobile" class="cases">
          <div class="container">
            <CaseStadyPreview
              src="/img/cases/case-world-of-wearableArt.png"
              title="World of WearableArt"
              description="New Zealand's Largest theatrical Spectacle"
            />
            <CaseStadyPreview
              src="/img/cases/case-blackbird.png"
              title="Blackbird Ventures"
              description="Australasia's leading venture capital firm"
            />
            <CaseStadyPreview
              src="/img/cases/case-summer-game-fest.png"
              title="Summer Game Fest"
              description="The global stage for gaming reveals"
            />
            <CaseStadyPreview
              src="/img/cases/case-woolf-university.png"
              title="WOOLF University"
              description="Global access to accredited higher education"
            />
          </div>
        </section>

        <section v-if="isMobile" class="mobile-cases-second-part">
          <div class="container">
            <CaseStadyPreview
              src="/img/cases/case-world-of-wearableArt.png"
              title="World of WearableArt"
              description="New Zealand's Largest theatrical Spectacle"
            />
            <CaseStadyPreview
              src="/img/cases/case-blackbird.png"
              title="Blackbird Ventures"
              description="Australasia's leading venture capital firm"
            />
          </div>
          <div class="filled-text">
            <div class="container">
              <OnScrollFilledText>
                What sets us apart is our
                <img src="/img/text-icon-mobile-1.svg" alt="icon1" />
                <span class="dark">obsession</span> with the moment your
                audience first encounters your brand online. That split second
                where
                <img src="/img/text-icon-mobile-2.svg" alt="icon2" />
                <span class="dark">curiosity</span>
                transforms into
                <img src="/img/text-icon-mobile-3.svg" alt="icon3" />
                <span class="dark">connection</span>. We don't just build
                websites; we architect
                <img src="/img/text-icon-mobile-4.svg" alt="icon4" />
                <span class="dark">experiences</span> that linger in minds long
                after the screen goes dark.
              </OnScrollFilledText>
            </div>
          </div>
          <div class="container">
            <CaseStadyPreview
              src="/img/cases/case-summer-game-fest.png"
              title="Summer Game Fest"
              description="The global stage for gaming reveals"
            />
            <CaseStadyPreview
              src="/img/cases/case-woolf-university.png"
              title="WOOLF University"
              description="Global access to accredited higher education"
            />
          </div>
        </section>

        <!-- News Section -->
        <HomeNewsList />

        <!-- Awards Section -->
        <HomeAwards />
      </div>
    </ClientOnly>
    <Footer />
  </main>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/functions' as *;

.homepage {
  &__content {
    background-color: $color-background;
    position: relative;
    z-index: 1;
  }
}

.partners {
  position: relative;
  z-index: 1;
  background-color: $color-background;
  @include respond(mobile) {
    display: none;
  }
  .container {
    @include respond(mobile) {
      padding: 36px 0 0 0;
    }
  }
  .list {
    display: flex;
    justify-content: space-between;
    align-items: center;
    @include respond(mobile) {
      display: block;
    }
  }
  img {
    height: auto;
    object-fit: contain;
    margin: 0 20px;
    &:first-child {
      margin-left: 0;
    }
    &:last-child {
      margin-right: 0;
    }
    @include respond(mobile) {
      margin: 0 20px;
    }
  }
  .partner-super-ai {
    width: 6.5%;
  }
  .partner-adidas {
    width: 6.12%;
  }
  .partner-ray-white {
    width: 6.625%;
  }
  .partner-hellboy {
    width: 7.75%;
  }
  .partner-blackbird {
    width: 7.06%;
  }
  .partner-wow {
    width: 7.56%;
  }
  .partner-one {
    width: 7.75%;
  }
  .partner-all-blacks {
    width: 5.25%;
  }
  .partner-burgerfuel {
    width: 7%;
  }
  .partner-summer-game {
    width: 5.62%;
  }
}

.mobile-digital {
  padding-top: getRem(42);
  text-align: center;
  h2 {
    font-family: 'RoobertMono';
    font-size: getRem(14);
    font-style: normal;
    font-weight: 500;
    line-height: 146%;
    text-transform: uppercase;
    color: white(80);
    margin-bottom: getRem(22);
  }
  a {
    display: inline-block;
  }
}

.mobile-scale {
  margin-top: 120px;
  margin-bottom: 110px;
  &__imagine,
  &__innovate {
    font-size: max(36px, 9.6vw);
    font-style: normal;
    font-weight: 400;
    line-height: 88%;
    letter-spacing: min(-2.16px, -0.575vw);
    color: $color-grey;
  }
  &__innovate {
    text-align: right;
    margin-top: getRem(26);
  }
  &__scale {
    position: relative;
    svg {
      width: 100%;
      height: auto;
    }
    &-arrows {
      color: $color-grey;
      font-size: 14.67vw;
      line-height: 0.5;
      position: absolute;
      bottom: 100%;
      right: 0;
      letter-spacing: -1.5vw;
    }
  }
}

.cases {
  margin-top: 160px;
  @include respond(mobile) {
    margin-top: 60px;
  }
  .container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: 24px;
    row-gap: 80px;
    & > *:nth-child(3n + 1) {
      grid-column: 1 / 3;
    }
    @include respond(mobile) {
      display: flex;
      flex-direction: column;
      gap: 64px;
    }
  }
}

.mobile-cases-second-part {
  :deep(.case-study-preview) {
    margin-bottom: 64px;
  }
}

.filled-text {
  margin-top: 150px;
  @include respond(mobile) {
    margin-top: 120px;
    margin-bottom: 110px;
  }
}
</style>
