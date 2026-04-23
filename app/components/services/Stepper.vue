<script setup>
import { stepperAnimation } from '~/utils/animations/services';
import gsap from 'gsap';
import { stepperTitlesData } from '~/data/servicesData';
import WebflowBlackLabel from '../ui/WebflowBlackLabel.vue';

let ctx = null;

onMounted(async () => {
  ctx = gsap.context(() => {});
  await nextTick();
  stepperAnimation(ctx);
});

onUnmounted(() => {
  if (ctx) ctx.revert();
});
</script>

<template>
  <div class="stepper">
    <div class="container stepper__mobile">
      <div class="stepper__mobile-steps">
        <div
          v-for="step in stepperTitlesData"
          :key="step.number"
          class="stepper__mobile-step"
        >
          <NuxtLink
            v-if="step.number === '03'"
            to="/webflow-enterprise-agency"
            class="stepper__mobile-step_label"
          >
            <WebflowBlackLabel />
          </NuxtLink>
          <div class="stepper__mobile-step_video">
            <video
              class="video"
              :src="step.src"
              autoplay
              loop
              muted
              playsinline
            />
          </div>
          <h2 class="stepper__mobile-step_title" :data-number="step.number">
            {{ step.title }}
          </h2>
          <div class="stepper__mobile-step_description">
            {{ step.description }}
          </div>
          <div class="stepper__mobile-step_list">
            <ul>
              <li v-for="item in step.list" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="stepper__trigger stepper__trigger_intro" />
    <!-- Anchor IDs for phase-link navigation from the Services intro.
         The trigger elements are where each phase is fully revealed,
         so linking to `#phase-N` lands the user on that phase's content. -->
    <div id="phase-1" class="stepper__trigger stepper__trigger_step-1" />
    <div id="phase-2" class="stepper__trigger stepper__trigger_step-2" />
    <div id="phase-3" class="stepper__trigger stepper__trigger_step-3" />
    <div id="phase-4" class="stepper__trigger stepper__trigger_step-4" />
  </div>
</template>

<style scoped lang="scss">
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/variables' as *;

.stepper {
  @include respond(mobile) {
    background-color: $color-foreground;
    padding-top: 64px;
    padding-bottom: 120px;
  }
  &__mobile {
    display: none;
    @include respond(mobile) {
      display: block;
    }
  }
  .stepper__mobile-steps {
    display: flex;
    flex-direction: column;
    gap: 64px;
  }

  .stepper__mobile-step {
    color: $color-background;
    &_label {
      margin-bottom: 24px;
      display: flex;
      justify-content: center;
      :deep(.label-border) {
        border-color: rgba(0, 0, 0, 0.2);
      }
      :deep(.label-background) {
        fill: rgba(0, 0, 0, 0.1);
      }
      :deep(.char) {
        fill: $color-background;
      }
      :deep(.shape) {
        fill: $color-background;
      }
    }
    &_video {
      margin: 0 32px;
      aspect-ratio: 1;
      position: relative;
      clip-path: circle(50% at 50% 50%);
      &::before {
        content: '';
        display: block;
        width: 100%;
        height: 100%;
        background: url('/img/video-player-dots-overlay-mobile-2.png') repeat
          center center;
        position: absolute;
        inset: 0;
      }

      .video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    &_title {
      margin-top: 40px;
      font-size: max(8.53333vw, 32px);
      font-style: normal;
      font-weight: 400;
      line-height: 121%;
      letter-spacing: -0.04em;
      position: relative;
      &::before {
        content: attr(data-number);
        font-family: 'RoobertMono';
        font-size: max(3.08vw, 12px);
        font-style: normal;
        font-weight: 500;
        line-height: 72%;
        text-transform: uppercase;
        position: absolute;
        bottom: calc(100% + 4px);
        left: 0;
      }
    }
    &_description {
      margin-top: 24px;
      font-size: 1rem;
      font-style: normal;
      font-weight: 400;
      line-height: 140%;
    }
    &_list {
      margin-top: 24px;
      padding: 16px 0 16px 26px;
      position: relative;
      &::before,
      &::after {
        content: '';
        display: block;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background-color: $color-dots;
        position: absolute;
        left: 0;
      }
      &::before {
        top: 0;
      }
      &::after {
        bottom: 0;
      }
      ul {
        font-size: 1rem;
        font-style: normal;
        font-weight: 400;
        line-height: 140%;
        &::before {
          content: '';
          display: block;
          width: 1px;
          background-color: $color-background;
          position: absolute;
          top: 3px;
          bottom: 3px;
          left: 2px;
          opacity: 0.2;
        }
      }
    }
  }

  &__trigger {
    @include respond(mobile) {
      display: none;
    }
    &_intro {
      height: 150dvh;
    }
    &_step-1 {
      height: 150dvh;
    }
    &_step-2 {
      height: 150dvh;
    }
    &_step-3 {
      height: 150dvh;
    }
    // Taller than the others so the "slow scroll" stepper effect stays
    // active until the END of Growth & Partnership. Previously ended as
    // soon as step 4 began, which made the last phase feel rushed.
    &_step-4 {
      height: 300dvh;
    }
  }
}
</style>
