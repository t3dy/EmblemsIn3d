import * as THREE from 'three';
import { gsap } from 'gsap';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ParticleStream } from '../systems/Particles.js?v=3';

// Stage color palettes
const PALETTES = {
  NIGREDO:    { bg: 0x0a0502, ground: 0x1a0a00, accent: 0x8b2500, particle: 0xcc3300, glow: 0xff4400, bloom: 0.5 },
  ALBEDO:     { bg: 0x080810, ground: 0x1a1a28, accent: 0xa0c4d8, particle: 0xe0f0ff, glow: 0xffffff, bloom: 1.0 },
  CITRINITAS: { bg: 0x0d0900, ground: 0x2a1e00, accent: 0xc8a820, particle: 0xffe040, glow: 0xffd000, bloom: 0.7 },
  RUBEDO:     { bg: 0x0d0000, ground: 0x280000, accent: 0x8b0000, particle: 0xff8800, glow: 0xffcc00, bloom: 1.1 },
};

// Shared body material factory
function bodyMat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.0, ...opts });
}

export class EmblemScene {
  constructor(data, renderer, composer) {
    this.data     = data;
    this.renderer = renderer;
    this.composer = composer;
    this.scene    = new THREE.Scene();
    this.camera   = new THREE.PerspectiveCamera(
      45, window.innerWidth / window.innerHeight, 0.1, 100
    );
    this._tl      = null;
    this._streams = [];
    this._t       = 0;
    this._animObjs = [];
    this._disposables = [];
    this._controls = null;
    this.isGeneric = false;
  }

  async build() {
    const stage = this.data.alchemical_stage || 'NIGREDO';
    const pal   = PALETTES[stage] || PALETTES.NIGREDO;

    this.scene.background = new THREE.Color(pal.bg);
    this.scene.fog = new THREE.Fog(pal.bg, 10, 35);

    this._setupCamera();
    this._setupLighting(pal);
    this._buildGround(pal);

    switch (this.data.number) {
      case 4:  this._buildEmblemIV(pal);    break;
      case 5:  this._buildEmblemV(pal);     break;
      case 10: this._buildEmblemX(pal);     break;
      case 33: this._buildEmblemXXXIII(pal); break;
      case 50: this._buildEmblemL(pal);     break;
      default: this._buildGenericEmblem(pal); break;
    }

    // Update bloom strength
    const bloom = this.composer.passes.find(p => p.constructor?.name === 'UnrealBloomPass');
    if (bloom) bloom.strength = pal.bloom;

    // Orbit controls — click-drag to rotate freely around the scene
    this._controls = new OrbitControls(this.camera, this.renderer.domElement);
    this._controls.enableDamping  = true;
    this._controls.dampingFactor  = 0.05;
    this._controls.enablePan      = false;
    this._controls.minDistance    = 3;
    this._controls.maxDistance    = 18;
    this._controls.maxPolarAngle  = Math.PI * 0.78;
    this._controls.target.set(0, 0.5, 0);
    this._controls.update();
  }

  _setupCamera() {
    this.camera.position.set(0, 1.5, 8);
    this.camera.lookAt(0, 0, 0);
  }

  _setupLighting(pal) {
    const ambient = new THREE.AmbientLight(pal.ground, 0.7);
    const key     = new THREE.DirectionalLight(pal.accent, 1.8);
    key.position.set(-3, -1, 4);
    const rim = new THREE.DirectionalLight(pal.glow, 0.4);
    rim.position.set(4, 3, -2);
    const groundGlow = new THREE.PointLight(pal.accent, 2.0, 8);
    groundGlow.position.set(0, -1.2, 1);

    this.scene.add(ambient, key, rim, groundGlow);
    this._groundGlow = groundGlow;
  }

  _buildGround(pal) {
    const geo  = new THREE.PlaneGeometry(28, 28);
    const mat  = new THREE.MeshStandardMaterial({ color: pal.ground, roughness: 0.95 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -1.5;
    this.scene.add(mesh);
    this._disposables.push(geo, mat);
  }

  // ── Helper: humanoid figure ─────────────────────────────────────────────────
  _makeFigure(color, scale = 1) {
    const g   = new THREE.Group();
    const mat = bodyMat(color);
    this._disposables.push(mat);

    const torsoG = new THREE.CapsuleGeometry(0.28 * scale, 0.9 * scale, 6, 12);
    const torso  = new THREE.Mesh(torsoG, mat);
    torso.position.y = 0.2;
    g.add(torso);

    const headG = new THREE.SphereGeometry(0.22 * scale, 12, 8);
    const head  = new THREE.Mesh(headG, mat);
    head.position.y = 1.0 * scale;
    g.add(head);

    // Arms
    [0.3, -0.3].forEach(zOff => {
      const aG  = new THREE.CapsuleGeometry(0.08 * scale, 0.55 * scale, 4, 6);
      const arm = new THREE.Mesh(aG, mat);
      arm.position.set(0, 0.1 * scale, zOff * scale * 1.4);
      arm.rotation.x = zOff > 0 ? 0.5 : -0.5;
      g.add(arm);
    });

    this._disposables.push(torsoG, headG);
    return g;
  }

  // ─── EMBLEM V: Woman & Toad ─────────────────────────────────────────────────
  // "The nurse is the Earth" — putrefaction, nourishment, NIGREDO
  _buildEmblemV(pal) {
    // Woman (reclining)
    const womanGroup = new THREE.Group();
    const womanMat   = bodyMat(0xa87050, { transparent: true });
    this._womanMat   = womanMat;
    this._disposables.push(womanMat);

    const torsoG = new THREE.CapsuleGeometry(0.35, 1.6, 6, 12);
    const torso  = new THREE.Mesh(torsoG, womanMat);
    torso.rotation.z = Math.PI / 2;
    torso.position.set(-1.0, -0.55, 0);
    womanGroup.add(torso);

    const headG = new THREE.SphereGeometry(0.28, 12, 8);
    const head  = new THREE.Mesh(headG, womanMat);
    head.position.set(-2.1, -0.35, 0);
    womanGroup.add(head);

    [-0.4, 0.4].forEach(zOff => {
      const aG  = new THREE.CapsuleGeometry(0.1, 0.6, 4, 8);
      const arm = new THREE.Mesh(aG, womanMat);
      arm.position.set(-0.5, -0.9, zOff);
      arm.rotation.x = zOff > 0 ? 0.4 : -0.4;
      womanGroup.add(arm);
      this._disposables.push(aG);
    });

    [-0.18, 0.18].forEach(zOff => {
      const bG = new THREE.SphereGeometry(0.14, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
      const b  = new THREE.Mesh(bG, womanMat);
      b.position.set(-0.8, -0.28, zOff);
      b.rotation.x = -Math.PI / 2;
      womanGroup.add(b);
      this._disposables.push(bG);
    });

    this.scene.add(womanGroup);
    this._woman = womanGroup;
    this._disposables.push(torsoG, headG);

    // Toad
    const toadGroup = new THREE.Group();
    const toadMat   = bodyMat(0x2a3a10);
    this._toadMat   = toadMat;
    this._disposables.push(toadMat);

    const bodyG = new THREE.SphereGeometry(0.55, 16, 10);
    const body  = new THREE.Mesh(bodyG, toadMat);
    body.scale.y = 0.52;
    toadGroup.add(body);
    this._disposables.push(bodyG);

    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xcc8800, emissive: 0x884400, emissiveIntensity: 1.2,
    });
    this._disposables.push(eyeMat);
    const eyeG = new THREE.SphereGeometry(0.09, 8, 6);
    [[-0.22, 0.26, 0.28], [-0.22, 0.26, -0.28]].forEach(([x, y, z]) => {
      const eye = new THREE.Mesh(eyeG, eyeMat);
      eye.position.set(x, y, z);
      toadGroup.add(eye);
    });
    this._disposables.push(eyeG);

    const legG = new THREE.SphereGeometry(0.2, 8, 6);
    [[0.35,-0.18,0.4],[0.35,-0.18,-0.4],[-0.35,-0.18,0.35],[-0.35,-0.18,-0.35]]
      .forEach(([x,y,z]) => {
        const leg = new THREE.Mesh(legG, toadMat);
        leg.position.set(x, y, z);
        toadGroup.add(leg);
      });
    this._disposables.push(legG);

    toadGroup.position.set(1.6, -1.0, 0);
    toadGroup.scale.setScalar(0.85);
    this.scene.add(toadGroup);
    this._toad = toadGroup;

    // Death shadow disc
    const shdG  = new THREE.CircleGeometry(1.2, 32);
    const shdMat = new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.6, depthWrite: false });
    const shadow = new THREE.Mesh(shdG, shdMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(1.6, -1.45, 0);
    this.scene.add(shadow);
    this._shadow    = shadow;
    this._shadowMat = shdMat;
    this._disposables.push(shdG, shdMat);

    // Milk stream
    const stream = new ParticleStream({
      count: 100, source: new THREE.Vector3(-0.8, -0.28, 0),
      target: new THREE.Vector3(1.1, -0.75, 0),
      color: 0xfff0d0, size: 0.04, speed: 0.55, arc: 0.6,
    });
    stream.opacity = 0;
    this.scene.add(stream.points);
    this._streams.push(stream);

    this._buildTimelineV(pal, stream);
  }

  _buildTimelineV(pal, stream) {
    const tl = gsap.timeline({ repeat: -1 });

    tl.to(this._groundGlow, { intensity: 2.8, duration: 1.2, ease: 'sine.inOut' }, 0)
      .to(this._groundGlow, { intensity: 1.8, duration: 0.8, ease: 'sine.inOut' }, 1.2);

    // Toad breathes
    tl.to(this._toad.scale, { x: 0.92, y: 0.82, z: 0.92, duration: 0.7, ease: 'sine.inOut' }, 2.0)
      .to(this._toad.scale, { x: 0.85, y: 0.85, z: 0.85, duration: 0.7, ease: 'sine.inOut' }, 2.7)
      .to(this._toad.scale, { x: 0.92, y: 0.82, z: 0.92, duration: 0.7, ease: 'sine.inOut' }, 3.4)
      .to(this._toad.scale, { x: 0.85, y: 0.85, z: 0.85, duration: 0.6, ease: 'sine.inOut' }, 4.1);

    // Milk stream flows
    tl.to(stream, { opacity: 0.82, duration: 1.6, ease: 'power2.in' }, 4.0);
    tl.call(() => { stream.active = true; }, [], 4.0);

    // Toad grows
    tl.to(this._toad.scale, { x: 1.35, y: 0.68, z: 1.35, duration: 2.0, ease: 'power1.inOut' }, 6.0)
      .to(this._toadMat.color, { r: 0.08, g: 0.18, b: 0.02, duration: 2.0 }, 6.0)
      .to(this._shadowMat, { opacity: 0.85, duration: 2.0 }, 6.0);

    // Woman pales
    tl.to(this._womanMat.color, { r: 0.35, g: 0.22, b: 0.18, duration: 2.0 }, 8.0)
      .to(this._womanMat, { opacity: 0.65, duration: 2.0 }, 8.0);

    // Flash reset
    tl.to(this._groundGlow, { intensity: 5.5, duration: 0.25, ease: 'power3.in' }, 10.5)
      .to(this._groundGlow, { intensity: 1.8, duration: 1.25 }, 10.75)
      .to(stream, { opacity: 0, duration: 0.5 }, 11.0)
      .call(() => { stream.active = false; }, [], 11.5)
      .to(this._womanMat.color, { r: 0.66, g: 0.44, b: 0.31, duration: 0.5 }, 11.5)
      .to(this._womanMat, { opacity: 1.0, duration: 0.5 }, 11.5)
      .to(this._toad.scale, { x: 0.85, y: 0.85, z: 0.85, duration: 0.5, ease: 'back.out' }, 11.5)
      .to(this._toadMat.color, { r: 0.16, g: 0.23, b: 0.06, duration: 0.5 }, 11.5)
      .to(this._shadowMat, { opacity: 0.6, duration: 0.5 }, 11.5);

    this._tl = tl;
  }

  // ─── EMBLEM IV: Join Brother and Sister ─────────────────────────────────────
  // "Join brother and sister and give them the cup of love" — NIGREDO
  // orbital_merge, love_spark particles, erotic_sacred mood
  _buildEmblemIV(pal) {
    // Brother (left) and Sister (right), standing upright
    const brotherMat = bodyMat(0x7a5030);
    const sisterMat  = bodyMat(0xb8785a);
    this._brotherMat = brotherMat;
    this._sisterMat  = sisterMat;
    this._disposables.push(brotherMat, sisterMat);

    this._brother = this._makeFigure(0x7a5030, 1.05);
    this._sister  = this._makeFigure(0xb8785a, 0.95);

    this._brother.position.set(-2.2, -0.6, 0);
    this._sister.position.set(2.2, -0.6, 0);
    this.scene.add(this._brother, this._sister);

    // Wedding cup between them (chalice)
    const cupGroup = new THREE.Group();
    const stemG = new THREE.CylinderGeometry(0.06, 0.12, 0.7, 8);
    const bowlG = new THREE.SphereGeometry(0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.7);
    const baseG = new THREE.CylinderGeometry(0.18, 0.18, 0.04, 12);
    const cupMat = new THREE.MeshStandardMaterial({ color: 0xd4aa44, metalness: 0.9, roughness: 0.2,
      emissive: 0x8b6600, emissiveIntensity: 0.3 });
    const stem = new THREE.Mesh(stemG, cupMat);
    const bowl = new THREE.Mesh(bowlG, cupMat);
    const base = new THREE.Mesh(baseG, cupMat);
    bowl.position.y = 0.45;
    bowl.rotation.x = Math.PI;
    base.position.y = -0.35;
    cupGroup.add(stem, bowl, base);
    cupGroup.position.set(0, -0.6, 0);
    cupGroup.scale.setScalar(0.85);
    this.scene.add(cupGroup);
    this._cup = cupGroup;
    this._disposables.push(stemG, bowlG, baseG, cupMat);

    // Love sparks: two streams converging on cup
    const streamA = new ParticleStream({
      count: 60, source: new THREE.Vector3(-2.2, 0.3, 0),
      target: new THREE.Vector3(0, 0.2, 0),
      color: 0xffaa44, size: 0.05, speed: 0.5, arc: 0.9,
    });
    const streamB = new ParticleStream({
      count: 60, source: new THREE.Vector3(2.2, 0.3, 0),
      target: new THREE.Vector3(0, 0.2, 0),
      color: 0xff88aa, size: 0.05, speed: 0.5, arc: 0.9,
    });
    streamA.opacity = 0; streamB.opacity = 0;
    this.scene.add(streamA.points, streamB.points);
    this._streams.push(streamA, streamB);

    // Atmospheric glow at cup
    const cupGlow = new THREE.PointLight(0xffaa44, 0.5, 4);
    cupGlow.position.set(0, 0.2, 0);
    this.scene.add(cupGlow);
    this._cupGlow = cupGlow;

    this._buildTimelineIV(streamA, streamB);
  }

  _buildTimelineIV(streamA, streamB) {
    const tl = gsap.timeline({ repeat: -1 });
    const bPos = this._brother.position;
    const sPos = this._sister.position;

    // 0–2 s: Both figures breathe (subtle y movement)
    tl.to(this._brother.position, { y: -0.45, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0)
      .to(this._sister.position,  { y: -0.45, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0.3);

    // 2–5 s: They drift toward center
    tl.to(bPos, { x: -1.0, duration: 3.0, ease: 'power2.inOut' }, 2.0)
      .to(sPos, { x:  1.0, duration: 3.0, ease: 'power2.inOut' }, 2.0);

    // 4–6 s: Love streams begin
    tl.to(streamA, { opacity: 0.75, duration: 1.2, ease: 'power2.in' }, 4.0)
      .to(streamB, { opacity: 0.75, duration: 1.2, ease: 'power2.in' }, 4.0)
      .call(() => { streamA.active = true; streamB.active = true; }, [], 4.0)
      .to(this._cupGlow, { intensity: 2.8, duration: 1.5 }, 4.0)
      .to(this._cup.position, { y: 0.1, duration: 2.0, ease: 'sine.inOut' }, 4.5);

    // 6–8 s: Conjunction — figures nearly touching, cup rises to meet them
    tl.to(bPos, { x: -0.35, duration: 2.0, ease: 'power1.inOut' }, 6.0)
      .to(sPos, { x:  0.35, duration: 2.0, ease: 'power1.inOut' }, 6.0)
      .to(this._cup.position, { y: 0.4, duration: 2.0, ease: 'sine.out' }, 6.0)
      .to(this._cupGlow, { intensity: 5.0, distance: 7, duration: 2.0 }, 6.0);

    // 8–9 s: Hold at peak
    tl.to(this._cupGlow, { intensity: 3.5, duration: 1.0 }, 8.0);

    // 9–12 s: Separate, streams fade, reset
    tl.to(bPos, { x: -2.2, duration: 2.5, ease: 'power2.inOut' }, 9.0)
      .to(sPos, { x:  2.2, duration: 2.5, ease: 'power2.inOut' }, 9.0)
      .to(streamA, { opacity: 0, duration: 1.0 }, 10.0)
      .to(streamB, { opacity: 0, duration: 1.0 }, 10.0)
      .call(() => { streamA.active = false; streamB.active = false; }, [], 11.0)
      .to(this._cup.position, { y: -0.6, duration: 1.5, ease: 'power2.in' }, 10.0)
      .to(this._cupGlow, { intensity: 0.5, duration: 1.5 }, 10.0)
      .to(bPos, { y: -0.6 }, 0.01)
      .to(sPos, { y: -0.6 }, 0.01);

    this._tl = tl;
  }

  // ─── EMBLEM X: Give Fire to Fire ────────────────────────────────────────────
  // "Give fire to fire, Mercury to Mercury" — CITRINITAS
  // elemental_recursion, mercury_silver particles, recursive self-feeding
  _buildEmblemX(pal) {
    this.scene.fog = new THREE.Fog(pal.bg, 6, 25);

    // Central fire (layered emissive spheres, pulsing)
    const fireGroup = new THREE.Group();
    const fireLayers = [];

    const firePalette = [0xff6600, 0xff9900, 0xffcc00, 0xffee44];
    firePalette.forEach((c, i) => {
      const scale = 1.0 - i * 0.18;
      const geo   = new THREE.SphereGeometry(0.55 * scale, 12, 8);
      const mat   = new THREE.MeshStandardMaterial({
        color: c, emissive: new THREE.Color(c), emissiveIntensity: 1.0 + i * 0.4,
        transparent: true, opacity: 0.7 - i * 0.15,
      });
      const mesh  = new THREE.Mesh(geo, mat);
      mesh.position.y = i * 0.08;
      fireGroup.add(mesh);
      fireLayers.push({ mesh, mat, basescale: scale });
      this._disposables.push(geo, mat);
    });

    fireGroup.position.set(0, -0.2, 0);
    this.scene.add(fireGroup);
    this._fireGroup  = fireGroup;
    this._fireLayers = fireLayers;

    // Mercury vessel (figure pouring into the fire — recursive)
    const figGroup = new THREE.Group();
    const figMat   = new THREE.MeshStandardMaterial({ color: 0x708090, metalness: 0.8, roughness: 0.2,
      emissive: 0x404858, emissiveIntensity: 0.3 });
    this._disposables.push(figMat);

    const tG = new THREE.CapsuleGeometry(0.25, 0.8, 6, 12);
    const hG = new THREE.SphereGeometry(0.2, 10, 8);
    const torso = new THREE.Mesh(tG, figMat);
    const head  = new THREE.Mesh(hG, figMat);
    head.position.y = 0.75;
    // Arm reaching forward
    const armG  = new THREE.CapsuleGeometry(0.08, 0.55, 4, 6);
    const arm   = new THREE.Mesh(armG, figMat);
    arm.rotation.z = -Math.PI / 2.5;
    arm.position.set(0.45, 0.2, 0);
    figGroup.add(torso, head, arm);
    this._disposables.push(tG, hG, armG);

    figGroup.position.set(-2.2, -0.55, 0);
    figGroup.rotation.y = Math.PI / 8;
    this.scene.add(figGroup);
    this._figGroup = figGroup;

    // Mercury stream (silver, pouring into fire)
    const mercStream = new ParticleStream({
      count: 80, source: new THREE.Vector3(-1.8, 0.5, 0),
      target: new THREE.Vector3(-0.3, 0.0, 0),
      color: 0xc8d8e8, size: 0.035, speed: 0.65, arc: 0.5,
    });
    mercStream.opacity = 0.7;
    mercStream.active  = true;
    this.scene.add(mercStream.points);
    this._streams.push(mercStream);

    // Secondary recursive fire stream (fire from fire)
    const fireStream = new ParticleStream({
      count: 60, source: new THREE.Vector3(0.3, 0.5, 0),
      target: new THREE.Vector3(1.8, -0.1, 0),
      color: 0xff9900, size: 0.045, speed: 0.5, arc: 0.7,
    });
    fireStream.opacity = 0;
    this.scene.add(fireStream.points);
    this._streams.push(fireStream);
    this._fireStream = fireStream;

    // Warm point light at fire
    const firePt = new THREE.PointLight(0xff8800, 3.0, 8);
    firePt.position.set(0, 0.4, 0);
    this.scene.add(firePt);
    this._firePt = firePt;

    this._buildTimelineX();
  }

  _buildTimelineX() {
    const tl = gsap.timeline({ repeat: -1 });

    // Fire pulses throughout
    tl.to(this._firePt, { intensity: 4.5, duration: 1.0, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0);

    // 0–3 s: Fire burns steadily, mercury pours in
    tl.to(this._fireGroup.scale, { x: 1.1, y: 1.15, z: 1.1, duration: 2.0, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0);

    // 4–6 s: Fire fed — grows larger
    tl.to(this._fireGroup.scale, { x: 1.5, y: 1.7, z: 1.5, duration: 2.0, ease: 'power2.inOut' }, 4.0);

    // 5–7 s: Recursive fire stream activates (fire begets fire)
    tl.to(this._fireStream, { opacity: 0.8, duration: 1.2, ease: 'power2.in' }, 5.0);
    tl.call(() => { this._fireStream.active = true; }, [], 5.0);

    // 7–9 s: Maximum — citrinitas revelation
    tl.to(this._firePt, { intensity: 8.0, distance: 12, duration: 2.0 }, 7.0)
      .to(this._fireLayers[3].mat, { emissiveIntensity: 3.0, duration: 2.0 }, 7.0);

    // 9–12 s: Subside, loop
    tl.to(this._fireGroup.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 2.0, ease: 'power1.out' }, 9.5)
      .to(this._fireStream, { opacity: 0, duration: 1.0 }, 10.5)
      .call(() => { this._fireStream.active = false; }, [], 11.5)
      .to(this._firePt, { intensity: 3.0, distance: 8, duration: 2.0 }, 9.5)
      .to(this._fireLayers[3].mat, { emissiveIntensity: 1.0, duration: 2.0 }, 9.5);

    this._tl = tl;
  }

  // ─── EMBLEM XXXIII: The Hermaphrodite ─────────────────────────────────────
  // "Hermaphrodite lying in darkness needs fire" — RUBEDO
  // gender_oscillation, dual_light particles, paradox_beautiful, 14s
  _buildEmblemXXXIII(pal) {
    this.scene.fog = new THREE.Fog(pal.bg, 7, 22);

    // Central hermaphrodite figure (standing upright)
    const hGroup = new THREE.Group();
    const hMat   = new THREE.MeshStandardMaterial({
      color: 0x8b5a3a, roughness: 0.7, metalness: 0.1,
    });
    this._hMat = hMat;
    this._disposables.push(hMat);

    // Torso (neutral)
    const tG = new THREE.CapsuleGeometry(0.3, 1.0, 6, 12);
    const torso = new THREE.Mesh(tG, hMat);
    torso.position.y = 0.25;
    hGroup.add(torso);
    this._disposables.push(tG);

    // Head with dual aspects (slightly elongated)
    const headG = new THREE.SphereGeometry(0.26, 12, 8);
    const head  = new THREE.Mesh(headG, hMat);
    head.position.y = 1.15;
    hGroup.add(head);
    this._disposables.push(headG);

    // Wings (flat panels, unfurling from back)
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xc8a050, metalness: 0.5, roughness: 0.4,
      emissive: 0x664400, emissiveIntensity: 0.4, side: THREE.DoubleSide,
      transparent: true, opacity: 0.9,
    });
    this._wingMat = wingMat;
    this._disposables.push(wingMat);

    // Wing shape via LatheGeometry or just a plane
    const wingLG = new THREE.PlaneGeometry(1.1, 0.9);
    const wingRG = wingLG.clone();
    const wingL  = new THREE.Mesh(wingLG, wingMat);
    const wingR  = new THREE.Mesh(wingRG, wingMat);
    wingL.position.set(-0.55, 0.4, -0.05);
    wingR.position.set( 0.55, 0.4, -0.05);
    wingL.scale.x = 0.1;   // Start folded
    wingR.scale.x = 0.1;
    hGroup.add(wingL, wingR);
    this._wingL = wingL;
    this._wingR = wingR;
    this._disposables.push(wingLG, wingRG);

    // Crown (torus above head)
    const crownG = new THREE.TorusGeometry(0.25, 0.04, 8, 20);
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xffd700, metalness: 1.0, roughness: 0.1,
      emissive: 0xaa8800, emissiveIntensity: 0.8,
    });
    const crown = new THREE.Mesh(crownG, crownMat);
    crown.position.set(0, 1.58, 0);
    crown.scale.setScalar(0.01); // Starts invisible
    hGroup.add(crown);
    this._crown = crown;
    this._disposables.push(crownG, crownMat);

    hGroup.position.set(0, -0.6, 0);
    this.scene.add(hGroup);
    this._hGroup = hGroup;

    // Dual light particles: warm (masculine Sun) + cool (feminine Moon)
    const solarStream = new ParticleStream({
      count: 50, source: new THREE.Vector3(-2, 1.5, 0),
      target: new THREE.Vector3(0, 0.5, 0),
      color: 0xffcc44, size: 0.06, speed: 0.35, arc: 1.2,
    });
    const lunarStream = new ParticleStream({
      count: 50, source: new THREE.Vector3(2, 1.5, 0),
      target: new THREE.Vector3(0, 0.5, 0),
      color: 0xaaccff, size: 0.06, speed: 0.35, arc: 1.2,
    });
    solarStream.opacity = 0; lunarStream.opacity = 0;
    this.scene.add(solarStream.points, lunarStream.points);
    this._streams.push(solarStream, lunarStream);

    // Fire beneath (the fire the hermaphrodite needs)
    const firePt = new THREE.PointLight(0xff4400, 0.2, 5);
    firePt.position.set(0, -1.3, 0.5);
    this.scene.add(firePt);
    this._firePt = firePt;

    // Dual color point lights
    const sunPt  = new THREE.PointLight(0xffcc44, 0.0, 8);
    const moonPt = new THREE.PointLight(0x8899ff, 0.0, 8);
    sunPt.position.set(-3, 2, 1);
    moonPt.position.set(3, 2, 1);
    this.scene.add(sunPt, moonPt);
    this._sunPt  = sunPt;
    this._moonPt = moonPt;

    this._buildTimelineXXXIII(solarStream, lunarStream);
  }

  _buildTimelineXXXIII(solarStream, lunarStream) {
    const tl = gsap.timeline({ repeat: -1, duration: 14 });

    // 0–2 s: Darkness. Figure barely visible.
    tl.to(this._firePt, { intensity: 0.05, duration: 0.01 }, 0);

    // 2–4 s: Fire kindles beneath
    tl.to(this._firePt, { intensity: 1.8, duration: 2.0, ease: 'power2.in' }, 2.0);

    // 3–5 s: Streams begin — solar then lunar
    tl.to(solarStream, { opacity: 0.7, duration: 1.5, ease: 'power2.in' }, 3.0)
      .call(() => { solarStream.active = true; }, [], 3.0)
      .to(lunarStream, { opacity: 0.7, duration: 1.5, ease: 'power2.in' }, 4.0)
      .call(() => { lunarStream.active = true; }, [], 4.0);

    // 4–6 s: Sun and Moon lights strengthen
    tl.to(this._sunPt,  { intensity: 2.0, duration: 2.0 }, 4.0)
      .to(this._moonPt, { intensity: 2.0, duration: 2.0 }, 4.0);

    // 5–7 s: Gender oscillation begins — warm red shift (masculine)
    tl.to(this._hMat.color, { r: 0.7, g: 0.3, b: 0.1, duration: 2.0, ease: 'sine.inOut' }, 5.0)
      .to(this._sunPt, { intensity: 3.5, duration: 1.0 }, 5.0)
      .to(this._moonPt, { intensity: 0.5, duration: 1.0 }, 5.0);

    // 7–9 s: Shift to cool (feminine)
    tl.to(this._hMat.color, { r: 0.4, g: 0.5, b: 0.7, duration: 2.0, ease: 'sine.inOut' }, 7.0)
      .to(this._moonPt, { intensity: 3.5, duration: 1.0 }, 7.0)
      .to(this._sunPt, { intensity: 0.5, duration: 1.0 }, 7.0);

    // 9–11 s: Wings unfurl, crown descends
    tl.to(this._wingL.scale, { x: 1.0, duration: 2.0, ease: 'back.out(1.5)' }, 9.0)
      .to(this._wingR.scale, { x: 1.0, duration: 2.0, ease: 'back.out(1.5)' }, 9.2)
      .to(this._crown.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 1.5, ease: 'elastic.out(1,0.5)' }, 10.0);

    // 11–12 s: Both lights at peak — union achieved
    tl.to(this._sunPt,  { intensity: 3.0, duration: 1.0 }, 11.0)
      .to(this._moonPt, { intensity: 3.0, duration: 1.0 }, 11.0)
      .to(this._hMat.color, { r: 0.7, g: 0.45, b: 0.35, duration: 1.0 }, 11.0);

    // 12–14 s: Fade back, reset
    tl.to(solarStream, { opacity: 0, duration: 1.0 }, 12.0)
      .to(lunarStream, { opacity: 0, duration: 1.0 }, 12.0)
      .call(() => { solarStream.active = false; lunarStream.active = false; }, [], 13.0)
      .to(this._wingL.scale, { x: 0.1, duration: 1.2, ease: 'power2.in' }, 12.5)
      .to(this._wingR.scale, { x: 0.1, duration: 1.2, ease: 'power2.in' }, 12.5)
      .to(this._crown.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.8 }, 13.0)
      .to(this._sunPt,  { intensity: 0, duration: 1.5 }, 12.5)
      .to(this._moonPt, { intensity: 0, duration: 1.5 }, 12.5)
      .to(this._firePt, { intensity: 0.2, duration: 1.5 }, 12.5)
      .to(this._hMat.color, { r: 0.55, g: 0.35, b: 0.23, duration: 1.0 }, 12.5);

    this._tl = tl;
  }

  // ─── EMBLEM L: The Dragon kills the Woman ────────────────────────────────────
  // "Dragon kills woman, she kills it; together they bathe in blood" — RUBEDO
  // philosophers_stone, ouroboros, eternal radiance, 16s
  _buildEmblemL(pal) {
    this.camera.position.set(0, 2.5, 10);
    this.camera.lookAt(0, 0.5, 0);
    this.scene.fog = new THREE.Fog(pal.bg, 8, 30);

    // Central stone (glowing octahedron on pedestal)
    const stoneG = new THREE.OctahedronGeometry(0.7, 1);
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0xcc8800, emissive: 0x664400, emissiveIntensity: 0.8,
      metalness: 0.6, roughness: 0.2,
    });
    const stone = new THREE.Mesh(stoneG, stoneMat);
    stone.position.set(0, 0.5, 0);
    this.scene.add(stone);
    this._stone    = stone;
    this._stoneMat = stoneMat;
    this._disposables.push(stoneG, stoneMat);

    // Pedestal
    const pedG  = new THREE.CylinderGeometry(0.5, 0.6, 0.7, 12);
    const pedMat = new THREE.MeshStandardMaterial({ color: 0x3a2010, roughness: 0.9 });
    const ped    = new THREE.Mesh(pedG, pedMat);
    ped.position.set(0, -0.55, 0);
    this.scene.add(ped);
    this._disposables.push(pedG, pedMat);

    // Ouroboros dragon ring (circle of capsule segments)
    const dragonGroup = new THREE.Group();
    const dragonMat = new THREE.MeshStandardMaterial({
      color: 0x2d5a1a, roughness: 0.85, metalness: 0.1,
      emissive: 0x1a3a10, emissiveIntensity: 0.3,
    });
    this._dragonMat = dragonMat;
    this._disposables.push(dragonMat);

    const SEG = 16;
    const RADIUS = 2.2;
    for (let i = 0; i < SEG; i++) {
      const angle = (i / SEG) * Math.PI * 2;
      const segG  = new THREE.CapsuleGeometry(0.14, 0.55, 4, 8);
      const seg   = new THREE.Mesh(segG, dragonMat);
      seg.position.set(Math.cos(angle) * RADIUS, 0.2, Math.sin(angle) * RADIUS);
      seg.rotation.y = -angle;
      seg.rotation.z = Math.PI / 2;
      dragonGroup.add(seg);
      this._disposables.push(segG);
    }

    // Dragon head (at the tail end — biting its own tail)
    const dHeadG = new THREE.SphereGeometry(0.22, 10, 8);
    const dHead  = new THREE.Mesh(dHeadG, dragonMat);
    dHead.position.set(RADIUS, 0.3, 0);
    dragonGroup.add(dHead);
    this._disposables.push(dHeadG);

    dragonGroup.scale.setScalar(0.01); // Starts tiny, will grow
    this.scene.add(dragonGroup);
    this._dragonGroup = dragonGroup;

    // Crown (descending from above)
    const crownG  = new THREE.TorusGeometry(0.35, 0.055, 8, 24);
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xffd700, metalness: 1.0, roughness: 0.05,
      emissive: 0xaa8800, emissiveIntensity: 1.2,
    });
    const crown = new THREE.Mesh(crownG, crownMat);
    crown.position.set(0, 8, 0); // Starts high up
    this.scene.add(crown);
    this._crown    = crown;
    this._crownMat = crownMat;
    this._disposables.push(crownG, crownMat);

    // Radiant rays (LineSegments from stone outward)
    const rayPositions = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      rayPositions.push(0, 0.5, 0);
      rayPositions.push(Math.cos(angle) * 3.5, 0.5, Math.sin(angle) * 3.5);
    }
    const rayG  = new THREE.BufferGeometry();
    rayG.setAttribute('position', new THREE.Float32BufferAttribute(rayPositions, 3));
    const rayMat = new THREE.LineBasicMaterial({ color: 0xffcc44, transparent: true, opacity: 0 });
    const rays   = new THREE.LineSegments(rayG, rayMat);
    this.scene.add(rays);
    this._rays    = rays;
    this._rayMat  = rayMat;
    this._disposables.push(rayG, rayMat);

    // Ouroboros particle stream (circular)
    const ouroStream = new ParticleStream({
      count: 120, source: new THREE.Vector3(-2.2, 0.2, 0),
      target: new THREE.Vector3(2.2, 0.2, 0),
      color: 0xff8800, size: 0.055, speed: 0.3, arc: 2.5,
    });
    ouroStream.opacity = 0;
    this.scene.add(ouroStream.points);
    this._streams.push(ouroStream);

    // Stone glow
    const stoneLight = new THREE.PointLight(0xffaa44, 1.5, 7);
    stoneLight.position.set(0, 0.5, 0);
    this.scene.add(stoneLight);
    this._stoneLight = stoneLight;

    this._buildTimelineL(ouroStream);
  }

  _buildTimelineL(ouroStream) {
    const tl = gsap.timeline({ repeat: -1, duration: 16 });

    // 0–3 s: Stone glows gently. Crown descends slowly.
    tl.to(this._stoneMat, { emissiveIntensity: 0.4, duration: 0.01 }, 0);
    tl.to(this._stoneLight, { intensity: 0.8, duration: 0.01 }, 0);
    tl.to(this._stone.rotation, { y: Math.PI * 2, duration: 16, ease: 'none', repeat: -1 }, 0);
    tl.to(this._crown.position, { y: 2.0, duration: 4.0, ease: 'power2.inOut' }, 1.0);

    // 3–5 s: Dragon ring emerges (ouroboros expands)
    tl.to(this._dragonGroup.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 2.5, ease: 'back.out(1.2)' }, 3.0);
    tl.to(this._dragonGroup.rotation, { y: Math.PI * 2, duration: 16, ease: 'none', repeat: -1 }, 3.0);

    // 4–6 s: Ouroboros stream lights up
    tl.to(ouroStream, { opacity: 0.7, duration: 1.8, ease: 'power2.in' }, 4.5);
    tl.call(() => { ouroStream.active = true; }, [], 4.5);

    // 5–8 s: Stone grows bright, rays extend
    tl.to(this._stoneMat, { emissiveIntensity: 2.5, duration: 3.0, ease: 'power2.in' }, 5.0)
      .to(this._stoneLight, { intensity: 5.0, distance: 12, duration: 3.0, ease: 'power2.in' }, 5.0)
      .to(this._rayMat, { opacity: 0.6, duration: 2.0 }, 6.0);

    // 7–9 s: Crown settles on stone/above
    tl.to(this._crown.position, { y: 1.4, duration: 2.0, ease: 'bounce.out' }, 7.5)
      .to(this._crownMat, { emissiveIntensity: 2.5, duration: 1.0 }, 8.5);

    // 9–12 s: Maximum radiance — the eternal stone
    tl.to(this._stoneLight, { intensity: 9.0, duration: 3.0, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 9.0)
      .to(this._stone.scale, { x: 1.3, y: 1.3, z: 1.3, duration: 1.5, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 9.5)
      .to(this._rayMat, { opacity: 0.9, duration: 1.5 }, 9.5);

    // 12–14 s: Subside to eternal steady glow
    tl.to(this._stoneLight, { intensity: 3.5, distance: 9, duration: 2.0 }, 12.5)
      .to(this._stoneMat, { emissiveIntensity: 1.5, duration: 2.0 }, 12.5)
      .to(this._rayMat, { opacity: 0.35, duration: 2.0 }, 12.5)
      .to(ouroStream, { opacity: 0.4, duration: 2.0 }, 12.5);

    // 14–16 s: Hold, then full reset for loop
    tl.to(this._rayMat, { opacity: 0, duration: 1.0 }, 14.5)
      .to(ouroStream, { opacity: 0, duration: 1.0 }, 14.5)
      .call(() => { ouroStream.active = false; }, [], 15.5)
      .to(this._dragonGroup.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 1.0 }, 14.5)
      .to(this._crown.position, { y: 8, duration: 1.0, ease: 'power2.in' }, 14.5)
      .to(this._stoneMat, { emissiveIntensity: 0.4, duration: 1.0 }, 14.5)
      .to(this._stoneLight, { intensity: 0.8, duration: 1.0 }, 14.5);

    this._tl = tl;
  }

  // ── Generic fallback ───────────────────────────────────────────────────────
  _buildGenericEmblem(pal) {
    this.isGeneric = true;

    // Sculptural torus-knot — more expressive than icosahedron, fully orbitable
    const geo = new THREE.TorusKnotGeometry(0.9, 0.28, 128, 16, 3, 2);
    const mat = new THREE.MeshStandardMaterial({
      color: pal.accent, roughness: 0.35, metalness: 0.5,
      emissive: new THREE.Color(pal.glow), emissiveIntensity: 0.3,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.5;
    this.scene.add(mesh);
    this._genericMat = mat;
    this._animObjs.push({ mesh, rotSpeed: 0.22 });
    this._disposables.push(geo, mat);

    // Wide horizontal arc
    const streamA = new ParticleStream({
      count: 80, source: new THREE.Vector3(-3.0, 0.5, 0),
      target: new THREE.Vector3(3.0, 0.5, 0),
      color: pal.particle, size: 0.055, speed: 0.38, arc: 1.8,
    });
    streamA.opacity = 0.55; streamA.active = true;

    // Descending vertical arc
    const streamB = new ParticleStream({
      count: 55, source: new THREE.Vector3(0, 3.0, 0),
      target: new THREE.Vector3(0, -0.5, 0),
      color: pal.particle, size: 0.04, speed: 0.3, arc: 1.0,
    });
    streamB.opacity = 0.4; streamB.active = true;

    this.scene.add(streamA.points, streamB.points);
    this._streams.push(streamA, streamB);

    const tl = gsap.timeline({ repeat: -1 });
    tl.to(mat, { emissiveIntensity: 0.78, duration: 2.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0)
      .to(this._groundGlow, { intensity: 3.0, duration: 2.0, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0.8);
    this._tl = tl;
  }

  // ── Update ─────────────────────────────────────────────────────────────────
  update(dt) {
    this._t += dt;
    this._streams.forEach(s => s.update(this._t));
    this._animObjs.forEach(({ mesh, rotSpeed }) => {
      mesh.rotation.y += dt * rotSpeed;
      mesh.rotation.x += dt * rotSpeed * 0.4;
    });
    if (this._controls) this._controls.update();
  }

  // ── Dispose ────────────────────────────────────────────────────────────────
  dispose() {
    if (this._controls) { this._controls.dispose(); this._controls = null; }
    if (this._tl) { this._tl.kill(); this._tl = null; }
    gsap.killTweensOf([
      this._groundGlow, this._woman, this._toad, this._toadMat,
      this._womanMat, this._shadowMat, this._brother, this._sister,
      this._cup, this._hGroup, this._fireGroup, this._firePt,
      this._stone, this._stoneLight, this._dragonGroup, this._crown,
    ].filter(Boolean));
    this._streams.forEach(s => s.dispose());
    this._streams = [];
    this._disposables.forEach(d => d?.dispose?.());
    this.scene.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
  }
}
