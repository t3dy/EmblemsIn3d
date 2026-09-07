# The woodcut register — what it is trying to do, why it looks wrong, how to fix it

*Written 2026-09-07 at Ted's request: "The woodcut register doesn't really look right. I
don't understand why there are so many grid textures. It's supposed to make everything look
like a woodcut, not just a weird black and white situation." The register is **bracketed**
for now — nothing more is built for it until the approach below is decided — and this file
is the brief for whoever picks it up.*

---

## 1. What it is trying to do

The site has one world and two dressings (`src/shaders/HPStyles.js`). The **lit** register is
a warm garden: standard PBR materials, an afternoon sun, bloom. The **woodcut** register was
meant to render the same geometry *as if it were one of the 1499 plates*: cream paper,
black ink, no colour, shading carried by hatching, silhouettes carried by line.

The 1499 blocks have a very particular hand, and it is worth naming what it actually does,
because the current shader does almost none of it:

- **Contour first.** Everything is an outline: a clean, even, unbroken line round every
  form, and round every fold, leaf and moulding inside the form. The line has one weight.
- **Shading is sparse, and directional.** Where a form turns away from the light, the cutter
  lays *parallel* strokes — short, following the form's curvature, usually diagonal — and
  stops. Cross-hatching (two directions) is rare and reserved for the darkest hollows: a
  doorway, the underside of a cornice, the inside of a well. Most of a plate is bare paper.
- **No tone at all on the ground plane, sky, or water surfaces** unless they are the
  subject. Water is a few wavy horizontal lines; sky is nothing; grass is a scatter of tufts.
- **Texture is drawn, not shaded.** Foliage is leaf-by-leaf; masonry is a few course lines;
  a column's flutes are lines; marble is left white. There is no such thing as a "material"
  in a woodcut, only a drawing of a thing.
- **Line width is constant on the page**, whatever the size of the object — it is the width
  of the graver.

## 2. What the current shader does, and why it reads as "grids"

`woodcutLambert()` in `HPStyles.js` is a `MeshLambertMaterial` with a fragment stage injected
by `onBeforeCompile`. It computes the lit luminance of the pixel, subtracts a per-material
`tone` bias, and then cuts that luminance into **three hatch bands**:

| lit luminance | what is drawn |
|---|---|
| > 0.60 | bare paper |
| 0.50–0.60 | one set of parallel stripes (`c1`) |
| 0.27–0.36 | a second set at another angle (`c2`) — so a **cross-hatch** |
| 0.10–0.17 | a third, denser set (`c3`) — a **triple** hatch |
| < 0.035 | solid ink |

plus a rim term that inks the silhouette where the surface normal turns away from the eye,
and an inverted-hull black outline mesh on anything built with `outline: true`.

The stripes are functions of **object-space position** (`vWcPos * uFreq`, `uFreq` = 9):

```
c1 = 0.86·x + 0.50·y + 0.34·z
c2 = 0.90·y − 0.52·x + 0.20·z + 0.37
c3 = 1.9·(x + y + z)
```

That is the whole reason for the grids, and it is four separate mistakes stacked:

1. **The stripes are 3-D planes, not strokes on a page.** A stripe set is the intersection of
   a surface with a family of parallel planes in object space. On a flat wall those planes
   cut as straight lines, fine; on a cylinder they cut as ellipses; on a sphere as curves;
   and on any surface at a glancing angle they cut *densely*, because the planes are seen
   edge-on. Worse, the spacing on screen depends on the object's distance and orientation.
   A real cutter's strokes have constant spacing on the page. So the hatch reads as a
   *texture wrapped on the object* — a grid — instead of shading drawn over the picture.
2. **Two stripe sets at different angles = a grid.** Any pixel in the 0.27–0.36 band gets
   `c1` and `c2` together, and `c1`/`c2` are at roughly 60° to each other. That is a lattice,
   and because most of the world's materials carry a `tone` bias that pushes them into that
   band (hedges, dark stone, water, the ground), the *default* look of the world is a grid.
   The 1499 cutters cross-hatch perhaps one square inch per plate.
3. **The bands are chosen by `tone`, not by the drawing.** `tone` is derived from the *lit
   colour* of the material (`0.32 · (1 − luminance) − 0.02`), so a dark-green hedge is
   hatched in full sun, a black jasper wall is solid ink, and a grey path is a grid, whatever
   the light is doing. The cutter shades by *light*, and by *what the thing is*; a hedge in
   sun is drawn as leaves, not darkened.
4. **Object-space frequency is per-object, so every object is a different grid.** Big
   objects (the ground plane, the sea, the temple drum) get a coarse lattice; small ones
   (a plaque, an urn) a fine one; and the two never line up. The page looks like a
   patchwork of screens, which is exactly the "weird black and white situation".

There are three smaller problems on top:

- The **ground plane** has `rim 0` and a tone that puts it into the single-stripe band, so
  the whole meadow is ruled like paper. In the plates the ground is *nothing*.
- The **shadow map** is still on, so the sun's cast shadows fall into the hatch bands too —
  a tree throws a lattice on the path. Real plates cast shadows as a few strokes, or not at
  all.
- The **outline hull** (`scale 1.035`) gives a line whose width depends on the object's size:
  fat on the temple, invisible on an urn, and it fails on anything concave or thin.

The **textured** materials the lit register uses (plaques, the palace ceiling, the Hell
mosaic, the bath frieze, the leaf cards) are outside the shader altogether: they render as
plain colour or as their own drawn ink. The leaf cards were switched to ink silhouettes on
2026-09-07 and read well; the others show up as coloured rectangles in a black-and-white
world. That inconsistency is part of what Ted saw.

## 3. How it could be fixed

The short version: **stop making hatching a material property, and make it a screen-space
post-process driven by light and depth, with the drawing (contours, leaves, flutes,
courses) done by the geometry.** That is how every convincing "engraving" render works
(Winkenbach & Salesin's *computer-generated pen-and-ink illustration*, 1994; Hertzmann &
Zorin's *illustrating smooth surfaces*, 2000; the many "hatching shader" post-effects since).

Concretely, in order of payoff:

### 3.1 Contours from a screen-space edge pass (largest single improvement)

Replace the inverted hulls and the rim term with one **edge-detection pass** over the
depth and normal buffers (three.js has the pieces: render normals to a target, then a
Sobel on depth discontinuities and normal discontinuities). This gives:

- one line weight everywhere, in pixels, exactly like a graver;
- lines round *every* form and crease, concave or convex, thin or thick — folds, mouldings,
  leaves, flutes — without any per-mesh opt-in;
- no failures on the objects the hull cannot wrap.

Tune two thresholds (depth jump, normal angle) and one width (1.5–2 px at 1080p). Drop
`outline: true` everywhere once this is in.

### 3.2 Hatching in screen space, single direction, by shadow only

Keep a luminance buffer (the current Lambert, un-remapped), then in the same post pass:

- lay **one** set of parallel strokes in **screen space** (constant spacing and width on
  the page — 4–5 px apart at 1080p) only where luminance < ~0.45;
- a **second** set, crossing, only where luminance < ~0.15 *and* the pixel is in a cast
  shadow or a concavity (from the depth buffer's ambient-occlusion term, or simply the
  shadow map): doorways, undersides, the crypt;
- **never** on the ground plane, sky or water (mask by material id, or by a flat normal
  facing up with no occluder);
- rotate the stroke direction by a small amount per *object* (use an object-id buffer) so
  neighbouring forms are not hatched in lockstep, which is what makes hand cutting look
  handmade — but keep the spacing constant.

Strokes should be broken, not continuous: modulate their alpha with a low-frequency noise
along the stroke so they start and stop like cuts. The `wcLine` anti-aliased stripe is fine
as the primitive; the inputs are what change.

### 3.3 Draw the textures instead of shading them

The plates draw masonry as courses and marble as nothing. So in the woodcut register:

- stone walls: paper, plus their outlines, plus a few **course lines** — the
  `_surfaceTexture` "courses" already exist as a bump; draw them as ink lines instead;
- columns: flutes as lines (the bath's fluted columns already do this with thin boxes);
- foliage: the ink leaf cards (done);
- water: the `mode 1` wavy strokes are right in spirit; do them in screen space, sparse,
  and only near the banks and under things;
- grass: a scatter of tuft glyphs on bare paper, not a hatch;
- the coloured textured materials (plaques, mosaics, friezes, ceiling): give each a
  `woodcut` variant of its canvas painter — the same drawing in ink on paper (the
  `_plaqueTexture` already does this via `plaqueColors`; extend the pattern).

### 3.4 Light

One raking sun is right (that is the plates' convention too), but turn **shadow casting
off** in the woodcut register, or reduce it to a hard, unhatched shape at ~0.2 opacity that
the hatch pass then reads as "in shadow". The cutters do not draw cast shadows on the ground
more than a few strokes.

### 3.5 Paper

The page is not flat cream. A very light **paper texture** (fibre noise, 2–3% contrast)
under everything, slight vignette, and a faint **plate mark** rectangle would do more for
the "printed" feeling than any shading. Ink should be near-black brown (`INK = 0x241a10` is
right), with a 1-px soft edge — never pure black, never aliased.

### 3.6 What to keep

The per-material `tone` concept can survive as a *hint* to the post pass ("this is dark
stone: allow the second hatch") via an id buffer, but it should stop driving the pixel. The
rim term goes. `outline()` goes. `waterMat`'s wave mode becomes a screen-space mask. The
leaf cards stay.

## 4. Effort and order

1. Edge pass (depth + normal Sobel) as a `ShaderPass` in the existing composer — half a day,
   and the world will look like a drawing immediately, even with all hatching turned off.
2. Turn off the material hatch; render the Lambert to a luminance target; add the single
   screen-space stroke set masked by luminance — half a day.
3. Masks: ground/sky/water off; second hatch only in shadow/AO — a few hours.
4. Paper texture, ink softening, tuft glyphs for grass — a few hours.
5. Course lines on masonry and ink variants of the canvas textures — incremental, per asset.

Until then the register is bracketed. The lit garden is the site; the woodcut is a toggle
that says what it is.

## 5. References worth reading before starting

- G. Winkenbach & D. Salesin, "Computer-generated pen-and-ink illustration", SIGGRAPH 1994 —
  the stroke-texture idea: tone as *density of strokes*, texture as *kind of stroke*.
- A. Hertzmann & D. Zorin, "Illustrating smooth surfaces", SIGGRAPH 2000 — hatching direction
  from principal curvature; why object-space stripes look like grids.
- E. Praun et al., "Real-time hatching", SIGGRAPH 2001 — tonal art maps, the standard
  real-time approach; a screen-space variant is simpler here.
- The plates themselves: `C:\Dev\hypnerotomachia polyphili\site\images\woodcuts_1499\`. Look
  at #86 (trees), #94 (the ciborium: how a dome is shaded with a handful of strokes),
  #96 (the Hell lunette: the one place the cutter uses dense cross-hatch, and why),
  #147 (the theatre: architecture as pure line).
