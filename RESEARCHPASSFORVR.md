# Research pass for the virtual world

> 2026-09-01. An audit of the Dream Garden against three things we did not have
> when it was designed: the 1499 text itself (now being translated), the
> scholarship archive at `E:\pdf\hypnerotomachia polyphili` (34 items), and the
> marginalia and woodcut catalogue in `hp.db`. Companions:
> [GARDENS.md](GARDENS.md), [PROCESSIONS.md](PROCESSIONS.md),
> [ARCHITECTURE.md](ARCHITECTURE.md).

---

## The headline: we built the first third of the book

`hp.db` catalogues 168 of the 1499 woodcuts by narrative section. Set the book's
own illustration budget beside what exists in the world:

| Section | Cuts | Built |
|---|---:|---|
| **CYTHERA_GARDENS** | **30** | a cone on the horizon |
| **PROCESSION** | **27** | four parked floats |
| **POLYANDRION** | **27** | — |
| **BOOK_II_POLIA** | 17 | — |
| **VENUS_TEMPLE** | 15 | — |
| PYRAMID_RUINS | 11 | ✔ |
| JOURNEY_DOORS | 11 | ✔ |
| QUEEN_PALACE | 9 | ✔ (no chess ballet) |
| VENUS_FOUNTAIN | 7 | ✔✔ rebuilt from ch. XXIII |
| FIVE_SENSES | 5 | ✔ |
| DARK_FOREST | 4 | ✔ |
| DRAGON_PORTAL | 3 | ✔ |
| CYTHERA_VOYAGE | 2 | ✔ |

**We have built almost everything the book illustrates least, and almost nothing
it illustrates most.** The eight stations we finished account for 45 woodcuts. The
five we have not started account for 116.

This is not a criticism of the original design — those stations were chosen from
the folio-level marginalia the HP database happened to cover, which cluster in the
first half. But it means the world's centre of gravity is wrong relative to the
book's, and the next phase should correct it rather than continue polishing the
part we have.

**Cythera is the correction.** It is the largest block of images, it is the book's
culmination, Poliphilo's whole landscape education resolves there, Book II begins
there, and [GARDENS.md §5](GARDENS.md) now contains a reconstruction detailed
enough to build from without further research.

---

## Five design principles the scholarship gives us

These are not decoration; each one contradicts something we currently do.

### 1. Disorientation is the content, except at Cythera

Hunt: Poliphilo "is not therefore able to pace or place himself appropriately,
either in his movement or his thinking. He misjudges his position or even his
route, thinking an end is in sight when it is not." Each scene is "preternaturally
clear and explicit" in itself and baffling in relation to the whole.

**But Cythera inverts this exactly.** Poliphilo surveys the entire island *before
landing*, and then — uniquely — "these converging paths lead him down axes along
which everything falls into place."

> **Consequence.** [INTERFACECHOICES.md](INTERFACECHOICES.md) rejects a minimap
> outright. That was right for the wrong reason and is now wrong in one place: the
> refusal should hold everywhere **except Cythera, which should open with an
> overview and then be legible.** Being lost, and then arriving somewhere you can
> read, is the shape of the book.

### 2. The world needs a second nature

The humanist doctrine Hunt invokes has three natures: wilderness, the worked
agricultural landscape, and garden art. Colonna moves between all three and
compares them constantly. **We have wilderness and garden and nothing between.**
The v2 meadow is currently asked to be both and reads as neither.

> **Consequence.** Fields, orchard rows, a vineyard trained on elms, between the
> dark wood and the courts. The meadow system already built will do the work; it
> needs a second palette and a placement.

### 3. Text and woodcut are two different buildings

Bury: the famous portal woodcut "is far from being a faithful illustration… the
artist took extraordinary liberties with the measurements given in the text," and
building from the numbers "produces a structure considerably different in
appearance from the woodcuts."

> **Consequence.** A rule we did not have: **the lit world follows the text, the
> woodcut world may follow the engraver, and where they differ we say so.** The
> two-rendering system, built for style, turns out to be a scholarly instrument.

### 4. Impossible scale is a rhetorical device, not an error

Bury again: the absurd measurements "provide the necessary fabulous elements to
conform with Aristotle's precept that a work of fiction should excite *admiratio*."

> **Consequence.** Stop treating the 1,410 steps as a problem to be managed. The
> design target is astonishment, not metres, and the v2 Portal is defensible on
> that ground rather than as a compromise. Record it.

### 5. Some things are more faithful unbuilt

Hunt on the glass and silk gardens: the 1499 and 1592 editions decline to
illustrate them; the French 1546 did, and by drawing on familiar imagery
"inevitably mak[es] them seem more plausible," so that "the sense of exceptional
and extraordinary artfulness is diminished."

> **Consequence.** If we model the artificial gardens we repeat the French
> illustrator's mistake in a medium far more literal than woodcut. This is the
> first place in the project where **withholding the model is the faithful move** —
> see [GARDENS.md §7](GARDENS.md) for a proposed staging.

---

## Corrections to things already built

Found by this pass; each is small and each is a real error.

| | Now | Should be | Source |
|---|---|---|---|
| **FESTINA LENTE** | on the Great Portal | on **a bridge**, with the circle, anchor and dolphin | Curran, plate of the bridge hieroglyphs |
| **Seven metals on the fountain** | our note says the planetary reading is ours, not Colonna's | it is **a documented sixteenth-century reading of this woodcut** — Hand B inked one metal-sign per angle | `hp.db` `folio_descriptions` y7r |
| **Polia's pergola** | four posts and a flat lattice | a **vaulted tunnel** with three kinds of jasmine — one of only two things the book illustrates twice | Hunt; 1499 fols. |
| **The Venus fountain** | the fountain alone | its **enclosure**: gold pergola with real roses, flowery mead, zig-zag sliced-marble balustrade (also illustrated twice) | Hunt §VI |
| **The triumphs** | parked, breathing | **moving**, with censers, gold trumpets with silk banners, and cornets by rank | our ch. XVII translation |
| **The elephant** | ✔ black, gold-dusted, green obelisk | add the **ant-and-elephant hieroglyph**: concord grows an ant to an elephant, discord shrinks it back | Curran, Caesar obelisk plate |

---

## What to build next, in order

1. ✔ **Cythera — first pass built** (2026-09-01, `_buildCytheraIsle`). The
   concentric island stands at (0, −150), reached by Cupid's boat (digit 0, 9
   returns): sward and sand, twelve radial roads, the *bosco* in twelve wedge
   plantations inside its cypress rim, the *prati* with topiary and pool
   centrepieces and fruit trees inside the bitter-orange espalier, the ring
   river with its four cardinal bridges and citrus-pergola arches, three
   terraces with knot-work tops and flower-bed rings breaking at the gated
   crossroads, and the theatre floor holding a second building of the
   seven-column fountain — the dream repeating its climax, as the narration
   always said it did. Still open from Segre's plan: the seven-step flights
   themselves (the terraces meet the corridors at grade), the full twenty road
   count, and per-compartment tree species rather than two kinds alternating.
2. **The Venus fountain's enclosure.** One session, completes a finished station,
   and stages the book's central argument as an object: a gold structure carrying
   real roses.
3. **Moving triumphs.** The `DreamMode` Catmull-Rom walker already exists; a float
   can ride it. Second-largest image block in the book, currently inert.
4. **The polyandrion.** 27 woodcuts and nothing built. The ruined temple of tombs
   and its epitaphs is the book's antiquarian heart, it is where Poliphilo does the
   thing he is actually for — reading monuments — and there is a
   `POLYANDRIONTODO.md` already sitting in the HP project.
5. **Second nature** between the wood and the courts.
6. **The chess ballet** in the Queen's palace: 32 figures, 16 silver and 16 gold,
   with Hand E's three-rounds-of-distillation reading in the annotation panel.
7. **A processional mode** — ride a triumph along the axis instead of walking it.
   The Elizabethan-entertainment reading of the book, made playable.

---

## Gaps in our own apparatus

- **Lefaivre is unread.** *Alberti's Hypnerotomachia Poliphili* (MIT, 324 pp.) is
  the most substantial architectural study we hold and is an image-only scan.
  Nothing in this pass rests on it. **OCR it before the next architecture pass**;
  it is the one source likely to change a framing rather than a detail.
- Also image-only, therefore unread: O'Neill's *Allegory of Love* (412 pp.), the Da
  Capo facsimile, Gollnick on Apuleius, the Canone/Spruit emblematics volume.
- **The Pozzi–Ciapponi critical edition (Antenore) is in the archive and has
  extractable text. It must not be used for the translation.** It is a modern
  critical edition and carries its own rights; our English is made only from the
  1499 transcription in `translation/source/`, and that must stay true. Noted here
  because the file is sitting right next to the ones we do use, and the temptation
  is obvious.
- `hp.db` holds 457 `image_readings` and 282 `annotations` that this pass only
  sampled. The marginalia in particular are a station-by-station commentary we have
  barely touched — four `folio_descriptions` entries alone (b5r, b6v, b7r, h1r)
  contain readings of the elephant, the ambiguous gods and the chess ballet that
  could each carry a station's worth of content.
