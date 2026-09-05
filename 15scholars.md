# The Fifteen — the scholars this world is built from

*Companion to [SOURCES.md](SOURCES.md), which maps assets to sources. This file goes the
other way: it takes each scholar in turn and says what they settle, where their text is on
this machine, and what you are licensed to build and claim from them.*

Two sections, deliberately:

- **[Part One — the working fifteen](#part-one--the-working-fifteen)**, organised by the
  part of the world they govern. This is the section to read before you model, write or
  lay out anything.
- **[Part Two — the historiographic frame](#part-two--the-historiographic-frame)**, the
  shape of the field from 1499 to now. This is the section to read before you make a claim
  about what the *Hypnerotomachia* is.

**The rule that governs both:** cite, don't invent. An interpretive claim in a station
description, a commentary note, or a code comment justifying a shape must trace to a named
scholar here or to the annotators' evidence in `hp.db`. If the sources don't settle it, say
so in the comment and keep the geometry modest.

---

## Where the texts are

| What | Path |
|---|---|
| Per-scholar folders (`profile.md` + article markdown) | `C:\Dev\hypnerotomachia polyphili\scholars\<slug>\` |
| Full-text markdown of every PDF in the archive (37 files) | `C:\Dev\hypnerotomachia polyphili\md\` |
| RAG chunks, one directory per document | `C:\Dev\hypnerotomachia polyphili\chunks\<doc>\` |
| The database (`scholars`, `scholar_works`, `bibliography`, + 24 more) | `C:\Dev\hypnerotomachia polyphili\db\hp.db` |
| Original PDFs | `E:\pdf\hypnerotomachia polyphili\` |

**Read the `.md` files directly** — they are plain conversions; you almost never need the
PDF. Open the PDF only when you need a figure or plate the conversion dropped.

**Not everything in the bibliography is on disk.** `bibliography.collection_filename` is
`NULL` for works catalogued but not held (Pozzi 1959, Menegazzo, Billanovich, Calvesi,
Gombrich, Giehlow, Fierz-David, Rhizopoulou, Gabriele, and others). Those entries are still
citable as *bibliography* — they are not readable here. Two entries below are flagged
**DB-only** for that reason; do not pretend to have read them.

```sql
-- what is actually on disk, by scholar
SELECT s.name, b.year, b.title, b.collection_filename
FROM scholars s
  JOIN scholar_works w ON w.scholar_id = s.id
  JOIN bibliography  b ON b.id = w.bib_id
WHERE b.collection_filename IS NOT NULL
ORDER BY s.name, b.year;
```

---

# Part One — the working fifteen

Grouped by the part of the world each one governs. Each entry gives: **the work**, **the
file**, **what it settles**, **what to build or write with it**, and **the limit** — the
claim it will not support.

## Architecture and the built world

### 1. Liane Lefaivre — the architectural body

- **Work:** *Leon Battista Alberti's Hypnerotomachia Poliphili: Re-Cognizing the
  Architectural Body in the Early Italian Renaissance* (1997).
- **File:** `scholars\liane-lefaivre\leon-battista-albertis-hypnerotomachia-poliphili-recognizing.md`
  · `md\Liane_Lefaivre_Leon_Battista_Alberti_s_Hypnerotomachia_Poliphili_Re_Cognizing_th.md`
- **What it settles:** that the book's architecture is a *body* — that eros and building
  are one argument in it, that the descriptions are written in the technical vocabulary of a
  practising architect, and (her larger and more contested claim) that the architect is
  Alberti.
- **Build with it:** every classical member in `HPWorldScene.js` — the great portal, the
  three-doors wall, the palace, the Quinta's colonnade, the theatre. When you are deciding
  whether a wall gets an entablature or a plain cap, this is the book that says the wall is a
  body and the entablature is its shoulders. Her reading is also the justification for the
  *architecture* commentary flavour.
- **The limit:** the Alberti attribution is a **minority position**. Present it as
  Lefaivre's thesis, never as the consensus. For authorship see Part Two.

### 2. John Bury — the pyramid and the tomb

- **Work:** *Chapter III of the Hypnerotomachia Poliphili and the Tomb of Mausolus*,
  *Word & Image* 14:1–2 (1998).
- **File:** `scholars\john-bury\chapter-iii-of-the-hypnerotomachia-poliphili.md`
- **What it settles:** where the colossal stepped pyramid of chapter III comes from —
  Pliny's description of the Mausoleum of Halicarnassus, reconstructed. It also gives the
  tomb architecture of the Polyandrion its ancestry.
- **Build with it:** the pyramid and obelisk at the Elephant station; the Polyandrion's
  tomb-temple, its crypt and its sepulchral portal. When a proportion is in doubt, go to
  Pliny through Bury, not to a modern reconstruction drawing.
- **The limit:** it is an argument about a *source*, not about meaning. Don't hang an
  allegorical reading on it.

### 3. N. Temple and the Roman topography (supporting)

- **Work:** *The Hypnerotomachia Poliphili as a Possible Model for Topographical
  Interpretations of Rome in the Early Sixteenth Century* (1998).
- **File:** `scholars\n-temple\` · `md\Word_Image_1998_jan_vol_14_iss_1_2_Temple_N_The_Hypnerotomachia_Poliphili_as_a_p.md`
- **Use:** when you need to know how a reader of 1510 walked a ruin-field and read it. This
  is the source for the *feel* of the ruined plain in chapters II–III — antiquity as a
  landscape to be interpreted on foot, which is exactly what the free-walk mode is.

## Gardens, planting and the walk

### 4. John Dixon Hunt — gardens as experience

- **Work:** *Experiencing Gardens in the Hypnerotomachia Poliphili*, *Word & Image* 14:1–2
  (1998).
- **File:** `scholars\john-dixon-hunt\experiencing-gardens-in-the-hypnerotomachia-poliphili.md`
- **What it settles:** that the HP's gardens are written to be *walked and felt*, in
  sequence and in the body, not looked at as plans. Hunt is the reason this project is a
  walkable 3-D world and not a set of illustrated plates.
- **Build with it:** the pacing of the walk — sightlines, the order in which a feature
  discloses itself, where the ground changes underfoot, where the free-walk commentary
  should trigger as you approach a feature rather than when you arrive. If a station reads
  as a diorama you stand in front of, you have not applied Hunt.
- **The limit:** he is describing an ideal reader's experience, not a measured survey. Take
  measurements from the plates (`woodcut_catalog` #122, the plan of the island; #148, the
  plan of the fountain), and take the *sequence* from Hunt.

### 5. A. Segre — the knot, the parterre, the planting logic

- **Work:** *Untangling the Knot: Garden Design in Francesco Colonna's Hypnerotomachia
  Poliphili*, *Word & Image* 14:1–2 (1998).
- **File:** `scholars\a-segre\untangling-the-knot-garden-design-in.md`
- **What it settles:** how the knot-gardens and parterres are actually laid out, and why —
  the geometry of the beds, the relation of pattern to planting, the topiary logic.
- **Build with it:** the Cythera terraces and their jewelled knot-parterres; the topiary
  (`woodcut_catalog` #116–#120, #125, #127–#129: the clipped rings, the box-tree man, the
  mushroom, the three peacocks, the eagle bed). Segre is the check on whether a parterre in
  the world is a real pattern or a decorative squiggle.
- **The limit:** design, not botany. For *which plant goes in the bed*, go to Rhizopoulou.

### 6. Sophia Rhizopoulou — the actual plants  ⚠ **DB-only**

- **Works:** *On the Botanical Content of Hypnerotomachia Poliphili* (2016);
  *Fascinating Landscapes of Hypnerotomachia Poliphili* (*Acta Horticulturae* 1189);
  *The Botanical Content of Hypnerotomachia Poliphili Revisited*, *Botany Letters* 170:1
  (2022).
- **File:** **none on disk.** Catalogued in `hp.db.bibliography`, three works; the PDFs are
  not in `E:\pdf\`. All three are findable open-access.
- **What it settles:** the HP names a very large number of identifiable species, and the
  identifications can be made. This is the only body of work in the corpus that treats the
  book as a botanical document.
- **Build with it:** `PLANTS.md`, and the actual species mix of the meadow, the grove, the
  citrus pergola on the ring-river, and the herb-set inscriptions on the Cythera terraces.
  Cross-check against `hp.db.dictionary_terms` filtered to plant names, which *is* on disk.
- **The limit:** **until someone fetches the papers, cite her only as bibliography.** Do not
  attribute a specific identification to her that you have not read. Where you need a plant
  now, take it from the book's own text (`translation/en/`) and the lexicon, and say so.

### 7. James O'Neill — walking as method

- **Works:** *Self-transformation in the Hypnerotomachia Poliphili* (Durham e-thesis, 2025);
  *Walking in the Boboli Gardens in Florence* (*Qualitative Inquiry*, 2021); *A Narrative in
  Search of an Author* (2025).
- **Files:** `scholars\james-oneill\` ·
  `md\E_Thesis_Durham_University_Self_Transfor_Oneill_Self_transformation_HP.md` ·
  `md\Walking_in_the_Boboli_Gardens_in_Florenc.md` ·
  `md\A_Narrative_in_Search_of_an_Author_The_Hypnerotomachia_James_ONeill.md`
- **What it settles:** the most recent sustained treatment of the book as a *transformation
  undergone by walking* — and, in the Boboli paper, an actual methodology for reading a
  garden by moving through it.
- **Build with it:** the free-walk mode's whole rationale, and the argument for approach-
  triggered commentary. Also the strongest recent framing for why a 3-D walkthrough is a
  legitimate scholarly instrument rather than an illustration.
- **The limit:** his authorship paper is a *survey* of the authorship problem, not a
  settlement of it.

### 8. Raffaella Fabiani Giannetto — the craft of wonder

- **Work:** *Not Before Either Known or Dreamt Of: The Hypnerotomachia Poliphili and the
  Craft of Wonder*, *Word & Image* 31:2 (2015).
- **File:** `scholars\raffaella-fabiani-giannetto\not-before-either-known-or-dreamt.md`
- **What it settles:** wonder as a *made* effect with identifiable techniques — and the
  book's long afterlife in real gardens, the Villa d'Este above all.
- **Build with it:** the water-works, the trick fountain of the bath chapter, the automata
  and the *giochi d'acqua*; and the argument that this world's job is to reproduce an effect,
  not a floor plan.

## The figures, the images and the ornament

### 9. Roswitha Stewering — Polia, the nymphs, the landscape

- **Works:** *The Relationship between World, Landscape and Polia in the Hypnerotomachia
  Poliphili*, *Word & Image* 14:1–2 (1998); *Architectural Representations in the
  Hypnerotomachia Poliphili*, *JSAH* 59:1 (2000).
- **File:** `scholars\roswitha-stewering\the-relationship-between-world-landscape-and.md`
  (the 2000 JSAH paper is catalogued but not on disk)
- **What it settles:** that Polia, the nymphs and the landscape are *one construction* —
  the women are legible only against the place that produced them, and the descriptions of
  each borrow the vocabulary of the other. She is the primary source for the female figures.
- **Build with it:** every figure in `Cast.js` — Polia, the nymphs, the Graces, the
  procession riders; `NYMPHS.md` and `research/nymphs.html`; and the decision to place
  figures *in* their setting rather than as free-standing models. The *neoplatonic* and
  *literary* notes about Polia should route through her.
- **The limit:** she is the authority on how the figures are *described*, not on how a
  particular woodcut was cut. For that see Huelsen and Leidinger in Part Two.

### 10. Efthymia Priki — the hieroglyphs, the reception, the rhetoric of love

- **Works (four, all on disk — the largest single holding in the corpus):**
  *The Narrative Function of Hieroglyphs in the Hypnerotomachia Poliphili*;
  *Elucidating and Enigmatizing: The Reception of the HP…* (*eSharp* 14, 2009);
  *Crossing the Text/Image Boundary: The French Adaptations…* (*JEBS*, 2012);
  *Teaching Eros: The Rhetoric of Love…* (*Interfaces* 2, 2016).
- **Files:** `scholars\efthymia-priki\` — four `.md` files plus `profile.md`.
- **What it settles:** that the hieroglyphs and emblematic devices **carry narrative** —
  they are not ornament between episodes, they state in image what the plot is about to
  test. Also the reception history, and the rhetoric by which the book teaches desire.
- **Build with it:** the hieroglyph gates, the obelisk devices, the boat standard, the
  *QUIS EVADET? / NEMO* trophies; the placement of emblematic props so that they *precede*
  the episode they comment on. Her *Teaching Eros* is the source for how the reaction-choices
  should feel — expressive rather than branching.
- **The limit:** decipherments belong to her and to Curran; do not invent a reading for a
  device neither of them treats. Where the catalogue gives a motto (`woodcut_catalog`
  descriptions carry several verbatim), quote the motto and stop.

### 11. Brian A. Curran — the Egyptian revival

- **Work:** *The Hypnerotomachia Poliphili and Renaissance Egyptology*, *Word & Image*
  14:1–2 (1998).
- **File:** `scholars\brian-a-curran\the-hypnerotomachia-poliphili-and-renaissance-egyptology.md`
- **What it settles:** where the elephant, the obelisks and the hieroglyphic apparatus come
  from — the Roman obelisks, Cyriacus of Ancona, and a fifteenth-century Egypt that is
  substantially imagined.
- **Build with it:** the elephant bearing the obelisk (the world's signature object), the
  triangular obelisk of the mystic Trinity, the Polyandrion's obelisk of Caesar with its
  ant-and-elephant concord device, and every carved hieroglyph band in `_frieze()`.
- **The limit:** Curran is emphatic that this Egypt is a Renaissance *construction*. Never
  write a note claiming the HP preserves genuine Egyptian meaning; the note should say the
  opposite, and say it is Curran saying it.

### 12. Christopher J. Nygren — the triumphs, the statuary, the beholder

- **Work:** *The Hypnerotomachia Poliphili and Italian Art circa 1500: Mantegna, Antico,
  and Correggio*, *Word & Image* 31:2 (2015).
- **File:** `scholars\christopher-j-nygren\the-hypnerotomachia-poliphili-and-italian-art.md`
- **What it settles:** the book's relation to the antique-sculpture aesthetic of its moment,
  and what a beholder of 1500 was trained to feel in front of a recovered marble.
- **Build with it:** the four triumphal cars and their reliefs (`TRIUMPH_RELIEFS`), the
  marble gods, the imported Venus model, the statuary in the gardens, and the *myth*
  commentary flavour. He is also the reason the triumphs are composed rather than copied:
  Colonna is assembling a procession out of studied fragments, and so are we.
- **The limit:** an art-historical argument about *register*, not an iconographic key. For
  what a given car actually shows, go to `woodcut_catalog` #44–#70 and to `PROCESSIONS.md`.

## The text, the reading and the seam

### 13. James Russell — the annotators, and the alchemical lens

- **Work:** *Many Other Things Worthy of Knowledge and Memory: The Hypnerotomachia
  Poliphili and its Annotators, 1499–1700* (Durham PhD, 2014). A world census of annotated
  copies.
- **File:** `scholars\james-russell\many-other-things-worthy-of-knowledge.md` ·
  `md\PhD_Thesis_James_Russell_Hypnerotomachia_Polyphili.md`
- **What it settles:** *how early-modern readers actually used the book* — as a Plinian
  natural history, as a source for stage design, as verbal wit, and, for a definite group of
  them, **as chemical allegory**. The book as a "humanistic activity book."
- **Build with it:** **the entire alchemical commentary flavour.** Every `alchemical` note in
  `tours.json` should trace to Russell's reception evidence plus `hp.db.alchemical_symbols`
  and `symbol_occurrences`, and should be phrased as *what those readers found*, never as
  what the book means. The British Library Hand B additions (mercury and cinnabar near the
  union scenes, Russell p. 167) are the model citation.
- **The limit:** this is **reception**, not authorial intent. A note that says "the HP is an
  alchemical allegory" is wrong and unsupported; a note that says "readers such as Hand B
  read it as one, and marked it here" is right and is what the corpus can prove.

### 14. L. E. Semler (with Peter Ure) — Dallington and the seam

- **Works:** Semler, *Robert Dallington's Hypnerotomachia and the Protestant Antiquity of
  Elizabethan England*, *Studies in Philology* 103:2 (2006); Ure, *Some Notes on the
  Vocabulary of the Translation of Colonna's Hypnerotomachia, 1592*, *Notes and Queries*
  (1952).
- **Files:** `scholars\l-e-semler\robert-dallingtons-hypnerotomachia-and-the-protestant.md` ·
  `scholars\peter-ure\`
- **What it settles:** what Dallington's 1592 English *is* — an abridgement with a
  Protestant temperature, trimming what it finds idolatrous — and what its vocabulary is
  doing.
- **Build with it:** everything about the seam. The Dallington half of the tour (chapters
  I–XVI), the honest statement that the 1592 reader got a cooler book, and the register
  decision recorded in `translation/NOTES.md` — that our English is visibly a different,
  modern hand and does not pastiche him. Stop 14 of the novel tour is written from this.
- **The limit:** Semler is describing Dallington's *translation*, not Colonna's text. Don't
  let a Dallington omission become a claim about the 1499.

### 15. James Gollnick — the dream, and the initiation

- **Work:** *Religious Dreamworld of Apuleius' Metamorphoses: Recovering a Forgotten
  Hermeneutic*.
- **File:** `scholars\james-gollnick\religious-dreamworld-of-apuleius-metamorphoses-recovering.md`
- **What it settles:** the dream-vision as an *initiation* — the sleeper taken out of
  ordinary waking in order to be changed — which is the frame the HP inherits from the
  *Golden Ass*.
- **Build with it:** the whole oneiric register: the dark wood, the dream-within-the-dream
  of chapter II, the mood system, `DreamMode.js`, and the *allegory* flavour's handling of
  thresholds. The unattributed `md\Dream_Narratives_and_Initiation_Processe.md` in the corpus
  supports the same register.
- **The limit:** Gollnick is writing about Apuleius, not about Colonna. The connection is
  the *frame*; cite him for the hermeneutic, not for a reading of a specific HP scene.

---

# Part Two — the historiographic frame

What the field has argued about, in the order it argued about it. Read this before making a
claim about what the book *is*. Entries marked ⚠ are catalogued in `hp.db` but **not on
disk**.

## The nineteenth century: the book becomes a problem

- **Charles Nodier**, *Franciscus Columna* (1844) — the romantic revival that put the book
  back in circulation. ⚠
- **Domenico Gnoli**, *Il Sogno di Polifilo* (*La Bibliofilia* 1, 1899) — the first modern
  scholarly account. ⚠
- **Christian Huelsen**, *Le illustrazioni della Hypnerotomachia Poliphili* (*La Bibliofilia*
  12, 1910) — the founding study of the woodcuts *as woodcuts*. ⚠ Its questions (how many
  hands, whose designs) are still open, which is why this project trusts the catalogue
  descriptions over the filenames.

## The Warburg generation: symbol, hieroglyph, afterlife

- **Karl Giehlow**, *The Hieroglyphics of Horapollo and Their Importance for Renaissance
  Symbolism* (Brill trans. 2015) ⚠ — the origin of the whole hieroglyph question that Curran
  and Priki now carry.
- **Fritz Saxl**, *A Scene from the HP in a Painting by Garofalo* (1937) ⚠ and **Anthony
  Blunt**, *The Hypnerotomachia Poliphili in 17th Century France* (1937) — the *Journal of
  the Warburg Institute*'s first volume takes the book seriously twice.
  Blunt: `scholars\anthony-blunt\`.
- **Mario Praz**, *Some Foreign Imitators of the Hypnerotomachia Poliphili* (*Italica*,
  1947) — `scholars\mario-praz\`.
- **E. H. Gombrich**, *Hypnerotomachiana* (in *Symbolic Images*, 1972) ⚠ — the sceptical
  corrective to over-reading. Worth knowing about precisely because this project is in
  constant danger of over-reading.
- **Linda Fierz-David**, *The Dream of Poliphilo* (1950; Spring, 1987) ⚠ — the Jungian
  reading. Historically important, methodologically not ours; do not source a commentary note
  to it.

## The philologists: who wrote it, and what does it say

- **Giovanni Pozzi** and **Maria Teresa Casella**, *Francesco Colonna. Biografia e opere*
  (1959), and Pozzi–Ciapponi's **critical edition (1964)** ⚠ — the textual foundation of
  everything after. When you need to know what the 1499 actually says, the modern answer is
  Pozzi; our own working answer is the facsimile in `translation/source/`.
- **Emilio Menegazzo** (three papers, 1962–66) and **Myriam Billanovich** (three papers,
  1966–76) ⚠ — the archival case for the Venetian Dominican Francesco Colonna, built on the
  Lelli family documents.
- **Maurizio Calvesi**, *La pugna d'amore in sogno di Francesco Colonna Romano* (1996) ⚠ —
  the rival case for the *Roman* Colonna, lord of Palestrina.
- **Liane Lefaivre** (1997) and, more cautiously, **James O'Neill** (2025) — the Alberti
  proposal and a recent survey of the whole question.
- **Mino Gabriele**, introduction and commentary to the Adelphi critical edition (2004) ⚠ —
  the standard Italian commentary.

**How to write about authorship.** The acrostic
POLIAM FRATER FRANCISCVS COLVMNA PERAMAVIT is a *fact about the book*; who that Francesco
Colonna was is **not settled**. Any note that names an author must name the argument
alongside it. The novel tour's epitaph stop is the model.

## The 1998 *Word & Image* special issue — the field's centre of gravity

Six of the working fifteen come from one double issue (14:1–2, 1998): **Bury**, **Curran**,
**Hunt**, **Segre**, **Stewering**, **Griggs**, plus **Leslie** and **Temple**. If you are
orienting yourself quickly, read that issue's eight papers and you have the modern field's
core. Seven are on disk as `md\Word_Image_1998_jan_vol_14_iss_1_2_*` (Bury, Curran,
Griggs, Hunt, Leslie, Stewering, Temple); Segre's was filed separately, as
`md\Untangling_the_knot_Garden_design_in_Francesco_Colonna_s_Hypnerotomachia_Poliphi.md`.

- **Tamara Griggs**, *Promoting the Past: The HP as Antiquarian Enterprise* —
  `scholars\tamara-griggs\promoting-the-past-the-hypnerotomachia-poliphili.md`. The source
  for the epitaphs and the antiquarian mood; the reason the Polyandrion inscriptions are
  treated as real epigraphic practice.
- **Michael Leslie**, *The HP and the Elizabethan Landscape Entertainment* —
  `scholars\michael-leslie\`. The English afterlife, and a bridge to Dallington.

## The 2015 *Word & Image* issue — the book as object

**Nygren**, **Fabiani Giannetto**, **Farrington** (*Aldus Manutius and the Printing History
of the HP*), **Keller** (*Collecting to Support Persuasion in Architectural Design*) and
**Pumroy** (*Bryn Mawr College's 1499 Edition*). All five on disk as `md\Word_Image_2015_apr_03_vol_31_iss_2_*`.
Together they are the field's turn toward the physical book, its printing and its
collectors — the same turn Russell's census belongs to.

## Reading, translation and reception

- **Dorothea Stichel**, *Reading the HP in the Cinquecento* (1994) ⚠ — the first study of
  the Modena marginalia, the direct ancestor of Russell's census and of `hp.db.annotations`.
- **Rosemary Trippe**, *The HP, Image, Text, and Vernacular Poetics* (*Renaissance
  Quarterly*, 2002) — `scholars\rosemary-trippe\`. Read for the letters in Book II and for
  any layout decision about how text and image sit together on a page.
- **Marcel Françon**, two papers (1954, 1955) on the HP and Rabelais —
  `scholars\marcel-francon\`. The source for the Thélème borrowing.
- **Marco Arnaudo**, *The Metaphor of the Labyrinth in the HP* (*Comitatus* 39, 2008) ⚠ —
  the water-labyrinth of chapter IX.
- **Georg Leidinger**, *Albrecht Dürer und die Hypnerotomachia Poliphili* —
  `scholars\georg-leidinger\`. Dürer's ownership; the woodcuts' northern afterlife.
- **Jean Martin** (1546 French) and **Jean Cousin the Elder** (its new Mannerist woodcuts);
  **Beroalde de Verville** (1600), whose edition reads the whole book as alchemy — the
  named ancestor of our alchemical flavour, via Russell. All three are in
  `hp.db.scholars` as historical subjects rather than as modern scholarship.
- **Joscelyn Godwin** (1999) — the standard complete English translation. **In copyright.
  Not in this corpus. Never consulted, quoted or paraphrased.** Our translation is made from
  the Italian in `translation/source/`; see `translation/NOTES.md`.
- **Paul Summers Young** (2024) — a recent English translation, Black Letter Press. ⚠ Same
  rule: catalogued, not used.

## Digital reconstruction — our own predecessors

- **Esteban Alejandro Cruz**, *Formas Imaginisque Poliphili* — CAD and polygon
  reconstructions of the HP's architecture with environmental simulation. Recorded in
  `hp.db.scholars` as a historical subject; there is no paper in the corpus. **This is the
  closest prior art to what this repo is doing.** When a reviewer asks "has anyone modelled
  this before", the answer is Cruz.
- **Alberto Pérez-Gómez**, *Polyphilo, or The Dark Forest Revisited* (MIT Press, 1994) —
  desire as the erotic gap between parts not yet joined, driving *concinnitas*. The
  theoretical companion to Lefaivre, and the best defence available for why a 3-D
  reconstruction of this book is an argument and not a toy.

---

## Working notes for the next agent

1. **Start from `SOURCES.md`'s asset table, not from this file.** That table says which
   scholar governs the thing you are about to touch. Come here for depth once you know the
   name.
2. **Quote the plate before you quote the scholar.** `hp.db.woodcut_catalog` and
   `folio_descriptions` are the book's own account of itself and outrank any interpretation.
   Several catalogue entries carry mottoes verbatim (`PATIENTIA`, `Velocitatem sedendo`,
   `Medium tenuere beati`, `Quis evadet? / Nemo`); those are safe quotes.
3. **Distinguish reception from meaning, every time.** This is the single most common way to
   write a false note here. Russell gives you readers; he does not give you the book.
4. **A ⚠ entry may be cited as bibliography and must not be cited as read.** If a task
   genuinely needs one of them, say so in `NEXTSTEPS.md` rather than paraphrasing an abstract.
5. **The corpus is a separate git repo.** Treat `C:\Dev\hypnerotomachia polyphili\`
   read-only from this project.

*Compiled 2026-09-05 from `hp.db` (`scholars` 65 rows, `scholar_works` 68, `bibliography`),
the 30 per-scholar folders and the 37 full-text conversions in `md\`.*
