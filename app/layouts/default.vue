<script setup>
import Footer from '~/components/layout/Footer.vue';
import Header from '~/components/layout/Header.vue';
import ScrollProvider from '~/components/layout/ScrollProvider.vue';
import ModalContainer from '~/components/ui/VideoPlayerModal.vue';
</script>
<template>
  <div>
    <Header />
    <ModalContainer />
    <ScrollProvider>
      <slot />
      <Footer />
    </ScrollProvider>
  </div>
</template>
