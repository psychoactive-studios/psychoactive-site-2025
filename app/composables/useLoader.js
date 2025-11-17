// composables/useLoader.js
import gsap from 'gsap';
import { ref } from 'vue';

const isFirstLoad = ref(true);
const isLoading = ref(true);
const resourcesToLoad = ref(0);
const loadedResources = ref(0);

export default function useLoader() {
  // methods for managing loading state

  function addResourceToLoad(quantity) {
    resourcesToLoad.value += quantity;
  }

  function resourceLoaded() {
    loadedResources.value += 1;
  }

  async function startLoading() {
    isLoading.value = true;
    await nextTick();
    const loaderElement = document.querySelector('#loader-logo');

    gsap.fromTo(
      loaderElement,
      { scale: 0 },
      {
        scale: 1,
        duration: 0.5,
        ease: 'power3.in',
      }
    );
  }

  function stopLoading() {
    isLoading.value = false;
  }

  // watch(loadedResources, (val) => {
  //   console.log('LOADER!', val, resourcesToLoad.value);
  // });

  return {
    isFirstLoad,
    isLoading,
    addResourceToLoad,
    resourcesToLoad,
    loadedResources,
    resourceLoaded,
    startLoading,
    stopLoading,
  };
}
