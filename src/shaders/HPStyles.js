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

// ── Lit style ─────────────────────────────────────────────────────────────────

export function createLitStyle() {
  return {
    key: 'lit',
    bg: 0x0b0e06,
    fog: { color: 0x0b0e06, density: 0.020 },
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
      const sun = new THREE.DirectionalLight(0xf5e8c0, 2.3);
      sun.position.set(16, 22, 10);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.left = -58; sun.shadow.camera.right = 58;
      sun.shadow.camera.top  =  58; sun.shadow.camera.bottom = -58;
      sun.shadow.camera.near = 2;   sun.shadow.camera.far = 130;
      sun.shadow.bias = -0.0008;
      sun.shadow.radius = 2.5;
      scene.add(sun);

      const sky = new THREE.DirectionalLight(0x8ab0d8, 0.45);
      sky.position.set(-10, 12, -8);
      scene.add(sky);

      scene.add(new THREE.HemisphereLight(0xd8e8ff, 0x1a2208, 0.5));
      scene.add(new THREE.AmbientLight(0x2a3015, 0.7));
      return { sun };
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
      const sun = new THREE.DirectionalLight(0xffffff, 2.6);
      sun.position.set(-20, 28, 18);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.left = -58; sun.shadow.camera.right = 58;
      sun.shadow.camera.top  =  58; sun.shadow.camera.bottom = -58;
      sun.shadow.camera.near = 2;   sun.shadow.camera.far = 130;
      sun.shadow.bias = -0.0006;
      sun.shadow.radius = 3;
      scene.add(sun);

      scene.add(new THREE.HemisphereLight(0xffffff, 0xcfc2a4, 0.85));
      return { sun };
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
