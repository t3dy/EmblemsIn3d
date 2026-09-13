// Creatures.js — the people and animals of Roll Up, as Katamari has them.
//
// Written 2026-09-13 from Ted: "not all game objects in the world seem to be
// roll up-able — I'm not seeing the people or nymphs or dragon and other
// animals responding like the people and animals do in katamari. When you bump
// them but they are too big for you to roll up sometimes they panic and run
// away."
//
// WHY THEY DID NOT. Every figure and animal is registered with _npc and then
// compiled by _mergeInto like any other group, and the roll-up census runs
// inside that compile — so a nymph became a head, a gown and two arms, each a
// separate census entry frozen at its load-time position. The ball ate her a
// limb at a time, nothing moved, and nothing noticed the ball.
//
// WHAT THEY DO NOW. Each figure is ONE creature, sized by its whole bounding
// box, and her census slices are withdrawn so the ball cannot nibble her:
//
//   · SMALL ENOUGH TO EAT — she has noticed you. Inside a radius that grows
//     with the ball she turns and runs, and the game is catching her. Caught,
//     she goes onto the ball whole and still in her pose.
//   · TOO BIG TO EAT — you are a nuisance, not a threat, until you hit her.
//     A bump makes her jump; more often than not she then bolts, arms up, for a
//     few seconds, and otherwise she staggers and stands her ground. The ball
//     is knocked back either way: you cannot roll THROUGH a person.
//
// Only creatures that stand still in the world are included. Anyone riding
// something that moves — Cupid's boat, the triumphal floats — is left alone,
// because running would tear them off their car.

import * as THREE from 'three';

const PEOPLE_SPEED = 3.0;     // m/s: a running nymph
const ANIMAL_SPEED = 5.0;     // a wolf or a dragon outruns her
const NOTICE = 3.0;           // metres beyond the ball's own radius, times...
const NOTICE_PER_R = 2.2;     // ...this many radii: a big ball is seen coming from further
const BOLT_CHANCE = 0.65;     // "sometimes they panic and run away"
const COOLDOWN = 1.4;         // seconds before the same creature can be startled again

const ANIMAL_KEYS = /wolf|dragon|lion|swan|stag|horse|bull|unicorn|leopard|panther/i;

function identityChain(g, scene) {
  // true if every ancestor between g and the scene leaves world space as it is
  for (let p = g.parent; p && p !== scene; p = p.parent) {
    if (p.position.lengthSq() > 1e-8) return false;
    if (Math.abs(p.rotation.x) + Math.abs(p.rotation.y) + Math.abs(p.rotation.z) > 1e-6) return false;
    if (Math.abs(p.scale.x - 1) + Math.abs(p.scale.y - 1) + Math.abs(p.scale.z - 1) > 1e-6) return false;
  }
  return true;
}

export class Creatures {
  constructor(world) {
    this.world = world;                        // HPWorldScene
    this.list = [];
    const scene = world.scene, box = new THREE.Box3(), size = new THREE.Vector3();
    for (const n of world._npcs) {
      const g = n.g;
      if (!g.parent || !identityChain(g, scene)) continue;
      if (world._witness && g === world._witness.g) continue;
      // Measured from her MESHES only. The name label is a sprite two metres
      // wide floating over her head, and counting it made every nymph the size
      // of a hedge.
      box.makeEmpty();
      g.updateWorldMatrix(true, true);
      g.traverse(o => { if (o.isMesh && !o.isSprite) box.expandByObject(o, false); });
      if (box.isEmpty()) continue;
      box.getSize(size);
      const h = Math.min(size.y, 3.2);
      const key = Object.keys(world.npcs).find(k => world.npcs[k] === g) || '';
      this.list.push({
        n, g, key,
        animal: ANIMAL_KEYS.test(key),
        r: (size.x + h + size.z) / 6,          // the census's own measure of size
        rad: Math.max(0.3, Math.max(size.x, size.z) / 2),
        h,
        home: g.position.clone(), homeYaw: n.baseY,
        state: 'idle', t: 0, cool: 0, hop: 0, phase: Math.random() * 6.28,
        taken: false,
      });
    }
    this.groups = new Set(this.list.map(c => c.g));
  }

  // Does this census entry belong to a creature? Its slices must not be food.
  owns(entry) {
    const o = entry.merged || entry.mesh || entry.src;
    for (let p = o; p; p = p.parent) if (this.groups.has(p)) return true;
    return false;
  }

  _startle(c, ball, bolt) {
    c.hop = 1;
    c.cool = COOLDOWN;
    c.n.panic = true;
    if (c.key.startsWith('chess_') && this.world._chess) this.world._chess.frozen = true;
    if (bolt) { c.state = 'flee'; c.t = 2.5 + Math.random() * 2.5; }
    else { c.state = 'stagger'; c.t = 1.0; }
  }

  update(dt, ball) {
    const R = ball.r, bite = ball.tune.bite;
    const notice = NOTICE + R * NOTICE_PER_R;
    const W = this.world.walker;
    const p = this._p || (this._p = new THREE.Vector3());
    for (const c of this.list) {
      if (c.taken) continue;
      const g = c.g;
      c.cool = Math.max(0, c.cool - dt);
      const dx = g.position.x - ball.pos.x, dz = g.position.z - ball.pos.z;
      const d = Math.hypot(dx, dz) || 1e-4;
      const edible = c.r <= R * bite;

      if (edible) {
        // small enough to be eaten, and she knows it
        if (d < notice && c.state !== 'flee' && c.cool <= 0) this._startle(c, ball, true);
      } else if (d < c.rad + R * 0.95) {
        // too big: the ball is knocked back off her, and she reacts
        const want = c.rad + R * 0.95;
        ball.pos.x = g.position.x - (dx / d) * want;
        ball.pos.z = g.position.z - (dz / d) * want;
        // (dx, dz) points from the ball to her, so speed toward her is +v.n
        const inward = (ball.vel.x * dx + ball.vel.z * dz) / d;
        // take that speed away and give some of it back the other way: a bounce
        if (inward > 0) { ball.vel.x -= (dx / d) * inward * 1.6; ball.vel.z -= (dz / d) * inward * 1.6; }
        if (c.cool <= 0 && inward > 0.25) this._startle(c, ball, Math.random() < BOLT_CHANCE);
      }

      c.hop = Math.max(0, c.hop - dt * 3.2);
      let y = Math.sin(c.hop * Math.PI) * 0.35 * Math.min(1.5, c.h / 1.6);

      if (c.state === 'flee') {
        c.t -= dt;
        c.phase += dt * 14;
        // away from the ball, with a little weave so a crowd scatters rather
        // than marching off in formation
        const weave = Math.sin(c.phase * 0.23 + c.home.x) * 0.5;
        const ax = dx / d, az = dz / d;
        const fx = ax * Math.cos(weave) - az * Math.sin(weave);
        const fz = ax * Math.sin(weave) + az * Math.cos(weave);
        const sp = (c.animal ? ANIMAL_SPEED : PEOPLE_SPEED) * (0.8 + Math.min(0.6, c.t * 0.15));
        p.set(g.position.x + fx * sp * dt, 0, g.position.z + fz * sp * dt);
        W.collide(p);
        g.position.x = p.x; g.position.z = p.z;
        c.n.baseY = Math.atan2(-fx, -fz);          // face the way she runs
        g.rotation.y = c.n.baseY;
        y += Math.abs(Math.sin(c.phase)) * 0.09;   // the running bob
        if (c.n.armL) {                              // arms up, flailing
          c.n.armL.rotation.z = c.n.aL + 1.15 + Math.sin(c.phase) * 0.45;
          c.n.armR.rotation.z = c.n.aR - 1.15 - Math.sin(c.phase + 1.3) * 0.45;
        }
        if (c.t <= 0) this._settle(c);
      } else if (c.state === 'stagger') {
        c.t -= dt;
        g.rotation.z = Math.sin(c.t * 18) * 0.12 * c.t;
        if (c.t <= 0) { g.rotation.z = 0; this._settle(c); }
      }
      // only while she is reacting: an idle chess dancer's own step is the
      // ballet's to write, not ours
      if (c.state !== 'idle' || c.hop > 0) g.position.y = c.home.y + y;
    }
  }

  _settle(c) {
    c.state = 'idle';
    c.n.panic = false;
    if (c.n.armL) { c.n.armL.rotation.z = c.n.aL; c.n.armR.rotation.z = c.n.aR; }
  }

  // RollUp._eat asks: what creature can the ball take right now?
  catchable(ball) {
    const R = ball.r, bite = ball.tune.bite, out = [];
    for (const c of this.list) {
      if (c.taken || c.r > R * bite) continue;
      const d = Math.hypot(c.g.position.x - ball.pos.x, c.g.position.z - ball.pos.z);
      if (d < R * 1.05 + c.rad) out.push(c);
    }
    return out;
  }

  // Off the ground and onto the ball, whole. Returns the group for RollUp to seat.
  take(c) {
    c.taken = true;
    const g = c.g;
    // a dancer eaten off the board is out of the ballet for good, or the next
    // round would go on moving and kissing a piece nobody can see
    const piece = this.world._chess && this.world._chess.pieces.find(q => q.g === g);
    if (piece) { piece.gone = true; piece.alive = false; }
    // the name label floats a metre over her head; on the ball it is litter
    for (const ch of [...g.children]) if (ch.isSprite) g.remove(ch);
    g.rotation.z = 0;
    const W = this.world;
    const i = W._npcs.indexOf(c.n);
    if (i >= 0) W._npcs.splice(i, 1);
    const centre = new THREE.Box3().setFromObject(g).getCenter(new THREE.Vector3());
    g.removeFromParent();
    // recentre on her middle, so she is seated on the ball by her waist and
    // not planted on it by her feet
    const off = new THREE.Group();
    g.position.set(g.position.x - centre.x, g.position.y - centre.y, g.position.z - centre.z);
    off.add(g);
    return { group: off, centre };
  }

  // The roll is over: anyone still standing goes home, and the dance resumes.
  dispose() {
    for (const c of this.list) {
      if (c.taken) continue;
      this._settle(c);
      c.g.position.copy(c.home);
      c.g.rotation.z = 0;
      c.n.baseY = c.homeYaw;
    }
    if (this.world._chess) this.world._chess.frozen = false;
  }
}
