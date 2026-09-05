# Nymphs and figures

*What the book and the scholarship require of the human figures in the Dream Garden, what
we built, and the four failed attempts it took to get there.*

**Read first** (per the `SOURCES.md` asset map): **Stewering** on Polia and the landscape and
on the relation of text to woodcut figure; the project's own iconographic sourcebook at
`research/nymphs.html`; and `CHARACTERS.md`.

---

## 1. Who the figures are

### The five nymphs of the senses

The book identifies them by what each carries. They attend Poliphilo at Queen
Eleuterylida's court, bathe him, and lead him through the gardens. Colonna coins their names
compulsively from Greek — the erudition is half the pleasure.

| Name | Sense | Carries | Robe in the world |
|---|---|---|---|
| **Aphea** | Touch | nothing — she is the one who offers her hand | rose |
| **Osfressia** | Smell | the perfume casket | green |
| **Orassia** | Sight | the shining glass | blue |
| **Achoe** | Hearing | the sounding harp | gold |
| **Geussia** | Taste | the casting bottle | violet |

Built in `SENSE_NYMPHS` (`HPWorldScene.js`), placed in an arc before the throne, each with
her attribute in her right hand.

### The rest

- **Polia** — the long-sought. Her own Book II counter-narrative is a standing design
  intention (`DESIGN.md`), not yet a built POV.
- **Poliphilo** — the dreamer.
- **Queen Eleuterylida** — Free Will herself, enthroned under a baldachin.
- **Logistica and Thelemia** — Reason and Desire, the two handmaids who guide the rest of the
  dream. The court "stages the faculties of the soul as a royal household."
- **The guide nymph** of the dream mode, who walks a few paces ahead.

---

## 2. What the sources ask for

From `research/nymphs.html`, which sets the brief from three places:

1. **The 1499 woodcuts** — for costume. High-belted gowns, sleeves gathered at the shoulder,
   hair bound with fillets. Fewer folds, clearer silhouette than a painter would give.
2. **Cellini's *Nymph of Fontainebleau*** (bronze relief, 205 × 409 cm, Louvre MR 1706) — for
   proportion. The elongated Mannerist body, which reads beautifully at low polygon counts:
   all silhouette and sweep.
3. **Goujon's naiads** from the Fontaine des Innocents — for drapery. Carve the folds as
   geometry: few, long, directional.

The sourcebook also carries Cranach and Waterhouse as reception evidence — later readings of
the nymph, useful for what the figure came to mean rather than for what Colonna's designer
drew.

**The rule that follows:** *every choice of model is also a choice of meaning.* A Waterhouse
nymph and a 1499 woodcut nymph are not interchangeable bodies; they carry different
centuries of assumption about what a nymph is for.

---

## 3. What we built — and four attempts that failed

This is recorded honestly because the failures are the useful part.

**Attempt 1 — primitives.** Capsule limbs, a cone robe, a sphere head. The founding
manifesto look. It reads as a shop mannequin.

**Attempt 2 — better proportion and surface.** The head was 0.13 × height on a body 1.65
tall: about **6.3 heads**, a doll's canon. Fixed to ~8 heads with a jaw added. The face
texture was repainted — it had eyes a tenth of the head wide, 0.30-alpha blush roundels and
a scarlet rosebud mouth. The hair, a single hemisphere, became a mass with a parting, swept
sides, a lock and a chignon. Drapery folds, which existed but were drawn at 0.55 alpha on a
256 px canvas and washed out entirely once lit, were redrawn at 512 px with a dark core and
a lit ridge.

All of that was real improvement. **It still read as a mannequin**, because the causes are
structural: sphere hands with no fingers, capsule arms, a turned-cone gown.

**Attempt 3 — paint the figure procedurally onto a card.** Drawn at eight heads with folds,
gold trim, hair mass and a face. This traded mannequins for **paper dolls**: identical
silhouettes with only the colour changing, stiff arms, faces too small to carry at walking
distance. A lateral move.

**Attempt 4 — use real painting.** Cut actual figures out of the public-domain artworks the
project already hosts. This is what worked, and the reason is not subtle: **the anatomy, the
drapery and the face were solved in 1480.** I do not have to generate a convincing
Renaissance figure if Botticelli already painted one.

Six figures are cut from *Primavera* (c. 1480, Uffizi): the three Graces, Flora, Chloris and
Venus — standing draped women in a garden, which is exactly the brief. They are assigned to
the nymphs by name so a row of them is a row of different women. Full provenance and method
in `IMPORTEXEMPLARS.md` and `src/data/figure_cutouts.json`; the cutting script is
`scripts/cut_figures.py`.

**All four remain selectable** from the Graphics menu — `primitive`, `modelled`, `painted`
(tempera surface on the modelled build), `card` (the cutouts). The registry never deletes a
rung, and woodcut mode still prefers `primitive`, because flat ink wants a readable
silhouette rather than a photograph of a painting.

---

## 4. Known problems

- A few grey fragments of tree trunk survive the cut-out mask at some card edges.
- Relative scale between cutouts was normalised per figure, not against each other.
- Six figures for the whole cast means repeats across the garden. **Cranach's nymph and
  Cellini's are in the gallery and uncut** — the obvious next source, and they would widen
  the range beyond a single painter's studio.
- Winged, two-headed and gilded figures keep their built bodies: a flat painted card cannot
  do what those are doing.
- Polia's POV, and the reaction-choices in *her* register, remain a design intention only.

---

## 5. Where the code is

| | |
|---|---|
| Figures and nymphs | `src/systems/Cast.js` — `figure()`, `nymph()`, `paintedFigure()` |
| The cast list and placement | `src/scenes/HPWorldScene.js` — `SENSE_NYMPHS`, `_buildCourt()` |
| Variant registry | `src/systems/AssetVariants.js` — asset `figure` |
| Cutting the figures | `scripts/cut_figures.py` |
| Provenance | `src/data/figure_cutouts.json`, `src/data/gallery.json` |
| The sourcebook | `research/nymphs.html` |
