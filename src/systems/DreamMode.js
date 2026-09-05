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
    this._travelT = 0;                 // watchdog: seconds spent in the current walk
    this.MAX_TRAVEL = 14;              // no walk in the garden is longer than this
    this._onKey = (e) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight') { e.preventDefault(); this.advance(); }
      else if (e.code === 'Escape') this.end(false);
    };
  }

  // The dream must never be able to strand the player. Every call into the UI
  // goes through here: if a render throws, we log it and carry on rather than
  // leaving the state machine parked in a phase with no way forward.
  _safe(name, ...args) {
    const fn = this.ui && this.ui[name];
    if (typeof fn !== 'function') return false;
    try { fn.call(this.ui, ...args); return true; }
    catch (err) { console.error('[dream] ui.' + name + ' failed', err); return false; }
  }

  // A stop is only playable if it has beats we can walk through. Anything
  // malformed is skipped rather than throwing halfway through advance().
  _beatsOf(st) {
    return (st && Array.isArray(st.beats)) ? st.beats : [];
  }

  // A reaction is only offered if it actually has options to click. Otherwise
  // the choice phase would set _awaitingChoice with nothing to satisfy it, and
  // Space/Enter/-> would all be dead.
  _reactionFor(st) {
    const r = st && this.reactions && this.reactions[st.id];
    if (!r || !Array.isArray(r.options) || r.options.length === 0) return null;
    return r;
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
    this._travelT = 0;
    this.phase = 'travel';
    this.beat = -1;
    this._safe('showTravel', { index: this.i, total: this.stops.length, title: st.title });
    if (st.guide) { try { this._spawnGuide(st.guide); } catch (e) { console.error('[dream] guide', e); } }
    // A degenerate path (zero length, or NaN from duplicated points) would leave
    // update() waiting on a comparison that can never become true.
    if (!Number.isFinite(this._len) || this._len < 0.5) this._arrive();
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
    // Watchdog: however the curve misbehaves, the walk ends and the scene plays.
    this._travelT += dt;
    if (this._travelT > this.MAX_TRAVEL || !Number.isFinite(this._len)) { this._arrive(); return; }
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
    if (this.phase !== 'travel') return;         // never arrive twice
    const st = this.stops[this.i];
    const p = this.world.walker.player;
    if (st && st.look) {
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

  // The single rule of the loop: from any phase but `idle`, calling advance()
  // must always move the dream forward. Nothing here may return without either
  // changing phase, showing a beat, or ending — otherwise the player is stranded.
  advance() {
    if (this.phase === 'idle') return;
    if (this.phase === 'portrait') { this.end(true); return; }
    if (this._awaitingChoice) return;                 // the options are on screen
    if (this.phase === 'reacted') { this._nextStop(); return; }
    if (this.phase === 'travel') {                    // skip the walk
      // Arrive HERE rather than setting _s and waiting for update() to notice.
      // update() is driven by requestAnimationFrame, which a browser pauses in a
      // background tab — so relying on it meant Continue could do nothing at all
      // until the tab was looked at again. Progression must not depend on the
      // render loop.
      if (Number.isFinite(this._len)) this._s = this._len;
      this._arrive();
      return;
    }
    const st = this.stops[this.i];
    if (!st) { this._finish(); return; }
    const beats = this._beatsOf(st);
    this.beat++;
    if (this.beat >= beats.length) {
      // the game's turn: a reaction-choice before we leave the wonder
      const r = this._reactionFor(st);
      if (r && !this._reactedHere) { this._showReaction(st, r); return; }
      this._nextStop(); return;
    }
    const b = beats[this.beat] || {};
    const shown = this._safe('showBeat', {
      index: this.i, total: this.stops.length, title: st.title,
      beat: this.beat, beats: beats.length,
      text: b.text || '', quote: b.quote || null, source: b.source || null,
      voice: b.voice || (b.quote ? '1592' : null), page: b.page || null, draft: !!b.draft,
      isFinal: false,
    });
    // If the beat could not be shown, do not sit on it — move on.
    if (!shown) this.advance();
  }

  _showReaction(st, r) {
    this._pendingReaction = r;
    this.phase = 'choice';
    this._awaitingChoice = true;
    const shown = this._safe('showChoices', {
      index: this.i, total: this.stops.length, title: st.title,
      prompt: r.prompt || '', options: r.options,
    });
    if (!shown) {                       // no options on screen — do not wait for one
      this._awaitingChoice = false;
      this._pendingReaction = null;
      this._reactedHere = true;
      this._nextStop();
    }
  }

  // Called by the UI when the player clicks an option.
  choose(idx) {
    if (!this._awaitingChoice) return;
    const r = this._pendingReaction;
    const opt = r && r.options && r.options[idx];
    if (!opt) {                          // a stale or bad click: release the lock
      this._awaitingChoice = false;      // rather than wait on a choice that cannot come
      this._pendingReaction = null;
      this._reactedHere = true;
      this._nextStop();
      return;
    }
    this._awaitingChoice = false;
    this._reactedHere = true;
    this.temperament[opt.mood] = (this.temperament[opt.mood] || 0) + 1;
    if (opt.canonical) this.temperament._canon = (this.temperament._canon || 0) + 1;
    this.temperament._total = (this.temperament._total || 0) + 1;
    this.world.setDreamMood?.(opt.mood);            // let the world answer in light, if it can
    const st = this.stops[this.i];
    const canon = opt.canonical ? null : r.options.find(o => o.canonical);
    this.phase = 'reacted';
    this._safe('showChosen', {
      index: this.i, total: this.stops.length, title: st.title,
      mood: opt.mood, text: opt.text, wasCanonical: !!opt.canonical,
      canonText: canon ? canon.text : null,
      canonMood: canon ? canon.mood : null,
    });
  }

  _finish() {
    this.phase = 'portrait';
    if (!this._safe('showPortrait', this.temperament)) this.end(true);
  }

  // Always available, from any phase including a pending choice — the player's
  // guaranteed way onward if anything about a scene misbehaves.
  skipStop() {
    if (this.phase === 'idle') return;
    if (this.phase === 'portrait') { this.end(true); return; }
    this._awaitingChoice = false;
    this._pendingReaction = null;
    this._nextStop();
  }

  end(finished = false) {
    if (this.phase === 'idle') return;
    this._removeGuide();
    window.removeEventListener('keydown', this._onKey);
    this.world.walker.locked = false;
    this.world.setDreamMood?.(null);   // let the garden return to its neutral day
    this.phase = 'idle';
    this.world.dream = null;
    this.ui.setActive(false, finished);
  }

  dispose() { this.end(false); }
}
