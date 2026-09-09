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
import { makeCast } from '../systems/Cast.js?v=53';
import { DragonFlight } from '../systems/DragonFlight.js?v=2';
import { RollUp, MAX_EDIBLE } from '../systems/RollUp.js?v=10';
import { Masonry } from '../systems/Masonry.js?v=8';
import { buildLitter } from '../systems/Litter.js?v=5';
import { isVariant } from '../systems/AssetVariants.js?v=8';
import { createStyle, addSkyDome } from '../shaders/HPStyles.js?v=6';
import { getEnvMap } from '../systems/EnvMap.js?v=1';
import { createMeadowField, attachShade } from '../systems/Meadow.js?v=5';
// The world's shared tables. Lifted out 2026-09-09; see world/constants.js.
import {
  HP_STATIONS, EYE, METALS, DOORS, ELEMENTS, SENSE_NYMPHS,
  TRIUMPH_LIVERY, TRIUMPH_RELIEFS, TRIUMPHS, isDescendantOf,
  WOOD, WOOD_CLEARINGS, WITNESS_POSES, WITNESS_AT, SIGNS,
  CYTHERA_CLIMBERS, HERBS, SPECIES,
} from './world/constants.js?v=3';
import { Materials } from './world/materials.js?v=1';
import { Nature } from './world/nature.js?v=4';
import { Approach } from './world/approach.js?v=5';
import { Portal } from './world/portal.js?v=7';
import { Palace } from './world/palace.js?v=4';
import { Triumphs } from './world/triumphs.js?v=3';
import { Tombs } from './world/tombs.js?v=3';
import { Temple } from './world/temple.js?v=1';
import { Cythera } from './world/cythera.js?v=3';
import { Rollup } from './world/rollup.js?v=4';

// main.js imports HP_STATIONS from here and always has; keep that face.
export { HP_STATIONS };


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
    // far was 260, which was a whole world's worth when the world was 100 m
    // across. The approach of ch. II-III needs the pyramid visible from a
    // quarter-kilometre away, "vnperfectlie appearing" (DIRECTIONS.md 3).
    this.camera   = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 1400);
    this.camera.rotation.order = 'YXZ';
    this.onStation = null;         // callback(station | null) as the player nears a wonder

    this.walker = new Walker(renderer, {
      eye: EYE,
      // Bounds now reach the island of Cythera (centre 0,-150, radius 50);
      // the open sea between shore and island is fenced by walls and a ring
      // of coast colliders, so the crossing is by boat (digit 0) only.
      // maxZ was 50 -- the far edge of the old dark wood. The wood now begins
      // at z = 200 and the spacious plain the dream opens on runs to z = 470
      // (DIRECTIONS.md 3), so the walkable box reaches it.
      bounds: { minX: -140, maxX: 140, minZ: -206, maxZ: 462 },
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
      // Wake on the spacious plain, facing north — the way chapter I opens, and
      // the way he goes. Was (0, 0, 340), the middle of the dark wood: lost
      // from the first frame, which is a good hook and the wrong chapter.
      // DECISIONS.md 2026-09-09 call 2. The wood is 28 m ahead and you walk
      // into it, which is what makes it a wood you enter rather than a wood you
      // are simply in.
      this.walker.player.pos.set(0, 0, 448);
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
    // Density was 0.0082, tuned when nothing stood further off than 60 m. The
    // aerial perspective is a RATIO of haze to distance, so in a world eight
    // times longer the same picture needs a proportionally thinner air: at
    // 0.0034 a thing 50 m off is barely veiled, one at 200 m is half drowned,
    // and the pyramid at 350 m is the faint blue ghost the book describes --
    // 0.0022 settled by eye from the palm plain, where the whole approach is
    // in one frame: at 0.0034 the portal 130 m off was already white.
    // "the forme of a tower of an incredible heygth, with a spyre vnperfectlie
    // appearing" (Dall. p. 24). Leonardo's rule is unchanged; the world moved.
    this.scene.fog = lit
      ? new THREE.FogExp2(this.AIR, 0.0022)
      : new THREE.FogExp2(S.fog.color, S.fog.density);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (S.useEnv) {
      this.scene.environment = getEnvMap(this.renderer);
      this.scene.environmentIntensity = 0.3;
    }
    this._lights = S.setupLights(this.scene);
    // The dome is 190 m of radius and the world is now 500 m long, so it has
    // to travel with the eye or you walk out of the sky. It writes no depth and
    // draws first, so distant geometry still paints over it.
    if (lit) this._sky = addSkyDome(this.scene, { top: 0x86a4cc, horizon: 0xf0d6a8, stars: 0 });
    else if (S.sky) this._sky = addSkyDome(this.scene, S.sky);
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
    this._buildApproach();
    this._buildSpaciousPlain();   // where the dream opens (DECISIONS 2026-09-09 call 2)
    this._buildArtificialGardens();   // glass, silk and the faked scent (call 4)
    this._buildWitness();             // Poliphilo, acting out his reactions
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

    // Gather the court standing where Polia's arcade must stand, so the dream
    // can fold it away while the dreamer is inside the garden. Must run after
    // everything is built and before the draw calls are compiled, because the
    // gathering is a reparenting and the compiler merges per group.
    const folded = this._foldPoliaCourt(19, 20, 9, 42);
    console.info("[dream fold]", folded, "objects fold for Polia's garden,",
      this._poliaArcade ? this._poliaArcade.children.length : 0, "arcade pieces stand");

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
    // Poliphilo walks from station to station and changes his attitude at each,
    // so he must stay his own draw for the same reason. Merged, he was baked at
    // the origin: `_witnessTo` moved a group whose geometry had already been
    // folded into a static lump in world space, so he was invisible everywhere
    // and present nowhere. See _buildWitness.
    if (this._witness) mark(this._witness.g);
    for (const h of this._hovers) mark(h.g);
    if (this._quinta) { mark(this._quinta.dod); if (this._quinta.rays) mark(this._quinta.rays); }
    if (this._torch) mark(this._torch);
    if (this._boat) {
      // The exeres is compiled INSIDE its own group, the way the triumph floats
      // are, so the hull, oars and gems ride the swell and still reach the
      // roll-up census (a wholesale mark() kept every plank out of it). The
      // standard stays live -- its silk is re-written every frame -- and so do
      // the rowers, who sway.
      const local = new Set(dyn);
      if (this._standard) local.add(this._standard.m);
      for (const n of this._npcs) if (this._boat.getObjectById(n.g.id)) n.g.traverse(x => local.add(x));
      this._mergeInto(this._boat, local);
      mark(this._boat);
      if (this._boat.userData.cupid) mark(this._boat.userData.cupid);
    }
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

    // Polia's arcade, and the court it displaces, are each compiled INSIDE
    // their own group and then fenced off — the same trick the island and the
    // triumph floats use. That is what makes folding cheap: one `visible`
    // flag moves a whole quarter of the world, and while the garden is open
    // the frame is actually cheaper, not dearer.
    if (this._poliaArcade) { this._mergeInto(this._poliaArcade, dyn); mark(this._poliaArcade); }
    if (this._poliaCourt)  { this._mergeInto(this._poliaCourt,  dyn); mark(this._poliaCourt);  }

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
      const sup = this._resolveSupports();
      console.info('[supports]', sup.stacked, 'things resting on', sup.supporters, 'others');
    }
  }

  // ── The dream folds ─────────────────────────────────────────────────────
  //
  // DECISIONS.md 2026-09-09, "The dream does not have to add up." Polia's
  // arcade needs a ring 40 m out from her garden and the palace court is built
  // on that ground. The court is finished work and the arcade is in the book,
  // so neither gives way permanently: the court folds while the dreamer is
  // inside the garden and unfolds when he leaves.
  //
  // This is not a trick for hiding a seam. The Hypnerotomachia is a dream —
  // the strife of love in a dream — and its spaces do not add up; nothing in
  // Colonna requires the court and the garden to be simultaneously true. What
  // folds is ground between set-pieces. Nothing in the book's ORDER folds, and
  // no event is skipped: see the decision, which is explicit about the limit.
  _foldPoliaCourt(CX, CZ, innerR, outerR) {
    const g = new THREE.Group();
    this.scene.add(g);
    // the named figures move whole, so they are groups rather than meshes, and
    // a court whose architecture vanished while its people stayed would read as
    // a bug rather than as a dream
    const people = new Set(this._npcs.map(n => n.g));
    // THE SET-PIECES DO NOT FOLD. The decision is explicit that what folds is
    // ground between them, and the first attempt broke its own rule: a ring of
    // 42 m round Polia swallowed ELEVEN stations — the Great Portal, the court,
    // the three doors, the elephant, the palace, the Quinta Essentia, the
    // fountain, the colossus, Priapus, Book II and the triumphs. That is not a
    // dream folding, that is the book going out. So every station but Polia's
    // own keeps a protected circle, and the arcade stands among them.
    const keepOut = HP_STATIONS
      .filter(st => st.key !== 'polia')
      .map(st => ({ x: st.pos[0], z: st.pos[1], r: (st.radius || 8) + 3 }));
    const guarded = (x, z) => keepOut.some(k => Math.hypot(x - k.x, z - k.z) < k.r);
    const box = new THREE.Box3();
    const take = [];
    for (const child of this.scene.children) {
      if (child === g || child === this._poliaArcade) continue;
      if (!child.isMesh && !people.has(child)) continue;
      box.setFromObject(child);
      if (box.isEmpty()) continue;
      // the ground, the sea and the sky dome are not court furniture
      if ((box.max.x - box.min.x) > 60 || (box.max.z - box.min.z) > 60) continue;
      const cx = (box.min.x + box.max.x) / 2, cz = (box.min.z + box.max.z) / 2;
      const d = Math.hypot(cx - CX, cz - CZ);
      if (d > innerR && d < outerR && !guarded(cx, cz)) take.push(child);
    }
    // attach(), not add(): the world transform has to survive the reparenting
    for (const m of take) g.attach(m);
    this._poliaCourt = g;
    this._gardenFold = { x: CX, z: CZ, inner: innerR, outer: outerR,
                         openAt: innerR, closeAt: outerR + 2 };
    this._prepareGardenFold();
    return take.length;
  }

  // Both collider sets are computed ONCE. Rebuilding them on every crossing was
  // the obvious way and it is wrong: the walker is asked for a collision every
  // frame, and a threshold you can walk back and forth across should not cost a
  // filter over two thousand colliders each time.
  _prepareGardenFold() {
    const W = this.walker, F = this._gardenFold;
    const inRing = (x, z) => {
      const d = Math.hypot(x - F.x, z - F.z);
      return d > F.inner && d < F.outer;
    };
    // folded — the ordinary world: the court stands, the arcade does not
    F.colsFolded  = W.colliders.filter(c => !c.arcade);
    F.wallsFolded = W.walls.slice();
    // open — inside the garden: the arcade stands, the court in the ring does not
    F.colsOpen  = W.colliders.filter(c => c.arcade || !inRing(c.x, c.z));
    F.wallsOpen = W.walls.filter(w => !inRing((w.x0 + w.x1) / 2, (w.z0 + w.z1) / 2));
    W.colliders = F.colsFolded;
    W.walls     = F.wallsFolded;
  }

  _setGardenOpen(on) {
    const F = this._gardenFold;
    if (!F || on === this._gardenOpen) return;
    this._gardenOpen = on;
    if (this._poliaCourt)  this._poliaCourt.visible  = !on;
    if (this._poliaArcade) this._poliaArcade.visible = on;
    this.walker.colliders = on ? F.colsOpen  : F.colsFolded;
    this.walker.walls     = on ? F.wallsOpen : F.wallsFolded;
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

  // Roll Up eats meshes, and a thing built of several meshes on several
  // materials would otherwise come off in pieces (see _resolveRollGroups).
  // `_rollGroup(id, fn)` runs a builder and tags every mesh it makes with one
  // group id, so the census measures and takes them together.
  _rollGroup(id, fn, name = null) {
    const before = this._madeMeshes ? this._madeMeshes.length : 0;
    this._madeMeshes = this._madeMeshes || [];
    this._grouping = (this._grouping || 0) + 1;
    try { fn(); } finally { this._grouping--; }
    for (let i = before; i < this._madeMeshes.length; i++) {
      this._madeMeshes[i].userData.rollGroup = id;
      // the whole has a name of its own -- "the second table, of beryl" -- and
      // a ball that ate it should not report "a leg of ebony"
      if (name) this._madeMeshes[i].userData.rollGroupName = name;
    }
    if (!this._grouping) this._madeMeshes.length = 0;
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


  // ── Chapter I: the dark wood, and chapter II's approach ──────────────────
  //
  // Rebuilt 2026-09-08 from the research pass (WOODS.md §1, DIRECTIONS.md §3),
  // after Ted: *"the world of our virtual dream garden is too small … the trees
  // of the wood dark enough to tower over our hero and cast enough shadows to
  // make it dark."*
  //
  // What was here was a 70 × 22 m strip of 64 trees six to eleven metres tall,
  // with a 5.4 m path cut through it. Three things were wrong, and all three
  // are settled by the book's own words:
  //
  //   * THE SPECIES. The 1499 (ll. 555–563) names "el silvano fraxino ingrato
  //     alle vipere, ulmi ruvidi alle foecunde vite grati, corticosi subderi
  //     apto additamento muliebre, duri cerri, forti roburi et glandulose
  //     querce et ilice" — ash, elm, cork oak, Turkey oak, durmast, acorn-oak,
  //     holm oak. FIVE OF THE SEVEN ARE OAKS, and there is no beech and no fir.
  //     Dallington's "soft Beeche" and "browne Hasils" render *querce* and
  //     *ilice*; his "harde Ebony" renders *duri cerri*. The fir came from the
  //     proem's WINTER SIMILE (l. 475 — the winds that bend the fir "sotto gli
  //     corni di tauro lascivianti", under the horns of the wanton Bull, which
  //     is the zodiac sign and dates the dream to late April) and never
  //     belonged in the wood at all. Conifers are on the mountain slopes of
  //     ch. VI, where Colonna actually puts them.
  //   * THE CANOPY. "…che al roscido solo non permettevano gli radii del
  //     gratioso sole integramente pervenire, ma, come da CAMURATO CULMO di
  //     densante fronde coperto, non penetrava l'alma luce" — as if roofed by a
  //     VAULT of thickening foliage, the kindly light did not get through.
  //     Colonna uses the architectural word for a vault. So the crowns close
  //     overhead and the floor is in shadow; and on coming out, Poliphilo's
  //     eyes, "vsed to such obumbrated darkenes, could scarse abide to behould
  //     the light" (Dall. p. 17). The dazzle on leaving is the proof.
  //   * THE PATH. "could not finde any track or path, eyther to direct me
  //     forward, or lead me back againe" (Dall. p. 15). There is none now. The
  //     way out is the book's own instrument, the only navigational advice in
  //     the whole text: "the keeping of the sunne still vpon one side, to
  //     direct mee streight forwarde". The sun is at (16, 22, 10) — south-east
  //     under the compass frame this world now declares — so its shafts fall
  //     through the clearings toward the north-west, and a walker who keeps
  //     them on one shoulder leaves by the north edge. See _woodClearings.
  //
  // Poliphilo names the place: he begins "ragionevolmente suspicare et
  // crederme pervenuto nella VASTISSIMA HERCYNIA SILVA" (l. 563). Fabiani
  // Giannetto (Word & Image 31.2, 2015, p. 4) notes the Hercynian forest was
  // known to historians and geographers as "the largest and most impenetrable
  // of all forests in Europe". It is 200 × 195 m here — a region to be lost
  // inside, not a screen walked past.

  // The wood's own extent, so the duff, the trees, the clearance map and the
  // meadow all agree about where it is.
  static get WOOD() { return WOOD; }

  // Five clearings where the canopy opens and the sun reaches the floor. These
  // are the wood's ONLY navigational information, and they are deliberate: with
  // no path and no sightline, the shafts are how a walker recovers the sun's
  // bearing and walks out of the Hercynian. Seeded, so the wood is the same
  // wood every time and can be learned.
  static get WOOD_CLEARINGS() { return WOOD_CLEARINGS; }


  // ── POLIPHILO, ACTING ─────────────────────────────────────────────────────
  //
  // Ted, 2026-09-09: he wants the reader "looking at modeled versions of
  // everything described in the text, and seeing a Polyphilo figure acting out
  // his reactions."
  //
  // WHY A SECOND POLIPHILO IS NOT ODD. In free walk you are Poliphilo, so a
  // Poliphilo standing in front of you looks at first like a duplication. It is
  // the book's own convention: **the 1499 cuts draw Poliphilo inside almost
  // every scene**, usually at the edge, usually smaller than the wonder, always
  // looking at it. The plates do not show you what he saw; they show you him
  // seeing it. A figure at the edge of each station, posed to what he says
  // there, is the woodcut's staging and not a mistake.
  //
  // WHAT HE DOES. `src/data/poliphilo.json` already catalogues every utterance
  // in the book with its station, its kind, and — the useful part — its
  // OCCASION, the sentence saying what he was doing when he said it. Seventeen
  // stations have one. So the data for "what does he react to, and how" was
  // written months ago and has been sitting unused: this reads it and stands him
  // accordingly.
  //
  // HOW IT IS DONE, per HUMANOIDS.md §4: authored poses, non-linear easing, and
  // gaze — in that order of value, and no rig. A rig would let him move; what
  // makes a still figure read as alive is that its face is not square to its own
  // chest and that it arrives at a pose rather than snapping to it.
  //
  // He is deliberately absent from Roll Up (you are a ball), from Fly (you are a
  // dragon) and from the Dream (you are him, and the mode says so).

  // Each pose is: the two arm pivots as [rotation.z, rotation.x], then the lean
  // of the whole body, the head's tilt and its turn. Arms are mirrored in sign,
  // so a positive z on the left and a negative on the right both mean "away
  // from the body" — which is why every entry below looks asymmetrical and is
  // not. The asymmetry that matters is in `head` and `lean`.
  static get WITNESS_POSES() { return WITNESS_POSES; }

  // Which pose belongs to which station, read off the OCCASION recorded in
  // poliphilo.json rather than invented here. The comment on each line is the
  // occasion it answers, abbreviated; the full sentence is in the data.
  static get WITNESS_AT() { return WITNESS_AT; }


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
  static get SIGNS() { return SIGNS; }


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
  static get CYTHERA_CLIMBERS() { return CYTHERA_CLIMBERS; }


  static get HERBS() { return HERBS; }


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
  static get SPECIES() { return SPECIES; }


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

    // Polia's garden opens as the dreamer comes to it and folds as he goes.
    // Only on foot: the ball and the dragon see the world from outside, and a
    // quarter of it vanishing under them would be a glitch, not a dream.
    if (this._gardenFold && !this.roll && !this.flight) {
      const gp = this.walker.player.pos, F = this._gardenFold;
      const gd = Math.hypot(gp.x - F.x, gp.z - F.z);
      if (!this._gardenOpen && gd < F.openAt) this._setGardenOpen(true);
      else if (this._gardenOpen && gd > F.closeAt) this._setGardenOpen(false);
    }

    // The shadow box and the sky dome travel with the eye. Both used to be
    // nailed to the origin, which was invisible in a 100 m world and fatal in a
    // 500 m one: outside a ±118 m box nothing casts, and outside a 190 m dome
    // you are standing beyond the sky. (HPStyles.trackedSun, addSkyDome.)
    const eye = this.camera.position;
    if (this._lights && this._lights.followShadow) this._lights.followShadow(eye.x, eye.z);
    if (this._sky) this._sky.position.set(eye.x, 0, eye.z);

    // ── Pace, and the way out of the wood ────────────────────────────────
    //
    // DECISIONS.md 2026-09-09 call 2: follow the novel to the letter, and buy
    // pace with SPEED — never by reordering, shortening or skipping a stage.
    // The plain-to-portal walk is now 411 m and at the old 10 m/s run that is
    // 41 seconds of holding a key.
    //
    // So running is faster in the open and slower under the trees, which is not
    // a compromise but the book: "not knowing how to goe among the thicke
    // bowghes and tearing thornes, bearing vpon my face: rending my clothes,
    // and houlding me sometimes hanging in them, WHEREBY MY HAST IN GETTING
    // FOORTH WAS MUCH HYNDERED" (Dall. p. 15). You feel the wood take your
    // speed away as you enter it and give it back as you leave — which is also
    // the dazzle of getting out, felt in the legs instead of the eyes.
    if (this.walker && !this.flight && !this.roll) {
      const W = WOOD, p = this.walker.player.pos;
      const under = p.x > W.x0 - 10 && p.x < W.x1 + 10 && p.z > W.z0 - 6 && p.z < W.z1 + 6;
      this.walker.runSpeed = under ? 9 : 16;
      this.walker.speed = under ? 4.4 : 5.6;

      // The way out. It is the only navigational instruction in the whole book
      // and it is already true of this world — the sun is fixed at (16, 22, 10)
      // so holding it at a constant bearing walks a straight line, and a
      // straight line leaves a 195 m wood. But a mechanic nobody can discover
      // is not a mechanic. Four sentences after the line below Poliphilo is
      // wishing for Ariadne's clew to lead him out; the sun is the thread he
      // already has, and nothing in the world said so.
      //
      // Twenty seconds, once per session, and only when he is properly inside:
      // long enough that it arrives as an answer to a question he has started
      // asking, not as a tooltip.
      if (this.onLost && !this._lostSaid && !this.dream) {
        const deep = p.x > W.x0 + 12 && p.x < W.x1 - 12
                  && p.z > W.z0 + 16 && p.z < W.z1 - 16;
        this._lostT = deep ? (this._lostT || 0) + dt : 0;
        if (this._lostT > 20) { this._lostSaid = true; this.onLost(); }
      }
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
        // Poliphilo takes the attitude the book records for this place. He is
        // absent while you are a ball, a dragon, or him.
        if (this._witness && !this.roll && !this.flight && !this.dream) this._witnessTo(near);
      }
    }

    // Living world
    this._updateWitness(dt);
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

// ── prototype mixins ──────────────────────────────────────────────────────
// The world's builders live in ./world/*.js and are mixed onto the prototype
// here. `this` is the scene inside every one of them, exactly as before; the
// only thing that changed is which file they are written in.
// ── prototype mixins ──
Object.assign(HPWorldScene.prototype, Materials);
Object.assign(HPWorldScene.prototype, Nature);
Object.assign(HPWorldScene.prototype, Approach);
Object.assign(HPWorldScene.prototype, Portal);
Object.assign(HPWorldScene.prototype, Palace);
Object.assign(HPWorldScene.prototype, Triumphs);
Object.assign(HPWorldScene.prototype, Tombs);
Object.assign(HPWorldScene.prototype, Temple);
Object.assign(HPWorldScene.prototype, Cythera);
Object.assign(HPWorldScene.prototype, Rollup);
