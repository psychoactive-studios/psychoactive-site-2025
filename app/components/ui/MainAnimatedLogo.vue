<script setup>
import lottie from 'lottie-web';
import loaderData from '~/assets/lottie/logo-V02.json';

const animationContainer = ref(null);
const animationInstance = ref(null);

const props = defineProps({
  loop: {
    type: Boolean,
    default: false,
  },
});

onMounted(() => {
  if (animationContainer.value) {
    animationInstance.value = lottie.loadAnimation({
      container: animationContainer.value,
      renderer: 'svg',
      loop: props.loop,
      autoplay: true,
      animationData: loaderData,
    });
  }
});

onBeforeUnmount(() => {
  if (animationInstance.value) {
    animationInstance.value.destroy();
  }
});

defineExpose({
  animationContainer,
  animationInstance,
});
</script>
<template>
  <div ref="animationContainer" class="logo" />
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables' as *;
.logo {
  width: 48px;
  height: auto;
  * {
    fill: $color-foreground;
  }
}
</style>
