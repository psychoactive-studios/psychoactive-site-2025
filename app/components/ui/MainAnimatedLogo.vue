<script setup>
import gsap from 'gsap';
import lottie from 'lottie-web';
import loaderData from '~/assets/lottie/logo-V02.json';
import useLoader from '~/composables/useLoader';

const { resourcesToLoad, loadedResources, stopLoading, isLoading } =
  useLoader();

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
    animationInstance.value.addEventListener('loopComplete', onLoopComplete);
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

// Handle loop complete event
const onLoopComplete = () => {
  if (resourcesToLoad.value === loadedResources.value && isLoading.value) {
    console.log('onLoopComplete!!!', isLoading.value);
    const loaderElement = document.querySelector('#loader-logo');
    gsap.to(loaderElement, {
      scale: 0,
      duration: 0.5,
      ease: 'power3.out',
      delay: 0.3,
      onComplete: stopLoading,
    });
  }
};
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
