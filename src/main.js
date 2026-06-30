import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { EmblemScene, getEnvMap } from './scenes/EmblemScene.js?v=9';
import { HPScene } from './scenes/HPScene.js?v=6';
import { ArchivesScene } from './scenes/ArchivesScene.js?v=8';
import { AlchemicalAudio } from './systems/AlchemicalAudio.js?v=5';

// ─── Constants ────────────────────────────────────────────────────────────────

// Showcase set — the 5 fully-built scenes
const SHOWCASE = [4, 5, 10, 33, 50];

const STAGE_COLORS = {
  NIGREDO:    '#cc3300',
  ALBEDO:     '#a0c4d8',
  CITRINITAS: '#f0d040',
  RUBEDO:     '#ffd700',
};

// Relative path to the woodcut plate for an emblem (works on GitHub Pages
// project sites where a leading "/" would resolve to the wrong root).
function emblemImagePath(num) {
  return `../images/emblems/emblem-${String(num).padStart(2, '0')}.jpg`;
}

// Shared texture loader for the 3D gallery wall.
const textureLoader = new THREE.TextureLoader();

// ─── State ────────────────────────────────────────────────────────────────────

const state = {
  world: 'AF',
  emblems: null,
  symbols: null,
  annotations: null,
  worldLinks: null,
  currentAnnotations: [],
  currentEmblem: null,
  activeScene: null,
  inGallery: false,
  annotationTimer: null,
  tours: null,
  tour: null,
  tourStop: 0,
  diorama: null,
};

// ─── Renderer ─────────────────────────────────────────────────────────────────

const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Use actual CSS pixel size (handles 0-dimension iframes / preview panes)
function getViewport() {
  const w = canvas.clientWidth  || document.documentElement.clientWidth  || window.innerWidth  || 1280;
  const h = canvas.clientHeight || document.documentElement.clientHeight || window.innerHeight || 720;
  return { w: Math.max(w, 100), h: Math.max(h, 100) };
}

// ─── Composer ─────────────────────────────────────────────────────────────────

const dummyScene = new THREE.Scene();
const dummyCam   = new THREE.PerspectiveCamera();
const composer   = new EffectComposer(renderer);
composer.addPass(new RenderPass(dummyScene, dummyCam));

const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight), 0.6, 0.4, 0.85
);
composer.addPass(bloom);

// Now safe to define resizeAll (composer + bloom are initialized)
function resizeAll() {
  const { w, h } = getViewport();
  renderer.setSize(w, h, false);
  composer.setSize(w, h);
  bloom.setSize(w, h);
  if (state.activeScene?.camera) {
    state.activeScene.camera.aspect = w / h;
    state.activeScene.camera.updateProjectionMatrix();
  }
}

const clock = new THREE.Clock();

// ─── Data ─────────────────────────────────────────────────────────────────────

function setProgress(pct, text) {
  document.getElementById('loading-bar').style.width = pct + '%';
  if (text) document.getElementById('loading-sub').textContent = text;
}

async function loadData() {
  setProgress(10, 'Loading emblem data…');
  const V = '7'; // bump when data files are re-exported
  const [er, sr, ar, wr, tr, dr] = await Promise.all([
    fetch(`./data/emblems.json?v=${V}`),
    fetch(`./data/hp_symbols.json?v=${V}`),
    fetch(`./data/hp_annotations.json?v=${V}`),
    fetch(`./data/world_links.json?v=${V}`),
    fetch(`./data/tours.json?v=${V}`),
    fetch(`./data/diorama.json?v=${V}`).catch(() => null),
  ]);
  state.emblems     = await er.json();
  state.symbols     = await sr.json();
  state.annotations = await ar.json();
  state.worldLinks  = await wr.json();
  state.tours       = await tr.json();
  state.diorama     = dr && dr.ok ? await dr.json() : [];
  setProgress(50, 'Preparing scenes…');
}

// ─── HUD ──────────────────────────────────────────────────────────────────────

function updateHUD(emblemData) {
  const stage = emblemData.alchemical_stage || 'NIGREDO';
  const stageEl = document.getElementById('hud-stage');
  const col = STAGE_COLORS[stage] || '#8b4513';

  document.getElementById('emblem-hud').style.display = 'block';
  stageEl.textContent    = stage;
  stageEl.style.color    = col;
  stageEl.style.borderColor = col;
  document.getElementById('hud-title').textContent = emblemData.label || '';
  document.getElementById('hud-motto').textContent =
    emblemData.motto_english || emblemData.motto_latin || '';

  // Show/hide emblem navigation arrows depending on showcase membership
  const idx = SHOWCASE.indexOf(emblemData.number);
  const navEl = document.getElementById('emblem-nav');
  if (navEl) {
    navEl.style.display = 'flex';
    document.getElementById('nav-prev').disabled = (idx <= 0);
    document.getElementById('nav-next').disabled = (idx >= SHOWCASE.length - 1 || idx < 0);
  }

  document.getElementById('back-btn').style.display = 'inline-block';
}

function hideHUD() {
  document.getElementById('emblem-hud').style.display = 'none';
  const navEl = document.getElementById('emblem-nav');
  if (navEl) navEl.style.display = 'none';
  document.getElementById('back-btn').style.display = 'none';
}

// ─── Generic emblem text card ─────────────────────────────────────────────────

function showTextCard(emblem) {
  const el = document.getElementById('text-card');
  if (!el) return;
  const stage = emblem.alchemical_stage || 'NIGREDO';
  const col   = STAGE_COLORS[stage] || '#8b4513';
  const epigram = (emblem.epigram_english || '').replace(/\n/g,' ').trim().slice(0, 260);
  el.innerHTML = `
    <div class="tc-badge" style="color:${col};border-color:${col}">${stage}</div>
    <div class="tc-numeral" style="color:${col}">${emblem.roman_numeral || emblem.number}</div>
    <div class="tc-title">${emblem.label || ''}</div>
    <div class="tc-rule"></div>
    ${emblem.motto_english ? `<div class="tc-motto">${emblem.motto_english}</div>` : ''}
    ${epigram ? `<p class="tc-epigram">${epigram}${epigram.length === 260 ? '…' : ''}</p>` : ''}
    <div class="tc-hint">Drag canvas to rotate · press A for context · G for gallery</div>
  `;
  el.style.display = 'flex';
}

function hideTextCard() {
  const el = document.getElementById('text-card');
  if (el) el.style.display = 'none';
}

// ─── Emblem Scene ─────────────────────────────────────────────────────────────

async function launchEmblemScene(emblemNumber) {
  if (state.activeScene) {
    state.activeScene.dispose();
    state.activeScene = null;
  }

  const emblemData = state.emblems.find(e => e.number === emblemNumber);
  if (!emblemData) return;

  state.currentEmblem = emblemData;
  state.inGallery = false;

  const dioramaLayers = state.diorama?.find(d => d.number === emblemNumber)?.layers || null;
  const scene = new EmblemScene(emblemData, renderer, composer, dioramaLayers);
  await scene.build();

  // Wire composer to this scene
  composer.passes[0] = new RenderPass(scene.scene, scene.camera);

  state.activeScene = scene;
  updateHUD(emblemData);
  setActiveWorldBtn('btn-af');

  // Show content card for generic scenes (suppressed during a tour — the tour
  // rail carries the text instead)
  if (scene.isGeneric && !state.tour) {
    showTextCard(emblemData);
  } else {
    hideTextCard();
  }

  // Stage audio
  AlchemicalAudio.setStage(emblemData.alchemical_stage || 'NIGREDO');

  // Linked HP annotations (auto-surface after 6s, or press A) — off during tours
  state.currentAnnotations = findLinkedAnnotations(emblemData.number);
  if (!state.tour) {
    scheduleAnnotation();
    showHint('Drag to rotate  ·  ← →  navigate  ·  A  context  ·  G  gallery');
  }
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

function buildGallery() {
  if (state.activeScene) {
    state.activeScene.dispose();
    state.activeScene = null;
  }

  hideTextCard();
  hidePlatesOverlay();
  clearTour();
  hideToursMenu();
  document.getElementById('annotation-panel').style.display = 'none';
  if (state.annotationTimer) clearTimeout(state.annotationTimer);
  state.inGallery = true;
  hideHUD();
  setActiveWorldBtn('btn-af');

  const scene  = new THREE.Scene();
  scene.background = new THREE.Color(0x060402);
  scene.fog = new THREE.FogExp2(0x060402, 0.04);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 30);
  camera.lookAt(0, 0, 0);

  // The plates are lit carved reliefs, kept bright by an emissive floor (so they
  // can't darken below the old unlit look) plus a raking key for dimensional
  // shading, hemisphere fill, and image-based light for a soft sheen.
  scene.environment = getEnvMap(renderer);
  scene.environmentIntensity = 0.35;
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  scene.add(new THREE.HemisphereLight(0xffe8c8, 0x1a120a, 0.8));
  const galleryKey = new THREE.DirectionalLight(0xfff2dc, 1.6);
  galleryKey.position.set(-6, 8, 10);
  scene.add(galleryKey);

  const COLS      = 9;
  const SPACING_X = 3.2;
  const SPACING_Y = 4.0;
  const ROWS      = Math.ceil(state.emblems.length / COLS);
  const SHOWCASE_SET = new Set(SHOWCASE);

  // Dim stage tint shown until each woodcut texture finishes loading
  const STAGE_HEX = {
    NIGREDO: 0x3a1408, ALBEDO: 0x14242e, CITRINITAS: 0x2a2008, RUBEDO: 0x300808,
  };

  const CARD_W = 2.6, CARD_H = 3.2;
  const cards = [];

  state.emblems.forEach((emb, idx) => {
    const col = idx % COLS;
    const row = Math.floor(idx / COLS);
    const x   = (col - (COLS - 1) / 2) * SPACING_X;
    const y   = -(row - (ROWS - 1) / 2) * SPACING_Y;

    const isShowcase = SHOWCASE_SET.has(emb.number);
    const stage = emb.alchemical_stage || 'NIGREDO';

    const geo = new THREE.PlaneGeometry(CARD_W, CARD_H);
    const mat = new THREE.MeshStandardMaterial({
      color: STAGE_HEX[stage] || 0x2a1810,
      roughness: 0.85, metalness: 0.0, envMapIntensity: 0.3,
      side: THREE.DoubleSide,
    });
    // Load the woodcut; use it as colour AND emissive so the plate keeps the old
    // unlit brightness as a floor while the key light adds carved dimensional shading.
    textureLoader.load(emblemImagePath(emb.number), (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      mat.map = tex;
      mat.emissiveMap = tex;
      mat.emissive.set(0xffffff);
      mat.emissiveIntensity = 0.7;
      mat.color.set(0xffffff);
      mat.needsUpdate = true;
    });

    const zc = isShowcase ? 0.15 : 0;
    const baseScale = isShowcase ? 1.18 : 1.0;

    // Backing plaque for carved-edge depth when the gallery camera drifts
    const backGeo = new THREE.BoxGeometry(CARD_W + 0.12, CARD_H + 0.12, 0.14);
    const backMat = new THREE.MeshStandardMaterial({ color: 0x1a1008, roughness: 0.9, metalness: 0.1, envMapIntensity: 0.25 });
    const back = new THREE.Mesh(backGeo, backMat);
    back.position.set(x, y, zc - 0.09);
    back.scale.set(baseScale, baseScale, 1);
    scene.add(back);

    const card = new THREE.Mesh(geo, mat);
    card.scale.set(baseScale, baseScale, 1);
    card.position.set(x, y, zc);
    card.userData = { emblemNumber: emb.number, label: emb.label, isShowcase };
    scene.add(card);

    let border = null;
    if (isShowcase) {
      const edgesG   = new THREE.EdgesGeometry(geo);
      const edgesMat = new THREE.LineBasicMaterial({ color: 0xe0b850 });
      border = new THREE.LineSegments(edgesG, edgesMat);
      border.position.copy(card.position);
      border.scale.copy(card.scale);
      scene.add(border);
    }
    cards.push({ card, geo, mat, isShowcase, border, baseScale });
  });

  // Tooltip label
  const tooltip = document.getElementById('gallery-tooltip');

  // Raycaster for hover + click
  const raycaster = new THREE.Raycaster();
  const mouse     = new THREE.Vector2();
  let   hovered   = null;

  const onMouseMove = (e) => {
    mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight)  * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(cards.map(c => c.card), false);
    if (hits.length) {
      const ud = hits[0].object.userData;
      hovered = ud.emblemNumber;
      if (tooltip) {
        tooltip.textContent = ud.label || `Emblem ${ud.emblemNumber}`;
        tooltip.style.opacity = '1';
        tooltip.style.left = e.clientX + 'px';
        tooltip.style.top  = (e.clientY - 36) + 'px';
      }
      canvas.style.cursor = 'pointer';
    } else {
      hovered = null;
      if (tooltip) tooltip.style.opacity = '0';
      canvas.style.cursor = 'default';
    }
  };

  const onClick = (e) => {
    mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight)  * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(cards.map(c => c.card), false);
    if (hits.length) {
      const num = hits[0].object.userData.emblemNumber;
      cleanup();
      launchEmblemScene(num);
    }
  };

  const onWheel = (e) => {
    camera.position.z = Math.max(14, Math.min(50, camera.position.z + e.deltaY * 0.02));
  };

  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('click',     onClick);
  canvas.addEventListener('wheel',     onWheel, { passive: true });

  const cleanup = () => {
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('click',     onClick);
    canvas.removeEventListener('wheel',     onWheel);
    if (tooltip) tooltip.style.opacity = '0';
    canvas.style.cursor = 'default';
    cards.forEach(({ geo, mat }) => { if (mat.map) mat.map.dispose(); geo.dispose(); mat.dispose(); });
    scene.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
  };

  composer.passes[0] = new RenderPass(scene, camera);
  bloom.strength = 0.4;

  // Gentle parallax camera drift
  let   galleryT  = 0;
  const baseY     = camera.position.y;
  const baseZ     = camera.position.z;

  state.activeScene = {
    scene,
    camera,
    update: (dt) => {
      galleryT += dt;
      camera.position.y = baseY + Math.sin(galleryT * 0.2) * 0.5;
      // Gentle "breathing" pulse on the showcase plates
      cards.forEach(({ card, border, isShowcase, baseScale }) => {
        if (isShowcase) {
          const s = baseScale * (1 + Math.sin(galleryT * 1.4 + card.position.x) * 0.02);
          card.scale.set(s, s, 1);
          if (border) border.scale.set(s, s, 1);
        }
      });
    },
    dispose: cleanup,
  };

  showHint('Scroll to zoom · click a plate to enter its world · ✦ = built scene · Plates tab = full atlas');
}

// ─── Plates atlas (2-D image-card tab + lightbox) ─────────────────────────────

let _platesBuilt = false;

function buildPlatesGrid() {
  if (_platesBuilt) return;
  const grid = document.getElementById('plates-grid');
  if (!grid) return;
  const SHOWCASE_SET = new Set(SHOWCASE);
  grid.innerHTML = state.emblems.map(emb => {
    const showcase = SHOWCASE_SET.has(emb.number);
    const numeral  = emb.roman_numeral || (emb.number === 0 ? '—' : emb.number);
    const title    = (emb.label || '').replace(/"/g, '&quot;');
    return `
      <button class="plate-card${showcase ? ' showcase' : ''}" onclick="window.openPlate(${emb.number})" title="${title}">
        ${showcase ? '<span class="pc-star">✦</span>' : ''}
        <img loading="lazy" src="${emblemImagePath(emb.number)}" alt="Emblem ${numeral}"/>
        <span class="pc-meta"><span class="pc-num">${numeral}</span><span class="pc-title">${title}</span></span>
      </button>`;
  }).join('');
  _platesBuilt = true;
}

function showPlatesOverlay() {
  buildPlatesGrid();
  hideHUD();
  hideTextCard();
  document.getElementById('annotation-panel').style.display = 'none';
  setActiveWorldBtn('btn-plates');
  state.inGallery = false;
  const el = document.getElementById('plates-overlay');
  if (el) { el.style.display = 'block'; el.scrollTop = 0; }
  showHint('Click a plate to read it · ← → to flip through · Esc to close');
}

function hidePlatesOverlay() {
  const el = document.getElementById('plates-overlay');
  if (el) el.style.display = 'none';
  closePlate();
}

function openPlate(num) {
  const emb = state.emblems.find(e => e.number === num);
  if (!emb) return;
  state._plateNum = num;
  const stage   = emb.alchemical_stage || 'NIGREDO';
  const col     = STAGE_COLORS[stage] || '#8b4513';
  const numeral = emb.roman_numeral || (emb.number === 0 ? '—' : emb.number);
  const img = document.getElementById('lb-img');
  img.src = emblemImagePath(num);
  img.alt = emb.label || ('Emblem ' + numeral);
  const epigram = (emb.epigram_english || '').trim();
  document.getElementById('lb-text').innerHTML = `
    <div class="lb-badge" style="color:${col};border-color:${col}">${stage}</div>
    <div class="lb-num" style="color:${col}">${numeral}</div>
    <div class="lb-title">${emb.label || ''}</div>
    ${emb.motto_latin   ? `<div class="lb-motto-la">${emb.motto_latin}</div>` : ''}
    ${emb.motto_english ? `<div class="lb-motto-en">&ldquo;${emb.motto_english}&rdquo;</div>` : ''}
    ${epigram ? `<div class="lb-epigram">${epigram}</div>` : ''}
    <div class="lb-actions">
      <button onclick="window.platePrev()">&larr; Prev</button>
      <button onclick="window.enterPlate3D()">Enter 3-D World &#9656;</button>
      <button onclick="window.plateNext()">Next &rarr;</button>
    </div>`;
  document.getElementById('plate-lightbox').style.display = 'flex';
}

function closePlate() {
  const el = document.getElementById('plate-lightbox');
  if (el) el.style.display = 'none';
}

function plateStep(dir) {
  const nums = state.emblems.map(e => e.number);
  const i = nums.indexOf(state._plateNum);
  if (i < 0) return;
  openPlate(nums[(i + dir + nums.length) % nums.length]);
}

window.openPlate    = openPlate;
window.closePlate   = closePlate;
window.platePrev    = () => plateStep(-1);
window.plateNext    = () => plateStep(1);
window.enterPlate3D = () => {
  const num = state._plateNum;
  hidePlatesOverlay();
  fadeSwitch(() => launchEmblemScene(num));
};

// ─── Guided tours (connect the 3-D models to the research) ────────────────────

// Light inline formatting for tour ledes: **bold** and *italic*
function fmtProse(s) {
  return (s || '')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function glyphFor(sym) {
  if (!sym || !sym.symbol_unicode) return '';
  const cp = parseInt(String(sym.symbol_unicode).replace(/^U\+/i, ''), 16);
  return Number.isFinite(cp) ? String.fromCodePoint(cp) : '';
}

let _toursMenuBuilt = false;

function buildToursMenu() {
  if (_toursMenuBuilt) return;
  const wrap = document.getElementById('tours-menu-grid');
  if (!wrap || !state.tours) return;
  wrap.innerHTML = Object.values(state.tours).map(t => `
    <button class="tour-card" style="--accent:${t.accent}" onclick="window.startTour('${t.id}')">
      <div class="tc-kicker" style="color:${t.accent}">Guided tour · ${resolveTourStops(t).length} stops</div>
      <h3>${t.title}</h3>
      <p>${t.subtitle}</p>
      <p class="tc-intro">${fmtProse(t.intro)}</p>
      <span class="tc-go" style="color:${t.accent}">Begin the tour &rarr;</span>
    </button>`).join('');
  _toursMenuBuilt = true;
}

function showToursMenu() {
  clearTour();
  hideHUD();
  hideTextCard();
  hidePlatesOverlay();
  document.getElementById('annotation-panel').style.display = 'none';
  setActiveWorldBtn('btn-tours');
  state.inGallery = false;
  buildToursMenu();
  const el = document.getElementById('tours-menu');
  if (el) { el.style.display = 'flex'; el.scrollTop = 0; }
}

function hideToursMenu() {
  const el = document.getElementById('tours-menu');
  if (el) el.style.display = 'none';
}

function clearTour() {
  state.tour = null;
  const p = document.getElementById('tour-panel');
  if (p) p.style.display = 'none';
}

// Resolve a tour's stops — generated from world_links for the cross-book tour,
// otherwise taken verbatim from tours.json.
function resolveTourStops(tour) {
  if (tour.source === 'world_links' && Array.isArray(state.worldLinks)) {
    return state.worldLinks
      .filter(l => Array.isArray(l.af_emblems) && l.af_emblems.length)
      .map(l => ({ emblem: l.af_emblems[0], folio: l.hp_folio, scene: l.hp_scene, lede: l.commentary }));
  }
  return tour.stops || [];
}

async function startTour(id) {
  const tour = state.tours && state.tours[id];
  if (!tour) return;
  hideToursMenu();
  state.tour = { ...tour, stops: resolveTourStops(tour) };
  state.tourStop = 0;
  await tourGoto(0);
}

async function tourGoto(i) {
  const tour = state.tour;
  if (!tour) return;
  const n = tour.stops.length;
  state.tourStop = Math.max(0, Math.min(n - 1, i));
  const stop = tour.stops[state.tourStop];
  await launchEmblemScene(stop.emblem);  // show the actual model
  hideHUD();                              // the rail replaces the default HUD
  hideTextCard();
  renderTourPanel();
}

function tourNext() { tourGoto(state.tourStop + 1); }
function tourPrev() { tourGoto(state.tourStop - 1); }

function renderTourPanel() {
  const tour = state.tour;
  const panel = document.getElementById('tour-panel');
  if (!tour || !panel) return;
  const i = state.tourStop, n = tour.stops.length;
  const stop = tour.stops[i];
  const emb  = state.emblems.find(e => e.number === stop.emblem) || {};
  const accent  = tour.accent || '#c8a040';
  const numeral = emb.roman_numeral || (emb.number === 0 ? '—' : emb.number);
  const discourse = (emb.discourse_summary || '').trim();

  let extra = '';
  if (stop.symbol) {
    const sym = (state.symbols || []).find(s => s.symbol_name === stop.symbol);
    if (sym) {
      const g = glyphFor(sym);
      const meta = [sym.metal, sym.planet, sym.gender].filter(Boolean).join(' · ');
      extra = `
        <div class="tp-symbol">
          ${g ? `<span class="tp-glyph" style="color:${accent}">${g}</span>` : ''}
          <div class="tp-sym-meta">
            <div class="tp-sym-name">${sym.symbol_name}</div>
            ${meta ? `<div class="tp-sym-row">${meta}</div>` : ''}
          </div>
        </div>
        ${sym.notes ? `<p class="tp-sym-notes">${sym.notes}</p>` : ''}`;
    }
  }

  let badge = '';
  if (stop.folio) {
    const scene = (stop.scene || '').replace(/_/g, ' ');
    badge = `<span class="tp-badge" style="color:${accent};border-color:${accent}">Hypnerotomachia · f.${stop.folio}${scene ? ' · ' + scene : ''}</span>`;
  } else if (stop.stage) {
    const c = STAGE_COLORS[stop.stage] || accent;
    badge = `<span class="tp-badge" style="color:${c};border-color:${c}">${stop.stage}${stop.stageTitle ? ' · ' + stop.stageTitle : ''}</span>`;
  } else if (!stop.symbol && emb.alchemical_stage) {
    const c = STAGE_COLORS[emb.alchemical_stage] || accent;
    badge = `<span class="tp-badge" style="color:${c};border-color:${c}">${emb.alchemical_stage}</span>`;
  }

  panel.innerHTML = `
    <div class="tp-head">
      <span class="tp-tour" style="color:${accent}">${tour.title}</span>
      <span class="tp-count">Stop ${i + 1} / ${n}</span>
    </div>
    <div class="tp-body">
      ${badge}
      <div class="tp-numeral" style="color:${accent}">${numeral}</div>
      <div class="tp-title">${emb.label || ''}</div>
      ${extra}
      <p class="tp-lede">${fmtProse(stop.lede)}</p>
      ${discourse ? `<div class="tp-rule"></div><div class="tp-scholar-label">From the scholarship</div><p class="tp-discourse">${discourse}</p>` : ''}
    </div>
    <div class="tp-nav">
      <button onclick="window.tourPrev()" ${i === 0 ? 'disabled' : ''}>&larr; Prev</button>
      <button class="tp-exit" onclick="window.exitTour()">&#9632; Tours</button>
      <button onclick="window.tourNext()" ${i === n - 1 ? 'disabled' : ''}>Next &rarr;</button>
    </div>`;
  panel.style.display = 'flex';
  panel.querySelector('.tp-body').scrollTop = 0;
  setActiveWorldBtn('btn-tours');
}

window.startTour = startTour;
window.tourNext  = tourNext;
window.tourPrev  = tourPrev;
window.exitTour  = () => { clearTour(); showToursMenu(); };

// ─── Navigation helpers ───────────────────────────────────────────────────────

function showcaseStep(dir) {
  const current = state.currentEmblem?.number;
  const idx = SHOWCASE.indexOf(current);
  const next = SHOWCASE[idx + dir];
  if (next !== undefined) launchEmblemScene(next);
}

window.showcasePrev = () => showcaseStep(-1);
window.showcaseNext = () => showcaseStep(1);

function setActiveWorldBtn(id) {
  document.querySelectorAll('#world-nav button').forEach(b => b.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

window.switchWorld = function (world) {
  state.world = world;
  if (world !== 'PLATES') hidePlatesOverlay();
  if (world !== 'TOURS')  { clearTour(); hideToursMenu(); }
  fadeSwitch(() => {
    if (world === 'PLATES')     showPlatesOverlay();
    else if (world === 'TOURS') showToursMenu();
    else if (world === 'AF')    buildGallery();
    else if (world === 'HP')    launchHPScene();
    else                        launchArchivesScene();
  });
};

window.backToGallery = function () { buildGallery(); };

// ─── HP World ─────────────────────────────────────────────────────────────────

async function launchHPScene() {
  if (state.activeScene) { state.activeScene.dispose(); state.activeScene = null; }
  state.inGallery = false;
  state.currentEmblem = null;
  setActiveWorldBtn('btn-hp');
  hideHUD();
  hideTextCard();

  const scene = new HPScene(renderer, composer);
  await scene.build();
  composer.passes[0] = new RenderPass(scene.scene, scene.camera);
  state.activeScene = scene;

  AlchemicalAudio.setStage('ALBEDO');
  state.currentAnnotations = findLinkedAnnotations(1); // Emblem I → folio 80
  scheduleAnnotation();

  const link = state.worldLinks?.find(l => l.hp_scene === 'fountain');
  showHPHUD('Fountain of Venus', link?.hp_folio ?? 80, link?.af_emblems ?? []);
  showHint('Drag to orbit the fountain · scroll to zoom · ← Atalanta to return');
}

// ─── Archives world ───────────────────────────────────────────────────────────

async function launchArchivesScene() {
  if (state.activeScene) { state.activeScene.dispose(); state.activeScene = null; }
  state.inGallery = false;
  state.currentEmblem = null;
  setActiveWorldBtn('btn-arch');
  hideHUD();

  const scene = new ArchivesScene(
    state.worldLinks,
    state.emblems,
    (folio) => fadeSwitch(() => launchHPScene()),    // HP node click
    (num)   => fadeSwitch(() => launchEmblemScene(num)), // AF node click
    renderer,
    composer,
  );
  await scene.build();
  composer.passes[0] = new RenderPass(scene.scene, scene.camera);
  state.activeScene = scene;

  hideTextCard();
  AlchemicalAudio.setStage('ALBEDO');
  showHint('Click any node to navigate · HP folios left · AF emblems right');
}

// ─── Fade transition ──────────────────────────────────────────────────────────

function fadeSwitch(callback) {
  const overlay = document.getElementById('fade-overlay');
  if (!overlay) { callback(); return; }
  overlay.style.opacity = '1';
  overlay.style.pointerEvents = 'all';
  setTimeout(async () => {
    await callback();
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
  }, 320);
}

// ─── HP HUD ───────────────────────────────────────────────────────────────────

function showHPHUD(sceneName, folio, linkedEmblems = []) {
  const stageEl = document.getElementById('hud-stage');
  stageEl.textContent   = 'HYPNEROTOMACHIA';
  stageEl.style.color   = '#c8a440';
  stageEl.style.borderColor = '#c8a440';

  document.getElementById('hud-title').textContent = sceneName;
  document.getElementById('hud-motto').textContent =
    linkedEmblems.length ? `Folio ${folio} · linked to AF Emblem${linkedEmblems.length > 1 ? 's' : ''} ${linkedEmblems.join(', ')}` : `Folio ${folio}`;

  const navEl = document.getElementById('emblem-nav');
  if (navEl) navEl.style.display = 'none';

  document.getElementById('back-btn').style.display  = 'inline-block';
  document.getElementById('back-btn').textContent     = '← Atalanta';
  document.getElementById('back-btn').onclick         = () => fadeSwitch(() => buildGallery());
  document.getElementById('emblem-hud').style.display = 'block';
}

// ─── Key hint toast ───────────────────────────────────────────────────────────

function showHint(text) {
  const el = document.getElementById('key-hint');
  if (!el) return;
  el.textContent = text;
  el.style.opacity = '1';
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.style.opacity = '0'; }, 5000);
}

// ─── Annotations ──────────────────────────────────────────────────────────────

function findLinkedAnnotations(emblemNumber) {
  if (!state.worldLinks || !state.annotations) return [];
  const link = state.worldLinks.find(
    l => Array.isArray(l.af_emblems) && l.af_emblems.includes(emblemNumber)
  );
  if (!link) return [];

  // Prefer real BL marginal annotations from the DB
  const folioAnns = state.annotations[String(link.hp_folio)];
  const real = Array.isArray(folioAnns)
    ? folioAnns.filter(a => a.text && a.text.trim().length > 4)
    : [];
  if (real.length) return real;

  // Fall back to editorial cross-reference commentary
  if (link.commentary) {
    return [{ text: link.commentary, folio: link.hp_folio, annotation_type: 'EDITORIAL' }];
  }
  return [];
}

function showAnnotation() {
  const anns = state.currentAnnotations;
  if (!anns.length) return;
  const ann = anns[Math.floor(Math.random() * anns.length)];
  document.getElementById('annotation-text').textContent = ann.text;
  document.getElementById('annotation-source').textContent =
    `BL marginalia · f.${ann.folio} · ${ann.annotation_type || ''}`;
  document.getElementById('annotation-panel').style.display = 'block';
}

function scheduleAnnotation() {
  if (state.annotationTimer) clearTimeout(state.annotationTimer);
  document.getElementById('annotation-panel').style.display = 'none';
  state.annotationTimer = setTimeout(() => {
    if (!state.inGallery && state.currentAnnotations.length) showAnnotation();
  }, 6000);
}

function showMessage(title, msg) {
  if (state.activeScene) { state.activeScene.dispose(); state.activeScene = null; }
  state.inGallery = false;
  hideHUD();

  const scene  = new THREE.Scene();
  scene.background = new THREE.Color(0x050402);
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 5;
  composer.passes[0] = new RenderPass(scene, camera);

  // Minimal placeholder text via DOM
  const el = document.getElementById('center-message');
  if (el) {
    el.innerHTML = `<h2>${title}</h2><p>${msg.replace('\n','<br>')}</p>`;
    el.style.display = 'flex';
  }

  state.activeScene = {
    scene, camera,
    update: () => {},
    dispose: () => { if (el) el.style.display = 'none'; },
  };
}

// ─── Keyboard navigation ──────────────────────────────────────────────────────

window.addEventListener('keydown', (e) => {
  // A running tour captures the arrow keys for stop-to-stop navigation
  if (state.tour) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown')   { e.preventDefault(); tourNext(); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); tourPrev(); }
    else if (e.key === 'Escape')                            window.exitTour();
    else if (e.key === 'g' || e.key === 'G')                window.switchWorld('AF');
    return;
  }
  // Tours menu (no tour running yet)
  const toursMenuOpen = document.getElementById('tours-menu')?.style.display === 'flex';
  if (toursMenuOpen) {
    if (e.key === 'Escape' || e.key === 'g' || e.key === 'G') window.switchWorld('AF');
    return;
  }

  // Plates atlas captures keys while open
  const platesOpen = document.getElementById('plates-overlay')?.style.display === 'block';
  if (platesOpen) {
    const lbOpen = document.getElementById('plate-lightbox')?.style.display === 'flex';
    if (lbOpen) {
      if (e.key === 'ArrowRight') { e.preventDefault(); plateStep(1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); plateStep(-1); }
      if (e.key === 'Escape')     closePlate();
    } else if (e.key === 'Escape' || e.key === 'g' || e.key === 'G') {
      window.switchWorld('AF');
    }
    return;
  }

  if (!state.inGallery) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp')    showcaseStep(1);
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowDown')  showcaseStep(-1);
    if (e.key === 'a' || e.key === 'A') showAnnotation();
  }
  if (e.key === 'Escape' || e.key === 'g' || e.key === 'G') buildGallery();
});

// ─── Resize ───────────────────────────────────────────────────────────────────

window.addEventListener('resize', resizeAll);

// ResizeObserver catches iframe resize events that don't fire 'resize' on window
if (typeof ResizeObserver !== 'undefined') {
  new ResizeObserver(resizeAll).observe(document.documentElement);
}

// ─── Render loop ──────────────────────────────────────────────────────────────

let _lastW = 0;
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  // Auto-resize when iframe finally has dimensions (first real frame)
  const { w } = getViewport();
  if (w !== _lastW) { _lastW = w; resizeAll(); }

  if (state.activeScene) {
    state.activeScene.update(dt);
    if (composer.passes[0]) {
      composer.passes[0].scene  = state.activeScene.scene;
      composer.passes[0].camera = state.activeScene.camera;
    }
  }

  composer.render();
}

// ─── Audio unlock (browser requires a user gesture before AudioContext) ───────

const _unlockAudio = async () => {
  if (AlchemicalAudio.isUnlocked) return;
  await AlchemicalAudio.unlock();
  const stage = state.currentEmblem?.alchemical_stage
    || (state.world === 'HP' ? 'ALBEDO' : null);
  if (stage) AlchemicalAudio.setStage(stage);
  document.removeEventListener('click',   _unlockAudio);
  document.removeEventListener('keydown', _unlockAudio);
};
document.addEventListener('click',   _unlockAudio);
document.addEventListener('keydown', _unlockAudio);

// ─── Init ─────────────────────────────────────────────────────────────────────

(async () => {
  try {
    resizeAll(); // safe here — composer + bloom are defined
    await loadData();
    setProgress(80, 'Opening the world…');

    // Deep-link from the URL hash: games link in via #emblem=N, and a tour can
    // be opened via #tour=scholarship|symbolism|great-work. Default: Emblem V.
    const hash      = location.hash || '';
    const embMatch  = hash.match(/emblem=(\d+)/);
    const tourMatch = hash.match(/tour=([\w-]+)/);
    if (tourMatch && state.tours && state.tours[tourMatch[1]]) {
      await startTour(tourMatch[1]);
    } else if (embMatch && state.emblems.some(e => e.number === +embMatch[1])) {
      await launchEmblemScene(+embMatch[1]);
    } else {
      await launchEmblemScene(5); // first showcase emblem (Woman & Toad)
    }
    setProgress(100, 'Ready');

    setTimeout(() => {
      const l = document.getElementById('loading');
      l.style.transition = 'opacity 0.8s';
      l.style.opacity = '0';
      setTimeout(() => { l.style.display = 'none'; }, 800);
    }, 300);

    animate();
  } catch (err) {
    console.error('Init failed:', err);
    document.getElementById('loading-sub').textContent = 'Error: ' + err.message;
  }
})();
