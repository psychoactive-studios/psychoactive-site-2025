<script setup>
import gsap from 'gsap';
import PlusIcon from '~/assets/icons/icon-plus.svg';
import { timelineScrollAnimation } from '~/utils/animations/webflow';
const timelineData = {
  years: [
    '2015',
    '2016',
    '2017',
    '2018',
    '2019',
    '2020',
    '2021',
    '2022',
    '2023',
    '2024',
    '2025',
    '2026',
    '2027',
    '2028',
    '2029',
    '2030',
    '2031',
    '2032',
    '2033',
  ],
};

const containerRef = ref(null);
const currentYear = ref(2015);
let ctx = null;

onMounted(() => {
  ctx = gsap.context(() => {}, containerRef.value);
  timelineScrollAnimation(ctx, currentYear);
});

onUnmounted(() => {
  if (ctx) ctx.revert();
});
</script>

<template>
  <div ref="containerRef" class="timeline">
    <div class="timeline__inner">
      <div class="timeline__year">{{ Math.floor(currentYear) }}</div>
      <div class="timeline__yearline">
        <!-- <ul class="timeline__yearline_list">
          <li v-for="year in timelineData.years" :key="year">{{ year }}</li>
        </ul> -->
        <div class="timeline__yearline_marquee">
          <PlusIcon v-for="i in 22" :key="i" />
        </div>
      </div>
      <div class="timeline__through">
        <div class="timeline__arrow">
          <div class="timeline__arrow_line" />
          <div class="timeline__arrow_dot" />
          <img
            class="timeline__arrow_blick"
            src="/img/webflow-timeline-blick.png"
            alt=""
          />
        </div>
        <ul class="timeline__through_list">
          <li class="item entry">
            <div class="item__title">
              <img src="/img/webflow-logo.svg" alt="" />
              <h3>Early Adopter</h3>
            </div>
            <div class="item__dot item__dot--white" data-year="2019" />
            <div class="item__info">
              <h4>Psychoactive began</h4>
              <div class="item__info_text">
                <p>Experimenting with Webflow</p>
                <p />
              </div>
            </div>
          </li>
          <li class="item main">
            <div class="item__title">
              <img src="/img/webflow-logo.svg" alt="" />
              <h3>Certified Partner</h3>
            </div>
            <div class="item__dot" data-year="2020" />
            <div class="item__info">
              <h4>Psychoactive becomes</h4>
              <div class="item__info_text">
                <p>New Zealand's first</p>
                <p>Certified Webflow Agency</p>
              </div>
            </div>
          </li>
          <li class="item main">
            <div class="item__title">
              <img src="/img/webflow-logo.svg" alt="" />
              <h3>Certified Partner</h3>
              <div class="enterprise">Enterprise</div>
            </div>
            <div class="item__dot" data-year="2022" />
            <div class="item__info">
              <h4>Psychoactive becomes</h4>
              <div class="item__info_text">
                <p>New Zealand's first</p>
                <p>Enterprise Webflow Partner</p>
              </div>
            </div>
          </li>
          <li class="item main">
            <div class="item__title">
              <img src="/img/webflow-logo.svg" alt="" />
              <h3>Premium Partner</h3>
              <div class="enterprise blue">Enterprise</div>
            </div>
            <div class="item__dots">
              <div class="item__dot" data-year="2025" />
              <div class="item__dot" />
            </div>
            <div class="item__info">
              <h4>Psychoactive is</h4>
              <div class="item__info_text">
                <p>A globally trusted</p>
                <p>Premium Webflow Partner</p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;
@use 'sass:math';

$min: 5;
$max: 15;

$range: $max - $min + 1;

.timeline {
  &__inner {
    height: 100svh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  &__year {
    font-size: 14.6vw;
    font-style: normal;
    font-weight: 400;
    line-height: 100%; /* 280px */
    letter-spacing: -0.07em;
    color: white(10);
    position: relative;
    z-index: 2;
  }
  &__yearline {
    padding-left: 33%;
    position: relative;
    z-index: 2;
    &_list {
      min-width: max-content;
      display: flex;
      gap: 19.5vw;
      font-family: 'RoobertMono';
      font-size: clamp(14px, 0.833vw, 16px);
      font-style: normal;
      font-weight: 500;
      line-height: 100%; /* 16px */
      text-transform: uppercase;
      & > li {
        color: white(50);
        flex-shrink: 0;
      }
    }
    &_marquee {
      display: flex;
      color: white(50);
      position: absolute;
      left: -160px;
      bottom: 0;
      animation: tunnel 80s linear infinite;
      svg {
        width: 7px;
        height: 7px;
        flex-shrink: 0;
        @for $i from 1 through 22 {
          $random-number: math.random($range) + $min;
          &:nth-child(#{$i}) {
            margin-right: #{$random-number}vw;
          }
        }
      }
    }
  }
  &__through {
    margin-top: 80px;
    position: relative;
    &_list {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      position: relative;
      z-index: 2;
      .item {
        &__title {
          display: flex;
          align-items: center;
          min-height: getRem(28);
          white-space: nowrap;
          @include respond(tablet) {
            position: relative;
          }
          img {
            width: auto;
            height: clamp(14px, 1.05vw, 20px);
            margin-right: getRem(4);
          }
          h3 {
            font-size: clamp(12px, 0.94vw, 18px);
            font-style: normal;
            font-weight: 600;
            line-height: 1;
            color: $color-foreground;
          }
          .enterprise {
            font-size: clamp(12px, 0.73vw, 14px);
            font-style: normal;
            font-weight: 600;
            line-height: 1; /* 21.3px */
            padding: 2px clamp(8px, 0.63vw, 12px);
            background-color: $color-foreground;
            color: $color-black;
            border-radius: 4px;
            margin-left: 12px;
            height: clamp(18px, 1.459vw, 28px);
            @include flex-center;
            &.blue {
              background-color: #136df4;
              color: $color-foreground;
            }
            @include respond(tablet) {
              position: absolute;
              top: 100%;
              left: 0;
              margin-left: 0;
            }
          }
        }
        &__dots {
          margin-top: 32px;
          display: flex;
          justify-content: space-between;
          .item__dot {
            margin-top: 0;
            background-color: #136df4;
          }
        }
        &__dot {
          margin-top: 32px;
          width: 6px;
          height: 6px;
          background-color: $color-foreground;
          border-radius: 50%;
          opacity: 0.2;
          position: relative;
          &::before {
            content: attr(data-year);
            position: absolute;
            top: calc(100% + 0.3em);
            left: 0;
            font-size: clamp(14px, 1.04vw, 20px);
            line-height: 130%;
          }
          &--white {
            opacity: 1;
          }
        }
        &__info {
          margin-top: 72px;
          h4 {
            font-family: 'RoobertMono';
            font-size: clamp(12px, 0.833vw, 16px);
            font-style: normal;
            font-weight: 500;
            line-height: 100%;
            text-transform: uppercase;
            color: white(50);
            margin-bottom: getRem(6);
          }
          p {
            font-size: clamp(12px, 1.042vw, 20px);
            font-style: normal;
            font-weight: 400;
            line-height: 130%;
          }
        }
      }
    }
  }
  &__arrow {
    position: absolute;
    top: 60px;
    left: 0;
    width: calc((100% - (1rem * 3)) / 4 + 1rem + 6px);
    text-align: right;
    z-index: 1;
    &_dot {
      display: block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: $color-foreground;
      margin-left: auto;
    }
    &_line {
      width: 100%;
      height: 1px;
      background: linear-gradient(90deg, #000 0%, #fff 100%);
      margin: 0 auto 8px auto;
      position: absolute;
      top: 3px;
      right: 0;
      transform-origin: right;
    }
    &_blick {
      position: absolute;
      max-width: initial;
      top: calc(50% - 32vh);
      right: -2vh;
      height: 64vh;
      aspect-ratio: 1;
    }
  }
}

@keyframes tunnel {
  // from {
  //   transform: translateX(calc(10vw + 64px));
  // }
  to {
    transform: translateX(-100vw);
  }
}
</style>
