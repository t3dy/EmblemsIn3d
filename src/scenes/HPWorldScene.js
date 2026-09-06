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
import { makeCast } from '../systems/Cast.js?v=39';
import { isVariant } from '../systems/AssetVariants.js?v=8';
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
  // Chapters XVII–XVIII, fifteen plates. It stands west of the grove with the
  // sea and Cythera behind it, which is the direction the pilgrims leave in.
  { key: 'venus_temple',     name: 'The Temple of Venus',    folio: 205,
    pos: [-30, -12], look: [-30, -21], radius: 9 },
  { key: 'labyrinth',        name: 'The Water Labyrinth',    folio: 177,
    pos: [-29.2, 34], look: [-44, 34], radius: 12 },   // outside the basin, beside the viewing mount
  { key: 'colossus',         name: 'The Colossus',           folio: 34,
    pos: [30, 4],    look: [38, 4],    radius: 8 },
  { key: 'priapus',          name: 'The Rite of Priapus',    folio: 185,
    pos: [44, -12],  look: [44, -6],   radius: 7 },
  { key: 'book_two',         name: "Book II — Treviso",      folio: 387,
    pos: [44, 32],   look: [44, 22],   radius: 12 },
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
  // Appended after the island so the digit keys 1-9 keep their journey order.
  // The chess ballet is at signature g8r-h1r, facsimile pages 111-113 — the
  // Queen's entertainment after the banquet, and the last thing that happens
  // at her palace before Logistica and Thelemia lead the dreamer away.
  { key: 'chess',            name: 'The Human Chess Match',  folio: 111,
    pos: [-32.5, 6], look: [-40, 6], radius: 8 },
  // The first monument of the piazza, east of the axis between the Three Doors
  // wall and the cross-path to the courts.
  { key: 'horse',            name: 'The Winged Horse',       folio: 22,
    pos: [10.5, 22.5], look: [10.5, 16.5], radius: 6 },
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
    this._windVanes = [];          // the Temple of Venus's eight winds (absolute)
    this._foils = [];              // the gold foils on Priapus's canopy
    this._hovers = [];             // things held in the air that breathe (the Book II vision)
    this._windBells = [];          // and the four bells under its moon
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
    this._buildColossalHorse();
    this._buildElephant();
    this._buildPalace();
    this._buildChessBallet();
    this._buildQuinta();
    this._buildFountain();
    this._buildTriumphs();
    this._buildVenusTemple();
    this._buildPolyandrion();
    this._polyandrionMedallions();
    this._buildWaterLabyrinth();
    this._buildColossus();
    this._buildPriapusRite();
    this._buildBookTwo();
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
    for (const v of this._windVanes) mark(v.g);
    for (const b of this._windBells) mark(b.g);
    for (const f of this._foils) mark(f);
    for (const h of this._hovers) mark(h.g);
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

  // A roof, not a slab. Ted, 2026-09-06: "real buildings that don't have
  // impossible floating platforms". What makes a horizontal plane read as a
  // roof rather than a hovering slab is what holds it up and what it does on
  // top: a SOFFIT of beams running between the supports, and a PITCH with a
  // ridge and eaves above. This puts both under and over a rectangle.
  //   cx, cz  centre;  y  the underside;  w  along x;  d  along z;
  //   pitch   rise of the ridge (0 = flat with a parapet)
  _roof(cx, y, cz, w, d, { pitch = 0.9, beams = true, parent = null, ridgeAlong = 'x' } = {}) {
    const S = this.style, woodcut = S.key === 'woodcut';
    const timber = woodcut ? this._darkStoneMat : this.style.mat({ color: 0x4a3420, roughness: 0.9 });
    const tile = woodcut ? this._darkStoneMat : this.style.mat({ color: 0x8a4a34, roughness: 0.85 });
    const o = { parent, cast: false };
    if (beams) {
      // primary beams across the short span, purlins along the long one
      const nB = Math.max(3, Math.round((ridgeAlong === 'x' ? w : d) / 1.5));
      for (let i = 0; i < nB; i++) {
        const t = (i / (nB - 1) - 0.5);
        if (ridgeAlong === 'x') this._m(new THREE.BoxGeometry(0.22, 0.28, d), timber, cx + t * (w - 0.4), y + 0.14, cz, o);
        else this._m(new THREE.BoxGeometry(w, 0.28, 0.22), timber, cx, y + 0.14, cz + t * (d - 0.4), o);
      }
      const nP = 3;
      for (let i = 0; i < nP; i++) {
        const t = (i / (nP - 1) - 0.5);
        if (ridgeAlong === 'x') this._m(new THREE.BoxGeometry(w, 0.18, 0.18), timber, cx, y + 0.34, cz + t * (d - 0.5), o);
        else this._m(new THREE.BoxGeometry(0.18, 0.18, d), timber, cx + t * (w - 0.5), y + 0.34, cz, o);
      }
    }
    // the deck the beams carry
    this._m(new THREE.BoxGeometry(w, 0.12, d), this._stoneMat, cx, y + 0.5, cz, o);
    if (pitch <= 0) {
      this._m(new THREE.BoxGeometry(w + 0.3, 0.42, d + 0.3), this._stoneMat, cx, y + 0.72, cz, { ...o, outline: true });
      return;
    }
    // two sloped leaves meeting at a ridge, eaves overhanging the deck
    const along = ridgeAlong === 'x' ? w : d, across = ridgeAlong === 'x' ? d : w;
    const half = across / 2 + 0.35, leafLen = Math.hypot(half, pitch), ang = Math.atan2(pitch, half);
    for (const sgn of [-1, 1]) {
      const leaf = this._m(new THREE.BoxGeometry(ridgeAlong === 'x' ? along + 0.6 : leafLen, 0.14, ridgeAlong === 'x' ? leafLen : along + 0.6),
        tile, ridgeAlong === 'x' ? cx : cx + sgn * half / 2, y + 0.56 + pitch / 2, ridgeAlong === 'x' ? cz + sgn * half / 2 : cz, { ...o, outline: true });
      if (ridgeAlong === 'x') leaf.rotation.x = -sgn * ang; else leaf.rotation.z = sgn * ang;
    }
    // the ridge, and antefixes along both eaves
    if (ridgeAlong === 'x') this._m(new THREE.BoxGeometry(along + 0.6, 0.16, 0.24), tile, cx, y + 0.6 + pitch, cz, o);
    else this._m(new THREE.BoxGeometry(0.24, 0.16, along + 0.6), tile, cx, y + 0.6 + pitch, cz, o);
    const nA = Math.max(4, Math.round(along / 1.5));
    for (let i = 0; i < nA; i++) {
      const t = (i / (nA - 1) - 0.5) * (along - 0.4);
      for (const sgn of [-1, 1]) {
        if (ridgeAlong === 'x') this._m(new THREE.ConeGeometry(0.14, 0.28, 6), this._stoneMat, cx + t, y + 0.74, cz + sgn * half, o);
        else this._m(new THREE.ConeGeometry(0.14, 0.28, 6), this._stoneMat, cx + sgn * half, y + 0.74, cz + t, o);
      }
    }
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
    // Ted, 2026-09-06: "fountains that look like real water". What water
    // actually does is reflect the sky and the building, break that reflection
    // into moving ripples, and let you see into it. So: a mirror finish that
    // takes the shared environment map, a tiled ripple NORMAL map whose offset
    // drifts every frame (two layers, counter-drifting, so it never reads as a
    // sliding sheet), a cool tint you can see through, and the old painted
    // rings kept underneath as the bed you see through it.
    m.color.set(0x8fb8c8);
    m.map = null;
    m.normalMap = this._waterNormal();
    m.normalScale = new THREE.Vector2(0.55, 0.55);
    m.roughness = 0.06;
    m.metalness = 0.12;
    m.envMapIntensity = 1.6;
    m.transparent = true;
    m.opacity = 0.72;
    m.emissive = new THREE.Color(0x0e2a3a);
    m.emissiveIntensity = 0.35;
    m.depthWrite = false;
    return m;
  }

  // One ripple normal map, shared by every water in the world and animated
  // in update(). Sum of a few sine ridges plus a cellular jitter, encoded as
  // a tangent-space normal.
  _waterNormal() {
    if (this._waterNrm) return this._waterNrm;
    const N = 256;
    const c = document.createElement('canvas'); c.width = c.height = N;
    const x = c.getContext('2d');
    const img = x.createImageData(N, N);
    const h = (i, j) => {
      const u = i / N * Math.PI * 2, v = j / N * Math.PI * 2;
      return Math.sin(u * 3 + Math.sin(v * 2) * 1.3) * 0.5 + Math.sin(v * 5 + Math.cos(u * 3) * 1.1) * 0.35
           + Math.sin((u + v) * 7) * 0.15 + Math.sin(u * 11 - v * 9) * 0.08;
    };
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const dx = (h((i + 1) % N, j) - h((i - 1 + N) % N, j)) * 2.2;
      const dy = (h(i, (j + 1) % N) - h(i, (j - 1 + N) % N)) * 2.2;
      const len = Math.hypot(dx, dy, 1);
      const k = (j * N + i) * 4;
      img.data[k] = 128 + (-dx / len) * 127; img.data[k + 1] = 128 + (-dy / len) * 127; img.data[k + 2] = 128 + (1 / len) * 127; img.data[k + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.NoColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2.5, 2.5);
    this._disp.push(t);
    this._waterNrm = t;
    return t;
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
      // the wood the book names (1592 l. 625): elms with their vines, oaks,
      // beeches, and the fir whose boughs are hung on the horns of the
      // sacrifice — no cypress, which belongs to the garden avenues
      const WOOD = ['oak', 'oak', 'beech', 'elm', 'fir', 'oak', 'beech', 'fir'];
      this._tree(x, z, s * 1.15, WOOD[Math.floor(rnd(i, 4) * WOOD.length) % WOOD.length]);
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

  // ── The hieroglyph vocabulary ──────────────────────────────────────────
  //
  // Which signs are ATTESTED, and where. Efthymia Priki names the signs on the
  // obelisk and on the statue base that Poliphilo reads: **the eye**, **the
  // vulture**, **two fish-hooks**, **two circles** (read as eternity), and a
  // cartouche. The **anchor and dolphin** are woodcut_catalog #18, the
  // PATIENTIA device that closes the dragon chapter and that Aldus took for his
  // press. The **bull's skull** is #24, the frieze ornament in the Queen's
  // palace. The **ant and the elephant** are the concord hieroglyph on the
  // obelisk of Caesar at the Polyandrion (#87).
  //
  // The rest — altar, ewer, rudder, grain, sun, palm — were first drawn as the
  // vocabulary of the sentence Poliphilo says he read, not as a transcription.
  // THEN THE TRANSCRIPTION WAS FOUND: Dallington 1592, pp. 53–54 (corpus
  // ll. 2149–2170) itemises the elephant's base sign by sign — "First, the
  // horned scalpe of an oxe, with two tooles of husbandry fastned to the
  // hornes. An altar standing vpon goates feete, with a burning fire aloft, on
  // the foreside whereof there was also an eie, and a vulture. After that a
  // bason and an ewre. A spindle ful of twind, an old vessel fashioned with
  // the mouth stopped and tied fast. A sole and an eye in the bale thereof and
  // two branches trauersed one of Oliue, an other of Palme tree. An Anchor and
  // a Goose. An olde lampe, and a hand holding of it. An ore of ancient forme
  // with a fruitefull Oliue branch fastned to the handle. Two grapling yrons
  // or hookes. A Dolphin and an Arke close shut." — and then the Latin he
  // makes of it. And p. 93 gives the bridge's right-hand table: "An auncient
  // Helmet crested with a Doggeshead. The bony scalpe of an oxe with two
  // green braunches … And an ould lampe" → PATIENTIA EST ORNAMENTVM CVSTODIA
  // ET PROTECTIO VITAE. The signs added for those two readings are helmet,
  // lamp, goose, basin, spindle, vessel, sole and ark; the oar is the rudder,
  // the grapples are the hooks, the branches are the palm.
  static get SIGNS() {
    return ['eye', 'vulture', 'hook', 'circle', 'anchor', 'dolphin', 'skull',
            'ant', 'elephant', 'altar', 'ewer', 'rudder', 'grain', 'sun', 'palm',
            'helmet', 'lamp', 'goose', 'basin', 'spindle', 'vessel', 'sole', 'ark'];
  }

  _carvedTexture(kind, reps = 8, signs = null) {
    this._carved = this._carved || {};
    const key = kind + reps + (signs ? '|' + signs.join(',') : '');
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
      // A sequence if one is given, otherwise a stable pseudo-random line
      // seeded off the band's length, so two bands of different widths do not
      // come out as the same six marks.
      const V = HPWorldScene.SIGNS;
      const rnd = (i2, k) => { const v = Math.sin(i2 * 71.3 + k * 137.9 + reps * 13.7) * 43758.5453; return v - Math.floor(v); };
      const line = signs && signs.length
        ? Array.from({ length: reps }, (_, i2) => signs[i2 % signs.length])
        : Array.from({ length: reps }, (_, i2) => V[Math.floor(rnd(i2, 1) * V.length)]);

      carve(() => {
        for (let i2 = 0; i2 < reps; i2++) {
          const o = i2 * cell + cell / 2, cy = H * 0.5, r = Math.min(cell, H) * 0.24;
          x.lineWidth = 5; x.lineJoin = 'round'; x.lineCap = 'round';
          const sign = line[i2];

          if (sign === 'helmet') {                    // crested with a dog's head (bridge)
            x.beginPath(); x.arc(o, cy + r * 0.2, r, Math.PI, 2 * Math.PI); x.stroke();
            x.beginPath(); x.moveTo(o - r, cy + r * 0.2); x.lineTo(o + r, cy + r * 0.2); x.stroke();
            x.beginPath(); x.moveTo(o - r * 0.3, cy - r * 0.8); x.lineTo(o, cy - r * 1.5); x.lineTo(o + r * 0.55, cy - r * 1.35);
            x.lineTo(o + r * 0.35, cy - r * 1.0); x.stroke();                                      // the dog's head as crest
            x.beginPath(); x.arc(o + r * 0.42, cy - r * 1.3, r * 0.1, 0, 6.3); x.fill();
          } else if (sign === 'lamp') {               // "an olde lampe, and a hand holding of it"
            x.beginPath(); x.ellipse(o, cy + r * 0.2, r * 1.1, r * 0.45, 0, 0, 6.3); x.stroke();
            x.beginPath(); x.moveTo(o + r * 1.1, cy + r * 0.1); x.lineTo(o + r * 1.5, cy - r * 0.1); x.stroke();  // the spout
            x.beginPath(); x.moveTo(o + r * 1.5, cy - r * 0.15); x.lineTo(o + r * 1.62, cy - r * 0.7);        // the flame
            x.lineTo(o + r * 1.75, cy - r * 0.15); x.closePath(); x.fill();
            x.beginPath(); x.moveTo(o - r * 1.1, cy + r * 0.2); x.lineTo(o - r * 1.45, cy + r * 0.05); x.stroke(); // the handle
          } else if (sign === 'goose') {              // with the anchor
            x.beginPath(); x.ellipse(o, cy + r * 0.3, r * 0.9, r * 0.5, 0, 0, 6.3); x.stroke();
            x.beginPath(); x.moveTo(o + r * 0.6, cy); x.quadraticCurveTo(o + r * 1.0, cy - r * 1.2, o + r * 0.6, cy - r * 1.2); x.stroke();
            x.beginPath(); x.arc(o + r * 0.55, cy - r * 1.2, r * 0.22, 0, 6.3); x.fill();
            x.beginPath(); x.moveTo(o + r * 0.75, cy - r * 1.2); x.lineTo(o + r * 1.15, cy - r * 1.1); x.stroke();
          } else if (sign === 'basin') {              // "a bason and an ewre"
            x.beginPath(); x.moveTo(o - r * 1.2, cy - r * 0.3); x.quadraticCurveTo(o, cy + r * 1.2, o + r * 1.2, cy - r * 0.3); x.stroke();
            x.beginPath(); x.moveTo(o - r * 1.3, cy - r * 0.3); x.lineTo(o + r * 1.3, cy - r * 0.3); x.stroke();
            x.beginPath(); x.moveTo(o - r * 0.3, cy + r * 0.8); x.lineTo(o + r * 0.3, cy + r * 0.8); x.stroke();
          } else if (sign === 'spindle') {            // "a spindle ful of twind"
            x.beginPath(); x.moveTo(o, cy - r * 1.4); x.lineTo(o, cy + r * 1.4); x.stroke();
            x.beginPath(); x.ellipse(o, cy, r * 0.55, r * 0.9, 0, 0, 6.3); x.fill();
            x.beginPath(); x.arc(o, cy + r * 1.1, r * 0.2, 0, 6.3); x.fill();
          } else if (sign === 'vessel') {             // "an old vessel … the mouth stopped and tied fast"
            x.beginPath(); x.moveTo(o - r * 0.5, cy - r * 1.0); x.lineTo(o - r * 0.9, cy + r * 0.2);
            x.quadraticCurveTo(o, cy + r * 1.5, o + r * 0.9, cy + r * 0.2); x.lineTo(o + r * 0.5, cy - r * 1.0); x.closePath(); x.stroke();
            x.beginPath(); x.moveTo(o - r * 0.7, cy - r * 0.85); x.lineTo(o + r * 0.7, cy - r * 0.85); x.stroke();   // the cord
            x.beginPath(); x.moveTo(o - r * 0.7, cy - r * 0.65); x.lineTo(o + r * 0.7, cy - r * 0.65); x.stroke();
          } else if (sign === 'sole') {               // "a sole and an eye in the bale thereof"
            x.beginPath(); x.moveTo(o - r * 1.0, cy + r * 0.8); x.quadraticCurveTo(o - r * 1.2, cy - r * 0.6, o - r * 0.2, cy - r * 0.9);
            x.quadraticCurveTo(o + r * 0.8, cy - r * 1.1, o + r * 0.9, cy - r * 0.2); x.quadraticCurveTo(o + r * 0.9, cy + r * 0.9, o - r * 1.0, cy + r * 0.8);
            x.stroke();
            x.beginPath(); x.ellipse(o, cy, r * 0.42, r * 0.22, 0, 0, 6.3); x.stroke();
            x.beginPath(); x.arc(o, cy, r * 0.1, 0, 6.3); x.fill();
          } else if (sign === 'ark') {                // "an Arke close shut"
            x.beginPath(); x.rect(o - r * 1.0, cy - r * 0.4, r * 2.0, r * 1.1); x.stroke();
            x.beginPath(); x.moveTo(o - r * 1.1, cy - r * 0.4); x.lineTo(o, cy - r * 1.1); x.lineTo(o + r * 1.1, cy - r * 0.4); x.closePath(); x.stroke();
            x.beginPath(); x.arc(o, cy + r * 0.15, r * 0.14, 0, 6.3); x.fill();
          } else if (sign === 'sun') {                       // SOLI DICATVM, over the portal
            x.beginPath(); x.arc(o, cy, r, 0, 6.3); x.stroke();
            x.beginPath(); x.arc(o, cy, r * 0.28, 0, 6.3); x.fill();

          } else if (sign === 'eye') {                // Priki: attested, obelisk and base
            x.beginPath(); x.ellipse(o, cy, r * 1.25, r * 0.62, 0, 0, 6.3); x.stroke();
            x.beginPath(); x.arc(o, cy, r * 0.32, 0, 6.3); x.fill();
            x.beginPath(); x.moveTo(o + r * 0.9, cy + r * 0.4);   // the cosmetic tail
            x.lineTo(o + r * 1.5, cy + r * 0.75); x.stroke();

          } else if (sign === 'vulture') {            // Priki: attested, with the eye
            x.beginPath();                             // body, hunched
            x.ellipse(o + r * 0.1, cy + r * 0.15, r * 0.85, r * 0.55, -0.15, 0, 6.3); x.fill();
            x.beginPath();                             // the long bare neck and hooked head
            x.moveTo(o - r * 0.5, cy - r * 0.1);
            x.quadraticCurveTo(o - r * 1.0, cy - r * 0.9, o - r * 0.45, cy - r * 1.05);
            x.stroke();
            x.beginPath(); x.moveTo(o - r * 0.45, cy - r * 1.05);
            x.lineTo(o - r * 0.05, cy - r * 0.85); x.lineTo(o - r * 0.4, cy - r * 0.7);
            x.closePath(); x.fill();
            x.beginPath(); x.moveTo(o + r * 0.5, cy + r * 0.6);   // the legs
            x.lineTo(o + r * 0.5, cy + r * 1.05); x.stroke();

          } else if (sign === 'hook') {               // Priki: the two fish-hooks
            x.beginPath(); x.moveTo(o, cy - r * 1.1); x.lineTo(o, cy + r * 0.25); x.stroke();
            x.beginPath(); x.arc(o - r * 0.42, cy + r * 0.25, r * 0.42, 0, Math.PI); x.stroke();
            x.beginPath(); x.moveTo(o - r * 0.84, cy + r * 0.25);  // the barb
            x.lineTo(o - r * 0.6, cy - r * 0.2); x.stroke();

          } else if (sign === 'circle') {             // Priki: the two circles, eternity
            x.beginPath(); x.arc(o, cy, r * 0.95, 0, 6.3); x.stroke();
            x.beginPath(); x.arc(o, cy, r * 0.5, 0, 6.3); x.stroke();

          } else if (sign === 'anchor') {             // catalog #18, with the dolphin
            x.beginPath(); x.moveTo(o, cy - r * 1.1); x.lineTo(o, cy + r * 0.8); x.stroke();
            x.beginPath(); x.moveTo(o - r * 0.5, cy - r * 0.75);
            x.lineTo(o + r * 0.5, cy - r * 0.75); x.stroke();      // the stock
            x.beginPath(); x.arc(o, cy + r * 0.55, r * 0.8, 0.25, Math.PI - 0.25); x.stroke();
            x.beginPath(); x.arc(o, cy - r * 1.15, r * 0.22, 0, 6.3); x.stroke();

          } else if (sign === 'dolphin') {            // catalog #18: festina lente
            x.beginPath();
            x.moveTo(o - r * 1.2, cy + r * 0.15);
            x.quadraticCurveTo(o - r * 0.2, cy - r * 1.0, o + r * 1.0, cy - r * 0.1);
            x.quadraticCurveTo(o + r * 0.2, cy + r * 0.75, o - r * 1.2, cy + r * 0.15);
            x.fill();
            x.beginPath(); x.moveTo(o + r * 1.0, cy - r * 0.1);    // the tail fluke
            x.lineTo(o + r * 1.5, cy - r * 0.6); x.lineTo(o + r * 1.45, cy + r * 0.3);
            x.closePath(); x.fill();
            x.beginPath(); x.moveTo(o - r * 0.2, cy - r * 0.62);   // the dorsal
            x.lineTo(o + r * 0.1, cy - r * 1.15); x.lineTo(o + r * 0.35, cy - r * 0.55);
            x.closePath(); x.fill();

          } else if (sign === 'skull') {              // catalog #24, the bull's skull
            x.beginPath(); x.ellipse(o, cy + r * 0.15, r * 0.55, r * 0.8, 0, 0, 6.3); x.stroke();
            for (const sx of [-1, 1]) {
              x.beginPath();
              x.arc(o + sx * r * 0.55, cy - r * 0.45, r * 0.62, sx > 0 ? -1.9 : Math.PI + 1.9,
                    sx > 0 ? 0.5 : Math.PI - 0.5, sx < 0);
              x.stroke();
            }
            x.beginPath(); x.arc(o - r * 0.22, cy, r * 0.13, 0, 6.3); x.fill();
            x.beginPath(); x.arc(o + r * 0.22, cy, r * 0.13, 0, 6.3); x.fill();

          } else if (sign === 'ant') {                // #87, the concord device
            x.beginPath(); x.ellipse(o - r * 0.62, cy, r * 0.3, r * 0.24, 0, 0, 6.3); x.fill();
            x.beginPath(); x.ellipse(o, cy, r * 0.24, r * 0.2, 0, 0, 6.3); x.fill();
            x.beginPath(); x.ellipse(o + r * 0.66, cy, r * 0.4, r * 0.3, 0, 0, 6.3); x.fill();
            x.lineWidth = 3;
            for (const k of [-0.5, 0, 0.5]) {
              x.beginPath(); x.moveTo(o + k * r, cy); x.lineTo(o + k * r - r * 0.28, cy + r * 0.72); x.stroke();
              x.beginPath(); x.moveTo(o + k * r, cy); x.lineTo(o + k * r - r * 0.28, cy - r * 0.72); x.stroke();
            }
            x.lineWidth = 5;

          } else if (sign === 'elephant') {           // #87, the other half of it
            x.beginPath(); x.ellipse(o + r * 0.1, cy - r * 0.1, r * 0.95, r * 0.62, 0, 0, 6.3); x.fill();
            x.beginPath(); x.arc(o - r * 0.75, cy - r * 0.3, r * 0.42, 0, 6.3); x.fill();
            x.beginPath();                            // the trunk
            x.moveTo(o - r * 1.05, cy - r * 0.05);
            x.quadraticCurveTo(o - r * 1.5, cy + r * 0.6, o - r * 1.0, cy + r * 1.0);
            x.stroke();
            for (const k of [-0.45, 0.1, 0.6]) {      // the legs
              x.beginPath(); x.moveTo(o + k * r, cy + r * 0.4);
              x.lineTo(o + k * r, cy + r * 1.05); x.stroke();
            }

          } else if (sign === 'altar') {              // sacrifica: the fire on the altar
            x.beginPath();
            x.moveTo(o - r * 0.85, cy + r * 1.0); x.lineTo(o - r * 0.6, cy + r * 0.1);
            x.lineTo(o + r * 0.6, cy + r * 0.1); x.lineTo(o + r * 0.85, cy + r * 1.0);
            x.closePath(); x.stroke();
            x.beginPath();                            // the flame
            x.moveTo(o, cy - r * 1.15);
            x.quadraticCurveTo(o + r * 0.55, cy - r * 0.4, o, cy + r * 0.05);
            x.quadraticCurveTo(o - r * 0.55, cy - r * 0.4, o, cy - r * 1.15);
            x.fill();

          } else if (sign === 'ewer') {               // liberaliter: the pouring vessel
            x.beginPath();
            x.moveTo(o - r * 0.62, cy - r * 0.85); x.lineTo(o + r * 0.62, cy - r * 0.85);
            x.lineTo(o + r * 0.45, cy + r * 0.95); x.lineTo(o - r * 0.45, cy + r * 0.95);
            x.closePath(); x.stroke();
            x.beginPath(); x.arc(o + r * 0.75, cy - r * 0.1, r * 0.42, -1.2, 1.2); x.stroke();
            x.beginPath(); x.moveTo(o - r * 0.62, cy - r * 0.85);   // the lip
            x.lineTo(o - r * 1.0, cy - r * 1.05); x.stroke();

          } else if (sign === 'rudder') {             // gubernando: the steering-oar
            x.beginPath(); x.moveTo(o + r * 0.35, cy - r * 1.15);
            x.lineTo(o - r * 0.2, cy + r * 0.35); x.stroke();
            x.beginPath();
            x.moveTo(o - r * 0.2, cy + r * 0.35);
            x.quadraticCurveTo(o - r * 0.95, cy + r * 0.7, o - r * 0.55, cy + r * 1.15);
            x.quadraticCurveTo(o + r * 0.2, cy + r * 0.95, o - r * 0.2, cy + r * 0.35);
            x.fill();

          } else if (sign === 'palm') {               // the victor's branch
            x.beginPath(); x.moveTo(o, cy + r * 1.1); x.lineTo(o, cy - r * 1.1); x.stroke();
            x.lineWidth = 3;
            for (let k = 0; k < 4; k++) {
              const yy = cy - r * 0.9 + k * r * 0.52;
              x.beginPath(); x.moveTo(o, yy); x.quadraticCurveTo(o + r * 0.5, yy - r * 0.1, o + r * 0.85, yy + r * 0.35); x.stroke();
              x.beginPath(); x.moveTo(o, yy); x.quadraticCurveTo(o - r * 0.5, yy - r * 0.1, o - r * 0.85, yy + r * 0.35); x.stroke();
            }
            x.lineWidth = 5;

          } else {                                    // grain — ex labore
            x.beginPath(); x.moveTo(o, cy + r * 1.1); x.lineTo(o, cy - r * 1.1); x.stroke();
            for (let k = 0; k < 3; k++) {
              const yy = cy - r + k * r * 0.6;
              x.beginPath(); x.moveTo(o, yy); x.lineTo(o + r * 0.6, yy - r * 0.25); x.stroke();
              x.beginPath(); x.moveTo(o, yy); x.lineTo(o - r * 0.6, yy - r * 0.25); x.stroke();
            }
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

  // ── Cloths hung on the building ─────────────────────────────────────────
  //
  // Lefaivre, *The Marvelous Body* (ch. 8): in the mirabilia register the
  // building-as-body is not stated, it is "displaced by the architectural
  // CLOTHES that cover it" — and those clothes "take the literal form of cloths
  // draped over parts of the building" as well as the precious materials that
  // "serve to attract attention to particular areas of the building."
  //
  // The world had the precious materials and none of the cloth. A hanging is
  // the cheapest thing in the book's whole vocabulary and it changes a room's
  // register more than another moulding does, because it is the one element
  // that reads as *dressed* rather than as built.
  //
  // Drawn, not modelled: an alpha canvas with the folds and the swag painted
  // in, hung on a plane — the same method as the trophy tunic, and for the same
  // reason (see _spoilTexture).
  _drapeTexture(color, swag) {
    this._drapes = this._drapes || {};
    const key = color + '|' + swag;
    if (this._drapes[key]) return this._drapes[key];
    const W = 256, H = 320;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');
    const hex = '#' + color.toString(16).padStart(6, '0');
    const dark = 'rgba(0,0,0,0.30)';
    const lite = 'rgba(255,255,255,0.16)';

    // the silhouette: hung from the top, sagging between two points, with a
    // ragged weighted hem
    x.fillStyle = hex;
    x.beginPath();
    x.moveTo(4, 6);
    x.lineTo(W - 4, 6);
    x.lineTo(W - 4, H - 70);
    for (let i = 6; i >= 0; i--) {                       // the scalloped hem
      const px = 4 + (W - 8) * (i / 6);
      const dip = (i % 2 ? 46 : 16) + (swag ? 26 : 0);
      x.quadraticCurveTo(px + (W - 8) / 12, H - 70 + dip, px, H - 70 + (i % 2 ? 8 : 30));
    }
    x.closePath();
    x.fill();

    // the folds, and a highlight down the crown of each
    for (let i = 0; i < 7; i++) {
      const px = 18 + i * ((W - 36) / 6);
      x.strokeStyle = dark; x.lineWidth = 9;
      x.beginPath();
      x.moveTo(px, 10);
      x.quadraticCurveTo(px + (i % 2 ? 12 : -12), H * 0.55, px + (i % 2 ? 5 : -5), H - 78);
      x.stroke();
      x.strokeStyle = lite; x.lineWidth = 4;
      x.beginPath();
      x.moveTo(px + 7, 10);
      x.quadraticCurveTo(px + 7 + (i % 2 ? 12 : -12), H * 0.55, px + 7 + (i % 2 ? 5 : -5), H - 78);
      x.stroke();
    }
    // the rod-pocket band along the top
    x.fillStyle = 'rgba(0,0,0,0.22)';
    x.fillRect(4, 6, W - 8, 16);

    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    this._disp.push(t);
    this._drapes[key] = t;
    return t;
  }

  // Hang one. `swag` gives it the deeper festooned hem of a hanging that is
  // gathered rather than dropped straight.
  _drape(x, y, z, w, h, color, { ry = 0, swag = false } = {}) {
    const S = this.style;
    const woodcut = S.key === 'woodcut';
    const mat = new THREE.MeshStandardMaterial({
      map: this._drapeTexture(woodcut ? 0xe8e4da : color, swag),
      transparent: true, alphaTest: 0.4, side: THREE.DoubleSide,
      roughness: 0.95,
    });
    this._disp.push(mat);
    return this._m(new THREE.PlaneGeometry(w, h), mat, x, y, z, { ry, cast: false, receive: true });
  }

  // ── The conspectus of the order ─────────────────────────────────────────
  //
  // The Buffalo annotators' method, applied. They took the full-page woodcut of
  // the Great Pyramid, recognised it as a *conspectus* — a showpiece into which
  // the illustrator had crammed as many architectural components as one image
  // would hold — and labelled every component with the Vitruvian feature it
  // derives from, so that a reader could see a part and go straight to it in the
  // text. Russell compares the result to "a visual menu in a computer program"
  // (2014, pp. 180-81). See ARCHITECTURE.md.
  //
  // Note what they labelled: a PICTURE, not the building. So this is a drawn
  // elevation on a stele beside the portal, not fifteen little plaques stuck on
  // the members themselves — which would read as a hardware catalogue and would
  // wreck the very silhouette the portal is for.
  //
  // EVERY TERM IS THE BOOK'S OWN, attested in this project's translation of
  // chapters XVII-XXXVIII (`translation/en/`): areobate, stylobate, scabelli,
  // plinth, torus, alveus, fascia, hypotrachelion, astragal, volute, abacus,
  // architrave, epistyle, frieze, cornice, cyma, ovolo, gulet. Nothing here is
  // supplied from a modern glossary.
  _orderBoardTexture() {
    if (this._orderBoard) return this._orderBoard;
    const W = 620, H = 1040;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');
    const INK = '#e8dfc6', DIM = '#a8946e', RULE = '#6a5a3c', GROUND = '#141009';

    x.fillStyle = GROUND; x.fillRect(0, 0, W, H);
    x.strokeStyle = RULE; x.lineWidth = 3; x.strokeRect(9, 9, W - 18, H - 18);

    x.fillStyle = INK;
    x.textAlign = 'center';
    x.font = '28px Georgia';
    x.fillText('CONSPECTVS ORDINIS', W / 2, 54);
    x.font = 'italic 15px Georgia';
    x.fillStyle = DIM;
    x.fillText('the members of the order, in the words the book uses for them', W / 2, 78);

    // the elevation, drawn down the left third
    const CXd = 176;
    const draw = (fn) => { x.strokeStyle = INK; x.fillStyle = INK; x.lineWidth = 2.4; fn(); };
    const box = (y, h, halfW, fill) => draw(() => {
      x.beginPath(); x.rect(CXd - halfW, y, halfW * 2, h);
      if (fill) { x.globalAlpha = 0.16; x.fill(); x.globalAlpha = 1; }
      x.stroke();
    });

    // members, top to bottom, with the y they occupy and the name they carry
    const rows = [
      ['CYMA',                    112, 20, 96,  'the wave-moulding that crowns it'],
      ['CORONIX · CORNICE',       132, 30, 104, 'the projecting head of the entablature'],
      ['OVOLO',                   162, 16, 92,  'the quarter-round under the cornice'],
      ['ZOPHORVS · FRIEZE',       178, 44, 86,  'the band that carries the carving'],
      ['EPISTYLIVM · ARCHITRAVE', 222, 34, 92,  'the beam that rests on the capitals'],
      ['ABACVS',                  262, 18, 74,  'the flat tile on top of the capital'],
      ['VOLVTA',                  280, 42, 66,  'the scroll of the Ionic capital'],
      ['ASTRAGALVS',              322, 12, 46,  'the little bead below the capital'],
      ['HYPOTRACHELION',          334, 26, 42,  'the neck of the shaft'],
      ['SCAPVS · THE SHAFT',      360, 336, 40, 'fluted, and tapering as it rises'],
      ['APOPHYGE',                696, 20, 46,  'where the shaft flares to its base'],
      ['TORVS',                   716, 26, 60,  'the cushion-moulding of the base'],
      ['ALVEVS',                  742, 22, 54,  'the hollow between the tori'],
      ['FASCIA',                  764, 20, 62,  'the flat band'],
      ['PLINTHVS',                784, 42, 78,  'the square block the base stands on'],
      ['GVLA · GVLET',            826, 22, 88,  'the throat-moulding of the footing'],
      ['SCABELLVM',               848, 34, 96,  'the pedestal'],
      ['AREOBATA · STYLOBATA',    882, 48, 112, 'the continuous footing under the whole order'],
    ];

    // Labels first, then decide what fits. The base mouldings sit close
    // together and the first build ran their glosses into the next name; a
    // gloss is only drawn where the gap to the following label leaves room.
    const centres = rows.map(([, y, h]) => y + h / 2);
    rows.forEach((r, i) => {
      const [name, y, h, halfW, gloss] = r;
      box(y, h, halfW, i % 2 === 0);
      const my = centres[i];
      draw(() => {
        x.beginPath();
        x.moveTo(CXd + halfW + 4, my);
        x.lineTo(300, my);
        x.lineTo(318, my);
        x.stroke();
        x.beginPath(); x.arc(CXd + halfW + 4, my, 3, 0, 7); x.fill();
      });
      const gap = i + 1 < centres.length ? centres[i + 1] - my : 999;
      x.textAlign = 'left';
      x.fillStyle = INK; x.font = (gap < 26 ? '14px' : '17px') + ' Georgia';
      x.fillText(name, 326, my + 1);
      if (gap >= 30) {
        x.fillStyle = DIM; x.font = 'italic 13px Georgia';
        x.fillText(gloss, 326, my + 17);
      }
    });

    // the flutes on the shaft
    draw(() => {
      x.lineWidth = 1.4;
      for (let i = -3; i <= 3; i++) {
        x.beginPath(); x.moveTo(CXd + i * 11, 362); x.lineTo(CXd + i * 11, 694); x.stroke();
      }
    });

    x.textAlign = 'center';
    x.fillStyle = DIM; x.font = 'italic 13px Georgia';
    x.fillText('after the annotators of the Buffalo copy, who labelled the Great Pyramid the same way', W / 2, H - 34);

    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    this._disp.push(t);
    this._orderBoard = t;
    return t;
  }

  // A carved band laid just proud of a wall face. `signs` spells a specific
  // hieroglyph sequence instead of taking the band's default line.
  _frieze(x, y, z, w, h, kind, { reps = null, ry = 0, rx = 0, signs = null } = {}) {
    if (!this._ornamentCarved()) return null;
    const n = reps || (signs ? signs.length : Math.max(3, Math.round(w * 1.6)));
    const tex = this._carvedTexture(kind, n, signs);
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
    // Curran's hieroglyph bands, read down the flanking piers. The book gives
    // NO itemised sequence for the portal itself (the obelisk's are "most
    // excellently cut" and left at that), so these stay a seeded line from the
    // vocabulary — unlike the elephant's base and the bridge, which are now
    // transcribed. Do not give these a sequence without a source.
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

    // ── The conspectus board ──────────────────────────────────────────────
    // Chapter IV is the book's architectural manifesto — the gate measured to
    // the inch, the Vitruvian rule applied and argued. So the board that names
    // the members stands beside it, facing the dreamer as he comes down from
    // the wood.
    const bx = -11.6, bz = Z + 1.0;
    this._m(new THREE.BoxGeometry(2.5, 0.3, 1.1), this._darkStoneMat, bx, 0.15, bz, { cast: false });
    this._m(new THREE.BoxGeometry(2.2, 0.24, 0.9), this._stoneMat, bx, 0.42, bz, { cast: false, outline: true });
    this._m(new THREE.BoxGeometry(2.0, 3.5, 0.34), this._stoneMat, bx, 2.29, bz, { outline: true });
    this._m(new THREE.BoxGeometry(2.24, 0.22, 0.5), this._stoneMat, bx, 4.15, bz, { cast: false, outline: true });
    const boardMat = new THREE.MeshStandardMaterial({
      map: this._orderBoardTexture(), roughness: 0.9, side: THREE.DoubleSide,
    });
    this._disp.push(boardMat);
    this._m(new THREE.PlaneGeometry(1.78, 3.0), boardMat, bx, 2.32, bz + 0.18, { cast: false });
    this._wallCol(bx - 1.05, bx + 1.05, bz - 0.6, bz + 0.6);

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
    // Cloths on the screen wall behind the throne (Lefaivre ch. 8). Hung in
    // the queen's own colours, and set to frame the throne rather than to
    // cover the wall evenly — the point of the clothing is that it POINTS.
    for (const [dz, col, sw] of [[-3.4, 0xa8324a, false], [-1.15, 0x7a4a9a, true],
                                 [1.15, 0x7a4a9a, true], [3.4, 0xa8324a, false]]) {
      this._drape(WX + 0.42, py + 2.5, CZ + dz, 1.9, 3.2, col, { ry: Math.PI / 2, swag: sw });
    }

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
      // Dallington p. 93: ONE table on each side, and they differ. On the right
      // hand as he goes, "an auncient Helmet crested with a Doggeshead. The
      // bony scalpe of an oxe with two green braunches … And an ould lampe" —
      // PATIENTIA EST ORNAMENTVM, CVSTODIA ET PROTECTIO VITAE; on the other,
      // the circle, the anchor and the dolphin — festina lente. The first
      // build put the anchor on both parapets; the right-hand table was missing.
      if (s < 0) {
        this._frieze(BX, 0.78, BZ + s * 1.54, 2.2, 0.5, 'hieroglyph',
          { signs: ['helmet', 'skull', 'palm', 'lamp'], reps: 4 });   // faces the deck, like the plaque
        this._plaque({ main: 'PATIENTIA EST ORNAMENTVM', sub: 'CVSTODIA ET PROTECTIO VITAE · THE RIGHT-HAND TABLE' },
          1.62, 0.3, BX, 1.26, BZ - 1.5, 0, true);
        continue;
      }
      // The three signs are carved on the INNER face of the parapet, so that a
      // walker crossing the bridge reads them as Poliphilo does — in passing,
      // at arm's length. On the outer face they would face the water.
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
      this._plaque({ main: 'ΑΕΙ ΣΠΕΥΔΕ ΒΡΑΔΕΩΣ', sub: 'SEMPER FESTINA TARDE · ALDVS TOOK THIS FOR HIS PRESS, 1502' },
        1.62, 0.3, BX, 1.26, BZ + 1.5, Math.PI, true);
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

    // ── ΓΕΛΟΙΑΣΤΟΣ — the second fountain (#22), the book's best joke ──────
    // Dallington pp. 117–118 (corpus ll. 4853–4900): "within the Bathe there
    // was another [fountain] of statues of fine metal … glistering of a golden
    // colour", set in a marble niche "with two halfe Collumnes … a Trabet, a
    // smal Zophor, and a Coronice, all cut in one sollid Marble". Two golden
    // nymphs, skirts blown up above the knee, hold an infant between them,
    // his feet one in each of their hands, "all their three countenances
    // smiling", and the boy "continued pissing into the hotte water, fresh
    // coole water". Achoe sends Poliphilo for a cup of it; he treads on the
    // step, "the pissing Boye lift vp his pricke, and cast sodeinlye so colde
    // water vppon my face, that I had lyke at that instant to haue fallen
    // backward" — a hidden lever under the moveable step, "like the Keye and
    // Iacke of a Virginall". On the zophor, in Attic letters: ΓΕΛΟΙΑΣΤΟΣ, the
    // laughable. The step works here: stand on it and he does what he does.
    {
      const NZ = BZ - 2.45;
      this._m(new THREE.BoxGeometry(1.7, 2.3, 0.5), this._stoneMat, BX, 1.15, NZ, { outline: true });
      this._m(new THREE.BoxGeometry(1.2, 1.7, 0.36), this._darkStoneMat, BX, 1.1, NZ + 0.12, { cast: false });
      for (const sx of [-1, 1]) {
        this._m(new THREE.CylinderGeometry(0.11, 0.12, 1.7, 12, 1, false, 0, Math.PI), this._stoneMat,
          BX + sx * 0.72, 1.1, NZ + 0.24, { cast: false });
      }
      this._m(new THREE.BoxGeometry(1.8, 0.14, 0.6), this._stoneMat, BX, 2.02, NZ + 0.05, { cast: false });   // trabet
      this._m(new THREE.BoxGeometry(1.8, 0.2, 0.62), this._darkStoneMat, BX, 2.19, NZ + 0.05, { cast: false }); // zophor
      this._m(new THREE.BoxGeometry(1.95, 0.12, 0.7), this._stoneMat, BX, 2.36, NZ + 0.05, { cast: false });   // cornice
      this._plaque({ main: 'ΓΕΛΟΙΑΣΤΟΣ', sub: 'THE LAVGHABLE · TREAD ON THE STEP' }, 1.3, 0.22, BX, 2.19, NZ + 0.37, 0, true);
      const goldSkin = gold;
      for (const sx of [-1, 1]) {
        const ny = this.cast.nymph({ name: 'geloiastos_' + sx, robe: 0xd9b25a, h: 0.72, pose: 'offer', cutout: null });
        ny.traverse(o => { if (o.isMesh && o.material && o.material.color) o.material = goldSkin; });
        ny.position.set(BX + sx * 0.36, 0.28, NZ + 0.22); ny.rotation.y = -sx * 0.5;
        this.scene.add(ny);
      }
      const boy = new THREE.Group(); boy.position.set(BX, 1.02, NZ + 0.3); this.scene.add(boy);
      this._m(new THREE.SphereGeometry(0.11, 10, 8), gold, 0, 0.25, 0, { parent: boy });
      this._m(new THREE.CapsuleGeometry(0.075, 0.18, 4, 8), gold, 0, 0.02, 0, { parent: boy });
      for (const sx of [-1, 1]) {
        this._m(new THREE.CapsuleGeometry(0.03, 0.14, 4, 6), gold, sx * 0.06, -0.2, 0, { parent: boy });
        this._m(new THREE.CapsuleGeometry(0.028, 0.13, 4, 6), gold, sx * 0.11, 0.06, 0.03, { parent: boy, rz: -sx * 0.8 });
      }
      const jet = this._m(new THREE.CylinderGeometry(0.014, 0.014, 0.06, 5), gold, 0, -0.05, 0.09, { parent: boy });
      jet.rotation.x = Math.PI / 2 - 0.35;
      const stream = new ParticleStream({
        count: 26, source: new THREE.Vector3(BX, 0.98, NZ + 0.42),
        target: new THREE.Vector3(BX, 0.62, NZ + 1.4), color: 0xbfe0ff, size: 0.03, speed: 0.9, arc: 0.4,
      });
      stream.opacity = 0.7; stream.active = true; this.style.tuneStream(stream);
      this.scene.add(stream.points); this._streams.push(stream);
      // the moveable step, on the far side of the water where the cup is filled
      this._m(new THREE.BoxGeometry(0.9, 0.12, 0.6), this._darkStoneMat, BX, 0.06, BZ + 2.75, { cast: false });
      this._plaque({ main: 'TAKE THAT CHRISTAL VESSEL', sub: 'AND BRING MEE SOME OF THAT FRESH WATER · ACHOE' },
        1.3, 0.24, BX, 0.32, BZ + 3.1, 0, true);
      this._geloi = { boy, jet, stream, step: [BX, BZ + 2.75], base: new THREE.Vector3(BX, 0.62, NZ + 1.4),
                      up: 0, laugh: 0 };
    }

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
  // ══ The Colossal Horse ═════════════════════════════════════════════════
  //
  // Five of the book's woodcuts (catalog #6-#10, folios 22-25) and none of it
  // was built. It is the FIRST monument Poliphilo meets in the ruined piazza,
  // before the elephant, and everything the piazza is going to say to him is
  // said here first.
  //
  // Liane Lefaivre reads it in full (*Alberti's Hypnerotomachia Poliphili*,
  // pp. 256-257), and the detail is all hers:
  //
  //   · Across the horse's forehead, the Greek letters **GENEA** — "origin",
  //     and by extension "the first time".
  //   · The pedestal calls him the **equus infoelicitatis**, the stallion of
  //     unhappiness. He is rearing in such panic that he has bucked off all the
  //     little cupids trying to ride him into the triumphal arch.
  //   · One side: **fourteen figures dancing**, seven men and seven women, in
  //     one circle, alternating — but with no contact between the sexes. The
  //     men hold hands with men, the women with women, and the men's arms pass
  //     under the women's. Each dancer wears TWO masks, laughing in front and
  //     weeping behind, so that as they advance an unhappy face is always
  //     turned toward a happy one. Beneath it: **AMISSIO**, waste.
  //   · The other side: young men plucking flowers in a field, among nymphs who
  //     look agitated, as if being robbed of something. Beneath it: **TEMPVS**.
  //
  //   Together, tempus amissio — lost time. Chigi names the monument that way
  //   in his Vatican copy ("the TEMPUS AMISSIO horse", b4v).
  //
  // And on one end of the pedestal, in a garland of marjoram and ferns
  // (catalog #7), the epigram **D · AMBIG · D · D** — *diis ambiguis dono
  // dedit*, "dedicated to the ambiguous gods". That four-letter abbreviation is
  // what triggers **Buffalo Hand E's most explicit statement of his whole
  // system**: *diis ambiguis id est metallis hermafroditis* — the ambiguous
  // gods are the hermaphrodite metals, gold masculine in its height and
  // feminine in its depth, silver the reverse. (`hp.db.folio_descriptions`
  // b5r; Russell 2014, p. 190.)
  _buildColossalHorse() {
    const S = this.style;
    const woodcut = S.key === 'woodcut';
    const HX = 10.5, HZ = 16.5;

    const bronze = woodcut
      ? S.mat({ color: 0x14120e, tone: 0.28, roughness: 0.5 })
      : S.mat({ color: 0x4a5a42, roughness: 0.42, metalness: 0.72 });

    // ── the pedestal ────────────────────────────────────────────────────
    this._m(new THREE.BoxGeometry(4.2, 0.28, 2.6), this._darkStoneMat, HX, 0.14, HZ, { cast: false });
    this._m(new THREE.BoxGeometry(3.8, 1.15, 2.3), this._stoneMat, HX, 0.85, HZ, { outline: true });
    this._m(new THREE.BoxGeometry(4.05, 0.2, 2.5), this._stoneMat, HX, 1.52, HZ, { cast: false, outline: true });
    this._wallCol(HX - 2.1, HX + 2.1, HZ - 1.3, HZ + 1.3);

    // ── the two figured sides, and their one-word verdicts ──────────────
    const panel = (word, z, ry) => {
      // no word baked into the relief: at this panel size the carved capitals
      // ran off the stone, and the plaque beneath already names it
      const tex = this._reliefTexture(word === 'AMISSIO' ? 'The dance of the seven couples'
                                                         : 'Youths plucking flowers among the nymphs', null);
      const mat = this.style.mat({ color: 0xffffff, roughness: 0.88 });
      mat.map = tex; mat.bumpMap = tex; mat.bumpScale = 0.05;
      this._disp.push(mat);
      this._m(new THREE.PlaneGeometry(3.1, 0.78), mat, HX, 0.94, z, { ry, cast: false });
    };
    panel('AMISSIO', HZ + 1.16, 0);
    panel('TEMPVS', HZ - 1.16, Math.PI);
    this._plaque({ main: 'AMISSIO', sub: 'FOURTEEN DANCERS, SEVEN AND SEVEN · EACH MASKED LAUGHING BEFORE AND WEEPING BEHIND' },
      2.9, 0.3, HX, 0.36, HZ + 1.17, 0, true);
    this._plaque({ main: 'TEMPVS', sub: 'YOUTHS PLUCKING FLOWERS AMONG NYMPHS WHO LOOK ROBBED' },
      2.9, 0.3, HX, 0.36, HZ - 1.17, Math.PI, true);

    // ── the two ends: the garlands and their epigrams ───────────────────
    for (const sx of [-1, 1]) {
      const ex = HX + sx * 1.92;
      // the garland — marjoram and ferns on one end, orpine on the other
      const leaf = woodcut ? S.mat({ tone: 0.2 }) : S.mat({ color: 0x4a6a34, roughness: 0.9 });
      for (let i = 0; i <= 10; i++) {
        const u = i / 10;
        const dz = (u - 0.5) * 1.7;
        const dy = 1.18 - Math.sin(u * Math.PI) * 0.42;
        this._m(new THREE.SphereGeometry(0.075 + (i % 3) * 0.018, 7, 5), leaf,
          ex + sx * 0.02, dy, HZ + dz, { cast: false });
      }
      for (const dz of [-0.85, 0.85]) {                    // the tie at each end
        this._m(new THREE.TorusGeometry(0.07, 0.02, 5, 10), leaf, ex + sx * 0.02, 1.18, HZ + dz,
          { ry: Math.PI / 2, cast: false });
      }
    }
    this._plaque({ main: 'D · AMBIG · D · D', sub: 'DIIS AMBIGVIS DONO DEDIT · DEDICATED TO THE AMBIGVOVS GODS' },
      1.85, 0.42, HX + 1.98, 0.72, HZ, Math.PI / 2, true);
    this._plaque({ main: 'EQVVS INFOELICITATIS', sub: 'THE STALLION OF VNHAPPINESS' },
      1.85, 0.42, HX - 1.98, 0.72, HZ, -Math.PI / 2, true);

    // ── the horse, rearing ──────────────────────────────────────────────
    // TWO nested groups, and the reason matters: the yaw turns the beast
    // broadside to the walk, and the rear-up pitch has to happen INSIDE that
    // turn, about the horse's own left-right axis. Applied in the yawed frame
    // it is a roll, not a rear, and the first build had him on his back with
    // his legs in the air.
    const g = new THREE.Group();
    g.position.set(HX, 1.62, HZ);
    g.rotation.y = -Math.PI / 2;                 // broadside to the walk
    this.scene.add(g);
    const rear = new THREE.Group();
    rear.rotation.x = 0.58;                      // up on the haunches
    // rearing about the group origin drops the hind quarters through the
    // plinth, so lift the whole beast until the back hooves sit on the stone
    rear.position.y = 0.34;
    g.add(rear);
    const horse = this.cast.animals.horse(1.85);
    horse.traverse(o => { if (o.isMesh && o.material?.color) o.material = bronze; });
    rear.add(horse);
    // the mane, thrown forward by the panic — inside `rear`, so it rears too
    for (let i = 0; i < 7; i++) {
      const m = this._m(new THREE.ConeGeometry(0.05, 0.3 + (i % 3) * 0.09, 5), bronze,
        0, 1.5 - i * 0.05, -0.58 + i * 0.07, { parent: rear, cast: false });
      m.rotation.x = -1.0 - i * 0.06;
    }

    // THE WINGS. The first build had none, and that was simply wrong: chapter
    // III has "a winged horse" (our own translation's summary), and Lefaivre
    // describes the plate as "a wild, unbridled, WINGED steed ... charging
    // headlong at full gallop, ears drawn back, head twisted sideways, bucking
    // the unlucky riders who try in vain to cling to its back and mane" —
    // and calls that image an emblem for the whole work (pp. 79-80).
    // Caught by re-reading her; see ARCHITECTURE.md.
    for (const sx of [-1, 1]) {
      const wing = new THREE.Group();
      // set at the withers and swept UP and BACK, so the pinions break the
      // skyline instead of lying along the flank where they read as fins.
      wing.position.set(sx * 0.26, 1.24, -0.02);
      wing.rotation.set(0.34, sx * 0.52, sx * 0.30);
      rear.add(wing);
      // seven pinions, longest at the leading edge, fanning back
      for (let i = 0; i < 7; i++) {
        const len = 2.35 - i * 0.24;
        const f = this._m(new THREE.SphereGeometry(0.5, 10, 7, 0, Math.PI), bronze,
          sx * 0.07 * i, -0.06 * i, 0.15 * i, { parent: wing, cast: false });
        f.scale.set(0.42, len, 0.07);
        f.rotation.set(0, 0, sx * (0.10 + i * 0.115));
      }
      // the shoulder of the wing, where it meets the withers
      this._m(new THREE.SphereGeometry(0.2, 10, 8), bronze, 0, -0.1, 0,
        { parent: wing, cast: false }).scale.set(0.8, 1.0, 0.9);
    }

    // GENEA, across the forehead
    this._plaque({ main: 'ΓΕΝΕΑ', sub: 'ORIGIN · THE FIRST TIME' },
      0.72, 0.22, HX + 0.02, 3.95, HZ - 0.78, 0, true);

    // ── the cupids he has bucked off ────────────────────────────────────
    // "he is rearing in such panic that he has bucked all the little cupids
    // who are trying to ride him into the entrance of the triumphal arch."
    const spill = [[-2.7, 1.5, 1.1], [-2.2, -1.6, -0.7], [2.6, 1.9, 2.4]];
    for (let i = 0; i < spill.length; i++) {
      const [dx, dz, rot] = spill[i];
      const putto = this.cast.props.putto ? this.cast.props.putto(0.72) : null;
      if (!putto) break;
      putto.position.set(HX + dx, 0.02, HZ + dz);
      putto.rotation.set(-1.15, rot, 0.35);      // sprawled, not standing
      this.scene.add(putto);
      this._circleCol(HX + dx, HZ + dz, 0.4);
    }

    this._plaque({ main: 'TEMPVS · AMISSIO', sub: 'THE COLOSSAL HORSE · f.22 · THE FIRST OF THE PIAZZA MONUMENTS' },
      2.3, 0.32, HX, 1.72, HZ + 1.30, 0, true);
  }

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

    // ── The hieroglyph stele, and Poliphilo reading it ────────────────────
    //
    // Round the base of the statue in the piazza (signature c1r) runs a band of
    // what Priki calls "Renaissance hieroglyphs" — invented signs, not Egyptian
    // ones, made in imitation of an Egypt nobody could yet read. Poliphilo
    // stands in front of them, thinks, and writes out a sentence:
    //
    //   Ex labore Deo naturae sacrifica liberaliter, paulatim reduces animum
    //   Deo subiectum. Firmam custodiam vitae tuae misericorditer gubernando
    //   tenebit, incolumemque servabit.
    //
    // He introduces it with the formula he uses every time he does this, and he
    // does it all through the book: "Le quale vetustissime et sacre scripture
    // pensiculante, cusi io le interpretai" — musing on these most ancient and
    // sacred writings, I interpreted them thus.
    //
    // That act is what this stele is for. The signs are above and his reading
    // is below, which is how the book stages it, and the gap between the two is
    // the whole humanist game: the decipherment is confident, fluent, and has
    // no way of being checked. (Priki, *The Narrative Function of Hieroglyphs*;
    // Curran, *HP and Renaissance Egyptology*.)
    const stX = -3.1, stZ = 1.5;
    this._m(new THREE.BoxGeometry(2.0, 0.26, 0.9), this._darkStoneMat, stX, 0.13, stZ, { cast: false });
    this._m(new THREE.BoxGeometry(1.76, 2.3, 0.5), this._stoneMat, stX, 1.41, stZ, { outline: true });
    this._m(new THREE.BoxGeometry(1.94, 0.18, 0.66), this._stoneMat, stX, 2.65, stZ, { cast: false, outline: true });
    // The band of signs IS the transcription now — Dallington's itemised list
    // of the elephant's base (pp. 53–54; see HPWorldScene.SIGNS), in his order,
    // read across the two lines: the ox-skull with its tools, the altar on
    // goat's feet with the eye and the vulture, basin and ewer, spindle,
    // stopped vessel, the sole with its eye and the two branches, anchor and
    // goose, the lamp in a hand, the oar with its olive, two grapples, and the
    // dolphin with the ark shut. Twenty signs for twenty things.
    this._frieze(stX, 2.16, stZ + 0.26, 1.6, 0.42, 'hieroglyph',
      { signs: ['skull', 'hook', 'altar', 'eye', 'vulture', 'basin', 'ewer', 'spindle', 'vessel', 'sole'], reps: 10 });
    this._frieze(stX, 1.72, stZ + 0.26, 1.6, 0.42, 'hieroglyph',
      { signs: ['eye', 'palm', 'palm', 'anchor', 'goose', 'lamp', 'rudder', 'hook', 'hook', 'dolphin', 'ark'], reps: 11 });
    // and, beneath them, what he made of them
    this._plaque({ main: 'CVSI IO LE INTERPRETAI', sub: '— AND THUS I INTERPRETED THEM' },
      1.5, 0.3, stX, 1.30, stZ + 0.27, 0, true);
    this._plaque({ main: 'EX LABORE DEO NATVRAE SACRIFICA LIBERALITER',
                   sub: 'OUT OF YOUR LABOUR, SACRIFICE FREELY TO THE GOD OF NATURE' },
      1.6, 0.3, stX, 0.94, stZ + 0.27, 0, true);
    this._plaque({ main: 'PAVLATIM REDVCES ANIMVM DEO SVBIECTVM',
                   sub: 'LITTLE BY LITTLE YOU WILL BRING YOUR SOUL BACK, SUBJECT TO GOD' },
      1.6, 0.3, stX, 0.58, stZ + 0.27, 0, true);
    this._circleCol(stX, stZ, 1.05);
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
    // Priki's six ATTESTED signs — the eye, the vulture, two fish-hooks, two
    // circles — are the ones she names "on the obelisk and on the statue base".
    // The base now carries Dallington's full transcription, so the six go
    // where she also puts them: on the obelisk's faces. A four-sided cylinder
    // has its faces on the diagonals, hence the pi/4 turns; the shaft tapers,
    // so the bands sit on the apothem at their own height. World coordinates,
    // like the plaques (the group is turned through pi).
    for (const [ry, signs] of [[Math.PI / 4, ['eye', 'vulture', 'hook']], [-Math.PI / 4, ['hook', 'circle', 'circle']]]) {
      const yy = 3.55, rr = 0.30 - 0.21 * ((yy - 3.03) / 2.5), ap = rr * Math.SQRT1_2 + 0.012;
      this._frieze(Math.sin(ry) * ap, yy, Math.cos(ry) * ap, rr * 1.32, 0.30, 'hieroglyph', { signs, reps: 3, ry });
    }
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
    // the roof over the hall: beams across the span you look up at, a low
    // tiled pitch with its ridge along the hall, antefixes at the eaves
    this._roof(CX, 0.57 + WH + 0.98, WZ + 4.6, 13.9, 9.6, { pitch: 1.1, ridgeAlong: 'x' });

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

  // ══ The Human Chess Match ══════════════════════════════════════════════
  //
  // Signature g8r-h1r (facsimile pp. 111-113). After the banquet, Queen
  // Eleuterylida's nymphs dance a game of chess: thirty-two maidens on a
  // chequered pavement, sixteen in silver and sixteen in gold, moving to music
  // in three rounds, and when one piece takes another the two kiss before the
  // taken one leaves the board.
  //
  // THE 1499 GIVES IT NO WOODCUT. `page_concordance` has `has_woodcut = 0` for
  // all three pages: the most theatrical scene in the book is the one the
  // printer did not illustrate. So this is built from the text and from what
  // its readers wrote in the margins beside it, and from nothing else.
  //
  // Those readers are the reason it is here. It is the single passage the
  // annotators worked hardest on, in two copies at once:
  //
  //   · BUFFALO (Buffalo & Erie County Public Library, 1499 — the most densely
  //     annotated copy in Russell's census, five interleaved hands). HAND E, an
  //     alchemist of the pseudo-Geber school, read the match as three rounds of
  //     distillation and recorded the result of each. He called the game a
  //     "chorea elegantissima" that was "festivamente iocando" (g8r).
  //     Round 1, silver: 'Argentum', with a crescent moon drawn beside it, and
  //       'Rex ex argento factus victor remanet.'
  //     Round 2, silver again: 'argentum rex ex argento factus victor secunda
  //       vice remanet.'
  //     Round 3, gold at last — and here his hand falters and corrects itself:
  //       'Rex ex auro factus victoriam ultimam et ultimo victor triumphat',
  //       revised to '[Re]gina', 'aura', '☉ uestita', 'victrix', then cancelled
  //       and closed simply with 'Auru(m)'.
  //     (Russell 2014, pp. 188-190; `hp.db.folio_descriptions` h1r.)
  //
  //   · THE VATICAN CHIGI COPY (Inc.Stam.Chig.II.610), annotated by Fabio
  //     Chigi, later Pope Alexander VII, who read the book as theatre: 'comincia
  //     a descrivere il ballo in figura del gioco di scacchi cosa bella' (g8r),
  //     'Torna di nuovo al gioco ò ballo' (g8v), 'terzo ballo ò gioco' (h1r).
  //     He is the reader who calls it a *ballo* first and a game second.
  //
  // THE INVERSION IS THE POINT. The book dresses the QUEEN of both sides in
  // gold and the KING of both sides in silver. Hand E saw at once that this is
  // the wrong way round for his own system — in the Geberian schema Sol is gold
  // and masculine — and read the whole match as the correction of it: a king
  // *made out of silver* wins twice, and only on the third round does gold come
  // out on top. So the liveries below are not decoration; they are the thing
  // the marginalia is about, and they must stay as the book has them.
  _buildChessBallet() {
    const S = this.style;
    const lit = S.key !== 'woodcut';
    const CX = -40, CZ = 6;
    const SQ = 1.15;                      // a square, and a dancer's ground
    const B = 8 * SQ;                     // the board, 9.2 units across

    const light = lit ? S.mat({ color: 0xe4dccb, roughness: 0.55 }) : S.mat({ tone: 0.02, rim: 0 });
    const dark  = lit ? S.mat({ color: 0x2e2a26, roughness: 0.5 })  : S.mat({ tone: 0.28, rim: 0 });
    const gold  = lit ? S.mat({ color: 0xc9a244, metalness: 0.88, roughness: 0.28 }) : S.mat({ tone: 0.02 });

    // ── the pavement ────────────────────────────────────────────────────
    // A stylobate of two courses, then the chequer, then a moulded kerb: the
    // dancers stand on a floor, not on a painted rectangle of grass.
    this._m(new THREE.BoxGeometry(B + 2.4, 0.22, B + 2.4), this._darkStoneMat, CX, 0.11, CZ, { cast: false });
    this._m(new THREE.BoxGeometry(B + 1.5, 0.18, B + 1.5), this._stoneMat, CX, 0.31, CZ, { cast: false, outline: true });
    for (let f = 0; f < 8; f++) {
      for (let r = 0; r < 8; r++) {
        this._m(new THREE.BoxGeometry(SQ, 0.06, SQ), (f + r) % 2 ? light : dark,
          CX + (f - 3.5) * SQ, 0.43, CZ + (r - 3.5) * SQ, { cast: false });
      }
    }
    // the kerb is a FRAME, not a slab — four rails, so nothing lids the floor
    for (const [dx, dz, w, d] of [[0, -(B / 2 + 0.36), B + 0.72, 0.72],
                                  [0,  (B / 2 + 0.36), B + 0.72, 0.72],
                                  [-(B / 2 + 0.36), 0, 0.72, B + 0.72],
                                  [ (B / 2 + 0.36), 0, 0.72, B + 0.72]]) {
      this._m(new THREE.BoxGeometry(w, 0.24, d), this._stoneMat, CX + dx, 0.52, CZ + dz,
        { cast: false, outline: true });
    }
    this._frieze(CX, 0.66, CZ + B / 2 + 0.36, B, 0.2, 'meander');
    this._frieze(CX, 0.66, CZ - B / 2 - 0.36, B, 0.2, 'meander');

    // ── the enclosure: four corner posts and the Queen's canopy ─────────
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      this._column(CX + sx * (B / 2 + 1.1), CZ + sz * (B / 2 + 1.1), 2.6,
        { order: 'ionic', r: 0.15 });
      this._circleCol(CX + sx * (B / 2 + 1.1), CZ + sz * (B / 2 + 1.1), 0.38);
    }
    // The queen watches from the east side, toward her palace.
    const QX = CX + B / 2 + 2.6;
    this._m(new THREE.BoxGeometry(2.6, 0.34, 3.0), this._stoneMat, QX, 0.17, CZ, { cast: false, outline: true });
    this._m(new THREE.BoxGeometry(1.1, 0.5, 1.0), this._stoneMat, QX + 0.1, 0.59, CZ, { outline: true });
    this._m(new THREE.BoxGeometry(1.16, 0.1, 1.06), gold, QX + 0.1, 0.89, CZ, { cast: false });
    for (const sz of [-1, 1]) {
      this._column(QX - 0.9, CZ + sz * 1.3, 2.5, { order: 'corinthian', r: 0.12 });
      this._column(QX + 1.1, CZ + sz * 1.3, 2.5, { order: 'corinthian', r: 0.12 });
    }
    this._entablature(QX + 0.1, 2.6, CZ, 2.6, 3.0);
    this._circleCol(QX, CZ, 1.8);

    // ── the pieces ─────────────────────────────────────────────────────
    //
    // Sixteen a side, and each of the thirty-two wears what the 1499 says she
    // wears. The costumes are built in Cast.paintedFigureTexture, where the
    // Italian and Dallington's English for each rank are set out in full.
    //
    // THE LIVERIES FOLLOW THE PRINTED TEXT. f. g8r: "sedeci vestite d'oro da
    // una parte et sedeci d'argento dal'altra opposite" — sixteen dressed in
    // gold on one side and sixteen in silver on the other, facing; and the
    // king and queen alike are drawn from "quelle sedeci vestite di oro", from
    // among those same sixteen. Each side therefore wears ONE cloth.
    //
    // Russell reports the opposite — "the queen piece of both sides ... is
    // dressed in gold ('vesta d'or'), and the king of both in silver" (2014,
    // p. 188) — and that inversion is what makes Hand E read the match as the
    // correction of the Geberian ideal. But neither phrase he quotes occurs in
    // the printed text, so they are almost certainly the annotator's own words
    // for what he saw, not Colonna's. An earlier pass here built the inversion
    // into the gowns; that put a scholar's gloss on the book's body, which is
    // exactly backwards. The gloss now lives where a gloss belongs: on the
    // round plaques and in the tour note, which say who claims what.
    //
    // The two cloths still have to be told apart across a nine-metre board in a
    // bright garden, so the silver is cooled and the gold deepened until they
    // separate; at the first values both sides read as cream.
    const SILVER = 0xdde6f4, GOLD = 0xc8901c;
    const BACK = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    this._chess = { pieces: [], move: 0, round: 0, t: 0, phase: 'pause', mover: null, taken: null };

    const sq = (f, r) => [CX + (f - 3.5) * SQ, CZ + (r - 3.5) * SQ];

    const addPiece = (side, kind, f, r) => {
      const g = this.cast.nymph({
        name: side + '-' + kind + '-' + f,
        robe: side === 'gold' ? GOLD : SILVER,
        h: kind === 'king' || kind === 'queen' ? 1.02 : kind === 'pawn' ? 0.9 : 0.95,
        // the costume: royal habit, queen's dress, citadel, secretary, horseman,
        // or — for the eight "uniforme" — the violet garland and nothing else
        rank: kind,
        // NOT a painting cut-out, in any variant: a Botticelli figure carries
        // her own colours, and the livery IS the content here (see Cast.nymph).
        cutout: null,
      });
      const [x, z] = sq(f, r);
      // the two sides face each other across the board
      this._npc('chess_' + side + '_' + kind + '_' + f + '_' + r, g, x, z,
        side === 'silver' ? 0 : Math.PI, { sway: 0.02 });
      const p = { g, side, kind, f, r, home: [f, r], alive: true, x, z, ox: x, oz: z, off: 0 };
      this._chess.pieces.push(p);
      return p;
    };

    for (let f = 0; f < 8; f++) {
      addPiece('silver', BACK[f], f, 0);
      addPiece('silver', 'pawn', f, 1);
      addPiece('gold',   BACK[f], f, 7);
      addPiece('gold',   'pawn', f, 6);
    }

    // ── the three rounds ────────────────────────────────────────────────
    // Not a chess engine: the book calls this a *ballo in figura del gioco di
    // scacchi* — a dance in the figure of the game — and the annotators
    // recorded only who won each round, never a move. So the ballet is
    // scripted, and the only facts it asserts are the ones the margins carry:
    // three rounds, captures sealed with a kiss, silver, silver, gold.
    this._chess.rounds = [
      { winner: 'silver', moves: [
        ['silver', 4, 1, 4, 3, false], ['gold', 4, 6, 4, 4, false],
        ['silver', 6, 0, 5, 2, false], ['gold', 1, 7, 2, 5, false],
        ['silver', 5, 0, 2, 3, false], ['gold', 3, 6, 3, 4, false],
        ['silver', 4, 3, 3, 4, true],  ['gold', 2, 5, 3, 4, true],
        ['silver', 5, 2, 3, 4, true],  ['gold', 3, 7, 3, 4, true],
        ['silver', 2, 3, 5, 6, true],  ['gold', 4, 7, 4, 6, false],
        ['silver', 5, 6, 4, 6, true],
      ] },
      { winner: 'silver', moves: [
        ['silver', 3, 1, 3, 3, false], ['gold', 3, 6, 3, 4, false],
        ['silver', 2, 0, 5, 3, false], ['gold', 6, 7, 5, 5, false],
        ['silver', 3, 0, 5, 2, false], ['gold', 5, 6, 5, 5, true],
        ['silver', 5, 3, 5, 5, true],  ['gold', 6, 6, 5, 5, true],
        ['silver', 5, 2, 5, 5, true],  ['gold', 4, 7, 3, 6, false],
        ['silver', 5, 5, 3, 6, true],
      ] },
      { winner: 'gold', moves: [
        ['gold', 4, 6, 4, 4, false],   ['silver', 4, 1, 4, 3, false],
        ['gold', 5, 7, 2, 4, false],   ['silver', 1, 0, 2, 2, false],
        ['gold', 3, 7, 5, 5, false],   ['silver', 6, 1, 6, 2, false],
        ['gold', 5, 5, 5, 1, true],    ['silver', 4, 0, 5, 1, true],
        ['gold', 2, 4, 5, 1, true],    ['silver', 3, 0, 3, 3, false],
        ['gold', 5, 1, 4, 0, true],
      ] },
    ];

    // ── the three plaques the margins wrote ─────────────────────────────
    // One per round, on the west balustrade, in the annotator's own Latin.
    const ROUND_PLAQUES = [
      { main: 'ARGENTVM ☾', sub: 'I · REX EX ARGENTO FACTVS VICTOR REMANET' },
      { main: 'ARGENTVM ☾', sub: 'II · VICTOR SECVNDA VICE REMANET' },
      { main: 'AVRVM ☉',    sub: 'III · VICTORIAM VLTIMAM TRIVMPHAT' },
    ];
    ROUND_PLAQUES.forEach((p, i) => {
      this._plaque(p, 1.55, 0.38, CX - B / 2 - 1.3, 1.15, CZ + (i - 1) * 2.4,
        -Math.PI / 2, true);
    });
    // The costumes, named in the book's own words on the south kerb, so a
    // reader who has just watched a turret walk two squares can find out what
    // she is looking at. Dallington's English is the gloss under each.
    // Low, on the OUTER FACE of the kerb, so it reads as an inscription cut in
    // the step. Hung at eye height and three metres wide it walled the whole
    // south rank off — which is the mistake the note on the north plaque below
    // already warns about, made again ten lines later.
    this._plaque({ main: 'HABITO REGALE · VESTITO DI REGINA',
                   sub: 'CVSTODI DELLA ROCHA · TACITVRNVLI O VERO SECRETARII · EQVITI · ET OCTO VNIFORME' },
      2.6, 0.32, CX, 0.55, CZ - B / 2 - 0.76, Math.PI, true);
    // On the north kerb, low and small enough to read over rather than through:
    // a banner at eye height in front of a board is a wall.
    this._plaque({ main: 'CHOREA ELEGANTISSIMA', sub: 'THE HUMAN CHESS MATCH · f.111 · XXXII MAIDENS, XVI SILVER, XVI GOLD' },
      1.9, 0.3, CX, 0.86, CZ + B / 2 + 1.05, 0, true);

    // ── the musicians ──────────────────────────────────────────────────
    // The game is danced to music. The site makes no sound (DECISIONS.md), so
    // they are here to be seen playing, not heard.
    for (let i = 0; i < 3; i++) {
      const mz = CZ - 2.4 + i * 2.4;
      const m = this.cast.nymph({ name: 'musician_' + i, robe: [0xa88ac0, 0x8aa0c8, 0xc08a9a][i], h: 0.95 });
      this._npc('chess_musician_' + i, m, CX - B / 2 - 2.6, mz, Math.PI / 2, { sway: 0.04 });
    }
  }

  // The ballet, advanced one step at a time. Written as a state machine that
  // can only move forward — every phase has a duration and a next phase, so a
  // missing piece or a bad square ends the move rather than stalling the world.
  // (The dream loop's own hang was fixed the same way; see DreamMode.js.)
  _chessUpdate(dt) {
    const C = this._chess;
    if (!C) return;
    // off-station the ballet does not need to be simulated
    if (Math.abs(this.walker.player.pos.x + 40) > 34 || Math.abs(this.walker.player.pos.z - 6) > 34) return;

    const SQ = 1.15, CX = -40, CZ = 6;
    const sqx = (f) => CX + (f - 3.5) * SQ, sqz = (r) => CZ + (r - 3.5) * SQ;
    const ease = (u) => u * u * (3 - 2 * u);
    C.t += dt;

    const nextMove = () => {
      C.mover = C.taken = null;
      C.move += 1;
      C.t = 0;
      const round = C.rounds[C.round];
      if (!round || C.move >= round.moves.length) { C.phase = 'roundEnd'; return; }
      C.phase = 'move';
    };

    if (C.phase === 'pause') {
      if (C.t > 1.2) { C.t = 0; C.phase = 'move'; }
      return;
    }

    if (C.phase === 'roundEnd') {
      if (C.t < 4.0) return;
      // the pieces walk back to their squares and the next round begins
      for (const p of C.pieces) {
        p.alive = true; p.off = 0;
        p.f = p.home[0]; p.r = p.home[1];
        p.x = p.ox = sqx(p.f); p.z = p.oz = sqz(p.r);
        p.g.position.set(p.x, 0, p.z);
        p.g.visible = true;
      }
      C.round = (C.round + 1) % C.rounds.length;
      C.move = -1;
      nextMove();
      C.phase = 'pause';
      C.t = 0;
      return;
    }

    const round = C.rounds[C.round];
    const spec = round && round.moves[C.move];
    if (!spec) { C.phase = 'roundEnd'; C.t = 0; return; }
    const [side, f0, r0, f1, r1, captures] = spec;

    if (C.phase === 'move') {
      if (!C.mover) {
        C.mover = C.pieces.find(p => p.alive && p.side === side && p.f === f0 && p.r === r0);
        C.taken = captures
          ? C.pieces.find(p => p.alive && p.side !== side && p.f === f1 && p.r === r1)
          : null;
        // a script that has drifted from the board must not stall the dance
        if (!C.mover) { nextMove(); return; }
        C.mover.ox = C.mover.g.position.x; C.mover.oz = C.mover.g.position.z;
      }
      const u = Math.min(1, C.t / 1.5);
      const e = ease(u);
      const tx = sqx(f1), tz = sqz(r1);
      // the taken piece stands its ground; the mover comes to meet it, and
      // stops a little short so the two are face to face rather than inside
      // one another
      const short = C.taken ? 0.42 : 0;
      const dx = tx - C.mover.ox, dz = tz - C.mover.oz;
      const len = Math.hypot(dx, dz) || 1;
      C.mover.g.position.set(
        C.mover.ox + dx * e - (dx / len) * short * e,
        Math.sin(u * Math.PI) * 0.05,             // the dancer's step
        C.mover.oz + dz * e - (dz / len) * short * e,
      );
      if (u >= 1) {
        C.mover.f = f1; C.mover.r = r1;
        C.t = 0;
        C.phase = C.taken ? 'kiss' : 'settle';
      }
      return;
    }

    if (C.phase === 'kiss') {
      // "when one piece takes another, they kiss before being sent off the
      // board" — Russell 2014, p. 189, on the Buffalo annotator's reading
      const u = Math.min(1, C.t / 1.4);
      const lean = Math.sin(u * Math.PI) * 0.20;
      if (C.mover) C.mover.g.rotation.x = lean;
      if (C.taken) C.taken.g.rotation.x = -lean;
      if (u >= 1) {
        if (C.mover) C.mover.g.rotation.x = 0;
        if (C.taken) C.taken.g.rotation.x = 0;
        C.t = 0;
        C.phase = 'exit';
      }
      return;
    }

    if (C.phase === 'exit') {
      const u = Math.min(1, C.t / 1.8);
      const e = ease(u);
      if (C.taken) {
        // taken pieces leave by their own side's edge and stand there watching
        const edge = C.taken.side === 'silver' ? CZ - 4 * SQ - 2.2 : CZ + 4 * SQ + 2.2;
        const lane = CX + ((C.taken.off || 0) - 3.5) * 0.55;
        C.taken.g.position.set(
          C.taken.g.position.x + (lane - C.taken.g.position.x) * e,
          0,
          C.taken.g.position.z + (edge - C.taken.g.position.z) * e,
        );
        if (u >= 1) {
          C.taken.alive = false;
          C.taken.off = C.pieces.filter(p => !p.alive && p.side === C.taken.side).length;
        }
      }
      if (u >= 1) { C.t = 0; C.phase = 'settle'; }
      return;
    }

    // 'settle' — a beat between moves, as a dance has
    if (C.t > 0.7) nextMove();
  }

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
        this._harness(t.team, beast);          // the furniture the 1592 gives it
        beast.position.set(sx, 0, z);
        g.add(beast);
        // "Their hayres yellowe, and falling ouer their fayre neckes, with
        // Pancarpiall garlands of all manner of flowers, vpon their heades."
        // Every rider on every car, and it applies to all four teams: the
        // later cars are described as "in such pompe and manner as before".
        const rider = this.cast.nymph({ robe: TRIUMPH_LIVERY[i], h: 0.62,
                                        hair: 0xc8a24a, garland: 'pancarpial' });
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
  // ── The teams' furniture ─────────────────────────────
  //
  // Dallington 1592 dresses every one of the four teams, and none of it was
  // built. This is the "only where a source documents cloth" rule in
  // ARCHITECTURE.md §0 working the other way: here the source documents it
  // four times over, so it goes in.
  //
  //   ELEPHANTS (Leda) — "Their furniture & traces of pure blewe silke,
  //     twisted with threds of golde and siluer: the fastnings in the
  //     furniture, all made vp with square or true loue knots, lyke square
  //     eares of corne of the Mountaine Garganus. Their Poyterelles of golde,
  //     set with Pearle and stone different in collours."
  //   CENTAURS (Europa) — "with a furniture of gold vpon them, and a long
  //     their strong sides, like horses, excellently framed and illaqueated in
  //     manner of a flagon chayne, whereby they drewe the Tryumph" — and "The
  //     Centaures were crowned with yuie, that is called Dendrocyssos."
  //   UNICORNES (Danaë) — "The poyterelles and furniture about their stronge
  //     breasts, was of golde, set with precious stone, and fringed with
  //     siluer and hayre colloured silke, tyed into knots, in manner of a net
  //     worke, and tasseled at euery prependent point."
  //   LEOPARDS (Bacchus) — "coupled togither with withes of twined vines, full
  //     of tender greene leaues, and stalkes full of greene clusters."
  //
  // Built in the beast's own local frame so it travels with the animal, and
  // kept to the front third of the body: a trace is a working thing that
  // leaves the breast and goes back to the car, not a blanket.
  _harness(kind, beast) {
    const S = this.style;
    const lit = S.key !== 'woodcut';
    const gold   = lit ? S.mat({ color: 0xd8b048, metalness: 0.85, roughness: 0.28 }) : S.mat({ tone: 0.06 });
    const silver = lit ? S.mat({ color: 0xd8dee8, metalness: 0.8, roughness: 0.3 })   : S.mat({ tone: 0.10 });
    const silk   = lit ? S.mat({ color: 0x2a4a9a, roughness: 0.55 })                  : S.mat({ tone: 0.22 });
    const vine   = lit ? S.mat({ color: 0x6a8a3a, roughness: 0.85 })                  : S.mat({ tone: 0.18 });
    const leaf   = lit ? S.mat({ color: 0x4f7a2e, roughness: 0.9 })                   : S.mat({ tone: 0.16 });
    const grape  = lit ? S.mat({ color: 0x3f6a34, roughness: 0.7 })                   : S.mat({ tone: 0.24 });
    const PEARL  = [0xf2ece0, 0xc84a4a, 0x3a7ac8, 0x3a8a5a, 0xd8b048];

    // where the breast is on this cast's quadrupeds, and how far back the
    // trace runs before it leaves the animal
    const BZ = -0.62, BY = 0.56, HALF = 0.30;

    // the poitrel: the band round the breast
    const poitrel = (mat, jewels) => {
      const t = this._m(new THREE.TorusGeometry(HALF, 0.030, 6, 18), mat, 0, BY, BZ + 0.06,
        { parent: beast, cast: false });
      t.rotation.y = Math.PI / 2;
      t.scale.set(1, 0.86, 1);
      if (!jewels) return;
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        this._m(new THREE.SphereGeometry(0.026, 7, 6),
          lit ? S.mat({ color: PEARL[i % PEARL.length], roughness: 0.35, metalness: 0.2 }) : silver,
          Math.cos(a) * HALF * 1.02, BY + Math.sin(a) * HALF * 0.88, BZ + 0.06,
          { parent: beast, cast: false });
      }
    };

    // a trace running back along one flank, from the breast toward the car
    const trace = (mat, len = 1.5) => {
      for (const sx of [-1, 1]) {
        const t = this._m(new THREE.CylinderGeometry(0.022, 0.022, len, 6), mat,
          sx * HALF * 0.96, BY - 0.04, BZ + 0.10 + len / 2, { parent: beast, cast: false });
        t.rotation.x = Math.PI / 2;
      }
    };

    if (kind === 'elephant') {
      // blue silk, and the gold and silver threads twisted through it
      trace(silk, 1.7);
      for (const sx of [-1, 1]) {
        for (const [mat, off] of [[gold, 0.026], [silver, -0.026]]) {
          const t = this._m(new THREE.CylinderGeometry(0.009, 0.009, 1.7, 4), mat,
            sx * HALF * 0.96 + off, BY - 0.04 + off, BZ + 0.95, { parent: beast, cast: false });
          t.rotation.x = Math.PI / 2;
        }
        // "the fastnings ... all made vp with square or true loue knots": a
        // square knot at each fastening, three to a side
        for (let k = 0; k < 3; k++) {
          const kn = this._m(new THREE.BoxGeometry(0.075, 0.075, 0.055), gold,
            sx * HALF * 0.96, BY - 0.04, BZ + 0.34 + k * 0.62, { parent: beast, cast: false });
          kn.rotation.z = Math.PI / 4;
        }
      }
      poitrel(gold, true);
    } else if (kind === 'centaur') {
      // "illaqueated in manner of a flagon chayne" — a chain of linked rings
      // down each strong side, and nothing else: the centaurs wear gold, not
      // cloth
      for (const sx of [-1, 1]) {
        for (let k = 0; k < 9; k++) {
          const ring = this._m(new THREE.TorusGeometry(0.048, 0.014, 5, 10), gold,
            sx * HALF * 0.98, BY - 0.02 - (k % 2) * 0.012, BZ + 0.16 + k * 0.19,
            { parent: beast, cast: false });
          ring.rotation.y = Math.PI / 2;
          ring.rotation.x = (k % 2) * Math.PI / 2;
        }
      }
      poitrel(gold, false);
      // "crowned with yuie, that is called Dendrocyssos". The man's head sits
      // at y≈1.68 on this build — the torso is a 0.62-high figure standing at
      // 0.72 on the withers — and the wreath was first put at 1.34, which is
      // his chest. Measured, not guessed.
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        this._m(new THREE.SphereGeometry(0.026, 6, 5), leaf,
          Math.cos(a) * 0.075, 1.685, -0.50 + Math.sin(a) * 0.075,
          { parent: beast, cast: false }).scale.set(1.5, 0.5, 1);
      }
    } else if (kind === 'unicorn') {
      // gold set with stone, and the net of knots with a tassel hanging at
      // "euery prependent point"
      poitrel(gold, true);
      for (let i = 0; i < 7; i++) {
        const a = Math.PI * (0.12 + (0.76 * i) / 6);
        const px = Math.cos(a) * HALF * 1.0, py = BY + Math.sin(a) * HALF * 0.86;
        // the net: a knot, and the silver-and-silk tassel under it
        this._m(new THREE.BoxGeometry(0.030, 0.030, 0.030), silver, px, py - 0.10, BZ + 0.08,
          { parent: beast, cast: false }).rotation.z = Math.PI / 4;
        const tas = this._m(new THREE.ConeGeometry(0.022, 0.10, 6),
          lit ? S.mat({ color: 0xc8b088, roughness: 0.8 }) : silver,
          px, py - 0.19, BZ + 0.08, { parent: beast, cast: false });
        tas.rotation.x = Math.PI;
      }
      trace(gold, 1.4);
    } else if (kind === 'leopard') {
      // the withe itself, twined; then the tender leaves and the clusters
      trace(vine, 1.5);
      for (const sx of [-1, 1]) {
        const tw = this._m(new THREE.CylinderGeometry(0.013, 0.013, 1.5, 5), vine,
          sx * HALF * 0.96 + 0.028, BY + 0.02, BZ + 0.85, { parent: beast, cast: false });
        tw.rotation.x = Math.PI / 2; tw.rotation.z = 0.12;
        for (let k = 0; k < 5; k++) {
          const zz = BZ + 0.26 + k * 0.30;
          const lf = this._m(new THREE.SphereGeometry(0.052, 6, 5), leaf,
            sx * (HALF * 0.96 + 0.05), BY + 0.06, zz, { parent: beast, cast: false });
          lf.scale.set(1.2, 0.28, 1.0);
          lf.rotation.z = (k % 2 ? 1 : -1) * 0.4;
          if (k % 2 === 0) {
            // "stalkes full of greene clusters" — the grapes are green, still
            for (let b = 0; b < 5; b++) {
              this._m(new THREE.SphereGeometry(0.021, 6, 5), grape,
                sx * (HALF * 0.96 + 0.05) + (b % 2) * 0.024,
                BY - 0.05 - Math.floor(b / 2) * 0.034, zz + 0.02,
                { parent: beast, cast: false });
            }
          }
        }
      }
      poitrel(vine, false);
    }
  }

  _triumphBeast(kind) {
    const S = this.style;
    if (kind === 'elephant') {
      const g = this.cast.animals.horse(1.0);
      g.scale.set(1.25, 1.15, 1.3);
      // "This tryumphant Charyot, was drawen by sixe WHITE Elephants" — the
      // trunk was white and the animal under it was still the cast's brown
      // horse, so Leda's team read as six ponies. The one adjective the book
      // gives the beast is the one it did not have.
      const hide = S.key === 'woodcut' ? null : S.mat({ color: 0xe8e4d8, roughness: 0.82 });
      if (hide) g.traverse(o => { if (o.isMesh && o.material && o.material.color) o.material = hide; });
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

  // ── The Temple of Venus Physizoa ──────────────────────────
  //
  // Fifteen plates in `hp.db.woodcut_catalog` (#71–#85) and, until now, no
  // geometry at all — the largest documented absence in the world. The whole
  // thing is built from OUR translation of chapters XVII–XVIII
  // (`translation/en/page_209.md` to `page_217.md`, CC0), which describes the
  // building from its floor to its finial and then stages a complete liturgy
  // inside it. Godwin is not consulted; he is in copyright and not in the
  // corpus.
  //
  // What the text gives, and what is built here:
  //
  //   THE APPROACH — "seven porphyry steps to the propylaeum", a landing of
  //   black stone "inlaid with Cytherean-conch intaglio" (p. 212). Venus's
  //   scallop, cut into the floor you cross to reach her door.
  //
  //   THE DOOR — great and Doric, of jasper, its gilt open-work valves bolted,
  //   with gold Greek on the lintel. The letters are transcribed ΚΥΛΟΠΕΡΑ and
  //   the reading is UNCERTAIN — flagged in `translation/NOTES.md` and left as
  //   they stand rather than silently corrected, so they stand uncorrected
  //   here too. The valves open BY THEMSELVES: blocks of Indian lodestone set
  //   in the jambs draw the steel-plated leaves, "with temperate slowness",
  //   and they ring on serpentine rollers as they turn (p. 213). The priestess
  //   prays first to Forculus of the leaf, Limentinus of the threshold and
  //   Cardea of the hinge — the three Roman door-gods, named on the jamb.
  //
  //   THE FABRIC — dry-jointed ashlar of white marble, "without iron and
  //   timber" (p. 209): mortarless stereotomy, so nothing here is pinned or
  //   pegged. The wall is pierced in eight bays.
  //
  //   THE FLOOR — porphyry and ophite banding round the pilasters and the
  //   well; ten inlaid roundels stepping inward toward the cistern in red
  //   jasper, gold-flecked litharmenon, green jasper, agate and chalcedony
  //   (p. 209).
  //
  //   THE LAMP — hung from the cupola: a sphere of "most-clean crystal" a
  //   cubit across, on four chains, with four smaller lamps hanging from four
  //   mouths in its rim — one of balas-ruby, one of sapphire, one of emerald,
  //   one of topaz (p. 207–208).
  //
  //   THE LANTERN — eight hollow fluted columns carrying a scaled cupola; on
  //   the projection over each column a simulacrum of one of the eight winds,
  //   winged, turning on a spindle to face away from the blast; eight little
  //   pilasters above, each with an inverted ewer-vase; a stalk rising from the
  //   vase through a huge hollow bronze triangle; and at the summit a bronze
  //   crescent moon, horns to the sky, with an eagle sitting in its sinus.
  //   Four chains hang from under the moon carrying bells with steel balls
  //   sealed inside, which the wind swings against the triangle (p. 210–211).
  //   The temple rings, turns and glows by itself: three self-animating
  //   systems, and the vanes and bells turn here.
  //
  //   THE RITE — the mysterial Cistern in the middle of the floor, unsealed
  //   with a golden key; the priestess (the Antistita) in mitre and veil; Polia
  //   in her tutulus and veil; the seven virgins with the dove-bound book and
  //   the candle that has never yet been lit. The central act, and the reason
  //   the station exists: Poliphilo plunges the burning torch head-down into
  //   the cold water, saying "just as the water shall extinguish this burnable
  //   torch, in the same manner, the fire of love re-kindle her stone-made and
  //   gelid heart" — and the virgins answer "So be it" (p. 216). Polia's own
  //   account of it, two chapters later, is that love "stole her from the
  //   chaste college" and made her put her torch out.
  _buildVenusTemple(TX = -30, TZ = -21) {
    const S = this.style;
    const woodcut = S.key === 'woodcut';
    const M = (color, extra = {}) => woodcut
      ? S.mat({ tone: extra.tone ?? 0.08, rim: extra.rim })
      : S.mat({ color, ...extra, tone: undefined, rim: undefined });

    // The garden's key light is strong and the fill is flat, so a true white
    // marble blows out: the first interior read as a white void with coloured
    // saucers in it. Warmed and dropped until the ashlar takes a lit and an
    // unlit side, which is what "white marble" has to mean in this renderer.
    const marble  = M(0xd6cdb6, { roughness: 0.86 });
    const shadow  = M(0xa89e86, { roughness: 0.9 });
    const porphyr = M(0x7a2a2c, { roughness: 0.6, tone: 0.24 });
    const ophite  = M(0x2f4a34, { roughness: 0.6, tone: 0.3 });
    const black   = M(0x14121a, { roughness: 0.4, metalness: 0.12, tone: 0.34 });
    const jasper  = M(0x8f3428, { roughness: 0.5, tone: 0.26 });
    const gold    = M(0xd9b25a, { metalness: 0.95, roughness: 0.22, tone: 0.04 });
    const bronze  = M(0x8a6a34, { metalness: 0.85, roughness: 0.38, tone: 0.12 });
    const lode    = M(0x24242c, { metalness: 0.4, roughness: 0.7, tone: 0.36 });

    const R = 6.2;            // the drum
    const WALL_H = 5.2;
    const PIER = 0.9;

    // ── the seven porphyry steps, and the propylaeum ──────────────────────
    // They rise from the meadow to the north; the sea and Cythera lie behind
    // the temple, which is the direction the pilgrims leave in.
    //
    // A NOTE ON THE RISE. The walker has no floor height: it walks the world at
    // y = 0 with a fixed eye, so a podium is scenery, not ground, and a tall one
    // would leave the dreamer's feet a metre under his own temple floor. Every
    // raised thing in this world is therefore shallow — the chess stylobate is
    // 0.43 — so the seven steps are seven, as the book says, but each is 6cm:
    // a crepidoma read from outside rather than a stair climbed. The alternative
    // is a temple you stand inside up to your chest.
    const RISE = 0.06;
    const zFront = TZ + R;
    for (let i = 0; i < 7; i++) {
      const w = 7.4 - i * 0.22;
      this._m(new THREE.BoxGeometry(w, RISE, 0.46), porphyr,
        TX, RISE / 2 + i * RISE, zFront + 3.3 - i * 0.46, { cast: false });
    }
    const PLAT_Y = 7 * RISE;
    this._m(new THREE.BoxGeometry(7.0, 0.22, 3.4), black, TX, PLAT_Y + 0.11, zFront + 1.1,
      { cast: false, outline: true });
    // "inlaid with Cytherean-conch intaglio": Venus's scallop, cut in the
    // black landing you cross to reach her door. Ribs radiating from a hinge.
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI * (0.5 + (i / 12 - 0.5) * 0.86);
      const L = 1.5;
      const rib = this._m(new THREE.BoxGeometry(0.05, 0.03, L), marble,
        TX + Math.cos(a) * L * 0.5, PLAT_Y + 0.23, zFront + 1.95 - Math.sin(a) * L * 0.5,
        { cast: false });
      rib.rotation.y = a - Math.PI / 2;
    }
    this._m(new THREE.CylinderGeometry(0.34, 0.34, 0.04, 16), marble,
      TX, PLAT_Y + 0.23, zFront + 1.95, { cast: false });

    // ── the drum: eight bays, seven of them windows and one the door ──────
    const bay = (k) => (k * Math.PI * 2) / 8;
    for (let k = 0; k < 8; k++) {
      const a = bay(k) + Math.PI / 8;      // the piers sit BETWEEN the bays
      const px = TX + Math.sin(a) * R, pz = TZ + Math.cos(a) * R;
      const p = this._m(new THREE.BoxGeometry(PIER, WALL_H, 1.0), marble,
        px, PLAT_Y + WALL_H / 2, pz, { outline: true });
      p.rotation.y = a;
      this._circleCol(px, pz, 0.62);
      // the spandrel over each bay, so the wall reads as pierced rather than
      // as eight standing stones
      const b = bay(k);
      const bx = TX + Math.sin(b) * R, bz = TZ + Math.cos(b) * R;
      const lint = this._m(new THREE.BoxGeometry(4.0, 0.9, 0.9), marble,
        bx, PLAT_Y + WALL_H - 0.45, bz, { cast: false });
      lint.rotation.y = b;
      const sill = this._m(new THREE.BoxGeometry(4.0, 1.1, 0.9),
        k === 0 ? marble : shadow, bx, PLAT_Y + 0.55, bz, { cast: false });
      sill.rotation.y = b;
      if (k === 0) sill.visible = false;                 // the bay with the door
    }

    // the entablature ring and the scaled cupola
    for (let k = 0; k < 8; k++) {
      const b = bay(k);
      this._entablature(TX + Math.sin(b) * R, PLAT_Y + WALL_H, TZ + Math.cos(b) * R,
        5.0, 1.1, { ry: b, dentils: false });
    }
    // "A scaled cupola resided" — the courses are drawn as diminishing rings,
    // which is what a scaled dome is: overlapping courses of stone.
    const DOME_Y = PLAT_Y + WALL_H + 0.95;
    // The courses are open-ended shells, so they must be DOUBLE-sided or the
    // dome is invisible from underneath and you stand in the temple looking at
    // open sky through your own roof. (Found by looking up, not by reading.)
    const domeA = marble.clone(), domeB = shadow.clone();
    domeA.side = THREE.DoubleSide; domeB.side = THREE.DoubleSide;
    this._disp.push(domeA, domeB);
    const SC = 9;
    for (let i = 0; i < SC; i++) {
      const t = i / SC, t2 = (i + 1) / SC;
      const r0 = R * Math.cos(t * Math.PI / 2) * 1.02;
      const r1 = R * Math.cos(t2 * Math.PI / 2) * 1.02;
      this._m(new THREE.CylinderGeometry(r1, r0, R * 0.46 / SC * 2.2, 32, 1, true),
        i % 2 ? domeA : domeB,
        TX, DOME_Y + Math.sin(t * Math.PI / 2) * R * 0.52, TZ, { cast: false });
    }
    const APEX = DOME_Y + R * 0.52;

    // ── the door: jasper, Doric, its gilt valves standing open ────────────
    // The door bay is 4.7 wide and the doorcase 3.6, so without these two
    // returns the case stood in the middle of a hole and read as a red screen
    // parked in front of the temple rather than as its door.
    const dz = TZ + R;
    for (const sx of [-1, 1]) {
      this._m(new THREE.BoxGeometry(1.5, WALL_H, 0.95), marble,
        TX + sx * 2.34, PLAT_Y + WALL_H / 2, dz, { cast: false, outline: true });
    }
    this._m(new THREE.BoxGeometry(0.55, 3.5, 1.15), jasper, TX - 1.35, PLAT_Y + 1.75, dz, { outline: true });
    this._m(new THREE.BoxGeometry(0.55, 3.5, 1.15), jasper, TX + 1.35, PLAT_Y + 1.75, dz, { outline: true });
    this._m(new THREE.BoxGeometry(3.6, 0.55, 1.2), jasper, TX, PLAT_Y + 3.78, dz, { cast: false, outline: true });
    // The two tablets OF MAGNET flanking the ingress, which are both the
    // machine that opens the door and the creed of the whole place: the stone
    // that draws iron, carrying the two mottoes that say desire is natural law.
    // Right, in antiquarian Latin: TRAHIT SVA QVEMQVE VOLVPTAS, "each is drawn
    // by his own pleasure" (Virgil, Ecl. II.65). Left, in ancient Greek
    // majuscules: ΠΑΝ ΔΕΙ ΠΟΙΕΙΝ ΚΑΤΑ ΤΗΝ ΑΥΤΟΥ ΦΥΣΙΝ, "each ought to do
    // according to his own nature." (Our translation, page_214.) The blocks
    // were built and left blank on the first pass — the temple's own thesis,
    // omitted from its door.
    for (const sx of [-1, 1]) {
      this._m(new THREE.BoxGeometry(1.30, 0.62, 0.24), lode, TX + sx * 2.34, PLAT_Y + 2.95, dz + 0.50,
        { cast: false, outline: true });
    }
    this._plaque({ main: 'TRAHIT SVA QVEMQVE VOLVPTAS', sub: 'EACH IS DRAWN BY HIS OWN PLEASVRE · VIRGIL' },
      1.22, 0.36, TX + 2.34, PLAT_Y + 2.95, dz + 0.63, 0, true);
    this._plaque({ main: 'ΠΑΝ ΔΕΙ ΠΟΙΕΙΝ ΚΑΤΑ ΤΗΝ ΑΥΤΟΥ ΦΥΣΙΝ',
                   sub: 'EACH OVGHT TO DO ACCORDING TO HIS OWN NATVRE' },
      1.22, 0.36, TX - 2.34, PLAT_Y + 2.95, dz + 0.63, 0, true);
    // and the smaller blocks in the jambs themselves, which draw the leaves
    for (const sx of [-1, 1]) {
      this._m(new THREE.BoxGeometry(0.26, 0.5, 0.4), lode, TX + sx * 1.35, PLAT_Y + 2.4, dz + 0.42,
        { cast: false });
    }
    // the valves, swung back against the jambs, gilt and open-worked
    for (const sx of [-1, 1]) {
      const leaf = this._m(new THREE.BoxGeometry(1.05, 3.3, 0.12), gold,
        TX + sx * 1.62, PLAT_Y + 1.72, dz - 0.5, { cast: false });
      leaf.rotation.y = sx * 1.15;
      for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) {
        const cut = this._m(new THREE.BoxGeometry(0.3, 0.42, 0.16), black,
          TX + sx * 1.62, PLAT_Y + 0.85 + r * 0.66, dz - 0.5, { cast: false });
        cut.rotation.y = sx * 1.15;
        cut.position.x += Math.cos(sx * 1.15) * (c - 0.5) * 0.42;
        cut.position.z -= Math.sin(sx * 1.15) * (c - 0.5) * 0.42;
      }
      // the serpentine roller the leaf turns and sings on
      this._m(new THREE.CylinderGeometry(0.11, 0.11, 0.3, 10), ophite,
        TX + sx * 1.35, PLAT_Y + 0.15, dz - 0.3, { cast: false });
    }
    this._plaque({ main: 'ΚΥΛΟΠΕΡΑ', sub: 'THE LETTERS AS THEY STAND · READING VNCERTAIN' },
      3.0, 0.42, TX, PLAT_Y + 3.80, dz + 0.62, 0, true);
    // On the RETURN wall beside the door, not on the jamb: at 2.0 wide and
    // centred on the jamb it hung straight across the opening.
    this._plaque({ main: 'FORCVLO · LIMENTINO · CARDEAE',
                   sub: 'THE GOD OF THE LEAF · OF THE THRESHOLD · OF THE HINGE' },
      1.36, 0.28, TX + 2.34, PLAT_Y + 1.55, dz + 0.50, 0, true);

    // ── the floor: banded, and ten roundels stepping in to the well ───────
    // The pavement is NOT white. The book bands it in porphyry and ophite and
    // sets coloured roundels in it — and a white floor under this key light
    // turned the whole interior into an overexposed void with the rite lost in
    // the middle of it. Warm stone field, the two documented bands over it.
    const pave = M(0x9a8b6c, { roughness: 0.9, tone: 0.14 });
    this._m(new THREE.CylinderGeometry(R - 0.4, R - 0.4, 0.12, 32), pave,
      TX, PLAT_Y + 0.06, TZ, { cast: false });
    this._m(new THREE.CylinderGeometry(R - 0.5, R - 0.5, 0.03, 32), porphyr, TX, PLAT_Y + 0.13, TZ, { cast: false });
    this._m(new THREE.CylinderGeometry(R - 1.0, R - 1.0, 0.03, 32), ophite,  TX, PLAT_Y + 0.14, TZ, { cast: false });
    this._m(new THREE.CylinderGeometry(R - 1.4, R - 1.4, 0.03, 32), pave,    TX, PLAT_Y + 0.15, TZ, { cast: false });
    // "ten foot-wide inlaid roundels radiating in", graded in colour as they
    // approach the cistern
    // Ten roundels, "radiating in" — INLAY, so they sit flush and read as
    // stone, not as ten dinner plates left on the floor. First cut at 0.52
    // radius in full-strength colour did exactly that.
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const rr = (R - 2.1) - (i % 5) * 0.30;
      const col = [0x8a3a30, 0xa8894a, 0x46664a, 0x9a8f77, 0xc4bda9][i % 5];
      this._m(new THREE.CylinderGeometry(0.36, 0.36, 0.02, 18), M(col, { roughness: 0.55, tone: 0.2 }),
        TX + Math.sin(a) * rr, PLAT_Y + 0.165, TZ + Math.cos(a) * rr, { cast: false });
      this._m(new THREE.TorusGeometry(0.375, 0.014, 6, 20), shadow,
        TX + Math.sin(a) * rr, PLAT_Y + 0.168, TZ + Math.cos(a) * rr,
        { cast: false, rx: Math.PI / 2 });
    }

    // ── the Asaroton, under the aisle ─────────────────────────────────────
    // p. 209: "Under the vaulting were, in the floor, an Asaroton of wormwork
    // emblems — foliage, animals, and flowers, tessellated of most-minute
    // little bodies". The asaroton is the "unswept floor" — scattered motifs
    // on a ground, the type Sosus made at Pergamon (Pliny 36.184) — so it is
    // DRAWN, as the register that works here: an annulus of tesserae with
    // leaves, flowers and small creatures strewn across it, between the
    // piers and the roundels.
    if (!woodcut) {
      const ac = document.createElement('canvas'); ac.width = 1024; ac.height = 256;
      const x = ac.getContext('2d');
      x.fillStyle = '#d9d0bb'; x.fillRect(0, 0, 1024, 256);
      const rnd = (i) => { const v = Math.sin(i * 127.1) * 43758.5453; return v - Math.floor(v); };
      for (let i = 0; i < 6000; i++) {            // the tesserae
        x.fillStyle = ['#cfc6b0', '#e2d9c4', '#c4bba6'][i % 3];
        x.fillRect((i * 37) % 1024, (Math.floor(i / 27) * 9) % 256, 7, 7);
      }
      for (let i = 0; i < 70; i++) {              // leaves, flowers, creatures
        const px = rnd(i) * 1024, py = 20 + rnd(i + 99) * 216, k = i % 5;
        x.save(); x.translate(px, py); x.rotate(rnd(i + 7) * 6.28);
        if (k < 2) { x.fillStyle = '#4f7a2e'; x.beginPath(); x.ellipse(0, 0, 16, 6, 0, 0, 7); x.fill();
                     x.strokeStyle = '#2f4a1a'; x.lineWidth = 2; x.beginPath(); x.moveTo(-16, 0); x.lineTo(16, 0); x.stroke(); }
        else if (k === 2) { x.fillStyle = ['#c83a4a', '#e0b028', '#7a5bb8'][i % 3];
                            for (let q = 0; q < 5; q++) { x.beginPath(); x.arc(Math.cos(q * 1.257) * 7, Math.sin(q * 1.257) * 7, 5, 0, 7); x.fill(); }
                            x.fillStyle = '#f0e6a0'; x.beginPath(); x.arc(0, 0, 3.5, 0, 7); x.fill(); }
        else if (k === 3) { x.fillStyle = '#5a4a3a'; x.beginPath(); x.ellipse(0, 0, 9, 5, 0, 0, 7); x.fill();   // a mouse
                            x.beginPath(); x.arc(9, -1, 3.5, 0, 7); x.fill(); x.strokeStyle = '#5a4a3a'; x.lineWidth = 1.5;
                            x.beginPath(); x.moveTo(-9, 0); x.quadraticCurveTo(-18, 4, -22, -3); x.stroke(); }
        else { x.fillStyle = '#3a6a8a'; x.beginPath(); x.ellipse(0, 0, 10, 4, 0, 0, 7); x.fill();               // a fish
               x.beginPath(); x.moveTo(-10, 0); x.lineTo(-15, -5); x.lineTo(-15, 5); x.closePath(); x.fill(); }
        x.restore();
      }
      const at = new THREE.CanvasTexture(ac); at.colorSpace = THREE.SRGBColorSpace;
      at.wrapS = THREE.RepeatWrapping; at.repeat.set(6, 1); at.anisotropy = 8; this._disp.push(at);
      const am = new THREE.MeshStandardMaterial({ map: at, roughness: 0.9 }); this._disp.push(am);
      this._m(new THREE.RingGeometry(R - 1.95, R - 0.55, 64), am, TX, PLAT_Y + 0.155, TZ, { rx: -Math.PI / 2, cast: false });
    }

    // ── the mysterial Cistern ─────────────────────────────────────────────
    const WY = PLAT_Y + 0.18;
    this._m(new THREE.CylinderGeometry(1.30, 1.42, 0.30, 24), black, TX, WY + 0.15, TZ, { cast: false });
    this._m(new THREE.CylinderGeometry(1.08, 1.08, 0.62, 24, 1, true), marble, TX, WY + 0.61, TZ,
      { cast: false, outline: true });
    this._m(new THREE.TorusGeometry(1.10, 0.09, 8, 26), marble, TX, WY + 0.92, TZ,
      { cast: false, rx: Math.PI / 2 });
    this._circleCol(TX, TZ, 1.35);
    // the water in the mouth of it
    this._m(new THREE.CircleGeometry(1.02, 24), this._waterMat(), TX, WY + 0.66, TZ,
      { rx: -Math.PI / 2, cast: false });
    // the bolted bronze lid, unsealed and swung back on the kerb
    const lid = this._m(new THREE.CylinderGeometry(1.05, 1.05, 0.07, 22), bronze,
      TX - 1.72, WY + 0.62, TZ + 0.5, { cast: false });
    lid.rotation.z = 0.42;
    this._m(new THREE.TorusGeometry(0.16, 0.035, 6, 12), bronze, TX - 1.72, WY + 0.72, TZ + 0.5,
      { cast: false, rx: Math.PI / 2 });
    // the golden little key, laid on the kerb where she left it
    this._m(new THREE.CylinderGeometry(0.025, 0.025, 0.34, 6), gold, TX + 0.62, WY + 0.99, TZ + 0.86,
      { cast: false, rz: Math.PI / 2 });
    this._m(new THREE.TorusGeometry(0.075, 0.022, 6, 12), gold, TX + 0.80, WY + 0.99, TZ + 0.86,
      { cast: false, rx: Math.PI / 2 });

    // THE TORCH, turned with the little flame downward into the middle of the
    // orifice. This is the act the whole station is for.
    const torch = new THREE.Group();
    torch.position.set(TX, WY + 1.5, TZ);
    torch.rotation.x = Math.PI - 0.30;
    this._m(new THREE.CylinderGeometry(0.045, 0.055, 1.05, 8), M(0x6a4a28, { roughness: 0.9, tone: 0.2 }),
      0, 0.52, 0, { parent: torch });
    this._m(new THREE.TorusGeometry(0.075, 0.018, 6, 12), bronze, 0, 0.98, 0, { parent: torch, rx: Math.PI / 2 });
    // the head, guttering: still alight, but only just, and pointing down
    const flame = this._m(new THREE.ConeGeometry(0.085, 0.30, 9),
      woodcut ? S.mat({ tone: 0.04 })
              : S.mat({ color: 0xffbe4a, emissive: 0xd07018, emissiveIntensity: 1.1, roughness: 0.5 }),
      0, 1.16, 0, { parent: torch, cast: false });
    flame.rotation.x = Math.PI;
    this.scene.add(torch);
    // NOT a `_float`: that registry assigns `position.y` outright rather than
    // adding to it, so a prop 2.7 units up would drop to the floor.

    // the steam where the flame meets the cold water
    const steam = new ParticleStream({
      count: 22,
      source: new THREE.Vector3(TX, WY + 0.72, TZ),
      target: new THREE.Vector3(TX + 0.2, WY + 2.6, TZ + 0.1),
      color: 0xe8e4d8, size: 0.05, speed: 0.3, arc: 0.5,
    });
    steam.opacity = 0.30; steam.active = true;
    this.style.tuneStream(steam);
    this.scene.add(steam.points);
    this._streams.push(steam);

    // ── the altar (#80), and the candle that had never been lit ───────────
    const AX = TX, AZ = TZ - 3.5;
    this._m(new THREE.BoxGeometry(2.0, 0.24, 1.3), black, AX, WY + 0.12, AZ, { cast: false });
    this._m(new THREE.CylinderGeometry(0.72, 0.86, 1.05, 20), marble, AX, WY + 0.76, AZ, { outline: true });
    this._m(new THREE.CylinderGeometry(0.92, 0.78, 0.16, 20), marble, AX, WY + 1.36, AZ, { cast: false });
    this._frieze(AX, WY + 1.05, AZ + 0.80, 1.5, 0.28, 'meander');
    this._circleCol(AX, AZ, 1.0);
    // the pure candle, kindled from the torch before it was quenched
    this._m(new THREE.CylinderGeometry(0.045, 0.05, 0.62, 8), M(0xf2ecd8, { roughness: 0.7 }),
      AX + 0.34, WY + 1.75, AZ, { cast: false });
    this._m(new THREE.ConeGeometry(0.05, 0.15, 8),
      woodcut ? S.mat({ tone: 0.04 })
              : S.mat({ color: 0xffd88a, emissive: 0xe0a030, emissiveIntensity: 1.2, roughness: 0.5 }),
      AX + 0.34, WY + 2.12, AZ, { cast: false });
    // the ritual book, bound in cyan velvet worked into the shape of a dove
    this._m(new THREE.BoxGeometry(0.42, 0.09, 0.30), M(0x2a7a9a, { roughness: 0.75 }),
      AX - 0.34, WY + 1.49, AZ, { cast: false });
    this._m(new THREE.SphereGeometry(0.075, 8, 7), M(0x2a7a9a, { roughness: 0.75 }),
      AX - 0.50, WY + 1.55, AZ, { cast: false });

    // ── the miracle of the roses (#84), and the sacrifice of the swans (#79) ─
    // Our translation, page_224, the argument of chapter XVIII: "she scattered
    // the roses, and, the sacrifice of the swans being made, from it
    // miraculously germinated a rose-bush with fruits and flowers. Both of
    // them tasted of these." Plate #79 has two virgins offering swans and
    // doves; #84 the rose-tree rising from the altar with the doves flying.
    // So: a rose-bush rising out of the altar-top, in flower and in fruit,
    // the two virgins with the two swans, and the doves going up.
    const roseM = M(0xc83a4a, { roughness: 0.7, tone: 0.2 });
    const fruitM = M(0xd8602a, { roughness: 0.6, tone: 0.18 });
    const stem = M(0x4a6a2a, { roughness: 0.9, tone: 0.2 });
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2, rr = 0.12 + (k % 3) * 0.1;
      const st = this._m(new THREE.CylinderGeometry(0.02, 0.03, 0.9 + (k % 2) * 0.3, 5), stem,
        AX + Math.cos(a) * rr, WY + 1.9 + (k % 2) * 0.15, AZ + Math.sin(a) * rr, { cast: false });
      st.rotation.z = Math.cos(a) * 0.35; st.rotation.x = -Math.sin(a) * 0.35;
      const top = [AX + Math.cos(a) * (rr + 0.28), WY + 2.36 + (k % 2) * 0.3, AZ + Math.sin(a) * (rr + 0.28)];
      this._m(new THREE.SphereGeometry(0.07, 8, 6), k % 3 === 2 ? fruitM : roseM, ...top, { cast: false });
      this._m(new THREE.SphereGeometry(0.06, 6, 5), this._leafMat, top[0] - 0.06, top[1] - 0.08, top[2] + 0.05, { cast: false }).scale.set(1.4, 0.4, 1);
    }
    for (const sx of [-1, 1]) {
      const v = this.cast.nymph({ name: 'swan_virgin_' + sx, robe: 0xf2eee2, h: 0.95, rank: 'tutulus', cutout: null, pose: 'offer' });
      this._npc('venus_swan_virgin_' + (sx + 1), v, AX + sx * 1.5, AZ + 1.3, sx * 0.5 + Math.PI, { sway: 0.03 });
      const sw = this.cast.animals.swan(0.7); sw.position.set(AX + sx * 1.5, 0.95, AZ + 1.0); this.scene.add(sw);
    }
    for (let k = 0; k < 3; k++) {
      const dove = this.cast.animals.bird ? this.cast.animals.bird(0.5) : null;
      if (!dove) break;
      dove.position.set(AX + (k - 1) * 0.6, WY + 3.0 + k * 0.45, AZ + 0.3 - k * 0.2); this.scene.add(dove);
      this._hovers.push({ g: dove, y: dove.position.y, phase: k * 1.3 });
    }
    this._plaque({ main: 'MIRACVLVM ROSARVM', sub: 'THE ROSES SCATTERED, THE SWANS OFFERED, A ROSE-BVSH RISES FROM THE ALTAR · CH. XVIII' },
      2.4, 0.38, AX, WY + 0.5, AZ + 0.9, 0, true);

    // ── the great lamp, hung from the cupola on four chains ───────────────
    const LY = PLAT_Y + WALL_H - 0.9;
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
      const ch = this._m(new THREE.CylinderGeometry(0.018, 0.018, 2.4, 5), bronze,
        TX + Math.sin(a) * 0.34, LY + 1.5, TZ + Math.cos(a) * 0.34, { cast: false });
      ch.rotation.x = Math.sin(a) * 0.09;
      ch.rotation.z = -Math.cos(a) * 0.09;
    }
    this._m(new THREE.SphereGeometry(0.52, 18, 14),
      woodcut ? S.mat({ tone: 0.03 })
              : S.mat({ color: 0xdfeaf2, roughness: 0.08, metalness: 0.1,
                        transparent: true, opacity: 0.42,
                        emissive: 0xfff0c0, emissiveIntensity: 0.5 }),
      TX, LY, TZ, { cast: false });
    // "one of Balas-ruby; the other of Sapphire; the third of Emerald; the
    // last of Topaz" — four little lamps in four mouths of the great one
    const GEMS = [0xb3243c, 0x1e3f96, 0x0d7548, 0xdca62c];
    GEMS.forEach((c, k) => {
      const a = (k / 4) * Math.PI * 2;
      this._m(new THREE.SphereGeometry(0.17, 12, 10),
        woodcut ? S.mat({ tone: 0.16 })
                : S.mat({ color: c, roughness: 0.14, metalness: 0.3,
                          emissive: c, emissiveIntensity: 0.7 }),
        TX + Math.sin(a) * 0.62, LY - 0.30, TZ + Math.cos(a) * 0.62, { cast: false });
    });

    // ── the lantern, and the finial that rings itself ─────────────────────
    const LR = 1.75;
    const lantern = new THREE.Group();
    const LB = APEX - 0.15;      // the lantern's own floor, on the cupola
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      const lx = Math.sin(a) * LR, lz = Math.cos(a) * LR;
      // the entablature block over each column, and the wind that stands on it
      this._m(new THREE.BoxGeometry(0.62, 0.34, 0.62), marble, lx, 2.62, lz,
        { parent: lantern, cast: false, ry: a });
      const vane = new THREE.Group();
      vane.position.set(lx, 2.92, lz);
      this._m(new THREE.CylinderGeometry(0.022, 0.022, 0.34, 6), bronze, 0, 0.17, 0, { parent: vane, cast: false });
      const body = this._m(new THREE.CapsuleGeometry(0.055, 0.20, 4, 7), bronze, 0, 0.44, 0, { parent: vane, cast: false });
      void body;
      for (const sx of [-1, 1]) {
        const w = this._m(new THREE.BoxGeometry(0.30, 0.12, 0.03), bronze,
          sx * 0.18, 0.50, 0, { parent: vane, cast: false });
        w.rotation.z = sx * 0.30;
      }
      lantern.add(vane);
      // NOT `_vanes`. That registry is Fortuna's, and its entries carry
      // {rate, phase} and are integrated with `+=`; these are absolute and
      // carry {k}. Sharing it made each animator write NaN through the other's
      // meshes — caught by counting the registry and finding ten vanes where
      // eight were built.
      this._windVanes.push({ g: vane, k });
      // the little pilaster above, and its ewer-vase with the mouth inverted
      this._m(new THREE.BoxGeometry(0.20, 0.40, 0.20), marble, lx * 0.72, 3.30, lz * 0.72,
        { parent: lantern, cast: false, ry: a });
      const ewer = this._m(new THREE.SphereGeometry(0.16, 10, 8), bronze,
        lx * 0.72, 3.62, lz * 0.72, { parent: lantern, cast: false });
      ewer.scale.set(1, 1.25, 1);
    }
    // the scaled cupola of the lantern
    for (let i = 0; i < 5; i++) {
      const t = i / 5, t2 = (i + 1) / 5;
      this._m(new THREE.CylinderGeometry(LR * 1.1 * Math.cos(t2 * Math.PI / 2),
                                         LR * 1.1 * Math.cos(t * Math.PI / 2), 0.24, 20, 1, true),
        i % 2 ? domeA : domeB, 0, 2.95 + t * 1.0, 0, { parent: lantern, cast: false });
    }
    // the stalk, the hollow triangle, the moon and the eagle
    this._m(new THREE.CylinderGeometry(0.035, 0.045, 2.5, 8), bronze, 0, 5.1, 0,
      { parent: lantern, cast: false });
    for (let e = 0; e < 3; e++) {
      const a = (e / 3) * Math.PI * 2 + Math.PI / 2;
      const side = this._m(new THREE.BoxGeometry(0.95, 0.07, 0.07), bronze,
        Math.cos(a) * 0.28, 4.65, 0, { parent: lantern, cast: false });
      side.rotation.z = a + Math.PI / 2;
      side.position.y = 4.65 + Math.sin(a) * 0.28;
    }
    const moon = this._m(new THREE.TorusGeometry(0.42, 0.075, 8, 20, Math.PI * 1.15), bronze,
      0, 6.5, 0, { parent: lantern, cast: false });
    moon.rotation.z = -Math.PI * 0.075;
    const eagle = this._m(new THREE.SphereGeometry(0.13, 10, 8), bronze, 0, 6.62, 0,
      { parent: lantern, cast: false });
    eagle.scale.set(0.9, 1.1, 1.3);
    for (const sx of [-1, 1]) {
      const w = this._m(new THREE.BoxGeometry(0.34, 0.05, 0.14), bronze, sx * 0.20, 6.76, -0.02,
        { parent: lantern, cast: false });
      w.rotation.z = sx * 0.55;
    }
    // four chains under the moon, and the bells the wind swings against the
    // triangle: a sealed steel ball in each
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
      const bx = Math.sin(a) * 0.30, bz = Math.cos(a) * 0.30;
      this._m(new THREE.CylinderGeometry(0.012, 0.012, 1.1, 5), bronze, bx, 5.66, bz,
        { parent: lantern, cast: false });
      const bell = new THREE.Group();
      bell.position.set(bx, 5.10, bz);
      this._m(new THREE.ConeGeometry(0.10, 0.20, 10, 1, true), bronze, 0, -0.10, 0,
        { parent: bell, cast: false });
      this._m(new THREE.SphereGeometry(0.035, 7, 6), M(0xb8bcc4, { metalness: 0.7, roughness: 0.4, tone: 0.1 }),
        0, -0.18, 0, { parent: bell, cast: false });
      lantern.add(bell);
      this._windBells.push({ g: bell, k });
    }
    lantern.position.set(TX, LB, TZ);
    this.scene.add(lantern);
    // the lantern's own columns, standing on the cupola
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      const col = new THREE.Group();
      col.position.set(TX + Math.sin(a) * LR, LB, TZ + Math.cos(a) * LR);
      this.scene.add(col);
      this._m(new THREE.CylinderGeometry(0.14, 0.16, 2.5, 12), marble, 0, 1.25, 0,
        { parent: col, cast: false, outline: true });
      this._m(new THREE.BoxGeometry(0.42, 0.12, 0.42), marble, 0, 2.55, 0, { parent: col, cast: false });
      this._m(new THREE.BoxGeometry(0.40, 0.10, 0.40), marble, 0, 0.05, 0, { parent: col, cast: false });
    }

    // ── the ministry: the Antistita, Polia, and the seven virgins ─────────
    // The two vested heads are new ranks on the same machinery the chess
    // liveries use (Cast.paintedFigureTexture): a mitre for the priestess and
    // a tutulus with its veil for Polia and her sisters.
    const at = (rad, deg) => [TX + Math.sin(deg * Math.PI / 180) * rad,
                              TZ + Math.cos(deg * Math.PI / 180) * rad];
    const face = (x, z) => Math.atan2(TX - x, TZ - z);

    const [pxx, pzz] = at(2.5, 180);
    const priestess = this.cast.nymph({ name: 'Antistita', robe: 0xf0ead8, h: 1.02,
                                        rank: 'mitre', cutout: null });
    this._npc('venus_antistita', priestess, pxx, pzz, face(pxx, pzz),
      { label: 'The Antistita', sub: 'HIGH PRIESTESS OF VENVS PHYSIZOA', sway: 0.03 });

    const [qxx, qzz] = at(2.4, 20);
    const polia = this.cast.nymph({ name: 'Polia', robe: 0xd8c4e8, h: 1.0,
                                    rank: 'tutulus', cutout: null });
    this._npc('venus_polia_rite', polia, qxx, qzz, face(qxx, qzz),
      { label: 'Polia', sub: 'HER TORCH PVT OVT', sway: 0.03 });

    for (let i = 0; i < 7; i++) {
      const deg = 60 + i * 40;
      const [vx, vz] = at(3.3, deg);
      const v = this.cast.nymph({ name: 'virgin_' + i, robe: 0xf2eee2, h: 0.95,
                                  rank: 'tutulus', cutout: null });
      this._npc('venus_virgin_' + i, v, vx, vz, face(vx, vz), { sway: 0.035 });
    }

    // ── what the rite says, on the wall behind the well ──────────────────
    this._plaque({ main: 'SICVT AQVA HANC FACEM EXTINGVET',
                   sub: 'SO SHALL THE FIRE OF LOVE RE-KINDLE HER GELID HEART · CH. XVII' },
      3.6, 0.5, TX, PLAT_Y + 2.5, TZ - R + 0.62, Math.PI, true);
    this._plaque({ main: 'CVSÌ FIA', sub: 'SO BE IT · THE VIRGINS ANSWER, THRICE' },
      1.8, 0.34, TX, PLAT_Y + 1.85, TZ - R + 0.62, Math.PI, true);
  }

  // ── The water labyrinth (ch. IX) ──────────────────────────
  //
  // Dallington 1592, pp. 177–180 (the corpus `md/Hypnerotomachia_by_Francesco_
  // Colonna.md`, ll. 7440–7580). Logistica explains it from a height, and it is
  // the book's clearest single allegory: a circular labyrinth of WATER, sailed
  // not walked, in seven circuits between seven towers or "mounts", and
  // "they can not returne or goe backe with theyr Shyppe." On the first tower
  // the title ΔΟΞΑ ΚΟΣΜΙΚΗ ΩΣ ΠΟΜΦΟΛΥΞ — worldly glory is a bubble — and a
  // matron with an urn marked ΘΕΣΠΙΟΝ who gives every entrant a pot of honey.
  // The water runs against you from the third mount; the fifth is "speculable,
  // lyke a mirrour" and carries MEDIVM TENVERE BEATI; from the sixth the
  // broken circles slide toward the centre "with small or no rowing"; and over
  // the centre, in thick darkness, "there sitteth a seuere Iudge" — the dragon
  // that "cannot bee seene nor shunned", and the sentence over the devouring
  // throat, which Dallington leaves in Greek. Hunt notes that the 1499 and the
  // 1592 both decline to illustrate it (GARDENS.md §3); this is therefore a
  // reading of the text, not of a plate.
  _buildWaterLabyrinth(LX = -44, LZ = 34) {
    const S = this.style;
    const lit = S.key !== 'woodcut';
    const stone = this._stoneMat, dark = this._darkStoneMat;
    const water = this._waterMat();
    const R = 9.0;

    // the basin, and seven concentric channels with a hedge-bank between each
    this._m(new THREE.CylinderGeometry(R + 0.8, R + 0.8, 0.24, 40), dark, LX, 0.12, LZ, { cast: false });
    this._waters.push({ m: this._m(new THREE.CircleGeometry(R, 40), water, LX, 0.26, LZ, { rx: -Math.PI / 2, cast: false }) });
    const hedge = lit ? this._hedgeMat : S.mat({ tone: 0.12 });
    for (let i = 1; i <= 7; i++) {
      const r = R - i * 1.15;
      // a bank broken at one point so the channel spirals inward — "the broken
      // circles" — and the break moves round with each ring
      const gap = i * 0.9;
      // CylinderGeometry measures theta from +z (x = r sin θ, z = r cos θ), the
      // towers from +x (cos, sin): θ = π/2 − a.
      const rm = this._m(new THREE.CylinderGeometry(r + 0.18, r + 0.18, 0.55, 40, 1, true, Math.PI / 2 - gap + 0.35, Math.PI * 2 - 0.7), hedge,
        LX, 0.52, LZ, { cast: false });
      rm.material.side = THREE.DoubleSide;
      // the seven mounts, one tower at each break
      const tx = LX + Math.cos(gap) * (r + 0.18), tz = LZ + Math.sin(gap) * (r + 0.18);
      this._m(new THREE.CylinderGeometry(0.34, 0.42, 1.9, 10), stone, tx, 1.2, tz, { outline: true });
      this._m(new THREE.ConeGeometry(0.42, 0.5, 10), dark, tx, 2.4, tz, { cast: false });
      this._circleCol(tx, tz, 0.55);
      const words = [
        ['ΔΟΞΑ ΚΟΣΜΙΚΗ ΩΣ ΠΟΜΦΟΛΥΞ', 'WORLDLY GLORY IS A BVBBLE · THE FIRST MOVNT'],
        ['ΘΕΣΠΙΟΝ', 'THE VRN OF HONEY · ONE POT TO EVERY ENTRANT'],
        ['III', 'HERE THE WATER FIRST RVNS AGAINST YOV'],
        ['IV', 'YOVNG WOMEN COMBATTING · THE CVRRENT WORSE'],
        ['MEDIVM TENVERE BEATI', 'THE FIFTH MOVNT · SPECVLABLE, LIKE A MIRROVR'],
        ['VI', 'THE BROKEN CIRCLES SLIDE TOWARD THE CENTER'],
        ['VII', 'AN OBSCVRE AND FOGGY CLOSE AYRE'],
      ][i - 1];
      this._plaque({ main: words[0], sub: words[1] }, 1.5, 0.34, tx, 1.75, tz + 0.5, 0, true);
    }
    // the matron with her urn at the first mount, and the little ship
    const matron = this.cast.figure({ h: 0.95, robe: 0x6a5a7a });
    const g0 = 1 * 0.9, r0 = R - 1.15 + 0.18;
    this._npc('labyrinth_matron', matron, LX + Math.cos(g0) * (r0 + 0.9), LZ + Math.sin(g0) * (r0 + 0.9), Math.PI,
      { label: 'The Matron', sub: 'PITTIFVLL AND BOVNTIFVLL · HONEY FOR EVERY ENTRANT', labelY: 1.9 });
    this._m(new THREE.CylinderGeometry(0.16, 0.12, 0.34, 10), this._darkStoneMat,
      LX + Math.cos(g0) * (r0 + 0.9) + 0.45, 0.5, LZ + Math.sin(g0) * (r0 + 0.9), { cast: false });
    const ship = this.cast.props.boat(1.0);
    ship.position.set(LX + Math.cos(g0 + 0.5) * (R - 0.6), 0.30, LZ + Math.sin(g0 + 0.5) * (R - 0.6));
    ship.rotation.y = -(g0 + 0.5);
    this.scene.add(ship);           // not a _float: that registry would sink it under the water

    // the centre: thick darkness, the devouring throat, the judge, the dragon
    this._m(new THREE.CylinderGeometry(1.1, 1.3, 0.3, 20), S.mat(lit ? { color: 0x0a0a0c, roughness: 0.3 } : { tone: 0.4 }),
      LX, 0.34, LZ, { cast: false });
    const drag = this.cast.animals.dragon ? this.cast.animals.dragon(0.9) : this.cast.animals.lion(0.9);
    drag.position.set(LX, 0.5, LZ);
    this.scene.add(drag);
    this._circleCol(LX, LZ, 1.6);
    this._plaque({ main: 'ΘΕΟΝ ΛΥΚΟΣ ΔΥΣΑΛΓΗΤΟΣ', sub: 'THE SENTENCE OVER THE MEDIAN CENTER · A SEVERE IVDGE SITS HERE' },
      2.2, 0.4, LX, 2.2, LZ + 1.2, 0, true);
    // Logistica shows it from above: a viewing mount outside the ring
    // set off the axis, or it stands between the station and the labyrinth
    this._m(new THREE.CylinderGeometry(1.6, 2.0, 1.4, 12), stone, LX + R + 2.2, 0.7, LZ - 5.5, { outline: true });
    this._circleCol(LX + R + 2.2, LZ - 5.5, 2.1);
    this._plaque({ main: 'LABYRINTHVS AQVATILIS',
                   sub: 'THE BOATS GO ALWAYS FORWARD AND NEVER BACK · CH. IX · DALLINGTON PP. 177–180' },
      2.6, 0.42, LX + R + 1.0, 1.1, LZ + 0.3, Math.PI / 2, true);
  }

  // ── The Colossus, as architecture ─────────────────────────
  //
  // Full brief in ARCHITECTURE.md ("The Colossus — researched, specified, and
  // NOT built"). Lefaivre pp. 52–53: a hybrid sculpture/building, "the colossus
  // supine in the sands", entered THROUGH THE MOUTH, its interior "formed
  // exactly like the inside of a human body", every organ a chamber with its
  // own door and above each organ its name and the sicknesses generated in
  // it; in the heart, the chamber "where love is born", whose cures are
  // written in Chaldean and which Poliphilo does not divulge. Beside it a
  // female colossus, more buried, which he refuses to enter: Priki's first
  // figure of loss. The brief's instruction, after the reverted anatomical
  // attempt, is to build it AS ARCHITECTURE — a vaulted hall in the rough
  // outline of a body, which is what "hybrid sculpture/building" means and
  // what this toolkit can do. So: a head that is a dome with a doorway for a
  // mouth, a chest that is a barrel-vaulted hall, and limbs that are low
  // vaults, all in verdigris bronze; and inside, the organs as labelled cells.
  _buildColossus(KX = 36, KZ = 4) {
    const S = this.style;
    const lit = S.key !== 'woodcut';
    const bronze = lit ? S.mat({ color: 0x4f7a5a, metalness: 0.7, roughness: 0.55 }) : S.mat({ tone: 0.16 });
    const dark   = lit ? S.mat({ color: 0x2c3a30, metalness: 0.5, roughness: 0.7 }) : S.mat({ tone: 0.3 });
    const sand   = lit ? S.mat({ color: 0x9a8a64, roughness: 0.95 }) : S.mat({ tone: 0.02, rim: 0 });
    // The figure lies along +x with its head at KX and its feet at KX+17.
    this._m(new THREE.CircleGeometry(12, 30), sand, KX + 8, 0.03, KZ, { rx: -Math.PI / 2, cast: false });
    const half = (r, x, z, sx, sy, sz) => {
      const m = this._m(new THREE.SphereGeometry(r, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), bronze, x, 0, z, { outline: true });
      m.scale.set(sx, sy, sz);
      return m;
    };
    const vault = (x, z, w, h, len, ry = 0) => {
      const m = this._m(new THREE.CylinderGeometry(h, h, len, 20, 1, false, 0, Math.PI), bronze, x, 0, z, { outline: true });
      m.rotation.z = Math.PI / 2; m.rotation.y = ry;
      m.scale.set(1, w / h, 1);
      return m;
    };
    // the head: a dome, the face toward the west, the mouth a doorway
    half(2.2, KX, KZ, 1, 1.05, 1.1);
    this._m(new THREE.BoxGeometry(0.9, 1.5, 0.5), dark, KX - 2.15, 0.75, KZ, { cast: false });     // the mouth
    this._m(new THREE.BoxGeometry(0.7, 1.3, 0.3), S.mat(lit ? { color: 0x08080a } : { tone: 0.5 }), KX - 2.3, 0.7, KZ, { cast: false });
    for (const sz of [-1, 1]) this._m(new THREE.SphereGeometry(0.26, 10, 8), dark, KX - 1.4, 1.75, KZ + sz * 0.8, { cast: false }); // the eyes
    // The mouth is a DOOR, so it gets a door's members: two columns, an
    // entablature, a threshold — the thing that makes a dome with a face read
    // as a building with a face, which is the whole claim of the object.
    for (const sz of [-1, 1]) this._column(KX - 3.0, KZ + sz * 0.95, 1.9, { order: 'doric', r: 0.11, mat: bronze });
    this._entablature(KX - 3.0, 1.9, KZ, 2.6, 0.6, { ry: Math.PI / 2, dentils: false, mat: bronze });
    this._m(new THREE.BoxGeometry(0.9, 0.12, 2.6), dark, KX - 3.0, 0.06, KZ, { cast: false });
    // ribs along the vaults, so the body reads as built and not as blown
    for (const [x0, len, hh] of [[KX + 4.6, 5.4, 2.5], [KX + 9.0, 3.6, 1.8]]) {
      for (let k = 0; k < Math.floor(len / 0.9); k++) {
        const rib = this._m(new THREE.TorusGeometry(hh * 1.01, 0.06, 6, 20, Math.PI), dark, x0 - len / 2 + 0.45 + k * 0.9, 0, KZ, { cast: false });
        rib.rotation.y = Math.PI / 2;
      }
    }
    // the chest: a barrel vault; the belly a lower one; the legs two long vaults
    vault(KX + 4.6, KZ, 3.3, 2.5, 5.4);
    vault(KX + 9.0, KZ, 2.6, 1.8, 3.6);
    for (const sz of [-1, 1]) vault(KX + 14.0, KZ + sz * 1.3, 1.0, 0.95, 6.5);
    // the arms, laid along the sides
    for (const sz of [-1, 1]) vault(KX + 5.5, KZ + sz * 3.9, 0.85, 0.8, 7.0);
    for (const dx of [2.5, 4.5, 6.5, 8.5, 10.5, 12.5]) {
      for (const sz of [-1, 1]) this._wallCol(KX + dx - 1, KX + dx + 1, KZ + sz * 3.9 - 0.9, KZ + sz * 3.9 + 0.9);
    }
    this._circleCol(KX, KZ, 2.4);
    this._wallCol(KX + 2, KX + 17, KZ - 3.4, KZ + 3.4);
    // the organs, as the book has them: a chamber each, its name above it and
    // the sicknesses generated in it; the doors face the path down the side
    const ORGANS = [
      ['COR',      'THE HEART · WHERE LOVE IS BORN · THE CVRES WRITTEN IN CHALDEAN, NOT DIVVLGED', 3.6],
      ['PVLMONES', 'THE LVNGS · PLEVRISY · SHORTNESS OF BREATH', 5.2],
      ['HEPAR',    'THE LIVER · CHOLER · THE IAVNDICE', 6.8],
      ['LIEN',     'THE SPLEEN · MELANCHOLY', 8.2],
      ['VENTER',   'THE BELLY · COLIC · DROPSY', 9.6],
      ['RENES',    'THE KIDNEYS · THE STONE', 11.0],
    ];
    for (const [name, sick, dx] of ORGANS) {
      this._m(new THREE.BoxGeometry(0.62, 1.0, 0.2), dark, KX + dx, 0.5, KZ - 3.05, { cast: false });
      this._plaque({ main: name, sub: sick }, 1.3, 0.34, KX + dx, 1.35, KZ - 3.28, Math.PI, true);
    }
    this._plaque({ main: 'COLOSSVS', sub: 'A SCVLPTVRE THAT IS A BVILDING · ENTERED BY THE MOVTH · LEFAIVRE PP. 52–53' },
      2.4, 0.42, KX - 2.4, 2.6, KZ, -Math.PI / 2, true);
    // the female colossus beside him, more buried, and with NO door
    half(1.8, KX + 1.0, KZ - 9.0, 1, 0.55, 1.1).position.y = -0.3;
    vault(KX + 5.2, KZ - 9.0, 2.6, 1.5, 5.0).position.y = -0.55;
    vault(KX + 10.0, KZ - 9.0, 2.0, 1.1, 4.0).position.y = -0.5;
    this._wallCol(KX - 1, KX + 12.5, KZ - 11.0, KZ - 7.0);
    this._plaque({ main: 'ALTERA', sub: 'THE OTHER · HALF-HIDDEN · POLIPHILO REFVSES TO ENTER · PRIKI' },
      1.8, 0.34, KX + 5.2, 1.3, KZ - 6.3, 0, true);
  }

  // ── The rite of Priapus (#71) ─────────────────────────────
  //
  // The one full-page plate of the temple sequence — nineteen women and five
  // men round the altar. Our translation, page_194: "the rude simulacrum of the
  // garden-guardian, with all his decent and appropriated insignia" stands on
  // the altar under "a cupola'd little canopy … upon four poles fixed in the
  // ground", the poles "invested with fruited and flowered foliage", a lamp
  // hung between each pair, and round the rim "gold foils, by the fresh and
  // spring-bearing breezes inconstantly vexed, and sounding with metallic
  // little rattles". The rite: the ass is sacrificed (Ovid, Fasti I and VI —
  // its braying once foiled the god), with libations of milk and wine, and old
  // Janus is "led bound in flower-ropes" to Fescennine, Talassian and Hymeneal
  // songs. Dallington's Bacchic company (p. 235): nymphs "some naked with
  // aprons of goates skins", timbrels and flutes, vine-sprigs about their
  // heads. The god is built as the plate has him, a herm.
  _buildPriapusRite(RX = 44, RZ = -6) {
    const S = this.style;
    const lit = S.key !== 'woodcut';
    const gold = lit ? S.mat({ color: 0xd9b25a, metalness: 0.9, roughness: 0.25 }) : S.mat({ tone: 0.04 });
    const stone = this._stoneMat;
    // the altar: black, white-veined "to express the tenebrous, unlit air"
    this._m(new THREE.BoxGeometry(1.5, 0.9, 1.1), S.mat(lit ? { color: 0x1a1a20, roughness: 0.5 } : { tone: 0.3 }),
      RX, 0.45, RZ, { outline: true });
    this._frieze(RX, 0.55, RZ + 0.56, 1.3, 0.22, 'meander');
    // the herm of the garden-guardian on it, as the plate draws him
    this._m(new THREE.BoxGeometry(0.34, 1.1, 0.3), stone, RX, 1.45, RZ, { outline: true });
    const head = this._m(new THREE.SphereGeometry(0.17, 12, 10), stone, RX, 2.15, RZ);
    head.scale.set(0.95, 1.1, 0.95);
    this._m(new THREE.ConeGeometry(0.16, 0.22, 10), stone, RX, 1.98, RZ, { cast: false, rx: Math.PI }); // the beard
    this._m(new THREE.CylinderGeometry(0.045, 0.05, 0.36, 8), stone, RX, 1.35, RZ + 0.30, { cast: false, rx: Math.PI / 2 }); // his insignia
    this._circleCol(RX, RZ, 1.1);
    // the canopy on four poles, wreathed, with a lamp between each pair
    for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const px = RX + sx * 1.4, pz = RZ + sz * 1.2;
      this._m(new THREE.CylinderGeometry(0.06, 0.07, 3.2, 8), this._trunkMat, px, 1.6, pz);
      for (let k = 0; k < 6; k++) {
        this._m(new THREE.SphereGeometry(0.09, 6, 5), this._leafMat, px + Math.sin(k * 1.7) * 0.11, 0.5 + k * 0.5, pz + Math.cos(k * 1.7) * 0.11, { cast: false });
        if (k % 2) this._m(new THREE.SphereGeometry(0.05, 6, 5), S.mat(lit ? { color: 0xc03a2a, roughness: 0.6 } : { tone: 0.2 }),
          px + Math.sin(k * 1.7 + 0.4) * 0.13, 0.62 + k * 0.5, pz + Math.cos(k * 1.7 + 0.4) * 0.13, { cast: false });
      }
      this._circleCol(px, pz, 0.2);
    }
    const dome = this._m(new THREE.SphereGeometry(2.0, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2.6), this._leafMat, RX, 2.75, RZ, { cast: false });
    dome.scale.set(1, 0.55, 0.85);
    for (let k = 0; k < 4; k++) {
      const a = k * Math.PI / 2 + Math.PI / 4;
      const lx = RX + Math.cos(a) * 1.5, lz = RZ + Math.sin(a) * 1.25;
      this._m(new THREE.CylinderGeometry(0.01, 0.01, 0.5, 4), gold, lx, 2.95, lz, { cast: false });
      this._m(new THREE.SphereGeometry(0.09, 8, 6),
        lit ? S.mat({ color: 0xffd080, emissive: 0xe0a030, emissiveIntensity: 0.9 }) : S.mat({ tone: 0.04 }), lx, 2.66, lz, { cast: false });
    }
    // the gold foils round the rim, the ones the breeze rattles
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      const f = this._m(new THREE.PlaneGeometry(0.16, 0.26), gold, RX + Math.cos(a) * 1.75, 3.05, RZ + Math.sin(a) * 1.45, { cast: false });
      f.rotation.y = -a; f.userData.foil = k;
      this._foils = this._foils || []; this._foils.push(f);
    }
    // the ass brought to the altar, and old Janus led bound in flower-ropes
    const ass = this.cast.animals.horse(0.8);
    ass.position.set(RX - 2.8, 0, RZ + 0.6); ass.rotation.y = Math.PI / 2;
    this.scene.add(ass); this._circleCol(RX - 2.8, RZ + 0.6, 0.7);
    const janus = this.cast.figure({ h: 0.95, robe: 0x8a7a6a, pose: 'stand', beard: true });
    this._npc('priapus_janus', janus, RX + 2.6, RZ + 1.4, -Math.PI / 2, { label: 'Janus', sub: 'LED BOVND IN FLOWER-ROPES' });
    for (let k = 0; k < 5; k++) this._m(new THREE.SphereGeometry(0.06, 6, 5), S.mat(lit ? { color: [0xc83a4a, 0xe0b028, 0xf0ecd8][k % 3], roughness: 0.7 } : { tone: 0.2 }),
      RX + 2.6 + (k - 2) * 0.09, 1.0 + (k % 2) * 0.06, RZ + 1.4 + 0.18, { cast: false });
    // the company: nineteen women, five men, as the plate counts them
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2, r = 3.4 + (i % 3) * 0.6;
      const x = RX + Math.cos(a) * r, z = RZ + Math.sin(a) * r;
      const male = i % 5 === 4;
      const g = male
        ? (i === 4 ? this.cast.props.satyr(1.0) : this.cast.figure({ h: 0.92, robe: [0x7a5a3a, 0x5a6a4a][i % 2] }))
        : this.cast.nymph({ name: 'priapus_' + i, robe: [0xe8ddc0, 0xd8a870, 0xc8b8a0][i % 3], h: 0.9,
                            garland: 'pancarpial', attribute: i % 4 === 1 ? 'harp' : null });
      this._npc('priapus_' + i, g, x, z, Math.atan2(RX - x, RZ - z), { sway: 0.05 });
    }
    this._plaque({ main: 'HORTORVM CVSTODI', sub: 'THE RITE OF PRIAPVS · THE ASS, THE MILK, THE WINE · PLATE 71 · CH. XVI' },
      2.4, 0.42, RX, 0.5, RZ - 1.9, Math.PI, true);
  }

  // ── The amphitheatre of Venus (#147) ──────────────────────
  //
  // The terraces of flower-boxes already ring the theatre ("the auditorium
  // turned into beds, as the book turns it", p. 353); what was missing is the
  // theatre's own architecture. Our translation, pp. 350–352: the Area 32
  // paces across; round it a colonnade 8 paces deep, quartered, each quarter
  // of eight bays, radial and concentric columns carrying vaulted porticoes;
  // the upper orders kept, against Vitruvius and on purpose, at ONE height;
  // the whole of mortarless Indian alabaster; the gallery-walls of mirror-
  // black stone; and the Area itself a single slab of polished obsidian in
  // which Poliphilo's first step seems to plunge into an abyss.
  _buildAmphitheatre(CX = 0, CZ = -150) {
    const S = this.style;
    const lit = S.key !== 'woodcut';
    const alab = lit ? S.mat({ color: 0xf2e8d2, roughness: 0.35, metalness: 0.05 }) : S.mat({ tone: 0.03 });
    const mirror = lit ? S.mat({ color: 0x0c0c12, roughness: 0.08, metalness: 0.6 }) : S.mat({ tone: 0.36 });
    // the obsidian Area, over the dark stone floor
    this._m(new THREE.CircleGeometry(7.4, 48), mirror, CX, 0.075, CZ, { rx: -Math.PI / 2, cast: false });
    const RC = 7.15, H = 2.4, ORDERS = 3;
    for (let q = 0; q < 4; q++) {
      for (let b = 0; b <= 8; b++) {
        // eight bays a quarter, and the cardinal gap for the roads and the cars
        const a = q * Math.PI / 2 + 0.16 + (b / 8) * (Math.PI / 2 - 0.32);
        const x = CX + Math.cos(a) * RC, z = CZ + Math.sin(a) * RC;
        for (let o = 0; o < ORDERS; o++) {
          const g = new THREE.Group(); g.position.set(x, o * (H + 0.5), z); this.scene.add(g);
          this._column(0, 0, H, { order: ['doric', 'ionic', 'corinthian'][o], r: 0.13, parent: g, mat: alab });
        }
        if (b < 8) this._circleCol(x, z, 0.22);
      }
      // the entablatures, as chords over each quarter
      for (let o = 0; o < ORDERS; o++) {
        const a0 = q * Math.PI / 2 + 0.16, a1 = q * Math.PI / 2 + Math.PI / 2 - 0.16;
        for (let b = 0; b < 8; b++) {
          const aa = a0 + (b + 0.5) / 8 * (a1 - a0);
          const chord = 2 * RC * Math.sin((a1 - a0) / 16);
          this._entablature(CX + Math.cos(aa) * RC, o * (H + 0.5) + H, CZ + Math.sin(aa) * RC, chord + 0.15, 0.7,
            { ry: -aa + Math.PI / 2, dentils: o === 2, mat: alab });
        }
        // the gallery wall behind the columns of each order: mirror-black on
        // the face the theatre sees, alabaster on the face the island sees.
        // One double-sided black shell read from outside as three stacked oil
        // tanks; the text's alabaster cavea is the outside of the building.
        const inner = this._m(new THREE.CylinderGeometry(RC + 0.55, RC + 0.55, H - 0.2, 40, 1, true, Math.PI / 2 - a1, a1 - a0),
          mirror.clone(), CX, o * (H + 0.5) + H / 2, CZ, { cast: false });
        inner.material.side = THREE.BackSide; this._disp.push(inner.material);
        // outside, an ARCADE — piers and arched openings, one a bay — because
        // a continuous shell read from the north road as three stacked drums,
        // and the text sets this building against the Colosseum and Verona
        for (let b = 0; b < 8; b++) {
          const ab = a0 + (b / 8) * (a1 - a0), ac = a0 + ((b + 0.5) / 8) * (a1 - a0);
          const pier = this._m(new THREE.BoxGeometry(0.34, H - 0.2, 0.5), alab,
            CX + Math.cos(ab) * (RC + 0.62), o * (H + 0.5) + H / 2, CZ + Math.sin(ab) * (RC + 0.62), { cast: false });
          pier.rotation.y = -ab;
          const arch = this._m(new THREE.TorusGeometry(0.5, 0.12, 6, 12, Math.PI), alab,
            CX + Math.cos(ac) * (RC + 0.62), o * (H + 0.5) + H - 0.55, CZ + Math.sin(ac) * (RC + 0.62), { cast: false });
          arch.rotation.y = -ac + Math.PI / 2;
        }
        const last = a1;
        const lp = this._m(new THREE.BoxGeometry(0.34, H - 0.2, 0.5), alab,
          CX + Math.cos(last) * (RC + 0.62), o * (H + 0.5) + H / 2, CZ + Math.sin(last) * (RC + 0.62), { cast: false });
        lp.rotation.y = -last;
      }
    }
    this._plaque({ main: 'THEATRVM VENERIS', sub: 'XXXII PACES ACROSS · ALABASTER WITHOVT LIME · THREE ORDERS OF ONE HEIGHT · THE AREA OBSIDIAN' },
      2.6, 0.42, CX, 1.0, CZ + RC + 1.2, 0, true);
  }

  // ── The Triumph of Cupid (#143–#144) ──────────────────────
  //
  // The two-plate spread on Cythera: "nymphs, satyrs, dragons, captives".
  // Our translation, p. 341: Cupid on a golden car, two gold-rimmed wheels on
  // balustered spokes of coloured gemstone; POLIPHILO AND POLIA BOUND AS
  // CAPTIVES behind it, their arms tied with rose-garlands, led by Synesia
  // (Understanding) and bound by Plexaura and Ganoma; Psyche following in her
  // golden chlamys pinned with a great diamond. It rolls down the north road
  // toward the theatre, between the trophies.
  _buildCupidTriumph(TX = 0, TZ = -127) {
    const S = this.style;
    const lit = S.key !== 'woodcut';
    const gold = lit ? S.mat({ color: 0xd9b25a, metalness: 0.95, roughness: 0.22 }) : S.mat({ tone: 0.04 });
    const g = new THREE.Group(); g.position.set(TX, 0, TZ); this.scene.add(g);
    // the car
    this._m(new THREE.BoxGeometry(1.6, 0.5, 2.4), gold, 0, 0.75, 0, { parent: g, outline: true });
    this._frieze(0, 0.75, 0.81, 1.4, 0.3, 'meander');
    for (const sx of [-1, 1]) {
      const w = this._m(new THREE.TorusGeometry(0.5, 0.06, 8, 20), gold, sx * 0.9, 0.5, 0.3, { parent: g, ry: Math.PI / 2 });
      for (let k = 0; k < 8; k++) {
        const sp = this._m(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 5),
          lit ? S.mat({ color: [0xb3243c, 0x1e3f96, 0x0d7548, 0xdca62c][k % 4], roughness: 0.3 }) : gold, sx * 0.9, 0.5, 0.3, { parent: g });
        sp.rotation.x = k * Math.PI / 8;
      }
      void w;
    }
    const cupid = this.cast.props.putto ? this.cast.props.putto(0.8) : this.cast.figure({ h: 0.6, robe: null });
    cupid.position.set(0, 1.0, -0.2); g.add(cupid);
    // drawn by the dragons the plate gives it
    for (const sx of [-1, 1]) {
      const d = this.cast.animals.dragon ? this.cast.animals.dragon(0.7) : this.cast.animals.lion(0.7);
      d.position.set(sx * 0.7, 0, -2.6); d.rotation.y = Math.PI; g.add(d);
    }
    // the captives, bound in roses, and the three nymphs who lead and bind
    const pol = this.cast.figure({ name: 'Poliphilo', h: 0.95, robe: 0x8a4a3a, pose: 'stand' });
    const polia = this.cast.nymph({ name: 'Polia', robe: 0xd8c4e8, h: 0.95, garland: 'pancarpial' });
    this._npc('cupid_poliphilo', pol, TX - 0.5, TZ + 2.4, Math.PI, { label: 'Poliphilo', sub: 'CAPTIVE, BOVND IN ROSES', sway: 0.03 });
    this._npc('cupid_polia', polia, TX + 0.5, TZ + 2.4, Math.PI, { label: 'Polia', sub: 'CAPTIVE, BOVND IN ROSES', sway: 0.03 });
    const rose = lit ? S.mat({ color: 0xc83a4a, roughness: 0.7 }) : S.mat({ tone: 0.2 });
    for (let k = 0; k < 10; k++) this._m(new THREE.SphereGeometry(0.05, 6, 5), rose, TX - 0.5 + k * 0.11, 0.95 + (k % 2) * 0.05, TZ + 2.55, { cast: false });
    const names = [['Synesia', 'VNDERSTANDING · SHE LEADS', -1.2, 1.4], ['Plexaura', 'SHE BINDS', -1.3, 3.2], ['Ganoma', 'SHE BINDS', 1.3, 3.2],
                   ['Psyche', 'IN A GOLDEN CHLAMYS · A GREAT DIAMOND AT HER SHOVLDER', 0, 4.4]];
    for (const [n, sub2, dx, dz] of names) {
      const ny = this.cast.nymph({ name: n, robe: n === 'Psyche' ? 0xd9b25a : 0xe8ddc0, h: 0.95, garland: 'pancarpial' });
      this._npc('cupid_' + n.toLowerCase(), ny, TX + dx, TZ + dz, Math.PI, { label: n, sub: sub2, sway: 0.04 });
    }
    for (let i = 0; i < 4; i++) {
      const sat = this.cast.props.satyr(1.0);
      sat.position.set(TX + (i % 2 ? 2.2 : -2.2), 0, TZ - 1 + i * 1.6); sat.rotation.y = i % 2 ? -0.5 : 0.5;
      this.scene.add(sat);
    }
    this._wallCol(TX - 1.1, TX + 1.1, TZ - 3.2, TZ + 1.3);
    this._plaque({ main: 'TRIVMPHVS AMORIS', sub: 'THE LOVERS LED BEHIND THE CAR, BOVND SOFTLY AND WILLINGLY · CH. XXII' },
      2.2, 0.4, TX + 2.6, 1.0, TZ + 0.5, -Math.PI / 2, true);
  }

  // ── The Polyandrion's five medallions (#88–#92) ───────────
  //
  // Five hieroglyphic reliefs on the plates, and NO READING of them anywhere
  // in the corpus — not Curran, not Russell, not the annotators. So they are
  // built as unread devices: five roundels on a broken wall of the ruin, each
  // spelling a sequence from the fifteen sourced signs, and the plaque says
  // plainly that no one has read them. The tour must say the same.
  _polyandrionMedallions(PX = 30, PZ = -27) {
    const wz = PZ + 9.4;
    this._m(new THREE.BoxGeometry(9.0, 0.5, 0.8), this._darkStoneMat, PX, 0.25, wz, { cast: false });
    this._m(new THREE.BoxGeometry(9.0, 2.2, 0.6), this._stoneMat, PX, 1.6, wz, { outline: true });
    this._m(new THREE.BoxGeometry(2.6, 0.9, 0.62), this._stoneMat, PX - 2.8, 3.15, wz, { outline: true });
    this._wallCol(PX - 4.5, PX + 4.5, wz - 0.5, wz + 0.5);
    const SEQ = [['eye', 'vulture', 'hook'], ['circle', 'anchor', 'dolphin'], ['skull', 'ant', 'elephant'],
                 ['altar', 'ewer', 'rudder'], ['grain', 'sun', 'palm']];
    SEQ.forEach((signs, i) => {
      const x = PX - 3.4 + i * 1.7;
      this._m(new THREE.CylinderGeometry(0.62, 0.62, 0.12, 24), this._darkStoneMat, x, 1.6, wz - 0.34, { cast: false, rx: Math.PI / 2 });
      this._frieze(x, 1.6, wz - 0.42, 1.0, 0.36, 'hieroglyph', { signs, ry: Math.PI });
    });
    this._plaque({ main: 'QVINQVE SIGNA · NON LECTA', sub: 'FIVE HIEROGLYPHIC MEDALLIONS · PLATES 88–92 · NO READING OF THEM EXISTS' },
      2.6, 0.4, PX, 0.75, wz - 0.5, Math.PI, true);
  }

  // ── Book II: the Temple of Diana, the bed-chamber, the throne ─
  //
  // Book II has no geography in the dream: it is Polia's own account, set in
  // Treviso, and its thirteen stops were staged at whichever dream stations
  // answered them. Ted's "build everything" settles the open decision in
  // NEXTSTEPS §6: a precinct of its own, east of the meadow, built from our
  // translation of chapters XXV–XXXVIII. The temple of Diana where Polia,
  // plague-struck and healed, vows chastity and where Poliphilo finds her
  // "alone, praying" and she freezes "more freezing than porphyry" (#152–#153,
  // pp. 388–389); the priestesses who drive the lovers out (#159); Polia's
  // bed-chamber, with the vision through its window of Diana's ice-chariot
  // drawn by stags pursued by Venus's fire-chariot drawn by swans (#160,
  // p. 425); and the Venus-priestess enthroned, the lovers kissing in her
  // presence (#163). The chariots are built as the vision, on poles above
  // the chamber, so the window frames them.
  _buildBookTwo(BX = 44, BZ = 22) {
    const S = this.style;
    const lit = S.key !== 'woodcut';
    const stone = this._stoneMat, dark = this._darkStoneMat;
    const silver = lit ? S.mat({ color: 0xd8dee8, metalness: 0.8, roughness: 0.3 }) : S.mat({ tone: 0.1 });
    const gold = lit ? S.mat({ color: 0xd9b25a, metalness: 0.9, roughness: 0.25 }) : S.mat({ tone: 0.04 });
    // ── the Temple of Diana: a small prostyle temple, a crescent in the pediment
    const DX = BX, DZ = BZ - 6;
    this._m(new THREE.BoxGeometry(7.0, 0.5, 5.6), stone, DX, 0.25, DZ, { cast: false, outline: true });
    for (let i = 0; i < 4; i++) this._column(DX - 2.4 + i * 1.6, DZ + 2.2, 3.2, { order: 'ionic', r: 0.15 });
    for (const sx of [-1, 1]) this._m(new THREE.BoxGeometry(0.5, 3.2, 4.4), stone, DX + sx * 3.0, 2.1, DZ - 0.4, { outline: true });
    this._m(new THREE.BoxGeometry(6.4, 3.0, 0.4), stone, DX, 2.0, DZ - 2.5, { outline: true });
    this._entablature(DX, 3.7, DZ + 2.2, 6.8, 0.8, { ry: 0 });
    // a triangular prism: the geometry itself is turned and flattened, since
    // scaling a rotated mesh flattens the wrong axis and stood it on end
    const pedGeo = new THREE.CylinderGeometry(3.6, 3.6, 0.4, 3);
    pedGeo.rotateZ(Math.PI / 2); pedGeo.rotateY(Math.PI / 2); pedGeo.scale(1, 0.34, 1);
    this._m(pedGeo, stone, DX, 4.55, DZ + 2.2, { cast: false, outline: true });
    const moon = this._m(new THREE.TorusGeometry(0.42, 0.07, 8, 20, Math.PI * 1.1), silver, DX, 4.75, DZ + 2.65, { cast: false });
    moon.rotation.z = -Math.PI * 0.05;
    this._roof(DX, 5.05, DZ - 0.4, 6.2, 5.0, { pitch: 0.9, ridgeAlong: 'x' });
    this._wallCol(DX - 3.3, DX + 3.3, DZ - 2.8, DZ - 2.2);
    for (const sx of [-1, 1]) this._wallCol(DX + sx * 3.0 - 0.3, DX + sx * 3.0 + 0.3, DZ - 2.6, DZ + 1.8);
    // Diana's image within, and the stag beside her
    const diana = this.cast.nymph({ name: 'Diana', robe: 0xe8eef4, h: 1.05, attribute: null, cutout: null });
    this._npc('b2_diana', diana, DX, DZ - 1.6, 0, { label: 'Diana', sub: 'THE VOW OF PERPETVAL CHASTITY · CH. XXVI', sway: 0.0 });
    const stag = this.cast.animals.stag ? this.cast.animals.stag(0.7) : this.cast.animals.horse(0.6);
    stag.position.set(DX + 1.5, 0.5, DZ - 1.4); this.scene.add(stag);
    // Polia veiled among the virgins; Poliphilo prostrate at the threshold (#152)
    const polia = this.cast.nymph({ name: 'Polia', robe: 0xe8e2d0, h: 0.98, rank: 'tutulus', cutout: null });
    this._npc('b2_polia_diana', polia, DX - 1.2, DZ - 0.4, 0.3, { label: 'Polia', sub: 'MORE FREEZING THAN PORPHYRY', sway: 0.02 });
    const pol = this.cast.figure({ h: 0.95, robe: 0x8a4a3a });
    pol.position.set(DX + 0.6, 0.3, DZ + 1.2); pol.rotation.set(0, 0.4, Math.PI / 2); this.scene.add(pol);
    for (let i = 0; i < 2; i++) {
      const pr = this.cast.nymph({ name: 'priestess_' + i, robe: 0xdfe6ee, h: 0.95, rank: 'tutulus', cutout: null, pose: 'point' });
      this._npc('b2_priestess_' + i, pr, DX - 2.2 + i * 4.4, DZ + 3.4, Math.PI, { sway: 0.04 });
    }
    this._plaque({ main: 'TEMPLVM DIANAE', sub: 'TREVISO · THE PLAGVE, THE VOW, THE LOVERS DRIVEN OVT · PLATES 152–159' },
      2.4, 0.42, DX, 1.0, DZ + 3.3, 0, true);

    // ── Polia's bed-chamber, and the vision through its window (#160)
    const CX2 = BX + 8, CZ2 = BZ + 4;
    this._m(new THREE.BoxGeometry(5.0, 0.3, 4.4), dark, CX2, 0.15, CZ2, { cast: false });
    for (const [dx, dz, w, d] of [[0, -2.1, 5.0, 0.3], [-2.4, 0, 0.3, 4.4], [2.4, 0, 0.3, 4.4]]) {
      this._m(new THREE.BoxGeometry(w, 3.0, d), stone, CX2 + dx, 1.8, CZ2 + dz, { outline: true });
      this._wallCol(CX2 + dx - w / 2, CX2 + dx + w / 2, CZ2 + dz - d / 2, CZ2 + dz + d / 2);
    }
    // the window in the back wall, through which the chariots burst
    this._m(new THREE.BoxGeometry(1.4, 1.4, 0.34), S.mat(lit ? { color: 0xbcd6f0, roughness: 0.2, transparent: true, opacity: 0.4 } : { tone: 0.05 }),
      CX2, 2.0, CZ2 - 2.1, { cast: false });
    this._roof(CX2, 3.3, CZ2, 5.2, 4.6, { pitch: 0.8, ridgeAlong: 'x' });
    // the bed, and Polia in it reading the letter (#165)
    this._m(new THREE.BoxGeometry(1.4, 0.5, 2.2), S.mat(lit ? { color: 0x8a2a3a, roughness: 0.8 } : { tone: 0.2 }), CX2 - 1.2, 0.55, CZ2 - 0.6, { outline: true });
    this._m(new THREE.BoxGeometry(1.5, 0.9, 0.2), this._trunkMat, CX2 - 1.2, 1.0, CZ2 - 1.75, { cast: false });
    const pb = this.cast.nymph({ name: 'Polia', robe: 0xe8e2d0, h: 0.9, pose: 'recline', cutout: null, garland: 'pancarpial' });
    pb.position.set(CX2 - 1.2, 0.85, CZ2 - 0.4); pb.rotation.y = Math.PI / 2; this.scene.add(pb);
    this._m(new THREE.BoxGeometry(0.3, 0.02, 0.2), S.mat(lit ? { color: 0xefe6cd, roughness: 0.9 } : { tone: 0.03 }), CX2 - 0.8, 1.05, CZ2 - 0.1, { cast: false });
    this._wallCol(CX2 - 1.9, CX2 - 0.5, CZ2 - 1.7, CZ2 + 0.5);
    // the vision in the sky behind the window: Diana's ice-chariot drawn by
    // stags, empty quiver; Venus's fire-chariot drawn by swans, with roses
    const ice = new THREE.Group(); ice.position.set(CX2 - 1.8, 5.2, CZ2 - 6.0); this.scene.add(ice);
    this._m(new THREE.BoxGeometry(1.2, 0.4, 0.8), S.mat(lit ? { color: 0xdff0ff, roughness: 0.1, metalness: 0.3 } : { tone: 0.04 }), 0, 0, 0, { parent: ice });
    for (const sx of [-1, 1]) {
      const st = this.cast.animals.stag ? this.cast.animals.stag(0.5) : this.cast.animals.horse(0.45);
      st.position.set(sx * 0.4, -0.2, -1.2); ice.add(st);
    }
    const fire = new THREE.Group(); fire.position.set(CX2 + 1.8, 4.6, CZ2 - 5.0); this.scene.add(fire);
    this._m(new THREE.BoxGeometry(1.2, 0.4, 0.8), gold, 0, 0, 0, { parent: fire });
    for (const sx of [-1, 1]) { const sw = this.cast.animals.swan(0.9); sw.position.set(sx * 0.4, -0.1, -1.1); fire.add(sw); }
    const fl = this.cast.props.fire(0.6); fl.position.set(0, 0.2, 0); fire.add(fl);
    for (let k = 0; k < 8; k++) this._m(new THREE.SphereGeometry(0.06, 6, 5), S.mat(lit ? { color: 0xc83a4a, roughness: 0.7 } : { tone: 0.2 }),
      Math.sin(k) * 0.5, 0.25 + (k % 2) * 0.1, Math.cos(k) * 0.3, { parent: fire, cast: false });
    for (const [gg, ph] of [[ice, 0.3], [fire, 2.1]]) this._hovers.push({ g: gg, y: gg.position.y, phase: ph });
    this._plaque({ main: 'CVBICVLVM POLIAE', sub: 'DIANA IN ICE, VENVS IN FIRE, THROVGH THE WINDOW · PLATES 160–165' },
      2.2, 0.4, CX2, 0.95, CZ2 + 2.35, 0, true);

    // ── the Venus-priestess enthroned, the lovers kissing before her (#163)
    const TX2 = BX - 8, TZ2 = BZ + 4;
    this._m(new THREE.CylinderGeometry(2.6, 2.8, 0.3, 24), stone, TX2, 0.15, TZ2, { cast: false });
    this._m(new THREE.BoxGeometry(1.1, 0.55, 1.0), stone, TX2, 0.57, TZ2 - 1.2, { outline: true });
    this._m(new THREE.BoxGeometry(1.1, 1.3, 0.2), gold, TX2, 1.35, TZ2 - 1.65, { cast: false });
    for (const sx of [-1, 1]) this._column(TX2 + sx * 1.6, TZ2 - 1.6, 2.6, { order: 'corinthian', r: 0.12 });
    this._entablature(TX2, 2.7, TZ2 - 1.6, 3.6, 0.7, { ry: 0 });
    const pr = this.cast.nymph({ name: 'Antistita', robe: 0xf0ead8, h: 1.0, rank: 'mitre', cutout: null });
    this._npc('b2_venus_priestess', pr, TX2, TZ2 - 1.0, 0, { label: 'The Priestess of Venus', sub: 'ENTHRONED · CH. XXXV', sway: 0.0 });
    const p2 = this.cast.figure({ name: 'Poliphilo', h: 0.95, robe: 0x8a4a3a, pose: 'reach' });
    const q2 = this.cast.nymph({ name: 'Polia', robe: 0xd8c4e8, h: 0.95, garland: 'pancarpial', cutout: null, pose: 'offer' });
    this._npc('b2_poliphilo_kiss', p2, TX2 - 0.4, TZ2 + 0.8, 0.55, { sway: 0.02 });
    this._npc('b2_polia_kiss', q2, TX2 + 0.4, TZ2 + 0.8, -0.55, { sway: 0.02 });
    this._circleCol(TX2, TZ2 - 1.2, 1.0);
    this._plaque({ main: 'IN CONSPECTV ANTISTITAE', sub: 'THE LOVERS KISS IN HER PRESENCE · PLATE 163' },
      2.0, 0.38, TX2, 0.95, TZ2 + 2.4, 0, true);
    // the precinct's own paving, so it reads as one place
    this._m(new THREE.CircleGeometry(14, 40), this._darkStoneMat, BX, 0.02, BZ + 1, { rx: -Math.PI / 2, cast: false });
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

    // ── The ruin names itself, and the device over its gate ────────────────
    //
    // Two inscriptions survive on the front, and between them they are the
    // whole argument of the place. The dedicatory frieze gives it its name in
    // correct Roman funerary formula; the emblem in the pediment gives it its
    // meaning, in signs, and Poliphilo reads those signs the way he reads every
    // other set in the book.
    //
    //   D · M · S ·  CADAVERIBVS AMORE FVRENTIVM MISERABVNDIS POLYANDRION
    //   "To the Gods of the Dead: the Polyandrion, for the wretched corpses of
    //    those raging with love."
    //
    //   An owl, and a funeral lamp — woodcut_catalog #93, "Architrave fragment
    //   with bird and lamp" — which he decodes as VITAE LETHIFER NVNTIVS, "the
    //   death-bringing messenger of life."
    //
    // Both are in this project's own translation of chapter XIX (folio 236,
    // confidence: high, "the two inscriptions are secure and read from the
    // woodcut"). Every surface of this ruin is a text; that is what the
    // Polyandrion is for, and what Poliphilo comes here to do.
    this._frieze(PX - 2.15, 3.95, PZ - 3.0, 2.7, 0.34, 'meander');
    this._plaque({ main: 'D · M · S · POLYANDRION',
                   sub: 'CADAVERIBVS AMORE FVRENTIVM MISERABVNDIS · FOR THE WRETCHED CORPSES OF THOSE RAGING WITH LOVE' },
      2.9, 0.44, PX - 2.15, 3.35, PZ - 2.98, 0, true);

    // A pediment for the device to sit in. It had none: the owl and the lamp
    // were hanging in the air over the architrave, and an emblem needs a
    // tympanum the way an inscription needs a frieze.
    const tympMat = woodcut ? S.mat({ tone: 0.06 }) : S.mat({ color: 0xb5a789, roughness: 0.9 });
    this._m(new THREE.BoxGeometry(2.9, 0.9, 0.62), tympMat, PX - 2.15, 4.66, PZ - 3.4,
      { outline: true });
    const rake = this._m(new THREE.CylinderGeometry(1.62, 1.62, 0.7, 3), this._stoneMat,
      PX - 2.15, 5.28, PZ - 3.4, { outline: true });
    rake.rotation.x = Math.PI / 2;                      // a shallow raking cornice
    rake.scale.y = 0.34;

    // the pediment device: the owl on the left, the hanging lamp on the right
    const devMat = woodcut ? S.mat({ tone: 0.24 }) : S.mat({ color: 0x51452f, roughness: 0.82 });
    const ox = PX - 3.0, oy = 4.58, oz = PZ - 3.06;
    const owl = this._m(new THREE.SphereGeometry(0.22, 12, 9), devMat, ox, oy, oz);
    owl.scale.set(0.9, 1.1, 0.6);
    for (const sx of [-1, 1]) {                       // the two great eyes, and the ear-tufts
      this._m(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 12), devMat,
        ox + sx * 0.085, oy + 0.06, oz + 0.13, { rx: Math.PI / 2, cast: false });
      this._m(new THREE.ConeGeometry(0.045, 0.12, 5), devMat, ox + sx * 0.13, oy + 0.26, oz,
        { rz: -sx * 0.35, cast: false });
    }
    this._m(new THREE.ConeGeometry(0.035, 0.09, 5), devMat, ox, oy + 0.02, oz + 0.16,
      { rx: Math.PI / 2, cast: false });               // the beak
    this._m(new THREE.BoxGeometry(0.34, 0.05, 0.16), devMat, ox, oy - 0.26, oz, { cast: false });  // the perch

    const lx = PX - 1.3;
    this._m(new THREE.CylinderGeometry(0.012, 0.012, 0.34, 4), devMat, lx, oy + 0.26, oz, { cast: false });
    const bowl = this._m(new THREE.SphereGeometry(0.17, 12, 9, 0, Math.PI * 2, 0, Math.PI / 1.8),
      devMat, lx, oy + 0.06, oz);
    bowl.rotation.x = Math.PI;
    this._m(new THREE.ConeGeometry(0.055, 0.16, 7), devMat, lx - 0.2, oy + 0.03, oz,
      { rz: 1.35, cast: false });                      // the spout, where the wick sits
    this._m(new THREE.TorusGeometry(0.055, 0.014, 6, 12), devMat, lx + 0.2, oy + 0.05, oz,
      { rx: Math.PI / 2, cast: false });               // the handle

    this._plaque({ main: 'VITAE LETHIFER NVNTIVS',
                   sub: 'THE OWL AND THE LAMP · THE DEATH-BRINGING MESSENGER OF LIFE' },
      2.2, 0.34, PX - 2.15, 5.62, PZ - 3.06, 0, true);
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
    // "each a different tree plantation" (Segre): the twelve wedges take the
    // species our translation names in the bosco, pp. 317–318 — cypress, pine,
    // juniper, olive, laurel, arbutus, palm, orange — and the plane, oak, elm
    // and citron it names elsewhere on the island.
    const BOSCO = ['cypress', 'pine', 'juniper', 'olive', 'laurel', 'arbutus', 'palm', 'orange', 'plane', 'oak', 'elm', 'citron'];
    for (let k = 0; k < 12; k++) {
      const a0 = k * STEP;
      for (let t = 0; t < 5; t++) {
        const a = a0 + (0.14 + rnd(k * 7 + t, 1) * 0.72) * STEP;
        const r = 37 + rnd(k * 7 + t, 2) * 9.5;
        const [x, z] = pos(a, r);
        this._tree(x, z, 0.9 + rnd(k * 7 + t, 3) * 0.5, BOSCO[k]);
      }
      // the enclosure: a cypress at mid-wedge on the rim, myrtle beneath it
      const [ex, ez] = pos(a0 + STEP / 2, 48.2);
      this._tree(ex, ez, 1.25, 'cypress');
      const [mx, mz] = pos(a0 + STEP / 2 + 0.06, 47.0);
      this._tree(mx, mz, 0.55, 'myrtle');
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
        // The clipped work the book says is trimmed every day — and the plates
        // name each piece rather than leaving it generic: the box man carrying
        // two towers and an arch (#117), the mushroom (#120), the three
        // peacocks on their altar-vase (#127), the ring-tree on its altar
        // (#116/#125). Six lawns, so each figure appears once or twice.
        this._topiary(['man', 'mushroom', 'peacocks', 'ring', 'mushroom', 'man'][k / 2], cx, cz, 0.95);
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

    // The peristyle that bounds the prati on the inside (#121, folio 298)
    this._cytheraPeristyle(CX, CZ);

    // The trophies of the disarmed gods, lining the road up from the landing
    // (#130-#136) — including QUIS EVADET? / NEMO, which the tour has cited
    // since the commentary was written and the world did not have.
    this._cytheraTrophies(CX, CZ);

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
      // the flower-bed ring at the tier's inner lip: a BED, flat and flowered,
      // not a tube — the torus read as a coloured pipe once real box-work
      // stood beside it
      const bedMat = lit
        ? new THREE.MeshStandardMaterial({ map: this._flowerBedTexture(t.bed), roughness: 0.9 })
        : S.mat({ tone: 0.16 });
      if (lit) this._disp.push(bedMat);
      this._m(new THREE.RingGeometry(t.r0 + 0.15, t.r0 + 0.75, 40), bedMat, CX, t.h + 0.02, CZ, { rx: -Math.PI / 2, cast: false });
      this._m(new THREE.CylinderGeometry(t.r0 + 0.78, t.r0 + 0.78, 0.12, 40, 1, true), this._hedgeMat, CX, t.h + 0.06, CZ, { cast: false })
        .material.side = THREE.DoubleSide;
    });
    // The rings in Segre's order, outermost first: the conifer parterre, the
    // knot cloister, the spice wood — the first build had them inverted.
    this._buildParterres(CX, CZ);
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
    this._buildAmphitheatre(CX, CZ);
    this._buildCupidTriumph(CX, CZ + 23);

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

  // ── Cythera's box-work ───────────────────────────────────
  //
  // Our translation, pp. 316–318 (ch. XXI), which is the most exact garden
  // writing in the book, and Segre's ring order (GARDENS.md §5: conifers in
  // geometric array, then two rings of knot gardens, then the spice wood).
  //
  //   THE RAMPART (p. 316): at the top of the first flight "a hedge of box …
  //   three feet's thickness, and six high", and along it "a tower of the said
  //   greenery, raised nine feet, and five wide, with an open door gaping three
  //   feet"; between the towers, in clipped box, "a triumph, with horses
  //   drawing a chariot … a naval Enyo … a fleet-battle on land … a hunt, and
  //   antique fables of love".
  //   THE FIRST CLOISTER (pp. 316–317): beds like "charaine carpets laid out
  //   and spread flat", "between two rhombs, a circle; and a rhomboid between
  //   two circles, alternating continuously in a ring"; "in the navel of the
  //   round ones, planted, rose up a tall cypress. In the middle of the rhombs,
  //   a most straight and tufted pine"; savin (juniper) in the friezes between.
  //   THE SECOND CLOISTER (p. 318): "towers, or watch-turrets, most excellently
  //   heaped up of orange-trees", the between-tower hedge "of juniper … of
  //   mastic … of arbutus, of privet, of rosemary-tree, of dog-thorn, of olive,
  //   of laurel"; box "led into symmetrical crescent-horns" with "a juniper,
  //   step by step declining in tiers" between them and "a stalk, mounting a
  //   foot and a half, where a box-sphere rounded itself"; and the knotwork
  //   squares of the kitchen-garden, which the terrace top carries as a tile.
  _buildParterres(CX, CZ) {
    const S = this.style, lit = S.key !== 'woodcut';
    const pos = (a, r) => [CX + Math.cos(a) * r, CZ + Math.sin(a) * r];
    const box = this._hedgeMat;
    const gravel = lit ? S.mat({ color: 0xa8904a, roughness: 0.95 }) : S.mat({ tone: 0.06, rim: 0 });
    const onRoad = (a, w = 0.2) => Math.min(...[0, 1, 2, 3].map(q => Math.abs(((a - q * Math.PI / 2 + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI))) < w;

    // ── the rampart, outside the outer terrace: box six high, towers of nine
    const RR = 17.6, HH = 1.2, TH = 1.8;
    for (let q = 0; q < 4; q++) {
      const a0 = q * Math.PI / 2 + 0.2, a1 = q * Math.PI / 2 + Math.PI / 2 - 0.2;
      this._m(new THREE.CylinderGeometry(RR + 0.3, RR + 0.3, HH, 40, 1, true, Math.PI / 2 - a1, a1 - a0), box, CX, HH / 2 + 1.26, CZ, { cast: false })
        .material.side = THREE.DoubleSide;
      this._m(new THREE.RingGeometry(RR, RR + 0.6, 40, 1, a0, a1 - a0), box, CX, HH + 1.26, CZ, { rx: -Math.PI / 2, cast: false });
      // five towers a quarter, a door in each, and the clipped triumphs between
      for (let t = 0; t < 5; t++) {
        const a = a0 + (t + 0.5) / 5 * (a1 - a0);
        const [x, z] = pos(a, RR + 0.3);
        const tw = this._m(new THREE.BoxGeometry(1.0, TH, 1.0), box, x, TH / 2 + 1.26, z, { outline: true });
        tw.rotation.y = -a;
        this._m(new THREE.BoxGeometry(0.5, 1.1, 1.1), this._darkStoneMat, x, 0.55 + 1.26, z, { cast: false }).rotation.y = -a;   // the door, dark
        if (t < 4) {
          // between towers: the box reliefs — a chariot and its team, a ship, a
          // hunt — read as clipped silhouettes standing proud of the hedge
          const am = a0 + (t + 1) / 5 * (a1 - a0);
          const [rx, rz] = pos(am, RR + 0.62);
          const relief = new THREE.Group(); relief.position.set(rx, HH + 1.26, rz); relief.rotation.y = -am + Math.PI / 2; this.scene.add(relief);
          const kind = (q * 4 + t) % 4;
          if (kind === 0) {          // the triumph: two horses and a car
            for (const dx of [-0.9, -0.5]) this._m(new THREE.BoxGeometry(0.34, 0.24, 0.16), box, dx, 0.2, 0, { parent: relief, cast: false });
            this._m(new THREE.BoxGeometry(0.44, 0.3, 0.2), box, 0.2, 0.2, 0, { parent: relief, cast: false });
            this._m(new THREE.CylinderGeometry(0.14, 0.14, 0.06, 10), box, 0.2, 0.1, 0.12, { parent: relief, cast: false, rx: Math.PI / 2 });
            this._m(new THREE.CapsuleGeometry(0.06, 0.2, 3, 6), box, 0.6, 0.35, 0, { parent: relief, cast: false });
          } else if (kind === 1) {   // the naval Enyo: a hull and a sail
            this._m(new THREE.BoxGeometry(1.1, 0.16, 0.2), box, 0, 0.1, 0, { parent: relief, cast: false });
            this._m(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 5), box, 0, 0.45, 0, { parent: relief, cast: false });
            this._m(new THREE.BoxGeometry(0.5, 0.4, 0.06), box, 0.2, 0.5, 0, { parent: relief, cast: false });
          } else if (kind === 2) {   // the hunt: a stag and a hound
            this._m(new THREE.BoxGeometry(0.4, 0.22, 0.16), box, -0.4, 0.22, 0, { parent: relief, cast: false });
            for (const dx of [-0.52, -0.3]) this._m(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 4), box, dx, 0.5, 0, { parent: relief, cast: false, rz: (dx < -0.4 ? 0.4 : -0.4) });
            this._m(new THREE.BoxGeometry(0.3, 0.14, 0.12), box, 0.4, 0.12, 0, { parent: relief, cast: false });
          } else {                   // the fables of love: two figures
            for (const dx of [-0.25, 0.25]) this._m(new THREE.CapsuleGeometry(0.08, 0.3, 3, 6), box, dx, 0.35, 0, { parent: relief, cast: false });
          }
        }
      }
    }

    // ── the first cloister, on the outer terrace: circle, rhomb, circle …
    const T3 = { r0: 14, r1: 17, h: 1.26 }, mid = (T3.r0 + T3.r1) / 2;
    for (let q = 0; q < 4; q++) {
      const a0 = q * Math.PI / 2 + 0.2, a1 = q * Math.PI / 2 + Math.PI / 2 - 0.2, n = 7;
      for (let i = 0; i < n; i++) {
        const a = a0 + (i + 0.5) / n * (a1 - a0);
        const [x, z] = pos(a, mid);
        const y = T3.h + 0.02;
        if (i % 2 === 0) {
          // a circle of box, a cypress in its navel
          this._m(new THREE.TorusGeometry(1.0, 0.12, 6, 24), box, x, y + 0.1, z, { rx: Math.PI / 2, cast: false });
          this._m(new THREE.CircleGeometry(0.9, 20), gravel, x, y + 0.005, z, { rx: -Math.PI / 2, cast: false });
          const t = this._tree(x, z, 0.5, 'cypress'); if (t) t.position.y = y;
        } else {
          // a rhomb of box, a pine in its middle
          const rh = new THREE.Group(); rh.position.set(x, y + 0.1, z); rh.rotation.y = -a; this.scene.add(rh);
          for (let e = 0; e < 4; e++) {
            const ea = e * Math.PI / 2 + Math.PI / 4;
            const seg = this._m(new THREE.BoxGeometry(1.5, 0.2, 0.2), box, Math.cos(ea) * 0.55, 0, Math.sin(ea) * 0.55, { parent: rh, cast: false });
            seg.rotation.y = -ea + Math.PI / 2;
          }
          const gp = this._m(new THREE.PlaneGeometry(1.5, 1.5), gravel, 0, -0.095, 0, { parent: rh, cast: false, rx: -Math.PI / 2 });
          gp.rotation.z = Math.PI / 4;
          const t = this._tree(x, z, 0.45, 'pine'); if (t) t.position.y = y;
        }
      }
      // the savin (juniper) in the friezes at the road's edges
      for (const ae of [a0 + 0.04, a1 - 0.04]) {
        const [x, z] = pos(ae, mid);
        const t = this._tree(x, z, 0.4, 'juniper'); if (t) t.position.y = T3.h;
      }
    }

    // ── the second cloister, on the middle terrace: orange towers, the
    //    hedges of eight kinds, crescent-horns with a tiered juniper, box
    //    spheres on stalks; the knot squares are the terrace's own tile
    const T2 = { r0: 11, r1: 14, h: 0.84 }, m2 = T2.r1 - 0.5;
    for (let q = 0; q < 4; q++) {
      const a0 = q * Math.PI / 2 + 0.2, a1 = q * Math.PI / 2 + Math.PI / 2 - 0.2, n = 4;
      for (let i = 0; i <= n; i++) {
        const a = a0 + i / n * (a1 - a0);
        const [x, z] = pos(a, m2);
        // an orange tower: a box-clipped turret with orange foliage on it
        this._m(new THREE.CylinderGeometry(0.42, 0.46, 1.3, 10), box, x, T2.h + 0.65, z, { outline: true });
        this._canopyCards(this.scene, 'orange', x, T2.h + 1.45, z, 0.5, 0.42, 0.5, 14, Math.round(a * 100));
        if (i < n) {
          // between: the crescent-horns of box, the tiered juniper, the sphere
          const am = a0 + (i + 0.5) / n * (a1 - a0);
          const [hx, hz] = pos(am, m2);
          for (const sgn of [-1, 1]) {
            const horn = this._m(new THREE.TorusGeometry(0.42, 0.1, 6, 14, Math.PI * 0.9), box, hx + Math.cos(am + Math.PI / 2) * sgn * 0.45, T2.h + 0.3, hz + Math.sin(am + Math.PI / 2) * sgn * 0.45, { cast: false });
            horn.rotation.set(0, -am, sgn > 0 ? Math.PI * 0.05 : Math.PI * 1.05);
          }
          for (let k = 0; k < 4; k++) this._m(new THREE.ConeGeometry(0.26 - k * 0.05, 0.26, 8), this._leafMat, hx, T2.h + 0.15 + k * 0.22, hz, { cast: false });
          this._m(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 5), this._trunkMat, hx + Math.cos(am) * 0.9, T2.h + 0.22, hz + Math.sin(am) * 0.9, { cast: false });
          this._m(new THREE.SphereGeometry(0.2, 10, 8), box, hx + Math.cos(am) * 0.9, T2.h + 0.58, hz + Math.sin(am) * 0.9, { cast: false, outline: true });
          // and the hedge between, in its own kind, in the order the text gives
          const HK = ['juniper', 'laurel', 'arbutus', 'olive', 'laurel', 'juniper', 'olive', 'laurel'];
          const [ex, ez] = pos(am, T2.r1 - 1.6);
          const t = this._tree(ex, ez, 0.32, HK[(q * n + i) % HK.length]); if (t) t.position.y = T2.h;
        }
      }
    }

    // ── the spice wood, innermost (Segre's fourth ring): citron, juniper,
    //    terebinth, almond — the terebinth as olive, the almond as laurel
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + 0.2;
      if (onRoad(a, 0.28)) continue;
      const [x, z] = pos(a, 9.5);
      const t = this._tree(x, z, 0.42, ['citron', 'juniper', 'olive', 'laurel'][i % 4]); if (t) t.position.y = 0.42;
    }
    this._plaque({ main: 'TAPETI CHARAINI', sub: 'THE BEDS LIKE CARPETS FROM CAIRO · A CIRCLE BETWEEN TWO RHOMBS · CH. XXI' },
      2.2, 0.36, CX + 2.6, 1.3 + 0.5, CZ + 18.6, 0, true);
  }

  // ── The peristyle of the pleasure-ground ────────────────────────────────
  //
  // woodcut_catalog #121 (folio 298) is "Peristyle in pleasure-ground of island
  // of Venus", and GARDENS.md §"middle claustro" has the prati "bounded outside
  // by a road under a vaulted pergola, inside by a peristyle and the river."
  // The peristyle was named in both and built in neither: the middle ring just
  // ended at the water. It is a colonnade, so it uses the shared members.
  _cytheraPeristyle(CX, CZ) {
    const R = 23.4;                       // just outside the river's outer bank
    const N = 24;                         // a column every 15°
    const pos = (a, r) => [CX + Math.cos(a) * r, CZ + Math.sin(a) * r];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      // the four crossroads stay open — the chariots pass through them
      if (Math.min(...[0, 1, 2, 3].map(q =>
        Math.abs(((a - q * Math.PI / 2 + Math.PI) % (Math.PI * 2)) - Math.PI))) < 0.16) continue;
      const [x, z] = pos(a, R);
      this._column(x, z, 3.1, { order: 'corinthian', r: 0.19 });
      this._circleCol(x, z, 0.42);
    }
    // the circular architrave, in bays, skipping the four openings
    for (let i = 0; i < N; i++) {
      const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2;
      const am = (a0 + a1) / 2;
      if (Math.min(...[0, 1, 2, 3].map(q =>
        Math.abs(((am - q * Math.PI / 2 + Math.PI) % (Math.PI * 2)) - Math.PI))) < 0.24) continue;
      const [mx, mz] = pos(am, R);
      const span = 2 * R * Math.sin(Math.PI / N);
      this._entablature(mx, 3.2, mz, span + 0.26, 0.62, { ry: -am });
    }
  }

  // A spoil cut to its own outline — a pelt or a tunic — painted on a
  // transparent canvas and hung on an alpha-tested plane. Drawn rather than
  // built for the reason RENAISSANCEART.md gives for the painted figures:
  // painting sidesteps the silhouette problem that makes assembled boxes read
  // as boxes. A tiger-skin is a shape before it is a texture.
  _spoilTexture(kind, ink = false) {
    const W = 256, H = 320;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');
    // Two registers, one drawing. Lit: the tawny pelt and the crimson tunic.
    // Woodcut: paper ground and one ink, because a coloured spoil in flat-ink
    // mode is the only coloured thing on the page and destroys the register.
    const PELT   = ink ? '#efeade' : '#c08a3c';
    const STRIPE = ink ? '#2b2620' : '#2a1a0c';
    const FACE   = ink ? '#ffffff' : '#f0e2c8';
    const CLOTH  = ink ? '#efeade' : '#a8324a';
    const CLAVI  = ink ? '#2b2620' : '#7a1f33';
    const FOLD   = ink ? 'rgba(43,38,32,0.55)' : 'rgba(0,0,0,0.22)';
    const SHEEN  = ink ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,0.16)';

    if (kind === 'pelt') {
      // the flayed skin: body, head, four splayed legs, tail
      x.fillStyle = PELT;
      if (ink) { x.strokeStyle = STRIPE; x.lineWidth = 3; }
      x.beginPath();
      x.moveTo(128, 22);                                   // the muzzle
      x.bezierCurveTo(168, 30, 176, 66, 158, 84);          // right cheek
      x.bezierCurveTo(214, 92, 236, 120, 214, 140);        // right foreleg
      x.bezierCurveTo(190, 156, 176, 150, 166, 142);
      x.bezierCurveTo(178, 196, 178, 232, 168, 254);       // right flank
      x.bezierCurveTo(214, 268, 226, 296, 202, 306);       // right hind leg
      x.bezierCurveTo(180, 314, 164, 300, 156, 282);
      x.bezierCurveTo(150, 300, 142, 306, 132, 306);       // the tail root
      x.lineTo(124, 306);
      x.bezierCurveTo(114, 306, 106, 300, 100, 282);
      x.bezierCurveTo(92, 300, 76, 314, 54, 306);          // left hind leg
      x.bezierCurveTo(30, 296, 42, 268, 88, 254);
      x.bezierCurveTo(78, 232, 78, 196, 90, 142);          // left flank
      x.bezierCurveTo(80, 150, 66, 156, 42, 140);          // left foreleg
      x.bezierCurveTo(20, 120, 42, 92, 98, 84);
      x.bezierCurveTo(80, 66, 88, 30, 128, 22);
      x.closePath();
      x.fill();
      if (ink) x.stroke();

      // the stripes follow the body, so they must be clipped to it
      x.save(); x.clip();
      x.fillStyle = STRIPE;
      for (let i = 0; i < 15; i++) {
        const y = 70 + i * 16 + Math.sin(i) * 4;
        const w = 34 + Math.sin(i * 1.7) * 22;
        x.save();
        x.translate(128, y);
        x.rotate((i % 2 ? 1 : -1) * 0.22);
        x.beginPath();
        x.ellipse(0, 0, w, 5 + (i % 3), 0, 0, Math.PI * 2);
        x.fill();
        x.restore();
      }
      for (const sx of [-1, 1]) {                          // the leg stripes
        for (let i = 0; i < 4; i++) {
          x.save();
          x.translate(128 + sx * (70 + i * 8), 116 + i * 7);
          x.rotate(sx * 0.5);
          x.fillRect(-16, -3, 32, 6);
          x.restore();
        }
      }
      x.restore();

      // the face: the mask is what makes it read as an animal and not a rug
      x.fillStyle = FACE;
      x.beginPath(); x.ellipse(128, 52, 26, 20, 0, 0, Math.PI * 2); x.fill();
      x.fillStyle = STRIPE;
      x.beginPath(); x.ellipse(113, 46, 6, 4, 0.2, 0, Math.PI * 2); x.fill();
      x.beginPath(); x.ellipse(143, 46, 6, 4, -0.2, 0, Math.PI * 2); x.fill();
      x.beginPath(); x.ellipse(128, 62, 7, 5, 0, 0, Math.PI * 2); x.fill();
      x.strokeStyle = STRIPE; x.lineWidth = 2.4;
      x.beginPath(); x.moveTo(128, 66); x.lineTo(128, 74); x.stroke();
    } else {
      // the tunic: shoulders, sleeves, a skirted hem
      x.fillStyle = CLOTH;
      if (ink) { x.strokeStyle = CLAVI; x.lineWidth = 3; }
      x.beginPath();
      x.moveTo(96, 40);
      x.lineTo(160, 40);                                   // the neck
      x.lineTo(196, 62); x.lineTo(230, 108);               // right sleeve
      x.lineTo(206, 126); x.lineTo(180, 96);
      x.lineTo(190, 250);                                  // right side, flaring
      x.quadraticCurveTo(128, 266, 66, 250);               // the hem
      x.lineTo(76, 96);
      x.lineTo(50, 126); x.lineTo(26, 108);                // left sleeve
      x.lineTo(60, 62);
      x.closePath();
      x.fill();
      if (ink) x.stroke();
      // the clavi — the two woven bands down a Roman tunic
      x.fillStyle = CLAVI;
      x.fillRect(100, 60, 12, 190);
      x.fillRect(144, 60, 12, 190);
      // folds
      x.strokeStyle = FOLD; x.lineWidth = 3;
      for (const px of [88, 128, 168]) {
        x.beginPath(); x.moveTo(px, 70); x.quadraticCurveTo(px + 6, 160, px, 248); x.stroke();
      }
      x.fillStyle = SHEEN;
      x.beginPath(); x.moveTo(118, 44); x.quadraticCurveTo(128, 150, 122, 254);
      x.lineTo(136, 254); x.quadraticCurveTo(142, 150, 138, 44); x.closePath(); x.fill();
    }

    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    this._disp.push(t);
    return t;
  }

  // ── The trophies of the disarmed gods ───────────────────────────────────
  //
  // Seven plates in a row on the approach to the theatre (woodcut_catalog
  // #130-#136, folios 317-321): Roman arms with a winged genius head; a tunic
  // with a winged genius head and laurel; a tiger-skin and a bull's head; a
  // winged disk lettered QUIS EVADET?; a winged tablet answering NEMO; gold
  // wings with floating ribbons; and a laurel wreath with Cupid.
  //
  // The tour has cited *Quis evadet? — Nemo* at two stops since the commentary
  // was written, and the world had none of it. A trophy in the antique sense is
  // captured arms hung on a post, so that is what these are: a stripped trunk,
  // a crossbar, and the spoils of a god hung on it — lining the north road the
  // procession comes up from the landing.
  _cytheraTrophies(CX, CZ) {
    const S = this.style;
    const woodcut = S.key === 'woodcut';
    const gold = woodcut ? S.mat({ tone: 0.02 })
                         : S.mat({ color: 0xc9a244, metalness: 0.85, roughness: 0.28 });
    const pale = woodcut ? S.mat({ tone: 0.06 })
                         : S.mat({ color: 0xd8cdb4, roughness: 0.8 });
    const cloth = woodcut ? S.mat({ tone: 0.10, side: THREE.DoubleSide })
                          : S.mat({ color: 0xa8324a, roughness: 0.9, side: THREE.DoubleSide });
    // the cut spoils: alpha-tested so the shape is the silhouette, not the plane
    const spoilMat = (kind) => new THREE.MeshStandardMaterial({
      map: this._spoilTexture(kind, woodcut),
      transparent: true, alphaTest: 0.42, side: THREE.DoubleSide,
      roughness: 0.92,
    });

    // the winged genius head that recurs on four of the seven plates
    const genius = (g, y) => {
      this._m(new THREE.SphereGeometry(0.16, 12, 9), pale, 0, y, 0, { parent: g });
      for (const sx of [-1, 1]) {
        const w = this._m(new THREE.SphereGeometry(0.22, 10, 7, 0, Math.PI), gold,
          sx * 0.15, y + 0.05, -0.02, { parent: g, cast: false });
        w.scale.set(0.9, 0.7, 0.13);
        w.rotation.set(0.1, sx * 0.5, sx * 0.7);
      }
    };

    // a lettered tablet — the plates' own words, carved, not invented
    const tablet = (g, y, word) => {
      const t = this._m(new THREE.BoxGeometry(0.92, 0.4, 0.06), pale, 0, y, 0.05, { parent: g });
      void t;
      const face = this._m(new THREE.PlaneGeometry(0.86, 0.34),
        new THREE.MeshStandardMaterial({
          map: this._plaqueTexture({ main: word }, true),
          roughness: 0.85, side: THREE.DoubleSide,
        }), 0, y, 0.09, { parent: g, cast: false });
      void face;
      for (const sx of [-1, 1]) {                              // the gold wings
        const w = this._m(new THREE.SphereGeometry(0.3, 10, 7, 0, Math.PI), gold,
          sx * 0.58, y, 0.02, { parent: g, cast: false });
        w.scale.set(1.0, 0.42, 0.1);
        w.rotation.set(0, sx * 0.35, sx * 0.28);
      }
    };

    const TROPHIES = [
      { r: 44.0, side: -1, kind: 'arms',    label: 'ARMA',        sub: 'ROMAN ARMS · WINGED GENIUS' },
      { r: 40.0, side:  1, kind: 'tunic',   label: 'TVNICA',      sub: 'THE TUNIC, WITH LAUREL' },
      { r: 36.0, side: -1, kind: 'hide',    label: 'EXVVIAE',     sub: "TIGER-SKIN AND BULL'S HEAD" },
      { r: 31.0, side: -1, kind: 'quis',    label: 'QVIS EVADET', sub: 'WHO ESCAPES?' },
      { r: 31.0, side:  1, kind: 'nemo',    label: 'NEMO',        sub: 'NO ONE' },
      { r: 27.0, side:  1, kind: 'ribbons', label: 'SPOLIA',      sub: 'GOLD WINGS AND RIBBONS' },
      { r: 27.0, side: -1, kind: 'wreath',  label: 'CVPIDO',      sub: 'THE LAUREL WREATH, GAINED BY SPEAR' },
    ];

    for (const t of TROPHIES) {
      // the north road: pos(π/2, r) — the way up from the landing
      const x = CX + t.side * 2.9, z = CZ + t.r;
      const g = new THREE.Group();
      g.position.set(x, 0.08, z);
      g.rotation.y = t.side > 0 ? -0.32 : 0.32;      // turned to face the road
      this.scene.add(g);

      // the post and its crossbar — a tropaeum is arms on a stripped trunk
      this._m(new THREE.CylinderGeometry(0.09, 0.13, 2.5, 8), this._trunkMat, 0, 1.25, 0, { parent: g });
      this._m(new THREE.CylinderGeometry(0.055, 0.055, 1.5, 6), this._trunkMat, 0, 1.95, 0,
        { parent: g, rz: Math.PI / 2 });
      this._m(new THREE.CylinderGeometry(0.42, 0.5, 0.22, 10), this._stoneMat, 0, 0.11, 0, { parent: g });

      if (t.kind === 'arms') {
        // a cuirass, a round shield, two spears crossed behind
        const cui = this._m(new THREE.CylinderGeometry(0.3, 0.26, 0.6, 12, 1, true), gold, 0, 1.65, 0, { parent: g });
        cui.scale.z = 0.62;
        this._m(new THREE.CircleGeometry(0.36, 20), gold, -0.5, 1.6, 0.06, { parent: g, cast: false });
        for (const sx of [-1, 1]) {
          this._m(new THREE.CylinderGeometry(0.028, 0.028, 2.3, 5), pale, sx * 0.34, 1.35, -0.12,
            { parent: g, rz: sx * 0.24 });
        }
        this._m(new THREE.ConeGeometry(0.18, 0.34, 10), gold, 0, 2.16, 0, { parent: g });  // the helm's crest
        genius(g, 2.5);
      } else if (t.kind === 'tunic') {
        const tn = this._m(new THREE.PlaneGeometry(1.28, 1.6), spoilMat('tunic'), 0, 1.68, 0.05,
          { parent: g, cast: false });
        tn.rotation.z = 0.03;
        this._m(new THREE.TorusGeometry(0.3, 0.05, 6, 18), this._leafMat, 0, 2.3, 0.02,
          { parent: g, cast: false });               // the laurel
        genius(g, 2.58);
      } else if (t.kind === 'hide') {
        // the flayed tiger, hung by its forelegs from the crossbar
        const sk = this._m(new THREE.PlaneGeometry(1.28, 1.6), spoilMat('pelt'), 0, 1.28, 0.05,
          { parent: g, cast: false });
        sk.rotation.z = -0.04;
        // the bull's head above, horns out
        const head = this._m(new THREE.SphereGeometry(0.22, 12, 9), pale, 0, 2.18, 0, { parent: g });
        head.scale.set(0.85, 1.0, 1.15);
        for (const sx of [-1, 1]) {
          this._m(new THREE.TorusGeometry(0.15, 0.03, 5, 10, Math.PI * 0.85), pale,
            sx * 0.2, 2.3, 0, { parent: g, ry: sx * 0.6, rz: sx * 1.3, cast: false });
        }
      } else if (t.kind === 'quis' || t.kind === 'nemo') {
        // the disk and the tablet that carry the book's most-quoted motto
        if (t.kind === 'quis') {
          const d = this._m(new THREE.CylinderGeometry(0.44, 0.44, 0.08, 24), pale, 0, 1.62, 0,
            { parent: g, rx: Math.PI / 2 });
          void d;
          this._m(new THREE.TorusGeometry(0.44, 0.04, 6, 24), gold, 0, 1.62, 0.05,
            { parent: g, cast: false });
        }
        tablet(g, t.kind === 'quis' ? 2.24 : 1.85, t.kind === 'quis' ? 'QVIS EVADET' : 'NEMO');
      } else if (t.kind === 'ribbons') {
        for (const sx of [-1, 1]) {
          const w = this._m(new THREE.SphereGeometry(0.4, 10, 8, 0, Math.PI), gold,
            sx * 0.26, 1.85, 0, { parent: g, cast: false });
          w.scale.set(0.9, 1.0, 0.12);
          w.rotation.set(-0.25, sx * 0.55, sx * 0.8);
          // the floating ribbon
          const rb = this._m(new THREE.PlaneGeometry(0.1, 0.9), cloth, sx * 0.5, 1.35, 0.02,
            { parent: g, cast: false });
          rb.rotation.set(0, 0, sx * 0.22);
        }
        this._m(new THREE.SphereGeometry(0.17, 10, 8), gold, 0, 1.9, 0, { parent: g });
      } else {
        // the laurel wreath, with Cupid inside it
        this._m(new THREE.TorusGeometry(0.46, 0.07, 8, 26), this._leafMat, 0, 1.78, 0,
          { parent: g, cast: false });
        const cupid = this.cast.props.putto ? this.cast.props.putto(0.5) : null;
        if (cupid) { cupid.position.set(0, 1.42, 0.08); g.add(cupid); }
        else this._m(new THREE.SphereGeometry(0.16, 10, 8), pale, 0, 1.78, 0.06, { parent: g });
      }

      this._plaque({ main: t.label, sub: t.sub }, 1.15, 0.3, x, 0.5, z + 0.55, Math.PI, true);
      this._circleCol(x, z, 0.72);
    }
  }

  // ── The named topiary ───────────────────────────────────────────────────
  //
  // The island's clipped work is not generic shrubbery: the plates name each
  // piece. #117 is a box-tree clipped as a man supporting towers with an arch;
  // #120 a mushroom; #127 three peacocks on an altar-vase; #116 and #125 the
  // ring-shaped and altar-mounted trees. Segre's "Untangling the Knot" is the
  // source for why the clipped work is architecture rather than ornament, and
  // GARDENS.md §6 for the book's insistence that "the topiary is clipped every
  // day" — the one artifice it will admit.
  _topiary(kind, x, z, scale = 1) {
    const g = new THREE.Group();
    g.position.set(x, 0.07, z);
    g.scale.setScalar(scale);
    this.scene.add(g);
    const leaf = this._leafMat, trunk = this._trunkMat, stone = this._stoneMat;

    if (kind === 'man') {
      // #117 — the box man who carries two towers and the arch between them
      this._m(new THREE.CylinderGeometry(0.16, 0.22, 1.0, 8), trunk, 0, 0.5, 0, { parent: g });
      const body = this._m(new THREE.CylinderGeometry(0.34, 0.26, 0.9, 10), leaf, 0, 1.45, 0,
        { parent: g, outline: true });
      void body;
      this._m(new THREE.SphereGeometry(0.22, 12, 9), leaf, 0, 2.06, 0, { parent: g, outline: true });
      for (const sx of [-1, 1]) {                    // the arms, raised to the towers
        const arm = this._m(new THREE.CylinderGeometry(0.09, 0.09, 0.7, 7), leaf,
          sx * 0.36, 1.85, 0, { parent: g, rz: sx * 0.85, cast: false });
        void arm;
        // a clipped tower on each hand
        for (let t = 0; t < 3; t++) {
          this._m(new THREE.CylinderGeometry(0.19 - t * 0.045, 0.23 - t * 0.045, 0.32, 8), leaf,
            sx * 0.66, 2.24 + t * 0.32, 0, { parent: g, outline: t === 0 });
        }
      }
      // the arch trained between the two towers
      this._m(new THREE.TorusGeometry(0.66, 0.075, 6, 16, Math.PI), leaf, 0, 3.2, 0,
        { parent: g, cast: false });
    } else if (kind === 'mushroom') {
      // #120 — the box-tree clipped as a mushroom
      this._m(new THREE.CylinderGeometry(0.17, 0.24, 1.05, 8), trunk, 0, 0.52, 0, { parent: g });
      const cap = this._m(new THREE.SphereGeometry(0.82, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
        leaf, 0, 1.05, 0, { parent: g, outline: true });
      cap.scale.y = 0.55;
      this._m(new THREE.CylinderGeometry(0.82, 0.82, 0.07, 16), leaf, 0, 1.03, 0, { parent: g, cast: false });
    } else if (kind === 'peacocks') {
      // #127 — three peacocks clipped on an altar-vase
      this._m(new THREE.CylinderGeometry(0.42, 0.52, 0.34, 10), stone, 0, 0.17, 0, { parent: g });
      this._m(new THREE.CylinderGeometry(0.24, 0.34, 0.62, 12), stone, 0, 0.65, 0, { parent: g });
      this._m(new THREE.CylinderGeometry(0.44, 0.28, 0.3, 14), stone, 0, 1.11, 0, { parent: g });
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        const px = Math.cos(a) * 0.3, pz = Math.sin(a) * 0.3;
        const body = this._m(new THREE.SphereGeometry(0.2, 10, 8), leaf, px, 1.46, pz,
          { parent: g, outline: true });
        body.scale.set(0.75, 1.0, 1.1);
        this._m(new THREE.CylinderGeometry(0.05, 0.07, 0.24, 6), leaf,
          px + Math.cos(a) * 0.1, 1.72, pz + Math.sin(a) * 0.1, { parent: g, cast: false });
        this._m(new THREE.SphereGeometry(0.085, 8, 6), leaf,
          px + Math.cos(a) * 0.14, 1.88, pz + Math.sin(a) * 0.14, { parent: g, cast: false });
        // the fan of the tail, clipped flat
        const tail = this._m(new THREE.CircleGeometry(0.36, 14, 0, Math.PI), leaf,
          px - Math.cos(a) * 0.24, 1.6, pz - Math.sin(a) * 0.24, { parent: g, cast: false });
        tail.rotation.y = -a + Math.PI / 2;
      }
    } else {
      // #116 / #125 — the ring-shaped tree, on its altar with the bull's skull
      this._m(new THREE.BoxGeometry(0.86, 0.5, 0.86), stone, 0, 0.25, 0, { parent: g });
      this._m(new THREE.CylinderGeometry(0.14, 0.18, 0.9, 8), trunk, 0, 0.95, 0, { parent: g });
      this._m(new THREE.TorusGeometry(0.54, 0.19, 10, 22), leaf, 0, 1.72, 0, { parent: g, outline: true });
      this._m(new THREE.SphereGeometry(0.15, 8, 6), this._stoneMat, 0, 0.3, 0.45, { parent: g, cast: false });
    }
    this._circleCol(x, z, 0.6 * scale);
    return g;
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
  // A bed of the pot-herbs "in all manners of colouring" (p. 316): a dark
  // leafy ground with flower-heads scattered in the bed's own colour and its
  // neighbours'. One tile, repeated round the ring.
  _flowerBedTexture(hex) {
    this._bedTex = this._bedTex || {};
    if (this._bedTex[hex]) return this._bedTex[hex];
    const N = 128, c = document.createElement('canvas'); c.width = c.height = N;
    const x = c.getContext('2d');
    x.fillStyle = '#2c4a1c'; x.fillRect(0, 0, N, N);
    const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7 + hex % 977) * 43758.5453; return v - Math.floor(v); };
    for (let i = 0; i < 140; i++) { x.fillStyle = ['#3a6224', '#274418', '#4a7a2c'][i % 3]; x.beginPath(); x.arc(rnd(i, 1) * N, rnd(i, 2) * N, 3 + rnd(i, 3) * 4, 0, 6.3); x.fill(); }
    const main = '#' + hex.toString(16).padStart(6, '0');
    const pal = [main, main, main, '#f2ecd8', '#e8c040', '#c84a6a', '#7a5bb8'];
    for (let i = 0; i < 90; i++) {
      x.fillStyle = pal[i % pal.length];
      const px = rnd(i, 4) * N, py = rnd(i, 5) * N;
      for (let p = 0; p < 5; p++) { x.beginPath(); x.arc(px + Math.cos(p * 1.257) * 2.6, py + Math.sin(p * 1.257) * 2.6, 2.1, 0, 6.3); x.fill(); }
      x.fillStyle = '#f0e6a0'; x.beginPath(); x.arc(px, py, 1.3, 0, 6.3); x.fill();
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(24, 2); this._disp.push(t);
    this._bedTex[hex] = t;
    return t;
  }

  _knotTexture() {
    const N = 256;
    const c = document.createElement('canvas');
    c.width = c.height = N;
    const x = c.getContext('2d');
    // p. 318: "a knotwork of the square lineament, fashioned by little
    // bundles … three palms wide. The first band in the middle passed off
    // into a circle, and from the two angles the bands met again at the
    // rounding, one above the other. Which ring knotted within itself another
    // band" — so: a square frame of box, a circle knotted through its middle,
    // diagonals from the corners meeting at the ring, a second ring inside,
    // and the beds between filled with the pot-herbs' colours, "some full of
    // colour, others of dark colouring … some leek-green, others of a pale
    // verdure … somewhat reddish" (p. 316).
    const beds = ['#8a9a4a', '#5a7a3a', '#a86a4a', '#c8b06a', '#4e6a2c', '#9a8a5a'];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      x.fillStyle = beds[(i * 3 + j) % beds.length]; x.fillRect(i * 64, j * 64, 64, 64);
    }
    const band = (fn) => { x.strokeStyle = '#243615'; x.lineWidth = 15; fn(); x.strokeStyle = '#4e7a2c'; x.lineWidth = 9; fn(); };
    band(() => { x.strokeRect(14, 14, N - 28, N - 28); });
    band(() => { x.beginPath(); x.arc(N / 2, N / 2, 78, 0, 6.3); x.stroke(); });
    band(() => { x.beginPath(); x.arc(N / 2, N / 2, 44, 0, 6.3); x.stroke(); });
    band(() => { x.beginPath(); x.moveTo(14, 14); x.lineTo(N / 2 - 55, N / 2 - 55); x.moveTo(N - 14, 14); x.lineTo(N / 2 + 55, N / 2 - 55);
                 x.moveTo(14, N - 14); x.lineTo(N / 2 - 55, N / 2 + 55); x.moveTo(N - 14, N - 14); x.lineTo(N / 2 + 55, N / 2 + 55); x.stroke(); });
    // the over-under: the ring passes over the diagonals, the diagonals over the frame
    x.fillStyle = '#4e7a2c';
    for (const [px, py] of [[N / 2 - 55, N / 2 - 55], [N / 2 + 55, N / 2 - 55], [N / 2 - 55, N / 2 + 55], [N / 2 + 55, N / 2 + 55]]) {
      x.beginPath(); x.arc(px, py, 6, 0, 6.3); x.fill();
    }
    x.strokeStyle = '#a8904a'; x.lineWidth = 4; x.strokeRect(2, 2, N - 4, N - 4);   // the gravel path between squares
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

  // ── Foliage as foliage ───────────────────────────────────
  //
  // Ted, 2026-09-06: "The gardens and trees don't look much like real plants.
  // You were supposed to read the scholarship and the novel itself and get the
  // actual names of the plants and trees and render them accordingly."
  //
  // The names, from the text (counts are word-hits in the 1592 and in our
  // translation of XVII–XXXVIII; PLANTS.md carries the table):
  //   the wood, ch. I (1592 l. 625): "towgh Elmes beloued of the fruitfull
  //     vines, harde Ebony, strong Okes, soft Beeche", and fir boughs;
  //   the way to the palace, ch. VII (1592 p. 123): "a waye set on either
  //     sides with Cyprus Trees", and the enclosure "altogither of Cytrons,
  //     Orenges and Lymonds";
  //   Cythera, ch. XXI–XXII (our pp. 311–330): the bosco enclosed by cypress
  //     with myrtle beneath and a bitter-orange espalier within; compartments
  //     of pine, juniper, olive, laurel, arbutus, palm, orange, plane; the
  //     prati with apples, pears, plums; conifers on the first terrace, box
  //     knots, then the spice wood of citron, terebinth, almond and juniper;
  //     myrtle — Venus's own — about the theatre.
  //
  // How they are built. A canopy of overlapping spheres reads as a blob at
  // any distance; a canopy of LEAF-SPRAY CARDS reads as foliage, because the
  // silhouette breaks into leaves and light comes through it. Each species
  // gets a drawn spray of its own leaf — scale, needle, lanceolate, ovate,
  // lobed, palmate, frond — in two tones, and a crown shape the cards are
  // scattered through. Fixed random orientations, not billboards: a card that
  // turns to face you is a sticker; a card that does not is a leaf.
  static get SPECIES() {
    //                 leaf        crown            trunk        bark      dark      light     cards  extras
    return {
      cypress:  { leaf: 'scale',   crown: [0.55, 2.4, 0.55], trunk: [0.9, 0.09], bark: 0x4a3a28, dark: 0x17300f, light: 0x2c4a18, n: 26, top: 0.62 },
      fir:      { leaf: 'needle',  crown: [1.1, 2.2, 1.1],   trunk: [1.0, 0.11], bark: 0x3e2e1e, dark: 0x16311a, light: 0x2a5228, n: 28, top: 0.64, cone: true },
      juniper:  { leaf: 'scale',   crown: [0.7, 1.7, 0.7],   trunk: [0.5, 0.08], bark: 0x5a4a34, dark: 0x274a3a, light: 0x4a7a5a, n: 20, top: 0.55 },
      pine:     { leaf: 'needle',  crown: [1.9, 0.9, 1.9],   trunk: [3.2, 0.13], bark: 0x5a3a24, dark: 0x1c3612, light: 0x3a5c22, n: 30, top: 1.0, boughs: 4 },
      laurel:   { leaf: 'lance',   crown: [1.2, 1.35, 1.2],  trunk: [1.3, 0.11], bark: 0x4a3a2a, dark: 0x1b3a13, light: 0x3f6a22, n: 26, top: 0.9, boughs: 3 },
      myrtle:   { leaf: 'ovate',   crown: [1.1, 1.0, 1.1],   trunk: [0.9, 0.09], bark: 0x5a4030, dark: 0x16300f, light: 0x2f5419, n: 24, top: 0.8, boughs: 3, bloom: 0xf4f0e6 },
      orange:   { leaf: 'ovate',   crown: [1.15, 1.15, 1.15],trunk: [1.3, 0.10], bark: 0x5a4a34, dark: 0x1f3d16, light: 0x3d6524, n: 26, top: 0.9, boughs: 3, fruit: 0xe08a1c },
      citron:   { leaf: 'ovate',   crown: [1.15, 1.2, 1.15], trunk: [1.3, 0.10], bark: 0x5a4a34, dark: 0x233f1a, light: 0x456a26, n: 26, top: 0.9, boughs: 3, fruit: 0xe8d24a, big: true },
      lemon:    { leaf: 'ovate',   crown: [1.05, 1.15, 1.05],trunk: [1.3, 0.10], bark: 0x5a4a34, dark: 0x1f3d16, light: 0x3f6a26, n: 24, top: 0.9, boughs: 3, fruit: 0xf0e060 },
      apple:    { leaf: 'ovate',   crown: [1.3, 1.1, 1.3],   trunk: [1.4, 0.11], bark: 0x5a4432, dark: 0x2a4a1c, light: 0x5a8a34, n: 26, top: 0.9, boughs: 4, fruit: 0xc83a3a },
      olive:    { leaf: 'narrow',  crown: [1.35, 1.1, 1.35], trunk: [1.5, 0.16], bark: 0x6a5a48, dark: 0x4a5a3e, light: 0x8a9a74, n: 30, top: 0.9, boughs: 4, gnarled: true },
      plane:    { leaf: 'palmate', crown: [2.2, 1.9, 2.2],   trunk: [2.8, 0.17], bark: 0x9a8a6c, dark: 0x2c5a1c, light: 0x6a9a3a, n: 34, top: 0.95, boughs: 4, mottled: true },
      oak:      { leaf: 'lobed',   crown: [2.1, 1.8, 2.1],   trunk: [2.2, 0.20], bark: 0x3e2e1e, dark: 0x22421a, light: 0x4a7a2c, n: 34, top: 0.95, boughs: 5 },
      beech:    { leaf: 'ovate',   crown: [1.7, 2.1, 1.7],   trunk: [2.4, 0.14], bark: 0x8a8070, dark: 0x2a4c1a, light: 0x5c8c30, n: 30, top: 0.95, boughs: 3 },
      elm:      { leaf: 'ovate',   crown: [1.6, 2.4, 1.6],   trunk: [2.6, 0.14], bark: 0x4a3a2c, dark: 0x22441a, light: 0x4c7c2c, n: 30, top: 0.95, boughs: 3, vine: true },
      willow:   { leaf: 'narrow',  crown: [1.8, 1.9, 1.8],   trunk: [1.8, 0.14], bark: 0x5a4a38, dark: 0x3a5a2a, light: 0x7a9a58, n: 34, top: 0.9, boughs: 3, weeping: true },
      arbutus:  { leaf: 'lance',   crown: [1.2, 1.3, 1.2],   trunk: [1.2, 0.10], bark: 0x8a3a24, dark: 0x1c3a14, light: 0x3c6a22, n: 24, top: 0.9, boughs: 3, fruit: 0xd8402a },
      palm:     { leaf: 'frond',   crown: [1.6, 0.9, 1.6],   trunk: [3.4, 0.12], bark: 0x7a6a4a, dark: 0x2a5a24, light: 0x5c9a3c, n: 14, top: 1.0, fronds: true },
    };
  }

  // A spray of one species' leaves, drawn once and shared: the card texture.
  _leafCardTexture(species) {
    this._leafCards = this._leafCards || {};
    if (this._leafCards[species]) return this._leafCards[species];
    const SP = HPWorldScene.SPECIES[species] || HPWorldScene.SPECIES.laurel;
    const N = 256;
    const c = document.createElement('canvas'); c.width = c.height = N;
    const x = c.getContext('2d');
    const hex = (h) => '#' + h.toString(16).padStart(6, '0');
    const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7 + species.length * 17.3) * 43758.5453; return v - Math.floor(v); };
    const leaf = (cx, cy, len, ang, tone) => {
      x.save(); x.translate(cx, cy); x.rotate(ang);
      x.fillStyle = tone; x.strokeStyle = tone; x.lineCap = 'round';
      if (SP.leaf === 'scale' || SP.leaf === 'needle') {
        x.lineWidth = SP.leaf === 'scale' ? 3.2 : 1.6;
        const k = SP.leaf === 'scale' ? 5 : 9;
        for (let i = 0; i < k; i++) {
          const t = (i / (k - 1) - 0.5) * (SP.leaf === 'scale' ? 0.9 : 1.6);
          x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.sin(t) * len, -Math.cos(t) * len); x.stroke();
        }
      } else if (SP.leaf === 'frond') {
        x.lineWidth = 2.4;
        x.beginPath(); x.moveTo(0, 0); x.lineTo(0, -len * 2.2); x.stroke();
        for (let i = 1; i < 9; i++) {
          const yy = -len * 2.2 * i / 9;
          for (const sgn of [-1, 1]) { x.beginPath(); x.moveTo(0, yy); x.lineTo(sgn * len * 0.55, yy - len * 0.25); x.stroke(); }
        }
      } else if (SP.leaf === 'palmate') {
        x.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = (i - 2) * 0.55, L = len * (i === 2 ? 1.0 : 0.8);
          x.moveTo(0, 0); x.lineTo(Math.sin(a - 0.18) * L * 0.55, -Math.cos(a - 0.18) * L * 0.55);
          x.lineTo(Math.sin(a) * L, -Math.cos(a) * L); x.lineTo(Math.sin(a + 0.18) * L * 0.55, -Math.cos(a + 0.18) * L * 0.55);
        }
        x.closePath(); x.fill();
      } else if (SP.leaf === 'lobed') {
        x.beginPath(); x.moveTo(0, 0);
        for (let i = 0; i <= 6; i++) {
          const t = i / 6, w = len * 0.28 * (i % 2 ? 1.0 : 0.55);
          x.lineTo(w, -len * t);
        }
        x.lineTo(0, -len * 1.02);
        for (let i = 6; i >= 0; i--) {
          const t = i / 6, w = len * 0.28 * (i % 2 ? 1.0 : 0.55);
          x.lineTo(-w, -len * t);
        }
        x.closePath(); x.fill();
      } else {                                              // lance / ovate / narrow
        const w = SP.leaf === 'narrow' ? 0.13 : SP.leaf === 'lance' ? 0.24 : 0.36;
        x.beginPath(); x.moveTo(0, 0);
        x.quadraticCurveTo(len * w, -len * 0.5, 0, -len);
        x.quadraticCurveTo(-len * w, -len * 0.5, 0, 0); x.fill();
        x.strokeStyle = 'rgba(0,0,0,0.18)'; x.lineWidth = 0.8;
        x.beginPath(); x.moveTo(0, 0); x.lineTo(0, -len * 0.95); x.stroke();
      }
      x.restore();
    };
    // the spray: a twig from the centre, leaves along it, in two tones
    const count = SP.leaf === 'frond' ? 3 : SP.leaf === 'scale' ? 26 : SP.leaf === 'needle' ? 22 : 18;
    const len = { scale: 22, needle: 20, frond: 40, palmate: 34, lobed: 34, lance: 32, ovate: 28, narrow: 30 }[SP.leaf];
    x.strokeStyle = hex(SP.bark); x.lineWidth = 2;
    for (let i = 0; i < count; i++) {
      const a = rnd(i, 1) * Math.PI * 2, r = 18 + rnd(i, 2) * 92;
      const cx = N / 2 + Math.cos(a) * r, cy = N / 2 + Math.sin(a) * r;
      if (i % 4 === 0 && SP.leaf !== 'frond') { x.beginPath(); x.moveTo(N / 2, N / 2); x.lineTo(cx, cy); x.stroke(); }
      const tone = rnd(i, 3) < 0.45 ? hex(SP.light) : hex(SP.dark);
      leaf(cx, cy, len * (0.7 + rnd(i, 4) * 0.5), a + Math.PI / 2 + (rnd(i, 5) - 0.5) * 1.2, tone);
    }
    if (SP.fruit) {
      for (let i = 0; i < (SP.big ? 3 : 5); i++) {
        const a = rnd(i, 7) * 6.3, r = 30 + rnd(i, 8) * 70;
        x.fillStyle = hex(SP.fruit);
        x.beginPath(); x.ellipse(N / 2 + Math.cos(a) * r, N / 2 + Math.sin(a) * r, SP.big ? 11 : 7, SP.big ? 15 : 7, 0, 0, 7); x.fill();
        x.fillStyle = 'rgba(255,255,255,0.35)';
        x.beginPath(); x.arc(N / 2 + Math.cos(a) * r - 2, N / 2 + Math.sin(a) * r - 3, 2.2, 0, 7); x.fill();
      }
    }
    if (SP.bloom) {
      x.fillStyle = hex(SP.bloom);
      for (let i = 0; i < 9; i++) { const a = rnd(i, 9) * 6.3, r = 26 + rnd(i, 10) * 80; x.beginPath(); x.arc(N / 2 + Math.cos(a) * r, N / 2 + Math.sin(a) * r, 2.6, 0, 7); x.fill(); }
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    this._disp.push(t);
    this._leafCards[species] = t;
    return t;
  }

  _leafCardMat(species) {
    this._leafMatCache = this._leafMatCache || {};
    if (this._leafMatCache[species]) return this._leafMatCache[species];
    const m = new THREE.MeshStandardMaterial({
      map: this._leafCardTexture(species), alphaTest: 0.5, side: THREE.DoubleSide,
      roughness: 0.85, metalness: 0,
    });
    this._disp.push(m);
    this._leafMatCache[species] = m;
    return m;
  }

  // Scatter leaf cards through an ellipsoid crown. `rx, ry, rz` are the crown
  // radii; cards near the top take the lighter of two sizes so the crown
  // catches light; a few cast shadow, the rest do not (cost).
  _canopyCards(parent, species, cx, cy, cz, rx, ry, rz, count, seed, { cone = false, weeping = false } = {}) {
    const mat = this._leafCardMat(species);
    // A spray is a spray: roughly half a metre across whatever the tree, so a
    // big crown gets MORE cards, not bigger ones. Sized to the crown it read,
    // up close, as a two-metre leaf.
    const size = Math.min(0.95, Math.max(0.45, Math.max(rx, ry, rz) * 0.42));
    const vol = Math.cbrt(rx * ry * rz);
    // Coverage, not count: a crown of radius r has ~4πr² of shell and a card
    // covers ~size²/2 of it at a random angle, so the number that closes the
    // shell is ~8πr²/size². Forty cards on a metre crown left the core showing.
    count = Math.round(Math.max(count, (8 * Math.PI * vol * vol) / (size * size)) * 1.15);
    const geo = this._cardGeo = this._cardGeo || new THREE.PlaneGeometry(1, 1);
    // A crown of cards alone had air between the leaves. A dark CORE inside the
    // shell — the shadowed interior every real crown has — makes the gaps read
    // as depth instead of sky, and the cards are half again as many.
    const SPc = HPWorldScene.SPECIES[species];
    if (SPc && !weeping) {
      // matte and dark: it is shadow, not a fruit
      this._coreMat = this._coreMat || (this.style.key === 'woodcut' ? this._leafMat : this.style.mat({ color: 0x0f1d0a, roughness: 1, metalness: 0 }));
      const core = this._m(new THREE.SphereGeometry(1, 10, 8), this._coreMat, cx, cy, cz,
        { parent, cast: false, receive: false });
      core.scale.set(rx * (cone ? 0.26 : 0.34), ry * (cone ? 0.4 : 0.34), rz * (cone ? 0.26 : 0.34));
    }
    for (let i = 0; i < count; i++) {
      const u = this._treeRand(seed, i * 5 + 1), v = this._treeRand(seed, i * 5 + 2), w = this._treeRand(seed, i * 5 + 3);
      // a point in the ellipsoid, biased toward the shell so the middle is not solid
      const th = u * Math.PI * 2, ph = Math.acos(2 * v - 1), rr = 0.55 + 0.45 * Math.cbrt(w);
      let px = Math.sin(ph) * Math.cos(th) * rr, py = Math.cos(ph) * rr, pz = Math.sin(ph) * Math.sin(th) * rr;
      if (cone) { const k = 1 - (py + 1) / 2 * 0.85; px *= k; pz *= k; }      // a fir narrows upward
      if (weeping) { py = -Math.abs(py) * 0.9 - 0.1; }                            // a willow hangs
      const m = new THREE.Mesh(geo, mat);
      m.position.set(cx + px * rx, cy + py * ry, cz + pz * rz);
      m.rotation.set(this._treeRand(seed, i * 5 + 4) * Math.PI, this._treeRand(seed, i * 5 + 5) * Math.PI, weeping ? Math.PI / 2 * 0.1 : this._treeRand(seed, i * 7 + 9) * Math.PI);
      const sc = size * (0.62 + this._treeRand(seed, i * 3 + 11) * 0.55);
      m.scale.set(sc, sc, 1);
      m.castShadow = i < 6; m.receiveShadow = false;
      parent.add(m);
    }
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
    const ALL = Object.keys(HPWorldScene.SPECIES);
    const GARDEN = ['laurel', 'myrtle', 'orange', 'cypress', 'olive'];
    species = species || GARDEN[Math.floor(this._treeRand(seed, 7) * GARDEN.length) % GARDEN.length];
    if (!HPWorldScene.SPECIES[species]) species = ALL.includes(species) ? species : 'laurel';
    const SP = HPWorldScene.SPECIES[species];
    const woodcut = this.style.key === 'woodcut';

    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = this._treeRand(seed, 11) * Math.PI * 2;
    g.rotation.z = (this._treeRand(seed, 13) - 0.5) * 0.09;   // no tree is plumb
    this.scene.add(g);

    const bark = woodcut ? this._trunkMat : this.style.mat({ color: SP.bark, roughness: 0.95 });
    if (!woodcut && !this._barkCache) this._barkCache = {};
    // Root flare, so the trunk grows out of the ground instead of sitting on it
    this._m(new THREE.CylinderGeometry(SP.trunk[1] * 1.3 * s, SP.trunk[1] * 2.4 * s, 0.18 * s, 8), bark, 0, 0.09 * s, 0, { parent: g });
    const H = SP.trunk[0] * s, R = SP.trunk[1] * s;
    if (SP.gnarled) {
      // an olive's trunk is two twisted stems
      for (const sx of [-1, 1]) {
        this._limb(g, bark, sx * R * 0.6, 0.1 * s, 0, sx * R * 1.6, H, sx * R * 0.4, R * 0.9, R * 0.5);
      }
    } else {
      this._m(new THREE.CylinderGeometry(R * 0.72, R, H, 8), bark, 0, H / 2, 0, { parent: g });
    }
    if (SP.mottled && !woodcut) {
      // a plane's bark flakes in pale patches
      const pale = this.style.mat({ color: 0xc8bca0, roughness: 0.9 });
      for (let i = 0; i < 6; i++) {
        const a = this._treeRand(seed, 90 + i) * 6.3, yy = H * (0.15 + this._treeRand(seed, 100 + i) * 0.7);
        const p = this._m(new THREE.SphereGeometry(R * 0.55, 6, 5), pale, Math.cos(a) * R * 0.75, yy, Math.sin(a) * R * 0.75, { parent: g, cast: false });
        p.scale.set(1, 1.8, 0.4); p.rotation.y = -a;
      }
    }
    // boughs from the trunk head out into the crown
    const [cx, cy, cz] = [0, H * SP.top + SP.crown[1] * s * 0.55, 0];
    if (SP.boughs) {
      for (let i = 0; i < SP.boughs; i++) {
        const a = (i / SP.boughs) * Math.PI * 2 + this._treeRand(seed, 5) * 3;
        this._limb(g, bark, 0, H * 0.72, 0,
          Math.cos(a) * SP.crown[0] * s * 0.6, cy + (this._treeRand(seed, 30 + i) - 0.3) * SP.crown[1] * s * 0.5, Math.sin(a) * SP.crown[2] * s * 0.6,
          R * 0.6, R * 0.22);
      }
    }
    if (SP.vine && !woodcut) {
      // "towgh Elmes beloued of the fruitfull vines": the vine trained up the elm
      const vine = this.style.mat({ color: 0x4a6a2a, roughness: 0.9 });
      for (let i = 0; i < 5; i++) {
        const a = i * 1.3 + this._treeRand(seed, 60 + i);
        this._m(new THREE.TorusGeometry(R * 1.15, R * 0.18, 5, 12, Math.PI * 1.3), vine, 0, H * (0.15 + i * 0.16), 0, { parent: g, cast: false, rx: Math.PI / 2, ry: a });
      }
      this._canopyCards(g, 'elm', 0, H * 0.5, 0, R * 2.2, H * 0.4, R * 2.2, 10, seed + 7);
    }
    if (woodcut) {
      // the woodcut keeps a massed silhouette: ink wants a shape, not leaves
      this._canopyMass(g, cx, cy, cz, Math.max(SP.crown[0], SP.crown[1]) * s * 0.8, 6,
        this._foliageMats(SP.dark, SP.light), seed, SP.crown[1] / SP.crown[0]);
    } else if (SP.fronds) {
      // a palm: fronds from the crown, each its own card, radiating and drooping
      const mat = this._leafCardMat(species);
      for (let i = 0; i < SP.n; i++) {
        const a = (i / SP.n) * Math.PI * 2 + this._treeRand(seed, 40 + i) * 0.4;
        const f = new THREE.Mesh(this._cardGeo = this._cardGeo || new THREE.PlaneGeometry(1, 1), mat);
        const L = SP.crown[0] * s * 1.9;
        f.position.set(Math.cos(a) * L * 0.42, H + L * 0.12 - (i % 3) * 0.1 * s, Math.sin(a) * L * 0.42);
        f.rotation.set(0.9 + (i % 3) * 0.25, -a, 0, 'YXZ');
        f.scale.set(L * 0.5, L, 1); f.castShadow = i < 4;
        g.add(f);
      }
    } else {
      this._canopyCards(g, species, cx, cy, cz, SP.crown[0] * s, SP.crown[1] * s, SP.crown[2] * s, SP.n,
        seed, { cone: !!SP.cone, weeping: !!SP.weeping });
      if (SP.cone) this._m(new THREE.ConeGeometry(SP.crown[0] * s * 0.55, SP.crown[1] * s * 1.9, 7), this._foliageMats(SP.dark, SP.light)[0], 0, cy, 0, { parent: g, cast: true, receive: false });
      if (SP.fruit && !SP.big) {
        // a few fruit as bodies, so they read at a distance where the card's do not
        const fruitMat = this.style.mat({ color: SP.fruit, roughness: 0.55 });
        for (let i = 0; i < 6; i++) {
          const a = this._treeRand(seed, 60 + i) * Math.PI * 2, rr = 0.6 + this._treeRand(seed, 70 + i) * 0.35;
          this._m(new THREE.SphereGeometry(0.05 * s, 7, 6), fruitMat,
            Math.cos(a) * rr * SP.crown[0] * s, cy + (this._treeRand(seed, 80 + i) - 0.5) * SP.crown[1] * s * 0.9, Math.sin(a) * rr * SP.crown[2] * s,
            { parent: g, cast: false, receive: false });
        }
      }
    }
    this._circleCol(x, z, Math.max(0.3, R * 2.6));
    return g;
  }

  _buildTrees() {
    const put = (x, z, s = 1, species = null) => this._tree(x, z, s, species);

    // the grove about the fountain of Venus: myrtle, her own plant, and laurel
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      if (Math.abs(a - Math.PI / 2) < 0.38) continue;
      if (Math.abs(a - Math.PI * 1.5) < 0.38) continue;   // open toward the shore too
      put(Math.cos(a) * 11.5, -20 + Math.sin(a) * 11.5, 1.1, i % 3 ? 'myrtle' : 'laurel');
    }
    // the way to the palace, "set on either sides with Cyprus Trees" (ch. VII)
    for (const z of [15.5, 24.5]) { put(-5.2, z, 1, 'cypress'); put(5.2, z, 1, 'cypress'); }
    // and the enclosure "altogither of Cytrons, Orenges and Lymonds"
    for (const s of [-1, 1]) {
      put(s * 9, 5.4, 1, 'orange'); put(s * 9, -5.4, 1, 'citron');
      put(s * 13.5, 5.8, 0.9, 'lemon'); put(s * 13.5, -5.8, 0.9, 'orange');
    }
    put(-29, 7, 1.2, 'plane');
    // Moved west from (-29, -7): the Temple of Venus now stands at (-30, -21)
    // and this tree sat squarely in its approach, filling the whole front of
    // the building from the only angle a walker arrives at.
    put(-25.5, -7, 1.2, 'plane');
    put(28, 8, 1.2, 'oak'); put(28, -8, 1.2, 'plane');
    put(-27, 15, 1.0, 'olive'); put(27, 14.5, 1.0, 'olive');

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
      rect(-46.5, -33.5, -0.5, 12.5),    // the chess pavement and its enclosure
      rect(7.9, 13.1, 14.6, 18.4),       // the colossal horse and its pedestal
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
    this._chessUpdate(dt);

    // ΓΕΛΟΙΑΣΤΟΣ: tread on the step and the boy lifts and aims at your face
    if (this._geloi) {
      const G = this._geloi, p = this.walker.player.pos;
      const on = Math.hypot(p.x - G.step[0], p.z - G.step[1]) < 0.75;
      G.up += ((on ? 1 : 0) - G.up) * Math.min(1, dt * 6);
      G.jet.rotation.x = Math.PI / 2 - 0.35 - G.up * 1.1;
      G.boy.rotation.x = -G.up * 0.25;
      if (G.up > 0.05) {
        G.stream.target.set(p.x, 1.55, p.z);
        G.stream.speed = 0.9 + G.up * 1.6;
      } else {
        G.stream.target.copy(G.base);
        G.stream.speed = 0.9;
      }
    }

    // The temple's own two moving systems (see _buildVenusTemple): the eight
    // winds turn on their spindles to face away from the blast, and the four
    // bells swing on their chains against the great triangle. The wind is one
    // slow direction with a gust on top of it, so the vanes agree with each
    // other the way real vanes do.
    if (this._windVanes.length) {
      const wind = Math.sin(this._t * 0.11) * 1.7 + Math.sin(this._t * 0.53) * 0.34;
      for (const v of this._windVanes) v.g.rotation.y = wind + v.k * 0.04;
      for (const f of this._foils) f.rotation.y = -f.userData.foil * Math.PI / 8 + Math.sin(this._t * 3.1 + f.userData.foil) * 0.5;
      for (const h of this._hovers) h.g.position.y = h.y + Math.sin(this._t * 0.7 + h.phase) * 0.18;
      const gust = Math.sin(this._t * 1.9) * 0.16 + Math.sin(this._t * 2.7) * 0.06;
      for (const b of this._windBells) {
        b.g.rotation.z = gust * Math.cos(b.k * 1.57);
        b.g.rotation.x = gust * Math.sin(b.k * 1.57);
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
    // the ripples drift; the painted beds and caustic discs still turn
    if (this._waterNrm) {
      this._waterNrm.offset.x = (this._waterNrm.offset.x + dt * 0.018) % 1;
      this._waterNrm.offset.y = (this._waterNrm.offset.y + dt * 0.011) % 1;
    }
    for (const w of this._waters) if (!w.m.material.normalMap) w.m.rotation.z += dt * w.rate;
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
