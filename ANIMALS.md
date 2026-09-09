# Animals and beasts

*Which creatures the book puts in the world, what they are doing there, and how they are
built.*

**Read first** (`SOURCES.md` asset map): `hp.db.folio_descriptions` and `woodcut_catalog`
for the folio in question; **Curran** for the elephant and the Egyptian beasts; **Nygren**
where a beast is statuary rather than flesh.

---

## 1. The beasts that carry meaning

### The wolf
The first living thing in the dream. It watches the path in the Dark Wood and does not move
— the dreamer's terror is that it is *indifferent*, not that it attacks. Built as a
quadruped in `Cast.animals.wolf`, placed by `_buildWood()` and labelled.

### The elephant bearing the obelisk
The book's central Egyptian-revival monument and Curran's subject. Not an animal so much as
a piece of architecture in animal shape: a hollow stone beast on a porphyry base, carrying a
green Lacedaemonian obelisk, with a door in its flank and an inscription on its frontlet —
ΠΟΝΟΣ ΚΑΙ ΕΥΦΥΙΑ, *labour and native wit* — and CEREBRVM EST IN CAPITE on the breast-strap.

It was a squashed sphere, four cylinders and a sphere head. It is now modelled from the 1499
plate **and from Bernini's *Elephant and Obelisk* of 1667** — the direct descendant of this
design, and already in the project's Gallery. It has a barrel built from three masses (an
elephant has a distinct shoulder and rump), columnar legs with the broad foot pads that make
an elephant legible, a domed skull with the woodcut's high forehead, large dished ears,
curved two-segment tusks, an eye, a tail, and Bernini's tasselled caparison seating the
obelisk.

**Variants** (Graphics menu → *The elephant & obelisk*): `primitive` and `massed`.

### The dragon
Poliphilo flees it through the dark vaults beyond the Great Portal — one of the book's few
moments of physical danger. `Cast.animals.dragon`.

### The ant and the elephant
The book's own hieroglyph of concord and discord as one thing: the ant that grows into an
elephant and the elephant that dwindles into an ant. Built as an animated hieroglyph
(`_hiero`), and the ant is one of the six signs in the carved hieroglyph bands on the Great
Portal's piers (`ORNAMENT.md`).

### The teams of the triumphs
Six beasts to a car, each with a rider: **centaurs** for Europa, **elephants** for Leda,
**horses** for Danaë, **leopards** for Semele. See `VEHICLES.md`.

### Venus's doves
They dip their golden bills in the spotless waters and bedew the goddess — the Theatre of
Venus. Built as birds about the fountain.

---

## 2. The wider bestiary

`Cast.animals` carries, and the Atalanta side of the project uses heavily: wolf, dog, lion,
stag, unicorn, bull, sow, goat, horse, toad, serpent, dragon, ouroboros, bird, eagle, crow,
swan, hen, fish, salamander.

Several of these are alchemical rather than zoological — the ouroboros, the salamander in
fire, the toad. They belong to Maier's emblems more than to Colonna's dream, and are
documented on that side of the project.

---

## 3. How a beast is built

All are primitive-built groups in `Cast.js`, most from a shared `quadruped()` with
parameters for bulk, neck, head and horns. They are registered as NPCs so they sway gently
rather than standing frozen, and they are fenced off from the draw-call compiler so that
motion survives the merge.

## 4. Why they read badly, and what the options are

*Added 2026-09-09 from Ted: the animal figures "look like shit", and he asked what standard
computer-animation methods could make them **more lifelike and more like Renaissance art**.
[`HUMANOIDS.md`](HUMANOIDS.md) is the companion; the human figures fail differently and that
file leads with contrapposto. Quadrupeds fail for four other reasons.*

The frame, in his words: this is **"a digital humanities product that has educational and
meditative purposes"**, not a commercial game. Animals here are looked *at*, standing still,
often for a while. That rules some techniques out and rules a cheaper one in.

### 4a. `quadruped()` is a good skeleton wearing the wrong flesh

The shared builder has real anatomy and deserves credit for it: a capsule barrel, distinct
chest and haunch masses, a connecting neck at the right angle, two-segment legs with feet,
and a head that is a **group** so species can pin horns, manes and antlers into it. That is a
far better foundation than the sphere-and-cylinder blob it replaced.

What it does not have is what makes an animal legible:

**1. No species silhouette.** Every beast is the same barrel at the same proportions with
different parameters. But a wolf is not a lion with different fur — the recognisable
difference is almost entirely in the **outline**: a wolf's chest is deep and narrow and its
belly tucks up sharply behind the ribs; a lion's barrel is level and its shoulders sit higher
than its hips; a stag's whole body hangs from a long sloping neck. **Silhouette is species.**
Change `bulk` and you change nothing an eye recognises.

**2. Nothing tapers.** Real limbs narrow from shoulder to fetlock in a continuous curve.
Ours are two cylinders of fixed radii meeting at a hard step, so every animal has visible
knee joints of the wrong kind. A single lofted taper down each leg would remove the strongest
"assembled from parts" cue in the bestiary.

**3. The legs are posed identically, and all four are straight.** No animal stands with four
legs plumb. A standing quadruped is asymmetrical: one foreleg advanced, the weight off one
hind, the head turned off the body axis. The same argument as contrapposto for the human
figures, and the same cheap fix.

**4. The head is too small and too far forward.** A skull of `0.14 s` radius on a barrel of
`0.20 s` reads as a toy — most quadrupeds have a head much closer to the depth of their own
chest. The wolf especially.

### 4b. The options, cheapest first

| | effort | payoff | what it is |
|---|---|---|---|
| **Per-species proportion tables** | hours | **very large** | Stop deriving every beast from one set of numbers. Give each its own chest depth, belly tuck, shoulder-to-hip height difference, leg length and head size. Nothing new to build; the parameters already thread through `quadruped()`. |
| **Asymmetric standing pose** | hours | **large** | One foreleg advanced, weight off one hind, head turned 8–15°. Per-species, seeded, so a herd is not a rank. |
| **Tapered legs** | a day | large | Loft each leg as one narrowing surface instead of two cylinders and a foot. Removes the joint-step. |
| **Silhouette pass against the plates** | a day | large | Rule 3. `hp.db.woodcut_catalog` draws these animals. Trace the outline the 1499 cutter gave the wolf and match *that*, not a photograph. |
| **One continuous skin** | a week | large | Metaballs or a lofted body so limbs merge into the barrel instead of intersecting it. See `HUMANOIDS.md` §3B. |
| **A walk cycle** | a week | large, but only for the teams | The triumph teams do not walk, which is the most visible failure in the bestiary because six beasts pulling a car are obviously frozen. A four-beat gait needs no rig — it is four leg groups on a phase offset, and the legs are already groups. |
| **A rig and skinning** | substantial | large | `SkinnedMesh` + glTF, as `HUMANOIDS.md` §3C. Brings a binary content pipeline. **Only if a beast must genuinely act.** |

### 4c. "Renaissance art-like" is a real constraint, and it helps

Colonna's animals are not observed from life. They are **emblematic**: the elephant is
Egyptian revival by way of a hieroglyph, the wolf is an attribute, the unicorn is a device.
The 1499 cutter drew them as flat outlined shapes with hatching, and several of them — the
lion especially — are drawn by someone who had plainly never seen one.

Two consequences worth stating plainly:

- **In the woodcut register, primitive-built animals are not a failure but the idiom.** Flat
  fill, strong contour, hatched shadow. The problem is in the lit register.
- **In the lit register, the target is not photorealism — it is quattrocento painting.**
  Pisanello's studies, Uccello's beasts, Gozzoli's hunting parties. Those animals are
  observed and stylised at once: crisp silhouette, simplified volume, decorative surface.
  That is a *much* easier target than a real animal, and it is the honest one for a book that
  cares more about what a beast means than what it looks like.

**The elephant is the proof.** It is the only beast with a modelling pass — built from the
1499 plate *and* from Bernini's descendant of it — and it is the only one nobody complains
about. What it got was not more polygons: it got **three masses instead of one** (an elephant
has a distinct shoulder and rump), the woodcut's own high forehead, and a silhouette taken
from a source. Do that to the wolf and the wolf will be fine.

### 4d. Recommendation

1. **Per-species proportion tables** and **asymmetric stance**, together, in one pass. Hours
   of work, and it addresses the actual complaint.
2. **Silhouette pass against the plates**, wolf first — it is named in §5 as the worst.
3. **Tapered legs.**
4. **A walk cycle for the triumph teams**, which is the one place stillness is indefensible.
5. Everything else only if 1–4 leave it still wrong.

---

## 5. Known gaps

- **The griffins and harpies of folio 80's fountain are not built.** The harpies exist as
  small carved figures on the portal; the griffins do not exist at all. Open in
  `NEXTSTEPS.md`.
- The beasts have **no variant ladder** — unlike trees, figures, water and ornament, there is
  only one build of each. The elephant is the exception.
- Anatomy across the bestiary is uneven: the elephant has had a modelling pass, the rest have
  not. The wolf in particular reads as a smooth quadruped rather than a wolf.
- No animation beyond idle sway. The triumph teams do not walk.

## 6. Where the code is

| | |
|---|---|
| The bestiary | `src/systems/Cast.js` — `animals.*`, `quadruped()` |
| The elephant | `src/scenes/HPWorldScene.js` — `_buildElephant()` |
| The wolf in the wood | `_buildWood()` |
| The triumph teams | `_buildTriumphs()` |
| Variant registry | `src/systems/AssetVariants.js` — asset `elephant` |

See also [`HUMANOIDS.md`](HUMANOIDS.md) for the human figures, and
[`DRAWCALLS.md`](DRAWCALLS.md) before adding geometry in bulk.
