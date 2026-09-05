// Meadow.js — instanced meadow fields for the lit Dream Garden: grass tufts,
// wildflower drifts, and rose drifts, all one system.
//
// Adapted from the stylized-meadow-grass reference in the Three.js Awesome
// Graphics Agent Skills pack (threejs-procedural-vegetation): authored blade
// clusters as a single InstancedMesh, per-instance origin/facing/seed
// attributes, rooted circular-arc wind with travelling gust fronts and tip
// flutter, and world-anchored colour patches. Changes for this project:
//   - path masking is analytic (a clearance(x,z) callback over the garden's
//     known paths, slabs, and plazas) instead of a mask image;
//   - FogExp2 matching the scene is applied in the fragment shader so the
//     meadow recedes with the ground it stands on;
//   - a `flare` parameter widens the blade near its tip, turning the same
//     geometry into flower spikes (tip colour = petal colour);
//   - lit style only — the woodcut page keeps its clean paper ground.
//
// Everything is deterministic from `seed`; no assets, no build step.

import * as THREE from 'three';

class SeededRandom {
  constructor(seed = 1) { this.state = seed >>> 0; }
  value(min = 0, max = 1) {
    this.state += 0x6d2b79f5;
    let v = this.state;
    v = Math.imul(v ^ (v >>> 15), v | 1);
    v ^= v + Math.imul(v ^ (v >>> 7), v | 61);
    return min + (max - min) * (((v ^ (v >>> 14)) >>> 0) / 4294967296);
  }
}

// Cheap deterministic 2-D value noise (matches the shader's flavour) — used
// on the CPU to clump placement so density varies like a real sward.
function hash2(x, z) {
  const v = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return v - Math.floor(v);
}
export function valueNoise2(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  const a = hash2(ix, iz), b = hash2(ix + 1, iz);
  const c = hash2(ix, iz + 1), d = hash2(ix + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
}

// A tuft: `planes` crossed blade-quads sharing one origin. `flare` bulges the
// width near the tip (0 = grass blade, >0 = flower spike).
function bladeGeometry({ height = 0.42, width = 0.05, segments = 3, planes = 3, flare = 0 } = {}) {
  const positions = [], normals = [], uvs = [], indices = [];
  for (let plane = 0; plane < planes; plane++) {
    const angle = (plane / planes) * Math.PI;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const n = new THREE.Vector3(sin, 0.34, cos).normalize();
    const base = positions.length / 3;
    for (let seg = 0; seg <= segments; seg++) {
      const t = seg / segments;
      const taper = Math.pow(1 - t, 1.35);
      const bulge = flare * Math.exp(-Math.pow((t - 0.78) / 0.16, 2));
      const lean = Math.pow(t, 1.8) * 0.16;
      const y = t * height;
      const halfWidth = width * (0.18 + 0.82 * taper + bulge);
      for (const side of [-1, 1]) {
        const lx = side * halfWidth, lz = lean;
        positions.push(lx * cos - lz * sin, y, lx * sin + lz * cos);
        normals.push(n.x, n.y, n.z);
        uvs.push(side < 0 ? 0 : 1, t);
      }
    }
    for (let seg = 0; seg < segments; seg++) {
      const row = base + seg * 2;
      indices.push(row, row + 1, row + 2, row + 1, row + 3, row + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeBoundingSphere();
  return geo;
}

function meadowMaterial({
  bladeHeight, sunDirection, fogColor, fogDensity,
  root, tip, rootB, tipB, back,
  windStrength = 0.16, windSpeed = 1.15, windAngle = 0.8,
} = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime:           { value: 0 },
      uBladeHeight:    { value: bladeHeight },
      uWindStrength:   { value: windStrength },
      uWindSpeed:      { value: windSpeed },
      uWindAngle:      { value: windAngle },
      uGustScale:      { value: 0.35 },
      uTurbulence:     { value: 0.26 },
      uFlutter:        { value: 0.22 },
      uHeightVariation:{ value: 0.45 },
      uHeightNoiseScale:{ value: 0.16 },
      uColorPatchScale:{ value: 0.5 },
      uColorVariation: { value: 0.55 },
      uMacroScale:     { value: 0.075 },
      uMacroVariation: { value: 0.32 },
      uSunDirection:   { value: sunDirection },
      uRootColor:      { value: new THREE.Color(root) },
      uTipColor:       { value: new THREE.Color(tip) },
      uRootColorB:     { value: new THREE.Color(rootB) },
      uTipColorB:      { value: new THREE.Color(tipB) },
      uBackColor:      { value: new THREE.Color(back) },
      uFogColor:       { value: new THREE.Color(fogColor) },
      uFogDensity:     { value: fogDensity },
    },
    side: THREE.DoubleSide,
    vertexShader: /* glsl */`
      precision highp float;
      attribute vec2 aOrigin;
      attribute vec2 aFacing;
      attribute float aSeed;
      uniform float uTime, uBladeHeight, uWindStrength, uWindSpeed, uWindAngle;
      uniform float uGustScale, uTurbulence, uFlutter, uHeightVariation, uHeightNoiseScale;
      varying vec2 vWorldXZ;
      varying float vBladeT;
      varying float vSeed;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPosition;

      float hash21(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }
      float valueNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
          mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0)), u.x),
          u.y);
      }

      // Rooted circular-arc bend: the blade base never moves; the tip travels
      // an arc whose angle comes from gust fronts moving along the wind line.
      vec3 bendOffset(vec3 local, float bladeT) {
        float bladePhase = aSeed * 6.28318530718;
        float wobble = sin(uTime * uWindSpeed * 0.6 + bladePhase) * uTurbulence * 0.4;
        float windAngle = uWindAngle + wobble;
        vec2 windDir = vec2(cos(windAngle), sin(windAngle));
        vec2 sideDir = vec2(-windDir.y, windDir.x);
        float along = dot(aOrigin, windDir);
        float jitter = (valueNoise(aOrigin * 0.03 + 11.7) * 2.0 - 1.0) * 1.45;
        float gustPhase = along * uGustScale - uTime * uWindSpeed * 0.6 + jitter;
        float gust = pow(sin(gustPhase) * 0.5 + 0.5, 1.6);
        float chopPhase = along * uGustScale * 2.7 - uTime * uWindSpeed * 1.3 + bladePhase;
        float chop = sin(chopPhase) * 0.5 + 0.5;
        float ampVar = 0.65 + hash21(vec2(aSeed, 7.0)) * 0.7;
        float intensity = (0.25 + gust * 0.85 + chop * 0.18) * ampVar;
        float phi = clamp(uWindStrength * intensity * 3.0, 0.0, 1.48);
        float shaped = pow(bladeT, 1.5);
        float a = phi * shaped;
        float radius = uBladeHeight / max(phi, 0.001);
        float arc = radius * (1.0 - cos(a));
        float drop = radius * sin(a) - local.y;
        float flutterMask = smoothstep(0.55, 1.0, bladeT);
        float flutter = sin(uTime * 10.0 + bladePhase * 3.0 + along * 0.8) * uFlutter * 0.08 * flutterMask;
        vec2 worldOffset = windDir * arc + sideDir * flutter;
        float localX = worldOffset.x * aFacing.x - worldOffset.y * aFacing.y;
        float localZ = worldOffset.x * aFacing.y + worldOffset.y * aFacing.x;
        return vec3(localX, drop, localZ);
      }

      void main() {
        vBladeT = clamp(position.y / uBladeHeight, 0.0, 1.0);
        float heightNoise = valueNoise(aOrigin * uHeightNoiseScale + vec2(53.0, 17.0)) * 2.0 - 1.0;
        float heightFactor = clamp(1.0 + heightNoise * uHeightVariation, 0.4, 1.7);
        vec3 local = position + bendOffset(position, vBladeT);
        local.y *= heightFactor;
        vec4 world = modelMatrix * instanceMatrix * vec4(local, 1.0);
        vWorldPosition = world.xyz;
        vWorldXZ = world.xz;
        vSeed = aSeed;
        vWorldNormal = normalize(mat3(modelMatrix * instanceMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */`
      precision highp float;
      uniform vec3 uSunDirection, uRootColor, uTipColor, uRootColorB, uTipColorB, uBackColor, uFogColor;
      uniform float uColorPatchScale, uColorVariation, uMacroScale, uMacroVariation, uFogDensity;
      varying vec2 vWorldXZ;
      varying float vBladeT;
      varying float vSeed;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPosition;

      float hash21(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }
      float valueNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
          mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0)), u.x),
          u.y);
      }

      void main() {
        vec3 N = normalize(vWorldNormal + vec3(0.0, 0.42, 0.0));
        vec3 V = normalize(cameraPosition - vWorldPosition);
        vec3 L = normalize(uSunDirection);
        float gradT = pow(vBladeT, 1.35);
        float patchBlend = clamp(valueNoise(vWorldXZ * uColorPatchScale) * uColorVariation, 0.0, 1.0);
        vec3 gradientA = mix(uRootColor, uTipColor, gradT);
        vec3 gradientB = mix(uRootColorB, uTipColorB, gradT);
        vec3 baseColor = mix(gradientA, gradientB, patchBlend);
        float macro = 1.0 + (valueNoise(vWorldXZ * uMacroScale + vec2(137.0, 91.0)) - 0.5) * 2.0 * uMacroVariation;
        float brightness = mix(0.85, 1.15, hash21(vec2(vSeed + 13.37, 4.2)));

        float hemi = 0.46 + 0.54 * clamp(N.y * 0.5 + 0.5, 0.0, 1.0);
        float diffuse = max(dot(N, L), 0.0);
        float backLight = pow(max(dot(V, -normalize(L + N * 0.5)), 0.0), 3.0);
        float rim = pow(1.0 - max(dot(N, V), 0.0), 4.0);
        vec3 color =
          baseColor * brightness * macro * (hemi * 0.74 + diffuse * 0.4) +
          uBackColor * backLight * pow(vBladeT, 1.5) * 0.55 +
          vec3(0.92, 0.88, 0.62) * rim * 0.14;
        float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
        color = mix(vec3(luma), color, 1.25) * 1.04;

        // Match the scene's FogExp2 so the meadow recedes with its ground.
        float fogDepth = length(vWorldPosition - cameraPosition);
        float fogF = 1.0 - exp(-uFogDensity * uFogDensity * fogDepth * fogDepth);
        color = mix(color, uFogColor, clamp(fogF, 0.0, 1.0));

        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}

// One instanced field. `clearance(x, z)` returns the open-ground distance in
// world units (0 = paved/blocked); blades shrink smoothly toward zero at the
// edges so paths keep a soft, grazed border. `accept(x, z, noise)` optionally
// gates placement (flower drifts, clump thinning).
export function createMeadowField({
  count = 20000,
  bounds = { x0: -42, x1: 42, z0: -33, z1: 52 },
  seed = 7331,
  clearance = null,
  accept = null,
  blade = {},
  colors = {},
  wind = {},
  scale = 1.0,
  scaleVariation = 0.3,
  sunDirection = new THREE.Vector3(0.55, 0.76, 0.34),
  fogColor = 0xd0be9e,
  fogDensity = 0.0072,
} = {}) {
  const random = new SeededRandom(seed);
  const geometry = bladeGeometry(blade);
  const bladeHeight = blade.height ?? 0.42;

  const origins = new Float32Array(count * 2);
  const facings = new Float32Array(count * 2);
  const seeds = new Float32Array(count);
  geometry.setAttribute('aOrigin', new THREE.InstancedBufferAttribute(origins, 2));
  geometry.setAttribute('aFacing', new THREE.InstancedBufferAttribute(facings, 2));
  geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));

  const material = meadowMaterial({
    bladeHeight, sunDirection, fogColor, fogDensity,
    root:  colors.root  ?? 0x2e4a1e,
    tip:   colors.tip   ?? 0x7a9c42,
    rootB: colors.rootB ?? 0x3c5a22,
    tipB:  colors.tipB  ?? 0xa8b050,
    back:  colors.back  ?? 0xd8c860,
    ...wind,
  });

  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.frustumCulled = false;   // one draw call; bounds would exceed any sphere anyway
  mesh.castShadow = false;      // 20k tufts in the shadow pass would be all cost, no read
  mesh.receiveShadow = false;

  const dummy = new THREE.Object3D();
  const maxAttempts = count * 30;
  let placed = 0;
  for (let attempt = 0; attempt < maxAttempts && placed < count; attempt++) {
    const x = random.value(bounds.x0, bounds.x1);
    const z = random.value(bounds.z0, bounds.z1);
    const open = clearance ? clearance(x, z) : 1;
    if (open <= 0.05) continue;
    const clump = valueNoise2(x * 0.14 + 31.7, z * 0.14 + 8.3);
    if (accept) { if (!accept(x, z, clump)) continue; }
    else if (clump < 0.24) continue;          // patchy sward, not a uniform carpet
    const yaw = random.value(0, Math.PI * 2);
    const edge = Math.min(1, open / 0.9);      // grazed border along the paths
    const s = scale * (1 + random.value(-scaleVariation, scaleVariation)) * (0.45 + 0.55 * edge);
    const i = placed++;
    origins[i * 2] = x; origins[i * 2 + 1] = z;
    facings[i * 2] = Math.cos(yaw); facings[i * 2 + 1] = Math.sin(yaw);
    seeds[i] = random.value();
    dummy.position.set(x, 0, z);
    dummy.rotation.set(0, yaw, 0);
    dummy.scale.setScalar(s);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  // Park any unfilled instances (tight accept gates) at zero scale underground.
  for (let i = placed; i < count; i++) {
    dummy.position.set(0, -10, 0);
    dummy.scale.setScalar(0.0001);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;

  return {
    mesh, material, geometry, placed,
    update(elapsed) { material.uniforms.uTime.value = elapsed; },
    dispose() { geometry.dispose(); material.dispose(); },
  };
}
