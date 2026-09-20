<!-- tokens: ~1,400 · read before starting roll mode work -->
# HANDOVER — Roll Mode improvements (2026-09-20)

*State of the roll mode as of today, and what to build next.*

## What is built (baseline)

- **Physics:** Cube-root growth formula, packing loss 0.38, bite limit 0.48. Tuned on 2026-09-09; tested live with headless sweep.
- **Controls:** Single-stick (WASD + drag), two-stick (IJKL), mouse (RMB hold). Works but feels loose.
- **Crust:** Objects stick to surface, sink slowly, shed by count (2,000 max). SINK_FLOOR = 0.55 keeps objects 45% proud.
- **World interaction:** Masonry (columns, arches, loads), generic support (object resting), litter zones (grass, small objects).
- **Stages:** 7 metals (lead→tin→iron→copper→quicksilver→silver→gold), transmute at 0.6, 1.4, 2.6, 4.5, 7.5, 11, 18 m.
- **Audio:** None (no sound system yet).

**What works:** Growth is now correctly paced (was too fast). Crust stays visible. Structures undermine correctly.

**What doesn't:** No HUD = player can't see how big they are or how far to the next stage. No strafe = can't dodge. Camera doesn't zoom out = ball feels tiny even at 18 m. No ending = run just stops.

## Three decisions made today

1. **Camera scales with ball.** Distance = 1.2 + radius × 2.0. Player zooms out as they grow.
2. **Strafe mode (Shift + WASD).** Roll left/right without turning. High-value control.
3. **HUD shows size gauge, stage metal, and collection count.** Without these three, stages are invisible and progress is unmeasurable.

## Phase 1 (1–2 sessions, critical path)

**What to build:**
1. Dynamic camera distance (`tune.camBase`, `tune.camScale`) — tie it to `this.r` in `update()`.
2. Ball size gauge (bottom-left) — shows 0→18 m, metal icons at stage boundaries, real-time.
3. Stage/metal display (top-left) — current metal name + icon, countdown to next stage.
4. Collection counter (top-right) — "Items: 4,237" with +1 animation on swallow.
5. Wedding cinematic ending (at r ≥ 18 m) — camera zoom-out, fanfare, score screen.

**Why this order:** HUD makes the game *readable*. You understand where you are and what you're working toward. Wedding ending gives closure (the run is not just a loop, it has a destination).

**Files to touch:**
- `src/systems/RollUp.js` — camera distance, wedding trigger logic.
- `src/ui/RollUpHUD.js` (new) — all HUD display.
- `src/sounds/index.js` (or create) — wedding fanfare.

**Tuning dials to add:**
```js
tune: {
  packing: 0.38,           // already exists
  bite: 0.48,              // already exists
  camBase: 1.2,            // NEW: base camera distance
  camScale: 2.0,           // NEW: scale per radius
  quickTurnBoost: 1.2,     // NEW: momentum after 180-turn
}
```

**Deliverable:** After phase 1, a 5-minute roll feels meaningful. You watch the size gauge fill, see the metal change, count your collection.

## Phase 2 (1–2 sessions, high-value)

- Strafe mode (Shift + WASD) — critical for mid-game.
- 180-turn improvements (Space) — visual feedback + momentum boost.
- Camera follows ball heading — leans into motion.
- Stage-gated eating (§4.2 in ROLLMODEPLAN.md) — later stages open new courses.

**Deliverable:** Controls feel tight. Later stages feel different (new obstacles edible).

## Phase 3 (0.5–1 session, polish)

- Spin mode (Control + A/D).
- Crust health indicator.
- Mouse refinement (zoom/strafe).
- Per-object swallow sounds.

---

## What Phase 1 feels like when done

You start rolling. Bottom-left, a size gauge shows lead (grey). As you eat grass and pebbles, it fills. At 0.6 m, fanfare plays, gauge turns tin-colour (gold). At 2.6 m, iron (red). You see your item count climb (4,000 by mid-game). At 18 m, the camera zooms out, everything glows gold, credits roll. You feel like you *won*.

---

## Reference files

- `ROLLMODEPLAN.md` — detailed spec for every feature. Read this before each phase.
- `ROLLMODE.md` — the design brief (what Roll Up is and why).
- `ROLLING.md` — growth tuning and live dials.
- `CRUST.md` — why objects shed and how.
- `src/systems/RollUp.js` — the implementation.

---

## Entry point for next session

Paste this into the next conversation to continue:

```
/model claude-haiku-4-5-20251001

Build Roll Up mode phase 1: camera scaling, HUD (size gauge, stage display, collection counter), and wedding ending.

Reference: ROLLMODEPLAN.md (full spec), HANDOVER_ROLLMODE.md (what's done, what's next).

Phase 1 files: src/systems/RollUp.js (camera distance, wedding trigger), src/ui/RollUpHUD.js (new file, all HUD), src/sounds/ (wedding fanfare).

The three things players must see to understand Roll Up:
1. How big am I? (gauge, 0→18 m)
2. What stage am I? (metal icon + name, countdown to next)
3. How many things did I eat? (item counter, +1 on swallow)

Start with camera distance (30 min, highest payoff). Then HUD (all three indicators, ~2 hours). Then wedding ending (1 hour, emotional payoff).

Live tuning dials on roll.tune: camBase (1.2), camScale (2.0). Test the camera scaling until zoom-out feels natural (not too tight at start, not too far at end).

Deploy to GitHub Pages and verify the changes live at t3dy.github.io/EmblemsIn3d/src/ before marking done.
```

---

Build Phase 1 and roll. The gauge filling is dopamine. The wedding is closure.
