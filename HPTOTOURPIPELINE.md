# HP → TOUR PIPELINE — corpus in, game out

*How a sentence in a 1499 book becomes a thing you can walk up to. Where every category of
research material lives, what artifacts the research pass produces, and how those artifacts
reach the agent who writes the geometry.*

**Read this if you are about to research, or about to build.** If you only need to change
something that already exists, [`ROUTER.md`](ROUTER.md) will send you somewhere shorter.

---

## 0. Why this file exists

On 2026-09-07 Ted asked whether the tunnels under the pyramid were in the world. They were
not. Chapter V spends five pages in them — "diuers crooked torments, ambagious passages and
vnknowne waies" — and the world had a dragon standing outside a door and nothing behind it.
The tour even had a stop named *The Dragon in the Vaults*.

The omission was not laziness. It was **structural**:

- Every coverage check anyone had run was driven by the **woodcuts**. `hp.db.woodcut_catalog`
  has 168 plates, they are numbered, and they are easy to tick off.
- **The vaults have no woodcut.** They are pure text. So every plate-driven check passed them
  in silence, and no artifact anywhere recorded that chapter V had never been read against
  the world.

The fix is not "try harder". It is an artifact that makes the *absence of research* visible,
chapter by chapter — because you cannot notice a gap in a chapter nobody has enumerated.
That artifact is [`research/coverage.json`](research/coverage.json), rendered as
[`COVERAGE.md`](COVERAGE.md).

> **The rule this produced:** *the plates are an index, not an inventory.* Anything the book
> describes counts, drawn or not. Roughly a third of what is worth building has no plate.

---

## 1. Where the materials are

Six categories. All but the last are **read-only** from this repo — the corpus is a separate
git repository and must never be written to from here.

### 1.1 The book itself, in English

| | |
|---|---|
| **Chapters I–XVI** | `C:\Dev\hypnerotomachia polyphili\md\Hypnerotomachia_by_Francesco_Colonna.md` — Robert Dallington, 1592, public domain. The only English for the first half. Its `<!-- Page N -->` markers are **Dallington's** page numbers, not the 1499's. |
| **Chapters XVII–XXXVIII + Book II** | `translation/en/page_NNN.md` — ours, CC0. `NNN` **is** the 1499 page, so it joins directly to `hp.db`. Each page carries the translation, a confidence rating, and notes that often name buildable things outright. |
| **The 1499 Italian** | `C:\Dev\hypnerotomachia polyphili\md\Francesco_Colonna_Rino_Avesani…Poz.md` — for checking a word. |

> **Godwin (1999) is in copyright, is not in the corpus, and is never consulted, quoted or
> paraphrased.** Where a secondary source used Godwin (Rhizopoulou does), record that the
> identification is theirs and the wording is not ours to reuse.

### 1.2 The plates

| | |
|---|---|
| **Catalogue** | `hp.db.woodcut_catalog` — 168 rows: `catalog_number`, `description`, `page_seq` (1499 page), `narrative_section`, `confidence`. |
| **Scans** | `C:\Dev\hypnerotomachia polyphili\site\images\woodcuts_1499\hp1499_pNNN.jpg` — by 1499 page. **Read these directly; you can see them.** |
| **In the app** | `src/images/woodcuts/` — the subset wired into tour stops. Filenames there are unreliable; captions are not (`SOURCES.md`). |

### 1.3 The database

`C:\Dev\hypnerotomachia polyphili\db\hp.db`, 33 tables. The ones that earn their keep:

| Table | Rows | What it settles |
|---|---|---|
| `woodcut_catalog` | 168 | every plate, its page, its narrative section |
| `page_concordance` | 448 | signature ↔ 1499 page ↔ section — joins scholarship to pages |
| `annotations` / `annotator_hands` | 282 / 15 | what early readers wrote in the margins |
| `dictionary_terms` | 101 | the book's own vocabulary, by category |
| `bibliography` / `scholars` / `scholar_works` | 113 / 90 / 108 | who has written what |
| `image_readings` | 457 | machine readings of facsimile pages |
| `folio_descriptions` | 13 | close descriptions of particular folios |

### 1.4 The scholarship

| | |
|---|---|
| **Full text on disk** | `C:\Dev\hypnerotomachia polyphili\md\*.md` — ~37 articles and theses converted from PDF. Read these directly. |
| **PDFs** | `E:\pdf\hypnerotomachia polyphili\` |
| **Fetched into this repo** | `sources/<author>/` — e.g. `sources/rhizopoulou/` (2016 full text + all 285 plant identifications). Put anything you fetch here, with a header saying where it came from and what its access terms are. |
| **The map** | [`SOURCES.md`](SOURCES.md) — including a table pairing each 3-D asset with the scholar to read first. |
| **Who supports what** | [`15scholars.md`](15scholars.md) — what each will and will not support, and the limits of each. |

### 1.5 The world as it stands

| | |
|---|---|
| **The scenes** | `src/scenes/HPWorldScene.js` (the garden), `VaultsScene.js` (the crawl) |
| **The cast** | `src/systems/Cast.js` — figures, animals, props |
| **The tour** | `src/data/tours.json` — 38 stops, their chapters, their notes |
| **Subject briefs** | `ARCHITECTURE.md`, `PLANTS.md`, `GARDENS.md`, `ANIMALS.md`, `NYMPHS.md`, `PROCESSIONS.md`, `WATER.md`, `ORNAMENT.md`, `CHARACTERS.md`, `MYTHOLOGY.md`, `VEHICLES.md` |
| **Decisions** | [`DECISIONS.md`](DECISIONS.md) — binding calls, newest first. Read before re-litigating. |

### 1.6 The ledger — the only thing here you write

`research/coverage.json`. Chapter by chapter: what the book has, what the world has, and
whether anyone has actually looked.

---

## 2. The artifacts

Three, and only three. Everything else is prose that supports them.

### 2.1 `research/coverage.json` — the ledger

Generated skeleton, hand-filled research. Refresh with `python scripts/coverage_seed.py`,
which **preserves `research` and `features` verbatim** and only rewrites derived fields
(page ranges, plates, tour stops, the build-evidence grep). It can never destroy a reading.

A chapter:

```jsonc
{
  "id": "V", "n": 5, "book": 1,
  "pages_1499": null,                    // derived; null for I–XVI, see §1.1
  "text_source": { "edition": "Dallington 1592", "file": "…", "note": "…" },
  "plates": [],                          // derived from woodcut_catalog
  "tour_stops": [ { "station": "portal", "title": "The Dragon in the Vaults" } ],
  "research": {                          // ← YOU WRITE THIS
    "status": "enumerated",              // enumerated | partial | unread
    "enumerated_by": "…", "date": "2026-09-07", "note": "…"
  },
  "features": [ … ]                      // ← AND THIS
}
```

A feature:

```jsonc
{
  "id": "vaults-maze",
  "name": "The vaults: \"ambagious passages and vnknowne waies\"",
  "kind": "place",                       // place building rite object creature
                                         // inscription plant machine person picture
  "plate": null,                         // the plate number, or null if the book only says it
  "source": "Dallington pp. 82–84",      // REQUIRED. A page, not a vibe.
  "status": "built",                     // built partial unbuilt declined unknown
  "built_as": "VaultsScene._carve",      // the function, so the next reader can find it
  "modes": ["vaults"],                   // walk dream tour flight vaults
  "note": "…"                            // what is missing, or why it was declined
}
```

**`status` discipline.** `built` means *someone loaded the running page and saw it*
([`RECIPES/verify-live.md`](RECIPES/verify-live.md)). The seeder's
`build_evidence.plates_cited_in_source` is a **weak** hint — a plate number in a comment means
someone looked, not that a thing exists. Never promote it to `built` on its own.

**`declined` is a real answer** and it needs a reason. The five hieroglyphic medallions of the
Polyandrion are `declined`: no reading of them exists anywhere in the corpus, so they are
built as explicitly *unread* and the tour says so. Inventing a reading would be worse than
leaving them out.

### 2.2 `COVERAGE.md` — the generated report

`python scripts/coverage_report.py`. **Never hand-edit it.** It leads with the two queues:

1. **the research queue** — chapters nobody has enumerated;
2. **the build queue** — features the book has and the world does not.

### 2.3 The build brief

A feature with `status: unbuilt` *is* the brief, if its `source` and `note` are good enough
for someone else to act on. When a feature is big enough to need real design — the crawl, the
flight mode, a whole station — write it up in [`DECISIONS.md`](DECISIONS.md) as you build it,
and leave the standing queue in [`NEXTSTEPS.md`](NEXTSTEPS.md).

---

## 3. The workflow

```
    the book            the ledger              the world
  ───────────         ────────────            ───────────
  read a chapter  →   features[]          →   build it     →  verify live
  §1.1–1.4            research/           §1.5                RECIPES/
                      coverage.json                           verify-live.md
                          ↓                                       ↓
                      COVERAGE.md  ←──────── status: built ───────┘
```

### Pass 1 — research a chapter

[`RECIPES/research-a-chapter.md`](RECIPES/research-a-chapter.md), or `/research-chapter V`.

1. Read the chapter end to end in the right edition (§1.1). **All of it.** The vaults were
   missed by people who had read *about* chapter V.
2. List its plates from `woodcut_catalog`, and look at the scans.
3. Enumerate **everything the chapter describes that could be a thing in the world** — places,
   buildings, rites, objects, creatures, inscriptions, plants, machines, people, pictures.
   Err toward including. A feature that turns out to be unbuildable becomes `declined`, which
   is information; a feature nobody wrote down is invisible forever.
4. For each, check the world (§1.5) and set `status`. When in doubt, `unknown` — not `built`.
5. Set `research.status: "enumerated"` and re-run the report.

**Do not build anything during a research pass.** The pass is worthless if it stops at the
first interesting thing; that is how chapters get half-read.

### Pass 2 — build a feature

[`RECIPES/model-an-asset.md`](RECIPES/model-an-asset.md), or `/build-feature <id>`.

1. Re-read the cited passage. The citation in the ledger is a pointer, not a substitute.
2. Check `DECISIONS.md` for a call already made about it.
3. Build it. Cite the passage **in the code comment** — that is what makes the next reader
   able to check you, and what feeds `build_evidence`.
4. Bump the cache chain ([`RECIPES/bump-cache-versions.md`](RECIPES/bump-cache-versions.md)).
5. Verify on the running page, then deploy to **both** hosts
   ([`RECIPES/ship-a-release.md`](RECIPES/ship-a-release.md)).
6. Set the feature's `status` and `built_as`, re-run the report, commit the ledger **with the
   code**.

### Pass 3 — audit

[`RECIPES/audit-coverage.md`](RECIPES/audit-coverage.md), or `/audit-coverage`. Refresh the
skeleton, re-render, and read the two queues. Do this before starting any large build, so the
work is chosen from the gap and not from whatever is nearest.

---

## 4. The five standing rules, restated for this pipeline

They are in [`ROUTER.md`](ROUTER.md) in full. Where they bite here:

1. **Verify live before saying built.** A `status` of `built` is a factual claim about the
   deployed page.
2. **Cite, don't invent.** Every feature carries a `source`. "It feels Renaissance" is not one.
3. **Read the book before you model it.** And read the *whole chapter* — see §0.
4. **The site is the Hypnerotomachia only.** Never `git add -A src/`.
5. **Write decisions down as they are made.**

And one this pipeline adds:

6. **The plates are an index, not an inventory.** If your coverage check can only see things
   that were drawn, it will miss the vaults again.

---

## 5. Lifting this to another project

The shape is generic and several projects in `C:\Dev` have it — a corpus, a build, and a gap
between them: Claudiens, TurkaGame, IslamicateOccultPortal, ARTHURROBINPORTAL, ROBINCRAWL.

To lift it, copy `scripts/coverage_seed.py`, `scripts/coverage_report.py` and this file, then
change three things: the unit of coverage (here a chapter; elsewhere an emblem, a manuscript,
a ballad), where the text lives, and the derived-field sources. Keep the two-queue report and
keep the distinction between *unresearched* and *unbuilt* — that distinction is the whole
point, and it is the part that is easy to drop.
