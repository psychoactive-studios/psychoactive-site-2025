<script setup>
import TextField from '~/components/ui/TextField.vue';
import ButtonOutline from '~/components/ui/ButtonOutline.vue';

const props = defineProps({
  leadForm: {
    type: Object,
    required: true,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['submit']);

function onSubmit() {
  emit('submit');
}
</script>

<template>
  <section class="email-gate">
    <div class="container">
      <div class="email-gate__inner">
        <p class="email-gate__eyebrow subheader--mobile">
          Unlock the full report
        </p>
        <h2 class="email-gate__title heading-h3--mobile">
          See every finding, every quote, and the one thing to fix first
          in each category.
        </h2>
        <p class="email-gate__lede body--mobile">
          Pop in your email and we'll reveal the lot. We'll also drop you
          a copy to keep. No drip sequence, no nonsense.
        </p>

        <form class="email-gate__form" @submit.prevent="onSubmit">
          <div class="email-gate__fields">
            <TextField
              v-model="props.leadForm.email"
              type="email"
              name="email"
              placeholder="Email*"
              :has-error="!!errorMessage"
            />
            <TextField
              v-model="props.leadForm.name"
              type="text"
              name="name"
              placeholder="Name"
            />
            <TextField
              v-model="props.leadForm.company"
              type="text"
              name="company"
              placeholder="Company"
            />
          </div>

          <p v-if="errorMessage" class="email-gate__error body-small--mobile">
            {{ errorMessage }}
          </p>

          <div class="email-gate__actions">
            <ButtonOutline
              class="email-gate__submit"
              :disabled="isSubmitting"
              @click="onSubmit"
            >
              {{ isSubmitting ? 'Unlocking…' : 'Show me the full report' }}
            </ButtonOutline>
            <p class="email-gate__legal body-small--mobile">
              We'll only use your email to send you this audit and the
              occasional thing we think you'd find useful. Unsubscribe
              anytime.
            </p>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;

.email-gate {
  padding: 6dvh 0 10dvh 0;

  .container {
    @include container;
    max-width: 1280px;
  }

  &__inner {
    border-top: 1px solid white(10);
    padding-top: 56px;
    @include respond(mobile) {
      padding-top: 40px;
    }
  }

  &__eyebrow {
    color: white(50);
    margin-bottom: 24px;
  }

  &__title {
    color: $color-foreground;
    max-width: 32ch;
    margin-bottom: 20px;
  }

  &__lede {
    color: white(70);
    max-width: 60ch;
    margin-bottom: 48px;
    @include respond(mobile) {
      margin-bottom: 32px;
    }
  }

  &__fields {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 32px;
    margin-bottom: 32px;
    @include respond(laptop-small) {
      grid-template-columns: 1fr 1fr;
    }
    @include respond(mobile) {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }

  &__error {
    color: #ff6a6a;
    margin-bottom: 16px;
  }

  &__actions {
    display: flex;
    gap: 32px;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 16px;
    @include respond(mobile) {
      gap: 20px;
    }
  }

  &__submit {
    flex: 0 0 auto;
    // Lock width so "Unlocking…" doesn't shrink the button.
    min-width: 280px;
  }

  &__legal {
    color: white(40);
    max-width: 48ch;
    margin: 0;
  }
}
</style>
