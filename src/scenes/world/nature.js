// nature.js — what grows and what lives: trees, herbs, hedges, birds, shade, smoke and the meadow
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
import { ParticleStream } from '../../systems/Particles.js?v=3';
import { isVariant } from '../../systems/AssetVariants.js?v=12';
import { attachShade, createMeadowField } from '../../systems/Meadow.js?v=5';
import { TRIUMPHS, HERBS, SPECIES } from './constants.js?v=6';

export const Nature = {
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
  },

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
    // No bird south of z = 200 — the wood and the plain beyond it. On the plain
    // this is the book's own line and the most faithful thing on that ground:
    // "Heere appeareth no humaine creature to my sight, nor sylvan beast,
    // FLYING BIRD…" and the grass "rested vnstirred, WITHOUT THE BEHOLDING OF
    // ANY MOTION" (Dall. p. 14). In the wood he hears falling timber and no
    // song. None of today's perches or rings is down there, so this guard
    // changes nothing now; it is here so that adding one later cannot silently
    // undo _buildSpaciousPlain's whole subject. See that method's note 2.
    const NO_BIRDS_SOUTH_OF = 200;
    for (let i = 0; i < PERCH.length; i++) {
      const [x, z, y] = PERCH[i];
      if (z > NO_BIRDS_SOUTH_OF) continue;
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
      if (cz - rad > NO_BIRDS_SOUTH_OF) continue;   // nothing wheels over the plain
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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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

    return g;          // so a caller can reparent it (Polia's arcade folds)
  },

  // A hedge, built and dressed in one call, so a new one is never a bare box
  // again. Returns the box mesh.
  _hedge(x, y, z, w, h, d, o = {}) {
    const m = this._m(new THREE.BoxGeometry(w, h, d), this._hedgeMat, x, y, z, o);
    this._hedgeFringe(x, y, z, w, h, d, o.ry || 0, o.fringe || {});
    return m;
  },

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
  },

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
  },

  _herbTexture(kind) {
    this._herbTex = this._herbTex || {};
    const ink = this.style.key === 'woodcut', key = kind + (ink ? '#ink' : '');
    if (this._herbTex[key]) return this._herbTex[key];
    const H = HERBS[kind] || HERBS.rush;
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
  },

  // A bed of one herb, tiled round a terrace ring
  _herbBedTexture(kind) {
    this._herbBeds = this._herbBeds || {};
    if (this._herbBeds[kind]) return this._herbBeds[kind];
    const H = HERBS[kind] || HERBS.thyme;
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
  },

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
  },

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
  },

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
  },

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
  },

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
    const SP = SPECIES[species] || SPECIES.laurel;
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
  },

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
  },

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
    const SPc = SPECIES[species];
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
  },

  // ── The spring that divides right and left (ch. VI) ──────────────────────
  //
  // 1499 ll. 2793-2800: a broad vein of clear living water wells up and,
  // dividing, makes two little running streams, one to the right hand and the
  // other to the left; the banks are stone and shade, the straddling roots laid
  // bare, and hung with maidenhair and cymbalaria. Dallington pp. 90-92 for the
  // same ground, and for the umbriphilous herbs already built in the shaded
  // walk next door.
  //
  // WHICH IS THE RIGHT HAND. The book is directional and this project has been
  // caught by that before -- the wolf stood on the wrong side of the valley for
  // months because DIRECTIONS.md took Dallington's "left hand" over the 1499's
  // "alla parte dextra". So, derived rather than assumed: Poliphilo comes up
  // from the fields station at (-40, 41) and faces NORTH, along +z. In a
  // right-handed, Y-up frame the right hand is forward x up, and (0,0,1) x
  // (0,1,0) = (-1,0,0). Facing north, his right is -x. The DEXTER stream is
  // therefore the western one, and it is named so in the roll-up.
  _buildDividingSpring() {
    const SX = -40, SZ = 56;              // in view from the fields station
    const S = this.style;
    const woodcut = S.key === 'woodcut';
    const rnd = (i, k) => { const v = Math.sin(i * 91.7 + k * 233.3) * 43758.5453; return v - Math.floor(v); };
    const stone = woodcut ? S.mat({ tone: 0.16 }) : S.mat({ color: 0x8a8274, roughness: 0.95 });
    const wet   = woodcut ? S.mat({ tone: 0.3 })  : S.mat({ color: 0x5c5a4a, roughness: 0.99 });

    // the head: a low outcrop the water comes out of, and the basin it fills
    for (let i = 0; i < 9; i++) {
      const a = -0.9 + rnd(i, 1) * 3.4;
      const r = 1.5 + rnd(i, 2) * 0.7;
      const g = new THREE.DodecahedronGeometry(0.45 + rnd(i, 3) * 0.5, 0);
      g.setIndex(Array.from({ length: g.attributes.position.count }, (_, k) => k));
      const b = this._m(g, i % 2 ? stone : wet, SX + Math.sin(a) * r, 0.22 + rnd(i, 4) * 0.3, SZ + 0.9 + Math.cos(a) * r * 0.6, { outline: true });
      b.rotation.set(rnd(i, 5) * 3, rnd(i, 6) * 3, rnd(i, 7) * 3);
      b.scale.set(1, 0.6 + rnd(i, 8) * 0.4, 1);
    }
    const water = this._waterMat();
    this._waters.push({ m: this._m(new THREE.CircleGeometry(1.15, 14), water, SX, 0.09, SZ, { rx: -Math.PI / 2, cast: false }), rate: 0.10 });
    this._caustics(SX, 0.09, SZ, 1.1, 0.07);

    // the two streams. The geometry is rotated rather than the mesh, so the
    // yaw is baked and nothing has to fight Euler order to lie flat.
    const LEN = 15, WIDE = 1.7;
    for (const side of [-1, 1]) {
      const yaw = side * 0.62;                       // -x is dexter; see above
      const g = new THREE.PlaneGeometry(WIDE, LEN);
      g.rotateX(-Math.PI / 2); g.rotateY(yaw);
      const cx = SX + Math.sin(yaw) * (LEN / 2) * -1;
      const cz = SZ - Math.cos(yaw) * (LEN / 2);
      const m = this._m(g, water, cx, 0.07, cz, { cast: false });
      m.material.userData = m.material.userData || {};
      this._waters.push({ m, rate: 0.07 });
      // stone kerbs either bank, and the wet margin between kerb and water
      for (const b of [-1, 1]) {
        const kg = new THREE.BoxGeometry(0.34, 0.26, LEN);
        kg.rotateY(yaw);
        const ox = Math.cos(yaw) * b * (WIDE / 2 + 0.2);
        const oz = Math.sin(yaw) * b * (WIDE / 2 + 0.2);
        this._m(kg, stone, cx + ox, 0.13, cz + oz, { outline: true });
      }
      // maidenhair and cymbalaria along the banks, as the text hangs them
      for (let i = 0; i < 11; i++) {
        const t = (i + 0.5) / 11;
        const along = (t - 0.5) * LEN;
        const b = i % 2 ? 1 : -1;
        const hx = cx + Math.sin(yaw) * -along + Math.cos(yaw) * b * (WIDE / 2 + 0.45);
        const hz = cz + Math.cos(yaw) *  along + Math.sin(yaw) * b * (WIDE / 2 + 0.45);
        const kind = i % 3 === 0 ? 'cymbalaria' : 'maidenhair';
        const hh = kind === 'cymbalaria' ? 0.3 : 0.42;
        const card = this._m(new THREE.PlaneGeometry(0.5, hh), this._herbMat(kind), hx, hh / 2, hz, { cast: false });
        card.rotation.y = rnd(i, 9 + side) * 3.1;
      }
    }

    // "the straddling roots laid bare": an alder over the head of the spring,
    // with its roots arched clear of the scour the water has cut under them
    this._tree(SX - 2.2, SZ + 2.6, 1.15, 'laurel');
    for (let i = 0; i < 5; i++) {
      const a = 0.5 + i * 0.5;
      const rt = this._m(new THREE.TorusGeometry(0.55 + rnd(i, 12) * 0.3, 0.075, 5, 9, Math.PI), this._trunkMat,
        SX - 2.2 + Math.cos(a) * 0.9, 0.04, SZ + 2.6 + Math.sin(a) * 0.9, { cast: false });
      rt.rotation.set(0, a + 1.2, 0);
      rt.scale.set(1, 0.55, 1);
    }
  },

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
    const ALL = Object.keys(SPECIES);
    const GARDEN = ['laurel', 'myrtle', 'orange', 'cypress', 'olive'];
    species = species || GARDEN[Math.floor(this._treeRand(seed, 7) * GARDEN.length) % GARDEN.length];
    if (!SPECIES[species]) species = ALL.includes(species) ? species : 'laurel';
    const SP = SPECIES[species];
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
  },

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
  },

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
      // The three doors are cut in a rocky place "without any greene grasse or
      // hearbe" (Dall. p. 192), and the seat is the point of the choice made
      // there. This was a 2.8 m strip at the foot of the rock, so grass grew
      // over the whole approach the reader actually walks.
      rect(-15.5, 15.5, 5.5, 19.5),      // Three Doors: the whole stony seat
      // the dividing spring and its two channels: water, stone kerb and wet
      // margin, so no meadow
      rect(-49, -31, 47, 58),
      rect(-19, 19, 24.2, 27.8),         // Great Portal piers
      rect(-120, 120, 210, 435),         // dark-wood duff (moved with the wood)
      // Ploughed ground is ploughed: meadow grass must not grow out of the
      // furrows of the strip fields, nor under the orchard and the arbustum.
      rect(-61, -19, 41.5, 62),          // second nature -- the worked belt
      rect(-70, 70, -70, -33),           // sand strip and sea
      circle(30, -27, 9.3),              // the polyandrion's ruin floor
    );
    for (const t of TRIUMPHS) d = Math.min(d, circle(t.pos[0], t.pos[1], 2.4));
    return d;
  },

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
  },

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
  },

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
  },

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
  },
};
