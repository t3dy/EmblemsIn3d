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
import { isVariant, variantOf } from './AssetVariants.js?v=5';

export function makeCast(S) {
  const mats = new Map();
  const M = (color, extra = {}) => {
    const key = color + JSON.stringify(extra);
    if (!mats.has(key)) mats.set(key, S.mat({ color, ...extra }));
    return mats.get(key);
  };
  const SKIN   = 0xd8c4a4;
  const lit = S.key !== 'woodcut';
  const add = (g, mesh) => { mesh.castShadow = true; mesh.receiveShadow = true; g.add(mesh); return mesh; };
  const mesh = (geo, mat, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    return m;
  };

  // ── Painterly detail (lit rendering only; the woodcut keeps its line) ─────

  // A fine weave, used as a shared bump map so every robe reads as cloth
  // rather than plastic (TEXTURES.md §5).
  let _weave = null;
  function weave() {
    if (_weave) return _weave;
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const x = c.getContext('2d');
    x.fillStyle = '#808080'; x.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 64; i += 2) {
      x.fillStyle = i % 4 ? '#8a8a8a' : '#747474';
      x.fillRect(i, 0, 1, 64); x.fillRect(0, i, 64, 1);
    }
    for (let i = 0; i < 260; i++) {
      const v = Math.sin(i * 127.1) * 43758.5453, r = v - Math.floor(v);
      x.fillStyle = r > 0.5 ? '#8e8e8e' : '#727272';
      x.fillRect((r * 6151) % 64 | 0, (r * 9277) % 64 | 0, 1, 1);
    }
    _weave = new THREE.CanvasTexture(c);
    _weave.colorSpace = THREE.NoColorSpace;
    _weave.wrapS = _weave.wrapT = THREE.RepeatWrapping;
    _weave.repeat.set(6, 6);
    return _weave;
  }

  // ── The painterly (tempera) register ─────────────────────────────────────
  // Ted's art direction: "a Botticelli panel you can walk into" — flatter light,
  // painted drapery, a limited palette, outlines kept (DECISIONS.md 2026-09-05).
  // The `painted` figure variant swaps the PBR surface for painted cloth: the
  // folds are DRAWN into the albedo the way tempera drapery is, rather than
  // being lit into existence, and the material stops taking a specular
  // highlight. Same silhouette as `modelled`, a very different surface.
  function figVariant() { return variantOf('figure', S.key) || 'primitive'; }

  const _paintedRobes = new Map();
  function paintedRobeTexture(color) {
    if (_paintedRobes.has(color)) return _paintedRobes.get(color);
    const W = 256, H = 256;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');
    const r = (color >> 16) & 255, g = (color >> 8) & 255, b = color & 255;
    const mix = (t) => `rgb(${Math.round(r + (255 - r) * t)},${Math.round(g + (255 - g) * t)},${Math.round(b + (255 - b) * t)})`;
    const shade = (t) => `rgb(${Math.round(r * (1 - t))},${Math.round(g * (1 - t))},${Math.round(b * (1 - t))})`;
    x.fillStyle = `rgb(${r},${g},${b})`; x.fillRect(0, 0, W, H);
    // Long directional folds — few, and running the height of the cloth, which
    // is how Quattrocento drapery is drawn (research/nymphs.html on Goujon).
    for (let i = 0; i < 9; i++) {
      const v = Math.sin(i * 91.7 + color * 0.0007) * 43758.5453;
      const f = v - Math.floor(v);
      const cx = f * W;
      const w = 8 + f * 26;
      const gd = x.createLinearGradient(cx - w, 0, cx + w, 0);
      gd.addColorStop(0, shade(0.34));
      gd.addColorStop(0.45, mix(0.16));
      gd.addColorStop(1, shade(0.28));
      x.fillStyle = gd;
      x.globalAlpha = 0.55;
      x.fillRect(cx - w, 0, w * 2, H);
    }
    x.globalAlpha = 1;
    // A warm ground glaze at the hem, as tempera darkens toward the floor
    const hem = x.createLinearGradient(0, H * 0.62, 0, H);
    hem.addColorStop(0, 'rgba(0,0,0,0)');
    hem.addColorStop(1, 'rgba(30,16,6,0.42)');
    x.fillStyle = hem; x.fillRect(0, H * 0.62, W, H * 0.38);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    _paintedRobes.set(color, t);
    return t;
  }

  // Flat, painted cloth: no metalness, high roughness, the folds in the map.
  const _paintedMats = new Map();
  function PaintedM(color) {
    if (_paintedMats.has(color)) return _paintedMats.get(color);
    const m = S.mat({ color: 0xffffff, roughness: 1.0, metalness: 0.0 });
    m.map = paintedRobeTexture(color);
    _paintedMats.set(color, m);
    return m;
  }

  // A robe material: the shared colour cache, plus the weave (lit only) and a
  // silk-adjacent roughness. Cached separately from plain colours.
  function RobeM(color) {
    if (lit && figVariant() === 'painted') return PaintedM(color);
    const m = M(color, { roughness: 0.62, metalness: 0.03 });
    if (lit && !m.bumpMap) { m.bumpMap = weave(); m.bumpScale = 0.012; }
    return m;
  }

  // The face, painted once and mapped onto the head sphere. Drawn in neutral
  // tone on near-white so the material colour carries the skin (a gold planet
  // statue gets chased-metal features, a nymph gets paint): almond eyes with
  // dark iris under a lid line, arched brows, the shadow of a nose, a small
  // rosebud mouth, soft blush. The figures' canonical front is +z (the beard
  // and the carried attributes sit there), and sphere UV puts +z at u = 0.25,
  // so the face is painted there.
  let _face = null;
  function faceTexture() {
    if (_face) return _face;
    const W = 256, H = 128;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');
    const g0 = x.createLinearGradient(0, 0, 0, H);
    g0.addColorStop(0, '#f4ece0'); g0.addColorStop(0.55, '#f0e6d6'); g0.addColorStop(1, '#e6d6c2');
    x.fillStyle = g0; x.fillRect(0, 0, W, H);
    // eyes sit just BELOW the sphere's equator: the nymphs' hair cap covers
    // the whole upper hemisphere, so anything above v = 0.5 is under hair
    const cx = W * 0.25, ey = H * 0.555;
    const soft = (px, py, r, col, a) => {
      const gr = x.createRadialGradient(px, py, 0, px, py, r);
      gr.addColorStop(0, col.replace('A', a)); gr.addColorStop(1, col.replace('A', '0'));
      x.fillStyle = gr; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill();
    };
    // blush and eye-socket shading
    for (const s of [-1, 1]) soft(cx + s * 15, ey + 17, 11, 'rgba(196,110,100,A)', '0.30');
    for (const s of [-1, 1]) soft(cx + s * 9.5, ey - 1, 7, 'rgba(150,110,80,A)', '0.28');
    // eyes: lid line, iris, lash corner
    for (const s of [-1, 1]) {
      const ex = cx + s * 9.5;
      x.strokeStyle = 'rgba(66,44,28,0.9)'; x.lineWidth = 1.6;
      x.beginPath(); x.ellipse(ex, ey, 4.6, 2.4, 0, Math.PI, 2 * Math.PI); x.stroke();
      x.fillStyle = 'rgba(74,50,30,0.95)';
      x.beginPath(); x.arc(ex, ey - 0.4, 1.7, 0, 7); x.fill();
      x.strokeStyle = 'rgba(90,62,40,0.8)'; x.lineWidth = 1.2;
      x.beginPath(); x.ellipse(ex, ey + 1.2, 4.2, 1.6, 0, 0, Math.PI); x.stroke();
      // brow
      x.strokeStyle = 'rgba(96,66,40,0.85)'; x.lineWidth = 1.8;
      x.beginPath(); x.ellipse(ex + s * 0.6, ey - 5.4, 5.4, 2.6, s * 0.12, Math.PI * 1.15, Math.PI * 1.85); x.stroke();
    }
    // nose: a shadow, not a line
    soft(cx - 1.6, ey + 8, 4.5, 'rgba(150,110,80,A)', '0.22');
    x.fillStyle = 'rgba(120,84,58,0.5)';
    for (const s of [-1, 1]) { x.beginPath(); x.arc(cx + s * 1.8, ey + 10.5, 0.8, 0, 7); x.fill(); }
    // mouth: small, full, slightly parted
    x.fillStyle = 'rgba(164,74,70,0.9)';
    x.beginPath(); x.ellipse(cx, ey + 16.5, 3.6, 1.5, 0, 0, Math.PI); x.fill();
    x.beginPath(); x.ellipse(cx - 1.5, ey + 15.2, 1.8, 1.2, 0, Math.PI, 2 * Math.PI); x.fill();
    x.beginPath(); x.ellipse(cx + 1.5, ey + 15.2, 1.8, 1.2, 0, Math.PI, 2 * Math.PI); x.fill();
    x.strokeStyle = 'rgba(110,50,46,0.65)'; x.lineWidth = 0.9;
    x.beginPath(); x.moveTo(cx - 3.2, ey + 15.4); x.quadraticCurveTo(cx, ey + 16.6, cx + 3.2, ey + 15.4); x.stroke();
    // chin and jaw shading
    soft(cx, ey + 24, 8, 'rgba(150,110,80,A)', '0.16');
    _face = new THREE.CanvasTexture(c);
    _face.colorSpace = THREE.SRGBColorSpace;
    return _face;
  }

  // One face material per skin tone (the texture is shared)
  function FaceM(skin) {
    if (!lit) return M(skin, { roughness: 0.6 });
    const key = 'face' + skin;
    if (!mats.has(key)) {
      mats.set(key, new THREE.MeshStandardMaterial({ color: skin, roughness: 0.55, map: faceTexture() }));
    }
    return mats.get(key);
  }

  // ── People ────────────────────────────────────────────────────────────────

  // A human figure ~1.7 * h tall. Poses: stand | reach (arms up) | point
  // (right arm forward) | recline (lying) | sit | beckon (right arm raised).
  // A feathered wing — a Group whose pivot sits at the shoulder root, so a
  // scene can still flap it by setting rotation.z (as the vignettes do). Two
  // fanned rows of vane-feathers (flattened 4-sided cones, ridged, curled just
  // out of plane so they never read as flat cards), a leading-edge bone, and a
  // few drips of molten wax running off the joint — Cupid's borrowed wings.
  // `s` is −1 for the left wing, +1 for the right.
  function featherWing(h, s) {
    const wing = new THREE.Group();
    const fMat  = M(0xece4d4, { roughness: 0.72, side: THREE.DoubleSide });
    const boneM = M(0xd6c9b0, { roughness: 0.7 });
    const waxM  = M(0xf0cf78, { roughness: 0.28, emissive: lit ? 0x5a3c08 : 0x000000,
                                emissiveIntensity: lit ? 0.4 : 0 });

    // leading-edge bone, swept outward from the shoulder
    const bone = mesh(new THREE.CapsuleGeometry(0.022 * h, 0.32 * h, 4, 6), boneM,
                      s * 0.17 * h, 0.02 * h, 0);
    bone.rotation.z = -s * (Math.PI / 2.25);
    wing.add(bone);

    // coverts (short, in front) then primaries (long, sweeping down and back);
    // the counts are high enough that the vanes overlap into a wing, not a fan
    const rows = [
      { n:  8, base: 0.30, grow: 0.24, w: 0.052, z:  0.016, top: 0.02, bot: 0.66 },
      { n: 12, base: 0.50, grow: 0.52, w: 0.064, z: -0.020, top: 0.10, bot: 1.05 },
    ];
    for (const row of rows) {
      for (let j = 0; j < row.n; j++) {
        const frac = row.n > 1 ? j / (row.n - 1) : 0;
        const L = h * (row.base + row.grow * frac);
        const cone = new THREE.ConeGeometry(row.w * h, L, 4);
        cone.translate(0, L / 2, 0);          // base at the quill root, tip outward
        const fm = mesh(cone, fMat, 0, 0, 0);
        fm.scale.z = 0.33;                     // flatten the diamond into a vane
        fm.rotation.y = Math.PI / 4;           // turn the ridge to the front
        const fp = new THREE.Group();
        fp.add(fm);
        const down = row.top + (row.bot - row.top) * frac;   // fan angle, top→down
        fp.rotation.z = -s * (Math.PI / 2 + down);
        fp.rotation.x = s * 0.07 * frac;       // curl out of plane — never a flat card
        fp.position.set(s * 0.05 * h, 0, row.z * h - j * 0.007 * h);
        wing.add(fp);
      }
    }

    // molten wax running off the wing — thin at the top, bulbous where it hangs
    for (const [ox, len] of [[0.05, 0.17], [0.15, 0.24], [0.27, 0.13]]) {
      const l = len * h;
      const tail = new THREE.ConeGeometry(0.033 * h, l, 8);
      tail.translate(0, -l / 2, 0);            // apex at the wing, base hanging down
      const tm = mesh(tail, waxM, s * ox * h, -0.02 * h, 0.03 * h);
      wing.add(tm);
      const bulb = mesh(new THREE.SphereGeometry(0.036 * h, 10, 8), waxM,
                        s * ox * h, -0.02 * h - l, 0.03 * h);
      bulb.scale.y = 1.35;
      wing.add(bulb);
    }
    return wing;
  }

  function figure({ h = 1, skin = SKIN, robe = null, pose = 'stand', crowned = false,
                    winged = false, twoHeaded = false, hat = null, beard = false } = {}) {
    const g = new THREE.Group();
    const sm = M(skin, { roughness: 0.6 });
    const parts = g.userData;

    // `primitive` is the founding look: a cone for the robe, capsules for legs.
    // `modelled` and `painted` share a better build — the same turned gown the
    // nymphs use, tapered legs, and a torso that is wider at the shoulder than
    // at the waist, so the figure has a silhouette instead of a barrel.
    const prim = figVariant() === 'primitive';
    if (robe != null) {
      if (prim) {
        add(g, mesh(new THREE.ConeGeometry(0.26 * h, 0.85 * h, 12), RobeM(robe), 0, 0.425 * h));
      } else {
        const gown = add(g, mesh(gownGeometry(h), RobeM(robe), 0, 0));
        gown.scale.set(1.04, 0.92, 1.04);
      }
    } else if (prim) {
      for (const s of [-1, 1]) add(g, mesh(new THREE.CapsuleGeometry(0.065 * h, 0.55 * h, 4, 8), sm, s * 0.1 * h, 0.38 * h));
    } else {
      for (const s of [-1, 1]) {
        add(g, mesh(new THREE.CylinderGeometry(0.055 * h, 0.075 * h, 0.62 * h, 9), sm, s * 0.095 * h, 0.4 * h));
        add(g, mesh(new THREE.SphereGeometry(0.062 * h, 9, 7), sm, s * 0.095 * h, 0.72 * h));   // hip
        const ft = add(g, mesh(new THREE.SphereGeometry(0.052 * h, 8, 6), sm, s * 0.095 * h, 0.05 * h, 0.02 * h));
        ft.scale.set(0.8, 0.5, 1.5);
      }
    }
    if (prim) {
      add(g, mesh(new THREE.CapsuleGeometry(0.16 * h, 0.5 * h, 6, 10), robe != null ? RobeM(robe) : sm, 0, 1.05 * h));
    } else {
      const torsoMat = robe != null ? RobeM(robe) : sm;
      const chest = add(g, mesh(new THREE.CylinderGeometry(0.175 * h, 0.125 * h, 0.44 * h, 12), torsoMat, 0, 1.09 * h));
      chest.scale.set(1, 1, 0.78);
      add(g, mesh(new THREE.SphereGeometry(0.15 * h, 12, 9), torsoMat, 0, 0.9 * h)).scale.set(1, 0.72, 0.78);
      for (const s of [-1, 1]) {                                  // shoulders
        add(g, mesh(new THREE.SphereGeometry(0.072 * h, 10, 8), torsoMat, s * 0.155 * h, 1.28 * h))
          .scale.set(1, 0.85, 0.85);
      }
    }
    // a neck, so the head no longer floats on the shoulders
    add(g, mesh(new THREE.CylinderGeometry(0.05 * h, 0.062 * h, 0.12 * h, 8), sm, 0, 1.38 * h));

    const heads = twoHeaded ? [-0.12, 0.12] : [0];
    for (const hx of heads) {
      const head = add(g, mesh(new THREE.SphereGeometry(0.13 * h, 14, 12), FaceM(skin), hx * h, 1.52 * h));
      head.scale.set(0.95, 1.06, 0.97);
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
      // a hand: every existing gesture reads better ending in one
      const hd = mesh(new THREE.SphereGeometry(0.042 * h, 8, 6), sm, 0, -0.5 * h, 0);
      hd.scale.set(0.85, 1.15, 0.7);
      hd.castShadow = true;
      pivot.add(hd);
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
      for (const s of [-1, 1]) {
        // wings spring from the shoulder blades — the BACK, which is −z
        const w = featherWing(h, s);
        w.position.set(s * 0.13 * h, 1.22 * h, -0.11 * h);
        w.rotation.y = s * 0.42; w.rotation.z = s * 0.5;
        g.add(w);
        if (s < 0) parts.wingL = w; else parts.wingR = w;
      }
    }
    if (pose === 'recline') { g.rotation.z = Math.PI / 2; g.position.y = 0.22 * h; }
    return g;
  }

  // ── The nymph ─────────────────────────────────────────────────────────────
  //
  // Not a cone with a head on it. The project's own sourcebook
  // (research/nymphs.html) sets the brief from three places:
  //   · the 1499 woodcuts — "high-belted gowns, sleeves gathered at the
  //     shoulder, hair bound with fillets … fewer folds, clearer silhouette";
  //   · Cellini's Fontainebleau nymph — the elongated Mannerist body, which
  //     "reads beautifully at low poly counts, all silhouette and sweep";
  //   · Goujon's Innocents naiads — "carve the folds as geometry … few, long,
  //     directional."
  // So: a LatheGeometry gown cinched at a high waist and falling in four long
  // folds, Mannerist proportions (~8½ heads, small head, long limbs), jointed
  // arms that clear the silhouette and end in hands, a neck, and hair bound
  // with a fillet over a chignon.

  // The gown: one turned profile from hem to shoulder, then displaced into a
  // few long vertical folds that fade out as they rise to the waist.
  // Cached by height. The gown is a LatheGeometry whose vertices are then
  // displaced into folds, which is far too much work to redo for every figure
  // in the garden — building it fresh each time made switching to the
  // `modelled` figures take several seconds.
  const _gowns = new Map();
  function gownGeometry(h) {
    const key = Math.round(h * 1000);
    if (_gowns.has(key)) return _gowns.get(key);
    const geo = _gownGeometryBuild(h);
    _gowns.set(key, geo);
    return geo;
  }
  function _gownGeometryBuild(h) {
    const profile = [
      [0.000, 0.000], [0.250, 0.000],   // hem, closed at the centre
      [0.238, 0.055], [0.212, 0.200],
      [0.184, 0.380], [0.158, 0.560],
      [0.138, 0.740], [0.118, 0.890],
      [0.104, 0.980],                   // the high waist — the 1499 cinch
      [0.128, 1.080], [0.138, 1.160],   // the bust
      [0.130, 1.230],
      [0.122, 1.310], [0.072, 1.362],   // shoulder slope into the neck
    ].map(([r, y]) => new THREE.Vector2(Math.max(r, 0.0001) * h, y * h));

    const geo = new THREE.LatheGeometry(profile, 20);
    const pos = geo.attributes.position;
    const waist = 0.98 * h;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const r = Math.hypot(x, z);
      if (r < 1e-4 || y > waist) continue;
      // Goujon's flow-lines: four long folds, deepest at the hem, with a
      // finer second order of creases between them — the painters' trick of
      // large form carrying small incident
      const theta = Math.atan2(z, x);
      const ramp = 1 - y / waist;
      const k = 1 + (Math.sin(theta * 4) * 0.055 + Math.sin(theta * 9 + 1.7) * 0.020) * ramp;
      pos.setX(i, x * k);
      pos.setZ(i, z * k);
    }
    geo.computeVertexNormals();
    return geo;
  }

  // Shoulder → elbow → hand, so a pose bends where an arm bends and the hand
  // carries whatever she has been given.
  function makeArm(sx, h, skinMat, robeMat) {
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.118 * h, 1.292 * h, 0);
    // sleeve gathered at the shoulder
    const puff = mesh(new THREE.SphereGeometry(0.055 * h, 10, 8), robeMat, 0, 0.012 * h, 0);
    puff.scale.set(1, 0.85, 1);
    puff.castShadow = true;
    pivot.add(puff);
    const upper = mesh(new THREE.CapsuleGeometry(0.031 * h, 0.20 * h, 4, 8), skinMat, 0, -0.13 * h, 0);
    upper.castShadow = true;
    pivot.add(upper);

    const elbow = new THREE.Group();
    elbow.position.set(0, -0.265 * h, 0);
    const fore = mesh(new THREE.CapsuleGeometry(0.026 * h, 0.18 * h, 4, 8), skinMat, 0, -0.115 * h, 0);
    fore.castShadow = true;
    elbow.add(fore);

    const hand = new THREE.Group();
    hand.position.set(0, -0.238 * h, 0);
    const palm = mesh(new THREE.SphereGeometry(0.030 * h, 8, 6), skinMat, 0, 0, 0);
    palm.scale.set(0.85, 1.15, 0.7);
    palm.castShadow = true;
    hand.add(palm);
    elbow.add(hand);
    pivot.add(elbow);
    pivot.userData.elbow = elbow;
    pivot.userData.hand = hand;
    return pivot;
  }

  // How far each carried object drops from the palm to sit in the grip
  const ATTRIBUTE_GRIP = {
    harp: -0.15, mirror: -0.03, casket: -0.09, flask: -0.11, lute: -0.11, cornucopia: 0,
  };

  // [shoulder z (out/in), shoulder x (fore/aft), elbow bend]
  const NYMPH_POSES = {
    stand:   { L: [-0.20,  0.05, 0.30], R: [ 0.20,  0.05, 0.30] },
    offer:   { L: [-0.36, -0.55, 0.80], R: [ 0.36, -0.55, 0.80] },
    carry:   { L: [-0.18,  0.06, 0.26], R: [ 0.30, -0.75, 1.05] },
    point:   { L: [-0.17,  0.06, 0.32], R: [ 0.26, -1.35, 0.10] },
    beckon:  { L: [-0.17,  0.06, 0.32], R: [ 0.26, -1.95, 1.15] },
    reach:   { L: [-0.80, -0.30, 0.18], R: [ 0.80, -0.30, 0.18] },
    sit:     { L: [-0.26, -0.45, 0.90], R: [ 0.26, -0.45, 0.90] },
    recline: { L: [-0.30, -0.15, 0.50], R: [ 0.30, -0.15, 0.50] },
  };

  // A gowned nymph. `attribute` puts an identifying object in her right hand,
  // the way the 1499 text identifies the five nymphs of the senses by what each
  // carries (docs/HP_SOURCEBOOK.md §3): Osfressia the perfume casket, Orassia
  // the shining glass, Achoe the sounding harp, Geussia the casting bottle.
  // Aphea carries nothing — she is the one who offers her hand.
  function nymph({ name = '', robe = 0xb8a0c8, h = 0.95, pose = 'stand',
                   attribute = null, hair = 0x4a3018, crowned = false, winged = false } = {}) {
    const g = new THREE.Group();
    const parts = g.userData;
    const skinMat = M(SKIN, { roughness: 0.6 });
    const robeMat = RobeM(robe);
    const trimM = M(0xd8b048, { metalness: 0.75, roughness: 0.35 });

    add(g, mesh(gownGeometry(h), robeMat, 0, 0, 0));
    // gold trim at hem and neckline — the border every quattrocento painter
    // gives a gown — and the girdle at the high waist the woodcuts draw
    const hemBand = add(g, mesh(new THREE.TorusGeometry(0.244 * h, 0.010 * h, 6, 28), trimM, 0, 0.028 * h));
    hemBand.rotation.x = Math.PI / 2;
    const neckBand = add(g, mesh(new THREE.TorusGeometry(0.076 * h, 0.008 * h, 6, 18), trimM, 0, 1.352 * h));
    neckBand.rotation.x = Math.PI / 2;
    const belt = add(g, mesh(new THREE.TorusGeometry(0.110 * h, 0.014 * h, 6, 20),
      M(0xd8c088, { metalness: 0.6, roughness: 0.4 }), 0, 0.978 * h));
    belt.rotation.x = Math.PI / 2;

    add(g, mesh(new THREE.CylinderGeometry(0.036 * h, 0.045 * h, 0.10 * h, 8), skinMat, 0, 1.40 * h));
    const head = add(g, mesh(new THREE.SphereGeometry(0.100 * h, 16, 14), FaceM(SKIN), 0, 1.552 * h));
    head.scale.set(0.94, 1.08, 0.96);
    parts.head = head;

    // hair: a bound mass swept back off the brow, a fillet, and a chignon
    // behind. The cap must stop above the eyes — drawn any lower it reads as a
    // visor rather than a hairline.
    const hairMat = M(hair, { roughness: 0.85 });
    const cap = add(g, mesh(new THREE.SphereGeometry(0.104 * h, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), hairMat, 0, 1.556 * h, -0.010 * h));
    cap.scale.set(1.0, 1.05, 1.06);
    add(g, mesh(new THREE.SphereGeometry(0.056 * h, 10, 8), hairMat, 0, 1.508 * h, -0.094 * h));
    const fillet = add(g, mesh(new THREE.TorusGeometry(0.101 * h, 0.0075 * h, 6, 20),
      M(0xd8c9a8, { roughness: 0.55 }), 0, 1.594 * h, -0.004 * h));
    fillet.rotation.x = Math.PI / 2 - 0.2;

    if (crowned) {
      const cr = add(g, mesh(new THREE.TorusGeometry(0.098 * h, 0.024 * h, 6, 14),
        M(0xffd24a, { metalness: 0.9, roughness: 0.2 }), 0, 1.632 * h));
      cr.rotation.x = Math.PI / 2.3;
    }

    parts.armL = makeArm(-1, h, skinMat, robeMat);
    parts.armR = makeArm( 1, h, skinMat, robeMat);
    g.add(parts.armL); g.add(parts.armR);

    const P = NYMPH_POSES[attribute && pose === 'stand' ? 'carry' : pose] || NYMPH_POSES.stand;
    for (const [pivot, spec] of [[parts.armL, P.L], [parts.armR, P.R]]) {
      pivot.rotation.z = spec[0];
      pivot.rotation.x = spec[1];
      pivot.userData.elbow.rotation.x = spec[2];
    }

    if (winged) {
      for (const s of [-1, 1]) {
        const w = featherWing(h, s);
        w.position.set(s * 0.13 * h, 1.16 * h, -0.06 * h);
        w.rotation.y = s * 0.42; w.rotation.z = s * 0.5;
        g.add(w);
        if (s < 0) parts.wingL = w; else parts.wingR = w;
      }
    }

    if (attribute && attributes[attribute]) {
      const item = attributes[attribute](h);
      parts.armR.userData.hand.add(item);   // travels with the pose
      // each attribute is modelled standing on its own base, so it needs
      // dropping until the grip falls in the palm
      const drop = ATTRIBUTE_GRIP[attribute] ?? -0.06;
      item.position.set(0, drop * h, 0.03 * h);
      parts.attribute = item;
    }

    // Contrapposto, cheaply: a Renaissance figure is never symmetrical about
    // its own axis. Tilt the head (and counter-tilt the shoulders) by a small
    // amount derived from the name, so each nymph stands a little differently
    // and none of them looks stamped.
    const seed = Array.from(name).reduce((a, c) => a + c.charCodeAt(0), name.length);
    const tilt = ((seed % 7) - 3) * 0.026;
    parts.head.rotation.z = tilt;
    cap.rotation.z = tilt; fillet.rotation.z = tilt;
    parts.armL.rotation.z -= tilt * 0.5;
    parts.armR.rotation.z -= tilt * 0.5;

    if (pose === 'recline') { g.rotation.z = Math.PI / 2; g.position.y = 0.22 * h; }
    parts.name = name;
    return g;
  }

  // ── Carried attributes (the senses' emblems) ──────────────────────────────

  const attributes = {
    // Achoe, Hearing: "shee that carrieth the sounding Harpe". The angular
    // harp of the plates: a triangle of soundbox, neck and forepillar, strung
    // across the opening.
    harp: (h = 1) => {
      const g = new THREE.Group();
      const wm = M(0x8a5a2a, { roughness: 0.6 });
      const sm = M(0xf0e0b0, { metalness: 0.5, roughness: 0.35 });
      const H = 0.26 * h, W = 0.15 * h;
      // soundbox: the deep member the strings are pinned to, leaning back
      const box = add(g, mesh(new THREE.CapsuleGeometry(0.021 * h, H * 0.86, 4, 8), wm, 0, H / 2, 0));
      box.rotation.z = 0.16;
      // forepillar, from the foot out to the top of the neck
      const pillar = add(g, mesh(new THREE.CapsuleGeometry(0.013 * h, Math.hypot(W, H) * 0.82, 4, 8), wm, W / 2, H / 2, 0));
      pillar.rotation.z = -Math.atan2(W, H);
      // neck across the top
      const neck = add(g, mesh(new THREE.CapsuleGeometry(0.012 * h, W * 0.7, 4, 8), wm, W / 2, H * 0.98, 0));
      neck.rotation.z = Math.PI / 2 - 0.22;
      for (let i = 0; i < 6; i++) {
        const t = (i + 1) / 7;
        const len = H * (1 - t) * 0.92 + 0.02 * h;
        add(g, mesh(new THREE.CylinderGeometry(0.0035 * h, 0.0035 * h, len, 3), sm,
          W * t, H * (1 - t * 0.5) - len / 2 + H * 0.02, 0));
      }
      return g;
    },
    // Orassia, Sight: "This other with the shining Glasse (our delightes)"
    mirror: (h = 1) => {
      const g = new THREE.Group();
      const fm = M(0xd8b048, { metalness: 0.9, roughness: 0.2 });
      add(g, mesh(new THREE.TorusGeometry(0.085 * h, 0.016 * h, 6, 18), fm, 0, 0.08 * h)).rotation.y = Math.PI / 2;
      const disc = mesh(new THREE.CircleGeometry(0.078 * h, 20),
        M(0xeaf2ff, { metalness: 1.0, roughness: 0.05 }), 0, 0.08 * h, 0);
      disc.rotation.y = Math.PI / 2;
      add(g, disc);
      add(g, mesh(new THREE.CylinderGeometry(0.014 * h, 0.018 * h, 0.13 * h, 8), fm, 0, -0.05 * h));
      return g;
    },
    // Osfressia, Smell: "she that carrieth the boxes and white cloathes"
    casket: (h = 1) => {
      const g = new THREE.Group();
      const bm = M(0x7a4a30, { roughness: 0.7 });
      const gm = M(0xd8b048, { metalness: 0.9, roughness: 0.25 });
      add(g, mesh(new THREE.BoxGeometry(0.2 * h, 0.11 * h, 0.14 * h), bm, 0, 0.055 * h));
      add(g, mesh(new THREE.BoxGeometry(0.21 * h, 0.02 * h, 0.15 * h), gm, 0, 0.12 * h));
      // the folded white silk veils, carried on top
      add(g, mesh(new THREE.BoxGeometry(0.15 * h, 0.045 * h, 0.11 * h), M(0xf4efe2, { roughness: 0.9 }), 0, 0.15 * h));
      return g;
    },
    // Geussia, Taste: "shee that beareth the casting bottle of precious Lyquor"
    flask: (h = 1) => {
      const g = new THREE.Group();
      const gm = M(0xd8b048, { metalness: 0.9, roughness: 0.22 });
      const body = add(g, mesh(new THREE.SphereGeometry(0.075 * h, 14, 10), gm, 0, 0.08 * h));
      body.scale.set(1, 1.15, 0.85);
      add(g, mesh(new THREE.CylinderGeometry(0.018 * h, 0.026 * h, 0.09 * h, 8), gm, 0, 0.18 * h));
      add(g, mesh(new THREE.SphereGeometry(0.022 * h, 8, 6), M(0x9a3040, { roughness: 0.4 }), 0, 0.23 * h));
      return g;
    },
    // Logistica's borrowed lute — she breaks it at the third gate
    lute: (h = 1) => {
      const g = new THREE.Group();
      const wm = M(0x8a5a2a, { roughness: 0.6 });
      const bowl = add(g, mesh(new THREE.SphereGeometry(0.11 * h, 14, 10), wm, 0, 0.08 * h));
      bowl.scale.set(1, 0.75, 0.6);
      add(g, mesh(new THREE.BoxGeometry(0.03 * h, 0.3 * h, 0.045 * h), wm, 0, 0.2 * h)).rotation.z = -0.3;
      return g;
    },
    // The cornucopia of the portal's Fortuna — "stopped vp, and the mouth downewarde"
    cornucopia: (h = 1) => {
      const g = new THREE.Group();
      const gm = M(0xd8b048, { metalness: 0.85, roughness: 0.3 });
      const horn = add(g, mesh(new THREE.ConeGeometry(0.075 * h, 0.28 * h, 10, 1, true), gm, 0, 0));
      horn.rotation.z = 0.5;
      return g;
    },
  };

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

  // A quadruped with actual anatomy: a barrel with chest and haunch masses, a
  // neck that connects, a skull with muzzle, ears and eyes, two-segment legs
  // that end in feet, and a tail. The head is a GROUP (userData.head), so
  // species pin horns, manes and antlers into it in local coordinates.
  // Front is −z, as before; overall silhouette heights match the old blob so
  // every placed animal keeps its ground.
  function quadruped({ s = 1, color = 0x8a7a64, bulk = 1, neck = 0.18, headR = 0.14,
                       tail = 'down', earR = 0.32, dark = null } = {}) {
    const g = new THREE.Group();
    const bm = M(color, { roughness: 0.85 });
    const dm = M(dark ?? Math.max(0, color - 0x282018), { roughness: 0.9 });

    // barrel + musculature
    const barrel = add(g, mesh(new THREE.CapsuleGeometry(0.20 * s * (0.85 + 0.15 * bulk), 0.44 * s * bulk, 6, 12), bm, 0, 0.52 * s));
    barrel.rotation.x = Math.PI / 2;
    const chest = add(g, mesh(new THREE.SphereGeometry(0.225 * s, 12, 10), bm, 0, 0.53 * s, -0.24 * s * bulk));
    chest.scale.set(0.95, 1.02, 1.0);
    const haunch = add(g, mesh(new THREE.SphereGeometry(0.235 * s, 12, 10), bm, 0, 0.54 * s, 0.26 * s * bulk));
    haunch.scale.set(0.98, 1.05, 1.0);

    // legs: shoulder/hip → knee/hock → foot, with the hind pair jointed
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const hind = sz > 0;
      const leg = new THREE.Group();
      leg.position.set(sx * 0.145 * s, 0.5 * s, sz * 0.27 * s * bulk);
      const upper = mesh(new THREE.CylinderGeometry(0.042 * s, 0.058 * s, 0.26 * s, 8), bm, 0, -0.13 * s, 0);
      upper.rotation.x = hind ? -0.3 : 0.1;
      upper.castShadow = true; leg.add(upper);
      const lower = mesh(new THREE.CylinderGeometry(0.026 * s, 0.038 * s, 0.26 * s, 7), bm,
        0, -0.36 * s, hind ? 0.045 * s : -0.012 * s);
      lower.rotation.x = hind ? 0.14 : 0;
      lower.castShadow = true; leg.add(lower);
      const foot = mesh(new THREE.CylinderGeometry(0.045 * s, 0.05 * s, 0.055 * s, 8), dm,
        0, -0.475 * s, hind ? 0.06 * s : -0.015 * s);
      foot.castShadow = true; leg.add(foot);
      g.add(leg);
    }

    // neck, connecting shoulder to skull
    const headY = (0.66 + neck) * s, headZ = -0.5 * s * bulk;
    const nx = { y: 0.58 * s, z: -0.28 * s * bulk };
    const nLen = Math.hypot(headY - nx.y, headZ - nx.z) * 1.1;
    const neckM = add(g, mesh(new THREE.CylinderGeometry(0.068 * s, 0.105 * s, nLen, 9), bm,
      0, (headY + nx.y) / 2, (headZ + nx.z) / 2));
    neckM.rotation.x = -Math.atan2(-(headZ - nx.z), headY - nx.y);

    // the head: skull, muzzle, nose, ears, eyes — pinned as a group
    const head = new THREE.Group();
    head.position.set(0, headY, headZ);
    const skull = mesh(new THREE.SphereGeometry(headR * s, 12, 10), bm, 0, 0, 0);
    skull.scale.set(0.9, 0.95, 1.05); skull.castShadow = true; head.add(skull);
    const muzzle = mesh(new THREE.CapsuleGeometry(headR * 0.52 * s, headR * 0.6 * s, 5, 8), bm,
      0, -headR * 0.28 * s, -headR * 0.85 * s);
    muzzle.rotation.x = Math.PI / 2 - 0.25; muzzle.castShadow = true; head.add(muzzle);
    head.add(mesh(new THREE.SphereGeometry(headR * 0.16 * s, 6, 5), dm, 0, -headR * 0.1 * s, -headR * 1.42 * s));
    for (const sx of [-1, 1]) {
      const ear = mesh(new THREE.ConeGeometry(headR * earR * s, headR * 0.85 * s, 6), bm,
        sx * headR * 0.55 * s, headR * 0.85 * s, headR * 0.25 * s);
      ear.rotation.x = 0.35; ear.rotation.z = -sx * 0.3; head.add(ear);
      const eyeM = lit ? M(0x180f08, { roughness: 0.25, emissive: 0x140a04, emissiveIntensity: 0.3 }) : M(0x180f08);
      head.add(mesh(new THREE.SphereGeometry(headR * 0.14 * s, 6, 5), eyeM,
        sx * headR * 0.62 * s, headR * 0.12 * s, -headR * 0.62 * s));
    }
    g.add(head);

    // the tail: everything that stands at a station is seen from behind
    let tailMesh = null;
    const t0 = new THREE.Vector3(0, 0.6 * s, 0.3 * s * bulk);
    if (tail === 'brush') {
      tailMesh = mesh(new THREE.ConeGeometry(0.062 * s, 0.34 * s, 7), bm, 0, 0.55 * s, 0.42 * s * bulk);
      tailMesh.rotation.x = 1.9;
    } else if (tail === 'tuft') {
      const curve = new THREE.CatmullRomCurve3([t0,
        new THREE.Vector3(0, 0.44 * s, 0.44 * s * bulk), new THREE.Vector3(0.03 * s, 0.24 * s, 0.5 * s * bulk)]);
      tailMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 8, 0.018 * s, 5), bm);
      g.add(mesh(new THREE.SphereGeometry(0.045 * s, 6, 5), dm, 0.03 * s, 0.22 * s, 0.5 * s * bulk));
    } else if (tail === 'hair') {
      tailMesh = mesh(new THREE.ConeGeometry(0.055 * s, 0.42 * s, 7), dm, 0, 0.42 * s, 0.36 * s * bulk);
      tailMesh.rotation.x = Math.PI - 0.25;
    } else {
      const curve = new THREE.CatmullRomCurve3([t0,
        new THREE.Vector3(0, 0.5 * s, 0.42 * s * bulk), new THREE.Vector3(0.02 * s, 0.34 * s, 0.46 * s * bulk)]);
      tailMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 8, 0.02 * s, 5), bm);
    }
    if (tailMesh) { tailMesh.castShadow = true; g.add(tailMesh); }

    g.userData.head = head;
    g.userData.mat = bm;
    g.userData.tail = tailMesh;
    g.userData.headR = headR * s;
    return g;
  }

  const animals = {
    wolf: (s = 1) => {
      const g = quadruped({ s, color: 0x58514a, tail: 'brush', earR: 0.42, dark: 0x2e2a24 });
      // the darker saddle along the back, and a grizzled throat
      const saddle = mesh(new THREE.SphereGeometry(0.2 * s, 10, 8), M(0x3c3831, { roughness: 0.95 }), 0, 0.66 * s, 0.04 * s);
      saddle.scale.set(0.95, 0.5, 1.7); g.add(saddle);
      const throat = mesh(new THREE.SphereGeometry(0.09 * s, 8, 6), M(0x8a8278, { roughness: 0.95 }), 0, 0.52 * s, -0.38 * s);
      throat.scale.set(0.8, 1.2, 0.9); g.add(throat);
      return g;
    },
    dog: (s = 1) => {
      const g = quadruped({ s: s * 0.8, color: 0x9a8668, tail: 'up' });
      const hr = g.userData.headR, hd = g.userData.head;
      for (const sx of [-1, 1]) {   // floppy ears over the cone ones
        const e = mesh(new THREE.SphereGeometry(hr * 0.32, 6, 5), g.userData.mat, sx * hr * 0.68, hr * 0.35, hr * 0.15);
        e.scale.set(0.5, 1.3, 0.8); hd.add(e);
      }
      return g;
    },
    lion: (s = 1) => {
      const g = quadruped({ s, color: 0xc09a4a, bulk: 1.15, tail: 'tuft', earR: 0.24, dark: 0x6a4a20 });
      const hd = g.userData.head, hr = g.userData.headR;
      const mm = M(0x8a5c24, { roughness: 0.95 });
      // the mane: a wreath of overlapping locks around the skull
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        const lock = mesh(new THREE.SphereGeometry(hr * 0.55, 7, 6), mm,
          Math.cos(a) * hr * 0.75, Math.sin(a) * hr * 0.75, hr * 0.45);
        lock.scale.set(0.9, 0.9, 0.55); hd.add(lock);
      }
      hd.add(mesh(new THREE.SphereGeometry(hr * 0.9, 8, 7), mm, 0, -hr * 0.1, hr * 0.75)).scale.set(1.1, 1.15, 0.6);
      return g;
    },
    stag: (s = 1) => {
      const g = quadruped({ s, color: 0xa08458, neck: 0.28, earR: 0.38 });
      const hd = g.userData.head, hr = g.userData.headR;
      const am = M(0x8a7452, { roughness: 0.8 });
      for (const sx of [-1, 1]) {   // branched antlers: a beam and two tines
        const beam = mesh(new THREE.ConeGeometry(hr * 0.12, hr * 2.2, 5), am, sx * hr * 0.45, hr * 1.5, hr * 0.2);
        beam.rotation.z = sx * 0.45; beam.rotation.x = 0.2; hd.add(beam);
        for (const [ty, tz] of [[1.1, 0.05], [1.8, 0.3]]) {
          const tine = mesh(new THREE.ConeGeometry(hr * 0.07, hr * 0.8, 4), am,
            sx * hr * (0.45 + ty * 0.4), hr * ty, hr * tz);
          tine.rotation.z = sx * 1.1; hd.add(tine);
        }
      }
      return g;
    },
    unicorn: (s = 1) => {
      const g = quadruped({ s, color: 0xe8e2d4, neck: 0.28, tail: 'hair', dark: 0xcfc8b8 });
      const hd = g.userData.head, hr = g.userData.headR;
      const horn = mesh(new THREE.ConeGeometry(hr * 0.16, hr * 2.4, 6), M(0xf4eeda), 0, hr * 1.1, -hr * 0.55);
      horn.rotation.x = 0.5; hd.add(horn);
      return g;
    },
    bull: (s = 1) => {
      const g = quadruped({ s, color: 0x6a5038, bulk: 1.25, earR: 0.26, dark: 0x3a2c1c });
      const hd = g.userData.head, hr = g.userData.headR;
      for (const sx of [-1, 1]) {   // horns curving out and up from the brow
        const hn = mesh(new THREE.ConeGeometry(hr * 0.16, hr * 1.3, 6), M(0xe4dcc4), sx * hr * 0.8, hr * 0.55, 0);
        hn.rotation.z = sx * 1.15; hn.rotation.x = -0.2; hd.add(hn);
      }
      // the dewlap under the throat
      const dw = mesh(new THREE.SphereGeometry(0.12 * s, 8, 6), g.userData.mat, 0, 0.42 * s, -0.4 * s);
      dw.scale.set(0.7, 1.2, 0.9); g.add(dw);
      return g;
    },
    sow: (s = 1) => {
      const g = quadruped({ s: s * 0.85, color: 0xc4a090, bulk: 1.3, neck: 0.02, headR: 0.12, earR: 0.5, tail: 'up' });
      const hd = g.userData.head, hr = g.userData.headR;
      hd.add(mesh(new THREE.CylinderGeometry(hr * 0.32, hr * 0.36, hr * 0.2, 8), M(0xb08878), 0, -hr * 0.15, -hr * 1.3))
        .rotation.x = Math.PI / 2;
      return g;
    },
    goat: (s = 1) => {
      const g = quadruped({ s: s * 0.85, color: 0xb0a898, earR: 0.42, tail: 'up' });
      const hd = g.userData.head, hr = g.userData.headR;
      for (const sx of [-1, 1]) {
        const hn = mesh(new THREE.ConeGeometry(hr * 0.1, hr * 1.0, 5), M(0x8a8274), sx * hr * 0.4, hr * 0.7, hr * 0.35);
        hn.rotation.x = 0.85; hd.add(hn);
      }
      hd.add(mesh(new THREE.ConeGeometry(hr * 0.16, hr * 0.6, 5), M(0x9a9284), 0, -hr * 0.75, -hr * 0.7));
      return g;
    },
    horse: (s = 1) => {
      const g = quadruped({ s: s * 1.1, color: 0x7a5a3a, neck: 0.35, tail: 'hair', earR: 0.3, dark: 0x3c2a16 });
      // the mane: a crest of dark locks running down the neck
      const mm = M(0x40301c, { roughness: 0.95 });
      for (let i = 0; i < 5; i++) {
        const t = i / 4, ss = s * 1.1;
        const lock = mesh(new THREE.SphereGeometry(0.052 * ss, 6, 5), mm,
          0, (0.66 + 0.35 * (1 - t * 0.85)) * ss - t * 0.14 * ss + 0.06 * ss, (-0.5 + t * 0.26) * ss);
        lock.scale.set(0.55, 1.25, 0.9);
        g.add(lock);
      }
      return g;
    },
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
      g.userData.spine = pts;
      g.userData.mat = bm;
      return g;
    },
    dragon: (s = 1) => {
      const ss = s * 1.3;
      const g = animals.serpent(ss, { coil: 0.7 });
      const pts = g.userData.spine;
      const dm = M(0x2c3a20, { roughness: 0.8 });
      // a ridge of spikes down the spine — the crest the woodcut gives it
      for (let i = 2; i < 10; i++) {
        const p = pts[i];
        const sp = mesh(new THREE.ConeGeometry(0.03 * ss, 0.12 * ss, 4), dm, p.x, p.y + 0.06 * ss, p.z);
        g.add(sp);
      }
      // the head made a head: horns, amber eyes, an open jaw
      const hp = pts[10];
      for (const sx of [-1, 1]) {
        const horn = mesh(new THREE.ConeGeometry(0.022 * ss, 0.16 * ss, 5), dm,
          hp.x + sx * 0.05 * ss, hp.y + 0.09 * ss, hp.z + 0.03 * ss);
        horn.rotation.x = 0.5; horn.rotation.z = -sx * 0.35; g.add(horn);
        const eyeM = lit ? M(0xffb030, { emissive: 0xa06000, emissiveIntensity: 1.1 }) : M(0x181008);
        add(g, mesh(new THREE.SphereGeometry(0.018 * ss, 6, 5), eyeM,
          hp.x + sx * 0.055 * ss, hp.y + 0.025 * ss, hp.z - 0.05 * ss));
      }
      const jaw = mesh(new THREE.ConeGeometry(0.035 * ss, 0.14 * ss, 5), g.userData.mat,
        hp.x, hp.y - 0.035 * ss, hp.z - 0.1 * ss);
      jaw.rotation.x = -Math.PI / 2 + 0.4; jaw.castShadow = true; g.add(jaw);
      // bat-swept triangular membranes with ribs, not blank slabs
      const wm = M(0x3a4a2a, { side: THREE.DoubleSide, roughness: 0.75 });
      for (const sx of [-1, 1]) {
        const w = mesh(new THREE.CircleGeometry(0.34 * s, 3), wm, sx * 0.34 * s, 0.44 * s, -0.45 * s);
        w.scale.set(1.7, 1.05, 1);
        w.rotation.z = sx * 0.75; w.rotation.y = sx * 0.55;
        g.add(w);
        for (let f = 0; f < 3; f++) {
          const rib = mesh(new THREE.CylinderGeometry(0.006 * s, 0.011 * s, 0.36 * s, 4), dm,
            sx * (0.18 + f * 0.12) * s, (0.48 - f * 0.04) * s, -0.45 * s);
          rib.rotation.z = sx * (0.45 + f * 0.4);
          g.add(rib);
        }
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
      // eyes, and a fanned tail — the difference between a bird and a bead
      for (const sx of [-1, 1]) {
        add(g, mesh(new THREE.SphereGeometry(0.012 * s, 5, 4), M(0x181008), sx * 0.045 * s, 0.22 * s, -0.17 * s));
      }
      const tailF = add(g, mesh(new THREE.ConeGeometry(0.07 * s, 0.2 * s, 6), bm, 0, 0.12 * s, 0.24 * s));
      tailF.rotation.x = Math.PI / 2 - 0.35;
      tailF.scale.z = 0.35;
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
    swan: (s = 1) => {
      const g = animals.bird(s * 1.2, { color: 0xf0ece0 });
      // the S-curved neck the straight capsule never gave it
      const wm = M(0xf0ece0, { roughness: 0.75 });
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.2 * s, -0.16 * s),
        new THREE.Vector3(0, 0.34 * s, -0.3 * s),
        new THREE.Vector3(0, 0.48 * s, -0.26 * s),
        new THREE.Vector3(0, 0.54 * s, -0.34 * s),
      ]);
      const neck = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.032 * s, 7), wm);
      neck.castShadow = true; g.add(neck);
      add(g, mesh(new THREE.SphereGeometry(0.045 * s, 8, 6), wm, 0, 0.55 * s, -0.36 * s));
      const beak = add(g, mesh(new THREE.ConeGeometry(0.016 * s, 0.07 * s, 5), M(0xd88030), 0, 0.545 * s, -0.42 * s));
      beak.rotation.x = -Math.PI / 2 + 0.2;
      add(g, mesh(new THREE.SphereGeometry(0.014 * s, 5, 4), M(0x181008), 0, 0.575 * s, -0.375 * s));
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
    // Trees for the wood. A cone on a stick reads as a blob, so these get a
    // leaning tapered trunk, real boughs, and a canopy of several overlapping
    // jittered masses in two tones - lit crown over shadowed underside - the
    // way foliage is massed in Quattrocento painting. Seeded, so the wood is
    // the same every load.
    tree: (kind = 'broad', s = 1, seed = null) => {
      const g = new THREE.Group();
      // The founding primitive look, kept selectable (DECISIONS.md 2026-09-05).
      if (isVariant('tree', 'primitive')) {
        add(g, mesh(new THREE.CylinderGeometry(0.08 * s, 0.12 * s, 0.9 * s, 7), M(0x4a3416, { roughness: 0.9 }), 0, 0.45 * s));
        if (kind === 'cypress') {
          add(g, mesh(new THREE.ConeGeometry(0.4 * s, 2.2 * s, 8), M(0x264418, { roughness: 0.9 }), 0, 1.9 * s));
        } else {
          add(g, mesh(new THREE.SphereGeometry(0.62 * s, 10, 8), M(kind === 'golden' ? 0x3a4a1a : 0x2a4418, { roughness: 0.9 }), 0, 1.35 * s));
        }
        return g;
      }
      const sd = seed == null ? 1 + Math.abs(s * 977.3) % 91 : seed;
      const rnd = (k) => { const v = Math.sin(sd * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
      const bark = M(0x4a3416, { roughness: 0.95 });
      g.rotation.z = (rnd(2) - 0.5) * 0.1;

      // root flare
      add(g, mesh(new THREE.CylinderGeometry(0.11 * s, 0.2 * s, 0.16 * s, 8), bark, 0, 0.08 * s));

      // a bough from a to b
      const limb = (ax, ay, az, bx, by, bz, r0, r1) => {
        const dx = bx - ax, dy = by - ay, dz = bz - az;
        const len = Math.hypot(dx, dy, dz) || 0.001;
        const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, 6), bark);
        m.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(dx, dy, dz).normalize());
        m.castShadow = true; m.receiveShadow = true;
        g.add(m);
      };

      // a canopy mass of overlapping jittered blobs, lit on top
      const mass = (cx, cy, cz, r, n, dark, light, squash, k0) => {
        for (let i = 0; i < n; i++) {
          const a = rnd(k0 + i * 3) * Math.PI * 2;
          const rr = rnd(k0 + i * 3 + 1);
          const hh = rnd(k0 + i * 3 + 2);
          const br = r * (0.54 + rr * 0.4);
          const by = cy + (hh - 0.45) * r * 0.5;
          const b = mesh(new THREE.SphereGeometry(br, 9, 7),
            M(by > cy + r * 0.05 ? light : dark, { roughness: 0.92 }),
            cx + Math.cos(a) * r * 0.44 * rr, by, cz + Math.sin(a) * r * 0.44 * rr);
          b.scale.set(1, squash, 1);
          b.rotation.set(rnd(k0 + i + 60) * 0.6, a, rnd(k0 + i + 70) * 0.4);
          add(g, b);
        }
      };

      if (kind === 'cypress') {
        // columnar, wavering silhouette instead of one clean cone
        add(g, mesh(new THREE.CylinderGeometry(0.05 * s, 0.11 * s, 1.5 * s, 7), bark, 0, 0.75 * s));
        for (let i = 0; i < 4; i++) {
          const t = i / 4;
          const b = mesh(new THREE.SphereGeometry((0.38 - t * 0.2) * s, 9, 8),
            M(i > 1 ? 0x2f4d1c : 0x1d3a12, { roughness: 0.92 }),
            (rnd(10 + i) - 0.5) * 0.07 * s, (0.8 + t * 1.42) * s, (rnd(20 + i) - 0.5) * 0.07 * s);
          b.scale.set(1, 2.2 - t * 0.55, 1);
          add(g, b);
        }
      } else {
        const H = 1.15 * s;
        add(g, mesh(new THREE.CylinderGeometry(0.075 * s, 0.14 * s, H, 8), bark, 0, H / 2));
        const n = 3 + Math.floor(rnd(4) * 2);
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + rnd(5) * 3;
          limb(0, H * 0.62, 0, Math.cos(a) * 0.5 * s, H * 1.32, Math.sin(a) * 0.5 * s, 0.055 * s, 0.025 * s);
        }
        mass(0, H * 1.5, 0, 0.78 * s, 7,
          kind === 'golden' ? 0x36461a : 0x1e3a14,
          kind === 'golden' ? 0x53682a : 0x375b1f, 0.88, 100);
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

  return { figure, nymph, label, attributes, animal: (kind, s, opts) => (animals[kind] || animals.bird)(s, opts), prop: (kind, s, opts) => (props[kind] || props.tree)(kind in props ? s : 'broad', opts), animals, props };
}
