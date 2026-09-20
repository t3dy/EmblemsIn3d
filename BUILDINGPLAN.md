# BUILDINGPLAN — what to build and why

*Last updated: 2026-09-20. This is the operational roadmap for stages 2–4, organized by precinct and narrative priority. Cross-reference with COVERAGE.md for full feature details and SOURCES.md for scholarship.*

> ## STAGE 2 IS BUILT (2026-09-20) — read `HANDOVER_STAGE2.md`
>
> Ted took the whole of it: **full stage 2**, **the pyramid square**, and then the screens, the
> spring, the triumph fixes and Polia's staging. What that leaves on this page:
>
> | line below | state |
> |---|---|
> | Portal — **pyramid at true scale (BLOCKER)** | **done.** 1,139.6 m square, 1,410 courses, ~965 m to the nymph. The valley's neck is derived from it. |
> | Wooded Country — spring that divides right/left | **done** — it moves here with the fields, where ch. VI puts it |
> | Wooded Country — mountain ring | **done** — an ellipse at the plan's own width and depth, with a mouth at each end |
> | Cypress Avenue — avenue + citrus hedge | **done** — four stadia, periwinkle floor, one gate |
> | Cypress Avenue — periwinkle floor + azure flowers | **done** |
> | Green Enclosure — three-sided citrus hedge | **done** (east and west; the south side IS the avenue's closing hedge and is built once) |
> | Green Enclosure — windows cut in hedge | **done** — `_citrusRun`, and the hedge reads as architecture |
> | Polia's Garden — meeting + recognition staging | **done** — she walks the arbour to meet you, torch in hand, and stops at arm's length |
> | Polia's Garden — interior monologue (eyes vs. appetite) | **done** — dream stop `polia_quarrel` + its reaction |
> | Triumphs — fix car materials | **done** — all four, each from the two stones the book names |
> | Triumphs — fix riders' liveries | **done**, and the fourth car's riders are REMOVED: the book withholds them |
> | Triumphs — Bacchus car's urn | **done** — the eagles, the jacinth vessel, the topaz vine, the ash, and the golden vine that roofs the team |
>
> **Still open here, and now the top of the queue:** everything under "the monuments grown into
> the room it makes". Only the pyramid has grown. Cythera is a 50 m island in a 1,400 m precinct;
> the colossus is a tenth of his sixty paces. And **the palace does not yet close the green
> enclosure's north side**, which is what the book says it is — that one is now visible from
> inside the room, which is the best kind of bug report.
>
> Stage 3 moves a precinct by editing `scripts/plan_sites.py` and re-running it. Nothing inside a
> builder is ever re-typed again; see `HANDOVER_STAGE2.md` §1.

## The principle: screens before scatter

The book's own rule (DIRECTIONS.md §5): **nothing is approached across open ground with the destination in view**. Every monument is glimpsed through trees, hidden behind a wall, or closes a valley. Stage 1's sparseness (the 4× spread) is intentional. Before scattering more objects, **build the screens** — the wooded rings, the hedged enclosures, the mountain walls — that make approach meaningful.

---

## Priority by narrative stage

### I. THE ARRIVAL (Chapters I–III)
**Build the entry sequence: plain, wood, pyramid at true scale.**

| Location | Feature | Priority | Note |
|---|---|---|---|
| Plain | Poliphilo's figure (alone) | **FIRST** | Marks "I am in the dream now" |
| Plain | Absence as composition (flowers, emptiness) | High | Plain reads *composed*, not null |
| Wood | Navigation note at station | **FIRST** | "Sun kept on one side" — transforms confusion into method |
| Wood | Discovery staging (fade-in, soundscape shift) | High | Each clearing announces itself |
| Oak | Isolation + nymphs emerging (formation walk) | High | Threshold to ch. II |
| Portal | Pyramid at true scale (1,140 m) | **BLOCKER (stage 2)** | Gate for everything downstream |
| Portal | Nymph at portal mouth (first human) | High | Chapter III's opening beat |

**Why:** The pyramid at true scale unlocks the book's spatial logic. Build it first; everything else follows.

---

### II. GARDENS & PASSAGES (Chapters VI–VIII)
**Build the screens: mountain walls, hedges, the cypress avenue as a processional line.**

| Location | Feature | Priority | Note |
|---|---|---|---|
| Wooded Country | Spring that divides right/left | **FIRST** | THE geographical landmark |
| Wooded Country | Mountain ring (visual enclosure) | High | Makes space feel *bounded* |
| Cypress Avenue | Avenue + citrus hedge at far end | **FIRST** | Longest stated distance in book (740 m). Connects precincts after stage 2. |
| Cypress Avenue | Periwinkle floor + azure flowers | High | Composition (not scatter) |
| Green Enclosure | Three-sided citrus-fruit hedge | **FIRST** | Makes space feel *enclosed, intimate* |
| Green Enclosure | Windows cut in hedge | High | Hedge reads as *architecture* |

**Why:** These features define the *passage experience*. Without hedges and screens, the world reads as scattered. With them, it reads as orchestrated.

---

### III. THE BELOVED & DOUBT (Chapters XII–XVI)
**Build the social theatre: meetings, triumphs, the rite.**

| Location | Feature | Priority | Note |
|---|---|---|---|
| Polia's Garden | Meeting + recognition staging | **FIRST** | Polia with torch, approaches, he recognizes her. Social theatre. |
| Polia's Garden | Interior monologue (eyes vs. appetite) | High | Non-branching reaction-choice (hp_reactions.js). One minute. |
| Triumphs | Fix car materials (distinct per car) | **FIRST** | Visibility + correctness. Medium effort. |
| Triumphs | Fix riders' liveries (wrong on 3 of 4) | High | Leda/Danae/Bacchus have wrong colour scheme. |
| Triumphs | Bacchus car's urn (Semele's funerary urn) | High | 8 pages of description. Complex build. This IS the 4th car's identity. |
| Triumphs | Relief panels (named scenes) | Medium | Currently silhouettes. Replace with symbolic/illustrative art. |

**Why:** The triumphs are the book's most formal sequence. Make them correct and distinct before adding surround. Polia's garden is the emotional centre — stage it as theatre.

---

### IV. TEMPLES & DEPARTURE (Chapters XVII–XX)
**Build the descent and the threshold: the temple, the tomb, the sea-gods, the departure.**

| Location | Feature | Priority | Note |
|---|---|---|---|
| Venus Temple | Three fruits taken and tasted | **FIRST** | Bush exists; the *giving* is not staged. (hp_dream.js beat) |
| Venus Temple | Rape of Proserpina relief | High | Ch. XIX climax. He encounters it, fears, flees back to Polia. |
| Tombs | Verify vaults + buttresses | High | Verification step; check ch. XIX description against code. |
| Tombs | Crypt descent staging (door, darkness, dread) | High | Threshold moment. hp_dream.js + lighting. |
| Shore | Sea-gods' homage to Cupid | **FIRST** | Ch. XIX–XX boundary. Neptune + tritons "submerging, bursting up." Visual beat. |

**Why:** The tomb is the nadir — lowest point geographically and emotionally. Stage with dread, not decoration. The sea-gods mark the threshold to the island.

---

### V. CYTHERA — ISLAND PARADISE (Chapters XXI–XXIV)
**Build the destination and resolution: landing procession, the theatre ceremony, Psyche.**

| Location | Feature | Priority | Note |
|---|---|---|---|
| Island Shore | Landing procession (gift-bearing nymphs) | **FIRST** | Ch. XXII opens here. Currently: not staged. This is the island's opening beat. |
| Island | Psyche's 13-nymph masque (Toxodora, Ennia, etc.) | **MAJOR** | 13 named characters, 13 attributes. Belongs stage 3. Alternative: procession video (hp_tour) |
| Island Theatre | Gate with alternating green/red columns | High | Verify: columns alternate? Flanking gem-vases? Ram-skull altar reliefs? |
| Island Theatre | Psyche crowns Cupid with votive crown | Medium | Ceremonial placement moment. hp_dream.js + animation. |

**Why:** Cythera is the destination. Build it as a complete experience. The procession and the theatre are the book's most formal, most staged sequences. Treat them as theatre design.

---

### VI. TREVISO — POLIA'S CITY (Book II, Chapters XXV–XXXVIII)
**Build the coda: the marriage, the palace, a sample garden.**

| Location | Feature | Priority | Note |
|---|---|---|---|
| Treviso | Siting decision (where geographically?) | **DECISION (stage 2 planning)** | Beyond mainland? Separate dream? Recommend: north of tombs, second map. |
| Treviso | Wedding ceremony | **FIRST** | Ch. XXV. Emotional resolution of entire romance. hp_dream.js scene. |
| Treviso | Polia's palace | High | Heart of the city. Described in detail. Major build (stage 3). |
| Treviso | One major garden (sample) | Medium | Proof-of-concept. Not all 14 chapters' worth — keep scope manageable. |

**Why:** Book II is the coda. Essential narratively, optional geometrically. Build a "greatest hits" Treviso. Narration + commentary carry the rest.

---

## CROSS-CUTTING FEATURES

### Hedges as architecture (all garden chapters)
Citrus hedges, fruit walls, living fences with windows cut in them. **Not decoration — they are how the book makes gardens feel like rooms.** Every garden precinct needs at least one such boundary. Priority: **after geometry, before detail**. Medium effort per precinct.

### Mythographic planting (all wooded chapters)
Named trees with backstories (Heliades' poplars, Daphne's laurel, blood-mulberry of Pyramus/Thisbe). Currently: generic. Low priority (mostly plaques), but essential for reading. A player should know *why* a specific tree stands there.

### Relief sculpture & narrative panels (chapters IV, XIV, XV, XXII)
Carved reliefs on altars, sarcophagi, triumphal cars, temple walls. Many unbuilt or silhouette-placeholders. Detail pass (stage 4). Illustration work; high payoff for authenticity.

### Processions & choreography (chapters XIV, XV, XXII)
Triumph floats, nymph dancers, gift-bearers. These are **not optional** — they are how the book stages ceremony. After objects exist, stage the movement (hp_dream.js + hp_tour.js + animation). Medium effort; high payoff.

### Commentary layer (all chapters)
Meanings that don't need geometry (architect's rule, Ovidian exempla, philosophical maxims). Text + UI integration. Stage 4 work.

---

## STAGE SUMMARY

**Stage 2: True scale.** Pyramid 1,140 m, valleys widen, all precincts resited from research/plan.json. The world becomes "the book's world."

**Stage 3: Detail and population.** ~200 unbuilt features from COVERAGE.md. Hedges, reliefs, named nymphs (13 aspects, 6 riders per triumph), procession choreography, Polia pass, Treviso sample.

**Stage 4: Finishing pass.** Relief carving, plaques, mythographic detail, shader polish, commentary layer, experimental (hedge-stairs, ridden boat, island montage).

---

## HOW TO USE THIS

1. **Builders (stages 2–3):** Look up your chapter. Read the Priority column. Start with **FIRST** or **High**. Cross-reference COVERAGE.md line number for full feature detail.
2. **Scope questions:** Point to the stage-summary. "Should we build all 14 chapters of Book II?" → "No. Build a sample. The budget is X."
3. **New builders:** Read **The principle** section first (why screens matter). Then read your assigned chapter.

---

**Build joyfully. The book is good, and it wants to be seen.**
