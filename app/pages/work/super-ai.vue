<script setup>
import gsap from 'gsap';
import LinkButton from '~/components/ui/LinkButton.vue';
import WorkScrollProgressCircle from '~/components/ui/WorkScrollProgressCircle.vue';
import useScrollSmoother from '~/composables/useScrollSmoother';

const { enableScroll } = useScrollSmoother();

onMounted(() => {
  setTimeout(() => {
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
    enableScroll();
  }, 200);
});
</script>
<template>
  <main class="work super-ai">
    <section class="work__illustration">
      <NuxtImg
        src="/img/work/hero-super-ai.jpg"
        sizes="sm:768px md:1200px xl:100vw"
        preload
        quality="90"
      />
      <WorkScrollProgressCircle />
    </section>
    <section class="work__hero">
      <div class="container">
        <h1 class="work__hero_title">SuperAI Conference</h1>
        <div class="work__hero_sub-title">The World’s Largest AI Event</div>
        <ul class="work__hero_info">
          <li>
            <span>WHAT WE DID:</span> Strategy, Design, Development,
            Integrations
          </li>
          <li><span>CLIENT:</span> SUPERAI</li>
        </ul>
        <div class="work__hero_link">
          <LinkButton href="https://superai.com" mode="dark">
            launch website
          </LinkButton>
        </div>
        <div class="work__hero_description">
          <p>
            SuperAI is the world’s largest AI event, held annually at Marina Bay
            Sands in Singapore. It’s where East meets West — where AI meets the
            world — uniting leading innovators, investors, scientists, and
            policymakers.
          </p>
          <p>
            Psychoactive partnered with SuperAI more than six months ahead of
            the 2025 conference and continue to work with them in an ongoing
            partnership. Our role: reimagine their digital presence, streamline
            event management, and deliver a Webflow platform built to scale.
          </p>
        </div>
      </div>
    </section>

    <section class="super-ai__numbers">
      <div class="container">
        <ul class="super-ai__numbers_list">
          <li>
            <div class="super-ai__numbers_number">7,000+</div>
            <div class="super-ai__numbers_title">
              <div class="super-ai__numbers_title-text">attendees</div>
              <div class="super-ai__numbers_title-line">
                <span class="line" />
              </div>
            </div>
          </li>
          <li>
            <div class="super-ai__numbers_number">1,000+</div>
            <div class="super-ai__numbers_title">
              <div class="super-ai__numbers_title-text">Companies</div>
              <div class="super-ai__numbers_title-line">
                <span class="line" />
              </div>
            </div>
          </li>
          <li>
            <div class="super-ai__numbers_number">100+</div>
            <div class="super-ai__numbers_title">
              <div class="super-ai__numbers_title-text">
                countries represented
              </div>
              <div class="super-ai__numbers_title-line">
                <span class="line" />
              </div>
            </div>
          </li>
          <li>
            <div class="super-ai__numbers_number">826k+</div>
            <div class="super-ai__numbers_title">
              <div class="super-ai__numbers_title-text">
                unique website views
              </div>
              <div class="super-ai__numbers_title-line">
                <span class="line" />
              </div>
            </div>
          </li>
          <li>
            <div class="super-ai__numbers_number">230k+</div>
            <div class="super-ai__numbers_title">
              <div class="super-ai__numbers_title-text">Google searches</div>
              <div class="super-ai__numbers_title-line">
                <span class="line" />
              </div>
            </div>
          </li>
          <li>
            <div class="super-ai__numbers_number">1,200+</div>
            <div class="super-ai__numbers_title">
              <div class="super-ai__numbers_title-text">media stories</div>
              <div class="super-ai__numbers_title-line">
                <span class="line" />
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>
  </main>
</template>
<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
.super-ai {
  &__numbers {
    margin-top: 120px;
    padding-bottom: 240px;
    &_list {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      column-gap: 48px;
      row-gap: 240px;
      li {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
    }
    &_number {
      font-size: max(6.25vw, 64px);
      font-style: normal;
      font-weight: 400;
      line-height: 100%;
      letter-spacing: -0.06em;
    }
    &_title {
      margin-top: 24px;
      display: flex;
      gap: getRem(24);
      &-text {
        font-family: 'RoobertMono';
        font-size: max(0.833333vw, 14px);
        font-style: normal;
        font-weight: 500;
        line-height: 100%; /* 16px */
        text-transform: uppercase;
      }
      &-line {
        flex-grow: 1;
        align-self: center;
        .line {
          display: block;
          height: 1px;
          background: rgba(0, 0, 0, 0.1);
          margin-top: 0.5vw;
          position: relative;
          will-change: width;
          &::before,
          &::after {
            content: '';
            position: absolute;
            width: 7px;
            height: 7px;
            background-color: rgba(0, 0, 0, 0.5);
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
  }
}
</style>
