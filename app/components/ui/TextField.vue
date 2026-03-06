<script setup>
const model = defineModel({ type: String });

defineProps({
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  hasError: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  rows: {
    type: Number,
    default: 1,
  },
});
</script>
<template>
  <label class="text-field" :class="{ 'has-error': hasError || errorMessage }">
    <textarea v-if="type === 'textarea'"
      v-model="model"
      class="text-field__input textarea"
      :placeholder="placeholder"
      :name="name"
      :rows="rows"
    />
    <input v-else    
      v-model="model"
      class="text-field__input"
      :type="type"
      :placeholder="placeholder"
      :name="name"
    />
    <div class="text-field__border" />
    <span v-if="errorMessage" class="text-field__error body-small">{{
      errorMessage
    }}</span>
  </label>
</template>
<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;
.text-field {
  display: inline-block;
  position: relative;
  &.has-error {
    .text-field__border {
      background-color: rgbaColor(#ff3333, 20);
      &::before {
        background-color: #ff3333;
      }
    }
  }
  &__input {
    background: none;
    outline: none;
    border: none;
    height: auto;
    padding: 16px 0;
    font-family: 'RoobertMono';
    font-size: 1rem;
    font-style: normal;
    font-weight: 500;
    line-height: 1;
    color: white;
    color-scheme: dark;
    width: 100%;
    &.textarea {
      height: auto;
      padding: 16px 0;
      resize: vertical;
    }
    &::placeholder {
      color: white;
      opacity: 0.4;
      transition: opacity 0.5s ease;
      text-transform: uppercase;
    }
    &:focus::placeholder {
      opacity: 0.8;
    }
    &:not(:placeholder-shown) + .text-field__border::before {
      transform: scaleX(1);
    }
  }
  &__border {
    width: 100%;
    height: 1px;
    background-color: white(20);
    position: relative;
    &::before {
      content: '';
      display: block;
      width: 100%;
      height: 100%;
      position: absolute;
      inset: 0;
      background-color: $color-foreground;
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.5s cubic-bezier(0.76, 0, 0.24, 1);
    }
  }
  .text-field__input:focus + .text-field__border {
    &::before {
      transform: scaleX(1);
    }
  }

  &__error {
    display: block;
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    color: #ff4b4b;
    padding-left: 18px;
    letter-spacing: normal;
    &::before {
      content: '';
      display: block;
      width: 6px;
      height: 6px;
      background-color: #c23231;
      border-radius: 50%;
      margin-right: 12px;
      position: absolute;
      top: 0.5em;
      left: 0;
    }
  }
}
</style>
