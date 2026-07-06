# UX & Navigation

**Current state.** First-person walking ([Walker.js](../../src/systems/Walker.js)): WASD/arrows,
shift-run, drag-look, digit-key teleports, circle/wall colliders. HUD shows nearest wonder +
folio + cross-world links; annotations surface on a timer. Dream mode narrates with
click-to-continue. Deep links via URL hash. No touch controls, no map, no save.

## Ranked suggestions

### 1. 🍎 Station compass strip
Players don't know the digit-key map (1–9) until they read a hint. A slim strip of nine dots
along the HUD bottom — filled when visited, gold when near, tooltip with the wonder's name,
click = teleport — is both a legend and a progress tracker. All data (`HP_STATIONS`) and the
teleport API already exist; it's ~60 lines of HUD.

### 2. Mobile: two-thumb touch
The site works on phones *except* movement (drag-look exists; there's no walk input).
A left-half virtual stick (pointer events, no library) + right-half look-drag makes the whole
world phone-playable. The Walker's input is already abstracted to `keys{}` — the stick just
sets the same flags. ~80 lines.

### 3. Resume where you left off
`getSpawnState()` exists (used for style toggling). Persist it to `localStorage` every few
seconds; on load with no explicit hash, offer "Continue at the Fountain of Venus →".
Visited-station set feeds §1's compass fill.

### 4. Dream-mode accessibility
- `aria-live="polite"` on `#dream-text` so screen readers follow the story;
- keyboard: Space/Enter advance (currently click-only);
- a text-size toggle — the narration is the product for many visitors.

### 5. Look smoothing & FOV kick
Drag-look maps 1:1 to pixels; a small critically-damped smoothing (lerp yaw/pitch toward
target at ~12 Hz) removes jitter, and +3° FOV while shift-running sells speed. Six lines
total in Walker.

### 6. Pointer-lock option
Desktop players expect mouse-look on click. Offer it (Esc releases, as standard) but keep
drag-look default — the current scheme is friendlier to first-time scholarly visitors, who
are the actual audience.

### 7. Photo mode (cheap, delightful)
`P` hides HUD, unlocks pitch limits, adds slow dolly on WASD. The composer already renders
offscreen-quality frames; a `toDataURL` download button turns visitors into promoters.

## Ordering
1 → 2 → 3 are each independently shippable; 2 unlocks the largest new audience.
