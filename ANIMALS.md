# Animals and beasts

*Which creatures the book puts in the world, what they are doing there, and how they are
built.*

**Read first** (`SOURCES.md` asset map): `hp.db.folio_descriptions` and `woodcut_catalog`
for the folio in question; **Curran** for the elephant and the Egyptian beasts; **Nygren**
where a beast is statuary rather than flesh.

---

## 1. The beasts that carry meaning

### The wolf
The first living thing in the dream. It watches the path in the Dark Wood and does not move
— the dreamer's terror is that it is *indifferent*, not that it attacks. Built as a
quadruped in `Cast.animals.wolf`, placed by `_buildWood()` and labelled.

### The elephant bearing the obelisk
The book's central Egyptian-revival monument and Curran's subject. Not an animal so much as
a piece of architecture in animal shape: a hollow stone beast on a porphyry base, carrying a
green Lacedaemonian obelisk, with a door in its flank and an inscription on its frontlet —
ΠΟΝΟΣ ΚΑΙ ΕΥΦΥΙΑ, *labour and native wit* — and CEREBRVM EST IN CAPITE on the breast-strap.

It was a squashed sphere, four cylinders and a sphere head. It is now modelled from the 1499
plate **and from Bernini's *Elephant and Obelisk* of 1667** — the direct descendant of this
design, and already in the project's Gallery. It has a barrel built from three masses (an
elephant has a distinct shoulder and rump), columnar legs with the broad foot pads that make
an elephant legible, a domed skull with the woodcut's high forehead, large dished ears,
curved two-segment tusks, an eye, a tail, and Bernini's tasselled caparison seating the
obelisk.

**Variants** (Graphics menu → *The elephant & obelisk*): `primitive` and `massed`.

### The dragon
Poliphilo flees it through the dark vaults beyond the Great Portal — one of the book's few
moments of physical danger. `Cast.animals.dragon`.

### The ant and the elephant
The book's own hieroglyph of concord and discord as one thing: the ant that grows into an
elephant and the elephant that dwindles into an ant. Built as an animated hieroglyph
(`_hiero`), and the ant is one of the six signs in the carved hieroglyph bands on the Great
Portal's piers (`ORNAMENT.md`).

### The teams of the triumphs
Six beasts to a car, each with a rider: **centaurs** for Europa, **elephants** for Leda,
**horses** for Danaë, **leopards** for Semele. See `VEHICLES.md`.

### Venus's doves
They dip their golden bills in the spotless waters and bedew the goddess — the Theatre of
Venus. Built as birds about the fountain.

---

## 2. The wider bestiary

`Cast.animals` carries, and the Atalanta side of the project uses heavily: wolf, dog, lion,
stag, unicorn, bull, sow, goat, horse, toad, serpent, dragon, ouroboros, bird, eagle, crow,
swan, hen, fish, salamander.

Several of these are alchemical rather than zoological — the ouroboros, the salamander in
fire, the toad. They belong to Maier's emblems more than to Colonna's dream, and are
documented on that side of the project.

---

## 3. How a beast is built

All are primitive-built groups in `Cast.js`, most from a shared `quadruped()` with
parameters for bulk, neck, head and horns. They are registered as NPCs so they sway gently
rather than standing frozen, and they are fenced off from the draw-call compiler so that
motion survives the merge.

## 4. Known gaps

- **The griffins and harpies of folio 80's fountain are not built.** The harpies exist as
  small carved figures on the portal; the griffins do not exist at all. Open in
  `NEXTSTEPS.md`.
- The beasts have **no variant ladder** — unlike trees, figures, water and ornament, there is
  only one build of each. The elephant is the exception.
- Anatomy across the bestiary is uneven: the elephant has had a modelling pass, the rest have
  not. The wolf in particular reads as a smooth quadruped rather than a wolf.
- No animation beyond idle sway. The triumph teams do not walk.

## 5. Where the code is

| | |
|---|---|
| The bestiary | `src/systems/Cast.js` — `animals.*`, `quadruped()` |
| The elephant | `src/scenes/HPWorldScene.js` — `_buildElephant()` |
| The wolf in the wood | `_buildWood()` |
| The triumph teams | `_buildTriumphs()` |
| Variant registry | `src/systems/AssetVariants.js` — asset `elephant` |
