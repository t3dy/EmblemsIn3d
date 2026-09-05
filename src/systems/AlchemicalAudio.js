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
  get isUnlocked() { return true; },   // stops callers from retrying the unlock
};
