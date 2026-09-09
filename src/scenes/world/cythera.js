// cythera.js — the island: its rings, roads, terraces, theatre, the crossing and Adonis
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
import { CYTHERA_CLIMBERS, SPECIES } from './constants.js?v=3';

export const Cythera = {
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
  },

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
    this._rollGroup('exeres_hull', () => {
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
    }, 'the hull of Cupid\u2019s exeres');
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
  },

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
    const CLIMB = CYTHERA_CLIMBERS;
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
  },

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
    this._rollGroup('adonis_sepulchre', () => {
    this._m(new THREE.BoxGeometry(TL + 0.28, 0.16, TW + 0.28), alab, px, 0.18, pz, { ry: -ang, outline: true });
    this._m(new THREE.BoxGeometry(TL, TH, TW), alab, px, 0.26 + TH / 2, pz, { ry: -ang, outline: true });
    this._m(new THREE.BoxGeometry(TL + 0.2, 0.09, TW + 0.2), alab, px, 0.26 + TH + 0.045, pz, { ry: -ang });
    }, 'the sepulchre of Adonis');
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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },
};
