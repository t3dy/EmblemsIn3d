# Design decisions — Emblems in 3D

Directional calls made mid-build, recorded so they don't get re-litigated. Newest first.

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
