// HPScene.js — Hypnerotomachia Poliphili: Fountain of Venus (Folio 80)
// First room of the HP garden world. Warm Renaissance palette, water particles,
// Venus figure at apex, linked to AF Emblems I & II via world_links.json.

import * as THREE from 'three';
import { gsap } from 'gsap';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ParticleStream } from '../systems/Particles.js?v=3';

// HP world palette — warm garden gold, not alchemical darkness
const PAL = {
  bg:     0x0b0e06,
  ground: 0x1a2208,
  stone:  0x8a7a5a,
  water:  0x2a4a6a,
  light:  0xf5e8c0,
  accent: 0xc8a44a,
  glow:   0xffe880,
  bloom:  0.35,
};

export class HPScene {
  constructor(renderer, composer, sceneKey = 'fountain') {
    this.renderer  = renderer;
    this.composer  = composer;
    this.sceneKey  = sceneKey;
    this.scene     = new THREE.Scene();
    this.camera    = new THREE.PerspectiveCamera(
      50, window.innerWidth / window.innerHeight, 0.1, 100
    );
    this._tl       = null;
    this._streams  = [];
    this._t        = 0;
    this._disp     = [];
    this._orbs     = null;
    this._controls = null;
  }

  async build() {
    this.scene.background = new THREE.Color(PAL.bg);
    this.scene.fog = new THREE.FogExp2(PAL.bg, 0.055);

    const palace = this.sceneKey === 'planetary_palace';
    if (palace) {
      this.camera.position.set(0, 2.2, 13);
      this._camTarget = new THREE.Vector3(0, 1.1, 0);
    } else {
      this.camera.position.set(0, 3.5, 12);
      this._camTarget = new THREE.Vector3(0, 1.4, 0);
    }
    this.camera.lookAt(this._camTarget);

    // Orbit — drag to look around the room
    this._controls = new OrbitControls(this.camera, this.renderer.domElement);
    this._controls.enableDamping = true;
    this._controls.dampingFactor = 0.08;
    this._controls.enablePan     = false;
    this._controls.minDistance   = 5;
    this._controls.maxDistance   = 22;
    this._controls.maxPolarAngle = Math.PI * 0.495; // stay above the floor
    this._controls.target.copy(this._camTarget);
    this._controls.update();

    this._setupLighting();
    this._buildGround();

    if (palace) {
      this._buildPlanetaryPalace();
    } else {
      this._buildFountain();
      this._buildGarden();
      this._buildVenus();
      this._buildWaterParticles();
      this._buildTimeline();
    }

    const bloom = this.composer.passes.find(p => p.constructor?.name === 'UnrealBloomPass');
    if (bloom) bloom.strength = PAL.bloom;
  }

  _setupLighting() {
    // Warm afternoon sun from upper-right
    const sun = new THREE.DirectionalLight(PAL.light, 2.2);
    sun.position.set(5, 8, 3);
    this.scene.add(sun);

    // Cool sky fill from opposite
    const sky = new THREE.DirectionalLight(0x8ab0d8, 0.5);
    sky.position.set(-3, 5, -2);
    this.scene.add(sky);

    const ambient = new THREE.AmbientLight(0x2a3015, 0.8);
    this.scene.add(ambient);

    // Fountain glow — blue-white point at water
    this._waterLight = new THREE.PointLight(0x80c0ff, 1.5, 7);
    this._waterLight.position.set(0, 1.0, 0);
    this.scene.add(this._waterLight);

    // Warm uplighting on Venus from fountain basin
    this._venusLight = new THREE.PointLight(PAL.accent, 1.2, 5);
    this._venusLight.position.set(0, 2.5, 0);
    this.scene.add(this._venusLight);
  }

  _buildGround() {
    // Garden floor — stone pavement
    const geo = new THREE.PlaneGeometry(40, 40, 6, 6);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x3a3220, roughness: 0.95, metalness: 0.02,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -1.6;
    this.scene.add(mesh);
    this._disp.push(geo, mat);

    // Gravel path leading to fountain
    const pathGeo = new THREE.PlaneGeometry(3, 14);
    const pathMat = new THREE.MeshStandardMaterial({ color: 0x6a5a40, roughness: 0.9 });
    const path    = new THREE.Mesh(pathGeo, pathMat);
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, -1.59, 5);
    this.scene.add(path);
    this._disp.push(pathGeo, pathMat);
  }

  _buildFountain() {
    const stoneMat = new THREE.MeshStandardMaterial({
      color: PAL.stone, roughness: 0.85, metalness: 0.05,
    });
    this._disp.push(stoneMat);

    // Three tiered basins (top → bottom = smaller → larger)
    const tiers = [
      { r: 0.5, h: 0.18, y: 3.2 },
      { r: 1.1, h: 0.22, y: 1.8 },
      { r: 2.2, h: 0.28, y: 0.1 },
    ];

    tiers.forEach(({ r, h, y }) => {
      // Basin rim (torus)
      const rimG = new THREE.TorusGeometry(r, h * 0.45, 8, 32);
      const rim  = new THREE.Mesh(rimG, stoneMat);
      rim.position.y = y;
      rim.rotation.x = Math.PI / 2;
      this.scene.add(rim);

      // Basin bowl (cylinder, open top)
      const bowlG = new THREE.CylinderGeometry(r * 0.95, r * 0.7, h * 1.5, 24, 1, true);
      const bowl  = new THREE.Mesh(bowlG, stoneMat);
      bowl.position.y = y - h * 0.6;
      this.scene.add(bowl);

      // Water surface
      const waterG = new THREE.CircleGeometry(r * 0.9, 24);
      const waterMat = new THREE.MeshStandardMaterial({
        color: PAL.water, transparent: true, opacity: 0.75,
        roughness: 0.1, metalness: 0.4,
        emissive: 0x1a3050, emissiveIntensity: 0.3,
      });
      const water = new THREE.Mesh(waterG, waterMat);
      water.rotation.x = -Math.PI / 2;
      water.position.y = y - h * 0.05;
      this.scene.add(water);
      this._disp.push(rimG, bowlG, waterG, waterMat);
    });

    // Central column
    const colG = new THREE.CylinderGeometry(0.18, 0.22, 4.0, 12);
    const col  = new THREE.Mesh(colG, stoneMat);
    col.position.y = 1.4;
    this.scene.add(col);
    this._disp.push(colG);

    // Base plinth
    const plinthG = new THREE.BoxGeometry(2.8, 0.3, 2.8);
    const plinth  = new THREE.Mesh(plinthG, stoneMat);
    plinth.position.y = -1.45;
    this.scene.add(plinth);
    this._disp.push(plinthG);
  }

  _buildVenus() {
    // Simplified Venus figure atop the column
    const mat = new THREE.MeshStandardMaterial({
      color: 0xd4c0a0, roughness: 0.6, metalness: 0.15,
    });
    this._disp.push(mat);

    const group = new THREE.Group();

    // Torso
    const tG = new THREE.CapsuleGeometry(0.18, 0.6, 6, 10);
    const t  = new THREE.Mesh(tG, mat);
    t.position.y = 0.4;
    group.add(t);
    this._disp.push(tG);

    // Head
    const hG = new THREE.SphereGeometry(0.16, 10, 8);
    const h  = new THREE.Mesh(hG, mat);
    h.position.y = 0.95;
    group.add(h);
    this._disp.push(hG);

    // Arms raised (offering pose)
    [[-0.22, 0.5, 0], [0.22, 0.5, 0]].forEach(([x, y, z], i) => {
      const aG  = new THREE.CapsuleGeometry(0.07, 0.45, 4, 6);
      const arm = new THREE.Mesh(aG, mat);
      arm.position.set(x, y, z);
      arm.rotation.z = i === 0 ? -0.6 : 0.6;
      group.add(arm);
      this._disp.push(aG);
    });

    // Drapery hint (cone at hips)
    const dG  = new THREE.ConeGeometry(0.22, 0.55, 10);
    const d   = new THREE.Mesh(dG, mat);
    d.position.y = 0.05;
    group.add(d);
    this._disp.push(dG);

    group.position.y = 3.7;
    this.scene.add(group);
    this._venus = group;
  }

  _buildGarden() {
    // Cypress trees (dark columns in background)
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3a2810, roughness: 0.9 });
    const leafMat  = new THREE.MeshStandardMaterial({ color: 0x1a3010, roughness: 0.9 });
    this._disp.push(trunkMat, leafMat);

    const treePositions = [
      [-6, 0, -4], [6, 0, -4], [-9, 0, -1], [9, 0, -1],
      [-7, 0, 4], [7, 0, 4],
    ];
    treePositions.forEach(([x, , z]) => {
      const tG  = new THREE.CylinderGeometry(0.12, 0.16, 0.8, 6);
      const t   = new THREE.Mesh(tG, trunkMat);
      t.position.set(x, -1.2, z);
      this.scene.add(t);

      const cG  = new THREE.ConeGeometry(0.55, 3.2, 8);
      const c   = new THREE.Mesh(cG, leafMat);
      c.position.set(x, 0.6, z);
      this.scene.add(c);
      this._disp.push(tG, cG);
    });

    // Low garden hedges
    const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x243818, roughness: 0.95 });
    this._disp.push(hedgeMat);

    [[-4, 0, 2], [4, 0, 2], [-4, 0, -2], [4, 0, -2]].forEach(([x, , z]) => {
      const hG  = new THREE.BoxGeometry(3.5, 0.9, 0.4);
      const hm  = new THREE.Mesh(hG, hedgeMat);
      hm.position.set(x, -1.15, z);
      this.scene.add(hm);
      this._disp.push(hG);
    });
  }

  _buildWaterParticles() {
    // Water falling from top tier → mid tier
    const topStream = new ParticleStream({
      count: 60, source: new THREE.Vector3(0, 3.3, 0),
      target: new THREE.Vector3(0.05, 1.85, 0.05),
      color: 0xd0e8ff, size: 0.03, speed: 0.9, arc: 0.05,
    });
    topStream.opacity = 0.65; topStream.active = true;
    this.scene.add(topStream.points);
    this._streams.push(topStream);

    // Mid tier → bottom basin
    const midStream = new ParticleStream({
      count: 90, source: new THREE.Vector3(0, 1.8, 0),
      target: new THREE.Vector3(0.1, 0.1, 0.1),
      color: 0xb0d8ff, size: 0.04, speed: 0.75, arc: 0.18,
    });
    midStream.opacity = 0.55; midStream.active = true;
    this.scene.add(midStream.points);
    this._streams.push(midStream);

    // Spray splashing outward from basin rim
    const splashStream = new ParticleStream({
      count: 40, source: new THREE.Vector3(0.8, 0.2, 0),
      target: new THREE.Vector3(1.6, -0.5, 0.8),
      color: 0xe8f4ff, size: 0.025, speed: 1.2, arc: 0.4,
    });
    splashStream.opacity = 0.35; splashStream.active = true;
    this.scene.add(splashStream.points);
    this._streams.push(splashStream);
  }

  _buildTimeline() {
    const tl = gsap.timeline({ repeat: -1 });

    // Venus slowly rotates (eternity)
    gsap.to(this._venus.rotation, { y: Math.PI * 2, duration: 30, ease: 'none', repeat: -1 });

    // Water light pulses with falling water rhythm
    tl.to(this._waterLight, { intensity: 2.0, duration: 1.5, ease: 'sine.inOut' }, 0)
      .to(this._waterLight, { intensity: 1.2, duration: 1.5, ease: 'sine.inOut' }, 1.5)
      .to(this._waterLight, { intensity: 1.8, duration: 1.0, ease: 'sine.inOut' }, 3.0)
      .to(this._waterLight, { intensity: 1.0, duration: 1.0, ease: 'sine.inOut' }, 4.0);

    // Venus uplighting — gentle warmth
    tl.to(this._venusLight, { intensity: 1.8, duration: 2.0, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0);

    this._tl = tl;
  }

  // ── Planetary Palace (Folio 88) ─────────────────────────────────────────────
  // The seven planetary metals on pedestals, Saturn's lead → Sol's gold → Luna's
  // silver, in the Chaldean order so the Sun sits at the centre. A colonnade
  // flanks the hall. Each station carries an engraved plaque with its glyph.
  _PALACE_METALS() {
    return [
      { name: 'Saturn',  metal: 'Lead',        glyph: '♄', color: 0x55555e, emissive: 0x111114, metalness: 0.5, rough: 0.6 },
      { name: 'Jupiter', metal: 'Tin',         glyph: '♃', color: 0x9aa0a8, emissive: 0x1a1c20, metalness: 0.7, rough: 0.4 },
      { name: 'Mars',    metal: 'Iron',        glyph: '♂', color: 0x9a3a28, emissive: 0x3a0a04, metalness: 0.6, rough: 0.5 },
      { name: 'Sol',     metal: 'Gold',        glyph: '☉', color: 0xffd24a, emissive: 0x6a4a00, metalness: 1.0, rough: 0.15 },
      { name: 'Venus',   metal: 'Copper',      glyph: '♀', color: 0xc06a3a, emissive: 0x2a1004, metalness: 0.8, rough: 0.35 },
      { name: 'Mercury', metal: 'Quicksilver', glyph: '☿', color: 0xc8d2da, emissive: 0x202428, metalness: 1.0, rough: 0.10 },
      { name: 'Luna',    metal: 'Silver',      glyph: '☽', color: 0xe2e2ea, emissive: 0x222228, metalness: 0.95, rough: 0.2 },
    ];
  }

  _makePlaqueTexture(m) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 132;
    const x = c.getContext('2d');
    x.fillStyle = 'rgba(12,9,5,0.9)'; x.fillRect(0, 0, 256, 132);
    x.strokeStyle = '#6a5a3a'; x.lineWidth = 3; x.strokeRect(4, 4, 248, 124);
    x.textAlign = 'center';
    const col = '#' + m.color.toString(16).padStart(6, '0');
    x.fillStyle = col; x.font = '58px serif';      x.fillText(m.glyph, 128, 58);
    x.fillStyle = '#ecdfc4'; x.font = '24px Georgia'; x.fillText(m.metal, 128, 94);
    x.fillStyle = '#9a875f'; x.font = '15px Georgia'; x.fillText(m.name.toUpperCase(), 128, 117);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  _buildPlanetaryPalace() {
    const METALS = this._PALACE_METALS();
    const N = METALS.length, SPAN = 13;
    this._orbs = [];

    // Colonnade flanking the hall
    const colMat = new THREE.MeshStandardMaterial({ color: PAL.stone, roughness: 0.82, metalness: 0.05 });
    this._disp.push(colMat);
    for (const side of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        const cg  = new THREE.CylinderGeometry(0.26, 0.32, 5.2, 14);
        const col = new THREE.Mesh(cg, colMat);
        col.position.set(side * 5.0, 1.1, -4 + i * 2.3);
        this.scene.add(col);
        const capg = new THREE.BoxGeometry(0.85, 0.32, 0.85);
        const cap  = new THREE.Mesh(capg, colMat);
        cap.position.set(side * 5.0, 3.75, -4 + i * 2.3);
        this.scene.add(cap);
        this._disp.push(cg, capg);
      }
    }

    // Seven planetary stations
    const pedMat = new THREE.MeshStandardMaterial({ color: PAL.stone, roughness: 0.85 });
    this._disp.push(pedMat);
    METALS.forEach((m, i) => {
      const px = (i - (N - 1) / 2) * (SPAN / (N - 1));

      const pg  = new THREE.CylinderGeometry(0.34, 0.46, 1.3, 16);
      const ped = new THREE.Mesh(pg, pedMat);
      ped.position.set(px, -0.85, 0);
      this.scene.add(ped); this._disp.push(pg);

      const og  = new THREE.SphereGeometry(0.42, 28, 20);
      const om  = new THREE.MeshStandardMaterial({
        color: m.color, emissive: m.emissive, emissiveIntensity: 0.55,
        metalness: m.metalness, roughness: m.rough,
      });
      const orb = new THREE.Mesh(og, om);
      orb.position.set(px, 0.6, 0);
      this.scene.add(orb); this._disp.push(og, om);

      const pl = new THREE.PointLight(m.color, 0.7, 3.6);
      pl.position.set(px, 0.6, 0.4);
      this.scene.add(pl);

      const plqT = this._makePlaqueTexture(m);
      const plqG = new THREE.PlaneGeometry(1.15, 0.6);
      const plqM = new THREE.MeshBasicMaterial({ map: plqT, transparent: true });
      const plq  = new THREE.Mesh(plqG, plqM);
      plq.position.set(px, -0.25, 0.52);
      this.scene.add(plq); this._disp.push(plqG, plqM, plqT);

      this._orbs.push({ orb, pl, base: 0.6, phase: i * 0.7 });
    });
  }

  update(dt) {
    this._t += dt;
    if (this._controls) this._controls.update();
    this._streams.forEach(s => s.update(this._t));
    if (this._orbs) {
      for (const { orb, pl, base, phase } of this._orbs) {
        orb.position.y = base + Math.sin(this._t * 1.2 + phase) * 0.12;
        orb.rotation.y += dt * 0.5;
        pl.intensity = 0.55 + Math.sin(this._t * 1.5 + phase) * 0.3;
      }
    }
  }

  dispose() {
    if (this._controls) { this._controls.dispose(); this._controls = null; }
    if (this._tl) { this._tl.kill(); this._tl = null; }
    gsap.killTweensOf([this._venus?.rotation, this._waterLight, this._venusLight]);
    this._streams.forEach(s => s.dispose());
    this._streams = [];
    this._disp.forEach(d => d?.dispose?.());
    this.scene.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
  }
}
