<script setup>
import Footer from '~/components/layout/Footer.vue';
import Header from '~/components/layout/Header.vue';
import ScrollProvider from '~/components/layout/ScrollProvider.vue';
</script>
<template>
  <div>
    <Header />
    <ScrollProvider>
      <slot />
      <Footer />
    </ScrollProvider>
  </div>
</template>
