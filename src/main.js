import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { HPWorldScene, HP_STATIONS } from './scenes/HPWorldScene.js?v=94';
import { DreamMode } from './systems/DreamMode.js?v=7';
import { DREAM_STOPS } from './data/hp_dream.js?v=3';
import { DREAM_REACTIONS } from './data/hp_reactions.js?v=1';
import { AlchemicalAudio } from './systems/AlchemicalAudio.js?v=8';
import { ASSETS, variantOf, setVariant, resetVariants, isPending } from './systems/AssetVariants.js?v=7';

// ─── Constants ────────────────────────────────────────────────────────────────




// Shared texture loader for the 3D gallery wall.
const textureLoader = new THREE.TextureLoader();

// ─── State ────────────────────────────────────────────────────────────────────

const state = {
  world: 'HP',
  activeScene: null,
  inGallery: false,
  annotationTimer: null,
  tours: null,
  tour: null,
  tourStop: 0,
  gallery: null,
  diorama: null,
  hpStyle: 'lit',   // 'lit' | 'woodcut' — rendering of the HP dream garden
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
  setProgress(10, 'Loading the dream…');
  const V = '22'; // bump when data files are re-exported
  state.tours   = await fetch(`./data/tours.json?v=${V}`).then(r => r.json());
  state.gallery     = await fetch(`./data/gallery.json?v=${V}`).then(r => r.json()).catch(() => []);
  setProgress(50, 'Preparing the world…');
}

// ─── HUD ──────────────────────────────────────────────────────────────────────



// ─── Generic emblem text card ─────────────────────────────────────────────────



// ─── Emblem Scene ─────────────────────────────────────────────────────────────


// ─── Gallery ──────────────────────────────────────────────────────────────────


// ─── Plates atlas (2-D image-card tab + lightbox) ─────────────────────────────









// ─── Gallery — Renaissance exemplars beside the 1499 woodcuts ──────────────────

let _galOverlayBuilt = false;

function buildGalleryOverlay() {
  if (_galOverlayBuilt) return;
  const body = document.getElementById('gallery-body');
  const items = state.gallery || [];
  if (!body || !items.length) return;
  // group by category, preserving first-seen order
  const cats = [];
  const byCat = new Map();
  items.forEach((it, i) => {
    if (!byCat.has(it.category)) { byCat.set(it.category, []); cats.push(it.category); }
    byCat.get(it.category).push(i);
  });
  body.innerHTML = cats.map(cat => {
    const cards = byCat.get(cat).map(i => {
      const it = items[i];
      return `<button class="gal-card" onclick="window.openGalleryImg(${i})" title="${it.title}">
        <img loading="lazy" src="../images/${it.file}" alt="${it.title}">
        <div class="gal-cap"><div class="t">${it.title}</div>
          <div class="a">${it.artist}${it.date ? ' · ' + it.date : ''}</div></div>
      </button>`;
    }).join('');
    return `<div class="gal-cat">${cat}</div><div class="gal-grid">${cards}</div>`;
  }).join('');
  _galOverlayBuilt = true;
}

function showGalleryOverlay() {
  buildGalleryOverlay();
  setActiveWorldBtn('btn-gallery');
  state.inGallery = false;
  const el = document.getElementById('gallery-overlay');
  if (el) { el.style.display = 'block'; el.scrollTop = 0; }
  showHint('A gallery of the sources · click any plate to read its provenance · Esc to close');
}

function hideGalleryOverlay() {
  const el = document.getElementById('gallery-overlay');
  if (el) el.style.display = 'none';
  closeGalleryImg();
}

function openGalleryImg(i) {
  const it = (state.gallery || [])[i];
  if (!it) return;
  state._galIdx = i;
  const img = document.getElementById('glb-img');
  img.src = '../images/' + it.file;
  img.alt = it.title;
  document.getElementById('glb-text').innerHTML = `
    <div class="glb-cat">${it.category}</div>
    <div class="glb-title">${it.title}</div>
    <div class="glb-artist">${it.artist}</div>
    ${it.date ? `<div class="glb-date">${it.date}</div>` : ''}
    <p class="glb-cap">${it.caption || ''}</p>
    ${it.source ? `<div class="glb-src">Public domain · <a href="${it.source}" target="_blank" rel="noopener">Wikimedia Commons ↗</a></div>` : ''}`;
  document.getElementById('gallery-lightbox').style.display = 'flex';
}

function closeGalleryImg() {
  const el = document.getElementById('gallery-lightbox');
  if (el) el.style.display = 'none';
}

function galleryStep(dir) {
  const n = (state.gallery || []).length;
  if (!n) return;
  openGalleryImg(((state._galIdx ?? 0) + dir + n) % n);
}

window.openGalleryImg  = openGalleryImg;
window.closeGalleryImg = closeGalleryImg;

// ─── Guided tours (connect the 3-D models to the research) ────────────────────

// Light inline formatting for tour ledes: **bold** and *italic*
function fmtProse(s) {
  return (s || '')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
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
  document.body.classList.remove('tour-open');   // let the world-nav slide back right
}

// A tour's stops, verbatim from tours.json. (This used to also synthesise the
// cross-book tour from world_links; that tour went with the Atalanta side.)
function resolveTourStops(tour) {
  return tour.stops || [];
}

async function startTour(id) {
  const tour = state.tours && state.tours[id];
  if (!tour) return;
  hideToursMenu();
  state.tour = { ...tour, stops: resolveTourStops(tour) };
  state.tourStop = 0;
  // let the reader choose their commentary before the tour begins
  if (tourFlavorSet(state.tour).length > 1) {
    showFlavorChooser({ title: state.tour.title,
      kicker: `${state.tour.title} · a tour in ${state.tour.stops.length} stops`, begin: 'Begin the tour',
      onDone: () => tourGoto(0) });
    return;
  }
  await tourGoto(0);
}

// Show/hide that survives a stale cached stylesheet.
// The CSS fix for this (`[hidden] { display: none !important }`) lives inside
// src/index.html, which is NOT cache-busted — only main.js and the modules are.
// So a returning visitor can get new JS with old CSS, and an overlay whose rule
// says `display: flex` would sit over the whole app again. Writing the inline
// style too means the element obeys us regardless of which CSS is in the cache.
function setHidden(el, hidden, shown = 'flex') {
  if (!el) return;
  el.hidden = hidden;
  el.style.display = hidden ? 'none' : shown;
}

// Belt and braces: whatever the cached CSS says, nothing that ships hidden may
// be covering the page at startup.
for (const id of ['tour-flavor-chooser', 'tc-wonder-menu']) {
  const el = document.getElementById(id);
  if (el && el.hasAttribute('hidden')) el.style.display = 'none';
}

// Pre-tour: choose how much commentary to read (toggleable again mid-tour).
// `onDone` runs once the reader has picked their lenses — the tour starts at
// stop 0, the free walk simply begins, the dream begins. Ted asked for the same
// question in all three modes, not only the tour.
function showFlavorChooser(opts = {}) {
  const { title = state.tour && state.tour.title, kicker = null, begin = 'Begin',
          onDone = () => tourGoto(0) } = opts;
  _fcDone = onDone;
  const el = document.getElementById('tour-flavor-chooser');
  if (!el) { onDone(); return; }
  const rows = flavorSetAll().map(t => {
    const nt = NOTE_TYPES[t];
    return `<label class="fc-row"><input type="checkbox" data-flavor="${t}" ${flavorOn(t) ? 'checked' : ''}>
      <span class="fc-swatch" style="background:${nt.color}"></span>
      <span class="fc-label">${nt.label}</span></label>`;
  }).join('');
  el.innerHTML = `
    <div class="fc-card">
      <div class="fc-kicker">${kicker || title || 'The Dream Garden'}</div>
      <h2>How much do you want to read?</h2>
      <p class="fc-intro">Each wonder can carry several flavours of commentary. Turn on the ones you want — the story and the woodcuts are always there — and change your mind at any time from the <em>Commentary lenses</em> panel.</p>
      <div class="fc-rows">${rows}</div>
      <div class="fc-quick">
        <button onclick="window.fcSet(true)">Check all</button>
        <button onclick="window.fcSet(false)">Just the story</button>
      </div>
      <button class="fc-begin" onclick="window.fcBegin()">${begin} &rarr;</button>
    </div>`;
  setHidden(el, false);
}
window.fcSet = (all) => {
  document.querySelectorAll('#tour-flavor-chooser input[data-flavor]').forEach(cb => { cb.checked = all; });
};
window.fcBegin = () => {
  const on = new Set();
  document.querySelectorAll('#tour-flavor-chooser input[data-flavor]:checked')
    .forEach(cb => on.add(cb.dataset.flavor));
  _flavorsOn = on;
  try { localStorage.setItem('hp_flavors', JSON.stringify([...on])); } catch (_) {}
  const el = document.getElementById('tour-flavor-chooser');
  if (el) setHidden(el, true);
  const done = _fcDone || (() => tourGoto(0));
  _fcDone = null;
  done();
};

// Every flavour we know about, for the chooser in modes that are not a tour.
function flavorSetAll() { return Object.keys(NOTE_TYPES); }
let _fcDone = null;

async function tourGoto(i) {
  const tour = state.tour;
  if (!tour) return;
  closeTourWoodcut();
  const n = tour.stops.length;
  state.tourStop = Math.max(0, Math.min(n - 1, i));
  const stop = tour.stops[state.tourStop];

  if (tour.world === 'HP' || stop.station) {
    // A narrative tour through the Dream Garden: glide to the wonder, then hand
    // the camera back to the player, who can drag to look around before moving
    // on. Re-use the running world across stops instead of rebuilding it.
    if (state.activeScene instanceof HPWorldScene) {
      state.activeScene.teleport(stop.station);
    } else {
      await launchHPWorld({ station: stop.station, chooser: false });
      showHint('Drag to look around · W A S D to walk · ← → move between stops');
    }
    // The tour rail carries all the text, so silence the world's own station
    // HUD and the auto-surfacing marginalia while a tour is running.
    if (state.activeScene) state.activeScene.onStation = null;
    setActiveWorldBtn('btn-tours');
  }
  renderTourPanel();
}

function tourNext() { tourGoto(state.tourStop + 1); }
function tourPrev() { tourGoto(state.tourStop - 1); }

// The commentary layer: each node of the novel tour carries typed notes, in the
// voices of a narrative designer, a scholarly gloss-master, and a literary
// explainer. The type sets a colour-coded border and a label. One registry so
// the data files only ever store a type key.
const NOTE_TYPES = {
  quotation:   { label: 'From the book',           color: '#d8a24a' },
  context:     { label: 'Renaissance context',     color: '#c98a4a' },
  architecture:{ label: 'Architectural theory',    color: '#7fa8c0' },
  neoplatonic: { label: 'Neoplatonic aesthetics',  color: '#b48ad0' },
  myth:        { label: 'Mythological allusion',   color: '#cf8f5c' },
  allegory:    { label: 'Allegory & symbolism',    color: '#6aa886' },
  literary:    { label: 'Literary art',            color: '#c87f92' },
  gloss:       { label: 'A difficult word',        color: '#9a9ab0' },
  alchemical:  { label: 'Alchemical reading',      color: '#4fae9e' },
};

// The commentary lenses: each colour-coded flavour can be toggled on/off, and the
// choice is sticky. `null` means "all on" (the default); once the reader touches a
// chip we track an explicit enabled set.
let _flavorsOn = (() => {
  try { const s = localStorage.getItem('hp_flavors'); if (s) return new Set(JSON.parse(s)); } catch (_) {}
  return null;
})();
function flavorOn(type) { return !_flavorsOn || _flavorsOn.has(type); }
window.toggleFlavor = (type) => {
  if (!_flavorsOn) _flavorsOn = new Set(Object.keys(NOTE_TYPES));  // start from all-on
  if (_flavorsOn.has(type)) _flavorsOn.delete(type); else _flavorsOn.add(type);
  try { localStorage.setItem('hp_flavors', JSON.stringify([..._flavorsOn])); } catch (_) {}
  renderTourPanel();
  renderWalkNotes();
};

// The flavours that actually appear in a tour (so empty categories never show).
function tourFlavorSet(tour) {
  const present = new Set();
  for (const s of (tour.stops || [])) {
    if (s.quote) present.add('quotation');
    for (const nt of (s.notes || [])) present.add(nt.type);
  }
  return Object.keys(NOTE_TYPES).filter(t => present.has(t));
}

// The commentary control. This has to read as a control, not decoration: a
// named panel, an explicit instruction, a live count, All/None, and a tick or
// empty box on every chip so on/off never depends on noticing a colour.
function renderFlavorBar(tour) {
  const order = tourFlavorSet(tour);
  if (order.length < 2) return '';
  const onCount = order.filter(flavorOn).length;
  const chips = order.map(t => {
    const nt = NOTE_TYPES[t], on = flavorOn(t);
    return `<button class="tp-flavor${on ? ' on' : ''}"
      onclick="window.toggleFlavor('${t}')"
      aria-pressed="${on}"
      title="${on ? 'Hide' : 'Show'} &quot;${nt.label}&quot; notes"
      style="${on ? `color:${nt.color};border-color:${nt.color}` : ''}"
      ><span class="tp-flavor-box" style="${on ? `background:${nt.color};border-color:${nt.color}` : ''}"
        >${on ? '&#10003;' : ''}</span>${nt.label}</button>`;
  }).join('');
  return `<div class="tp-lenses">
    <div class="tp-lenses-head">
      <span class="tp-lenses-title">Commentary lenses</span>
      <span class="tp-lenses-count">${onCount} of ${order.length} on</span>
    </div>
    <div class="tp-lenses-help">Tap any lens to show or hide that kind of note.</div>
    <div class="tp-flavor-bar">${chips}</div>
    <div class="tp-lenses-quick">
      <button onclick="window.setAllFlavors(true)">Show all</button>
      <button onclick="window.setAllFlavors(false)">Just the story</button>
    </div>
  </div>`;
}

// All on / all off from inside the tour, mirroring the pre-tour chooser.
window.setAllFlavors = (all) => {
  _flavorsOn = all ? new Set(Object.keys(NOTE_TYPES)) : new Set();
  try { localStorage.setItem('hp_flavors', JSON.stringify([..._flavorsOn])); } catch (_) {}
  renderTourPanel();
  renderWalkNotes();
};

function renderNotes(notes) {
  if (!Array.isArray(notes) || !notes.length) return '';
  const cards = notes.filter(nt => flavorOn(nt.type)).map(nt => {
    const t = NOTE_TYPES[nt.type] || { label: nt.type || 'Note', color: '#8a7a5a' };
    return `<div class="tp-note" style="border-color:${t.color}">
      <div class="tp-note-label" style="color:${t.color}">${t.label}</div>
      <p class="tp-note-text">${fmtProse(nt.text)}</p></div>`;
  }).join('');
  if (!cards) return '';
  return `<div class="tp-scholar-label" style="margin-top:.4rem">Commentary</div>
    <div class="tp-notes">${cards}</div>`;
}

function renderTourPanel() {
  const tour = state.tour;
  const panel = document.getElementById('tour-panel');
  if (!tour || !panel) return;
  const i = state.tourStop, n = tour.stops.length;
  const stop = tour.stops[i];
  const accent  = tour.accent || '#c8a040';

  // Narrative (Dream Garden) stops render their own way: a wonder of the world,
  // the chapter it belongs to, and a link into the parallel-text edition.
  if (stop.station) {
    const st = HP_STATIONS.find(s => s.key === stop.station) || {};
    const ours = stop.half === 'ours';
    const badgeCol = ours ? accent : '#8ab0d8';
    const source = ours ? 'our new translation' : "Dallington's 1592 English";
    // translated chapters deep-link to their parallel text; Dallington chapters
    // point at the whole-book synopsis (its first half is his English)
    // "XXX–XXXI" -> ch-xxx ; "Epitaphium Poliae" -> ch-epitaphium-poliae
    const slug = 'ch-' + String(stop.chapter || '').split(/[–-]/)[0]
      .trim().toLowerCase().replace(/\s+/g, '-');
    // roman-numeral chapters read "Chapter XIX"; the closing matter (the
    // epitaph, the errata leaf) is not a chapter and is named on its own
    const chLabel = /^[IVXLC]+([–-][IVXLC]+)?$/.test(String(stop.chapter || '').trim())
      ? 'Chapter ' + stop.chapter : stop.chapter;
    const href = ours ? `../research/translation.html#${slug}`
                      : '../research/translation.html#synopsis';
    const linkLabel = ours ? 'Read this chapter in the parallel edition &rarr;'
                           : 'See it in the whole-book synopsis &rarr;';
    // the 1499 woodcut(s) for this moment — per-stop, else the station's set
    const wcs = stop.wc || (tour.woodcuts && tour.woodcuts[stop.station]) || [];
    state._tourWoodcuts = wcs;
    const wcBtn = wcs.length
      ? `<button class="tp-woodcut-btn" onclick="window.openTourWoodcut(0)">&#9635; ${wcs.length > 1 ? 'See the ' + wcs.length + ' woodcuts' : 'See the 1499 woodcut'}</button>`
      : '';
    panel.innerHTML = `
      <div class="tp-head">
        <span class="tp-tour" style="color:${accent}">${tour.title}</span>
        <span class="tp-count">Stop ${i + 1} / ${n}</span>
      </div>
      <div class="tp-body">
        <span class="tp-badge" style="color:${badgeCol};border-color:${badgeCol}">${chLabel} · ${source}</span>
        <div class="tp-title" style="color:${accent};font-size:1.15rem;margin-top:.5rem">${stop.title || st.name || ''}</div>
        ${st.folio ? `<div class="tp-scholar-label">Facsimile folio ${st.folio}</div>` : ''}
        <p class="tp-lede">${fmtProse(stop.lede)}</p>
        ${renderFlavorBar(tour)}
        ${stop.quote && flavorOn('quotation') ? `<blockquote class="tp-quote" style="border-color:${NOTE_TYPES.quotation.color}">${fmtProse(stop.quote)}${stop.quoteAttr ? `<cite>${fmtProse(stop.quoteAttr)}</cite>` : ''}</blockquote>` : ''}
        ${renderNotes(stop.notes)}
        <div class="tp-rule"></div>
        ${wcBtn}
        <a class="tp-editionlink" href="${href}" target="_blank" rel="noopener" style="color:${accent}">${linkLabel}</a>
      </div>
      <div class="tp-nav">
        <button onclick="window.tourPrev()" ${i === 0 ? 'disabled' : ''}>&larr; Prev</button>
        <button class="tp-exit" onclick="window.exitTour()">&#9632; Tours</button>
        <button onclick="window.tourNext()" ${i === n - 1 ? 'disabled' : ''}>Next &rarr;</button>
      </div>`;
    panel.style.display = 'flex';
    document.body.classList.add('tour-open');
    panel.querySelector('.tp-body').scrollTop = 0;
    setActiveWorldBtn('btn-tours');
    return;
  }

}

// ── Commentary as you walk ────────────────────────────────────────────────
// In free walk there are no stops to click through, so the notes have to come
// to the reader: approaching a wonder raises its commentary, filtered by the
// same lenses the tour uses, and leaving it lowers them again. The text is the
// novel tour's own per-station writing, so there is one body of commentary.
let _walkStation = null;

function walkStopFor(stationKey) {
  const tour = state.tours && state.tours.novel;
  if (!tour || !Array.isArray(tour.stops)) return null;
  return tour.stops.find(st => st.station === stationKey) || null;
}

function showWalkNotes(st) {
  const el = document.getElementById('walk-notes');
  if (!el || !st) return;
  const stop = walkStopFor(st.key);
  if (!stop) { hideWalkNotes(); return; }
  _walkStation = st;
  renderWalkNotes();
}

function renderWalkNotes() {
  const el = document.getElementById('walk-notes');
  const st = _walkStation;
  if (!el || !st) return;
  const stop = walkStopFor(st.key);
  if (!stop) return;
  const notes = (stop.notes || []).filter(n => flavorOn(n.type));
  const quote = stop.quote && flavorOn('quotation') ? stop.quote : null;
  const body = (notes.length || quote)
    ? `${quote ? `<blockquote class="wn-quote">${fmtProse(quote)}</blockquote>` : ''}
       ${notes.map(n => {
         const t = NOTE_TYPES[n.type] || { label: n.type, color: '#8a7a5a' };
         return `<div class="wn-note" style="border-color:${t.color}">
           <div class="wn-label" style="color:${t.color}">${t.label}</div>
           <p>${fmtProse(n.text)}</p></div>`;
       }).join('')}`
    : `<p class="wn-empty">All commentary lenses are off. Turn some on to read the scholarship here.</p>`;
  el.innerHTML = `
    <div class="wn-head">
      <span class="wn-title">${stop.title || st.name}</span>
      <button class="wn-close" onclick="window.hideWalkNotes()" title="Dismiss">&#10005;</button>
    </div>
    <div class="wn-body">
      <p class="wn-lede">${fmtProse(stop.lede)}</p>
      ${body}
    </div>
    <div class="wn-foot">
      <button onclick="window.walkLenses()">Commentary lenses &hellip;</button>
    </div>`;
  setHidden(el, false, 'flex');
  el.querySelector('.wn-body').scrollTop = 0;
}

function hideWalkNotes() {
  _walkStation = null;
  setHidden(document.getElementById('walk-notes'), true);
}
window.hideWalkNotes = hideWalkNotes;

// Re-open the chooser mid-walk so lenses can be changed without leaving.
window.walkLenses = () => showFlavorChooser({
  kicker: 'Walking the Dream Garden freely', begin: 'Back to the garden',
  onDone: () => renderWalkNotes(),
});


// ── Graphics menu ─────────────────────────────────────────────────────────
// Ted asked for "drop down menus in a graphics menu that's accessible from all
// the modes free walk/tour/game". Each asset in the AssetVariants registry gets
// one <select>; changing any of them rebuilds the world so the swap is visible
// immediately. Variants that are declared but not yet built show as "(not yet
// built)" and are disabled, so the intended ladder for each asset is legible
// without pretending the work is done. See DECISIONS.md, 2026-09-05.
function renderGraphicsMenu() {
  const el = document.getElementById('gfx-menu');
  if (!el) return;
  const rows = Object.entries(ASSETS).map(([key, spec]) => {
    const cur = variantOf(key, state.hpStyle);
    const opts = spec.variants.map(v => {
      const pend = !!v.pending;
      return `<option value="${v.id}" ${v.id === cur ? 'selected' : ''} ${pend ? 'disabled' : ''}
        >${v.label}${pend ? ' — not yet built' : ''}</option>`;
    }).join('');
    const note = (spec.variants.find(v => v.id === cur) || {}).note || '';
    return `<div class="gx-row">
      <label class="gx-label" for="gx-${key}">${spec.label}</label>
      <select class="gx-select" id="gx-${key}" onchange="window.gfxPick('${key}', this.value)">${opts}</select>
      <p class="gx-note">${note}</p>
    </div>`;
  }).join('');
  el.innerHTML = `
    <div class="gx-card">
      <div class="gx-head">
        <div>
          <div class="gx-kicker">Graphics</div>
          <h2>How should the world be drawn?</h2>
        </div>
        <button class="gx-close" onclick="window.closeGraphics()" title="Close">&#10005;</button>
      </div>
      <p class="gx-intro">Every asset can be built more than one way. Choose a version for each —
        your choice is remembered, and the older versions are never thrown away, so the world can
        keep improving without losing an earlier look. Woodcut view always uses the primitive
        silhouette unless you choose otherwise.</p>
      <div class="gx-rows">${rows}</div>
      <div class="gx-foot">
        <button onclick="window.gfxReset()">Reset to defaults</button>
        <button class="gx-done" onclick="window.closeGraphics()">Done</button>
      </div>
    </div>`;
  setHidden(el, false, 'flex');
}

window.openGraphics = () => renderGraphicsMenu();
window.closeGraphics = () => setHidden(document.getElementById('gfx-menu'), true);

window.gfxPick = (asset, id) => {
  if (!setVariant(asset, id)) return;
  renderGraphicsMenu();
  rebuildHPWorld();
};

window.gfxReset = () => {
  resetVariants();
  renderGraphicsMenu();
  rebuildHPWorld();
};

// Rebuild the Dream Garden in place, keeping the walker where it stands, so a
// graphics change is visible immediately without losing the reader's position.
async function rebuildHPWorld() {
  const scene = state.activeScene;
  if (!(scene instanceof HPWorldScene)) return;
  // Keep the reader exactly where they stand — spawn is { pos:[x,y,z], yaw, pitch }
  const pl = scene.walker && scene.walker.player;
  const spawn = pl ? { pos: [pl.pos.x, 0, pl.pos.z], yaw: pl.yaw, pitch: pl.pitch } : null;
  const wasTour = !!state.tour;
  await launchHPWorld({ chooser: false, spawn });
  showHPMode(false);        // a graphics change must never dump you back to the entry screen
  if (wasTour) renderTourPanel();
}

window.startTour = startTour;
window.tourNext  = tourNext;
window.tourPrev  = tourPrev;
window.exitTour  = () => {
  closeTourWoodcut();
  const fc = document.getElementById('tour-flavor-chooser'); setHidden(fc, true);
  clearTour(); showToursMenu();
};

// The 1499 woodcut for the current tour moment — called up on demand.
function openTourWoodcut(idx) {
  const wcs = state._tourWoodcuts || [];
  if (!wcs.length) return;
  state._twcIdx = ((idx % wcs.length) + wcs.length) % wcs.length;
  const wc = wcs[state._twcIdx];
  const img = document.getElementById('twc-img');
  img.src = '../images/' + wc.file;
  img.alt = wc.caption || '';
  document.getElementById('twc-cap').textContent = wc.caption || '';
  document.getElementById('twc-count').textContent =
    wcs.length > 1 ? `${state._twcIdx + 1} / ${wcs.length}` : '';
  const multi = wcs.length > 1;
  document.getElementById('twc-prev').style.visibility = multi ? 'visible' : 'hidden';
  document.getElementById('twc-next').style.visibility = multi ? 'visible' : 'hidden';
  document.getElementById('woodcut-lightbox').style.display = 'flex';
}
function tourWoodcutStep(dir) { openTourWoodcut((state._twcIdx ?? 0) + dir); }
function closeTourWoodcut() {
  const el = document.getElementById('woodcut-lightbox');
  if (el) el.style.display = 'none';
}
window.openTourWoodcut  = openTourWoodcut;
window.tourWoodcutStep  = tourWoodcutStep;
window.closeTourWoodcut = closeTourWoodcut;

// ─── Navigation helpers ───────────────────────────────────────────────────────



function setActiveWorldBtn(id) {
  document.querySelectorAll('#world-nav button').forEach(b => b.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

window.switchWorld = function (world) {
  state.world = world;
  if (world !== 'GALLERY') hideGalleryOverlay();
  if (world !== 'TOURS')   { clearTour(); hideToursMenu(); }
  fadeSwitch(() => {
    if (world === 'GALLERY')  showGalleryOverlay();
    else if (world === 'TOURS') showToursMenu();
    else                        launchHPWorld();
  });
};


// ─── Touch controls (mobile walkable worlds) ──────────────────────────────────

// Evaluated live (not frozen at load): emulators and hybrid devices can report
// touch capability late, and a real touch always reveals the controls.
let _touchSeen = false;
window.addEventListener('touchstart', () => { _touchSeen = true; }, { once: true, passive: true });
function isTouchDevice() {
  return _touchSeen
    || window.matchMedia('(pointer: coarse)').matches
    || navigator.maxTouchPoints > 0;
}

function currentWalker() {
  const sc = state.activeScene;
  return (sc && sc.walker && !sc.dream) ? sc.walker : null;
}

function closeWonderMenu() {
  const m = document.getElementById('tc-wonder-menu');
  if (m) setHidden(m, true);
}

// Show the thumb-stick only in a walkable world, on a touch device, when no
// overlay / tour / dream is running. Cheap enough to call from the render loop.
function refreshTouchControls() {
  const el = document.getElementById('touch-controls');
  if (!el) return;
  const sc = state.activeScene;
  const walkable = isTouchDevice() && !!(sc && sc.walker) && !sc.dream && !state.tour
    && state.world === 'HP';
  el.hidden = !walkable;
  const wbtn = document.getElementById('tc-wonders');
  if (wbtn) wbtn.style.display = state.world === 'HP' ? '' : 'none';
  const rbtn = document.getElementById('tc-run');
  if (rbtn) rbtn.classList.toggle('on', !!currentWalker()?.running);
  if (!walkable) closeWonderMenu();
}

window.tcGoto = (key) => {
  const sc = state.activeScene;
  if (!(sc instanceof HPWorldScene)) return;
  closeWonderMenu();
  sc.teleport(key);
};

(function initTouchControls() {
  const stick = document.getElementById('move-stick');
  const knob = stick && stick.querySelector('.tc-knob');
  if (stick && knob) {
    let id = null, cx = 0, cy = 0, R = 1;
    const setKnob = (dx, dy) => { knob.style.transform = `translate(${dx}px, ${dy}px)`; };
    stick.addEventListener('pointerdown', (e) => {
      id = e.pointerId;
      const r = stick.getBoundingClientRect();
      cx = r.left + r.width / 2; cy = r.top + r.height / 2; R = r.width * 0.42;
      try { stick.setPointerCapture(id); } catch (_) {}
      e.preventDefault();
    });
    stick.addEventListener('pointermove', (e) => {
      if (e.pointerId !== id) return;
      let dx = e.clientX - cx, dy = e.clientY - cy;
      const d = Math.hypot(dx, dy);
      if (d > R) { dx = dx / d * R; dy = dy / d * R; }
      setKnob(dx, dy);
      const w = currentWalker(); if (w) w.setMove(dx / R, -dy / R);   // up = forward
    });
    const end = (e) => {
      if (e.pointerId !== id) return;
      id = null; setKnob(0, 0);
      const w = currentWalker(); if (w) w.setMove(0, 0);
    };
    stick.addEventListener('pointerup', end);
    stick.addEventListener('pointercancel', end);
  }

  const runBtn = document.getElementById('tc-run');
  runBtn && runBtn.addEventListener('click', () => {
    const w = currentWalker(); if (!w) return;
    w.running = !w.running;
    runBtn.classList.toggle('on', w.running);
  });

  const wBtn = document.getElementById('tc-wonders');
  wBtn && wBtn.addEventListener('click', () => {
    const m = document.getElementById('tc-wonder-menu');
    if (!m) return;
    if (m.hidden) {
      m.innerHTML = HP_STATIONS
        .map(s => `<button onclick="window.tcGoto('${s.key}')">${s.name}</button>`).join('')
        + `<button onclick="window.tcGoto('cythera_isle')">&#9973; Sail to Cythera</button>`;
      setHidden(m, false);
    } else setHidden(m, true);
  });
})();

// ─── HP World — the unified Dream Garden ──────────────────────────────────────

function stationKeyForFolio(folio) {
  const st = HP_STATIONS.find(s => s.folio === folio);
  return st ? st.key : null;
}

function setHPStyleBtn(visible) {
  const btn = document.getElementById('btn-hp-style');
  if (!btn) return;
  btn.style.display = visible ? 'inline-block' : 'none';
  btn.textContent = state.hpStyle === 'woodcut' ? 'Lit view' : 'Woodcut view';
}

async function launchHPWorld({ station = null, style = null, spawn = null, chooser = true, dream = false } = {}) {
  if (style) state.hpStyle = style;
  if (state.activeScene) { state.activeScene.dispose(); state.activeScene = null; }
  state.world = 'HP';
  state.inGallery = false;
  setActiveWorldBtn('btn-hp');

  const scene = new HPWorldScene(renderer, composer, { style: state.hpStyle, station, spawn });

  // As the dreamer nears a wonder, surface its folio and its commentary
  scene.onStation = (st) => {
    if (st) {
      showHPHUD(st.name, st.folio);
      showWalkNotes(st);                    // the commentary meets you at the wonder
    } else {
      showHPHUD('The Dream Garden of Poliphilo', null);
      hideWalkNotes();
    }
    setHPStyleBtn(true);
  };

  await scene.build();
  composer.passes[0] = new RenderPass(scene.scene, scene.camera);
  state.activeScene = scene;

  AlchemicalAudio.setStage('ALBEDO');
  showHPHUD('The Dream Garden of Poliphilo', null);
  setHPStyleBtn(true);

  if (dream) {
    startDream();
  } else if (chooser && !station && !spawn) {
    showHPMode(true);
  } else {
    showHint('W A S D / arrows walk · Shift run · drag to look · 1–9 the wonders · 0 sails to Cythera');
  }
  refreshTouchControls();
}

// ─── Poliphilo's Dream (story mode) ───────────────────────────────────────────

function showHPMode(on) {
  const el = document.getElementById('hp-mode');
  if (el) el.style.display = on ? 'flex' : 'none';
}

window.hpExplore = () => {
  showHPMode(false);
  // Ted: the free walk gets the same "how much do you want to read?" question,
  // and then the commentary surfaces as you approach each feature.
  showFlavorChooser({
    kicker: 'Walking the Dream Garden freely', begin: 'Start walking',
    onDone: () => {
      showHint('W A S D / arrows walk · Shift run · drag to look · 1–9 the wonders · 0 sails to Cythera');
      refreshTouchControls();
    },
  });
};

window.hpDream = () => {
  showHPMode(false);
  showFlavorChooser({
    kicker: 'Poliphilo’s Dream · twelve scenes', begin: 'Begin the dream',
    onDone: () => startDream(),
  });
};

// The guided tour, entered straight from the Dream Garden's front door rather
// than only from the Tours menu — "Poliphilo's Dream" reads like the tour, so
// offering only that here sent readers into the game looking for commentary.
window.hpTour = (id = 'novel') => {
  showHPMode(false);
  startTour(id);
};

// The four moods the player can answer each wonder in (the game's reaction-choices).
const MOODS = {
  wonder:     { label: 'Wonder',     color: '#d8a24a', adj: 'wondering' },
  eros:       { label: 'Desire',     color: '#c87f92', adj: 'desiring' },
  melancholy: { label: 'Melancholy', color: '#7fa8c0', adj: 'grieving' },
  dread:      { label: 'Dread',      color: '#8f6ab0', adj: 'haunted' },
};

const dreamUI = {
  setActive(on, finished) {
    document.body.classList.toggle('dreaming', on);
    if (on) {
      if (state.annotationTimer) clearTimeout(state.annotationTimer);
    } else {
      showHPHUD('The Dream Garden of Poliphilo', null);
      setHPStyleBtn(true);
      showHint(finished
        ? 'The dream is over — the garden is yours. W A S D to walk · 1–9 the wonders · 0 sails to Cythera'
        : 'W A S D / arrows walk · drag to look · 1–9 the wonders · 0 sails to Cythera');
    }
  },
  showTravel({ index, total, title }) {
    document.getElementById('dream-stop').textContent = `Scene ${index + 1} / ${total}`;
    document.getElementById('dream-title').textContent = title;
    document.getElementById('dream-text').innerHTML = '<span class="dp-walking">— following the path —</span>';
    document.getElementById('dream-quote-wrap').style.display = 'none';
    const box = document.getElementById('dream-choices');
    if (box) { box.classList.remove('on'); box.innerHTML = ''; }   // reset any reaction UI
    const nx = document.getElementById('dream-next');
    nx.style.display = ''; nx.textContent = 'Hurry ▸';
  },
  showBeat({ index, total, title, text, quote, source, voice, page, draft, isFinal }) {
    document.getElementById('dream-stop').textContent = `Scene ${index + 1} / ${total}`;
    document.getElementById('dream-title').textContent = title;
    document.getElementById('dream-text').textContent = text;
    const qw = document.getElementById('dream-quote-wrap');
    if (quote) {
      qw.style.display = 'block';
      // Three voices speak in this panel and they carry different authority, so
      // the reader is told which one before reading a word rather than after.
      // (See TRANSLATIONDISPLAYCHOICES.md.)
      const v = voice || '1592';
      qw.dataset.voice = v;
      const tagEl = document.getElementById('dream-voice');
      tagEl.textContent = ({
        '1592': '1592 · Dallington',
        '1499': '1499 · the book itself',
        'ours': 'translated for this project' + (draft ? ' · draft' : ''),
      })[v] || v;
      document.getElementById('dream-quote').textContent = quote;
      document.getElementById('dream-source').textContent = source ? '— ' + source : '';
      // Only our own translation invites checking, so only it links out.
      const link = document.getElementById('dream-parallel');
      if (v === 'ours' && page) {
        link.style.display = 'inline';
        link.href = `../research/translation.html#p${page}`;
      } else {
        link.style.display = 'none';
      }
    } else {
      qw.style.display = 'none';
    }
    document.getElementById('dream-next').textContent = isFinal ? 'Wake ▸' : 'Continue ▸';
  },

  // The game's turn: how does Poliphilo meet this wonder?
  showChoices({ index, total, title, prompt, options }) {
    document.getElementById('dream-stop').textContent = `Scene ${index + 1} / ${total}`;
    document.getElementById('dream-title').textContent = title;
    document.getElementById('dream-text').innerHTML =
      `<span class="dp-prompt">${prompt}</span>`;
    document.getElementById('dream-quote-wrap').style.display = 'none';
    const box = document.getElementById('dream-choices');
    box.innerHTML = options.map((o, i) => {
      const m = MOODS[o.mood] || { label: o.mood, color: '#8b5a13' };
      return `<button class="dp-choice" style="--mood:${m.color}" onclick="window.dreamChoose(${i})">
        <span class="dp-mood">${m.label}</span>${o.text}</button>`;
    }).join('');
    box.classList.add('on');
    document.getElementById('dream-next').style.display = 'none';   // must choose
  },

  // The chosen line, spoken — with a quiet reveal of the book's own response.
  showChosen({ index, total, title, mood, text, canonText, canonMood, wasCanonical }) {
    document.getElementById('dream-stop').textContent = `Scene ${index + 1} / ${total}`;
    document.getElementById('dream-title').textContent = title;
    const m = MOODS[mood] || { label: mood, color: '#c8a040' };
    // Picking the book's own answer otherwise passes silently — the tally only
    // surfaces at the waking. Say so here, or the faithful reading is invisible.
    const canonTag = wasCanonical
      ? ` <span class="dp-canon-tag">· as the book has it</span>` : '';
    document.getElementById('dream-text').innerHTML =
      `<span class="dp-chosen-tag" style="color:${m.color}">Poliphilo · ${m.label}${canonTag}</span>“${text}”`;
    const box = document.getElementById('dream-choices');
    box.classList.remove('on'); box.innerHTML = '';
    const qw = document.getElementById('dream-quote-wrap');
    if (canonText) {
      qw.style.display = 'block';
      qw.dataset.voice = '1499';
      document.getElementById('dream-voice').textContent = 'as the book has it';
      document.getElementById('dream-quote').textContent = '“' + canonText + '”';
      document.getElementById('dream-source').textContent = '';
      document.getElementById('dream-parallel').style.display = 'none';
    } else {
      qw.style.display = 'none';
    }
    const nx = document.getElementById('dream-next');
    nx.style.display = ''; nx.textContent = 'Continue ▸';
  },

  // The waking self-portrait: what temperament did the player author?
  showPortrait(t) {
    const counts = Object.keys(MOODS).map(k => [k, t[k] || 0]);
    counts.sort((a, b) => b[1] - a[1]);
    const top = counts[0], tie = counts[1] && counts[1][1] === top[1];
    const total = t._total || counts.reduce((s, [, n]) => s + n, 0) || 1;
    const canon = t._canon || 0;
    const portrait = tie
      ? 'You dreamed in many keys — wonder, desire, grief and dread by turns, as Poliphilo himself does.'
      : ({
          wonder:     'You dreamed as an antiquary — the eye before the heart, wonder your first answer to every marvel.',
          eros:       'You dreamed as a lover — desire the thread you followed through every wonder to the goddess.',
          melancholy: 'You dreamed as a mourner — under every beauty you already felt its passing.',
          dread:      'You dreamed as one haunted — the uncanny at the edge of every marvel, the dream never quite safe.',
        })[top[0]] || 'You dreamed your own way through the wonders.';
    const faithful = canon === total
      ? 'and you answered exactly as the book itself does, every time.'
      : canon === 0
        ? 'and never once as the book itself answers — this Poliphilo was entirely your own.'
        : `and ${canon} of ${total} times you answered as the book itself does.`;
    document.getElementById('dream-title').textContent = 'The Waking';
    document.getElementById('dream-stop').textContent = 'Your Poliphilo';
    document.getElementById('dream-text').innerHTML =
      `<span class="dp-pt-mood">${portrait}</span><br><br><span style="color:#a89878">${faithful}</span>`;
    document.getElementById('dream-quote-wrap').style.display = 'none';
    const box = document.getElementById('dream-choices'); box.classList.remove('on'); box.innerHTML = '';
    const nx = document.getElementById('dream-next');
    nx.style.display = ''; nx.textContent = 'Wake ▸';
  },
};

function startDream() {
  const scene = state.activeScene;
  if (!(scene instanceof HPWorldScene) || scene.dream) return;
  // the dream begins in the dark wood
  scene.walker.player.pos.set(0, 0, 49.5);
  scene.walker.player.yaw = 0;
  scene.walker.player.pitch = -0.02;
  scene.dream = new DreamMode(scene, dreamUI, DREAM_STOPS, DREAM_REACTIONS);
  scene.dream.start();
}

window.dreamNext   = () => state.activeScene?.dream?.advance();
window.dreamSkip   = () => state.activeScene?.dream?.skipStop();
window.dreamExit   = () => state.activeScene?.dream?.end(false);
window.dreamChoose = (i) => state.activeScene?.dream?.choose(i);

// Swap between the lit garden and the 3-D woodcut without losing your place
window.toggleHPStyle = () => {
  if (!(state.activeScene instanceof HPWorldScene)) return;
  const spawn = state.activeScene.getSpawnState();
  const style = state.hpStyle === 'woodcut' ? 'lit' : 'woodcut';
  fadeSwitch(() => launchHPWorld({ style, spawn }));
};

// ─── Theatrum Chemicum — the unified Atalanta Fugiens world ───────────────────




// ─── Archives world ───────────────────────────────────────────────────────────


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

function showHPHUD(sceneName, folio) {
  const stageEl = document.getElementById('hud-stage');
  stageEl.textContent   = 'HYPNEROTOMACHIA';
  stageEl.style.color   = '#c8a440';
  stageEl.style.borderColor = '#c8a440';

  document.getElementById('hud-title').textContent = sceneName;
  document.getElementById('hud-motto').textContent =
    folio == null ? 'Walk the dream — the whole book as one garden' : `Folio ${folio}`;

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




function showMessage(title, msg) {
  if (state.activeScene) { state.activeScene.dispose(); state.activeScene = null; }
  state.inGallery = false;

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
  // Poliphilo's Dream owns the keyboard (Space/Enter advance, Esc wakes)
  if (state.activeScene?.dream) return;
  // A running tour captures the arrow keys for stop-to-stop navigation
  if (state.tour) {
    // …unless the woodcut viewer is open, where they page the woodcuts
    const wcOpen = document.getElementById('woodcut-lightbox')?.style.display === 'flex';
    if (wcOpen) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown')   { e.preventDefault(); tourWoodcutStep(1); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); tourWoodcutStep(-1); }
      else if (e.key === 'Escape')                            closeTourWoodcut();
      return;
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown')   { e.preventDefault(); tourNext(); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); tourPrev(); }
    else if (e.key === 'Escape')                            window.exitTour();
    return;
  }
  // Tours menu (no tour running yet)
  const toursMenuOpen = document.getElementById('tours-menu')?.style.display === 'flex';
  if (toursMenuOpen) {
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
    }
    return;
  }

  const galleryOpen = document.getElementById('gallery-overlay')?.style.display === 'block';
  if (galleryOpen) {
    const lbOpen = document.getElementById('gallery-lightbox')?.style.display === 'flex';
    if (lbOpen) {
      if (e.key === 'ArrowRight') { e.preventDefault(); galleryStep(1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); galleryStep(-1); }
      if (e.key === 'Escape')     closeGalleryImg();
    } else if (e.key === 'Escape' || e.key === 'g' || e.key === 'G') {
    }
    return;
  }

});

// ─── Resize ───────────────────────────────────────────────────────────────────

window.addEventListener('resize', resizeAll);

// ResizeObserver catches iframe resize events that don't fire 'resize' on window
if (typeof ResizeObserver !== 'undefined') {
  new ResizeObserver(resizeAll).observe(document.documentElement);
}

// ─── Render loop ──────────────────────────────────────────────────────────────

let _lastW = 0;
let _tcTick = 0;
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  // Auto-resize when iframe finally has dimensions (first real frame)
  const { w } = getViewport();
  if (w !== _lastW) { _lastW = w; resizeAll(); }

  // Keep the mobile controls in sync with whatever world/mode is up
  if (++_tcTick % 15 === 0) refreshTouchControls();

  if (state.activeScene) {
    state.activeScene.update(dt);
    if (composer.passes[0]) {
      composer.passes[0].scene  = state.activeScene.scene;
      composer.passes[0].camera = state.activeScene.camera;
    }
  }

  composer.render();
}

// Debug handle so the view can be driven from the console during development
window._hp = { renderer, composer, state, clock };

// ─── Audio ────────────────────────────────────────────────────────────────────
// The site is silent by design (Ted, 2026-09-04): no music or ambient audio
// anywhere — tours, dream, Atalanta, any page. So there is no gesture listener
// here to unlock an AudioContext; AlchemicalAudio is a no-op stub. See
// DECISIONS.md before adding any sound.

// ─── Init ─────────────────────────────────────────────────────────────────────

(async () => {
  try {
    resizeAll(); // safe here — composer + bloom are defined
    await loadData();
    setProgress(80, 'Opening the world…');

    // Deep-link from the URL hash. The site is the Hypnerotomachia now, so the
    // default is the Dream Garden itself rather than an emblem scene.
    const hash       = location.hash || '';
    const tourMatch  = hash.match(/tour=([\w-]+)/);
    const hpMatch    = hash.match(/[#&]hp(?:=(woodcut|lit))?\b/);
    const dreamMatch = hash.match(/[#&]dream\b/);
    const galleryMatch = hash.match(/[#&]gallery\b/);
    if (galleryMatch) {
      showGalleryOverlay();
    } else if (dreamMatch) {
      await launchHPWorld({ dream: true, chooser: false });
    } else if (tourMatch && state.tours && state.tours[tourMatch[1]]) {
      await startTour(tourMatch[1]);
    } else {
      await launchHPWorld({ style: hpMatch && hpMatch[1] ? hpMatch[1] : 'lit' });
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
