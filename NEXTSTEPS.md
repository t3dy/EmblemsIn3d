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

### 1. Architecture — what the detail pass has still not reached "well detailed" everywhere
Goal set 2026-09-05: *"make sure we have all the parts we need of each fountain built and
displaying, and the same goes for all the other architectural features."*

- **Still untouched by the detail pass:** the Bridge, the Cythera theatre and isle.
  Apply the shared classical members (`_column`, `_entablature`, `_steps`, `_doorway`).
- The **second** fountain of the FIVE_SENSES section (`woodcut_catalog` #22) is not built
  as a distinct feature. (#23, the third, is now the mainland fountain with its Graces,
  harpies and griffins.)
- **Polia's torch extinguished in the altar-fountain** (#77) carries real narrative weight
  and does not exist.
- The **Triumph of Cupid** on Cythera (#143–144) is a standard, not a procession.

### 2. "Spare no effort to capture the details"
Ted: *"since we have such rich lists of nouns related to the gardens and architectural and
other structural features of the world of the HP we should be sparing no effort to capture
the details."* The lexicon (`research/lexicon.html`) is now the index of those nouns — work
back from it: any architectural or garden term in it that names a thing the world should
contain is a candidate asset. Check the list against what is actually built.

---

## Done

- **The figure cutouts finished** *(2026-09-05)* — crops tightened so the grove's trunks no
  longer come along; **Mercury** cut from the Primavera so the world's male characters are
  not handed one of the Graces; all seven scaled by ONE factor at cut time so their relative
  heights are true (Flora 1.00, Chloris 0.86); named characters given chosen figures rather
  than a name-hash — Polia takes Flora, Poliphilo Mercury, the Queen Venus. Fixed a real
  ordering bug found while verifying: the NPC idle-sway wrote `rotation.y` from each
  figure's fixed yaw *after* the billboard pass, so every card was frozen edge-on. The
  billboard pass now runs last.
- **The fifth procession** — Vertumnus and Pomona (#66), with the Four Seasons on its
  panels. *(2026-09-05)*
- **Folio 80's Graces, harpies and griffins** on the mainland fountain. *(2026-09-05)*
- **The Three Doors wall and the Quinta** given their classical orders. *(2026-09-05)*
- **Text no longer clips** — labels measure themselves, plaques fit their type to the
  stone. The Great Portal's dedication had been truncated at both ends. *(2026-09-05)*
- **The Fountain of Venus** — the invented jets removed for the book's own upwelling foam,
  and the basin un-lidded (the kerb was a solid cylinder capping the whole pool). *(2026-09-05)*
- **The triumphal cars** — emerald wheels, cornucopias, harpy feet, rose axle-ends, and the
  four reliefs per car with NEMO among them. Danaë's unicorns and the Festival of Bacchus
  corrected from the plates. *(2026-09-05)*

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
