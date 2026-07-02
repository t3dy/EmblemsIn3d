// af_vignettes.js — the fifty-one emblems of the Atalanta Fugiens, each
// enacted as a small animated vignette of primitive geometry.
//
// Every entry is a build function (ctx) → optional update(t). ctx:
//   g — the vignette's group (pivot on the dais floor, +z faces the viewer)
//   C — the Cast troupe (src/systems/Cast.js)
//   S — the render style (materials via S.mat)
//   THREE — the three.js module
//
// The vignettes are staged to read from the promenade: main actors near the
// front, scenery behind, everything within a ~3.4 m dais.

function grp(THREE, parent, x = 0, y = 0, z = 0, ry = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  parent.add(g);
  return g;
}

export const VIGNETTES = {
  // 0 — Frontispiece: the fleeing Atalanta and Hippomenes' golden apples
  0: ({ g, C, S, THREE }) => {
    const atalanta = C.figure({ h: 0.95, robe: 0xc8a060, pose: 'point' });
    atalanta.position.set(-0.5, 0, 0.3); atalanta.rotation.y = -1.2; g.add(atalanta);
    const hippomenes = C.figure({ h: 0.95, robe: 0x6a7a9a, pose: 'reach' });
    hippomenes.position.set(0.8, 0, -0.3); hippomenes.rotation.y = -1.2; g.add(hippomenes);
    const apples = [];
    for (const [x, z] of [[-1.1, 0.8], [-0.2, 1.0], [0.5, 0.6]]) {
      const a = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8),
        S.mat({ color: 0xffd24a, emissive: 0x806000, emissiveIntensity: 0.6, metalness: 0.9, roughness: 0.2 }));
      a.position.set(x, 0.09, z); a.castShadow = true; g.add(a); apples.push(a);
    }
    return (t) => { atalanta.position.y = Math.abs(Math.sin(t * 4)) * 0.06; hippomenes.position.y = Math.abs(Math.sin(t * 4 + 1)) * 0.06; };
  },
  // I — The wind carried it in its belly
  1: ({ g, C, S, THREE }) => {
    const wind = new THREE.Group();
    const wm = S.mat({ color: 0xd8dce4, roughness: 0.6, transparent: true, opacity: 0.85 });
    for (const [x, y, s] of [[0, 0, 0.5], [-0.4, -0.1, 0.34], [0.4, -0.08, 0.36]]) {
      const c = new THREE.Mesh(new THREE.SphereGeometry(s, 12, 9), wm);
      c.position.set(x, y, 0); c.castShadow = true; wind.add(c);
    }
    const child = C.figure({ h: 0.4 });
    child.position.set(0, -0.75, 0.1); wind.add(child);
    wind.position.set(0, 1.8, 0); g.add(wind);
    return (t) => { wind.position.y = 1.8 + Math.sin(t * 0.9) * 0.12; wind.position.x = Math.sin(t * 0.5) * 0.2; };
  },
  // II — Its nurse is the Earth
  2: ({ g, C }) => {
    const globe = C.props.globe(1.6); globe.position.set(-0.3, 0, -0.2); g.add(globe);
    const child = C.figure({ h: 0.5, pose: 'reach' });
    child.position.set(0.45, 0, 0.25); child.rotation.y = -0.7; g.add(child);
    const goat = C.animals.goat(0.8); goat.position.set(1.1, 0, -0.5); goat.rotation.y = 0.8; g.add(goat);
  },
  // III — The woman who washes the sheets
  3: ({ g, C, S, THREE }) => {
    const tub = C.props.tub(1.2); tub.position.set(0, 0, 0.2); g.add(tub);
    const w = C.figure({ h: 0.95, robe: 0x9ab0c0, pose: 'offer' });
    w.position.set(-0.7, 0, 0.4); w.rotation.y = 0.9; g.add(w);
    const line = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 2.2, 6), S.mat({ color: 0x6a4a2a }));
    line.rotation.z = Math.PI / 2; line.position.set(0.2, 1.5, -0.7); g.add(line);
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.9, 6, 6), S.mat({ color: 0xf0ece0, side: THREE.DoubleSide }));
    sheet.position.set(0.2, 1.04, -0.7); sheet.castShadow = true; g.add(sheet);
    return (t) => { sheet.rotation.x = Math.sin(t * 1.4) * 0.14; };
  },
  // IV — Join brother and sister with the cup of love
  4: ({ g, C }) => {
    const a = C.figure({ h: 0.95, robe: 0x8a6a9a, pose: 'offer' }); a.position.set(-0.55, 0, 0); a.rotation.y = Math.PI / 2; g.add(a);
    const b = C.figure({ h: 0.9, robe: 0xc89a7a, pose: 'offer' }); b.position.set(0.55, 0, 0); b.rotation.y = -Math.PI / 2; g.add(b);
    const cup = C.props.vessel(0.6); cup.position.set(0, 0.9, 0); g.add(cup);
    return (t) => { cup.position.y = 0.9 + Math.sin(t * 1.2) * 0.05; };
  },
  // V — The toad at the woman's breast
  5: ({ g, C }) => {
    const w = C.figure({ h: 1.0, robe: 0xb08a7a, pose: 'recline' });
    w.position.set(0, 0, 0.1); g.add(w);
    const toad = C.animals.toad(1.1); toad.position.set(0.05, 0.5, 0.12); g.add(toad);
    return (t) => { toad.scale.setScalar(1 + Math.sin(t * 2.2) * 0.04); };
  },
  // VI — Sow your gold in the white foliated earth
  6: ({ g, C, S, THREE }) => {
    const field = new THREE.Mesh(new THREE.CircleGeometry(1.3, 22), S.mat({ color: 0xe8e2d2, roughness: 0.95 }));
    field.rotation.x = -Math.PI / 2; field.position.y = 0.012; field.receiveShadow = true; g.add(field);
    const sower = C.figure({ h: 0.95, robe: 0x7a8a5a, pose: 'point' });
    sower.position.set(-0.6, 0, 0.2); sower.rotation.y = 1.0; g.add(sower);
    for (let i = 0; i < 7; i++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6),
        S.mat({ color: 0xffd24a, emissive: 0x806000, emissiveIntensity: 0.5, metalness: 0.9, roughness: 0.2 }));
      s.position.set(Math.sin(i * 2.1) * 0.8, 0.05, Math.cos(i * 1.3) * 0.7);
      s.castShadow = true; g.add(s);
    }
  },
  // VII — The young bird that falls back into the nest
  7: ({ g, C, THREE }) => {
    const tree = C.props.tree('broad', 1.1); tree.position.set(-0.3, 0, -0.4); g.add(tree);
    const nest = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.05, 8, 14), C.props.tree('broad', 0.1).children[0].material);
    nest.rotation.x = Math.PI / 2; nest.position.set(0.25, 1.5, 0.1); g.add(nest);
    const sitter = C.animals.bird(0.8); sitter.position.set(0.25, 1.5, 0.1); g.add(sitter);
    const flyer = C.animals.bird(0.8, { flying: true }); g.add(flyer);
    return (t) => {
      const k = (Math.sin(t * 1.1) + 1) / 2;
      flyer.position.set(0.25, 1.55 + k * 0.7, 0.1);
      flyer.rotation.z = Math.sin(t * 6) * 0.15;
    };
  },
  // VIII — Take the egg and pierce it with a fiery sword
  8: ({ g, C, THREE }) => {
    const egg = C.props.egg(1.4); egg.position.set(0, 0, 0.15); g.add(egg);
    const knight = C.figure({ h: 1.0, robe: 0x8a5a3a, pose: 'point' });
    knight.position.set(-0.75, 0, 0.3); knight.rotation.y = 1.1; g.add(knight);
    const sword = C.props.sword(1.1);
    sword.rotation.z = -1.0; sword.position.set(-0.35, 0.9, 0.22); g.add(sword);
    const flame = C.props.fire(0.4); flame.position.set(0.05, 0.62, 0.16); g.add(flame);
    return (t) => { sword.rotation.z = -1.0 + Math.sin(t * 2.4) * 0.12; };
  },
  // IX — The old man fixed to the tree, in the garden of dew
  9: ({ g, C, S, THREE }) => {
    const tree = C.props.tree('broad', 1.3); tree.position.set(0, 0, -0.3); g.add(tree);
    const old = C.figure({ h: 0.95, robe: 0x8a8274, pose: 'stand' });
    old.position.set(0, 0, 0.05); g.add(old);
    const dew = [];
    const dm = S.mat({ color: 0xd0e8ff, emissive: 0x4060a0, emissiveIntensity: 0.5, transparent: true, opacity: 0.8 });
    for (let i = 0; i < 8; i++) {
      const d = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 5), dm);
      g.add(d); dew.push({ d, ph: i * 0.8, x: Math.sin(i * 2.4) * 0.9, z: Math.cos(i * 1.9) * 0.7 });
    }
    return (t) => {
      for (const { d, ph, x, z } of dew) {
        const k = ((t * 0.35 + ph) % 1.6) / 1.6;
        d.position.set(x, 2.0 - k * 1.9, z);
        d.material.opacity = 0.85 - k * 0.5;
      }
    };
  },
  // X — Give fire to fire, Mercury to Mercury
  10: ({ g, C }) => {
    const fires = [];
    [[-0.8, 0.5], [0, 0.75], [0.8, 1.05]].forEach(([x, s]) => {
      const f = C.props.fire(s); f.position.set(x, 0, 0); g.add(f); fires.push(f);
    });
    const mercury = C.figure({ h: 0.95, robe: 0xc8d2da, pose: 'offer' });
    mercury.position.set(-1.3, 0, 0.6); mercury.rotation.y = 1.0; g.add(mercury);
    return (t) => fires.forEach((f, i) => { const s = 1 + Math.sin(t * 5 + i) * 0.1; f.scale.set(s, 1 / s, s); });
  },
  // XI — Make Latona white and tear up the books
  11: ({ g, C }) => {
    const latona = C.figure({ h: 1.05, robe: 0xf0ece0, pose: 'stand' });
    latona.position.set(-0.3, 0, 0); g.add(latona);
    const sage = C.figure({ h: 0.95, robe: 0x5a5a6a, pose: 'reach' });
    sage.position.set(0.65, 0, 0.25); sage.rotation.y = -0.5; g.add(sage);
    const book = C.props.book(1.4); book.position.set(0.65, 0, 0.75); g.add(book);
  },
  // XII (plate shows the same lesson from the other side)
  12: ({ g, C }) => {
    const latona = C.figure({ h: 1.05, robe: 0xf0ece0, pose: 'offer' });
    latona.position.set(0.3, 0, 0); latona.rotation.y = -0.4; g.add(latona);
    const moon = C.props.moon(1.0); moon.position.set(-0.7, 1.7, -0.3); g.add(moon);
    const book = C.props.book(1.4); book.position.set(-0.4, 0, 0.6); g.add(book);
    return (t) => { moon.rotation.y = t * 0.3; };
  },
  // XIII — The dropsical ore washed in the Jordan
  13: ({ g, C, S, THREE }) => {
    const river = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.0), S.waterMat());
    river.rotation.x = -Math.PI / 2; river.position.set(0, 0.02, 0.3); g.add(river);
    const sick = C.figure({ h: 0.95, robe: 0x9a8a6a });
    sick.scale.x = 1.5; sick.position.set(-0.3, 0.03, 0.3); g.add(sick);
    const helper = C.figure({ h: 0.95, robe: 0x6a8a9a, pose: 'offer' });
    helper.position.set(0.8, 0, -0.35); helper.rotation.y = -2.4; g.add(helper);
  },
  // XIV — The dragon that devours its own tail
  14: ({ g, C }) => {
    const o = C.animals.ouroboros(2.4); o.position.y = 0.05; g.add(o);
    return (t) => { o.rotation.y = t * 0.4; };
  },
  // XV — The work of the potter
  15: ({ g, C, THREE }) => {
    const wheel = C.props.wheel(1.1);
    wheel.rotation.x = Math.PI / 2; wheel.position.set(0, 0.5, 0.1); g.add(wheel);
    const pot = C.props.vessel(0.9); pot.position.set(0, 0.55, 0.1); g.add(pot);
    const potter = C.figure({ h: 0.95, robe: 0x8a6a4a, pose: 'offer' });
    potter.position.set(-0.8, 0, 0.35); potter.rotation.y = 1.1; g.add(potter);
    return (t) => { wheel.rotation.z = t * 1.5; pot.rotation.y = t * 1.5; };
  },
  // XVI — The winged and the wingless lion
  16: ({ g, C, S, THREE }) => {
    const l1 = C.animals.lion(1.0); l1.position.set(-0.7, 0, 0); l1.rotation.y = -Math.PI / 2.4; g.add(l1);
    const l2 = C.animals.lion(1.0); l2.position.set(0.7, 0, 0); l2.rotation.y = Math.PI / 2.4; g.add(l2);
    const wm = S.mat({ color: 0xe8e0d0, side: THREE.DoubleSide });
    for (const s of [-1, 1]) {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.6), wm);
      w.position.set(-0.7 + s * 0.18, 0.85, 0); w.rotation.z = s * 0.7; w.castShadow = true; l1.add(w);
    }
  },
  // XVII — The fourfold fire-ball
  17: ({ g, C }) => {
    const fires = [];
    [[-1.1, 0.4], [-0.35, 0.6], [0.4, 0.85], [1.15, 1.1]].forEach(([x, s]) => {
      const f = C.props.fire(s); f.position.set(x, 0, 0); g.add(f); fires.push(f);
    });
    return (t) => fires.forEach((f, i) => { const s = 1 + Math.sin(t * 4.4 + i * 1.2) * 0.12; f.scale.set(s, 1 / s, s); });
  },
  // XVIII — Fire makes fiery, gold makes golden
  18: ({ g, C, S, THREE }) => {
    const fire = C.props.fire(0.9); fire.position.set(-0.6, 0, 0); g.add(fire);
    const gold = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4),
      S.mat({ color: 0xffd24a, emissive: 0x705400, emissiveIntensity: 0.5, metalness: 1, roughness: 0.15 }));
    gold.position.set(0.6, 0.2, 0.1); gold.castShadow = true; g.add(gold);
    const iron = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.34), S.mat({ color: 0x50565e, metalness: 0.8, roughness: 0.4 }));
    iron.position.set(0.1, 0.17, 0.55); iron.castShadow = true; g.add(iron);
    return (t) => { const s = 1 + Math.sin(t * 5) * 0.1; fire.scale.set(s, 1 / s, s); };
  },
  // XIX — If you kill one of the four, all die
  19: ({ g, C }) => {
    const robes = [0x8a5a4a, 0x5a7a8a, 0x7a8a5a, 0xc8b06a];
    robes.forEach((r, i) => {
      if (i === 3) {
        const f = C.figure({ h: 0.9, robe: r, pose: 'recline' });
        f.position.set(0.3, 0, 0.6); g.add(f);
      } else {
        const f = C.figure({ h: 0.95, robe: r });
        const a = -0.6 + i * 0.6;
        f.position.set(Math.sin(a) * 0.9 - 0.1, 0, Math.cos(a) * 0.5 - 0.3);
        f.rotation.y = 0.6 - i * 0.5; g.add(f);
      }
    });
  },
  // XX — Nature teaches Nature
  20: ({ g, C }) => {
    const teacher = C.figure({ h: 1.0, robe: 0x6a8a6a, pose: 'point' });
    teacher.position.set(-0.55, 0, 0); teacher.rotation.y = Math.PI / 2.5; g.add(teacher);
    const pupil = C.figure({ h: 0.9, robe: 0x9a8a6a });
    pupil.position.set(0.55, 0, 0.1); pupil.rotation.y = -Math.PI / 2.5; g.add(pupil);
    const globe = C.props.globe(0.8); globe.position.set(0, 0, -0.5); g.add(globe);
  },
  // XXI — Circle, square, triangle, circle
  21: ({ g, C, S, THREE }) => {
    const gm = S.mat({ color: 0xc8a040, metalness: 0.6, roughness: 0.35, emissive: 0x403000, emissiveIntensity: 0.35 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.045, 8, 40), gm);
    ring.position.y = 1.2; g.add(ring);
    const sq = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 0.06), gm);
      side.position.set(0, [0.75, 0, -0.75, 0][i], 0);
      if (i % 2) { side.rotation.z = Math.PI / 2; side.position.x = i === 1 ? 0.75 : -0.75; side.position.y = 0; }
      sq.add(side);
    }
    sq.position.y = 1.2; g.add(sq);
    const tri = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.05, 3, 1, false, Math.PI), gm);
    tri.rotation.x = Math.PI / 2; tri.position.y = 1.15; g.add(tri);
    const inner = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 8, 24), gm);
    inner.position.y = 1.2; g.add(inner);
    const phil = C.figure({ h: 1.0, robe: 0x5a5a7a, pose: 'point' });
    phil.position.set(-1.15, 0, 0.6); phil.rotation.y = 0.9; g.add(phil);
    return (t) => { ring.rotation.y = Math.sin(t * 0.4) * 0.25; sq.rotation.y = Math.sin(t * 0.4) * 0.25; tri.rotation.z = Math.sin(t * 0.4) * 0.25; };
  },
  // XXII — The white lead, then woman's work
  22: ({ g, C }) => {
    const hearth = C.props.fire(0.6); hearth.position.set(0.5, 0, -0.1); g.add(hearth);
    const pot = C.props.vessel(0.8); pot.position.set(0.5, 0.35, -0.1); g.add(pot);
    const woman = C.figure({ h: 0.95, robe: 0xb0a8c0, pose: 'offer' });
    woman.position.set(-0.5, 0, 0.2); woman.rotation.y = 1.0; g.add(woman);
    const tub = C.props.tub(0.9); tub.position.set(-0.4, 0, -0.7); g.add(tub);
  },
  // XXIII — It rains gold when Pallas is born at Rhodes
  23: ({ g, C, S, THREE }) => {
    const pallas = C.figure({ h: 1.05, robe: 0xc8b06a, pose: 'reach', crowned: true });
    pallas.position.set(0, 0, 0); g.add(pallas);
    const sun = C.props.sun(0.7); sun.position.set(0.9, 2.1, -0.4); g.add(sun);
    const drops = [];
    const dm = S.mat({ color: 0xffd24a, emissive: 0x806000, emissiveIntensity: 0.8, metalness: 0.9, roughness: 0.2 });
    for (let i = 0; i < 10; i++) {
      const d = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), dm);
      g.add(d); drops.push({ d, ph: i * 0.6, x: Math.sin(i * 2.1) * 0.9, z: Math.cos(i * 1.7) * 0.6 });
    }
    return (t) => {
      sun.rotation.z = t * 0.4;
      for (const { d, ph, x, z } of drops) {
        const k = ((t * 0.5 + ph) % 1.4) / 1.4;
        d.position.set(x, 2.2 - k * 2.1, z);
      }
    };
  },
  // XXIV — The wolf devoured the king, and burned, restored him
  24: ({ g, C }) => {
    const king = C.figure({ h: 1.0, robe: 0x8a3a3a, pose: 'recline', crowned: true });
    king.position.set(-0.4, 0, 0.35); g.add(king);
    const wolf = C.animals.wolf(1.0); wolf.position.set(0.5, 0, 0.1); wolf.rotation.y = 2.2; g.add(wolf);
    const pyre = C.props.fire(0.8); pyre.position.set(0.9, 0, -0.6); g.add(pyre);
    return (t) => { const s = 1 + Math.sin(t * 4.6) * 0.1; pyre.scale.set(s, 1 / s, s); };
  },
  // XXV — The dragon dies only by brother and sister
  25: ({ g, C }) => {
    const dragon = C.animals.dragon(1.3); dragon.position.set(0, 0, -0.2); dragon.rotation.y = 0.6; g.add(dragon);
    const bro = C.figure({ h: 0.95, robe: 0x6a7a9a, pose: 'point' });
    bro.position.set(-0.85, 0, 0.5); bro.rotation.y = 0.7; g.add(bro);
    const sis = C.figure({ h: 0.9, robe: 0xc89a7a, pose: 'point' });
    sis.position.set(0.85, 0, 0.5); sis.rotation.y = -0.7; g.add(sis);
    const sword = C.props.sword(0.9); sword.rotation.z = -0.9; sword.position.set(-0.5, 0.8, 0.4); g.add(sword);
  },
  // XXVI — The Tree of Life, fruit of wisdom
  26: ({ g, C }) => {
    const tree = C.props.tree('golden', 1.4); tree.position.set(0.3, 0, -0.3); g.add(tree);
    const sapientia = C.nymph({ robe: 0xe8ddc0, h: 1.05, pose: 'offer' });
    sapientia.position.set(-0.7, 0, 0.35); sapientia.rotation.y = 0.8; g.add(sapientia);
  },
  // XXVII — The Philosophical Rose-garden
  27: ({ g, C, S, THREE }) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.2, 0.16), S.mat({ color: 0x9a8a6a, roughness: 0.95 }));
    wall.position.set(0, 0.6, -0.5); wall.castShadow = true; wall.receiveShadow = true; g.add(wall);
    const gate = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.95, 0.2), S.mat({ color: 0x3a2a18 }));
    gate.position.set(0, 0.48, -0.5); g.add(gate);
    const rm = S.mat({ color: 0xc03a4a, emissive: 0x500010, emissiveIntensity: 0.4 });
    for (let i = 0; i < 8; i++) {
      const r = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), rm);
      r.position.set(-1.1 + i * 0.31, 1.28 + Math.sin(i * 2) * 0.06, -0.5);
      r.castShadow = true; g.add(r);
    }
    const seeker = C.figure({ h: 0.95, robe: 0x5a5a7a, pose: 'reach' });
    seeker.position.set(-0.1, 0, 0.5); seeker.rotation.y = Math.PI; g.add(seeker);
  },
  // XXVIII — King Duenech in the steam-bath
  28: ({ g, C, S, THREE }) => {
    const bath = C.props.tub(1.5); bath.position.set(0, 0, 0); g.add(bath);
    const king = C.figure({ h: 0.8, robe: 0x8a3a3a, crowned: true });
    king.position.set(0, 0.3, 0); g.add(king);
    const fire = C.props.fire(0.5); fire.position.set(0.7, 0, 0.4); g.add(fire);
    const steams = [];
    const sm = S.mat({ color: 0xe8e8e8, transparent: true, opacity: 0.4 });
    for (let i = 0; i < 5; i++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), sm);
      g.add(s); steams.push({ s, ph: i * 1.1 });
    }
    return (t) => {
      for (const { s, ph } of steams) {
        const k = ((t * 0.4 + ph) % 1.8) / 1.8;
        s.position.set(Math.sin(ph * 4 + t) * 0.3, 0.7 + k * 1.2, Math.cos(ph * 3) * 0.3);
        s.material.opacity = 0.4 * (1 - k);
        s.scale.setScalar(1 + k * 1.4);
      }
    };
  },
  // XXIX — As the salamander lives in the fire
  29: ({ g, C }) => {
    const fire = C.props.fire(1.3); fire.position.set(0, 0, 0); g.add(fire);
    const sal = C.animals.salamander(1.4); sal.position.set(0, 0.1, 0.35); g.add(sal);
    return (t) => { const s = 1 + Math.sin(t * 4.2) * 0.12; fire.scale.set(s, 1 / s, s); sal.rotation.y = Math.sin(t * 0.7) * 0.4; };
  },
  // XXX — Luna is needed by Sol as the hen by the cock
  30: ({ g, C }) => {
    const sun = C.props.sun(0.6); sun.position.set(-0.7, 1.6, -0.2); g.add(sun);
    const moon = C.props.moon(0.55); moon.position.set(0.7, 1.6, -0.2); g.add(moon);
    const cock = C.animals.hen(1.0); cock.position.set(-0.5, 0, 0.4); cock.rotation.y = Math.PI / 2.5; g.add(cock);
    const hen = C.animals.hen(0.9); hen.position.set(0.5, 0, 0.4); hen.rotation.y = -Math.PI / 2.5; g.add(hen);
    return (t) => { sun.rotation.z = t * 0.4; };
  },
  // XXXI — The king swimming in the sea
  31: ({ g, C, S, THREE }) => {
    const sea = new THREE.Mesh(new THREE.CircleGeometry(1.5, 26), S.waterMat());
    sea.rotation.x = -Math.PI / 2; sea.position.y = 0.35; g.add(sea);
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.35, 0.36, 26, 1, true), S.mat({ color: 0x6a5c44, roughness: 0.9, side: THREE.DoubleSide }));
    basin.position.y = 0.18; g.add(basin);
    const king = C.figure({ h: 0.85, robe: 0x3a5a7a, pose: 'reach', crowned: true });
    king.position.set(0, -0.25, 0.2); g.add(king);
    return (t) => { king.position.y = -0.25 + Math.sin(t * 1.1) * 0.05; };
  },
  // XXXII — Like coral, the Stone hardens in air
  32: ({ g, C, S, THREE }) => {
    const sea = new THREE.Mesh(new THREE.CircleGeometry(1.4, 26), S.waterMat());
    sea.rotation.x = -Math.PI / 2; sea.position.y = 0.3; g.add(sea);
    const cm = S.mat({ color: 0xc84a4a, roughness: 0.7 });
    const coral = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const br = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.5 + (i % 3) * 0.2, 6), cm);
      br.position.set(Math.sin(i * 1.1) * 0.2, 0.3, Math.cos(i * 1.3) * 0.2);
      br.rotation.z = Math.sin(i * 2.2) * 0.5;
      br.castShadow = true; coral.add(br);
    }
    coral.position.set(0, 0.15, 0); g.add(coral);
    const fish = C.animals.fish(1.0); g.add(fish);
    return (t) => { fish.position.set(Math.sin(t * 0.8) * 0.9, 0.18, Math.cos(t * 0.8) * 0.9); fish.rotation.y = t * 0.8 + Math.PI / 2; };
  },
  // XXXIII — The hermaphrodite in darkness needs fire
  33: ({ g, C }) => {
    const h = C.figure({ h: 1.0, robe: 0x6a5a7a, pose: 'recline', twoHeaded: true });
    h.position.set(-0.2, 0, 0.2); g.add(h);
    const fire = C.props.fire(0.8); fire.position.set(0.85, 0, -0.2); g.add(fire);
    return (t) => { const s = 1 + Math.sin(t * 4.8) * 0.11; fire.scale.set(s, 1 / s, s); };
  },
  // XXXIV — Conceived in the bath, born in the air
  34: ({ g, C }) => {
    const pool = C.props.pool(1.5); g.add(pool);
    const child = C.figure({ h: 0.55 });
    g.add(child);
    return (t) => { child.position.y = 0.55 + (Math.sin(t * 0.9) + 1) * 0.35; child.rotation.y = t * 0.5; };
  },
  // XXXV — As Ceres hardened Triptolemus in the fire
  35: ({ g, C }) => {
    const fire = C.props.fire(0.9); fire.position.set(0.3, 0, 0); g.add(fire);
    const child = C.figure({ h: 0.55 }); child.position.set(0.3, 0.25, 0); g.add(child);
    const ceres = C.nymph({ robe: 0xc8b06a, h: 1.05, pose: 'offer' });
    ceres.position.set(-0.7, 0, 0.3); ceres.rotation.y = 0.9; g.add(ceres);
    return (t) => { const s = 1 + Math.sin(t * 4.4) * 0.1; fire.scale.set(s, 1 / s, s); };
  },
  // XXXVI — The Stone is cast upon the earth, found on mountains
  36: ({ g, C, S, THREE }) => {
    const mount = C.props.mount(1.6); mount.position.set(0.6, 0, -0.6); g.add(mount);
    const stone = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0),
      S.mat({ color: 0xd8c8a0, emissive: 0x504020, emissiveIntensity: 0.4, metalness: 0.4, roughness: 0.4 }));
    stone.position.set(-0.5, 0.28, 0.4); stone.castShadow = true; g.add(stone);
    return (t) => { stone.rotation.y = t * 0.6; };
  },
  // XXXVII — White smoke, the green lion, and aqua vitae
  37: ({ g, C, S, THREE }) => {
    const smoke = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.1, 10), S.mat({ color: 0xe8e8e8, transparent: true, opacity: 0.55 }));
    smoke.position.set(-0.9, 0.55, 0); g.add(smoke);
    const lion = C.animals.lion(0.9); lion.position.set(0.05, 0, 0.15);
    lion.traverse(o => { if (o.material) o.material = S.mat({ color: 0x4a8a3a, roughness: 0.8 }); });
    g.add(lion);
    const aqua = C.props.vessel(1.0); aqua.position.set(1.0, 0, 0); g.add(aqua);
    return (t) => { smoke.scale.y = 1 + Math.sin(t * 1.4) * 0.1; };
  },
  // XXXVIII — The hermaphrodite born of two mountains
  38: ({ g, C }) => {
    const m1 = C.props.mount(1.2); m1.position.set(-0.9, 0, -0.5); g.add(m1);
    const m2 = C.props.mount(1.2); m2.position.set(0.9, 0, -0.5); g.add(m2);
    const rebis = C.figure({ h: 1.1, robe: 0x8a6a9a, twoHeaded: true, pose: 'reach' });
    rebis.position.set(0, 0, 0.3); g.add(rebis);
  },
  // XXXIX — Oedipus and the Sphinx
  39: ({ g, C, S, THREE }) => {
    const sphinx = C.animals.lion(1.1); sphinx.position.set(0.55, 0, -0.1); sphinx.rotation.y = Math.PI / 2 + 0.5; g.add(sphinx);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), S.mat({ color: 0xd8c4a4, roughness: 0.6 }));
    head.position.set(0, 1.05, -0.55); head.castShadow = true; sphinx.add(head);
    const wm = S.mat({ color: 0xc8b890, side: THREE.DoubleSide });
    for (const s of [-1, 1]) {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.55), wm);
      w.position.set(s * 0.2, 0.85, 0.1); w.rotation.z = s * 0.8; sphinx.add(w);
    }
    const oedipus = C.figure({ h: 1.0, robe: 0x5a6a8a, pose: 'point' });
    oedipus.position.set(-0.75, 0, 0.35); oedipus.rotation.y = 1.0; g.add(oedipus);
  },
  // XL — Make one water out of two waters
  40: ({ g, C }) => {
    const pool = C.props.pool(1.3); pool.position.set(0, 0, 0.3); g.add(pool);
    const v1 = C.props.vessel(0.8); v1.position.set(-0.6, 0.7, -0.2); v1.rotation.z = -0.8; g.add(v1);
    const v2 = C.props.vessel(0.8); v2.position.set(0.6, 0.7, -0.2); v2.rotation.z = 0.8; g.add(v2);
    return (t) => { v1.rotation.z = -0.8 + Math.sin(t * 1.3) * 0.1; v2.rotation.z = 0.8 - Math.sin(t * 1.3) * 0.1; };
  },
  // XLI — Adonis slain by the boar; Venus and the roses
  41: ({ g, C, S, THREE }) => {
    const adonis = C.figure({ h: 0.95, robe: 0x9a8a6a, pose: 'recline' });
    adonis.position.set(0.2, 0, 0.4); g.add(adonis);
    const boar = C.animals.sow(1.0); boar.position.set(0.9, 0, -0.4); boar.rotation.y = 2.6; g.add(boar);
    const venus = C.nymph({ robe: 0xe8ddc0, h: 1.05, pose: 'reach' });
    venus.position.set(-0.8, 0, 0); venus.rotation.y = 1.2; g.add(venus);
    const rm = S.mat({ color: 0xc03a4a, emissive: 0x500010, emissiveIntensity: 0.4 });
    for (let i = 0; i < 5; i++) {
      const r = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), rm);
      r.position.set(-0.2 + Math.sin(i * 2.4) * 0.5, 0.05, 0.5 + Math.cos(i * 1.8) * 0.3);
      g.add(r);
    }
  },
  // XLII — Nature is the guide; the lantern the light of experience
  42: ({ g, C, S, THREE }) => {
    const nature = C.nymph({ robe: 0x6a8a6a, h: 1.05, pose: 'point' });
    nature.position.set(0.5, 0, -0.2); nature.rotation.y = -0.5; g.add(nature);
    const phil = C.figure({ h: 0.95, robe: 0x5a5a7a });
    phil.position.set(-0.5, 0, 0.4); phil.rotation.y = -0.5; g.add(phil);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), S.mat({ color: 0x6a4a2a }));
    post.position.set(-0.15, 0.45, 0.42); g.add(post);
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.16),
      S.mat({ color: 0xffe080, emissive: 0xc89020, emissiveIntensity: 1.0, transparent: true, opacity: 0.9 }));
    lamp.position.set(-0.15, 0.95, 0.42); g.add(lamp);
    return (t) => { lamp.material.emissiveIntensity = 1.0 + Math.sin(t * 6) * 0.2; };
  },
  // XLIII — Listen to the screech-owl; the bird-catcher
  43: ({ g, C, S, THREE }) => {
    const tree = C.props.tree('broad', 1.2); tree.position.set(0, 0, -0.4); g.add(tree);
    const owl = C.animals.bird(1.2, { color: 0x8a7a5a });
    owl.position.set(0, 1.55, 0.05); g.add(owl);
    const em = S.mat({ color: 0xffc040, emissive: 0xa06000, emissiveIntensity: 0.8 });
    for (const s of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), em);
      eye.position.set(s * 0.05, 1.82, -0.1); g.add(eye);
    }
    const b1 = C.animals.bird(0.7, { flying: true }); g.add(b1);
    const b2 = C.animals.crow(0.7); g.add(b2);
    return (t) => {
      b1.position.set(Math.sin(t * 1.2) * 0.8, 1.7 + Math.sin(t * 2.4) * 0.2, 0.5 + Math.cos(t * 1.2) * 0.4);
      b2.position.set(Math.sin(t * 1.2 + 3) * 0.8, 1.5 + Math.cos(t * 2) * 0.2, 0.5 + Math.cos(t * 1.2 + 3) * 0.4);
    };
  },
  // XLIV — Typhon slays Osiris and scatters the limbs
  44: ({ g, C, S, THREE }) => {
    const osiris = C.figure({ h: 0.95, robe: 0x3a6a5a, pose: 'recline', crowned: true });
    osiris.position.set(-0.3, 0, 0.4); g.add(osiris);
    const typhon = C.figure({ h: 1.05, robe: 0x6a3a3a, pose: 'reach' });
    typhon.position.set(0.7, 0, -0.3); typhon.rotation.y = -2.6; g.add(typhon);
    const lm = S.mat({ color: 0xd8c4a4, roughness: 0.6 });
    for (const [x, z] of [[-1.0, -0.3], [0.1, -0.7], [-0.7, 0.9]]) {
      const limb = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.3, 4, 8), lm);
      limb.position.set(x, 0.06, z); limb.rotation.z = Math.PI / 2; limb.castShadow = true; g.add(limb);
    }
    const sun = C.props.sun(0.5); sun.position.set(0.9, 1.9, -0.6); g.add(sun);
    return (t) => { sun.rotation.z = t * 0.4; };
  },
  // XLV — Sol and his shadow complete the work
  45: ({ g, C, S, THREE }) => {
    const sun = C.props.sun(0.8); sun.position.set(0, 2.0, -0.3); g.add(sun);
    const gnomon = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 1.4, 8), S.mat({ color: 0x8a7a5a }));
    gnomon.position.set(0.3, 0.7, 0); gnomon.castShadow = true; g.add(gnomon);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.28), S.mat({ color: 0x141410, roughness: 1 }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.set(-0.45, 0.015, 0.15); g.add(shadow);
    return (t) => { sun.rotation.z = t * 0.5; };
  },
  // XLVI — Two eagles, from East and West
  46: ({ g, C }) => {
    const p1 = C.props.column(0.9); p1.position.set(-0.7, 0, 0); g.add(p1);
    const p2 = C.props.column(0.9); p2.position.set(0.7, 0, 0); g.add(p2);
    const e1 = C.animals.eagle(0.9); e1.position.set(-0.7, 1.5, 0); e1.rotation.y = Math.PI / 2.6; g.add(e1);
    const e2 = C.animals.eagle(0.9); e2.position.set(0.7, 1.5, 0); e2.rotation.y = -Math.PI / 2.6; g.add(e2);
    return (t) => {
      for (const e of [e1, e2]) {
        if (e.userData.wingL) { e.userData.wingL.rotation.z = -0.5 + Math.sin(t * 5) * 0.25; e.userData.wingR.rotation.z = 0.5 - Math.sin(t * 5) * 0.25; }
      }
    };
  },
  // XLVII — The wolf from the East, the dog from the West
  47: ({ g, C }) => {
    const wolf = C.animals.wolf(1.0); wolf.position.set(-0.8, 0, 0); wolf.rotation.y = Math.PI / 2.3; g.add(wolf);
    const dog = C.animals.dog(1.1); dog.position.set(0.8, 0, 0); dog.rotation.y = -Math.PI / 2.3; g.add(dog);
    return (t) => { wolf.position.x = -0.8 + Math.sin(t * 0.9) * 0.1; dog.position.x = 0.8 - Math.sin(t * 0.9) * 0.1; };
  },
  // XLVIII — The sick king healed by the physicians' potion
  48: ({ g, C, S, THREE }) => {
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.6), S.mat({ color: 0x8a7a5a }));
    seat.position.set(0.5, 0.22, -0.2); seat.castShadow = true; g.add(seat);
    const king = C.figure({ h: 0.9, robe: 0x8a3a3a, crowned: true });
    king.position.set(0.5, 0.45, -0.2); g.add(king);
    const doctor = C.figure({ h: 0.95, robe: 0x3a5a6a, pose: 'offer' });
    doctor.position.set(-0.55, 0, 0.25); doctor.rotation.y = 1.0; g.add(doctor);
    const cup = C.props.vessel(0.5); cup.position.set(-0.2, 0.85, 0.15); g.add(cup);
  },
  // XLIX — The Philosophical Child of three fathers
  49: ({ g, C }) => {
    const child = C.figure({ h: 0.55 }); child.position.set(0, 0, 0.55); g.add(child);
    const robes = [0xc8b06a, 0x8a9ac8, 0x9a8a6a];
    robes.forEach((r, i) => {
      const f = C.figure({ h: 1.0, robe: r, pose: 'offer' });
      const a = -0.7 + i * 0.7;
      f.position.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.5 - 0.1);
      f.rotation.y = -a;
      g.add(f);
    });
    const sun = C.props.sun(0.45); sun.position.set(-0.9, 1.9, -0.5); g.add(sun);
    return (t) => { sun.rotation.z = t * 0.4; };
  },
  // L — The dragon and the woman slay one another
  50: ({ g, C, S, THREE }) => {
    const tomb = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.5, 1.0), S.mat({ color: 0x6a5c44, roughness: 0.9 }));
    tomb.position.set(0, 0.25, -0.3); tomb.castShadow = true; tomb.receiveShadow = true; g.add(tomb);
    const woman = C.figure({ h: 0.9, robe: 0xb08a7a, pose: 'recline' });
    woman.position.set(-0.1, 0.5, -0.3); g.add(woman);
    const dragon = C.animals.dragon(1.1); dragon.position.set(0.25, 0.5, -0.2); dragon.rotation.y = 2.4; g.add(dragon);
    const stone = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0),
      S.mat({ color: 0xffd24a, emissive: 0x806000, emissiveIntensity: 0.8, metalness: 0.9, roughness: 0.15 }));
    stone.position.set(0, 1.35, -0.3); stone.castShadow = true; g.add(stone);
    return (t) => { stone.rotation.y = t * 0.7; stone.position.y = 1.35 + Math.sin(t * 1.2) * 0.08; };
  },
};

// Fallback for any emblem without a bespoke vignette: the work at the furnace.
export function genericVignette({ g, C }) {
  const furnace = C.props.furnace(1.0); furnace.position.set(0.4, 0, -0.2); g.add(furnace);
  const adept = C.figure({ h: 0.95, robe: 0x5a5a6a, pose: 'offer' });
  adept.position.set(-0.6, 0, 0.3); adept.rotation.y = 0.9; g.add(adept);
  const vessel = C.props.vessel(0.8); vessel.position.set(-0.1, 0, 0.55); g.add(vessel);
  return (t) => { if (furnace.userData.fire) { const s = 1 + Math.sin(t * 5) * 0.15; furnace.userData.fire.scale.set(s, 1 / s, s); } };
}

export function buildVignette(num, ctx) {
  const fn = VIGNETTES[num] || genericVignette;
  return fn(ctx) || null;
}
