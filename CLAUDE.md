# HPin3D — project instructions (auto-loaded)

*Emblems in 3D: interactive 3-D worlds, a guided tour, and a complete digital edition built
from the 1499 **Hypnerotomachia Poliphili** (and Maier's Atalanta Fugiens). Live at
https://t3dy.github.io/EmblemsIn3d/.*

## → Read [ROUTER.md](ROUTER.md) first

This repo has ~45 markdown files. **`ROUTER.md` is the entry point**: a task table that
names the two or three documents your task actually needs, and points at a procedure in
[`RECIPES/`](RECIPES/) for the tasks this project repeats. Do not read the docs
indiscriminately — route, then work.

This file is deliberately thin. It carries only the rules that must be in context from the
first token of every session.

---

## The seven rules

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
   worlds, tours and games were removed from the website, and on 2026-09-06
   their source files, the `lab/`, the emblem images and the `/v1/` `/v2/`
   site archives were **removed from `main` altogether**. They live on the
   branch `atalanta-archive` (tag `atalanta-archive-2026-09-06`). Do not
   re-import them, and do not build new Atalanta features.
   **Never `git add -A src/`** — stage explicit paths.
5. **Write directional decisions down immediately** — `DECISIONS.md` for calls,
   `NEXTSTEPS.md` for the standing queue. A decision that lives only in chat gets
   summarised away and re-litigated.
6. **The plates are an index, not an inventory.** Anything the book *describes* counts,
   drawn or not. The tunnels under the pyramid went unbuilt for months because every
   coverage check was driven by the woodcut catalogue and the vaults have no woodcut.
   Coverage is tracked chapter by chapter in `research/coverage.json`, rendered as
   [`COVERAGE.md`](COVERAGE.md). → [`HPTOTOURPIPELINE.md`](HPTOTOURPIPELINE.md)
7. **Measure, don't estimate.** `await hpDiag()` on the running page, **before your pass
   and after it**, and put both readings in the commit message. The budget is a *regression*
   budget, not an absolute one — the world runs at ~3 124 draw calls and ~26 fps by Ted's
   explicit choice (2026-09-09), so the gate is *don't make it materially worse than you
   found it*: over 25 % added, stop and ask. Defects and debt go in `research/tickets.json`
   (→ `TICKETS.md`), each with an acceptance criterion a machine could check.
   → [`ENGINEERING.md`](ENGINEERING.md)

## Corpus in, game out

[`HPTOTOURPIPELINE.md`](HPTOTOURPIPELINE.md) is the pipeline: where each of the six
categories of research material lives, the three artifacts the research pass produces, and
how they reach the agent who writes the geometry. Three commands drive it —
`/audit-coverage` to see the gap, `/research-chapter <numeral>` to close a research gap,
`/build-feature <id>` to close a build gap — backed by the agents in `.claude/agents/`.
**Research and build are separate passes.**

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
- **One host: GitHub Pages.** `git push origin main` is the whole deploy. **Vercel is
  retired (2026-09-07)** — never run it, and never cite emblems-in-3d.vercel.app, which is
  now a stale mirror. → `DEPLOY_STATE.md`, `RECIPES/ship-a-release.md`
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
