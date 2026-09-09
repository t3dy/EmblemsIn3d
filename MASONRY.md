# Masonry — the world made of stones, and what happens when you take one out

*Subject brief, 2026-09-08. `src/systems/Masonry.js`; `_column`, `_ashlar`, `_arch` in
`HPWorldScene.js`. Ted's mandate: "the buildings are made from blocks or other constituent
parts that are small enough to eventually be rolled up … and the game physics accounts for
all the possibilities of interaction and what happens when a block is rolled up out from
underneath the structures it supports." Read with [`MODES.md`](MODES.md) and
[`ROLLMODE.md`](ROLLMODE.md).*

---

## 1. The three forms, and why each is built the way it is

| Form | Helper | Built as | Fails when |
|---|---|---|---|
| **Column** | `_column` | four stones of the attic base, six or seven **drums** sharing the entasis, necking, capital, abacus — fourteen courses, flutes cut drum by drum | any course is eaten away; settles course by course; topples past 42 % lost |
| **Wall / pier** | `_ashlar` | courses ~80 cm of blocks ~1.2 m, joints broken half a block on alternate courses | a course fails only when **every** block in it is gone |
| **Arch** | `_arch` | an odd number of voussoirs with radiating joints and a keystone standing proud | **any one voussoir** — the arch is `brittle`; it has no redundancy |

None of this is a concession to the game. A classical column *is* stacked drums, which is why
a ruined one lies in a row like fallen cheeses; a wall whose joints line up falls down; and an
arch is the one common piece of masonry that sappers went for, because it cannot lose a
stone.

## 2. The physics

- A **structure** is a vertical run of **courses** at one x, z; it may **carry** loads (an
  entablature, a roof, a cupola, a tablet) and may **depend on** other structures (an arch on
  its two posts).
- Eat every stone of a course: everything above **settles** by exactly that height, and so
  does everything carried. A load borne by several structures answers to whichever fails
  first — the temple's cupola came down with seven of its eight piers still standing.
- Past `TOPPLE_AT` (42 %) the structure **topples**: the rest let go, fall under gravity, spin,
  and land as rubble **on the walker's floor** (a stone knocked off a gate on Cythera's second
  terrace lands on the second terrace). Its collider is dropped; you can roll over it.
- Nearly every stone is inside a merged draw-call buffer, so moving one means writing its
  vertex range in place — `takeRollable`'s trick run forwards. No new draw calls.
- Pieces the census never saw (a plaque is transparent and never merged) get a **phantom**
  entry: moved with their course, never eatable, never counted.

## 3. What is built of stones, and what deliberately is not

Built: all 179 columns; the Great Portal's two piers (8 × 12 ashlars, carrying the lintel
together); the Temple of Venus's eight piers (carrying the entablature ring *and* the
cupola); the Planetary Palace's hall wall (7 × 11, carrying the roof with all twelve
columns); Cythera's four chariot gates (ashlar posts, thirteen voussoirs, the AD CYTHERAM
tablet and its lettering carried on the ring).

Not candidates, and why: the **Three Doors** wall is "hewen ovt in the verie rocke" and is
boulders on purpose; the **Polyandrion** is a ruin whose columns are already broken; the
**amphitheatre and terrace shells** are ground you stand on, with the walker's floors
registered against them; the **Fountain of Venus's** arcade is segmental and jewelled.

`scene._monoliths` lists everything the census rejects for being over six metres. It now
holds nothing but sea, sky, ground discs, roads and terrace shells.

## 4. Still owed

The bridge arches and the twenty fence gates (single tori); a rise parameter for `_arch`;
rubble landing on rubble; a stone thrown more than ~4 m drifting out of the roll-up's grid.

## 5. How it plays

| Mode | What the reader meets | What it owes / still owes |
|---|---|---|
| **Walk** | Coursed ashlar on the portal, the temple piers and the palace wall; real voussoir arches with keystones on the chariot gates. It looks better than the boxes did — the coursing gives the portal a scale it never had. Nothing falls: collapse needs the census, which only Roll builds. | — |
| **Tour** | An *architecture* note at the portal (stop 6) on drums, dowels and broken joints, citing Alberti VI–VII. The book's buildings do not fall down and the tour does not say they can. | — |
| **Dream** | Nothing — the dream's buildings are scenery. | — |
| **Fly** | Coursing is invisible at height; arches read. | — |
| **Roll** | The whole point. Drums at ~20 cm, ashlars at ~50 cm, voussoirs ~25 cm; the ball undermines what it is big enough to bite and watches the rest come down. Collapsed structures drop their colliders. | Nothing falls *on* the ball or on people. |
| **Layers** | None speak of it, by design. | — |
