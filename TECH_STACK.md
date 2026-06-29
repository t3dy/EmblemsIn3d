# HPin3D Technical Stack

## Chosen Libraries & Rationale

### Core Rendering
- **three.js r168+** — WebGL renderer; scene graph, geometry, materials, lights
  - CDN or npm; no build step required for prototyping
  - Use ES module build (`three.module.js`)

### Animation Timeline
- **GSAP 3 (GreenSock)** — Primary animation engine for all scene choreography
  - Free tier covers non-commercial; licence clear for DH projects
  - `gsap.timeline()` lets us sync particle systems, shader uniforms, camera moves, and DOM overlays in one declarative sequence
  - ScrollTrigger plugin useful if we add scroll-driven exploration
  - **Why over Tween.js**: GSAP timelines are nested, paused, reversed, scrubbed — essential for the procession scene and per-emblem 12-second loops

- **Theatre.js** (`@theatre/core` + `@theatre/studio`) — Visual keyframe editor baked into the browser
  - Lets us tweak emblem animation timing without recompiling
  - Studio panel appears in dev mode; stripped in production
  - Integrates directly with Three.js objects and GSAP

### Post-Processing (psychedelic/alchemical effects)
From `three/examples/jsm/postprocessing/`:
- **EffectComposer** — render pipeline
- **UnrealBloomPass** — glow for Sol/Luna glyphs, gold light in rubedo scenes
- **FilmPass** — grain + scanlines for aged-document aesthetic
- Custom GLSL shaders:
  - `AlchemicalGlow.glsl` — pulsing symbol highlight (sigmoid wave)
  - `WhiteningPass.glsl` — albedo progression (desaturate + lighten over time)
  - `MorphShader.glsl` — hermaphrodite gender interpolation (Emblems XXXIII–XXXVIII)

### Particles
- **three.quarks** — GPU particle system for Three.js (MIT licence)
  - Distillation plumes, decay swarms, life-force transfer streams
  - JSON-exportable; editor available
  - Alternatively: custom `GPUComputationRenderer` shader if quarks too heavy

### 2D Woodcut Animation
- **PixiJS 8** — 2D WebGL renderer for the animated woodcut overlay layer
  - Sits in a canvas *below* the Three.js canvas (CSS stacking)
  - Uses **GSAP PixiPlugin** for synchronized timing
  - Woodcut JPGs sliced into layers: sky / midground / figure / foreground / text
  - Parallax, colour-tint, dissolve between layers
  - No SVG vectorisation required — raster layers work with perspective transform

- **Paper.js** — Optional; if we want procedural ink/line growth effects on woodcut surfaces

### Audio
- **Tone.js** — Generative/synthesised audio engine
  - Build procedural fugue voices that respond to animation state (not just play MP3s)
  - Planetary tones modelled as oscillators with alchemical frequency ratios
  - Synthesise the three-voice fugue texture programmatically (Atalanta Fugiens has known fugal modes per Wescott)
- **Howler.js** — Sample playback for ambient soundscapes (water, fire, wind, crowd)
  - Spatial audio for HP garden hub (positional sound from fountain, temple, etc.)

### State Management
- **Zustand** (tiny, 1 kB) — Game state: current world, emblem visited, paths taken, alchemical stage unlocked
  - Persists to localStorage for cross-session continuity
  - Drives ending variation logic

### Build & Dev
- **Vite 5** — Build pipeline
  - `vite --open` for instant HMR on Three.js changes (no full reload)
  - `vite build` for static output deployable to GitHub Pages
  - Handles GLSL imports via `vite-plugin-glsl`

### Data Pipeline
- Python 3.11 scripts in `scripts/`
  - `enrich_emblems.py` — populate `alchemical_stage`, `visual_elements`, `animation_hints` in atalanta.db
  - `export_for_3d.py` — export both DBs to `src/data/emblems.json` + `src/data/hp_symbols.json`
- Run once before build; outputs committed to repo

---

## Package.json (Vite project)

```json
{
  "name": "hpin3d",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "enrich": "python scripts/enrich_emblems.py",
    "export-data": "python scripts/export_for_3d.py"
  },
  "dependencies": {
    "three": "^0.168.0",
    "gsap": "^3.12.5",
    "@theatre/core": "^0.7.1",
    "@theatre/studio": "^0.7.1",
    "three.quarks": "^0.11.0",
    "pixi.js": "^8.3.0",
    "tone": "^14.7.77",
    "howler": "^2.2.4",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "vite": "^5.3.1",
    "vite-plugin-glsl": "^1.3.1"
  }
}
```

---

## Architecture Diagram

```
Browser
├── Three.js canvas (3D world)
│   ├── EffectComposer (bloom, film grain, custom passes)
│   ├── Scene Graph
│   │   ├── HP World (6–12 rooms, connected garden)
│   │   └── AF World (51 emblem scenes, gallery)
│   ├── GSAP timelines (per-scene choreography)
│   └── Theatre.js (dev: visual editor; prod: stripped)
│
├── PixiJS canvas (2D woodcut overlay, below Three.js)
│   └── GSAP PixiPlugin (synced timing)
│
├── Tone.js (generative fugue audio)
├── Howler.js (ambient soundscape samples)
│
└── Zustand store (game state → localStorage)
    ├── currentWorld: 'HP' | 'AF' | 'ARCHIVES'
    ├── currentRoom: string
    ├── visitedEmblems: Set<number>
    ├── unlockedStage: 'NIGREDO' | 'ALBEDO' | 'CITRINITAS' | 'RUBEDO'
    └── annotationsRead: Set<string>

Data Flow:
  atalanta.db + hp.db
       ↓ Python scripts
  src/data/emblems.json
  src/data/hp_symbols.json
  src/data/hp_annotations.json
       ↓ Vite imports
  Three.js scene init
```

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Frame rate (desktop) | 60 FPS |
| Frame rate (tablet) | 30 FPS |
| Scene load time | < 2 s |
| Total bundle (gzipped) | < 25 MB |
| Three.js geometry per scene | < 50k triangles |
| Particle count per scene | < 20,000 |
| Post-processing passes | ≤ 3 active at once |

---

## Dev Environment Setup

```bash
# In C:\Dev\HPin3D
npm create vite@latest src -- --template vanilla
cd src
npm install three gsap @theatre/core @theatre/studio three.quarks pixi.js tone howler zustand
npm install -D vite-plugin-glsl

# Populate DB and export JSON
npm run enrich       # Python: enriches atalanta.db with stages/elements
npm run export-data  # Python: exports both DBs to src/data/

# Start dev server
npm run dev
```
