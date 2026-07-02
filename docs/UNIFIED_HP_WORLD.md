# The Unified HP World — Method

How the four separate Hypnerotomachia rooms became **one explorable dream
garden with two renderings** (lit and woodcut). This documents the approach so
it can be extended to further folios.

## 1. One world, five stations

`src/scenes/HPWorldScene.js` replaces the old room-switching `HPScene.js`.
Instead of four scenes selected by index, the designs are **stations** placed
in a single continuous garden, laid out as the book's processional journey:

| Order | Station | Folio | Position |
|---|---|---|---|
| start | Gate of twin obelisks | — | z ≈ +26 |
| 1 | **The Three Doors** (Virtue · Via Media · Pleasure) — a wall you walk through | 119 | z = +12 |
| 2 | **The Elephant & Obelisk** — plaza centrepiece (new) | 25 | origin |
| 3 | **The Planetary Palace** — seven metals in Chaldean order, west court | 88 | x ≈ −20 |
| 4 | **Quinta Essentia** — dodecahedron over its altar, four elements, east court | 164 | x ≈ +21 |
| 5 | **Fountain of Venus** — the climax grove | 80 | z = −20 |

Exploration is first-person: WASD/arrows walk (Shift runs, arrows also turn),
drag to look, **1–5** teleport-glides between the wonders. A light collision
system (circle colliders for columns/trees/pedestals, AABBs for walls and
hedges) keeps the walk honest — the Three Doors wall can only be passed
through its portals. As the player nears a station, `onStation` fires and
`main.js` surfaces the folio, its `world_links` cross-references, and the BL
marginalia in the HUD, exactly as the old rooms did.

## 2. The style interface

The scene builds its geometry **once** against a small style contract
(`src/shaders/HPStyles.js`): `mat() / waterMat() / glowMat() / portalMat() /
outline() / pointLight() / setupLights() / plaqueColors / tuneStream()`.
Two factories implement it:

- **`lit`** — the improved warm-garden rendering: `MeshStandardMaterial`,
  coloured point lights, bloom 0.35, an IBL env-map sheen on the seven metals,
  and (new) real cast shadows from the afternoon sun.
- **`woodcut`** — the same world as a 3-D rendering of the 1499 woodcuts.

Because builders only talk to the interface, any future station is
automatically available in both renderings.

## 3. The woodcut rendering

Inspired by **EmblemPapercraft** (`C:\Dev\EmblemPapercraft`), whose paper
models are sold by a single warm raking key light that casts cut-shape
shadows. Here the same idea is pushed from paper to *engraving*:

- **Paper and ink only.** Every material is a white `MeshLambertMaterial`
  whose lit colour is remapped just before output (via `onBeforeCompile`, so
  shadow maps and fog keep working) into cream paper (`#f2e8d0`) and near-black
  ink (`#241a10`).
- **Hatching instead of shading.** Fragment luminance is quantised into three
  bands — single diagonal strokes → cross-hatch → dense fine hatch → solid ink
  — drawn as anti-aliased stripes in *object space* (stable under the slow
  rotations of the orbs and the dodecahedron; `fwidth` keeps lines clean at
  distance). A per-material `tone` biases dark things (hedges, cypresses) into
  hatch even in full sun; water uses a wavy horizontal stroke mode; the ground
  disables rim ink so the horizon stays paper.
- **One raking sun casts the shadows** (the papercraft trick) with a pale
  hemisphere fill, so shadows arrive as *hatched regions on the page*, never
  black holes.
- **Ink silhouettes** come from two directions at once: a view-dependent rim
  term in the shader, and inverted-hull outline meshes (`BackSide`, scaled
  ~1.035) on hero objects.
- **Radiance is drawn, not bloomed.** Bloom is 0 in woodcut mode; the
  quintessence gets a glory of radiating `LineSegments` ink rays, the way the
  plates draw light.
- All woodcut materials share **one compiled shader program**
  (`customProgramCacheKey`), with per-material uniforms.

## 4. Wiring

- `main.js`: the **Hypnerotomachia** nav button opens the unified world; a
  **Woodcut view / Lit view** toggle (visible only in the HP world) rebuilds
  the scene in the other style *preserving the walker's exact position*
  (`getSpawnState()` → `spawn` option). Deep links: `#hp` and `#hp=woodcut`.
  Archives folio-node clicks now teleport into the corresponding station.
- Old `HPScene.js` is superseded and no longer imported.
- Debug: `window._hp = { renderer, composer, state, clock }`.
