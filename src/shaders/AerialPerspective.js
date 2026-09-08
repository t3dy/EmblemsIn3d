// AerialPerspective.js — the one piece of Renaissance picture-making this world
// was missing, and it is not a style: it is a rule, and Leonardo wrote it down.
//
// ── Why this exists ──────────────────────────────────────────────────────────
//
// Leonardo coined the term *prospettiva aerea* in the Trattato della Pittura and
// gave it as an instruction to painters: to make an object look five times more
// distant, make it five times bluer. Distance drains colour, lifts the blacks,
// closes the tonal range, and shifts what is left toward the blue of the air —
// he is describing Rayleigh scattering a good three centuries before anyone
// could explain it. Masaccio and others had lightened their distances by
// instinct; Leonardo is the first to state the law.
//
// This world already had a distance cue — a warm sand-coloured FogExp2 — but a
// warm haze is the opposite of the rule. It says "dusty", not "far". So the
// fog was recoloured to the blue of the air (HPWorldScene._buildAir), which is
// where the rule now lives: three.js evaluates fog per fragment with true
// depth, on every standard material, for nothing. A post-process pass was
// tried first and abandoned — reading scene depth needs a DepthTexture on the
// composer's ping-pong targets, and sharing one between them binds it for
// write while it is being sampled, which renders black.
//
// What is left in this file is the half of the idea that needs no depth at
// all: the pigment shelf.
//
// ── And the palette ──────────────────────────────────────────────────────────
//
// The second half of the pass pulls every colour a little way toward the
// pigments that were actually available to a painter in Venice in 1499. That
// list is not a guess: azurite and ultramarine (and indigo) for the blues;
// verdigris, green earth and malachite for the greens; lead-tin yellow, Naples
// yellow and the ochres; vermilion and madder lake for the reds; lead white and
// carbon black. Ultramarine cost more than its own weight in gold, which is why
// azurite does most of the work in most pictures — so azurite, not ultramarine,
// is the haze colour here.
//
// The pull is deliberately gentle. Snapping hard to fifteen colours would be a
// poster, not a painting; at a fifth of the way the image simply stops
// containing hues that no one in 1499 could have mixed.
//
// Sources for both halves are in RENDERING.md.

import * as THREE from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

// The Venetian shelf, c. 1499. Order is irrelevant; the shader takes whichever
// is nearest in RGB.
export const QUATTROCENTO = [
  0xf2ede0, // lead white
  0x1b1a18, // carbon black (vine black)
  0xe8c851, // lead-tin yellow
  0xe5ce8a, // Naples yellow
  0xc4923b, // yellow ochre
  0x8a4a2e, // burnt sienna
  0x9c4a32, // red ochre / sinopia
  0xc42d1e, // vermilion
  0x8c3350, // madder lake
  0x6b563c, // raw umber
  0x6e7b4f, // green earth (terre verte)
  0x5c6f2e, // sap green (buckthorn lake) -- added because without a warm mid
  0x8a9a52, //   green and a light one, garden grass snapped to verdigris and
            //   the whole sward went teal. Both are period; sap green is a
            //   lake a Venetian shop made itself.
  0x3e7c63, // verdigris
  0x4e9a78, // malachite
  0x3e6ea8, // azurite
  0x2a3e8c, // ultramarine
];

export const AerialShader = {
  name: 'QuattrocentoPigment',
  uniforms: {
    tDiffuse: { value: null },
    // 0.30 by tasting: at 0.18 the shelf barely registers, at 0.55 the sea
    // goes flatly verdigris and the grass starts to band. A third of the way
    // binds the palette without turning the picture into a poster.
    uPigment: { value: 0.30 },
    // Colour arrays are flattened by hand: three.js reads vec3[] uniforms as
    // {x,y,z} and a THREE.Color has {r,g,b}, so an array of Colors silently
    // uploads nothing.
    uPalette: { value: new Float32Array(QUATTROCENTO.flatMap(h => {
      const c = new THREE.Color(h);
      return [c.r, c.g, c.b];
    })) },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform float uPigment;
    uniform vec3 uPalette[17];

    void main() {
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      vec3 best = c;
      float bd = 1e9;
      for (int i = 0; i < 17; i++) {
        float d = distance(c, uPalette[i]);
        if (d < bd) { bd = d; best = uPalette[i]; }
      }
      gl_FragColor = vec4(mix(c, best, uPigment), 1.0);
    }
  `,
};

export class AerialPass extends ShaderPass {
  constructor() { super(AerialShader); }
}
