<template>
  <div id="services-list-video-teleport" />
</template>
<style scoped lang="scss">
.services-list__video {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40%;
  aspect-ratio: 1;
  margin: auto;
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    clip-path: circle(50% at 50% 50%);
  }
}
</style>
