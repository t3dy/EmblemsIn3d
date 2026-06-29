# HPin3D Implementation Plan

## Phase Structure

### Phase 0: Research & Planning (CURRENT)
**Goal**: Build comprehensive scene inventory, finalize world structure, establish character positions

**Deliverables**:
- [x] Vision document (VISION.md)
- [x] Character system (CHARACTERS.md, historian.md, designer.md)
- [ ] Scene inventory mapped to 1499 text and marginalia (SCENES.md)
- [ ] World structure decision (unified vs. hybrid vs. discrete)
- [ ] Narrative arc consensus
- [ ] Technical architecture sketch (three.js structure, data flow from HP database)
- [ ] Development environment setup

**Blockers**: None yet

**Prudent Next Steps**:
1. Characters consult on initial scene inventory and world structure
2. Review PDF scholarship to enrich scene descriptions
3. Extract specific marginalia annotations from HP database that should guide 3D design
4. Create technical brief for three.js implementation

---

### Phase 1: Prototype (Fountain of Venus)
**Goal**: Build one complete, polished scene as proof of concept

**Scene**: Fountain of Venus  
**Why first**: 
- Opens the Hypnerotomachia (sets tone and expectation)
- Relatively self-contained (not narratively complex)
- Demonstrates core mechanics: movement, environment, annotation discovery
- Can showcase water physics and atmospheric design

**Deliverables**:
- [ ] 3D fountain asset (three.js geometry, materials, lighting)
- [ ] Garden pathways leading in/out
- [ ] Atmospheric effects (water sound, garden sounds)
- [ ] 2-3 discoverable marginal annotations as environmental details
- [ ] Camera control system (walk, orbit, zoom)
- [ ] Basic interaction (click annotations to read, toggle text)

**Technical Stack**:
- Three.js for rendering
- Threaded from HP database: annotations, image data, alchemical symbols
- WebGL for performance

**Success Criteria**:
- Playable, explorable, under 15MB
- Annotations discoverable through environmental design (not told)
- Player can reach the fountain, explore around it, leave naturally
- Historian approves historical grounding
- Designer approves narrative experience

**Timeline**: 2-3 weeks of focused implementation

---

### Phase 2: Garden Connectors
**Goal**: Build the unified "ground level" that connects fountain to other rooms

**Scope**:
- Central garden area with multiple exits
- Pathways to temple, palace, procession entry
- Bridge/water feature
- Foundational architectural vocabulary (stairs, columns, gates)
- Light and shadow to guide player movement

**Deliverables**:
- [ ] Central garden map (three.js scene)
- [ ] 4-5 architectural set pieces (templum, porticus, etc.)
- [ ] Portal/door system (player walks through archway to enter specific room)
- [ ] Sound design (wind, water, distant voices)
- [ ] Lighting to establish time of day / atmosphere

**Success Criteria**:
- Feels like a real Renaissance garden (not abstract)
- Each exit signposts what's beyond (architectural style, light, sound)
- Player intuitively understands how to navigate
- Connections feel natural, not arbitrary

**Timeline**: 2-3 weeks

---

### Phase 3: Alchemical Sites (Scattered Discovery)
**Goal**: Populate the world with the sites mentioned in BL marginalia

**Sites** (from Phase 3 deep reading):
- Page 28: The bellua (elephant) — key alchemical marker
- Page 42: Unconfirmed site (TBD after historical review)
- Page 88: "Sulphure" annotation — possible planetary palace
- Page 119: Alchemical significance (TBD)
- Page 127: "Synostra Gloria mundi" + trilingual annotations
- Page 164: "Quinta Essentia"/"Chrysopheires" — culmination cluster

**Each site as a room:**
- Brief, focused environment
- One key alchemical symbol or property
- Marginal annotation discoverable
- Can be visited in any order (player agency)
- Rewards careful observation with deeper lore

**Deliverables**:
- [ ] 6 alchemical site rooms
- [ ] Connection logic (how player finds them; are they marked or hidden?)
- [ ] Annotation integration (how BL marginalia surfaces)
- [ ] Alchemical symbol logic (how symbols relate to space)

**Success Criteria**:
- Each site is distinct and memorable
- Together they tell a story about transformation
- Player feels like they're discovering scholarship, not just visiting rooms

**Timeline**: 3-4 weeks

---

### Phase 4: Architectural Complexity (Palace / Temple)
**Goal**: Build the major architectural set pieces

**Scenes**:
- Temple of Thebes (or equivalent alchemical temple)
- Palace of Polia (architectural centerpiece)
- Structures reflect Vitruvian principles noted in marginalia

**Deliverables**:
- [ ] Two large architectural spaces with interior detail
- [ ] Navigable interiors (stairs, halls, chambers)
- [ ] Symbolic decoration referencing HP's allegorical content
- [ ] Multiple points of entry/exit (supports player agency)

**Success Criteria**:
- Geometry feels classically inspired (without being pedantic)
- Interior navigation is intuitive despite complexity
- Architectural details have narrative/symbolic meaning (not just decoration)
- Performance remains solid

**Timeline**: 3-4 weeks

---

### Phase 5: Triumphal Procession (Cinematic Pacing)
**Goal**: Create the narrative climax — pages 149-167 of the 1499 text

**Challenge**: This is 95% woodcuts in the original. How do we translate that into interactive space?

**Design Approach** (TBD after character consultation):
- Linear or guided pacing (player is *part of* procession, not observing)
- Architectural space flows naturally into procession movement
- Player "becomes" part of the crowd moving through space
- Musical accompaniment (Renaissance instrumentation)
- Symbolic elements from woodcuts become environmental details

**Deliverables**:
- [ ] Procession route (quarter-mile or equivalent path)
- [ ] Rhythmic pacing (slow → fast → climactic)
- [ ] Audio design (crowd, music, instruments)
- [ ] Environmental storytelling (what's being celebrated? transformed?)
- [ ] Visual climax (arrival at destination)

**Success Criteria**:
- Player feels momentum and participation
- Experience matches the emotional arc of the text
- Historian approves symbolic fidelity
- Designer approves narrative impact

**Timeline**: 3-4 weeks

---

### Phase 6: Culmination & Endings
**Goal**: Create the final space(s) where the journey concludes

**Scope** (TBD):
- Cytherea island or throne room
- Space for reflection
- Variation based on player choices through earlier rooms
- Possible: multiple endings (alchemy-focused vs. love-focused vs. architectural)

**Deliverables**:
- [ ] Final destination scene(s)
- [ ] Variation logic (how prior choices affect ending)
- [ ] Closure experience (not literally "the end" but transformation realized)

**Success Criteria**:
- Players feel their choices mattered
- Ending is contemplative and emotionally resonant
- Connects back to opening fountain

**Timeline**: 2-3 weeks

---

## Technical Architecture (Sketch)

### Data Flow

```
db/hp.db (HP marginalia project)
    ↓
Python script: export_for_3d.py
    ↓
JSON outputs:
    - annotations.json (all annotations with folio, hand, text)
    - alchemical_symbols.json (symbols + occurrences)
    - woodcuts.json (references for visual inspiration)
    - folio_descriptions.json (detailed analyses)
    ↓
Three.js scene initialization
    ↓
HPin3D world (8-12 rooms + connectors)
```

### Scene Structure

Each room is a Three.js scene with:
- Geometry (static + maybe some animated elements)
- Materials & lighting (mood + readability)
- Annotation data (linked to spatial positions)
- Alchemical symbols (embedded as texture, object, or atmospheric effect)
- Audio (ambient + interactive)
- Camera presets (multiple viewpoints)
- Interaction handlers (click to read, toggle text, etc.)

### Data Integration Points

1. **Annotations**: Text appears in UI when player approaches specific spatial markers
2. **Alchemical symbols**: Placed in rooms corresponding to symbol_occurrences table
3. **Woodcuts**: Used as visual reference + inspiration for room design
4. **Folio descriptions**: Appear as deep-read contextual lore (optional discovery)
5. **Signature mapping**: Used to verify which scenes correspond to which pages

### Browser / Distribution

- Standalone HTML5 + three.js (no server required)
- Can be deployed as static site or GitHub Pages
- Complement to the existing HP marginalia website
- Link between website and 3D world

---

## Research Sources (Priority Reading)

### Essential
- [ ] James Russell's PhD thesis (HP marginalia focus)
- [ ] James O'Neill's Allegory of Love in Early Renaissance
- [ ] Liane Lefaivre's *Leon Battista Alberti's Hypnerotomachia Poliphili*
- [ ] HP Phase 1 & 3 image_readings (vision model analysis of BL annotations)

### Supporting
- [ ] Renaissance garden design scholarship (Word & Image journal, 1998 special issue)
- [ ] Alchemical symbols in Renaissance art
- [ ] Vitruvian principles and Renaissance architecture
- [ ] Emblematics (how Renaissance readers interpreted composite text + image)

---

## Known Unknowns / Open Questions

### Character Consultation Required
- [ ] World structure: Unified geography vs. hybrid vs. discrete scenes?
- [ ] Narrative role: Is player Poliphilia, a guide, or an observer?
- [ ] Agency depth: How much choice exists vs. guided journey?
- [ ] Tone: More mystical/allegorical or grounded/historical?

### Technical Design Required
- [ ] Performance budget (target FPS, scene size, poly count)
- [ ] Interaction model (click-to-read vs. proximity-based text)
- [ ] Audio strategy (original music, ambient soundscape, voice?)
- [ ] Accessibility (can players navigate without tutorial?)

### Historical Research Required
- [ ] Which BL annotations should be surfaced as environmental details?
- [ ] How do the marginalia's alchemical sites relate spatially?
- [ ] What's the internal logic of the procession sequence?
- [ ] How do Vitruvian proportions guide architectural design?

---

## Success Metrics (End of Project)

- **Playability**: One complete journey from fountain through to conclusion, ~30-45 min play time
- **Scholarship**: Uses HP database effectively; annotations are discoverable and meaningful
- **Atmosphere**: Player feels the wonder, transformation, and alchemy of the Hypnerotomachia
- **Technical**: Runs smoothly; loads under 20MB; works on desktop and large tablet
- **Character-Driven**: All major decisions documented in artifacts with Historian/Designer reasoning

---

## Session Checklist

At the end of each working session:

- [ ] Update `PHASESTATUS.md` with progress
- [ ] Check in with Historian and Designer (add decision log entry if major choice made)
- [ ] Commit code and documentation
- [ ] Note blockers or unknowns for next session

---

**Next**: Proceed to character consultation on world structure and initial scene inventory.
