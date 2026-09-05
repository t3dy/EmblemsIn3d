// ArchivesScene.js — Cross-reference graph: HP folios ↔ AF emblems
// Bipartite layout: HP nodes (gold, left) connected to AF nodes (stage-coloured, right).
// Click any node to navigate to its scene. Showcase emblems have gold halo rings.

import * as THREE from 'three';

const STAGE_COLOR = {
  NIGREDO:    0xcc3300,
  ALBEDO:     0x3a88cc,
  CITRINITAS: 0xddaa00,
  RUBEDO:     0xff5500,
};

const HP_COLOR   = 0xc8a440;
const SHOWCASE   = new Set([4, 5, 10, 33, 50]);
const STAGE_ORDER = ['NIGREDO', 'ALBEDO', 'CITRINITAS', 'RUBEDO'];

export class ArchivesScene {
  constructor(worldLinks, emblems, onClickHP, onClickAF, renderer, composer) {
    this.worldLinks = worldLinks;
    this.emblems    = emblems;
    this.onClickHP  = onClickHP;
    this.onClickAF  = onClickAF;
    this.renderer   = renderer;
    this.composer   = composer;

    this.scene  = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(52, 1, 0.1, 200);

    this._nodes         = [];
    this._disp          = [];
    this._labels        = [];
    this._labelContainer = null;
    this._onMove        = null;
    this._onClick       = null;
    this._hpGlow        = null;
    this._afGlow        = null;
    this._t             = 0;
  }

  build() {
    this.scene.background = new THREE.Color(0x030508);
    this.scene.fog = new THREE.FogExp2(0x030508, 0.032);

    this.camera.position.set(0, 1.5, 17);
    this.camera.lookAt(0, 0.5, 0);

    // Lighting — cool deep-archive feel
    this.scene.add(new THREE.AmbientLight(0x0a0f1a, 1.5));
    const rim = new THREE.DirectionalLight(0x1a2a5a, 0.9);
    rim.position.set(-4, 6, -6);
    this.scene.add(rim);

    // ── Node layouts ────────────────────────────────────────────────────────

    const hpFolios = [...new Set(this.worldLinks.map(l => l.hp_folio))].sort((a, b) => a - b);

    const afNums = [...new Set(this.worldLinks.flatMap(l => l.af_emblems))];
    const afEmblems = afNums
      .map(n => this.emblems.find(e => e.number === n))
      .filter(Boolean)
      .sort((a, b) => {
        const si = STAGE_ORDER.indexOf(a.alchemical_stage ?? '');
        const sj = STAGE_ORDER.indexOf(b.alchemical_stage ?? '');
        return si !== sj ? si - sj : a.number - b.number;
      });

    const X_HP = -7, X_AF = 7;
    const hpPos = {};
    const afPos = {};

    // HP nodes
    hpFolios.forEach((folio, i) => {
      const y = this._spread(i, hpFolios.length, 6.4);
      const pos = new THREE.Vector3(X_HP, y, 0);
      hpPos[folio] = pos;

      const geo = new THREE.SphereGeometry(0.38, 12, 9);
      const mat = new THREE.MeshStandardMaterial({
        color: HP_COLOR, emissive: HP_COLOR, emissiveIntensity: 0.35,
        roughness: 0.35, metalness: 0.55,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      mesh.userData = { type: 'HP', id: folio };
      this.scene.add(mesh);
      this._nodes.push({ mesh, mat, type: 'HP', id: folio, basePulse: 0.35 });
      this._disp.push(geo, mat);
    });

    // AF nodes
    afEmblems.forEach((emb, i) => {
      const y   = this._spread(i, afEmblems.length, 6.4);
      const pos = new THREE.Vector3(X_AF, y, 0);
      afPos[emb.number] = pos;

      const col  = STAGE_COLOR[emb.alchemical_stage] ?? 0x888888;
      const r    = SHOWCASE.has(emb.number) ? 0.44 : 0.3;
      const geo  = new THREE.SphereGeometry(r, 12, 9);
      const mat  = new THREE.MeshStandardMaterial({
        color: col, emissive: col,
        emissiveIntensity: SHOWCASE.has(emb.number) ? 0.55 : 0.22,
        roughness: 0.45, metalness: 0.35,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      mesh.userData = { type: 'AF', id: emb.number };
      this.scene.add(mesh);

      // Gold halo ring for showcase emblems
      if (SHOWCASE.has(emb.number)) {
        const rG = new THREE.TorusGeometry(r * 1.6, 0.022, 6, 28);
        const rM = new THREE.MeshBasicMaterial({ color: 0xc8a040, transparent: true, opacity: 0.55 });
        const ring = new THREE.Mesh(rG, rM);
        ring.position.copy(pos);
        this.scene.add(ring);
        this._disp.push(rG, rM);
      }

      const label = emb.roman_numeral || String(emb.number);
      this._nodes.push({ mesh, mat, type: 'AF', id: emb.number,
        basePulse: SHOWCASE.has(emb.number) ? 0.55 : 0.22 });
      this._disp.push(geo, mat);

      // Short label
      this._queueLabel(mesh, label, '#c0bcd8', SHOWCASE.has(emb.number) ? '0.68rem' : '0.58rem');
    });

    hpFolios.forEach(folio => {
      this._queueLabel(hpPos[folio], `f.${folio}`, '#d4b84a', '0.64rem');
    });

    // ── Edges (bezier curves) ────────────────────────────────────────────────
    this.worldLinks.forEach(link => {
      const from = hpPos[link.hp_folio];
      if (!from) return;

      link.af_emblems.forEach(num => {
        const to = afPos[num];
        if (!to) return;

        const emb = this.emblems.find(e => e.number === num);
        const col = STAGE_COLOR[emb?.alchemical_stage] ?? 0x556677;

        // Subtle z-bow so parallel edges don't overlap
        const bow  = 0.8 + Math.random() * 1.2;
        const mid  = new THREE.Vector3(0, (from.y + to.y) / 2, bow);
        const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
        const pts   = curve.getPoints(32);

        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.3 });
        this.scene.add(new THREE.Line(geo, mat));
        this._disp.push(geo, mat);
      });
    });

    // ── Centre divider ───────────────────────────────────────────────────────
    const divGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -8, 0), new THREE.Vector3(0, 8, 0),
    ]);
    const divMat = new THREE.LineBasicMaterial({ color: 0x1a1e2e, transparent: true, opacity: 0.6 });
    this.scene.add(new THREE.Line(divGeo, divMat));
    this._disp.push(divGeo, divMat);

    // Ambient column glows
    this._hpGlow = new THREE.PointLight(HP_COLOR, 0.7, 8);
    this._hpGlow.position.set(X_HP, 7, 1);
    this.scene.add(this._hpGlow);

    this._afGlow = new THREE.PointLight(0x8888ff, 0.5, 8);
    this._afGlow.position.set(X_AF, 7, 1);
    this.scene.add(this._afGlow);

    // ── DOM labels ───────────────────────────────────────────────────────────
    this._buildLabels();

    // ── Raycasting ───────────────────────────────────────────────────────────
    this._setupInteraction();

    // ── Bloom ────────────────────────────────────────────────────────────────
    const bloom = this.composer.passes.find(p => p.constructor?.name === 'UnrealBloomPass');
    if (bloom) bloom.strength = 0.65;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  _spread(i, total, range) {
    if (total <= 1) return 0;
    return range * (i / (total - 1) - 0.5) * 2;
  }

  _queueLabel(posOrMesh, text, color, size) {
    this._labels.push({ source: posOrMesh, text, color, size, el: null });
  }

  _buildLabels() {
    const container = document.createElement('div');
    container.id = '_arc-labels';
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:15;overflow:hidden;';
    document.body.appendChild(container);
    this._labelContainer = container;

    // Column header labels
    const mkHeader = (txt, x, color) => {
      const el = document.createElement('div');
      el.textContent = txt;
      el.style.cssText = `
        position:absolute; transform:translate(-50%,-50%);
        font-family:Georgia,serif; font-size:0.62rem; letter-spacing:0.14em;
        text-transform:uppercase; color:${color}; opacity:0.55;
        white-space:nowrap; pointer-events:none;
      `;
      container.appendChild(el);
      return el;
    };
    this._hpHeader = mkHeader('Hypnerotomachia', -7, '#d4b84a');
    this._afHeader = mkHeader('Atalanta Fugiens', 7, '#9898cc');

    // Node labels
    this._labels.forEach(lbl => {
      const el = document.createElement('span');
      el.textContent = lbl.text;
      el.style.cssText = `
        position:absolute; transform:translate(0,-50%);
        font-family:Georgia,serif; font-size:${lbl.size}; letter-spacing:0.04em;
        color:${lbl.color}; opacity:0.75;
        white-space:nowrap; pointer-events:none;
      `;
      container.appendChild(el);
      lbl.el = el;
    });
  }

  _setupInteraction() {
    const canvas    = this.renderer.domElement;
    const raycaster = new THREE.Raycaster();
    const mouse     = new THREE.Vector2();
    const meshes    = this._nodes.map(n => n.mesh);

    this._onMove = (e) => {
      const { w, h } = this._vp();
      mouse.x =  (e.clientX / w) * 2 - 1;
      mouse.y = -(e.clientY / h) * 2 + 1;
      raycaster.setFromCamera(mouse, this.camera);
      const hits  = raycaster.intersectObjects(meshes, false);
      const hitMesh = hits[0]?.object ?? null;
      this._nodes.forEach(n => {
        const active = n.mesh === hitMesh;
        n.mat.emissiveIntensity = active ? 1.1 : n.basePulse;
        n.mesh.scale.setScalar(active ? 1.35 : 1.0);
      });
      canvas.style.cursor = hitMesh ? 'pointer' : 'default';
    };

    this._onClick = (e) => {
      const { w, h } = this._vp();
      mouse.x =  (e.clientX / w) * 2 - 1;
      mouse.y = -(e.clientY / h) * 2 + 1;
      raycaster.setFromCamera(mouse, this.camera);
      const hits = raycaster.intersectObjects(meshes, false);
      if (!hits.length) return;
      const ud = hits[0].object.userData;
      if (ud.type === 'HP') this.onClickHP(ud.id);
      else                  this.onClickAF(ud.id);
    };

    canvas.addEventListener('mousemove', this._onMove);
    canvas.addEventListener('click',     this._onClick);
  }

  _vp() {
    const c = this.renderer.domElement;
    return {
      w: c.clientWidth  || document.documentElement.clientWidth  || 1280,
      h: c.clientHeight || document.documentElement.clientHeight || 720,
    };
  }

  update(dt) {
    this._t += dt;
    const t = this._t;

    // Gentle camera drift
    this.camera.position.x = Math.sin(t * 0.055) * 1.8;
    this.camera.position.z = 17 + Math.sin(t * 0.038) * 1.0;
    this.camera.position.y = 1.5 + Math.sin(t * 0.048) * 0.7;
    this.camera.lookAt(0, 0.5, 0);

    // Column glow pulse
    if (this._hpGlow) this._hpGlow.intensity = 0.55 + Math.sin(t * 1.1) * 0.25;
    if (this._afGlow) this._afGlow.intensity  = 0.45 + Math.sin(t * 0.85) * 0.2;

    // Sync node labels
    const { w, h } = this._vp();
    this._labels.forEach(({ source, el }) => {
      if (!el) return;
      const pos3 = source instanceof THREE.Vector3 ? source.clone()
        : source.position.clone();
      const proj = pos3.project(this.camera);
      const sx = (proj.x + 1) / 2 * w;
      const sy = (-proj.y + 1) / 2 * h;
      // HP labels offset left, AF labels offset right
      const offsetX = pos3.x < 0 ? -28 : 8;
      el.style.left = (sx + offsetX) + 'px';
      el.style.top  = sy + 'px';
    });

    // Sync column headers — project a fixed 3D point above each column
    if (this._hpHeader) {
      const hp3 = new THREE.Vector3(-7, 7.8, 0).project(this.camera);
      this._hpHeader.style.left = ((hp3.x + 1) / 2 * w) + 'px';
      this._hpHeader.style.top  = ((-hp3.y + 1) / 2 * h) + 'px';
    }
    if (this._afHeader) {
      const af3 = new THREE.Vector3(7, 7.8, 0).project(this.camera);
      this._afHeader.style.left = ((af3.x + 1) / 2 * w) + 'px';
      this._afHeader.style.top  = ((-af3.y + 1) / 2 * h) + 'px';
    }
  }

  dispose() {
    const canvas = this.renderer.domElement;
    if (this._onMove)   canvas.removeEventListener('mousemove', this._onMove);
    if (this._onClick)  canvas.removeEventListener('click',     this._onClick);
    canvas.style.cursor = 'default';

    if (this._labelContainer) { this._labelContainer.remove(); this._labelContainer = null; }
    this._labels = [];

    this._disp.forEach(d => d?.dispose?.());
    this.scene.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material?.dispose) o.material.dispose();
    });
  }
}
