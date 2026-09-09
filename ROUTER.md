<!-- tokens: ~7,049 · read for: the task table; read this first, then two or three files -->
# ROUTER — start here, then read only what your task needs

*This repo has ~45 markdown files. Reading them all wastes a context window and still
leaves you unsure which one is authoritative. This file is the index of last resort and the
first thing to read. `CLAUDE.md` is deliberately thin and points here.*

**How to use it:** find your task in [the task table](#the-task-table), read the two or
three files it names — **and, if a recipe is listed, follow the recipe** — then work. Do
not read the whole table's worth of documents "for context."

---

## The rules that outrank everything else

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
7. **Measure, don't estimate.** `await hpDiag()` on the running page reports draw calls,
   frame time and wasted materials. Every performance number written down here before
   2026-09-08 was a guess, and the guess was wrong by a factor of two — the real figure is
   **3 124**. Ted saw that and accepted it (`DECISIONS.md` 2026-09-09), so the budget is a
   **regression** one: take a reading **before and after**, put both in the commit message,
   and if your pass adds more than **25 %** stop and ask. Do not re-propose the renderer
   refactor. → [`ENGINEERING.md`](ENGINEERING.md) §1

---

## The task table

| If your task is… | Read | Recipe |
|---|---|---|
| **Fix a defect, pay down debt, or make the world faster** | `TICKETS.md` (generated — the queue), then `ENGINEERING.md` §1 for the budget | run `await hpDiag()` on the live page **before and after**, and put both readings in the commit message |
| **Understand how this project works** (tickets, tests, budgets, context) | [`ENGINEERING.md`](ENGINEERING.md) — measurements first, proposals second | — |
| **Decide what to build next** | `COVERAGE.md` (generated — the two queues) | [`RECIPES/audit-coverage.md`](RECIPES/audit-coverage.md) · `/audit-coverage` |
| **Read a chapter against the world** (enumerate its features) | `HPTOTOURPIPELINE.md` §1–§3 | [`RECIPES/research-a-chapter.md`](RECIPES/research-a-chapter.md) · `/research-chapter <numeral>` |
| **Build a feature from the build queue** | its entry in `research/coverage.json`, then the passage it cites | [`RECIPES/model-an-asset.md`](RECIPES/model-an-asset.md) · `/build-feature <id>` |
| **Add or edit a tour stop / commentary note** | `SOURCES.md`, `15scholars.md`, `DESIGN.md` | [`RECIPES/add-a-tour-stop.md`](RECIPES/add-a-tour-stop.md) |
| **Make a place feel like a garden** (light, shade, sound, scent, rest) | `PLEASURES.md`, then `GARDENS.md` | — |
| **Size or site anything** (how big, how far apart, which way round) | `DIMENSIONS.md`, `DIRECTIONS.md`, and `research/dimensions.json` for the numbers | — |
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
| **Work on Roll Up** (the Katamari mode) | [`ROLLING.md`](ROLLING.md) — every variable and which one to turn; then `src/systems/RollUp.js` and `HPWorldScene._census` | — |
| **Understand what is stuck to the ball** (the crust, and why it sheds) | [`CRUST.md`](CRUST.md) — one dial of Roll Up, in detail | — |
| **Build or fix a human figure** | [`HUMANOIDS.md`](HUMANOIDS.md), then `NYMPHS.md` / `CHARACTERS.md` and the plate | — |
| **Build or fix an animal** | [`ANIMALS.md`](ANIMALS.md) §4, then the plate | — |
| **Understand why the world costs what it costs** | [`DRAWCALLS.md`](DRAWCALLS.md) — what a draw call is, what merging would buy, and why we are not doing it | `await hpDiag()` |
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
| [`MODES.md`](MODES.md) | **the five modes and the ten layers, and the "How it plays" table every brief below ends with** |
| [`BANQUET.md`](BANQUET.md) | Eleuterylida's supper: the seven changes of table, the perfuming vessel, the wheeled fountain, the repository |
| [`CROSSING.md`](CROSSING.md) | Cupid's exeres, the six rowers, the AMOR VINCIT OMNIA standard |
| [`ADONIS.md`](ADONIS.md) | the fountain and sepulchre that close Book I, and why the roses are white |
| [`CHESSBOARD.md`](CHESSBOARD.md) | the human chess match, the gold-and-silver liveries, Hand E and Chigi |
| [`MASONRY.md`](MASONRY.md) | drums, ashlar, voussoirs; what settles, what topples, what depends on what |
| [`LITTER.md`](LITTER.md) | the seventy-two attested kinds of small thing on the floors, Roll only |
| [`ROLLMODE.md`](ROLLMODE.md) | the hermaphrodite, the ladder of the metals, what every object owes the ball |
| [`DRAGONFLIGHT.md`](DRAGONFLIGHT.md) | the dream from the air: controls, bounds, what reads from forty metres |
| [`DREAMMODE.md`](DREAMMODE.md) | the game: thirteen stops, four moods, the jump, what a stop owes and what a reaction is for |
| [`MUSICIANS.md`](MUSICIANS.md) | everyone who plays or sings, and how a silent site meets each |
| [`HARPIES.md`](HARPIES.md) | the harpy as bracket: feet, angle-figures, tails turning to leaves |
| [`DIMENSIONS.md`](DIMENSIONS.md) | **every measurement the book states, in metres** — the pyramid at 1 140 m, Cythera at 1 400 m — against what the world builds, and the units trap in Dallington's "furlong" |
| [`DIRECTIONS.md`](DIRECTIONS.md) | the plan: the order of places, the four explicit turns, the sun as the only compass, the compass frame the world should declare, and why the dream is enclosures rather than a corridor |
| [`WOODS.md`](WOODS.md) | the **three** woods — the Hercynian dark wood roofed like a vault, the open grove of the second dream, the wooded country beyond the vaults — their species out of the 1499 Italian, and what makes the first one dark |

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
`ATALANTA_SUMMARY.md` — **were removed from `main` on 2026-09-09** and live on the branch
`atalanta-archive` (tag `atalanta-archive-2026-09-06`), where their code went on 2026-09-06.
They describe a part of the project rule 4 forbids building, they cost about **15 000 tokens**
to have in the root, and every grep and every routing pass was hitting them. Read them there
if you need the record of what was built and why:

```
git show atalanta-archive:ATALANTA_INTEGRATION.md
```

`COMPLETE_BRIEFING.md` and `TWO_WORLDS_FRAMEWORK.md` remain on `main` and still reference
them by name. Both are June 2026 planning documents from the superseded two-world framing;
they are in the list above for that reason.

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
  RollUp.js             the Katamari mode: a Sol-and-Luna ball that eats the garden.
                        Reads HPWorldScene's roll-up CENSUS — see _census /
                        takeRollable there, which is where the interesting part is
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

- **The walker HAS floor height, since 2026-09-08 — this line used to say the opposite.**
  `Walker.floors` is a list of `{kind:'rect'|'disc'|'ring', y, …}`; `floorAt(x, z)` returns the
  highest one under the feet and the eye is eased toward it, rate-limited climbing so a step is
  walked up rather than teleported onto. A ring floor may carry `a0`/`a1` to cover one arc only.
  **A scene that registers no floors behaves exactly as before**, at y = 0, which is still true
  of everything except Cythera's terraces. If you build something to stand on, register it —
  otherwise it is scenery and the dreamer walks through it, which is what every podium in this
  world did until that date.
- **An open-ended `CylinderGeometry` is invisible from inside** unless its material is
  `DoubleSide` — which is how the first Temple of Venus got a dome you could see sky through.
- **Every addition is thought through in all five modes and written up.** Walk, Tour, Dream, Fly,
  Roll, and the ten commentary layers: what the new thing gives each and what it still owes,
  in the "How it plays" table of its subject brief (`MODES.md` defines the columns). A station
  is not finished until it has a *quotation* note in the tour and either a Poliphilo utterance
  or a recorded silence.
- **Architecture is built of stones, not boxes.** `_column` makes drums, `_ashlar` makes
  courses of ashlar and `_arch` makes voussoirs with a keystone; all three register a
  structure with `systems/Masonry.js` so Roll Up can undermine them and bring them down. A
  new building modelled as one big `BoxGeometry` — or a new arch modelled as one torus — is
  invisible to Roll Up (the census drops anything over 6 m) and cannot fall. `scene._monoliths`
  lists everything the census rejected for being too big, which is the ledger to check.
- **A non-indexed geometry poisons its whole draw-call bucket.** `_mergeInto` wants a bucket
  all indexed or all not; one bare `OctahedronGeometry` among the red things cost 500 draw
  calls and silently lost every object that used it. `this._indexed(geo)` fixes it, and every
  `PolyhedronGeometry` — dodecahedron, octahedron, icosahedron — needs it.
- **An alpha-TESTED cutout must not be `transparent: true`.** `_mergeInto` skips transparent
  materials, so a leaf card or a lattice panel marked transparent is quietly exiled from the
  draw-call merge — and stays its own draw call, one per leaf. The foliage added on 2026-09-07/08
  did exactly that and cost **22 000 meshes and about 2 100 draw calls** in the ordinary walk
  before anyone counted. `alphaTest` alone is correct: a cutout is opaque with a discard.
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

---

<!-- BEGIN doc-costs (generated by scripts/doc_costs.py) -->

## What each document costs

*Generated by `scripts/doc_costs.py`. **65 files in the root, ~199,571 tokens all told** — which is why this file exists and why you should open two or three of them and not twenty. The estimate is chars/4; it is for deciding whether you can afford a file, and being wrong by ten per cent never changes that. Re-run the script after any substantial documentation change.*

| tokens | file | read for |
|---:|---|---|
| ~15,469 | `COVERAGE.md` | what the book has that the world does not (generated) · generated |
| ~10,122 | `NEXTSTEPS.md` | Ted's standing asks, in his words |
| ~9,203 | `TICKETS.md` | the engineering queue (generated) · generated |
| ~7,237 | `15scholars.md` | what each scholar will and will not support |
| ~7,049 | `ROUTER.md` | the task table; read this first, then two or three files |
| ~5,951 | `ARCHITECTURE.md` | orders, members, the portal, the temples, the theatre |
| ~5,401 | `ENGINEERING.md` | how this project is built, measured and handed over |
| ~5,061 | `TWO_WORLDS_FRAMEWORK.md` | SUPERSEDED — June 2026 two-world planning |
| ~4,694 | `PLEASURES.md` | what a Renaissance garden was for |
| ~4,517 | `DECISIONS.md` | the index of every directional call |
| ~4,501 | `GARDENS.md` | the island's rings, terraces, parterres, topiary |
| ~4,487 | `ROLLING.md` | every variable in Roll Up and which one to turn |
| ~4,291 | `DIRECTIONS.md` | where things stand in relation to each other; the compass |
| ~4,258 | `DIMENSIONS.md` | how big anything is, in metres, with sources |
| ~4,008 | `COMPLETE_BRIEFING.md` | SUPERSEDED — June 2026 two-world planning |
| ~4,006 | `INDEX.md` |  |
| ~3,928 | `PROJECT_SUMMARY.md` |  |
| ~3,899 | `HANDOFF.md` |  |
| ~3,897 | `SCENES.md` |  |
| ~3,886 | `WOODS.md` | the dark wood: species, density, light |
| ~3,723 | `README.md` |  |
| ~3,620 | `HUMANOIDS.md` | why the figures look wrong; poses, canon, registers |
| ~3,424 | `HPTOTOURPIPELINE.md` | corpus in, game out: the research-to-build route |
| ~3,313 | `SOURCES.md` | the corpus map, and which scholar to read per asset |
| ~3,279 | `WOODCUT.md` |  |
| ~2,975 | `PROCESSIONS.md` | the triumphs, cars, teams, liveries |
| ~2,877 | `RENAISSANCEART.md` |  |
| ~2,787 | `PLAN.md` |  |
| ~2,652 | `ANIMALS.md` | the bestiary, and §4 for why the beasts read badly |
| ~2,638 | `PLANTS.md` | species, planting, the herb-set inscriptions |
| ~2,552 | `GAMIFYVRHP.md` |  |
| ~2,494 | `RESEARCH_ROADMAP.md` |  |
| ~2,482 | `RESEARCHPASSFORVR.md` |  |
| ~2,333 | `DRAWCALLS.md` | why the world costs what it costs, and the merge we declined |
| ~2,197 | `RENDERING.md` | how the world is drawn; aerial perspective, the 1499 palette |
| ~2,066 | `CRUST.md` |  |
| ~2,057 | `STATUS.md` |  |
| ~1,935 | `CHARACTERS.md` | the named cast |
| ~1,866 | `IMPORTEXEMPLARS.md` |  |
| ~1,820 | `DESIGN.md` | the lens system and the game's shape |
| ~1,650 | `INTERFACECHOICES.md` |  |
| ~1,621 | `TECH_STACK.md` |  |
| ~1,615 | `ROLLMODE.md` | the design brief behind Roll Up |
| ~1,592 | `NYMPHS.md` | who the figures are |
| ~1,575 | `DEPLOY_STATE.md` | the host, the version chain, and the deploy gotchas |
| ~1,570 | `WATER.md` |  |
| ~1,541 | `BANQUET.md` |  |
| ~1,499 | `CLAUDE.md` | the seven rules (auto-loaded; you already have it) |
| ~1,433 | `ORNAMENT.md` |  |
| ~1,336 | `VISION.md` |  |
| ~1,315 | `LICENSECHOICES.md` |  |
| ~1,252 | `MASONRY.md` | how a wall becomes stones |
| ~1,207 | `TRANSLATIONDISPLAYCHOICES.md` |  |
| ~1,194 | `MODES.md` | the five modes, and what every addition owes each |
| ~1,185 | `ADONIS.md` |  |
| ~1,095 | `CROSSING.md` |  |
| ~1,051 | `LITTER.md` | the 8 976 objects on the floors |
| ~1,044 | `MYTHOLOGY.md` |  |
| ~950 | `DREAMMODE.md` |  |
| ~930 | `CHESSBOARD.md` |  |
| ~894 | `MUSICIANS.md` |  |
| ~857 | `VEHICLES.md` |  |
| ~814 | `HARPIES.md` |  |
| ~708 | `CREDITS.md` |  |
| ~688 | `DRAGONFLIGHT.md` |  |

<!-- END doc-costs -->
