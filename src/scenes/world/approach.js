// approach.js — chapters I-III: the plain the dream opens on, the dark wood, the great oak, the valley, and Poliphilo acting
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
import { Walker } from '../../systems/Walker.js?v=6';
import { EYE, WOOD_CLEARINGS, WOOD, WITNESS_POSES, WITNESS_AT, SPECIES } from './constants.js?v=6';

export const Approach = {
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
      // _dress also hands the albedo to roughnessMap, which on ground is wrong
      // in a way you cannot unsee once you have: every DARK speckle becomes a
      // low-roughness (glossy) one, so the environment map puts a bright
      // highlight on the grass and the gravel that slides along with the
      // camera like a headlamp. Turf and gravel are matte. Keep the bump.
      for (const m of [groundMat, pathMat]) { m.roughnessMap = null; m.roughness = 1.0; }
    }

    // The sward is a plane with two holes in it, both at the Polyandrion: the
    // grated oculus of the ciborium and the stair-pit of the crypt door. The
    // crypt is genuinely underground (ch. XIX, p. 247: "a blind, sloping little
    // stair descending"), so the ground has to open for it.
    this._m(this._holedGround(130, 130, 0, -2, [[30, -27, 0.8], [35.3, -28.0, 1.15, 0.52]]), groundMat, 0, 0, -2, { rx: -Math.PI / 2, cast: false });
    // The approach's meadow takes the SAME material, or the two planes meet at
    // z = 54 in a straight seam of two different greens.
    this._groundMat = groundMat;

    // Main processional axis (wood → shore), two cross paths to the courts
    this._m(new THREE.PlaneGeometry(3.4, 86), pathMat, 0, 0.012, 7, { rx: -Math.PI / 2, cast: false });
    this._m(new THREE.PlaneGeometry(38, 2.8), pathMat, 0, 0.012, 0, { rx: -Math.PI / 2, cast: false });
    this._m(new THREE.PlaneGeometry(38, 2.8), pathMat, 0, 0.012, 20, { rx: -Math.PI / 2, cast: false });
    this._m(new THREE.CircleGeometry(7, 40), pathMat, 0, 0.014, 0, { rx: -Math.PI / 2, cast: false });
    this._m(new THREE.CircleGeometry(8.5, 40), pathMat, 0, 0.014, -20, { rx: -Math.PI / 2, cast: false });

    // The garden's sward is 130 m square and the walkable box is now 280 m
    // wide, because the wood and the approach need the room. Two fences keep
    // the walker on the ground he has: south of the Great Portal the world is
    // the valley, and it is the cliffs that hold him; north of it, it is these.
    this._wallCol(62, 150, -208, 44);
    this._wallCol(-150, -62, -208, 44);
  },

  _buildWood() {
    const S = this.style, woodcut = S.key === 'woodcut';
    const W = WOOD;
    const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };

    // The floor: leaf litter, dark, and no grass grows in it. It runs a little
    // wider than the trees so the wood has a fringe rather than a wall.
    const duffMat = woodcut ? S.mat({ tone: 0.24, rim: 0 })
      : S.mat({ color: 0x14160c, roughness: 1.0 });
    if (!woodcut) {
      // Leaf litter under a closed canopy is nearly black even at noon, and the
      // albedo has to carry that: shadow alone cannot, because the hemisphere,
      // the ambient and the environment all still reach the floor and none of
      // them is occluded by geometry. The dark ground is half the effect and
      // the cast shadow is the other half.
      this._dress(duffMat, this._surfaceTexture({ base: '#1c1810', dark: '#0a0906', light: '#332a18', blobs: 120, speckle: 6000, repeat: 40 }), 0.35);
      // _dress hands the texture to roughnessMap as well, which on a nearly
      // black albedo turns every dark speckle glossy: the environment map then
      // mirrors a bright blob on the floor that follows the camera like a
      // headlamp. Leaf litter is the most matte surface in the world.
      duffMat.roughnessMap = null; duffMat.roughness = 1.0; duffMat.metalness = 0.0;
    }
    const wW = (W.x1 - W.x0) + 40, wD = (W.z1 - W.z0) + 30;
    this._m(new THREE.PlaneGeometry(wW, wD), duffMat,
      (W.x0 + W.x1) / 2, 0.008, (W.z0 + W.z1) / 2, { rx: -Math.PI / 2, cast: false });
    // A wood does not end on a ruled line. The duff spills out past both edges
    // in irregular tongues, so that coming out of the Hercynian the ground goes
    // from litter to grass the way it does -- patchily -- instead of stepping
    // from black to green across a straight seam.
    for (let i = 0; i < 54; i++) {
      const north = i % 2 === 0;
      const x = W.x0 - 14 + rnd(i, 71) * (W.x1 - W.x0 + 28);
      const z = (north ? W.z0 - 8 : W.z1 + 8) + (rnd(i, 72) - 0.5) * 22;
      const r = 4 + rnd(i, 73) * 11;
      this._m(new THREE.CircleGeometry(r, 9), duffMat, x, 0.009, z,
        { rx: -Math.PI / 2, cast: false });
    }

    // ── The trees ──
    // A jittered grid at ~17 m, which with crowns of 9–16 m radius closes the
    // canopy. The mix is the 1499's: five oaks to one ash to one elm, and the
    // holm oak (`laurel`, the nearest evergreen the SPECIES table has) standing
    // for `ilice`. Nothing is cleared for a path, because the book has none.
    const MIX = ['oak', 'oak', 'oak', 'oak', 'elm', 'ash', 'oak', 'laurel', 'oak', 'elm'];
    const STEP = 14;
    let n = 0;
    for (let gx = W.x0; gx <= W.x1; gx += STEP) {
      for (let gz = W.z0; gz <= W.z1; gz += STEP) {
        const i = n++;
        const x = gx + (rnd(i, 1) - 0.5) * STEP * 0.85;
        const z = gz + (rnd(i, 2) - 0.5) * STEP * 0.85;
        // the clearings are clearings: no trunk stands in one
        if (this._inClearing(x, z) > 0.12) continue;
        // the north edge thins over the last 22 m, so leaving is a brightening
        // and not a wall — this is the dazzle of Dall. p. 17
        const edge = Math.min(1, (z - W.z0) / 22);
        if (rnd(i, 8) > 0.25 + edge * 0.75) continue;
        const h = 24 + rnd(i, 3) * 12;                    // 24–36 m, as they are
        this._forestTree(x, z, h, MIX[Math.floor(rnd(i, 4) * MIX.length) % MIX.length], i * 7 + 3);
      }
    }

    // ── The understorey ──
    // "non densi virgulti, pongente vepretto" — dense saplings and pricking
    // bramble-brake. He comes out of it "my clothes torne, my face and hands
    // scratched and netteled" (Dall. p. 18), so there has to be something to
    // tear them on.
    const brambleMat = this._leafCardMat('ivy');
    const bgeo = this._cardGeo = this._cardGeo || new THREE.PlaneGeometry(1, 1);
    for (let i = 0; i < 1200; i++) {
      const x = W.x0 + rnd(i, 11) * (W.x1 - W.x0);
      const z = W.z0 + rnd(i, 12) * (W.z1 - W.z0);
      if (this._inClearing(x, z) > 0.3) continue;
      const m = new THREE.Mesh(bgeo, brambleMat);
      const sc = 1.3 + rnd(i, 13) * 1.7;
      m.position.set(x, sc * 0.3, z);
      m.rotation.set((rnd(i, 16) - 0.5) * 0.7, rnd(i, 14) * Math.PI, (rnd(i, 17) - 0.5) * 0.5);
      m.scale.set(sc, sc * 0.7, 1);
      m.castShadow = false; m.receiveShadow = false;
      this.scene.add(m);
      if (rnd(i, 15) > 0.72) this._circleCol(x, z, sc * 0.32);
    }
    // The middle storey — "non densi virgulti", dense saplings. This is also
    // what shuts the EYE-LEVEL sightlines: crowns close the sky, but a wood you
    // can see a hundred metres through at head height is not one you can be
    // lost in, and being lost is the whole of chapter I.
    //
    // Deliberately NOT _tree. A garden tree closes its crown with half-metre
    // cards at a coverage of 8πr²/size² — about two hundred cards a bush — and
    // two hundred and fifty bushes would be fifty thousand meshes. That is
    // exactly the trap the foliage pass fell into on 2026-09-07/08 (see
    // _mergeInto's note). A thicket is one dark core and eight big sprays.
    for (let i = 0; i < 560; i++) {
      const x = W.x0 + rnd(i, 21) * (W.x1 - W.x0);
      const z = W.z0 + rnd(i, 22) * (W.z1 - W.z0);
      if (this._inClearing(x, z) > 0.25) continue;
      this._thicket(x, z, 1.8 + rnd(i, 23) * 3.4, i % 4 ? 'laurel' : 'oak', i * 17 + 55);
    }
    // fallen timber — "the fall of trees, through the force of a whyrlewinde,
    // & noise of the broken bowghes" (Dall. p. 19)
    for (let i = 0; i < 26; i++) {
      const x = W.x0 + rnd(i, 31) * (W.x1 - W.x0);
      const z = W.z0 + rnd(i, 32) * (W.z1 - W.z0);
      const L = 7 + rnd(i, 33) * 12, r = 0.3 + rnd(i, 34) * 0.3;
      const t = this._m(new THREE.CylinderGeometry(r * 0.7, r, L, 7), this._trunkMat, x, r * 0.9, z);
      t.rotation.z = Math.PI / 2; t.rotation.y = rnd(i, 35) * Math.PI;
      this._circleCol(x, z, r * 1.4);
    }

    // The spring and the river of ch. I, at the wood's northern edge — he
    // finds them on getting OUT of the wood (Dall. p. 18), and then loses the
    // river again chasing the song, which is why the great oak is a long way
    // from the water. (_buildStream carries the same offset.)
    const SP = [0, W.z0 - 7];
    const spring = this.cast.props.pool(1.6);
    spring.position.set(SP[0], 0, SP[1]);
    this.scene.add(spring);
    this._circleCol(SP[0], SP[1], 1.3);
    this._buildStream();
  },

  // ── Chapter II: the approach ─────────────────────────────────────────────
  //
  // Built 2026-09-08. This is the ground between the wood's north edge and the
  // Great Portal, and it did not exist: the portal stood eight metres from the
  // wood, so the book's own way of introducing a monument — see it far off and
  // indistinct, and let it grow — had nowhere to happen.
  //
  // Colonna's sequence, in order, and it is all one continuous walk:
  //
  //   the spacious plain  →  the wood  →  the spring and the river  →
  //   the great oak in the mead (he sleeps)  →  the delicate valley  →
  //   the sandy plain and the palm  →  the wolf  →  the tower far off  →
  //   the mountains growing  →  the portal, which stops the valley dead
  //
  //   "casting my eyes towards the wooddie mountaines, WHICH SEEMED TO IOYNE
  //    THEMSELUES TOGETHER, beeing looked vnto a farre off, I sawe the forme of
  //    a tower of an incredible heygth, with a spyre VNPERFECTLIE APPEARING…
  //    And drawing neare vnto this building, I beheld the gratious mountaines
  //    before a farre of seeming small, by comming neerer and neerer, BY LITTLE
  //    AND LITTLE, TO LIFT VP THEMSELUES MORE AND MORE, at the first seeming to
  //    mee that they had ioyned together with the building which was AN
  //    INCLOSURE OR END OF THE VALLEY betwixt mountaine and mountaine"
  //                                                        — Dallington p. 24
  //
  //   "the foresaid valley there had an end, that NO MAN COULD GO FURTHER
  //    FORWARD OR BACKE AGAINE, but to enter in by this broade, large, and wide
  //    open porche"                                        — Dallington p. 27
  //
  // That last sentence is an absolute, and until now the world quietly made it
  // untrue: you could walk round the portal on the grass. The cliffs close it.
  // They converge on the portal — 44 m apart at its piers, which span 38 —
  // so the building genuinely fills the gap, and they open out southward to
  // 150 m so that the valley reads as a valley and not a corridor.
  //
  // The pyramid itself is NOT yet at the size the book gives it (1 140 m wide;
  // it is 17.5 here). That is a separate, larger job and stays in the ledger as
  // `pyramid-true-scale`. What this pass buys is the approach: 188 m of walking
  // with the thing in view the whole way, and a valley that is shut.

  _buildApproach() {
    const S = this.style, woodcut = S.key === 'woodcut';
    const W = WOOD;
    const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };

    // ── The ground of the whole southern region ──
    // Three surfaces, because the book names three: the green mead about the
    // oak, the "sandie or grauelly plaine, yet bespotted with greene tuffes" of
    // the palm, and the flowered plain the dream opens on.
    const meadMat = this._groundMat;
    const gravelMat = woodcut ? S.mat({ tone: 0.05, rim: 0 })
      : S.mat({ color: 0x6e6248, roughness: 1.0 });
    if (!woodcut) {
      this._dress(gravelMat, this._surfaceTexture({ base: '#6e6446', dark: '#3e3826', light: '#8e8260', blobs: 60, speckle: 5200, repeat: 20 }), 0.3);
      gravelMat.roughnessMap = null; gravelMat.roughness = 1.0;
    }
    // the valley floor and the mead, from the portal to the wood
    this._m(new THREE.PlaneGeometry(300, 172), meadMat, 0, 0.004, 140, { rx: -Math.PI / 2, cast: false });
    // the sandy plain of the palm, inside the valley mouth
    this._m(new THREE.CircleGeometry(31, 26), gravelMat, -6, 0.010, 130, { rx: -Math.PI / 2, cast: false });
    // the spacious plain the dream opens on, beyond the wood
    this._m(new THREE.PlaneGeometry(280, 70), meadMat, 0, 0.004, W.z1 + 28, { rx: -Math.PI / 2, cast: false });

    // ── The cliffs that close the valley ──
    this._valleyCliffs();

    // ── The great oak, in a spacious green mead (ch. I end) ──
    // "vnder a broade and mightye Oke full of Acornes, standing in the middest
    // of a spatious and large green meade, extending forth his thicke and
    // leauie armes to make a coole shadowe" (Dall. p. 20). He lies down on his
    // left side here and falls into the second dream. It is a long way from the
    // river on purpose: he lost the water chasing the song.
    this._forestTree(9, W.z0 - 32, 31, 'oak', 4242);
    for (let i = 0; i < 5; i++) {                        // a few outliers, well apart
      const a = rnd(i, 41) * Math.PI * 2, r = 26 + rnd(i, 42) * 30;
      this._forestTree(9 + Math.cos(a) * r, W.z0 - 32 + Math.sin(a) * r * 0.7,
        18 + rnd(i, 43) * 8, i % 2 ? 'ash' : 'oak', 900 + i * 31);
    }

    // ── The delicate valley of the second dream (ch. II) ──
    // "a delicate valley, in the which did rise a small mounting of no great
    // height, sprinkled heare and there with young Okes, Ashes, Palme trees
    // broadleaued, Aesculies, Holme, Chestnut, Sugerchist, Poplars, wilde
    // Oliue… Thus walking solitarily betwixt the trees, GROWING DISTANTLY ONE
    // FROM ANOTHER" (Dall. p. 23). Open and sunlit — the exact opposite of the
    // wood, and the contrast is the point.
    const VALLEY = ['oak', 'ash', 'laurel', 'olive', 'plane', 'oak', 'olive', 'ash'];
    for (let i = 0; i < 34; i++) {
      const x = -78 + rnd(i, 51) * 156;
      const z = 150 + rnd(i, 52) * 42;
      if (Math.abs(x) < 12 && z < 168) continue;         // keep the sightline open
      this._tree(x, z, 1.5 + rnd(i, 53) * 1.4, VALLEY[Math.floor(rnd(i, 54) * VALLEY.length) % VALLEY.length]);
    }

    // ── The sandy plain, and the palm ──
    // "a faire Palme tree with his leaues like the Culter of a plowe, and
    // abounding with sweet and pleasant fruite… an elect and chosen signe of
    // victorie" (Dall. p. 23). One tree, alone on the gravel.
    this._tree(-6, 128, 2.4, 'palm');
    for (let i = 0; i < 150; i++) {                      // "bespotted with greene tuffes"
      const a = rnd(i, 61) * Math.PI * 2, r = 2 + rnd(i, 62) * 28;
      this._tuft(-6 + Math.cos(a) * r, 0.02, 130 + Math.sin(a) * r, 'mint', 0.55 + rnd(i, 63) * 0.4);
    }

    // ── The wolf ──
    // Moved here from the dark wood on 2026-09-08, where it had been standing
    // beside a path since the world was built: Dallington p. 23 puts it in the
    // SECOND dream's pleasant valley. The shock is that it appears in the
    // pleasant place and not in the fearful one; Fabiani Giannetto notes
    // Poliphilo never sees any of the beasts he dreaded in the wood itself. It
    // runs away the moment he would cry out.
    //
    // AND IT IS ON THE RIGHT HAND, not the left. Dallington has "I soddainely
    // espied vpon my left hand, an hungrie and carniuorous Woolfe", and that
    // sentence is what put this animal at x = −21 for a day. The 1499 says the
    // opposite:
    //
    //   "Ecco che uno affamato et carnivoro lupo ALLA PARTE DEXTRA, cum la
    //    bucca piena mi apparve."            — 1499, p. 21
    //
    // `dextra` is the right. DIMENSIONS.md's standing rule is that where
    // Dallington and the 1499 disagree the Italian wins and the disagreement is
    // noted, so the wolf crosses the valley. Walking north (−z) the right hand
    // is +x, so it stands to the EAST.
    //
    // Found on 2026-09-09 by reading the finished translation in the reading
    // mode and noticing that the panel and the world disagreed — which is worth
    // recording as the first thing having the whole book in English actually
    // caught. See DIRECTIONS.md §4.
    const wolf = this.cast.animals.wolf(1.15);
    this._npc('wolf', wolf, 21, 132, 1.35, { label: 'The Wolf', labelY: 1.6, sway: 0.03 });
  },

  _buildWitness() {
    if (this.style.key === 'woodcut') return;   // the plates draw their own
    // `built: true` keeps him out of the painted-card register. A card is a
    // flat quad and has no arms to move; see the note at Cast.figure.
    // `hat: 'cap'` is the nearest thing this builder has to hair — a brown
    // half-sphere over the crown. Without it he is bald, and a bald Poliphilo
    // is nobody. In the 1499 cuts he wears a long gown and a full head of hair;
    // this is the gown and half the hair.
    const g = this.cast.figure({ name: 'Poliphilo the dreamer', h: 1.0,
                                 robe: 0x3f4470, pose: 'stand', built: true,
                                 hat: 'cap' });
    g.visible = false;
    this.scene.add(g);
    this._witness = {
      g,
      parts: g.userData,
      // where the pose is now, and where it is going. Everything is eased
      // toward `to`; nothing is ever set directly, which is the whole trick.
      now: { lz: 0.25, lx: 0, rz: -0.25, rx: 0, lean: 0, tilt: 0, turn: 0 },
      to:  { lz: 0.25, lx: 0, rz: -0.25, rx: 0, lean: 0, tilt: 0, turn: 0 },
      at: null,      // the station key he is standing at
      t: 0,          // seconds since the pose changed, for the easing
    };
  },

  // Move him to a station and set the pose it calls for. Called when the
  // walker's nearest station changes.
  _witnessTo(st) {
    const w = this._witness;
    if (!w) return;
    const key = st && st.key;
    if (key === w.at) return;
    w.at = key;
    const poseName = key && WITNESS_AT[key];
    if (!poseName) { w.g.visible = false; return; }

    // Where he stands: sixty per cent of the way from the station to whatever
    // it looks at, and two metres to one side — the plates put him at the edge
    // of the scene, not in the middle of it, and never between you and the
    // wonder.
    const [sx, sz] = st.pos, [lx, lz] = st.look;
    const dx = lx - sx, dz = lz - sz, len = Math.hypot(dx, dz) || 1;
    const nx = -dz / len, nz = dx / len;                 // the perpendicular
    const side = (key.charCodeAt(0) % 2) ? 1 : -1;
    const px = sx + dx * 0.6 + nx * side * 2.1;
    const pz = sz + dz * 0.6 + nz * side * 2.1;
    w.g.position.set(px, this.walker ? this.walker.floorAt(px, pz) : 0, pz);
    // He faces what the station looks at — that is what he is reacting to — but
    // turned back about thirty degrees toward where you arrive, so you see him
    // in THREE-QUARTER and not from behind. Aimed dead at the wonder he was a
    // back and a pair of shoulders, which is the one view of a figure that
    // tells you nothing. The plates almost never draw him from behind either:
    // they want his face and the wonder in the same picture, which is the whole
    // difficulty of composing them and the reason he is usually at the edge.
    w.g.rotation.y = Math.atan2(lx - px, lz - pz) - side * 0.55;
    w.g.visible = true;

    const p = WITNESS_POSES[poseName];
    w.to = { lz: p.L[0], lx: p.L[1], rz: p.R[0], rx: p.R[1],
             lean: p.lean, tilt: p.tilt, turn: p.turn };
    w.t = 0;
  },

  // Ease toward the pose. HUMANOIDS.md §4.2: "easing that is not linear" does
  // more for perceived life than any amount of extra geometry. This is an
  // ease-out with a small overshoot — he arrives, settles back, and stops —
  // over about nine tenths of a second, which is roughly how long a person
  // takes to compose a gesture.
  _updateWitness(dt) {
    const w = this._witness;
    if (!w || !w.g.visible) return;
    w.t += dt;
    const T = 0.9;
    const u = Math.min(1, w.t / T);
    // ease-out-back: 1 - (1-u)^3, with a decaying overshoot on top
    const e = 1 - Math.pow(1 - u, 3) + Math.sin(u * Math.PI) * 0.10 * (1 - u);
    const k = Math.min(1, dt * 9);
    for (const key of ['lz', 'lx', 'rz', 'rx', 'lean', 'tilt', 'turn']) {
      const target = w.now[key] + (w.to[key] - w.now[key]) * e;
      w.now[key] += (target - w.now[key]) * k;
    }
    const n = w.now, P = w.parts;
    if (P.armL) { P.armL.rotation.z = n.lz; P.armL.rotation.x = n.lx; }
    if (P.armR) { P.armR.rotation.z = n.rz; P.armR.rotation.x = n.rx; }
    w.g.rotation.x = n.lean;
    if (P.head) {
      // Breath, so he is never quite still, and the gaze on top of it.
      P.head.rotation.z = n.tilt;
      P.head.rotation.y = n.turn + Math.sin(this._t * 0.7) * 0.02;
    }
  },

  // ── The three artificial gardens ─────────────────────────────────────────
  //
  // Chapters XII–XIII, the gardens Eleuterylida's handmaids show after the
  // banquet: one of glass, one of silk, and a counterfeit scent.
  //
  // THIS WAS A DECISION AND NOT A DEFAULT, and the argument against building it
  // is worth having in front of you while you look at it. John Dixon Hunt notes
  // that the 1499 Italian and the 1592 English BOTH decline to illustrate these
  // three gardens, and that when the French edition of 1546 did illustrate them
  // it damaged them: drawing on familiar imagery "inevitably mak[es] them seem
  // more plausible", and "the sense of exceptional and extraordinary artfulness
  // is diminished." The omission "forces readers to adjudicate these designs for
  // themselves." GARDENS.md §3 called this the first case in the project where
  // the right move might be to NOT build a thing.
  //
  // Ted, 2026-09-09, asked: build them, and let the commentary say Hunt
  // disagreed. So they are here, and the note at this station names him and
  // states plainly that both early editions withheld what you are looking at.
  // **The note is not optional and it is not a hedge**: it is the one place in
  // this world where the commentary argues with the geometry standing in front
  // of it, and if it is ever lost the geometry becomes exactly the mistake Hunt
  // describes. DECISIONS.md 2026-09-09 call 4.
  //
  // Sizes are Colonna's own (DIMENSIONS.md §3): the glass cypresses 2 paces —
  // 2.96 m — and the box a single pace, 1.48 m.
  _buildArtificialGardens() {
    const S = this.style, woodcut = S.key === 'woodcut';
    const OX = -22, OZ = 52;            // north-west of the court, on the sward
    const rnd = (i, k) => { const v = Math.sin(i * 71.3 + k * 149.7) * 43758.5453; return v - Math.floor(v); };

    // ── I. The garden of glass ──
    // "great round balles of glasses lyke gunne stones… like pearles shining",
    // and the trees turned out of glass. Nothing here is alive and nothing here
    // is meant to look alive; the material is the whole subject.
    const glassM = woodcut ? S.mat({ tone: 0.02, rim: 1 })
      : S.mat({ color: 0xcfe4e8, roughness: 0.06, metalness: 0.1,
                transparent: true, opacity: 0.42, side: THREE.DoubleSide });
    const glassTrunk = woodcut ? S.mat({ tone: 0.05, rim: 1 })
      : S.mat({ color: 0xbcd6dc, roughness: 0.08, metalness: 0.12,
                transparent: true, opacity: 0.55 });
    for (let i = 0; i < 7; i++) {
      // the cypresses, 2 paces: a turned cone, because a glass tree is a
      // glass-blower's shape and not a botanist's
      const a = (i / 7) * Math.PI * 2, r = 3.4;
      const x = OX + Math.cos(a) * r, z = OZ + Math.sin(a) * r;
      this._m(new THREE.CylinderGeometry(0.05, 0.09, 0.5, 8), glassTrunk, x, 0.25, z);
      this._m(new THREE.ConeGeometry(0.44, 2.46, 10), glassM, x, 1.73, z, { outline: true });
    }
    for (let i = 0; i < 9; i++) {       // the box, one pace
      const a = (i / 9) * Math.PI * 2 + 0.3, r = 1.7;
      this._m(new THREE.SphereGeometry(0.42, 12, 10), glassM,
        OX + Math.cos(a) * r, 1.06, OZ + Math.sin(a) * r, { outline: true });
      this._m(new THREE.CylinderGeometry(0.045, 0.06, 0.64, 7), glassTrunk,
        OX + Math.cos(a) * r, 0.32, OZ + Math.sin(a) * r);
    }
    // "great round balles of glasses lyke gunne stones… like pearles shining",
    // strewn on the ground, which is what the text actually specifies first
    for (let i = 0; i < 46; i++) {
      const a = rnd(i, 1) * Math.PI * 2, r = 0.8 + rnd(i, 2) * 4.6;
      const rad = 0.055 + rnd(i, 3) * 0.075;
      this._m(new THREE.SphereGeometry(rad, 9, 7), glassM,
        OX + Math.cos(a) * r, rad, OZ + Math.sin(a) * r);
    }

    // ── II. The garden of silk ──
    // "fine silk, wanting no store of Pearles to beautify the same", and a
    // gold-wire arbour overspread with gold roses "more beautiful to the eye,
    // then if they had been growing roses."
    const SX = OX + 13, SZ = OZ;
    const silkM = woodcut ? S.mat({ tone: 0.09, rim: 1 })
      : S.mat({ color: 0xd8c8e0, roughness: 0.30, metalness: 0.06 });
    const silkLeaf = woodcut ? S.mat({ tone: 0.13, rim: 1 })
      : S.mat({ color: 0x8fae86, roughness: 0.26, metalness: 0.05, side: THREE.DoubleSide });
    const pearlM = woodcut ? S.mat({ tone: 0.02, rim: 1 })
      : S.mat({ color: 0xf4efe4, roughness: 0.18, metalness: 0.15 });
    const goldWire = S.mat({ color: 0xd8b048, metalness: 0.92, roughness: 0.22 });

    for (let t = 0; t < 5; t++) {
      const a = (t / 5) * Math.PI * 2 + 0.6, r = 3.2;
      const x = SX + Math.cos(a) * r, z = SZ + Math.sin(a) * r;
      this._m(new THREE.CylinderGeometry(0.07, 0.11, 1.5, 8), silkM, x, 0.75, z);
      for (let b = 0; b < 5; b++) {     // branches, and leaves as silk masses
        const ba = (b / 5) * Math.PI * 2 + t, br = 0.5 + rnd(t * 9 + b, 4) * 0.4;
        const bx = x + Math.cos(ba) * br, bz = z + Math.sin(ba) * br;
        const by = 1.5 + rnd(t * 9 + b, 5) * 0.55;
        this._m(new THREE.SphereGeometry(0.34, 10, 8), silkLeaf, bx, by, bz, { outline: true });
        // the pearls, which the book insists on twice
        this._m(new THREE.SphereGeometry(0.035, 7, 6), pearlM, bx + 0.16, by + 0.12, bz);
        this._m(new THREE.SphereGeometry(0.030, 7, 6), pearlM, bx - 0.13, by - 0.09, bz + 0.1);
      }
    }
    // the gold-wire arbour, with its gold roses over it
    for (let i = 0; i <= 9; i++) {
      const t = i / 9, a = Math.PI * t;
      const hx = SX + Math.cos(a) * 2.1, hz = SZ - 3.6, hy = Math.sin(a) * 2.3;
      this._m(new THREE.SphereGeometry(0.035, 6, 5), goldWire, hx, hy + 0.05, hz);
      if (i % 2 === 0 && i > 0 && i < 9) {
        this._m(new THREE.SphereGeometry(0.11, 8, 7), goldWire, hx, hy + 0.05, hz + 0.09, { outline: true });
      }
    }
    for (const sx of [-2.1, 2.1]) {
      this._m(new THREE.CylinderGeometry(0.04, 0.05, 0.35, 7), goldWire, SX + sx, 0.17, SZ - 3.6);
    }

    // ── III. The counterfeit scent ──
    // The third garden is the one that cannot be modelled at all, and the book
    // is precise about why: the fragrance is FAKED — "from the flowers did
    // breath a sweet fragrancie by some cleare washing with oyle for that
    // purpose." So it is staged with the world's own device for scent, the fume
    // (PLEASURES.md §2, `_fume`) — and staged over the SILK flowers, which have
    // no scent of their own. That is the counterfeit made visible: a smell
    // rising off a thing that cannot smell.
    this._fume(SX, 1.9, SZ, { rise: 2.0, drift: 0.4, count: 16, speed: 0.13 });

    this._plaque({ main: 'THE GARDENS OF GLASSE AND OF SILKE',
      sub: 'GREAT ROVND BALLES OF GLASSES LYKE PEARLES SHINING · TRVNKES BRANCHES LEAVES AND FLOWERS OF FINE SILK · A SWEET FRAGRANCIE BY SOME CLEARE WASHING WITH OYLE · CHAPTERS XII-XIII' },
      4.2, 0.46, OX + 6.5, 0.6, OZ + 6.2, 0, true);
  },

  // ── Chapter I: the spacious plain the dream opens on ─────────────────────
  //
  // Built 2026-09-09. The ground was already here — one green plane, 280 × 70,
  // laid by _buildApproach — and nothing stood on it, which made it read as
  // unfinished rather than as empty. The distinction is the whole point, because
  // emptiness is the only thing this place is:
  //
  //   "Me thought that I was in a large, plaine, and champion place, ALL GREENE
  //    AND DIUERSLY SPOTTED WITH MANY SORTED FLOWERRS, wherby it seemed
  //    passingly adorned. In which by reason of the milde and gentle ayre, there
  //    was A STILL QUYET WHISHT: Inso much that my attentiue eares did heare no
  //    noyse… regarding on eyther side the tender leaues and thick grasse, WHICH
  //    RESTED VNSTIRRED, WITHOUT THE BEHOLDING OF ANY MOTION."
  //                                                        — Dallington p. 14
  //
  // Absence has to be composed or it is only bare ground, and Colonna composes
  // it three ways. All three are built here:
  //
  //  1. THE GROUND IS FULL. "Diuersly spotted" is patchwork — not one meadow but
  //     many sorts, each in its own spot. So the plain is crowded with growing
  //     things, and that is exactly what makes the missing things missing.
  //  2. NOTHING MOVES. The world's only moving furniture is the birds, and
  //     _buildBirds calls them "the only moving things in the sky, which is the
  //     point". None of them may cross into the plain — see the guard there.
  //     This is a deletion, and it is the most faithful line in the passage.
  //  3. THE MISSING ARE NAMED. Poliphilo says them one by one — no man, no
  //     beast, no bird, no house, no tent, no cote, no flock, no herd, no
  //     herdsman with oaten pipe. That utterance was keyed to `wood`, where it
  //     had nowhere to fire; it is keyed to `plain` now (src/data/poliphilo.json).
  //
  // What is deliberately NOT here, and must not be added: no tree, no rock, no
  // ruin, no path, no plaque, no marker of any kind. The station carries no
  // plaque for the same reason every other station carries one.
  //
  // Cost: the flowers are drawn twice over. Distant sorts live in the ground
  // TEXTURE (one material, one mesh) and only the near ones are geometry, and
  // those are flat single cards rather than the usual three-card tuft. Standing
  // at eye height on a 280 m plain you cannot tell, and it is the difference
  // between ~440 meshes and ~3 700. See ENGINEERING.md §1d for why that matters
  // now that the renderer is not going to be made faster.
  _buildSpaciousPlain() {
    const S = this.style, woodcut = S.key === 'woodcut';
    const W = WOOD;
    const rnd = (i, k) => { const v = Math.sin(i * 91.7 + k * 233.9) * 43758.5453; return v - Math.floor(v); };

    // The plain runs from the wood's southern edge to the far wall of the
    // walkable box (Walker bounds maxZ = 462).
    const Z0 = W.z1 + 2, Z1 = 458, HALF = 138;

    // ── The ground: green, and spotted with many sorts ──
    // Its own material rather than the shared meadow, because this is the one
    // ground in the world whose flowers are the subject and not the dressing.
    const plainMat = woodcut ? S.mat({ tone: 0.02, rim: 0 })
      : S.mat({ color: 0x3c5a26, roughness: 1.0 });
    if (!woodcut) {
      this._dress(plainMat, this._surfaceTexture({
        base: '#3e5a24', dark: '#223a14', light: '#688a3a', blobs: 90, speckle: 3600, repeat: 34,
        // "many sorted": the sorts are not named in the book, so no species is
        // invented — only the range of colour a flowered spring meadow has.
        flowers: ['#e8e2c0', '#f0d84a', '#d88ab0', '#b070c0', '#f4f0f8', '#e0603a'],
        flowerCount: 900,
      }), 0.12);
      // As everywhere else: _dress hands the albedo to roughnessMap too, which
      // turns every dark speck glossy and hangs a headlamp on the grass.
      plainMat.roughnessMap = null; plainMat.roughness = 1.0; plainMat.metalness = 0.0;
    }
    this._m(new THREE.PlaneGeometry(HALF * 2, Z1 - Z0 + 8), plainMat,
      0, 0.006, (Z0 + Z1) / 2, { rx: -Math.PI / 2, cast: false });

    // ── The near flowers, in sorts ──
    // Concentrated on the corridor the walker actually crosses; the texture
    // carries the rest. Each patch is ONE kind, because "diuersly spotted" is
    // spots of different sorts and not a stirred mixture.
    const SORTS = ['aster', 'marjoram', 'thyme', 'mint', 'goatsbeard', 'sowthistle',
                   'rue', 'groundpine', 'thistle', 'southernwood', 'balm', 'pellitory'];
    for (let p = 0; p < 46; p++) {
      const kind = SORTS[p % SORTS.length];
      const cx = -68 + rnd(p, 1) * 136;
      const cz = Z0 + rnd(p, 2) * (Z1 - Z0);
      const rad = 2.4 + rnd(p, 3) * 5.0;
      const n = 5 + Math.floor(rnd(p, 4) * 4);
      for (let i = 0; i < n; i++) {
        const a = rnd(p * 31 + i, 5) * Math.PI * 2;
        const r = Math.sqrt(rnd(p * 31 + i, 6)) * rad;
        this._tuft(cx + Math.cos(a) * r, 0.02, cz + Math.sin(a) * r, kind,
          0.34 + rnd(p * 31 + i, 7) * 0.3,
          { flat: true, ry: rnd(p * 31 + i, 8) * Math.PI });
      }
    }

    // ── "the tender leaues and thick grasse" ──
    // Between the spots, so the ground is nowhere bare. Rush is the table's
    // plain green blade: its flower is 3 px of brown and reads as grass.
    for (let i = 0; i < 130; i++) {
      this._tuft(-84 + rnd(i, 11) * 168, 0.02, Z0 + rnd(i, 12) * (Z1 - Z0),
        'rush', 0.3 + rnd(i, 13) * 0.26, { flat: true, ry: rnd(i, 14) * Math.PI });
    }
  },

  // The two "wooddie mountaines, which seemed to ioyne themselues together".
  // Built as two ridges of low-poly rock that converge on the portal: at the
  // piers the gap is 44 m against the portal's 38 m of lintel, so the building
  // closes the valley; southward they fall back to a 150 m gap and drop away,
  // so from the palm plain they read as two headlands with something between
  // them. Wooded on their lower slopes with the conifers that belong to a
  // mountain and NOT to the dark wood (1499 ll. 2800-2813).
  _valleyCliffs() {
    const S = this.style, woodcut = S.key === 'woodcut';
    const rockMat = woodcut ? S.mat({ tone: 0.16 })
      : S.mat({ color: 0x5e5a50, roughness: 1.0 });
    if (!woodcut) {
      this._dress(rockMat, this._surfaceTexture({ base: '#6a6458', dark: '#2e2a22', light: '#948b7c', blobs: 70, speckle: 3000, repeat: 6 }), 0.5);
      rockMat.roughnessMap = null; rockMat.roughness = 1.0;
    }
    const rnd = (i, k) => { const v = Math.sin(i * 91.7 + k * 269.5) * 43758.5453; return v - Math.floor(v); };

    // gap(z): half-width of the valley floor at z. Widened 2026-09-09 from 20 to
    // 24 at the portal, because the building that has to fill it grew: the base
    // storey now runs from the piers at x = ±9 out to the rock at ±24, and the
    // pyramid above it is 40 m wide against the 17.5 it was. The southern end is
    // unchanged, so the valley still opens out toward the palm plain.
    const gap = (z) => 24 + Math.max(0, z - 40) * 0.42;
    // How high the wall stands. It used to be 26 m at the portal, chosen "so the
    // building is not dwarfed at the moment of arrival" — with a 38 m pyramid on
    // a 12 m base there is no longer any danger of that, and a valley the book
    // calls shut needs walls that look like they could shut it.
    const high = (z) => 44 + Math.max(0, z - 40) * 0.30;

    let n = 0;
    for (const side of [-1, 1]) {
      for (let z = 38; z <= 176; z += 7) {
        const g0 = gap(z), h0 = high(z);
        // the wall itself: a stack of two blocks, jittered, so the face breaks
        for (let k = 0; k < 3; k++) {
          const i = n++;
          const w = 26 + rnd(i, 1) * 16;
          const hh = h0 * (0.62 + k * 0.5) * (0.85 + rnd(i, 2) * 0.3);
          const x = side * (g0 + w * 0.5 + k * 5 + rnd(i, 3) * 4);
          const blk = this._m(this._indexed(new THREE.DodecahedronGeometry(1, 0)), rockMat,
            x, hh * 0.42, z + (rnd(i, 4) - 0.5) * 5, { cast: true });
          blk.scale.set(w * 0.5, hh * 0.62, 7 + rnd(i, 5) * 6);
          blk.rotation.y = rnd(i, 6) * 0.6;
          blk.rotation.x = (rnd(i, 7) - 0.5) * 0.12;
        }
        // and it is a WALL: you cannot walk through the mountain
        this._wallCol(side > 0 ? gap(z) : -200, side > 0 ? 200 : -gap(z), z - 3.6, z + 3.6);
        // conifers on the lower slope — fir, larch and silver fir are the
        // mountain's trees (1499 l. 2813), not the dark wood's
        for (let t = 0; t < 2; t++) {
          const i = n++;
          if (rnd(i, 9) > 0.62) continue;
          this._tree(side * (gap(z) + 2 + rnd(i, 11) * 9), z + (rnd(i, 12) - 0.5) * 7,
            1.5 + rnd(i, 13) * 1.7, rnd(i, 14) > 0.45 ? 'fir' : (rnd(i, 15) > 0.5 ? 'pine' : 'cypress'));
        }
      }
    }
    // The curtain that carried the building to the mountain used to be built
    // here: two ashlar walls 11.2 m wide and 7.4 m tall, added 2026-09-08 so
    // that the portal was not a free-standing arch you could walk round on the
    // grass — which is exactly what Dallington p. 27 says you cannot do, the
    // porch being "placed betwixt and continued in building from the one and
    // the other of the mountaines".
    //
    // They are gone as of 2026-09-09, and their work is done properly: the
    // Great Portal now has a BASE STOREY twelve metres tall running from the
    // piers to the rock on both sides, which is what the book describes and
    // what the curtains were standing in for. See portal.js, _buildGreatPortal.
    // The collider that keeps the walker out of the mountain goes with it.
    //
    // The valley is still shut behind the walker at the south end, below.

    // The valley is shut behind the walker too, at the south end of the
    // approach: the mountains close the far side of the palm plain except for
    // the way back to the mead. (Dall. p. 27: "no man could go further forward
    // or backe againe" cuts both ways.)
    for (const side of [-1, 1]) {
      for (let z = 176; z <= 200; z += 8) {
        const i = n++;
        const blk = this._m(this._indexed(new THREE.DodecahedronGeometry(1, 0)), rockMat,
          side * (86 + rnd(i, 21) * 10), 22 + rnd(i, 22) * 14, z, { cast: true });
        blk.scale.set(16 + rnd(i, 23) * 10, 26 + rnd(i, 24) * 14, 9 + rnd(i, 25) * 6);
        blk.rotation.y = rnd(i, 26) * 0.7;
      }
      this._wallCol(side > 0 ? 76 : -200, side > 0 ? 200 : -76, 172, 204);
    }
  },

  _inClearing(x, z) {
    for (const [cx, cz, r] of WOOD_CLEARINGS) {
      const d = Math.hypot(x - cx, z - cz);
      if (d < r) return 1 - d / r;
    }
    return 0;
  },

  // One tree of the dark wood. The garden's `_tree` is the wrong instrument
  // here: its crown is closed with half-metre leaf cards at a coverage of
  // ~8πr²/size², which for a fourteen-metre crown is five thousand cards, and
  // for two hundred and forty trees is two million. A forest tree is read from
  // underneath as a MASS — trunks, big limbs, and a dark ceiling with holes in
  // it — so the crown here is three opaque leaf-mass shells (which are what
  // actually casts the shade) with a dozen large sprays hung under and around
  // them to break the silhouette and dapple the floor. Twenty-odd meshes a
  // tree, all of which the draw-call compiler folds away.
  // Bark, cached by species. `this.style.mat()` returns a NEW material every
  // call, and the draw-call compiler buckets by material uuid — so a bark made
  // inside the tree builder gives every one of the wood's seven hundred trunks
  // and thickets its own bucket, which is seven hundred draw calls for wood
  // that should be one. (2026-09-08. The garden's `_tree` predates this and
  // gets away with it at forty trees.)
  _barkMat(species) {
    this._barkMats = this._barkMats || {};
    if (this._barkMats[species]) return this._barkMats[species];
    const SP = SPECIES[species] || SPECIES.oak;
    const m = this.style.key === 'woodcut' ? this._trunkMat
      : this.style.mat({ color: SP.bark, roughness: 0.96 });
    m.userData.roll = m.userData.roll || `the bark of ${species}`;
    this._barkMats[species] = m;
    return m;
  },

  _forestTree(x, z, h, species, seed) {
    const S = this.style, woodcut = S.key === 'woodcut';
    const SP = SPECIES[species] || SPECIES.oak;
    const rnd = (k) => this._treeRand(seed, k);
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rnd(11) * Math.PI * 2;
    this.scene.add(g);

    const bark = this._barkMat(species);
    // A forest tree is drawn up by its neighbours: the crown starts high and
    // the bole below it is clear, which is why a wood is a hall of columns.
    const CB = h * (0.40 + rnd(3) * 0.10);           // crown base, 10–17 m up
    const R = 0.30 + rnd(4) * 0.26 + h * 0.006;      // 0.45–0.78 m at the butt

    // Root flare, and the roots that trip him: "spesse fiate negli RADICONI DA
    // TERRA SCOPERTI cespitando" — often stumbling on the roots laid bare out
    // of the ground (1499 l. 580).
    this._m(new THREE.CylinderGeometry(R * 1.25, R * 2.2, 0.9, 8), bark, 0, 0.45, 0, { parent: g });
    for (let i = 0; i < 3; i++) {
      const a = rnd(20 + i) * Math.PI * 2, L = R * (3.0 + rnd(30 + i) * 2.4);
      // A root laid along the ground, running out from the butt and sinking
      // into it. Thin, and tilted down, or they read as logs propped on spokes.
      const rt = this._m(new THREE.CylinderGeometry(R * 0.10, R * 0.34, L, 5), bark,
        Math.cos(a) * L * 0.46, R * 0.16, Math.sin(a) * L * 0.46, { parent: g, cast: false });
      rt.rotation.order = 'YXZ';
      rt.rotation.set(Math.PI / 2 - 0.16, -a + Math.PI / 2, 0);
    }
    // The bole, then a thinner shaft on into the crown
    this._m(new THREE.CylinderGeometry(R * 0.62, R, CB, 8), bark, 0, CB / 2, 0, { parent: g });
    this._m(new THREE.CylinderGeometry(R * 0.2, R * 0.62, h * 0.34, 7), bark, 0, CB + h * 0.17, 0, { parent: g });

    // Boughs out into the crown
    const CY = CB + h * 0.22;                        // the crown's middle
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + rnd(5) * 3;
      const reach = (SP.crown[0] || 2) * (h * 0.19);
      this._limb(g, bark, 0, CB * 0.94, 0,
        Math.cos(a) * reach, CY + (rnd(40 + i) - 0.4) * h * 0.09, Math.sin(a) * reach,
        R * 0.5, R * 0.16);
    }

    // The vault: opaque leaf-mass shells. These are what makes the floor dark,
    // and they are the reason the crowns must overlap — a canopy with sky
    // between the trees is not a canopy.
    this._coreMat = this._coreMat || (woodcut ? this._leafMat
      : this.style.mat({ color: 0x0f1d0a, roughness: 1, metalness: 0 }));
    this._coreMat.userData.roll = this._coreMat.userData.roll || 'the shade inside a crown';
    // A closed canopy is not a row of crowns that touch: it is crowns that
    // INTERLOCK. At 14 m spacing the mass has to be about 24 m across, so the
    // shells run to r = CR and CR is 0.42 h. The first pass used 0.62 CR and
    // the wood had sky in it from every angle -- you could see the valley
    // cliffs 130 m away straight through it, which is the opposite of the
    // book's "non penetrava l'alma luce".
    const CR = h * (0.38 + rnd(6) * 0.09);
    const thin = this._inClearing(x, z) > 0 ? 0.4 : 1;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + rnd(50 + i) * 2.2;
      const rr = CR * (0.3 + rnd(60 + i) * 0.34);
      const sh = this._m(new THREE.SphereGeometry(1, 10, 8), this._coreMat,
        Math.cos(a) * rr, CY + (rnd(70 + i) - 0.5) * h * 0.15, Math.sin(a) * rr,
        { parent: g, cast: true, receive: false });
      const k = CR * (0.92 - i * 0.09) * thin;
      sh.scale.set(k, k * 0.66, k);
    }
    // Sprays hung under and around the mass. A card is a branch here, not a
    // leaf: three metres, from the same painted spray the garden trees use.
    const mat = this._leafCardMat(species);
    const geo = this._cardGeo = this._cardGeo || new THREE.PlaneGeometry(1, 1);
    const NCARD = Math.round(20 * thin);
    for (let i = 0; i < NCARD; i++) {
      const th = rnd(i * 5 + 1) * Math.PI * 2;
      const ph = Math.acos(2 * rnd(i * 5 + 2) - 1);
      const rr = 0.7 + 0.3 * rnd(i * 5 + 3);
      const m = new THREE.Mesh(geo, mat);
      m.position.set(Math.sin(ph) * Math.cos(th) * CR * rr,
                     CY + Math.cos(ph) * CR * 0.6 * rr,
                     Math.sin(ph) * Math.sin(th) * CR * rr);
      m.rotation.set(rnd(i * 5 + 4) * Math.PI, rnd(i * 5 + 5) * Math.PI, rnd(i * 7 + 9) * Math.PI);
      const sc = CR * (0.24 + rnd(i * 3 + 11) * 0.16);
      m.scale.set(sc, sc, 1);
      m.castShadow = i < 9; m.receiveShadow = false;
      g.add(m);
    }
    // The elm carries its vine — "ulmi ruvidi ALLE FOECUNDE VITE GRATI"
    if (species === 'elm' && !woodcut) {
      this._vineMat = this._vineMat || this.style.mat({ color: 0x4a6a2a, roughness: 0.9 });
      const vine = this._vineMat;
      for (let i = 0; i < 4; i++) {
        this._m(new THREE.TorusGeometry(R * 1.2, R * 0.16, 5, 10, Math.PI * 1.4), vine,
          0, CB * (0.18 + i * 0.2), 0, { parent: g, cast: false, rx: Math.PI / 2, ry: i * 1.4 });
      }
    }
    this._circleCol(x, z, R * 2.1);
    this._shadeSpots.push({ x, z, r: CR * 0.9, h: CY });
    return g;
  },

  // A sapling or a bramble-brake: one dark core and a handful of big sprays.
  // Cheap on purpose — see the note where it is called.
  _thicket(x, z, h, species, seed) {
    const rnd = (k) => this._treeRand(seed, k);
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rnd(1) * Math.PI * 2;
    this.scene.add(g);
    const bark = this._barkMat('elm');
    this._m(new THREE.CylinderGeometry(0.04 * h, 0.07 * h, h * 0.5, 6), bark, 0, h * 0.25, 0, { parent: g });
    this._coreMat = this._coreMat || (this.style.key === 'woodcut' ? this._leafMat
      : this.style.mat({ color: 0x0f1d0a, roughness: 1, metalness: 0 }));
    const core = this._m(new THREE.SphereGeometry(1, 8, 6), this._coreMat, 0, h * 0.62, 0,
      { parent: g, cast: true, receive: false });
    core.scale.set(h * 0.34, h * 0.3, h * 0.34);
    const mat = this._leafCardMat(species);
    const geo = this._cardGeo = this._cardGeo || new THREE.PlaneGeometry(1, 1);
    for (let i = 0; i < 8; i++) {
      const th = rnd(i * 3 + 1) * Math.PI * 2, ph = Math.acos(2 * rnd(i * 3 + 2) - 1);
      const m = new THREE.Mesh(geo, mat);
      m.position.set(Math.sin(ph) * Math.cos(th) * h * 0.36,
                     h * 0.6 + Math.cos(ph) * h * 0.26,
                     Math.sin(ph) * Math.sin(th) * h * 0.36);
      m.rotation.set(rnd(i * 3 + 4) * Math.PI, rnd(i * 3 + 5) * Math.PI, rnd(i * 3 + 6) * Math.PI);
      const sc = h * (0.32 + rnd(i * 3 + 7) * 0.18);
      m.scale.set(sc, sc, 1);
      m.castShadow = i < 3; m.receiveShadow = false;
      g.add(m);
    }
    this._circleCol(x, z, h * 0.14);
    return g;
  },

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
    // Moved with the wood, 2026-09-08. The spring and the river are chapter I's
    // and belong at the wood's northern edge, where Poliphilo finds them on
    // getting OUT of it (Dall. p. 18) -- not beside the Great Portal, which is
    // where they sat when the wood was eight metres from the pyramid. OX/OZ
    // carries the whole watercourse, its stones, its reeds and its plaque.
    const OX = 3.6, OZ = 180.5;
    const off = ([x, z]) => [x + OX, z + OZ];
    const pts = [[-3.6, 37.5], [-6.4, 39.2], [-9.8, 40.4], [-13.4, 42.6], [-17.6, 43.4], [-21.8, 45.6], [-26.4, 46.2], [-30.6, 48.0], [-35.4, 48.8], [-40.5, 50.6], [-44, 52]].map(off);
    const w = this._waterMat();
    // a pale gravel bed under the water, or the stream is invisible on the duff
    const bed = woodcut ? S.mat({ tone: 0.02, rim: 0 }) : S.mat({ color: 0xb8ad94, roughness: 0.95 });
    if (!woodcut) this._dress(bed, this._surfaceTexture({ base: '#b8ad94', dark: '#6a6050', light: '#e0d8c4', blobs: 40, speckle: 5000, repeat: 6 }), 0.25);
    this.scene.add(this._ribbon(pts.map(([x, z]) => new THREE.Vector3(x, 0.014, z)), 1.9, bed));
    this.scene.add(this._ribbon([[-13.4, 42.6], [-14.8, 45.4], [-15.6, 48.6], [-16.2, 51.5]].map(off).map(([x, z]) => new THREE.Vector3(x, 0.013, z)), 1.2, bed));
    const ribbon = this._ribbon(pts.map(([x, z]) => new THREE.Vector3(x, 0.025, z)), 1.3, w);
    this.scene.add(ribbon);
    const branch = this._ribbon([[-13.4, 42.6], [-14.8, 45.4], [-15.6, 48.6], [-16.2, 51.5]].map(off).map(([x, z]) => new THREE.Vector3(x, 0.024, z)), 0.7, w);
    this.scene.add(branch);
    const stone = woodcut ? S.mat({ tone: 0.12 }) : S.mat({ color: 0x6a6660, roughness: 0.95 });
    const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
    // the stones lifted up by nature, and two trunks fallen across
    for (let i = 0; i < 16; i++) {
      const t = 0.1 + rnd(i, 1) * 0.85, k = Math.floor(t * (pts.length - 1)), f = t * (pts.length - 1) - k;
      const x = pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f + (rnd(i, 2) - 0.5) * 1.0, z = pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f + (rnd(i, 3) - 0.5) * 1.0;
      this._m(this._indexed(new THREE.DodecahedronGeometry(0.12 + rnd(i, 4) * 0.18, 0)), stone, x, 0.06, z, { cast: false }).rotation.set(rnd(i, 5) * 3, rnd(i, 6) * 3, 0);
    }
    for (const [x, z, ry] of [[-11.5 + OX, 41.4 + OZ, 0.5], [-28.5 + OX, 47.0 + OZ, -0.35]]) {
      const trunk = this._m(new THREE.CylinderGeometry(0.16, 0.2, 3.0, 8), this._trunkMat, x, 0.2, z, { outline: true });
      trunk.rotation.z = Math.PI / 2; trunk.rotation.y = ry;
    }
    // the sweet herbs and water flowers about the spring
    for (let k = 0; k < 10; k++) { const a = k * 0.63; this._tuft(pts[0][0] + Math.cos(a) * 1.25, 0.02, pts[0][1] + Math.sin(a) * 1.25, k % 2 ? 'waterflower' : 'mint', 0.3); }
    // reeds and rushes on the banks, osiers leaning over the water
    for (let i = 0; i < 44; i++) {
      const t = 0.05 + rnd(i, 7) * 0.9, k = Math.floor(t * (pts.length - 1)), f = t * (pts.length - 1) - k;
      const dx = pts[k + 1][0] - pts[k][0], dz = pts[k + 1][1] - pts[k][1], L = Math.hypot(dx, dz);
      const nx = -dz / L, nz = dx / L, side = i % 2 ? 1 : -1, off = 0.85 + rnd(i, 8) * 0.5;
      const x = pts[k][0] + dx * f + nx * side * off, z = pts[k][1] + dz * f + nz * side * off;
      this._tuft(x, 0.02, z, i % 3 === 0 ? 'rush' : 'reed', 0.5 + rnd(i, 9) * 0.35);
    }
    for (const [x, z] of [[-8.6, 41.9], [-19.2, 42.2], [-24.6, 47.9], [-33.2, 47.3]].map(off)) this._tree(x, z, 1.1, 'willow');
    this._plaque({ main: 'A PLEASANT SPRING OR HEAD OF WATER', sub: 'DIVERS SWEET HEARBES AND WATER FLOWERS · A CLEARE AND CHRYSTALLINE CVRRENT STREAME · DALLINGTON P. 18' },
      2.4, 0.32, -3.6 + OX, 0.7, 35.9 + OZ, 0, true);
  },

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
  },

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
  },

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
  },
};
