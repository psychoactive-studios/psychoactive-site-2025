<script setup lang="ts">
import ScooterOk from '~/components/ui/ScooterOk.vue';
import ScooterOk3D from '~/components/ui/ScooterOk3D.vue';
</script>

<template>
  <main class="scooterok">
    <!-- <ScooterOk
      shape="svg"
      :svg-urls="['/img/webflow-logo.svg', '/img/logo_sky.svg']"
      :morph-interval="5000"
    /> -->
    <ClientOnly>
      <ScooterOk3D
        :model-paths="[
          '/models/froggg2.glb',
          '/models/BarramundiFish.glb',
          '/models/frogg.glb',
          '/models/CesiumMan.glb',
        ]"
      />
    </ClientOnly>
  </main>
</template>

<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
.scooterok {
  @include flex-center;
  height: 100vh;
  // & > * {
  //   width: 50%;
  // }
}
</style>
