// composables/useLoader.js
import { ref } from 'vue';

const isLoading = ref(true);
const resourcesToLoad = ref(0);
let loadedResources = ref(0);

export function useLoader() {
  // methods for managing loading state

  function addResourceToLoad(quantity) {
    resourcesToLoad.value += quantity;
  }

  function resourceLoaded() {
    loadedResources.value += 1;
  }

  function startLoading() {
    isLoading.value = true;
  }

  function stopLoading() {
    isLoading.value = false;
  }

  // watch(loadedResources, (val) => {
  //   console.log('LOADER!', val, resourcesToLoad.value);
  // });

  return {
    isLoading,
    addResourceToLoad,
    resourcesToLoad,
    loadedResources,
    resourceLoaded,
    startLoading,
    stopLoading,
  };
}
