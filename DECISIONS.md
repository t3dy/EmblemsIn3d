# Design decisions — Emblems in 3D

Directional calls made mid-build, recorded so they don't get re-litigated. Newest first.

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
