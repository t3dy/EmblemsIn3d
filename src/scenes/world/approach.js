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
import { EYE, WOOD_CLEARINGS, WOOD, WITNESS_POSES, WITNESS_AT, SPECIES,
         PYRAMID_W, PYRAMID_CLEAR, VALLEY_Z0, VALLEY_Z1, VALLEY_LEN,
         PLAN_EXTENT, PLAN_SITES } from './constants.js?v=14';

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

    // ── STAGE 2: ONE sward, the size of the plan (2026-09-20) ──────────────
    //
    // There used to be four ground planes: a 520 m square under the garden, a
    // 1 200 x 688 under the approach, a 1 120 x 280 beyond the wood, and a
    // gravel circle on the palm plain — each sized by hand to the cluster above
    // it, each grown x4 at stage 1, and every one of them a place the walker
    // could step off the world if a precinct moved and its floor did not.
    //
    // At 13.7 km that bookkeeping is not worth doing. The ground is a property
    // of the PLAN, so it is laid once from PLAN_EXTENT with a margin, and every
    // precinct that moves moves over ground that is already there. A plane is
    // two triangles and one draw call whatever its size; the cost of this is
    // nil and the class of bug it removes is the one that cost a session.
    //
    // The two HOLES stay local to the Polyandrion — they are the grated oculus
    // of the ciborium and the stair-pit of the crypt door (ch. XIX, p. 247: "a
    // blind, sloping little stair descending"), so the ground has to open for
    // them and a 14 km plane cannot carry a 1 m hole. They are cut in a 240 m
    // apron that rides the Polyandrion's own precinct group, a centimetre above
    // the world sward.
    // The paths are a SKIN on the sward, 3 cm above it, and at 13.7 km with a
    // logarithmic depth buffer 3 cm is below the depth resolution most of the
    // way down the itinerary: the processional axis came out as a ladder of
    // stripes where the two planes traded places pixel by pixel. Raising the
    // path would put a visible lip on it. Polygon offset is the right tool —
    // it biases the path's depth at rasterisation without moving the geometry,
    // so the strip stays flush with the ground it is worn into and still wins.
    // Every overlay on the sward needs it, which is why it is set on the shared
    // material rather than per mesh.
    pathMat.polygonOffset = true;
    pathMat.polygonOffsetFactor = -4;
    pathMat.polygonOffsetUnits = -4;

    const M = 400;                                     // margin beyond the plan's own edges
    const GW = PLAN_EXTENT.widthMax + M * 2;
    const GD = (PLAN_EXTENT.zSouth - PLAN_EXTENT.zNorth) + M * 2;
    const GZ = (PLAN_EXTENT.zSouth + PLAN_EXTENT.zNorth) / 2;
    this._m(new THREE.PlaneGeometry(GW, GD), groundMat, 0, -0.02, GZ, { rx: -Math.PI / 2, cast: false });
    this._groundMat = groundMat;
    this._pathMat = pathMat;

    // The processional axis: the itinerary itself, wood to shore, one strip the
    // length of the plan. It used to be 344 m long because the world was.
    this._m(new THREE.PlaneGeometry(3.4, GD), pathMat, 0, 0.012, GZ, { rx: -Math.PI / 2, cast: false });

    // The fences that keep the walker on the ground he has. South of the Great
    // Portal it is the valley's cliffs that hold him; everywhere else it is
    // these two, now at the plan's own width rather than at 600 m.
    const EDGE = GW / 2 - 8;
    this._wallCol(EDGE, EDGE + 400, PLAN_EXTENT.zNorth - M, PLAN_EXTENT.zSouth + M);
    this._wallCol(-(EDGE + 400), -EDGE, PLAN_EXTENT.zNorth - M, PLAN_EXTENT.zSouth + M);
    this._wallCol(-(EDGE + 400), EDGE + 400, PLAN_EXTENT.zNorth - M - 400, PLAN_EXTENT.zNorth - M);
    this._wallCol(-(EDGE + 400), EDGE + 400, PLAN_EXTENT.zSouth + M, PLAN_EXTENT.zSouth + M + 400);
  },

  // The cross paths and the two roundels of the palace precinct, which used to
  // be laid with the world's ground and are local to the palace now.
  _buildPalacePaths() {
    const pathMat = this._pathMat;
    this._m(new THREE.PlaneGeometry(152, 2.8), pathMat, 0, 0.012, 0, { rx: -Math.PI / 2, cast: false });
    this._m(new THREE.PlaneGeometry(152, 2.8), pathMat, 0, 0.012, 80, { rx: -Math.PI / 2, cast: false });
    this._m(new THREE.CircleGeometry(7, 40), pathMat, 0, 0.014, 0, { rx: -Math.PI / 2, cast: false });
    this._m(new THREE.CircleGeometry(8.5, 40), pathMat, 0, 0.014, -80, { rx: -Math.PI / 2, cast: false });
  },

  // The Polyandrion's apron, with the two holes cut in it. Built inside that
  // precinct's group, so it moves with the tombs it belongs to.
  _buildTombApron() {
    this._m(this._holedGround(240, 240, 120, -108,
      [[120, -108, 0.8], [125.3, -109.0, 1.15, 0.52]]),
      this._groundMat, 120, 0.0, -108, { rx: -Math.PI / 2, cast: false });
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

  // ── The approach, split into its three precincts (2026-09-20) ───────────
  //
  // This was one `_buildApproach` covering the great oak, the palm plain and
  // the valley together. Stage 2 of the true-scale plan moves those three by
  // 2 211 m, 1 804 m and 0 m respectively — they are three precincts with three
  // shifts — so a single builder could no longer be wrapped in one `_placeAt`.
  // Nothing inside has moved: the three pieces are the same code under three
  // headings, and HPWorldScene now calls each inside its own precinct's group.
  //
  // The connective GROUND is no longer built here at all. At 13.7 km the strip
  // between precincts is a property of the plan, not of the approach, so it is
  // laid once by `_buildGround` from PLAN_EXTENT. See approach.js's old note
  // about the walker "falling off the world between them" — that is now the
  // world sward's job.

  // The great oak, in a spacious green mead (ch. I end).
  _buildGreatOak() {
    const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
    // ── The great oak, in a spacious green mead (ch. I end) ──
    // "vnder a broade and mightye Oke full of Acornes, standing in the middest
    // of a spatious and large green meade, extending forth his thicke and
    // leauie armes to make a coole shadowe" (Dall. p. 20). He lies down on his
    // left side here and falls into the second dream. It is a long way from the
    // river on purpose: he lost the water chasing the song.
    // Position x4 with SPREAD (2026-09-17, DECISIONS.md 54): the old anchor
    // was W.z0-32 = 193 (before WOOD itself moved); hardcoded at 4x (772)
    // rather than left W-relative, because WOOD now translates by its OWN
    // centre and the two are no longer the same move. Matches great_oak's
    // HP_STATIONS pos (36, 712) closely enough for the mead around the tree.
    const OAKZ = 772;
    this._forestTree(36, OAKZ, 31, 'oak', 4242);
    for (let i = 0; i < 5; i++) {                        // a few outliers, well apart
      const a = rnd(i, 41) * Math.PI * 2, r = 26 + rnd(i, 42) * 30;
      this._forestTree(36 + Math.cos(a) * r, OAKZ + Math.sin(a) * r * 0.7,
        18 + rnd(i, 43) * 8, i % 2 ? 'ash' : 'oak', 900 + i * 31);
    }

  },

  // The valley of the approach (ch. II-III): ten stadia of closed floor between
  // the palm plain and the court before the porch, and the rock walls that
  // close it. `valley` takes a ZERO shift in stage 2 — its north edge is the
  // court's mouth at z 148.4 and already is — so what stage 2 does to it is
  // LENGTH: _valleyCliffs now runs the plan's full 1 850 m rather than the 552
  // it ran at SPREAD = 4.
  _buildValley() {
    this._valleyCliffs();
  },

  // The sandy plain of the palm, and the wolf that crosses it (ch. II).
  _buildPalmPlain() {
    const S = this.style, woodcut = S.key === 'woodcut';
    const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
    // "a sandie or grauelly plaine, yet bespotted with greene tuffes"
    const gravelMat = woodcut ? S.mat({ tone: 0.05, rim: 0 })
      : S.mat({ color: 0x6e6248, roughness: 1.0 });
    if (!woodcut) {
      this._dress(gravelMat, this._surfaceTexture({ base: '#6e6446', dark: '#3e3826', light: '#8e8260', blobs: 60, speckle: 5200, repeat: 20 }), 0.3);
      gravelMat.roughnessMap = null; gravelMat.roughness = 1.0;
    }
    this._m(new THREE.CircleGeometry(31, 26), gravelMat, -24, 0.010, 520, { rx: -Math.PI / 2, cast: false });

    // ── the palm and its tufts ──
    // "a delicate valley, in the which did rise a small mounting of no great
    // height, sprinkled heare and there with young Okes, Ashes, Palme trees
    // broadleaued, Aesculies, Holme, Chestnut, Sugerchist, Poplars, wilde
    // Oliue… Thus walking solitarily betwixt the trees, GROWING DISTANTLY ONE
    // FROM ANOTHER" (Dall. p. 23). Open and sunlit — the exact opposite of the
    // wood, and the contrast is the point.
    // Position and scatter range went x4 with SPREAD (2026-09-17). They stay as
    // they are in stage 2: the whole plain is one precinct now and moves under
    // a single `_placeAt`, so these are local coordinates within it.
    const VALLEY = ['oak', 'ash', 'laurel', 'olive', 'plane', 'oak', 'olive', 'ash'];
    for (let i = 0; i < 34; i++) {
      const x = -312 + rnd(i, 51) * 624;
      const z = 600 + rnd(i, 52) * 168;
      if (Math.abs(x) < 48 && z < 672) continue;         // keep the sightline open
      this._tree(x, z, 1.5 + rnd(i, 53) * 1.4, VALLEY[Math.floor(rnd(i, 54) * VALLEY.length) % VALLEY.length]);
    }

    // ── The sandy plain, and the palm ──
    // "a faire Palme tree with his leaues like the Culter of a plowe, and
    // abounding with sweet and pleasant fruite… an elect and chosen signe of
    // victorie" (Dall. p. 23). One tree, alone on the gravel.
    this._tree(-24, 512, 2.4, 'palm');
    for (let i = 0; i < 150; i++) {                      // "bespotted with greene tuffes"
      const a = rnd(i, 61) * Math.PI * 2, r = 2 + rnd(i, 62) * 28;
      this._tuft(-24 + Math.cos(a) * r, 0.02, 520 + Math.sin(a) * r, 'mint', 0.55 + rnd(i, 63) * 0.4);
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
    this._npc('wolf', wolf, 84, 528, 1.35, { label: 'The Wolf', labelY: 1.6, sway: 0.03 });
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
  // Chapter X (1499 pp. 124-127), the gardens Eleuterylida's handmaids show
  // after the banquet: one of glass, one of silk, and a counterfeit scent.
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
    // ── Where they are, and why (2026-09-13) ─────────────────────────────────
    //
    // Chapter X, not XII-XIII. Our translation: the glass garden is 1499 p. 124
    // and the silk garden p. 127, and both pages are headed Chapter X. The tour
    // had them tagged XII-XIII, which is the rest of Polia's blazon.
    //
    // They ADJOIN THE QUEEN'S PALACE, one against each side wall -- p. 127, the
    // silk garden is "adjoining the right wall of the proud, great and royal
    // palace", and Dallington p. 175 puts the glass one "vppon the lefte side of
    // the incomparable pallace". Poliphilo has just "turned mee about towardes
    // the conspicuous Poarch, to beholde diligently the artificious Pallaice"
    // (p. 174), so he is FACING the palace's east front when left and right are
    // named: left is south (+z) and right is north (-z). _buildPalace stands at
    // (-20.5, 0) on a stylobate 16.2 x 12.2, front to the east.
    //
    // Their history: built at (-22, 52), in the valley, BEFORE the Great Portal;
    // pushed to (-28, 82) on 2026-09-09 when the piazza needed that ground; and
    // only now beside the palace, which is the ticket
    // bug-artificial-gardens-wrong-side-of-portal.
    //
    // THE FOOTPRINT IS SMALLER THAN THE BOOK'S, and that is recorded, not hidden.
    // p. 124 makes each garden "as great as that where the majestic residence
    // stood" -- the palace plot, 16 x 12 here. A top-down height render of the
    // palace side (2026-09-13) found open ground against each flank of about
    // 8 x 5.5 m and no more: the doors wall and its tree canopy close the south
    // strip at z 13, the Temple of Venus closes the north one at x -24. So each
    // garden is its own flank's width and about half the book's compass. The
    // RELATION the book states -- one garden against each side wall -- is kept
    // exactly; the area is what gives.
    //
    // THE LAYOUT IS THE BOOK'S, where the old one was a pair of circles. p. 124:
    // "round about, cleaving to the walls, there stretched fitted garden-boxes,
    // in which, in place of greenery, every plant was of the purest glass --
    // box-trees clipped ... with their stems of gold. Between the one and the
    // other of which there alternated a cypress, its height not exceeding two
    // paces, and of the box one." So: raised beds along the wall, box and cypress
    // alternating in them. The silk garden is "of equal compass with the glass
    // one, with a like disposition of raised beds" (p. 127), and "in the middle
    // of the area there stood a round enclosure, with a raised dome of little
    // rods of gold ... covered with manifold flower-bearing rose-trees."
    const rnd = (i, k) => { const v = Math.sin(i * 71.3 + k * 149.7) * 43758.5453; return v - Math.floor(v); };
    const gold = woodcut ? S.mat({ tone: 0.04, rim: 1 })
      : S.mat({ color: 0xd8b048, metalness: 0.92, roughness: 0.22 });

    // a raised bed with a gold lip, running along x
    const bed = (x0, x1, z, faceM) => {
      const L = x1 - x0, cx = (x0 + x1) / 2;
      this._m(new THREE.BoxGeometry(L + 0.5, 0.34, 0.78), faceM, cx, 0.17, z, { cast: false });
      for (const dz of [-0.4, 0.4]) {
        this._m(new THREE.BoxGeometry(L + 0.56, 0.05, 0.06), gold, cx, 0.36, z + dz, { cast: false });
      }
      this._wallCol(x0 - 0.25, x1 + 0.25, z - 0.4, z + 0.4);
    };

    // ── I. The garden of glass, against the palace's SOUTH (left) wall ──────
    // SPREAD = 4 (2026-09-17, DECISIONS.md 54): shifted by the SAME -61.5 as
    // _buildPalace's own CX (-20.5 -> -82), so the gardens stay against its
    // walls; z is untouched because the palace's own CZ is 0, unaffected by
    // x4. See the note above at _buildPalace stands at (-82, 0).
    const GX0 = -88, GX1 = -80, GA = 7.1, GB = 12.0;
    const glassM = woodcut ? S.mat({ tone: 0.02, rim: 1 })
      : S.mat({ color: 0xcfe4e8, roughness: 0.06, metalness: 0.1,
                transparent: true, opacity: 0.42, side: THREE.DoubleSide });
    // "the faces of which, of glass plates gilded within, and with a wonderful
    // graving of a most curious history" -- the beds' own faces
    const giltGlass = woodcut ? S.mat({ tone: 0.08, rim: 1 })
      : S.mat({ color: 0xd9c07a, roughness: 0.12, metalness: 0.55 });
    for (const z of [GA, GB]) {
      bed(GX0, GX1, z, giltGlass);
      for (let i = 0; i <= 8; i++) {
        const x = GX0 + i;
        // the stems "of gold, such material being brought thither"
        this._m(new THREE.CylinderGeometry(0.035, 0.05, 0.5, 6), gold, x, 0.6, z, { cast: false });
        if (i % 2 === 0) {
          // cypress, "not exceeding two paces": 2.96 m with its stem
          this._m(new THREE.ConeGeometry(0.34, 2.46, 10), glassM, x, 1.58, z, { outline: true });
        } else {
          // box, one pace, "clipped": a ball
          this._m(new THREE.SphereGeometry(0.38, 12, 10), glassM, x, 1.1, z, { outline: true });
        }
      }
    }
    // "great round balles of glasses lyke gunne stones... lyke pearles shining",
    // on the ground between the beds -- Dallington p. 176 names them first
    for (let i = 0; i < 34; i++) {
      const rad = 0.055 + rnd(i, 3) * 0.075;
      this._m(new THREE.SphereGeometry(rad, 9, 7), glassM,
        GX0 + 0.2 + rnd(i, 1) * (GX1 - GX0 - 0.4), rad, GA + 0.7 + rnd(i, 2) * (GB - GA - 1.4));
    }
    this._plaque({ main: 'THE GARDEN OF GLASSE',
      sub: 'VPON THE LEFTE SIDE OF THE PALLACE · BOXE AND CYPRESSE OF GLASSE · ROVND BALLES LYKE PEARLES' },
      3.0, 0.4, GX0 - 0.9, 0.5, (GA + GB) / 2, -Math.PI / 2, true);

    // ── II. The garden of silk, against the palace's NORTH (right) wall ─────
    // Same -61.5 x shift as the glass garden above.
    const SX0 = -85, SX1 = -77, SA = -7.1, SB = -12.6;
    const silkLeaf = woodcut ? S.mat({ tone: 0.13, rim: 1 })
      : S.mat({ color: 0x8fae86, roughness: 0.26, metalness: 0.05, side: THREE.DoubleSide });
    const pearlM = woodcut ? S.mat({ tone: 0.02, rim: 1 })
      : S.mat({ color: 0xf4efe4, roughness: 0.18, metalness: 0.15 });
    // "the faces of the beds rewoven in tapestry stitch with little histories of
    // love and of hunting, in threads of gold and silver and silk"
    const tapestry = woodcut ? S.mat({ tone: 0.16, rim: 1 })
      : S.mat({ color: 0x7a4a5e, roughness: 0.9 });
    for (const z of [SA, SB]) {
      bed(SX0, SX1, z, tapestry);
      for (let i = 0; i <= 8; i++) {
        const x = SX0 + i;
        this._m(new THREE.CylinderGeometry(0.035, 0.05, 0.5, 6), gold, x, 0.6, z, { cast: false });
        if (i % 2 === 0) {
          this._m(new THREE.ConeGeometry(0.34, 2.46, 10), silkLeaf, x, 1.58, z, { outline: true });
        } else {
          this._m(new THREE.SphereGeometry(0.38, 12, 10), silkLeaf, x, 1.1, z, { outline: true });
        }
        // "not without a most apt sowing among them of gems" -- the pearls
        this._m(new THREE.SphereGeometry(0.04, 7, 6), pearlM, x + 0.18, 1.2 + (i % 2) * 0.2, z - 0.12, { cast: false });
      }
    }
    // the ground "of green silk pile, like a most notable meadow"
    const pile = woodcut ? S.mat({ tone: 0.18 }) : S.mat({ color: 0x4f7a3e, roughness: 1.0 });
    this._m(new THREE.PlaneGeometry(SX1 - SX0 + 0.6, Math.abs(SB - SA) - 0.9), pile,
      (SX0 + SX1) / 2, 0.03, (SA + SB) / 2, { rx: -Math.PI / 2, cast: false });

    // the round enclosure, "a raised dome of little rods of gold", with roses
    const DX = (SX0 + SX1) / 2, DZ = (SA + SB) / 2, DR = 1.7;
    for (let k = 0; k < 3; k++) {
      const arc = this._m(new THREE.TorusGeometry(DR, 0.03, 5, 22, Math.PI), gold, DX, 0, DZ, { cast: false });
      arc.rotation.y = (k / 3) * Math.PI;
    }
    const ring = this._m(new THREE.TorusGeometry(DR, 0.03, 5, 28), gold, DX, 0.9, DZ, { cast: false });
    ring.rotation.x = Math.PI / 2;
    const roseM = woodcut ? S.mat({ tone: 0.1 }) : S.mat({ color: 0xc8404e, roughness: 0.6 });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2, t = 0.35 + (i % 3) * 0.2;
      const r = DR * Math.cos(t * Math.PI / 2), y = DR * Math.sin(t * Math.PI / 2);
      this._m(new THREE.SphereGeometry(0.1, 8, 7), roseM, DX + Math.cos(a) * r, y, DZ + Math.sin(a) * r, { outline: true });
    }
    // "beneath which roof, in the going-round form, were seats of ruddy jasper"
    const jasper = woodcut ? S.mat({ tone: 0.14 }) : S.mat({ color: 0x9a3a2e, roughness: 0.45 });
    const seat = this._m(new THREE.TorusGeometry(DR * 0.72, 0.16, 6, 24), jasper, DX, 0.36, DZ, { cast: false });
    seat.rotation.x = Math.PI / 2;
    this._circleCol(DX, DZ, DR * 0.9);

    // ── III. The counterfeit scent ──
    // The third garden cannot be modelled, and the book is precise about why:
    // the fragrance is FAKED -- "from the flowers did breath a sweet fragrancie by
    // some cleare washing with oyle for that purpose." Staged with the world's
    // own device for scent, the fume (PLEASURES.md §2), over the silk roses,
    // which have no scent of their own.
    this._fume(DX, 1.9, DZ, { rise: 2.0, drift: 0.4, count: 16, speed: 0.13 });

    this._plaque({ main: 'THE GARDEN OF SILKE',
      sub: 'ADJOINING THE RIGHT WALL OF THE PALLACE · A DOME OF RODDES OF GOLDE · A FRAGRANCIE WASHED ON WITH OYLE' },
      3.0, 0.4, SX0 - 0.9, 0.5, DZ, -Math.PI / 2, true);
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
    // walkable box (Walker bounds maxZ, now 1848 -- SPREAD = 4, DECISIONS.md
    // 54). Z1 is old Z1 x4 (458 -> 1832), comfortably past the 'plain'
    // station's new pos (0, 1792) + its 26 m radius. HALF (half-width) is
    // left alone -- nothing spreads sideways here, only away from the wood.
    const Z0 = W.z1 + 2, Z1 = 1832, HALF = 138;

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
    //
    // SPREAD = 4 (2026-09-17, DECISIONS.md 54): the constant and the threshold
    // are POSITIONS (they move the wall out with everything else it flanks) so
    // both are x4; the RATE (0.42, a slope, dx/dz) is untouched, because a
    // uniform scale multiplies both x and z by 4 and the ratio is unchanged.
    // ── STAGE 2: the neck is set by the building that has to fill it ────────
    //
    // The half-width used to be 96 m at the portal, which fitted a 40 m
    // pyramid. The pyramid is now the book's own: 1 139.6 m wide, six stadia
    // plus twenty paces of plinth. Dallington leaves TEN PACES of clearance to
    // the rock on each side (research/plan.json, pyramid.size_source), so the
    // valley's floor at the porch is 1 139.6 + 2 x 14.8 = 1 169.2 m across and
    // its half-width is exactly that clearance line. It is derived from the
    // building, not chosen — if the pyramid is ever re-measured the valley
    // follows, and a neck narrower than the gate would put rock through stone.
    //
    // South of the porch it opens, but gently: the plan gives the valley
    // 1 850 m of length and the same 1 139.6 m of width as the pyramid, and a
    // valley the book calls SHUT should not fan out into a plain. 0.06 takes it
    // from 584.6 m of half-width at the neck to 695.6 at the palm plain.
    const NECK = PYRAMID_W / 2 + PYRAMID_CLEAR;          // 584.6
    const gap = (z) => NECK + Math.max(0, z - VALLEY_Z1) * 0.06;
    // How high the wall stands. 44 m was chosen against a 38 m pyramid; against
    // 785 m of it a 44 m cliff is a kerbstone, and the valley stops reading as
    // shut at the very moment the gate becomes worth shutting. The walls are
    // tallest at the neck, where the book has them "continued in building from
    // the one and the other of the mountaines" (Dall. p. 27), and fall away
    // southward toward the open plain the dreamer came from. The jitter below
    // takes the tallest stack to about 1.86x this, so 340 at the neck puts the
    // ridge line at ~630 m against a pyramid whose cube sits at 785: the gate
    // is the tallest thing in the valley, which is the whole point of it.
    const high = (z) => 340 - Math.min(1, Math.max(0, z - VALLEY_Z1) / VALLEY_LEN) * 220;

    let n = 0;
    for (const side of [-1, 1]) {
      // STAGE 2: 152 -> 704 became 152 -> 1998 (the plan's south edge for the
      // valley), and the step from 28 m to 64, so the block count rises from
      // 120 to 176 rather than to 400. The blocks themselves are four times
      // wider to match: a 30 m boulder on a 600 m cliff is gravel.
      for (let z = VALLEY_Z1 + 3.6; z <= VALLEY_Z0; z += 64) {
        const g0 = gap(z), h0 = high(z);
        // the wall itself: a stack of two blocks, jittered, so the face breaks
        for (let k = 0; k < 3; k++) {
          const i = n++;
          const w = 104 + rnd(i, 1) * 64;
          const hh = h0 * (0.62 + k * 0.5) * (0.85 + rnd(i, 2) * 0.3);
          const x = side * (g0 + w * 0.5 + k * 5 + rnd(i, 3) * 4);
          const blk = this._m(this._indexed(new THREE.DodecahedronGeometry(1, 0)), rockMat,
            x, hh * 0.42, z + (rnd(i, 4) - 0.5) * 5, { cast: true });
          blk.scale.set(w * 0.5, hh * 0.62, 7 + rnd(i, 5) * 6);
          blk.rotation.y = rnd(i, 6) * 0.6;
          blk.rotation.x = (rnd(i, 7) - 0.5) * 0.12;
        }
        // and it is a WALL: you cannot walk through the mountain. The "far"
        // placeholder is bumped to 2000 (from 200): SPREAD = 4 lets gap(z)
        // itself pass 200 near the wood end, which would invert the range.
        this._wallCol(side > 0 ? gap(z) : -4000, side > 0 ? 4000 : -gap(z), z - 32, z + 32);
        // conifers on the lower slope — fir, larch and silver fir are the
        // mountain's trees (1499 l. 2813), not the dark wood's
        for (let t = 0; t < 2; t++) {
          const i = n++;
          if (rnd(i, 9) > 0.62) continue;
          this._tree(side * (gap(z) + 4 + rnd(i, 11) * 26), z + (rnd(i, 12) - 0.5) * 58,
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
    // SPREAD = 4 (2026-09-17, DECISIONS.md 54): the whole closing wall is
    // POSITION (z range, x offset), so x4; the rock BLOCK sizes (scale.set)
    // are untouched.
    // STAGE 2: this closing wall used to stand at z 704-800, at the old south
    // end. It now stands at the plan's south edge for the valley and is set at
    // the gap the formula gives there, so it meets the two flanking walls
    // instead of floating 250 m inside them.
    const CLOSE = gap(VALLEY_Z0);
    for (const side of [-1, 1]) {
      for (let z = VALLEY_Z0; z <= VALLEY_Z0 + 96; z += 32) {
        const i = n++;
        const blk = this._m(this._indexed(new THREE.DodecahedronGeometry(1, 0)), rockMat,
          side * (CLOSE + rnd(i, 21) * 10), 60 + rnd(i, 22) * 40, z, { cast: true });
        blk.scale.set(48 + rnd(i, 23) * 30, 78 + rnd(i, 24) * 42, 27 + rnd(i, 25) * 18);
        blk.rotation.y = rnd(i, 26) * 0.7;
      }
      this._wallCol(side > 0 ? CLOSE - 40 : -4000, side > 0 ? 4000 : -(CLOSE - 40),
                    VALLEY_Z0 - 16, VALLEY_Z0 + 112);
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
  // SPREAD = 4 (2026-09-17, DECISIONS.md 54): defaults (-11, 20) -> (-44, 80),
  // matching _buildBridge's own BX/BZ move.
  _buildRiverPlants(BX = -44, BZ = 80) {
    const S = this.style, woodcut = S.key === 'woodcut';
    const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
    for (let i = 0; i < 26; i++) {
      const side = i % 2 ? 1 : -1, z = BZ - 7.2 + rnd(i, 1) * 14.4;
      if (Math.abs(z - BZ) < 2.3 || Math.abs(z - 56) < 1.8) continue;          // the two bridges
      this._tuft(BX + side * (1.55 + rnd(i, 2) * 0.35), 0.03, z, i % 3 === 0 ? 'rush' : i % 3 === 1 ? 'reed' : 'arum', 0.45 + rnd(i, 3) * 0.3);
    }
    // the nenuphar: pads on the water, a few white flowers
    const pad = woodcut ? S.mat({ tone: 0.2 }) : S.mat({ color: 0x2f6a2a, roughness: 0.6 });
    const bloom = woodcut ? S.mat({ tone: 0.0 }) : S.mat({ color: 0xf6f2e4, roughness: 0.5 });
    for (let i = 0; i < 18; i++) {
      const x = BX + (rnd(i, 4) - 0.5) * 2.4, z = BZ - 7 + rnd(i, 5) * 14;
      if (Math.abs(z - BZ) < 2.4 || Math.abs(z - 56) < 1.9) continue;
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
  // SPREAD = 4 (2026-09-17, DECISIONS.md 54): defaults (30, -27) -> (120,
  // -108), matching tombs.js _buildPolyandrion's own PX/PZ move.
  _buildRuinWeeds(PX = 120, PZ = -108) {
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
