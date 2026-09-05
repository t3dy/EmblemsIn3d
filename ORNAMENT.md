# Ornament and wall decoration

*The carved and lettered surfaces of the world — friezes, hieroglyph panels, inscriptions,
mouldings — what the sources require and how they are built.*

**Read first** (`SOURCES.md` asset map): **Curran** on the hieroglyphs, the obelisks and the
gates — the Egyptian revival is his subject and the HP is his central case; **Priki** on
hieroglyphs as narrative; **Lefaivre** on architecture-as-body and the orders; and
`hp.db.woodcut_catalog`. Lexicon entries: *Hieroglyph*, *Mosaic*, *Column Orders*,
*In-Text Inscription*.

---

## 1. Why ornament matters here more than in most projects

The HP is a book about looking at surfaces and reading them. Its inscriptions are not
decoration around the story — they *are* episodes: the dreamer stops, reads, and the reading
is the event. Plain masonry with a caption floating over it is not a reading of the book.

Curran's argument in particular is that the hieroglyphs are meant to be *read* as a
wisdom-language, not admired as pattern. So the signs are carried as a band of figures, in
sequence, at eye height.

## 2. What is carved

**Variants** (Graphics menu → *Wall decoration & ornament*): `primitive` leaves plain masonry
with lettering plaques; `carved` *(default)* bands the architecture with relief.

Three bands, drawn from the sources rather than invented:

- **The Greek meander** along the friezes — the key pattern, the most basic classical band.
- **Egg-and-dart** as the astragal beneath it.
- **Egyptianising hieroglyph panels** down the piers, with the signs Curran identifies: the
  **sun disc**, the **eye**, the **vessel**, the **anchor**, the **ear of corn**, and the
  **ant** — the last for the book's own hieroglyph of concord, the ant that grows into an
  elephant and the elephant that dwindles into an ant.

Applied to the **Great Portal**: meander on the lintel, egg-and-dart astragal beneath, and
two hieroglyph bands on each flanking pier.

**How it is made.** The relief is painted into the albedo *and* used as a bump map, so
mouldings read in the tempera register without needing real geometry for every course. The
canvas draws each motif twice — once dark and offset down, once light and offset up — which
is how a carved edge catches light. See `RENAISSANCEART.md` §2 on why style goes in the
texture rather than in a screen-space pass.

## 3. Lettering

The world is full of real inscriptions, set on plaques with a main line and a translation:

- **SOLI DICATVM** — *dedicated to the Sun*, on the Great Portal, which the book says is
  lettered in Latin, Greek and Arabic.
- **ΠΟΝΟΣ ΚΑΙ ΕΥΦΥΙΑ** — *labour and native wit*, the elephant's frontlet.
- **CEREBRVM EST IN CAPITE** — *the brain is in the head*, its breast-strap.
- **ΛΙΧΑΣ ΩΡΘΩΣΕΝ ΜΕ** — *Lichas the Libyan set me up*.
- **ΑΕΙ ΣΠΕΥΔΕ ΒΡΑΔΕΩΣ** / *semper festina tarde* — always hasten slowly, on the **bridge**,
  with the anchor-and-dolphin. Curran shows this hieroglyph belongs to the bridge into
  Eleuterylida's realm and **not** to the Great Portal, where an earlier build had hung it.
- **ΘΕΟΔΟΞΙΑ · ΕΡΩΤΟΤΡΟΦΟΣ · ΚΟΣΜΟΔΟΞΙΑ** — the three doors: the Glory of God, the Mother of
  Love, the Glory of the World.
- **ΑΣΑΜΙΝΘΟΣ** — the bath.
- **ΠΑΝΤΩΝ ΤΟΚΑΔΙ** — *to the mother of all things*, the sleeping nymph's spring.
- **ΑΟΡΙΚΤΗΤΟΙ** on Cupid's standard; *AMOR VINCIT OMNIA* as the boat's rebus;
  *TRAHIT SUA QUEMQUE VOLUPTAS* — each is drawn by his own pleasure — cut in lodestone at the
  fountain.

That correction about *festina lente* is worth keeping in view as the type of error to avoid:
the motto is famous, the association with Aldus is famous, and putting it on the grandest
available surface was an invention. The scholarship said otherwise.

## 4. Mouldings and members

Ornament also means the profile of things. A shared vocabulary of classical members now
exists so buildings are made of the same parts rather than improvising boxes:

- **`_column()`** — plinth, torus, scotia, torus (the attic base), a fluted shaft with
  entasis, a necking, and a capital proper to its order: Doric echinus and abacus, Ionic with
  a pair of volutes, Corinthian with two tiers of acanthus.
- **`_entablature()`** — architrave in three fasciae, frieze, dentils, cornice and corona.
- **`_steps()`**, **`_doorway()`** — crepidoma; jambs, lintel, moulded surround.

`Cast.props.column()` was likewise upgraded from a box-cylinder-box, which is what made the
garden's pergolas read as scaffolding.

## 5. Known gaps

- **Mosaic** is a lexicon term and does not exist in the world.
- The carved bands are applied to the **Great Portal only**. The Three Doors wall, the
  palace, the bridge, the Polyandrion and Cythera have the members but not the relief.
- No **figural** relief anywhere — the book's friezes carry scenes (the bull with nude figure
  and satyrs, `woodcut_catalog` #146) and ours carry pattern.
- The **Polyandrion's epitaphs** are placed but the tombs' carved ornament is not worked from
  Bury or Griggs.

## 6. Where the code is

| | |
|---|---|
| Carved bands | `src/scenes/HPWorldScene.js` — `_ornamentCarved()`, `_carvedTexture()`, `_frieze()` |
| Classical members | `_column()`, `_entablature()`, `_steps()`, `_doorway()` |
| Inscriptions | `_plaque()` |
| Column prop | `src/systems/Cast.js` — `props.column()` |
| Variant registry | `src/systems/AssetVariants.js` — asset `ornament` |
| Architecture brief | `ARCHITECTURE.md` |
