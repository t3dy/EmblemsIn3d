<!-- tokens: ~2,197 · read for: how the world is drawn; aerial perspective, the 1499 palette -->
# Rendering — how a 1499 book is drawn on a 2026 screen

*What techniques exist for making a real-time 3-D world look like Renaissance picture-making,
which of them this project uses, and which were looked at and turned down. Written 2026-09-07
after a survey, because the project had been inventing its rendering from first principles and
some of the answers were already three or five hundred years old.*

**Read with** [`PLEASURES.md`](PLEASURES.md) (what the garden is *for*),
[`WOODCUT.md`](WOODCUT.md) (the bracketed engraving register), and
[`src/shaders/`](src/shaders/).

---

## 1. Aerial perspective — the one that was missing, and it is a *rule*, not a style

Leonardo coined *prospettiva aerea* in the **Trattato della Pittura** and stated it as an
instruction: **to make an object look five times more distant, make it five times bluer.**
Distance drains colour, closes the tonal range, and shifts what remains toward the blue of the
air. He is describing Rayleigh scattering roughly three centuries before anyone could explain
it; Masaccio and others had lightened their distances by instinct, and Leonardo is the first to
write the law down.

**What this world had.** A `FogExp2` in warm sand, `0xd0be9e`. That is a real distance cue and
it is the *wrong* one — a warm haze says "dusty", not "far", and it was flattening the far
ground into the same family of colours as the near.

**What it has now.** The fog is a pale azurite, `0xb0c4da`, at density 0.0082
(`HPWorldScene`, `this.AIR`). Azurite rather than ultramarine on purpose: ultramarine cost more
than its own weight in gold and azurite is what a Venetian workshop in 1499 actually reached
for. The value is kept light so the seam against the sky's warm horizon stays soft — **blue
hills under a pale warm sky is precisely the quattrocento landscape**, and the mismatch is the
effect rather than a bug.

**Why in the fog and not in a post-process pass.** A post pass was written first, with the
three moves separated (drain, close, blue-shift) and staged over a controllable distance band.
It needs scene depth, and reading depth from an `EffectComposer` means putting a `DepthTexture`
on its ping-pong targets — which binds that texture as an attachment on the target being
*written* while it is being *sampled*. The canvas goes black. Sharing one texture between both
targets does not fix it; it guarantees it. **The fog does the same job better:** three.js
evaluates it per fragment with true depth, on every standard material, for nothing. The
hand-written meadow shader carries its own `uFogColor`/`uFogDensity`, so `syncAir()` pushes any
change through to the grass — otherwise the sward stands in yesterday's weather.

Tune it live: `hpAir({ haze: 0xb0c4da, density: 0.0082 })`.

---

## 2. The pigment shelf of 1499

A Venetian painter's colours were not a continuous gamut. They were a shelf, and a short one:

| | |
|---|---|
| **Blues** | azurite, natural ultramarine, indigo |
| **Greens** | verdigris, green earth (*terre verte*), malachite, sap green |
| **Yellows** | lead-tin yellow, Naples yellow, yellow ochre, orpiment |
| **Reds** | vermilion, madder lake, red ochre / sinopia |
| **Earths** | raw umber, burnt sienna |
| **Black & white** | carbon (vine) black, lead white |

`src/shaders/AerialPerspective.js` carries seventeen of these and pulls every pixel about a
third of the way toward whichever is nearest in RGB. The result is not a filter effect; it is a
*constraint* — the image stops containing hues that nobody in 1499 could have mixed, and the
whole picture binds together the way a limited palette always binds a painting.

Three things learned by tasting it:

- **0.18 barely registers; 0.55 turns the sea flatly verdigris and starts to band the grass.
  0.30 is the setting.** `hpPigment(x)` to try others.
- **The shelf needed two warm greens added.** With only green earth, verdigris and malachite,
  sunlit garden grass snapped to verdigris — a blue-green — and the whole sward went teal. Sap
  green (a buckthorn lake a shop made itself) and a light yellow-green fixed it. Both period.
- **three.js will not upload an array of `THREE.Color` to a `vec3[]` uniform.** It flattens
  `{x,y,z}`, and a Color has `{r,g,b}`, so the array uploads as nothing and the shader silently
  does nothing. The palette is flattened to a `Float32Array` by hand.

The pass stands down in the woodcut register: a printed page has no air in it and no pigments
on a shelf.

---

## 3. Considered, and deliberately not done

**The anisotropic Kuwahara filter** — the standard route to a real-time painterly image, and
genuinely good. A basic Kuwahara samples a box, splits it into sectors, and outputs the mean of
the lowest-variance sector, which smooths while preserving edges. Papari's generalisation uses
a circular kernel of eight sectors with Gaussian weights (a polynomial `[(x + ζ) − ηy²]²`,
ζ = 0.1, η = 0.5, replaces the exponential for speed). The anisotropic version computes a
**structure tensor** from Sobel gradients, takes its eigenvectors to find the local flow
direction, and squeezes and rotates the kernel along it — which is why the output looks like
brush strokes following form rather than a blur. Three passes: structure tensor, filter, then
tone.

**Not done, and the reason is scope, not merit.** This would be a *fourth aesthetic register*,
and the third one — the woodcut — is already bracketed as unsatisfactory. Shipping a second
half-finished register would be a worse project, not a better one. It is written down here
because when the woodcut register is unbracketed, **the structure tensor is the missing piece
for it too**: an engraver's hatching follows form, and the tensor is exactly how you find the
direction that form runs in. See [`WOODCUT.md`](WOODCUT.md), which independently arrived at
"screen-space, luminance-driven, depth-and-normal Sobel edges" — the same machinery.

**Tonal art maps and real-time hatching** (Praun et al.) — a mip-chain of hatch images at
increasing tone, blended by multitexturing so stroke density stays constant on screen at any
distance. This is the right answer to the woodcut register's worst artefact (hatching that
swims and moires as you walk). Also parked with the register.

**Sfumato, chiaroscuro, verdaccio, grisaille underpainting** — read, and they are *figure*
techniques. Sfumato is the imperceptible transition at an edge; verdaccio is a green
monochrome underlayer for flesh. They belong to how a body is modelled in paint, and this
world's problem was never its edges or its flesh tones. `NYMPHS.md` is where they would apply,
if anywhere.

**Canvas grain, craquelure, a painted frame.** Cheap and tempting, and all three say "this is a
photograph of a painting" rather than "this is a place". The world is a *place* the reader
walks in; the point of the pigment shelf is that it changes what the place is made of, not that
it pretends the screen is a panel.

---

## 4. What this leaves standing

| Register | What it is | State |
|---|---|---|
| **lit** | the sunny garden: physical lights, ACES at exposure 1.2, baked shade, azurite air, the pigment shelf | current, and the default |
| **woodcut** | the 1499 page: ink on paper | **bracketed** — see `WOODCUT.md` |
| *painterly* | anisotropic Kuwahara over the lit register | not built, §3 |

---

## Sources

- Leonardo's rule and the term *prospettiva aerea*:
  [Britannica, "Aerial perspective"](https://www.britannica.com/art/aerial-perspective) ·
  [Discovering da Vinci, on the notebooks](https://www.discoveringdavinci.com/notebooks/organization/perspective.html)
- The Renaissance palette:
  [Pigments through the Ages — Renaissance and Baroque](https://www.webexhibits.org/pigments/intro/renaissance.html) ·
  [Natural Pigments, "Raphael's palette"](https://www.naturalpigments.com/artist-materials/raphael-palette)
- Kuwahara, the generalisation, and the structure tensor:
  [Kyprianidis, Kang & Döllner, *Image and Video Abstraction by Anisotropic Kuwahara Filtering* (CGF 2009)](https://www.kyprianidis.com/p/pg2009/) ·
  [Maxime Heckel, "On Crafting Painterly Shaders"](https://blog.maximeheckel.com/posts/on-crafting-painterly-shaders/)
- Real-time hatching and tonal art maps:
  [Praun, Hoppe, Webb & Finkelstein, *Real-Time Hatching*](https://www.academia.edu/4143023/Real_time_hatching)
- Sfumato, chiaroscuro, verdaccio:
  [Britannica, "Sfumato"](https://www.britannica.com/art/sfumato) ·
  [Verdaccio](https://en.wikipedia.org/wiki/Verdaccio)
