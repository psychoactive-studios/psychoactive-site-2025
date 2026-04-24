<script setup>
/**
 * FluidBackground — real-time GPU fluid simulation running full-screen
 * behind the Design Audit's loading state.
 *
 * Approach: stable-fluids (Jos Stam 2003) on the GPU via WebGL2, with
 * ping-pong framebuffers for the velocity, pressure, and dye fields.
 * Method follows Pavel Dobryakov's MIT-licensed reference closely but
 * adapted for our integration (Vue 3 SFC, URL-seeded, audit-state-aware,
 * snapshot-on-completion).
 *
 * Pipeline each frame:
 *   1. splat       — inject cursor forces + initial URL-seeded drops
 *   2. advect vel  — velocity field carried forward along itself
 *   3. curl        — compute curl of velocity (rotational component)
 *   4. vorticity   — amplify small-scale eddies for organic feel
 *   5. divergence  — compute ∇·v
 *   6. pressure    — Jacobi iterations to solve for pressure
 *   7. gradsub     — v ← v − ∇p  (enforce incompressibility)
 *   8. advect dye  — dye is advected along the final velocity
 *   9. display     — render dye field to the canvas
 *
 * Brand intent:
 *   - URL-seeded initial drops so every audited site gets a unique,
 *     repeatable piece. Same URL → same fluid evolution.
 *   - Palette: high-chroma accent hues on the dark #101012 bg.
 *     Session 2 will swap the URL-derived palette for dominant colours
 *     extracted from the audited site itself.
 *   - Cursor creates genuine fluid forces (velocity impulses), click
 *     injects fresh dye — the user literally paints into the fluid.
 *
 * Performance:
 *   - Simulation runs at a lower internal resolution (256 sim, 1024
 *     dye) and samples up to viewport.
 *   - DPR capped at 1 on the canvas — oversampling on Retina offers
 *     no perceptual benefit for a fluid sim and doubles GPU cost.
 *   - Paused while tab hidden.
 *   - Graceful no-op if WebGL2 is unavailable.
 */

const props = defineProps({
  state: { type: String, default: 'idle' },
  url: { type: String, default: '' },
});

const emit = defineEmits(['snapshot']);

const canvasRef = ref(null);

// ──────────────────────────────────────────────────────────────
// Config — tuneable constants. These are the dials we'll iterate on.
// ──────────────────────────────────────────────────────────────
const SIM_RES = 256;           // velocity + pressure field resolution
const DYE_RES = 1024;          // dye (colour) field resolution
const DENSITY_DISSIPATION = 0.98;  // dye fades over time (1 = no fade)
const VELOCITY_DISSIPATION = 0.985; // velocity fades (1 = no friction)
const PRESSURE = 0.8;          // pressure retention between frames
const PRESSURE_ITERATIONS = 20;
const CURL = 30;               // vorticity confinement strength
const SPLAT_RADIUS = 0.25;     // cursor splat size (0..1 in sim coords)
const SPLAT_FORCE = 6000;      // force magnitude when cursor moves
const AUDIT_DURATION_MS = 42000;
// ──────────────────────────────────────────────────────────────

let gl = null;
let ext = null;
let canvas = null;
let reduceMotion = false;
let running = false;
let raf = null;
let last = 0;
let startTime = 0;
let painted = false;

let velocity = null;
let dye = null;
let curl = null;
let divergence = null;
let pressure = null;

// Shader programs
let splatProgram = null;
let advectionProgram = null;
let curlProgram = null;
let vorticityProgram = null;
let divergenceProgram = null;
let pressureProgram = null;
let gradientSubtractProgram = null;
let clearProgram = null;
let displayProgram = null;

let pointer = { x: 0, y: 0, dx: 0, dy: 0, down: false, moved: false, color: [1, 1, 1] };
let initialSplats = [];

// ──────────────────────────────────────────────────────────────
// Deterministic PRNG from URL
// ──────────────────────────────────────────────────────────────
function hashString(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// HSL → RGB (0..1 each)
function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360 / 360;
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h * 12) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
  };
  return [f(0), f(8), f(4)];
}

// ──────────────────────────────────────────────────────────────
// Shader sources
// ──────────────────────────────────────────────────────────────
const vertexShaderSource = `#version 300 es
precision highp float;
in vec2 aPosition;
out vec2 vUv;
out vec2 vL;
out vec2 vR;
out vec2 vT;
out vec2 vB;
uniform vec2 texelSize;
void main () {
    vUv = aPosition * 0.5 + 0.5;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const splatShaderSource = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
out vec4 fragColor;
void main () {
    vec2 p = vUv - point.xy;
    p.x *= aspectRatio;
    vec3 splat = exp(-dot(p, p) / radius) * color;
    vec3 base = texture(uTarget, vUv).xyz;
    fragColor = vec4(base + splat, 1.0);
}`;

const advectionShaderSource = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;
out vec4 fragColor;
void main () {
    vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
    fragColor = dissipation * texture(uSource, coord);
    fragColor.a = 1.0;
}`;

const divergenceShaderSource = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
uniform sampler2D uVelocity;
out vec4 fragColor;
void main () {
    float L = texture(uVelocity, vL).x;
    float R = texture(uVelocity, vR).x;
    float T = texture(uVelocity, vT).y;
    float B = texture(uVelocity, vB).y;
    vec2 C = texture(uVelocity, vUv).xy;
    if (vL.x < 0.0) { L = -C.x; }
    if (vR.x > 1.0) { R = -C.x; }
    if (vT.y > 1.0) { T = -C.y; }
    if (vB.y < 0.0) { B = -C.y; }
    float div = 0.5 * (R - L + T - B);
    fragColor = vec4(div, 0.0, 0.0, 1.0);
}`;

const curlShaderSource = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
uniform sampler2D uVelocity;
out vec4 fragColor;
void main () {
    float L = texture(uVelocity, vL).y;
    float R = texture(uVelocity, vR).y;
    float T = texture(uVelocity, vT).x;
    float B = texture(uVelocity, vB).x;
    float vort = R - L - T + B;
    fragColor = vec4(0.5 * vort, 0.0, 0.0, 1.0);
}`;

const vorticityShaderSource = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;
out vec4 fragColor;
void main () {
    float L = texture(uCurl, vL).x;
    float R = texture(uCurl, vR).x;
    float T = texture(uCurl, vT).x;
    float B = texture(uCurl, vB).x;
    float C = texture(uCurl, vUv).x;
    vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
    force /= length(force) + 0.0001;
    force *= curl * C;
    force.y *= -1.0;
    vec2 vel = texture(uVelocity, vUv).xy;
    vel += force * dt;
    vel = clamp(vel, -1000.0, 1000.0);
    fragColor = vec4(vel, 0.0, 1.0);
}`;

const pressureShaderSource = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
out vec4 fragColor;
void main () {
    float L = texture(uPressure, vL).x;
    float R = texture(uPressure, vR).x;
    float T = texture(uPressure, vT).x;
    float B = texture(uPressure, vB).x;
    float divergence = texture(uDivergence, vUv).x;
    float pressure = (L + R + B + T - divergence) * 0.25;
    fragColor = vec4(pressure, 0.0, 0.0, 1.0);
}`;

const gradientSubtractShaderSource = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
out vec4 fragColor;
void main () {
    float L = texture(uPressure, vL).x;
    float R = texture(uPressure, vR).x;
    float T = texture(uPressure, vT).x;
    float B = texture(uPressure, vB).x;
    vec2 velocity = texture(uVelocity, vUv).xy;
    velocity.xy -= vec2(R - L, T - B);
    fragColor = vec4(velocity, 0.0, 1.0);
}`;

const clearShaderSource = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
uniform sampler2D uTexture;
uniform float value;
out vec4 fragColor;
void main () {
    fragColor = value * texture(uTexture, vUv);
}`;

// Display shader — simple premultiplied output with a subtle vignette
// so edges fall off smoothly into the page background.
const displayShaderSource = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
uniform sampler2D uTexture;
out vec4 fragColor;
void main () {
    vec3 c = texture(uTexture, vUv).rgb;
    // Subtle vignette — edges fall off ~15% toward the corners.
    vec2 centered = vUv - 0.5;
    float vig = smoothstep(0.9, 0.3, length(centered) * 1.4);
    c *= mix(0.85, 1.0, vig);
    fragColor = vec4(c, 1.0);
}`;

// ──────────────────────────────────────────────────────────────
// WebGL helpers
// ──────────────────────────────────────────────────────────────
function getWebGL(canvas) {
  const params = {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: true, // needed for snapshot via toDataURL
  };
  const gl = canvas.getContext('webgl2', params);
  if (!gl) return null;

  const floatExt = gl.getExtension('EXT_color_buffer_float');
  const halfFloatExt = gl.getExtension('EXT_color_buffer_half_float');
  const hasFloat = !!floatExt;
  const hasHalf = !!halfFloatExt;

  // Pick the best texture format available. RGBA16F preferred; RGBA8 fallback.
  const internalFormatRG = hasFloat ? gl.RG16F : (hasHalf ? gl.RG16F : gl.RGBA);
  const internalFormatRGBA = hasFloat ? gl.RGBA16F : (hasHalf ? gl.RGBA16F : gl.RGBA);
  const texType = hasFloat ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE;

  return {
    gl,
    ext: {
      internalFormatRG,
      internalFormatRGBA,
      formatRG: hasFloat ? gl.RG : gl.RGBA,
      formatRGBA: gl.RGBA,
      texType,
    },
  };
}

function compileShader(source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('[fluid] shader error:', gl.getShaderInfoLog(shader), '\n---\n', source);
  }
  return shader;
}

function makeProgram(vs, fs) {
  const program = gl.createProgram();
  gl.attachShader(program, compileShader(vs, gl.VERTEX_SHADER));
  gl.attachShader(program, compileShader(fs, gl.FRAGMENT_SHADER));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('[fluid] link error:', gl.getProgramInfoLog(program));
  }

  // Lightweight wrapper that caches uniform locations.
  const uniforms = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(program, i);
    uniforms[info.name] = gl.getUniformLocation(program, info.name);
  }
  return {
    program,
    uniforms,
    bind() {
      gl.useProgram(program);
    },
  };
}

function createFBO(w, h, internalFormat, format, type, param) {
  gl.activeTexture(gl.TEXTURE0);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.viewport(0, 0, w, h);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const texelSizeX = 1.0 / w;
  const texelSizeY = 1.0 / h;

  return {
    texture,
    fbo,
    width: w,
    height: h,
    texelSizeX,
    texelSizeY,
    attach(id) {
      gl.activeTexture(gl.TEXTURE0 + id);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      return id;
    },
  };
}

function createDoubleFBO(w, h, internalFormat, format, type, param) {
  let fbo1 = createFBO(w, h, internalFormat, format, type, param);
  let fbo2 = createFBO(w, h, internalFormat, format, type, param);
  return {
    width: w,
    height: h,
    texelSizeX: 1.0 / w,
    texelSizeY: 1.0 / h,
    get read() { return fbo1; },
    set read(v) { fbo1 = v; },
    get write() { return fbo2; },
    set write(v) { fbo2 = v; },
    swap() { const t = fbo1; fbo1 = fbo2; fbo2 = t; },
  };
}

// Fullscreen quad VAO
let blitVao = null;
function initBlit() {
  blitVao = gl.createVertexArray();
  gl.bindVertexArray(blitVao);
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
  const elementBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);
  gl.bindVertexArray(null);
}

function blit(target) {
  if (target == null) {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  } else {
    gl.viewport(0, 0, target.width, target.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
  }
  gl.bindVertexArray(blitVao);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  gl.bindVertexArray(null);
}

// ──────────────────────────────────────────────────────────────
// Setup — resources + programs
// ──────────────────────────────────────────────────────────────
function initFramebuffers() {
  const { internalFormatRG, internalFormatRGBA, formatRG, formatRGBA, texType } = ext;
  velocity = createDoubleFBO(SIM_RES, SIM_RES, internalFormatRG, formatRG, texType, gl.LINEAR);
  dye = createDoubleFBO(DYE_RES, DYE_RES, internalFormatRGBA, formatRGBA, texType, gl.LINEAR);
  curl = createFBO(SIM_RES, SIM_RES, internalFormatRG, formatRG, texType, gl.NEAREST);
  divergence = createFBO(SIM_RES, SIM_RES, internalFormatRG, formatRG, texType, gl.NEAREST);
  pressure = createDoubleFBO(SIM_RES, SIM_RES, internalFormatRG, formatRG, texType, gl.NEAREST);
}

function initPrograms() {
  splatProgram = makeProgram(vertexShaderSource, splatShaderSource);
  advectionProgram = makeProgram(vertexShaderSource, advectionShaderSource);
  curlProgram = makeProgram(vertexShaderSource, curlShaderSource);
  vorticityProgram = makeProgram(vertexShaderSource, vorticityShaderSource);
  divergenceProgram = makeProgram(vertexShaderSource, divergenceShaderSource);
  pressureProgram = makeProgram(vertexShaderSource, pressureShaderSource);
  gradientSubtractProgram = makeProgram(vertexShaderSource, gradientSubtractShaderSource);
  clearProgram = makeProgram(vertexShaderSource, clearShaderSource);
  displayProgram = makeProgram(vertexShaderSource, displayShaderSource);
}

function resizeCanvas() {
  const w = Math.floor(window.innerWidth);
  const h = Math.floor(window.innerHeight);
  canvas.width = w;
  canvas.height = h;
}

// ──────────────────────────────────────────────────────────────
// Splat — inject force + dye at a point
// ──────────────────────────────────────────────────────────────
function splat(x, y, dx, dy, color) {
  splatProgram.bind();
  gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
  gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
  gl.uniform2f(splatProgram.uniforms.point, x, y);
  gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
  gl.uniform1f(splatProgram.uniforms.radius, correctRadius(SPLAT_RADIUS / 100));
  blit(velocity.write);
  velocity.swap();

  gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
  gl.uniform3f(splatProgram.uniforms.color, color[0], color[1], color[2]);
  blit(dye.write);
  dye.swap();
}

function correctRadius(r) {
  const aspect = canvas.width / canvas.height;
  if (aspect > 1) r *= aspect;
  return r;
}

// URL-seeded initial splats. Pre-computed; dispatched by runInitialSplats
// once the fluid is warm enough to show them (~frame 2+).
function buildInitialSplats() {
  const seed = hashString(props.url || 'psychoactive');
  const rng = mulberry32(seed);
  const count = 5 + Math.floor(rng() * 3); // 5–7 drops
  const baseHue = Math.floor(rng() * 360);
  const splats = [];
  for (let i = 0; i < count; i++) {
    const hue = (baseHue + i * (45 + rng() * 60)) % 360;
    const sat = 80 + rng() * 15;
    const lit = 55 + rng() * 15;
    const [r, g, b] = hslToRgb(hue, sat, lit);
    // Keep them away from the edges and roughly composed in an arc.
    const x = 0.2 + rng() * 0.6;
    const y = 0.25 + rng() * 0.5;
    const theta = rng() * Math.PI * 2;
    const speed = 400 + rng() * 500;
    const dx = Math.cos(theta) * speed;
    const dy = Math.sin(theta) * speed;
    splats.push({ x, y, dx, dy, color: [r * 0.6, g * 0.6, b * 0.6] });
  }
  initialSplats = splats;
}

function runInitialSplats() {
  for (const s of initialSplats) {
    splat(s.x, s.y, s.dx, s.dy, s.color);
  }
  initialSplats = [];
}

// ──────────────────────────────────────────────────────────────
// Simulation step
// ──────────────────────────────────────────────────────────────
function step(dt) {
  gl.disable(gl.BLEND);

  // Curl
  curlProgram.bind();
  gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
  blit(curl);

  // Vorticity
  vorticityProgram.bind();
  gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
  gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
  gl.uniform1f(vorticityProgram.uniforms.curl, CURL);
  gl.uniform1f(vorticityProgram.uniforms.dt, dt);
  blit(velocity.write);
  velocity.swap();

  // Divergence
  divergenceProgram.bind();
  gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
  blit(divergence);

  // Clear pressure with dissipation
  clearProgram.bind();
  gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
  gl.uniform1f(clearProgram.uniforms.value, PRESSURE);
  blit(pressure.write);
  pressure.swap();

  // Pressure Jacobi
  pressureProgram.bind();
  gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
  for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
    gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
    blit(pressure.write);
    pressure.swap();
  }

  // Gradient subtract
  gradientSubtractProgram.bind();
  gl.uniform2f(gradientSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  gl.uniform1i(gradientSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
  gl.uniform1i(gradientSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
  blit(velocity.write);
  velocity.swap();

  // Advect velocity
  advectionProgram.bind();
  gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
  gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
  gl.uniform1i(advectionProgram.uniforms.uSource, velocity.read.attach(0));
  gl.uniform1f(advectionProgram.uniforms.dt, dt);
  gl.uniform1f(advectionProgram.uniforms.dissipation, VELOCITY_DISSIPATION);
  blit(velocity.write);
  velocity.swap();

  // Advect dye
  gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
  gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
  gl.uniform1f(advectionProgram.uniforms.dissipation, DENSITY_DISSIPATION);
  blit(dye.write);
  dye.swap();
}

function render() {
  displayProgram.bind();
  gl.uniform1i(displayProgram.uniforms.uTexture, dye.read.attach(0));
  blit(null);
}

// ──────────────────────────────────────────────────────────────
// Lifecycle
// ──────────────────────────────────────────────────────────────
function frame(now) {
  if (!running) return;
  if (document.hidden) {
    raf = requestAnimationFrame(frame);
    return;
  }

  const dt = Math.min(0.033, (now - last) / 1000 || 0.016);
  last = now;

  // Drain the initial URL-seeded splats on the first frame (after
  // framebuffers are ready).
  if (initialSplats.length) runInitialSplats();

  // Apply cursor splat if the pointer moved this frame.
  if (pointer.moved) {
    const aspect = canvas.width / canvas.height;
    const color = pointer.color;
    const fx = pointer.dx * SPLAT_FORCE * aspect;
    const fy = pointer.dy * SPLAT_FORCE;
    splat(pointer.x, pointer.y, fx, fy, [color[0] * 0.2, color[1] * 0.2, color[2] * 0.2]);
    pointer.moved = false;
    pointer.dx = 0;
    pointer.dy = 0;
  }

  step(dt);
  render();

  raf = requestAnimationFrame(frame);
}

function startSim() {
  if (running) return;
  if (!gl) return;
  resizeCanvas();
  // Reset state textures so replaying the sim starts clean.
  initFramebuffers();
  buildInitialSplats();
  pointer.color = [0.7, 0.7, 0.7]; // cursor paints soft white
  running = true;
  last = performance.now();
  startTime = last;
  painted = false;
  raf = requestAnimationFrame(frame);
}

function stopSim() {
  running = false;
  if (raf) cancelAnimationFrame(raf);
  raf = null;
}

function captureSnapshot() {
  if (!canvas) return null;
  try {
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

// Pointer handling — translate window coords to sim coords (0..1).
function onPointerMove(e) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = 1.0 - (e.clientY - rect.top) / rect.height;
  // Velocity delta from previous frame — used as the force vector.
  pointer.dx = (x - pointer.x);
  pointer.dy = (y - pointer.y);
  pointer.x = x;
  pointer.y = y;
  pointer.moved = Math.abs(pointer.dx) + Math.abs(pointer.dy) > 0.0005;
}

function onPointerDown(e) {
  onPointerMove(e);
  // Inject a flare of extra dye at the cursor, seeded off URL for hue.
  const seed = hashString((props.url || 'psychoactive') + ':click:' + Date.now());
  const rng = mulberry32(seed);
  const hue = Math.floor(rng() * 360);
  const [r, g, b] = hslToRgb(hue, 90, 62);
  splat(pointer.x, pointer.y, 0, 0, [r * 0.7, g * 0.7, b * 0.7]);
}

watch(
  () => props.state,
  (newState, oldState) => {
    if (newState === 'auditing') {
      if (reduceMotion) return;
      startSim();
    } else if (oldState === 'auditing' && !painted) {
      // Emit a snapshot of whatever's currently rendered, then stop.
      const dataUrl = captureSnapshot();
      if (dataUrl) emit('snapshot', dataUrl);
      painted = true;
      stopSim();
    }
  },
);

onMounted(() => {
  canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = getWebGL(canvas);
  if (!ctx) {
    console.warn('[fluid] WebGL2 not available — fluid background skipped');
    return;
  }
  gl = ctx.gl;
  ext = ctx.ext;

  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  reduceMotion = mq.matches;

  initBlit();
  initPrograms();
  resizeCanvas();
  initFramebuffers();

  window.addEventListener('resize', resizeCanvas, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerdown', onPointerDown, { passive: true });

  if (props.state === 'auditing' && !reduceMotion) {
    startSim();
  }
});

onUnmounted(() => {
  stopSim();
  window.removeEventListener('resize', resizeCanvas);
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerdown', onPointerDown);
});
</script>

<template>
  <canvas
    ref="canvasRef"
    class="fluid-background"
    :data-visible="props.state === 'auditing'"
    aria-hidden="true"
  />
</template>

<style scoped lang="scss">
.fluid-background {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 0;
  opacity: 0;
  transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  // No mix-blend — the fluid's dark-field output is designed to sit
  // directly over the page background.

  &[data-visible='true'] {
    opacity: 0.85;
  }
}

@media (prefers-reduced-motion: reduce) {
  .fluid-background {
    transition: none;
  }
}
</style>
