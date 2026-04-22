<script setup>
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

let ctx;

const containerRef = ref(null);

const data = ref({
  founded: 2018,
  recognitions: 50,
});

onMounted(async () => {
  SplitText.create(
    gsap.utils.toArray([
      containerRef.value.querySelector('.our-story__title h2'),
    ]),
    {
      type: 'words,chars',
      charsClass: 'char-center',
    }
  );

  await nextTick();

  setTimeout(() => {
    ctx = gsap.context(() => {
      const title = gsap.utils.toArray(
        containerRef.value.querySelectorAll('.our-story__title h2 .char-center')
      );
      gsap
        .timeline({
          scrollTrigger: {
            trigger: containerRef.value,
            start: 'top bottom',
          },
        })
        .to(
          title,
          {
            duration: 2.3,
            scrambleText: {
              text: '{original}',
              chars: 'uppercase',
              tweenLength: false,
            },
          },
          '<+=0.2'
        )
        .from(
          title,
          {
            opacity: 0,
            duration: 0.01,
            stagger: {
              amount: 0.9,
              from: 'random',
            },
          },
          '<'
        )
        .from(
          '.our-story__title .title-line .line',
          { opacity: 0, duration: 0.5 },
          '<+=0.5'
        )
        .fromTo(
          '.our-story__title .title-line .line',
          { width: '0%' },
          { width: '100%', duration: 1.2, ease: 'power4.inOut' },
          '<+=0.2'
        )
        .from('.item-title div', { opacity: 0, duration: 1 }, '<+=0.5')
        .from(
          data.value,
          {
            founded: 0,
            duration: 1.5,
          },
          '<'
        )
        .from(
          data.value,
          {
            recognitions: 0,
            duration: 1.5,
          },
          '<'
        );
    }, containerRef.value);
  }, 100);
});

onUnmounted(() => {
  if (ctx) ctx.revert();
});
</script>

<template>
  <div ref="containerRef" class="our-story">
    <div class="our-story__title">
      <h2 class="subheader--mobile">Our story</h2>
      <div class="title-line">
        <span class="line" />
      </div>
    </div>
    <div class="our-story__grid">
      <div class="our-story__text body--mobile">
        <p>
          Psychoactive Studios is an award-winning digital design and
          development agency founded in 2018 by Andrew Hillstead, and based in
          Wellington, New Zealand. Operating as a remote-first studio with a
          global team and clients across North America, Europe, Asia, and the
          Pacific, we specialise in high-performance websites, immersive
          digital experiences, and AI-era web platforms built for ambitious
          brands.
        </p>
        <p>
          Psychoactive was born from Andrew’s Master’s research exploring how
          technology could create meaningful emotional states, pairing
          neurofeedback with augmented and virtual reality to simulate
          psychedelic therapy. That deep connection between design and human
          psychology still shapes how we think about digital experience today.
        </p>
        <p>
          Our services span brand strategy, content, UX, web and interface
          design, motion and interaction design, Webflow development, custom
          code, WebGL and 3D experiences, CMS architecture, SEO, and AI
          integration. We work across the full lifecycle of a digital product,
          from discovery and strategy through to build, launch, and ongoing
          partnership.
        </p>
        <p>
          In 2019, we moved to Webflow and pioneered the platform’s potential
          for enterprise-level creativity and performance. By 2022, we became
          New Zealand’s first Premium Webflow Enterprise Partner, and today we
          are recognised globally as one of the leading Webflow agencies in
          the world.
        </p>
        <p>
          We partner with some of the world’s most innovative brands and
          events, including World of WearableArt, Summer Game Fest, SuperAI,
          TOKEN2049, Blackbird VC, Adidas, and the All Blacks, delivering
          hundreds of websites across the tech, events, gaming, enterprise,
          and AI sectors, each crafted with its own purpose and distinctive
          character.
        </p>
        <p>
          As the web enters the AI era, we design and build experiences that
          integrate intelligence, not just beauty. From AI-native brand
          platforms to personalised digital products, we help forward-thinking
          organisations stay ahead.
        </p>
        <p>
          Nominated as Agency of the Year by Awwwards and recognised with 50+
          international awards, we approach every project with the curiosity
          of artists, the rigour of researchers, and the precision of
          engineers. Our work is built to stand out, and to stand the test of
          time.
        </p>
      </div>
      <div class="our-story__stats">
        <ul class="our-story__stats_list">
          <li class="our-story__stats_item">
            <div class="item-title display-2xl--strong">
              <div>{{ Math.floor(data.founded) }}</div>
            </div>
            <div class="item-text body--mobile">
              <span>Founded, based in</span>
              <br />
              Wellington New Zealand
            </div>
          </li>
          <li class="our-story__stats_item">
            <div class="item-title display-2xl--strong">
              <div>
                {{ Math.floor(data.recognitions).toLocaleString('en-US') }}+
              </div>
            </div>
            <div class="item-text body--mobile">
              <span>Recognition & Awards</span>
              <br />
              backing our excellence
            </div>
          </li>
          <li class="our-story__stats_item">
            <div class="item-title">
              <img src="/img/awwards-logo.svg" alt="Awwwards." />
            </div>
            <div class="item-text body--mobile">
              <span>Nominated as the </span>
              <br />
              International Agency of the Year
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
.our-story {
  &__title {
    margin-bottom: getRem(160);
    display: flex;
    align-items: center;
    gap: getRem(48);
    @include respond(mobile) {
      display: block;
      margin-bottom: getRem(24);
    }
    h2 {
      white-space: nowrap;
      color: white(50);
    }
    .title-line {
      flex-grow: 1;
      @include respond(mobile) {
        display: none;
      }
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
  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: getRem(48);
    @include respond(mobile) {
      grid-template-columns: 1fr;
      gap: getRem(60);
    }
  }
  &__text {
    color: white(80);
    @include respond(mobile) {
      // font-size: min(4.26667vw, 18px);
      // line-height: 140%;
    }
    p {
      margin-bottom: 1.5em;
    }
    p:first-child {
      &::before {
        content: '';
        display: inline-block;
        width: 7%;
      }
    }
    p:last-child {
      margin-bottom: 0;
    }
  }
  &__stats {
    display: flex;
    // Stick stats to the viewport while the longer body copy scrolls past.
    // `align-self: start` prevents the grid item stretching to full row
    // height, which would otherwise disable sticky behaviour.
    position: sticky;
    top: 100px;
    align-self: start;
    height: fit-content;
    @include respond(mobile) {
      display: block;
      position: static;
      top: auto;
    }
    &_list {
      display: flex;
      flex-direction: column;
      gap: getRem(60);
      margin: 0 auto;
      width: 17vw;
      @include respond(tablet) {
        width: 60%;
      }
      @include respond(mobile) {
        width: 100%;
      }
    }
    &_item {
      .item-title {
        line-height: 78%;
        margin-bottom: 1.25vw;
        @include respond(mobile) {
          font-size: min(32vw, 160px);
          font-style: normal;
          font-weight: 400;
          line-height: 100%; /* 120px */
        }
        img {
          width: 9.7vw;
          height: auto;
          @include respond(mobile) {
            width: 32vw;
          }
          // margin-bottom: 24px;
        }
      }
      .item-text {
        span {
          color: white(50);
        }
      }
    }
  }
}
</style>
