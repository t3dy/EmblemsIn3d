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
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ParticleStream } from '../systems/Particles.js?v=3';
import { Walker } from '../systems/Walker.js?v=4';
import { makeCast } from '../systems/Cast.js?v=32';
import { isVariant } from '../systems/AssetVariants.js?v=7';
import { createStyle, addSkyDome } from '../shaders/HPStyles.js?v=4';
import { getEnvMap } from '../systems/EnvMap.js?v=1';
import { createMeadowField } from '../systems/Meadow.js?v=1';

// pos/look are [x, z] on the ground plane; folio feeds the HUD and the research links.
// The first nine are reachable with digit keys 1–9 (journey order).
export const HP_STATIONS = [
  { key: 'wood',             name: 'The Dark Wood',          folio: 2,
    pos: [0, 45],     look: [0, 38],   radius: 9 },
  { key: 'portal',           name: 'The Great Portal',       folio: 13,
    pos: [0, 37],     look: [0, 26],   radius: 7, pitch: 0.2 },
  { key: 'court',            name: 'The Court of Queen Eleuterylida', folio: 62,
    pos: [-12.8, 23], look: [-23.5, 18.5], radius: 9 },
  { key: 'three_doors',      name: 'The Three Doors',        folio: 119,
    pos: [0, 21],     look: [0, 12],   radius: 6, pitch: 0.05 },
  { key: 'elephant',         name: 'The Elephant & Obelisk', folio: 25,
    pos: [0, 6.5],    look: [0, 0],    radius: 6 },
  { key: 'planetary_palace', name: 'The Planetary Palace',   folio: 88,
    pos: [-11.5, 0],  look: [-20, 0],  radius: 9 },
  { key: 'quinta_essentia',  name: 'Quinta Essentia',        folio: 164,
    pos: [13, 0],     look: [21, 0],   radius: 8 },
  { key: 'fountain',         name: 'Fountain of Venus',      folio: 80,
    pos: [0, -10.5],  look: [0, -20],  radius: 8, pitch: 0.16 },
  { key: 'cythera',          name: 'The Shore to Cythera',   folio: 193,
    pos: [0, -33],    look: [0, -46],  radius: 8 },
  // Discoverable, not on the digit row:
  { key: 'polia',            name: "Polia's Garden",         folio: 143,
    pos: [14.5, 23.5], look: [19, 19.5], radius: 7 },
  { key: 'triumphs',         name: 'The Four Triumphs',      folio: 158,
    pos: [5.5, -4.5], look: [10.6, -9.4], radius: 5 },
  { key: 'polyandrion',      name: 'The Polyandrion',        folio: 242,
    pos: [23, -22], look: [30, -27], radius: 9 },
  // The island itself — reached by Cupid's boat (digit 0), returned from by 9:
  { key: 'cythera_isle',     name: 'The Gardens of Cythera', folio: 290,
    pos: [0, -104], look: [0, -150], radius: 13 },
  { key: 'cythera_theatre',  name: 'The Theatre of Venus',   folio: 358,
    pos: [0, -133.5], look: [0, -150], radius: 11, pitch: 0.05 },
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
// The four cars, corrected against the plates themselves (hp.db.woodcut_catalog
// #47-48, #52-53, #57/#59, #64-65). Two were wrong:
//
//   · Danaë's car is drawn by UNICORNS, not horses (#57, "Third Triumph of
//     Danae: unicorns").
//   · The fourth is not a "Triumph of Semele" at all. It is the FESTIVAL OF
//     BACCHUS (#64-65), drawn by panthers, with Silenus riding his ass behind.
//     Semele is Bacchus's mother and appears in that car's RELIEFS (#58,
//     "Jupiter and Semele") — she does not get a triumph of her own. The car
//     was named for a panel on its side.
//
// PROCESSIONS.md calls the fourth "the mystical car" with six leopards, "spotted
// beasts of yealow shining colour"; panther and leopard are the same beast in
// period usage, so the team stands and only the title was wrong.
// The panels on each car's four faces, from the plates themselves
// (hp.db.woodcut_catalog #44-46, #49-51, #54-56, #58/#60-62) and, for Europa,
// from PROCESSIONS.md §2 which reads them in order. The last of Europa's is the
// one that matters: Mars before Jupiter, showing the wound in his impenetrable
// breastplate and holding the word NEMO — no one is exempt.
const TRIUMPH_RELIEFS = {
  europa: [
    { scene: 'The nymph crowning the bulls' },
    { scene: 'The ride over the sea' },
    { scene: 'Cupid shooting among the wounded nations' },
    { scene: 'Mars before Jupiter, showing the wound', word: 'NEMO' },
  ],
  leda: [
    { scene: 'Leda lying-in' },
    { scene: 'The eggs presented' },
    { scene: 'The king offering eggs at the Temple of Apollo' },
    { scene: 'The Judgment of Paris' },
  ],
  danae: [
    { scene: 'Acrisius, and the building of the tower' },
    { scene: 'Perseus with the mirror and the Medusa head' },
    { scene: 'Venus and Mars freed' },
    { scene: 'Jupiter comforts Cupid' },
  ],
  bacchus: [
    { scene: 'Jupiter and Semele' },
    { scene: 'Jupiter commits the infant Bacchus to Mercury' },
    { scene: 'Venus and Cupid before Jupiter' },
    { scene: 'Psyche with the lamp' },
  ],
  // The FOUR SEASONS (#67-70) sit immediately after Vertumnus and Pomona in the
  // plates, and they are that car's own iconography: Vertumnus is the god of the
  // turning year, Pomona of orchard fruit. The seasons belong on their car.
  vertumnus: [
    { scene: 'Spring — Venus and Cupid',      word: 'VER' },
    { scene: 'Summer — Ceres with the boy',   word: 'AESTAS' },
    { scene: 'Autumn — the Wine God with the ram', word: 'AVTVMNVS' },
    { scene: 'Winter — Jupiter Pluvius',      word: 'HIEMS' },
  ],
};

const TRIUMPHS = [
  { key: 'europa',  title: 'Triumph of Europa',    motif: 'bull',  team: 'centaur',  pos: [10.6, -9.4],   color: 0xc8a040 },
  { key: 'leda',    title: 'Triumph of Leda',      motif: 'swan',  team: 'elephant', pos: [-10.6, -9.4],  color: 0xb0c0d8 },
  { key: 'danae',   title: 'Triumph of Danaë',     motif: 'gold',  team: 'unicorn',  pos: [-10.6, -30.6], color: 0xe0c060 },
  { key: 'bacchus', title: 'Festival of Bacchus',  motif: 'fire',  team: 'leopard',  pos: [10.6, -30.6],  color: 0xd86a3a },
  // The fifth procession (#66, "Triumph of Vertumnus and Pomona: satyrs,
  // nymphs"). It did not exist in the world at all. The plate names no draught
  // beast — this is the rustic triumph, ACCOMPANIED by satyrs and nymphs on
  // foot rather than drawn by exotic teams — so it walks with its company.
  { key: 'vertumnus', title: 'Triumph of Vertumnus and Pomona', motif: 'fruit',
    team: 'satyr', onFoot: true, pos: [0, -34.2], color: 0x8aa04a },
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
      // Bounds now reach the island of Cythera (centre 0,-150, radius 50);
      // the open sea between shore and island is fenced by walls and a ring
      // of coast colliders, so the crossing is by boat (digit 0) only.
      bounds: { minX: -58, maxX: 58, minZ: -206, maxZ: 50 },
      onDigit: (n) => {
        if (n === 0) { this.teleport('cythera_isle'); return; }   // Cupid ferries the willing
        const st = HP_STATIONS[n - 1];
        if (st) this.teleport(st.key);
      },
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
    this._venuses = [];            // the goddess turns at each of her fountains
    this._venusSlots = [];         // where an imported marble Venus can replace the primitive one
    this._boat = null;
    this._floats = [];
    this._waters = [];             // spinning water discs
    this._sea = null;              // breathing sea material
    this._motes = null;            // drifting pollen in the lit garden
    this._meadows = [];            // instanced grass / flower fields (lit only)
    this._vanes = [];              // weathervanes that turn with the wind
    this._trashGeo = new Set();    // originals swallowed by the draw-call compiler
    this._npcs = [];               // { g, phase, sway }
    this._billboards = [];         // painted figure cards, turned to face the camera
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
    this._buildBridge();
    this._buildCourt();
    this._buildPoliaGarden();
    // The book's most copied image, and it was missing from the world: set
    // just north of Polia's garden, facing the dreamer who arrives from the
    // portal (woodcut_catalog #19; see _buildNymphFountain).
    this._buildNymphFountain(19, 27.5, 0);
    this._buildDoorsWall();
    this._buildElephant();
    this._buildPalace();
    this._buildQuinta();
    this._buildFountain();
    this._buildTriumphs();
    this._buildPolyandrion();
    this._buildCythera();
    // The island is ~700 objects of its own. It lives in one group so that
    // when the player is deep in the mainland garden — where the haze has
    // already nearly swallowed it — it stops being drawn at all. From the
    // shore southward it is always shown.
    this._isleGroup = new THREE.Group();
    this.scene.add(this._isleGroup);
    const _realScene = this.scene;
    this.scene = this._isleGroup;      // reroute every add inside the builder
    try { this._buildCytheraIsle(); } finally { this.scene = _realScene; }
    this._buildTrees();
    if (lit) this._buildMotes();
    if (lit) this._buildMeadow();

    const bloom = this.composer.passes.find(p => p.constructor?.name === 'UnrealBloomPass');
    if (bloom) bloom.strength = S.bloom;

    this._compileDrawCalls();

    // The goddess the whole world walks toward: a real marble Venus (a CC0 scan
    // of the antique Capitoline Venus, decimated to ~35k faces) stands in the
    // fountain in place of the primitive figure. Loaded after compilation so the
    // imported mesh is never swallowed by the draw-call merge; failure is silent,
    // and the primitive Venus simply stays.
    await this._loadVenusStatue();

    this.walker.attach();
    this.walker.applyTo(this.camera);
  }

  // The one imported model in the world, and now a real choice rather than an
  // unconditional load: `statue = primitive` keeps the built Venus, `scan` swaps
  // in the CC0 Capitoline scan. Because the register is painterly (DECISIONS.md,
  // 2026-09-05), the scan does NOT come in raw — a photoreal marble fights a
  // tempera garden. It gets the same treatment the painted assets get: a warm
  // limestone palette rather than cold white, roughness pushed right up so it
  // takes no specular, and a faint warm emissive so it sits in the panel's light
  // instead of looking lit from somewhere else.
  async _loadVenusStatue() {
    if (!this._venusSlots?.length) return;
    if (isVariant('statue', 'primitive', this.style.key)) return;   // keep the built one
    let gltf;
    try {
      const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
      gltf = await new GLTFLoader().loadAsync('../assets/models/venus.glb');
    } catch (e) {
      return;   // keep the primitive Venus if the model can't be loaded
    }
    let proto = null;
    gltf.scene.traverse(o => { if (o.isMesh && !proto) proto = o; });
    if (!proto) return;
    // the scan carries no usable vertex normals, so a lit material renders it
    // black — recompute them once on the shared geometry
    proto.geometry.computeVertexNormals();

    const woodcut = this.style.key === 'woodcut';
    const marble = woodcut
      ? this.style.mat({ tone: 0.03, side: THREE.DoubleSide })
      : this.style.mat({ color: 0xe8ddc6, roughness: 0.95, metalness: 0.0 });
    if (!woodcut) {
      // the stylisation pass: no specular, and a breath of warmth in the stone
      marble.emissive = new THREE.Color(0x2a2216);
      marble.emissiveIntensity = 0.35;
    }
    const H = 2.5;   // her height in world units (the model is normalised to 1)

    for (const slot of this._venusSlots) {
      const mesh = new THREE.Mesh(proto.geometry, marble);
      mesh.scale.setScalar(H);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const g = new THREE.Group();
      g.add(mesh);
      g.position.copy(slot.pos);
      (slot.parent || this.scene).add(g);
      this._venuses.push(g);                 // turns with the goddess's fountains
      if (slot.primitive) slot.primitive.visible = false;
    }
  }

  // ── The draw-call compiler ────────────────────────────────────────────────
  //
  // The cast pass pushed the scene toward three thousand meshes, and the worst
  // view (the wood spawn, looking down the whole axis) hit ~39 ms. The fix is
  // the one the graphics-skills pack prescribes (procedural-architecture:
  // "material-slot BufferGeometry compilation"): everything static that shares
  // a material becomes ONE mesh, with its transform baked in. Things that move
  // as a group — the triumph floats, the swaying NPCs — are compiled within
  // their own group, so a six-elephant team is a handful of draws that still
  // processes; an NPC keeps its animated arm pivots unmerged and sways on.

  _compileDrawCalls() {
    const dyn = new Set();
    const mark = (o) => { if (o && o.traverse) o.traverse(x => dyn.add(x)); };

    // per-frame animated meshes stay their own draws
    for (const w of this._waters) mark(w.m);
    for (const o of this._orbs) mark(o.orb);
    for (const v of this._venuses) mark(v);
    for (const v of this._vanes) mark(v.g);
    if (this._quinta) { mark(this._quinta.dod); mark(this._quinta.rays); }
    if (this._torch) mark(this._torch);
    if (this._boat) { mark(this._boat); mark(this._boat.userData.cupid); }
    if (this._hiero) { mark(this._hiero.ant); mark(this._hiero.ele); }

    // groups that move whole: compile inside, then fence off
    for (const b of this._billboards) mark(b);
    for (const n of this._npcs) {
      const local = new Set(dyn);
      if (n.armL) n.armL.traverse(x => local.add(x));   // arms keep breathing
      if (n.armR) n.armR.traverse(x => local.add(x));
      this._mergeInto(n.g, local);
      mark(n.g);
    }
    for (const f of this._floats) {
      if (!dyn.has(f.g)) this._mergeInto(f.g, dyn);
      mark(f.g);
    }

    this._mergeInto(this._isleGroup, dyn);
    mark(this._isleGroup);
    this._mergeInto(this.scene, dyn);
  }

  _mergeInto(root, exclude) {
    if (!root) return;
    root.updateWorldMatrix(true, true);
    const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
    const buckets = new Map();
    root.traverse(o => {
      if (o === root || !o.isMesh || o.isInstancedMesh || o.isSprite) return;
      if (exclude.has(o) || !o.visible) return;
      const m = o.material;
      // transparent things keep their own draw order; unique materials
      // (plaques, the crystal dome) fall below the bucket threshold anyway
      if (!m || Array.isArray(m) || m.transparent) return;
      const key = m.uuid + '|' + o.castShadow + '|' + o.receiveShadow;
      let b = buckets.get(key);
      if (!b) buckets.set(key, b = { mat: m, cast: o.castShadow, recv: o.receiveShadow, meshes: [] });
      b.meshes.push(o);
    });
    for (const b of buckets.values()) {
      if (b.meshes.length < 2) continue;
      const geos = [];
      const mtx = new THREE.Matrix4();
      for (const o of b.meshes) {
        const g2 = o.geometry.clone();
        mtx.multiplyMatrices(inv, o.matrixWorld);
        g2.applyMatrix4(mtx);           // bakes positions AND fixes normals
        geos.push(g2);
      }
      let merged = null;
      try { merged = mergeGeometries(geos, false); } catch (e) { /* mixed attributes — leave unmerged */ }
      if (!merged) { geos.forEach(g => g.dispose()); continue; }
      const mm = new THREE.Mesh(merged, b.mat);
      mm.castShadow = b.cast;
      mm.receiveShadow = b.recv;
      root.add(mm);
      for (const o of b.meshes) { o.removeFromParent(); this._trashGeo.add(o.geometry); }
      geos.forEach(g => g.dispose());
    }
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
    if (group.userData && group.userData.billboard) this._billboards.push(group);
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

  // Fit a line to the plaque instead of letting it run off the edge. A plaque's
  // physical size is authored by its caller, so the text yields, not the stone:
  // step the size down until it fits, with a floor so it never becomes unreadable.
  _fitFont(x, text, maxW, basePx, family = 'Georgia', minPx = 9) {
    let px = basePx;
    x.font = px + 'px ' + family;
    while (px > minPx && x.measureText(text).width > maxW) {
      px -= 1;
      x.font = px + 'px ' + family;
    }
    return px;
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
    // the inscriptions in this book are long — "DEDICATED TO THE SVN · LAT ·
    // GRAECE · ARABICE" — and at a fixed font on a fixed canvas they were being
    // clipped at both ends. Everything is measured against the inner width now.
    const innerW = c.width - 22;
    if (glyph) {
      x.fillStyle = accent;
      this._fitFont(x, glyph, innerW, 58, 'serif', 22);   x.fillText(glyph, cx, 58);
      x.fillStyle = P.text;
      this._fitFont(x, main, innerW, 24);                 x.fillText(main, cx, 94);
      x.fillStyle = P.sub;
      this._fitFont(x, sub || '', innerW, 15);            if (sub) x.fillText(sub, cx, 117);
    } else {
      x.fillStyle = accent;
      this._fitFont(x, main, innerW, 30);                 x.fillText(main, cx, 44);
      x.fillStyle = P.sub;
      this._fitFont(x, sub || '', innerW, 14);            if (sub) x.fillText(sub, cx, 72);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
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
    let sun = null, amb = null, hemi = null;
    this.scene.traverse(o => {
      if (o.isAmbientLight) { o.intensity = 0.85; o.color.set(0x4a4632); amb = o; }
      else if (o.isHemisphereLight) { o.intensity = 1.15; hemi = o; }
      else if (o.isDirectionalLight && o.castShadow) { o.intensity = 2.6; sun = o; }
    });
    if (this.scene.environment) this.scene.environmentIntensity = 0.42;
    // Capture the neutral palette so the dream-mood tint can lerp from it and
    // back. (Lit garden only; the woodcut keeps its paper.)
    const bloom = this.composer.passes.find(p => p.constructor?.name === 'UnrealBloomPass');
    this._moodLights = { sun, amb, hemi, bloom };
    this._moodBase = {
      bg: this.scene.background.clone(),
      fog: this.scene.fog.color.clone(),
      sunColor: sun ? sun.color.clone() : null, sunI: sun ? sun.intensity : 0,
      ambI: amb ? amb.intensity : 0, hemiI: hemi ? hemi.intensity : 0,
      bloom: bloom ? bloom.strength : 0,
    };
    this._mood = null;   // { bg, fog, sunColor, sunMul, ambMul, hemiMul, bloomMul, t }
  }

  // The game's reaction-choices tint "the now" — the scene answers the mood the
  // player meets a wonder in (DESIGN.md). Lit garden only; null returns to base.
  setDreamMood(mood) {
    if (!this._moodBase) return;                    // woodcut / not lit
    const P = {
      wonder:     { bg: 0xbcd2ea, fog: 0xf2ddac, sun: 0xfff0d0, sunMul: 1.12, ambMul: 1.1,  hemiMul: 1.1,  bloomMul: 1.15 },
      eros:       { bg: 0xd8b2c2, fog: 0xecc4b4, sun: 0xffd8d0, sunMul: 1.02, ambMul: 1.05, hemiMul: 1.0,  bloomMul: 1.3 },
      melancholy: { bg: 0x6a80a8, fog: 0x8f96ac, sun: 0xbcc6e0, sunMul: 0.72, ambMul: 0.9,  hemiMul: 0.85, bloomMul: 0.8 },
      dread:      { bg: 0x484a5a, fog: 0x53535e, sun: 0x9aa2c0, sunMul: 0.5,  ambMul: 0.75, hemiMul: 0.7,  bloomMul: 1.35 },
    };
    const b = this._moodBase;
    if (!mood || !P[mood]) {
      this._mood = { bg: b.bg.clone(), fog: b.fog.clone(), sunColor: b.sunColor?.clone(),
                     sunI: b.sunI, ambI: b.ambI, hemiI: b.hemiI, bloom: b.bloom, t: 0 };
      return;
    }
    const m = P[mood];
    this._mood = {
      bg: new THREE.Color(m.bg), fog: new THREE.Color(m.fog),
      sunColor: new THREE.Color(m.sun),
      sunI: b.sunI * m.sunMul, ambI: b.ambI * m.ambMul, hemiI: b.hemiI * m.hemiMul,
      bloom: b.bloom * m.bloomMul, t: 0,
    };
  }

  _updateMood(dt) {
    const m = this._mood, L = this._moodLights;
    if (!m || !L) return;
    m.t = Math.min(1, m.t + dt / 1.4);              // ~1.4 s ease
    const k = m.t * m.t * (3 - 2 * m.t);
    this.scene.background.lerp(m.bg, k * 0.14 + 0.02);
    this.scene.fog.color.lerp(m.fog, k * 0.14 + 0.02);
    const ease = (cur, tgt) => cur + (tgt - cur) * (k * 0.14 + 0.02);
    if (L.sun)  { L.sun.intensity = ease(L.sun.intensity, m.sunI); if (m.sunColor) L.sun.color.lerp(m.sunColor, k * 0.14 + 0.02); }
    if (L.amb)  L.amb.intensity = ease(L.amb.intensity, m.ambI);
    if (L.hemi) L.hemi.intensity = ease(L.hemi.intensity, m.hemiI);
    if (L.bloom) L.bloom.strength = ease(L.bloom.strength, m.bloom);
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
  // Water has two variants (Graphics menu). `primitive` is the founding look —
  // a flat coloured disc, still. `painterly` is the tempera register Ted asked
  // for: the ripple rings are painted into the albedo, a second caustic sheet
  // drifts over the top the way light does on a shallow basin, and both turn
  // slowly. Woodcut mode keeps its flat ink either way.
  _waterMat() {
    const S = this.style;
    const m = S.waterMat();
    if (S.key === 'woodcut' || isVariant('water', 'primitive', S.key)) return m;
    m.color.set(0xffffff);            // the map carries the blue
    m.map = this._waterTexture();
    // Water is not a matte surface: it holds light even in shade. Without
    // this, any basin under a dome or an arcade reads as wet asphalt.
    m.emissive = new THREE.Color(0x2a4460);
    m.emissiveIntensity = 0.55;
    m.roughness = 0.22;
    return m;
  }

  _waterIsPainterly() {
    return this.style.key !== 'woodcut' && !isVariant('water', 'primitive', this.style.key);
  }

  // A caustic sheet: pale interlocking loops on black, added over the water so
  // the surface has a moving glint rather than a uniform sheen.
  _causticTexture() {
    if (this._caustic) return this._caustic;
    const N = 256;
    const c = document.createElement('canvas');
    c.width = c.height = N;
    const x = c.getContext('2d');
    const rnd = (i, k) => { const v = Math.sin(i * 57.3 + k * 191.7) * 43758.5453; return v - Math.floor(v); };
    x.fillStyle = '#000000'; x.fillRect(0, 0, N, N);
    x.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 34; i++) {
      const cx = rnd(i, 1) * N, cy = rnd(i, 2) * N;
      const r  = 10 + rnd(i, 3) * 34;
      x.lineWidth = 1.5 + rnd(i, 4) * 2.6;
      x.strokeStyle = `rgba(190,225,255,${(0.10 + rnd(i, 5) * 0.16).toFixed(3)})`;
      for (const [ox, oy] of [[0, 0], [N, 0], [-N, 0], [0, N], [0, -N]]) {
        x.beginPath();
        x.ellipse(cx + ox, cy + oy, r, r * (0.5 + rnd(i, 6) * 0.6), rnd(i, 7) * 3.14, 0, 6.3);
        x.stroke();
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 2);
    t.colorSpace = THREE.SRGBColorSpace;
    this._disp.push(t);
    this._caustic = t;
    return t;
  }

  // Lay a caustic sheet just above a body of water, and register it to drift.
  _caustics(x, y, z, radius, rate = 0.05) {
    if (!this._waterIsPainterly()) return;
    const mat = new THREE.MeshBasicMaterial({
      map: this._causticTexture(), transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this._disp.push(mat);
    const m = this._m(new THREE.CircleGeometry(radius, 28), mat, x, y + 0.012, z,
      { rx: -Math.PI / 2, cast: false, receive: false });
    this._waters.push({ m, rate: -rate });      // counter-turning, so it shimmers
  }

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
      const t = this.cast.props.tree(kind, s * 1.3, i + 1);
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

  // ── Carved ornament ──────────────────────────────────────────────────────
  // Two variants (Graphics menu). `primitive` leaves the masonry plain with its
  // lettering plaques. `carved` bands the architecture with relief the book and
  // its scholarship actually put there: a Greek meander and an egg-and-dart
  // along the friezes (Lefaivre on the architectural body; the orders are the
  // book's constant subject), and Egyptianising hieroglyph panels on the piers,
  // which Curran reads as the heart of the HP's Egyptian revival — the signs
  // are carried as a band of figures to be read, not as decoration.
  //
  // Painted into the albedo AND used as a bump map, so the relief reads in the
  // tempera register without needing real geometry for every moulding.
  _ornamentCarved() {
    return this.style.key !== 'woodcut' && !isVariant('ornament', 'primitive', this.style.key);
  }

  _carvedTexture(kind, reps = 8) {
    this._carved = this._carved || {};
    const key = kind + reps;
    if (this._carved[key]) return this._carved[key];
    const W = 512, H = 128;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');
    x.fillStyle = '#b8ad98'; x.fillRect(0, 0, W, H);          // the stone ground
    const cell = W / reps;
    const ink = '#6d6252', lit = '#e6dcc6';

    const carve = (draw) => {                                  // relief = dark then light offset
      x.save(); x.translate(0, 1.6); x.strokeStyle = ink; x.fillStyle = ink; draw(); x.restore();
      x.save(); x.translate(0, -1.2); x.strokeStyle = lit; x.fillStyle = lit; draw(); x.restore();
    };

    if (kind === 'meander') {
      x.lineWidth = 7; x.lineCap = 'square';
      carve(() => {
        for (let i = 0; i < reps; i++) {
          const o = i * cell, m = cell * 0.16;
          x.beginPath();
          x.moveTo(o + m, H * 0.78);
          x.lineTo(o + m, H * 0.26); x.lineTo(o + cell - m, H * 0.26);
          x.lineTo(o + cell - m, H * 0.6); x.lineTo(o + cell * 0.5, H * 0.6);
          x.lineTo(o + cell * 0.5, H * 0.44);
          x.stroke();
        }
      });
    } else if (kind === 'eggdart') {
      carve(() => {
        for (let i = 0; i < reps; i++) {
          const o = i * cell + cell / 2;
          x.beginPath(); x.ellipse(o, H * 0.5, cell * 0.24, H * 0.3, 0, 0, 6.3); x.fill();
          x.beginPath();                                       // the dart between eggs
          x.moveTo(o + cell * 0.5, H * 0.16);
          x.lineTo(o + cell * 0.56, H * 0.5);
          x.lineTo(o + cell * 0.5, H * 0.84);
          x.lineTo(o + cell * 0.44, H * 0.5);
          x.closePath(); x.fill();
        }
      });
    } else {                                                   // hieroglyph band
      carve(() => {
        const rnd = (i, k) => { const v = Math.sin(i * 71.3 + k * 137.9) * 43758.5453; return v - Math.floor(v); };
        for (let i = 0; i < reps; i++) {
          const o = i * cell + cell / 2, cy = H * 0.5, r = Math.min(cell, H) * 0.24;
          const sign = Math.floor(rnd(i, 1) * 6);
          x.lineWidth = 5;
          if (sign === 0) {                                    // the sun disc
            x.beginPath(); x.arc(o, cy, r, 0, 6.3); x.stroke();
            x.beginPath(); x.arc(o, cy, r * 0.28, 0, 6.3); x.fill();
          } else if (sign === 1) {                             // the eye
            x.beginPath(); x.ellipse(o, cy, r * 1.2, r * 0.6, 0, 0, 6.3); x.stroke();
            x.beginPath(); x.arc(o, cy, r * 0.3, 0, 6.3); x.fill();
          } else if (sign === 2) {                             // the vessel
            x.beginPath();
            x.moveTo(o - r * 0.7, cy - r); x.lineTo(o + r * 0.7, cy - r);
            x.lineTo(o + r * 0.45, cy + r); x.lineTo(o - r * 0.45, cy + r);
            x.closePath(); x.stroke();
          } else if (sign === 3) {                             // the anchor
            x.beginPath(); x.moveTo(o, cy - r); x.lineTo(o, cy + r * 0.7); x.stroke();
            x.beginPath(); x.arc(o, cy + r * 0.5, r * 0.7, 0.2, Math.PI - 0.2); x.stroke();
          } else if (sign === 4) {                             // the ear of corn
            x.beginPath(); x.moveTo(o, cy + r); x.lineTo(o, cy - r); x.stroke();
            for (let k = 0; k < 3; k++) {
              const yy = cy - r + k * r * 0.6;
              x.beginPath(); x.moveTo(o, yy); x.lineTo(o + r * 0.6, yy - r * 0.25); x.stroke();
              x.beginPath(); x.moveTo(o, yy); x.lineTo(o - r * 0.6, yy - r * 0.25); x.stroke();
            }
          } else {                                             // the ant, for the elephant-and-ant
            x.beginPath(); x.arc(o - r * 0.5, cy, r * 0.3, 0, 6.3); x.fill();
            x.beginPath(); x.arc(o + r * 0.1, cy, r * 0.38, 0, 6.3); x.fill();
            x.beginPath(); x.arc(o + r * 0.8, cy, r * 0.26, 0, 6.3); x.fill();
          }
        }
      });
    }

    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    this._disp.push(t);
    this._carved[key] = t;
    return t;
  }

  // A carved band laid just proud of a wall face.
  _frieze(x, y, z, w, h, kind, { reps = null, ry = 0, rx = 0 } = {}) {
    if (!this._ornamentCarved()) return null;
    const n = reps || Math.max(3, Math.round(w * 1.6));
    const tex = this._carvedTexture(kind, n);
    const mat = this.style.mat({ color: 0xffffff, roughness: 0.86, metalness: 0.02 });
    mat.map = tex;
    mat.bumpMap = tex;
    mat.bumpScale = 0.05;
    this._disp.push(mat);
    return this._m(new THREE.PlaneGeometry(w, h), mat, x, y, z, { rx, ry, cast: false, receive: true });
  }

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
    // The lintel carries the Greek meander, with an egg-and-dart astragal
    // beneath it, when the carved-ornament variant is chosen.
    this._frieze(0, 7.35, Z + 1.22, 17.6, 0.72, 'meander');
    this._frieze(0, 6.72, Z + 1.22, 17.6, 0.34, 'eggdart');
    // Curran's hieroglyph bands, read down the flanking piers
    for (const sgn of [-1, 1]) {
      this._frieze(sgn * 5.4, 3.9, Z + 1.14, 3.0, 0.66, 'hieroglyph', { reps: 5 });
      this._frieze(sgn * 5.4, 2.0, Z + 1.14, 3.0, 0.66, 'hieroglyph', { reps: 5 });
    }
    // The portal's own brass table, which the book says is lettered in Latin,
    // Greek and Arabic and dedicates the work to the Sun. (FESTINA LENTE used to
    // hang here and does not belong: Curran shows the anchor-and-dolphin
    // hieroglyph is on the BRIDGE into Eleuterylida's realm — see
    // ARCHITECTURE.md §4 and _buildBridge below.)
    this._plaque({ main: 'SOLI DICATVM', sub: 'DEDICATED TO THE SVN · LAT · GRAECE · ARABICE' }, 4.6, 1.1, 0, 6.4, Z + 1.25, 0, true);

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
    const S = this.style;
    const CX = -19, CZ = 20;
    const woodcut = S.key === 'woodcut';
    const gold = woodcut ? S.mat({ tone: 0.02 })
                         : S.mat({ color: 0xc9a244, metalness: 0.9, roughness: 0.26 });

    // The court is Eleuterylida's palace, "of gold and gems" — it was an open
    // slab. It now has a floor of banded courses, a peristyle of Corinthian
    // columns round three sides, and a screen wall behind the throne, so the
    // Queen holds court inside a building rather than on a paving stone.
    this._m(new THREE.BoxGeometry(15.4, 0.22, 12.4), this._darkStoneMat, CX - 1, 0.11, CZ, { cast: false });
    this._m(new THREE.BoxGeometry(14.6, 0.14, 11.6), this._stoneMat, CX - 1, 0.29, CZ, { cast: false, outline: true });
    for (let i = 0; i < 5; i++) {                               // banded paving
      this._m(new THREE.BoxGeometry(14.2, 0.02, 0.22), gold, CX - 1, 0.37, CZ - 4.4 + i * 2.2, { cast: false, receive: false });
    }

    // peristyle: columns down the two long sides and across the open east end
    const PH = 3.6, py = 0.36;
    const post = (x, z) => {
      const gc = new THREE.Group(); gc.position.y = py; this.scene.add(gc);
      this._column(x, z, PH, { order: 'corinthian', r: 0.2, parent: gc });
    };
    for (let i = 0; i < 6; i++) {
      const x = CX - 6.4 + i * 2.3;
      post(x, CZ - 5.2); post(x, CZ + 5.2);
    }
    for (const z of [CZ - 2.9, CZ, CZ + 2.9]) post(CX + 6.5, z);
    for (const z of [CZ - 5.2, CZ + 5.2]) this._entablature(CX - 1, py + PH, z, 13.6, 0.8);
    this._entablature(CX + 6.5, py + PH, CZ, 11.2, 0.8, { ry: Math.PI / 2 });

    // the screen wall behind the throne, with pilasters and a doorway
    const WX = CX - 7.4, WH = 4.6;
    this._m(new THREE.BoxGeometry(0.55, WH, 11.4), this._stoneMat, WX, py + WH / 2, CZ, { outline: true });
    this._wallCol(WX - 0.28, WX + 0.28, CZ - 5.7, CZ + 5.7);
    for (let i = 0; i < 5; i++) {
      const z = CZ - 4.4 + i * 2.2;
      this._m(new THREE.BoxGeometry(0.2, WH - 0.5, 0.42), this._darkStoneMat, WX + 0.34, py + (WH - 0.5) / 2, z, { cast: false });
    }
    this._doorway(WX + 0.3, py, CZ, 1.8, 2.9, { ry: Math.PI / 2 });
    this._entablature(WX, py + WH - 0.2, CZ, 11.6, 0.7, { ry: Math.PI / 2 });

    // ── the throne ──
    // a stepped dais, a seat with arms and a high back, and a baldachin over it
    const TX = CX - 5.0;
    for (let i = 0; i < 3; i++) {
      this._m(new THREE.CylinderGeometry(2.1 - i * 0.32, 2.25 - i * 0.32, 0.17, 20), this._stoneMat,
        TX, py + 0.085 + i * 0.17, CZ, { cast: false });
    }
    const seatY = py + 0.51;
    this._m(new THREE.BoxGeometry(1.15, 0.5, 1.05), this._stoneMat, TX - 0.15, seatY + 0.25, CZ, { outline: true });
    this._m(new THREE.BoxGeometry(1.2, 0.12, 1.1), gold, TX - 0.15, seatY + 0.55, CZ, { cast: false });
    this._m(new THREE.BoxGeometry(0.24, 2.0, 1.05), this._stoneMat, TX - 0.62, seatY + 1.1, CZ, { outline: true });
    for (const sz of [-1, 1]) {                                  // arms, and their finials
      this._m(new THREE.BoxGeometry(0.9, 0.16, 0.16), gold, TX - 0.2, seatY + 0.78, CZ + sz * 0.5, { cast: false });
      this._m(new THREE.SphereGeometry(0.12, 10, 8), gold, TX + 0.28, seatY + 0.86, CZ + sz * 0.5);
      this._m(new THREE.CylinderGeometry(0.07, 0.09, 0.5, 8), this._stoneMat, TX + 0.28, seatY + 0.55, CZ + sz * 0.5);
    }
    // the baldachin: four slender posts and a canopy over the throne
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      this._m(new THREE.CylinderGeometry(0.07, 0.09, 3.1, 10), gold,
        TX + sx * 1.15, py + 1.55, CZ + sz * 1.15);
    }
    this._m(new THREE.BoxGeometry(2.9, 0.16, 2.9), this._darkStoneMat, TX, py + 3.18, CZ, { cast: false });
    const cano = this._m(new THREE.ConeGeometry(2.15, 0.9, 4), gold, TX, py + 3.7, CZ, { cast: false });
    cano.rotation.y = Math.PI / 4;
    this._m(new THREE.SphereGeometry(0.14, 12, 9), gold, TX, py + 4.24, CZ);
    this._circleCol(TX, CZ, 1.9);
    const queen = this.cast.nymph({ name: 'Eleuterylida', h: 1.0, robe: 0xc8a030, pose: 'offer', crowned: true });
    this._npc('queen', queen, CX - 4.35, CZ, Math.PI / 2, { label: 'Eleuterylida', sub: 'QUEEN · FREE WILL', labelY: 2.1, sway: 0.02 });
    queen.position.y = 0.36 + 0.51 + 0.55;   // seated on the throne's cushion

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
      g.position.y = 0.36;                       // on the court floor, not the earth
      this._circleCol(x, z, 0.4);
    });

    // The bath of the nymphs — the eight-sided bath-house of the book
    this._buildBath(CX + 3.5, CZ + 2.8);

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

  // ── The Bridge into Eleuterylida's realm ─────────────────────────────────
  //
  // The book carries its most famous device here, not on the great portal: a
  // circle, an anchor, and a dolphin twined about it, glossed in Greek as
  // ΑΕΙ ΣΠΕΥΔΕ ΒΡΑΔΕΩΣ — always hasten slowly. Curran traces the anchor and
  // dolphin to a coin of Titus and Suetonius' report of a motto of Augustus,
  // and notes that in 1502 Aldus Manutius took it for the mark of his own
  // press. So the book printed in 1499 contains the emblem its printer would
  // adopt three years later, and a visitor who reads it here is looking at the
  // Aldine dolphin before it was Aldine. (ARCHITECTURE.md §4.)
  _buildBridge() {
    const S = this.style;
    const BX = -11, BZ = 20;
    const woodcut = S.key === 'woodcut';

    // a watercourse crossing the processional cross-path
    const streamMat = this._waterMat();
    this._waters.push({
      m: this._m(new THREE.PlaneGeometry(3.0, 15), streamMat, BX, 0.06, BZ, { rx: -Math.PI / 2, cast: false }),
      rate: 0.04,
    });
    this._m(new THREE.BoxGeometry(3.4, 0.5, 15.4), this._darkStoneMat, BX, -0.2, BZ, { cast: false });

    // the deck and its two parapets
    this._m(new THREE.BoxGeometry(4.6, 0.26, 3.6), this._stoneMat, BX, 0.34, BZ, { cast: false, outline: true });
    for (const s of [-1, 1]) {
      this._m(new THREE.BoxGeometry(4.6, 0.62, 0.26), this._stoneMat, BX, 0.75, BZ + s * 1.7, { outline: true });
      this._wallCol(BX - 2.3, BX + 2.3, BZ + s * 1.7 - 0.13, BZ + s * 1.7 + 0.13);
      // The three signs are carved on the INNER face of each parapet, so that a
      // walker crossing the bridge reads them as Poliphilo does — in passing,
      // at arm's length. On the outer faces they would face the water.
      const gz = BZ + s * 1.54;
      const glyph = woodcut ? S.mat({ tone: 0.24 }) : S.mat({ color: 0x5a4c34, roughness: 0.85 });
      const ring = this._m(new THREE.TorusGeometry(0.16, 0.032, 8, 20), glyph, BX - 1.45, 0.78, gz);
      ring.rotation.y = Math.PI / 2;
      // the anchor: shank, stock, and its curved arms
      this._m(new THREE.BoxGeometry(0.045, 0.4, 0.045), glyph, BX, 0.8, gz);
      this._m(new THREE.BoxGeometry(0.28, 0.045, 0.045), glyph, BX, 0.96, gz);
      const arms = this._m(new THREE.TorusGeometry(0.13, 0.03, 6, 14, Math.PI), glyph, BX, 0.63, gz);
      arms.rotation.z = Math.PI;
      // the dolphin twined about it
      const dolph = new THREE.CatmullRomCurve3([
        new THREE.Vector3(BX + 1.18, 0.60, gz),
        new THREE.Vector3(BX + 1.62, 0.72, gz),
        new THREE.Vector3(BX + 1.52, 1.00, gz),
        new THREE.Vector3(BX + 1.16, 0.90, gz),
        new THREE.Vector3(BX + 1.30, 0.68, gz),
      ]);
      this._m(new THREE.TubeGeometry(dolph, 20, 0.042, 6), glyph, 0, 0, 0);
      // read from the deck, one parapet giving the motto and the other its afterlife
      if (s > 0) {
        this._plaque({ main: 'ΑΕΙ ΣΠΕΥΔΕ ΒΡΑΔΕΩΣ', sub: 'SEMPER FESTINA TARDE · ALWAYS HASTEN SLOWLY' },
          1.62, 0.3, BX, 1.26, BZ + 1.5, Math.PI, true);
      } else {
        this._plaque({ main: 'ALDVS TOOK THIS FOR HIS PRESS, 1502', sub: 'THE ALDINE DOLPHIN BEFORE IT WAS ALDINE' },
          1.62, 0.3, BX, 1.26, BZ - 1.5, 0, true);
      }
    }
  }

  // ── The eight-sided bath-house ────────────────────────────────────────────
  //
  // Built from the book's own description (HP_SOURCEBOOK.md §3): "a marueilous
  // buildyng of a bathe eight square," paired pilasters at every outer corner,
  // a frieze of children with green boughs, ring-seats descending into the
  // water, an eight-square spire glazed with crystal quarrels — and on its
  // point the trumpet-boy weathervane whose hollow head sounds in the wind.
  // Over the entrance, in Greek: ΑΣΑΜΙΝΘΟΣ — "bath."
  _buildBath(BX, BZ) {
    const S = this.style;
    const woodcut = S.key === 'woodcut';
    const gold = woodcut ? S.mat({ tone: 0.02 }) : S.mat({ color: 0xd9b25a, metalness: 0.9, roughness: 0.25 });

    // octagonal basin wall, rim, and the ring-seats stepping down inside
    this._m(new THREE.CylinderGeometry(2.2, 2.3, 0.85, 8, 1, true), this._stoneMat, BX, 0.42, BZ);
    this._m(new THREE.TorusGeometry(2.2, 0.09, 8, 8), gold, BX, 0.88, BZ, { rx: Math.PI / 2 });
    for (let i = 0; i < 3; i++) {
      this._m(new THREE.CylinderGeometry(1.9 - i * 0.35, 2.0 - i * 0.35, 0.16, 8), this._darkStoneMat,
        BX, 0.66 - i * 0.2, BZ, { cast: false });
    }
    const bathWater = this._waterMat();
    this._waters.push({
      m: this._m(new THREE.CircleGeometry(1.85, 8), bathWater, BX, 0.62, BZ, { rx: -Math.PI / 2, cast: false }),
      rate: 0.08,
    });
    this._caustics(BX, 0.62, BZ, 1.8, 0.06);

    // paired pilasters at each corner, carrying the frieze
    for (let i = 0; i < 8; i++) {
      const a = (i + 0.5) * Math.PI / 4;
      const px = BX + Math.cos(a) * 2.35, pz = BZ + Math.sin(a) * 2.35;
      for (const s of [-0.12, 0.12]) {
        const off = a + Math.PI / 2;
        this._m(new THREE.BoxGeometry(0.16, 2.1, 0.16), this._stoneMat,
          px + Math.cos(off) * s, 1.05, pz + Math.sin(off) * s, { ry: -a });
      }
    }
    // the frieze of children with their green boughs, then the cornice
    const friezeM = woodcut ? S.mat({ tone: 0.06 }) : S.mat({ color: 0xcbbb98, roughness: 0.8 });
    this._m(new THREE.CylinderGeometry(2.42, 2.42, 0.3, 8, 1, true), friezeM, BX, 2.25, BZ, { cast: false });
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      this._m(new THREE.SphereGeometry(0.07, 6, 5), woodcut ? S.mat({ tone: 0.0 }) : S.mat({ color: 0xdcc8a8, roughness: 0.7 }),
        BX + Math.cos(a) * 2.44, 2.25, BZ + Math.sin(a) * 2.44, { cast: false });
      this._m(new THREE.SphereGeometry(0.05, 5, 4), this._leafMat,
        BX + Math.cos(a) * 2.46, 2.36, BZ + Math.sin(a) * 2.46, { cast: false });
    }
    this._m(new THREE.CylinderGeometry(2.55, 2.5, 0.14, 8), this._stoneMat, BX, 2.46, BZ);

    // the eight-square spire, glazed with crystal quarrels between gold ribs
    const quarrels = woodcut
      ? S.mat({ tone: -0.1, rim: 0.5 })
      : S.mat({ color: 0xd4e8f2, roughness: 0.06, metalness: 0.1, transparent: true, opacity: 0.28 });
    this._m(new THREE.ConeGeometry(2.35, 1.9, 8, 1, true), quarrels, BX, 3.45, BZ, { cast: false, receive: false });
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      const rib = this._m(new THREE.CylinderGeometry(0.03, 0.045, 2.05, 5), gold,
        BX + Math.cos(a) * 1.12, 3.42, BZ + Math.sin(a) * 1.12);
      rib.rotation.z = -Math.cos(a) * 0.75;
      rib.rotation.x = Math.sin(a) * 0.75;
    }

    // the trigon, the turning stalk, and the trumpet-boy who sounds in the wind
    this._m(new THREE.ConeGeometry(0.16, 0.3, 3), gold, BX, 4.5, BZ);
    const vane = new THREE.Group();
    const brass = woodcut ? S.mat({ tone: 0.04 }) : S.mat({ color: 0xc89a40, metalness: 0.9, roughness: 0.3 });
    this._m(new THREE.SphereGeometry(0.09, 8, 6), brass, 0, 0.1, 0, { parent: vane });
    const boy = this.cast.figure({ h: 0.34, robe: null, skin: 0xc89a40, pose: 'reach' });
    boy.position.y = 0.18;
    vane.add(boy);
    const trump = this._m(new THREE.ConeGeometry(0.035, 0.22, 6), brass, 0.05, 0.72, 0.12, { parent: vane });
    trump.rotation.x = -1.2;
    const flag = this._m(new THREE.PlaneGeometry(0.3, 0.14), brass, -0.2, 0.55, 0, { parent: vane, cast: false });
    flag.rotation.y = Math.PI / 2;
    vane.position.set(BX, 4.62, BZ);
    this.scene.add(vane);
    this._vanes.push({ g: vane, rate: 0.8, phase: 1.3 });

    // ΑΣΑΜΙΝΘΟΣ over the way in
    this._plaque({ main: 'ΑΣΑΜΙΝΘΟΣ', sub: 'THE BATH · EIGHT-SIDED, ROOFED WITH CRYSTAL' },
      1.5, 0.4, BX, 1.5, BZ + 2.55, 0, true);

    this._circleCol(BX, BZ, 2.6);
  }

  // ── Polia's Garden (the nymph with the torch) ─────────────────────────────

  // ── The Sleeping Nymph Fountain ──────────────────────────────────────────
  //
  // The book's most influential single image: `hp.db.dictionary_terms` calls it
  // "one of the book's most widely copied motifs", copied as real fountain
  // sculpture in Italian and French gardens through the sixteenth century, and
  // `woodcut_catalog` #19 lists it as "Sleeping nymph fountain with satyrs".
  // It was missing from the world entirely.
  //
  // Modelled part-for-part from the 1499 plate (images/woodcuts/bath.jpg —
  // the filenames in that folder are unreliable, the captions are not; see
  // SOURCES.md). The plate shows, and this builds:
  //   · an aedicula of two Corinthian columns on plinths, carrying an
  //     entablature and a triangular pediment;
  //   · a wreath roundel in the tympanum;
  //   · a tree behind, its foliage spreading across the opening;
  //   · a curtain hung from the tree and drawn aside;
  //   · the nymph asleep on drapery over a low plinth, one arm above her head;
  //   · a satyr at the right, holding the curtain back;
  //   · two putti at the centre;
  // and — the part that makes it a fountain rather than a tableau — the spring
  // issuing beneath her into a basin, which is what the Renaissance copies took.
  _buildNymphFountain(X, Z, rot = 0) {
    const S = this.style;
    const woodcut = S.key === 'woodcut';
    const g = new THREE.Group();
    g.position.set(X, 0, Z);
    g.rotation.y = rot;
    this.scene.add(g);

    const stone = this._stoneMat;
    const dark  = this._darkStoneMat;
    const W = 3.0, COL_H = 2.5, D = 1.5;

    // ── the aedicula ──
    // stylobate
    this._m(new THREE.BoxGeometry(W + 0.7, 0.24, D + 0.7), stone, 0, 0.12, 0, { parent: g, cast: false, outline: true });
    this._m(new THREE.BoxGeometry(W + 0.4, 0.14, D + 0.4), dark, 0, 0.31, 0, { parent: g, cast: false });

    for (const sx of [-1, 1]) {
      const cx = sx * W / 2;
      // plinth and base mouldings
      this._m(new THREE.BoxGeometry(0.5, 0.3, 0.5), stone, cx, 0.53, 0, { parent: g });
      this._m(new THREE.CylinderGeometry(0.21, 0.25, 0.12, 14), stone, cx, 0.74, 0, { parent: g });
      // fluted shaft with entasis
      const sh = this._m(new THREE.CylinderGeometry(0.145, 0.175, COL_H, 16), stone, cx, 0.8 + COL_H / 2, 0, { parent: g, outline: true });
      sh.scale.x = sh.scale.z = 1;
      // Corinthian capital: a bell of acanthus with a square abacus over it
      this._m(new THREE.CylinderGeometry(0.2, 0.15, 0.2, 12), stone, cx, 0.8 + COL_H + 0.1, 0, { parent: g });
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        const lf = this._m(new THREE.ConeGeometry(0.05, 0.17, 5), stone,
          cx + Math.cos(a) * 0.17, 0.8 + COL_H + 0.1, Math.sin(a) * 0.17, { parent: g, cast: false });
        lf.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
      }
      this._m(new THREE.BoxGeometry(0.42, 0.08, 0.42), stone, cx, 0.8 + COL_H + 0.24, 0, { parent: g });
    }

    // entablature: architrave, frieze, cornice
    const EY = 0.8 + COL_H + 0.28;
    this._m(new THREE.BoxGeometry(W + 0.6, 0.16, D * 0.55), stone, 0, EY + 0.08, 0, { parent: g });
    this._m(new THREE.BoxGeometry(W + 0.56, 0.2, D * 0.5), dark, 0, EY + 0.26, 0, { parent: g, cast: false });
    this._m(new THREE.BoxGeometry(W + 0.8, 0.14, D * 0.62), stone, 0, EY + 0.43, 0, { parent: g });

    // pediment: raking cornice as two tilted bars, with the tympanum behind
    const PY = EY + 0.5, span = (W + 0.8) / 2, rise = 0.62;
    const tym = this._m(new THREE.CylinderGeometry(span, span, 0.1, 3), dark, 0, PY + rise / 2, 0,
      { parent: g, rx: Math.PI / 2, cast: false });
    tym.rotation.z = 0;
    tym.scale.set(1, 1, rise / span * 1.15);
    for (const sx of [-1, 1]) {
      const bar = this._m(new THREE.BoxGeometry(Math.hypot(span, rise) + 0.1, 0.13, D * 0.62), stone,
        sx * span / 2, PY + rise / 2, 0, { parent: g });
      bar.rotation.z = -sx * Math.atan2(rise, span);
    }
    // the wreath in the tympanum
    const wreath = this._m(new THREE.TorusGeometry(0.2, 0.055, 7, 20),
      woodcut ? S.mat({ tone: 0.04 }) : S.mat({ color: 0x2f4a1c, roughness: 0.9 }),
      0, PY + rise * 0.42, D * 0.32, { parent: g });
    wreath.scale.set(1, 0.92, 1);
    this._m(new THREE.TorusGeometry(0.1, 0.03, 6, 16),
      woodcut ? S.mat({ tone: 0.0 }) : S.mat({ color: 0xc8a860, metalness: 0.7, roughness: 0.35 }),
      0, PY + rise * 0.42, D * 0.34, { parent: g, cast: false });

    // ── the tree behind, its foliage spilling through the opening ──
    // set behind and to the side, so it frames the opening instead of
    // bulging through the middle of it
    this._tree(X + 2.4, Z - 2.2, 0.8, 'laurel');
    this._tree(X - 2.5, Z - 2.4, 0.7, 'myrtle');

    // ── the couch, and the nymph asleep on it ──
    this._m(new THREE.BoxGeometry(2.1, 0.34, 0.9), stone, -0.1, 0.62, 0.1, { parent: g, outline: true });
    this._m(new THREE.BoxGeometry(2.2, 0.16, 1.0),
      woodcut ? S.mat({ tone: 0.1 }) : S.mat({ color: 0xb9a888, roughness: 0.88 }),
      -0.1, 0.86, 0.1, { parent: g, cast: false });

    // The sleeping nymph herself.
    //
    // She is built here rather than taken from the cast, because the cast's
    // `recline` pose only turns a standing figure on its side — and the nymph's
    // body is a LatheGeometry gown, which laid on its side reads as a cone with
    // a ball on the end. A reclining figure has to be built reclining: a torso
    // laid along the couch, the head propped on the raised arm the plate gives
    // her, the near leg drawn up over the far one, and the drapery falling
    // across the hips rather than hanging from the shoulders.
    const nym = new THREE.Group();
    nym.position.set(X - 0.32, 0.98, Z + 0.06);
    nym.rotation.y = rot;
    this.scene.add(nym);
    const skinM = woodcut ? S.mat({ tone: -0.02 }) : S.mat({ color: 0xe6cdae, roughness: 0.66 });
    const clothM = woodcut ? S.mat({ tone: 0.08 }) : S.mat({ color: 0xd8cbb0, roughness: 0.88 });
    const hairM  = woodcut ? S.mat({ tone: 0.05 }) : S.mat({ color: 0xa9793f, roughness: 0.85 });
    const P = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
      const m = this._m(geo, mat, x, y, z, { parent: nym, rx, ry, rz });
      return m;
    };
    // torso, laid along +x, shoulders slightly raised on the bolster
    const torso = P(new THREE.CapsuleGeometry(0.155, 0.42, 6, 12), skinM, -0.1, 0.13, 0, 0, 0, Math.PI / 2);
    torso.scale.set(1, 1, 0.82);
    P(new THREE.SphereGeometry(0.15, 12, 9), skinM, 0.2, 0.12, 0).scale.set(1.05, 0.85, 0.8);   // hip mass
    // the bolster her shoulders rest on
    P(new THREE.CapsuleGeometry(0.11, 0.5, 5, 10), clothM, -0.5, 0.07, 0, 0, 0, Math.PI / 2);
    // head, tipped back in sleep, on the raised arm
    const head = P(new THREE.SphereGeometry(0.125, 14, 11), woodcut ? skinM : S.mat({ color: 0xe6cdae, roughness: 0.6 }),
      -0.52, 0.26, 0.02, 0, 0, 0.35);
    head.scale.set(0.96, 1.04, 0.94);
    P(new THREE.SphereGeometry(0.135, 11, 8, 0, Math.PI * 2, 0, Math.PI / 1.7), hairM, -0.55, 0.29, 0.0, 0.5, 0, 0.4);
    // the raised arm, bent above the head — the plate's signature gesture
    P(new THREE.CapsuleGeometry(0.045, 0.28, 4, 8), skinM, -0.66, 0.3, -0.11, 0, 0, 1.15);
    P(new THREE.CapsuleGeometry(0.042, 0.24, 4, 8), skinM, -0.86, 0.2, -0.12, 0, 0, 2.5);
    // the near arm, laid across the body
    P(new THREE.CapsuleGeometry(0.045, 0.3, 4, 8), skinM, -0.16, 0.1, 0.14, 0, 0.5, 1.3);
    // drapery over the hips and thighs
    const drp = P(new THREE.CapsuleGeometry(0.19, 0.4, 6, 12), clothM, 0.3, 0.13, 0, 0, 0, Math.PI / 2);
    drp.scale.set(1, 1, 0.85);
    // legs: the far one straight, the near one drawn up
    P(new THREE.CapsuleGeometry(0.085, 0.36, 5, 10), clothM, 0.66, 0.1, -0.09, 0, 0, Math.PI / 2 + 0.1);
    P(new THREE.CapsuleGeometry(0.08, 0.3, 5, 10), skinM, 0.95, 0.09, -0.1, 0, 0, Math.PI / 2 + 0.06);
    P(new THREE.CapsuleGeometry(0.085, 0.3, 5, 10), clothM, 0.62, 0.16, 0.12, 0, 0.35, Math.PI / 2 - 0.25);
    P(new THREE.CapsuleGeometry(0.075, 0.26, 5, 10), skinM, 0.9, 0.1, 0.16, 0, 0.5, Math.PI / 2 + 0.15);
    for (const fx of [1.14, 1.08]) P(new THREE.SphereGeometry(0.06, 8, 6), skinM, fx, 0.07, fx > 1.1 ? -0.1 : 0.17).scale.set(1.3, 0.7, 0.9);
    this._npcs.push({ g: nym, phase: 1.2, baseY: 0, sway: 0.006 });   // the slow breath of sleep

    // ── the satyr, holding the curtain aside ──
    // feet on the stylobate (its top is at y = 0.38), turned inward to the couch
    const satyr = this.cast.props.satyr(1.25);
    satyr.position.set(X + 1.24, 0.38, Z + 0.2);
    satyr.rotation.y = rot + Math.PI * 0.85;
    this.scene.add(satyr);
    this._npcs.push({ g: satyr, phase: 0.3, baseY: 0, sway: 0.012 });

    // ── the two putti ──
    for (const [dx, dz, ph] of [[-0.55, -0.5, 0.2], [-0.15, -0.62, 1.5]]) {
      const pt = this.cast.props.putto(0.9);
      pt.position.set(X + dx, 0.82, Z + dz);
      pt.rotation.y = rot + Math.PI + dx;
      this.scene.add(pt);
      this._npcs.push({ g: pt, phase: ph, baseY: 0, sway: 0.02 });
    }

    // ── the curtain, hung and drawn aside ──
    // A dyed cloth, not another pale stone: at 0xcbb89a the veil read as a
    // third column. Madder rose, matte, so it is unmistakably textile.
    const curt = woodcut
      ? S.mat({ tone: 0.12, side: THREE.DoubleSide })
      : S.mat({ color: 0x9c5a52, roughness: 0.94, side: THREE.DoubleSide });
    // The veil, hung from the architrave and gathered to the satyr's side. A
    // row of thin cones read as a rake, so this is a single swagged sheet with
    // a few soft folds standing proud of it, and a gathered bunch at the tie.
    const HANG = EY - 0.06;
    // Kept narrow and pushed to the satyr's side: a broad sheet across the
    // centre hid the nymph, which is the one thing the plate will not do.
    const swag = this._m(new THREE.CylinderGeometry(0.26, 0.17, 1.25, 14, 1, true), curt,
      1.02, HANG - 0.6, -0.3, { parent: g, cast: false });
    swag.scale.set(1, 1, 0.42);
    swag.rotation.set(0.04, 0.2, -0.16);
    for (let i = 0; i < 4; i++) {
      const t = i / 3;
      const f = this._m(new THREE.CylinderGeometry(0.035, 0.06, 1.2 - t * 0.24, 6, 1, true), curt,
        0.86 + t * 0.16, HANG - 0.62 + t * 0.06, -0.18 + t * 0.06, { parent: g, cast: false });
      f.rotation.set(0.05, 0.2, -0.14 - t * 0.06);
      f.scale.set(1, 1, 0.5);
    }
    // the bunch where it is gathered and tied back
    const bunch = this._m(new THREE.SphereGeometry(0.14, 10, 8), curt, 1.2, HANG - 0.52, -0.06, { parent: g, cast: false });
    bunch.scale.set(0.7, 1.5, 0.7);
    this._m(new THREE.TorusGeometry(0.085, 0.024, 6, 14), curt, 1.2, HANG - 0.52, -0.06,
      { parent: g, cast: false, rz: 0.5 });

    // ── the spring: the part that makes it a fountain ──
    // water issues from under the couch into a sunk basin at the front
    const basin = this.cast.props.pool(1.5);
    basin.position.set(X - 0.1, 0.02, Z + 1.35);
    this.scene.add(basin);
    if (basin.userData.water) this._waters.push({ m: basin.userData.water, rate: 0.05 });
    this._caustics(X - 0.1, 0.04, Z + 1.35, 0.85, 0.05);
    // the spout, and the fall of water from couch to basin
    this._m(new THREE.CylinderGeometry(0.055, 0.07, 0.22, 10), dark, -0.1, 0.5, 0.62, { parent: g });
    const fall = this._m(new THREE.PlaneGeometry(0.1, 0.46),
      woodcut ? S.mat({ tone: -0.1 }) : S.mat({ color: 0xbcd8e8, roughness: 0.2, transparent: true, opacity: 0.55 }),
      -0.1, 0.28, 0.7, { parent: g, cast: false, receive: false });
    fall.rotation.x = 0.22;

    // the inscription the Renaissance copies carried with her
    this._plaque({ main: 'ΠΑΝΤΩΝ ΤΟΚΑΔΙ', sub: 'TO THE MOTHER OF ALL THINGS' },
      1.5, 0.34, X, 0.42, Z + 1.02, rot, true);

    this._circleCol(X, Z, 2.2);
    return g;
  }

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
    const polia = this.cast.nymph({ name: 'Polia', h: 1.0, robe: 0xe8ddc0, pose: 'offer' });
    this._npc('polia', polia, CX + 0.9, CZ, Math.PI / 2, { label: 'Polia', sub: 'THE LONG-SOUGHT', labelY: 2.1, sway: 0.03 });
    // named, so the card variant hands him Mercury — the one standing male
    // figure in the Primavera — rather than one of the Graces
    const poliphilo = this.cast.figure({ name: 'Poliphilo', h: 1.0, robe: 0x3a3a5a, pose: 'reach' });
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
    // The wall was a plain slab with a cap. This is the threshold of the dream
    // proper — Lefaivre's architectural body at its most explicit — so it gets
    // the shared classical members: a full entablature along its whole length,
    // and engaged columns standing to either side of each gate.
    this._entablature(0, WALL_H - 0.1, Z, 28.8, 1.0);
    this._frieze(0, WALL_H + 0.62, Z + 0.55, 27.6, 0.5, 'meander');
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

      // engaged columns flanking the gate, of the order the gate's own colour
      // suggests; and an egg-and-dart astragal under its lintel
      for (const sx of [-1, 1]) {
        const cx2 = d.x + sx * (d.w / 2 + 0.62);
        const gc = new THREE.Group(); gc.position.set(0, 0, 0); this.scene.add(gc);
        this._column(cx2, Z + 0.52, d.h + 0.35, { order: 'corinthian', r: 0.17, parent: gc });
      }
      this._frieze(d.x, d.h + 0.38, Z + 0.5, d.w + 1.0, 0.24, 'eggdart');

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

    // ── The beast itself ──────────────────────────────────────────────────
    // Two variants (DECISIONS.md 2026-09-05). `primitive` is the founding look
    // and what woodcut mode wants: a squashed sphere, four cylinders, a sphere
    // head. `massed` models the anatomy the sources actually show — the 1499
    // woodcut (woodcut_catalog #24, "the stone elephant bearing the obelisk")
    // and Bernini's Elephant and Obelisk of 1667, the direct descendant of this
    // design, which is already in our gallery (src/data/gallery.json,
    // Architecture). Curran reads the monument as the book's central Egyptian
    // revival piece, so the silhouette has to be legible as an elephant.
    const tuskMat = S.key === 'woodcut'
      ? S.mat({ tone: -0.05 }) : S.mat({ color: 0xf0ead8, roughness: 0.45 });

    if (isVariant('elephant', 'primitive', S.key)) {
      const body = this._m(new THREE.SphereGeometry(0.85, 20, 14), eleMat, 0, 2.0, 0, { parent: g, outline: true });
      body.scale.set(1.0, 0.85, 1.5);
      for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        this._m(new THREE.CylinderGeometry(0.16, 0.19, 1.1, 10), eleMat, sx * 0.42, 1.25, sz * 0.6, { parent: g });
      }
      this._m(new THREE.SphereGeometry(0.5, 16, 12), eleMat, 0, 2.25, -1.35, { parent: g, outline: true });
      for (const s of [-1, 1]) {
        this._m(new THREE.CircleGeometry(0.34, 14), S.mat({ color: 0x6a6058, tone: 0.12, side: THREE.DoubleSide }), s * 0.45, 2.35, -1.25, { ry: s * Math.PI / 2.6, cast: false, parent: g });
        this._m(new THREE.ConeGeometry(0.05, 0.5, 8), tuskMat, s * 0.2, 1.85, -1.72, { rx: -Math.PI / 2.4, parent: g });
      }
    } else {
      // Barrel body, but built as three overlapping masses: an elephant has a
      // distinct shoulder and a distinct rump, not one smooth ellipsoid.
      const barrel = this._m(new THREE.SphereGeometry(0.84, 20, 15), eleMat, 0, 1.98, 0, { parent: g, outline: true });
      barrel.scale.set(1.0, 0.9, 1.46);
      const shoulder = this._m(new THREE.SphereGeometry(0.62, 16, 12), eleMat, 0, 2.14, -0.66, { parent: g });
      shoulder.scale.set(1.02, 0.92, 0.9);
      const rump = this._m(new THREE.SphereGeometry(0.6, 16, 12), eleMat, 0, 2.06, 0.72, { parent: g });
      rump.scale.set(1.0, 0.95, 0.86);

      // Columnar legs, thicker at the shoulder, with the broad flat foot pads
      // that make an elephant read as an elephant.
      for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        const x = sx * 0.44, z = sz * 0.62;
        this._m(new THREE.CylinderGeometry(0.155, 0.225, 1.12, 12), eleMat, x, 1.24, z, { parent: g });
        this._m(new THREE.CylinderGeometry(0.235, 0.2, 0.14, 12), eleMat, x, 0.75, z, { parent: g });
        this._m(new THREE.SphereGeometry(0.23, 12, 8), eleMat, x, 0.72, z, { parent: g, cast: false });
      }

      // Head: a domed skull with the high forehead of the woodcut, set forward
      // of the shoulder, plus the heavy brow the trunk springs from.
      const head = this._m(new THREE.SphereGeometry(0.5, 18, 14), eleMat, 0, 2.26, -1.32, { parent: g, outline: true });
      head.scale.set(1.0, 1.06, 0.92);
      const dome = this._m(new THREE.SphereGeometry(0.34, 14, 11), eleMat, 0, 2.6, -1.3, { parent: g });
      dome.scale.set(1.0, 0.78, 0.9);
      this._m(new THREE.SphereGeometry(0.28, 12, 10), eleMat, 0, 2.02, -1.62, { parent: g, cast: false });

      for (const s of [-1, 1]) {
        // Ears: large, angled, and slightly dished — not flat discs.
        const ear = this._m(new THREE.SphereGeometry(0.38, 14, 10, 0, Math.PI), eleMat,
          s * 0.44, 2.32, -1.16, { parent: g, cast: false });
        ear.scale.set(0.9, 1.12, 0.14);
        ear.rotation.set(0.1, s * 0.5, s * -0.16);

        // Tusks "of puer white stone" — curved, in two tapering segments, the
        // way both the woodcut and Bernini draw them.
        const t1 = this._m(new THREE.CylinderGeometry(0.035, 0.055, 0.34, 8), tuskMat,
          s * 0.21, 1.93, -1.66, { parent: g });
        t1.rotation.set(-0.68, 0, s * 0.1);
        const t2 = this._m(new THREE.ConeGeometry(0.034, 0.3, 8), tuskMat,
          s * 0.235, 1.73, -1.9, { parent: g });
        t2.rotation.set(-1.16, 0, s * 0.14);

        // A small eye, so the head has a face at all
        this._m(new THREE.SphereGeometry(0.045, 8, 6),
          S.key === 'woodcut' ? S.mat({ tone: -0.2 }) : S.mat({ color: 0x0a0a0c, roughness: 0.3 }),
          s * 0.3, 2.3, -1.66, { parent: g, cast: false });
      }

      // Tail
      const tail = this._m(new THREE.CylinderGeometry(0.03, 0.055, 0.7, 7), eleMat, 0, 1.86, 1.28, { parent: g });
      tail.rotation.x = -0.22;

      // The caparison: the cloth over the beast's back under the saddle, which
      // is how Bernini seats his obelisk. Sits just proud of the barrel.
      if (S.key !== 'woodcut') {
        const cloth = this._m(new THREE.SphereGeometry(0.9, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2.35),
          S.mat({ color: 0x6d2b2b, roughness: 0.82 }), 0, 1.99, 0, { parent: g, cast: false });
        cloth.scale.set(1.02, 0.86, 1.42);
        for (let i = 0; i < 9; i++) {                       // hem tassels
          const a = -0.62 + (i / 8) * 1.24;
          for (const sz of [-1, 1]) {
            this._m(new THREE.ConeGeometry(0.035, 0.13, 6),
              S.mat({ color: 0xb08a3a, metalness: 0.7, roughness: 0.4 }),
              Math.sin(a) * 0.9, 1.66, sz * 1.2, { parent: g, cast: false });
          }
        }
      }
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

  // ── Classical members ────────────────────────────────────────────────────
  //
  // Shared architectural parts, so every building in the garden is made of the
  // same vocabulary instead of each one improvising boxes. The HP is, before it
  // is anything else, a book about architecture — Lefaivre reads the whole dream
  // as an architectural body — so a "palace" that is a slab with plain cylinders
  // on it is not a reading of the book, it is a placeholder.
  //
  // Orders after the book's own constant subject (hp.db lexicon, "Column
  // Orders"). Each column gets what a column actually has: a base of torus and
  // scotia over a plinth, a fluted shaft with entasis, and a capital proper to
  // its order. Each entablature gets architrave, frieze and a dentilled cornice.

  // A column of the given order, standing at (x, z) on the floor level `y0`.
  _column(x, z, h, { order = 'ionic', r = null, parent = null, mat = null, flutes = 16 } = {}) {
    const M = mat || this._stoneMat;
    const rad = r || h * 0.055;
    const g = parent || this.scene;
    const at = (geo, yy, o = {}) => this._m(geo, M, x, yy, z, { parent: g, ...o });

    // plinth, torus, scotia, torus — the attic base
    at(new THREE.BoxGeometry(rad * 3.1, rad * 0.5, rad * 3.1), rad * 0.25);
    at(new THREE.TorusGeometry(rad * 1.22, rad * 0.2, 6, 16), rad * 0.66, { rx: Math.PI / 2 });
    at(new THREE.CylinderGeometry(rad * 1.1, rad * 1.25, rad * 0.3, 14), rad * 0.92);
    at(new THREE.TorusGeometry(rad * 1.1, rad * 0.14, 6, 16), rad * 1.16, { rx: Math.PI / 2 });

    // the shaft: entasis, and flutes cut as shallow ribs around it
    const y0 = rad * 1.3, sh = h - y0 - rad * 1.5;
    const shaft = at(new THREE.CylinderGeometry(rad * 0.86, rad, sh, 18), y0 + sh / 2, { outline: true });
    if (flutes && this.style.key !== 'woodcut') {
      for (let i = 0; i < flutes; i++) {
        const a = (i / flutes) * Math.PI * 2;
        const fr = rad * 0.93;
        this._m(new THREE.CylinderGeometry(rad * 0.085, rad * 0.1, sh * 0.985, 5),
          this._darkStoneMat, x + Math.cos(a) * fr, y0 + sh / 2, z + Math.sin(a) * fr,
          { parent: g, cast: false, receive: false });
      }
    }
    // necking
    at(new THREE.TorusGeometry(rad * 0.88, rad * 0.09, 6, 16), y0 + sh + rad * 0.05, { rx: Math.PI / 2 });

    // capital
    const cy = y0 + sh + rad * 0.1;
    if (order === 'doric') {
      at(new THREE.CylinderGeometry(rad * 1.25, rad * 0.9, rad * 0.45, 16), cy + rad * 0.22);
      at(new THREE.BoxGeometry(rad * 2.7, rad * 0.28, rad * 2.7), cy + rad * 0.58);
    } else if (order === 'corinthian') {
      at(new THREE.CylinderGeometry(rad * 1.25, rad * 0.88, rad * 1.15, 14), cy + rad * 0.58);
      for (let k = 0; k < 8; k++) {                       // two tiers of acanthus
        const a = (k / 8) * Math.PI * 2;
        for (const [tier, rr, hh] of [[0, 1.02, 0.34], [1, 1.2, 0.78]]) {
          const lf = this._m(new THREE.ConeGeometry(rad * 0.3, rad * 0.62, 5), M,
            x + Math.cos(a + tier * 0.4) * rad * rr, cy + rad * hh, z + Math.sin(a + tier * 0.4) * rad * rr,
            { parent: g, cast: false });
          lf.rotation.set(Math.sin(a) * 0.55, -a, -Math.cos(a) * 0.55);
        }
      }
      at(new THREE.BoxGeometry(rad * 2.9, rad * 0.3, rad * 2.9), cy + rad * 1.3);
    } else {                                              // ionic: a pair of volutes
      at(new THREE.CylinderGeometry(rad * 1.1, rad * 0.9, rad * 0.3, 16), cy + rad * 0.15);
      for (const sx of [-1, 1]) {
        const v = this._m(new THREE.TorusGeometry(rad * 0.42, rad * 0.17, 7, 16), M,
          x + sx * rad * 0.92, cy + rad * 0.5, z, { parent: g, ry: Math.PI / 2 });
        v.scale.set(1, 1, 0.62);
      }
      at(new THREE.BoxGeometry(rad * 2.5, rad * 0.24, rad * 1.9), cy + rad * 0.82);
    }
    this._circleCol(x, z, rad * 1.6);
    return h;
  }

  // Architrave (three fasciae), frieze, and a cornice carrying dentils.
  _entablature(cx, cy, cz, w, d, { parent = null, ry = 0, dentils = true, mat = null } = {}) {
    const M = mat || this._stoneMat;
    const g = parent || this.scene;
    const at = (geo, mm, yy, o = {}) => this._m(geo, mm, cx, yy, cz, { parent: g, ry, cast: false, ...o });
    // architrave, stepped forward in three bands
    at(new THREE.BoxGeometry(w, 0.16, d), M, cy + 0.08);
    at(new THREE.BoxGeometry(w + 0.06, 0.14, d + 0.06), M, cy + 0.23);
    at(new THREE.BoxGeometry(w + 0.13, 0.13, d + 0.13), M, cy + 0.44);
    // frieze
    at(new THREE.BoxGeometry(w + 0.1, 0.34, d + 0.1), this._darkStoneMat, cy + 0.67);
    // dentils
    if (dentils) {
      const n = Math.max(6, Math.round(w * 2.2));
      for (let i = 0; i < n; i++) {
        const t = -w / 2 + (i + 0.5) * (w / n);
        const px = cx + Math.cos(ry) * t, pz = cz - Math.sin(ry) * t;
        this._m(new THREE.BoxGeometry(w / n * 0.5, 0.14, d + 0.2), M, px, cy + 0.92, pz,
          { parent: g, ry, cast: false });
      }
    }
    // cornice, and the corona that throws the shadow line
    at(new THREE.BoxGeometry(w + 0.34, 0.16, d + 0.34), M, cy + 1.07);
    at(new THREE.BoxGeometry(w + 0.44, 0.1, d + 0.44), M, cy + 1.2);
    return cy + 1.25;
  }

  // A flight of steps (a crepidoma) on the +z face of a platform.
  _steps(cx, cz, w, n = 3, rise = 0.16, tread = 0.42, { parent = null, mat = null } = {}) {
    const M = mat || this._stoneMat;
    const g = parent || this.scene;
    for (let i = 0; i < n; i++) {
      this._m(new THREE.BoxGeometry(w - i * 0.2, rise, tread), M,
        cx, rise / 2 + i * rise, cz + (n - i) * tread * 0.72,
        { parent: g, cast: false });
    }
  }

  // A doorway cut in a wall: jambs, lintel, and a moulded surround.
  _doorway(cx, cy, cz, w, h, { parent = null, ry = 0, mat = null } = {}) {
    const M = mat || this._stoneMat;
    const g = parent || this.scene;
    for (const sx of [-1, 1]) {
      const t = sx * (w / 2 + 0.16);
      this._m(new THREE.BoxGeometry(0.3, h, 0.5), this._darkStoneMat,
        cx + Math.cos(ry) * t, cy + h / 2, cz - Math.sin(ry) * t, { parent: g, ry, outline: true });
    }
    this._m(new THREE.BoxGeometry(w + 0.92, 0.34, 0.55), this._darkStoneMat, cx, cy + h + 0.17, cz, { parent: g, ry });
    this._m(new THREE.BoxGeometry(w + 1.3, 0.16, 0.66), M, cx, cy + h + 0.4, cz, { parent: g, ry, cast: false });
    // the dark of the opening
    this._m(new THREE.PlaneGeometry(w, h), this._darkStoneMat, cx, cy + h / 2, cz + 0.28,
      { parent: g, ry, cast: false, receive: false });
  }

  _buildPalace() {
    const S = this.style;
    const CX = -20.5;

    // A stepped platform, not a slab: stylobate over two courses, with a flight
    // up the east front where the dreamer arrives.
    this._m(new THREE.BoxGeometry(16.2, 0.22, 12.2), this._darkStoneMat, CX, 0.11, 0, { cast: false });
    this._m(new THREE.BoxGeometry(15.4, 0.2, 11.4), this._stoneMat, CX, 0.31, 0, { cast: false });
    this._m(new THREE.BoxGeometry(14.8, 0.16, 10.8), this._stoneMat, CX, 0.49, 0, { cast: false, outline: true });
    this._steps(CX + 7.6, 5.6, 4.4, 3);

    // Two colonnades of Ionic columns, properly based, fluted and capitalled,
    // carrying a full entablature.
    const COL_H = 4.0;
    for (const side of [-1, 1]) {
      for (let i = 0; i < 6; i++) {
        const x = CX - 5.5 + i * 2.2, z = side * 4.2;
        const gcol = new THREE.Group();
        gcol.position.y = 0.57;
        this.scene.add(gcol);
        this._column(x, z, COL_H, { order: 'ionic', r: 0.26, parent: gcol });
      }
      this._entablature(CX, 0.57 + COL_H, side * 4.2, 12.6, 0.95);
    }

    // The rear wall of the hall, with its great door and flanking pilasters —
    // a palace needs somewhere to be the inside of.
    const WZ = -5.2, WH = 5.4;
    this._m(new THREE.BoxGeometry(13.4, WH, 0.6), this._stoneMat, CX, 0.57 + WH / 2, WZ, { outline: true });
    this._wallCol(CX - 6.7, CX + 6.7, WZ - 0.3, WZ + 0.3);
    for (let i = 0; i < 6; i++) {
      const x = CX - 5.5 + i * 2.2;
      this._m(new THREE.BoxGeometry(0.44, WH - 0.5, 0.22), this._darkStoneMat, x, 0.57 + (WH - 0.5) / 2, WZ + 0.36, { cast: false });
      this._m(new THREE.BoxGeometry(0.6, 0.18, 0.3), this._stoneMat, x, 0.57 + WH - 0.42, WZ + 0.4, { cast: false });
    }
    this._doorway(CX, 0.57, WZ + 0.32, 2.0, 3.2);
    this._entablature(CX, 0.57 + WH - 0.2, WZ, 13.8, 0.75);
    // a low roof over the hall, and antefixes along the eaves
    this._m(new THREE.BoxGeometry(13.9, 0.24, 9.6), this._darkStoneMat, CX, 0.57 + WH + 1.1, WZ + 4.6, { cast: false });
    for (let i = 0; i < 9; i++) {
      const x = CX - 6.4 + i * 1.6;
      this._m(new THREE.ConeGeometry(0.18, 0.34, 6), this._stoneMat, x, 0.57 + WH + 1.4, WZ + 0.05, { cast: false });
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

    // A ring of eight columns about the shrine, carrying a circular entablature.
    // The Quinta was three stacked drums and a glowing solid; it is a temple and
    // now stands like one.
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const gx = CX + Math.cos(a) * 3.35, gz = CZ + Math.sin(a) * 3.35;
      const gc = new THREE.Group(); gc.position.y = 0.56; this.scene.add(gc);
      this._column(gx, gz, 2.9, { order: 'ionic', r: 0.17, parent: gc });
    }
    for (let i = 0; i < 8; i++) {                 // the ring architrave, in eight bays
      const a0 = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const a1 = ((i + 1) / 8) * Math.PI * 2 + Math.PI / 8;
      const mx = CX + Math.cos((a0 + a1) / 2) * 3.35, mz = CZ + Math.sin((a0 + a1) / 2) * 3.35;
      const span = 2 * 3.35 * Math.sin(Math.PI / 8);
      this._entablature(mx, 3.46, mz, span + 0.22, 0.5, { ry: -(a0 + a1) / 2 });
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

  // The mainland grove carries a dream-echo of this fountain; the true one
  // stands at the centre of the theatre on Cythera, and the Dream narration
  // has always said so ("in the isle of Cythera, where this fountain truly
  // belongs"). The builder takes its place so both can exist — the dream
  // repeats its climax, which is what dreams do.
  // `enclosure` adds the setting Hunt reads as the resolution of the book's
  // whole art-versus-nature argument (GARDENS.md §7): a balustrade patterned
  // like book-matched sliced marble, a flowery mead that is at once meadow and
  // garden, and a pergola whose structure is the finest gold carrying roses
  // that — unlike the silk ones met earlier — are natural. Artifice in the
  // structure, nature in the growth: the thesis built as an object. Only the
  // true fountain, on Cythera, gets it; the mainland grove is the dream-echo.
  _buildFountain(FX = 0, FZ = -20, { enclosure = false } = {}) {
    const S = this.style;
    const waterMat = this._waterMat();

    // Built from chapter XXIII of the 1499, translated at translation/en/
    // page_358–360.md: a kerb of the blackest stone, "heptagonal on the outside
    // and round within," carrying seven lathe-turned columns swelling with
    // entasis — sapphire, emerald, turquoise, a melilot-coloured opaque stone,
    // jasper, topaz, and a seventh of Indian beryl that is hexagonal where the
    // others are round. Gold bases, capitals, architrave and cornice; the
    // arcade between the columns taking the stone of its neighbour; a small
    // altar over each capital carrying a gold planetary figure a third the
    // column's height; the zodiac in the frieze beneath them; a veinless
    // crystal cupola over all; and at its peak an egg-shaped carbuncle the size
    // of an ostrich's.
    const woodcut = S.key === 'woodcut';
    const gold = woodcut ? S.mat({ tone: 0.02 }) : S.mat({ color: 0xd9b25a, metalness: 0.95, roughness: 0.22 });
    const black = woodcut ? S.mat({ tone: 0.3 }) : S.mat({ color: 0x121016, roughness: 0.45, metalness: 0.15 });
    const gem = (color) => woodcut
      ? S.mat({ tone: 0.12 })
      : S.mat({ color, roughness: 0.18, metalness: 0.35, emissive: color, emissiveIntensity: 0.16 });

    // The seven, in the order the book sets them round the ring. Sapphire and
    // emerald answer one another across the entrance (the dreamer arrives from
    // the north); the beryl stands alone, opposite, facing the midpoint between
    // them.
    //
    // The planets are not Colonna's — he names the stones and stops. They are
    // Hand B's: the annotator of the British Library copy inked the sign of a
    // different metal at each of the seven angles of this fountain's woodcut,
    // one per planet (hp.db folio_descriptions y7r, "Fons Heptagonis"). We are
    // following a documented sixteenth-century reading of this exact plate, not
    // imposing a modern one. See ARCHITECTURE.md §5.
    const COLS = [
      { stone: 0x1e3f96, name: 'sapphire',  planet: 'Saturn',  glyph: '♄', hex: false },
      { stone: 0xcdbb63, name: 'melilot',   planet: 'Jupiter', glyph: '♃', hex: false },
      { stone: 0xbcd2cb, name: 'jasper',    planet: 'Mars',    glyph: '♂', hex: false },
      { stone: 0x8fd0c0, name: 'beryl',     planet: 'Sol',     glyph: '☉', hex: true  },
      { stone: 0xdca62c, name: 'topaz',     planet: 'Venus',   glyph: '♀', hex: false },
      { stone: 0x2ba2ad, name: 'turquoise', planet: 'Mercury', glyph: '☿', hex: false },
      { stone: 0x0d7548, name: 'emerald',   planet: 'Luna',    glyph: '☽', hex: false },
    ];
    const R = 2.95, COL_H = 3.0, KERB = 0.42;

    // The floor of the theatre, and the kerb: seven-sided without, round within
    this._m(new THREE.CylinderGeometry(5.4, 5.4, 0.12, 7), black, FX, 0.06, FZ, { cast: false });
    // THE KERB IS A RING, NOT A DISC. Built as a solid CylinderGeometry it caps
    // itself at the top — a black lid at y = KERB sealing the whole basin, with
    // the water hidden underneath it. That lid, not the water, was the dark
    // surface in the middle of the fountain. Now: an open-ended outer wall, an
    // open-ended inner wall, and a flat annulus between them for the top.
    this._m(new THREE.CylinderGeometry(R + 0.55, R + 0.6, KERB, 7, 1, true), black,
      FX, KERB / 2, FZ, { cast: false, outline: true });
    this._m(new THREE.RingGeometry(R + 0.12, R + 0.55, 7), black,
      FX, KERB, FZ, { rx: -Math.PI / 2, cast: false });
    this._m(new THREE.CylinderGeometry(R + 0.12, R + 0.12, KERB * 0.5, 36, 1, true), black, FX, KERB * 0.72, FZ, { cast: false });
    this._m(new THREE.TorusGeometry(R + 0.14, 0.045, 8, 40), gold, FX, KERB + 0.02, FZ, { rx: Math.PI / 2 });
    // The basin is sunk below the pavement, because the goddess stands in it
    // "up to her ample and divine flanks" — not on a pedestal above the water.
    const WATER_Y = KERB - 0.06, BASIN_Y = -0.55;
    // The book gives the KERB "the blackest stone" — it does not say the basin
    // is lined with it. Lined black, the water read as asphalt: clear water over
    // black stone is dark water, which is physically right and completely wrong
    // for a fountain the text calls clear and most limpid, that gives the body
    // back whole. Lined pale, the same clear water reads as water.
    const basinStone = woodcut
      ? S.mat({ tone: 0.06 })
      : S.mat({ color: 0xbfc4c2, roughness: 0.5, metalness: 0.05 });
    this._m(new THREE.CircleGeometry(R + 0.06, 36), basinStone, FX, BASIN_Y, FZ, { rx: -Math.PI / 2, cast: false });
    this._m(new THREE.CylinderGeometry(R + 0.06, R + 0.06, WATER_Y - BASIN_Y, 36, 1, true), basinStone, FX, (WATER_Y + BASIN_Y) / 2, FZ, { cast: false });
    // The cupola stands directly over this basin, so a shadow-receiving water
    // plane renders as dark stone — the exact opposite of the water the book
    // insists on, which gives her body back with refraction itself suspended.
    // It keeps its own light.
    this._waters.push({ m: this._m(new THREE.CircleGeometry(R + 0.06, 40), waterMat, FX, WATER_Y, FZ,
      { rx: -Math.PI / 2, cast: false, receive: false }), rate: 0.09 });
    this._caustics(FX, WATER_Y, FZ, R, 0.07);
    this._circleCol(FX, FZ, R + 0.85);
    // folio 80's own company — the mainland grove only; Cythera's enclosed
    // fountain keeps the pure chapter-XXIII programme.
    if (!enclosure) this._buildFolio80Company(FX, FZ, R, KERB);

    // The seven columns, the arcade between them, the altars and their planets
    const ang = (i) => Math.PI + (i - 3) * (Math.PI * 2 / 7);
    COLS.forEach((c, i) => {
      const a = ang(i);
      const x = FX + Math.sin(a) * R, z = FZ + Math.cos(a) * R;
      const mat = gem(c.stone);
      this._m(new THREE.BoxGeometry(0.44, 0.1, 0.44), gold, x, KERB + 0.05, z, { ry: -a });
      // entasis: a shaft that swells and is drawn in again toward the capital
      const shaft = this._m(new THREE.CylinderGeometry(0.145, 0.175, COL_H, c.hex ? 6 : 16), mat, x, KERB + 0.1 + COL_H / 2, z, { ry: -a, outline: true });
      shaft.scale.x = shaft.scale.z = 1.0;
      this._m(new THREE.SphereGeometry(0.19, 12, 8), mat, x, KERB + 0.1 + COL_H * 0.42, z).scale.set(1, 0.42, 1);
      this._m(new THREE.BoxGeometry(0.42, 0.12, 0.42), gold, x, KERB + 0.17 + COL_H, z, { ry: -a });

      // the planet's name and glyph, read from outside at eye height
      this._plaque({ glyph: c.glyph, glyphColor: '#e8c860', main: c.planet, sub: c.name.toUpperCase() },
        0.72, 0.38, x + Math.sin(a) * 0.5, KERB + 0.62, z + Math.cos(a) * 0.5, a);

      // the arcade: a real arch springing between this column and the next,
      // taking the stone of its neighbour
      const mid = (a + ang(i + 1)) / 2;
      const mx = FX + Math.sin(mid) * R, mz = FZ + Math.cos(mid) * R;
      const half = R * Math.sin(Math.PI / 7);
      const arch = this._m(new THREE.TorusGeometry(half, 0.075, 8, 18, Math.PI),
        gem(COLS[(i + 1) % 7].stone), mx, KERB + 0.1 + COL_H * 0.74, mz, { ry: -mid });
      arch.scale.y = 0.62;
      this._m(new THREE.BoxGeometry(half * 2, 0.1, 0.16), gold, mx, KERB + 0.17 + COL_H, mz, { ry: -mid });
    });

    // the crown: cornice ring, and the zodiac frieze running beneath it
    this._m(new THREE.CylinderGeometry(R + 0.24, R + 0.24, 0.1, 7), gold, FX, KERB + 0.3 + COL_H, FZ, { cast: false });
    this._m(new THREE.CylinderGeometry(R + 0.06, R + 0.06, 0.24, 7, 1, true), gold, FX, KERB + 0.42 + COL_H, FZ, { cast: false });

    // The seven planetary figures stand on the angles of the crown, OUTSIDE the
    // springing of the cupola, each a third the height of the column below it
    const crownY = KERB + 0.35 + COL_H;
    const fig = COL_H / 3;
    COLS.forEach((c, i) => {
      const a = ang(i);
      const x = FX + Math.sin(a) * (R + 0.16), z = FZ + Math.cos(a) * (R + 0.16);
      this._m(new THREE.CylinderGeometry(0.11, 0.14, 0.14, 8), gold, x, crownY + 0.07, z);
      // "an image of a planet with its proper attribute" — a gold figure, not a
      // finial, standing a third the height of the column beneath it
      const g = this.cast.figure({
        h: fig / 1.7, robe: 0xd9b25a, skin: 0xd9b25a,
        pose: c.planet === 'Sol' ? 'reach' : 'offer',
        crowned: c.planet === 'Sol',
      });
      g.position.set(x, crownY + 0.14, z);
      g.rotation.y = a;                      // facing outward, off the crown
      this.scene.add(g);
      this._npcs.push({ g, phase: i * 0.9, baseY: a, sway: 0.015 });
    });

    // the crystal cupola springs inside the crown, so the planets stand clear
    const DOME_R = R * 0.8;
    const crystal = woodcut
      ? S.mat({ tone: -0.12, rim: 0.5 })
      : S.mat({ color: 0xd4e8f2, roughness: 0.04, metalness: 0.08, transparent: true, opacity: 0.2 });
    const dome = this._m(new THREE.SphereGeometry(DOME_R, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2),
      crystal, FX, KERB + 0.46 + COL_H, FZ, { cast: false, receive: false });
    dome.scale.y = 0.78;
    this._m(new THREE.TorusGeometry(DOME_R, 0.06, 8, 36), gold, FX, KERB + 0.48 + COL_H, FZ, { rx: Math.PI / 2 });
    const carb = this._m(new THREE.SphereGeometry(0.19, 16, 12),
      woodcut ? S.glowMat() : S.mat({ color: 0xd8322a, emissive: 0xa01810, emissiveIntensity: 1.5, metalness: 0.6, roughness: 0.15 }),
      FX, KERB + 0.46 + COL_H + DOME_R * 0.78 + 0.16, FZ, { outline: true });
    carb.scale.y = 1.35;
    this._orbs.push({ orb: carb, base: carb.position.y, phase: 0.4, spin: true });
    const cl = S.pointLight(0xff5030, 1.5, 9);
    if (cl) { cl.position.set(FX, carb.position.y, FZ); this.scene.add(cl); this._pulses.push({ pl: cl, base: 1.5, phase: 0.4 }); }

    const vMat = S.mat({ color: 0xd4c0a0, roughness: 0.6, metalness: 0.15 });
    const v = new THREE.Group();
    this._m(new THREE.CylinderGeometry(0.3, 0.36, 0.22, 12), this._stoneMat, 0, 0, 0, { parent: v });
    this._m(new THREE.ConeGeometry(0.24, 0.6, 10), vMat, 0, 0.45, 0, { parent: v, outline: true });
    this._m(new THREE.CapsuleGeometry(0.18, 0.6, 6, 10), vMat, 0, 1.0, 0, { parent: v, outline: true });
    this._m(new THREE.SphereGeometry(0.15, 12, 10), vMat, 0, 1.56, 0, { parent: v, outline: true });
    [[-0.24, -0.65], [0.24, 0.65]].forEach(([x, rz]) => {
      this._m(new THREE.CapsuleGeometry(0.06, 0.42, 4, 8), vMat, x, 1.16, 0, { rz, parent: v });
    });
    // The divine Mother stands in the salt fountain itself, the water taking her
    // at the flanks, her hair floating out on it — the figure the torn curtain
    // reveals (ch. XXIII, translation/en/page_362.md).
    v.position.set(FX, BASIN_Y, FZ);
    v.scale.setScalar(1.35);
    this.scene.add(v);
    this._venuses.push(v);
    // remember this fountain so an imported marble statue can stand in her place
    this._venusSlots.push({ primitive: v, parent: v.parent, pos: v.position.clone() });
    // hair floating "scattered in a gyre and very long" on the surface
    const hairRing = this._m(new THREE.TorusGeometry(0.5, 0.055, 6, 24),
      woodcut ? S.mat({ tone: 0.06 }) : S.mat({ color: 0xd8b24a, metalness: 0.5, roughness: 0.4 }),
      FX, WATER_Y + 0.02, FZ, { rx: Math.PI / 2, cast: false });
    hairRing.scale.set(1, 1, 0.45);
    this._waters.push({ m: hairRing, rate: 0.05 });

    // The curtain of Hymen, hung between the sapphire and emerald columns —
    // the pair that answer one another across the entrance — and split, as
    // Poliphilo left it when he struck it with Cupid's arrow.
    const curtMat = woodcut
      ? S.mat({ tone: 0.14, side: THREE.DoubleSide })
      : S.mat({ color: 0xb0654a, roughness: 0.75, side: THREE.DoubleSide });
    const cz = FZ + R, halfSpan = R * Math.sin(Math.PI / 7);
    for (const s of [-1, 1]) {
      // each half hangs back against its column, leaving the goddess in the gap
      const panel = this._m(new THREE.PlaneGeometry(halfSpan * 0.5, 1.5, 2, 4),
        curtMat, FX + s * (halfSpan * 0.74), KERB + 0.12 + 0.75, cz - 0.06, { cast: false });
      panel.rotation.y = s * 0.62;
      panel.rotation.z = s * 0.05;
    }
    // the tie-rings the curtain hung from, still on their rod
    this._m(new THREE.CylinderGeometry(0.022, 0.022, halfSpan * 1.9, 6), gold,
      FX, KERB + 0.12 + 1.5, cz - 0.06, { rz: Math.PI / 2 });
    this._plaque({ main: 'ΥΜΗΝ', sub: 'THE CURTAIN OF HYMEN, TORN' },
      0.86, 0.32, FX, KERB + 0.12 + 1.72, cz - 0.02, 0, true);
    // the fountain's own motto, cut into the stone in refined silver, set on the
    // kerb where a reader walking up to it would meet it
    this._plaque({ main: 'ΩΣΠΕΡ ΣΠΙΝΘΗΡ ΚΗΛΗΘΜΟΣ', sub: 'AS A SPARK, SO ENCHANTMENT' },
      1.3, 0.28, FX, KERB * 0.62, FZ + R + 0.62, 0, true);

    // ── The water ────────────────────────────────────────────────────────
    //
    // There were four jets arcing down from about y=2 — from nothing, out of
    // the air above the basin. The book has no jets here at all. What chapter
    // XXIII describes (translation/en/page_362.md) is the opposite: a brimming
    // SALT fountain — Venus is sea-born, so `salso fonte` — so clear that it
    // gives her body back "neither thickened nor doubled nor broken nor
    // foreshortened", refraction itself suspended; her hair lying on the surface
    // "not sinking, but scattered in a gyre"; and, the one thing that actually
    // moves, "round about, at the lowest level, there rose a foaming" that gave
    // off a fragrance of musk.
    //
    // So the water wells UP from the floor of the basin around its whole rim,
    // and breaks as foam at the surface. Nothing falls from anywhere.
    const FOAM_N = 18;
    for (let i = 0; i < FOAM_N; i++) {
      const a = (i / FOAM_N) * Math.PI * 2;
      const rr = R * 0.90;
      const fx = FX + Math.cos(a) * rr, fz = FZ + Math.sin(a) * rr;
      const stream = new ParticleStream({
        count: 26,
        source: new THREE.Vector3(fx, BASIN_Y + 0.05, fz),
        target: new THREE.Vector3(fx + Math.cos(a) * 0.06, WATER_Y + 0.10, fz + Math.sin(a) * 0.06),
        color: 0xeaf4ff, size: 0.028, speed: 0.30, arc: 0.04,
      });
      stream.opacity = 0.5; stream.active = true;
      S.tuneStream(stream);
      this.scene.add(stream.points);
      this._streams.push(stream);
    }
    // the foaming itself, read as a bright annulus riding the water at the rim
    if (!woodcut) {
      const foamMat = new THREE.MeshBasicMaterial({
        color: 0xf2f8ff, transparent: true, opacity: 0.30,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      });
      this._disp.push(foamMat);
      const foam = this._m(new THREE.RingGeometry(R * 0.70, R + 0.05, 44), foamMat,
        FX, WATER_Y + 0.02, FZ, { rx: -Math.PI / 2, cast: false, receive: false });
      this._waters.push({ m: foam, rate: -0.06 });      // turning against the water
    }

    const wl = S.pointLight(0x80c0ff, 1.6, 8);
    if (wl) { wl.position.set(FX, 1.2, FZ); this.scene.add(wl); this._pulses.push({ pl: wl, base: 1.6, phase: 0 }); }
    const vl = S.pointLight(0xc8a44a, 1.1, 6);
    if (vl) { vl.position.set(FX, 2.6, FZ); this.scene.add(vl); this._pulses.push({ pl: vl, base: 1.1, phase: 1.7 }); }

    if (!enclosure) return;

    // ── The enclosure ─────────────────────────────────────────────────────
    const woodcut2 = S.key === 'woodcut';
    const goldE = woodcut2 ? S.mat({ tone: 0.02 }) : S.mat({ color: 0xd9b25a, metalness: 0.95, roughness: 0.22 });
    const leafE = woodcut2 ? S.mat({ tone: 0.2 }) : S.mat({ color: 0x2e4a1c, roughness: 0.9 });
    const roseE = woodcut2 ? S.mat({ tone: 0.14 }) : S.mat({ color: 0xc84a5a, roughness: 0.6, emissive: 0x501018, emissiveIntensity: 0.2 });
    const roseE2 = woodcut2 ? S.mat({ tone: 0.1 }) : S.mat({ color: 0xe8a0b0, roughness: 0.6 });

    // The flowery mead: "at once meadow and garden," ringing the fountain
    const meadMat = woodcut2 ? S.mat({ tone: 0.12, rim: 0 }) : S.mat({ color: 0x2e4a1c, roughness: 0.95 });
    if (!woodcut2) this._dress(meadMat, this._surfaceTexture({ base: '#3f5a26', dark: '#22371a', light: '#6b8a3a', blobs: 70, speckle: 3600, repeat: 6 }), 0.15);
    this._m(new THREE.RingGeometry(4.3, 6.9, 40), meadMat, FX, 0.135, FZ, { rx: -Math.PI / 2, cast: false });
    const rnd2 = (i, k) => { const v = Math.sin(i * 61.7 + k * 199.5) * 43758.5453; return v - Math.floor(v); };
    for (let i = 0; i < 26; i++) {
      const a = rnd2(i, 1) * Math.PI * 2, r = 4.6 + rnd2(i, 2) * 2.1;
      this._m(new THREE.SphereGeometry(0.07, 6, 5), i % 3 ? roseE2 : (woodcut2 ? S.mat({ tone: -0.02 }) : S.mat({ color: 0xf0ead0, roughness: 0.6 })),
        FX + Math.cos(a) * r, 0.15, FZ + Math.sin(a) * r, { cast: false });
    }

    // The gold pergola carrying real roses: eight posts, a gold ring beam,
    // and the growth wound along it
    for (let i = 0; i < 8; i++) {
      const a = (i + 0.5) * Math.PI / 4;
      const px = FX + Math.cos(a) * 5.7, pz = FZ + Math.sin(a) * 5.7;
      this._m(new THREE.CylinderGeometry(0.07, 0.09, 2.5, 8), goldE, px, 1.25, pz, { outline: true });
      this._circleCol(px, pz, 0.35);
    }
    this._m(new THREE.TorusGeometry(5.7, 0.07, 8, 48), goldE, FX, 2.55, FZ, { rx: Math.PI / 2 });
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2;
      const gx = FX + Math.cos(a) * 5.7, gz = FZ + Math.sin(a) * 5.7;
      this._m(new THREE.SphereGeometry(0.2, 7, 6), leafE, gx, 2.55 + (i % 2 ? 0.14 : -0.12), gz, { cast: false });
      if (i % 2 === 0) this._m(new THREE.SphereGeometry(0.1, 6, 5), roseE, gx, 2.78, gz, { cast: false });
    }

    // The balustrade: arcs of book-matched sliced marble breaking at the
    // cardinals, a gold rail atop
    const zz = woodcut2 ? null : this._zigzagTexture();
    const balMat = woodcut2
      ? S.mat({ tone: 0.06 })
      : new THREE.MeshStandardMaterial({ map: zz, roughness: 0.35, side: THREE.DoubleSide });
    const gapB = 0.24;
    for (let q = 0; q < 4; q++) {
      const t0 = q * Math.PI / 2 + gapB, tl = Math.PI / 2 - 2 * gapB;
      this._m(new THREE.CylinderGeometry(7.0, 7.0, 0.72, 24, 1, true, Math.PI / 2 - (t0 + tl), tl), balMat, FX, 0.46, FZ, { cast: false });
    }
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const near = Math.min(...[0, 1, 2, 3].map(q => Math.abs(((a - q * Math.PI / 2 + Math.PI) % (Math.PI * 2)) - Math.PI)));
      if (near < 0.3) continue;
      const bx = FX + Math.cos(a) * 7.0, bz = FZ + Math.sin(a) * 7.0;
      this._m(new THREE.TorusGeometry(0.5, 0.045, 6, 10, Math.PI * 1.2), goldE, bx, 0.86, bz, { cast: false }).rotation.y = -a;
      this._circleCol(bx, bz, 0.7);
    }
  }

  // ── The Four Triumphs of Jupiter — floats ringing the grove ──────────────

  _buildTriumphs() {
    for (const t of TRIUMPHS) {
      const [x, z] = t.pos;
      const g = new THREE.Group();
      const chariot = this._triumphCar(t, 1.5);
      g.add(chariot);

      // The team: six beasts, coupled two and two, each ridden by a nymph
      // musician in her rank's livery
      for (let i = 0; i < 6; i++) {
        const sx = (i % 2 ? 1 : -1) * 0.72;
        const row = Math.floor(i / 2);                 // 0 = nearest the car
        const z = -2.5 - row * 1.75;
        if (t.onFoot) {
          // The rustic triumph walks: satyrs to one side, nymphs to the other,
          // no beasts and no riders. "satyrs, nymphs" is all the plate gives.
          const walker = (i % 2)
            ? this.cast.props.satyr(1.15)
            : this.cast.nymph({ robe: TRIUMPH_LIVERY[i], h: 0.92 });
          walker.position.set(sx * 1.15, 0, z);
          walker.rotation.y = Math.PI + (i % 2 ? 0.2 : -0.2);
          g.add(walker);
          this._npcs.push({ g: walker, phase: i * 0.8, baseY: 0, sway: 0.02 });
          continue;
        }
        const beast = this._triumphBeast(t.team);
        beast.position.set(sx, 0, z);
        g.add(beast);
        const rider = this.cast.nymph({ robe: TRIUMPH_LIVERY[i], h: 0.62 });
        const ry = t.team === 'elephant' ? 1.15 : 0.82;
        rider.position.set(sx, ry, z + 0.1);
        g.add(rider);
        // The livery is a rank and the rank carries an instrument (Dallington,
        // via PROCESSIONS.md §2): the two nearest the car in peacock blue bear
        // golden topaz CENSERS streaming fragrant smoke; the middle two in
        // crimson, gold TRUMPETS with silk banners fastened in three places;
        // the two foremost in emerald green, antique CORNETS. The liveries were
        // ranked correctly and the instruments were never built.
        const inst = this._riderInstrument(row, sx, ry, z, g);
        if (inst && row === 0) {
          // the censers actually smoke
          const stream = new ParticleStream({
            count: 18,
            source: new THREE.Vector3(x + sx, ry + 0.42, z + 0.28),
            target: new THREE.Vector3(x + sx * 1.2, ry + 1.5, z + 0.1),
            color: 0xd8c8a8, size: 0.035, speed: 0.22, arc: 0.35,
          });
          stream.opacity = 0.34; stream.active = true;
          this.style.tuneStream(stream);
          this.scene.add(stream.points);
          this._streams.push(stream);
        }
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
      else if (t.motif === 'fruit') {
        // Pomona's heaped orchard fruit, and the two deities standing over it.
        motif = new THREE.Group();
        const basket = this._m(new THREE.CylinderGeometry(0.44, 0.34, 0.3, 14, 1, true),
          this.style.mat({ color: 0x8a6a3a, roughness: 0.9 }), 0, 0.92, 0, { parent: motif });
        void basket;
        for (let k = 0; k < 16; k++) {
          const a = (k / 16) * Math.PI * 2, rr = 0.1 + (k % 4) * 0.09;
          this._m(new THREE.SphereGeometry(0.075, 8, 6),
            this.style.mat({ color: [0xc03a2a, 0xd88a20, 0x7a9a2a, 0xa8306a][k % 4], roughness: 0.55 }),
            Math.cos(a) * rr, 1.08 + (k % 3) * 0.05, Math.sin(a) * rr, { parent: motif, cast: false });
        }
        const pomona = this.cast.nymph({ name: 'Pomona', robe: 0xc8a83a, h: 0.85, pose: 'offer' });
        pomona.position.set(-0.42, 0.62, 0.15); g.add(pomona);
        const vert = this.cast.figure({ h: 0.9, robe: 0x6a8a3a, pose: 'reach' });
        vert.position.set(0.42, 0.62, 0.15); g.add(vert);
      }
      else { motif = this.cast.props.fire(1.2); motif.position.y = 0.75; const f = this.cast.figure({ h: 0.7, robe: 0xc86a50 }); f.position.set(0, 0.9, 0.5); g.add(f); }
      g.add(motif);

      // "Festival of Bacchus with Silenus on ass" — the plate names him
      // (woodcut_catalog #65), and he rides behind the car, not on it.
      if (t.key === 'bacchus') {
        const ass = this.cast.animals.horse(0.82);
        ass.position.set(1.4, 0, 1.9);
        ass.rotation.y = -0.25;
        g.add(ass);
        const silenus = this.cast.figure({ h: 0.72, robe: 0x7a5a3a, pose: 'offer', beard: true });
        silenus.position.set(1.4, 0.72, 1.95);
        silenus.rotation.y = -0.25;
        g.add(silenus);
      }

      const lbl = this.cast.label(t.title, { sub: t.key === 'bacchus' ? 'FESTVM' : 'TRIUMPHUS' });
      lbl.position.set(0, 3.4, 0);
      g.add(lbl);

      g.position.set(x, 0, z);
      this.scene.add(g);
      // The processions PROCESS now — the second-largest block of images in
      // the 1499 was parked here for a year (PROCESSIONS.md §1). Each car
      // circuits the grove; a live circle collider travels with it so the
      // walk stays honest around a moving thing.
      const cx = 0, czz = -20;
      const orbitR = 14.2;    // clears the grove cypresses inside and the shore outside
      const theta = Math.atan2(z - czz, x - cx);
      const col = { x, z, r: 2.3 };
      this.walker.colliders.push(col);
      this._floats.push({ g, wheels: [], phase: Math.random() * 6,
        orbit: { cx, cz: czz, r: orbitR, theta, om: 0.032 }, col });
    }
  }

  // The three instruments of the riders' ranks. Small props, but they are what
  // turns six identical nymphs into a ranked musical procession — and the book
  // is emphatic that the triumph is *heard* before it is seen.
  _riderInstrument(row, sx, ry, z, parent) {
    const S = this.style;
    const gold = S.key === 'woodcut'
      ? S.mat({ tone: 0.02 })
      : S.mat({ color: 0xd8b24a, metalness: 0.9, roughness: 0.26 });
    const hx = sx + (sx > 0 ? 0.16 : -0.16), hy = ry + 0.34, hz = z + 0.26;

    if (row === 0) {
      // a censer on three chains, swinging from the hand
      const bowl = this._m(new THREE.SphereGeometry(0.075, 10, 8, 0, Math.PI * 2, 0, Math.PI / 1.7),
        gold, hx, hy - 0.2, hz, { parent });
      bowl.rotation.x = Math.PI;
      this._m(new THREE.TorusGeometry(0.072, 0.012, 6, 14), gold, hx, hy - 0.14, hz,
        { parent, rx: Math.PI / 2 });
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2;
        this._m(new THREE.CylinderGeometry(0.005, 0.005, 0.2, 4), gold,
          hx + Math.cos(a) * 0.06, hy - 0.05, hz + Math.sin(a) * 0.06, { parent, cast: false });
      }
      return true;
    }
    if (row === 1) {
      // a long gold trumpet, with the silk banner fastened along it in three places
      const tr = this._m(new THREE.CylinderGeometry(0.018, 0.045, 0.72, 8), gold, hx, hy, hz + 0.3, { parent });
      tr.rotation.x = Math.PI / 2.1;
      const banner = S.key === 'woodcut'
        ? S.mat({ tone: 0.12, side: THREE.DoubleSide })
        : S.mat({ color: 0xa8324a, roughness: 0.9, side: THREE.DoubleSide });
      const bn = this._m(new THREE.PlaneGeometry(0.2, 0.24), banner, hx + 0.11, hy - 0.1, hz + 0.34,
        { parent, cast: false });
      bn.rotation.set(0.2, 0.35, 0.1);
      for (let k = 0; k < 3; k++) {                       // fastened in three places
        this._m(new THREE.TorusGeometry(0.026, 0.006, 5, 10), gold,
          hx, hy + 0.02 - k * 0.02, hz + 0.16 + k * 0.16, { parent, rx: Math.PI / 2.1, cast: false });
      }
      return true;
    }
    // an antique cornet — short, curved, held up
    const co = this._m(new THREE.TorusGeometry(0.13, 0.022, 6, 14, Math.PI * 0.8), gold,
      hx, hy + 0.06, hz + 0.1, { parent });
    co.rotation.set(Math.PI / 2.4, 0.3, 0.4);
    this._m(new THREE.ConeGeometry(0.05, 0.09, 8), gold, hx + 0.1, hy + 0.18, hz + 0.14,
      { parent, rx: -0.8 });
    return true;
  }

  // ── The triumphal car ────────────────────────────────────────────────────
  //
  // The book does not give these cars a cart. Chapter XVII (PROCESSIONS.md §2)
  // specifies: four wheels of Scythian emerald; a body of table diamonds set in
  // fine gold, two perfect squares in plan; four INVERTED CORNUCOPIAS at the
  // corners, mouths up, spilling fruit and flowers cut from precious stones; a
  // HARPY'S FOOT at each corner of the plinth with acanthus; a FIVE-LEAVED ROSE
  // where each axle ends; and axles of solid gold.
  //
  // And the sides argue. "The reliefs argue" — the panels are not ornament, they
  // state the car's thesis. Europa's hindmost panel carries Mars before Jupiter
  // showing the wound in his impenetrable breastplate and holding the word
  // NEMO: no one is exempt. That is the sentence the whole procession is making.
  _triumphCar(t, s = 1.5) {
    const S = this.style;
    const woodcut = S.key === 'woodcut';
    const g = new THREE.Group();
    const body = woodcut ? S.mat({ tone: 0.04 })
                         : S.mat({ color: t.color, roughness: 0.5, metalness: 0.45 });
    const gold = woodcut ? S.mat({ tone: 0.02 })
                         : S.mat({ color: 0xd8b24a, metalness: 0.95, roughness: 0.2 });
    const emerald = woodcut ? S.mat({ tone: 0.1 })
                            : S.mat({ color: 0x0d7548, roughness: 0.24, metalness: 0.35,
                                      emissive: 0x06301d, emissiveIntensity: 0.35 });

    const W = 1.3 * s, L = 2.0 * s, PY = 0.5 * s;
    // plinth and deck
    this._m(new THREE.BoxGeometry(W, 0.18 * s, L), body, 0, PY, 0, { parent: g, outline: true });
    this._m(new THREE.BoxGeometry(W * 1.06, 0.06 * s, L * 1.04), gold, 0, PY + 0.12 * s, 0, { parent: g, cast: false });

    // the four relief panels — the car's own argument, one to a face
    const P = TRIUMPH_RELIEFS[t.key] || [];
    const faces = [
      { x: -W / 2 - 0.012, z: 0, ry: -Math.PI / 2, w: L * 0.86, h: 0.30 * s },
      { x:  W / 2 + 0.012, z: 0, ry:  Math.PI / 2, w: L * 0.86, h: 0.30 * s },
      { x: 0, z:  L / 2 + 0.012, ry: 0,            w: W * 0.84, h: 0.30 * s },
      { x: 0, z: -L / 2 - 0.012, ry: Math.PI,      w: W * 0.84, h: 0.30 * s },
    ];
    faces.forEach((f, i) => {
      const panel = P[i];
      if (!panel) return;
      const tex = this._reliefTexture(panel.scene, panel.word || null);
      const mat = S.mat({ color: 0xffffff, roughness: 0.86, metalness: 0.04 });
      mat.map = tex; mat.bumpMap = tex; mat.bumpScale = 0.04;
      this._disp.push(mat);
      this._m(new THREE.PlaneGeometry(f.w, f.h), mat, f.x, PY + 0.02 * s, f.z,
        { parent: g, ry: f.ry, cast: false });
    });

    // four inverted cornucopias at the corners, mouths up, spilling stones
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const cx = sx * (W / 2 - 0.06 * s), cz = sz * (L / 2 - 0.06 * s);
      const horn = this._m(new THREE.ConeGeometry(0.11 * s, 0.42 * s, 9, 1, true), gold,
        cx, PY + 0.30 * s, cz, { parent: g });
      horn.rotation.set(sx * 0.16, 0, sz * 0.16);
      // the fruit and flowers, cut from precious stones
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        this._m(new THREE.SphereGeometry(0.035 * s, 7, 6),
          k % 2 ? emerald : S.mat({ color: 0xc0304a, roughness: 0.3, metalness: 0.3 }),
          cx + Math.cos(a) * 0.07 * s, PY + 0.50 * s + (k % 3) * 0.03 * s, cz + Math.sin(a) * 0.07 * s,
          { parent: g, cast: false });
      }
      // a harpy's foot at each corner of the plinth, with acanthus above it
      this._m(new THREE.CylinderGeometry(0.028 * s, 0.05 * s, 0.16 * s, 6), gold,
        cx, PY - 0.14 * s, cz, { parent: g });
      for (let k = 0; k < 3; k++) {                       // the talons
        const a = -0.5 + k * 0.5;
        this._m(new THREE.ConeGeometry(0.018 * s, 0.07 * s, 5), gold,
          cx + Math.cos(a) * 0.045 * s, PY - 0.23 * s, cz + Math.sin(a) * 0.045 * s,
          { parent: g, rx: 1.5, cast: false });
      }
      const ac = this._m(new THREE.ConeGeometry(0.055 * s, 0.1 * s, 6), gold,
        cx, PY - 0.04 * s, cz, { parent: g, cast: false });
      ac.rotation.x = Math.PI;
    }

    // wheels of Scythian emerald on solid gold axles, a five-leaved rose at each end
    for (const sz of [-1, 1]) {
      this._m(new THREE.CylinderGeometry(0.028 * s, 0.028 * s, W * 1.22, 8), gold,
        0, 0.34 * s, sz * 0.7 * s, { parent: g, rz: Math.PI / 2 });
      for (const sx of [-1, 1]) {
        const wx = sx * 0.72 * s;
        const wheel = this._m(new THREE.TorusGeometry(0.33 * s, 0.055 * s, 8, 22), emerald,
          wx, 0.34 * s, sz * 0.7 * s, { parent: g, ry: Math.PI / 2, outline: true });
        void wheel;
        for (let k = 0; k < 8; k++) {                     // spokes
          const a = (k / 8) * Math.PI;
          this._m(new THREE.CylinderGeometry(0.016 * s, 0.016 * s, 0.62 * s, 5), gold,
            wx, 0.34 * s, sz * 0.7 * s, { parent: g, ry: Math.PI / 2, rx: a, cast: false });
        }
        this._m(new THREE.CylinderGeometry(0.07 * s, 0.07 * s, 0.06 * s, 10), gold,
          wx + sx * 0.03 * s, 0.34 * s, sz * 0.7 * s, { parent: g, rz: Math.PI / 2 });
        // the five-leaved rose where the axle ends
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * Math.PI * 2;
          const pet = this._m(new THREE.SphereGeometry(0.032 * s, 7, 5), gold,
            wx + sx * 0.065 * s, 0.34 * s + Math.sin(a) * 0.055 * s,
            sz * 0.7 * s + Math.cos(a) * 0.055 * s, { parent: g, cast: false });
          pet.scale.set(0.5, 1, 1);
        }
      }
    }
    return g;
  }

  // ── Folio 80: the Graces, the harpies and the griffins ───────────────────
  //
  // The station called "Fountain of Venus" is folio 80, and the plate at that
  // folio is not the gem-columned fountain of chapter XXIII at all —
  // woodcut_catalog #23 calls it "Third fountain with Graces, harpies,
  // griffins". Those three were named in the catalogue and modelled nowhere.
  //
  // The two fountains are already distinguished in code by `enclosure`: the
  // Cythera one (enclosed) keeps the pure chapter-XXIII programme of seven
  // stones and the crystal cupola; the mainland grove is the folio-80 fountain
  // and gets its own company.
  _buildFolio80Company(FX, FZ, R, KERB) {
    const S = this.style;
    const woodcut = S.key === 'woodcut';
    const stone = woodcut ? S.mat({ tone: 0.05 })
                          : S.mat({ color: 0xd8cdb4, roughness: 0.78 });
    const gold = woodcut ? S.mat({ tone: 0.02 })
                         : S.mat({ color: 0xc9a244, metalness: 0.85, roughness: 0.3 });

    // THE THREE GRACES, standing together off the kerb as they always stand —
    // linked, one turned away. When the painted-figure variant is on these are
    // literally Botticelli's Graces, cut from the Primavera that is already in
    // the project's gallery, which is the same three women this plate means.
    const GR = ['Aglaia', 'Euphrosyne', 'Thalia'];
    GR.forEach((name, i) => {
      const a = Math.PI * 0.5 + (i - 1) * 0.30;
      const gx = FX + Math.cos(a) * (R + 2.5), gz = FZ + Math.sin(a) * (R + 2.5);
      const fig = this.cast.nymph({ name, robe: [0xe6dcc4, 0xd8c8b0, 0xe0d0bc][i], h: 0.98 });
      this._npc('grace_' + i, fig, gx, gz, -a + Math.PI, { label: name, sub: 'A GRACE', labelY: 2.0 });
    });

    // THE FOUR HARPIES — bird-bodied women, perched on the kerb's angles,
    // facing outward. The book's harpy feet are already on the triumphal cars;
    // here they are whole.
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + i * (Math.PI / 2);
      const hx = FX + Math.cos(a) * (R + 0.72), hz = FZ + Math.sin(a) * (R + 0.72);
      const h = new THREE.Group();
      h.position.set(hx, KERB + 0.04, hz);
      h.rotation.y = -a + Math.PI / 2;
      this.scene.add(h);
      const body = this._m(new THREE.SphereGeometry(0.2, 12, 9), stone, 0, 0.2, 0, { parent: h });
      body.scale.set(0.8, 1.15, 0.9);
      this._m(new THREE.CylinderGeometry(0.05, 0.065, 0.1, 8), stone, 0, 0.4, 0, { parent: h });
      this._m(new THREE.SphereGeometry(0.1, 12, 9), stone, 0, 0.5, 0, { parent: h });   // a woman's head
      for (const sx of [-1, 1]) {                                   // the wings
        const w = this._m(new THREE.SphereGeometry(0.24, 10, 7, 0, Math.PI), stone,
          sx * 0.17, 0.26, -0.05, { parent: h, cast: false });
        w.scale.set(0.9, 1.0, 0.16);
        w.rotation.set(0.2, sx * 0.5, sx * 0.55);
        // the talons
        this._m(new THREE.ConeGeometry(0.03, 0.1, 5), gold, sx * 0.07, 0.02, 0.04,
          { parent: h, rx: 2.7, cast: false });
      }
      this._m(new THREE.ConeGeometry(0.07, 0.2, 7), stone, 0, 0.14, 0.16, { parent: h, rx: 1.1 });
      this._npcs.push({ g: h, phase: i * 1.3, baseY: 0, sway: 0.01 });
    }

    // THE TWO GRIFFINS, flanking the approach — eagle before, lion behind.
    for (const sx of [-1, 1]) {
      const g = new THREE.Group();
      g.position.set(FX + sx * (R + 2.0), 0, FZ + R + 1.6);
      g.rotation.y = -sx * 0.5;
      this.scene.add(g);
      const lion = this.cast.animals.lion(1.05);
      lion.traverse(o => { if (o.isMesh && o.material?.color) o.material = stone; });
      g.add(lion);
      // the eagle's head and beak, and the raised wings
      const head = this._m(new THREE.SphereGeometry(0.19, 12, 9), stone, 0, 0.95, -0.52, { parent: g });
      head.scale.set(0.9, 1.0, 1.05);
      this._m(new THREE.ConeGeometry(0.075, 0.24, 7), gold, 0, 0.92, -0.70, { parent: g, rx: -1.35 });
      for (const wx of [-1, 1]) {
        const w = this._m(new THREE.SphereGeometry(0.4, 10, 8, 0, Math.PI), stone,
          wx * 0.26, 0.86, 0.06, { parent: g, cast: false });
        w.scale.set(0.85, 1.05, 0.14);
        w.rotation.set(-0.35, wx * 0.6, wx * 0.75);
      }
      this._circleCol(FX + sx * (R + 2.0), FZ + R + 1.6, 0.6);
      this._npcs.push({ g, phase: sx > 0 ? 0.4 : 2.1, baseY: 0, sway: 0.008 });
    }

    this._plaque({ main: 'ΧΑΡΙΤΕΣ', sub: 'THE GRACES · WITH HARPIES AND GRIFFINS' },
      1.5, 0.3, FX, KERB * 0.62, FZ - R - 0.62, Math.PI, true);
  }

  // A carved relief panel: stone ground, a bead border, the scene's figures in
  // low relief, and — where the book gives one — the word cut into it.
  //
  // Relief is drawn, not lit: each shape is painted once dark and offset down,
  // then once light and offset up, which is how a chiselled edge catches the
  // sun. The figures are silhouettes, because that is what low relief is.
  _reliefTexture(scene, word) {
    this._reliefs = this._reliefs || {};
    const key = scene + '|' + (word || '');
    if (this._reliefs[key]) return this._reliefs[key];
    const W = 512, H = 192;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');
    x.fillStyle = '#b9ae99'; x.fillRect(0, 0, W, H);
    const ink = '#6a5f4f', lit = '#e8dfc9';
    const carve = (draw) => {
      x.save(); x.translate(0, 2.0); x.fillStyle = ink; x.strokeStyle = ink; draw(); x.restore();
      x.save(); x.translate(0, -1.4); x.fillStyle = lit; x.strokeStyle = lit; draw(); x.restore();
    };

    // bead-and-reel border
    carve(() => {
      x.lineWidth = 5;
      x.strokeRect(9, 9, W - 18, H - 18);
      for (let i = 0; i < 30; i++) {
        const bx = 16 + i * ((W - 32) / 29);
        x.beginPath(); x.arc(bx, 15, 3.2, 0, 7); x.fill();
        x.beginPath(); x.arc(bx, H - 15, 3.2, 0, 7); x.fill();
      }
    });

    // a rough seeded crowd of relief figures for the scene
    const rnd = (i, k) => { const v = Math.sin(i * 61.7 + k * 137.3 + scene.length * 7.1) * 43758.5453; return v - Math.floor(v); };
    const N = word ? 3 : 5;
    carve(() => {
      for (let i = 0; i < N; i++) {
        const fx = 70 + i * ((W - 190) / Math.max(1, N - 1));
        const fh = 92 + rnd(i, 1) * 20;
        const fy = H / 2 + 26;
        // body
        x.beginPath();
        x.moveTo(fx - 13, fy);
        x.quadraticCurveTo(fx - 16, fy - fh * 0.55, fx - 8, fy - fh * 0.72);
        x.lineTo(fx + 8, fy - fh * 0.72);
        x.quadraticCurveTo(fx + 16, fy - fh * 0.55, fx + 13, fy);
        x.closePath(); x.fill();
        // head
        x.beginPath(); x.arc(fx, fy - fh * 0.82, 10, 0, 7); x.fill();
        // an arm, thrown differently per figure
        x.lineWidth = 7; x.lineCap = 'round';
        const up = rnd(i, 2) > 0.5;
        x.beginPath();
        x.moveTo(fx + 9, fy - fh * 0.62);
        x.lineTo(fx + 24, fy - fh * (up ? 0.88 : 0.34));
        x.stroke();
      }
    });

    // the word, cut into the ground
    if (word) {
      x.font = 'bold 62px Georgia, serif';
      x.textAlign = 'center'; x.textBaseline = 'middle';
      carve(() => { x.fillText(word, W - 108, H / 2); });
    }

    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    this._disp.push(t);
    this._reliefs[key] = t;
    return t;
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
    if (kind === 'unicorn') {
      // Danaë's team. The cast has a real unicorn; without this branch the
      // fall-through below would quietly render the correction as a plain horse.
      const g = this.cast.animals.unicorn(0.95);
      g.traverse(o => {
        if (o.isMesh && o.material?.color) o.material = S.mat({ color: 0xf0ece0, roughness: 0.62 });
      });
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
    if (kind === 'satyr') return this.cast.props.satyr(1.15);   // walks, never drawn
    console.warn('[triumph] no beast built for team "' + kind + '" — falling back to a horse');
    return this.cast.animals.horse(0.95);
  }

  // ── The Polyandrion — the ruined temple of the dead ───────────────────────
  //
  // Chapter XIX, the longest in the untranslated range, and 27 of the book's
  // woodcuts: the ruin by the shore where Poliphilo does the thing he is
  // actually for — reading monuments. A broken temple front, fallen drums, a
  // half-buried colossus, sarcophagi, and the obelisk of Caesar carrying the
  // book's best hieroglyph: the ant that grows into an elephant and the
  // elephant that dwindles into an ant — concord and discord as one
  // reversible creature (Curran; ARCHITECTURE.md §4). The pair animates.
  _buildPolyandrion() {
    const S = this.style;
    const woodcut = S.key === 'woodcut';
    const PX = 30, PZ = -27;

    // a ruin floor of cracked paving, half-lost in the grass
    const ruinMat = woodcut ? S.mat({ tone: 0.05, rim: 0 }) : S.mat({ color: 0x9a8a6a, roughness: 0.95 });
    if (!woodcut) this._dress(ruinMat, this._surfaceTexture({ base: '#9a8a6a', dark: '#4a3e28', light: '#cfc0a0', veins: 8, courses: 3, repeat: 4 }), 0.35);
    this._m(new THREE.CircleGeometry(9, 24), ruinMat, PX, 0.03, PZ, { rx: -Math.PI / 2, cast: false });

    // the temple front: two whole columns, two broken, a surviving architrave
    const cols = [[-3.2, 3.4, false], [-1.1, 3.4, false], [1.1, 1.6, true], [3.2, 2.3, true]];
    for (const [dx, hgt, broken] of cols) {
      this._m(new THREE.BoxGeometry(0.7, 0.22, 0.7), this._stoneMat, PX + dx, 0.11, PZ - 3.4);
      this._m(new THREE.CylinderGeometry(0.24, 0.3, hgt, 12), this._stoneMat, PX + dx, 0.22 + hgt / 2, PZ - 3.4, { outline: true });
      if (!broken) this._m(new THREE.BoxGeometry(0.66, 0.26, 0.66), this._stoneMat, PX + dx, 0.35 + hgt, PZ - 3.4);
      this._circleCol(PX + dx, PZ - 3.4, 0.5);
    }
    this._m(new THREE.BoxGeometry(2.9, 0.5, 0.8), this._stoneMat, PX - 2.15, 3.95, PZ - 3.4, { outline: true });
    // the fallen pediment fragment, face down in the grass
    const ped = this._m(new THREE.CylinderGeometry(1.5, 1.5, 0.4, 3), this._stoneMat, PX + 3.6, 0.3, PZ - 1.2, { outline: true });
    ped.rotation.z = Math.PI / 2; ped.rotation.x = 0.3;
    this._circleCol(PX + 3.6, PZ - 1.2, 1.4);

    // fallen drums, scattered as the quake left them
    for (const [dx, dz, ry] of [[-4.2, 0.8, 0.4], [-2.6, 1.9, 1.9], [0.4, 2.6, 1.1]]) {
      const drum = this._m(new THREE.CylinderGeometry(0.28, 0.28, 1.1, 12), this._stoneMat, PX + dx, 0.28, PZ + dz);
      drum.rotation.z = Math.PI / 2; drum.rotation.y = ry;
      this._circleCol(PX + dx, PZ + dz, 0.7);
    }

    // the half-buried colossus: a great head risen out of the ground, tilted,
    // its features worn to suggestion — the fragment as portrait
    const head = this._m(new THREE.SphereGeometry(1.15, 20, 16),
      woodcut ? S.mat({ tone: 0.08 }) : S.mat({ color: 0xb0a284, roughness: 0.85 }),
      PX - 4.6, 0.15, PZ - 0.6, { outline: true });
    head.rotation.y = 2.4; head.rotation.z = 0.25;
    const brow = this._m(new THREE.BoxGeometry(0.9, 0.12, 0.3), this._darkStoneMat, PX - 4.6, 0.75, PZ - 1.4, { cast: false });
    brow.rotation.z = 0.2;
    this._circleCol(PX - 4.6, PZ - 0.6, 1.3);

    // sarcophagi, and the open grave
    for (const [dx, dz, ry] of [[1.6, 0.6, 0.15], [3.4, 2.4, -0.5]]) {
      this._m(new THREE.BoxGeometry(1.7, 0.7, 0.85), this._stoneMat, PX + dx, 0.35, PZ + dz, { ry, outline: true });
      const lid = this._m(new THREE.BoxGeometry(1.8, 0.2, 0.95), this._darkStoneMat, PX + dx + 0.35, 0.78, PZ + dz, { ry: ry + 0.1 });
      lid.rotation.z = 0.06;
      this._wallCol(PX + dx - 1, PX + dx + 1, PZ + dz - 0.6, PZ + dz + 0.6);
    }
    const grave = this.cast.props.grave(1.1);
    grave.position.set(PX - 1.4, 0.04, PZ + 4.2);
    grave.rotation.y = 0.3;
    this.scene.add(grave);
    this._plaque({ main: 'D · M', sub: 'DIS MANIBVS · TO THE SHADES OF THE DEAD' },
      0.8, 0.3, PX + 1.6, 1.05, PZ + 1.15, 0.15, true);

    // the obelisk of Caesar, with both its inscriptions
    this._m(new THREE.BoxGeometry(1.6, 0.8, 1.6), this._stoneMat, PX, 0.4, PZ + 6.5, { outline: true });
    this._m(new THREE.CylinderGeometry(0.1, 0.42, 4.4, 4), this._stoneMat, PX, 3.0, PZ + 6.5, { outline: true });
    this._circleCol(PX, PZ + 6.5, 1.1);
    this._plaque({ main: 'DIVO IVLIO CAESARI SEMP. AVG.', sub: 'THE EGYPTIANS RAISED THIS TO CAESAR, GOVERNOR OF THE WHOLE WORLD' },
      1.9, 0.42, PX, 1.15, PZ + 7.35, Math.PI, true);
    this._plaque({ main: 'PACE AC CONCORDIA PARVAE RES CRESCVNT', sub: 'DISCORDIA MAXIMAE DECRESCVNT' },
      2.0, 0.42, PX - 0.85, 1.15, PZ + 6.5, -Math.PI / 2, true);

    // the ant and the elephant, one reversible creature: as concord waxes the
    // ant grows to an elephant; as discord waxes the elephant dwindles to an
    // ant. The two trade sizes in a slow breath.
    const hieroM = woodcut ? S.mat({ tone: 0.22 }) : S.mat({ color: 0x4a3e2c, roughness: 0.8 });
    const ant = new THREE.Group();
    for (const [oy, r] of [[0.05, 0.05], [0.13, 0.065], [0.22, 0.05]]) {
      const seg = new THREE.Mesh(new THREE.SphereGeometry(r, 7, 5), hieroM);
      seg.position.set(0, oy, 0);
      ant.add(seg);
    }
    ant.position.set(PX + 0.55, 1.7, PZ + 6.5);
    this.scene.add(ant);
    const eleG = new THREE.Group();
    const eb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), hieroM); eb.scale.set(1.3, 1, 1); eleG.add(eb);
    const eh = new THREE.Mesh(new THREE.SphereGeometry(0.09, 7, 5), hieroM); eh.position.set(-0.2, 0.06, 0); eleG.add(eh);
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.18, 5), hieroM); tr.position.set(-0.3, -0.04, 0); tr.rotation.z = 0.7; eleG.add(tr);
    for (const lx of [-0.08, 0.08]) {
      const lg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.16, 5), hieroM); lg.position.set(lx, -0.16, 0); eleG.add(lg);
    }
    eleG.position.set(PX + 0.55, 2.4, PZ + 6.5);
    this.scene.add(eleG);
    this._hiero = { ant, ele: eleG };
  }

  // ── The shore, Cupid's boat, and distant Cythera ──────────────────────────

  _buildCythera() {
    const S = this.style;
    // The sea now runs all the way to the island (its material breathes in update)
    const sea = this._m(new THREE.PlaneGeometry(170, 185), S.waterMat(), 0, 0.03, -126, { rx: -Math.PI / 2, cast: false });
    if (sea.material.transparent) this._sea = { mat: sea.material, base: sea.material.opacity };
    // Sand strip
    const sandMat = S.key === 'woodcut' ? S.mat({ tone: 0.02, rim: 0 }) : S.mat({ color: 0x9a8a64, roughness: 0.95 });
    this._m(new THREE.PlaneGeometry(130, 4.5), sandMat, 0, 0.05, -35.5, { rx: -Math.PI / 2, cast: false });

    // Pier out over the water
    for (let i = 0; i < 4; i++) {
      this._m(new THREE.BoxGeometry(2.2, 0.12, 1.6), this._trunkMat, 0, 0.22, -38.2 - i * 1.7);
      for (const s of [-1, 1]) this._m(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 6), this._trunkMat, s * 0.95, 0.05, -38.2 - i * 1.7);
    }
    // Sea rails: the crossing is Cupid's to make, not the walker's. Everything
    // seaward of the shore is fenced; the island keeps its own coast.
    this._wallCol(-58, -1.2, -37, -96);
    this._wallCol(1.2, 58, -37, -96);
    this._wallCol(-2, 2, -44.6, -96);
    // How to sail (digit 0 → the island; 9 returns)
    this._plaque({ main: 'AD CYTHERAM', sub: 'PRESS 0 — CUPID FERRIES THE WILLING' },
      1.7, 0.42, 1.6, 1.15, -41.5, Math.PI * 0.06, true);

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

    // (The old distant-isle mock stood here at z = -58. The real island is now
    // built by _buildCytheraIsle at z = -150, hazed by the same fog that used
    // to stand in for it.)
  }

  // ── The Island of Cythera ─────────────────────────────────────────────────
  //
  // Built from Segre's reconstruction of the book's plan (GARDENS.md §5): a
  // perfect circle cut by radial roads converging on the theatre of Venus at
  // the centre, in three concentric claustri — the bosco of tree plantations,
  // the prati of flowery lawns and fruit trees, and, across the river, the
  // terraced inner gardens with their knot beds rising toward the theatre.
  // The terracing breaks at the four crossroads, "marked by ornate gates and
  // used for the passage of triumphal chariots" — which is why a walker can
  // reach the fountain at grade. Planting inverts the usual logic: tallest
  // trees at the rim, lowest beds at the centre, wild to tame going inward.
  _buildCytheraIsle() {
    const S = this.style;
    const lit = S.key !== 'woodcut';
    const CX = 0, CZ = -150, R = 50;
    const pos = (a, r) => [CX + Math.cos(a) * r, CZ + Math.sin(a) * r];
    const STEP = Math.PI / 6;                       // twelve radial roads
    const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };

    // Sand rim and sward
    const sandMat = lit ? S.mat({ color: 0x9a8a64, roughness: 0.95 }) : S.mat({ tone: 0.02, rim: 0 });
    this._m(new THREE.CircleGeometry(R + 2.6, 56), sandMat, CX, 0.05, CZ, { rx: -Math.PI / 2, cast: false });
    const swardMat = lit ? S.mat({ color: 0x223014, roughness: 0.98 }) : S.mat({ tone: 0.10, rim: 0 });
    if (lit) this._dress(swardMat, this._surfaceTexture({ base: '#3a5423', dark: '#1c3010', light: '#5c7e36', blobs: 80, speckle: 4200, repeat: 20 }), 0.15);
    this._m(new THREE.CircleGeometry(R, 56), swardMat, CX, 0.07, CZ, { rx: -Math.PI / 2, cast: false });

    // The coast: a ring of colliders keeps the walk on the island
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      const [x, z] = pos(a, 54);
      this._circleCol(x, z, 4.6);
    }

    // Radial roads. The four cardinals run all the way in (and bridge the
    // river); the other eight stop at the river's outer bank.
    const isleTrack = lit ? S.mat({ color: 0x6a5a40, roughness: 0.92 }) : S.mat({ tone: 0.03, rim: 0 });
    if (lit) this._dress(isleTrack, this._surfaceTexture({ base: '#8a7550', dark: '#4a3a20', light: '#b8a074', blobs: 54, speckle: 3800, repeat: 8 }), 0.3);
    for (let k = 0; k < 12; k++) {
      const a = k * STEP, cardinal = k % 3 === 0;
      const r0 = cardinal ? 7.6 : 22.2, r1 = 49;
      const [x, z] = pos(a, (r0 + r1) / 2);
      this._m(new THREE.PlaneGeometry(2.6, r1 - r0), isleTrack, x, 0.09, z,
        { rx: -Math.PI / 2, rz: -a - Math.PI / 2, cast: false });
    }

    // ── Outer claustro: the bosco ─────────────────────────────────────────
    // Twelve wedge plantations, each one kind of tree, with the cypress
    // enclosure at the rim.
    for (let k = 0; k < 12; k++) {
      const a0 = k * STEP;
      const kind = k % 2 ? 'broad' : 'cypress';
      for (let t = 0; t < 5; t++) {
        const a = a0 + (0.14 + rnd(k * 7 + t, 1) * 0.72) * STEP;
        const r = 37 + rnd(k * 7 + t, 2) * 9.5;
        const [x, z] = pos(a, r);
        const tree = this.cast.props.tree(kind, 0.9 + rnd(k * 7 + t, 3) * 0.5);
        tree.position.set(x, 0.07, z);
        tree.rotation.y = rnd(k * 7 + t, 4) * Math.PI;
        this.scene.add(tree);
        this._circleCol(x, z, 0.5);
      }
      // one enclosure cypress at mid-wedge, on the rim
      const [ex, ez] = pos(a0 + STEP / 2, 48.2);
      const cy = this.cast.props.tree('cypress', 1.25);
      cy.position.set(ex, 0.07, ez);
      this.scene.add(cy);
      this._circleCol(ex, ez, 0.55);
    }

    // ── Middle claustro: the prati ────────────────────────────────────────
    // Flowery lawns, each with a fountain or a topiary at its centre and
    // fruit trees about it; bounded inside by the bitter-orange espalier.
    // (chords short enough to leave every radial road its full 2.6 u of way)
    for (let i = 0; i < 24; i++) {
      const a = (i + 0.5) * (Math.PI / 12);
      const [x, z] = pos(a, 34.2);
      this._m(new THREE.BoxGeometry(6.2, 1.05, 0.5), this._hedgeMat, x, 0.55, z, { ry: -a + Math.PI / 2 });
      this._circleCol(x, z, 2.2);
      for (const s of [-1.9, 0, 1.9]) {
        const [ox, oz] = pos(a + s / 34.2, 34.2);
        this._m(new THREE.SphereGeometry(0.14, 8, 6),
          lit ? S.mat({ color: 0xd8842a, roughness: 0.5 }) : S.mat({ tone: 0.06 }),
          ox, 1.22, oz, { cast: false });
      }
    }
    for (let k = 0; k < 12; k++) {
      const am = k * STEP + STEP / 2;
      const [cx, cz] = pos(am, 27.5);
      if (k % 2 === 0) {
        // topiary: the clipped work the book says is trimmed every day
        this._m(new THREE.CylinderGeometry(0.09, 0.13, 0.95, 8), this._trunkMat, cx, 0.55, cz);
        this._m(new THREE.SphereGeometry(0.6, 12, 10), this._leafMat, cx, 1.35, cz, { outline: true });
        this._m(new THREE.SphereGeometry(0.32, 10, 8), this._leafMat, cx, 2.1, cz, { outline: true });
      } else {
        const pool = this.cast.props.pool(1.0);
        pool.position.set(cx, 0.07, cz);
        this.scene.add(pool);
      }
      this._circleCol(cx, cz, 1.1);
      for (const [da, rr] of [[-0.11, 25], [0.11, 30.4]]) {
        const [tx, tz] = pos(am + da, rr);
        const ft = this.cast.props.tree('broad', 0.75);
        ft.position.set(tx, 0.07, tz);
        this.scene.add(ft);
        this._circleCol(tx, tz, 0.45);
      }
    }

    // ── The river, its banks, its bridges, and the citrus pergola ─────────
    const riverMat = S.waterMat();
    if (lit) { riverMat.color.set(0xffffff); riverMat.map = this._waterTexture(); }
    this._waters.push({
      m: this._m(new THREE.RingGeometry(19, 21.6, 48), riverMat, CX, 0.08, CZ, { rx: -Math.PI / 2, cast: false }),
      rate: 0.02,
    });
    for (const r of [19, 21.6]) {
      this._m(new THREE.TorusGeometry(r, 0.13, 8, 48), this._stoneMat, CX, 0.12, CZ, { rx: Math.PI / 2, cast: false });
    }
    // keep the walk out of the water, except at the bridges
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      const near = Math.min(...[0, 1, 2, 3].map(q => Math.abs(((a - q * Math.PI / 2 + Math.PI) % (Math.PI * 2)) - Math.PI)));
      if (near < 0.22) continue;
      const [x, z] = pos(a, 20.3);
      this._circleCol(x, z, 1.5);
    }
    for (let q = 0; q < 4; q++) {
      const a = q * Math.PI / 2;
      const [x, z] = pos(a, 20.3);
      this._m(new THREE.BoxGeometry(2.8, 0.16, 3.6), this._stoneMat, x, 0.2, z, { ry: Math.PI / 2 - a });
    }
    // citrus pergola arching the river — trained trees as architecture
    const citrusLeaf = lit ? S.mat({ color: 0x2a4a1c, roughness: 0.9 }) : S.mat({ tone: 0.2 });
    const citrusFruit = lit ? S.mat({ color: 0xe8c23a, roughness: 0.4, emissive: 0x4a3a00, emissiveIntensity: 0.3 }) : S.mat({ tone: 0.02 });
    for (let i = 0; i < 8; i++) {
      const a = (i + 0.5) * (Math.PI / 4);
      const g = new THREE.Group();
      this._m(new THREE.TorusGeometry(1.7, 0.09, 6, 14, Math.PI), this._trunkMat, 0, 0.1, 0, { parent: g });
      for (const phi of [0.5, 1.05, 1.57, 2.09, 2.64]) {
        this._m(new THREE.SphereGeometry(0.34, 8, 6), citrusLeaf,
          Math.cos(phi) * 1.7, 0.1 + Math.sin(phi) * 1.7, 0, { parent: g, cast: false });
      }
      for (const phi of [0.85, 2.3]) {
        this._m(new THREE.SphereGeometry(0.1, 8, 6), citrusFruit,
          Math.cos(phi) * 1.55, 0.1 + Math.sin(phi) * 1.55, 0.22, { parent: g, cast: false });
      }
      const [x, z] = pos(a, 20.3);
      g.position.set(x, 0, z);
      g.rotation.y = -a;
      this.scene.add(g);
    }

    // ── Inner claustro: three terraces rising to the theatre ──────────────
    // Arcs with gaps at the cardinals; conifers in geometric array on the
    // first, knot gardens on the second and third, flower-bed rings at each
    // edge — the auditorium turned into beds, as the book turns it.
    const knot = lit ? this._knotTexture() : null;
    const tiers = [
      { r0: 8, r1: 11, h: 0.42, bed: 0xc84a5a },
      { r0: 11, r1: 14, h: 0.84, bed: 0xe07a8a },
      { r0: 14, r1: 17, h: 1.26, bed: 0xd8a850 },
    ];
    const terraceMat = lit ? S.mat({ color: 0x8a7a5a, roughness: 0.9 }) : S.mat({ tone: 0.08 });
    if (lit) this._dress(terraceMat, this._surfaceTexture({ base: '#a7967a', dark: '#4a3a22', light: '#e6d6b0', veins: 4, courses: 3, repeat: 3 }), 0.3);
    tiers.forEach((t, ti) => {
      const gap = 0.17;
      for (let q = 0; q < 4; q++) {
        const t0 = q * Math.PI / 2 + gap, tl = Math.PI / 2 - 2 * gap;
        const topMat = (lit && ti > 0)
          ? new THREE.MeshStandardMaterial({ map: knot, roughness: 0.9, side: THREE.DoubleSide })
          : terraceMat;
        this._m(new THREE.RingGeometry(t.r0, t.r1, 20, 1, t0, tl), topMat, CX, t.h, CZ, { rx: -Math.PI / 2, cast: false });
        this._m(new THREE.CylinderGeometry(t.r1, t.r1, t.h, 20, 1, true, Math.PI / 2 - (t0 + tl), tl), terraceMat, CX, t.h / 2, CZ, { cast: false });
        if (ti === 0) this._m(new THREE.CylinderGeometry(t.r0, t.r0, t.h, 20, 1, true, Math.PI / 2 - (t0 + tl), tl), terraceMat, CX, t.h / 2, CZ, { cast: false });
      }
      // the flower-bed ring at the tier's inner lip
      const bedMat = lit ? S.mat({ color: t.bed, roughness: 0.7, emissive: t.bed, emissiveIntensity: 0.12 }) : S.mat({ tone: 0.16 });
      this._m(new THREE.TorusGeometry(t.r0 + 0.4, 0.17, 8, 40), bedMat, CX, t.h + 0.1, CZ, { rx: Math.PI / 2, cast: false });
    });
    // conifers in array on the first terrace; spice wood on the third
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      if (Math.min(...[0, 1, 2, 3].map(q => Math.abs(a - q * Math.PI / 2))) < 0.28) continue;
      const [x, z] = pos(a, 9.5);
      this._m(new THREE.ConeGeometry(0.3, 1.35, 7), this._leafMat, x, 1.17, z, { cast: false });
    }
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.31;
      if (Math.min(...[0, 1, 2, 3].map(q => Math.abs(((a - q * Math.PI / 2 + Math.PI) % (Math.PI * 2)) - Math.PI))) < 0.3) continue;
      const [x, z] = pos(a, 15.5);
      const sp = this.cast.props.tree('broad', 0.55);
      sp.position.set(x, 1.26, z);
      this.scene.add(sp);
    }
    // terrace guards: the walk enters only by the four crossroads
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2;
      const near = Math.min(...[0, 1, 2, 3].map(q => Math.abs(((a - q * Math.PI / 2 + Math.PI) % (Math.PI * 2)) - Math.PI)));
      if (near < 0.3) continue;
      const [gx, gz] = pos(a, 16.4);
      this._circleCol(gx, gz, 2.1);
      if (i % 2 === 0) { const [hx, hz] = pos(a, 9.7); this._circleCol(hx, hz, 1.7); }
    }
    // corridor walls (the cardinals are axis-aligned, so AABBs serve)
    this._wallCol(-2.1, -1.5, CZ + 7.6, CZ + 17.4); this._wallCol(1.5, 2.1, CZ + 7.6, CZ + 17.4);
    this._wallCol(-2.1, -1.5, CZ - 17.4, CZ - 7.6); this._wallCol(1.5, 2.1, CZ - 17.4, CZ - 7.6);
    this._wallCol(CX + 7.6, CX + 17.4, CZ - 2.1, CZ - 1.5); this._wallCol(CX + 7.6, CX + 17.4, CZ + 1.5, CZ + 2.1);
    this._wallCol(CX - 17.4, CX - 7.6, CZ - 2.1, CZ - 1.5); this._wallCol(CX - 17.4, CX - 7.6, CZ + 1.5, CZ + 2.1);
    // the ornate gates at the four crossroads
    for (let q = 0; q < 4; q++) {
      const a = q * Math.PI / 2;
      for (const s of [-1.9, 1.9]) {
        const [x, z] = pos(a, 18.6);
        this._obelisk(x - Math.sin(a) * s, z + Math.cos(a) * s, 0.75, 2.1);
      }
    }

    // ── The crowning cypress arcade ───────────────────────────────────────
    // The book crowns the top of the theatre's rings with paired cypresses
    // "trained to arch and meet over" (Colonna p.354, tr. this repo): a living
    // colonnade ringing the auditorium. Eight pairs on the top terrace, the
    // four cardinals left open for the crossroads. Purely decorative — off the
    // walk, so no colliders.
    const arcadeR = 16.4, arcH = 1.26, span = 0.5;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      if (Math.min(...[0, 1, 2, 3].map(q => Math.abs(((a - q * Math.PI / 2 + Math.PI) % (Math.PI * 2)) - Math.PI))) < 0.34) continue;
      const [cx, cz] = pos(a, arcadeR);
      const tx = -Math.sin(a), tz = Math.cos(a);        // ground tangent
      const apex = arcH + 2.6;                            // cypress-top height
      for (const s of [-span, span]) {
        const px = cx + tx * s, pz = cz + tz * s;
        this._m(new THREE.ConeGeometry(0.3, 2.7, 8), this._leafMat, px, arcH + 1.35, pz, { cast: false });
        this._m(new THREE.CylinderGeometry(0.07, 0.1, arcH + 0.1, 6), this._trunkMat, px, (arcH) / 2, pz, { cast: false });
      }
      // the two crowns trained into an arch overhead, and a box-sphere finial
      this._m(new THREE.TorusGeometry(span, 0.07, 6, 14, Math.PI), this._leafMat, cx, apex, cz, { ry: a + Math.PI / 2, cast: false });
      this._m(new THREE.SphereGeometry(0.16, 8, 6), this._leafMat, cx, apex + span, cz, { outline: true, cast: false });
    }

    // ── The theatre floor, and the fountain the whole island converges on ──
    this._m(new THREE.CircleGeometry(7.8, 40), this._darkStoneMat, CX, 0.06, CZ, { rx: -Math.PI / 2, cast: false });
    this._buildFountain(CX, CZ, { enclosure: true });

    // ── The landing ───────────────────────────────────────────────────────
    for (let i = 0; i < 3; i++) {
      this._m(new THREE.BoxGeometry(2.2, 0.12, 1.5), this._trunkMat, 0, 0.2, -99.4 - i * 1.6);
    }
    const skiff = this.cast.props.boat(1.6);
    skiff.position.set(2.6, 0.1, -99.2);
    skiff.rotation.y = 0.5;
    this.scene.add(skiff);
    this._floats.push({ g: skiff, wheels: [], phase: 2.4 });
    this._plaque({ main: 'CYTHERA', sub: 'THE ISLAND OF VENUS · PRESS 9 TO RETURN' },
      1.25, 0.32, -2.5, 1.1, -108, 0.35, true);
  }

  // Book-matched sliced marble for the fountain's balustrade — the zig-zag
  // Hunt compares to the revetments of Torcello (GARDENS.md §7).
  _zigzagTexture() {
    const N = 256;
    const c = document.createElement('canvas');
    c.width = c.height = N;
    const x = c.getContext('2d');
    x.fillStyle = '#e6dfd0'; x.fillRect(0, 0, N, N);
    const colors = ['#7e937e', '#b8ab90', '#8a7a6a'];
    const wave = 32, amp = 15, band = 22;
    for (let row = 0; row < 5; row++) {
      const y0 = row * 52 + 8;
      x.fillStyle = colors[row % colors.length];
      x.beginPath();
      x.moveTo(0, y0);
      for (let px = 0; px <= N; px += wave) { x.lineTo(px + wave / 2, y0 + amp); x.lineTo(px + wave, y0); }
      for (let px = N; px >= 0; px -= wave) { x.lineTo(px, y0 + band); x.lineTo(px - wave / 2, y0 + band + amp); }
      x.closePath(); x.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(8, 1);
    this._disp.push(t);
    return t;
  }

  // The knot-garden pattern for the terrace beds: interlaced diagonal bands
  // in box-green and gravel-gold — the "tapeti charaini," carpets from Cairo,
  // the book compares its beds to (GARDENS.md §5).
  _knotTexture() {
    const N = 256;
    const c = document.createElement('canvas');
    c.width = c.height = N;
    const x = c.getContext('2d');
    x.fillStyle = '#31491d'; x.fillRect(0, 0, N, N);
    x.lineWidth = 11;
    for (let i = -4; i <= 4; i++) {
      x.strokeStyle = '#a8904a';
      x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64 + N, N); x.stroke();
      x.strokeStyle = '#4e7a2c';
      x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64 - N, N); x.stroke();
    }
    // the over-under of the weave: punch the base colour at alternate crossings
    x.fillStyle = '#31491d';
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
      if ((i + j) % 2) x.fillRect(i * 32 + 12, j * 32 + 12, 9, 9);
    }
    x.strokeStyle = '#243615'; x.lineWidth = 6; x.strokeRect(3, 3, N - 6, N - 6);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(5, 5);
    this._disp.push(t);
    return t;
  }

  // ── Garden fabric ─────────────────────────────────────────────────────────

  // The trees were a cylinder and a single cone, which is what made the garden
  // read as blobby: one smooth shape has no branch structure and no foliage
  // mass, so it cannot catch light the way a painted tree does.
  //
  // These are built the way a Quattrocento painter draws them: a tapered,
  // slightly leaning trunk with a root flare, real branches, and a canopy
  // assembled from several overlapping jittered ellipsoids in two tones, so the
  // mass has a lit crown and a shadowed underside. Species follow the plants the
  // book names in its gardens - cypress, umbrella pine, laurel, myrtle, orange.
  // Everything is seeded by position, so the garden is identical on every load.
  _treeRand(seed, k) {
    const v = Math.sin(seed * 127.1 + k * 311.7) * 43758.5453;
    return v - Math.floor(v);
  }

  // Two foliage tones per species: the body of the mass, and a lighter crown
  // catching the sun. In woodcut mode both collapse to the flat ink.
  _foliageMats(hex, light) {
    const S = this.style;
    this._foliageCache = this._foliageCache || {};
    const key = hex + '_' + light;
    if (this._foliageCache[key]) return this._foliageCache[key];
    let pair;
    if (S.key === 'woodcut') {
      pair = [this._leafMat, this._leafMat];
    } else {
      pair = [S.mat({ color: hex, roughness: 0.92 }), S.mat({ color: light, roughness: 0.88 })];
      this._dress(pair[0], this._surfaceTexture({
        base: '#1d3a14', dark: '#0c1c08', light: '#4a7030', blobs: 40, speckle: 3000, repeat: 3,
      }), 0.35);
    }
    this._foliageCache[key] = pair;
    return pair;
  }

  // One canopy mass: overlapping squashed spheres jittered around a centre.
  _canopyMass(parent, cx, cy, cz, r, count, mats, seed, squash) {
    for (let i = 0; i < count; i++) {
      const a  = this._treeRand(seed, i * 3 + 1) * Math.PI * 2;
      const rr = this._treeRand(seed, i * 3 + 2);
      const hh = this._treeRand(seed, i * 3 + 3);
      const br = r * (0.52 + rr * 0.42);
      const bx = cx + Math.cos(a) * r * 0.46 * rr;
      const bz = cz + Math.sin(a) * r * 0.46 * rr;
      const by = cy + (hh - 0.45) * r * 0.5;
      const mat = (by > cy + r * 0.06) ? mats[1] : mats[0];
      const b = this._m(new THREE.SphereGeometry(br, 9, 7), mat, bx, by, bz,
        { parent, cast: i < 3, receive: false, outline: i === 0 });
      b.scale.set(1, squash, 1);
      b.rotation.set(this._treeRand(seed, i + 40) * 0.6, a, this._treeRand(seed, i + 50) * 0.4);
    }
  }

  // A tapered limb from a to b.
  _limb(parent, mat, ax, ay, az, bx, by, bz, r0, r1) {
    const dx = bx - ax, dy = by - ay, dz = bz - az;
    const len = Math.hypot(dx, dy, dz) || 0.001;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, 6), mat);
    m.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(dx, dy, dz).normalize());
    m.castShadow = true; m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  _tree(x, z, s = 1, species = null) {
    // The primitive variant is the founding manifesto look, kept selectable
    // (DECISIONS.md, 2026-09-05) and preferred by woodcut mode, which wants a
    // readable silhouette rather than a modelled mass.
    if (isVariant('tree', 'primitive', this.style.key)) {
      this._m(new THREE.CylinderGeometry(0.12 * s, 0.16 * s, 0.8 * s, 6), this._trunkMat, x, 0.4 * s, z);
      this._m(new THREE.ConeGeometry(0.55 * s, 3.2 * s, 8), this._leafMat, x, 0.8 * s + 1.6 * s, z, { outline: true });
      this._circleCol(x, z, 0.5 * s);
      return null;
    }
    const seed = Math.abs(x * 73.1 + z * 19.7) + 1;
    const KINDS = ['cypress', 'pine', 'laurel', 'myrtle', 'orange'];
    species = species || KINDS[Math.floor(this._treeRand(seed, 7) * KINDS.length) % KINDS.length];

    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = this._treeRand(seed, 11) * Math.PI * 2;
    g.rotation.z = (this._treeRand(seed, 13) - 0.5) * 0.09;   // no tree is plumb
    this.scene.add(g);

    // Root flare, so the trunk grows out of the ground instead of sitting on it
    this._m(new THREE.CylinderGeometry(0.15 * s, 0.28 * s, 0.18 * s, 8),
      this._trunkMat, 0, 0.09 * s, 0, { parent: g });

    if (species === 'cypress') {
      // Tall, dark, columnar - the signature tree of an Italian garden. Four
      // stacked offset masses so the silhouette wavers instead of being a cone.
      const H = 4.2 * s;
      this._m(new THREE.CylinderGeometry(0.07 * s, 0.15 * s, H * 0.5, 7),
        this._trunkMat, 0, H * 0.25, 0, { parent: g });
      const mats = this._foliageMats(0x17300f, 0x2c4a18);
      for (let i = 0; i < 4; i++) {
        const t = i / 4;
        const b = this._m(new THREE.SphereGeometry((0.5 - t * 0.27) * s, 9, 8),
          i > 1 ? mats[1] : mats[0],
          (this._treeRand(seed, 20 + i) - 0.5) * 0.1 * s,
          H * (0.26 + t * 0.5),
          (this._treeRand(seed, 30 + i) - 0.5) * 0.1 * s,
          { parent: g, cast: i < 2, receive: false, outline: i === 0 });
        b.scale.set(1, 2.1 - t * 0.5, 1);
      }
      this._circleCol(x, z, 0.42 * s);

    } else if (species === 'pine') {
      // The Roman umbrella pine: long bare trunk, high branches, flat crown.
      const H = 3.4 * s;
      this._m(new THREE.CylinderGeometry(0.11 * s, 0.2 * s, H, 8),
        this._trunkMat, 0, H / 2, 0, { parent: g });
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + this._treeRand(seed, 3) * 2;
        this._limb(g, this._trunkMat, 0, H * 0.82, 0,
          Math.cos(a) * 0.75 * s, H * 1.02, Math.sin(a) * 0.75 * s, 0.07 * s, 0.03 * s);
      }
      this._canopyMass(g, 0, H * 1.12, 0, 1.15 * s, 7,
        this._foliageMats(0x1c3612, 0x36581f), seed, 0.5);
      this._circleCol(x, z, 0.4 * s);

    } else if (species === 'orange') {
      // A fruit tree from the book's own orchards - rounded, low, bearing fruit.
      const H = 1.7 * s;
      this._m(new THREE.CylinderGeometry(0.1 * s, 0.17 * s, H, 8),
        this._trunkMat, 0, H / 2, 0, { parent: g });
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 + this._treeRand(seed, 5) * 3;
        this._limb(g, this._trunkMat, 0, H * 0.7, 0,
          Math.cos(a) * 0.5 * s, H * 1.15, Math.sin(a) * 0.5 * s, 0.06 * s, 0.03 * s);
      }
      this._canopyMass(g, 0, H * 1.25, 0, 1.0 * s, 6,
        this._foliageMats(0x1f3d16, 0x3d6524), seed, 0.86);
      if (this.style.key !== 'woodcut') {
        const fruitMat = this.style.mat({ color: 0xd8801c, roughness: 0.55 });
        for (let i = 0; i < 7; i++) {
          const a = this._treeRand(seed, 60 + i) * Math.PI * 2;
          const rr = 0.55 + this._treeRand(seed, 70 + i) * 0.42;
          this._m(new THREE.SphereGeometry(0.055 * s, 7, 6), fruitMat,
            Math.cos(a) * rr * s,
            H * (1.05 + this._treeRand(seed, 80 + i) * 0.4),
            Math.sin(a) * rr * s, { parent: g, cast: false, receive: false });
        }
      }
      this._circleCol(x, z, 0.4 * s);

    } else {
      // Laurel / myrtle - the evergreens the nymphs are crowned with: a short
      // trunk splitting into boughs under a dense round mass.
      const dark  = species === 'myrtle' ? 0x16300f : 0x1b3a13;
      const light = species === 'myrtle' ? 0x2d5119 : 0x35601d;
      const H = 1.5 * s;
      this._m(new THREE.CylinderGeometry(0.11 * s, 0.18 * s, H, 8),
        this._trunkMat, 0, H / 2, 0, { parent: g });
      const n = 3 + Math.floor(this._treeRand(seed, 17) * 2);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + this._treeRand(seed, 19) * 3;
        this._limb(g, this._trunkMat, 0, H * 0.62, 0,
          Math.cos(a) * 0.62 * s, H * 1.3, Math.sin(a) * 0.62 * s, 0.07 * s, 0.03 * s);
      }
      this._canopyMass(g, 0, H * 1.5, 0, 1.16 * s, 7,
        this._foliageMats(dark, light), seed, 0.9);
      this._circleCol(x, z, 0.44 * s);
    }
    return g;
  }

  _buildTrees() {
    const put = (x, z, s = 1, species = null) => this._tree(x, z, s, species);

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

    // (Only the northern hedge pair remains: the southern pair stood exactly
    // on the triumphs' processional circuit and was garden fabric, not book.)
    for (const [x, z, w, d] of [[-8.5, 8.8, 6, 0.5], [8.5, 8.8, 6, 0.5]]) {
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
      rect(-13, -9, 12.5, 27.5),         // the bridge and its watercourse
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
      circle(30, -27, 9.3),              // the polyandrion's ruin floor
    );
    for (const t of TRIUMPHS) d = Math.min(d, circle(t.pos[0], t.pos[1], 2.4));
    return d;
  }

  // Open ground on the island of Cythera: the prati and bosco annuli, minus
  // the twelve radial roads, the espalier ring, the lawn centrepieces, and
  // everything inside the river.
  _isleClearance(x, z) {
    const dx = x, dz = z + 150;
    const rr = Math.hypot(dx, dz);
    if (rr > 48.6 || rr < 22.2) return 0;
    let d = Math.min(2, 48.6 - rr, rr - 22.2);
    // radial roads every 30°
    const STEP = Math.PI / 6;
    let a = Math.atan2(dz, dx) % STEP;
    if (a < 0) a += STEP;
    const arc = Math.min(a, STEP - a) * rr;
    d = Math.min(d, arc - 1.6);
    // the bitter-orange espalier ring
    d = Math.min(d, Math.abs(rr - 34.2) - 1.0);
    // lawn centrepieces at mid-wedge, r 27.5
    const arcMid = Math.abs(a - STEP / 2) * rr;
    d = Math.min(d, Math.hypot(rr - 27.5, arcMid) - 1.5);
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

    // Cythera's own sward and its flowery mead — denser in flower than the
    // mainland, because the island is the flowery mead perfected
    const isleClear = (x, z) => this._isleClearance(x, z);
    const isleGrass = createMeadowField({
      ...common, clearance: isleClear,
      count: mobile ? 4000 : 12000,
      seed: 5150,
      bounds: { x0: -50, x1: 50, z0: -200, z1: -100 },
      blade: { height: 0.4, width: 0.05, segments: 3, planes: 3 },
      colors: { root: 0x2e4a1e, tip: 0x7a9c42, rootB: 0x3c5a22, tipB: 0xa8b050, back: 0xd8c860 },
      wind: { windStrength: 0.18, windSpeed: 1.2 },
    });
    const isleFlowers = createMeadowField({
      ...common, clearance: isleClear,
      count: mobile ? 900 : 2600,
      seed: 611,
      bounds: { x0: -50, x1: 50, z0: -200, z1: -100 },
      accept: (x, z, clump) => clump > 0.52,
      blade: { height: 0.5, width: 0.045, segments: 3, planes: 2, flare: 1.45 },
      colors: { root: 0x35521f, tip: 0xd86a7a, rootB: 0x3a5423, tipB: 0xe8c860, back: 0xf0d0a0 },
      wind: { windStrength: 0.2, windSpeed: 1.2 },
      scale: 0.9,
    });

    for (const f of [grass, wildflowers, roses, isleGrass, isleFlowers]) {
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
    if (this._mood) this._updateMood(dt);
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
    for (const v of this._venuses) v.rotation.y += dt * 0.2;
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
      if (n.g.userData && n.g.userData.billboard) continue;   // cards face the camera, not a fixed yaw
      n.g.rotation.y = n.baseY + Math.sin(this._t * 0.8 + n.phase) * n.sway;
      if (n.armL) {
        n.armL.rotation.z = n.aL + Math.sin(this._t * 0.9 + n.phase) * 0.05;
        n.armR.rotation.z = n.aR - Math.sin(this._t * 0.9 + n.phase + 0.9) * 0.05;
      }
    }
    // The meadow leans with the travelling gusts
    for (const f of this._meadows) f.update(this._t);
    // Cythera draws only from the shore southward (the haze covers the seam)
    if (this._isleGroup) this._isleGroup.visible = this.walker.player.pos.z < -24;
    // Fortuna turns on her pin: a slow drift with the gusts, never a clean spin
    for (const v of this._vanes) {
      v.g.rotation.y += dt * v.rate * (0.6 + 0.4 * Math.sin(this._t * 0.31 + v.phase));
    }
    // Concord and discord, breathing: the ant grows to an elephant while the
    // elephant dwindles to an ant, and back, forever
    if (this._hiero) {
      const k = (Math.sin(this._t * 0.45) + 1) / 2;      // 0 … 1, slow
      this._hiero.ant.scale.setScalar(0.4 + k * 1.4);
      this._hiero.ele.scale.setScalar(1.8 - k * 1.4);
    }
    // Water: the fountain discs turn, the sea breathes
    // A painted figure has one correct view: turn each card about its own axis
    // to face the camera, never tilting it or it lifts off the ground. This runs
    // LAST — the NPC idle-sway above writes rotation.y from each figure's fixed
    // baseY, and when this ran first the sway simply overwrote it, leaving the
    // cards frozen at their authored yaw and edge-on to the reader.
    if (this._billboards.length) {
      const cx = this.camera.position.x, cz = this.camera.position.z;
      for (const b of this._billboards) {
        b.rotation.y = Math.atan2(cx - b.position.x, cz - b.position.z);
        const sh = b.userData.shadow;
        if (sh) sh.rotation.z = -b.rotation.y;   // the shadow stays put on the ground
      }
    }
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
    // Triumph floats process around the grove (and breathe); the skiff at
    // Cythera's landing, which has no orbit, only bobs
    for (const f of this._floats) {
      f.g.position.y = Math.sin(this._t * 0.9 + f.phase) * 0.02;
      if (!f.orbit) continue;
      const o = f.orbit;
      o.theta += o.om * dt;
      const x = o.cx + Math.cos(o.theta) * o.r;
      const z = o.cz + Math.sin(o.theta) * o.r;
      f.g.position.x = x; f.g.position.z = z;
      // teams hitched at local −z, so forward = travel tangent → yaw = π − θ
      f.g.rotation.y = Math.PI - o.theta;
      f.col.x = x; f.col.z = z;
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
    // originals removed from the graph by the draw-call compiler still hold GPU
    // buffers; free them here so a style toggle doesn't leak
    this._trashGeo.forEach(g => g.dispose());
    this._trashGeo.clear();
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
