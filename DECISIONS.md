# Design decisions — Emblems in 3D

Directional calls made mid-build, recorded so they don't get re-litigated. Newest first.

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
