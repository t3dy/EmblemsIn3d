// AlchemicalAudio.js — a small, quiet NES-voice chiptune bed per alchemical stage.
//
// Rewritten from scratch: the old Tone.js version wired every oscillator to the
// output three ways at once (osc.toDestination + env.toDestination + volume.
// toDestination), so it ran uncontrolled — that was the noise. This uses the raw
// Web Audio API, four classic NES-style voices (two pulses, a triangle bass, a
// noise tick), a low master gain and a gentle low-pass, and a simple 16-step loop.
// No external dependency, no runaway graph. Same public API as before.

let _ctx = null, _master = null, _lp = null, _noise = null;
let _timer = null, _step = 0, _stage = null, _muted = false, _unlocked = false;
const STEP_MS = 165;                       // ~2.6 s loop; unhurried

function ensureCtx() {
  if (_ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  _ctx = new AC();
  _master = _ctx.createGain(); _master.gain.value = 0.06;   // deliberately quiet
  _lp = _ctx.createBiquadFilter(); _lp.type = 'lowpass'; _lp.frequency.value = 2400; _lp.Q.value = 0.5;
  _lp.connect(_master); _master.connect(_ctx.destination);
  const n = Math.floor(_ctx.sampleRate * 0.6);
  _noise = _ctx.createBuffer(1, n, _ctx.sampleRate);
  const d = _noise.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
}

// One pitched voice: a square (pulse) or triangle with a clean AR envelope so it
// never clicks and never sustains uncontrolled.
function voice(type, hz, t, dur, peak) {
  const o = _ctx.createOscillator(); o.type = type; o.frequency.value = hz;
  const g = _ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0006, t + dur);
  o.connect(g); g.connect(_lp);
  o.start(t); o.stop(t + dur + 0.05);
}

// A soft filtered-noise tick (the NES noise channel), used sparingly.
function perc(t, peak) {
  const s = _ctx.createBufferSource(); s.buffer = _noise;
  const bp = _ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1700; bp.Q.value = 1.1;
  const g = _ctx.createGain();
  g.gain.setValueAtTime(peak, t);
  g.gain.exponentialRampToValueAtTime(0.0005, t + 0.08);
  s.connect(bp); bp.connect(g); g.connect(_master);
  s.start(t); s.stop(t + 0.12);
}

// Per-stage 16-step patterns. Kept sparse and low; each stage its own mood.
const PAT = {
  // black / putrefaction — low, minor, sparse
  NIGREDO(step, t) {
    if (step % 8 === 0) voice('triangle', 55, t, 1.7, 0.55);        // A1 drone-bass
    if (step === 0)  voice('square', 110.0, t, 0.8, 0.15);          // A2
    if (step === 6)  voice('square', 130.8, t, 0.7, 0.13);          // C3 (minor 3rd)
    if (step === 12) voice('square', 164.8, t, 0.6, 0.11);          // E3 (5th)
  },
  // white / washing — gentle rising C-major arpeggio
  ALBEDO(step, t) {
    const arp = [261.6, 329.6, 392.0, 523.2];
    if (step % 2 === 0) voice('square', arp[(step / 2) % 4], t, 0.32, 0.12);
    if (step % 8 === 0) voice('triangle', 130.8, t, 1.4, 0.45);     // C3 bass
  },
  // yellow / dawning — a brighter little D-major melody
  CITRINITAS(step, t) {
    const mel = [293.7, 370.0, 440.0, 587.3, 440.0, 370.0];
    if (step % 2 === 0) voice('square', mel[(step / 2) % mel.length], t, 0.28, 0.12);
    if (step % 4 === 0) voice('triangle', 146.8, t, 1.0, 0.4);      // D3 bass
    if (step % 8 === 4) perc(t, 0.045);
  },
  // red / completion — full C-major triad arpeggio with a steady bass and tick
  RUBEDO(step, t) {
    const arp = [261.6, 329.6, 392.0, 493.9, 523.2, 392.0];
    voice('square', arp[step % arp.length], t, 0.26, 0.12);
    if (step % 4 === 0) voice('triangle', 65.4, t, 0.9, 0.5);       // C2 bass
    if (step % 4 === 2) voice('square', arp[(step + 2) % arp.length] / 2, t, 0.4, 0.07);
    if (step % 8 === 0 || step % 8 === 4) perc(t, 0.05);
  },
};

function tick() {
  if (!_ctx || _muted || !_stage) return;
  const pat = PAT[_stage];
  if (pat) pat(_step, _ctx.currentTime + 0.03);
  _step = (_step + 1) % 16;
}

function ensureRunning() {
  if (_unlocked && !_muted && !_timer) _timer = setInterval(tick, STEP_MS);
}

export const AlchemicalAudio = {
  // Call on the first user gesture (browsers block audio before that).
  async unlock() {
    if (_unlocked) return;
    ensureCtx();
    if (_ctx && _ctx.state === 'suspended') { try { await _ctx.resume(); } catch (_) {} }
    _unlocked = true;
    ensureRunning();
  },

  // Switch the mood. No-op-safe before unlock; the loop picks it up once unlocked.
  async setStage(stage) {
    if (stage === _stage) return;
    _stage = stage;
    _step = 0;
    ensureRunning();
  },

  async mute() {
    _muted = true;
    if (_timer) { clearInterval(_timer); _timer = null; }
    if (_master) _master.gain.value = 0;
  },

  async unmute() {
    _muted = false;
    if (_master) _master.gain.value = 0.06;
    ensureRunning();
  },

  get isUnlocked() { return _unlocked; },
};
