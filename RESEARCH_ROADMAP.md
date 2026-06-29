# Research Roadmap: Scholarship Integration

## Objective

Synthesize key insights from the PDF library and HP database into scene design briefs. This roadmap ensures that HPin3D's rooms are grounded in genuine scholarship, not invented interpretations.

## Research Sources

### Primary Scholarship (Must Read)

| Source | Author | Relevance | Status |
|--------|--------|-----------|--------|
| **PhD Thesis: Hypnerotomachia Polyphili** | James Russell | Marginalia analysis (Hand B alchemical reading); foundational for our interpretation | [ ] Extract key passages |
| **The Allegory of Love in the Early Renaissance** | James Calum O'Neill | Allegorical/literary reading; journey as transformation | [ ] Extract key passages |
| **Leon Battista Alberti's Hypnerotomachia Poliphili** | Liane Lefaivre | Architectural and Renaissance urbanism; spatial logic | [ ] Extract key passages |
| **Word & Image Vol. 14 (1998 Special Issue)** | Multiple (Hunt, Leslie, Temple, Griggs, Curran, Bury) | Garden design, architecture, Egyptian influences, topography | [ ] Survey all 7 articles |

### Supporting Materials

| Source | Author | Focus | Status |
|--------|--------|-------|--------|
| Untangling the Knot: Garden Design | (Unknown) | Specific to garden scenes and Renaissance horticultural theory | [ ] Read |
| A Narrative in Search of an Author | James O'Neill | Literary structure and authorship | [ ] Read if time allows |
| Self-Transformation in HP | James O'Neill thesis | Transformation as theme | [ ] Reference Chapter 3-4 |

### HTML Outputs from HP Database

| Source | Content | Relevance | Status |
|--------|---------|-----------|--------|
| Phase 1 & 3 image_readings | BL marginalia analysis (189 photos deep-read) | Direct evidence of annotator engagement with each folio | [ ] Extract annotation clusters by folio |
| HP marginalia website | Scholars page, Timeline, Editions | Context on scholarship reception | [ ] Cross-reference with characters' arguments |

---

## Key Research Questions

### Question 1: Spatial Logic of the 1499 Text

**What we need to know**: Does the Hypnerotomachia describe spaces in a coherent sequence that could map to a unified world, or are they discrete allegorical scenes?

**Source**: Russell thesis + O'Neill allegory reading

**How it affects design**:
- If coherent geography → Unified world structure (Option A)
- If discrete scenes → Portal-based structure (Option B or C)

**Task**: [ ] Extract passage sequences showing spatial transitions

---

### Question 2: Alchemical Symbolism in the Marginalia

**What we need to know**: Which BL annotations reveal Hand B's systematic reading? What are the key sites/stages of the alchemical journey?

**Source**: Russell thesis (Hand B analysis) + Phase 1-3 image_readings

**How it affects design**:
- Pages 28, 42, 88, 119, 127, 164 are alchemical markers
- Need to understand what each represents (nigredo, albedo, rubedo, etc.)
- Symbols should appear in order of discovery

**Task**: [ ] Create folio-by-folio map of Hand B annotations with alchemical significance

---

### Question 3: Architectural Vocabulary & Vitruvian References

**What we need to know**: What specific architectural principles did Renaissance readers see in HP? Which Vitruvian concepts are referenced?

**Source**: Phase 3 image_readings (pages 12, 14, 21, 27)

**How it affects design**:
- Room composition should reflect identified proportions
- UI could display architectural vocabulary (proportio, obelisco, etc.)
- Palace scene especially should demonstrate coherent Vitruvian logic

**Task**: [ ] Extract Vitruvian vocabulary from marginalia; create architectural glossary

---

### Question 4: Garden Design Theory

**What we need to know**: What Renaissance garden design principles are embedded in HP? How do gardens function allegorically?

**Source**: Word & Image (Hunt, Leslie) + Lefaivre chapter on gardens

**How it affects design**:
- Central garden hub should reflect period authenticity
- Fountain design informed by Renaissance principles
- Pathways and sightlines structured intentionally

**Task**: [ ] Read Hunt and Leslie articles; extract design principles

---

### Question 5: The Procession as Transformation

**What we need to know**: What does the 95% woodcut sequence (pages 149-167) signify? How is the player/Poliphilia transformed by it?

**Source**: Phase 1 & 3 readings (woodcut detection, alchemical vocabulary on p.162-164)

**How it affects design**:
- Procession scene is climactic and mandatory
- Audio design critical (Cantorum/Tonalarium vocabulary)
- Final alchemical transformation visible in procession

**Task**: [ ] Analyze woodcuts #45-73; extract narrative progression

---

### Question 6: The Role of Water & Fountains

**What we need to know**: How do fountains and water appear throughout HP as symbolic elements?

**Source**: Phase 1 image_readings (pages 3, 14, 80) + Lefaivre

**How it affects design**:
- Water as life force, purification, reflection
- Fountain opening scene sets water as motif
- Multiple water features should recur

**Task**: [ ] Create water symbol map (all references from text + marginalia)

---

## Extraction Tasks (By Priority)

### CRITICAL (Do First)

- [ ] **Hand B Alchemical Map** (Russell thesis + Phase 1-3)
  - Extract: pages 28, 42, 88, 119, 127, 164
  - Note: alchemical significance at each
  - Output: `artifacts/research/hand_b_alchemy_map.txt`

- [ ] **Folio-to-Scene Mapping** (Russell thesis + 1499 text)
  - Extract: Which scene corresponds to which page range?
  - Output: `artifacts/research/folio_scene_map.txt`

- [ ] **Architectural Vocabulary from Marginalia** (Phase 3 readings)
  - Extract: Vitruvian terms, proportions, architectural references
  - Output: `artifacts/research/architectural_vocabulary.txt`

- [ ] **Woodcut Sequence Analysis** (Phase 1 + 1499 facsimile)
  - Extract: Woodcuts 1-6 (opening), 13-25 (palace), 45-73 (procession)
  - Note: Emotional arc, symbolic progression
  - Output: `artifacts/research/woodcut_sequence.txt`

### HIGH (Do Next)

- [ ] **Garden Design Principles** (Word & Image articles)
  - Extract: Key passages from Hunt, Leslie, Griggs
  - Output: `artifacts/research/garden_design_principles.txt`

- [ ] **Allegorical Structure** (O'Neill thesis + Russell)
  - Extract: What does each major scene teach?
  - Output: `artifacts/research/allegorical_arc.txt`

- [ ] **Water Symbolism** (All sources)
  - Extract: Fountain, streams, sea imagery
  - Output: `artifacts/research/water_symbolism.txt`

### MEDIUM (Do If Time)

- [ ] **Polia as Character** (O'Neill + text)
  - Extract: Who is Polia? What does she represent?
  - Output: `artifacts/research/polia_character.txt`

- [ ] **Music & Sound References** (Phase 3, p.162-164)
  - Extract: "Cantorum", "Tonalarium", musical significance
  - Output: `artifacts/research/music_references.txt`

- [ ] **Egyptian Influences** (Word & Image: Curran)
  - Extract: How does HP engage with Renaissance Egyptology?
  - Output: `artifacts/research/egyptian_influences.txt`

---

## Output Format (For Each Research Extract)

```
TOPIC: [Name]
SOURCE: [Bibliographic reference]
EXTRACTED: [Date]

KEY FINDINGS:
[1-3 most important insights]

RELEVANT PASSAGES:
[Direct quotes with page numbers]

IMPLICATIONS FOR HPIN3D:
[How this shapes scene design / narrative / UI]

RELATED RESEARCH:
[Other sources that support / contradict this]

CONFIDENCE LEVEL:
[High / Medium / Low]

---
NOTES:
[Any caveats, uncertainties, follow-up questions?]
```

---

## Character Integration

### For the Historian

Once extraction is complete, the Historian will:
- [ ] Review all research extracts
- [ ] Cite them in scene design arguments
- [ ] Flag any contradictions between sources
- [ ] Recommend which insights should be visible in each room

### For the Designer

Once extraction is complete, the Designer will:
- [ ] Understand architectural constraints from Vitruvian vocabulary
- [ ] Learn the emotional arc of the procession from woodcut sequence
- [ ] Get garden design principles for central hub layout
- [ ] Access water symbolism for fountain scene composition

---

## Research Sync with HP Project

Note: The HPin3D project reads the HP database but is independent. However:

1. **Phase 1-3 image_readings** are the gold standard for BL marginalia interpretation
2. **HP timeline** provides context for scholarship reception
3. **HP woodcut table** (with 1499 catalog) guides visual reference

→ Any updates to HP database (new annotation_readings, promoted woodcuts) should be re-exported to HPin3D's JSON data files.

---

## Success Criteria (End of Research Phase)

- [ ] All 6 key questions answered with cited evidence
- [ ] Research extracts filed in `artifacts/research/` with full provenance
- [ ] Historian and Designer have reviewed all materials
- [ ] Scene briefs (in `artifacts/scenes/`) reference research extracts
- [ ] Characters are confident in historical grounding of all major rooms
- [ ] No contradictions between sources (or contradictions documented)

---

## Timeline

- **Week 1**: Extract critical materials (Hand B, folio mapping, architecture, woodcuts)
- **Week 2**: Extract high-priority materials (gardens, allegory, water, music)
- **Week 3**: Character review and scene brief updates
- **Week 4 onwards**: Reference materials as needed during implementation

---

## Where to Find PDFs

Local path: `E:\pdf\hypnerotomachia polyphili\`

All 38 PDFs are indexed. Use Skill (`anthropic-skills:pdf`) or the Skill tools to read/extract from PDF library.

---

**Next**: Historian and Designer each claim 2-3 research questions to lead on. Schedule extraction sessions.
