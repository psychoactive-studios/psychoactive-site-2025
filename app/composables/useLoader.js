// composables/useLoader.js
import { ref } from 'vue';

const isLoading = ref(true); // global state

export function useLoader() {
  // methods for managing loading state
  function startLoading() {
    isLoading.value = true;
  }

  function stopLoading() {
    isLoading.value = false;
  }

  return {
    isLoading,
    startLoading,
    stopLoading,
  };
}
