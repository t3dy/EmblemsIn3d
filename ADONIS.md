# Adonis — the sacred fountain and the sepulchre that close Book I, mode by mode

*Subject brief, 2026-09-08. Chapter XXIV, our pp. 369–379 — the last chapter of Book I, and
the first thing the coverage ledger ever found. Built as `HPWorldScene._buildAdonis` on
Cythera, station `adonis` ("The Fountain of Adonis"). Read with [`MODES.md`](MODES.md).*

---

## 1. Why it was missing

Chapter XXIV has **no woodcut**. Every coverage check this project ran before the ledger was
driven by the plate catalogue, so a chapter with no plate was invisible to all of them — the
same failure that left the vaults under the pyramid unbuilt for months. Tour stop 25, *The
Tomb of Adonis*, pointed at the theatre's geometry; `grep -i adonis` found nothing. Rule 6 of
`ROUTER.md` exists because of this chapter and chapter V.

## 2. What the book gives, and what stands there

- **The fountain** (p. 371): a hexagon twelve paces about, borders of Macedonian marble
  (p. 370), and **a golden serpent creeping from a cleft of rock, coiled in a globe "to curb
  the force of the water"** (p. 373) — the book's plumbing as design criticism.
- **The citrus cloister** in its "alternating marriage" of orange, lemon and citron, full of
  nightingales, thrushes and solitary blackbirds (perched birds, from the flock in
  `_buildBirds`).
- **A foot-high lattice of red sandalwood** carrying hundred-petalled roses; a grove of
  cornel-cherry, cypress, palm, poplar and pine with trunks clear of branches; a tessellated
  pavement grassed over with sheared thyme; the rivulet under the manna-ashes.
- **The alabaster sepulchre**, five feet long: Venus tearing her calf in the roses and Cupid
  catching the blood in an oyster-shell on one side; Adonis, the hunters, the dogs and the
  boar on the other (drawn as reliefs, `_adonisRelief`); a **jacinth** stopping the repository
  in front, lit from behind and "burning unsteadily"; on the lid **Venus recumbent in
  three-coloured sardonyx, in childbed, giving suck to Cupid**, her foot out over the rim for
  the nymphs to kiss, the distich beneath.
- **The roses are white.** The rite of the Kalends of May (pp. 375–376) is the origin of the
  red rose, and Poliphilo sees them *before* it. A plaque says why.

## 3. Decisions

- Venus is a **built figure, not a painted card**: the book has stone here, and a Botticelli
  cut-out would stand two metres over a sarcophagus five feet long.
- Cornel stands as plum and poplar as willow — the two species the `SPECIES` table lacks —
  matched by leaf and habit rather than invented.
- One bosco compartment of Cythera was given over to it, and the road on that compartment
  now ends at the grove.
- **The rite is not enacted.** It is enumerated as unbuilt: a four-part ceremony with a
  calendar, which wants what the Triumphs got — a timed sequence you can stand in.

## 4. How it plays

| Mode | What the reader meets | What it owes / still owes |
|---|---|---|
| **Walk** | Station 25 on Cythera: the road ends at the grove; through the citrus and the rose-lattice to the hexagonal fountain, the serpent, the tomb with its flickering jacinth, the recumbent Venus, the two plaques (the distich; why the roses are white). | The rite. |
| **Tour** | Stop 25 now points at its own station. Two *quotation* notes added: the fountain and its serpent (pp. 371, 373) and why the roses are white (pp. 375–376). *Myth*, *Allegory*, *Gloss*, *Literary*, *Context* already spoke. | — |
| **Dream** | **The thirteenth stop**, added 2026-09-08: the dream jumps to the island (the crossing is Cupid's, not the walker's) and comes up the road that ends at the grove; three beats — the serpent, the sepulchre and the kiss, the white roses and the rite — each with our translation quoted; a reaction whose canonical mood is *wonder*, the kiss "with utmost religion". | — |
| **Fly** | A round clearing in the bosco with a white tomb in it, visible from the theatre's height. | — |
| **Roll** | The sepulchre is **one object** (`_rollGroup('adonis_sepulchre')`), r ≈ 0.5 — medium. The white roses are "a white rose of the hundred leaves", the lattice "a lattice of red sandalwood", the serpent's coils "a coil of the golden serpent", the jacinth by name, the onyx and sardonyx by their veins, the foot "the holy foot, which the nymphs kissed". The station has a litter zone (chaplets, phials, lamps, urns). | — |
| **Layers** | *Poliphilo speaking*: a **silence** is recorded for stops 24–25 — he kneels, kisses the foot "with utmost religion" (p. 374), and Book I ends without a word from him. | *Alchemical* and *Architectural* are silent here, rightly. |
