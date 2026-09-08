# ROUTER — start here, then read only what your task needs

*This repo has ~45 markdown files. Reading them all wastes a context window and still
leaves you unsure which one is authoritative. This file is the index of last resort and the
first thing to read. `CLAUDE.md` is deliberately thin and points here.*

**How to use it:** find your task in [the task table](#the-task-table), read the two or
three files it names — **and, if a recipe is listed, follow the recipe** — then work. Do
not read the whole table's worth of documents "for context."

---

## The five rules that outrank everything else

These are not style preferences. Every one of them exists because it was violated and cost
a session.

1. **Verify the live artifact before you say "done", "fixed", "working" or "deployed".**
   Load the actual URL or the running page and confirm *the specific thing that was asked
   for* is visible. Re-reading your own diff is not verification. →
   [`RECIPES/verify-live.md`](RECIPES/verify-live.md)
2. **Cite, don't invent.** Any interpretive claim — in a station description, a commentary
   note, or a code comment justifying a shape — must trace to a named scholar in the corpus
   or to the annotators' evidence in `hp.db`. → [`SOURCES.md`](SOURCES.md),
   [`15scholars.md`](15scholars.md)
3. **Read the book before you model the book.** Geometry is sourced too, not only prose.
   `hp.db.woodcut_catalog` and `folio_descriptions` outrank your mental image of the scene.
   → [`RECIPES/model-an-asset.md`](RECIPES/model-an-asset.md)
4. **This site is the Hypnerotomachia only.** On 2026-09-05 the Atalanta Fugiens side
   was removed from the website — its worlds, its four tours, its games, its plates atlas
   and the HP↔AF archives graph. Nothing under `src/` imports it any more. The files are
   still on disk (`src/scenes/AFWorldScene.js`, `EmblemScene.js`, `ArchivesScene.js`,
   `src/data/af_*.js`, `lab/`, `images/emblems/`) but they are **dormant**: do not re-wire
   them, and do not add Atalanta features. **Never `git add -A src/`** — stage explicit
   paths; that habit swept an Atalanta file into an HP commit twice.
5. **Write directional decisions down the moment they are made** — in
   [`DECISIONS.md`](DECISIONS.md), and the standing queue in
   [`NEXTSTEPS.md`](NEXTSTEPS.md). A decision that lives only in chat gets summarised away
   and re-litigated.
6. **The plates are an index, not an inventory.** Anything the book *describes* counts,
   drawn or not — roughly a third of what is worth building has no woodcut. On 2026-09-07
   the tunnels under the pyramid turned out never to have been built, because every
   coverage check anyone ran was plate-driven and the vaults have no plate. Coverage is
   tracked chapter by chapter in [`research/coverage.json`](research/coverage.json),
   rendered as [`COVERAGE.md`](COVERAGE.md). →
   [`HPTOTOURPIPELINE.md`](HPTOTOURPIPELINE.md)

---

## The task table

| If your task is… | Read | Recipe |
|---|---|---|
| **Decide what to build next** | `COVERAGE.md` (generated — the two queues) | [`RECIPES/audit-coverage.md`](RECIPES/audit-coverage.md) · `/audit-coverage` |
| **Read a chapter against the world** (enumerate its features) | `HPTOTOURPIPELINE.md` §1–§3 | [`RECIPES/research-a-chapter.md`](RECIPES/research-a-chapter.md) · `/research-chapter <numeral>` |
| **Build a feature from the build queue** | its entry in `research/coverage.json`, then the passage it cites | [`RECIPES/model-an-asset.md`](RECIPES/model-an-asset.md) · `/build-feature <id>` |
| **Add or edit a tour stop / commentary note** | `SOURCES.md`, `15scholars.md`, `DESIGN.md` | [`RECIPES/add-a-tour-stop.md`](RECIPES/add-a-tour-stop.md) |
| **Make a place feel like a garden** (light, shade, sound, scent, rest) | `PLEASURES.md`, then `GARDENS.md` | — |
| **Model or improve a 3-D asset** (figure, fountain, gate, tree, car) | `SOURCES.md` asset table → the named scholar in `15scholars.md`; then the brief for that class (below) | [`RECIPES/model-an-asset.md`](RECIPES/model-an-asset.md) |
| **Add a swappable variant of an existing asset** | `src/systems/AssetVariants.js`, `IMPORTEXEMPLARS.md` | [`RECIPES/add-an-asset-variant.md`](RECIPES/add-an-asset-variant.md) |
| **Import a scan, model or painting cut-out** | `IMPORTEXEMPLARS.md`, `RENAISSANCEART.md`, `LICENSECHOICES.md` | [`RECIPES/import-an-exemplar.md`](RECIPES/import-an-exemplar.md) |
| **Change anything the browser loads** (any `src/` file) | — | [`RECIPES/bump-cache-versions.md`](RECIPES/bump-cache-versions.md) |
| **Deploy** | `DEPLOY_STATE.md` (GitHub Pages only — Vercel retired 2026-09-07) | [`RECIPES/ship-a-release.md`](RECIPES/ship-a-release.md) |
| **Check that a change actually landed** | `DEPLOY_STATE.md` | [`RECIPES/verify-live.md`](RECIPES/verify-live.md) |
| **Find what the book/scholarship says about anything** | `SOURCES.md`, `15scholars.md` | [`RECIPES/query-the-corpus.md`](RECIPES/query-the-corpus.md) |
| **Work on the translation or the parallel edition** | `translation/NOTES.md`, `scripts/build_translation_page.py` | — |
| **Change how the world is *drawn*** (light, air, colour, register) | `RENDERING.md`, then `src/shaders/` | — |
| **Work on UI, navigation, layout, typography** | `INTERFACECHOICES.md`, `TRANSLATIONDISPLAYCHOICES.md`, `DESIGN.md` | — |
| **Work on the game loop / Dream mode** | `DESIGN.md`, `GAMIFYVRHP.md`, `src/systems/DreamMode.js` | — |
| **Decide *whether* to do something** | `DESIGN.md`, `DECISIONS.md`, `NEXTSTEPS.md` | — |

### The subject briefs — one per class of thing in the world

Read the one that matches what you are building. Each is a research brief, not a spec.

| Brief | Covers |
|---|---|
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | orders, members, the portal, the temples, the theatre |
| [`GARDENS.md`](GARDENS.md) | the island's rings, terraces, parterres, topiary |
| [`PLEASURES.md`](PLEASURES.md) | what a Renaissance garden was *for* — shade, birdsong, scent, water, repose — each paired with what Poliphilo says when he meets it |
| [`RENDERING.md`](RENDERING.md) | how the world is drawn: aerial perspective, the 1499 pigment shelf, and the painterly techniques considered and turned down |
| [`PLANTS.md`](PLANTS.md) | species, planting, the herb-set inscriptions |
| [`ANIMALS.md`](ANIMALS.md) | the beasts — elephants, unicorns, panthers, griffins, harpies |
| [`NYMPHS.md`](NYMPHS.md) + [`CHARACTERS.md`](CHARACTERS.md) | Polia, the nymphs, the human figures |
| [`PROCESSIONS.md`](PROCESSIONS.md) + [`VEHICLES.md`](VEHICLES.md) | the five triumphs, the cars, the teams, the liveries |
| [`WATER.md`](WATER.md) | fountains, basins, jets, caustics, the water-labyrinth |
| [`ORNAMENT.md`](ORNAMENT.md) | friezes, meanders, egg-and-dart, hieroglyph bands, plaques |
| [`MYTHOLOGY.md`](MYTHOLOGY.md) | the gods, the myths, what each figure means |
| [`RENAISSANCEART.md`](RENAISSANCEART.md) | how to get period painting into this medium at all |
| [`IMPORTEXEMPLARS.md`](IMPORTEXEMPLARS.md) | what has been imported, from where, under what licence |

### The standing documents

| File | What it is | When to read it |
|---|---|---|
| [`HPTOTOURPIPELINE.md`](HPTOTOURPIPELINE.md) | corpus in, game out: where every category of research material lives, and the three artifacts | before researching or building |
| [`COVERAGE.md`](COVERAGE.md) | **generated.** What the book has and the world does not, chapter by chapter | before choosing work |
| [`DESIGN.md`](DESIGN.md) | "The Dream in Lenses" — the design vision | before any feature work |
| [`DECISIONS.md`](DECISIONS.md) | binding directional calls, newest first | before proposing a direction |
| [`NEXTSTEPS.md`](NEXTSTEPS.md) | the standing work queue | at the start and end of every session |
| [`SOURCES.md`](SOURCES.md) | the corpus map + the asset→scholar table | before writing or modelling |
| [`15scholars.md`](15scholars.md) | who settles what, where their text is, what not to claim | when you need depth on a source |
| [`DEPLOY_STATE.md`](DEPLOY_STATE.md) | one host (Pages), the cache trap, how to check | before and after deploying |
| [`TECH_STACK.md`](TECH_STACK.md) | Three.js r168 via importmap, no build step | when touching the loader |
| [`CREDITS.md`](CREDITS.md) | attribution for every imported asset | whenever you import anything |

### Historical — accurate about the past, not about the present

`INDEX.md`, `PLAN.md`, `STATUS.md`, `HANDOFF.md`, `PROJECT_SUMMARY.md`,
`COMPLETE_BRIEFING.md`, `SCENES.md`, `VISION.md`, `TWO_WORLDS_FRAMEWORK.md`,
`RESEARCH_ROADMAP.md`, `RESEARCHPASSFORVR.md`, `docs/*`.

These are from the planning phase (June 2026) or from superseded framings. They still
contain good research and are worth mining, **but do not take a "current status", a phase
number, or a file layout from them.** For where the project actually is, read
`NEXTSTEPS.md` and `DECISIONS.md`.

The Atalanta documents — `ATALANTA_ANIMATION_STRATEGIES.md`, `ATALANTA_INTEGRATION.md`,
`ATALANTA_SUMMARY.md` — describe a part of the project that is no longer on the site
(rule 4 above). Kept as the record of what was built and why; not a guide to anything
current.

---

## The shape of the code

No build step. Static site, ES modules, Three.js r168 via importmap from jsDelivr.

```
index.html              the landing page (the Hypnerotomachia's own front door)
src/index.html          the app shell — ALL the CSS is inline here, and it is NOT cache-busted
src/main.js             UI, the tour, the three modes, data loading, the graphics menu
src/scenes/
  HPWorldScene.js       the Hypnerotomachia world — every station, every model
  VaultsScene.js        the crawl beneath the pyramid — a seeded maze, cited to Dallington
                        pp. 82-87 mechanic by mechanic (pillars of 4/6/8 sides, the pits,
                        the everlasting lamps, the little wicket, the hunting dragon)
  AFWorldScene.js  EmblemScene.js  ArchivesScene.js  HPScene.js   ← DORMANT, not imported
src/systems/
  DragonFlight.js       third-person flight: the dragon, its camera, its controls
  Cast.js               figures, animals, props, labels — `nymph({ rank, garland })` carries
                        the chess liveries (king/queen/rook/bishop/knight/pawn), the vested
                        heads of the rite of Venus (mitre/tutulus), and the two wreaths
  AssetVariants.js      the swappable-variant registry (one entry per asset class)
  Walker.js             free-walk movement and collision
  DreamMode.js          the narrative game loop
  EnvMap.js             the one shared PMREM environment
  Particles.js  Meadow.js  AlchemicalAudio.js (a deliberate no-op stub — the site is silent)

Worth knowing inside `HPWorldScene.js`, because they are reused and easy to miss:
  _column/_entablature/_steps/_doorway   the shared classical members
  _frieze(kind, {signs})                 carved bands; `hieroglyph` spells a named sequence
                                         from `HPWorldScene.SIGNS` (15 signs, sourced)
  _drape(), _drapeTexture()              cloths hung on a building (Lefaivre, ARCHITECTURE §0)
  _harness(kind, beast)                  a draught team's furniture, in the beast's own frame
                                         (elephant / centaur / unicorn / leopard, PROCESSIONS §2c)
  _buildVenusTemple / _buildWaterLabyrinth / _buildColossus / _buildPriapusRite /
  _buildAmphitheatre / _buildCupidTriumph / _polyandrionMedallions / _buildBookTwo
                                         the 2026-09-05 "build everything" pass; each carries
                                         its page citations in its header comment
  _geloi (in _buildBath)                 the ΓΕΛΟΙΑΣΤΟΣ trick step — proximity-driven, see update()
  SIGNS (23) + _carvedTexture            the hieroglyph vocabulary; the elephant's base and the
                                         bridge's right table are TRANSCRIBED (Dallington), the
                                         portal piers are a seeded line on purpose
  _spoilTexture(), _orderBoardTexture()  things DRAWN rather than modelled — the register
                                         that works best here
  _plaque(), _plaqueTexture()            all lettering; measures its type to the stone
  _m(), _circleCol(), _wallCol()         mesh helper and the two collider kinds
src/shaders/HPStyles.js the four aesthetic registers
src/data/               tours.json (the Novel tour), gallery.json, hp_*.json, lexicon
game/                   Poliphilo's Commonplace Book — the visual novel
research/               translation.html, lexicon.html, nymphs.html — the DH pages
translation/            source/ (Italian), en/ (our English), manifest.json, NOTES.md
scripts/                export_for_3d.py, build_translation_page.py, cut_figures.py
```

**Three constraints that have each cost a rebuild:**

- **The walker has no floor height.** It walks at y = 0 with a fixed 1.7 eye, so a podium is
  scenery, not ground: anything you can stand on must stay under about half a metre or the
  dreamer ends up chest-deep in it. See DECISIONS.md, the Temple of Venus.
- **An open-ended `CylinderGeometry` is invisible from inside** unless its material is
  `DoubleSide` — which is how the first Temple of Venus got a dome you could see sky through.
- **`_vanes` is Fortuna's registry**, integrated with `+=` from `{rate, phase}`. Anything else
  that turns needs its own array (`_windVanes`, `_windBells`), or the two animators write NaN
  through each other's meshes.

**Two facts about this layout that cause bugs:**

- **All CSS lives inline in `src/index.html`, which no `?v=` covers.** A returning visitor
  can get new JS with old CSS. Never fix a layout bug in CSS alone if the JS can enforce it
  too. (`setHidden()` in `main.js` exists for exactly this reason.)
- **A different `?v=` is a different module to the browser.** Importing
  `AssetVariants.js?v=1` from one file and `?v=2` from another gives you two module
  instances with separate state, and the second one's registry silently does nothing. Bump
  the whole chain or none of it. → [`RECIPES/bump-cache-versions.md`](RECIPES/bump-cache-versions.md)

---

## Working with agents on this project

Single-agent, sequential, is the default and is usually right: the tasks here are coupled
through `HPWorldScene.js` and the `?v=` chain, and two agents editing that file concurrently
will conflict.

**Parallelise only along these seams**, which do not share files:

| Lane | Owns | Never touches |
|---|---|---|
| World geometry | `src/scenes/HPWorldScene.js`, `src/systems/Cast.js`, `src/shaders/` | `tours.json`, `research/` |
| Tour & commentary | `src/data/tours.json`, `src/data/hp_*.json` | `src/scenes/` |
| Research pages | `research/*.html`, `scripts/build_*.py` | `src/` |
| Translation | `translation/` | everything else |
| Landing page & docs | `index.html`, `README.md`, the `*.md` briefs | `src/`, `research/` |
| Chapter research | `research/coverage.json`, `COVERAGE.md` | `src/` — a research pass builds nothing |

Rules for a parallel run: each lane stages only its own paths; **one** agent owns the
`?v=` bump and the push, at the end; and each lane records what it did in `NEXTSTEPS.md`
before finishing.

### The three defined agents

Their briefs live in `.claude/agents/`, and each has a slash command that drives it.

| Agent | Does | Never does | Command |
|---|---|---|---|
| `hp-researcher` | reads one chapter end to end, enumerates its features into the ledger | writes game code | `/research-chapter <numeral>` |
| `hp-builder` | builds one enumerated feature, verifies it live, deploys, updates the ledger | invents a source | `/build-feature <id>` |
| `hp-verifier` | confirms or refutes that a feature marked `built` is on the deployed page | builds | — |

Research and build are **separate passes on purpose.** A pass that stops at the first
interesting thing to go and build it is how chapters get half-read — which is how chapter V
was half-read for months.

---

## Before you finish a session

1. Live-verified the specific thing asked for? → [`RECIPES/verify-live.md`](RECIPES/verify-live.md)
2. Bumped the `?v=` chain for every changed module?
3. Pushed to `main` and confirmed Pages is serving it?
4. Recorded new directional calls in `DECISIONS.md` and remaining work in `NEXTSTEPS.md`?
5. Staged explicit paths, and checked `git status` before committing?
6. If you built or researched anything: updated `research/coverage.json`, re-run
   `python scripts/coverage_seed.py && python scripts/coverage_report.py`, and committed
   `COVERAGE.md` with the code?

If any answer is no, say so plainly in the report rather than rounding up to "done".
