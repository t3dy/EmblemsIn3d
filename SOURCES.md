# Sources & Scholarship — the research corpus behind HPin3D

**Read this before describing or modelling anything in the Hypnerotomachia world.**
Gardens, processions, nymphs, architecture, hieroglyphs, tombs, the pagan gods, the
alchemical readings — none of it should be invented when the scholarship already says what
the book means. This file is the map to that scholarship. It lives in the repo so any
agentic session can find it; `CLAUDE.md` points here.

## Where everything is (absolute paths, not in this repo)

| What | Path |
|---|---|
| **Working research corpus** (markdown, DB, per-scholar, built site) | `C:\Dev\hypnerotomachia polyphili\` |
| **PDF archive** (original articles & books) | `E:\pdf\hypnerotomachia polyphili\` |
| **The HP database** (SQLite) | `C:\Dev\hypnerotomachia polyphili\db\hp.db` |
| **Full-text markdown of every PDF** | `C:\Dev\hypnerotomachia polyphili\md\` (~1000 files) |
| **Per-scholar articles** (YAML frontmatter + summary + full text) | `C:\Dev\hypnerotomachia polyphili\scholars\<slug>\` |
| **RAG chunks per PDF** | `C:\Dev\hypnerotomachia polyphili\chunks\` |
| **Built DH site** (concordance, dictionary, marginalia, woodcuts, manuscripts) | `C:\Dev\hypnerotomachia polyphili\site\` |
| **Manuscript facsimiles** | `…\Siena O.III.38 Digital Facsimile…\`, `…\3 BL C.60.o.12 Photos…\` |

Agents can **Read the `.md` files directly** (they are plain markdown conversions of the
PDFs — no need to parse the PDFs), and **query `hp.db` with sqlite3**. Read the source PDF
only when a figure/plate is needed that the markdown lost.

## hp.db — tables (query with `sqlite3` / Python)

`folio_descriptions`, `woodcuts`, `woodcut_catalog`, `image_readings`, `alchemical_symbols`,
`symbol_occurrences`, `annotations`, `annotators`, `annotator_hands`, `dictionary_terms`,
`dictionary_term_links`, `document_topics`, `documents`, `bibliography`, `scholars`,
`scholar_works`, `page_concordance`, `editions`, `hp_copies`, `manuscripts`, `images`,
`signature_map`, `dissertation_refs`, `timeline_events`, `matches`, `schema_version`.

`export_for_3d.py` in this repo already pulls from it (`HP_DB = C:\Dev\hypnerotomachia
polyphili\db\hp.db`) into `src/data/hp_*.json`. The **`alchemical_symbols`** and
**`symbol_occurrences`** tables are the seed for the *alchemical commentary flavour*
(see `DESIGN.md`); **`folio_descriptions`** and **`woodcut_catalog`** ground the woodcut
fidelity and the station descriptions; **`annotations` / `annotator_hands`** are the
British-Library marginalia already surfaced in the app.

## The scholars, by what they inform (40 articles)

Each name has a folder under `scholars\<slug>\` with `profile.md` and the article markdown.

### Architecture & gardens — the portal, the palace, the fountain, Cythera's plan, the parterres, the processional walk
- **Liane Lefaivre**, *Alberti's Hypnerotomachia Poliphili: Re-Cognizing the Architectural Body* — the architectural-theory backbone; the building-as-body, eros and architecture.
- **John Dixon Hunt**, *Experiencing Gardens in the HP* — how the gardens are meant to be *walked and felt*; the phenomenology our walkable world is trying to be.
- **A. Segre**, *Untangling the Knot: Garden Design in the HP* — the knot-gardens/parterres, planting logic (grounds the Cythera terraces).
- **John Bury**, *Chapter III and the Tomb of Mausolus* — the Polyandrion / tomb architecture.
- **N. Temple**, HP as a model for topographical readings of **Rome**.
- **Raffaella Fabiani Giannetto**, *The craft of wonder* & the **Villa d'Este** — the garden of wonder and its afterlife.
- **D. R. Edward Wright** & **Mark Jarzombek** — Alberti's *De pictura*, the theory under the pictures.
- **James O'Neill (& Maggie O'Neill)**, *Self-transformation* / *Walking in the Boboli Gardens* — the garden walk as transformation.

### Text & image — the woodcuts, hieroglyphs, Polia & landscape, the statuary, Botticelli/Ficino
- **Roswitha Stewering**, *World, Landscape and Polia* + *Text and Woodcuts* — **the nymphs, Polia, and the landscape**; how the woodcuts relate to the text. Primary for modelling the female figures and the garden's world-picture.
- **Efthymia Priki**, *The Narrative Function of Hieroglyphs* + *Crossing the Text/Image Boundary* — the hieroglyph gates and rebuses (the doors, the boat standard, QUIS EVADET).
- **Christopher J. Nygren**, *HP and Italian Art circa 1500: Mantegna, Antico, Correggio* + *The Woodcut as Mirror* — the **triumphs and the statuary**; the antique-sculpture aesthetic (grounds the marble Venus and the gods).
- **Christophe Poncet**, *La scelta di Lorenzo: Botticelli tra poesia e filosofia* — a Ficinian reading of Botticelli's *Primavera* (Venus, the Graces). NB: it does **not** engage the HP directly, so it is background for the Neoplatonic *milieu*, not a source for HP-specific claims. Attribute the tour's neoplatonic notes to **Ficino's ladder of love** generally, not to Poncet.
- **Rosemary Trippe**, *Image, Text, and Vernacular Poetics*.
- **Georg Leidinger**, *Dürer und die HP* — the woodcut/print connection.
- **William B. Keller**, *Reading across Word and Image*.

### Reception — how readers understood it (incl. the ALCHEMICAL reading)
- **James Russell**, *Many Other Things Worthy of Knowledge and Memory: the HP and its Annotators 1499–1700* (Durham PhD, 2014) — **the source for the alchemical commentary flavour.** Russell shows early-modern readers interpreting the HP *as alchemical allegory* (alongside Plinian natural history, stage-design, verbal wit). The book as a "humanistic activity book." Use his reception evidence — and `hp.db.alchemical_symbols` — to write the alchemical notes; attribute to the annotators/Russell, not to us.
- **Brian A. Curran**, *HP and Renaissance Egyptology* — the obelisks, the elephant, the hieroglyphs as Egyptian revival.
- **Tamara Griggs**, *Promoting the Past: HP as Antiquarian Enterprise* — the antiquarian mood.
- **L. E. Semler** & **Peter Ure** — Robert Dallington's 1592 English (the translation that stops at p.193): its Protestant antiquity and its vocabulary. Grounds the seam our translation continues.
- **Anthony Blunt** (17th-c. France), **Mario Praz** (foreign imitators), **Marcel Francon** (Rabelais), **Michael Leslie** (Elizabethan landscape entertainments), **Lynne Farrington** (Aldus & the printing history) — the afterlife.

### Dream & religion — the oneiric frame, initiation, eros
- **James Gollnick**, *Religious Dreamworld of Apuleius* — the dream-vision / initiatory frame (the *Golden Ass* behind the HP).
- **Efthymia Priki**, *Teaching Eros* — the rhetoric of love.
- *Dream Narratives and Initiation Processes* (unattributed) — the oneiric/uncanny register.

### Authorship & material
- **Liane Lefaivre**, **James O'Neill**, **D. R. Edward Wright** — the Colonna/Alberti authorship question.
- **Eric L. Pumroy**, **William B. Keller**, **Lynne Farrington** — the 1499 printing, provenance, the annotated copies.

## Modelling the 3-D assets — which source for which object

**This applies to the geometry, not only the words.** Before you build or revise a model,
figure, garden, gate or ornament in `src/scenes/` or `src/systems/Cast.js`, read what the
book and the scholarship actually say about it, so the shape matches the commentary the tour
gives it. Ground truth in order: (1) `hp.db.folio_descriptions` and `woodcut_catalog` /
`woodcuts` / `image_readings` for the folio in question — this is the book's own description,
folio by folio; (2) the named scholar below; (3) the project's own briefs `GARDENS.md`,
`PROCESSIONS.md`, `CHARACTERS.md`, `VISION.md`, `RESEARCH_ROADMAP.md`, and the figure
sourcebook `research/nymphs.html`.

| Asset in the world | Read first |
|---|---|
| The dark wood, the plain, the oneiric mood | Gollnick & Priki (dream/initiation frame); `folio_descriptions` |
| The great pyramid / stepped mountain | **Bury** (reconstructed from Pliny's Mausoleum of Halicarnassus) |
| The elephant, the obelisks, the hieroglyph gates & the boat standard | **Curran** (Egyptian revival, Cyriacus, the Roman obelisks) + **Priki** (hieroglyphs as narrative); `woodcut_catalog` |
| The great portal, the three doors, the palace, all architecture | **Lefaivre** (architecture-as-body, Alberti), Wright/Jarzombek (Alberti's *De pictura*) |
| The nymphs, Polia, the female figures | **Stewering** (Polia & the landscape; text↔woodcut figures) + `research/nymphs.html` + `CHARACTERS.md` |
| The gardens, Cythera, the parterres, the processional walk | **Hunt** (the *experience* of gardens), **Segre** (knot-gardens/parterres), Fabiani Giannetto; `GARDENS.md`, `PROCESSIONS.md` |
| The triumphs, the statuary, the marble gods (incl. the imported Venus) | **Nygren** (Mantegna/Antico, antiquarian beholdership) |
| The Polyandrion, the tombs, the epitaphs | **Bury** (tomb architecture), **Griggs** (antiquarian epigraphy); `folio_descriptions` |
| The Temple / Fountain of Venus, the union | **Stewering** (landscape mirrors the lovers, culminating here); alchemical layer → **Russell** + `alchemical_symbols` |

The rule is the same as for the words: **the geometry should be traceable to the book (the
folio descriptions and woodcuts) and to a named scholar — not invented.** When you model
something the sources don't settle, say so in a comment and keep it modest.

## How to use this in the work

1. **Before writing a station description, a commentary note, or modelling a scene**, check
   the relevant scholar folder / `md/` file and `hp.db.folio_descriptions` for that folio.
2. **Commentary flavours map to clusters:** architectural theory & gardens → Lefaivre,
   Hunt, Segre, Wright/Jarzombek; neoplatonic → Ficino's ladder of love (Poncet is Primavera
   context, not HP); mythological & statuary / antiquarian beholdership → Nygren; hieroglyphs
   & Egyptology → Curran; **Polia & the landscape → Stewering**; allegory & the oneiric →
   Gollnick/Priki; the **alchemical flavour → Russell + `alchemical_symbols`**.
3. **Cite, don't invent.** When a note makes an interpretive claim, it should trace to a
   named scholar in this corpus or to the annotators' evidence — never a fabricated reading.
4. The corpus is a separate git repo; treat it read-only from HPin3D.

## Woodcut filenames are unreliable — trust the captions (2026-09-04)

The files in `images/woodcuts/` are **misnamed**: they were saved out of order, so the
filename does not describe the image. Verified by eye against the plates:

| file | what it actually shows |
|---|---|
| `portal.jpg` | the elephant bearing the obelisk |
| `queen.jpg` | Poliphilo fleeing the dragon in the vaults |
| `dragon.jpg` | a company of the nymphs |
| `elephant.jpg` | a nymph in a garden, by a fountain |
| `island_plan.jpg` | a topiary on a stepped base |
| `fountain_venus.jpg` | the heptagonal measured plan of the precinct |
| `theatre.jpg` | the standard of the triumph of Cupid |
| `three_doors.jpg` | **not** the three doors — a nymph drawing a wheeled tiered vessel crowned with a golden fruit-tree |
| `temple_venus.jpg` | **not** a temple — a globular hanging lamp on chains |
| `awakening.jpg` | **not** the awakening — Cupid with his bow before an enthroned figure and two others in the clouds |

The **captions in `src/data/tours.json` are correct** and were checked against the images;
the station→woodcut pairings in the novel tour are right. So: when adding or moving a
woodcut, **open the image and go by the caption, never by the filename.**

### Three of them were re-identified and re-filed (2026-09-05)

Matched by eye against `hp.db.woodcut_catalog`, the three "wrong" images turn out to be real
plates that simply sat at the wrong stops. They now carry their true captions and their true
stops in `tours.json`:

| file | catalogue | true subject | now shown at |
|---|---|---|---|
| `three_doors.jpg` | **#32**, folio 105 (QUEEN_PALACE) | magnificent vessel with a gold shrub, twice a nymph's height | ch. IX–X, the palace & banquet |
| `temple_venus.jpg` | **#74**, folio 198 (VENUS_TEMPLE) | globular lamp hung in chains | ch. XVII, the Temple of Venus |
| `awakening.jpg` | **#166**, folio 447 (BOOK_II_POLIA) | Poliphilo before Venus in the clouds, Cupid listening | ch. XXXV, the vision at Venus's throne |

**Known gap:** the Great Portal (ch. IV) and the Three Doors (ch. XII–XIII) are the stops with
no woodcut, because no genuine plate for either is in the folder. Left blank deliberately (an
explicit `"wc": []` on those stops) rather than showing a wrong image — if the plates are
sourced later, add them there.
