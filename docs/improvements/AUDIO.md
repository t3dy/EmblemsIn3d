# Audio

**Current state.** [AlchemicalAudio.js](../../src/systems/AlchemicalAudio.js) generates
ambient beds per alchemical stage (NIGREDO drone+crackle, ALBEDO shimmer, CITRINITAS bells,
RUBEDO chords) with Tone.js, unlocked on first gesture. The HP world plays the ALBEDO bed
globally. There is no positional sound, no event sound, no narration audio.

## Ranked suggestions

### 1. Positional sources at the wonders
Tone.js has `Panner3D`; feed it the camera↔station vector each frame (or cheaper: distance-
based gain only, updated in the existing 0.25 s station-proximity timer in
[HPWorldScene.js](../../src/scenes/HPWorldScene.js)):
- **Water** (filtered noise, gentle LFO) at the Fountain, bath, and shore — three instances,
  one synth def;
- **Fire crackle** (the NIGREDO crackle loop, repurposed, quiet) at Polia's torch;
- **Surf + gull cries** at the Cythera shore.
Distance-gain-only is ~40 lines total and transforms presence. Full HRTF panning optional later.

### 2. 🍎 Footsteps
The Walker already integrates bob phase (`_bob`); fire a soft filtered-noise "scuff" each time
`sin(_bob)` crosses zero downward, pitch/timbre switched by ground (gravel path vs. grass —
the walker knows its x/z; the path is |x| < 1.7 on the main axis). Twenty lines in Walker or
a tiny `Footsteps` helper; the single highest-value body-presence cue in first-person.

### 3. Dream-mode narration chimes
Story beats advance silently. A two-note bell motif (CITRINITAS bells exist) on beat-advance,
and a lower one on scene-change, would pace the reading rhythm like a page-turn.

### 4. Stage-crossfade polish
`setStage` currently hard-switches beds. A 2 s gain crossfade between old and new node sets
(both graphs alive briefly) removes the seam — noticeable when toggling worlds.

### 5. The fugue connection (bigger idea)
The AF emblems are *fugues* — Maier wrote actual canons. The Theatrum's stations could hum
their own fugue voices (data exists in the project's research DB). For HP, Queen Eleuterylida's
court is described as full of music: a quiet lute-ish arpeggio bed (Tone.PluckSynth) inside
the court's station radius would honour the text directly.

## Constraints
- Everything must stay generative/synthesized (no audio-file assets — keeps deploy < 35 MB
  and the aesthetic coherent).
- Respect the existing unlock-on-gesture pattern; never autoplay.
