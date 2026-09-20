# ROLLMODEPLAN — camera, controls, and polish for stage 2 (Katamari-aligned)

*Planning document for improving Roll Up mode to match Katamari Damacy feel and user control responsiveness. Organized by subsystem: camera scaling, controls, feedback/HUD, stage progression, polish.*

**Related:** `ROLLMODE.md` (the design brief), `ROLLING.md` (growth tuning), `CRUST.md` (crust physics), `src/systems/RollUp.js` (implementation).

> ⚠️ **The "Current state:" lines below are stale, and one session has already been misled by
> them** (2026-09-20). §1.1 says the camera is at a fixed distance — it is not, it scales at
> `r × 6`, clamped `[r × 2.4, r × 9]` (`src/systems/RollUp.js:416`, `:691`); §3.2 says the
> collection count is not displayed — it is (`src/index.html:1203`); §3.3's stage display and
> §4.3's score screen both exist already. **Read `HANDOVER_ROLLMODE.md` §1 for the verified
> baseline before building anything from this file.** The *targets* here are still good; only
> the claims about what is already built are wrong.


---

## 1. CAMERA MECHANICS — Scale + Distance

### 1.1 Dynamic camera distance (primary)

**Current state:** Camera is fixed distance, does not scale with ball.

**Target:** Camera distance scales as `distance = baseDistance + ballRadius * scaleFactor`, so the player always sees the ball + ~3 ball-radii of space around it.

| Ball radius | baseDistance | scaleFactor | visual effect |
|---|---|---|---|
| 0.22 m (start) | 1.2 m | 2.0 | tight, intimate |
| 2 m (early) | 1.2 m | 2.0 | `distance = 5.2 m` |
| 6 m (mid) | 1.2 m | 2.0 | `distance = 13.2 m` |
| 12 m (late) | 1.2 m | 2.0 | `distance = 25.2 m` |
| 18 m (wedding) | 1.2 m | 2.0 | `distance = 37.2 m` — the world opens up |

**Why:** Katamari's camera feels responsive because it zooms out as you grow. You see the scale transition. Without this, a 12 m ball feels like a regular-sized ball with tiny stuff stuck to it, not "I have become massive."

**Implementation (src/systems/RollUp.js):**
```js
// In update(), after r changes:
const baseDistance = 1.2;
const scaleFactor = 2.0;
this.cam.setDistance(baseDistance + this.r * scaleFactor);
```

**Tuning dials:** `tune.camBase` (1.2), `tune.camScale` (2.0). Both live on the instance, so you can adjust mid-roll and feel the difference.

**Bonus:** Camera height should also scale. At start, eye is level with ball. At 12 m, eye is ~0.5× ball-height, looking slightly down. This reads as "I am massive."

```js
const eyeHeightFraction = 0.3 + (this.r / 18) * 0.7;  // starts 0.3, ends 1.0
this.cam.position.y = this.r * eyeHeightFraction;
```

---

### 1.2 Camera follows ball's heading (secondary)

**Current state:** Camera swings around the ball based on mouse drag or two-stick commands, but does not "lean into" the ball's motion. It is always neutral.

**Target:** When the ball is rolling north (say), the camera's forward direction should drift toward matching it, so the player sees "ahead" of the ball by default.

**Why:** This is the Katamari feel. The camera is not a free orbit; it is locked to the ball's motion, with player controls as perturbations around that.

**Implementation:** In `update()`, calculate the ball's velocity direction and drift the camera yaw toward it:

```js
const motionYaw = Math.atan2(this.vel.x, this.vel.z);
const currentYaw = this.cam.yaw;
const yawDiff = motionYaw - currentYaw;
const dampedYaw = currentYaw + yawDiff * 0.02;  // 2% per frame drift
this.cam.yaw = dampedYaw;
```

**Tuning dial:** `tune.headingDrift` (0.02, range 0.0–0.1).

---

### 1.3 Zoom out on uphill, zoom in on downhill (tertiary)

**Current state:** None.

**Target:** Detect ground slope ahead of the ball. If climbing, pull camera back slightly. If descending, push slightly forward. This reads as "I am working harder" or "I have momentum."

**Why:** Subtle; makes the camera feel alive and responsive to terrain.

**Implementation:** Raycast ahead of the ball, detect slope angle, adjust camera distance by `slopeEffect`.

```js
const slopeAngle = detectTerrainSlope(this.pos, this.vel);  // angle in radians
const slopeZoom = slopeAngle * 0.5;  // 0.5 m per radian of slope
this.cam.setDistance(baseDistance + this.r * scaleFactor + slopeZoom);
```

**Tuning dial:** `tune.slopeZoomFactor` (0.5, range 0.0–1.0).

**Priority:** Low. Nice-to-have, not critical.

---

## 2. CONTROLS — Movement, Rotation, & Speed Variants

### 2.1 Current controls (baseline)

From `ROLLMODE.md` §1a:

| Scheme | Left hand | Right hand | Camera | Turn |
|---|---|---|---|---|
| **Single-stick (default)** | WASD roll | Q E Z C numpad | drag (RMB), wheel | Space quick-turn |
| **Two-stick (T)** | WASD roll | IJKL or arrows roll/turn | drag or C behind | Space quick-turn |
| **Mouse (active on RMB hold)** | none | (implicit) roll where looking | drag right-hand | N/A |

**What works:** Single-stick feels good for keyboard. Two-stick is recognizable to Katamari players.

**What needs work:** No "strafe" mode (sideways roll without turning). No "spin" (rotate in place). Quick-turn (Space) exists but is not advertised.

---

### 2.2 Add strafe mode (Shift modifier)

**Current state:** None.

**Target:** Holding Shift changes roll direction to *sideways*, not *away*. Rolling WASD+Shift means the ball rolls left-right while the ball itself turns.

**Why:** Katamari has this. It's how you dodge around obstacles and sneak into corners. Essential for level 2+ (when the ball gets to ~3 m and encounters narrow passages).

**Implementation:**
```js
if (this._keys.has('ShiftLeft') || this._keys.has('ShiftRight')) {
  // strafe mode: roll is perpendicular to facing
  const facing = new THREE.Vector3(
    Math.sin(this.cam.yaw), 0, Math.cos(this.cam.yaw)
  );
  // perpendicular is facing rotated 90° left/right
  const leftPerp = new THREE.Vector3(-facing.z, 0, facing.x);
  
  if (this._keys.has('KeyW')) this.roll(leftPerp);  // W = roll left
  if (this._keys.has('KeyS')) this.roll(leftPerp.multiplyScalar(-1));  // S = roll right
  // A/D still rotate the ball while strafing
} else {
  // normal mode: roll is forward/back relative to facing
  ...
}
```

**Tuning dial:** None; this is a binary toggle.

**Priority:** High. Changes how the mode plays fundamentally.

---

### 2.3 Add spin mode (Control modifier)

**Current state:** None.

**Target:** Holding Control makes A/D *spin the ball in place* (rotate yaw without moving the center) instead of turning the ball's heading.

**Why:** Useful for fine-tuning your angle before approaching something. Also feels good when the ball is massive (late game).

**Implementation:**
```js
if (this._keys.has('ControlLeft') || this._keys.has('ControlRight')) {
  // spin mode: A/D rotate without moving
  if (this._keys.has('KeyA')) this.spinYaw(0.03);  // left
  if (this._keys.has('KeyD')) this.spinYaw(-0.03);  // right
} else {
  // normal mode: A/D turn the ball
  ...
}
```

**Tuning dial:** `tune.spinRate` (0.03 rad/frame).

**Priority:** Medium. Nice-to-have, lower stakes than strafe.

---

### 2.4 Improve 180-turn (quick-turn)

**Current state:** Space key does a quick 180-degree turn (camera swings behind the ball).

**Target:** 
- Add a visual indicator (screen-edge arrow or a brief "whip" sound) when Space is pressed.
- Add a momentum boost: briefly increase roll rate for 0.3 s after 180-turn, like Katamari's "recovery spin."
- Make it work in both single-stick and two-stick modes.

**Why:** The 180-turn is disorienting without feedback. A momentum boost makes it feel like a game mechanic, not an accident.

**Implementation:**
```js
onQuickTurn() {
  this.cam.yaw += Math.PI;  // flip camera
  this.vel.multiplyScalar(1.2);  // boost momentum
  this._quickTurnRecovery = 0.3;  // duration in seconds
  playSound('whip');  // audio feedback
  showScreenIndicator('quick-turn-arrow');  // visual feedback
}

update(dt) {
  if (this._quickTurnRecovery > 0) {
    this.rollForce *= 1.05;  // still rolling hard
    this._quickTurnRecovery -= dt;
  }
}
```

**Tuning dials:** `tune.quickTurnBoost` (1.2), `tune.quickTurnDuration` (0.3).

**Priority:** Medium.

---

### 2.5 Mouse control refinement (polish)

**Current state:** Right-click-drag rolls in the direction you're looking. Works but feels loose.

**Target:** 
- Tighten the drag-to-roll mapping: camera yaw change should map 1:1 to ball rotation (not offset).
- Add scroll-wheel zoom: wheel up zooms in (smaller `tune.camScale`), wheel down zooms out.
- Add scroll-wheel strafe: Shift+scroll rolls left/right without turning.

**Why:** Makes mouse play viable as a first-class control scheme, not an afterthought.

**Priority:** Low. High polish, but single-stick already works.

---

## 3. VISUAL FEEDBACK & HUD

### 3.1 Ball size indicator (critical)

**Current state:** No indication of how large the ball is. Player estimates by visual size.

**Target:** 
- Bottom-left: a small radial gauge showing ball radius (0 → 18 m), with metal icons (Saturn, Jupiter, Mars, Venus, Mercury, Luna, Sol) marking stage transitions.
- Colour-coded stages (lead grey → gold).
- Real-time updates.

**Why:** This is the game's *whole narrative arc* (the alchemical transmutation). Without visible progress, the player doesn't feel the growth.

**Implementation (src/ui/RollUpHUD.js, new file):**
```js
class RollUpHUD {
  update(ballRadius, stage) {
    const gaugeValue = ballRadius / 18;  // 0 to 1
    this.sizeGauge.setProgress(gaugeValue);
    this.stageIcon.setMetal(METALS[stage]);
  }
}
```

**Tuning:** None; this is display-only.

**Priority:** Critical. Without this, stages are invisible.

---

### 3.2 Collection counter (high)

**Current state:** A count of stuck objects (`this.count`), not displayed.

**Target:** 
- Top-left corner: "Items collected: 4,237" in real-time.
- Animate the number +1 when something is swallowed.
- Per-stage breakdown (optional): "Grass: 3,000 | Objects: 1,237".

**Why:** Gives immediate feedback (dopamine) when swallowing. Players compare their counts (speedrun culture).

**Implementation:**
```js
swallowItem(item) {
  this._swallow(item);
  this.count++;
  this.ui.animateCollectionCounter(this.count);  // +1 pop animation
}
```

**Priority:** High.

---

### 3.3 Current stage & metal display (high)

**Current state:** No indication which metal stage you're in (lead, tin, iron, copper, quicksilver, silver, gold).

**Target:** 
- Display the current metal name and an icon (alchemical symbol from the database).
- Show countdown to next stage (e.g., "Jupiter: 4.2 m / 6.0 m").

**Why:** Tells the player exactly where they are in the transmutation arc.

**Implementation:**
```js
update() {
  const stage = this.stage;
  const metal = METALS[stage];
  const nextStageAt = METALS[stage + 1]?.at || 18;
  this.ui.setStageMetal(metal.name, metal.symbol);
  this.ui.setStageProgress(this.r, nextStageAt);
}
```

**Priority:** High.

---

### 3.4 Crust health/shed warning (medium)

**Current state:** Objects are silently shed from the crust when it gets too large. Player never knows why their cathedral is gone.

**Target:** 
- Small indicator showing "Crust: 1,847 / 2,000" (pieces stuck on ball).
- Colour change (green → yellow → red) as crust fills.
- Brief "shed" animation (small object flies off) when something is dropped.

**Why:** Demystifies the shedding mechanic. Players understand "I lost the cathedral because I overstuffed."

**Priority:** Medium. Nice educational value.

---

### 3.5 Terrain slope indicator (low)

**Current state:** No indication of upcoming slopes.

**Target:** 
- Screen-edge indicator: arrow/chevron pointing uphill or downhill.
- Subtle visual or audio cue when approaching a steep slope.

**Why:** High-level courses have terrain that demands attention. This helps players plan ahead.

**Priority:** Low. Mostly an accessibility feature.

---

## 4. STAGE PROGRESSION & NARRATIVE ARC

### 4.1 The seven metals (existing)

```
Stage 0: Lead (Saturn)     – start at 0.22 m, transmute at 0.6 m
Stage 1: Tin (Jupiter)     – transmute at 1.4 m
Stage 2: Iron (Mars)       – transmute at 2.6 m
Stage 3: Copper (Venus)    – transmute at 4.5 m
Stage 4: Quicksilver (Mercury) – transmute at 7.5 m
Stage 5: Silver (Luna)     – transmute at 11 m
Stage 6: Gold (Sol)        – achieved at 18 m (wedding)
```

**Current:** This is set in `src/systems/RollUp.js` (METALS array).

**What works:** The progression is mathematically sound (logarithmic in feel).

**What could improve:** 
- Each stage should introduce new, larger obstacles (see 4.2).
- Stage transitions should have visual/audio fanfare (new metal icon glows, chime plays).
- The wedding ending should be a cinematic moment (camera pull-back, music swell, credits).

---

### 4.2 Open levels as stages progress (world/masonry unlocking)

**Current state:** All precincts are always edible. A stage-3 ball can eat the pyramid's capstone.

**Target (stage 2+ work):** 
- Stage 0–1 (lead/tin): Only grass, small litter, tiny structural pieces. No columns, no major buildings.
- Stage 2–3 (iron/copper): Medium litter, small columns, trees.
- Stage 4–5 (quicksilver/silver): Large litter, building fragments, sarcophagi, triumphal car parts.
- Stage 6 (gold): Everything. Full monuments, the palace facade, the pyramid itself (if it's built at true scale).

**Why:** This is how Katamari works — later stages open up new courses. Here, it makes the later stages feel like genuinely different game spaces (ch. VI looks different when you can eat the mountain walls).

**Implementation:** In `Masonry.js` and litter-zoning, add a `minStage` property to each object:

```js
_rollGroup('pyramid_capstone', () => ..., { minStage: 5 });  // only edible at silver+
```

In `RollUp._swallow()`, check:
```js
if (item.userData.minStage !== undefined && item.userData.minStage > this.stage) {
  return false;  // cannot eat this yet
}
```

**Priority:** Medium. Belongs to stage 2 work (once true-scale precinct layout is live).

---

### 4.3 Level endings & level progression

**Current state:** The run ends when the ball reaches 18 m (wedding size). No transition, no score screen.

**Target:** 
- At 18 m, trigger a cinematic: camera zooms out, sphere glows gold, a fanfare plays.
- Display final score (total items, total time, area cleaned, etc.).
- Show high-score leaderboard (local storage, not online).
- Option to "roll again" (restart from 0.22 m).

**Why:** Closure. The player should feel *finished*, not just stopped.

**Implementation (src/systems/RollUp.js, end-game check):**
```js
update(dt) {
  if (this.r >= WEDDING && !this._endgameTriggered) {
    this._triggerWedding();
  }
}

_triggerWedding() {
  this._endgameTriggered = true;
  playSound('wedding-fanfare');
  this.cam.cinematicZoomOut();
  this.ui.showEndGameScreen({
    totalItems: this.count,
    totalTime: this.time,
    stage: 6,
  });
}
```

**Priority:** High. This is the emotional payoff.

---

## 5. POLISH & MINOR TWEAKS

### 5.1 Audio feedback for collection

- Swallow sound: should vary by object type (grass = swish, stone = thud, nymph = gasp).
- Crust shed sound: a *plunk* when something falls off the back.
- Stage transition: alchemical chime (a descending 5-note sequence, different per stage).

**Priority:** Medium. High polish, but not blocking.

---

### 5.2 Vibration/haptics feedback (if gamepad)

- Roll forward: subtle continuous rumble.
- Swallow: brief intense vibration + pop.
- Stage transmute: rhythmic pulse for 0.5 s.

**Priority:** Low. Gamepad support is post-launch.

---

### 5.3 Settings / difficulty options

- **Roll speed:** `tune.rollForce` slider (0.5x–2x).
- **Camera responsiveness:** `tune.camDamping` slider.
- **Difficulty (world packing):** ease (fewer objects per zone) / normal / hard (many).

**Priority:** Low. Post-launch convenience feature.

---

## 6. IMPLEMENTATION ROADMAP

### Phase 1 (critical path, 1–2 sessions)
1. Dynamic camera distance (§1.1) — 30 min
2. Ball size HUD indicator (§3.1) — 45 min
3. Stage/metal display (§3.3) — 30 min
4. Collection counter (§3.2) — 20 min
5. Wedding cinematic ending (§4.3) — 1 hour
6. Test & tune `tune.*` dials live on the instance

**Deliverable:** Roll Up feels like Katamari in 2–3 hours of play.

---

### Phase 2 (high-value, 1–2 sessions)
7. Strafe mode (Shift, §2.2) — 45 min
8. 180-turn improvements (§2.4) — 30 min
9. Camera follows ball heading (§1.2) — 20 min
10. Stage-gated object eating (§4.2) — 1 hour
11. Audio fanfare per stage — 30 min

**Deliverable:** Controls and progression read as polished. Gameplay loop is apparent.

---

### Phase 3 (polish & optional, 0.5–1 sessions)
12. Spin mode (Control, §2.3) — 30 min
13. Crust health indicator (§3.4) — 20 min
14. Mouse zoom/strafe refinement (§2.5) — 30 min
15. Per-object swallow sound variants — 30 min

---

## TUNING DIALS (all live on `roll.tune`)

```js
{
  // Growth
  packing: 0.38,
  bite: 0.48,
  
  // Camera
  camBase: 1.2,
  camScale: 2.0,
  headingDrift: 0.02,
  slopeZoomFactor: 0.5,
  
  // Controls
  spinRate: 0.03,
  quickTurnBoost: 1.2,
  quickTurnDuration: 0.3,
  
  // Crust
  crust: 2000,
}
```

To tweak live in-roll:
```js
const roll = window._hp.state.activeScene.roll;
Object.assign(roll.tune, { camScale: 2.5, packing: 0.35 });
```

---

## FILES TO MODIFY / CREATE

| File | Change | Scope |
|---|---|---|
| `src/systems/RollUp.js` | Camera distance scaling, quick-turn boost, stage gating, wedding trigger | Core |
| `src/ui/RollUpHUD.js` (new) | Size gauge, stage display, collection counter | UI |
| `src/systems/Masonry.js` | Add `minStage` property checks | Core |
| `src/sounds/index.js` | Stage fanfares, collection sounds (if sound system exists) | Audio |
| `decisions/2026-09.md` | Record the control scheme decisions | Docs |

---

**Build these in phase 1 first. The HUD makes the mode playable (you understand where you are). Then controls make it fun (you can steer effectively). Then polish makes it stick.**

Build joyfully. Katamari's genius is that growing feels good. Make that read on screen.
