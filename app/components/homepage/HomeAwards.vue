<script setup>
import { awardsData } from '~/data/awardsData';
import OnScrollFilledTextLight from '../ui/OnScrollFilledTextLight.vue';
import useAudioManager from '~/composables/useAudioManager';
import useScrollSmoother from '~/composables/useScrollSmoother';
import gsap from 'gsap';

const { playInteractionSound } = useAudioManager();
const { scrollSmoother } = useScrollSmoother();

// Number of awards to show initially and on each "Show More" click
const showCount = 6;

const showMoreRef = ref(null);
const offSetRef = ref(showCount);

const handleHoverEffect = () => {
  const el = showMoreRef.value;
  // Stop any ongoing animations on this element
  if (gsap.isTweening(el)) return;

  // Set the width to prevent layout shift
  const width = el.offsetWidth;
  gsap.set(el, { width });

  playInteractionSound();

  // Store the original text
  gsap.to(el, {
    duration: 0.7,
    ease: 'none',
    scrambleText: {
      text: '{original}',
      chars: '0123456789!@#$%^&*()-_=+[]{};:<>/?,.',
      tweenLength: false,
    },
    overwrite: true,
    onComplete: () => {
      gsap.set(el, { clearProps: 'all' });
    },
  });
};

const onMouseEnterHandler = () => {
  handleHoverEffect();
};

const onFocusHandler = () => {
  handleHoverEffect();
};

const onClickHandler = async () => {
  offSetRef.value += showCount;
  await nextTick();
  scrollSmoother.value.refresh();
};
</script>

<template>
  <section class="awards">
    <div class="container">
      <!-- Awards Title -->
      <div class="awards__title">
        <div class="awards__title_count">
          <sup>Awards</sup>
          <h2>48</h2>
        </div>
        <div class="awards__title_text">
          <OnScrollFilledTextLight>
            Our work doesn’t chase awards; it earns them. Each recognition
            reflects the rigour, imagination, and care we bring to every
            project.
          </OnScrollFilledTextLight>
        </div>
      </div>

      <!-- Awards List -->
      <div class="awards__collection">
        <div class="awards__collection_header">
          <div>Platform</div>
          <div>Prize</div>
          <div>Project</div>
          <div>Year</div>
        </div>
        <ul class="awards__collection_list">
          <li
            v-for="award in awardsData.slice(0, offSetRef)"
            :key="award.id"
            class="awards__collection_item"
          >
            <div class="award-platform">
              <img :src="award.platform" :alt="award.project" />
            </div>
            <div class="award-prize">{{ award.prize }}</div>
            <div class="award-project">{{ award.project }}</div>
            <div class="award-year">{{ award.year }}</div>
          </li>
        </ul>
        <button
          v-show="offSetRef < awardsData.length"
          class="awards__show-more"
          @mouseenter="onMouseEnterHandler"
          @focus="onFocusHandler"
          @click="onClickHandler"
        >
          <span ref="showMoreRef">Show More</span>
          <div class="awards__show-more_dots">
            <span />
            <span />
            <span />
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
.awards {
  margin-top: 320px;
  margin-bottom: 160px;
  &__title {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: getRem(24);
    &_count {
      position: relative;
      sup {
        font-size: getRem(20);
        font-style: normal;
        font-weight: 400;
        line-height: 20px;
        color: white(50);
        position: absolute;
        top: 0;
        left: 0;
      }
      h2 {
        font-size: clamp(270px, 21.88vw, 420px);
        line-height: 0.645;
        font-weight: 400;
        padding-bottom: 1.8vw;
      }
    }
    &_text {
      font-size: clamp(30px, 1.875vw, 36px);
      font-style: normal;
      font-weight: 400;
      line-height: 120%;
      letter-spacing: -0.36px;
    }
  }
  &__collection {
    margin-top: 85px;
    &_header {
      display: grid;
      grid-template-columns: 0.4fr 1fr 0.6fr 0.3fr;
      gap: getRem(16);
      color: white(50);
      font-family: 'RoobertMono';
      font-size: 14px;
      font-style: normal;
      font-weight: 500;
      line-height: 1.92;
      text-transform: uppercase;
      border-bottom: 1px solid white(20);
      padding-bottom: getRem(6);
      & > div:last-child {
        text-align: right;
      }
    }
    &_item {
      display: grid;
      grid-template-columns: 0.4fr 1fr 0.6fr 0.3fr;
      gap: getRem(16);
      padding-top: getRem(20);
      padding-bottom: getRem(20);
      align-items: center;
      border-bottom: 1px solid white(20);
      .award-platform {
        img {
          width: auto;
          height: getRem(54);
          opacity: 0.6;
        }
      }
      .award-year {
        text-align: right;
      }
    }
  }
  &__show-more {
    margin-top: 64px;
    padding-bottom: 12px;
    border-bottom: 1px dotted white(100);
    font-family: 'RoobertMono';
    font-size: 1rem;
    font-style: normal;
    font-weight: 500;
    line-height: 1;
    text-transform: uppercase;
    padding-right: 44px;
    position: relative;
    min-width: 134px;
    &_dots {
      display: inline-flex;
      gap: 2px;
      position: absolute;
      right: 0;
      span {
        width: 6px;
        height: 6px;
        background-color: white(100);
        border-radius: 50%;
        display: inline-block;
      }
    }
    &:hover {
      .awards__show-more_dots {
        span {
          &:nth-child(1) {
            animation: flicker-effect-3 0.5s forwards;
          }
          &:nth-child(2) {
            animation: flicker-effect-3 0.5s forwards 0.2s;
          }
          &:nth-child(3) {
            animation: flicker-effect-3 0.5s forwards 0.3s;
          }
        }
      }
    }
  }
}
</style>
