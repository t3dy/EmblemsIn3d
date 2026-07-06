# Lighting & Atmosphere

**Current state.** Lit HP world (post-daylight-pass): bright warm afternoon — sun 2.6 with
2048² PCF-soft shadows, hemi 1.15, ambient 0.85, blue→cream gradient sky dome, light warm
haze (FogExp2 0.0072), bloom 0.35, env-map 0.42. The user's standing rule: **never dark**
(see memory `not-dark-worlds`). Woodcut style: one raking key + paper fog, by design.

## Ranked suggestions

### 1. Golden-hour grading via the sun only
The scene is bright but slightly *neutral*. Warm the key (`0xffe6b8`), cool the hemisphere
ground colour a touch, and the complementary shadow/sun palette appears — afternoon without
losing a single nit of brightness. Two colour literals.

### 2. 🍎 Pollen motes in the sunbeams — IMPLEMENTED
~200 `THREE.Points` drifting slowly in a tall box over the garden, additive, size-attenuated,
opacity ~0.35. Motes are the cheapest possible "air is real" signal and read as sunlight
made visible. Woodcut style skips them.

### 3. Dappled light under the wood
The dark wood's canopy casts blob shadows already; a `DirectionalLight`-following light-gap
texture is overkill. Cheaper: 6–8 small warm `CircleGeometry` decals (`opacity 0.25,
additive`) scattered on the duff as sun-pools. Fake, static, completely convincing.

### 4. Distance layers for Cythera
The isle sits on the horizon at full material saturation. Aerial perspective in one line:
a fog-coloured `MeshBasicMaterial` overlay plane at 40% opacity behind the sea, or simply
lerp the isle's material colours toward the fog colour. Depth doubles.

### 5. Water light play
The fountain already has a pulsing blue point light. Add a slow-rotating spot from below the
top basin (`penumbra 1`, low intensity) aimed at the Venus figure — shimmering caustic-ish
uplight, one light, big theatrical payoff at the climax station.

### 6. Sky birds & clouds
Two or three `props.cloud` groups at y≈40 drifting at 0.1 u/s complete the sky dome's story
(it's currently a clean gradient). Combine with ANIMATION §3's birds.

### 7. Bloom discipline
Bloom 0.35 is right for orbs/portal veils, but it also blooms the bright sky at the horizon
line. If halos appear after §1's warmer sun, drop to 0.28 rather than re-tinting.

## Explicitly rejected
- Time-of-day cycle: charming, but the world's stations are lit *for* one hour; a cycle
  would spend the lighting art budget on states nobody tuned. A fixed golden afternoon is
  the brand.
- Post-process god-rays: cost/complexity high; the pollen + sun-pool fakes above buy 80%.
