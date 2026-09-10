// temple.js — the Temple of Venus, the fountains, and the rite of Priapus
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

export const Temple = {
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
  },

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

  },

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
  },

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
  },

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
  },

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
  },

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
    // ── The current ──────────────────────────────────────────────────────
    //
    // This was one still disc with no rate on it, so the seven channels held
    // water that did not go anywhere -- and the current is not decoration here,
    // it is the allegory. Dallington pp. 178-180: through the first circuits
    // they sail with a prosperous wind and great solace; putting off from the
    // second mount the water begins to run somewhat against them; and nearer
    // the centre the revolutions grow shorter and the stream swifter into the
    // devouring swallow, with no turning the ship back.
    //
    // So each channel gets its own rate, and the SIGN CHANGES at the third:
    // the outer two run with you and gently, the rest run against you and
    // faster the further in they lie. Read from the viewing mount, the rings
    // visibly disagree with each other, which is the thing Logistica is
    // pointing at. Found missing by the chapter IX pass, 2026-09-09.
    const FLOW = [0.035, 0.05, -0.06, -0.085, -0.11, -0.14, -0.18];
    for (let i = 1; i <= 7; i++) {
      const outer = R - (i - 1) * 1.15, inner = Math.max(0.35, R - i * 1.15);
      this._waters.push({
        m: this._m(new THREE.RingGeometry(inner, outer, 40), water, LX, 0.26, LZ,
                   { rx: -Math.PI / 2, cast: false }),
        rate: FLOW[i - 1],
      });
    }
    // and the swallow at the centre, which runs fastest of all
    this._waters.push({
      m: this._m(new THREE.CircleGeometry(0.9, 24), water, LX, 0.25, LZ, { rx: -Math.PI / 2, cast: false }),
      rate: -0.24,
    });
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
  },
};
