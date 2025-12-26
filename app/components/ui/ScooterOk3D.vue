<template>
  <div ref="container" class="scooter-ok-3d"></div>
</template>

<script setup>
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const props = defineProps({
  modelPath: {
    type: String,
    required: true,
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
let scene, camera, renderer, animationId, mixer, clock, controls;

const init = () => {
  if (!container.value) return;

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

  // Load Model
  const loader = new GLTFLoader();
  loader.load(
    props.modelPath,
    (gltf) => {
      const model = gltf.scene;

      const meshesToConvert = [];

      console.log('gltf', gltf);

      model.traverse((child) => {
        if (child.isMesh) {
          meshesToConvert.push(child);
        }
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
          points.updateMatrixWorld =
            THREE.SkinnedMesh.prototype.updateMatrixWorld;

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
            shader.uniforms.bindMatrixInverse = {
              value: mesh.bindMatrixInverse,
            };
          };
        } else {
          points = new THREE.Points(geometry, material);
        }

        points.name = mesh.name;

        // Copy transforms
        points.position.copy(mesh.position);
        points.rotation.copy(mesh.rotation);
        points.scale.copy(mesh.scale);

        // If the mesh has a parent, replace mesh with points
        if (mesh.parent) {
          mesh.parent.add(points);
          mesh.parent.remove(mesh);
        }
      });

      // Center the model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      model.position.x += model.position.x - center.x;
      model.position.y += model.position.y - center.y;
      model.position.z += model.position.z - center.z;

      scene.add(model);
      if (gltf.animations && gltf.animations.length) {
        mixer = new THREE.AnimationMixer(model);
        console.log('Animations:', mixer);

        gltf.animations.forEach((clip) => {
          console.log('Mixer:', mixer.clipAction(clip));

          mixer.clipAction(clip).play();
        });
      }

      // Adjust camera based on model size
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        camera.near = maxDim / 100;
        camera.far = maxDim * 100;
        camera.updateProjectionMatrix();
        camera.position.z = maxDim * 1.5;
      }
    },
    undefined,
    (error) => {
      console.error('An error happened loading the GLTF model:', error);
    }
  );

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
    if (mixer) mixer.update(delta);
  }

  if (controls) controls.update();

  // Rotate scene slightly for visibility
  if (scene) {
    scene.rotation.y += 0.002;
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

  if (scene) {
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
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
}
</style>
