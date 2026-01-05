<script setup lang="ts">
import LetsTalkScene from '~/components/ui/LetsTalkScene.vue';
</script>

<template>
  <main class="scooterok">
    <LetsTalkScene
      shape="svg"
      :svg-urls="[
        '/img/frog_steps/frog01.svg',
        '/img/frog_steps/frog02.svg',
        '/img/frog_steps/frog03.svg',
        '/img/frog_steps/frog04.svg',
        '/img/frog_steps/frog05.svg',
      ]"
      :morph-interval="5000"
    />
    <!-- <ClientOnly>
      <LetsTalk3DScene
        :model-paths="[
          '/models/scalefrog.glb',
          '/models/BarramundiFish.glb',
          '/models/frogg.glb',
          '/models/CesiumMan.glb',
        ]"
      />
    </ClientOnly> -->
  </main>
</template>

<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
.scooterok {
  @include flex-center;
  height: 100vh;
  & > * {
    width: 75%;
  }
}
</style>
