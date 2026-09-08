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
big ball. Nothing carries between rounds. Nothing falls *on* anything.

## 5. How the other modes look from here

| Mode | Relation |
|---|---|
| **Walk** | The same world, with the litter absent and nothing eatable. Roll's collapse cannot happen in Walk because the census is not built there. |
| **Tour** | Untouched. Roll has no commentary: its citation is the database the ladder came out of, on the end card. |
| **Dream** | Untouched. |
| **Fly** | Untouched; the dragon and the ball never coexist. |
| **Layers** | *Alchemical reading* is the one layer that speaks Roll's language, and the end card quotes it. | 
