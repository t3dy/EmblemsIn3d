# Modeling — the Cast

**Current state.** [Cast.js](../../src/systems/Cast.js) is a parametric troupe built from three.js
primitives: `figure()` (cone robe + capsule torso + sphere head + two arm pivots), `nymph()`
(figure + hair sphere), a generic `quadruped()` specialised into ~15 beasts, and ~35 props.
Pivots at the feet, named parts in `userData` (`armL`, `armR`, `head`, `wingL`…). It's a good
system — one file dresses both worlds — but the figures read as "chess pawns with arms."

## Ranked suggestions

### 1. Nymph silhouette upgrade ★ the big one
The nymph is currently a cone. The 1499 woodcuts and the School-of-Fontainebleau Diana
(see [research/nymphs.html](../../research/nymphs.html)) agree on a very different silhouette:
high waist, long fall of skirt, small head (~8½ heads tall), visible feet.

- Replace the robe cone with a **`THREE.LatheGeometry`** profile: shoulders → cinched high
  waist → gentle A-fall → slight flare at hem. ~10 profile points, 12 segments ≈ 240 tris.
- Add a second, shorter lathe (or scaled clone) as an **overgown/peplum** in a second colour —
  instantly reads as Renaissance dress, costs one draw call (share geometry across nymphs).
- Neck: a short capsule between torso and head fixes the "head floating on shoulders" look.
- Hair: swap the bare sphere for sphere + **fillet torus** (the woodcuts' hair-band) + a small
  chignon sphere at the back. Three primitives, instantly "1499."
- Hands: 0.03-radius spheres at arm ends. Gestures (point, offer, beckon) currently terminate
  in a rounded capsule stump; a hand-sphere makes every existing pose read better for free.

*Effort: 1–2 sessions. Impact: every named character in both worlds.*

### 2. Drapery fold hints (Goujon's lesson)
Goujon's fountain nymphs carve folds as a few long directional ridges. On a lathe gown this is
one line of code: displace the lathe profile's theta rows with a low-frequency sine
(`r += sin(4θ)·0.008`) to make 4 soft vertical folds. Do **not** attempt cloth sim.

### 3. Faces in the woodcut style — decal, not geometry
A 32×32 canvas texture with two dots and a line, applied to the head sphere only in the
`woodcut` style, matches the plates' dozen-stroke faces. In the lit style keep faces blank —
blank reads as statuary, which suits the garden; drawn features would read as dolls.

### 4. Beast quality pass, one animal at a time
`quadruped()` legs are straight cylinders planted wide. Two cheap wins:
- Taper + splay: legs as slightly tilted cones read as hocks/pasterns.
- Tails: every quadruped gains one — a thin curved tube (wolf, lion, horse) fixes the
  "furniture" silhouette from behind, where players see them at stations.

### 5. Prop reuse for the HP wonders
The Great Portal, Three Doors wall and Palace are built ad hoc in
[HPWorldScene.js](../../src/scenes/HPWorldScene.js). Promote **obelisk, pergola, and
relief-plaque** to `props` so the AF world (and future scenes) can reuse them; conversely,
`props.column` should replace the Palace's hand-rolled columns.

### 6. Reclining nymph monument 🍎-adjacent
Per the sourcebook (Cranach / the pag073 woodcut): one `figure({pose:'recline'})` on a stone
slab with an epigram plaque (`FONTIS NYMPHA SACRI…`) beside the dark-wood spring. All parts
already exist in the toolkit — it's a placement, not a build. The single highest
meaning-per-triangle addition available.

## Non-goals
- Skinned/rigged meshes, GLTF imports, morph targets — the primitive-troupe aesthetic is a
  feature (loads in ms, styles uniformly, woodcut-shader-safe). Upgrade silhouettes, not tech.
