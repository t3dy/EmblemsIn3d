// HPStyles.js — render-style factories for the unified Hypnerotomachia world.
//
// HPWorldScene builds its geometry ONCE against this interface, so the same
// dream garden can be dressed two ways:
//
//   lit      — warm garden realism: MeshStandardMaterial, coloured point
//              lights, bloom, cast shadows from an afternoon sun.
//   woodcut  — the same world as a 3-D rendering of the 1499 woodcuts.
//              Every surface is cream paper; shading is quantised into
//              cross-hatch ink bands (a MeshLambertMaterial with a hatching
//              stage injected via onBeforeCompile, so shadow maps and fog
//              keep working); silhouettes get rim ink plus inverted-hull
//              outlines; and a single raking sun casts the shadows — the
//              lighting trick borrowed from EmblemPapercraft, where one warm
//              key light throwing cut-shape shadows is what sells the page.

import * as THREE from 'three';

export const PAPER = 0xf2e8d0;
export const INK   = 0x241a10;

// ── The shadow box, and why it follows the walker ────────────────────────────
//
// Until 2026-09-08 the sun's shadow camera was a fixed ±58 m frustum around
// the origin with `far = 130`. That was correct for a world 100 m across and
// silently wrong for anything larger: **outside the box nothing casts at all**.
// The scale research pass (DIMENSIONS.md §5) named this as the blocker before
// the world could grow — a dark wood 300 m long would have had no shadow in it,
// which is the one thing Ted actually asked for.
//
// So the box now TRACKS the player. `followShadow(x, z)` re-centres it every
// frame, and snaps the centre to the shadow map's own texel grid *in light
// space* — without that snap the shadow edges crawl and shimmer as you walk,
// which is worse than no shadow at all.
//
// The frustum stays modest (±118 m) precisely because it moves: a fixed box big
// enough for an 800 m world would put a metre of world in every texel.
const SHADOW_R = 118;
const _wUp = new THREE.Vector3(0, 1, 0);

function trackedSun(scene, { color, intensity, dir, bias, radius }) {
  const SUN_DIR = new THREE.Vector3().fromArray(dir).normalize();
  const mobile = typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent);
  const MAP = mobile ? 2048 : 4096;

  const sun = new THREE.DirectionalLight(color, intensity);
  sun.position.copy(SUN_DIR).multiplyScalar(300);
  sun.castShadow = true;
  sun.shadow.mapSize.set(MAP, MAP);
  const c = sun.shadow.camera;
  c.left = -SHADOW_R; c.right = SHADOW_R; c.top = SHADOW_R; c.bottom = -SHADOW_R;
  c.near = 1; c.far = 700;
  sun.shadow.bias = bias;
  // A 35 m tree seen at a grazing angle self-shadows into acne without this;
  // normalBias offsets along the surface normal, which is what long thin
  // trunks and big leaf cards need and what a depth bias alone cannot give.
  sun.shadow.normalBias = 0.045;
  sun.shadow.radius = radius;
  scene.add(sun);
  scene.add(sun.target);

  // light-space basis, for the texel snap
  const lz = SUN_DIR.clone();
  const lx = new THREE.Vector3().crossVectors(_wUp, lz).normalize();
  const ly = new THREE.Vector3().crossVectors(lz, lx).normalize();
  const texel = (SHADOW_R * 2) / MAP;
  const _p = new THREE.Vector3(), _s = new THREE.Vector3();

  const followShadow = (x, z) => {
    _p.set(x, 0, z);
    const a = Math.round(_p.dot(lx) / texel) * texel;
    const b = Math.round(_p.dot(ly) / texel) * texel;
    const d = _p.dot(lz);
    _s.set(0, 0, 0).addScaledVector(lx, a).addScaledVector(ly, b).addScaledVector(lz, d);
    sun.target.position.copy(_s);
    sun.position.copy(_s).addScaledVector(SUN_DIR, 300);
    sun.target.updateMatrixWorld();
    sun.updateMatrixWorld();
  };
  followShadow(0, 0);
  return { sun, followShadow };
}

// ── Woodcut hatching material ─────────────────────────────────────────────────
// A white Lambert whose lit colour is remapped, just before output, into
// paper-and-ink: luminance is cut into three hatch bands (single stroke set →
// cross-hatch → dense fine hatch → solid ink), each band drawn as anti-aliased
// stripes in OBJECT space (stable under the slow rotations of orbs and the
// dodecahedron). `tone` biases a material darker (hedges hatch even in full
// sun), `mode 1` switches to wavy horizontal strokes for water, `rim 0`
// disables silhouette ink (the ground plane would otherwise ink the horizon).
function woodcutLambert({ tone = 0.15, rim = 1, mode = 0, freq = 9.0, side = THREE.FrontSide, transparent = false, opacity = 1 } = {}) {
  const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, side, transparent, opacity });
  const uniforms = {
    uPaper: { value: new THREE.Color(PAPER) },
    uInk:   { value: new THREE.Color(INK) },
    uTone:  { value: tone },
    uRim:   { value: rim },
    uMode:  { value: mode },
    uFreq:  { value: freq },
    uGain:  { value: 1.15 },
  };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWcPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n\tvWcPos = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', /* glsl */`#include <common>
varying vec3 vWcPos;
uniform vec3 uPaper, uInk;
uniform float uTone, uRim, uMode, uFreq, uGain;
float wcLine( float c ) {
	float f = abs( fract( c ) - 0.5 );
	float w = max( fwidth( c ), 0.02 );
	return 1.0 - smoothstep( 0.16 - w, 0.16 + w, f );
}`)
      .replace('#include <opaque_fragment>', /* glsl */`{
	float wcLum = clamp( dot( outgoingLight, vec3( 0.299, 0.587, 0.114 ) ) * uGain - uTone, 0.0, 1.0 );
	vec3 p = vWcPos * uFreq;
	float c1, c2, c3;
	if ( uMode > 0.5 ) {
		float wave = sin( p.x * 0.9 ) * 0.22;
		c1 = p.y * 1.15 + wave;
		c2 = p.y * 2.30 + wave * 1.7 + 0.25;
		c3 = p.y * 4.60 + wave * 2.2;
	} else {
		c1 = p.x * 0.86 + p.y * 0.50 + p.z * 0.34;
		c2 = p.y * 0.90 - p.x * 0.52 + p.z * 0.20 + 0.37;
		c3 = ( p.x + p.y + p.z ) * 1.9;
	}
	float wcInk = 0.0;
	wcInk = max( wcInk, wcLine( c1 ) * smoothstep( 0.60, 0.50, wcLum ) );
	wcInk = max( wcInk, wcLine( c2 ) * smoothstep( 0.36, 0.27, wcLum ) );
	wcInk = max( wcInk, wcLine( c3 ) * smoothstep( 0.17, 0.10, wcLum ) );
	wcInk = max( wcInk, smoothstep( 0.035, 0.005, wcLum ) );
	float wcRimT = 1.0 - abs( dot( normalize( normal ), normalize( vViewPosition ) ) );
	wcInk = max( wcInk, uRim * smoothstep( 0.78, 0.97, wcRimT ) );
	outgoingLight = mix( uPaper, uInk, wcInk );
}
#include <opaque_fragment>`);
  };
  // All woodcut materials share one compiled program (uniform values differ
  // per material instance); the key stops three.js hashing onBeforeCompile.
  mat.customProgramCacheKey = () => 'hp-woodcut';
  return mat;
}

function lum(colorHex) {
  const c = new THREE.Color(colorHex);
  return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
}

// A twilight dome: vertical gradient (horizon → zenith) plus a sprinkle of
// stars, so the lit worlds read against a dream-sky instead of raw black.
export function addSkyDome(scene, { top = 0x101a2e, horizon = 0x4a3826, stars = 320 } = {}) {
  // 24x12 faceted into visible bands once the world opened out and the dome
  // began travelling with the eye: the gradient is computed from the
  // interpolated vertex position, so big triangles band. (2026-09-08)
  const geo = new THREE.SphereGeometry(190, 48, 24);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uTop:     { value: new THREE.Color(top) },
      uHorizon: { value: new THREE.Color(horizon) },
    },
    vertexShader: /* glsl */`
      varying vec3 vP;
      void main() {
        vP = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */`
      varying vec3 vP;
      uniform vec3 uTop, uHorizon;
      void main() {
        float h = clamp(normalize(vP).y * 1.7, 0.0, 1.0);
        gl_FragColor = vec4(mix(uHorizon, uTop, h), 1.0);
      }`,
  });
  const dome = new THREE.Mesh(geo, mat);
  dome.renderOrder = -10;
  scene.add(dome);

  if (stars > 0) {
    const pos = new Float32Array(stars * 3);
    const rnd = (i, k) => { const v = Math.sin(i * 91.7 + k * 269.5) * 43758.5453; return v - Math.floor(v); };
    for (let i = 0; i < stars; i++) {
      const az = rnd(i, 1) * Math.PI * 2;
      const el = 0.12 + rnd(i, 2) * 1.35;       // keep off the horizon
      const r = 180;
      pos[i * 3]     = Math.cos(az) * Math.cos(el) * r;
      pos[i * 3 + 1] = Math.sin(el) * r;
      pos[i * 3 + 2] = Math.sin(az) * Math.cos(el) * r;
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const sm = new THREE.PointsMaterial({ color: 0xcfd8e8, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.75, depthWrite: false });
    const points = new THREE.Points(sg, sm);
    points.renderOrder = -9;
    scene.add(points);
  }
  return dome;
}

// ── Lit style ─────────────────────────────────────────────────────────────────

export function createLitStyle() {
  return {
    key: 'lit',
    bg: 0x101a2e,
    fog: { color: 0x3a2c1c, density: 0.016 },
    sky: { top: 0x101a2e, horizon: 0x4a3826, stars: 320 },
    bloom: 0.35,
    useEnv: true,

    mat({ color = 0x8a7a5a, roughness = 0.85, metalness = 0.05, emissive = null, emissiveIntensity = 0.5, side = THREE.FrontSide, transparent = false, opacity = 1 } = {}) {
      const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, side, transparent, opacity });
      if (emissive != null) { m.emissive = new THREE.Color(emissive); m.emissiveIntensity = emissiveIntensity; }
      return m;
    },

    waterMat() {
      return new THREE.MeshStandardMaterial({
        color: 0x2a4a6a, transparent: true, opacity: 0.75,
        roughness: 0.1, metalness: 0.4,
        emissive: 0x1a3050, emissiveIntensity: 0.3,
      });
    },

    glowMat({ color, emissive, emissiveIntensity = 0.55, metalness = 0.5, roughness = 0.4 }) {
      return new THREE.MeshStandardMaterial({
        color, emissive: new THREE.Color(emissive ?? color), emissiveIntensity, metalness, roughness,
      });
    },

    // Translucent coloured veil in a doorway
    portalMat(color) {
      return new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.30, side: THREE.DoubleSide, depthWrite: false });
    },

    outline() { return null; },
    rays: false,

    pointLight(color, intensity, distance) { return new THREE.PointLight(color, intensity, distance); },

    plaqueColors: { bg: 'rgba(12,9,5,0.9)', border: '#6a5a3a', text: '#ecdfc4', sub: '#9a875f', accent: null },

    setupLights(scene) {
      // Direction unchanged (16, 22, 10): high, to +x and +z, about 49° up.
      // That is the world's compass — +z south, +x east — now written down
      // rather than left implicit (DIRECTIONS.md §2). The box that follows it
      // is trackedSun's, at the head of this file.
      const { sun, followShadow } = trackedSun(scene, {
        color: 0xf5e8c0, intensity: 2.3, dir: [16, 22, 10],
        bias: -0.0008, radius: 2.5,
      });

      const sky = new THREE.DirectionalLight(0x8ab0d8, 0.45);
      sky.position.set(-10, 12, -8);
      scene.add(sky);

      scene.add(new THREE.HemisphereLight(0xb8c8e8, 0x2a2410, 0.8));
      scene.add(new THREE.AmbientLight(0x3a3420, 0.8));
      return { sun, followShadow };
    },

    tuneStream() {},
  };
}

// ── Woodcut style ─────────────────────────────────────────────────────────────

export function createWoodcutStyle() {
  const outlineMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });

  return {
    key: 'woodcut',
    bg: PAPER,
    fog: { color: PAPER, density: 0.015 },
    bloom: 0.0,
    useEnv: false,

    // Base darkness derives from the lit-style colour, so hedges (dark green)
    // carry hatch even in sunlight while pale stone stays clean paper.
    mat({ color = 0x8a7a5a, tone = null, rim = 1, mode = 0, side = THREE.FrontSide, transparent = false, opacity = 1, emissive = null } = {}) {
      const t = tone ?? (emissive != null ? -0.15 : Math.min(0.4, Math.max(0, 0.32 * (1 - lum(color)) - 0.02)));
      return woodcutLambert({ tone: t, rim, mode, side, transparent, opacity });
    },

    waterMat() { return woodcutLambert({ tone: 0.17, rim: 0, mode: 1, freq: 6.0 }); },

    // "Glowing" things stay bright paper — their radiance is drawn as ink rays
    // by the scene instead (rays: true), the way woodcuts draw a glory.
    glowMat() { return woodcutLambert({ tone: -0.2 }); },

    // Woodcut doorways are open — no coloured veil, the hatched reveal reads
    // as the dark interior of the page.
    portalMat() { return null; },

    outline(mesh, s = 1.035) {
      const o = new THREE.Mesh(mesh.geometry, outlineMat);
      o.scale.setScalar(s);
      mesh.add(o);
      return o;
    },
    rays: true,
    rayMat() { return new THREE.LineBasicMaterial({ color: INK }); },

    pointLight() { return null; },

    plaqueColors: { bg: '#f2e8d0', border: '#241a10', text: '#241a10', sub: '#4a3a26', accent: '#241a10' },

    setupLights(scene) {
      // One raking key throws all the shadows (the papercraft trick) plus a
      // pale hemisphere so shadowed paper still reads — shadows are hatched,
      // never black.
      const { sun, followShadow } = trackedSun(scene, {
        color: 0xffffff, intensity: 2.6, dir: [-20, 28, 18],
        bias: -0.0006, radius: 3,
      });

      scene.add(new THREE.HemisphereLight(0xffffff, 0xcfc2a4, 0.85));
      return { sun, followShadow };
    },

    tuneStream(stream) {
      const m = stream.points.material;
      m.color.set(0x2a1c12);
      m.blending = THREE.NormalBlending;
      m.size *= 1.5;
    },
  };
}

export function createStyle(key) {
  return key === 'woodcut' ? createWoodcutStyle() : createLitStyle();
}
