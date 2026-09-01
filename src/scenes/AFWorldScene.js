// AFWorldScene.js — Theatrum Chemicum: all fifty-one emblems of the Atalanta
// Fugiens as one explorable game world.
//
// A great rotunda: the emblems stand around a circular promenade in the order
// of the Work — NIGREDO → ALBEDO → CITRINITAS → RUBEDO — each station a
// carved-relief stele of the original plate with an animated primitive-
// geometry vignette enacting the emblem in front of it
// (src/data/af_vignettes.js). At the hub, the Philosopher's Stone inside an
// ouroboros. First-person via the shared Walker; walking up to a station
// surfaces its motto and epigram, clicking its plate opens the full 3-D
// emblem scene.

import * as THREE from 'three';
import { Walker } from '../systems/Walker.js?v=3';
import { makeCast } from '../systems/Cast.js?v=8';
import { createLitStyle, addSkyDome } from '../shaders/HPStyles.js?v=4';
import { buildVignette } from '../data/af_vignettes.js?v=4';
import { getEnvMap } from './EmblemScene.js?v=9';

const STAGE_ORDER = ['NIGREDO', 'ALBEDO', 'CITRINITAS', 'RUBEDO'];
const STAGE_COLORS = { NIGREDO: 0xcc3300, ALBEDO: 0x8ab0d8, CITRINITAS: 0xddaa00, RUBEDO: 0xff5500 };
const STAGE_LATIN  = { NIGREDO: 'The Blackening', ALBEDO: 'The Whitening', CITRINITAS: 'The Yellowing', RUBEDO: 'The Reddening' };

const RING_R = 33.5;      // station circle
const DAIS_R = 29.8;      // vignette circle
const EYE = 1.7;

function emblemImagePath(num) {
  return `../images/emblems/emblem-${String(num).padStart(2, '0')}.jpg`;
}

export class AFWorldScene {
  constructor(renderer, composer, emblems, { station = null } = {}) {
    this.renderer = renderer;
    this.composer = composer;
    this.emblems = emblems;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 240);
    this.camera.rotation.order = 'YXZ';
    this.onStation = null;    // callback(emblemData | null)
    this.onEnter = null;      // callback(emblemNumber) — click on a plate
    this.style = createLitStyle();

    // Stations in the order of the Work
    this.order = [...emblems].sort((a, b) => {
      const sa = STAGE_ORDER.indexOf(a.alchemical_stage || 'NIGREDO');
      const sb = STAGE_ORDER.indexOf(b.alchemical_stage || 'NIGREDO');
      return sa - sb || a.number - b.number;
    });
    this._stations = [];      // { emblem, angle, x, z, vx, vz, update, plate }

    this.walker = new Walker(renderer, {
      eye: EYE,
      bounds: { minX: -40, maxX: 40, minZ: -40, maxZ: 40 },
      onDigit: (n) => {
        if (n >= 1 && n <= 4) this.teleportStage(STAGE_ORDER[n - 1]);
        else if (n === 5) this.teleportCenter();
      },
    });

    // Spawn: at the requested emblem's station, else at the south gate
    this._spawnStation = station;
    this._t = 0;
    this._stTimer = 0;
    this._near = undefined;
    this._loader = new THREE.TextureLoader();
    this._disp = [];
  }

  async build() {
    const S = this.style;
    this.scene.background = new THREE.Color(0x0c0a16);
    this.scene.fog = new THREE.FogExp2(0x241408, 0.013);
    addSkyDome(this.scene, { top: 0x0c0a16, horizon: 0x3a2210, stars: 380 });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene.environment = getEnvMap(this.renderer);
    this.scene.environmentIntensity = 0.35;
    S.setupLights(this.scene);
    this.cast = makeCast(S);

    this._stoneMat = S.mat({ color: 0x8a7a5a, roughness: 0.85 });
    this._darkMat  = S.mat({ color: 0x3a3226, roughness: 0.92 });

    this._buildGround();
    this._buildStations();
    this._buildCenter();
    this._initPicking();

    const bloom = this.composer.passes.find(p => p.constructor?.name === 'UnrealBloomPass');
    if (bloom) bloom.strength = 0.4;

    // Spawn
    const st = this._spawnStation != null && this._stations.find(s => s.emblem.number === this._spawnStation);
    if (st) {
      const a = st.angle;
      this.walker.player.pos.set(Math.cos(a) * (RING_R - 6), 0, Math.sin(a) * (RING_R - 6));
      this.walker.player.yaw = this.walker.yawToward(
        [this.walker.player.pos.x, this.walker.player.pos.z], [st.x, st.z]);
    } else {
      this.walker.player.pos.set(0, 0, 12);
      this.walker.player.yaw = Math.PI;   // face the Stone, promenade beyond
      this.walker.player.pitch = -0.02;
    }
    this.walker.attach();
    this.walker.applyTo(this.camera);
  }

  _m(geo, mat, x = 0, y = 0, z = 0, o = {}) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    if (o.rx) m.rotation.x = o.rx;
    if (o.ry) m.rotation.y = o.ry;
    m.castShadow = o.cast !== false;
    m.receiveShadow = o.receive !== false;
    (o.parent || this.scene).add(m);
    return m;
  }

  _buildGround() {
    const S = this.style;
    this._m(new THREE.PlaneGeometry(120, 120, 4, 4), S.mat({ color: 0x1c1810, roughness: 0.98 }), 0, 0, 0, { rx: -Math.PI / 2, cast: false });
    const pathMat = S.mat({ color: 0x54452e, roughness: 0.92 });
    // Promenade ring + four radial ways + hub plaza
    this._m(new THREE.RingGeometry(26.6, 31.4, 72), pathMat, 0, 0.011, 0, { rx: -Math.PI / 2, cast: false });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const p = this._m(new THREE.PlaneGeometry(2.6, 20), pathMat, Math.cos(a) * 18.5, 0.012, Math.sin(a) * 18.5, { rx: -Math.PI / 2, cast: false });
      p.rotation.z = -a + Math.PI / 2;
    }
    this._m(new THREE.CircleGeometry(9, 44), pathMat, 0, 0.014, 0, { rx: -Math.PI / 2, cast: false });
  }

  _buildStations() {
    const S = this.style;
    const N = this.order.length;
    const plateGeo = new THREE.PlaneGeometry(2.3, 2.9);
    const backGeo = new THREE.BoxGeometry(2.7, 3.5, 0.3);
    const daisGeo = new THREE.CylinderGeometry(2.15, 2.3, 0.18, 24);

    this.order.forEach((emb, i) => {
      const a = Math.PI / 2 + (i / N) * Math.PI * 2;   // start at south gate, go round
      const dirX = Math.cos(a), dirZ = Math.sin(a);
      const rotY = Math.atan2(-dirX, -dirZ);           // face the hub
      const stage = emb.alchemical_stage || 'NIGREDO';
      const col = STAGE_COLORS[stage];

      // Stele: dark backing + the plate as a lit carved relief
      const sx = dirX * RING_R, sz = dirZ * RING_R;
      this._m(backGeo, this._darkMat, sx, 2.0, sz, { ry: rotY });
      const plateMat = new THREE.MeshStandardMaterial({
        color: 0x2a2018, roughness: 0.85, metalness: 0.0, envMapIntensity: 0.3,
      });
      const plate = this._m(plateGeo, plateMat, sx - dirX * 0.18, 2.1, sz - dirZ * 0.18, { ry: rotY, cast: false });
      plate.userData.emblemNumber = emb.number;
      this._loader.load(emblemImagePath(emb.number), (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        plateMat.map = tex;
        plateMat.emissiveMap = tex;
        plateMat.emissive.set(0xffffff);
        plateMat.emissiveIntensity = 0.62;
        plateMat.color.set(0xffffff);
        plateMat.needsUpdate = true;
      });

      // Numeral + title plaque under the plate
      const plaque = this._plaque(emb, col);
      plaque.position.set(sx - dirX * 0.2, 0.42, sz - dirZ * 0.2);
      plaque.rotation.y = rotY;
      this.scene.add(plaque);

      // The vignette on its dais
      const vx = dirX * DAIS_R, vz = dirZ * DAIS_R;
      this._m(daisGeo, this._stoneMat, vx, 0.09, vz, { cast: false });
      const vg = new THREE.Group();
      vg.position.set(vx, 0.18, vz);
      vg.rotation.y = rotY;
      this.scene.add(vg);
      const update = buildVignette(emb.number, { g: vg, C: this.cast, S, THREE });

      this.walker.colliders.push({ x: sx, z: sz, r: 1.5 });
      this.walker.colliders.push({ x: vx, z: vz, r: 2.1 });
      this._stations.push({ emblem: emb, angle: a, x: sx, z: sz, vx, vz, update, plate });
    });

    // Stage gateways on the promenade at each stage boundary
    let prevStage = null;
    this.order.forEach((emb, i) => {
      const stage = emb.alchemical_stage || 'NIGREDO';
      if (stage === prevStage) return;
      prevStage = stage;
      const a = Math.PI / 2 + ((i - 0.5) / this.order.length) * Math.PI * 2;
      const gx = Math.cos(a) * 31.9, gz = Math.sin(a) * 31.9;
      const rotY = Math.atan2(-Math.cos(a), -Math.sin(a));
      for (const s of [-1, 1]) {
        const px = gx + Math.cos(a + Math.PI / 2) * s * 1.4;
        const pz = gz + Math.sin(a + Math.PI / 2) * s * 1.4;
        this._m(new THREE.CylinderGeometry(0.14, 0.2, 3.4, 10), this._stoneMat, px, 1.7, pz);
        const orb = this._m(new THREE.SphereGeometry(0.22, 14, 10),
          S.glowMat({ color: STAGE_COLORS[stage], emissiveIntensity: 0.8, metalness: 0.4, roughness: 0.4 }),
          px, 3.6, pz);
        void orb;
        this.walker.colliders.push({ x: px, z: pz, r: 0.4 });
      }
      const lbl = this.cast.label(stage, { sub: STAGE_LATIN[stage].toUpperCase(), scale: 1.9 });
      lbl.position.set(gx, 4.4, gz);
      this.scene.add(lbl);
      void rotY;
    });
  }

  _plaque(emb, col) {
    const c = document.createElement('canvas');
    c.width = 320; c.height = 96;
    const x = c.getContext('2d');
    x.fillStyle = 'rgba(12,9,5,0.92)'; x.fillRect(0, 0, 320, 96);
    x.strokeStyle = '#' + col.toString(16).padStart(6, '0'); x.lineWidth = 3; x.strokeRect(4, 4, 312, 88);
    x.textAlign = 'center';
    const numeral = emb.roman_numeral || (emb.number === 0 ? 'FUGA' : emb.number);
    x.fillStyle = '#' + col.toString(16).padStart(6, '0'); x.font = '30px Georgia'; x.fillText(String(numeral), 160, 40);
    x.fillStyle = '#cfc0a0'; x.font = '15px Georgia';
    const title = (emb.label || '').slice(0, 40);
    x.fillText(title, 160, 70);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    this._disp.push(t);
    return new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.6), new THREE.MeshBasicMaterial({ map: t, transparent: true }));
  }

  _buildCenter() {
    const S = this.style;
    // The Stone on its pedestal, inside the ouroboros
    this._m(new THREE.CylinderGeometry(1.1, 1.4, 0.5, 20), this._stoneMat, 0, 0.25, 0, { cast: false });
    this._m(new THREE.CylinderGeometry(0.5, 0.7, 1.6, 14), this._stoneMat, 0, 1.3, 0);
    this._stone = this._m(new THREE.OctahedronGeometry(0.85, 0),
      S.glowMat({ color: 0xffd24a, emissive: 0xc89020, emissiveIntensity: 1.1, metalness: 0.9, roughness: 0.15 }),
      0, 3.0, 0);
    const sl = S.pointLight(0xffd060, 2.6, 14);
    if (sl) { sl.position.set(0, 3.2, 0); this.scene.add(sl); this._stoneLight = sl; }

    this._ouro = this.cast.animals.ouroboros(5.2);
    this._ouro.position.y = 0.05;
    this.scene.add(this._ouro);

    const lbl = this.cast.label('THEATRUM CHEMICUM', { sub: 'THE FIFTY-ONE EMBLEMS OF THE ATALANTA FUGIENS', scale: 2.6 });
    lbl.position.set(0, 5.2, 0);
    this.scene.add(lbl);

    this.walker.colliders.push({ x: 0, z: 0, r: 2.6 });
  }

  // Click a plate → enter its full 3-D emblem scene
  _initPicking() {
    const el = this.renderer.domElement;
    this._ray = new THREE.Raycaster();
    this._pdown = null;
    this._onDown = (e) => { this._pdown = { x: e.clientX, y: e.clientY, t: performance.now() }; };
    this._onUp = (e) => {
      const d = this._pdown; this._pdown = null;
      if (!d || this.walker.locked) return;
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6 || performance.now() - d.t > 350) return;
      const m = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1);
      this._ray.setFromCamera(m, this.camera);
      const hits = this._ray.intersectObjects(this._stations.map(s => s.plate), false);
      if (hits.length && hits[0].distance < 14) {
        this.onEnter?.(hits[0].object.userData.emblemNumber);
      }
    };
    el.addEventListener('pointerdown', this._onDown);
    el.addEventListener('pointerup', this._onUp);
  }

  teleportStage(stage) {
    const i = this.order.findIndex(e => (e.alchemical_stage || 'NIGREDO') === stage);
    if (i < 0) return;
    const st = this._stations[i];
    const a = st.angle;
    const px = Math.cos(a) * (RING_R - 6.5), pz = Math.sin(a) * (RING_R - 6.5);
    this.walker.teleportTo(px, pz, this.walker.yawToward([px, pz], [st.x, st.z]), 0.06);
  }

  teleportCenter() {
    this.walker.teleportTo(0, 10, 0, 0.1);
  }

  update(dt) {
    this._t += dt;
    this.walker.update(dt);
    this.walker.applyTo(this.camera);

    // HUD proximity (throttled)
    this._stTimer += dt;
    if (this._stTimer > 0.25) {
      this._stTimer = 0;
      const p = this.walker.player.pos;
      let near = null, best = 42;   // squared distance gate ~6.5m
      for (const st of this._stations) {
        const dx = p.x - st.vx, dz = p.z - st.vz;
        const d2 = dx * dx + dz * dz;
        if (d2 < best) { best = d2; near = st; }
      }
      if ((near?.emblem ?? null) !== (this._near?.emblem ?? null)) {
        this._near = near;
        this.onStation?.(near ? near.emblem : null);
      }
    }

    // Animate the Stone and nearby vignettes only
    this._stone.rotation.y += dt * 0.5;
    this._stone.position.y = 3.0 + Math.sin(this._t * 1.1) * 0.1;
    if (this._stoneLight) this._stoneLight.intensity = 2.4 + Math.sin(this._t * 1.3) * 0.5;
    this._ouro.rotation.y += dt * 0.15;

    const p = this.walker.player.pos;
    for (const st of this._stations) {
      if (!st.update) continue;
      const dx = p.x - st.vx, dz = p.z - st.vz;
      if (dx * dx + dz * dz < 900) st.update(this._t);
    }
  }

  getSpawnState() {
    const p = this.walker.player;
    return { pos: [p.pos.x, p.pos.z], yaw: p.yaw, pitch: p.pitch };
  }

  dispose() {
    this.walker.dispose();
    const el = this.renderer.domElement;
    el.removeEventListener('pointerdown', this._onDown);
    el.removeEventListener('pointerup', this._onUp);
    this.renderer.shadowMap.enabled = false;
    this._disp.forEach(d => d?.dispose?.());
    this.scene.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (o.material.map) o.material.map.dispose();
        o.material.dispose();
      }
    });
    this.scene.environment = null;
  }
}
