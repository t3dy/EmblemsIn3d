// DragonFlight.js — the fourth way through the dream: fly it as the dragon.
//
// A third-person flight controller. The dragon is a rigid mount with a heading
// (yaw), a climb angle (pitch), a speed, and a visual bank; the camera orbits
// it from behind and a little above, and the reader owns that camera — drag
// to swing it round the dragon, wheel (or +/−) to bring it closer or further.
//
// Keys:  W / S speed · A / D or ← → turn · R / F or ↑ ↓ climb, dive
//        Shift boost · C reset the camera · Esc land · 1–9 fly to a wonder
// Touch: the movement stick throttles and turns; a drag on the canvas orbits.

import * as THREE from 'three';

export class DragonFlight {
  constructor(renderer, dragon, {
    bounds = { minX: -60, maxX: 60, minZ: -208, maxZ: 54, minY: 0.9, maxY: 48 },
    onDigit = null,
    onLand = null,
  } = {}) {
    this.renderer = renderer;
    this.dragon = dragon;
    this.bounds = bounds;
    this.onDigit = onDigit;
    this.onLand = onLand;

    this.pos = new THREE.Vector3(0, 6, 0);
    this.yaw = 0;             // heading; forward = (-sin yaw, 0, -cos yaw), like the walker
    this.pitch = 0;           // climb angle, + is nose up
    this.bank = 0;            // visual roll
    this.speed = 7;
    this.minSpeed = 2.5; this.maxSpeed = 22;
    this.running = false;     // boost, from the on-screen run toggle too
    this.moveVec = { x: 0, y: 0 };

    // the reader's camera: an orbit round the dragon, measured from "behind"
    this.cam = { yaw: 0, pitch: 0.32, dist: 7.5 };
    this._camPos = null;
    this._flap = 0;
    this._keys = new Set();
    this._lookId = null;
    this._tp = null;
  }

  setMove(x, y) { this.moveVec.x = x; this.moveVec.y = y; }

  placeAt(x, y, z, yaw = 0) {
    this.pos.set(x, y, z); this.yaw = yaw; this.pitch = 0; this.bank = 0;
    this._camPos = null;
    this._sync();
  }

  // glide to a point (the wonders by digit)
  flyTo(x, y, z, yaw, dur = 1.6) {
    let dyaw = yaw - this.yaw;
    while (dyaw > Math.PI) dyaw -= Math.PI * 2;
    while (dyaw < -Math.PI) dyaw += Math.PI * 2;
    this._tp = { t: 0, dur, from: this.pos.clone(), to: new THREE.Vector3(x, y, z), fyaw: this.yaw, tyaw: this.yaw + dyaw };
  }

  attach() {
    const el = this.renderer.domElement;
    el.style.touchAction = 'none';
    this._onKeyDown = (e) => {
      const d = e.code.match(/^Digit([0-9])$/);
      if (d && this.onDigit) { this.onDigit(+d[1]); return; }
      if (e.code === 'Escape') { this.onLand?.(); return; }
      if (e.code === 'KeyC') { this.cam.yaw = 0; this.cam.pitch = 0.32; this.cam.dist = 7.5; return; }
      if (e.key === '+' || e.key === '=') this.cam.dist = Math.max(3, this.cam.dist * 0.85);
      if (e.key === '-' || e.key === '_') this.cam.dist = Math.min(26, this.cam.dist * 1.18);
      this._keys.add(e.code);
    };
    this._onKeyUp = (e) => this._keys.delete(e.code);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);

    this._onPD = (e) => {
      if (this._lookId !== null) return;
      this._lookId = e.pointerId; this._px = e.clientX; this._py = e.clientY;
      el.setPointerCapture?.(e.pointerId);
    };
    this._onPM = (e) => {
      if (e.pointerId !== this._lookId) return;
      const dx = e.clientX - this._px, dy = e.clientY - this._py;
      this._px = e.clientX; this._py = e.clientY;
      this.cam.yaw -= dx * 0.005;
      this.cam.pitch = THREE.MathUtils.clamp(this.cam.pitch + dy * 0.004, -0.25, 1.25);
    };
    this._onPU = (e) => { if (e.pointerId === this._lookId) this._lookId = null; };
    this._onWheel = (e) => {
      this.cam.dist = THREE.MathUtils.clamp(this.cam.dist * (1 + Math.sign(e.deltaY) * 0.12), 3, 26);
      e.preventDefault();
    };
    el.addEventListener('pointerdown', this._onPD);
    el.addEventListener('pointermove', this._onPM);
    window.addEventListener('pointerup', this._onPU);
    window.addEventListener('pointercancel', this._onPU);
    el.addEventListener('wheel', this._onWheel, { passive: false });
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('pointerup', this._onPU);
    window.removeEventListener('pointercancel', this._onPU);
    const el = this.renderer.domElement;
    el.removeEventListener('pointerdown', this._onPD);
    el.removeEventListener('pointermove', this._onPM);
    el.removeEventListener('wheel', this._onWheel);
  }

  forward() {
    return new THREE.Vector3(-Math.sin(this.yaw) * Math.cos(this.pitch), Math.sin(this.pitch), -Math.cos(this.yaw) * Math.cos(this.pitch));
  }

  update(dt) {
    dt = Math.min(dt, 0.05);
    const K = this._keys;
    if (this._tp) {
      const tp = this._tp; tp.t += dt;
      const k = Math.min(1, tp.t / tp.dur), e = k * k * (3 - 2 * k);
      this.pos.lerpVectors(tp.from, tp.to, e);
      this.pos.y += Math.sin(k * Math.PI) * 4;          // a swoop up and down into it
      this.yaw = tp.fyaw + (tp.tyaw - tp.fyaw) * e;
      this.pitch *= 0.9;
      if (k >= 1) this._tp = null;
      this._animate(dt, 0.6, 0);
      this._sync();
      return;
    }
    // inputs
    let turn = 0, climb = 0, throttle = 0;
    if (K.has('KeyA') || K.has('ArrowLeft'))  turn += 1;
    if (K.has('KeyD') || K.has('ArrowRight')) turn -= 1;
    if (K.has('KeyR') || K.has('ArrowUp'))    climb += 1;
    if (K.has('KeyF') || K.has('ArrowDown'))  climb -= 1;
    if (K.has('KeyW')) throttle += 1;
    if (K.has('KeyS')) throttle -= 1;
    if (this.moveVec.x || this.moveVec.y) { turn -= this.moveVec.x; throttle += this.moveVec.y; }
    const boost = K.has('ShiftLeft') || K.has('ShiftRight') || this.running;

    // speed: the keys push it, and it settles where you leave it
    this.speed = THREE.MathUtils.clamp(this.speed + throttle * 9 * dt, this.minSpeed, this.maxSpeed);
    const v = this.speed * (boost ? 1.7 : 1);
    // heading and climb
    const yawRate = 1.35 * (0.7 + 0.3 * (1 - this.speed / this.maxSpeed));
    this.yaw += turn * yawRate * dt;
    if (climb) this.pitch = THREE.MathUtils.clamp(this.pitch + climb * 1.1 * dt, -0.85, 0.85);
    else this.pitch *= Math.max(0, 1 - dt * 1.6);
    // a dive gains speed, a climb loses it
    this.speed = THREE.MathUtils.clamp(this.speed - Math.sin(this.pitch) * 2.4 * dt, this.minSpeed, this.maxSpeed);
    // move
    this.pos.addScaledVector(this.forward(), v * dt);
    const B = this.bounds;
    this.pos.x = THREE.MathUtils.clamp(this.pos.x, B.minX, B.maxX);
    this.pos.z = THREE.MathUtils.clamp(this.pos.z, B.minZ, B.maxZ);
    if (this.pos.y < B.minY) { this.pos.y = B.minY; if (this.pitch < 0) this.pitch = 0; }
    if (this.pos.y > B.maxY) { this.pos.y = B.maxY; if (this.pitch > 0) this.pitch = 0; }
    // bank into the turn
    const bankT = -turn * 0.55;
    this.bank += (bankT - this.bank) * Math.min(1, dt * 4);

    this._animate(dt, v / this.maxSpeed, climb);
    this._sync();
  }

  _animate(dt, effort, climb) {
    const D = this.dragon, u = D.userData;
    // wings beat faster when climbing or slow, and stretch into a glide at speed
    this._flap += dt * (2.4 + (1 - effort) * 3.2 + Math.max(0, climb) * 3 + Math.max(0, this.pitch) * 3);
    const beat = Math.sin(this._flap);
    const amp = 0.55 - effort * 0.25 + Math.max(0, this.pitch) * 0.2;
    const a = beat * amp - 0.08;
    if (u.wingL) u.wingL.rotation.z =  a;
    if (u.wingR) u.wingR.rotation.z = -a;
    if (u.tail) { u.tail.rotation.y = Math.sin(this._flap * 0.5) * 0.18 + this.bank * 0.4; u.tail.rotation.x = -this.pitch * 0.3; }
    // the head pivots: it leans into the bank, follows the climb, and looks
    // slowly about it the rest of the time
    if (u.head) {
      u.head.rotation.y = this.bank * 0.4 + Math.sin(this._flap * 0.21) * 0.34;
      u.head.rotation.x = this.pitch * 0.25 + Math.sin(this._flap * 0.13 + 1.1) * 0.09;
    }
    if (u.jaw)  u.jaw.rotation.x = -Math.PI / 2 + 0.3 + Math.max(0, Math.sin(this._flap * 0.31)) * 0.25;
    this._bob = Math.sin(this._flap) * 0.06;
  }

  _sync() {
    const D = this.dragon;
    D.position.set(this.pos.x, this.pos.y + (this._bob || 0), this.pos.z);
    D.rotation.set(this.pitch, this.yaw, this.bank, 'YXZ');
  }

  applyTo(camera, dt = 0.016) {
    const a = this.yaw + this.cam.yaw, p = this.cam.pitch, d = this.cam.dist;
    // "behind" the dragon is +forward-reversed: (sin yaw, 0, cos yaw)
    const desired = new THREE.Vector3(
      this.pos.x + Math.sin(a) * Math.cos(p) * d,
      this.pos.y + Math.sin(p) * d + 0.6,
      this.pos.z + Math.cos(a) * Math.cos(p) * d);
    desired.y = Math.max(0.7, desired.y);
    if (!this._camPos) this._camPos = desired.clone();
    else this._camPos.lerp(desired, 1 - Math.exp(-dt * 7));
    camera.position.copy(this._camPos);
    const f = this.forward();
    const look = new THREE.Vector3(this.pos.x + f.x * 2.5, this.pos.y + 0.4 + f.y * 2.5, this.pos.z + f.z * 2.5);
    camera.lookAt(look);
  }
}
