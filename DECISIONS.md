<!-- tokens: ~4,517 · read for: the index of every directional call -->
# Design decisions — Emblems in 3D

Directional calls made mid-build, recorded so they don't get re-litigated. Newest first.

> **This file is the INDEX plus the newest few entries in full.** The complete text of every decision is in [`decisions/2026-09.md`](decisions/2026-09.md).
>
> It was one file of ~33 500 tokens on 2026-09-08, which made the ordinary opening move — router, queue, ledger — cost about 45 000 tokens before a line of code was read. Splitting by date was no help: all 47 entries were written inside six days, so the volume is pace and not staleness. It is split by role instead. `ENGINEERING.md` §2c.
>
> **Recording a new decision:** put the full entry at the top of `decisions/2026-09.md`, add its line to the index below, and — if it is one of the newest few — leave it here in full too.

---

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

*49 calls. Each links to its full text in the archive.*


**2026-09-09**

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
