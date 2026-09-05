// DreamMode.js — "Poliphilo's Dream": the guided story mode.
//
// A data-driven state machine over the stops in src/data/hp_dream.js. For
// each stop the player is walked along a path through the garden (the Walker
// is locked; we drive its position along a Catmull-Rom curve while a guide
// figure — a nymph, or Polia herself — walks a few paces ahead), and on
// arrival the stop's narration beats play out click-to-continue. Space /
// Enter / → also advance; Esc leaves the dream and returns to free walking.

import * as THREE from 'three';

export class DreamMode {
  constructor(world, ui, stops, reactions = {}) {
    this.world = world;   // HPWorldScene
    this.ui = ui;         // { setActive, showTravel, showBeat, showChoices, showChosen, showPortrait }
    this.stops = stops;
    this.reactions = reactions;      // { stopId: { prompt, options:[{mood,text,canonical?}] } }
    this.temperament = {};           // mood -> count, and _canon count of faithful picks
    this.i = -1;
    this.beat = -1;
    this.phase = 'idle';  // idle | travel | beats | choice | reacted | portrait
    this._awaitingChoice = false;
    this._reactedHere = false;
    this._pendingReaction = null;
    this._curve = null;
    this._s = 0;
    this._len = 0;
    this._guide = null;
    this._speed = 3.4;
    this._onKey = (e) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight') { e.preventDefault(); this.advance(); }
      else if (e.code === 'Escape') this.end(false);
    };
  }

  start() {
    this.world.walker.locked = true;
    window.addEventListener('keydown', this._onKey);
    this.ui.setActive(true);
    this._nextStop();
  }

  _nextStop() {
    this._removeGuide();
    this._reactedHere = false;
    this.i++;
    if (this.i >= this.stops.length) { this._finish(); return; }
    const st = this.stops[this.i];
    const p = this.world.walker.player;
    const pts = [[p.pos.x, p.pos.z], ...st.path]
      .map(([x, z]) => new THREE.Vector3(x, 0, z));
    this._curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.1);
    this._len = this._curve.getLength();
    this._s = 0;
    this.phase = 'travel';
    this.beat = -1;
    this.ui.showTravel({ index: this.i, total: this.stops.length, title: st.title });
    if (st.guide) this._spawnGuide(st.guide);
    if (this._len < 0.5) this._arrive();   // stop begins where we stand
  }

  _spawnGuide(g) {
    const grp = this.world.cast.nymph({ robe: g.robe, h: 0.95, pose: 'beckon' });
    const lbl = this.world.cast.label(g.name, { sub: g.sub || '' });
    lbl.position.y = 2.0;
    grp.add(lbl);
    this.world.scene.add(grp);
    this._guide = grp;
  }

  _removeGuide() {
    if (this._guide) { this.world.scene.remove(this._guide); this._guide = null; }
  }

  update(dt) {
    if (this.phase !== 'travel') return;
    this._s = Math.min(this._len, this._s + this._speed * dt);
    const u = this._len ? this._s / this._len : 1;
    const pos = this._curve.getPointAt(u);
    const tan = this._curve.getTangentAt(Math.min(0.999, u));
    const p = this.world.walker.player;
    p.pos.set(pos.x, 0, pos.z);
    const targetYaw = Math.atan2(-tan.x, -tan.z);
    let d = targetYaw - p.yaw;
    while (d >  Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    p.yaw += d * Math.min(1, dt * 3);
    p.pitch += (-0.03 - p.pitch) * Math.min(1, dt * 2);

    if (this._guide) {
      const gu = Math.min(1, (this._s + 2.6) / this._len);
      const gp = this._curve.getPointAt(gu);
      this._guide.position.set(gp.x, Math.abs(Math.sin(this._s * 3.2)) * 0.04, gp.z);
      const gt = this._curve.getTangentAt(Math.min(0.999, gu));
      this._guide.rotation.y = Math.atan2(-gt.x, -gt.z);
    }
    if (this._s >= this._len) this._arrive();
  }

  _arrive() {
    const st = this.stops[this.i];
    const p = this.world.walker.player;
    if (st.look) {
      const yaw = this.world.walker.yawToward([p.pos.x, p.pos.z], st.look);
      this.world.walker.teleportTo(p.pos.x, p.pos.z, yaw, st.pitch ?? -0.03, 0.8);
    }
    if (this._guide) {
      // the guide steps aside and turns to face the dreamer
      const right = new THREE.Vector3(Math.cos(p.yaw), 0, -Math.sin(p.yaw));
      this._guide.position.addScaledVector(right, 1.7);
      this._guide.position.y = 0;
      this._guide.rotation.y = p.yaw + Math.PI * 0.85;
    }
    this.phase = 'beats';
    this.advance();
  }

  advance() {
    if (this.phase === 'idle') return;
    if (this._awaitingChoice) return;                 // must click a reaction option
    if (this.phase === 'portrait') { this.end(true); return; }
    if (this.phase === 'reacted') { this._nextStop(); return; }
    if (this.phase === 'travel') { this._s = this._len; return; }  // skip the walk
    const st = this.stops[this.i];
    this.beat++;
    if (this.beat >= st.beats.length) {
      // the game's turn: a reaction-choice before we leave the wonder
      const r = this.reactions && this.reactions[st.id];
      if (r && !this._reactedHere) { this._showReaction(st, r); return; }
      this._nextStop(); return;
    }
    const b = st.beats[this.beat];
    this.ui.showBeat({
      index: this.i, total: this.stops.length, title: st.title,
      beat: this.beat, beats: st.beats.length,
      text: b.text, quote: b.quote || null, source: b.source || null,
      voice: b.voice || (b.quote ? '1592' : null), page: b.page || null, draft: !!b.draft,
      isFinal: false,
    });
  }

  _showReaction(st, r) {
    this._awaitingChoice = true;
    this._pendingReaction = r;
    this.phase = 'choice';
    this.ui.showChoices({
      index: this.i, total: this.stops.length, title: st.title,
      prompt: r.prompt, options: r.options,
    });
  }

  // Called by the UI when the player clicks an option.
  choose(idx) {
    if (!this._awaitingChoice) return;
    const r = this._pendingReaction;
    const opt = r.options[idx];
    if (!opt) return;
    this._awaitingChoice = false;
    this._reactedHere = true;
    this.temperament[opt.mood] = (this.temperament[opt.mood] || 0) + 1;
    if (opt.canonical) this.temperament._canon = (this.temperament._canon || 0) + 1;
    this.temperament._total = (this.temperament._total || 0) + 1;
    this.world.setDreamMood?.(opt.mood);            // let the world answer in light, if it can
    const st = this.stops[this.i];
    const canon = opt.canonical ? null : r.options.find(o => o.canonical);
    this.phase = 'reacted';
    this.ui.showChosen({
      index: this.i, total: this.stops.length, title: st.title,
      mood: opt.mood, text: opt.text,
      canonText: canon ? canon.text : null,
      canonMood: canon ? canon.mood : null,
    });
  }

  _finish() {
    this.phase = 'portrait';
    if (this.ui.showPortrait) this.ui.showPortrait(this.temperament);
    else this.end(true);
  }

  skipStop() {
    if (this.phase === 'idle' || this.phase === 'portrait') return;
    this._awaitingChoice = false;
    this._pendingReaction = null;
    this._nextStop();
  }

  end(finished = false) {
    if (this.phase === 'idle') return;
    this._removeGuide();
    window.removeEventListener('keydown', this._onKey);
    this.world.walker.locked = false;
    this.phase = 'idle';
    this.world.dream = null;
    this.ui.setActive(false, finished);
  }

  dispose() { this.end(false); }
}
