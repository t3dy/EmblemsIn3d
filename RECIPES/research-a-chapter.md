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
| I–XVI | `C:\Dev\hypnerotomachia polyphili\md\Hypnerotomachia_by_Francesco_Colonna.md` (Dallington 1592). Its page markers are **his**, not the 1499's. |
| XVII–XXXVIII | `translation/en/page_NNN.md`, where `NNN` **is** the 1499 page. |

Godwin 1999 is in copyright and is never used.

Reading *about* the chapter is not reading it. The vaults under the pyramid were missed by
people who had read summaries of chapter V.

## 2. Look at its plates

```sql
-- hp.db, from RECIPES/query-the-corpus.md
SELECT catalog_number, page_seq, description
FROM woodcut_catalog WHERE page_seq BETWEEN :a AND :b ORDER BY catalog_number;
```

Then open the scans:
`C:\Dev\hypnerotomachia polyphili\site\images\woodcuts_1499\hp1499_pNNN.jpg`. Read them with
the Read tool — you can see images.

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
