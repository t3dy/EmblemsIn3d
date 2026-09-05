# Mythology in the Dream Garden

*Which gods and fables the book puts in the world, what they are doing there, and how they
are built.*

**Read first** (`SOURCES.md` asset map): **Nygren** on the statuary and on antiquarian
beholdership — how a Renaissance viewer was expected to look at an antique god; **Curran**
for the Egyptian material; and `hp.db.folio_descriptions` for the folio in question.

---

## 1. The four triumphs

The processional heart of the book. Four triumphal cars cross the garden, each celebrating
one of Jupiter's loves — the god's transformations, which is the point: divinity taking a
shape in order to desire.

| Triumph | Motif | Team | Where |
|---|---|---|---|
| **Europa** | the bull | centaurs | east, near |
| **Leda** | the swan | elephants | west, near |
| **Danaë** | the shower of gold | horses | west, far |
| **Semele** | the fire | leopards | east, far |

Built in `TRIUMPHS` (`HPWorldScene.js`) and `_buildTriumphs()`. **Each car is drawn by six
beasts, not a pair**, and every beast carries a rider — the book is specific about this and
an earlier build was not.

The reading to keep in view: these are not decorative. Jupiter becomes a bull, a swan, gold
and fire in order to reach Europa, Leda, Danaë and Semele. The triumphs are a catalogue of
desire changing shape, staged as a Roman triumph — which is why Mantegna's *Triumphs of
Caesar* is in the Gallery as the visual exemplar.

## 2. Venus, and what the whole garden walks toward

Venus is the destination. The world is arranged so that the dreamer moves toward her:

- **The Fountain of Venus** — seven columns of named gemstones, an arcade, a crystal cupola,
  a carbuncle at its peak, and the goddess standing in the salt water "up to her ample and
  divine flanks", her hair floating on the surface. The curtain of Hymen hangs between the
  sapphire and emerald columns, split where Poliphilo struck it with Cupid's arrow.
  Built from chapter XXIII; see `WATER.md`.
- **The marble Venus** — a CC0 scan of the antique Capitoline Venus stands in the fountain in
  place of the built figure. The one imported model in the world (`IMPORTEXEMPLARS.md`).
- **The Temple/Theatre of Venus** on Cythera, and the tomb of Adonis beyond it, where Venus's
  yearly rite of mourning is kept — grief inside the garden of pleasure, on which note Book I
  closes.

## 3. Cupid, Priapus, Adonis

- **Cupid** steers the boat to Cythera; his standard is lettered ΑΟΡΙΚΤΗΤΟΙ and the boat's
  own rebus reads *Amor vincit omnia*.
- **Priapus** — the rite before the altar, one of the book's frankest woodcuts.
- **Adonis** — the tomb and the sacred spring at the close of Book I.

## 4. The Egyptian layer

Not Greek myth but the book's other mythology, and Curran's subject: the elephant bearing
the obelisk, the hieroglyph gates, the boat standard, the obelisks. The book reads
Egyptian signs as a wisdom-language — *prisca sapientia*, in the lexicon's terms. The
ornament pass puts real hieroglyph bands on the Great Portal's piers (`ORNAMENT.md`), with
the signs Curran identifies: the sun disc, the eye, the vessel, the anchor, the ear of corn,
and the ant — the last for the book's own hieroglyph of concord, the ant that grows into an
elephant and the elephant that dwindles into an ant.

## 5. The faculties as persons

The book's most characteristic move: abstractions walk about as people. Queen
**Eleuterylida** is Free Will (*eleutheria*, "daughter of freedom"); **Logistica** is Reason
and **Thelemia** is Desire; the five sense-nymphs are the senses themselves. The court
"stages the faculties of the soul as a royal household." See `NYMPHS.md` and the *soul & the
senses* theme in `research/lexicon.html`.

## 6. Known gaps

- The **Graces, harpies and griffins** of folio 80's fountain are named in
  `woodcut_catalog` and not modelled. Open in `NEXTSTEPS.md`.
- The gods' statues around the garden are built figures rather than antique statuary; Nygren
  is the source to work from if they are upgraded (`AssetVariants.js` asset `statue`).
