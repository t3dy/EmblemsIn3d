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

### 0a. Ted's open call: close the stale Vercel mirror
Added 2026-09-07. Vercel is retired and Pages is the only host, but
`emblems-in-3d.vercel.app` is still up and frozen at `main.js?v=247`. Every push widens the
gap, and "Ted opens whichever link is to hand" is this project's own documented way of losing
an afternoon. Two ways to close it, both his call because both are outward-facing: **delete the
Vercel project**, or **one last deploy that redirects that URL to Pages**. Ask him.

### 0c. The gardens, after the 2026-09-07 pass
Done that day: the sward rebuilt at realistic scale and colour, the jasmine arbour at Polia's
garden, second nature north-west of the wood. Still open, in order:

- **Cythera — the twenty divisions are built (2026-09-08)**: twenty roads, twenty bosco
  compartments each of one species, twenty marble lattice fences with a gate in each and a
  named climber over each, twenty flowery lawns. What is still outstanding from Segre's
  reconstruction, and it is no longer the largest thing in the project:
  - ~~the terraces and their flights of seven steps~~ — **built 2026-09-08**, once the walker
    was given floor height. Four flights of seven at each of the four crossroads, a ridge of
    2.10 m falling through three rings into the theatre, and an ornate chariot gate on the
    ridge at each crossroad;
  - **240 fruit trees** on raised beds at the lawn corners — apples in the first order, pears
    in the second, plums with pistachios in the third. The only substantial thing left in
    Segre's reconstruction.
- **The three artificial gardens — glass, silk, and the counterfeit scent.** Hunt argues that
  illustrating them *damages* them, and that the 1499 and the 1592 both decline to for that
  reason. `GARDENS.md` §3 and item 5 of its ranked list: stage them as *described* rather than
  shown. The one place in this world where withholding is the faithful move.
- **Topiary from the plates.** The clipped forms are catalogued and unbuilt — the
  peacocks-on-an-altar-vase figure in particular. Now that `_hedge()` exists and `box` is a
  species with a leaf, a clipped peacock is a shape problem and not a material one.
- **Draw calls are ~1500 a frame** and about 2 M triangles. Nothing is wrong and there are no
  errors, but nobody has looked at where they go. The obvious suspects — the leaf-card shadow
  casters — were measured on 2026-09-08 and are **not** it: turning every one of them off saved
  19 calls out of 1539, inside the noise. Whatever it is, it is somewhere else.

### 0d. The pleasures still unbuilt (PLEASURES.md)
Updated 2026-09-08. Shade, birds, repose, visible fragrance, **the rills**, **the shaded walk**
and **the hedges' silhouette** are all built. Still open:

- **The bath's paragone.** *"Oh how exsquitely were the same Images cut, that oftentimes my
  eyes would wander from the real and liuely shapes, to looke vpon those feyned
  representations"* (p. 114). This needs no new geometry — it needs the carved nymphs of the
  frieze and the living nymphs in the water composed into **one view**, at one scale, in one
  light, or the sentence cannot happen. A camera study.
### 0g. The rest of the world is still solid
Columns are drums and the Great Portal's piers are ashlar (2026-09-08, `_ashlar`
+ `systems/Masonry.js`). Everything else that ought to be built of stones is
still one box:

- **The Temple of Venus**, the Queen's palace and court, the Polyandrion, the
  amphitheatre's ring walls, the obelisk plinths. `_ashlar(cx, cy, cz, w, h, d,
  mat, {course, block, ry, name})` does the job in one call and registers the
  structure; the only care needed is that a wall which is also a `_wallCol`
  should drop that collider when it topples (pass the collider in as `col`, the
  way `_column` does).
- **The Three Doors wall is not a candidate.** The book insists it is "hewen ovt
  in the verie rocke" and it is boulders on purpose.
- **Arches and vaults have no model at all.** An arch whose springing stone is
  eaten should fall; at present the voussoirs are one torus.
- **Nothing falls on anything.** A toppled stone passes through the ball, through
  people and through other stones, and lands on the ground plane rather than on
  the rubble already there. Stacking rubble is the obvious next step and the
  expensive one.
- **A stone thrown more than about 4 m from where it started can drift out of the
  roll-up's spatial grid**, which is keyed on its position at build time (cells
  of 4 m, searched ± 1). Toppling throws pieces 1–3 m so it does not bite today,
  but a bigger collapse would need the grid re-keyed on landing.

### 0f. Roll Up — what is left
Second pass done 2026-09-08. It now has an ending (the ladder of the seven metals to the
chemical wedding, all of it out of `hp.db.alchemical_symbols`), it bumps on anything it cannot
eat, and it knows **121 distinct names** for what it swallows — 325 things out of 88 130 are
still "a piece of the dream". Open:

- **People are just meshes.** The nymphs and Poliphilo are excluded from the merge (they
  animate) and so are censused as standalone — they come off whole, which is right — but they
  do not react. Katamari's crowds run, and this one's should at least flinch.
- **No sound**, and the site is silent by standing decision, so the mode has none of the genre's
  best joke. §2 of PLEASURES.md is the precedent for what to do instead: show it.
- **The ball never gets stuck but it never struggles either.** There is no momentum and no
  friction — it moves at a speed and stops. A little inertia would make the big ball feel big.
- **Nothing carries between rounds.** A record of the fastest wedding, kept in `localStorage`
  beside the lens set, would cost ten lines.

### 0e. Floor height is now available — go and use it
Added 2026-09-08. `Walker.floors` exists and Cythera's terraces are the only thing registered
on it. Everything else in the world is still flat, and several things that should not be:

- **the Temple of Venus's seven porphyry steps** — you walk through them;
- **the Polyandrion's crypt**, which is genuinely below the sward and reached by a stair you
  cannot climb;
- **the Great Portal's podium**, the palace slabs, the court, Polia's garden slab — all of them
  are "scenery, not ground" and were kept under half a metre for that reason. Several could
  now be their real height;
- **the Vaults**: the pits are lethal but flat, and the altars are steps you walk through.

None of it is broken as it stands. But the constraint that shaped it is gone, and the shapes
it forced are still there.

### 0. Work the coverage queue — 29 chapters have never been read against the world
Added 2026-09-07 after the vaults. `python scripts/coverage_seed.py && python
scripts/coverage_report.py`, then read `COVERAGE.md`. Nine chapters are enumerated (I, II, V,
VI, VII, XVII, XVIII, XIX, XXI); the other 29 are blind spots, not clean. **Prefer this queue
to inventing work**: it is the only artifact that can show a gap like the tunnels before Ted
does. Use `/research-chapter <numeral>` — one chapter per pass, and build nothing during it.

Known unbuilt features already in the ledger, in rough order of value:

- **The Rape of Proserpina relief** (ch. XIX, our pp. 280+) — the chapter's climax and the
  reason Poliphilo flees back to Polia. Nothing in the world marks it.
- **The three fruits taken and tasted** (ch. XVIII, our pp. 233–234, plate #85) — the rose
  bush is built; the communion is not staged.
- **The subterranean buttresses and vaulted halls** (ch. V, Dallington p. 87) — the crawl has
  corridors and pillars but no vaulted chambers.
- **Three-cubit hollyhocks** in the spheres' centres (ch. XXI, our p. 320).
- Jupiter's prayer (ch. I) and the harmony he hears (ch. II) — both dream-mode, and the
  second cannot be sound because the site is silent by design.

### 0b. Ted's standing brief, 2026-09-06 — closed
*"architecture … that looks like real buildings that don't have impossible floating platforms,
fountains that look like real water, gardens and trees that look like real plants, from the
names in the novel and the scholarship."* First pass done the same day (plants rebuilt on the
text's species, water, `_roof()` on three buildings). **Still to sweep:** every remaining slab
without a soffit (audit station by station); ~~the fountains' jets and basins one by one~~ (`_jet()` — a tube along a parabola with sparkle
and a splash; the folio-80 fountain built from Dallington pp. 124–127 with all its named jets
in place of the copied Cythera fountain; the sleeping nymph's fall is a jet);
~~`Cast.props.tree()` in the woodcut register~~ (done 2026-09-07: ink-cut leaf sprays on the species trees). Stations checked against their chapters so far: the obelisk of the Trinity, the second bridge, the palace, the court, the three doors, and the Polyandrion (ciborium, crypt, Hell mosaic, Artemisia's sepulchre, six epitaphs — pp. 246-271, #94-#112); the Great Portal checked and left; the bath rebuilt to pp. 112-115 (columns, tables, zophor, leaf-ribs, censer, reliefs). **The list is done.** The soffit sweep was run on 2026-09-07 by measurement (see DECISIONS): no unsupported slab remains. **Segre's knot gardens and parterres are built**
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

- ~~The **Bridge**, and the Cythera **theatre** proper~~ — stale: `_buildBridge`, `_buildSecondBridge` and `_buildAmphitheatre` (#147: obsidian area, three orders, mirror shell, alabaster arcade) are all built (2026-09-06).
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
- ~~The **Triumph of Cupid** on Cythera (#143–144) is a standard, not a procession.~~ Built as a car with its company, `_buildCupidTriumph` (2026-09-06).
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
- **Done 2026-09-07: Rhizopoulou 2016 fetched** (full text + Table 1 in `sources/rhizopoulou/`; 2022 is paywalled, 2017 members-only — abstracts captured) and built from: see `15scholars.md` §6 and `PLANTS.md` §1b. Was: the only
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

### 5b. The Vaults (built 2026-09-07) — what is not in it yet
The crawl under the pyramid is playable (`src/scenes/VaultsScene.js`, entry card *The Vaults*).
Built from Dallington pp. 82–87; see `DECISIONS.md`. Open, in rough order of value:
- **No sound**, per the site-wide silence rule — but the chapter is all about *listening*
  ("with my watchfull and attentiue eares, listning if the horrible monster… were drawing
  towards mee"). If the silence rule is ever relaxed, this is the place it earns its keep.
- The dragon is a single hunter with one behaviour. The chapter also has him *imagining* it
  overhead; a false alarm now and then would be faithful and cheap.
- Nothing to find but lamps. The book's own furniture down there — the "large foundations,
  and fearefull vaultes, and subterraneal buttresses" — is not modelled as rooms.
- No touch controls tuning for the crawl; the stick works but the map is hidden below 520px.

### 6. Book II has no geography
Its thirteen stops are staged at the dream stations whose meaning they answer, and each
says so — but the temple of Diana, Polia's bed-chamber and the priestess's throne are named
in plates #152–#168 and modelled nowhere. **A decision is needed** on whether Book II ever
gets ground of its own.

### 7. Smaller, still open
- ~~The **five-senses bath-house** (ch. VI–VII) and the **water-labyrinth** of ch. IX~~ — both built (the bath rebuilt to pp. 112–115 on 2026-09-06; `_buildWaterLabyrinth` the same day). Was: the
  book's clearest single allegory — are not built; their stops are staged elsewhere.
- **Done 2026-09-07: the Temple of Venus rite** (ch. XVIII, #78–#85) — the sacello built opposite the door with the jasper altar, the anclabris and its offerings, the blood-signed pavement, the rose miracle inside it (see DECISIONS).
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
  `t3dy.github.io/EmblemsIn3d`. Only the *displayed* name changed. Ted's call.

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
