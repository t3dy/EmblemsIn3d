// AlchemicalAudio.js — the ambient bed for each stage of the Work.
//
// This restores the project's ORIGINAL musical design — slow detuned drones, a
// shimmering fifth, struck bells, a warm triad — rather than the chiptune that
// briefly replaced it. What was actually wrong with the first version was the
// mix, not the music: in NIGREDO (the default stage) each sawtooth drone was
// wired to the output THREE times — `.toDestination()`, again through an
// envelope that was itself `.toDestination()`, and again through the -28 dB
// master — so two of the three paths bypassed the volume control entirely and
// three raw 42 Hz sawtooths hit the speakers at full scale. That was the noise.
//
// Rewritten on the raw Web Audio API (no Tone.js / esm.sh dependency):
//   * every source runs through exactly one path — voice -> stage gain -> bus,
//   * a dry/wet bus with a generated impulse-response reverb for air,
//   * a gentle master low-pass, so the low drones read as warmth not rasp,
//   * stages cross-fade instead of cutting, and old nodes are always stopped.
// Same public API as before: unlock / setStage / mute / unmute / isUnlocked.

let _ctx = null, _master = null, _lp = null, _dry = null, _wet = null, _verb = null;
let _stage = null, _stageGain = null, _stageNodes = [], _timers = [];
let _muted = false, _unlocked = false;

const MASTER = 0.5;      // final trim; individual voices are already conservative
const FADE   = 2.0;      // seconds to cross-fade between stages

function ensureCtx() {
  if (_ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  _ctx = new AC();

  _master = _ctx.createGain();
  _master.gain.value = _muted ? 0 : MASTER;

  // One gentle low-pass across everything: keeps the sawtooth drones warm
  // rather than buzzy, which is most of why the originals felt harsh.
  _lp = _ctx.createBiquadFilter();
  _lp.type = 'lowpass'; _lp.frequency.value = 5200; _lp.Q.value = 0.4;

  _lp.connect(_master);
  _master.connect(_ctx.destination);

  // Dry / wet reverb bus. Voices connect to the stage gain, which feeds both.
  _dry = _ctx.createGain(); _dry.gain.value = 0.75;
  _wet = _ctx.createGain(); _wet.gain.value = 0.45;
  _verb = _ctx.createConvolver();
  _verb.buffer = impulse(4.5, 2.4);
  _dry.connect(_lp);
  _wet.connect(_verb); _verb.connect(_lp);
}

// A decaying-noise impulse response — cheap, and enough to give the drones air.
function impulse(seconds, decay) {
  const n = Math.floor(_ctx.sampleRate * seconds);
  const buf = _ctx.createBuffer(2, n, _ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < n; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay);
    }
  }
  return buf;
}

function noiseBuffer(seconds) {
  const n = Math.floor(_ctx.sampleRate * seconds);
  const buf = _ctx.createBuffer(1, n, _ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < n; i++) {           // brown-ish noise: soft, not hissy
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    d[i] = last * 3.5;
  }
  return buf;
}

// A continuously sounding voice held for the life of the stage.
function drone({ type = 'sine', hz, gain, detune = 0, filter = null }) {
  const o = _ctx.createOscillator();
  o.type = type; o.frequency.value = hz; o.detune.value = detune;
  const g = _ctx.createGain(); g.gain.value = gain;
  let tail = o;
  if (filter) {
    const f = _ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = filter; f.Q.value = 0.7;
    o.connect(f); tail = f;
  }
  tail.connect(g); g.connect(_stageGain);
  o.start();
  _stageNodes.push(o);
  return { osc: o, gain: g };
}

// A struck, decaying tone built from inharmonic partials — the bell.
function strike(hz, when, peak, dur, partials = [1, 2.76, 5.4]) {
  partials.forEach((p, i) => {
    const o = _ctx.createOscillator();
    o.type = 'sine'; o.frequency.value = hz * p;
    const g = _ctx.createGain();
    const a = peak / (i + 1.6);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(a, when + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g); g.connect(_stageGain);
    o.start(when); o.stop(when + dur + 0.1);
  });
}

// A slowly swelling chord tone.
function swell(hz, when, peak, attack, hold, release, type = 'triangle') {
  const o = _ctx.createOscillator();
  o.type = type; o.frequency.value = hz;
  const g = _ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(peak, when + attack);
  g.gain.setValueAtTime(peak, when + attack + hold);
  g.gain.exponentialRampToValueAtTime(0.0001, when + attack + hold + release);
  o.connect(g); g.connect(_stageGain);
  o.start(when); o.stop(when + attack + hold + release + 0.1);
}

function every(ms, fn) { const id = setInterval(fn, ms); _timers.push(id); return id; }

const STAGES = {
  // Nigredo — the blackening: a low detuned sub-drone and a distant fire.
  NIGREDO() {
    // The three originals (42 / 43.2 / 40.8 Hz); beating against each other,
    // now filtered and mixed properly instead of hitting the output raw.
    drone({ type: 'sawtooth', hz: 42.0, gain: 0.16, filter: 170 });
    drone({ type: 'sawtooth', hz: 43.2, gain: 0.13, filter: 170 });
    drone({ type: 'sawtooth', hz: 40.8, gain: 0.13, filter: 170 });
    drone({ type: 'sine',     hz: 84.0, gain: 0.05 });   // a little body an octave up

    const nb = noiseBuffer(2.0);
    every(500, () => {                                    // the crackle of the fire
      if (!_ctx || Math.random() > 0.45) return;
      const t = _ctx.currentTime + 0.02;
      const s = _ctx.createBufferSource(); s.buffer = nb;
      s.playbackRate.value = 0.7 + Math.random() * 0.6;
      const bp = _ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 700 + Math.random() * 900; bp.Q.value = 1.4;
      const g = _ctx.createGain();
      g.gain.setValueAtTime(0.05, t);
      g.gain.exponentialRampToValueAtTime(0.0004, t + 0.09);
      s.connect(bp); bp.connect(g); g.connect(_stageGain);
      s.start(t); s.stop(t + 0.14);
    });
  },

  // Albedo — the whitening: sustained A and its fifth, shimmering.
  ALBEDO() {
    // The slow tremolo the original asked for. It modulates each voice's own
    // gain — one LFO, no extra signal path (the old one was connected to
    // nothing and never sounded). Depth stays well under the base gain so the
    // sum can never swing negative and invert.
    const lfo = _ctx.createOscillator(); lfo.frequency.value = 0.18;
    lfo.start(); _stageNodes.push(lfo);

    [[220, 0.085], [330, 0.055], [440, 0.036], [660, 0.022]].forEach(([hz, g]) => {
      const v = drone({ type: 'sine', hz, gain: g });
      const depth = _ctx.createGain(); depth.gain.value = g * 0.35;
      lfo.connect(depth); depth.connect(v.gain.gain);
    });
  },

  // Citrinitas — the yellowing: struck bells over a hum.
  CITRINITAS() {
    drone({ type: 'sine', hz: 100, gain: 0.045 });
    drone({ type: 'sine', hz: 150, gain: 0.02 });
    const pitches = [200, 267, 320, 400, 534];
    let i = 0;
    strike(pitches[i++], _ctx.currentTime + 0.4, 0.10, 3.0);
    every(3000, () => {
      if (!_ctx) return;
      strike(pitches[i++ % pitches.length], _ctx.currentTime + 0.03, 0.10, 3.0);
    });
  },

  // Rubedo — the reddening: a warm triad, breathing, over a low pedal.
  RUBEDO() {
    drone({ type: 'sine', hz: 65.4, gain: 0.07 });        // C2 pedal
    const chords = [
      [130.8, 164.8, 196.0, 246.9],   // C3 E3 G3 B3
      [174.6, 220.0, 261.6],          // F3 A3 C4
      [196.0, 246.9, 293.7],          // G3 B3 D4
    ];
    let c = 0;
    const play = () => {
      if (!_ctx) return;
      const t = _ctx.currentTime + 0.05;
      chords[c % chords.length].forEach((hz, k) =>
        swell(hz, t + k * 0.06, 0.05, 1.5, 2.2, 2.6));
      c++;
    };
    play();
    every(6000, play);
  },
};

// Tear the current stage down: fade it out, then stop and drop every node.
function teardown() {
  for (const id of _timers) clearInterval(id);
  _timers = [];
  const g = _stageGain, nodes = _stageNodes;
  _stageGain = null; _stageNodes = [];
  if (!g) return;
  const t = _ctx.currentTime;
  g.gain.cancelScheduledValues(t);
  g.gain.setValueAtTime(g.gain.value, t);
  g.gain.linearRampToValueAtTime(0.0001, t + FADE);
  setTimeout(() => {
    for (const n of nodes) { try { n.stop(); } catch (_) {} }
    try { g.disconnect(); } catch (_) {}
  }, (FADE + 0.3) * 1000);
}

function build(stage) {
  const fn = STAGES[stage];
  if (!fn) return;
  _stageGain = _ctx.createGain();
  _stageGain.gain.setValueAtTime(0.0001, _ctx.currentTime);
  _stageGain.gain.linearRampToValueAtTime(1, _ctx.currentTime + FADE);
  _stageGain.connect(_dry);
  _stageGain.connect(_wet);
  fn();
}

export const AlchemicalAudio = {
  // Call on the first user gesture (browsers block audio before that).
  async unlock() {
    if (_unlocked) return;
    ensureCtx();
    if (!_ctx) return;
    if (_ctx.state === 'suspended') { try { await _ctx.resume(); } catch (_) {} }
    _unlocked = true;
    if (_stage && !_stageGain) build(_stage);
  },

  // Switch the mood. Safe before unlock — the stage is remembered and built
  // as soon as a gesture unlocks the context.
  async setStage(stage) {
    if (stage === _stage) return;
    _stage = stage;
    if (!_unlocked || !_ctx) return;
    teardown();
    build(_stage);
  },

  async mute() {
    _muted = true;
    if (_master) _master.gain.setTargetAtTime(0, _ctx.currentTime, 0.15);
  },

  async unmute() {
    _muted = false;
    if (_master) _master.gain.setTargetAtTime(MASTER, _ctx.currentTime, 0.15);
  },

  get isUnlocked() { return _unlocked; },
};
