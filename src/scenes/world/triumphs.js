// triumphs.js — the five triumphs: the cars, the teams, the liveries, the riders
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
import { TRIUMPH_LIVERY, TRIUMPH_RELIEFS, TRIUMPHS } from './constants.js?v=6';

export const Triumphs = {
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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

  // A carved relief panel: stone ground, a bead border, the scene's figures in
  // low relief, and — where the book gives one — the word cut into it.
  //
  // Relief is drawn, not lit: each shape is painted once dark and offset down,
  // then once light and offset up, which is how a chiselled edge catches the
  // sun. The figures are silhouettes, because that is what low relief is.
  // ── Named relief scenes ─────────────────────────────────────────────────
  //
  // Returns true if it drew, so _reliefTexture knows to skip its seeded crowd.
  //
  // THE FORGE (Dallington pp. 58-60), cut on the right-hand stylobate of the
  // porch. The chapter describes it figure by figure: a middle-aged smith of
  // churlish countenance with an unshapely beard, in a goatskin apron knotted
  // behind and hanging between his legs, seated on a stone at an anvil fixed on
  // a knotty stump, his hammer raised over a brigandine of burning metal;
  // before him a winged goddess holding her naked infant on her thighs, her
  // foot set on a stone beside a furnace sunk in a hollow with a fierce fire in
  // it; beside them a knight in brass armour with the head of Medusa on the
  // breastplate, a baldric across his chest, a half-pike raised and a
  // high-crested helmet; and behind the smith a young man in silk, seen only
  // from the breast up over the smith's bowed head.
  //
  // Vulcan, Venus, Cupid and Mars: the quarrel the whole book is about, cut on
  // the gate you go in by. It is the most fully described picture in chapters
  // III-IV and it was standing in for a seeded crowd until now.
  _reliefScene(x, W, H, carve, scene) {
    const GY = H - 30;                       // the ground the figures stand on

    // ── The triumph of satyrs and nymphs, with trophies ───────────────────
    // Dallington p. 158: on the middle panel of each long side of the wheeled
    // fountain, between the falls of the water, a triumph of satyrs and nymphs
    // carved in half bodies, with trophies. Built 2026-09-09 on the fountain of
    // plate #32, where it had been standing in as a seeded crowd since the
    // fountain shipped an hour before.
    if (/triumph of satyrs and nymphs/i.test(scene)) {
      carve(() => {
        x.lineCap = 'round'; x.lineJoin = 'round';

        // a trophy: arms hung on a pole, a helmet on the top of it
        const trophy = (tx) => {
          x.lineWidth = 6;
          x.beginPath(); x.moveTo(tx, GY + 2); x.lineTo(tx, GY - 92); x.stroke();
          x.beginPath();                                   // the helmet, crested
          x.arc(tx, GY - 100, 11, Math.PI, 0); x.fill();
          x.beginPath();
          x.moveTo(tx - 9, GY - 104);
          x.quadraticCurveTo(tx, GY - 126, tx + 11, GY - 106);
          x.quadraticCurveTo(tx + 2, GY - 106, tx, GY - 102);
          x.closePath(); x.fill();
          x.beginPath();                                   // the cuirass hung on it
          x.moveTo(tx - 15, GY - 84);
          x.quadraticCurveTo(tx - 18, GY - 58, tx - 12, GY - 44);
          x.lineTo(tx + 12, GY - 44);
          x.quadraticCurveTo(tx + 18, GY - 58, tx + 15, GY - 84);
          x.closePath(); x.fill();
          x.lineWidth = 5;                                 // a spear across, and a round shield
          x.beginPath(); x.moveTo(tx - 22, GY - 30); x.lineTo(tx + 22, GY - 40); x.stroke();
          x.beginPath(); x.arc(tx - 20, GY - 20, 11, 0, 7); x.fill();
        };

        // a satyr: horned, shaggy from the waist down, piping
        const satyr = (sx, piping) => {
          x.beginPath(); x.arc(sx, GY - 74, 10, 0, 7); x.fill();
          x.lineWidth = 4;                                  // the horns
          x.beginPath(); x.moveTo(sx - 6, GY - 82); x.lineTo(sx - 12, GY - 94); x.stroke();
          x.beginPath(); x.moveTo(sx + 6, GY - 82); x.lineTo(sx + 12, GY - 94); x.stroke();
          x.beginPath();                                    // the torso
          x.moveTo(sx - 11, GY - 34);
          x.quadraticCurveTo(sx - 14, GY - 54, sx - 7, GY - 64);
          x.lineTo(sx + 7, GY - 64);
          x.quadraticCurveTo(sx + 14, GY - 54, sx + 11, GY - 34);
          x.closePath(); x.fill();
          x.beginPath();                                    // the shaggy haunches
          x.moveTo(sx - 12, GY - 34);
          x.quadraticCurveTo(sx - 15, GY - 12, sx - 8, GY + 2);
          x.lineTo(sx + 8, GY + 2);
          x.quadraticCurveTo(sx + 15, GY - 12, sx + 12, GY - 34);
          x.closePath(); x.fill();
          x.lineWidth = 6;
          if (piping) {                                     // the double pipe at his mouth
            x.beginPath(); x.moveTo(sx + 8, GY - 58); x.lineTo(sx + 4, GY - 72); x.stroke();
            x.lineWidth = 4;
            x.beginPath(); x.moveTo(sx + 2, GY - 76); x.lineTo(sx + 20, GY - 84); x.stroke();
            x.beginPath(); x.moveTo(sx + 2, GY - 72); x.lineTo(sx + 20, GY - 76); x.stroke();
          } else {                                          // or a branch held up
            x.beginPath(); x.moveTo(sx + 9, GY - 56); x.lineTo(sx + 24, GY - 88); x.stroke();
            x.beginPath(); x.arc(sx + 26, GY - 94, 7, 0, 7); x.fill();
          }
        };

        // a nymph, in motion, one arm thrown to her neighbour
        const nymph = (nx, reachRight) => {
          x.beginPath(); x.arc(nx, GY - 78, 9.5, 0, 7); x.fill();
          x.beginPath();                                    // hair, blown back
          x.moveTo(nx - 9, GY - 84); x.quadraticCurveTo(nx - 22, GY - 92, nx - 14, GY - 70);
          x.closePath(); x.fill();
          x.beginPath();                                    // the gown, striding
          x.moveTo(nx - 12, GY + 2);
          x.quadraticCurveTo(nx - 13, GY - 44, nx - 7, GY - 68);
          x.lineTo(nx + 7, GY - 68);
          x.quadraticCurveTo(nx + 16, GY - 40, nx + 14, GY + 2);
          x.closePath(); x.fill();
          x.lineWidth = 6;
          const d = reachRight ? 1 : -1;
          x.beginPath();
          x.moveTo(nx + d * 8, GY - 60);
          x.lineTo(nx + d * 30, GY - 76);
          x.stroke();
        };

        trophy(66);
        satyr(132, true);
        nymph(196, true);
        nymph(254, false);
        satyr(318, false);
        trophy(404);
      });
      return true;
    }

    // ── Genii, dolphins and a bull's skull (plate #24) ────────────────────
    // The frieze ornament of 1499 p. 84, attached to chapter VIII. A bucranium
    // swagged between two dolphins with a winged genius at either end: the
    // commonest grammar of quattrocento ornament, and the world had no
    // bucranium anywhere until now.
    if (/genii, dolphins and a bull/i.test(scene)) {
      carve(() => {
        x.lineCap = 'round'; x.lineJoin = 'round';

        // a winged genius at either end
        const genius = (gx, face) => {
          x.beginPath(); x.arc(gx, GY - 84, 9, 0, 7); x.fill();
          x.beginPath();                                     // the little body
          x.moveTo(gx - 9, GY - 30);
          x.quadraticCurveTo(gx - 11, GY - 58, gx - 5, GY - 74);
          x.lineTo(gx + 5, GY - 74);
          x.quadraticCurveTo(gx + 11, GY - 58, gx + 9, GY - 30);
          x.closePath(); x.fill();
          x.beginPath();                                     // the wing behind
          x.moveTo(gx - face * 6, GY - 70);
          x.quadraticCurveTo(gx - face * 30, GY - 98, gx - face * 12, GY - 44);
          x.closePath(); x.fill();
          x.lineWidth = 5;                                   // an arm to the swag
          x.beginPath();
          x.moveTo(gx + face * 7, GY - 62);
          x.lineTo(gx + face * 26, GY - 52);
          x.stroke();
        };

        // a dolphin, head down, tail curled up
        const dolphin = (dx, face) => {
          x.beginPath();
          x.moveTo(dx - face * 26, GY - 26);
          x.quadraticCurveTo(dx, GY - 74, dx + face * 22, GY - 40);
          x.quadraticCurveTo(dx + face * 6, GY - 40, dx - face * 26, GY - 26);
          x.closePath(); x.fill();
          x.beginPath();                                     // the fluked tail
          x.moveTo(dx + face * 20, GY - 42);
          x.lineTo(dx + face * 38, GY - 64);
          x.lineTo(dx + face * 34, GY - 38);
          x.closePath(); x.fill();
          x.beginPath();                                     // the eye
          x.arc(dx - face * 17, GY - 34, 2.6, 0, 7); x.fill();
        };

        // the bucranium: the skull, its horns, and the swags hung from them
        const bx = W / 2;
        x.beginPath();
        x.moveTo(bx - 15, GY - 74);
        x.quadraticCurveTo(bx - 19, GY - 46, bx, GY - 30);
        x.quadraticCurveTo(bx + 19, GY - 46, bx + 15, GY - 74);
        x.closePath(); x.fill();
        x.lineWidth = 7;                                     // the horns
        x.beginPath();
        x.moveTo(bx - 13, GY - 72);
        x.quadraticCurveTo(bx - 34, GY - 86, bx - 30, GY - 62);
        x.stroke();
        x.beginPath();
        x.moveTo(bx + 13, GY - 72);
        x.quadraticCurveTo(bx + 34, GY - 86, bx + 30, GY - 62);
        x.stroke();
        for (const e of [-1, 1]) {                           // the eye sockets
          x.beginPath(); x.arc(bx + e * 7, GY - 62, 3.4, 0, 7); x.fill();
        }
        x.lineWidth = 6;                                     // the swags, sagging away
        for (const e of [-1, 1]) {
          x.beginPath();
          x.moveTo(bx + e * 30, GY - 64);
          x.quadraticCurveTo(bx + e * 66, GY - 34, bx + e * 96, GY - 54);
          x.stroke();
        }

        genius(62, 1);
        dolphin(168, 1);
        dolphin(344, -1);
        genius(450, -1);
      });
      return true;
    }

    if (!/forge of Vulcan/i.test(scene)) return false;

    carve(() => {
      x.lineCap = 'round'; x.lineJoin = 'round';

      // the young man in silk, behind, only from the breast up
      x.beginPath(); x.arc(104, GY - 94, 8.5, 0, 7); x.fill();
      x.beginPath();
      x.moveTo(90, GY - 74); x.quadraticCurveTo(104, GY - 90, 118, GY - 74);
      x.lineTo(118, GY - 64); x.lineTo(90, GY - 64); x.closePath(); x.fill();

      // the smith: head, the beard turning into his chin, the bowed torso
      x.beginPath(); x.arc(140, GY - 72, 11, 0, 7); x.fill();
      x.beginPath();
      x.moveTo(131, GY - 66); x.quadraticCurveTo(140, GY - 48, 149, GY - 66);
      x.closePath(); x.fill();
      x.beginPath();
      x.moveTo(126, GY - 18);
      x.quadraticCurveTo(121, GY - 48, 135, GY - 60);
      x.lineTo(153, GY - 56);
      x.quadraticCurveTo(160, GY - 38, 156, GY - 18);
      x.closePath(); x.fill();
      // the goatskin apron, hung down between his legs
      x.beginPath();
      x.moveTo(131, GY - 20); x.lineTo(153, GY - 20);
      x.lineTo(149, GY + 4); x.lineTo(135, GY + 4); x.closePath(); x.fill();
      x.fillRect(119, GY - 2, 36, 8);                    // the stone he sits on
      // the arm, and the hammer held up as if striking
      x.lineWidth = 7;
      x.beginPath(); x.moveTo(152, GY - 50); x.lineTo(178, GY - 74); x.stroke();
      x.lineWidth = 5;
      x.beginPath(); x.moveTo(178, GY - 74); x.lineTo(198, GY - 82); x.stroke();
      x.fillRect(194, GY - 92, 17, 12);                  // the hammer's head

      // the anvil on its knotty stump, and the burning work on it
      x.fillRect(168, GY - 32, 42, 9);
      x.beginPath();
      x.moveTo(179, GY - 23); x.lineTo(201, GY - 23);
      x.lineTo(197, GY - 10); x.lineTo(183, GY - 10); x.closePath(); x.fill();
      x.fillRect(176, GY - 10, 28, 12);                  // the stump
      x.beginPath();                                      // a knot in it
      x.arc(172, GY - 4, 5, 0, 7); x.fill();
      x.fillRect(176, GY - 40, 26, 8);                   // the brigandine being beaten

      // the winged goddess, seated, the infant on her thighs
      x.beginPath();                                      // the wing
      x.moveTo(238, GY - 60);
      x.quadraticCurveTo(214, GY - 104, 240, GY - 112);
      x.quadraticCurveTo(244, GY - 86, 252, GY - 62);
      x.closePath(); x.fill();
      x.beginPath(); x.arc(266, GY - 78, 10.5, 0, 7); x.fill();   // head
      x.beginPath();                                       // the hair dressed high
      x.moveTo(255, GY - 84); x.quadraticCurveTo(266, GY - 98, 277, GY - 84);
      x.closePath(); x.fill();
      x.beginPath();                                       // body and lap
      x.moveTo(252, GY - 14);
      x.quadraticCurveTo(250, GY - 48, 260, GY - 66);
      x.lineTo(275, GY - 64);
      x.quadraticCurveTo(285, GY - 44, 288, GY - 18);
      x.closePath(); x.fill();
      x.fillRect(276, GY - 18, 22, 7);                    // the thighs, and the stone under her foot
      x.fillRect(296, GY - 8, 16, 10);
      x.beginPath(); x.arc(283, GY - 40, 7, 0, 7); x.fill();      // the infant
      x.beginPath();
      x.moveTo(277, GY - 32); x.quadraticCurveTo(284, GY - 22, 291, GY - 32);
      x.closePath(); x.fill();

      // the furnace sunk in its hollow, and the fire in it
      x.fillRect(316, GY - 6, 30, 10);
      x.beginPath();
      x.moveTo(322, GY - 6);
      x.quadraticCurveTo(326, GY - 30, 331, GY - 14);
      x.quadraticCurveTo(336, GY - 34, 340, GY - 6);
      x.closePath(); x.fill();

      // the knight: crested helmet, Medusa on the breast, baldric, half-pike
      x.beginPath(); x.arc(400, GY - 82, 10.5, 0, 7); x.fill();
      x.beginPath();                                       // the high crest
      x.moveTo(391, GY - 90);
      x.quadraticCurveTo(400, GY - 118, 412, GY - 96);
      x.quadraticCurveTo(404, GY - 96, 400, GY - 90);
      x.closePath(); x.fill();
      x.beginPath();                                       // the cuirass
      x.moveTo(386, GY - 6);
      x.quadraticCurveTo(383, GY - 44, 392, GY - 70);
      x.lineTo(410, GY - 70);
      x.quadraticCurveTo(419, GY - 44, 416, GY - 6);
      x.closePath(); x.fill();
      x.lineWidth = 4;                                     // the baldric across the breast
      x.beginPath(); x.moveTo(388, GY - 58); x.lineTo(416, GY - 34); x.stroke();
      x.beginPath(); x.arc(401, GY - 48, 6.5, 0, 7); x.fill();    // the Medusa head
      x.lineWidth = 6;                                     // the half-pike, point up
      x.beginPath(); x.moveTo(430, GY + 2); x.lineTo(438, GY - 96); x.stroke();
      x.beginPath();
      x.moveTo(433, GY - 96); x.lineTo(438, GY - 116); x.lineTo(443, GY - 96);
      x.closePath(); x.fill();
      x.lineWidth = 6;                                     // the brawny arm holding it
      x.beginPath(); x.moveTo(414, GY - 56); x.lineTo(432, GY - 44); x.stroke();
    });
    return true;
  },

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

    // Where the book actually describes a picture, draw THAT picture. The seeded
    // crowd below is the right answer for the scores of reliefs the text only
    // gestures at, and the wrong one for the few it sets out figure by figure.
    const drewNamed = this._reliefScene(x, W, H, carve, scene);

    // a rough seeded crowd of relief figures for the scene
    const rnd = (i, k) => { const v = Math.sin(i * 61.7 + k * 137.3 + scene.length * 7.1) * 43758.5453; return v - Math.floor(v); };
    const N = word ? 3 : 5;
    if (!drewNamed) carve(() => {
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
  },

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
  },

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
  },
};
