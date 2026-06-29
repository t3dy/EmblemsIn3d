# Technical Architecture: HPin3D Three.js Implementation

## Data Flow

```
Source: HP Database (read-only)
    ↓
Step 1: Python extraction scripts (one-time setup)
    - export_annotations.py
    - export_symbols.py
    - export_woodcuts.py
    - export_folio_descriptions.py
    ↓
Step 2: JSON outputs (committed to git)
    - data/annotations.json (all BL + other copy annotations)
    - data/symbols.json (alchemical symbols + occurrences)
    - data/woodcuts.json (woodcut references + visual data)
    - data/narrative.json (folio descriptions, journey structure)
    ↓
Step 3: Three.js scene initialization
    - Load JSON at runtime
    - Position annotations in 3D space (keyed by folio + location)
    - Embed alchemical symbols as geometry / texture / atmosphere
    - Link woodcuts to scene composition
    ↓
Output: Interactive 3D world (browser)
```

## Scene Structure (Three.js)

Each room is a Three.js **Scene** with the following architecture:

```
HPin3DScene (extends THREE.Scene)
├── Geometry Layer
│   ├── Landscape (terrain, water, vegetation)
│   ├── Architecture (columns, walls, roofs, stairs)
│   ├── Decorative (sculptures, fountains, altars)
│   └── Dynamic (animated elements: water, light, etc.)
│
├── Annotation Layer
│   ├── Hotspots (invisible spheres marking where text appears)
│   ├── UI markers (subtle glyphs on screen when hovering)
│   └── Text data (linked JSON containing actual marginalia)
│
├── Symbolism Layer
│   ├── Alchemical glyphs (planetary metals as visual elements)
│   ├── Color coding (sulphur = red, mercury = silver, etc.)
│   └── Symbol positions (keyed to narrative/architectural logic)
│
├── Audio Layer
│   ├── Ambient soundscape (wind, water, etc.)
│   ├── Positional audio (sounds emanating from specific locations)
│   └── Narrative audio (music, voiceover, chanting during procession)
│
├── Lighting
│   ├── Directional (sun, moon—sets time of day)
│   ├── Point lights (torches, magical elements)
│   └── Atmospheric (fog, god rays for mood)
│
└── Camera
    ├── Default: First-person perspective (walk through space)
    ├── Orbit: Examine a focal point from multiple angles
    └── Cinematic: Paced camera for procession / culmination
```

## Interaction Model

### Player Input

**Movement**:
- WASD / Arrow keys: Walk forward/backward, strafe
- Mouse: Look around (first-person) / orbit (when examining)
- Scroll wheel: Zoom in/out

**Engagement**:
- Click on annotation hotspot: Display marginal text + source
- Hover over symbol: Display explanation (alchemy term, significance)
- Space/E key: Interact with doors, portals, transitions
- Tab: Toggle between first-person and orbit camera
- ESC: Close UI overlays

### UI Overlays

**Annotation Display**:
```
┌─────────────────────────────┐
│ BL Ms., page 28 (Hand B)   │
│                             │
│ "bellua"                    │
│                             │
│ [Elephant, key alchemical   │
│  marker indicating prima    │
│  materia undergoing trans-  │
│  formation. Russell notes   │
│  this aligns with nigredo   │
│  stage.]                    │
│                             │
│ [LEARN MORE] [CLOSE]       │
└─────────────────────────────┘
```

**Symbol Explanation**:
```
─ Alchemical Symbol: SULPHUR ─
  [Symbol image]
  
  Color: Red
  Meaning: Combustion, passion, volatile principle
  Hand B mentions on page 88: "Sulphure"
  
  In HP: Key to transformation; found in multiple sites
```

**Navigation Cue**:
```
► Exit to Garden (north archway)
◄ Return to Fountain
[Alchemical Temple entrance ahead]
```

## Database Integration Details

### Annotations Table

Schema (from HP database):
```sql
SELECT
  id, hand_id, manuscript_id, text,
  folio, confidence, annotation_type, source_method
FROM annotations
```

**HPin3D usage**:
- Filter by manuscript_id = 1 (BL copy)
- Group by folio
- Link to specific spatial locations via position metadata (TBD)

Example query result:
```json
{
  "folio": 28,
  "annotations": [
    {
      "id": 142,
      "hand_id": 2,  // Hand B
      "text": "bellua",
      "confidence": "HIGH",
      "annotation_type": "SYMBOL",
      "source": "BL Ms., page 28",
      "position_in_scene": { "x": -5.2, "y": 1.8, "z": 3.1 }  // In Alchemical Temple
    }
  ]
}
```

### Alchemical Symbols Table

Schema:
```sql
SELECT id, symbol_name, color, meaning, planetary_metal
FROM alchemical_symbols
```

**HPin3D usage**:
- Embed symbols as 3D geometry or textures
- Position according to symbol_occurrences table (which hand, which folio, which room)
- Display name + meaning on hover

Example:
```json
{
  "symbol_id": 3,
  "name": "SULPHUR",
  "color": "#CC0000",
  "meaning": "Combustion, passion, volatile principle",
  "planetary_metal": null,
  "occurrences": [
    { "folio": 88, "hand_id": 2, "scene": "planetary_palace" }
  ]
}
```

### Woodcuts Table

Schema:
```sql
SELECT id, subject, category, signature_1499, source_method
FROM woodcuts
```

**HPin3D usage**:
- Use as visual reference for scene composition
- Link woodcut images to scene descriptions
- Display as "historical reference" UI when examining related spaces

### Image Readings (Phase 1 & 3)

Schema:
```sql
SELECT folio, has_woodcut, annotation_density, raw_json
FROM image_readings WHERE manuscript_id = 1
```

**HPin3D usage**:
- Confirm which folios have woodcuts (affects scene importance)
- Check annotation density (HEAVY pages warrant more detail)
- Extract raw_json for textual references

## Scene Composition Strategy

### Each Major Room

**Template**:
```
1. REFERENCE WOODCUTS
   "Which 1499 woodcuts show this location?"
   → Use to guide architecture, props, arrangement

2. MARGINALIA EXTRACTION
   "Which BL annotations mention this folio?"
   → Surface as discoverable text in room

3. ALLEGORICAL SIGNIFICANCE
   "What does this space teach about transformation?"
   → Historian guides symbolic placement

4. GAMEPLAY SEQUENCE
   "How does player move through this space?"
   → Designer structures camera / navigation / discovery

5. MOOD DESIGN
   "What emotions should player feel?"
   → Lighting, audio, color palette, pacing
```

### Example: Fountain of Venus (Prototype)

```
REFERENCE WOODCUTS
→ Woodcuts #1-3 show a fountain in a lush landscape

MARGINALIA
→ Page 80: "Cornucopia" (abundance) + "mortem" (death)
→ Dual reading: beauty containing mortality

ALLEGORY
→ Water as life force; fountain as mirror where Poliphilia sees herself
→ Opening: first encounter with desire

GAMEPLAY
→ Player enters, free to walk around fountain
→ Can approach closely, view from distance, look up at sky
→ Annotations appear as soft glyphs near fountain (clickable)
→ Optional: deep-read on water symbolism, Renaissance fountain theory

MOOD
→ Soft light (dawn/twilight)
→ Sound: flowing water, bird calls, distant music
→ Color: greens + blues + gold
→ Pacing: slow, meditative
```

## Three.js Project Structure (Outline)

```
src/
├── index.html              # Entry point
├── main.js                 # Scene initialization, game loop
├── scenes/
│   ├── Scene.js           # Base class for all rooms
│   ├── FountainScene.js   # Fountain of Venus
│   ├── GardenScene.js     # Central hub
│   ├── TempleScene.js     # Alchemical Temple
│   ├── PalaceScene.js     # Palace of Polia
│   ├── ProcessionScene.js # Triumphal procession
│   └── ...
├── objects/
│   ├── Fountain.js        # Reusable fountain model
│   ├── Column.js          # Vitruvian column
│   ├── Door.js            # Portal / transition
│   └── ...
├── ui/
│   ├── AnnotationUI.js    # Display marginal text
│   ├── SymbolUI.js        # Display symbol info
│   ├── NavigationUI.js    # Wayfinding hints
│   └── ...
├── audio/
│   ├── SoundManager.js    # Ambient + positional audio
│   ├── sounds/            # .ogg/.mp3 files
│   └── ...
├── data/
│   ├── annotations.json   # From export scripts
│   ├── symbols.json
│   ├── woodcuts.json
│   └── narrative.json
├── shaders/
│   ├── water.glsl         # Water material
│   ├── alchemical.glsl    # Symbol glow effects
│   └── ...
├── styles/
│   └── ui.css             # UI styling
└── lib/
    └── three.r128.min.js  # Three.js library
```

## Data Export Pipeline (One-Time Setup)

Create Python scripts in `src/scripts/`:

```python
# scripts/export_annotations.py
import sqlite3
import json

db = sqlite3.connect('../hypnerotomachia polyphili/db/hp.db')
cursor = db.cursor()

cursor.execute("""
SELECT id, hand_id, manuscript_id, folio, text, annotation_type
FROM annotations
WHERE manuscript_id = 1  -- BL copy only
ORDER BY folio
""")

annotations_by_folio = {}
for row in cursor.fetchall():
    folio = row[3]
    if folio not in annotations_by_folio:
        annotations_by_folio[folio] = []
    annotations_by_folio[folio].append({
        'id': row[0],
        'hand_id': row[1],
        'text': row[4],
        'type': row[5]
    })

with open('data/annotations.json', 'w') as f:
    json.dump(annotations_by_folio, f, indent=2)
```

Similar scripts for symbols, woodcuts, narrative data.

**Run once**: `python scripts/export_annotations.py` → outputs to `src/data/`

## Performance Targets

- **Scene load time**: < 2 seconds (3-5MB each scene)
- **Frame rate**: 60 FPS (desktop), 30 FPS (tablet)
- **Total bundle size**: < 20MB (including all geometry + textures + audio)
- **Viewport**: 1920x1080 desktop, 1024x768 tablet minimum

## Browser Compatibility

- Chrome 90+ (primary)
- Firefox 88+
- Safari 14+
- Edge 90+

Uses WebGL 2.0; graceful degradation to WebGL 1.0 if needed.

## Testing Strategy

- **Unit tests**: Scene initialization, annotation loading, UI interaction
- **Integration tests**: Full scene navigation, data binding
- **Manual testing**: Walk-through of each room on desktop + tablet
- **Performance profiling**: Three.js debugging tools (DevTools, SpectorJS)

## Deployment

1. **Development**: Local dev server (e.g., `python -m http.server`)
2. **Testing**: Staging on GitHub Pages branch
3. **Production**: Main GitHub Pages deployment (under `/HPin3D/` or standalone repo)

---

## Remaining Detail Questions (For Team)

1. **Water physics**: Use Three.js built-in shaders or custom GLSL?
2. **Annotation placement**: Hard-coded in scene code or dynamically positioned from JSON metadata?
3. **Audio synchronization**: How to sync music with procession pacing?
4. **Camera automation**: For procession scene, use Tween.js for smooth pacing?
5. **Texture sourcing**: Original Renaissance art (public domain) or stylized textures?
6. **State persistence**: Does player progress carry across sessions? (Save player position?)

---

**Next**: Technical details refined during Phase 1 prototyping.
