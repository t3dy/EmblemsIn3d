# Dream Mode — the game: thirteen stops, four moods, and what a stop owes

*Subject brief, 2026-09-08. `src/systems/DreamMode.js`, scripted by `src/data/hp_dream.js`
(the stops) and `src/data/hp_reactions.js` (the choices). Entered from the *Poliphilo's
Dream* card. Read with [`MODES.md`](MODES.md) and [`GAMIFYVRHP.md`](GAMIFYVRHP.md), which
argued for it.*

---

## 1. What it is

The plot of the book in thirteen scenes, walked. At each stop the dreamer is led along a
path (a Catmull-Rom through waypoints, on the walker's own feet, a guide nymph walking
ahead), settles to look at the wonder, and reads the beats — our prose, close to the book,
with the book's own words quoted under a tag that says whose words they are (`1592`
Dallington, `1499` the Aldine's Latin and Greek, `ours` for what Dallington never reached,
with the facsimile page). Then, where the book gives Poliphilo a feeling, the player is
asked **how he meets it**: the response the book gives (`canonical`), or one of four moods
— *wonder*, *eros*, *melancholy*, *dread* — each written to stay inside Colonna's register.
Choices are **expressive, not branching** (`DESIGN.md`): you author a temperament and the
dream reaches the same shore. The tally is a self-portrait at the waking, and the world
answers each choice in light (`setDreamMood`).

## 2. The thirteen

wood · portal · elephant · court · doors · palace · polia · triumphs · quinta · fountain ·
cythera · **adonis** (added 2026-09-08) · awakening.

Two stops **jump** before they walk (`jump: [x, z]`, added the same day): *adonis* to the
island, because the crossing is Cupid's and no path reaches Cythera on foot; *awakening*
back to the shore. The engine puts the dreamer down and continues the path from there.

## 3. What a stop owes, and what a reaction is for

A stop owes a **path that the walker can walk** — every collider added near one must be
checked against `hp_dream.js`, because a table on the line stalls the game; a **look** that
faces the wonder when it settles; **beats** that carry the plot without paraphrasing the
quoted matter; and a **guide** where the book gives one.

A reaction is for the moments where the book records what Poliphilo felt. One per stop is
the engine's limit; the canonical option must be *what the text says*, and the other three
must be things he *could* have felt in that register — not jokes, not modern. The tomb's
canonical mood is wonder (the kiss "with utmost religion"); the boat's is eros; the waking's
is melancholy.

## 4. Still owed

- **One reaction per stop** means the banquet — a whole evening inside the *court* stop —
  has no moment of its own; the court's reaction is the nymphs'. A second reaction keyed by
  beat is the engine change that would let the supper, the cloth in the fire and the waiter
  who moves like Polia be chosen on.
- The **chess ballet** and the **water-labyrinth** are named in beats and never walked to.
- The dream does not use the tour's commentary layers by design ("no commentary; this one is
  the game"), and should not.

## 5. How the other modes look from here

| Mode | Relation |
|---|---|
| **Walk** | The same world; the dream locks the walker and drives it. Stations are not stops: the dream has thirteen, the walk has twenty-three. |
| **Tour** | Sibling. The tour is descriptive and layered; the dream is plotted and mooded. A scene in one should exist in the other, and the tomb now does in both. |
| **Fly** | Never coexist. |
| **Roll** | Never coexist. |
| **Layers** | None, on purpose. The *Poliphilo speaking* layer is the tour's version of what the reactions are for the game: the narrator's own feeling, catalogued versus authored. |
