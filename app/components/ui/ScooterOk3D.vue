<template>
  <div ref="container" class="scooter-ok-3d" @click="handleClick" />
</template>

<script setup>
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const props = defineProps({
  modelPath: {
    type: String,
    default: '',
  },
  modelPaths: {
    type: Array,
    default: () => [],
  },
  pointSize: {
    type: Number,
    default: 0.0001,
  },
  pointColor: {
    type: String,
    default: '#ffffff',
  },
});

const container = ref(null);
let scene, camera, renderer, animationId, clock, controls;

let loader;
let activeModelIndex = 0;
let activeModel;
let activeMixer;

let isTransitioning = false;
let transitionPoints;
let transitionState;

const modelsCache = new Map();

const getModelPaths = () => {
  const list = Array.isArray(props.modelPaths)
    ? props.modelPaths.filter(Boolean)
    : [];
  if (list.length) return list;
  if (props.modelPath) return [props.modelPath];
  return [];
};

const easeInOutQuad = (t) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

const seeded01 = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const lerp = (a, b, t) => a + (b - a) * t;

const computeCameraParamsFromSize = (size) => {
  const maxDim = Math.max(size?.x || 0, size?.y || 0, size?.z || 0);
  if (!maxDim || !Number.isFinite(maxDim)) {
    return {
      z: 5,
      near: 0.1,
      far: 1000,
    };
  }
  return {
    z: maxDim * 1.5,
    near: maxDim / 100,
    far: maxDim * 100,
  };
};

const computeRadiusFromPositions = (positions) => {
  if (!positions || positions.length < 3) return 1;
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i + 0];
    const y = positions[i + 1];
    const z = positions[i + 2];
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (z < minZ) minZ = z;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
    if (z > maxZ) maxZ = z;
  }
  const dx = maxX - minX;
  const dy = maxY - minY;
  const dz = maxZ - minZ;
  const diag = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return Math.max(0.0001, diag * 0.5);
};

const disposeObject3D = (root) => {
  if (!root) return;
  root.traverse((object) => {
    if (object.geometry) object.geometry.dispose();
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach((material) => material.dispose());
      } else {
        object.material.dispose();
      }
    }
  });
};

const convertModelMeshesToPoints = (model) => {
  const meshesToConvert = [];
  model.traverse((child) => {
    if (child && child.isMesh) meshesToConvert.push(child);
  });

  meshesToConvert.forEach((mesh) => {
    const geometry = mesh.geometry;
    const material = new THREE.PointsMaterial({
      color: new THREE.Color(props.pointColor),
      size: props.pointSize,
      sizeAttenuation: true,
    });

    let points;
    if (mesh.isSkinnedMesh) {
      points = new THREE.Points(geometry, material);
      points.isSkinnedMesh = true;
      points.bindMode = mesh.bindMode;
      points.bindMatrix = mesh.bindMatrix;
      points.bindMatrixInverse = mesh.bindMatrixInverse;
      points.skeleton = mesh.skeleton;

      points.bind = THREE.SkinnedMesh.prototype.bind;
      points.pose = THREE.SkinnedMesh.prototype.pose;
      points.normalizeSkinWeights =
        THREE.SkinnedMesh.prototype.normalizeSkinWeights;
      points.updateMatrixWorld = THREE.SkinnedMesh.prototype.updateMatrixWorld;

      material.onBeforeCompile = (shader) => {
        shader.vertexShader = `
          #define USE_SKINNING
          ${shader.vertexShader}
        `;
        shader.vertexShader = shader.vertexShader.replace(
          '#include <common>',
          `
          #include <common>
          #include <skinning_pars_vertex>
          `
        );
        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `
          #include <begin_vertex>
          #include <skinbase_vertex>
          #include <skinning_vertex>
          `
        );
        shader.uniforms.bindMatrix = { value: mesh.bindMatrix };
        shader.uniforms.bindMatrixInverse = { value: mesh.bindMatrixInverse };
      };
    } else {
      points = new THREE.Points(geometry, material);
    }

    points.name = mesh.name;
    points.position.copy(mesh.position);
    points.rotation.copy(mesh.rotation);
    points.scale.copy(mesh.scale);

    if (mesh.parent) {
      mesh.parent.add(points);
      mesh.parent.remove(mesh);
    }
  });
};

const extractWorldPositions = (model) => {
  const out = [];
  const tmp = new THREE.Vector3();

  model.updateMatrixWorld(true);
  model.traverse((obj) => {
    if (!obj) return;
    if (!(obj.isPoints || obj.isMesh)) return;
    const geom = obj.geometry;
    const attr = geom?.attributes?.position;
    if (!attr) return;

    for (let i = 0; i < attr.count; i++) {
      tmp.fromBufferAttribute(attr, i);
      tmp.applyMatrix4(obj.matrixWorld);
      out.push(tmp.x, tmp.y, tmp.z);
    }
  });

  return new Float32Array(out);
};

const extractWorldPositionsDeformed = (model) => {
  const out = [];
  const tmp = new THREE.Vector3();
  const skinFn =
    THREE.SkinnedMesh?.prototype?.applyBoneTransform ||
    THREE.SkinnedMesh?.prototype?.boneTransform;

  model.updateMatrixWorld(true);

  model.traverse((obj) => {
    if (!obj) return;
    if (!(obj.isPoints || obj.isMesh)) return;

    const geom = obj.geometry;
    const posAttr = geom?.attributes?.position;
    if (!posAttr) return;

    const canSkin =
      !!obj.skeleton &&
      !!geom?.attributes?.skinIndex &&
      !!geom?.attributes?.skinWeight &&
      !!obj.bindMatrix &&
      !!obj.bindMatrixInverse;

    if (canSkin) {
      // гарантуємо актуальні bone matrices
      obj.skeleton.update();

      if (!skinFn) {
        // Fallback: can't sample skinned deformation in this three build
        for (let i = 0; i < posAttr.count; i++) {
          tmp.fromBufferAttribute(posAttr, i);
          tmp.applyMatrix4(obj.matrixWorld);
          out.push(tmp.x, tmp.y, tmp.z);
        }
        return;
      }

      for (let i = 0; i < posAttr.count; i++) {
        tmp.fromBufferAttribute(posAttr, i);

        // беремо поточну деформацію від скелета (як у SkinnedMesh)
        skinFn.call(obj, i, tmp);

        tmp.applyMatrix4(obj.matrixWorld);
        out.push(tmp.x, tmp.y, tmp.z);
      }
      return;
    }

    // не-skinned геометрія
    for (let i = 0; i < posAttr.count; i++) {
      tmp.fromBufferAttribute(posAttr, i);
      tmp.applyMatrix4(obj.matrixWorld);
      out.push(tmp.x, tmp.y, tmp.z);
    }
  });

  return new Float32Array(out);
};

const resamplePositions = (srcPositions, targetCount, seedBase = 1) => {
  const srcCount = Math.floor((srcPositions?.length || 0) / 3);
  const out = new Float32Array(targetCount * 3);
  if (!srcCount || !targetCount) return out;

  for (let i = 0; i < targetCount; i++) {
    const r = seeded01(seedBase + i * 12.9898);
    const srcIndex = Math.floor(r * srcCount);
    const si = srcIndex * 3;
    const di = i * 3;
    out[di + 0] = srcPositions[si + 0];
    out[di + 1] = srcPositions[si + 1];
    out[di + 2] = srcPositions[si + 2];
  }

  return out;
};

const buildExplodedPositions = (fromPositions, spread, seedBase = 123) => {
  const out = new Float32Array(fromPositions.length);
  for (let i = 0; i < fromPositions.length; i += 3) {
    const a = seeded01(seedBase + i * 0.17) * Math.PI * 2;
    const b = seeded01(seedBase + i * 0.31) * Math.PI * 2;
    const r = lerp(spread * 0.3, spread, seeded01(seedBase + i * 0.73));
    const dx = Math.cos(a) * Math.sin(b) * r;
    const dy = Math.sin(a) * Math.sin(b) * r;
    const dz = Math.cos(b) * r;
    out[i + 0] = fromPositions[i + 0] + dx;
    out[i + 1] = fromPositions[i + 1] + dy;
    out[i + 2] = fromPositions[i + 2] + dz;
  }
  return out;
};

const ensureLoadedModel = async (path) => {
  if (modelsCache.has(path)) return modelsCache.get(path);
  if (!loader) loader = new GLTFLoader();

  const gltf = await new Promise((resolve, reject) => {
    loader.load(path, resolve, undefined, reject);
  });

  const model = gltf.scene;
  convertModelMeshesToPoints(model);

  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  model.position.sub(center);

  const cameraParams = computeCameraParamsFromSize(size);

  let mixer;
  if (gltf.animations && gltf.animations.length) {
    mixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
  }

  const extracted = extractWorldPositions(model);
  const radius = computeRadiusFromPositions(extracted);

  const record = {
    path,
    model,
    mixer,
    size,
    radius,
    cameraParams,
    extractedPositions: extracted,
  };

  modelsCache.set(path, record);
  return record;
};

const setActiveModel = (record, options = {}) => {
  if (!scene || !record) return;

  const { applyCamera = false } = options;

  if (activeModel) {
    scene.remove(activeModel);
  }

  activeModel = record.model;
  activeMixer = record.mixer;

  scene.add(activeModel);

  if (applyCamera && camera) {
    const next =
      record.cameraParams || computeCameraParamsFromSize(record.size);
    camera.near = next.near;
    camera.far = next.far;
    camera.position.z = next.z;
    camera.updateProjectionMatrix();
  }
};

const startTransitionToIndex = async (nextIndex) => {
  const paths = getModelPaths();
  if (isTransitioning) return;
  if (!paths.length) return;
  if (nextIndex === activeModelIndex) return;

  const currentPath = paths[activeModelIndex];
  const nextPath = paths[nextIndex];
  if (!currentPath || !nextPath) return;

  isTransitioning = true;

  const currentRecord = await ensureLoadedModel(currentPath);
  const nextRecord = await ensureLoadedModel(nextPath);

  const camFrom = {
    z: camera?.position?.z ?? 5,
    near: camera?.near ?? 0.1,
    far: camera?.far ?? 1000,
  };
  const camTo =
    nextRecord.cameraParams || computeCameraParamsFromSize(nextRecord.size);

  const fromRaw = activeModel
    ? extractWorldPositionsDeformed(activeModel)
    : currentRecord.extractedPositions;
  const toRaw = nextRecord.extractedPositions;
  const pointCount = Math.max(
    Math.floor(fromRaw.length / 3),
    Math.floor(toRaw.length / 3)
  );

  const fromPositions = resamplePositions(
    fromRaw,
    pointCount,
    10 + activeModelIndex
  );
  const toPositions = resamplePositions(toRaw, pointCount, 20 + nextIndex);

  const spread = Math.max(
    0.5,
    (computeRadiusFromPositions(fromRaw) + nextRecord.radius) * 0.75
  );
  const exploded = buildExplodedPositions(
    fromPositions,
    spread,
    999 + nextIndex
  );

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(fromPositions), 3)
  );
  const material = new THREE.PointsMaterial({
    color: new THREE.Color(props.pointColor),
    size: props.pointSize,
    sizeAttenuation: true,
  });

  transitionPoints = new THREE.Points(geometry, material);
  transitionPoints.frustumCulled = false;

  if (activeModel) activeModel.visible = false;
  scene.add(transitionPoints);

  transitionState = {
    startMs: performance.now(),
    durationMs: 2000,
    from: fromPositions,
    to: toPositions,
    exploded,
    nextIndex,
    camFrom,
    camTo,
  };
};

const finishTransition = () => {
  if (transitionPoints) {
    scene.remove(transitionPoints);
    if (transitionPoints.geometry) transitionPoints.geometry.dispose();
    if (transitionPoints.material) transitionPoints.material.dispose();
  }
  transitionPoints = undefined;
  transitionState = undefined;
  isTransitioning = false;
};

const handleClick = () => {
  const paths = getModelPaths();
  if (paths.length <= 1) return;
  if (isTransitioning) return;
  const nextIndex = (activeModelIndex + 1) % paths.length;
  startTransitionToIndex(nextIndex);
};

const init = () => {
  if (!container.value) return;

  const paths = getModelPaths();
  if (!paths.length) {
    console.warn('[ScooterOk3D] No modelPath/modelPaths provided');
    return;
  }

  clock = new THREE.Clock();

  // Scene
  scene = new THREE.Scene();

  // Camera
  const width = container.value.clientWidth;
  const height = container.value.clientHeight;
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 5;

  // Renderer
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.value.appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Load first model + prefetch the rest
  ensureLoadedModel(paths[0])
    .then((record) => {
      activeModelIndex = 0;
      setActiveModel(record, { applyCamera: true });

      // background prefetch
      paths.slice(1).forEach((p) => {
        ensureLoadedModel(p).catch(() => {
          // ignore
        });
      });
    })
    .catch((error) => {
      console.error('An error happened loading the GLTF model:', error);
    });

  // Lights (optional, but points material is usually unlit unless using specific shaders,
  // standard PointsMaterial is affected by lights only if map is used or vertex colors,
  // actually PointsMaterial is not affected by lights by default, it's a basic material.
  // So lights are not strictly needed for basic dots)

  animate();
  window.addEventListener('resize', onWindowResize);
};

const animate = () => {
  animationId = requestAnimationFrame(animate);

  if (clock) {
    const delta = clock.getDelta();
    if (activeMixer && !isTransitioning) activeMixer.update(delta);
  }

  if (controls) controls.update();

  // Rotate scene slightly for visibility
  // if (scene) {
  //   scene.rotation.y += 0.002;
  // }

  if (transitionState && transitionPoints) {
    const now = performance.now();
    const elapsed = now - transitionState.startMs;
    const t = Math.min(1, Math.max(0, elapsed / transitionState.durationMs));
    const posAttr = transitionPoints.geometry.getAttribute('position');
    const arr = posAttr.array;

    if (t < 0.5) {
      const u = easeInOutQuad(t / 0.5);
      for (let i = 0; i < arr.length; i++) {
        arr[i] = lerp(transitionState.from[i], transitionState.exploded[i], u);
      }
    } else {
      const u = easeInOutQuad((t - 0.5) / 0.5);
      for (let i = 0; i < arr.length; i++) {
        arr[i] = lerp(transitionState.exploded[i], transitionState.to[i], u);
      }
    }

    posAttr.needsUpdate = true;

    if (camera && transitionState.camFrom && transitionState.camTo) {
      camera.position.z = lerp(
        transitionState.camFrom.z,
        transitionState.camTo.z,
        t
      );
      camera.near = lerp(
        transitionState.camFrom.near,
        transitionState.camTo.near,
        t
      );
      camera.far = lerp(
        transitionState.camFrom.far,
        transitionState.camTo.far,
        t
      );
      camera.updateProjectionMatrix();
    }

    if (t >= 1) {
      const paths = getModelPaths();
      const nextPath = paths[transitionState.nextIndex];
      const nextRecord = modelsCache.get(nextPath);
      if (nextRecord) {
        activeModelIndex = transitionState.nextIndex;
        setActiveModel(nextRecord, { applyCamera: false });
        if (activeModel) activeModel.visible = true;
      }
      finishTransition();
    }
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
};

const onWindowResize = () => {
  if (!container.value || !camera || !renderer) return;

  const width = container.value.clientWidth;
  const height = container.value.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
};

onMounted(() => {
  init();
});

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize);
  if (animationId) cancelAnimationFrame(animationId);
  if (controls) controls.dispose();

  finishTransition();

  modelsCache.forEach((record) => {
    if (record?.mixer) {
      record.mixer.stopAllAction();
      record.mixer.uncacheRoot(record.model);
    }
    disposeObject3D(record?.model);
  });
  modelsCache.clear();

  if (scene) {
    disposeObject3D(scene);
  }

  if (renderer) {
    renderer.dispose();
    if (container.value && container.value.contains(renderer.domElement)) {
      container.value.removeChild(renderer.domElement);
    }
  }
});
</script>

<style lang="scss" scoped>
.scooter-ok-3d {
  width: 100%;
  height: 100%;
  min-height: 400px; // Ensure it has some height
  position: relative;
  overflow: hidden;
  cursor: pointer;
}
</style>
