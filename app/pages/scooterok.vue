<script setup lang="ts">
import ScooterOk from '~/components/ui/ScooterOk.vue';
</script>

<template>
  <main class="scooterok">
    <ScooterOk
      shape="svg"
      :svg-urls="['/img/webflow-logo.svg', '/img/logo_sky.svg']"
      :morph-interval="5000"
    />
  </main>
</template>

<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
.scooterok {
  @include flex-center;
  height: 100vh;
  & > * {
    width: 50%;
  }
}
</style>
