// Walker.js — shared first-person controller for the explorable worlds.
//
// Owns the player state (position on the ground plane, yaw, pitch), keyboard +
// pointer-drag input, a light collision system (circle colliders for columns/
// trees/pedestals, AABBs for walls and hedges), head-bob, and smooth teleport
// glides. Used by both the Hypnerotomachia dream garden and the Atalanta
// world; Poliphilo's Dream mode sets `locked = true` and drives `player.pos`
// directly while the narration plays.

import * as THREE from 'three';

export class Walker {
  constructor(renderer, {
    eye = 1.7,
    speed = 5.2,
    runSpeed = 10,
    bounds = { minX: -36, maxX: 36, minZ: -34, maxZ: 33 },
    onDigit = null,          // (n: 1..9) => void — world maps digits to stations
  } = {}) {
    this.renderer = renderer;
    this.eye = eye;
    this.speed = speed;
    this.runSpeed = runSpeed;
    this.bounds = bounds;
    this.onDigit = onDigit;

    this.player = { pos: new THREE.Vector3(), yaw: 0, pitch: 0 };
    this.colliders = [];     // { x, z, r }
    this.walls = [];         // { x0, x1, z0, z1 }
    this.locked = false;     // dream mode: input ignored, pos driven externally

    this._keys = new Set();
    this._bob = 0;
    this._tp = null;
    this._lookId = null;              // the pointer currently driving look
    this.moveVec = { x: 0, y: 0 };    // analog joystick: y forward (+), x strafe (+)
    this.running = false;             // held by an on-screen run toggle
  }

  // The on-screen thumb-stick feeds movement here (values in [-1, 1]).
  setMove(x, y) { this.moveVec.x = x; this.moveVec.y = y; }

  attach() {
    const el = this.renderer.domElement;
    el.style.touchAction = 'none';    // let us own drags without the page panning/zooming
    this._onKeyDown = (e) => {
      // 0 is passed through too — the HP world uses it for the crossing to
      // Cythera, which is a voyage rather than a numbered wonder.
      const d = e.code.match(/^Digit([0-9])$/);
      if (d && this.onDigit && !this.locked) { this.onDigit(+d[1]); return; }
      this._keys.add(e.code);
    };
    this._onKeyUp = (e) => this._keys.delete(e.code);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);

    // Look is driven by ONE pointer, tracked by id, so a second finger on the
    // movement stick never hijacks or jumps the camera (two-thumb play).
    this._onPD = (e) => {
      if (this.locked || this._lookId !== null) return;
      this._lookId = e.pointerId; this._px = e.clientX; this._py = e.clientY;
      el.setPointerCapture?.(e.pointerId);
    };
    this._onPM = (e) => {
      if (this.locked || e.pointerId !== this._lookId) return;
      const dx = e.clientX - this._px, dy = e.clientY - this._py;
      this._px = e.clientX; this._py = e.clientY;
      this.player.yaw  -= dx * 0.0034;
      this.player.pitch = THREE.MathUtils.clamp(this.player.pitch - dy * 0.0028, -1.15, 1.15);
    };
    this._onPU = (e) => { if (e.pointerId === this._lookId) this._lookId = null; };
    el.addEventListener('pointerdown', this._onPD);
    el.addEventListener('pointermove', this._onPM);
    window.addEventListener('pointerup', this._onPU);
    window.addEventListener('pointercancel', this._onPU);
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('pointerup', this._onPU);
    window.removeEventListener('pointercancel', this._onPU);
    const el = this.renderer.domElement;
    el.removeEventListener('pointerdown', this._onPD);
    el.removeEventListener('pointermove', this._onPM);
  }

  // Smooth glide to a viewpoint (station teleports)
  teleportTo(x, z, yaw, pitch = -0.04, dur = 0.7) {
    const p = this.player;
    let dyaw = yaw - p.yaw;
    while (dyaw >  Math.PI) dyaw -= Math.PI * 2;
    while (dyaw < -Math.PI) dyaw += Math.PI * 2;
    this._tp = { t: 0, dur, fx: p.pos.x, fz: p.pos.z, fyaw: p.yaw, fpitch: p.pitch,
                 tx: x, tz: z, tyaw: p.yaw + dyaw, tpitch: pitch };
  }

  yawToward(from, to) {
    // forward = (-sin yaw, 0, -cos yaw)
    return Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));
  }

  collide(p) {
    const R = 0.45;
    for (const c of this.colliders) {
      const dx = p.x - c.x, dz = p.z - c.z;
      const r = c.r + R, d2 = dx * dx + dz * dz;
      if (d2 < r * r && d2 > 1e-6) {
        const d = Math.sqrt(d2);
        p.x = c.x + (dx / d) * r;
        p.z = c.z + (dz / d) * r;
      }
    }
    for (const w of this.walls) {
      if (p.x > w.x0 - R && p.x < w.x1 + R && p.z > w.z0 - R && p.z < w.z1 + R) {
        const pl = p.x - (w.x0 - R), pr = (w.x1 + R) - p.x;
        const pn = p.z - (w.z0 - R), pf = (w.z1 + R) - p.z;
        const m = Math.min(pl, pr, pn, pf);
        if (m === pl) p.x = w.x0 - R;
        else if (m === pr) p.x = w.x1 + R;
        else if (m === pn) p.z = w.z0 - R;
        else p.z = w.z1 + R;
      }
    }
    p.x = THREE.MathUtils.clamp(p.x, this.bounds.minX, this.bounds.maxX);
    p.z = THREE.MathUtils.clamp(p.z, this.bounds.minZ, this.bounds.maxZ);
  }

  // Advance one frame; returns true if the player walked this frame
  update(dt) {
    const p = this.player;
    if (this._tp) {
      const tp = this._tp;
      tp.t += dt;
      const k = Math.min(1, tp.t / tp.dur);
      const e = k * k * (3 - 2 * k);
      p.pos.x = tp.fx + (tp.tx - tp.fx) * e;
      p.pos.z = tp.fz + (tp.tz - tp.fz) * e;
      p.yaw   = tp.fyaw + (tp.tyaw - tp.fyaw) * e;
      p.pitch = tp.fpitch + (tp.tpitch - tp.fpitch) * e;
      if (k >= 1) this._tp = null;
      return false;
    }
    if (this.locked) return false;

    const K = this._keys;
    if (K.has('ArrowLeft'))  p.yaw += dt * 1.9;
    if (K.has('ArrowRight')) p.yaw -= dt * 1.9;
    const f = new THREE.Vector3(-Math.sin(p.yaw), 0, -Math.cos(p.yaw));
    const r = new THREE.Vector3(Math.cos(p.yaw), 0, -Math.sin(p.yaw));
    const mv = new THREE.Vector3();
    if (K.has('KeyW') || K.has('ArrowUp'))   mv.add(f);
    if (K.has('KeyS') || K.has('ArrowDown')) mv.sub(f);
    if (K.has('KeyA')) mv.sub(r);
    if (K.has('KeyD')) mv.add(r);
    // analog thumb-stick (mobile): forward on y, strafe on x, magnitude = speed
    if (this.moveVec.x || this.moveVec.y) {
      mv.addScaledVector(f, this.moveVec.y);
      mv.addScaledVector(r, this.moveVec.x);
    }
    if (mv.lengthSq() > 0) {
      if (mv.lengthSq() > 1) mv.normalize();   // cap keyboard diagonals; keep analog magnitude
      const run = K.has('ShiftLeft') || K.has('ShiftRight') || this.running;
      mv.multiplyScalar((run ? this.runSpeed : this.speed) * dt);
      p.pos.add(mv);
      this.collide(p.pos);
      this._bob += dt * (run ? 11 : 7.5);
      return true;
    }
    return false;
  }

  applyTo(camera) {
    const p = this.player;
    camera.position.set(p.pos.x, this.eye + Math.sin(this._bob) * 0.035, p.pos.z);
    camera.rotation.set(p.pitch, p.yaw, 0);
  }
}
