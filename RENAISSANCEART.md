# Renaissance art in a real-time garden

*How this project translates medieval and Renaissance painting into a browser 3-D world —
what the literature says, what we adopt, and what we deliberately reject.*

**Standing direction (Ted, 2026-09-05):** the lit Dream Garden should read as
**a Botticelli panel you can walk into**. Painterly, not photoreal. The risk that it reads
"illustrated" rather than "real" is accepted and intended. See `DECISIONS.md`.

This file exists because that direction was set and then acted on from assumption for
several days. It is written from actual sources, cited below, so the technique choices can
be argued with rather than taken on trust.

---

## 1. The field this sits in

What we are doing has a name: **non-photorealistic rendering** (NPR) — any technique that
depicts a simulated 3-D world in a style other than realism, painterly rendering being one
branch of it ([Wikipedia, *Non-photorealistic rendering*](https://en.wikipedia.org/wiki/Non-photorealistic_rendering);
Craig Reynolds' long-running bibliography, [*Stylized Depiction*](https://www.red3d.com/cwr/npr/),
is still the best single index of the literature).

Two broad families are relevant to us:

**Stroke-based.** Painterly effects made by placing predefined strokes or patterns, selected
and oriented by information from the 2-D image or the 3-D scene. Disney Research's
[*Fin Textures for Real-Time Painterly Aesthetics*](https://studios.disneyresearch.com/wp-content/uploads/2019/03/Fin-Textures-for-Real-Time-Painterly-Aesthetics.pdf)
is a good recent example of getting stroke character at real-time cost. The classic
scalable-animation treatment is Kaplan, Gooch & Cohen,
[*Stylized rendering techniques for scalable real-time 3D animation*](https://dl.acm.org/doi/10.1145/340916.340918)
(NPAR 2000), which also introduces the "art-map" idea: filter the textures themselves
through the NPR process and mip-map the result, so stroke scale stays stable as things
recede.

**Example-based.** Rather than simulating strokes, take the style from an exemplar image and
transfer it under local guidance — see [*StyleBlit*](https://arxiv.org/pdf/1807.03249)
(Sýkora et al.), which does this fast enough for interactive use.

There is also a directly comparable web project: [*Web-Based Dynamic Paintings: Real-Time
Interactive Artworks in Web Using a 2.5D Pipeline*](https://arxiv.org/pdf/2311.15354), which
builds interactive painterly scenes in the browser from layered 2.5-D elements rather than
full 3-D — very close to what our figure cards do.

**The honest caveat from the search:** the NPR literature is about *style*, and almost none
of it is about **tempera** or Renaissance panel painting specifically. Nobody has published
"how to render a Botticelli". What follows therefore separates what is sourced from what is
our own reading of the paintings.

---

## 2. What the sources actually license us to do

### Adopted — with a source

| We do this | Because |
|---|---|
| **Put the style in the texture, not only in the shader.** Drapery folds, carved relief and fluting are painted into the albedo (and used as bump), rather than being lit into existence. | This is the art-map principle from Kaplan/Gooch/Cohen: filtering the *textures* keeps the style stable under motion and distance, where a screen-space effect swims. It is also the cheapest way to get style across hundreds of assets. |
| **Accept restricted artistic control as the price of consistency.** One painted register applied everywhere, rather than per-object art direction. | The Clemson study of NPR in Unreal ([Bridging Mood and Style](https://open.clemson.edu/all_theses/4258/)) makes the trade explicit: real-time NPR replicates a specialised style well but gives the artist limited control over the final look. We want the specialised style. |
| **Figures as camera-facing painted cards.** | Standard impostor practice — a quad that always faces the camera, standing in for geometry that would be expensive or (in our case) unconvincing. See Tom Forsyth, [*Impostors — Adding Clutter*](https://tomforsyth1000.github.io/papers/gem_imp_filt.html), and the [*Dynamic 2D Impostors*](https://www.gamedeveloper.com/programming/dynamic-2d-imposters-a-simple-efficient-directx-9-implementation) write-up. |
| **Soft alpha edges on the cutouts, not hard clipping.** | The impostor literature's standard advice for organic silhouettes: hard alpha test produces a cut-out-with-scissors edge; a soft clip reads as an organic (here, painted) edge. Our cut script gaussian-feathers the mask for exactly this reason. |
| **Turn cards about their own vertical axis only — never tilt them to face the camera.** | Screen-aligned quads cause Z-buffer trouble; orienting in object space keeps depth behaviour dependent on the object's position rather than the camera's (Forsyth, above). A tilted card also visibly lifts off the ground. |

### Rejected — and why

| We do not do this | Why not |
|---|---|
| **Screen-space painterly post-processing** (a brush-stroke filter over the finished frame). | It is the most common way to "look painterly" and the worst fit here. The strokes live in screen space, so they swim across surfaces as the camera moves, and they flatten the architecture the book is *about*. Lefaivre reads the whole HP as an architectural body; dissolving the orders into brush texture defeats the project. |
| **Neural style transfer from a Botticelli exemplar.** | Tempting, and the example-based literature above makes it feasible. Rejected for provenance: a network's guess at Botticelli is not attributable to anything, and this project's rule is *cite, don't fabricate* (`SOURCES.md`). It would also be a per-frame cost on a no-build static site. |
| **Photoreal PBR anywhere.** | It fights the register. An imported photoreal scan next to painted assets makes the painted ones look unfinished rather than making the scene look real — which is why the marble Venus gets a stylisation pass before it is allowed in (`IMPORTEXEMPLARS.md`). |
| **Physically-accurate gold.** | Gilding genuinely is anisotropic and layered — see [*Rendering Layered Materials with Anisotropic Interfaces*](https://belcour.github.io/blog/research/publication/2020/06/30/brdf-aniso-layered.html) (Belcour et al.) and the conservation-side work on [characterising the appearance of gold foils and gilding](https://www.researchgate.net/publication/396039402_Characterising_appearance_of_gold_foils_and_gilding_in_conservation_and_restoration). Both confirm it needs an anisotropic BRDF and possibly a glint model ([Chermain et al., *Procedural Physically based BRDF for Real-Time Rendering of Glints*](https://onlinelibrary.wiley.com/doi/10.1111/cgf.14141)) to be right. We use a plain high-metalness standard material instead, because **panel-painting gold is not lit gold — it is a flat gold *area* with drawn detail.** Getting the physics right would make it less like the source. |

---

## 3. What the paintings themselves tell us

Not from the graphics literature — from looking at the works in `src/data/gallery.json`.
These are the rules the assets are actually built to.

1. **Low contrast in faces; modelling by earth-shadow, not by line.** Features sit well down
   the head and are small. Getting this wrong is what made every figure read as a doll: eyes
   about a tenth of the head wide, blush roundels, a scarlet rosebud mouth.
2. **Drapery folds are few, long and directional**, each with a dark core and a lit ridge
   beside it. (`research/nymphs.html` on Goujon's Innocents naiads makes the same point about
   carving the folds as geometry.) Many shallow folds read as corduroy; a smooth gradient
   reads as plastic.
3. **Proportion is roughly eight heads**, not the six-and-a-third a naive build lands on.
   Mannerist figures run longer still — Cellini's Fontainebleau nymph is the project's stated
   reference for this.
4. **Foliage is massed, not textured.** A tree is overlapping lobes with a lit crown over a
   shadowed underside, and a wavering silhouette. A single cone is the giveaway.
5. **Gold is an area, not a highlight.** Hems, girdles, fillets and capitals are flat gold
   shapes with drawn edges.
6. **The palette is limited and warm.** Cool neutral greys read as modern; this is also the
   test the cut-out mask uses to tell Botticelli's flesh from the grove's tree trunks.

---

## 4. How this is applied here

- **The register is a per-asset choice, not a global switch.** Every asset in
  `src/systems/AssetVariants.js` carries a ladder — typically `primitive` → `modelled` →
  `painted`/`carved` → `card`/`scan` — and the reader picks from the **Graphics** menu. The
  earlier rung is never deleted. See `DECISIONS.md`, 2026-09-05.
- **Woodcut mode is a separate register and takes precedence.** It wants a readable
  silhouette and flat ink, so it prefers `primitive` and ignores albedo maps.
- **Figures are the hard case and were solved by not generating them.** Four rounds of
  tuning primitive-built figures did not stop them reading as mannequins; a procedural
  *painting* of a figure only traded that for paper dolls. What worked was cutting real
  figures out of the public-domain paintings the project already hosts. `NYMPHS.md` and
  `IMPORTEXEMPLARS.md` carry that story and its provenance.

---

## 5. Sources

- [Non-photorealistic rendering](https://en.wikipedia.org/wiki/Non-photorealistic_rendering) — Wikipedia
- Craig Reynolds, [Stylized Depiction: Non-Photorealistic, Painterly and 'Toon Rendering](https://www.red3d.com/cwr/npr/)
- Kaplan, Gooch & Cohen, [Stylized rendering techniques for scalable real-time 3D animation](https://dl.acm.org/doi/10.1145/340916.340918), NPAR 2000
- Imhof et al., [Fin Textures for Real-Time Painterly Aesthetics](https://studios.disneyresearch.com/wp-content/uploads/2019/03/Fin-Textures-for-Real-Time-Painterly-Aesthetics.pdf), Disney Research
- Sýkora et al., [StyleBlit: Fast Example-Based Stylization with Local Guidance](https://arxiv.org/pdf/1807.03249)
- [Web-Based Dynamic Paintings: Real-Time Interactive Artworks in Web Using a 2.5D Pipeline](https://arxiv.org/pdf/2311.15354)
- [An Exploration of Non-Photorealistic Rendering Techniques and Styles to Bridge Mood and Style Using Unreal Engine](https://open.clemson.edu/all_theses/4258/), Clemson
- Tom Forsyth, [Impostors — Adding Clutter](https://tomforsyth1000.github.io/papers/gem_imp_filt.html)
- [Dynamic 2D Impostors: A Simple, Efficient DirectX 9 Implementation](https://www.gamedeveloper.com/programming/dynamic-2d-imposters-a-simple-efficient-directx-9-implementation)
- Belcour et al., [Rendering Layered Materials with Anisotropic Interfaces](https://belcour.github.io/blog/research/publication/2020/06/30/brdf-aniso-layered.html)
- Chermain et al., [Procedural Physically based BRDF for Real-Time Rendering of Glints](https://onlinelibrary.wiley.com/doi/10.1111/cgf.14141), CGF 2020
- [Characterising appearance of gold foils and gilding in conservation and restoration](https://www.researchgate.net/publication/396039402_Characterising_appearance_of_gold_foils_and_gilding_in_conservation_and_restoration)
- [Historical Materials & Techniques](https://sites.udel.edu/artcons/kress/historical-materials-techniques/entry/7163/), University of Delaware Art Conservation
