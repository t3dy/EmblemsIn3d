# Textures & Materials

**Current state.** The lit HP world uses procedural canvas textures
(`_surfaceTexture()` in [HPWorldScene.js](../../src/scenes/HPWorldScene.js)): seamless tonal
blobs + speckle + veins + ashlar courses for stone/hedge/ground/path, with white material
colour carrying the albedo (the colour×map double-darkening bug is fixed and documented in
memory). The woodcut style replaces all of this with the hatching shader in
[HPStyles.js](../../src/shaders/HPStyles.js). The AF world and Cast props still use flat
`MeshStandardMaterial` colours.

## Ranked suggestions

### 1. 🍎 Bump maps from the existing textures — IMPLEMENTED
The same canvas that paints the ashlar can *emboss* it: clone the texture with
`colorSpace = NoColorSpace` and assign as `bumpMap` (`bumpScale` ~0.4 stone, ~0.15 ground).
Mortar lines and veins catch the raking sun as actual relief. Zero new art, one texture unit.

### 2. Roughness map correctness
`_stoneMat.roughnessMap` currently reuses the sRGB-tagged albedo — three.js will decode it,
skewing roughness values darker-than-authored. Use the same NoColorSpace clone from §1 for
`roughnessMap` too. (Visually subtle; do it while touching the code.)

### 3. Marble for the sacred, ashlar for the civic
Everything stony shares one ashlar. Differentiate by *institution*:
- **Temple/Quinta + Fountain of Venus**: white marble — pale base, long low-contrast veins
  (`veins: 3, courses: 0`), `roughness 0.35` for a slight sheen.
- **Portal/Doors wall**: keep the coursed ashlar (civic masonry).
- **Elephant**: near-black "obsidian" with tight speckle — the book insists the beast is
  *black stone*; currently it reads as grey plastic.
One call-site change each; the generator already takes all needed params.

### 4. Path wear: centre-line lightening
Real gravel paths polish where feet go. In `_surfaceTexture`, an optional vertical bright
band (`wear: 0.3`) multiplied up the tile centre, used only for the path texture — with
`repeat.x = 1` so the band aligns along the path. Sells centuries of procession.

### 5. Robe cloth for the Cast
Cast figures are flat colour. A tiny 64×64 weave texture (2-px checker + noise, repeat 6)
as `bumpMap` on robe materials would give cloth without changing their colours — but weigh
against the "painted statuary" aesthetic; try on one nymph first.

### 6. Plaque aging
`_plaqueTexture` output is crisp. Two additions: 4% speckle overlay and a 1-px darker
inner-border inset. Instantly "engraved brass," still legible.

### 7. Woodcut style: leave it alone
The hatching shader is the project's crown jewel. Its object-space stripes are stable and
print-like; adding maps there would fight the bands. All texture work stays behind
`S.key !== 'woodcut'` guards, as now.

## Budget note
All procedural canvases are 256² ≈ 256 KB GPU each; even ×10 materials this is nothing.
The constraint is authoring time, not memory.
