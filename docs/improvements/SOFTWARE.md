# Software Architecture & Correctness

**Current state.** No build step — ES modules served raw, three.js via import map, deployed
as static files to Vercel. [main.js](../../src/main.js) (~1,190 lines) is the app shell: data
loading, world switching, HUD, plates/tours/dream UI, deep links. Scenes own their systems.
Cache-busting is manual query-string versions (`./scenes/HPWorldScene.js?v=10`, `main.js?v=38`).

## Ranked suggestions

### 1. 🍎 Single cache-version constant — kills a real bug class
This session twice shipped an edit that *didn't load* because one of the two version strings
(`index.html → main.js?v=N` and `main.js → HPWorldScene.js?v=M`) wasn't bumped. Fix:
- `src/version.js`: `export const V = 39;` — imported by main.js and appended to *all* its
  dynamic imports and fetches (it already versions data fetches with a `V` constant —
  unify them);
- index.html's single `main.js?v=` reference remains the one manual bump, or better, stamp
  it in the deploy step: `sed -i "s/main.js?v=[0-9]*/main.js?v=$(git rev-list --count HEAD)/"`.
*Effort: 30 min. Payoff: an entire class of "why isn't my change live" gone.*

### 2. Split main.js by surface
1,190 lines mixes five UIs. Natural seams, each already cohesive in the file:
`ui/plates.js`, `ui/tours.js`, `ui/dream-ui.js`, `ui/hud.js`, `app.js` (init + world switch).
No behaviour change; do it before the file hits 1,500 lines and merges become painful.

### 3. Station/vignette data out of code
`HP_STATIONS`, `DOORS`, `METALS`, `ELEMENTS`, `SENSE_NYMPHS`, `TRIUMPHS` are content, not
logic. Moving them to `src/data/hp_world.json` (like `af_vignettes.js` already does for AF)
lets scholarship edits happen without touching scene code — and lets the Historian/Designer
personas review a diff of *content only*.

### 4. Dispose audit
`HPWorldScene.dispose()` traverses and disposes geometry/materials, but shared cast materials
(`Cast.js` `mats` Map) are disposed *by the traversal* while the Map persists per-scene — fine
today (cast is rebuilt per scene), but if `makeCast` is ever hoisted, this double-frees.
Add a `cast.dispose()` that owns its Map, and have scenes call it.

### 5. requestAnimationFrame lifecycle
`ParticleStream.show/hide` run their own rAF loops detached from the scene loop; a dispose
during a fade leaks a ticking callback. Convert to time-based lerp inside `update(t)` (the
class already receives `t` every frame).

### 6. Error surface
`loadData()` failures land in the loading screen, good; but a failed *scene build* (e.g. a
bad texture) throws past any handler and freezes the veil. Wrap `launch*World` bodies in
try/catch that restores the previous world and toasts the error.

### 7. Smoke-test script
A 20-line Playwright/puppeteer script (`scripts/smoke.mjs`): load `#hp`, `#theatrum`,
`#dream`, assert no console errors and a canvas draw. Run before deploy. This session's
manual probe (luminance sampling via eval) proved the value; automate it.

## Non-goals
- A bundler. The no-build setup is a genuine feature (view-source scholarship, zero deps);
  the pain points it causes are all addressed more cheaply above.
