# Litter — the small Renaissance things on the floors, Roll Up only

*Subject brief, 2026-09-08. `src/systems/Litter.js`. Ted: "tiny small and medium Renaissance
objects to litter the floors in the rolling mode only so there are lots of small things to
roll up." Read with [`MODES.md`](MODES.md) and [`ROLLMODE.md`](ROLLMODE.md).*

---

## 1. The catalogue was mined, not imagined

Seventy-two kinds, every one a concrete portable noun counted across the two translations
this repo can legally read — Dallington 1592 for I–XVI, ours for XVII–XXXVIII — with the count
kept as each kind's `src`. Urns (67 / 193), cups (38 / 373), lamps (12 / 53), torches (8 / 58),
mirrors (1 / 84), quivers (0 / 22), harps (43 / 28), sandals (2 / 20), dice (3 / 8), pearls
(42 / 61), beehives (Dallington 15). No barrels, no bottles, no candlesticks: the book has none.

Bands by the roll-up's own measure (mean half-extent): **tiny** 2–7 cm (coins, pearls, beads,
gems, coral, acorns, walnuts, snail shells, dice, sherds, gold nails, tesserae, pins);
**small** 8–22 cm (cups, goblets, bowls, dishes, platters, phials, casting bottles, combs,
shining glasses, keys, seals, tapers, lamps, knives, spoons, salt-cellars, tablets, scrolls,
books, inkhorns, purses, sandals, gloves, chaplets, spindles, flutes, chisels, mallets,
trowels, plumb-bobs, compasses, sickles, arrows); **medium** 25–70 cm (urns, amphorae, vases,
ewers, baskets, braziers, tripods, torches, lutes, harps, sistra, timbrels, trumpets, shields,
helmets, quivers, chests, stools, beehives, gourds, cornucopiae, oars, cart wheels, rakes).

## 2. Every object is where it belongs

The zoning is the joke and half the use — **you can tell where you are by what you are
eating**: combs, mirrors, phials, casting bottles and sandals at the five nymphs' bath (their
own attributes); platters, knives and salt-cellars in the court; dice in the chess court;
urns, sherds and grave-lamps in the Polyandrion; chisels, mallets, trowels, plumb-bobs and
compasses at the Great Portal; sickles, rakes and beehives in the fields; books, scrolls and
an inkhorn at Treviso; arrows, quivers, chaplets and oars on Cythera. About one object per
square metre and a half; 8,976 in all, a third of them fallen over.

## 3. Four things that had to be right

- **An object is one thing.** Every mesh of a piece carries the same `rollGroup`;
  `_resolveRollGroups` gives the group one size and one centre; the ball eats the lute, not
  its soundboard. (The same helper, `_rollGroup`, now serves the banquet tables, the exeres
  hull and the Adonis sepulchre.)
- **Bands at their own scale and share** — medium × 1.75, filled 55 / 30 / 15 by band.
- **A third have fallen over**, lifted a little as they tip.
- **One bare octahedron cost 500 draw calls**: `PolyhedronGeometry` is not indexed and
  poisons its merge bucket. Indexed, the whole litter costs 34 meshes and no draw calls.
  Recorded in `ROUTER.md`.

## 4. How it plays

| Mode | What the reader meets | What it owes / still owes |
|---|---|---|
| **Walk** | Nothing. Litter is built only under `{ rollup: true }`; the garden is not carpeted in dropped cutlery. | — |
| **Tour** | Nothing, and nothing owed: the tour walks the same litter-free world. | — |
| **Dream** | Nothing. | — |
| **Fly** | Nothing. | — |
| **Roll** | Nine thousand named things on the floors, zoned by station, in three bands that match the ladder of the metals — a walnut of lead eats coins and pearls; a foot of copper eats cups and combs; a metre of silver eats urns and cart wheels. | Nothing is *inside* anything (a basket is empty; a quiver's arrows are modelled in); placement avoids walls but not water; twelve stations have no zone list; the noun count has more attested kinds unbuilt — thyrsus, caduceus, sceptre, cushion, spade, dagger, cymbal, ladder, plough, anvil. |
| **Layers** | None. The litter has no commentary; its citation is the count on each kind. | A *gloss* on the Roll card for the odder words (melledarum, Hormisine, casting bottle) would earn its place. |
