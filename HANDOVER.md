<!-- tokens: ~2,132 · read for: where this project stands and what to do next -->
# HANDOVER — session of 2026-09-09 (piazza pass)

*Written at the end of the session so the next window does not have to reconstruct it.
Live at `main.js?v=377`, commit `ad2a04e`, deployed and verified on
https://t3dy.github.io/EmblemsIn3d/src/.*

---

## 1. Where the project stands

| | |
|---|---|
| Live version | `main.js?v=377` (GitHub Pages, `git push origin main` is the whole deploy) |
| Coverage | **17 / 38 chapters enumerated**; 92 features built, 21 unbuilt, 14 partial, 5 declined |
| Tickets | 27 done, 3 declined, **6 open** |
| World size | ~5 737 meshes, ~3.16 M triangles |
| Draw calls | valley **465**, portal **393** (were 456 and 460) |

Everything below was shipped **and verified on the deployed page**: origin `curl`, then the
browser's own `script[src]` in a fresh tab on `t3dy.github.io`, then the specific claims
re-measured there and not only locally.

---

## 2. What this session did

**The piazza moved, and Ted's call unblocked the rest of chapter III.** He chose (a): move the
monuments, not the portal, and do not record the triple crossing as a compression.
`DECISIONS.md` call 51 has the full text.

- **The horse** at (7, 55.6). The 1499 gives the distance outright — *"Sopra di questa piacia,
  dal'initio intro verso la porta x passi"* (l. 1255): from the piazza's **beginning** inward
  toward the gate, ten paces. `DIMENSIONS.md` had read those ten paces as measured **from the
  porch**, which is the far end of the court from where the book puts him. Corrected in both
  `DIMENSIONS.md` and `research/dimensions.json`.
- **The elephant** at (7, 42), straight forward of him — *ad libella*, Dall. p. 46.
- **The colossus turned a quarter** and laid along the valley, feet at z 72 and head at z 44.
  He is 32 m long and the neck is 44 m wide, so east–west he could only fit by crossing the
  whole floor. The turn also fixes the approach, which the old placement had backwards: the
  book meets *"the feete thereof bare, and their soles hollowe"* and only *"from thence"* comes
  to the head.
- **Built with it:** the four-square court itself (thirty paces = 44.4 m, filling the valley
  neck, one plane and one drawn texture — a diagonal lozenge lattice in four marbles, broken
  and overgrown), **both areostyle colonnades** at fifteen paces, and the plane trees, wild
  olives, pines and brambles at their feet. The **east row stands**; the **west row is fallen**,
  because the heap Poliphilo climbs to reach the colossus *is* that row (p. 44). Three
  features moved `unknown`/`unbuilt` → `built`.

**A new mechanism, and it will be needed again.** `_placeAt(cx, cz, turn, build)` in
`world/materials.js`. Several builders here have their coordinates baked in and **cannot be
moved by setting a group's position** — `_plaque`, `_frieze`, `_wallCol` and `_circleCol` all
speak world coordinates, so only meshes that pass `parent` would follow. It reroutes
`this.scene` and patches the two collider registrars. **`turn` is in whole quarter turns and
anything else throws**: a right angle is the only rotation that maps an axis-aligned rectangle
onto another axis-aligned rectangle, which is what keeps the AABB colliders exact.

**Two things fixed that were not on anyone's list.**

1. **The gardens of glass and silk are on the wrong side of the gate too**, in the other
   direction — chs. XII–XIII happen after Eleuterylida's banquet and they stood 26 m *before*
   the portal, on the exact ground the colossus and horse now occupy. Moved 30 m down the
   valley as a **holding position**. Ticket `bug-artificial-gardens-wrong-side-of-portal`.
2. **The woodcut register was blanking the whole page** and had been. `_buildAdonis` guarded
   its point light with `if (S.pointLight)` — which asks whether the style *has* the method,
   and every style does. The woodcut style's implementation **returns null**. The throw came
   out of `build()`, so nothing after Adonis was ever added. Every other point light in the
   world (eleven of them) guards the result; Adonis was the only one that did not.

---

## 3. Nothing is waiting on Ted

The one blocking question is answered and the work behind it is done and deployed.

---

## 4. Open tickets

| p | id | one line |
|---|---|---|
| 2 | `bug-court-has-no-room-left` | court clearance peaks at 0.40 m; ch. X furniture has nowhere to go |
| 2 | `bug-artificial-gardens-wrong-side-of-portal` | chs. XII–XIII are before the gate; the palace side has no room to take them |
| 2 | `infra-doc-growth` | root `.md` growing faster than archiving shrinks it |
| 3 | `roll-shed-by-area` | the crust sheds by count, not surface area |
| 3 | `tr-front-matter-review` | pages 1–10 read by nobody but their translator |
| 3 | `tr-verified-overclaims` | 450/463 pages marked "verified" against a much weaker census |

The first two are now **the same ticket in disguise**: a clash sweep of the whole palace side
(x −46..34, z −16..20, 2 m steps, a 24 × 13 m rectangle against `walker.walls` and
`walker.colliders`) found exactly **one** free placement, at x = −46, past the Temple of Venus.
Make the court bigger — via the fold, whose machinery is already built and verified — and both
tickets close.

---

## 5. Traps — read before debugging

The nine from the previous session still stand (see `git show 96a7f46:HANDOVER.md` §5). Three
more this session paid for:

1. **`hpDiag()`'s frame numbers are zero and `stalled: true` whenever the Browser pane is
   hidden**, because a hidden pane stops servicing `requestAnimationFrame`. The scene census is
   still exact. To get draw calls, set `renderer.info.autoReset = false`, `reset()`, take a
   **screenshot** (which forces a render burst of ~100 frames), then read
   `calls / (frame - frame0)`.
2. **`walker.teleportTo` is a 0.7 s tween that only advances while the page paints.** Half the
   "the camera is stuck 15 m short / it is jammed inside the colossus" panic this session was a
   half-finished tween, not a collider. Interleave a screenshot before you believe a camera
   position.
3. **A builder parameterised on an origin can still have an absolute baked in.**
   `_buildColossus(KX, KZ)` looked fully relative but carried `const inX1 = 53.5`, correct only
   while the head stood at KX = 36. Called at the origin it ran an invisible wall **25 m out of
   the soles** into the open valley. Grep a builder for bare numbers before you move it.

And a standing one, re-earned: **write content files with the Write tool, not a bash heredoc.**
Apostrophes abort the command and backslashes vanish silently. It cost three retries today.

---

## 6. Where things are

- `ROUTER.md` — the entry point; route, then work. Do not read the docs indiscriminately.
- `research/coverage.json` → `COVERAGE.md` (`python scripts/coverage_report.py`)
- `research/tickets.json` → `TICKETS.md` (`python scripts/tickets_report.py`)
- `RECIPES/research-a-chapter.md` — the pass that produced chapters III, IV, VIII, IX
- `DECISIONS.md` — 51 calls; the newest is the piazza
- Corpus: `C:\Dev\hypnerotomachia polyphili\` — Dallington in `md/`, the 1499 Italian beside it,
  `hp.db`, the plates. **Go to the Italian whenever a Dallington measurement has to become a
  coordinate** — that is what settled the horse's ten paces after four hundred years of an
  ambiguous English sentence.

---

## 7. What I would do next

1. **`bug-court-has-no-room-left` via the fold.** It now unblocks two tickets, not one, and the
   mechanism exists and is verified.
2. **Enumerate another chapter** — XI, XII, XIV, XV, XVI are Dallington and unread; 21 chapters
   remain. Enumeration keeps finding things already built and unrecorded, which is cheap value,
   and this session shows it also finds things sited wrongly, which is not cheap at all.
3. **The colonnade capitals.** They are plain drums. Dall. p. 38 describes waved shell-work with
   the corners turned in *"like a curled locke of hayre, or the vpper head of a base Viall"* —
   an Ionic volute described by someone who had never been told the word. That is the kind of
   detail this project exists to draw.
4. **More named reliefs.** Three cost 2 meshes between them; the book describes several more
   pictures figure by figure and they still get a seeded crowd.
