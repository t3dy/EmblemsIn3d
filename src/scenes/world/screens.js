// screens.js — the things that stop you seeing where you are going.
//
// Ted, 2026-09-20, choosing what stage 2 builds after the pyramid: **the
// screens**. The reason is `DIRECTIONS.md` §5 and it is the strongest formal
// rule the book has:
//
//   *Nothing in this book is approached across open ground with the
//   destination in view.*
//
// Every monument is glimpsed through trees, walked at down an avenue, or found
// behind a hedge with a gate in it. `BUILDINGPLAN.md` opens on this — "screens
// before scatter" — and it is why stage 1 deliberately left the world sparser
// than it found it: four times the distance between precincts is emptiness
// until something stands in the way of seeing across it.
//
// This module builds three of them, all greenfield — the world had none of
// these until today:
//
//   the cypress avenue    ch. VIII. Four stadia, 740 m: the longest stated
//                         distance in Book I and the only explicit measurement
//                         between two places anywhere in it. You cannot see the
//                         palace from the south end, and that is the feature.
//   the green enclosure   ch. VIII. Sixty paces square, hedged on three sides,
//                         "of which the palace is the fourth" — a garden that
//                         is a ROOM, with windows cut in its walls.
//   the wooded country    ch. VI. A district "circunclusa dall'arborifera
//                         montagna", ringed by a tree-bearing mountain: the
//                         screen is the horizon itself.
//
// Sizes are the book's where the book gives them; each is cited at its use.

import * as THREE from 'three';
import { PLAN_SITES } from './constants.js?v=14';

export const Screens = {

  // -- The citrus fence, as architecture ------------------------------------
  //
  // "a hedge of Citrons, Orenges and Limons ... sixe foote thicke"
  // (Dall. p. 124). The same fence closes the cypress avenue and walls the
  // green enclosure on three sides, because it IS the same fence — the
  // avenue's closing hedge and the enclosure's south side are one line of
  // planting seen from either side of it. It was briefly built twice, which
  // put two hedges in the same 1.78 m and made the gate look glazed.
  //
  // What makes it architecture rather than planting is the WINDOWS. A run is
  // divided into bays; each bay is a solid pier and an opening, and the
  // opening has a sill you cannot walk over and a head above it, so what you
  // get is a band of framed view at standing height with green above and
  // below. That is how this book makes a garden feel like a room, and it is
  // `BUILDINGPLAN.md`'s "hedges as architecture".
  //
  //   cx, cz   the run's centre, in the precinct's frame
  //   len      its length
  //   axis     'x' if it runs east-west, 'z' if north-south
  //   gate     width of an opening left at its middle, or 0 for none
  //
  // The collider is the WHOLE run, gate apart: you may look through a hedge
  // and not walk through it.
  _citrusRun(cx, cz, len, axis, { gate = 0, bays = 8, thick = 1.78, high = 4.2 } = {}) {
    const alongX = axis === 'x';
    const BAY = len / bays;
    const WIN = Math.min(4.4, BAY * 0.44), SILL = 1.1, HEAD = 2.9;
    const rnd = (i, k) => { const v = Math.sin(i * 53.9 + k * 311.1 + 7.7) * 43758.5453; return v - Math.floor(v); };
    const at = (u) => (alongX ? [cx + u, cz] : [cx, cz + u]);
    const box = (u, w, y, h) => {
      const [x, z] = at(u);
      this._hedge(x, y, z, alongX ? w : thick, h, alongX ? thick : w);
    };
    for (let b = 0; b < bays; b++) {
      const t = -len / 2 + (b + 0.5) * BAY;
      // a bay that the gate falls in is skipped entirely
      if (gate && Math.abs(t) < gate / 2 + BAY / 2) continue;
      const pw = BAY - WIN;
      box(t - BAY / 2 + pw / 2, pw, high / 2, high);          // the pier
      box(t + pw / 2, WIN, SILL / 2, SILL);                   // the sill under the window
      box(t + pw / 2, WIN, (HEAD + high) / 2, high - HEAD);   // the head over it
      // the fruit the hedge is cut out of, standing proud of its top
      for (let i = 0; i < 3; i++) {
        const [fx, fz] = at(t - BAY / 2 + (i + 0.5) * (BAY / 3));
        this._tree(fx, fz, 1.05 + rnd(b * 3 + i, 2) * 0.2,
                   ['citron', 'orange', 'lemon'][(b + i) % 3]);
      }
    }
    if (gate) {
      // the run either side of the gate, and the stone jambs that make the
      // opening read as made rather than as a gap in the planting
      for (const sg of [-1, 1]) {
        const w = len / 2 - gate / 2;
        const [x, z] = at(sg * (gate / 2 + w / 2));
        if (alongX) this._wallCol(x - w / 2, x + w / 2, z - thick / 2, z + thick / 2);
        else this._wallCol(x - thick / 2, x + thick / 2, z - w / 2, z + w / 2);
        const [jx, jz] = at(sg * gate / 2);
        this._m(new THREE.BoxGeometry(alongX ? 0.5 : thick + 0.3, high + 0.4, alongX ? thick + 0.3 : 0.5),
          this._stoneMat, jx, (high + 0.4) / 2, jz, { outline: true });
      }
    } else if (alongX) {
      this._wallCol(cx - len / 2, cx + len / 2, cz - thick / 2, cz + thick / 2);
    } else {
      this._wallCol(cx - thick / 2, cx + thick / 2, cz - len / 2, cz + len / 2);
    }
  },

  // ── The cypress avenue (ch. VIII) ────────────────────────────────────────
  //
  // Dallington pp. 123–124. Four stadia of it — 740 m — floored with periwinkle
  // the whole way and closed at the far end by a hedge of citron, orange and
  // lemon "six foote thicke" (1.78 m) with a single gate in the middle of it.
  //
  // The avenue is built in its own precinct's frame, so z runs from +370 (the
  // south end, where you enter) to -370 (the hedge). Its width is the plan's
  // 40 m: wide enough to walk four abreast and narrow enough that the cypress
  // close over the view. That is the whole design — a corridor 740 m long whose
  // only exit is a gate you cannot see until you are nearly at it.
  _buildCypressAvenue() {
    const S = this.style, woodcut = S.key === 'woodcut';
    const P = PLAN_SITES.cypress_avenue;
    const HALF = P.width / 2;             // 20 m
    const LEN = P.depth;                  // 740 m, four stadia
    const Z0 = LEN / 2, Z1 = -LEN / 2;
    const rnd = (i, k) => { const v = Math.sin(i * 71.3 + k * 197.1 + 11.3) * 43758.5453; return v - Math.floor(v); };

    // ── the floor: "the ground all couered ouer with Peruincle" ────────────
    // Periwinkle is a low evergreen mat with a blue flower, so the floor is a
    // dark green strip with a blue cast, not sward. One plane, and the flowers
    // are tufts scattered on it — the meadow shader does not reach out here.
    const periMat = woodcut ? S.mat({ tone: 0.08, rim: 0 })
      : S.mat({ color: 0x24401f, roughness: 0.98 });
    if (!woodcut) {
      this._dress(periMat, this._surfaceTexture({
        base: '#28451f', dark: '#14280f', light: '#4a6a34', blobs: 120, speckle: 9000, repeat: 26,
      }), 0.12);
      periMat.roughnessMap = null; periMat.roughness = 1.0;
    }
    // 0.12, not 0.02: the world's processional axis is one plane 13.7 km long
    // laid by `_buildGround`, and it runs under this one. Three centimetres of
    // separation is below the depth buffer's resolution half a kilometre out
    // and the two planes fight in bands. Twelve centimetres is invisible under
    // foot and decisive in the depth test.
    this._m(new THREE.PlaneGeometry(HALF * 2, LEN), periMat, 0, 0.12, 0,
      { rx: -Math.PI / 2, cast: false });
    // the walked line down the middle of it, worn to earth
    const pathMat = woodcut ? S.mat({ tone: 0.03, rim: 0 })
      : S.mat({ color: 0x6a5a40, roughness: 0.95 });
    // polygon offset for the same reason the world's own paths have it: a
    // centimetre of separation does not survive 13.7 km of depth buffer.
    pathMat.polygonOffset = true;
    pathMat.polygonOffsetFactor = -4;
    pathMat.polygonOffsetUnits = -4;
    this._m(new THREE.PlaneGeometry(3.6, LEN), pathMat, 0, 0.15, 0,
      { rx: -Math.PI / 2, cast: false });
    // "azure flowers": the periwinkle in bloom, thickest at the edges where the
    // walk has not worn it
    for (let i = 0; i < 420; i++) {
      const x = (rnd(i, 1) * 2 - 1) * HALF;
      if (Math.abs(x) < 2.4) continue;
      this._tuft(x, 0.03, Z1 + rnd(i, 2) * LEN, 'mint', 0.3 + rnd(i, 3) * 0.2);
    }

    // ── the cypresses ─────────────────────────────────────────────────────
    //
    // Planted every 11 m, which over 740 m is 68 pairs — close enough that the
    // two rows read as walls from inside and the far end is a dark slot. The
    // scale jitter is small on purpose: this is a planted avenue, not a wood,
    // and its regularity is what says somebody made it.
    const STEP = 11;
    for (let z = Z1 + 6; z <= Z0 - 6; z += STEP) {
      for (const sx of [-1, 1]) {
        const i = Math.round(z) * 2 + (sx > 0 ? 1 : 0);
        // `leaves` and `cone`: see _tree. At avenue scale a cypress drawn with
        // its species' own card count is a halo of specks round a bare pole.
        this._tree(sx * (HALF - 3.2) + (rnd(i, 4) - 0.5) * 0.8, z + (rnd(i, 5) - 0.5) * 0.9,
          4.6 + rnd(i, 6) * 0.9, 'cypress', { leaves: 2.6, cone: true });
      }
      // and they are a WALL: you may not step out of the avenue between them
      this._wallCol(HALF - 4.6, HALF + 40, z - STEP / 2, z + STEP / 2);
      this._wallCol(-(HALF + 40), -(HALF - 4.6), z - STEP / 2, z + STEP / 2);
    }

    // -- the citrus hedge that closes it, and the one gate -----------------
    //
    // This is the SAME hedge as the green enclosure's south side; it is built
    // once, here, because from the avenue it is a wall with a hole in it and
    // that is the moment the book describes. You walk four stadia between two
    // rows of cypress, and at the end there is a green wall, and through the
    // hole in it is the palace.
    this._citrusRun(0, Z1, HALF * 2, 'x', { gate: 5.2, bays: 8 });

    this._plaque({ main: 'FOVRE FVRLONGS OF CYPRESSE',
                   sub: 'THE GROVND ALL COVERED OVER WITH PERVINCLE · A HEDGE OF CITRONS, ORENGES AND LIMONS SIXE FOOTE THICKE · DALLINGTON PP. 123–124' },
      7.2, 0.9, 0, 3.1, Z0 - 3, Math.PI, true);
  },

  // ── The green enclosure (ch. VIII) ───────────────────────────────────────
  //
  // "a fowre square greene enclosure of threescore paces" — 88.8 m on a side —
  // hedged on three sides with the citrus fence, "of which the palace is the
  // fourth" (Dall. p. 124). It is the forecourt of Queen Eleuterylida's palace
  // and it is the reason SPREAD = 4 was chosen as a factor: four was the first
  // whole number at which this room fitted where the book puts it.
  //
  // The windows are the point. A hedge with openings cut in it is not planting,
  // it is ARCHITECTURE — it has a wall, a thickness, a rhythm of bays and a
  // view framed in each one. That is how the book makes a garden feel like a
  // room, and it is what BUILDINGPLAN calls "hedges as architecture".
  _buildGreenEnclosure() {
    const S = this.style;
    const P = PLAN_SITES.enclosure;
    const SIDE = P.width;                 // 88.8 m, threescore paces
    const H = SIDE / 2;
    // The south side is the hedge the avenue's gate opens through, so it is the
    // avenue's own closing hedge and is not built twice. The palace closes the
    // north. What is built here is EAST and WEST.

    // ── the floor ─────────────────────────────────────────────────────────
    const swardMat = S.key === 'woodcut' ? S.mat({ tone: 0.09, rim: 0 })
      : S.mat({ color: 0x2c4419, roughness: 0.98 });
    // 0.12 for the same reason the avenue's floor is: the world's processional
    // axis passes under this room.
    this._m(new THREE.PlaneGeometry(SIDE, SIDE), swardMat, 0, 0.12, 0,
      { rx: -Math.PI / 2, cast: false });

    // -- the sides, with windows cut in them -------------------------------
    //
    // East and west only. The palace closes the NORTH — "of which the palace
    // is the fourth" — and the SOUTH is the hedge the cypress avenue runs at,
    // built once by `_buildCypressAvenue` with the gate in it. Building it
    // here as well put two hedges in the same 1.78 m.
    this._citrusRun(-H, 0, SIDE, 'z', { bays: 8 });
    this._citrusRun(H, 0, SIDE, 'z', { bays: 8 });

    // ── what stands in the room ───────────────────────────────────────────
    // The book's forecourt is not empty: it is the ground the Queen's people
    // cross to meet him. Four cypresses at the corners give the square its
    // vertical accents and keep the eye from reading it as a lawn.
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      this._tree(sx * (H - 7), sz * (H - 7), 3.4, 'cypress', { leaves: 2.0, cone: true });
    }

    // Off the axis: on the inner face of the east hedge, where it is read
    // standing in the room rather than seen through the gate from the avenue.
    this._plaque({ main: 'A GREENE ENCLOSVRE OF THREESCORE PACES',
                   sub: 'HEDGED VPON THREE SIDES, OF WHICH THE PALACE IS THE FOVRTH · WINDOWES CVT IN THE QVICKSET · DALLINGTON P. 124' },
      7.2, 0.9, H - 1.4, 3.1, 0, -Math.PI / 2, true);

  },

  // ── The wooded country, and its ring of mountain (ch. VI) ────────────────
  //
  // 1499 ll. 2800–2813: "silvosa contrata circunclusa dall'arborifera montagna"
  // — a wooded district SHUT IN by a tree-bearing mountain. The screen here is
  // not a hedge, it is the horizon: a ring of wooded hill five stadia across
  // that closes every sightline out of the precinct, so that coming out of the
  // pyramid's vaults you are in a bowl and cannot see what comes next.
  //
  // This is where the fruitful fields and the dividing spring already stand
  // (they move here with stage 2; see HPWorldScene). What was missing was the
  // ring, and without it the "district" was a patch of ground in a plain.
  _buildWoodedCountry() {
    const S = this.style, woodcut = S.key === 'woodcut';
    const P = PLAN_SITES.wooded_country;
    // This precinct is NOT greenfield in the group sense: the fruitful fields
    // and the dividing spring already stood beside the `fields` station and
    // ride here on that station's shift, so the group's origin is where the old
    // world's origin landed, not the precinct's centre. `_precinctLocal` is the
    // difference, and getting it wrong put the ring 256 m north of itself and
    // standing in the cypress avenue.
    const [CX, CZ] = this._precinctLocal('wooded_country');
    // The precinct is 925 across and 740 deep, so the ring is an ELLIPSE. Drawn
    // as a circle of the wider semi-axis it overshot into the avenue beyond; a
    // "silvosa contrata circunclusa" is shut in by the mountain it is shut in
    // by, and the plan is what says how big that is.
    const RX = P.width / 2;               // 462.5
    const RZ = P.depth / 2;               // 370
    const rockMat = woodcut ? S.mat({ tone: 0.16 })
      : S.mat({ color: 0x5e5a50, roughness: 1.0 });
    if (!woodcut) {
      this._dress(rockMat, this._surfaceTexture({
        base: '#6a6458', dark: '#2e2a22', light: '#948b7c', blobs: 70, speckle: 3000, repeat: 6,
      }), 0.5);
      rockMat.roughnessMap = null; rockMat.roughness = 1.0;
    }
    const rnd = (i, k) => { const v = Math.sin(i * 113.7 + k * 229.1 + 3.1) * 43758.5453; return v - Math.floor(v); };

    // -- the ring ----------------------------------------------------------
    //
    // 72 masses round the ellipse, each a squashed dodecahedron jittered in
    // radius and height so the skyline breaks. 90-160 m is a HILL, not a cliff:
    // the valley of the approach has walls because the book says that valley is
    // shut, and this is a "montagna" that RINGS a district rather than one that
    // closes a road. It should read as a horizon you could walk over in a day,
    // and as enough to stop you seeing the cypress avenue until you are in it.
    const N = 72;
    // The way out is southward, back toward the pyramid, and the way on is
    // northward into the avenue. Leave a mouth at each.
    const mouths = [Math.PI / 2, -Math.PI / 2];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const gap = mouths.some(m => Math.abs(((a - m + Math.PI) % (Math.PI * 2)) - Math.PI) < 0.13);
      if (gap) continue;
      const k = 1 + rnd(i, 1) * 0.12;
      const x = CX + Math.cos(a) * RX * k;
      const z = CZ + Math.sin(a) * RZ * k;
      const h = 90 + rnd(i, 2) * 70;
      const blk = this._m(this._indexed(new THREE.DodecahedronGeometry(1, 0)), rockMat,
        x, h * 0.42, z, { cast: true });
      blk.scale.set(52 + rnd(i, 3) * 34, h, 40 + rnd(i, 4) * 26);
      blk.rotation.y = rnd(i, 5) * 1.4;
      // and the trees that make it "arborifera": the mountain BEARS trees, and
      // without them it is a quarry.
      for (let t = 0; t < 4; t++) {
        const j = i * 4 + t;
        const ta = a + (rnd(j, 6) - 0.5) * 0.085;
        const kk = 0.88 + rnd(j, 7) * 0.1;
        this._tree(CX + Math.cos(ta) * RX * kk, CZ + Math.sin(ta) * RZ * kk,
          2.2 + rnd(j, 8) * 1.8, rnd(j, 9) > 0.5 ? 'fir' : 'pine');
      }
    }
    // The ring is a wall, with the two mouths left open. Four rectangles, set
    // just inside the ellipse's extremes so a walker meets rock and not air.
    const GX = RX - 30, GZ = RZ - 30;
    this._wallCol(CX - GX, CX + GX, CZ - GZ - 500, CZ - GZ);     // north, but for the mouth
    this._wallCol(CX - GX - 500, CX - GX, CZ - GZ, CZ + GZ);     // west
    this._wallCol(CX + GX, CX + GX + 500, CZ - GZ, CZ + GZ);     // east
    for (const sx of [-1, 1]) {                                   // south, but for the mouth
      this._wallCol(CX + sx * 70, CX + sx * (GX + 500), CZ + GZ, CZ + GZ + 500);
      this._wallCol(CX + sx * 70, CX + sx * (GX + 500), CZ - GZ - 500, CZ - GZ);
    }

    this._plaque({ main: 'A WOODED COVNTRIE SHVT IN BY THE TREE-BEARING MOVNTAINE',
                   sub: 'SILVOSA CONTRATA CIRCVNCLVSA DALL\u2019ARBORIFERA MONTAGNA \u00b7 1499 LL. 2800\u20132813' },
      9.0, 1.1, CX, 3.4, CZ + 96, 0, true);
  },
};
