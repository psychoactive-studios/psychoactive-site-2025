<script setup>
import ButtonOutline from '~/components/ui/ButtonOutline.vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  isAuditing: {
    type: Boolean,
    default: false,
  },
  // When true, the hero compresses to just the form. Set as soon as
  // an audit is kicked off (AUDITING | TEASER | SUBMITTING | UNLOCKED)
  // and stays true — the focus should stay on the report below, but
  // the user can still re-prompt via the input.
  isCompressed: {
    type: Boolean,
    default: false,
  },
  // URL of the last successfully-audited site. Used to detect whether
  // the user has edited the input since the last audit, which drives
  // the button label (Audited ✓ vs Audit another).
  auditedUrl: {
    type: String,
    default: '',
  },
  // When true, the hero skips its transitions on first paint. Used
  // for the content-hub → design-audit hand-off where the user
  // arrives already in "audit in progress" state — animating a
  // collapse of a hero they never saw is confusing.
  skipInitialTransition: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue', 'submit']);

const localUrl = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

// Ref for the URL input so "Run another?" in the compressed state
// can clear the field and drop focus into it — one click to re-prompt.
const inputRef = ref(null);

function onSubmit() {
  emit('submit');
}

function clearAndFocus() {
  emit('update:modelValue', '');
  inputRef.value?.focus();
}

// Button label + state logic — covers four scenarios:
//   1. Auditing in progress → "Auditing…" (disabled)
//   2. Completed, user hasn't edited the URL → "Audited ✓" (disabled,
//      purely visual — re-running the same URL is meaningless)
//   3. Completed, user edited the URL → "Audit another" (primary)
//   4. Fresh / never audited → "Audit my site" (primary)
const hasEditedSinceAudit = computed(() => {
  if (!props.auditedUrl) return false;
  const current = (props.modelValue || '').trim();
  if (!current) return false;
  return current !== props.auditedUrl;
});

const isCompletedUnchanged = computed(() => {
  if (props.isAuditing) return false;
  if (!props.auditedUrl) return false;
  return !hasEditedSinceAudit.value;
});

const submitLabel = computed(() => {
  if (props.isAuditing) return 'Auditing…';
  if (isCompletedUnchanged.value) return 'Audited ✓';
  if (hasEditedSinceAudit.value) return 'Audit another';
  return 'Audit my site';
});

const submitDisabled = computed(
  () => props.isAuditing || isCompletedUnchanged.value
);
</script>

<template>
  <section
    class="audit-hero"
    :class="{
      'audit-hero--compressed': isCompressed,
      'audit-hero--instant': skipInitialTransition,
    }"
  >
    <div class="container">
      <p class="audit-hero__eyebrow subheader--mobile">
        Free design audit
      </p>
      <h1 class="audit-hero__title heading-h1--mobile">
        Find out what your website's really saying.
      </h1>
      <p class="audit-hero__lede body-large--mobile">
        Drop in a URL and we'll score it against the five things that
        actually move the needle — clarity, conversion, copy, structure,
        and trust. Takes about a minute.
      </p>

      <!--
        Only visible once a site has actually been audited successfully
        (`auditedUrl` is set — `modelValue` alone isn't enough because
        that'd lie on the error state where a URL is typed but no audit
        completed). Replaces the role of the title/lede above and gives
        a one-click path to prompt a new audit.
      -->
      <p
        v-if="isCompressed && auditedUrl"
        class="audit-hero__audited-label"
      >
        <span class="audit-hero__audited-prefix">Audited:</span>
        <span class="audit-hero__audited-url">{{ auditedUrl }}</span>
        <span class="audit-hero__audited-separator">·</span>
        <button
          type="button"
          class="audit-hero__audited-reprompt"
          @click="clearAndFocus"
        >
          Run another?
        </button>
      </p>

      <form class="audit-hero__form" @submit.prevent="onSubmit">
        <label class="audit-hero__label sr-only" for="audit-url">
          Website URL
        </label>
        <div class="audit-hero__field">
          <!--
            Using type="text" on purpose. type="url" triggers the
            browser's strict URL validation which rejects bare domains
            like 'psychoactive.co.nz' and blocks the form submit with
            a native tooltip. Our server already normalises + validates
            the URL (adds https://, rejects bad schemes, etc.), so we
            let anything through here and let the server handle it.
          -->
          <input
            id="audit-url"
            ref="inputRef"
            v-model="localUrl"
            class="audit-hero__input"
            type="text"
            placeholder="yourdomain.com"
            :disabled="isAuditing"
            autocomplete="url"
            inputmode="url"
            spellcheck="false"
          />
          <div class="audit-hero__underline" />
        </div>
        <ButtonOutline
          class="audit-hero__submit"
          :class="{ 'audit-hero__submit--completed': isCompletedUnchanged }"
          :disabled="submitDisabled"
          @click="onSubmit"
        >
          {{ submitLabel }}
        </ButtonOutline>
      </form>

      <!--
        Designed error state. Warning icon + bordered panel so failures
        read as "something specific happened, here's what" rather than
        a generic red stack trace. Visible whenever the API returns an
        error (rate-limited, fetch failed, Claude failed, etc.).
      -->
      <div v-if="errorMessage" class="audit-hero__error" role="alert">
        <svg
          class="audit-hero__error-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p class="audit-hero__error-text body-small--mobile">
          {{ errorMessage }}
        </p>
        <button
          type="button"
          class="audit-hero__error-retry"
          @click="clearAndFocus"
        >
          Try a different URL
        </button>
      </div>

      <p class="audit-hero__fineprint body-small--mobile">
        We audit the pre-rendered HTML — what search engines and social
        previews see before any JavaScript runs.
      </p>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;

.audit-hero {
  padding: 18dvh 0 8dvh 0;
  // Padding collapses in sync with the content collapse so the whole
  // hero tightens up rather than leaving a big empty strip above the
  // form when the audit starts. `ease-out-quart` curve reads nicer
  // than a symmetric in-out for a one-way reveal like this.
  transition: padding 0.55s cubic-bezier(0.32, 0.72, 0, 1);
  @include respond(mobile) {
    padding: 14dvh 0 6dvh 0;
  }

  .container {
    @include container;
    max-width: 1280px;
  }

  // Title + lede + fineprint collapse on state change. The eyebrow is
  // handled separately — it stays visible in the compressed state as
  // a persistent page identifier (avoids losing context on reload /
  // tab-switch). Margin + max-height + opacity + slight translate-up
  // give the collapse a hint of motion rather than a flat fade.
  &__title,
  &__lede,
  &__fineprint {
    overflow: hidden;
    transition:
      max-height 0.55s cubic-bezier(0.32, 0.72, 0, 1),
      opacity 0.3s ease,
      margin 0.55s cubic-bezier(0.32, 0.72, 0, 1),
      transform 0.55s cubic-bezier(0.32, 0.72, 0, 1);
  }

  &__eyebrow {
    color: white(60);
    margin-bottom: 32px;
    transition: margin 0.55s cubic-bezier(0.32, 0.72, 0, 1);
    @include respond(mobile) {
      margin-bottom: 20px;
    }
  }

  &__title {
    color: $color-foreground;
    max-width: 16ch;
    margin-bottom: 32px;
    max-height: 400px;
    @include respond(mobile) {
      margin-bottom: 20px;
    }
  }

  &__lede {
    color: white(70);
    max-width: 58ch;
    margin-bottom: 56px;
    max-height: 400px;
    @include respond(mobile) {
      margin-bottom: 40px;
    }
  }

  // "Audited: example.com · Run another?" — only rendered when the
  // hero is compressed. Slides in (delayed) as the title/lede are
  // sliding out, so the user's eye tracks the state change.
  //
  // Uses a keyframe animation rather than a transition because v-if
  // creates the element with the --compressed class already present;
  // transitions don't fire without a "from" paint frame.
  &__audited-label {
    font-family: 'RoobertMono';
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: white(55);
    margin: 0 0 20px 0;
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    animation: audit-audited-fade-in 0.4s cubic-bezier(0.32, 0.72, 0, 1) 0.25s backwards;
  }

  &__audited-prefix {
    color: white(40);
  }

  &__audited-url {
    color: white(85);
    text-transform: none;
    font-family: inherit;
    letter-spacing: 0;
  }

  &__audited-separator {
    color: white(25);
  }

  &__audited-reprompt {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    color: $color-foreground;
    font: inherit;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    cursor: pointer;
    text-decoration: underline;
    text-decoration-color: white(30);
    text-underline-offset: 3px;
    transition:
      color 0.2s ease,
      text-decoration-color 0.2s ease;

    &:hover {
      text-decoration-color: $color-foreground;
    }

    &:focus-visible {
      outline: 2px solid white(40);
      outline-offset: 4px;
      border-radius: 2px;
    }
  }

  &__form {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: flex-end;
    margin-bottom: 16px;
  }

  &__field {
    flex: 1 1 320px;
    min-width: 0;
    position: relative;
  }

  &__input {
    width: 100%;
    background: none;
    border: none;
    outline: none;
    font-family: 'RoobertMono';
    font-size: 1.25rem;
    font-weight: 500;
    line-height: 1;
    color: $color-foreground;
    padding: 16px 0;
    color-scheme: dark;
    @include respond(mobile) {
      font-size: 1rem;
    }
    &::placeholder {
      color: white(40);
      text-transform: uppercase;
      transition: opacity 0.5s ease;
    }
    &:focus::placeholder {
      opacity: 0.8;
    }
    &:disabled {
      opacity: 0.4;
      cursor: wait;
    }
  }

  &__underline {
    height: 1px;
    background-color: white(20);
    position: relative;
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background-color: $color-foreground;
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.5s cubic-bezier(0.76, 0, 0.24, 1);
    }
  }

  &__input:focus ~ &__underline::before,
  &__input:not(:placeholder-shown) ~ &__underline::before {
    transform: scaleX(1);
  }

  &__submit {
    flex: 0 0 auto;
    // Lock the width so the button doesn't resize when the slot text
    // flips between "Auditing…" / "Audited ✓" / "Audit another" —
    // and so the scramble-text hover animation can't overflow.
    min-width: 200px;
  }

  // "Audited ✓" state — completed and unchanged URL. Distinct from
  // disabled-during-auditing: this is a purposeful done state, not a
  // wait state. Softer, low-contrast styling so it doesn't demand
  // attention, but clearly "handled".
  &__submit--completed {
    opacity: 1; // override default disabled dim
    cursor: default;
  }

  // Error panel — shown when the API returns a failure (rate-limited,
  // fetch error, Claude failure, etc.). Designed as a bordered block
  // with a warning icon and a "Try a different URL" button so it
  // reads as something actionable rather than just angry red text.
  &__error {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-top: 20px;
    padding: 14px 18px;
    border: 1px solid rgba(255, 140, 140, 0.3);
    background: rgba(255, 140, 140, 0.06);
    border-radius: 12px;
    max-width: 640px;
    flex-wrap: wrap;
  }

  &__error-icon {
    color: #ff9a9a;
    flex-shrink: 0;
    margin-top: 2px;
  }

  &__error-text {
    color: #ffc8c8;
    margin: 0;
    flex: 1 1 240px;
    min-width: 0;
  }

  &__error-retry {
    background: none;
    border: 1px solid rgba(255, 200, 200, 0.3);
    color: #ffd7d7;
    font-family: 'RoobertMono';
    font-size: getRem(11);
    font-weight: 500;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 8px 12px;
    border-radius: 999px;
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      color 0.2s ease;
    flex-shrink: 0;

    &:hover {
      background-color: rgba(255, 200, 200, 0.08);
      border-color: rgba(255, 200, 200, 0.5);
      color: #ffffff;
    }

    &:focus-visible {
      outline: 2px solid rgba(255, 200, 200, 0.6);
      outline-offset: 3px;
    }
  }

  &__fineprint {
    color: white(35);
    margin-top: 24px;
    max-width: 60ch;
    max-height: 200px;
  }

  // --instant disables every transition + animation in the hero. Used
  // when arriving from the content-hub promo card with ?url=X so the
  // page renders directly into compressed form rather than animating
  // a collapse the user never saw expand.
  &--instant,
  &--instant * {
    transition: none !important;
    animation: none !important;
  }

  // Compressed state — kicks in as soon as the user hits "Audit my
  // site". Collapses the title / lede / fineprint so the score card +
  // report below become the focus. The eyebrow stays visible as a
  // persistent page identifier, the form stays usable, and the
  // "Audited: X · Run another?" label fades in with a small delay so
  // the user always knows what's on screen.
  &--compressed {
    padding: 10dvh 0 4dvh 0;
    @include respond(mobile) {
      // Mobile needs less compression — the hero is already tight on
      // narrow viewports, so we only shave the bottom padding.
      padding: 10dvh 0 3dvh 0;
    }

    .audit-hero__eyebrow {
      margin-bottom: 16px;
    }

    .audit-hero__title,
    .audit-hero__lede,
    .audit-hero__fineprint {
      max-height: 0;
      opacity: 0;
      margin-top: 0;
      margin-bottom: 0;
      transform: translateY(-6px);
      pointer-events: none;
    }

  }
}

@keyframes audit-audited-fade-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .audit-hero__audited-label {
    animation: none;
  }
  .audit-hero,
  .audit-hero__title,
  .audit-hero__lede,
  .audit-hero__fineprint,
  .audit-hero__eyebrow {
    transition: none;
  }
}
</style>
