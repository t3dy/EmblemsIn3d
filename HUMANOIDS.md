# HUMANOIDS — why the figures look wrong, and the options for fixing them

*Written 2026-09-09 from Ted: "all the humanoid and animal figures you've created look like
shit… what options you might take drawing on standard methods for computer animation that
could create more lifelike and Renaissance art-like characters."*

*The frame this file works inside, in his words: **"The primary goal for this project is not
to create a commercial video game experience but rather to create a digital humanities
product that has educational and meditative purposes."** That changes the answer. A game
needs figures that read at speed from any angle while running; a meditative instrument needs
figures a person can **stand still and look at**, which is a harder problem in some ways and a
much easier one in others.*

Companion: [`ANIMALS.md`](ANIMALS.md) §4 for quadrupeds, which fail differently.

---

## 1. What is actually there now

Two registers, and `figVariant()` switches between them (`src/systems/Cast.js`).

**The built figure** (`nymph()`, ~line 1068). A gown **lathed** from a 14-point profile — a
genuinely good technique, and the best thing in the system; a cylinder neck; a scaled sphere
head; hair as overlapping shaped lobes; torus bands for hem, neckline and girdle; arms placed
from a table of eight named poses (`stand`, `offer`, `carry`, `point`, `beckon`, `reach`,
`sit`, `recline`), each three numbers a side.

**The painted card** (`paintedFigure()`, ~line 913). One flat quad, 448 × 896, carrying
either a procedurally painted figure or a **cut-out from a real Renaissance painting**.
Billboarded.

**The animation** is `_npc` idle sway plus a small arm breathe.

---

## 2. Why it looks wrong — five causes, in order of how much they hurt

The instinct is "not enough polygons". That is the least of it. In rough order:

### 2a. There is no contrapposto, and this is the whole problem

Every figure stands with weight evenly on both feet, hips level, shoulders level, spine
vertical, head straight. **There is no such figure in Renaissance art.** From Donatello's
*David* onward the canonical standing pose is contrapposto: weight on one leg, that hip
**rises**, the shoulders **counter-tilt** the other way, the spine makes a shallow S, and the
head turns slightly off the axis of the hips.

The four lines that produce it — the line of the hips, the line of the shoulders, the axis of
the spine, the direction of the gaze — are *never parallel*. Ours are all parallel, which is
what "stiff", "toy-like" and "shop mannequin" all actually mean.

**This is a pose fix, not a modelling fix, and it is available today.** The lathed gown can
be sheared and tilted; the head is already a separate part with a tilt applied; the shoulders
are a table of numbers. **Highest value per line of code in this entire document.**

### 2b. Joints do not bend, they intersect

An arm placed from three numbers is a rigid rod rotated at the shoulder. Where it meets the
body the two surfaces simply pass through each other, and where the elbow should be there is
either a visible seam or a sphere doing duty as a joint. The eye reads intersecting rigid
solids as *assembly*, not as *body* — this is the single strongest "made of parts" cue, and
it is why a figure can have correct proportions and still look like a doll.

### 2c. The proportions are not on a canon

The head is a sphere of `0.100 * h` scaled to 0.94/1.08/0.96, on a body of height `h` — about
**seven heads tall**, near the classical canon, which is fine. But the *internal* divisions
are not: the high waist at `0.978 h` is the 1499 cinch and correct for the costume, while the
shoulder at `1.31 h` and the neck at `1.40 h` leave a neck that is short and a head that
sits low. Alberti's *De statua* and Leonardo's canon both put the chin at about ⅞ of standing
height. Ours is at about 0.85 — subtly wrong, and "subtly wrong proportions" is exactly what
the eye reports as "looks off" without being able to say why.

### 2d. The silhouette does not break

Every form is a solid of revolution or a sphere, so from any angle the outline is a smooth
convex curve. Real figures — and *painted* figures especially — have silhouettes that break:
a sleeve falls away from the arm, hair breaks the skull's circle, drapery pools and catches.
The hair lobes already do this deliberately and the comment in the code says so. **Nothing
else does.**

### 2e. Everything is symmetrical

Both arms in the same pose mirrored, hair the same both sides, gown the same all round. Real
figures and painted ones are asymmetrical at every scale, and cheap asymmetry buys a
disproportionate amount of life.

---

## 3. The standard methods, and which of them are worth it here

### Option A — Better authored poses on the geometry that exists

**Effort: days. Risk: none. Payoff: very large.**

- **Contrapposto as the default `stand`.** Weight leg, raised hip, counter-tilted shoulders,
  S-curve spine, head off-axis. Ship it as the base pose and let every figure inherit it.
- **Shear the lathed gown** so it is not a body of revolution about a vertical axis. A lathe
  can be built about a *curve* — sweep the profile along a slightly S-shaped spine instead of
  a straight one and the gown gets a body inside it.
- **Break the symmetry.** One sleeve longer, hair heavier on one side, the girdle knot to one
  side, a 3–7° yaw between hips and shoulders.
- **Fix the canon.** Chin at ⅞ height; lengthen the neck; raise the shoulder line.

**Do this first regardless of what else is chosen.** It is the cheapest and it is the largest
single improvement available, and every later option inherits it.

### Option B — One continuous surface instead of assembled parts

**Effort: a week or two. Risk: medium. Payoff: large.**

The intersection problem (§2b) disappears if the body is one skin. Two standard ways, both
already partly present in the toolkit:

- **Sweep/loft along a spine** — take cross-sections (chest, waist, hip, thigh, calf) and
  loft a single surface through them. This is how `gownGeometry` already works, generalised
  from a straight axis to a curve. The project's own `threejs-procedural-geometry` skill
  covers profile extrusion and spine lofts.
- **Metaballs / implicit surfaces** — place spheres as we do now, but extract one isosurface
  through all of them so limbs *merge* into the torso instead of poking through it. Elegant,
  and the merge is automatic. Costs a marching-cubes pass at build time.

### Option C — A real skeleton and skinned mesh

**Effort: substantial. Risk: high. Payoff: large, but mostly for motion.**

The industry-standard answer: build one mesh, bind its vertices to a bone hierarchy with
weights, pose the bones. Three.js supports it natively (`SkinnedMesh`, `Skeleton`, `Bone`),
and glTF carries rigs and animation clips, which the project already imports for a few
models.

**What it buys:** joints that bend instead of intersecting, and the ability to *animate* —
which matters because Ted wants **"a Poliphilo figure acting out his reactions."** Reactions
are motion, and rigid parts cannot act.

**What it costs:** the rig has to be authored, and hand-writing bone weights in code is
miserable. The honest route is to model and rig one figure in Blender, export glTF, and drive
it from a small library of authored clips. That is a real content pipeline where today there
is none, and it puts a binary asset at the centre of a project whose whole aesthetic argument
is that it generates its own imagery.

**Recommendation: worth it for Poliphilo alone, and for no one else.** He is the one figure
who must act. The nymphs can be still — they are still in the woodcuts.

### Option D — Lean into the painted card, which is already half-built

**Effort: small. Risk: none. Payoff: possibly the largest of all, for this project.**

`paintedFigure()` already puts real Renaissance painting into the world as cut-out figures.
This is not a compromise: it is arguably the **most honest** register a digital-humanities
edition can use, because it puts *actual period images* in front of the reader instead of our
guess at what a period figure looked like in three dimensions.

Its problems are solvable and none are conceptual:

- **It is one flat plane**, so it shears when you walk past it. Fix: two or three cards at
  slight angles (a shallow "card fan"), or a mesh cut to the figure's *silhouette* and given
  a gentle cylindrical curve. Both are standard impostor techniques.
- **It billboards**, so it swivels to face you, which reads as a cardboard stand-up. Fix:
  billboard about the Y axis only, and **damp it** — let the figure resist turning until you
  have moved far enough that the shear would show. A figure that does not quite follow you is
  far less uncanny than one that snaps.
- **It casts no shadow**, so it floats. There is already a contact-shadow hack; a proper
  alpha-tested shadow caster from the same card would ground it.

### Option E — Draw them the way the book does

**Effort: small. Risk: none. Payoff: register-dependent.**

The project already has a **woodcut register** (`style.key === 'woodcut'`). In that register
the *correct* answer to "these look like assembled primitives" is that a 1499 woodcut figure
IS a flat outlined shape with hatching, and looks nothing like a photograph. Flat fill,
strong ink contour, hatched shadow — the failure mode of primitives (no volume) stops being a
failure and becomes the idiom.

**The lit register is where the problem actually lives.** Worth saying explicitly, because
half the complaint may evaporate under the right lens.

---

## 4. Making them move: what "acting out his reactions" needs

> **BUILT 2026-09-09** — `HPWorldScene._buildWitness`. Items 1, 2 and 5 below, and no rig:
> eleven authored poses mapped to seventeen stations off the *occasion* each utterance
> records, an ease-out-back over nine tenths of a second, a head turn, and a slow breath so
> he is never quite still. He stands where the plates put him — at the edge of the scene,
> three-quarter to the viewer, looking at the wonder rather than at you.
>
> **The two things that had to be fixed for him to exist**, both worth knowing before you
> animate anything else here: `figure()` returns a painted **card** by default, and a card is
> a flat quad with no arms and no head to turn — so `built: true` was added for him alone.
> And the draw-call compiler **merges** everything it is not told to leave alone, which bakes
> a figure at the origin in world space; unmerged, he moved, merged he was invisible
> everywhere and present nowhere. Anything that must move must be marked in
> `_compileDrawCalls`.
>
> Items 3 (secondary motion) and 4 (IK) are still open, and item 4 is the one that would let
> him actually take the rose.


Ted wants Poliphilo to react visibly as the text reaches each moment. The standard toolkit,
cheapest first:

1. **Authored pose library + interpolation.** A dozen named poses — *wonder, terror,
   kneeling, weeping, shielding the eyes, reaching, recoiling* — and smooth interpolation
   between them. This works on the geometry that exists **today**, needs no rig, and is very
   likely enough. The eight-pose table is the seed of it.
2. **Easing that is not linear.** Ease-out on the arrival, a small overshoot and settle. This
   one change does more for perceived life than any amount of extra geometry.
3. **Secondary motion.** Hair and drapery lagging the body by 100–200 ms. Cheap spring
   follow, no simulation needed; the `threejs-procedural-animation` skill covers spring-follow
   and frame-rate-independent response.
4. **Inverse kinematics**, only where a hand must actually reach a named object — the rose,
   the torch, Polia's hand. Two-bone IK is about thirty lines.
5. **Gaze.** Cheapest of the lot and the most powerful: the head turning to look at what the
   commentary is talking about. A figure that looks at the thing you are reading about is
   *acting*, whatever its polygons are doing.

**Do 1, 2 and 5 before considering a rig.**

---

## 5. Recommendation

| | do it? | why |
|---|---|---|
| **A — contrapposto, canon, asymmetry** | **yes, first** | cheapest, largest, and everything else inherits it |
| **D — the painted card, done properly** | **yes** | already half-built; the most defensible register for a DH edition |
| **E — accept the woodcut idiom in the woodcut register** | **yes** | free; removes half the complaint from half the world |
| **4.1 / 4.2 / 4.5 — poses, easing, gaze** | **yes** | this is what "acting out his reactions" actually requires |
| **B — one continuous surface** | later | fixes the deepest modelling cause; needs a real pass |
| **C — a rig, for Poliphilo alone** | later, if at all | the only figure that must act; brings a binary pipeline the project has so far avoided |

**The one-line version: they look wrong because they stand wrong, not because they are made
of spheres.** Fix the standing first and re-look before spending a week on geometry.

---

## Sources to read before building

- **Leon Battista Alberti, *De statua*** — the *exempeda*, the canon of proportion by
  sixths. Alberti is already in the corpus for architecture and is the right authority for
  the figure too.
- **Leonardo, the Vitruvian canon** — head-count divisions, and the shoulder and hip lines.
- **The 1499 woodcuts themselves** (`hp.db.woodcut_catalog`, `site/images/woodcuts_1499/`) —
  for every figure the book actually draws, in the pose the book actually gives it. **Rule 3:
  read the book before you model the book.** Nothing in this file outranks a plate.
- **`NYMPHS.md` and `CHARACTERS.md`** — who these figures are and what they are doing.
- **`RENAISSANCEART.md`, `IMPORTEXEMPLARS.md`, `LICENSECHOICES.md`** — for the cut-out
  register: which paintings, and on what licence.
- Project skills: **`threejs-procedural-geometry`** (profile extrusion, spine lofts,
  solidify), **`threejs-procedural-animation`** (spring follow, quaternion control,
  frame-rate-independent response).
