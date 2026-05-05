<script setup>
import { awardsData } from '~/data/awardsData';
import OnScrollFilledTextLight from '../ui/OnScrollFilledTextLight.vue';
import useAudioManager from '~/composables/useAudioManager';
import useScrollSmoother from '~/composables/useScrollSmoother';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const { playRandomSound } = useAudioManager();
const { scrollSmoother } = useScrollSmoother();

const containerRef = ref(null);
let ctx = null;

// Per-row stagger animation. Mirrors the WatsUs accordion pattern on
// the Webflow page — each award item gets its own ScrollTrigger so
// rows reveal one-by-one as the user scrolls into them, rather than
// all animating together off a single section trigger.
const setupRowAnimations = () => {
  if (!containerRef.value) return;
  const items = containerRef.value.querySelectorAll(
    '.awards__collection_item:not([data-animated])'
  );
  items.forEach((item) => {
    item.dataset.animated = 'true';
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 90%',
      },
      opacity: 0,
      y: 24,
      duration: 0.8,
      ease: 'power3.out',
    });
  });
};

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger);
  ctx = gsap.context(() => {
    setupRowAnimations();
  }, containerRef.value);
});

onUnmounted(() => {
  if (ctx) ctx.revert();
});

// When "Show More" loads additional rows, set up their animations
// so they fade in as the user scrolls past them too.
watch(
  () => containerRef.value?.querySelectorAll('.awards__collection_item').length,
  () => {
    nextTick(() => setupRowAnimations());
  }
);

// Number of awards to show initially and on each "Show More" click
const showCount = 6;
const showOffset = computed(() => awardsData.length / 3);

const showMoreRef = ref(null);
const offSetRef = ref(showCount);

// Track click count so the button label escalates with each press —
// gives the user a clear signal that the button still has more to
// reveal, with a bit of personality. Caps out at the most playful
// version once we've exhausted the planned progression.
const clickCount = ref(0);

const showMoreLabel = computed(() => {
  const labels = [
    'Show More',
    'Show Even More',
    'Show Even Moreee!',
    'Okay, even more!',
  ];
  return labels[Math.min(clickCount.value, labels.length - 1)];
});

const handleHoverEffect = () => {
  const el = showMoreRef.value;
  // Stop any ongoing animations on this element
  if (gsap.isTweening(el)) return;

  // Run the character-glitch scramble in place. We don't lock the
  // element's width here (used to call gsap.set(el, { width }) before
  // the scramble) because:
  //   1. The label is rendered in RoobertMono so each scrambled
  //      character occupies the same horizontal space as the original
  //      — there's no layout shift to prevent.
  //   2. The click handler's scramble uses overwrite: true, which
  //      killed this tween before its onComplete clearProps ran. The
  //      stale inline width then made longer escalating labels
  //      ("Show Even Moreee!", "Okay, even more!") wrap onto two
  //      lines because the span was still locked to the previous
  //      label's narrower measurement.
  // The button's `white-space: nowrap` keeps everything on one line
  // even if a future change reintroduces width-locking.
  gsap.to(el, {
    duration: 0.7,
    ease: 'none',
    scrambleText: {
      text: '{original}',
      chars: '0123456789!@#$%^&*()-_=+[]{};:<>/?,.',
      tweenLength: false,
    },
    overwrite: true,
  });
};

const onMouseEnterHandler = () => {
  playRandomSound('text-hover');
  handleHoverEffect();
};

const onFocusHandler = () => {
  handleHoverEffect();
};

const onClickHandler = async () => {
  playRandomSound('click');
  offSetRef.value += showOffset.value;
  clickCount.value += 1;

  // Re-trigger the scrambleText animation on the new label so the
  // label change reads as a deliberate moment, not just a static
  // text swap.
  await nextTick();
  if (showMoreRef.value) {
    gsap.to(showMoreRef.value, {
      duration: 0.8,
      ease: 'none',
      scrambleText: {
        text: '{original}',
        chars: '0123456789!@#$%^&*()-_=+[]{};:<>/?,.',
        tweenLength: false,
      },
      overwrite: true,
    });
  }
};
</script>

<template>
  <section ref="containerRef" class="awards">
    <div class="container">
      <!-- Awards Title -->
      <div class="awards__title">
        <div class="awards__title_count">
          <h2 class="display-4xl--strong">50+</h2>
          <div class="awards__title_count-sub subheader">
            Recognition & Awards
          </div>
        </div>
        <div class="awards__title_text heading-h5--mobile">
          <OnScrollFilledTextLight>
            <span class="dark">Our work</span>
            doesn’t chase awards.
            <span class="dark">It earns them.</span>
            From Awwwards Site of the Day to CSS Design Awards and
            Best Awards,
            <span class="dark">every honour reflects the same thing:</span>
            rigour, taste, and the patience
            <span class="dark">to get the details</span>
            right.
          </OnScrollFilledTextLight>
        </div>
      </div>

      <!-- Awards List -->
      <div class="awards__collection">
        <div class="awards__collection_header">
          <div class="subheader-small">Platform</div>
          <div class="awards__collection_header--center subheader-small">
            <div>Prize</div>
            <div>Project</div>
          </div>
          <div class="subheader-small">Year</div>
        </div>
        <ul class="awards__collection_list">
          <li
            v-for="award in awardsData.slice(0, offSetRef)"
            :key="award.id"
            class="awards__collection_item"
          >
            <div class="award-platform">
              <img :src="award.platform" :alt="award.project" loading="lazy" />
            </div>
            <div class="award-details body--mobile-compact">
              <div class="award-details--prize">{{ award.prize }}</div>
              <div class="award-details--project">{{ award.project }}</div>
            </div>
            <div class="award-year body--mobile-compact">{{ award.year }}</div>
          </li>
        </ul>
        <div class="awards__show-more">
          <button
            v-show="offSetRef < awardsData.length"
            class="awards__show-more"
            @mouseenter="onMouseEnterHandler"
            @focus="onFocusHandler"
            @click="onClickHandler"
          >
            <span ref="showMoreRef">{{ showMoreLabel }}</span>
            <div class="awards__show-more_dots">
              <span />
              <span />
              <span />
            </div>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
.awards {
  // Standardised major-section gap (160px) so the spacing under
  // "Explore Our Content Hub" matches the page rhythm. Was 320px
  // which felt disconnected from the rest of the page's spacing.
  margin-top: 160px;
  margin-bottom: 160px;
  @include respond(mobile) {
    margin-top: 120px;
    margin-bottom: 120px;
  }
  &__title {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: getRem(24);
    @include respond(mobile) {
      grid-template-columns: 1fr;
      gap: getRem(56);
    }
    &_count {
      position: relative;
      &-sub {
        // font-size: getRem(20);
        // font-style: normal;
        // font-weight: 400;
        // line-height: 120%;
        color: white(50);
        display: block;
        margin-top: 32px;
        // position: absolute;
        // top: 0;
        // left: 0;
      }
      h2 {
        // font-size: max(14.6vw, 196px);
        line-height: 0.6;
        // font-weight: 400;
        padding-bottom: 1.8vw;
        display: inline-block;
        // letter-spacing: -0.07em;
      }
    }
    &_text {
      line-height: 120%;
      @include respond(mobile) {
        // font-size: max(30px, 8vw);
      }
    }
  }
  &__collection {
    margin-top: 85px;
    &_header {
      display: grid;
      grid-template-columns: 0.3fr 1fr 0.15fr;
      gap: getRem(16);
      color: white(50);
      border-bottom: 1px solid white(10);
      padding-bottom: getRem(12);
      @include respond(mobile) {
        display: none;
      }
      &--center {
        display: grid;
        grid-template-columns: 1fr 0.5fr;
      }
      & > div:last-child {
        text-align: right;
      }
    }
    &_item {
      display: grid;
      grid-template-columns: 0.3fr 1fr 0.15fr;
      gap: getRem(16);
      padding-top: getRem(20);
      padding-bottom: getRem(20);
      align-items: center;
      border-bottom: 1px solid white(10);
      @include respond(mobile) {
        padding-top: getRem(8);
        border-color: white(20);
        align-items: flex-start;
        &:first-child {
          border-top: 1px solid white(20);
        }
      }
      .award-platform {
        img {
          width: auto;
          height: getRem(54);
          opacity: 0.6;
          @include respond(mobile) {
            width: getRem(55);
            height: auto;
          }
        }
      }
      .award-details {
        display: grid;
        grid-template-columns: 1fr 0.5fr;
        align-items: center;
        gap: getRem(16);
        @include respond(mobile) {
          grid-template-columns: 1fr;
          gap: getRem(8);
        }
      }
      .award-year {
        text-align: right;
      }
      &:last-child {
        border-bottom: 1px solid white(20);
      }
    }
  }
  &__show-more {
    margin-top: 64px;
    @include respond(mobile) {
      margin-top: getRem(24);
      text-align: center;
    }
    button {
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
      // Escalating labels ("Show Even Moreee!", "Okay, even more!")
      // are longer than the initial "Show More" — keep them on a
      // single line so the dotted underline + dots glyph stay tidy
      // even mid-scramble.
      white-space: nowrap;
    }
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
