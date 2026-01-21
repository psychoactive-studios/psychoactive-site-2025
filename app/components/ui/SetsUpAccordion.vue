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
        <span class="accordion__header_icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="0.5"
              y="0.5"
              width="47"
              height="47"
              rx="23.5"
              stroke="#101012"
              stroke-opacity="0.1"
            />
            <path
              d="M24 29C25.6569 29 27 30.3431 27 32C27 33.6569 25.6569 35 24 35C22.3431 35 21 33.6569 21 32C21 30.3431 22.3431 29 24 29Z"
              fill="black"
            />
            <path
              d="M16 21C17.6569 21 19 22.3431 19 24C19 25.6569 17.6569 27 16 27C14.3431 27 13 25.6569 13 24C13 22.3431 14.3431 21 16 21Z"
              fill="black"
            />
            <path
              d="M32 21C33.6569 21 35 22.3431 35 24C35 25.6569 33.6569 27 32 27C30.3431 27 29 25.6569 29 24C29 22.3431 30.3431 21 32 21Z"
              fill="black"
            />
            <path
              d="M24 13C25.6569 13 27 14.3431 27 16C27 17.6569 25.6569 19 24 19C22.3431 19 21 17.6569 21 16C21 14.3431 22.3431 13 24 13Z"
              fill="black"
            />
          </svg>
        </span>
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
        transform: rotate(45deg);
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
      width: 48px;
      height: 48px;
      flex-shrink: 0;
      transition: transform 0.5s ease-in-out;
      position: absolute;
      right: max(0.833333vw, 16px);
      top: 0;
      @include respond(mobile) {
        right: 0;
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
        svg path {
          animation: flicker-effect-3 0.5s forwards;
          &:nth-child(2) {
            animation-delay: 0.2s;
          }
          &:nth-child(3) {
            animation-delay: 0.3s;
          }
          &:nth-child(4) {
            animation-delay: 0.4s;
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
