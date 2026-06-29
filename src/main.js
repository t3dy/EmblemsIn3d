import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { EmblemScene } from './scenes/EmblemScene.js?v=3';
import { HPScene } from './scenes/HPScene.js?v=5';
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
  const V = '6'; // bump when data files are re-exported
  const [er, sr, ar, wr] = await Promise.all([
    fetch(`./data/emblems.json?v=${V}`),
    fetch(`./data/hp_symbols.json?v=${V}`),
    fetch(`./data/hp_annotations.json?v=${V}`),
    fetch(`./data/world_links.json?v=${V}`),
  ]);
  state.emblems     = await er.json();
  state.symbols     = await sr.json();
  state.annotations = await ar.json();
  state.worldLinks  = await wr.json();
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

  const scene = new EmblemScene(emblemData, renderer, composer);
  await scene.build();

  // Wire composer to this scene
  composer.passes[0] = new RenderPass(scene.scene, scene.camera);

  state.activeScene = scene;
  updateHUD(emblemData);
  setActiveWorldBtn('btn-af');

  // Stage audio
  AlchemicalAudio.setStage(emblemData.alchemical_stage || 'NIGREDO');

  // Linked HP annotations (auto-surface after 6s, or press A)
  state.currentAnnotations = findLinkedAnnotations(emblemData.number);
  scheduleAnnotation();
  showFirstVisitHint();
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

function buildGallery() {
  if (state.activeScene) {
    state.activeScene.dispose();
    state.activeScene = null;
  }

  state.inGallery = true;
  hideHUD();
  setActiveWorldBtn('btn-af');

  const scene  = new THREE.Scene();
  scene.background = new THREE.Color(0x060402);
  scene.fog = new THREE.FogExp2(0x060402, 0.04);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 8, 22);
  camera.lookAt(0, 0, 0);

  const ambLight = new THREE.AmbientLight(0x180e06, 1.0);
  scene.add(ambLight);

  const COLS    = 10;
  const SPACING = 3.8;
  const SHOWCASE_SET = new Set(SHOWCASE);

  const STAGE_HEX = {
    NIGREDO: 0x2a0800, ALBEDO: 0x0a1520, CITRINITAS: 0x1a1200, RUBEDO: 0x200000,
  };
  const SHOWCASE_HEX = {
    NIGREDO: 0x5a1a00, ALBEDO: 0x1a3545, CITRINITAS: 0x3a2a00, RUBEDO: 0x4a0808,
  };
  const STAGE_EMISSIVE = {
    NIGREDO: 0x4a1200, ALBEDO: 0x2a5068, CITRINITAS: 0x6a4a00, RUBEDO: 0x8a1400,
  };

  const cards = [];

  state.emblems.forEach((emb, idx) => {
    const col = idx % COLS;
    const row = Math.floor(idx / COLS);
    const x   = (col - (COLS - 1) / 2) * SPACING;
    const y   = -(row - 2) * SPACING;

    const isShowcase = SHOWCASE_SET.has(emb.number);
    const stage = emb.alchemical_stage || 'NIGREDO';

    const sz  = isShowcase ? 3.0 : 2.2;
    const geo = new THREE.BoxGeometry(sz, sz, 0.08);
    const mat = new THREE.MeshStandardMaterial({
      color: isShowcase ? SHOWCASE_HEX[stage] : STAGE_HEX[stage],
      emissive: isShowcase ? STAGE_EMISSIVE[stage] : 0x000000,
      emissiveIntensity: isShowcase ? 0.4 : 0.0,
      roughness: 0.7, metalness: 0.2,
    });
    const card = new THREE.Mesh(geo, mat);
    card.position.set(x, y, 0);
    card.userData = { emblemNumber: emb.number, label: emb.label, isShowcase };
    scene.add(card);
    cards.push({ card, geo, mat, isShowcase });

    // Gold border for showcase emblems
    if (isShowcase) {
      const edgesG = new THREE.EdgesGeometry(geo);
      const edgesMat = new THREE.LineBasicMaterial({ color: 0xc8a040 });
      const border = new THREE.LineSegments(edgesG, edgesMat);
      border.position.copy(card.position);
      scene.add(border);
    }
  });

  // Add a point light per stage cluster
  [
    { pos: [-18, 4, 2], color: 0xff3300, intensity: 3 },  // NIGREDO cluster
    { pos: [-5,  4, 2], color: 0xaaccff, intensity: 2 },  // ALBEDO
    { pos: [ 8,  4, 2], color: 0xffcc00, intensity: 3 },  // CITRINITAS
    { pos: [20,  4, 2], color: 0xff6600, intensity: 4 },  // RUBEDO
  ].forEach(({ pos, color, intensity }) => {
    const l = new THREE.PointLight(color, intensity, 18);
    l.position.set(...pos);
    scene.add(l);
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
    camera.position.z = Math.max(8, Math.min(45, camera.position.z + e.deltaY * 0.02));
    camera.position.y = Math.max(0, Math.min(20, camera.position.y + e.deltaY * 0.01));
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
    cards.forEach(({ geo, mat }) => { geo.dispose(); mat.dispose(); });
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
      // Pulse showcase card emissive
      cards.forEach(({ card, mat, isShowcase }) => {
        if (isShowcase) {
          mat.emissiveIntensity = 0.3 + Math.sin(galleryT * 1.5 + card.position.x) * 0.15;
        }
      });
    },
    dispose: cleanup,
  };
}

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
  fadeSwitch(() => {
    if (world === 'AF')        buildGallery();
    else if (world === 'HP')   launchHPScene();
    else                       launchArchivesScene();
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

  const scene = new HPScene(renderer, composer);
  await scene.build();
  composer.passes[0] = new RenderPass(scene.scene, scene.camera);
  state.activeScene = scene;

  AlchemicalAudio.setStage('ALBEDO');
  state.currentAnnotations = findLinkedAnnotations(1); // Emblem I → folio 80
  scheduleAnnotation();

  const link = state.worldLinks?.find(l => l.hp_scene === 'fountain');
  showHPHUD('Fountain of Venus', link?.hp_folio ?? 80, link?.af_emblems ?? []);
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

let _hintShown = false;
function showHint(text) {
  const el = document.getElementById('key-hint');
  if (!el) return;
  el.textContent = text;
  el.style.opacity = '1';
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.style.opacity = '0'; }, 4500);
}

function showFirstVisitHint() {
  if (_hintShown) return;
  _hintShown = true;
  showHint('← →  emblems  ·  A  context  ·  G  gallery');
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
    setProgress(80, 'Opening Emblem V…');

    // Start directly on the first showcase emblem (Woman & Toad)
    await launchEmblemScene(5);
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
