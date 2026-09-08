// Masonry — the world made of blocks, and what happens when you take one out.
//
// Ted, 2026-09-08: "we need to make sure that the buildings are made from blocks
// or other constituent parts that are small enough to eventually be rolled up,
// like having the columns be made up of individual blocks stacked on top of each
// other, and that the game physics accounts for all the possibilities of
// interaction and what happens when a block is rolled up out from underneath the
// structures it supports."
//
// So a column is no longer a cylinder. It is a plinth, a torus, a scotia, a
// torus, then six or seven DRUMS, then a necking and a capital — twelve or more
// separate stones, each about twenty centimetres by the roll-up's own measure,
// each eatable on its own, and each holding up everything above it. Which is
// also just how a column is actually built: the drums of the Parthenon are
// stacked stones with a wooden dowel down the middle, and the reason a ruined
// column lies in a row of cheeses is that the drums were never one piece.
//
// This file is the bookkeeping and the physics, not the geometry. The scene
// declares a STRUCTURE (a vertical run of courses at one x,z), fills it with
// COURSES bottom to top, and hangs CARRIED loads on it — an entablature, a
// statue, an architrave that rests across several columns at once. Then:
//
//   * eat every piece of a course and that course is GONE;
//   * everything above it SETTLES down by exactly that course's height, and so
//     does everything the structure carries;
//   * a load carried by several structures settles by the WORST of them, because
//     a lintel bearing on four columns falls as soon as one of them shortens;
//   * and when a structure has lost enough of itself, it TOPPLES: the rest of
//     the stones let go, fall under gravity, spin, and come to rest on the
//     ground as rubble — which you can then roll over, and eat.
//
// The pieces are almost all inside merged draw-call buffers by the time any of
// this runs (see HPWorldScene._compileDrawCalls), so moving one means writing
// its vertex range in place: the same trick takeRollable uses to make an eaten
// stone vanish, running forwards instead of collapsing to a point. A falling
// drum costs about a hundred vector transforms a frame and no draw calls at all.

import * as THREE from 'three';

const GRAV = 11.0;          // a little heavier than life; stone should land hard
const SETTLE = 2.6;         // m/s — a course dropping into the gap below it
const TOPPLE_AT = 0.42;     // lose this fraction of your courses and you go over

export class Masonry {
  // `groundAt(x, z)` is where a falling stone comes to rest. It must be the
  // GROUND, not the structure it fell off: an arch springs from the top of a
  // six-metre post, and rubble that stops at the springing level is rubble
  // hanging in the air. The scene passes the walker's own floor query, so a
  // stone dropped on Cythera's second terrace lands on the second terrace.
  constructor({ groundAt = null } = {}) {
    this.groundAt = groundAt || (() => 0);
    this.structures = [];
    this.moving = [];                  // pieces in flight
    this._v = new THREE.Vector3();
    this._p = new THREE.Vector3();
    this._q = new THREE.Quaternion();
    this._e = new THREE.Euler();
    this._m4 = new THREE.Matrix4();
    this._one = new THREE.Vector3(1, 1, 1);
    this._grown = new Set();           // merged geometries whose sphere we widened
    this.fallen = 0;                   // structures brought down, for the HUD
  }

  // ── declaring a building, at build time ────────────────────────────────

  // A vertical run of stones at one place on the ground.
  // `brittle` is for the forms that have no redundancy. A wall or a column can
  // lose a course and stand on what is left; an ARCH cannot. Every voussoir in a
  // ring is holding every other one in compression, so removing any single wedge
  // — not only the keystone — takes the whole arch down at once. That is why an
  // arch is the thing medieval sappers went for, and it is why `_arch` sets this.
  structure({ x, z, r = 0.5, ground = 0, col = null, name = 'masonry', brittle = false }) {
    const st = { x, z, r, ground, col, name, brittle,
                 courses: [], carried: [], dependents: [], gone: 0, dead: false };
    this.structures.push(st);
    return st;
  }

  // B stands on A: bring A down and B comes with it. Used where the relation is
  // between two whole STRUCTURES rather than between a structure and a load —
  // an arch on its two piers, a second storey on a first. (A load can only be
  // carried, because a mesh belongs to exactly one course; a structure can lean
  // on as many others as it likes.)
  dependsOn(b, a) {
    if (!a || !b || a === b || a.dependents.includes(b)) return;
    a.dependents.push(b);
  }

  // One course of it: a drum, a plinth block, a capital, a ring of four ashlars.
  // The course is only gone when EVERY piece of it has been eaten, so a wall
  // four blocks wide takes four mouthfuls before anything above it moves.
  course(st, y, h, meshes) {
    if (!st) return null;
    const c = { st, y, h, i: st.courses.length, meshes: [], entries: [], gone: false, carried: false };
    st.courses.push(c);
    this.add(c, meshes);
    return c;
  }

  // Something the structure holds UP rather than something it is made of: an
  // architrave, a lintel, a statue on a plinth, a pediment. A carried load may
  // belong to several structures at once (that is what a colonnade is), and it
  // answers to whichever of them fails first.
  carry(st, meshes) {
    if (!st) return null;
    const c = { st, y: null, h: 0, i: 1e9, meshes: [], entries: [], gone: false, carried: true };
    st.carried.push(c);
    this.add(c, meshes);
    return c;
  }

  // Hang the same load on a second structure. The load now has two supports and
  // is only as sound as the weaker.
  alsoCarriedBy(c, st) {
    if (!c || !st || st.carried.includes(c)) return;
    st.carried.push(c);
  }

  add(c, meshes) {
    for (const m of meshes) {
      if (!m) continue;
      c.meshes.push(m);
      // A mesh can be a course of one structure and nothing else; the carry
      // relation is many-to-many and lives on the structure side.
      m.userData.masonry = c;
    }
  }

  // ── after the census ───────────────────────────────────────────────────
  // HPWorldScene._census records, for every source mesh, either the mesh itself
  // (when it stayed standalone) or its vertex range inside a merged buffer.
  // This pairs those entries back up with the stones they came from.
  resolve(rollables) {
    let n = 0;
    for (const e of rollables) {
      if (e.course) continue;      // _compileDrawCalls runs once per root, and
      const src = e.src;           // this must not enrol the same stone twice
      const c = src && src.userData && src.userData.masonry;
      if (!c) continue;
      e.course = c;
      c.entries.push(e);
      n++;
    }
    // Not every piece of a building reaches the census. A transparent material
    // is skipped by the draw-call merge (see ROUTER.md), so it is never offered
    // to _census at all — and the lettering on a gate is a transparent plaque.
    // Those pieces still belong to their course and must still move, or AD
    // CYTHERAM hangs in the air over the wreck of its own gate, which is what
    // happened on the first try. They get a PHANTOM entry: moved like any other
    // stone, but never eatable, and not counted when asking whether a course has
    // been eaten away.
    for (const st of this.structures) {
      for (const c of st.courses.concat(st.carried)) {
        if (c.phantomed) continue;
        c.phantomed = true;
        for (const m of c.meshes) {
          if (!m.parent) continue;                       // merged away: it has an entry
          if (c.entries.some(e => e.src === m || e.mesh === m)) continue;
          m.updateWorldMatrix(true, false);
          const p = new THREE.Vector3().setFromMatrixPosition(m.matrixWorld);
          c.entries.push({ phantom: true, taken: false, course: c, mesh: m, merged: null,
                           start: 0, count: 0, r: 0.2, c: p, name: 'a phantom' });
        }
      }
    }
    return n;
  }

  // ── play ───────────────────────────────────────────────────────────────

  // The roll-up has just swallowed a stone.
  take(entry) {
    const c = entry && entry.course;
    if (!c || c.gone) return;
    for (const e of c.entries) if (!e.taken && !e.phantom) return;   // it still stands
    this._fail(c);
  }

  _fail(c) {
    c.gone = true;
    if (c.carried) return;              // eating the architrave holds nothing up
    const st = c.st;
    st.gone++;
    if (st.brittle) { this.topple(st); return; }   // an arch loses one wedge and goes
    // Everything above drops into the gap — and so does everything held up.
    for (const up of st.courses) if (up.i > c.i && !up.gone) this._settle(up, c.h);
    for (const cc of st.carried) if (!cc.gone) this._settle(cc, c.h);
    if (st.gone >= Math.max(2, Math.ceil(st.courses.length * TOPPLE_AT))) this.topple(st);
  }

  _settle(c, dy) {
    for (const e of c.entries) {
      if (e.taken) continue;
      const rec = this._rec(e);
      if (rec.free) continue;           // already falling; gravity has it
      rec.drop += dy;
      rec.done = false;                 // a stone that had come to rest moves again
    }
  }

  // The structure lets go. Everything still standing on it, and everything it
  // was holding up, goes over the side.
  topple(st) {
    if (st.dead) return;
    st.dead = true;
    this.fallen++;
    // rubble does not block the walk
    if (st.col) st.col.r = 0;
    const groups = st.courses.concat(st.carried);
    for (const c of groups) {
      if (c.gone) continue;
      for (const e of c.entries) {
        if (e.taken) continue;
        const rec = this._rec(e);
        if (rec.free) continue;
        // Away from the axis, faster the higher it stood: a column does not
        // sink, it goes over.
        const dx = e.c.x - st.x, dz = e.c.z - st.z;
        const d = Math.hypot(dx, dz) || 1e-3;
        const lift = Math.max(0.2, e.c.y - st.ground);
        const push = 0.5 + lift * 0.5;
        rec.free = true;
        rec.done = false;
        rec.drop = 0;
        rec.vel.set((dx / d) * push + (Math.random() - 0.5) * 0.7,
                    0.4 + Math.random() * 0.5,
                    (dz / d) * push + (Math.random() - 0.5) * 0.7);
        rec.spin.set((Math.random() - 0.5) * 3.4, (Math.random() - 0.5) * 2.2,
                     (Math.random() - 0.5) * 3.4);
        rec.rest = this.groundAt(e.c.x, e.c.z) + Math.min(0.22, e.r);   // it lies where it lands
      }
      c.gone = true;
    }
    st.courses.forEach(c => { c.gone = true; });
    for (const d of st.dependents) this.topple(d);   // and whatever stood on it
    if (this.onTopple) this.onTopple(st);
  }

  // A piece's flight record, made the first time it needs one. The original
  // vertices are copied out then, relative to the piece's own centre, so that
  // every later frame is one clean transform of the rest pose rather than a
  // rotation compounded on a rotation.
  _rec(e) {
    if (e._rec) return e._rec;
    const rec = {
      e, drop: 0, free: false, done: false,
      pos: e.c.clone(), quat: new THREE.Quaternion(),
      vel: new THREE.Vector3(), spin: new THREE.Vector3(),
      euler: new THREE.Euler(), rest: 0, orig: null,
    };
    if (!e.mesh && e.merged) {
      // copy the rest pose out of the merged buffer, centred on the stone
      const g = e.merged.geometry;
      const pa = g.getAttribute('position'), na = g.getAttribute('normal');
      rec.orig = new Float32Array(e.count * 3);
      for (let i = 0; i < e.count; i++) {
        rec.orig[i * 3]     = pa.array[(e.start + i) * 3]     - e.c.x;
        rec.orig[i * 3 + 1] = pa.array[(e.start + i) * 3 + 1] - e.c.y;
        rec.orig[i * 3 + 2] = pa.array[(e.start + i) * 3 + 2] - e.c.z;
      }
      if (na) {
        rec.norm = new Float32Array(e.count * 3);
        for (let i = 0; i < e.count * 3; i++) rec.norm[i] = na.array[e.start * 3 + i];
      }
      // A merged buffer's bounding sphere is already big, but a stone thrown
      // clear of it would be frustum-culled with the whole draw call. Widen it
      // once, and never recompute it — recomputing a hundred-thousand-vertex
      // sphere per mouthful is the mistake takeRollable already learned.
      if (!this._grown.has(g)) {
        this._grown.add(g);
        if (!g.boundingSphere) g.computeBoundingSphere();
        if (g.boundingSphere) g.boundingSphere.radius += 8;
      }
    }
    this.moving.push(rec);
    e._rec = rec;
    return rec;
  }

  update(dt) {
    if (!this.moving.length) return;
    const d = Math.min(dt, 0.05);
    for (const rec of this.moving) {
      if (rec.done) continue;
      const e = rec.e;
      if (e.taken) { rec.done = true; continue; }
      if (rec.free) {
        rec.vel.y -= GRAV * d;
        rec.pos.addScaledVector(rec.vel, d);
        rec.euler.x += rec.spin.x * d;
        rec.euler.y += rec.spin.y * d;
        rec.euler.z += rec.spin.z * d;
        rec.quat.setFromEuler(rec.euler);
        if (rec.pos.y <= rec.rest) {                    // it hits the ground
          rec.pos.y = rec.rest;
          rec.vel.multiplyScalar(0.32);
          rec.vel.y = Math.abs(rec.vel.y) * 0.3;
          rec.spin.multiplyScalar(0.4);
          if (rec.vel.lengthSq() < 0.06) {              // and comes to rest
            rec.vel.set(0, 0, 0); rec.spin.set(0, 0, 0);
            rec.free = false; rec.done = true;
          }
        }
      } else if (rec.drop > 0) {
        const step = Math.min(rec.drop, SETTLE * d);
        rec.drop -= step;
        rec.pos.y -= step;
        if (rec.drop <= 1e-4) { rec.drop = 0; rec.done = true; }
      } else { rec.done = true; continue; }
      this._apply(rec);
    }
    // Records are NOT pruned when they come to rest: a settled stone can be
    // asked to move again the moment the course under it fails, and a pruned
    // one would never be stepped.
  }

  _apply(rec) {
    const e = rec.e;
    // the stone can still be eaten, and eaten where it now IS
    e.c.copy(rec.pos);
    if (e.mesh) {
      // A standalone mesh moves the ordinary way. Every parent the masonry
      // registers under is either the scene or a group placed but not tilted,
      // so world Y is local Y and setting the position outright is safe.
      e.mesh.position.set(rec.pos.x, rec.pos.y, rec.pos.z);
      e.mesh.quaternion.copy(rec.quat);
      return;
    }
    if (!rec.orig || !e.merged) return;
    const g = e.merged.geometry;
    const pa = g.getAttribute('position'), na = g.getAttribute('normal');
    const m4 = this._m4.compose(rec.pos, rec.quat, this._one);
    const v = this._v;
    for (let i = 0; i < e.count; i++) {
      v.set(rec.orig[i * 3], rec.orig[i * 3 + 1], rec.orig[i * 3 + 2]).applyMatrix4(m4);
      pa.array[(e.start + i) * 3]     = v.x;
      pa.array[(e.start + i) * 3 + 1] = v.y;
      pa.array[(e.start + i) * 3 + 2] = v.z;
    }
    pa.needsUpdate = true;
    if (na && rec.norm) {
      for (let i = 0; i < e.count; i++) {
        v.set(rec.norm[i * 3], rec.norm[i * 3 + 1], rec.norm[i * 3 + 2]).applyQuaternion(rec.quat);
        na.array[(e.start + i) * 3]     = v.x;
        na.array[(e.start + i) * 3 + 1] = v.y;
        na.array[(e.start + i) * 3 + 2] = v.z;
      }
      na.needsUpdate = true;
    }
  }

  // Every structure standing under a rectangle — how an architrave finds the
  // columns it bears on. Axis-aligned box in world space, generous by `pad`.
  under(x0, x1, z0, z1, pad = 0.6) {
    const out = [];
    for (const st of this.structures) {
      if (st.x < x0 - pad || st.x > x1 + pad) continue;
      if (st.z < z0 - pad || st.z > z1 + pad) continue;
      out.push(st);
    }
    return out;
  }

  // Every structure within `r` of a point — how a ring of columns finds the
  // architrave set on its radius, where an axis-aligned box would be wrong for
  // seven bays out of eight.
  near(x, z, r) {
    const rr = r * r, out = [];
    for (const st of this.structures) {
      const dx = st.x - x, dz = st.z - z;
      if (dx * dx + dz * dz <= rr) out.push(st);
    }
    return out;
  }


}
