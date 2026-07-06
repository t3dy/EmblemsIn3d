# Improvement Notes — Index

> Written 2026-07-06, after the daylight/fidelity pass ([HPWorldScene.js](../../src/scenes/HPWorldScene.js) v10).
> Each file assesses one area of the two game worlds, ranks concrete suggestions, and marks
> **🍎 low-hanging fruit** (≤1 session, low risk, visible payoff).

| File | Area | Top pick |
|------|------|----------|
| [MODELING.md](MODELING.md) | The Cast: figures, beasts, props | Nymph silhouette upgrade (lathe gowns, Fontainebleau proportions) |
| [ANIMATION.md](ANIMATION.md) | Motion: idle, gesture, ambient life | 🍎 Use the existing `armL/armR` pivots for living gestures |
| [TEXTURES.md](TEXTURES.md) | Surface: procedural maps, materials | 🍎 Bump maps from the existing canvas textures |
| [SOFTWARE.md](SOFTWARE.md) | Architecture, build, correctness | 🍎 Single cache-version constant (kills a real bug class) |
| [LIGHTING_ATMOSPHERE.md](LIGHTING_ATMOSPHERE.md) | Light, sky, air | 🍎 Drifting pollen motes in the sunbeams |
| [AUDIO.md](AUDIO.md) | Sound: ambient, positional, UI | Positional water/fire sources via Tone.Panner3D |
| [UX_NAVIGATION.md](UX_NAVIGATION.md) | Controls, wayfinding, mobile | 🍎 Station compass strip on the HUD |
| [SCHOLARSHIP.md](SCHOLARSHIP.md) | Content: annotations, quests, sources | Wire the nymph sourcebook + a "Seeker's Work" quest layer for HP |

**Implemented immediately after writing** (see git log): bump maps (TEXTURES §1),
water-surface animation (ANIMATION §4), arm-gesture idle (ANIMATION §1), pollen motes
(LIGHTING_ATMOSPHERE §2).
