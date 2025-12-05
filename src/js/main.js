// src/js/main.js

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import {
  bottomScreenTexture,
  topScreenTexture,
  setMode,
  renderScreens,
  handleUiButton,
} from './ds-ui.js';

console.log('✅ Three.js version:', THREE.REVISION);

const canvas = document.getElementById('webgl');

// Will hold references to real button meshes
const buttonMeshes = {};

// Map logical button IDs to mesh names from Blender
const BUTTON_CONFIG = [
  { id: 'A',       name: 'Button_A' },
  { id: 'B',       name: 'Button_B' },
  { id: 'X',       name: 'Button_X' },
  { id: 'Y',       name: 'Button_Y' },
  { id: 'D_UP',    name: 'Dpad_Up' },
  { id: 'D_DOWN',  name: 'Dpad_Down' },
  { id: 'D_LEFT',  name: 'Dpad_Left' },
  { id: 'D_RIGHT', name: 'Dpad_Right' },
  { id: 'START',   name: 'Button_Start' },
  { id: 'SELECT',  name: 'Button_Select' },
];

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

// Group to hold DS + screens
const dsGroup = new THREE.Group();
scene.add(dsGroup);

// Camera
const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 2, 6);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lights
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(3, 5, 5);
scene.add(dirLight);

// Raycaster for clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// DS model + screen planes
let dsModel = null;
let bottomScreenPlane = null;
let topScreenPlane = null;

// --------------------
// LOAD DS MODEL
// --------------------

const loader = new GLTFLoader();

loader.load(
  '/public/nintendo_ds_lite_buttons.glb',
  (gltf) => {
    console.log('✅ Model loaded');
    dsModel = gltf.scene;

    // Log mesh names once for debugging
    dsModel.traverse((obj) => {
      if (obj.isMesh) {
        console.log('Mesh:', obj.name);
      }
    });

    const box = new THREE.Box3().setFromObject(dsModel);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Scale DS to a nice size
    const maxDim = Math.max(size.x, size.y, size.z);
    const desiredSize = 2.0;
    const scale = desiredSize / maxDim;
    dsModel.scale.setScalar(scale);

    // Recenter DS at origin
    box.setFromObject(dsModel);
    box.getSize(size);
    box.getCenter(center);
    dsModel.position.sub(center);

    dsGroup.add(dsModel);

    // Hook up button meshes
    BUTTON_CONFIG.forEach((config) => {
      let found = null;

      dsModel.traverse((obj) => {
        if (!obj.isMesh) return;
        if (obj.name === config.name) {
          found = obj;
        }
      });

      if (found) {
        buttonMeshes[config.id] = found;
        found.userData.buttonId = config.id;
        found.userData.originalPosition = found.position.clone();
        console.log(`🔘 Found button ${config.id}:`, found.name);
      } else {
        console.warn(`⚠️ Button mesh not found for`, config);
      }
    });

    // Camera fit
    const fitHeightDistance =
      size.y / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    const fitWidthDistance = fitHeightDistance / camera.aspect;
    const distance = Math.max(fitHeightDistance, fitWidthDistance);

    camera.position.set(0, distance * 0.6, distance * 1.6);
    camera.lookAt(0, 0, 0);

    controls.target.set(0, 0, 0);
    controls.minDistance = distance * 0.5;
    controls.maxDistance = distance * 3.0;
    controls.update();

    // Bottom screen overlay plane
    const bottomGeom = new THREE.PlaneGeometry(0.94, 0.71);
    const bottomMat = new THREE.MeshBasicMaterial({
      map: bottomScreenTexture,
      transparent: true,
    });

    bottomScreenPlane = new THREE.Mesh(bottomGeom, bottomMat);
    bottomScreenPlane.position.set(-0.00005, -0.396, 0.328);
    bottomScreenPlane.rotation.x = -1.571; // -90deg in radians-ish
    bottomScreenPlane.translateZ(0.003);
    dsGroup.add(bottomScreenPlane);

    // Top screen overlay plane
    const topGeom = new THREE.PlaneGeometry(0.94, 0.71);
    const topMat = new THREE.MeshBasicMaterial({
      map: topScreenTexture,
      transparent: true,
    });

    topScreenPlane = new THREE.Mesh(topGeom, topMat);
    topScreenPlane.position.set(-0.005, 0.154, -0.482);
    topScreenPlane.rotation.x = -0.611;
    topScreenPlane.translateZ(0.0005);
    dsGroup.add(topScreenPlane);

    // Start on intro screen
    setMode('intro');
  },
  undefined,
  (error) => {
    console.error('❌ Error loading model:', error);
  }
);

// --------------------
// INPUT / INTERACTION
// --------------------

function handleButtonPress(id, mesh) {
  // 3D press animation
  if (mesh && mesh.userData.originalPosition) {
    mesh.position.y -= 0.01;
    setTimeout(() => {
      mesh.position.copy(mesh.userData.originalPosition);
    }, 120);
  }

  // Hand off to DS UI logic
  handleUiButton(id);
}

function onPointerDown(event) {
  const rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const targets = Object.values(buttonMeshes);
  if (targets.length === 0) return;

  const intersects = raycaster.intersectObjects(targets, true);
  if (intersects.length === 0) return;

  let hit = intersects[0].object;
  while (hit && !hit.userData.buttonId) {
    hit = hit.parent;
  }
  if (!hit || !hit.userData.buttonId) return;

  const id = hit.userData.buttonId;
  handleButtonPress(id, hit);
}

window.addEventListener('pointerdown', onPointerDown);

// --------------------
// ANIMATION LOOP
// --------------------

function animate(timestamp = 0) {
  requestAnimationFrame(animate);

  // Update the DS screens
  renderScreens(timestamp);

  // Slight idle motion (optional, comment out if you don't like it)
  // dsGroup.rotation.y = Math.sin(timestamp * 0.0002) * 0.08;

  controls.update();
  renderer.render(scene, camera);
}

animate();

// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
