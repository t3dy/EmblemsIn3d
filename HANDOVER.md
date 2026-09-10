<!-- tokens: ~3,400 · read for: where this project stands and what to do next -->
# HANDOVER — session of 2026-09-09

*Written at the end of a long session so the next window does not have to reconstruct it.
Live at `main.js?v=374`, commit `779e7d1`, deployed and verified on
https://t3dy.github.io/EmblemsIn3d/src/.*

---

## 1. Where the project stands

| | |
|---|---|
| Live version | `main.js?v=374` (GitHub Pages, `git push origin main` is the whole deploy) |
| Coverage | **17 / 38 chapters enumerated**; 89 features built, 23 unbuilt, 14 partial, 3 unknown |
| Tickets | 25 done, 3 declined, **6 open** |
| World size | ~5 720 meshes, ~3.14 M triangles |

Everything below was shipped **and verified live** this session: origin `curl`, the browser's
own `script[src]` in a fresh tab, then the specific thing measured on the deployed page.

---

## 2. What this session did

**Monuments.** `feat-monuments-true-scale` closed, all three. The Great Portal went 17.5 →
40 m wide (the valley moved with it: neck 20 → 24, cliffs 26 → 44) and gained a **base storey**
— the world had a pyramid standing in an open field held shut by colliders. The colossus went
17 → 35.5 m and its mouth became a doorway at human scale; then it was **hollowed**, so you now
walk in through the mouth, down a passage past six labelled organ doors, into the heart. Polia's
garden could not be rescaled — it stands at the most inland point of the island with no free
ring at any radius — so instead it got Dallington's **ivied arcade**, 81 m across, 56 arches at
the book's true size.

**The dream folds.** Ted: *"remember that this is a dream garden."* The world is no longer
required to be globally consistent: the palace court is gathered into one group and hidden
while the dreamer is inside Polia's garden. `DECISIONS.md` call 49. This also settled the
project's oldest open question — `characters/designer.md` had carried three options for the
world's structure since the beginning with the hybrid marked *"Preferred by Designer"* and
`STATUS.md` recording it as **PENDING**.

**The nymphs got bodies.** `RENDERINGMODELSBLINGUSOUT.md` is the doc. The flat Botticelli cards
are now **projected onto the modelled figures** — paint supplies the surface, geometry supplies
the silhouette. Default since Ted's *"bling us out"*; all five rungs remain in Graphics →
Nymphs & figures. A generative spike (TripoSR, MIT) was run and **rejected on evidence**: it
extruded the painting rather than inferring a body.

**Research pipeline.** Chapters III, IV, VIII and IX enumerated (III and IV had 4 and 0 features
and admitted nobody had read them). Named relief scenes added to `_reliefTexture` so the few
pictures the book describes figure-by-figure get drawn instead of seeded: the forge of Vulcan,
the triumph of satyrs and nymphs, the bucranium frieze. The water labyrinth got its **current**
— the sign flips at the third ring and quickens to the swallow — and its **judge and six
women**, both of which had been asserted on plaques with nobody there.

---

## 3. The one thing waiting on Ted

**`bug-piazza-wrong-side-of-portal` (p1).** Chapter III puts the horse, elephant and colossus in
the court *before* the porch; chapter IV names the four wonders as one company. `tours.json`
agrees with the book — valley → horse → colossus → elephant → portal → three_doors. **The ground
plan does not:** station z runs 104, 22.5, 4, 6.5, **37**, 21, with the portal's geometry at
z = 26, so walking the tour in its own order crosses the portal **three times** where the book
crosses once. Nothing in `DECISIONS.md` or `DIRECTIONS.md` records it as a choice.

Three ways, and two move other people's furniture, so it is a directional call:
(a) move the piazza north into the empty approach; (b) move the portal south of them;
(c) record the crossing as deliberate compression — which is the thing Ted ruled out when he
said we follow the novel to the letter.

The forecourt and colonnades of chapter III (a thirty-pace marble court and two areostyle
colonnades running toward the mountains, both absent) are **blocked behind this call**.

---

## 4. Open tickets

| p | id | one line |
|---|---|---|
| 1 | `bug-piazza-wrong-side-of-portal` | the piazza is on the wrong side of the gate — Ted's call |
| 2 | `bug-court-has-no-room-left` | court clearance peaks at 0.40 m; ch. X furniture has nowhere to go |
| 2 | `infra-doc-growth` | root `.md` growing faster than archiving shrinks it |
| 3 | `roll-shed-by-area` | the crust sheds by count, not surface area |
| 3 | `tr-front-matter-review` | pages 1–10 read by nobody but their translator |
| 3 | `tr-verified-overclaims` | 450/463 pages marked "verified" against a much weaker census |

`bug-court-has-no-room-left` has an obvious route now that the fold exists: the court is
*already* the thing that folds away for Polia's arcade, so the machinery to make it bigger while
you are inside it is built and verified once.

---

## 5. Traps this session paid for — read before debugging

1. **A filter written to exclude the sky will also exclude a mountain.** Seven sweeps failed to
   find what was blocking the fields view because each opened by discarding meshes over 200 m
   wide, to skip the sky dome. The answer was a 250 m mountain 2.4 m from the eye.
2. **Raycast through the pixel before theorising.** One raycast identified it after seven
   hypothesis-by-hypothesis sweeps had not.
3. **`walker.floorAt` returns 0 for flat ground AND for no ground.** A 0 is not evidence of
   ground.
4. **Distance to an object's CENTRE is not distance to its surface.** A clearance probe using
   centres put the wheeled fountain inside a wall.
5. **`node --check` cannot see a ReferenceError.** A builder that names its register flag `lit`
   was given `woodcut` copied from its neighbour; it parsed and threw at build time, and the page
   sat with no scene for twenty seconds.
6. **Only a fresh tab is honest after a load-time error** — the console accumulates across
   navigations within a tab.
7. **Dallington's page numbers are not the 1499's.** I searched the wrong 50 pages and wrongly
   reported a passage missing from his translation; `coverage.json`'s own `text_source` block
   warns about exactly this.
8. **Canvas luminance sampling does not work here** — `drawImage` off the WebGL canvas returns
   zeros, because the context runs `preserveDrawingBuffer: false`.
9. **A still screenshot cannot show a current**, and bash eats backticks in commit messages.

---

## 6. Where things are

- `ROUTER.md` — the entry point; route, then work. Do not read the docs indiscriminately.
- `research/coverage.json` → `COVERAGE.md` (`python scripts/coverage_report.py`)
- `research/tickets.json` → `TICKETS.md`
- `RECIPES/research-a-chapter.md` — the pass that produced chapters III, IV, VIII, IX
- `RENDERINGMODELSBLINGUSOUT.md` — the five figure rungs and what each costs
- `DECISIONS.md` — 50 calls; the two newest are the dream fold and the nymphs' bodies
- Corpus: `C:\Dev\hypnerotomachia polyphili\` — Dallington in `md/`, `hp.db`, the plates

---

## 7. What I would do next

1. **Ask Ted the piazza question.** It gates the largest unbuilt architecture in the book.
2. **Enumerate another chapter** — XI, XII, XIV, XV, XVI are Dallington and unread; 21 chapters
   remain. Enumeration keeps finding things already built and unrecorded, which is cheap value.
3. **More named reliefs.** Three cost 2 meshes between them. The book describes several more
   pictures figure by figure and they currently get a seeded crowd.
4. **`bug-court-has-no-room-left` via the fold** — the mechanism exists and is verified.
