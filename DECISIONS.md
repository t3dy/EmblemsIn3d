# Design decisions — Emblems in 3D

Directional calls made mid-build, recorded so they don't get re-litigated. Newest first.

## 2026-09-05 — The Human Chess Match, built from the margins (Ted)

Ted: *"we need to do the human chess match which the annotators to the buffalo copy of HP
were concerned about in their marginalia."* Built as the station **`chess`**, west of the
Planetary Palace, and as **stop 9 of 35** in the Novel tour.

**The evidence, and the order it was used in.** The scene is at signature g8r–h1r
(facsimile pp. 111–113). `page_concordance` records **`has_woodcut = 0` on all three
pages**: the 1499 does not illustrate it. So the source order that `RECIPES/model-an-asset.md`
lays down — plate first, then scholar — has no plate to start from, and the station is built
from the text and from `hp.db.annotations` / `folio_descriptions` / `annotator_hands`, which
is exactly what Ted asked for.

**Buffalo Hand E** (Buffalo & Erie County Public Library, 1499 — five interleaved hands, the
most densely annotated copy in Russell's census; Hand E an alchemist of the pseudo-Geber
school) read the match as three rounds of distillation and recorded each result:

| Round | Winner | Hand E, in the margin |
|---|---|---|
| I | silver | `Argentum` + a drawn crescent moon; `Rex ex argento factus victor remanet` |
| II | silver | `argentum rex ex argento factus victor secunda vice remanet` |
| III | gold | `Rex ex auro factus victoriam ultimam… triumphat`, revised to `[Re]gina`, `aura`, `☉ uestita`, `victrix`, then cancelled and closed with `Auru(m)` |

**Fabio Chigi** (Vatican Chig.II.610) read the same pages as theatre: *comincia a descrivere
il ballo in figura del gioco di scacchi cosa bella* (g8r), *Torna di nuovo al gioco ò ballo*
(g8v), *terzo ballo ò gioco* (h1r).

**The binding decision: keep the book's inversion.** The HP dresses the **queen of both
sides in gold** and the **king of both sides in silver**. That is the wrong way round for
Hand E's own system — Sol is gold and masculine — and it is precisely what his whole reading
turns on: a king *made out of silver* wins twice, and gold only takes the third round. So
the liveries are not decoration and must not be "corrected" to conventional chess colours by
a later pass. (Russell 2014, pp. 188–190; `hp.db.folio_descriptions` h1r.)

**Second decision: the ballet is scripted, not simulated.** The book calls it a *ballo in
figura del gioco di scacchi* — a dance in the figure of the game — and the annotators
recorded only who won each round, never a move. A chess engine would therefore be inventing
evidence. The three rounds are a fixed script; the only facts asserted are the ones the
margins carry: three rounds, captures sealed with a kiss before the taken piece leaves the
board, silver, silver, gold. `_chessUpdate` is a forward-only state machine for the same
reason `DreamMode` is — a missing piece or a stale square ends the move rather than stalling.

Also corrected here: `ARCHITECTURE.md` said the ballet "is illustrated." It is not.

## 2026-09-05 — The site is the Hypnerotomachia alone (Ted)

Ted: *"I'd like to remove all the atalanta stuff from the website as it's embarrassingly
crude and just focus on the HP stuff."* This **reverses the standing rule 4** ("leave the
Atalanta side alone"), which existed only because that side was being worked in a parallel
session.

**Removed from the shipped site:**

| Gone | What it was |
|---|---|
| the **Atalanta Animata** world | the wall of 51 lit woodcut plates, and the five hand-built showcase emblem scenes |
| the **Theatrum** world | all 51 emblems as animated vignettes around a rotunda (`AFWorldScene`) |
| the **Plates** atlas | the 2-D emblem atlas and its lightbox |
| the **Archives** graph | the HP-folio ↔ AF-emblem cross-reference network (`ArchivesScene`) |
| four of the five **tours** | The Scholarship, Chemical Symbolism, The Great Work, The Two Books |
| the **games** | `games/` — Oracle, Fugue Scroll, Stage Sorter, Memory (deleted from the tree) |
| the emblem **HUD** | the stage badge, the ←/→ emblem stepper, the "← Gallery" button, the marginalia panel |
| three **data files** | `emblems.json`, `world_links.json`, `diorama.json` are no longer fetched |

**Kept.** The Gallery (25 plates, all HP-relevant), the visual novel in `game/`, the three
research pages, and the `/v1/` and `/v2/` archives — those are labelled as *earlier
releases*, which is a different claim from "this is the project", and the citability
decision that created them still stands. Say the word and they go too.

**Kept on disk but dormant.** `AFWorldScene.js`, `EmblemScene.js`, `ArchivesScene.js`,
`src/data/af_*.js`, `lab/`, `images/emblems/`. Nothing imports them; they are not deleted
because a parallel session may hold uncommitted work in them, and git history has the rest
anyway. **Do not re-wire them.**

**Consequences worth knowing:**

- The app **opens in the Dream Garden** now, not on an emblem scene. `#emblem=N` and
  `#theatrum` deep links are gone; `#hp`, `#dream`, `#gallery` and `#tour=novel` remain.
- The toolbar is Home · Woodcut view · The Dream Garden · Tours · Gallery · Graphics ·
  Translation · Lexicon — the last two are new, and point at the research pages, which
  previously had no route in from the app.
- `getEnvMap()` was the only thing the HP world still needed from `EmblemScene.js`. It is
  extracted to **`src/systems/EnvMap.js`**, so no emblem code loads to light a garden.
- `HP_STATIONS` no longer carries its per-station `emblem:` cross-reference.
- The `Cast.js?v=15` pin in `AFWorldScene.js` no longer matters — nothing loads two
  versions of `Cast.js` any more.
- **The displayed site name changed** from "Emblems in 3D" to **"The Dream Garden of
  Poliphilo"** across the landing page, the app and the research pages. The repository, the
  Vercel project and both URLs keep their existing names, so no link breaks.
- The landing page was rewritten from scratch around the HP.

## 2026-09-05 — The tour covers the whole book; the system files become a router (Ted)

Two calls, made in one exchange.

1. **Tour coverage: all of it.** Ted: *"extend it as much as necessary to cover all the
   scenes in the book. There are no limits to our time and space we are vibe coding, so
   don't feel like that's too much. This is meant to be a comprehensive digital humanities
   resource."* The Novel tour therefore grew from 14 stops to **34, covering all 38
   chapters plus Polia's epitaph** — including the three narrative sections it had missed
   entirely (FIVE_SENSES, the VENUS_TEMPLE rites, and the whole of Book II).

   **Book II has no geography of its own** in this world — it is set in Treviso, in the
   temples of Diana and Venus, and its plates are interiors. Decision: stage each Book II
   stop at the station of the *dream* whose meaning it answers (the Polyandrion for the
   deaths, the theatre of Venus for the priestess, the Quinta Essentia for the vision among
   the gods) **and say so in a note**, rather than build a second world or omit the book.

2. **System files: a router plus recipes.** Ted, asked to choose: *"Both — router plus
   recipes."* So:
   - **`ROUTER.md`** is the entry point: five hard rules, a task→documents table, the
     subject briefs, the code map, the agent lanes, and an end-of-session checklist.
   - **`RECIPES/`** holds one procedure per repeated task, each ending in a
     *"what has gone wrong here before"* section — the failure, not just the happy path.
   - **`CLAUDE.md` is now thin** and points at the router; it carries only what must be in
     context from the first token.
   - **`15scholars.md`** is the depth layer: what each scholar settles, where their text is
     on this machine, and *the claim it will not support*.
   - The planning-era docs (`INDEX.md`, `PLAN.md`, `STATUS.md`, `HANDOFF.md`,
     `PROJECT_SUMMARY.md`, `COMPLETE_BRIEFING.md`, `SCENES.md`, `VISION.md`,
     `TWO_WORLDS_FRAMEWORK.md`, `docs/*`) are marked **historical** in the router: mine
     them for research, never for current status or file layout.

3. **Agent orchestration.** Ted: *"depends on what is best for the project you know more
   about systems engineering than I do."* Call: **single-agent sequential stays the
   default**, because the work is coupled through `HPWorldScene.js` and the manual `?v=`
   chain. Parallel runs only along the five file-disjoint lanes named in `ROUTER.md`, with
   one agent owning the version bump and the deploy.

## 2026-09-05 — Art direction: a Botticelli panel you can walk into (Ted)

Answers to a direct art-direction question. These are the goals for the art; read them
before building or revising any visual asset.

1. **Register: painterly / tempera — not photoreal.** The lit Dream Garden should read as
   *a Botticelli panel you can walk into*. Method: painted and procedural albedo, a
   toon-ish ramp in the lighting, a limited period palette, and the outlines retained.
   The accepted risk is that it reads "illustrated" rather than "real" — that is the
   intent. It also unifies hundreds of assets cheaply, which photoreal would not.
   → **Do not chase photorealism.** A scan that fights the painted register is worse than
   a well-painted procedural form.

2. **Figures: build several approaches and let the player choose.** Ted: *"try various
   approaches and let me choose between with drop down menus in a graphics menu that's
   accessible from all the modes free walk/tour/game."* So the AssetVariants registry gets
   a **user-facing Graphics menu**, reachable from every mode, with a dropdown per asset.
   Figures specifically should offer painted cutout cards, imported sculpture scans, and
   hand-modelled humanoids as alternatives — not one chosen answer.

3. **Web research on technique is approved**, written up with citations in
   `RENAISSANCEART.md`, including an explicit *what we adopt / what we reject* section.
   Do not write technique guidance from assumption.

4. **Asset priority order:** (1) nymphs & figures, (2) water features, (3) wall decoration
   & ornament, (4) plants, animals & vehicles. Each gets its own sourced .md as it is
   built — `NYMPHS.md`, `WATER.md`, `ORNAMENT.md`, `PLANTS.md`, `ANIMALS.md`,
   `VEHICLES.md`, plus `MYTHOLOGY.md` and `IMPORTEXEMPLARS.md` (what was imported, from
   where, under what licence, and how).

5. **Ted wants to understand how importing works.** Any import route must be written down
   in `IMPORTEXEMPLARS.md` in plain terms — source, licence, file, size, how it is loaded
   — not left implicit in code.

## 2026-09-05 — Every asset gets swappable variants; imported scans allowed (Ted)

- **Imported scans are approved to try** for the graphical assets, extending the earlier
  reversal that allowed model imports (the marble Venus was the first).
- **But no asset gets one implementation.** Ted: *"you should have various options as
  alternatives that we can bring in and out for each of the graphical assets and gradually
  improve and evolve everything."* So each asset — elephant, tree, nymph, Venus, portal —
  carries a **registry of named variants** that can be switched at runtime, not a single
  hard-coded build. Typical ladder per asset:
  `primitive` (the founding manifesto look, and the woodcut-mode fallback) →
  `massed` / refined procedural → `scan` (an imported CC0 model).
- **Never delete the older variant when a better one lands.** It stays selectable. This is
  how the work evolves without losing the earlier register, and it keeps woodcut mode
  honest (it wants the primitive silhouette, not a photoreal scan).
- The choice is per-asset, persisted, and independent of the render style and of the
  interpretive lens in `DESIGN.md` — that lens is about *meaning*, this registry is about
  *fidelity*. Don't conflate them.
- **Model the shape from the sources, whichever variant.** `SOURCES.md` has the
  "Modelling the 3-D assets" table (elephant/obelisks → Curran + `woodcut_catalog`; nymphs
  and Polia → Stewering + `research/nymphs.html`; statuary → Nygren; architecture →
  Lefaivre), and `src/data/gallery.json` holds the Renaissance exemplars already gathered
  for exactly this — including **Bernini's Elephant and Obelisk**, the direct descendant of
  the HP woodcut. Consult these BEFORE modelling, as with the words.

## 2026-09-04 (evening, final) — The site is SILENT. No audio anywhere. (Ted)

- **No music, no ambient bed, no sound of any kind** — not during the guided tours,
  not in Poliphilo's Dream, not in the Atalanta worlds, not on any page. This
  **supersedes** the earlier call the same evening to restore the ambient score.
- Silence is **structural, not a volume setting**: `AlchemicalAudio` is a no-op stub
  that constructs no `AudioContext` at all, and the first-gesture unlock listeners are
  gone from `main.js`. The stub is kept (not deleted) so the existing `setStage` call
  sites stay valid and nobody reintroduces sound while "fixing a missing import".
- **Do not add audio to this project without Ted asking for it.** Two successive
  attempts at a soundtrack (the Tone.js ambient bed, then a chiptune) both ended up as
  noise in his speakers. The prior ambient implementation is in git at `ab5f82b` if it
  is ever wanted; restoring it is a deliberate act.
- Verify silence by **proxying `AudioContext`, `AudioScheduledSourceNode.start` and
  `HTMLMediaElement.play`** and exercising the site — not by reading the diff.

## 2026-09-04 (evening) — `hidden` must always win in the app's CSS

- A full-screen overlay (`#tour-flavor-chooser`) carried the `hidden` attribute but
  its own rule set `display: flex`, which outranks the UA's `[hidden]{display:none}`.
  The empty overlay therefore sat over every page at 90% opacity with
  `pointer-events: all` — the site loaded dark and frozen. There is now a global
  `[hidden] { display: none !important; }` guard in `src/index.html`. **Keep it**, and
  prefer the `hidden` attribute over ad-hoc display toggling.

## 2026-09-04 — Creative brief for the whole work (Ted)

- **Fidelity first, interpretation in the commentary.** Model the world as close to the
  literal 1499 Hypnerotomachia (woodcuts + text) as possible; the commentary layer carries
  the Renaissance contexts, the competing interpretations, and the *alternate realizations*
  a scene might have had. Don't impose an aesthetic reading onto the geometry — let the
  toggleable notes do the interpreting. (The marble Venus is faithful: the book puts a
  statue in that fountain.)
- **All four moods coexist:** antiquarian wonder, melancholic dream, erotic-mystical, and
  uncanny/oneiric. The world should hold every register, not pick one.
- **All three player stances exist:** you-are-Poliphilo (the first-person love-quest, the
  Logistica/Thelemia reason-vs-desire choices), the scholar-visitor (the current museum/
  tour/edition stance), and Polia's side (her Book II counter-narrative, cf. the Dee
  project's AngelPOV).
- **Keep it literary; add alchemy as a toggleable commentary flavour.** The primary
  register stays the love-dream/antiquarian romance, NOT a cipher. But add the alchemical
  reading — "as charted by James Russell" (Ted) — as a new colour-coded commentary type in
  the tour's note system, toggleable on/off like every other flavour. **Blocker:** need
  Russell's actual source (link/PDF/passages) before writing the alchemical glosses — will
  NOT invent readings and attribute them to a real named scholar. Meanwhile the toggle
  infrastructure + the empty "alchemical" category can be built.
  → Implied feature: commentary types become independently **toggleable** in the tour
    (turn each colour-coded flavour on/off), matching how the POV/render modes toggle.

## 2026-09-04 — Figures, Gallery, and aesthetic scope (Ted)

- **Imported 3-D models are now allowed.** This *reverses* the founding "primitive-only
  geometry — no 3-D model imports" manifesto still described on the homepage
  (`index.html`, Creative Decisions). Figures may now use `GLTFLoader` + self-hosted
  model/texture assets to reach near-photoreal Renaissance bodies. Primitive figures
  remain the fallback and the woodcut-mode style; imported models are added where a good
  public-domain scan exists, highest-value figures first (Venus at the fountain, Polia,
  Cupid). Keep licences CC0 / public-domain where possible and record provenance.
  → When the first models ship, update the homepage Creative-Decisions section so it no
    longer claims "no model imports."

- **New "Gallery" tab** in the 3-D app's world-nav: a gallery of Renaissance (and
  relevant medieval / early-modern) art exemplars for everything we build — architecture,
  nymphs/Venus, triumphs, gardens/Cythera, hieroglyphs/emblems, tombs — shown alongside
  the 1499 HP woodcuts themselves. Built like the Plates atlas (grid + lightbox).

- **Gallery images are self-hosted**, not hotlinked. Public-domain images are downloaded
  into `images/gallery/` (via `scripts/fetch_gallery.py`, which keeps only files that
  actually resolve to real images), and `src/data/gallery.json` is the provenance-tracked
  manifest. Rationale: the site must not depend on Wikimedia Commons uptime. (Note: the
  older `research/nymphs.html` still hotlinks Commons — leave it, or migrate later.)

- **Aesthetic registers to draw on:** the 1499 Venetian woodcut (the book's own line,
  the woodcut render mode), Botticelli / High-Renaissance painting (lit-mode Venus, Polia,
  nymphs), Quattrocento sculpture & relief (Mantegna, della Robbia — architecture and the
  gods' statues), plus any relevant medieval or early-modern exemplars.
