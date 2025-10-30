<script setup>
import { useMediaQuery } from '@vueuse/core';
import Hero from '~/components/homepage/Hero.vue';
import HeroMobile from '~/components/homepage/HeroMobile.vue';
import HomeNewsList from '~/components/homepage/HomeNewsList.vue';
import CaseStadyPreview from '~/components/ui/CaseStadyPreview.vue';
import OnScrollFilledText from '~/components/ui/OnScrollFilledText.vue';
import { partnersData } from '~/data/partnersData';

const isMobile = useMediaQuery('(max-width: 768px)');
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
              <Vue3Marquee
                v-if="isMobile"
                :duration="30"
                :pause-on-hover="true"
              >
                <NuxtImg
                  v-for="partner in partnersData"
                  :key="partner.id"
                  :src="partner.logo"
                  :alt="partner.name"
                  :class="partner.id"
                />
              </Vue3Marquee>
              <NuxtImg
                v-for="partner in partnersData"
                v-else
                :key="partner.id"
                :src="partner.logo"
                :alt="partner.name"
                :class="partner.id"
              />
            </div>
          </div>
        </section>

        <!-- Cases Section -->
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
        <section class="filled-text">
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

        <!-- Cases Section -->
        <section class="cases">
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

        <!-- News Section -->
        <HomeNewsList />
      </div>
    </ClientOnly>
  </main>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;

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
.cases {
  margin-top: 160px;
  .container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: 24px;
    row-gap: 80px;
    & > *:nth-child(3n + 1) {
      grid-column: 1 / 3;
    }
  }
}
.filled-text {
  margin-top: 150px;
}
</style>
