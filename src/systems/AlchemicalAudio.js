// AlchemicalAudio.js — deliberately silent.
//
// DECISION (Ted, 2026-09-04): there is to be NO music or ambient audio anywhere
// on the site — not in the guided tours, not in Poliphilo's Dream, not in the
// Atalanta worlds, not on any page. The site is silent by design.
//
// This module is kept as a no-op stub rather than deleted so that the existing
// call sites (main.js: setStage on world/emblem changes) stay valid and no
// future edit accidentally reintroduces sound by restoring a missing import.
//
// It creates NO AudioContext, registers no timers, and produces no output. If
// audio is ever wanted again, the previous implementation — an ambient bed of
// detuned drones (NIGREDO), a shimmering A + fifth (ALBEDO), struck bells over
// a hum (CITRINITAS) and a warm triad over a pedal (RUBEDO) — is in git at
// commit ab5f82b, already correctly gain-staged. Restoring it is a deliberate
// act that needs Ted's say-so, not a side effect of another change.

export const AlchemicalAudio = {
  async unlock() {},
  async setStage(_stage) {},
  async mute() {},
  async unmute() {},

  // A one-off cue, as against setStage's continuous bed. SILENT, like the rest
  // of this module, and for the same reason.
  //
  // Added 2026-09-20 for `debt-roll-wedding-not-a-moment`
  // (research/tickets.json), whose acceptance asks for "a fanfare at the
  // chemical wedding, through AlchemicalAudio rather than a new AudioContext".
  // The second half of that is honoured absolutely: roll mode's wedding calls
  // `AlchemicalAudio.fanfare('wedding')` and nothing under src/ constructs an
  // AudioContext. The first half CANNOT be honoured, because it is overruled by
  // a standing decision that outranks the ticket —
  //
  //   DECISIONS.md, 2026-09-04 (evening, final), Ted: "No music, no ambient
  //   bed, no sound of any kind — not during the guided tours, not in
  //   Poliphilo's Dream, not in the Atalanta worlds, not on any page… Do not
  //   add audio to this project without Ted asking for it."
  //
  // — and the recipe for verifying a release checks exactly that by proxying
  // AudioContext (RECIPES/verify-live.md). So the call site is built and the
  // voice is not. If Ted ever wants the wedding to sound, this one function
  // body is the whole of the work, and the gain-staged ambient implementation
  // is still in git at ab5f82b. Raising it is his call to make, not a side
  // effect of closing a ticket.
  async fanfare(_cue) {},

  get isUnlocked() { return true; },   // stops callers from retrying the unlock
};
