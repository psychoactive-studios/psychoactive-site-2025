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
      <div class="our-story__text body-large--mobile">
        <p>
          Psychoactive was founded in 2018 by Andrew Hillstead, born from his
          Master’s research which explored how technology could be used to
          simulate psychedelic therapy. That work paired neurofeedback with
          augmented and virtual reality, seeking new ways to create meaningful
          emotional states through digital experience. This deep connection
          between design and human psychology still shapes how we think about
          digital experience today.
        </p>
        <p>
          In 2019, Psychoactive transitioned from WordPress to Webflow,
          pioneering the platform’s potential for enterprise-level creativity
          and performance. The shift marked the beginning of a new chapter in
          web design, one where motion, micro-interactions, responsiveness, and
          performance could finally move in harmony.
        </p>
        <p>
          Today, Psychoactive partners with some of the world’s largest and most
          innovative brands and events, including World of WearableArt, Summer
          Game Fest, SuperAI, and TOKEN2049. From launching the All Blacks Rugby
          World Cup 2023 jersey to developing digital infrastructure for global
          organisations, universities, and fast-moving startups, we’ve delivered
          hundreds of websites - each one crafted with its own purpose and
          distinctive flavour.
        </p>
        <p>
          Having been nominated as Agency of the Year by Awwwards and receiving
          50+ international awards for our work, our journey has shaped a studio
          that thinks beyond trends and templates. We approach every project
          with the curiosity of artists and researchers and the precision of
          engineers, helping ambitious brands build digital experiences that
          stand out and stand the test of time.
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
      margin-bottom: 1em;
    }
    p:last-child {
      margin-bottom: 0;
    }
  }
  &__stats {
    display: flex;
    @include respond(mobile) {
      display: block;
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
