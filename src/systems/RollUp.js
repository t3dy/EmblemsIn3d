// RollUp.js — the fifth way into the dream: you are a ball, and the garden is
// food.
//
// Ted, 2026-09-08: "add a game mode 'roll up' where you control a katamari
// damacy style ball with an alchemical sun and moon design and can roll up all
// the elements of the dream garden, getting gradually bigger as you roll up
// small items like blades of grass and people, and eventually the tiles and
// bricks and trees and bigger things."
//
// ── Why a sun and a moon ─────────────────────────────────────────────────────
//
// Because that is the one image this book and the alchemists share, and because
// a Katamari is a ball that swallows the world and grows: Sol and Luna, the two
// luminaries, the gold and the silver, conjoined into one body that consumes
// and increases. The ball is a *rebis* — the two-headed thing of the alchemical
// plates, gold face on one hemisphere and silver on the other, with the rays
// and the crescent between them. It is drawn, not modelled: one canvas, mapped
// round the sphere, so the two faces come round as you roll.
//
// ── How it eats ──────────────────────────────────────────────────────────────
//
// The world is a merged lump of geometry and has no objects in it (that is the
// whole point of `_compileDrawCalls`), so `HPWorldScene` keeps a CENSUS while
// it merges: every mesh's name, its size, where it is, and the range of
// vertices it occupies in whatever lump it was folded into. Rolling something
// up slices those vertices out into a little mesh of its own and collapses the
// original range to a point. See `HPWorldScene._census` / `takeRollable`.
//
// Katamari's rule, and it is a good one: you can pick up anything whose size is
// below a fraction of your own, and anything bigger is a wall. So the garden
// opens to you in the order the book opens to Poliphilo — first the grass and
// the flowers, then the herbs and the fruit, then the tiles and the balusters,
// then the nymphs, then the trees, and at last the buildings.

import * as THREE from 'three';

const UP = new THREE.Vector3(0, 1, 0);

// What fraction of the ball's radius a thing may be and still be eaten. The
// real game uses volume; a straight radius ratio is easier to reason about and
// gives the same "it just became possible" moment.
const BITE = 0.58;

// How many swallowed things stay on the outside. A full run eats ten thousand
// objects and every one of them would be its own draw call; but as the ball
// grows they are buried under later mouthfuls anyway, so the oldest are quietly
// dropped. Four hundred is enough that the surface is always crusted.
const CRUST = 400;

export class RollUp {
  constructor(scene, camera, walker, {
    r0 = 0.22,
    onEat = null,          // (name, count, radius) => void
  } = {}) {
    this.scene = scene;
    this.camera = camera;
    this.walker = walker;
    this.onEat = onEat;

    this.r = r0;
    this.pos = new THREE.Vector3(0, r0, 6);
    this.count = 0;
    this.active = false;
    this.speed = 3.4;
    this.spin = new THREE.Quaternion();      // the ball's accumulated rotation

    this.cam = { yaw: 0, pitch: 0.42, dist: 2.6 };
    this._camPos = new THREE.Vector3();
    this._keys = new Set();

    this.group = new THREE.Group();          // moves with the ball
    this.spinner = new THREE.Group();        // rotates with the ball
    this.group.add(this.spinner);
    this.ball = new THREE.Mesh(
      new THREE.SphereGeometry(1, 40, 28),
      new THREE.MeshStandardMaterial({
        map: this._faceTexture(), roughness: 0.34, metalness: 0.42,
        emissive: 0x1a1206, emissiveIntensity: 0.35,
      }));
    this.spinner.add(this.ball);
    this.group.visible = false;
    scene.add(this.group);

    this._stuck = [];                        // what is riding on the outside
    this._rollables = null;                  // set by attach()
    this._grid = null;
    this.meadows = [];                       // fields whose blades are food
    this.colliders = null;                   // things too big to climb, for now
    this.grass = 0;                          // blades eaten
  }

  // ── The face: Sol on one side, Luna on the other ───────────────────────
  // Drawn as an equirectangular map, so the gold face looks out at u = 0.25 and
  // the silver at u = 0.75 and the two meet at the seams, where the rays and
  // the stars run into each other.
  _faceTexture() {
    const W = 1024, H = 512;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');

    // the ground: a dark alchemical blue-black, so gold and silver both sing
    const bg = x.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#14161f');
    bg.addColorStop(0.5, '#1d2130');
    bg.addColorStop(1, '#14161f');
    x.fillStyle = bg; x.fillRect(0, 0, W, H);

    // stars scattered over the whole ground
    for (let i = 0; i < 220; i++) {
      const v = Math.sin(i * 91.7) * 43758.5453, u = v - Math.floor(v);
      const v2 = Math.sin(i * 37.1) * 24634.6345, u2 = v2 - Math.floor(v2);
      x.fillStyle = `rgba(230,224,200,${0.25 + u2 * 0.5})`;
      x.beginPath(); x.arc(u * W, u2 * H, 0.7 + u2 * 1.6, 0, 6.3); x.fill();
    }

    const disc = (cx, cy, R, fill, rim) => {
      const g = x.createRadialGradient(cx - R * 0.25, cy - R * 0.3, R * 0.1, cx, cy, R);
      g.addColorStop(0, fill[0]); g.addColorStop(0.65, fill[1]); g.addColorStop(1, fill[2]);
      x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R, 0, 6.3); x.fill();
      x.strokeStyle = rim; x.lineWidth = R * 0.045; x.stroke();
    };

    // ── SOL, at u = 0.25 ──────────────────────────────────────────────────
    const sx = W * 0.25, sy = H * 0.5, SR = H * 0.30;
    // the rays: twelve straight and twelve wavy, as the plates cut them
    x.save(); x.translate(sx, sy);
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      x.save(); x.rotate(a);
      x.fillStyle = i % 2 ? '#c9a03c' : '#e6c766';
      if (i % 2) {
        x.beginPath();
        x.moveTo(SR * 0.98, -SR * 0.075);
        x.quadraticCurveTo(SR * 1.30, -SR * 0.16, SR * 1.62, 0);
        x.quadraticCurveTo(SR * 1.30, SR * 0.16, SR * 0.98, SR * 0.075);
        x.closePath(); x.fill();
      } else {
        x.beginPath();
        x.moveTo(SR * 0.98, -SR * 0.10);
        x.lineTo(SR * 1.72, 0);
        x.lineTo(SR * 0.98, SR * 0.10);
        x.closePath(); x.fill();
      }
      x.restore();
    }
    x.restore();
    disc(sx, sy, SR, ['#ffeaa8', '#e0b74e', '#a97b22'], '#7a5514');
    // a face, in the manner of the emblem-books: two eyes, a nose, a closed mouth
    x.strokeStyle = '#6b4710'; x.lineWidth = SR * 0.035; x.lineCap = 'round';
    x.fillStyle = '#6b4710';
    for (const e of [-1, 1]) {
      x.beginPath(); x.ellipse(sx + e * SR * 0.30, sy - SR * 0.16, SR * 0.09, SR * 0.055, 0, 0, 6.3); x.fill();
    }
    x.beginPath(); x.moveTo(sx, sy - SR * 0.10); x.lineTo(sx - SR * 0.07, sy + SR * 0.14);
    x.lineTo(sx + SR * 0.03, sy + SR * 0.14); x.stroke();
    x.beginPath(); x.arc(sx, sy + SR * 0.22, SR * 0.26, 0.32, Math.PI - 0.32); x.stroke();
    // the sign of Sol: a dot in a circle, on the brow
    x.beginPath(); x.arc(sx, sy - SR * 0.52, SR * 0.12, 0, 6.3); x.stroke();
    x.beginPath(); x.arc(sx, sy - SR * 0.52, SR * 0.032, 0, 6.3); x.fill();

    // ── LUNA, at u = 0.75 ─────────────────────────────────────────────────
    const mx = W * 0.75, my = H * 0.5, MR = H * 0.30;
    disc(mx, my, MR, ['#ffffff', '#d6dbe4', '#8f97a6'], '#6b7280');
    // bitten to a crescent by the ground, the way the plates draw her
    x.save();
    x.globalCompositeOperation = 'destination-out';
    x.beginPath(); x.arc(mx + MR * 0.52, my - MR * 0.10, MR * 0.92, 0, 6.3); x.fill();
    x.restore();
    // …and the ground shows through, so paint her a face on what is left
    x.strokeStyle = '#5c6472'; x.lineWidth = MR * 0.035; x.fillStyle = '#5c6472';
    x.beginPath(); x.ellipse(mx - MR * 0.34, my - MR * 0.14, MR * 0.075, MR * 0.05, 0, 0, 6.3); x.fill();
    x.beginPath(); x.moveTo(mx - MR * 0.44, my + MR * 0.02); x.lineTo(mx - MR * 0.50, my + MR * 0.22); x.stroke();
    x.beginPath(); x.arc(mx - MR * 0.30, my + MR * 0.20, MR * 0.20, 0.9, 2.1); x.stroke();
    // the sign of Luna: a crescent, twice, where the ground is bare
    for (const [cx2, cy2, rr] of [[mx + MR * 1.22, my - MR * 0.62, MR * 0.16],
                                  [mx + MR * 1.05, my + MR * 0.72, MR * 0.13]]) {
      x.fillStyle = '#c9d2de';
      x.beginPath(); x.arc(cx2, cy2, rr, 0, 6.3); x.fill();
      x.save(); x.globalCompositeOperation = 'destination-out';
      x.beginPath(); x.arc(cx2 + rr * 0.5, cy2 - rr * 0.12, rr * 0.9, 0, 6.3); x.fill();
      x.restore();
    }

    // the two seams: a girdle of gold and silver where the luminaries meet
    for (const u of [0.0, 0.5]) {
      const gx = u * W;
      const g2 = x.createLinearGradient(gx - W * 0.03, 0, gx + W * 0.03, 0);
      g2.addColorStop(0, 'rgba(200,160,64,0)');
      g2.addColorStop(0.5, 'rgba(214,196,150,0.55)');
      g2.addColorStop(1, 'rgba(200,160,64,0)');
      x.fillStyle = g2; x.fillRect(gx - W * 0.03, 0, W * 0.06, H);
    }

    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }

  // ── Wiring ─────────────────────────────────────────────────────────────
  attach(rollables) {
    this._rollables = rollables || [];
    // A coarse grid, so "what is near the ball" is a handful of cells rather
    // than a scan of three thousand things every frame.
    this.CELL = 4;
    this._grid = new Map();
    for (const e of this._rollables) {
      const k = this._key(e.c.x, e.c.z);
      let b = this._grid.get(k);
      if (!b) this._grid.set(k, b = []);
      b.push(e);
    }
    this._onKD = (e) => {
      if (!this.active) return;
      this._keys.add(e.code);
      if (e.code === 'Escape') this.onExit?.();
    };
    this._onKU = (e) => this._keys.delete(e.code);
    this._onWheel = (e) => {
      if (!this.active) return;
      this.cam.dist = THREE.MathUtils.clamp(this.cam.dist + Math.sign(e.deltaY) * this.r * 0.4,
        this.r * 2.0, this.r * 14);
    };
    this._onPD = (e) => { if (this.active) { this._look = { id: e.pointerId, x: e.clientX, y: e.clientY }; } };
    this._onPM = (e) => {
      if (!this.active || !this._look || e.pointerId !== this._look.id) return;
      this.cam.yaw -= (e.clientX - this._look.x) * 0.005;
      this.cam.pitch = THREE.MathUtils.clamp(this.cam.pitch + (e.clientY - this._look.y) * 0.004, 0.05, 1.25);
      this._look.x = e.clientX; this._look.y = e.clientY;
    };
    this._onPU = () => { this._look = null; };
    window.addEventListener('keydown', this._onKD);
    window.addEventListener('keyup', this._onKU);
    window.addEventListener('wheel', this._onWheel, { passive: true });
    window.addEventListener('pointerdown', this._onPD);
    window.addEventListener('pointermove', this._onPM);
    window.addEventListener('pointerup', this._onPU);
  }

  dispose() {
    window.removeEventListener('keydown', this._onKD);
    window.removeEventListener('keyup', this._onKU);
    window.removeEventListener('wheel', this._onWheel);
    window.removeEventListener('pointerdown', this._onPD);
    window.removeEventListener('pointermove', this._onPM);
    window.removeEventListener('pointerup', this._onPU);
    this.group.removeFromParent();
    this.ball.geometry.dispose();
    this.ball.material.map?.dispose();
    this.ball.material.dispose();
  }

  _key(x, z) { return `${Math.floor(x / this.CELL)},${Math.floor(z / this.CELL)}`; }

  start(x = 0, z = 6) {
    this.pos.set(x, this.r, z);
    this.active = true;
    this.group.visible = true;
    this.cam.dist = this.r * 6;
    this._sync();
  }
  stop() { this.active = false; this.group.visible = false; }

  _sync() {
    this.group.position.copy(this.pos);
    this.ball.scale.setScalar(this.r);
    this.spinner.quaternion.copy(this.spin);
  }

  // ── The frame ──────────────────────────────────────────────────────────
  update(dt) {
    if (!this.active) return;
    const K = this._keys;
    // move in the camera's frame, as every game of this kind does
    const f = new THREE.Vector3(-Math.sin(this.cam.yaw), 0, -Math.cos(this.cam.yaw));
    const rt = new THREE.Vector3(Math.cos(this.cam.yaw), 0, -Math.sin(this.cam.yaw));
    const mv = new THREE.Vector3();
    if (K.has('KeyW') || K.has('ArrowUp'))    mv.add(f);
    if (K.has('KeyS') || K.has('ArrowDown'))  mv.sub(f);
    if (K.has('KeyA') || K.has('ArrowLeft'))  mv.sub(rt);
    if (K.has('KeyD') || K.has('ArrowRight')) mv.add(rt);

    if (mv.lengthSq() > 0) {
      mv.normalize();
      // a bigger ball is more ponderous, but not by much, or the late game drags
      const v = this.speed * (0.7 + 0.5 * Math.sqrt(this.r)) * (K.has('ShiftLeft') ? 1.7 : 1);
      const step = v * dt;
      this.pos.addScaledVector(mv, step);
      // it ROLLS: the rotation is the distance over the radius, about the axis
      // across the direction of travel
      const axis = new THREE.Vector3().crossVectors(UP, mv).normalize();
      const q = new THREE.Quaternion().setFromAxisAngle(axis, step / this.r);
      this.spin.premultiply(q);
    }

    // the ground under it, so it rolls up Cythera's terraces too
    const fy = this.walker ? this.walker.floorAt(this.pos.x, this.pos.z) : 0;
    this.pos.y += (fy + this.r - this.pos.y) * Math.min(1, dt * 8);

    this._block();
    this._eat();
    this._graze(dt);
    this._sync();
  }

  // Anything much bigger than the ball is a wall, which is the rule that makes
  // the world open up as you grow. The walk's own colliders serve: a column is
  // a column until you are three times its girth, and then it is lunch.
  _block() {
    if (!this.colliders) return;
    const R = this.r;
    for (const c of this.colliders) {
      if (c.r < R * 1.9) continue;                  // small enough to roll over
      const dx = this.pos.x - c.x, dz = this.pos.z - c.z;
      const d = Math.hypot(dx, dz), want = c.r + R * 0.7;
      if (d > want || d < 1e-5) continue;
      this.pos.x = c.x + (dx / d) * want;
      this.pos.z = c.z + (dz / d) * want;
    }
  }

  // Grass. Not in the census -- it is one InstancedMesh of 58 000 blades -- so
  // it is grazed rather than eaten one at a time, and it is the ball's first
  // and most reliable food.
  _graze(dt) {
    if (!this.meadows.length) return;
    this._grazeT = (this._grazeT || 0) + dt;
    if (this._grazeT < 0.09) return;
    this._grazeT = 0;
    let n = 0;
    for (const f of this.meadows) {
      if (f && f.pluck) n += f.pluck(this.pos.x, this.pos.z, this.r * 0.95);
    }
    if (!n) return;
    this.grass += n;
    // a blade is about a gram of the world; it takes a lot of them to grow, and
    // that is the point of the opening minutes
    this.r = Math.min(14, Math.cbrt(this.r ** 3 + n * 0.00016));
    this.count += n;
    this.onEat?.(n === 1 ? 'a blade of grass' : `${n} blades of grass`, this.count, this.r);
  }

  // Everything within reach that is small enough, in one pass over the nine
  // cells around the ball.
  _eat() {
    if (!this._grid) return;
    const reach = this.r * 1.05;
    const cx = Math.floor(this.pos.x / this.CELL), cz = Math.floor(this.pos.z / this.CELL);
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const b = this._grid.get(`${cx + i},${cz + j}`);
        if (!b) continue;
        for (const e of b) {
          if (e.taken || e.r > this.r * BITE) continue;
          const d = Math.hypot(e.c.x - this.pos.x, e.c.z - this.pos.z);
          if (d > reach + e.r) continue;
          if (Math.abs(e.c.y - this.pos.y) > this.r + e.r + 0.6) continue;
          this._swallow(e);
        }
      }
    }
  }

  _swallow(e) {
    const took = this.onTake ? this.onTake(e) : null;
    if (!took) return;
    // stick it where it was met, just proud of the surface, and let it ride
    const dir = new THREE.Vector3(e.c.x - this.pos.x, e.c.y - this.pos.y, e.c.z - this.pos.z);
    if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0);
    dir.normalize();
    // The holder sits on the surface where the thing was met and is turned so
    // the thing keeps the orientation it had in the world at that instant --
    // which is why a swallowed column still points the way it pointed, and a
    // leaf still lies the way it lay.
    const holder = new THREE.Group();
    holder.position.copy(dir).multiplyScalar(this.r * 0.88);
    holder.quaternion.copy(this.spin).invert();
    took.position.set(0, 0, 0);
    holder.add(took);
    this.spinner.add(holder);
    this._stuck.push(holder);
    // shed the oldest: by now they are inside the ball, not on it
    while (this._stuck.length > CRUST) {
      const old = this._stuck.shift();
      old.removeFromParent();
      old.traverse(o => { if (o.isMesh && o.geometry) o.geometry.dispose(); });
    }

    // grow: volumes add, with a packing loss, so the curve stays gentle
    const grown = Math.cbrt(this.r ** 3 + (e.r ** 3) * 0.42);
    this.r = Math.min(grown, 14);
    this.count++;
    this.cam.dist = THREE.MathUtils.clamp(this.cam.dist, this.r * 2.4, this.r * 9);
    this.onEat?.(e.name, this.count, this.r);
  }

  // Third person, behind and a little above, and it keeps its distance in
  // multiples of the radius so the ball stays the same size on screen as it
  // eats the world.
  applyTo(camera, dt) {
    const d = this.cam.dist;
    const want = new THREE.Vector3(
      this.pos.x + Math.sin(this.cam.yaw) * Math.cos(this.cam.pitch) * d,
      this.pos.y + Math.sin(this.cam.pitch) * d + this.r * 0.4,
      this.pos.z + Math.cos(this.cam.yaw) * Math.cos(this.cam.pitch) * d);
    if (!this._camPos.lengthSq()) this._camPos.copy(want);
    this._camPos.lerp(want, Math.min(1, (dt || 0.016) * 6));
    camera.position.copy(this._camPos);
    camera.lookAt(this.pos.x, this.pos.y + this.r * 0.25, this.pos.z);
  }
}
