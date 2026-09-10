// rollup.js — the roll-up census: what is food, what it is called, and how it is taken
//
// Lifted out of HPWorldScene.js on 2026-09-09 and mixed back onto its
// prototype, so `this` is the scene and every method reads exactly as it did.
// The class had grown to ~194 000 tokens, which no agent could read and which
// under one-writer-per-file meant no two agents could touch the world at once.
// See ENGINEERING.md §2c and the split's own notes in DECISIONS.md.
//
// Bodies are copied verbatim: class methods and object-literal methods have the
// same syntax. Do not reindent them — a diff against the old file should show
// nothing but the move.

import * as THREE from 'three';
import { MAX_EDIBLE } from '../../systems/RollUp.js?v=10';
import { Masonry } from '../../systems/Masonry.js?v=8';
import { HP_STATIONS, isDescendantOf } from './constants.js?v=6';

export const Rollup = {
  // ── The roll-up census ───────────────────────────────────────────────────
  //
  // One entry per thing you could conceivably pick up. `merged` is the lump it
  // was folded into and [start, count) its vertices in that lump; a standalone
  // mesh has merged === null and is simply detached when taken.
  //
  // Only built when the scene is asked for it (`{ rollup: true }`), because the
  // census is a few thousand objects and the walk has no use for it.
  _census(mesh, merged, start, count) {
    if (!this._wantRoll) return;
    // The witness is not food. He is not merged either -- he animates --
    // so a census entry for him would hand the ball a mesh it cannot slice.
    if (this._witness && mesh && this._witness.g && isDescendantOf(mesh, this._witness.g)) return;
    const g = mesh.geometry;
    if (!g || !g.attributes || !g.attributes.position) return;
    if (!g.boundingSphere) g.computeBoundingSphere();
    if (!g.boundingBox) g.computeBoundingBox();
    const bs = g.boundingSphere, bb = g.boundingBox;
    if (!bs || !bb) return;
    // How big a thing IS, for the purpose of being eaten. Not the bounding
    // sphere: a leaf card is a 95 cm square of nothing, and its sphere radius
    // is 67 cm, which would put a leaf later in the meal than a pebble the size
    // of a plum. The mean half-extent of the bounding box behaves: a leaf comes
    // out at 32 cm, a cube at half its side, a column at 58, a pebble at 5.
    const sc = Math.max(Math.abs(mesh.scale.x), Math.abs(mesh.scale.y), Math.abs(mesh.scale.z));
    const dx = (bb.max.x - bb.min.x) * Math.abs(mesh.scale.x);
    const dy = (bb.max.y - bb.min.y) * Math.abs(mesh.scale.y);
    const dz = (bb.max.z - bb.min.z) * Math.abs(mesh.scale.z);
    const r = (dx + dy + dz) / 6;
    // Anything bigger than this is architecture: the sea, the ground itself,
    // and whatever is still modelled as one block. You roll past those.
    //
    // The threshold is DERIVED from what the ball can actually reach
    // (`MAX_EDIBLE` = CEILING x BITE), and that matters: it was a hardcoded 6 m,
    // correct when the ball's ceiling was 14, and it did not move when the
    // ceiling went to 22 on 2026-09-09. Measured that day, **682 of the 931
    // rejected objects were inside the grown ball's real reach of 10.5 m** —
    // most of them the wood's canopy shells, so a katamari could not eat a
    // tree. Ted, the same day: "I want everything in the world of our virtual
    // dream garden to be roll up able." A number that has to agree with another
    // number should not be typed twice.
    //
    // Keep a LIST of the rest (2026-09-08). A thing past the threshold that is
    // not the ground or the water is a monolith — a building that was not built
    // out of stones — and this is the only place in the code that knows. It is
    // how the ashlar work finds its next target instead of guessing: see
    // `window._hp.state.activeScene._monoliths` and NEXTSTEPS.md 0g.
    const c = new THREE.Vector3().copy(bs.center).applyMatrix4(mesh.matrixWorld);
    // 2.33 is the ratio the hand-typed pair (6 and 14) used, kept: a long thin
    // thing is architecture even when its mean half-extent is modest.
    const tooBig = r > MAX_EDIBLE || bs.radius * sc > MAX_EDIBLE * 2.33;
    if (tooBig) {
      (this._monoliths = this._monoliths || []).push({
        r: +r.toFixed(2), span: +(bs.radius * sc).toFixed(1), type: g.type,
        size: [+dx.toFixed(1), +dy.toFixed(1), +dz.toFixed(1)],
        at: [+c.x.toFixed(1), +c.y.toFixed(1), +c.z.toFixed(1)],
        near: this._nearestStationName(mesh) || '(nowhere)',
        mat: mesh.material && mesh.material.color ? '#' + mesh.material.color.getHexString() : '',
      });
      return;
    }
    if (r <= 0.004) return;
    const e = {
      name: this._rollName(mesh, r), r, c,
      src: mesh,                                 // how Masonry.resolve finds it
      group: (mesh.userData && mesh.userData.rollGroup) || null,
      mesh: merged ? null : mesh, merged, start, count,
      mat: mesh.material, geo: merged ? null : null,
      taken: false,
    };
    this.rollables.push(e);
    if (e.group) {
      const g = (this._rollGroups = this._rollGroups || new Map());
      let b = g.get(e.group);
      if (!b) g.set(e.group, b = []);
      b.push(e);
    }
  },

  // A cup is a bowl and a foot; a lute is a body, a soundboard, a neck and a
  // pegbox. The census sees meshes, so without this the ball would eat the
  // soundboard and leave the neck lying on the grass, and the BITE test would
  // measure the longest stick instead of the instrument.
  //
  // So: every mesh of a littered object carries the same `rollGroup` (see
  // systems/Litter.js), and afterwards each group is given ONE size and ONE
  // centre — the union of its parts — which every member then shares. The ball
  // meets the object, and takeRollable hands back the whole of it.
  _resolveRollGroups() {
    if (!this._rollGroups) return 0;
    const min = new THREE.Vector3(), max = new THREE.Vector3(), v = new THREE.Vector3();
    for (const [, parts] of this._rollGroups) {
      min.set(Infinity, Infinity, Infinity);
      max.set(-Infinity, -Infinity, -Infinity);
      for (const e of parts) {
        const src = e.src, g = src.geometry;
        if (!g.boundingBox) g.computeBoundingBox();
        const bb = g.boundingBox;
        for (const [cx, cy, cz] of [[bb.min.x, bb.min.y, bb.min.z], [bb.max.x, bb.max.y, bb.max.z],
                                    [bb.min.x, bb.max.y, bb.max.z], [bb.max.x, bb.min.y, bb.min.z]]) {
          v.set(cx, cy, cz).applyMatrix4(src.matrixWorld);
          min.min(v); max.max(v);
        }
      }
      const r = ((max.x - min.x) + (max.y - min.y) + (max.z - min.z)) / 6;
      v.addVectors(min, max).multiplyScalar(0.5);
      const whole = parts.find(e => e.src && e.src.userData && e.src.userData.rollGroupName);
      const gname = whole ? whole.src.userData.rollGroupName : null;
      const st = gname ? this._nearestStationName(parts[0].src) : null;
      for (const e of parts) {
        e.r = r; e.c.copy(v); e.parts = parts;
        if (gname) e.name = st ? `${gname}, from ${st}` : gname;
      }
    }
    return this._rollGroups.size;
  },

  // What a thing is called. Katamari's whole charm is that the game knows the
  // name of every object it eats, so this is not decoration -- it is the mode.
  // Materials carry their own name where one is known (set at creation); the
  // rest is read off the geometry and its size, and the nearest wonder supplies
  // the "of" clause.
  _rollName(mesh, r) {
    const m = mesh.material;
    // The MESH's own name wins where it has one: a voussoir and its keystone are
    // cut from the same stone and share a material, so only the mesh can say
    // which is which. Otherwise the material's name, set where the thing is made.
    let base = (mesh.userData && mesh.userData.roll)
      || (m && m.userData && m.userData.roll) || null;
    if (!base) {
      const t = mesh.geometry.type;
      if (t === 'SphereGeometry')      base = r < 0.07 ? 'a berry' : r < 0.2 ? 'a fruit' : r < 0.6 ? 'a ball of clipped box' : 'a mass of leaves';
      else if (t === 'PlaneGeometry')  base = r < 0.3 ? 'a leaf' : 'a painted panel';
      else if (t === 'CylinderGeometry') base = r < 0.15 ? 'a little baluster' : r < 0.8 ? 'a column drum' : 'a column';
      else if (t === 'BoxGeometry')    base = r < 0.2 ? 'a tile' : r < 0.42 ? 'a brick' : 'a block of masonry';
      else if (t === 'ConeGeometry')   base = r < 0.4 ? 'a finial' : 'a spire';
      else if (t === 'TorusGeometry') {
        // it was calling every arch in the world a ring of gold
        const c = m && m.color ? m.color : null;
        const goldish = c && c.r > 0.55 && c.g > 0.42 && c.b < 0.42;
        base = goldish ? 'a ring of gold' : r < 0.4 ? 'a hoop' : 'an arch';
      }
      else if (t === 'DodecahedronGeometry') base = r < 0.12 ? 'a pebble' : r < 0.6 ? 'a stone' : 'a boulder';
      else if (t === 'RingGeometry')   base = 'a bed of flowers';
      else base = 'a piece of the dream';
    }
    const st = this._nearestStationName(mesh);
    return st ? `${base}, from ${st}` : base;
  },

  _nearestStationName(mesh) {
    const p = new THREE.Vector3().setFromMatrixPosition(mesh.matrixWorld);
    let best = null, bd = 13 * 13;
    for (const st of HP_STATIONS) {
      const dx = p.x - st.pos[0], dz = p.z - st.pos[1];
      const d = dx * dx + dz * dz;
      if (d < bd) { bd = d; best = st.name; }
    }
    return best;
  },

  // Take a thing out of the world and hand back a little mesh of its own, in
  // the ball's local space. The original stops existing: a standalone mesh is
  // detached, and a merged one has its vertex range collapsed to a point, which
  // costs one small write into the buffer and no draw calls at all.
  takeRollable(e) {
    if (e.taken) return null;
    let out = null;
    // A littered object comes off whole: its parts were censused together and
    // they leave together, in one holder, keeping the shape they had.
    if (e.parts && e.parts.length > 1) {
      const g = new THREE.Group();
      for (const q of e.parts) {
        if (q.taken) continue;
        q.taken = true;
        const piece = this._takeOne(q, e.c);
        if (piece) g.add(piece);
      }
      out = g.children.length ? g : null;
    } else {
      e.taken = true;
      out = this._takeOne(e, e.c);
    }
    // …and whatever was standing on it finds out
    this._dropDependents(e);
    return out;
  },

  _takeOne(e, centre) {
    // …and the building it was part of finds out. Everything above the stone
    // settles into the gap; take enough and the whole thing comes down.
    if (e.course) this.masonry.take(e);
    const c = centre || e.c;
    if (e.mesh) {
      // Re-centre on the group's centre, which for a single piece IS its own.
      e.mesh.removeFromParent();
      e.mesh.position.sub(c);
      const g = new THREE.Group();
      g.add(e.mesh);
      return g;
    }
    if (!e.merged || !e.count) return null;
    const src = e.merged.geometry;
    const out = new THREE.BufferGeometry();
    for (const key of ['position', 'normal', 'uv']) {
      const a = src.getAttribute(key);
      if (!a) continue;
      const it = a.itemSize;
      const arr = new Float32Array(e.count * it);
      for (let i = 0; i < e.count * it; i++) arr[i] = a.array[e.start * it + i];
      if (key === 'position') {                       // centre it on the object
        for (let i = 0; i < e.count; i++) {
          arr[i * 3] -= c.x; arr[i * 3 + 1] -= c.y; arr[i * 3 + 2] -= c.z;
        }
      }
      out.setAttribute(key, new THREE.BufferAttribute(arr, it));
    }
    // The merged buffer keeps its index; collapsing this object's positions to a
    // single point makes every one of its triangles degenerate, so it vanishes.
    //
    // Collapse to its OWN first vertex, not to the origin: a point already
    // inside the buffer's bounds leaves the bounding sphere still valid, and
    // three.js therefore does not recompute it. Collapsing to the origin (and
    // nulling the sphere, which the first version did) made three.js re-measure
    // a hundred-thousand-vertex buffer on every single mouthful -- fifteen
    // thousand times in a full run.
    const pa = src.getAttribute('position');
    const ax = pa.array[e.start * 3], ay = pa.array[e.start * 3 + 1], az = pa.array[e.start * 3 + 2];
    for (let i = 0; i < e.count; i++) {
      pa.array[(e.start + i) * 3] = ax;
      pa.array[(e.start + i) * 3 + 1] = ay;
      pa.array[(e.start + i) * 3 + 2] = az;
    }
    pa.needsUpdate = true;
    const mesh = new THREE.Mesh(out, e.mat);
    mesh.castShadow = false; mesh.receiveShadow = false;
    this._disp.push(out);
    return mesh;
  },

  // ── The draw-call compiler ────────────────────────────────────────────────
  //
  // The cast pass pushed the scene toward three thousand meshes, and the worst
  // view (the wood spawn, looking down the whole axis) hit ~39 ms. The fix is
  // the one the graphics-skills pack prescribes (procedural-architecture:
  // "material-slot BufferGeometry compilation"): everything static that shares
  // a material becomes ONE mesh, with its transform baked in. Things that move
  // as a group — the triumph floats, the swaying NPCs — are compiled within
  // their own group, so a six-elephant team is a handful of draws that still
  // processes; an NPC keeps its animated arm pivots unmerged and sways on.

  // ── Generic support (2026-09-08) ──────────────────────────────────────
  //
  // Ted: "the physics engine in roll mode doesn't have the objects that are
  // stacked on top of objects fall when the base objects disappear from
  // underneath them." The masonry registry only knows the structures it was
  // told about. This pass looks at EVERYTHING in the census and works out, for
  // each thing not sitting on the ground, what it is sitting on: anything whose
  // top is within a few centimetres of its bottom and whose footprint overlaps.
  // A crown learns its trunk, a topiary ball its stalk, a statue its plinth,
  // the serpent's coils the rock, a cup the table. Eat the support and what
  // rested on it falls -- to wherever the support itself was standing -- and
  // what rested on THAT rides down with it.
  //
  // Grouped objects (a table and its cloth and its dishes) are one thing here:
  // they share one box and one list.
  _resolveSupports() {
    const floorAt = (x, z) => this.walker.floorAt(x, z);
    const v = new THREE.Vector3();
    const reps = [];
  // one box per object (group representative), in world space
    const boxOf = (e) => {
      const parts = e.parts || [e];
      let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
      for (const q of parts) {
        const src = q.src, g = src.geometry;
        if (!g.boundingBox) g.computeBoundingBox();
        const b = g.boundingBox;
        for (let i = 0; i < 8; i++) {
          v.set(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).applyMatrix4(src.matrixWorld);
          if (v.x < x0) x0 = v.x; if (v.x > x1) x1 = v.x;
          if (v.y < y0) y0 = v.y; if (v.y > y1) y1 = v.y;
          if (v.z < z0) z0 = v.z; if (v.z > z1) z1 = v.z;
        }
      }
      return { x0, x1, y0, y1, z0, z1 };
    };
    for (const e of this.rollables) {
      if (e.parts && e.parts[0] !== e) continue;         // one representative per group
      e.box = boxOf(e);
      reps.push(e);
    }
  // a grid of supporters by cell, each cell sorted by the top of the box
    const CELL = 2.0;
    const cells = new Map();
    const key = (x, z) => (Math.floor(x / CELL) * 73856093) ^ (Math.floor(z / CELL) * 19349663);
    for (const e of reps) {
      // a thing spans every cell its footprint touches
      const cx0 = Math.floor(e.box.x0 / CELL), cx1 = Math.floor(e.box.x1 / CELL);
      const cz0 = Math.floor(e.box.z0 / CELL), cz1 = Math.floor(e.box.z1 / CELL);
      if ((cx1 - cx0 + 1) * (cz1 - cz0 + 1) > 64) continue;     // the sea, the roads: not supports
      for (let cx = cx0; cx <= cx1; cx++) for (let cz = cz0; cz <= cz1; cz++) {
        const k = (cx * 73856093) ^ (cz * 19349663);
        let b = cells.get(k);
        if (!b) cells.set(k, b = []);
        b.push(e);
      }
    }
    for (const b of cells.values()) b.sort((a, c) => a.box.y1 - c.box.y1);
    let stacked = 0; const supporters = new Set();
    const GAP = 0.10;
    for (const e of reps) {
      const bx = e.box;
      const cx = (bx.x0 + bx.x1) / 2, cz = (bx.z0 + bx.z1) / 2;
      if (bx.y0 <= floorAt(cx, cz) + 0.05) continue;       // on the ground: the earth holds it
      const b = cells.get(key(cx, cz));
      if (!b) continue;
      // binary search to the first top at or above (bottom - GAP)
      let lo = 0, hi = b.length;
      const want = bx.y0 - GAP;
      while (lo < hi) { const m = (lo + hi) >> 1; if (b[m].box.y1 < want) lo = m + 1; else hi = m; }
      for (let i = lo; i < b.length; i++) {
        const s2 = b[i];
        if (s2.box.y1 > bx.y0 + 0.06) break;                // tops now above our bottom: no longer "under"
        if (s2 === e) continue;
        if (s2.box.x1 < bx.x0 || s2.box.x0 > bx.x1 || s2.box.z1 < bx.z0 || s2.box.z0 > bx.z1) continue;
        (e.restsOn = e.restsOn || []).push(s2);
        (s2.supports = s2.supports || []).push(e);
        supporters.add(s2);
      }
      if (e.restsOn) stacked++;
    }
    return { stacked, supporters: supporters.size };
  },

  // The thing `e` has just been eaten. Whatever rested on it -- and had no
  // other support -- falls to where `e` itself was standing, and whatever
  // rested on THAT rides down the same distance. Grouped objects act through
  // their representative.
  _dropDependents(e) {
    const rep = e.parts ? e.parts[0] : e;
    if (!rep.supports || !rep.box) return;
  // where would the fallen things land? on the highest thing e itself rested on, else the floor
    let landing = -Infinity;
    for (const s2 of (rep.restsOn || [])) if (!s2.taken && s2.box.y1 > landing) landing = s2.box.y1;
    if (landing === -Infinity) {
      const cx = (rep.box.x0 + rep.box.x1) / 2, cz = (rep.box.z0 + rep.box.z1) / 2;
      landing = this.walker.floorAt(cx, cz);
    }
    const dy = rep.box.y1 - landing;
    if (dy <= 0.01) return;
    const seen = new Set();
    const drop = (d, dist) => {
      if (seen.has(d) || d.taken) return;
      seen.add(d);
      // still held by something else that stands? then it stays
      if (d.restsOn && d.restsOn.some(s2 => !s2.taken && s2 !== rep && !seen.has(s2))) return;
      const parts = d.parts || [d];
      for (const q of parts) if (!q.course) this.masonry.fall(q, dist);   // structures fall by their own rules
      d.box.y0 -= dist; d.box.y1 -= dist;
      for (const up of (d.supports || [])) drop(up, dist);
    };
    for (const up of rep.supports) drop(up, dy);
  },
};
