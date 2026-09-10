// palace.js — Queen Eleuterylida's palace: the court, the banquet, the chess ballet, the bath and the gardens
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
import { METALS, SENSE_NYMPHS } from './constants.js?v=7';
import { isVariant } from '../../systems/AssetVariants.js?v=12';

export const Palace = {
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

    // The second wheeled fountain of the banquet (plate #32), standing just
    // OUTSIDE the court's north wall rather than in it.
    //
    // Not a fudge, and measured before it was moved. The court has no room at
    // all: surface clearance across the whole slab peaks at 0.40 m, because the
    // banquet's seven tables, the throne, the chess pavement and the bath are
    // already in it. The first placement, chosen off a probe that measured
    // distance to object CENTRES rather than to their surfaces, put the fountain
    // inside a wall -- clearance 0.00.
    //
    // Outside, at (-24, 33), there is 7.4 m. And the object's own conceit makes
    // that the right place: it is founded on an axle-tree with two wheels, which
    // is banquet furniture WHEELED IN with a course. A wheeled fountain standing
    // by the court door, waiting to be brought in, is what the thing is for.
    this._buildWheeledFountain(CX - 5, CZ + 13);

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
  },

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

    const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'];
    COURSES.forEach((c, i) => this._rollGroup('banquet_table' + i, () => {
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
    }, `the ${ORD[i]} table, of ${c.stone}`));

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
    this._rollGroup('banquet_perfumer', () => {
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
    }, 'the perfuming vessel, with its six flying spirits');
    const pl = S.pointLight ? S.pointLight(0xff7030, 1.6, 4.5) : null;
    if (pl) { pl.position.set(PX, PY + 1.3, PZ); this.scene.add(pl); this._pulses.push({ pl, base: 1.6, phase: 0.6 }); }
    this._circleCol(PX, PZ, 0.9);
    this._plaque({ main: 'THE PERFVMING VESSEL', sub: 'SIX NAKED SHAPES OF FLYING SPIRITES OF TWO CVBITES HIGH · ROSE-WATER, ORANGE FLOWERS, MYRTLE, LAVRELL, ELDER, BOYLING TOGITHER · DALLINGTON PP. 147–148' },
      2.0, 0.34, PX, FLOOR + 0.14, PZ + 1.05, 0, true);

    // ── the fountain on four wheels, for the washing of hands (pp. 145–146) ──
    const FX = CX - 1.9, FZ = CZ - 1.55, FY = FLOOR;
    this._rollGroup('banquet_fountain', () => {
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
    }, 'the fountain on four little wheels');
    this._jet(FX, FY + 1.0, FZ, FX + 0.05, FY + 0.58, FZ + 0.05, { apex: 0.25, r: 0.02, sparkle: 12 });
    this._circleCol(FX, FZ, 0.5);
    this._plaque({ main: 'THE FOVNTAINE ON FOVRE LITTLE WHEELES', sub: 'CONTINVALLY RVNNING WITH WATER, AND REASSVMING THE SAME · OF ROSES, LYMON PILLES AND AMBER · DALLINGTON PP. 145–146' },
      1.5, 0.28, FX, FLOOR + 0.12, FZ - 0.62, Math.PI, true);

    // ── the repository, a ship on four wheels (p. 150), at the open east end ──
    const SX = CX + 5.2, SZ = CZ - 3.6;
    this._rollGroup('banquet_ship', () => {
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
    }, 'the repository, a ship of gold');
    this._circleCol(SX, SZ, 1.0);
    this._plaque({ main: 'THE REPOSITORIE', sub: 'IN FASHION LIKE VNTO A SHIPPE, OF MOST FINE GOLDE, WITH MANY FISHES AND WATER MONSTERS · CLOTHES, FLOWERS, CVPPES, TOWELLES AND VESSELLES · P. 150' },
      1.8, 0.3, SX, FLOOR + 0.12, SZ + 0.75, 0, true);

    // ── the vessel of coals the cloths are cleaned in (p. 155) ─────────────
    const VX = CX + 4.6, VZ = CZ + 3.9;
    this._rollGroup('banquet_coals', () => {
    const vc = this._m(new THREE.SphereGeometry(0.3, 14, 7, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), gold, VX, FLOOR + 0.46, VZ, { outline: true });
    vc.rotation.x = Math.PI;
    this._m(new THREE.CylinderGeometry(0.1, 0.16, 0.16, 10), gold, VX, FLOOR + 0.08, VZ, { cast: false });
    this._m(new THREE.CylinderGeometry(0.26, 0.26, 0.04, 14), M(0x3a1a0a, { emissive: 0xff4010, emissiveIntensity: 1.6 }, 0.3), VX, FLOOR + 0.47, VZ, { cast: false });
    this._m(new THREE.BoxGeometry(0.34, 0.03, 0.26), M(0xf2eee6, { roughness: 0.9 }, 0.0), VX + 0.04, FLOOR + 0.5, VZ, { cast: false }).rotation.y = 0.4;   // a napkin in the fire, unhurt
    this._fume(VX, FLOOR + 0.55, VZ, { rise: 1.4, drift: 0.15, count: 8, speed: 0.1 });
    }, 'the vessel of coals the cloths are cleaned in');
    this._circleCol(VX, VZ, 0.42);
    this._plaque({ main: 'THE TABLE CLOATHES, NAPKINS AND TOWELLES OF SILKE WERE THROWNE IN', sub: 'AND AFTER, BEEING TAKEN OVT AND COOLED, THEY WERE WHOLE, VNHVRT AND CLEANE · THE WONDERFVLL STRAVNGEST OF ALL THE REST · P. 155' },
      1.7, 0.36, VX, FLOOR + 0.12, VZ + 0.55, 0, true);

    // ── the coral tree on the chalice (pp. 156–157, plate #31) ─────────────
    const KX = CX - 3.9, KZ = CZ - 2.2;
    this._rollGroup('banquet_chalice', () => {
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
    }, 'the chalice with the tree of coral');
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
  },

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
  },

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
  },

  // ── The frieze on the palace front (plate #24) ───────────────────────────
  //
  // 1499 p. 84, attached to chapter VIII: a frieze ornament of genii, dolphins
  // and a bull's skull. Found absent by the verification pass of 2026-09-09 --
  // the only genii in the world hold the circle of plate #36, and there was no
  // bucranium anywhere.
  //
  // Set on the palace's east front, which is the face the dreamer arrives at.
  // Measured before placing, because two placements this session went into
  // walls: the front is four meshes spanning z -6.68..6.69 with its face at
  // x = -12.93 and a top at 2.01 m, and there is 5.16 m of clear ground in
  // front of it. The band sits under that top with the relief repeating five
  // times along it -- five tiles of 2.64 x 1.0 against a texture drawn 512 x
  // 192, so each tile keeps very nearly the proportion it was drawn at instead
  // of being smeared the length of the wall.
  _buildPalaceFrieze() {
    const S = this.style;
    const woodcut = S.key === 'woodcut';
    const FX = -12.90, W = 13.2, H = 1.0, Y = 1.32;

    const tex = this._reliefTexture("genii, dolphins and a bull's skull");
    // safe to set the wrap on the cached texture: this scene has one user
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(5, 1);

    const mat = woodcut ? S.mat({ tone: 0.12 }) : S.mat({ color: 0xffffff, roughness: 0.88 });
    if (!mat.map) mat.map = tex;

    const band = this._m(new THREE.PlaneGeometry(W, H), mat, FX, Y, 0, { cast: false });
    band.rotation.y = Math.PI / 2;          // the face looks east, up the approach

    this._plaque({ main: 'GENII · DELPHINI · BVCRANIVM',
                   sub: 'THE FRIEZE OF THE PALACE FRONT · 1499 PLATE 24, P. 84' },
      1.5, 0.24, FX - 0.02, Y - 0.78, 3.4, Math.PI / 2, true);
  },

  _buildPalace() {
    const S = this.style;
    const CX = -20.5;
    this._buildPalaceFrieze();

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
  },

  // ── Polia dressed as chapter XI dresses her ──────────────────────────────
  //
  // Enumerated 2026-09-09. The world had already built the right MOMENT and put
  // the wrong clothes on it: constants.js describes this figure's pose as "in
  // the green arbour, before he has recognised her", which is chapter XI word
  // for word -- *"Whom at the first sight I suspected to be certainly Polia;
  // but the condition of the unaccustomed dress and place dissuaded me"* (our
  // p. 143). The unaccustomed dress is the reason he fails to know her, so the
  // dress is not decoration here. It is the plot.
  //
  // Five pages of blazon, and everything below is stated, counted or named:
  //
  //   THE NECKLACE (p. 145), given stone by stone outward from the middle --
  //   "in the middle between two great pearls, was threaded a flashing ruby,
  //   most round; beyond the pearls on either side there followed two blazing
  //   sapphires, and then again two eastern pearls ... two lightning emeralds,
  //   and again two pearls, and then two most shining jacinths", all "of a
  //   pill-like form, most just, and of the thickness of a berry". Thirteen
  //   stones, symmetrical. This is the same kind of object as the hieroglyph
  //   bands: a stated sequence, and seeding it would throw away the only thing
  //   that makes it worth building at all.
  //
  //   THE GIRDLE OF CYTHEREA (p. 143) -- "this raised and tucked-up garment was
  //   fastened at the first golden cord with the sacred girdle of holy
  //   Cytherea". A SECOND band over the gold cord the figure already wears, not
  //   a recolouring of it: the book is explicit that there are two.
  //
  //   THE THREE PEARL PINS (p. 144) -- the gown "unsewn, or cut apart, and
  //   joined in three places by three little pins, which were three thickest
  //   pearls braided with dark blue silk", on each side, "showing her shift
  //   between the distance of one pearl and another". Counted, and with a
  //   stated reason, which is what makes it drawable.
  //
  //   THE HAIR (p. 145) -- "spread out behind her sparkling neck ... restlessly
  //   stretching over her shapely back beyond the turning of her knees". Length
  //   is the claim, and it is what separates her silhouette from every other
  //   nymph in this world, all of whom wear the chess dancers' tresses.
  //
  //   THE WREATH (p. 145) -- "a wreath of fragrant amethyst violets, hanging a
  //   little above her festive forehead". Cast.GARLANDS.violet is the same
  //   wreath and all thirty-two chess dancers wear it; the woman the book
  //   actually puts it on did not.
  //
  // NOT passed as Cast.nymph's own `garland`, and that is deliberate: setting
  // it there forces the built head and drops her off the PROJECTED rung, which
  // is the default Ted chose (DECISIONS.md 50, "bling us out"). Drawn here as
  // geometry instead, so she keeps her Botticelli surface and gains the book's
  // wreath. Skipped entirely on the flat `card` rung, where solid jewellery
  // would hang in the air in front of a painted panel.
  _dressPoliaAsChapterXI(g, h) {
    if (isVariant('figure', 'card', this.style.key)) return;
    const S = this.style, lit = S.key !== 'woodcut';
    const gem = (hex, rough, metal) => (lit
      ? S.mat({ color: hex, roughness: rough, metalness: metal })
      : S.mat({ tone: 0.12 }));
    const RUBY = gem(0xb0142c, 0.16, 0.1), PEARL = gem(0xf2ece0, 0.28, 0.05),
          SAPPH = gem(0x1f3f9a, 0.14, 0.1), EMER = gem(0x0f7a45, 0.15, 0.1),
          JACIN = gem(0xd06a18, 0.18, 0.1);
    const GOLD = lit ? S.mat({ color: 0xd8b048, metalness: 0.8, roughness: 0.3 }) : S.mat({ tone: 0.06 });
    const HAIR = lit ? S.mat({ color: 0xc8a24a, roughness: 0.82 }) : S.mat({ tone: 0.22 });
    const VIOLET = lit ? S.mat({ color: 0x6a4aa8, roughness: 0.85 }) : S.mat({ tone: 0.3 });

    // The strand, outward from the ruby. One entry per stone, so the order in
    // the code is the order in the book and a reader can check it.
    const STRAND = [RUBY, PEARL, SAPPH, PEARL, EMER, PEARL, JACIN];
    const NY = 1.30 * h, NR = 0.088 * h;           // throat height, and the arc it hangs on
    for (let i = 0; i < STRAND.length; i++) {
      for (const side of (i === 0 ? [0] : [-1, 1])) {
        const a = side * i * 0.235;                 // spread along the front of the throat
        // "of the thickness of a berry": the pearls a little the larger, as the
        // book calls two of them GREAT and the eastern ones merely eastern
        const r = (STRAND[i] === PEARL && i === 1) ? 0.017 * h : 0.014 * h;
        this._m(new THREE.SphereGeometry(r, 8, 6), STRAND[i],
          Math.sin(a) * NR, NY - Math.cos(a) * 0.012 * h, -Math.cos(a) * NR,
          { parent: g, cast: false });
      }
    }

    // The girdle of Cytherea, over the gold cord the figure already wears at
    // 0.978h. Set below it, and wider, so both read.
    const cest = this._m(new THREE.TorusGeometry(0.118 * h, 0.011 * h, 6, 22), GOLD,
      0, 0.930 * h, 0, { parent: g, cast: false });
    cest.rotation.x = Math.PI / 2;

    // The three pearl pins a side, with the dark blue silk they are braided
    // with, closing a gown that is cut apart from the girdle to the hem.
    const SILK = lit ? S.mat({ color: 0x1e2a5a, roughness: 0.9 }) : S.mat({ tone: 0.34 });
    for (const sx of [-1, 1]) {
      for (const y of [0.86, 0.70, 0.54]) {
        this._m(new THREE.SphereGeometry(0.016 * h, 8, 6), PEARL, sx * 0.132 * h, y * h, 0,
          { parent: g, cast: false });
        this._m(new THREE.BoxGeometry(0.010 * h, 0.12 * h, 0.006 * h), SILK,
          sx * 0.133 * h, (y - 0.06) * h, 0, { parent: g, cast: false });
      }
    }

    // The hair, poured down the back past the knees. The claim the book makes is
    // LENGTH, so what matters is that it is seen to reach.
    //
    // Built as stacked segments that step OUTWARD as they descend, because the
    // gown does. Cast.gownGeometry's profile runs r = 0.122h at the shoulder,
    // pinches to 0.104h at the high waist and then flares to 0.184h at the
    // knee -- so a fall hung straight down at a constant offset is inside the
    // skirt for its whole lower half and invisible, which is exactly what the
    // first attempt was: measured on the running page, not guessed. It also
    // stands a little off the waist, which is what long hair actually does
    // over a cinch.
    // Starts BELOW the built chignon (which sits at 1.512h) and narrow, so it
    // reads as hair coming off the nape rather than as a second head. The first
    // version began at 1.30h and 0.100h wide, with an extra nape lobe on top of
    // the chignon the figure already has, and from three-quarter front the two
    // together were a brown mass wider than her face.
    const FALL = [
      [1.26, 0.132, 0.072], [1.12, 0.142, 0.098], [0.96, 0.152, 0.114],
      [0.78, 0.168, 0.112], [0.60, 0.190, 0.096], [0.44, 0.206, 0.068],
    ];
    for (let i = 0; i < FALL.length; i++) {
      const seg = FALL[i], nxt = FALL[i + 1] || [seg[0] - 0.16, seg[1] + 0.016, seg[2] * 0.7];
      const m = this._m(new THREE.BoxGeometry(seg[2] * h, (seg[0] - nxt[0] + 0.02) * h, 0.042 * h),
        HAIR, 0, (seg[0] + nxt[0]) / 2 * h, ((seg[1] + nxt[1]) / 2) * h,
        { parent: g, cast: false });
      m.rotation.x = Math.atan2(nxt[1] - seg[1], seg[0] - nxt[0]);
    }
    // No extra nape lobe: Cast.nymph already builds a chignon at 1.512h and a
    // nape below it, and a third mass there was one too many.

    // The wreath of amethyst violets on the brow, and the triangular parting it
    // presses the crown into.
    // Measured on the running page, not judged: at 1.596h and 0.013h the beads
    // stood clear of the brow and read as a row of purple balls in the air. The
    // head is a sphere of 0.100h scaled 0.94/1.08/0.96, so its surface at brow
    // height is nearer 0.094h, and the projected Botticelli face sits a little
    // lower on that sphere than a built face does.
    for (let i = 0; i <= 15; i++) {
      const a = Math.PI * (1.00 + (1.00 * i) / 15);
      this._m(new THREE.SphereGeometry(0.0105 * h, 6, 5), VIOLET,
        Math.cos(a) * 0.093 * h, (1.572 + Math.sin(a) * 0.004) * h, Math.sin(a) * 0.090 * h,
        { parent: g, cast: false });
    }
  },

  _buildPoliaGarden() {
    const CX = 19, CZ = 20;
    this._m(new THREE.BoxGeometry(11, 0.22, 10), this._darkStoneMat, CX, 0.11, CZ, { cast: false });

    // The arbour of sweet jessamine, a tunnel he walks in under. Rebuilt
    // 2026-09-07 from Dallington p. 200; see _buildJasmineArbour.
    this._buildJasmineArbour(CX, CZ);

    // Polia and Poliphilo, and her torch.
    //
    // THE GOWN IS THE BOOK'S, since 2026-09-09. Our p. 143: "a most fine cloth
    // of green silk woven with a warp of gold (that most joyful colouring of
    // the little feathers of a duck's neck)". She wore a cream, 0xe8ddc0,
    // which is a colour nothing in the chapter supports; the gold trim the
    // figure already carries at hem, neck and waist is the warp of gold.
    // hair: the book is emphatic and repeats it -- "her most blonde head", the
    // locks "seen no otherwise than as the finest threads of gold", "the
    // remainder of her YELLOW hair" (our p. 145). Cast.nymph defaults to
    // 0x4a3018, a dark brown, which is what she wore; and it also made the long
    // fall added below the wrong colour for the head it comes out of.
    const polia = this.cast.nymph({ name: 'Polia', h: 1.0, robe: 0x2f7050, pose: 'offer',
      hair: 0xc8a24a });
    this._dressPoliaAsChapterXI(polia, 1.0);
    this._npc('polia', polia, CX + 0.9, CZ, Math.PI / 2, { label: 'Polia', sub: 'THE LONG-SOVGHT · NOT YET KNOWN', labelY: 2.1, sway: 0.03 });
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

    // What this meeting is, said where it happens. Enumerated 2026-09-09: the
    // world staged chapter XI's recognition scene in chapter XIV's arbour and
    // never said so, so a reader had no way to tell which of the two meetings
    // with a torch they were looking at.
    this._plaque({ main: 'A NYMPH WITH A BVRNING TORCH',
      sub: 'PARTING FROM THE FESTIVAL SHE CAME TOWARD HIM · WHOM AT THE FIRST SIGHT I SVSPECTED TO BE CERTAINLY POLIA · BVT THE CONDITION OF THE VNACCVSTOMED DRESS AND PLACE DISSVADED ME · CH. XI, OVR PP. 142-143' },
      4.4, 0.46, CX, 0.6, CZ - 2.6, 0, true);

    // Rose hedges
    for (const sz of [-1, 1]) {
      this._hedge(CX, 0.4, CZ + sz * 4.6, 8, 0.8, 0.5);
      this._wallCol(CX - 4, CX + 4, CZ + sz * 4.6 - 0.25, CZ + sz * 4.6 + 0.25);
    }

    this._buildPoliaArcade(CX, CZ);
  },

  // ── Polia's ivied arcade, and the dream that makes room for it ───────────
  //
  //   "an Arbour or Gallerie ... of fiue paces high and three broade, and of a
  //    hundred arches round about the garden"          — Dallington p. 182
  //
  // A hundred arches three paces across is 300 paces of circumference, which is
  // a garden about 141 m wide. This one has never been built at all, and the
  // reason is that it does not fit: the garden stands at the most inland point
  // of the island (shore radius 48 m) and there is no free ring around it at ANY
  // radius -- 23 built objects within 5 m, 64 by 20, 271 by 30. The palace court
  // is built on the ground the arcade needs.
  //
  // So it is built here at R = 40, the largest ring that keeps every arch on
  // land, and the COURT FOLDS AWAY while the dreamer is inside. See
  // HPWorldScene._foldPoliaCourt and DECISIONS.md 2026-09-09, "The dream does
  // not have to add up": the Hypnerotomachia is a dream and its spaces do not
  // add up, so the stations are no longer required to be simultaneously true.
  //
  // What is at true size is the thing you actually look at: each arch is 3 paces
  // across and 5 high, exactly as Dallington gives it. What is reduced is the
  // COUNT -- a ring of 40 m takes 56 arches of that width, not 100. An arch of
  // the right size and the wrong number is a better lie than 100 arches
  // squeezed to half scale, because the arch is what the eye measures itself
  // against and the count is what nobody counts.
  _buildPoliaArcade(CX, CZ) {
    const R = 40;             // metres; the ring stays on land at 48 m of shore
    const AW = 4.44;          // 3 paces  — the arch's span
    const AH = 7.4;           // 5 paces  — its height to the crown
    const N = Math.round((2 * Math.PI * R) / AW);      // 56
    const g = new THREE.Group();
    this.scene.add(g);
    this._poliaArcade = g;
    g.visible = false;        // folded until the dreamer enters the garden

    const mat = this._stoneMat;
    const spring = AH - AW / 2;                        // where the arch springs
    for (let i = 0; i < N; i++) {
      const a  = (i / N) * Math.PI * 2;                // this pier
      const am = ((i + 0.5) / N) * Math.PI * 2;        // the arch to the next one
      const px = CX + Math.sin(a) * R,  pz = CZ + Math.cos(a) * R;
      const mx = CX + Math.sin(am) * R, mz = CZ + Math.cos(am) * R;
      this._column(px, pz, spring, { order: 'doric', r: 0.34, parent: g, mat });
      // the arch's plane is tangent to the ring, so ry is the ring angle
      this._arch(mx, spring, mz, AW, 1.0, mat,
        { ry: am, n: 9, parent: g, name: "an arch of Polia's arcade" });
      const c = this._circleCol(px, pz, 0.55);
      c.arcade = true;        // survives the fold; see _prepareGardenFold
    }
    // "all couered ouer with Iuie" — the ivy that gives it its name, laid along
    // the crown of the whole ring
    const ivy = this._hedgeFringeArc(CX, CZ, R, AH + 0.25, 1.1, 0, Math.PI * 2,
      { density: 4, seed: 19 });
    if (ivy) g.add(ivy);      // the arc group is already in world coordinates
  },

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
  },

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
  },

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
  },

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
  },

  // ── The perpetual running fountain on an axle-tree (plate #32) ───────────
  //
  // Dallington pp. 158-159, the marvel that follows the coral tree at the
  // banquet. The tour lede has promised it since the commentary was written and
  // the world has never had it; the code comment above _buildBanquet lists the
  // plate and stops there. Found unbuilt by the chapter III / X ledger pass.
  //
  // What the book specifies, and what is built here for each of it:
  //   · founded on an IMMOVEABLE AXLE-TREE with two wheels turning on it -- so
  //     it is a fountain that could be wheeled in with a course, which is the
  //     whole conceit of the banquet's furniture
  //   · above it an "vnequal quadrature", three feet long, two broad, six high.
  //     A Roman foot is 0.296 m (DIMENSIONS.md 1), so 0.89 x 0.59 x 1.78
  //   · a HARPY sitting at every angle, both wings stretched up to the breadth
  //     of the higher vessel, their tails joining and turning into leaves to
  //     cover what would otherwise be void
  //   · each side in three, the middle panel between the falls of water carrying
  //     a triumph of satyrs and nymphs in half-relief
  //   · front and back bent in and rounded rather than squared, engraved with a
  //     little sacrifice at an old altar
  //   · from the median centre, three vessels rising one out of the other, the
  //     second wider than the first, the third ridged and set with a row of
  //     coloured stones, with a monster's head on either side, a ring at the lip
  //     and a garland hung from it, thickening toward the middle
  //
  // Height: the plate is glossed in this file as "twice a nymph's height", and
  // the world's nymphs stand about 1.6 m, so the whole reaches about 3.4.
  _buildWheeledFountain(FX, FZ) {
    const S = this.style;
    const woodcut = S.key === 'woodcut';
    const FT = 0.296;                       // the Roman foot
    const LONG = 3 * FT, BROAD = 2 * FT, HIGH = 6 * FT;
    const gold = woodcut ? S.mat({ tone: 0.04 })
                         : S.mat({ color: 0xd9b25a, metalness: 0.88, roughness: 0.26 });
    const dark = woodcut ? S.mat({ tone: 0.24 })
                         : S.mat({ color: 0x7a6230, metalness: 0.8, roughness: 0.45 });
    const rnd = (i, k) => { const v = Math.sin(i * 71.3 + k * 187.1) * 43758.5453; return v - Math.floor(v); };

    // the axle-tree, and the two wheels that turn on it
    const WR = 0.30, AY = WR;
    const axle = this._m(new THREE.CylinderGeometry(0.045, 0.045, LONG + 0.34, 8), dark, FX, AY, FZ);
    axle.rotation.z = Math.PI / 2;
    for (const sx of [-1, 1]) {
      const w = this._m(new THREE.TorusGeometry(WR, 0.05, 6, 16), gold, FX + sx * (LONG / 2 + 0.14), AY, FZ);
      w.rotation.y = Math.PI / 2;
      for (let k = 0; k < 6; k++) {
        const sp = this._m(new THREE.BoxGeometry(0.03, WR * 1.9, 0.03), dark, FX + sx * (LONG / 2 + 0.14), AY, FZ, { cast: false });
        sp.rotation.set(0, Math.PI / 2, k * Math.PI / 6);
      }
    }

    // the quadrature: body, the channelled lower part, the cornice over
    const BASE = AY + 0.16;
    this._m(new THREE.BoxGeometry(LONG, HIGH, BROAD), gold, FX, BASE + HIGH / 2, FZ, { outline: true });
    for (let i = 0; i < 7; i++) {
      this._m(new THREE.BoxGeometry(0.022, HIGH * 0.44, 0.022), dark,
        FX - LONG / 2 + 0.06 + i * (LONG - 0.12) / 6, BASE + HIGH * 0.22, FZ + BROAD / 2 + 0.012, { cast: false });
    }
    this._m(new THREE.BoxGeometry(LONG + 0.1, 0.07, BROAD + 0.1), gold, FX, BASE + HIGH + 0.035, FZ, { cast: false });

    // the triumph of satyrs and nymphs, on the middle panel of each long side
    const relief = this._reliefTexture('a triumph of satyrs and nymphs');
    const relM = woodcut ? S.mat({ tone: 0.14 })
                         : S.mat({ color: 0xffffff, roughness: 0.85, map: relief });
    if (!woodcut && !relM.map) relM.map = relief;
    for (const sz of [-1, 1]) {
      const pan = this._m(new THREE.PlaneGeometry(LONG * 0.52, HIGH * 0.34), relM,
        FX, BASE + HIGH * 0.62, FZ + sz * (BROAD / 2 + 0.014), { cast: false });
      if (sz < 0) pan.rotation.y = Math.PI;
    }
    // and the ends bent in: a rounded face with the little sacrifice at its altar
    for (const sx of [-1, 1]) {
      const bow = this._m(new THREE.CylinderGeometry(BROAD * 0.5, BROAD * 0.5, HIGH * 0.9, 10, 1, false, -Math.PI / 2, Math.PI),
        gold, FX + sx * (LONG / 2 - 0.01), BASE + HIGH * 0.5, FZ, { cast: false });
      bow.rotation.y = sx > 0 ? 0 : Math.PI;
      this._m(new THREE.BoxGeometry(0.02, 0.16, 0.11), dark, FX + sx * (LONG / 2 + BROAD * 0.5 - 0.02), BASE + HIGH * 0.55, FZ, { cast: false });
    }

    // a harpy at every angle, wings up to the breadth of the vessel above,
    // their tails meeting in leaves over the void between them
    const TOP = BASE + HIGH + 0.07;
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const hx = FX + sx * (LONG / 2 - 0.08), hz = FZ + sz * (BROAD / 2 - 0.06);
      this._m(new THREE.ConeGeometry(0.05, 0.10, 6), dark, hx, TOP + 0.05, hz, { cast: false });
      this._m(new THREE.CapsuleGeometry(0.035, 0.10, 4, 7), gold, hx, TOP + 0.17, hz, { cast: false });
      const wing = this._m(new THREE.ConeGeometry(0.035, 0.26, 4), gold, hx - sx * 0.03, TOP + 0.30, hz, { cast: false });
      wing.rotation.z = sx * 0.42; wing.rotation.x = -sz * 0.3;
      // the tail, turning into leaves toward its neighbour
      const tail = this._m(new THREE.TorusGeometry(0.07, 0.014, 5, 8, Math.PI * 0.8), dark, hx - sx * 0.06, TOP + 0.06, hz - sz * 0.03, { cast: false });
      tail.rotation.set(Math.PI / 2, 0, sx * sz > 0 ? 0.6 : -0.6);
    }

    // the three vessels, rising one out of the other
    const v1 = TOP + 0.10;
    this._m(new THREE.CylinderGeometry(BROAD * 0.30, BROAD * 0.22, 0.26, 12), gold, FX, v1 + 0.13, FZ, { outline: true });
    const v2 = v1 + 0.26;
    this._m(new THREE.CylinderGeometry(BROAD * 0.62, BROAD * 0.30, 0.20, 14), gold, FX, v2 + 0.10, FZ, { outline: true });
    this._m(new THREE.TorusGeometry(BROAD * 0.62, 0.022, 6, 16), gold, FX, v2 + 0.20, FZ, { rx: Math.PI / 2, cast: false });
    const v3 = v2 + 0.22;
    this._m(new THREE.CylinderGeometry(BROAD * 0.40, BROAD * 0.24, 0.24, 12), gold, FX, v3 + 0.12, FZ, { outline: true });
    // the row of coloured stones round the swelling ridges of the third
    const GEMS = [0xd8443a, 0x3a6ad8, 0x3aa85a, 0xe0c840, 0xc85ad0, 0x40c8c0];
    GEMS.forEach((c, i) => {
      const a = (i / GEMS.length) * Math.PI * 2;
      this._m(new THREE.SphereGeometry(0.022, 7, 6),
        woodcut ? dark : S.mat({ color: c, roughness: 0.25, metalness: 0.1 }),
        FX + Math.sin(a) * BROAD * 0.26, v3 + 0.06, FZ + Math.cos(a) * BROAD * 0.26, { cast: false });
    });
    // a monster's head either side, a ring at the lip, and the garland hung
    // from it, growing bigger toward the middle
    for (const sx of [-1, 1]) {
      this._m(new THREE.SphereGeometry(0.038, 8, 6), dark, FX + sx * BROAD * 0.40, v3 + 0.19, FZ, { cast: false });
      this._m(new THREE.TorusGeometry(0.028, 0.008, 5, 10), gold, FX + sx * BROAD * 0.40, v3 + 0.24, FZ, { rx: Math.PI / 2, cast: false });
    }
    for (let i = 0; i < 7; i++) {
      const t = (i + 0.5) / 7;
      const sag = Math.sin(t * Math.PI);
      const r = 0.016 + sag * 0.026;
      this._m(new THREE.SphereGeometry(r, 7, 6), i % 3 ? dark : gold,
        FX - BROAD * 0.40 + t * BROAD * 0.80, v3 + 0.22 - sag * 0.10, FZ + 0.012, { cast: false });
    }

    // and it runs: the book calls it a PERPETUAL running fountain
    const water = this._waterMat();
    this._waters.push({
      m: this._m(new THREE.CircleGeometry(BROAD * 0.58, 12), water, FX, v2 + 0.185, FZ, { rx: -Math.PI / 2, cast: false }),
      rate: 0.13,
    });

    this._plaque({ main: 'FONS PERPETVVS',
                   sub: 'THE RVNNING FOVNTAINE ON AN AXLE-TREE · A HARPY AT EVERY ANGLE · DALL. PP. 158-159' },
      1.05, 0.20, FX, BASE - 0.10, FZ + BROAD / 2 + 0.10, 0, true);
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },
};
