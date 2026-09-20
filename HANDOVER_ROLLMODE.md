<!-- tokens: ~2,525 -->
# HANDOVER — Roll Mode improvements

*Rewritten 2026-09-20 (second pass), after the first Phase 1 build landed in the wrong
repository. The baseline below was read out of the code, not remembered.*

---

## 0. What happened on 2026-09-20, and why it matters

The "Entry point for next session" block at the foot of the first version of this file was
pasted into a session opened in **`C:\Dev\EMBLEMSIN3D`** — the *Atalanta Fugiens* project
(`github.com/t3dy/emblems-in-3d`) — not in `C:\Dev\HPin3D`
(`github.com/t3dy/EmblemsIn3d`). The two repositories have confusingly similar names. That
session had no access to the Hypnerotomachia world, so it built a **standalone mock from the
prose of `archive/rollmode/ROLLMODEPLAN.md`**: a ball on an empty 200 × 400 m brown plane, with its own
physics, its own HUD, and its own stage names.

Three commits resulted in the Atalanta repo (`4de9021`, `7b82414`, `a009bda`), and the mock
is live at `https://t3dy.github.io/emblems-in-3d/roll-up.html`.

**None of it is portable, and none of it should be ported.** Specifically:

- It uses **NIGREDO → ALBEDO → CITRINITAS → RUBEDO**, four colour-stages, where this project
  uses the **seven metals** (Saturn/Lead → Sol/Gold) sourced from `hp.db.alchemical_symbols`
  and cited in the header of `src/systems/RollUp.js`. That is a rule 2 violation
  (cite, don't invent) and it contradicts `archive/rollmode/ROLLMODEPLAN.md` §4.1, which the mock was
  supposedly built from.
- It has **no world**: no census, no rollables, no creatures, no crust, no masonry. Its
  collection counter counts nothing — the HUD comment concedes the "+1" float is "ready for
  item system", and there is no item system. The ball grows from distance travelled, so the
  wedding fires after rolling a while on an empty plane.
- Its `RollUp.js` is 282 lines against this project's 709, and its physics ignore the growth
  curve that was **measured** on 2026-09-09 (`packing` 0.38, `bite` 0.48, `ROLLING.md` §1).

The salvage from that work is therefore **zero lines of code**. What it is good for is this
correction, and the lesson: the entry-point block must name the absolute path of the repo.

**Open, for Ted:** the mock is still published on the Atalanta site. Rule 4 says the two
projects are separate and Atalanta features are not built here — the converse holds too, and
a Hypnerotomachia roll-up demo does not belong on the Atalanta site. Removing it means
force-touching a public page, so it waits for a decision.

---

## 1. What is built (baseline, verified by reading the code 2026-09-20)

The first version of this file got four of these wrong, which is most of why the Phase 1
brief read as larger than it is. Every line below carries the place it was checked.

| Subsystem | State | Where |
|---|---|---|
| **Physics / growth** | Cube-root growth, packing 0.38, bite 0.48, measured not guessed | `src/systems/RollUp.js` header, `ROLLING.md` §1 |
| **Controls** | Single-stick (WASD + drag), two-stick (T, IJKL), mouse (RMB hold), quick-turn (Space), dash (Shift) | `RollUp.js`, footer text `src/main.js:1382` |
| **Crust** | Objects stick, sink to `SINK_FLOOR` 0.55, shed by count (2 000) | `RollUp.js:531 _crust()`, `CRUST.md` |
| **World interaction** | Census-backed: masonry, colliders, litter zones, grazed grass, creatures | `HPWorldScene._census`, `RollUp.js:602 _graze()`, `:622 _eat()` |
| **Stages** | **Seven metals**, transmute at 0, 0.6, 1.4, 2.6, 4.5, 7.5, 11 m; wedding at 18 | `RollUp.js:115 METALS`, `:137 WEDDING` |
| **Camera distance** | **Already scales with the ball** — `dist = r × 6` at start, clamped each frame to `[r × 2.4, r × 9]` | `RollUp.js:416`, `:691` |
| **HUD** | **Exists** — `#roll-hud` shows Size / Things / Metal plus a controls footer, and the eaten thing's name pops | `src/index.html:1199–1206`, wired `src/main.js:1355–1375` |
| **Stage display** | **Exists** — metal sign + name, and the cited note raised as a hint on transmute | `main.js:1377 onStage` |
| **Ending** | **Exists** — `#roll-done` score card: final size, things, grass, time, buttons | `RollUp.js:563 _transmute()` → `main.js:1389 onWedding`, markup `index.html:1212` |
| **Audio** | System **exists** (`src/systems/AlchemicalAudio.js`) but **roll mode does not use it** | grep: no audio reference in `RollUp.js` or `scenes/world/rollup.js` |

**Corrections to the previous version of this file:** it claimed "No HUD", "Camera doesn't
zoom out", "No ending = run just stops", and "Audio: None (no sound system yet)". All four
were false. A session acting on them rebuilds what is already here.

---

## 2. What Phase 1 actually leaves to build

**Updated 2026-09-20 (third pass).** Three of the five below are BUILT and shipped — §2.2 the size gauge, §2.3 the countdown, §2.4 the wedding cinematic — and their tickets are closed in `research/tickets.json` with the readings that closed them. §2.1 the camera formula now has its dials (`tune.camBase`, `tune.camScale`, defaults unchanged) and is still Ted's call. §2.5 was already done. See DECISIONS.md 58. **The one thing that was asked for and deliberately NOT built is the sounding fanfare**: the site is silent by the call of 2026-09-04 and the cue is filed as `question-roll-wedding-fanfare`.

Note for whoever bumps `RollUp.js?v=`: there are **three** importers now — `scenes/HPWorldScene.js`, `scenes/world/rollup.js` and `main.js`, which imports `METALS` and `WEDDING` for the HUD.

The original five, in payoff order, kept for the reasoning:

### 2.1 The camera formula — *a directional call, not a bug* (§1.1)

Today the camera holds a **constant six ball-radii**, so the ball occupies the same fraction
of the frame at 0.22 m and at 18 m. The plan asks for `1.2 + r × 2.0`, which is
**sub-proportional**: the ball grows in frame as you grow, which is the "I have become
massive" reading Katamari gets.

| r | today (`r × 6`) | plan (`1.2 + r × 2`) |
|---|---|---|
| 0.22 m | 1.3 m | 1.6 m |
| 2 m | 12 m | 5.2 m |
| 6 m | 36 m | 13.2 m |
| 18 m | 108 m | 37.2 m |

The plan's curve is much tighter late, which also cuts draw distance and may *help* the frame
budget (rule 7 — measure with `hpDiag()` either side). But it is a change of feel, not a fix,
and the wheel-zoom clamp at `:691` is written in radii, so it has to move with it.
**Wants Ted's eye before it is committed.** Add `tune.camBase` / `tune.camScale` so it can be
judged live.

### 2.2 The size gauge (§3.1) — the largest genuine gap

`#roll-size` is a number ("22 cm"). The plan wants a **bar or radial filling 0 → 18 m with
the seven metal signs marking the transitions**, so the arc is visible rather than inferred.
The signs and tints are already in `METALS`; nothing new needs sourcing.

Note: all CSS is inline in `src/index.html`, which no `?v=` covers — see CLAUDE.md.

### 2.3 Countdown to the next stage (§3.3)

`#roll-metal` shows the current metal. It does not say how far the next one is. One line:
`Mars · Iron — 1.8 / 2.6 m`. `METALS[k+1].at` is right there.

### 2.4 The wedding as a cinematic (§4.3)

The score card exists and is good. Missing: the **camera pull-back**, the **fanfare**, and a
**roll-again**. `AlchemicalAudio` already exists to hang the fanfare on — do not write a new
sound system, and do not copy the mock's bare sine-wave C-major arpeggio, which is unsourced
and sounds it.

### 2.5 The "+1" float (§3.2) — arguably already done

The eaten thing's **name** pops on swallow (`main.js:1368`), which is the same feedback by a
different route, and is better because it names what you ate. Do this only if the count
itself feels dead.

---

## 3. Phase 2 and 3

Unchanged from `archive/rollmode/ROLLMODEPLAN.md` §6, and still correct because they describe things that
genuinely do not exist: **strafe (Shift + WASD)** — note Shift is currently *dash*, so that
binding has to move; 180-turn feedback and momentum; camera heading-drift; stage-gated eating
(§4.2); then spin mode, the crust indicator, mouse refinement, per-object swallow sounds.

---

## 4. Reference files

- `archive/rollmode/ROLLMODEPLAN.md` — the detailed spec. **Its "Current state:" lines are stale in the same
  way this file's were** (§1.1 and §3.2 in particular); trust the table in §1 above instead.
- `ROLLMODE.md` — the design brief. `ROLLING.md` — growth tuning. `CRUST.md` — shedding.
- `src/systems/RollUp.js` — the implementation, and the best document of the reasoning.

---

## 5. Entry point for the next session

**Open the session in `C:\Dev\HPin3D`.** Confirm it with `git remote -v`: it must print
`github.com/t3dy/EmblemsIn3d`. If it prints `emblems-in-3d` (lowercase, hyphens) you are in
the Atalanta project and must stop.

```
Continue Roll Up mode Phase 1 in C:\Dev\HPin3D (github.com/t3dy/EmblemsIn3d).

Read HANDOVER_ROLLMODE.md §1 first — it is the verified baseline. The HUD, the seven-metal
stage display, the wedding score card and a scaling camera ALL ALREADY EXIST. Do not rebuild
them. archive/rollmode/ROLLMODEPLAN.md's "Current state:" lines are stale.

Build, in this order, from §2 of the handover:
  1. The size gauge (0 -> 18 m, seven metal signs at the transitions). CSS is inline in
     src/index.html.
  2. Countdown to the next metal in #roll-metal.
  3. The wedding cinematic: camera pull-back, fanfare on the EXISTING AlchemicalAudio,
     roll-again.

Leave the camera formula (§2.1) alone until Ted has judged it — it is a change of feel, not
a fix. Add tune.camBase / tune.camScale so he can.

Run `await hpDiag()` before and after and put both readings in the commit message (rule 7).
Bump the ?v= chain for every module you touch, up to main.js?v=N in src/index.html
(RECIPES/bump-cache-versions.md). Then push to main and verify the specific change live at
https://t3dy.github.io/EmblemsIn3d/src/ before saying it is done (rule 1).
```
