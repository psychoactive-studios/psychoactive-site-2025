<script setup>
import Circle from '../ui/Circle.vue';
import PlusIcon from '~/assets/icons/icon-plus.svg';
// Particle scene rebuild — V2 has cleaner architecture, working grid
// morph, and a click "blow up" effect. To revert to the original,
// swap the next line back to: '../ui/ServicesHero3DScene.vue'.
import ServicesHero3DScene from '../ui/ServicesHero3DSceneV2.vue';
import gsap from 'gsap';
import useVideoPlayer from '~/composables/useVideoPlayer';
import useLoader from '~/composables/useLoader';

import {
  heroInitSplitText,
  heroInitAnimation,
  heroScrollAnimation,
} from '~/utils';
import ShowreelHoverPreview from '../ui/ShowreelHoverPreview.vue';
import ShowreelHoverBackground from '../ui/ShowreelHoverBackground.vue';
// DEV-ONLY: tuner panel for the morph shader. Delete this import + the
// reactive refs below + the <ShowreelMorphTuner> block in the template
// when shipping.
import ShowreelMorphTuner from '../ui/ShowreelMorphTuner.vue';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useScrollSmoother from '~/composables/useScrollSmoother';
import useAudioManager from '~/composables/useAudioManager';
import HeroPillLink from '../ui/HeroPillLink.vue';

const { disableScroll, scrollSmoother } = useScrollSmoother();
const { onPlayerOpen, isOpen } = useVideoPlayer();
const { playInteractionSound, isSoundApproved, hasInteracted } =
  useAudioManager();
const { isLoading } = useLoader();

const container = ref(null);
const isPlaying = ref(true);
let ctx;

// --- DEV-ONLY morph tuner state -----------------------------------------
// Defaults match the props on ShowreelHoverPreview. Delete this block when
// the look is locked in, and hard-code any final values back into the
// <ShowreelHoverPreview> tag below.
const isDev = import.meta.dev;
const MORPH_DEFAULTS = {
  noiseScale: 2.2,
  displacement: 0.32,
  aberration: 0.033,
  hueShift: 0.5,
  morphDuration: 1.4,
  // click-pulse defaults
  clickAmplify: 1.05,
  clickScanline: 0.002,
  clickRise: 0.07,
  clickFall: 0.9,
};
const morphNoiseScale = ref(MORPH_DEFAULTS.noiseScale);
const morphDisplacement = ref(MORPH_DEFAULTS.displacement);
const morphAberration = ref(MORPH_DEFAULTS.aberration);
const morphHueShift = ref(MORPH_DEFAULTS.hueShift);
const morphDuration = ref(MORPH_DEFAULTS.morphDuration);
const morphForceMix = ref(null);
const morphClickAmplify = ref(MORPH_DEFAULTS.clickAmplify);
const morphClickScanline = ref(MORPH_DEFAULTS.clickScanline);
const morphClickRise = ref(MORPH_DEFAULTS.clickRise);
const morphClickFall = ref(MORPH_DEFAULTS.clickFall);

function resetMorphDefaults() {
  morphNoiseScale.value = MORPH_DEFAULTS.noiseScale;
  morphDisplacement.value = MORPH_DEFAULTS.displacement;
  morphAberration.value = MORPH_DEFAULTS.aberration;
  morphHueShift.value = MORPH_DEFAULTS.hueShift;
  morphDuration.value = MORPH_DEFAULTS.morphDuration;
  morphForceMix.value = null;
  morphClickAmplify.value = MORPH_DEFAULTS.clickAmplify;
  morphClickScanline.value = MORPH_DEFAULTS.clickScanline;
  morphClickRise.value = MORPH_DEFAULTS.clickRise;
  morphClickFall.value = MORPH_DEFAULTS.clickFall;
  bgStrength.value = HOLOGRAM_DEFAULTS.strength;
  bgVignette.value = HOLOGRAM_DEFAULTS.vignette;
  bgAberration.value = HOLOGRAM_DEFAULTS.aberration;
  bgScanlineStrength.value = HOLOGRAM_DEFAULTS.scanlineStrength;
  bgScanRollSpeed.value = HOLOGRAM_DEFAULTS.scanRollSpeed;
  bgBarrel.value = HOLOGRAM_DEFAULTS.barrel;
}

// --- Hologram background state ------------------------------------------
const HOLOGRAM_DEFAULTS = {
  strength: 0.46,
  vignette: 0.9,
  aberration: 0.033,
  scanlineStrength: 0.23,
  scanRollSpeed: 0.06,
  barrel: 0.85,
};
const bgStrength = ref(HOLOGRAM_DEFAULTS.strength);
const bgVignette = ref(HOLOGRAM_DEFAULTS.vignette);
const bgAberration = ref(HOLOGRAM_DEFAULTS.aberration);
const bgScanlineStrength = ref(HOLOGRAM_DEFAULTS.scanlineStrength);
const bgScanRollSpeed = ref(HOLOGRAM_DEFAULTS.scanRollSpeed);
const bgBarrel = ref(HOLOGRAM_DEFAULTS.barrel);
// Dev-only: force the hologram on so you can see + tune it without
// having to hover the play button.
const bgForceVisible = ref(false);

// Ref to ShowreelHoverPreview so the tuner can fire the click-pulse
// directly without having to actually click play (which opens the modal).
const showreelHoverPreviewRef = ref(null);
function firePulse() {
  showreelHoverPreviewRef.value?.triggerClickPulse();
}

// Ref to the dot-sphere (ServicesHero3DScene) so we can morph particles
// to a grid on play-button hover and fire a ripple wave on click.
const hero3dRef = ref(null);

// Hologram fade — driven by hover events from the preview. GSAP tween
// runs against a plain object (more reliable than tweening a Vue ref
// directly) and syncs the ref via onUpdate so the prop is reactive.
const bgMix = ref(0);
const bgMixState = { value: 0 };

function tweenBgMix(target, duration, ease) {
  gsap.to(bgMixState, {
    value: target,
    duration,
    ease,
    overwrite: true,
    onUpdate: () => { bgMix.value = bgMixState.value; },
  });
}

function onPreviewHoverStart() {
  tweenBgMix(1, morphDuration.value * 1.1, 'power2.out');
  // Morph the dot sphere to a grid as the user hovers the play button.
  hero3dRef.value?.setFormation(1, 1.0);
}
function onPreviewHoverEnd() {
  tweenBgMix(0, morphDuration.value * 0.9, 'power2.in');
  // Morph back to the sphere on hover-out.
  hero3dRef.value?.setFormation(0, 1.4);
}

// MODAL CLOSE: when the user clicks close, isOpen flips to false
// synchronously at the very start of onPlayerClose (well before the
// rectangle's un-flip animation kicks off). The un-flip takes ~0.8s,
// and during that window the hologram is still fully visible behind
// the shrinking rectangle. We need it to fade FAST so it's gone by
// the time the rectangle lands — otherwise it lingers as a "ghost
// fade" for ~1.26s after the rectangle is back in place.
//
// 0.45s gets the hologram to ~0 right around when the modal box has
// faded out (0.5s) and well before the un-flip completes (0.8s),
// hidden behind the still-fading modal opacity.
watch(isOpen, (newVal, oldVal) => {
  if (oldVal === true && newVal === false) {
    tweenBgMix(0, 0.45, 'power2.out');
    hero3dRef.value?.setFormation(0, 0.6);
  }
});

onMounted(() => {
  if (container.value) {
    ctx = gsap.context(() => {}, container.value);

    heroInitSplitText();
    heroScrollAnimation(ctx, isPlaying);

    // heroInitAnimation(ctx, scrollSmoother);
  }
});

onUnmounted(() => {
  ctx.revert();
});

watch(isLoading, (newVal) => {
  if (!newVal) {
    heroInitAnimation(ctx, scrollSmoother);
    if (isSoundApproved.value && hasInteracted.value)
      playInteractionSound('home-load');
  }
});

// Refs for the showreel transition overlay — a black div teleported to
// body that fades in/out around the click→expand sequence to smooth
// the jump from hero into fullscreen showreel.
const transitionOverlayRef = ref(null);

// Tunable transition timings. The existing onPlayerOpen animation runs:
//   t=0-0.5   controls hide
//   t=0.3-1.3 rectangle scale + Flip (the visible "scale up")
//   t=1.0-1.4 modal fades in
//   t=1.0     Mux .play()
// We run the overlay fade-in CONCURRENTLY with the scale-up so the user
// sees "rectangle scales up as the screen fades to black" — exactly what
// Andrew described. scrollSmoother.scrollTo runs inside the opaque hold
// (well after the Flip ends) so it can't fight the Flip and cause
// visible jumps/slides.
const TRANSITION = {
  fadeIn: 1.2,     // runs alongside the existing 1s scale + Flip
  hold: 0.5,       // peak-black window; covers scrollTo + modal settle
  fadeOut: 1.0,    // gradual reveal of the now-ready showreel
};

const onPlayVideoHandler = (playerContainerRef) => {
  // Get ScrollTrigger by ID
  const trigger = ScrollTrigger.getById('homepage-hero-scrolltrigger');

  // Calculate the target scroll position based on progress
  const y = trigger?.end;

  const overlay = transitionOverlayRef.value;
  if (!overlay) {
    // Safety: if the ref isn't bound for any reason, fall back to the
    // original behaviour so the click still does something.
    // eslint-disable-next-line no-console
    console.warn('[transition] overlay ref not bound — falling back');
    disableScroll();
    onPlayerOpen(playerContainerRef);
    setTimeout(() => {
      scrollSmoother.value.scrollTo(y, { immediate: true, lock: true, force: true });
    }, 2000);
    return;
  }

  // Build the timeline using absolute time positions — this avoids the
  // empty-tween "hold" hack which GSAP can collapse to zero duration.
  const fadeIn = TRANSITION.fadeIn;
  const hold = TRANSITION.hold;
  const fadeOut = TRANSITION.fadeOut;
  const tCoverFull = fadeIn;             // overlay fully opaque
  const tRevealStart = fadeIn + hold;    // start fading overlay back out

  const tl = gsap.timeline();

  // 0. Fire a ripple wave through the dot sphere at click time. The
  //    rectangle's own click-pulse fires inside the preview component;
  //    this is the broader page-level shockwave.
  hero3dRef.value?.fireRipple(0, 0, 0);

  // 1. CONCURRENTLY: kick off the existing modal scale + Flip AND start
  //    fading the overlay in. The user sees the rectangle scaling up
  //    AND the hologram (both at full strength) while the screen darkens
  //    around them.
  tl.call(() => {
    disableScroll();
    onPlayerOpen(playerContainerRef);
  }, null, 0);

  tl.to(overlay, {
    opacity: 1,
    duration: fadeIn,
    ease: 'power2.in',
  }, 0);

  // 2. Snap the scroll AFTER the existing Flip finishes (~t=1.3 inside
  //    onPlayerOpen). Doing it earlier causes the Flip to reposition
  //    mid-flight and the rectangle appears to slide. With fadeIn=1.2 +
  //    hold*0.5=0.25 → fires at t=1.45, well after the Flip is done.
  tl.call(() => {
    scrollSmoother.value.scrollTo(y, {
      immediate: true,
      lock: true,
      force: true,
    });
  }, null, tCoverFull + hold * 0.5);

  // 3. Fade the overlay back out, revealing the fullscreen showreel. By
  //    tRevealStart (t=1.7) the modal's own opacity tween (ends at ~1.4)
  //    is well done and Mux is playing.
  //
  //    NOTE: we deliberately do NOT explicitly tween bgMix to 0 anywhere
  //    in this timeline. The hologram should stay full-strength right
  //    through the click + expand. It's hidden behind the opaque overlay
  //    during peak-black, then naturally hidden behind the fullscreen
  //    showreel modal (z-index 100 > hologram z-index 0) during reveal
  //    and playback. On modal close, ShowreelHoverPreview's watch on
  //    currentPreview emits 'hover-end' if the cursor has moved away,
  //    which fades the hologram back out cleanly.
  tl.to(overlay, {
    opacity: 0,
    duration: fadeOut,
    ease: 'power2.out',
  }, tRevealStart);
};

const onScrollDownHandler = (e) => {
  playInteractionSound('click-1');
  playInteractionSound('menu-close', 100);
  // Get ScrollTrigger by ID
  const trigger = ScrollTrigger.getById('homepage-hero-scrolltrigger');
  if (!scrollSmoother.value || !trigger) return;
  // Check if scrollSmoother and trigger exist
  const y = trigger?.end;
  gsap
    .timeline()
    .set(e.currentTarget, { pointerEvents: 'none' })
    .set(e.currentTarget, { clearProps: 'pointerEvents' }, '+=1.5');

  scrollSmoother.value.scrollTo(y, {
    duration: 1.5,
    force: true,
    easing: (x) =>
      x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2,
  });
};
</script>

<template>
  <div ref="container" class="hero">
    <!--
      Black transition overlay — covers everything (hero, rectangle,
      hologram, modal) during the click → expand → reveal sequence so
      the jump into the fullscreen showreel feels like a real transition
      instead of an abrupt swap. Teleported to <body> with a z-index
      above the modal so it sits on top during the swap.
    -->
    <Teleport to="body">
      <!--
        Inline styles instead of scoped CSS — Teleport + scoped CSS can be
        finicky and we absolutely need opacity: 0 to be the initial state.
        Background is pure #000000 to match $color-black used by the
        modal's .player__preview (VideoPlayerModal.vue:363) so our overlay
        and the modal's own black blend seamlessly through the reveal.
      -->
      <div
        ref="transitionOverlayRef"
        aria-hidden="true"
        style="
          position: fixed;
          inset: 0;
          background-color: #000000;
          z-index: 110;
          opacity: 0;
          pointer-events: none;
          will-change: opacity;
        "
      />
    </Teleport>

    <div class="hero__intro">
      <!--
        Hologram backdrop. Lives INSIDE .hero__intro so it scrolls /
        gets pinned along with the rectangle. Texture source is the
        Mux preview_reel asset, streamed via HLS (see useMuxVideo).
      -->
      <ShowreelHoverBackground
        playback-id="L4cwV1O9pQPNJ1px400NV3sNGpNbbX6V3rbrybMq9a6A"
        :mix="bgMix"
        center-target=".video-player.homehero-prepared"
        :strength="bgStrength"
        :vignette="bgVignette"
        :aberration="bgAberration"
        :scanline-strength="bgScanlineStrength"
        :scan-roll-speed="bgScanRollSpeed"
        :barrel="bgBarrel"
        :force-visible="bgForceVisible"
      />

      <!--
        Bandaid: solid black gradient sitting on top of the hologram
        at the very bottom of the hero. As the next section
        (.homepage__content) slides up to meet the hero, the cut-off
        line lands inside this gradient — the bottom of the gradient
        is solid #101012, exactly the section's background, so the
        join is invisible. Only ~80px tall, so it doesn't intrude on
        anything visible.
      -->
      <div class="hero__intro__bottom-fade" aria-hidden="true" />

      <section class="hero__intro_wrapper">
        <div class="homehero-3d-scene--wrapper">
          <ServicesHero3DScene
            ref="hero3dRef"
            :is-playing="isPlaying"
            class="homehero-3d-scene"
          />
          <!-- <HomeHero3DScene class="homehero-3d-scene" /> -->
        </div>
        <div class="scene">
          <div class="circle--wrapper">
            <Circle class="circle" />
          </div>
          <div class="psychoactive">
            <div class="psychoactive__text subheader">psychoactive®</div>
            <div class="psychoactive__horizontal">
              <PlusIcon class="psychoactive__icon" />
            </div>
            <div class="psychoactive__vertical">
              <PlusIcon class="psychoactive__icon" />
            </div>
          </div>
          <div class="top-text">
            <div class="top-text__agency subheader">
              AI-era design<br>
              and development<br>
              for ambitious brands
            </div>
            <div class="top-text__innovation display-large grey-text">
              innovate
            </div>
            <!-- Hero CTA — recreates the original WebflowBlackLabel
                 pill button style (border, background fade, random
                 char opacity stagger, hover + click sounds) but with
                 editable text. -->
            <HeroPillLink
              href="/contact"
              label="Start a project"
              class="top-text__cta"
            />
          </div>
          <div class="center">
            <div class="center__line" />
            <div class="center__part center__part--left">
              <div class="center__part_dot" />
              <div class="center__text subheader-small">-41.2925°</div>
            </div>
            <div class="center__part center__part--right">
              <div class="center__part_dot" />
              <div class="center__text subheader-small">174.7783°</div>
            </div>
            <div class="center__text center__text--play subheader-small">
              PLAY REEL
            </div>
            <div class="center__text center__text--time subheader-small">
              01:16 SEC
            </div>
          </div>
          <button
            class="dots-arrow"
            aria-label="Scroll down"
            @click="onScrollDownHandler"
            @mouseenter="() => playInteractionSound('scroll-btn-hover', 100)"
          >
            <div class="dots-arrow__icon">
              <span class="dots-arrow__icon_dot dots-arrow__icon_dot--1" />
              <span class="dots-arrow__icon_dot dots-arrow__icon_dot--2" />
              <span class="dots-arrow__icon_dot dots-arrow__icon_dot--3" />
            </div>
            <div class="dots-arrow__horizontal">
              <PlusIcon class="dots-arrow__plus" />
            </div>
            <div class="dots-arrow__vertical">
              <PlusIcon class="dots-arrow__plus" />
            </div>
            <PlusIcon class="dots-arrow__plus dots-arrow__plus--br" />
          </button>

          <ShowreelHoverPreview
            ref="showreelHoverPreviewRef"
            class="video-player homehero-prepared"
            preview-playback-id="L4cwV1O9pQPNJ1px400NV3sNGpNbbX6V3rbrybMq9a6A"
            preview-hover-playback-id="tpkS6goFnp12NeBrOdVAaFVPzCIVogWA0201801L01ZoMUg"
            src="https://vjs.zencdn.net/v/oceans.mp4"
            :custom-handler="onPlayVideoHandler"
            aspect-ratio="2.22"
            :noise-scale="morphNoiseScale"
            :displacement="morphDisplacement"
            :aberration="morphAberration"
            :hue-shift="morphHueShift"
            :morph-duration="morphDuration"
            :force-mix="morphForceMix"
            :click-amplify="morphClickAmplify"
            :click-scanline="morphClickScanline"
            :click-rise="morphClickRise"
            :click-fall="morphClickFall"
            @mouseenter="playInteractionSound('showreel-hover-3', 200)"
            @focus="playInteractionSound('showreel-hover-3', 200)"
            @hover-start="onPreviewHoverStart"
            @hover-end="onPreviewHoverEnd"
          />
          <div class="bottom-text">
            <div class="bottom-text__imagine display-large grey-text">
              Imagine
            </div>
            <div class="bottom-text__scale display-3xl">
              scale
              <div class="bottom-text__scale-arrows">
                <span>&larr;</span><span>&rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    <!-- <div class="hero__player" /> -->

    <!-- DEV-ONLY morph tuner. Delete this block when shipping. -->
    <ShowreelMorphTuner
      v-if="isDev"
      :noise-scale="morphNoiseScale"
      :displacement="morphDisplacement"
      :aberration="morphAberration"
      :hue-shift="morphHueShift"
      :morph-duration="morphDuration"
      :force-mix="morphForceMix"
      :bg-strength="bgStrength"
      :bg-vignette="bgVignette"
      :bg-aberration="bgAberration"
      :bg-scanline-strength="bgScanlineStrength"
      :bg-scan-roll-speed="bgScanRollSpeed"
      :bg-barrel="bgBarrel"
      :bg-force-visible="bgForceVisible"
      :click-amplify="morphClickAmplify"
      :click-scanline="morphClickScanline"
      :click-rise="morphClickRise"
      :click-fall="morphClickFall"
      @update:noise-scale="morphNoiseScale = $event"
      @update:displacement="morphDisplacement = $event"
      @update:aberration="morphAberration = $event"
      @update:hue-shift="morphHueShift = $event"
      @update:morph-duration="morphDuration = $event"
      @update:force-mix="morphForceMix = $event"
      @update:bg-strength="bgStrength = $event"
      @update:bg-vignette="bgVignette = $event"
      @update:bg-aberration="bgAberration = $event"
      @update:bg-scanline-strength="bgScanlineStrength = $event"
      @update:bg-scan-roll-speed="bgScanRollSpeed = $event"
      @update:bg-barrel="bgBarrel = $event"
      @update:bg-force-visible="bgForceVisible = $event"
      @update:click-amplify="morphClickAmplify = $event"
      @update:click-scanline="morphClickScanline = $event"
      @update:click-rise="morphClickRise = $event"
      @update:click-fall="morphClickFall = $event"
      @fire-pulse="firePulse"
      @reset="resetMorphDefaults"
    />
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/mixins' as *;
@use '~/assets/styles/functions' as *;
@use '~/assets/styles/variables' as *;

.hero__player {
  * {
    fill: #fff;
  }
}
.hero {
  @include respond(mobile) {
    display: none;
  }
  &__intro {
    height: 100svh;
    display: flex;
    flex-direction: column;
    padding: 0;
    // Anchor for the absolute-positioned ShowreelHoverBackground
    // (which used to be position:fixed at body — see component docs).
    position: relative;

    &__bottom-fade {
      // Bandaid for the hologram cut-off where .homepage__content
      // meets the hero. Sits absolute at the bottom of .hero__intro,
      // gradient transparent → opaque #101012 over 80px. Bottom edge
      // of the gradient lines up with the section join, masking it.
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 80px;
      background: linear-gradient(
        to bottom,
        rgba(16, 16, 18, 0) 0%,
        rgba(16, 16, 18, 1) 100%
      );
      pointer-events: none;
      z-index: 1; // above the hologram (z-index 0), below content
    }
    // padding: 0 0 48px 0;
    &_wrapper {
      flex-grow: 1;
      position: relative;
      @include flex-center;
      // padding-left: clamp(88px, 8vw, 160px);
      // padding-right: clamp(88px, 8vw, 160px);
      padding-left: 160px;
      padding-right: 160px;
      @include respond(portrait) {
        padding-top: 160px;
        padding-bottom: 48px;
        padding-left: 24px;
        padding-right: 24px;
      }
      @include respond(mobile) {
        padding-top: 27px;
        padding-bottom: 24px;
      }
      .homehero-3d-scene--wrapper {
        position: absolute;
        z-index: 1;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        height: 100%;
        @include respond(portrait) {
          height: auto;
          aspect-ratio: 1;
        }
        @include respond(mobile) {
          display: none;
        }
        .homehero-3d-scene {
          width: 100%;
          height: 100%;
          will-change: transform;
        }
      }
      .scene {
        aspect-ratio: 2;
        width: 100%;
        position: relative;
        z-index: 1;
        will-change: transform;
        pointer-events: none;
        @include respond(portrait) {
          aspect-ratio: auto;
          height: 100%;
        }
        @include respond(mobile) {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          padding-top: 24px;
        }
        .psychoactive {
          position: absolute;
          z-index: 2;
          top: 0;
          left: 0;
          color: white(50);
          padding: 0 48px 48px 0;
          @include respond(mobile) {
            right: 0;
            text-align: center;
            font-size: clamp(14px, 0.938vw, 18px);
            padding: 0;
          }
          &__horizontal {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            visibility: hidden;
            @include respond(mobile) {
              display: none;
            }
            .psychoactive__icon {
              left: 100%;
            }
          }
          &__vertical {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 7px;
            visibility: hidden;
            @include respond(mobile) {
              display: none;
            }
            .psychoactive__icon {
              top: 100%;
            }
          }
          &__icon {
            position: absolute;
            width: 7px;
            height: 7px;
            color: white(50);
          }
        }
        .grey-text {
          color: $color-grey;
          will-change: transform;
          @include respond(mobile) {
            font-size: clamp(36px, 9.6vw, 48px);
          }
        }
        .circle--wrapper {
          position: absolute;
          z-index: 1;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(30deg);
          width: 50%;
          @include respond(mobile) {
            display: none;
          }
          .circle {
            width: 100%;
            height: 100%;
          }
        }

        .top-text {
          position: absolute;
          z-index: 4;
          top: 0;
          right: 0;
          text-align: right;
          @include respond(mobile) {
            position: static;
          }
          &__agency {
            text-transform: uppercase;
            opacity: 0.5;
            @include respond(mobile) {
              font-size: 14px;
              margin: 20px 0 16px 0;
            }
          }
          &__innovation {
            margin-bottom: 24px;
          }
          &__label {
            width: auto;
            // height: clamp(36px, 2.5vw, 48px);
            height: 48px;
            margin-left: auto;
            pointer-events: all;
          }
        }
        .bottom-text {
          position: absolute;
          z-index: 2;
          bottom: 0;
          left: 0;
          @include respond(mobile) {
            position: static;
            align-self: flex-start;
          }
          &__imagine {
            line-height: 77%;
          }
          &__scale {
            color: $color-foreground;
            line-height: 77%;
            @include respond(mobile) {
              font-size: clamp(84px, 22vw, 112px);
            }
            &-arrows {
              color: $color-grey;
              font-size: 5.5vw;
              line-height: 0.5;
              position: absolute;
              top: 0;
              left: 95%;
              letter-spacing: -1.5vw;
            }
          }
        }
        .center {
          position: absolute;
          z-index: 2;
          top: 50%;
          left: 0;
          right: 0;
          @include respond(mobile) {
            display: none;
          }
          &__line {
            background: white(10);
            height: 1px;
            will-change: transform;
          }
          &__part {
            position: absolute;
            top: 0;
            width: 50%;
            will-change: transform;
            .center__text {
              top: 10px;
            }
            &_dot {
              width: 7px;
              height: 7px;
              border-radius: 50%;
              background: $color-dots;
              position: absolute;
              top: -3px;
            }
            &--left {
              left: 0;
              .center__part_dot {
                left: 0;
              }
              .center__text {
                left: 0;
                @include respond(portrait) {
                  display: none;
                }
              }
            }
            &--right {
              right: 0;
              .center__part_dot {
                right: 0;
              }
              .center__text {
                right: 0;
                @include respond(portrait) {
                  display: none;
                }
              }
            }
          }

          &__text {
            color: white(80);
            line-height: 1;
            opacity: 0.5;
            position: absolute;
            @include respond(portrait) {
            }
            &--play {
              left: 20%;
              top: 10px;
              @include respond(portrait) {
                left: 0%;
              }
            }
            &--time {
              right: 20%;
              top: 10px;
              @include respond(portrait) {
                right: 0%;
              }
            }
          }
        }
        .dots-arrow {
          position: absolute;
          z-index: 5;
          right: -3px;
          bottom: -3px;
          width: 62px;
          height: 62px;
          @include flex-center;
          visibility: hidden;
          pointer-events: all;
          @include respond(mobile) {
            display: none;
          }
          &:hover {
            .dots-arrow__icon {
              &_dot {
                &--1 {
                  animation: flicker-effect-1 0.6s ease;
                }
                &--2 {
                  animation: flicker-effect-3 0.6s ease;
                }
                &--3 {
                  animation: flicker-effect-5 0.6s ease;
                }
              }
            }
          }
          &__icon {
            width: 16px;
            height: 16px;
            position: relative;
            &_dot {
              display: block;
              width: 6px;
              height: 6px;
              border-radius: 50%;
              position: absolute;
              background-color: $color-foreground;
              &--1 {
                top: 2px;
                left: 1px;
              }
              &--2 {
                top: 2px;
                right: 1px;
              }
              &--3 {
                bottom: 1px;
                left: calc(50% - 3px);
              }
            }
          }
          &__plus {
            position: absolute;
            width: 7px;
            height: 7px;
            color: white(50);
            &--tr {
              top: 0;
              right: 0;
            }
            &--br {
              bottom: 0;
              right: 0;
            }
            &--bl {
              bottom: 0;
              left: 0;
            }
          }
          &__horizontal {
            position: absolute;
            bottom: 0.125em;
            right: 0;
            width: 100%;
            height: 7px;
          }
          &__vertical {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 7px;
            height: 100%;
          }
        }
        .video-player {
          position: absolute;
          z-index: 3;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          aspect-ratio: 2.22;
          @include respond(mobile) {
            position: relative;
            top: 0 !important;
            left: 0;
            transform: none;
          }
        }
      }
    }
  }
  // &__player {
  //   background-color: red;
  //   height: calc(100vh - 48px - 48px);
  // }
}
</style>
