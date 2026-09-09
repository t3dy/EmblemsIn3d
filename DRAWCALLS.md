<!-- tokens: ~2,333 · read for: why the world costs what it costs, and the merge we declined -->
# DRAWCALLS — what a draw call is, why merging helps, and what it would actually buy

*Written 2026-09-09 at Ted's request: "I don't really understand the considerations about
merging static geometry per material and draw calls… I want to understand these
considerations." Nothing here is a proposal. The refactor was measured, offered and
**declined** on 2026-09-09 (`DECISIONS.md` call 1), and Ted has since said plainly that the
project is a digital-humanities instrument and **space is not to be traded for speed**. This
file exists so the trade is understood, not so it gets made.*

---

## 1. What a draw call is

The browser talks to the graphics card the way you would talk to a very fast worker who has
no memory. To put one thing on screen, the CPU has to say: *here is the shape; here is the
paint; here is where it stands; now draw it.* That whole exchange is **one draw call**.

The card draws the shape almost instantly. **The expensive part is the conversation, not the
drawing.** A modern GPU will happily push ten million triangles. What it will not do is have
five thousand separate conversations in the sixteen milliseconds you have to make a frame at
60 fps.

So the question is never "how much geometry is there". It is **"how many separate times did
the CPU have to explain something to the GPU"**.

Our numbers, measured with `hpDiag()`:

| standing in | draw calls | triangles |
|---|---|---|
| the dark wood | **3 124** | 2 923 148 |
| the spacious plain | **68** | (almost nothing in view) |

Two things follow immediately, and the second one matters more than the first.

**The triangles are not the problem.** 2.9 million is unremarkable. If triangles were the
cost, the wood would be fine.

**Cost is a property of the view, not of the world.** The world holds 3 788 meshes; the
frustum culler throws away everything behind you and everything past the far plane before a
single call is issued. On the plain almost nothing is in view and the frame costs 68 calls.
In the wood you are standing inside a hundred and ninety trees, each with four opaque leaf
shells and a trunk, all within a few metres — nothing culls, and you pay for all of it.

**This is why the earlier "the world is slow" investigations went nowhere.** They were
looking for one expensive object. There isn't one. There is one expensive *place*.

---

## 2. Why the count is so high: nothing shares its paint

Three.js can draw two objects in one call only if they share **both** the same geometry and
the same material *object* — not a material that happens to look the same, the literal same
JavaScript object in memory.

Ours share neither:

*Re-measured 2026-09-09 after the Great Portal rescale. The earlier reading in this
table was 3 688 meshes / 2 932 materials / 808 appearances; the hundred meshes since are the
spacious plain and the dark wood, not the portal, whose new base storey is ashlar and merges.
The proportion — which is the point of the table — did not move.*

| | count |
|---|---|
| meshes | 3 788 |
| unique geometries | 3 780 |
| **material objects** | **2 943** |
| **distinct material *appearances*** | **819** |
| **duplicate materials** | **2 124 (72 %)** |

The cause is one function, `HPStyles.mat()`:

```js
mat({ color = 0x8a7a5a, roughness = 0.85, ... } = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, ... });   // brand new, every call
}
```

Every call makes a new object. Twelve hundred stones cut from the same limestone get twelve
hundred separate limestone materials. The worst single case the instrument found: **210
separate material objects that are all the same gold.** Then 170 that are all the same dark
paint, then 150 that are all the same ivory.

To the GPU those 210 golds are 210 different paints, so it is 210 conversations instead of
one.

---

## 3. The two fixes, and what each is actually worth

### Fix A — share the materials (2 932 → 808)

Hand back the *same* material object when the parameters match. Cheap to write, and there is
a trap: several places in our code change the material after they receive it
(`duffMat.roughnessMap = null` in the wood), and if that material were shared, the change
would leak into every other object using it — a silent, world-wide visual bug.

**What it saves on its own: almost no draw calls.** This is the part that surprises people.
Three.js still issues one call per mesh; it just stops re-uploading the same paint
description over and over. Expect a modest CPU saving — perhaps **5–15 %** of frame time in
the wood, no change at all to the 3 124.

**Its real value is that it is the precondition for Fix B.** You cannot merge objects that
do not share a material.

### Fix B — merge the static geometry (the big one)

Take every object that never moves and shares a material, and glue their triangles into one
big buffer. Two hundred limestone blocks become one limestone mesh with the triangles of two
hundred blocks in it. **One conversation instead of two hundred**, and the picture on screen
is pixel-for-pixel identical.

**What it would save: draw calls 3 124 → plausibly ~600, and the wood's frame time from
~38 ms to somewhere near 12–16 ms.** That is roughly 26 fps to 60. It is by far the largest
single performance win available in this project, and it is not close.

**And it is the one we are not doing**, for a reason that has nothing to do with rendering.

---

## 4. Why we are not doing it: the ball

Merging destroys individuality. Once two hundred blocks are one buffer, there are no longer
two hundred blocks — there is one mesh with a lot of triangles. It has one name, one
position, one bounding box.

Roll Up needs the opposite of that. It walks the scene and takes a census of every mesh,
measures each one, gives each one a name, and lets the ball eat things smaller than itself
one at a time. **A merged wall cannot be eaten block by block, because after the merge there
are no blocks.** It can only be eaten as one impossible object, or not at all.

So the trade, stated plainly:

> **Every draw call you save is an object the ball can no longer eat.**

Ted, 2026-09-09: *"I want everything in the world of our virtual dream garden to be roll up
able. All of the architecture needs to be built out of individual objects."* That is the
opposite instruction, and it is the right one for what this project is. It means the object
count should go **up** over time, not down, and the frame cost with it.

There is a version where both are true — the world is authored twice, once as merged scenery
for walking and once as loose blocks for rolling, and the mode swaps between them. That is a
real technique and it is what a commercial game would do. It is also a second copy of the
entire world to keep in step, and this project has one writer. It is noted here as the exit
if the frame rate ever becomes intolerable, and as **the reason Ted's remark about one day
separating Roll mode from the virtual world is the strategically important one**: that split,
not any renderer trick, is what would let both goals be met at once.

---

## 5. The cheap things that are still available, if speed ever does matter

None of these cost an object, so none of them conflict with the ball. In rough order of
value:

1. **Fewer shadow casters.** 1 289 of the 3 788 meshes cast shadows and each of those is
   drawn a *second* time into the shadow map — that is 1 289 of the 3 124 calls, more than a
   third of the frame, spent on shadows most of which are too small to resolve. Culling
   casters by size and distance is invisible and free. *The one exception: the dark wood's
   darkness IS cast shadow, so the wood must be re-checked by eye after any such cull.*
2. **Level of detail in the wood.** A tree 120 m away does not need four leaf shells. One
   card would do. This is the single biggest saving available in the one place that is slow.
3. **A smaller far plane, or fog that actually hides things.** The camera's far plane is
   1 400 m for the pyramid approach. Everything inside it is considered every frame.
4. **Instancing the repeated things.** The twenty Cythera gates, the balusters, the leaf
   cards: `InstancedMesh` draws a thousand copies of one shape in one call and each copy
   still has its own transform. Only 11 meshes in the world use it. **This one is
   interesting because instanced copies remain individually addressable**, so with care it
   might not cost the ball anything — the most promising unexplored direction.

---

## 6. What to do with this file

Nothing, for now. It is here so that:

- the next agent who notices 3 124 draw calls finds the answer instead of re-deriving the
  question, and does not re-propose the refactor;
- if the frame rate ever does become intolerable, the options and their real prices are
  written down, with the ball's claim on each of them made explicit;
- and the strategic point is on the record: **the merge and the katamari are the same
  decision, seen from two ends.** Deciding to build every wall out of individual stones is
  deciding to pay for them in draw calls, forever, and that is a legitimate choice for a
  digital-humanities instrument in a way it would not be for a commercial game.

Measurements: `await hpDiag()` on the running page. `ENGINEERING.md` §1 for the method,
`ROLLING.md` for the ball, `DECISIONS.md` 2026-09-09 for the calls.
