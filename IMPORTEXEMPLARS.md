# How importing works

*Ted: "Make sure I understand how you are importing things." This is the plain-language
account — what has been brought into the world from outside, where each thing came from,
under what licence, how it is loaded, and what is done to it before it is allowed in.*

Nothing is hotlinked. Everything listed here is **self-hosted in this repository**, so the
site does not depend on anyone else's server staying up. That was a standing decision
(`DECISIONS.md`, 2026-09-04) after the Gallery was built.

---

## The three ways something gets in

**1. A 3-D model (glTF).** One so far. Loaded at runtime by `GLTFLoader`, from a `.glb` in
`assets/models/`.

**2. A picture used as a picture.** The Gallery plates and the 1499 woodcuts — displayed as
images in a lightbox, never used as geometry. Manifest: `src/data/gallery.json`.

**3. A picture cut out and stood up in the world.** Figures cut from public-domain paintings
and shown on camera-facing cards. Manifest: `src/data/figure_cutouts.json`.

---

## What is actually imported

### The marble Venus — an imported 3-D scan

| | |
|---|---|
| **What** | The antique Capitoline Venus |
| **File** | `assets/models/venus.glb`, ~0.6 MB, ~35 000 faces |
| **Licence** | CC0 |
| **Where it stands** | In the Fountain of Venus, in the water "up to her flanks" as the book has her — not on a pedestal |
| **Loaded by** | `HPWorldScene._loadVenusStatue()`, using `GLTFLoader`, dynamically imported so the loader is only fetched if the scan is actually wanted |
| **Switchable** | Yes — Graphics menu → *Statues & the marble Venus* → **Built** / **Imported scan** |

**Two things are done to it before it is allowed in.**

*The scan carries no usable vertex normals.* Lit as-is it renders black. `computeVertexNormals()`
is run once on the shared geometry.

*A photoreal marble fights a painted garden.* The register is painterly (`RENAISSANCEART.md`),
so the scan gets a **stylisation pass**: a warm limestone colour instead of cold white,
roughness pushed to 0.95 so it takes no specular highlight, and a faint warm emissive so it
sits in the panel's light rather than looking lit from somewhere else. Without this it reads
as a photograph pasted into a painting.

*It is loaded after the draw-call compiler runs*, so the imported mesh is not swallowed by
the merge. If the fetch fails, the failure is silent and the built Venus simply stays.

### The figure cutouts — real Renaissance painting, stood up

Six figures cut from **Botticelli's *Primavera*** (c. 1480, Galleria degli Uffizi): the three
Graces, Flora, Chloris and Venus.

| | |
|---|---|
| **Source image** | `images/gallery/botticelli_primavera.jpg` — already in the Gallery, already provenance-tracked |
| **Output** | `images/cutouts/figures/*.png`, six files, 448×896, ~2.9 MB total |
| **Licence** | Public domain. Botticelli died in 1510; these are faithful photographic reproductions of a two-dimensional public-domain work. |
| **Manifest** | `src/data/figure_cutouts.json` — per figure: source artwork, artist, date, holding institution, licence basis, the exact crop box, the threshold used, and the masking method |
| **Made by** | `scripts/cut_figures.py` — committed, so the cutting is repeatable and auditable rather than a set of mystery PNGs |
| **Loaded by** | `Cast.paintedFigure()` via `THREE.TextureLoader`, only when the `card` variant is selected |
| **Switchable** | Yes — Graphics menu → *Nymphs & figures* → **Painted panel** |

**How the cutting works, in plain terms.** These figures stand against Botticelli's dark
orange grove, so brightness mostly separates figure from background. Brightness alone,
though, also keeps the grove's pale tree trunks. The trunks are neutral grey where
Botticelli's flesh and drapery are warm — so a pixel counts as *figure* only if it is **both
bright and not cool** (red not below blue). After that: despeckle, keep only the largest
connected region so stray highlights in the foliage do not come along, dilate slightly to
close small holes, and blur the edge so it reads as a painted edge rather than one cut with
scissors. Finally trim to the figure's own bounds and centre it on a 448×896 card.

**Why cards and not models.** Four rounds of tuning primitive-built figures did not stop them
reading as shop mannequins, because the causes were structural — sphere hands with no
fingers, capsule arms, a turned-cone gown. A procedural *painting* of a figure only traded
mannequins for paper dolls. A real painted figure has none of those problems: the anatomy,
the drapery and the face were solved in 1480.

**What a card does in the world.** It turns about its own vertical axis to face the camera
and never tilts (tilting makes it visibly lift off the ground, and screen-aligned quads
misbehave in the depth buffer). It gets a soft contact shadow on the ground, which stays put
while the card turns above it — without that, a flat card reads as a sticker hanging in
front of the garden. Cards are fenced off from the draw-call compiler so the merge does not
freeze their orientation.

### The Gallery — pictures shown as pictures

25 exemplars, self-hosted in `images/gallery/`, fetched originally by
`scripts/fetch_gallery.py` (which keeps only files that actually resolve to real images).
Provenance for each is in `src/data/gallery.json`: category, title, artist, date, caption,
source. These are displayed in the Gallery tab and never used as geometry — except where a
figure has been cut from one, which is recorded above.

The 1499 woodcuts in `images/woodcuts/` are the book's own plates, shown beside the tour.
**Their filenames are unreliable** — they were saved out of order, so the file called
`portal.jpg` is the elephant and the one called `three_doors.jpg` is not the three doors.
The captions in `src/data/tours.json` are correct and were checked by eye. See `SOURCES.md`.

---

## Rules for anything imported in future

1. **Self-host it.** No hotlinks. The site must not depend on someone else's uptime.
2. **Record provenance in a manifest**, not in a code comment: source, artist/maker, date,
   holding institution where relevant, licence basis, and how it was processed.
3. **Prefer CC0 or public domain.** For a public-domain artwork, say *why* it is public
   domain (author's death date), not just that it is.
4. **Commit the script that made it.** A processed asset with no script is unauditable.
5. **Give it a stylisation pass.** Nothing photoreal enters the painted garden raw. See
   `RENAISSANCEART.md` §2 for what is adopted and rejected.
6. **Make it a variant, never a replacement.** Register it in `src/systems/AssetVariants.js`
   beside the built version; the earlier rung is never deleted. Then **check the `def:`** —
   shipping a good variant switched off has already happened once.
7. **Fail silently to the built version.** If a fetch fails the world must still be whole.

---

## What is *not* imported

Everything else. The architecture, the gardens, the trees, the elephant, the fountains, the
ornament and the woodcut render mode are all built from Three.js geometry in
`src/scenes/HPWorldScene.js` and `src/systems/Cast.js`. The founding rule was primitives
only; that was relaxed deliberately, not abandoned (`DECISIONS.md`).
