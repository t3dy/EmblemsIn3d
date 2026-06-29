# HPin3D: The Hypnerotomachia Poliphili as Interactive Virtual World

## Core Vision

Transform Francesco Colonna's 1499 *Hypnerotomachia Poliphili* into an explorable three.js-based 3D environment that makes visible the alchemical, architectural, and processional spaces described and illustrated in the text. 

This is not a literal recreation of the printed book, but an *interpretation*—a playable scholarship that lets users:
- Walk through gardens, temples, and alchemical sites described in the marginalia and prose
- Experience the rhythm and sequencing of processions
- Discover how Renaissance alchemical theory shaped space and sight
- Understand architectural principles through embodied movement
- Uncover connections between the rare-book scholarship (Russell, O'Neill, Lefaivre) and the actual visual/spatial logic of the work

## Project Scope

**What We're Building:**
- 8-12 interconnected "rooms" (major scenes from HP): Fountain of Venus, Alchemical Temple, Triumphal Procession, Palace of Polia, Bridge of Trophies, etc.
- Three.js scene graph with period-accurate architectural vocabulary (drawn from Vitruvius citations in the BL marginalia)
- Narrative pathways driven by the processions and alchemical sequence
- Integration with the HP database (images, annotations, woodcut references)
- A space that grows organically as we add scenes

**What We're NOT Building:**
- A game engine (though it could become one)
- A literal 3D scan of the 1499 book pages
- Complete historical accuracy (this is an interpretation)
- A second website (this is a complementary experience, not a replacement)

## Key Collaborators (Character Modules)

### The Historian (O'Neill-Russell Hybrid)
A scholar who synthesizes James O'Neill's allegorical/literary reading with James Russell's marginalia-centered approach. Reads the BL annotations as primary evidence of how Renaissance readers understood space and alchemy in HP. 

**Expertise:**
- Hand B's alchemical annotations (pages 28, 42, 88, 119, 127, 164)
- Architectural vocabulary in marginalia (Vitruvius, proportio, obelisco)
- Symbol systems (planets, cinnabar, hermaphrodite)
- Literary/allegorical structure (Poliphilia's journey as stages of transformation)

### The Narrative Designer (Dragon Age / Witcher sensibility)
A game narrative architect who understands how to translate historical and literary material into interactive space. Thinks about pacing, discovery, agency, and emotional arcs. Takes historical constraints as creative opportunities, not limitations.

**Expertise:**
- Scene composition and sequencing
- Player agency and narrative branching
- Spatial storytelling (what the player sees drives understanding)
- Tone and atmosphere (balancing historical reverence with playable magic)
- Architectural rhythm (how to pace movement through rooms)

## Artifacts and Self-Correction

Both characters are designed to:
1. **Leave decision logs** in `artifacts/` explaining their reasoning
2. **Respond to direct instruction** — when you add capabilities/constraints in a prompt, they update their own instructions and log the change
3. **Challenge each other** — the Historian checks the Designer's interpretations against the text; the Designer pushes back on anachronistic or unplayable ideas
4. **Remain persistent** — each session updates their context based on prior artifacts

## Structural Decisions (TBD)

**Unified World vs. Discrete Scenes:**
- **Option A**: One coherent geography where all rooms connect via garden pathways, roads, and water flows
- **Option B**: Discrete "dream scenes" that connect thematically but not spatially (fragmented like a dream)
- **Option C**: Hybrid — a ground-level garden that contains portals/doors to themed rooms

The characters will recommend and defend positions.

## Database Integration

This project reads from the existing HP database (`db/hp.db`):
- `matches` → reference to woodcut illustrations for scene design
- `image_readings` (Phase 1) → what the BL copy shows
- `annotations` → marginalia commentary on architecture, alchemy, symbolism
- `folio_descriptions` → detailed scholarly analysis of key pages
- `woodcuts` → historical visual reference for scenes
- `alchemical_symbols` → system to embed in the world

No data flows back to the HP database. HPin3D is read-only.

## Research Pipeline

1. **Scene Inventory** → Map HP's major locations/processions/symbolic spaces
2. **Source Reading** → O'Neill thesis, Russell's marginalia analysis, garden studies
3. **Spatial Logic** → How does each scene relate allegorically and architecturally?
4. **3D Prototyping** → Build one complete scene (e.g., Fountain of Venus) as proof of concept
5. **Iteration** → Add scenes in order of narrative/alchemical significance

## Session Discipline

- At the end of each session, both characters update their logs in `artifacts/`
- Each major decision is documented with alternatives considered
- Code changes are accompanied by character reflection on narrative/historical implications
- PHASESTATUS-style tracking in the project root

---

**Next Step**: Characters review this vision and propose initial scene inventory and world-structure recommendation.
