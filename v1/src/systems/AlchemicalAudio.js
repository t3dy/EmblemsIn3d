// AlchemicalAudio.js
// Generative ambient soundscapes per alchemical stage using Tone.js.
// Browser autoplay policy requires user gesture before AudioContext starts —
// call AlchemicalAudio.unlock() on first user click.

let _tone = null;
let _active = null;
let _unlocked = false;

async function getTone() {
  if (!_tone) {
    const mod = await import('https://esm.sh/tone@14.7.77');
    _tone = mod;
  }
  return _tone;
}

// ─── Stage definitions ────────────────────────────────────────────────────────

const STAGES = {

  // Nigredo: low subharmonic drone + distant crackling fire
  NIGREDO: async (T) => {
    const nodes = [];

    // Sub drone
    const drone = new T.OmniOscillator({ type: 'sawtooth', frequency: 42 }).toDestination();
    const droneEnv = new T.AmplitudeEnvelope({ attack: 3, decay: 0, sustain: 1, release: 4 }).toDestination();
    drone.connect(droneEnv);

    // Slight chorus detuning (three stacked oscillators)
    const drone2 = new T.OmniOscillator({ type: 'sawtooth', frequency: 43.2 }).toDestination();
    const drone3 = new T.OmniOscillator({ type: 'sawtooth', frequency: 40.8 }).toDestination();

    const masterVol = new T.Volume(-28).toDestination();
    drone.connect(masterVol);
    drone2.connect(masterVol);
    drone3.connect(masterVol);

    drone.start(); drone2.start(); drone3.start();

    // Crackle (noise bursts)
    const crackle = new T.NoiseSynth({
      noise: { type: 'brown' },
      envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 },
    }).toDestination();
    crackle.volume.value = -38;

    const crackleLoop = new T.Loop((time) => {
      if (Math.random() < 0.4) crackle.triggerAttackRelease('32n', time);
    }, '8n');
    crackleLoop.start(0);

    nodes.push(drone, drone2, drone3, masterVol, crackle, crackleLoop);
    return nodes;
  },

  // Albedo: pure sustained tones — A + E fifth (pentatonic shimmer)
  ALBEDO: async (T) => {
    const nodes = [];
    const vol = new T.Volume(-22).toDestination();
    const rev = new T.Reverb({ decay: 6, wet: 0.7 }).connect(vol);

    const freqs = [220, 330, 440, 660];
    freqs.forEach((f, i) => {
      const osc = new T.OmniOscillator({ type: 'sine', frequency: f }).connect(rev);
      osc.volume.value = -18 - i * 4;
      osc.start();
      nodes.push(osc);
    });

    // Slow tremolo
    const trem = new T.Tremolo({ frequency: 0.18, depth: 0.35, wet: 0.6 }).connect(rev).start();
    nodes.push(vol, rev, trem);
    return nodes;
  },

  // Citrinitas: bell strikes — golden, periodic
  CITRINITAS: async (T) => {
    const nodes = [];
    const rev = new T.Reverb({ decay: 4, wet: 0.5 }).toDestination();
    const vol = new T.Volume(-20).connect(rev);

    const bell = new T.MetalSynth({
      frequency: 200,
      envelope: { attack: 0.001, decay: 2.5, release: 0.5 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).connect(vol);
    bell.volume.value = -10;

    const bellPitches = [200, 267, 320, 400, 534];
    let bellIdx = 0;
    const bellLoop = new T.Loop((time) => {
      bell.frequency.value = bellPitches[bellIdx % bellPitches.length];
      bell.triggerAttackRelease('2n', time);
      bellIdx++;
    }, '3');
    bellLoop.start(0);

    // Underlying hum
    const hum = new T.OmniOscillator({ type: 'sine', frequency: 100 }).connect(vol);
    hum.volume.value = -30;
    hum.start();

    nodes.push(rev, vol, bell, bellLoop, hum);
    return nodes;
  },

  // Rubedo: triumphant harmonic cluster — warm, golden, rising
  RUBEDO: async (T) => {
    const nodes = [];
    const vol = new T.Volume(-18).toDestination();
    const chorus = new T.Chorus({ frequency: 0.8, delayTime: 2.5, depth: 0.6, wet: 0.5 }).connect(vol).start();
    const rev = new T.Reverb({ decay: 5, wet: 0.4 }).connect(chorus);

    const synth = new T.PolySynth(T.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 1.5, decay: 0.5, sustain: 0.8, release: 3.0 },
    }).connect(rev);
    synth.volume.value = -14;

    // Strum a major triad
    const chords = [
      ['C3', 'E3', 'G3', 'B3'],
      ['F3', 'A3', 'C4'],
      ['G3', 'B3', 'D4'],
    ];
    let chordIdx = 0;
    const chordLoop = new T.Loop((time) => {
      synth.triggerRelease(chords[chordIdx % chords.length]);
      chordIdx = (chordIdx + 1) % chords.length;
      synth.triggerAttack(chords[chordIdx], time + 0.05);
    }, '6');
    chordLoop.start(0);

    // Low pedal tone
    const pedal = new T.OmniOscillator({ type: 'sine', frequency: 65.4 }).connect(rev);
    pedal.volume.value = -26;
    pedal.start();

    nodes.push(vol, chorus, rev, synth, chordLoop, pedal);
    return nodes;
  },
};

// ─── Public API ───────────────────────────────────────────────────────────────

export const AlchemicalAudio = {
  _nodes: [],
  _stage: null,
  _muted: false,

  async unlock() {
    if (_unlocked) return;
    const T = await getTone();
    await T.start();
    _unlocked = true;
    console.log('[audio] AudioContext unlocked');
  },

  async setStage(stage) {
    if (this._stage === stage) return;
    if (this._muted) { this._stage = stage; return; }

    const T = await getTone();
    if (!_unlocked) return; // Don't auto-start without gesture

    await this._stopCurrent(T);
    this._stage = stage;

    const builder = STAGES[stage];
    if (!builder) return;

    try {
      T.Transport.start();
      this._nodes = await builder(T);
    } catch (e) {
      console.warn('[audio] Stage build error:', e.message);
    }
  },

  async _stopCurrent(T) {
    if (!T) T = await getTone();
    this._nodes.forEach(n => {
      try {
        if (n.stop) n.stop();
        if (n.dispose) n.dispose();
      } catch (_) {}
    });
    this._nodes = [];
    T.Transport.stop();
    T.Transport.cancel();
  },

  async mute() {
    this._muted = true;
    await this._stopCurrent();
  },

  async unmute() {
    this._muted = false;
    if (this._stage) await this.setStage(this._stage);
  },

  get isUnlocked() { return _unlocked; },
};
