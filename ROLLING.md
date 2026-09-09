# ROLLING — every variable in Roll Up, what it does, and which one to turn

*Written 2026-09-09 from Ted: the ball **grows too quickly**, and the things it eats **do not
stay visible and deform it** the way they do in Katamari Damacy. Both are true, both are
fixable, and they are not the same problem. This file is the map of the machine:
`src/systems/RollUp.js`, with `HPWorldScene._census` and `systems/Masonry.js` around it.*

**The design brief is `ROLLMODE.md`. This is the control panel.**

---

## 0. The one structural difference from Katamari, stated first

In Katamari Damacy an object you pick up is **stuck to the ball for ever**. It never sinks,
never fades, never gets absorbed. The ball's silhouette *is* the objects: a katamari with a
traffic cone in it has a traffic cone sticking out of it until the level ends, and the
lumpiness accumulates until the ball is a rolling heap of the world.

**Ours absorbed them** until 2026-09-09: every stuck thing sank into the surface over 6 to 32
seconds and disappeared inside. That was a deliberate choice for a reason that no longer holds
— draw calls — and **it was the single reason the mode did not feel like Katamari.** Everything
else in this file is a tuning value; this one was the design.

**Fixed the same day.** `SINK_FLOOR = 0.55` caps how far anything may sink, so 45 % of every
object stands proud of the ball for ever and `_bump` never decays to zero. See §3.

---

## 1. Growth — why it grows too fast

### The variables

*Values as they stand after the 2026-09-09 pass. Everything marked **live** is on
`roll.tune` and can be changed from the console mid-roll — that is what makes §1's measuring
loop possible.*

| name | where | was | **now** | what it does |
|---|---|---|---|---|
| `r0` | constructor default | 0.22 m | 0.22 m | the starting radius |
| `PACKING` | **live** `tune.packing` | 0.42 | **0.38** | how much of a swallowed volume becomes ball |
| `BITE` | **live** `tune.bite` | 0.58 | **0.48** | largest thing edible, as a fraction of the radius |
| `CEILING` | **live** `tune.ceiling` | 14 m | **22 m** | the ball can never exceed this |
| grass gain | `_swallowGrass` | 0.00016 | 0.00016 | what one blade of grass is worth |
| `WEDDING` | module | 12.0 m | **18.0 m** | the radius at which the run ends |
| `METALS[].at` | module | 0, 0.5, 1, 1.8, 3, 5, 8 | **0, 0.6, 1.4, 2.6, 4.5, 7.5, 11** | where the ball changes metal |

### The formula

```js
this.r = Math.cbrt(this.r ** 3 + (e.r ** 3) * 0.42);
```

Volumes add, then the cube root turns volume back into radius. That is the correct physics
and it is **not** the problem — a cube-root curve is naturally gentle, and it is what
Katamari uses too.

### What is actually making it fast

**1. The packing loss of 0.42 is generous.** It says 42 % of everything you swallow becomes
ball. Real packing of irregular objects is nearer 55–65 % efficient *by volume of the
bounding shape*, but a katamari is not densely packed — it is a knobbly heap with air in it,
and the game's own feel comes from the ball growing *slower* than the volume you have eaten.
**Try 0.18–0.25.** This is the first dial to turn and the one with the most effect.

**2. The ladder is short and front-loaded.** The first four metals are at 0, 0.5, 1.0 and
1.8 m. Starting at 0.22 m, you are through Saturn, Jupiter and Mars in the first minute or
two, and the transmutation — the mode's whole narrative arc — is spent before the garden has
opened up. Katamari's arc is logarithmic in *feel* because each stage takes longer than the
last. **Try 0, 0.6, 1.4, 2.6, 4.5, 7.5, 11 with `WEDDING` at 18–20**, so the last stage is
the longest and the gold is genuinely earned.

**3. The ceiling is 14 m and the wedding is at 12.** The ball spends its entire endgame in
2 m of range. Raising `WEDDING` without raising the ceiling just compresses it further —
**raise both together**, or the last stage has nowhere to happen.

**4. `BITE` interacts with growth and people always miss this.**

```js
const BITE = 0.58;   // you may eat anything up to 58 % of your own radius  (now 0.48)
```

That was very permissive. Katamari sits nearer **0.30–0.40** of the diameter for the "it just
became possible" moment. At 0.58 the ball at 1 m can eat a 58 cm object — a big object — and
one big object is worth `0.58³ = 0.195` of volume against your own `1.0`, so a *single* bite
grows you by 8 %. **Lower `BITE` and growth slows even if you touch nothing else**, because
the ball can only eat small things, and small things add small volumes. This is the second
dial.

### What was done, 2026-09-09 — and what it cost to learn

```
packing loss   0.42  →  0.38        (PACKING)
BITE           0.58  →  0.48
WEDDING        12.0  →  18.0
ceiling        14    →  22          (CEILING)
METALS .at     0, 0.5, 1, 1.8, 3, 5, 8  →  0, 0.6, 1.4, 2.6, 4.5, 7.5, 11
```

**The first attempt cut the packing to 0.22 and `BITE` to 0.38 in the same pass — exactly what
the paragraph above warns against — and it overshot badly.** A headless run showed the ball
stalling: 0.66 m at 96 s, and still only **0.97 m after seven simulated minutes**. At a `BITE`
of 0.38 a ball of 0.9 m can only eat things under 34 cm, it exhausts the small furniture around
it, and nothing bigger ever becomes available. Too slow is not the opposite of too fast; it is
a different failure, and a worse one.

**So the values are now measured rather than judged.** The dials are live on the instance
(`roll.tune`), which is what made the measuring possible at all — before this pass the only way
to answer "does it still grow too quickly?" was to edit the file, reload, and roll for five
minutes by hand.

```js
const r = window._hp.state.activeScene.roll;
Object.assign(r.tune, { bite: 0.48, packing: 0.38 });
r._keys.add('KeyW');
for (let i = 0; i < 19000; i++) { if (i % 700 === 0) r.cam.yaw += 0.9; r.update(0.016); }
({ r: r.r, eaten: r.count, stage: r.stage });
```

Five simulated minutes at the chosen values:

| seconds | radius | eaten | metal |
|---|---|---|---|
| 0 | 0.22 | 0 | Saturn |
| 48 | 0.50 | 566 | Saturn |
| 96 | 0.84 | 1 175 | Jupiter |
| 144 | 2.23 | 6 034 | Mars |
| 192 | 2.40 | 6 565 | Mars |
| 240 | 5.12 | 19 330 | Mercury |
| 288 | 6.12 | 32 250 | Mercury |

A slow start, then the cascade as the world becomes edible — which is the shape the genre has.
**Tune it the same way: change one dial on `roll.tune`, run the loop, read the table.** Do not
change two at once, and do not trust your judgement over the numbers.

---

## 2. What can be eaten at all — the census

`HPWorldScene._census` decides what is food. Two rules matter:

**Size is the mean half-extent of the bounding box**, `(dx + dy + dz) / 6`, not the bounding
sphere. This is right and should not be changed: a leaf card is a 95 cm square of nothing
whose sphere radius is 67 cm, which would make a leaf harder to eat than a plum-sized pebble.
The mean half-extent gives a leaf 32 cm, a cube half its side, a column 58 cm.

**Anything over 6 m is not food.**

```js
const tooBig = r > 6 || bs.radius * sc > 14;   // long thin things are architecture too
```

Rejected things are logged to `scene._monoliths`, which is the ledger of *everything in the
world that is not built out of pieces*. Ted, 2026-09-09: *"I want everything in the world of
our virtual dream garden to be roll up able. All of the architecture needs to be built out of
individual objects (blocks of marble, wooden beams, or whatever is being used in Renaissance
architecture)."*

**`scene._monoliths` is therefore the to-do list for that instruction, and it already
exists.** Read it in the console:

```js
window._hp.state.activeScene._monoliths
```

It currently holds only the sea, the sky, the ground discs, the roads and the terrace shells
— everything else has already been broken into ashlar by `systems/Masonry.js` (`_ashlar`,
`_arch`). The remaining named targets are in `NEXTSTEPS.md` §0g: the bridge arches, the twenty
Cythera fence gates, the Fountain of Venus's arcade, the obelisk plinths, the bath, the Court
screen, and Book II's Treviso front.

**The ground, the sea and the sky should stay monoliths.** A katamari does not eat the floor.

---

## 3. The crust — why things vanish, and how to make them stay

This is the one that will change how the mode feels.

### The variables

| name | value | what it does |
|---|---|---|
| `CRUST` | 650 → **2 000** (live, `tune.crust`) | how many swallowed things stay on the outside at once |
| `SINK_BIG` | **6.0 s** | how long a big thing (over ⅕ of the ball) takes to settle |
| `SINK_SMALL` | **32.0 s** | how long a small thing takes to settle |
| `SINK_FLOOR` | **0.55** (live, `tune.sinkFloor`) | **how far anything may sink. 1.0 = flush, gone. This is the one that mattered.** |

### The mechanism

```js
const depth = Math.min(1, age / T);              // 0 = new, 1 = fully absorbed
const seat  = Math.max(R * 0.55, R - depth * s.size);
s.holder.position.copy(s.dir).multiplyScalar(seat);
const proud = seat + s.size - R;                 // how far it sticks out
```

Each thing keeps the *direction* it was met from and is re-seated every frame at `seat`
metres from the centre. New, it sits at `R` — its centre on the skin, so half of it stands
proud. Old, it sits at `R - size` — its outer edge flush with the skin, so it has vanished
into the ball.

`_bump` is the largest `proud` in the crust, and `_sync` turns that into the ball's lurch as
it rolls, which is why a swallowed column makes it limp.

### Why it does not feel like Katamari

**Because `depth` goes to 1.** In Katamari it never does. Set `SINK_BIG` and `SINK_SMALL` to
anything you like and things will still eventually be flush and invisible; you are only
choosing how long that takes.

### The three fixes, smallest first

**(a) Stop it sinking all the way.** One line. Cap `depth` so nothing is ever fully absorbed:

```js
const depth = Math.min(0.55, age / T);   // 0.55 -> 45 % of every object stays proud, for ever
```

The ball becomes permanently knobbly, its silhouette made of what it has eaten, and `_bump`
stops decaying to zero so it never rolls smoothly again. **This is the single highest-value
change in this file** and it costs nothing — the objects are already there, already parented,
already re-seated every frame.

**(b) Raise the cap.** `CRUST = 650` is a draw-call budget, and the draw-call budget was the
thing Ted declined to optimise for. A run eats ten thousand objects and only 650 are on the
skin, so the ball late in a run is mostly bare sphere. **Try 1 500–2 500** and take a
`hpDiag()` reading; each stuck thing is roughly one draw call, so 2 000 in the crust puts the
rolling frame in the same territory as the dark wood, which is already accepted as playable.

**(c) Make it shed by geometry, not by count.** The shedding rule today takes the smallest of
the sixty oldest, which is decent. But the honest rule is *the ball has a surface area of
4πR², and only so many things fit on it*. Shedding when the crust's summed cross-section
exceeds, say, 3 × 4πR² would let a small ball carry few things and a huge ball carry
thousands, automatically — which is exactly the growth curve Katamari's visual density
follows.

**Done 2026-09-09.** `SINK_FLOOR` is 0.55, so nothing ever sinks past 45 % of its own size and
`_bump` never decays to zero; `CRUST` is 2 000, up from 650, because 650 was a draw-call budget
and the draw-call budget is the thing that was looked at and declined (`DRAWCALLS.md`). A
five-minute headless run ends with **2 000 things on the skin and a bump of 1.24 m** — the ball
is permanently misshapen and made of what it ate, which is what was asked for. (c), the
area-based shed, is still open and is still the honest rule.

---

## 4. Motion — the ball does not feel heavy

| name | value | note |
|---|---|---|
| `speed` | **3.4 m/s** | constant. There is no acceleration and no friction |
| `cam.dist` | clamped to `r * 2.4 … r * 9` | keeps the ball the same size on screen as it grows |
| `_bump` | derived | the lurch; capped at `R * 0.9` |
| `tank` | `false` | two-stick scheme, toggled with **T** |

`NEXTSTEPS.md` §0f already names this: *"the ball never gets stuck but it never struggles
either. There is no momentum and no friction — it moves at a speed and stops."*

Katamari's ball has mass. It takes a moment to start, longer to stop, and it turns more
slowly the bigger it is. Three additions, in order of how much they would be felt:

1. **Acceleration and drag.** Keep a velocity; approach the target speed at a rate, and decay
   it when no key is down. Around 0.4 s to reach speed at 0.22 m and 1.5 s at 12 m.
2. **Speed that falls with radius.** `speed = 3.4 * (0.22 / r) ** 0.25` or similar — a big
   ball is *majestic*, not fast, and the world feels larger for it.
3. **A real lurch.** `_bump` already exists and already feeds the roll. Feed it into the
   *camera* too, and into a small speed penalty, so a column in the ball is felt as well as
   seen.

---

## 5. The order it was done in, and what is left

**Done 2026-09-09**, in this order:

1. ~~**Cap `depth`**~~ — `SINK_FLOOR = 0.55` (§3a). The Katamari feel.
2. ~~**Packing loss**~~ — 0.42 → 0.38, measured, not guessed (§1).
3. ~~**`BITE`**~~ — 0.58 → 0.48, same sweep.
4. ~~**Stretch the ladder, raise `WEDDING` and `CEILING`**~~ — 18 and 22 (§1).
5. ~~**Raise `CRUST`**~~ — 650 → 2 000 (§3b).
6. ~~**Acceleration and mass**~~ — the ball carries a velocity with a time constant that grows
   with the radius: about ⅓ s to reach speed at the start, 1.5 s at the wedding (§4).

**Still open:**

7. **Shed by geometry rather than by count** (§3c) — the honest rule, and the one that would
   let a small ball carry few things and a huge one carry thousands, automatically.
8. **Speed that falls with radius** (§4.2) — a big ball should be majestic, not fast. The
   current curve makes it *faster* as it grows, which is defensible but is not the genre's.
9. **Keep breaking architecture into blocks** (§2) — `scene._monoliths` is the list, and it is
   the one that never ends.

---

## 6. What NOT to change

- **The size metric** (`(dx+dy+dz)/6`). It was arrived at by measurement and the obvious
  alternatives are both worse. §2.
- **The direction-keeping in `_swallow`.** A swallowed column still points the way it pointed
  in the world, and a leaf still lies the way it lay. That is a genuinely lovely detail and
  it is why the crust reads as *the world*, stuck to a ball, rather than as decoration.
- **The ladder of the metals as a concept.** It comes out of `hp.db.alchemical_symbols` and
  the Buffalo annotators (Taylor 1951, Russell 2014), it is the one thing that makes this a
  *Hypnerotomachia* katamari rather than a katamari in a Renaissance skin, and it is the only
  licensed alchemical reading in the project. Change its thresholds freely; do not change its
  substance.
- **The ground, the sea and the sky staying inedible.** §2.

---

## Sources and files

`src/systems/RollUp.js` — the ball, the crust, the ladder.
`src/scenes/HPWorldScene.js` — `_census` (what is food), `_rollName` (121 names),
`_rollGroup`, `scene._monoliths` (what is not yet built out of pieces).
`src/systems/Masonry.js` — `_ashlar`, `_arch`: how a wall becomes stones.
`ROLLMODE.md` — the design brief. `NEXTSTEPS.md` §0f, §0g, §0h — the standing queue.
`DRAWCALLS.md` — why the crust has a cap at all, and why that reason has been set aside.
