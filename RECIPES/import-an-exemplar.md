# Import a scan, model or painting cut-out

## When to use this

Bringing anything from outside the repo into the world or the Gallery: a glTF scan, a
public-domain painting, a figure cut from one.

## Before you start

- [`../IMPORTEXEMPLARS.md`](../IMPORTEXEMPLARS.md) — what is already in, from where, and
  under what licence. **Add your import to it; that file is the record.**
- [`../RENAISSANCEART.md`](../RENAISSANCEART.md) — how period painting is made to work in
  this medium at all.
- [`../LICENSECHOICES.md`](../LICENSECHOICES.md) and [`../CREDITS.md`](../CREDITS.md).

**Standing decisions:**

- **Imported models are allowed.** The founding "primitives only" manifesto was reversed
  (`DECISIONS.md`). An import is a *variant*, never a replacement —
  [add-an-asset-variant.md](add-an-asset-variant.md).
- **Nothing is hotlinked.** Everything is self-hosted in this repo so the site does not
  depend on someone else's server.
- **CC0 / public domain only**, and the provenance is recorded.

## The three ways something gets in

| Kind | Lives in | Manifest | Loaded by |
|---|---|---|---|
| A 3-D model (glTF) | `assets/models/*.glb` | — | `GLTFLoader`, dynamically imported so it is only fetched if wanted |
| A picture used as a picture | `images/gallery/` | `src/data/gallery.json` | the Gallery lightbox |
| A picture cut out and stood up in the world | `images/cutouts/` | `src/data/figure_cutouts.json` | camera-facing cards in `Cast.js` |

## Steps — a glTF model

1. Confirm the licence is CC0/PD and note the source URL.
2. Put the `.glb` in `assets/models/`. Keep it small — the Capitoline Venus is ~0.6 MB /
   ~35 000 faces, and that is the ceiling to aim at.
3. Load it dynamically, and **normalise it on arrival**: recentre, scale to the world's
   units, and re-material it through `this.style.mat()` so it obeys the four render styles.
   Follow `HPWorldScene._loadVenusStatue()`.
4. Register it as a variant (`statue: { def: 'scan', … }` is the model) so the built version
   stays available.
5. Record it in `IMPORTEXEMPLARS.md` and `CREDITS.md`.

## Steps — a painting cut-out

`scripts/cut_figures.py` does this. It exists because naive luminance keying kept eating the
figures.

1. Source a public-domain, high-resolution scan.
2. Cut with **two passes**: a luminance mask *and* a warmth mask
   (`ImageChops.subtract(r, b, 1.0, 12)` — skin and drapery are warmer than sky and
   foliage), then take the **largest connected region** and feather the edge with a gaussian.
3. Use **one global scale factor** for every figure from a given painting, so they stay in
   proportion with each other.
4. Write the manifest entry in `src/data/figure_cutouts.json` and wire the id into the
   cut-out assignment in `Cast.js` (`CUTOUTS_F`, `CUTOUTS_M`, `CUTOUT_NAMED`).
5. Record the painting, its source and its licence in `IMPORTEXEMPLARS.md` and `CREDITS.md`.

> **Pillow 12 note:** `ImageMath.eval` was removed. Use `ImageChops`.

## Steps — a Gallery plate

1. Put the image in `images/gallery/`.
2. Add an entry to `src/data/gallery.json`: `id`, `category`, `title`, `artist`, `date`,
   `caption`, `file`, `source`.
3. Bump `const V` in `main.js` (data files).
4. **Look at the image and write the caption from what you see.** Filenames in this repo
   have lied before — see the re-identification table at the end of `SOURCES.md`.

## You are done when

- [ ] the file is in the repo, not hotlinked
- [ ] licence and source recorded in `IMPORTEXEMPLARS.md` **and** `CREDITS.md`
- [ ] a model is normalised, re-materialled, and registered as a variant with the built
      version still selectable
- [ ] it reads in all four render styles (or `styleOverride` handles woodcut)
- [ ] `?v=` chain / `const V` bumped, and you have looked at it in the browser

## What has gone wrong here before

- **Cut-outs eaten by a luminance-only mask** — hence the two-pass warmth mask.
- **Per-figure scaling** made a company of nymphs of visibly different heights. One global
  factor per painting.
- **Billboards frozen edge-on.** The NPC idle-sway wrote `rotation.y` *after* the billboard
  pass. The billboard pass now runs last in `update()`, and sway skips billboards. Any new
  card-based figure inherits this — check it turns to face you.
