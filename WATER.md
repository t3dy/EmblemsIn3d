# Water features

*Every fountain, bath, spring and sea in the world — what the book requires of it, what is
built, and what is missing.*

**Read first** (`SOURCES.md` asset map): **Stewering** for the Fountain of Venus, where the
landscape mirrors the lovers and the whole book culminates; **Hunt** on the experience of
gardens; `hp.db.woodcut_catalog` for the fountain plates. The lexicon entries are *Fountain*,
*Sleeping Nymph Fountain*, *Bath / Thermae* and *Water Garden*.

The book is obsessed with water. It is the one element that appears at every stage of the
journey — the spring in the wood, the bath at the court, the fountains of the gardens, the
sea to Cythera, the most-holy fountain at the centre of everything.

---

## 1. The Fountain of Venus

The world's destination, built from chapter XXIII (translated at `translation/en/`
pp. 358–362). The most detailed single object in the project.

- a kerb of the blackest stone, **heptagonal without and round within**;
- **seven lathe-turned columns swelling with entasis**, of the stones the book names —
  sapphire, melilot, jasper, beryl (hexagonal where the others are round), topaz, turquoise,
  emerald;
- gold bases, capitals, architrave and cornice; an **arcade** between the columns, each arch
  taking the stone of its neighbour;
- a small altar over each capital carrying a **gold planetary figure** a third the column's
  height, and the **zodiac** in the frieze beneath;
- a **veinless crystal cupola**, and at its peak an **egg-shaped carbuncle** the size of an
  ostrich's;
- the basin **sunk below the pavement**, because the goddess stands in it up to her flanks —
  not on a pedestal above the water — with her hair floating on the surface;
- the **curtain of Hymen**, hung between the sapphire and emerald columns and split where
  Poliphilo struck it with Cupid's arrow.

**On the seven planets:** Colonna names the stones and stops. The planetary attribution is
**Hand B's** — the British Library annotator who inked a different metal's sign at each of
the seven angles of this fountain's woodcut (`hp.db.folio_descriptions` y7r, "Fons
Heptagonis"). We are following a documented sixteenth-century reading of this exact plate,
not imposing a modern one. See `ARCHITECTURE.md` §5.

The true fountain is on **Cythera**; the mainland grove carries a dream-echo of it, which the
project has always treated as deliberate.

## 2. The Sleeping Nymph Fountain

`hp.db` calls this *"one of the book's most widely copied motifs"*, copied as real fountain
sculpture in Italian and French gardens through the sixteenth century. **It was missing from
the world entirely** until 2026-09-05.

Modelled part-for-part from the 1499 plate: an aedicula of two Corinthian columns carrying an
entablature and a triangular pediment with a wreath in the tympanum; the nymph asleep on
drapery over a low couch; a satyr at the right with his arm raised to the veil; two putti;
the veil hung from the architrave and gathered back; laurel and myrtle framing the opening;
and — the part that makes it a fountain rather than a tableau — **the spring issuing beneath
her into a sunk basin**, with the ΠΑΝΤΩΝ ΤΟΚΑΔΙ inscription (*to the mother of all things*)
that the Renaissance copies carried with her.

She is built *reclining*, not reused: the cast's `recline` pose only turns a standing figure
on its side, and the nymph's body is a lathe-turned gown, which laid down reads as a cone
with a ball on the end.

## 3. The Bath of the nymphs

The eight-sided bath-house — ΑΣΑΜΙΝΘΟΣ, *the bath, eight-sided, roofed with crystal*. An
octagonal basin wall with a gold rim, three ring-seats stepping down inside, paired pilasters
at each of the eight corners carrying a frieze of children with green boughs, and jets over
the water.

## 4. Springs and pools

The spring in the Dark Wood where Poliphilo kneels to drink, and the pools of the gardens.
These were a torus and a flat disc — a puddle with a hoop on it. They now have a **sunk bowl**
so the water sits below the coping instead of floating on the grass, a moulded coping ring, a
chamfered kerb, an overflow lip and the wet channel it feeds.

## 5. The sea, the stream, the crossing

The sea runs from the shore all the way to the island, its material breathing in the update
loop. A sand strip, a timber pier, and rails — the crossing is Cupid's to make, not the
walker's, so everything seaward of the shore is fenced. A watercourse crosses the
processional path at the bridge.

## 6. How water is rendered

**Variants** (Graphics menu → *Water features*):

- `primitive` — a flat coloured disc, still.
- `painted` *(default)* — the ripple rings are painted into the albedo, and a **counter-turning
  caustic sheet** of interlocking pale loops drifts over the bath and the fountain basin, so
  the surface glints rather than shining evenly.

The ripple map and the slow spin used to be applied unconditionally in lit mode, which would
have made the dropdown decoration; water now genuinely differs between the two.

## 7. Known gaps

- **Folio 80's fountain — "Third fountain with Graces, harpies, griffins"** — is the plate the
  station named *Fountain of Venus* actually corresponds to, and none of the Graces, harpies
  or griffins are modelled.
- The **second fountain** of the FIVE_SENSES section (`woodcut_catalog` #22) is not built as a
  distinct feature.
- **Polia's torch is extinguished in an altar-fountain** (`woodcut_catalog` #77) — a water
  feature that carries real narrative weight and does not exist.
- No flowing water anywhere: jets are particles, falls are a translucent plane. Nothing
  simulates.

## 8. Where the code is

| | |
|---|---|
| Fountain of Venus | `src/scenes/HPWorldScene.js` — `_buildFountain()` |
| Sleeping Nymph Fountain | `_buildNymphFountain()` |
| The bath | `_buildBath()` |
| Water material, ripples, caustics | `_waterMat()`, `_waterTexture()`, `_causticTexture()`, `_caustics()` |
| Springs and pools | `src/systems/Cast.js` — `props.pool()` |
| Variant registry | `src/systems/AssetVariants.js` — asset `water` |
