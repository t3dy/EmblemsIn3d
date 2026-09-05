# HPin3D — project instructions (auto-loaded)

*Emblems in 3D: interactive 3-D worlds, a guided tour, and a complete digital edition built
from the 1499 **Hypnerotomachia Poliphili** (and Maier's Atalanta Fugiens). Live at
https://emblems-in-3d.vercel.app.*

## → Read [ROUTER.md](ROUTER.md) first

This repo has ~45 markdown files. **`ROUTER.md` is the entry point**: a task table that
names the two or three documents your task actually needs, and points at a procedure in
[`RECIPES/`](RECIPES/) for the tasks this project repeats. Do not read the docs
indiscriminately — route, then work.

This file is deliberately thin. It carries only the rules that must be in context from the
first token of every session.

---

## The five rules

1. **Verify the live artifact before saying "done", "fixed", "working" or "deployed".**
   Load the real URL or running page and confirm *the specific thing that was asked for*.
   Re-reading your own diff is not verification. → `RECIPES/verify-live.md`
2. **Cite, don't invent.** Every interpretive claim — in a station description, a
   commentary note, or a code comment justifying a shape — traces to a named scholar in the
   corpus or to the annotators' evidence in `hp.db`. → `SOURCES.md`, `15scholars.md`
3. **Read the book before you model the book.** This governs the geometry, not only the
   prose: `hp.db.woodcut_catalog` and `folio_descriptions` outrank your mental image.
   → `RECIPES/model-an-asset.md`
4. **The site is the Hypnerotomachia only** (2026-09-05). The Atalanta Fugiens
   worlds, tours and games were removed from the website; nothing under
   `src/` loads them any more. Their source files are still on disk —
   `src/scenes/AFWorldScene.js`, `src/scenes/EmblemScene.js`,
   `src/scenes/ArchivesScene.js`, `src/data/af_*.js`, `lab/`,
   `images/emblems/`, `images/cutouts/emblem-*` — **dormant, not wired in.**
   Do not re-import them, and do not build new Atalanta features.
   **Never `git add -A src/`** — stage explicit paths.
5. **Write directional decisions down immediately** — `DECISIONS.md` for calls,
   `NEXTSTEPS.md` for the standing queue. A decision that lives only in chat gets
   summarised away and re-litigated.

## The scholarship is on hand — use it

A full research corpus is on this machine. `SOURCES.md` is the map (including a
**"Modelling the 3-D assets"** table pairing each object with the scholar to read first);
`15scholars.md` says what each will and will not support.

- **Corpus:** `C:\Dev\hypnerotomachia polyphili\` — `md\` (full text of every PDF),
  `scholars\<slug>\`, `chunks\`, `site\`, facsimiles. Read the `.md` files directly.
- **Database:** `C:\Dev\hypnerotomachia polyphili\db\hp.db` (27 tables).
- **PDFs:** `E:\pdf\hypnerotomachia polyphili\`.
- **Our translation:** `translation/` — chapters XVII–XXXVIII and Book II, ours and CC0.
  **Godwin (1999) is in copyright, is not in the corpus, and is never used.**

It is a separate git repo: treat it **read-only** from here.

## Build & deploy

No build step: static site, Three.js r168 via importmap (jsDelivr), primitives plus a few
imported glTF models.

- **Cache-version chain is manual.** Bump `?v=N` on a changed module in **every** importer,
  up the chain to `main.js?v=N` in `src/index.html`. Data files use the single `const V` in
  `main.js` `loadData()`. A different `?v=` is a *different module* with separate state.
  → `RECIPES/bump-cache-versions.md`
- **Two hosts, both every time:** `vercel --prod --yes && git push origin main`.
  → `DEPLOY_STATE.md`, `RECIPES/ship-a-release.md`
- **All CSS is inline in `src/index.html`, which no `?v=` covers.** Never fix a layout bug
  in CSS alone if the JS can enforce it.

## Design

- **[DESIGN.md](DESIGN.md)** — "The Dream in Lenses": one faithful world read through
  stackable lenses (POV + toggleable colour-coded commentary flavours), all four moods,
  expressive non-branching reaction-choices, a single global interpretive lens.
- **[DECISIONS.md](DECISIONS.md)** — binding directional calls, newest first.

## Workspace note

This project sits in the `C:\Dev` multi-project workspace (`C:\Dev\CLAUDE.md`), whose
Working Discipline section applies here in full.
