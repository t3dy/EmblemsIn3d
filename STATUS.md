# HPin3D Status & Progress

> Created: 2026-06-28  
> Current Phase: 0 (Planning & Research)

## Project Snapshot

| Aspect | Status | Details |
|--------|--------|---------|
| Vision document | ✓ COMPLETE | VISION.md defines project scope and goals |
| Character system | ✓ COMPLETE | Characters defined (Historian & Designer) with individual modules |
| Scene inventory | ✓ COMPLETE | SCENES.md maps 1499 text to potential 3D rooms |
| Planning document | ✓ COMPLETE | PLAN.md outlines 6-phase implementation strategy |
| Database research | IN PROGRESS | Need to extract annotations, symbols, descriptions for design reference |
| Technical architecture | PENDING | Sketch created; needs detail (three.js structure, data pipeline) |
| Character consultation | PENDING | Characters to review scenes and recommend world structure |
| Development environment | NOT STARTED | Three.js project setup, build pipeline, testing framework |

---

## Phase 0 Progress (Planning & Research)

### Completed Deliverables

- [x] **VISION.md** — Core project vision (transform HP into 3D interactive space)
- [x] **CHARACTERS.md** — Character system (how Historian & Designer collaborate)
- [x] **characters/historian.md** — Historian module (O'Neill-Russell hybrid, marginalia-focused)
- [x] **characters/designer.md** — Narrative Designer module (Dragon Age/Witcher sensibility)
- [x] **PLAN.md** — 6-phase implementation roadmap (Prototype through Culmination)
- [x] **SCENES.md** — Scene inventory (critical scenes + optional sites, mapped to 1499 text & marginalia)
- [x] **STATUS.md** — This file (project progress tracking)
- [ ] **RESEARCH.md** — Extracted key quotes/data from PDF library (in progress)

### Pending Phase 0 Tasks

- [ ] **Character consultation #1**: Review SCENES.md; recommend world structure (unified vs. hybrid vs. discrete)
- [ ] **Character consultation #2**: Prioritize initial scenes for prototype; confirm narrative arc
- [ ] **Database extraction**: Export annotations, alchemical symbols, descriptions as JSON for 3D reference
- [ ] **Scholarship summary**: Extract key insights from Russell, O'Neill, Lefaivre on space/alchemy/architecture
- [ ] **Technical architecture**: Write three.js data flow, scene structure, interaction model
- [ ] **Development environment setup**: Git repo, three.js template, build pipeline
- [ ] **First decision log**: Document world structure decision with Historian/Designer reasoning

---

## Character Status

### The Historian
- **State**: Initialized with O'Neill-Russell framework
- **Expertise**: Marginalia analysis, alchemical symbolism, architectural vocabulary from BL annotations
- **Current assignment**: Review SCENES.md and comment on textual grounding; recommend which scenes are most historically significant
- **Next step**: Character consultation on world structure

### The Narrative Designer
- **State**: Initialized with Dragon Age/Witcher sensibilities
- **Expertise**: Spatial storytelling, player agency, discovery arcs, pacing
- **Current assignment**: Review SCENES.md and propose player journey; defend narrative choices
- **Next step**: Character consultation on interactive structure

---

## Key Decisions Pending

### 1. World Structure
**Question**: How do the 6-12 scenes connect?

**Options**:
- **A: Unified Geography** — One coherent map; rooms connect via pathways
  - Pro: Explorable, player can backtrack
  - Con: Renaissance spaces may not fit realistic geography
  
- **B: Discrete Dream Scenes** — Separate rooms; narrative transitions between them
  - Pro: Each room perfectly composed; respects dreamlike HP structure
  - Con: Less agency; more linear experience
  
- **C: Hybrid (Preferred by Designer)** — Central garden hub with rooms accessible via portals/doors
  - Pro: Best of both; coherent yet thematic
  - Con: Requires careful door design

**Status**: PENDING character recommendation

---

### 2. Narrative Flow
**Question**: Is the player following Poliphilia's journey, or experiencing it as interpretation?

**Decision needed**: Character consultation on role-play framework

---

### 3. Alchemical Site Discovery
**Question**: Should alchemical sites (pages 28, 42, 88, etc.) be marked or hidden?

**Decision needed**: Character consultation on player agency

---

### 4. Audio Centrality
**Question**: How important is music/sound design (especially for procession scene)?

**Decision needed**: Character consultation on budget/priority

---

## Known Constraints & Risks

### Constraints
1. **Read-only to HP database**: No writes back; 3D scenes must ingest data, not modify it
2. **Web-based**: Must run in browser via three.js (no proprietary engines)
3. **Proof-of-concept first**: Fountain scene must demonstrate viability before full build-out

### Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Three.js performance (12 large scenes in browser) | HIGH | Start with lean geometry; optimize as we build prototype |
| Audio / music licensing | MEDIUM | Use royalty-free Renaissance instrument packs or original composition |
| Historical accuracy vs. playability trade-off | MEDIUM | Historian-Designer collaboration ensures both are honored |
| Scope creep (games are hard) | MEDIUM | Strict phase gate discipline; no feature beyond current phase |
| Character updates getting out of sync | LOW | Artifact logs track all changes; easy to reconcile |

---

## Roadmap: What's Next

### Immediate (This Session)
1. **Character consultation #1** — Scenes review
2. **Database extraction** — JSON export of annotations, symbols, descriptions
3. **Decision log #1** — World structure recommendation + reasoning
4. **RESEARCH.md** — Scholarship synthesis

### This Week
1. Technical architecture detail (three.js structure, data pipeline)
2. Development environment setup
3. First code skeleton (three.js scene graph, navigation, annotation system)

### Phase 1 Prototype (2-3 weeks)
1. Fountain of Venus scene (full model, materials, lighting, audio)
2. First annotation integration (discoverable text)
3. Camera control (walk, orbit, examine)
4. Success: Historian approves grounding, Designer approves experience

---

## Session Discipline

**At the end of each session**, update this STATUS.md with:
- [ ] Progress against checklist
- [ ] New decision logs created (in `artifacts/`)
- [ ] Character updates (new instructions? Stance shifts?)
- [ ] Blockers or unknowns for next session
- [ ] Code commits (if any)

---

## Artifacts Archive

### Decision Logs (Historian + Designer reasoning)
- Location: `artifacts/decisions/`
- Format: `YYYY-MM-DD_[decision-title]_log.txt`

### Character Updates
- Location: `characters/[historian|designer]_updates.log`
- Format: Append-only; each update timestamped

### Scene Briefs
- Location: `artifacts/scenes/[scene_name]_brief.txt`
- Format: Both characters' analysis of specific room

### Research Extracts
- Location: `artifacts/research/`
- Contents: Quotes, data, analysis from PDF library + HP database

---

## Links to Core Documents

- **VISION.md** — Project vision (scope, goals, player experience)
- **CHARACTERS.md** — How characters work and collaborate
- **PLAN.md** — 6-phase implementation strategy
- **SCENES.md** — Scene inventory with marginalia mapping
- **../hypnerotomachia polyphili/SYSTEM.md** — HP database architecture (read-only source)
- **../hypnerotomachia polyphili/PHASESTATUS.md** — HP project's current state (reference for context)

---

## Contact / Questions

This is a living planning document. As work progresses:
- Characters update their own `.md` files
- Major decisions are logged in `artifacts/decisions/`
- This STATUS.md is updated weekly
- No decisions are lost; all reasoning is preserved

**The goal**: A project where even months from now, any future session can read the artifacts and understand *why* we made each choice.

---

**Next action**: Proceed to character consultation on SCENES.md and world structure.
