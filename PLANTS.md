# Plants and planting

*What grows in the Dream Garden, why those species, and how they are built.*

**Read first** (`SOURCES.md` asset map): **Hunt** on the *experience* of gardens in the HP;
**Segre** on knot-gardens and parterres; Fabiani Giannetto; and the project's own
`GARDENS.md`. The relevant lexicon entries are *Topiary*, *Pergola*, *Circular Garden*,
*Water Garden* and *hortus conclusus* — see `research/lexicon.html`.

---

## 1. The species, and why these

The book names its plants. The world plants the ones it names, rather than generic trees:

| Species | Why it is here | How it is built |
|---|---|---|
| **Cypress** | The signature tree of an Italian garden, and the book's crowning cypress arcade on Cythera's top terrace. | Columnar: four stacked, offset, tapering masses so the silhouette wavers instead of being a cone. |
| **Umbrella pine** | The Roman pine of the antiquarian landscape. | A long bare trunk, four high branches, and a wide flat crown floating above them. |
| **Laurel** | The evergreen of crowns and of Apollo; what the nymphs are wreathed with. | Short trunk splitting into three or four boughs under a dense round mass. |
| **Myrtle** | Venus's own plant. Its presence in a garden is never neutral in this book. | As laurel, in a darker green. |
| **Orange** | The book's orchards, and the fruit trees of Botticelli's own grove — the painting the garden's figures are cut from is set among orange trees. | Rounded low canopy on three boughs, bearing fruit. |

Plus **topiary** (clipped forms on stepped bases, per the 1499 plates and the lexicon entry),
**hedges**, **rose hedges** in Polia's garden, and the **flowery mead** — "at once meadow and
garden" — ringing the fountain.

## 2. How a tree is made

The trees were the single worst asset in the world: one `CylinderGeometry` trunk and one
`ConeGeometry` canopy, in every garden and in the Dark Wood. One smooth primitive has no
branch structure and no foliage mass, so it cannot catch light the way a painted tree does.

They are now built the way a Quattrocento painter draws them:

- a **tapered, slightly leaning trunk** with a **root flare**, so it grows out of the ground
  rather than sitting on it;
- **real boughs** — tapered limbs oriented by quaternion between two points;
- a canopy of **several overlapping, jittered ellipsoids in two tones** — a lighter crown
  over a darker underside — so the mass has a lit side;
- everything **seeded from position**, so the garden and the wood are identical on every load.

Two places make trees and both were fixed: `HPWorldScene._tree()` for the garden and
`Cast.props.tree()` for the Dark Wood. Fixing only one left half the world in cones.

**Variants** (Graphics menu → *Trees & foliage*): `primitive` keeps the founding cone —
which is also what woodcut mode prefers, since flat ink wants a readable silhouette —
and `massed` is the built-out version. Default is `massed`.

## 3. The planting logic

- **The Dark Wood** — a dense deterministic scatter of 64 trees, roughly 60/40 cypress to
  broadleaf, keeping the path clear. Dark duff underfoot. The *selva oscura*: the wood is so
  thick "neither light nor path survives beneath the crowns."
- **The garden proper** — trees ringing the fountain grove and lining the processional
  approaches, with the ring deliberately open toward the shore so Cythera stays visible.
- **Cythera** — terraced planting that inverts the usual logic, tallest at the outside, so
  the eye reaches the fountain at grade. Flowery lawns each with a fountain or topiary at the
  centre.
- **The meadow** — instanced grass and flower drifts over the open sward, with pollen motes
  in the air.

## 4. Known gaps

- **Segre's parterres and knot gardens are not built.** The lexicon has *Circular Garden* and
  *Water Garden* as terms; the world has planting but not the geometric knot-work the
  scholarship makes central. This is the biggest unbuilt garden item.
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
