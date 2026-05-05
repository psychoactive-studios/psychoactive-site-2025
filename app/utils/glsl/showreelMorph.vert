uniform vec2 uResolution;
uniform vec2 uTextureResolution;

varying vec2 vUv;

// Cover-style UV (object-fit: cover) — fills the box, crops as needed
vec2 resizeUvCover(vec2 uv, vec2 textureSize, vec2 displaySize) {
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
  vUv = resizeUvCover(uv, uTextureResolution, uResolution);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
