<!-- tokens: ~4,754 · read for: the index of every directional call -->
# Design decisions — Emblems in 3D

Directional calls made mid-build, recorded so they don't get re-litigated. Newest first.

> **This file is the INDEX plus the newest few entries in full.** The complete text of every decision is in [`decisions/2026-09.md`](decisions/2026-09.md).
>
> It was one file of ~33 500 tokens on 2026-09-08, which made the ordinary opening move — router, queue, ledger — cost about 45 000 tokens before a line of code was read. Splitting by date was no help: all 47 entries were written inside six days, so the volume is pace and not staleness. It is split by role instead. `ENGINEERING.md` §2c.
>
> **Recording a new decision:** put the full entry at the top of `decisions/2026-09.md`, add its line to the index below, and — if it is one of the newest few — leave it here in full too.

---

## 2026-09-21 — 67. Call 54 is partly reversed: the world shrinks back down, and gaps grow only when a building needs them

*Reverses the SPACING half of call 54, keeps the SCALE half. Full text in
[`decisions/2026-09.md`](decisions/2026-09.md).*

Ted, after walking the deployed true-scale build: *"I think I've changed my mind about having
things super spread out. I'd like to go back to the relatively smaller island, although we
should move things apart as necessary as we add more buildings. Highest priority is to make
sure all the scenes of the woodcuts have analogs in our virtual world. And we have a lot of
work to do making the buildings beautiful and the gardens filled with plants that look like
the plants named in the novel or our scholarship."*

Monument and garden SIZE against the book's own numbers stays true scale (the pyramid is still
1,139.6 m). The one-stadium (185 m) DEFAULT GAP invented between every unstated precinct —
what actually made the walk "mostly empty spaces" — drops to 30 m (`THRESHOLD`), with a 75 m
tier kept for the two gaps that carry real textual "distance in words." The valley's reveal
approach halves (10→5 stadia) and the crossing trims (6→4). Cythera, named specifically,
scales to 45% of its literal 1,400 m diameter with all internal ring proportions preserved.
Standing priority becomes: `research/coverage.json`'s 246 unbuilt / 42 partial features first
(every woodcut gets an analog), then a building-beauty pass, then species-true garden
planting. The true-scale infill tickets are reprioritised, not discarded.

## 2026-09-20 — 65. One Controls button and panel for every mode, not seven ad hoc places

*Ted: "I want to make sure that there are keyboard commands and mouse inputs and that there
is a button for 'controls' that brings up a panel that explains the controls that you can
toggle on and off. Make sure the interface makes sense." Full text in
[`decisions/2026-09.md`](decisions/2026-09.md).*

One `Controls` button in `#world-nav` — the one chrome constant across every mode, checked
live before deciding — folding the dragon's two hard-written cards into it and demoting roll
mode's permanent footer to a one-line cue. Content comes from one `CONTROLS` table in
`main.js`, swapped per mode, not seven duplicated HTML blocks. **Dispatching the keys live,
not reading the code, found and fixed four real bugs**: the walker's and dragon's bounds were
never widened for Stage 2's 13.7 km world, so most digit-key teleports snapped you back on
the first step; Gallery's Esc was a dead empty branch; `ShiftRight` didn't dash in roll mode.
Tickets `bug-walker-bounds-stale-after-stage-2`, `bug-dragon-bounds-stale-after-stage-2`,
`bug-gallery-esc-does-nothing`, `bug-roll-shiftright-no-dash`,
`debt-dream-mode-no-keyboard-choice`.

## 2026-09-20 — 63. Roll mode's camera falls behind the ball's growth, Katamari-style

*Settles `question-roll-camera-curve`. Full text in [`decisions/2026-09.md`](decisions/2026-09.md).*

Ted: *"I want the camera to behave like it does in Katamari Damacy, zooming out when the
ball grows so that you can see the bigger things you are becoming able to roll up."*
`tune.camBase`/`tune.camScale` default 0/6 → **1.2/2.0** in `src/systems/RollUp.js` — the
camera falls behind growth instead of holding a constant frame fraction, at the cost of a
third the view at full size. Both curves stay live-flippable for comparison.

*(Decision 64, the wedding fanfare: Ted said no — index only, see above.)*

## 2026-09-20 — 60. Stage 2 of the true scale: the world moves by precinct, not by literal

*Executes call 54. Full text in [`decisions/2026-09.md`](decisions/2026-09.md).*

Ted chose **full stage 2 — everything onto `research/plan.json`** and **build the pyramid square,
and move the north.**

**The method is the whole of it.** Stage 1 multiplied every station by four and re-typed a hundred
literals inside the builders to match. Stage 2 is 13.7 km and **re-types nothing**: each precinct
is built inside a `_placeAt` group carrying a rigid shift computed by `scripts/plan_sites.py` from
the plan, so a builder's interior coordinates stay as authored and the precinct arrives on the plan
underneath them. Geometry, colliders, walker floors and NPCs all ride the group.

This is the answer to `HANDOVER.md` §4.3, which has now bitten in four costumes — the hand-copied
spawn, the meadow's clearance map, **the dream mode's paths** (it had been walking the dreamer a
quarter of the way to everything it named since stage 1), and the triumph cars' moving colliders.
All four fixed the same way: `shiftOf(key)` and `toWorld(key, x, z)`, both generated.

The pyramid is **square** — 1,139.6 m of base, 1,410 courses of 0.56, 789.6 m to the cube and about
965 to the nymph — and the valley's neck is derived from it, so the gate can never be wider than
the valley it shuts.

## 2026-09-20 — 61. The triumph cars are four cars, not one car four times

*Full text in [`decisions/2026-09.md`](decisions/2026-09.md).*

Each car gets the two stones the book gives it (emerald/diamond, agate/sapphire,
chrysolite/heliotrope, asbestos/carbuncle), each gets its own rider livery, and **the fourth gets
no riders at all** — the book withholds them because Semele's urn is what rides that car. The urn
is built, with its four eagles, its jacinth vessel, its topaz vine and its holy ash, and the
golden vine that grows out of it and roofs the team.

## 2026-09-20 — 62. `node --check` is not a syntax gate for ES modules

*Full text in [`decisions/2026-09.md`](decisions/2026-09.md).*

On node 24 it exits 0 for a genuine syntax error in a module, and it did, dozens of times, before
one invalid object literal reached the running page. `scripts/parsecheck.mjs` replaces it by
importing the file. **A check you have not seen fail is not a check.**

## 2026-09-17 — 54. The world is rebuilt at the book's own scale

*Reverses call 3 of 2026-09-09. Full text in [`decisions/2026-09.md`](decisions/2026-09.md).*

Ted: *"I feel like we still don't have all the structures that Poliphilo visits in the novel,
and our dream garden is still too cramped. I'd like to spread everything out and make sure we
build everything that's in the novel."* Offered true scale, true-distances-with-capped-monuments,
or a uniform 1 : 2, he chose **true scale, 1 : 1, staged**.

The measurement that settles the argument: the mainland holds all 18 of its stations inside
**77 × 105 m**, while the book gives the green enclosure before the palace **88.8 m** on its own
— and **nine pairs of stations physically overlap**, the worst by 12.8 m. The monuments are built
at ~1 : 60 and the gardens at ~1 : 12, so the compression is **not uniform**: the world reads as
crowded rather than as small, which is the worse of the two.

Staged, in this order, and no precinct is moved twice: **the plan as data first** (one siting
table, every separation sourced and marked *stated* or *ours*), **then precincts translate whole**
via `_placeAt`, which already carries plaques and colliders with the geometry, **then the
monuments grow** into the room the plan made.

The blocker `DIRECTIONS.md` §6A names — a ±58 m shadow frustum — **was already fixed on
2026-09-08** and §6A is stale: the shadow box tracks the walker at ±118 m with `far = 700`.
The real question at true scale is whether a *tracking* box of that size still covers the
largest thing standing next to you, and the pyramid is 1 140 m wide.

## 2026-09-17 — 55. Book II is built as a second place, not narrated at one station

*Full text in [`decisions/2026-09.md`](decisions/2026-09.md).*

Chapters XXV–XXXVIII get real ground — Treviso, the temple of Diana, Polia's chamber, the river
Sile — not one station with commentary. **A told room is geometry**: the reading rule the
researchers now work under, because Book II was half-invisible to the ledger for the same shape
of reason chapter V's vaults were. Not a missing plate this time but a missing *kind* — nobody
had decided narrated places were buildable, so nobody enumerated them as places.

## 2026-09-09 — Version 5 shipped, and what it settled

*Written after the fact, so the next reader does not have to reconstruct it from six commits.
Live at https://t3dy.github.io/EmblemsIn3d/src/ at `main.js?v=330`, verified on the deployed
page and not only on the origin — see the new gotcha in `DEPLOY_STATE.md`.*

**Built and verified:** the dream now opens on the spacious plain as chapter I does; the wood
takes your speed and gives it back; the way out of the wood is said in Poliphilo's own voice
for the first time; the ball keeps what it eats and grows on a measured curve; the figures
stand in contrapposto; the beasts have species silhouettes; the 1499 plate can be opened in a
frame beside the commentary; the three mute approach stations speak; and the gardens of glass
and silk are built with Hunt's objection to building them printed in their own lede.

**Two things this pass settled that were not on anybody's list:**

1. **Draw calls are a property of the VIEW, not of the world.** The dark wood is 3 124; the
   spacious plain is 68. Every previous hunt for "the slow thing" was looking for one
   expensive object; there is one expensive *place*. `ENGINEERING.md` §1a was corrected.
2. **A tuning value you cannot measure is a tuning value you will get wrong.** The first
   attempt at the roll-up growth curve cut `BITE` and the packing loss together — precisely
   what `ROLLING.md` §1 warns against — and stalled the ball at 0.97 m after seven simulated
   minutes. The dials are live on `roll.tune` now, the curve is swept headlessly in a second,
   and the shipped values were read off a table rather than judged. **That pattern is the
   one to copy**: if a number matters, make it observable before you argue about it.

## 2026-09-09 (later) — What this project is, and four things that follow

Ted, unprompted and in one message. **The first paragraph outranks everything else in this
file**, because it settles the class of argument that produced the 1 : 8 proposal, the
renderer refactor and the pace change all in one day:

> *"The primary goal for this project is not to create a commercial video game experience but
> rather to create a **digital humanities product that has educational and meditative
> purposes**. So I don't want to sacrifice space for speed just to get the player around in
> the world faster. We can always give the player the ability to run or fly or teleport or
> whatever if they're getting impatient and want a quick tour."*

### 1. Space is never traded for speed. Impatience is answered with options, not compression.

This **revises call 2 of this morning**. Pace is still bought with speed and never by
reordering or shortening — but the speed is now an **option offered to the player**, not a
global tuning of how fast everyone walks. Run, fly and teleport already exist; the answer to
"this is taking too long" is to make those discoverable, not to shrink the world or hurry the
walker. The 2026-09-09 change to `runSpeed` (10 → 16 open, 9 under the trees) stands, because
it added an option and shrank nothing — but no further pace work may cost a metre of ground.

### 2. Everything in the world must be roll-up-able.

> *"I want everything in the world of our virtual dream garden to be roll up able. All of the
> architecture needs to be built out of individual objects (blocks of marble, wooden beams, or
> whatever is being used in Renaissance Architecture) that follows a katamari like logic."*

**This closes the merge question permanently and in the opposite direction.** The object count
is meant to go **up**, not down; `scene._monoliths` is the standing to-do list of everything
not yet built out of pieces, and `systems/Masonry.js` is how it gets done. `DRAWCALLS.md`
explains what this costs and why it is the right cost for this project. Ted has separately
noted he *might* one day separate Roll mode from the virtual world — that split, and not any
renderer trick, is the only way both goals are ever fully met, and it is his call to make.

### 3. Roll Up is not enough like Katamari. Three faults, named.

> *"I feel like it grows too quickly, and the items being rolled up still don't remain visible
> and deforming the ball as they did in the katamari damacy games."*

Diagnosed in full in [`ROLLING.md`](ROLLING.md). The structural one: **our crust absorbs.**
Every swallowed thing sinks flush over 6–32 s and disappears inside the ball. In Katamari
nothing ever sinks — the ball's silhouette *is* the objects, permanently. That single
behaviour, not any tuning value, is why the mode does not feel right, and the fix is one line
(`depth` capped below 1). Growth is a second, separate problem: the packing loss of 0.42 and
`BITE` of 0.58 are both generous.

### 4. The figures look wrong.

> *"All the humanoid and animal figures you've created look like shit."*

[`HUMANOIDS.md`](HUMANOIDS.md) and [`ANIMALS.md`](ANIMALS.md) §4 written the same day. The
finding worth carrying: **the humans look wrong because they stand wrong, not because they
are made of spheres** — there is no contrapposto anywhere in the world, and every figure has
its hip line, shoulder line, spine and gaze all parallel, which is the definition of a
mannequin and the opposite of every Renaissance figure. The animals fail differently: one
proportion table serves every species, and silhouette *is* species.

Both files also record that in the **woodcut register** primitive-built figures are not a
failure but the idiom, so part of the complaint may only apply to the lit world.

## 2026-09-09 — Four calls: fidelity, pace, monument scale, and the artificial gardens

Put to Ted with the performance measurements in hand (`ENGINEERING.md` §1). All four answered
the same day. **These outrank the recommendations they overrule**, including `DIMENSIONS.md`
§5's 1 : 8 proposal and the whole of `ENGINEERING.md` §1c.

### 1. The renderer is not to be refactored. *"Actually just don't change any of that — it's not going so slow that I want to do that."*

3 124 draw calls, ~26 fps and 2 124 wasted materials are **accepted**, deliberately and with
the numbers on the table. So:

- `perf-material-dedup`, `perf-shadow-casters` and `perf-merge-static` are **declined**, not
  deferred. Do not re-propose them. Roll Up keeps its vocabulary of named individual objects,
  which is what the merge would have cost.
- **`hpDiag()` stays**, and so does rule 7 — but the budget is no longer 1 500 calls and
  16.7 ms. It is now a **regression** budget: *don't make it materially worse than the reading
  you started from.* Take a before/after and put both in the commit. A pass that adds 15 % is
  a conversation; a pass that adds 100 % is a defect.
- This unblocks `feat-plain-composed-absence`, which was blocked only on the refactor. Build
  it — cheaply, and with a reading.

### 2. Follow the novel to the letter. Solve pace with speed, not with cutting.

*"So the idea is that we are taking the player on a tour of the novel. We can speed up some of
the walking to keep it from taking too long, but we need to be following the novel to the
letter."*

**This is the governing principle of the whole world and it settles a class of question, not
one question.** Where the book's sequence and the player's convenience conflict, the sequence
wins and the convenience is bought with **movement speed**. Never by reordering, never by
compressing the plan, never by dropping a stage.

Two immediate consequences:

- **The dream opens on the spacious plain**, as chapter I does — green, flowered, silent,
  empty of every living thing — and the wood is walked *into*. It has been opening in the
  middle of the wood since the world was built. That was the convenient choice and it is now
  the wrong one.
- **Traverse gets faster.** Shift-to-run (10 m/s) already exists and is not enough for an
  approach of 188 m and a plain beyond it. The pace budget is a design problem in its own
  right, and it is the *only* sanctioned answer to "this takes too long".

### 3. Scale: rescale the monuments where they stand. Leave the ground plan alone.

`DIMENSIONS.md` §5 recommended one ground-plan scale of 1 : 8 — the mainland from 88 × 100 m
to ~700 × 800 m. **Declined.** What is approved is the third option: bring the monuments that
are most grotesquely undersized toward their stated size *in the plan they already occupy* —
the pyramid-portal (17.5 m against a stated 1 140), the recumbent colossus (~8 m against 89),
Polia's garden (14 m across against 141).

The known cost, accepted: the walk between stations the book separates by four stadia stays
short. Per call 2, that is a **speed** problem, not a plan problem.

The known constraint, to be solved and not designed around: the valley cliffs converge to
**44 m at the piers** against a portal spanning 38. Any pyramid materially wider than that
needs the cliffs moved with it, or the book's own absolute — *"no man could go further forward
or backe againe"* — quietly stops being true again.

### 4. The three artificial gardens: build them, and let the commentary say Hunt disagreed.

The glass, the silk and the counterfeit scent (`GARDENS.md` §3). Hunt argues that illustrating
them damages them, and both the 1499 and the 1592 decline to. **Ted: build them anyway, and
carry the argument in the notes.** The dimensions are in `DIMENSIONS.md` §3 — glass cypresses
at 2 paces (2.96 m), the box at 1 pace (1.48 m).

The note is not optional and it is not a hedge: it is the one place in this world where the
commentary gets to argue with the geometry standing in front of it, and it must name Hunt and
say plainly that both early editions withheld what you are looking at.

---

## The index — every decision, newest first

*66 calls. Each links to its full text in the archive.*


**2026-09-20**

- [66. The Temple of Venus's crown is set to the diameter: p. 197 governs](decisions/2026-09.md#2026-09-20--66-the-temple-of-venuss-crown-is-set-to-the-diameter-p-197-governs) — roof rise R/2 → **D/3**; crown 11.07 → 12.4 m; both readings are the book's, this answers "the roof is too low"
- [65. One Controls button and panel for every mode, not seven ad hoc places](decisions/2026-09.md#2026-09-20--65-one-controls-button-and-panel-for-every-mode-not-seven-ad-hoc-places) — the audit that came with it found and fixed four real live bugs: stale walker/dragon bounds after Stage 2, a dead gallery Esc, ShiftRight not dashing in roll mode
- [64. No wedding fanfare — the 2026-09-04 silence rule stands](decisions/2026-09.md#2026-09-20--64-no-wedding-fanfare--the-2026-09-04-silence-rule-stands) — asked directly, Ted said no; `AlchemicalAudio.fanfare('wedding')` stays a documented no-op
- [63. Roll mode's camera falls behind the ball's growth, Katamari-style](decisions/2026-09.md#2026-09-20--63-roll-modes-camera-falls-behind-the-balls-growth-katamari-style) — `tune.camBase`/`camScale` default 0/6 → **1.2/2.0**; the ball swells in frame as it grows, at the cost of a third the view at full size
- [60. Stage 2 of the true scale: the world moves by precinct, not by literal](decisions/2026-09.md#2026-09-20--60-stage-2-of-the-true-scale-the-world-moves-by-precinct-not-by-literal) — **executes call 54**; 13.7 km, 23 precincts, and **not one interior coordinate re-typed**; the pyramid is square at 1 139.6 m and the valley's neck is derived from it
- [61. The triumph cars are four cars, not one car four times](decisions/2026-09.md#2026-09-20--61-the-triumph-cars-are-four-cars-not-one-car-four-times) — each car's own two stones and its own livery; **the fourth car has no riders**, because Semele's urn is what rides it, and the urn is built
- [62. `node --check` is not a syntax gate for ES modules](decisions/2026-09.md#2026-09-20--62-node---check-is-not-a-syntax-gate-for-es-modules) — it exits 0 on a real error; use `scripts/parsecheck.mjs`. **A check you have not seen fail is not a check.**

**2026-09-17**

- [54. The world is rebuilt at the book's own scale](decisions/2026-09.md#2026-09-17--54-the-world-is-rebuilt-at-the-books-own-scale-this-reverses-call-3-of-2026-09-09) — **reverses call 3 of 2026-09-09**
- [55. Book II is built as a second place, not narrated at one station](decisions/2026-09.md#2026-09-17--55-book-ii-is-built-as-a-second-place-not-narrated-at-one-station)
- [56. Stage 1 of the true-scale plan built: SPREAD = 4](decisions/2026-09.md#2026-09-17--56-stage-1-of-the-true-scale-plan-built-spread--4)
- [58. Roll mode’s HUD says where you are on the ladder; the wedding takes two seconds; the fanfare stays silent](decisions/2026-09.md#2026-09-20--58-roll-modes-hud-says-where-you-are-on-the-ladder-the-wedding-takes-two-seconds-the-fanfare-stays-silent) — the gauge’s ruler is **linear** and the crowding at the bottom is the ladder’s own shape; the fanfare is refused under the 2026-09-04 silence call and filed as a question; `tune.camBase`/`camScale` exist, defaults unchanged
- [57. The roll-mode build that landed in the Atalanta repo is abandoned, not ported; its page stays up](decisions/2026-09.md#2026-09-20--57-the-roll-mode-build-that-landed-in-the-atalanta-repo-is-abandoned-not-ported-its-page-stays-up) — **zero lines salvaged**; the handover's own baseline was wrong in four places
- [59. There are two page numberings, ten pages apart; and a page is placed by opening the scan, not by trusting a column](decisions/2026-09.md#2026-09-20--59-there-are-two-page-numberings-ten-pages-apart-and-a-page-is-placed-by-opening-the-scan-not-by-trusting-a-column) — our translation page = `hp.db` `page_seq` **+ 10**, one constant, **no step at the Book I/II seam**; `hp.db` is authoritative for *what* a plate shows and unreliable for *where* it sits — `woodcut_catalog.page_seq` is LLM subject-matched (±2 pages) and `page_concordance.section` is 116 pages out at Book II

**2026-09-13**

- [53. The gardens of glass and silk flank the Queen's palace, at half the book's compass](decisions/2026-09.md#2026-09-13--53-the-gardens-of-glass-and-silk-flank-the-queens-palace-at-half-the-books-compass)

**2026-09-10**

- [Release Version 6](decisions/2026-09.md#2026-09-10--release-version-6) — and why there is no v5

**2026-09-09**

- [The piazza moves. The monuments stand before the porch.](decisions/2026-09.md#2026-09-09-later-still--51-the-piazza-moves-the-monuments-stand-before-the-porch)
- [The nymphs get bodies, and rule 7 gets a reading](decisions/2026-09.md#2026-09-09-later-still--the-nymphs-get-bodies-and-rule-7-gets-a-reading)
- [The dream does not have to add up](decisions/2026-09.md#2026-09-09-later-still--the-dream-does-not-have-to-add-up)
- [The Great Portal at scale, and the wall that was never there](decisions/2026-09.md#2026-09-09-later--the-great-portal-at-scale-and-the-wall-that-was-never-there)
- [The reading mode, and the wolf changes hands](decisions/2026-09.md#2026-09-09--the-reading-mode-and-the-wolf-changes-hands)
- [Version 5 shipped, and what it settled](decisions/2026-09.md#2026-09-09-version-5-shipped-and-what-it-settled)
- [What this project is, and four things that follow](decisions/2026-09.md#2026-09-09-later-what-this-project-is-and-four-things-that-follow)
- [Four calls: fidelity, pace, monument scale, and the artificial gardens](decisions/2026-09.md#2026-09-09-four-calls-fidelity-pace-monument-scale-and-the-artificial-gardens)

**2026-09-08**

- [The wood and the approach, built](decisions/2026-09.md#2026-09-08-the-wood-and-the-approach-built)
- [The world is too small: a research pass on scale, layout and the wood](decisions/2026-09.md#2026-09-08-the-world-is-too-small-a-research-pass-on-scale-layout-and-the-wood)
- [Release Version 4](decisions/2026-09.md#2026-09-08-release-version-4)
- [Roll Up: the crust stays on, the ball lurches, two control schemes, and everything falls](decisions/2026-09.md#2026-09-08-roll-up-the-crust-stays-on-the-ball-lurches-two-control-schemes-and-everything-falls)
- [The Dream ends Book I where Colonna did: a thirteenth stop, and a jump](decisions/2026-09.md#2026-09-08-the-dream-ends-book-i-where-colonna-did-a-thirteenth-stop-and-a-jump)
- [Every addition is thought through in all five modes, and written up](decisions/2026-09.md#2026-09-08-every-addition-is-thought-through-in-all-five-modes-and-written-up)
- [Chapter X: the banquet, laid in the court at last](decisions/2026-09.md#2026-09-08-chapter-x-the-banquet-laid-in-the-court-at-last)
- [Chapter XX: the boat of the crossing, out of the ledger again](decisions/2026-09.md#2026-09-08-chapter-xx-the-boat-of-the-crossing-out-of-the-ledger-again)
- [The floors are littered, in Roll Up only, and every object is in the book](decisions/2026-09.md#2026-09-08-the-floors-are-littered-in-roll-up-only-and-every-object-is-in-the-book)
- [The buildings are made of stones, and taking one out has consequences](decisions/2026-09.md#2026-09-08-the-buildings-are-made-of-stones-and-taking-one-out-has-consequences)
- [Chapter XXIV: the ledger found the last station of Book I](decisions/2026-09.md#2026-09-08-chapter-xxiv-the-ledger-found-the-last-station-of-book-i)
- [Roll Up gets an ending, and the ending was already in the database](decisions/2026-09.md#2026-09-08-roll-up-gets-an-ending-and-the-ending-was-already-in-the-database)
- [Roll Up: the world had to be made of things again](decisions/2026-09.md#2026-09-08-roll-up-the-world-had-to-be-made-of-things-again)
- [The walker learns about height, and Cythera gets its section](decisions/2026-09.md#2026-09-08-the-walker-learns-about-height-and-cythera-gets-its-section)
- [Cythera gets its twenty divisions, and the world gets its one map](decisions/2026-09.md#2026-09-08-cythera-gets-its-twenty-divisions-and-the-world-gets-its-one-map)
- [Hedges, rills, the shaded walk, and four wrong guesses about a white blob](decisions/2026-09.md#2026-09-08-hedges-rills-the-shaded-walk-and-four-wrong-guesses-about-a-white-blob)

**2026-09-07**

- [Aerial perspective and the pigment shelf of 1499](decisions/2026-09.md#2026-09-07-aerial-perspective-and-the-pigment-shelf-of-1499)
- [The garden's pleasures, taken from what Poliphilo says](decisions/2026-09.md#2026-09-07-the-gardens-pleasures-taken-from-what-poliphilo-says)
- [GitHub Pages is the only host; Vercel retired](decisions/2026-09.md#2026-09-07-github-pages-is-the-only-host-vercel-retired)
- [Poliphilo speaks as a commentary layer of his own](decisions/2026-09.md#2026-09-07-poliphilo-speaks-as-a-commentary-layer-of-his-own)
- [The gardens: realism was parameters, fidelity was geometry](decisions/2026-09.md#2026-09-07-the-gardens-realism-was-parameters-fidelity-was-geometry)
- [Coverage is tracked chapter by chapter, not plate by plate](decisions/2026-09.md#2026-09-07-coverage-is-tracked-chapter-by-chapter-not-plate-by-plate)

**2026-09-06**

- [Architecture against the text, station by station](decisions/2026-09.md#2026-09-06-architecture-against-the-text-station-by-station)

**2026-09-07**

- [The sacello: the rite moved to where the book holds it](decisions/2026-09.md#2026-09-07-the-sacello-the-rite-moved-to-where-the-book-holds-it)
- [The Vaults: chapter V as a crawl](decisions/2026-09.md#2026-09-07-the-vaults-chapter-v-as-a-crawl)
- [The commentary obeys its own × , and the flight keys are cards](decisions/2026-09.md#2026-09-07-the-commentary-obeys-its-own-and-the-flight-keys-are-cards)
- [The dragon is one shape, three times](decisions/2026-09.md#2026-09-07-the-dragon-is-one-shape-three-times)
- [A fourth way in: fly the dream as the dragon](decisions/2026-09.md#2026-09-07-a-fourth-way-in-fly-the-dream-as-the-dragon)
- [Rhizopoulou fetched; the ground flora is the book's](decisions/2026-09.md#2026-09-07-rhizopoulou-fetched-the-ground-flora-is-the-books)
- [The woodcut register is bracketed](decisions/2026-09.md#2026-09-07-the-woodcut-register-is-bracketed)
- [The woodcut register draws the same trees as the garden](decisions/2026-09.md#2026-09-07-the-woodcut-register-draws-the-same-trees-as-the-garden)
- [The floating-slab sweep, by measurement](decisions/2026-09.md#2026-09-07-the-floating-slab-sweep-by-measurement)

**2026-09-05**

- [The Temple of Venus, and the walker has no floor height](decisions/2026-09.md#2026-09-05-the-temple-of-venus-and-the-walker-has-no-floor-height)
- [The chess pieces wear the book's costumes, not Russell's (Ted)](decisions/2026-09.md#2026-09-05-the-chess-pieces-wear-the-books-costumes-not-russells-ted)
- [The Human Chess Match, built from the margins (Ted)](decisions/2026-09.md#2026-09-05-the-human-chess-match-built-from-the-margins-ted)
- [The site is the Hypnerotomachia alone (Ted)](decisions/2026-09.md#2026-09-05-the-site-is-the-hypnerotomachia-alone-ted)
- [The tour covers the whole book; the system files become a router (Ted)](decisions/2026-09.md#2026-09-05-the-tour-covers-the-whole-book-the-system-files-become-a-router-ted)
- [Art direction: a Botticelli panel you can walk into (Ted)](decisions/2026-09.md#2026-09-05-art-direction-a-botticelli-panel-you-can-walk-into-ted)
- [Every asset gets swappable variants; imported scans allowed (Ted)](decisions/2026-09.md#2026-09-05-every-asset-gets-swappable-variants-imported-scans-allowed-ted)

**2026-09-04**

- [The site is SILENT. No audio anywhere. (Ted)](decisions/2026-09.md#2026-09-04-evening-final-the-site-is-silent-no-audio-anywhere-ted)
- [`hidden` must always win in the app's CSS](decisions/2026-09.md#2026-09-04-evening-hidden-must-always-win-in-the-apps-css)
- [Creative brief for the whole work (Ted)](decisions/2026-09.md#2026-09-04-creative-brief-for-the-whole-work-ted)
- [Figures, Gallery, and aesthetic scope (Ted)](decisions/2026-09.md#2026-09-04-figures-gallery-and-aesthetic-scope-ted)

**2026-09-08**

- [The mode chooser could not be reached (bug fix, after v4)](decisions/2026-09.md#2026-09-08-the-mode-chooser-could-not-be-reached-bug-fix-after-v4)
