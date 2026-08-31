# Interface choices

> Decided 2026-08-31. The world is now large enough that its interface problems
> are no longer cosmetic: there are six worlds, twelve story scenes, eleven
> stations, two renderings, a research shelf, and a translation in progress —
> and a first-time visitor is given a nav bar and a key hint that fades after
> four and a half seconds.

## The governing principle

**This is a scholarly artifact that happens to be walkable, not a game that
happens to cite things.** Where game convention and legibility conflict, choose
legibility. The audience is someone who came for the Hypnerotomachia, not
someone who came for a first-person controller — but they will bounce off a
first-person controller that fights them, so the controller has to be
frictionless rather than clever.

## Decisions

### 1. The research shelf gets a home on the landing page ★ do first

`research/nymphs.html` has been deployed and orphaned since it was written;
`research/translation.html` is about to be in the same position. Both are the
project's most defensible scholarly output and neither is reachable from
anywhere.

A **Research** row on the landing page, sibling to Worlds and Games, holding one
card per dossier. It grows: nymphs and the translation now, and per
SCHOLARSHIP.md the gardens/pergolas, elephant-afterlife, fountains and
triumphal-car dossiers later. The translation card carries its live completion
figure, because a working edition that shows its progress is more interesting
than one that hides it.

*This is five minutes of work and it converts invisible scholarship into visible
product. It should have been done when nymphs.html shipped.*

### 2. The station compass replaces the fading key hint

Players are told once, for 4.5 seconds, that digits 1–9 teleport. Then it is
gone and there is no way to recover it. A slim strip of station dots along the
HUD — filled when visited, gold when near, name on hover, click to travel — is
simultaneously the legend, the map, and the progress tracker. `HP_STATIONS` and
`teleport()` already exist; it is HUD work only.

### 3. Mobile gets two-thumb controls

The site works on a phone except that you cannot walk. Drag-look already works;
a left-half virtual stick setting the same `keys{}` flags the Walker already
reads makes the whole world phone-playable. This unlocks the largest audience
the project does not currently have, for the least code of anything on this
list.

### 4. Drag-look stays the default; pointer lock is offered

Desktop players expect click-to-capture-mouse. Scholarly visitors, who are the
actual audience, find a captured cursor alarming. So: drag-look remains default,
pointer lock is available for those who want it, Esc releases as standard. Do
not switch the default to satisfy convention.

### 5. Dream mode becomes accessible

The narration is the product for a large share of visitors, and it is currently
click-only, unannounced to screen readers, and fixed-size.
- `aria-live="polite"` on the beat text, so a screen reader follows the story.
- Space / Enter / → already advance; make that discoverable rather than folklore.
- A text-size control. Two steps is enough.

### 6. Quotations link out; the world does not become a reading room

Per TRANSLATIONDISPLAYCHOICES: any passage we translated ourselves links to the
parallel text at its facsimile page. Nothing else in the world opens an external
page. The garden's job is to be walked; the research pages' job is to be read;
the link between them runs one way and only from the material that needs
checking.

### 7. Resume where you left off — but quietly

`getSpawnState()` already exists. Persist it, and on a return visit with no
explicit deep link, offer *"Continue at the Fountain of Venus →"* as an option
beside the two mode cards. **Never** resume automatically: a dream that starts
in the middle because of something you did last week is disorienting, and the
opening of this particular book is the whole frame.

### 8. Deferred, with reasons

- **Photo mode.** Delightful, and pure marketing rather than scholarship. After
  the compass and mobile.
- **A minimap.** Rejected outright. The processional axis *is* the map — the
  book's geography is a line from the dark wood to the shore, and a minimap
  would let players skip the experience of walking it, which is the argument the
  world is making.
- **Difficulty, scores, achievements.** No. The Seeker's Work and Antiquarian's
  Eye quest layers (SCHOLARSHIP §2, §3) are discovery structures, not scoring
  ones, and a visible score would reframe the whole thing as a game.
- **A settings menu.** Not until there are enough settings to warrant one; today
  that is text size and pointer lock, which can live in the mode chooser.

## Order

1 (minutes) → 2 → 3 → 5 → 7, with 6 landing alongside the translation work
already in flight. Each is independently shippable; none blocks another.
