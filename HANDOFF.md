# HPin3D Initial Planning: Complete Handoff

## What Has Been Created

This planning session has created a **comprehensive, character-driven project framework** for building *HPin3D: The Hypnerotomachia Poliphili as Interactive 3D World*. The project is now ready for implementation phases.

### Core Documents (Read In This Order)

1. **[README.md](README.md)** — Start here. Project overview, quick reference, file index.
2. **[VISION.md](VISION.md)** — Core vision: scope, goals, three-layer design (literary + visual + interactive).
3. **[CHARACTERS.md](CHARACTERS.md)** — How the Historian and Designer collaborate; artifact system; consultation pattern.
4. **[characters/historian.md](characters/historian.md)** — Historian expertise, constraints, communication style.
5. **[characters/designer.md](characters/designer.md)** — Designer expertise, constraints, communication style.
6. **[SCENES.md](SCENES.md)** — Scene inventory (6 critical rooms + 4 optional sites), mapped to 1499 text and marginalia.
7. **[PLAN.md](PLAN.md)** — 6-phase implementation roadmap (Planning → Prototype → Connectors → Sites → Architecture → Procession → Culmination).
8. **[STATUS.md](STATUS.md)** — Current progress, pending decisions, risk assessment, session checklist.
9. **[docs/TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md)** — Three.js data flow, scene structure, interaction model.
10. **[RESEARCH_ROADMAP.md](RESEARCH_ROADMAP.md)** — How to extract and integrate scholarship from PDFs + HP database.

### Supporting Files

- **[artifacts/DECISIONS_TEMPLATE.txt](artifacts/DECISIONS_TEMPLATE.txt)** — Template for decision logs (Historian + Designer reasoning)
- **[characters/historian.md](characters/historian.md)** and **[characters/designer.md](characters/designer.md)** — Living instruction files that evolve with project

### Project Directory Structure

```
HPin3D/
├── README.md                          # Entry point
├── VISION.md                          # Core vision
├── CHARACTERS.md                      # Character system
├── PLAN.md                            # 6-phase roadmap
├── SCENES.md                          # Scene inventory
├── STATUS.md                          # Progress tracking
├── RESEARCH_ROADMAP.md                # Scholarship integration
├── HANDOFF.md                         # This file
│
├── characters/
│   ├── historian.md                  # Historian instructions
│   ├── designer.md                   # Designer instructions
│   ├── historian_updates.log          # Will be created with updates
│   └── designer_updates.log           # Will be created with updates
│
├── artifacts/
│   ├── DECISIONS_TEMPLATE.txt         # Template for decision logs
│   ├── decisions/                     # Will contain YYYY-MM-DD_decision.txt files
│   ├── research/                      # Will contain extracts from PDFs/database
│   ├── scenes/                        # Will contain scene briefs
│   └── world_model.txt                # Will contain unified world structure doc
│
├── docs/
│   └── TECHNICAL_ARCHITECTURE.md      # Three.js implementation details
│
├── plans/                             # Phase-specific detailed plans (to be created)
├── scenes/                            # Scene design documents (to be created)
├── research/                          # Source materials & notes (to be created)
└── src/                               # Three.js code (to be created in Phase 1)
```

---

## What The Characters Are

The two characters—**the Historian** and **the Narrative Designer**—are not personas you adopt. They are:

1. **Active consulting participants** — You ask them design questions; they debate, reason, and reach decisions.
2. **Persistent modules** — Each has their own `.md` instruction file that evolves as you give them new directives.
3. **Self-correcting** — When you tell the Historian "Going forward, prioritize alchemy as the primary lens," they update their own file and acknowledge the shift.
4. **Evidence-leaving** — All design decisions are logged in `artifacts/decisions/` with both perspectives recorded.

### The Historian
- **Role**: Grounds all spatial choices in textual evidence (1499 text + BL marginalia)
- **Expertise**: Alchemical symbolism, architectural vocabulary from annotations, allegorical structure
- **Personality**: Scholarly, cautious, evidence-based
- **Approach**: "Here's what the marginalia says; here's what Russell/O'Neill argue..."

### The Narrative Designer
- **Role**: Translates historical constraints into compelling interactive space
- **Expertise**: Spatial storytelling, player agency, discovery arcs, pacing
- **Personality**: Dynamic, solution-oriented, sees constraints as creative fuel
- **Approach**: "How do we honor the history while making this playable and resonant?"

---

## Where We Are (Phase 0 Status)

### Completed
- ✓ Project vision defined (scope, goals, player experience)
- ✓ Character system designed (collaboration pattern, artifact system)
- ✓ Scene inventory created (8-12 rooms mapped to 1499 text + BL marginalia)
- ✓ Implementation roadmap outlined (6 phases with deliverables)
- ✓ Technical architecture sketched (three.js data flow, scene structure)
- ✓ Research roadmap created (how to integrate scholarship)
- ✓ Project infrastructure set up (directories, templates, documentation)

### Pending (Next Steps)

**Immediate** (This session or next):
1. [ ] **Character Consultation #1**: Historian and Designer review SCENES.md and recommend world structure (unified geography vs. hybrid portal system vs. discrete scenes)
2. [ ] **Character Consultation #2**: Prioritize initial implementation order; confirm narrative arc
3. [ ] **First Decision Log**: World structure decision documented with both characters' reasoning
4. [ ] **Database Extraction**: Export annotations, symbols, descriptions from HP database as JSON
5. [ ] **Scholarship Extraction**: Prioritize reading Russell thesis, O'Neill, and Word & Image articles for scene design

**This Week**:
1. [ ] Technical architecture detail refinement
2. [ ] Development environment setup (git repo, three.js template, build pipeline)
3. [ ] Character consultation #3: Research findings review + implications for scene design

**Phase 1** (2-3 weeks focused work):
1. [ ] Prototype Fountain of Venus scene (3D geometry, materials, lighting, audio)
2. [ ] Annotation integration (discoverable BL marginalia as environmental text)
3. [ ] Camera control system (walk, orbit, zoom)
4. [ ] Success criteria met: Playable, 15MB or less, Historian approves grounding, Designer approves experience

---

## Key Design Decisions Awaiting Character Consultation

### 1. World Structure
**Question**: How do the 6-12 scenes physically connect?

**Options**:
- **A: Unified Geography** — One coherent map; walk between rooms
- **B: Discrete Scenes** — Separate dream-like spaces; narrative transitions
- **C: Hybrid (Portal System)** — Central garden with doors leading to themed rooms

**Why it matters**: Affects player navigation, agency, sense of cohesion.

**Decision needed by**: End of this planning session

### 2. Narrative Role
**Question**: Who is the player in this world?

**Options**:
- **Poliphilia** — Player is the protagonist; first-person perspective
- **Guide** — Player accompanies Poliphilia
- **Observer** — Player interprets the spaces as scholarship

**Why it matters**: Affects dialogue, agency, emotional investment.

**Decision needed by**: Before Phase 1 prototype

### 3. Alchemical Site Discovery
**Question**: Should the 6 alchemical sites (pages 28, 42, 88, 119, 127, 164) be marked or hidden?

**Options**:
- **Marked** — Player sees signposts; discovery is still satisfying but intended
- **Hidden** — Player finds them through exploration; more agency
- **Varied** — Some marked, some hidden depending on narrative logic

**Why it matters**: Affects gameplay pacing and player agency.

**Decision needed by**: Before Phase 3 (Alchemical Sites)

### 4. Procession Pacing
**Question**: Is the procession scene player-controlled or guided?

**Options**:
- **Automatic** — Player walks; camera moves on rails to paced sequence
- **Player-controlled** — Player walks at their own pace; procession happens around them
- **Hybrid** — Player walks, but forced into procession momentum at key moments

**Why it matters**: Determines whether player feels participation or spectacle.

**Decision needed by**: Before Phase 5 (Procession)

---

## How to Invoke the Characters (From Future Sessions)

Example prompt:

> **Historian, what does the BL marginalia tell us about the Fountain of Venus scene? Should water be prominent?**
>
> **Designer, how would you pace player discovery in a fountain space? What camera angles matter?**

They will respond based on their `.md` instructions and prior decision logs. All reasoning is preserved.

Or:

> **Have the characters consult on the world structure. Historian, present the textual evidence. Designer, propose the interactive implementation.**

Both characters will engage, disagree productively if needed, and reach a decision (logged with full reasoning).

---

## If You Give The Characters New Instructions

When you add capabilities or constraints to a character:

> "Historian: Going forward, treat the procession sequence (pages 149-167) as the most important scene. It's the climax and should drive all other scene design."

The Historian will:
1. Update their own `.md` file with this instruction
2. Create a log entry: `UPDATE [date]: Procession marked as primary lens`
3. Respond acknowledging the shift: "Understood. I now prioritize pages 149-167 as the narrative apex..."

This ensures the project remains self-documenting and transparent.

---

## Research Materials at Your Disposal

### PDF Library
- **Path**: `E:\pdf\hypnerotomachia polyphili\`
- **38 PDFs** covering HP scholarship, garden design, alchemical theory, Renaissance architecture
- **Key sources**: Russell thesis, O'Neill allegory, Lefaivre architecture, Word & Image articles (1998 special issue)

### HP Database
- **Path**: `../hypnerotomachia polyphili/db/hp.db`
- **Read-only**: 24 tables, 3500+ rows
- **Key tables for HPin3D**: annotations, alchemical_symbols, woodcuts, image_readings (Phase 1 & 3), folio_descriptions

### Extraction Tools
- Use `anthropic-skills:pdf` Skill to read/extract from PDFs
- Write Python scripts to export from HP database as JSON
- All extracted data goes to `artifacts/research/` and `src/data/`

---

## Success Metrics (When Project Is Complete)

The project will be considered successful when:

1. ✓ **Playable**: One complete journey from Fountain of Venus through Culmination (~30-45 min)
2. ✓ **Scholarly**: Uses HP database and marginalia effectively; annotations surface organically
3. ✓ **Atmospheric**: Player feels wonder, transformation, and alchemy
4. ✓ **Technical**: Runs smoothly at 60 FPS; loads under 20MB; works on desktop + tablet
5. ✓ **Character-Driven**: All major decisions documented with Historian/Designer reasoning in artifacts
6. ✓ **Self-Documenting**: Any future session can read artifacts and understand *why* choices were made

---

## Things to Remember

1. **This project is complementary, not competing.** HPin3D enriches the existing HP marginalia website; doesn't replace it.

2. **Characters are persistent.** Their instructions live in `.md` files and evolve with the project. Respect their expertise.

3. **All decisions are logged.** Use the `artifacts/DECISIONS_TEMPLATE.txt` format for every significant choice. This is project discipline.

4. **Read-only to HP database.** HPin3D ingests data but never writes back. The HP database remains the source of truth.

5. **Phases have gates.** Don't start Phase N until Phase N-1 is complete. Check STATUS.md before beginning each phase.

6. **Quality over speed.** Better to have one perfect room (Fountain) than six half-finished ones. Prototype first, then scale.

7. **Historians check Designers; Designers defend Designers.** Productive tension is the goal. When they disagree, log it and decide together.

---

## Files to Review First (Recommended Reading Order)

1. **README.md** — 5 min read; orients you to the project
2. **VISION.md** — 10 min; understand the core vision
3. **SCENES.md** — 15 min; see what rooms we're building
4. **CHARACTERS.md** — 10 min; understand collaboration pattern
5. **STATUS.md** — 5 min; know where we are and what's pending

**Total: 45 min to full project comprehension**

Then, for deeper dives:
- PLAN.md for phase-by-phase breakdown
- characters/historian.md and characters/designer.md for individual expertise
- docs/TECHNICAL_ARCHITECTURE.md for implementation details
- RESEARCH_ROADMAP.md for scholarship integration strategy

---

## Next Session: Immediate Actions

When you return to HPin3D work:

1. [ ] **Read STATUS.md** — Check Phase 0 pending tasks and pending decisions
2. [ ] **Review character instructions** — Any updates since last session?
3. [ ] **Check `artifacts/decisions/`** — Are there prior decision logs to understand?
4. [ ] **Proceed to next checklist item in STATUS.md**

The project is designed to be self-explanatory and self-continuing. Every decision is documented; every question answered in the previous session carries forward.

---

## Questions?

- **"What should I work on?"** → Check STATUS.md "Pending Tasks" or PLAN.md Phase 0 checklist
- **"How do the characters work?"** → Read CHARACTERS.md + characters/historian.md + characters/designer.md
- **"What does the Historian think about X?"** → Invoke the Historian by name in a prompt; they respond based on their `.md` file + decision logs
- **"Why did we decide Y?"** → Read the decision log in `artifacts/decisions/` that documents that choice
- **"How should scene Z look?"** → SCENES.md describes it; RESEARCH_ROADMAP.md explains how to ground it in scholarship

---

## One Last Thing

This planning session has created a **deeply thoughtful, character-driven framework** for a complex, ambitious project. The Historian and Designer are not gimmicks—they represent genuine tensions between historical fidelity and interactive design that every game adaptation faces. By making them persistent, consulting participants, we ensure:

1. Every design choice is reasoned and recorded
2. Historical grounding and narrative playability are both honored
3. Future sessions can understand *why* we built what we built
4. The project grows coherently, not chaotically

**Trust the process.** The characters know their domains. The research roadmap is thorough. The technical architecture is sound. Now it's time to build.

---

**Status**: Phase 0 (Planning) complete. Ready for Phase 1 (Prototype).

**Next**: Character consultation on world structure and scene prioritization.

---

*Created: 2026-06-28*  
*Project: HPin3D (Hypnerotomachia Poliphili in 3D)*  
*Framework: Character-driven development with persistent artifact logging*
