# Animation — making the garden live

**Current state.** [HPWorldScene.update()](../../src/scenes/HPWorldScene.js) drives: NPC idle
*sway* (whole-group Y-rotation), orb bob/spin, point-light pulses, portal-veil opacity, boat
bob, triumph-float breathing, torch flicker, and [ParticleStream](../../src/systems/Particles.js)
water jets. [DreamMode](../../src/systems/DreamMode.js) walks the player and a guide along
waypoint paths. Nothing else moves. The result is a world that breathes but never *gestures*.

## Ranked suggestions

### 1. 🍎 Living gestures via the existing arm pivots — IMPLEMENTED
`figure()` already exposes `userData.armL/armR` as pivot groups; no scene uses them after
construction. A per-NPC oscillation of ±0.04–0.08 rad on each arm's Z (phase-offset from the
body sway) turns statues into people at negligible cost. Registered in the same `_npcs` loop
that already runs. *~15 lines.*

### 2. Guide gait in Dream mode
The dream guide currently glides. Fake a walk with two lines in the travel phase: body
bob `y = |sin(t·f)|·0.03` and a small roll `rz = sin(t·f)·0.02`. Frequency tied to speed so
hurrying reads as hurrying.

### 3. Bird flights (the garden's ceiling is empty)
`animals.bird` has `wingL/wingR`. Spawn 2–3 birds on large slow circles
(`x = cx + R·cos(ωt)`, banking into the turn, wings flapping at 3 Hz). Cross the processional
axis so players walking north see life overhead. *~30 lines, huge liveliness return.*

### 4. 🍎 Water surfaces — IMPLEMENTED
The fountain/bath/pool water discs were static. Slow UV-less rotation of each disc (they're
`CircleGeometry`, center-pivoted) plus a subtle scale pulse gives "water at a glance" without
shaders. Sea plane gets a gentle opacity breathe. Tracked in a `_waters` array at build time.

### 5. Wolf & dragon patrols
The wolf "watching the path" should *pace*: a 3-waypoint loop with the existing quadruped just
translating + facing its heading (no leg articulation needed at its scale — motion itself is
the tell). Same for the dragon: a slow menacing weave in front of the portal vault. Use the
Dream-mode waypoint walker logic, extracted into a tiny `Patroller` helper.

### 6. Grip-chains for the sense-nymphs (Bouguereau's lesson)
When the quest layer lands (SCHOLARSHIP.md §3), the bath scene wants the nymphs *pulling*
Poliphilo: pose arms along a chain (each nymph's `armR` toward the next figure). Static pose,
zero animation code — the painting proves a frozen grip-chain reads as motion.

### 7. Petal/leaf fall at Polia's garden
One `ParticleStream` per rose hedge, source above, target at ground, tuned pink, `speed 0.05`.
The class already supports this; it's configuration, not code.

## Sequencing note
1 & 4 are done. Do 3 (birds) next for maximal per-line payoff, then 2, then 5.
