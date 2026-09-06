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

*One list, highest value first. It had become seven dated sections stacked newest-first,
which is a log, not a queue — the thing this file exists to prevent. Consolidated
2026-09-05; nothing dropped, and the lessons that belong in code now live in
`AssetVariants.js`, `ARCHITECTURE.md` and `RECIPES/`, not here.*

**Before building anything from this list, read `RECIPES/model-an-asset.md` step 0 and
grep the scene.** Two items below were once "missing" and turned out to be built.

---

### 0. Ted's standing brief, 2026-09-06
*"architecture … that looks like real buildings that don't have impossible floating platforms,
fountains that look like real water, gardens and trees that look like real plants, from the
names in the novel and the scholarship."* First pass done the same day (plants rebuilt on the
text's species, water, `_roof()` on three buildings). **Still to sweep:** every remaining slab
without a soffit (audit station by station); ~~the fountains' jets and basins one by one~~ (`_jet()` — a tube along a parabola with sparkle
and a splash; the folio-80 fountain built from Dallington pp. 124–127 with all its named jets
in place of the copied Cythera fountain; the sleeping nymph's fall is a jet);
`Cast.props.tree()` in the woodcut register. **Segre's knot gardens and parterres are built**
(same day, `_buildParterres`, pp. 316–318).

### 1. Finish dressing the buildings
`_drape()` exists; four hangings frame the throne in Eleuterylida's court and nothing else
in the world is dressed. Lefaivre's rule (`ARCHITECTURE.md` §0) is that cloth and precious
material **point** — they mark where the eye should go — so place them, don't spread them.

- Bare: the Temple of Venus, the theatre, the three doors.
- **Only where a source documents cloth.** Nothing documents hangings at the doors or in
  the theatre.
- **Done 2026-09-05: the four teams' furniture** — Leda's blue-silk traces and pearled
  poitrels, Europa's gold flagon-chain and ivy crowns, Danaë's netted and tasselled
  poitrels, Bacchus's twined vine-withes; plus the white elephants and the riders'
  pancarpial garlands. See `PROCESSIONS.md` §2c.
- **Already built, do not rebuild:** the curtain of Hymen at the Cythera fountain, two
  parted panels with their tie-rings, the ΥΜΗΝ plaque and the Greek motto.
- **Audit the gold** while there: move it off surfaces it merely gilds.

### 2. The architecture the detail pass has not reached

*2026-09-05, "build everything": the Cythera theatre's own architecture (#147), the Triumph of
Cupid as a procession (#143–144), the Polyandrion's five medallions (#88–92, built as unread),
the Colossus as architecture, the water-labyrinth (ch. IX), the rite of Priapus (#71), the
miracle of the roses (#84), and a Book II precinct at (44, 22) — Diana's temple, Polia's
bed-chamber with the chariot-vision, the priestess enthroned — are all built. Remaining below
is only what still has no source located.*
Ted's standing goal: *"make sure we have all the parts we need of each fountain built and
displaying, and the same goes for all the other architectural features."*

- The **Bridge**, and the Cythera **theatre** proper — the amphitheatre of plate #147. The
  tiers exist as terraces; the theatre's own architecture does not. Use the shared members.
- **Done 2026-09-05:** the second FIVE_SENSES fountain (#22) is the ΓΕΛΟΙΑΣΤΟΣ in the bath
  (Dallington pp. 117–118), built with its working trick step. (#23, the third, is the
  mainland fountain with its Graces, harpies and griffins.)
- **Done 2026-09-05: the Temple of Venus** (#71–#85, fifteen plates, previously the largest
  documented absence in the world). Built at (-30, -21) from our own translation of chapters
  XVII–XVIII: seven porphyry steps, the black landing with its Cytherean-conch intaglio, the
  jasper door with the uncertain ΚΥΛΟΠΕΡΑ and its lodestone jambs, the eight-bay drum, the
  banded pavement and ten roundels, the crystal lamp with its four gem lamps, the lantern with
  its eight turning winds, ewer-vases, hollow triangle and the moon with an eagle in it — and
  **the rite: the mysterial cistern unsealed, and Polia's torch (#77) standing head-down in
  the water, still steaming**, with the Antistita in her mitre, Polia in her tutulus, and the
  seven virgins around them. Still unbuilt there: the sacrifice proper (#78–#83) and the
  **miracle of the roses** (#84), the rose-tree rising from the altar with its doves.
- The **Triumph of Cupid** on Cythera (#143–144) is a standard, not a procession.
- The **Polyandrion's five hieroglyphic medallions** (#88–#92). No reading of them exists
  anywhere in the corpus, so they can only be built as *unread* devices — worth doing, but
  the tour must say plainly that they are unread. Its two documented inscriptions (the
  `D · M · S ·` dedication and the owl-and-lamp `VITAE LETHIFER NVNTIVS`) are built.

### 3. The Colossus — specified, attempted, reverted
Full brief in `ARCHITECTURE.md`. The third of the piazza set that the sourcebook names
("the horse, the Colose, and the Elephant"); the horse and elephant are built. **Build it
as architecture, not as anatomy** — a vaulted hall in the rough outline of a body, entered
by a doorway framed as a mouth, which is what "hybrid sculpture/building" means and what
this toolkit can actually do. The supine-figure attempt read as a row of green domes.

### 4. Lefaivre, and the sources still unread
`md\Liane_Lefaivre_…Re_Cognizing_th.md` is 15,878 lines of readable prose, contrary to
what this file and `ARCHITECTURE.md` used to say.

- **Read 2026-09-06: chapters 9 (*The Divine Body*) and 10 (*The Humanist Body*)** — six notes
  into the tour (Portal, Horse, Elephant, Temple of Venus, Polyandrion, Cythera). Her one-word
  key is *voluptas*; her flattest claim is that Poliphilo loves architecture more than Polia.
  Chapter bodies are md ll. ~8280–10640; ll. 10640+ are the endnotes, which is what a first
  read by page-number offset lands in.
- Still image-only and unread: O'Neill's *Allegory of Love*, the Da Capo facsimile, the
  Canone/Spruit emblematics volume.
- **Sophia Rhizopoulou's three botanical papers are catalogued and not on disk** — the only
  scholarship treating the HP as a botanical document, and `PLANTS.md` needs it. Findable
  open-access. Cite her only as bibliography until someone fetches them.

### 5. The marginalia not yet used
`hp.db` holds 282 annotations and 15 hands; this session used Buffalo A, B, D and E and
Chigi. **2026-09-06: Siena, Sydney, Como, Modena and Jonson are now all in the tour** — nine
notes across the Dark Wood, the Horse, the Dragon, the Portal, Logistica, Priapus, the
crossing, Book II's opening and its binding. Every hand in the census has now been heard from.
What follows is the record of what each copy is, kept for the next reader:

- **Siena O.III.38** — four hands, whose *line extensions* continue printed sentences as if
  from knowledge of the text before it was printed. Fumagalli thought them Dominican, close
  to the author. This project holds a 478-image facsimile of that copy.
- **Como and Modena** — the Giovio brothers reading the HP as if it were Pliny.
- **Sydney** — an annotator with no access to Book II, which Russell reads as evidence that
  Book II was a late and separate composition.
- **BL C.60.o.12** — Ben Jonson's hand, and the second alchemist.

### 6. Book II has no geography
Its thirteen stops are staged at the dream stations whose meaning they answer, and each
says so — but the temple of Diana, Polia's bed-chamber and the priestess's throne are named
in plates #152–#168 and modelled nowhere. **A decision is needed** on whether Book II ever
gets ground of its own.

### 7. Smaller, still open
- The **five-senses bath-house** (ch. VI–VII) and the **water-labyrinth** of ch. IX — the
  book's clearest single allegory — are not built; their stops are staged elsewhere.
- The **Temple of Venus rite** (ch. XVIII): the temple and the cistern-rite of ch. XVII are
  built; the sacrifice of ch. XVIII (#78–#83) and the miracle of the roses (#84) are not.
- **Done 2026-09-06:** the Great Portal and the Three Doors now carry the genuine 1499 plates
  (woodcuts 5, 16 and 37), copied from the corpus's `site/images/woodcuts_1499/` at 800px. The
  old `three_doors.jpg` was never the three doors — it is the wheeled vessel of f. 105 and is
  still used, correctly captioned, at the palace stop.
- **Done 2026-09-06:** Dallington itemises the elephant's base sign by sign (pp. 53–54) and
  the bridge's right-hand table (p. 93); both are transcribed now, with eight signs added to
  the vocabulary (helmet, lamp, goose, basin, spindle, vessel, sole, ark). The **portal piers
  and obelisks keep a seeded line on purpose** — the book itemises nothing there, and the
  comment in `_buildGreatPortal` says so.
- **The lexicon has now been checked against the world** (2026-09-05). Of the 101 terms,
  **39 name a thing rather than an idea** — the Architecture, Gardens, Places, Material
  Culture, Processions and Characters categories. Thirty-four of the thirty-nine are built:
  the bath, all three column orders, the fountains, the obelisks, the portal (which *is* the
  stepped pyramid), the sleeping-nymph fountain, the triumphal gate, Cythera and its circular
  garden, the elephant and obelisk, three pergolas, the topiary, the river and its bridges,
  the dark forest, the ruined temple, the voyage, the procession, and all seven named
  characters. Porphyry, jasper, chalcedony, gold and silk are all now on something. **Five are
  not built**, and four of them are already on this list:

  | missing | where it stands here |
  |---|---|
  | **Sacrifice to Priapus** (#71) | **NEW — not previously on this list.** A *full-page* woodcut, nineteen female and five male figures, the ass offered to the garden-god. It is in `gallery.json` and in the lexicon, and has no geometry. It is also the book's most explicit image, so **whether it belongs in the walkable world at all is Ted's call, not mine** — flagged, not built. |
  | **Labyrinth** (ch. IX) | item 7 below; the dream narration already promises it ("a labyrinth of water where the boats go always forward and never back") and the world does not have it. The clearest single allegory in the book. |
  | **Amphitheatre** (#147) | item 2. The theatre of Venus exists as terraces with the heptagonal fountain at their centre; the theatre's own architecture does not. |
  | **Colossus** | item 3. |
  | **Mosaic / *asaroton*** | **done 2026-09-05** — drawn as an annulus of strewn tesserae under the temple's aisle, which is what an "unswept floor" is. |
- **Done 2026-09-06: the Atalanta material is archived.** `/v1/`, `/v2/`, `lab/`, the three
  dormant scenes, `af_*.js`, `emblems.json`, `images/emblems/` and the emblem cut-outs are
  off `main` (≈93 MB) and on the branch `atalanta-archive`, tag `atalanta-archive-2026-09-06`.
  The landing page no longer links the old releases.
- The repository is still called **EmblemsIn3d** and the canonical URL is still
  `emblems-in-3d.vercel.app`. Only the *displayed* name changed. Ted's call.

---

## Done

*2026-09-05, the long session.*

- **The site is the Hypnerotomachia alone** — the Atalanta worlds, tours, games, plates
  atlas and archives graph removed; the app opens in the Dream Garden; the landing page and
  README rewritten around the book.
- **The tour covers the whole book** — 37 stops across all 38 chapters and both parts,
  253 notes, 25 cross-references, and every `half: "ours"` chapter deep-linking to the
  parallel text.
- **The Human Chess Match** — station and stop, built from the Buffalo and Chigi marginalia,
  keeping the book's inversion (queens in gold, kings in silver) because Hand E's whole
  reading turns on it.
- **Reading the Hieroglyphs** — a stop, a stele carrying the signs above and Poliphilo's
  reading below, and a vocabulary of fifteen drawn signs that `_frieze` can spell in
  sequence.
- **The Winged Horse of Unhappiness** — the piazza's first monument, five catalogued plates
  and nothing built; AMISSIO and TEMPVS, `D · AMBIG · D · D`, ΓΕΝΕΑ, the bucked cupids.
- **The Polyandrion names itself** — the `D · M · S ·` dedication and the owl-and-lamp
  device with Poliphilo's reading of it.
- **Cythera's first detail pass** — the peristyle (#121), the seven trophies of the
  disarmed gods (#130–#136) including QVIS EVADET / NEMO, and the plates' named topiary.
- **The conspectus board** at the Great Portal — sixteen members of the order named in the
  book's own words, after the Buffalo annotators' labelled pyramid.
- **The court is dressed** — four hangings framing Eleuterylida's throne.
- **Four Buffalo hands put to work** — A and B arguing over the *Equus Seianus* on the
  horse; B's Greek etymology deducing that Polia is really **Lucretia**, and his Hebrew
  roots (unique in Russell's census); D and E reading the same Bacchus-and-Ceres epigram
  as ripening fruit and as Sol and Luna; E's Geberian gloss on `D · AMBIG · D · D` (b5r)
  and his self-correction on *Mercuriale Moly*; and their labelled Great Pyramid, which
  is the ancestor of this whole project.
- **The system files** — `ROUTER.md`, eight `RECIPES/`, `15scholars.md`, a thinned
  `CLAUDE.md`.
- **Three reverts, kept as findings** — the massed animals, the supine colossus, and a
  duplicate curtain of Hymen. The lessons are in `AssetVariants.js`, `ARCHITECTURE.md` and
  `RECIPES/model-an-asset.md` step 0.


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
