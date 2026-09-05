# HPin3D — project instructions (auto-loaded)

*Emblems in 3D: interactive 3-D worlds, a guided tour, and a complete digital edition built
from the 1499 **Hypnerotomachia Poliphili** (and Maier's Atalanta Fugiens). Live at
https://emblems-in-3d.vercel.app.*

## Scholarship is on hand — use it, don't invent

There is a full HP research corpus on this machine. **Before describing or modelling any
scene — gardens, processions, nymphs, architecture, hieroglyphs, tombs, the pagan gods, the
alchemical readings — consult it.** This is not only for the tour's words: **it governs the
3-D geometry too.** Before you build or revise a model, figure, garden, gate or ornament in
`src/scenes/` or `src/systems/Cast.js`, read what the book and the scholarship say about it
so the shape matches the commentary. `SOURCES.md` has a **"Modelling the 3-D assets" table**
mapping each object to the scholar and DB tables to read first (Bury for the pyramid/Mausoleum,
Curran for the hieroglyph gates and obelisks, Stewering for Polia and the nymphs, Hunt & Segre
for the gardens and parterres, Nygren for the statuary, Lefaivre for the architecture). The
map is **[SOURCES.md](SOURCES.md)** (read it once per project you touch this in). In short:

- **Working corpus:** `C:\Dev\hypnerotomachia polyphili\` — per-scholar markdown
  (`scholars\<slug>\`), full-text markdown of every PDF (`md\`), RAG chunks (`chunks\`), a
  built DH site (`site\`), and manuscript facsimiles. **Read the `.md` files directly.**
- **Database:** `C:\Dev\hypnerotomachia polyphili\db\hp.db` (27 tables: `folio_descriptions`,
  `woodcut_catalog`, `alchemical_symbols`, `annotations`, `dictionary_terms`, …). Query with
  sqlite3; `scripts/export_for_3d.py` already feeds `src/data/hp_*.json` from it.
- **PDF archive:** `E:\pdf\hypnerotomachia polyphili\` (35 books/articles, incl. **James
  Russell's** Durham PhD — the source for the alchemical reading).

**Cite, don't fabricate.** Any interpretive claim in a station description or a commentary
note must trace to a named scholar in that corpus (or to the annotators' evidence in
`hp.db`), never an invented reading. The **alchemical** commentary flavour specifically is
Russell's reception evidence + `hp.db.alchemical_symbols` — attribute it, don't make it up.

## Read the work queue first

**[NEXTSTEPS.md](NEXTSTEPS.md) is the standing list of everything Ted has asked for that
is not yet finished. Read it at the start of every session and work it down.** Items stay
there until they are actually built, verified in the browser, and deployed to both hosts.

When Ted asks for something, **add it to NEXTSTEPS.md immediately, in his words, before
starting the work** — not after. The failure this guards against is real and happened on
2026-09-05: several explicit requests (the documentation set, the lexicon gallery) were
acknowledged and never delivered, because each new message pulled attention to the newest
thing and the older asks were quietly filed as "next". Newest-first is not a priority
order. **Finishing what was already asked for comes before responding to what was just
said**, and when reporting, state what is still open rather than letting Ted find it.

## The design vision & decisions

- **[DESIGN.md](DESIGN.md)** — "The Dream in Lenses": one faithful world read through
  stackable lenses (POV + toggleable colour-coded commentary flavours), all four moods,
  expressive (non-branching) reaction-choices, a single global interpretive lens for
  alternate 3-D realizations, narrative-default player-overridable mood-light.
- **[DECISIONS.md](DECISIONS.md)** — binding directional calls, newest first (imported models
  now allowed; self-hosted gallery; the creative brief; etc.).
- Fuller background: `VISION.md`, `GARDENS.md`, `PROCESSIONS.md`, `CHARACTERS.md`,
  `RESEARCH_ROADMAP.md`, `docs/HP_SOURCEBOOK.md`.

**Keep decisions durable.** When Ted sets a direction or points at a source mid-session,
record it here / in `DECISIONS.md` / `SOURCES.md` immediately — not only in chat.

## Build & deploy

- No build step: static site, Three.js r168 via importmap (jsDelivr), primitives + a few
  imported glTF models. Translation → `scripts/build_translation_page.py`.
- **Cache-version chain (manual):** bump `?v=N` on a changed module in every importer, up the
  chain to `main.js?v=N` in `src/index.html`. Data files use the single `const V` in
  `main.js` `loadData()`. (e.g. `Cast.js`/`Walker.js` → `HPWorldScene.js`/`AFWorldScene.js`
  → `main.js` → `src/index.html`.)
- Deploy: `vercel --prod --yes` (canonical `emblems-in-3d.vercel.app`); also pushed to
  `github.com/t3dy/EmblemsIn3d` (GitHub Pages). **Verify the live artifact**, don't claim
  done from the diff.

## Workspace note

This project sits in the `C:\Dev` multi-project workspace (`C:\Dev\CLAUDE.md`). The corpus
at `C:\Dev\hypnerotomachia polyphili\` is a **separate git repo** — treat it read-only from
here.
