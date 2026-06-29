# HPin3D: The Hypnerotomachia Poliphili as Interactive 3D World

**A three.js-based virtual environment exploring the gardens, architecture, and processions of Francesco Colonna's 1499 masterpiece.**

## What Is This?

HPin3D transforms the *Hypnerotomachia Poliphili* into an interactive 3D space where players walk through the allegorical gardens, temples, and scenes described in the text. Unlike a museum recreation, this is an *interpretation*: a playable scholarship that makes visible how Renaissance readers understood space, alchemy, and transformation.

Drawing on the BL marginalia (Phase 1 & 3 vision readings) and scholarly work by James Russell and James O'Neill, each room embeds historical evidence directly into the experience.

## Quick Start

### For First-Time Readers
1. Start with **[VISION.md](VISION.md)** — What are we building and why?
2. Read **[CHARACTERS.md](CHARACTERS.md)** — How the Historian and Designer collaborate
3. Browse **[SCENES.md](SCENES.md)** — What rooms/spaces are in the game?
4. Check **[PLAN.md](PLAN.md)** — How will we build it?
5. Review **[STATUS.md](STATUS.md)** — Where are we now?

### For Continuing Sessions
1. Check **[STATUS.md](STATUS.md)** — What phase are we in? What decisions are pending?
2. Read latest decision logs in `artifacts/decisions/` — Why were prior choices made?
3. Check **[characters/historian.md](characters/historian.md)** and **[characters/designer.md](characters/designer.md)** — Any updates to character instructions?
4. Proceed to relevant phase work in PLAN.md

## The Core Team

### The Historian
A scholar hybridizing James O'Neill's allegorical reading with James Russell's marginalia analysis. **Role**: Ground all spatial choices in textual evidence. **Expertise**: Alchemical symbolism, architectural vocabulary from BL annotations, literary allegory.

→ See **[characters/historian.md](characters/historian.md)**

### The Narrative Designer
A game narrative architect (Dragon Age / Witcher sensibility). **Role**: Translate historical constraints into compelling interactive space. **Expertise**: Spatial storytelling, player agency, discovery arcs.

→ See **[characters/designer.md](characters/designer.md)**

## Project Structure

```
HPin3D/
├── README.md                 # This file
├── VISION.md                # Core project vision
├── CHARACTERS.md            # Character system (how they work)
├── PLAN.md                  # 6-phase implementation strategy
├── SCENES.md                # Scene inventory (rooms mapped to 1499 text)
├── STATUS.md                # Current progress & pending decisions
│
├── characters/
│   ├── historian.md         # The Historian's instructions & expertise
│   ├── designer.md          # The Designer's instructions & expertise
│   └── *.log                # Update logs (when characters are given new instructions)
│
├── plans/                   # Phase plans & detailed specifications (TBD)
├── scenes/                  # Scene design documents (TBD)
├── artifacts/               # Decision logs, research extracts, scene briefs
│   ├── decisions/           # YYYY-MM-DD_decision_log.txt
│   ├── research/            # Extracts from PDFs and HP database
│   └── scenes/              # Brief files for each major room
│
├── research/                # Source materials & scholarship notes (TBD)
├── docs/                    # Technical documentation (TBD)
└── src/                     # Three.js source code (will exist in Phase 1)
```

## Key Concepts

### The 1499 Text
Francesco Colonna's *Hypnerotomachia Poliphili* is a hybrid of prose, poetry, and woodcuts. The hero Poliphilia journeys through allegorical gardens, temples, and architectural wonders on a quest for love and enlightenment.

### BL Marginalia
The British Library copy (used as primary source in the existing HP project) contains Renaissance-era annotations by multiple hands. **Hand B** has a systematic alchemical reading. These annotations are evidence of how readers engaged with the text's spatial and symbolic logic.

### Three Structural Layers
1. **Literary**: O'Neill's allegorical reading (journey toward self-knowledge)
2. **Visual**: Woodcuts + marginalia (how Renaissance readers saw the spaces)
3. **Interactive**: Game mechanics (how modern players experience transformation)

### Marginalia-Centered Design
Every major scene in HPin3D should incorporate annotations from the BL copy. If the Historian cites an annotation on page 28 about the "bellua" (elephant), that detail becomes visible in the Alchemical Temple room.

## Current Phase: Planning (Phase 0)

### What We've Done
- ✓ Defined project vision and scope
- ✓ Created persistent character modules (Historian & Designer)
- ✓ Mapped 1499 text to 8-12 potential 3D rooms
- ✓ Outlined 6-phase implementation strategy
- ✓ Set up project infrastructure & documentation

### What We're Doing Now
- Consulting characters on world structure (unified map vs. hybrid portal system?)
- Extracting annotations from HP database for scene design reference
- Synthesizing scholarship (Russell, O'Neill, Lefaivre) into design briefs
- Writing technical architecture (three.js scene graph, data pipeline)
- Setting up development environment

### What's Next
- Character consultation #1: World structure recommendation
- Database extraction: JSON export of annotations + symbols
- Phase 1 prototype: Fountain of Venus scene (full 3D, audio, annotation integration)

## Design Decisions (Pending)

### 1. World Structure
**Q**: How do rooms connect?

**Options**:
- **Unified geography**: One map; rooms connect via pathways (more explorable)
- **Discrete scenes**: Separate dream-like spaces; narrative transitions (more curated)
- **Hybrid**: Central garden hub with portal doors to thematic rooms (recommended)

**Status**: Awaiting Historian & Designer consultation

### 2. Narrative Role
**Q**: Is the player Poliphilia, a guide, or an observer?

**Status**: Pending character recommendation

### 3. Alchemical Site Discovery
**Q**: Should alchemical sites be marked or hidden?

**Status**: Pending character recommendation

## Critical Scenes (Core Narrative)

1. **Fountain of Venus** — Opening, discovery (PROTOTYPE SCENE)
2. **Garden Pathways** — Navigation hub, connector
3. **Alchemical Temple** — Sacred transformation space
4. **Palace of Polia** — Architectural achievement
5. **Triumphal Procession** — Climactic sequence (pages 149-167)
6. **Culmination** — Final transformation, reflection

**Optional scenes** (side discovery): Planetary Palace, Three Doors, Quinta Essentia Chamber, Valley of Caves

## Database Integration

HPin3D reads (read-only) from the existing HP marginalia database (`db/hp.db`):

- **annotations** → Displayed as contextual text when player explores spaces
- **alchemical_symbols** → Embedded in room geometry and textures
- **image_readings** (Phase 1 & 3) → Guides scene design (what BL marginal annotations say)
- **woodcuts** → Visual reference for room composition
- **folio_descriptions** → Deep-read optional lore

Data exports via Python script → JSON → Three.js scene initialization

## How the Characters Work

When you ask for design consultation:

1. **Historian speaks first** — cites textual evidence, flags anachronisms
2. **Designer responds** — proposes playable implementations, honors constraints
3. **They reach consensus or productively disagree** — both views logged
4. **Decision log entry created** — with full reasoning, alternatives considered

Example:

> **Prompt**: "How should the procession feel to the player?"
>
> **Historian**: "Pages 149-167 show Poliphilia participating in triumph. Marginalia on p.162 has 'Cantorum'/'Tonalarium'—music and singing. Russell notes this is the *completion* of her journey."
>
> **Designer**: "So the procession is linear momentum, not player choice? I propose the player walks forward automatically, but can *look around* to discover details. Audio design carries the narrative."
>
> **Decision**: The procession is MANDATORY but OBSERVATIONAL. Player agency shifts from movement to attention.

All reasoning preserved in decision logs.

## Artifact System

This project creates **persistent artifacts** that document design reasoning:

- **Decision logs** (`artifacts/decisions/`) — Major choices with Historian/Designer arguments
- **Character updates** (`characters/*.log`) — When characters are given new instructions
- **Scene briefs** (`artifacts/scenes/`) — Both perspectives on specific rooms
- **Research extracts** (`artifacts/research/`) — Quotes/data from PDFs and database

Why? Because months from now, any future session can read these artifacts and understand *why* we made each choice. The project is self-documenting.

## Success Criteria (End of Project)

- ✓ **Playable**: One complete journey from fountain → culmination (~30-45 min)
- ✓ **Scholarly**: Uses HP database effectively; marginalia surfaces organically
- ✓ **Atmospheric**: Player feels wonder, transformation, alchemy
- ✓ **Technical**: Runs smoothly; loads under 20MB; desktop + tablet compatible
- ✓ **Character-driven**: All major decisions logged with reasoning

## Related Projects

This project **complements** the existing HP marginalia website (in parent directory `../hypnerotomachia polyphili/`):

- **HP marginalia project**: Static website presenting the 1499 text, marginalia, and scholarship
- **HPin3D**: Interactive 3D interpretation of the spaces and journey described in HP

Both read from the same database; HPin3D is read-only.

## Technical Stack (Preliminary)

- **Engine**: Three.js (WebGL-based, no external dependencies beyond WebGL)
- **Data source**: Python extraction scripts → JSON
- **Database**: Read-only queries to HP SQLite database
- **Audio**: Web Audio API + royalty-free Renaissance instrument samples
- **Deployment**: Static HTML + JS, GitHub Pages or standalone

## Questions?

See the relevant doc:
- **Scope & vision** → VISION.md
- **How characters work** → CHARACTERS.md
- **Specific scene** → SCENES.md
- **Implementation phases** → PLAN.md
- **Current progress** → STATUS.md
- **Character perspective** → characters/historian.md or characters/designer.md

## File Index

| File | Purpose |
|------|---------|
| [VISION.md](VISION.md) | Core vision: scope, goals, player experience |
| [CHARACTERS.md](CHARACTERS.md) | Character system: how Historian & Designer collaborate |
| [characters/historian.md](characters/historian.md) | Historian module: expertise & instructions |
| [characters/designer.md](characters/designer.md) | Designer module: expertise & instructions |
| [PLAN.md](PLAN.md) | 6-phase implementation strategy with detailed deliverables |
| [SCENES.md](SCENES.md) | Scene inventory: rooms mapped to 1499 text & marginalia |
| [STATUS.md](STATUS.md) | Current progress, pending decisions, risk assessment |

---

**Last updated**: 2026-06-28  
**Current phase**: 0 (Planning & Research)  
**Status**: Ready for character consultation on world structure and initial prioritization

**Next step**: Historian and Designer review SCENES.md and recommend world structure. → See PLAN.md Phase 0 tasks.
