# Plants and planting

*What grows in the Dream Garden, why those species, and how they are built.*

**Read first** (`SOURCES.md` asset map): **Hunt** on the *experience* of gardens in the HP;
**Segre** on knot-gardens and parterres; Fabiani Giannetto; and the project's own
`GARDENS.md`. The relevant lexicon entries are *Topiary*, *Pergola*, *Circular Garden*,
*Water Garden* and *hortus conclusus* — see `research/lexicon.html`.

---

## 1. The species, and why these — from the text (rewritten 2026-09-06)

Ted: *"You were supposed to read the scholarship and the novel itself and get the actual
names of the plants and trees and render them accordingly."* So this table is the book's,
with the place each species is named for. Word-counts are hits in the 1592 and in our
translation of XVII–XXXVIII; the 1592 spellings are given where they differ.

| Species | Where the book puts it | Text |
|---|---|---|
| **Oak** (*oke*), **beech**, **elm** with its vine, **fir** | the dark wood, ch. I | 1592 l. 625: "towgh Elmes beloued of the fruitfull vines, harde Ebony, strong Okes, soft Beeche"; fir boughs at l. 500 |
| **Cypress** | the way to the palace, ch. VII; the rim of Cythera's bosco; conifers of the first terrace | 1592 p. 123: "a waye set on either sides with Cyprus Trees"; our pp. 317–319 |
| **Citron, orange, lemon** (*Cytrons, Orenges and Lymonds*) | the enclosure before the palace, ch. VII; the bitter-orange espalier of Cythera; the spice wood | 1592 p. 123; our pp. 311–313, 324 |
| **Myrtle** | Venus's plant: the grove about her fountain, beneath the bosco's cypresses, about the theatre | our pp. 311, 322–325 (46 hits in XVII–XXXVIII) |
| **Laurel** | the crowns of nymphs and poets; a bosco compartment | our pp. 318, 321, 327, 330 |
| **Pine** (umbrella) | a bosco compartment; the terraces | our pp. 317, 320, 323 |
| **Juniper, olive, arbutus, palm, plane** | bosco compartments and the spice wood | our pp. 317–318, 324 |
| **Apple, pear, plum** | the prati's corner fruit trees, 240 in all (Segre) | our pp. 326–330 |
| **Box** (*boxe*) | every hedge, knot and topiary | 97 hits; GARDENS.md §5 |
| **Willow, poplar** | by water | our p. 312 |
| **Rose, jasmine, ivy, vine** | the pergolas and Polia's garden | passim |

## 2. How a tree is made (rewritten 2026-09-06)

A canopy of overlapping spheres reads as a blob at any distance. A canopy of **leaf-spray
cards** reads as foliage, because the silhouette breaks into leaves and light comes through.
So `HPWorldScene._tree()` now works from a **species table** (`HPWorldScene.SPECIES`): each
species has a leaf form (scale, needle, lanceolate, ovate, narrow, lobed, palmate, frond), two
foliage tones, a crown shape, a trunk, bark colour, and extras — fruit, blossom, the vine
trained up the elm, the plane's flaking bark, the olive's twisted double stem, the willow's
hanging crown, the palm's radiating fronds. `_leafCardTexture(species)` draws one spray of
that leaf; `_canopyCards()` scatters ~40–70 half-metre cards through the crown at fixed
random orientations (not billboards — a card that turns to face you is a sticker), over a
dark matte core that makes the gaps read as shadow rather than sky. Cards are capped at
about a metre: a big crown gets *more* cards, not bigger ones.

The woodcut register keeps the massed silhouette (ink wants a shape, not leaves), and the
`primitive` variant keeps the founding cone.

## 3. The planting logic

- **The Dark Wood** — a dense deterministic scatter of 64 trees of oak, beech, elm and fir —
  the species the text names — keeping the path clear. No cypress: that is a garden tree. Dark duff underfoot. The *selva oscura*: the wood is so
  thick "neither light nor path survives beneath the crowns."
- **The garden proper** — trees ringing the fountain grove and lining the processional
  approaches, with the ring deliberately open toward the shore so Cythera stays visible.
- **Cythera** — terraced planting that inverts the usual logic, tallest at the outside, so
  the eye reaches the fountain at grade. Flowery lawns each with a fountain or topiary at the
  centre.
- **The meadow** — instanced grass and flower drifts over the open sward, with pollen motes
  in the air.

## 4. Known gaps

- **Segre's parterres and knot gardens — built 2026-09-06** (`_buildParterres`), from our
  pp. 316–318 in Segre's ring order: the box rampart with its towers and clipped triumphs;
  the first cloister of circles (a cypress in each) alternating with rhombs (a pine in each)
  and savin at the road-edges; the second cloister of orange towers, hedges of eight kinds,
  box crescent-horns with a tiered juniper and a box-sphere on a stalk, and the knotwork
  square as the terrace tile; the spice wood innermost. The flower beds are flat and
  flowered, not tubes.
- Topiary exists but is not worked from the specific clipped forms the 1499 plates show
  (the peacocks-on-an-altar-vase figure is catalogued and unbuilt).
- No seasonal or diurnal variation in planting colour.

## 5. Where the code is

| | |
|---|---|
| Garden trees, meadow, hedges | `src/scenes/HPWorldScene.js` — `_tree()`, `_buildTrees()`, `_buildMeadow()` |
| Wood trees | `src/systems/Cast.js` — `props.tree()` |
| Variant registry | `src/systems/AssetVariants.js` — asset `tree` |
| Briefs | `GARDENS.md`, `research/lexicon.html` |
