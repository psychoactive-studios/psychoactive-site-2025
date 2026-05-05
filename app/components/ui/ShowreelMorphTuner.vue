<!--
  DEV-ONLY component for tuning the showreel morph shader live.
  Render this with v-if="$dev" or v-if="import.meta.dev" so it never ships.
  Once the look is locked in, delete this file and the corresponding
  v-if block + reactive refs in homepage/Hero.vue.
-->
<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  // Morph knobs
  noiseScale:    { type: Number, required: true },
  displacement:  { type: Number, required: true },
  aberration:    { type: Number, required: true },
  hueShift:      { type: Number, required: true },
  morphDuration: { type: Number, required: true },
  forceMix:      { type: Number, default: null },

  // Hologram knobs
  bgStrength:         { type: Number, required: true },
  bgVignette:         { type: Number, required: true },
  bgAberration:       { type: Number, required: true },
  bgScanlineStrength: { type: Number, required: true },
  bgScanRollSpeed:    { type: Number, required: true },
  bgBarrel:           { type: Number, required: true },
  bgForceVisible:     { type: Boolean, default: false },

  // Click-pulse knobs
  clickAmplify:  { type: Number, required: true },
  clickScanline: { type: Number, required: true },
  clickRise:     { type: Number, required: true },
  clickFall:     { type: Number, required: true },
});

const emit = defineEmits([
  'update:noiseScale',
  'update:displacement',
  'update:aberration',
  'update:hueShift',
  'update:morphDuration',
  'update:forceMix',
  'update:bgStrength',
  'update:bgVignette',
  'update:bgAberration',
  'update:bgScanlineStrength',
  'update:bgScanRollSpeed',
  'update:bgBarrel',
  'update:bgForceVisible',
  'update:clickAmplify',
  'update:clickScanline',
  'update:clickRise',
  'update:clickFall',
  'fire-pulse',
  'reset',
]);

const collapsed = ref(false);
const useForceMix = ref(false);
const sliderForceMix = ref(0.5);

// Sync force mix between checkbox + slider
function setForceMix(active, val = sliderForceMix.value) {
  useForceMix.value = active;
  if (active) emit('update:forceMix', val);
  else emit('update:forceMix', null);
}

const snippet = computed(() => {
  const morph = [
    '<!-- ShowreelHoverPreview -->',
    `:noise-scale="${props.noiseScale}"`,
    `:displacement="${props.displacement}"`,
    `:aberration="${props.aberration}"`,
    `:hue-shift="${props.hueShift}"`,
    `:morph-duration="${props.morphDuration}"`,
    `:click-amplify="${props.clickAmplify}"`,
    `:click-scanline="${props.clickScanline}"`,
    `:click-rise="${props.clickRise}"`,
    `:click-fall="${props.clickFall}"`,
  ];
  const bg = [
    '',
    '<!-- ShowreelHoverBackground -->',
    `:strength="${props.bgStrength}"`,
    `:vignette="${props.bgVignette}"`,
    `:aberration="${props.bgAberration}"`,
    `:scanline-strength="${props.bgScanlineStrength}"`,
    `:scan-roll-speed="${props.bgScanRollSpeed}"`,
    `:barrel="${props.bgBarrel}"`,
  ];
  return [...morph, ...bg].join('\n');
});

const copied = ref(false);
async function copySnippet() {
  try {
    await navigator.clipboard.writeText(snippet.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1200);
  } catch (e) {
    /* ignore */
  }
}

function num(value) {
  // Slider inputs return strings — coerce.
  return typeof value === 'number' ? value : parseFloat(value);
}
</script>

<template>
  <div :class="['tuner', { 'tuner--collapsed': collapsed }]">
    <header class="tuner__header">
      <span class="tuner__title">Morph tuner</span>
      <button class="tuner__toggle" @click="collapsed = !collapsed">
        {{ collapsed ? '+' : '–' }}
      </button>
    </header>

    <div v-show="!collapsed" class="tuner__body">
      <div class="section-label">Morph</div>
      <label class="row">
        <span class="row__label">Noise scale</span>
        <input
          type="range"
          min="0.5"
          max="10"
          step="0.1"
          :value="noiseScale"
          @input="emit('update:noiseScale', num($event.target.value))"
        >
        <span class="row__val">{{ noiseScale.toFixed(2) }}</span>
      </label>

      <label class="row">
        <span class="row__label">Displacement</span>
        <input
          type="range"
          min="0"
          max="0.4"
          step="0.005"
          :value="displacement"
          @input="emit('update:displacement', num($event.target.value))"
        >
        <span class="row__val">{{ displacement.toFixed(3) }}</span>
      </label>

      <label class="row">
        <span class="row__label">Aberration</span>
        <input
          type="range"
          min="0"
          max="0.08"
          step="0.001"
          :value="aberration"
          @input="emit('update:aberration', num($event.target.value))"
        >
        <span class="row__val">{{ aberration.toFixed(3) }}</span>
      </label>

      <label class="row">
        <span class="row__label">Hue shift</span>
        <input
          type="range"
          min="0"
          max="3.14"
          step="0.05"
          :value="hueShift"
          @input="emit('update:hueShift', num($event.target.value))"
        >
        <span class="row__val">{{ hueShift.toFixed(2) }}</span>
      </label>

      <label class="row">
        <span class="row__label">Duration (s)</span>
        <input
          type="range"
          min="0.1"
          max="2"
          step="0.05"
          :value="morphDuration"
          @input="emit('update:morphDuration', num($event.target.value))"
        >
        <span class="row__val">{{ morphDuration.toFixed(2) }}</span>
      </label>

      <div class="divider" />

      <label class="row row--checkbox">
        <input
          type="checkbox"
          :checked="useForceMix"
          @change="setForceMix($event.target.checked)"
        >
        <span class="row__label">Scrub uMix (override hover)</span>
      </label>

      <label class="row" :class="{ 'row--disabled': !useForceMix }">
        <span class="row__label">uMix</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          :disabled="!useForceMix"
          :value="sliderForceMix"
          @input="
            sliderForceMix = num($event.target.value);
            if (useForceMix) emit('update:forceMix', sliderForceMix);
          "
        >
        <span class="row__val">{{ sliderForceMix.toFixed(2) }}</span>
      </label>

      <div class="divider" />

      <div class="section-label">Hologram</div>

      <label class="row row--checkbox">
        <input
          type="checkbox"
          :checked="bgForceVisible"
          @change="emit('update:bgForceVisible', $event.target.checked)"
        >
        <span class="row__label">Force visible (no hover needed)</span>
      </label>

      <label class="row">
        <span class="row__label">Strength</span>
        <input
          type="range"
          min="0"
          max="1.5"
          step="0.01"
          :value="bgStrength"
          @input="emit('update:bgStrength', num($event.target.value))"
        >
        <span class="row__val">{{ bgStrength.toFixed(2) }}</span>
      </label>

      <label class="row">
        <span class="row__label">Vignette</span>
        <input
          type="range"
          min="0"
          max="2.5"
          step="0.01"
          :value="bgVignette"
          @input="emit('update:bgVignette', num($event.target.value))"
        >
        <span class="row__val">{{ bgVignette.toFixed(2) }}</span>
      </label>

      <label class="row">
        <span class="row__label">Edge aberr.</span>
        <input
          type="range"
          min="0"
          max="0.08"
          step="0.001"
          :value="bgAberration"
          @input="emit('update:bgAberration', num($event.target.value))"
        >
        <span class="row__val">{{ bgAberration.toFixed(3) }}</span>
      </label>

      <label class="row">
        <span class="row__label">Scanlines</span>
        <input
          type="range"
          min="0"
          max="0.6"
          step="0.01"
          :value="bgScanlineStrength"
          @input="emit('update:bgScanlineStrength', num($event.target.value))"
        >
        <span class="row__val">{{ bgScanlineStrength.toFixed(2) }}</span>
      </label>

      <label class="row">
        <span class="row__label">Scan roll</span>
        <input
          type="range"
          min="-0.4"
          max="0.4"
          step="0.005"
          :value="bgScanRollSpeed"
          @input="emit('update:bgScanRollSpeed', num($event.target.value))"
        >
        <span class="row__val">{{ bgScanRollSpeed.toFixed(3) }}</span>
      </label>

      <label class="row">
        <span class="row__label">Barrel</span>
        <input
          type="range"
          min="0"
          max="2"
          step="0.01"
          :value="bgBarrel"
          @input="emit('update:bgBarrel', num($event.target.value))"
        >
        <span class="row__val">{{ bgBarrel.toFixed(2) }}</span>
      </label>

      <div class="divider" />

      <div class="section-label">Click pulse</div>

      <label class="row">
        <span class="row__label">Amplify</span>
        <input
          type="range"
          min="0"
          max="4"
          step="0.05"
          :value="clickAmplify"
          @input="emit('update:clickAmplify', num($event.target.value))"
        >
        <span class="row__val">{{ clickAmplify.toFixed(2) }}</span>
      </label>

      <label class="row">
        <span class="row__label">Scanline</span>
        <input
          type="range"
          min="0"
          max="0.2"
          step="0.001"
          :value="clickScanline"
          @input="emit('update:clickScanline', num($event.target.value))"
        >
        <span class="row__val">{{ clickScanline.toFixed(3) }}</span>
      </label>

      <label class="row">
        <span class="row__label">Rise (s)</span>
        <input
          type="range"
          min="0.02"
          max="0.6"
          step="0.01"
          :value="clickRise"
          @input="emit('update:clickRise', num($event.target.value))"
        >
        <span class="row__val">{{ clickRise.toFixed(2) }}</span>
      </label>

      <label class="row">
        <span class="row__label">Fall (s)</span>
        <input
          type="range"
          min="0.1"
          max="2"
          step="0.05"
          :value="clickFall"
          @input="emit('update:clickFall', num($event.target.value))"
        >
        <span class="row__val">{{ clickFall.toFixed(2) }}</span>
      </label>

      <button class="btn btn--full" @click="emit('fire-pulse')">Fire pulse</button>

      <div class="divider" />

      <div class="actions">
        <button class="btn" @click="emit('reset')">Reset</button>
        <button class="btn btn--primary" @click="copySnippet">
          {{ copied ? 'Copied!' : 'Copy props' }}
        </button>
      </div>

      <pre class="snippet">{{ snippet }}</pre>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tuner {
  position: fixed;
  top: 16px;
  right: 16px;
  width: 280px;
  background: rgba(10, 10, 12, 0.92);
  color: #f5f5f5;
  font-family: ui-monospace, 'RoobertMono', monospace;
  font-size: 11px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 0;
  z-index: 9999;
  backdrop-filter: blur(8px);
  user-select: none;
  &--collapsed {
    width: auto;
  }
}
.tuner__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  cursor: default;
}
.tuner__title {
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 10px;
  opacity: 0.85;
}
.tuner__toggle {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #f5f5f5;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  &:hover { background: rgba(255, 255, 255, 0.08); }
}
.tuner__body {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
}
.section-label {
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.55;
  margin: 4px 0 -2px;
}
.row {
  display: grid;
  grid-template-columns: 88px 1fr 44px;
  align-items: center;
  gap: 8px;
  &--checkbox {
    grid-template-columns: 16px 1fr;
    cursor: pointer;
  }
  &--disabled {
    opacity: 0.4;
  }
}
.row__label {
  opacity: 0.85;
}
.row__val {
  text-align: right;
  font-variant-numeric: tabular-nums;
  opacity: 0.95;
}
input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 14px;
  background: transparent;
  cursor: pointer;
  &::-webkit-slider-runnable-track {
    height: 2px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #fff;
    margin-top: -5px;
  }
  &::-moz-range-track {
    height: 2px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }
  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #fff;
    border: 0;
  }
  &:disabled { opacity: 0.4; }
}
.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 2px 0;
}
.actions {
  display: flex;
  gap: 6px;
}
.btn {
  flex: 1;
  background: rgba(255, 255, 255, 0.06);
  color: #f5f5f5;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 4px;
  font-family: inherit;
  font-size: 11px;
  padding: 6px 8px;
  cursor: pointer;
  &:hover { background: rgba(255, 255, 255, 0.12); }
  &--primary {
    background: #136df4;
    border-color: #136df4;
    &:hover { background: #2c80f5; }
  }
  &--full {
    width: 100%;
    flex: none;
    margin-top: 4px;
  }
}
.snippet {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 10px;
  line-height: 1.4;
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
