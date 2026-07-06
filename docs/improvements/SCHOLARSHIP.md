# Scholarship & Content

**Current state.** The HP world surfaces station name + folio + linked AF emblems, with BL
marginalia annotations on a timer; Dream mode carries the full 12-stop narrative with quoted
1499 matter. The AF Theatrum shows all 51 emblems; `src/data/af_lore.js` (currently untracked)
drafts a "Seeker's Work" quest layer distilled from de Jong's commentary. A new
academically-sourced nymph gallery lives at [research/nymphs.html](../../research/nymphs.html).

## Ranked suggestions

### 1. 🍎 Link the research shelf into the site
The nymph sourcebook is deployed but orphaned — nothing links to it. Add a "Research" row to
the landing page (it can grow: nymphs today, architecture/gardens/beasts later). One card,
five minutes, and the scholarly apparatus becomes visible product.

### 2. Commit and wire af_lore.js — the Seeker's Work
The draft quest layer (find each emblem's key figure → its de Jong reading unlocks) is the
project's best pending idea: it converts passive plates into an *investigation*. Ship path:
commit the data file → tag vignette objects with `userData.loreKey` → raycast click test →
persistent "awakenings" count in localStorage. The AF world already raycasts for plate entry.

### 3. A mirrored quest for HP: "The Antiquarian's Eye"
Poliphilo's defining habit is *reading monuments*. At each wonder, one inscription/hieroglyph
is clickable; clicking reveals the book's own gloss (all already in `hp_dream.js` quotes +
`hp_folio_descriptions.json`). Eleven finds = the dreamer's education complete. Reuses the
station-proximity system; content is already in the repo.

### 4. Woodcut ↔ world comparison view
The deepest scholarly claim of the project is "this 3-D scene *is* folio N." Prove it: in the
HUD, a small button on each station opens a split overlay — the original woodcut (files exist
under `images/`) beside a live render from the matching angle. The AF world's plates already
do half of this; HP deserves the same.

### 5. Sourcebook growth path
`research/` should become a shelf, one page per iconographic dossier, same template as
nymphs.html:
- **Gardens & pergolas** (Crescenzi MSS, Hypnerotomachia's own topiary woodcuts);
- **The Elephant & Obelisk afterlife** (Bernini's Minerva elephant, 1667 — the book's most
  famous echo);
- **Fountains & nymphaea** (real Renaissance nymphaea vs. the book's inventions);
- **Triumphal cars** (Petrarch's Trionfi illustrations → the four Jupiter triumphs).
Each dossier doubles as an asset brief for its corresponding wonder.

### 6. Citation rigor pass
The Dream-mode `source:` lines are good; extend the same discipline to the HUD annotations
(marginalia should cite folio + BL shelfmark) and add a single `SOURCES.md` listing the
scholarly apparatus (de Jong; Godwin's translation; the BL copy; Commons files). Cheap
insurance for the day this gets an academic audience.

## Priority
1 (minutes) → 2 (the flagship feature) → 3 (its HP twin) → 4 → 5/6 ongoing.
