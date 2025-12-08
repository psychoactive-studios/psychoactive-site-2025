<script setup>
import { stepperAnimation } from '~/utils/animations/services';
import gsap from 'gsap';

let ctx = null;

onMounted(async () => {
  ctx = gsap.context(() => {});
  await nextTick();
  stepperAnimation(ctx);
});

onUnmounted(() => {
  if (ctx) ctx.revert();
});
</script>

<template>
  <div>
    <div class="stepper__trigger_intro" />
    <div class="stepper__trigger_step-1" />
    <div class="stepper__trigger_step-2" />
    <div class="stepper__trigger_step-3" />
    <div class="stepper__trigger_step-4" />
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;

.stepper {
  &__trigger {
    &_intro {
      height: 150dvh;
    }
    &_step-1 {
      height: 150dvh;
    }
    &_step-2 {
      height: 150dvh;
    }
    &_step-3 {
      height: 150dvh;
    }
    &_step-4 {
      height: 150dvh;
    }
  }
}
</style>
