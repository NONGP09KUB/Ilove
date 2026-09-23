import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

const canvas = document.querySelector('#sceneCanvas');
const wrap = document.querySelector('#canvasWrap');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

scene.add(new THREE.HemisphereLight(0xfff4e9, 0xe89bb1, 2.2));
const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
keyLight.position.set(-4, 7, 5); keyLight.castShadow = true; scene.add(keyLight);
const pinkLight = new THREE.PointLight(0xff6799, 4, 8); pinkLight.position.set(0, 2, 1); scene.add(pinkLight);
camera.position.set(0, 1.2, 8.7);

const root = new THREE.Group(); root.position.y = -.25; scene.add(root);

// Lamp stays centered in the scene — this group never moves horizontally, only vertically when pulled.
const lamp = new THREE.Group(); lamp.position.set(0, 2.45, .2); root.add(lamp);
const lampHomeY = 2.45;
const cordLength = 2.1;
const cord = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, cordLength), new THREE.MeshStandardMaterial({ color: 0x77425b, roughness: .8 })); cord.position.y = cordLength / 2; lamp.add(cord);
const cap = new THREE.Mesh(new THREE.CylinderGeometry(.58, .43, .18, 32), new THREE.MeshStandardMaterial({ color: 0xf9c24e, roughness: .4, metalness: .1 })); cap.position.y = .02; cap.castShadow = true; lamp.add(cap);
const shade = new THREE.Mesh(new THREE.CylinderGeometry(.7, .96, .68, 32, 1, false), new THREE.MeshStandardMaterial({ color: 0xff8dad, roughness: .6, side: THREE.DoubleSide })); shade.position.y = -.35; shade.castShadow = true; lamp.add(shade);
const glow = new THREE.Mesh(new THREE.SphereGeometry(.27, 20, 20), new THREE.MeshBasicMaterial({ color: 0xfff5ca })); glow.position.y = -.63; lamp.add(glow);
const ring = new THREE.Mesh(new THREE.TorusGeometry(.25, .035, 10, 24), new THREE.MeshStandardMaterial({ color: 0xffd567, emissive: 0xffbd53, emissiveIntensity: .6 })); ring.position.y = -.72; lamp.add(ring);

const floor = new THREE.Mesh(new THREE.CircleGeometry(4.7, 64), new THREE.MeshBasicMaterial({ color: 0xf6bdcd, transparent: true, opacity: .45 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -2.05; floor.position.z = -.7; root.add(floor);
const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.4, .12, 64), new THREE.MeshStandardMaterial({ color: 0xf4b1c5, roughness: 1 })); pedestal.position.set(0, -1.95, 0); pedestal.receiveShadow = true; root.add(pedestal);

function heartShape() {
  const shape = new THREE.Shape(); shape.moveTo(0, -.25); shape.bezierCurveTo(-.7, -.75, -1.1, .05, 0, .72); shape.bezierCurveTo(1.1, .05, .7, -.75, 0, -.25); return shape;
}
const heartGeometry = new THREE.ExtrudeGeometry(heartShape(), { depth: .12, bevelEnabled: true, bevelSegments: 2, bevelSize: .04, bevelThickness: .03 }); heartGeometry.center();

// --- Orbiting hearts -------------------------------------------------
// Instead of one static heart, a ring of hearts spins 360° around the lamp
// once the cord has been pulled far enough.
const HEART_COUNT = 4;
const heartGroup = new THREE.Group();
heartGroup.position.copy(lamp.position); // orbit is centered on the lamp
scene.add(heartGroup);

const hearts = [];
const letters = [
  { title: 'แค่เห็นเธอยิ้ม', body: 'วันธรรมดาของเราก็เหมือนมีแสงแดดเพิ่มขึ้นมาอีกนิด ขอบคุณที่เป็นเธอนะ', sender: 'จากคนที่แอบมองเธออยู่เสมอ' },
  { title: 'เธอเก่งมากเลยนะ', body: 'ไม่ว่าวันนี้จะเหนื่อยแค่ไหน อยากให้รู้ว่ามีคนหนึ่งคนคอยเอาใจช่วยเธออยู่ตรงนี้', sender: 'ส่งกำลังใจให้เธอเสมอ' },
  { title: 'อยากชวนเธอไปดูดาว', body: 'อยากมีช่วงเวลาธรรมดา ๆ ด้วยกัน เดินเล่น กินของอร่อย แล้วคุยกันจนลืมเวลา', sender: 'คนที่อยากใช้เวลาด้วยกัน' },
  { title: 'เธอทำให้ใจเต้น', body: 'ทุกครั้งที่เธอหันมายิ้มให้ ใจเราก็เต้นแรงจนเก็บอาการแทบไม่อยู่เลย', sender: 'ความลับที่อยากบอก' },
];
const heartColors = [0xff5f8f, 0xffd45d, 0xff8e75d6, 0xffee8065];
for (let i = 0; i < HEART_COUNT; i++) {
  const color = new THREE.Color(heartColors[i]);
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: .28,
    metalness: .08,
    emissive: color.clone().multiplyScalar(.35),
    emissiveIntensity: .4,
  });
  const mesh = new THREE.Mesh(heartGeometry, material);
  mesh.castShadow = true;
  mesh.visible = false;
  mesh.scale.setScalar(0.001); // pop-in from nothing when revealed

  mesh.userData = {
    baseScale: 0.46 + Math.random() * 0.1,
    letter: letters[i],
    angleOffset: (i / HEART_COUNT) * Math.PI * 2 + Math.random() * 0.2,
    radius: 1.15 + Math.random() * 0.35,
    heightOffset: -0.55 + Math.random() * 0.3, // relative to lamp's glow, not the world
    speed: 0.35 + Math.random() * 0.25,
    bobSpeed: 1.1 + Math.random() * 0.6,
    bobOffset: Math.random() * Math.PI * 2,
    bobAmount: 0.06 + Math.random() * 0.05,
    revealDelay: i * 0.06, // stagger the pop-in so they don't all appear at once
  };

  heartGroup.add(mesh);
  hearts.push(mesh);
}

let heartsRevealed = false;
let revealStartTime = 0;

function resize() { const width = wrap.clientWidth; const height = wrap.clientHeight; renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); }
window.addEventListener('resize', resize); resize();

const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2(); let dragging = false;
let dragStartY = 0;
function pointerPosition(event) { const rect = canvas.getBoundingClientRect(); pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1; }
function getLampHit(event) { pointerPosition(event); raycaster.setFromCamera(pointer, camera); return raycaster.intersectObjects(lamp.children, false).length > 0; }

canvas.addEventListener('pointerdown', event => { if (!getLampHit(event)) return; dragging = true; dragStartY = event.clientY; canvas.setPointerCapture(event.pointerId); });
canvas.addEventListener('pointermove', event => {
  if (!dragging) return;
  const pullDistance = THREE.MathUtils.clamp((event.clientY - dragStartY) / 92, -0.2, 1.7);
  lamp.position.y = lampHomeY - pullDistance;
  lamp.rotation.z = THREE.MathUtils.clamp((event.clientX - (canvas.getBoundingClientRect().left + canvas.clientWidth / 2)) / 900, -.16, .16);
  cord.scale.y = 1 + pullDistance / cordLength;
  cord.position.y = cordLength / 2 + pullDistance / 2;
  if (pullDistance > .35 && !heartsRevealed) {
    heartsRevealed = true;
    revealStartTime = clock.getElapsedTime();
    hearts.forEach(h => { h.visible = true; });
  }
});
canvas.addEventListener('pointerup', event => { dragging = false; canvas.releasePointerCapture(event.pointerId); });

canvas.addEventListener('click', event => {
  if (!heartsRevealed) return;
  pointerPosition(event); raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(hearts, false)[0];
  if (!hit) return;
  const mesh = hit.object;
  mesh.material.emissiveIntensity = .9;
  window.setTimeout(() => { mesh.material.emissiveIntensity = .4; }, 500);
  const letter = mesh.userData.letter;
  document.querySelector('#letterTitle').textContent = letter.title;
  document.querySelector('#letterBody').textContent = letter.body;
  document.querySelector('#letterSender').textContent = letter.sender;
  document.querySelector('#letterModal').classList.add('is-open');
  document.querySelector('#letterClose').focus();
});

const clock = new THREE.Clock();
function animate() {
  const time = clock.getElapsedTime();

  if (!dragging) {
    lamp.position.y = THREE.MathUtils.damp(lamp.position.y, lampHomeY, 5, 1 / 60);
    lamp.rotation.z = THREE.MathUtils.damp(lamp.rotation.z, Math.sin(time * 1.4) * .035, 5, 1 / 60);
    cord.scale.y = THREE.MathUtils.damp(cord.scale.y, 1, 5, 1 / 60);
    cord.position.y = THREE.MathUtils.damp(cord.position.y, cordLength / 2, 5, 1 / 60);
  }
  lamp.rotation.y = Math.sin(time * .8) * .12;

  // Keep the orbit centered on the lamp as it moves (e.g. while being pulled).
  heartGroup.position.y = lamp.position.y;

  if (heartsRevealed) {
    hearts.forEach(h => {
      const d = h.userData;
      const revealT = THREE.MathUtils.clamp((time - revealStartTime - d.revealDelay) / 0.5, 0, 1);
      const popScale = d.baseScale * (revealT < 1 ? THREE.MathUtils.smoothstep(revealT, 0, 1) : 1);
      h.scale.setScalar(popScale);

      const angle = time * d.speed + d.angleOffset; // continuous 360° orbit
      const bob = Math.sin(time * d.bobSpeed + d.bobOffset) * d.bobAmount;
      h.position.set(
        Math.cos(angle) * d.radius,
        d.heightOffset + bob,
        Math.sin(angle) * d.radius
      );
      h.rotation.y = -angle + Math.PI / 2; // face outward along the orbit
      h.rotation.z = Math.sin(time * 2 + d.bobOffset) * 0.1;
    });
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

const toast = document.querySelector('#toast');