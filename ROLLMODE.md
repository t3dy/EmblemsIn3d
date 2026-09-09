<!-- tokens: ~1,615 · read for: the design brief behind Roll Up -->
# Roll Mode — the hermaphrodite eats the garden, and what every part of the world owes it

*Subject brief, 2026-09-08. `src/systems/RollUp.js`, with [`MASONRY.md`](MASONRY.md) and
[`LITTER.md`](LITTER.md) as its two halves. Read with [`MODES.md`](MODES.md).*

---

## 1. What it is, and where every rule came from

You are a ball with **Sol on one face and Luna on the other**, which `hp.db.alchemical_symbols`
— the only licensed basis for an alchemical reading here (Taylor 1951, Russell 2014 on the
Buffalo annotators) — says is **the hermaphrodite, "the product of the chemical wedding: union
of Sol and Luna."** So the goal is the wedding, and the road there is the ladder the same
table lays out and Hand B wrote in the margin of a 1499 copy: Saturn's lead, Jupiter's tin,
Mars's iron, Venus's copper, Mercury's quicksilver, Luna's silver, Sol's gold. The ball wears
its metal; at twelve metres the work is finished and the end card gives Russell's sentence.

Everything it eats is **named** — the genre's whole charm — from the mesh's own `userData.roll`
first, then the material's, then the geometry and the nearest wonder ("a brick, from The Court
of Queen Eleuterylida"). Bite: a thing must be under 0.58 of the ball's radius.

## 1a. The controls, and where they come from

Researched 2026-09-08 against the PC ports. *Katamari Damacy REROLL*'s default keyboard
scheme is the console one: **two sticks, WASD for the left hand and IJKL for the right** —
both forward rolls, one forward turns, opposite spins in place — and its settings offer a
**"Simple"** scheme that moves and turns with one stick; players on Steam call keyboard play
awkward under either ([Screen Rant](https://screenrant.com/change-control-settings-katamari-damacy-reroll/),
[Steam: how are the controls?](https://steamcommunity.com/app/848350/discussions/0/1742227898977511898/),
[We Love Katamari REROLL+ keyboard guide](https://steamcommunity.com/app/1730700/discussions/0/3810656323978804319/)).
So the world offers both, and a third way for the mouse:

| | |
|---|---|
| **Single-stick** (default) | W A S D roll in the camera's frame; **Q E Z C** and the numpad corners are the diagonals as keys of their own; Shift dashes; drag swings the camera; wheel pulls back |
| **Two-stick** (T) | W A S D the left hand, **I J K L or the arrows** the right; both forward rolls, one forward turns, both aside turns; the camera follows the ball's own heading and a drag turns the ball; C puts the camera behind |
| **Mouse** | hold the **right button** to roll the way you look, drag to steer — the whole game on one hand |
| **Space** | the quick turn: the camera swings round behind the ball's other side |

## 1b. The crust

Everything eaten stays on the outside, **re-seated on the surface every frame** as the ball
grows (the first build seated things once and grew past them, which is why they seemed to
vanish). A thing sinks in with age — a big one (over a fifth of the ball) in about six
seconds, a small one in half a minute — so a column stands proud for a moment and a coin
rides the skin. The largest thing still proud sets the **bump**: the ball lurches once a
revolution over it, fading as it is absorbed. The cap is 650 pieces; shedding takes the
smallest of the oldest, never a big thing to make room for a leaf.

## 1c. What stands on what

Two systems decide what falls. **Masonry** (`MASONRY.md`) knows the structures it was told
about — columns, piers, arches, and the loads they carry. **Generic support**
(`_resolveSupports`) looks at everything else in the census and works out, for each thing not
sitting on the ground, what its bottom rests on: any object whose top is within ten
centimetres and whose footprint overlaps. A crown learns its trunk, a topiary ball its stalk,
a statue its plinth, the serpent's coils their rock, a cup its table. Eat the support and
what rested on it falls to where the support was standing, and what rested on *that* rides
down the same distance. A thing held by two supports stays until both are gone.

## 2. The three courses of the meal

1. **The sward** — blades of grass, grazed straight out of the instanced meadow.
2. **The litter** — nine thousand Renaissance objects, tiny to medium, zoned by station.
3. **The world** — leaves, fruit, tiles, balusters, drums, ashlars, voussoirs, nymphs, trees,
   and then whole wonders, which come down when undermined.

## 3. What every addition to the world owes this mode

- **A name.** `mesh.userData.roll` or `material.userData.roll`, set where the thing is made,
  because that is the only place the name is known. "A piece of the dream" is a failure.
- **Wholeness.** Anything built of several meshes goes through `_rollGroup(id, fn)` so it is
  censused as one thing with one size — a table, a hull, a sepulchre, a lute.
- **Stones, not boxes.** Anything architectural through `_column`, `_ashlar` or `_arch`, so it
  can be undermined rather than swallowed or ignored. Over six metres it is invisible to the
  ball (`scene._monoliths`).
- **Indexed geometry.** One bare `PolyhedronGeometry` poisons a merge bucket.
- **No `transparent: true`** on cutouts (`alphaTest` only), or the piece is exiled from the
  merge and the census both.

## 4. Still owed

The nymphs and Poliphilo do not react (Katamari's crowds run). No sound, and the site is
silent by decision — §2 of `PLEASURES.md` is the precedent: show it instead. No inertia on the
big ball. Nothing carries between rounds. Nothing falls *on* anything: a fallen thing lands
where its support stood, not on the rubble already there. A thing standing on a course that
*settles* (rather than being eaten) stays where it was — generic support answers only to
removal.

## 5. How the other modes look from here

| Mode | Relation |
|---|---|
| **Walk** | The same world, with the litter absent and nothing eatable. Roll's collapse cannot happen in Walk because the census is not built there. |
| **Tour** | Untouched. Roll has no commentary: its citation is the database the ladder came out of, on the end card. |
| **Dream** | Untouched. |
| **Fly** | Untouched; the dragon and the ball never coexist. |
| **Layers** | *Alchemical reading* is the one layer that speaks Roll's language, and the end card quotes it. | 
