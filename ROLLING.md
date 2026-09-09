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

**Ours absorbs them.** Every stuck thing sinks into the surface over 6 to 32 seconds and
disappears inside. That was a deliberate choice for a reason that no longer holds — draw
calls — and **it is the single reason the mode does not feel like Katamari.** Everything else
in this file is a tuning value; this one is the design.

See §3.

---

## 1. Growth — why it grows too fast

### The variables

| name | where | value | what it does |
|---|---|---|---|
| `r0` | constructor default | **0.22 m** | the starting radius |
| packing loss | `_swallow` | **0.42** | how much of a swallowed thing's volume actually becomes ball |
| ceiling | `_swallow`, `_swallowGrass` | **14 m** | the ball can never exceed this |
| grass gain | `_swallowGrass` | **0.00016** per blade | a blade of grass is worth this much volume |
| `WEDDING` | module | **12.0 m** | the radius at which the run ends |
| `METALS[].at` | module | 0, 0.5, 1, 1.8, 3, 5, 8 | the radii at which the ball changes metal |

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
const BITE = 0.58;   // you may eat anything up to 58 % of your own radius
```

That is very permissive. Katamari sits nearer **0.30–0.40** of the diameter for the "it just
became possible" moment. At 0.58 the ball at 1 m can eat a 58 cm object — a big object — and
one big object is worth `0.58³ = 0.195` of volume against your own `1.0`, so a *single* bite
grows you by 8 %. **Lower `BITE` and growth slows even if you touch nothing else**, because
the ball can only eat small things, and small things add small volumes. This is the second
dial.

### Recommended first pass

```
packing loss   0.42  →  0.22
BITE           0.58  →  0.38
WEDDING        12.0  →  18.0
ceiling        14    →  22
METALS .at     0, 0.5, 1, 1.8, 3, 5, 8  →  0, 0.6, 1.4, 2.6, 4.5, 7.5, 11
```

Turn them one at a time and roll for two minutes after each. `BITE` and the packing loss
compound, so changing both at once will overshoot and feel sluggish.

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
| `CRUST` | **650** | how many swallowed things stay on the outside at once |
| `SINK_BIG` | **6.0 s** | how long a big thing (over ⅕ of the ball) takes to be absorbed |
| `SINK_SMALL` | **32.0 s** | how long a small thing takes to sink flush |

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

**Do (a) first, alone, and roll for two minutes.** It is very likely the whole of what Ted is
describing.

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

## 5. The order to change things in

1. **Cap `depth` at 0.55** (§3a). One line. Roll for two minutes. This is the Katamari feel.
2. **Packing loss 0.42 → 0.22** (§1). Roll again. This is the growth rate.
3. **`BITE` 0.58 → 0.38** (§1). Roll again. This is what "it just became possible" feels like.
4. **Stretch the metal ladder and raise `WEDDING`** (§1), so the arc fits the new curve.
5. **Raise `CRUST`** (§3b) and take a `hpDiag()` reading, per rule 7.
6. **Acceleration and radius-scaled speed** (§4).
7. **Keep breaking architecture into blocks** (§2) — `scene._monoliths` is the list, and it
   is the one that never ends.

Steps 1–4 are perhaps forty lines between them and would change the mode more than anything
else on the queue.

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
