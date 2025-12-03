// src/js/main.js

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

console.log('✅ Three.js version:', THREE.REVISION);

const canvas = document.getElementById('webgl');

// Will hold references to real button meshes
const buttonMeshes = {};

// Map logical button IDs to mesh names from Blender
// Make sure the "name" values match EXACTLY what you used in Blender.
const BUTTON_CONFIG = [
  { id: 'A',       name: 'Button_A' },
  { id: 'B',       name: 'Button_B' },
  { id: 'X',       name: 'Button_X' },
  { id: 'Y',       name: 'Button_Y' },
  { id: 'D_UP',    name: 'Dpad_Up' },
  { id: 'D_DOWN',  name: 'Dpad_Down' },
  { id: 'D_LEFT',  name: 'Dpad_Left' },
  { id: 'D_RIGHT', name: 'Dpad_Right' },
  // Optional:
  { id: 'START',   name: 'Button_Start' },
  { id: 'SELECT',  name: 'Button_Select' },
];


// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

//group
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

// Axes (you can remove this later)
// const axesHelper = new THREE.AxesHelper(0.5);
// scene.add(axesHelper);

// Lights
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(3, 5, 5);
scene.add(dirLight);

// Raycaster for clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// DS model + bottom screen
let dsModel = null;
let bottomScreenPlane = null;
let topScreenPlane = null;

// Simple "screens" state machine
const screens = ['home', 'projects', 'about', 'contact'];
let screenIndex = 0;

function updateBottomScreenVisual() {
  if (!bottomScreenPlane) return;

  const colors = {
    home: 0x222244,
    projects: 0x224422,
    about: 0x442222,
    contact: 0x444422,
  };

  const current = screens[screenIndex];
  bottomScreenPlane.material.color.setHex(colors[current]);
  console.log('📺 Bottom screen ->', current);
}

// Load DS model

const loader = new GLTFLoader();

loader.load(
  '/public/nintendo_ds_lite_buttons.glb',
  (gltf) => {
    console.log('✅ Model loaded');
    dsModel = gltf.scene;
    // TEMP: log all mesh names so we can see what the buttons are called
    dsModel.traverse((obj) => {
      if (obj.isMesh) {
        console.log('Mesh:', obj.name);
      }
    });


    // --- Normalize scale + center model ---
    const box = new THREE.Box3().setFromObject(dsModel);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    console.log('Model size:', size);
    console.log('Model center:', center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const desiredSize = 2.0; // world size for the DS
    const scale = desiredSize / maxDim;
    dsModel.scale.setScalar(scale);

    // Recompute after scaling
    box.setFromObject(dsModel);
    box.getSize(size);
    box.getCenter(center);

    // Center DS at origin
    dsModel.position.sub(center);

    // Add DS to group
    dsGroup.add(dsModel);

    // --- Find and store button meshes by name ---
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

    // --- Camera placement ---
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

    // --- Bottom screen overlay plane ---
    const bottomGeom = new THREE.PlaneGeometry(1.10, 0.74);
    const bottomMat = new THREE.MeshBasicMaterial({
      color: 0x222244,        // "home" color
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
    });

    bottomScreenPlane = new THREE.Mesh(bottomGeom, bottomMat);

    // Your tuned values
    bottomScreenPlane.position.set(-0.005, -0.396, 0.328);
    bottomScreenPlane.rotation.x = -1.571;
    // Nudge a tiny bit out from the plastic to avoid z-fighting

    dsGroup.add(bottomScreenPlane);

    console.log('Bottom screen plane position (world):', bottomScreenPlane.position);

    updateBottomScreenVisual();

    // --- Top screen overlay plane ---
    const topGeom = new THREE.PlaneGeometry(1.10, 0.70);
    const topMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,        // bright for now so you can SEE it
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55,
    });

    topScreenPlane = new THREE.Mesh(topGeom, topMat);

    // Your tuned values
    topScreenPlane.position.set(-0.040, 0.154, -0.482);
    topScreenPlane.rotation.x = -0.611;
    // Push slightly outward along its local normal so it sits on top of the screen
    topScreenPlane.translateZ(0.0005);

    dsGroup.add(topScreenPlane);

    console.log('Top screen plane position (world):', topScreenPlane.position);
  },
  undefined,
  (error) => {
    console.error('❌ Error loading model:', error);
  }
);


// Pointer → bottom screen detection
function onPointerDown(event) {
  const rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // 1) Touchscreen first
  if (bottomScreenPlane) {
    const screenHits = raycaster.intersectObject(bottomScreenPlane, true);
    if (screenHits.length > 0) {
      screenIndex = (screenIndex + 1) % screens.length;
      updateBottomScreenVisual();
      return;
    }
  }

  // 2) Then check DS model for D-pad meshes
  if (!dsModel) return;

  const hits = raycaster.intersectObject(dsModel, true);
  if (hits.length === 0) return;

  let obj = hits[0].object;
  while (obj && !obj.isMesh) {
    obj = obj.parent;
  }
  if (!obj) return;

  const lname = obj.name.toLowerCase();
  console.log('Clicked mesh:', obj.name);

  if (lname === 'dpad_up') {
    console.log('🎮 D-PAD UP');
  } else if (lname === 'dpad_down') {
    console.log('🎮 D-PAD DOWN');
  } else if (lname === 'dpad_left') {
    console.log('🎮 D-PAD LEFT');
  } else if (lname === 'dpad_right') {
    console.log('🎮 D-PAD RIGHT');
  }
}

window.addEventListener('pointerdown', onPointerDown);


function handleButtonPress(id, mesh) {
  console.log('🎮 Button pressed:', id);

  // Tiny visual press animation
  if (mesh && mesh.userData.originalPosition) {
    mesh.position.y -= 0.01; // push it down a bit

    setTimeout(() => {
      mesh.position.copy(mesh.userData.originalPosition);
    }, 120);
  }

  // Hook into your menu logic here:
  switch (id) {
    case 'A':
      // e.g. confirm / open selected option
      break;
    case 'B':
      // e.g. back / close
      break;
    case 'X':
    case 'Y':
      // maybe cycle themes or projects
      break;
    case 'D_UP':
      // move selection up on bottom screen
      break;
    case 'D_DOWN':
      // move selection down on bottom screen
      break;
    case 'D_LEFT':
      // previous tab / previous project
      break;
    case 'D_RIGHT':
      // next tab / next project
      break;
    // case 'START':
    // case 'SELECT':
    //   ...
  }
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

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
