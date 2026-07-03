// Cast.js — a parametric troupe of primitive-geometry actors.
//
// Everything in the two game worlds that lives — Poliphilo's nymphs, Polia,
// Cupid, the beasts and figures of all fifty-one Atalanta Fugiens emblems —
// is composed from these builders. Each returns a THREE.Group whose pivot
// sits at the feet (y = 0) so scenes can place actors directly on the ground.
// Builders take the world's render style (src/shaders/HPStyles.js) so the
// same cast performs in the lit garden and in the 3-D woodcut.
//
// Convention: groups expose named parts via `g.userData` (e.g. armL, armR,
// head) so scenes and vignettes can animate gestures without traversing.

import * as THREE from 'three';

export function makeCast(S) {
  const mats = new Map();
  const M = (color, extra = {}) => {
    const key = color + JSON.stringify(extra);
    if (!mats.has(key)) mats.set(key, S.mat({ color, ...extra }));
    return mats.get(key);
  };
  const SKIN   = 0xd8c4a4;
  const add = (g, mesh) => { mesh.castShadow = true; mesh.receiveShadow = true; g.add(mesh); return mesh; };
  const mesh = (geo, mat, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    return m;
  };

  // ── People ────────────────────────────────────────────────────────────────

  // A human figure ~1.7 * h tall. Poses: stand | reach (arms up) | point
  // (right arm forward) | recline (lying) | sit | beckon (right arm raised).
  function figure({ h = 1, skin = SKIN, robe = null, pose = 'stand', crowned = false,
                    winged = false, twoHeaded = false, hat = null, beard = false } = {}) {
    const g = new THREE.Group();
    const sm = M(skin, { roughness: 0.6 });
    const parts = g.userData;

    if (robe != null) {
      add(g, mesh(new THREE.ConeGeometry(0.26 * h, 0.85 * h, 12), M(robe), 0, 0.425 * h));
    } else {
      for (const s of [-1, 1]) add(g, mesh(new THREE.CapsuleGeometry(0.065 * h, 0.55 * h, 4, 8), sm, s * 0.1 * h, 0.38 * h));
    }
    add(g, mesh(new THREE.CapsuleGeometry(0.16 * h, 0.5 * h, 6, 10), robe != null ? M(robe) : sm, 0, 1.05 * h));

    const heads = twoHeaded ? [-0.12, 0.12] : [0];
    for (const hx of heads) {
      const head = add(g, mesh(new THREE.SphereGeometry(0.13 * h, 12, 10), sm, hx * h, 1.52 * h));
      parts.head = head;
    }
    if (crowned) add(g, mesh(new THREE.TorusGeometry(0.11 * h, 0.028 * h, 6, 14), M(0xffd24a, { metalness: 0.9, roughness: 0.2 }), 0, 1.63 * h)).rotation.x = Math.PI / 2.3;
    if (hat === 'brim') {   // the philosopher's flat-brimmed hat of the plates
      const hm = M(0x2e2620, { roughness: 0.85 });
      add(g, mesh(new THREE.CylinderGeometry(0.2 * h, 0.2 * h, 0.02 * h, 14), hm, 0, 1.62 * h));
      add(g, mesh(new THREE.CylinderGeometry(0.085 * h, 0.1 * h, 0.11 * h, 12), hm, 0, 1.68 * h));
    } else if (hat === 'cap') {
      add(g, mesh(new THREE.SphereGeometry(0.115 * h, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M(0x5a3a2a, { roughness: 0.8 }), 0, 1.58 * h));
    }
    if (beard) {
      const b = add(g, mesh(new THREE.ConeGeometry(0.06 * h, 0.16 * h, 8), M(0xcfc4b0, { roughness: 0.9 }), 0, 1.4 * h, 0.09 * h));
      b.rotation.x = Math.PI;   // pointing down from the chin
    }

    const armGeo = new THREE.CapsuleGeometry(0.05 * h, 0.42 * h, 4, 8);
    const mkArm = (sx) => {
      const pivot = new THREE.Group();
      pivot.position.set(sx * 0.2 * h, 1.28 * h, 0);
      const a = mesh(armGeo, sm, 0, -0.24 * h, 0);
      a.castShadow = true;
      pivot.add(a);
      g.add(pivot);
      return pivot;
    };
    parts.armL = mkArm(-1);
    parts.armR = mkArm(1);
    const P = {
      stand:   [0.25, -0.25],
      reach:   [2.6, -2.6],
      point:   [0.25, -1.55],
      beckon:  [0.25, -2.3],
      offer:   [1.0, -1.0],
      recline: [1.4, -1.4],
      sit:     [0.6, -0.6],
    }[pose] || [0.25, -0.25];
    parts.armL.rotation.z = P[0];
    parts.armR.rotation.z = P[1];
    if (pose === 'point' || pose === 'beckon') parts.armR.rotation.x = pose === 'point' ? -1.2 : -0.4;

    if (winged) {
      const wg = new THREE.PlaneGeometry(0.5 * h, 0.9 * h);
      const wm = M(0xe8e0d0, { side: THREE.DoubleSide });
      for (const s of [-1, 1]) {
        const w = mesh(wg, wm, s * 0.3 * h, 1.15 * h, 0.12 * h);
        w.rotation.y = s * 0.5; w.rotation.z = s * 0.6;
        g.add(w);
        if (s < 0) parts.wingL = w; else parts.wingR = w;
      }
    }
    if (pose === 'recline') { g.rotation.z = Math.PI / 2; g.position.y = 0.22 * h; }
    return g;
  }

  // A robed nymph; `name` is remembered for labels.
  function nymph({ name = '', robe = 0xb8a0c8, h = 0.95, pose = 'stand' } = {}) {
    const g = figure({ h, robe, pose });
    add(g, mesh(new THREE.SphereGeometry(0.135 * h, 10, 8), M(0x6a4a28, { roughness: 0.85 }), 0, 1.56 * h));
    g.userData.name = name;
    return g;
  }

  // Floating name/title label (billboard sprite)
  function label(text, { sub = '', color = '#f0e4c8', scale = 1 } = {}) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = sub ? 84 : 56;
    const x = c.getContext('2d');
    x.textAlign = 'center';
    x.font = 'bold 30px Georgia';
    x.strokeStyle = 'rgba(10,8,4,0.85)'; x.lineWidth = 6; x.lineJoin = 'round';
    x.strokeText(text, 128, 36); x.fillStyle = color; x.fillText(text, 128, 36);
    if (sub) {
      x.font = '18px Georgia';
      x.strokeText(sub, 128, 66); x.fillStyle = '#c8b890'; x.fillText(sub, 128, 66);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }));
    s.scale.set(1.6 * scale, (sub ? 0.52 : 0.35) * scale, 1);
    return s;
  }

  // ── Beasts ────────────────────────────────────────────────────────────────

  function quadruped({ s = 1, color = 0x8a7a64, bulk = 1, neck = 0.18, headR = 0.14 } = {}) {
    const g = new THREE.Group();
    const bm = M(color, { roughness: 0.85 });
    const body = add(g, mesh(new THREE.SphereGeometry(0.32 * s, 14, 10), bm, 0, 0.5 * s));
    body.scale.set(1.5 * bulk, 0.85, 0.9);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
      add(g, mesh(new THREE.CylinderGeometry(0.05 * s, 0.06 * s, 0.42 * s, 8), bm, sx * 0.16 * s, 0.21 * s, sz * 0.26 * s * bulk));
    const head = add(g, mesh(new THREE.SphereGeometry(headR * s, 12, 8), bm, 0, (0.62 + neck) * s, -0.5 * s * bulk));
    g.userData.head = head;
    g.userData.mat = bm;
    return g;
  }

  const animals = {
    wolf:   (s = 1) => { const g = quadruped({ s, color: 0x7a7268 }); add(g, mesh(new THREE.ConeGeometry(0.06 * s, 0.22 * s, 6), g.userData.mat, 0, 0.78 * s, -0.62 * s)).rotation.x = -1.4; return g; },
    dog:    (s = 1) => quadruped({ s: s * 0.8, color: 0x9a8668 }),
    lion:   (s = 1) => { const g = quadruped({ s, color: 0xc09a4a, bulk: 1.15 }); const mane = mesh(new THREE.SphereGeometry(0.2 * s, 10, 8), M(0x8a6428, { roughness: 0.9 }), 0, 0.8 * s, -0.52 * s); g.add(mane); return g; },
    stag:   (s = 1) => { const g = quadruped({ s, color: 0xa08458, neck: 0.28 }); for (const sx of [-1, 1]) { const a = mesh(new THREE.ConeGeometry(0.02 * s, 0.3 * s, 5), g.userData.mat, sx * 0.08 * s, 1.05 * s, -0.5 * s); a.rotation.z = sx * 0.5; g.add(a); } return g; },
    unicorn:(s = 1) => { const g = quadruped({ s, color: 0xe8e2d4, neck: 0.28 }); const horn = mesh(new THREE.ConeGeometry(0.025 * s, 0.32 * s, 6), M(0xf4eeda), 0, 1.1 * s, -0.55 * s); horn.rotation.x = -0.9; g.add(horn); return g; },
    bull:   (s = 1) => { const g = quadruped({ s, color: 0x6a5038, bulk: 1.25 }); for (const sx of [-1, 1]) { const hn = mesh(new THREE.ConeGeometry(0.03 * s, 0.18 * s, 6), M(0xe4dcc4), sx * 0.12 * s, 0.92 * s, -0.55 * s); hn.rotation.z = sx * 1.0; g.add(hn); } return g; },
    sow:    (s = 1) => quadruped({ s: s * 0.85, color: 0xc4a090, bulk: 1.3, neck: 0.02, headR: 0.12 }),
    goat:   (s = 1) => { const g = quadruped({ s: s * 0.85, color: 0xb0a898 }); for (const sx of [-1, 1]) { const hn = mesh(new THREE.ConeGeometry(0.02 * s, 0.14 * s, 5), M(0x8a8274), sx * 0.06 * s, 0.95 * s, -0.45 * s); hn.rotation.x = 0.7; g.add(hn); } return g; },
    horse:  (s = 1) => quadruped({ s: s * 1.1, color: 0x7a5a3a, neck: 0.35 }),
    toad:   (s = 1) => {
      const g = new THREE.Group();
      const bm = M(0x5a6a2a, { roughness: 0.9 });
      const b = add(g, mesh(new THREE.SphereGeometry(0.22 * s, 12, 8), bm, 0, 0.15 * s));
      b.scale.set(1.2, 0.7, 1.1);
      for (const sx of [-1, 1]) add(g, mesh(new THREE.SphereGeometry(0.05 * s, 8, 6), M(0xffc040, { emissive: 0xa06000, emissiveIntensity: 0.8 }), sx * 0.1 * s, 0.26 * s, -0.16 * s));
      return g;
    },
    serpent: (s = 1, { coil = 0.5 } = {}) => {
      const g = new THREE.Group();
      const bm = M(0x4a6a3a, { roughness: 0.7 });
      const pts = [];
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        pts.push(new THREE.Vector3(Math.sin(t * Math.PI * 2 * coil) * 0.4 * s, 0.06 * s + t * 0.5 * s * coil, -t * 0.9 * s));
      }
      add(g, new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.055 * s, 8), bm));
      add(g, mesh(new THREE.SphereGeometry(0.08 * s, 8, 6), bm, pts[10].x, pts[10].y, pts[10].z));
      return g;
    },
    dragon: (s = 1) => {
      const g = animals.serpent(s * 1.3, { coil: 0.7 });
      const wm = M(0x3a4a2a, { side: THREE.DoubleSide });
      for (const sx of [-1, 1]) {
        const w = mesh(new THREE.PlaneGeometry(0.5 * s, 0.35 * s), wm, sx * 0.32 * s, 0.42 * s, -0.45 * s);
        w.rotation.y = sx * 0.7; w.rotation.z = sx * 0.4;
        g.add(w);
      }
      return g;
    },
    ouroboros: (s = 1) => {
      const g = new THREE.Group();
      const bm = M(0x4a6a3a, { roughness: 0.7 });
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        const seg = mesh(new THREE.CapsuleGeometry(0.05 * s, 0.16 * s, 4, 6), bm, Math.cos(a) * 0.45 * s, 0.06 * s, Math.sin(a) * 0.45 * s);
        seg.rotation.x = Math.PI / 2; seg.rotation.z = -a;
        add(g, seg);
      }
      return g;
    },
    bird: (s = 1, { color = 0xd8d0c0, flying = false } = {}) => {
      const g = new THREE.Group();
      const bm = M(color, { roughness: 0.8 });
      const b = add(g, mesh(new THREE.SphereGeometry(0.11 * s, 10, 8), bm, 0, 0.12 * s));
      b.scale.set(1, 0.85, 1.4);
      add(g, mesh(new THREE.SphereGeometry(0.06 * s, 8, 6), bm, 0, 0.2 * s, -0.15 * s));
      add(g, mesh(new THREE.ConeGeometry(0.02 * s, 0.07 * s, 5), M(0xd8a030), 0, 0.2 * s, -0.23 * s)).rotation.x = -Math.PI / 2;
      const wm = M(color, { side: THREE.DoubleSide });
      for (const sx of [-1, 1]) {
        const w = mesh(new THREE.PlaneGeometry(0.28 * s, 0.14 * s), wm, sx * 0.17 * s, 0.16 * s, 0);
        w.rotation.z = flying ? sx * 0.5 : sx * 0.15;
        g.add(w);
        if (sx < 0) g.userData.wingL = w; else g.userData.wingR = w;
      }
      return g;
    },
    eagle:  (s = 1) => animals.bird(s * 1.6, { color: 0x6a5a44, flying: true }),
    crow:   (s = 1) => animals.bird(s, { color: 0x2a2a30 }),
    swan:   (s = 1) => {
      const g = animals.bird(s * 1.2, { color: 0xf0ece0 });
      add(g, mesh(new THREE.CapsuleGeometry(0.025 * s, 0.2 * s, 4, 6), M(0xf0ece0), 0, 0.3 * s, -0.2 * s)).rotation.x = 0.5;
      return g;
    },
    hen:    (s = 1) => { const g = animals.bird(s, { color: 0xc09060 }); add(g, mesh(new THREE.ConeGeometry(0.03 * s, 0.06 * s, 5), M(0xc03020), 0, 0.29 * s, -0.13 * s)); return g; },
    fish:   (s = 1) => {
      const g = new THREE.Group();
      const bm = M(0x7a92a8, { metalness: 0.5, roughness: 0.4 });
      const b = add(g, mesh(new THREE.SphereGeometry(0.16 * s, 10, 8), bm, 0, 0.16 * s));
      b.scale.set(0.6, 0.7, 1.6);
      const tail = mesh(new THREE.ConeGeometry(0.09 * s, 0.16 * s, 6), bm, 0, 0.16 * s, 0.3 * s);
      tail.rotation.x = Math.PI / 2; g.add(tail);
      return g;
    },
    salamander: (s = 1) => {
      const g = new THREE.Group();
      const bm = M(0xd87838, { roughness: 0.7 });
      const b = add(g, mesh(new THREE.CapsuleGeometry(0.06 * s, 0.3 * s, 4, 8), bm, 0, 0.07 * s));
      b.rotation.x = Math.PI / 2;
      for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
        add(g, mesh(new THREE.CapsuleGeometry(0.02 * s, 0.1 * s, 3, 5), bm, sx * 0.08 * s, 0.04 * s, sz * 0.12 * s)).rotation.z = sx * 1.2;
      return g;
    },
  };

  // ── Props ─────────────────────────────────────────────────────────────────

  const props = {
    tree: (kind = 'broad', s = 1) => {
      const g = new THREE.Group();
      add(g, mesh(new THREE.CylinderGeometry(0.08 * s, 0.12 * s, 0.9 * s, 7), M(0x4a3416, { roughness: 0.9 }), 0, 0.45 * s));
      if (kind === 'cypress') {
        add(g, mesh(new THREE.ConeGeometry(0.4 * s, 2.2 * s, 8), M(0x264418, { roughness: 0.9 }), 0, 1.9 * s));
      } else {
        add(g, mesh(new THREE.SphereGeometry(0.62 * s, 10, 8), M(kind === 'golden' ? 0x3a4a1a : 0x2a4418, { roughness: 0.9 }), 0, 1.35 * s));
        if (kind === 'golden') for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          add(g, mesh(new THREE.SphereGeometry(0.07 * s, 8, 6), M(0xffd24a, { emissive: 0x806000, emissiveIntensity: 0.7, metalness: 0.8, roughness: 0.25 }), Math.cos(a) * 0.5 * s, 1.35 * s + Math.sin(a * 2) * 0.25 * s, Math.sin(a) * 0.5 * s));
        }
      }
      return g;
    },
    furnace: (s = 1) => {
      const g = new THREE.Group();
      const fm = M(0x7a5a44, { roughness: 0.9 });
      add(g, mesh(new THREE.CylinderGeometry(0.42 * s, 0.5 * s, 0.9 * s, 12), fm, 0, 0.45 * s));
      add(g, mesh(new THREE.SphereGeometry(0.42 * s, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), fm, 0, 0.9 * s));
      add(g, mesh(new THREE.BoxGeometry(0.22 * s, 0.26 * s, 0.1 * s), M(0x201408), 0, 0.26 * s, 0.46 * s));
      const fire = mesh(new THREE.ConeGeometry(0.1 * s, 0.2 * s, 6), M(0xff7020, { emissive: 0xff5000, emissiveIntensity: 1.2 }), 0, 0.26 * s, 0.44 * s);
      g.add(fire);
      g.userData.fire = fire;
      return g;
    },
    fire: (s = 1) => {
      const g = new THREE.Group();
      const cols = [0xff5010, 0xff8020, 0xffc040];
      cols.forEach((c, i) => {
        const f = mesh(new THREE.ConeGeometry((0.3 - i * 0.08) * s, (0.5 - i * 0.1) * s, 7), M(c, { emissive: c, emissiveIntensity: 0.9 }), 0, (0.25 + i * 0.08) * s, 0);
        g.add(f);
      });
      g.userData.flames = [...g.children];
      return g;
    },
    egg: (s = 1) => {
      const g = new THREE.Group();
      const e = add(g, mesh(new THREE.SphereGeometry(0.22 * s, 14, 10), M(0xf0e8d4, { roughness: 0.4 }), 0, 0.28 * s));
      e.scale.y = 1.3;
      return g;
    },
    sun: (s = 1) => {
      const g = new THREE.Group();
      const d = add(g, mesh(new THREE.SphereGeometry(0.3 * s, 16, 12), M(0xffd24a, { emissive: 0xc89020, emissiveIntensity: 1.0, metalness: 0.6, roughness: 0.3 }), 0, 0));
      void d;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const r = mesh(new THREE.ConeGeometry(0.04 * s, 0.22 * s, 5), M(0xffe080, { emissive: 0xa07010, emissiveIntensity: 0.8 }), Math.cos(a) * 0.42 * s, Math.sin(a) * 0.42 * s, 0);
        r.rotation.z = a - Math.PI / 2;
        g.add(r);
      }
      return g;
    },
    moon: (s = 1) => {
      const g = new THREE.Group();
      const d = add(g, mesh(new THREE.SphereGeometry(0.26 * s, 16, 12), M(0xe2e2ea, { emissive: 0x60606a, emissiveIntensity: 0.6, metalness: 0.7, roughness: 0.3 }), 0, 0));
      d.scale.z = 0.5;
      return g;
    },
    vessel: (s = 1) => {
      const g = new THREE.Group();
      const vm = M(0xa8c0c8, { transparent: true, opacity: 0.55, roughness: 0.15, metalness: 0.1 });
      add(g, mesh(new THREE.SphereGeometry(0.24 * s, 14, 10), vm, 0, 0.26 * s));
      add(g, mesh(new THREE.CylinderGeometry(0.07 * s, 0.09 * s, 0.34 * s, 10), vm, 0, 0.6 * s));
      return g;
    },
    crown: (s = 1) => {
      const g = new THREE.Group();
      const cm = M(0xffd24a, { metalness: 0.95, roughness: 0.2, emissive: 0x604800, emissiveIntensity: 0.4 });
      const t = add(g, mesh(new THREE.TorusGeometry(0.2 * s, 0.045 * s, 8, 18), cm, 0, 0.06 * s));
      t.rotation.x = Math.PI / 2;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        add(g, mesh(new THREE.ConeGeometry(0.035 * s, 0.12 * s, 5), cm, Math.cos(a) * 0.2 * s, 0.14 * s, Math.sin(a) * 0.2 * s));
      }
      return g;
    },
    tub: (s = 1) => {
      const g = new THREE.Group();
      add(g, mesh(new THREE.CylinderGeometry(0.42 * s, 0.36 * s, 0.42 * s, 14, 1, true), M(0x8a6a48, { roughness: 0.9, side: THREE.DoubleSide }), 0, 0.21 * s));
      const w = mesh(new THREE.CircleGeometry(0.4 * s, 14), S.waterMat(), 0, 0.36 * s, 0);
      w.rotation.x = -Math.PI / 2;
      g.add(w);
      return g;
    },
    well: (s = 1) => {
      const g = new THREE.Group();
      add(g, mesh(new THREE.CylinderGeometry(0.4 * s, 0.44 * s, 0.5 * s, 12, 1, true), M(0x8a7a5a, { roughness: 0.9, side: THREE.DoubleSide }), 0, 0.25 * s));
      const w = mesh(new THREE.CircleGeometry(0.38 * s, 12), S.waterMat(), 0, 0.42 * s, 0);
      w.rotation.x = -Math.PI / 2;
      g.add(w);
      return g;
    },
    sword: (s = 1) => {
      const g = new THREE.Group();
      add(g, mesh(new THREE.BoxGeometry(0.05 * s, 0.7 * s, 0.015 * s), M(0xc8d2da, { metalness: 0.9, roughness: 0.2 }), 0, 0.5 * s));
      add(g, mesh(new THREE.BoxGeometry(0.2 * s, 0.04 * s, 0.04 * s), M(0x8a6a2a, { metalness: 0.7 }), 0, 0.18 * s));
      return g;
    },
    hammer: (s = 1) => {
      const g = new THREE.Group();
      add(g, mesh(new THREE.CylinderGeometry(0.02 * s, 0.02 * s, 0.4 * s, 8), M(0x6a4a2a), 0, 0.2 * s));
      add(g, mesh(new THREE.BoxGeometry(0.16 * s, 0.08 * s, 0.08 * s), M(0x707880, { metalness: 0.8, roughness: 0.35 }), 0, 0.4 * s));
      return g;
    },
    anvil: (s = 1) => {
      const g = new THREE.Group();
      add(g, mesh(new THREE.BoxGeometry(0.3 * s, 0.22 * s, 0.2 * s), M(0x50565e, { metalness: 0.8, roughness: 0.4 }), 0, 0.31 * s));
      add(g, mesh(new THREE.BoxGeometry(0.2 * s, 0.2 * s, 0.16 * s), M(0x6a5a44), 0, 0.1 * s));
      return g;
    },
    globe: (s = 1) => {
      const g = new THREE.Group();
      add(g, mesh(new THREE.SphereGeometry(0.3 * s, 16, 12), M(0x4a6a4a, { roughness: 0.8 }), 0, 0.3 * s));
      return g;
    },
    mount: (s = 1) => {
      const g = new THREE.Group();
      add(g, mesh(new THREE.ConeGeometry(0.7 * s, 1.0 * s, 7), M(0x6a5c48, { roughness: 0.95 }), 0, 0.5 * s));
      return g;
    },
    star: (s = 1) => {
      const g = new THREE.Group();
      add(g, mesh(new THREE.OctahedronGeometry(0.12 * s, 0), M(0xfff0b0, { emissive: 0xb09030, emissiveIntensity: 1.0 }), 0, 0));
      return g;
    },
    wheel: (s = 1) => {
      const g = new THREE.Group();
      const wm = M(0x6a4a2a, { roughness: 0.85 });
      const t = add(g, mesh(new THREE.TorusGeometry(0.3 * s, 0.04 * s, 8, 18), wm, 0, 0.3 * s));
      void t;
      for (let i = 0; i < 4; i++) {
        const sp = mesh(new THREE.CylinderGeometry(0.02 * s, 0.02 * s, 0.56 * s, 6), wm, 0, 0.3 * s, 0);
        sp.rotation.z = (i / 4) * Math.PI;
        g.add(sp);
      }
      return g;
    },
    ladder: (s = 1) => {
      const g = new THREE.Group();
      const lm = M(0x6a4a2a);
      for (const sx of [-1, 1]) add(g, mesh(new THREE.CylinderGeometry(0.025 * s, 0.025 * s, 1.6 * s, 6), lm, sx * 0.14 * s, 0.8 * s));
      for (let i = 0; i < 5; i++) add(g, mesh(new THREE.CylinderGeometry(0.018 * s, 0.018 * s, 0.28 * s, 6), lm, 0, (0.2 + i * 0.3) * s, 0)).rotation.z = Math.PI / 2;
      return g;
    },
    scales: (s = 1) => {
      const g = new THREE.Group();
      const sm2 = M(0xb8a040, { metalness: 0.8, roughness: 0.3 });
      add(g, mesh(new THREE.CylinderGeometry(0.02 * s, 0.03 * s, 0.7 * s, 8), sm2, 0, 0.35 * s));
      add(g, mesh(new THREE.CylinderGeometry(0.015 * s, 0.015 * s, 0.6 * s, 6), sm2, 0, 0.7 * s)).rotation.z = Math.PI / 2;
      for (const sx of [-1, 1]) {
        const pan = mesh(new THREE.CylinderGeometry(0.09 * s, 0.06 * s, 0.03 * s, 10), sm2, sx * 0.3 * s, 0.55 * s, 0);
        g.add(pan);
      }
      return g;
    },
    book: (s = 1) => {
      const g = new THREE.Group();
      for (const sx of [-1, 1]) {
        const p = mesh(new THREE.BoxGeometry(0.24 * s, 0.02 * s, 0.32 * s), M(0xe8dfc8, { roughness: 0.9 }), sx * 0.115 * s, 0.05 * s, 0);
        p.rotation.z = sx * -0.18;
        add(g, p);
      }
      return g;
    },
    chariot: (s = 1, { color = 0xa08040 } = {}) => {
      const g = new THREE.Group();
      const cm = M(color, { roughness: 0.7, metalness: 0.3 });
      add(g, mesh(new THREE.BoxGeometry(1.3 * s, 0.18 * s, 2.0 * s), cm, 0, 0.5 * s));
      add(g, mesh(new THREE.BoxGeometry(1.3 * s, 0.4 * s, 0.12 * s), cm, 0, 0.78 * s, 0.95 * s));
      for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        const w = props.wheel(s * 1.1);
        w.position.set(sx * 0.72 * s, 0.03 * s, sz * 0.7 * s);
        w.rotation.y = Math.PI / 2;
        g.add(w);
      }
      return g;
    },
    boat: (s = 1) => {
      const g = new THREE.Group();
      const hm = M(0x6a4a2a, { roughness: 0.85 });
      const hull = add(g, mesh(new THREE.SphereGeometry(0.8 * s, 14, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), hm, 0, 0.55 * s));
      hull.scale.set(0.55, 0.6, 1.6);
      add(g, mesh(new THREE.CylinderGeometry(0.035 * s, 0.045 * s, 1.7 * s, 8), hm, 0, 1.3 * s));
      const sail = mesh(new THREE.PlaneGeometry(0.9 * s, 1.0 * s), M(0xf0e8d4, { side: THREE.DoubleSide }), 0.0, 1.5 * s, 0.02 * s);
      g.add(sail);
      g.userData.sail = sail;
      return g;
    },
    tower: (s = 1) => {
      const g = new THREE.Group();
      add(g, mesh(new THREE.CylinderGeometry(0.35 * s, 0.4 * s, 1.6 * s, 10), M(0x9a8a6a, { roughness: 0.9 }), 0, 0.8 * s));
      add(g, mesh(new THREE.ConeGeometry(0.42 * s, 0.5 * s, 10), M(0x7a4a2a), 0, 1.85 * s));
      return g;
    },
    wall: (s = 1) => {
      const g = new THREE.Group();
      add(g, mesh(new THREE.BoxGeometry(1.6 * s, 1.0 * s, 0.18 * s), M(0x9a8a6a, { roughness: 0.95 }), 0, 0.5 * s));
      return g;
    },
    column: (s = 1) => {
      const g = new THREE.Group();
      const cm = M(0x8a7a5a, { roughness: 0.85 });
      add(g, mesh(new THREE.BoxGeometry(0.36 * s, 0.1 * s, 0.36 * s), cm, 0, 0.05 * s));
      add(g, mesh(new THREE.CylinderGeometry(0.11 * s, 0.13 * s, 1.5 * s, 12), cm, 0, 0.85 * s));
      add(g, mesh(new THREE.BoxGeometry(0.34 * s, 0.12 * s, 0.34 * s), cm, 0, 1.66 * s));
      return g;
    },
    // Giant dividers — the philosopher's compasses of Emblem XXI / the Rebis
    compasses: (s = 1) => {
      const g = new THREE.Group();
      const cm = M(0x8a8a92, { metalness: 0.8, roughness: 0.35 });
      for (const sx of [-1, 1]) {
        const leg = mesh(new THREE.CylinderGeometry(0.016 * s, 0.028 * s, 1.1 * s, 8), cm, sx * 0.19 * s, 0.55 * s, 0);
        leg.rotation.z = sx * 0.35;
        add(g, leg);
      }
      add(g, mesh(new THREE.SphereGeometry(0.05 * s, 10, 8), cm, 0, 1.06 * s));
      return g;
    },
    bed: (s = 1) => {
      const g = new THREE.Group();
      const wood = M(0x5a3a22, { roughness: 0.85 });
      add(g, mesh(new THREE.BoxGeometry(1.9 * s, 0.16 * s, 0.9 * s), wood, 0, 0.3 * s));
      add(g, mesh(new THREE.BoxGeometry(0.14 * s, 0.75 * s, 0.9 * s), wood, -0.95 * s, 0.5 * s));
      for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
        add(g, mesh(new THREE.CylinderGeometry(0.04 * s, 0.05 * s, 0.3 * s, 8), wood, sx * 0.88 * s, 0.15 * s, sz * 0.38 * s));
      add(g, mesh(new THREE.BoxGeometry(1.8 * s, 0.1 * s, 0.82 * s), M(0xe8dcc2, { roughness: 0.95 }), 0.03 * s, 0.42 * s));
      add(g, mesh(new THREE.BoxGeometry(0.4 * s, 0.1 * s, 0.6 * s), M(0xf2ead6, { roughness: 0.95 }), -0.68 * s, 0.5 * s));
      return g;
    },
    table: (s = 1) => {
      const g = new THREE.Group();
      const wood = M(0x6a4a2c, { roughness: 0.85 });
      add(g, mesh(new THREE.BoxGeometry(1.3 * s, 0.08 * s, 0.8 * s), wood, 0, 0.62 * s));
      for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
        add(g, mesh(new THREE.BoxGeometry(0.07 * s, 0.6 * s, 0.07 * s), wood, sx * 0.56 * s, 0.3 * s, sz * 0.32 * s));
      return g;
    },
    // Distant town skyline — Merian's horizon, pale with aerial perspective
    town: (s = 1) => {
      const g = new THREE.Group();
      const pale = M(0x8e94a0, { roughness: 0.9 });
      const roof = M(0x7a7484, { roughness: 0.9 });
      const blocks = [[-0.5, 0.16, 0.1], [-0.25, 0.24, 0.12], [0, 0.14, 0.16], [0.22, 0.3, 0.1], [0.46, 0.18, 0.12]];
      for (const [x, h, w] of blocks) {
        add(g, mesh(new THREE.BoxGeometry(w * s, h * s, 0.08 * s), pale, x * s, h * s / 2, 0));
      }
      add(g, mesh(new THREE.ConeGeometry(0.045 * s, 0.16 * s, 6), roof, -0.25 * s, 0.32 * s, 0));
      add(g, mesh(new THREE.ConeGeometry(0.04 * s, 0.2 * s, 6), roof, 0.22 * s, 0.4 * s, 0));
      return g;
    },
    hill: (s = 1, color = 0x55644e) => {
      const g = new THREE.Group();
      const h = add(g, mesh(new THREE.SphereGeometry(0.7 * s, 14, 8), M(color, { roughness: 0.98 }), 0, 0));
      h.scale.set(1.6, 0.42, 0.8);
      return g;
    },
    cloud: (s = 1) => {
      const g = new THREE.Group();
      const cm = M(0xd8dce4, { roughness: 0.7 });
      for (const [x, y, r] of [[0, 0, 0.2], [-0.22, -0.04, 0.14], [0.22, -0.03, 0.15]]) {
        const c = mesh(new THREE.SphereGeometry(r * s, 10, 7), cm, x * s, y * s, 0);
        c.scale.y = 0.6;
        g.add(c);
      }
      return g;
    },
    ship: (s = 1) => {
      const g = new THREE.Group();
      const hm = M(0x4a3826, { roughness: 0.9 });
      const hull = add(g, mesh(new THREE.SphereGeometry(0.22 * s, 10, 7, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), hm, 0, 0.16 * s));
      hull.scale.set(0.5, 0.7, 1.5);
      add(g, mesh(new THREE.CylinderGeometry(0.012 * s, 0.015 * s, 0.42 * s, 6), hm, 0, 0.36 * s));
      const sail = mesh(new THREE.PlaneGeometry(0.22 * s, 0.26 * s), M(0xe4dcc8, { side: THREE.DoubleSide }), 0, 0.42 * s, 0.01 * s);
      g.add(sail);
      return g;
    },
    // An open grave: raised stone rim around a dark pit (Emblem L)
    grave: (s = 1) => {
      const g = new THREE.Group();
      const stone = M(0x7a7266, { roughness: 0.9 });
      add(g, mesh(new THREE.BoxGeometry(1.9 * s, 0.22 * s, 0.18 * s), stone, 0, 0.11 * s, -0.55 * s));
      add(g, mesh(new THREE.BoxGeometry(1.9 * s, 0.22 * s, 0.18 * s), stone, 0, 0.11 * s, 0.55 * s));
      add(g, mesh(new THREE.BoxGeometry(0.18 * s, 0.22 * s, 0.95 * s), stone, -0.86 * s, 0.11 * s, 0));
      add(g, mesh(new THREE.BoxGeometry(0.18 * s, 0.22 * s, 0.95 * s), stone, 0.86 * s, 0.11 * s, 0));
      const pit = mesh(new THREE.BoxGeometry(1.55 * s, 0.04 * s, 0.92 * s), M(0x14100c, { roughness: 1 }), 0, 0.03 * s, 0);
      g.add(pit);
      return g;
    },
    pool: (s = 1) => {
      const g = new THREE.Group();
      const rim = add(g, mesh(new THREE.TorusGeometry(0.6 * s, 0.06 * s, 8, 22), M(0x8a7a5a), 0, 0.08 * s));
      rim.rotation.x = Math.PI / 2;
      const w = mesh(new THREE.CircleGeometry(0.58 * s, 22), S.waterMat(), 0, 0.06 * s, 0);
      w.rotation.x = -Math.PI / 2;
      g.add(w);
      return g;
    },
  };

  return { figure, nymph, label, animal: (kind, s, opts) => (animals[kind] || animals.bird)(s, opts), prop: (kind, s, opts) => (props[kind] || props.tree)(kind in props ? s : 'broad', opts), animals, props };
}
