// HPWorldScene.js — the Dream Garden of Poliphilo: one continuous, explorable
// world holding the Hypnerotomachia's scenes as stations along the book's
// processional journey, north to south:
//
//   the dark wood (selva oscura, with the wolf) → the Great Pyramid-Portal
//   (with the dragon) → the Three Doors wall (f.119) → the plaza of the
//   Elephant & Obelisk (f.25) → west: the Planetary Palace (f.88) and the
//   court of Queen Eleuterylida with her five sense-nymphs · east: the
//   Quinta Essentia court (f.164) and Polia's garden → the Fountain of Venus
//   ringed by the four Triumphs of Jupiter → the shore where Cupid's boat
//   waits for Cythera.
//
// First-person (src/systems/Walker.js): WASD / arrows walk, drag to look,
// 1–9 teleport between the wonders. Named NPCs (src/systems/Cast.js) people
// the world in free-walk; Poliphilo's Dream mode (src/systems/DreamMode.js)
// walks the player through the story with narration.
//
// The whole world is built once against a render-style interface
// (src/shaders/HPStyles.js): the warm lit garden, or a 3-D rendering of the
// 1499 woodcuts (paper, hatching, ink outlines, one raking shadow light —
// the EmblemPapercraft method).

import * as THREE from 'three';
import { ParticleStream } from '../systems/Particles.js?v=3';
import { Walker } from '../systems/Walker.js?v=2';
import { makeCast } from '../systems/Cast.js?v=4';
import { createStyle, addSkyDome } from '../shaders/HPStyles.js?v=4';
import { getEnvMap } from './EmblemScene.js?v=9';
import { createMeadowField } from '../systems/Meadow.js?v=1';

// pos/look are [x, z] on the ground plane; folio/emblem feed the HUD + research.
// The first nine are reachable with digit keys 1–9 (journey order).
export const HP_STATIONS = [
  { key: 'wood',             name: 'The Dark Wood',          folio: 2,   emblem: null,
    pos: [0, 45],     look: [0, 38],   radius: 9 },
  { key: 'portal',           name: 'The Great Portal',       folio: 13,  emblem: null,
    pos: [0, 37],     look: [0, 26],   radius: 7, pitch: 0.2 },
  { key: 'court',            name: 'The Court of Queen Eleuterylida', folio: 62, emblem: null,
    pos: [-12.8, 23], look: [-23.5, 18.5], radius: 9 },
  { key: 'three_doors',      name: 'The Three Doors',        folio: 119, emblem: 19,
    pos: [0, 21],     look: [0, 12],   radius: 6, pitch: 0.05 },
  { key: 'elephant',         name: 'The Elephant & Obelisk', folio: 25,  emblem: null,
    pos: [0, 6.5],    look: [0, 0],    radius: 6 },
  { key: 'planetary_palace', name: 'The Planetary Palace',   folio: 88,  emblem: 17,
    pos: [-11.5, 0],  look: [-20, 0],  radius: 9 },
  { key: 'quinta_essentia',  name: 'Quinta Essentia',        folio: 164, emblem: 46,
    pos: [13, 0],     look: [21, 0],   radius: 8 },
  { key: 'fountain',         name: 'Fountain of Venus',      folio: 80,  emblem: 1,
    pos: [0, -10.5],  look: [0, -20],  radius: 8, pitch: 0.16 },
  { key: 'cythera',          name: 'The Shore to Cythera',   folio: 193, emblem: null,
    pos: [0, -33],    look: [0, -46],  radius: 8 },
  // Discoverable, not on the digit row:
  { key: 'polia',            name: "Polia's Garden",         folio: 143, emblem: null,
    pos: [14.5, 23.5], look: [19, 19.5], radius: 7 },
  { key: 'triumphs',         name: 'The Four Triumphs',      folio: 158, emblem: null,
    pos: [5.5, -4.5], look: [10.6, -9.4], radius: 5 },
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

// The three gates as the book letters them (Dallington 1592; see
// docs/HP_SOURCEBOOK.md §4). Poliphilo's right hand carries Theodoxia, his left
// Cosmodoxia, "and the thirde, Erototrophos" — so MATER AMORIS is the middle
// door, and it is the one he chooses. Each is titled on the plate in Greek,
// Latin, Hebrew and Arabic; we give the Greek and the Latin.
const DOORS = [
  { x: -4.6, w: 2.0, h: 3.3, title: 'Gloria Dei',   greek: 'ΘΕΟΔΟΞΙΑ',     sub: 'THEODOXIA · THE STEEP ASCENT',
    keeper: 'Thende',     color: 0x8ab0d8 },
  { x:  0.0, w: 2.4, h: 3.9, title: 'Mater Amoris', greek: 'ΕΡΩΤΟΤΡΟΦΟΣ',  sub: 'EROTOTROPHOS · THE CHOSEN GATE',
    keeper: 'Philtronia', color: 0xd86a5a },
  { x:  4.6, w: 2.0, h: 3.3, title: 'Gloria Mundi', greek: 'ΚΟΣΜΟΔΟΞΙΑ',   sub: 'COSMODOXIA · THE GLORY OF THE WORLD',
    keeper: 'Euclelia',   color: 0xb8a848 },
];

const ELEMENTS = [
  { deg: 117, title: 'Earth', sub: 'TERRA', color: 0x6a7a3a },
  { deg: 159, title: 'Water', sub: 'AQUA',  color: 0x3a7ab0 },
  { deg: 201, title: 'Air',   sub: 'AER',   color: 0xc8cca0 },
  { deg: 243, title: 'Fire',  sub: 'IGNIS', color: 0xe06028 },
];

// The five nymphs of the senses who receive Poliphilo at the bath (their
// names are the Greek senses, as given in the book).
// Each carries the object by which the book identifies her: "she that carrieth
// the boxes and white cloathes Offressia. This other with the shining Glasse …
// Orassia. Shee that carrieth the sounding Harpe is called Achol, and shee that
// beareth the casting bottle of precious Lyquor … Genshra." Aphea, who is Touch,
// carries nothing — she is the one who says "giue mee thy hand."
// (Dallington 1592; docs/HP_SOURCEBOOK.md §3.)
const SENSE_NYMPHS = [
  { name: 'Aphea',     sense: 'Touch',   robe: 0xc88a9a, attribute: null,     pose: 'offer' },
  { name: 'Osfressia', sense: 'Smell',   robe: 0x9ab08a, attribute: 'casket' },
  { name: 'Orassia',   sense: 'Sight',   robe: 0x8a9ac8, attribute: 'mirror' },
  { name: 'Achoe',     sense: 'Hearing', robe: 0xc8b06a, attribute: 'harp' },
  { name: 'Geussia',   sense: 'Taste',   robe: 0xb08ac0, attribute: 'flask' },
];

// Each car is drawn by SIX beasts, not a pair, and every beast carries a riding
// nymph musician: "the two next the Tryumph were apparelled in blewe silke, like
// the collour of a Peacockes necke. The middlemost in bright Crymosen: and the
// two formost in an Emerald greene." Europa's team is centaurs got of Ixion,
// Leda's six white elephants coupled two and two, and the mystical car goes
// "very leisurely" behind six leopards in vine-withes.
// (Dallington 1592; docs/HP_SOURCEBOOK.md §5.)
const TRIUMPH_LIVERY = [0x2a5aa0, 0x2a5aa0, 0xc02840, 0xc02840, 0x1e8a54, 0x1e8a54];
const TRIUMPHS = [
  { key: 'europa', title: 'Triumph of Europa', motif: 'bull',  team: 'centaur',  pos: [10.6, -9.4],  color: 0xc8a040 },
  { key: 'leda',   title: 'Triumph of Leda',   motif: 'swan',  team: 'elephant', pos: [-10.6, -9.4], color: 0xb0c0d8 },
  { key: 'danae',  title: 'Triumph of Danaë',  motif: 'gold',  team: 'horse',    pos: [-10.6, -30.6], color: 0xe0c060 },
  { key: 'semele', title: 'Triumph of Semele', motif: 'fire',  team: 'leopard',  pos: [10.6, -30.6], color: 0xd86a3a },
];

export class HPWorldScene {
  constructor(renderer, composer, { style = 'lit', station = null, spawn = null } = {}) {
    this.renderer = renderer;
    this.composer = composer;
    this.styleKey = style;
    this.style    = createStyle(style);
    this.scene    = new THREE.Scene();
    this.camera   = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 260);
    this.camera.rotation.order = 'YXZ';
    this.onStation = null;         // callback(station | null) as the player nears a wonder

    this.walker = new Walker(renderer, {
      eye: EYE,
      bounds: { minX: -36, maxX: 36, minZ: -41.5, maxZ: 50 },
      onDigit: (n) => { const st = HP_STATIONS[n - 1]; if (st) this.teleport(st.key); },
    });

    const st = station && HP_STATIONS.find(s => s.key === station);
    if (spawn) {
      this.walker.player.pos.set(spawn.pos[0], 0, spawn.pos[2] ?? spawn.pos[1]);
      this.walker.player.yaw = spawn.yaw; this.walker.player.pitch = spawn.pitch;
    } else if (st) {
      this.walker.player.pos.set(st.pos[0], 0, st.pos[1]);
      this.walker.player.yaw = this.walker.yawToward(st.pos, st.look);
      this.walker.player.pitch = st.pitch ?? -0.04;
    } else {
      this.walker.player.pos.set(0, 0, 44);   // wake in the dark wood
      this.walker.player.yaw = 0;
      this.walker.player.pitch = -0.02;
    }

    this._t = 0;
    this._streams = [];
    this._orbs = [];
    this._pulses = [];
    this._portals = [];
    this._quinta = null;
    this._venus = null;
    this._boat = null;
    this._floats = [];
    this._waters = [];             // spinning water discs
    this._sea = null;              // breathing sea material
    this._motes = null;            // drifting pollen in the lit garden
    this._meadows = [];            // instanced grass / flower fields (lit only)
    this._vanes = [];              // weathervanes that turn with the wind
    this._npcs = [];               // { g, phase, sway }
    this.npcs = {};                // key → group (for the dream's cameos)
    this._stTimer = 0;
    this._nearStation = undefined;
    this._disp = [];
    this.dream = null;             // set by main when Dream mode starts
  }

  async build() {
    const S = this.style;
    // The shared style is a twilight; the lit garden here is lifted to a bright,
    // warm late afternoon so nothing reads as dark. (Woodcut keeps its paper.)
    const lit = S.key !== 'woodcut';
    this.scene.background = new THREE.Color(lit ? 0x9fb6d6 : S.bg);
    this.scene.fog = lit
      ? new THREE.FogExp2(0xd0be9e, 0.0072)
      : new THREE.FogExp2(S.fog.color, S.fog.density);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (S.useEnv) {
      this.scene.environment = getEnvMap(this.renderer);
      this.scene.environmentIntensity = 0.3;
    }
    S.setupLights(this.scene);
    if (lit) addSkyDome(this.scene, { top: 0x86a4cc, horizon: 0xf0d6a8, stars: 0 });
    else if (S.sky) addSkyDome(this.scene, S.sky);
    // Lit garden: a bright afternoon key with enough fill to stay sunny, while
    // the raking sun still gives carved stone a lit side and a shadowed side.
    if (lit) this._tuneLitLighting();
    this.cast = makeCast(S);

    // Shared materials
    this._stoneMat = S.mat({ color: 0x8a7a5a, roughness: 0.92 });
    this._darkStoneMat = S.mat({ color: 0x6a5c44, roughness: 0.95 });
    this._hedgeMat = S.mat({ color: 0x243818, roughness: 0.95 });
    this._trunkMat = S.mat({ color: 0x3a2810, roughness: 0.9 });
    this._leafMat  = S.mat({ color: 0x1a3010, roughness: 0.9 });

    // In the lit garden, dress the flat materials with procedural surface —
    // pitted ashlar for stone, mottled foliage for hedges — so the megaliths
    // stop reading as smooth boxes. (The woodcut style ignores maps: its
    // hatching shader overwrites the fragment colour, so we skip it there.)
    if (S.key !== 'woodcut') {
      // The map carries the full albedo, so the material colour must be white —
      // otherwise colour × map multiplies and the surface reads far too dark.
      // A NoColorSpace clone of the same canvas doubles as bump + roughness, so
      // mortar lines and veins catch the raking sun as actual relief.
      const stoneTex = this._surfaceTexture({ base: '#a7967a', dark: '#4a3a22', light: '#e6d6b0', veins: 6, courses: 4, repeat: 2 });
      const darkTex  = this._surfaceTexture({ base: '#8a7a5c', dark: '#3a2e18', light: '#c8b890', veins: 5, courses: 5, repeat: 2 });
      const hedgeTex = this._surfaceTexture({ base: '#33501f', dark: '#16260e', light: '#557a30', blobs: 90, speckle: 3200, repeat: 3 });
      this._dress(this._stoneMat, stoneTex, 0.4);
      this._dress(this._darkStoneMat, darkTex, 0.4);
      this._dress(this._hedgeMat, hedgeTex, 0.25);
    }

    this._buildGround();
    this._buildWood();
    this._buildGreatPortal();
    this._buildCourt();
    this._buildPoliaGarden();
    this._buildDoorsWall();
    this._buildElephant();
    this._buildPalace();
    this._buildQuinta();
    this._buildFountain();
    this._buildTriumphs();
    this._buildCythera();
    this._buildTrees();
    if (lit) this._buildMotes();
    if (lit) this._buildMeadow();

    const bloom = this.composer.passes.find(p => p.constructor?.name === 'UnrealBloomPass');
    if (bloom) bloom.strength = S.bloom;

    this.walker.attach();
    this.walker.applyTo(this.camera);
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

  _circleCol(x, z, r) { this.walker.colliders.push({ x, z, r }); }
  _wallCol(x0, x1, z0, z1) { this.walker.walls.push({ x0, x1, z0, z1 }); }

  // Place a named NPC: registers for idle sway and the npcs registry
  _npc(key, group, x, z, faceYaw = 0, { label = null, sub = '', labelY = 2.0, sway = 0.05 } = {}) {
    group.position.set(x, 0, z);
    group.rotation.y = faceYaw;
    this.scene.add(group);
    if (label) {
      const l = this.cast.label(label, { sub });
      l.position.y = labelY;
      group.add(l);
    }
    this.npcs[key] = group;
    const n = { g: group, phase: this._npcs.length * 1.7, baseY: group.rotation.y, sway };
    // Figures expose arm pivots (Cast.js userData) — breathe them a little so
    // the poses live instead of freezing.
    const { armL, armR } = group.userData;
    if (armL && armR) { n.armL = armL; n.armR = armR; n.aL = armL.rotation.z; n.aR = armR.rotation.z; }
    this._npcs.push(n);
    return group;
  }

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

  // Punch up the lit garden: the shared style floods the scene with fill
  // (ambient + hemisphere ≈ the key), which flattens everything. Bias toward
  // the raking sun so surfaces gain a lit side and a shadowed side.
  _tuneLitLighting() {
    this.scene.traverse(o => {
      if (o.isAmbientLight) { o.intensity = 0.85; o.color.set(0x4a4632); }
      else if (o.isHemisphereLight) o.intensity = 1.15;
      else if (o.isDirectionalLight && o.castShadow) o.intensity = 2.6;
    });
    if (this.scene.environment) this.scene.environmentIntensity = 0.42;
  }

  // A deterministic procedural surface baked to a canvas: a stone/foliage base
  // clouded with tonal blobs, dusted with speckle, optionally cut by carved
  // veins and horizontal ashlar courses. Blobs are drawn wrapped (±size) so the
  // texture tiles seamlessly and can repeat across the colossal masonry.
  _surfaceTexture({ base, dark, light, blobs = 60, speckle = 2400, veins = 0, courses = 0, repeat = 2 } = {}) {
    const N = 256;
    const c = document.createElement('canvas');
    c.width = c.height = N;
    const x = c.getContext('2d');
    const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };

    x.fillStyle = base; x.fillRect(0, 0, N, N);

    // Tonal cloud, wrapped for seamless tiling
    for (let i = 0; i < blobs; i++) {
      const px = rnd(i, 1) * N, py = rnd(i, 2) * N, r = 14 + rnd(i, 3) * 50;
      const dv = rnd(i, 4) - 0.5;
      const col = dv < 0 ? dark : light;
      const a = (0.05 + Math.abs(dv) * 0.13).toFixed(3);
      for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) {
        if (Math.abs(px + ox - N / 2) > N || Math.abs(py + oy - N / 2) > N) continue;
        const g = x.createRadialGradient(px + ox, py + oy, 0, px + ox, py + oy, r);
        g.addColorStop(0, this._rgba(col, a));
        g.addColorStop(1, this._rgba(col, '0'));
        x.fillStyle = g; x.beginPath(); x.arc(px + ox, py + oy, r, 0, 7); x.fill();
      }
    }

    // Ashlar courses: faint recessed mortar lines, running-bond verticals
    if (courses > 0) {
      x.lineWidth = 2;
      for (let r = 1; r < courses; r++) {
        const y = (r / courses) * N + (rnd(r, 7) - 0.5) * 4;
        x.strokeStyle = this._rgba(dark, '0.5'); x.beginPath(); x.moveTo(0, y); x.lineTo(N, y); x.stroke();
        x.strokeStyle = this._rgba(light, '0.28'); x.beginPath(); x.moveTo(0, y + 1.5); x.lineTo(N, y + 1.5); x.stroke();
        const off = (r % 2) * (N / 6);
        for (let b = 0; b < 4; b++) {
          const vx = off + b * (N / 4) + (rnd(r * 5 + b, 9) - 0.5) * 10;
          const y0 = (r / courses) * N, y1 = ((r + 1) / courses) * N;
          x.strokeStyle = this._rgba(dark, '0.4'); x.beginPath(); x.moveTo(vx, y0); x.lineTo(vx, y1); x.stroke();
        }
      }
    }

    // Speckle grit
    for (let i = 0; i < speckle; i++) {
      const px = rnd(i, 5) * N, py = rnd(i, 6) * N, d = rnd(i, 7);
      x.fillStyle = d < 0.5 ? this._rgba(dark, (0.05 + d * 0.22).toFixed(3)) : this._rgba(light, (0.04 + (d - 0.5) * 0.18).toFixed(3));
      x.fillRect(px, py, 1, 1);
    }

    // Carved veins / cracks
    for (let i = 0; i < veins; i++) {
      x.lineWidth = 0.8 + rnd(i, 20) * 0.7;
      x.strokeStyle = this._rgba(dark, (0.14 + rnd(i, 8) * 0.16).toFixed(3));
      let px = rnd(i, 9) * N, py = rnd(i, 10) * N;
      x.beginPath(); x.moveTo(px, py);
      const steps = 6 + Math.floor(rnd(i, 11) * 6);
      for (let s = 0; s < steps; s++) { px += (rnd(i, s + 12) - 0.5) * 64; py += (rnd(i, s + 40) - 0.5) * 64; x.lineTo(px, py); }
      x.stroke();
    }

    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat, repeat);
    t.anisotropy = 4;
    this._disp.push(t);
    return t;
  }

  _rgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  // Dress a lit material with a procedural canvas: the sRGB canvas is the
  // albedo; a linear (NoColorSpace) clone drives bump + roughness, so the
  // painted mortar and veins also read as relief under the raking sun.
  _dress(mat, tex, bumpScale = 0.3) {
    mat.color.set(0xffffff);
    mat.map = tex;
    const lin = tex.clone();
    lin.colorSpace = THREE.NoColorSpace;
    lin.needsUpdate = true;
    this._disp.push(lin);
    mat.bumpMap = lin;
    mat.bumpScale = bumpScale;
    mat.roughnessMap = lin;
  }

  // Concentric-ripple water albedo, so the slow spin of the fountain discs
  // is visible as moving water rather than a featureless plate.
  _waterTexture() {
    const N = 256;
    const c = document.createElement('canvas');
    c.width = c.height = N;
    const x = c.getContext('2d');
    const rnd = (i, k) => { const v = Math.sin(i * 91.7 + k * 269.5) * 43758.5453; return v - Math.floor(v); };
    x.fillStyle = '#2a4a6a'; x.fillRect(0, 0, N, N);
    for (let i = 0; i < 46; i++) {
      const r = 8 + rnd(i, 1) * 120;
      const a0 = rnd(i, 2) * Math.PI * 2, span = 0.5 + rnd(i, 3) * 2.2;
      x.lineWidth = 1 + rnd(i, 4) * 1.6;
      x.strokeStyle = rnd(i, 5) < 0.7
        ? `rgba(140,190,230,${(0.08 + rnd(i, 6) * 0.14).toFixed(3)})`
        : `rgba(16,36,58,${(0.10 + rnd(i, 6) * 0.12).toFixed(3)})`;
      x.beginPath(); x.arc(N / 2, N / 2, r, a0, a0 + span); x.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    this._disp.push(t);
    return t;
  }

  // ── Pollen motes — the air of the afternoon made visible ─────────────────

  _buildMotes() {
    const N = 220;
    const pos = new Float32Array(N * 3);
    const seeds = new Float32Array(N * 2);
    const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
    for (let i = 0; i < N; i++) {
      pos[i * 3]     = (rnd(i, 1) - 0.5) * 58;
      pos[i * 3 + 1] = 0.3 + rnd(i, 2) * 5.5;
      pos[i * 3 + 2] = (rnd(i, 3) - 0.5) * 76 - 2;
      seeds[i * 2]     = rnd(i, 4) * Math.PI * 2;   // wobble phase
      seeds[i * 2 + 1] = 0.06 + rnd(i, 5) * 0.10;   // fall speed
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffe8b0, size: 0.055, transparent: true, opacity: 0.35,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
    });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    this.scene.add(points);
    this._motes = { points, pos, seeds, n: N };
  }

  // ── Ground, paths ─────────────────────────────────────────────────────────

  _buildGround() {
    const S = this.style;
    const groundMat = S.key === 'woodcut'
      ? S.mat({ tone: 0.10, rim: 0 })
      : S.mat({ color: 0x223014, roughness: 0.98, metalness: 0.0 });
    const pathMat = S.key === 'woodcut'
      ? S.mat({ tone: 0.03, rim: 0 })
      : S.mat({ color: 0x6a5a40, roughness: 0.92 });

    // Break the flat sward and the smooth path into meadow and gravel, with a
    // little bump relief so the gravel catches the afternoon sun.
    if (S.key !== 'woodcut') {
      this._dress(groundMat, this._surfaceTexture({ base: '#3a5423', dark: '#1c3010', light: '#5c7e36', blobs: 80, speckle: 4200, repeat: 22 }), 0.15);
      this._dress(pathMat, this._surfaceTexture({ base: '#8a7550', dark: '#4a3a20', light: '#b8a074', blobs: 54, speckle: 3800, repeat: 8 }), 0.3);
    }

    this._m(new THREE.PlaneGeometry(130, 130, 4, 4), groundMat, 0, 0, -2, { rx: -Math.PI / 2, cast: false });

    // Main processional axis (wood → shore), two cross paths to the courts
    this._m(new THREE.PlaneGeometry(3.4, 86), pathMat, 0, 0.012, 7, { rx: -Math.PI / 2, cast: false });
    this._m(new THREE.PlaneGeometry(38, 2.8), pathMat, 0, 0.012, 0, { rx: -Math.PI / 2, cast: false });
    this._m(new THREE.PlaneGeometry(38, 2.8), pathMat, 0, 0.012, 20, { rx: -Math.PI / 2, cast: false });
    this._m(new THREE.CircleGeometry(7, 40), pathMat, 0, 0.014, 0, { rx: -Math.PI / 2, cast: false });
    this._m(new THREE.CircleGeometry(8.5, 40), pathMat, 0, 0.014, -20, { rx: -Math.PI / 2, cast: false });
  }

  // ── The Dark Wood (the selva oscura where the dream begins) ──────────────

  _buildWood() {
    const S = this.style;
    // A darker floor under the wood
    const duffMat = S.key === 'woodcut'
      ? S.mat({ tone: 0.2, rim: 0 })
      : S.mat({ color: 0x141c0c, roughness: 0.98 });
    this._m(new THREE.PlaneGeometry(70, 22), duffMat, 0, 0.008, 43, { rx: -Math.PI / 2, cast: false });

    // Dense deterministic scatter of trees, keeping the path clear
    const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
    for (let i = 0; i < 64; i++) {
      const x = (rnd(i, 1) - 0.5) * (i % 3 ? 30 : 62);  // dense core, scattered fringe
      const z = 34.5 + rnd(i, 2) * 16;
      if (Math.abs(x) < 2.7) continue;                  // the path survives
      const s = 0.9 + rnd(i, 3) * 0.8;
      const kind = rnd(i, 4) < 0.6 ? 'cypress' : 'broad';
      const t = this.cast.props.tree(kind, s * 1.3);
      t.position.set(x, 0, z);
      t.rotation.y = rnd(i, 5) * Math.PI;
      this.scene.add(t);
      this._circleCol(x, z, 0.5);
    }

    // The hungry wolf, watching the path
    const wolf = this.cast.animals.wolf(1.15);
    this._npc('wolf', wolf, 4.2, 40.5, -2.2, { label: 'The Wolf', labelY: 1.5, sway: 0.03 });

    // A small spring (Poliphilo's thirst)
    const spring = this.cast.props.pool(1.1);
    spring.position.set(-3.6, 0, 37.5);
    this.scene.add(spring);
    this._circleCol(-3.6, 37.5, 0.9);
  }

  // ── The Great Portal (the colossal pyramid-gate) ──────────────────────────

  _buildGreatPortal() {
    const S = this.style;
    const Z = 26;
    // Massive piers flanking a tall passage
    for (const s of [-1, 1]) {
      this._m(new THREE.BoxGeometry(7.2, 6.4, 2.2), this._stoneMat, s * 5.4, 3.2, Z, { outline: true });
      this._wallCol(s * 5.4 - 3.6, s * 5.4 + 3.6, Z - 1.1, Z + 1.1);
      // pier reliefs
      this._m(new THREE.BoxGeometry(0.5, 5.2, 0.3), this._darkStoneMat, s * 2.4, 2.6, Z + 1.15);
    }
    // Lintel + frieze
    this._m(new THREE.BoxGeometry(18, 1.4, 2.4), this._stoneMat, 0, 7.1, Z);
    this._plaque({ main: 'FESTINA LENTE', sub: 'THE HIEROGLYPHS OF THE GREAT PORTAL' }, 4.6, 1.1, 0, 6.4, Z + 1.25, 0, true);

    // The stepped pyramid. The book gives it 1,410 courses rising off a plinth
    // six furlongs square; at garden scale we read that as many shallow courses
    // rather than four fat ones, so the mass tapers the way the plate draws it.
    // (docs/HP_SOURCEBOOK.md §1.)
    const COURSES = 26;
    for (let i = 0; i < COURSES; i++) {
      const t = i / COURSES;
      const w = 17.5 * (1 - t * 0.86);
      const d = 3.0 * (1 - t * 0.55);
      this._m(new THREE.BoxGeometry(w, 0.42, d), this._stoneMat, 0, 8.3 + i * 0.42, Z, { cast: i % 4 === 0 });
    }
    const TOP = 8.3 + COURSES * 0.42;

    // "a huge Cube or foure square stone of forme like a dye" closes the pyramid
    this._m(new THREE.BoxGeometry(1.9, 1.9, 1.9), this._stoneMat, 0, TOP + 0.95, Z, { outline: true });

    // Four harpies of cast metal at the cube's corners, "their steales and clawes
    // armed," meeting over the diagonal to make the obelisk's socket
    const harpyMat = S.key === 'woodcut'
      ? S.mat({ tone: 0.2 })
      : S.mat({ color: 0x8a6a2a, metalness: 0.9, roughness: 0.35 });
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const hx = sx * 0.72, hz = Z + sz * 0.72;
      // clawed foot, body, and a swept wing leaning in toward the socket
      this._m(new THREE.ConeGeometry(0.16, 0.34, 6), harpyMat, hx, TOP + 2.06, hz);
      this._m(new THREE.CapsuleGeometry(0.1, 0.26, 4, 8), harpyMat, hx, TOP + 2.42, hz);
      const wing = this._m(new THREE.ConeGeometry(0.1, 0.6, 4), harpyMat, hx * 0.55, TOP + 2.66, Z + sz * 0.4);
      wing.rotation.z = -sx * 0.55; wing.rotation.x = -sz * 0.45;
    }
    // The socket the four of them make, dressed with cast leaves and fruit
    this._m(new THREE.CylinderGeometry(0.42, 0.52, 0.3, 12), harpyMat, 0, TOP + 2.9, Z);

    // The obelisk: two paces broad, seven high, of mirror-polished Theban stone
    this._m(new THREE.CylinderGeometry(0.13, 0.42, 4.6, 4), this._stoneMat, 0, TOP + 5.35, Z, { outline: true });
    // Its copper turning-base, and on it the winged Fortuna who spins in the wind
    this._m(new THREE.CylinderGeometry(0.16, 0.16, 0.14, 10), harpyMat, 0, TOP + 7.72, Z);
    this._buildFortuna(0, TOP + 7.85, Z, harpyMat);

    // The Medusa whose gaping mouth is the door to the spiral stair. The book
    // sets her "vpon the right hand as I went" — the dreamer walks south out of
    // the wood, so his right is +x.
    this._buildMedusaDoor(5.4, Z + 1.16);

    // Flanking obelisks and hedge walls
    for (const s of [-1, 1]) {
      this._obelisk(s * 11.2, Z, 1.3, 3.4);
      this._m(new THREE.BoxGeometry(9, 1.1, 0.7), this._hedgeMat, s * 17.8, 0.55, Z);
      this._wallCol(s * 17.8 - 4.5, s * 17.8 + 4.5, Z - 0.35, Z + 0.35);
    }

    // The dragon that drove Poliphilo through the vaults
    const dragon = this.cast.animals.dragon(1.6);
    this._npc('dragon', dragon, 3.4, 23.2, 2.6, { label: 'The Dragon', labelY: 1.6, sway: 0.06 });
  }

  // The winged nymph on the obelisk's point: robe "blowne abroad with the winde,"
  // two wings from the shoulder blades, face turned back toward them, her right
  // hand holding a cornucopia "stopped vp, and the mouth downewarde." She turns
  // with every gust — the whole point of her — so she is registered in _vanes.
  _buildFortuna(x, y, z, metalMat) {
    const g = new THREE.Group();
    const S = this.style;
    const skin = S.key === 'woodcut' ? S.mat({ tone: 0.02 }) : S.mat({ color: 0xc8a860, metalness: 0.75, roughness: 0.4 });

    this._m(new THREE.ConeGeometry(0.17, 0.5, 10), metalMat, 0, 0.25, 0, { parent: g });   // wind-blown robe
    this._m(new THREE.CapsuleGeometry(0.075, 0.2, 4, 8), skin, 0, 0.62, 0, { parent: g });
    this._m(new THREE.SphereGeometry(0.075, 10, 8), skin, 0, 0.8, -0.02, { parent: g });
    for (const s of [-1, 1]) {                                                             // the spread wings
      const w = this._m(new THREE.ConeGeometry(0.075, 0.62, 4), metalMat, s * 0.16, 0.68, 0.1, { parent: g });
      w.rotation.z = s * 1.15; w.rotation.x = -0.5;
    }
    const horn = this.cast.attributes.cornucopia(1.1);   // held out, mouth down
    horn.position.set(0.26, 0.6, 0.02);
    horn.rotation.z = Math.PI * 0.85;
    g.add(horn);
    this._m(new THREE.CapsuleGeometry(0.03, 0.2, 4, 6), skin, -0.13, 0.62, 0.03, { parent: g }).rotation.z = 0.5;

    g.position.set(x, y, z);
    this.scene.add(g);
    this._vanes.push({ g, rate: 0.55, phase: 0 });
    return g;
  }

  // Medusa's head carved on the pier, her mouth the entrance to the spiral
  // stair, her viper hair with "most shining stones" set for eyes.
  _buildMedusaDoor(x, z) {
    const S = this.style;
    const g = new THREE.Group();
    const face = this._darkStoneMat;

    this._m(new THREE.CircleGeometry(1.15, 24), face, 0, 0, 0, { parent: g, cast: false });
    // the writhing hair, ringing the face
    const snake = S.key === 'woodcut' ? S.mat({ tone: 0.22 }) : S.mat({ color: 0x4a4234, roughness: 0.7 });
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const r = 1.12;
      const s = this._m(new THREE.CapsuleGeometry(0.07, 0.34, 4, 6), snake,
        Math.cos(a) * r, Math.sin(a) * r, 0.06, { parent: g });
      s.rotation.z = a + Math.PI / 2;
      // the shining stones set in their eyes
      this._m(new THREE.SphereGeometry(0.032, 8, 6),
        S.key === 'woodcut' ? S.glowMat() : S.mat({ color: 0xffd870, emissive: 0xc09020, emissiveIntensity: 1.2, metalness: 0.9, roughness: 0.15 }),
        Math.cos(a) * (r + 0.2), Math.sin(a) * (r + 0.2), 0.14, { parent: g, cast: false });
    }
    // brows and hollow eyes
    for (const s of [-1, 1]) {
      this._m(new THREE.SphereGeometry(0.15, 10, 8), S.key === 'woodcut' ? S.mat({ tone: 0.4 }) : S.mat({ color: 0x0e0c08, roughness: 1 }),
        s * 0.34, 0.3, 0.07, { parent: g, cast: false });
      this._m(new THREE.BoxGeometry(0.42, 0.07, 0.1), snake, s * 0.34, 0.52, 0.1, { parent: g }).rotation.z = -s * 0.22;
    }
    // the gaping mouth — the doorway itself, dark all the way in
    this._m(new THREE.PlaneGeometry(0.62, 0.78),
      S.key === 'woodcut' ? S.mat({ tone: 0.45, rim: 0 }) : S.mat({ color: 0x080604, roughness: 1 }),
      0, -0.42, 0.09, { parent: g, cast: false });

    g.position.set(x, 3.1, z);
    this.scene.add(g);
    this._plaque({ main: 'ΛΙΧΑΣ ΩΡΘΩΣΕΝ ΜΕ', sub: 'LICHAS THE LIBYAN SET ME UP' },
      1.7, 0.42, x, 1.5, z + 0.02, 0, true);
    return g;
  }

  _obelisk(x, z, base, height) {
    this._m(new THREE.BoxGeometry(base, base * 0.5, base), this._stoneMat, x, base * 0.25, z, { outline: true });
    this._m(new THREE.CylinderGeometry(0.10, base * 0.32, height, 4), this._stoneMat, x, base * 0.5 + height / 2, z, { outline: true });
    this._m(new THREE.SphereGeometry(0.11, 10, 8), this._stoneMat, x, base * 0.5 + height + 0.08, z);
    this._circleCol(x, z, base * 0.7);
  }

  // ── The Court of Queen Eleuterylida (free will) ───────────────────────────

  _buildCourt() {
    const CX = -19, CZ = 20;
    this._m(new THREE.BoxGeometry(14, 0.22, 11), this._darkStoneMat, CX - 1, 0.11, CZ, { cast: false });

    // Throne on a dais, the Queen enthroned
    this._m(new THREE.CylinderGeometry(1.6, 1.9, 0.35, 18), this._stoneMat, CX - 4.5, 0.18, CZ, { cast: false });
    this._m(new THREE.BoxGeometry(1.0, 0.55, 0.9), this._stoneMat, CX - 4.7, 0.62, CZ);
    this._m(new THREE.BoxGeometry(1.0, 1.7, 0.22), this._stoneMat, CX - 5.2, 1.2, CZ, { outline: true });
    this._circleCol(CX - 4.7, CZ, 1.4);
    const queen = this.cast.figure({ h: 1.0, robe: 0xc8a030, pose: 'offer', crowned: true });
    this._npc('queen', queen, CX - 4.35, CZ, Math.PI / 2, { label: 'Eleuterylida', sub: 'QUEEN · FREE WILL', labelY: 2.1, sway: 0.02 });
    queen.position.y = 0.62;   // seated on the throne

    // The five nymphs of the senses, arced before the throne, each carrying the
    // attribute the book gives her (harp, glass, casket, casting bottle).
    SENSE_NYMPHS.forEach((n, i) => {
      const a = (-0.65 + (i / 4) * 1.3);
      const x = CX - 4.5 + Math.cos(a) * 3.6, z = CZ + Math.sin(a) * 3.6;
      const g = this.cast.nymph({
        name: n.name, robe: n.robe, h: 0.95,
        pose: n.pose || 'stand', attribute: n.attribute,
      });
      this._npc('nymph_' + n.name.toLowerCase(), g, x, z, Math.PI / 2 + a, { label: n.name, sub: n.sense.toUpperCase(), labelY: 2.0 });
      this._circleCol(x, z, 0.4);
    });

    // The bath of the nymphs
    const bath = this.cast.props.pool(2.4);
    bath.position.set(CX + 3.5, 0, CZ + 2.8);
    this.scene.add(bath);
    this._circleCol(CX + 3.5, CZ + 2.8, 1.7);

    // Fountain jets over the bath (lit sparkle)
    const stream = new ParticleStream({
      count: 40, source: new THREE.Vector3(CX + 3.5, 1.6, CZ + 2.8),
      target: new THREE.Vector3(CX + 3.9, 0.2, CZ + 3.1),
      color: 0xd0e8ff, size: 0.03, speed: 0.8, arc: 0.2,
    });
    stream.opacity = 0.5; stream.active = true;
    this.style.tuneStream(stream);
    this.scene.add(stream.points);
    this._streams.push(stream);
  }

  // ── Polia's Garden (the nymph with the torch) ─────────────────────────────

  _buildPoliaGarden() {
    const CX = 19, CZ = 20;
    this._m(new THREE.BoxGeometry(11, 0.22, 10), this._darkStoneMat, CX, 0.11, CZ, { cast: false });

    // Pergola
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const c = this.cast.props.column(1.7);
      c.position.set(CX + sx * 2.4, 0, CZ + sz * 2.4);
      this.scene.add(c);
      this._circleCol(CX + sx * 2.4, CZ + sz * 2.4, 0.4);
    }
    for (const sz of [-1, 1]) this._m(new THREE.BoxGeometry(5.6, 0.22, 0.4), this._trunkMat, CX, 3.0, CZ + sz * 2.4);
    for (const sx of [-1, 1]) this._m(new THREE.BoxGeometry(0.4, 0.22, 5.6), this._trunkMat, CX + sx * 2.4, 3.0, CZ);
    this._m(new THREE.BoxGeometry(6.2, 0.14, 6.2), this._hedgeMat, CX, 3.2, CZ, { cast: false });

    // Polia and Poliphilo, and her torch
    const polia = this.cast.figure({ h: 1.0, robe: 0xe8ddc0, pose: 'offer' });
    this._npc('polia', polia, CX + 0.9, CZ, Math.PI / 2, { label: 'Polia', sub: 'THE LONG-SOUGHT', labelY: 2.1, sway: 0.03 });
    const poliphilo = this.cast.figure({ h: 1.0, robe: 0x3a3a5a, pose: 'reach' });
    this._npc('poliphilo', poliphilo, CX - 0.9, CZ, -Math.PI / 2, { label: 'Poliphilo', sub: 'THE DREAMER', labelY: 2.1, sway: 0.03 });

    // The torch between them
    this._m(new THREE.CylinderGeometry(0.05, 0.07, 1.1, 8), this._trunkMat, CX, 0.55, CZ - 0.8);
    const flame = this.cast.props.fire(0.5);
    flame.position.set(CX, 1.1, CZ - 0.8);
    this.scene.add(flame);
    this._torch = flame;
    const tl = this.style.pointLight(0xff9040, 1.4, 6);
    if (tl) { tl.position.set(CX, 1.6, CZ - 0.8); this.scene.add(tl); this._pulses.push({ pl: tl, base: 1.4, phase: 0.8 }); }

    // Rose hedges
    for (const sz of [-1, 1]) {
      this._m(new THREE.BoxGeometry(8, 0.8, 0.5), this._hedgeMat, CX, 0.4, CZ + sz * 4.6);
      this._wallCol(CX - 4, CX + 4, CZ + sz * 4.6 - 0.25, CZ + sz * 4.6 + 0.25);
    }
  }

  // ── The Three Doors (f.119) — a wall you actually walk through ───────────

  _buildDoorsWall() {
    const S = this.style;
    const Z = 12, WALL_H = 4.8;

    const edges = [-14, ...DOORS.flatMap(d => [d.x - d.w / 2 - 0.6, d.x + d.w / 2 + 0.6]), 14];
    for (let i = 0; i < edges.length; i += 2) {
      const a = edges[i], b = edges[i + 1];
      this._m(new THREE.BoxGeometry(b - a, WALL_H, 0.7), this._stoneMat, (a + b) / 2, WALL_H / 2, Z);
      this._wallCol(a, b, Z - 0.35, Z + 0.35);
    }
    this._m(new THREE.BoxGeometry(28.6, 0.35, 1.0), this._darkStoneMat, 0, WALL_H + 0.17, Z);

    DOORS.forEach((d, i) => {
      const over = WALL_H - d.h;
      this._m(new THREE.BoxGeometry(d.w + 1.2, over, 0.7), this._stoneMat, d.x, d.h + over / 2, Z);
      for (const s of [-1, 1]) {
        this._m(new THREE.BoxGeometry(0.28, d.h, 0.85), this._darkStoneMat, d.x + s * (d.w / 2 + 0.14), d.h / 2, Z, { outline: true });
      }
      this._m(new THREE.BoxGeometry(d.w + 0.8, 0.3, 0.85), this._darkStoneMat, d.x, d.h + 0.15, Z);

      // Greek above, Latin below — the plate letters each gate in four scripts
      this._plaque({ main: d.title, sub: d.sub, glyphColor: '#' + d.color.toString(16).padStart(6, '0') },
        2.3, 0.6, d.x, d.h + 0.72, Z + 0.42, 0, true);
      this._plaque({ main: d.greek, sub: 'KEPT BY ' + d.keeper.toUpperCase(), glyphColor: '#' + d.color.toString(16).padStart(6, '0') },
        2.0, 0.5, d.x, d.h + 1.28, Z + 0.42, 0, true);

      const pm = S.portalMat(d.color);
      if (pm) {
        this._m(new THREE.PlaneGeometry(d.w, d.h - 0.1), pm, d.x, (d.h - 0.1) / 2, Z, { cast: false, receive: false });
        this._portals.push({ mat: pm, base: pm.opacity, phase: i * 1.3 });
        const pl = S.pointLight(d.color, 1.2, 6);
        if (pl) { pl.position.set(d.x, 1.4, Z + 1.0); this.scene.add(pl); this._pulses.push({ pl, base: 1.2, phase: i * 1.3 }); }
      }
    });

    // Pediment over the central door — apex up (thetaStart π puts a vertex at
    // local -z → world +y once the prism is laid on its side)
    const ped = this._m(
      new THREE.CylinderGeometry(1.6, 1.6, 0.55, 3, 1, false, Math.PI),
      this._stoneMat, 0, WALL_H + 0.55, Z, { rx: Math.PI / 2, outline: true });
    ped.scale.set(2.0, 1, 0.62);

    // Logistica and Thelemia, Poliphilo's guides to the choice. Logistica argues
    // the hard gate with a lute (borrowed from Thelemia) and, when he chooses the
    // flowered one, casts it on the ground and breaks it.
    const logistica = this.cast.nymph({ name: 'Logistica', robe: 0x7a90b8, h: 0.95, pose: 'point', attribute: 'lute' });
    this._npc('logistica', logistica, -2.6, 15.5, 0.6, { label: 'Logistica', sub: 'REASON', labelY: 2.0 });
    const thelemia = this.cast.nymph({ name: 'Thelemia', robe: 0xc87a8a, h: 0.95, pose: 'beckon' });
    this._npc('thelemia', thelemia, 2.6, 15.5, -0.6, { label: 'Thelemia', sub: 'DESIRE', labelY: 2.0 });
  }

  // ── The Elephant & Obelisk (f.25) — plaza centrepiece ─────────────────────

  // The book insists on the materials here: the beast is "of more blacke stone
  // than the Obsidium, powdered ouer with small spottes of golde and glimces of
  // siluer," carrying an obelisk of GREEN Lacedaemonian stone, with tusks of
  // pure white, a Latin motto on the breast-strap and a Greek/Arabic frontlet
  // over the face. Seven steps climb the porphyry base, and a little door under
  // the saddle opens into the body. (Dallington 1592; docs/HP_SOURCEBOOK.md §2.)
  _buildElephant() {
    const S = this.style;
    const eleMat = S.key === 'woodcut'
      ? S.mat({ color: 0x101014, tone: 0.3, roughness: 0.5 })
      : S.mat({ color: 0x0e0e12, roughness: 0.35, metalness: 0.25 });
    // Obsidian dusted with gold and silver: a dark base speckled bright, used as
    // albedo + relief so the flanks glitter under the raking sun.
    if (S.key !== 'woodcut') {
      this._dress(eleMat, this._surfaceTexture({
        base: '#17151c', dark: '#050408', light: '#ffe89a', blobs: 22, speckle: 9000, repeat: 2,
      }), 0.12);
      eleMat.roughness = 0.42;
      eleMat.metalness = 0.3;
    }
    const g = new THREE.Group();
    g.rotation.y = Math.PI; // head toward the arriving dreamer (+z)
    this.scene.add(g);

    // Porphyry base — 12 paces by 5 by 3 in the book, kept to garden scale here
    this._m(new THREE.BoxGeometry(3.4, 0.7, 2.2), this._stoneMat, 0, 0.35, 0, { parent: g, outline: true });
    // The seven steps at the hinder part of the base
    for (let i = 0; i < 7; i++) {
      this._m(new THREE.BoxGeometry(1.5, 0.1, 0.16), this._darkStoneMat,
        0, 0.05 + i * 0.1, 1.1 + (7 - i) * 0.16, { parent: g, cast: false });
    }

    const body = this._m(new THREE.SphereGeometry(0.85, 20, 14), eleMat, 0, 2.0, 0, { parent: g, outline: true });
    body.scale.set(1.0, 0.85, 1.5);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      this._m(new THREE.CylinderGeometry(0.16, 0.19, 1.1, 10), eleMat, sx * 0.42, 1.25, sz * 0.6, { parent: g });
    }
    this._m(new THREE.SphereGeometry(0.5, 16, 12), eleMat, 0, 2.25, -1.35, { parent: g, outline: true });
    for (const s of [-1, 1]) {
      this._m(new THREE.CircleGeometry(0.34, 14), S.mat({ color: 0x6a6058, tone: 0.12, side: THREE.DoubleSide }), s * 0.45, 2.35, -1.25, { ry: s * Math.PI / 2.6, cast: false, parent: g });
      // Tusks "of puer white stone" — not the beast's black
      this._m(new THREE.ConeGeometry(0.05, 0.5, 8),
        S.key === 'woodcut' ? S.mat({ tone: -0.05 }) : S.mat({ color: 0xf0ead8, roughness: 0.45 }),
        s * 0.2, 1.85, -1.72, { rx: -Math.PI / 2.4, parent: g });
    }
    // The goldsmith's frontlet over the face, lettered in Greek and Arabic, and
    // the Latin motto on the breast-strap. (_plaque adds to the scene, not to
    // `g`, so these carry world coordinates: the group is turned through π, so
    // the head faces +z.)
    this._plaque({ main: 'ΠΟΝΟΣ ΚΑΙ ΕΥΦΥΙΑ', sub: 'LABOUR AND NATIVE WIT' },
      0.6, 0.19, 0, 2.46, 1.76, 0, true);
    this._plaque({ main: 'CEREBRVM EST IN CAPITE', sub: 'THE BRAIN IS IN THE HEAD' },
      0.68, 0.2, 0, 1.72, 1.42, 0, true);
    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 2.05, -1.72),
      new THREE.Vector3(0, 1.62, -1.98),
      new THREE.Vector3(0, 1.15, -1.9),
      new THREE.Vector3(0, 0.95, -1.6),
    ]);
    this._m(new THREE.TubeGeometry(trunkCurve, 12, 0.09, 8), eleMat, 0, 0, 0, { parent: g });

    // Brass saddle with its two girths, and the quadrangle that seats the obelisk
    const brass = S.mat({ color: 0xb08a3a, metalness: 0.85, roughness: 0.35, tone: 0.05 });
    this._m(new THREE.BoxGeometry(1.15, 0.14, 1.5), brass, 0, 2.78, 0, { parent: g });
    for (const sz of [-0.55, 0.55]) {
      const girth = this._m(new THREE.TorusGeometry(0.86, 0.045, 6, 20), brass, 0, 1.95, sz, { parent: g });
      girth.rotation.y = Math.PI / 2;
      girth.scale.set(1, 0.95, 1);
    }
    this._m(new THREE.BoxGeometry(0.95, 0.22, 0.95), this._stoneMat, 0, 2.92, 0, { parent: g });

    // The obelisk of green Lacedaemonian stone — two paces broad, seven high —
    // crowned with its shining ball
    // Lacedaemonian green is porfido verde antico — a dark grey-green flecked
    // paler, not an emerald
    const greenStone = S.key === 'woodcut'
      ? S.mat({ tone: 0.16 })
      : S.mat({ color: 0x46543f, roughness: 0.55, metalness: 0.05 });
    if (S.key !== 'woodcut') {
      this._dress(greenStone, this._surfaceTexture({
        base: '#46543f', dark: '#232d20', light: '#8a9a6e', blobs: 34, speckle: 2600, repeat: 2,
      }), 0.2);
      greenStone.roughness = 0.55;
    }
    this._m(new THREE.CylinderGeometry(0.09, 0.30, 2.5, 4), greenStone, 0, 4.28, 0, { parent: g, outline: true });
    this._m(new THREE.SphereGeometry(0.12, 12, 10),
      S.key === 'woodcut' ? S.glowMat() : S.mat({ color: 0xe8d070, metalness: 0.95, roughness: 0.15, emissive: 0x6a5010, emissiveIntensity: 0.5 }),
      0, 5.62, 0, { parent: g });

    // "there was cut out and made a little doore and hollowed entrance … by the
    // which a conuenient going vp into the body of the Olephant was offered me."
    // Inside stands the sepulchre and its everlasting lamp; the door is dark and
    // the lamp shows through it.
    this._m(new THREE.PlaneGeometry(0.42, 0.62),
      S.key === 'woodcut' ? S.mat({ tone: 0.42, rim: 0 }) : S.mat({ color: 0x0a0806, roughness: 1 }),
      0.44, 2.0, 0.86, { ry: 0.5, parent: g, cast: false });
    // beside the steps at the beast's rear, where the door is
    this._plaque({ main: 'QVAERE ET INVENIES', sub: 'THE TOMB WITHIN THE BEAST' },
      0.72, 0.22, 0, 0.95, -1.18, Math.PI, true);
    const lamp = S.pointLight(0xffb050, 0.9, 3.2);
    if (lamp) { lamp.position.set(0.5, 2.0, 0.9); g.add(lamp); this._pulses.push({ pl: lamp, base: 0.9, phase: 2.2 }); }

    this._wallCol(-1.8, 1.8, -1.3, 1.3);
  }

  // ── The Planetary Palace (f.88) — west court ──────────────────────────────

  _buildPalace() {
    const S = this.style;
    this._m(new THREE.BoxGeometry(15, 0.24, 11), this._darkStoneMat, -20.5, 0.12, 0, { cast: false });

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

    this._m(new THREE.CylinderGeometry(2.6, 2.9, 0.28, 28), this._stoneMat, CX, 0.14, CZ, { cast: false });
    this._m(new THREE.CylinderGeometry(1.9, 2.2, 0.28, 24), this._stoneMat, CX, 0.42, CZ, { cast: false });
    this._m(new THREE.CylinderGeometry(0.8, 1.0, 1.3, 20), this._stoneMat, CX, 1.2, CZ, { outline: true });
    this._circleCol(CX, CZ, 2.4);

    const dod = this._m(new THREE.DodecahedronGeometry(0.82, 0),
      S.key === 'woodcut' ? S.glowMat() : S.glowMat({ color: 0xffd24a, emissive: 0xc89020, emissiveIntensity: 1.1, metalness: 0.9, roughness: 0.15 }),
      CX, 3.2, CZ, { outline: 1.05 });
    const dl = S.pointLight(0xffd060, 2.4, 10);
    if (dl) { dl.position.set(CX, 3.2, CZ + 0.5); this.scene.add(dl); }
    this._quinta = { dod, dl };

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

    this._obelisk(25.5, -3.4, 1.1, 3.0);
    this._obelisk(25.5,  3.4, 1.1, 3.0);
  }

  // ── Fountain of Venus (f.80) — the climax grove ───────────────────────────

  _buildFountain() {
    const S = this.style;
    const FX = 0, FZ = -20;
    const waterMat = S.waterMat();
    // Rippled water: without a map, the spinning discs would read as still.
    if (S.key !== 'woodcut') {
      waterMat.color.set(0xffffff);          // the map carries the blue
      waterMat.map = this._waterTexture();
    }

    this._m(new THREE.CylinderGeometry(3.6, 3.9, 0.5, 8), this._stoneMat, FX, 0.25, FZ, { cast: false, outline: true });
    this._m(new THREE.CylinderGeometry(3.15, 3.3, 0.95, 28, 1, true), this._stoneMat, FX, 0.95, FZ);
    this._m(new THREE.TorusGeometry(3.15, 0.14, 10, 36), this._stoneMat, FX, 1.42, FZ, { rx: Math.PI / 2, outline: true });
    this._waters.push({ m: this._m(new THREE.CircleGeometry(3.05, 36), waterMat, FX, 1.3, FZ, { rx: -Math.PI / 2, cast: false }), rate: 0.10 });
    this._circleCol(FX, FZ, 4.1);

    this._m(new THREE.CylinderGeometry(0.2, 0.26, 3.4, 12), this._stoneMat, FX, 2.2, FZ);
    const tiers = [{ r: 1.5, y: 2.6 }, { r: 0.85, y: 3.6 }];
    for (const t of tiers) {
      this._m(new THREE.CylinderGeometry(t.r, t.r * 0.55, 0.35, 24, 1, true), this._stoneMat, FX, t.y - 0.1, FZ);
      this._m(new THREE.TorusGeometry(t.r, 0.09, 8, 30), this._stoneMat, FX, t.y + 0.08, FZ, { rx: Math.PI / 2 });
      this._waters.push({ m: this._m(new THREE.CircleGeometry(t.r * 0.92, 28), waterMat, FX, t.y + 0.05, FZ, { rx: -Math.PI / 2, cast: false }), rate: -0.16 });
    }

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

    const wl = S.pointLight(0x80c0ff, 1.6, 8);
    if (wl) { wl.position.set(FX, 1.8, FZ); this.scene.add(wl); this._pulses.push({ pl: wl, base: 1.6, phase: 0 }); }
    const vl = S.pointLight(0xc8a44a, 1.1, 6);
    if (vl) { vl.position.set(FX, 4.6, FZ); this.scene.add(vl); this._pulses.push({ pl: vl, base: 1.1, phase: 1.7 }); }
  }

  // ── The Four Triumphs of Jupiter — floats ringing the grove ──────────────

  _buildTriumphs() {
    for (const t of TRIUMPHS) {
      const [x, z] = t.pos;
      const g = new THREE.Group();
      const chariot = this.cast.props.chariot(1.5, { color: t.color });
      g.add(chariot);

      // The team: six beasts, coupled two and two, each ridden by a nymph
      // musician in her rank's livery
      for (let i = 0; i < 6; i++) {
        const sx = (i % 2 ? 1 : -1) * 0.72;
        const row = Math.floor(i / 2);                 // 0 = nearest the car
        const z = -2.5 - row * 1.75;
        const beast = this._triumphBeast(t.team);
        beast.position.set(sx, 0, z);
        g.add(beast);
        const rider = this.cast.nymph({ robe: TRIUMPH_LIVERY[i], h: 0.62 });
        rider.position.set(sx, t.team === 'elephant' ? 1.15 : 0.82, z + 0.1);
        g.add(rider);
      }
      // Motif on the platform
      let motif;
      if (t.motif === 'bull') { motif = this.cast.animals.bull(1.0); motif.position.y = 0.9; const r = this.cast.nymph({ robe: 0xe8ddc0, h: 0.7 }); r.position.set(0, 1.45, 0.1); g.add(r); }
      else if (t.motif === 'swan') { motif = this.cast.animals.swan(1.8); motif.position.y = 0.9; }
      else if (t.motif === 'gold') {
        motif = this.cast.props.tower(0.8); motif.position.y = 0.9;
        for (let i = 0; i < 6; i++) {
          const d = this._m(new THREE.SphereGeometry(0.05, 8, 6),
            this.style.mat({ color: 0xffd24a, emissive: 0xa07010, emissiveIntensity: 0.8, metalness: 0.9, roughness: 0.2 }),
            (Math.sin(i * 2.4) * 0.4), 2.1 - (i % 3) * 0.35, (Math.cos(i * 1.7) * 0.4), { parent: g, cast: false });
          void d;
        }
      }
      else { motif = this.cast.props.fire(1.2); motif.position.y = 0.75; const f = this.cast.figure({ h: 0.7, robe: 0xc86a50 }); f.position.set(0, 0.9, 0.5); g.add(f); }
      g.add(motif);

      const lbl = this.cast.label(t.title, { sub: 'TRIUMPHUS' });
      lbl.position.set(0, 3.4, 0);
      g.add(lbl);

      g.position.set(x, 0, z);
      // face along the ring, counter-clockwise around the fountain
      g.rotation.y = Math.atan2(-(x - 0), -(z - -20)) + Math.PI / 2;
      this.scene.add(g);
      this._floats.push({ g, wheels: [], phase: Math.random() * 6 });
      this._wallCol(x - 1.3, x + 1.3, z - 1.6, z + 1.6);
    }
  }

  // A draught beast for a triumphal car. Centaurs and leopards aren't in the
  // Cast's bestiary, so both are composed from what is: a horse with a rider's
  // torso grown out of the withers, and a spotted tawny cat.
  _triumphBeast(kind) {
    const S = this.style;
    if (kind === 'elephant') {
      const g = this.cast.animals.horse(1.0);
      g.scale.set(1.25, 1.15, 1.3);
      const trunk = this._m(new THREE.CapsuleGeometry(0.05, 0.34, 4, 6),
        S.mat({ color: 0xe8e4d8, roughness: 0.8 }), 0, 0.62, -0.78, { parent: g });
      trunk.rotation.x = 0.5;
      return g;
    }
    if (kind === 'leopard') {
      const g = this.cast.animals.lion(0.9);
      g.traverse(o => { if (o.isMesh && o.material?.color) o.material = S.mat({ color: 0xd8a838, roughness: 0.75 }); });
      return g;
    }
    if (kind === 'centaur') {
      const g = this.cast.animals.horse(0.95);
      const torso = this.cast.figure({ h: 0.62, robe: null, pose: 'reach' });
      torso.position.set(0, 0.72, -0.5);
      // only the upper body rises from the withers
      torso.traverse(o => { if (o.isMesh && o.position.y < 0.55) o.visible = false; });
      g.add(torso);
      return g;
    }
    return this.cast.animals.horse(0.95);
  }

  // ── The shore, Cupid's boat, and distant Cythera ──────────────────────────

  _buildCythera() {
    const S = this.style;
    // The sea (its material breathes gently in update)
    const sea = this._m(new THREE.PlaneGeometry(130, 26), S.waterMat(), 0, 0.03, -50, { rx: -Math.PI / 2, cast: false });
    if (sea.material.transparent) this._sea = { mat: sea.material, base: sea.material.opacity };
    // Sand strip
    const sandMat = S.key === 'woodcut' ? S.mat({ tone: 0.02, rim: 0 }) : S.mat({ color: 0x9a8a64, roughness: 0.95 });
    this._m(new THREE.PlaneGeometry(130, 4.5), sandMat, 0, 0.016, -35.5, { rx: -Math.PI / 2, cast: false });

    // Pier out over the water
    for (let i = 0; i < 4; i++) {
      this._m(new THREE.BoxGeometry(2.2, 0.12, 1.6), this._trunkMat, 0, 0.22, -38.2 - i * 1.7);
      for (const s of [-1, 1]) this._m(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 6), this._trunkMat, s * 0.95, 0.05, -38.2 - i * 1.7);
    }
    // Sea rails: keep the walker on the pier
    this._wallCol(-30, -1.2, -37, -60);
    this._wallCol(1.2, 30, -37, -60);
    this._wallCol(-2, 2, -44.6, -60);

    // Cupid's boat, riding at the pier's end
    const boat = this.cast.props.boat(2.0);
    boat.position.set(0, 0.1, -46.5);
    this.scene.add(boat);
    this._boat = boat;
    const cupid = this.cast.figure({ h: 0.62, winged: true, pose: 'beckon' });
    cupid.position.set(0, 1.15, -45.6);
    boat.userData.cupid = cupid;
    this.scene.add(cupid);
    const cl = this.cast.label('Cupid', { sub: 'THE FERRYMAN' });
    cl.position.set(0, 1.5, 0);
    cupid.add(cl);
    this.npcs.cupid = cupid;

    // Distant Cythera: a mound crowned by the amphitheatre of Venus
    const isle = new THREE.Group();
    const im = S.key === 'woodcut' ? S.mat({ tone: 0.12, rim: 0 }) : S.mat({ color: 0x2a3a22, roughness: 0.95 });
    const mound = this._m(new THREE.ConeGeometry(9, 3.2, 24), im, 0, 1.2, 0, { parent: isle });
    mound.scale.y = 0.7;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      this._m(new THREE.CylinderGeometry(0.16, 0.2, 1.6, 8), this._stoneMat, Math.cos(a) * 3.4, 3.0, Math.sin(a) * 3.4, { parent: isle });
    }
    this._m(new THREE.TorusGeometry(3.4, 0.18, 8, 28), this._stoneMat, 0, 3.9, 0, { rx: Math.PI / 2, parent: isle });
    const gl = S.pointLight(0xffd060, 2.0, 20);
    if (gl) { gl.position.set(0, 4.5, 0); isle.add(gl); }
    isle.position.set(0, 0, -58);
    this.scene.add(isle);
  }

  // ── Garden fabric ─────────────────────────────────────────────────────────

  _buildTrees() {
    const put = (x, z, s = 1) => {
      this._m(new THREE.CylinderGeometry(0.12 * s, 0.16 * s, 0.8 * s, 6), this._trunkMat, x, 0.4 * s, z);
      this._m(new THREE.ConeGeometry(0.55 * s, 3.2 * s, 8), this._leafMat, x, 0.8 * s + 1.6 * s, z, { outline: true });
      this._circleCol(x, z, 0.5 * s);
    };

    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      if (Math.abs(a - Math.PI / 2) < 0.38) continue;
      if (Math.abs(a - Math.PI * 1.5) < 0.38) continue;   // open toward the shore too
      put(Math.cos(a) * 11.5, -20 + Math.sin(a) * 11.5, 1.1);
    }
    for (const z of [15.5, 24.5]) { put(-5.2, z); put(5.2, z); }
    for (const s of [-1, 1]) {
      put(s * 9, 5.4); put(s * 9, -5.4);
      put(s * 13.5, 5.8, 0.9); put(s * 13.5, -5.8, 0.9);
    }
    put(-29, 7, 1.2); put(-29, -7, 1.2);
    put(28, 8, 1.2); put(28, -8, 1.2);
    put(-27, 15, 1.0); put(27, 14.5, 1.0);

    for (const [x, z, w, d] of [[-8.5, 8.8, 6, 0.5], [8.5, 8.8, 6, 0.5], [-8.5, -8.8, 6, 0.5], [8.5, -8.8, 6, 0.5]]) {
      this._m(new THREE.BoxGeometry(w, 0.9, d), this._hedgeMat, x, 0.45, z);
      this._wallCol(x - w / 2, x + w / 2, z - d / 2, z + d / 2);
    }
  }

  // ── The meadow — instanced grass and flower drifts over the open sward ────
  // (Lit garden only; the woodcut page keeps its clean paper ground.)

  // Open-ground distance to the nearest paved/blocked feature, capped at 2 u.
  // 0 means "on the path" — the meadow fields use it to mask the processional
  // axis, the plazas, the court slabs, the wood duff, and the shore.
  _meadowClearance(x, z) {
    const rect = (x0, x1, z0, z1) => {
      const dx = Math.max(x0 - x, 0, x - x1);
      const dz = Math.max(z0 - z, 0, z - z1);
      return Math.hypot(dx, dz);
    };
    const circle = (cx, cz, r) => Math.max(0, Math.hypot(x - cx, z - cz) - r);
    let d = 2;
    d = Math.min(d,
      rect(-1.9, 1.9, -36, 51),          // main processional axis
      rect(-19.5, 19.5, -1.65, 1.65),    // cross path to the courts
      rect(-19.5, 19.5, 18.35, 21.65),   // cross path, upper
      circle(0, 0, 7.2),                 // Elephant plaza
      circle(0, -20, 8.8),               // fountain grove
      rect(-27.5, -12.5, 14, 26),        // court of Eleuterylida slab
      rect(13, 25, 14.5, 25.5),          // Polia's garden slab
      rect(-28.5, -12.5, -6, 6),         // Planetary Palace slab
      circle(21.5, 0, 6.2),              // Quinta Essentia round
      circle(25.5, -3.4, 1.5), circle(25.5, 3.4, 1.5),
      rect(-14.5, 14.5, 10.6, 13.4),     // Three Doors wall
      rect(-19, 19, 24.2, 27.8),         // Great Portal piers
      rect(-35.5, 35.5, 31.5, 55),       // dark-wood duff
      rect(-70, 70, -70, -33),           // sand strip and sea
    );
    for (const t of TRIUMPHS) d = Math.min(d, circle(t.pos[0], t.pos[1], 2.4));
    return d;
  }

  _buildMeadow() {
    const mobile = /Mobi|Android/i.test(navigator.userAgent);
    const clearance = (x, z) => this._meadowClearance(x, z);
    const sun = new THREE.Vector3(16, 22, 10).normalize();   // the lit style's key
    const common = { clearance, sunDirection: sun, fogColor: 0xd0be9e, fogDensity: 0.0072 };

    // The sward itself: clumped tufts, gold-green in the afternoon light
    const grass = createMeadowField({
      ...common,
      count: mobile ? 8000 : 22000,
      seed: 7331,
      blade: { height: 0.42, width: 0.05, segments: 3, planes: 3 },
      colors: { root: 0x2e4a1e, tip: 0x7a9c42, rootB: 0x3c5a22, tipB: 0xa8b050, back: 0xd8c860 },
      wind: { windStrength: 0.16, windSpeed: 1.15 },
    });

    // Wildflower drifts: cream-and-gold spikes gathered only where the clump
    // noise crests, so they read as scattered drifts, not a second crop
    const wildflowers = createMeadowField({
      ...common,
      count: mobile ? 400 : 1000,
      seed: 4211,
      accept: (x, z, clump) => clump > 0.72,
      blade: { height: 0.48, width: 0.04, segments: 3, planes: 2, flare: 1.4 },
      colors: { root: 0x3a5423, tip: 0xdcc98e, rootB: 0x3a5423, tipB: 0xd8a850, back: 0xe8d090 },
      wind: { windStrength: 0.2, windSpeed: 1.15 },
      scale: 0.85,
    });

    // Rose drifts fringing Polia's garden and the Queen's court
    const roseBand = (x, z) =>
      (x > 11 && x < 27.5 && z > 12 && z < 28) ||
      (x > -29.5 && x < -11 && z > 12 && z < 28);
    const roses = createMeadowField({
      ...common,
      count: mobile ? 600 : 1500,
      seed: 9042,
      accept: (x, z, clump) => roseBand(x, z) && clump > 0.3,
      blade: { height: 0.5, width: 0.05, segments: 3, planes: 2, flare: 1.3 },
      colors: { root: 0x2e4a1e, tip: 0xc84a5a, rootB: 0x35521f, tipB: 0xe07a8a, back: 0xe8a0a0 },
      wind: { windStrength: 0.18, windSpeed: 1.1 },
      scale: 0.9,
    });

    for (const f of [grass, wildflowers, roses]) {
      this.scene.add(f.mesh);
      this._meadows.push(f);
    }
  }

  // ── Interaction API (used by main.js and DreamMode) ───────────────────────

  teleport(key) {
    const st = HP_STATIONS.find(s => s.key === key);
    if (!st || this.walker.locked) return;
    const yaw = this.walker.yawToward(st.pos, st.look);
    this.walker.teleportTo(st.pos[0], st.pos[1], yaw, st.pitch ?? -0.04);
  }

  getSpawnState() {
    const p = this.walker.player;
    return { pos: [p.pos.x, p.pos.z], yaw: p.yaw, pitch: p.pitch };
  }

  update(dt) {
    this._t += dt;
    if (this.dream) this.dream.update(dt);
    this.walker.update(dt);
    this.walker.applyTo(this.camera);

    // Station proximity → HUD callback (throttled; quiet during the dream)
    this._stTimer += dt;
    if (this._stTimer > 0.25 && !this.dream) {
      this._stTimer = 0;
      const p = this.walker.player;
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
    // NPC idle sway + arm breathing (the poses live instead of freezing)
    for (const n of this._npcs) {
      n.g.rotation.y = n.baseY + Math.sin(this._t * 0.8 + n.phase) * n.sway;
      if (n.armL) {
        n.armL.rotation.z = n.aL + Math.sin(this._t * 0.9 + n.phase) * 0.05;
        n.armR.rotation.z = n.aR - Math.sin(this._t * 0.9 + n.phase + 0.9) * 0.05;
      }
    }
    // The meadow leans with the travelling gusts
    for (const f of this._meadows) f.update(this._t);
    // Fortuna turns on her pin: a slow drift with the gusts, never a clean spin
    for (const v of this._vanes) {
      v.g.rotation.y += dt * v.rate * (0.6 + 0.4 * Math.sin(this._t * 0.31 + v.phase));
    }
    // Water: the fountain discs turn, the sea breathes
    for (const w of this._waters) w.m.rotation.z += dt * w.rate;
    if (this._sea) this._sea.mat.opacity = this._sea.base + Math.sin(this._t * 0.5) * 0.05;
    // Pollen drifts down through the afternoon light and recycles
    if (this._motes) {
      const { pos, seeds, n, points } = this._motes;
      for (let i = 0; i < n; i++) {
        const ph = seeds[i * 2], fall = seeds[i * 2 + 1];
        pos[i * 3]     += Math.sin(this._t * 0.4 + ph) * dt * 0.12;
        pos[i * 3 + 1] -= fall * dt;
        pos[i * 3 + 2] += Math.cos(this._t * 0.3 + ph * 1.7) * dt * 0.12;
        if (pos[i * 3 + 1] < 0.15) pos[i * 3 + 1] = 5.8;
      }
      points.geometry.attributes.position.needsUpdate = true;
    }
    // The boat rides the swell; Cupid with it
    if (this._boat) {
      const bobY = Math.sin(this._t * 0.9) * 0.08;
      this._boat.position.y = 0.1 + bobY;
      this._boat.rotation.z = Math.sin(this._t * 0.7) * 0.03;
      const c = this._boat.userData.cupid;
      if (c) c.position.y = 1.15 + bobY;
    }
    // Triumph floats breathe in place
    for (const f of this._floats) {
      f.g.position.y = Math.sin(this._t * 0.9 + f.phase) * 0.02;
    }
    // Torch flames flicker
    if (this._torch) {
      const s = 1 + Math.sin(this._t * 7) * 0.12;
      this._torch.scale.set(s, 1 / s, s);
    }
  }

  dispose() {
    this.dream?.dispose?.();
    this.dream = null;
    this.walker.dispose();
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
