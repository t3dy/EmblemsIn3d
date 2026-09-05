# Next steps — the standing work queue

*Everything Ted has asked for that is not yet finished. **Read this at the start of every
session and work it down.** Do not wait to be re-asked: an item stays here until it is
actually built, verified in the browser, and deployed to both hosts.*

**Why this file exists.** Over the session of 2026-09-04/05 several explicit requests were
acknowledged and then never delivered — the documentation set and the lexicon gallery among
them — because each new message pulled attention to the newest thing and the older asks were
silently filed as "next". That is the failure this file prevents. If Ted asks for something,
it goes in here immediately, in his words, before the work starts.

**Rules**
1. Add the ask here the moment it is made, quoting him where the wording matters.
2. Work items top-down. Finish one before starting the next.
3. Nothing moves to Done until it is verified against the running site and deployed to
   **both** Vercel and GitHub Pages (see `DEPLOY_STATE.md`).
4. When reporting, say what is still open from this list. Do not let Ted discover it.

---

## Open

### 1. Figures — finish the cutout pass
The card pipeline and the real cutouts shipped (2026-09-05): six figures cut from
Botticelli's *Primavera* now stand in the garden, provenance in
`src/data/figure_cutouts.json`, cut by `scripts/cut_figures.py`. See `NYMPHS.md` for the
four attempts it took. What remains:

- A few **grey fragments of tree trunk** survive the mask at some card edges — tighten the
  crop boxes or raise the warmth threshold per figure.
- **Relative scale** was normalised per figure, not against each other, so heights disagree.
- **Six figures for the whole cast** means visible repeats. **Cranach's nymph and Cellini's
  Fontainebleau nymph are already in the gallery and uncut** — cutting them would widen the
  range beyond one painter's studio, and both are named in `research/nymphs.html` as the
  project's own references for proportion and drapery.
- Poliphilo, Polia and the Queen still take whichever cutout the name-hash lands on; the
  named characters should get chosen figures rather than assigned ones.

### 2. Architecture still not "well detailed" everywhere
Goal set 2026-09-05: *"make sure we have all the parts we need of each fountain built and
displaying, and the same goes for all the other architectural features."*

- **Folio 80's fountain.** The station labelled *Fountain of Venus* is the plate
  `woodcut_catalog` calls **"Third fountain with Graces, harpies, griffins"**. None of the
  Graces, harpies or griffins are modelled. Either model them or re-label the station.
- **Untouched by the detail pass:** the Quinta, the Bridge, the Three Doors wall, the
  Triumphs, the Cythera theatre and isle. Apply the shared classical members
  (`_column`, `_entablature`, `_steps`, `_doorway` in `HPWorldScene.js`).
- The second and third fountains of the FIVE_SENSES section (`woodcut_catalog` #22, #23)
  are not built as distinct features.

### 3. "Spare no effort to capture the details"
Ted: *"since we have such rich lists of nouns related to the gardens and architectural and
other structural features of the world of the HP we should be sparing no effort to capture
the details."* The lexicon (`research/lexicon.html`) is now the index of those nouns — work
back from it: any architectural or garden term in it that names a thing the world should
contain is a candidate asset. Check the list against what is actually built.

---

## Done

- **The documentation set** — all nine files written (2026-09-05):
  `RENAISSANCEART.md` (with the web research Ted approved, cited, and an explicit
  *what we adopt / what we reject*), `IMPORTEXEMPLARS.md` (how importing works, in plain
  terms), `NYMPHS.md`, `MYTHOLOGY.md`, `PLANTS.md`, `ANIMALS.md`, `WATER.md`,
  `ORNAMENT.md`, `VEHICLES.md`. Each says what the sources require of that asset class,
  what was built, where the code is, and — deliberately — what is still missing.

- The Lexicon gallery — `research/lexicon.html`, 101 terms from `hp.db.dictionary_terms`,
  grouped into Ted's topic areas (architecture, gardens, aesthetics, the soul & the senses),
  searchable, honest about its DRAFT status. Linked from the landing page and both sibling
  research pages. *(2026-09-05)*
- `HPTranslation.txt` — the whole translation as one file, 273 pages / 172,899 words,
  page-marked, CC0. Built by `scripts/build_translation_txt.py`. *(2026-09-05)*
- Version 3 released; v1 and v2 archived and linked from the landing page; README updated;
  `DEPLOY_STATE.md` written. *(2026-09-05)*
- The game loop cannot hang — verified by four full playthroughs and five adversarial fuzz
  runs. *(2026-09-05)*
- All thirteen graphical variants built and switchable from the Graphics menu. *(2026-09-05)*
- Commentary lenses in all three modes, and commentary that meets you as you walk. *(2026-09-05)*
- Navigation: the toolbar no longer trapped by overlays; every page has the same way home. *(2026-09-05)*
- The site is silent by design. *(2026-09-04)*
