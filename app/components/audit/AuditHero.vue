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

function onSubmit() {
  emit('submit');
}
</script>

<template>
  <section class="audit-hero">
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

      <form class="audit-hero__form" @submit.prevent="onSubmit">
        <label class="audit-hero__label sr-only" for="audit-url">
          Website URL
        </label>
        <div class="audit-hero__field">
          <input
            id="audit-url"
            v-model="localUrl"
            class="audit-hero__input"
            type="url"
            placeholder="yourdomain.com"
            :disabled="isAuditing"
            autocomplete="url"
            inputmode="url"
            spellcheck="false"
            required
          />
          <div class="audit-hero__underline" />
        </div>
        <ButtonOutline
          class="audit-hero__submit"
          :disabled="isAuditing"
          @click="onSubmit"
        >
          {{ isAuditing ? 'Auditing…' : 'Audit my site' }}
        </ButtonOutline>
      </form>

      <p v-if="errorMessage" class="audit-hero__error body-small--mobile">
        {{ errorMessage }}
      </p>

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
  @include respond(mobile) {
    padding: 14dvh 0 6dvh 0;
  }

  .container {
    @include container;
    max-width: 1280px;
  }

  &__eyebrow {
    color: white(60);
    margin-bottom: 32px;
    @include respond(mobile) {
      margin-bottom: 20px;
    }
  }

  &__title {
    color: $color-foreground;
    max-width: 16ch;
    margin-bottom: 32px;
    @include respond(mobile) {
      margin-bottom: 20px;
    }
  }

  &__lede {
    color: white(70);
    max-width: 58ch;
    margin-bottom: 56px;
    @include respond(mobile) {
      margin-bottom: 40px;
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
    // flips to "Auditing…" — and so the scramble-text hover animation
    // can't overflow.
    min-width: 200px;
  }

  &__error {
    color: #ff6a6a;
    margin-top: 16px;
  }

  &__fineprint {
    color: white(35);
    margin-top: 24px;
    max-width: 60ch;
  }
}
</style>
