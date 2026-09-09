// materials.js — the workshop: meshes, roofs, colliders, plaques, surfaces, water and light
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
import { ParticleStream } from '../../systems/Particles.js?v=3';
import { Masonry } from '../../systems/Masonry.js?v=8';
import { isVariant } from '../../systems/AssetVariants.js?v=11';

export const Materials = {
  _m(geo, mat, x = 0, y = 0, z = 0, o = {}) {
    const m = new THREE.Mesh(geo, mat);
    if (this._grouping) this._madeMeshes.push(m);
    m.position.set(x, y, z);
    if (o.rx) m.rotation.x = o.rx;
    if (o.ry) m.rotation.y = o.ry;
    if (o.rz) m.rotation.z = o.rz;
    m.castShadow = o.cast !== false;
    m.receiveShadow = o.receive !== false;
    if (o.outline && this.style.outline) this.style.outline(m, o.outline === true ? 1.035 : o.outline);
    (o.parent || this.scene).add(m);
    return m;
  },

  // A roof, not a slab. Ted, 2026-09-06: "real buildings that don't have
  // impossible floating platforms". What makes a horizontal plane read as a
  // roof rather than a hovering slab is what holds it up and what it does on
  // top: a SOFFIT of beams running between the supports, and a PITCH with a
  // ridge and eaves above. This puts both under and over a rectangle.
  //   cx, cz  centre;  y  the underside;  w  along x;  d  along z;
  //   pitch   rise of the ridge (0 = flat with a parapet)
  // Returns every piece it made, so that whatever holds the roof up can be told
  // it is holding the roof up (2026-09-08; see systems/Masonry.js). A roof that
  // stays in the air when its wall is eaten out from under it is the exact
  // failure Ted's note was about.
  _roof(cx, y, cz, w, d, { pitch = 0.9, beams = true, parent = null, ridgeAlong = 'x' } = {}) {
    const S = this.style, woodcut = S.key === 'woodcut';
    const timber = woodcut ? this._darkStoneMat : this.style.mat({ color: 0x4a3420, roughness: 0.9 });
    const tile = woodcut ? this._darkStoneMat : this.style.mat({ color: 0x8a4a34, roughness: 0.85 });
    const made = [];
    const o = { parent, cast: false };
    if (beams) {
      // primary beams across the short span, purlins along the long one
      const nB = Math.max(3, Math.round((ridgeAlong === 'x' ? w : d) / 1.5));
      for (let i = 0; i < nB; i++) {
        const t = (i / (nB - 1) - 0.5);
        made.push(ridgeAlong === 'x'
          ? this._m(new THREE.BoxGeometry(0.22, 0.28, d), timber, cx + t * (w - 0.4), y + 0.14, cz, o)
          : this._m(new THREE.BoxGeometry(w, 0.28, 0.22), timber, cx, y + 0.14, cz + t * (d - 0.4), o));
      }
      const nP = 3;
      for (let i = 0; i < nP; i++) {
        const t = (i / (nP - 1) - 0.5);
        made.push(ridgeAlong === 'x'
          ? this._m(new THREE.BoxGeometry(w, 0.18, 0.18), timber, cx, y + 0.34, cz + t * (d - 0.5), o)
          : this._m(new THREE.BoxGeometry(0.18, 0.18, d), timber, cx + t * (w - 0.5), y + 0.34, cz, o));
      }
    }
    // the deck the beams carry
    made.push(this._m(new THREE.BoxGeometry(w, 0.12, d), this._stoneMat, cx, y + 0.5, cz, o));
    if (pitch <= 0) {
      made.push(this._m(new THREE.BoxGeometry(w + 0.3, 0.42, d + 0.3), this._stoneMat, cx, y + 0.72, cz, { ...o, outline: true }));
      return made;
    }
    // two sloped leaves meeting at a ridge, eaves overhanging the deck
    const along = ridgeAlong === 'x' ? w : d, across = ridgeAlong === 'x' ? d : w;
    const half = across / 2 + 0.35, leafLen = Math.hypot(half, pitch), ang = Math.atan2(pitch, half);
    for (const sgn of [-1, 1]) {
      const leaf = this._m(new THREE.BoxGeometry(ridgeAlong === 'x' ? along + 0.6 : leafLen, 0.14, ridgeAlong === 'x' ? leafLen : along + 0.6),
        tile, ridgeAlong === 'x' ? cx : cx + sgn * half / 2, y + 0.56 + pitch / 2, ridgeAlong === 'x' ? cz + sgn * half / 2 : cz, { ...o, outline: true });
      if (ridgeAlong === 'x') leaf.rotation.x = -sgn * ang; else leaf.rotation.z = sgn * ang;
      made.push(leaf);
    }
    // the ridge, and antefixes along both eaves
    made.push(ridgeAlong === 'x'
      ? this._m(new THREE.BoxGeometry(along + 0.6, 0.16, 0.24), tile, cx, y + 0.6 + pitch, cz, o)
      : this._m(new THREE.BoxGeometry(0.24, 0.16, along + 0.6), tile, cx, y + 0.6 + pitch, cz, o));
    const nA = Math.max(4, Math.round(along / 1.5));
    for (let i = 0; i < nA; i++) {
      const t = (i / (nA - 1) - 0.5) * (along - 0.4);
      for (const sgn of [-1, 1]) {
        made.push(ridgeAlong === 'x'
          ? this._m(new THREE.ConeGeometry(0.14, 0.28, 6), this._stoneMat, cx + t, y + 0.74, cz + sgn * half, o)
          : this._m(new THREE.ConeGeometry(0.14, 0.28, 6), this._stoneMat, cx + sgn * half, y + 0.74, cz + t, o));
      }
    }
    return made;
  },

  // PolyhedronGeometry is non-indexed; the draw-call merger wants a bucket
  // all indexed or all not, so any polyhedron gets a trivial index first.
  _indexed(geo) {
    if (!geo.index) geo.setIndex(Array.from({ length: geo.attributes.position.count }, (_, k) => k));
    return geo;
  },

  // A ground rectangle (w × d, centred on world cx, cz, laid flat with
  // rx = -π/2) with holes cut in it: [x, z, r] a round hole, [x, z, hw, hd] a
  // rectangular one, all in world coordinates. UVs match PlaneGeometry's so the
  // dressed texture repeats exactly as before.
  _holedGround(w, d, cx, cz, holes) {
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2, -d / 2); shape.lineTo(w / 2, -d / 2); shape.lineTo(w / 2, d / 2); shape.lineTo(-w / 2, d / 2); shape.closePath();
    for (const h of holes) {
      const lx = h[0] - cx, ly = -(h[1] - cz);           // rx = -π/2 maps local y to world -z
      const p = new THREE.Path();
      if (h.length === 3) p.absarc(lx, ly, h[2], 0, Math.PI * 2, false);
      else { p.moveTo(lx - h[2], ly - h[3]); p.lineTo(lx + h[2], ly - h[3]); p.lineTo(lx + h[2], ly + h[3]); p.lineTo(lx - h[2], ly + h[3]); p.closePath(); }
      shape.holes.push(p);
    }
    const geo = new THREE.ShapeGeometry(shape, 12);
    const uv = geo.attributes.uv, pos = geo.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / d + 0.5);
    return geo;
  },

  _holedDisc(r, cx, cz, holes) {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, r, 0, Math.PI * 2, false);
    for (const h of holes) {
      const lx = h[0] - cx, ly = -(h[1] - cz);
      const p = new THREE.Path();
      if (h.length === 3) p.absarc(lx, ly, h[2], 0, Math.PI * 2, false);
      else { p.moveTo(lx - h[2], ly - h[3]); p.lineTo(lx + h[2], ly - h[3]); p.lineTo(lx + h[2], ly + h[3]); p.lineTo(lx - h[2], ly + h[3]); p.closePath(); }
      shape.holes.push(p);
    }
    const geo = new THREE.ShapeGeometry(shape, 24);
    const uv = geo.attributes.uv, pos = geo.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / (2 * r) + 0.5, pos.getY(i) / (2 * r) + 0.5);
    return geo;
  },

  _circleCol(x, z, r) { const c = { x, z, r }; this.walker.colliders.push(c); return c; },

  _wallCol(x0, x1, z0, z1) { this.walker.walls.push({ x0, x1, z0, z1 }); },

  // Place a named NPC: registers for idle sway and the npcs registry
  _npc(key, group, x, z, faceYaw = 0, { label = null, sub = '', labelY = 2.0, sway = 0.05 } = {}) {
    if (group.userData && group.userData.billboard) this._billboards.push(group);
    group.position.set(x, 0, z);
    group.rotation.y = faceYaw;
    this.scene.add(group);
    if (label) {
      const l = this.cast.label(label, { sub });
      l.position.y = labelY;
      group.add(l);
    }
    this.npcs[key] = group;
    const n = { g: group, phase: this._npcs.length * 1.7, baseY: group.rotation.y, sway };
    // Figures expose arm pivots (Cast.js userData) — breathe them a little so
    // the poses live instead of freezing.
    const { armL, armR } = group.userData;
    if (armL && armR) { n.armL = armL; n.armR = armR; n.aL = armL.rotation.z; n.aR = armR.rotation.z; }
    this._npcs.push(n);
    return group;
  },

  // Fit a line to the plaque instead of letting it run off the edge. A plaque's
  // physical size is authored by its caller, so the text yields, not the stone:
  // step the size down until it fits, with a floor so it never becomes unreadable.
  _fitFont(x, text, maxW, basePx, family = 'Georgia', minPx = 9) {
    let px = basePx;
    x.font = px + 'px ' + family;
    while (px > minPx && x.measureText(text).width > maxW) {
      px -= 1;
      x.font = px + 'px ' + family;
    }
    return px;
  },

  _plaqueTexture({ glyph = null, glyphColor = null, main, sub }, wide = false) {
    const P = this.style.plaqueColors;
    const c = document.createElement('canvas');
    c.width = wide ? 320 : 256; c.height = glyph ? 132 : 96;
    const x = c.getContext('2d');
    x.fillStyle = P.bg; x.fillRect(0, 0, c.width, c.height);
    x.strokeStyle = P.border; x.lineWidth = 3; x.strokeRect(4, 4, c.width - 8, c.height - 8);
    x.textAlign = 'center';
    const cx = c.width / 2;
    const accent = P.accent || glyphColor || P.text;
    // the inscriptions in this book are long — "DEDICATED TO THE SVN · LAT ·
    // GRAECE · ARABICE" — and at a fixed font on a fixed canvas they were being
    // clipped at both ends. Everything is measured against the inner width now.
    const innerW = c.width - 22;
    if (glyph) {
      x.fillStyle = accent;
      this._fitFont(x, glyph, innerW, 58, 'serif', 22);   x.fillText(glyph, cx, 58);
      x.fillStyle = P.text;
      this._fitFont(x, main, innerW, 24);                 x.fillText(main, cx, 94);
      x.fillStyle = P.sub;
      this._fitFont(x, sub || '', innerW, 15);            if (sub) x.fillText(sub, cx, 117);
    } else {
      x.fillStyle = accent;
      this._fitFont(x, main, innerW, 30);                 x.fillText(main, cx, 44);
      x.fillStyle = P.sub;
      this._fitFont(x, sub || '', innerW, 14);            if (sub) x.fillText(sub, cx, 72);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    this._disp.push(t);
    return t;
  },

  _plaque(spec, w, h, x, y, z, ry = 0, wide = false) {
    const tex = this._plaqueTexture(spec, wide);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    return this._m(new THREE.PlaneGeometry(w, h), mat, x, y, z, { ry, cast: false, receive: false });
  },

  // A deterministic procedural surface baked to a canvas: a stone/foliage base
  // clouded with tonal blobs, dusted with speckle, optionally cut by carved
  // veins and horizontal ashlar courses. Blobs are drawn wrapped (±size) so the
  // texture tiles seamlessly and can repeat across the colossal masonry.
  // `flowers` (2026-09-09) scatters small coloured dots over the finished
  // surface — the far half of the spacious plain's "many sorted flowerrs",
  // where geometry would cost thousands of meshes to say what a texture says
  // for nothing. Only the plain uses it; anything nearer than about 15 m wants
  // real cards instead, because a painted flower has no silhouette.
  _surfaceTexture({ base, dark, light, blobs = 60, speckle = 2400, veins = 0, courses = 0,
                    repeat = 2, flowers = null, flowerCount = 600 } = {}) {
    const N = 256;
    const c = document.createElement('canvas');
    c.width = c.height = N;
    const x = c.getContext('2d');
    const rnd = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };

    x.fillStyle = base; x.fillRect(0, 0, N, N);

    // Tonal cloud, wrapped for seamless tiling
    for (let i = 0; i < blobs; i++) {
      const px = rnd(i, 1) * N, py = rnd(i, 2) * N, r = 14 + rnd(i, 3) * 50;
      const dv = rnd(i, 4) - 0.5;
      const col = dv < 0 ? dark : light;
      const a = (0.05 + Math.abs(dv) * 0.13).toFixed(3);
      for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) {
        if (Math.abs(px + ox - N / 2) > N || Math.abs(py + oy - N / 2) > N) continue;
        const g = x.createRadialGradient(px + ox, py + oy, 0, px + ox, py + oy, r);
        g.addColorStop(0, this._rgba(col, a));
        g.addColorStop(1, this._rgba(col, '0'));
        x.fillStyle = g; x.beginPath(); x.arc(px + ox, py + oy, r, 0, 7); x.fill();
      }
    }

    // Ashlar courses: faint recessed mortar lines, running-bond verticals
    if (courses > 0) {
      x.lineWidth = 2;
      for (let r = 1; r < courses; r++) {
        const y = (r / courses) * N + (rnd(r, 7) - 0.5) * 4;
        x.strokeStyle = this._rgba(dark, '0.5'); x.beginPath(); x.moveTo(0, y); x.lineTo(N, y); x.stroke();
        x.strokeStyle = this._rgba(light, '0.28'); x.beginPath(); x.moveTo(0, y + 1.5); x.lineTo(N, y + 1.5); x.stroke();
        const off = (r % 2) * (N / 6);
        for (let b = 0; b < 4; b++) {
          const vx = off + b * (N / 4) + (rnd(r * 5 + b, 9) - 0.5) * 10;
          const y0 = (r / courses) * N, y1 = ((r + 1) / courses) * N;
          x.strokeStyle = this._rgba(dark, '0.4'); x.beginPath(); x.moveTo(vx, y0); x.lineTo(vx, y1); x.stroke();
        }
      }
    }

    // Speckle grit
    for (let i = 0; i < speckle; i++) {
      const px = rnd(i, 5) * N, py = rnd(i, 6) * N, d = rnd(i, 7);
      x.fillStyle = d < 0.5 ? this._rgba(dark, (0.05 + d * 0.22).toFixed(3)) : this._rgba(light, (0.04 + (d - 0.5) * 0.18).toFixed(3));
      x.fillRect(px, py, 1, 1);
    }

    // Flowers, in sorts: each dot keeps one colour and neighbours cluster, so
    // the surface reads as spotted rather than as evenly sprinkled.
    if (flowers && flowers.length) {
      for (let i = 0; i < flowerCount; i++) {
        const cluster = Math.floor(rnd(i, 31) * 90);
        const cxp = rnd(cluster, 32) * N, cyp = rnd(cluster, 33) * N;
        const px = (cxp + (rnd(i, 34) - 0.5) * 34 + N) % N;
        const py = (cyp + (rnd(i, 35) - 0.5) * 34 + N) % N;
        const s = 1 + Math.floor(rnd(i, 36) * 2);
        x.fillStyle = flowers[cluster % flowers.length];
        x.globalAlpha = 0.55 + rnd(i, 37) * 0.35;
        x.fillRect(px, py, s, s);
      }
      x.globalAlpha = 1;
    }

    // Carved veins / cracks
    for (let i = 0; i < veins; i++) {
      x.lineWidth = 0.8 + rnd(i, 20) * 0.7;
      x.strokeStyle = this._rgba(dark, (0.14 + rnd(i, 8) * 0.16).toFixed(3));
      let px = rnd(i, 9) * N, py = rnd(i, 10) * N;
      x.beginPath(); x.moveTo(px, py);
      const steps = 6 + Math.floor(rnd(i, 11) * 6);
      for (let s = 0; s < steps; s++) { px += (rnd(i, s + 12) - 0.5) * 64; py += (rnd(i, s + 40) - 0.5) * 64; x.lineTo(px, py); }
      x.stroke();
    }

    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat, repeat);
    t.anisotropy = 4;
    this._disp.push(t);
    return t;
  },

  _rgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  },

  // Dress a lit material with a procedural canvas: the sRGB canvas is the
  // albedo; a linear (NoColorSpace) clone drives bump + roughness, so the
  // painted mortar and veins also read as relief under the raking sun.
  _dress(mat, tex, bumpScale = 0.3) {
    mat.color.set(0xffffff);
    mat.map = tex;
    const lin = tex.clone();
    lin.colorSpace = THREE.NoColorSpace;
    lin.needsUpdate = true;
    this._disp.push(lin);
    mat.bumpMap = lin;
    mat.bumpScale = bumpScale;
    mat.roughnessMap = lin;
  },

  // Concentric-ripple water albedo, so the slow spin of the fountain discs
  // is visible as moving water rather than a featureless plate.
  // Water has two variants (Graphics menu). `primitive` is the founding look —
  // a flat coloured disc, still. `painterly` is the tempera register Ted asked
  // for: the ripple rings are painted into the albedo, a second caustic sheet
  // drifts over the top the way light does on a shallow basin, and both turn
  // slowly. Woodcut mode keeps its flat ink either way.
  _waterMat() {
    const S = this.style;
    const m = S.waterMat();
    if (S.key === 'woodcut' || isVariant('water', 'primitive', S.key)) return m;
    // Ted, 2026-09-06: "fountains that look like real water". What water
    // actually does is reflect the sky and the building, break that reflection
    // into moving ripples, and let you see into it. So: a mirror finish that
    // takes the shared environment map, a tiled ripple NORMAL map whose offset
    // drifts every frame (two layers, counter-drifting, so it never reads as a
    // sliding sheet), a cool tint you can see through, and the old painted
    // rings kept underneath as the bed you see through it.
    m.color.set(0x8fb8c8);
    m.map = null;
    m.normalMap = this._waterNormal();
    // 2026-09-08: the ripples were too faint and the finish too near a perfect
    // mirror, so at grazing angles -- which is how you see water from a 1.7 m
    // eye -- the sun's reflection blew out into a solid white wash across the
    // whole surface and spilled onto the bank. A real sun path on water is not
    // a sheet; it is BROKEN by the ripples into glitter. So the ripples got
    // twice the depth and the finish a little tooth. It is still a mirror.
    m.normalScale = new THREE.Vector2(1.15, 1.15);
    m.roughness = 0.12;
    m.metalness = 0.12;
    m.envMapIntensity = 1.6;
    m.transparent = true;
    m.opacity = 0.72;
    m.emissive = new THREE.Color(0x0e2a3a);
    m.emissiveIntensity = 0.35;
    m.depthWrite = false;
    return m;
  },

  // A jet of water from A to B: a solid arc you can see — a thin tube along a
  // parabola in the water material — with a stream of sparkle along it and a
  // splash where it lands. Particles alone read as glitter; a tube alone reads
  // as glass; together they read as a jet. `apex` is how high the arc rises
  // above the higher of its two ends.
  _jet(ax, ay, az, bx, by, bz, { r = 0.022, apex = 0.5, color = 0xd8eeff, sparkle = 22 } = {}) {
    const S = this.style;
    const top = Math.max(ay, by) + apex;
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(ax, ay, az), new THREE.Vector3((ax + bx) / 2, top * 2 - (ay + by) / 2, (az + bz) / 2), new THREE.Vector3(bx, by, bz));
    if (S.key !== 'woodcut') {
      this._jetMat = this._jetMat || (() => {
        const m = new THREE.MeshStandardMaterial({ color, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.62,
          emissive: 0x9ac4e8, emissiveIntensity: 0.25, depthWrite: false, envMapIntensity: 1.8 });
        this._disp.push(m); return m;
      })();
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, r, 6, false), this._jetMat);
      tube.castShadow = false; tube.receiveShadow = false; tube.renderOrder = 2;
      this.scene.add(tube);
      // the splash where it lands
      const splashMat = this._splashMat = this._splashMat || (() => {
        const m = new THREE.MeshBasicMaterial({ color: 0xf2f8ff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false });
        this._disp.push(m); return m;
      })();
      this._m(new THREE.CircleGeometry(r * 7, 12), splashMat, bx, by + 0.012, bz, { rx: -Math.PI / 2, cast: false, receive: false });
    }
    const stream = new ParticleStream({
      count: sparkle, source: new THREE.Vector3(ax, ay, az), target: new THREE.Vector3(bx, by, bz),
      color: 0xeaf4ff, size: 0.03, speed: 0.55, arc: apex,
    });
    stream.opacity = 0.55; stream.active = true; S.tuneStream(stream);
    this.scene.add(stream.points); this._streams.push(stream);
    return stream;
  },

  // One ripple normal map, shared by every water in the world and animated
  // in update(). Sum of a few sine ridges plus a cellular jitter, encoded as
  // a tangent-space normal.
  _waterNormal() {
    if (this._waterNrm) return this._waterNrm;
    const N = 256;
    const c = document.createElement('canvas'); c.width = c.height = N;
    const x = c.getContext('2d');
    const img = x.createImageData(N, N);
    const h = (i, j) => {
      const u = i / N * Math.PI * 2, v = j / N * Math.PI * 2;
      return Math.sin(u * 3 + Math.sin(v * 2) * 1.3) * 0.5 + Math.sin(v * 5 + Math.cos(u * 3) * 1.1) * 0.35
           + Math.sin((u + v) * 7) * 0.15 + Math.sin(u * 11 - v * 9) * 0.08;
    };
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const dx = (h((i + 1) % N, j) - h((i - 1 + N) % N, j)) * 2.2;
      const dy = (h(i, (j + 1) % N) - h(i, (j - 1 + N) % N)) * 2.2;
      const len = Math.hypot(dx, dy, 1);
      const k = (j * N + i) * 4;
      img.data[k] = 128 + (-dx / len) * 127; img.data[k + 1] = 128 + (-dy / len) * 127; img.data[k + 2] = 128 + (1 / len) * 127; img.data[k + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.NoColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2.5, 2.5);
    this._disp.push(t);
    this._waterNrm = t;
    return t;
  },

  _waterIsPainterly() {
    return this.style.key !== 'woodcut' && !isVariant('water', 'primitive', this.style.key);
  },

  // A caustic sheet: pale interlocking loops on black, added over the water so
  // the surface has a moving glint rather than a uniform sheen.
  _causticTexture() {
    if (this._caustic) return this._caustic;
    const N = 256;
    const c = document.createElement('canvas');
    c.width = c.height = N;
    const x = c.getContext('2d');
    const rnd = (i, k) => { const v = Math.sin(i * 57.3 + k * 191.7) * 43758.5453; return v - Math.floor(v); };
    x.fillStyle = '#000000'; x.fillRect(0, 0, N, N);
    x.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 34; i++) {
      const cx = rnd(i, 1) * N, cy = rnd(i, 2) * N;
      const r  = 10 + rnd(i, 3) * 34;
      x.lineWidth = 1.5 + rnd(i, 4) * 2.6;
      x.strokeStyle = `rgba(190,225,255,${(0.10 + rnd(i, 5) * 0.16).toFixed(3)})`;
      for (const [ox, oy] of [[0, 0], [N, 0], [-N, 0], [0, N], [0, -N]]) {
        x.beginPath();
        x.ellipse(cx + ox, cy + oy, r, r * (0.5 + rnd(i, 6) * 0.6), rnd(i, 7) * 3.14, 0, 6.3);
        x.stroke();
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 2);
    t.colorSpace = THREE.SRGBColorSpace;
    this._disp.push(t);
    this._caustic = t;
    return t;
  },

  // Lay a caustic sheet just above a body of water, and register it to drift.
  _caustics(x, y, z, radius, rate = 0.05) {
    if (!this._waterIsPainterly()) return;
    const mat = new THREE.MeshBasicMaterial({
      map: this._causticTexture(), transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this._disp.push(mat);
    const m = this._m(new THREE.CircleGeometry(radius, 28), mat, x, y + 0.012, z,
      { rx: -Math.PI / 2, cast: false, receive: false });
    this._waters.push({ m, rate: -rate });      // counter-turning, so it shimmers
  },

  _waterTexture() {
    const N = 256;
    const c = document.createElement('canvas');
    c.width = c.height = N;
    const x = c.getContext('2d');
    const rnd = (i, k) => { const v = Math.sin(i * 91.7 + k * 269.5) * 43758.5453; return v - Math.floor(v); };
    x.fillStyle = '#2a4a6a'; x.fillRect(0, 0, N, N);
    for (let i = 0; i < 46; i++) {
      const r = 8 + rnd(i, 1) * 120;
      const a0 = rnd(i, 2) * Math.PI * 2, span = 0.5 + rnd(i, 3) * 2.2;
      x.lineWidth = 1 + rnd(i, 4) * 1.6;
      x.strokeStyle = rnd(i, 5) < 0.7
        ? `rgba(140,190,230,${(0.08 + rnd(i, 6) * 0.14).toFixed(3)})`
        : `rgba(16,36,58,${(0.10 + rnd(i, 6) * 0.12).toFixed(3)})`;
      x.beginPath(); x.arc(N / 2, N / 2, r, a0, a0 + span); x.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    this._disp.push(t);
    return t;
  },
};
