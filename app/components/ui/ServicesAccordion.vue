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
  onToggle: {
    type: Function,
    default: null,
  },
  preventClosingAll: {
    type: Boolean,
    default: false,
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
      if (props.preventClosingAll && activeIndices.value.length === 1) return;
      activeIndices.value = activeIndices.value.filter((i) => i !== index);
    } else {
      activeIndices.value.push(index);
    }
  } else {
    if (activeIndices.value.includes(index)) {
      if (props.preventClosingAll) return;
      activeIndices.value = [];
    } else {
      activeIndices.value = [index];
    }
  }
  props.onToggle?.(index);
};

defineExpose({
  toggle,
});

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
        class="accordion__header heading-h5--mobile"
        @click="toggle(index)"
      >
        <span class="accordion__title">{{ item.title }}</span>
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
            <div class="accordion__content_inner body--mobile">
              {{ item.description }}
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
  gap: getRem(24);

  &__item {
    &--active {
      .accordion__header {
        color: $color-foreground;
      }
    }
  }

  &__header {
    background: none;
    border: none;
    cursor: pointer;
    color: white(50);
    transition: color 0.5s ease;
  }

  &__title {
    margin-right: 1rem;
  }

  &__content-wrapper {
    overflow: hidden;
  }

  &__content {
    color: white(80);
    position: relative;
    margin-top: clamp(20px, 2.19vw, 42px);
    margin-bottom: clamp(20px, 2.19vw, 42px);
    padding-left: clamp(20px, 2.19vw, 42px);
    &::before,
    &::after {
      content: '';
      display: block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: $color-dots;
      position: absolute;
      z-index: 1;
    }
    &::before {
      top: 0;
      left: 0;
    }
    &::after {
      bottom: 0;
      left: 0;
    }
    &_inner {
      &::before {
        content: '';
        display: block;
        position: absolute;
        width: 1px;
        top: 0;
        left: 3px;
        bottom: 0;
        background-color: white(20);
      }
    }
  }
}
</style>
