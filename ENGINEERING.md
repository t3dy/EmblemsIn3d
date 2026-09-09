# ENGINEERING — how this project is built, measured, and handed over

*Opened 2026-09-08, from Ted's brief: get formal about systems engineering, test-based
development and agile ticketing; improve the corpus-to-world pipeline; produce artifacts that
other LLM agents can build from; and fix two things that are getting worse — **the world is
slow in the browser** and **the instruction set is eating the context window**.*

**This file is measurements first and proposals second, and it says which is which.** Every
number below was taken on 2026-09-08 with a real instrument, not estimated. The project has
been writing down estimates for months (`NEXTSTEPS.md` §0c: *"draw calls are ~1500 a frame"*)
and an estimate cannot be regression-tested. The real figure is **3 124**.

Companions: [`ROUTER.md`](ROUTER.md) routes a task to its documents; `HPTOTOURPIPELINE.md`
is the corpus-to-world pipeline; `DECISIONS.md` is the ledger of directional calls. This file
governs *how* work is done, not *what* is built.

---

## 1. The performance budget

### 1a. What was measured

`await hpDiag()` from the browser console — added to `src/main.js` on 2026-09-08 and the
first instrumentation this project has ever had. Standing still in the dark wood, lit style,
1280 × 720, `pixelRatio` 1:

**One correction, added 2026-09-09 and important enough to lead with:** these numbers are
the DARK WOOD, which is the most expensive view in the world — you are standing inside a
hundred and ninety trees with four leaf shells each and nothing culls. Standing on the
spacious plain the same instrument reports **68 draw calls**. Cost here is a property of the
view, not of the world, which is why earlier hunts for one expensive object found nothing.
There is no expensive object. There is one expensive place. See `DRAWCALLS.md` §1.

| | measured (dark wood) | note |
|---|---|---|
| **draw calls / frame** | **3 124** | previously believed to be ~1 500; the plain is 68 |
| triangles / frame | 2 923 148 | includes the shadow pass |
| frame time | **37 – 40 ms** | ⇒ **≈ 26 fps**, three clean samples |
| meshes in scene | 3 688 | of which **11** are instanced |
| shadow casters | **1 194** | each draws a second time |
| scene triangles | 2 000 734 | geometry actually held |
| vertices | 2 445 175 | |
| unique geometries | 3 681 | |
| **material objects** | **2 932** | |
| **distinct material signatures** | **808** | |
| **wasted materials** | **2 124** | duplicates, 72 % of all materials |
| textures | 378 | most generated at run time by `_dress` |
| shader programs | 39 | |

### 1b. The diagnosis, and it is not what the file thought

**The draw calls are the cost, and they decompose exactly:** ~1 930 visible meshes + 1 194
shadow casters = 3 124. Nothing is batched, because Three.js can only batch across meshes that
share **both** a geometry and a material object, and this scene shares almost neither.

**The root cause is one function.** `HPStyles.mat()` (`src/shaders/HPStyles.js:218`) does:

```js
mat({ color = 0x8a7a5a, roughness = 0.85, ... } = {}) {
  const m = new THREE.MeshStandardMaterial({ color, roughness, ... });
  return m;                       // a brand-new object, every single call
}
```

There is no cache. Twelve hundred stones cut from the same limestone get twelve hundred
distinct limestone materials. The instrument says the scene's 2 932 materials collapse to
**808** distinct draw states — so **2 124 material objects exist for no reason at all**, each
one a guaranteed extra uniform upload and a guaranteed barrier to any future merge.

The earlier investigation (`NEXTSTEPS.md` §0c) turned off every leaf-card shadow caster and
saved 19 calls out of 1 539, concluded "whatever it is, it is somewhere else", and stopped.
It was somewhere else: it is in the material factory, and it is 72 % waste.

### 1c. The fix — **proposed, put to Ted, and DECLINED on 2026-09-09**

> **Read this box before reading the rest of §1c.** Ted was shown every number in §1a and
> §1b and answered: *"actually just don't change any of that — it's not going so slow that I
> want to do that."* 3 124 draw calls, ~26 fps and 2 124 wasted materials are **accepted
> deliberately**, with the measurements in hand. `perf-material-dedup`,
> `perf-shadow-casters` and `perf-merge-static` are declined, not deferred.
> **Do not re-propose them.** (`DECISIONS.md` 2026-09-09 call 1.)
>
> The analysis below is kept because it is correct and because the next agent to notice the
> frame rate should find the answer here rather than re-derive the question. The decisive
> cost was Roll Up: merging static geometry would have taken away its vocabulary of named
> individual objects, and that trade was not wanted at that price.

What the fix *would* have been, in the order it would have had to happen:

It was never a one-liner, and that is worth keeping on the record. Some call sites
mutate the material *after* `S.mat()` returns — `_buildWood` does
`duffMat.roughnessMap = null`, `_herbMat` does `m.userData.roll = ...` — and a naively
memoised factory would leak those mutations across every mesh that shares the signature. That
is a silent, world-wide visual bug, which is exactly the kind this project cannot afford.

| # | step | expected | risk |
|---|---|---|---|
| 1 | **`S.matShared({...})`** — a *new*, memoised sibling of `mat()`, keyed on the same signature `hpDiag` reports. `mat()` keeps its current allocate-always behaviour. | 0 visual change | none: nothing calls it yet |
| 2 | Migrate call sites that provably do not mutate. Grep for `S.mat(` and check each. | materials 2 932 → ~1 000; uniform uploads fall hard | per-site, reviewable |
| 3 | **Merge static geometry per shared material** (`BufferGeometryUtils.mergeGeometries`) for everything that never moves and is never eaten by Roll Up. | draw calls 3 124 → plausibly ~600 | **breaks Roll Up's census** and per-object picking — see below |
| 4 | Cut shadow casters. 1 194 is more than a third of the frame and the shadow map cannot resolve most of them anyway. | −1 000 calls | shadows visibly change |

**Step 3 is the one with a real design conflict**, and it is why this is a proposal and not a
patch: Roll Up eats *named individual objects*, and merging them into one buffer destroys
that. The likely resolution is that Roll Up's candidates and the static-merge set are
disjoint by construction — the world already keeps `scene._monoliths` as a ledger of what the
census rejects, so the machinery for that split exists. **That was the decision put to Ted,
and he declined the whole line of work rather than choose between its horns.** Roll Up keeps
its vocabulary; the world keeps its 3 124 draw calls.

### 1d. The budget, from now on — a **regression** budget, not an absolute one

Revised 2026-09-09 by call 1 above. An absolute threshold is meaningless once the current
figure has been looked at and accepted: a budget of 1 500 draw calls in a world that runs at
3 124 by choice would fail on every commit and be ignored by the second one.

So the budget is differential. **Take a `hpDiag()` reading before your pass and after it, and
put both in the commit message.** Then:

| your pass adds | what to do |
|---|---|
| under **10 %** of draw calls or frame time | ship it, note the numbers |
| **10 – 25 %** | ship it if the feature is worth it, and say in the commit why it is |
| over **25 %** | stop and ask. Something is being built the expensive way |
| over **100 %** | a defect, not a cost |

The absolute figures are still worth knowing and `hpDiag()` still reports them — but they are
now a description of the world, not a gate. **The gate is: don't make it materially worse than
you found it.** That is the whole of test-based development for a renderer. The assertion is a
number, the number is obtainable, and it is compared against the last known-good reading
rather than against an ideal nobody has agreed to pay for.

---

## 2. The context budget

### 2a. What was measured

| what | size | ≈ tokens |
|---|---|---|
| `C:\Dev\CLAUDE.md` (workspace, auto-loaded) | 19 853 ch | **4 963** |
| `HPin3D/CLAUDE.md` (project, auto-loaded) | 5 183 ch | **1 295** |
| `memory/MEMORY.md` (auto-loaded) | 1 095 ch | 273 |
| **auto-loaded before any work happens** | | **≈ 6 500** |
| `DECISIONS.md` | 124 319 ch | **31 079** |
| `COVERAGE.md` | 61 290 ch | 15 322 |
| `NEXTSTEPS.md` | 35 322 ch | 8 830 |
| `ROUTER.md` — *the file that exists to save reading* | 21 611 ch | **5 402** |
| **62 root `.md` files** | 823 262 ch | **205 815** |
| **371 `.md` files in the repo** | 2 110 139 ch | **527 534** |
| **`src/scenes/HPWorldScene.js`** — one file | 786 716 ch | **≈ 196 700** |

### 2b. The diagnosis

**The auto-load is not the problem.** 6 500 tokens a session is a fair price for the six rules
and the hosting policy, and cutting it would save little and cost a lot.

**Three other things are the problem.**

1. **`DECISIONS.md` is 31 k tokens and grows monotonically.** It is append-only by design and
   that design has no end state. A task that opens the router, the queue and the ledger — the
   normal opening move — spends **45 k tokens before reading a line of code**.
2. **`HPWorldScene.js` is ~197 k tokens in one file.** No agent can read the world. Every
   builder works by grep, which is why "two items below were once *missing* and turned out to
   be built" (`NEXTSTEPS.md`). It also **makes parallelism impossible**: `ORCHESTRATION.md`'s
   rule is one writer per file, so two agents can never touch the world at the same time. The
   single biggest unlock for agile, parallel work here is splitting this file.
3. **Stale weight in the root.** `ATALANTA_ANIMATION_STRATEGIES.md`, `ATALANTA_INTEGRATION.md`
   and `ATALANTA_SUMMARY.md` are ~11 k tokens about a subject **rule 4 forbids building**.
   They are still in the root where any grep or router pass will surface them.

### 2c. Progressive disclosure — the proposal

The principle Ted asked for: *every LLM call sees only the context its specific task needs.*
That means the documents must be **sliced by task, not by subject**, and each slice must carry
its own token cost so an agent can budget.

1. **Split `DECISIONS.md` by year-quarter into `decisions/`**, keeping only the last ~30 days
   in the root file plus an index of headings. A decision from June is archive; it is read
   when someone searches for it, not on the way past. *Est. saving: 28 k tokens per task that
   touches the ledger.*
2. **Split `HPWorldScene.js`.** The natural seams are already in the code as comment banners —
   the wood/approach, the portal complex, the gardens, Cythera, the masonry helpers, the
   plant/herb factories. Target: no world file over 40 k tokens. *This is the big one, it is
   risky, and it needs its own plan.*
3. **Put a front-matter budget line on every doc**: `<!-- tokens: 4064 · read for: scale,
   layout, siting -->`. `ROUTER.md` then routes on cost as well as subject, and an agent can
   decline to open a file it cannot afford.
4. **Move the three Atalanta docs to the `atalanta-archive` branch**, where the code already
   went on 2026-09-06. They were missed.
5. **Give each agent role a context contract** — a fixed, named, bounded reading list, in
   `.claude/agents/`. `hp-researcher` never opens `HPWorldScene.js`; `hp-builder` never opens
   the scholarship corpus; `hp-verifier` opens neither and reads only the live page and the
   ledger. Today all three inherit the same workspace instructions and choose for themselves.

**None of 1–5 is done.** They are tickets.

---

## 3. Tickets and issues

Ted's ask: *"you will handle documenting stuff like tickets and issues as you go."*

**The ledger is [`research/tickets.json`](research/tickets.json), rendered to
[`TICKETS.md`](TICKETS.md) by `python scripts/tickets_report.py`.** It follows the same shape
as `research/coverage.json` so there is one idiom in the repo, not two.

It does **not** replace `NEXTSTEPS.md`. The two have different jobs and the distinction is
worth keeping:

- **`NEXTSTEPS.md` is Ted's voice** — what he asked for, quoted, in his words, until it is
  built. It is a promise ledger and it must stay readable as prose.
- **`tickets.json` is the engineering queue** — defects, debt, performance, infrastructure,
  each with **an acceptance criterion that is machine-checkable**. It is what an agent picks
  up from.

A ticket:

```json
{
  "id": "perf-material-dedup",
  "title": "S.mat() allocates a new material on every call",
  "kind": "perf",
  "status": "open",
  "priority": 1,
  "evidence": "hpDiag() 2026-09-08: 2932 materials, 808 signatures, 2124 wasted",
  "acceptance": "hpDiag().scene.wastedMaterials < 200 with no visual diff at five stations",
  "files": ["src/shaders/HPStyles.js"],
  "role": "hp-builder",
  "opened": "2026-09-08"
}
```

**The rule that makes this worth doing: `acceptance` must be a sentence a machine could
check.** "Make the wood better" is not a ticket. "`hpDiag().frame.drawCalls < 1500` in the
wood" is. If an acceptance criterion cannot be written that way, the item is a *design
question* and belongs in `DECISIONS.md` as a question for Ted — not in the queue.

---

## 4. What "test-based" means here

There is no test runner and a browser world is not unit-testable in the usual way. What is
testable, and what should be written *before* the change:

| layer | the test | how it runs today |
|---|---|---|
| **parse** | every changed module parses | `node --check src/**/*.js` — already the habit, now mandatory |
| **boot** | the page reaches `window.hpExplore` with an empty console | preview + `read_console_messages` |
| **budget** | `hpDiag()` inside the thresholds of §1d | **new, and the point of this pass** |
| **presence** | a feature that claims to be built is in the scene | `hp-verifier`, `scene.getObjectByName` |
| **live** | the deployed page serves the version you pushed | fetch `/src/`, read `main.js?v=` — this pass caught the site frozen at `v=310` while `main` had `v=320` |
| **provenance** | every interpretive claim names a source | human, at review |

The **live** row is not theoretical: on 2026-09-08 the dark-wood work was committed, recorded
in `DECISIONS.md` as *"verified on the running page and deployed"*, and never pushed. Pages
served `v=310` for a day. **A commit is not a deploy, and `git status` says `ahead 1`.**
Checking that one line would have caught it.

---

## 5. The research pipeline

`HPTOTOURPIPELINE.md` holds the route. Two changes this pass argues for:

1. **The research pass now produces a fourth artifact.** It already produces the prose brief,
   the JSON, and the ledger entries. `DIMENSIONS.md` and `DIRECTIONS.md` (2026-09-08) proved
   the missing one: **a build brief with per-item acceptance criteria**, so the researcher
   hands the builder something the builder can be *checked against* rather than persuaded by.
   `DIRECTIONS.md` §6 is the first example and it works.
2. **The ledger must distinguish *unresearched* from *unbuilt* — it does — and now also
   *unbuildable-at-this-scale*.** `pyramid-true-scale` is not a build gap; it is blocked on a
   directional decision. Marking it "unbuilt" makes the queue lie about what is actionable.

---

## Status of this file

**Measured and true:** §1a, §1b, §2a, §2b, §4's live-deploy failure.
**Built:** `hpDiag()`, `research/tickets.json`, `scripts/tickets_report.py`.
**Decided by Ted, 2026-09-09** (`DECISIONS.md`): §1c is **declined** — the renderer is not to
be refactored; §1d is now a regression budget. Three further calls made the same day govern
the world rather than this file: follow the novel to the letter and buy pace with speed;
rescale the monuments but not the ground plan; build the artificial gardens and let the
commentary carry Hunt's objection.
**Proposed, not decided:** §2c, §5. Both are in `TICKETS.md`.
