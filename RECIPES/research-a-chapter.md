# Recipe — research a chapter

*Turn one chapter of the book into ledger entries. **Do not build anything during this pass.***

Full context: [`HPTOTOURPIPELINE.md`](../HPTOTOURPIPELINE.md) §3, pass 1.

## 0. Pick the chapter

```bash
python scripts/coverage_report.py
```

Then read `COVERAGE.md` §1, the research queue.

## 1. Read it — all of it

| Chapter | Where |
|---|---|
| **I–XXXVIII, all of it** | `translation/en/page_NNN.md`, where `NNN` **is** the 1499 page. Ours, CC0, and since 2026-09-09 it covers the **whole** book, pp. 1–467 — not only XVII onward. This is the edition you read. |
| I–XVIII, second witness | `C:\Dev\hypnerotomachia polyphili\md\Hypnerotomachia_by_Francesco_Colonna.md` (Dallington 1592). Useful for a word, never for a page. |

Godwin 1999 is in copyright and is never used.

Reading *about* the chapter is not reading it. The vaults under the pyramid were missed by
people who had read summaries of chapter V.

### Dallington's page numbers are not the book's — check before you cite one

His 279 e-text pages abridge the 1499's 467, so **his count falls behind and never catches
up**: about 20 pages behind by his p. 80, about 58 by his p. 194, about 62 by his p. 250. Then
it jumps, because after 1499 p. 193 he skips straight to p. 238 and stops at `FINIS` on
p. 241. There is **no constant** that converts one to the other.

**So: before you write `Dallington p. N` into a `source`, open
`translation/en/page_NNN.md` and check that its first line — `# Page NNN — Chapter XX` —
names the chapter you think you are in.** If it does not, you are citing the wrong chapter.

That is not hypothetical. Every one of chapter XV's ten features was filed there because
Dallington's pp. 242–260 were read as 1499 folios; they are 1499 pp. 182–241, which is three
other chapters, and the mis-filing hid the whole opening episode of chapter XVII
(`bug-dallington-page-drift`). Prefer a `translation/en/page_NNN.md` citation outright; add
Dallington only as a second witness, and say in the source that the number is **his**.

## 2. Look at its plates

```sql
-- hp.db, from RECIPES/query-the-corpus.md
SELECT catalog_number, page_seq, description
FROM woodcut_catalog WHERE page_seq BETWEEN :a AND :b ORDER BY catalog_number;
```

Mind the third numbering: `page_seq` is **ten pages behind** the translation's page
(`our page = page_seq + 10`), and the scans are named by `page_seq`. So chapter XVII's
pp. 189–224 are `page_seq` 179–214.

Then open the scans:
`C:\Dev\hypnerotomachia polyphili\site\images\woodcuts_1499\hp1499_pNNN.jpg`. Read them with
the Read tool — you can see images.

**Open the scan; do not trust the catalogue's page.** `woodcut_catalog.page_seq` was placed by
LLM subject-matching (see its own `link_basis`) and is good to about ±2 pages — and sometimes
much worse. Of the 61 near-boundary plates opened on 2026-09-20, six were on a different page
and four catalogued pages carried **no woodcut at all**. Whatever you find, record it in
`PLATE_PAGE_CONFIRMED`, `PLATE_PAGE_FIXES` or `PLATE_PAGE_UNRESOLVED` in
`scripts/coverage_seed.py`, with the identifying line of Italian — a confirmation is evidence
too, and without it nobody can tell a page that was checked from one nobody has opened.

**A chapter with no plates is not a chapter with nothing in it.** That confusion is the whole
reason this recipe exists.

## 3. Enumerate every describable thing

Places, buildings, rites, objects, creatures, inscriptions, plants, machines, people,
pictures. Err toward including: an entry that turns out unbuildable becomes `declined`, which
is information, whereas a thing nobody wrote down is invisible forever.

Each entry needs a **`source`** — a page, not an impression.

## 4. Check each against the world

`src/scenes/HPWorldScene.js`, `src/scenes/VaultsScene.js`, `src/systems/Cast.js`,
`src/data/tours.json`. Grep for the plate number and for likely `_build…` names.

Set `status`: `built` only if you have seen it on the running page
([`verify-live.md`](verify-live.md)). Otherwise `unknown`. A plate number in a code comment
proves someone looked, not that a thing exists.

## 5. Write it and render

Edit `research/coverage.json` — that chapter's `features` array, and its `research` block:

```json
"research": { "status": "enumerated", "enumerated_by": "…", "date": "YYYY-MM-DD", "note": "…" }
```

```bash
python scripts/coverage_seed.py && python scripts/coverage_report.py
```

Commit the ledger and `COVERAGE.md` together. If the pass turned up something big, put the
directional call in `DECISIONS.md` and the queue item in `NEXTSTEPS.md`.
