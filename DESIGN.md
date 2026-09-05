# The Dream in Lenses — design vision

*A living design articulation for the Hypnerotomachia world. Distilled from Ted's
creative-direction sessions (2026-09-04); see `DECISIONS.md` for the binding calls.
This is the north star, not a spec — slices are cut from it.*

## Core concept

**One faithful dream, read through stackable lenses.** There is a single, continuous
3-D world, modelled as close to the literal 1499 *Hypnerotomachia Poliphili* (woodcuts +
text) as we can get. Meaning is not baked into the geometry; it is supplied by lenses the
visitor stacks at will:

- **A POV lens** — whose eyes: *Poliphilo* (the first-person love-quest), the
  *scholar-visitor* (the museum/tour/edition stance), or *Polia* (her Book II
  counter-narrative).
- **Commentary lenses** — colour-coded flavours of gloss, each toggleable on/off
  independently: literary art, Renaissance context, architectural theory, neoplatonic
  aesthetics, mythological allusion, allegory & symbolism, difficult-word gloss,
  quotation — **plus a new *alchemical* flavour** (the hermetic reading "as charted by
  James Russell"; keep the book primarily literary, alchemy as an optional overlay).

The same walk yields a different book each time you re-stack the lenses. This is the spine
that lets "all four moods / all three stances" cohere instead of sprawl.

## The reaction mechanic (first-person modes)

In *Poliphilo* mode (and *Polia* mode), each wonder is a **moment of response**, not a
cutscene. At a sight, the player chooses how to react from a small set of utterances:

- **The canonical reaction** — what Poliphilo actually says/feels in the novel, drawn from
  our translation (or Dallington for the first half).
- **Mood-variant reactions** — the same moment met in a *different register* but composed
  in Colonna's own style: antiquarian wonder, melancholic dream, erotic-mystical, or
  uncanny/oneiric. You author the temperament of your dreamer, sentence by sentence.

In *Polia* mode the same choice structure carries her tacks — tragic and unflinching, her
own erotic awakening, or an ironic counter-reading of the male dream — selectable
throughout, so the player shapes whose Polia this is.

## How the four moods manifest (all of the below)

- **Anchored to place** — each wonder has its native register (wonder at the portal, dread
  at the dragon, eros at the fountain, melancholy at the Polyandrion).
- **A time-of-day** — a dawn→noon→dusk→night light that recolours the whole garden.
- **Braided to the POV lens** — the scholar sees sunlit wonder; Poliphilo the erotic and
  uncanny; Polia the melancholic.
- **Chosen by the player** — the reaction you pick tints the *now*: choose melancholy at
  the fountain and that scene's light and sound answer you.

The light has a **narrative default that the player can override** (Ted): the dream lights
itself along its arc — humanist noon at the portal, gold dusk toward the tombs, uncanny
moon on Cythera, cold dawn at the waking — but the visitor can seize the dial to relight
any scene.

## Alternate realizations — a global interpretive lens

Where a woodcut is genuinely ambiguous, the world offers rival **3-D realizations** — but
governed by a single **global interpretive lens** (Ted), not per-scene toggles. You pick a
reading — the alchemical, the erotic, the strictly-Vitruvian, the Christian-allegorical —
and it re-skins *every* ambiguous scene across the whole garden to that interpretation at
once. The lens metaphor made literal, coherent, and scalable — the same pattern as
ARTHURCRAWL's worldview rulesets. The commentary explains what each realization commits to.

## What already exists to build on

- The walkable dream garden (HP world) with 15 stations, lit + 1499-woodcut render modes,
  mobile thumb-stick controls, and a marble Venus (first imported statue) at the fountain.
- "The Novel" guided tour: 14 nodes, expanded ledes, real quotations, 37 typed colour-coded
  commentary notes (the toggle system extends *this* registry), and call-up-the-woodcut.
- The complete CC0 translation + digital edition with a whole-book synopsis.
- The visual-novel prototype ("Poliphilo's Commonplace Book") with a Logistica↔Thelemia
  (Reason↔Desire) axis and *excerpta* collection — the seed of the reaction mechanic.
- A provenance-tracked Gallery of Renaissance exemplars + the woodcuts.

## Resolved (2026-09-04)

1. **Reaction-choices are expressive** — you author a temperament, the scene answers in
   light/sound, but the dream reaches the same shore. No branching, no win state. *(A quiet
   accumulated self-portrait is compatible with this and probably desirable; it just must
   not gate content or fork the path.)*
2. **Alternate realizations = one global interpretive lens** that re-skins every ambiguous
   scene at once (not per-scene switches).
3. **Mood-light = narrative default, player-overridable.**

## Done

- **The reaction-choice mechanic is built** (2026-09-04) in the first-person game —
  "Poliphilo's Dream" (`#dream`, `DreamMode.js` + `src/data/hp_reactions.js`). At each of
  the twelve wonders the player chooses HOW Poliphilo meets it: the book's own response
  (marked canonical) or a variant in one of four moods — Wonder, Desire, Melancholy, Dread —
  written inside Colonna's register. Expressive, non-branching (same shore); the chosen line
  is spoken, the book's own response is revealed beneath it, the pick is tallied, and the
  waking gives a self-portrait (dominant mood + how often you answered as the book does).
  The *tour* stays purely descriptive; the *game* is where you author a temperament.
  The mood → **light** answer shipped too (`HPWorldScene.setDreamMood`): the lit garden's
  background, fog, sun, fill and bloom ease to a per-mood palette over ~1.4 s and back to
  neutral at the waking. Still to add: the **sound** half of that answer.
  Also added (2026-09-04 evening): choosing the book's own reaction is now acknowledged
  in the moment — the chosen line reads "Poliphilo · Dread · as the book has it" — instead
  of only surfacing in the tally at the waking.


- **Alchemical commentary flavour is populated** (2026-09-04) from James Russell's Durham PhD
  (2014) and `hp.db.alchemical_symbols` / `symbol_occurrences` — six attributed notes on the
  wood, elephant, court, fountain, Cythera island, and theatre nodes, each citing Russell's
  page and the British Library annotator hand (Hand B, the d'Espagnet mercury alchemist;
  Hand E, the pseudo-Geber sulphur reader). Toggle + chooser pick it up automatically.
  Corpus map: `SOURCES.md`.

## A sensible first slice

Everything above is one system; the smallest piece that proves it and is already requested:
**make the tour's colour-coded commentary flavours individually toggleable** (turn each
on/off; sticky), and **register the alchemical flavour** in that system (colour + label,
awaiting Russell). This is the literal "toggled on or off like any of the other modes of
commentary," and it is the first turn of the lens machine.
