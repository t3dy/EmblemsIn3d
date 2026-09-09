<!-- tokens: ~2,066 -->
# CRUST — what is stuck to the ball, and why some of it has to go

*Written 2026-09-09 because I kept saying "shed the crust by surface area rather than by
count" without ever explaining it. This is the explanation. It is one small mechanic, but it
is the one that decides what Roll Up **looks like**, so it is worth a page.*

Companion: [`ROLLING.md`](ROLLING.md) is the full control panel; this is one dial of it, in
detail. The code is `src/systems/RollUp.js`, `_swallow` and `_crust`.

---

## 1. The crust is the ball

When the ball eats something, the thing does not vanish into a counter. It is **re-parented
onto the ball's surface** and rides there, keeping the direction it was met from and the
orientation it had in the world — which is why a swallowed column still points the way it
pointed and a leaf still lies the way it lay.

That collection of stuck things is **the crust**. It is the whole visual idea of the genre: a
katamari does not look like a sphere that got bigger, it looks like *a heap of the world with a
ball somewhere inside it*. The silhouette is made of chairs and traffic cones and, here, of
balusters and grave-lamps and nymphs.

So the crust is not decoration on the ball. **The crust is what the player sees.**

---

## 2. Why anything has to be shed at all

Every stuck thing is its own object — its own mesh, its own draw call. It has to be: the whole
point is that it keeps its shape and its name.

So the crust cannot grow for ever. A full run swallows **tens of thousands** of objects; the
headless sweep in `ROLLING.md` §1 reached 32,250 in five simulated minutes. Thirty-two thousand
extra draw calls would not render. Something must come off.

`_swallow` therefore ends with a **shed**: while the crust is longer than a cap, drop one.

```js
while (this._stuck.length > this.tune.crust) {
  const head = this._stuck.slice(0, 60);        // the sixty oldest
  let k = 0;
  for (let i = 1; i < head.length; i++)          // of those, the smallest
    if (head[i].size < head[k].size) k = i;
  const [old] = this._stuck.splice(k, 1);
  old.holder.removeFromParent();                 // and it is gone
}
```

Two things are worth noticing in those six lines.

**It never drops a big thing to make room for a leaf.** It looks only at the sixty oldest and
takes the *smallest* of them, so a swallowed column outlives a thousand blades of grass. That
is deliberate and it is right: the column is what the silhouette is made of.

**And the dropped thing is destroyed, not hidden.** `removeFromParent`, then the geometry is
disposed. It is inside the ball now as far as the fiction is concerned — the ball did eat it —
but there is nothing left of it to draw.

---

## 3. The cap is a count, and a count is the wrong unit

`tune.crust` is **2 000** (it was 650 until 2026-09-09). Two thousand *things*, whatever size
the ball happens to be.

That is the problem, and it is easiest to see at the two ends of a run:

| | ball radius | its surface | 2 000 things on it |
|---|---|---|---|
| **early** | 0.3 m | 1.1 m² | absurdly crowded — but you never get there, because you have not eaten 2 000 things yet |
| **late** | 12 m | **1 810 m²** | 2 000 things scattered over eighteen hundred square metres: **bare** |

The surface of a sphere goes up with the *square* of the radius. From 0.3 m to 12 m the radius
grows forty-fold and the area grows **sixteen hundred-fold** — while the number of things
allowed to sit on it does not change at all.

**So the ball gets barer the bigger it gets**, which is exactly backwards. The moment the crust
should be at its most spectacular — a twelve-metre ball rolling through the Polyandrion with
tombs and columns stuck all over it — is the moment 2 000 objects have the least covering power.

Raising the cap does not fix it. It just moves the same mismatch to a different radius, and
buys the extra draw calls at every radius including the small ones where they were not needed.

---

## 4. Shedding by area instead

The honest rule is the one the geometry already implies:

> **A ball has 4πR² of surface, and a thing takes up about πr² of it. Keep things until the
> surface is full; then start dropping.**

In code, that is a different `while` condition — the loop body does not change at all:

```js
// how much skin the crust is using
let used = 0;
for (const s of this._stuck) used += Math.PI * s.size * s.size;

// how much there is, times an overlap factor: a katamari is a HEAP, so things
// pile on things and the crust may cover the sphere several times over
const room = 4 * Math.PI * this.r * this.r * this.tune.crustLayers;

while (used > room) { /* …drop the smallest of the sixty oldest, as now… */ }
```

`crustLayers` is then the dial, and it means something a person can picture: **how many
layers deep the heap is.** 1.0 is a single skin with no overlap; 3 is a proper knobbly heap;
6 is a rolling avalanche. It replaces a number (2 000) that means nothing on its own.

What this buys, at a glance:

| ball radius | surface | things it can carry at 3 layers, average size 0.15 m |
|---|---|---|
| 0.5 m | 3.1 m² | ~130 |
| 2 m | 50 m² | ~2 100 |
| 6 m | 452 m² | ~19 000 |
| 12 m | 1 810 m² | ~77 000 |

Those big numbers are not a proposal to draw 77 000 objects. They are the point at which a
**second** limit has to do the work — an absolute ceiling for the frame's sake — and the two
together give the right behaviour: *density is governed by area, and cost is governed by a cap
that only ever bites at the very end.*

---

## 5. What it would actually change

**The ball would stop going bald.** Today it is at its most crusted somewhere in the middle of
a run and thins out from there. With an area rule it thickens all the way, which is the arc the
genre has and the one the alchemical ladder in this mode is already telling: lead, tin, iron,
copper, quicksilver, silver, gold, and the thing in your hands gets more encrusted at every
rung.

**The early game would get denser, cheaply.** A half-metre ball can carry 130 things on three
layers and today it will happily carry 2 000 — so at the start the cap is not doing anything at
all, and the crowding you see is only the crowding you have eaten. Under an area rule the small
ball is *visibly full* almost at once, which is the moment the mode currently lacks.

**And it costs nothing at the small end.** Fewer objects on a small ball is fewer draw calls
exactly when the world around you is also cheap.

---

## 6. Why it is not done yet

It is a small change — one `while` condition and a new dial — and it is **open, not declined**
(`roll-shed-by-area` in `TICKETS.md`). Three things want deciding first, and none is hard:

1. **What `crustLayers` should be.** Guessable at 3, but `ROLLING.md` §1's lesson stands: this
   project got the growth curve wrong twice by judgement and right once by measurement. Sweep
   it headlessly, read the table, then choose.
2. **Whether `size` is the right measure of how much skin a thing takes.** `size` is the mean
   half-extent from `_census`, which is a fair radius for a compact object and too generous for
   a long thin one — a column takes far less *skin* than πr² suggests, because most of it
   sticks out. Probably fine; worth a look.
3. **The absolute ceiling to sit behind it**, so a twelve-metre ball does not try to draw
   seventy-seven thousand things. That is the current `tune.crust`, kept, but as a backstop
   rather than as the rule.

None of this is urgent. The mode looks right now in a way it did not this morning, because
things no longer sink out of sight (`SINK_FLOOR`, `ROLLING.md` §3). This is the next thing
after that, not a fix for something broken.

---

## Sources and files

`src/systems/RollUp.js` — `_swallow` (the shed), `_crust` (the re-seating and the bump),
`tune` (the live dials). [`ROLLING.md`](ROLLING.md) — every other variable, and the measuring
loop. [`DRAWCALLS.md`](DRAWCALLS.md) — why each stuck thing costs a draw call, and why this
project pays that willingly.
