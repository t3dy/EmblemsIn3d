# HPin3D Complete Project Index

## 📍 You Are Here

**HPin3D: The Hypnerotomachia Poliphili as Interactive 3D World**  
**Status**: Phase 0 (Planning) Complete. Ready for Phase 1 Prototype.  
**Created**: 2026-06-28  
**Framework**: Character-driven development with persistent artifact logging

---

## 🚀 Quick Start (Choose Your Entry Point)

### If This Is Your First Time
1. **Start here**: [README.md](README.md) — 5 min overview
2. **Then read**: [VISION.md](VISION.md) — 10 min core vision
3. **Then explore**: [SCENES.md](SCENES.md) — 20 min see the world
4. **Then understand**: [CHARACTERS.md](CHARACTERS.md) — 15 min how we work

**Total: 50 min to full project comprehension**

### If You've Worked On This Before
1. Check: [STATUS.md](STATUS.md) — Where are we? What's pending?
2. Review: `artifacts/decisions/` — Any new decision logs since last session?
3. Check: `characters/historian.md` and `characters/designer.md` — Any updates?
4. Proceed: See "Next Steps" in STATUS.md

### If You Need Something Specific
- **"What's the project about?"** → [VISION.md](VISION.md)
- **"What rooms are we building?"** → [SCENES.md](SCENES.md)
- **"What's the plan?"** → [PLAN.md](PLAN.md)
- **"How do the characters work?"** → [CHARACTERS.md](CHARACTERS.md)
- **"Where are we now?"** → [STATUS.md](STATUS.md)
- **"What's the technical approach?"** → [docs/TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md)
- **"Complete handoff guide?"** → [HANDOFF.md](HANDOFF.md)
- **"Project summary?"** → [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

---

## 📚 Document Guide (What Each File Contains)

### Navigation & Context (Read First)
| File | Purpose | Length |
|------|---------|--------|
| [README.md](README.md) | Project overview, quick reference, file index | 5 min |
| [INDEX.md](INDEX.md) | This file — complete navigation guide | 3 min |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Session summary: what was created, what's pending | 10 min |
| [HANDOFF.md](HANDOFF.md) | Complete handoff guide: use after this session | 15 min |

### Vision & Strategy (Read Second)
| File | Purpose | Length |
|------|---------|--------|
| [VISION.md](VISION.md) | Core project vision: scope, goals, three-layer design | 10 min |
| [CHARACTERS.md](CHARACTERS.md) | Character system: how Historian & Designer collaborate | 15 min |
| [STATUS.md](STATUS.md) | Current progress, pending decisions, risk assessment | 5 min |

### Design & Implementation
| File | Purpose | Length |
|------|---------|--------|
| [SCENES.md](SCENES.md) | Scene inventory: 6 critical + 4 optional rooms mapped to text/marginalia | 20 min |
| [PLAN.md](PLAN.md) | 6-phase implementation roadmap with detailed deliverables | 20 min |
| [RESEARCH_ROADMAP.md](RESEARCH_ROADMAP.md) | How to extract and integrate scholarship from PDFs + database | 15 min |
| [docs/TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md) | Three.js data flow, scene structure, interaction model | 20 min |

### Character Modules (Living Documents)
| File | Purpose | Updates |
|------|---------|---------|
| [characters/historian.md](characters/historian.md) | Historian expertise, constraints, communication style, knowledge state | Will evolve |
| [characters/designer.md](characters/designer.md) | Designer expertise, constraints, communication style, design thinking | Will evolve |

### Templates & Artifacts
| File | Purpose |
|------|---------|
| [artifacts/DECISIONS_TEMPLATE.txt](artifacts/DECISIONS_TEMPLATE.txt) | Template for logging design decisions with both character perspectives |

---

## 🎯 Core Sections by Topic

### "What Are We Building?"
1. [VISION.md](VISION.md) — Core vision and scope
2. [SCENES.md](SCENES.md) — Specific rooms and scenes
3. [PLAN.md](PLAN.md) → Phase 1 description (Fountain prototype)

### "How Do We Make Decisions?"
1. [CHARACTERS.md](CHARACTERS.md) — Character consultation system
2. [characters/historian.md](characters/historian.md) — Historian perspective
3. [characters/designer.md](characters/designer.md) — Designer perspective
4. [artifacts/DECISIONS_TEMPLATE.txt](artifacts/DECISIONS_TEMPLATE.txt) — Decision log format

### "What's Our Implementation Strategy?"
1. [PLAN.md](PLAN.md) — 6-phase roadmap
2. [docs/TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md) — Three.js approach
3. [RESEARCH_ROADMAP.md](RESEARCH_ROADMAP.md) — Scholarship integration

### "Where Are We Now & What's Next?"
1. [STATUS.md](STATUS.md) — Current progress
2. [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) — What was created this session
3. [HANDOFF.md](HANDOFF.md) — How to proceed next session

---

## 📋 Complete File Tree

```
C:\Dev\HPin3D/
│
├── 📖 DOCUMENTATION FOUNDATION (Read These First)
│   ├── INDEX.md                        ← You are here
│   ├── README.md                       ← Start here if new
│   ├── PROJECT_SUMMARY.md              ← What was created this session
│   ├── HANDOFF.md                      ← Complete session handoff
│   │
│   ├── 🎯 CORE VISION & STRATEGY
│   ├── VISION.md                       ← Core project vision
│   ├── CHARACTERS.md                   ← Character collaboration system
│   ├── STATUS.md                       ← Progress & pending decisions
│   │
│   ├── 🎮 DESIGN SPECIFICATIONS
│   ├── SCENES.md                       ← Scene inventory (rooms mapped to text/marginalia)
│   ├── PLAN.md                         ← 6-phase implementation roadmap
│   ├── RESEARCH_ROADMAP.md             ← Scholarship integration strategy
│   │
│   └── 💻 TECHNICAL SPECIFICATIONS
│       └── docs/
│           └── TECHNICAL_ARCHITECTURE.md  ← Three.js data flow & scene structure
│
├── 🎭 CHARACTER MODULES (Living Documents - Will Evolve)
│   └── characters/
│       ├── historian.md                ← Historian expertise & instructions
│       ├── designer.md                 ← Designer expertise & instructions
│       ├── historian_updates.log       ← Historian change log (created on updates)
│       └── designer_updates.log        ← Designer change log (created on updates)
│
├── 📦 ARTIFACTS & DECISION LOGS (Will Grow)
│   └── artifacts/
│       ├── DECISIONS_TEMPLATE.txt      ← Template for decision logs
│       ├── decisions/                  ← Decision logs: YYYY-MM-DD_*.txt
│       ├── research/                   ← Research extracts from PDFs/database
│       └── scenes/                     ← Scene briefs with historian/designer analysis
│
└── 📁 DEVELOPMENT FOLDERS (To Be Created in Phase 1+)
    ├── plans/                          ← Phase-specific detailed plans
    ├── scenes/                         ← Scene design documents
    ├── research/                       ← Source materials & notes
    └── src/                            ← Three.js source code (Phase 1+)
```

---

## 📖 Reading Recommendations by Role

### If You're The Historian
1. [CHARACTERS.md](CHARACTERS.md) → Understand the character system
2. [characters/historian.md](characters/historian.md) → Your role, expertise, and instructions
3. [SCENES.md](SCENES.md) → See scenes mapped to 1499 text + BL marginalia
4. [RESEARCH_ROADMAP.md](RESEARCH_ROADMAP.md) → Your research priorities
5. [artifacts/DECISIONS_TEMPLATE.txt](artifacts/DECISIONS_TEMPLATE.txt) → How to log decisions

### If You're The Narrative Designer
1. [CHARACTERS.md](CHARACTERS.md) → Understand the character system
2. [characters/designer.md](characters/designer.md) → Your role, expertise, and instructions
3. [PLAN.md](PLAN.md) → The 6-phase roadmap and Phase 1 prototype goals
4. [docs/TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md) → Three.js approach
5. [SCENES.md](SCENES.md) → See scenes and think about player experience

### If You're The Developer
1. [docs/TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md) → Technical approach
2. [PLAN.md](PLAN.md) → Phase 1 deliverables (Fountain prototype)
3. [SCENES.md](SCENES.md) → What the Fountain scene contains
4. [RESEARCH_ROADMAP.md](RESEARCH_ROADMAP.md) → Data sources and integration
5. [STATUS.md](STATUS.md) → Development checklist

### If You're New to Everything
1. [README.md](README.md) → Project overview (5 min)
2. [VISION.md](VISION.md) → Core vision (10 min)
3. [CHARACTERS.md](CHARACTERS.md) → How we work together (15 min)
4. [SCENES.md](SCENES.md) → What we're building (20 min)
5. [PLAN.md](PLAN.md) → Implementation strategy (20 min)

---

## 🔑 Key Concepts

### The Three-Layer Design
1. **Literary** — O'Neill's allegorical reading (journey toward enlightenment)
2. **Visual** — Woodcuts + marginalia (how Renaissance readers saw spaces)
3. **Interactive** — Game mechanics (how modern players experience transformation)

### The Two Characters
- **Historian** — Grounds everything in textual evidence, flags anachronisms
- **Designer** — Translates constraints into compelling interactive experience
- Both are persistent, self-updating modules that evolve with the project

### Marginalia-Centered Design
- BL annotations are primary evidence of how readers understood the text
- Pages 28, 42, 88, 119, 127, 164 are alchemical marker sites
- Every major scene should incorporate discoverable annotations

### The Six Critical Rooms
1. **Fountain of Venus** — Opening (prototype scene)
2. **Garden Pathways** — Navigation hub
3. **Alchemical Temple** — Transformation space
4. **Palace of Polia** — Architectural achievement
5. **Triumphal Procession** — Climactic sequence
6. **Culmination** — Final transformation

---

## ⚡ Quick Reference: Pending Decisions

| Decision | Question | Options | Needed By |
|----------|----------|---------|-----------|
| **World Structure** | How do rooms connect? | Unified / Discrete / Hybrid (portal) | End of Phase 0 |
| **Narrative Role** | Who is the player? | Poliphilia / Guide / Observer | Before Phase 1 |
| **Alchemical Sites** | Marked or hidden? | Marked / Hidden / Varied | Before Phase 3 |
| **Procession Pacing** | Auto or player-controlled? | Automatic / Controlled / Hybrid | Before Phase 5 |

→ See STATUS.md for full details

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| Core documentation files | 10 |
| Character modules | 2 |
| Technical specifications | 1 |
| Templates | 1 |
| Total files created this session | 14 |
| Estimated total words | ~50,000 |
| Estimated reading time (all docs) | ~3 hours |
| Folders created | 7 (documents/ + artifacts/ + characters/ + docs/ + plans/ + scenes/ + research/ + src/) |

---

## 🎓 Learning the System

### Understand The Characters
- Read [CHARACTERS.md](CHARACTERS.md) (15 min)
- Read [characters/historian.md](characters/historian.md) (15 min)
- Read [characters/designer.md](characters/designer.md) (15 min)
- Then invoke them by name in a prompt for consultation

### Understand The Scenes
- Read [SCENES.md](SCENES.md) (20 min)
- Then read scholarship sources (Russell, O'Neill, Lefaivre) to see evidence
- Then propose scene designs and watch characters debate

### Understand The Process
- Read [CHARACTERS.md](CHARACTERS.md) (collaboration pattern)
- Read [artifacts/DECISIONS_TEMPLATE.txt](artifacts/DECISIONS_TEMPLATE.txt) (logging format)
- Make first design decision and log it with both character perspectives

### Understand The Technical Approach
- Read [docs/TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md) (20 min)
- Then read [PLAN.md](PLAN.md) Phase 1 description (Fountain prototype)
- Then start Phase 1 development

---

## 🚀 How To Proceed (Next Steps)

### Immediate (This Session)
1. [ ] **Character Consultation #1** → World structure recommendation
2. [ ] **First Decision Log** → Record world structure choice with both perspectives
3. [ ] **Database Extraction** → Export annotations, symbols from HP database

### This Week
1. [ ] **Scholarship Extraction** → Key passages from Russell, O'Neill, Lefaivre
2. [ ] **Character Consultation #2** → Research review + scene design implications
3. [ ] **Development Setup** → Three.js project skeleton

### Phase 1 (2-3 weeks)
1. [ ] **Build Fountain Scene** → Complete 3D room with annotations
2. [ ] **Test & Iterate** → Historian approves grounding, Designer approves experience
3. [ ] **Proof of Concept** → Demonstrate viability of full 6-room project

---

## ✅ Success Checklist (End of Project)

- [ ] **Playable** — Complete journey from fountain to culmination (~30-45 min)
- [ ] **Scholarly** — Uses HP database; marginalia surfaces meaningfully
- [ ] **Atmospheric** — Player feels wonder, transformation, and alchemy
- [ ] **Technical** — 60 FPS, under 20MB, desktop + tablet compatible
- [ ] **Character-Driven** — All decisions logged with Historian/Designer reasoning
- [ ] **Self-Documenting** — Future sessions can understand project logic completely

---

## 🔗 Important Links & References

### Within This Project
- HP Database (read-only): `../hypnerotomachia polyphili/db/hp.db`
- HP Website: `../hypnerotomachia polyphili/site/`
- HP Project PHASESTATUS: `../hypnerotomachia polyphili/PHASESTATUS.md`

### External Resources
- PDF Library: `E:\pdf\hypnerotomachia polyphili\` (38 PDFs)
- Three.js Documentation: https://threejs.org/docs/
- WebGL Specification: https://www.khronos.org/webgl/

---

## 💡 Philosophy of This Project

This is not a traditional game development project where designers make decisions and devs execute. Instead:

**This is a character-driven, evidence-based, self-documenting framework where historical scholarship and interactive design push on each other productively.**

The Historian doesn't limit the Designer. The Designer doesn't compromise historical grounding. Instead, they collaborate to find the most resonant, grounded, and playable interpretation of the Hypnerotomachia.

Every decision is logged. Every choice is reasoned. The project is transparent to future sessions.

---

## 📞 Questions?

- **"Where should I start?"** → Read [README.md](README.md)
- **"What are we building?"** → Read [VISION.md](VISION.md) + [SCENES.md](SCENES.md)
- **"How do the characters work?"** → Read [CHARACTERS.md](CHARACTERS.md)
- **"What's next?"** → Check [STATUS.md](STATUS.md)
- **"Complete overview?"** → Read [HANDOFF.md](HANDOFF.md)
- **"Where's the code?"** → Will be created in Phase 1 (in `src/`)
- **"Why this approach?"** → Read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) "One Perspective Shift"

---

## 📍 Navigation Tips

- Use **[INDEX.md](INDEX.md)** (this file) as your navigation hub
- Use **[STATUS.md](STATUS.md)** to know what's pending
- Use **[HANDOFF.md](HANDOFF.md)** at the end of a session to prepare for the next
- Use **`artifacts/decisions/`** to see what was decided and why
- Use character `.md` files to understand their current expertise and instructions

---

**Created**: 2026-06-28  
**Status**: Phase 0 (Planning) Complete  
**Next Phase**: Phase 1 (Prototype) — Ready to Begin  
**Framework**: Character-driven development with persistent artifact logging

**Welcome to HPin3D.**

---

*For a complete orientation, start with [README.md](README.md) (5 min) → [VISION.md](VISION.md) (10 min) → [CHARACTERS.md](CHARACTERS.md) (15 min).*

*Then proceed to [STATUS.md](STATUS.md) to see immediate next steps.*
