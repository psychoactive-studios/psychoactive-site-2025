precision highp float;
uniform float uTime;
uniform sampler2D uTexture;
uniform vec2 uMouse;
uniform float uStrength;

varying vec2 vUv;

const float radius = 0.95;

vec2 bulge(vec2 uv, vec2 center, float strength) {
  uv -= center;

  float dist = length(uv) / radius;
  float distPow = pow(dist, 2.0);

  // Interpolate between no bulge (1.0) and full bulge (strength)
  float bulgeAmount = mix(1.0, 1.0 / (1.0 + distPow), strength);
  uv *= bulgeAmount;

  uv += center;

  return uv;
}

void main() {
  vec2 bulgeUV = bulge(vUv, uMouse, uStrength);

  if (bulgeUV.x < 0.0 || bulgeUV.x > 1.0 || bulgeUV.y < 0.0 || bulgeUV.y > 1.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec4 tex = texture2D(uTexture, bulgeUV);

  gl_FragColor.rgb = tex.rgb;
  gl_FragColor.a = tex.a;
}
