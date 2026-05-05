precision highp float;

uniform sampler2D uTexture;
uniform vec2  uResolution;       // viewport size (px)
uniform vec2  uTextureResolution;// video native size (px)
uniform vec2  uCenter;           // rectangle centre in viewport UV (0..1)
uniform vec2  uMouse;            // mouse position in viewport UV (0..1)
uniform float uTime;

uniform float uMix;              // 0..1 hover intensity (drives fade-in)
uniform float uStrength;         // overall opacity multiplier
uniform float uVignette;         // 0..2 — radial fade-to-black strength
uniform float uAberration;       // edge chromatic aberration
uniform float uScanlineFreq;     // px per scanline
uniform float uScanlineStrength; // 0..1
uniform float uScanRollSpeed;    // bright band drift speed
uniform float uBarrel;           // 0..1 fisheye distortion amount
uniform float uParallax;         // 0..0.1 mouse-driven parallax
uniform float uHoleRadius;       // hole radius IN PIXELS — sized to fit
                                  // around the play button (~50-80px) so
                                  // the button isn't visually inside the
                                  // hologram. Doesn't extend into the
                                  // rectangle area.
uniform float uHoleSoftness;     // hole edge feather IN PIXELS

varying vec2 vUv;

#define PI 3.14159265359

// Cover-style sampling so the eye fills the screen without squashing
vec2 coverUv(vec2 uv, vec2 textureSize, vec2 displaySize) {
  vec2 ratio = vec2(
    min((displaySize.x / displaySize.y) / (textureSize.x / textureSize.y), 1.0),
    min((displaySize.y / displaySize.x) / (textureSize.y / textureSize.x), 1.0)
  );
  return vec2(
    uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    uv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );
}

void main() {
  // Aspect-corrected position from rectangle centre, in pixels.
  // Used so distortion / vignette feel circular regardless of viewport.
  vec2 fromCenter = (vUv - uCenter) * uResolution;
  float dist = length(fromCenter);
  float maxDist = length(uResolution * 0.5);
  float r = clamp(dist / maxDist, 0.0, 1.0); // 0 at centre, 1 at far corner

  // Mouse parallax — eye drifts subtly with cursor for an "alive" feel
  vec2 parallax = (uMouse - vec2(0.5)) * uParallax * (1.0 - r * 0.4);

  // Barrel distortion — UVs warped toward / away from the rectangle centre
  // The further from centre, the more squeezed inward.
  vec2 dir = normalize(fromCenter + 1e-4);
  float barrelAmount = uBarrel * pow(r, 1.6) * 0.18;
  vec2 distortion = -dir * barrelAmount; // negative = sucked toward centre
  // Map back to UV space
  vec2 distortedUv = vUv + distortion + parallax;

  // Edge-heavy chromatic aberration — RGB split scales with r^2
  float aberrationAmount = uAberration * r * r;
  vec2 aberrDir = normalize(fromCenter + 1e-4);

  // Sample the eye video with cover UVs at three offsets
  vec2 baseUv = coverUv(distortedUv, uTextureResolution, uResolution);
  vec2 offset = aberrDir * aberrationAmount;

  vec3 col;
  col.r = texture2D(uTexture, baseUv + offset).r;
  col.g = texture2D(uTexture, baseUv).g;
  col.b = texture2D(uTexture, baseUv - offset).b;

  // --- scanlines --------------------------------------------------------
  // Static fine lines based on screen-space Y in pixels
  float scanY = vUv.y * uResolution.y;
  float scan = sin(scanY * (PI / max(uScanlineFreq, 0.5))) * 0.5 + 0.5;
  float scanMask = mix(1.0, scan, uScanlineStrength);
  col *= scanMask;

  // --- moving scan-roll band -------------------------------------------
  // A faint bright horizontal band drifting down the screen
  float rollY = fract(vUv.y - uTime * uScanRollSpeed);
  float band = exp(-pow((rollY - 0.5) * 6.0, 2.0)) * 0.18;
  col += band;

  // --- vignette ---------------------------------------------------------
  // Smooth radial fade based on aspect-corrected r
  float vignette = smoothstep(1.0, 0.25, r * uVignette);

  col *= vignette;

  // --- fade in / out -----------------------------------------------------
  // Fade in/out drives final alpha and a touch of saturation pulse
  float alpha = uMix * uStrength * vignette;

  gl_FragColor = vec4(col, alpha);
}
