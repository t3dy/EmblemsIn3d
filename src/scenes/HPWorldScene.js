// HPWorldScene.js — the Dream Garden of Poliphilo: one continuous, explorable
// world holding every Hypnerotomachia design as a station along the book's
// processional journey.
//
//   gate of obelisks (start) → the Three Doors wall (f.119) → the plaza of the
//   Elephant & Obelisk (f.25) → west: the Planetary Palace (f.88) · east: the
//   Quinta Essentia court (f.164) → and beyond, the Fountain of Venus (f.80).
//
// First-person: WASD / arrows to walk, drag to look, 1–5 teleports between the
// wonders. The whole world is built once against a render-style interface
// (src/shaders/HPStyles.js) so it can be dressed as the warm lit garden or as
// a 3-D rendering of the 1499 woodcuts (paper, hatching, ink outlines, one
// raking shadow light — the EmblemPapercraft method).

import * as THREE from 'three';
import { ParticleStream } from '../systems/Particles.js?v=3';
import { createStyle, INK } from '../shaders/HPStyles.js?v=1';
import { getEnvMap } from './EmblemScene.js?v=9';

// pos/look are [x, z] on the ground plane; folio/emblem feed the HUD + research
export const HP_STATIONS = [
  { key: 'fountain',         name: 'Fountain of Venus',    folio: 80,  emblem: 1,
    pos: [0, -10.5],  look: [0, -20],  radius: 9, pitch: 0.16 },
  { key: 'planetary_palace', name: 'The Planetary Palace', folio: 88,  emblem: 17,
    pos: [-11.5, 0],  look: [-20, 0],  radius: 9 },
  { key: 'three_doors',      name: 'The Three Doors',      folio: 119, emblem: 19,
    pos: [0, 21],     look: [0, 12],   radius: 9, pitch: 0.05 },
  { key: 'quinta_essentia',  name: 'Quinta Essentia',      folio: 164, emblem: 46,
    pos: [13, 0],     look: [21, 0],   radius: 8 },
  { key: 'elephant',         name: 'The Elephant & Obelisk', folio: 25, emblem: null,
    pos: [0, 6.5],    look: [0, 0],    radius: 6 },
];

const EYE = 1.7;

const METALS = [
  { name: 'Saturn',  metal: 'Lead',        glyph: '♄', color: 0x55555e, emissive: 0x111114, metalness: 0.5,  rough: 0.6 },
  { name: 'Jupiter', metal: 'Tin',         glyph: '♃', color: 0x9aa0a8, emissive: 0x1a1c20, metalness: 0.7,  rough: 0.4 },
  { name: 'Mars',    metal: 'Iron',        glyph: '♂', color: 0x9a3a28, emissive: 0x3a0a04, metalness: 0.6,  rough: 0.5 },
  { name: 'Sol',     metal: 'Gold',        glyph: '☉', color: 0xffd24a, emissive: 0x6a4a00, metalness: 1.0,  rough: 0.15 },
  { name: 'Venus',   metal: 'Copper',      glyph: '♀', color: 0xc06a3a, emissive: 0x2a1004, metalness: 0.8,  rough: 0.35 },
  { name: 'Mercury', metal: 'Quicksilver', glyph: '☿', color: 0xc8d2da, emissive: 0x202428, metalness: 1.0,  rough: 0.10 },
  { name: 'Luna',    metal: 'Silver',      glyph: '☽', color: 0xe2e2ea, emissive: 0x222228, metalness: 0.95, rough: 0.2 },
];

const DOORS = [
  { x: -4.6, w: 2.0, h: 3.3, title: 'Virtue',         sub: 'THE STEEP ASCENT',  color: 0x8ab0d8 },
  { x:  0.0, w: 2.4, h: 3.9, title: 'The Middle Way', sub: 'VIA MEDIA',         color: 0xb8a848 },
  { x:  4.6, w: 2.0, h: 3.3, title: 'Pleasure',       sub: 'THE FLOWERED GATE', color: 0xd86a5a },
];

const ELEMENTS = [
  { deg: 117, title: 'Earth', sub: 'TERRA', color: 0x6a7a3a },
  { deg: 159, title: 'Water', sub: 'AQUA',  color: 0x3a7ab0 },
  { deg: 201, title: 'Air',   sub: 'AER',   color: 0xc8cca0 },
  { deg: 243, title: 'Fire',  sub: 'IGNIS', color: 0xe06028 },
];

export class HPWorldScene {
  constructor(renderer, composer, { style = 'lit', station = null, spawn = null } = {}) {
    this.renderer = renderer;
    this.composer = composer;
    this.styleKey = style;
    this.style    = createStyle(style);
    this.scene    = new THREE.Scene();
    this.camera   = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 220);
    this.camera.rotation.order = 'YXZ';
    this.onStation = null;         // callback(station | null) as the player nears a wonder

    // Player state — spawn override (style toggle keeps your place), else at
    // the requested station, else outside the gate looking down the axis.
    const st = station && HP_STATIONS.find(s => s.key === station);
    if (spawn) {
      this.player = { pos: new THREE.Vector3(spawn.pos[0], 0, spawn.pos[2] ?? spawn.pos[1]), yaw: spawn.yaw, pitch: spawn.pitch };
    } else if (st) {
      this.player = { pos: new THREE.Vector3(st.pos[0], 0, st.pos[1]), yaw: this._yawToward(st.pos, st.look), pitch: st.pitch ?? -0.04 };
    } else {
      this.player = { pos: new THREE.Vector3(0, 0, 30), yaw: 0, pitch: -0.02 };
    }

    this._t = 0;
    this._streams = [];
    this._keys = new Set();
    this._colliders = [];          // { x, z, r }
    this._walls = [];              // { x0, x1, z0, z1 }
    this._orbs = [];               // bobbing pedestal orbs (palace + quinta elements)
    this._pulses = [];             // point lights that breathe (lit style)
    this._portals = [];            // shimmering door veils (lit style)
    this._quinta = null;
    this._venus = null;
    this._water = [];
    this._bob = 0;
    this._tp = null;               // in-flight teleport tween
    this._stTimer = 0;
    this._nearStation = undefined; // undefined = not yet evaluated
    this._disp = [];
  }

  _yawToward(from, to) {
    // forward = (-sin yaw, 0, -cos yaw)
    return Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));
  }

  async build() {
    const S = this.style;
    this.scene.background = new THREE.Color(S.bg);
    this.scene.fog = new THREE.FogExp2(S.fog.color, S.fog.density);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (S.useEnv) {
      this.scene.environment = getEnvMap(this.renderer);
      this.scene.environmentIntensity = 0.3;
    }
    S.setupLights(this.scene);

    // Shared materials
    this._stoneMat = S.mat({ color: 0x8a7a5a, roughness: 0.85 });
    this._darkStoneMat = S.mat({ color: 0x6a5c44, roughness: 0.9 });
    this._hedgeMat = S.mat({ color: 0x243818, roughness: 0.95 });
    this._trunkMat = S.mat({ color: 0x3a2810, roughness: 0.9 });
    this._leafMat  = S.mat({ color: 0x1a3010, roughness: 0.9 });

    this._buildGround();
    this._buildGate();
    this._buildDoorsWall();
    this._buildElephant();
    this._buildPalace();
    this._buildQuinta();
    this._buildFountain();
    this._buildTrees();

    const bloom = this.composer.passes.find(p => p.constructor?.name === 'UnrealBloomPass');
    if (bloom) bloom.strength = S.bloom;

    this._initControls();
    this._applyCamera();
  }

  // ── Small helpers ─────────────────────────────────────────────────────────

  _m(geo, mat, x = 0, y = 0, z = 0, o = {}) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    if (o.rx) m.rotation.x = o.rx;
    if (o.ry) m.rotation.y = o.ry;
    if (o.rz) m.rotation.z = o.rz;
    m.castShadow = o.cast !== false;
    m.receiveShadow = o.receive !== false;
    if (o.outline && this.style.outline) this.style.outline(m, o.outline === true ? 1.035 : o.outline);
    (o.parent || this.scene).add(m);
    return m;
  }

  _circleCol(x, z, r) { this._colliders.push({ x, z, r }); }

  _plaqueTexture({ glyph = null, glyphColor = null, main, sub }, wide = false) {
    const P = this.style.plaqueColors;
    const c = document.createElement('canvas');
    c.width = wide ? 320 : 256; c.height = glyph ? 132 : 96;
    const x = c.getContext('2d');
    x.fillStyle = P.bg; x.fillRect(0, 0, c.width, c.height);
    x.strokeStyle = P.border; x.lineWidth = 3; x.strokeRect(4, 4, c.width - 8, c.height - 8);
    x.textAlign = 'center';
    const cx = c.width / 2;
    const accent = P.accent || glyphColor || P.text;
    if (glyph) {
      x.fillStyle = accent;  x.font = '58px serif';     x.fillText(glyph, cx, 58);
      x.fillStyle = P.text;  x.font = '24px Georgia';   x.fillText(main, cx, 94);
      x.fillStyle = P.sub;   x.font = '15px Georgia';   x.fillText(sub, cx, 117);
    } else {
      x.fillStyle = accent;  x.font = '30px Georgia';   x.fillText(main, cx, 44);
      x.fillStyle = P.sub;   x.font = '14px Georgia';   x.fillText(sub, cx, 72);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    this._disp.push(t);
    return t;
  }

  _plaque(spec, w, h, x, y, z, ry = 0, wide = false) {
    const tex = this._plaqueTexture(spec, wide);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    return this._m(new THREE.PlaneGeometry(w, h), mat, x, y, z, { ry, cast: false, receive: false });
  }

  // ── Ground, paths, perimeter ──────────────────────────────────────────────

  _buildGround() {
    const S = this.style;
    const groundMat = S.key === 'woodcut'
      ? S.mat({ tone: 0.10, rim: 0 })
      : S.mat({ color: 0x223014, roughness: 0.98, metalness: 0.0 });
    this._m(new THREE.PlaneGeometry(110, 110, 4, 4), groundMat, 0, 0, 0, { rx: -Math.PI / 2, cast: false });

    const pathMat = S.key === 'woodcut'
      ? S.mat({ tone: 0.03, rim: 0 })
      : S.mat({ color: 0x6a5a40, roughness: 0.92 });

    // Main processional axis, cross paths to the two courts, plaza + grove discs
    this._m(new THREE.PlaneGeometry(3.4, 64), pathMat, 0, 0.012, 1, { rx: -Math.PI / 2, cast: false });
    this._m(new THREE.PlaneGeometry(38, 2.8), pathMat, 0, 0.012, 0, { rx: -Math.PI / 2, cast: false });
    this._m(new THREE.CircleGeometry(7, 40), pathMat, 0, 0.014, 0, { rx: -Math.PI / 2, cast: false });
    this._m(new THREE.CircleGeometry(8.5, 40), pathMat, 0, 0.014, -20, { rx: -Math.PI / 2, cast: false });
  }

  _buildGate() {
    // Twin obelisks flanking the entrance, hedge walls running outward
    for (const s of [-1, 1]) {
      this._obelisk(s * 3.4, 26, 1.3, 3.4);
      this._m(new THREE.BoxGeometry(13, 1.1, 0.7), this._hedgeMat, s * 10.4, 0.55, 26);
      this._walls.push({ x0: s * 10.4 - 6.5, x1: s * 10.4 + 6.5, z0: 25.65, z1: 26.35 });
    }
  }

  _obelisk(x, z, base, height) {
    this._m(new THREE.BoxGeometry(base, base * 0.5, base), this._stoneMat, x, base * 0.25, z, { outline: true });
    this._m(new THREE.CylinderGeometry(0.10, base * 0.32, height, 4), this._stoneMat, x, base * 0.5 + height / 2, z, { outline: true });
    this._m(new THREE.SphereGeometry(0.11, 10, 8), this._stoneMat, x, base * 0.5 + height + 0.08, z);
    this._circleCol(x, z, base * 0.7);
  }

  // ── The Three Doors (f.119) — a wall you actually walk through ───────────

  _buildDoorsWall() {
    const S = this.style;
    const Z = 12, WALL_H = 4.8;

    // Wall segments between the openings
    const edges = [-14, ...DOORS.flatMap(d => [d.x - d.w / 2 - 0.6, d.x + d.w / 2 + 0.6]), 14];
    for (let i = 0; i < edges.length; i += 2) {
      const a = edges[i], b = edges[i + 1];
      this._m(new THREE.BoxGeometry(b - a, WALL_H, 0.7), this._stoneMat, (a + b) / 2, WALL_H / 2, Z);
      this._walls.push({ x0: a, x1: b, z0: Z - 0.35, z1: Z + 0.35 });
    }
    // Cornice
    this._m(new THREE.BoxGeometry(28.6, 0.35, 1.0), this._darkStoneMat, 0, WALL_H + 0.17, Z);

    DOORS.forEach((d, i) => {
      // Fill above each opening + jamb trims
      const over = WALL_H - d.h;
      this._m(new THREE.BoxGeometry(d.w + 1.2, over, 0.7), this._stoneMat, d.x, d.h + over / 2, Z);
      for (const s of [-1, 1]) {
        this._m(new THREE.BoxGeometry(0.28, d.h, 0.85), this._darkStoneMat, d.x + s * (d.w / 2 + 0.14), d.h / 2, Z, { outline: true });
      }
      this._m(new THREE.BoxGeometry(d.w + 0.8, 0.3, 0.85), this._darkStoneMat, d.x, d.h + 0.15, Z);

      // Title plaque over the door, facing the approaching dreamer (+z side)
      this._plaque({ main: d.title, sub: d.sub, glyphColor: '#' + d.color.toString(16).padStart(6, '0') },
        1.9, 0.55, d.x, d.h + 0.75, Z + 0.42, 0, true);

      // Lit style: a shimmering coloured veil you pass through; woodcut: open air
      const pm = S.portalMat(d.color);
      if (pm) {
        const portal = this._m(new THREE.PlaneGeometry(d.w, d.h - 0.1), pm, d.x, (d.h - 0.1) / 2, Z, { cast: false, receive: false });
        this._portals.push({ mat: pm, base: pm.opacity, phase: i * 1.3 });
        const pl = S.pointLight(d.color, 1.2, 6);
        if (pl) { pl.position.set(d.x, 1.4, Z + 1.0); this.scene.add(pl); this._pulses.push({ pl, base: 1.2, phase: i * 1.3 }); }
        void portal;
      }
    });

    // Pediment over the central door — a flattened triangular prism whose apex
    // points up (thetaStart π puts one triangle vertex at local -z → world +y
    // once the prism is laid on its side).
    const ped = this._m(
      new THREE.CylinderGeometry(1.6, 1.6, 0.55, 3, 1, false, Math.PI),
      this._stoneMat, 0, WALL_H + 0.55, Z, { rx: Math.PI / 2, outline: true });
    ped.scale.set(2.0, 1, 0.62); // wide along the wall, squat in height
  }

  // ── The Elephant & Obelisk (f.25) — plaza centrepiece ─────────────────────

  _buildElephant() {
    const S = this.style;
    const eleMat = S.mat({ color: 0x7a7068, tone: 0.08, roughness: 0.8, metalness: 0.05 });
    const g = new THREE.Group();
    g.rotation.y = Math.PI; // head toward the arriving dreamer (+z)
    this.scene.add(g);

    // Plinth
    this._m(new THREE.BoxGeometry(3.4, 0.7, 2.2), this._stoneMat, 0, 0.35, 0, { parent: g, outline: true });

    // Body (facing -z, toward the fountain)
    const body = this._m(new THREE.SphereGeometry(0.85, 20, 14), eleMat, 0, 2.0, 0, { parent: g, outline: true });
    body.scale.set(1.0, 0.85, 1.5);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      this._m(new THREE.CylinderGeometry(0.16, 0.19, 1.1, 10), eleMat, sx * 0.42, 1.25, sz * 0.6, { parent: g });
    }
    const head = this._m(new THREE.SphereGeometry(0.5, 16, 12), eleMat, 0, 2.25, -1.35, { parent: g, outline: true });
    void head;
    for (const s of [-1, 1]) { // ears
      const ear = this._m(new THREE.CircleGeometry(0.34, 14), S.mat({ color: 0x6a6058, tone: 0.12, side: THREE.DoubleSide }), s * 0.45, 2.35, -1.25, { ry: s * Math.PI / 2.6, cast: false, parent: g });
      void ear;
      // tusks
      this._m(new THREE.ConeGeometry(0.05, 0.5, 8), eleMat, s * 0.2, 1.85, -1.72, { rx: -Math.PI / 2.4, parent: g });
    }
    // Trunk — a curved tube
    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 2.05, -1.72),
      new THREE.Vector3(0, 1.62, -1.98),
      new THREE.Vector3(0, 1.15, -1.9),
      new THREE.Vector3(0, 0.95, -1.6),
    ]);
    this._m(new THREE.TubeGeometry(trunkCurve, 12, 0.09, 8), eleMat, 0, 0, 0, { parent: g });

    // The obelisk it carries
    this._m(new THREE.BoxGeometry(0.95, 0.22, 0.95), this._stoneMat, 0, 2.85, 0, { parent: g });
    this._m(new THREE.CylinderGeometry(0.09, 0.30, 2.5, 4), this._stoneMat, 0, 4.2, 0, { parent: g, outline: true });
    this._m(new THREE.SphereGeometry(0.1, 10, 8), this._stoneMat, 0, 5.5, 0, { parent: g });

    this._walls.push({ x0: -1.8, x1: 1.8, z0: -1.3, z1: 1.3 });
  }

  // ── The Planetary Palace (f.88) — west court ──────────────────────────────

  _buildPalace() {
    const S = this.style;
    // Court floor
    this._m(new THREE.BoxGeometry(15, 0.24, 11), this._darkStoneMat, -20.5, 0.12, 0, { cast: false });

    // Colonnades with entablature
    for (const side of [-1, 1]) {
      for (let i = 0; i < 6; i++) {
        const x = -26 + i * 2.2, z = side * 4.2;
        this._m(new THREE.BoxGeometry(0.8, 0.24, 0.8), this._stoneMat, x, 0.36, z);
        this._m(new THREE.CylinderGeometry(0.26, 0.32, 3.6, 14), this._stoneMat, x, 2.28, z, { outline: true });
        this._m(new THREE.BoxGeometry(0.78, 0.3, 0.78), this._stoneMat, x, 4.23, z);
        this._circleCol(x, z, 0.55);
      }
      this._m(new THREE.BoxGeometry(12.6, 0.5, 0.95), this._darkStoneMat, -20.5, 4.63, side * 4.2);
    }

    // Seven planetary stations, Chaldean order, along the north side of the hall
    METALS.forEach((m, i) => {
      const x = -26 + i * (11 / 6), z = -1.9;
      this._m(new THREE.CylinderGeometry(0.34, 0.46, 1.3, 16), this._stoneMat, x, 0.89, z);
      const orb = this._m(new THREE.SphereGeometry(0.42, 28, 20), S.glowMat(m), x, 2.1, z, { outline: true });
      this._orbs.push({ orb, base: 2.1, phase: i * 0.7, spin: true });

      const pl = S.pointLight(m.color, 0.7, 3.6);
      if (pl) { pl.position.set(x, 2.1, z + 0.5); this.scene.add(pl); this._pulses.push({ pl, base: 0.7, phase: i * 0.7 }); }

      this._plaque({ glyph: m.glyph, glyphColor: '#' + m.color.toString(16).padStart(6, '0'), main: m.metal, sub: m.name.toUpperCase() },
        1.15, 0.6, x, 0.95, z + 0.56);
      this._circleCol(x, z, 0.7);
    });
  }

  // ── Quinta Essentia (f.164) — east court ──────────────────────────────────

  _buildQuinta() {
    const S = this.style;
    const CX = 21.5, CZ = 0;

    // Stepped dais + altar
    this._m(new THREE.CylinderGeometry(2.6, 2.9, 0.28, 28), this._stoneMat, CX, 0.14, CZ, { cast: false });
    this._m(new THREE.CylinderGeometry(1.9, 2.2, 0.28, 24), this._stoneMat, CX, 0.42, CZ, { cast: false });
    this._m(new THREE.CylinderGeometry(0.8, 1.0, 1.3, 20), this._stoneMat, CX, 1.2, CZ, { outline: true });
    this._circleCol(CX, CZ, 2.4);

    // The quintessence — a slowly turning dodecahedron above the altar
    const dod = this._m(new THREE.DodecahedronGeometry(0.82, 0),
      S.key === 'woodcut' ? S.glowMat() : S.glowMat({ color: 0xffd24a, emissive: 0xc89020, emissiveIntensity: 1.1, metalness: 0.9, roughness: 0.15 }),
      CX, 3.2, CZ, { outline: 1.05 });
    const dl = S.pointLight(0xffd060, 2.4, 10);
    if (dl) { dl.position.set(CX, 3.2, CZ + 0.5); this.scene.add(dl); }
    this._quinta = { dod, dl };

    // Woodcut glory — radiating ink rays, the way the plates draw radiance
    if (S.rays) {
      const pts = [];
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const r0 = 1.15, r1 = i % 2 ? 1.75 : 2.15;
        pts.push(new THREE.Vector3(0, Math.sin(a) * r0, Math.cos(a) * r0));
        pts.push(new THREE.Vector3(0, Math.sin(a) * r1, Math.cos(a) * r1));
      }
      const rays = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), S.rayMat());
      rays.position.set(CX, 3.2, CZ);
      this.scene.add(rays);
      this._quinta.rays = rays;
    }

    // The four elements, ranged in an arc on the approach side
    ELEMENTS.forEach((el, i) => {
      const a = (el.deg * Math.PI) / 180;
      const x = CX + Math.cos(a) * 4.6, z = CZ + Math.sin(a) * 4.6;
      this._m(new THREE.CylinderGeometry(0.3, 0.4, 1.0, 14), this._stoneMat, x, 0.5, z);
      const orb = this._m(new THREE.SphereGeometry(0.36, 22, 16),
        S.key === 'woodcut' ? S.glowMat() : S.glowMat({ color: el.color, emissiveIntensity: 0.4, metalness: 0.3, roughness: 0.5 }),
        x, 1.35, z, { outline: true });
      this._orbs.push({ orb, base: 1.35, phase: i * 1.2, spin: false });

      const pl = S.pointLight(el.color, 0.55, 3);
      if (pl) { pl.position.set(x, 1.35, z); this.scene.add(pl); this._pulses.push({ pl, base: 0.55, phase: i * 1.2 }); }

      const outward = Math.atan2(Math.cos(a), Math.sin(a));
      this._plaque({ main: el.title, sub: el.sub, glyphColor: '#' + el.color.toString(16).padStart(6, '0') },
        1.0, 0.34, x + Math.cos(a) * 0.45, 0.5, z + Math.sin(a) * 0.45, outward);
      this._circleCol(x, z, 0.6);
    });

    // Twin obelisks behind the altar
    this._obelisk(25.5, -3.4, 1.1, 3.0);
    this._obelisk(25.5,  3.4, 1.1, 3.0);
  }

  // ── Fountain of Venus (f.80) — the climax grove ───────────────────────────

  _buildFountain() {
    const S = this.style;
    const FX = 0, FZ = -20;
    const waterMat = S.waterMat();

    // Octagonal plinth + great basin
    this._m(new THREE.CylinderGeometry(3.6, 3.9, 0.5, 8), this._stoneMat, FX, 0.25, FZ, { cast: false, outline: true });
    this._m(new THREE.CylinderGeometry(3.15, 3.3, 0.95, 28, 1, true), this._stoneMat, FX, 0.95, FZ);
    this._m(new THREE.TorusGeometry(3.15, 0.14, 10, 36), this._stoneMat, FX, 1.42, FZ, { rx: Math.PI / 2, outline: true });
    this._water.push(this._m(new THREE.CircleGeometry(3.05, 36), waterMat, FX, 1.3, FZ, { rx: -Math.PI / 2, cast: false }));
    this._circleCol(FX, FZ, 4.1);

    // Central stem + two upper tiers
    this._m(new THREE.CylinderGeometry(0.2, 0.26, 3.4, 12), this._stoneMat, FX, 2.2, FZ);
    const tiers = [{ r: 1.5, y: 2.6 }, { r: 0.85, y: 3.6 }];
    for (const t of tiers) {
      this._m(new THREE.CylinderGeometry(t.r, t.r * 0.55, 0.35, 24, 1, true), this._stoneMat, FX, t.y - 0.1, FZ);
      this._m(new THREE.TorusGeometry(t.r, 0.09, 8, 30), this._stoneMat, FX, t.y + 0.08, FZ, { rx: Math.PI / 2 });
      this._water.push(this._m(new THREE.CircleGeometry(t.r * 0.92, 28), waterMat, FX, t.y + 0.05, FZ, { rx: -Math.PI / 2, cast: false }));
    }

    // Venus atop — offering pose over the waters
    const vMat = S.mat({ color: 0xd4c0a0, roughness: 0.6, metalness: 0.15 });
    const v = new THREE.Group();
    this._m(new THREE.CylinderGeometry(0.3, 0.36, 0.22, 12), this._stoneMat, 0, 0, 0, { parent: v });
    this._m(new THREE.ConeGeometry(0.24, 0.6, 10), vMat, 0, 0.45, 0, { parent: v, outline: true });
    this._m(new THREE.CapsuleGeometry(0.18, 0.6, 6, 10), vMat, 0, 1.0, 0, { parent: v, outline: true });
    this._m(new THREE.SphereGeometry(0.15, 12, 10), vMat, 0, 1.56, 0, { parent: v, outline: true });
    [[-0.24, -0.65], [0.24, 0.65]].forEach(([x, rz]) => {
      this._m(new THREE.CapsuleGeometry(0.06, 0.42, 4, 8), vMat, x, 1.16, 0, { rz, parent: v });
    });
    v.position.set(FX, 4.05, FZ);
    this.scene.add(v);
    this._venus = v;

    // Cascades: tier → tier → basin, plus a fine spray
    const specs = [
      { from: [FX, 3.72, FZ], to: [FX + 0.35, 2.7, FZ + 0.3], count: 60, size: 0.03, speed: 0.9, arc: 0.05 },
      { from: [FX, 2.68, FZ], to: [FX + 0.7, 1.35, FZ - 0.5], count: 90, size: 0.04, speed: 0.75, arc: 0.15 },
      { from: [FX - 0.4, 2.68, FZ + 0.2], to: [FX - 1.2, 1.35, FZ + 0.8], count: 70, size: 0.035, speed: 0.7, arc: 0.2 },
      { from: [FX + 1.0, 1.5, FZ], to: [FX + 2.2, 1.32, FZ + 0.9], count: 40, size: 0.025, speed: 1.2, arc: 0.35 },
    ];
    for (const sp of specs) {
      const stream = new ParticleStream({
        count: sp.count,
        source: new THREE.Vector3(...sp.from),
        target: new THREE.Vector3(...sp.to),
        color: 0xd0e8ff, size: sp.size, speed: sp.speed, arc: sp.arc,
      });
      stream.opacity = 0.6; stream.active = true;
      S.tuneStream(stream);
      this.scene.add(stream.points);
      this._streams.push(stream);
    }

    // Water glow (lit style only)
    const wl = S.pointLight(0x80c0ff, 1.6, 8);
    if (wl) { wl.position.set(FX, 1.8, FZ); this.scene.add(wl); this._pulses.push({ pl: wl, base: 1.6, phase: 0 }); }
    const vl = S.pointLight(0xc8a44a, 1.1, 6);
    if (vl) { vl.position.set(FX, 4.6, FZ); this.scene.add(vl); this._pulses.push({ pl: vl, base: 1.1, phase: 1.7 }); }
  }

  // ── Garden fabric ─────────────────────────────────────────────────────────

  _buildTrees() {
    const put = (x, z, s = 1) => {
      this._m(new THREE.CylinderGeometry(0.12 * s, 0.16 * s, 0.8 * s, 6), this._trunkMat, x, 0.4 * s, z);
      this._m(new THREE.ConeGeometry(0.55 * s, 3.2 * s, 8), this._leafMat, x, 0.8 * s + 1.6 * s, z, { outline: true });
      this._circleCol(x, z, 0.5 * s);
    };

    // Ring around the fountain grove (gap on the approach side, +z)
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      if (Math.abs(a - Math.PI / 2) < 0.38) continue;
      put(Math.cos(a) * 11.5, -20 + Math.sin(a) * 11.5, 1.1);
    }
    // Avenue pairs along the approach
    for (const z of [17, 21.5]) { put(-5.2, z); put(5.2, z); }
    // Flanking the cross paths
    for (const s of [-1, 1]) {
      put(s * 9, 5.4); put(s * 9, -5.4);
      put(s * 13.5, 5.8, 0.9); put(s * 13.5, -5.8, 0.9);
    }
    // Behind the two courts
    put(-29, 7, 1.2); put(-29, -7, 1.2);
    put(28, 8, 1.2); put(28, -8, 1.2);

    // Low hedges framing the plaza quadrants
    for (const [x, z, w, d] of [[-8.5, 8.8, 6, 0.5], [8.5, 8.8, 6, 0.5], [-8.5, -8.8, 6, 0.5], [8.5, -8.8, 6, 0.5]]) {
      this._m(new THREE.BoxGeometry(w, 0.9, d), this._hedgeMat, x, 0.45, z);
      this._walls.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 });
    }
  }

  // ── First-person controls ─────────────────────────────────────────────────

  _initControls() {
    const el = this.renderer.domElement;
    this._onKeyDown = (e) => {
      const d = e.code.match(/^Digit([1-5])$/);
      if (d) { this.teleport(HP_STATIONS[+d[1] - 1].key); return; }
      this._keys.add(e.code);
    };
    this._onKeyUp = (e) => this._keys.delete(e.code);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);

    this._dragging = false;
    this._onPD = (e) => {
      this._dragging = true; this._px = e.clientX; this._py = e.clientY;
      el.setPointerCapture?.(e.pointerId);
    };
    this._onPM = (e) => {
      if (!this._dragging) return;
      const dx = e.clientX - this._px, dy = e.clientY - this._py;
      this._px = e.clientX; this._py = e.clientY;
      this.player.yaw  -= dx * 0.0034;
      this.player.pitch = THREE.MathUtils.clamp(this.player.pitch - dy * 0.0028, -1.15, 1.15);
    };
    this._onPU = () => { this._dragging = false; };
    el.addEventListener('pointerdown', this._onPD);
    el.addEventListener('pointermove', this._onPM);
    window.addEventListener('pointerup', this._onPU);
  }

  teleport(key) {
    const st = HP_STATIONS.find(s => s.key === key);
    if (!st) return;
    const p = this.player;
    let dyaw = this._yawToward(st.pos, st.look) - p.yaw;
    while (dyaw >  Math.PI) dyaw -= Math.PI * 2;
    while (dyaw < -Math.PI) dyaw += Math.PI * 2;
    this._tp = {
      t: 0, dur: 0.7,
      fx: p.pos.x, fz: p.pos.z, fyaw: p.yaw, fpitch: p.pitch,
      tx: st.pos[0], tz: st.pos[1], tyaw: p.yaw + dyaw, tpitch: st.pitch ?? -0.04,
    };
  }

  // Preserves the walker's exact place across a style toggle
  getSpawnState() {
    return { pos: [this.player.pos.x, this.player.pos.z], yaw: this.player.yaw, pitch: this.player.pitch };
  }

  _collide(p) {
    const R = 0.45;
    for (const c of this._colliders) {
      const dx = p.x - c.x, dz = p.z - c.z;
      const r = c.r + R, d2 = dx * dx + dz * dz;
      if (d2 < r * r && d2 > 1e-6) {
        const d = Math.sqrt(d2);
        p.x = c.x + (dx / d) * r;
        p.z = c.z + (dz / d) * r;
      }
    }
    for (const w of this._walls) {
      if (p.x > w.x0 - R && p.x < w.x1 + R && p.z > w.z0 - R && p.z < w.z1 + R) {
        const pl = p.x - (w.x0 - R), pr = (w.x1 + R) - p.x;
        const pn = p.z - (w.z0 - R), pf = (w.z1 + R) - p.z;
        const m = Math.min(pl, pr, pn, pf);
        if (m === pl) p.x = w.x0 - R;
        else if (m === pr) p.x = w.x1 + R;
        else if (m === pn) p.z = w.z0 - R;
        else p.z = w.z1 + R;
      }
    }
    p.x = THREE.MathUtils.clamp(p.x, -36, 36);
    p.z = THREE.MathUtils.clamp(p.z, -34, 33);
  }

  _applyCamera() {
    const p = this.player;
    this.camera.position.set(p.pos.x, EYE + Math.sin(this._bob) * 0.035, p.pos.z);
    this.camera.rotation.set(p.pitch, p.yaw, 0);
  }

  update(dt) {
    this._t += dt;
    const p = this.player;

    if (this._tp) {
      // Teleport glide
      const tp = this._tp;
      tp.t += dt;
      const k = Math.min(1, tp.t / tp.dur);
      const e = k * k * (3 - 2 * k);
      p.pos.x = tp.fx + (tp.tx - tp.fx) * e;
      p.pos.z = tp.fz + (tp.tz - tp.fz) * e;
      p.yaw   = tp.fyaw + (tp.tyaw - tp.fyaw) * e;
      p.pitch = tp.fpitch + (tp.tpitch - tp.fpitch) * e;
      if (k >= 1) this._tp = null;
    } else {
      // Walk
      const K = this._keys;
      if (K.has('ArrowLeft'))  p.yaw += dt * 1.9;
      if (K.has('ArrowRight')) p.yaw -= dt * 1.9;
      const f = new THREE.Vector3(-Math.sin(p.yaw), 0, -Math.cos(p.yaw));
      const r = new THREE.Vector3(Math.cos(p.yaw), 0, -Math.sin(p.yaw));
      const mv = new THREE.Vector3();
      if (K.has('KeyW') || K.has('ArrowUp'))   mv.add(f);
      if (K.has('KeyS') || K.has('ArrowDown')) mv.sub(f);
      if (K.has('KeyA')) mv.sub(r);
      if (K.has('KeyD')) mv.add(r);
      if (mv.lengthSq() > 0) {
        const speed = (K.has('ShiftLeft') || K.has('ShiftRight')) ? 10 : 5.2;
        mv.normalize().multiplyScalar(speed * dt);
        p.pos.add(mv);
        this._collide(p.pos);
        this._bob += dt * (K.has('ShiftLeft') || K.has('ShiftRight') ? 11 : 7.5);
      }
    }
    this._applyCamera();

    // Station proximity → HUD callback (throttled)
    this._stTimer += dt;
    if (this._stTimer > 0.25) {
      this._stTimer = 0;
      let near = null, best = Infinity;
      for (const st of HP_STATIONS) {
        const dx = p.pos.x - st.pos[0], dz = p.pos.z - st.pos[1];
        const d2 = dx * dx + dz * dz;
        if (d2 < st.radius * st.radius && d2 < best) { best = d2; near = st; }
      }
      if (near !== this._nearStation) {
        this._nearStation = near;
        this.onStation?.(near);
      }
    }

    // Living world
    this._streams.forEach(s => s.update(this._t));
    if (this._venus) this._venus.rotation.y += dt * 0.2;
    for (const { orb, base, phase, spin } of this._orbs) {
      orb.position.y = base + Math.sin(this._t * 1.15 + phase) * 0.1;
      if (spin) orb.rotation.y += dt * 0.5;
    }
    for (const { pl, base, phase } of this._pulses) {
      pl.intensity = base + Math.sin(this._t * 1.4 + phase) * base * 0.35;
    }
    for (const d of this._portals) {
      d.mat.opacity = d.base + Math.sin(this._t * 1.1 + d.phase) * 0.11;
    }
    if (this._quinta) {
      this._quinta.dod.rotation.y += dt * 0.4;
      this._quinta.dod.rotation.x += dt * 0.15;
      if (this._quinta.dl) this._quinta.dl.intensity = 2.2 + Math.sin(this._t * 1.3) * 0.6;
      if (this._quinta.rays) this._quinta.rays.rotation.x += dt * 0.1;
    }
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('pointerup', this._onPU);
    const el = this.renderer.domElement;
    el.removeEventListener('pointerdown', this._onPD);
    el.removeEventListener('pointermove', this._onPM);

    this.renderer.shadowMap.enabled = false;
    this._streams.forEach(s => s.dispose());
    this._streams = [];
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
