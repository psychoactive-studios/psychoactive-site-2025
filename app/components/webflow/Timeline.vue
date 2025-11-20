<script setup>
import PlusIcon from '~/assets/icons/icon-plus.svg';
const timelineData = {
  years: [
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
  ],
};
</script>

<template>
  <div class="timeline">
    <div class="timeline__year">2018</div>
    <div class="timeline__yearline">
      <ul class="timeline__yearline_list">
        <li v-for="year in timelineData.years" :key="year">{{ year }}</li>
      </ul>
      <div class="timeline__yearline_marquee">
        <PlusIcon v-for="i in 22" :key="i" />
      </div>
    </div>
    <div class="timeline__through">
      <ul class="timeline__through_list">
        <li class="item">
          <div class="item__title">
            <img src="/img/webflow-logo.svg" alt="" />
            <h3>Early Adopter</h3>
          </div>
          <div class="item__dot" />
          <div class="item__info">
            <h4>Psychoactive began</h4>
            <p>experimenting with Webflow</p>
          </div>
        </li>
        <li class="item">
          <div class="item__title">
            <img src="/img/webflow-logo.svg" alt="" />
            <h3>Certified Partner</h3>
          </div>
          <div class="item__dot" />
          <div class="item__info">
            <h4>Psychoactive becomes</h4>
            <p>New Zealand's first</p>
            <p>Certified Webflow Agency</p>
          </div>
        </li>
        <li class="item">
          <div class="item__title">
            <img src="/img/webflow-logo.svg" alt="" />
            <h3>Certified Partner</h3>
            <div class="enterprise">Enterprise</div>
          </div>
          <div class="item__dot" />
          <div class="item__info">
            <h4>Psychoactive becomes</h4>
            <p>New Zealand's first</p>
            <p>Enterprise Webflow Partner</p>
          </div>
        </li>
        <li class="item">
          <div class="item__title">
            <img src="/img/webflow-logo.svg" alt="" />
            <h3>Premium Partner</h3>
            <div class="enterprise blue">Enterprise</div>
          </div>
          <div class="item__dot" />
          <div class="item__info">
            <h4>Psychoactive is</h4>
            <p>A globally trusted</p>
            <p>Premium Webflow Partner</p>
          </div>
        </li>
      </ul>
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
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  &__year {
    font-size: 14.6vw;
    font-style: normal;
    font-weight: 400;
    line-height: 100%; /* 280px */
    letter-spacing: -0.07em;
    color: white(10);
  }
  &__yearline {
    padding-left: 55%;
    position: relative;
    &_list {
      display: flex;
      gap: 19.5vw;
      font-family: 'RoobertMono';
      font-size: 1rem;
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
    margin-top: 180px;
    &_list {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      .item {
        &__title {
          display: flex;
          align-items: center;
          img {
            width: auto;
            height: 20px;
            margin-right: getRem(4);
          }
          h3 {
            font-size: getRem(18);
            font-style: normal;
            font-weight: 600;
            line-height: 1;
            color: $color-foreground;
          }
          .enterprise {
            font-size: getRem(14);
            font-style: normal;
            font-weight: 600;
            line-height: 150%; /* 21.3px */
            padding: 2px 12px;
            background-color: $color-foreground;
            color: $color-black;
            border-radius: 4px;
            margin-left: 12px;
            height: 28px;
            @include flex-center;
            &.blue {
              background-color: #136df4;
              color: $color-foreground;
            }
          }
        }
        &__dot {
          margin-top: 32px;
          width: 6px;
          height: 6px;
          background-color: $color-foreground;
          border-radius: 50%;
          opacity: 0.2;
        }
        &__info {
          margin-top: 72px;
          h4 {
            font-family: 'RoobertMono';
            font-size: 1rem;
            font-style: normal;
            font-weight: 500;
            line-height: 100%;
            text-transform: uppercase;
            color: white(50);
            margin-bottom: getRem(6);
          }
          p {
            font-size: getRem(20);
            font-style: normal;
            font-weight: 400;
            line-height: 130%;
          }
        }
      }
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
