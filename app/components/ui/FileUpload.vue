<script setup>
import { useDropZone } from '@vueuse/core';

const model = defineModel({ type: Array, default: () => [] });

const props = defineProps({
  name: {
    type: String,
    default: '',
  },
  accept: {
    type: String,
    default: '*',
  },
  multiple: {
    type: Boolean,
    default: true,
  },
  hasError: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
});

const dropZoneRef = ref(null);
const inputRef = ref(null);

const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop(files) {
    if (!files) return;
    model.value = props.multiple ? [...model.value, ...files] : [files[0]];
  },
});

function onFileChange(event) {
  const files = Array.from(event.target.files || []);
  model.value = props.multiple ? [...model.value, ...files] : [files[0]];
  event.target.value = '';
}

function triggerBrowse() {
  inputRef.value?.click();
}

function removeFile(index) {
  model.value = model.value.filter((_, i) => i !== index);
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
</script>

<template>
  <div class="file-upload" :class="{ 'has-error': hasError || errorMessage, 'is-over': isOverDropZone }">
    <div
      ref="dropZoneRef"
      class="file-upload__zone"
      :class="{ 'has-files': model.length > 0 }"
      @click="model.length === 0 ? triggerBrowse() : undefined"
    >
      <input
        ref="inputRef"
        class="file-upload__input"
        type="file"
        :name="name"
        :accept="accept"
        :multiple="multiple"
        @change="onFileChange"
      />

      <span v-if="model.length === 0" class="file-upload__label body-small">
        Drop your PDF here, or <span class="file-upload__browse">BROWSE</span>
        
      </span>

      <ul v-else class="file-upload__list">
        <li
          v-for="(file, index) in model"
          :key="index"
          class="file-upload__item"
        >
          <div class="file-upload__item-info">
            <span class="file-upload__item-name body-small">{{ file.name }}</span>
            <span class="file-upload__item-size body-small">{{ formatSize(file.size) }}</span>
          </div>
          <div class="file-upload__item-status">
            <div class="file-upload__item-status-text">
              <span class="file-upload__item-complete body-small">Upload complete</span>
              <span class="file-upload__item-undo body-small" @click.stop="removeFile(index)">tap to undo</span>
            </div>
            <button
              type="button"
              class="file-upload__item-remove"
              @click.stop="removeFile(index)"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </li>
      </ul>
    </div>
    <div class="file-upload__border" />
    <span v-if="errorMessage" class="file-upload__error body-small">{{ errorMessage }}</span>
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;

.file-upload {
  display: inline-block;
  position: relative;
  width: 100%;

  &.has-error {
    .file-upload__border {
      background-color: rgbaColor(#ff3333, 20);
      &::before {
        background-color: #ff3333;
      }
    }

    .file-upload__zone {
      border-color: rgbaColor(#ff3333, 40);
    }
  }

  &.is-over {
    .file-upload__zone {
      border-color: white(60);
      background-color: white(5);
    }

    .file-upload__label {
      opacity: 1;
    }
  }

  &__zone {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 80px;
    border: 1px dashed white(20);
    border-radius: 4px;
    cursor: pointer;
    transition:
      border-color 0.3s ease,
      background-color 0.3s ease;

    &.has-files {
      cursor: default;
      padding: 0;
    }

    &:not(.has-files):hover {
      border-color: white(50);

      .file-upload__label {
        opacity: 1;
      }
    }
  }

  &__input {
    display: none;
  }

  &__label {
    color: $color-foreground;
    opacity: 0.4;
    pointer-events: none;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    transition: opacity 0.3s ease;
    user-select: none;
  }

  &__browse {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  &__list {
    list-style: none;
    margin: 0;
    padding: 0;
    width: 100%;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 80px;
    padding: 16px 20px;

    & + & {
      border-top: 1px dashed white(10);
    }
  }

  &__item-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  &__item-name {
    color: $color-foreground;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 600;
  }

  &__item-size {
    color: white(50);
  }

  &__item-status {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-shrink: 0;
  }

  &__item-status-text {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 3px;
  }

  &__item-complete {
    color: $color-foreground;
    white-space: nowrap;
  }

  &__item-undo {
    color: white(50);
    cursor: pointer;
    white-space: nowrap;
    transition: color 0.2s ease;

    &:hover {
      color: white(80);
    }
  }

  &__item-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    background-color: white(15);
    color: $color-foreground;
    cursor: pointer;
    flex-shrink: 0;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: white(25);
    }
  }

  &__border {
    width: 100%;
    height: 1px;
    background-color: white(20);
    position: relative;
    margin-top: 4px;
    display: none;

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
