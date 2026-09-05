# Model or improve a 3-D asset

## When to use this

Building or revising anything visible in the world: a figure, a fountain, a gate, a tree, a
triumphal car, a frieze, a garden bed.

## Before you start

**Read the sources first. This applies to the geometry, not only to the prose.** The order
is fixed:

1. **The book's own account of that folio** — `hp.db.folio_descriptions`,
   `woodcut_catalog`, `woodcuts`, `image_readings`. This outranks everything below.
2. **The scholar `SOURCES.md` assigns to that object** — the "Modelling the 3-D assets"
   table. Depth on each is in [`../15scholars.md`](../15scholars.md).
3. **The project's subject brief** — `ARCHITECTURE.md`, `GARDENS.md`, `PLANTS.md`,
   `ANIMALS.md`, `NYMPHS.md`, `PROCESSIONS.md`, `VEHICLES.md`, `WATER.md`, `ORNAMENT.md`,
   `MYTHOLOGY.md`, and `research/nymphs.html`.

```sql
-- what the plates say about the thing you are about to build
SELECT catalog_number, page_seq, description, subject_category
FROM woodcut_catalog
WHERE description LIKE '%fountain%'
ORDER BY page_seq;
```

## Steps

1. **Name the object's folio and plate number** before you write any geometry. If you
   cannot, you are about to invent something.
2. **Read the folio description and the scholar.** Write down, in the code comment you are
   about to add, the plate number and the source. Every substantial builder in
   `HPWorldScene.js` already does this — match that density.
3. **Use the shared members, don't re-invent them.** `HPWorldScene.js` has
   `_column(order)`, `_entablature()`, `_steps()`, `_doorway()`, `_frieze(kind)`,
   `_carvedTexture()`, `_reliefTexture()`, `_waterMat()`, `_caustics()`, `_plaque()`,
   `_m()` (mesh + parent + rotation helper), `_circleCol()` (collision). A new building
   that does not use them will not match the ones that do.
4. **Respect the four render styles.** Everything goes through `this.style.mat({…})` from
   `src/shaders/HPStyles.js`; woodcut mode wants flat tone and a readable silhouette, not a
   scan. Never construct a bare `THREE.MeshStandardMaterial`.
5. **If the object should be swappable, register it** —
   [add-an-asset-variant.md](add-an-asset-variant.md).
6. **Bump the `?v=` chain** — [bump-cache-versions.md](bump-cache-versions.md).
7. **Look at it, from the player's eye, in the browser.** Not from a screenshot of the
   whole scene: walk to it.

## Getting the camera to the thing you just built

```js
// lock the walker and put the player where the asset is, then look at it
const s = window.__hp || window.state;      // whichever the build exposes
// or teleport via the tour: window.hpTour('novel') and step to that stop
```
The reliable method that has always worked: start the Novel tour and step to the stop whose
`station` is the one you are editing — the tour teleports the camera for you.

## Measure, do not guess

This is the single biggest time-saver on this project. When something looks wrong:

- **Raycast into it.** A black fountain basin turned out to be a solid `CylinderGeometry`
  capping itself at the top — a lid over the whole basin. Three "fixes" were made by
  guessing before one raycast found it in a minute. The kerb is a **ring**, not a disc:
  open-ended cylinder + `RingGeometry` cap.
- **Count meshes** — but note `_compileDrawCalls()` merges by material, so counting by
  position after compilation is unreliable. Count before, or count materials.
- **Read the actual transform.** The billboard bug (every painted figure frozen edge-on)
  was found by comparing `rotation.y` against the expected billboard angle: the NPC
  idle-sway was writing `rotation.y` from `baseY` *after* the billboard pass. The billboard
  pass now runs last in `update()`, and sway skips billboards.
- **Warn instead of falling through.** `_triumphBeast()` used to silently return a horse
  for an unknown team; it now warns. Do the same anywhere a lookup can miss.

## You are done when

- [ ] the code comment names the plate/folio and the scholar
- [ ] it is built from the shared members and goes through `this.style.mat()`
- [ ] it reads correctly in **all four** render styles, woodcut included
- [ ] you have walked to it in the browser and looked at it
- [ ] the `?v=` chain is bumped up to `src/index.html`
- [ ] if the sources did not settle a detail, a comment says so and the geometry is modest

## What has gone wrong here before

- **Inventing detail the plate does not have.** Water jets were added to the nymph fountain
  that are in no plate; they were removed. If the source is silent, build less.
- **Solid cylinders used as rings.** Found three times (the fountain kerb, and twice in
  `props.pool`). A drum that should be open-topped caps itself and seals what is inside.
- **Assuming the default variant is what the reader sees.** After `AssetVariants.js` was
  added, `figure`, `water` and `ornament` still defaulted to `primitive`, so all the new
  work was invisible until someone opened the Graphics menu. Check `def` in the registry.
- **Two module instances.** `AssetVariants.js?v=1` imported from one file and `?v=2` from
  another gave two registries; the second silently did nothing.
