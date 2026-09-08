# Design decisions — Emblems in 3D

Directional calls made mid-build, recorded so they don't get re-litigated. Newest first.

## 2026-09-08 — Every addition is thought through in all five modes, and written up

Ted: *"think about how we need to update the writing and mechanics and other assets for each
of our modes (walk, fly, tour, game, roll) as you go. Make sure you are continuing to output
.md files detailing all the stuff you're adding and how it plays out in each mode and with
the commentary layers."*

So: **`MODES.md`** defines the five modes, the ten layers and a standard **"How it plays"**
table; every subject brief ends with that table, filled in honestly, *nothing* being an
acceptable cell if it is true and deliberate. Ten briefs written today under the rule:
`BANQUET`, `CROSSING`, `ADONIS`, `MASONRY`, `LITTER`, `ROLLMODE`, `CHESSBOARD`,
`DRAGONFLIGHT`, `MUSICIANS`, `HARPIES`. `ROUTER.md` carries the rule and lists them.

What the rule found on its first pass — the point of having it:

- **The tour called the boat's standard a sail.** Stop 21's *gloss* said "the three signs on
  the sail"; the book has no sail (p. 290: Cupid "making sail with his spread wings") and the
  world no longer has one. Fixed, with the reason.
- **Three new stations had no *quotation* note.** The banquet, the boat and the tomb were in
  the world before they were in the tour's own words. Six notes added (stops 9, 21, 25).
- **Poliphilo's layer had nothing at the banquet and nothing at the tomb.** He does speak at
  the supper — to himself, twice (pp. 155–156) — and he pointedly does not at the tomb
  (p. 374). Two utterances and one silence added; the palace-sequence silence note amended.
- **Roll was eating the new things in pieces.** A banquet table came off as three ebony legs
  and a cloth. `_rollGroup(id, fn)` tags everything a builder makes as one object; the seven
  tables, the five vessels, the exeres hull and the sepulchre now come off whole.
- **The Dream's paths cross none of the new colliders** — checked, not assumed.

## 2026-09-08 — Chapter X: the banquet, laid in the court at last

Third pick of the coverage ledger, and the biggest so far. Chapter X is Dallington's
most sustained material description — **fourteen facsimile pages of a supper** — and
the tour has said "the banquet" in two stop ledes since the commentary was written.
The world had the throne, the chess-board pavement of coral and blood-green jasper,
the settles of palm-wood and green velvet, and **no banquet**. Four woodcuts belong
to it and were attached to no chapter (#28 the ornamented tripod, #30 the tripod
with three naked boys on a lion-footed pedestal, #31 the vessel with the coral
tree, #32 the great vessel twice a nymph's height). They are attached now.

**`_buildBanquet`**, in the court, *"in the middest of this admirable and stupendious
Court"* (p. 147), which is where the book puts it:

- **Seven tripod tables of ebony** on lion's claws, a winged child's head on every
  leg and a garland of leaves and fruit slung between (pp. 143–144, plate #28).
- **The seven changes as seven tables.** The book changes the table, the cloth, the
  flowers, the waiters' dress and the vessels' stone at every course, and none of
  that can be animated without a wait; so each table stands **at the course it
  served** — gold under green Hormisine strewn with violets for the cordial; beryl
  under Talasike with citrus flowers for the five saffron fritters; topaz under
  murrey-and-carnation with five kinds of rose for the six gilded breads;
  chrysolite under yellow with lily-of-the-valley and daffodil for the seven
  partridge; emerald under crimson for the eight pheasant; sapphire under purple
  with jasmine for the nine peacock; ivory on aloes under white drawn-work for the
  three gilded date-shellfish. The counts are the book's. Walking round the
  pavement is walking through the supper.
- **The perfuming vessel** on three harpies' feet, six gilded flying spirits in a
  ring holding bowls of coals, the candlestick-stem with the seventh, the little
  pots boiling — fumes over every bowl and a pulsing coal-light (pp. 147–148,
  plate #30).
- **The fountain on four little wheels** with its pear diamond and a jet
  (pp. 145–146); **the repository**, a ship of gold with fishes along its side, at
  the open east end (p. 150); **the vessel of coals** with a napkin lying unhurt in
  the fire (p. 155 — asbestos, which the plaque leaves as the marvel Colonna
  found it); **the coral tree on the chalice** with its flowers of sapphire, jacinth
  and beryl and its bearer (pp. 156–157, plate #31).
- **Fourteen musicians**, seven a side of the jasper door, mute; **the three that
  wait** on the Queen's table; and, at the seventh table, **the one whose bearing
  was the resemblance of Polia** (p. 156) — the line that ends Poliphilo's appetite.

**Unbuilt and said so**: the pierced gold pomanders of amber (p. 150), and the second
great fountain on its axle-tree with the harpies at the angles (pp. 158–160, plate
#32), which the tour lede already promises. **Declined**: the trumpets, cornets and
singers.

The tour stop for IX–X still points at the water-labyrinth; the banquet is at the
court, one station east, and the ledger records both. Chapter IX itself — the
palace rooms and the labyrinth — is still `partial`.

## 2026-09-08 — Chapter XX: the boat of the crossing, out of the ledger again

Second chapter the coverage pipeline has picked. Six pages, no plate, and a station
(*The Shore to Cythera*) whose own tour note already said *"His vessel is a paradox
— built prow-for-stern … and from its mast flies a cyan-silk standard worked with
three hieroglyphs"* — while what stood at the pier was `cast.props.boat(2.0)`: a
tub with a mast and a white sail. The commentary described a boat the world did
not have. That is the ledger's whole job.

Built as **`_buildExeres`**, from three pages of the book:

- **The hull** (p. 276): an *exeres*, six-oared, of white sandalwood and citrine
  with the seams of darker aloewood, gold nails with gems along the gunwale,
  thwarts and gratings of blood-red sandalwood, and (p. 284) *"for its poop the
  prow"* — both ends alike. **No sail**: p. 290 has Cupid *"making sail with his
  spread wings"*, and the old prop's sail was simply wrong.
- **Six ivory oars in gold rowlocks** (p. 276).
- **Six rowers, named** (p. 277), in the three pairs the book dresses them in —
  Aselgia and Neolea in cloth-of-gold, Chlidonia and Olvolia in sea-purple, Adea
  and Cypria in slashed melledarum — blond and raven by turns, and labelled with
  what their Greek names mean, because the crew of Love's boat are
  personifications and the book says so.
- **The standard** (p. 284): a golden spear at the mast-step, and cyan silk
  carrying **the three signs in gold thread and pearl, both faces alike** — the
  antique vase with a flame in its mouth, the world, and the osier withy binding
  them. It flutters. **The reading, AMOR VINCIT OMNIA, is on a plaque by the pier
  and not on the silk**: the cloth carries the signs, and reading them is
  Poliphilo's act. That is the whole method of the book's hieroglyphs and the
  world should not do his reading for him.
- **Cupid at the prow**, wings *"of various and most-pleasant colouring"* (p. 285)
  as the boat's sail: rainbow-banded feathers, spread.

**Declined**: the six-voice song and Polia's answer in the Lydian mode — the site is
silent by standing decision, and the tour note carries it. **Unbuilt and said so**:
the crossing itself (digit 0 is a teleport; a ridden voyage would make the boat a
mover like the triumph floats, and the island group is distance-culled), and the
sea-gods' homage at the departure (pp. 278–282).

One thing found while doing it: the first hull was aloewood-dark and read as
*absent* against the water from the pier — the pale strakes floated over teal
and I spent ten minutes hunting a rendering bug that was a colour choice. The
book says white sandalwood; the hull is white sandalwood.

## 2026-09-08 — The floors are littered, in Roll Up only, and every object is in the book

Ted: *"we are going to want tiny small and medium Renaissance objects to litter
the floors in the rolling mode only so there are lots of small things to roll
up."*

**`src/systems/Litter.js`**, and **8 976 objects of 72 kinds** — 6 561 tiny,
1 852 small, 525 medium — built only when the scene is asked for
`{ rollup: true }`. The walk is untouched; the ordinary garden is not carpeted in
dropped cutlery.

**Every object is in the book, and the catalogue was mined, not imagined.** The
method was the project's own: count concrete portable nouns across the two
translations this repo can legally read — Dallington 1592 for chapters I–XVI and
our own CC0 text for XVII–XXXVIII — and keep what is actually there. Each kind
carries that count as its `src`. So the garden is littered with urns (Dallington
67, ours 193), cups (38 / 373), lamps (12 / 53), torches (8 / 58), mirrors
(1 / 84), garlands and chaplets (22 / 15 and 0 / 12), quivers (0 / 22), harps
(43 / 28), sandals (2 / 20), dice (3 / 8), pearls (42 / 61) and beehives
(Dallington 15) — and with no barrels, no bottles and no candlesticks, because
the book has none.

**And every object is where it belongs**, which is the joke of the mode and half
its use: **you can tell where you are by what you are eating.** The bath of the
five sense-nymphs is littered with combs, mirrors, phials, casting bottles and
sandals — their own attributes. The Queen's court has platters, knives, spoons
and salt-cellars. The chess court has dice. The Polyandrion has urns, potsherds,
grave-lamps and a chisel. The Great Portal has a mason's chisels, mallets,
trowels, plumb-bobs and compasses. The fruitful fields have sickles, rakes and
beehives of straw. Treviso has books, scrolls and an inkhorn. Cythera has arrows,
quivers, chaplets and oars.

Four things that had to be got right:

- **An object is one thing, not a heap of parts.** The census works per mesh, so
  the first pass would have had the ball eat a lute's soundboard and leave the
  neck lying on the grass — and the bite test measured the longest stick instead
  of the instrument. Every mesh of a piece now carries the same `rollGroup`, and
  `_resolveRollGroups` gives each group one size and one centre, the union of its
  parts. `takeRollable` hands back the whole of it in one holder.
- **The bands are drawn at their own scale and in their own proportion.** Medium
  things are set up by three-quarters — an urn modelled at 30 cm reads as a toy
  — and a station is filled by band (55 / 30 / 15) rather than by picking evenly
  from its list, so a place whose list is mostly small things still gets its
  share of big ones. Nothing is quite the size of the thing beside it.
- **A third of them have fallen over.** Litter that all stands bolt upright reads
  as a shop display; a cup on its side reads as a cup somebody put down.
- **One bare octahedron cost five hundred draw calls.** `OctahedronGeometry` is
  not indexed, and the merger wants a bucket all indexed or all not — so the
  single gem shape left *every red thing in the world* unmerged, and lost the gems
  besides. Indexed, and the whole litter costs **34 extra meshes** and no new draw
  calls. (This is the same trap ROUTER.md already records for `transparent: true`.)

Density: about one object per square metre and a half. The first pass was one per
six, which reads as a tidy garden with something dropped in it rather than as a
floor to roll up.

## 2026-09-08 — The buildings are made of stones, and taking one out has consequences

Ted: *"we need to make sure that the buildings are made from blocks or other
constituent parts that are small enough to eventually be rolled up, like having
the columns be made up of individual blocks stacked on top of each other, and
that the game physics accounts for all the possibilities of interaction and what
happens when a block is rolled up out from underneath the structures it
supports."*

Two things were wrong, and only one of them was about the game.

**The world was a set of monoliths.** A column was one cylinder. The Great
Portal's piers were two boxes, 7.2 by 6.4 by 2.2 metres each. To the roll-up
census those are single objects far past the six-metre cut-off, so the most
important architecture in the world was not merely uneatable — it was invisible
to the mode entirely. But it was also just *wrong*: a classical column is a stack
of dowelled drums, which is exactly why a ruined one lies on the ground in a row
like fallen cheeses, and a pier is courses of ashlar with the joints broken,
because a wall whose joints line up vertically falls down.

So:

- **`_column` now builds drums.** Four stones of the attic base, then six or
  seven drums sharing the entasis between them (each about 20 cm by the eating
  measure), then the necking, then the capital and its abacus — fourteen courses,
  a hundred-odd separate pieces with the flutes cut drum by drum. 179 columns in
  the world, and the census now carries 23 661 stones that know which course of
  which building they belong to.
- **`_ashlar` builds walls and piers**, courses about 80 cm high in blocks about
  1.2 m long, offset half a block on alternate courses. The Great Portal's two
  piers are the first users: eight courses of twelve. **It looks better**, which
  was not the point but is the best evidence that the point was right — the
  coursing gives the portal a scale the flat box never had.

**And the physics.** `src/systems/Masonry.js`, new. The scene declares a
STRUCTURE (a vertical run at one x,z), fills it with COURSES, and hangs CARRIED
loads on it — an entablature, a lintel, an architrave resting across four
columns at once. Then:

- a course fails only when **every** stone in it has been eaten, so a pier twelve
  blocks to the course takes real work to undermine;
- when it does fail, everything above **settles** by exactly that course's height,
  and so does everything the structure carries;
- a load carried by several structures answers to **whichever fails first** —
  undermine one pier of the Great Portal and eighteen metres of lintel comes down;
- and past 42 % of its courses a structure **topples**: the remaining stones let
  go, fall under gravity, spin, land and lie there as rubble, which you can then
  roll over (its collider is dropped) and eat.

The trick that makes it cheap is the one `takeRollable` already found: nearly
every stone is inside a merged draw-call buffer by then, so moving one means
writing its vertex range in place — run forwards instead of collapsed to a point.
A falling drum costs about a hundred vector transforms a frame and no draw calls
at all. Verified on the running page: the Great Portal's left pier undermined
course by course, the lintel tracking down 7.10 → 6.30 → 5.50 → 4.70 m as each
course went, then the whole portal over and the lintel on the grass at 0.22 m.

**Then the rest of the buildings, the same day, and the ledger picked them.**
`_census` now keeps a list of every object it rejects for being over six metres
— `scene._monoliths`, the only place in the code that knows what is still one
block — and asking it was more useful than reading the source. It said that after
the Great Portal **there were no monoliths left in the world at all**: the 59
rejects are the sea, the sky dome, the ground discs, the roads and the terrace
shells. So the remaining targets were not giants but the largest single things a
player can walk up to, and those were:

- **The Temple of Venus.** Its eight piers are ashlar, eight courses each, and
  together they carry the entablature ring *and* the nine shells of the scaled
  cupola. Verified: undermining one pier walked the dome down 6.57 → 5.92 → 5.27
  → 4.62 m course by course, and when that one pier went over the whole cupola
  came down to 0.64 m **with seven piers still standing** — which is exactly the
  rule, a load answers to whichever of its supports fails first.
- **The Planetary Palace.** The hall wall is seven courses of eleven, and
  `_roof` now returns what it builds so the roof can be hung on what holds it up:
  the wall **and all twelve Ionic columns of the two colonnades**, thirteen
  supports for thirty-four pieces. Eat out three courses of the wall and the roof
  of the Queen's palace falls into the chess court. It does.
- **`_entablature` learned the ring case.** A rotated one — seven bays out of
  eight at the temple — asks `masonry.near(x, z, r)` by radius instead of an
  axis-aligned box, which was wrong for every bay off the cardinals.

**Then the arches, which were the interesting case.** Every arch in the world was
a single torus, and an arch is the one form that most deserved not to be: a ring
of wedges each held in place by the thrust of the two beside it, and **the only
common piece of masonry with no redundancy at all**. A wall can lose a course and
stand on what is left. A column can lose a drum. An arch that loses *any* one
voussoir — not only the keystone — comes down entire. That is why sappers went
for arches, and it is now a flag: `masonry.structure({ brittle: true })`, and
`_fail` topples the whole thing on the first course lost.

`_arch(cx, cy, cz, span, depth, mat, {ry, n, thick, piers, name})` builds an odd
number of wedges with radiating joints and a keystone standing proud at the
crown, as every arch the 1499 plates draw has. Cythera's four chariot gates are
the first users — posts of ashlar, arch of thirteen voussoirs, the AD CYTHERAM
tablet carried on it. Verified live: eating **one ordinary voussoir**, not the
keystone, brought the whole ring and its tablet down from 9.10 m to the terrace.

Three things the arch forced out into the open, each a real bug:

- **`Masonry.dependsOn(b, a)`.** A load can only be *carried*, because a mesh
  belongs to exactly one course; but an arch stands on two piers, which are
  structures, not loads. So structures can now lean on structures: bring a gate
  post down and the arch on it follows, because an arch on one leg is not an arch.
- **Rubble was landing at the springing level.** `rest` was `st.ground`, which for
  an arch springing off a six-metre post is six metres in the air. The Masonry now
  takes a `groundAt(x, z)` — the walker's own floor query — so a stone dropped on
  Cythera's second terrace lands on the second terrace and a stone dropped off a
  gate lands on the road.
- **`resolve()` was running once per `_mergeInto`**, not once per build — and
  `_mergeInto` is called for every float group, every billboard, the island and
  the world. Every stone was being enrolled several times over. Harmless (the
  duplicates are the same objects, so the "has every stone been eaten" test still
  worked) but wrong, and it broke the *phantom* pass below. Moved to the end of
  `_compileDrawCalls`.

**Phantom pieces.** Not everything in a building reaches the census: a transparent
material is skipped by the draw-call merge, so a plaque is never offered to
`_census` at all — and AD CYTHERAM hung in the air over the wreck of its own gate.
Course meshes with no census entry now get a phantom entry: moved like any other
stone, never eatable, and not counted when asking whether a course has been eaten
away.

**What is still not done**: the Polyandrion (deliberately — it is a *ruin*, its
columns are already broken on purpose), the Cythera terrace shells (they are
ground, not walls), and the small jewelled arcade of the Fountain of Venus, whose
arches are segmental (`scale.y = 0.62`) and each cut from a different gemstone —
`_arch` would need a rise parameter, and it is a reliquary, not masonry. The Three
Doors wall is not a candidate either: the book insists it is "hewen ovt in the
verie rocke", not built, and it is boulders on purpose.

## 2026-09-08 — Chapter XXIV: the ledger found the last station of Book I

The coverage pipeline was built to catch exactly this and this is the first time
it has caught anything.

Chapter XXIV is eleven pages (our pp. 369–379), it is **the last chapter of Book
I**, and it has **no woodcut at all**. Its tour stop — stop 25, *"The Tomb of
Adonis"* — pointed at `cythera_theatre`, which is to say at another station's
geometry, and had done since the commentary was written. `grep -i adonis
HPWorldScene.js` returned nothing. That is precisely the shape chapter V had
while the vaults under the pyramid went unbuilt for months, and precisely the
failure ROUTER.md rule 6 names: **the plates are an index, not an inventory.**
Every check this project ran before the ledger was driven by the woodcut
catalogue, and a chapter with no plate is invisible to all of them.

The chapter turns out to be a complete, unbuilt station, and the best-described
single garden in the book after the Cythera peristyle:

- **the sacred fountain**, a hexagon twelve paces about, with borders of
  Macedonian marble and a golden serpent creeping from a cleft of rock, coiled in
  a globe *"to curb the force of the water — which, by a free and straight pipe,
  would have scattered beyond the limits of the fountain"* (the book gives its
  hydraulics as design criticism, which is very much this book);
- a **cloister of orange, lemon and citron** *"composedly matched in an
  alternating marriage"*, full of nightingales, thrushes and solitary blackbirds;
- a **foot-high lattice of red erythraean sandalwood** carrying hundred-petalled
  roses, a grove of cornel-cherry, cypress, palm, poplar and pine with trunks
  clear of branches, and a pavement grassed all over with sheared thyme;
- the **alabaster sepulchre**, five feet long: Venus tearing her calf in the
  roses and Cupid catching the blood in an oyster-shell on one side, Adonis and
  the boar on the other, a **jacinth** stopping the repository in front and
  *"burning unsteadily by the light set opposite"*, and on the lid **Venus in
  three-coloured sardonyx, carved as a woman in childbed, giving suck to Cupid**,
  her foot out over the rim for the nymphs to kiss.

**The roses are white, and that is the whole point of the station.** The rite of
the Kalends of May (pp. 375–376) is the origin of the red rose: the bushes are
stripped and heaped over the tomb, they reflower overnight to the same number, on
the Ides they are swept into the fountain and down the rivulet, the repository is
unsealed, and *"no sooner is the precious liquor drawn out than at once all the
whitest roses, AS AT PRESENT THEY APPEAR, are re-dyed in purple colour."*
Poliphilo sees them **before** the rite. So they are white in the world, and a
plaque says why. The rite itself is enumerated in `research/coverage.json` as
**unbuilt** — it wants what the Triumphs got, a timed sequence you can stand in.

It takes one bosco compartment of Cythera, off a road that now ends at the sacred
grove, and stop 25 points at its own station at last.

## 2026-09-08 — Roll Up gets an ending, and the ending was already in the database

The mode was a toy: you rolled until you were bored. It needed a goal, and inventing one —
four colour-stages of the Great Work, say — would have been the easy thing and would have
broken this project's first rule. So the corpus was asked instead:
`hp.db.alchemical_symbols`, which `RECIPES/query-the-corpus.md` names as **the only licensed
basis for an alchemical reading here**, sourced to Taylor 1951 and Russell 2014 on the
annotating hands of the Buffalo copy.

It gave back exactly the mode, which was startling:

- **Sol** — gold, the Sun, masculine, *"the king of metals."*
- **Luna** — silver, the Moon, feminine, *"the queen of metals."*
- **The Hermaphrodite** — *"the product of the chemical wedding: union of Sol and Luna,
  producing a being that reconciles masculine and feminine. Hand E identifies hermaphroditic
  imagery on h1r."*

**Ted's ball has Sol on one face and Luna on the other. It IS the hermaphrodite**, and the
database says so about this very copy of this very book. So the goal is the chemical wedding.

And the road there is the ladder in the same table: Saturn's lead at the bottom — *"the base
metal, starting point of transmutation"* — climbing through Jupiter's tin, Mars's iron, Venus's
copper, Mercury's quicksilver and Luna's silver to Sol's gold. That ladder is not our idea
either: the table records that **Hand B "annotates the Jupiter passage on a4r, mapping the
god's hierarchical position to the tin–gold transmutation sequence"** — a reading somebody
wrote in the margin of a 1499 *Hypnerotomachia*.

**The ball wears its metal.** It begins a dull lead and is tinted through tin, iron, copper,
quicksilver and silver to gold, so the transmutation is something you watch happening to the
thing you are steering. At twelve metres the work is finished and the end card gives Russell's
sentence, the count, the blades of grass, and how long it took from lead to gold. A scripted
run does it in about three minutes and 65 000 things, which is the right length for the genre.

**There is no timer and no fail state**, and that is deliberate: the garden is meant to be
wandered. The clock runs and is reported at the end as a *time*, not a limit.

Two other things in the same pass:

- **It bumps now.** `_block` used to ignore anything under twice the ball's own size, so a hedge
  you were far too small for was walked through. Anything you cannot **eat** now stops you,
  which is the whole shape of the game and half of the comedy.
- **It knows 121 names.** The census reported its own commonest generic labels and which
  material each came from, and those materials were tagged at the point they are made — the
  only place the name is actually known. "A ring of gold" was being applied to every white
  marble arch in the world; that fallback now looks at the material. 325 things out of 88 130
  are still "a piece of the dream", which is a good enough tail.

## 2026-09-08 — Roll Up: the world had to be made of things again

Ted: *"add a game mode 'roll up' where you control a katamari damacy style ball with an
alchemical sun and moon design and can roll up all the elements of the dream garden… that
means we'll have to make sure all the objects have the sorts of properties that a katamari
damacy style roll them up game will expect."*

He named the real problem in that last clause. **The world is not made of objects.**
`_compileDrawCalls()` melts about three thousand meshes into merged lumps, one per material,
which is the only reason it runs at all — and after that there is nothing left to pick up.

### The trick

Un-merging for this mode was the obvious answer and the wrong one: it would have trebled the
draw calls of a scene that already spends 20 ms a frame. So **the merge keeps a receipt.**
`mergeGeometries` concatenates its inputs in order, so every source mesh occupies a known
contiguous range of vertices in the lump it was folded into. Record the range, and:

- rolling a thing up **slices its vertices out** into a little geometry of its own — which is
  the *real* object, not a proxy — and **collapses the range in the merged buffer**, so it
  vanishes from the world;
- nothing is un-merged and nothing extra is drawn. The census costs one array.

Collapse the range to **its own first vertex**, not to the origin. A point already inside the
buffer's bounds leaves the bounding sphere valid; the first version collapsed to the origin and
nulled the sphere, which made three.js re-measure a hundred-thousand-vertex buffer on *every
mouthful* — fifteen thousand times in a full run.

**Grass is the exception and needed its own answer.** It is not meshes at all: 58 000 instances
of one blade in a single `InstancedMesh`, which is exactly why it is cheap. So the meadow got
`pluck(x, z, r)` — zero the instance matrices under the ball, which collapses those blades to a
point and costs sixteen floats each. Grass is the ball's first and most reliable food, which is
how the genre is supposed to open.

### How big is a thing?

Not its bounding sphere. A leaf card is a 95 cm square of nothing and its sphere radius is
67 cm, which would have put a leaf later in the meal than a plum-sized pebble — and 53 000 of
the 66 000 census entries landed in one band. **The mean half-extent of the bounding box**
behaves: a leaf comes out at 32 cm, a cube at half its side, a column at 58, a pebble at 5.

### Where to start a walnut

The census said Polia's garden had the thickest scattering of small things in the world by a
wide margin. It was the wrong answer, and the ball sat there eating nothing: every one of those
crumbs is a jasmine floret three metres up in the arbour, over a paved slab the meadow is masked
off. **The census had to be asked the right question — small AND on the ground** — which points
to the open sward between the elephant plaza and the fountain grove. Grass underfoot, the
triumph cars and the rills a short roll away.

### And the ball

Sol on one hemisphere and Luna on the other, drawn as one equirectangular canvas so the two
faces come round as it rolls, with the rays cut straight-and-wavy alternately as the plates cut
them, the dot-in-circle of Sol on his brow, and the moon bitten to a crescent. It is a *rebis*:
the two luminaries conjoined in one body that swallows the world and grows, which is what a
Katamari is anyway.

Four hundred swallowed things stay stuck to the outside; older ones are shed, because by then
they are inside the ball rather than on it, and ten thousand of them would be ten thousand draw
calls.

### The bug it found

Counting draw calls for the ball turned up something that had nothing to do with it: **22 137
transparent meshes in the ordinary walk.** `_mergeInto` skips transparent materials, and every
alpha-cutout material added on 2026-09-07 and -08 — the hedge fringes, the climbers, the jasmine,
the shaded walk, the Cythera lattices — had been written `transparent: true, alphaTest: …`. An
alpha-tested cutout is **not** transparent; it is opaque with a discard. Setting the flag exiled
all of them from the merge, one draw call per leaf.

Removing it: **24 886 meshes → 3 331, and 4 671 draw calls → 2 569**, with no visible change to
the world. The note is now in `ROUTER.md` beside the other constraints that have each cost a
rebuild.

## 2026-09-08 — The walker learns about height, and Cythera gets its section

**The constraint that shaped this world for months is gone.** Until today the walker walked at
y = 0 with a fixed 1.7 m eye, which meant every podium, step and terrace was *scenery* — you
walked through it, not onto it — and `ROUTER.md` carried the rule in so many words: "anything
you can stand on must stay under about half a metre or the dreamer ends up chest-deep in it."
That is why Cythera's terraces were 42 cm apart when Segre reads six of them rising 12.5 m,
and why the Temple of Venus's seven porphyry steps are a ramp you walk through.

`Walker.floors` is the smallest change that unlocks it: a list of rectangles, discs and
annuli, each with a `y`; `floorAt(x, z)` returns the highest one under the feet; and the eye is
**eased** toward it, rate-limited going up (3.4 m/s) and quicker coming down. A 30 cm riser
takes 90 ms and is imperceptible; a wall you should not be climbing crawls, and feels like the
mistake it is. **A scene that registers no floors behaves exactly as before**, so nothing
outside Cythera changed today.

Two details that mattered. A ring floor can be limited to an **arc**, because Cythera's terrace
tops are drawn as four quadrants with the crossroads left out — and if the floor covered the
crossroads the last stride of every flight would be a teleport. And the **landings**: a
crossroad is a road *across* the terrace, level with it, not a hole between two stairs. Without
those the walk dropped to the sward the instant it stepped off a flight, which the first
scripted traverse showed immediately.

### Cythera's section

The island's three rings were the right *shape* at a sixth of the depth. The shape is right
because **those three rings are the auditorium** — "its auditorium turned into three tiers of
flower beds" — and an auditorium descends to its orchestra. So: a ridge at r 14–18 at 2.10 m,
falling through 1.40 and 0.70 into the theatre Area at 0.

**Four flights of seven steps** at each of the four crossroads: up from the river bank onto the
ridge, then down through the three rings into the theatre. Seven risers in every one, because
seven is the book's number here and at the Temple of Venus both. The outer flight runs at about
37°, which is a temple stair; the three garden flights at 30°. And an **ornate gate on the
ridge at each crossroad** — 4.4 m in the opening, 4.6 m to the springing, gold balls on the
posts, AD CYTHERAM on the tablet — *"for the passage of the triumphal chariots."*

**The compromise, stated plainly rather than smuggled.** Segre's six terraces rise 12.5 m over
a radius of some 700 m. Ours is 50 m: the plan is compressed about fourteen-fold while the
gates, the people and the trees are full size. Six flights over that run would be a staircase,
not a garden. **Four flights of seven steps over a ridge of 2.10 m** — the count of steps is
the book's, the rise is the island's.

Verified by driving rather than watching: a scripted traverse of the cardinal from the bank to
the Area, settling the floor at 1/60 s a frame, gives 0 → 2.10 → 1.40 → 0.70 → 0 with no void
anywhere along it and a maximum rise of 0.30 m per tenth of a second, which is the rate cap
doing its job.

## 2026-09-08 — Cythera gets its twenty divisions, and the world gets its one map

Two decisions, and the second is the one I would defend hardest.

### The twenty divisions

The island had **twelve** wedges and no fences. The book has **twenty**, and it does not merely
assert the number — on our p. 294 it gives the **construction**, the classical golden-section
method of inscribing a decagon in a circle, worked step by step, and only then says *"these
twenty divisions."* Segre's reading agrees from the other side: twenty bosco compartments each
a different plantation, and 240 corner fruit trees, which is 4 × 20 × 3 orders of meadow.

So everything radial on Cythera is now twenty — the roads, the compartments, the orange
espalier, the flowery lawns. And the thing that was missing altogether, which is the best
sentence in the whole garden:

> *"…by most noble fences, diversely latticed with fitting and convenient marble openwork, two
> inches thick, between the measured placing of most polished little pilasters, of whitening
> marble, and the rest most lustrously reddening… In the middle of the fence there opened,
> level, in each, a gate — seven feet in the opening, nine high up to the arching of its
> topmost curve."*

Every number in that is built: twenty fences, openwork two inches thick between little
pilasters, white marble alternating with red, a gate 2.1 m wide and 2.75 m to the crown of its
arch. The openwork is a drawn alpha map rather than modelled bars — pierced marble is a *hole
pattern*, and holes are what a texture is for; two hundred little bars twenty times over would
cost a hundred times as much and read no better at three paces. Seven rhombs to a panel, so
each opening is about a hand's breadth; at four to a panel they were 60 cm across and read as
farm trellis.

**And each fence carries one climber, from the book's own list in the book's own order** —
periclymenon, jasmine, bindweed, hops, black bryony, convolvulus with its half-azure bells and
the same all white, momordica, Jove's flammula, smilax, bittersweet. `ivy` joined `SPECIES` so
the lobed ones have a leaf to draw.

**The hard part of variety is that it has to be legible.** Twenty fences differing only in a
colour you cannot name are not varied, they are noisy. So each gate carries a plaque with the
book's name for its climber and a gloss. *"So each was varied"* is only true if you can tell
them apart — otherwise we have asserted the pleasure instead of delivering it.

### The one map

**There is now exactly one map in this world, and it is on Cythera.**

The refusal of a minimap has always been a decided thing here, but the reason given in
`INTERFACECHOICES.md` was the weak one ("the processional axis is the map"). `GARDENS.md` §1
has the real one, from Hunt: **not being able to place yourself is the first garden experience
the book stages.** On a complex site the relation of parts to whole is simply not available to
a first-time visitor; each of Colonna's scenes is preternaturally clear in itself and baffling
in its relation to the rest, and Poliphilo "is not therefore able to pace or place himself
appropriately, either in his movement or his thinking."

Cythera is the exception, and **the book makes it one, not us.** Hunt lists it first among the
four things the island does that nowhere else does: it is *surveyed whole, in advance*.
Poliphilo describes the entire topography before he lands, and only then explores; there and
only there "everything falls into place."

So the **Prospect of Cythera** raises itself once, at the shore station, before the crossing: a
drawn plan in ink and wash — the twenty divisions with a gate marked in each, the three
*claustri*, the river, the six terraces, the theatre at the heart — with a note saying plainly
why it exists here and nowhere else. It is remembered in `localStorage` so it never ambushes a
returning reader, and `hpProspect()` calls it back at will.

**Do not add a second one.** A rule is only worth having if its exception means something, and
this is the exception the book itself supplies.

## 2026-09-08 — Hedges, rills, the shaded walk, and four wrong guesses about a white blob

Working the standing queue down. Three builds and one bug, and the bug is the interesting part.

**Hedges got a silhouette.** Box is the commonest single material in this world — every knot,
every parterre, every rampart, every field boundary — and it was a smooth green solid with a
mottled texture on it. A texture is not what makes a hedge read as a hedge. What reads is the
**edge**: a clipped box has a fuzzy rim of half-cut twigs where the shears went, and light
catches individual leaves standing proud of the mass. So the box stays — it is the body, and it
is what the collider and the shadow want — and `_hedgeFringe` scatters box-leaf cards over its
visible faces, standing a few centimetres off. `_hedgeFringeArc` does the same round a circle,
for the labyrinth's seven banks, Cythera's rampart and its terrace kerbs. `box` joined
`SPECIES` so `_leafCardTexture` can draw the leaf, and `_hedge()` builds and dresses in one
call, so a new hedge is never a bare box again.

**The rills (Dallington p. 196).** One sentence carries the entire water programme of an
Italian garden, and this world had only the fountains and the wild stream:

> *"Issuing and sending foorth in diuers places small streames of water, pyppling and slyding
> downe vpon the Amber grauell in theyr crooking Channels heere and there, by some suddaine fall
> making a still continued noyse, to great pleasure moystning the open fieldes, and making the
> shadowed places vnder the leaffye Trees, coole and fresh."*

Every clause is a specification. *Crooking channels*: they wind, and they are **cut**, with a
kerb, unlike the wild stream in the wood which merely lies on the ground. *Amber gravel*: the
bed is a warm ochre and it is what you actually see, because the water is two inches deep. *A
suddaine fall*: each has a lip, which is the only reason a rill this small makes any sound —
and since the site is silent, the fall is built to be **seen** making its noise, by the same
rule as the birds. **The first siting ran all three straight through the Three Doors wall**,
which occupies z 10.6–13.4 clear across the world; they were moved to the open band south of
the elephant plaza.

**The shaded walk (Dallington p. 92).** Plane and ash in two rows, laced with honeysuckle,
woodbine and hop, over a floor of leaf litter, with the *umbriphilous* herbs the same sentence
names growing along it — polypody, hart's-tongue and black hellebore, which can live nowhere
else. `ash` joined `SPECIES`; the three herbs joined `HERBS`. The climbers were beads on a
string until the swag was rebuilt as a chain of short cylinders laid along the catenary: **a
vine is a cord, not a row of beads.** The walk registers with the shade map as a *line* rather
than a set of pools, because laced trees throw continuous shade — that is what makes it a walk
and not an avenue.

**And the white blob.** A soft blown highlight had been sitting in the bottom of nearly every
screenshot for two days, and I had been treating it as a quirk of the preview pane. It is not:
it is the fountains' water. The mirror finish Ted asked for on 2026-09-06 ("fountains that look
like real water") was very nearly a *perfect* mirror — roughness 0.06, ripples at half depth —
so at grazing angles, which is how you see water from a 1.7 m eye, the sun's reflection stopped
being a glitter path and became **a solid white sheet** across the surface, spilling onto the
bank beside it.

It took four wrong guesses to find, and the sequence is worth recording because each was
plausible: the bloom threshold (raised it — no change); the environment intensity and ground
roughness (patched 82 large meshes — no change); the meadow shader's view-dependent back-light
(zeroed it — no change); the particle streams (hid every `Points` in the scene — no change, and
they came back the next frame anyway because `ParticleStream.update` sets `visible` from
`active`). **A raycast into the bright pixels named it in one call**, which is what I should
have done first. The fix is faithful rather than a suppression: a real sun path on water is
*broken by the ripples into glitter*, so the ripples got twice the depth and the finish a little
tooth. It is still a mirror.

**One thing measured and found innocent.** Now that shade is baked, the tree canopies' shadow
casting looked like a free saving. It is not worth taking: turning off every alpha-tested
leaf-card caster saved **19 draw calls out of 1539**, inside the timing noise. The frame's
~1500 calls come from somewhere else, and nobody has looked; that is in `NEXTSTEPS.md` now
rather than guessed at here.

## 2026-09-07 — Aerial perspective and the pigment shelf of 1499

Ted asked me to search for rendering methods for Renaissance art and environments that I might
have overlooked, and to apply what I found. Two things came back that were worth having, one of
them embarrassing to have missed.

**Leonardo's rule, which this world had backwards.** He coined *prospettiva aerea* in the
Trattato della Pittura and stated it as an instruction to painters: *to make an object look
five times more distant, make it five times bluer.* Distance drains colour, closes the tonal
range, and shifts what is left toward the blue of the air — Rayleigh scattering, three
centuries before anyone could explain it, and the first written statement of a thing Masaccio
and others had only done by instinct.

This world's distance cue was a **warm sand-coloured fog**. That is a real cue and the wrong
one: a warm haze reads as dust, not as distance, and it was flattening the far ground into the
same family of colours as the near. The fog is now a pale **azurite** (`0xb0c4da`) — azurite
and not ultramarine because ultramarine cost more than its own weight in gold and azurite is
what a Venetian shop in 1499 actually reached for. Kept light in value, so the seam against the
sky's warm horizon stays soft: **blue hills under a pale warm sky is the quattrocento landscape
exactly**, and that mismatch is the effect rather than a defect.

**It belongs in the fog, and I proved that the hard way.** I wrote the post-process pass first,
with the three moves separated and staged over a tunable distance band. It needs scene depth,
and reading depth out of an `EffectComposer` means hanging a `DepthTexture` on its ping-pong
targets — which binds that texture as an attachment on the target being *written* while it is
being *sampled*. Black canvas. Sharing one texture between both targets does not fix that; it
guarantees it. The fog does the same job better: three.js evaluates it per fragment with true
depth, on every standard material, for free. `syncAir()` pushes a change through to the meadow,
which fogs itself in its own shader and would otherwise stand in yesterday's weather.

**The pigment shelf.** A Venetian painter's colours were not a gamut, they were a shelf, and a
short one: azurite, ultramarine and indigo; verdigris, green earth, malachite and sap green;
lead-tin yellow, Naples yellow and the ochres; vermilion, madder lake, red ochre; raw umber and
burnt sienna; lead white and vine black. `src/shaders/AerialPerspective.js` now pulls every
pixel about a third of the way toward whichever of seventeen is nearest. **This is a constraint
rather than an effect** — the image stops containing hues nobody in 1499 could have mixed, and
a limited palette binds a picture the way it always has.

Three things learned by tasting it: 0.18 barely registers and 0.55 turns the sea flatly
verdigris and bands the grass, so **0.30**; the shelf needed two warm greens added or sunlit
grass snapped to verdigris and the whole sward went teal; and **three.js silently uploads
nothing for an array of `THREE.Color` in a `vec3[]` uniform**, because it flattens `{x,y,z}`
and a Color has `{r,g,b}`.

**What I turned down, and why.** The **anisotropic Kuwahara filter** is the standard route to a
real-time painterly image and it is genuinely good — a structure tensor from Sobel gradients,
its eigenvectors giving the local flow direction, the sampling kernel squeezed and rotated
along it so the output reads as strokes following form. It would be a **fourth aesthetic
register**, and the third one is already bracketed as unsatisfactory. Shipping a second
half-finished register is a worse project, not a better one. It is written up in
[`RENDERING.md`](RENDERING.md) anyway, because **the structure tensor is also the missing piece
for the woodcut register** — an engraver's hatching follows form, and the tensor is how you
find which way form runs. `WOODCUT.md` had independently arrived at the same machinery from the
other end.

Also read and set aside: **tonal art maps / real-time hatching** (parked with the woodcut
register, where it belongs); **sfumato, chiaroscuro and verdaccio**, which are figure
techniques and belong to `NYMPHS.md` if anywhere; and **canvas grain, craquelure and a painted
frame**, which are cheap and all say "this is a photograph of a painting" when the whole point
is that it is a place you walk in.

## 2026-09-07 — The garden's pleasures, taken from what Poliphilo says

Ted: *"Think about all the pleasures of the renaissance garden that we want to simulate and
what Poliphilo says when he witnesses them as your guide to how to build the model."* That is
a better brief than any I would have written, because the book already organises its pleasures
for us and says so out loud. At the bath five nymphs take charge of the dreamer, and
Dallington's own marginal gloss on p. 109 reads **"These nimphs were his fiue sences."** Each
carries her instrument — Offressia the boxes and white cloths, Orassia the shining glass,
Achoe the sounding harp, Geusia the casting bottle, and Aphea, who is Touch, who simply says
*"giue mee thy hand."* They are already standing in this world with those attributes in their
hands. The brief was therefore to give each sense something to enjoy.

The enumeration is [`PLEASURES.md`](PLEASURES.md), which pairs each pleasure with the sentence
Poliphilo says when he meets it. Four were built.

**Shade, which is the pleasure the book names more often than any other**, and which this
world had none of. Count them: *coole shade* (p. 92), *a delightfull shadowe* (p. 94), *fresh
coole shadow* (p. 102), *the coole vmbrage of the leafie Trees* (p. 121), *the shadowed places
vnder the leaffye Trees, coole and fresh* (p. 196), *the coole grasse* (p. 237), *fresh
shadowes* (p. 241), *the grasse coole and sweet* (p. 257). A garden with no shade has no
interior — every part of it is the same part.

- **First attempt: make the canopies cast.** They were casting from six of sixty leaf-cards,
  and the dark core of each crown cast nothing. Fixed. **It changed nothing on the ground** —
  over 130 m with one 2048 map and an environment light carrying most of the illumination, no
  pool appeared. Kept anyway, because it is correct.
- **Second, and this is the call: bake it.** The sun is one fixed key at (16, 22, 10); there is
  no time of day and no season, so a tree's shadow never moves. A baked shade map is therefore
  **not an approximation of a shadow — it is the shadow.** One canvas over the world, a pool
  dropped down-sun of each of the 285 trees, serving both the ground plane and all 58 000
  blades of the meadow through a single texture lookup in the shader that already existed. It
  is art-directable, which a shadow map is not, and it cost one texture.
- **Shade is tinted cool, not black.** What reaches shaded grass is the sky and not the sun;
  shade that is merely dark reads as dirt.

**Birds, seen and not heard.** *"the trees full of small birdes and foules"* (p. 94); *"the
sweet chirpings and quiet singing of Birds"* (p. 101). The site is silent by standing decision
and that looked like a problem until the book solved it: at the fountain of the sleeping nymph
Colonna does not describe birds singing, he describes birds **carved as though they were
singing** — *"prettye byrdes as yf they had beene chirping and singing of hir a sleep"*
(p. 98). **Where a pleasure cannot be delivered, show it being represented.** That is the
*paragone*, it is the book's own method, and it is now the rule for every acoustic pleasure
here. Eighteen perched and thirteen wheeling; they are the only moving things in the sky,
because a still sky reads as a painted backdrop.

**Repose.** *"…were constrained to rest our selues for want of breath, vpon the odoriferous
floures & coole grasse"* (p. 121). Turf seats — kerb, raised bank, and aromatic flowers growing
out of the seat itself — put where the book actually rests its people, plus two on the shore
facing Cythera, which is the one prospect in the book he is given whole.

**Visible fragrance.** Smell cannot be shipped, but smoke can be seen, and the book gives us
smoke: *"a thicke smoake or fume, of an inestimable fragrancie"* (p. 224). Fume rises from the
censers and the altar fires, and **only where the text puts one** — built on the ParticleStream
the triumph censers already used, because a second smoke system would be a second thing to
maintain.

**And one thing deliberately not built.** The counterfeits — the glass garden's balls "lyke
pearles shining", the silk garden's pearled flowers, and the fragrance washed on with oil
(p. 176). Hunt's argument stands: the 1499 and the 1592 both decline to illustrate them, the
1546 French edition did and *damaged* them, and the omission "forces readers to adjudicate
these designs for themselves." Withholding is the faithful move, and this is the only place in
this world where that is true.

## 2026-09-07 — GitHub Pages is the only host; Vercel retired

Ted: *"Stop hosting on vercel for now and bake into system files that we are only hosting on
github pages."* Done, in `DEPLOY_STATE.md`, `CLAUDE.md`, `ROUTER.md`, `README.md`,
`RECIPES/ship-a-release.md`, `RECIPES/verify-live.md`, `RECIPES/bump-cache-versions.md` and
both the builder and verifier agents. The canonical URL is now
**https://t3dy.github.io/EmblemsIn3d/** and `git push origin main` is the whole deploy.

This also brings the project into line with the workspace hosting policy in `C:\Dev\CLAUDE.md`,
which makes Pages the default and reserves Vercel for projects that genuinely need a server.
This one never did: no serverless route, no Blob storage, and `vercel.json`'s only real work
was a `Cache-Control` header that Pages ignored anyway.

**The open risk, which is Ted's to close.** `emblems-in-3d.vercel.app` is still live and now
frozen at `main.js?v=247`. It will drift further with every push, and this project's own
documented failure mode is *"Ted opens whichever link is to hand."* It can be closed by
deleting the Vercel project, or by one final deploy that redirects that URL to Pages. Both are
outward-facing, so neither was done unasked. Until then the docs say in three places that the
Vercel URL is a stale mirror and is not evidence of anything.

## 2026-09-07 — Poliphilo speaks as a commentary layer of his own

Ted asked for *"a catalog of every utterance of Poliphilo as a page for the website and for
them all to be included on the tour as a separate commentary layer,"* with one reading of the
tour being *"toggle all the others off and just watch P go around reacting to the sights."*

- **An utterance is what leaves his mouth or his pen** — direct speech, apostrophe, prayer,
  question, letter, and the interior speech the book sets down *as speech*. Narration is not an
  utterance however first-person it is, or the whole book qualifies and the layer means
  nothing. **50 of them**, in `src/data/poliphilo.json`.
- **The extraction had to be read, not scripted.** Our translation marks speech with quotation
  marks, so its 154 quoted spans came out mechanically. **Dallington's 1592 English has almost
  no quotation marks at all** — 30 in 279 pages — so Book I was found by speech cues and
  sentence-initial apostrophes over a de-wrapped copy of the text, and then read one by one. A
  cue proves a sentence is speech, not whose: Polia's, the nymphs', Logistica's and the
  priestess's were discarded, and his own words *quoted by Polia* in Book II were kept and
  marked as reaching us at one remove.
- **The layer lives outside `tours.json`.** It is keyed to stop indices in its own file and
  merged at render time as note type `poliphilo`, so one catalogue feeds the tour panel, the
  free-walk notes and `research/poliphilo.html` without being written down three times.
- **"Poliphilo alone" is a button**, not eleven clicks — `window.onlyPoliphilo()`.
- **The eleven silent stops are recorded as a finding, not left blank.** He says essentially
  nothing across the whole palace sequence — fed, entertained, shown a labyrinth and a chess
  match danced by living pieces, and he asks not one question about any of it — and *nothing at
  all* in the four chapters on Cythera, where everything quoted is an inscription. He arrives
  at what he wanted and stops speaking. A stop with no utterance now says so.
- Returning readers get the new lens turned on once, under a one-time `hp_flavors_poliphilo`
  flag, rather than silently never learning it exists.

## 2026-09-07 — The gardens: realism was parameters, fidelity was geometry

Ted: *"I'm still really dissatisfied with the gardens both in terms of layouts and in terms of
the flora."* Two different problems, wanting two different fixes.

**The flora was garish, and that was all parameters.** The meadow blades were 10 cm across at
the base and half a metre tall — leeks, not grass — the field was 22 000 spikes with bare
painted ground showing between them, and `Meadow.js` was pushing saturation to **1.25** in the
fragment shader on top of what ACES already adds. Now: blades 0.019 by 0.30, 36 000 of them
over a 22 000-blade understorey that closes the ground, greyer and cooler colour, straw rather
than gold in the back-light, and saturation at 1.06. Flower spikes narrowed and their `flare`
raised, so a flower reads as a spike with a head instead of a paddle. **No new system and no
new cost** — it is one `InstancedMesh` per field either way.

**The layout was answered from `GARDENS.md`'s own ranked list**, which had been sitting there
since the 2026-09-01 research pass with two of its top three unbuilt:

- **The Polia pergola becomes the jasmine arbour** it is in the book: a tunnel he walks in
  under, not a slab on four columns. Dallington p. 200 settles its shape, its use and its
  finish in a single sentence — *lifting vppe and bending ouer* (a barrel, not a lid),
  *entring in vnder the same* (a tunnel, open at both ends), *all to bee painted* (joinery, not
  bare pole). Rhizopoulou settles the "flowers of three sortes commixt": jasmine in red, yellow
  and white, which she also records as the book's symbol of divine love and happiness. It is
  one of only two things the Venice edition illustrates **twice**, which is the measure of how
  wrong a bus shelter was.
- **Second nature exists at last.** Hunt reads the whole book through the doctrine of the three
  natures, and this world had the first and the third and nothing in between, so the meadow was
  being asked to be wilderness-edge and garden at once and read as neither. Strip fields, an
  orchard in quincunx, and the arbustum — vines married to elms — laid north-west of the dark
  wood, so that you walk out of the wilderness into worked land.
- **It was built in the wrong place first.** The belt went west of the water labyrinth, whose
  basin is 9.8 m in radius about (−44, 34); the fields were standing in it. Moved, and the
  aspect re-laid — the strips run east–west now, because the new ground is wide and shallow.
- **Ploughland is built, not drawn.** Stripes painted on a flat plane read as a striped rug at
  grazing angles, and a grazing angle is how you see a field you are standing in. The turned
  strips carry real ridge-and-furrow and scattered clods; they cost nothing, because
  `_compileDrawCalls()` merges them into one call. The meadow is masked off the belt: grass
  does not grow out of a furrow.
- `pear` and `plum` joined `SPECIES` for the orchard. Segre has apple, pear and plum together
  in the prati of Cythera, so they were owed anyway.

Still outstanding, and still the largest single build in the project: **Cythera as Segre
reconstructs it** — the perfect circle, 20 radial roads, three concentric *claustri*, the six
terraces of seven steps. `GARDENS.md` §5 is detailed enough to build straight from.

## 2026-09-07 — Coverage is tracked chapter by chapter, not plate by plate

Ted: *"I feel like missing the tunnels was a pretty serious omission."* He was right, and the
omission was structural rather than careless. Every coverage check anyone had run was driven
by `hp.db.woodcut_catalog` — 168 plates, numbered, easy to tick off. **The vaults under the
pyramid have no plate.** They are five pages of pure text in chapter V, and the tour even had
a stop called *The Dragon in the Vaults* leading to a door with nothing behind it. A
plate-driven check could not have found them, and nothing anywhere recorded that chapter V
had never been read against the world.

The calls made in response:

- **The unit of coverage is the chapter**, all 38 of them, not the plate and not the tour
  stop. Ted chose this over the alternatives (by plate, by station, by narrative section).
- **`research/coverage.json` is the ledger; `COVERAGE.md` is generated from it.** JSON so a
  script and an agent can both read it, Markdown so a person can. `COVERAGE.md` is never
  hand-edited. `scripts/coverage_seed.py` rewrites only the derived fields and preserves
  `research` and `features` verbatim, so refreshing it can never destroy a reading.
- **The report leads with the research queue, not the build queue.** *Unresearched* and
  *unbuilt* are different states and conflating them is the whole failure: a chapter nobody
  has enumerated cannot show a gap. A chapter marked `partial` — tour notes, no feature list
  — is a blind spot, and that is exactly what chapter V looked like.
- **`status: built` is a claim about the deployed page**, not about the source. The seeder's
  `plates_cited_in_source` grep is labelled weak on purpose: a plate number in a comment
  proves someone looked.
- **`declined` is a real answer and keeps its reason.** The five Polyandrion medallions stay
  declined because no reading of them exists in the corpus.
- **Research and build are separate passes.** A pass that stops at the first interesting
  thing to go build it is how chapters get half-read.
- **Three agents and three commands**, both, per Ted: `.claude/agents/hp-researcher.md`,
  `hp-builder.md`, `hp-verifier.md`, driven by `/research-chapter`, `/build-feature` and
  `/audit-coverage`. Written for HPin3D now but shaped to lift — `C:/Dev/CLAUDE.md` names
  this project as the reference implementation for the other corpus-plus-build projects.

This produced a sixth standing rule in `ROUTER.md` and `CLAUDE.md`: **the plates are an
index, not an inventory.** Roughly a third of what is worth building was never drawn.

The pipeline itself is [`HPTOTOURPIPELINE.md`](HPTOTOURPIPELINE.md).

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

## 2026-09-07 — The Vaults: chapter V as a crawl

Ted: "I understand there are tunnels beneath the pyramid in the HP — have we included those?
I feel like we should have some kind of a dungeon crawling game mode that extends them into a
roguelike video game side quest sort of thing." They were **not** included: the tour had a
stop called *The Dragon in the Vaults*, but the world had only a dragon standing outside the
portal, and nothing behind the door.

Reading Dallington pp. 82–87 settles it — the chapter is already a roguelike, and it hands
over every mechanic in its own words, so `VaultsScene.js` invents nothing but the numbers:

| the book | the mechanic |
|---|---|
| "diuers crooked torments, ambagious passages and vnknowne waies… so full of wayes and winding turnings, **one entring into another, to deceiue the intent of the goer out, or in**" | a seeded maze, carved by depth-first search and then **knocked through** in a dozen places, because a tree maze has no crossings |
| "although my eyes were somewhat wel acquainted with the darkenes, yet I could see iust nothing" | one guttering point light, and it shortens with depth |
| "many huge and mightie pillers, **some fouresquare, some sixe square, some eight square**" | pillars of 4, 6 and 8 sides, which is exactly what he counts |
| "**feeling with my feete softlye** before I did rest vpon them, for feare I should tumble downe into some vaulte" | unlit pits; standing beside one warns you, standing in one ends the run |
| "an **euerlasting Lampe**, burning before an Aultar that was fiue foote high, and tenne foote broad, with the images of golde standing thereupon" | three altars a level — 1.5 m high, 3 m broad, two gold figures — that light, score, and reveal the map around them |
| "I espied a light… comming in at a **litle wicket** as small as I could see" | the way down to the next depth |
| "I began to imagine that the **Dragon** was flying about my head" | it wakes after a few seconds and hunts you by breadth-first search, quickening with depth |

Depth is the score; lamps carry down with you; dying is permanent and puts you back at the
Great Portal, which is where he actually comes out. The map fills in as you walk — the one
mercy the chapter does not give him, and the only thing here that is not his.

**A trap for next time:** the first build rendered pitch black. The renderer is on physical
light units with ACES tone mapping at 1.2 exposure, so a `PointLight` of intensity 1.5 — which
is what the lit garden's own helper uses, because that scene is carried by its sun — is
nothing. Interior point lights here want **tens**: the lantern is 26, an altar 44.

## 2026-09-07 — The commentary obeys its own × , and the flight keys are cards

Ted: "I keep closing it by hitting the x in the corner and it keeps coming back up. If you
close it by hitting the x then the next time you hit a comment event trigger it should not
come back up. There should be a button at the top to toggle the comments back on or off.
Instructions for the controls for the dragon's flight should be visible on the screen (and
also toggleable on and off with a Flight Controls button) as should the controls for the
camera as Camera Controls."

- **Dismissed means dismissed.** `state.commentsOff` is set by the panel's ×, and
  `showWalkNotes()` returns early while it is set. Walking out of a wonder still just hides
  the panel (`hideWalkNotes`) without setting the flag — leaving is not dismissing.
- **Three toggles in the top bar**: *Commentary*, *Flight Controls*, *Camera Controls*, each
  lit when its thing is on. They carry a `nav-toggle` class because `setActiveWorldBtn()`
  strips `active` from every button in that bar, and for these `active` means "on", not
  "this is the world you are in".
- **The keys are cards now**, bottom-right in `#ctl-stack`, each with its own ×. They used to
  live only in the hint toast, which is no use once it has faded. The two flight cards and
  their buttons appear on taking wing and go on landing.
- Also: the wings' and head's vanes were reading too dark against the body. Being thin planes
  seen at a grazing angle they render darker than their colour, so their colour is now set a
  little *above* the body's (0x54764a against 0x4a6a3a) to land at about the same brightness.

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
  flanks, three a side; it droops 20°; and it hangs on a pivot the flight controller turns, so
  it leans into the bank, follows the climb and looks slowly about it. The ball head, the
  horns, the jaw and the eyes are all gone.

  Then, on seeing it: "the whiskers should be set further forward so that they look like
  whiskers, and I want the triangle of the head 60% closer to the body and rotated 90 degrees
  so that the back side of the triangle is standing straight up." So the vane **stands on
  edge** rather than lying flat — its back side upright, leaned off the vertical only by the
  20° droop (measured: 19.4°) — and the gap to the neck went from 0.24 to 0.096 of the body
  scale (measured: 0.75 world units to 0.31).

  And the whiskers were wrong three times because I had been reading the sticks on his plate
  as ribs lying IN the triangle's face. They are not: there the wing was swung about Y and its
  ribs were not, so they stand off it. "I just want two of them and they stick out from close
  to the center point of the triangle at angles just off perpendicular to the plane of the
  triangle that forms the head." So they root at the vane's own centroid and run ~20° off its
  face normal, tapering to a tip outward. Then: "two whiskers coming off each side… darker in
  colour and about half as long… relative to each other the whiskers are at a 15 degree angle"
  — **four** in all, nearly black (0x12170b), 0.31 of the head's length, each pair split by 15°
  (measured: 14.3°) about the head's own fore-aft axis. And the droop went from 20° to **50°**:
  "the head should be tilted down at a much sharper angle actually."

  The lesson worth keeping: when a reference image is offered three times, the thing being
  pointed at is probably not the thing already being modelled. Three passes were spent building
  the sticks as ribs lying in the triangle's face before reading them as what they are.

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
