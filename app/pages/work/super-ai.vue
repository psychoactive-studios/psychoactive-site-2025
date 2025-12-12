<script setup>
import gsap from 'gsap';
import Brief from '~/components/layout/Brief.vue';
import LinkButton from '~/components/ui/LinkButton.vue';
import WorkTextSection from '~/components/ui/WorkTextSection.vue';
import useScrollSmoother from '~/composables/useScrollSmoother';

const { enableScroll } = useScrollSmoother();

let ctx;

onMounted(async () => {
  ctx = gsap.context(() => {});

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
  await nextTick();
  scrollProgressInit();
});

onUnmounted(() => {
  ctx.revert();
});

function scrollProgressInit() {
  ctx.add(() => {
    gsap.to('#work-scroll-progress', {
      '--work-scroll-progress': 100,
      scrollTrigger: {
        scrub: true,
        start: 'top top',
        end: 'bottom top',
        markers: true,
        invalidateOnRefresh: true,
      },
    });
  });
  // #work-scroll-progress
}
</script>
<template>
  <main class="work super-ai">
    <!-- Illustration section -->
    <section class="work__illustration">
      <NuxtImg
        src="/img/work/hero-super-ai.jpg"
        sizes="sm:768px md:1200px xl:100vw"
        preload
        quality="90"
      />
    </section>

    <!-- Hero section -->
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

    <!-- Numbers section -->
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

    <!-- Image 1 section -->
    <section class="super-ai__image-1">
      <NuxtImg
        src="/img/work/super-ai-1-1.jpg"
        sizes="sm:768px md:1200px xl:100vw"
        preload
        quality="90"
        class="img-1"
      />
      <div class="container">
        <NuxtImg
          src="/img/work/super-ai-1-2.jpg"
          sizes="sm:768px md:1200px xl:1920px"
          preload
          quality="90"
          class="img-2"
        />
      </div>
    </section>

    <!-- Text section -->
    <section class="super-ai__text-section">
      <div class="container">
        <WorkTextSection title="Scaling for a Global Audience">
          In only its second year, SuperAI required a platform that could match
          the scale and ambition of a world-stage event. The existing site
          wasn’t built to handle the demands of constant updates for tickets,
          speakers, sponsors, and agenda. With no fully developed brand in
          place, we created identity and platform in parallel — ensuring the
          site was ready to support growth and deliver a seamless experience for
          a global audience.
        </WorkTextSection>
      </div>
    </section>

    <!-- Image 2 section -->
    <section class="work__full-image">
      <NuxtImg
        src="/img/work/super-ai-2.jpg"
        sizes="sm:768px md:1200px xl:100vw"
        preload
        quality="90"
      />
    </section>

    <!-- Text section -->
    <section class="super-ai__text-section">
      <div class="container">
        <WorkTextSection title="Designing for Simplicity and Energy">
          Focused on scalability and simplicity, inspired by timeless modern
          design: we studied Stripe and Apple websites across the last decade
          when creating our design systems. The homepage led with essential
          event info, anchored by a dynamic video — refreshed throughout the
          event cycle to keep momentum high before, during, and after the
          conference.
        </WorkTextSection>
      </div>
    </section>

    <!-- Image 3 section -->
    <section class="work__full-image">
      <NuxtImg
        src="/img/work/super-ai-3.jpg"
        sizes="sm:768px md:1200px xl:100vw"
        preload
        quality="90"
      />
    </section>

    <!-- Text section -->
    <section class="super-ai__text-section">
      <div class="container">
        <WorkTextSection title="Automating Content and Saving Time">
          We migrated SuperAI from Wix to Webflow, building a robust information
          management system to centralize speakers, agenda, partners, and
          sponsors. Integrations with Airtable, Zapier, Finsweet CMS Bridge, and
          Mapbox automated updates across the site, saving time and resources.
          Heavy media was hosted on DigitalOcean for maximum performance.
        </WorkTextSection>
      </div>
    </section>

    <!-- Image 4 section -->
    <section class="work__full-image">
      <NuxtImg
        src="/img/work/super-ai-4.jpg"
        sizes="sm:768px md:1200px xl:100vw"
        preload
        quality="90"
      />
    </section>

    <!-- Text section -->
    <section class="super-ai__text-section">
      <div class="container">
        <WorkTextSection title="Powering a Sell-Out Event">
          The site became the central hub for ticketing, speaker announcements,
          the world’s largest AI startup competition, the NEXT Hackathon, and
          Singapore AI Week — spanning 100+ satellite events across the city.
          This hub played a pivotal role in delivering a sold-out conference,
          and cemented SuperAI as Asia’s largest AI event.
        </WorkTextSection>
      </div>
    </section>

    <!-- Image 5 section -->
    <section class="work__full-image">
      <div class="container">
        <NuxtImg
          src="/img/work/super-ai-5.jpg"
          sizes="sm:768px md:1200px xl:100vw"
          preload
          quality="90"
        />
      </div>
    </section>

    <!-- Image 6 section -->
    <section class="work__full-image mt-240">
      <NuxtImg
        src="/img/work/super-ai-6.jpg"
        sizes="sm:768px md:1200px xl:100vw"
        preload
        quality="90"
      />
    </section>

    <!-- Feedback section -->
    <div class="container">
      <section class="super-ai__feedback">
        <div class="super-ai__feedback_photo">
          <img src="/img/test-client-2.jpg" alt="Peter Noszek" />
        </div>
        <div class="super-ai__feedback_content">
          <blockquote>
            "Psychoactive played a crucial role in making SuperAI a success.
            We're so proud of what we've built together, and the feedback from
            our attendees has been unanimously positive."
          </blockquote>
          <div class="super-ai__feedback_author">
            <span class="super-ai__feedback_author-name">Peter Noszek</span>
            <span class="super-ai__feedback_author-company">SuperAI</span>
          </div>
        </div>
      </section>
    </div>

    <!-- Image 7 section -->
    <section class="work__full-image mt-240">
      <NuxtImg
        src="/img/work/super-ai-7.jpg"
        sizes="sm:768px md:1200px xl:100vw"
        preload
        quality="90"
      />
    </section>

    <section class="super-ai__stage">
      <NuxtImg
        src="/img/work/super-ai-8-1.jpg"
        sizes="sm:768px md:1200px xl:100vw"
        preload
        quality="90"
      />
      <NuxtImg
        src="/img/work/super-ai-8-2.jpg"
        sizes="sm:768px md:1200px xl:100vw"
        preload
        quality="90"
        class="super-ai__stage-image-2"
      />
      <NuxtImg
        src="/img/work/super-ai-8-3.jpg"
        sizes="sm:768px md:1200px xl:100vw"
        preload
        quality="90"
        class="super-ai__stage-image-3"
      />
    </section>

    <!-- Text section -->
    <section class="super-ai__text-section">
      <div class="container">
        <WorkTextSection title="An Ongoing Partnership">
          Post-launch, we continue to evolve — expanding features, scaling
          performance, and aligning closely with SuperAI’s growing brand. The
          platform is built to evolve with each event cycle and scale alongside
          SuperAI’s innovation.
        </WorkTextSection>
      </div>
    </section>

    <!-- Image 9 section -->
    <section class="work__full-image">
      <NuxtImg
        src="/img/work/super-ai-9.jpg"
        sizes="sm:768px md:1200px xl:100vw"
        preload
        quality="90"
      />
    </section>

    <!-- CTA section -->
    <section class="work__cta">
      <div class="container">
        <h2 class="work__cta_title">
          The platform is built to evolve with each event cycle and scale
          alongside SuperAI’s innovation.
        </h2>
        <div class="work__cta_navigation">
          <div class="work__cta_line">
            <span class="line" />
          </div>
          <LinkButton href="/contact" mode="dark" class="work__cta_button">
            Launch Website
          </LinkButton>
          <div class="work__cta_line">
            <span class="line" />
          </div>
        </div>
      </div>
    </section>

    <footer class="work__footer">
      <div class="work__footer_brief">
        <Brief />
      </div>
      <div class="work__footer_scroll">
        <div class="container">
          <h2 ref="footerScrollTextRef">Scroll to go back to work page</h2>
        </div>
      </div>
    </footer>
  </main>
</template>
<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;
.super-ai {
  .mt-240 {
    margin-top: 240px;
  }
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
  &__image-1 {
    @include flex-center;
    aspect-ratio: 1.547;
    position: relative;
    .img-1 {
      position: absolute;
      inset: 0;
    }
    .img-2 {
      position: relative;
    }
  }
  &__text-section {
    padding: 240px 0;
  }
  &__image-2 {
    aspect-ratio: 16 / 9;
    position: relative;
    isolation: isolate;
    color: $color-foreground;
    display: flex;
    align-items: flex-end;
    .img {
      position: absolute;
      inset: 0;
      z-index: -2;
    }
    &::before {
      content: '';
      display: block;
      height: 50%;
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(180deg, rgba(63, 40, 48, 0) 0%, #3f2830 100%);
      z-index: -1;
    }
    &_grid {
      padding-bottom: 48px;
    }
    &_title {
      width: 40%;
    }
  }
  &__feedback {
    padding-top: 160px;
    margin-bottom: -80px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 120px;
    &_photo {
      width: 32.5%;
      flex-shrink: 0;
      img {
        border-radius: 1rem;
      }
    }
    &_content {
      width: 50%;
      blockquote {
        font-size: 2.085vw;
        font-style: normal;
        font-weight: 400;
        line-height: 110%; /* 110% */
        letter-spacing: -0.05em;
      }
    }
    &_author {
      margin-top: 90px;
      &-name {
        font-size: clamp(18px, 1.05vw, 24px);
        font-style: normal;
        font-weight: 500;
        line-height: 120%;
        display: block;
        margin-bottom: 0.63vw;
      }
      &-company {
        font-family: 'RoobertMono';
        font-size: clamp(12px, 0.73vw, 16px);
        font-style: normal;
        font-weight: 500;
        line-height: 120%;
        text-transform: uppercase;
        display: block;
      }
    }
  }
  &__stage {
    margin-top: 240px;
    margin-bottom: 120px;
    position: relative;
    &-image-2 {
      position: absolute;
      top: 1%;
      left: 20%;
      width: 20%;
    }
    &-image-3 {
      position: absolute;
      top: 34%;
      right: 20%;
      width: 20%;
    }
  }
}
</style>
