<!-- tokens: ~2,900 · read before touching the ground plan, a precinct, or any coordinate -->
# HANDOVER — stage 2 of the true scale (2026-09-20)

*Companion to `HANDOVER.md`, which is the 2026-09-17 session. This one is about the ground
plan and nothing else; the roll-mode work of the same day has its own handover.*

## 0. What changed, in one sentence

**The world is 13.7 km long and on the plan, the pyramid is the book's own 1,139.6 m square,
and not one coordinate inside any builder was re-typed to do it.**

`DECISIONS.md` 60, 61, 62. Ted's calls: full stage 2, square pyramid, and then the screens,
the spring, the triumph fixes and Polia's staging.

## 1. The one idea you need

A precinct is built inside a `_placeAt` group that carries a rigid shift. The shift is
**computed, never typed**:

```bash
python scripts/plan_sites.py      # research/plan.json -> src/scenes/world/plan_sites.js
```

That generates `PLAN_SITES` (23 precincts: plan centre, current centre, shift, width, depth,
edges) and three functions everything else uses:

| | |
|---|---|
| `shiftOf(key)` | the precinct's `[dx, dz]`. Throws on an unknown key — a precinct that quietly does not move is the failure this whole file exists to prevent. |
| `toWorld(key, x, z)` | a point written in the ORIGINAL cramped frame, in world metres. Applies SPREAD ×4 and then the shift. |
| `_precinctLocal(key)` | the precinct's own centre **in the frame its builder works in**. Not the group origin — see §4.2. |

`HPWorldScene.buildWorld` reads as a table of precincts: `_in('palace', () => {...})`. Adding a
builder to a precinct is putting the call in the right block. **Moving a precinct in stage 3 is
editing `scripts/plan_sites.py`'s PRECINCTS table and re-running it.**

## 2. What is built

- **The pyramid, square, at the book's setting-out.** 1,139.6 m of base storey wall to wall,
  a 1,110 m plinth 20.7 high, 1,410 courses of 0.56 m drawn in 94 merged bands, 789.6 m to the
  cube, ~965 m to the winged nymph. Forty of the real courses are cut into the south face above
  the porch so the true riser can be seen from close to. The 4.5 m gable is gone.
- **The valley holds it.** `_valleyCliffs`'s neck is `PYRAMID_W / 2 + PYRAMID_CLEAR` — the
  book's ten paces of clearance — so the gate can never be wider than the valley it shuts. Walls
  ~630 m at the neck, falling to the palm plain over the plan's ten stadia.
- **The screens** (`src/scenes/world/screens.js`, new): the **cypress avenue**, four stadia of
  paired cypress on a periwinkle floor, closed by a citrus hedge with one gate; the **green
  enclosure**, sixty paces square, hedged east and west with **windows cut in the quickset**; the
  **wooded country's ring** of tree-bearing mountain, an ellipse at the plan's own width and
  depth with a mouth at each end. `_citrusRun` is the shared windowed-hedge builder.
- **The fruitful fields and the dividing spring** move with the `fields` station into the wooded
  country, where chapter VI puts them.
- **The triumphs**: each car's own two stones, each car's own livery, no riders on the fourth,
  **Semele's urn** and the **golden vine** that roofs its team. `DECISIONS.md` 61.
- **Polia approaches.** She starts at the far end of the arbour and walks it when you come in,
  torch in hand, and stops at arm's length. The `approach` field on an NPC is the machinery;
  chapters XI, XII, XXII and XXV all want it.
- **The quarrel of the eyes and the appetite** — chapter XI's last page — is a dream stop
  (`polia_quarrel`) with its reaction. It was `unbuilt` in the ledger.
- **One sward, the size of the plan**, from `PLAN_EXTENT`; **the sea sized from the plan**, beach
  to island across the crossing's six stadia.
- **`window.hpWalk(x, z, yaw)`** — one call from a blank page to standing somewhere. `yaw = 0`
  is north, `Math.PI` is south, and forward is `(-sin yaw, -cos yaw)`.

## 3. Ledger updates owed (another window holds those files)

`COVERAGE.md`, `research/coverage.json`, `TICKETS.md`, `research/tickets.json` and
`scripts/coverage_seed.py` were being written by another session while this ran, so under
ORCHESTRATION.md's one-writer rule **they were not touched here.** These entries are now stale
and someone should fold them in:

| ledger id | was | is |
|---|---|---|
| `xiv-europa-car-materials` | partial | **built** (emerald wheels, diamond tablets) |
| `xiv-leda-car-materials` | unbuilt | **built** (agate, sapphire) |
| `xiv-danae-car-materials` | unbuilt | **built** (chrysolite, heliotrope) |
| `xiv-bacchus-car-materials` | unbuilt | **built** (asbestos, carbuncle) |
| `xiv-leda-riders-liveries` | unbuilt | **built** |
| `xiv-danae-six-girls-uniform` | unbuilt | **built** |
| `xiv-fourth-car-no-riders` | partial | **built** |
| `xiv-semele-urn` (the gold base, eagles, jacinth vessel) | unbuilt | **built** |
| `xiv-golden-vine-roofing-team` | unbuilt | **built** |
| `xi-eyes-appetite-quarrel` | unbuilt | **built** (as a reaction-choice) |
| ch. VIII cypress avenue / green enclosure / hedge windows | unbuilt | **built** |
| ch. VI the wooded country's ring | unbuilt | **built** |

## 4. Traps — read before debugging

**These are new, and three of the four cost something today.**

1. **`node --check` does not parse ES modules on node 24.** It exits 0 on a genuine syntax
   error. Use `node scripts/parsecheck.mjs <files>`. `DECISIONS.md` 62.
2. **A precinct group's origin is NOT its centre.** For a precinct that already existed, the
   origin is wherever the old world's origin landed after the shift; for a greenfield one it *is*
   the centre. A builder drawing something sized from the plan needs `_precinctLocal(key)`. The
   wooded country's ring was first drawn about the group origin and came out 256 m north of
   itself, standing in the cypress avenue.
3. **Positions inside a precinct are LOCAL; anything the walker compares against is WORLD.**
   Colliders, floors and NPC positions ride the group and are local. A *trigger* compared with
   `walker.player.pos`, or a collider pushed straight onto `walker.colliders`, is world and needs
   `shiftOf`. Polia's approach never armed for exactly this reason, and the triumph cars' moving
   colliders would have driven round an empty field 4.5 km away.
4. **rAF is throttled while the browser pane is hidden**, so `scene.update()` never runs and
   nothing animates — but screenshots still render, so the page looks alive and is frozen. Drive
   it by hand to test motion: `for (let i=0;i<200;i++) sc.update(0.05)`. Draw-call numbers
   cannot be measured this way at all; `renderer.info.render.calls` reads 1.
5. **Two planes 3 cm apart z-fight at this length** even with the logarithmic depth buffer. The
   world's processional axis runs under every precinct, so a precinct's own floor sits at
   y = 0.12 and the shared path materials carry `polygonOffset`.

The 2026-09-17 traps and the twelve before them still stand: `HANDOVER.md` §4.

## 5. What stage 2 did NOT do

Recorded rather than hidden. In rough order of what a reader notices:

1. **The monuments have not grown into the room the plan made.** The pyramid has; nothing else
   has. Cythera is a 50 m island in a 1,400 m precinct; the colossus is a tenth of his sixty
   paces; the palace, the temple and the theatre are all at their old size on a plan that gives
   them hundreds of metres.
2. **The palace does not close the green enclosure's north side**, which is what the book says it
   is ("of which the palace is the fourth"). The enclosure is on the axis and the palace building
   stands 80 m west of it. This is a siting fix inside the palace precinct.
3. **`labyrinth` takes a zero shift** and stays beside the piazza, four kilometres from the
   polyandrion it belongs to (ch. XX). It needs rebuilding where it belongs, not shifting; a
   shift alone would carry a wrong siting to a new address.
4. **The decorative scatter** — birds, turf seats, motes, fumes — is global and unanchored, so it
   still clusters near the origin. Same fix as the meadow: give each a precinct.
5. **The Polia fold reports 0** and is left in place. The conflict it resolved no longer exists
   at true scale; if the palace moves onto the enclosure it may come back.
6. **The octagonal fountain-house of ch. VI** (`fountain_house`, greenfield) and **the crossing**
   are precincts on the plan with no builder yet.

## 6. Nothing is waiting on Ted

All three questions put to him on 2026-09-20 were answered before the build started.
