# Graphics Skills — adopting the Three.js Awesome Graphics Agent Skills

> Written 2026-08-30. Maps [scottstts/Threejs-Awesome-Graphics-Agent-Skills](https://github.com/scottstts/Threejs-Awesome-Graphics-Agent-Skills)
> (24 agent skills, each an implementation-pattern doc + worked example code) onto the
> Dream Garden. Goal per the brief: *fill in the world so it reads as walking through a
> Renaissance garden looking at the book's mind-blowing architecture.*

## Setup (one-time)

The pack installs into Claude Code so future sessions can invoke the skills by name:

```bash
npx threejs-awesome-graphics-agent-skills@latest install --agent claude-code
```

Start any graphics task through its `threejs-skill-router` skill, which decomposes a
visual target into the specialist skills. The example code is plain three.js — no
bundler assumptions — so it ports into our no-build ES-module setup.

## The constraint filter

Every borrowed technique must pass the house rules before it ships:

1. **No build step.** Raw ES modules from CDN. Shader work goes through
   `onBeforeCompile` or `ShaderMaterial`, as the hatching shader already does.
2. **Primitive-only cast.** The skills apply to the *environment*; figures stay
   parametric primitives. `InstancedMesh` of primitives is inside the aesthetic —
   it's the same vocabulary said many times, which is very 1499.
3. **Never dark** (memory: `not-dark-worlds`). Atmosphere and grading may add depth
   cues, never gloom. Time-of-day remains rejected.
4. **Two renderings.** Every addition either implements the `HPStyles` contract in
   both styles or hides behind `S.key !== 'woodcut'` guards. The hatching shader is
   the crown jewel; nothing may fight its bands.
5. **Phones on GitHub Pages.** Distance LOD and instancing over brute force; quality
   tiers where a system is heavy.

## Ranked adoptions

### 1. The living meadow — `threejs-procedural-vegetation` ★ the transformation
The sward is currently one textured plane; hedges are boxes; trees are ~80 cone/sphere
props. This is the single loudest "not yet a garden" signal, and the skill's
`grass-system.js` pattern is a direct fit: **authored blade clusters as one
`InstancedMesh`, path masking, color clumps, vertex-stage wind sway**, distance LOD.
- Meadow grass over the sward with the processional axis and station plazas *masked
  out* — the gravel survives, the green comes alive, wind makes the air visible
  (pairs with the pollen motes).
- **Flower clumps** (instanced, per-clump colour) at Polia's garden and the court —
  the book's famous flowerbeds.
- **Ivy** on the Great Portal piers via their spline-following stem pattern, built
  from capsule segments — ruins-being-reclaimed, straight from the woodcuts.
- **Parterre/knot garden** at the court: low instanced hedge segments laid out as an
  interlace pattern on the ground — pure Renaissance signature, cheap geometry.
- Skip their GPU/WebGPU compute variants (see Rejected). Lit style only; woodcut
  keeps its clean paper ground (guard as usual).
*Effort: 1–2 sessions for grass + flowers. Impact: the whole world, every frame.*

### 2. Wonders at book scale — `threejs-procedural-architecture` ★ the mind-blow
The book's Great Portal is a *mountain* — a stepped pyramid of 1,410 steps carrying an
obelisk, with a vaulted passage Poliphilo is driven through in the dark. Ours is ~16
units tall with four step-courses. The skill's staged pipeline (massing plan → façade
rhythm → detail → **material-slot BufferGeometry compilation**) is how to rebuild the
wonders colossal without a draw-call explosion:
- **Great Portal**: pyramid to ~60–80 u with *actual instanced step courses*, a
  walk-through **coffered barrel vault** (rows of instanced coffer boxes under a
  half-cylinder), triglyph/metope frieze rhythm, the obelisk finally towering.
  Walking under it is the closest thing to the book's stated sublime.
- **Planetary Palace**: a real colonnade — `props.column` instanced at consistent bay
  widths with entablature, one bay per metal, Chaldean order preserved.
- **Three Doors wall**: pilaster rhythm + pediments over each door, so Virtue / Via
  Media / Pleasure read as *architecture*, not portals in a slab.
- The skill's "semantic anchors" idea maps directly onto our inscription plaques —
  reserved façade zones for the epigraphy that the Antiquarian's Eye quest
  (SCHOLARSHIP §3) will make clickable.
- Their acceptance test — "must withstand silhouette-only rendering and grazing
  light" — is literally our woodcut mode and raking sun. Free QA.
*Effort: the Portal alone is a 2–3 session arc; colonnade and wall are a session each.
Impact: this is the "mind-blowing architecture" line item.*

### 3. Air and distance — `threejs-atmosphere-aerial-perspective`
LIGHTING_ATMOSPHERE §4 wanted a faked distance layer for Cythera; this skill provides
the real thing at nearly the same cost: distance/height-based inscatter that tints far
geometry toward a sun-warmed horizon colour. Cythera and the sea recede into pearly
golden distance; nearby stone stays crisp; nothing gets darker — aerial perspective is
a *brightening* toward the horizon, so it deepens the world while honouring the
never-dark rule. Also upgrades the gradient sky dome with a sun disc + warm horizon
band. *Effort: ~1 session, mostly fog-shader injection. Impact: the world triples in
apparent size.*

### 4. Water that behaves — `threejs-water-optics`
Fountain of Venus, bath of the nymphs, the wood spring, and the sea are rotating
`CircleGeometry` discs. The skill's pool-heightfield pattern gives analytic ripple
normals + Fresnel + sun glint in one material: the fountain sparkles at the climax
station, the bath shimmers, the sea gets slow rolling normals with a bright sun-path
toward Cythera. Combine with LIGHTING §5's underwater uplight. Woodcut style keeps its
wavy-stroke water mode untouched. *Effort: 1 session. Impact: three stations plus the
entire southern horizon.*

### 5. Carved depth — `threejs-parallax-occlusion-mapping`
The project already fakes carving with displacement + Sobel normal maps (AF plates).
POM is the same idea's grown-up sibling: height-marched relief that stays deep at
grazing angles. Apply to the FESTINA LENTE hieroglyph plaque, pier reliefs, and door
inscriptions — the exact surfaces the player leans in to *read*, which is Poliphilo's
defining act. Height maps come from the existing `_plaqueTexture` canvases; no new
art. Pairs with the woodcut↔world comparison view (SCHOLARSHIP §4). *Effort: ~1
session for a POM-patched plaque material. Impact: the epigraphy, i.e. the soul.*

### 6. Grounding and grading — `threejs-screen-space-ambient-occlusion` + `threejs-exposure-color-grading`
A bright, high-fill scene loses contact shadows; a *mild* GTAO pass reseats columns,
figures, and steps on the ground without darkening anything at range. And the
golden-hour grade LIGHTING §1 asked for is this skill's core competency: do it as one
output-stage grade (warm highlights, gently cooled shadows) rather than retinting
lights one by one. If the world grows per §2, `threejs-shadow-systems`' cascade
approach keeps near-field shadows crisp with the same 2048² budget. *Effort: each is
well under a session using their reference passes on our existing EffectComposer.*

### 7. Flame, flare, petals — `threejs-procedural-vfx`
Polia's torch is the emotional center of her station and currently a prop. A small
shader flame with embers (their fire pattern), a restrained lens flare for the
afternoon sun, and petal-fall debris at the rose hedges (ANIMATION §7, upgraded)
finish the atmosphere. *Effort: half a session each.*

### 8. Proof discipline — `threejs-visual-validation`
The skill pack's own rule — every system must expose deterministic inputs and
**diagnostic captures** — matches this workspace's verification discipline. Adopt it:
a small script that loads each station × {lit, woodcut} via deep link and saves canvas
screenshots to `artifacts/captures/`. "Done" claims then come with pixels attached,
automatically. *Effort: 1 session; pays forever.*

Also worth a look when their moment comes: `threejs-camera-direction` (spline dolly +
look-ahead for the Tours and Dream-mode guide camera) and `threejs-procedural-fields`
(the noise/domain-warp toolbox several of the above lean on).

## Rejected for this project

- **`threejs-spectral-ocean`** (FFT water) — our sea is a backdrop viewed from shore;
  water-optics normals buy 90% at 5% of the cost.
- **`threejs-volumetric-clouds`** — raymarched density vs. a clean gradient sky brand;
  LIGHTING §6's drifting prop clouds remain the right call.
- **`threejs-procedural-planets`, `threejs-raymarched-space-effects`,
  `threejs-precipitation-surfaces`, `threejs-temporal-surfaces`** — wrong genre
  (no snow, rain, frost, or black holes in the Dream Garden).
- **GPU-compute/WebGPU variants** of the vegetation systems — compat risk on the
  phones-and-Pages target; instanced CPU-planned geometry is enough at our scale.
- **`threejs-bloom` / `threejs-image-pipeline`** — we already run UnrealBloom at
  tuned strengths; consult these only if halo artifacts appear after the grading pass.

## Sequencing

1. **Session 1**: install the pack; meadow grass with path masking (+ flower clumps
   if time). Biggest visible change per hour available anywhere in the project.
2. **Session 2**: aerial perspective + water optics — the two horizon systems, best
   tuned together.
3. **Sessions 3–5**: the Great Portal rebuild at book scale (its own arc), then
   colonnade and Doors wall.
4. **Interleave as small wins**: POM plaques, GTAO, golden-hour grade, torch flame,
   capture harness.

Every item above respects the style interface: vegetation/water/atmosphere are
lit-style systems behind guards; architecture is geometry and therefore serves both
renderings for free — and the woodcut mode doubles as the silhouette acceptance test
the skills themselves demand.
