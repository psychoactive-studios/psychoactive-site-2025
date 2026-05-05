precision highp float;

uniform float uTime;
uniform float uMix;            // 0 = pure A (colourful), 1 = pure B (showreel)
uniform vec2  uMouse;          // 0..1 within the box
uniform sampler2D uTextureA;   // colourful psychedelic preview
uniform sampler2D uTextureB;   // showreel preview
uniform float uNoiseScale;
uniform float uDisplacement;
uniform float uAberration;
uniform float uHueShift;
uniform float uClickPulse;     // 0..1 transient burst on click — amplifies
                                // every effect dramatically and adds a
                                // scanline glitch for a "psychedelic
                                // explosion" feel as the rectangle scales
                                // up. Fades back to 0 over ~0.7s.
uniform float uClickAmplify;   // how much the pulse amplifies effects
uniform float uClickScanline;  // scanline-glitch UV displacement amount

varying vec2 vUv;

#define PI 3.14159265359

// --- noise ---------------------------------------------------------------
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise2D(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    v += amp * noise2D(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return v;
}

// --- hue rotation in RGB --------------------------------------------------
vec3 hueShift(vec3 col, float angle) {
  const vec3 k = vec3(0.57735, 0.57735, 0.57735); // 1/sqrt(3)
  float c = cos(angle);
  float s = sin(angle);
  return col * c + cross(k, col) * s + k * dot(k, col) * (1.0 - c);
}

void main() {
  // Pulse peaks at mid-transition — biggest distortion while merging.
  float pulse = sin(clamp(uMix, 0.0, 1.0) * PI);

  // Baseline keeps the morph effects (aberration, displacement, hue
  // spin) ALIVE at high uMix so the rectangle doesn't suddenly look
  // "static" / "disconnected" from the hologram when uMix reaches 1.
  // Scaled by uMix so psychedelic at uMix=0 stays clean.
  float baseline = uMix * 0.22;
  // Click pulse adds a dramatic burst on top — multiplied by the
  // configurable uClickAmplify. Fades back over ~0.7s.
  float effect = max(pulse, baseline) + uClickPulse * uClickAmplify;

  // --- domain-warped flow field ------------------------------------------
  vec2 q = vec2(
    fbm(vUv * uNoiseScale + vec2( uTime * 0.15,  uTime * 0.10)),
    fbm(vUv * uNoiseScale + vec2(-uTime * 0.12,  uTime * 0.18) + 5.0)
  );
  vec2 r = vec2(
    fbm(vUv * uNoiseScale + 4.0 * q + vec2(uTime * 0.20, 0.0)),
    fbm(vUv * uNoiseScale + 4.0 * q + vec2(0.0, uTime * 0.25) + 8.0)
  );

  vec2 flow = (r - 0.5) * uDisplacement * effect;

  // --- mouse-centred radial pull -----------------------------------------
  vec2 toMouse = vUv - uMouse;
  float dist = length(toMouse);
  float radial = exp(-dist * 4.0) * effect * 0.12;
  vec2 radialDisp = normalize(toMouse + 1e-5) * radial;

  // Click pulse adds a horizontal scanline-style glitch — fast
  // sinusoidal x-offset that makes the eye look like it's tearing
  // apart in slices. Burst-only, no effect when uClickPulse = 0.
  float scanline = sin(vUv.y * 90.0 + uTime * 18.0) * uClickPulse * uClickScanline;
  vec2 glitch = vec2(scanline, 0.0);

  // Final UV offsets per layer
  vec2 uvA = vUv + flow + radialDisp + glitch;
  vec2 uvB = vUv + flow * 0.6 - radialDisp * 0.3 + glitch * 0.6;

  // --- chromatic aberration ----------------------------------------------
  vec2 aber = (vUv - 0.5) * uAberration * effect;

  vec3 cA;
  cA.r = texture2D(uTextureA, uvA + aber).r;
  cA.g = texture2D(uTextureA, uvA).g;
  cA.b = texture2D(uTextureA, uvA - aber).b;

  vec3 cB;
  cB.r = texture2D(uTextureB, uvB + aber * 0.7).r;
  cB.g = texture2D(uTextureB, uvB).g;
  cB.b = texture2D(uTextureB, uvB - aber * 0.7).b;

  // Hue spin (subtle, sustained at high uMix via effect baseline)
  cA = hueShift(cA,  effect * uHueShift);
  cB = hueShift(cB, -effect * uHueShift * 0.6);

  // --- noisy dissolve mask ------------------------------------------------
  // "Burn" style dissolve: each pixel's noise value is its fixed transition
  // threshold; uMix sweeps through the threshold field once, monotonically.
  // Edges are clamped to [0, 1] so the endpoints (uMix = 0 or 1) lock
  // perfectly to pure A or pure B with no bleed-through.
  float maskNoise = r.x;
  float feather = 0.18;
  float lowerEdge = max(maskNoise - feather, 0.0);
  float upperEdge = min(maskNoise + feather, 1.0);
  float dissolve = smoothstep(lowerEdge, upperEdge, uMix);

  // Blend = mostly dissolve with a touch of global crossfade so it feels
  // less like a hard wipe and more like a merge.
  float blend = mix(uMix, dissolve, 0.7);

  vec3 col = mix(cA, cB, blend);

  // --- wavefront highlight at the dissolve edge --------------------------
  float edge = smoothstep(0.4, 0.5, dissolve) * (1.0 - smoothstep(0.5, 0.6, dissolve));
  col += pulse * 0.18 * vec3(0.55, 0.75, 1.0) * edge;

  gl_FragColor = vec4(col, 1.0);
}
