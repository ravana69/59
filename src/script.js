import * as THREE from '//cdn.skypack.dev/three@0.129?min'
import { OrbitControls } from '//cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls?min'
import { EffectComposer, Pass, FullScreenQuad } from '//cdn.skypack.dev/three@0.129.0/examples/jsm/postprocessing/EffectComposer?min'
import { RenderPass } from '//cdn.skypack.dev/three@0.129.0/examples/jsm/postprocessing/RenderPass?min'
import { DualBloomPassGen } from '//cdn.jsdelivr.net/gh/ycw/three-dual-bloom@1.1.7/src/index.js'

// ----
// main 
// ----

const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 2, .1, 100);
const controls = new OrbitControls(camera, renderer.domElement);

controls.target.set(0, -.5, -.1);
camera.position.set(-.5, 1.2, 1);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2.2;
renderer.shadowMap.enabled = true;

const light = new THREE.PointLight('white', 2, 2);
light.castShadow = true;
scene.add(light);

// ---- tex0
const url0 = 'https://images.unsplash.com/photo-1623428455218-ce98f3865672?ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwzMzN8fHxlbnwwfHx8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60';
const tex0 = new THREE.TextureLoader().load(url0, (tex) => {
  tex.wrapS = THREE.MirroredRepeatWrapping;
  tex.wrapT = THREE.MirroredRepeatWrapping;
  tex.repeat.set(2, 2);
  // tex.needsUpdate = true;
});

// ---- tex1
const url1 = 'https://images.unsplash.com/photo-1567080586917-e6ab6aa0df85?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80';
const tex1 = new THREE.TextureLoader().load(url1, (tex) => {
  tex.wrapS = THREE.MirroredRepeatWrapping;
  tex.wrapT = THREE.MirroredRepeatWrapping;
  tex.repeat.set(100, 100);
  tex.offset.set(.5, 0);
  // tex.needsUpdate = true;
});

const geom = new THREE.IcosahedronGeometry(1, 10).scale(1, 1, .5);
const mat = new THREE.MeshStandardMaterial({
  alphaMap: tex0,
  alphaTest: 0.1,
  map: tex0,
  side: THREE.DoubleSide,
  metalness: 0.5, roughness: 0.5
});
const mesh = new THREE.Mesh(geom, mat);
mesh.castShadow = true;
mesh.customDistanceMaterial = new THREE.MeshDistanceMaterial({
  alphaMap: mat.alphaMap,
  alphaTest: mat.alphaTest,
});
mesh.rotation.y = Math.PI / 2;
mesh.updateMatrix();
scene.add(mesh);

// ----
// ground
// ----

{
  const geom = new THREE.PlaneGeometry(100, 100).rotateX(-0.5 * Math.PI);
  const mat = new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0, bumpMap: tex1 });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.y = -1;
  mesh.receiveShadow = true;
  scene.add(mesh);
}

// ----
// render
// ----

const DualBloomPass = DualBloomPassGen({ THREE, Pass, FullScreenQuad });

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new DualBloomPass({ threshold: .5, blurriness: .5, intensity: 2 }));

renderer.setAnimationLoop(() => {
  composer.render();
  controls.update();
  mesh.rotation.x -= 0.005;
  tex1.offset.y += 0.005;
});

// ----
// view
// ----

function resize(w, h, dpr = devicePixelRatio) {
  renderer.setPixelRatio(dpr);
  renderer.setSize(w, h, false);
  composer.setPixelRatio(dpr);
  composer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener('resize', () => resize(innerWidth, innerHeight));
dispatchEvent(new Event('resize'));
document.body.prepend(renderer.domElement);
