<script setup>
/**
 * /dev/dots — particle lab.
 *
 * Isolation environment for iterating on the dot scene without any
 * other homepage state interfering. Renders the V2 component
 * fullscreen with a control panel for switching formations, firing
 * the click "blow up", and (later) tuning physics constants live.
 *
 * Local-only — set noindex via the page meta below.
 */
import { ref, onMounted, onUnmounted } from 'vue';
import ServicesHero3DSceneV2 from '~/components/ui/ServicesHero3DSceneV2.vue';

definePageMeta({
  layout: false,
});

useHead({
  title: 'Dots Lab',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
});

const sceneRef = ref(null);
const formation = ref(0); // 0 = sphere, 1 = grid

// === Live-tunable knobs ===
// Defaults match the V2 component's prop defaults. Use the
// "Copy values" button below the panel to grab the current state as
// a snippet ready to paste back into the component.
const particleDensity = ref(124);
const particleSize    = ref(0.008);
const particleOpacity = ref(0.82);
const fogDensity      = ref(0.235);
const cameraDistance  = ref(4.95);
const pointsScale     = ref(0.66);
const sphereFov       = ref(66);
const gridFov         = ref(1);
const gridSize        = ref(20);
const gridSpread      = ref(3.05);
const noiseAmp        = ref(0.67);
const noiseFreq       = ref(2.05);
const springConstant  = ref(0.047);
const damping         = ref(0.56);
const rotateSpeed     = ref(0);

const explosionDuration     = ref(1.5);
const explosionInitialBurst = ref(0.08);
const explosionOutwardBias  = ref(0.18);
const explosionJitter       = ref(0.40);

// Sphere jitter — small random offset added to each particle's sphere
// rest position. Breaks up the visible lat/long ring structure of
// SphereGeometry so the sphere reads as scattered particles rather
// than visible curves/lines.
const sphereJitter = ref(0.024);

// Hover interaction mode + tunables.
const hoverMode = ref('repel'); // 'push' | 'attract' | 'repel' | 'vortex' | 'part' | 'none'
const hoverRadius = ref(5.1);
const hoverStrength = ref(0.027);

function resetDefaults() {
  particleDensity.value      = 124;
  particleSize.value         = 0.008;
  particleOpacity.value      = 0.82;
  fogDensity.value           = 0.235;
  cameraDistance.value       = 4.95;
  pointsScale.value          = 0.66;
  sphereFov.value            = 66;
  gridFov.value              = 1;
  gridSize.value             = 20;
  gridSpread.value           = 3.05;
  noiseAmp.value             = 0.67;
  noiseFreq.value            = 2.05;
  springConstant.value       = 0.047;
  damping.value              = 0.56;
  rotateSpeed.value          = 0;
  explosionDuration.value    = 1.5;
  explosionInitialBurst.value = 0.08;
  explosionOutwardBias.value = 0.18;
  explosionJitter.value      = 0.40;
  sphereJitter.value         = 0.024;
  hoverMode.value            = 'repel';
  hoverRadius.value          = 5.1;
  hoverStrength.value        = 0.027;
}

// Build a code snippet of the current values, ready to paste into the
// V2 component's `defineProps` defaults.
const copyStatus = ref('');
function buildSnippet() {
  return [
    `particleDensity:       ${particleDensity.value},`,
    `particleSize:          ${particleSize.value},`,
    `particleOpacity:       ${particleOpacity.value},`,
    `fogDensity:            ${fogDensity.value},`,
    `cameraDistance:        ${cameraDistance.value},`,
    `pointsScale:           ${pointsScale.value},`,
    `sphereFov:             ${sphereFov.value},`,
    `gridFov:               ${gridFov.value},`,
    `gridSize:              ${gridSize.value},`,
    `gridSpread:            ${gridSpread.value},`,
    `sphereJitter:          ${sphereJitter.value},`,
    `hoverMode:             '${hoverMode.value}',`,
    `hoverRadius:           ${hoverRadius.value},`,
    `hoverStrength:         ${hoverStrength.value},`,
    `rotateSpeed:           ${rotateSpeed.value},`,
    `noiseAmp:              ${noiseAmp.value},`,
    `noiseFreq:             ${noiseFreq.value},`,
    `springConstant:        ${springConstant.value},`,
    `damping:               ${damping.value},`,
    `explosionDuration:     ${explosionDuration.value},`,
    `explosionInitialBurst: ${explosionInitialBurst.value},`,
    `explosionOutwardBias:  ${explosionOutwardBias.value},`,
    `explosionJitter:       ${explosionJitter.value},`,
  ].join('\n');
}

async function copyValues() {
  const snippet = buildSnippet();
  try {
    await navigator.clipboard.writeText(snippet);
    copyStatus.value = '✓ copied';
  } catch {
    copyStatus.value = '× failed (use console)';
    // eslint-disable-next-line no-console
    console.log(snippet);
  }
  setTimeout(() => { copyStatus.value = ''; }, 2000);
}

// Diagnostic: poll the frame counter so we can SEE whether the animate
// loop is actually running. If frames stops incrementing, the loop has
// died and we know to look there.
const frameCount = ref(0);
const fps = ref(0);
let pollId;
let lastSampleTime = 0;
let lastSampleFrame = 0;

function setSphere() {
  formation.value = 0;
  sceneRef.value?.setFormation(0, 1.2);
}
function setGrid() {
  formation.value = 1;
  sceneRef.value?.setFormation(1, 1.2);
}
function fireExplosion() {
  sceneRef.value?.fireExplosion?.() ?? sceneRef.value?.fireRipple?.(0, 0, 0);
}

onMounted(() => {
  pollId = setInterval(() => {
    const f = sceneRef.value?.getFrameCount?.() ?? 0;
    frameCount.value = f;
    const now = performance.now();
    if (lastSampleTime > 0) {
      const dt = (now - lastSampleTime) / 1000;
      const df = f - lastSampleFrame;
      fps.value = Math.round(df / dt);
    }
    lastSampleTime = now;
    lastSampleFrame = f;
  }, 500);
});

onUnmounted(() => {
  if (pollId) clearInterval(pollId);
});
</script>

<template>
  <div class="lab">
    <ServicesHero3DSceneV2
      ref="sceneRef"
      :is-playing="true"
      :particle-density="particleDensity"
      :particle-size="particleSize"
      :particle-opacity="particleOpacity"
      :fog-density="fogDensity"
      :camera-distance="cameraDistance"
      :points-scale="pointsScale"
      :sphere-fov="sphereFov"
      :grid-fov="gridFov"
      :grid-size="gridSize"
      :grid-spread="gridSpread"
      :sphere-jitter="sphereJitter"
      :hover-mode="hoverMode"
      :hover-radius="hoverRadius"
      :hover-strength="hoverStrength"
      :noise-amp="noiseAmp"
      :noise-freq="noiseFreq"
      :spring-constant="springConstant"
      :damping="damping"
      :rotate-speed="rotateSpeed"
      :explosion-duration="explosionDuration"
      :explosion-initial-burst="explosionInitialBurst"
      :explosion-outward-bias="explosionOutwardBias"
      :explosion-jitter="explosionJitter"
      class="lab__scene"
    />

    <div class="lab__panel">
      <div class="lab__title">DOTS LAB</div>

      <div class="lab__row">
        <button
          :class="['lab__btn', { 'lab__btn--active': formation === 0 }]"
          @click="setSphere"
        >
          Sphere
        </button>
        <button
          :class="['lab__btn', { 'lab__btn--active': formation === 1 }]"
          @click="setGrid"
        >
          Grid
        </button>
      </div>
      <div class="lab__row">
        <button class="lab__btn lab__btn--accent" @click="fireExplosion">
          💥 Blow it up
        </button>
      </div>

      <div class="lab__section">LOOK</div>
      <label class="lab__slider">
        <span>
          Particle density
          <em>{{ particleDensity }} (~{{ ((particleDensity + 1) ** 2).toLocaleString() }})</em>
        </span>
        <input v-model.number="particleDensity" type="range" min="20" max="280" step="2">
      </label>
      <label class="lab__slider">
        <span>Particle size <em>{{ particleSize.toFixed(3) }}</em></span>
        <input v-model.number="particleSize" type="range" min="0.005" max="0.1" step="0.001">
      </label>
      <label class="lab__slider">
        <span>Opacity <em>{{ particleOpacity.toFixed(2) }}</em></span>
        <input v-model.number="particleOpacity" type="range" min="0" max="1" step="0.01">
      </label>
      <label class="lab__slider">
        <span>Fog <em>{{ fogDensity.toFixed(3) }}</em></span>
        <input v-model.number="fogDensity" type="range" min="0" max="1" step="0.005">
      </label>
      <label class="lab__slider">
        <span>Camera dist. <em>{{ cameraDistance.toFixed(2) }}</em></span>
        <input v-model.number="cameraDistance" type="range" min="1.5" max="10" step="0.05">
      </label>
      <label class="lab__slider">
        <span>Sphere scale <em>{{ pointsScale.toFixed(2) }}</em></span>
        <input v-model.number="pointsScale" type="range" min="0.2" max="2.0" step="0.01">
      </label>
      <label class="lab__slider">
        <span>Sphere FOV <em>{{ sphereFov }}°</em></span>
        <input v-model.number="sphereFov" type="range" min="20" max="120" step="1">
      </label>
      <label class="lab__slider">
        <span>Grid FOV <em>{{ gridFov }}°</em></span>
        <input v-model.number="gridFov" type="range" min="1" max="60" step="1">
      </label>

      <div class="lab__section">GRID LAYOUT</div>
      <label class="lab__slider">
        <span>Grid size <em>{{ gridSize.toFixed(1) }}</em></span>
        <input v-model.number="gridSize" type="range" min="2" max="20" step="0.1">
      </label>
      <label class="lab__slider">
        <span>Spread (1=uniform) <em>{{ gridSpread.toFixed(2) }}</em></span>
        <input v-model.number="gridSpread" type="range" min="0.5" max="4" step="0.05">
      </label>
      <label class="lab__slider">
        <span>Sphere jitter <em>{{ sphereJitter.toFixed(3) }}</em></span>
        <input v-model.number="sphereJitter" type="range" min="0" max="0.1" step="0.001">
      </label>

      <div class="lab__section">HOVER INTERACTION</div>
      <div class="lab__row lab__row--wrap">
        <button
          v-for="m in ['push', 'attract', 'repel', 'vortex', 'part', 'none']"
          :key="m"
          :class="['lab__chip', { 'lab__chip--active': hoverMode === m }]"
          @click="hoverMode = m"
        >
          {{ m }}
        </button>
      </div>
      <label class="lab__slider">
        <span>Hover radius <em>{{ hoverRadius.toFixed(2) }}</em></span>
        <input v-model.number="hoverRadius" type="range" min="0.1" max="6" step="0.05">
      </label>
      <label class="lab__slider">
        <span>Hover strength <em>{{ hoverStrength.toFixed(3) }}</em></span>
        <input v-model.number="hoverStrength" type="range" min="0" max="0.4" step="0.001">
      </label>
      <label class="lab__slider">
        <span>Rotate speed <em>{{ rotateSpeed.toFixed(2) }}</em></span>
        <input v-model.number="rotateSpeed" type="range" min="0" max="0.5" step="0.005">
      </label>

      <div class="lab__section">PHYSICS</div>
      <label class="lab__slider">
        <span>Noise amp <em>{{ noiseAmp.toFixed(2) }}</em></span>
        <input v-model.number="noiseAmp" type="range" min="0" max="2" step="0.01">
      </label>
      <label class="lab__slider">
        <span>Noise freq <em>{{ noiseFreq.toFixed(2) }}</em></span>
        <input v-model.number="noiseFreq" type="range" min="0.1" max="5" step="0.05">
      </label>
      <label class="lab__slider">
        <span>Spring k <em>{{ springConstant.toFixed(3) }}</em></span>
        <input v-model.number="springConstant" type="range" min="0.005" max="0.3" step="0.001">
      </label>
      <label class="lab__slider">
        <span>Damping <em>{{ damping.toFixed(2) }}</em></span>
        <input v-model.number="damping" type="range" min="0.5" max="0.99" step="0.01">
      </label>

      <div class="lab__section">EXPLOSION</div>
      <label class="lab__slider">
        <span>Duration <em>{{ explosionDuration.toFixed(2) }}s</em></span>
        <input v-model.number="explosionDuration" type="range" min="0.3" max="5" step="0.1">
      </label>
      <label class="lab__slider">
        <span>Initial burst <em>{{ explosionInitialBurst.toFixed(2) }}</em></span>
        <input v-model.number="explosionInitialBurst" type="range" min="0" max="1" step="0.01">
      </label>
      <label class="lab__slider">
        <span>Outward bias <em>{{ explosionOutwardBias.toFixed(2) }}</em></span>
        <input v-model.number="explosionOutwardBias" type="range" min="0" max="0.5" step="0.005">
      </label>
      <label class="lab__slider">
        <span>Jitter <em>{{ explosionJitter.toFixed(2) }}</em></span>
        <input v-model.number="explosionJitter" type="range" min="0" max="2" step="0.05">
      </label>

      <div class="lab__row" style="margin-top: 12px">
        <button class="lab__btn" @click="resetDefaults">Reset</button>
        <button class="lab__btn lab__btn--accent2" @click="copyValues">
          {{ copyStatus || 'Copy values' }}
        </button>
      </div>

      <div class="lab__diag">
        <div>frames: <strong>{{ frameCount }}</strong></div>
        <div>fps: <strong>{{ fps }}</strong></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.lab {
  position: fixed;
  inset: 0;
  background: #050507;
  overflow: hidden;

  &__scene {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  &__panel {
    position: absolute;
    top: 24px;
    left: 24px;
    z-index: 10;
    background: rgba(10, 10, 14, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    padding: 16px;
    backdrop-filter: blur(12px);
    color: #fff;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 12px;
    line-height: 1.4;
    width: 280px;
    max-height: calc(100vh - 48px);
    overflow-y: auto;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
  }

  &__section {
    margin-top: 16px;
    margin-bottom: 8px;
    font-size: 10px;
    letter-spacing: 0.16em;
    color: rgba(255, 255, 255, 0.4);
  }

  &__slider {
    display: block;
    margin-bottom: 6px;

    span {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 2px;

      em {
        font-style: normal;
        color: #17ffff;
        font-size: 10px;
      }
    }

    input[type="range"] {
      width: 100%;
      height: 2px;
      -webkit-appearance: none;
      appearance: none;
      background: rgba(255, 255, 255, 0.12);
      border-radius: 2px;
      outline: none;
      cursor: pointer;

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 12px;
        height: 12px;
        background: #17ffff;
        border-radius: 50%;
        cursor: pointer;
      }

      &::-moz-range-thumb {
        width: 12px;
        height: 12px;
        background: #17ffff;
        border-radius: 50%;
        border: none;
        cursor: pointer;
      }
    }
  }

  &__title {
    font-size: 11px;
    letter-spacing: 0.16em;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 12px;
  }

  &__row {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;

    &--wrap {
      flex-wrap: wrap;
    }
  }

  &__chip {
    flex: 0 0 auto;
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.75);
    font-family: inherit;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.12s ease;
    text-transform: capitalize;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.32);
      color: #fff;
    }

    &--active {
      background: rgba(23, 255, 255, 0.15);
      border-color: rgba(23, 255, 255, 0.6);
      color: #17ffff;
    }
  }

  &__btn {
    flex: 1;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(255, 255, 255, 0.04);
    color: #fff;
    font-family: inherit;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.32);
    }

    &--active {
      background: rgba(23, 255, 255, 0.15);
      border-color: rgba(23, 255, 255, 0.6);
      color: #17ffff;
    }

    &--accent {
      background: rgba(228, 57, 60, 0.15);
      border-color: rgba(228, 57, 60, 0.6);
      color: #ff7a7c;
    }

    &--accent2 {
      background: rgba(35, 207, 72, 0.12);
      border-color: rgba(35, 207, 72, 0.5);
      color: #5af07a;
    }
  }

  &__hint {
    margin-top: 12px;
    color: rgba(255, 255, 255, 0.4);
    font-size: 11px;
  }

  &__diag {
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.5);
    font-size: 11px;
    display: flex;
    gap: 16px;

    strong {
      color: #17ffff;
      font-weight: 500;
    }
  }
}
</style>
