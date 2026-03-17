<script setup>
import gsap from 'gsap';
import useAudioManager from '~/composables/useAudioManager';

const props = defineProps({
  list: {
    type: Array,
    required: true,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  defaultOpen: {
    type: [Number, Array],
    default: null,
  },
  icon: {
    type: Object,
    default: null,
  },
});

const activeIndices = ref([]);
const { playInteractionSound, playRandomSound } = useAudioManager();

if (props.defaultOpen !== null) {
  if (Array.isArray(props.defaultOpen)) {
    activeIndices.value = props.multiple
      ? props.defaultOpen
      : [props.defaultOpen[0]];
  } else {
    activeIndices.value = [props.defaultOpen];
  }
}

const toggle = (index) => {
  playRandomSound('click');
  if (props.multiple) {
    if (activeIndices.value.includes(index)) {
      playInteractionSound('accordion-close', 100);
      activeIndices.value = activeIndices.value.filter((i) => i !== index);
    } else {
      playInteractionSound('accordion-open', 100);
      activeIndices.value.push(index);
    }
  } else {
    if (activeIndices.value.includes(index)) {
      playInteractionSound('accordion-close', 100);
      activeIndices.value = [];
    } else {
      playInteractionSound('accordion-open', 100);
      activeIndices.value = [index];
    }
  }
};

const beforeEnter = (el) => {
  gsap.set(el, { height: 0, opacity: 0 });
};

const enter = (el, done) => {
  gsap.to(el, {
    height: 'auto',
    opacity: 1,
    duration: 0.5,
    ease: 'power3.inOut',
    onComplete: done,
  });
};

const leave = (el, done) => {
  gsap.to(el, {
    height: 0,
    opacity: 0,
    duration: 0.5,
    ease: 'power3.inOut',
    onComplete: done,
  });
};
</script>

<template>
  <div class="accordion">
    <div
      v-for="(item, index) in list"
      :key="index"
      class="accordion__item"
      :class="{ 'accordion__item--active': activeIndices.includes(index) }"
    >
      <button
        class="accordion__header"
        @mouseenter="() => playInteractionSound('scroll-btn-hover')"
        @click="toggle(index)"
      >
        <span class="accordion__title subheader--mobile">{{ item.title }}</span>
        <Transition
          :css="false"
          @before-enter="beforeEnter"
          @enter="enter"
          @leave="leave"
        >
          <div
            v-if="activeIndices.includes(index)"
            class="accordion__content-wrapper"
          >
            <div class="accordion__content body--mobile">
              <div class="accordion__content_inner">
                <!-- Paragraphs -->
                <template
                  v-for="(block, blockIndex) in item.description"
                  :key="blockIndex"
                >
                  <p>
                    <template
                      v-for="(child, childIndex) in block.children"
                      :key="childIndex"
                    >
                      {{ child.text }}
                    </template>
                  </p>
                </template>
              </div>
            </div>
          </div>
        </Transition>
        <!-- <ButtonDotsArrow
          class="accordion__header_icon"
          mode="dark"
          :rounded="true"
          :bordered="true"
        /> -->
        <div class="accordion__header_icon">
          <div class="dots">
            <span class="dot dot--1" />
            <span class="dot dot--2" />
            <span class="dot dot--3" />
          </div>
        </div>
        <div class="accordion__header_border">
          <div class="accordion__header_overlay" />
        </div>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/mixins' as *;

.accordion {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: max(0.833333vw, 16px);
  @include respond(mobile) {
    gap: getRem(14);
  }

  &__item {
    &--active {
      .accordion__header_icon {
        .dots {
          transform: rotate(180deg);
        }
      }
      .accordion__header_overlay {
        opacity: 1;
      }
    }
  }

  &__header {
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.5s ease-in-out;
    color: $color-background;
    display: flex;
    align-items: flex-start;
    width: 100%;
    padding-bottom: max(0.833333vw, 16px);
    position: relative;
    @include respond(laptop) {
      flex-direction: column;
    }
    &_icon {
      @include flex-center;
      width: 48px;
      height: 48px;
      flex-shrink: 0;
      position: absolute;
      right: max(0.833333vw, 16px);
      top: 0;
      border: 1px solid rgbaColor($color-background, 20);
      border-radius: 50%;
      transition:
        border-color $transition-easeOutCubic,
        background-color $transition-easeOutCubic;
      @include respond(mobile) {
        right: 0;
      }
      .dots {
        width: 16px;
        height: 16px;
        position: relative;
        transition: transform 0.3s ease-in-out;
        .dot {
          display: block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          position: absolute;
          background-color: $color-background;
          &--1 {
            top: 2px;
            left: 1px;
          }
          &--2 {
            top: 2px;
            right: 1px;
          }
          &--3 {
            bottom: 1px;
            left: calc(50% - 3px);
          }
        }
      }
    }
    &_overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      pointer-events: none;
      background-image: linear-gradient(
        90deg,
        rgba(255, 154, 154, 1) 0%,
        rgba(255, 226, 183, 1) 50%,
        rgba(113, 207, 247, 1) 100%
      );
      transition: opacity 0.5s ease-in-out;
    }
    &_border {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 1px;
      background-color: rgbaColor(#000000, 20);
      &::before,
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        top: -3px;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background-color: $color-dots;
      }
      &::before {
        left: -3px;
      }
      &::after {
        right: -3px;
      }
    }
    &:hover {
      .accordion__header_icon {
        border-color: transparent;
        background-color: rgbaColor(#101012, 20);
        .dots {
          :deep(.dot--1) {
            animation: flicker-effect-1 0.6s ease;
          }
          :deep(.dot--2) {
            animation: flicker-effect-3 0.6s ease;
          }
          :deep(.dot--3) {
            animation: flicker-effect-5 0.6s ease;
          }
        }
      }
    }
  }

  &__title {
    white-space: nowrap;
    flex-grow: 1;
    margin-right: 1rem;
    padding: max(0.78vw, 16px) 0;
    @include respond(mobile) {
      white-space: normal;
      margin-right: 56px;
    }
  }

  &__content-wrapper {
    overflow: hidden;
    width: 50%;
    margin-left: auto;
    margin-right: calc(4.1vw + 48px);
    @include respond(laptop) {
      width: auto;
    }
  }

  &__content {
    &_inner {
      padding-top: 0.95vw;
      @include respond(laptop) {
        padding-top: 40px;
      }
      @include respond(mobile) {
        // max-width: 100%;
        // padding: 0 getRem(16);
      }
      p {
        margin-bottom: 1em;
      }
    }
  }
}
</style>
