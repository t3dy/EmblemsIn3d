<!-- tokens: ~3,117 · read for: where this project stands and what to do next -->
# HANDOVER — session of 2026-09-13 (gardens beside the palace, Katamari creatures)

*Live at `main.js?v=389`, commit `839eef8`, verified on https://t3dy.github.io/EmblemsIn3d/.
Last numbered release is **v6** (tag `v6`, 2026-09-10); everything below is unreleased on top
of it and deployed. There was never a v5 — see `DECISIONS.md`, Release Version 6.*

## 0. What 2026-09-13 did — read this first

1. **The gardens of glass and silk flank the Queen's palace** (DECISIONS.md 53) — glass on its
   south wall, silk on its north, which is exactly what the book says once you read which way
   Poliphilo is facing. Rebuilt to the book's layout (raised beds, box and cypress alternating,
   the gold-rod dome of roses). At about half the book's compass: a top-down height render found
   8 × 5.5 m of open ground on each flank and no more. Closed
   `bug-artificial-gardens-wrong-side-of-portal`.
2. **Chapter tags fixed**: the gardens and the three doors are chapter X by the translation's
   own page headings, not XII–XIII; Polia's stop now claims XI–XII–XIII.
3. **`bug-court-has-no-room-left` is really a scale bug**: the court is 15 m across and the book
   gives it 41 (28 paces). Recorded on the ticket; not built.
4. **Roll Up creatures** (Ted: people and animals should react like Katamari's) —
   `systems/Creatures.js`, `ROLLING.md` §4b. 149 figures and animals are whole creatures: they
   scatter from a ball big enough to eat them, bounce the ball and bolt or stagger when bumped by
   one that is not, and roll up whole. Open: nobody chases a small ball yet; creatures skate over
   terraces.
5. **Latent cache bug fixed**: v6's constants bump changed eight modules' import lines without
   bumping those modules. Every importer is bumped now. **When `constants.js` changes, bump
   every module that imports it, not just the import line.**
6. **Ted asked about GitHub limits and Blender/Unity** — answered in chat, not acted on (his
   call). 59 MB checkout, ~150 MB history, largest file 2.5 MB: a tenth of the soft limits.

New traps this session: `hpRoll()` rebuilds the world with the census and blocks the page for
~20 s, so call it inside `setTimeout` or the tool call dies; a per-cell raycast grid over the
whole scene wedged the tab (use an orthographic height render into a render target instead);
test Roll Up by calling `roll.update(1/60)` in a loop — deterministic, and no dependence on the
pane painting.

---

## 1. Where the project stands

| | |
|---|---|
| Live version | **v6** at `main.js?v=385` (GitHub Pages, `git push origin main` is the whole deploy) |
| Coverage | **18 / 38 chapters enumerated**; 97 features built, 25 unbuilt, 14 partial |
| Tickets | 28 done, 3 declined, **8 open** |
| World size | ~5 747 meshes, ~3.16 M triangles |
| Draw calls | valley **465**, portal **393**, Polia **237** |

Everything below was shipped **and verified on the deployed page**: origin `curl`, then the
browser's own `script[src]` in a fresh tab on `t3dy.github.io`, then the specific claims
re-measured there and not only locally.

---

## 2. What this session did

### a. The piazza moved (Ted's call, DECISIONS.md 51)

He chose (a): move the monuments, not the portal, and do not record the triple crossing as a
compression. The horse, the elephant and the colossus now all stand **before** the Great
Portal, and the chapter III architecture that call was blocking is built with them.

- **The horse** at (7, 55.6). The 1499 gives the distance outright — *"dal'initio intro verso
  la porta x passi"* (l. 1255), from the piazza's **beginning** inward toward the gate, ten
  paces. `DIMENSIONS.md` had read those ten paces as measured *from the porch*, which is the
  far end of the court from where the book puts him. Corrected in both files.
- **The elephant** at (7, 42), straight forward of him — *ad libella*, Dall. p. 46.
- **The colossus turned a quarter** and laid along the valley, feet at z 72, head at z 44. He
  is 32 m long and the neck is 44 m wide, so east–west he could only fit by crossing the whole
  floor. The turn also fixes the approach: the book meets *"the feete thereof bare"* first and
  only *"from thence"* comes to the head.
- **The court itself** (thirty paces = 44.4 m, filling the valley neck, one plane and one drawn
  texture — a diagonal lozenge lattice in four marbles), **both areostyle colonnades** at
  fifteen paces, and the wildwood at their feet. The east row stands; the **west row is fallen**,
  because the heap Poliphilo climbs to reach the colossus *is* that row.

### b. Chapter XI read end to end, and Polia dressed out of it

It had no plate **and** no feature list, and it still looked covered — because `tours.json`
filed the Human Chess Match and Logistica and Thelemia under it. Both are chapter X (the
ballet is at 1499 p. 119, and that page's own heading says so). **Rule 6 in a new costume:
not a plate-driven blind spot this time but a tour-driven one.**

What is in it: the bath nymphs leave Poliphilo alone on a plain; he walks to the end of a
flowery covering; an ample plain opens with a countless crowd of youth *of both kinds* keeping
high festival; and out of that company a nymph comes to him **with a burning torch**. He
suspects she is Polia and the strange dress talks him out of it. Then five pages of blazon.

Eleven features enumerated, five built. The world had already built the right *moment* and put
the wrong clothes on it — `constants.js` describes this figure's pose as *"in the green arbour,
before he has recognised her"*, which is chapter XI word for word. She now wears the book's
green gown, the girdle of Cytherea, three pearl pins a side, the violet wreath, blonde hair
below the knees, and the **necklace transcribed stone by stone** in the book's own order.

### c. The finishing pass, 2026-09-10 (all of it found by looking at the deployed page)

- **The piazza's ATRIVM plaque faced north, into the court**, so everyone entering from the
  south saw its back. A `_plaque`'s face is +z and +z is south here. The mesh was in the scene
  and nothing was on screen — the only way this announces itself.
- **The pavement was glaring.** Roughness 0.72 → 0.88, the four marbles darkened and
  desaturated off showroom brightness, and more and stronger breakage patches.
- **Twenty-two plaque subtitles across the world were clipped at both ends** and nobody had
  noticed, because the clipping is symmetrical and still looks like an inscription.
  `_fitFont` shrinks to a 9 px floor and gives up. `_plaqueTexture` now breaks an over-long
  subtitle onto two lines at the middot nearest the middle. 21 of the 22 now fit.

### d. Two bugs fixed that were nobody's ticket

1. **The woodcut register was blanking the whole page**, and had been. `_buildAdonis` guarded
   its point light with `if (S.pointLight)` — which asks whether the style *has* the method,
   and every style does. The woodcut style's implementation **returns null**. The throw came
   out of `build()`, so nothing after Adonis was ever added.
2. **`inX1 = 53.5`** in `_buildColossus` was a bare absolute, correct only while the head stood
   at KX = 36. Built at the origin it ran an invisible wall 25 m out of the soles.

---

## 3. Nothing is waiting on Ted

The one blocking question was answered and the work behind it is done and deployed.

---

## 4. Open tickets

| p | id | one line |
|---|---|---|
| 2 | `bug-court-has-no-room-left` | court clearance peaks at 0.40 m; ch. X furniture has nowhere to go |
| 2 | `bug-artificial-gardens-wrong-side-of-portal` | chs. XII–XIII are before the gate; the palace side has no room to take them |
| 2 | `infra-doc-growth` | root `.md` growing faster than archiving shrinks it |
| 3 | `debt-reading-station-is-chapter-grained` | the reading mode places a page by chapter, so p. 119's chess match strands you at the water labyrinth |
| 3 | `roll-shed-by-area` | the crust sheds by count, not surface area |
| 3 | `tr-front-matter-review` | pages 1–10 read by nobody but their translator |
| 3 | `tr-verified-overclaims` | 450/463 pages marked "verified" against a much weaker census |
| 3 | `debt-plaque-subtitles-too-long` | one 344-char subtitle still overflows; and all plaque lettering is stretched ~2.8x, which is Ted's call |

The first two are **the same ticket in disguise**: a clash sweep of the whole palace side
(x −46..34, z −16..20, 2 m steps, a 24 × 13 m rectangle against `walker.walls` and
`walker.colliders`) found exactly **one** free placement, at x = −46, past the Temple of Venus.
Make the court bigger — via the fold, whose machinery is already built — and both close.

---

## 5. Traps — read before debugging

The nine from the previous session still stand (`git show 96a7f46:HANDOVER.md` §5). Four more:

1. **`hpDiag()`'s frame numbers are zero and `stalled: true` whenever the Browser pane is
   hidden**, because a hidden pane stops servicing `requestAnimationFrame`. The scene census is
   still exact. For draw calls: `renderer.info.autoReset = false`, `reset()`, take a
   **screenshot** (which forces a burst of ~100 frames), then read `calls / (frame - frame0)`.
2. **`walker.teleportTo` is a 0.7 s tween that only advances while the page paints**, so after
   `hpGoTo` the camera is usually still in flight. This cost twice today: once as a false "the
   camera is jammed inside the colossus" panic, and once as a **false performance regression** —
   231 → 260 draw calls that was really two different cameras. Matched properly it was 236 → 237.
   Interleave a screenshot and re-read `camera.position` before believing any reading.
3. **A builder parameterised on an origin can still have an absolute baked in.** Grep a builder
   for bare numbers before you move it.
4. **A world-position census cannot see merged geometry.** `_mergeInto` folds a builder's meshes
   into per-material buckets, so looking for "the 13 gems near Polia" finds only the one whose
   material is unique. Judge by screenshot or raycast, not by traversing for positions.

And a standing one, re-earned twice: **write content files with the Write tool, not a bash
heredoc.** Apostrophes abort the command and backslashes vanish silently.

---

## 6. Where things are

- `ROUTER.md` — the entry point; route, then work.
- `research/coverage.json` → `COVERAGE.md` (`python scripts/coverage_report.py`)
- `research/tickets.json` → `TICKETS.md` (`python scripts/tickets_report.py`)
- `src/data/tours.json` → `src/data/reading.json` (`python scripts/build_reading.py`)
- `DECISIONS.md` — 51 calls; the newest is the piazza
- **`_placeAt(cx, cz, turn, build)`** in `world/materials.js` is new and will be wanted again:
  it moves a builder whose coordinates are baked in, carrying its plaques and its colliders.
  `turn` is whole quarter turns and anything else throws — a right angle is the only rotation
  that maps an axis-aligned rectangle onto another.
- Corpus: `C:\Dev\hypnerotomachia polyphili\` — Dallington in `md/`, the 1499 Italian beside
  it, `hp.db`, the plates. **Go to the Italian whenever a Dallington measurement has to become
  a coordinate.** That is what settled the horse's ten paces.

---

## 7. What I would do next

1. **`bug-court-has-no-room-left` via the fold.** It unblocks two tickets now, and the
   mechanism exists and is verified.
2. **The festival on the plain** (`xi-festival-on-the-plain`) — the company Polia parts from,
   and the thing that makes her singling him out mean anything. It is the largest unbuilt item
   in the newly-enumerated chapter, and it is expensive: a crowd is figures. Read
   `RENDERINGMODELSBLINGUSOUT.md` before costing it.
3. **Enumerate another chapter** — XII, XIV, XV, XVI, XXII, XXIII are unread; 20 remain. This
   session shows enumeration finds not only unbuilt things but **wrongly sited** ones, which is
   the expensive kind.
4. **The colonnade capitals.** They are plain drums. Dall. p. 38 gives them waved shell-work
   with the corners turned in *"like a curled locke of hayre, or the vpper head of a base
   Viall"* — an Ionic volute described by someone who had never been told the word.
