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

### 0c. The hieroglyph vocabulary is thin (2026-09-05)
Ted: *"poliphilo trying to interpret pseudo heiroglyphics has to be a leg of the tour."*
Done — tour stop 4, *Reading the Hieroglyphs*, and a stele at the elephant carrying the
signs above and Poliphilo's reading of them below (`DECISIONS.md`). What is still weak:

- ~~The sign vocabulary was four shapes repeating.~~ **Done the same day:**
  `HPWorldScene.SIGNS` is now fifteen drawn signs — eye, vulture, fish-hook, circle,
  anchor, dolphin, bull's skull, ant, elephant, altar, ewer, rudder, grain, sun, palm —
  and `_frieze(..., { signs: [...] })` spells a named sequence instead of drawing at
  random, so two bands no longer come out as the same marks. The stele's upper line is
  the six Priki actually names on these inscriptions; the lower is the vocabulary of the
  sentence. **Which signs are attested and which are not is documented on `SIGNS` itself**
  — no sign-by-sign reading of these bands exists in the corpus, and none is asserted.
  Every other hieroglyph band in the world (the portal piers, the obelisks) inherits the
  richer vocabulary automatically.
- **The Polyandrion's five hieroglyphic medallions** (#88–#92) are catalogued and unbuilt.
- **The bridge hieroglyphs** are the ones Poliphilo remembers too late, fleeing the dragon
  (*SEMPER FESTINA TARDE*). The plaque exists; the signs he actually saw do not.


### 0b. The chess ballet is built — what it opens (2026-09-05)
Ted: *"we need to do the human chess match which the annotators to the buffalo copy of HP
were concerned about in their marginalia."* Built as the station `chess` (see
`DECISIONS.md`). It leaves three threads:

- **The rest of the Buffalo hands.** `hp.db` has five (A–E) and this used one. Hand B is
  the only annotator in Russell's whole census who identifies **Hebrew roots**, and also
  traces Plinian sources for wines, laws and architecture; Hand D is an architect's hand
  that labels features in Latin and once crosses out Hand A's comment to replace it. Those
  are two more commentary layers the world could carry.
- **The other marked folios.** `folio_descriptions` has full records for **b5r** (the
  *ambiguous gods* read as hermaphrodite metals) and **c6v** (Bacchus and Ceres as Sol and
  Luna) with the same depth as h1r. Both are stations' worth of content and neither is used.
- **The moves are a script, not a game.** The book calls it a *ballo in figura del gioco di
  scacchi* and the annotators recorded only who won, so a scripted ballet is the honest
  reading — but making the board *playable* against the annotators' three outcomes is the
  obvious next move, and `GAMIFYVRHP.md` already proposes it.

### 0a. Loose ends from removing the Atalanta side (2026-09-05)
The site is HP-only now (`DECISIONS.md`). Open questions it leaves:

- **The `/v1/` and `/v2/` archives still contain the full Atalanta site**, linked from the
  landing page as earlier releases. Kept deliberately — but if "embarrassingly crude" covers
  those too, they can be pulled in one commit.
- **`lab/emblem5.html`** (the emblem depth-methods lab) is still in the tree. Not linked
  from anywhere and not part of the site, so left alone.
- **The dormant Atalanta modules** — `AFWorldScene.js`, `EmblemScene.js`,
  `ArchivesScene.js`, `src/data/af_*.js`, `images/emblems/` (51 plates, the largest image
  set in the repo) — are unreferenced weight. Deleting them is a one-line `git rm`; held
  back only in case the parallel session has uncommitted work in them.
- **The repository is still called `EmblemsIn3d`** and the canonical URL is still
  `emblems-in-3d.vercel.app`. Renaming either breaks every existing link, so only the
  *displayed* name changed. Ted's call whether to rename.


### 0. Follow-ups opened by the full-book tour pass (2026-09-05)
The Novel tour now runs all 38 chapters (34 stops). Writing it exposed geometry the world
does not yet have:

- **Book II has no scenes at all.** Its thirteen stops are staged at dream stations by
  design (see `DECISIONS.md`), and each says so — but the temple of Diana, Polia's
  bed-chamber and the priestess's throne are named in the plates (#152–#168) and modelled
  nowhere. A decision is needed on whether Book II ever gets its own geography.
- **The five-senses bath-house** (ch. VI–VII) is not built; the stop is staged at the
  mainland fountain.
- **The water-labyrinth** of ch. IX — seven rings, a one-way current, a beast in each —
  is the book's clearest allegory and does not exist. The stop is staged at the Planetary
  Palace.
- **The Temple of Venus rite** (ch. XVIII: the seven virgins, the altar, the rose-bush
  springing to the cupola) has ten plates and no geometry.
- Two stops carry `"wc": []` because no genuine plate is in `images/woodcuts/`: **the Great
  Portal** (ch. IV) and **the Three Doors** (ch. XII–XIII). Source those two plates.


### 1. Architecture — what the detail pass has still not reached "well detailed" everywhere
Goal set 2026-09-05: *"make sure we have all the parts we need of each fountain built and
displaying, and the same goes for all the other architectural features."*

- **Cythera had its first detail pass on 2026-09-05:** the **peristyle** that bounds the
  prati on the inside (plate #121, named in `GARDENS.md` and built nowhere) is now a
  24-column corinthian colonnade with a circular entablature, open at the four crossroads;
  the **seven trophies of the disarmed gods** (#130–#136) line the road up from the landing,
  **including QVIS EVADET / NEMO**, which the tour had cited at two stops while the world
  had none of it; and the prati topiary is now the plates' **named figures** — the box man
  carrying two towers and an arch (#117), the mushroom (#120), the three peacocks on their
  altar-vase (#127), the ring-tree on its altar (#116/#125) — instead of generic spheres.
  The tiger-skin and the tunic are cut to their own outlines on an alpha canvas rather than
  hung as striped rectangles, and are drawn in ink in woodcut mode.
- **Still untouched by the detail pass:** the Bridge, and the Cythera **theatre** proper
  (the amphitheatre of plate #147 — the tiers exist as terraces but the theatre's own
  architecture does not).
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
