<script setup>
import gsap from 'gsap';
import useAudioManager from '~/composables/useAudioManager';

const cursor = ref(null);
let ctx;

const { isSoundApproved } = useAudioManager();

onMounted(() => {
  ctx = gsap.context(() => {
    gsap.set(cursor.value, {
      visibility: 'visible',
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.75,
    });

    gsap
      .timeline()
      .from('.cursor__sound-icon', {
        scale: 0,
        duration: 0.2,
        ease: 'power2.in',
      })
      .from(
        '.cursor__text',
        {
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in',
        },
        '<+=0.1'
      );

    const xTo = gsap.quickTo(cursor.value, 'x', {
      duration: 0.3,
      ease: 'power3',
    });
    const yTo = gsap.quickTo(cursor.value, 'y', {
      duration: 0.3,
      ease: 'power3',
    });

    const moveCursor = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    window.addEventListener('mousemove', moveCursor);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, cursor.value);
});

onUnmounted(() => {
  ctx?.revert();
});

const handleClick = () => {
  ctx.add(() => {
    gsap
      .timeline()
      .to('.cursor__sound-icon', {
        scale: 0,
        duration: 0.2,
        ease: 'power2.in',
      })
      .to(
        '.cursor__text',
        {
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in',
        },
        '<+=0.1'
      )
      .add(() => (isSoundApproved.value = true));
  });
};
</script>

<template>
  <div id="sound-cursor" ref="cursor" class="cursor" @click="handleClick">
    <div class="cursor__sound-icon">
      <span
        v-for="i in 6"
        :key="i"
        :class="['cursor__sound-icon_line', `line--${i}`]"
      />
    </div>
    <div class="cursor__text subheader-small">CLICK TO ENABLE SOUND</div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables' as *;
@use '~/assets/styles/functions' as *;
.cursor {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 100;
  visibility: hidden;

  &__sound-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2px;
    width: 48px;
    height: 48px;
    border: 1px solid white(20);
    border-radius: 50%;

    &_line {
      width: 1px;
      height: 2px;
      background-color: $color-foreground;
      display: block;
      animation: sound-wave ease-in-out infinite alternate;
    }
  }
  &__text {
    opacity: 0.5;
  }
}

@keyframes sound-wave {
  0% {
    transform: scaleY(1);
  }
  100% {
    transform: scaleY(8);
  }
}

.line--1 {
  animation-duration: 0.4s;
}
.line--2 {
  animation-duration: 0.75s;
}
.line--3 {
  animation-duration: 0.55s;
}
.line--4 {
  animation-duration: 0.6s;
}
.line--5 {
  animation-duration: 0.8s;
}
.line--6 {
  animation-duration: 0.45s;
}
</style>
