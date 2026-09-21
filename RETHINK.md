<!-- tokens: ~3,935 -->
# RETHINK — the ground between the buildings

*Written 2026-09-20 in answer to Ted's live test (`NEXTSTEPS.md` 0-AA): **"I don't want a bunch
of mostly empty spaces between our buildings … make sure that our points of view deliver
spectacular experiences such as Poliphilo is describing and reacting to."** A research-and-design
pass. No file under `src/` was touched. The gap-by-gap tables, every quotation with its page, and
the costings live in [`research/infill_plan.json`](research/infill_plan.json) — this file is the
argument, the ranking and the order of work.*

---

## 1. The finding

The eight gaps between the enclosure and the shore are **not 388 m of open grass each**. The
plan separates consecutive precincts by **exactly one stadium — 185 m — almost everywhere**, and
by two at Polia's garden. The larger centre-to-centre figures in `research/plan.json` are mostly
the precincts' own half-depths. Measured edge to edge from `src/scenes/world/plan_sites.js`:

| gap | centre→centre | **open span** | lateral jog |
|---|---:|---:|---:|
| enclosure → palace | 183 | **0** | 0 |
| palace → polia_garden | 394 | **185** | 0 |
| polia_garden → three_doors | 533 | **370** | 0 |
| three_doors → triumphs | 463 | **185** | 0 |
| triumphs → vertumnus | 486 | **185** | +150 |
| vertumnus → venus_temple | 509 | **185** | −350 |
| venus_temple → polyandrion | 567 | **185** | +430 |
| polyandrion → shore | 397 | **185** | −230 |

Two things follow, and the second is the more important.

**One stadium is not too far.** 185 m is a Renaissance garden compartment, not a wasteland. The
gaps do not need to be closed; they need to be **furnished**, and the book furnishes six of the
eight itself.

**The emptiness Ted saw is probably not mainly a gap problem at all.** Three faults in how the
world is *read* do more damage than the open ground:

- **The sward stopped being grass.** `_buildMeadow` covers the gardens with 144 000 blades over
  1 863 872 m² — **one blade per 12.8 m²**. Before stage 2 the same 36 000-blade field covered a
  336 × 340 m box at 0.315 blades/m². The bounds grew 16.3×; the count grew 4×. What the camera
  actually sees across the gardens is the flat ground plane, with a blade every twelve metres.
  *No amount of infill fixes this, and fixing it costs one number.*
- **The garden trees are standing inside the pyramid.** `this._buildTrees()` is called at
  `HPWorldScene.js:393` **outside every precinct group**, and its coordinates are the original
  cramped ones. The myrtle-and-laurel grove of the Fountain of Venus, the citron/orange/lemon
  enclosure hedge and the cypress pair "the way to the palace" are therefore sitting in the Great
  Portal's court, inside the pyramid's footprint, 2.7–5.3 km from the precincts they belong to.
  Three gaps are bare *because their planting was left behind at the origin.*
- **The path goes to the wrong places.** `_buildGround` lays one 3.4 m processional plane dead
  straight at `x = 0` for the whole 13.7 km, while Vertumnus (+150), the Temple of Venus (−200)
  and the Polyandrion (+230) stand off it. The last four stations are reached by walking off the
  road across raw ground.

## 2. What the book puts in the gaps

Six of the eight stretches are narrated, and two of them are specified down to the hedge height.
Quotations and page references in full in `research/infill_plan.json`; the shape of it:

| gap | the book's own furniture | page |
|---|---|---|
| palace → garden | the ivied enclosure stands in "a wide and circling space, with bending shrubs of every fruit … with the ordering of a **ruled arrangement**" | 131 |
| garden → doors | "a most charming river … a **gracious plane-grove** … with **lotuses** set between … a proud **stone bridge of three arches** … all of most comely **Hymettian marble**"; beyond it "**cool shades**, sweetly kept by the … chattering of small birds"; then "a stony and rocky place … **bare of all greenness**" | 133–134 |
| doors → triumphs | "an artful **arbour of flowering jasmine, with a tall arching** … Entering beneath this"; then, "**I came to the end of that flowery covering**; and looking, there appeared to me a countless crowd … keeping high festival" | 141–142 |
| triumphs → vertumnus | "**Not hindered nor taken up by any growing shrub.** But all the flowery ground was one level meadow", and then thirty named flowers | 178 |
| vertumnus → temple | "**measured square spaces hedged about with the bounds of wide, straight, four-way roads, a pace high**, of dog-thorn … and most thickly bound to a wall-like level of most even **box** … planted **symmetrically the lofty victorious palms** … **alternating** with the greenest citrons and oranges, hawthorn-medlars, pistachios, pomegranates, quinces, tree-myrtles, medlars, service-trees" | 190 |
| temple → polyandrion | "the pleasant and temperate hills ornated with opaque little groves … **the rivers flowing down** … to the right and left part softly running, to the near sea precipitating … **Let yield here, then, the Thessalian river and field (Tempe).**" | 239 |

**Two of these are already in the ledger as `unbuilt` and were never connected to the empty
ground they belong to:** `xvii-orchard-hedge-garden` (ch. XVII) and `xv-elysian-flower-meadow`
(ch. XV). A third, `xi-festival-on-the-plain`, is the reveal at the end of the jasmine arbour.

**One stretch the book insists stays open.** Chapter XV says twice that the Elysian field is a
level flower meadow with *no shrub in it*. The honest answer for `triumphs → vertumnus` is that
it is meant to be seen across — and that it should be full of **flowers and people**, not
buildings. That is a real answer to "no empty spaces", not an evasion of it.

## 3. Where the book is silent — and what 1499 would have put there

Ted's brief authorises this explicitly. Every proposal carries a provenance label in the JSON:
`book`, `ours, after <named precedent>`, or `ours, unsupported`. The precedents used are all
**contemporary with or earlier than 1499, or classical texts the humanists read**. No Villa
d'Este, no Boboli — both are half a century or more too late to be evidence for this book.

- **Compartment module and road width for the orchard (G6).** The book gives the hedge height
  (one pace = 1.48 m), the materials (box, dog-thorn, ground juniper), the four-way roads and
  the alternating planting. It does not give the module. Proposed: compartments of **one quarter
  stadium (46.25 m) square** with **5-pace (7.4 m) roads** — arithmetic on the book's own units,
  marked `ours`. *After Alberti, `De re aedificatoria` IX.4* (villa trees "in rank and file,
  answering one another with equal intervals", with walks between compartments) and *Pliny the
  Younger, Ep. V.6* (the Tuscan villa's box-bounded compartments and clipped work) — the two
  texts Colonna's milieu actually pictured a garden from.
- **A two-storey order for the palace front (G1).** The book gives 200 columns in four marbles
  and not their order. *After Alberti VII–IX* (superimposed orders, the gravest below) and the
  *Cortile d'Onore at Urbino* (Laurana, 1460s). This is also the direct answer to 0-AA's
  "the roof is too low": the existing Queen's Court colonnade is **4.0 m**, which is a domestic
  number. A two-storey front at ~11 m to the upper cornice reads as monumental in an 88.8 m room.
- **An aimed view-corridor on one of the orchard's four-way roads (G6-d).** The book lays the
  roads and does not aim them. Aiming one at the Temple of Venus's door is what turns sixteen
  compartments of hedge from a wall into a reveal. `ours, after Alberti IX.4`.
- **Dune grass and a strand line on the shore (G8-d).** `ours, unsupported`, and labelled so.

## 4. Spectacle: the view sequence, gap by gap

`DIRECTIONS.md` §5 is the rule — *nothing in this book is approached across open ground with the
destination in view* — and the gaps are where it is currently broken. Three sequences to build,
in rank order:

**G3 (garden → doors), 370 m.** Green country; the river's line of planes across the way; the
rock **not visible at all**. You cross the bridge, and Logistica's two porphyry tablets are the
instruction to stop and read. Then a shaded walk full of birds. Then the trees stop and the bare,
gnawed spurs stand up at once. *Protect:* from the garden's arch the eye must stop at the
plane-grove. *Build:* grove, shaded walk, ring of dry spurs.

**G6 (vertumnus → temple), 185 m + a 350 m jog.** A clipped green wall and a line of palms, with
the conifer hills beyond. The Temple of Venus is withheld until you reach the one road that
frames its door — fifteen of the sixteen compartments hide it. *Protect:* the aimed road; the
closing ring of hills all round the horizon. *Build:* box hedges, palm ranks, conifer belt.

**G4 (doors → triumphs), 185 m.** Nothing but jasmine, for the whole gap, and then in one step
the festival plain. The book wrote this: *"I came to the end of that flowery covering; and
looking, there appeared to me a countless crowd."* He sits down where he stands, full of wonder.
Put a turf seat there — `_turfSeat` already exists — and the world tells the reader to stop.

Two stretches **must not be filled**, and saying so is part of the job:

- **valley → pyramid (1 850 m).** Chapter II–III is the book's one long approach and it depends
  on emptiness: the tower "vnperfectlie appearing" far off, growing over hundreds of metres.
  What it needs is not infill but *cliffs that converge* and two or three mid-ground scale
  markers so the growth is measurable.
- **shore → crossing → Cythera (1 110 m).** A whole chapter of song. It needs the sea-gods, the
  nymphs' six-part song staged with a real duration, and Cythera resolving from one mass into
  three rings as you close. None of that is geometry in the water.

## 5. Cost

Estimated **~538 000 triangles and ~41 draw calls** for the whole eight-gap programme, costed on
the `_isleGrove` model (`cythera.js:840`) — one `InstancedMesh` for trunks and one for crowns per
species, so a species of any count is **two draw calls**, and a tree is ~100 triangles. Hedges are
merged box runs; water is a ribbon plane; the flower fields reuse `createMeadowField`'s existing
`accept` callback.

The gate, per rule 7: **+15 % world triangles over the `hpDiag()` reading taken at the start of
the first ticket** (no live reading was taken this pass — see §7), and **no single view's draw
calls up more than 25 %**. `DRAWCALLS.md`'s point governs the second: **cost is a property of the
view.** None of these eight gaps is ever in the same frustum as the pyramid's north face or as
Cythera, so the worst frame in the world — the dark wood, 3 124 calls — is untouched by
everything proposed here. If the total exceeds the cap, drop in this order: G1, G8, G2, G7, G5,
G4, G6, **G3 last**.

Ranked by spectacle per triangle:

| rank | gap | triangles | why |
|---:|---|---:|---|
| 1 | **G3** garden → doors | 74 k | largest open span; centrepiece already modelled and merely mis-sited; all-`book` |
| 2 | **G6** vertumnus → temple | 125 k | the book's most complete garden spec; the screen that currently fails |
| 3 | **G4** doors → triumphs | 72 k | the book's own withhold-then-reveal, and the gap is exactly the right length |
| 4 | G5 triumphs → vertumnus | 114 k | flowers and people, no architecture — as the book requires |
| 5 | G7 temple → polyandrion | 146 k | the longest real walk; the Tempe; the turn toward the sea |
| 6 | G2 palace → garden | 40 k | the ruled shrub ring, plus spreading the three artificial gardens out |
| 7 | G8 polyandrion → shore | 45 k | the red obelisk, the sea-gods, the standard |
| 8 | G1 enclosure → palace | 30 k | no gap exists; this is the palace front, already queued elsewhere |

## 6. Order of work

One writer per file. New geometry goes in a **new module `src/scenes/world/infill.js`**, precisely
so `palace.js`, `temple.js` and `cythera.js` stay free for the builders already in them.
`HPWorldScene.js` is the serialization point — every ticket adds one call inside the right
`_in(...)` group, and only one agent may hold it at a time.

1. `bug-meadow-density-fell-4x-at-stage-2` — `nature.js`. Cheapest, largest visible change.
2. `bug-garden-trees-never-placed` — `nature.js`, same writer, same session.
3. `feat-infill-bridge-grove-river` — `infill.js`. Subsumes `bug-second-bridge-in-wrong-precinct`.
4. `feat-infill-orchard-quincunx` — `infill.js`.
5. `feat-infill-jasmine-arbour-reveal` — `infill.js`.
6. `bug-itinerary-path-misses-three-precincts` — `approach.js`, in parallel with 3–5.
7. `feat-infill-elysian-flower-field` — `infill.js`, after 1.
8. `feat-infill-tempe-to-the-sea` — `infill.js`, once the budget is measured against 3–7.
9. `feat-infill-shore-grove-and-sea-gods` — `infill.js`.
10. `feat-palace-front-closes-enclosure` — `palace.js`, behind whatever today's writer lands.

## 7. Where this plan is thin — say it out loud

- **No live look was taken.** This agent had no browser tool and no headless browser is installed
  (`playwright`/`puppeteer` both absent; only the deployed `main.js?v=443` was confirmed by
  `curl`). Everything about *what is built where* is read from the builders and from
  `plan_sites.js`, not seen running. Somebody with a tab must walk G3, G6 and G4 before ticket 3
  starts, and the two most consequential claims to check first are R1 (trees inside the pyramid)
  and R4 (the blade density).
- **`open_span_z_m` is a lower bound.** Precinct boxes marked `sized: ours` are plan allocations,
  not built extents. The geometry inside `venus_temple`, `polyandrion` and `vertumnus` is far
  smaller than its box, so the true open ground there is larger than 185 m — possibly much larger.
  Not measured.
- **Triangle estimates are estimates.** They are arithmetic on the `_isleGrove` construction, not
  readings. Treat ±40 % as the honest band and re-measure after ticket 3.
- **The screenshot in 0-AA cannot be planned off as written.** It says "from the palace precinct
  looking north, the pyramid … on the horizon", but the compass declared at
  `constants.js:34` makes −z north and the pyramid is 2.6 km *south* of the palace. The finding
  (an empty field to the horizon) stands; *which gap it is about* does not. Re-shoot it.
- **Chapter order vs. plan order.** The plan's sequence (garden → doors → triumphs) agrees with
  the book, but two built objects do not: the three-arch bridge and the jasmine arbour are both
  a precinct or two away from the pages that place them. Nothing else was audited for this, and
  it would be worth a systematic pass.
- **Gaps G2 and G8 are the weakest entries here.** G2's fill rests on one sentence (p. 131) and
  G8 is arguably not a gap at all, since the book puts the ruined temple on the sand.

---

*Sources: our CC0 translation, `translation/en/page_NNN.md`, pp. 93–94, 131, 133–134, 141–142,
177–184, 189–193, 238–245, 282–285. `research/plan.json`, `src/scenes/world/plan_sites.js`,
`research/coverage.json`, `research/dimensions.json`. `DIRECTIONS.md` §5, `DIMENSIONS.md`,
`BUILDINGPLAN.md`, `DRAWCALLS.md`. Alberti, Pliny the Younger and Urbino are named as precedent
only where a proposal is labelled `ours, after …`. **Godwin (1999) is in copyright and was not
consulted, quoted or paraphrased.***
