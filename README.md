# Emblems in 3D

**Live:** **[emblems-in-3d.vercel.app](https://emblems-in-3d.vercel.app)** (canonical)
· [t3dy.github.io/EmblemsIn3d](https://t3dy.github.io/EmblemsIn3d) (GitHub Pages mirror)

**[GitHub Repository](https://github.com/t3dy/EmblemsIn3d)**

### Versions

Earlier releases are archived in full and stay reachable from the landing page, so the
project's earlier states remain readable and citable.

| | Release | Where | What it is |
|---|---|---|---|
| **v3** | current | [`/`](https://emblems-in-3d.vercel.app) | The Graphics menu (choose how each asset is drawn), commentary that meets you as you walk, the guided tour on the garden's front door, rebuilt navigation, a dream loop that cannot hang, and a silent site. |
| **v2** | archived | [`/v2/`](https://emblems-in-3d.vercel.app/v2/) | The guided tour with its commentary lenses, the Gallery, Poliphilo's Dream as a game, mobile controls, and the first imported model (the marble Venus). |
| **v1** | archived | [`/v1/`](https://emblems-in-3d.vercel.app/v1/) | The original release: the emblem worlds, the games, and the first walkable Dream Garden. |

Both hosts serve the same `main` branch. See [`DEPLOY_STATE.md`](DEPLOY_STATE.md) before
touching deploy configuration — publishing to one host does **not** publish to the other.

A browser-based digital humanities project that brings two Renaissance texts into Three.js: Michael Maier's alchemical emblem book *Atalanta Fugiens* (Frankfurt, 1617) and Francesco Colonna's dream narrative *Hypnerotomachia Poliphili* (Venice, 1499). Almost everything is built from raw Three.js geometry rather than imported assets — the five hand-built showcase scenes are geometry primitives animated with GSAP looping timelines that encode the cyclic logic of alchemical transformation, while the other 46 emblems are rendered as **lit carved 3-D reliefs of their original woodcuts** (the plate image drives a displacement map and a runtime Sobel normal map under a raking key light) and can lift their extracted figures into a **2.5-D parallax diorama**. Everything is driven by a SQLite export pipeline.

Guided **Tours** then connect these models to the research — the scholarship, the alchemical signs, the four-stage *opus*, and the documented links between the two books.

---

## Live Experiences

| Page | Description |
|------|-------------|
| [`index.html`](https://t3dy.github.io/EmblemsIn3d/index.html) | Landing page — hero, Three Worlds overview, Games section, tech strip |
| [`src/main.js`](https://t3dy.github.io/EmblemsIn3d/src/) | Entry point for all Three.js worlds |
| [`games/index.html`](https://t3dy.github.io/EmblemsIn3d/games/index.html) | Games hub — badge-labelled cards for all four games |
| [`games/oracle.html`](https://t3dy.github.io/EmblemsIn3d/games/oracle.html) | Alchemical Oracle — random emblem reveal |
| [`games/fugue-scroll.html`](https://t3dy.github.io/EmblemsIn3d/games/fugue-scroll.html) | Fugue Scroll — all 51 emblems as scroll sections |
| [`games/stage-sorter.html`](https://t3dy.github.io/EmblemsIn3d/games/stage-sorter.html) | Stage Sorter — drag emblems into their correct alchemical stage |
| [`games/memory.html`](https://t3dy.github.io/EmblemsIn3d/games/memory.html) | Memory — match Roman numerals to English emblem titles |

The toolbar sits above every overlay (so no tab can trap you) and carries a **Home** link, a **Graphics** menu, and the worlds. The 3-D app has **six worlds**: **Hypnerotomachia** (the Dream Garden of Poliphilo — the book's whole journey as one walkable world with a *Poliphilo's Dream* story mode, renderable as a lit garden *or* as a 3-D woodcut) · **Atalanta Animata** (the gallery wall of 51 lit plates → click to enter a scene) · **Theatrum** (all 51 emblems enacted as animated vignettes around one explorable rotunda) · **Plates** (a 2-D atlas → lightbox) · **Tours** · **Archives** (the HP-folio ↔ AF-emblem graph).

Four guided **Tours** fly the camera through the actual emblem scenes while a side rail surfaces the research: **The Scholarship** (each emblem's modern reading), **Chemical Symbolism** (the planetary-metal signs, glyphs, and marginalia-hand notes), **The Great Work** (Nigredo → Rubedo), and **The Two Books** (the 9 documented Hypnerotomachia ↔ Atalanta cross-references). The **Oracle** and **Fugue Scroll** also reveal each emblem's scholarship on demand.

---

## What Was Built

### Three.js Worlds

#### 1. Atalanta Animata — 51-Card 3D Gallery

The entry world. All 51 emblems of *Atalanta Fugiens* are displayed as `BoxGeometry` gallery cards, coloured by alchemical stage. Five showcase emblems (IV, V, X, XXXIII, L) are rendered larger with gold `EdgesGeometry` borders. Hover shows a tooltip; click enters the emblem's animated scene. Scroll-wheel controls zoom; a parallax camera drift makes the gallery breathe.

```js
// Card colour is driven by alchemical stage
const STAGE_COLOURS = {
  NIGREDO:    0xcc3300,
  ALBEDO:     0x4488cc,
  CITRINITAS: 0xddaa00,
  RUBEDO:     0xff5500,
};
```

#### 2. Five Showcase Emblem Scenes

Each scene is a `gsap.timeline({ repeat: -1 })` running 12–16 seconds per cycle, encoding the alchemical operation described in Maier's text and epigram. All figures are built entirely from primitive geometries.

**Emblem IV — Alchemical Conjunction** (NIGREDO, 12s)
Two `CapsuleGeometry` figures drift toward centre. `ParticleStream` love-sparks converge on a rising chalice (`TorusGeometry` bowl + `CylinderGeometry` stem). Subject: the conjunction of brother and sister (prima materia pair).

**Emblem V — Prima Materia** (NIGREDO, 12s)
A woman (`CapsuleGeometry`) lies horizontal. A toad (squashed `SphereGeometry`, amber emissive eyes) rests at her breast. A milk `ParticleStream` flows along a bezier arc. Timeline: toad grows, woman pales, flash reset. Subject: the *bellua*/nourishing beast drawing substance from the earth.

**Emblem X — Give Fire to Fire** (CITRINITAS, 12s)
Four concentric fire spheres (`0xff6600` → `0xffee44`, increasing `emissiveIntensity`). A Mercury figure pours a silver `ParticleStream` that feeds back into the fire. The animation is recursive — the stream returns to its own source. Subject: "Give fire to fire, mercury to mercury."

**Emblem XXXIII — The Hermaphrodite** (RUBEDO, 14s)
A `CapsuleGeometry` hermaphrodite figure. `PlaneGeometry` wings (start `scale.x=0.1`, unfurl with elastic easing to `1.0`). A `TorusGeometry` crown descends from `y=8`. Material channels shift between R and B over time (gender oscillation). Solar and lunar `ParticleStreams` converge. Subject: the union of Sol and Luna.

**Emblem L — The Philosopher's Stone** (RUBEDO, 16s)
An `OctahedronGeometry` philosopher's stone sits on a `CylinderGeometry` pedestal. An ouroboros dragon ring: 16 `CapsuleGeometry` segments arranged in a circle of radius 2.2. A crown descends. 12-ray `LineSegments` fade from opacity 0 to 0.9. A circular `ouroStream` particle loop. Subject: completion of the Great Work.

#### 3. The Dream Garden of Poliphilo — Unified HP World

`HPWorldScene.js`. The **whole journey of the Hypnerotomachia as one first-person walking simulator**, north to south: the dark wood (*selva oscura*, with the wolf), the Great Pyramid-Portal (FESTINA LENTE hieroglyph plaque, the dragon), the court of **Queen Eleuterylida** with the five named sense-nymphs (**Aphea** Touch, **Osfressia** Smell, **Orassia** Sight, **Achoe** Hearing, **Geussia** Taste) and the bath of the nymphs, **Logistica** and **Thelemia** at the **Three Doors** (Gloria Dei / Gloria Mundi / Mater Amoris), the plaza of the **Elephant & Obelisk**, the **Planetary Palace** (seven metals, Chaldean order), the **Quinta Essentia** court, **Polia's torch-lit garden**, the four **Triumphs of Jupiter** (Europa, Leda, Danaë, Semele), the **Fountain of Venus**, and the shore where **Cupid's boat** waits below distant Cythera. WASD/arrows walk, drag looks, 1–9 teleport-glide; circle/AABB colliders (`Walker.js`); named NPC figures (`Cast.js`) keep their places; nearing a station surfaces its folio, `world_links` cross-references, and BL marginalia.

**Two modes** (chooser on entry): **Walk Freely**, or **Poliphilo's Dream** (`DreamMode.js` + `hp_dream.js`) — a twelve-scene click-to-continue story mode that walks the player along the plot while a guide (a sense-nymph, Logistica, Thelemia, or Polia herself) paces ahead. The narration follows the book scene by scene, quoting only public-domain matter: the 1499 edition's own Latin (FESTINA LENTE, the doors' inscriptions, the POLIAM FRATER FRANCISCVS COLVMNA PERAMAVIT acrostic, Polia's epitaph, the title-page motto) and the 1592 English title. Deep links: `src/#hp`, `src/#dream`.

**Two renderings**, toggleable in place: **Lit** (cast shadows, IBL metals, coloured point lights) and **Woodcut** — the same geometry as a 3-D rendering of the 1499 woodcuts (cream paper, cross-hatch ink bands via an `onBeforeCompile` hatching stage, rim ink + inverted-hull outlines, radiating ink rays instead of bloom, one raking shadow light — the papercraft trick from the sibling EmblemPapercraft project). Deep link: `src/#hp=woodcut`. Method notes: [`docs/UNIFIED_HP_WORLD.md`](docs/UNIFIED_HP_WORLD.md).

#### 3b. Theatrum Chemicum — Unified AF World

`AFWorldScene.js` + `af_vignettes.js`. **All fifty-one emblems as one explorable rotunda**: stations around a circular promenade in the order of the Work (NIGREDO → ALBEDO → CITRINITAS → RUBEDO, stage gateways between), each pairing the lit carved-relief plate with an **animated primitive-geometry vignette enacting the emblem** — the fleeing Atalanta, the wind-borne child, the laundress, the ouroboros, the circle-square-triangle, the salamander in the fire, the green lion, the two eagles, the dragon and the woman, and all the rest. The Philosopher's Stone turns inside an ouroboros at the hub. Walking up to a station surfaces its motto and epigram; clicking its plate opens the full 3-D emblem scene; 1–4 teleport to the stages, 5 to the Stone. Deep link: `src/#theatrum`.

#### 4. Archives — Bipartite Scholarly Graph

`ArchivesScene.js`. 9 HP folio nodes (gold `SphereGeometry`, left column) connected to 14 AF emblem nodes (stage-coloured `SphereGeometry`, right column) by `QuadraticBezierCurve3` edge curves rendered as `BufferGeometry` `LineSegments`. Showcase AF emblems carry gold `TorusGeometry` halo rings.

DOM labels are overlaid on the WebGL canvas by projecting 3D positions to screen coordinates each frame via `Vector3.project(camera)`. This is cheaper than sprites and supports real CSS typography. Column header labels read "Hypnerotomachia" and "Atalanta Fugiens".

Interaction: hover scales a node to 1.35× and raises `emissiveIntensity` to 1.1; click navigates to the linked scene. Camera drifts gently on a sine path. Bloom strength: 0.55.

---

### Games

#### Oracle (`games/oracle.html`)

Fetches a random emblem from `emblems.json`. Reveals content in a progressive CSS opacity sequence with 480ms steps per layer: stage badge → Roman numeral → title → motto (Latin) → motto (English) → epigram. Background tinted by alchemical stage colour. "Draw another" button resets and fetches a new emblem.

#### Fugue Scroll (`games/fugue-scroll.html`)

All 51 emblems as `100vh` scroll sections. `IntersectionObserver` at `threshold: 0.25` adds a `.visible` class triggering `opacity: 0→1` + `translateY: 30px→0` over 0.8s. Stage-transition divider sections mark the boundaries between NIGREDO / ALBEDO / CITRINITAS / RUBEDO. A fixed progress bar at the top syncs its width to scroll position as a fraction of total document height.

#### Stage Sorter (`games/stage-sorter.html`)

19 draggable emblem cards (CITRINITAS has 4, not 5 — see Data Gaps below). Four drop zones, one per stage. Score reveal with green/red per-card animation. Cards can be dragged back to the hand area to reconsider. Score denominator is dynamic: `Math.min(5, pool.length)` per stage, so CITRINITAS scores out of 4.

#### Memory (`games/memory.html`)

16 cards (8 pairs). Each pair: Roman numeral (gold, `2.2rem`) ↔ English emblem title. CSS `perspective + rotateY` 3D flip animation on reveal. Matched pairs receive a green border glow. (Originally designed as Latin↔English motto matching, but only 1/51 emblems has `motto_latin` populated in the database — see Data Gaps.)

---

### Systems and Infrastructure

#### AlchemicalAudio (`src/AlchemicalAudio.js`)

**Tone.js 14.7.77**, lazy-imported (`import('https://esm.sh/tone@14.7.77')`). AudioContext requires a first user gesture (browser autoplay policy); audio is unlocked on first click.

Stage-specific generative soundscapes:

| Stage | Synthesis |
|-------|-----------|
| NIGREDO | 3-stack sawtooth drone (42 / 43.2 / 40.8 Hz) + brown noise crackle loop |
| ALBEDO | 4 sine overtones (220 / 330 / 440 / 660 Hz) with `Reverb` decay=6 + `Tremolo` |
| CITRINITAS | `MetalSynth` bell strikes (5-pitch sequence, `repeat:'3'`) + sine hum |
| RUBEDO | `PolySynth` triangle triads (C/F/G major) + `Chorus` + `Reverb` |

#### ParticleStream (`src/Particles.js`)

`THREE.Points` with `BufferGeometry`. Each stream uses quadratic bezier interpolation per particle:

```
B(t) = (1-t)²P0 + 2(1-t)t·P1 + t²P2
```

Per-particle phase offset produces staggered timing across the stream. Turbulence noise is added per tick:

```js
position.x += Math.sin(ti * 12 + i * 0.7) * 0.06;
```

Material flags: `AdditiveBlending`, `depthWrite: false`. `show(duration)` / `hide(duration)` interpolate opacity via `requestAnimationFrame`. Multiple overlapping streams sum their brightness — light accumulates, matching the alchemical metaphor of fire feeding fire.

#### Annotation Panel

BL marginalia surfaces automatically after 6 seconds in any scene, or immediately on pressing **A**. `findLinkedAnnotations(emblemNumber)` looks up `world_links.json` for the linked HP folio, then queries `hp_annotations.json`. When real BL annotations don't cover the folio (which is the common case — see Data Gaps), it falls back to editorial cross-reference commentary written for each of the 9 world links.

#### Fade Transitions

A CSS black overlay element with a 320ms transition handles all world switches. Every `loadWorld()` call fades out, swaps scene, fades in.

#### HP HUD

Active in HP scenes: displays a `HYPNEROTOMACHIA` stage badge (gold), scene name, `Folio N · linked to AF Emblems n, n` motto, and a `← Atalanta` back button.

#### Key Hint Toast

On first visit to an emblem scene: `← →  emblems  ·  A  context  ·  G  gallery`. In Archives: a context-specific hint. Auto-fades after 4.5 seconds. State stored in `sessionStorage` so it only shows once per session.

---

## Reading the Scholarship

Commentary is typed and colour-coded — *Renaissance context*, *architectural theory*,
*neoplatonic aesthetics*, *mythological allusion*, *allegory & symbolism*, *literary art*,
*a difficult word*, *from the book*, and the *alchemical reading* — and every flavour is
independently switchable.

- **All three modes ask first.** The guided tour, the free walk and Poliphilo's Dream each
  open with *"How much do you want to read?"*, and the choice is remembered.
- **In the tour**, a titled **Commentary lenses** panel carries a live count, a tick-box per
  lens, and *Show all* / *Just the story*.
- **In the free walk**, there are no stops to click, so the commentary comes to you:
  approaching a wonder raises that station's notes and leaving it lowers them again. It is
  the tour's own writing, so there is one body of commentary rather than two.

Every interpretive claim traces to a named scholar in the project's research corpus or to
the annotators' evidence in `hp.db` — see `SOURCES.md`, which also maps each 3-D asset to
the scholarship that should govern its shape (Curran for the elephant, obelisks and
hieroglyphs; Stewering for Polia and the nymphs; Lefaivre for the architecture; Bury for the
pyramid and tombs; Nygren for the statuary; Hunt and Segre for the gardens).

The complete CC0 translation is also published as a single file,
[`HPTranslation.txt`](HPTranslation.txt) — 273 pages, ~173,000 words, chapters XVII–XXXVIII
with Book II, the Epitaph and the errata leaf, page-marked against the 1499 facsimile.

---

## Tech Stack

### Rendering

- **Three.js r168** — ES module from jsDelivr CDN, loaded via `importmap`
- **Carved woodcut reliefs** — non-showcase emblems use the plate image as a `displacementMap` (subtle, inverted so inked figures lift off the paper) plus a **runtime Sobel-derived `normalMap`** (generated in-browser from the grayscale via a `<canvas>` pass), so ink lines catch the raking light as engraving. Showcase scenes get the same plate as a dim relief backdrop.
- **2.5-D diorama** — extracted figure cutouts (from `scripts/build_diorama.py` → `diorama.json`) float as alpha-tested billboards in front of the relief at an inferred depth, parallaxing when orbited.
- **Image-based lighting** — `RoomEnvironment` baked through `PMREMGenerator` (no HDRI file) gives soft neutral fill + reflections, shared across scenes.
- **EffectComposer + UnrealBloomPass** — post-processing chain; bloom strength varies by scene
- **ACESFilmic tonemapping** + **SRGBColorSpace output**
- **GSAP 3.12.5** — from esm.sh CDN; `gsap.timeline({ repeat: -1 })` for all emblem animations

```html
<!-- importmap example -->
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.168.0/examples/jsm/"
  }
}
</script>
```

### Geometry Inventory

Every figure and environment object is built from primitives — no `.glb` or `.fbx` imports:

| Geometry | Used For |
|----------|----------|
| `CapsuleGeometry` | Human figures, arms, ouroboros segments |
| `SphereGeometry` | Heads, fire layers, graph nodes, toad |
| `TorusGeometry` | Fountain rims, crowns, halo rings |
| `CylinderGeometry` | Columns, pedestals, fountain bowls, trunks |
| `OctahedronGeometry` | Philosopher's stone |
| `PlaneGeometry` | Wings, ground planes |
| `BoxGeometry` | Gallery cards, garden hedges |
| `ConeGeometry` | Cypress trees, drapery |
| `BufferGeometry` | Particles, bezier curves, divider lines |
| `LineSegments` | Ouroboros rays, edge curves in Archives |
| `QuadraticBezierCurve3` | Archive graph edges |

### Lighting

Each emblem scene uses a four-light rig plus image-based fill so forms read clearly while the stage palette stays for mood:

- **Key** — warm-white `DirectionalLight` raking from upper-left (reveals relief carving); deliberately *neutral*, not stage-tinted, so the imagery reads
- **Fill** — cool, soft `DirectionalLight` from the opposite side
- **Rim** — stage-tinted `DirectionalLight` from behind for atmosphere and silhouette separation
- **Ground bounce** — tinted `PointLight` near the floor (also drives the showcase GSAP timelines)
- **Hemisphere + IBL** — warm-parchment/dark-wood `HemisphereLight` and the shared `RoomEnvironment` map
- HP fountain uses warm afternoon sun + cool sky fill; the gallery wall plates are emissive-floored so they stay bright while gaining carved shading

### Audio

- **Tone.js 14.7.77** — lazy `import()` on first user gesture
- No sampled audio files; all sound is synthesised

### Data

- **SQLite** — two source databases queried by the export pipeline
- **Python 3** — export script (`export_for_3d.py`)
- **JSON** — all data consumed at runtime via `fetch()`
- No build step or bundler

### Deployment

- **GitHub Pages** — static HTML + JS, no server required
- **Local dev** — `python -m http.server 8000`
- **Fetch versioning** — all JSON fetches and ES module imports append `?v=N` (see Bug Log)

---

## Data Architecture

### Source Databases

| Database | Location | Content |
|----------|----------|---------|
| `atalanta.db` | `C:\Dev\Claudiens\db\atalanta.db` | 51 AF emblems, mottos, epigrams, stages, fugue scores |
| `hp.db` | `C:\Dev\hypnerotomachia polyphili\db\hp.db` | HP annotations, symbols, woodcuts, folio descriptions |

Both databases are read-only from this project's perspective. `export_for_3d.py` queries them once and writes JSON output consumed by the browser.

### Export Pipeline (`export_for_3d.py`)

Queries both databases and emits six JSON files into `data/`:

| Output file | Contents |
|-------------|----------|
| `emblems.json` | 51 AF emblems with motto, epigram, stage, emblem number |
| `hp_annotations.json` | BL marginalia annotations keyed by folio |
| `hp_symbols.json` | Alchemical symbols identified in HP woodcuts |
| `hp_woodcuts.json` | Woodcut descriptions per folio |
| `hp_folio_descriptions.json` | Full folio-level descriptions |
| `world_links.json` | 9 editorial HP↔AF cross-references with scholarly commentary |

Column names are discovered dynamically using `PRAGMA table_info` rather than hardcoded, because the `annotations` table schema differed from initial assumptions (see Bug Log item 9).

Two further data files are authored outside that pipeline:

| Output file | Source | Contents |
|-------------|--------|----------|
| `tours.json` | hand-authored | The four guided tours (stops, ledes, accents); the Two Books tour is generated at runtime from `world_links.json` |
| `diorama.json` | `scripts/build_diorama.py` | Per-emblem, depth-ordered cutout-layer manifest cropped + web-optimized from a sibling computer-vision extraction of the emblems (143 layers across 51 emblems) |

### `world_links.json` Schema

Each of the 9 cross-references connects a HP folio to one or more AF emblems via a shared symbol or visual motif. Fields:

```json
{
  "hp_folio": 28,
  "hp_scene": "fountain",
  "af_emblems": [5],
  "shared_symbol": "bellua",
  "link_type": "thematic",
  "commentary": "~150-word scholarly note bridging the two texts..."
}
```

Example cross-references:
- Folio 28 bestiary portal ↔ Emblem V (prima materia / beast nourishment)
- Folio 80 fountain ↔ Emblems I–II (nourishment, prima materia waters)
- Folio 164 quinta essentia ↔ Emblem L (completion of the Great Work)

---

## Creative Decisions

**1. Built geometry first — but no longer *only* built geometry**

The project began primitive-only: every figure from `CapsuleGeometry`, `SphereGeometry` and
the like, no asset imports at all. That constraint removed the asset pipeline, forced close
reading of each emblem's actual imagery (what does Maier's woodcut show? a toad? a
capsule-bodied hermaphrodite?), and gave 51 scenes one visual language. The constraint
became the style.

That founding rule has since been **deliberately relaxed** (`DECISIONS.md`). Imported models
are allowed where a good public-domain scan exists — the Fountain of Venus holds a CC0 scan
of the Capitoline Venus — and, more importantly, **no asset is limited to one
implementation**. Each carries a registry of named variants the visitor switches between in
the **Graphics** menu:

| Asset | Variants |
|---|---|
| Trees & foliage | Primitive · Massed |
| The elephant & obelisk | Primitive · Modelled |
| Nymphs & figures | Primitive · Modelled · Painterly |
| Statues & the marble Venus | Built · Imported scan |
| Water features | Primitive · Painterly |
| Wall decoration & ornament | Primitive · Carved |

The earlier version is never deleted when a better one lands, so the work can evolve without
losing an earlier register — and the woodcut render mode still prefers the primitive
silhouette, because flat ink wants a readable outline, not a modelled mass.

**1b. The register is painterly, not photoreal**

The lit garden aims to be *a Botticelli panel you can walk into*: painted albedo, drapery
folds drawn into the cloth rather than lit into it, a limited period palette, outlines kept.
An imported scan therefore gets a stylisation pass before it is allowed in — a photoreal
marble fights a tempera garden.

**1c. The site is silent by design**

There is no music or ambient audio anywhere, and silence is structural rather than a volume
setting: no `AudioContext` is ever constructed. See `DECISIONS.md` before adding sound.

**2. Alchemical stage as unified design system**

NIGREDO / ALBEDO / CITRINITAS / RUBEDO is not just labelling — it drives every visual decision: background colour, `PointLight` colour, particle colour, bloom strength, card colour in the gallery, audio synthesis approach, and node colour in Archives. One lookup table, all decisions made.

```js
const STAGE = {
  NIGREDO:    { bg: 0x110000, light: 0xff2200, bloom: 0.65 },
  ALBEDO:     { bg: 0x001122, light: 0x88aaff, bloom: 0.35 },
  CITRINITAS: { bg: 0x110800, light: 0xffcc00, bloom: 0.55 },
  RUBEDO:     { bg: 0x110500, light: 0xff6600, bloom: 0.65 },
};
```

**3. Looping GSAP timelines (12–16s, `repeat: -1`)**

Alchemical operations have no terminal state; the Great Work is cyclic. `repeat: -1` encodes the philosophical claim that the prima materia is never destroyed, only transformed. The animations could technically complete, but they refuse to.

**4. Quadratic bezier particle paths**

All substance flows — milk (Emblem V), mercury water (Emblem X), love-sparks (Emblem IV), water (HP fountain) — travel bezier arcs rather than straight lines. The midpoint control vertex encodes the symbolic destination of the substance (chalice, toad, basin), making the geometry an argument about where the substance is going, not just how it moves.

**5. Bipartite graph for Archives**

The scholarship on these two texts is about their network of shared visual grammar. A node-link diagram makes that argument structurally rather than discursively: HP and AF are shown as two parallel columns, and the 9 bezier edges between them are 9 specific scholarly claims. A table or list would make the same claims but hide their relational structure.

**6. Editorial commentary as data**

When real BL marginalia didn't cover the world-linked folios, ~150-word scholarly notes were written for each of the 9 HP↔AF connections, grounded in the actual imagery of both texts, and stored in `world_links.json` alongside the structural cross-reference data. The annotation panel always surfaces something worth reading. Empty panels are not acceptable.

**7. `AdditiveBlending` particles**

Particles glow rather than occlude. Multiple overlapping streams sum their brightness. This matches the alchemical metaphor directly: fire feeds fire; simultaneous processes amplify each other rather than compete.

**8. DOM labels synced to 3D (Archives)**

Text labels for graph nodes are CSS elements overlaid on the WebGL canvas, with positions updated each frame by projecting 3D coordinates to screen space via `Vector3.project(camera)`. This is significantly cheaper than `THREE.Sprite` text and supports real CSS typography (web fonts, `letter-spacing`, etc.).

**9. Fetch versioning (`?v=N`)**

All JSON data fetches and ES module `import` paths append `?v=N`. This was discovered to be necessary (see Bug Log item 3) and is now a standard practice in the project. Version numbers are incremented whenever the relevant file changes.

---

## Learnings and Bug Log

### Environment Bugs

**1. `window.innerWidth = 0` in preview iframes**

The preview pane runs inside a sandboxed iframe with zero reported window dimensions. `renderer.setSize(window.innerWidth, window.innerHeight)` produced a 0×0 canvas. Fix: a fallback chain for every dimension read:

```js
const w = canvas.clientWidth
  || document.documentElement.clientWidth
  || window.innerWidth
  || 1280;
```

**2. Temporal Dead Zone (TDZ) ordering in ES modules**

`resizeAll()` was called at module level after renderer setup but before `composer` and `bloom` were declared with `const`. Both were in the TDZ when `resizeAll()` ran. The async init IIFE silently never ran as a consequence. Fix: move `resizeAll()`'s definition to after `bloom` is declared, then call it as the first statement inside the async IIFE.

**3. ES module caching (304 Not Modified)**

Even after bumping `?v=2` to `?v=3`, browsers served cached JS. ES modules are cached aggressively by the module registry — a version bump on the entry file doesn't invalidate downstream cached modules. Fix: every file in the import chain must get its version string incremented: `index.html → main.js → EmblemScene.js → Particles.js`. A change in any leaf file requires bumping all upstream importers that reference it.

**4. `Object.assign` on `THREE.Mesh.position`**

```js
// This throws TypeError: Cannot assign to read only property 'position'
Object.assign(new THREE.Mesh(), { position: new THREE.Vector3(x, y, z) });
```

`THREE.Mesh.position` is a getter returning a reference to an internal `Vector3` — it is not a writable own property. Fix:

```js
const mesh = new THREE.Mesh(geo, mat);
mesh.position.set(x, y, z);
```

**5. `UnicodeEncodeError` on Windows cp1252**

Print statements in `export_for_3d.py` containing `✓ ⚠ ──` failed on Windows terminals with cp1252 encoding. Fix: replace all emoji and box-drawing characters with ASCII equivalents (`OK`, `WARN`, `--`).

### Data Gaps

**6. `motto_latin`: 1/51 emblems populated**

The schema has both `motto_latin` and `motto_english` columns, but only Emblem I has a Latin motto in the database. The Memory game was initially designed as Latin↔English motto matching; it was redesigned as Roman numeral↔English title matching.

**7. CITRINITAS has 4 emblems, not 5**

The Stage Sorter targeted 5 cards per stage (20 total), but CITRINITAS only has 4 emblems in the dataset. Fix: `Math.min(5, pool.length)` for card selection, and a dynamic score denominator (`activeCards.length`) so CITRINITAS scores correctly out of 4.

**8. Annotation folio gap**

`hp_annotations.json` contains real BL data only for folios 1–8. All 9 world-link cross-references point to folios 14–164, none of which have database annotations. Bridged by writing editorial commentary for each of the 9 links (see Creative Decision 6).

**9. `annotations` table column names**

The `annotations` table uses `folio_number` and `annotation_text`, not `page` and `text` as initially assumed. The export script now uses `PRAGMA table_info` to discover column names dynamically at query time:

```python
cursor.execute("PRAGMA table_info(annotations)")
cols = {row[1]: row[0] for row in cursor.fetchall()}
```

---

## Running Locally

```bash
git clone https://github.com/t3dy/EmblemsIn3d.git
cd EmblemsIn3d
python -m http.server 8000
# Open http://localhost:8000
```

No build step, no `npm install`, no bundler. Pure ES modules served as static files.

**Note on the data pipeline:** `export_for_3d.py` reads from two SQLite databases that live outside this repository:

- `C:\Dev\Claudiens\db\atalanta.db` (Atalanta Fugiens source data)
- `C:\Dev\hypnerotomachia polyphili\db\hp.db` (HP marginalia source data)

The exported JSON files (`data/*.json`) are committed to the repository, so the pipeline does not need to be re-run to use the site. Re-run it only if the source databases change:

```bash
python export_for_3d.py
```

---

## Source Texts

### *Atalanta Fugiens* — Michael Maier, Frankfurt 1617

A Latin emblem book consisting of 51 emblems, each comprising: a Latin motto, a German epigram, an engraved woodcut (the *emblemata*), a three-voice musical fugue, and an explanatory *discursus*. The emblems are organised into four alchemical stages — NIGREDO (blackening), ALBEDO (whitening), CITRINITAS (yellowing), and RUBEDO (reddening) — that map the transformation of prima materia into the Philosopher's Stone. Maier encodes alchemical theory through classical mythology: Mercury, Venus, Sol, Luna, and the hermaphrodite appear throughout. The text shares symbolic vocabulary with HP: ouroboros, prima materia, quinta essentia, planetary metals.

### *Hypnerotomachia Poliphili* — Francesco Colonna, Venice 1499

A dream narrative printed by Aldus Manutius in Venice. The protagonist Poliphilo journeys through allegorical gardens, temples, and architectural spaces in pursuit of his beloved Polia. The text is famous for its 172 woodcuts, its hybrid of Latin, Italian, Greek, Hebrew, Arabic, and invented language, and its exhaustive description of classical architecture and garden design. The British Library copy — the primary source for the HP marginalia project — contains Renaissance-era annotations by multiple hands, including a Hand B with systematic alchemical readings. These annotations provide evidence that contemporary readers understood HP's spatial and symbolic logic in alchemical terms, making the cross-textual links to *Atalanta Fugiens* historically grounded rather than merely associative.

---

## Related Projects

- **HP Marginalia** (`C:\Dev\hypnerotomachia polyphili\`) — Static website presenting the 1499 text, BL marginalia, and scholarship. 365 pages, 24 database tables, 431 concordance matches. This project reads from its database read-only.
- **AtalantaClaudiens** (`C:\Dev\Claudiens\`) — DH site on Maier's *Atalanta Fugiens*. Source of `atalanta.db`.

---

**Last updated:** 2026-06-29
**Status:** Deployed to GitHub Pages (enable Pages in repo settings to activate)
