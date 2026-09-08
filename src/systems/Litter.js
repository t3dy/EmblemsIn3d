// Litter — the small Renaissance things lying about the floors, for Roll Up.
//
// Ted, 2026-09-08: "we are going to want tiny small and medium Renaissance
// objects to litter the floors in the rolling mode only so there are lots of
// small things to roll up."
//
// ROLLING MODE ONLY. None of this is built for the walk: `_buildLitter` is
// called from HPWorldScene.build only when the scene was asked for `{ rollup:
// true }`, so the ordinary garden is not carpeted in dropped cutlery. It is
// scenery for a game mode, and the game mode says so.
//
// EVERY OBJECT IS IN THE BOOK. That is rule 2 (SOURCES.md: cite, don't invent)
// applied to props. The catalogue below was not imagined — it was mined out of
// the two translations this project can legally read, Dallington 1592 for
// chapters I–XVI and our own CC0 text for XVII–XXXVIII, by counting concrete
// portable nouns across both and keeping the ones that are actually there. The
// `src` line on each kind is that count's evidence. So there are urns (Dallington
// 67, ours 193), cups (38 / 373), lamps (12 / 53), torches (8 / 58), mirrors
// (1 / 84), garlands (22 / 15), quivers (0 / 22), harps (43 / 28), beehives
// (Dallington 15) — and no barrels, no bottles, no candlesticks with handles,
// because the book does not have them.
//
// AND EVERY OBJECT IS WHERE IT BELONGS. The zoning is the whole joke of the
// mode and half its use: the five sense-nymphs' bath is littered with combs and
// mirrors and phials and sandals, the Queen's court with platters and knives and
// salt-cellars, the Polyandrion with urns and potsherds and grave-lamps, the
// Great Portal with a mason's chisels and mallets and plumb-bobs, the fruitful
// fields with sickles and rakes and beehives, Cythera with arrows and quivers
// and roses. You can tell where you are by what you are eating.
//
// The pieces are ordinary meshes on shared materials and shared geometry, so the
// draw-call merge folds the whole lot into the buckets it already has: three
// thousand objects, about seven thousand meshes, and no new draw calls. Each
// mesh carries its own `userData.roll`, which _rollName now reads before the
// material's — a cup and its foot are the same silver.

import * as THREE from 'three';

// ── the stuff things are made of ───────────────────────────────────────────
function palette(S, woodcut) {
  const M = woodcut
    ? (tone) => S.mat({ tone })
    : null;
  const mk = (color, extra, tone) => woodcut ? M(tone) : S.mat({ color, ...extra });
  return {
    terracotta: mk(0xa8613a, { roughness: 0.88 }, 0.10),
    marble:     mk(0xe2dac6, { roughness: 0.52 }, 0.02),
    ivory:      mk(0xe8dfc6, { roughness: 0.42 }, 0.01),
    bronze:     mk(0x8a6a34, { roughness: 0.38, metalness: 0.85 }, 0.16),
    brass:      mk(0xb08a3a, { roughness: 0.32, metalness: 0.8 }, 0.12),
    gold:       mk(0xd9b25a, { roughness: 0.22, metalness: 0.95 }, 0.06),
    silver:     mk(0xc6ccd4, { roughness: 0.24, metalness: 0.9 }, 0.04),
    iron:       mk(0x4c4c54, { roughness: 0.52, metalness: 0.6 }, 0.28),
    glass:      mk(0xcbe0e4, { roughness: 0.08, metalness: 0.05 }, 0.0),
    wood:       mk(0x6b4a2c, { roughness: 0.9 }, 0.2),
    pale:       mk(0xbfa77a, { roughness: 0.86 }, 0.14),          // limewood, straw
    leather:    mk(0x6a4630, { roughness: 0.82 }, 0.22),
    wax:        mk(0xe8e2c8, { roughness: 0.68 }, 0.0),
    paper:      mk(0xe6dec4, { roughness: 0.94 }, 0.0),
    leaf:       mk(0x3d6a2c, { roughness: 0.92 }, 0.18),
    red:        mk(0xb0303c, { roughness: 0.9 }, 0.24),
    blue:       mk(0x2f4a7a, { roughness: 0.9 }, 0.26),
    coral:      mk(0xc25a4a, { roughness: 0.6 }, 0.2),
    flame:      woodcut ? M(-0.06) : S.mat({ color: 0xffb040, roughness: 0.5,
                                             emissive: 0xc06000, emissiveIntensity: 1.1 }),
  };
}

// ── geometry, made once and shared: the merge clones before it bakes ───────
function shapes() {
  const g = {};
  const S = (r, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const C = (rt, rb, h, n = 8, open = false) => new THREE.CylinderGeometry(rt, rb, h, n, 1, open);
  const B = (x, y, z) => new THREE.BoxGeometry(x, y, z);
  const N = (r, h, n = 7) => new THREE.ConeGeometry(r, h, n);
  const T = (r, t, n = 6, m = 14, arc) => new THREE.TorusGeometry(r, t, n, m, arc);
  return { g, S, C, B, N, T };
}

// ── the catalogue ──────────────────────────────────────────────────────────
//
// band: how big it is to the roll-up, which measures the mean half-extent of the
// bounding box. tiny ≈ 2–7 cm, small ≈ 8–22 cm, medium ≈ 25–60 cm.
// make(p, M, k): p places a mesh in the piece's own space; M is the palette;
// k is the shared-geometry cache.
function catalogue() {
  const { S, C, B, N, T } = shapes();
  const geo = {};
  const G = (id, f) => (geo[id] || (geo[id] = f()));

  return [
    // ── TINY ────────────────────────────────────────────────────────────
    { id: 'coin', name: 'a coin', band: 'tiny', src: 'ours 16',
      make: (p, M) => { p(G('coin', () => C(0.032, 0.032, 0.005, 12)), M.gold, 0, 0.004, 0, { rx: 0.02 }); } },
    { id: 'medal', name: 'a struck medal', band: 'tiny', src: 'ours 16 (coin)',
      make: (p, M) => { p(G('medal', () => C(0.045, 0.045, 0.007, 14)), M.bronze, 0, 0.005, 0); } },
    { id: 'pearl', name: 'a pearl', band: 'tiny', src: 'Dallington 42, ours 61',
      make: (p, M) => { p(G('pearl', () => S(0.019, 10, 8)), M.ivory, 0, 0.019, 0); } },
    { id: 'bead', name: 'a glass bead', band: 'tiny', src: 'Dallington 2, ours 1',
      make: (p, M) => { p(G('bead', () => S(0.016, 8, 6)), M.glass, 0, 0.016, 0); } },
    { id: 'gem', name: 'a cut gem', band: 'tiny', src: 'Dallington 14, ours 103',
      // PolyhedronGeometry is not indexed, and the draw-call merger wants a
      // bucket all indexed or all not — one bare octahedron in the red bucket
      // left every red thing in the world unmerged. Give it a trivial index.
      make: (p, M) => { p(G('gem', () => {
        const g = new THREE.OctahedronGeometry(0.028, 0);
        g.setIndex(Array.from({ length: g.attributes.position.count }, (_, i) => i));
        return g;
      }), M.red, 0, 0.022, 0); } },
    { id: 'coral', name: 'a branch of coral', band: 'tiny', src: 'Dallington 2, ours 11',
      make: (p, M) => {
        p(G('coralA', () => C(0.008, 0.011, 0.07, 5)), M.coral, 0, 0.035, 0);
        p(G('coralB', () => C(0.005, 0.008, 0.05, 5)), M.coral, 0.018, 0.062, 0.008, { rz: -0.7 });
        p(G('coralB', () => C(0.005, 0.008, 0.05, 5)), M.coral, -0.016, 0.058, -0.006, { rz: 0.8 });
      } },
    { id: 'acorn', name: 'an acorn', band: 'tiny', src: 'Dallington 2, ours 2',
      make: (p, M) => {
        p(G('acornA', () => S(0.017, 8, 6)), M.pale, 0, 0.02, 0, { sy: 1.5 });
        p(G('acornB', () => C(0.019, 0.014, 0.014, 8)), M.wood, 0, 0.033, 0);
      } },
    { id: 'walnut', name: 'a walnut', band: 'tiny', src: 'Dallington 1, ours 3',
      make: (p, M) => { p(G('walnut', () => S(0.026, 8, 6)), M.wood, 0, 0.024, 0, { sy: 0.85 }); } },
    { id: 'hazelnut', name: 'a hazelnut', band: 'tiny', src: 'ours 4',
      make: (p, M) => { p(G('hazel', () => S(0.018, 7, 5)), M.pale, 0, 0.017, 0); } },
    { id: 'snail', name: 'a snail shell', band: 'tiny', src: 'ours 4',
      make: (p, M) => {
        p(G('snailA', () => T(0.028, 0.013, 6, 14)), M.ivory, 0, 0.016, 0, { rx: Math.PI / 2, rz: 0.4 });
        p(G('snailB', () => S(0.016, 7, 5)), M.ivory, 0.01, 0.016, 0.008);
      } },
    { id: 'die', name: 'a die', band: 'tiny', src: 'Dallington 3, ours 8',
      make: (p, M) => { p(G('die', () => B(0.03, 0.03, 0.03)), M.ivory, 0, 0.015, 0); } },
    { id: 'sherd', name: 'a potsherd', band: 'tiny', src: 'the ruin; Dallington vessell 69',
      make: (p, M) => { p(G('sherd', () => B(0.07, 0.008, 0.055)), M.terracotta, 0, 0.006, 0, { rx: 0.06, rz: -0.09 }); } },
    { id: 'nail', name: 'a nail of gold', band: 'tiny', src: 'Dallington "tatch Nayles of Golde"',
      make: (p, M) => {
        p(G('nailA', () => C(0.0035, 0.002, 0.055, 5)), M.gold, 0, 0.004, 0, { rz: Math.PI / 2 });
        p(G('nailB', () => C(0.009, 0.009, 0.003, 8)), M.gold, -0.027, 0.004, 0, { rz: Math.PI / 2 });
      } },
    { id: 'tessera', name: 'a tessera', band: 'tiny', src: 'the pavements; ours "tessellated"',
      make: (p, M) => { p(G('tess', () => B(0.034, 0.012, 0.034)), M.marble, 0, 0.006, 0); } },
    { id: 'pin', name: 'a silver pin', band: 'tiny', src: 'the nymphs’ hair',
      make: (p, M) => { p(G('pin', () => C(0.0022, 0.0022, 0.075, 5)), M.silver, 0, 0.003, 0, { rz: Math.PI / 2 }); } },

    // ── SMALL ───────────────────────────────────────────────────────────
    { id: 'cup', name: 'a cup', band: 'small', src: 'Dallington 38, ours 373',
      make: (p, M) => {
        p(G('cupA', () => C(0.052, 0.036, 0.075, 12, true)), M.silver, 0, 0.045, 0);
        p(G('cupB', () => C(0.042, 0.042, 0.006, 12)), M.silver, 0, 0.009, 0);
      } },
    { id: 'goblet', name: 'a goblet of gold', band: 'small', src: 'Dallington 38 (cup), ours 373',
      make: (p, M) => {
        p(G('gobA', () => C(0.05, 0.028, 0.07, 12, true)), M.gold, 0, 0.095, 0);
        p(G('gobB', () => C(0.008, 0.008, 0.05, 8)), M.gold, 0, 0.035, 0);
        p(G('gobC', () => C(0.038, 0.042, 0.008, 12)), M.gold, 0, 0.008, 0);
      } },
    { id: 'bowl', name: 'a bowl', band: 'small', src: 'Dallington 11, ours 4',
      make: (p, M) => { p(G('bowl', () => new THREE.SphereGeometry(0.075, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2)), M.terracotta, 0, 0.072, 0); } },
    { id: 'dish', name: 'a dish', band: 'small', src: 'Dallington 8, ours 51',
      make: (p, M) => {
        p(G('dishA', () => C(0.085, 0.07, 0.016, 14)), M.marble, 0, 0.012, 0);
        p(G('dishB', () => T(0.084, 0.007, 5, 16)), M.marble, 0, 0.02, 0, { rx: Math.PI / 2 });
      } },
    { id: 'platter', name: 'a platter', band: 'small', src: 'ours 15',
      make: (p, M) => { p(G('plat', () => C(0.135, 0.115, 0.014, 16)), M.silver, 0, 0.01, 0); } },
    { id: 'vial', name: 'a phial of glass', band: 'small', src: 'Dallington 2, ours 1 (vial); "shining glass"',
      make: (p, M) => {
        p(G('vialA', () => C(0.026, 0.03, 0.085, 10)), M.glass, 0, 0.045, 0);
        p(G('vialB', () => C(0.011, 0.011, 0.035, 8)), M.glass, 0, 0.105, 0);
      } },
    { id: 'castingbottle', name: 'a casting bottle', band: 'small', src: 'Geussia’s attribute, HP_SOURCEBOOK §3',
      make: (p, M) => {
        p(G('cbA', () => S(0.045, 10, 8)), M.silver, 0, 0.05, 0, { sy: 1.25 });
        p(G('cbB', () => C(0.013, 0.016, 0.04, 8)), M.silver, 0, 0.105, 0);
      } },
    { id: 'comb', name: 'an ivory comb', band: 'small', src: 'Dallington 3, ours 15',
      make: (p, M) => {
        p(G('combA', () => B(0.1, 0.006, 0.026)), M.ivory, 0, 0.006, 0.024);
        for (let i = 0; i < 9; i++) p(G('combB', () => B(0.004, 0.005, 0.03)), M.ivory, -0.042 + i * 0.0105, 0.005, -0.004);
      } },
    { id: 'mirror', name: 'a shining glass', band: 'small', src: 'Dallington 1, ours 84; Orassia’s attribute',
      make: (p, M) => {
        p(G('mirA', () => C(0.062, 0.062, 0.008, 16)), M.silver, 0, 0.006, 0);
        p(G('mirB', () => B(0.018, 0.006, 0.08)), M.bronze, 0, 0.005, 0.1);
      } },
    { id: 'key', name: 'a key', band: 'small', src: 'Dallington 2, ours 36 (and the golden key of the rite)',
      make: (p, M) => {
        p(G('keyA', () => C(0.006, 0.006, 0.12, 6)), M.iron, 0, 0.006, 0, { rz: Math.PI / 2 });
        p(G('keyB', () => T(0.022, 0.006, 5, 12)), M.iron, -0.062, 0.006, 0, { ry: Math.PI / 2 });
        p(G('keyC', () => B(0.02, 0.005, 0.022)), M.iron, 0.05, 0.006, 0.012);
      } },
    { id: 'seal', name: 'a seal', band: 'small', src: 'Dallington 5, ours 40',
      make: (p, M) => {
        p(G('sealA', () => C(0.024, 0.024, 0.012, 10)), M.bronze, 0, 0.006, 0);
        p(G('sealB', () => C(0.008, 0.012, 0.05, 8)), M.bronze, 0, 0.037, 0);
      } },
    { id: 'taper', name: 'a taper', band: 'small', src: 'ours 10; "the candle never yet lit"',
      make: (p, M) => { p(G('taper', () => C(0.011, 0.014, 0.2, 8)), M.wax, 0, 0.007, 0, { rz: Math.PI / 2 }); } },
    { id: 'lamp', name: 'an oil lamp', band: 'small', src: 'Dallington 12, ours 53',
      make: (p, M) => {
        p(G('lampA', () => S(0.055, 12, 6)), M.terracotta, 0, 0.03, 0, { sy: 0.55 });
        p(G('lampB', () => N(0.02, 0.05, 6)), M.terracotta, 0.06, 0.026, 0, { rz: -Math.PI / 2 });
      } },
    { id: 'knife', name: 'a knife', band: 'small', src: 'ours 6',
      make: (p, M) => {
        p(G('kniA', () => B(0.13, 0.004, 0.022)), M.iron, 0.04, 0.004, 0);
        p(G('kniB', () => B(0.07, 0.014, 0.018)), M.wood, -0.06, 0.008, 0);
      } },
    { id: 'spoon', name: 'a spoon', band: 'small', src: 'the banquet plate',
      make: (p, M) => {
        p(G('spoA', () => S(0.026, 10, 6)), M.silver, 0.05, 0.008, 0, { sy: 0.3, sz: 0.75 });
        p(G('spoB', () => C(0.005, 0.006, 0.1, 6)), M.silver, -0.02, 0.006, 0, { rz: Math.PI / 2 });
      } },
    { id: 'saltcellar', name: 'a salt-cellar', band: 'small', src: 'Dallington 4, ours 14 (salt)',
      make: (p, M) => {
        p(G('salA', () => C(0.036, 0.03, 0.05, 10)), M.silver, 0, 0.026, 0);
        p(G('salB', () => T(0.035, 0.005, 5, 12)), M.gold, 0, 0.05, 0, { rx: Math.PI / 2 });
      } },
    { id: 'tablet', name: 'a tablet', band: 'small', src: 'ours 21',
      make: (p, M) => { p(G('tab', () => B(0.14, 0.014, 0.17)), M.marble, 0, 0.008, 0); } },
    { id: 'scroll', name: 'a scroll', band: 'small', src: 'ours 11',
      make: (p, M) => {
        p(G('scrA', () => C(0.022, 0.022, 0.17, 10)), M.paper, 0, 0.022, 0, { rz: Math.PI / 2 });
        p(G('scrB', () => C(0.008, 0.008, 0.2, 6)), M.wood, 0, 0.022, 0, { rz: Math.PI / 2 });
      } },
    { id: 'book', name: 'a book', band: 'small', src: 'Dallington 2 (booke); the dove-bound book',
      make: (p, M) => {
        p(G('bokA', () => B(0.11, 0.026, 0.15)), M.leather, 0, 0.014, 0);
        p(G('bokB', () => B(0.098, 0.02, 0.138)), M.paper, 0.004, 0.014, 0);
      } },
    { id: 'inkhorn', name: 'an inkhorn', band: 'small', src: 'Book II, the letters',
      make: (p, M) => {
        p(G('inkA', () => C(0.024, 0.016, 0.07, 8)), M.wood, 0, 0.035, 0);
        p(G('inkB', () => C(0.0025, 0.0025, 0.14, 5)), M.pale, 0.012, 0.09, 0, { rz: 0.35 });
      } },
    { id: 'purse', name: 'a purse', band: 'small', src: 'Dallington 1, ours 1',
      make: (p, M) => {
        p(G('purA', () => S(0.05, 10, 8)), M.leather, 0, 0.042, 0, { sy: 0.8 });
        p(G('purB', () => T(0.026, 0.005, 5, 12)), M.leather, 0, 0.078, 0, { rx: Math.PI / 2 });
      } },
    { id: 'sandal', name: 'a sandal', band: 'small', src: 'Dallington 2, ours 20',
      make: (p, M) => {
        p(G('sanA', () => B(0.085, 0.014, 0.23)), M.leather, 0, 0.008, 0);
        p(G('sanB', () => B(0.06, 0.006, 0.02)), M.leather, 0, 0.02, 0.03, { rx: 0.5 });
      } },
    { id: 'glove', name: 'a glove', band: 'small', src: 'ours 5',
      make: (p, M) => {
        p(G('gloA', () => B(0.07, 0.016, 0.11)), M.leather, 0, 0.009, 0);
        for (let i = 0; i < 4; i++) p(G('gloB', () => B(0.013, 0.012, 0.05)), M.leather, -0.024 + i * 0.016, 0.008, 0.076);
      } },
    { id: 'chaplet', name: 'a chaplet of flowers', band: 'small', src: 'ours 12 (chaplet), Dallington 22 (garland)',
      make: (p, M) => {
        p(G('chaA', () => T(0.075, 0.012, 6, 16)), M.leaf, 0, 0.012, 0, { rx: Math.PI / 2 });
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          p(G('chaB', () => S(0.016, 7, 5)), i % 2 ? M.red : M.wax,
            Math.cos(a) * 0.075, 0.022, Math.sin(a) * 0.075);
        }
      } },
    { id: 'spindle', name: 'a spindle', band: 'small', src: 'Dallington 1, ours 1',
      make: (p, M) => {
        p(G('spiA', () => C(0.004, 0.008, 0.22, 6)), M.wood, 0, 0.008, 0, { rz: Math.PI / 2 });
        p(G('spiB', () => C(0.026, 0.026, 0.012, 10)), M.wood, 0.05, 0.008, 0, { rz: Math.PI / 2 });
      } },
    { id: 'flute', name: 'a flute', band: 'small', src: 'Dallington 3, ours 12',
      make: (p, M) => { p(G('flu', () => C(0.013, 0.015, 0.34, 8)), M.wood, 0, 0.014, 0, { rz: Math.PI / 2 }); } },
    { id: 'chisel', name: 'a mason’s chisel', band: 'small', src: 'ours 6',
      make: (p, M) => {
        p(G('chiA', () => C(0.011, 0.008, 0.13, 6)), M.iron, 0, 0.011, 0, { rz: Math.PI / 2 });
        p(G('chiB', () => C(0.015, 0.018, 0.06, 8)), M.wood, -0.09, 0.014, 0, { rz: Math.PI / 2 });
      } },
    { id: 'mallet', name: 'a mallet', band: 'small', src: 'the mason’s work of the portal',
      make: (p, M) => {
        p(G('malA', () => C(0.036, 0.036, 0.1, 10)), M.wood, 0, 0.036, 0, { rz: Math.PI / 2 });
        p(G('malB', () => C(0.011, 0.013, 0.19, 6)), M.wood, 0, 0.036, 0.11, { rx: Math.PI / 2 });
      } },
    { id: 'trowel', name: 'a trowel', band: 'small', src: 'the mason’s work of the portal',
      make: (p, M) => {
        p(G('troA', () => B(0.09, 0.004, 0.14)), M.iron, 0, 0.005, 0);
        p(G('troB', () => C(0.011, 0.011, 0.08, 6)), M.wood, 0, 0.012, -0.11, { rx: Math.PI / 2 });
      } },
    { id: 'plumb', name: 'a plumb-bob', band: 'small', src: 'Dallington compasse 35, square 52',
      make: (p, M) => {
        p(G('pluA', () => N(0.022, 0.06, 8)), M.iron, 0, 0.03, 0, { rz: Math.PI });
        p(G('pluB', () => C(0.0018, 0.0018, 0.13, 4)), M.pale, 0, 0.125, 0);
      } },
    { id: 'compasses', name: 'a pair of compasses', band: 'small', src: 'Dallington 35',
      make: (p, M) => {
        p(G('comA', () => C(0.005, 0.003, 0.19, 5)), M.bronze, 0.03, 0.006, 0.02, { rz: Math.PI / 2, ry: 0.28 });
        p(G('comA', () => C(0.005, 0.003, 0.19, 5)), M.bronze, 0.03, 0.006, -0.02, { rz: Math.PI / 2, ry: -0.28 });
      } },
    { id: 'sickle', name: 'a sickle', band: 'small', src: 'the harvest of the fruitful fields',
      make: (p, M) => {
        p(G('sicA', () => T(0.075, 0.006, 4, 12, Math.PI * 1.1)), M.iron, 0.04, 0.006, 0, { rx: Math.PI / 2 });
        p(G('sicB', () => C(0.013, 0.013, 0.09, 6)), M.wood, -0.06, 0.012, 0, { rz: Math.PI / 2 });
      } },
    { id: 'arrow', name: 'an arrow', band: 'small', src: 'Dallington 18, ours 133',
      make: (p, M) => {
        p(G('arrA', () => C(0.005, 0.005, 0.5, 5)), M.wood, 0, 0.005, 0, { rz: Math.PI / 2 });
        p(G('arrB', () => N(0.011, 0.05, 5)), M.iron, 0.27, 0.005, 0, { rz: -Math.PI / 2 });
        p(G('arrC', () => B(0.045, 0.001, 0.022)), M.pale, -0.22, 0.008, 0);
      } },

    // ── MEDIUM ──────────────────────────────────────────────────────────
    { id: 'urn', name: 'an urn', band: 'medium', src: 'Dallington 67, ours 193',
      make: (p, M) => {
        p(G('urnA', () => S(0.15, 14, 10)), M.marble, 0, 0.17, 0, { sy: 1.15 });
        p(G('urnB', () => C(0.075, 0.09, 0.09, 12)), M.marble, 0, 0.33, 0);
        p(G('urnC', () => C(0.085, 0.11, 0.05, 12)), M.marble, 0, 0.03, 0);
      } },
    { id: 'amphora', name: 'an amphora', band: 'medium', src: 'ours 5',
      make: (p, M) => {
        p(G('ampA', () => S(0.13, 12, 10)), M.terracotta, 0, 0.2, 0, { sy: 1.5 });
        p(G('ampB', () => C(0.045, 0.06, 0.14, 10)), M.terracotta, 0, 0.41, 0);
        p(G('ampC', () => N(0.055, 0.11, 8)), M.terracotta, 0, 0.055, 0, { rz: Math.PI });
        for (const s of [-1, 1]) p(G('ampD', () => T(0.045, 0.009, 5, 10, Math.PI)), M.terracotta,
          s * 0.08, 0.36, 0, { ry: Math.PI / 2, rz: s > 0 ? -Math.PI / 2 : Math.PI / 2 });
      } },
    { id: 'vase', name: 'a vase', band: 'medium', src: 'ours 98',
      make: (p, M) => {
        p(G('vasA', () => C(0.09, 0.13, 0.24, 14)), M.terracotta, 0, 0.13, 0);
        p(G('vasB', () => C(0.12, 0.085, 0.09, 14)), M.terracotta, 0, 0.29, 0);
      } },
    { id: 'ewer', name: 'an ewer', band: 'medium', src: 'Dallington 1, ours 25',
      make: (p, M) => {
        p(G('eweA', () => S(0.1, 12, 10)), M.bronze, 0, 0.12, 0, { sy: 1.2 });
        p(G('eweB', () => C(0.038, 0.05, 0.11, 10)), M.bronze, 0, 0.27, 0);
        p(G('eweC', () => T(0.06, 0.011, 5, 12, Math.PI)), M.bronze, -0.09, 0.2, 0, { ry: Math.PI / 2, rz: Math.PI / 2 });
      } },
    { id: 'basket', name: 'a basket', band: 'medium', src: 'Dallington 1, ours 9',
      make: (p, M) => {
        p(G('basA', () => C(0.19, 0.13, 0.2, 14, true)), M.pale, 0, 0.11, 0);
        p(G('basB', () => C(0.14, 0.14, 0.012, 14)), M.pale, 0, 0.012, 0);
        p(G('basC', () => T(0.185, 0.012, 5, 16)), M.pale, 0, 0.2, 0, { rx: Math.PI / 2 });
      } },
    { id: 'brazier', name: 'a brazier', band: 'medium', src: 'the altar-furnace of the crypt',
      make: (p, M) => {
        p(G('brzA', () => new THREE.SphereGeometry(0.17, 14, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2)), M.bronze, 0, 0.3, 0);
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI * 2;
          p(G('brzB', () => C(0.016, 0.012, 0.3, 6)), M.bronze, Math.cos(a) * 0.11, 0.15, Math.sin(a) * 0.11, { rz: Math.cos(a) * 0.2, rx: -Math.sin(a) * 0.2 });
        }
      } },
    { id: 'tripod', name: 'a tripod', band: 'medium', src: 'ours 2',
      make: (p, M) => {
        p(G('triA', () => T(0.13, 0.014, 5, 14)), M.bronze, 0, 0.42, 0, { rx: Math.PI / 2 });
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI * 2 + 0.4;
          p(G('triB', () => C(0.012, 0.016, 0.44, 6)), M.bronze, Math.cos(a) * 0.09, 0.22, Math.sin(a) * 0.09, { rz: Math.cos(a) * 0.22, rx: -Math.sin(a) * 0.22 });
        }
      } },
    { id: 'torch', name: 'a torch', band: 'medium', src: 'Dallington 8, ours 58',
      make: (p, M) => {
        p(G('torA', () => C(0.022, 0.026, 0.62, 8)), M.wood, 0, 0.026, 0, { rz: Math.PI / 2 });
        p(G('torB', () => S(0.05, 8, 6)), M.flame, 0.32, 0.04, 0, { sy: 1.4 });
      } },
    { id: 'lute', name: 'a lute', band: 'medium', src: 'Dallington 20, ours 39',
      make: (p, M) => {
        p(G('lutA', () => new THREE.SphereGeometry(0.14, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2)), M.wood, 0, 0.02, 0, { rx: Math.PI });
        p(G('lutB', () => C(0.135, 0.135, 0.008, 14)), M.pale, 0, 0.022, 0);
        p(G('lutC', () => B(0.36, 0.018, 0.05)), M.wood, 0.26, 0.02, 0);
        p(G('lutD', () => B(0.06, 0.016, 0.045)), M.wood, 0.45, 0.024, 0, { rz: -0.5 });
      } },
    { id: 'harp', name: 'a sounding harp', band: 'medium', src: 'Dallington 43, ours 28; Achoe’s attribute',
      make: (p, M) => {
        p(G('harA', () => T(0.24, 0.02, 6, 16, Math.PI * 0.8)), M.wood, 0, 0.26, 0, { rz: -0.5 });
        p(G('harB', () => B(0.05, 0.42, 0.07)), M.wood, -0.13, 0.21, 0, { rz: 0.22 });
        for (let i = 0; i < 6; i++) p(G('harC', () => C(0.0018, 0.0018, 0.26, 4)), M.gold, -0.06 + i * 0.035, 0.2 + i * 0.014, 0, { rz: 0.2 });
      } },
    { id: 'sistrum', name: 'a sistrum', band: 'medium', src: 'ours 2',
      make: (p, M) => {
        p(G('sisA', () => T(0.085, 0.012, 5, 14, Math.PI)), M.bronze, 0, 0.32, 0);
        p(G('sisB', () => C(0.014, 0.018, 0.24, 8)), M.bronze, 0, 0.12, 0);
        for (let i = 0; i < 3; i++) p(G('sisC', () => C(0.0025, 0.0025, 0.15, 4)), M.bronze, 0, 0.28 + i * 0.03, 0, { rz: Math.PI / 2 });
      } },
    { id: 'timbrel', name: 'a timbrel', band: 'medium', src: 'Dallington 5 (trumpet), the triumphs’ music',
      make: (p, M) => {
        p(G('timA', () => C(0.16, 0.16, 0.05, 18, true)), M.wood, 0, 0.08, 0, { rx: Math.PI / 2 });
        p(G('timB', () => C(0.155, 0.155, 0.004, 18)), M.pale, 0, 0.08, 0, { rx: Math.PI / 2 });
      } },
    { id: 'trumpet', name: 'a trumpet', band: 'medium', src: 'Dallington 5, ours 11',
      make: (p, M) => {
        p(G('truA', () => C(0.014, 0.014, 0.52, 8)), M.brass, 0, 0.05, 0, { rz: Math.PI / 2 });
        p(G('truB', () => C(0.07, 0.02, 0.13, 12, true)), M.brass, 0.31, 0.05, 0, { rz: -Math.PI / 2 });
      } },
    { id: 'shield', name: 'a shield', band: 'medium', src: 'Dallington 6, ours 13; the trophies',
      make: (p, M) => {
        p(G('shiA', () => C(0.3, 0.3, 0.03, 20)), M.bronze, 0, 0.03, 0);
        p(G('shiB', () => S(0.07, 12, 8)), M.gold, 0, 0.05, 0, { sy: 0.5 });
      } },
    { id: 'helmet', name: 'a helmet', band: 'medium', src: 'Dallington 4, ours 9; the trophies',
      make: (p, M) => {
        p(G('helA', () => new THREE.SphereGeometry(0.115, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2)), M.iron, 0, 0.02, 0);
        p(G('helB', () => B(0.03, 0.09, 0.24)), M.red, 0, 0.16, 0);
      } },
    { id: 'quiver', name: 'a quiver', band: 'medium', src: 'ours 22',
      make: (p, M) => {
        p(G('quiA', () => C(0.055, 0.062, 0.42, 10)), M.leather, 0, 0.062, 0, { rz: Math.PI / 2 });
        for (let i = 0; i < 3; i++) p(G('quiB', () => C(0.005, 0.005, 0.34, 5)), M.wood, 0.22 + i * 0.02, 0.075 + i * 0.012, -0.02 + i * 0.02, { rz: Math.PI / 2 - 0.08 * i });
      } },
    { id: 'chest', name: 'a little chest', band: 'medium', src: 'Dallington 2, ours 30; Osfressia’s perfume casket',
      make: (p, M) => {
        p(G('cheA', () => B(0.34, 0.19, 0.22)), M.wood, 0, 0.1, 0);
        p(G('cheB', () => new THREE.CylinderGeometry(0.11, 0.11, 0.34, 10, 1, false, 0, Math.PI)), M.wood, 0, 0.195, 0, { rz: Math.PI / 2, ry: Math.PI / 2 });
        p(G('cheC', () => B(0.35, 0.014, 0.03)), M.bronze, 0, 0.14, 0.113);
      } },
    { id: 'stool', name: 'a stool', band: 'medium', src: 'Dallington 2 (stoole), 5 (bench)',
      make: (p, M) => {
        p(G('stoA', () => C(0.16, 0.16, 0.035, 12)), M.wood, 0, 0.34, 0);
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI * 2 + 0.9;
          p(G('stoB', () => C(0.017, 0.022, 0.34, 6)), M.wood, Math.cos(a) * 0.1, 0.17, Math.sin(a) * 0.1, { rz: Math.cos(a) * 0.18, rx: -Math.sin(a) * 0.18 });
        }
      } },
    { id: 'skep', name: 'a beehive of straw', band: 'medium', src: 'Dallington 15 (hive)',
      make: (p, M) => {
        for (let i = 0; i < 5; i++) {
          const t = i / 5;
          p(G('skep' + i, () => C(0.2 - t * 0.16, 0.21 - t * 0.15, 0.075, 14)), M.pale, 0, 0.04 + i * 0.072, 0);
        }
      } },
    { id: 'gourd', name: 'a gourd', band: 'medium', src: 'ours 2',
      make: (p, M) => {
        p(G('gouA', () => S(0.11, 12, 10)), M.leaf, 0, 0.1, 0, { sy: 0.95 });
        p(G('gouB', () => S(0.07, 10, 8)), M.leaf, 0, 0.22, 0);
        p(G('gouC', () => C(0.012, 0.016, 0.06, 6)), M.wood, 0, 0.3, 0);
      } },
    { id: 'cornucopia', name: 'a cornucopia', band: 'medium', src: 'ours 3',
      make: (p, M) => {
        p(G('corA', () => C(0.15, 0.02, 0.46, 12, true)), M.gold, 0, 0.16, 0, { rz: -1.15 });
        for (let i = 0; i < 4; i++) p(G('corB', () => S(0.045, 8, 6)), i % 2 ? M.red : M.leaf,
          0.16 + i * 0.035, 0.3 - i * 0.03, (i % 2 ? 0.04 : -0.04));
      } },
    { id: 'oar', name: 'an oar', band: 'medium', src: 'Dallington 1, ours 1; Cupid’s boat',
      make: (p, M) => {
        p(G('oarA', () => C(0.02, 0.024, 1.05, 8)), M.wood, 0, 0.024, 0, { rz: Math.PI / 2 });
        p(G('oarB', () => B(0.3, 0.014, 0.11)), M.wood, 0.62, 0.024, 0);
      } },
    { id: 'wheel', name: 'a cart wheel', band: 'medium', src: 'Dallington 18 (wheele); the triumphal cars',
      make: (p, M) => {
        p(G('whlA', () => T(0.3, 0.03, 6, 20)), M.wood, 0, 0.3, 0);
        p(G('whlB', () => C(0.05, 0.05, 0.07, 10)), M.wood, 0, 0.3, 0, { rx: Math.PI / 2 });
        for (let i = 0; i < 6; i++) p(G('whlC', () => C(0.011, 0.011, 0.28, 5)), M.wood, 0, 0.3, 0,
          { rz: (i / 6) * Math.PI * 2 });
      } },
    { id: 'rake', name: 'a rake', band: 'medium', src: 'Dallington 3, ours 1',
      make: (p, M) => {
        p(G('rakA', () => C(0.014, 0.017, 1.0, 6)), M.wood, 0, 0.03, 0, { rz: Math.PI / 2 - 0.1 });
        p(G('rakB', () => B(0.02, 0.02, 0.3)), M.wood, 0.5, 0.06, 0);
        for (let i = 0; i < 5; i++) p(G('rakC', () => C(0.008, 0.006, 0.09, 5)), M.wood, 0.5, 0.02, -0.12 + i * 0.06);
      } },
  ];
}

// ── where each thing belongs ───────────────────────────────────────────────
//
// The zoning is the point. You can tell where you are by what you are eating.
const EVERYWHERE = ['coin', 'sherd', 'pearl', 'bead', 'gem', 'nail', 'tessera', 'pin', 'coral', 'seal'];
const ZONES = {
  wood:            ['acorn', 'walnut', 'hazelnut', 'snail', 'sherd', 'gourd'],
  portal:          ['chisel', 'mallet', 'trowel', 'plumb', 'compasses', 'tablet', 'sherd', 'stool'],
  elephant:        ['chisel', 'mallet', 'plumb', 'tablet', 'scroll', 'lamp', 'urn'],
  colossus:        ['sherd', 'lamp', 'nail', 'chisel', 'helmet', 'shield'],
  fountain:        ['comb', 'mirror', 'vial', 'castingbottle', 'sandal', 'glove', 'chaplet',
                    'cup', 'ewer', 'purse', 'taper', 'chest', 'flute'],
  court:           ['platter', 'dish', 'goblet', 'cup', 'knife', 'spoon', 'saltcellar',
                    'ewer', 'bowl', 'chest', 'stool', 'lute'],
  chess:           ['die', 'goblet', 'cup', 'lute', 'taper', 'stool', 'timbrel'],
  labyrinth:       ['platter', 'goblet', 'knife', 'spoon', 'dish', 'bowl', 'ewer', 'lamp'],
  quinta_essentia: ['tablet', 'scroll', 'book', 'compasses', 'vial', 'lamp', 'taper'],
  three_doors:     ['key', 'lamp', 'taper', 'sherd', 'tablet', 'sandal'],
  polia:           ['basket', 'chaplet', 'spindle', 'sickle', 'gourd', 'bowl', 'rake', 'skep'],
  horse:           ['sherd', 'nail', 'wheel', 'helmet', 'tablet'],
  triumphs:        ['chaplet', 'timbrel', 'sistrum', 'trumpet', 'flute', 'wheel', 'cornucopia',
                    'goblet', 'basket', 'torch'],
  priapus:         ['basket', 'gourd', 'goblet', 'amphora', 'torch', 'sickle', 'skep', 'timbrel'],
  venus_temple:    ['taper', 'lamp', 'vial', 'key', 'tablet', 'chaplet', 'brazier', 'tripod',
                    'ewer', 'bowl', 'torch', 'book'],
  polyandrion:     ['urn', 'sherd', 'lamp', 'tablet', 'coin', 'chisel', 'brazier', 'medal', 'vase'],
  fields:          ['sickle', 'rake', 'basket', 'skep', 'gourd', 'bowl', 'wheel', 'stool', 'amphora'],
  book_two:        ['book', 'scroll', 'inkhorn', 'taper', 'coin', 'medal', 'purse', 'lamp', 'chest'],
  cythera:         ['arrow', 'quiver', 'chaplet', 'oar', 'torch', 'lute', 'timbrel', 'goblet'],
  cythera_isle:    ['arrow', 'quiver', 'chaplet', 'harp', 'lute', 'timbrel', 'sistrum', 'flute',
                    'basket', 'vase', 'goblet', 'mirror', 'oar'],
  cythera_theatre: ['chaplet', 'harp', 'sistrum', 'timbrel', 'goblet', 'vial', 'mirror', 'arrow'],
  adonis:          ['chaplet', 'vial', 'lamp', 'urn', 'bowl', 'taper', 'medal', 'basket'],
};

// ── the scatter ────────────────────────────────────────────────────────────
export function buildLitter(sc, STATIONS, { density = 1 } = {}) {
  const S = sc.style, woodcut = S.key === 'woodcut';
  const M = palette(S, woodcut);
  for (const k of Object.keys(M)) if (M[k]) sc._disp.push(M[k]);
  const KINDS = catalogue();
  const byId = new Map(KINDS.map(k => [k.id, k]));
  // The bands are drawn at their own scale and in their own proportion. Every
  // kind is modelled at its natural size in metres; the medium things are then
  // set up by three-quarters, because a Renaissance urn on a terrace is knee
  // high and one modelled at 30 cm reads as a toy. And a piece is never quite
  // the size of the piece beside it.
  const BAND_SCALE = { tiny: 1, small: 1.15, medium: 1.75 };
  const BAND_SHARE = [['tiny', 0.55], ['small', 0.30], ['medium', 0.15]];

  const rnd = (() => { let s = 20260908; return () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; })();

  // a point is no good if it is inside a wall — a stone floor under a building
  // is fine, the inside of the masonry is not
  const walls = sc.walker.walls;
  const blocked = (x, z) => {
    for (const w of walls) if (x > w.x0 - 0.1 && x < w.x1 + 0.1 && z > w.z0 - 0.1 && z < w.z1 + 0.1) return true;
    return false;
  };

  const root = new THREE.Group();
  const isleRoot = new THREE.Group();
  sc.scene.add(root);
  (sc._isleGroup || sc.scene).add(isleRoot);

  // Pick a kind from a zone's list, but by BAND first, so that a station gets
  // its share of big things even when most of its list is small ones.
  const banded = new Map();
  const pickFrom = (ids) => {
    let bk = banded.get(ids);
    if (!bk) {
      bk = { tiny: [], small: [], medium: [] };
      for (const id of ids) { const k = byId.get(id); if (k) bk[k.band].push(id); }
      banded.set(ids, bk);
    }
    let roll = rnd(), acc = 0;
    for (const [band, share] of BAND_SHARE) {
      acc += share;
      if (roll <= acc && bk[band].length) return bk[band][(rnd() * bk[band].length) | 0];
    }
    const all = bk.tiny.concat(bk.small, bk.medium);
    return all.length ? all[(rnd() * all.length) | 0] : null;
  };

  let made = 0;
  const drop = (kind, x, z, host) => {
    if (blocked(x, z)) return false;
    const y = sc.walker.floorAt(x, z);
    const g = new THREE.Group();
    g.position.set(x, y + 0.005, z);
    g.rotation.y = rnd() * Math.PI * 2;
    const sc2 = (BAND_SCALE[kind.band] || 1) * (0.86 + rnd() * 0.32);
    g.scale.setScalar(sc2);
    // A third of them have fallen over. Litter that all stands bolt upright
    // reads as a shop display; a cup on its side reads as a cup somebody put
    // down. The piece is lifted a little as it tips so its rim does not go
    // through the floor.
    if (rnd() < 0.34) {
      const tip = 0.5 + rnd() * 1.1;
      const dir = rnd() * Math.PI * 2;
      g.rotation.x = Math.cos(dir) * tip;
      g.rotation.z = Math.sin(dir) * tip;
      g.position.y += 0.02 * sc2 * (kind.band === 'medium' ? 3 : kind.band === 'small' ? 1.6 : 1);
    }
    host.add(g);
    // Every mesh of the piece carries the same group id, so the roll-up eats a
    // lute rather than eating its soundboard and leaving the neck lying there —
    // and so the BITE test measures the lute, not its longest stick. See
    // HPWorldScene._census / _resolveRollGroups.
    const gid = 'lit' + (made + 1);
    const place = (geo, mat, ox, oy, oz, o = {}) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(ox, oy, oz);
      if (o.rx) m.rotation.x = o.rx;
      if (o.ry) m.rotation.y = o.ry;
      if (o.rz) m.rotation.z = o.rz;
      if (o.sy || o.sz) m.scale.set(o.sx || 1, o.sy || 1, o.sz || 1);
      m.castShadow = false;
      m.receiveShadow = false;
      m.userData.roll = kind.name;
      m.userData.rollGroup = gid;
      g.add(m);
      return m;
    };
    kind.make(place, M);
    made++;
    return true;
  };

  // Every station gets its own kinds, scattered inside its radius, plus a
  // handful of the things that lie about everywhere.
  for (const st of STATIONS) {
    const ids = ZONES[st.key];
    if (!ids) continue;
    const isle = st.pos[1] < -95;
    const host = isle ? isleRoot : root;
    const R = (st.radius || 8) * 1.6;
    // More in a big place; the count is per station and scaled by its area.
    // Ted asked for LOTS, and the first pass gave one object per six square
    // metres, which reads as a tidy garden with something dropped in it rather
    // than as a floor to roll up. This is about one every square and a half.
    const n = Math.round(Math.min(560, 40 + R * R * 1.15) * density);
    for (let i = 0; i < n; i++) {
      const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * R;
      const x = st.pos[0] + Math.cos(a) * r, z = st.pos[1] + Math.sin(a) * r;
      const pick = rnd() < 0.22 ? EVERYWHERE[(rnd() * EVERYWHERE.length) | 0] : pickFrom(ids);
      const k = pick && byId.get(pick);
      if (k) drop(k, x, z, host);
    }
  }

  // …and a thin dusting over the whole mainland, so the ground between the
  // wonders is not bare. Small things only: the big ones belong to a place.
  const DUST = EVERYWHERE.concat(['sherd', 'coin', 'acorn', 'walnut', 'snail', 'chaplet', 'sandal']);
  const N = Math.round(2400 * density);
  for (let i = 0; i < N; i++) {
    const x = -52 + rnd() * 104, z = -60 + rnd() * 110;
    const k = byId.get(DUST[(rnd() * DUST.length) | 0]);
    if (k) drop(k, x, z, root);
  }
  // and over the island
  const IN = Math.round(1100 * density);
  for (let i = 0; i < IN; i++) {
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * 48;
    const k = byId.get(DUST[(rnd() * DUST.length) | 0]);
    if (k) drop(k, Math.cos(a) * r, -150 + Math.sin(a) * r, isleRoot);
  }

  return { pieces: made, kinds: KINDS.length };
}
