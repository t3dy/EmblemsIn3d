import * as THREE from 'three';

// GPU-friendly particle stream built on THREE.Points.
// Animates a flow of particles from `source` position to `target` position
// using a bezier-like arc with turbulence.

export class ParticleStream {
  constructor({
    count    = 80,
    source   = new THREE.Vector3(-1, 0, 0),
    target   = new THREE.Vector3(1, -0.5, 0),
    color    = 0xcc3300,
    size     = 0.05,
    speed    = 0.6,
    arc      = 0.8,
  } = {}) {
    this.source = source;
    this.target = target;
    this.speed  = speed;
    this.arc    = arc;
    this.count  = count;
    this.active = false;
    this.opacity = 0;

    // Each particle has an independent phase offset so they stagger
    this._phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      this._phases[i] = i / count;
    }

    const positions = new Float32Array(count * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color,
      size,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geo, mat);
    this._mat   = mat;
    this._geo   = geo;
    this._pos   = positions;
  }

  // Call each frame with elapsed time in seconds
  update(t) {
    if (!this.active && this.opacity <= 0) return;
    this._mat.opacity = this.opacity;

    const s = this.source;
    const e = this.target;

    // Mid-point control (arc apex between source and target)
    const midX = (s.x + e.x) / 2;
    const midY = Math.max(s.y, e.y) + this.arc;
    const midZ = (s.z + e.z) / 2;

    for (let i = 0; i < this.count; i++) {
      // t_i in [0,1] cycles continuously — each particle offset by phase
      let ti = ((t * this.speed + this._phases[i]) % 1.0);

      // Quadratic bezier: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
      const u = 1 - ti;
      const x = u * u * s.x + 2 * u * ti * midX + ti * ti * e.x;
      const y = u * u * s.y + 2 * u * ti * midY + ti * ti * e.y;
      const z = u * u * s.z + 2 * u * ti * midZ + ti * ti * e.z;

      // Small turbulence
      const noise = Math.sin(ti * 12 + i * 0.7) * 0.06;

      this._pos[i * 3]     = x + noise;
      this._pos[i * 3 + 1] = y + noise * 0.5;
      this._pos[i * 3 + 2] = z;
    }

    this._geo.attributes.position.needsUpdate = true;
  }

  show(duration = 1.0) {
    this.active = true;
    // Fade opacity in over duration
    const start = performance.now();
    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;
      this.opacity = Math.min(elapsed / duration, 0.85);
      if (this.opacity < 0.85) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  hide(duration = 0.8) {
    const start = performance.now();
    const startOp = this.opacity;
    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;
      this.opacity = startOp * (1 - Math.min(elapsed / duration, 1));
      if (this.opacity > 0.01) requestAnimationFrame(tick);
      else { this.opacity = 0; this.active = false; }
    };
    requestAnimationFrame(tick);
  }

  dispose() {
    this._geo.dispose();
    this._mat.dispose();
  }
}
