<!-- tokens: ~7,999 · read for: Ted's standing asks, in his words -->
# Next steps — the standing work queue

*Everything Ted has asked for that is not yet finished. **Read this at the start of every
session and work it down.** Do not wait to be re-asked: an item stays here until it is
actually built, verified in the browser, and deployed to both hosts.*

**Why this file exists.** In 2026-09-04/05 several explicit requests were acknowledged and
never delivered, because each new message pulled attention to the newest thing. If Ted asks
for something, it goes in here immediately, in his words, before work starts.

**Rules**
1. Add the ask here the moment it's made, quoting him where wording matters.
2. Work items top-down; finish one before starting the next.
3. Nothing moves to Done until it is verified against the running site and deployed to
   **GitHub Pages, the only host** (Vercel was retired 2026-09-07). And verifying live means
   two checks, not one — the origin *and* the browser, which can hold a stale
   `src/index.html`. See `DEPLOY_STATE.md`.
4. Report what's still open from this list. Don't let Ted discover it.

> **Closed sections move to** [`nextsteps/2026-09-closed.md`](nextsteps/2026-09-closed.md), the split `DECISIONS.md` already models. A section stays in full here only while it has an open thread.

---

## 0-AA. Ted, 2026-09-20 (evening): the built world doesn't earn the true-scale spread

*Tested live, after "ALL STAGES DEPLOYED" above.*

*"I tested it and things have gotten weird we have some places where the roof is too low and
is not the sky etc. We might need to rethink from the ground up how the whole thing works. I
don't want a bunch of mostly empty spaces between our buildings. and I want the users to get
good views of meticulously crafted renaissance buildings that are like as described in the
novel but as the designer you might have to go beyond the text of the novel and fill in
knowledge of renaissance architecture to finish out everything that needs to be built, and
make sure that our points of view deliver spectacular experiences such as Poliphilo is
describing and reacting to."*

**Diagnosed live the same day, before proposing anything** (screenshots and scene-graph
queries, `https://t3dy.github.io/EmblemsIn3d/src/`):

- **The emptiness is real and severe.** From the palace precinct (x76, z−3460) looking south (toward +z; −z is north),
  the pyramid and its flanking cliffs stand as a thin sliver on the horizon behind a wholly
  empty green field — nothing built between camera and horizon. A small arcaded shrine one
  precinct further in (z−3500) is genuinely well made up close: two long facing colonnades,
  a central pavilion. **The problem is what's between named stations, not the stations
  themselves.**
- **The low-ceiling complaint is systemic, not one broken mesh.** Interior/colonnade heights
  across the codebase: Temple of Venus wall height 5.2 m (drum radius 6.2 m — a squat dome),
  the Queen's Court colonnade 4.0 m, a second temple structure's colonnade 2.5–3.0 m. These
  are domestic-scale numbers, not the loftier proportions of monumental Renaissance
  architecture (compare Bramante's Tempietto, whose drum-to-entablature run is taller
  relative to its own modest diameter). No single mesh is broken; the whole architectural
  vocabulary was set for an intimate world and never reconsidered when Stage 1 (SPREAD=4)
  and Stage 2 (full true scale, 13.7 km) grew the world around it.
- **Both complaints share one root cause**: the buildings kept their original modest
  dimensions while the space around them grew by orders of magnitude. They now read as both
  cramped inside and sparse from outside — tiny islands in an empty landscape.

**Ted's own framing authorizes the fix's shape**: go beyond the text where it's silent, use
real Renaissance architectural knowledge to finish what the novel only gestures at, and
design the *approach* — not just the destination — for spectacle. This is being treated as a
new phase, not a patch: see `RETHINK.md` (to be written) for the plan and its sequencing, and
`DECISIONS.md` for the scale-and-density fork settled before large build work starts.

---

## 0-AB. Ted, 2026-09-21: back to a smaller island, priority is coverage then beauty then planting

*Ted, after the true-scale spread from 0-AA landed and was walked live:*

*"I think I've changed my mind about having things super spread out. I'd like to go back to
the relatively smaller island, although we should move things apart as necessary as we add
more buildings. Highest priority is to make sure all the scenes of the woodcuts have analogs
in our virtual world. And we have a lot of work to do making the buildings beautiful and the
gardens filled with plants that look like the plants named in the novel or our scholarship."*

**This partly reverses call 54 (0-AA's fix), not all of it.** See `DECISIONS.md` / call 67 for
the full reasoning and the exact new constants. In short: monument and garden SIZE stays true
to the book (the pyramid is still 1,139.6 m); the invented one-stadium DEFAULT GAP between
every precinct — the actual cause of "mostly empty spaces" — drops from 185 m to 30 m (75 m
for the two gaps that carry real textual "distance in words"), the valley's reveal approach
halves, the crossing trims, and Cythera itself scales to 45% of its literal diameter (Ted named
the island specifically). Execution tracked in the ticket work touching `scripts/plan_build.py`
/ `research/plan.json` / `src/scenes/world/cythera.js`.

**Standing priority order from here, replacing "close the true-scale infill queue":**

1. **`research/coverage.json`'s build queue is priority one.** 246 unbuilt + 42 partial
   features, chapter by chapter, is literally "does every woodcut scene have an analog" —
   that is what the ledger already tracks (`COVERAGE.md`). Work it with `/build-feature` /
   `/research-chapter`, ranked by which features are plate-attached (a woodcut exists) first.
2. **A building-beauty pass** — proportion, material, ornament, using `SOURCES.md`'s
   "Modelling the 3-D assets" table and real Renaissance precedent to fill what the text
   underdetermines, per the standing 0-AA brief's own licence to go beyond the text.
3. **Species-true garden planting** — named plants from the novel and the scholarship
   (`WOODS.md`, the ground-flora decision) extended to trees, hedges and orchards, not
   stand-in greenery.

The true-scale infill tickets (`feat-infill-bridge-grove-river`,
`feat-infill-orchard-quincunx`, `feat-infill-jasmine-arbour-reveal`,
`bug-itinerary-path-misses-three-precincts`) are reprioritised behind item 1, not dropped —
the content they add is often coverage-queue material too, just now filling a third the space.

---

## Open — 2026-09-20 Status

*Updated 2026-09-20 after full audit of plan implementation and coverage. All four plan
stages (1–4) are deployed. The constraint now is the 251-feature build queue.*

**PLAN STATUS: ALL STAGES DEPLOYED**

- ✅ **Stage 1** (2026-09-17): SPREAD = 4 — precincts at 4× old siting
- ✅ **Stage 2** (2026-09-17–20): Precinct shifts applied via `_placeAt` in `HPWorldScene`
- ✅ **Stage 3** (deployed): Monument scaling — pyramid at 1,139.6 m (PYRAMID_W constant), all dimensions from the book
- ✅ **Stage 4** (2026-09-20): Screens built — cypress avenue (740 m), green enclosure (88.8 m square), wooded country ringwall

**COVERAGE AUDIT FINDING**

Coverage regenerated 2026-09-20. The ledger shows 251 unbuilt features, but many features ARE in the code
(marked `?` in COVERAGE.md, meaning grep found evidence but live verification hasn't run this session).

The real gap is not missing *architecture*, but missing *narrative and allegorical detail*:
- **Built**: Building shells, basic structures, major monuments
- **Missing**: Character-specific costumes, allegorical figures (infants in fountain shafts), narrative moments (arrow-passing rite), scent-infused surfaces, intricate ornamentation

**PRIORITY BUILD QUEUE**

Work chapters in this order (most impact first):

1. **XXII (Theatre of Cupid's Triumph)**: 30 unbuilt
   - Stage is set (car, nymphs, lovers built); missing: 13-nymph masque, Psyche's elaborate costume, trophies' gem details
   
2. **XXIII (Fountain of Venus)**: ~20 unbuilt (estimate from COVERAGE.md)
   - Fountain architecture built; missing: allegorical infants in column shafts (the core coniunctio symbol), zodiac carvings, arrow-passing rite (chapter's climactic narrative)
   
3. **Book II (Treviso, Polia's Chamber)**: 16 unbuilt in ch. XXV + unbuilt in XXVI-XXXIII
   - This is where the romance resolves; needs full geometric build from scratch
   
4. **Remaining 180+ features**: Work chapter by chapter, prioritizing narrative beats over decorative detail

**Before building anything from this list, read `RECIPES/model-an-asset.md` step 0 and
grep the scene.** Two items below were once "missing" and turned out to be built.

---

### 0-W. Ted, 2026-09-17: spread everything out, and build everything in the novel

*"I feel like we still don't have all the structures that Poliphilo visits in the novel, and our
dream garden is still too cramped. I'd like to spread everything out and make sure we build
everything that's in the novel."*

Two calls taken the same day (`DECISIONS.md` 54 and 55): **true scale, 1 : 1, staged**, which
reverses the 2026-09-09 call to leave the ground plan alone; and **Book II is built as a second
place**, Treviso, not one station with commentary.

**Done 2026-09-17, and verified on the deployed page** — full text moved to [`nextsteps/2026-09-closed.md`](nextsteps/2026-09-closed.md).

**Open, in order**

1. **Stages 2–4 of the plan.** Stage 1 put the precincts at 4× their old siting, not at
   `plan.json`'s true-scale centres. Still to come: the precincts onto the plan proper, then the
   monuments grown into the room it makes (the pyramid is 17.5 m against a stated 1 139.6), then
   the screens — `DIRECTIONS.md` §5, *nothing in this book is approached across open ground with
   the destination in view*, which is what will stop the spread reading as objects on a lawn.
2. **251 unbuilt features.** The build queue in `COVERAGE.md` is now the real one. The richest
   seams the reading found: chapter XXII's theatre (50 features, 30 unbuilt — including a cavea
   that is not stone but planted jasper flower-boxes, and three gallery floors made to be
   *smelled* underfoot); chapter XIV's fourth triumphal car, which carries no nymph at all but
   Semele's ashes in a jacinth urn under a golden vine; and the whole of Book II.
3. **The decorative scatter left behind by stage 1** — bird perches, turf seats, pollen motes had
   no per-object anchor and are now misplaced against the precincts that moved.
4. `hpGoTo('cythera_isle')` does not reach the island; the island is reached by Cupid's boat
   (digit 0) by design, so this is probably not a defect — but nobody has confirmed that, and it
   was noticed while verifying the spread.

### 0-X. Ted, 2026-09-13: the people and animals should behave like Katamari's

*"I'm not seeing the people or nymphs or dragon and other animals responding like the people
and animals do in katamari. When you bump them but they are too big for you to roll up
sometimes they panic and run away."* **Built the same day** — `systems/Creatures.js`,
`ROLLING.md` §4b: 149 figures and animals are whole creatures that scatter from a ball big
enough to eat them, bolt or stagger when bumped by one that is not, and roll up whole.

Left open: nobody turns and **chases** a small ball yet (the portal dragon is the candidate);
creatures run on the flat and skate over terraces; the riders of the cars and the boat are
excluded.

Also asked the same day, and answered in chat rather than acted on because it is his call:
**GitHub limits** (59 MB checkout, ~150 MB history, largest file 2.5 MB — a tenth of the soft
limits) and **Blender or Unity**. Blender as an asset tool exporting glTF into this engine is
low-risk; a Unity port loses the no-build Pages deploy and agent-readable code, and its
binaries are what would actually hit the limits.

### 0-Y. Released 2026-09-10 as **Version 6** — closed

Full text moved to [`nextsteps/2026-09-closed.md`](nextsteps/2026-09-closed.md).
### 0-Z. Shipped 2026-09-09 (declared "Version 5"; released inside v6) — do not re-do these

The plate frame, the roll-up crust and growth curve, contrapposto and species silhouettes, the dream opening, the way out of the wood, the three mute approach stations, the gardens of glass and silk, Poliphilo's reactions, the reading mode, the plate bound to the page, the finished translation, and the piazza sited from the book — all **shipped 2026-09-09**, full text moved to [`nextsteps/2026-09-closed.md`](nextsteps/2026-09-closed.md). **Everything below this line is still open.**

Two things that came out of it and are NOT done:

- **The gardens of glass and silk are on the wrong side of the gate**, the same error in the
  other direction — chapters XII–XIII, standing 26 m before the portal. They were pushed 30 m
  down the valley to clear the piazza, which is a holding position and not a fix. It waits on
  room on the palace side: ticket `bug-artificial-gardens-wrong-side-of-portal`, which is now
  the second thing blocked behind `bug-court-has-no-room-left`.
- **The colonnade capitals are plain drums.** Dallington p. 38 gives them waved shell-work with
  the corners turned in *"like a curled locke of hayre, or the vpper head of a base Viall"* —
  an Ionic volute described by a man who had never been given the word for it.

**Chapter XI is enumerated and Polia is dressed from it** (2026-09-09, later still). Eleven
features, five built. The chapter had no plate AND no feature list and still looked covered,
because two of chapter X's tour stops were filed under it -- the same blind spot as the
plate-driven one, a level up. Left open out of it:

- **The festival on the plain** (`xi-festival-on-the-plain`): the countless crowd of youth of
  both kinds that Polia parts from with her torch. It is what makes her singling him out mean
  anything, and it is the biggest unbuilt thing in the chapter. A crowd is figures, so cost it
  against `RENDERINGMODELSBLINGUSOUT.md` before starting.
- **The flowery covering** he walks under and comes to the END of, which is the reveal.
- **The quarrel between his eyes and his appetite** over which part of her is fairest -- a
  non-branching reaction-choice the book hands us ready made.
- Polia's gown is the right COLOUR but not the right CUT, and the colour only shows on the
  modelled rung.

### 0-A. Ted's open call, 2026-09-09: read the whole book while you walk it
Three requests, all resolved per 0-Z's shipped record: the full-text reading mode and the plate-bound-to-page frame are built; the roll-up-able census is tracked live in `ROLLING.md`. Full text moved to [`nextsteps/2026-09-closed.md`](nextsteps/2026-09-closed.md).

### 0-B. Roll Up did not feel like Katamari — FIXED 2026-09-09, closed

Full text moved to [`nextsteps/2026-09-closed.md`](nextsteps/2026-09-closed.md).
### 0. Ted's open call: the world is too small — build the bigger dream — CLOSED, first pass done 2026-09-08

Full text moved to [`nextsteps/2026-09-closed.md`](nextsteps/2026-09-closed.md). What that pass still owes is `0b`, immediately below.
### 0b. What the scale work still owes

Items 1-3 (the 1:8 recommendation, the 17.5 m pyramid, the cypress avenue ticket) are
**superseded by the true-scale stages** in the "Open — 2026-09-20 Status" block at the top of
this file — full text of the superseded items moved to
[`nextsteps/2026-09-closed.md`](nextsteps/2026-09-closed.md). Renumbered, still open:

4. **The three doors are still a free-standing wall**, not cut in rock — ledger:
   `three-doors-rockface`.
5. **Chapter VI's wooded country**: the bridge whose spring divides right and left, the ringed
   mountain, the fountain-house glimpsed through the trees.
6. **Nothing tells the player how to get out of the wood.** The mechanic works — hold the sun
   at a constant bearing — but Poliphilo's layer or the station note has to say so.
7. **The spacious plain beyond the wood is bare ground.** Its whole character in the book is
   composed absence, and absence still has to be composed.

### 0aa. Check the mode chooser at 900 px whenever a card is added — done 2026-09-08, closed

Full text moved to [`nextsteps/2026-09-closed.md`](nextsteps/2026-09-closed.md).
### 0a. Ted's open call: close the stale Vercel mirror
Added 2026-09-07. Vercel is retired and Pages is the only host, but
`emblems-in-3d.vercel.app` is still up and frozen at `main.js?v=247`. Every push widens the
gap, and "Ted opens whichever link is to hand" is this project's own documented way of losing
an afternoon. Two ways to close it, both his call because both are outward-facing: **delete the
Vercel project**, or **one last deploy that redirects that URL to Pages**. Ask him.

### 0c. The gardens, after the 2026-09-07 pass
Done that day: the sward rebuilt at realistic scale and colour, the jasmine arbour at Polia's
garden, second nature north-west of the wood. Still open, in order:

- **Cythera — the twenty divisions are built (2026-09-08)**: twenty roads, twenty bosco
  compartments each of one species, twenty marble lattice fences with a gate in each and a
  named climber over each, twenty flowery lawns. What is still outstanding from Segre's
  reconstruction, and it is no longer the largest thing in the project:
  - ~~the terraces and their flights of seven steps~~ — **built 2026-09-08**, once the walker
    was given floor height. Four flights of seven at each of the four crossroads, a ridge of
    2.10 m falling through three rings into the theatre, and an ornate chariot gate on the
    ridge at each crossroad;
  - **240 fruit trees** on raised beds at the lawn corners — apples in the first order, pears
    in the second, plums with pistachios in the third. The only substantial thing left in
    Segre's reconstruction.
- **The three artificial gardens — glass, silk, and the counterfeit scent.** Hunt argues that
  illustrating them *damages* them, and that the 1499 and the 1592 both decline to for that
  reason. `GARDENS.md` §3 and item 5 of its ranked list: stage them as *described* rather than
  shown. The one place in this world where withholding is the faithful move.
- **Topiary from the plates.** The clipped forms are catalogued and unbuilt — the
  peacocks-on-an-altar-vase figure in particular. Now that `_hedge()` exists and `box` is a
  species with a leaf, a clipped peacock is a shape problem and not a material one.
- **Draw calls are ~1500 a frame** and about 2 M triangles. Nothing is wrong and there are no
  errors, but nobody has looked at where they go. The obvious suspects — the leaf-card shadow
  casters — were measured on 2026-09-08 and are **not** it: turning every one of them off saved
  19 calls out of 1539, inside the noise. Whatever it is, it is somewhere else.

### 0d. The pleasures still unbuilt (PLEASURES.md)
Updated 2026-09-08. Shade, birds, repose, visible fragrance, **the rills**, **the shaded walk**
and **the hedges' silhouette** are all built. Still open:

- **The bath's paragone.** *"Oh how exsquitely were the same Images cut, that oftentimes my
  eyes would wander from the real and liuely shapes, to looke vpon those feyned
  representations"* (p. 114). This needs no new geometry — it needs the carved nymphs of the
  frieze and the living nymphs in the water composed into **one view**, at one scale, in one
  light, or the sentence cannot happen. A camera study.
### 0h. The litter — what a second pass would add
`systems/Litter.js`, 2026-09-08: 8 976 objects of 72 kinds, zoned by station,
Roll Up only. Open:

- **Nothing is inside anything.** A chest is a solid box, a basket is an open
  cylinder with nothing in it, a quiver has three arrows modelled into it rather
  than three arrows you could take. Eating a basket and finding the fruit still
  standing where it stood would be the genre's own joke.
- **The placement only avoids `walls`.** It does not avoid water, so a cup can
  sit in the bottom of a fountain, and it does not avoid the colliders, so a
  sherd can be inside a hedge. Both are arguably fine; the water is not.
- **Twelve stations have no zone list** (`vaults`, `wood` beyond the nuts, the
  bridges, the shore). They get only the everywhere-dust.
- **The catalogue could go on.** The noun count in the scratchpad has more that
  are attested and unbuilt: thyrsus, caduceus, sceptre, cushion, carpet, napkin,
  fan, broom, spade, dagger, horn, cymbal, ladder, plough, bucket, anvil. Each is
  ten lines.
- **No object is ever more than one material deep in colour.** The palette is
  nineteen materials and every cup in the world is the same silver. Two or three
  tints per material, chosen per piece, would cost nothing and break the sameness.

### 0i. What the mode briefs say is still owed (2026-09-08)
Gathered from the "How it plays" tables; each is small and each is named in its brief.

- **Dream**: ~~a thirteenth stop for the tomb of Adonis~~ done 2026-09-08, with a `jump`
  in the engine. The banquet still has no moment of its own — the *court* reaction is the
  nymphs' — and the engine allows one reaction per stop; a second reaction per stop, keyed by
  beat, is the change that would let the supper and the cloth in the fire be chosen on.
- **Tour**: a stop of the banquet's own. ~~Drums note, Iasian gloss, harpies myth~~ done.
- **Fly**: a scripted circuit of Cythera at rim height; something that marks the
  water-labyrinth from the air, since the book itself shows it from a mount.
- **Roll**: name the chessboard's squares and courses; a harpy's foot by name; the pomanders
  on the court's litter list.
- **Walk**: a second instrument for half the musicians; the ridden crossing.

### 0g. What is left of the masonry
Columns are drums; the Great Portal's piers, the Temple of Venus's eight piers
and the Planetary Palace's hall wall are ashlar; the temple's cupola and the
palace's roof are carried loads that come down with their supports (2026-09-08,
`_ashlar` + `systems/Masonry.js`). **`scene._monoliths` is the ledger** — every
object `_census` rejects for being over six metres — and it now holds nothing but
sea, sky, ground discs, roads and terrace shells. What is left:

- **The other arches.** `_arch` is used at Cythera's four chariot gates. The
  bridge arches, the twenty Cythera fence gates and the Fountain of Venus's
  arcade are still single tori. The fountain's are *segmental* (`scale.y = 0.62`)
  so `_arch` would need a rise parameter separate from the span.
- **The obelisk plinths, the bath, the Court screen, Book II's Treviso front.**
  `_ashlar(cx, cy, cz, w, h, d, mat, {course, block, ry, name})` does it in one
  call and registers the structure. The one care needed: a wall that also has a
  `_wallCol` should drop that collider when it topples — assign it to `st.col`,
  the way the Temple of Venus's piers do.
- **The amphitheatre and the Cythera terrace shells are NOT walls** — they are
  ground you stand on, and the walker's floors are registered against them.
- **The Polyandrion is not a candidate either.** It is a ruin; its columns are
  already broken on purpose and its stones are already down.
- **The Three Doors wall is not a candidate.** The book insists it is "hewen ovt
  in the verie rocke" and it is boulders on purpose.
- **Arches and vaults have no model at all.** An arch whose springing stone is
  eaten should fall; at present the voussoirs are one torus.
- **Nothing falls on anything.** A toppled stone passes through the ball, through
  people and through other stones. It now lands on the WALKER'S FLOOR rather than
  on y = 0 — so rubble on a terrace stays on the terrace — but not on the rubble
  already there. Stacking rubble is the obvious next step and the expensive one.
- **A stone thrown more than about 4 m from where it started can drift out of the
  roll-up's spatial grid**, which is keyed on its position at build time (cells
  of 4 m, searched ± 1). Toppling throws pieces 1–3 m so it does not bite today,
  but a bigger collapse would need the grid re-keyed on landing.

### 0f. Roll Up — what is left
Second pass done 2026-09-08. It now has an ending (the ladder of the seven metals to the
chemical wedding, all of it out of `hp.db.alchemical_symbols`), it bumps on anything it cannot
eat, and it knows **121 distinct names** for what it swallows — 325 things out of 88 130 are
still "a piece of the dream". Open:

- **People are just meshes.** The nymphs and Poliphilo are excluded from the merge (they
  animate) and so are censused as standalone — they come off whole, which is right — but they
  do not react. Katamari's crowds run, and this one's should at least flinch.
- **No sound**, and the site is silent by standing decision, so the mode has none of the genre's
  best joke. §2 of PLEASURES.md is the precedent for what to do instead: show it.
- **The ball never gets stuck but it never struggles either.** There is no momentum and no
  friction — it moves at a speed and stops. A little inertia would make the big ball feel big.
  (The lurch over a stuck column, 2026-09-08, is the first step toward a ball that feels its
  own load.)
- **The crust is still one draw call per stuck thing.** 650 of them. Baking the crust into
  one merged geometry every few seconds would lift the cap to thousands.
- **Generic support answers only to removal.** A statue on a column that *settles* stays in
  the air; `Masonry._settle` should push the settled entry's `supports` down with it.
- **Nothing carries between rounds.** A record of the fastest wedding, kept in `localStorage`
  beside the lens set, would cost ten lines.

### 0e. Floor height is now available — go and use it
Added 2026-09-08. `Walker.floors` exists and Cythera's terraces are the only thing registered
on it. Everything else in the world is still flat, and several things that should not be:

- **the Temple of Venus's seven porphyry steps** — you walk through them;
- **the Polyandrion's crypt**, which is genuinely below the sward and reached by a stair you
  cannot climb;
- **the Great Portal's podium**, the palace slabs, the court, Polia's garden slab — all of them
  are "scenery, not ground" and were kept under half a metre for that reason. Several could
  now be their real height;
- **the Vaults**: the pits are lethal but flat, and the altars are steps you walk through.

None of it is broken as it stands. But the constraint that shaped it is gone, and the shapes
it forced are still there.

### 0. Work the coverage queue — 29 chapters have never been read against the world
Added 2026-09-07 after the vaults. `python scripts/coverage_seed.py && python
scripts/coverage_report.py`, then read `COVERAGE.md`. Nine chapters are enumerated (I, II, V,
VI, VII, XVII, XVIII, XIX, XXI); the other 29 are blind spots, not clean. **Prefer this queue
to inventing work**: it is the only artifact that can show a gap like the tunnels before Ted
does. Use `/research-chapter <numeral>` — one chapter per pass, and build nothing during it.

Known unbuilt features already in the ledger, in rough order of value:

- **The Rape of Proserpina relief** (ch. XIX, our pp. 280+) — the chapter's climax and the
  reason Poliphilo flees back to Polia. Nothing in the world marks it.
- **The three fruits taken and tasted** (ch. XVIII, our pp. 233–234, plate #85) — the rose
  bush is built; the communion is not staged.
- **The subterranean buttresses and vaulted halls** (ch. V, Dallington p. 87) — the crawl has
  corridors and pillars but no vaulted chambers.
- **Three-cubit hollyhocks** in the spheres' centres (ch. XXI, our p. 320).
- Jupiter's prayer (ch. I) and the harmony he hears (ch. II) — both dream-mode, and the
  second cannot be sound because the site is silent by design.

### 0b. Ted's standing brief, 2026-09-06 — closed

Full text moved to [`nextsteps/2026-09-closed.md`](nextsteps/2026-09-closed.md).
### 1. Finish dressing the buildings
`_drape()` exists; four hangings frame the throne in Eleuterylida's court and nothing else
in the world is dressed. Lefaivre's rule (`ARCHITECTURE.md` §0) is that cloth and precious
material **point** — they mark where the eye should go — so place them, don't spread them.

- Bare: the Temple of Venus, the theatre, the three doors.
- **Only where a source documents cloth.** Nothing documents hangings at the doors or in
  the theatre.
- **Done 2026-09-05:** the four teams' furniture and the curtain of Hymen — full text moved to [`nextsteps/2026-09-closed.md`](nextsteps/2026-09-closed.md).
- **Audit the gold** while there: move it off surfaces it merely gilds.
- **Audit the gold** while there: move it off surfaces it merely gilds.

### 2. The architecture the detail pass has not reached

*2026-09-05, "build everything": the Cythera theatre's own architecture (#147), the Triumph of
Cupid as a procession (#143–144), the Polyandrion's five medallions (#88–92, built as unread),
the Colossus as architecture, the water-labyrinth (ch. IX), the rite of Priapus (#71), the
miracle of the roses (#84), and a Book II precinct at (44, 22) — Diana's temple, Polia's
bed-chamber with the chariot-vision, the priestess enthroned — are all built. Remaining below
is only what still has no source located.*
Ted's standing goal: *"make sure we have all the parts we need of each fountain built and
displaying, and the same goes for all the other architectural features."*

- **Done 2026-09-05/06:** the Bridge, the Cythera theatre and the second FIVE_SENSES fountain — full text moved to [`nextsteps/2026-09-closed.md`](nextsteps/2026-09-closed.md).
- **Done 2026-09-05: the Temple of Venus** (#71–#85, fifteen plates, previously the largest
  documented absence in the world). Built at (-30, -21) from our own translation of chapters
  XVII–XVIII: seven porphyry steps, the black landing with its Cytherean-conch intaglio, the
  jasper door with the uncertain ΚΥΛΟΠΕΡΑ and its lodestone jambs, the eight-bay drum, the
  banded pavement and ten roundels, the crystal lamp with its four gem lamps, the lantern with
  its eight turning winds, ewer-vases, hollow triangle and the moon with an eagle in it — and
  **the rite: the mysterial cistern unsealed, and Polia's torch (#77) standing head-down in
  the water, still steaming**, with the Antistita in her mitre, Polia in her tutulus, and the
  seven virgins around them. Still unbuilt there: the sacrifice proper (#78–#83) and the
  **miracle of the roses** (#84), the rose-tree rising from the altar with its doves.
- **Done 2026-09-06:** the Triumph of Cupid, built as a car with its company.
- The **Polyandrion's five hieroglyphic medallions** (#88–#92). No reading of them exists
  anywhere in the corpus, so they can only be built as *unread* devices — worth doing, but
  the tour must say plainly that they are unread. Its two documented inscriptions (the
  `D · M · S ·` dedication and the owl-and-lamp `VITAE LETHIFER NVNTIVS`) are built.

### 3. The Colossus — specified, attempted, reverted
Full brief in `ARCHITECTURE.md`. The third of the piazza set that the sourcebook names
("the horse, the Colose, and the Elephant"); the horse and elephant are built. **Build it
as architecture, not as anatomy** — a vaulted hall in the rough outline of a body, entered
by a doorway framed as a mouth, which is what "hybrid sculpture/building" means and what
this toolkit can actually do. The supine-figure attempt read as a row of green domes.

### 4. Lefaivre, and the sources still unread
`md\Liane_Lefaivre_…Re_Cognizing_th.md` is 15,878 lines of readable prose, contrary to
what this file and `ARCHITECTURE.md` used to say.

- **Read 2026-09-06:** Lefaivre chapters 9-10 (six notes into the tour). Full text moved to [`nextsteps/2026-09-closed.md`](nextsteps/2026-09-closed.md).
- Still image-only and unread: O'Neill's *Allegory of Love*, the Da Capo facsimile, the
  Canone/Spruit emblematics volume.
- **Done 2026-09-07: Rhizopoulou 2016 fetched** (full text + Table 1 in `sources/rhizopoulou/`; 2022 is paywalled, 2017 members-only — abstracts captured) and built from: see `15scholars.md` §6 and `PLANTS.md` §1b. Was: the only
  scholarship treating the HP as a botanical document, and `PLANTS.md` needs it. Findable
  open-access. Cite her only as bibliography until someone fetches them.

### 5. The marginalia not yet used
**Closed 2026-09-06** — every hand in the census (Siena, Sydney, Como, Modena, Jonson, plus Buffalo A/B/D/E and Chigi) is now in the tour. Full record of what each copy is moved to [`nextsteps/2026-09-closed.md`](nextsteps/2026-09-closed.md).

### 5b. The Vaults (built 2026-09-07) — what is not in it yet
The crawl under the pyramid is playable (`src/scenes/VaultsScene.js`, entry card *The Vaults*).
Built from Dallington pp. 82–87; see `DECISIONS.md`. Open, in rough order of value:
- **No sound**, per the site-wide silence rule — but the chapter is all about *listening*
  ("with my watchfull and attentiue eares, listning if the horrible monster… were drawing
  towards mee"). If the silence rule is ever relaxed, this is the place it earns its keep.
- The dragon is a single hunter with one behaviour. The chapter also has him *imagining* it
  overhead; a false alarm now and then would be faithful and cheap.
- Nothing to find but lamps. The book's own furniture down there — the "large foundations,
  and fearefull vaultes, and subterraneal buttresses" — is not modelled as rooms.
- No touch controls tuning for the crawl; the stick works but the map is hidden below 520px.

### 6. Book II has no geography
Its thirteen stops are staged at the dream stations whose meaning they answer, and each
says so — but the temple of Diana, Polia's bed-chamber and the priestess's throne are named
in plates #152–#168 and modelled nowhere. **A decision is needed** on whether Book II ever
gets ground of its own.

### 7. Smaller, still open
- **Done 2026-09-06:** the five-senses bath-house and the water-labyrinth of ch. IX are both built.
  book's clearest single allegory — are not built; their stops are staged elsewhere.
- **Done 2026-09-07:** the Temple of Venus rite.
- **Done 2026-09-06:** the Great Portal and Three Doors plates, and the elephant/bridge sign transcriptions. Full text of both moved to [`nextsteps/2026-09-closed.md`](nextsteps/2026-09-closed.md).
- **The lexicon has now been checked against the world** (2026-09-05). Of the 101 terms,
  **39 name a thing rather than an idea** — the Architecture, Gardens, Places, Material
  Culture, Processions and Characters categories. Thirty-four of the thirty-nine are built:
  the bath, all three column orders, the fountains, the obelisks, the portal (which *is* the
  stepped pyramid), the sleeping-nymph fountain, the triumphal gate, Cythera and its circular
  garden, the elephant and obelisk, three pergolas, the topiary, the river and its bridges,
  the dark forest, the ruined temple, the voyage, the procession, and all seven named
  characters. Porphyry, jasper, chalcedony, gold and silk are all now on something. **Five are
  not built**, and four of them are already on this list:

  | missing | where it stands here |
  |---|---|
  | **Sacrifice to Priapus** (#71) | **NEW — not previously on this list.** A *full-page* woodcut, nineteen female and five male figures, the ass offered to the garden-god. It is in `gallery.json` and in the lexicon, and has no geometry. It is also the book's most explicit image, so **whether it belongs in the walkable world at all is Ted's call, not mine** — flagged, not built. |
  | **Labyrinth** (ch. IX) | item 7 below; the dream narration already promises it ("a labyrinth of water where the boats go always forward and never back") and the world does not have it. The clearest single allegory in the book. |
  | **Amphitheatre** (#147) | item 2. The theatre of Venus exists as terraces with the heptagonal fountain at their centre; the theatre's own architecture does not. |
  | **Colossus** | item 3. |
  | **Mosaic / *asaroton*** | **done 2026-09-05** — drawn as an annulus of strewn tesserae under the temple's aisle, which is what an "unswept floor" is. |
- **Done 2026-09-06:** the Atalanta material archived off `main` (≈93 MB) to the `atalanta-archive` branch. The repository is still called **EmblemsIn3d**; only the *displayed* name changed, Ted's call. Full text moved to [`nextsteps/2026-09-closed.md`](nextsteps/2026-09-closed.md).

---

## Done

Full record of everything closed on 2026-09-04/05 moved to [`nextsteps/2026-09-closed.md`](nextsteps/2026-09-closed.md).