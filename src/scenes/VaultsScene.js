// VaultsScene.js — the vaults under the Great Pyramid, as a crawl.
//
// Chapter V of the Hypnerotomachia is already a roguelike, and this scene is
// built from its own words (Dallington 1592, pp. 82–87). Poliphilo meets the
// dragon in the doorway, turns, and runs "into the inward part of the darke
// places, penetrating through diuers crooked torments, ambagious passages and
// vnknowne waies" — a place "so full of wayes and winding turnings, one
// entring into another, to deceiue the intent of the goer out, or in."
//
// Every mechanic here is a line of that chapter:
//
//   the dark      "although my eyes were somewhat wel acquainted with the
//                  darkenes, yet I could see iust nothing"
//   the pillars   "many huge and mightie pillers, some fouresquare, some sixe
//                  square, some eight square, aptly set vnder and
//                  approportioned to sustaine the vast bignes of the waightie
//                  Pyramides" — and he gropes "least I should runne my face
//                  against some pyllers"
//   the vaults    "feeling with my feete softlye before I did rest vpon them
//                  for feare I should tumble downe into some vaulte vnder thys
//                  mighty Pyramides" — the pits that end a run
//   the lamp      "I discouered a little light. I saw an euerlasting Lampe,
//                  burning before an Aultar that was fiue foote high, and
//                  tenne foote broad, with the images of golde standing
//                  thereupon" — the checkpoint, and the thing worth finding
//   the wicket    "I espied a light whiche so long I had wished for, comming
//                  in at a litle wicket as small as I could see" — the way down
//   the dragon    "I began to imagine that the Dragon was flying about my head"
//
// Depth is the score: each wicket takes you further in, the maze grows, the
// dark closes, and the dragon quickens. Nothing here is invented but the
// numbers.

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Walker } from '../systems/Walker.js?v=6';
import { makeCast } from '../systems/Cast.js?v=48';
import { createStyle } from '../shaders/HPStyles.js?v=6';

const CELL = 3.2;          // one bitmap cell, in world units
const WALL_H = 4.4;

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export class VaultsScene {
  constructor(renderer, composer, { depth = 1, seed = null, lamps = 0 } = {}) {
    this.renderer = renderer;
    this.composer = composer;
    this.depth = depth;
    this.lamps = lamps;                       // lamps lit so far this run
    this.seed = seed ?? ((Math.random() * 1e9) | 0);
    this.rnd = mulberry32(this.seed + depth * 7919);
    this.style = createStyle('lit');
    this.cast = makeCast(this.style);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x05040a);
    // "I could see iust nothing" — the dark is the antagonist, and it thickens
    // as you go down
    this.scene.fog = new THREE.FogExp2(0x05040a, 0.085 + Math.min(0.05, depth * 0.006));
    this.camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.08, 90);
    this.camera.rotation.order = 'YXZ';

    this._disp = [];
    this._t = 0;
    this._over = false;
    this._pathTimer = 0;
    this._dragonWake = 4.5;                   // it does not start on top of you
    this.onDepth = null;                      // (depth) => void
    this.onDeath = null;                      // (how) => void
    this.onLamp = null;                       // (lamps, total) => void
    this.onMap = null;                        // (mapState) => void
    this.onWarn = null;                       // (kind|null) => void
    this._warn = undefined;
  }

  // ── the maze ──────────────────────────────────────────────────────────
  // A bitmap at double resolution: cell (cx, cy) of the maze is bitmap
  // (2cx+1, 2cy+1), and the wall between two cells is the bitmap square
  // between them. Carved by randomised depth-first search, then some walls
  // are knocked through — the book insists on "crossing passages, one entring
  // into another", which a perfect tree maze does not have.
  _carve() {
    const MW = Math.min(15, 7 + Math.floor(this.depth * 1.2));
    const MH = MW;
    const W = this.W = MW * 2 + 1, H = this.H = MH * 2 + 1;
    const solid = this.solid = Array.from({ length: H }, () => new Array(W).fill(true));
    const seen = Array.from({ length: MH }, () => new Array(MW).fill(false));
    const stack = [[0, 0]];
    seen[0][0] = true; solid[1][1] = false;
    const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    while (stack.length) {
      const [cx, cy] = stack[stack.length - 1];
      const open = [];
      for (const [dx, dy] of DIRS) {
        const nx = cx + dx, ny = cy + dy;
        if (nx >= 0 && ny >= 0 && nx < MW && ny < MH && !seen[ny][nx]) open.push([nx, ny, dx, dy]);
      }
      if (!open.length) { stack.pop(); continue; }
      const [nx, ny, dx, dy] = open[Math.floor(this.rnd() * open.length)];
      seen[ny][nx] = true;
      solid[2 * cy + 1 + dy][2 * cx + 1 + dx] = false;      // the wall between
      solid[2 * ny + 1][2 * nx + 1] = false;                // the new cell
      stack.push([nx, ny]);
    }
    // the loops: "one entring into another, to deceiue the intent of the goer
    // out, or in" — without these it is a tree, and a tree is not a labyrinth
    let knocks = Math.floor(MW * MH * 0.13);
    for (let g = 0; g < knocks * 40 && knocks > 0; g++) {
      const x = 1 + Math.floor(this.rnd() * (W - 2)), y = 1 + Math.floor(this.rnd() * (H - 2));
      if (!solid[y][x]) continue;
      const horiz = !solid[y][x - 1] && !solid[y][x + 1] && solid[y - 1][x] && solid[y + 1][x];
      const vert = !solid[y - 1][x] && !solid[y + 1][x] && solid[y][x - 1] && solid[y][x + 1];
      if (horiz || vert) { solid[y][x] = false; knocks--; }
    }
    this.open = [];
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (!solid[y][x]) this.open.push([x, y]);
  }

  // breadth-first distances over the open squares, from one square
  _flood(sx, sy) {
    const { W, H, solid } = this;
    const d = Array.from({ length: H }, () => new Array(W).fill(-1));
    const q = [[sx, sy]]; d[sy][sx] = 0;
    for (let i = 0; i < q.length; i++) {
      const [x, y] = q[i];
      for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || solid[ny][nx] || d[ny][nx] >= 0) continue;
        d[ny][nx] = d[y][x] + 1; q.push([nx, ny]);
      }
    }
    return d;
  }

  wx(x) { return (x - (this.W - 1) / 2) * CELL; }
  wz(y) { return (y - (this.H - 1) / 2) * CELL; }
  cellAt(wx, wz) {
    return [Math.round(wx / CELL + (this.W - 1) / 2), Math.round(wz / CELL + (this.H - 1) / 2)];
  }

  async build() {
    this._carve();
    const S = this.style, rnd = this.rnd;
    const M = (color, extra = {}) => { const m = S.mat({ color, ...extra }); this._disp.push(m); return m; };
    const stone = M(0x39332c, { roughness: 0.97 });
    const dark = M(0x1d1a16, { roughness: 1 });
    const gold = M(0xc8a040, { roughness: 0.3, metalness: 0.9 });

    // ── the start, the wicket, the lamps, the vaults ────────────────────
    const start = this.open[0];
    const dStart = this._flood(start[0], start[1]);
    let far = start, best = -1;
    for (const [x, y] of this.open) if (dStart[y][x] > best) { best = dStart[y][x]; far = [x, y]; }
    this.wicket = far;
    this.start = start;

    // three altars, each far from the others and from the way in
    this.altars = [];
    const cand = this.open.filter(([x, y]) => dStart[y][x] > best * 0.25);
    for (let i = 0; i < 3 && cand.length; i++) {
      let pick = null, pbest = -1;
      for (const c of cand) {
        const near = Math.min(
          ...[[...this.altars, this.wicket, start].map(a => Math.hypot(a[0] - c[0], a[1] - c[1]))]. flat());
        if (near > pbest) { pbest = near; pick = c; }
      }
      if (!pick || pbest < 3) break;
      this.altars.push(pick);
    }
    this.lampLit = this.altars.map(() => false);

    // the vaults you can tumble into — never on the way in, the wicket, or an altar
    const taken = new Set([start, this.wicket, ...this.altars].map(c => c[1] * this.W + c[0]));
    this.pits = new Set();
    const nPits = 3 + Math.floor(this.depth * 1.4);
    for (let g = 0; g < nPits * 60 && this.pits.size < nPits; g++) {
      const [x, y] = this.open[Math.floor(rnd() * this.open.length)];
      const k = y * this.W + x;
      if (taken.has(k) || this.pits.has(k)) continue;
      if (Math.hypot(x - start[0], y - start[1]) < 4) continue;
      this.pits.add(k);
    }

    // ── the fabric ──────────────────────────────────────────────────────
    const wallGeo = [], floorGeo = [];
    const box = (w, h, d, x, y, z) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);
    for (let y = 0; y < this.H; y++) {
      for (let x = 0; x < this.W; x++) {
        const X = this.wx(x), Z = this.wz(y);
        if (this.solid[y][x]) {
          // only the faces that can be seen are worth building
          const edge = [[0, -1], [1, 0], [0, 1], [-1, 0]].some(([dx, dy]) => {
            const nx = x + dx, ny = y + dy;
            return nx >= 0 && ny >= 0 && nx < this.W && ny < this.H && !this.solid[ny][nx];
          });
          if (!edge) continue;
          wallGeo.push(box(CELL, WALL_H, CELL, X, WALL_H / 2, Z));
          this.walls = this.walls || [];
          this.walls.push({ x0: X - CELL / 2, x1: X + CELL / 2, z0: Z - CELL / 2, z1: Z + CELL / 2 });
        } else if (!this.pits.has(y * this.W + x)) {
          floorGeo.push(box(CELL, 0.2, CELL, X, -0.1, Z));
        }
      }
    }
    const add = (geos, mat, cast = true) => {
      if (!geos.length) return null;
      const g = mergeGeometries(geos, false);
      geos.forEach(x => x.dispose());
      const m = new THREE.Mesh(g, mat);
      m.castShadow = false; m.receiveShadow = true;
      this.scene.add(m); this._disp.push(g);
      return m;
    };
    add(wallGeo, stone);
    add(floorGeo, dark);
    // the ceiling: the underside of the pyramid's own mass
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(this.W * CELL, this.H * CELL), stone);
    ceil.rotation.x = Math.PI / 2; ceil.position.y = WALL_H;
    this.scene.add(ceil); this._disp.push(ceil.geometry);

    // ── the pillars: "some fouresquare, some sixe square, some eight square" ──
    const pillarGeo = [];
    this.colliders = [];
    for (const [x, y] of this.open) {
      const k = y * this.W + x;
      if (this.pits.has(k) || taken.has(k)) continue;
      if (rnd() > 0.16) continue;
      const sides = [4, 6, 8][Math.floor(rnd() * 3)];
      const r = 0.5 + rnd() * 0.18;
      const X = this.wx(x), Z = this.wz(y);
      const g = new THREE.CylinderGeometry(r, r * 1.1, WALL_H, sides).translate(X, WALL_H / 2, Z);
      if (sides === 4) g.rotateY(Math.PI / 4);
      pillarGeo.push(g);
      this.colliders.push({ x: X, z: Z, r: r + 0.1 });
    }
    add(pillarGeo, stone);

    // ── the everlasting lamps, on their altars ──────────────────────────
    // "an Aultar that was fiue foote high, and tenne foote broad, with the
    // images of golde standing thereupon" — 5 ft ≈ 1.5 m, 10 ft ≈ 3 m.
    this._altarLights = [];
    this.altars.forEach(([x, y], i) => {
      const X = this.wx(x), Z = this.wz(y);
      const g = new THREE.Group(); g.position.set(X, 0, Z); this.scene.add(g);
      const mk = (geo, mat, px, py, pz) => { const m = new THREE.Mesh(geo, mat); m.position.set(px, py, pz); g.add(m); this._disp.push(geo); return m; };
      mk(new THREE.BoxGeometry(2.2, 0.18, 1.0), stone, 0, 0.09, 0);
      mk(new THREE.BoxGeometry(1.9, 1.32, 0.8), stone, 0, 0.75, 0);
      mk(new THREE.BoxGeometry(2.2, 0.16, 1.0), stone, 0, 1.49, 0);
      for (const sx of [-1, 1]) {                             // the images of gold
        const f = this.cast.figure({ name: 'imago' + i + sx, h: 0.5, robe: null, skin: 0xc8a040, cutout: null });
        f.position.set(sx * 0.5, 1.57, 0); g.add(f);
      }
      // the lamp itself, hanging before the altar, unlit until you reach it
      const bowl = mk(new THREE.SphereGeometry(0.19, 12, 9, 0, Math.PI * 2, 0, Math.PI / 1.7),
        M(0xd8c070, { roughness: 0.35, metalness: 0.7 }), 0, 1.9, 0.85);
      bowl.rotation.x = Math.PI;
      mk(new THREE.CylinderGeometry(0.012, 0.012, 1.6, 5), gold, 0, 2.75, 0.85);
      const flame = mk(new THREE.ConeGeometry(0.09, 0.26, 8),
        M(0xffd070, { emissive: 0xffa030, emissiveIntensity: 2.2, roughness: 0.5 }), 0, 1.98, 0.85);
      flame.visible = false;
      const pl = new THREE.PointLight(0xffb060, 0, 13, 2);
      pl.position.set(X, 2.1, Z + 0.85); this.scene.add(pl);
      this._altarLights.push({ i, pl, flame, x, y });
    });

    // ── the little wicket ───────────────────────────────────────────────
    {
      const [x, y] = this.wicket, X = this.wx(x), Z = this.wz(y);
      const g = new THREE.Group(); g.position.set(X, 0, Z); this.scene.add(g);
      const jamb = new THREE.BoxGeometry(0.28, 2.3, 0.4);
      for (const sx of [-1, 1]) { const m = new THREE.Mesh(jamb, stone); m.position.set(sx * 0.72, 1.15, 0); g.add(m); }
      this._disp.push(jamb);
      const lint = new THREE.BoxGeometry(1.8, 0.3, 0.45);
      const l = new THREE.Mesh(lint, stone); l.position.set(0, 2.45, 0); g.add(l); this._disp.push(lint);
      const glowGeo = new THREE.PlaneGeometry(1.16, 2.3);
      const glow = new THREE.Mesh(glowGeo, M(0xffeec0, { emissive: 0xffe0a0, emissiveIntensity: 2.6, roughness: 1 }));
      glow.position.set(0, 1.15, 0); g.add(glow); this._disp.push(glowGeo);
      this._wicketGlow = glow;
      const wl = new THREE.PointLight(0xffe0a0, 30, 16, 2);
      wl.position.set(X, 1.6, Z); this.scene.add(wl);
      this._wicketLight = wl;
    }

    // ── the walker, and the little light he has ─────────────────────────
    const halfX = (this.W * CELL) / 2, halfZ = (this.H * CELL) / 2;
    this.walker = new Walker(this.renderer, {
      eye: 1.7, speed: 4.6, runSpeed: 8.2,
      bounds: { minX: -halfX, maxX: halfX, minZ: -halfZ, maxZ: halfZ },
    });
    this.walker.walls = this.walls || [];
    this.walker.colliders = this.colliders;
    this.walker.player.pos.set(this.wx(start[0]), 0, this.wz(start[1]));
    this.walker.player.yaw = 0;

    // Barely anything, and it shortens as you descend. The renderer is on
    // physical units with ACES tone mapping, so a point light is measured in
    // tens — 1.5 renders as pitch black, which is how the first build looked.
    this._lanternBase = 26;
    this.lantern = new THREE.PointLight(0xffc888, this._lanternBase, Math.max(5.5, 9.5 - this.depth * 0.4), 2);
    this.scene.add(this.lantern);
    this.scene.add(new THREE.AmbientLight(0x2a2438, 1.1));

    // the dragon, woken a little way off
    const dcand = this.open.filter(([x, y]) => dStart[y][x] > best * 0.45 && !this.pits.has(y * this.W + x));
    const dcell = dcand.length ? dcand[Math.floor(rnd() * dcand.length)] : far;
    this.dragon = this.cast.animals.dragon(1.5);
    this.dragon.position.set(this.wx(dcell[0]), 0.5, this.wz(dcell[1]));
    this.scene.add(this.dragon);
    this.dragonCell = dcell.slice();
    this.dragonSpeed = 2.5 + this.depth * 0.22;

    // what the reader has seen: the map fills in as you walk
    this.known = Array.from({ length: this.H }, () => new Array(this.W).fill(false));
    this._mark();

    this.walker.attach();
    this.walker.applyTo(this.camera);
  }

  // everything within a few squares becomes known
  _mark() {
    const [cx, cy] = this.cellAt(this.walker.player.pos.x, this.walker.player.pos.z);
    const R = 2;
    for (let y = cy - R; y <= cy + R; y++) {
      for (let x = cx - R; x <= cx + R; x++) {
        if (x < 0 || y < 0 || x >= this.W || y >= this.H) continue;
        this.known[y][x] = true;
      }
    }
  }
  // a lamp reveals its own quarter of the vault
  _revealAround(cx, cy, R) {
    for (let y = cy - R; y <= cy + R; y++) {
      for (let x = cx - R; x <= cx + R; x++) {
        if (x < 0 || y < 0 || x >= this.W || y >= this.H) continue;
        this.known[y][x] = true;
      }
    }
  }

  mapState() {
    return {
      W: this.W, H: this.H, solid: this.solid, known: this.known,
      player: this.cellAt(this.walker.player.pos.x, this.walker.player.pos.z),
      wicket: this.wicket, altars: this.altars, lampLit: this.lampLit,
      dragon: this.dragonCell,
    };
  }

  update(dt) {
    if (this._over) return;
    this._t += dt;
    this.walker.update(dt);
    this.walker.applyTo(this.camera);
    const p = this.walker.player.pos;
    this.lantern.position.set(p.x, 1.75, p.z);
    this.lantern.intensity = this._lanternBase * (1 + Math.sin(this._t * 7.3) * 0.09);   // it gutters

    this._mark();
    const [cx, cy] = this.cellAt(p.x, p.z);

    // ── the vaults under the pyramid ────────────────────────────────────
    // They cannot be seen — there is no floor and no light — so the book's own
    // precaution is the mechanic: "feeling with my feete softlye before I did
    // rest vpon them, for feare I should tumble downe into some vaulte." Step
    // beside one and your foot finds nothing; step into the middle of it and
    // you are gone.
    let warn = null;
    for (const [ax, ay] of [[0, 0], [0, -1], [1, 0], [0, 1], [-1, 0]]) {
      if (this.pits.has((cy + ay) * this.W + (cx + ax))) { warn = 'vault'; break; }
    }
    if (this.pits.has(cy * this.W + cx)
        && Math.hypot(p.x - this.wx(cx), p.z - this.wz(cy)) < 1.05) { this._end('vault'); return; }

    // the everlasting lamps
    for (const a of this._altarLights) {
      if (this.lampLit[a.i]) continue;
      if (Math.hypot(p.x - this.wx(a.x), p.z - this.wz(a.y)) < 2.6) {
        this.lampLit[a.i] = true;
        a.flame.visible = true;
        a.pl.intensity = 44;
        this.lamps += 1;
        this._revealAround(a.x, a.y, 5);
        this.onLamp?.(this.lamps, this.altars.length);
      }
    }

    // the wicket
    if (Math.hypot(p.x - this.wx(this.wicket[0]), p.z - this.wz(this.wicket[1])) < 1.5) {
      this._over = true;
      this.onDepth?.(this.depth + 1);
      return;
    }
    if (this._wicketGlow) this._wicketGlow.material.emissiveIntensity = 2.2 + Math.sin(this._t * 2.1) * 0.6;

    // ── the dragon ──────────────────────────────────────────────────────
    if (this._t > this._dragonWake) {
      this._pathTimer -= dt;
      if (this._pathTimer <= 0) { this._pathTimer = 0.45; this._field = this._flood(cx, cy); }
      const d = this.dragon.position;
      const [dx, dy] = this.dragonCell;
      // step downhill toward the player
      if (this._field) {
        let nb = null, nbest = this._field[dy]?.[dx] ?? Infinity;
        for (const [ax, ay] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
          const nx = dx + ax, ny = dy + ay;
          if (nx < 0 || ny < 0 || nx >= this.W || ny >= this.H || this.solid[ny][nx]) continue;
          const v = this._field[ny][nx];
          if (v >= 0 && v < nbest) { nbest = v; nb = [nx, ny]; }
        }
        const tx = this.wx(nb ? nb[0] : dx), tz = this.wz(nb ? nb[1] : dy);
        const vx = tx - d.x, vz = tz - d.z, len = Math.hypot(vx, vz);
        if (len > 0.05) {
          const step = Math.min(len, this.dragonSpeed * dt);
          d.x += vx / len * step; d.z += vz / len * step;
          this.dragon.rotation.y = Math.atan2(-vx, -vz);
        }
        if (nb && Math.hypot(d.x - tx, d.z - tz) < 0.35) this.dragonCell = nb;
      }
      d.y = 0.5 + Math.sin(this._t * 3.1) * 0.12;                    // "flying about my head"
      const near = Math.hypot(d.x - p.x, d.z - p.z);
      if (near < 1.5) { this._end('dragon'); return; }
      this.dragonNear = near;
      if (near < 11 && !warn) warn = near < 6 ? 'dragon-close' : 'dragon';
    }

    if (warn !== this._warn) { this._warn = warn; this.onWarn?.(warn); }
    this.onMap?.(this.mapState());
  }

  _end(how) {
    this._over = true;
    this.onDeath?.(how);
  }

  getSpawnState() { const p = this.walker.player; return { pos: [p.pos.x, p.pos.z], yaw: p.yaw, pitch: p.pitch }; }
  teleport() {}

  dispose() {
    this.walker?.dispose();
    this._disp.forEach(d => d?.dispose?.());
    this.scene.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        const ms = Array.isArray(o.material) ? o.material : [o.material];
        ms.forEach(m => m?.dispose?.());
      }
    });
    this.scene.clear();
  }
}
