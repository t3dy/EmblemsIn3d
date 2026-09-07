# Design decisions — Emblems in 3D

Directional calls made mid-build, recorded so they don't get re-litigated. Newest first.

## 2026-09-06 — Architecture against the text, station by station

The rule for this pass, and for the rest of the brief: **read the chapter, then look at the
station, and change whichever is wrong — and it is never the chapter.** Four stations went:

- **The Quinta Essentia was not in the book.** A glowing dodecahedron with four element-orbs
  is the Atalanta register. What stands at the centre of the third garden (Dallington pp.
  183–185, plate #33) is the obelisk of the Trinity — the chalcedony cube lettered ΔΥΣ Α ΛΩ
  ΤΟΣ, the red-jasper round with sun, ewer and dish of flame, the black trigon with its three
  golden nymphs and cornucopias, three sphinxes in linen veils, the gold spire with Ο Ω Ν.
  Station renamed *The Obelisk of the Trinity*, folio 119.
- **The second bridge did not exist.** The woman with wings and tortoise and the two genii
  holding the circle (#35–#36) belong on a three-arched bridge over the river in a grove of
  plane trees (pp. 191–192), not on the first bridge with the anchor. Built at (−11, 14).
- **The palace had orbs; the plate has panels.** #25 is a *panelled wall* with the planetary
  names. The seven are panels now, and the front carries what pp. 130–131 say: the labours of
  Hercules in half-relief, the gold-and-silk hanging with its two images, the three keepers,
  the gallery ceiling painted with green foliage and little birds.
- **The court's floor is the text's.** Sixty-four squares of coral and blood-green jasper, the
  pace-wide border, the knot pavement, the palm-wood settles in green velvet, the gold-plated
  wall with its jewelled lozenges (pp. 133–134).
- **The three doors are hewn in rock** (earlier the same day); **the third fountain runs**.

- **The Polyandrion had a front and no inside** (later the same day). Chapter XIX, read from
  our translation pp. 246-271 and plates #94-#112, gives the ruin a centre and a crypt: the
  hexagonal porphyry ciborium over a grated shaft, the round marble-vaulted crypt under it on
  six dwarf columns with the brass altar-furnace inscribed to Pluto, Proserpina and Cerberus,
  the tribune whose vault carries the mosaic of Hell, the porphyry sepulchre of Artemisia
  drinking her husband's ashes, and six of the epitaphs in the book's own words. The crypt is
  genuinely below the sward — the ground plane is cut for the grate and the stair-pit
  (`_holedGround`) — and since the walker has no floor height the pit is kerbed and fenced:
  you look down the stair and through the grate, as Poliphilo first does, rather than descend.
  The Great Portal was checked against Bury and left as it stands.

- **The bath's frieze was invented; the bath's fabric was missing** (later still). Dallington
  pp. 112-115 give the whole building: jacinth-waved Corinthian columns in the corners, black
  polished tables between them bordered in coral jasper with an ivory nymph in each, a zophor
  of naked boys wrestling and riding water-monsters (the "children with green boughs" were
  ours, not the book's), oak-leaf ribs of green jasper on gilt stalks up the crystal spire,
  the lion-head censer on orichalc chains two cubits above the water, the fish mosaic under
  the water, the cleft of burning matter that fills the censer, and Arion and Poseidon on
  their dolphins over the door and the cold fountain. All built; the frieze and the two
  reliefs are drawn textures rather than modelled relief.

Every station on the 2026-09-06 list has now been checked against its chapter.

## 2026-09-07 — The sacello: the rite moved to where the book holds it

Chapter XVIII's sacrifice was staged at an altar standing loose in the drum. Our translation
pp. 219-234 puts it in **the round and blind sacello of phengite**, opposite the temple door,
joined to it, windowless and lit through its own stone, entered by golden valves (plate #80's
aedicule with the shell). Built: the sacello and its gem pavement; the altar of one jasper as
pp. 221-223 describe it, stem, trochlea, calyx, knot and the gold platter with its hung gem
strings; the anclabris before the valves with the swans, the bound turtledoves, the basket of
roses and oyster-shells and the urn of sea-water; the golden candelabrum, the hyacinthine urn,
the ritual book; the characters signed in blood on the pavement, the sponge, the ewer and
simpulum; and the rose-bush rising from the platter to the cupola with its three doves. The
blood characters are strokes, not a reading — the book gives no forms — and the note says so.

## 2026-09-07 — The dragon is one shape, three times

Two corrections from Ted, in order. First: "I liked the way the dragon looked before" — the
stretched-out flying body was thrown away and the mount became the vaults' dragon itself.
Then, of that dragon: "I thought one of the triangular wings was its head! Can you change its
head so that it's a triangle with the sticks coming off identical to the complex objects that
are the wings?" and "I want the wings to connect to the dragon's body at their sharpest
angle."

So the creature is now cut from one figure — a **membrane**: a triangular vane that meets the
body at its POINT and opens out from there, on three ribs radiating from that same point
(`animals.dragon`, the local `membrane(L, W, rr)`). Three of them:

- **the two wings**, both points planted on the same vertebra of the spine (`pts[4]`), splayed
  up and swept back. They used to float beside the body with their *broad* edge inward, which
  was wrong twice over — not touching the body, and the wrong way round.
- **the head**, which is NOT the wings' vane turned round — Ted read his own plate back to me:
  "the triangle looks like the dragon's head and the black sticks look like whiskers sticking
  out on the sides… the point of the triangle with the acutest angle should be the front of the
  dragon's head, with the shortest side of the triangle being the part that connects with the
  body… tilting down slightly at a 20 degree angle and slightly separated from the tube of the
  body, with the ability to pivot and look around", and no eyes. So: a 34° apex leads; the base
  (the shortest of the three sides, since HL > √3·HW) meets the neck; six whiskers come off its
  flanks, three a side, splayed wider than the vane's own edges so they show; it droops 20°; it
  stands clear of the tube by 0.24 of the body scale; and it hangs on a pivot the flight
  controller turns, so it leans into the bank, follows the climb and looks slowly about it.
  The ball head, the horns, the jaw and the eyes are all gone.

Each wing hangs on a `beat` group (the flight controller's hinge) over a `splay` group (the
fixed set), so beating never loses the set. The head hangs on an aim group over a lean group
over a flat group, for the same reason. `flyingDragon` is now just `animals.dragon` — the
mount and the fixture in the vaults are the same beast, which is right: there is one dragon
in the book.

## 2026-09-07 — A fourth way in: fly the dream as the dragon

Ted: "a fourth mode of exploring the HP where you can fly around as the dragon. The point
of view should be from behind and slightly above the dragon but the user should have
control over the camera to move it further away or closer or rotate it." Built as
`src/systems/DragonFlight.js`: a third-person flight controller (heading, climb, speed, bank;
W/S, A/D, R/F, Shift, digits swoop to the wonders, Esc lands) with an orbit camera the reader
owns — drag swings it round the dragon, wheel or +/− change the distance, C resets it to
behind-and-above. The mount is **the vaults' dragon itself** — Ted: "I liked the way the
dragon looked before" — the coiled, crested serpent with the ribbed triangular wings of plate
#16, unchanged in shape; `Cast.animals.flyingDragon` only re-parents its two wings onto hinge
groups at the shoulders so the controller can beat them. (A first attempt at a stretched-out
"flying" body was thrown away the same hour.) The walker is locked and parked under the dragon; landing puts it back. The
station commentary keeps working from the air, with a wider radius. Fourth card on the entry
screen. The dream's mood lens and the tour do not run in flight.

## 2026-09-07 — Rhizopoulou fetched; the ground flora is the book's

Ted: "download the papers, build everything you can". The 2016 paper was free-to-read but
its publisher refuses scripted requests; its full text and Table 1 were captured through the
project's browser into `sources/rhizopoulou/` (the PDF binary could not be saved by any
sandbox route short of streaming it through the model; not worth it — the text is what we
use). The 2022 supplement is paywalled and the 2017 conference paper members-only; abstracts
kept, purchase is Ted's call. With her signatures the ground flora went in: the stream of
ch. II, the palace fields' colours, Geusia's river, the Polyandrion's weeds and fig and
cedars, Cythera's herb bands — each from the book's own words, with her identification.

## 2026-09-07 — The woodcut register is bracketed

Ted: the woodcut view "doesn't really look right … so many grid textures". It is a
per-material object-space hatch, which is why it grids; the analysis and the fix (a
screen-space edge pass and screen-space single-direction hatching driven by light) are in
`WOODCUT.md`. Nothing more is built for that register until that plan is taken up.

## 2026-09-07 — The woodcut register draws the same trees as the garden

The woodcut view defaulted to the primitive cone trees "for a readable silhouette". The plates
do not draw cones: #86 has plane trees, #94 ivy, the Cythera plates cypresses. So the woodcut
register now builds the same eighteen species as the lit garden, with each leaf spray cut in
ink — an ink silhouette under a paper leaf, unlit (`_leafCardTexture` ink mode,
`_leafCardMat`). The primitive variant stays selectable in the Graphics panel; it is no longer
any register's default. The queue item "`Cast.props.tree()` in the woodcut register" is closed.

## 2026-09-07 — The floating-slab sweep, by measurement

Ted's brief named "impossible floating platforms". Rather than eyeball 21 stations, the scene
was built in the browser with `_compileDrawCalls` stubbed (47,670 meshes, unmerged) and every
mesh wider than 0.7 m in both x and z with its underside above 1 m was tested for a supporter:
any other mesh overlapping it in plan whose top reaches within 0.4 m of its underside. **Zero
slabs failed**; the only three hits were leaf cards on Cythera, which hang by design. A visual
pass through all 21 stations agreed. The earlier `_roof()` work and the rebuilt stations had
already removed what Ted saw. The sweep is closed; if a platform ever reads as floating again,
the measure is the one above, not a hunch. (One station fix fell out of it: the court's spawn
stood nose-to-nose with the bath's new east table, and moved 2.4 m east.)



Ted: *"I just want the atalanta stuff archived so we can focus on the HP … We still have a lot
of work to do on the architecture so that it matches the descriptions in HP and looks like
real buildings that don't have impossible floating platforms, and fountains that look like
real water. The gardens and trees don't look much like real plants. You were supposed to read
the scholarship and the novel itself and get the actual names of the plants and trees and
render them accordingly."*

**Archived.** Branch `atalanta-archive` and tag `atalanta-archive-2026-09-06` hold everything;
`main` lost `/v1/`, `/v2/`, `lab/`, the three dormant scenes, `af_*.js`, `emblems.json`,
`images/emblems/` and the emblem cut-outs (≈93 MB). The landing page no longer links them.

**Plants, from the text.** `PLANTS.md` §1 is now the book's own list with the place each
species is named for: oak, beech, elm-with-vine and fir in the wood (1592 l. 625); the cypress
avenue and the citron/orange/lemon enclosure on the way to the palace (p. 123); myrtle about
Venus; the bosco's compartments of cypress, pine, juniper, olive, laurel, arbutus, palm,
orange, plane (our pp. 317–318); the spice wood of citron, juniper, terebinth, almond (p. 324).
`_tree()` is rebuilt on a species table with **leaf-spray cards** in the species' own leaf
form over a dark matte core — foliage the light comes through, not blobs. Two lessons from
looking: a card must be about half a metre whatever the tree (sized to the crown it read as
a two-metre leaf), and the number of cards is a *coverage* — ~8πr²/size² — not a constant
(forty on a metre crown left the core showing as a ball).

**Water.** `_waterMat()` is a mirror finish that takes the environment map, a tiled ripple
normal map whose offset drifts every frame, and a cool tint you can see through to the bed.
The old painted rings stay underneath as the bed.

**Roofs, not slabs.** `_roof()` puts a soffit of beams under a deck and a low tiled pitch with
ridge and antefixes over it; the palace hall, Diana's temple and Polia's chamber use it. The
rule: a horizontal plane in the air needs both what holds it up and what it does on top.



Ted: *"go! go! go! build everything!"* — in reply to a report whose two open questions were
whether the rite of Priapus belonged in the walkable world and whether Book II should have
ground of its own. Both are taken as answered **yes**, and both are built. Priapus is built
as the plate draws him, a herm on the altar, and no more explicit than plate #71 already in
the gallery. Book II gets a precinct at (44, 22), east of the meadow — Treviso in the dream's
own east — and its seven interior stops move onto it.

Also built in the same pass, each from the page it cites in its code comment: the
water-labyrinth (Dallington pp. 177–180, since neither early edition illustrates it), the
Colossus as architecture (per the brief in `ARCHITECTURE.md`; the reverted anatomical build
is not repeated), the amphitheatre of Venus (our pp. 350–352), the Triumph of Cupid as a
procession (p. 341), the Polyandrion's five medallions **as unread devices, labelled so**,
and the miracle of the roses (p. 224).

**Then both of those were built after all** ("just do your best with the text we have"). The
second fountain (#22) turned out to be the **ΓΕΛΟΙΑΣΤΟΣ** inside the bath — Dallington pp.
117–118, the golden nymphs holding the boy who pisses cold water into the hot pool, and the
trick step "like the Keye and Iacke of a Virginall" that makes him aim at whoever treads on
it. The step works: stand on it and he does. The *asaroton* is drawn, not modelled — the
"unswept floor" is a type (Sosus of Pergamon), so an annulus of tesserae strewn with leaves,
flowers, a mouse and a fish under the aisle is exactly as much as the text licenses.

## 2026-09-05 — The Temple of Venus, and the walker has no floor height

Fifteen plates (#71–#85) and no geometry: the largest documented absence in the world, and
the one the queue named twice. Built at **(-30, -21)**, west of the grove with the sea and
Cythera behind it, entirely from **our own translation** of chapters XVII–XVIII
(`translation/en/page_209.md`–`page_217.md`, CC0). Godwin is in copyright, is not in the
corpus, and was not consulted.

The station is `venus_temple`, discoverable rather than on the digit row (the row is full),
and the two tour stops for chapters XVII and XVIII moved onto it from `fountain`, where
they had been staged for want of anywhere better.

**A constraint worth writing down: the walker has no floor height.** It walks the world at
y = 0 with a fixed 1.7 eye, so a podium is scenery, not ground. The temple first got seven
proper 17cm steps — and the interior floor then sat 1.19 above the dreamer's feet, leaving
him chest-deep in his own temple and every figure in it sunk to the shoulders. The seven
steps are still seven, because the book says seven, but each is 6cm: a crepidoma read from
outside rather than a stair climbed. **Every raised thing in this world has to stay under
about half a metre until the walker gains a floor.** The chess stylobate is 0.43 for the
same reason.

Two other things learned by looking rather than by reasoning:

- **White marble blows out under this key light.** The first interior was a white void with
  coloured saucers on the floor. The pavement is not white anyway — the book bands it in
  porphyry and ophite — so the field went to warm stone, the marble dropped to 0xd6cdb6,
  and the roundels became flush inlay at 0.36 rather than 0.52 dinner-plates.
- **A doorcase needs its returns.** The door bay is 4.7 wide and the case 3.6; without two
  short walls flanking it the case stood in the middle of a hole and read as a red screen
  parked in front of the building.

## 2026-09-05 — The chess pieces wear the book's costumes, not Russell's (Ted)

Ted: *"the players in the human chess board should be wearing costumes that make them look
like chess pieces, or whatever the text of the HP says they look like."* The text says,
rank by rank, so the text won.

**The costumes, f. g8r.** *"Sedeci erano di panno aureo (ma octo uniforme) vestite"* —
sixteen in cloth of gold, **but eight of those uniform**, without difference of degree. The
ranked eight are each named: one *di habito regale*, one *in vestito di regina*, *dui
custodi della rocha o vero arce* (two keepers of the rock, or citadel), *dui taciturnuli o
vero secretarii* (two little silent ones, or secretaries), *dui equiti* (two horsemen).
Sixteen more in cloth of silver, *cum il magistrato medesimo*. Every one of the thirty-two
now wears her office: a turret, a barred helm and plume, a clerk's cap and a sealed letter,
two crowns — and for the eight uniform ones, the garland and nothing else.

**No mitres.** Dallington 1592 is careful where the English chessman is his and not
Colonna's: *"two tower-keepers or Rookes, **as wee tearme them**, two counsell-keepers or
Secretaries, **wee tearme them Bishoppes**."* There is no bishop in the *Hypnerotomachia*.
The third rank is a silent secretary who moves on the diagonal, and is dressed as one.

**The uniform of all thirty-two**, from the second round: *"cum le sue copiose trece sopra
le delicate spalle effuse ... nel capo innexe cum corolla di olente viole"* — tresses loose
over the shoulders, heads bound with a garland of sweet-smelling violets. Both are painted
on every piece, and the garland is the only mark a pawn carries.

**And the livery is now by side, reversing this session's earlier call.** The first build
dressed *both* queens in gold and *both* kings in silver, on Russell's report that "the
queen piece of both sides ... is dressed in gold ('vesta d'or'), and the king of both in
silver" (2014, p. 188) — the inversion that lets Hand E read the match as the correction of
the Geberian ideal. **Neither phrase Russell quotes occurs in the printed text.** The 1499
puts the sixteen gold opposite the sixteen silver, and draws both crowned figures from
*quelle sedeci vestite di oro*, the same sixteen. So the quoted words are almost certainly
the annotator's own, for what he saw — and putting a scholar's gloss on the book's body is
backwards. Each side wears one cloth; the inversion is stated as Russell's claim, on the
plaques and in the tour note, where a reading belongs. **Rule 2 cuts both ways: cite, don't
invent — and don't promote a citation to a fact of the text when the text is on the shelf.**

**Where the work went.** `Cast.paintedFigureTexture({ rank })` paints the costume into the
card (the default figure variant, so this is what a walker sees) and `Cast.nymph({ rank })`
builds it for the assembled rungs. `panno aureo` also gets a brocade diaper, since cloth of
gold is woven through with metal thread and that is why the book names the cloth and not
the colour — it is also what finally separates the two sides across a nine-metre board.

## 2026-09-05 — The Human Chess Match, built from the margins (Ted)

Ted: *"we need to do the human chess match which the annotators to the buffalo copy of HP
were concerned about in their marginalia."* Built as the station **`chess`**, west of the
Planetary Palace, and as **stop 9 of 35** in the Novel tour.

**The evidence, and the order it was used in.** The scene is at signature g8r–h1r
(facsimile pp. 111–113). `page_concordance` records **`has_woodcut = 0` on all three
pages**: the 1499 does not illustrate it. So the source order that `RECIPES/model-an-asset.md`
lays down — plate first, then scholar — has no plate to start from, and the station is built
from the text and from `hp.db.annotations` / `folio_descriptions` / `annotator_hands`, which
is exactly what Ted asked for.

**Buffalo Hand E** (Buffalo & Erie County Public Library, 1499 — five interleaved hands, the
most densely annotated copy in Russell's census; Hand E an alchemist of the pseudo-Geber
school) read the match as three rounds of distillation and recorded each result:

| Round | Winner | Hand E, in the margin |
|---|---|---|
| I | silver | `Argentum` + a drawn crescent moon; `Rex ex argento factus victor remanet` |
| II | silver | `argentum rex ex argento factus victor secunda vice remanet` |
| III | gold | `Rex ex auro factus victoriam ultimam… triumphat`, revised to `[Re]gina`, `aura`, `☉ uestita`, `victrix`, then cancelled and closed with `Auru(m)` |

**Fabio Chigi** (Vatican Chig.II.610) read the same pages as theatre: *comincia a descrivere
il ballo in figura del gioco di scacchi cosa bella* (g8r), *Torna di nuovo al gioco ò ballo*
(g8v), *terzo ballo ò gioco* (h1r).

**The binding decision: keep the book's inversion.** The HP dresses the **queen of both
sides in gold** and the **king of both sides in silver**. That is the wrong way round for
Hand E's own system — Sol is gold and masculine — and it is precisely what his whole reading
turns on: a king *made out of silver* wins twice, and gold only takes the third round. So
the liveries are not decoration and must not be "corrected" to conventional chess colours by
a later pass. (Russell 2014, pp. 188–190; `hp.db.folio_descriptions` h1r.)

**Second decision: the ballet is scripted, not simulated.** The book calls it a *ballo in
figura del gioco di scacchi* — a dance in the figure of the game — and the annotators
recorded only who won each round, never a move. A chess engine would therefore be inventing
evidence. The three rounds are a fixed script; the only facts asserted are the ones the
margins carry: three rounds, captures sealed with a kiss before the taken piece leaves the
board, silver, silver, gold. `_chessUpdate` is a forward-only state machine for the same
reason `DreamMode` is — a missing piece or a stale square ends the move rather than stalling.

Also corrected here: `ARCHITECTURE.md` said the ballet "is illustrated." It is not.

## 2026-09-05 — The site is the Hypnerotomachia alone (Ted)

Ted: *"I'd like to remove all the atalanta stuff from the website as it's embarrassingly
crude and just focus on the HP stuff."* This **reverses the standing rule 4** ("leave the
Atalanta side alone"), which existed only because that side was being worked in a parallel
session.

**Removed from the shipped site:**

| Gone | What it was |
|---|---|
| the **Atalanta Animata** world | the wall of 51 lit woodcut plates, and the five hand-built showcase emblem scenes |
| the **Theatrum** world | all 51 emblems as animated vignettes around a rotunda (`AFWorldScene`) |
| the **Plates** atlas | the 2-D emblem atlas and its lightbox |
| the **Archives** graph | the HP-folio ↔ AF-emblem cross-reference network (`ArchivesScene`) |
| four of the five **tours** | The Scholarship, Chemical Symbolism, The Great Work, The Two Books |
| the **games** | `games/` — Oracle, Fugue Scroll, Stage Sorter, Memory (deleted from the tree) |
| the emblem **HUD** | the stage badge, the ←/→ emblem stepper, the "← Gallery" button, the marginalia panel |
| three **data files** | `emblems.json`, `world_links.json`, `diorama.json` are no longer fetched |

**Kept.** The Gallery (25 plates, all HP-relevant), the visual novel in `game/`, the three
research pages, and the `/v1/` and `/v2/` archives — those are labelled as *earlier
releases*, which is a different claim from "this is the project", and the citability
decision that created them still stands. Say the word and they go too.

**Kept on disk but dormant.** `AFWorldScene.js`, `EmblemScene.js`, `ArchivesScene.js`,
`src/data/af_*.js`, `lab/`, `images/emblems/`. Nothing imports them; they are not deleted
because a parallel session may hold uncommitted work in them, and git history has the rest
anyway. **Do not re-wire them.**

**Consequences worth knowing:**

- The app **opens in the Dream Garden** now, not on an emblem scene. `#emblem=N` and
  `#theatrum` deep links are gone; `#hp`, `#dream`, `#gallery` and `#tour=novel` remain.
- The toolbar is Home · Woodcut view · The Dream Garden · Tours · Gallery · Graphics ·
  Translation · Lexicon — the last two are new, and point at the research pages, which
  previously had no route in from the app.
- `getEnvMap()` was the only thing the HP world still needed from `EmblemScene.js`. It is
  extracted to **`src/systems/EnvMap.js`**, so no emblem code loads to light a garden.
- `HP_STATIONS` no longer carries its per-station `emblem:` cross-reference.
- The `Cast.js?v=15` pin in `AFWorldScene.js` no longer matters — nothing loads two
  versions of `Cast.js` any more.
- **The displayed site name changed** from "Emblems in 3D" to **"The Dream Garden of
  Poliphilo"** across the landing page, the app and the research pages. The repository, the
  Vercel project and both URLs keep their existing names, so no link breaks.
- The landing page was rewritten from scratch around the HP.

## 2026-09-05 — The tour covers the whole book; the system files become a router (Ted)

Two calls, made in one exchange.

1. **Tour coverage: all of it.** Ted: *"extend it as much as necessary to cover all the
   scenes in the book. There are no limits to our time and space we are vibe coding, so
   don't feel like that's too much. This is meant to be a comprehensive digital humanities
   resource."* The Novel tour therefore grew from 14 stops to **34, covering all 38
   chapters plus Polia's epitaph** — including the three narrative sections it had missed
   entirely (FIVE_SENSES, the VENUS_TEMPLE rites, and the whole of Book II).

   **Book II has no geography of its own** in this world — it is set in Treviso, in the
   temples of Diana and Venus, and its plates are interiors. Decision: stage each Book II
   stop at the station of the *dream* whose meaning it answers (the Polyandrion for the
   deaths, the theatre of Venus for the priestess, the Quinta Essentia for the vision among
   the gods) **and say so in a note**, rather than build a second world or omit the book.

2. **System files: a router plus recipes.** Ted, asked to choose: *"Both — router plus
   recipes."* So:
   - **`ROUTER.md`** is the entry point: five hard rules, a task→documents table, the
     subject briefs, the code map, the agent lanes, and an end-of-session checklist.
   - **`RECIPES/`** holds one procedure per repeated task, each ending in a
     *"what has gone wrong here before"* section — the failure, not just the happy path.
   - **`CLAUDE.md` is now thin** and points at the router; it carries only what must be in
     context from the first token.
   - **`15scholars.md`** is the depth layer: what each scholar settles, where their text is
     on this machine, and *the claim it will not support*.
   - The planning-era docs (`INDEX.md`, `PLAN.md`, `STATUS.md`, `HANDOFF.md`,
     `PROJECT_SUMMARY.md`, `COMPLETE_BRIEFING.md`, `SCENES.md`, `VISION.md`,
     `TWO_WORLDS_FRAMEWORK.md`, `docs/*`) are marked **historical** in the router: mine
     them for research, never for current status or file layout.

3. **Agent orchestration.** Ted: *"depends on what is best for the project you know more
   about systems engineering than I do."* Call: **single-agent sequential stays the
   default**, because the work is coupled through `HPWorldScene.js` and the manual `?v=`
   chain. Parallel runs only along the five file-disjoint lanes named in `ROUTER.md`, with
   one agent owning the version bump and the deploy.

## 2026-09-05 — Art direction: a Botticelli panel you can walk into (Ted)

Answers to a direct art-direction question. These are the goals for the art; read them
before building or revising any visual asset.

1. **Register: painterly / tempera — not photoreal.** The lit Dream Garden should read as
   *a Botticelli panel you can walk into*. Method: painted and procedural albedo, a
   toon-ish ramp in the lighting, a limited period palette, and the outlines retained.
   The accepted risk is that it reads "illustrated" rather than "real" — that is the
   intent. It also unifies hundreds of assets cheaply, which photoreal would not.
   → **Do not chase photorealism.** A scan that fights the painted register is worse than
   a well-painted procedural form.

2. **Figures: build several approaches and let the player choose.** Ted: *"try various
   approaches and let me choose between with drop down menus in a graphics menu that's
   accessible from all the modes free walk/tour/game."* So the AssetVariants registry gets
   a **user-facing Graphics menu**, reachable from every mode, with a dropdown per asset.
   Figures specifically should offer painted cutout cards, imported sculpture scans, and
   hand-modelled humanoids as alternatives — not one chosen answer.

3. **Web research on technique is approved**, written up with citations in
   `RENAISSANCEART.md`, including an explicit *what we adopt / what we reject* section.
   Do not write technique guidance from assumption.

4. **Asset priority order:** (1) nymphs & figures, (2) water features, (3) wall decoration
   & ornament, (4) plants, animals & vehicles. Each gets its own sourced .md as it is
   built — `NYMPHS.md`, `WATER.md`, `ORNAMENT.md`, `PLANTS.md`, `ANIMALS.md`,
   `VEHICLES.md`, plus `MYTHOLOGY.md` and `IMPORTEXEMPLARS.md` (what was imported, from
   where, under what licence, and how).

5. **Ted wants to understand how importing works.** Any import route must be written down
   in `IMPORTEXEMPLARS.md` in plain terms — source, licence, file, size, how it is loaded
   — not left implicit in code.

## 2026-09-05 — Every asset gets swappable variants; imported scans allowed (Ted)

- **Imported scans are approved to try** for the graphical assets, extending the earlier
  reversal that allowed model imports (the marble Venus was the first).
- **But no asset gets one implementation.** Ted: *"you should have various options as
  alternatives that we can bring in and out for each of the graphical assets and gradually
  improve and evolve everything."* So each asset — elephant, tree, nymph, Venus, portal —
  carries a **registry of named variants** that can be switched at runtime, not a single
  hard-coded build. Typical ladder per asset:
  `primitive` (the founding manifesto look, and the woodcut-mode fallback) →
  `massed` / refined procedural → `scan` (an imported CC0 model).
- **Never delete the older variant when a better one lands.** It stays selectable. This is
  how the work evolves without losing the earlier register, and it keeps woodcut mode
  honest (it wants the primitive silhouette, not a photoreal scan).
- The choice is per-asset, persisted, and independent of the render style and of the
  interpretive lens in `DESIGN.md` — that lens is about *meaning*, this registry is about
  *fidelity*. Don't conflate them.
- **Model the shape from the sources, whichever variant.** `SOURCES.md` has the
  "Modelling the 3-D assets" table (elephant/obelisks → Curran + `woodcut_catalog`; nymphs
  and Polia → Stewering + `research/nymphs.html`; statuary → Nygren; architecture →
  Lefaivre), and `src/data/gallery.json` holds the Renaissance exemplars already gathered
  for exactly this — including **Bernini's Elephant and Obelisk**, the direct descendant of
  the HP woodcut. Consult these BEFORE modelling, as with the words.

## 2026-09-04 (evening, final) — The site is SILENT. No audio anywhere. (Ted)

- **No music, no ambient bed, no sound of any kind** — not during the guided tours,
  not in Poliphilo's Dream, not in the Atalanta worlds, not on any page. This
  **supersedes** the earlier call the same evening to restore the ambient score.
- Silence is **structural, not a volume setting**: `AlchemicalAudio` is a no-op stub
  that constructs no `AudioContext` at all, and the first-gesture unlock listeners are
  gone from `main.js`. The stub is kept (not deleted) so the existing `setStage` call
  sites stay valid and nobody reintroduces sound while "fixing a missing import".
- **Do not add audio to this project without Ted asking for it.** Two successive
  attempts at a soundtrack (the Tone.js ambient bed, then a chiptune) both ended up as
  noise in his speakers. The prior ambient implementation is in git at `ab5f82b` if it
  is ever wanted; restoring it is a deliberate act.
- Verify silence by **proxying `AudioContext`, `AudioScheduledSourceNode.start` and
  `HTMLMediaElement.play`** and exercising the site — not by reading the diff.

## 2026-09-04 (evening) — `hidden` must always win in the app's CSS

- A full-screen overlay (`#tour-flavor-chooser`) carried the `hidden` attribute but
  its own rule set `display: flex`, which outranks the UA's `[hidden]{display:none}`.
  The empty overlay therefore sat over every page at 90% opacity with
  `pointer-events: all` — the site loaded dark and frozen. There is now a global
  `[hidden] { display: none !important; }` guard in `src/index.html`. **Keep it**, and
  prefer the `hidden` attribute over ad-hoc display toggling.

## 2026-09-04 — Creative brief for the whole work (Ted)

- **Fidelity first, interpretation in the commentary.** Model the world as close to the
  literal 1499 Hypnerotomachia (woodcuts + text) as possible; the commentary layer carries
  the Renaissance contexts, the competing interpretations, and the *alternate realizations*
  a scene might have had. Don't impose an aesthetic reading onto the geometry — let the
  toggleable notes do the interpreting. (The marble Venus is faithful: the book puts a
  statue in that fountain.)
- **All four moods coexist:** antiquarian wonder, melancholic dream, erotic-mystical, and
  uncanny/oneiric. The world should hold every register, not pick one.
- **All three player stances exist:** you-are-Poliphilo (the first-person love-quest, the
  Logistica/Thelemia reason-vs-desire choices), the scholar-visitor (the current museum/
  tour/edition stance), and Polia's side (her Book II counter-narrative, cf. the Dee
  project's AngelPOV).
- **Keep it literary; add alchemy as a toggleable commentary flavour.** The primary
  register stays the love-dream/antiquarian romance, NOT a cipher. But add the alchemical
  reading — "as charted by James Russell" (Ted) — as a new colour-coded commentary type in
  the tour's note system, toggleable on/off like every other flavour. **Blocker:** need
  Russell's actual source (link/PDF/passages) before writing the alchemical glosses — will
  NOT invent readings and attribute them to a real named scholar. Meanwhile the toggle
  infrastructure + the empty "alchemical" category can be built.
  → Implied feature: commentary types become independently **toggleable** in the tour
    (turn each colour-coded flavour on/off), matching how the POV/render modes toggle.

## 2026-09-04 — Figures, Gallery, and aesthetic scope (Ted)

- **Imported 3-D models are now allowed.** This *reverses* the founding "primitive-only
  geometry — no 3-D model imports" manifesto still described on the homepage
  (`index.html`, Creative Decisions). Figures may now use `GLTFLoader` + self-hosted
  model/texture assets to reach near-photoreal Renaissance bodies. Primitive figures
  remain the fallback and the woodcut-mode style; imported models are added where a good
  public-domain scan exists, highest-value figures first (Venus at the fountain, Polia,
  Cupid). Keep licences CC0 / public-domain where possible and record provenance.
  → When the first models ship, update the homepage Creative-Decisions section so it no
    longer claims "no model imports."

- **New "Gallery" tab** in the 3-D app's world-nav: a gallery of Renaissance (and
  relevant medieval / early-modern) art exemplars for everything we build — architecture,
  nymphs/Venus, triumphs, gardens/Cythera, hieroglyphs/emblems, tombs — shown alongside
  the 1499 HP woodcuts themselves. Built like the Plates atlas (grid + lightbox).

- **Gallery images are self-hosted**, not hotlinked. Public-domain images are downloaded
  into `images/gallery/` (via `scripts/fetch_gallery.py`, which keeps only files that
  actually resolve to real images), and `src/data/gallery.json` is the provenance-tracked
  manifest. Rationale: the site must not depend on Wikimedia Commons uptime. (Note: the
  older `research/nymphs.html` still hotlinks Commons — leave it, or migrate later.)

- **Aesthetic registers to draw on:** the 1499 Venetian woodcut (the book's own line,
  the woodcut render mode), Botticelli / High-Renaissance painting (lit-mode Venus, Polia,
  nymphs), Quattrocento sculpture & relief (Mantegna, della Robbia — architecture and the
  gods' statues), plus any relevant medieval or early-modern exemplars.
