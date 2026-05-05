<script setup>
import gsap from 'gsap';
import Header from '~/components/layout/Header.vue';
import ScrollProvider from '~/components/layout/ScrollProvider.vue';
import FixedTarget from '~/components/layout/FixedTarget.vue';
import ModalContainer from '~/components/ui/VideoPlayerModal.vue';
import useAudioManager from '~/composables/useAudioManager';
import useLoader from '~/composables/useLoader';
import { navigationData } from '~/data/navigationData';
import useNavigation from '~/composables/useNavigation';

const { loadSounds } = useAudioManager();
const { addResourceToLoad, resourceLoaded } = useLoader();
const { showLayoutElementsRequired } = useNavigation();

// Indicate that this component has a resource to load
addResourceToLoad(1);

const route = useRoute();

onMounted(() => {
  // Previously this fetched /video/preview_reel.mp4 as a blob and
  // exposed it via useVideoPlayer's `previewVideoData` ref. That
  // forced the entire 4.7MB MP4 to download before the page could
  // render, blocking LCP and tanking Lighthouse. Videos now stream
  // from Mux on demand (via useMuxVideo) so there's no blocking
  // resource to wait for here — we just resolve immediately so the
  // loader can finish.
  loadSounds();
  resourceLoaded();
});

watch(
  () => route.fullPath,
  (newPath) => {
    const isTargetWithLoader =
      newPath === '/' ||
      navigationData?.find((item) => item.url === newPath)?.loader;

    if (isTargetWithLoader) {      
      const layoutElements = gsap.utils.toArray([
        '#header-logo',
        '#header-navigation-button',
        // '#header-navigation-mobile',
        '#header-sound-button',
      ]);

      gsap.to(layoutElements, {
        scale: 0,
        duration: 0.8,
        ease: 'power4.in',
      });
      gsap.to('#header-navigation-mobile', {
        y: 64,
        opacity: 0,
        duration: 0.8,
        ease: 'power4.in',
      })
    } else {      
      showLayoutElementsRequired.value = true;
    }
  }
);
</script>
<template>
  <div>
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <Header />
    <ModalContainer />
    <FixedTarget />
    <ScrollProvider>
      <div id="main-content">
        <slot />
      </div>
    </ScrollProvider>
    <!--
      Black "cover" used by the hamburger-nav page transition.
      Sits between the menu (z-index 99) and the page (~0). Hidden by
      default. When the user clicks a link in the open menu, this is
      flipped to opacity 1 synchronously so the menu can lift away
      without ever revealing the outgoing page underneath. Fades back
      out once the new page has mounted. See `useNavigation.js` for
      the show/hide helpers and `utils/animations/transitions.js` for
      the fade-out call.
    -->
    <div id="nav-transition-cover" aria-hidden="true" />
  </div>
</template>

<style>
#header-logo,
#header-navigation-button,
#header-sound-button {
  scale: 0;
}
#nav-transition-cover {
  position: fixed;
  inset: 0;
  background-color: #101012; /* matches $color-background */
  z-index: 98;               /* just below .navigation (z-index: 99) */
  opacity: 0;
  pointer-events: none;
  will-change: opacity;
}
</style>
