<script setup>
import gsap from 'gsap';
import useAudioManager from '~/composables/useAudioManager';

const { playInteractionSound, playRandomSound } = useAudioManager();
const router = useRouter();

const titleRef = ref(null);
const barsRef = ref(null);
const inputRef = ref(null);

const urlInput = ref('');
const submitting = ref(false);

// Score ticker — rolls from a "middling" starting number up to a
// "strong" number on hover. Pure eye-candy that signals this is a
// scored experience, without claiming anything specific.
const displayScore = ref(42);

function animateScoreUp() {
  const obj = { value: displayScore.value };
  gsap.to(obj, {
    value: 87,
    duration: 0.7,
    ease: 'power2.out',
    onUpdate: () => {
      displayScore.value = Math.round(obj.value);
    },
  });
  if (barsRef.value) {
    const bars = barsRef.value.querySelectorAll('.promo__bar-fill');
    gsap.to(bars, {
      scaleX: (i) => [0.92, 0.78, 0.88, 0.84, 0.95][i] ?? 0.85,
      duration: 0.7,
      ease: 'power2.out',
      stagger: 0.05,
      overwrite: true,
    });
  }
}

function animateScoreDown() {
  const obj = { value: displayScore.value };
  gsap.to(obj, {
    value: 42,
    duration: 0.7,
    ease: 'power2.inOut',
    onUpdate: () => {
      displayScore.value = Math.round(obj.value);
    },
  });
  if (barsRef.value) {
    const bars = barsRef.value.querySelectorAll('.promo__bar-fill');
    gsap.to(bars, {
      scaleX: (i) => [0.35, 0.55, 0.42, 0.48, 0.6][i] ?? 0.5,
      duration: 0.7,
      ease: 'power2.inOut',
      stagger: 0.05,
      overwrite: true,
    });
  }
}

function scrambleTitle() {
  if (!titleRef.value || gsap.isTweening(titleRef.value)) return;
  const width = titleRef.value.offsetWidth;
  const height = titleRef.value.offsetHeight;
  gsap.set(titleRef.value, { width, height });
  gsap.to(titleRef.value, {
    duration: 0.5,
    ease: 'none',
    scrambleText: {
      text: '{original}',
      chars: '0123456789!@#$%^&*()-_=+[]{};:<>/?,.',
      tweenLength: false,
    },
    overwrite: true,
    onComplete: () => {
      gsap.set(titleRef.value, { clearProps: 'all' });
    },
  });
}

function onHover() {
  playRandomSound('text-hover');
  animateScoreUp();
  scrambleTitle();
}

function onLeave() {
  animateScoreDown();
}

// Clicks inside the form should not bubble up to the card's own mouse
// handlers (otherwise typing a URL triggers the hover sounds).
function stopPropagation(e) {
  e.stopPropagation();
}

async function onSubmit() {
  const trimmed = (urlInput.value || '').trim();
  if (!trimmed) {
    // Just focus the input so the user sees where to type.
    inputRef.value?.focus();
    return;
  }
  submitting.value = true;
  playInteractionSound('click');
  await router.push({
    path: '/design-audit',
    query: { url: trimmed },
  });
}
</script>

<template>
  <article
    class="promo"
    @mouseenter="onHover"
    @mouseleave="onLeave"
  >
    <div class="promo__description">
      <div class="promo__info">
        <div class="promo__info--category">
          AI Audit
        </div>
      </div>
      <h3 ref="titleRef" class="promo__title">
        What does your site say in the first five seconds?
      </h3>
      <p class="promo__lede">
        Drop in any URL. We'll audit the page across clarity, conversion,
        copy, structure, and trust — and hand back specific findings with
        one fix-first per category.
      </p>
      <form
        class="promo__form"
        @submit.prevent="onSubmit"
        @click="stopPropagation"
      >
        <label class="sr-only" for="promo-audit-url">Website URL</label>
        <!--
          type="text" so the browser doesn't block bare-domain input
          like 'psychoactive.co.nz'. Server normalises and validates.
        -->
        <input
          id="promo-audit-url"
          ref="inputRef"
          v-model="urlInput"
          type="text"
          class="promo__input"
          placeholder="yourdomain.com"
          autocomplete="url"
          inputmode="url"
          spellcheck="false"
          :disabled="submitting"
        />
        <button
          type="submit"
          class="promo__submit"
          :disabled="submitting"
        >
          {{ submitting ? 'Loading…' : 'Run audit' }}
          <svg
            class="promo__submit-arrow"
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 8h10m0 0L8 3m5 5l-5 5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </form>
    </div>

    <div class="promo__score-panel">
      <div class="promo__score">
        <span class="promo__score-num">{{ displayScore }}</span>
        <span class="promo__score-total">/100</span>
      </div>
      <ul ref="barsRef" class="promo__bars">
        <li class="promo__bar">
          <span class="promo__bar-label">Clarity</span>
          <span class="promo__bar-track">
            <span class="promo__bar-fill" style="transform: scaleX(0.35)" />
          </span>
        </li>
        <li class="promo__bar">
          <span class="promo__bar-label">Conversion</span>
          <span class="promo__bar-track">
            <span class="promo__bar-fill" style="transform: scaleX(0.55)" />
          </span>
        </li>
        <li class="promo__bar">
          <span class="promo__bar-label">Copy</span>
          <span class="promo__bar-track">
            <span class="promo__bar-fill" style="transform: scaleX(0.42)" />
          </span>
        </li>
        <li class="promo__bar">
          <span class="promo__bar-label">Structure</span>
          <span class="promo__bar-track">
            <span class="promo__bar-fill" style="transform: scaleX(0.48)" />
          </span>
        </li>
        <li class="promo__bar">
          <span class="promo__bar-label">Trust</span>
          <span class="promo__bar-track">
            <span class="promo__bar-fill" style="transform: scaleX(0.6)" />
          </span>
        </li>
      </ul>
    </div>
  </article>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/breakpoints' as *;

.promo {
  grid-column: 1 / -1;
  // Internal grid mirrors the outer content-hub grid exactly — same
  // 1fr 1fr columns, same 20px gap. This puts the two halves of the
  // promo in the same x-coordinates as the NewsCards above/below.
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: getRem(20);
  border-radius: 8px;
  background: #1b1b1b;
  // No padding on the promo itself — each internal cell handles its
  // own padding so content lines up with NewsCard content.
  padding: 0;
  color: $color-foreground;
  transition: background-color 0.3s ease;

  @include respond(mobile) {
    grid-template-columns: 1fr;
    gap: 0;
  }

  &:hover {
    background-color: white(20);
  }

  &__description {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 0;
    // Content fills the full cell width. The right edge here aligns
    // with the right edge of the image in the NewsCard above (which is
    // the right edge of that grid column), not the end of the NewsCard
    // text column.
    padding: 1rem;
  }

  &__info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: 'RoobertMono';
    font-size: getRem(12);
    font-weight: 500;
    line-height: 1.75;
    text-transform: uppercase;
    color: white(70);
    padding-left: 14px;
    position: relative;
    white-space: nowrap;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 6px;
      height: 6px;
      background-color: white(100);
      opacity: 0.5;
      border-radius: 50%;
    }
  }

  &:hover &__info::before {
    animation: flicker-effect-5 0.5s forwards;
  }

  &__title {
    font-size: clamp(24px, 1.67vw, 32px);
    font-weight: 400;
    line-height: 1.12;
    letter-spacing: -0.02em;
    margin: 0;
    max-width: 24ch;
    overflow: hidden;
  }

  &__lede {
    font-size: 1rem;
    line-height: 1.45;
    color: white(65);
    max-width: 48ch;
    margin: 0;
  }

  &__form {
    margin-top: auto;
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 6px 6px 6px 18px;
    border: 1px solid white(20);
    border-radius: 999px;
    background: white(3);
    transition:
      border-color 0.3s ease,
      background-color 0.3s ease;

    &:focus-within {
      border-color: white(50);
      background-color: white(8);
    }

    @include respond(mobile) {
      flex-direction: column;
      align-items: stretch;
      border-radius: 16px;
      padding: 10px;
      gap: 10px;
    }
  }

  &__input {
    flex: 1 1 auto;
    min-width: 0;
    background: none;
    border: none;
    outline: none;
    font-family: 'RoobertMono';
    font-size: 14px;
    font-weight: 500;
    line-height: 1;
    color: $color-foreground;
    padding: 12px 0;
    color-scheme: dark;

    &::placeholder {
      color: white(40);
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    &:disabled {
      opacity: 0.5;
    }

    @include respond(mobile) {
      padding: 12px 14px;
    }
  }

  &__submit {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: 'RoobertMono';
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: $color-background;
    background-color: $color-foreground;
    padding: 12px 18px;
    border: none;
    border-radius: 999px;
    cursor: pointer;
    min-width: 132px;
    transition:
      background-color 0.3s ease,
      color 0.3s ease;

    &:hover:not(:disabled) {
      background-color: white(80);
    }

    &:disabled {
      cursor: wait;
      opacity: 0.75;
    }
  }

  &__submit-arrow {
    transition: transform 0.3s cubic-bezier(0.33, 1, 0.68, 1);
  }

  &__submit:hover:not(:disabled) &__submit-arrow {
    transform: translateX(3px);
  }

  &__score-panel {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 20px;
    // Fills the full cell width so the category bars extend to the
    // right edge of the grid — matching the right edge of the image
    // in the NewsCard above.
    padding: 1rem;
  }

  &__score {
    display: flex;
    align-items: baseline;
    color: $color-foreground;
  }

  &__score-num {
    font-size: clamp(56px, 5vw, 88px);
    line-height: 0.9;
    letter-spacing: -0.05em;
    font-variant-numeric: tabular-nums;
  }

  &__score-total {
    font-size: clamp(18px, 1.8vw, 24px);
    color: white(40);
    margin-left: 6px;
    letter-spacing: -0.04em;
  }

  &__bars {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__bar {
    display: grid;
    grid-template-columns: 80px 1fr;
    align-items: center;
    gap: 14px;
    font-family: 'RoobertMono';
    font-size: 10px;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: white(55);
  }

  &__bar-track {
    display: block;
    height: 2px;
    background-color: white(10);
    border-radius: 1px;
    overflow: hidden;
  }

  &__bar-fill {
    display: block;
    width: 100%;
    height: 100%;
    background-color: $color-foreground;
    transform-origin: left;
    transition: transform 0.6s cubic-bezier(0.33, 1, 0.68, 1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .promo__bar-fill,
  .promo__submit-arrow {
    transition: none;
  }
}
</style>
