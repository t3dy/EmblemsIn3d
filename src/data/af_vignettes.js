// af_vignettes.js — the fifty-one emblems of the Atalanta Fugiens, each
// realised as a small 3-D diorama of its Merian engraving (Frankfurt, 1617).
//
// What makes a Merian plate read as a Merian plate, and how each device is
// translated here:
//
//   · STAGED SCENES, not floating objects — every plate has a foreground
//     action strip, a middle ground of terrain, and a deep background: a pale
//     town skyline with spires, rolling hills, clouds, often a rayed sun.
//     → stage() builds a low diorama backdrop (meadow / interior / sea) kept
//       under ~1.3 m so the real plate stays visible above the model.
//   · AERIAL PERSPECTIVE — distant things are smaller AND paler.
//     → background props are half-scale and desaturated blue-grey.
//   · SYMBOLIC SCALE — the emblematic object is oversized: the egg of VIII is
//     knee-high, the toad of V covers the woman's chest, the ouroboros fills
//     the frame. → central motifs are deliberately too big.
//   · TWO-TIME NARRATIVE — plates like XXIV show the act in front and its
//     consequence behind at half scale. → mini "afterward" groups at the back.
//   · PERIOD SILHOUETTES — bearded philosophers in flat-brimmed hats, crowned
//     kings, robed women, posed 3/4 toward the viewer.
//   · ICONIC ATTRIBUTES — XXI's giant compasses at the wall-diagram, XLVIII's
//     physician holding the flask to the light, the Rebis with square and
//     compasses.
//
// Every entry is a build function (ctx) → optional update(t). ctx:
//   g — the vignette group (pivot on the dais floor, +z faces the viewer)
//   C — the Cast troupe · S — render style · THREE — three.js

// ── The stage: a diorama backdrop in the Merian manner ──────────────────────

let _tileTex = null;
function tileTexture(THREE) {
  if (_tileTex) return _tileTex;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
    x.fillStyle = (i + j) % 2 ? '#c9b492' : '#6a5844';
    x.fillRect(i * 32, j * 32, 32, 32);
  }
  _tileTex = new THREE.CanvasTexture(c);
  _tileTex.colorSpace = THREE.SRGBColorSpace;
  return _tileTex;
}

// stage(ctx, opts) — plants the backdrop; actors go on top afterwards.
//  type: 'meadow' | 'interior' | 'sea'
//  sun/moon: rayed disc top corner · town: pale skyline · treeAt: x or null
function stage({ g, C, S, THREE }, {
  type = 'meadow', sun = false, moon = false, town = true,
  treeAt = null, clouds = 1, water = null,
} = {}) {
  const B = -1.45;                    // backdrop line (local z)
  if (type === 'meadow') {
    const apron = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.0),
      S.mat({ color: 0x3d4a2c, roughness: 0.98 }));
    apron.rotation.x = -Math.PI / 2;
    apron.position.set(0, 0.012, -0.25);
    apron.receiveShadow = true;
    g.add(apron);
    const h1 = C.props.hill(1.1); h1.position.set(-0.9, 0.02, B); g.add(h1);
    const h2 = C.props.hill(0.9, 0x5e6a58); h2.position.set(0.95, 0.02, B - 0.1); g.add(h2);
    if (town) { const t = C.props.town(1.15); t.position.set(0.15, 0.26, B - 0.05); g.add(t); }
  } else if (type === 'interior') {
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.6),
      new THREE.MeshStandardMaterial({ map: tileTexture(THREE), roughness: 0.9 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0.012, -0.2);
    floor.receiveShadow = true;
    g.add(floor);
    const plaster = S.mat({ color: 0x9a8c74, roughness: 0.95 });
    const back = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.3, 0.1), plaster);
    back.position.set(0, 0.65, B); back.castShadow = true; back.receiveShadow = true; g.add(back);
    for (const sx of [-1, 1]) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.3, 0.9), plaster);
      side.position.set(sx * 1.65, 0.65, B + 0.5); side.castShadow = true; g.add(side);
    }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.1, 0.14), S.mat({ color: 0x4a3826, roughness: 0.9 }));
    beam.position.set(0, 1.35, B); g.add(beam);
    // a window of sky in the back wall — every Merian interior looks out
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.5),
      S.mat({ color: 0x9ab0c8, emissive: 0x40587a, emissiveIntensity: 0.5 }));
    win.position.set(0.95, 0.78, B + 0.06); g.add(win);
    const mull = S.mat({ color: 0x4a3826 });
    const mv = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.5, 0.03), mull); mv.position.set(0.95, 0.78, B + 0.08); g.add(mv);
    const mh = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.035, 0.03), mull); mh.position.set(0.95, 0.78, B + 0.08); g.add(mh);
  } else if (type === 'sea') {
    const seaPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.6, water?.depth ?? 2.0), S.waterMat());
    seaPlane.rotation.x = -Math.PI / 2;
    seaPlane.position.set(0, 0.04, (water?.z ?? -0.7));
    g.add(seaPlane);
    const sand = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.0), S.mat({ color: 0x9a8a64, roughness: 0.95 }));
    sand.rotation.x = -Math.PI / 2;
    sand.position.set(0, 0.014, 0.75);
    sand.receiveShadow = true;
    g.add(sand);
    const far = C.props.hill(0.9, 0x6a7484); far.position.set(-0.9, 0.02, B - 0.15); g.add(far);
    if (town) { const t = C.props.town(0.9); t.position.set(-0.9, 0.2, B - 0.1); g.add(t); }
  }
  if (treeAt != null) { const tr = C.props.tree('broad', 0.95); tr.position.set(treeAt, 0, B + 0.35); g.add(tr); }
  for (let i = 0; i < clouds; i++) {
    const cl = C.props.cloud(0.9 + i * 0.3);
    cl.position.set(-1.2 + i * 1.6, 2.0 + (i % 2) * 0.3, B - 0.2);
    g.add(cl);
  }
  if (sun) { const s2 = C.props.sun(0.42); s2.position.set(1.35, 2.25, B - 0.25); g.add(s2); g.userData._sun = s2; }
  if (moon) { const m2 = C.props.moon(0.4); m2.position.set(-1.35, 2.2, B - 0.25); g.add(m2); }
  return (t) => { if (g.userData._sun) g.userData._sun.rotation.z = t * 0.3; };
}

// Combine the stage's idle motion with a vignette's own update
function seq(...fns) {
  const fs = fns.filter(Boolean);
  return fs.length ? (t) => fs.forEach(f => f(t)) : null;
}

export const VIGNETTES = {
  // 0 — Frontispiece: Atalanta flees, Hippomenes follows, the golden apples fall
  0: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { sun: true, treeAt: -1.35 });
    const atalanta = C.figure({ h: 1.0, robe: 0xc8a060, pose: 'point' });
    atalanta.position.set(-0.55, 0, 0.35); atalanta.rotation.y = -1.25; atalanta.rotation.x = 0.1; g.add(atalanta);
    const hippomenes = C.figure({ h: 1.0, robe: 0x6a7a9a, pose: 'reach', hat: 'cap' });
    hippomenes.position.set(0.75, 0, -0.15); hippomenes.rotation.y = -1.25; hippomenes.rotation.x = 0.12; g.add(hippomenes);
    for (const [x, z] of [[-1.15, 0.75], [-0.25, 0.95], [0.4, 0.55]]) {
      const a = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8),
        S.mat({ color: 0xffd24a, emissive: 0x806000, emissiveIntensity: 0.6, metalness: 0.9, roughness: 0.2 }));
      a.position.set(x, 0.1, z); a.castShadow = true; g.add(a);
    }
    return seq(st, (t) => {
      atalanta.position.y = Math.abs(Math.sin(t * 4)) * 0.07;
      hippomenes.position.y = Math.abs(Math.sin(t * 4 + 1.4)) * 0.07;
    });
  },
  // I — The wind carried it in its belly: Boreas huge, the embryo visible within
  1: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { clouds: 2, town: true });
    const boreas = C.figure({ h: 1.55, skin: 0xcfd4dc, beard: true });
    boreas.position.set(0, 0, -0.35); g.add(boreas);
    // the transparent belly, a child curled inside — the plate's device
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12),
      S.mat({ color: 0xdce4ec, transparent: true, opacity: 0.4, roughness: 0.25 }));
    belly.position.set(0, 1.28, -0.12); g.add(belly);
    const child = C.figure({ h: 0.34 });
    child.position.set(0, 1.05, -0.1); child.rotation.z = 0.5; g.add(child);
    const wm = S.mat({ color: 0xe8ecf2, transparent: true, opacity: 0.5 });
    for (const sx of [-1, 1]) {
      const pts = [];
      for (let i = 0; i <= 8; i++) pts.push(new THREE.Vector3(sx * (0.5 + i * 0.12), 1.5 + Math.sin(i * 0.9) * 0.1, -0.2));
      const gust = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.022, 6), wm);
      g.add(gust);
    }
    return seq(st, (t) => { belly.scale.setScalar(1 + Math.sin(t * 1.4) * 0.04); });
  },
  // II — Its nurse is the Earth; behind, the she-wolf and the goat give suck
  2: (ctx) => {
    const { g, C } = ctx;
    const st = stage(ctx, { sun: true });
    const mound = C.props.hill(0.8, 0x4a5a38); mound.position.set(0, 0.05, 0.15); g.add(mound);
    const earth = C.figure({ h: 1.05, robe: 0x6a7a4a, pose: 'offer' });
    earth.position.set(-0.15, 0.28, 0.15); g.add(earth);
    const child = C.figure({ h: 0.42 });
    child.position.set(0.28, 0.3, 0.32); child.rotation.y = -0.9; g.add(child);
    // two-time background, half scale and pale
    const wolf = C.animals.wolf(0.55); wolf.position.set(-1.15, 0, -1.0); wolf.rotation.y = 0.6; g.add(wolf);
    const t1 = C.figure({ h: 0.2 }); t1.position.set(-1.0, 0, -0.85); g.add(t1);
    const t2 = C.figure({ h: 0.2 }); t2.position.set(-1.25, 0, -0.8); g.add(t2);
    const goat = C.animals.goat(0.6); goat.position.set(1.15, 0, -1.0); goat.rotation.y = -0.6; g.add(goat);
    const t3 = C.figure({ h: 0.2 }); t3.position.set(1.0, 0, -0.82); g.add(t3);
    return st;
  },
  // III — The washerwoman: tub, kettle on the fire, linen on the line
  3: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { town: true, treeAt: 1.35 });
    const tub = C.props.tub(1.25); tub.position.set(0.1, 0, 0.35); g.add(tub);
    const w = C.figure({ h: 1.0, robe: 0x9ab0c0, pose: 'offer' });
    w.position.set(-0.65, 0, 0.5); w.rotation.y = 1.0; w.rotation.x = 0.22; g.add(w);
    const fire = C.props.fire(0.5); fire.position.set(0.95, 0, 0.35); g.add(fire);
    const kettle = C.props.vessel(0.7); kettle.position.set(0.95, 0.3, 0.35); g.add(kettle);
    const line = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 2.4, 6), S.mat({ color: 0x6a4a2a }));
    line.rotation.z = Math.PI / 2; line.position.set(-0.3, 1.55, -0.8); g.add(line);
    const sheets = [];
    for (const x of [-0.9, 0.1]) {
      const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.85, 5, 5),
        S.mat({ color: 0xf0ece0, side: THREE.DoubleSide }));
      sheet.position.set(x, 1.12, -0.8); sheet.castShadow = true; g.add(sheet); sheets.push(sheet);
    }
    return seq(st, (t) => sheets.forEach((sh, i) => { sh.rotation.x = Math.sin(t * 1.3 + i) * 0.16; }));
  },
  // IV — The elder joins brother and sister with the cup of love
  4: (ctx) => {
    const { g, C } = ctx;
    const st = stage(ctx, { sun: true, treeAt: -1.35 });
    const bro = C.figure({ h: 1.0, robe: 0x6a7a9a, pose: 'offer', hat: 'cap' });
    bro.position.set(-0.42, 0, 0.25); bro.rotation.y = Math.PI / 2.6; bro.rotation.x = 0.06; g.add(bro);
    const sis = C.figure({ h: 0.95, robe: 0xc89a7a, pose: 'offer' });
    sis.position.set(0.42, 0, 0.25); sis.rotation.y = -Math.PI / 2.6; sis.rotation.x = 0.06; g.add(sis);
    const elder = C.figure({ h: 1.05, robe: 0x5a4a6a, pose: 'point', beard: true, hat: 'brim' });
    elder.position.set(0, 0, -0.65); g.add(elder);
    const cup = C.props.vessel(0.55); cup.position.set(0, 1.0, 0.1); g.add(cup);
    return seq(st, (t) => { cup.position.y = 1.0 + Math.sin(t * 1.2) * 0.05; });
  },
  // V — The toad, huge, at the woman's breast; the man who set it there
  5: (ctx) => {
    const { g, C } = ctx;
    const st = stage(ctx, { type: 'interior' });
    const bed = C.props.bed(1.1); bed.position.set(0.1, 0, -0.15); g.add(bed);
    const w = C.figure({ h: 0.95, robe: 0xb08a7a, pose: 'recline' });
    w.position.set(0.25, 0.5, -0.15); g.add(w);
    const toad = C.animals.toad(1.25);                      // symbolic scale
    toad.position.set(0.12, 0.66, -0.08); g.add(toad);
    const man = C.figure({ h: 1.0, robe: 0x4a5a48, pose: 'point', beard: true, hat: 'brim' });
    man.position.set(-1.0, 0, 0.35); man.rotation.y = 0.9; g.add(man);
    return seq(st, (t) => { toad.scale.setScalar(1.25 * (1 + Math.sin(t * 2.2) * 0.03)); });
  },
  // VI — Sow your gold in the white foliated earth: furrows, sower, sun
  6: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { sun: true, town: true });
    const fm = S.mat({ color: 0xe6e0d0, roughness: 0.97 });
    for (let i = 0; i < 6; i++) {
      const ridge = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 2.2, 4, 8), fm);
      ridge.rotation.z = Math.PI / 2;
      ridge.position.set(0.1, 0.06, 0.75 - i * 0.28);
      ridge.castShadow = true; ridge.receiveShadow = true;
      g.add(ridge);
    }
    const sower = C.figure({ h: 1.0, robe: 0x7a8a5a, pose: 'point', hat: 'cap' });
    sower.position.set(-1.05, 0, 0.55); sower.rotation.y = 1.15; sower.rotation.x = 0.1; g.add(sower);
    for (let i = 0; i < 8; i++) {
      const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6),
        S.mat({ color: 0xffd24a, emissive: 0x806000, emissiveIntensity: 0.6, metalness: 0.9, roughness: 0.2 }));
      s2.position.set(-0.6 + (i % 4) * 0.42, 0.16, 0.62 - Math.floor(i / 4) * 0.3);
      s2.castShadow = true; g.add(s2);
    }
    return st;
  },
  // VII — The fledgling flies from the nest and falls back
  7: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { sun: true, town: true });
    const tree = C.props.tree('broad', 1.0); tree.position.set(-0.95, 0, -0.6); g.add(tree);
    const nest = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.05, 8, 14), S.mat({ color: 0x5a4426, roughness: 0.95 }));
    nest.rotation.x = Math.PI / 2; nest.position.set(-0.42, 1.35, -0.35); g.add(nest);
    const sitter = C.animals.bird(0.85); sitter.position.set(-0.42, 1.36, -0.35); g.add(sitter);
    const flyer = C.animals.bird(0.85, { flying: true }); g.add(flyer);
    return seq(st, (t) => {
      const k = (Math.sin(t * 1.1) + 1) / 2;
      flyer.position.set(-0.42 + k * 0.3, 1.42 + k * 0.75, -0.3);
      flyer.rotation.z = Math.sin(t * 6) * 0.18;
    });
  },
  // VIII — The knee-high egg on the table; the warrior's fiery sword falls
  8: (ctx) => {
    const { g, C } = ctx;
    const st = stage(ctx, { type: 'interior' });
    const table = C.props.table(1.15); table.position.set(0.25, 0, -0.2); g.add(table);
    const egg = C.props.egg(2.3);                            // symbolic scale
    egg.position.set(0.25, 0.72, -0.2); g.add(egg);
    const knight = C.figure({ h: 1.05, robe: 0x8a5a3a, pose: 'reach', hat: 'cap' });
    knight.position.set(-0.75, 0, 0.35); knight.rotation.y = 0.85; g.add(knight);
    const sword = C.props.sword(1.25);
    sword.position.set(-0.35, 1.15, 0.1); g.add(sword);
    const flame = C.props.fire(0.42); g.add(flame);
    return seq(st, (t) => {
      const swing = -1.5 + Math.sin(t * 1.6) * 0.5;
      sword.rotation.z = swing;
      flame.position.set(-0.35 - Math.sin(swing) * 0.85, 1.15 + Math.cos(swing) * 0.85, 0.1);
    });
  },
  // IX — The old man shut in the dewy, walled garden with the tree
  9: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { town: true, clouds: 2 });
    const wallMat = S.mat({ color: 0x9a8a6a, roughness: 0.95 });
    const put = (w, x, z, ry = 0) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.6, 0.12), wallMat);
      m.position.set(x, 0.3, z); m.rotation.y = ry; m.castShadow = true; m.receiveShadow = true; g.add(m);
    };
    put(2.3, 0, -0.95); put(1.5, -1.15, -0.2, Math.PI / 2); put(1.5, 1.15, -0.2, Math.PI / 2);
    put(0.8, -0.75, 0.55); put(0.8, 0.75, 0.55);            // gate gap in front
    const tree = C.props.tree('broad', 1.05); tree.position.set(0.35, 0, -0.5); g.add(tree);
    const old = C.figure({ h: 0.95, robe: 0x8a8274, beard: true, pose: 'sit' });
    old.position.set(-0.35, 0, -0.35); g.add(old);
    const dew = [];
    const dm = S.mat({ color: 0xd0e8ff, emissive: 0x4060a0, emissiveIntensity: 0.5, transparent: true, opacity: 0.8 });
    for (let i = 0; i < 9; i++) {
      const d = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 5), dm);
      g.add(d); dew.push({ d, ph: i * 0.7, x: -0.8 + (i % 3) * 0.75, z: -0.75 + Math.floor(i / 3) * 0.45 });
    }
    return seq(st, (t) => {
      for (const { d, ph, x, z } of dew) {
        const k = ((t * 0.35 + ph) % 1.6) / 1.6;
        d.position.set(x, 1.9 - k * 1.8, z);
        d.material.opacity = 0.85 - k * 0.5;
      }
    });
  },
  // X — Give fire to fire: the adept feeds flame to the furnace's flame
  10: (ctx) => {
    const { g, C } = ctx;
    const st = stage(ctx, { type: 'interior' });
    const furnace = C.props.furnace(1.1); furnace.position.set(0.55, 0, -0.5); g.add(furnace);
    const fires = [];
    [[-1.0, 0.45], [-0.3, 0.65]].forEach(([x, s2]) => {
      const f = C.props.fire(s2); f.position.set(x, 0, 0.35); g.add(f); fires.push(f);
    });
    const mercury = C.figure({ h: 1.0, robe: 0xc8d2da, pose: 'point', hat: 'brim' });
    mercury.position.set(-1.05, 0, -0.35); mercury.rotation.y = 0.8; g.add(mercury);
    return seq(st, (t) => fires.forEach((f, i) => { const s2 = 1 + Math.sin(t * 5 + i) * 0.1; f.scale.set(s2, 1 / s2, s2); }));
  },
  // XI — Whiten Latona: linens bleaching on the meadow, the books torn
  11: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { sun: true, town: true });
    for (const [x, z, ry] of [[-0.6, 0.35, 0.15], [0.25, 0.6, -0.1], [0.85, 0.1, 0.3]]) {
      const linen = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.5), S.mat({ color: 0xf2eee2, roughness: 0.95 }));
      linen.rotation.x = -Math.PI / 2; linen.rotation.z = ry;
      linen.position.set(x, 0.02, z); linen.receiveShadow = true; g.add(linen);
    }
    const w1 = C.figure({ h: 0.95, robe: 0x9ab0c0, pose: 'sit' });
    w1.position.set(-0.95, 0, 0.6); w1.rotation.y = 0.8; g.add(w1);
    const w2 = C.figure({ h: 1.0, robe: 0xc8b06a, pose: 'offer' });
    w2.position.set(0.65, 0, 0.8); w2.rotation.y = -0.5; g.add(w2);
    const book = C.props.book(1.3); book.position.set(-0.15, 0, 0.95); g.add(book);
    for (const [x, z, r] of [[-0.4, 1.05, 0.4], [0.1, 1.15, -0.7]]) {
      const page = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.22), S.mat({ color: 0xe8dfc8, side: THREE.DoubleSide }));
      page.rotation.x = -Math.PI / 2; page.rotation.z = r;
      page.position.set(x, 0.015, z); g.add(page);
    }
    return st;
  },
  // XII — Latona made white: the goddess with her twins, Apollo gold, Diana pale
  12: (ctx) => {
    const { g, C } = ctx;
    const st = stage(ctx, { moon: true, sun: true, town: true });
    const latona = C.figure({ h: 1.1, robe: 0xf0ece0, pose: 'offer' });
    latona.position.set(0, 0, 0); g.add(latona);
    const apollo = C.figure({ h: 0.5, robe: 0xd8b040 });
    apollo.position.set(-0.45, 0, 0.35); apollo.rotation.y = 0.5; g.add(apollo);
    const diana = C.figure({ h: 0.5, robe: 0xd8dce4 });
    diana.position.set(0.45, 0, 0.35); diana.rotation.y = -0.5; g.add(diana);
    const book = C.props.book(1.3); book.position.set(0.95, 0, 0.7); g.add(book);
    return st;
  },
  // XIII — The dropsical ore bathes in the Jordan
  13: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { type: 'sea', town: true, water: { z: -0.55, depth: 1.8 } });
    const sick = C.figure({ h: 0.95, robe: 0x9a8a6a, beard: true });
    sick.scale.x = 1.55;                                     // the dropsy
    sick.position.set(-0.15, -0.32, -0.5); g.add(sick);
    const helper = C.figure({ h: 1.0, robe: 0x6a8a9a, pose: 'offer', hat: 'cap' });
    helper.position.set(0.85, 0, 0.55); helper.rotation.y = -2.5; g.add(helper);
    const jug = C.props.vessel(0.55); jug.position.set(0.55, 0.85, 0.25); jug.rotation.z = 0.8; g.add(jug);
    const rm = S.mat({ color: 0x4a6a3a, roughness: 0.9 });
    for (const [x, z] of [[-1.4, 0.15], [-1.25, 0.3], [1.35, 0.2]]) {
      const reed = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.6, 5), rm);
      reed.position.set(x, 0.3, z); g.add(reed);
    }
    return st;
  },
  // XIV — The dragon that devours its own tail, filling the frame
  14: (ctx) => {
    const { g, C } = ctx;
    const st = stage(ctx, { town: true, treeAt: 1.3 });
    const o = C.animals.ouroboros(2.9);                      // symbolic scale
    o.position.y = 0.06; g.add(o);
    return seq(st, (t) => { o.rotation.y = t * 0.35; });
  },
  // XV — The potter at his wheel; his wares on the shelf behind
  15: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { type: 'interior' });
    const wheel = C.props.wheel(1.05);
    wheel.rotation.x = Math.PI / 2; wheel.position.set(0.15, 0.42, 0.15); g.add(wheel);
    const pot = C.props.vessel(0.85); pot.position.set(0.15, 0.48, 0.15); g.add(pot);
    const potter = C.figure({ h: 0.95, robe: 0x8a6a4a, pose: 'offer', hat: 'cap', beard: true });
    potter.position.set(-0.6, 0, 0.35); potter.rotation.y = 1.0; potter.rotation.x = 0.15; g.add(potter);
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 0.3), S.mat({ color: 0x5a3a22, roughness: 0.9 }));
    shelf.position.set(-0.5, 0.95, -1.32); g.add(shelf);
    for (const x of [-0.95, -0.5, -0.05]) {
      const v = C.props.vessel(0.5); v.position.set(x, 0.98, -1.32); g.add(v);
    }
    return seq(st, (t) => { wheel.rotation.z = t * 1.6; pot.rotation.y = t * 1.6; });
  },
  // XVI — The winged lion and the wingless, circling one another
  16: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { town: true, sun: true });
    const l1 = C.animals.lion(1.1); l1.position.set(-0.65, 0, 0.1); l1.rotation.y = -Math.PI / 2.2; g.add(l1);
    const l2 = C.animals.lion(1.1); l2.position.set(0.65, 0, 0.1); l2.rotation.y = Math.PI / 2.2; g.add(l2);
    const wm = S.mat({ color: 0xe8e0d0, side: THREE.DoubleSide });
    for (const s2 of [-1, 1]) {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.65), wm);
      w.position.set(s2 * 0.18, 0.95, 0); w.rotation.z = s2 * 0.7; w.castShadow = true; l1.add(w);
    }
    const rock = C.props.mount(0.9); rock.position.set(0, 0, -1.1); g.add(rock);
    return st;
  },
  // XVII — The fourfold fire that governs the work
  17: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { type: 'interior' });
    const hearth = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.14, 0.9), S.mat({ color: 0x6a5c50, roughness: 0.95 }));
    hearth.position.set(0, 0.07, -0.2); hearth.receiveShadow = true; g.add(hearth);
    const fires = [];
    [[-1.05, 0.4], [-0.35, 0.58], [0.35, 0.8], [1.05, 1.05]].forEach(([x, s2]) => {
      const f = C.props.fire(s2); f.position.set(x, 0.14, -0.2); g.add(f); fires.push(f);
    });
    const tender = C.figure({ h: 1.0, robe: 0x5a5a6a, pose: 'point', hat: 'brim', beard: true });
    tender.position.set(-1.2, 0, 0.6); tender.rotation.y = 0.7; g.add(tender);
    return seq(st, (t) => fires.forEach((f, i) => { const s2 = 1 + Math.sin(t * 4.4 + i * 1.2) * 0.12; f.scale.set(s2, 1 / s2, s2); }));
  },
  // XVIII — Fire makes fiery, but gold makes golden
  18: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { type: 'interior' });
    const brazier = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.2, 0.25, 12), S.mat({ color: 0x50565e, metalness: 0.7, roughness: 0.5 }));
    brazier.position.set(-0.6, 0.35, 0); brazier.castShadow = true; g.add(brazier);
    for (const sx of [-0.78, -0.42]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.35, 6), brazier.material);
      leg.position.set(sx, 0.17, 0); g.add(leg);
    }
    const fire = C.props.fire(0.7); fire.position.set(-0.6, 0.45, 0); g.add(fire);
    const gold = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42),
      S.mat({ color: 0xffd24a, emissive: 0x705400, emissiveIntensity: 0.55, metalness: 1, roughness: 0.15 }));
    gold.position.set(0.62, 0.21, 0.15); gold.castShadow = true; g.add(gold);
    const silver = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), S.mat({ color: 0xc8d2da, metalness: 0.9, roughness: 0.25 }));
    silver.position.set(0.25, 0.15, 0.62); silver.castShadow = true; g.add(silver);
    const adept = C.figure({ h: 1.0, robe: 0x6a5a44, pose: 'point', beard: true });
    adept.position.set(1.1, 0, -0.35); adept.rotation.y = -0.8; g.add(adept);
    return seq(st, (t) => { const s2 = 1 + Math.sin(t * 5) * 0.1; fire.scale.set(s2, 1 / s2, s2); });
  },
  // XIX — Kill one of the four and all lie dead
  19: (ctx) => {
    const { g, C } = ctx;
    const st = stage(ctx, { town: true, clouds: 2 });
    const slayer = C.figure({ h: 1.05, robe: 0x8a3a3a, pose: 'point', hat: 'cap' });
    slayer.position.set(-0.85, 0, 0.35); slayer.rotation.y = 1.0; g.add(slayer);
    const sword = C.props.sword(0.95); sword.rotation.z = -1.1; sword.position.set(-0.45, 0.95, 0.3); g.add(sword);
    const fallen = C.figure({ h: 0.95, robe: 0x5a7a8a, pose: 'recline' });
    fallen.position.set(0.25, 0, 0.55); g.add(fallen);
    const f2 = C.figure({ h: 0.95, robe: 0x7a8a5a }); f2.position.set(0.4, 0, -0.5); f2.rotation.y = -0.4; g.add(f2);
    const f3 = C.figure({ h: 0.95, robe: 0xc8b06a }); f3.position.set(1.05, 0, -0.1); f3.rotation.y = -0.8; g.add(f3);
    return st;
  },
  // XX — Nature teaches Nature
  20: (ctx) => {
    const { g, C } = ctx;
    const st = stage(ctx, { sun: true, town: true, treeAt: -1.35 });
    const teacher = C.figure({ h: 1.05, robe: 0x6a8a6a, pose: 'point', beard: true, hat: 'brim' });
    teacher.position.set(-0.5, 0, 0.1); teacher.rotation.y = Math.PI / 2.6; g.add(teacher);
    const pupil = C.figure({ h: 0.95, robe: 0x9a8a6a, pose: 'offer' });
    pupil.position.set(0.55, 0, 0.15); pupil.rotation.y = -Math.PI / 2.6; g.add(pupil);
    const globe = C.props.globe(0.75); globe.position.set(0.05, 0.35, 0.1); g.add(globe);
    return st;
  },
  // XXI — The philosopher draws circle, square, triangle, circle on the wall
  21: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { type: 'interior' });
    // the diagram wall
    const wall = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.9, 0.12), S.mat({ color: 0xb0a48c, roughness: 0.95 }));
    wall.position.set(0.15, 0.95, -1.05); wall.castShadow = true; wall.receiveShadow = true; g.add(wall);
    const ink = S.mat({ color: 0x2a2018, roughness: 0.8 });
    const Z = -0.97;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.028, 8, 40), ink);
    ring.position.set(0.15, 1.0, Z); g.add(ring);
    const sq = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.045, 0.03), ink);
      if (i % 2 === 0) side.position.set(0, i === 0 ? 0.55 : -0.55, 0);
      else { side.rotation.z = Math.PI / 2; side.position.set(i === 1 ? 0.55 : -0.55, 0, 0); }
      sq.add(side);
    }
    sq.position.set(0.15, 1.0, Z); g.add(sq);
    const tri = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.03, 3, 1, false, Math.PI), ink);
    tri.rotation.x = Math.PI / 2; tri.position.set(0.15, 0.97, Z); g.add(tri);
    const inner = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.022, 8, 24), ink);
    inner.position.set(0.15, 0.96, Z); g.add(inner);
    // the man and woman inside the innermost circle — the plate's secret centre
    const m = C.figure({ h: 0.3, robe: 0x6a7a9a }); m.position.set(0.08, 0.81, Z + 0.02); g.add(m);
    const w = C.figure({ h: 0.28, robe: 0xc89a7a }); w.position.set(0.24, 0.81, Z + 0.02); g.add(w);
    // the philosopher with his giant compasses set to the circle
    const phil = C.figure({ h: 1.1, robe: 0x5a5a7a, pose: 'reach', beard: true, hat: 'brim' });
    phil.position.set(-1.15, 0, 0.35); phil.rotation.y = 0.75; g.add(phil);
    const comp = C.props.compasses(1.25);
    comp.position.set(-0.6, 0.35, -0.3); comp.rotation.z = -0.55; comp.rotation.y = 0.2; g.add(comp);
    return st;
  },
  // XXII — The white lead won, turn to woman's work: the pot on the fire
  22: (ctx) => {
    const { g, C } = ctx;
    const st = stage(ctx, { type: 'interior' });
    const fire = C.props.fire(0.55); fire.position.set(0.45, 0, -0.1); g.add(fire);
    const pot = C.props.vessel(0.85); pot.position.set(0.45, 0.32, -0.1); g.add(pot);
    const woman = C.figure({ h: 1.0, robe: 0xb0a8c0, pose: 'offer' });
    woman.position.set(-0.5, 0, 0.3); woman.rotation.y = 1.0; woman.rotation.x = 0.12; g.add(woman);
    const tub = C.props.tub(0.95); tub.position.set(-0.55, 0, -0.85); g.add(tub);
    const fish = C.animals.fish(0.8); fish.position.set(1.1, 0.02, 0.5); fish.rotation.y = 0.6; g.add(fish);
    return seq(st, (t) => { const s2 = 1 + Math.sin(t * 5.2) * 0.1; fire.scale.set(s2, 1 / s2, s2); });
  },
  // XXIII — Gold rains down when Pallas is born at Rhodes
  23: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { sun: true, town: true });
    const pallas = C.figure({ h: 1.1, robe: 0xc8b06a, pose: 'reach', crowned: true });
    pallas.position.set(-0.35, 0, 0.1); g.add(pallas);
    // the temple of Rhodes, in miniature behind
    const colA = C.props.column(1.0); colA.position.set(0.65, 0, -0.75); g.add(colA);
    const colB = C.props.column(1.0); colB.position.set(1.25, 0, -0.75); g.add(colB);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.14, 0.4), S.mat({ color: 0x8a7a5a, roughness: 0.85 }));
    lintel.position.set(0.95, 1.78, -0.75); lintel.castShadow = true; g.add(lintel);
    const drops = [];
    const dm = S.mat({ color: 0xffd24a, emissive: 0x806000, emissiveIntensity: 0.8, metalness: 0.9, roughness: 0.2 });
    for (let i = 0; i < 12; i++) {
      const d = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), dm);
      g.add(d); drops.push({ d, ph: i * 0.55, x: -0.9 + (i % 4) * 0.45, z: -0.2 + Math.floor(i / 4) * 0.35 });
    }
    return seq(st, (t) => {
      for (const { d, ph, x, z } of drops) {
        const k = ((t * 0.5 + ph) % 1.4) / 1.4;
        d.position.set(x, 2.2 - k * 2.1, z);
      }
    });
  },
  // XXIV — The wolf devours the king; behind, the wolf burns and the king returns
  24: (ctx) => {
    const { g, C } = ctx;
    const st = stage(ctx, { town: true, clouds: 2 });
    const king = C.figure({ h: 1.0, robe: 0x8a3a3a, pose: 'recline', crowned: true });
    king.position.set(-0.15, 0, 0.5); g.add(king);
    const wolf = C.animals.wolf(1.15); wolf.position.set(0.5, 0, 0.25); wolf.rotation.y = 2.4; g.add(wolf);
    // afterward, half-scale at the back: the pyre and the risen king
    const pyre = C.props.fire(0.55); pyre.position.set(-1.0, 0, -1.0); g.add(pyre);
    const burntWolf = C.animals.wolf(0.5); burntWolf.position.set(-1.0, 0.22, -1.0); g.add(burntWolf);
    const risen = C.figure({ h: 0.55, robe: 0xd8b040, crowned: true, pose: 'reach' });
    risen.position.set(0.95, 0, -1.05); g.add(risen);
    return seq(st, (t) => { const s2 = 1 + Math.sin(t * 4.6) * 0.1; pyre.scale.set(s2, 1 / s2, s2); });
  },
  // XXV — The dragon dies only by brother and sister together
  25: (ctx) => {
    const { g, C } = ctx;
    const st = stage(ctx, { town: true, treeAt: 1.3 });
    const dragon = C.animals.dragon(1.6); dragon.position.set(0.1, 0, -0.25); dragon.rotation.y = 0.6; g.add(dragon);
    const bro = C.figure({ h: 1.0, robe: 0x6a7a9a, pose: 'point', hat: 'cap' });
    bro.position.set(-0.9, 0, 0.55); bro.rotation.y = 0.7; g.add(bro);
    const sword = C.props.sword(0.95); sword.rotation.z = -0.9; sword.position.set(-0.5, 0.85, 0.45); g.add(sword);
    const sis = C.figure({ h: 0.95, robe: 0xc89a7a, pose: 'point' });
    sis.position.set(0.95, 0, 0.55); sis.rotation.y = -0.7; g.add(sis);
    return st;
  },
  // XXVI — The Tree of Life, the fruit of human wisdom
  26: (ctx) => {
    const { g, C } = ctx;
    const st = stage(ctx, { sun: true, town: true });
    const tree = C.props.tree('golden', 1.5); tree.position.set(0.35, 0, -0.45); g.add(tree);
    const sapientia = C.nymph({ robe: 0xe8ddc0, h: 1.1, pose: 'offer' });
    sapientia.position.set(-0.7, 0, 0.4); sapientia.rotation.y = 0.8; g.add(sapientia);
    const seeker = C.figure({ h: 0.95, robe: 0x5a5a7a, pose: 'reach', hat: 'brim' });
    seeker.position.set(-1.2, 0, -0.3); seeker.rotation.y = 1.2; g.add(seeker);
    return st;
  },
  // XXVII — The Rose-garden of the Philosophers, and its locked door
  27: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { sun: true, town: false });
    const wallMat = S.mat({ color: 0x9a8a6a, roughness: 0.95 });
    const back = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.25, 0.16), wallMat);
    back.position.set(0, 0.62, -0.75); back.castShadow = true; back.receiveShadow = true; g.add(back);
    for (const sx of [-1, 1]) {
      const ret = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.25, 0.9), wallMat);
      ret.position.set(sx * 1.4, 0.62, -0.3); ret.castShadow = true; g.add(ret);
    }
    const gate = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.95, 0.2), S.mat({ color: 0x3a2a18, roughness: 0.85 }));
    gate.position.set(0, 0.48, -0.73); g.add(gate);
    const rm = S.mat({ color: 0xc03a4a, emissive: 0x500010, emissiveIntensity: 0.4 });
    for (let i = 0; i < 10; i++) {
      const r = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), rm);
      r.position.set(-1.25 + i * 0.28, 1.32 + Math.sin(i * 2) * 0.07, -0.73);
      r.castShadow = true; g.add(r);
    }
    // golden tree crowns showing above the wall — the garden within
    for (const [x, s2] of [[-0.8, 0.55], [0.6, 0.65]]) {
      const crown = C.props.tree('golden', s2);
      crown.position.set(x, 0.75, -1.15); g.add(crown);
    }
    const seeker = C.figure({ h: 1.0, robe: 0x5a5a7a, pose: 'point', hat: 'brim' });
    seeker.position.set(-0.3, 0, 0.35); seeker.rotation.y = Math.PI + 0.4; g.add(seeker);
    return st;
  },
  // XXVIII — King Duenech sweats out his melancholy in the steam-cabinet
  28: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { type: 'interior' });
    const bath = C.props.tub(1.55); bath.position.set(0, 0, -0.15); g.add(bath);
    const king = C.figure({ h: 0.85, robe: 0x8a3a3a, crowned: true });
    king.position.set(0, 0.3, -0.15); g.add(king);
    // the wooden sweat-cabinet over him, posts and canopy
    const wood = S.mat({ color: 0x5a3a22, roughness: 0.9 });
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 1.6, 8), wood);
      post.position.set(sx * 0.75, 0.8, -0.15 + sz * 0.62); post.castShadow = true; g.add(post);
    }
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.09, 1.5), wood);
    canopy.position.set(0, 1.62, -0.15); canopy.castShadow = true; g.add(canopy);
    const fire = C.props.fire(0.5); fire.position.set(1.15, 0, 0.45); g.add(fire);
    const steams = [];
    const sm = S.mat({ color: 0xe8e8e8, transparent: true, opacity: 0.4 });
    for (let i = 0; i < 5; i++) {
      const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), sm);
      g.add(s2); steams.push({ s: s2, ph: i * 1.1 });
    }
    return seq(st, (t) => {
      for (const { s: s2, ph } of steams) {
        const k = ((t * 0.4 + ph) % 1.8) / 1.8;
        s2.position.set(Math.sin(ph * 4 + t) * 0.3, 0.65 + k * 0.9, -0.15 + Math.cos(ph * 3) * 0.3);
        s2.material.opacity = 0.4 * (1 - k);
        s2.scale.setScalar(1 + k * 1.4);
      }
    });
  },
  // XXIX — As the salamander lives in the fire, so the Stone
  29: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { town: true, clouds: 2 });
    const embers = new THREE.Mesh(new THREE.CircleGeometry(0.95, 20),
      S.mat({ color: 0xd85818, emissive: 0xa02c00, emissiveIntensity: 0.7, roughness: 0.8 }));
    embers.rotation.x = -Math.PI / 2; embers.position.set(0, 0.02, 0.1); g.add(embers);
    const fire = C.props.fire(1.35); fire.position.set(0, 0, 0.1); g.add(fire);
    const sal = C.animals.salamander(1.7); sal.position.set(0, 0.12, 0.45); g.add(sal);
    return seq(st, (t) => {
      const s2 = 1 + Math.sin(t * 4.2) * 0.12;
      fire.scale.set(s2, 1 / s2, s2);
      sal.rotation.y = Math.sin(t * 0.7) * 0.4;
    });
  },
  // XXX — Sol needs Luna as the cock needs the hen
  30: (ctx) => {
    const { g, C } = ctx;
    const st = stage(ctx, { sun: false, town: true });
    const sun = C.props.sun(0.6); sun.position.set(-0.75, 1.9, -1.1); g.add(sun);
    const moon = C.props.moon(0.55); moon.position.set(0.75, 1.9, -1.1); g.add(moon);
    const cock = C.animals.hen(1.15); cock.position.set(-0.5, 0, 0.35); cock.rotation.y = Math.PI / 2.5; g.add(cock);
    const hen = C.animals.hen(1.0); hen.position.set(0.5, 0, 0.35); hen.rotation.y = -Math.PI / 2.5; g.add(hen);
    return seq(st, (t) => { sun.rotation.z = t * 0.4; });
  },
  // XXXI — The king swims the sea, crying his reward; a ship stands off
  31: (ctx) => {
    const { g, C } = ctx;
    const st = stage(ctx, { type: 'sea', town: true, water: { z: -0.55, depth: 2.2 } });
    const king = C.figure({ h: 0.9, robe: 0x3a5a7a, pose: 'beckon', crowned: true, beard: true });
    king.position.set(-0.2, -0.62, -0.55); g.add(king);
    const ship = C.props.ship(1.1); ship.position.set(1.1, 0.02, -1.15); ship.rotation.y = 0.5; g.add(ship);
    return seq(st, (t) => {
      king.position.y = -0.62 + Math.sin(t * 1.1) * 0.05;
      ship.position.y = 0.02 + Math.sin(t * 0.9 + 1) * 0.03;
      ship.rotation.z = Math.sin(t * 0.8) * 0.05;
    });
  },
  // XXXII — Coral, soft below the sea, hardens in the air: the harvest
  32: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { type: 'sea', town: false, water: { z: -0.55, depth: 2.2 } });
    const boat = C.props.boat(0.85); boat.position.set(0.55, 0.02, -0.7); boat.rotation.y = 0.3; g.add(boat);
    const fisher = C.figure({ h: 0.6, robe: 0x6a5a44, pose: 'reach' });
    fisher.position.set(0.35, 0.42, -0.55); fisher.rotation.y = 0.9; fisher.rotation.x = 0.3; g.add(fisher);
    const cm = S.mat({ color: 0xc84a4a, roughness: 0.7 });
    const coral = new THREE.Group();
    for (let i = 0; i < 7; i++) {
      const br = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.05, 0.5 + (i % 3) * 0.22, 6), cm);
      br.position.set(Math.sin(i * 1.1) * 0.16, 0.28, Math.cos(i * 1.3) * 0.14);
      br.rotation.z = Math.sin(i * 2.2) * 0.18;
      br.castShadow = true; coral.add(br);
    }
    coral.position.set(-0.6, -0.1, -0.5); g.add(coral);
    const fish = C.animals.fish(1.0); g.add(fish);
    return seq(st, (t) => {
      fish.position.set(-0.5 + Math.sin(t * 0.8) * 0.7, 0.06, -0.5 + Math.cos(t * 0.8) * 0.5);
      fish.rotation.y = t * 0.8 + Math.PI / 2;
      boat.position.y = 0.02 + Math.sin(t * 0.9) * 0.03;
    });
  },
  // XXXIII — The hermaphrodite, dark as a corpse, wants fire
  33: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { type: 'interior' });
    const slab = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.28, 0.9), S.mat({ color: 0x6a6258, roughness: 0.95 }));
    slab.position.set(-0.1, 0.14, 0.05); slab.castShadow = true; slab.receiveShadow = true; g.add(slab);
    const h = C.figure({ h: 1.0, robe: 0x4a4254, pose: 'recline', twoHeaded: true });
    h.position.set(-0.25, 0.28, 0.05); g.add(h);
    const fire = C.props.fire(0.85); fire.position.set(1.05, 0, -0.3); g.add(fire);
    const tender = C.figure({ h: 0.95, robe: 0x6a5a44, pose: 'offer', beard: true });
    tender.position.set(1.0, 0, 0.6); tender.rotation.y = -2.6; g.add(tender);
    return seq(st, (t) => { const s2 = 1 + Math.sin(t * 4.8) * 0.11; fire.scale.set(s2, 1 / s2, s2); });
  },
  // XXXIV — Conceived in the bath, born in the air
  34: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { sun: true, town: true });
    const pool = C.props.pool(1.5); pool.position.set(0, 0, 0.15); g.add(pool);
    for (const sx of [-1, 1]) {
      const c = C.props.column(0.95); c.position.set(sx * 1.05, 0, -0.6); g.add(c);
    }
    const arch = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.16, 0.36), S.mat({ color: 0x8a7a5a, roughness: 0.85 }));
    arch.position.set(0, 1.72, -0.6); arch.castShadow = true; g.add(arch);
    const child = C.figure({ h: 0.55, pose: 'reach' });
    g.add(child);
    return seq(st, (t) => {
      child.position.set(0, 0.5 + (Math.sin(t * 0.9) + 1) * 0.4, 0.15);
      child.rotation.y = t * 0.5;
    });
  },
  // XXXV — Ceres holds the infant Triptolemus over the coals
  35: (ctx) => {
    const { g, C } = ctx;
    const st = stage(ctx, { type: 'interior' });
    const fire = C.props.fire(0.9); fire.position.set(0.25, 0, 0.1); g.add(fire);
    const ceres = C.nymph({ robe: 0xc8b06a, h: 1.1, pose: 'offer' });
    ceres.position.set(-0.6, 0, 0.15); ceres.rotation.y = 1.05; ceres.rotation.x = 0.1; g.add(ceres);
    const child = C.figure({ h: 0.5 });
    child.position.set(0.05, 0.55, 0.12); child.rotation.z = 0.2; g.add(child);
    return seq(st, (t) => { const s2 = 1 + Math.sin(t * 4.4) * 0.1; fire.scale.set(s2, 1 / s2, s2); });
  },
  // XXXVI — The Stone, cast on the earth, found on the mountains
  36: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { sun: true, town: true, clouds: 2 });
    const m1 = C.props.mount(1.5); m1.position.set(0.85, 0, -0.95); g.add(m1);
    const m2 = C.props.mount(1.0); m2.position.set(-0.95, 0, -1.05); g.add(m2);
    const stone = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0),
      S.mat({ color: 0xd8c8a0, emissive: 0x504020, emissiveIntensity: 0.4, metalness: 0.4, roughness: 0.4 }));
    stone.position.set(-0.35, 0.3, 0.5); stone.castShadow = true; g.add(stone);
    const traveler = C.figure({ h: 1.0, robe: 0x5a5a7a, pose: 'point', hat: 'brim' });
    traveler.position.set(0.6, 0, 0.55); traveler.rotation.y = -0.9; g.add(traveler);
    return seq(st, (t) => { stone.rotation.y = t * 0.6; });
  },
  // XXXVII — Three suffice: white smoke, the green lion, aqua vitae
  37: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { type: 'interior' });
    const smoke = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.2, 10), S.mat({ color: 0xe8e8e8, transparent: true, opacity: 0.55 }));
    smoke.position.set(-0.95, 0.6, -0.1); g.add(smoke);
    const lion = C.animals.lion(1.0); lion.position.set(0.1, 0, 0.2);
    lion.traverse(o => { if (o.material) o.material = S.mat({ color: 0x4a8a3a, roughness: 0.8 }); });
    g.add(lion);
    const aqua = C.props.vessel(1.05); aqua.position.set(1.05, 0, 0); g.add(aqua);
    return seq(st, (t) => { smoke.scale.y = 1 + Math.sin(t * 1.4) * 0.1; });
  },
  // XXXVIII — The Rebis, born of two mountains, with square and compasses
  38: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { moon: true, sun: true, town: false });
    const m1 = C.props.mount(1.15); m1.position.set(-0.8, 0, -0.7); g.add(m1);
    const m2 = C.props.mount(1.15); m2.position.set(0.8, 0, -0.7); g.add(m2);
    const rebis = C.figure({ h: 1.2, robe: 0x8a6a9a, twoHeaded: true, pose: 'reach' });
    rebis.position.set(0, 0.1, 0.15); g.add(rebis);
    const comp = C.props.compasses(0.6);
    comp.position.set(-0.5, 1.15, 0.25); comp.rotation.z = 2.6; g.add(comp);
    const sqm = S.mat({ color: 0x8a8a92, metalness: 0.8, roughness: 0.35 });
    const sqA = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.035, 0.035), sqm);
    sqA.position.set(0.52, 1.28, 0.25); g.add(sqA);
    const sqB = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.3, 0.035), sqm);
    sqB.position.set(0.71, 1.14, 0.25); g.add(sqB);
    return st;
  },
  // XXXIX — Oedipus answers the Sphinx on her rock
  39: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { town: true, clouds: 2 });
    const rock = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.8), S.mat({ color: 0x6a6258, roughness: 0.95 }));
    rock.position.set(0.55, 0.35, -0.35); rock.castShadow = true; rock.receiveShadow = true; g.add(rock);
    const sphinx = C.animals.lion(0.95); sphinx.position.set(0.55, 0.7, -0.35); sphinx.rotation.y = Math.PI / 2 + 0.4; g.add(sphinx);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), S.mat({ color: 0xd8c4a4, roughness: 0.6 }));
    head.position.set(0, 0.95, -0.48); head.castShadow = true; sphinx.add(head);
    const wm = S.mat({ color: 0xc8b890, side: THREE.DoubleSide });
    for (const s2 of [-1, 1]) {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.55), wm);
      w.position.set(s2 * 0.2, 0.8, 0.1); w.rotation.z = s2 * 0.8; sphinx.add(w);
    }
    const oedipus = C.figure({ h: 1.05, robe: 0x5a6a8a, pose: 'point', hat: 'cap' });
    oedipus.position.set(-0.75, 0, 0.45); oedipus.rotation.y = 0.95; g.add(oedipus);
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 1.15, 6), S.mat({ color: 0x6a4a2a }));
    staff.position.set(-1.05, 0.57, 0.5); g.add(staff);
    return st;
  },
  // XL — Make one water of two waters
  40: (ctx) => {
    const { g, C } = ctx;
    const st = stage(ctx, { type: 'sea', town: true, water: { z: -0.85, depth: 1.4 } });
    const pool = C.props.pool(1.35); pool.position.set(0, 0, 0.35); g.add(pool);
    const a1 = C.figure({ h: 1.0, robe: 0x6a8a9a, pose: 'offer' });
    a1.position.set(-0.85, 0, 0.5); a1.rotation.y = 1.1; g.add(a1);
    const a2 = C.figure({ h: 1.0, robe: 0x9a7a5a, pose: 'offer' });
    a2.position.set(0.85, 0, 0.5); a2.rotation.y = -1.1; g.add(a2);
    const v1 = C.props.vessel(0.7); v1.position.set(-0.5, 0.85, 0.4); v1.rotation.z = -0.85; g.add(v1);
    const v2 = C.props.vessel(0.7); v2.position.set(0.5, 0.85, 0.4); v2.rotation.z = 0.85; g.add(v2);
    return seq(st, (t) => {
      v1.rotation.z = -0.85 + Math.sin(t * 1.3) * 0.1;
      v2.rotation.z = 0.85 - Math.sin(t * 1.3) * 0.1;
    });
  },
  // XLI — Adonis slain by the boar; Venus, running, stains the roses
  41: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { town: true, treeAt: 1.35 });
    const adonis = C.figure({ h: 1.0, robe: 0x9a8a6a, pose: 'recline' });
    adonis.position.set(0.3, 0, 0.5); g.add(adonis);
    const boar = C.animals.sow(1.05); boar.position.set(1.0, 0, -0.35); boar.rotation.y = 2.6; g.add(boar);
    for (const s2 of [-1, 1]) {
      const tusk = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.14, 5), S.mat({ color: 0xe4dcc4 }));
      tusk.position.set(1.0 + s2 * 0.08, 0.62, -0.85); tusk.rotation.x = -0.8; g.add(tusk);
    }
    const venus = C.nymph({ robe: 0xe8ddc0, h: 1.05, pose: 'reach' });
    venus.position.set(-0.85, 0, 0.05); venus.rotation.y = 1.3; venus.rotation.x = 0.14; g.add(venus);
    const rm = S.mat({ color: 0xc03a4a, emissive: 0x500010, emissiveIntensity: 0.4 });
    for (let i = 0; i < 6; i++) {
      const r = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), rm);
      r.position.set(-0.3 + Math.sin(i * 2.4) * 0.55, 0.05, 0.65 + Math.cos(i * 1.8) * 0.3);
      g.add(r);
    }
    return st;
  },
  // XLII — Let Nature be your guide; follow her with staff and lantern
  42: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { moon: true, town: true, treeAt: -1.35 });
    const nature = C.nymph({ robe: 0x6a8a6a, h: 1.1, pose: 'point' });
    nature.position.set(0.55, 0, -0.15); nature.rotation.y = -0.6; g.add(nature);
    const phil = C.figure({ h: 1.0, robe: 0x5a5a7a, pose: 'offer', beard: true, hat: 'brim' });
    phil.position.set(-0.55, 0, 0.45); phil.rotation.y = -0.6; g.add(phil);
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 1.1, 6), S.mat({ color: 0x6a4a2a }));
    staff.position.set(-0.95, 0.55, 0.5); g.add(staff);
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.19, 0.15),
      S.mat({ color: 0xffe080, emissive: 0xc89020, emissiveIntensity: 1.0, transparent: true, opacity: 0.9 }));
    lamp.position.set(-0.22, 0.95, 0.55); g.add(lamp);
    // her footprints, which he follows
    const fm = S.mat({ color: 0x2e2a20, roughness: 1 });
    for (let i = 0; i < 4; i++) {
      const fp = new THREE.Mesh(new THREE.CircleGeometry(0.045, 8), fm);
      fp.rotation.x = -Math.PI / 2;
      fp.position.set(-0.25 + i * 0.28, 0.016, 0.3 - i * 0.12);
      g.add(fp);
    }
    return seq(st, (t) => { lamp.material.emissiveIntensity = 1.0 + Math.sin(t * 6) * 0.2; });
  },
  // XLIII — Mark the screech-owl; the birds that mob her are the guide
  43: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { town: true, sun: true });
    const tree = C.props.tree('broad', 1.0); tree.position.set(-0.95, 0, -0.6); g.add(tree);
    const owl = C.animals.bird(1.35, { color: 0x8a7a5a });
    owl.position.set(-0.45, 1.3, -0.25); g.add(owl);
    const em = S.mat({ color: 0xffc040, emissive: 0xa06000, emissiveIntensity: 0.8 });
    for (const s2 of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 5), em);
      eye.position.set(-0.45 + s2 * 0.055, 1.6, -0.42); g.add(eye);
    }
    const b1 = C.animals.bird(0.75, { flying: true }); g.add(b1);
    const b2 = C.animals.crow(0.75); g.add(b2);
    const fowler = C.figure({ h: 0.55, robe: 0x5a5a44, pose: 'point' });
    fowler.position.set(1.15, 0, -1.0); fowler.rotation.y = -0.6; g.add(fowler);
    return seq(st, (t) => {
      b1.position.set(-0.45 + Math.sin(t * 1.2) * 0.7, 1.55 + Math.sin(t * 2.4) * 0.2, -0.1 + Math.cos(t * 1.2) * 0.35);
      b2.position.set(-0.45 + Math.sin(t * 1.2 + 3) * 0.7, 1.35 + Math.cos(t * 2) * 0.2, -0.1 + Math.cos(t * 1.2 + 3) * 0.35);
    });
  },
  // XLIV — Typhon slays Osiris and scatters the limbs; Isis gathers them
  44: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { sun: true, town: true });
    const osiris = C.figure({ h: 1.0, robe: 0x3a6a5a, pose: 'recline', crowned: true });
    osiris.position.set(-0.25, 0, 0.5); g.add(osiris);
    const typhon = C.figure({ h: 1.1, robe: 0x6a3a3a, pose: 'reach', beard: true });
    typhon.position.set(0.75, 0, -0.25); typhon.rotation.y = -2.6; g.add(typhon);
    const isis = C.nymph({ robe: 0xe8ddc0, h: 1.0, pose: 'sit' });
    isis.position.set(-1.05, 0, -0.35); isis.rotation.y = 2.4; g.add(isis);
    const lm = S.mat({ color: 0xd8c4a4, roughness: 0.6 });
    for (const [x, z] of [[-1.15, 0.35], [0.15, 0.9], [-0.65, 0.95]]) {
      const limb = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.3, 4, 8), lm);
      limb.position.set(x, 0.06, z); limb.rotation.z = Math.PI / 2; limb.castShadow = true; g.add(limb);
    }
    return st;
  },
  // XLV — The Sun and his shadow complete the work
  45: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { town: true });
    const sun = C.props.sun(0.75); sun.position.set(-1.1, 1.9, -1.0); g.add(sun);
    const gnomon = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 1.5, 8), S.mat({ color: 0x8a7a5a, roughness: 0.85 }));
    gnomon.position.set(0.35, 0.75, 0); gnomon.castShadow = true; g.add(gnomon);
    // the long cast shadow, drawn as the plate draws it
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.3), S.mat({ color: 0x14120c, roughness: 1 }));
    shadow.rotation.x = -Math.PI / 2; shadow.rotation.z = -0.25;
    shadow.position.set(1.05, 0.018, 0.35); g.add(shadow);
    const surveyor = C.figure({ h: 1.0, robe: 0x5a5a7a, pose: 'point', hat: 'brim', beard: true });
    surveyor.position.set(-0.6, 0, 0.6); surveyor.rotation.y = 0.7; g.add(surveyor);
    return seq(st, (t) => { sun.rotation.z = t * 0.5; });
  },
  // XLVI — Two eagles, from East and West, meet at the world's centre
  46: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { town: true, clouds: 2 });
    // the omphalos where they meet
    const omph = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.65, 12), S.mat({ color: 0x9a8a6a, roughness: 0.9 }));
    omph.position.set(0, 0.33, -0.15); omph.castShadow = true; g.add(omph);
    const e1 = C.animals.eagle(1.0); g.add(e1);
    const e2 = C.animals.eagle(1.0); g.add(e2);
    return seq(st, (t) => {
      const k = (Math.sin(t * 0.7) + 1) / 2;          // fly in, fly out
      e1.position.set(-1.3 + k * 1.0, 1.15 + Math.sin(t * 3) * 0.07, -0.15);
      e1.rotation.y = Math.PI / 2;
      e2.position.set(1.3 - k * 1.0, 1.15 + Math.sin(t * 3 + 1) * 0.07, -0.15);
      e2.rotation.y = -Math.PI / 2;
      for (const e of [e1, e2]) {
        if (e.userData.wingL) { e.userData.wingL.rotation.z = -0.5 + Math.sin(t * 6) * 0.3; e.userData.wingR.rotation.z = 0.5 - Math.sin(t * 6) * 0.3; }
      }
    });
  },
  // XLVII — The wolf from the East and the dog from the West, at each other's throats
  47: (ctx) => {
    const { g, C } = ctx;
    const st = stage(ctx, { town: true, sun: true });
    const wolf = C.animals.wolf(1.1); wolf.position.set(-0.7, 0, 0.1); wolf.rotation.y = Math.PI / 2.15; wolf.rotation.z = 0.06; g.add(wolf);
    const dog = C.animals.dog(1.25); dog.position.set(0.7, 0, 0.1); dog.rotation.y = -Math.PI / 2.15; dog.rotation.z = -0.06; g.add(dog);
    return seq(st, (t) => {
      wolf.position.x = -0.7 + Math.sin(t * 0.9) * 0.12;
      dog.position.x = 0.7 - Math.sin(t * 0.9) * 0.12;
      wolf.rotation.x = Math.abs(Math.sin(t * 1.8)) * 0.08;
      dog.rotation.x = Math.abs(Math.sin(t * 1.8 + 1)) * 0.08;
    });
  },
  // XLVIII — The poisoned king in his bed; the physician raises the flask
  48: (ctx) => {
    const { g, C } = ctx;
    const st = stage(ctx, { type: 'interior' });
    const bed = C.props.bed(1.15); bed.position.set(0.15, 0, -0.35); g.add(bed);
    const king = C.figure({ h: 0.95, robe: 0x8a3a3a, pose: 'recline', crowned: true, beard: true });
    king.position.set(0.3, 0.52, -0.35); g.add(king);
    const physician = C.figure({ h: 1.05, robe: 0x3a5a6a, pose: 'beckon', hat: 'brim', beard: true });
    physician.position.set(-1.0, 0, 0.35); physician.rotation.y = 0.7; g.add(physician);
    const flask = C.props.vessel(0.45);
    flask.position.set(-0.72, 1.55, 0.3); g.add(flask);      // held up to the light
    const attendant = C.figure({ h: 0.95, robe: 0x9a8a6a, pose: 'offer' });
    attendant.position.set(1.15, 0, 0.4); attendant.rotation.y = -0.9; g.add(attendant);
    return st;
  },
  // XLIX — The Philosophical Child of three fathers, like Orion
  49: (ctx) => {
    const { g, C } = ctx;
    const st = stage(ctx, { sun: true, moon: true, town: true });
    const child = C.figure({ h: 0.55 }); child.position.set(0, 0, 0.65); g.add(child);
    const fathers = [
      { robe: 0xc8b06a, hat: 'brim' },   // Sol
      { robe: 0x8a9ac8, hat: 'cap' },    // Luna's knight
      { robe: 0x9a8a6a, hat: null },     // Mercury
    ];
    fathers.forEach((f, i) => {
      const fg = C.figure({ h: 1.05, robe: f.robe, pose: 'offer', hat: f.hat, beard: i === 0 });
      const a = -0.75 + i * 0.75;
      fg.position.set(Math.sin(a) * 0.95, 0, -Math.cos(a) * 0.55 - 0.1);
      fg.rotation.y = -a;
      g.add(fg);
    });
    return st;
  },
  // L — The dragon and the woman slay one another in the open grave
  50: (ctx) => {
    const { g, C, S, THREE } = ctx;
    const st = stage(ctx, { town: true, clouds: 2, treeAt: 1.35 });
    const grave = C.props.grave(1.2); grave.position.set(0, 0, 0.15); g.add(grave);
    const woman = C.figure({ h: 0.9, robe: 0xb08a7a, pose: 'recline' });
    woman.position.set(-0.15, 0.12, 0.15); g.add(woman);
    const dragon = C.animals.dragon(1.25); dragon.position.set(0.2, 0.1, 0.25); dragon.rotation.y = 2.4; g.add(dragon);
    // the spoil of their double death, hovering as the plates draw radiance
    const stone = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0),
      S.mat({ color: 0xffd24a, emissive: 0x806000, emissiveIntensity: 0.8, metalness: 0.9, roughness: 0.15 }));
    stone.position.set(0, 1.4, 0.15); stone.castShadow = true; g.add(stone);
    const mound = C.props.hill(0.5, 0x4a4438); mound.position.set(-1.2, 0.02, -0.5); g.add(mound);
    return seq(st, (t) => { stone.rotation.y = t * 0.7; stone.position.y = 1.4 + Math.sin(t * 1.2) * 0.08; });
  },
};

// Fallback for any emblem without a bespoke vignette: the work at the furnace.
export function genericVignette(ctx) {
  const { g, C } = ctx;
  const st = stage(ctx, { type: 'interior' });
  const furnace = C.props.furnace(1.0); furnace.position.set(0.4, 0, -0.3); g.add(furnace);
  const adept = C.figure({ h: 0.95, robe: 0x5a5a6a, pose: 'offer', beard: true }); adept.position.set(-0.6, 0, 0.35); adept.rotation.y = 0.9; g.add(adept);
  const vessel = C.props.vessel(0.8); vessel.position.set(-0.1, 0, 0.6); g.add(vessel);
  return seq(st, (t) => { if (furnace.userData.fire) { const s = 1 + Math.sin(t * 5) * 0.15; furnace.userData.fire.scale.set(s, 1 / s, s); } });
}

export function buildVignette(num, ctx) {
  const fn = VIGNETTES[num] || genericVignette;
  return fn(ctx) || null;
}
