<script setup>
import { ref } from 'vue';
import gsap from 'gsap';

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
  if (props.multiple) {
    if (activeIndices.value.includes(index)) {
      activeIndices.value = activeIndices.value.filter((i) => i !== index);
    } else {
      activeIndices.value.push(index);
    }
  } else {
    if (activeIndices.value.includes(index)) {
      activeIndices.value = [];
    } else {
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
      <button class="accordion__header" @click="toggle(index)">
        <span class="accordion__title">{{ item.title }}</span>
        <span class="accordion__header_icon">
          <img src="/img/icon-accordion-button.svg" :alt="item.title" />
        </span>
        <div class="accordion__header_border">
          <div class="accordion__header_overlay" />
        </div>
      </button>

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
          <div class="accordion__content">
            <div class="accordion__content_inner">
              {{ item.content }}
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;

.accordion {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: getRem(32);

  &__item {
    &--active {
      .accordion__header_icon {
        transform: rotate(45deg);
      }
      .accordion__header_overlay {
        opacity: 1;
      }
      .accordion__header {
      }
    }
  }

  &__header {
    background: none;
    border: none;
    cursor: pointer;
    font-size: clamp(32px, 2.1vw, 40px);
    font-style: normal;
    font-weight: 400;
    line-height: 112.5%;
    color: white(50);
    transition: color 0.5s ease-in-out;
    color: $color-background;
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding-bottom: 42px;
    padding-right: 32px;
    position: relative;
    &_icon {
      transition: transform 0.5s ease-in-out;
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
  }

  &__title {
    margin-right: 1rem;
  }

  &__content-wrapper {
    overflow: hidden;
  }

  &__content {
    font-size: getRem(24);
    font-style: normal;
    font-weight: 400;
    line-height: 125%;
    padding-top: getRem(48);
    &_inner {
      max-width: 60%;
      margin: auto;
    }
  }
}
</style>
