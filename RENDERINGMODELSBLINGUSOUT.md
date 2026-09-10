<!-- tokens: ~3,304 -->
# RENDERING MODELS — how the nymphs got bodies

*Written 2026-09-09 because Ted asked for it: "give me an output
RENDERINGMODELSBLINGUSOUT.md explaining whatever the heck it is that you just did to bling us
out." Its companions are [`HUMANOIDS.md`](HUMANOIDS.md) (why the figures looked wrong in the
first place), [`DRAWCALLS.md`](DRAWCALLS.md) (why merging matters) and
[`IMPORTEXEMPLARS.md`](IMPORTEXEMPLARS.md) (the rules anything imported has to obey).*

**The one-line version:** the nymphs used to be flat cards cut from Botticelli's *Primavera*.
They are now real three-dimensional figures **wearing** Botticelli's paint. The pigment gives
the surface, the geometry gives the silhouette, and the silhouette was the only part the flat
card ever got wrong.

---

## 1. The problem, in one sentence each

There were two ways to draw a figure and each was half right.

- **The painted card** (`card`) is a photograph of a real Renaissance painting standing up in
  the world on a plane that turns to face you. It looks like a Renaissance painting, because
  it *is* one. It is also flat, so it swivels like a cardboard stand-up in a theme park, and
  it casts no real shadow.
- **The modelled figure** (`modelled`, `painted`) is a real body — a turned gown, tapered
  legs, a torso wider at the shoulder than the waist. It occupies space properly. It also
  reads as a **mannequin**, and `HUMANOIDS.md` §2a–2e is a long and honest account of why:
  no contrapposto, joints that intersect rather than bend, proportions off the canon,
  a silhouette that does not break, and everything symmetrical.

The card's own variant note admits the trade in as many words: painting "sidesteps fingers and
anatomy, which is what kept the built figures reading as mannequins however well they were
tuned."

**The assumption both options share is that the pigment and the flat plane come as a pair.**
They do not. That is the whole idea.

---

## 2. What projection actually is

Take the cut-out painting and use it as the **texture** on the modelled body, projected
straight down the view axis — the technique film people call *camera mapping* or *photo
projection*. The mesh is unchanged. Only its surface changes.

**Why it lands in the right places without any per-figure fitting.** Both things are a
standing figure at the same proportions seen from the front: the cutouts were all cut at one
scale, and the modelled build is on a canon. So a planar projection puts the painted head over
the head and the painted gown over the gown automatically. There is no rigging, no UV
unwrapping by hand, and no per-nymph adjustment.

It runs **after `contrapposto()`**, which matters: the mapping is computed from the posed
mesh, so a figure that shifts her weight takes her painted drapery with her.

### The first attempt came out black, and the reason is the interesting part

Every nymph rendered with a dark gown and pale vertical stripes.

The cutouts are centred on a fixed **448 × 896** card and deliberately **not** scaled to fill
it. They are cut at one scale so that the card carries each figure's true height relative to
the others — a short figure simply sits lower on her card. `paintedFigure()` wants exactly
that, because it shows the whole card at a fixed world size.

A projection wants the opposite. Mapping the mesh across the *whole* card meant a large share
of every sample landed on the transparent margin, and transparent pixels carry black RGB.

So `scripts/cutout_uv_bounds.py` now reads each PNG's own **alpha channel**, takes the tight
bounds of what is actually painted, and writes them into `src/data/figure_cutouts.json` as
`card_uv`. The measurements:

| figure | u range | share of card width | v range |
|---|---|---|---|
| flora | 0.210 – 0.790 | 58 % | 0 – 0.980 |
| mercury | 0.190 – 0.810 | 62 % | 0.003 – 0.850 |
| venus_bot | 0.212 – 0.786 | 57 % | 0.003 – 0.863 |
| grace_1 | 0.290 – 0.710 | 42 % | 0 – 0.913 |
| grace_2 | 0.292 – 0.705 | 41 % | 0.003 – 0.881 |
| grace_3 | 0.263 – 0.737 | 47 % | 0 – 0.910 |
| chloris | 0.225 – 0.772 | 55 % | 0.003 – 0.843 |

A Grace occupies **41 %** of her card's width. Nearly three fifths of every sample was landing
on nothing. That is the black.

### The mapping, now

Fit the mesh's **height** to the pigment's height, then use the *same physical scale* across —
**isotropic**. Because the card is 448 wide and 896 tall, one world unit must map to twice as
much in *u*-units as in *v*-units to cover the same number of pixels. Fitting width and height
independently is precisely what squashes a narrow figure across a wide card.

Three deliberate choices in `Cast.projectCutout`:

1. **No `alphaTest`.** The card needed alpha to cut the figure out of its background. Here the
   mesh *is* the figure, so an alpha cut would only chew its edges. The outline comes from
   the model.
2. **The UVs are inset ~2 %**, because the cutting script leaves a feathered edge and the
   very rim of the mesh would otherwise sample it.
3. **Geometry is cloned before its UVs are rewritten.** The part geometries are shared between
   figures; without the clone the first nymph projected would re-map every nymph in the world,
   and each would wear the last one's pose.

---

## 3. Why it is *cheaper* than the rung it replaces

This is the counter-intuitive result and it is measured, not argued.

Giving every part of a figure **one shared painted material** lets the draw-call compiler
merge parts it could not merge before. Merging requires the same geometry *and the same
material object* (`DRAWCALLS.md` §2); when each part wore its own colour, each part was its own
draw. So the projected figures come out with **331 fewer meshes** than the assembled rung they
replace, at identical triangles.

---

## 4. What each rung costs

`await hpDiag()` on the running page, all five measured at the **same version** (`main.js?v=359`),
standing at the Queen's court:

| rung | meshes | triangles | geometries | materials | shadow casters |
|---|---|---|---|---|---|
| `card` | 3 819 | 2 201 042 | 3 811 | 2 943 | 1 296 |
| `painted` | 5 952 | 3 101 652 | 5 936 | 2 709 | 3 763 |
| **`projected`** ← default | **5 621** | **3 101 652** | **5 614** | **2 674** | **3 432** |

Card → projected is **+47 % meshes and +41 % triangles**. That is *not* the projection's cost:
**a card is one mesh and any assembled figure is a dozen**, so it is the price of dimensional
figures at all. Against `painted`, the fair comparison, the projection is a net saving.

> An earlier version of this table, and the commit message that carried it, said +54 %
> triangles. That was measured against a card baseline taken before Polia's arcade shipped,
> so it compared two changes at once. The corrected figure is +41 %. The conclusion — over
> rule 7's 25 % gate — is unchanged.

**On rule 7.** `CLAUDE.md` rule 7 says stop and ask above 25 % added. Put to Ted with the
numbers, he answered: *"we have the different graphical options menu for a reason try them all
out ... don't be silly. bling us out."* Recorded as `DECISIONS.md` call 50, and the reading is
worth keeping: **the 25 % gate exists to stop a regression being slipped in unnoticed. It is
not a veto on a deliberate, measured, reversible choice with a menu behind it.**

---

## 5. The five rungs, and how to change them

**Graphics → *Nymphs & figures*.** Nothing is ever deleted; the earlier rung is always there.

| rung | what it is |
|---|---|
| `primitive` | a cone for the robe and capsules for the limbs — the founding manifesto look |
| `modelled` | a turned gown, tapered legs, a torso with a silhouette instead of a barrel |
| `painted` | the modelled build with the folds *painted* into the cloth rather than lit into it |
| **`projected`** | **the modelled build wearing the Botticelli cut-out — the default since 2026-09-09** |
| `card` | the flat painted panel that turns to face you |

---

## 6. The limits, stated rather than hidden

- **The back wears the front, mirrored.** This is camera mapping; there is only one painting
  and it faces one way. On a draped gown it reads as cloth and nobody notices. It would not
  survive a figure whose back was meant to differ from her front.
- **A garlanded rider keeps her built head**, in the projected rung exactly as on the card: a
  Botticelli figure brings her own head and would lose the wreath.
- **The woodcut register is untouched, and should stay untouched.** In `style.key ===
  'woodcut'` a flat outlined shape with hatching is not a failure, it is what a 1499 figure
  *is* (`HUMANOIDS.md` Option E). Projection is a lit-register answer to a lit-register
  problem.
- **Seven cut-outs, six female and one male.** Named characters get a chosen figure — Polia
  takes Flora, whose iconography is the beloved crowned with flowers; the Queen takes Venus,
  who in the painting already presides. Everyone else is seeded off her name so a row of
  nymphs is not one painting repeated.

---

## 7. The generative route, and where it stands

The literal reading of Ted's question — *take the Renaissance images and adapt them into 3-D
models* — is single-image-to-3-D reconstruction: feed a painting to a model, get a mesh back.
A spike is running on **TripoSR** (Tripo AI & Stability AI).

- **Licence: MIT, both halves.** The code repository is MIT, and the checkpoint on Hugging
  Face (`stabilityai/TripoSR`) also carries `license: mit`. Those are not always the same and
  were checked separately. This clears the concern that would otherwise have stopped it —
  several competing models are non-commercial.
- **No GPU on this machine**, and it turned out not to matter: `torch` is CPU-only, and
  inference still took **14.3 s**, with mesh extraction 3.4 s and a one-off 93 s to fetch the
  weights. I had predicted minutes; that was wrong and worth recording, because "you need a
  GPU" would have been a bad reason to not try. Everything lives in a scratchpad venv reusing
  the existing system torch; nothing was installed globally.
- **Two dependencies were avoided rather than forced.** It wanted `torchmcubes`, a C++
  extension needing a compiler, used in exactly one place for marching cubes — swapped for
  scikit-image, which ships a wheel. The subtlety: the file swaps vertices `[2,1,0]` after the
  call, which tells you the original returns `(z, y, x)`, so the shim reverses skimage's
  output to match rather than silently producing a mirrored mesh. It also wanted `rembg` and
  an ONNX runtime to cut the figure off its background — unnecessary, because our cutouts
  already carry an alpha mask.

### The result: it does not work, and the failure is instructive

Flora went in at 512 x 512 on mid grey. Out came a watertight mesh, 4 834 vertices and 9 676
faces with per-vertex colour, in three connected components — the figure plus two stray blobs.

**And it is unusable.** Viewed from the front it is a lumpy vertical column with a head-like
mass on top and something foot-like at the bottom; the surface is molten rather than modelled;
there is no readable anatomy and no drapery. **Seen from the side it is very nearly a slab.**
That last observation is the diagnosis: the model has essentially *extruded the painting*
rather than inferred a body from it. Which is the whole thing we were trying to escape — the
flat card again, in worse clothes.

Two honest caveats about the test, neither of which rescues it:

- It ran at `--mc-resolution 128`. A finer grid gives a finer *surface*, not a different
  *shape*, so it would sharpen the lumps rather than remove them.
- A standing figure is about 1 : 3.4, and these models expect an object that roughly fills a
  square frame, so a tall narrow subject occupies a thin strip and is an awkward input by
  construction. That is a property of nymphs, not of my framing.

**Why this was predictable and still worth doing.** Painted input is not photographic: Flora
has no depth cues a reconstruction model was trained on — no shading from a real light, no
parallax, no defocus — and Botticelli's drapery is *decorative* line, not a described surface.
The model had nothing to work from but the outline. Running it cost about twenty minutes and
now nobody has to wonder.

**The projection wins on the merits**, and this is why: it never *asks* where the third
dimension is. It takes the geometry from a body we already modelled and the surface from a
painting we already have, and neither has to guess at the other.

---

## Where the code is

| | |
|---|---|
| the projector | `src/systems/Cast.js` → `projectCutout()`, and `CUTOUT_UV` |
| the rungs | `src/systems/AssetVariants.js` → `ASSETS.figure` |
| measuring the cards | `scripts/cutout_uv_bounds.py` → writes `card_uv` |
| provenance | `src/data/figure_cutouts.json` — source, artist, date, holding institution, licence basis, crop box |
| the decision | `DECISIONS.md` call 50 |
