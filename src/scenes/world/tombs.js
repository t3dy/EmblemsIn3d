// tombs.js — the Polyandrion and Book II: the ruin, the crypt, the epitaphs, Polia's telling
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
import { DOORS } from './constants.js?v=4';

export const Tombs = {
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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },
};
