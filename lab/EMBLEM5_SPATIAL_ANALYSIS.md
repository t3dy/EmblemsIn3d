# Emblem V — spatial decomposition & depth estimation

*How I break the 1618 woodcut into elements and assign each one a place in 3-D space.
Written for Emblem V (the toad at the breast) but as a **repeatable method** — the same
seven steps run on any of the 50 Atalanta plates.*

Source plate: `images/emblems/emblem-05.jpg` (1200×1434, the whole book page).
Picture area cropped to `images/emblems/emblem-05-crop.png` (696×608).
Per-element cut-outs: `images/cutouts/emblem-05/*.png` (transparent PNGs, already extracted).

---

## 0. What the plate depicts (so the geometry can be *about* something)

Atalanta Fugiens, **Emblema V** — *"Appone mulieri super mammas bufonem, ut ablactet eum,
& moriatur mulier, sitque bufo grossus de lacte"* ("Lay a toad upon the woman's breasts,
that it may suckle, and the woman die, and the toad grow fat on the milk"). A cloaked man
presses a toad to a woman's breast in a Flemish town square; behind them, gabled townhouses
on the right, a town-hall / arcade block and cathedral spires on the left, a paved plaza
receding to a bright distance, two small townsfolk and a dog going about their day. The toad
is the *cold, fixed earth* drawing off the volatile (the milk); the everyday townscape is
the point — the Great Work hides in plain civic sight.

This matters for depth because Merian's engraver used a **standard raised-horizon,
near-one-point perspective**: a strong dark framing element at the left (a *repoussoir*),
the actors close and large in a shallow foreground, and the architecture stepping back to a
high, bright vanishing zone. That convention is what lets me read depth off a flat print.

---

## 1. The element inventory (decomposition)

I split the image into the smallest set of parts that (a) occlude each other cleanly and
(b) each sit at one describable depth. For Emblem V, nine elements, already matching the
cut-out files:

| # | element | cut-out file | what it is |
|---|---------|-------------|------------|
| E0 | **left pier** | (left edge of `castle.png`) | dark stone wall/pilaster framing the left margin |
| E1 | **the pair** | `woman.png` (man+woman+toad) | the two actors and the toad — the subject |
| E2 | **staffage** | `staffage.png` (keyed here) | two townsfolk + a dog in the mid plaza |
| E3 | **right house A** | `building_house.png` | near gabled townhouse, right |
| E4 | **right house B** | `building_house_02.png` | taller house behind/right of A |
| E5 | **left town block** | `castle.png` | town-hall / arcade / lower houses, left-mid |
| E6 | **low block** | `castle_02.png` | squat range of roofs, mid |
| E7 | **cathedral** | `castle_temple.png` | spired church cluster, far |
| E8 | **tower** | `tower.png` | single tall spire, far |
| — | plaza floor | (built) | the paved ground plane |
| — | sky | (built) | cloud band / infinite backdrop |

`hearth.png` and `window.png` are interior/detail fragments not used in the street scene;
`man_old_man.png` is a redundant *woman-alone* crop (kept as a spare).

---

## 2. The depth-cue toolkit (how I rank the elements front-to-back)

No single cue is trusted alone; I cross-check five, in this priority:

1. **Occlusion (hard evidence).** Who overlaps whom is unarguable. The pair (E1) overlaps
   the right houses and the plaza → E1 is in front of E3/E4. The left pier (E0) overlaps
   everything on the left → nearest on that side. This fixes *ordering* absolutely.
2. **Relative scale vs. known real size.** A person is ~1.7 m; a 4-storey house ~12–14 m; a
   church tower ~40–60 m. Comparing an element's *pixel height* to the near figures' pixel
   height, against its *real* height, gives a distance ratio: `D_x / D_fig ≈
   (real_x / px_x) ÷ (real_fig / px_fig)`. Worked below.
3. **Ground-line height.** Because the ground recedes upward to the horizon, an element whose
   *base* sits higher in the frame is farther away. The pair's feet are low; the cathedral's
   base is near the horizon → far.
4. **Perspective convergence.** The plaza paving and the right-house eaves converge up-left to
   a vanishing zone at roughly (x≈0.28, y≈0.30) of the picture — a high, left-of-centre
   horizon. Anything at that zone is at "infinity"; the rate of convergence spaces the
   mid-ground.
5. **Atmospheric / line-weight fade.** Merian draws distance with lighter, thinner hatching.
   The cathedral and tower are drawn faint → far; the pair are darkest, fullest line → near.

For a **still print** these agree. Where they disagree (rare), occlusion wins, then scale.

---

## 3. Worked scale → distance (the numeric spine)

Measured pixel heights in the 696×608 crop, and adopted real heights:

| element | px height | real height | `D / D_fig` (from scale) | occlusion says | adopted rank |
|---------|-----------|-------------|--------------------------|----------------|--------------|
| pair E1 | ~450 | 1.8 m | **1.0** (reference) | in front of all mid/far | **near** |
| left pier E0 | ~500 (full height) | ~4 m wall close up | ~0.8 (nearer, it's *cut* by frame) | overlaps left mid | **nearest** |
| right house A E3 | ~360 | ~12 m | (12/360)/(1.8/450) ≈ **8.3** | behind E1 | mid |
| staffage E2 | ~60 | 1.7 m | (1.7/60)/(1.8/450) ≈ **7.1** | on the plaza, behind E1 | mid |
| left block E5 | ~300 | ~11 m | ≈ **9.2** | behind E1, beside plaza | mid-far |
| cathedral E7 | ~150 | ~45 m | (45/150)/(1.8/450) ≈ **75** | base at horizon | far |
| tower E8 | ~150 | ~50 m | ≈ **83** | base at horizon | far |

Two readings of the numbers, both defensible, become the two theatre variants in §6:

- **Literal / true-depth:** honour the ratios — the cathedral really is ~75× the figure
  distance. Realistic, but the far elements become tiny specks and the box is enormous.
- **Compressed / stage-depth:** keep the *order* and relative spacing but log-compress the
  far distances, the way a stage set or a shadow-box does, so the cathedral still reads as a
  legible backdrop. This is what the print itself does — Merian already compressed real
  Antwerp into 6 cm of paper.

---

## 4. The coordinate system

Right-handed, metres, matching the existing worlds:

- **camera** starts at `(0, 1.65, +9.5)`, eye height 1.65 m, looking down −Z.
- **+X** right, **+Y** up, **−Z** into the scene (away from the viewer).
- The **pair sits at Z = 0**, feet on the plaza (Y = 0), so the subject is always the anchor.
- Everything else is placed *relative to the pair* using the ranks above.

---

## 5. The adopted depth ladder (compressed / stage-depth)

This is the ladder that drives the 3-D. `Z` is depth (more negative = farther); `X` is the
left-right placement read off the plate; height is the plane/mass height in metres.

| element | X | Z | height (m) | reasoning |
|---------|----|-----|-----------|-----------|
| left pier E0 | −6.5 | **+3.5** | 7.0 | *repoussoir*: nearest, dark, tall, frames the left — pulled toward camera |
| **pair E1** | 0.0 | **0.0** | 3.4 | the anchor; largest, darkest, lowest feet |
| staffage E2 | −4.0 | **−7.0** | 1.6 | small + on the plaza + behind the pair → mid |
| right house A E3 | +7.5 | **−4.0** | 7.5 | overlaps behind pair, near-right, looms |
| right house B E4 | +9.5 | **−6.5** | 8.5 | steps back-right from A |
| low block E6 | +2.5 | **−9.0** | 4.6 | squat mid range |
| left block E5 | −7.5 | **−8.5** | 8.5 | town-hall block beside the plaza |
| cathedral E7 | −5.0 | **−16.0** | 6.0 | far, faint, base near horizon |
| tower E8 | −1.5 | **−17.0** | 6.2 | far, faint, tallest silhouette |
| sky | 0 | −30 | — | infinite paper backdrop |

The **true-depth** variant multiplies every Z (except the pair) by ~2.2 and shrinks the far
elements' angular size accordingly, so the cathedral recedes to a distant speck.

---

## 6. From ladder to geometry — the four methods, and why each places things as it does

Each method consumes the **same ladder** but realises depth differently:

- **Cut-out theatre.** Each element becomes a flat, alpha-tested plane at its `(X, Z)`, sized
  to `height × (imageW/imageH)`. Depth is *between* the planes, not within them. Variants
  probe the ladder itself: shallow shadow-box (compress Z ×0.6), true-depth (×2.2), raked
  stage (planes toed-in and the whole set pitched like a diorama), grounded+staffage (add
  the plaza contact and E2).
- **Thick cut-outs / built set.** The figure planes gain real thickness (a stack of alpha
  slices swept through Z, so the silhouette becomes a solid); the buildings become massed
  boxes at the ladder's `Z`, with the engraving façade laid on the front face so the print
  survives while the block gives it volume. You can walk *between* the Z-layers.
- **Carved relief.** The ladder collapses to (near) one plane: the whole plate is a
  displacement surface, dark ink = incised. The layered-relief variant restores two rungs of
  the ladder — the pair on a nearer relief panel in front of the town relief — so the
  monument keeps a little parallax.
- **Sculptural rebuild.** The ladder places *modelled masses* (posed figures, roofed houses,
  a towered church) at each `Z`. Real volume everywhere, but the engraved line is gone —
  included to show the trade honestly.

---

## 7. Caveats (so this isn't over-claimed)

- This is **perspective-informed estimation, not metric photogrammetry.** A single engraving
  has no true depth; I am reconstructing a *plausible* stage consistent with the picture's own
  perspective and occlusion, then compressing it for legibility.
- The cut-outs are **flat**: walk 90° to the side and a standee shows its edge. That is a
  feature in the theatre reading (toy-theatre honesty) and a bug in the walk-through reading
  (why the thick/built and sculptural methods exist).
- Line-weight/atmosphere cues are **soft**; I lean on occlusion + scale for anything load-
  bearing.
- Staffage keyed from paving is **noisy** at close range; it is only ever a distant cue.

---

## 8. Templating to the other 49

The method is plate-agnostic; only the inventory changes. The repeatable loop:

1. Crop the picture area from the page plate.
2. List elements that occlude cleanly; pull/allocate a cut-out per element.
3. Rank front-to-back by **occlusion → scale-vs-real-size → ground-line → convergence →
   atmosphere**.
4. Fix the subject at `Z = 0`; place the rest on the ladder relative to it.
5. Identify the *repoussoir* (nearest dark frame) and any staffage (distance cues).
6. Feed the ladder to whichever method won the Emblem-V bake-off.

Emblems with a single dominant figure and a plain ground (e.g. the many "one alchemist +
apparatus" plates) collapse to a 3-rung ladder (repoussoir? / subject / backdrop); the
crowded processional plates will need a longer inventory but the same five cues.
