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
import { Walker } from '../systems/Walker.js?v=6';
import { makeCast } from '../systems/Cast.js?v=48';
import { DragonFlight } from '../systems/DragonFlight.js?v=2';
import { RollUp } from '../systems/RollUp.js?v=5';
import { Masonry } from '../systems/Masonry.js?v=7';
import { buildLitter } from '../systems/Litter.js?v=5';
import { isVariant } from '../systems/AssetVariants.js?v=8';
import { createStyle, addSkyDome } from '../shaders/HPStyles.js?v=4';
import { getEnvMap } from '../systems/EnvMap.js?v=1';
import { createMeadowField, attachShade } from '../systems/Meadow.js?v=5';

// pos/look are [x, z] on the ground plane; folio feeds the HUD and the research links.
// The first nine are reachable with digit keys 1–9 (journey order).
export const HP_STATIONS = [
  { key: 'wood',             name: 'The Dark Wood',          folio: 2,
    pos: [0, 45],     look: [0, 38],   radius: 9 },
  { key: 'portal',           name: 'The Great Portal',       folio: 13,
    pos: [0, 37],     look: [0, 26],   radius: 7, pitch: 0.2 },
  { key: 'court',            name: 'The Court of Queen Eleuterylida', folio: 62,
    pos: [-10.4, 23.8], look: [-23.5, 18.5], radius: 9 },
  { key: 'three_doors',      name: 'The Three Doors',        folio: 119,
    pos: [0, 21],     look: [0, 12],   radius: 6, pitch: 0.05 },
  { key: 'elephant',         name: 'The Elephant & Obelisk', folio: 25,
    pos: [0, 6.5],    look: [0, 0],    radius: 6 },
  { key: 'planetary_palace', name: 'The Planetary Palace',   folio: 88,
    pos: [-11.5, 0],  look: [-20, 0],  radius: 9 },
  { key: 'quinta_essentia',  name: 'The Obelisk of the Trinity', folio: 119,
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
  // The last station of Book I (ch. XXIV, our pp. 370-379). It has no woodcut,
  // which is why the tour's stop 25 pointed at the theatre's floor for months:
  // every coverage check ran off the plate catalogue. See ROUTER.md rule 6.
  { key: 'adonis',           name: 'The Fountain of Adonis', folio: 370,
    pos: [20.34, -122.01], look: [24.69, -116.02], radius: 8 },
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
  // Second nature (GARDENS.md 2), built 2026-09-07: the worked countryside
  // Poliphilo comes into after the vaults -- "a fayre and plentifull countrie,
  // fruitefull fieldes, and fertile groundes" (Dallington p. 90). It lies west
  // north-west of the dark wood, so that coming out of the wilderness you come
  // into worked land: first nature into second, which is Hunt's whole point.
  { key: 'fields',           name: 'The Fruitful Fields',    folio: 90,
    pos: [-40, 41],  look: [-40, 53],  radius: 12 },
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
  constructor(renderer, composer, { style = 'lit', station = null, spawn = null, rollup = false } = {}) {
    // Roll-up mode wants the world as a list of things (see _census). The walk
    // has no use for it, and it is a few thousand entries, so it is opt-in.
    this.renderer = renderer;
    this.composer = composer;
    this._wantRoll = rollup;
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
    this._shadeSpots = [];      // {x,z,r,h} per tree, for the baked shade map
    // The roll-up census: one entry per thing in the world small enough to be
    // picked up, with where it is, how big it is, what it is called, and how to
    // take it. Filled by _compileDrawCalls; see RollUp.js.
    this.rollables = [];
    // The buildings are made of stones, and the stones hold each other up.
    // See systems/Masonry.js: a column is a stack of drums, an entablature is a
    // load those stacks carry, and taking one out has consequences.
    this.masonry = new Masonry({ groundAt: (x, z) => this.walker.floorAt(x, z) });
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
    // ── The air (prospettiva aerea) ──────────────────────────────────────
    // Leonardo, in the Trattato: to make a thing look five times more distant,
    // make it five times bluer. Distance drains the colour, closes the tonal
    // range, and shifts what is left toward the blue of the air -- he is
    // describing Rayleigh scattering three centuries early, and it is the one
    // piece of Renaissance picture-making this world did not have.
    //
    // The fog was a warm sand, which says "dusty" and not "far". It is now a
    // pale azurite: azurite rather than ultramarine because ultramarine cost
    // more than its weight in gold and azurite is what a Venetian workshop in
    // 1499 actually reached for. Kept light in value so the seam against the
    // sky's warm horizon stays soft -- blue hills under a pale warm sky is
    // precisely the quattrocento landscape.
    // See src/shaders/AerialPerspective.js and RENDERING.md.
    this.AIR = 0xb0c4da;
    this.scene.fog = lit
      ? new THREE.FogExp2(this.AIR, 0.0082)
      : new THREE.FogExp2(S.fog.color, S.fog.density);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (S.useEnv) {
      this.scene.environment = getEnvMap(this.renderer);
      this.scene.environmentIntensity = 0.3;
    }
    this._lights = S.setupLights(this.scene);
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
    // What the roll-up mode calls these when it eats them. A material is the
    // cheapest place to hang a name, because everything made of a thing is
    // made of the same material. See _rollName.
    this._stoneMat.userData.roll = 'a block of white stone';
    this._darkStoneMat.userData.roll = 'a dark stone';
    this._hedgeMat.userData.roll = 'a sprig of box';
    this._trunkMat.userData.roll = 'a bough';
    this._leafMat.userData.roll = 'a bundle of leaves';

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
    this._buildRiverPlants();
    this._buildRills();
    this._buildShadedWalk();
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
    this._buildGracesFountain(0, -20);   // folio 80's own fountain; ch. XXIII's stays on Cythera
    this._buildTriumphs();
    this._buildSecondBridge();
    this._buildVenusTemple();
    this._buildPolyandrion();
    this._polyandrionMedallions();
    this._buildRuinWeeds();
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
    this._buildSecondNature();
    // The pleasures of the garden (PLEASURES.md), from what Poliphilo says when
    // he meets them: birds seen and not heard, seats of flowering turf, and the
    // fume that is the only way scent can reach a screen.
    if (lit) { this._buildBirds(); this._buildTurfSeats(); this._buildFumes(); }
    // ROLLING MODE ONLY: the small Renaissance things lying about the floors.
    // Three thousand cups, urns, combs, sherds, sickles and beehives, every one
    // of them a noun counted out of the two translations, and every one of them
    // zoned to the station it belongs to. Nothing of this is built for the walk.
    // See systems/Litter.js.
    if (this._wantRoll) {
      const n = buildLitter(this, HP_STATIONS);
      console.info('[litter]', n.pieces, 'objects of', n.kinds, 'kinds');
    }

    // last, because it has to see every tree that was planted
    if (lit) this._buildShadeMap();

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
    // The birds fly and hop, so they must not be baked into the static merge --
    // a merged bird is a bird nailed to the sky.
    for (const b of (this._birds || [])) mark(b.g);
    for (const h of this._hovers) mark(h.g);
    if (this._quinta) { mark(this._quinta.dod); if (this._quinta.rays) mark(this._quinta.rays); }
    if (this._torch) mark(this._torch);
    if (this._boat) { mark(this._boat); if (this._boat.userData.cupid) mark(this._boat.userData.cupid); }
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

    // Every stone now knows which course of which building it belongs to. This
    // must run AFTER the last _mergeInto, not inside it: _mergeInto is called
    // once per float group, once per billboard, once for the island and once for
    // the world, and resolving on each pass enrolled the same stone several
    // times over and gave phantoms to pieces that had simply not been merged yet.
    if (this._wantRoll) {
      const n = this.masonry.resolve(this.rollables);
      console.info('[masonry]', this.masonry.structures.length, 'structures,', n, 'stones');
      const g = this._resolveRollGroups();
      if (g) console.info('[litter]', g, 'objects censused whole');
    }
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
      // Transparent things keep their own draw order, so they cannot be folded
      // in. NOTE, because it cost 3 000 draw calls once: an alpha-TESTED cutout
      // -- a leaf card, a lattice panel -- is NOT transparent. It is opaque with
      // a discard, and it belongs in here. Setting `transparent: true` on one of
      // those quietly exiles it from the merge, and the foliage added on
      // 2026-09-07/08 did exactly that: 22 000 meshes that should have been a
      // few dozen.
      if (!m || Array.isArray(m) || m.transparent) return;
      const key = m.uuid + '|' + o.castShadow + '|' + o.receiveShadow;
      let b = buckets.get(key);
      if (!b) buckets.set(key, b = { mat: m, cast: o.castShadow, recv: o.receiveShadow, meshes: [] });
      b.meshes.push(o);
    });
    for (const b of buckets.values()) {
      if (b.meshes.length < 2) { for (const o of b.meshes) this._census(o, null, 0, 0); continue; }
      const geos = [];
      const mtx = new THREE.Matrix4();
      for (const o of b.meshes) {
        const g2 = o.geometry.clone();
        mtx.multiplyMatrices(inv, o.matrixWorld);
        g2.applyMatrix4(mtx);           // bakes positions AND fixes normals
        geos.push(g2);
      }
      // Where each source mesh will land in the merged buffer. mergeGeometries
      // concatenates in order, so this is just a running total -- and it is the
      // whole trick behind the roll-up census (see the header of this file).
      const ranges = [];
      let vtx = 0;
      for (const g of geos) {
        const n = g.attributes.position.count;
        ranges.push([vtx, n]);
        vtx += n;
      }
      let merged = null;
      try { merged = mergeGeometries(geos, false); } catch (e) { /* mixed attributes — leave unmerged */ }
      if (!merged) {
        // say WHICH bucket, or the console error from BufferGeometryUtils is
        // a needle with no haystack
        const sig = (g) => g.type + (g.index ? '+i' : '-i') + '[' + Object.keys(g.attributes).sort().join(',') + ']';
        const first = sig(geos[0]), odd = geos.find(g => sig(g) !== first);
        console.warn('[compile] bucket left unmerged:', b.mat.color ? '#' + b.mat.color.getHexString() : b.mat.type,
          geos.length, 'geometries; first', first, 'differs from', odd ? sig(odd) : '(none — index mismatch elsewhere)');
        geos.forEach(g => g.dispose()); continue;
      }
      const mm = new THREE.Mesh(merged, b.mat);
      mm.castShadow = b.cast;
      mm.receiveShadow = b.recv;
      root.add(mm);
      b.meshes.forEach((o, i) => this._census(o, mm, ranges[i][0], ranges[i][1]));
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
  // Returns every piece it made, so that whatever holds the roof up can be told
  // it is holding the roof up (2026-09-08; see systems/Masonry.js). A roof that
  // stays in the air when its wall is eaten out from under it is the exact
  // failure Ted's note was about.
  _roof(cx, y, cz, w, d, { pitch = 0.9, beams = true, parent = null, ridgeAlong = 'x' } = {}) {
    const S = this.style, woodcut = S.key === 'woodcut';
    const timber = woodcut ? this._darkStoneMat : this.style.mat({ color: 0x4a3420, roughness: 0.9 });
    const tile = woodcut ? this._darkStoneMat : this.style.mat({ color: 0x8a4a34, roughness: 0.85 });
    const made = [];
    const o = { parent, cast: false };
    if (beams) {
      // primary beams across the short span, purlins along the long one
      const nB = Math.max(3, Math.round((ridgeAlong === 'x' ? w : d) / 1.5));
      for (let i = 0; i < nB; i++) {
        const t = (i / (nB - 1) - 0.5);
        made.push(ridgeAlong === 'x'
          ? this._m(new THREE.BoxGeometry(0.22, 0.28, d), timber, cx + t * (w - 0.4), y + 0.14, cz, o)
          : this._m(new THREE.BoxGeometry(w, 0.28, 0.22), timber, cx, y + 0.14, cz + t * (d - 0.4), o));
      }
      const nP = 3;
      for (let i = 0; i < nP; i++) {
        const t = (i / (nP - 1) - 0.5);
        made.push(ridgeAlong === 'x'
          ? this._m(new THREE.BoxGeometry(w, 0.18, 0.18), timber, cx, y + 0.34, cz + t * (d - 0.5), o)
          : this._m(new THREE.BoxGeometry(0.18, 0.18, d), timber, cx + t * (w - 0.5), y + 0.34, cz, o));
      }
    }
    // the deck the beams carry
    made.push(this._m(new THREE.BoxGeometry(w, 0.12, d), this._stoneMat, cx, y + 0.5, cz, o));
    if (pitch <= 0) {
      made.push(this._m(new THREE.BoxGeometry(w + 0.3, 0.42, d + 0.3), this._stoneMat, cx, y + 0.72, cz, { ...o, outline: true }));
      return made;
    }
    // two sloped leaves meeting at a ridge, eaves overhanging the deck
    const along = ridgeAlong === 'x' ? w : d, across = ridgeAlong === 'x' ? d : w;
    const half = across / 2 + 0.35, leafLen = Math.hypot(half, pitch), ang = Math.atan2(pitch, half);
    for (const sgn of [-1, 1]) {
      const leaf = this._m(new THREE.BoxGeometry(ridgeAlong === 'x' ? along + 0.6 : leafLen, 0.14, ridgeAlong === 'x' ? leafLen : along + 0.6),
        tile, ridgeAlong === 'x' ? cx : cx + sgn * half / 2, y + 0.56 + pitch / 2, ridgeAlong === 'x' ? cz + sgn * half / 2 : cz, { ...o, outline: true });
      if (ridgeAlong === 'x') leaf.rotation.x = -sgn * ang; else leaf.rotation.z = sgn * ang;
      made.push(leaf);
    }
    // the ridge, and antefixes along both eaves
    made.push(ridgeAlong === 'x'
      ? this._m(new THREE.BoxGeometry(along + 0.6, 0.16, 0.24), tile, cx, y + 0.6 + pitch, cz, o)
      : this._m(new THREE.BoxGeometry(0.24, 0.16, along + 0.6), tile, cx, y + 0.6 + pitch, cz, o));
    const nA = Math.max(4, Math.round(along / 1.5));
    for (let i = 0; i < nA; i++) {
      const t = (i / (nA - 1) - 0.5) * (along - 0.4);
      for (const sgn of [-1, 1]) {
        made.push(ridgeAlong === 'x'
          ? this._m(new THREE.ConeGeometry(0.14, 0.28, 6), this._stoneMat, cx + t, y + 0.74, cz + sgn * half, o)
          : this._m(new THREE.ConeGeometry(0.14, 0.28, 6), this._stoneMat, cx + sgn * half, y + 0.74, cz + t, o));
      }
    }
    return made;
  }

  // PolyhedronGeometry is non-indexed; the draw-call merger wants a bucket
  // all indexed or all not, so any polyhedron gets a trivial index first.
  _indexed(geo) {
    if (!geo.index) geo.setIndex(Array.from({ length: geo.attributes.position.count }, (_, k) => k));
    return geo;
  }

  // A ground rectangle (w × d, centred on world cx, cz, laid flat with
  // rx = -π/2) with holes cut in it: [x, z, r] a round hole, [x, z, hw, hd] a
  // rectangular one, all in world coordinates. UVs match PlaneGeometry's so the
  // dressed texture repeats exactly as before.
  _holedGround(w, d, cx, cz, holes) {
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2, -d / 2); shape.lineTo(w / 2, -d / 2); shape.lineTo(w / 2, d / 2); shape.lineTo(-w / 2, d / 2); shape.closePath();
    for (const h of holes) {
      const lx = h[0] - cx, ly = -(h[1] - cz);           // rx = -π/2 maps local y to world -z
      const p = new THREE.Path();
      if (h.length === 3) p.absarc(lx, ly, h[2], 0, Math.PI * 2, false);
      else { p.moveTo(lx - h[2], ly - h[3]); p.lineTo(lx + h[2], ly - h[3]); p.lineTo(lx + h[2], ly + h[3]); p.lineTo(lx - h[2], ly + h[3]); p.closePath(); }
      shape.holes.push(p);
    }
    const geo = new THREE.ShapeGeometry(shape, 12);
    const uv = geo.attributes.uv, pos = geo.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / d + 0.5);
    return geo;
  }
  _holedDisc(r, cx, cz, holes) {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, r, 0, Math.PI * 2, false);
    for (const h of holes) {
      const lx = h[0] - cx, ly = -(h[1] - cz);
      const p = new THREE.Path();
      if (h.length === 3) p.absarc(lx, ly, h[2], 0, Math.PI * 2, false);
      else { p.moveTo(lx - h[2], ly - h[3]); p.lineTo(lx + h[2], ly - h[3]); p.lineTo(lx + h[2], ly + h[3]); p.lineTo(lx - h[2], ly + h[3]); p.closePath(); }
      shape.holes.push(p);
    }
    const geo = new THREE.ShapeGeometry(shape, 24);
    const uv = geo.attributes.uv, pos = geo.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / (2 * r) + 0.5, pos.getY(i) / (2 * r) + 0.5);
    return geo;
  }

  // A lapidary inscription of many lines — the epitaphs of the Polyandrion run
  // to a dozen. Letters in the plaque palette, wrapped to the width.
  _epitaph(lines, w, h, x, y, z, ry = 0, { parent = null, px = 512, size = 26, gap = 6 } = {}) {
    const Pc = this.style.plaqueColors;
    const c = document.createElement('canvas');
    c.width = px; c.height = Math.round(px * h / w);
    const g = c.getContext('2d');
    g.fillStyle = Pc.bg; g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = Pc.border; g.lineWidth = 3; g.strokeRect(4, 4, c.width - 8, c.height - 8);
    g.textAlign = 'center';
    const innerW = c.width - 28;
    // wrap each source line to the width at its own size
    const out = [];
    for (const ln of lines) {
      const sz = typeof ln === 'string' ? size : ln.size || size;
      const txt = typeof ln === 'string' ? ln : ln.text;
      const col = typeof ln === 'string' ? Pc.text : (ln.color || Pc.text);
      g.font = `${sz}px serif`;
      const words = txt.split(' ');
      let cur = '';
      for (const wd of words) {
        const t = cur ? cur + ' ' + wd : wd;
        if (g.measureText(t).width > innerW && cur) { out.push({ t: cur, sz, col }); cur = wd; } else cur = t;
      }
      out.push({ t: cur, sz, col });
    }
    const total = out.reduce((a, l) => a + l.sz + gap, 0);
    let yy = (c.height - total) / 2 + out[0].sz;
    for (const l of out) { g.font = `${l.sz}px serif`; g.fillStyle = l.col; g.fillText(l.t, c.width / 2, yy); yy += l.sz + gap; }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; this._disp.push(t);
    const mat = new THREE.MeshBasicMaterial({ map: t, transparent: true });
    return this._m(new THREE.PlaneGeometry(w, h), mat, x, y, z, { ry, cast: false, receive: false, parent });
  }

  _circleCol(x, z, r) { const c = { x, z, r }; this.walker.colliders.push(c); return c; }
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
    // 2026-09-08: the ripples were too faint and the finish too near a perfect
    // mirror, so at grazing angles -- which is how you see water from a 1.7 m
    // eye -- the sun's reflection blew out into a solid white wash across the
    // whole surface and spilled onto the bank. A real sun path on water is not
    // a sheet; it is BROKEN by the ripples into glitter. So the ripples got
    // twice the depth and the finish a little tooth. It is still a mirror.
    m.normalScale = new THREE.Vector2(1.15, 1.15);
    m.roughness = 0.12;
    m.metalness = 0.12;
    m.envMapIntensity = 1.6;
    m.transparent = true;
    m.opacity = 0.72;
    m.emissive = new THREE.Color(0x0e2a3a);
    m.emissiveIntensity = 0.35;
    m.depthWrite = false;
    return m;
  }

  // A jet of water from A to B: a solid arc you can see — a thin tube along a
  // parabola in the water material — with a stream of sparkle along it and a
  // splash where it lands. Particles alone read as glitter; a tube alone reads
  // as glass; together they read as a jet. `apex` is how high the arc rises
  // above the higher of its two ends.
  _jet(ax, ay, az, bx, by, bz, { r = 0.022, apex = 0.5, color = 0xd8eeff, sparkle = 22 } = {}) {
    const S = this.style;
    const top = Math.max(ay, by) + apex;
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(ax, ay, az), new THREE.Vector3((ax + bx) / 2, top * 2 - (ay + by) / 2, (az + bz) / 2), new THREE.Vector3(bx, by, bz));
    if (S.key !== 'woodcut') {
      this._jetMat = this._jetMat || (() => {
        const m = new THREE.MeshStandardMaterial({ color, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.62,
          emissive: 0x9ac4e8, emissiveIntensity: 0.25, depthWrite: false, envMapIntensity: 1.8 });
        this._disp.push(m); return m;
      })();
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, r, 6, false), this._jetMat);
      tube.castShadow = false; tube.receiveShadow = false; tube.renderOrder = 2;
      this.scene.add(tube);
      // the splash where it lands
      const splashMat = this._splashMat = this._splashMat || (() => {
        const m = new THREE.MeshBasicMaterial({ color: 0xf2f8ff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false });
        this._disp.push(m); return m;
      })();
      this._m(new THREE.CircleGeometry(r * 7, 12), splashMat, bx, by + 0.012, bz, { rx: -Math.PI / 2, cast: false, receive: false });
    }
    const stream = new ParticleStream({
      count: sparkle, source: new THREE.Vector3(ax, ay, az), target: new THREE.Vector3(bx, by, bz),
      color: 0xeaf4ff, size: 0.03, speed: 0.55, arc: apex,
    });
    stream.opacity = 0.55; stream.active = true; S.tuneStream(stream);
    this.scene.add(stream.points); this._streams.push(stream);
    return stream;
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

    // The sward is a plane with two holes in it, both at the Polyandrion: the
    // grated oculus of the ciborium and the stair-pit of the crypt door. The
    // crypt is genuinely underground (ch. XIX, p. 247: "a blind, sloping little
    // stair descending"), so the ground has to open for it.
    this._m(this._holedGround(130, 130, 0, -2, [[30, -27, 0.8], [35.3, -28.0, 1.15, 0.52]]), groundMat, 0, 0, -2, { rx: -Math.PI / 2, cast: false });

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
    this._buildStream();
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
      alphaTest: 0.4, side: THREE.DoubleSide,
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
    // Massive piers flanking a tall passage — and massive is a hundred stones,
    // not one box. Eight courses of twelve ashlars each, joints broken course by
    // course, and the lintel above resting on both of them: undermine either
    // pier in Roll Up and eighteen metres of architrave comes down. (2026-09-08;
    // see _ashlar and systems/Masonry.js.)
    const piers = [];
    for (const s of [-1, 1]) {
      piers.push(this._ashlar(s * 5.4, 0, Z, 7.2, 6.4, 2.2, this._stoneMat,
        { name: 'a pier of the Great Portal' }));
      this._wallCol(s * 5.4 - 3.6, s * 5.4 + 3.6, Z - 1.1, Z + 1.1);
      // pier reliefs
      this._m(new THREE.BoxGeometry(0.5, 5.2, 0.3), this._darkStoneMat, s * 2.4, 2.6, Z + 1.15);
    }
    // Lintel + frieze — carried, and by both piers at once
    const lintel = this._m(new THREE.BoxGeometry(18, 1.4, 2.4), this._stoneMat, 0, 7.1, Z);
    const load = this.masonry.carry(piers[0], [lintel]);
    this.masonry.alsoCarriedBy(load, piers[1]);
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
      this._hedge(s * 17.8, 0.55, Z, 9, 1.1, 0.7);
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
    // Dallington p. 133: "a space of sixtie foure Squadrates of three foote …
    // one was of Iasper, of the colour of Corall, and the other greene,
    // powdered with drops of blood … set togither in manner of a Chesse-boord.
    // Compassed about with a border, the breadth of one pace … About this …
    // an other marueylous kynde of Pauing of three paces broad, in knottes of
    // Iasper, Praxin, Calcedonie, Agat" — so: the eight-by-eight of coral and
    // blood-green jasper, the pace-wide border, the knot pavement outside it.
    const coral = woodcut ? S.mat({ tone: 0.06 }) : S.mat({ color: 0xc8604a, roughness: 0.5 });
    const bloodG = woodcut ? S.mat({ tone: 0.2 }) : S.mat({ color: 0x2f5a3a, roughness: 0.5 });
    const SQ = 0.78;
    for (let f = 0; f < 8; f++) for (let r = 0; r < 8; r++) {
      this._m(new THREE.BoxGeometry(SQ, 0.03, SQ), (f + r) % 2 ? coral : bloodG, CX - 1 + (f - 3.5) * SQ, 0.375, CZ + (r - 3.5) * SQ, { cast: false });
    }
    this._m(new THREE.BoxGeometry(8 * SQ + 1.4, 0.02, 8 * SQ + 1.4), gold, CX - 1, 0.362, CZ, { cast: false });
    if (!woodcut) {
      const km = new THREE.MeshStandardMaterial({ map: this._knotTexture(), roughness: 0.9 }); this._disp.push(km);
      this._m(new THREE.PlaneGeometry(14.2, 11.2), km, CX - 1, 0.355, CZ, { rx: -Math.PI / 2, cast: false });
    }
    // "Settles, of the wood of Palme Trees … couered ouer with greene Veluet
    // … fastened to the same with tatch Nayles of Golde", along the sides
    const palmWood = woodcut ? S.mat({ tone: 0.12 }) : S.mat({ color: 0xa8843a, roughness: 0.7 });
    const velvet = woodcut ? S.mat({ tone: 0.22 }) : S.mat({ color: 0x1f5a2e, roughness: 0.95 });
    for (const sz of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        const x = CX - 5.2 + i * 2.8, z = CZ + sz * 4.55;
        this._m(new THREE.BoxGeometry(2.2, 0.36, 0.55), palmWood, x, 0.54, z, { cast: false, outline: true });
        this._m(new THREE.BoxGeometry(2.1, 0.14, 0.5), velvet, x, 0.79, z, { cast: false });
        for (let k = 0; k < 6; k++) this._m(new THREE.SphereGeometry(0.02, 6, 5), gold, x - 0.95 + k * 0.38, 0.73, z + sz * 0.27, { cast: false });
        this._wallCol(x - 1.1, x + 1.1, z - 0.3, z + 0.3);
      }
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
    // p. 134: the walls "couered ouer with Plates of beaten Golde", and in
    // lozenges "rounde Iewels, bearing out and swelling beyond the plaine
    // leuell of the wall … compassed about with greene"
    for (let i = 0; i < 5; i++) {
      const z = CZ - 4.4 + i * 2.2;
      if (Math.abs(z - CZ) < 1.2) continue;
      this._m(new THREE.BoxGeometry(0.05, 1.5, 1.5), gold, WX + 0.31, py + 2.9, z, { cast: false, ry: 0 }).rotation.x = Math.PI / 4;
      this._m(new THREE.TorusGeometry(0.3, 0.05, 8, 20), woodcut ? S.mat({ tone: 0.2 }) : S.mat({ color: 0x2f6a3a, roughness: 0.6 }), WX + 0.36, py + 2.9, z, { cast: false, ry: Math.PI / 2 });
      this._m(new THREE.SphereGeometry(0.26, 14, 10), woodcut ? S.mat({ tone: 0.08 }) : S.mat({ color: [0xb3243c, 0x1e3f96, 0x0d7548, 0xdca62c][i % 4], roughness: 0.15, metalness: 0.3 }),
        WX + 0.42, py + 2.9, z, { cast: false }).scale.set(0.45, 1, 1);
    }
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

    // The banquet (ch. X, Dallington pp. 143-158), laid in the court itself:
    // "in the middest of this admirable and stupendious Court" (p. 147)
    this._buildBanquet(CX, CZ);

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

  // ── The banquet of Queen Eleuterylida (ch. X) ─────────────────────────────
  //
  // Found by the coverage ledger, 2026-09-08. Chapter X is Dallington's most
  // sustained material description — fourteen facsimile pages of a supper —
  // and the tour has called it "the banquet" since the commentary was written;
  // the world had the throne, the chess-board pavement and the settles, and no
  // banquet. Four woodcuts belong to it and were attached to no chapter: #28
  // the ornamented tripod, #30 the tripod with three naked boys on a
  // lion-footed pedestal, #31 the vessel surmounted by a coral-tree, #32 the
  // great vessel with the gold shrub, twice a nymph's height.
  //
  // THE FRAMES (pp. 143–144): "frames of Hebony, with three feete", each stypit
  // ending "in the forme of the tearing claw of a Lyon", with "the head of a
  // childe betwixt two wings" on every leg and "in maner of a Garland a bundle
  // of leaues and fruites" slung between them; over them a round table "three
  // foote by the Diameter … to be quickly taken of and on … at euery changing".
  //
  // THE SEVEN CHANGES (pp. 151–155). Each course comes on a new table of a new
  // stone, under a new cloth, with new flowers strewn, the waiters dressed to
  // match. So the seven tables here are the seven changes, each standing at
  // the course it served, the Queen's at the first:
  //   1. gold — green Hormisine — violets, tawny, blue and white — the cordial
  //   2. beryl — cloth of Talasike — flowers of cedar, orange and lemon — five
  //      saffron fritters in five oils
  //   3. topaz — murrey and carnation silk — roses white, red, damask, musk,
  //      yellow — six pieces of gilded bread and manchet
  //   4. chrysolite — yellow silk — lily of the valley and daffodil — seven
  //      morsels of partridge
  //   5. emerald — crimson silk — purple, yellow, white and tawny — eight
  //      morsels of pheasant
  //   6. sapphire — purple silk — jasmine — nine morsels of peacock
  //   7. ivory on aloes, inlaid with amber-and-musk paste — white drawn-work —
  //      violet and gilliflowers — three morsels of the date-shellfish, gilded
  //      "that euerie piece taken vp, seemed as if it had beene all Gold"
  //
  // THE PERFUMING VESSEL (pp. 147–148), "in the middest": gold, on "three
  // Harpyes feete", with "six naked shapes of flying spirites … of two cubites
  // high" in a ring holding bowls, and "in the Center point … a steale like an
  // olde fashioned Candlesticke" with a seventh; every bowl of coals with "a
  // little pot of gold" boiling rose-water, orange-flower, myrtle, laurel, elder.
  //
  // THE FOUNTAIN ON WHEELS (pp. 145–146): "an artificious fountaine continually
  // running with water, and reassuming the same agayne … of fine golde …
  // carryed vpon foure little wheeles … to wash the handes", a pear diamond
  // "of a huge and vnseene bignes" at the top; the water "of Roses, mixt with
  // the iuice of Lymon pilles, and a little Amber".
  //
  // THE REPOSITORY (p. 150): "vppon foure turning wheeles a stately repositorie
  // or cupbord, in fashion like vnto a shippe … of most fine golde, with many
  // fishes and water monsters", holding cloths, flowers, cups, towels, vessels.
  //
  // THE MUSICIANS (p. 143): "seuen vpon a side" of the jasper door, "which at
  // euery change of seruice, did alter their Musicke and Instruments" — mute
  // here, the site being silent by decision.
  //
  // THE VESSEL OF COALS (p. 155): the cloths and napkins thrown into the fire
  // "and after that beeing taken out and cooled, they were whole, vnhurt and
  // cleane … the wonderfull straungest of all the rest." Asbestos cloth; the
  // book calls it a marvel and so does this.
  //
  // THE CORAL TREE (pp. 156–157, plate #31): after the tables, five nymphs in
  // blue silk and gold bring a chalice of gold whose cover is a mountain with
  // a coral tree a cubit high, flowered with sapphire, jacinth and beryl.
  _buildBanquet(CX, CZ) {
    const S = this.style, woodcut = S.key === 'woodcut';
    const FLOOR = 0.36;
    const M = (c, e = {}, t = 0.08) => woodcut ? S.mat({ tone: t }) : S.mat({ color: c, ...e });
    const gold  = M(0xd9b25a, { roughness: 0.22, metalness: 0.95 }, 0.04);
    const ebony = M(0x1a1410, { roughness: 0.45, metalness: 0.1 }, 0.36);
    const leaf  = M(0x3d6a2c, { roughness: 0.9 }, 0.18);
    const fruit = M(0xc85a30, { roughness: 0.55 }, 0.12);
    const ivory = M(0xefe6d2, { roughness: 0.4 }, 0.0);
    gold.userData.roll = 'a piece of the Queen’s gold plate';
    ebony.userData.roll = 'a leg of ebony';

    // the seven changes, as the book gives them
    const COURSES = [
      { stone: 'gold',       top: 0xd9b25a, cloth: 0x2e6a3a, flowers: [0x8a5a2a, 0x3a4aa0, 0xf2eee2], dish: 'the cordial confection, in lozenges', met: true },
      { stone: 'beryl',      top: 0x9fd4c0, cloth: 0x2f6a7a, flowers: [0xf6f2e8, 0xf6f2e8, 0xf0e8c0], dish: 'five saffron fritters, in five oils' },
      { stone: 'topaz',      top: 0xe0b060, cloth: 0x7a2a4a, flowers: [0xf6f2e8, 0xc0303c, 0xd88090, 0xe8c860], dish: 'six pieces of gilded bread, and manchet' },
      { stone: 'chrysolite', top: 0xb8d060, cloth: 0xe0c040, flowers: [0xf6f2e8, 0xf0e070], dish: 'seven morsels of partridge, in a sharp broth' },
      { stone: 'emerald',    top: 0x2a8a4a, cloth: 0xb02030, flowers: [0x7a3a9a, 0xf0e070, 0xf6f2e8, 0x8a5a2a], dish: 'eight morsels of pheasant, in the gravy' },
      { stone: 'sapphire',   top: 0x2c4aa8, cloth: 0x5a2a7a, flowers: [0x8a5a2a, 0xf0e070, 0xf6f2e8], dish: 'nine morsels of restorative peacock' },
      { stone: 'ivory, on aloes', top: 0xefe6d2, cloth: 0xf2eee6, flowers: [0x7a4aa0, 0xd870a0, 0xc8a0c0], dish: 'three morsels of the date-shellfish, gilded' },
    ];
    // where the seven stand: the Queen's straight before her, the six about
    // the pavement, clear of the nymphs' arc, the bath and the perfuming vessel
    const SEATS = [[CX - 3.2, CZ], [CX - 0.4, CZ - 2.6], [CX + 1.7, CZ - 1.4], [CX + 2.4, CZ + 1.2],
                   [CX - 0.4, CZ + 2.7], [CX + 1.4, CZ - 3.6], [CX - 2.4, CZ + 3.4]];

    COURSES.forEach((c, i) => {
      const [x, z] = SEATS[i];
      const top = M(c.top, c.met ? { roughness: 0.22, metalness: 0.95 } : { roughness: 0.25, metalness: 0.1 }, 0.05);
      top.userData.roll = 'a round table of ' + c.stone;
      const cloth = M(c.cloth, { roughness: 0.92 }, 0.14);
      cloth.userData.roll = 'a perfumed carpet of silk';
      // the ebony frame: three stypits on lion's claws, a winged child's head on
      // each, and the garland slung between (plate #28)
      const R = 0.46, TY = FLOOR + 0.74;
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2 + 0.4;
        const lx = x + Math.cos(a) * R * 0.7, lz = z + Math.sin(a) * R * 0.7;
        this._m(new THREE.CylinderGeometry(0.03, 0.045, TY - FLOOR - 0.08, 7), ebony, lx, FLOOR + (TY - FLOOR) / 2 - 0.04, lz, { cast: false });
        const claw = this._m(new THREE.SphereGeometry(0.06, 7, 5), ebony, lx + Math.cos(a) * 0.04, FLOOR + 0.04, lz + Math.sin(a) * 0.04, { cast: false });
        claw.scale.set(1.4, 0.6, 1.1);
        this._m(new THREE.SphereGeometry(0.045, 8, 6), gold, lx, FLOOR + 0.42, lz, { cast: false });    // the child's head
        for (const sw of [-1, 1]) {                                                              // its two wings
          const w = this._m(new THREE.BoxGeometry(0.09, 0.05, 0.012), gold, lx + Math.cos(a + sw * 1.4) * 0.07, FLOOR + 0.45, lz + Math.sin(a + sw * 1.4) * 0.07, { cast: false });
          w.rotation.y = -(a + sw * 1.4);
        }
        // the garland between this leg and the next, "biggest towardes the midst"
        const a2 = ((k + 1) / 3) * Math.PI * 2 + 0.4;
        for (let t = 1; t < 6; t++) {
          const u = t / 6, sag = Math.sin(u * Math.PI) * 0.1;
          const gx = x + Math.cos(a) * R * 0.7 * (1 - u) + Math.cos(a2) * R * 0.7 * u;
          const gz = z + Math.sin(a) * R * 0.7 * (1 - u) + Math.sin(a2) * R * 0.7 * u;
          this._m(new THREE.SphereGeometry(0.025 + sag * 0.25, 6, 5), t % 2 ? leaf : fruit, gx, FLOOR + 0.36 - sag, gz, { cast: false });
        }
      }
      // the round table, three foot across, and the carpet down to the pavement
      this._m(new THREE.CylinderGeometry(R, R, 0.035, 24), top, x, TY, z, { cast: false, outline: true });
      const skirt = this._m(new THREE.CylinderGeometry(R + 0.03, R + 0.12, TY - FLOOR - 0.02, 24, 1, true), cloth, x, FLOOR + (TY - FLOOR) / 2, z, { cast: false });
      skirt.material.side = THREE.DoubleSide;
      this._m(new THREE.TorusGeometry(R + 0.11, 0.012, 5, 24), gold, x, FLOOR + 0.03, z, { rx: Math.PI / 2, cast: false });   // the gold fringe
      // the flowers strewn — a dusting over the cloth, and some fallen to the floor
      const rnd = (n, k) => { const v = Math.sin(n * 91.3 + k * 47.1 + i * 13.7) * 43758.5453; return v - Math.floor(v); };
      for (let f = 0; f < 22; f++) {
        const a = rnd(f, 1) * Math.PI * 2, r = rnd(f, 2) * R * 0.9;
        const onFloor = f > 15;
        const fm = M(c.flowers[f % c.flowers.length], { roughness: 0.7 }, 0.0);
        fm.userData.roll = 'a strewn flower';
        const rr = onFloor ? R + 0.2 + rnd(f, 3) * 0.5 : r;
        this._m(new THREE.SphereGeometry(0.016, 6, 5), fm, x + Math.cos(a) * rr, onFloor ? FLOOR + 0.02 : TY + 0.03, z + Math.sin(a) * rr, { cast: false });
      }
      // the vessels of the course's stone: a covered cup, a dish, and the dish's morsels
      const cup = this._m(new THREE.CylinderGeometry(0.05, 0.035, 0.09, 10, 1, true), top, x + 0.2, TY + 0.065, z - 0.12, { cast: false });
      cup.material.side = THREE.DoubleSide;
      this._m(new THREE.SphereGeometry(0.052, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), top, x + 0.2, TY + 0.11, z - 0.12, { cast: false });   // "with his couer"
      this._m(new THREE.CylinderGeometry(0.16, 0.13, 0.02, 18), top, x - 0.1, TY + 0.03, z + 0.08, { cast: false });
      const N = [1, 5, 6, 7, 8, 9, 3][i];
      const morsel = M(i === 6 ? 0xd9b25a : [0xf0e0b0, 0xe8b040, 0xd8b070, 0xa07040, 0x8a5a40, 0x7a5a3a, 0xd9b25a][i], { roughness: 0.6 }, 0.1);
      morsel.userData.roll = c.dish;
      for (let k = 0; k < N; k++) {
        const a = (k / N) * Math.PI * 2;
        this._m(new THREE.SphereGeometry(0.022, 6, 5), morsel, x - 0.1 + Math.cos(a) * 0.08, TY + 0.06, z + 0.08 + Math.sin(a) * 0.08, { cast: false });
      }
      this._circleCol(x, z, 0.62);
      const ord = ['FIRST', 'SECOND', 'THIRD', 'FOVRTH', 'FIFTH', 'SIXTH', 'SEVENTH'][i];
      this._plaque({ main: 'THE ' + ord + ' TABLE · ' + c.stone.toUpperCase(),
        sub: c.dish.toUpperCase() + ' · DALLINGTON PP. 151–155' },
        1.1, 0.24, x, FLOOR + 0.12, z + R + 0.34, 0, true);
    });

    // ── the three that wait on the Queen's table: carver, plate, towel ─────
    const [qx, qz] = SEATS[0];
    [['the carver', 0, 0.85], ['she that holds the plate', -1, 0.75], ['she that holds the towel', 1, 0.75]].forEach(([role, side, r], k) => {
      const a = side * 0.9;
      const n = this.cast.nymph({ name: 'attendant' + k, robe: [0xd9b25a, 0xc0a040, 0xe8d080][k], h: 0.92, pose: k === 0 ? 'offer' : 'carry', attribute: k === 1 ? null : null });
      this._npc('banquet_att' + k, n, qx + 0.9 + Math.cos(a) * r * 0.4, qz + Math.sin(a) * r * 1.4, -Math.PI / 2, { label: role, sub: 'AT THE QVEEN’S TABLE', labelY: 1.9, sway: 0.02 });
      n.position.y = FLOOR;
    });
    // …and the one among them who "did represent … the resemblance of Polia" (p. 156)
    const polia = this.cast.nymph({ name: 'like Polia', robe: 0xf2eee6, h: 0.95, pose: 'offer' });
    this._npc('banquet_polia', polia, SEATS[6][0] + 0.75, SEATS[6][1] - 0.4, Math.PI * 0.75, { label: 'One of the three', sub: 'THE RESEMBLANCE OF POLIA · P. 156', labelY: 1.95, sway: 0.02 });
    polia.position.y = FLOOR;

    // ── the perfuming vessel, "in the middest" (pp. 147–148) ────────────
    const PX = CX + 0.6, PZ = CZ + 0.4, PY = FLOOR;
    // the triangular base on three harpies' feet
    const tri = this._m(new THREE.CylinderGeometry(0.62, 0.66, 0.1, 3), gold, PX, PY + 0.19, PZ, { cast: false, outline: true });
    tri.rotation.y = Math.PI / 6;
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + Math.PI / 6;
      const f = this._m(new THREE.SphereGeometry(0.07, 7, 5), gold, PX + Math.cos(a) * 0.55, PY + 0.07, PZ + Math.sin(a) * 0.55, { cast: false });
      f.scale.set(1.5, 0.7, 1.0); f.rotation.y = -a;
    }
    // six naked flying spirits, two cubits high, in a ring, each holding a bowl
    const spiritMat = 0xd9b25a;
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      const sx = PX + Math.cos(a) * 0.38, sz = PZ + Math.sin(a) * 0.38;
      const sp = this.cast.figure({ h: 0.9, skin: spiritMat, robe: null, pose: 'reach', winged: true });
      sp.position.set(sx, PY + 0.24, sz);
      sp.rotation.y = -a + Math.PI / 2;     // shoulders turned one toward another
      this.scene.add(sp);
      this._npcs.push({ g: sp, phase: k * 0.8, baseY: sp.rotation.y, sway: 0.01 });
      const bx = PX + Math.cos(a) * 0.62, bz = PZ + Math.sin(a) * 0.62;
      const bowl = this._m(new THREE.SphereGeometry(0.11, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), gold, bx, PY + 1.0, bz, { cast: false });
      bowl.rotation.x = Math.PI;
      this._m(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 12), M(0x3a1a0a, { emissive: 0xff5010, emissiveIntensity: 1.4 }, 0.3), bx, PY + 1.01, bz, { cast: false });   // the coals
      this._m(new THREE.SphereGeometry(0.035, 8, 6), gold, bx, PY + 1.06, bz, { cast: false });   // the little pot
      this._fume(bx, PY + 1.08, bz, { rise: 1.6, drift: 0.2, count: 10, speed: 0.12 });
    }
    // the candlestick stem in the centre with the seventh bowl
    this._m(new THREE.CylinderGeometry(0.035, 0.06, 1.05, 10), gold, PX, PY + 0.75, PZ, { cast: false });
    for (const y of [0.45, 0.75, 1.0]) this._m(new THREE.TorusGeometry(0.07, 0.02, 6, 14), gold, PX, PY + y, PZ, { rx: Math.PI / 2, cast: false });
    const cb = this._m(new THREE.SphereGeometry(0.17, 14, 7, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), gold, PX, PY + 1.42, PZ, { cast: false, outline: true });
    cb.rotation.x = Math.PI;
    this._m(new THREE.CylinderGeometry(0.15, 0.15, 0.03, 14), M(0x3a1a0a, { emissive: 0xff5010, emissiveIntensity: 1.4 }, 0.3), PX, PY + 1.43, PZ, { cast: false });
    this._fume(PX, PY + 1.5, PZ, { rise: 2.2, drift: 0.3, count: 16, speed: 0.14 });
    const pl = S.pointLight ? S.pointLight(0xff7030, 1.6, 4.5) : null;
    if (pl) { pl.position.set(PX, PY + 1.3, PZ); this.scene.add(pl); this._pulses.push({ pl, base: 1.6, phase: 0.6 }); }
    this._circleCol(PX, PZ, 0.9);
    this._plaque({ main: 'THE PERFVMING VESSEL', sub: 'SIX NAKED SHAPES OF FLYING SPIRITES OF TWO CVBITES HIGH · ROSE-WATER, ORANGE FLOWERS, MYRTLE, LAVRELL, ELDER, BOYLING TOGITHER · DALLINGTON PP. 147–148' },
      2.0, 0.34, PX, FLOOR + 0.14, PZ + 1.05, 0, true);

    // ── the fountain on four wheels, for the washing of hands (pp. 145–146) ──
    const FX = CX - 1.9, FZ = CZ - 1.55, FY = FLOOR;
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const w = this._m(new THREE.TorusGeometry(0.09, 0.025, 6, 14), gold, FX + sx * 0.3, FY + 0.09, FZ + sz * 0.22, { cast: false });
      w.rotation.y = Math.PI / 2;
    }
    this._m(new THREE.BoxGeometry(0.72, 0.06, 0.5), gold, FX, FY + 0.2, FZ, { cast: false });
    const basinMat = gold;
    const bas = this._m(new THREE.SphereGeometry(0.34, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), basinMat, FX, FY + 0.58, FZ, { cast: false, outline: true });
    bas.rotation.x = Math.PI; bas.scale.set(1, 0.7, 0.8);
    for (let k = 0; k < 14; k++) {                                          // "bubbles of pearle standing vp" on the brim
      const a = (k / 14) * Math.PI * 2;
      this._m(new THREE.SphereGeometry(0.018, 6, 5), ivory, FX + Math.cos(a) * 0.35, FY + 0.6, FZ + Math.sin(a) * 0.28, { cast: false });
    }
    this._waters.push({ m: this._m(new THREE.CircleGeometry(0.3, 18), this._waterMat(), FX, FY + 0.56, FZ, { rx: -Math.PI / 2, cast: false }), rate: 0.08 });
    this._m(new THREE.CylinderGeometry(0.02, 0.03, 0.5, 8), gold, FX, FY + 0.8, FZ, { cast: false });
    const dia = this._m(this._indexed(new THREE.OctahedronGeometry(0.06, 0)), M(0xeaf4ff, { roughness: 0.05, metalness: 0.2, emissive: 0x88aacc, emissiveIntensity: 0.4 }, -0.04), FX, FY + 1.1, FZ, { cast: false });
    dia.scale.set(0.8, 1.3, 0.8);
    this._jet(FX, FY + 1.0, FZ, FX + 0.05, FY + 0.58, FZ + 0.05, { apex: 0.25, r: 0.02, sparkle: 12 });
    this._circleCol(FX, FZ, 0.5);
    this._plaque({ main: 'THE FOVNTAINE ON FOVRE LITTLE WHEELES', sub: 'CONTINVALLY RVNNING WITH WATER, AND REASSVMING THE SAME · OF ROSES, LYMON PILLES AND AMBER · DALLINGTON PP. 145–146' },
      1.5, 0.28, FX, FLOOR + 0.12, FZ - 0.62, Math.PI, true);

    // ── the repository, a ship on four wheels (p. 150), at the open east end ──
    const SX = CX + 5.2, SZ = CZ - 3.6;
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const w = this._m(new THREE.TorusGeometry(0.14, 0.035, 6, 16), gold, SX + sx * 0.7, FLOOR + 0.14, SZ + sz * 0.3, { cast: false });
      w.rotation.y = Math.PI / 2;
    }
    const ship = this._m(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), gold, SX, FLOOR + 0.95, SZ, { outline: true });
    ship.scale.set(0.9, 0.62, 0.42);
    for (let k = 0; k < 5; k++) {                                           // the fishes and water-monsters along the side
      const f = this._m(new THREE.SphereGeometry(0.06, 7, 5), ivory, SX - 0.6 + k * 0.3, FLOOR + 0.62 + (k % 2) * 0.1, SZ + 0.42, { cast: false });
      f.scale.set(1.8, 0.7, 0.5);
    }
    this._m(new THREE.BoxGeometry(1.5, 0.06, 0.7), gold, SX, FLOOR + 0.98, SZ, { cast: false });   // the lid, a deck
    for (let k = 0; k < 3; k++) this._m(new THREE.CylinderGeometry(0.05, 0.04, 0.09, 10), ivory, SX - 0.4 + k * 0.4, FLOOR + 1.06, SZ, { cast: false });  // the cups within
    this._circleCol(SX, SZ, 1.0);
    this._plaque({ main: 'THE REPOSITORIE', sub: 'IN FASHION LIKE VNTO A SHIPPE, OF MOST FINE GOLDE, WITH MANY FISHES AND WATER MONSTERS · CLOTHES, FLOWERS, CVPPES, TOWELLES AND VESSELLES · P. 150' },
      1.8, 0.3, SX, FLOOR + 0.12, SZ + 0.75, 0, true);

    // ── the vessel of coals the cloths are cleaned in (p. 155) ─────────────
    const VX = CX + 4.6, VZ = CZ + 3.9;
    const vc = this._m(new THREE.SphereGeometry(0.3, 14, 7, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), gold, VX, FLOOR + 0.46, VZ, { outline: true });
    vc.rotation.x = Math.PI;
    this._m(new THREE.CylinderGeometry(0.1, 0.16, 0.16, 10), gold, VX, FLOOR + 0.08, VZ, { cast: false });
    this._m(new THREE.CylinderGeometry(0.26, 0.26, 0.04, 14), M(0x3a1a0a, { emissive: 0xff4010, emissiveIntensity: 1.6 }, 0.3), VX, FLOOR + 0.47, VZ, { cast: false });
    this._m(new THREE.BoxGeometry(0.34, 0.03, 0.26), M(0xf2eee6, { roughness: 0.9 }, 0.0), VX + 0.04, FLOOR + 0.5, VZ, { cast: false }).rotation.y = 0.4;   // a napkin in the fire, unhurt
    this._fume(VX, FLOOR + 0.55, VZ, { rise: 1.4, drift: 0.15, count: 8, speed: 0.1 });
    this._circleCol(VX, VZ, 0.42);
    this._plaque({ main: 'THE TABLE CLOATHES, NAPKINS AND TOWELLES OF SILKE WERE THROWNE IN', sub: 'AND AFTER, BEEING TAKEN OVT AND COOLED, THEY WERE WHOLE, VNHVRT AND CLEANE · THE WONDERFVLL STRAVNGEST OF ALL THE REST · P. 155' },
      1.7, 0.36, VX, FLOOR + 0.12, VZ + 0.55, 0, true);

    // ── the coral tree on the chalice (pp. 156–157, plate #31) ─────────────
    const KX = CX - 3.9, KZ = CZ - 2.2;
    this._m(new THREE.CylinderGeometry(0.14, 0.2, 0.06, 14), gold, KX, FLOOR + 0.03, KZ, { cast: false });
    this._m(new THREE.CylinderGeometry(0.035, 0.06, 0.3, 10), gold, KX, FLOOR + 0.21, KZ, { cast: false });
    const chal = this._m(new THREE.SphereGeometry(0.16, 14, 7, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), gold, KX, FLOOR + 0.52, KZ, { cast: false, outline: true });
    chal.rotation.x = Math.PI;
    this._m(new THREE.ConeGeometry(0.15, 0.14, 12), M(0x8a7a5a, { roughness: 0.9 }, 0.12), KX, FLOOR + 0.59, KZ, { cast: false });   // "a little mountayne", the cover
    const coral = M(0xc25a4a, { roughness: 0.55 }, 0.2);
    coral.userData.roll = 'a branch of the coral tree';
    const branch = (x0, y0, z0, len, rz, rx) => {
      const b = this._m(new THREE.CylinderGeometry(0.008, 0.014, len, 5), coral, x0, y0, z0, { cast: false });
      b.rotation.set(rx, 0, rz);
      return b;
    };
    branch(KX, FLOOR + 0.86, KZ, 0.44, 0, 0);
    branch(KX + 0.07, FLOOR + 0.95, KZ, 0.26, -0.7, 0);
    branch(KX - 0.06, FLOOR + 0.9, KZ + 0.03, 0.22, 0.8, 0.2);
    branch(KX + 0.02, FLOOR + 1.03, KZ - 0.05, 0.16, 0.2, -0.9);
    branch(KX + 0.12, FLOOR + 1.05, KZ + 0.02, 0.14, -1.1, 0.3);
    // the five-leaved flowers of sapphire, jacinth and beryl, and the great pearls on the tips
    [[0.0, 1.09, 0, 0x2c4aa8], [0.12, 1.02, 0.02, 0xd8301c], [-0.1, 0.98, 0.05, 0x9fd4c0], [0.05, 1.11, -0.09, 0x2c4aa8], [0.18, 1.1, 0.03, 0xd8301c]].forEach(([dx, dy, dz, col]) => {
      this._m(new THREE.SphereGeometry(0.022, 7, 5), M(col, { roughness: 0.2 }, 0.05), KX + dx, FLOOR + dy, KZ + dz, { cast: false });
    });
    [[0.0, 1.09, 0], [0.19, 1.13, 0.04], [-0.14, 1.02, 0.07]].forEach(([dx, dy, dz]) => {
      this._m(new THREE.SphereGeometry(0.018, 7, 5), ivory, KX + dx, FLOOR + dy + 0.03, KZ + dz, { cast: false });
    });
    this._circleCol(KX, KZ, 0.3);
    const bearer = this.cast.nymph({ name: 'coral-bearer', robe: 0x2c4aa8, h: 0.92, pose: 'offer' });
    this._npc('banquet_coral', bearer, KX + 0.05, KZ - 0.55, 0, { label: 'The middlemost of five', sub: 'IN BLEWE SILKE AND GOLDE, WITH THE TREE OF CORRALL', labelY: 1.95, sway: 0.02 });
    bearer.position.y = FLOOR;
    this._plaque({ main: 'A BRAVNCH OF COORRALL, LYKE A TREE', sub: 'OF ONE CVBITE HIGH, VPON A LITTLE MOVNTAYNE, THE COVER OF AN OLD FASHIONED VESSELL OF PVRE GOLD · FLOWERS OF SAPHYRE, IACYNTH AND BERILL · PP. 156–157' },
      1.5, 0.3, KX - 0.7, FLOOR + 0.12, KZ, Math.PI / 2, true);

    // ── the fourteen musicians, seven a side of the jasper door (p. 143) ────
    const WX = CX - 7.4 + 0.95;
    for (const side of [-1, 1]) {
      for (let k = 0; k < 7; k++) {
        const z = CZ + side * (2.7 + k * 0.42);
        const mus = this.cast.nymph({ name: 'musician', robe: [0x9a6ab8, 0x6a8ab8, 0xb88a6a][k % 3], h: 0.9, pose: 'carry', attribute: k % 2 ? 'harp' : null });
        mus.position.set(WX, FLOOR, z);
        mus.rotation.y = Math.PI / 2;
        this.scene.add(mus);
        this._npcs.push({ g: mus, phase: k * 0.6 + (side > 0 ? 3 : 0), baseY: Math.PI / 2, sway: 0.015 });
      }
    }
    this._plaque({ main: 'SEVEN VPON A SIDE', sub: 'YOONG DAMOSELS MVSITIANS, WHICH AT EVERY CHANGE OF SERVICE DID ALTER THEIR MVSICKE AND INSTRVMENTS · MVTE HERE: THE SITE IS SILENT BY DECISION · P. 143' },
      1.7, 0.3, WX + 0.5, FLOOR + 1.9, CZ - 5.0, Math.PI / 2, true);
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
  // ── The second bridge (#35–#36) ─────────────────────────
  //
  // Dallington pp. 191–192 (corpus ll. 8050–8090): on the way from the third
  // garden to the three gates, "a fayre Riuer … a fine Groue of Plane Trees,
  // in the which was an excellent fayre bridge ouer the Riuer made of stone,
  // with three Arches, with pyles bearing foorth against the two fronts";
  // "in the middle bending of the same, vpon eyther sides, there was a square
  // stone of Porphyrite set, hauing in it a Catagliphic, engrauing of
  // Hieragliphies. Vpon the right hand as I went ouer, I beheld a woman,
  // casting abroade her armes, sitting onely vppon one buttocke, putting
  // foorth one of her legges as if shee woulde rise; In her right hand … a
  // payre of winges, and in the other hand … a Tortice. Right against her,
  // there was a Circle, the center wherof two little Spyrits did hold, with
  // their backs turned towards the circumference." Logistica: "The Circle,
  // Medium tenuere beati. The other, temper thy hast by staying, and thy
  // slownesse by rysing." The first bridge (ch. V) is upstream at z = 20 with
  // its own two tables; this one crosses the same water lower down.
  _buildSecondBridge() {
    const S = this.style, woodcut = S.key === 'woodcut';
    const BX = -11, BZ = 14;
    const stone = this._stoneMat, dark = this._darkStoneMat;
    const porphyr = woodcut ? S.mat({ tone: 0.24 }) : S.mat({ color: 0x7a2a2c, roughness: 0.55 });
    // three arches over the water, piers bearing forth against the two fronts
    for (const dx of [-1.3, 0, 1.3]) {
      const arch = this._m(new THREE.TorusGeometry(0.55, 0.16, 8, 16, Math.PI), stone, BX + dx, 0.12, BZ, { cast: false, outline: true });
      arch.rotation.y = 0;
    }
    for (const dx of [-1.95, -0.65, 0.65, 1.95]) {
      this._m(new THREE.BoxGeometry(0.34, 0.5, 3.2), dark, BX + dx, -0.05, BZ, { cast: false });
      for (const sz of [-1, 1]) this._m(new THREE.CylinderGeometry(0.12, 0.16, 0.5, 3), dark, BX + dx, 0.0, BZ + sz * 1.75, { cast: false, ry: sz > 0 ? Math.PI / 6 : -Math.PI / 6 });
    }
    // the deck "with a moderate bending", and two parapets
    const deck = this._m(new THREE.BoxGeometry(4.6, 0.24, 3.4), stone, BX, 0.42, BZ, { cast: false, outline: true });
    deck.scale.y = 1;
    for (const s2 of [-1, 1]) {
      this._m(new THREE.BoxGeometry(4.6, 0.6, 0.24), stone, BX, 0.82, BZ + s2 * 1.6, { outline: true });
      this._wallCol(BX - 2.3, BX + 2.3, BZ + s2 * 1.6 - 0.12, BZ + s2 * 1.6 + 0.12);
      // the square of porphyry in the middle bending of each parapet
      this._m(new THREE.BoxGeometry(1.1, 0.5, 0.06), porphyr, BX, 0.84, BZ + s2 * 1.46, { cast: false });
    }
    // right hand going over (toward the gates, -z): the woman with wings and tortoise
    const dev = (z, ry, fn) => { const g = new THREE.Group(); g.position.set(BX, 0.84, z); g.rotation.y = ry; this.scene.add(g); fn(g); };
    const carved = woodcut ? S.mat({ tone: 0.18 }) : S.mat({ color: 0xd8b8a8, roughness: 0.8 });
    dev(BZ - 1.42, Math.PI, (g) => {
      // seated on one buttock, one leg out as if to rise; wings in the right hand, tortoise in the left
      this._m(new THREE.SphereGeometry(0.06, 8, 7), carved, 0.02, 0.16, 0.0, { parent: g, cast: false });
      this._m(new THREE.CapsuleGeometry(0.05, 0.16, 3, 6), carved, 0.0, 0.02, 0.0, { parent: g, cast: false });
      this._m(new THREE.CapsuleGeometry(0.025, 0.2, 3, 6), carved, 0.12, -0.1, 0.0, { parent: g, cast: false, rz: 1.2 });    // the leg put forth
      this._m(new THREE.CapsuleGeometry(0.02, 0.18, 3, 6), carved, -0.14, 0.1, 0.0, { parent: g, cast: false, rz: -1.3 });  // arm to the wings
      this._m(new THREE.CapsuleGeometry(0.02, 0.18, 3, 6), carved, 0.16, 0.1, 0.0, { parent: g, cast: false, rz: 1.3 });    // arm to the tortoise
      for (const sx of [-1, 1]) { const w = this._m(new THREE.SphereGeometry(0.08, 8, 6, 0, Math.PI), carved, -0.3 + sx * 0.05, 0.16, 0.0, { parent: g, cast: false }); w.scale.set(1.4, 0.6, 0.15); w.rotation.z = sx * 0.6; }
      const t = this._m(new THREE.SphereGeometry(0.07, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), carved, 0.34, 0.1, 0.0, { parent: g, cast: false }); t.scale.set(1, 0.7, 1.2);
    });
    // and right against her, the circle held at its centre by two genii, backs to the rim
    dev(BZ + 1.42, 0, (g) => {
      this._m(new THREE.TorusGeometry(0.2, 0.02, 6, 24), carved, 0, 0.02, 0, { parent: g, cast: false });
      for (const sx of [-1, 1]) {
        this._m(new THREE.SphereGeometry(0.035, 7, 6), carved, sx * 0.07, 0.1, 0, { parent: g, cast: false });
        this._m(new THREE.CapsuleGeometry(0.03, 0.08, 3, 6), carved, sx * 0.07, 0.0, 0, { parent: g, cast: false });
        this._m(new THREE.CapsuleGeometry(0.012, 0.08, 3, 6), carved, sx * 0.03, 0.02, 0.01, { parent: g, cast: false, rz: sx * 1.3 });
      }
      this._m(new THREE.SphereGeometry(0.03, 7, 6), M2(this), 0, 0.02, 0.01, { parent: g, cast: false });
    });
    this._plaque({ main: 'VELOCITATEM SEDENDO, TARDITATEM TEMPERA SVRGENDO', sub: 'TEMPER THY HAST BY STAYING, AND THY SLOWNESSE BY RYSING · PLATE 35' },
      1.8, 0.3, BX, 1.3, BZ - 1.42, Math.PI, true);
    this._plaque({ main: 'MEDIVM TENVERE BEATI', sub: 'THE CIRCLE, HELD AT ITS CENTRE BY TWO GENII · PLATE 36' },
      1.8, 0.3, BX, 1.3, BZ + 1.42, 0, true);
    // the grove of plane trees the river runs through
    for (const [dx, dz] of [[-3.2, -3.2], [3.4, -3.0], [-3.6, 3.4], [3.2, 3.6], [-5.0, 0.4]]) this._tree(BX + dx, BZ + dz, 1.0, 'plane');
    function M2(self) { return self.style.mat(self.style.key === 'woodcut' ? { tone: 0.2 } : { color: 0xc03a2a, roughness: 0.6 }); }
  }

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

    // ── The bath's fabric, from Dallington pp. 112-115 (ll. 4640-4770) ─────
    // "In the corners, & in euerry corner stoode a Chorinthian Collumne of
    // diuers colours, waued with so pure & beautiful Iacintes as nature could
    // affoord, with conuenient bases and their chapters curiously made vnder
    // the beame, ouer the which was a Zophor, wherein were carued little naked
    // Boyes playing in the water, with water monsters, with wrastling and
    // childish strifes … Al which was beautiful ouer compassed about with a
    // Coronice." And between the columns: "The wal … was of most blacke stone,
    // of an extreame hardnes and shining, incloystered about and bordered
    // with a conuenient border of Diasper redde as Coral, adorned with a
    // Lyneament and worke of double Gurgules or Verticules. In the middle
    // part of which table, betwixt the Collumnes, there sate an elegant Nymph
    // naked … of the stone Gallatitis, of colour like Iuorie." The earlier
    // build had paired pilasters and a frieze of "children with green boughs"
    // that the text does not contain; this is what it does.
    const jacinth = woodcut ? S.mat({ tone: 0.16 }) : S.mat({ color: 0xc46a3a, roughness: 0.35 });
    if (!woodcut) this._dress(jacinth, this._surfaceTexture({ base: '#c46a3a', dark: '#6a2a14', light: '#f0b080', blobs: 20, speckle: 2400, veins: 14, repeat: 2 }), 0.1);
    const blackStone = woodcut ? S.mat({ tone: 0.5 }) : S.mat({ color: 0x0c0c10, roughness: 0.15, metalness: 0.2 });
    const coral = woodcut ? S.mat({ tone: 0.3 }) : S.mat({ color: 0xc03a3a, roughness: 0.45 });
    const ivoryM = woodcut ? S.mat({ tone: 0.02 }) : S.mat({ color: 0xf0e6d0, roughness: 0.5 });
    const RC = 2.35;
    for (let i = 0; i < 8; i++) {
      const a = (i + 0.5) * Math.PI / 4;
      const px = BX + Math.cos(a) * RC, pz = BZ + Math.sin(a) * RC;
      this._m(new THREE.BoxGeometry(0.4, 0.14, 0.4), this._stoneMat, px, 0.07, pz, { ry: -a });
      this._m(new THREE.CylinderGeometry(0.14, 0.16, 1.8, 14), jacinth, px, 1.04, pz, { outline: true });
      this._m(new THREE.CylinderGeometry(0.2, 0.14, 0.16, 14), jacinth, px, 2.0, pz);
      for (const sx of [-1, 1]) this._m(new THREE.SphereGeometry(0.045, 6, 5), this._stoneMat, px + Math.cos(a + Math.PI / 2) * sx * 0.16, 2.06, pz + Math.sin(a + Math.PI / 2) * sx * 0.16, { cast: false });   // the volutes
      this._m(new THREE.BoxGeometry(0.34, 0.06, 0.34), this._stoneMat, px, 2.11, pz, { ry: -a });
      this._circleCol(px, pz, 0.28);
    }
    // the black tables between the columns, bordered in coral jasper, each
    // with its ivory nymph; the way in (+z) and the cold fountain (-z) stay open
    const SIDE = 2 * RC * Math.sin(Math.PI / 8);
    for (let i = 0; i < 8; i++) {
      if (i === 2 || i === 6) continue;
      const a = i * Math.PI / 4, r = RC * Math.cos(Math.PI / 8) + 0.02;
      const cx = BX + Math.cos(a) * r, cz = BZ + Math.sin(a) * r, ry = -a + Math.PI / 2;
      const w = SIDE - 0.34;
      this._m(new THREE.BoxGeometry(w, 1.15, 0.1), blackStone, cx, 1.45, cz, { ry, cast: false });
      for (const [dx, dy, bw, bh] of [[0, 0.55, w, 0.06], [0, -0.55, w, 0.06], [-w / 2 + 0.03, 0, 0.06, 1.15], [w / 2 - 0.03, 0, 0.06, 1.15]]) {
        this._m(new THREE.BoxGeometry(bw, bh, 0.13), coral, cx + Math.cos(ry) * dx, 1.45 + dy, cz - Math.sin(ry) * dx, { ry, cast: false });
      }
      // the double guilloche on the border — beads along the top and bottom rails
      for (let k = -4; k <= 4; k++) this._m(new THREE.SphereGeometry(0.03, 5, 4), coral, cx + Math.cos(ry) * k * 0.15, 1.45 + 0.55, cz - Math.sin(ry) * k * 0.15 + Math.cos(a) * 0.04, { cast: false });
      const nymph = this.cast.figure({ name: 'galactite' + i, h: 0.5, robe: null, skin: 0xf0e6d0, pose: 'stand' });
      nymph.position.set(BX + Math.cos(a) * (r + 0.12), 0.9, BZ + Math.sin(a) * (r + 0.12)); nymph.rotation.y = Math.PI / 2 - a;
      this.scene.add(nymph);
      this._m(new THREE.BoxGeometry(0.36, 0.05, 0.16), ivoryM, BX + Math.cos(a) * (r + 0.12), 0.88, BZ + Math.sin(a) * (r + 0.12), { ry, cast: false });
    }
    // the zophor: the boys, the water, the monsters, the wrestling; then the cornice
    const friezeM = woodcut ? S.mat({ tone: 0.06 }) : new THREE.MeshStandardMaterial({ map: this._bathFriezeTexture(), roughness: 0.8 });
    this._m(new THREE.CylinderGeometry(2.42, 2.42, 0.3, 8, 1, true), friezeM, BX, 2.25, BZ, { cast: false });
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
      // "a Tore moderator, increasing bigger and bigger of Oke leaues, one
      // folding and lying ouer an other of greene Diasper hanging vppon their
      // braunshing stalkes gilt, which ascending vp met togither" — the gilt
      // stalk is the rib; the leaves climb it, growing as they go
      for (let k = 0; k < 7; k++) {
        const t = 0.08 + k * 0.13, r = 2.25 * (1 - t), y = 2.55 + 1.85 * t, sz = 0.1 + t * 0.17;
        const lf = this._m(new THREE.PlaneGeometry(sz, sz * 1.2), this._leafCardMat('oak'), BX + Math.cos(a) * (r + 0.03), y + 0.03, BZ + Math.sin(a) * (r + 0.03), { cast: false, receive: false });
        lf.rotation.y = Math.PI / 2 - a; lf.rotation.x = -0.5 + (k % 2) * 0.3; lf.rotation.z = (k % 3 - 1) * 0.4;
      }
    }
    // The censer (p. 113): "a Lyons head, with his haire standing vp round
    // about his face, and holding a Ring in his iawes, vnto the whiche were
    // fastened certaine chaines Orichalke … that held a large goodly vessel …
    // hangyng two Cubites aboue the water, the bowle of the vessel which was
    // of Christal onely except, the rest as the ribbes thereof and lippings,
    // was of Asure blew, with bubbles of gold" — filled from the cleft in the
    // earth with burning matter and sweet woods, "the lipping and ribbing
    // perforated", so that "they rendered a pleasant and diuers coulered
    // light, by the which through the smal holes the bathes were lightened".
    const azure = woodcut ? S.mat({ tone: 0.28 }) : S.mat({ color: 0x2448b0, roughness: 0.3, metalness: 0.3 });
    const lion = this._m(new THREE.SphereGeometry(0.15, 10, 8), gold, BX, 4.22, BZ, { cast: false });
    lion.scale.set(1, 0.9, 0.9);
    for (let k = 0; k < 12; k++) { const b = k * Math.PI / 6; this._m(new THREE.ConeGeometry(0.04, 0.12, 5), gold, BX + Math.cos(b) * 0.17, 4.22 + Math.sin(b) * 0.17, BZ, { cast: false, rz: b - Math.PI / 2 }); }   // the mane standing up round his face
    this._m(new THREE.TorusGeometry(0.06, 0.012, 6, 12), gold, BX, 4.06, BZ, { cast: false });                       // the ring in his jaws
    const VY = 0.62 + 0.9;                                                                                             // two cubits above the water
    for (let k = 0; k < 3; k++) {
      const b = k * Math.PI * 2 / 3, chain = this._m(new THREE.CylinderGeometry(0.01, 0.01, 4.02 - VY - 0.34, 5), gold, BX + Math.cos(b) * 0.14, (4.02 + VY + 0.34) / 2, BZ + Math.sin(b) * 0.14, { cast: false });
      chain.rotation.z = -Math.cos(b) * 0.05; chain.rotation.x = Math.sin(b) * 0.05;
    }
    const vessel = new THREE.Group(); vessel.position.set(BX, VY, BZ); this.scene.add(vessel);
    const crystal = woodcut ? S.mat({ tone: -0.05, rim: 0.4 }) : S.mat({ color: 0xe8f4ff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.4 });
    this._m(new THREE.SphereGeometry(0.3, 16, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), crystal, 0, 0.1, 0, { parent: vessel, cast: false });   // the bowl
    for (let k = 0; k < 6; k++) { const b = k * Math.PI / 3; const rb = this._m(new THREE.TorusGeometry(0.31, 0.018, 6, 12, Math.PI / 2), azure, 0, 0.1, 0, { parent: vessel, cast: false }); rb.rotation.y = b; rb.rotation.z = -Math.PI / 2; }   // the azure ribs
    this._m(new THREE.TorusGeometry(0.31, 0.03, 8, 20), azure, 0, 0.1, 0, { parent: vessel, cast: false, rx: Math.PI / 2 });                                   // the great lip
    for (let k = 0; k < 14; k++) { const b = k * 0.9, rr = 0.31; this._m(new THREE.SphereGeometry(0.018, 5, 4), gold, Math.cos(b) * rr, 0.1 - (k % 4) * 0.06, Math.sin(b) * rr, { parent: vessel, cast: false }); }   // bubbles of gold
    this._m(new THREE.SphereGeometry(0.31, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), azure, 0, 0.1, 0, { parent: vessel, cast: false }).scale.y = 0.55;         // the cover, put down
    this._m(new THREE.SphereGeometry(0.05, 7, 5), gold, 0, 0.3, 0, { parent: vessel, cast: false });
    for (let k = 0; k < 10; k++) { const b = k * Math.PI / 5; this._m(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 4), woodcut ? S.mat({ tone: 0.0 }) : S.mat({ color: 0xffe0a0, emissive: 0xffb050, emissiveIntensity: 1.5 }), Math.cos(b) * 0.28, 0.22, Math.sin(b) * 0.28, { parent: vessel, cast: false, rz: Math.PI / 2, ry: -b }); }   // the perforations, lit
    if (!woodcut) this._m(new THREE.SphereGeometry(0.12, 8, 6), S.mat({ color: 0xff8030, emissive: 0xff5010, emissiveIntensity: 1.4 }), 0, 0.02, 0, { parent: vessel, cast: false });
    const cl = S.pointLight(0xffb060, 1.8, 7);
    if (cl) { cl.position.set(BX, VY, BZ); this.scene.add(cl); this._pulses.push({ pl: cl, base: 1.8, phase: 2.2 }); }

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

    // ΑΣΑΜΙΝΘΟΣ "vpon the phrise" over the way in (p. 112)
    this._plaque({ main: 'ΑΣΑΜΙΝΘΟΣ', sub: 'THE BATH · EIGHT-SIDED, ROOFED WITH CRYSTAL' },
      1.3, 0.28, BX, 2.25, BZ + 2.44 * Math.cos(Math.PI / 8) + 0.02, 0, true);

    // "The paued ground vnder the water being of a diuers emblemature of hard
    // stone … diuers fishes in the sides of the seates, and in the bottom by a
    // museacall cutting expressed … As barbles, lampreys, and many others"
    if (!woodcut) this._m(new THREE.CircleGeometry(1.9, 8), new THREE.MeshStandardMaterial({ map: this._fishMosaicTexture(), roughness: 0.6 }), BX, 0.22, BZ, { rx: -Math.PI / 2, cast: false });
    // Over the door "a Dolphin swimming in the calme waues, and carrying vpon
    // his back a young man, playing vpon an harpe" — Arion — "And on the
    // contrarie side vpon the colde Fountaine, there was an other dolphin
    // swimming, and Posidonius riding vpon him with a sharpe elle speare in
    // his hand … set out in a most blacke ground" (pp. 114-115). The second is
    // on the back of the cold fountain's niche, which is the face you can see.
    this._m(new THREE.PlaneGeometry(1.5, 0.7), new THREE.MeshBasicMaterial({ map: this._dolphinRelief('arion') }), BX, 1.6, BZ + 2.2, { cast: false, receive: false });
    this._m(new THREE.PlaneGeometry(1.4, 0.65), new THREE.MeshBasicMaterial({ map: this._dolphinRelief('poseidon') }), BX, 1.55, BZ - 2.72, { ry: Math.PI, cast: false, receive: false });
    // "Not farre of, there was a cleft in the earth, the which continually did
    // cast foorth burning matter" — the censer is filled from it
    {
      const KX = BX, KZ = BZ + 5.8;    // beyond the court's back wall, north of the bath — east was in Geusia's river, west under the settles
      const rockM = woodcut ? S.mat({ tone: 0.2 }) : S.mat({ color: 0x3a3028, roughness: 0.98 });
      const cleft = this._m(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 12), woodcut ? S.mat({ tone: 0.5 }) : S.mat({ color: 0x100806, roughness: 1 }), KX, 0.03, KZ, { cast: false });
      cleft.scale.x = 1.9;
      for (let k = 0; k < 7; k++) {
        const b = k * 0.9, rr = 0.95 * (0.5 + (k % 3) * 0.2);
        this._m(this._indexed(new THREE.DodecahedronGeometry(0.16 + (k % 2) * 0.08, 0)), rockM, KX + Math.cos(b) * rr * 1.6, 0.1, KZ + Math.sin(b) * rr * 0.6, { cast: false }).rotation.set(k, k * 2, 0);
      }
      if (!woodcut) for (let k = 0; k < 6; k++) this._m(new THREE.SphereGeometry(0.05 + (k % 3) * 0.02, 6, 5), S.mat({ color: 0xff6a20, emissive: 0xff4010, emissiveIntensity: 1.6 }), KX - 0.6 + k * 0.24, 0.07, KZ + (k % 2) * 0.16 - 0.08, { cast: false });
      const kl = S.pointLight(0xff6a20, 1.2, 4);
      if (kl) { kl.position.set(KX, 0.5, KZ); this.scene.add(kl); this._pulses.push({ pl: kl, base: 1.2, phase: 0.4 }); }
      this._circleCol(KX, KZ, 1.0);
      this._plaque({ main: 'A CLEFT IN THE EARTH', sub: 'WHICH CONTINVALLY DID CAST FOORTH BVRNING MATTER · IT FILLS THE CENSER · P. 113' }, 1.6, 0.3, KX, 0.55, KZ + 1.05, 0, true);
    }
    this._plaque({ main: 'THE BATH, AS THE BOOK BVILDS IT', sub: 'IACINTH COLVMNS · BLACK TABLES IN CORAL · IVORY NYMPHS · THE ZOPHOR OF BOYS AND SEA-MONSTERS · OAK-LEAF RIBS · PP. 112–115' }, 2.2, 0.32, BX, 0.62, BZ + 2.85, 0, true);

    this._circleCol(BX, BZ, 2.6);
  }

  // The bath's zophor: "little naked Boyes playing in the water, with water
  // monsters, with wrastling and childish strifes, with cunning flights and
  // agilities fit for their yeares, in liuely motions and sportes" (p. 112).
  // Ivory figures in low relief on the stone, repeated round the octagon.
  _bathFriezeTexture() {
    const W = 1024, H = 128, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');
    x.fillStyle = '#c4b490'; x.fillRect(0, 0, W, H);
    x.strokeStyle = '#8a7a58'; x.lineWidth = 2;
    for (let j = 0; j < 4; j++) { x.beginPath(); for (let i = 0; i <= W; i += 16) { const y = 96 + j * 8 + Math.sin(i / 22 + j) * 4; i ? x.lineTo(i, y) : x.moveTo(i, y); } x.stroke(); }   // the water
    const boy = (px, py, lean = 0, armUp = false, flip = 1) => {
      x.save(); x.translate(px, py); x.rotate(lean); x.scale(flip, 1);
      x.fillStyle = '#f0e6cc'; x.strokeStyle = '#6a5a3a'; x.lineWidth = 1.5;
      x.beginPath(); x.ellipse(0, 0, 9, 16, 0, 0, 6.3); x.fill(); x.stroke();                     // the body
      x.beginPath(); x.arc(0, -24, 9, 0, 6.3); x.fill(); x.stroke();                               // the head
      x.lineWidth = 5; x.strokeStyle = '#f0e6cc';
      x.beginPath(); x.moveTo(-6, -8); x.lineTo(armUp ? -16 : -18, armUp ? -28 : 2); x.stroke();    // arms
      x.beginPath(); x.moveTo(6, -8); x.lineTo(18, armUp ? -22 : -2); x.stroke();
      x.beginPath(); x.moveTo(-4, 14); x.lineTo(-10, 32); x.moveTo(4, 14); x.lineTo(12, 30); x.stroke();   // legs
      x.restore();
    };
    const monster = (px, py, flip = 1) => {
      x.save(); x.translate(px, py); x.scale(flip, 1);
      x.fillStyle = '#e4d8b8'; x.strokeStyle = '#6a5a3a'; x.lineWidth = 1.5;
      x.beginPath(); x.moveTo(-70, 10); x.quadraticCurveTo(-40, -20, 0, 5); x.quadraticCurveTo(30, 25, 60, 0); x.quadraticCurveTo(75, -10, 80, -22);   // the serpent body
      x.lineTo(70, 0); x.quadraticCurveTo(30, 35, 0, 18); x.quadraticCurveTo(-40, -5, -70, 24); x.closePath(); x.fill(); x.stroke();
      x.beginPath(); x.ellipse(-76, 14, 12, 8, 0, 0, 6.3); x.fill(); x.stroke();                                                                     // the head
      x.beginPath(); x.moveTo(-84, 8); x.lineTo(-94, 2); x.lineTo(-86, 14); x.fill();                                                                // the jaw
      for (const fx of [-30, 20]) { x.beginPath(); x.moveTo(fx, 0); x.lineTo(fx + 6, -22); x.lineTo(fx + 14, -2); x.closePath(); x.fill(); x.stroke(); }   // the fins
      x.beginPath(); x.moveTo(80, -22); x.lineTo(96, -34); x.lineTo(90, -14); x.closePath(); x.fill(); x.stroke();                                    // the tail
      x.restore();
    };
    // two boys wrestling; a boy astride a sea-monster; a boy swimming; another
    // holding a struggling fish — then the strip repeats round the octagon
    boy(70, 64, 0.35, false, 1); boy(104, 62, -0.35, false, -1);
    monster(260, 72, 1); boy(262, 44, 0, true, 1);
    boy(400, 84, 1.2, false, 1);
    monster(560, 70, -1); boy(600, 40, -0.2, true, -1); boy(520, 62, 0.15, false, 1);
    boy(760, 62, -0.5, false, 1); boy(800, 66, 0.5, false, -1);
    boy(930, 60, 0, true, 1);
    x.fillStyle = 'rgba(80,60,30,0.18)'; x.fillRect(0, 0, W, 6); x.fillRect(0, H - 6, W, 6);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    t.wrapS = THREE.RepeatWrapping; t.repeat.set(4, 1); this._disp.push(t);
    return t;
  }

  // The bath's floor under the water: a chequer of hard stones with fishes
  // "by a museacall cutting expressed … barbles, lampreys, and many others" (p. 114).
  _fishMosaicTexture() {
    const N = 512, c = document.createElement('canvas'); c.width = c.height = N;
    const x = c.getContext('2d');
    const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
    const pal = ['#7a6a4a', '#5a7a6a', '#8a5a4a', '#6a6a8a', '#9a8a5a'];
    for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) { x.fillStyle = pal[(i + j * 3) % pal.length]; x.fillRect(i * 32, j * 32, 32, 32); }
    for (let k = 0; k < 14; k++) {
      const px = 40 + rnd(k, 1) * (N - 80), py = 40 + rnd(k, 2) * (N - 80), L = 40 + rnd(k, 3) * 50, lamprey = k % 4 === 0;
      x.save(); x.translate(px, py); x.rotate(rnd(k, 4) * 6.3);
      x.fillStyle = lamprey ? '#3a3a2a' : ['#d8d0b8', '#c8a870', '#a8b8c8'][k % 3]; x.strokeStyle = '#2a2418'; x.lineWidth = 2;
      x.beginPath();
      if (lamprey) { x.moveTo(-L, 0); x.quadraticCurveTo(-L / 2, -14, 0, 0); x.quadraticCurveTo(L / 2, 14, L, 0); x.quadraticCurveTo(L / 2, 6, 0, 8); x.quadraticCurveTo(-L / 2, -6, -L, 0); }
      else { x.ellipse(0, 0, L / 2, L / 5, 0, 0, 6.3); }
      x.fill(); x.stroke();
      if (!lamprey) { x.beginPath(); x.moveTo(L / 2, 0); x.lineTo(L / 2 + 14, -10); x.lineTo(L / 2 + 14, 10); x.closePath(); x.fill(); x.stroke(); x.fillStyle = '#2a2418'; x.beginPath(); x.arc(-L / 3, -2, 2.5, 0, 6.3); x.fill(); }
      x.restore();
    }
    x.strokeStyle = 'rgba(20,15,10,0.35)'; x.lineWidth = 1;
    for (let i = 0; i <= N; i += 8) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, N); x.moveTo(0, i); x.lineTo(N, i); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; this._disp.push(t);
    return t;
  }

  // Two histories "perfected within the compasse of one selfe same stone, and
  // set out in a most blacke ground" (p. 115): Arion on his dolphin with the
  // harp, and Poseidon on his with the eel-spear.
  _dolphinRelief(kind) {
    const W = 512, H = 240, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');
    x.fillStyle = '#0a0a0e'; x.fillRect(0, 0, W, H);
    x.strokeStyle = '#c03a3a'; x.lineWidth = 6; x.strokeRect(8, 8, W - 16, H - 16);
    x.strokeStyle = '#8a8a90'; x.lineWidth = 2;
    for (let j = 0; j < 3; j++) { x.beginPath(); for (let i = 20; i <= W - 20; i += 12) { const y = 170 + j * 18 + Math.sin(i / 26 + j) * 5; i > 20 ? x.lineTo(i, y) : x.moveTo(i, y); } x.stroke(); }   // the calm waves
    x.fillStyle = '#ece4d0'; x.strokeStyle = '#6a6258'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(120, 150); x.quadraticCurveTo(200, 70, 300, 120); x.quadraticCurveTo(360, 150, 400, 110); x.lineTo(420, 90); x.lineTo(430, 130); x.lineTo(405, 135);
    x.quadraticCurveTo(340, 190, 250, 170); x.quadraticCurveTo(170, 160, 120, 150); x.closePath(); x.fill(); x.stroke();       // the dolphin
    x.beginPath(); x.moveTo(120, 150); x.lineTo(80, 140); x.lineTo(110, 162); x.closePath(); x.fill(); x.stroke();            // the beak
    x.beginPath(); x.moveTo(250, 112); x.lineTo(270, 80); x.lineTo(290, 118); x.closePath(); x.fill(); x.stroke();            // the fin
    x.fillStyle = '#2a2418'; x.beginPath(); x.arc(150, 138, 4, 0, 6.3); x.fill();
    // the rider
    x.fillStyle = '#ece4d0';
    x.beginPath(); x.ellipse(250, 78, 16, 30, 0, 0, 6.3); x.fill(); x.stroke();
    x.beginPath(); x.arc(250, 36, 14, 0, 6.3); x.fill(); x.stroke();
    x.lineWidth = 8; x.strokeStyle = '#ece4d0';
    x.beginPath(); x.moveTo(240, 100); x.lineTo(222, 130); x.moveTo(260, 100); x.lineTo(282, 128); x.stroke();                 // the legs astride
    if (kind === 'arion') {
      x.beginPath(); x.moveTo(238, 62); x.lineTo(205, 70); x.moveTo(262, 62); x.lineTo(295, 60); x.stroke();                  // arms to the harp
      x.lineWidth = 3; x.strokeStyle = '#d8c070';
      x.beginPath(); x.moveTo(300, 40); x.quadraticCurveTo(330, 30, 335, 70); x.lineTo(305, 80); x.closePath(); x.stroke();   // the harp frame
      for (let k = 0; k < 6; k++) { x.beginPath(); x.moveTo(304 + k * 5, 42 + k * 2); x.lineTo(306 + k * 5, 78); x.stroke(); }
    } else {
      x.beginPath(); x.moveTo(238, 62); x.lineTo(210, 90); x.moveTo(262, 62); x.lineTo(300, 30); x.stroke();                  // the spear arm raised
      x.lineWidth = 4; x.strokeStyle = '#d8c070';
      x.beginPath(); x.moveTo(280, 60); x.lineTo(340, 4); x.stroke();                                                        // the sharp eel-spear
      x.beginPath(); x.moveTo(330, 14); x.lineTo(345, 0); x.moveTo(334, 20); x.lineTo(350, 8); x.stroke();
      x.fillStyle = '#ece4d0'; x.beginPath(); x.moveTo(262, 30); x.quadraticCurveTo(250, 12, 236, 30); x.lineTo(236, 40); x.lineTo(264, 40); x.closePath(); x.fill();   // the beard
    }
    x.fillStyle = '#c8b890'; x.font = '18px serif'; x.textAlign = 'center';
    x.fillText(kind === 'arion' ? 'THE YOVNG MAN ON THE DOLPHIN, PLAYING VPON AN HARPE · OVER THE DOOR' : 'POSIDONIVS RIDING THE DOLPHIN, WITH A SHARPE ELLE SPEARE · OVER THE COLD FOVNTAIN', W / 2, H - 22);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; this._disp.push(t);
    return t;
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
    this._jet(X - 0.1, 0.5, Z + 0.62, X - 0.1, 0.06, Z + 1.2, { apex: 0.05, r: 0.03, sparkle: 16 });

    // the inscription the Renaissance copies carried with her
    this._plaque({ main: 'ΠΑΝΤΩΝ ΤΟΚΑΔΙ', sub: 'TO THE MOTHER OF ALL THINGS' },
      1.5, 0.34, X, 0.42, Z + 1.02, rot, true);

    this._circleCol(X, Z, 2.2);
    return g;
  }

  _buildPoliaGarden() {
    const CX = 19, CZ = 20;
    this._m(new THREE.BoxGeometry(11, 0.22, 10), this._darkStoneMat, CX, 0.11, CZ, { cast: false });

    // The arbour of sweet jessamine, a tunnel he walks in under. Rebuilt
    // 2026-09-07 from Dallington p. 200; see _buildJasmineArbour.
    this._buildJasmineArbour(CX, CZ);

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
      this._hedge(CX, 0.4, CZ + sz * 4.6, 8, 0.8, 0.5);
      this._wallCol(CX - 4, CX + 4, CZ + sz * 4.6 - 0.25, CZ + sz * 4.6 + 0.25);
    }
  }

  // ── The jasmine arbour where he first sees Polia (Dallington p. 200) ─────
  //
  // Rebuilt 2026-09-07. What stood here was four columns under a flat slab —
  // a bus shelter. The book gives something quite different, and gives it in
  // the one form Colonna almost never repeats: GARDENS.md §4 notes that the
  // Venice text illustrates this arbour TWICE, which it does for hardly
  // anything else.
  //
  //   "I behelde before mee, a fine Arbour of sweete Gessamine, somewhat high,
  //    lifting vppe and bending ouer, all to bee painted and decked with the
  //    pleasant and odoriferous flowers of three sortes commixt, and entring
  //    in vnder the same."                              — Dallington p. 200
  //
  // Three things follow from that sentence and all three are built here.
  // *Lifting up and bending over*: it is a barrel, not a lid — carpenter's
  // ribs sprung from post to post. *Entering in under the same*: it is a
  // tunnel he walks through, so it is open at both ends and the colliders run
  // along its sides only. *Painted*: the frame is painted joinery, not bare
  // timber — Segre notes the same construction surviving at Villa Medici in
  // Fiesole and at Trebbio. The "three sortes commixt" are the three jasmines
  // Rhizopoulou 2016 finds in the text — "jasmines with red, yellow and white
  // flowers" (Table 1: g2′/i3/s7′/y1 jasmine, p5/g3 white, g3′ red, g3′
  // yellow) — and she records that flowering jasmine is the book's symbol of
  // divine love and happiness, which is what the arbour is for.
  _buildJasmineArbour(CX, CZ) {
    const S = this.style, woodcut = S.key === 'woodcut';
    const LEN = 11.0;          // runs north-south, entered from the walk
    const HALF = 1.65;         // half the span: a tunnel two can pass in
    const SPRING = 1.55;       // where the ribs leave the posts and bend over
    const BAYS = 8;

    // Painted carpenter's work: a soft lead-white green, the colour joinery
    // was painted in these gardens, not the brown of a raw pole.
    const paint = woodcut ? this._darkStoneMat
      : S.mat({ color: 0xbfc4a8, roughness: 0.72, metalness: 0.0 });

    const g = new THREE.Group();
    g.position.set(CX, 0, CZ);
    this.scene.add(g);

    const ribGeo = new THREE.TorusGeometry(HALF, 0.055, 6, 20, Math.PI);
    const postGeo = new THREE.CylinderGeometry(0.075, 0.09, SPRING, 8);

    for (let b = 0; b <= BAYS; b++) {
      const t = b / BAYS, z = -LEN / 2 + t * LEN;
      for (const sx of [-1, 1]) {
        this._m(postGeo, paint, sx * HALF, SPRING / 2, z, { parent: g });
      }
      // the bend: a half-torus sprung between the two posts
      const rib = this._m(ribGeo, paint, 0, SPRING, z, { parent: g });
      rib.rotation.y = Math.PI / 2;
    }
    // longitudinal stringers, three a side plus the crown, so the barrel reads
    // as basketwork rather than as a row of separate hoops
    for (const [ax, ay] of [[-HALF, 0.02], [-HALF * 0.71, HALF * 0.71], [0, HALF],
                            [HALF * 0.71, HALF * 0.71], [HALF, 0.02]]) {
      const s = this._m(new THREE.CylinderGeometry(0.035, 0.035, LEN, 6), paint,
        ax, SPRING + ay, 0, { parent: g });
      s.rotation.x = Math.PI / 2;
    }
    // and the two rails that keep the sides from being open air
    for (const sx of [-1, 1]) for (const y of [0.55, 1.05]) {
      const r = this._m(new THREE.CylinderGeometry(0.03, 0.03, LEN, 6), paint,
        sx * HALF, y, 0, { parent: g });
      r.rotation.x = Math.PI / 2;
    }

    // ── the growth ────────────────────────────────────────────────────────
    // Jasmine is a twiner: it goes up the posts and along the ribs, and it is
    // thickest at the crown. Leaves are cards (the same trick the trees use,
    // for the same reason: a sphere of green reads as a blob), flowers are
    // small and MANY, in the three colours.
    const leafMat = woodcut ? S.mat({ tone: 0.06, side: THREE.DoubleSide })
      : new THREE.MeshStandardMaterial({
          map: this._leafCardTexture('myrtle'),
          alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.88 });
    const leafGeo = new THREE.PlaneGeometry(0.62, 0.62);
    // "flowers of three sortes commixt" — Rhizopoulou: red, yellow and white
    const JASMINE = woodcut
      ? [S.mat({ tone: -0.04 }), S.mat({ tone: -0.02 }), S.mat({ tone: 0.0 })]
      : [S.mat({ color: 0xf6f0e2, roughness: 0.62 }),    // white
         S.mat({ color: 0xe8c451, roughness: 0.62 }),    // yellow
         S.mat({ color: 0xc4485a, roughness: 0.62 })];   // red
    ['a white jasmine flower', 'a yellow jasmine flower', 'a red jasmine flower']
      .forEach((n, i) => { JASMINE[i].userData.roll = n; });
    leafMat.userData.roll = 'a jasmine leaf';
    const flowerGeo = new THREE.SphereGeometry(0.032, 5, 4);

    const rnd = (i, k) => {
      const v = Math.sin(i * 91.7 + k * 47.3 + CX * 3.1) * 43758.5453;
      return v - Math.floor(v);
    };
    let n = 0;
    for (let i = 0; i < 560; i++) {
      // parameterise the barrel: u along the tunnel, a around the arch
      const u = rnd(i, 1), a = rnd(i, 2) * Math.PI;
      const z = -LEN / 2 + u * LEN;
      const x = Math.cos(a) * HALF, y = SPRING + Math.sin(a) * HALF;
      // thicker at the crown, per "lifting uppe and bending ouer"
      if (rnd(i, 3) > 0.52 + Math.sin(a) * 0.48) continue;
      const jitter = 0.1;
      const lx = x + (rnd(i, 4) - 0.5) * jitter, ly = y + (rnd(i, 5) - 0.5) * jitter;
      const leaf = this._m(leafGeo, leafMat, lx, ly, z + (rnd(i, 6) - 0.5) * 0.3,
        { parent: g, cast: false });
      leaf.rotation.set(rnd(i, 7) * 1.2 - 0.6, rnd(i, 8) * Math.PI, rnd(i, 9) * Math.PI);
      n++;
      if (rnd(i, 10) < 0.34) {
        const fx = lx + (rnd(i, 11) - 0.5) * 0.24, fy = ly - 0.08 - rnd(i, 12) * 0.16,
              fz = z + (rnd(i, 13) - 0.5) * 0.3;
        const jm = JASMINE[i % 3];
        this._m(flowerGeo, jm, fx, fy, fz, { parent: g, cast: false });
        this._m(flowerGeo, jm, fx + 0.055, fy - 0.045, fz + 0.03, { parent: g, cast: false });
        this._m(flowerGeo, jm, fx - 0.04, fy - 0.06, fz - 0.03, { parent: g, cast: false });
      }
    }
    // the stems themselves, wound up the outer posts
    const stemMat = woodcut ? this._darkStoneMat : S.mat({ color: 0x4a3a22, roughness: 0.95 });
    stemMat.userData.roll = 'a jasmine stem';
    for (let b = 0; b <= BAYS; b++) {
      const z = -LEN / 2 + (b / BAYS) * LEN;
      for (const sx of [-1, 1]) {
        const st = this._m(new THREE.CylinderGeometry(0.03, 0.045, SPRING * 1.02, 5),
          stemMat, sx * (HALF + 0.06), SPRING / 2, z, { parent: g, cast: false });
        st.rotation.z = sx * 0.05;
      }
    }

    // Walls down the two sides; the ends stay open, because the book has him
    // walk in under it.
    this._wallCol(CX - HALF - 0.2, CX - HALF + 0.2, CZ - LEN / 2, CZ + LEN / 2);
    this._wallCol(CX + HALF - 0.2, CX + HALF + 0.2, CZ - LEN / 2, CZ + LEN / 2);

    (this._shadeLines = this._shadeLines || []).push(
      [CX, CZ - LEN / 2, CX, CZ + LEN / 2, HALF * 1.5]);
    this._plaque({ main: 'ARBOVR OF SWEETE GESSAMINE',
      sub: 'LIFTING VPPE AND BENDING OVER · FLOVRES OF THREE SORTES COMMIXT · DALLINGTON P. 200' },
      2.5, 0.34, CX, 0.5, CZ - LEN / 2 - 0.5, 0, true);
    return { LEN, HALF };
  }

  // ── Second nature: the worked countryside (Dallington p. 90) ─────────────
  //
  // Built 2026-09-07 to close the gap GARDENS.md §2 names. Hunt reads the book
  // through the humanist doctrine of the three natures — wilderness, the
  // worked landscape, and garden art — and observes that Poliphilo compares
  // them to each other the whole way through. This world had the first (the
  // selva oscura) and the third (the courts and Cythera) and NOTHING between
  // them, so the meadow was being asked to be wilderness-edge and garden at
  // once and read as neither.
  //
  // The text is the country he comes into after the vaults:
  //   "Nowe come to behoulde a fayre and plentifull countrie, fruitefull
  //    fieldes, and fertile groundes."                     — Dallington p. 90
  //
  // Three kinds of worked ground, which is what second nature meant in the
  // Veneto Colonna wrote in, and all three are named by the book itself:
  //   * tilled strips — ploughland, laid in ridges, some in stubble;
  //   * an orchard in quincunx — apple, pear and plum, the three fruits
  //     Segre finds at Cythera, here in their ordinary agricultural use;
  //   * the ARBUSTUM, vines married to elms. Chapter I names it in the wood's
  //     own species list: "towgh Elmes beloued of the fruitfull vines"
  //     (Dallington l. 625). Rhizopoulou 2016 reads the book's grapevines,
  //     olives and fruit trees together as "an arboricultural economy".
  //
  // It lies west of the water-labyrinth basin, on the ground between the wood
  // and the Queen's court, which is where his route crosses it.
  _buildSecondNature() {
    const S = this.style, woodcut = S.key === 'woodcut';
    // The belt runs east-west across the open ground north-west of the dark
    // wood, so that coming out of the wilderness you come into worked land --
    // first nature into second, which is Hunt's whole point. It was first laid
    // west of the water-labyrinth and had to move: the labyrinth basin is
    // 9.8 m in radius about (-44, 34) and the fields were standing in it.
    const X0 = -60, X1 = -20, Z0 = 46.5, Z1 = 61;
    const CXm = (X0 + X1) / 2, CZm = (Z0 + Z1) / 2, WID = X1 - X0;

    // ── the tilled strips ────────────────────────────────────────────────
    // Strip fields: long, narrow, separately worked, and in different states
    // in the same season, which is what tells you at a glance that land is
    // farmed rather than merely open.
    const soil = (base, dark, light) => {
      const m = woodcut ? S.mat({ tone: 0.14 }) : S.mat({ color: 0xffffff, roughness: 0.98 });
      if (!woodcut) this._dress(m, this._surfaceTexture({ base, dark, light, blobs: 40, speckle: 5200, courses: 26, repeat: 3 }), 0.28);
      return m;
    };
    const fallow  = soil('#5e4c34', '#3e3020', '#7a6546');   // turned earth
    const stubble = soil('#8a7f52', '#61562f', '#a89c6c');   // cut corn
    const green   = soil('#455a26', '#2c3f18', '#617a38');   // young wheat
    const STRIPS = 7, SD = (Z1 - Z0) / STRIPS;
    // Ridge and furrow, built rather than drawn. Stripes painted on a flat
    // plane read as a striped rug at grazing angles, and grazing angles are
    // how you see a field you are standing in; the ridges need a section for
    // the light to find. They are cheap -- long thin boxes, and
    // _compileDrawCalls() merges the lot into one draw call.
    const ridgeMat = woodcut ? S.mat({ tone: 0.12 })
      : S.mat({ color: 0x6a5740, roughness: 0.99 });
    for (let i = 0; i < STRIPS; i++) {
      const mat = [fallow, green, stubble][i % 3];
      const z = Z0 + (i + 0.5) * SD;
      this._m(new THREE.PlaneGeometry(WID, SD * 0.94), mat, CXm, 0.045, z,
        { rx: -Math.PI / 2, cast: false });
      if (i % 3 === 0) {
        const RIDGES = 7;
        for (let r = 0; r < RIDGES; r++) {
          const rz = z - SD * 0.42 + (r + 0.5) * (SD * 0.84 / RIDGES);
          this._m(new THREE.BoxGeometry(WID * 0.98, 0.11, SD * 0.84 / RIDGES * 0.62),
            ridgeMat, CXm, 0.10, rz, { cast: false });
        }
      }
      // clods and field stones on the turned ground: a ploughed strip is not
      // a smooth surface, and a handful of low lumps is enough to say so.
      if (i % 3 === 0) {
        const clodMat = woodcut ? S.mat({ tone: 0.10 })
          : S.mat({ color: 0x6f5c44, roughness: 1.0 });
        for (let c = 0; c < 26; c++) {
          const v = Math.sin(c * 71.3 + i * 19.7) * 43758.5453;
          const u = v - Math.floor(v);
          const v2 = Math.sin(c * 33.9 + i * 51.1) * 24634.6345;
          const u2 = v2 - Math.floor(v2);
          const cl = this._m(new THREE.SphereGeometry(0.10 + u2 * 0.07, 5, 4), clodMat,
            X0 + 0.6 + u * (WID - 1.2), 0.10, z + (u2 - 0.5) * SD * 0.7, { cast: false });
          cl.scale.set(1, 0.55, 0.85);
        }
      }
      // the baulk: a low grassy ridge between one man's strip and the next
      if (i < STRIPS - 1) {
        this._hedge(CXm, 0.08, Z0 + (i + 1) * SD, WID, 0.16, 0.3,
          { cast: false, fringe: { density: 7, faces: 'top', seed: i } });
      }
    }

    // ── the orchard, in quincunx ─────────────────────────────────────────
    // Rows offset by half a pitch, which is how fruit was set out and why an
    // orchard looks unlike a wood from inside it: the eye finds a line
    // whichever way it turns. Apple, pear and plum are the three Segre finds
    // in the prati of Cythera (GARDENS.md 5), here in their ordinary use.
    const FRUIT = ['apple', 'pear', 'plum'];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 9; c++) {
        const x = X0 + 2.2 + c * 4.3 + (r % 2 ? 2.15 : 0);
        const z = Z0 + 1.9 + r * 4.4;
        if (x > X1 - 1.4) continue;
        this._tree(x, z, 0.58, FRUIT[(r + c) % 3]);
      }
    }

    // ── the arbustum: vines married to elms ──────────────────────────────
    // Chapter I names it in the wood's own species list -- "towgh Elmes
    // beloued of the fruitfull vines" (Dallington l. 625) -- and Rhizopoulou
    // 2016 reads the book's grapevines, olives and fruit trees together as an
    // arboricultural economy. Two rows along the southern edge, the vine
    // swagged tree to tree in the festoons the Veneto calls a piantata.
    const vineMat = woodcut ? S.mat({ tone: 0.05 })
      : S.mat({ color: 0x4a5c28, roughness: 0.9 });
    // A bunch is many small berries, not one plum. Built as a little cluster,
    // because a single sphere at this size reads as a purple ball on a string.
    const grapeMat = woodcut ? S.mat({ tone: -0.02 })
      : S.mat({ color: 0x3d2447, roughness: 0.55 });
    grapeMat.userData.roll = 'a grape';
    vineMat.userData.roll = 'a length of vine';
    const berryGeo = new THREE.SphereGeometry(0.055, 5, 4);
    const bunch = (bx, by, bz) => {
      for (const [ox, oy, oz] of [[0, 0, 0], [0.075, -0.05, 0.02], [-0.07, -0.06, -0.03],
                                  [0.01, -0.13, 0.05], [-0.03, -0.19, -0.02]]) {
        this._m(berryGeo, grapeMat, bx + ox, by + oy, bz + oz, { cast: false });
      }
    };
    const ELMS = 8, EX0 = X0 + 3, EXS = (WID - 6) / (ELMS - 1);
    for (let row = 0; row < 2; row++) {
      const ez = Z0 - 1.6 - row * 3.4;
      for (let i = 0; i < ELMS; i++) {
        const x = EX0 + i * EXS;
        this._tree(x, ez, 1.05, 'elm');
        if (i === 0) continue;
        const x0 = EX0 + (i - 1) * EXS, SEG = 8;
        for (let g = 0; g < SEG; g++) {
          const t = (g + 0.5) / SEG, sag = Math.sin(t * Math.PI) * 0.6;
          const xx = x0 + (x - x0) * t;
          this._m(new THREE.SphereGeometry(0.11, 5, 4), vineMat, xx, 2.05 - sag, ez, { cast: false });
          if (g % 2 === 1) bunch(xx, 1.86 - sag, ez + 0.1);
        }
      }
    }

    // ── the hedgerow that closes the belt ────────────────────────────────
    // A field boundary, not a garden hedge: let grow, and only on the far side,
    // so the belt is walked into from the wood rather than fenced off.
    this._hedge(CXm, 0.48, Z1 + 0.5, WID, 0.95, 0.55, { cast: false, fringe: { density: 10 } });
    this._wallCol(X0, X1, Z1 + 0.2, Z1 + 0.8);

    this._plaque({ main: 'A FAYRE AND PLENTIFVLL COVNTRIE',
      sub: 'FRVITEFVLL FIELDES AND FERTILE GROVNDES · DALLINGTON P. 90 · SECOND NATVRE, AFTER HVNT' },
      3.2, 0.42, CXm + 9, 0.58, Z0 - 6.2, 0, true);
  }

  // ── The pleasures of the garden (PLEASURES.md) ───────────────────────────
  //
  // Built 2026-09-07. Ted asked for the pleasures of the Renaissance garden,
  // taken from what Poliphilo says when he meets them. Four of them are here;
  // shade, the fifth and the loudest in the book, is in _canopyCards, because
  // it was a shadow-casting flag and not a thing to build.

  // Birds. "the trees full of small birdes and foules" (Dallington p. 94);
  // "the sweet chirpings and quiet singing of Birds" (p. 101); "from the trees
  // resounded the sweete consents of small chirping birds" (p. 257).
  //
  // This site is silent by standing decision, so the birds are SEEN and not
  // heard -- which is what the book itself does at the fountain of the sleeping
  // nymph, where it does not describe birds singing but birds CARVED "as yf
  // they had beene chirping and singing of hir a sleep" (p. 98). Where a
  // pleasure cannot be delivered, show it being represented. That is the
  // paragone, and it is the book's own method.
  //
  // A bird is four triangles and costs nothing: a body, a head, two wings. The
  // perched ones sit in the canopies; the flying ones wheel over the garden on
  // slow circles, and are the only things in the sky.
  _bird(scale = 1, { flying = false } = {}) {
    const S = this.style, woodcut = S.key === 'woodcut';
    const g = new THREE.Group();
    const body = woodcut ? S.mat({ tone: 0.02 })
      : S.mat({ color: 0x4a4038, roughness: 0.92 });
    const breast = woodcut ? S.mat({ tone: -0.03 })
      : S.mat({ color: 0xb8a184, roughness: 0.9 });
    const b = this._m(new THREE.SphereGeometry(0.075 * scale, 6, 5), body, 0, 0, 0,
      { parent: g, cast: false, receive: false });
    b.scale.set(1.5, 0.85, 0.85);
    this._m(new THREE.SphereGeometry(0.048 * scale, 6, 5), breast, 0.085 * scale, 0.012 * scale, 0,
      { parent: g, cast: false, receive: false });
    // the tail, a wedge
    const tail = this._m(new THREE.ConeGeometry(0.038 * scale, 0.13 * scale, 4), body,
      -0.14 * scale, 0.012 * scale, 0, { parent: g, cast: false, receive: false });
    tail.rotation.z = Math.PI / 2;
    const wings = [];
    for (const sz of [-1, 1]) {
      const w = this._m(new THREE.ConeGeometry(0.05 * scale, 0.2 * scale, 3), body,
        0, 0.03 * scale, sz * 0.06 * scale, { parent: g, cast: false, receive: false });
      w.rotation.x = sz * (flying ? -0.5 : -1.35);
      w.scale.set(1, 1, 0.35);
      wings.push({ w, sz });
    }
    g.userData.wings = wings;
    return g;
  }

  _buildBirds() {
    if (this.style.key === 'woodcut') return;    // the plates cut their own birds
    this._birds = this._birds || [];   // the Adonis grove may have perched some already
    const rnd = (i, k) => {
      const v = Math.sin(i * 53.7 + k * 197.3) * 43758.5453;
      return v - Math.floor(v);
    };

    // Perched: in the trees of the garden and the wood's edge, where the book
    // puts them -- "the trees full of small birdes and foules".
    const PERCH = [
      [-8.6, 41.9, 2.5], [-19.2, 42.2, 2.4], [-24.6, 47.9, 2.6], [3.5, 40.0, 3.1],
      [10.5, 16.5, 2.3], [-13.0, 18.0, 2.5], [17.5, 17.0, 2.2], [21.0, 24.5, 2.4],
      [-31.5, 4.0, 2.6], [-27.0, -6.5, 2.4], [4.5, -6.0, 2.3], [-4.0, -14.5, 2.5],
      [26.5, -19.0, 2.7], [-33.0, -14.0, 2.5], [-46.0, 44.5, 2.6], [-30.0, 44.5, 2.4],
      [-52.0, 43.0, 2.5], [-24.0, 44.0, 2.7],
    ];
    for (let i = 0; i < PERCH.length; i++) {
      const [x, z, y] = PERCH[i];
      const g = this._bird(0.9 + rnd(i, 1) * 0.35);
      g.position.set(x + (rnd(i, 2) - 0.5) * 0.8, y, z + (rnd(i, 3) - 0.5) * 0.8);
      g.rotation.y = rnd(i, 4) * Math.PI * 2;
      this.scene.add(g);
      // a perched bird is never quite still: it turns its head and shifts
      this._birds.push({ g, kind: 'perch', phase: rnd(i, 5) * Math.PI * 2,
                         y: g.position.y, yaw0: g.rotation.y });
    }

    // Flying: slow wheeling circles over the garden and over the fields. They
    // are the only moving things in the sky, which is the point -- a still sky
    // reads as a painted backdrop.
    const RINGS = [
      [0, 10, 22, 14], [-24, 20, 16, 12], [20, -14, 18, 15],
      [-40, 52, 20, 13], [0, -120, 26, 17],
    ];
    for (let r = 0; r < RINGS.length; r++) {
      const [cx, cz, rad, h] = RINGS[r];
      const n = 2 + Math.floor(rnd(r, 9) * 2);
      for (let i = 0; i < n; i++) {
        const g = this._bird(1.0 + rnd(r * 7 + i, 1) * 0.5, { flying: true });
        this.scene.add(g);
        this._birds.push({
          g, kind: 'fly', cx, cz, r: rad * (0.6 + rnd(r * 7 + i, 2) * 0.55),
          h: h + rnd(r * 7 + i, 3) * 5,
          a: rnd(r * 7 + i, 4) * Math.PI * 2,
          spd: 0.10 + rnd(r * 7 + i, 5) * 0.09,
          phase: rnd(r * 7 + i, 6) * Math.PI * 2,
        });
      }
    }
  }

  _updateBirds(t) {
    if (!this._birds) return;
    for (const b of this._birds) {
      if (b.kind === 'fly') {
        b.a += b.spd * 0.016;
        const x = b.cx + Math.cos(b.a) * b.r, z = b.cz + Math.sin(b.a) * b.r;
        b.g.position.set(x, b.h + Math.sin(t * 0.6 + b.phase) * 0.9, z);
        b.g.rotation.y = -b.a + Math.PI / 2;
        b.g.rotation.z = 0.28;                                  // banked into the turn
        const beat = Math.sin(t * 6 + b.phase);
        for (const { w, sz } of b.g.userData.wings) w.rotation.x = sz * (-0.5 + beat * 0.5);
      } else {
        // a small turn of the head, and a hop now and then
        b.g.rotation.y = b.yaw0 + Math.sin(t * 0.7 + b.phase) * 0.5;
        const hop = Math.max(0, Math.sin(t * 1.3 + b.phase) - 0.93) * 4.0;
        b.g.position.y = b.y + hop * 0.09;
      }
    }
  }

  // Repose. "…were constrained to rest our selues for want of breath, vpon the
  // odoriferous floures & coole grasse … And as they thus contentedly rested
  // themselues a while, vnder the coole vmbrage of the leafie Trees"
  // (Dallington p. 121).
  //
  // The flowery bank you lie on is a real fifteenth-century garden object --
  // the turf seat -- and it is where this book puts its people when it wants
  // them to stop and talk. A low retaining kerb, a raised bed of turf, and the
  // flowers growing out of the seat itself.
  _turfSeat(x, z, w, ry = 0) {
    const S = this.style, woodcut = S.key === 'woodcut';
    const kerb = woodcut ? this._darkStoneMat
      : S.mat({ color: 0x8a7a5e, roughness: 0.95 });
    const turf = woodcut ? S.mat({ tone: 0.08 }) : this._hedgeMat;
    const g = new THREE.Group();
    g.position.set(x, 0, z); g.rotation.y = ry;
    this.scene.add(g);
    const D = 0.62, H = 0.46;
    // the kerb that holds the earth in
    this._m(new THREE.BoxGeometry(w, H, 0.12), kerb, 0, H / 2, D / 2, { parent: g });
    for (const sx of [-1, 1]) {
      this._m(new THREE.BoxGeometry(0.12, H, D), kerb, sx * (w / 2 - 0.06), H / 2, 0, { parent: g });
    }
    // the turf itself, proud of the kerb, as a made seat always is
    this._m(new THREE.BoxGeometry(w - 0.2, 0.14, D - 0.06), turf, 0, H + 0.04, 0,
      { parent: g, cast: false });
    // and the flowers growing out of it -- it is a seat OF flowers
    const rnd = (i, k) => { const v = Math.sin(i * 41.3 + k * 87.1 + x * 3.7) * 43758.5453; return v - Math.floor(v); };
    // aromatic, and all in HERBS: the book calls them odoriferous floures
    const KINDS = ['aster', 'thyme', 'marjoram', 'balm'];
    for (let i = 0; i < Math.round(w * 4); i++) {
      const kind = KINDS[i % KINDS.length];
      this._tuft(-w / 2 + 0.2 + rnd(i, 1) * (w - 0.4), H + 0.1,
        (rnd(i, 2) - 0.5) * (D - 0.24), kind, 0.17 + rnd(i, 3) * 0.07,
        { parent: g, ry: rnd(i, 4) * Math.PI });
    }
    // seats are for sitting on, not walking through
    const hw = Math.abs(Math.cos(ry)) * w / 2 + Math.abs(Math.sin(ry)) * D / 2;
    const hd = Math.abs(Math.sin(ry)) * w / 2 + Math.abs(Math.cos(ry)) * D / 2;
    this._wallCol(x - hw, x + hw, z - hd, z + hd);
    return g;
  }

  _buildTurfSeats() {
    // Where the book actually rests its people: under the trees by the bath,
    // where the five nymphs sit down on the flowers and the cool grass (p. 121);
    // in the jasmine arbour's garden, where Polia is met; under the arbour
    // where Thelemia sits down to sing (p. 182); and on the shore, facing
    // Cythera, which is the one view in the book he is given whole.
    const SEATS = [
      [ -2.6, -25.2, 2.4, 0 ],          // the shore, looking out to Cythera
      [  2.6, -25.2, 2.4, 0 ],
      [ 22.6,  20.0, 2.0, -Math.PI / 2 ],   // Polia's garden, beside the arbour
      [ 15.4,  20.0, 2.0,  Math.PI / 2 ],
      [ -6.4,  30.6, 2.2, 0 ],          // the walk between the portal and the court
      [  6.4,  30.6, 2.2, 0 ],
      [ -21.0,  8.6, 2.0, Math.PI ],    // by the planetary palace
      [ -40.0, 44.0, 2.4, Math.PI ],    // looking over the fruitful fields
    ];
    for (const [x, z, w, ry] of SEATS) this._turfSeat(x, z, w, ry);
    this._plaque({ main: 'VPON THE ODORIFEROVS FLOVRES & COOLE GRASSE',
      sub: 'WHERE THEY RESTED THEM SELVES · VNDER THE COOLE VMBRAGE OF THE LEAFIE TREES · DALLINGTON P. 121' },
      3.0, 0.4, 0, 0.6, -26.4, 0, true);
  }

  // Visible fragrance. Smell cannot be shipped, but smoke can be seen, and the
  // book gives us smoke: "out of the which did ascend a thicke smoake or fume,
  // of an inestimable fragrancie" (Dallington p. 224). So scent enters this
  // world as fume, and only where the text puts a censer or a fire. Built on
  // the ParticleStream the triumph censers already use -- there is no reason
  // for a second smoke system.
  _fume(x, y, z, { rise = 2.4, drift = 0.5, count = 20, speed = 0.16 } = {}) {
    if (this.style.key === 'woodcut') return null;   // the plates do not draw smoke
    const stream = new ParticleStream({
      count,
      source: new THREE.Vector3(x, y, z),
      target: new THREE.Vector3(x + drift, y + rise, z + drift * 0.4),
      color: 0xd8cdb8, size: 0.07, speed, arc: 0.55,
    });
    stream.opacity = 0.16; stream.active = true;
    this.style.tuneStream(stream);
    this.scene.add(stream.points);
    this._streams.push(stream);
    return stream;
  }

  _buildFumes() {
    // Only where the book puts a censer or a burning: the lion-head censer
    // hanging over the bath (p. 113), the cleft in the earth that feeds it
    // (p. 112), the brass altar-furnace in the Polyandrion crypt (ch. XIX),
    // and the fire-holder on the jasper altar in the Temple of Venus, which is
    // where the fume of "inestimable fragrancie" is actually described.
    const F = [
      [  0.0, 4.05, -20.0, { rise: 3.0, drift: 0.55 }],   // fountain grove, the standing censer
      [ -30.0, 1.5, -12.0, { rise: 2.6, drift: 0.42 }],   // Temple of Venus, the jasper altar
      [ 44.0, 1.2, -12.0, { rise: 2.2, drift: 0.5 }],     // the rite of Priapus, the altar fire
      [ 30.0, 0.9, -27.0, { rise: 1.8, drift: 0.35, count: 14 }],  // the Polyandrion crypt furnace
    ];
    for (const [x, y, z, o] of F) this._fume(x, y, z, o);
  }

  // ── Shade, baked (PLEASURES.md 1) ────────────────────────────────────────
  //
  // "…which made a pleasaunt and coole shade" (Dallington p. 92); "vnder the
  // coole vmbrage of the leafie Trees" (p. 121); "making the shadowed places
  // vnder the leaffye Trees, coole and fresh" (p. 196). It is the sensation the
  // book returns to more than any other, and this world had none of it: every
  // part of the garden was lit exactly like every other part, which is another
  // way of saying it had no interior.
  //
  // The canopies do now cast into the sun's shadow map, and over a 130 m world
  // with one 2048 map and an environment light carrying most of the
  // illumination, that alone put nothing visible on the grass. So the shade is
  // BAKED, which for this world is not a compromise: the sun is a single fixed
  // key at (16, 22, 10), there is no time of day, and a tree's shadow therefore
  // never moves. One canvas serves the ground plane and all 58 000 blades of
  // the meadow, and unlike a shadow map it can be art-directed.
  _buildShadeMap() {
    if (this.style.key === 'woodcut') return;     // the plates hatch their own
    const X0 = -66, Z0 = -68, W = 132, D = 132;   // covers the whole ground
    const N = 1024;                               // ~13 cm per texel
    const c = document.createElement('canvas');
    c.width = c.height = N;
    const g = c.getContext('2d');
    g.clearRect(0, 0, N, N);
    const px = N / W, pz = N / D;

    // A shadow lies down-sun of the thing that casts it. The key is at
    // (16, 22, 10), so a crown at height h throws its pool (16/22, 10/22) * h
    // the other way.
    const SX = -16 / 22, SZ = -10 / 22;

    const blob = (wx, wz, r, alpha) => {
      const cx = (wx - X0) * px, cy = (wz - Z0) * pz;
      const rr = r * px;
      // Not black: shade under leaves is COOL, because what still reaches it is
      // the sky and not the sun. A blue-green dark keeps the grass looking like
      // grass in shadow rather than grass with dirt on it.
      const grd = g.createRadialGradient(cx, cy, rr * 0.15, cx, cy, rr);
      grd.addColorStop(0, `rgba(20,34,44,${alpha})`);
      grd.addColorStop(0.55, `rgba(24,38,46,${alpha * 0.72})`);
      grd.addColorStop(1, 'rgba(28,42,50,0)');
      g.fillStyle = grd;
      g.beginPath(); g.arc(cx, cy, rr, 0, Math.PI * 2); g.fill();
    };

    for (const t of this._shadeSpots) {
      const ox = t.x + SX * t.h, oz = t.z + SZ * t.h;
      // the pool, and a few broken satellites so the rim is leaf-torn rather
      // than a clean disc -- dappling, at the only scale this map can hold it
      blob(ox, oz, t.r * 1.3, 0.58);
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2 + t.x * 0.7;
        const d = t.r * (0.55 + ((Math.sin(t.z * 13.1 + k) + 1) / 2) * 0.6);
        blob(ox + Math.cos(a) * d, oz + Math.sin(a) * d, t.r * 0.46, 0.34);
      }
    }
    // the jasmine arbour and the shaded walk throw a continuous shade, not a
    // pool: a tunnel of leaves is the deepest shade in the garden
    for (const [x0, z0, x1, z1, wdt] of (this._shadeLines || [])) {
      const n = Math.ceil(Math.hypot(x1 - x0, z1 - z0) / (wdt * 0.4));
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        blob(x0 + (x1 - x0) * t + SX * 2.2, z0 + (z1 - z0) * t + SZ * 2.2, wdt, 0.42);
      }
    }

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = 4;
    this._disp.push(tex);
    this._shadeTex = tex;

    // the ground takes it as a transparent overlay, just clear of the sward
    const mat = new THREE.MeshBasicMaterial({
      map: tex, transparent: true, depthWrite: false, opacity: 0.85,
    });
    this._disp.push(mat);
    const plane = this._m(new THREE.PlaneGeometry(W, D), mat, X0 + W / 2, 0.055, Z0 + D / 2,
      { rx: -Math.PI / 2, cast: false, receive: false });
    plane.renderOrder = 1;

    // and so does every blade of grass
    for (const f of this._meadows) attachShade(f, tex, X0, Z0, W, D);
  }

  // ── Hedges: the body is a box, the silhouette is leaves ──────────────────
  //
  // Built 2026-09-08. Box is the commonest material in this world and it was
  // reading as a smooth green solid everywhere it appeared. A hedge is not
  // smooth: the shears leave a fuzzy rim of half-cut twigs, and it is that rim,
  // not the colour, that tells the eye what it is looking at.
  //
  // `_hedgeFringe` scatters small box-leaf cards over the faces of a box that
  // has already been built, standing them a few centimetres proud so they break
  // the edge. Cards share one material and merge into a single draw call, so a
  // hundred hedges cost one.
  //
  //   x, y, z   centre of the box (y is its CENTRE, as _m takes it)
  //   w, h, d   its size
  //   ry        its rotation about Y, if any
  //   faces     which sides to dress: 'top' is always worth it, the verticals
  //             matter only where the player walks past them
  _hedgeFringe(x, y, z, w, h, d, ry = 0, { density = 26, faces = 'all', seed = 0 } = {}) {
    if (this.style.key === 'woodcut') return;      // the plates cut their own
    const mat = this._hedgeLeafMat = this._hedgeLeafMat || new THREE.MeshStandardMaterial({
      map: this._leafCardTexture('box'),
      alphaTest: 0.42, side: THREE.DoubleSide,
      roughness: 0.9, metalness: 0,
      userData: { roll: 'a box leaf' },
    });
    if (!this._hedgeLeafGeo) this._hedgeLeafGeo = new THREE.PlaneGeometry(0.26, 0.26);
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = ry;
    this.scene.add(g);
    const rnd = (i, k) => {
      const v = Math.sin(i * 63.7 + k * 129.3 + seed * 7.1 + x * 2.3 + z * 1.7) * 43758.5453;
      return v - Math.floor(v);
    };
    // area of the faces we are dressing, so a long hedge gets more leaves than
    // a short one rather than the same number spread thinner
    const top = w * d, side = h * d, end = w * h;
    const doSides = faces !== 'top';
    const area = top + (doSides ? 2 * side + 2 * end : 0);
    const n = Math.min(420, Math.round(area * density));
    const OUT = 0.055;                              // how far a leaf stands proud
    for (let i = 0; i < n; i++) {
      const r = rnd(i, 1) * area;
      let px, py, pz, nx = 0, ny = 0, nz = 0;
      if (r < top) {                                // the clipped top
        px = (rnd(i, 2) - 0.5) * w; pz = (rnd(i, 3) - 0.5) * d; py = h / 2; ny = 1;
      } else if (r < top + 2 * side) {              // the two long faces
        const sx = r < top + side ? 1 : -1;
        px = (rnd(i, 2) - 0.5) * w; pz = sx * d / 2; py = (rnd(i, 3) - 0.5) * h; nz = sx;
      } else {                                      // the two ends
        const sx = r < top + 2 * side + end ? 1 : -1;
        px = sx * w / 2; pz = (rnd(i, 2) - 0.5) * d; py = (rnd(i, 3) - 0.5) * h; nx = sx;
      }
      const m = new THREE.Mesh(this._hedgeLeafGeo, mat);
      m.position.set(px + nx * OUT, py + ny * OUT, pz + nz * OUT);
      m.rotation.set(rnd(i, 4) * Math.PI, rnd(i, 5) * Math.PI, rnd(i, 6) * Math.PI);
      const sc = 0.7 + rnd(i, 7) * 0.75;
      m.scale.set(sc, sc, 1);
      m.castShadow = false; m.receiveShadow = false;
      g.add(m);
    }
  }

  // The same for a hedge bent round a circle: the labyrinth's seven banks, the
  // rampart of Cythera, the kerbs of its terraces. `a0`/`a1` are the arc in
  // radians measured the way CylinderGeometry measures theta.
  _hedgeFringeArc(cx, cz, r, yTop, h, a0, a1, { density = 5, seed = 0 } = {}) {
    if (this.style.key === 'woodcut') return;
    const mat = this._hedgeLeafMat = this._hedgeLeafMat || new THREE.MeshStandardMaterial({
      map: this._leafCardTexture('box'),
      alphaTest: 0.42, side: THREE.DoubleSide,
      roughness: 0.9, metalness: 0,
    });
    if (!this._hedgeLeafGeo) this._hedgeLeafGeo = new THREE.PlaneGeometry(0.26, 0.26);
    const g = new THREE.Group();
    g.position.set(cx, 0, cz);
    this.scene.add(g);
    const rnd = (i, k) => {
      const v = Math.sin(i * 47.9 + k * 151.7 + seed * 11.3 + r * 5.1) * 43758.5453;
      return v - Math.floor(v);
    };
    const span = Math.abs(a1 - a0);
    const n = Math.min(500, Math.round(r * span * (h + 0.5) * density * 3));
    for (let i = 0; i < n; i++) {
      const a = a0 + rnd(i, 1) * span;
      // two thirds on the crown, where the eye runs along the hedge, and the
      // rest scattered down the two faces
      const onTop = rnd(i, 2) < 0.62;
      const rr = r + (onTop ? (rnd(i, 3) - 0.5) * 0.22 : (rnd(i, 3) < 0.5 ? -0.06 : 0.06));
      const y = onTop ? yTop + 0.045 : yTop - rnd(i, 4) * h;
      const m = new THREE.Mesh(this._hedgeLeafGeo, mat);
      m.position.set(Math.sin(a) * rr, y, Math.cos(a) * rr);
      m.rotation.set(rnd(i, 5) * Math.PI, rnd(i, 6) * Math.PI, rnd(i, 7) * Math.PI);
      const sc = 0.7 + rnd(i, 8) * 0.7;
      m.scale.set(sc, sc, 1);
      m.castShadow = false; m.receiveShadow = false;
      g.add(m);
    }
  }

  // A hedge, built and dressed in one call, so a new one is never a bare box
  // again. Returns the box mesh.
  _hedge(x, y, z, w, h, d, o = {}) {
    const m = this._m(new THREE.BoxGeometry(w, h, d), this._hedgeMat, x, y, z, o);
    this._hedgeFringe(x, y, z, w, h, d, o.ry || 0, o.fringe || {});
    return m;
  }

  // ── The rills (Dallington p. 196) ────────────────────────────────────────
  //
  // One sentence in the book carries the entire water programme of an Italian
  // garden, and this world had only the fountains and the wild stream:
  //
  //   "Issuing and sending foorth in diuers places small streames of water,
  //    pyppling and slyding downe vpon the Amber grauell in theyr crooking
  //    Channels heere and there, by some suddaine fall making a still continued
  //    noyse, to great pleasure moystning the open fieldes, and making the
  //    shadowed places vnder the leaffye Trees, coole and fresh."
  //
  // Every clause is a specification. *Crooking channels* -- they wind, and they
  // are CUT, with a kerb, unlike the wild stream in the wood which merely lies
  // on the ground. *Amber gravel* -- the bed is a warm ochre, and it is what
  // you actually see, because the water is two inches deep. *A suddaine fall*
  // -- each has a step in it, which is the only reason a rill this small makes
  // any sound at all. *Moystning the open fieldes* -- they cross open ground,
  // not paving. *Making the shadowed places cool and fresh* -- they run to the
  // trees, so the water and the shade are the same pleasure, which is exactly
  // how the sentence has it. See PLEASURES.md 4.
  //
  // The site is silent, so the fall is built to be SEEN making its noise: a lip,
  // a white break, and a splash. The same rule as the birds (PLEASURES.md 2).
  _buildRills() {
    const S = this.style, woodcut = S.key === 'woodcut';
    const water = this._waterMat();

    // amber gravel, and the cut kerb that makes a channel a channel
    const gravel = woodcut ? S.mat({ tone: 0.04, rim: 0 })
      : S.mat({ color: 0xffffff, roughness: 0.95 });
    if (!woodcut) this._dress(gravel, this._surfaceTexture({
      base: '#c29a52', dark: '#7a5c28', light: '#e8cc92', blobs: 34, speckle: 6200, repeat: 7,
    }), 0.3);
    const kerb = woodcut ? S.mat({ tone: 0.10 }) : S.mat({ color: 0x9a9084, roughness: 0.92 });

    // Three of them, on the open sward between the elephant plaza and the
    // cross-path -- open field, which is what the sentence asks for. The first
    // siting ran them straight through the Three Doors wall, which occupies
    // z 10.6-13.4 clear across the world; these keep to the band z 2.5-9.5,
    // east and west of the plaza, where there is nothing but grass.
    //   [ points ..., which point carries the fall ]
    const RILLS = [
      { pts: [[16.4, 3.0], [13.8, 4.5], [11.4, 3.6], [9.0, 5.3], [6.6, 4.3], [4.9, 6.1]], fall: 2 },
      { pts: [[-5.0, 6.5], [-7.3, 4.9], [-9.7, 6.5], [-12.0, 5.1]], fall: 1 },
      { pts: [[5.9, 8.7], [8.5, 9.5], [11.1, 8.3], [13.7, 9.3], [16.2, 8.1]], fall: 2 },
    ];

    this._rillFalls = [];
    for (let r = 0; r < RILLS.length; r++) {
      const { pts, fall } = RILLS[r];
      const P = (y) => pts.map(([x, z]) => new THREE.Vector3(x, y, z));

      // the cut: a kerb ribbon a little wider than the channel, then the amber
      // gravel bed inside it, then the water, barely above the gravel
      this.scene.add(this._ribbon(P(0.012), 0.92, kerb));
      this.scene.add(this._ribbon(P(0.020), 0.62, gravel));
      const w = this._ribbon(P(0.038), 0.50, water);
      this.scene.add(w);
      this._waters.push({ m: w, rate: 0.14 });

      // the suddaine fall: a lip across the channel, the white break under it,
      // and the splash. Two inches of drop is all a rill ever has.
      const [fx, fz] = pts[fall];
      const [nx, nz] = pts[Math.min(fall + 1, pts.length - 1)];
      const ang = Math.atan2(nx - fx, nz - fz);
      this._m(new THREE.BoxGeometry(0.78, 0.1, 0.1), kerb, fx, 0.06, fz, { ry: ang, cast: false });
      const foam = woodcut ? S.mat({ tone: -0.08 })
        : S.mat({ color: 0xeef2f2, roughness: 0.35, emissive: 0xbfd4d8, emissiveIntensity: 0.18 });
      this._m(new THREE.BoxGeometry(0.5, 0.02, 0.34), foam, fx + Math.sin(ang) * 0.22, 0.045, fz + Math.cos(ang) * 0.22,
        { ry: ang, cast: false });
      const stream = new ParticleStream({
        count: 14,
        source: new THREE.Vector3(fx, 0.10, fz),
        target: new THREE.Vector3(fx + Math.sin(ang) * 0.5, 0.03, fz + Math.cos(ang) * 0.5),
        color: 0xdfeef2, size: 0.02, speed: 0.7, arc: 0.25,
      });
      stream.opacity = 0.5; stream.active = true;
      this.style.tuneStream(stream);
      this.scene.add(stream.points);
      this._streams.push(stream);

      // "moystning the open fieldes": the bank is greener and wetter than the
      // field it crosses, and the water plants stand in it
      const rnd = (i, k) => { const v = Math.sin(i * 71.3 + k * 133.7 + r * 17.9) * 43758.5453; return v - Math.floor(v); };
      const KINDS = ['rush', 'waterflower', 'mint', 'reed'];
      for (let i = 0; i < 26; i++) {
        const t = rnd(i, 1) * (pts.length - 1);
        const k = Math.floor(t), f = t - k, k2 = Math.min(k + 1, pts.length - 1);
        const bx = pts[k][0] + (pts[k2][0] - pts[k][0]) * f;
        const bz = pts[k][1] + (pts[k2][1] - pts[k][1]) * f;
        const side = rnd(i, 2) < 0.5 ? -1 : 1;
        this._tuft(bx + side * (0.42 + rnd(i, 3) * 0.3), 0.015, bz + (rnd(i, 4) - 0.5) * 0.4,
          KINDS[i % KINDS.length], 0.20 + rnd(i, 5) * 0.12);
      }
      // and a few pebbles in the bed, which is what makes a rill "pypple"
      const peb = woodcut ? S.mat({ tone: 0.08 }) : S.mat({ color: 0x8a8074, roughness: 0.9 });
      for (let i = 0; i < 12; i++) {
        const t = 0.06 + rnd(i, 6) * 0.88, k = Math.floor(t * (pts.length - 1)), f = t * (pts.length - 1) - k;
        const k2 = Math.min(k + 1, pts.length - 1);
        const bx = pts[k][0] + (pts[k2][0] - pts[k][0]) * f + (rnd(i, 7) - 0.5) * 0.3;
        const bz = pts[k][1] + (pts[k2][1] - pts[k][1]) * f + (rnd(i, 8) - 0.5) * 0.3;
        this._m(this._indexed(new THREE.DodecahedronGeometry(0.035 + rnd(i, 9) * 0.04, 0)), peb,
          bx, 0.03, bz, { cast: false }).rotation.set(rnd(i, 10) * 3, rnd(i, 11) * 3, 0);
      }
    }

    this._plaque({ main: 'IN THEYR CROOKING CHANNELS',
      sub: 'SMALL STREAMES PYPPLING AND SLYDING DOWNE VPON THE AMBER GRAVELL · BY SOME SVDDAINE FALL · DALLINGTON P. 196' },
      3.4, 0.42, 18.4, 0.54, 5.6, -Math.PI / 2, true);
  }

  // ── The shaded walk (Dallington p. 92) ───────────────────────────────────
  //
  // The first green thing Poliphilo sees after the vaults, and the sentence
  // that first taught this project what the book means by pleasure:
  //
  //   "…Plane trees, Ashe trees, and such like, spredding and stretching out
  //    their braunches: fowlded and imbraced with the running of Hunnisuckles
  //    or woodbines, and Hoppes, which made a pleasaunt and coole shade. Vnder
  //    the which grewe Ladyes Seale or Rape Violet, hurtfull for the sight,
  //    iagged Polypodie, and the Trientall and foure inched Scolopendria, or
  //    Hartes toongue, Heleborous Niger, or Melampodi, Trayfles, and such other
  //    Vmbriphilous hearbes and Woodde Flowers."
  //
  // Four things, and the book supplies all four: the trees (plane and ash), the
  // climbers that lace them together (honeysuckle, woodbine, hop), the shade
  // they make -- which is the point of the sentence -- and the *umbriphilous*
  // herbs that can only live in it: polypody and hart's-tongue, both ferns, and
  // black hellebore.
  //
  // It runs down the east flank between the wood's edge and the Colossus, so a
  // walker coming out of the portal and going east passes under it. The shade
  // map is told about it as a LINE, not a set of pools, because a walk of laced
  // trees throws continuous shade -- that is what makes it a walk and not an
  // avenue. See PLEASURES.md 1.
  _buildShadedWalk() {
    const S = this.style, woodcut = S.key === 'woodcut';
    const X = 31, Z0 = 15, Z1 = 30, HALF = 2.6;
    const N = 6;                                  // pairs of trees
    const rnd = (i, k) => {
      const v = Math.sin(i * 83.1 + k * 149.7 + 31.7) * 43758.5453;
      return v - Math.floor(v);
    };

    // ── the trees: plane and ash, alternating down the two sides ──────────
    const zs = [];
    for (let i = 0; i < N; i++) {
      const z = Z0 + (i / (N - 1)) * (Z1 - Z0);
      zs.push(z);
      for (const sx of [-1, 1]) {
        this._tree(X + sx * HALF, z, 0.82 + rnd(i, sx > 0 ? 1 : 2) * 0.18,
          (i + (sx > 0 ? 0 : 1)) % 2 ? 'plane' : 'ash');
      }
    }

    // ── the climbers, running from tree to tree and closing overhead ──────
    // "fowlded and imbraced with the running of Hunnisuckles or woodbines, and
    // Hoppes": three climbers, so three colours of flower. Honeysuckle is cream
    // going to gold, woodbine the pinker form of the same, and the hop hangs
    // its pale green cones.
    const stemMat = woodcut ? this._darkStoneMat
      : S.mat({ color: 0x4e3d24, roughness: 0.94 });
    const leafMat = woodcut ? S.mat({ tone: 0.06, side: THREE.DoubleSide })
      : new THREE.MeshStandardMaterial({
          map: this._leafCardTexture('plane'),
          alphaTest: 0.44, side: THREE.DoubleSide, roughness: 0.88 });
    if (!woodcut) this._disp.push(leafMat);
    const FLOWERS = woodcut
      ? [S.mat({ tone: -0.03 }), S.mat({ tone: -0.02 }), S.mat({ tone: 0.01 })]
      : [S.mat({ color: 0xf0e2b4, roughness: 0.6 }),    // honeysuckle, cream
         S.mat({ color: 0xd8a8a0, roughness: 0.6 }),    // woodbine, pinker
         S.mat({ color: 0xc2cf92, roughness: 0.66 })];  // hop cones
    ['a honeysuckle', 'a woodbine flower', 'a hop cone']
      .forEach((n, i) => { FLOWERS[i].userData.roll = n; });
    stemMat.userData.roll = 'a length of woodbine';
    if (!woodcut) leafMat.userData.roll = 'a plane leaf';
    const leafGeo = new THREE.PlaneGeometry(0.44, 0.44);
    const florGeo = new THREE.SphereGeometry(0.05, 5, 4);

    // a swag over the walk between each pair of opposite trees, and one down
    // each side from tree to tree: that is what "imbraced" means here
    // A vine is a cord, not a row of beads: each segment is a short cylinder
    // laid between consecutive points of the catenary and turned to face along
    // it, so the swag reads as one continuous running stem.
    const swag = (x0, z0, x1, z1, y0, sag, seed) => {
      const SEG = 10;
      const at = (t) => new THREE.Vector3(
        x0 + (x1 - x0) * t, y0 - Math.sin(t * Math.PI) * sag, z0 + (z1 - z0) * t);
      const UP = new THREE.Vector3(0, 1, 0);
      for (let g = 0; g < SEG; g++) {
        const a = at(g / SEG), b = at((g + 1) / SEG);
        const d = new THREE.Vector3().subVectors(b, a);
        const seg = this._m(new THREE.CylinderGeometry(0.028, 0.028, d.length() * 1.06, 5),
          stemMat, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, { cast: false });
        seg.quaternion.setFromUnitVectors(UP, d.clone().normalize());
      }
      for (let g = 0; g <= SEG; g++) {
        const t = g / SEG;
        const x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
        const y = y0 - Math.sin(t * Math.PI) * sag;
        for (let k = 0; k < 5; k++) {
          const lf = this._m(leafGeo, leafMat,
            x + (rnd(seed * 13 + g, k) - 0.5) * 0.5,
            y - rnd(seed * 13 + g, k + 3) * 0.42,
            z + (rnd(seed * 13 + g, k + 6) - 0.5) * 0.5,
            { cast: false, receive: false });
          lf.rotation.set(rnd(seed + g, k) * Math.PI, rnd(seed + g, k + 1) * Math.PI, rnd(seed + g, k + 2) * Math.PI);
        }
        if (g % 2 === 0) {
          this._m(florGeo, FLOWERS[(g + seed) % 3],
            x + (rnd(seed + g, 9) - 0.5) * 0.4, y - 0.2 - rnd(seed + g, 10) * 0.2,
            z + (rnd(seed + g, 11) - 0.5) * 0.4, { cast: false });
        }
      }
    };
    for (let i = 0; i < N; i++) {
      swag(X - HALF, zs[i], X + HALF, zs[i], 3.5, 0.75, i);           // across
      if (i < N - 1) for (const sx of [-1, 1]) {
        swag(X + sx * HALF, zs[i], X + sx * HALF, zs[i + 1], 3.1, 0.55, i * 3 + (sx > 0 ? 1 : 2));
      }
    }
    // and the stems themselves, wound up the trunks
    for (let i = 0; i < N; i++) for (const sx of [-1, 1]) {
      for (let k = 0; k < 3; k++) {
        const st = this._m(new THREE.CylinderGeometry(0.03, 0.05, 3.2, 5), stemMat,
          X + sx * HALF + Math.cos(k * 2.1) * 0.2, 1.6, zs[i] + Math.sin(k * 2.1) * 0.2,
          { cast: false });
        st.rotation.z = (k - 1) * 0.06;
      }
    }

    // ── the umbriphilous herbs, which can live nowhere else ───────────────
    // Rhizopoulou 2016 reads the same passage: ferns and shade-flowers in the
    // damp under a closed canopy.
    const SHADE_HERBS = ['polypody', 'hartstongue', 'hellebore', 'polypody', 'hartstongue'];
    for (let i = 0; i < 54; i++) {
      const z = Z0 - 1 + rnd(i, 1) * (Z1 - Z0 + 2);
      const x = X + (rnd(i, 2) - 0.5) * (HALF * 2.3);
      this._tuft(x, 0.02, z, SHADE_HERBS[i % SHADE_HERBS.length], 0.24 + rnd(i, 3) * 0.14,
        { ry: rnd(i, 4) * Math.PI });
    }
    // the walk's floor: leaf litter, not grass. Nothing grows in a path.
    const duff = woodcut ? S.mat({ tone: 0.08, rim: 0 }) : S.mat({ color: 0xffffff, roughness: 0.98 });
    if (!woodcut) this._dress(duff, this._surfaceTexture({
      base: '#5b4a30', dark: '#33281a', light: '#846d46', blobs: 46, speckle: 5200, repeat: 5,
    }), 0.22);
    this._m(new THREE.PlaneGeometry(HALF * 1.5, Z1 - Z0 + 3), duff, X, 0.03, (Z0 + Z1) / 2,
      { rx: -Math.PI / 2, cast: false });

    // continuous shade, as a line: this is why it is a walk
    (this._shadeLines = this._shadeLines || []).push([X, Z0 - 1, X, Z1 + 1, HALF * 1.35]);

    this._plaque({ main: 'A PLEASAVNT AND COOLE SHADE',
      sub: 'PLANE AND ASHE FOWLDED AND IMBRACED WITH HVNNISVCKLES, WOODBINES AND HOPPES · VMBRIPHILOVS HEARBES VNDER · DALLINGTON P. 92' },
      3.6, 0.42, X, 0.56, Z0 - 2.2, 0, true);
  }

  // ── The twenty divisions of Cythera (our translation p. 294) ─────────────
  //
  // Built 2026-09-08. The island had twelve wedges and no fences. The book has
  // twenty, and it does not merely assert them — it gives the CONSTRUCTION,
  // the classical golden-section way of inscribing a decagon in a circle:
  //
  //   "…divide by an equal half, with a prick. And from this point draw
  //    obliquely a straight line, toward the topmost summit of the
  //    half-diameter; and at this topmost point, upon this aforesaid line,
  //    mark off from the half-diameter as much as is a quarter part of a whole
  //    diameter. Then extend a line from the centre, cutting over the mark to
  //    the circumference: this will be the division of the ten-angled figure.
  //    **These twenty divisions** were, by most noble fences, diversely
  //    latticed with fitting and convenient marble openwork, two inches thick,
  //    between the measured placing of most polished little pilasters, of
  //    whitening marble, and the rest most lustrously reddening… In the middle
  //    of the fence there opened, level, in each, a gate — seven feet in the
  //    opening, nine high up to the arching of its topmost curve."
  //
  // Every number in that is built: twenty of them, openwork two inches thick
  // between little pilasters, white marble and red, a gate seven feet wide and
  // nine to the crown of its arch. Segre reads the same twenty as the bosco's
  // twenty compartments, each a different plantation, which is why each wedge
  // now carries one species and each fence one climber.
  //
  // And the climbers are the book's own list, in its own order — this is the
  // single most various sentence in the whole garden:
  //
  //   "Along these serpentined the periclymenon; others the jasmine; some of
  //    bindweed; some of hops; and some of black bryony, or black vine; others
  //    of convolvulus, with the lily-like half-azure bells; some all white;
  //    some of momordica — so each was varied. Some of Jove's flammula; of
  //    smilax… adorned with a white fragrant lily-flower, with a thorny and
  //    ivy-like leaf; of bittersweet…"
  static get CYTHERA_CLIMBERS() {
    // name, flower, second (berry or bell), leaf species for the card
    return [
      { name: 'PERICLYMENON',  gloss: 'honeysuckle',            flower: 0xf0e2b4, second: 0xd8a850, leaf: 'myrtle' },
      { name: 'IASMINVM',      gloss: 'jasmine',                flower: 0xf6f0e2, second: null,     leaf: 'myrtle' },
      { name: 'CONVOLVVLVS',   gloss: 'bindweed',               flower: 0xf4f2ea, second: null,     leaf: 'ivy' },
      { name: 'LVPVLVS',       gloss: 'hops',                   flower: 0xc2cf92, second: 0xa8bc78, leaf: 'plane' },
      { name: 'BRYONIA NIGRA', gloss: 'black bryony, black vine', flower: 0xd8dcc0, second: 0x2a1c22, leaf: 'ivy' },
      { name: 'CAMPANVLA',     gloss: 'convolvulus, the lily-like half-azure bells', flower: 0x9ab4dc, second: null, leaf: 'ivy' },
      { name: 'CAMPANVLA ALBA', gloss: 'the same, all white',   flower: 0xf8f6ee, second: null,     leaf: 'ivy' },
      { name: 'MOMORDICA',     gloss: 'balsam-apple',           flower: 0xe8d488, second: 0xd0501e, leaf: 'plane' },
      { name: 'FLAMMVLA IOVIS', gloss: "Jove's flammula, clematis", flower: 0xefeadc, second: null, leaf: 'myrtle' },
      { name: 'SMILAX',        gloss: 'who for love of Crocus made herself Autophoros', flower: 0xf6f4e6, second: 0xc03028, leaf: 'ivy' },
      { name: 'DVLCAMARA',     gloss: 'bittersweet',            flower: 0x8a5ac0, second: 0xd03020, leaf: 'myrtle' },
    ];
  }

  // The openwork itself: "such rhombs, and little squares, and such degenerate
  // from the quadrangle". Drawn once as an alpha map, because pierced marble is
  // a hole pattern and holes are what a texture is for -- modelling two hundred
  // little bars twenty times over would cost a hundred times as much and read
  // no better at three paces.
  _latticeTexture() {
    if (this._latticeTex) return this._latticeTex;
    const N = 256;
    const c = document.createElement('canvas');
    c.width = c.height = N;
    const x = c.getContext('2d');
    x.clearRect(0, 0, N, N);
    x.strokeStyle = '#efe9dc';
    x.lineCap = 'square';
    // The rhombs: a diagonal net. Seven to a panel, which puts each opening at
    // about a hand's breadth -- pierced marble, not a farm gate. At four to a
    // panel they were 60 cm across and read as trellis.
    x.lineWidth = 8;
    const S = N / 7;
    for (let i = -7; i <= 14; i++) {
      x.beginPath(); x.moveTo(i * S, 0); x.lineTo(i * S + N, N); x.stroke();
      x.beginPath(); x.moveTo(i * S, N); x.lineTo(i * S + N, 0); x.stroke();
    }
    // the little squares, "degenerate from the quadrangle": an upright net over
    // the diagonal one, half as dense
    x.lineWidth = 6;
    for (let i = 0; i <= 7; i++) {
      x.beginPath(); x.moveTo(i * S, 0); x.lineTo(i * S, N); x.stroke();
      x.beginPath(); x.moveTo(0, i * S); x.lineTo(N, i * S); x.stroke();
    }
    // a solid rail top and bottom
    x.fillStyle = '#efe9dc';
    x.fillRect(0, 0, N, 16); x.fillRect(0, N - 16, N, 16);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    this._disp.push(t);
    return (this._latticeTex = t);
  }

  // One fence on one radius, from r0 out to r1, with its gate at the middle and
  // its own climber running over it.
  _cytheraFence(CX, CZ, a, r0, r1, climber, seed) {
    const S = this.style, woodcut = S.key === 'woodcut';
    const H = 2.75;                       // nine feet to the crown of the arch
    const GATE_W = 2.1;                   // seven feet in the opening
    const at = (r) => [CX + Math.cos(a) * r, CZ + Math.sin(a) * r];

    const white = woodcut ? this._stoneMat
      : S.mat({ color: 0xf0ebe0, roughness: 0.42, metalness: 0.02 });
    const red = woodcut ? this._darkStoneMat
      : S.mat({ color: 0xa8503e, roughness: 0.40, metalness: 0.02 });
    white.userData.roll = 'a piece of whitening marble';
    red.userData.roll = 'a piece of reddening marble';
    const openwork = woodcut
      ? S.mat({ tone: 0.06, side: THREE.DoubleSide })
      : new THREE.MeshStandardMaterial({
          map: this._latticeTexture(), color: 0xffffff,
          alphaTest: 0.35, side: THREE.DoubleSide,
          roughness: 0.45, metalness: 0.02,
        });
    if (!woodcut) { openwork.userData.roll = 'a panel of pierced marble'; this._disp.push(openwork); }

    // the run is broken in the middle for the gate
    const mid = (r0 + r1) / 2;
    const bays = [[r0, mid - GATE_W / 2], [mid + GATE_W / 2, r1]];
    let pilaster = 0;
    for (const [b0, b1] of bays) {
      const n = Math.max(1, Math.round((b1 - b0) / 2.4));   // "the measured placing"
      for (let i = 0; i < n; i++) {
        const p0 = b0 + (i / n) * (b1 - b0), p1 = b0 + ((i + 1) / n) * (b1 - b0);
        const [mx, mz] = at((p0 + p1) / 2);
        // the panel of openwork, two inches thick
        const panel = this._m(new THREE.PlaneGeometry(p1 - p0 - 0.16, H - 0.25), openwork,
          mx, (H - 0.25) / 2 + 0.12, mz, { ry: -a, cast: false, receive: false });
        panel.material.map && (panel.material.map.repeat = new THREE.Vector2(1, 1));
        // a pilaster at each joint, white and red alternating
        for (const pr of (i === 0 ? [p0, p1] : [p1])) {
          const [px, pz] = at(pr);
          this._m(new THREE.BoxGeometry(0.19, H, 0.19), pilaster++ % 2 ? red : white,
            px, H / 2, pz, { ry: -a });
          this._m(new THREE.BoxGeometry(0.27, 0.1, 0.27), white, px, H + 0.05, pz, { ry: -a, cast: false });
        }
      }
    }

    // ── the gate: seven feet in the opening, nine to the arch ─────────────
    for (const sr of [-GATE_W / 2, GATE_W / 2]) {
      const [jx, jz] = at(mid + sr);
      this._m(new THREE.BoxGeometry(0.26, H, 0.3), white, jx, H / 2, jz, { ry: -a });
    }
    const [gx, gz] = at(mid);
    // the arching of its topmost curve
    const arch = this._m(new THREE.TorusGeometry(GATE_W / 2, 0.11, 8, 18, Math.PI), white,
      gx, H - GATE_W / 2 + 0.02, gz, { cast: false });
    arch.rotation.y = -a + Math.PI / 2;
    this._m(new THREE.BoxGeometry(GATE_W + 0.7, 0.16, 0.34), white, gx, H + 0.1, gz, { ry: -a, cast: false });

    // ── the climber that serpentines along it ─────────────────────────────
    const stemMat = woodcut ? this._darkStoneMat : S.mat({ color: 0x4a3b26, roughness: 0.94 });
    const leafMat = woodcut ? S.mat({ tone: 0.06, side: THREE.DoubleSide })
      : this._climberLeafMat(climber.leaf);
    const florMat = woodcut ? S.mat({ tone: -0.03 }) : S.mat({ color: climber.flower, roughness: 0.6 });
    const berryMat = climber.second
      ? (woodcut ? S.mat({ tone: -0.01 }) : S.mat({ color: climber.second, roughness: 0.55 }))
      : null;
    // what the roll-up calls them, since each fence carries a different plant
    const low = climber.name.toLowerCase();
    stemMat.userData.roll = `a length of ${low}`;
    florMat.userData.roll = `a flower of ${low}`;
    if (berryMat) berryMat.userData.roll = `a berry of ${low}`;
    const leafGeo = this._climbLeafGeo = this._climbLeafGeo || new THREE.PlaneGeometry(0.3, 0.3);
    const florGeo = this._climbFlorGeo = this._climbFlorGeo || new THREE.SphereGeometry(0.045, 5, 4);
    const rnd = (i, k) => { const v = Math.sin(i * 59.3 + k * 173.1 + seed * 23.7) * 43758.5453; return v - Math.floor(v); };
    const span = r1 - r0;
    const n = Math.round(span * 16);
    for (let i = 0; i < n; i++) {
      const t = rnd(i, 1);
      const r = r0 + t * span;
      if (Math.abs(r - mid) < GATE_W / 2 - 0.1 && rnd(i, 9) > 0.35) continue;   // thinner over the gate
      const [lx, lz] = at(r);
      const off = (rnd(i, 2) - 0.5) * 0.22;
      const y = 0.15 + rnd(i, 3) * (H - 0.2);
      const lf = this._m(leafGeo, leafMat, lx + Math.sin(a) * off, y, lz - Math.cos(a) * off,
        { cast: false, receive: false });
      lf.rotation.set(rnd(i, 4) * Math.PI, -a + (rnd(i, 5) - 0.5) * 1.1, rnd(i, 6) * Math.PI);
      if (rnd(i, 7) < 0.3) {
        this._m(florGeo, florMat, lx + Math.sin(a) * (off + 0.09), y - 0.07, lz - Math.cos(a) * (off + 0.09),
          { cast: false });
      } else if (berryMat && rnd(i, 8) < 0.16) {
        this._m(florGeo, berryMat, lx + Math.sin(a) * (off - 0.09), y - 0.1, lz - Math.cos(a) * (off - 0.09),
          { cast: false });
      }
    }
    // the stems, running the length of the fence
    for (const yy of [0.5, 1.5, 2.4]) {
      const SEGN = Math.max(3, Math.round(span / 1.4));
      for (let i = 0; i < SEGN; i++) {
        const p0 = r0 + (i / SEGN) * span, p1 = r0 + ((i + 1) / SEGN) * span;
        const [ax, az] = at(p0), [bx, bz] = at(p1);
        const d = new THREE.Vector3(bx - ax, (rnd(i, 12) - 0.5) * 0.3, bz - az);
        const seg = this._m(new THREE.CylinderGeometry(0.026, 0.026, d.length(), 5), stemMat,
          (ax + bx) / 2, yy + (rnd(i, 13) - 0.5) * 0.2, (az + bz) / 2, { cast: false });
        seg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
      }
    }

    // a plaque at the gate naming what grows on it, since "so each was varied"
    // is only true if you can tell them apart
    const [px2, pz2] = at(mid + GATE_W / 2 + 0.55);
    this._plaque({ main: climber.name, sub: climber.gloss.toUpperCase() },
      1.5, 0.24, px2, 0.42, pz2, -a + Math.PI / 2, true);

    // you go through the gate, not through the fence
    for (const [b0, b1] of bays) {
      const [wx0, wz0] = at(b0), [wx1, wz1] = at(b1);
      this._wallCol(Math.min(wx0, wx1) - 0.18, Math.max(wx0, wx1) + 0.18,
                    Math.min(wz0, wz1) - 0.18, Math.max(wz0, wz1) + 0.18);
    }
  }

  _climberLeafMat(species) {
    this._climbMats = this._climbMats || {};
    if (this._climbMats[species]) return this._climbMats[species];
    const m = new THREE.MeshStandardMaterial({
      map: this._leafCardTexture(species),
      alphaTest: 0.44, side: THREE.DoubleSide, roughness: 0.88,
    });
    m.userData.roll = `a leaf of ${species}`;
    this._disp.push(m);
    return (this._climbMats[species] = m);
  }

  // ── The Prospect of Cythera ──────────────────────────────────────────────
  //
  // Built 2026-09-08, and it is the only map in this world.
  //
  // The refusal of a minimap is a decided thing here (INTERFACECHOICES.md), and
  // GARDENS.md §1 gives it a better reason than the one first offered: Hunt
  // argues that Poliphilo's *not being able to place himself* is the first
  // garden experience the book stages. "The extreme precision of each scene …
  // isolates that particular space and moment; preternaturally clear and
  // explicit, its larger meaning … can be baffling. Polifilo, like garden
  // visitors generally, is not therefore able to pace or place himself
  // appropriately, either in his movement or his thinking."
  //
  // With one exception, and Hunt names it as the first of the four things
  // Cythera does that nowhere else does: **it is surveyed whole, in advance.**
  // Poliphilo describes the entire topography of the island BEFORE he lands,
  // and only then explores. "Unlike any route Polifilo has hitherto taken,
  // these converging paths lead him down axes along which everything falls into
  // place." Everywhere else in the book he is lost. Here he is oriented.
  //
  // So the world hands you the plan exactly once, at the shore, in the boat,
  // before you land — and never again anywhere else. A rule is only worth
  // having if its exception means something.
  //
  // It is drawn, not diagrammed: a circle in ink and wash, with the twenty
  // divisions the book constructs on p. 294, the three claustri, the river,
  // the six terraces of seven steps, and the theatre at the centre.
  prospectPlan(size = 620) {
    if (this._prospectURL) return this._prospectURL;
    const N = size;
    const c = document.createElement('canvas');
    c.width = c.height = N;
    const x = c.getContext('2d');
    const CX = N / 2, CY = N / 2, R = N * 0.435;
    const INK = '#2a2018', WASH = '#c9b48a', PAPER = '#efe4cc';

    x.fillStyle = PAPER; x.fillRect(0, 0, N, N);
    // the sea
    x.fillStyle = 'rgba(120,150,170,0.20)'; x.fillRect(0, 0, N, N);
    x.fillStyle = PAPER;
    x.beginPath(); x.arc(CX, CY, R * 1.02, 0, Math.PI * 2); x.fill();

    const ring = (r, w, col, dash) => {
      x.beginPath(); x.arc(CX, CY, r, 0, Math.PI * 2);
      x.strokeStyle = col; x.lineWidth = w;
      x.setLineDash(dash || []); x.stroke(); x.setLineDash([]);
    };
    const band = (r0, r1, fill) => {
      x.beginPath();
      x.arc(CX, CY, r1, 0, Math.PI * 2);
      x.arc(CX, CY, r0, 0, Math.PI * 2, true);
      x.fillStyle = fill; x.fill('evenodd');
    };

    // ── the three claustri, each a semitertio of the radius ───────────────
    band(R * 0.66, R, 'rgba(70,96,52,0.34)');        // the bosco
    band(R * 0.36, R * 0.66, 'rgba(150,168,96,0.30)'); // the prati
    band(0, R * 0.36, 'rgba(196,178,120,0.28)');     // the island within the island

    // the river, which roofs itself with a pergola of citrus
    band(R * 0.355, R * 0.40, 'rgba(120,158,182,0.75)');

    // ── the twenty divisions (our translation p. 294) ─────────────────────
    // "…this will be the division of the ten-angled figure. These twenty
    // divisions were, by most noble fences, diversely latticed…"
    for (let k = 0; k < 20; k++) {
      const a = k * Math.PI / 10 - Math.PI / 2;
      x.beginPath();
      x.moveTo(CX + Math.cos(a) * R * 0.40, CY + Math.sin(a) * R * 0.40);
      x.lineTo(CX + Math.cos(a) * R, CY + Math.sin(a) * R);
      x.strokeStyle = k % 5 === 0 ? INK : 'rgba(42,32,24,0.45)';
      x.lineWidth = k % 5 === 0 ? 2.2 : 1.1;
      x.stroke();
      // the gate in the middle of each fence
      const g = R * 0.72;
      const ga = a + Math.PI / 20;
      x.beginPath();
      x.arc(CX + Math.cos(ga) * g, CY + Math.sin(ga) * g, 2.6, 0, Math.PI * 2);
      x.fillStyle = PAPER; x.fill();
      x.strokeStyle = INK; x.lineWidth = 1; x.stroke();
    }

    // ── the six terraces of seven steps, inside the river ─────────────────
    for (let t = 1; t <= 6; t++) ring(R * 0.34 - t * R * 0.032, 1, 'rgba(42,32,24,0.42)');
    // the ring roads
    ring(R, 2.4, INK);
    ring(R * 0.66, 1.6, 'rgba(42,32,24,0.7)');
    ring(R * 0.40, 1.6, 'rgba(42,32,24,0.7)');

    // ── the theatre, and the fountain at its heart ────────────────────────
    x.beginPath(); x.arc(CX, CY, R * 0.115, 0, Math.PI * 2);
    x.fillStyle = 'rgba(239,228,204,0.95)'; x.fill();
    x.strokeStyle = INK; x.lineWidth = 2; x.stroke();
    ring(R * 0.085, 1, INK); ring(R * 0.055, 1, INK);
    x.beginPath(); x.arc(CX, CY, R * 0.022, 0, Math.PI * 2);
    x.fillStyle = INK; x.fill();

    // ── lettering, in the plates' hand ────────────────────────────────────
    x.textAlign = 'center'; x.fillStyle = INK;
    const label = (txt, r, a, px) => {
      x.save();
      x.translate(CX + Math.cos(a) * r, CY + Math.sin(a) * r);
      x.font = `${px}px Georgia, serif`;
      x.fillStyle = 'rgba(239,228,204,0.85)';
      const w = x.measureText(txt).width;
      x.fillRect(-w / 2 - 4, -px * 0.78, w + 8, px * 1.05);
      x.fillStyle = INK;
      x.fillText(txt, 0, 0);
      x.restore();
    };
    // The title sits outside the circle -- the plan is 87% of the plate and
    // there is no room inside it for anything but the four names.
    x.font = `${Math.round(N * 0.034)}px Georgia, serif`;
    x.fillText('CYTHERA', CX, N * 0.040);
    x.font = `italic ${Math.round(N * 0.0185)}px Georgia, serif`;
    x.fillStyle = 'rgba(42,32,24,0.72)';
    x.fillText('three miliaria about  ·  the twenty divisions  ·  our p. 294', CX, N * 0.058);

    // Four names, each on its own bearing so none can collide with another.
    const F = Math.round(N * 0.021);
    label('IL BOSCO',     R * 0.84, -Math.PI * 0.72, F);   // upper left
    label('I PRATI',      R * 0.53, -Math.PI * 0.28, F);   // upper right
    label('THE RIVER',    R * 0.375, Math.PI * 0.28, F);   // lower right
    label('THE TERRACES', R * 0.225, Math.PI * 0.78, F);   // lower left
    label('THE THEATRE',  R * 0.115 + N * 0.038, Math.PI / 2, F);

    // the compass of the crossing: you come from the north, over the water
    x.fillStyle = INK;
    x.font = `${Math.round(N * 0.024)}px Georgia, serif`;
    x.fillText('▲', CX, N * 0.975 - N * 0.030);
    x.font = `italic ${Math.round(N * 0.0175)}px Georgia, serif`;
    x.fillStyle = 'rgba(42,32,24,0.75)';
    x.fillText('you come this way', CX, N * 0.985);

    this._prospectURL = c.toDataURL('image/png');
    return this._prospectURL;
  }

  // A flight of seven steps at one crossroad, between two radii and two
  // heights. Seven because the book says seven, and because seven is the count
  // of the Temple of Venus's porphyry steps too -- the number is not decorative
  // in this book. `r0` is the outer radius (where you start), `r1` the inner.
  _cytheraSteps(CX, CZ, a, r0, r1, y0, y1, n = 7) {
    const S = this.style;
    const stone = S.key === 'woodcut' ? this._stoneMat
      : S.mat({ color: 0xcfc0a2, roughness: 0.72 });
    stone.userData.roll = 'a step';
    const W = 3.6;                              // wide enough for a chariot
    const tx = -Math.sin(a), tz = Math.cos(a);  // the tangent, across the flight
    const dr = (r1 - r0) / n, dy = (y1 - y0) / n;
    for (let i = 0; i < n; i++) {
      const r = r0 + dr * (i + 0.5);
      const y = y0 + dy * (i + 1);
      const x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r;
      // the tread, and the riser under it: a step you can see the edge of
      this._m(new THREE.BoxGeometry(W, 0.06, Math.abs(dr) * 1.08), stone, x, y, z,
        { ry: -a, cast: false });
      this._m(new THREE.BoxGeometry(W, Math.abs(dy) + 0.06, 0.07), stone,
        x + Math.cos(a) * Math.abs(dr) / 2, y - Math.abs(dy) / 2, z + Math.sin(a) * Math.abs(dr) / 2,
        { ry: -a, cast: false });
      // and the floor for each tread, so the walk actually rises with it
      this.walker.floors.push({
        kind: 'ring', cx: CX, cz: CZ,
        r0: Math.min(r0 + dr * i, r0 + dr * (i + 1)),
        r1: Math.max(r0 + dr * i, r0 + dr * (i + 1)),
        y: Math.max(0, y),
      });
    }
    // cheeks either side, so the flight reads as cut into the terrace
    for (const sgn of [-1, 1]) {
      const mr = (r0 + r1) / 2;
      this._m(new THREE.BoxGeometry(0.22, Math.abs(y1 - y0) + 0.2, Math.abs(r1 - r0)), stone,
        CX + Math.cos(a) * mr + tx * sgn * (W / 2 + 0.11),
        Math.min(y0, y1) + (Math.abs(y1 - y0) + 0.2) / 2 - 0.1,
        CZ + Math.sin(a) * mr + tz * sgn * (W / 2 + 0.11),
        { ry: -a, cast: false });
    }
  }

  // "…ornate gates for the passage of the triumphal chariots." A gate wide
  // enough and high enough for a car and its six beasts, standing on the ridge
  // where the flight from the bank arrives.
  _chariotGate(CX, CZ, a, r, y) {
    const S = this.style, woodcut = S.key === 'woodcut';
    const stone = woodcut ? this._stoneMat : S.mat({ color: 0xe6dcc4, roughness: 0.5 });
    const gold = woodcut ? this._darkStoneMat
      : S.glowMat ? S.glowMat({ color: 0xc8a040, emissive: 0x3a2a08, emissiveIntensity: 0.2 })
      : S.mat({ color: 0xc8a040, roughness: 0.35, metalness: 0.7 });
    const W = 4.4, H = 4.6;
    const tx = -Math.sin(a), tz = Math.cos(a);
    const x = CX + Math.cos(a) * r, z = CZ + Math.sin(a) * r;
    // 2026-09-08: the posts are ashlar and the arch is voussoirs, so a gate can
    // be brought down — by undermining a post, or by taking one wedge out of the
    // ring, which is quicker and is how it is really done.
    const posts = [];
    for (const sgn of [-1, 1]) {
      const px = x + tx * sgn * W / 2, pz = z + tz * sgn * W / 2;
      const col = this._circleCol(px, pz, 0.5);
      const post = this._ashlar(px, y, pz, 0.62, H, 0.62, stone,
        { ry: -a, course: 0.58, block: 0.62, name: 'a post of the chariot gate' });
      post.col = col;
      posts.push(post);
      this._m(new THREE.BoxGeometry(0.86, 0.18, 0.86), stone, px, y + H + 0.09, pz, { ry: -a, cast: false });
      // a gold ball on each, as the plates put on every gate-post they draw
      this._m(new THREE.SphereGeometry(0.24, 12, 10), gold, px, y + H + 0.32, pz, { outline: true });
    }
    // the arch over, and the tablet it carries
    const arch = this._arch(x, y + H, z, W, 0.48, stone,
      { ry: -a + Math.PI / 2, n: 13, thick: 0.4, name: 'the arch of the chariot gate',
        piers: posts });
    const tablet = this._m(new THREE.BoxGeometry(W + 1.3, 0.42, 0.5), stone, x, y + H + W / 2 + 0.2, z,
      { ry: -a, cast: false });
    // the lettering goes down with the stone it is cut in, which it did not on
    // the first try: AD CYTHERAM hung in the air over the wreck of its own gate
    const legend = this._plaque({ main: 'AD CYTHERAM', sub: 'FOR THE PASSAGE OF THE TRIVMPHALL CHARIOTS' },
      2.4, 0.34, x, y + H + W / 2 + 0.2, z + 0.28 * Math.sign(Math.cos(a) || 1), -a + Math.PI / 2, true);
    this.masonry.carry(arch, [tablet, legend]);
  }

  // ── The roll-up census ───────────────────────────────────────────────────
  //
  // One entry per thing you could conceivably pick up. `merged` is the lump it
  // was folded into and [start, count) its vertices in that lump; a standalone
  // mesh has merged === null and is simply detached when taken.
  //
  // Only built when the scene is asked for it (`{ rollup: true }`), because the
  // census is a few thousand objects and the walk has no use for it.
  _census(mesh, merged, start, count) {
    if (!this._wantRoll) return;
    const g = mesh.geometry;
    if (!g || !g.attributes || !g.attributes.position) return;
    if (!g.boundingSphere) g.computeBoundingSphere();
    if (!g.boundingBox) g.computeBoundingBox();
    const bs = g.boundingSphere, bb = g.boundingBox;
    if (!bs || !bb) return;
    // How big a thing IS, for the purpose of being eaten. Not the bounding
    // sphere: a leaf card is a 95 cm square of nothing, and its sphere radius
    // is 67 cm, which would put a leaf later in the meal than a pebble the size
    // of a plum. The mean half-extent of the bounding box behaves: a leaf comes
    // out at 32 cm, a cube at half its side, a column at 58, a pebble at 5.
    const sc = Math.max(Math.abs(mesh.scale.x), Math.abs(mesh.scale.y), Math.abs(mesh.scale.z));
    const dx = (bb.max.x - bb.min.x) * Math.abs(mesh.scale.x);
    const dy = (bb.max.y - bb.min.y) * Math.abs(mesh.scale.y);
    const dz = (bb.max.z - bb.min.z) * Math.abs(mesh.scale.z);
    const r = (dx + dy + dz) / 6;
    // Anything bigger than this is architecture: the sea, the ground itself,
    // and whatever is still modelled as one block. You roll past those.
    //
    // But keep a LIST of them (2026-09-08). A thing over six metres that is not
    // the ground or the water is a monolith — a building that was not built out
    // of stones — and this is the only place in the code that knows. It is how
    // the ashlar work finds its next target instead of guessing: see
    // `window._hp.state.activeScene._monoliths` and NEXTSTEPS.md 0g.
    const c = new THREE.Vector3().copy(bs.center).applyMatrix4(mesh.matrixWorld);
    const tooBig = r > 6 || bs.radius * sc > 14;   // long thin things are architecture too
    if (tooBig) {
      (this._monoliths = this._monoliths || []).push({
        r: +r.toFixed(2), span: +(bs.radius * sc).toFixed(1), type: g.type,
        size: [+dx.toFixed(1), +dy.toFixed(1), +dz.toFixed(1)],
        at: [+c.x.toFixed(1), +c.y.toFixed(1), +c.z.toFixed(1)],
        near: this._nearestStationName(mesh) || '(nowhere)',
        mat: mesh.material && mesh.material.color ? '#' + mesh.material.color.getHexString() : '',
      });
      return;
    }
    if (r <= 0.004) return;
    const e = {
      name: this._rollName(mesh, r), r, c,
      src: mesh,                                 // how Masonry.resolve finds it
      group: (mesh.userData && mesh.userData.rollGroup) || null,
      mesh: merged ? null : mesh, merged, start, count,
      mat: mesh.material, geo: merged ? null : null,
      taken: false,
    };
    this.rollables.push(e);
    if (e.group) {
      const g = (this._rollGroups = this._rollGroups || new Map());
      let b = g.get(e.group);
      if (!b) g.set(e.group, b = []);
      b.push(e);
    }
  }

  // A cup is a bowl and a foot; a lute is a body, a soundboard, a neck and a
  // pegbox. The census sees meshes, so without this the ball would eat the
  // soundboard and leave the neck lying on the grass, and the BITE test would
  // measure the longest stick instead of the instrument.
  //
  // So: every mesh of a littered object carries the same `rollGroup` (see
  // systems/Litter.js), and afterwards each group is given ONE size and ONE
  // centre — the union of its parts — which every member then shares. The ball
  // meets the object, and takeRollable hands back the whole of it.
  _resolveRollGroups() {
    if (!this._rollGroups) return 0;
    const min = new THREE.Vector3(), max = new THREE.Vector3(), v = new THREE.Vector3();
    for (const [, parts] of this._rollGroups) {
      min.set(Infinity, Infinity, Infinity);
      max.set(-Infinity, -Infinity, -Infinity);
      for (const e of parts) {
        const src = e.src, g = src.geometry;
        if (!g.boundingBox) g.computeBoundingBox();
        const bb = g.boundingBox;
        for (const [cx, cy, cz] of [[bb.min.x, bb.min.y, bb.min.z], [bb.max.x, bb.max.y, bb.max.z],
                                    [bb.min.x, bb.max.y, bb.max.z], [bb.max.x, bb.min.y, bb.min.z]]) {
          v.set(cx, cy, cz).applyMatrix4(src.matrixWorld);
          min.min(v); max.max(v);
        }
      }
      const r = ((max.x - min.x) + (max.y - min.y) + (max.z - min.z)) / 6;
      v.addVectors(min, max).multiplyScalar(0.5);
      for (const e of parts) { e.r = r; e.c.copy(v); e.parts = parts; }
    }
    return this._rollGroups.size;
  }

  // What a thing is called. Katamari's whole charm is that the game knows the
  // name of every object it eats, so this is not decoration -- it is the mode.
  // Materials carry their own name where one is known (set at creation); the
  // rest is read off the geometry and its size, and the nearest wonder supplies
  // the "of" clause.
  _rollName(mesh, r) {
    const m = mesh.material;
    // The MESH's own name wins where it has one: a voussoir and its keystone are
    // cut from the same stone and share a material, so only the mesh can say
    // which is which. Otherwise the material's name, set where the thing is made.
    let base = (mesh.userData && mesh.userData.roll)
      || (m && m.userData && m.userData.roll) || null;
    if (!base) {
      const t = mesh.geometry.type;
      if (t === 'SphereGeometry')      base = r < 0.07 ? 'a berry' : r < 0.2 ? 'a fruit' : r < 0.6 ? 'a ball of clipped box' : 'a mass of leaves';
      else if (t === 'PlaneGeometry')  base = r < 0.3 ? 'a leaf' : 'a painted panel';
      else if (t === 'CylinderGeometry') base = r < 0.15 ? 'a little baluster' : r < 0.8 ? 'a column drum' : 'a column';
      else if (t === 'BoxGeometry')    base = r < 0.2 ? 'a tile' : r < 0.42 ? 'a brick' : 'a block of masonry';
      else if (t === 'ConeGeometry')   base = r < 0.4 ? 'a finial' : 'a spire';
      else if (t === 'TorusGeometry') {
        // it was calling every arch in the world a ring of gold
        const c = m && m.color ? m.color : null;
        const goldish = c && c.r > 0.55 && c.g > 0.42 && c.b < 0.42;
        base = goldish ? 'a ring of gold' : r < 0.4 ? 'a hoop' : 'an arch';
      }
      else if (t === 'DodecahedronGeometry') base = r < 0.12 ? 'a pebble' : r < 0.6 ? 'a stone' : 'a boulder';
      else if (t === 'RingGeometry')   base = 'a bed of flowers';
      else base = 'a piece of the dream';
    }
    const st = this._nearestStationName(mesh);
    return st ? `${base}, from ${st}` : base;
  }

  _nearestStationName(mesh) {
    const p = new THREE.Vector3().setFromMatrixPosition(mesh.matrixWorld);
    let best = null, bd = 13 * 13;
    for (const st of HP_STATIONS) {
      const dx = p.x - st.pos[0], dz = p.z - st.pos[1];
      const d = dx * dx + dz * dz;
      if (d < bd) { bd = d; best = st.name; }
    }
    return best;
  }

  // Take a thing out of the world and hand back a little mesh of its own, in
  // the ball's local space. The original stops existing: a standalone mesh is
  // detached, and a merged one has its vertex range collapsed to a point, which
  // costs one small write into the buffer and no draw calls at all.
  takeRollable(e) {
    if (e.taken) return null;
    // A littered object comes off whole: its parts were censused together and
    // they leave together, in one holder, keeping the shape they had.
    if (e.parts && e.parts.length > 1) {
      const g = new THREE.Group();
      for (const q of e.parts) {
        if (q.taken) continue;
        q.taken = true;
        const piece = this._takeOne(q, e.c);
        if (piece) g.add(piece);
      }
      return g.children.length ? g : null;
    }
    e.taken = true;
    return this._takeOne(e, e.c);
  }

  _takeOne(e, centre) {
    // …and the building it was part of finds out. Everything above the stone
    // settles into the gap; take enough and the whole thing comes down.
    if (e.course) this.masonry.take(e);
    const c = centre || e.c;
    if (e.mesh) {
      // Re-centre on the group's centre, which for a single piece IS its own.
      e.mesh.removeFromParent();
      e.mesh.position.sub(c);
      const g = new THREE.Group();
      g.add(e.mesh);
      return g;
    }
    if (!e.merged || !e.count) return null;
    const src = e.merged.geometry;
    const out = new THREE.BufferGeometry();
    for (const key of ['position', 'normal', 'uv']) {
      const a = src.getAttribute(key);
      if (!a) continue;
      const it = a.itemSize;
      const arr = new Float32Array(e.count * it);
      for (let i = 0; i < e.count * it; i++) arr[i] = a.array[e.start * it + i];
      if (key === 'position') {                       // centre it on the object
        for (let i = 0; i < e.count; i++) {
          arr[i * 3] -= c.x; arr[i * 3 + 1] -= c.y; arr[i * 3 + 2] -= c.z;
        }
      }
      out.setAttribute(key, new THREE.BufferAttribute(arr, it));
    }
    // The merged buffer keeps its index; collapsing this object's positions to a
    // single point makes every one of its triangles degenerate, so it vanishes.
    //
    // Collapse to its OWN first vertex, not to the origin: a point already
    // inside the buffer's bounds leaves the bounding sphere still valid, and
    // three.js therefore does not recompute it. Collapsing to the origin (and
    // nulling the sphere, which the first version did) made three.js re-measure
    // a hundred-thousand-vertex buffer on every single mouthful -- fifteen
    // thousand times in a full run.
    const pa = src.getAttribute('position');
    const ax = pa.array[e.start * 3], ay = pa.array[e.start * 3 + 1], az = pa.array[e.start * 3 + 2];
    for (let i = 0; i < e.count; i++) {
      pa.array[(e.start + i) * 3] = ax;
      pa.array[(e.start + i) * 3 + 1] = ay;
      pa.array[(e.start + i) * 3 + 2] = az;
    }
    pa.needsUpdate = true;
    const mesh = new THREE.Mesh(out, e.mat);
    mesh.castShadow = false; mesh.receiveShadow = false;
    this._disp.push(out);
    return mesh;
  }

  // ── The Three Doors (f.119) — a wall you actually walk through ───────────

  _buildDoorsWall() {
    const S = this.style;
    const Z = 12, WALL_H = 4.8;

    // Dallington p. 192–193 (corpus ll. 8100–8125): after the bridge "a rocky
    // and stony place, where high & craggie Mountaines lifted vp themselues …
    // full of broken and nybled stones, mounting vppe into the ayre, as high as
    // a man might looke to, and without any greene grasse or hearbe, and there
    // were hewen out the three gates, in the verie rocke it selfe, euen as
    // plaine as might be. A worke verie auncient and past record, in a very
    // displeasant seate." The titles over them "in Letters Ionic, Romaine,
    // Hebrew and Arabic"; the right-hand gate's leaves "couered ouer with
    // greene mosse". Plate #37 draws exactly that: doorways in a mountainside.
    //
    // The first build was a classical wall with an entablature and Corinthian
    // columns — the opposite of "as plaine as might be". This is the rock.
    const woodcut = S.key === 'woodcut';
    const rock = woodcut ? S.mat({ tone: 0.14 }) : S.mat({ color: 0x6e6658, roughness: 0.98 });
    if (!woodcut) this._dress(rock, this._surfaceTexture({ base: '#6e6658', dark: '#2e2a22', light: '#a49a86', blobs: 90, speckle: 5200, veins: 10, repeat: 3 }), 0.6);
    const rockDk = woodcut ? S.mat({ tone: 0.26 }) : S.mat({ color: 0x4a443a, roughness: 0.98 });
    const moss = woodcut ? S.mat({ tone: 0.2 }) : S.mat({ color: 0x4a6a2a, roughness: 0.95 });
    const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };

    // the mountain: a bank of boulders along the line, rising behind and above
    // the gates to "as high as a man might looke to", bare of any green
    const gateGap = (x) => DOORS.some(d => Math.abs(x - d.x) < d.w / 2 + 0.9);
    this._m(new THREE.BoxGeometry(30, 0.08, 9), rockDk, 0, 0.04, Z - 1.5, { cast: false });   // the stony ground
    for (let i = 0; i < 70; i++) {
      const x = -15 + rnd(i, 1) * 30;
      const depth = rnd(i, 2);                          // 0 = the face, 1 = the back
      const z = Z - 1.4 - depth * 6.5;
      const r = 0.9 + rnd(i, 3) * 1.4 + depth * 1.4;
      const y = r * 0.55 + depth * 3.2 + rnd(i, 4) * 1.6;
      if (depth < 0.55 && gateGap(x)) continue;         // keep the gates clear, and their approach
      // PolyhedronGeometry is non-indexed and the draw-call merger wants every
      // geometry in a bucket alike, so the boulder gets a trivial index
      const bg = new THREE.DodecahedronGeometry(r, 0);
      bg.setIndex(Array.from({ length: bg.attributes.position.count }, (_, k) => k));
      const b = this._m(bg, i % 3 ? rock : rockDk, x, y, z, { outline: true });
      b.rotation.set(rnd(i, 5) * 3, rnd(i, 6) * 3, rnd(i, 7) * 3);
      b.scale.set(1 + rnd(i, 8) * 0.6, 0.7 + rnd(i, 9) * 0.5, 1 + rnd(i, 10) * 0.4);
    }
    // the face itself at the gates: a straight-cut rock front the doors are
    // hewn from, with rock piers between the openings
    const edges = [-14, ...DOORS.flatMap(d => [d.x - d.w / 2 - 0.15, d.x + d.w / 2 + 0.15]), 14];
    for (let i = 0; i < edges.length; i += 2) {
      const a = edges[i], b = edges[i + 1];
      const face = this._m(new THREE.BoxGeometry(b - a, WALL_H + 1.4, 1.6), rock, (a + b) / 2, (WALL_H + 1.4) / 2, Z - 0.3, { outline: true });
      face.rotation.z = (rnd(i, 11) - 0.5) * 0.02;
      this._wallCol(a, b, Z - 1.1, Z + 0.5);
    }
    DOORS.forEach((d, i) => {
      // the rock over the opening, and the rough reveals — "as plaine as might be"
      const over = WALL_H + 1.4 - d.h;
      this._m(new THREE.BoxGeometry(d.w + 0.3, over, 1.6), rock, d.x, d.h + over / 2, Z - 0.3, { outline: true });
      for (const sx of [-1, 1]) {
        this._m(new THREE.BoxGeometry(0.22, d.h, 1.7), rockDk, d.x + sx * (d.w / 2 + 0.04), d.h / 2, Z - 0.3, { cast: false });
      }
      this._m(new THREE.BoxGeometry(d.w + 0.4, 0.22, 1.7), rockDk, d.x, d.h + 0.1, Z - 0.3, { cast: false });
      // the leaves of the gate, and on the right-hand one the green moss
      const leafM = woodcut ? S.mat({ tone: 0.3 }) : S.mat({ color: 0x3a2e22, roughness: 0.9 });
      for (const sx of [-1, 1]) {
        const lf = this._m(new THREE.BoxGeometry(d.w / 2 - 0.05, d.h - 0.15, 0.1), leafM, d.x + sx * (d.w / 4 + 0.02), (d.h - 0.15) / 2, Z - 1.05, { cast: false });
        lf.rotation.y = sx * 1.25;
        lf.position.x = d.x + sx * (d.w / 2 - 0.05);
        lf.position.z = Z - 1.05 - Math.sin(1.25) * (d.w / 4);
        if (i === 0) for (let k = 0; k < 5; k++) {
          this._m(new THREE.SphereGeometry(0.12 + rnd(k, 12) * 0.1, 7, 6), moss, lf.position.x, 0.3 + rnd(k, 13) * (d.h - 0.6), lf.position.z, { cast: false }).scale.set(1, 1.4, 0.4);
        }
      }
      // the title over the gate, as the book has it: Greek and Latin here, and
      // the plate's Hebrew and Arabic named rather than invented
      this._plaque({ main: d.greek, sub: d.title.toUpperCase() + ' · ALSO IN HEBREW AND ARABIC ON THE PLATE', glyphColor: '#' + d.color.toString(16).padStart(6, '0') },
        2.4, 0.6, d.x, d.h + 0.72, Z + 0.52, 0, true);
      this._plaque({ main: d.sub.split(' · ')[1] || d.sub, sub: 'KEPT BY ' + d.keeper.toUpperCase(), glyphColor: '#' + d.color.toString(16).padStart(6, '0') },
        2.0, 0.4, d.x, d.h + 1.22, Z + 0.52, 0, true);

      const pm = S.portalMat(d.color);
      if (pm) {
        this._m(new THREE.PlaneGeometry(d.w, d.h - 0.1), pm, d.x, (d.h - 0.1) / 2, Z - 0.3, { cast: false, receive: false });
        this._portals.push({ mat: pm, base: pm.opacity, phase: i * 1.3 });
        const pl = S.pointLight(d.color, 1.2, 6);
        if (pl) { pl.position.set(d.x, 1.4, Z + 1.0); this.scene.add(pl); this._pulses.push({ pl, base: 1.2, phase: i * 1.3 }); }
      }
    });
    this._plaque({ main: 'HEWEN OVT IN THE VERIE ROCKE', sub: 'A WORKE VERIE AVNCIENT AND PAST RECORD, IN A VERY DISPLEASANT SEATE · CH. XII' },
      2.6, 0.4, 0, 0.7, Z + 2.4, 0, true);

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
  // A column, built the way a column is built: out of stones.
  //
  // 2026-09-08, at Ted's asking. The shaft used to be one cylinder, which meant
  // the roll-up saw a single 58 cm object and the world's architecture was a set
  // of monoliths. It is now a stack of DRUMS — six or seven of them on a garden
  // column, each about twenty centimetres by the eating measure — over the four
  // stones of the attic base, under the necking and the capital. Twelve or more
  // separate pieces, every one of them holding up everything above it.
  //
  // That is not a concession to the game. Classical columns really are stacked
  // drums, dowelled at the centre, which is exactly why a ruined one lies on the
  // ground in a row like fallen cheeses — and why, in Roll Up, one does too.
  // See systems/Masonry.js for what happens when you take a drum out.
  _column(x, z, h, { order = 'ionic', r = null, parent = null, mat = null, flutes = 16 } = {}) {
    const M = mat || this._stoneMat;
    const rad = r || h * 0.055;
    const g = parent || this.scene;
    const at = (geo, yy, o = {}) => this._m(geo, M, x, yy, z, { parent: g, ...o });
    // Where this column actually stands. The masonry reasons in world space, so
    // an untilted parent group is just an offset and is folded in; a ROTATED one
    // is not, and those columns get their stones but no structural bookkeeping —
    // which is right, since a column on a moving triumphal car should not be
    // able to collapse. (Folding the offset in also fixes a quiet old bug: the
    // three-storey colonnade of the Area builds each column at a local (0,0)
    // inside a placed group, so every one of them was pushing its collider onto
    // the world origin, out in the middle of the piazza.)
    const flat = !parent || (!parent.rotation.x && !parent.rotation.y && !parent.rotation.z);
    const wx = flat && parent ? x + parent.position.x : x;
    const wz = flat && parent ? z + parent.position.z : z;
    const gy = flat && parent ? parent.position.y : 0;
    const col = this._circleCol(wx, wz, rad * 1.6);
    const st = flat
      ? this.masonry.structure({ x: wx, z: wz, r: rad, ground: gy, col, name: 'a column' })
      : null;
    const course = (y, hh, ...meshes) => this.masonry.course(st, y + gy, hh, meshes);

    // plinth, torus, scotia, torus — the attic base, four stones
    course(0, rad * 0.5,
      at(new THREE.BoxGeometry(rad * 3.1, rad * 0.5, rad * 3.1), rad * 0.25));
    course(rad * 0.5, rad * 0.32,
      at(new THREE.TorusGeometry(rad * 1.22, rad * 0.2, 6, 16), rad * 0.66, { rx: Math.PI / 2 }));
    course(rad * 0.78, rad * 0.3,
      at(new THREE.CylinderGeometry(rad * 1.1, rad * 1.25, rad * 0.3, 14), rad * 0.92));
    course(rad * 1.02, rad * 0.28,
      at(new THREE.TorusGeometry(rad * 1.1, rad * 0.14, 6, 16), rad * 1.16, { rx: Math.PI / 2 }));

    // ── the shaft, in drums ──────────────────────────────────────────────
    // The entasis is kept: the shaft still tapers from `rad` at the foot to
    // 0.86 of it under the necking, only now the taper is shared out across the
    // drums, each drum picking up exactly where the one below left off. Drum
    // height is about two diameters, which is roughly what the quarries cut.
    const y0 = rad * 1.3, sh = h - y0 - rad * 1.5;
    const nd = Math.max(3, Math.min(9, Math.round(sh / (rad * 2.2))));
    const dh = sh / nd;
    const rAt = (t) => rad * (1 - 0.14 * t);          // foot to necking
    const cut = flutes && this.style.key !== 'woodcut';
    for (let d = 0; d < nd; d++) {
      const t0 = d / nd, t1 = (d + 1) / nd;
      const yb = y0 + d * dh;
      const stones = [
        at(new THREE.CylinderGeometry(rAt(t1), rAt(t0), dh * 0.995, 18), yb + dh / 2,
           { outline: d === nd - 1 }),
      ];
      // the flutes, cut drum by drum so a drum comes away with its own fluting
      if (cut) {
        for (let i = 0; i < flutes; i++) {
          const a = (i / flutes) * Math.PI * 2;
          const fr = rAt((t0 + t1) / 2) * 1.08;
          stones.push(this._m(new THREE.CylinderGeometry(rad * 0.085, rad * 0.1, dh * 0.99, 5),
            this._darkStoneMat, x + Math.cos(a) * fr, yb + dh / 2, z + Math.sin(a) * fr,
            { parent: g, cast: false, receive: false }));
        }
      }
      course(yb, dh, ...stones);
    }
    // necking
    course(y0 + sh, rad * 0.2,
      at(new THREE.TorusGeometry(rad * 0.88, rad * 0.09, 6, 16), y0 + sh + rad * 0.05, { rx: Math.PI / 2 }));

    // ── the capital, and the abacus over it: two more courses ───────────
    const cy = y0 + sh + rad * 0.1;
    if (order === 'doric') {
      course(cy, rad * 0.45,
        at(new THREE.CylinderGeometry(rad * 1.25, rad * 0.9, rad * 0.45, 16), cy + rad * 0.22));
      course(cy + rad * 0.45, rad * 0.28,
        at(new THREE.BoxGeometry(rad * 2.7, rad * 0.28, rad * 2.7), cy + rad * 0.58));
    } else if (order === 'corinthian') {
      const bell = [at(new THREE.CylinderGeometry(rad * 1.25, rad * 0.88, rad * 1.15, 14), cy + rad * 0.58)];
      for (let k = 0; k < 8; k++) {                       // two tiers of acanthus
        const a = (k / 8) * Math.PI * 2;
        for (const [tier, rr, hh] of [[0, 1.02, 0.34], [1, 1.2, 0.78]]) {
          const lf = this._m(new THREE.ConeGeometry(rad * 0.3, rad * 0.62, 5), M,
            x + Math.cos(a + tier * 0.4) * rad * rr, cy + rad * hh, z + Math.sin(a + tier * 0.4) * rad * rr,
            { parent: g, cast: false });
          lf.rotation.set(Math.sin(a) * 0.55, -a, -Math.cos(a) * 0.55);
          bell.push(lf);
        }
      }
      course(cy, rad * 1.15, ...bell);
      course(cy + rad * 1.15, rad * 0.3,
        at(new THREE.BoxGeometry(rad * 2.9, rad * 0.3, rad * 2.9), cy + rad * 1.3));
    } else {                                              // ionic: a pair of volutes
      const vol = [at(new THREE.CylinderGeometry(rad * 1.1, rad * 0.9, rad * 0.3, 16), cy + rad * 0.15)];
      for (const sx of [-1, 1]) {
        const v = this._m(new THREE.TorusGeometry(rad * 0.42, rad * 0.17, 7, 16), M,
          x + sx * rad * 0.92, cy + rad * 0.5, z, { parent: g, ry: Math.PI / 2 });
        v.scale.set(1, 1, 0.62);
        vol.push(v);
      }
      course(cy, rad * 0.7, ...vol);
      course(cy + rad * 0.7, rad * 0.24,
        at(new THREE.BoxGeometry(rad * 2.5, rad * 0.24, rad * 1.9), cy + rad * 0.82));
    }
    return st || h;
  }

  // Architrave (three fasciae), frieze, and a cornice carrying dentils.
  // Architrave (three fasciae), frieze, and a cornice carrying dentils — and it
  // is HELD UP. Every column standing under this rectangle takes a share of the
  // load, so shortening any one of them drops the whole entablature by that
  // much, and bringing any one of them down brings the entablature down with it.
  // A lintel bearing on four columns is only as sound as its weakest.
  _entablature(cx, cy, cz, w, d, { parent = null, ry = 0, dentils = true, mat = null } = {}) {
    const M = mat || this._stoneMat;
    const g = parent || this.scene;
    const load = [];
    const at = (geo, mm, yy, o = {}) => {
      const m = this._m(geo, mm, cx, yy, cz, { parent: g, ry, cast: false, ...o });
      load.push(m);
      return m;
    };
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
        load.push(this._m(new THREE.BoxGeometry(w / n * 0.5, 0.14, d + 0.2), M, px, cy + 0.92, pz,
          { parent: g, ry, cast: false }));
      }
    }
    // cornice, and the corona that throws the shadow line
    at(new THREE.BoxGeometry(w + 0.34, 0.16, d + 0.34), M, cy + 1.07);
    at(new THREE.BoxGeometry(w + 0.44, 0.1, d + 0.44), M, cy + 1.2);

    // …and now find out who is carrying it. Only when it sits in the world
    // unrotated, for the same reason a column inside a moving group gets no
    // bookkeeping: the masonry reasons in world space.
    const flat = !parent || (!parent.rotation.x && !parent.rotation.y && !parent.rotation.z);
    if (flat) {
      const ox = parent ? parent.position.x : 0, oz = parent ? parent.position.z : 0;
      const oy = parent ? parent.position.y : 0;
      const x0 = cx + ox, z0 = cz + oz;
      // A ring of them, as at the Temple of Venus, is set on a radius; a
      // rectangular query in world axes would be wrong for seven bays out of
      // eight, so a rotated entablature asks by RADIUS instead.
      const props = (ry
        ? this.masonry.near(x0, z0, Math.max(w, d) / 2 + 0.6)
        : this.masonry.under(x0 - w / 2 - 0.5, x0 + w / 2 + 0.5,
                             z0 - d / 2 - 0.5, z0 + d / 2 + 0.5))
        // Only the columns whose tops are near this entablature's soffit: the
        // Area stacks three orders one above another at the same x,z, and the
        // second storey must not be found carrying the ground floor's architrave.
        .filter(st => Math.abs(st.ground - oy) < 1.2 || (st.courses.length
                 && Math.abs(st.courses[st.courses.length - 1].y - (cy + oy)) < 1.4));
      if (props.length) {
        const c = this.masonry.carry(props[0], load);
        for (let i = 1; i < props.length; i++) this.masonry.alsoCarriedBy(c, props[i]);
      }
    }
    return cy + 1.25;
  }

  // A wall or pier of ASHLAR — courses of dressed blocks with the joints broken,
  // instead of one box pretending to be stone.
  //
  // 2026-09-08, at Ted's asking, and the same argument as the column drums: a
  // building the roll-up can only see as one six-metre monolith is not a
  // building, it is a prop. Courses about 80 cm high and blocks about 1.2 m
  // long put every stone at roughly half a metre by the eating measure, which is
  // a stone a grown ball can lift and a small one cannot — and alternate courses
  // are offset by half a block, because a wall whose joints line up vertically
  // is a wall that falls down, which masons have known for six thousand years.
  //
  // The whole pier is one structure (see systems/Masonry.js): a course only
  // fails when every block in it has been eaten, so a pier twelve blocks to the
  // course takes real work to undermine — and then everything above it, and
  // everything it was carrying, comes down.
  _ashlar(cx, cy, cz, w, h, d, mat, { course = 0.8, block = 1.2, jitter = 0.012,
                                      name = 'a pier', ry = 0 } = {}) {
    const M = mat || this._stoneMat;
    const nc = Math.max(1, Math.round(h / course));
    const ch = h / nc;
    const nd = Math.max(1, Math.round(d / block));
    const bd = d / nd;
    const st = this.masonry.structure({ x: cx, z: cz, r: Math.max(w, d) / 2, ground: cy, col: null, name });
    const rnd = (i, k) => {
      const v = Math.sin(i * 91.7 + k * 57.3 + cx * 3.1 + cz * 7.7) * 43758.5453;
      return v - Math.floor(v);
    };
    for (let c = 0; c < nc; c++) {
      // half a block of offset on every other course: the joints must break
      const stagger = (c % 2) ? 0.5 : 0;
      const nw = Math.max(1, Math.round(w / block));
      const bw = w / nw;
      const y = cy + c * ch;
      const stones = [];
      for (let i = 0; i <= nw; i++) {
        let x0 = -w / 2 + (i - stagger) * bw;
        let x1 = x0 + bw;
        if (x1 <= -w / 2 + 1e-6 || x0 >= w / 2 - 1e-6) continue;
        x0 = Math.max(x0, -w / 2); x1 = Math.min(x1, w / 2);      // the end stones are short
        const bwi = x1 - x0;
        for (let k = 0; k < nd; k++) {
          const z0 = -d / 2 + k * bd;
          const j = jitter * (rnd(c * 37 + i, k) - 0.5);           // the face is not machined
          const lx = (x0 + x1) / 2, lz = z0 + bd / 2;
          const px = cx + Math.cos(ry) * lx + Math.sin(ry) * lz;
          const pz = cz - Math.sin(ry) * lx + Math.cos(ry) * lz;
          stones.push(this._m(new THREE.BoxGeometry(bwi - 0.02 + j, ch - 0.02, bd - 0.02),
            M, px, y + ch / 2, pz, { ry, outline: c === nc - 1 }));
        }
      }
      this.masonry.course(st, y, ch, stones);
    }
    return st;
  }

  // A semicircular arch of VOUSSOIRS, with a keystone at the crown.
  //
  // 2026-09-08, continuing the masonry. Every arch in this world was a single
  // torus, which is the one structural form that most deserved not to be: an
  // arch is a ring of wedges each of which is held in place by the thrust of the
  // two beside it, and it is the only common piece of masonry with NO
  // redundancy. A wall can lose a course and stand on what is left. A column can
  // lose a drum. An arch that loses any one voussoir — not only the keystone —
  // comes down entire, which is why sappers went for arches, and why this one is
  // registered `brittle` (see systems/Masonry.js).
  //
  // The joints radiate from the centre, which is the thing you actually see, so
  // each wedge is a box turned to its own mid-angle and cut long enough at the
  // extrados that the ring closes. The keystone stands a little proud, as it
  // does on every arch the 1499 plates draw.
  //
  // `piers` are the structures it springs from: bring one down and the arch
  // follows it, because an arch on one leg is not an arch.
  _arch(cx, cy, cz, span, depth, mat, { ry = 0, n = 11, thick = null, parent = null,
                                        name = 'an arch', piers = [] } = {}) {
    const M = mat || this._stoneMat;
    const R = span / 2;
    const T = thick || Math.max(0.16, R * 0.16);
    const N = n % 2 ? n : n + 1;                 // odd, so there IS a keystone
    const dT = Math.PI / N;
    const chord = 2 * (R + T / 2) * Math.tan(dT / 2) + 0.004;
    const st = this.masonry.structure({ x: cx, z: cz, r: R, ground: cy,
                                        name, brittle: true });
    const key = Math.floor(N / 2);
    const stones = [];
    for (let i = 0; i < N; i++) {
      const th = dT * (i + 0.5);                 // from one springing to the other
      const kk = i === key;
      const rr = R + T / 2 + (kk ? 0.03 : 0);
      // local coordinates in the plane of the arch, then turned by ry
      const lx = -Math.cos(th) * rr, ly = Math.sin(th) * rr;
      const px = cx + Math.cos(ry) * lx, pz = cz - Math.sin(ry) * lx;
      const v = this._m(new THREE.BoxGeometry(chord * (kk ? 1.06 : 1), T * (kk ? 1.22 : 1),
                                              depth * (kk ? 1.08 : 1)),
        M, px, cy + ly, pz, { parent, ry, cast: false, outline: kk });
      // turn it to stand on its own radius: the joints must point at the centre
      v.rotation.set(0, ry, th - Math.PI / 2);
      v.userData.roll = kk ? 'the keystone of an arch' : 'a voussoir';
      stones.push(v);
      this.masonry.course(st, cy + ly, T, [v]);
    }
    for (const pr of piers) this.masonry.dependsOn(st, pr);
    st.stones = stones;
    return st;
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
    // seven courses of eleven ashlars, joints broken (2026-09-08)
    this._ashlar(CX, 0.57, WZ, 13.4, WH, 0.6, this._stoneMat,
      { course: 0.77, block: 1.2, name: 'the hall wall of the Planetary Palace' });
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
    const roof = this._roof(CX, 0.57 + WH + 0.98, WZ + 4.6, 13.9, 9.6, { pitch: 1.1, ridgeAlong: 'x' });
    // …and it is HELD UP by the hall wall and by the twelve Ionic columns of
    // the two colonnades. Undermine any one of them in Roll Up and the roof of
    // the Queen's palace comes in.
    const props = this.masonry.under(CX - 7.5, CX + 7.5, WZ - 1, 5.5);
    if (props.length) {
      const load = this.masonry.carry(props[0], roof);
      for (let i = 1; i < props.length; i++) this.masonry.alsoCarriedBy(load, props[i]);
    }

    // Plate #25 (folio 88) is "Panelled wall in Queen's palace with planetary
    // names": the seven are PANELS on the wall, not glowing orbs on pedestals
    // in the hall — which is what stood here, from the Atalanta register.
    METALS.forEach((m, i) => {
      const x = CX - 5.5 + i * (11 / 6);
      this._m(new THREE.BoxGeometry(1.5, 1.7, 0.1), this._darkStoneMat, x, 0.57 + 2.6, WZ + 0.36, { cast: false });
      this._m(new THREE.BoxGeometry(1.3, 1.5, 0.06), S.key === 'woodcut' ? this._stoneMat : S.mat({ color: m.color, metalness: m.metalness, roughness: m.rough }),
        x, 0.57 + 2.6, WZ + 0.42, { cast: false });
      this._plaque({ glyph: m.glyph, glyphColor: '#' + m.color.toString(16).padStart(6, '0'), main: m.name.toUpperCase(), sub: m.metal.toUpperCase() },
        1.15, 0.5, x, 0.57 + 1.55, WZ + 0.44);
    });

    // Dallington pp. 130–131: "the laboures of Hercules grauen in stone with
    // halfe the representation standing out … the skinnes, statues, tytles,
    // and trophes" — a relief frieze along the front; "the going in was closed
    // vp wth a hanging … of gould and silke, wrought together, and in the same
    // two images. One of them hauing all kinde of instruments about hir …
    // and the other with a maidenly countenance, looking vp with hyr eyes
    // into heauen"; kept by Cinosia; then two rooms each "hung about and
    // diuided by an other Curtaine" — of "Arras full of Imagerie", then of
    // "infinite knottes, bucklinges, tyings" — kept by Indalomena and
    // Mnemosina. And overhead "a loftie Gallery … the roofe whereof, was all
    // painted with a greene foliature, with distinct flowers and folded
    // leaues, and little flying Byrdes".
    const relief = S.key === 'woodcut' ? S.mat({ tone: 0.08 }) : S.mat({ color: 0xcfc3a6, roughness: 0.8 });
    for (let i = 0; i < 12; i++) {
      // the labours as a rhythm of standing figures and beasts in half-relief
      const x = CX - 6 + i * 1.1, y = 0.57 + COL_H + 0.72;
      this._m(new THREE.CapsuleGeometry(0.07, 0.16, 3, 6), relief, x, y, 4.2 + 0.56, { cast: false });
      if (i % 3 === 1) this._m(new THREE.SphereGeometry(0.1, 8, 6), relief, x + 0.32, y - 0.04, 4.2 + 0.56, { cast: false }).scale.set(1.5, 0.8, 0.5);
      if (i % 4 === 2) this._m(new THREE.ConeGeometry(0.06, 0.22, 5), relief, x - 0.3, y + 0.05, 4.2 + 0.56, { cast: false });
    }
    this._plaque({ main: 'HERCVLIS LABORES', sub: 'GRAVEN IN STONE, HALF THE REPRESENTATION STANDING OVT · THE SKINS, STATVES, TITLES AND TROPHIES' },
      2.6, 0.36, CX, 0.57 + COL_H + 0.3, 4.2 + 0.6, 0, true);
    // the gold-and-silk hanging at the door, with its two images
    this._drape(CX, 0.57, WZ + 0.55, 2.2, 3.1, 0xc8a24a, { ry: 0, swag: 0.25 });
    this._plaque({ main: 'THE INSTRVMENTS · THE EYES TO HEAVEN', sub: 'TWO IMAGES WROVGHT IN GOLD AND SILK · KEPT BY CINOSIA' },
      2.0, 0.3, CX, 0.57 + 3.35, WZ + 0.6, 0, true);
    const keepers = [['Cinosia', 'KEEPER OF THE HANGING', 0], ['Indalomena', 'KEEPER OF THE ARRAS OF IMAGERIE', 1], ['Mnemosina', 'KEEPER OF THE KNOTTED CVRTAIN · MEMORY', 2]];
    keepers.forEach(([name, sub2, k]) => {
      const ny = this.cast.nymph({ name, robe: [0xe0d4b8, 0xc8b898, 0xb8a888][k], h: 0.96 });
      this._npc('palace_' + name.toLowerCase(), ny, CX + 1.6 + k * 0.9, WZ + 1.2 + k * 0.5, Math.PI * 0.75, { label: name, sub: sub2, sway: 0.03 });
    });
    // the painted gallery ceiling: green foliature, flowers, folded leaves, little flying birds
    if (S.key !== 'woodcut') {
      const c = document.createElement('canvas'); c.width = 512; c.height = 256;
      const x = c.getContext('2d');
      x.fillStyle = '#2a6a9a'; x.fillRect(0, 0, 512, 256);                                   // the azure ground
      const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
      x.strokeStyle = '#4a8a3a'; x.lineWidth = 3;
      for (let i = 0; i < 26; i++) { x.beginPath(); x.moveTo(rnd(i, 1) * 512, rnd(i, 2) * 256); x.bezierCurveTo(rnd(i, 3) * 512, rnd(i, 4) * 256, rnd(i, 5) * 512, rnd(i, 6) * 256, rnd(i, 7) * 512, rnd(i, 8) * 256); x.stroke(); }
      for (let i = 0; i < 60; i++) { x.fillStyle = ['#5a9a4a', '#3c7a32', '#7ab85a'][i % 3]; x.save(); x.translate(rnd(i, 9) * 512, rnd(i, 10) * 256); x.rotate(rnd(i, 11) * 6.3); x.beginPath(); x.ellipse(0, 0, 14, 6, 0, 0, 7); x.fill(); x.restore(); }
      for (let i = 0; i < 30; i++) { x.fillStyle = ['#e8c040', '#f0ecd8', '#d84a5a'][i % 3]; for (let p = 0; p < 5; p++) { x.beginPath(); x.arc(rnd(i, 12) * 512 + Math.cos(p * 1.257) * 4, rnd(i, 13) * 256 + Math.sin(p * 1.257) * 4, 3.4, 0, 7); x.fill(); } }
      x.fillStyle = '#d9b25a'; x.strokeStyle = '#d9b25a'; x.lineWidth = 2.5;
      for (let i = 0; i < 16; i++) { const bx = rnd(i, 14) * 512, by = rnd(i, 15) * 256; x.beginPath(); x.moveTo(bx - 10, by); x.quadraticCurveTo(bx - 5, by - 7, bx, by); x.quadraticCurveTo(bx + 5, by - 7, bx + 10, by); x.stroke(); }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); this._disp.push(t);
      const cm = new THREE.MeshStandardMaterial({ map: t, roughness: 0.9, side: THREE.DoubleSide }); this._disp.push(cm);
      this._m(new THREE.PlaneGeometry(13.4, 9.2), cm, CX, 0.57 + WH + 0.9, WZ + 4.6, { rx: Math.PI / 2, cast: false });
    }
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

  // ── The obelisk of the Trinity (#33, f. 119) ──────────────
  //
  // This station was a glowing dodecahedron on drums with four element-orbs
  // round it — the Atalanta register, and nothing the book describes. What
  // stands in the third garden, at the centre, in Dallington pp. 183–185
  // (corpus ll. 7690–7790), is this:
  //
  //   "a Base, of a cleere Christal-like Calcedonie stone, in a Cubic forme"
  //   — on each face, in Greek letters "three, one, two and three":
  //   ΔΥΣ Α ΛΩ ΤΟΣ, dysalotos, hard to take; "consecrated to the Deitie,
  //   because it is euerie way alike".
  //   "vppon that was set a round stone … two foote high, and by the Diameter
  //   one pace and a halfe ouer, of most pure red Diaspre" — three hieroglyphs
  //   under the feet of the images: the sun, an ewer ("an olde fashioned
  //   Ower"), "a dyshe with a burning flame in it".
  //   "a most blacke stone, in forme three square … in height one pace and a
  //   halfe" — on each polished front a nymph-image, feet not touching the
  //   stone, arms stretched to the corners, "where they held a Coppy … of
  //   fine gold … seauen foote".
  //   On its head "an Egiptian Monster of Gold, fower footed couchant" at each
  //   corner — "One of thẽ hauing a face lyke man altogether. The other like
  //   half a man, & halfe a beast. And the third like a beast", each "with a
  //   linnen vaile ouer euery of their heades" — three sphinxes.
  //   On their backs "a massiue Spyre of Gold, three square, sharpning vp to
  //   the toppe, fiue tymes as high as broade below", a circle on each front
  //   and over the circles Ο, Ω, Ν.
  //   Logistica's reading: "Diuinæ infinitæque trinitati vnius essentiæ."
  _buildQuinta() {
    const S = this.style, woodcut = S.key === 'woodcut';
    const CX = 21.5, CZ = 0;
    const M = (color, extra = {}) => woodcut ? S.mat({ tone: extra.tone ?? 0.08 }) : S.mat({ color, ...extra, tone: undefined });
    const chalced = M(0x9ec4d0, { roughness: 0.15, metalness: 0.2, transparent: !woodcut, opacity: 0.86, tone: 0.06 });
    const jasper  = M(0xa03a2c, { roughness: 0.45, tone: 0.22 });
    const black   = M(0x0e0e12, { roughness: 0.3, metalness: 0.2, tone: 0.36 });
    const gold    = M(0xd9b25a, { metalness: 0.95, roughness: 0.22, tone: 0.02 });
    const linen   = M(0xefe6d2, { roughness: 0.9, tone: 0.04 });

    // the cube of chalcedony, lettered on every face
    const CUBE = 1.6;
    this._m(new THREE.BoxGeometry(CUBE, CUBE, CUBE), chalced, CX, CUBE / 2 + 0.05, CZ, { outline: true });
    for (let k = 0; k < 4; k++) {
      const a = k * Math.PI / 2;
      this._plaque({ main: 'ΔΥΣ Α ΛΩ ΤΟΣ', sub: 'HARD TO TAKE · CONSECRATED TO THE DEITY, BECAUSE IT IS EVERY WAY ALIKE' },
        1.4, 0.36, CX + Math.sin(a) * (CUBE / 2 + 0.02), 0.85, CZ + Math.cos(a) * (CUBE / 2 + 0.02), a, true);
    }
    this._circleCol(CX, CZ, 1.5);
    // the round of red jasper, two foot high, a pace and a half across, with
    // the three hieroglyphs under the images' feet: sun, ewer, dish of flame
    const RY = CUBE + 0.05, RR = 1.15, RH = 0.5;
    this._m(new THREE.CylinderGeometry(RR, RR, RH, 32), jasper, CX, RY + RH / 2, CZ, { outline: true });
    [['sun'], ['ewer'], ['altar']].forEach((signs, i) => {
      const a = i * Math.PI * 2 / 3 + Math.PI / 2;
      this._frieze(CX + Math.sin(a) * (RR + 0.01), RY + RH / 2, CZ + Math.cos(a) * (RR + 0.01), 0.5, 0.36, 'hieroglyph', { signs, reps: 1, ry: a });
    });
    // the black trigon, a pace and a half high, and on each front a nymph in
    // gold holding a cornucopia to each corner
    const TY = RY + RH, TH = 1.85, TR = 1.05;
    const tri = new THREE.CylinderGeometry(TR, TR, TH, 3); tri.rotateY(Math.PI / 6);
    this._m(tri, black, CX, TY + TH / 2, CZ, { outline: true });
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI * 2 / 3 + Math.PI / 2;            // the face normals
      const ap = TR * Math.cos(Math.PI / 3);                   // apothem of the triangle
      const fx = CX + Math.sin(a) * (ap + 0.02), fz = CZ + Math.cos(a) * (ap + 0.02);
      const fig = this.cast.nymph({ name: 'trigon_' + i, robe: 0xd9b25a, h: 0.78, pose: 'reach', cutout: null });
      fig.traverse(o => { if (o.isMesh && o.material && o.material.color) o.material = gold; });
      fig.position.set(fx, TY + 0.14, fz); fig.rotation.y = a; this.scene.add(fig);
      // the two horns, seven foot of gold, to the corners
      for (const sx of [-1, 1]) {
        const ca = a + sx * Math.PI / 3;                       // the corner directions
        const cx2 = CX + Math.sin(ca) * TR, cz2 = CZ + Math.cos(ca) * TR;
        const horn = this._limb(this.scene, gold, fx, TY + 1.0, fz, cx2, TY + TH - 0.1, cz2, 0.03, 0.09);
        void horn;
      }
    }
    // three sphinxes of gold, couchant at the corners, in linen veils: the
    // man-faced, the half-man, the beast
    const SY = TY + TH;
    for (let i = 0; i < 3; i++) {
      const ca = i * Math.PI * 2 / 3 + Math.PI / 2 + Math.PI / 3;
      const g = new THREE.Group(); g.position.set(CX + Math.sin(ca) * TR * 0.62, SY, CZ + Math.cos(ca) * TR * 0.62); g.rotation.y = ca; this.scene.add(g);
      const body = this._m(new THREE.CapsuleGeometry(0.16, 0.36, 4, 8), gold, 0, 0.16, -0.05, { parent: g }); body.rotation.x = Math.PI / 2;
      for (const sx of [-1, 1]) this._m(new THREE.CapsuleGeometry(0.05, 0.22, 3, 6), gold, sx * 0.12, 0.07, 0.22, { parent: g, rx: Math.PI / 2 });
      const head = this._m(new THREE.SphereGeometry(i === 2 ? 0.11 : 0.12, 10, 8), gold, 0, 0.42, 0.28, { parent: g });
      if (i === 2) { head.scale.set(0.9, 0.85, 1.3); this._m(new THREE.ConeGeometry(0.04, 0.12, 6), gold, 0, 0.4, 0.42, { parent: g, rx: Math.PI / 2 }); }
      if (i === 1) head.scale.set(0.95, 1, 1.15);
      const veil = this._m(new THREE.BoxGeometry(0.3, 0.02, 0.5), linen, 0, 0.52, 0.16, { parent: g, cast: false });
      veil.rotation.x = 0.35;
      for (const sx of [-1, 1]) this._m(new THREE.BoxGeometry(0.06, 0.24, 0.02), linen, sx * 0.14, 0.36, 0.34, { parent: g, cast: false });
    }
    // the spire of gold, three square, five times as high as broad, a circle
    // on each front and Ο, Ω, Ν over them
    const OY = SY + 0.5, OB = 0.62, OH = OB * 5;
    const spire = new THREE.CylinderGeometry(0.03, OB / Math.sqrt(3), OH, 3); spire.rotateY(Math.PI / 6);
    this._m(spire, gold, CX, OY + OH / 2, CZ, { outline: true });
    ['Ο', 'Ω', 'Ν'].forEach((L, i) => {
      const a = i * Math.PI * 2 / 3 + Math.PI / 2;
      const ap = (OB / Math.sqrt(3)) * Math.cos(Math.PI / 3) * 0.72;
      this._m(new THREE.TorusGeometry(0.12, 0.02, 6, 20), M(0x2a2018, { tone: 0.3 }), CX + Math.sin(a) * (ap + 0.02), OY + 0.7, CZ + Math.cos(a) * (ap + 0.02), { cast: false, ry: a });
      this._plaque({ main: L, sub: '' }, 0.34, 0.3, CX + Math.sin(a) * (ap * 0.9 + 0.02), OY + 1.15, CZ + Math.cos(a) * (ap * 0.9 + 0.02), a, true);
    });
    const gl = S.pointLight(0xffd060, 1.2, 8);
    if (gl) { gl.position.set(CX, OY + 1, CZ + 0.5); this.scene.add(gl); }
    this._quinta = null;

    // the ring of columns stays: the garden's centre is a place, not a prop
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const gx = CX + Math.cos(a) * 3.35, gz = CZ + Math.sin(a) * 3.35;
      const gc = new THREE.Group(); gc.position.y = 0.56; this.scene.add(gc);
      this._column(gx, gz, 2.9, { order: 'ionic', r: 0.17, parent: gc });
    }
    for (let i = 0; i < 8; i++) {
      const a0 = (i / 8) * Math.PI * 2 + Math.PI / 8, a1 = ((i + 1) / 8) * Math.PI * 2 + Math.PI / 8;
      const mx = CX + Math.cos((a0 + a1) / 2) * 3.35, mz = CZ + Math.sin((a0 + a1) / 2) * 3.35;
      this._entablature(mx, 3.46, mz, 2 * 3.35 * Math.sin(Math.PI / 8) + 0.22, 0.5, { ry: -(a0 + a1) / 2 });
    }
    this._plaque({ main: 'DIVINAE INFINITAEQVE TRINITATI VNIVS ESSENTIAE', sub: 'LOGISTICA READS THE MONVMENT · THE THIRD GARDEN · CH. XI · PLATE 33' },
      3.0, 0.42, CX, 0.55, CZ + 3.9, 0, true);
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

  // ── The third fountain, folio 80 (#23) ────────────────────
  //
  // Ted, 2026-09-06: "fountains that look like real water". The mainland
  // station is folio 80, and until now it stood a COPY of Cythera's gem-columned
  // fountain of ch. XXIII with the plate's company round it. The fountain the
  // plate actually shows is this one, Dallington pp. 124–127, and it is the
  // book's most hydraulic object:
  //
  //   "a goodly Fountaine of cleare water … falling into a hollowed vessel,
  //   whiche was of most pure Amethist, whose Diameter conteined three paces"
  //   — on "a steale or final Pillar of Iasper of diuers colours … cut in the
  //   middest and closed vp with the cleare Calcidonie", "fastened in the
  //   center of a Plynth, made of greene Ophite which was rounde", ringed with
  //   "compassing Porphyr". "Rounde about the steale … foure Harpies of Golde
  //   did stand" with their wings spread, holding up the vessel. In the
  //   vessel's navel "a substance like a Challice", and on it "the three
  //   graces naked of fine Gold, of a common stature, one ioyning to an
  //   other. From the teates of their breastes the ascending water did spin
  //   out lyke siluer twist." Each holds up a cornucopia; the three meet above
  //   their heads, and "betwixt the fruite and the leaues, there came vp sixe
  //   small Pypes, out of the whiche the water did spring vp". On the vessel's
  //   brim "sixe little scaly Dragons, of pure shining Golde", so placed that
  //   the Graces' water "did fall directly vppon the euacuated and open crowne
  //   of the head of the Dragons", who "did cast vp and vomit the same water"
  //   beyond the ophite into "a receptorie of Porphyr" — a channel a foot and a
  //   half wide, two deep. And on the vessel's belly, between the dragons,
  //   "Lyons heads … casting foorth by a little pype" the water of the six
  //   fistulets, "which water did so forciblie spring vpward, that in the
  //   turning downe it fell among the Dragons … it made a pleasant tinckling
  //   noyse." The whole "compassing Orange trees".
  //
  // Every jet named there is a jet here: six from the Graces to the dragons'
  // crowns, six from the dragons out to the channel, six from the pipes in the
  // cornucopias up and back into the vessel, six from the lion-heads.
  _buildGracesFountain(FX = 0, FZ = -20) {
    const S = this.style, woodcut = S.key === 'woodcut';
    const M = (color, extra = {}) => woodcut ? S.mat({ tone: extra.tone ?? 0.08 }) : S.mat({ color, ...extra, tone: undefined });
    const ophite   = M(0x2f4a34, { roughness: 0.4, tone: 0.3 });
    const porphyr  = M(0x7a2a2c, { roughness: 0.5, tone: 0.24 });
    const jasper   = M(0x9a4a3a, { roughness: 0.45, tone: 0.2 });
    const chalced  = M(0x7aa0b0, { roughness: 0.2, metalness: 0.2, transparent: !woodcut, opacity: 0.85, tone: 0.06 });
    const amethyst = M(0x7a4aa8, { roughness: 0.15, metalness: 0.3, transparent: !woodcut, opacity: 0.78, tone: 0.12 });
    const gold     = M(0xd9b25a, { metalness: 0.95, roughness: 0.22, tone: 0.02 });
    const water    = this._waterMat();

    const R_CH = 2.6, WY = 0.62;             // the porphyry channel, and its water
    // the round ophite plinth, "somewhat lifted vp", ringed with porphyry, and
    // the channel between them, a foot and a half wide and two deep
    this._m(new THREE.CylinderGeometry(R_CH + 0.55, R_CH + 0.65, 0.7, 40), porphyr, FX, 0.35, FZ, { cast: false, outline: true });
    this._m(new THREE.CylinderGeometry(R_CH - 0.55, R_CH - 0.55, 0.9, 40), ophite, FX, 0.45, FZ, { cast: false, outline: true });
    this._m(new THREE.RingGeometry(R_CH - 0.55, R_CH + 0.55, 40), porphyr, FX, 0.2, FZ, { rx: -Math.PI / 2, cast: false });
    this._waters.push({ m: this._m(new THREE.RingGeometry(R_CH - 0.55, R_CH + 0.55, 40), water, FX, WY, FZ, { rx: -Math.PI / 2, cast: false }), rate: 0.03 });
    this._caustics(FX, WY - 0.3, FZ, R_CH + 0.5, 0.04);
    this._circleCol(FX, FZ, R_CH + 0.8);

    // the stem: jasper "cut in the middest and closed vp with the cleare
    // Calcidonie", and the four gold harpies about it holding up the vessel
    this._m(new THREE.CylinderGeometry(0.34, 0.42, 0.55, 14), jasper, FX, 1.17, FZ, { outline: true });
    this._m(new THREE.CylinderGeometry(0.3, 0.34, 0.5, 14), chalced, FX, 1.7, FZ, { cast: false });
    this._m(new THREE.CylinderGeometry(0.42, 0.3, 0.45, 14), jasper, FX, 2.17, FZ, { outline: true });
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + Math.PI / 4;
      const h = new THREE.Group(); h.position.set(FX + Math.cos(a) * 0.62, 0.9, FZ + Math.sin(a) * 0.62); h.rotation.y = -a + Math.PI / 2; this.scene.add(h);
      const body = this._m(new THREE.SphereGeometry(0.2, 12, 9), gold, 0, 0.3, 0, { parent: h }); body.scale.set(0.8, 1.3, 0.9);
      this._m(new THREE.SphereGeometry(0.1, 12, 9), gold, 0, 0.72, 0.05, { parent: h });
      for (const sx of [-1, 1]) {
        const w = this._m(new THREE.SphereGeometry(0.34, 10, 7, 0, Math.PI), gold, sx * 0.22, 0.9, -0.05, { parent: h, cast: false });
        w.scale.set(0.8, 1.2, 0.14); w.rotation.set(0.3, sx * 0.4, sx * 0.9);
        this._m(new THREE.ConeGeometry(0.03, 0.12, 5), gold, sx * 0.08, 0.02, 0.06, { parent: h, rx: 2.7, cast: false });
      }
      const tail = this._m(new THREE.TorusGeometry(0.22, 0.04, 6, 12, Math.PI * 1.2), gold, 0, 0.3, -0.3, { parent: h, cast: false }); tail.rotation.y = Math.PI / 2;
    }

    // the amethyst vessel, three paces across, with the chalice rising in its
    // navel, and the six lion-heads on its belly
    const VY = 2.55, VR = 1.5;
    const bowl = this._m(new THREE.SphereGeometry(VR, 28, 14, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.58), amethyst, FX, VY + VR * 0.25, FZ, { outline: true });
    bowl.material.side = THREE.DoubleSide;
    this._m(new THREE.TorusGeometry(VR * 0.98, 0.07, 8, 40), gold, FX, VY, FZ, { rx: Math.PI / 2, cast: false });
    this._waters.push({ m: this._m(new THREE.CircleGeometry(VR * 0.92, 32), water, FX, VY - 0.08, FZ, { rx: -Math.PI / 2, cast: false }), rate: 0.05 });
    this._m(new THREE.CylinderGeometry(0.34, 0.5, 0.7, 16), amethyst, FX, VY + 0.2, FZ, { cast: false });     // the chalice
    this._m(new THREE.CylinderGeometry(0.42, 0.34, 0.1, 16), gold, FX, VY + 0.58, FZ, { cast: false });         // its foot for the Graces
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3 + Math.PI / 6;
      const lx = FX + Math.cos(a) * VR * 0.9, lz = FZ + Math.sin(a) * VR * 0.9;
      const head = this._m(new THREE.SphereGeometry(0.13, 10, 8), gold, lx, VY - 0.45, lz, { cast: false }); head.scale.set(1, 0.9, 1.2);
      this._m(new THREE.TorusGeometry(0.13, 0.03, 6, 12), gold, lx, VY - 0.45, lz, { cast: false, ry: -a + Math.PI / 2 });    // the mane
      // "casting foorth by a little pype" — a lion-head jet out into the channel
      this._jet(lx + Math.cos(a) * 0.12, VY - 0.48, lz + Math.sin(a) * 0.12, FX + Math.cos(a) * (R_CH + 0.1), WY + 0.02, FZ + Math.sin(a) * (R_CH + 0.1), { apex: 0.25, r: 0.02 });
    }

    // the three Graces, "naked of fine Gold, of a common stature, one ioyning
    // to an other" — back to back on the chalice, the cornucopias raised and
    // meeting over their heads
    const GY = VY + 0.63;
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI * 2 / 3 + Math.PI / 2;
      const gx = FX + Math.cos(a) * 0.22, gz = FZ + Math.sin(a) * 0.22;
      const fig = this.cast.figure({ h: 0.8, robe: null, pose: 'reach' });
      fig.traverse(o => { if (o.isMesh && o.material && o.material.color) o.material = gold; });
      fig.position.set(gx, GY, gz); fig.rotation.y = -a + Math.PI / 2;
      this.scene.add(fig);
      // the cornucopia in the right hand, curling up to the meeting-point
      const horn = this._m(new THREE.ConeGeometry(0.09, 0.9, 8, 1, true), gold, gx + Math.cos(a) * 0.3, GY + 1.25, gz + Math.sin(a) * 0.3, { cast: false });
      horn.material.side = THREE.DoubleSide; horn.rotation.set(-Math.sin(a) * 0.35, 0, Math.cos(a) * 0.35);
      // "From the teates of their breastes the ascending water did spin out
      // lyke siluer twist" — two jets a Grace, to the dragons' open crowns
      for (const sx of [-1, 1]) {
        const ba = a + sx * 0.32;
        const da = a + sx * Math.PI / 6;                     // the dragon that catches it
        this._jet(gx + Math.cos(ba) * 0.16, GY + 0.95, gz + Math.sin(ba) * 0.16,
                  FX + Math.cos(da) * VR * 1.02, VY + 0.42, FZ + Math.sin(da) * VR * 1.02, { apex: 0.5, r: 0.014 });
      }
    }
    // the fruit where the three horns meet, and "sixe small Pypes" springing up
    this._m(new THREE.SphereGeometry(0.28, 12, 9), gold, FX, GY + 1.75, FZ, { cast: false });
    for (let k = 0; k < 8; k++) this._m(new THREE.SphereGeometry(0.06, 7, 6), M([0xc03a2a, 0xd88a20, 0x7a9a2a][k % 3], { roughness: 0.55, tone: 0.2 }),
      FX + Math.cos(k * 0.8) * 0.26, GY + 1.75 + Math.sin(k * 1.3) * 0.18, FZ + Math.sin(k * 0.8) * 0.26, { cast: false });
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      this._jet(FX + Math.cos(a) * 0.1, GY + 1.95, FZ + Math.sin(a) * 0.1, FX + Math.cos(a) * VR * 0.6, VY - 0.06, FZ + Math.sin(a) * VR * 0.6, { apex: 0.7, r: 0.012, sparkle: 14 });
    }

    // the six gold dragons on the brim, crowns open, vomiting the water out
    // beyond the ophite into the porphyry channel
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3 + Math.PI / 2 + Math.PI / 6 * 0;
      const da = i * Math.PI / 3 + Math.PI / 2 - Math.PI / 6 + (i % 2 ? Math.PI / 3 : 0);
      const dx = FX + Math.cos(da) * VR * 1.02, dz = FZ + Math.sin(da) * VR * 1.02;
      const d = new THREE.Group(); d.position.set(dx, VY + 0.05, dz); d.rotation.y = -da + Math.PI / 2; this.scene.add(d);
      this._m(new THREE.SphereGeometry(0.11, 10, 8), gold, 0, 0.18, 0, { parent: d, cast: false }).scale.set(0.8, 0.8, 1.3);
      this._m(new THREE.CylinderGeometry(0.08, 0.05, 0.16, 8, 1, true), gold, 0, 0.36, 0, { parent: d, cast: false }).material.side = THREE.DoubleSide;  // the open crown
      for (const sx of [-1, 1]) {
        const w = this._m(new THREE.SphereGeometry(0.2, 8, 6, 0, Math.PI), gold, sx * 0.15, 0.26, -0.05, { parent: d, cast: false });
        w.scale.set(0.7, 1, 0.1); w.rotation.set(0.2, sx * 0.4, sx * 0.9);
      }
      this._m(new THREE.ConeGeometry(0.05, 0.16, 6), gold, 0, 0.18, 0.2, { parent: d, rx: Math.PI / 2, cast: false });   // the jaws
      this._jet(dx + Math.cos(da) * 0.2, VY + 0.2, dz + Math.sin(da) * 0.2, FX + Math.cos(da) * (R_CH - 0.1), WY + 0.02, FZ + Math.sin(da) * (R_CH - 0.1), { apex: 0.35, r: 0.02 });
      void a;
    }

    // "the greene assayling of the compassing Orange trees"
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3 + Math.PI / 6;
      if (Math.abs(Math.sin(a)) > 0.95) continue;             // keep the axis open, north and south
      this._tree(FX + Math.cos(a) * 5.2, FZ + Math.sin(a) * 5.2, 0.9, 'orange');
    }
    this._buildFolio80Company(FX, FZ, R_CH + 0.2, 0.7, { graces: false });
    this._plaque({ main: 'LYKE SILVER TWIST', sub: 'THE THIRD FOVNTAIN · AMETHYST ON IASPER · THE GRACES, THE DRAGONS, THE LIONS · FOLIO 80' },
      2.4, 0.4, FX, 0.95, FZ + R_CH + 1.05, 0, true);
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
  _buildFolio80Company(FX, FZ, R, KERB, { graces = true } = {}) {
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
    const GR = graces ? ['Aglaia', 'Euphrosyne', 'Thalia'] : [];
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
    // 2026-09-08: the eight piers are ASHLAR, eight courses each, and together
    // they carry the entablature ring and the scaled cupola. Undermine one and
    // the dome comes down on you — which is the correct answer to "what happens
    // when a block is rolled up out from underneath the structure it supports",
    // and, for a round temple on eight supports, a fairly dramatic one.
    const piers = [];
    const bay = (k) => (k * Math.PI * 2) / 8;
    for (let k = 0; k < 8; k++) {
      const a = bay(k) + Math.PI / 8;      // the piers sit BETWEEN the bays
      const px = TX + Math.sin(a) * R, pz = TZ + Math.cos(a) * R;
      const col = this._circleCol(px, pz, 0.62);
      const st = this._ashlar(px, PLAT_Y, pz, PIER, WALL_H, 1.0, marble,
        { ry: a, course: 0.65, block: 0.95, name: 'a pier of the Temple of Venus' });
      st.col = col;
      piers.push(st);
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
      if (k === 0 || k === 4) sill.visible = false;     // the door, and the sacello opposite it
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
    const domeCourses = [];
    for (let i = 0; i < SC; i++) {
      const t = i / SC, t2 = (i + 1) / SC;
      const r0 = R * Math.cos(t * Math.PI / 2) * 1.02;
      const r1 = R * Math.cos(t2 * Math.PI / 2) * 1.02;
      domeCourses.push(this._m(new THREE.CylinderGeometry(r1, r0, R * 0.46 / SC * 2.2, 32, 1, true),
        i % 2 ? domeA : domeB,
        TX, DOME_Y + Math.sin(t * Math.PI / 2) * R * 0.52, TZ, { cast: false }));
    }
    const APEX = DOME_Y + R * 0.52;
    // the cupola is a load, and every pier under it takes a share
    if (piers.length) {
      const dome = this.masonry.carry(piers[0], domeCourses);
      for (let i = 1; i < piers.length; i++) this.masonry.alsoCarriedBy(dome, piers[i]);
    }

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

    // ── The sacello (pp. 219-220), the altar (pp. 221-223, #80), the sacrifice
    //    (pp. 226-232, #79-#83) and the miracle (pp. 233-234, #84-#85) ──────
    //
    // The rite does not happen in the drum. "Now toward the round and blind
    // Sacello — situated directly opposite the door of the magnificent temple,
    // and with it artfully joined and contiguous — all, composedly, went …
    // all of stone … of precious Phengite marvellously built, with a cupola'd
    // and round roof, of a single and solid rock … not being windowed, but all
    // obtuse, and having only the golden valves — throughout, clearly, it was
    // illuminated" (p. 219). Its pavement "all of gems … disposed in greening
    // leaves, and flowers, and little birds … from which, doubled, it re-showed
    // those who had entered" (p. 220). Before its golden valves two virgins set
    // down "a pair of whitest male Swans … and a most-ancient little urn with
    // sea-water; and … a pair of candid Turtledoves, by the feet bound together
    // with crimson silk, upon a wicker basket full of vermilion roses and
    // oyster-shells" on "a sacred and quadrangular anclabris" (p. 219). Plate
    // #80 draws the valves in an aedicule with a shell in its pediment, the
    // virgins with the swans and the basket outside it. The altar was here
    // before; it stood loose in the drum, and the sacello did not exist.
    const SZ = TZ - R - 2.6, SR = 2.5, FY = PLAT_Y;
    const phengite = woodcut ? S.mat({ tone: 0.02 })
      : S.mat({ color: 0xf4efe4, roughness: 0.55, emissive: 0xfff2d8, emissiveIntensity: 0.32 });
    const phengite2 = phengite.clone(); phengite2.side = THREE.DoubleSide; this._disp.push(phengite2);
    // the floor, of gems, mirror-bright; the wall, blind, with the one gap toward the drum; the cupola of one stone
    const gemFloor = woodcut ? S.mat({ tone: 0.1 })
      : new THREE.MeshStandardMaterial({ map: this._knotTexture(), roughness: 0.18, metalness: 0.55, envMapIntensity: 1.4 });
    this._m(new THREE.CylinderGeometry(SR + 0.4, SR + 0.4, FY + 0.02, 40), marble, TX, (FY + 0.02) / 2, SZ, { cast: false });
    this._m(new THREE.CircleGeometry(SR - 0.05, 40), gemFloor, TX, FY + 0.03, SZ, { rx: -Math.PI / 2, cast: false });
    const GAP = 0.36;
    this._m(new THREE.CylinderGeometry(SR, SR, 3.4, 40, 1, true, GAP, Math.PI * 2 - 2 * GAP), phengite2, TX, FY + 1.7, SZ, { cast: false });
    this._m(new THREE.CylinderGeometry(SR + 0.35, SR + 0.35, 3.4, 40, 1, true, GAP, Math.PI * 2 - 2 * GAP), phengite, TX, FY + 1.7, SZ, { cast: false });
    for (const sx of [-1, 1]) this._m(new THREE.BoxGeometry(0.36, 3.4, 0.5), phengite, TX + sx * SR * Math.sin(GAP) * 1.0, FY + 1.7, SZ + SR * Math.cos(GAP) + 0.15, { cast: false });   // the jambs of the gap
    this._m(new THREE.TorusGeometry(SR + 0.2, 0.18, 8, 40), phengite, TX, FY + 3.4, SZ, { rx: Math.PI / 2, cast: false });
    const cup = this._m(new THREE.SphereGeometry(SR + 0.3, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2), phengite2, TX, FY + 3.45, SZ, { cast: false });
    cup.scale.y = 0.62;
    // colliders round the wall, leaving the gap
    for (let k = 0; k < 20; k++) { const a = GAP + 0.15 + k * (Math.PI * 2 - 2 * GAP - 0.3) / 19; this._circleCol(TX + Math.sin(a) * (SR + 0.15), SZ + Math.cos(a) * (SR + 0.15), 0.45); }
    const sl = S.pointLight(0xfff0d0, 1.2, 7);
    if (sl) { sl.position.set(TX, FY + 2.6, SZ); this.scene.add(sl); }
    // the golden valves, standing open, and the aedicule of plate #80 round
    // them on the drum's inner face: two pilasters, entablature, pediment, shell
    const VZ = TZ - R + 0.5;
    for (const sx of [-1, 1]) {
      const leaf = this._m(new THREE.BoxGeometry(0.82, 2.7, 0.06), gold, 0, 0, 0, { cast: false });
      leaf.rotation.y = -sx * 1.1;                                          // hinged at the pilasters, swung inward
      leaf.position.set(TX + sx * (1.09 - 0.41 * Math.cos(1.1)), FY + 1.35, VZ - 0.05 - 0.41 * Math.sin(1.1));
      for (let r = 0; r < 3; r++) this._m(new THREE.BoxGeometry(0.62, 0.5, 0.02), bronze, 0, -0.9 + r * 0.9, 0.04, { parent: leaf, cast: false });   // the panels of the valves
      this._m(new THREE.BoxGeometry(0.32, 3.1, 0.34), marble, TX + sx * 1.25, FY + 1.55, VZ, { outline: true });
      this._m(new THREE.BoxGeometry(0.42, 0.18, 0.44), gold, TX + sx * 1.25, FY + 3.19, VZ, { cast: false });
    }
    this._m(new THREE.BoxGeometry(3.2, 0.34, 0.5), marble, TX, FY + 3.45, VZ, { outline: true });
    const pedi = this._m(new THREE.CylinderGeometry(1.75, 1.75, 0.46, 3), marble, TX, FY + 3.85, VZ, { rx: -Math.PI / 2, outline: true });
    pedi.scale.z = 0.36;
    this._m(new THREE.SphereGeometry(0.22, 12, 8, 0, Math.PI, 0, Math.PI / 2), gold, TX, FY + 3.72, VZ + 0.24, { cast: false, rx: -Math.PI / 2, ry: 0 });   // the shell in the tympanum
    this._plaque({ main: 'SACELLVM', sub: 'ROVND AND BLIND, OF PHENGITE, LIT THROVGH ITS OWN STONE · THE GOLDEN VALVES · P. 219' },
      1.9, 0.3, TX, FY + 3.05, VZ + 0.28, 0, true);
    // plate #80 hangs a swag across the top of the opening, under the entablature
    this._drape(TX, FY + 2.55, VZ + 0.3, 2.3, 0.9, 0xc8485a, { swag: 0.45 });

    // the anclabris before the valves, and what the two virgins set on it
    const AX = TX, AZ = SZ;
    const ANZ = TZ - R + 2.1, ANY = FY + 0.86;
    this._m(new THREE.BoxGeometry(1.5, 0.08, 0.8), marble, TX, ANY, ANZ, { cast: false });
    for (const [lx, lz] of [[-0.62, -0.3], [0.62, -0.3], [-0.62, 0.3], [0.62, 0.3]]) this._m(new THREE.BoxGeometry(0.1, 0.8, 0.1), marble, TX + lx, FY + 0.42, ANZ + lz, { cast: false });
    for (const sx of [-1, 1]) { const sw = this.cast.animals.swan(0.42); sw.position.set(TX - 0.45 + sx * 0.18, ANY + 0.04, ANZ + sx * 0.14); sw.rotation.y = sx * 0.6 + Math.PI / 2; this.scene.add(sw); }
    const wicker = M(0xb08a4a, { roughness: 0.9 });
    this._m(new THREE.CylinderGeometry(0.24, 0.18, 0.14, 12, 1, true), wicker.clone(), TX + 0.4, ANY + 0.11, ANZ + 0.05, { cast: false }).material.side = THREE.DoubleSide;
    this._m(new THREE.TorusGeometry(0.24, 0.02, 6, 16), wicker, TX + 0.4, ANY + 0.18, ANZ + 0.05, { rx: Math.PI / 2, cast: false });
    for (let k = 0; k < 9; k++) { const a = k * 0.7, rr = 0.06 + (k % 3) * 0.06; this._m(new THREE.SphereGeometry(0.04, 6, 5), k % 3 === 1 ? M(0xe8e2d0, { roughness: 0.5 }) : M(0xc8303c, { roughness: 0.7 }), TX + 0.4 + Math.cos(a) * rr, ANY + 0.19, ANZ + 0.05 + Math.sin(a) * rr, { cast: false }); }   // roses and oyster-shells
    for (const sx of [-1, 1]) this._m(new THREE.SphereGeometry(0.05, 7, 5), M(0xf4f0e8, { roughness: 0.6 }), TX + 0.4 + sx * 0.07, ANY + 0.26, ANZ - 0.02, { cast: false }).scale.set(1.5, 0.9, 1);   // the turtledoves, bound
    this._m(new THREE.BoxGeometry(0.2, 0.012, 0.02), M(0xa02040, { roughness: 0.6 }), TX + 0.4, ANY + 0.24, ANZ + 0.06, { cast: false });   // by the feet, with crimson silk
    this._m(new THREE.CylinderGeometry(0.06, 0.08, 0.16, 10), bronze, TX + 0.05, ANY + 0.12, ANZ - 0.22, { cast: false });   // the little urn of sea-water
    this._m(new THREE.CylinderGeometry(0.035, 0.05, 0.05, 10), bronze, TX + 0.05, ANY + 0.22, ANZ - 0.22, { cast: false });
    this._m(new THREE.BoxGeometry(0.2, 0.012, 0.03), lode, TX - 0.05, ANY + 0.05, ANZ + 0.3, { cast: false, ry: 0.4 });   // the secespita
    this._m(new THREE.CylinderGeometry(0.07, 0.05, 0.1, 10), gold, TX + 0.25, ANY + 0.09, ANZ + 0.28, { cast: false });   // the golden praefericulum
    this._plaque({ main: 'ANCLABRIS', sub: 'TWO SWANS · TWO TVRTLEDOVES BOVND WITH CRIMSON SILK · ROSES AND OYSTER-SHELLS · THE VRN OF SEA-WATER · P. 219' },
      1.7, 0.3, TX, FY + 0.5, ANZ + 0.6, 0, true);

    // the altar of jasper, "all of one solid" (pp. 221-223): the stepped marble
    // footing; the round slab with its foliage, cord and trochlea; the striated
    // stylus, a cubit; the inverted flat with its sima and the calyxed flower;
    // the knot; and the platter of purest gold with its four handles, gem
    // strings between the volutes, and four strings of seven gems hung from
    // the lip. Plate #80 draws it as a chalice on a stem.
    const jasperA = woodcut ? S.mat({ tone: 0.26 }) : S.mat({ color: 0x8a3c2c, roughness: 0.32 });
    if (!woodcut) this._dress(jasperA, this._surfaceTexture({ base: '#8a3c2c', dark: '#3c1a12', light: '#d08a64', blobs: 24, speckle: 3000, veins: 16, repeat: 2 }), 0.08);
    this._m(new THREE.CylinderGeometry(1.15, 1.2, 0.08, 24), marble, AX, FY + 0.04, AZ, { cast: false });
    this._m(new THREE.CylinderGeometry(1.0, 1.05, 0.08, 24), marble, AX, FY + 0.12, AZ, { cast: false });
    this._m(new THREE.CylinderGeometry(0.62, 0.66, 0.1, 24), jasperA, AX, FY + 0.21, AZ, { cast: false });                 // the round slab
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; this._m(new THREE.SphereGeometry(0.07, 6, 5), jasperA, AX + Math.cos(a) * 0.5, FY + 0.31, AZ + Math.sin(a) * 0.5, { cast: false }).scale.set(1, 0.7, 1.6); }   // the auricular foliage
    this._m(new THREE.TorusGeometry(0.34, 0.03, 8, 24), jasperA, AX, FY + 0.36, AZ, { rx: Math.PI / 2, cast: false });      // the cord
    this._m(new THREE.CylinderGeometry(0.3, 0.36, 0.22, 24), jasperA, AX, FY + 0.48, AZ, { cast: false });                  // the trochlea
    this._m(new THREE.CylinderGeometry(0.34, 0.3, 0.06, 24), jasperA, AX, FY + 0.62, AZ, { cast: false });                  // its little cornice
    this._m(new THREE.CylinderGeometry(0.24, 0.24, 0.1, 24), jasperA, AX, FY + 0.7, AZ, { cast: false });
    const stylus = this._m(new THREE.CylinderGeometry(0.11, 0.16, 0.45, 16), jasperA, AX, FY + 0.975, AZ, { cast: false });   // the striated stylus, a cubit
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; this._m(new THREE.BoxGeometry(0.025, 0.42, 0.025), lode, AX + Math.cos(a) * 0.13, FY + 0.975, AZ + Math.sin(a) * 0.13, { cast: false }); }
    this._m(new THREE.CylinderGeometry(0.42, 0.12, 0.26, 24), jasperA, AX, FY + 1.33, AZ, { cast: false });                 // the inverted flat
    this._m(new THREE.TorusGeometry(0.4, 0.035, 8, 24), jasperA, AX, FY + 1.46, AZ, { rx: Math.PI / 2, cast: false });      // the sima
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; this._m(new THREE.SphereGeometry(0.09, 7, 5), jasperA, AX + Math.cos(a) * 0.2, FY + 1.52, AZ + Math.sin(a) * 0.2, { cast: false }).scale.set(1.2, 0.5, 1); }   // the quadripartite acanthus
    this._m(new THREE.SphereGeometry(0.1, 10, 8), jasperA, AX, FY + 1.58, AZ, { cast: false });                            // the knot
    const PT = FY + 1.68;
    this._m(new THREE.CylinderGeometry(0.7, 0.62, 0.06, 32), gold, AX, PT - 0.03, AZ, { cast: false });                     // the platter of purest gold
    this._m(new THREE.CylinderGeometry(0.5, 0.5, 0.02, 32), lode, AX, PT + 0.01, AZ, { cast: false });                      // the fire-holder
    for (let k = 0; k < 4; k++) {                                                                                           // four handles, their volutes, the gem strings
      const a = k * Math.PI / 2 + Math.PI / 4;
      const h = this._m(new THREE.TorusGeometry(0.16, 0.025, 6, 12, Math.PI), gold, AX + Math.cos(a) * 0.74, PT - 0.1, AZ + Math.sin(a) * 0.74, { cast: false });
      h.rotation.y = -a + Math.PI / 2; h.rotation.z = Math.PI;
      const b = a + Math.PI / 2;
      const str = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(AX + Math.cos(a) * 0.74, PT - 0.2, AZ + Math.sin(a) * 0.74), new THREE.Vector3(AX + Math.cos((a + b) / 2) * 0.9, PT - 0.42, AZ + Math.sin((a + b) / 2) * 0.9), new THREE.Vector3(AX + Math.cos(b) * 0.74, PT - 0.2, AZ + Math.sin(b) * 0.74)), 12, 0.006, 4), gold);
      this.scene.add(str);
      for (let g = 0; g < 7; g++) {                                                                                         // "larger than a hazelnut, seven to a thread"
        const c = [0xb3243c, 0x1e3f96, 0xeeeeff, 0x0d7548][g % 4];          // ruby, sapphire, diamond, emerald
        this._m(new THREE.SphereGeometry(0.028, 7, 5), woodcut ? S.mat({ tone: 0.2 }) : S.mat({ color: c, roughness: 0.15, metalness: 0.3, emissive: c, emissiveIntensity: 0.3 }), AX + Math.cos(a) * 0.62, PT - 0.12 - g * 0.06, AZ + Math.sin(a) * 0.62, { cast: false });
      }
    }
    this._circleCol(AX, AZ, 1.3);
    // the little priestess's ritual book, bound in cyan velvet worked into a dove, held open on a gold stand before the altar
    this._m(new THREE.CylinderGeometry(0.02, 0.03, 1.0, 6), gold, AX + 0.9, FY + 0.5, AZ + 0.9, { cast: false });
    this._m(new THREE.BoxGeometry(0.42, 0.06, 0.30), M(0x2a7a9a, { roughness: 0.75 }), AX + 0.9, FY + 1.02, AZ + 0.9, { cast: false, rx: -0.5 });
    this._m(new THREE.SphereGeometry(0.06, 8, 7), M(0x2a7a9a, { roughness: 0.75 }), AX + 0.9, FY + 1.1, AZ + 1.05, { cast: false });
    // the golden candelabrum before the altar's step, the pure candle set on it (pp. 225-226)
    this._m(new THREE.CylinderGeometry(0.16, 0.2, 0.06, 12), gold, AX - 0.9, FY + 0.03, AZ + 0.8, { cast: false });
    this._m(new THREE.CylinderGeometry(0.03, 0.05, 1.1, 8), gold, AX - 0.9, FY + 0.6, AZ + 0.8, { cast: false });
    this._m(new THREE.CylinderGeometry(0.1, 0.05, 0.05, 12), gold, AX - 0.9, FY + 1.16, AZ + 0.8, { cast: false });
    this._m(new THREE.CylinderGeometry(0.03, 0.035, 0.4, 8), M(0xf2ecd8, { roughness: 0.7 }), AX - 0.9, FY + 1.38, AZ + 0.8, { cast: false });
    this._m(new THREE.ConeGeometry(0.035, 0.11, 8),
      woodcut ? S.mat({ tone: 0.04 }) : S.mat({ color: 0xffd88a, emissive: 0xe0a030, emissiveIntensity: 1.2, roughness: 0.5 }),
      AX - 0.9, FY + 1.63, AZ + 0.8, { cast: false });
    // the hyacinthine urn "set apart in the sacello" (p. 225), where Polia washed her face
    this._m(new THREE.BoxGeometry(0.5, 0.5, 0.5), marble, AX - 1.7, FY + 0.25, AZ - 0.7, { cast: false });
    this._m(new THREE.SphereGeometry(0.2, 12, 9), M(0x2a44b8, { roughness: 0.25, metalness: 0.2 }), AX - 1.7, FY + 0.72, AZ - 0.7, { cast: false }).scale.y = 1.2;
    this._m(new THREE.CylinderGeometry(0.1, 0.13, 0.12, 12), M(0x2a44b8, { roughness: 0.25, metalness: 0.2 }), AX - 1.7, FY + 1.0, AZ - 0.7, { cast: false });
    // the arcane characters signed in the blood of the swans and doves on the
    // pavement (p. 231), the sponge Polia wiped them with, the golden ewer and
    // simpulum of the washing (p. 232). The characters are not given; these are
    // strokes, not a reading.
    this._m(new THREE.PlaneGeometry(1.0, 0.6), new THREE.MeshBasicMaterial({ map: this._bloodCharacters(), transparent: true }), AX, FY + 0.045, AZ + 1.55, { rx: -Math.PI / 2, cast: false, receive: false });
    this._m(new THREE.SphereGeometry(0.07, 8, 6), M(0xd8c890, { roughness: 1 }), AX + 0.62, FY + 0.09, AZ + 1.5, { cast: false }).scale.y = 0.6;
    this._m(new THREE.CylinderGeometry(0.06, 0.08, 0.2, 10), gold, AX - 0.65, FY + 0.14, AZ + 1.5, { cast: false });
    this._m(new THREE.CylinderGeometry(0.05, 0.02, 0.1, 8), gold, AX - 0.5, FY + 0.09, AZ + 1.6, { cast: false });
    this._plaque({ main: 'CHARACTERES ARCANI', sub: 'SIGNED IN THE BLOOD WITH HER FOREFINGER · WIPED WITH A VIRGIN SPONGE · THE WASHING POVRED ON THE FIRE · PP. 231–232' },
      1.9, 0.3, AX, FY + 0.5, AZ + 2.0, 0, true);

    // ── the miracle of the roses (#84) ────────────────────────────────────
    // "Out of which, purest smoke I saw miraculously issue, germinating, and
    // successively multiplying itself into a verdant rose-bush — which, with
    // multiplied little branches, a great part of the sacred sacello copiously
    // occupied, to the raised altitude of the cupola, with a numerosity of
    // vermilion and rubricating roses together, and with many round fruits …
    // Upon this rosy bush, then, appeared three white little doves" (p. 233).
    // Three of the fruits are taken: one for the priestess, one each for the
    // lovers (p. 233, #85).
    const roseM = M(0xc83a4a, { roughness: 0.7, tone: 0.2 });
    const fruitM = M(0xe8b090, { roughness: 0.6, tone: 0.18 });
    const stem = M(0x4a6a2a, { roughness: 0.9, tone: 0.2 });
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2, rr = 0.1 + (k % 3) * 0.1, len = 1.0 + (k % 4) * 0.35;
      const st = this._m(new THREE.CylinderGeometry(0.02, 0.035, len, 5), stem,
        AX + Math.cos(a) * rr, PT + len / 2, AZ + Math.sin(a) * rr, { cast: false });
      st.rotation.z = Math.cos(a) * 0.45; st.rotation.x = -Math.sin(a) * 0.45;
      const top = [AX + Math.cos(a) * (rr + len * 0.42), PT + len * 0.9, AZ + Math.sin(a) * (rr + len * 0.42)];
      this._m(new THREE.SphereGeometry(k % 3 === 2 ? 0.075 : 0.065, 8, 6), k % 3 === 2 ? fruitM : roseM, ...top, { cast: false });
      for (let q = 0; q < 3; q++) this._m(new THREE.PlaneGeometry(0.16, 0.2), this._leafCardMat('myrtle'), top[0] - 0.1 + q * 0.1, top[1] - 0.15 - q * 0.12, top[2] + 0.05, { cast: false, receive: false }).rotation.set(-0.4, q, 0);
      if (k % 4 === 1) this._m(new THREE.SphereGeometry(0.06, 8, 6), roseM, top[0] + 0.12, top[1] - 0.3, top[2] - 0.08, { cast: false });
    }
    if (!woodcut) {
      const smoke = new ParticleStream({ count: 18, source: new THREE.Vector3(AX, PT + 0.05, AZ), target: new THREE.Vector3(AX + 0.1, PT + 2.2, AZ), color: 0xf0ece4, size: 0.06, speed: 0.25, arc: 0.3 });
      smoke.opacity = 0.28; smoke.active = true; this.style.tuneStream(smoke); this.scene.add(smoke.points); this._streams.push(smoke);
    }
    for (const sx of [-1, 1]) {
      const v = this.cast.nymph({ name: 'swan_virgin_' + sx, robe: 0xf2eee2, h: 0.95, rank: 'tutulus', cutout: null, pose: 'offer' });
      this._npc('venus_swan_virgin_' + (sx + 1), v, TX + sx * 1.1, ANZ + 0.7, sx * 0.4 + Math.PI, { sway: 0.03 });
    }
    for (let k = 0; k < 3; k++) {
      const dove = this.cast.animals.bird ? this.cast.animals.bird(0.5) : null;
      if (!dove) break;
      dove.position.set(AX + (k - 1) * 0.6, PT + 1.5 + k * 0.4, AZ + 0.3 - k * 0.2); this.scene.add(dove);
      this._hovers.push({ g: dove, y: dove.position.y, phase: k * 1.3 });
    }
    this._plaque({ main: 'MIRACVLVM ROSARVM', sub: 'THE ROSES SCATTERED, THE SWANS OFFERED, A ROSE-BVSH RISES FROM THE ALTAR TO THE CVPOLA · THREE FRVITS TASTED · PP. 233–234' },
      2.2, 0.36, AX, FY + 0.95, AZ + 2.1, 0, true);

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
      this._hedgeFringeArc(LX, LZ, r + 0.18, 0.80, 0.55,
        Math.PI / 2 - gap + 0.35, Math.PI / 2 - gap + 0.35 + Math.PI * 2 - 0.7,
        { seed: i });
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
    alab.userData.roll = 'a piece of Indian alabaster';
    mirror.userData.roll = 'a shard of mirror-black stone';
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
    this._m(this._holedDisc(9, PX, PZ, [[PX, PZ, 0.8], [PX + 5.3, PZ - 1.0, 1.15, 0.52]]), ruinMat, PX, 0.03, PZ, { rx: -Math.PI / 2, cast: false });

    // ── Chapter XIX against the ruin (2026-09-06) ─────────────────────────
    // What the book actually describes at its centre and round its edge, from
    // our translation pp. 246-271 and plates #94-#112: the hexagonal porphyry
    // ciborium over a grated shaft; the round vaulted crypt beneath it, on six
    // dwarf columns, with the brass altar-furnace and its dedication to Pluto,
    // Proserpina and Cerberus (#95); the tribune whose vault carries the mosaic
    // of Hell (#96); the porphyry sepulchre of Artemisia (#110); and the
    // epitaphs (#105, #106, #108, #112 and the metal tablet of Leontia).
    this._buildCiborium(PX, PZ);
    this._buildCrypt(PX, PZ);
    this._buildHellTribune(PX - 6.2, PZ - 5.2);
    this._buildArtemisia(PX + 6.8, PZ + 3.2);
    this._buildEpitaphs(PX, PZ);

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
    for (const [dx, dz, ry] of [[-1.0, -6.4, 0.15], [4.4, -6.0, -0.5]]) {
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
      0.8, 0.3, PX - 1.0, 1.05, PZ - 5.85, 0.15, true);

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

  // ── The ciborium (p. 246, plate #94) ────────────────────────────────────
  // "sexangular, with the bases upon a solid stone of Ophite, of the same
  // figure, fixed in the pavement; and six little columns, distant one from
  // the other six feet, with the Epistyle, Frieze and Cornice, without any
  // lineament and sign, but simply terse and pure … upon the flat of the
  // cornice a cupola of a single and solid rock, which thinned at the summit,
  // where a pervious funnel … covered a subterranean vacuity, illuminated by a
  // circular opening of egregious grating". The plate draws the grating as a
  // diamond lattice in the floor between the columns, and the cupola rising
  // to a little funnel. Six feet = 1.8 m between column centres.
  _buildCiborium(PX, PZ) {
    const S = this.style, woodcut = S.key === 'woodcut';
    const porph = woodcut ? S.mat({ tone: 0.2 }) : S.mat({ color: 0x6e2a36, roughness: 0.42, metalness: 0.05 });
    if (!woodcut) this._dress(porph, this._surfaceTexture({ base: '#6e2a36', dark: '#3a1218', light: '#a0606a', blobs: 30, speckle: 5200, repeat: 2 }), 0.1);
    const ophite = woodcut ? S.mat({ tone: 0.12 }) : S.mat({ color: 0x3e5a3a, roughness: 0.5 });
    if (!woodcut) this._dress(ophite, this._surfaceTexture({ base: '#3e5a3a', dark: '#1c2c1a', light: '#7a9a70', blobs: 40, speckle: 3000, veins: 6, repeat: 2 }), 0.15);
    const metal = woodcut ? S.mat({ tone: 0.3 }) : S.mat({ color: 0x2a2620, roughness: 0.5, metalness: 0.8 });
    const R = 1.8;
    // the ophite base, a hexagon with the shaft through it
    const hex = new THREE.Shape();
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; k ? hex.lineTo(2.3 * Math.cos(a), 2.3 * Math.sin(a)) : hex.moveTo(2.3, 0); }
    hex.closePath();
    const hole = new THREE.Path(); hole.absarc(0, 0, 0.8, 0, Math.PI * 2, false); hex.holes.push(hole);
    this._m(new THREE.ExtrudeGeometry(hex, { depth: 0.14, bevelEnabled: false }), ophite, PX, 0.03, PZ, { rx: -Math.PI / 2, cast: false });
    // the shaft's lip, and the grating over it — walkable: it is a grate
    this._m(new THREE.TorusGeometry(0.82, 0.05, 8, 32), metal, PX, 0.18, PZ, { rx: Math.PI / 2, cast: false });
    for (let i = -5; i <= 5; i++) {
      const L = 2 * Math.sqrt(Math.max(0, 0.8 * 0.8 - (i * 0.15) ** 2));
      if (L < 0.1) continue;
      this._m(new THREE.BoxGeometry(L, 0.035, 0.03), metal, PX + i * 0.15 * Math.SQRT1_2, 0.17, PZ + i * 0.15 * Math.SQRT1_2, { ry: Math.PI / 4, cast: false });
      this._m(new THREE.BoxGeometry(L, 0.035, 0.03), metal, PX + i * 0.15 * Math.SQRT1_2, 0.17, PZ - i * 0.15 * Math.SQRT1_2, { ry: -Math.PI / 4, cast: false });
    }
    // six columns, plain, and the six-sided entablature they carry
    const H = 2.7;
    for (let k = 0; k < 6; k++) {
      const a = k * Math.PI / 3, x = PX + R * Math.cos(a), z = PZ + R * Math.sin(a);
      this._m(new THREE.BoxGeometry(0.34, 0.1, 0.34), porph, x, 0.22, z);
      this._m(new THREE.CylinderGeometry(0.12, 0.14, H, 14), porph, x, 0.27 + H / 2, z, { outline: true });
      this._m(new THREE.CylinderGeometry(0.17, 0.12, 0.16, 14), porph, x, 0.27 + H + 0.08, z);
      this._circleCol(x, z, 0.3);
      const b = (k + 0.5) * Math.PI / 3, side = R;                    // the beam between k and k+1
      this._m(new THREE.BoxGeometry(side + 0.4, 0.5, 0.42), porph, PX + R * Math.cos(b) * Math.cos(Math.PI / 6), 0.27 + H + 0.42, PZ + R * Math.sin(b) * Math.cos(Math.PI / 6), { ry: -b + Math.PI / 2, outline: true });
    }
    // the cupola of one stone, thinning to the funnel, seen from below too
    const dome = this._m(new THREE.SphereGeometry(1.5, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), porph, PX, 0.27 + H + 0.67, PZ, { outline: true });
    dome.scale.y = 1.15;
    const under = dome.material.clone(); under.side = THREE.BackSide;
    this._m(new THREE.SphereGeometry(1.48, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), under, PX, 0.27 + H + 0.67, PZ, { cast: false }).scale.y = 1.15;
    this._m(new THREE.CylinderGeometry(0.08, 0.16, 0.5, 12, 1, true), under, PX, 0.27 + H + 0.67 + 1.72 + 0.2, PZ, { cast: false });
    this._m(new THREE.CylinderGeometry(0.12, 0.08, 0.08, 12), porph, PX, 0.27 + H + 0.67 + 1.72 + 0.5, PZ, { cast: false });
    this._plaque({ main: 'CIBORIVM', sub: 'SIX PORPHYRY COLVMNS, SIX FEET APART · A CVPOLA OF ONE STONE · THE GRATE LIGHTS THE CRYPT · P. 246' },
      2.0, 0.34, PX, 0.62, PZ + 2.55, 0, true);
  }

  // ── The crypt (pp. 247-248, plate #95) ──────────────────────────────────
  // "a great and ample subterranean place, vaulted in the round, and, by the
  // humid, ill-resounding. On dwarf columns … Six of them were subjected, at
  // the perpendicular of the overstructures of the cupola … candid of marble,
  // of polished squaring cemented … much aphronitum, or baurach … the sectile
  // paving … befouled by a frequency of night-owls. Between the dwarf columns
  // was founded, on the floor, a bi-square Altar, all of orichalc, six feet
  // long, and with the socle and little cornice half that high. Which was
  // hollow, tomb-wise, like a sepulchre … a grating … a little window" —
  // and on its other face INFERNO PLVTONI TRICORPORI ET CARAE VXORI PROSERPINAE
  // TRICIPITIQVE CERBERO (plate #95 letters it INTERNO PLOTONI). Entered by
  // "a little door" in "a marble pier … invested with an obstinate and flex-
  // footed ivy", down "a blind, sloping little stair" (p. 247). The walker has
  // no floor height, so the pit is fenced and the crypt is seen from above:
  // through the grate, and down the stair.
  _buildCrypt(PX, PZ) {
    const S = this.style, woodcut = S.key === 'woodcut';
    const marble = woodcut ? S.mat({ tone: 0.04 }) : S.mat({ color: 0x6e665e, roughness: 0.7 });
    if (!woodcut) this._dress(marble, this._surfaceTexture({ base: '#6e665e', dark: '#3a342e', light: '#9a928a', blobs: 30, speckle: 3000, courses: 4, repeat: 3 }), 0.2);
    const vaultM = marble.clone(); vaultM.side = THREE.BackSide;
    const floorM = woodcut ? S.mat({ tone: 0.1 }) : S.mat({ color: 0x5a4e42, roughness: 0.7 });
    if (!woodcut) this._dress(floorM, this._surfaceTexture({ base: '#5a4e42', dark: '#2a2018', light: '#8a7e6a', blobs: 20, speckle: 2000, courses: 6, repeat: 5 }), 0.25);
    const brass = woodcut ? S.mat({ tone: 0.28 }) : S.mat({ color: 0xa8842c, roughness: 0.35, metalness: 0.85 });
    const soot = woodcut ? S.mat({ tone: 0.4 }) : S.mat({ color: 0x1a1612, roughness: 0.95 });
    const dark = woodcut ? S.mat({ tone: 0.45 }) : S.mat({ color: 0x0c0a08, roughness: 1 });
    const natron = woodcut ? S.mat({ tone: 0.02 }) : S.mat({ color: 0xe8e4d8, roughness: 0.9 });
    const ivy = woodcut ? S.mat({ tone: 0.2 }) : S.mat({ color: 0x2e5a22, roughness: 0.9 });
    const FL = -3.3, RC = 4.6;
    // floor, vault, and the shaft rising to the grate
    this._m(new THREE.CircleGeometry(RC, 36), floorM, PX, FL, PZ, { rx: -Math.PI / 2, cast: false });
    const vault = this._m(new THREE.SphereGeometry(RC + 0.05, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2), vaultM, PX, FL, PZ, { cast: false });
    vault.scale.y = 0.7;                                   // apex at -0.05
    this._m(new THREE.CylinderGeometry(RC + 0.05, RC + 0.05, 0.5, 36, 1, true), vaultM, PX, FL + 0.25, PZ, { cast: false });
    const shaft = marble.clone(); shaft.side = THREE.DoubleSide;
    this._m(new THREE.CylinderGeometry(0.8, 0.8, 0.9, 24, 1, true), shaft, PX, -0.4, PZ, { cast: false });
    // six dwarf columns under the six above, and the arches' impost ring
    for (let k = 0; k < 6; k++) {
      const a = k * Math.PI / 3, x = PX + 1.8 * Math.cos(a), z = PZ + 1.8 * Math.sin(a);
      this._m(new THREE.BoxGeometry(0.5, 0.12, 0.5), marble, x, FL + 0.06, z, { cast: false });
      this._m(new THREE.CylinderGeometry(0.19, 0.22, 1.5, 12), marble, x, FL + 0.12 + 0.75, z, { cast: false });
      this._m(new THREE.BoxGeometry(0.5, 0.16, 0.5), marble, x, FL + 1.7, z, { cast: false });
      const b = (k + 0.5) * Math.PI / 3;
      this._m(new THREE.BoxGeometry(2.2, 0.3, 0.4), marble, PX + 1.8 * Math.cos(b) * Math.cos(Math.PI / 6), FL + 1.93, PZ + 1.8 * Math.sin(b) * Math.cos(Math.PI / 6), { ry: -b + Math.PI / 2, cast: false });
    }
    // the fixed seats round the wall, "of the proper material"
    for (let k = 0; k < 10; k++) {
      const a = k * Math.PI / 5 + 0.2;
      if (a < 0.5 || Math.PI * 2 - a < 0.5) continue;     // the stair comes in from +x
      this._m(new THREE.BoxGeometry(1.3, 0.45, 0.5), marble, PX + (RC - 0.3) * Math.cos(a), FL + 0.225, PZ + (RC - 0.3) * Math.sin(a), { ry: -a, cast: false });
    }
    // the altar of orichalc: six feet long, half as high with socle and cornice,
    // hollow, with the grate let in a sextant below the top and the stoke-window
    this._m(new THREE.BoxGeometry(2.0, 0.12, 1.1), brass, PX, FL + 0.06, PZ, { cast: false });
    this._m(new THREE.BoxGeometry(1.8, 0.66, 0.9), brass, PX, FL + 0.12 + 0.33, PZ, { cast: false });
    this._m(new THREE.BoxGeometry(1.96, 0.08, 1.06), brass, PX, FL + 0.82, PZ, { cast: false });
    this._m(new THREE.BoxGeometry(1.6, 0.02, 0.7), soot, PX, FL + 0.87, PZ, { cast: false });
    for (let i = -3; i <= 3; i++) this._m(new THREE.BoxGeometry(0.03, 0.03, 0.72), brass, PX + i * 0.22, FL + 0.885, PZ, { cast: false });
    for (let i = -1; i <= 1; i++) this._m(new THREE.BoxGeometry(1.62, 0.03, 0.03), brass, PX, FL + 0.885, PZ + i * 0.3, { cast: false });
    this._m(new THREE.BoxGeometry(0.3, 0.22, 0.04), dark, PX + 0.4, FL + 0.4, PZ + 0.46, { cast: false });   // the little window
    this._plaque({ main: 'INFERNO PLVTONI TRICORPORI', sub: 'ET CARAE VXORI PROSERPINAE TRICIPITIQVE CERBERO · P. 248 · PLATE #95' },
      1.5, 0.42, PX, FL + 0.48, PZ - 0.46, Math.PI, true);
    // the fire that burned the holocausts — the light of the crypt
    const pl = S.pointLight(0xff8c3a, 2.4, 9);
    if (pl) { pl.position.set(PX, FL + 1.3, PZ); this.scene.add(pl); this._pulses.push({ pl, base: 2.4, phase: 0.7 }); }
    const ember = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), woodcut ? soot : S.mat({ color: 0xff6a20, roughness: 1, emissive: 0xff4a10, emissiveIntensity: 1.6 }));
    ember.position.set(PX, FL + 0.7, PZ); this.scene.add(ember);
    // natron strewn on the floor, and the night-owls on the impost
    const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
    for (let i = 0; i < 40; i++) {
      const a = rnd(i, 1) * Math.PI * 2, r = 1.2 + rnd(i, 2) * 3.0;
      this._m(new THREE.SphereGeometry(0.06 + rnd(i, 3) * 0.08, 6, 4), natron, PX + r * Math.cos(a), FL + 0.03, PZ + r * Math.sin(a), { cast: false }).scale.y = 0.35;
    }
    for (const [a, side] of [[0.9, 1], [2.6, -1], [4.3, 1]]) {
      const x = PX + 1.8 * Math.cos(a), z = PZ + 1.8 * Math.sin(a);
      const owl = this._m(new THREE.SphereGeometry(0.13, 8, 6), soot, x, FL + 2.2, z, { cast: false }); owl.scale.set(0.8, 1.15, 0.7);
      for (const sx of [-1, 1]) this._m(new THREE.SphereGeometry(0.03, 6, 4), natron, x + sx * 0.05 * side, FL + 2.25, z + 0.09, { cast: false });
    }
    // the way in: the broken marble pier with its ivy, the little door, and
    // the sloping stair down into the dark — fenced, since the walker cannot go
    // below the sward, but open to look down
    const DX = PX + 7.0, DZ = PZ - 1.0;
    this._m(new THREE.BoxGeometry(1.4, 1.6, 1.0), marble, DX, 0.8, DZ, { outline: true });
    this._m(new THREE.BoxGeometry(0.7, 1.15, 0.06), dark, DX - 0.71, 0.6, DZ, { cast: false });          // the little door, black
    for (let i = 0; i < 14; i++) {
      const y = 0.2 + rnd(i, 4) * 1.5, z = DZ - 0.55 + rnd(i, 5) * 1.1, x = DX - 0.75 + rnd(i, 6) * 0.3;
      this._m(new THREE.SphereGeometry(0.1 + rnd(i, 7) * 0.12, 6, 5), ivy, x, y, z + (rnd(i, 8) - 0.5) * 0.2, { cast: false }).scale.set(0.5, 1, 1.3);
    }
    this._circleCol(DX, DZ, 1.0);
    const pit = [PX + 4.15, PX + 6.45, DZ - 0.52, DZ + 0.52];
    for (let i = 0; i < 11; i++) {                      // eleven steps westward and down
      const x = pit[1] - 0.1 - i * 0.2, y = -0.15 - i * 0.3;
      this._m(new THREE.BoxGeometry(0.22, 0.3, 1.0), marble, x, y, DZ, { cast: false });
    }
    for (const sx of [-1, 1]) this._m(new THREE.BoxGeometry(2.4, 3.4, 0.08), marble, (pit[0] + pit[1]) / 2, -1.7, DZ + sx * 0.55, { cast: false });
    this._m(new THREE.BoxGeometry(0.08, 3.4, 1.1), marble, pit[1] + 0.02, -1.7, DZ, { cast: false });
    this._wallCol(pit[0] - 0.2, pit[1] + 0.2, pit[2] - 0.2, pit[3] + 0.2);
    // a low kerb round the pit, so the fence has a reason
    for (const sx of [-1, 1]) this._m(new THREE.BoxGeometry(2.5, 0.18, 0.12), marble, (pit[0] + pit[1]) / 2, 0.12, DZ + sx * 0.62, { cast: false });
    this._m(new THREE.BoxGeometry(0.12, 0.18, 1.36), marble, pit[0] - 0.08, 0.12, DZ, { cast: false });
    this._plaque({ main: 'THE CRYPT', sub: 'A BLIND, SLOPING LITTLE STAIR · A LITTLE DOOR IN A BROKEN PIER, CHOKED WITH IVY · P. 247' },
      1.8, 0.32, DX - 0.2, 1.05, DZ + 0.9, 0, true);
  }

  // ── The tribune with the mosaic of Hell (pp. 248-251, plate #96) ────────
  // "a tribune somewhat entire … in the heaven of which an artful painting was
  // there left … of colorific work of mosaic": a pumice cavern; on the left a
  // burning lake full of sparks and boiling fire; in front a clay-muddy,
  // glacial lake; on the right a sulphurous mountain venting smoke, with
  // Taenarus, a bronze door, and three-throated Cerberus before it; between
  // the two shores an iron bridge, white-hot to its middle and then frigid,
  // where the souls of either lake try to cross to the other and are thrown
  // back. The title (p. 250): in the flames, those who for too much fire of
  // love killed themselves; in the ice, those who were rigid to Love and
  // refused. hp.db #96 calls it "after Dante". The plate draws the lunette.
  _buildHellTribune(TX, TZ) {
    const S = this.style, woodcut = S.key === 'woodcut';
    const wallM = this._stoneMat;
    const R = 2.5, H = 2.9;
    const g = new THREE.Group(); g.position.set(TX, 0, TZ);
    g.rotation.y = Math.atan2(30 - TX, -27 - TZ); this.scene.add(g);        // the open side (+z) toward the ruin's centre
    // the apse wall, open on the near side, and the quarter-vault over it
    const wallGeo = new THREE.CylinderGeometry(R, R, H, 24, 1, true, Math.PI / 2, Math.PI);
    const wm = wallM.clone(); wm.side = THREE.DoubleSide;
    this._m(wallGeo, wm, 0, H / 2, 0, { parent: g, cast: false });
    const tex = this._hellMosaicTexture();
    const vm = woodcut ? S.mat({ tone: 0.3 }) : new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, side: THREE.BackSide });
    const vault = this._m(new THREE.SphereGeometry(R, 24, 12, Math.PI, Math.PI, 0, Math.PI / 2), vm, 0, H, 0, { parent: g, cast: false });
    vault.scale.y = 0.7;
    const om = wallM.clone(); om.side = THREE.FrontSide;
    this._m(new THREE.SphereGeometry(R + 0.12, 24, 12, Math.PI, Math.PI, 0, Math.PI / 2), om, 0, H, 0, { parent: g, cast: false }).scale.y = 0.7;
    this._m(new THREE.CylinderGeometry(R + 0.12, R + 0.12, H, 24, 1, true, Math.PI / 2, Math.PI), om, 0, H / 2, 0, { parent: g, cast: false });
    // the broken edge: the ruined half of the tribune's ring, a stump each side
    for (const sx of [-1, 1]) {
      this._m(new THREE.BoxGeometry(0.5, 1.2 + (sx > 0 ? 0.6 : 0), 0.5), wallM, sx * R, 0.6 + (sx > 0 ? 0.3 : 0), 0.3, { parent: g, outline: true });
    }
    // the floor of the tribune, and the title under the vault
    this._m(new THREE.CircleGeometry(R, 24, 0, Math.PI), this._darkStoneMat, 0, 0.05, 0, { parent: g, rx: -Math.PI / 2, cast: false });
    this._epitaph([
      { text: 'THE TITLE OF THE MOSAIC', size: 22 },
      { text: 'In the burning flames are condemned the souls that, for too much fire of love, killed their very selves; and in the horrid ice are immersed those who, rigid and chilly to Love and refusing, had obstinately shown themselves.', size: 17 },
      { text: 'CH. XIX, P. 250 · PLATE #96', size: 14 },
    ], 2.2, 0.9, 0, 1.35, -R + 0.08, 0, { parent: g });
    const inCol = (x, z) => { const c = Math.cos(g.rotation.y), s = Math.sin(g.rotation.y); return [TX + x * c + z * s, TZ - x * s + z * c]; };
    for (let k = 0; k <= 6; k++) { const a = Math.PI + k * Math.PI / 6; const [x, z] = inCol(R * Math.cos(a), R * Math.sin(a)); this._circleCol(x, z, 0.5); }
    for (const sx of [-1, 1]) { const [x, z] = inCol(sx * R, 0.3); this._circleCol(x, z, 0.45); }
  }

  _hellMosaicTexture() {
    const W = 1024, Hh = 512, c = document.createElement('canvas'); c.width = W; c.height = Hh;
    const x = c.getContext('2d');
    const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
    // the cavern: thick gloom, pumice pocked with holes
    x.fillStyle = '#1c1418'; x.fillRect(0, 0, W, Hh);
    for (let i = 0; i < 260; i++) { x.fillStyle = i % 2 ? '#2a2024' : '#120c10'; x.beginPath(); x.arc(rnd(i, 1) * W, rnd(i, 2) * Hh * 0.5, 4 + rnd(i, 3) * 18, 0, 6.3); x.fill(); }
    // the burning lake on the left
    const fire = x.createLinearGradient(0, Hh * 0.55, 0, Hh); fire.addColorStop(0, '#b83a10'); fire.addColorStop(0.5, '#e8701a'); fire.addColorStop(1, '#f8c040');
    x.fillStyle = fire; x.beginPath(); x.moveTo(0, Hh * 0.55); x.quadraticCurveTo(W * 0.3, Hh * 0.5, W * 0.46, Hh * 0.62); x.lineTo(W * 0.46, Hh); x.lineTo(0, Hh); x.fill();
    for (let i = 0; i < 300; i++) { x.fillStyle = i % 3 ? '#ffe28a' : '#fff6d0'; x.fillRect(rnd(i, 4) * W * 0.46, Hh * 0.25 + rnd(i, 5) * Hh * 0.7, 2, 2 + rnd(i, 6) * 4); }
    // the glacial lake in front, clay-muddy and rigid
    const ice = x.createLinearGradient(0, Hh * 0.6, 0, Hh); ice.addColorStop(0, '#6a7a86'); ice.addColorStop(1, '#b8c8d4');
    x.fillStyle = ice; x.beginPath(); x.moveTo(W * 0.46, Hh * 0.62); x.quadraticCurveTo(W * 0.7, Hh * 0.56, W, Hh * 0.6); x.lineTo(W, Hh); x.lineTo(W * 0.46, Hh); x.fill();
    x.strokeStyle = '#e8f0f4'; x.lineWidth = 1.5;
    for (let i = 0; i < 40; i++) { x.beginPath(); const px = W * 0.5 + rnd(i, 7) * W * 0.5, py = Hh * 0.65 + rnd(i, 8) * Hh * 0.33; x.moveTo(px, py); x.lineTo(px + 20 + rnd(i, 9) * 40, py + (rnd(i, 10) - 0.5) * 20); x.stroke(); }
    // the sulphurous mountain on the right, venting smoke; Taenarus its bronze door; Cerberus
    x.fillStyle = '#7a6a2a'; x.beginPath(); x.moveTo(W * 0.66, Hh * 0.62); x.lineTo(W * 0.78, Hh * 0.2); x.lineTo(W * 0.9, Hh * 0.34); x.lineTo(W, Hh * 0.18); x.lineTo(W, Hh * 0.62); x.fill();
    for (let i = 0; i < 12; i++) { x.fillStyle = 'rgba(60,50,40,0.6)'; x.beginPath(); x.arc(W * 0.78 + rnd(i, 11) * W * 0.2, Hh * 0.1 + rnd(i, 12) * Hh * 0.25, 10 + rnd(i, 13) * 22, 0, 6.3); x.fill(); }
    x.fillStyle = '#5a3a14'; x.fillRect(W * 0.82, Hh * 0.4, 46, 64); x.strokeStyle = '#c89a40'; x.lineWidth = 3; x.strokeRect(W * 0.82, Hh * 0.4, 46, 64);
    x.fillStyle = '#0a0806';
    for (const dx of [-16, 0, 16]) { x.beginPath(); x.arc(W * 0.84 + 23 + dx, Hh * 0.55, 9, 0, 6.3); x.fill(); }
    x.beginPath(); x.ellipse(W * 0.84 + 23, Hh * 0.6, 30, 14, 0, 0, 6.3); x.fill();
    x.fillStyle = '#ff3020'; for (const dx of [-19, -13, -3, 3, 13, 19]) x.fillRect(W * 0.84 + 23 + dx, Hh * 0.545, 2, 2);
    // the iron bridge between the shores: white-hot to the middle, then most frigid
    x.lineWidth = 12; x.lineCap = 'butt';
    x.strokeStyle = '#ffe0a8'; x.beginPath(); x.moveTo(W * 0.12, Hh * 0.6); x.quadraticCurveTo(W * 0.3, Hh * 0.36, W * 0.5, Hh * 0.4); x.stroke();
    x.strokeStyle = '#2a3440'; x.beginPath(); x.moveTo(W * 0.5, Hh * 0.4); x.quadraticCurveTo(W * 0.7, Hh * 0.44, W * 0.86, Hh * 0.6); x.stroke();
    x.fillStyle = '#ffffff'; x.beginPath(); x.arc(W * 0.5, Hh * 0.4, 7, 0, 6.3); x.fill();
    // the souls: "concreted air" — pale shapes on both shores and on the bridge,
    // some stopping their ears, some hugging their breasts against the cold
    const soul = (px, py, col, sc = 1) => {
      x.fillStyle = col; x.beginPath(); x.ellipse(px, py, 5 * sc, 11 * sc, 0, 0, 6.3); x.fill();
      x.beginPath(); x.arc(px, py - 13 * sc, 4 * sc, 0, 6.3); x.fill();
    };
    for (let i = 0; i < 26; i++) soul(rnd(i, 14) * W * 0.42, Hh * 0.68 + rnd(i, 15) * Hh * 0.28, 'rgba(255,230,200,0.85)', 0.8 + rnd(i, 16) * 0.5);
    for (let i = 0; i < 24; i++) soul(W * 0.5 + rnd(i, 17) * W * 0.4, Hh * 0.7 + rnd(i, 18) * Hh * 0.26, 'rgba(210,225,235,0.85)', 0.8 + rnd(i, 19) * 0.5);
    for (let i = 0; i < 8; i++) { const t = 0.15 + i * 0.1; const py = Hh * (0.6 - Math.sin(t * Math.PI) * 0.22); soul(W * (0.12 + t * 0.74), py - 10, i < 4 ? '#ffd6b0' : '#c8d8e4', 0.7); }
    // the abyss where the two lakes meet, "a most-absorbing vortex"
    x.strokeStyle = 'rgba(0,0,0,0.5)'; x.lineWidth = 3;
    for (let r = 6; r < 60; r += 7) { x.beginPath(); x.ellipse(W * 0.46, Hh * 0.9, r * 1.6, r * 0.5, 0, 0, 6.3); x.stroke(); }
    // tesserae
    x.strokeStyle = 'rgba(20,10,10,0.35)'; x.lineWidth = 1;
    for (let i = 0; i < W; i += 8) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, Hh); x.stroke(); }
    for (let j = 0; j < Hh; j += 8) { x.beginPath(); x.moveTo(0, j); x.lineTo(W, j); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; this._disp.push(t);
    return t;
  }

  // ── The sepulchre of Artemisia (pp. 264-266, plate #110) ────────────────
  // "a disrupted tribune, with the right wall reserved, in which I saw … a
  // porphyry sepulchre": two quadrangular fluted columns, each on a little
  // altar carved with three mourning nymphs; between them a fluted niche with a
  // half-cupola; in the niche, on four gilt lion's claws, an antique little ark;
  // on its cover a throne draped in silk, and on it the Queen of Caria,
  // crowned, "with the right hand she held a chalice to the mouth, drinking;
  // and in the other a little rod, or sceptre" — on her breast ΜΑΥΣΩΛΕΙΟΝ
  // ΑΤΙΜΗΤΟΝ, under the niche ΑΡΤΕΜΙΣΙΔΟΣ ΒΑΣΙΛΙΔΟΣ ΣΠΟΔΩΝ. Over the keystone
  // the crowned, bearded face of Mausolus in an oval, held by two winged
  // spirits with a bronze cord; on the plinth above, a black mirror-stone
  // ΕΡΩΤΟΣ ΚΑΤΟΠΤΡΟΝ with a gilt nude on its rim, spear and shield, and two
  // winged boys with torches. Artemisia drank her husband's ashes.
  _buildArtemisia(AX, AZ) {
    const S = this.style, woodcut = S.key === 'woodcut';
    const porph = woodcut ? S.mat({ tone: 0.2 }) : S.mat({ color: 0x6a2634, roughness: 0.4 });
    if (!woodcut) this._dress(porph, this._surfaceTexture({ base: '#6a2634', dark: '#36101a', light: '#a06070', blobs: 30, speckle: 5000, repeat: 2 }), 0.1);
    const gold = woodcut ? S.mat({ tone: 0.3 }) : S.mat({ color: 0xd8b040, roughness: 0.3, metalness: 0.9 });
    const black = woodcut ? S.mat({ tone: 0.5 }) : S.mat({ color: 0x08080c, roughness: 0.08, metalness: 0.4 });
    const silk = woodcut ? S.mat({ tone: 0.25 }) : S.mat({ color: 0x8a2030, roughness: 0.7 });
    const g = new THREE.Group(); g.position.set(AX, 0, AZ);
    g.rotation.y = Math.atan2(-(AX - 30), -(AZ + 27)); this.scene.add(g);          // front (+z) toward the ruin's centre
    const o = { parent: g };
    // the reserved right wall of the tribune, and the sepulchre against it
    this._m(new THREE.BoxGeometry(4.6, 4.6, 0.5), this._stoneMat, 0, 2.3, -0.7, { ...o, outline: true });
    this._m(new THREE.BoxGeometry(0.5, 2.6, 2.2), this._stoneMat, -2.55, 1.3, 0.4, { ...o, outline: true });
    this._m(new THREE.BoxGeometry(3.6, 0.5, 1.0), porph, 0, 0.25, -0.1, { ...o, outline: true });       // the socle
    for (const sx of [-1, 1]) {
      // the little altar with its three mourning nymphs, and the fluted column on it
      this._m(new THREE.BoxGeometry(0.7, 0.5, 0.6), porph, sx * 1.35, 0.75, 0.05, o);
      for (let k = 0; k < 3; k++) {
        const n = this.cast.nymph({ name: 'lugens' + sx + k, h: 0.3, robe: 0x6a5a70, pose: 'offer', cutout: null });
        n.position.set(sx * 1.35 + (k - 1) * 0.2, 1.0, 0.2); n.rotation.y = (k - 1) * -0.6 * 1; g.add(n);
      }
      this._m(new THREE.BoxGeometry(0.42, 0.12, 0.42), porph, sx * 1.35, 1.06, 0.05, o);
      const col = this._m(new THREE.BoxGeometry(0.34, 2.3, 0.34), porph, sx * 1.35, 2.27, 0.05, { ...o, outline: true });
      for (let f = -1; f <= 1; f++) this._m(new THREE.BoxGeometry(0.05, 2.2, 0.03), this._darkStoneMat, sx * 1.35 + f * 0.1, 2.27, 0.24, { ...o, cast: false });
      this._m(new THREE.BoxGeometry(0.46, 0.18, 0.46), gold, sx * 1.35, 3.5, 0.05, o);
    }
    this._m(new THREE.BoxGeometry(3.6, 0.36, 0.7), porph, 0, 3.78, -0.05, { ...o, outline: true });      // epistyle, frieze, cornice
    this._m(new THREE.BoxGeometry(3.8, 0.1, 0.8), gold, 0, 3.98, -0.05, o);
    // the niche: fluted, half-domed, the ark on its lion's claws
    const nm = porph.clone(); nm.side = THREE.BackSide;
    this._m(new THREE.CylinderGeometry(0.75, 0.75, 1.9, 18, 1, true, Math.PI / 2, Math.PI), nm, 0, 2.05, -0.15, { ...o, cast: false });
    this._m(new THREE.SphereGeometry(0.75, 18, 9, Math.PI, Math.PI, 0, Math.PI / 2), nm, 0, 3.0, -0.15, { ...o, cast: false });
    this._m(new THREE.BoxGeometry(1.2, 0.2, 0.9), porph, 0, 1.1, 0.0, o);                              // the niche's lower plane
    for (const [cx, cz] of [[-0.42, -0.2], [0.42, -0.2], [-0.42, 0.28], [0.42, 0.28]]) this._m(new THREE.SphereGeometry(0.06, 7, 5), gold, cx, 1.25, cz, { ...o, cast: false });
    this._m(new THREE.BoxGeometry(1.0, 0.34, 0.56), porph, 0, 1.47, 0.04, o);                          // the antiquarian little ark
    this._m(new THREE.BoxGeometry(1.06, 0.05, 0.62), gold, 0, 1.66, 0.04, { ...o, cast: false });
    this._m(new THREE.BoxGeometry(0.7, 0.14, 0.44), silk, 0, 1.76, 0.06, { ...o, cast: false });      // the throne, silk-covered, fringed
    for (let i = -3; i <= 3; i++) this._m(new THREE.BoxGeometry(0.04, 0.08, 0.02), gold, i * 0.1, 1.68, 0.29, { ...o, cast: false });
    // the Queen of Caria, drinking
    const q = this.cast.figure({ name: 'Artemisia', h: 0.62, robe: 0x4a2a6a, pose: 'sit', crowned: true });
    q.position.set(0, 1.83, 0.02); g.add(q);
    this._m(new THREE.ConeGeometry(0.045, 0.08, 8), gold, 0.07, 1.83 + 0.62 * 1.5, 0.2, { ...o, cast: false, rx: 0.4 });       // the chalice at her mouth
    this._m(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 6), gold, -0.16, 1.83 + 0.62 * 1.05, 0.14, { ...o, cast: false, rz: 0.15 });  // the sceptre
    g.add(this._plaque({ main: 'ΜΑΥΣΩΛΕΙΟΝ ΑΤΙΜΗΤΟΝ', sub: 'THE PRICELESS MAVSOLEVM · ON HER BREAST' }, 0.5, 0.14, 0, 1.83 + 0.62 * 0.95, 0.19, 0, true));
    g.add(this._plaque({ main: 'ΑΡΤΕΜΙΣΙΔΟΣ ΒΑΣΙΛΙΔΟΣ ΣΠΟΔΩΝ', sub: 'THE ASHES OF QVEEN ARTEMISIA · PP. 264–266 · PLATE #110' }, 1.3, 0.36, 0, 0.77, 0.42, 0, true));
    // the arched architrave, Mausolus in his oval on its keystone, the two
    // winged spirits with the bronze cord
    this._m(new THREE.TorusGeometry(0.8, 0.07, 8, 20, Math.PI), gold, 0, 3.0, 0.25, { ...o, cast: false });
    const oval = this._m(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 20), gold, 0, 3.55, 0.28, { ...o, cast: false, rx: Math.PI / 2 });
    oval.scale.x = 1.3;
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.44), new THREE.MeshBasicMaterial({ map: this._mausolusTexture(), transparent: true }));
    face.position.set(0, 3.55, 0.31); g.add(face);
    for (const sx of [-1, 1]) {
      const sp = this.cast.figure({ name: 'genius' + sx, h: 0.34, robe: null, winged: true, pose: 'sit' });
      sp.position.set(sx * 0.82, 2.98, 0.3); sp.rotation.y = -sx * 0.5; g.add(sp);
    }
    const cord = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(-0.72, 3.18, 0.4), new THREE.Vector3(0, 2.85, 0.45), new THREE.Vector3(0.72, 3.18, 0.4)), 16, 0.012, 5), gold);
    g.add(cord);
    // the plinth on the crown, the mirror of Love, the gilt nude, the torch-boys
    this._m(new THREE.BoxGeometry(1.7, 0.3, 0.7), porph, 0, 4.18, -0.1, o);
    this._m(new THREE.CylinderGeometry(0.34, 0.34, 0.05, 24), gold, 0, 4.7, 0.1, { ...o, cast: false, rx: Math.PI / 2 });
    this._m(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 24), black, 0, 4.7, 0.11, { ...o, cast: false, rx: Math.PI / 2 });
    g.add(this._plaque({ main: 'ΕΡΩΤΟΣ ΚΑΤΟΠΤΡΟΝ', sub: 'THE MIRROR OF LOVE' }, 0.5, 0.15, 0, 4.7, 0.15, 0, true));
    const nude = this.cast.figure({ name: 'clypeus', h: 0.42, robe: null, skin: 0xd8b040, pose: 'stand' });
    nude.position.set(0, 5.04, 0.1); g.add(nude);
    this._m(new THREE.CylinderGeometry(0.008, 0.008, 0.6, 5), gold, 0.1, 5.3, 0.14, { ...o, cast: false });
    this._m(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16), gold, -0.12, 5.3, 0.12, { ...o, cast: false, rx: Math.PI / 2 });
    for (const sx of [-1, 1]) {
      const boy = this.cast.figure({ name: 'fax' + sx, h: 0.3, robe: null, winged: true, pose: 'sit' });
      boy.position.set(sx * 0.62, 4.33, 0.15); boy.rotation.y = -sx * 0.9; g.add(boy);
      this._m(new THREE.CylinderGeometry(0.015, 0.02, 0.3, 6), this._darkStoneMat, sx * 0.5, 4.62, 0.3, { ...o, cast: false });
      this._m(new THREE.SphereGeometry(0.045, 7, 5), woodcut ? this._darkStoneMat : S.mat({ color: 0xffa030, emissive: 0xff6a10, emissiveIntensity: 1.2 }), sx * 0.5, 4.8, 0.3, { ...o, cast: false });
    }
    this._circleCol(AX, AZ, 2.2);
  }

  _mausolusTexture() {
    const N = 128, c = document.createElement('canvas'); c.width = N; c.height = Math.round(N * 1.3);
    const x = c.getContext('2d');
    x.fillStyle = '#c8a040'; x.beginPath(); x.ellipse(N / 2, c.height / 2, N / 2 - 3, c.height / 2 - 3, 0, 0, 6.3); x.fill();
    x.strokeStyle = '#3a2a10'; x.lineWidth = 3; x.fillStyle = '#e8d8b8';
    x.beginPath(); x.ellipse(N / 2, c.height * 0.46, 26, 32, 0, 0, 6.3); x.fill(); x.stroke();      // the head
    x.fillStyle = '#5a4020'; x.beginPath(); x.moveTo(N / 2 - 22, c.height * 0.56); x.lineTo(N / 2 + 22, c.height * 0.56); x.lineTo(N / 2, c.height * 0.88); x.fill();  // the prolix beard
    for (let i = 0; i < 9; i++) { x.beginPath(); x.arc(N / 2 - 28 + i * 7, c.height * 0.3, 5, 0, 6.3); x.fill(); }                                 // twisted hair
    x.fillStyle = '#f0d060'; x.beginPath();
    for (let i = 0; i <= 6; i++) { const px = N / 2 - 27 + i * 9, py = c.height * (i % 2 ? 0.13 : 0.2); i ? x.lineTo(px, py) : x.moveTo(px, py); }
    x.lineTo(N / 2 + 27, c.height * 0.26); x.lineTo(N / 2 - 27, c.height * 0.26); x.fill(); x.stroke();                                              // the crown
    x.fillStyle = '#3a2a10'; x.beginPath(); x.arc(N / 2 - 9, c.height * 0.45, 2.5, 0, 6.3); x.arc(N / 2 + 9, c.height * 0.45, 2.5, 0, 6.3); x.fill();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; this._disp.push(t);
    return t;
  }

  // ── The epitaphs (pp. 252-271; plates #105, #106, #108, #112) ───────────
  // Six of the tombs Poliphilo reads, each on the kind of stone the book gives
  // it, each carrying our translation's text of its inscription. The Latin
  // is the book's; the English is ours (CC0).
  _buildEpitaphs(PX, PZ) {
    const S = this.style, woodcut = S.key === 'woodcut';
    const bronze = woodcut ? S.mat({ tone: 0.32 }) : S.mat({ color: 0x6a4a24, roughness: 0.4, metalness: 0.8 });
    const white = woodcut ? S.mat({ tone: 0.03 }) : S.mat({ color: 0xe0d8c8, roughness: 0.55 });
    const ivory = woodcut ? S.mat({ tone: 0.02 }) : S.mat({ color: 0xf0e8d0, roughness: 0.5 });
    const dark = this._darkStoneMat;
    const towards = (x, z) => Math.atan2(PX - x, PZ - z);         // a +z face turned to the centre
    const stand = (x, z, w, d) => { this._circleCol(x, z, Math.max(w, d) / 2 + 0.25); };

    // 1. Laodia Publia — an altar of the infernal gods (p. 252, plate #108's page)
    let x = PX - 7.0, z = PZ + 3.2, ry = towards(x, z);
    const gA = new THREE.Group(); gA.position.set(x, 0, z); gA.rotation.y = ry; this.scene.add(gA);
    this._m(new THREE.BoxGeometry(1.5, 0.2, 1.0), this._stoneMat, 0, 0.1, 0, { parent: gA });
    this._m(new THREE.BoxGeometry(1.3, 1.1, 0.8), this._stoneMat, 0, 0.75, 0, { parent: gA, outline: true });
    this._m(new THREE.BoxGeometry(1.5, 0.16, 1.0), this._stoneMat, 0, 1.38, 0, { parent: gA });
    for (const sx of [-1, 1]) this._m(new THREE.CylinderGeometry(0.1, 0.1, 1.0, 10), this._stoneMat, sx * 0.65, 1.5, 0, { parent: gA, cast: false, rx: Math.PI / 2 });  // the altar's volutes
    this._epitaph([
      { text: 'ARA DEVM INFER.', size: 26, color: S.plaqueColors.accent || S.plaqueColors.text },
      { text: 'VIATOR, HIC CAESAM LAODIAM PVBLIAM INSPICE, EO QVOD AETATEM SVAM FRAVDAVERAT ABNVERATQ. CONTRA PVELLAR. RITVM IVSSA AMORIS, SEMET EXSPES GLAD. INTERF.', size: 20 },
      { text: 'Traveller, behold here Laodia Publia, slain — because she had defrauded her own youth, and had refused, against the custom of maidens, the commands of Love; and, hopeless, killed herself with the sword. · P. 252', size: 15 },
    ], 1.2, 1.0, 0, 0.78, 0.41, 0, { parent: gA });
    stand(x, z, 1.5, 1.0);

    // 2. Leontia and Lollius — a tablet of metal: "give kisses to the metal" (p. 258)
    x = PX + 3.8; z = PZ + 6.6; ry = towards(x, z);
    const gL = new THREE.Group(); gL.position.set(x, 0, z); gL.rotation.y = ry; this.scene.add(gL);
    this._m(new THREE.BoxGeometry(1.6, 0.3, 0.9), this._stoneMat, 0, 0.15, 0, { parent: gL });
    this._m(new THREE.BoxGeometry(1.3, 1.9, 0.5), this._stoneMat, 0, 1.25, 0, { parent: gL, outline: true });
    this._m(new THREE.BoxGeometry(1.2, 1.5, 0.05), bronze, 0, 1.3, 0.27, { parent: gL, cast: false });
    this._epitaph([
      { text: 'HEVS VIATOR', size: 26, color: S.plaqueColors.accent || S.plaqueColors.text },
      { text: 'Ho, traveller! Interpose thy hands a little in prayer, and, reading, give kisses to the metal: "Ah, cruel monster of Fortune! They ought to have lived." Leontia, chief beloved of Lollius, fled her father; taken by pirates, sold, shipwrecked, they swam for a rock — "Am I a trouble to thee, my life?" — "Lighter than a water-skater, Leontia, little heart" — and drowned together.', size: 14 },
      { text: 'THE EPITAPH OF LEONTIA AND LOLLIVS · P. 258', size: 13 },
    ], 1.15, 1.42, 0, 1.3, 0.3, 0, { parent: gL });
    stand(x, z, 1.6, 0.9);

    // 3. Lyndia and Thasius — the small stone, D · M (p. 260, plate #105)
    x = PX - 3.8; z = PZ + 6.8; ry = towards(x, z);
    const gY = new THREE.Group(); gY.position.set(x, 0, z); gY.rotation.y = ry; this.scene.add(gY);
    this._m(new THREE.BoxGeometry(1.0, 0.2, 0.7), this._stoneMat, 0, 0.1, 0, { parent: gY });
    this._m(new THREE.BoxGeometry(0.8, 1.2, 0.4), white, 0, 0.8, 0, { parent: gY, outline: true });
    this._m(new THREE.CylinderGeometry(0.42, 0.42, 0.4, 3), white, 0, 1.55, 0, { parent: gY, rx: -Math.PI / 2, outline: true }).scale.z = 0.45;
    this._epitaph([
      { text: '· D ·   · M ·', size: 24, color: S.plaqueColors.accent || S.plaqueColors.text },
      { text: 'LYNDIA, THASIVS, PVELLA, PVER. HIC SVM. SINE TE VIVERE NOLVI, MORI MALVI. AT, SI NORIS, SAT EST. · VALE ·', size: 19 },
      { text: 'Lyndia, a girl; Thasius, a boy. Here I am. Without thee I would not live; to die I preferred. But if thou now knowest — it is enough. Farewell. · P. 260', size: 13 },
    ], 0.72, 0.9, 0, 0.82, 0.21, 0, { parent: gY });
    stand(x, z, 1.0, 0.7);

    // 4. Publia Cornelia Annia — the ark she gave herself into (p. 261, plate #106)
    x = PX - 7.6; z = PZ - 1.6; ry = towards(x, z);
    const gC = new THREE.Group(); gC.position.set(x, 0, z); gC.rotation.y = ry; this.scene.add(gC);
    this._m(new THREE.BoxGeometry(2.0, 0.16, 1.0), this._stoneMat, 0, 0.08, 0, { parent: gC });
    this._m(new THREE.BoxGeometry(1.8, 0.8, 0.85), this._stoneMat, 0, 0.56, 0, { parent: gC, outline: true });
    const lidC = this._m(new THREE.BoxGeometry(1.9, 0.18, 0.95), dark, 0, 1.05, 0, { parent: gC });
    lidC.rotation.x = 0.06;
    for (let i = 0; i < 7; i++) this._m(new THREE.SphereGeometry(0.05, 6, 5), woodcut ? dark : S.mat({ color: 0xc03050, roughness: 0.8 }), -0.75 + i * 0.25, 1.16, 0.1, { parent: gC, cast: false });   // the roses they were to adorn it with
    this._epitaph([
      { text: '· D · M ·', size: 22, color: S.plaqueColors.accent || S.plaqueColors.text },
      { text: 'P. CORNELIA ANNIA, NE IN DESOLATA ORBITATE SVPERVIVEREM MISERA, VIVAM ME VLTRO IN HANC ARCAM CVM VIRO DEF. INCOMPAR. AMORE DIL. DAMNAT. DEDO; CVM QVO VIX. ANN. XX SINE VLLA CO. — VALE, VITA.', size: 15 },
      { text: 'That I might not survive in desolate bereavement, I give myself alive into this coffin with my dead husband, with whom I lived twenty years without a quarrel. Let our children yearly sacrifice over our ark to Pluto and Proserpina, and adorn it with roses. Farewell, life. · P. 261', size: 11 },
    ], 1.7, 0.72, 0, 0.58, 0.44, 0, { parent: gC });
    stand(x, z, 2.0, 1.0);

    // 5. Lopidia and Chrysanthes — the large epitaph "O lector infoelix" (p. 263, plate #108)
    x = PX - 7.6; z = PZ + 6.6; ry = towards(x, z);
    const gO = new THREE.Group(); gO.position.set(x, 0, z); gO.rotation.y = ry; this.scene.add(gO);
    this._m(new THREE.BoxGeometry(2.2, 0.24, 0.9), this._stoneMat, 0, 0.12, 0, { parent: gO });
    this._m(new THREE.BoxGeometry(2.0, 2.4, 0.5), this._stoneMat, 0, 1.44, 0, { parent: gO, outline: true });
    this._m(new THREE.BoxGeometry(2.2, 0.2, 0.7), this._stoneMat, 0, 2.74, 0, { parent: gO });
    this._epitaph([
      { text: 'O LECTOR INFOELIX', size: 28, color: S.plaqueColors.accent || S.plaqueColors.text },
      { text: 'O unhappy reader, be present at this monument while it calls thee — and then it asks that thou read into what human pleasure falls. Here is the ash of two lovers who met in a deserted place among ruined rocks, where stood the broken walls of sacred buildings. Lying back, I, Lopidia, saw a snake slipped down from on high. "My Chrysanthes, rise, flee!" — he would attack it — and I saw my Chrysanthes tightly circled in the snake\'s coil, and suffocated.', size: 14 },
      { text: 'THE EPITAPH OF LOPIDIA AND CHRYSANTHES · P. 263 · PLATE #108', size: 12 },
    ], 1.8, 2.1, 0, 1.44, 0.27, 0, { parent: gO });
    stand(x, z, 2.2, 0.9);

    // 6. Trebia Quinta — the ark with two little doors: the world, entered dying
    //    and left being born (pp. 270-271, plate #112): whitest marble, two
    //    fluted columns, a coffered vault in perspective, two turtledoves
    //    drinking together in the pediment, the two weeping figures, and the
    //    paired mottoes of Nature the stepmother and Nature the mother.
    x = PX + 7.2; z = PZ + 7.2; ry = towards(x, z);
    const gT = new THREE.Group(); gT.position.set(x, 0, z); gT.rotation.y = ry; this.scene.add(gT);
    this._m(new THREE.BoxGeometry(2.6, 0.2, 1.2), white, 0, 0.1, 0, { parent: gT });
    this._m(new THREE.BoxGeometry(2.2, 2.6, 0.6), white, 0, 1.5, -0.2, { parent: gT, outline: true });
    for (const sx of [-1, 1]) {
      this._m(new THREE.BoxGeometry(0.34, 0.14, 0.34), white, sx * 0.95, 0.27, 0.2, { parent: gT });
      this._m(new THREE.CylinderGeometry(0.13, 0.15, 2.1, 12), white, sx * 0.95, 1.39, 0.2, { parent: gT, outline: true });
      for (let f = 0; f < 6; f++) this._m(new THREE.BoxGeometry(0.03, 2.0, 0.03), dark, sx * 0.95 + 0.13 * Math.cos(f * 0.5 - 1.25), 1.39, 0.2 + 0.13 * Math.sin(f * 0.5 - 1.25), { parent: gT, cast: false });
      this._m(new THREE.BoxGeometry(0.36, 0.16, 0.36), white, sx * 0.95, 2.52, 0.2, { parent: gT });
    }
    this._m(new THREE.BoxGeometry(2.5, 0.3, 0.8), white, 0, 2.75, 0.05, { parent: gT, outline: true });
    const ped = this._m(new THREE.CylinderGeometry(1.35, 1.35, 0.5, 3), white, 0, 3.15, 0.0, { parent: gT, rx: -Math.PI / 2, outline: true });
    ped.scale.z = 0.42;
    // the turtledoves drinking in the little vase
    this._m(new THREE.CylinderGeometry(0.1, 0.06, 0.14, 8), ivory, 0, 3.0, 0.28, { parent: gT, cast: false });
    for (const sx of [-1, 1]) { const d = this._m(new THREE.SphereGeometry(0.06, 7, 5), ivory, sx * 0.14, 3.06, 0.28, { parent: gT, cast: false }); d.scale.set(1.4, 0.8, 0.8); d.rotation.z = -sx * 0.5; }
    // the coffered arch in perspective, cut low into the stone; the ark with its two doors
    const cm = white.clone(); cm.side = THREE.BackSide;
    this._m(new THREE.CylinderGeometry(0.72, 0.72, 0.9, 16, 1, true, Math.PI, Math.PI), cm, 0, 1.55, 0.1, { parent: gT, cast: false });
    for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) { const a = Math.PI + (k + 0.5) * Math.PI / 5; this._m(new THREE.BoxGeometry(0.16 - r * 0.03, 0.16 - r * 0.03, 0.02), dark, 0.62 * Math.cos(a) * (1 - r * 0.12), 1.55 + 0.62 * Math.sin(a) * (1 - r * 0.12) * 0.55 + 0.1, 0.35 - r * 0.28, { parent: gT, cast: false, ry: 0 }); }
    this._m(new THREE.BoxGeometry(1.3, 0.55, 0.5), white, 0, 0.62, 0.22, { parent: gT, outline: true });
    for (const sx of [-1, 1]) {
      this._m(new THREE.BoxGeometry(0.3, 0.4, 0.03), dark, sx * 0.4, 0.62, 0.48, { parent: gT, cast: false });          // the two little doors
      const f = this.cast.figure({ name: 'plorans' + sx, h: 0.36, robe: null, pose: 'stand' });
      f.position.set(sx * 0.4, 0.4, 0.55); f.rotation.y = sx * 1.3; gT.add(f);                                          // going in dying, coming out being born
    }
    for (const sx of [-1, 1]) this._m(new THREE.ConeGeometry(0.06, 0.16, 5), dark, sx * 0.55, 0.28, 0.42, { parent: gT, cast: false, rx: -0.5 });   // the harpy feet
    this._epitaph([
      { text: '· D · DITI ET PROSER. · S · V · F · TREBIAE Q. L. S. TREBII FILIAE', size: 17, color: S.plaqueColors.accent || S.plaqueColors.text },
      { text: 'Sacred to Dis and Proserpina. This monument of love and of piety Aulus Fibustius, her husband, raised — with whom, with the utmost longing, she lived one month, three days. Perturbed by an extreme jealousy — when she suspected that I had lain with another — her sweetest love converted into fury, with the sword through the middle of the breast she killed herself. Alas, wife — why this?', size: 12 },
      { text: 'THE INEVITABLE STATE OF NATVRE THE STEPMOTHER · THE BENIGN EDICT OF NATVRE THE MOTHER · P. 271', size: 11 },
    ], 1.24, 0.66, 0, 1.0, 0.48, 0, { parent: gT });
    gT.add(this._plaque({ main: 'AN ARK WITH TWO DOORS', sub: 'WHO ENTERS, DYING; WHO GOES OVT, BEING BORN · THIS WORLD · P. 270 · PLATE #112' },
      1.6, 0.3, 0, 3.55, 0.3, 0, true));
    stand(x, z, 2.6, 1.2);
  }

  // Strokes of blood on the pavement of the sacello: "many arcane characters
  // diligently signed" with a forefinger (p. 231). The book gives no forms.
  _bloodCharacters() {
    const N = 256, c = document.createElement('canvas'); c.width = N; c.height = Math.round(N * 0.6);
    const x = c.getContext('2d');
    const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
    x.strokeStyle = 'rgba(110,14,20,0.85)'; x.lineCap = 'round'; x.lineWidth = 5;
    for (let i = 0; i < 9; i++) {
      const cx = 20 + i * 26, cy = 40 + rnd(i, 1) * 60;
      x.beginPath(); x.moveTo(cx, cy);
      for (let k = 1; k < 5; k++) x.quadraticCurveTo(cx + (rnd(i, k * 2) - 0.5) * 30, cy + (rnd(i, k * 2 + 1) - 0.5) * 40, cx + (rnd(i, k * 3) - 0.5) * 22, cy + (k - 2) * 14);
      x.stroke();
    }
    x.fillStyle = 'rgba(110,14,20,0.5)';
    for (let i = 0; i < 20; i++) { x.beginPath(); x.arc(rnd(i, 7) * N, rnd(i, 8) * c.height, 1 + rnd(i, 9) * 3, 0, 6.3); x.fill(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; this._disp.push(t);
    return t;
  }

  // ── The spring and the stream of chapter II (Dallington p. 18) ──────────
  // "a pleasant spring or head of water, did offer it selfe vnto me, with a
  // great vayne boyling vp, about the which did growe diuers sweet hearbes and
  // water flowers, and from the same did flowe a cleare and chrystalline
  // current streame, which deuided into diuers branches, ran thorow the desart
  // wood, with a turning and winding body … In whose courses the stones lift vp
  // by nature, and trunkes of trees denyed any longer by their roots to be
  // vpholden, did cause a stopping hinderance to their current". Rhizopoulou
  // 2016 lists the plants of these two leaves (a2-a4): cane and reed, rushes,
  // willow and osier, bramble and briar, ash, elm, holm oak, prunus, thistles.
  // The world had the spring as a round pool and no stream at all.
  _buildStream() {
    const S = this.style, woodcut = S.key === 'woodcut';
    const pts = [[-3.6, 37.5], [-6.4, 39.2], [-9.8, 40.4], [-13.4, 42.6], [-17.6, 43.4], [-21.8, 45.6], [-26.4, 46.2], [-30.6, 48.0], [-35.4, 48.8], [-40.5, 50.6], [-44, 52]];
    const w = this._waterMat();
    // a pale gravel bed under the water, or the stream is invisible on the duff
    const bed = woodcut ? S.mat({ tone: 0.02, rim: 0 }) : S.mat({ color: 0xb8ad94, roughness: 0.95 });
    if (!woodcut) this._dress(bed, this._surfaceTexture({ base: '#b8ad94', dark: '#6a6050', light: '#e0d8c4', blobs: 40, speckle: 5000, repeat: 6 }), 0.25);
    this.scene.add(this._ribbon(pts.map(([x, z]) => new THREE.Vector3(x, 0.014, z)), 1.9, bed));
    this.scene.add(this._ribbon([[-13.4, 42.6], [-14.8, 45.4], [-15.6, 48.6], [-16.2, 51.5]].map(([x, z]) => new THREE.Vector3(x, 0.013, z)), 1.2, bed));
    const ribbon = this._ribbon(pts.map(([x, z]) => new THREE.Vector3(x, 0.025, z)), 1.3, w);
    this.scene.add(ribbon);
    const branch = this._ribbon([[-13.4, 42.6], [-14.8, 45.4], [-15.6, 48.6], [-16.2, 51.5]].map(([x, z]) => new THREE.Vector3(x, 0.024, z)), 0.7, w);
    this.scene.add(branch);
    const stone = woodcut ? S.mat({ tone: 0.12 }) : S.mat({ color: 0x6a6660, roughness: 0.95 });
    const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
    // the stones lifted up by nature, and two trunks fallen across
    for (let i = 0; i < 16; i++) {
      const t = 0.1 + rnd(i, 1) * 0.85, k = Math.floor(t * (pts.length - 1)), f = t * (pts.length - 1) - k;
      const x = pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f + (rnd(i, 2) - 0.5) * 1.0, z = pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f + (rnd(i, 3) - 0.5) * 1.0;
      this._m(this._indexed(new THREE.DodecahedronGeometry(0.12 + rnd(i, 4) * 0.18, 0)), stone, x, 0.06, z, { cast: false }).rotation.set(rnd(i, 5) * 3, rnd(i, 6) * 3, 0);
    }
    for (const [x, z, ry] of [[-11.5, 41.4, 0.5], [-28.5, 47.0, -0.35]]) {
      const trunk = this._m(new THREE.CylinderGeometry(0.16, 0.2, 3.0, 8), this._trunkMat, x, 0.2, z, { outline: true });
      trunk.rotation.z = Math.PI / 2; trunk.rotation.y = ry;
    }
    // the sweet herbs and water flowers about the spring
    for (let k = 0; k < 10; k++) { const a = k * 0.63; this._tuft(-3.6 + Math.cos(a) * 1.25, 0.02, 37.5 + Math.sin(a) * 1.25, k % 2 ? 'waterflower' : 'mint', 0.3); }
    // reeds and rushes on the banks, osiers leaning over the water
    for (let i = 0; i < 44; i++) {
      const t = 0.05 + rnd(i, 7) * 0.9, k = Math.floor(t * (pts.length - 1)), f = t * (pts.length - 1) - k;
      const dx = pts[k + 1][0] - pts[k][0], dz = pts[k + 1][1] - pts[k][1], L = Math.hypot(dx, dz);
      const nx = -dz / L, nz = dx / L, side = i % 2 ? 1 : -1, off = 0.85 + rnd(i, 8) * 0.5;
      const x = pts[k][0] + dx * f + nx * side * off, z = pts[k][1] + dz * f + nz * side * off;
      if (Math.abs(x) < 2.7) continue;
      this._tuft(x, 0.02, z, i % 3 === 0 ? 'rush' : 'reed', 0.5 + rnd(i, 9) * 0.35);
    }
    for (const [x, z] of [[-8.6, 41.9], [-19.2, 42.2], [-24.6, 47.9], [-33.2, 47.3]]) this._tree(x, z, 0.45, 'willow');
    this._plaque({ main: 'A PLEASANT SPRING OR HEAD OF WATER', sub: 'DIVERS SWEET HEARBES AND WATER FLOWERS · A CLEARE AND CHRYSTALLINE CVRRENT STREAME · DALLINGTON P. 18' },
      2.4, 0.32, -3.6, 0.7, 35.9, 0, true);
  }

  // A flat ribbon of water along a curve, for streams. Width in metres; UVs
  // run along the length so the water normal map drifts downstream.
  _ribbon(points, width, mat) {
    const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
    const N = Math.max(12, Math.round(curve.getLength() * 3));
    const pos = [], uv = [], idx = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, p = curve.getPointAt(t), tan = curve.getTangentAt(t);
      const nx = -tan.z, nz = tan.x, hw = width / 2 * (0.85 + 0.15 * Math.sin(t * 23.1));
      pos.push(p.x + nx * hw, p.y, p.z + nz * hw, p.x - nx * hw, p.y, p.z - nz * hw);
      uv.push(t * curve.getLength() / 2.5, 0, t * curve.getLength() / 2.5, 1);
      if (i < N) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }   // wound to face up
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.castShadow = false;
    return m;
  }

  // ── Geusia's river (Dallington p. 122; Rhizopoulou 2016 e8, h7) ─────────
  // "comming neare to a fresh coole Riuer … Geussia … bowed her selfe downe to
  // the water, beautifully adorned with the bendyng Bull Rushe, water Spyke,
  // swimmyng Vitrix, and aboundaunce of water Symples, shee dyd plucke vp the
  // Heraclea Nympha, of some called water Lillye or Nenuphar, and the roote of
  // Aron or wake Robyn … And Amella or Bawme Gentill". The bridge's watercourse
  // is that river; it had nothing growing in or beside it.
  _buildRiverPlants(BX = -11, BZ = 20) {
    const S = this.style, woodcut = S.key === 'woodcut';
    const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
    for (let i = 0; i < 26; i++) {
      const side = i % 2 ? 1 : -1, z = BZ - 7.2 + rnd(i, 1) * 14.4;
      if (Math.abs(z - BZ) < 2.3 || Math.abs(z - 14) < 1.8) continue;          // the two bridges
      this._tuft(BX + side * (1.55 + rnd(i, 2) * 0.35), 0.03, z, i % 3 === 0 ? 'rush' : i % 3 === 1 ? 'reed' : 'arum', 0.45 + rnd(i, 3) * 0.3);
    }
    // the nenuphar: pads on the water, a few white flowers
    const pad = woodcut ? S.mat({ tone: 0.2 }) : S.mat({ color: 0x2f6a2a, roughness: 0.6 });
    const bloom = woodcut ? S.mat({ tone: 0.0 }) : S.mat({ color: 0xf6f2e4, roughness: 0.5 });
    for (let i = 0; i < 18; i++) {
      const x = BX + (rnd(i, 4) - 0.5) * 2.4, z = BZ - 7 + rnd(i, 5) * 14;
      if (Math.abs(z - BZ) < 2.4 || Math.abs(z - 14) < 1.9) continue;
      const p = this._m(new THREE.CircleGeometry(0.14 + rnd(i, 6) * 0.1, 12, 0.3, Math.PI * 2 - 0.5), pad, x, 0.075, z, { rx: -Math.PI / 2, cast: false });
      p.rotation.z = rnd(i, 7) * 6.3;
      if (i % 3 === 0) { for (let q = 0; q < 6; q++) this._m(new THREE.ConeGeometry(0.03, 0.09, 5), bloom, x + Math.cos(q * 1.05) * 0.05, 0.12, z + Math.sin(q * 1.05) * 0.05, { cast: false, rx: -0.5 * Math.cos(q * 1.05), rz: 0.5 * Math.sin(q * 1.05) }); this._m(new THREE.SphereGeometry(0.025, 6, 5), woodcut ? bloom : S.mat({ color: 0xe8c040, roughness: 0.6 }), x, 0.13, z, { cast: false }); }
    }
    for (const [x, z] of [[BX - 2.1, BZ + 5.6], [BX + 2.0, BZ - 5.8]]) this._tuft(x, 0.03, z, 'balm', 0.42);
    this._plaque({ main: 'THE BENDYNG BVLL RVSHE · THE NENVPHAR · ARON · AMELLA', sub: 'WHAT GEVSSIA GATHERS AT THE FRESH COOLE RIVER · DALLINGTON P. 122' },
      2.4, 0.32, BX + 2.6, 0.62, BZ + 4.8, -Math.PI / 2, true);
  }

  // ── The Polyandrion's weeds (our pp. 272-273; Rhizopoulou 2016) ─────────
  // "I found huge stones of the putrescent wall gaping, and grassy through the
  // cracks with aster and pellitory; which was also entangled and destroyed, as
  // by a wedge fixed of a big root of an aged wild-fig" (p. 272); "among caustic
  // nettles and pathless ruins … all full of burs and down, and thistle-tufts,
  // and goat's-beard, and sowthistle" (p. 273). Rhizopoulou: "pellitory and
  // hammerwort were growing in dry cracks of tombs", and "thorny plants, sharp
  // thistles and cedars are cited in the text as occurring among ancient
  // monuments and historical ruins".
  _buildRuinWeeds(PX = 30, PZ = -27) {
    const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
    const wz = PZ + 9.4;
    // aster and pellitory in the cracks of the medallion wall and the temple front
    for (let i = 0; i < 26; i++) {
      const x = PX - 4.2 + rnd(i, 1) * 8.4, y = 0.35 + rnd(i, 2) * 2.0;
      this._tuft(x, y, wz - 0.55, i % 2 ? 'pellitory' : 'aster', 0.36 + rnd(i, 3) * 0.16, { flat: true, ry: Math.PI });
    }
    for (const [dx, hgt] of [[-3.2, 3.4], [-1.1, 3.4], [1.1, 1.6], [3.2, 2.3]]) {
      this._tuft(PX + dx + 0.3, 0.3 + hgt * 0.5, PZ - 3.4 + 0.42, 'pellitory', 0.2, { flat: true });
      this._tuft(PX + dx - 0.25, hgt - 0.1, PZ - 3.4 + 0.42, 'aster', 0.18, { flat: true });
    }
    // the aged wild fig, rooted in the wall's end, its roots over the stones
    this._tree(PX + 5.1, wz - 1.1, 0.7, 'fig');
    for (let k = 0; k < 4; k++) this._limb(this.scene, this._trunkMat, PX + 5.1, 0.35, wz - 1.1, PX + 4.2 + k * 0.5, 0.06, wz - 0.4 - (k % 2) * 0.8, 0.07, 0.03);
    // nettles, burs, thistle-tufts, goat's-beard and sowthistle round the ruin's rim
    const KINDS = ['nettle', 'thistle', 'goatsbeard', 'sowthistle', 'thistle', 'nettle', 'bur'];
    for (let i = 0; i < 46; i++) {
      const a = rnd(i, 4) * Math.PI * 2, r = 9.3 + rnd(i, 5) * 1.6;
      const x = PX + Math.cos(a) * r, z = PZ + Math.sin(a) * r;
      if (z > PZ + 8.4 && Math.abs(x - PX) < 5.2) continue;                    // the medallion wall
      this._tuft(x, 0.02, z, KINDS[i % KINDS.length], 0.32 + rnd(i, 6) * 0.25);
    }
    for (const [x, z] of [[PX - 11.5, PZ + 4.5], [PX + 11.8, PZ - 5.5]]) this._tree(x, z, 1.0, 'cedar');
    this._plaque({ main: 'ASTER AND PELLITORY IN THE CRACKS', sub: 'AN AGED WILD-FIG ROOTED IN THE WALL · NETTLES, BVRS, THISTLE-TVFTS, GOAT’S-BEARD, SOWTHISTLE · PP. 272–273' },
      2.4, 0.32, PX + 4.8, 0.62, wz - 1.9, Math.PI, true);
  }

  // ── Herbs: a clump drawn once per kind, stood up as crossed cards ────────
  // `flat` pins a single card to a wall (the pellitory in a crack).
  _tuft(x, y, z, kind, s = 0.4, { flat = false, ry = 0, parent = null } = {}) {
    const mat = this._herbMat(kind);
    const geo = this._tuftGeo = this._tuftGeo || new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0);
    const g = new THREE.Group(); g.position.set(x, y, z); (parent || this.scene).add(g);
    const n = flat ? 1 : 3;
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(geo, mat);
      m.rotation.y = ry + (flat ? 0 : i * Math.PI / 3 + (x * 7.3 + z * 3.1) % 1.0);
      if (flat) m.rotation.x = 0.12;
      m.scale.set(s * (flat ? 1.4 : 1.0), s * 1.15, 1);
      m.castShadow = false; m.receiveShadow = false;
      g.add(m);
    }
    return g;
  }
  _herbMat(kind) {
    // (the material carries its own roll-up name; see _rollName)
    this._herbMats = this._herbMats || {};
    if (this._herbMats[kind]) return this._herbMats[kind];
    const tex = this._herbTexture(kind);
    const m = this.style.key === 'woodcut'
      ? new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide })
      : new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9 });
    m.userData.roll = `a tuft of ${kind}`;
    this._disp.push(m); this._herbMats[kind] = m;
    return m;
  }
  static get HERBS() {
    // form: blade | oval | spiky | serrated | feather | fern | rosette | reed
    return {
      reed:         { form: 'reed',     green: '#6a7a3a', light: '#9aa650', flower: '#5a3a1e', fsize: 7, stems: 9,  h: 1.0 },
      rush:         { form: 'blade',    green: '#2e5a24', light: '#4a7a34', flower: '#7a5a2a', fsize: 3, stems: 14, h: 0.95 },
      arum:         { form: 'oval',     green: '#2c5a22', light: '#4a8a34', flower: '#f4f0e0', fsize: 14, stems: 4, h: 0.8, spathe: true },
      // The umbriphilous three of Dallington p. 92: "iagged Polypodie, and the
      // Trientall and foure inched Scolopendria, or Hartes toongue, Heleborous
      // Niger, or Melampodi ... and such other Vmbriphilous hearbes". Two ferns
      // and a shade flower; they grow in the shaded walk and nowhere else.
      polypody:     { form: 'fern',     green: '#2a4a20', light: '#48762e', flower: '#3a5a26', fsize: 2, stems: 7, h: 0.55 },
      hartstongue:  { form: 'blade',    green: '#28522a', light: '#4e8438', flower: '#2e5a2c', fsize: 2, stems: 8, h: 0.7 },
      hellebore:    { form: 'rosette',  green: '#1e3c1c', light: '#3a6030', flower: '#e8eae0', fsize: 9, stems: 5, h: 0.5, second: '#b8c0a8' },
      balm:         { form: 'serrated', green: '#3a6a2a', light: '#6a9a44', flower: '#f0eef4', fsize: 4, stems: 6, h: 0.75 },
      mint:         { form: 'serrated', green: '#2e5e2a', light: '#5a8e44', flower: '#c8a0d8', fsize: 5, stems: 7, h: 0.7 },
      waterflower:  { form: 'oval',     green: '#3c6a2c', light: '#6a9a4a', flower: '#f6f2d0', fsize: 7, stems: 6, h: 0.6, second: '#f0d040' },
      nettle:       { form: 'serrated', green: '#254a1c', light: '#3e6e2c', flower: '#8a9a6a', fsize: 3, stems: 6, h: 0.9 },
      thistle:      { form: 'spiky',    green: '#5a7a5a', light: '#8aa68a', flower: '#8a4aa8', fsize: 9, stems: 5, h: 0.95 },
      sowthistle:   { form: 'spiky',    green: '#3e6a30', light: '#6a9a4a', flower: '#f0d030', fsize: 7, stems: 5, h: 0.85 },
      goatsbeard:   { form: 'blade',    green: '#5a7a40', light: '#8aa860', flower: '#e8e2c0', fsize: 10, stems: 6, h: 0.9 },
      bur:          { form: 'oval',     green: '#4a6a2c', light: '#7a9a48', flower: '#6a5a30', fsize: 6, stems: 5, h: 0.7 },
      pellitory:    { form: 'oval',     green: '#7aa060', light: '#a8c88a', flower: '#b06a5a', fsize: 2, stems: 8, h: 0.6, stem: '#a04a3a' },
      aster:        { form: 'blade',    green: '#3e6a34', light: '#6a9a54', flower: '#f4f0f8', fsize: 7, stems: 6, h: 0.7, second: '#e8c040' },
      marjoram:     { form: 'oval',     green: '#6a8a5a', light: '#9ab48a', flower: '#d88ab0', fsize: 5, stems: 9, h: 0.7 },
      southernwood: { form: 'feather',  green: '#7a8a6a', light: '#a8b898', flower: '#c8c060', fsize: 2, stems: 9, h: 0.8 },
      groundpine:   { form: 'spiky',    green: '#6a8a2a', light: '#a0c040', flower: '#f0e050', fsize: 4, stems: 8, h: 0.55 },
      thyme:        { form: 'oval',     green: '#3a5a34', light: '#5a7a54', flower: '#b070c0', fsize: 3, stems: 11, h: 0.5 },
      rue:          { form: 'fern',     green: '#5a8a6a', light: '#8ab89a', flower: '#e8d040', fsize: 4, stems: 6, h: 0.7 },
    };
  }
  _herbTexture(kind) {
    this._herbTex = this._herbTex || {};
    const ink = this.style.key === 'woodcut', key = kind + (ink ? '#ink' : '');
    if (this._herbTex[key]) return this._herbTex[key];
    const H = HPWorldScene.HERBS[kind] || HPWorldScene.HERBS.rush;
    const N = 128, c = document.createElement('canvas'); c.width = c.height = N;
    const x = c.getContext('2d');
    const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7 + kind.length * 5.7) * 43758.5453; return v - Math.floor(v); };
    const draw = (sc, gTone, lTone, fTone, sTone, lw) => {
      x.save(); x.translate(N / 2, N); x.scale(sc, sc); x.translate(-N / 2, -N);
      x.lineCap = 'round';
      for (let i = 0; i < H.stems; i++) {
        const a = (i / (H.stems - 1) - 0.5) * 1.5 + (rnd(i, 1) - 0.5) * 0.3, len = N * H.h * (0.7 + rnd(i, 2) * 0.3);
        const tx = N / 2 + Math.sin(a) * len * 0.55, ty = N - Math.cos(a) * len;
        x.strokeStyle = sTone || gTone; x.lineWidth = 2 + lw;
        x.beginPath(); x.moveTo(N / 2, N); x.quadraticCurveTo(N / 2 + Math.sin(a) * len * 0.2, N - len * 0.5, tx, ty); x.stroke();
        const tone = rnd(i, 3) < 0.5 ? gTone : lTone;
        x.fillStyle = tone; x.strokeStyle = tone;
        if (H.form === 'blade' || H.form === 'reed') {
          x.lineWidth = (H.form === 'reed' ? 5 : 3) + lw;
          x.beginPath(); x.moveTo(N / 2, N); x.quadraticCurveTo(N / 2 + Math.sin(a) * len * 0.25, N - len * 0.55, tx, ty); x.stroke();
        } else {
          const leaves = H.form === 'feather' ? 10 : 6;
          for (let k = 1; k <= leaves; k++) {
            const t = k / (leaves + 1), px = N / 2 + (tx - N / 2) * t, py = N - (N - ty) * t, side = k % 2 ? 1 : -1;
            const L = (H.form === 'feather' ? 7 : H.form === 'fern' ? 9 : 8) * (1 - t * 0.4);
            x.save(); x.translate(px, py); x.rotate(a + side * 1.0);
            if (H.form === 'oval') { x.beginPath(); x.ellipse(0, -L / 2, L * 0.35, L / 2 + lw / 2, 0, 0, 6.3); x.fill(); }
            else if (H.form === 'serrated') { x.beginPath(); x.moveTo(0, 0); for (let q = 0; q < 5; q++) { x.lineTo(L * 0.35 * (q % 2 ? 0.55 : 1), -L * (q + 1) / 5); } x.lineTo(0, -L * 1.05); for (let q = 4; q >= 0; q--) { x.lineTo(-L * 0.35 * (q % 2 ? 0.55 : 1), -L * (q + 1) / 5); } x.closePath(); x.fill(); }
            else if (H.form === 'spiky') { x.beginPath(); x.moveTo(0, 0); for (let q = 0; q < 4; q++) { x.lineTo(L * 0.5, -L * (q + 0.5) / 4); x.lineTo(L * 0.15, -L * (q + 1) / 4); } x.lineTo(0, -L * 1.1); for (let q = 3; q >= 0; q--) { x.lineTo(-L * 0.15, -L * (q + 1) / 4); x.lineTo(-L * 0.5, -L * (q + 0.5) / 4); } x.closePath(); x.fill(); }
            else { x.lineWidth = 1.2 + lw; x.beginPath(); x.moveTo(0, 0); x.lineTo(0, -L); x.stroke(); for (let q = 1; q < 4; q++) { x.beginPath(); x.moveTo(0, -L * q / 4); x.lineTo(L * 0.3, -L * q / 4 - 2); x.moveTo(0, -L * q / 4); x.lineTo(-L * 0.3, -L * q / 4 - 2); x.stroke(); } }
            x.restore();
          }
        }
        // the flower head, or the seed
        if (fTone && H.fsize) {
          x.fillStyle = (H.second && i % 2) ? H.second : fTone;
          if (H.spathe) { x.beginPath(); x.moveTo(tx, ty + 2); x.quadraticCurveTo(tx - H.fsize, ty - H.fsize, tx, ty - H.fsize * 1.6); x.quadraticCurveTo(tx + H.fsize * 0.8, ty - H.fsize * 0.6, tx, ty + 2); x.fill(); }
          else if (H.form === 'reed') { x.fillRect(tx - 2.2 - lw / 2, ty - H.fsize * 2.4, 4.4 + lw, H.fsize * 2.4); }
          else if (H.form === 'spiky' && kind === 'thistle') { x.beginPath(); x.arc(tx, ty, H.fsize * 0.45 + lw / 2, 0, 6.3); x.fill(); for (let q = 0; q < 9; q++) { x.beginPath(); x.moveTo(tx, ty); x.lineTo(tx + Math.cos(q * 0.7 - 2.6) * H.fsize, ty + Math.sin(q * 0.7 - 2.6) * H.fsize); x.lineWidth = 1.5 + lw; x.strokeStyle = x.fillStyle; x.stroke(); } }
          else { for (let q = 0; q < (H.fsize > 5 ? 5 : 1); q++) { x.beginPath(); x.arc(tx + (q ? Math.cos(q * 1.257) * H.fsize * 0.45 : 0), ty + (q ? Math.sin(q * 1.257) * H.fsize * 0.45 : 0), H.fsize * (H.fsize > 5 ? 0.3 : 0.6) + lw / 2, 0, 6.3); x.fill(); } if (H.fsize > 5 && H.second) { x.fillStyle = H.second; x.beginPath(); x.arc(tx, ty, H.fsize * 0.22, 0, 6.3); x.fill(); } }
        }
      }
      x.restore();
    };
    if (ink) { draw(1.06, '#1a1410', '#1a1410', '#1a1410', '#1a1410', 2.4); draw(1.0, '#f2ecd8', '#d8d0bc', '#f2ecd8', '#f2ecd8', 0); }
    else draw(1.0, H.green, H.light, H.flower, H.stem, 0);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; this._disp.push(t);
    this._herbTex[key] = t;
    return t;
  }
  // A bed of one herb, tiled round a terrace ring
  _herbBedTexture(kind) {
    this._herbBeds = this._herbBeds || {};
    if (this._herbBeds[kind]) return this._herbBeds[kind];
    const H = HPWorldScene.HERBS[kind] || HPWorldScene.HERBS.thyme;
    const N = 128, c = document.createElement('canvas'); c.width = c.height = N;
    const x = c.getContext('2d');
    x.fillStyle = '#3a2c1c'; x.fillRect(0, 0, N, N);
    const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7 + kind.length * 3.1) * 43758.5453; return v - Math.floor(v); };
    for (let i = 0; i < 160; i++) { x.fillStyle = i % 2 ? H.green : H.light; x.beginPath(); x.arc(rnd(i, 1) * N, rnd(i, 2) * N, 2.5 + rnd(i, 3) * 3.5, 0, 6.3); x.fill(); }
    for (let i = 0; i < 70; i++) { x.fillStyle = H.flower; x.beginPath(); x.arc(rnd(i, 4) * N, rnd(i, 5) * N, 1.2 + rnd(i, 6) * 1.6, 0, 6.3); x.fill(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(24, 2); this._disp.push(t);
    this._herbBeds[kind] = t;
    return t;
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

    // Cupid's boat, riding at the pier's end -- the book's own exeres, since
    // 2026-09-08 (ch. XIX-XX, our pp. 276-277, 284-285, 290)
    this._buildExeres(0, -47.2);

    // (The old distant-isle mock stood here at z = -58. The real island is now
    // built by _buildCytheraIsle at z = -150, hazed by the same fog that used
    // to stand in for it.)
  }

  // ── Cupid's exeres: the boat of the crossing (chs. XIX–XX) ─────────────────
  //
  // Found by the coverage ledger, 2026-09-08: chapter XX had never been read
  // against the world, and the shore had a generic skiff with a sail. The book
  // gives the boat in detail across three pages and the world had none of it.
  //
  // THE HULL (our p. 276). An *exeres*, "a little vessel … fixed with a
  // rowing-apparatus of six oars", daubed not with pitch but with a balm of
  // benzoin, ladanum, musk, amber, civet and storax, "compaginated and
  // interwoven of white sandalwood, and citrine odoriferous, and of grave and
  // non-carious aloewood", "fixed with little gold nails, which, in their
  // bosses … shone with … most-precious gems". "The gratings and the thwarts
  // were of blood-red sandalwood." And (p. 284) "which had for its poop the
  // prow, and for its prow the poop": both ends alike. There is NO SAIL —
  // p. 290 has "the divine boy making sail with his spread wings".
  //
  // THE OARS (p. 276). "Of illustrious and snowy ivory … and the rowlocks of
  // gold, and the oar-thongs of commixed and twisted silk."
  //
  // THE ROWERS (p. 277), named and dressed in three pairs: Aselgia and Neolea
  // in cloth-of-gold on a warp of cyan silk; Chlidonia and Olvolia in
  // Babylonian sea-purple; Adea and Cypria in slashed melledarum set with gold
  // foil, "the ivory arms bared". Hair "most-blond" on some, on others "more
  // black than Indian ebony". Their names mean what they are — Aselgia is
  // wantonness, Chlidonia daintiness, Cypria of Venus's own isle — and they are
  // the six-voice choir of p. 285.
  //
  // THE STANDARD (p. 284). "In the mast-step was raised a golden spear, with a
  // triumphal and imperatorial standard, of thin silken cloth, of cyan dye; in
  // which, of little gems … with whitest pearls, were … re-woven, on both
  // faces … three hieroglyphs: an antique little vase, in the mouth-gap of
  // which burned a little flame; and then was the world; joined together with
  // a little branch of osier." Poliphilo reads it: AMOR VINCIT OMNIA. The
  // reading is on a plaque beside the pier, not on the silk — the silk carries
  // the signs, and reading them is the point.
  //
  // CUPID (p. 285) stands at the prow, "fanning the sacred feathers of his
  // perpetual wings … shone more than refined gold, of various and
  // most-pleasant colouring, rotating in a circle above the little waves":
  // rainbow wings, spread, the boat's only sail.
  _buildExeres(BX, BZ) {
    const S = this.style, woodcut = S.key === 'woodcut';
    const g = new THREE.Group();
    g.position.set(BX, 0.1, BZ);
    this.scene.add(g);
    this._boat = g;
    const at = (geo, mat, x, y, z, o = {}) => this._m(geo, mat, x, y, z, { parent: g, ...o });

    const sandal = woodcut ? S.mat({ tone: 0.06 }) : S.mat({ color: 0xd9c49a, roughness: 0.62 });   // white and citrine sandalwood
    const aloe   = woodcut ? S.mat({ tone: 0.10 }) : S.mat({ color: 0x9a7a52, roughness: 0.7 });
    const red    = woodcut ? S.mat({ tone: 0.2 })  : S.mat({ color: 0x8e2f28, roughness: 0.6 });     // blood-red sandalwood
    const gold   = woodcut ? S.mat({ tone: 0.04 }) : S.mat({ color: 0xd9b25a, roughness: 0.22, metalness: 0.95 });
    const ivory  = woodcut ? S.mat({ tone: 0.0 })  : S.mat({ color: 0xefe6d2, roughness: 0.4 });
    const silk   = woodcut ? S.mat({ tone: 0.16 }) : S.mat({ color: 0xc8b4d8, roughness: 0.8 });
    sandal.userData.roll = 'a plank of sandalwood'; red.userData.roll = 'a thwart of red sandalwood';
    ivory.userData.roll = 'an ivory oar'; gold.userData.roll = 'a gold rowlock';

    // ── the hull: one form at both ends, "for its prow the poop" ────────
    const L = 3.7, BEAM = 1.05, DEPTH = 0.62;
    // white sandalwood, "interwoven" with the darker aloewood as the seams of
    // the strakes -- the pale wood is the hull, the dark is the joinery
    const hull = at(new THREE.SphereGeometry(1, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), sandal, 0, DEPTH, 0, { outline: true });
    hull.scale.set(BEAM, DEPTH, L);
    for (let i = 0; i < 4; i++) {
      const t = i / 4, ring = at(new THREE.TorusGeometry(1, 0.03, 6, 40), aloe, 0, DEPTH - t * DEPTH * 0.8, 0, { cast: false });
      const k = Math.sqrt(1 - (t * 0.8) ** 2);
      ring.scale.set(BEAM * k, L * k, 1);
      ring.rotation.x = Math.PI / 2;
    }
    // the gunwale, and the gold nails with their gems along it
    const rail = at(new THREE.TorusGeometry(1, 0.05, 8, 48), red, 0, DEPTH + 0.02, 0, { cast: false });
    rail.scale.set(BEAM + 0.02, L + 0.02, 1); rail.rotation.x = Math.PI / 2;
    const GEMS = woodcut ? [gold] : [gold, S.mat({ color: 0xc0303c, roughness: 0.2 }), gold, S.mat({ color: 0x2c58a8, roughness: 0.2 }),
                                    gold, S.mat({ color: 0x3a8a4a, roughness: 0.2 })];
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      at(new THREE.SphereGeometry(0.03, 7, 5), GEMS[i % GEMS.length], Math.cos(a) * (BEAM + 0.02), DEPTH + 0.07, Math.sin(a) * (L + 0.02), { cast: false })
        .userData.roll = i % 2 ? 'a gold nail' : 'a gem from the gunwale';
    }
    // the deck inside, the gratings fore and aft, the three thwarts
    const deck = at(new THREE.CircleGeometry(1, 32), aloe, 0, DEPTH * 0.45, 0, { rx: -Math.PI / 2, cast: false });
    deck.scale.set(BEAM * 0.86, L * 0.9, 1);
    for (const e of [-1, 1]) {
      for (let k = 0; k < 6; k++) at(new THREE.BoxGeometry(0.05, 0.03, 0.9), red, -0.5 + k * 0.2, DEPTH * 0.48, e * (L * 0.72), { cast: false });
    }
    for (const z of [-1.2, 0, 1.2]) at(new THREE.BoxGeometry(BEAM * 1.7, 0.08, 0.26), red, 0, DEPTH * 0.72, z, { cast: false });
    this._circleCol(BX, BZ, 2.4);

    // ── six ivory oars in gold rowlocks, three a side ───────────────────
    const oarGeo = new THREE.CylinderGeometry(0.022, 0.03, 2.9, 8);
    for (const side of [-1, 1]) {
      for (let k = 0; k < 3; k++) {
        const z = -1.2 + k * 1.2;
        const lock = at(new THREE.TorusGeometry(0.06, 0.016, 6, 12), gold, side * (BEAM + 0.02), DEPTH + 0.12, z, { cast: false });
        lock.rotation.y = Math.PI / 2;
        const oar = at(oarGeo, ivory, side * (BEAM + 0.9), DEPTH - 0.25, z, { cast: false });
        oar.rotation.z = side * -1.15; oar.rotation.y = side * 0.12;
        const blade = at(new THREE.BoxGeometry(0.05, 0.55, 0.16), ivory, side * (BEAM + 2.05), DEPTH - 0.78, z, { cast: false });
        blade.rotation.z = side * -1.15;
      }
    }

    // ── the six rowers, named, in their three pairs ─────────────────────
    // cloth-of-gold on cyan / Babylonian sea-purple / melledarum with gold foil
    const CREW = [
      { name: 'Aselgia',   sub: 'WANTONNESS',     robe: 0xd9b25a, hair: 0xe0c070 },
      { name: 'Neolea',    sub: 'YOUTH',           robe: 0xc9a84a, hair: 0x1a1410 },
      { name: 'Chlidonia', sub: 'DAINTINESS',      robe: 0x5a2a6a, hair: 0xe0c070 },
      { name: 'Olvolia',   sub: 'HAPPINESS',       robe: 0x6a3478, hair: 0x1a1410 },
      { name: 'Adea',      sub: 'FEARLESSNESS',    robe: 0xd8b07a, hair: 0xe0c070 },
      { name: 'Cypria',    sub: 'OF VENUS’S ISLE', robe: 0xe2be86, hair: 0x1a1410 },
    ];
    CREW.forEach((c, i) => {
      const side = i % 2 ? 1 : -1, z = -1.2 + Math.floor(i / 2) * 1.2;
      const n = this.cast.nymph({ name: c.name, robe: c.robe, hair: c.hair, h: 0.9, pose: 'sit', cutout: null });
      n.position.set(side * 0.34, DEPTH * 0.72 - 0.3, z + 0.1);   // seated: the thwart takes the gown's hem
      n.rotation.y = Math.PI;                       // rowers face the poop
      g.add(n);
      const lb = this.cast.label(c.name, { sub: c.sub, scale: 0.7 });
      lb.position.set(0, 1.35, 0);
      n.add(lb);
      this._npcs.push({ g: n, phase: i * 1.05, baseY: Math.PI, sway: 0.02 });
    });

    // ── the golden spear at the mast-step, and the cyan standard ────────
    const SPEAR = 3.4;
    at(new THREE.CylinderGeometry(0.03, 0.04, SPEAR, 8), gold, 0, DEPTH * 0.45 + SPEAR / 2, 0);
    at(new THREE.ConeGeometry(0.07, 0.3, 8), gold, 0, DEPTH * 0.45 + SPEAR + 0.12, 0, { cast: false });
    const std = woodcut
      ? S.mat({ tone: 0.12, side: THREE.DoubleSide })
      : new THREE.MeshStandardMaterial({ map: this._standardTexture(), roughness: 0.75, side: THREE.DoubleSide });
    if (!woodcut) this._disp.push(std);
    std.userData.roll = 'the standard of the crossing';
    const flag = at(new THREE.PlaneGeometry(1.5, 0.95, 12, 1), std, 0, DEPTH * 0.45 + SPEAR - 0.55, 0.8, { cast: false });
    flag.rotation.y = Math.PI / 2;
    // it flutters "at the soft breaths of the spring-bearing zephyr" (p. 284)
    this._standard = { m: flag, base: flag.geometry.attributes.position.array.slice() };

    // ── Cupid at the prow, his wings the sail ───────────────────────────
    const cupid = this.cast.figure({ h: 0.62, robe: null, pose: 'beckon' });
    cupid.position.set(0, DEPTH + 0.34, -L * 0.82);
    cupid.rotation.y = Math.PI;                     // he faces the shore, and the willing
    g.add(cupid);
    const cl = this.cast.label('Cupid', { sub: 'THE FERRYMAN' });
    cl.position.set(0, 1.0, 0);
    cupid.add(cl);
    this.npcs.cupid = cupid;
    const wing = woodcut
      ? S.mat({ tone: 0.02, side: THREE.DoubleSide })
      : new THREE.MeshStandardMaterial({ map: this._wingTexture(), alphaTest: 0.4, side: THREE.DoubleSide,
                                         roughness: 0.6, emissive: 0x201008, emissiveIntensity: 0.3 });
    if (!woodcut) this._disp.push(wing);
    wing.userData.roll = 'a feather of Cupid’s wing';
    for (const sx of [-1, 1]) {
      const w = at(new THREE.PlaneGeometry(1.5, 1.1), wing, sx * 0.62, DEPTH + 0.95, -L * 0.82 + 0.1, { cast: false });
      w.rotation.set(0.15, sx * 0.5, sx * 0.35);
      if (sx > 0) w.scale.x = -1;
    }

    // ── and the reading, by the pier ────────────────────────────────────
    this._plaque({ main: 'AMOR VINCIT OMNIA', sub: 'A VASE WITH A FLAME IN ITS MOVTH · THE WORLD · BOVND WITH A WITHY OF OSIER · SO THE STANDARD READS, ON CYAN SILK, IN GEMS AND PEARLS · OVR P. 284' },
      2.6, 0.44, -1.9, 1.05, -42.6, Math.PI * 0.12, true);
  }

  // The standard: cyan silk, and the three signs of p. 284 in gold thread and
  // pearl — "an antique little vase, in the mouth-gap of which burned a little
  // flame; and then was the world; joined together with a little branch of
  // osier". Both faces alike, as the book says.
  _standardTexture() {
    if (this._standardTex) return this._standardTex;
    const W = 512, H = 320;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');
    x.fillStyle = '#1f6f93'; x.fillRect(0, 0, W, H);                  // cyan dye
    // the weave
    x.strokeStyle = 'rgba(255,255,255,0.05)'; x.lineWidth = 1;
    for (let i = 0; i < W; i += 4) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); }
    for (let j = 0; j < H; j += 4) { x.beginPath(); x.moveTo(0, j); x.lineTo(W, j); x.stroke(); }
    // gold border with pearls
    x.strokeStyle = '#d9b25a'; x.lineWidth = 6; x.strokeRect(12, 12, W - 24, H - 24);
    x.fillStyle = '#f4efe2';
    for (let i = 0; i < 24; i++) { x.beginPath(); x.arc(24 + i * (W - 48) / 23, 12, 4, 0, 6.3); x.fill(); x.beginPath(); x.arc(24 + i * (W - 48) / 23, H - 12, 4, 0, 6.3); x.fill(); }
    const gold = (draw) => {
      x.save(); x.translate(2, 2); x.strokeStyle = '#7a5a20'; x.fillStyle = '#7a5a20'; x.lineWidth = 9; draw(); x.restore();
      x.save(); x.strokeStyle = '#e8c86a'; x.fillStyle = '#e8c86a'; x.lineWidth = 7; draw(); x.restore();
    };
    // the vase, with the flame in its mouth
    gold(() => {
      x.lineJoin = 'round'; x.lineCap = 'round';
      x.beginPath(); x.moveTo(120, 118); x.lineTo(108, 150); x.quadraticCurveTo(100, 230, 150, 240);
      x.quadraticCurveTo(200, 230, 192, 150); x.lineTo(180, 118); x.closePath(); x.stroke();
      x.beginPath(); x.moveTo(112, 118); x.lineTo(188, 118); x.stroke();
      x.beginPath(); x.moveTo(108, 160); x.quadraticCurveTo(80, 170, 100, 200); x.stroke();     // handles
      x.beginPath(); x.moveTo(192, 160); x.quadraticCurveTo(220, 170, 200, 200); x.stroke();
    });
    x.fillStyle = '#ffb648';                                             // the little flame
    x.beginPath(); x.moveTo(150, 60); x.quadraticCurveTo(178, 92, 150, 114); x.quadraticCurveTo(122, 92, 150, 60); x.fill();
    x.fillStyle = '#fff1c0';
    x.beginPath(); x.moveTo(150, 80); x.quadraticCurveTo(161, 96, 150, 110); x.quadraticCurveTo(139, 96, 150, 80); x.fill();
    // the world
    gold(() => {
      x.beginPath(); x.arc(370, 160, 68, 0, 6.3); x.stroke();
      x.beginPath(); x.moveTo(302, 160); x.lineTo(438, 160); x.stroke();                     // the T-O of the mappa mundi
      x.beginPath(); x.moveTo(370, 160); x.lineTo(370, 228); x.stroke();
      x.beginPath(); x.moveTo(370, 92); x.lineTo(370, 70); x.stroke();                       // the cross above it
      x.beginPath(); x.moveTo(358, 78); x.lineTo(382, 78); x.stroke();
    });
    // the osier withy, binding the two
    x.save(); x.strokeStyle = '#8fb86a'; x.lineWidth = 8; x.lineCap = 'round';
    x.beginPath(); x.moveTo(205, 185); x.bezierCurveTo(240, 120, 280, 120, 300, 178);
    x.bezierCurveTo(280, 240, 240, 240, 205, 185); x.stroke();
    x.strokeStyle = '#c8e090'; x.lineWidth = 3;
    x.beginPath(); x.moveTo(206, 182); x.bezierCurveTo(240, 122, 280, 122, 298, 176); x.stroke();
    x.restore();
    // pearls scattered along the signs
    x.fillStyle = '#f4efe2';
    [[150, 240], [108, 150], [192, 150], [370, 92], [438, 160], [302, 160], [370, 228], [252, 132], [252, 228]].forEach(([px, py]) => {
      x.beginPath(); x.arc(px, py, 4.5, 0, 6.3); x.fill();
    });
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    this._disp.push(t);
    return (this._standardTex = t);
  }

  // Cupid's wings, "of various and most-pleasant colouring" (p. 285): a
  // feathered cutout banded through the colours of a rainbow, gold at the root.
  _wingTexture() {
    if (this._wingTex) return this._wingTex;
    const W = 256, H = 192;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');
    x.clearRect(0, 0, W, H);
    const BANDS = ['#e8c85a', '#e07a3a', '#d84a4a', '#b05aa8', '#4a70c8', '#3aa0b8', '#6ab86a'];
    // seven rows of feathers, the outermost longest, each row a colour
    for (let r = 0; r < BANDS.length; r++) {
      const t = r / (BANDS.length - 1);
      x.fillStyle = BANDS[r];
      const n = 7 + r;
      for (let i = 0; i < n; i++) {
        const u = i / (n - 1);
        const x0 = 10 + u * (W - 40) * (0.35 + t * 0.65);
        const y0 = 20 + t * (H - 60) * 0.35;
        const len = 40 + t * 70 - u * 20;
        x.beginPath();
        x.ellipse(x0 + len * 0.5, y0 + len * 0.45, len * 0.55, 13 + t * 5, 0.75 - u * 0.5, 0, 6.3);
        x.fill();
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    this._disp.push(t);
    return (this._wingTex = t);
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
    // TWENTY, not twelve (2026-09-08). Our p. 294 does not merely assert the
    // number -- it gives the classical golden-section construction for
    // inscribing a decagon in a circle and then says "these twenty divisions".
    // Segre reads the same twenty as the bosco's twenty compartments, each a
    // different plantation, and his 240 corner fruit trees are 4 x 20 x 3
    // orders of meadow. Everything radial on this island is therefore twenty.
    const STEP = Math.PI / 10;                      // twenty radial roads
    const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
    // The sacred fountain of Adonis (ch. XXIV) takes one bosco compartment, off
    // a road that ends at its grove. Not a cardinal: the four cardinals are the
    // chariot roads and run clear through.
    const ADONIS_K = 3, ADONIS_A = ADONIS_K * STEP, ADONIS_R = 42;

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
    // The road on the Adonis compartment stops at the sacred enclosure: the
    // company comes to the fountain "by the paths or streets marked out among
    // the plants of the fruit-bearing orchards" (p. 369) and the grove closes
    // round it.
    for (let k = 0; k < 20; k++) {
      const a = k * STEP, cardinal = k % 5 === 0;
      const r0 = cardinal ? 7.6 : 22.2, r1 = k === ADONIS_K ? ADONIS_R - 6.4 : 49;
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
    const BOSCO = ['cypress', 'pine', 'juniper', 'olive', 'laurel', 'arbutus', 'palm', 'orange',
                   'plane', 'oak', 'elm', 'citron', 'fir', 'beech', 'cedar', 'myrtle',
                   'fig', 'lemon', 'willow', 'apple'];
    for (let k = 0; k < 20; k++) {
      const a0 = k * STEP;
      for (let t = 0; t < 5; t++) {
        const a = a0 + (0.14 + rnd(k * 7 + t, 1) * 0.72) * STEP;
        const r = 37 + rnd(k * 7 + t, 2) * 9.5;
        const [x, z] = pos(a, r);
        // the sacred grove keeps its own clearing
        const [ax, az] = pos(ADONIS_A, ADONIS_R);
        if (Math.hypot(x - ax, z - az) < 7.4) continue;
        this._tree(x, z, 0.9 + rnd(k * 7 + t, 3) * 0.5, BOSCO[k]);
      }
      // the enclosure: a cypress at mid-wedge on the rim, myrtle beneath it
      const [ex, ez] = pos(a0 + STEP / 2, 48.2);
      this._tree(ex, ez, 1.25, 'cypress');
      const [mx, mz] = pos(a0 + STEP / 2 + 0.06, 47.0);
      this._tree(mx, mz, 0.55, 'myrtle');
    }

    // ── The twenty fences (our p. 294) ────────────────────────────────────
    // One on each half-radius, so each compartment has a road down its middle
    // and a marble lattice on either hand, with a gate in each. Twenty fences,
    // twenty climbers, the book's own list in the book's own order.
    const CLIMB = HPWorldScene.CYTHERA_CLIMBERS;
    for (let k = 0; k < 20; k++) {
      this._cytheraFence(CX, CZ, (k + 0.5) * STEP, 36.0, 48.4,
        CLIMB[k % CLIMB.length], k);
    }

    // ── Middle claustro: the prati ────────────────────────────────────────
    // Flowery lawns, each with a fountain or a topiary at its centre and
    // fruit trees about it; bounded inside by the bitter-orange espalier.
    // (chords short enough to leave every radial road its full 2.6 u of way)
    for (let i = 0; i < 20; i++) {
      const a = (i + 0.5) * STEP;
      const [x, z] = pos(a, 34.2);
      this._hedge(x, 0.55, z, 6.2, 1.05, 0.5, { ry: -a + Math.PI / 2 });
      this._circleCol(x, z, 2.2);
      for (const s of [-1.9, 0, 1.9]) {
        const [ox, oz] = pos(a + s / 34.2, 34.2);
        this._m(new THREE.SphereGeometry(0.14, 8, 6),
          lit ? S.mat({ color: 0xd8842a, roughness: 0.5 }) : S.mat({ tone: 0.06 }),
          ox, 1.22, oz, { cast: false });
      }
    }
    for (let k = 0; k < 20; k++) {
      const am = k * STEP + STEP / 2;
      const [cx, cz] = pos(am, 27.5);
      if (k % 2 === 0) {
        // The clipped work the book says is trimmed every day — and the plates
        // name each piece rather than leaving it generic: the box man carrying
        // two towers and an arch (#117), the mushroom (#120), the three
        // peacocks on their altar-vase (#127), the ring-tree on its altar
        // (#116/#125). Six lawns, so each figure appears once or twice.
        this._topiary(['man', 'mushroom', 'peacocks', 'ring', 'mushroom',
                       'man', 'ring', 'peacocks', 'mushroom', 'ring'][k / 2], cx, cz, 0.95);
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
    // The beds are the "kitchen-garden" bands of our p. 320: "the first band
    // was most densely of marjoram. The second of southernwood. The third of
    // ground-pine. The rhomb of mountain thyme … the circuit of the rose …
    // sweet-scented violets … the circles … filled with rue … flowering primrose".
    // Rhizopoulou 2016 (u3-u6′) confirms every one of them as a plant of the
    // book: marjoram, southernwood, ground-pine, thyme, germander, rue, primula.
    // 2026-09-08: 0.42 / 0.84 / 1.26 -> 0.70 / 1.40 / 2.10, now that the walker
    // has floor height and a terrace can be stood on instead of walked through.
    // The outer ring is the ridge and the rings fall away inward to the Area,
    // because these three rings ARE the auditorium. Its outer face reaches to
    // r 18 so the box rampart stands on the terrace rather than beside it.
    const tiers = [
      { r0: 8, r1: 11, h: 0.70, bed: 0xc84a5a, herb: 'marjoram' },
      { r0: 11, r1: 14, h: 1.40, bed: 0xe07a8a, herb: 'southernwood' },
      { r0: 14, r1: 18, h: 2.10, bed: 0xd8a850, herb: 'groundpine' },
    ];
    // …and they are floors you stand on -- but as FOUR ARCS each, with the
    // crossroads left out, exactly as the tops themselves are drawn. The
    // crossroads belong to the flights of steps; if the terrace floor covered
    // them the last stride of every flight would be a teleport.
    for (let q = 0; q < 4; q++) {
      const t0 = q * Math.PI / 2 + 0.17, t1 = q * Math.PI / 2 + Math.PI / 2 - 0.17;
      this.walker.floors.push(
        { kind: 'ring', cx: CX, cz: CZ, r0: 14.0, r1: 18.0, y: 2.10, a0: t0, a1: t1 },
        { kind: 'ring', cx: CX, cz: CZ, r0: 11.0, r1: 14.0, y: 1.40, a0: t0, a1: t1 },
        { kind: 'ring', cx: CX, cz: CZ, r0:  8.0, r1: 11.0, y: 0.70, a0: t0, a1: t1 },
      );
    }
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
        ? new THREE.MeshStandardMaterial({ map: this._herbBedTexture(t.herb), roughness: 0.9 })
        : S.mat({ tone: 0.16 });
      if (lit) this._disp.push(bedMat);
      this._m(new THREE.RingGeometry(t.r0 + 0.15, t.r0 + 0.75, 40), bedMat, CX, t.h + 0.02, CZ, { rx: -Math.PI / 2, cast: false });
      this._m(new THREE.CylinderGeometry(t.r0 + 0.78, t.r0 + 0.78, 0.12, 40, 1, true), this._hedgeMat, CX, t.h + 0.06, CZ, { cast: false })
        .material.side = THREE.DoubleSide;
      this._hedgeFringeArc(CX, CZ, t.r0 + 0.78, t.h + 0.12, 0.12, 0, Math.PI * 2,
        { density: 2.2, seed: Math.round(t.r0) });
    });
    // the herbs themselves stand in the beds as tufts, and the bands are named
    tiers.forEach((t, ti) => {
      for (let k = 0; k < 40; k++) {
        const a = k * Math.PI * 2 / 40 + ti * 0.05;
        if (Math.abs(Math.sin(2 * a)) < 0.12) continue;                 // the four crossroads
        this._tuft(CX + Math.cos(a) * (t.r0 + 0.45), t.h + 0.02, CZ + Math.sin(a) * (t.r0 + 0.45), t.herb, 0.34 + (k % 3) * 0.06);
      }
    });
    this._plaque({ main: 'MARJORAM · SOVTHERNWOOD · GROVND-PINE', sub: 'THE FIRST BAND MOST DENSELY OF MARJORAM, THE SECOND OF SOVTHERNWOOD, THE THIRD OF GROVND-PINE · P. 320' },
      2.4, 0.32, CX + 9.6, 0.70 + 0.7, CZ + 0.9, Math.PI / 2, true);
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
    // ── The flights of seven steps, at the four crossroads ───────────────
    // "each reached by a flight of seven steps; the steps break at crossroads
    // marked by ornate gates for the passage of the triumphal chariots"
    // (Segre, GARDENS.md 5). Four flights on each of the four crossroads: up
    // from the bank onto the ridge, then down through the three rings of the
    // auditorium to the Area. Seven risers in every one of them.
    for (let q = 0; q < 4; q++) {
      const a = q * Math.PI / 2;
      // The runs are long enough to be walked rather than climbed: 2.10 m over
      // 2.8 m of run is about 37 degrees, which is a temple stair; the three
      // garden flights are 30. Seven risers in each, whatever the run.
      this._cytheraSteps(CX, CZ, a, 20.40, 17.60, 0,    2.10);   // the bank to the ridge
      this._cytheraSteps(CX, CZ, a, 14.60, 13.40, 2.10, 1.40);   // then down the auditorium
      this._cytheraSteps(CX, CZ, a, 11.60, 10.40, 1.40, 0.70);
      this._cytheraSteps(CX, CZ, a,  8.60,  7.40, 0.70, 0);
      // …and the landings between them. A crossroad is a ROAD across the
      // terrace, level with it, not a hole between two flights: without these
      // the walk drops to the sward the moment it steps off a stair.
      const G = 0.19;                                    // half the road, in radians
      for (const [r0, r1, y] of [[14.60, 17.60, 2.10], [11.60, 13.40, 1.40], [8.60, 10.40, 0.70]]) {
        this.walker.floors.push({ kind: 'ring', cx: CX, cz: CZ, r0, r1, y,
                                  a0: a - G, a1: a + G });
        // and the road surface itself, so the landing is seen as well as felt
        const rm = (r0 + r1) / 2;
        this._m(new THREE.PlaneGeometry(3.4, r1 - r0), isleTrack,
          CX + Math.cos(a) * rm, y + 0.012, CZ + Math.sin(a) * rm,
          { rx: -Math.PI / 2, rz: -a - Math.PI / 2, cast: false });
      }
    }
    // the ornate gates at the four crossroads, for the passage of the chariots
    for (let q = 0; q < 4; q++) {
      const a = q * Math.PI / 2;
      for (const s of [-1.9, 1.9]) {
        const [x, z] = pos(a, 18.6);
        this._obelisk(x - Math.sin(a) * s, z + Math.cos(a) * s, 0.75, 2.1);
      }
      this._chariotGate(CX, CZ, a, 17.4, 2.10);
    }

    // ── The crowning cypress arcade ───────────────────────────────────────
    // The book crowns the top of the theatre's rings with paired cypresses
    // "trained to arch and meet over" (Colonna p.354, tr. this repo): a living
    // colonnade ringing the auditorium. Eight pairs on the top terrace, the
    // four cardinals left open for the crossroads. Purely decorative — off the
    // walk, so no colliders.
    const arcadeR = 16.4, arcH = 2.10, span = 0.5;
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

    // ── The last station of Book I (ch. XXIV) ────────────────────────────
    this._buildAdonis(CX, CZ, ADONIS_A, ADONIS_R);

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


  // ── The sacred fountain and the sepulchre of Adonis (ch. XXIV) ───────────
  //
  // Our pp. 370-379. The last chapter of Book I, eleven pages long, and with no
  // woodcut at all -- which is why the tour has had a stop called "The Tomb of
  // Adonis" pointing at the theatre's floor since the commentary was written.
  // The coverage ledger found it; the plate-driven checks never could. See
  // ROUTER.md rule 6.
  //
  // THE PLACE (p. 371). A fountain "shaped as a hexagon, and twelve paces in its
  // surrounding measure", its banks "hedged about and adorned with borders of
  // Macedonian marble" (p. 370). About it, at four paces from the border, a
  // cloister of "orange, lemon and citron trees ... composedly matched in an
  // alternating marriage", "full of every singing bird -- chiefly of
  // nightingales, of thrushes, and of solitary blackbirds". At their trunks "a
  // lattice-fence ... raised a foot high ... of red erythraean wood, of
  // sandalwood", carrying rose-bushes "of the hundred-petalled kind". Outside
  // that, a grove of cornel-cherry, cypress, palm, poplar and pine, trunks
  // "clear of a single obstructing branch, [so] the free air of the neighbouring
  // parts could be beautifully seen through". The floor is tessellated pavement
  // grassed over, "all tressed with tiniest fragrant thyme ... with an even
  // shearing", and a rivulet carries the water off "beneath the leaf-bearing
  // manna-ashes with a soft and gentle murmur" (p. 370).
  //
  // THE SERPENT (p. 373). "A golden serpent, feigned to creep out from a hidden
  // cleft of rock, which, with coiled windings of a fitting thickness, vomited
  // abundantly into the sonorous fountain the clearest water" -- and it is cast
  // "in a globed coil, to curb the force of the water, which by a free and
  // straight pipe would have scattered beyond the limits of the fountain". A
  // plumbing note delivered as a piece of design criticism, which is this book.
  //
  // THE SEPULCHRE (pp. 372-374). Five feet long, of alabaster, on a socle with a
  // little cornice. One long side: Venus coming naked from the fountain and
  // tearing her divine calf in the rose-bushes, and Cupid gathering the purple
  // blood into an oyster-shell. The other: Adonis among shepherd-hunters, dogs
  // and the dead boar, and Venus falling "into the pitiful embraces of three
  // half-swooning nymphs". The front "hollowed out in a circle ... stopped up
  // with the precious stone jacinth, of a transparent vermilion colour ...
  // burning unsteadily by the light set opposite" -- so it is lit from behind,
  // and it flickers. On the lid, Venus in three-coloured sardonyx, "carved as a
  // woman in childbed", the body from the milky vein and the drapery from the
  // red, giving suck to Cupid, her foot out over the edge for the nymphs to
  // kneel and kiss, and the distich cut beneath it.
  //
  // THE ROSES ARE WHITE, and that is the whole point of the station. The rite of
  // the Kalends of May (pp. 375-376): the bushes are stripped and the roses
  // heaped over the tomb; next day they reflower to the same number; on the Ides
  // they are swept into the fountain and away down the rivulet; the repository
  // is unsealed, and "no sooner is the precious liquor drawn out than at once
  // all the whitest roses, AS AT PRESENT THEY APPEAR, are re-dyed in purple
  // colour". Poliphilo sees them before the rite. They are white here.
  _buildAdonis(CX, CZ, ang, RAD) {
    const S = this.style, woodcut = S.key === 'woodcut';
    const OX = CX + Math.cos(ang) * RAD, OZ = CZ + Math.sin(ang) * RAD;
    const at = (a, r) => [OX + Math.cos(a) * r, OZ + Math.sin(a) * r];
    const rnd = (i, k) => {
      const v = Math.sin(i * 73.9 + k * 151.3 + 11.3) * 43758.5453;
      return v - Math.floor(v);
    };

    const alab = woodcut ? this._stoneMat
      : S.mat({ color: 0xefe6d2, roughness: 0.36, metalness: 0.03 });
    alab.userData.roll = 'a piece of alabaster';
    // "borders of Macedonian marble, not red, but of itself lustrous and veined"
    const marble = woodcut ? this._stoneMat
      : S.mat({ color: 0xe4dcc8, roughness: 0.45, metalness: 0.02 });
    marble.userData.roll = 'a border of Macedonian marble';
    const gold = woodcut ? this._darkStoneMat
      : S.mat({ color: 0xc9a03c, roughness: 0.3, metalness: 0.75 });
    gold.userData.roll = 'a coil of the golden serpent';

    // ── the tessellated pavement, and the sheared thyme over it ──────────
    const pave = woodcut ? S.mat({ tone: 0.06, rim: 0 })
      : S.mat({ color: 0xffffff, roughness: 0.7 });
    if (!woodcut) this._dress(pave, this._surfaceTexture({
      base: '#b8ab8e', dark: '#6e6248', light: '#ded2b6', courses: 16, blobs: 30, speckle: 2400, repeat: 5,
    }), 0.2);
    pave.userData.roll = 'a tessera of the pavement';
    this._m(new THREE.CircleGeometry(5.0, 40), pave, OX, 0.09, OZ, { rx: -Math.PI / 2, cast: false });
    const turf = woodcut ? S.mat({ tone: 0.10, rim: 0 }) : S.mat({ color: 0x46632a, roughness: 0.98 });
    turf.userData.roll = 'a turf of sheared thyme';
    this._m(new THREE.CircleGeometry(4.7, 40), turf, OX, 0.10, OZ, { rx: -Math.PI / 2, cast: false });
    for (let i = 0; i < 64; i++) {
      const th = rnd(i, 1) * Math.PI * 2, rr = 1.9 + rnd(i, 2) * 2.7;
      const [tx, tz] = at(th, rr);
      this._tuft(tx, 0.11, tz, 'thyme', 0.13 + rnd(i, 3) * 0.05);
    }

    // ── the grove, in a circle, trunks clear of branches ─────────────────
    // cornel-cherry stands as plum, the poplar as willow: the two the SPECIES
    // table does not carry, matched by leaf and habit rather than invented.
    const GROVE = ['plum', 'cypress', 'palm', 'willow', 'pine'];
    for (let i = 0; i < 12; i++) {
      const th = (i / 12) * Math.PI * 2 + 0.21;
      const [tx, tz] = at(th, 5.7 + rnd(i, 4) * 0.7);
      this._tree(tx, tz, 0.82 + rnd(i, 5) * 0.3, GROVE[i % GROVE.length]);
    }

    // ── the citrus cloister, "in an alternating marriage", and its birds ──
    const CITRUS = ['orange', 'lemon', 'citron'];
    for (let i = 0; i < 12; i++) {
      const th = (i / 12) * Math.PI * 2 + 0.13;
      const [tx, tz] = at(th, 3.6);
      this._tree(tx, tz, 0.5, CITRUS[i % 3]);
      if (i % 3 === 0) {
        const b = this._bird(0.95 + rnd(i, 6) * 0.3);
        b.position.set(tx + (rnd(i, 7) - 0.5) * 0.5, 1.9 + rnd(i, 8) * 0.4, tz + (rnd(i, 9) - 0.5) * 0.5);
        b.rotation.y = rnd(i, 10) * Math.PI * 2;
        this.scene.add(b);
        // _buildBirds runs after the island, so the flock may not exist yet
        this._birds = this._birds || [];
        this._birds.push({ g: b, kind: 'perch', phase: rnd(i, 11) * Math.PI * 2,
                           y: b.position.y, yaw0: b.rotation.y });
      }
    }

    // ── the sandalwood lattice, a foot high, and the WHITE roses ─────────
    const roseW = woodcut ? S.mat({ tone: -0.03 })
      : S.mat({ color: 0xf6f2e8, roughness: 0.58 });
    roseW.userData.roll = 'a white rose of the hundred leaves';
    const roseLeaf = woodcut ? S.mat({ tone: 0.05, side: THREE.DoubleSide })
      : this._climberLeafMat('myrtle');
    const sandal = new THREE.MeshStandardMaterial({
      map: this._latticeTexture(), color: 0x9c3f2e, alphaTest: 0.35,
      side: THREE.DoubleSide, roughness: 0.6,
    });
    sandal.userData.roll = 'a lattice of red sandalwood';
    this._disp.push(sandal);
    const latGeo = new THREE.PlaneGeometry(0.66, 0.3);
    const roseGeo = new THREE.SphereGeometry(0.055, 6, 5);
    for (let i = 0; i < 34; i++) {
      const th = (i / 34) * Math.PI * 2;
      const [lx, lz] = at(th, 3.9);
      this._m(latGeo, woodcut ? S.mat({ tone: 0.05, side: THREE.DoubleSide }) : sandal,
        lx, 0.25, lz, { ry: -th, cast: false, receive: false });
      for (let k = 0; k < 3; k++) {
        const off = (rnd(i * 3 + k, 1) - 0.5) * 0.6;
        const [rx2, rz2] = at(th + off / 3.9, 3.9);
        const y = 0.14 + rnd(i * 3 + k, 2) * 0.3;
        const lf = this._m(new THREE.PlaneGeometry(0.2, 0.2), roseLeaf, rx2, y, rz2,
          { cast: false, receive: false });
        lf.rotation.set(rnd(i + k, 3) * Math.PI, -th, rnd(i + k, 4) * Math.PI);
        if (k === 0) this._m(roseGeo, roseW, rx2, y + 0.09, rz2, { cast: false });
      }
    }

    // ── the fountain: a hexagon, twelve paces about ──────────────────────
    const FR = 1.3;
    this._m(new THREE.CylinderGeometry(FR + 0.28, FR + 0.32, 0.58, 6), marble, OX, 0.29, OZ, { outline: true });
    this._m(new THREE.CylinderGeometry(FR, FR, 0.46, 6), this._darkStoneMat, OX, 0.34, OZ, { cast: false });
    this._waters.push({
      m: this._m(new THREE.CircleGeometry(FR - 0.06, 24), this._waterMat(), OX, 0.52, OZ,
        { rx: -Math.PI / 2, cast: false }), rate: 0.05,
    });
    this._caustics(OX, 0.54, OZ, FR - 0.12, 0.05);
    for (let i = 0; i < 6; i++) {                       // the six angles, kerbed
      const th = i * Math.PI / 3 + Math.PI / 6;
      const [kx, kz] = at(th, FR + 0.3);
      this._m(new THREE.BoxGeometry(0.18, 0.15, 0.18), marble, kx, 0.63, kz, { ry: -th, cast: false });
    }
    this._circleCol(OX, OZ, FR + 0.55);

    // ── the golden serpent, from a cleft of rock, coiled to curb the water ─
    const [sx, sz] = at(ang + Math.PI, FR + 0.62);
    const rock = this._m(this._indexed(new THREE.DodecahedronGeometry(0.78, 0)), this._darkStoneMat,
      sx, 0.5, sz, { outline: true });
    rock.scale.set(1, 1.25, 0.85);
    rock.rotation.set(0.4, ang, 0.2);
    this._circleCol(sx, sz, 0.8);
    for (let i = 0; i < 3; i++) {                       // the globed coil
      const t = i / 3;
      const c = this._m(new THREE.TorusGeometry(0.32 - t * 0.09, 0.07, 8, 18), gold,
        sx - Math.cos(ang) * (0.12 + t * 0.13), 1.28 - t * 0.2, sz - Math.sin(ang) * (0.12 + t * 0.13),
        { cast: false });
      c.rotation.set(Math.PI / 2 - 0.25 + t * 0.2, -ang, 0);
    }
    const hx = OX + Math.cos(ang + Math.PI) * (FR * 0.5), hz = OZ + Math.sin(ang + Math.PI) * (FR * 0.5);
    const head = this._m(new THREE.SphereGeometry(0.12, 10, 8), gold, hx, 0.98, hz, { cast: false });
    head.scale.set(1.5, 0.8, 0.9);
    this._jet(hx, 0.94, hz, OX, 0.54, OZ, { apex: 0.3, r: 0.032, sparkle: 18 });

    // ── the emissary rivulet, "beneath the leaf-bearing manna-ashes" ─────
    const rill = this._waterMat();
    for (let i = 0; i < 7; i++) {
      const t = i / 7;
      const [wx, wz] = at(ang, -(FR + 0.9) - i * 1.5);
      this._waters.push({
        m: this._m(new THREE.PlaneGeometry(0.62, 1.6), rill, wx, 0.055 - t * 0.004, wz,
          { rx: -Math.PI / 2, rz: -ang - Math.PI / 2, cast: false }), rate: 0.09,
      });
      if (i % 2 === 0) {
        const [ax2, az2] = at(ang + (i % 4 ? 0.22 : -0.22), -(FR + 1.4) - i * 1.5);
        this._tree(ax2, az2, 0.7, 'ash');
      }
    }

    // ── the sepulchre, five feet long, of alabaster ──────────────────────
    const [px, pz] = at(ang, -2.55);
    const TL = 1.5, TW = 0.84, TH = 0.58;
    this._m(new THREE.BoxGeometry(TL + 0.28, 0.16, TW + 0.28), alab, px, 0.18, pz, { ry: -ang, outline: true });
    this._m(new THREE.BoxGeometry(TL, TH, TW), alab, px, 0.26 + TH / 2, pz, { ry: -ang, outline: true });
    this._m(new THREE.BoxGeometry(TL + 0.2, 0.09, TW + 0.2), alab, px, 0.26 + TH + 0.045, pz, { ry: -ang });
    this._circleCol(px, pz, 0.95);

    // the two long sides, carved (see _adonisRelief)
    const nx = Math.sin(ang), nz = -Math.cos(ang);       // across the tomb
    for (const [which, sgn, ry] of [['venus', 1, -ang], ['boar', -1, -ang + Math.PI]]) {
      const m = woodcut ? S.mat({ tone: 0.04 })
        : new THREE.MeshStandardMaterial({ map: this._adonisRelief(which), roughness: 0.5 });
      if (!woodcut) this._disp.push(m);
      m.userData.roll = 'a carved side of the sepulchre';
      this._m(new THREE.PlaneGeometry(TL * 0.94, TH * 0.82), m,
        px + nx * sgn * (TW / 2 + 0.012), 0.26 + TH / 2, pz + nz * sgn * (TW / 2 + 0.012),
        { ry, cast: false });
    }

    // "hollowed out in a circle ... stopped up with the precious stone jacinth
    //  ... burning unsteadily by the light set opposite"
    const jac = woodcut ? S.mat({ tone: -0.06 })
      : S.mat({ color: 0xd8301c, roughness: 0.12, metalness: 0.1,
                emissive: 0xa01008, emissiveIntensity: 1.5 });
    jac.userData.roll = 'the jacinth that stops the repository';
    const jx = px + Math.cos(ang) * (TL / 2 + 0.014), jz = pz + Math.sin(ang) * (TL / 2 + 0.014);
    this._m(new THREE.CircleGeometry(TH * 0.3, 24), jac, jx, 0.26 + TH / 2, jz,
      { ry: -ang + Math.PI / 2, cast: false });
    this._m(new THREE.TorusGeometry(TH * 0.32, 0.02, 8, 22), gold, jx, 0.26 + TH / 2, jz,
      { ry: -ang + Math.PI / 2, cast: false });
    if (S.pointLight) {
      const jl = S.pointLight(0xff3018, 2.6, 4.0);
      jl.position.set(jx + Math.cos(ang) * 0.34, 0.26 + TH / 2, jz + Math.sin(ang) * 0.34);
      this.scene.add(jl);
      this._pulses.push({ pl: jl, base: 2.6, phase: 1.7 });    // it burns unsteadily
    }

    // ── Venus on the lid, in three-coloured sardonyx, suckling Cupid ─────
    // The stone is the conceit: the body cut from the milky vein and the
    // drapery from the red, so the figure is two colours of one block.
    const onyx = woodcut ? this._stoneMat
      : S.mat({ color: 0xf2ece0, roughness: 0.28, metalness: 0.04 });
    onyx.userData.roll = 'the milky vein of the onyx';
    const sard = woodcut ? this._darkStoneMat
      : S.mat({ color: 0xa8503a, roughness: 0.3, metalness: 0.04 });
    sard.userData.roll = 'the reddening vein of the sardonyx';
    const LY = 0.26 + TH + 0.09;
    // She is RECUMBENT — a tomb effigy, "carved as a woman in childbed" — and
    // she is a carving, so `robe: null` keeps both figures out of the painted
    // cut-outs: a Botticelli card would stand two metres over a sarcophagus
    // five feet long, and would be a painting where the book has stone.
    // The red vein of the sardonyx runs under her as the drapery.
    this._m(new THREE.BoxGeometry(TL * 0.62, 0.1, TW * 0.5), sard, px, LY + 0.05, pz, { ry: -ang });
    const venus = this.cast.figure({ h: 0.6, skin: 0xf2ece0, robe: null, pose: 'recline' });
    venus.position.set(px - Math.cos(ang) * 0.16, LY + 0.2, pz - Math.sin(ang) * 0.16);
    venus.rotation.y = -ang;
    this.scene.add(venus);
    // and the child at the breast
    const cupid = this.cast.figure({ h: 0.26, skin: 0xf2ece0, robe: null, pose: 'reach' });
    cupid.position.set(px + nx * 0.17, LY + 0.12, pz + nz * 0.17);
    cupid.rotation.y = -ang - Math.PI / 2;
    this.scene.add(cupid);
    // the foot out over the rim, which the nymphs kneel and kiss
    const foot = this._m(new THREE.BoxGeometry(0.09, 0.06, 0.2), onyx,
      px + Math.cos(ang) * 0.28, LY + 0.045, pz + Math.sin(ang) * 0.28, { ry: -ang, cast: false });
    foot.material = onyx;

    // the distich, cut beneath the foot
    this._plaque({ main: 'NON LAC SAEVE PVER, LACHRYMAS SED SVGIS AMARAS',
      sub: 'REDDENDAS MATRI, CARIQVE ADONIS AMORE \u00b7 NOT MILK, CRVEL BOY, BVT BITTER TEARS YOV SVCK, TO BE GIVEN BACK TO YOVR MOTHER, AND FOR THE LOVE OF DEAR ADONIS \u00b7 OVR P. 374' },
      2.3, 0.3, px + Math.cos(ang) * 0.72, 0.4, pz + Math.sin(ang) * 0.72, -ang + Math.PI / 2, true);

    // and the rite, which is what the whole place is for
    this._plaque({ main: 'THE ROSES ARE WHITE VNTILL THE RITE',
      sub: 'ON THE DAY BEFORE THE KALENDS OF MAY THE ROSES ARE STRIPPED AND HEAPED OVER THE TOMBE \u00b7 NEXT DAY THEY REFLOWER TO THE SAME NVMBER \u00b7 ON THE IDES THEY ARE SCATTERED IN THE FOVNTAINE, THE REPOSITORY IS VNSEALED, AND NO SOONER IS THE PRECIOVS LIQVOR DRAWN OVT THAN ALL THE WHITEST ROSES ARE RE-DYED IN PVRPLE COLOVR \u00b7 OVR PP. 375-376' },
      3.6, 0.44, OX + Math.cos(ang + Math.PI) * 4.3, 0.62, OZ + Math.sin(ang + Math.PI) * 4.3,
      -ang + Math.PI / 2, true);
  }

  // The two carved long sides of the sepulchre, drawn rather than modelled --
  // the register this project uses for narrative relief. Both scenes are the
  // book's, closely read: our pp. 372-373.
  _adonisRelief(which) {
    this._adonisTex = this._adonisTex || {};
    if (this._adonisTex[which]) return this._adonisTex[which];
    const W = 512, H = 256;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');
    const STONE = '#e6dcc6', CUT = '#9a8e72', DEEP = '#6e6450';
    x.fillStyle = STONE; x.fillRect(0, 0, W, H);
    x.fillStyle = '#ded3ba'; x.fillRect(16, 14, W - 32, H - 28);      // the sunk field
    x.strokeStyle = DEEP; x.lineWidth = 2; x.strokeRect(16, 14, W - 32, H - 28);

    const figure = (fx, fy, s, pose, tone) => {
      x.save(); x.translate(fx, fy); x.scale(s, s);
      if (pose === 'lie') x.rotate(-Math.PI / 2);
      x.fillStyle = tone; x.strokeStyle = tone; x.lineWidth = 5; x.lineCap = 'round';
      x.beginPath(); x.arc(0, -46, 11, 0, 6.3); x.fill();              // head
      x.beginPath(); x.moveTo(0, -35); x.lineTo(0, 0); x.stroke();     // trunk
      if (pose === 'stand' || pose === 'lie') {
        x.beginPath(); x.moveTo(0, -28); x.lineTo(-16, -6); x.moveTo(0, -28); x.lineTo(15, -10); x.stroke();
        x.beginPath(); x.moveTo(0, 0); x.lineTo(-9, 30); x.moveTo(0, 0); x.lineTo(9, 30); x.stroke();
      } else if (pose === 'kneel') {
        x.beginPath(); x.moveTo(0, -28); x.lineTo(-15, -12); x.moveTo(0, -28); x.lineTo(14, -14); x.stroke();
        x.beginPath(); x.moveTo(0, 0); x.lineTo(-14, 14); x.lineTo(-4, 26); x.moveTo(0, 0); x.lineTo(12, 20); x.stroke();
      } else {                                                         // swoon
        x.beginPath(); x.moveTo(0, -28); x.lineTo(-18, -22); x.moveTo(0, -28); x.lineTo(17, -20); x.stroke();
        x.beginPath(); x.moveTo(0, 0); x.lineTo(-13, 26); x.moveTo(0, 0); x.lineTo(11, 27); x.stroke();
      }
      x.restore();
    };

    if (which === 'venus') {
      // "the holy Venus, coming naked out of this fountain, tore in those
      //  rose-bushes her divine calf ... and Cupid gathering the purple blood
      //  into an oyster-shell"
      x.strokeStyle = CUT; x.lineWidth = 3;
      x.beginPath(); x.ellipse(74, 178, 44, 15, 0, 0, 6.3); x.stroke();
      for (let i = 0; i < 5; i++) {
        x.beginPath(); x.moveTo(56 + i * 10, 174); x.quadraticCurveTo(58 + i * 10, 150, 62 + i * 10, 134); x.stroke();
      }
      figure(122, 150, 1.05, 'stand', CUT);                            // Venus, come out
      x.strokeStyle = DEEP; x.lineWidth = 2.5;
      for (let i = 0; i < 9; i++) {                                    // the rose-bushes
        const bx = 176 + i * 12;
        x.beginPath(); x.moveTo(bx, 198); x.quadraticCurveTo(bx + 5, 170, bx + 2, 148); x.stroke();
        x.beginPath(); x.arc(bx + 2, 143, 4.5, 0, 6.3); x.stroke();
      }
      figure(330, 170, 0.72, 'kneel', CUT);                            // Cupid, kneeling
      x.strokeStyle = DEEP; x.lineWidth = 3;                           // the oyster-shell
      x.beginPath(); x.arc(356, 158, 15, Math.PI * 0.15, Math.PI * 0.95); x.stroke();
      for (let i = 0; i < 5; i++) {
        x.beginPath(); x.moveTo(356, 158); x.lineTo(342 + i * 7, 172); x.stroke();
      }
      x.fillStyle = DEEP;                                              // and the drops
      for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(326 + i * 8, 130 + i * 6, 2.6, 0, 6.3); x.fill(); }
      figure(444, 152, 0.9, 'stand', CUT);
    } else {
      // "Adonis, carved with some shepherd-hunters, among some little shrubs,
      //  with dogs and the dead boar ... and Venus falling sorrowfully weeping
      //  into the pitiful embraces of three half-swooning nymphs"
      x.strokeStyle = DEEP; x.lineWidth = 2.5;
      for (let i = 0; i < 7; i++) {                                    // the little shrubs
        const bx = 32 + i * 15;
        x.beginPath(); x.moveTo(bx, 208); x.lineTo(bx, 188); x.stroke();
        x.beginPath(); x.arc(bx, 182, 7, 0, 6.3); x.stroke();
      }
      figure(100, 196, 0.85, 'lie', CUT);                              // Adonis, slain
      x.fillStyle = CUT;                                               // the boar, dead
      x.beginPath(); x.ellipse(186, 188, 30, 15, 0.15, 0, 6.3); x.fill();
      x.beginPath(); x.ellipse(213, 178, 12, 9, 0.2, 0, 6.3); x.fill();
      x.strokeStyle = STONE; x.lineWidth = 3;
      x.beginPath(); x.moveTo(221, 174); x.lineTo(231, 166); x.stroke();          // the tusk
      for (const [dx2, dy2] of [[254, 194], [288, 198]]) {             // two dogs
        x.fillStyle = CUT;
        x.beginPath(); x.ellipse(dx2, dy2, 15, 7, 0, 0, 6.3); x.fill();
        x.beginPath(); x.arc(dx2 + 15, dy2 - 6, 6, 0, 6.3); x.fill();
        x.strokeStyle = CUT; x.lineWidth = 3;
        x.beginPath(); x.moveTo(dx2 - 8, dy2 + 5); x.lineTo(dx2 - 10, dy2 + 16);
        x.moveTo(dx2 + 8, dy2 + 5); x.lineTo(dx2 + 10, dy2 + 16); x.stroke();
      }
      figure(348, 158, 1.0, 'swoon', CUT);                             // Venus falling
      for (let i = 0; i < 3; i++) figure(392 + i * 30, 160, 0.84, 'stand', CUT);  // three nymphs
      figure(480, 178, 0.62, 'kneel', CUT);                            // the son, with his roses
    }

    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    this._disp.push(t);
    return (this._adonisTex[which] = t);
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
      this._m(new THREE.CylinderGeometry(RR + 0.3, RR + 0.3, HH, 40, 1, true, Math.PI / 2 - a1, a1 - a0), box, CX, HH / 2 + 2.10, CZ, { cast: false })
        .material.side = THREE.DoubleSide;
      this._hedgeFringeArc(CX, CZ, RR + 0.3, HH + 2.10, HH, Math.PI / 2 - a1, Math.PI / 2 - a0,
        { density: 3.2, seed: q });
      this._m(new THREE.RingGeometry(RR, RR + 0.6, 40, 1, a0, a1 - a0), box, CX, HH + 2.10, CZ, { rx: -Math.PI / 2, cast: false });
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
    const T3 = { r0: 14, r1: 17, h: 2.10 }, mid = (T3.r0 + T3.r1) / 2;
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
    const T2 = { r0: 11, r1: 14, h: 1.40 }, m2 = T2.r1 - 0.5;
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
      const t = this._tree(x, z, 0.42, ['citron', 'juniper', 'olive', 'laurel'][i % 4]); if (t) t.position.y = 0.70;
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
      alphaTest: 0.42, side: THREE.DoubleSide,
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
      // Buxus: tiny, dark, glossy, and the commonest leaf in the whole world.
      // Here for _leafCardTexture('box') -- the hedges' fringe -- though
      // _tree(x, z, s, 'box') gives a clipped ball if one is ever wanted.
      box:      { leaf: 'ovate',   crown: [0.6, 0.55, 0.6],  trunk: [0.5, 0.06], bark: 0x4a3a28, dark: 0x16280e, light: 0x385a1e, n: 22, top: 0.55 },
      myrtle:   { leaf: 'ovate',   crown: [1.1, 1.0, 1.1],   trunk: [0.9, 0.09], bark: 0x5a4030, dark: 0x16300f, light: 0x2f5419, n: 24, top: 0.8, boughs: 3, bloom: 0xf4f0e6 },
      orange:   { leaf: 'ovate',   crown: [1.15, 1.15, 1.15],trunk: [1.3, 0.10], bark: 0x5a4a34, dark: 0x1f3d16, light: 0x3d6524, n: 26, top: 0.9, boughs: 3, fruit: 0xe08a1c },
      citron:   { leaf: 'ovate',   crown: [1.15, 1.2, 1.15], trunk: [1.3, 0.10], bark: 0x5a4a34, dark: 0x233f1a, light: 0x456a26, n: 26, top: 0.9, boughs: 3, fruit: 0xe8d24a, big: true },
      lemon:    { leaf: 'ovate',   crown: [1.05, 1.15, 1.05],trunk: [1.3, 0.10], bark: 0x5a4a34, dark: 0x1f3d16, light: 0x3f6a26, n: 24, top: 0.9, boughs: 3, fruit: 0xf0e060 },
      apple:    { leaf: 'ovate',   crown: [1.3, 1.1, 1.3],   trunk: [1.4, 0.11], bark: 0x5a4432, dark: 0x2a4a1c, light: 0x5a8a34, n: 26, top: 0.9, boughs: 4, fruit: 0xc83a3a },
      // Pear and plum join apple 2026-09-07 for the orchard of second nature.
      // Segre reads the three together at Cythera -- the prati carry apples in
      // the first order, pears in the second, plums with pistachios in the
      // third (GARDENS.md 5) -- so they belong in the worked country too. A
      // pear stands taller and narrower than an apple and a plum lower and
      // broader, which is the whole difference an orchard row needs.
      pear:     { leaf: 'ovate',   crown: [1.05, 1.5, 1.05], trunk: [1.7, 0.10], bark: 0x54402e, dark: 0x27441a, light: 0x527f30, n: 26, top: 0.95, boughs: 4, fruit: 0xc0b055 },
      plum:     { leaf: 'ovate',   crown: [1.4, 0.95, 1.4],  trunk: [1.2, 0.11], bark: 0x4e3b2c, dark: 0x25401c, light: 0x4c7a30, n: 26, top: 0.85, boughs: 4, fruit: 0x6a4a86 },
      olive:    { leaf: 'narrow',  crown: [1.35, 1.1, 1.35], trunk: [1.5, 0.16], bark: 0x6a5a48, dark: 0x4a5a3e, light: 0x8a9a74, n: 30, top: 0.9, boughs: 4, gnarled: true },
      // Ash, named with the plane in the shaded walk of Dallington p. 92. Its
      // leaf is pinnate -- a row of leaflets on a stalk -- so 'lance' is the
      // nearest of the drawn forms, and it stands taller and narrower than a
      // plane, which is the difference the walk needs.
      ash:      { leaf: 'lance',   crown: [1.7, 2.1, 1.7],   trunk: [3.2, 0.15], bark: 0x8a8274, dark: 0x2a4c1c, light: 0x5e8a34, n: 32, top: 0.95, boughs: 4 },
      // Ivy, for the climbers of Cythera's twenty fences (our p. 294) -- and
      // the book names it often enough elsewhere. Never planted as a tree;
      // this entry exists so _leafCardTexture('ivy') has a leaf to draw.
      ivy:      { leaf: 'lobed',   crown: [0.7, 0.6, 0.7],   trunk: [0.4, 0.05], bark: 0x4a3a26, dark: 0x16300f, light: 0x365c22, n: 20, top: 0.5 },
      plane:    { leaf: 'palmate', crown: [2.2, 1.9, 2.2],   trunk: [2.8, 0.17], bark: 0x9a8a6c, dark: 0x2c5a1c, light: 0x6a9a3a, n: 34, top: 0.95, boughs: 4, mottled: true },
      oak:      { leaf: 'lobed',   crown: [2.1, 1.8, 2.1],   trunk: [2.2, 0.20], bark: 0x3e2e1e, dark: 0x22421a, light: 0x4a7a2c, n: 34, top: 0.95, boughs: 5 },
      beech:    { leaf: 'ovate',   crown: [1.7, 2.1, 1.7],   trunk: [2.4, 0.14], bark: 0x8a8070, dark: 0x2a4c1a, light: 0x5c8c30, n: 30, top: 0.95, boughs: 3 },
      elm:      { leaf: 'ovate',   crown: [1.6, 2.4, 1.6],   trunk: [2.6, 0.14], bark: 0x4a3a2c, dark: 0x22441a, light: 0x4c7c2c, n: 30, top: 0.95, boughs: 3, vine: true },
      willow:   { leaf: 'narrow',  crown: [1.8, 1.9, 1.8],   trunk: [1.8, 0.14], bark: 0x5a4a38, dark: 0x3a5a2a, light: 0x7a9a58, n: 34, top: 0.9, boughs: 3, weeping: true },
      arbutus:  { leaf: 'lance',   crown: [1.2, 1.3, 1.2],   trunk: [1.2, 0.10], bark: 0x8a3a24, dark: 0x1c3a14, light: 0x3c6a22, n: 24, top: 0.9, boughs: 3, fruit: 0xd8402a },
      palm:     { leaf: 'frond',   crown: [1.6, 0.9, 1.6],   trunk: [3.4, 0.12], bark: 0x7a6a4a, dark: 0x2a5a24, light: 0x5c9a3c, n: 14, top: 1.0, fronds: true },
      // the aged wild fig rooted in the Polyandrion's wall (our p. 272; Rhizopoulou 2016 n1′ 'wild fig', Ficus sycomorus/carica)
      fig:      { leaf: 'lobed',   crown: [1.4, 1.0, 1.4],   trunk: [0.9, 0.13], bark: 0x9a8e7c, dark: 0x25461a, light: 0x578c2e, n: 22, top: 0.75, boughs: 3, gnarled: true },
      // 'thorny plants, sharp thistles and cedars are cited in the text as occurring among ancient monuments and historical ruins' (Rhizopoulou 2016, abstract; l8′, s8)
      cedar:    { leaf: 'needle',  crown: [2.6, 1.3, 2.6],   trunk: [2.4, 0.22], bark: 0x4a3a2a, dark: 0x1c3a24, light: 0x3a5e3c, n: 36, top: 1.0, boughs: 5 },
    };
  }

  // A spray of one species' leaves, drawn once and shared: the card texture.
  _leafCardTexture(species) {
    this._leafCards = this._leafCards || {};
    // In the woodcut register the spray is printed, not painted: each leaf is
    // drawn twice, an ink silhouette a little larger under a paper leaf, which
    // is how the 1499 blocks cut foliage (see the plane trees of #86, the ivy of
    // #94). The cones of the primitive variant were never the plates' trees.
    const ink = this.style.key === 'woodcut';
    const cacheKey = species + (ink ? '#ink' : '');
    if (this._leafCards[cacheKey]) return this._leafCards[cacheKey];
    const SP = HPWorldScene.SPECIES[species] || HPWorldScene.SPECIES.laurel;
    const N = 256;
    const c = document.createElement('canvas'); c.width = c.height = N;
    const x = c.getContext('2d');
    const hex = (h) => '#' + h.toString(16).padStart(6, '0');
    const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7 + species.length * 17.3) * 43758.5453; return v - Math.floor(v); };
    const leaf = (cx, cy, len, ang, tone, lw = 0) => {
      x.save(); x.translate(cx, cy); x.rotate(ang);
      x.fillStyle = tone; x.strokeStyle = tone; x.lineCap = 'round';
      if (SP.leaf === 'scale' || SP.leaf === 'needle') {
        x.lineWidth = (SP.leaf === 'scale' ? 3.2 : 1.6) + lw;
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
    x.strokeStyle = ink ? '#1a1410' : hex(SP.bark); x.lineWidth = 2;
    for (let i = 0; i < count; i++) {
      const a = rnd(i, 1) * Math.PI * 2, r = 18 + rnd(i, 2) * 92;
      const cx = N / 2 + Math.cos(a) * r, cy = N / 2 + Math.sin(a) * r;
      if (i % 4 === 0 && SP.leaf !== 'frond') { x.beginPath(); x.moveTo(N / 2, N / 2); x.lineTo(cx, cy); x.stroke(); }
      const L = len * (0.7 + rnd(i, 4) * 0.5), ang = a + Math.PI / 2 + (rnd(i, 5) - 0.5) * 1.2;
      if (ink) { leaf(cx, cy, L * 1.12, ang, '#1a1410', 2.2); leaf(cx, cy, L, ang, rnd(i, 3) < 0.3 ? '#d8d0bc' : '#f2ecd8'); continue; }
      const tone = rnd(i, 3) < 0.45 ? hex(SP.light) : hex(SP.dark);
      leaf(cx, cy, L, ang, tone);
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
    this._leafCards[cacheKey] = t;
    return t;
  }

  _leafCardMat(species) {
    this._leafMatCache = this._leafMatCache || {};
    if (this._leafMatCache[species]) return this._leafMatCache[species];
    const m = this.style.key === 'woodcut'
      ? new THREE.MeshBasicMaterial({ map: this._leafCardTexture(species), alphaTest: 0.5, side: THREE.DoubleSide })
      : new THREE.MeshStandardMaterial({
        map: this._leafCardTexture(species), alphaTest: 0.5, side: THREE.DoubleSide,
        roughness: 0.85, metalness: 0,
      });
    m.userData.roll = `a spray of ${species}`;
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
      this._coreMat.userData.roll = this._coreMat.userData.roll || 'the shade inside a crown';
      // The core CASTS (2026-09-07). Coolness and shade are the pleasure this
      // book names more often than any other -- "a pleasaunt and coole shade"
      // (p. 92), "the coole vmbrage of the leafie Trees" (p. 121), "making the
      // shadowed places vnder the leaffye Trees, coole and fresh" (p. 196).
      // A garden with no shade has no interior: every part of it is the same
      // part. See PLEASURES.md 1. One sphere per tree, and it is what gives the
      // pool of shade its body.
      const core = this._m(new THREE.SphereGeometry(1, 10, 8), this._coreMat, cx, cy, cz,
        { parent, cast: true, receive: false });
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
      // and about half the cards cast, so the pool has a broken, leaf-shaped
      // edge rather than the hard rim of a disc. The cards are alphaTest'd and
      // three.js carries map + alphaTest into the depth material, so what lands
      // on the grass is the shape of the leaves. Six casters out of sixty --
      // which is what this was -- is not dappling, it is nothing.
      m.castShadow = i < Math.max(10, count * 0.5); m.receiveShadow = false;
      parent.add(m);
    }
  }

  _tree(x, z, s = 1, species = null) {
    // The primitive variant is the founding manifesto look, kept selectable
    // (DECISIONS.md, 2026-09-05). It used to be the woodcut register's default;
    // since 2026-09-07 the woodcut draws the same species as the lit garden,
    // with the leaves cut in ink (see _leafCardTexture), because the plates
    // draw plane trees, ivy and cypresses, not cones.
    if (isVariant('tree', 'primitive')) {
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
    // (The woodcut used to take a massed silhouette here — "ink wants a shape,
    // not leaves". The plates disagree: their foliage is cut leaf by leaf, so
    // the woodcut now takes the same cards, printed in ink; see _leafCardTexture.)
    if (SP.fronds) {
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
    // Remember it for the shade map: where the crown is, how wide, how high.
    // (PLEASURES.md 1 -- shade is the pleasure this book names most.)
    if (SP) this._shadeSpots.push({ x, z, r: SP.crown[0] * s * 1.25, h: cy });
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
      this._hedge(x, 0.45, z, w, 0.9, d);
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
      // the shaded walk of p. 92: its floor is leaf litter, and nothing grows
      // in a path -- what grows is the umbriphilous herbs, placed by hand
      rect(28.0, 34.0, 13.4, 31.6),
      // the rills of p. 196: a cut channel has a kerb and gravel, not grass
      rect(4.4, 16.9, 2.5, 6.6), rect(-12.5, -4.5, 4.4, 7.0), rect(5.4, 16.7, 7.8, 10.0),
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
      // Ploughed ground is ploughed: meadow grass must not grow out of the
      // furrows of the strip fields, nor under the orchard and the arbustum.
      rect(-61, -19, 41.5, 62),          // second nature -- the worked belt
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
    // radial roads every 18 degrees -- the book's twenty divisions (p. 294)
    const STEP = Math.PI / 10;
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
    // the meadow is a hand-written shader and fogs itself, so it has to be
    // told the same air the rest of the world is standing in
    const common = { clearance, sunDirection: sun,
                     fogColor: this.scene.fog.color.getHex(),
                     fogDensity: this.scene.fog.density };

    // The sward, rebuilt 2026-09-07. The first version read as cartoon: the
    // blades were 10 cm across at the base, half a metre tall, and lime. Three
    // changes, none of them expensive, because this is all one InstancedMesh:
    //   * a blade is now 2 cm across and about a foot tall, which is what turf
    //     is -- the eye reads grass by the count of edges, not by their size;
    //   * there are more of them, and a low understorey under them, so the
    //     ground between blades stops showing through as flat paint;
    //   * the colours are greyer and cooler; the gold back-light that made the
    //     whole field glow is now a pale straw.
    const grass = createMeadowField({
      ...common,
      count: mobile ? 11000 : 36000,
      seed: 7331,
      blade: { height: 0.30, width: 0.019, segments: 3, planes: 3 },
      colors: { root: 0x2b3f1c, tip: 0x5f7c37, rootB: 0x33501f, tipB: 0x7d904a, back: 0xb4b478 },
      wind: { windStrength: 0.15, windSpeed: 1.1 },
    });

    // The understorey: short, dense, dark. It never reads as a blade of its
    // own -- its whole job is to close the gaps so the ground is not seen as a
    // painted plane between separate spikes.
    const undergrass = createMeadowField({
      ...common,
      count: mobile ? 7000 : 22000,
      seed: 2287,
      blade: { height: 0.15, width: 0.016, segments: 2, planes: 3 },
      colors: { root: 0x24361a, tip: 0x486327, rootB: 0x2a4020, tipB: 0x5a7434, back: 0x8c9c60 },
      wind: { windStrength: 0.09, windSpeed: 1.0 },
    });

    // Wildflower drifts: cream-and-gold spikes gathered only where the clump
    // noise crests, so they read as scattered drifts, not a second crop
    const wildflowers = createMeadowField({
      ...common,
      count: mobile ? 400 : 1000,
      seed: 4211,
      accept: (x, z, clump) => clump > 0.72,
      blade: { height: 0.40, width: 0.018, segments: 3, planes: 2, flare: 1.9 },
      colors: { root: 0x354c20, tip: 0xd8c48a, rootB: 0x354c20, tipB: 0xd0a44e, back: 0xdcc890 },
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
      blade: { height: 0.42, width: 0.020, segments: 3, planes: 2, flare: 1.8 },
      colors: { root: 0x2b3f1c, tip: 0xbc4655, rootB: 0x33501f, tipB: 0xd4737f, back: 0xdc9a9a },
      wind: { windStrength: 0.18, windSpeed: 1.1 },
      scale: 0.9,
    });

    // Cythera's own sward and its flowery mead — denser in flower than the
    // mainland, because the island is the flowery mead perfected
    const isleClear = (x, z) => this._isleClearance(x, z);
    const isleGrass = createMeadowField({
      ...common, clearance: isleClear,
      count: mobile ? 6000 : 20000,
      seed: 5150,
      bounds: { x0: -50, x1: 50, z0: -200, z1: -100 },
      blade: { height: 0.27, width: 0.018, segments: 3, planes: 3 },
      colors: { root: 0x2b3f1c, tip: 0x62803a, rootB: 0x33501f, tipB: 0x82964e, back: 0xb8b87c },
      wind: { windStrength: 0.16, windSpeed: 1.15 },
    });
    const isleUnder = createMeadowField({
      ...common, clearance: isleClear,
      count: mobile ? 4000 : 13000,
      seed: 5151,
      bounds: { x0: -50, x1: 50, z0: -200, z1: -100 },
      blade: { height: 0.14, width: 0.015, segments: 2, planes: 3 },
      colors: { root: 0x24361a, tip: 0x4a6629, rootB: 0x2a4020, tipB: 0x5c7636, back: 0x90a064 },
      wind: { windStrength: 0.09, windSpeed: 1.0 },
    });
    const isleFlowers = createMeadowField({
      ...common, clearance: isleClear,
      count: mobile ? 900 : 2600,
      seed: 611,
      bounds: { x0: -50, x1: 50, z0: -200, z1: -100 },
      accept: (x, z, clump) => clump > 0.52,
      blade: { height: 0.42, width: 0.019, segments: 3, planes: 2, flare: 1.9 },
      colors: { root: 0x314c1d, tip: 0xcc6472, rootB: 0x354c20, tipB: 0xd8bc5e, back: 0xe0c898 },
      wind: { windStrength: 0.2, windSpeed: 1.2 },
      scale: 0.9,
    });

    // ── The plain fields before the palace (Dallington pp. 100-101) ────────
    // "beholding the plaine fieldes, it was woonderfull to see the greennes
    // thereof, powdered with such varietie of sundrie sorted colours, and diuers
    // fashioned floures, as yealow Crowfoote, or golden Knop, Oxeye, Satrion
    // Dogges stone, the lesser Centorie, Mellilot, Saxifrage, Cowslops, Ladies
    // fingers, wilde Cheruile … Sinquifolie Eyebright, Strawberies … wilde
    // Columbindes Agnus Castus, Millfoyle, Yarrow … the white Muscarioli".
    // Rhizopoulou 2016 (e1′-e2) sorts the same passage by colour: yellow for
    // sweet clover and crowfoot, blue for centaury and eyebright, azure for
    // chicory and periwinkle, white for lily-of-the-valley, purple for cyclamen,
    // dittany and loosestrife. Four drifts, then, in those colours, on the
    // sward round the palace and the court, and nowhere else.
    const palaceField = (x, z) => x > -44 && x < -3 && z > -18 && z < 30;
    const fieldDrift = (seed, thr, tip, tipB, back, scale) => createMeadowField({
      ...common, count: mobile ? 220 : 620, seed,
      accept: (x, z, clump) => palaceField(x, z) && clump > thr,
      blade: { height: 0.38, width: 0.017, segments: 3, planes: 2, flare: 1.9 },
      colors: { root: 0x3a5423, tip, rootB: 0x35521f, tipB, back },
      wind: { windStrength: 0.2, windSpeed: 1.15 }, scale,
    });
    const yellowDrift = fieldDrift(1201, 0.60, 0xf0d040, 0xe8b020, 0xf6e080, 0.8);   // crowfoot, melilot, cowslip
    const blueDrift   = fieldDrift(1202, 0.66, 0x3a56c8, 0x6a8ae0, 0x9ab0f0, 0.8);   // centaury, eyebright, chicory, periwinkle
    const whiteDrift  = fieldDrift(1203, 0.70, 0xf4f0e6, 0xe8e6da, 0xffffff, 0.75);  // muscari, lily of the valley
    const purpleDrift = fieldDrift(1204, 0.74, 0x8a3aa0, 0xb060c0, 0xd090d8, 0.8);   // cyclamen, loosestrife
    this._plaque({ main: 'THE PLAINE FIELDES', sub: 'POWDERED WITH SVNDRIE SORTED COLOVRS · CROWFOOTE, OXEYE, CENTORIE, MELLILOT, COWSLOPS, EYEBRIGHT, MVSCARIOLI · DALLINGTON PP. 100–101' },
      2.4, 0.34, -6.4, 0.62, 6.2, Math.PI / 2, true);

    for (const f of [grass, undergrass, wildflowers, roses, isleGrass, isleUnder, isleFlowers,
                     yellowDrift, blueDrift, whiteDrift, purpleDrift]) {
      this.scene.add(f.mesh);
      this._meadows.push(f);
    }
  }

  // Push a change of air through to the things that fog themselves. The
  // meadow's shader carries its own uFogColor/uFogDensity, so recolouring
  // scene.fog alone would leave the grass standing in yesterday's weather.
  syncAir() {
    const f = this.scene.fog;
    if (!f) return;
    for (const m of this._meadows) {
      const u = m.mesh.material.uniforms;
      if (u.uFogColor) u.uFogColor.value.copy(f.color);
      if (u.uFogDensity) u.uFogDensity.value = f.density;
    }
  }

  // ── Interaction API (used by main.js and DreamMode) ───────────────────────

  teleport(key) {
    const st = HP_STATIONS.find(s => s.key === key);
    if (!st) return;
    const yaw = this.walker.yawToward(st.pos, st.look);
    if (this.flight) {
      // in the air the wonder is approached from above and a little behind
      // the station's own viewpoint, so the swoop ends looking at it
      const back = 6;
      this.flight.flyTo(st.pos[0] + Math.sin(yaw) * back, 9, st.pos[1] + Math.cos(yaw) * back, yaw);
      return;
    }
    if (this.walker.locked) return;
    this.walker.teleportTo(st.pos[0], st.pos[1], yaw, st.pitch ?? -0.04);
  }

  // ── The fourth mode: the dream from the air, as the dragon ──────────────
  // The walker is locked and parked where it stood; the dragon rises from
  // that spot. Landing puts the walker back under the dragon.
  startFlight() {
    if (this.flight) return this.flight;
    const dragon = this.cast.animals.flyingDragon(2.4);
    this.scene.add(dragon);
    this.flight = new DragonFlight(this.renderer, dragon, {
      bounds: { minX: -60, maxX: 60, minZ: -208, maxZ: 54, minY: 0.9, maxY: 48 },
      onDigit: (n) => { if (n === 0) this.teleport('cythera_isle'); else { const st = HP_STATIONS[n - 1]; if (st) this.teleport(st.key); } },
      onLand: () => { this.endFlight(); this.onLand?.(); },
    });
    const p = this.walker.player;
    this.flight.placeAt(p.pos.x, 9, p.pos.z, p.yaw);
    this.walker.locked = true;
    this.flight.attach();
    return this.flight;
  }
  // ── Roll Up ──────────────────────────────────────────────────────────────
  // The ball eats the census (see _census / takeRollable). It borrows the
  // walker's floors so it can climb Cythera's terraces, and the walker itself
  // is locked while it rolls.
  startRoll(opts = {}) {
    if (this.roll) return this.roll;
    if (!this._wantRoll) {
      console.warn('[rollup] this scene was not built with { rollup: true }; nothing to eat');
    }
    this.roll = new RollUp(this.scene, this.camera, this.walker, opts);
    this.roll.onTake = (e) => this.takeRollable(e);
    this.roll.onExit = () => { this.endRoll(); this.onRollExit?.(); };
    this.roll.attach(this.rollables);
    this.roll.meadows = this._meadows;          // the sward is the first course
    this.roll.colliders = this.walker.colliders; // and the rest is scenery until it isn't
    const p = this.walker.player;
    this.roll.start(p.pos.x, p.pos.z);
    this.walker.locked = true;
    return this.roll;
  }
  endRoll() {
    if (!this.roll) return;
    const r = this.roll;
    const p = this.walker.player;
    p.pos.set(r.pos.x, 0, r.pos.z);
    this.walker.collide(p.pos);
    r.dispose();
    this.roll = null;
    this.walker.locked = false;
  }

  endFlight() {
    if (!this.flight) return;
    const f = this.flight;
    f.dispose();
    this.scene.remove(f.dragon);
    const p = this.walker.player;
    // land on land: over the open sea the walker is set down on the nearest
    // shore — the mainland strand, or Cythera's rim
    let lx = f.pos.x, lz = f.pos.z;
    const onIsle = Math.hypot(lx, lz + 150) < 46, onMain = lz > -34;
    if (!onIsle && !onMain) {
      if (lz > -95) { lz = -33; }
      else { const a = Math.atan2(lz + 150, lx); lx = Math.cos(a) * 45; lz = -150 + Math.sin(a) * 45; }
    }
    p.pos.set(lx, 0, lz); p.yaw = f.yaw; p.pitch = -0.04;
    this.walker.collide(p.pos);
    this.walker.locked = false;
    this.flight = null;
  }

  getSpawnState() {
    const p = this.walker.player;
    return { pos: [p.pos.x, p.pos.z], yaw: p.yaw, pitch: p.pitch };
  }

  update(dt) {
    this._t += dt;
    if (this.dream) this.dream.update(dt);
    if (this._mood) this._updateMood(dt);
    if (this.roll) {
      this.roll.update(dt);
      this.roll.applyTo(this.camera, dt);
      this.masonry.update(dt);          // whatever the ball knocked out is falling
    } else if (this.flight) {
      this.flight.update(dt);
      this.flight.applyTo(this.camera, dt);
    } else {
      this.walker.update(dt);
      this.walker.applyTo(this.camera);
    }

    // Station proximity → HUD callback (throttled; quiet during the dream)
    this._stTimer += dt;
    if (this._stTimer > 0.25 && !this.dream) {
      this._stTimer = 0;
      const p = this.roll ? { pos: this.roll.pos } : this.flight ? { pos: this.flight.pos } : this.walker.player;
      let near = null, best = Infinity;
      for (const st of HP_STATIONS) {
        const dx = p.pos.x - st.pos[0], dz = p.pos.z - st.pos[1];
        const d2 = dx * dx + dz * dz;
        const rr = this.flight ? st.radius * 2.2 : st.radius;   // from the air the wonders announce themselves sooner
        if (d2 < rr * rr && d2 < best) { best = d2; near = st; }
      }
      if (near !== this._nearStation) {
        this._nearStation = near;
        this.onStation?.(near);
      }
    }

    // Living world
    this._streams.forEach(s => s.update(this._t));
    this._updateBirds(this._t);

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
    // the standard flutters at the zephyr (p. 284): a travelling wave down the silk
    if (this._standard) {
      const pa = this._standard.m.geometry.attributes.position, b = this._standard.base;
      for (let i = 0; i < pa.count; i++) {
        const u = (b[i * 3] + 0.75) / 1.5;
        pa.array[i * 3 + 2] = b[i * 3 + 2] + Math.sin(this._t * 4.2 + u * 5.5) * 0.07 * u;
      }
      pa.needsUpdate = true;
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
    this.roll?.dispose?.();
    this.roll = null;
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
