<script setup>
const data = ref({
  founded: 2018,
  recognitions: 50,
});
</script>
<template>
  <div class="our-story">
    <div class="our-story__title">
      <h2>THRIVE THROUGH COLLABORATION</h2>
      <div class="title-line">
        <span class="line" />
      </div>
    </div>
    <div class="our-story__grid">
      <div class="our-story__text">
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
            <div class="item-title">{{ data.founded }}</div>
            <div class="item-text">
              <span>Founded, based in</span>
              <br />
              Wellington New Zealand
            </div>
          </li>
          <li class="our-story__stats_item">
            <div class="item-title">{{ data.recognitions }}+</div>
            <div class="item-text">
              <span>Recognition & Awards</span>
              <br />
              backing our excellence
            </div>
          </li>
          <li class="our-story__stats_item">
            <div class="item-title">
              <img src="/img/awwards-logo.svg" alt="Awwwards." />
            </div>
            <div class="item-text">
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
.our-story {
  &__title {
    margin-bottom: getRem(160);
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
  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: getRem(48);
  }
  &__text {
    font-size: max(1.25vw, 18px);
    font-style: normal;
    font-weight: 400;
    line-height: 125%;
    color: white(80);
    p {
      margin-bottom: 1em;
    }
    p:last-child {
      margin-bottom: 0;
    }
  }
  &__stats {
    display: flex;
    &_list {
      display: flex;
      flex-direction: column;
      gap: getRem(60);
      margin: 0 auto;
    }
    &_item {
      .item-title {
        font-size: 8.33333vw;
        font-style: normal;
        font-weight: 400;
        line-height: 67%;
        letter-spacing: -0.07em;
        margin-bottom: 24px;
        img {
          width: 186px;
          height: auto;
          // margin-bottom: 24px;
        }
      }
      .item-text {
        font-size: max(1.042vw, 20px);
        font-style: normal;
        font-weight: 400;
        line-height: 130%;
        span {
          color: white(50);
        }
      }
    }
  }
}
</style>
