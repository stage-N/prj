import * as THREE from 'three';

function initHeroStage() {
const canvas = document.getElementById('heroCanvas');
const hero = document.querySelector('.hero');
if (!canvas || !hero) return;

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reducedMotion) return;

const isMobile = window.matchMedia('(max-width: 768px)').matches;

const COLORS = {
  green: 0x15b788,
  blue: 0x1395ba,
  dark: 0x333333,
};

const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: !isMobile,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(COLORS.dark, 0.045);

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
camera.position.set(0, 0, 14);

const stageGroup = new THREE.Group();
scene.add(stageGroup);

function makeRing(radius, tube, color, opacity) {
  const geo = new THREE.TorusGeometry(radius, tube, 16, 64);
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = Math.random() * Math.PI;
  mesh.rotation.y = Math.random() * Math.PI;
  return mesh;
}

const ringConfigs = isMobile
  ? [
      { r: 2.2, tube: 0.025, color: COLORS.green, opacity: 0.55, pos: [-3.5, 1.2, -2], speed: 0.12 },
      { r: 1.6, tube: 0.02, color: COLORS.blue, opacity: 0.45, pos: [3.8, -0.8, -4], speed: -0.15 },
      { r: 2.8, tube: 0.03, color: COLORS.green, opacity: 0.35, pos: [0.5, 2.5, -6], speed: 0.08 },
    ]
  : [
      { r: 2.4, tube: 0.028, color: COLORS.green, opacity: 0.6, pos: [-4.2, 1.5, -1], speed: 0.1 },
      { r: 1.8, tube: 0.022, color: COLORS.blue, opacity: 0.5, pos: [4.5, -1, -3], speed: -0.13 },
      { r: 3.0, tube: 0.032, color: COLORS.green, opacity: 0.38, pos: [1, 2.8, -5], speed: 0.07 },
      { r: 1.4, tube: 0.018, color: COLORS.blue, opacity: 0.42, pos: [-2, -2.2, -4.5], speed: 0.16 },
      { r: 2.0, tube: 0.024, color: COLORS.green, opacity: 0.32, pos: [3.2, 2, -7], speed: -0.09 },
    ];

const rings = ringConfigs.map((cfg) => {
  const ring = makeRing(cfg.r, cfg.tube, cfg.color, cfg.opacity);
  ring.position.set(...cfg.pos);
  ring.userData.speed = cfg.speed;
  stageGroup.add(ring);
  return ring;
});

const particleCount = isMobile ? 280 : 720;
const positions = new Float32Array(particleCount * 3);
const particleColors = new Float32Array(particleCount * 3);
const green = new THREE.Color(COLORS.green);
const blue = new THREE.Color(COLORS.blue);
const tmpColor = new THREE.Color();

for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * 22;
  positions[i3 + 1] = (Math.random() - 0.5) * 14;
  positions[i3 + 2] = (Math.random() - 0.5) * 16 - 3;
  tmpColor.copy(Math.random() > 0.5 ? green : blue);
  particleColors[i3] = tmpColor.r;
  particleColors[i3 + 1] = tmpColor.g;
  particleColors[i3 + 2] = tmpColor.b;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

const particles = new THREE.Points(
  particleGeo,
  new THREE.PointsMaterial({
    size: isMobile ? 0.06 : 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  })
);
stageGroup.add(particles);

const linePositions = [];
const lineColors = [];
const maxConnections = isMobile ? 40 : 90;
let connectionCount = 0;

for (let i = 0; i < particleCount && connectionCount < maxConnections; i++) {
  for (let j = i + 1; j < particleCount && connectionCount < maxConnections; j++) {
    if (Math.random() > 0.992) {
      const i3 = i * 3;
      const j3 = j * 3;
      const dx = positions[i3] - positions[j3];
      const dy = positions[i3 + 1] - positions[j3 + 1];
      const dz = positions[i3 + 2] - positions[j3 + 2];
      if (dx * dx + dy * dy + dz * dz < 9) {
        linePositions.push(
          positions[i3], positions[i3 + 1], positions[i3 + 2],
          positions[j3], positions[j3 + 1], positions[j3 + 2]
        );
        lineColors.push(0.08, 0.72, 0.53, 0.08, 0.58, 0.73);
        connectionCount++;
      }
    }
  }
}

const lineGeo = new THREE.BufferGeometry();
lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

const lines = new THREE.LineSegments(
  lineGeo,
  new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
);
stageGroup.add(lines);

function makeGlowSphere(radius, color, opacity, position) {
  const geo = new THREE.SphereGeometry(radius, 24, 24);
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(...position);
  return mesh;
}

const glows = [
  makeGlowSphere(0.35, COLORS.green, 0.35, [-2.5, 0.5, -3]),
  makeGlowSphere(0.28, COLORS.blue, 0.3, [3, -0.5, -5]),
  makeGlowSphere(0.22, COLORS.green, 0.25, [0, 1.8, -4]),
];
glows.forEach((g) => stageGroup.add(g));

let width = 0;
let height = 0;
let running = true;
let rafId = 0;
const clock = new THREE.Clock();

function resize() {
  width = hero.clientWidth;
  height = hero.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function onPointerMove(e) {
  const rect = hero.getBoundingClientRect();
  mouse.targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
  mouse.targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
}

function animate() {
  if (!running) return;
  rafId = requestAnimationFrame(animate);

  const t = clock.getElapsedTime();
  mouse.x += (mouse.targetX - mouse.x) * 0.04;
  mouse.y += (mouse.targetY - mouse.y) * 0.04;

  camera.position.x = mouse.x * 1.8;
  camera.position.y = -mouse.y * 1.2;
  camera.lookAt(0, 0, -2);

  stageGroup.rotation.y = t * 0.04 + mouse.x * 0.15;
  stageGroup.rotation.x = mouse.y * 0.08;

  rings.forEach((ring, i) => {
    ring.rotation.z += ring.userData.speed * 0.01;
    ring.rotation.x += 0.003 * (i % 2 === 0 ? 1 : -1);
    ring.position.y += Math.sin(t * 0.6 + i * 1.3) * 0.002;
  });

  glows.forEach((glow, i) => {
    const pulse = 0.25 + Math.sin(t * 1.2 + i * 2) * 0.12;
    glow.material.opacity = pulse + 0.1;
    glow.scale.setScalar(1 + Math.sin(t * 0.8 + i) * 0.08);
  });

  particles.rotation.y = t * 0.02;
  lines.rotation.y = t * 0.02;

  renderer.render(scene, camera);
}

const visibilityObserver = new IntersectionObserver(
  ([entry]) => {
    running = entry.isIntersecting;
    if (running) {
      clock.getDelta();
      animate();
    } else {
      cancelAnimationFrame(rafId);
    }
  },
  { threshold: 0.05 }
);

resize();
window.addEventListener('resize', resize, { passive: true });
hero.addEventListener('pointermove', onPointerMove, { passive: true });
visibilityObserver.observe(hero);
animate();
}

initHeroStage();
