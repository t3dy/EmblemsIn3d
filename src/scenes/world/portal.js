// portal.js — the pyramid-portal and the piazza: the horse, the elephant, the colossus, the doors, the bridges, and the orders they are built in
//
// Lifted out of HPWorldScene.js on 2026-09-09 and mixed back onto its
// prototype, so `this` is the scene and every method reads exactly as it did.
// The class had grown to ~194 000 tokens, which no agent could read and which
// under one-writer-per-file meant no two agents could touch the world at once.
// See ENGINEERING.md §2c and the split's own notes in DECISIONS.md.
//
// Bodies are copied verbatim: class methods and object-literal methods have the
// same syntax. Do not reindent them — a diff against the old file should show
// nothing but the move.

import * as THREE from 'three';
import { Masonry } from '../../systems/Masonry.js?v=8';
import { isVariant } from '../../systems/AssetVariants.js?v=12';
import { DOORS, SIGNS } from './constants.js?v=4';

export const Portal = {
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

    // ── THE BASE STOREY ──────────────────────────────────────────────────
    //
    // Added 2026-09-09 with the rescale (DECISIONS.md call 3). The book's
    // portal is not an arch: it is a MASS that stops the valley wall to wall,
    // with a porch cut through the middle of it —
    //
    //   "the foresaid valley there had an end, that no man could go further
    //    forward or backe againe, but to enter in by this broade, large, and
    //    wide open porche"                                   — Dallington p. 27
    //
    // and Colonna gives that mass its own dimensions, which the world had
    // never built: a base storey a fifth of a stadium high (37 m) under a
    // plinth of fourteen paces (20.7 m), the whole six stadia wide.
    // (DIMENSIONS.md §2.) What stood here instead was two small curtain walls
    // 7.4 m tall, added on 2026-09-08 to stop the walker going round the
    // building on the grass — they did that job and nothing else.
    //
    // The stones are BIG here on purpose: `block: 2.0, course: 1.3` against the
    // 1.2/0.8 the piers use. A wall of this size cut in pier-sized ashlar would
    // be nine hundred stones a side and would read as brickwork.
    const NECK = 24;                    // half-width of the valley at the portal
    const PORCH = 9;                    // outer face of the piers
    const BASE_TOP = 12;                // the pyramid springs from here
    for (const s2 of [-1, 1]) {
      const w = NECK - PORCH;
      this._ashlar(s2 * (PORCH + w / 2), 0, Z, w, BASE_TOP, 3.2, this._stoneMat,
        { course: 1.3, block: 2.0, name: 'the base storey of the Great Portal' });
      // TWO colliders a side, and the shape of them matters.
      //
      // The wall's own FOOTPRINT, from the piers to its outer end. Stopping
      // here was the first attempt and it left an open corridor between the end
      // of the base storey and the rock: a walk test from x = +-28, z = 36 went
      // through to z = 15 on one side and -10 on the other, round the building
      // and into the garden. Dallington p. 27 is an absolute -- "no man could
      // go further forward or backe againe" -- and building the base storey was
      // meant to make it true.
      this._wallCol(s2 > 0 ? PORCH - 0.4 : -(NECK + 2), s2 > 0 ? NECK + 2 : -(PORCH - 0.4),
                    Z - 1.8, Z + 1.8);
      // and the WEDGE of mountain beyond its end, up to where the cliffs' own
      // colliders begin at z = 41.5. Filling the whole quarter instead would
      // also have worked and is what the old curtain did -- but it walled off
      // the ground in FRONT of the wall too, so the reader could never come up
      // to the face and see that it is made of stones.
      this._wallCol(s2 > 0 ? NECK : -200, s2 > 0 ? 200 : -NECK, Z + 1.8, 41.5);
    }
    // and the wall over the door, which ties the two halves into one mass
    this._ashlar(0, 7.6, Z, PORCH * 2, BASE_TOP - 7.6, 3.2, this._stoneMat,
      { course: 1.1, block: 2.0, name: 'the wall above the porch' });

    // ── THE STEPPED PYRAMID ──────────────────────────────────────────────
    //
    // The book gives it 1,410 courses rising off a plinth six stadia square —
    // 1,140 m wide and some 785 m tall, by Colonna's own setting-out. The world
    // built it 17.5 m wide and 19 m to the cube, which is 1 : 65, and made the
    // most stupendous object in the book a garden folly on a lawn. Ted,
    // 2026-09-09, declined the 1 : 8 ground plan and approved rescaling the
    // monuments where they stand, so this is 40 m wide and 26 m of pyramid on
    // top of a 12 m base — about 1 : 28, and the first thing you see from the
    // palm plain rather than the last.
    //
    // The DEPTH stays modest (4.5 m against a true 1,140) and that is a lie the
    // plan forces: the three doors stand at z = 21 and the winged horse at
    // 22.5, so a square pyramid of any size would swallow the piazza behind it.
    // It is a gable, seen from the south as the plates draw it. Recorded rather
    // than hidden.
    const COURSES = 40, RISER = 0.66;
    for (let i = 0; i < COURSES; i++) {
      const t = i / COURSES;
      const w = 40 * (1 - t * 0.86);
      const d = 4.5 * (1 - t * 0.55);
      this._m(new THREE.BoxGeometry(w, RISER, d), this._stoneMat, 0, BASE_TOP + i * RISER, Z, { cast: i % 4 === 0 });
    }
    const TOP = BASE_TOP + COURSES * RISER;

    // Everything above the pyramid is scaled with it. At the old size these were
    // read from twenty metres away; on a 40 m pyramid seen from the palm plain
    // a 1.9 m cube is a pebble on a hill.
    const TS = 1.8;

    // "a huge Cube or foure square stone of forme like a dye" closes the pyramid
    this._m(new THREE.BoxGeometry(1.9 * TS, 1.9 * TS, 1.9 * TS), this._stoneMat, 0, TOP + 0.95 * TS, Z, { outline: true });

    // Four harpies of cast metal at the cube's corners, "their steales and clawes
    // armed," meeting over the diagonal to make the obelisk's socket
    const harpyMat = S.key === 'woodcut'
      ? S.mat({ tone: 0.2 })
      : S.mat({ color: 0x8a6a2a, metalness: 0.9, roughness: 0.35 });
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const hx = sx * 0.72 * TS, hz = Z + sz * 0.72 * TS;
      // clawed foot, body, and a swept wing leaning in toward the socket
      this._m(new THREE.ConeGeometry(0.16 * TS, 0.34 * TS, 6), harpyMat, hx, TOP + 2.06 * TS, hz);
      this._m(new THREE.CapsuleGeometry(0.1 * TS, 0.26 * TS, 4, 8), harpyMat, hx, TOP + 2.42 * TS, hz);
      const wing = this._m(new THREE.ConeGeometry(0.1 * TS, 0.6 * TS, 4), harpyMat, hx * 0.55, TOP + 2.66 * TS, Z + sz * 0.4 * TS);
      wing.rotation.z = -sx * 0.55; wing.rotation.x = -sz * 0.45;
    }
    // The socket the four of them make, dressed with cast leaves and fruit
    this._m(new THREE.CylinderGeometry(0.42 * TS, 0.52 * TS, 0.3 * TS, 12), harpyMat, 0, TOP + 2.9 * TS, Z);

    // The obelisk: two paces broad, seven high, of mirror-polished Theban stone
    this._m(new THREE.CylinderGeometry(0.13 * TS, 0.42 * TS, 4.6 * TS, 4), this._stoneMat, 0, TOP + 5.35 * TS, Z, { outline: true });
    // Its copper turning-base, and on it the winged Fortuna who spins in the wind
    this._m(new THREE.CylinderGeometry(0.16 * TS, 0.16 * TS, 0.14 * TS, 10), harpyMat, 0, TOP + 7.72 * TS, Z);
    this._buildFortuna(0, TOP + 7.85 * TS, Z, harpyMat, TS);

    // The Medusa whose gaping mouth is the door to the spiral stair. The book
    // sets her "vpon the right hand as I went" — the dreamer walks south out of
    // the wood, so his right is +x.
    this._buildMedusaDoor(5.4, Z + 1.16);

    // Flanking obelisks, moved OUT in front of the base storey on 2026-09-09.
    // They used to stand at x = ±11.2 with hedge walls at ±17.8 closing the gap
    // to the mountain; the base storey now fills that ground from the piers to
    // the cliff, so the hedges are gone (they would be buried in a wall) and
    // the obelisks stand clear of the face where they can still be seen.
    for (const s of [-1, 1]) {
      this._obelisk(s * 13.5, Z + 4.4, 1.6, 4.6);
    }

    // The dragon that drove Poliphilo through the vaults
    const dragon = this.cast.animals.dragon(1.6);
    this._npc('dragon', dragon, 3.4, 23.2, 2.6, { label: 'The Dragon', labelY: 1.6, sway: 0.06 });
  },

  // The winged nymph on the obelisk's point: robe "blowne abroad with the winde,"
  // two wings from the shoulder blades, face turned back toward them, her right
  // hand holding a cornucopia "stopped vp, and the mouth downewarde." She turns
  // with every gust — the whole point of her — so she is registered in _vanes.
  _buildFortuna(x, y, z, metalMat, scale = 1) {
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
  },

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
  },

  _obelisk(x, z, base, height) {
    this._m(new THREE.BoxGeometry(base, base * 0.5, base), this._stoneMat, x, base * 0.25, z, { outline: true });
    this._m(new THREE.CylinderGeometry(0.10, base * 0.32, height, 4), this._stoneMat, x, base * 0.5 + height / 2, z, { outline: true });
    this._m(new THREE.SphereGeometry(0.11, 10, 8), this._stoneMat, x, base * 0.5 + height + 0.08, z);
    this._circleCol(x, z, base * 0.7);
  },

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
    // The stony ground. Was 9 m deep, which covered the rock's own footing and
    // stopped short of the ground the reader crosses to reach it -- so the book's
    // "without any greene grasse or hearbe" held at the threshold and nowhere
    // else. It now runs back to z = 19, meeting the meadow's exclusion.
    this._m(new THREE.BoxGeometry(31, 0.08, 13.5), rockDk, 0, 0.04, Z + 0.75, { cast: false });
    // "full of broken and nybled stones": the rubble the seat is named for,
    // strewn over the approach. Small, flat and un-collided -- they are ground
    // texture you walk across, not obstacles, and the book's complaint is that
    // the place is harsh underfoot rather than that it is hard to cross.
    for (let i = 0; i < 54; i++) {
      const x = -15 + rnd(i, 20) * 30;
      const z = Z - 4.5 + rnd(i, 21) * 12.5;
      const r = 0.14 + rnd(i, 22) * 0.42;
      const cg = new THREE.DodecahedronGeometry(r, 0);
      cg.setIndex(Array.from({ length: cg.attributes.position.count }, (_, k) => k));
      const c = this._m(cg, i % 2 ? rock : rockDk, x, r * 0.34, z, { cast: false });
      c.rotation.set(rnd(i, 23) * 3, rnd(i, 24) * 3, rnd(i, 25) * 3);
      c.scale.set(1 + rnd(i, 26) * 0.7, 0.34 + rnd(i, 27) * 0.3, 1 + rnd(i, 28) * 0.7);
    }
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
  },

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
  },

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
    // of the elephant's base (pp. 53–54; see SIGNS), in his order,
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
  },

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
  // RESCALED 2026-09-09 (feat-monuments-true-scale, the second of three). It was
  // 17 m from crown to heel against Dallington p. 44's "three score paces" — 88.8 m
  // — a ratio of 1 : 5.2, the worst in the world after the portal. It is now 28 m
  // long and half again as thick: L stretches it along its own axis, G swells it.
  //
  // Why not 89 m: the mainland ground is 132 m across and the corridor this figure
  // lies in is clear only from x = 36 to the eastern edge at 66. At 89 m the
  // colossus IS the island. DECISIONS.md call 3 asked for the monuments to be
  // brought TOWARD their stated size in the plan they already occupy, and 28 m is
  // as far as that plan goes: 1 : 3.2, up from 1 : 5.2, and now by a long way the
  // largest figure in the world.
  //
  // The gain that is not about ratios: at 1.0 the mouth was a hole 0.9 x 1.5 m and
  // no one could have walked into it. At G = 1.55 it is 1.4 x 2.3 — a door. The
  // book's colossus is entered through the mouth; until now ours could only be
  // looked at, which made the object a sculpture and the whole point is that it is
  // not one.
  _buildColossus(KX = 36, KZ = 4) {
    const L = 1.65;   // along the axis: 17 m of figure becomes 28
    const G = 1.55;   // girth and height, and with them the doorways
    const S = this.style;
    const lit = S.key !== 'woodcut';
    const bronze = lit ? S.mat({ color: 0x4f7a5a, metalness: 0.7, roughness: 0.55 }) : S.mat({ tone: 0.16 });
    const dark   = lit ? S.mat({ color: 0x2c3a30, metalness: 0.5, roughness: 0.7 }) : S.mat({ tone: 0.3 });
    const sand   = lit ? S.mat({ color: 0x9a8a64, roughness: 0.95 }) : S.mat({ tone: 0.02, rim: 0 });
    // The figure lies along +x with its head at KX and its feet at KX + 17L = 64,
    // one clear pace short of the mainland's eastern edge.
    this._m(new THREE.CircleGeometry(16, 30), sand, KX + 14, 0.03, KZ, { rx: -Math.PI / 2, cast: false });
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
    half(2.2 * G, KX, KZ, 1, 1.05, 1.1);
    this._m(new THREE.BoxGeometry(0.9 * G, 1.5 * G, 0.5 * G), dark, KX - 2.15 * G, 0.75 * G, KZ, { cast: false });     // the mouth
    this._m(new THREE.BoxGeometry(0.7 * G, 1.3 * G, 0.3 * G), S.mat(lit ? { color: 0x08080a } : { tone: 0.5 }), KX - 2.3 * G, 0.7 * G, KZ, { cast: false });
    for (const sz of [-1, 1]) this._m(new THREE.SphereGeometry(0.26 * G, 10, 8), dark, KX - 1.4 * G, 1.75 * G, KZ + sz * 0.8 * G, { cast: false }); // the eyes
    // The mouth is a DOOR, so it gets a door's members: two columns, an
    // entablature, a threshold — the thing that makes a dome with a face read
    // as a building with a face, which is the whole claim of the object.
    for (const sz of [-1, 1]) this._column(KX - 3.0 * G, KZ + sz * 0.95 * G, 1.9 * G, { order: 'doric', r: 0.11 * G, mat: bronze });
    this._entablature(KX - 3.0 * G, 1.9 * G, KZ, 2.6 * G, 0.6 * G, { ry: Math.PI / 2, dentils: false, mat: bronze });
    this._m(new THREE.BoxGeometry(0.9 * G, 0.12 * G, 2.6 * G), dark, KX - 3.0 * G, 0.06 * G, KZ, { cast: false });
    // ribs along the vaults, so the body reads as built and not as blown
    for (const [x0, len, hh] of [[KX + 4.6 * L, 5.4 * L, 2.5 * G], [KX + 9.0 * L, 3.6 * L, 1.8 * G]]) {
      const step = 0.9 * L;
      for (let k = 0; k < Math.floor(len / step); k++) {
        const rib = this._m(new THREE.TorusGeometry(hh * 1.01, 0.06 * G, 6, 20, Math.PI), dark, x0 - len / 2 + step / 2 + k * step, 0, KZ, { cast: false });
        rib.rotation.y = Math.PI / 2;
      }
    }
    // the chest: a barrel vault; the belly a lower one; the legs two long vaults
    vault(KX + 4.6 * L, KZ, 3.3 * G, 2.5 * G, 5.4 * L);
    vault(KX + 9.0 * L, KZ, 2.6 * G, 1.8 * G, 3.6 * L);
    for (const sz of [-1, 1]) vault(KX + 14.0 * L, KZ + sz * 1.3 * G, 1.0 * G, 0.95 * G, 6.5 * L);
    // the arms, laid along the sides
    for (const sz of [-1, 1]) vault(KX + 5.5 * L, KZ + sz * 3.9 * G, 0.85 * G, 0.8 * G, 7.0 * L);
    for (const dx of [2.5, 4.5, 6.5, 8.5, 10.5, 12.5]) {
      for (const sz of [-1, 1]) this._wallCol(KX + dx * L - 1, KX + dx * L + 1, KZ + sz * 3.9 * G - 0.9, KZ + sz * 3.9 * G + 0.9);
    }
    // ── THE INTERIOR ────────────────────────────────────────────────────
    //
    // Lefaivre pp. 52-53: the colossus is entered THROUGH THE MOUTH and its
    // interior is "formed exactly like the inside of a human body", every organ
    // a chamber with its own door, its name above it and the sicknesses
    // generated in it; and in the heart the chamber where love is born, whose
    // cures are written in Chaldean and which Poliphilo does not divulge.
    //
    // Until now ours was solid: the head was one circle collider and the body
    // one wall, so a walker coming up to the mouth stopped dead at x = 31.8 and
    // the pocket of open space inside the skull could not be reached. The
    // station note on screen said he walks in through its mouth while the world
    // said otherwise (ticket feat-colossus-interior).
    //
    // NO GEOMETRY CHANGES HERE, and that is not luck: the body is already built
    // from half-cylinder vaults and a hemisphere dome, which are shells. It was
    // only ever the colliders that were solid. So the exterior silhouette is
    // untouched, as the ticket requires, and this is entirely a matter of where
    // the walls are.
    const bodyZ0 = KZ - 3.4 * G, bodyZ1 = KZ + 3.4 * G;
    const inX0 = KX + 2 * L;
    // The passage stops before the LEGS. Their vaults are 1.47 m to the crown
    // inside -- you would be crawling -- and they begin at x = 53.7. Measured,
    // not guessed: leg vault h = 0.95 * G, centred x = KX + 14 * L, length
    // 6.5 * L.
    const inX1 = 53.5;
    const IN_W = 1.8;               // half-width of the passage: 3.6 m across
    const HGAP = 0.85;              // the throat is narrower than the chest
    const heartX = KX + 3.4 * L, CH = 1.6;

    // the head: two flanks with the mouth between them, instead of one circle
    const headX0 = KX - 2.4 * G;
    this._wallCol(headX0, inX0, KZ - 2.4 * G, KZ - HGAP);
    this._wallCol(headX0, inX0, KZ + HGAP, KZ + 2.4 * G);

    // the body: a wall down each side of the passage rather than one solid mass
    this._wallCol(inX0, inX1, KZ + IN_W, bodyZ1);                  // north flank
    this._wallCol(inX0, heartX - CH, bodyZ0, KZ - IN_W);           // south, before the heart
    this._wallCol(heartX + CH, inX1, bodyZ0, KZ - IN_W);           // south, after it
    // the heart chamber is a room you can stand in, so its own outer skin has to
    // stop you -- without this the one doorway in the flank is a way OUT of the
    // colossus, which would make the whole figure walk-through-able
    this._wallCol(heartX - CH, heartX + CH, bodyZ0 - 0.4, bodyZ0 + 0.4);
    // and the legs close the far end
    this._wallCol(inX1, KX + 17 * L, bodyZ0, bodyZ1);
    // the organs, as the book has them: a chamber each, its name above it and
    // the sicknesses generated in it. The doors are on the south flank and are
    // READ FROM A DISTANCE, not walked up to: the arm lies along that side, its
    // colliders flush against the body, so the nearest a walker gets is beyond
    // the arm. That was true before the rescale too and is not new -- measured
    // with walker.collide(), not assumed. See ticket feat-colossus-interior.
    const ORGANS = [
      // spacing compressed from 3.6-11.0 so that all six land INSIDE the
      // passage, which ends at 53.5 where the legs begin. The order is the
      // book's and is unchanged; only the intervals give way.
      ['COR',      'THE HEART · WHERE LOVE IS BORN · THE CVRES WRITTEN IN CHALDEAN, NOT DIVVLGED', 3.4],
      ['PVLMONES', 'THE LVNGS · PLEVRISY · SHORTNESS OF BREATH', 4.7],
      ['HEPAR',    'THE LIVER · CHOLER · THE IAVNDICE', 6.0],
      ['LIEN',     'THE SPLEEN · MELANCHOLY', 7.3],
      ['VENTER',   'THE BELLY · COLIC · DROPSY', 8.6],
      ['RENES',    'THE KIDNEYS · THE STONE', 9.9],
    ];
    // The doors now face the PASSAGE, not the open field. They were on the
    // outside flank, behind the arm, where the nearest a walker could get was
    // beyond the arm -- readable at a distance and enterable never.
    for (const [name, sick, dx] of ORGANS) {
      const ox = KX + dx * L;
      // the heart alone is not a door but a doorway: the wall is open there
      if (name !== 'COR') {
        this._m(new THREE.BoxGeometry(0.62 * G, 1.0 * G, 0.2 * G), dark, ox, 0.5 * G, KZ - IN_W + 0.11, { cast: false });
      }
      this._plaque({ main: name, sub: sick }, 1.3 * G, 0.34 * G, ox, 1.35 * G, KZ - IN_W + 0.12, 0, true);
    }
    // ── The loop-holes and wickets ──────────────────────────────────────
    //
    // Dallington p. 45: "small loope-holes and wickets in sundry places
    // diuersly disposed, yeelding thorough them a sufficient light to beholde
    // the seuerall partes of the artificiall anothomie".
    //
    // Found by the chapter III research pass on 2026-09-09, hours after the
    // interior was opened, and it is the fixture that interior needed: the
    // passage was a dark tube with labelled doors nobody could read. The book
    // had the answer in it the whole time, which is the argument for reading a
    // chapter end to end rather than for the thing you are currently building.
    //
    // Pierced through the CROWN of the vaults, where daylight would actually
    // fall, and set alternately off the axis so the light rakes across the
    // organ doors on the south wall instead of pooling down the middle. Their
    // heights follow the vaults they pierce -- the chest's crown is 3.88 m
    // inside and the belly's 2.79, measured off the vault radii (2.5 * G and
    // 1.8 * G), so a wicket sits a little under each.
    // `lit`, not `woodcut`: this builder names its register flag the other way
    // round from its neighbours, and copying the neighbour's idiom cost a
    // ReferenceError that node --check cannot see.
    const wicketM = lit
      ? S.mat({ color: 0xf6efdc, roughness: 1.0 })
      : S.mat({ tone: 0.0 });
    if (lit) {
      wicketM.emissive = new THREE.Color(0xf2e6c2);
      wicketM.emissiveIntensity = 0.95;
    }
    const WICKETS = [
      [KX + 3.0 * L, 3.60, -0.55], [KX + 4.6 * L, 3.60, 0.55],
      [KX + 6.2 * L, 3.60, -0.55], [KX + 7.6 * L, 3.60, 0.55],
      [KX + 9.2 * L, 2.50, -0.45], [KX + 10.4 * L, 2.50, 0.45],
    ];
    WICKETS.forEach(([wx, wy, off], i) => {
      this._m(new THREE.PlaneGeometry(0.46, 0.30), wicketM, wx, wy, KZ + off,
        { rx: Math.PI / 2, cast: false });
      // every other wicket carries a lamp; six point lights inside one figure
      // would cost more than the light is worth, and the shafts read from the
      // emissive alone
      if (i % 2 === 0) {
        const pl = S.pointLight(0xffe9c4, 1.15, 8);
        if (pl) { pl.position.set(wx, wy - 0.7, KZ + off); this.scene.add(pl); }
      }
    });

    // Inside the heart, on the far wall. The book is emphatic that the cures
    // exist, are written, and are withheld, so the chamber says exactly that
    // and gives nothing -- the one place in the world where a plaque is a
    // refusal rather than a gloss.
    this._plaque({ main: 'NON DIVVLGO', sub: 'THE CVRES FOR THE SICKNESSES OF LOVE · WRITTEN HERE IN CHALDEAN · POLIPHILO WILL NOT SAY THEM' },
      2.0 * G, 0.4 * G, heartX, 1.5 * G, bodyZ0 + 0.45, 0, true);
    this._plaque({ main: 'COLOSSVS', sub: 'A SCVLPTVRE THAT IS A BVILDING · ENTERED BY THE MOVTH · LEFAIVRE PP. 52–53' },
      2.4 * G, 0.42 * G, KX - 2.4 * G, 2.6 * G, KZ, -Math.PI / 2, true);
    // The female colossus beside him, more buried, and with NO door. She grows
    // less than he does (FG, FL) because the book gives her less, and her whole
    // body moves two metres south — the male's flank came out to meet her when he
    // swelled, and the path the organ doors open onto would otherwise be 1 m wide.
    const FL = 1.5, FG = 1.35, FZ = KZ - 11.0;
    half(1.8 * FG, KX + 1.0 * FL, FZ, 1, 0.55, 1.1).position.y = -0.3 * FG;
    vault(KX + 5.2 * FL, FZ, 2.6 * FG, 1.5 * FG, 5.0 * FL).position.y = -0.55 * FG;
    vault(KX + 10.0 * FL, FZ, 2.0 * FG, 1.1 * FG, 4.0 * FL).position.y = -0.5 * FG;
    this._wallCol(KX - 1 * FL, KX + 12.5 * FL, FZ - 2.0 * FG, FZ + 2.0 * FG);
    this._plaque({ main: 'ALTERA', sub: 'THE OTHER · HALF-HIDDEN · POLIPHILO REFVSES TO ENTER · PRIKI' },
      1.8 * FG, 0.34 * FG, KX + 5.2 * FL, 1.3 * FG, FZ + 2.7 * FG, 0, true);
  },

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
  },

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
  },

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
  },

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
      const V = SIGNS;
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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

  // A flight of steps (a crepidoma) on the +z face of a platform.
  _steps(cx, cz, w, n = 3, rise = 0.16, tread = 0.42, { parent = null, mat = null } = {}) {
    const M = mat || this._stoneMat;
    const g = parent || this.scene;
    for (let i = 0; i < n; i++) {
      this._m(new THREE.BoxGeometry(w - i * 0.2, rise, tread), M,
        cx, rise / 2 + i * rise, cz + (n - i) * tread * 0.72,
        { parent: g, cast: false });
    }
  },

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
  },
};
