# DIRECTIONS — where everything stands in relation to everything else

*A research brief. **Nothing here is built yet.** Written 2026-09-08 with
[`DIMENSIONS.md`](DIMENSIONS.md) and [`WOODS.md`](WOODS.md) as the research pass behind Ted's
call that the dream garden is too small and its elements too close together. `DIMENSIONS.md`
holds the sizes; this file holds the **plan** — the order of places, the turns the book
actually gives, the ground each stands on, and the compass frame the world should adopt and
declare. The build brief is §6.*

**The finding in one line:** Colonna gives almost no compass bearings but a great deal of
*topology* — what is closed, what is beyond what, what is glimpsed through what — and the
world has flattened that topology into a single 100 m corridor in which every station is
visible from every other. The dream's geography is a sequence of **enclosures each opening
onto the next**, and it stops working when you can see the end from the beginning.

---

## 1. What the book gives, and what it withholds

**Withheld.** No compass bearing is ever given for the itinerary. No distance is stated
between any two stations except the cypress avenue (4 stadia, Dall. p. 123). No map.

**Given, and load-bearing:**

1. **Time of day**, continuously — dawn, midday, the afternoon of the triumphs, the evening
   of Cythera. With the season (§2) this fixes the sun, and the sun is the only compass.
2. **Enclosure and passage** — the valley is *closed*; the doors are cut in *rock*; the island
   is *offshore*. Each of these is a hard topological fact and most are missing from the
   world.
3. **A handful of explicit turns** — right hand, left hand — at four named moments.
4. **Sightlines**, repeatedly: a thing seen far off, indistinct, growing as it is approached.
   This is Colonna's signature move and the world has almost none of it.

---

## 2. The sun — the only compass in the book

- **Season: the sun is in Taurus**, roughly 20 April – 20 May. The proem's north-east winds
  bend the fir *"sotto gli corni di tauro lascivianti"* (1499, l. 475; Dall. p. 11, "vnder the
  hornes of the lasciuious Bull"). See [`WOODS.md`](WOODS.md) §4.
- **The day opens at dawn** — Phoebus rising out of the ocean, the moon unyoking her two
  horses and drawing to the opposite horizon (Dall. p. 11).
- **The wood is walked into the midday heat** — *"el meridionale aesto"* (1499, l. 589).
- **The monuments are reached around noon.** The pyramid's spiral stair is lit by windows cut
  to the "**Orientall Meridionall and Occidentall** partes of the ayre, that euery houre of the
  day the sunne shined in, and gaue light to the whole scale" (Dall. p. 32) — and the obelisk
  itself is **dedicated to the Sun**, its architect named on it in Greek (Dall. p. 33). The
  building is a heliotropic instrument; its faces are meant to take the sun in turn.
- **The one navigational instruction in the entire book** is in the dark wood: he walks
  straight *"without any helpe but onely the **keeping of the sunne still vpon one side**"*
  (Dall. p. 15). That is a mechanic, not a metaphor — see §6.

### The frame to adopt

The world already implies a compass and has never declared one. `HPStyles.setupLights` puts
the lit-garden sun at **(16, 22, 10)** — high, to `+x` and `+z`, about 49° up. The journey
runs from the wood at `z = +45` to the sea at `z = −150`. Therefore:

> **`+z` is south. `−z` is north. `+x` is east. `−x` is west.**
> Poliphilo walks northward, away from the sun, with it behind his right shoulder.
> The Great Portal's façade faces `+z` — **south, into the sun** — which is the only
> orientation consistent with a Sun-dedicated building whose front is described as lit.

This costs nothing: it is the frame the existing light already produces, and it makes the
book's two sun facts (the façade in sun, the stair lit from east/south/west) come out right.
**Declare it in a comment at the head of `HP_STATIONS` and stop leaving it implicit** — every
future siting argument ("west of the grove", already in the station table) is currently
unmoored.

*One directional detail, offered as a curiosity the builder may use for a single tree:*
Dallington p. 92 names a tree in the country beyond the vaults as "**beeing red towardes the
north, and white against the Southe**."

---

## 3. The itinerary, in order, with what the book says about the ground

Chapters and stations follow `src/data/tours.json` (the Novel tour) so the two agree.

| # | ch. | place | what the book fixes about its *position* | world today |
|---|---|---|---|---|
| 1 | I | **the spacious plain** — *"una spatiosa planitie… tutta virente et di multiplici fiori"* | flat, green, flowered, **silent**, and **empty of every living thing** — no man, no beast, no bird, no house, no flock, no shepherd. He walks "still forward" across it | absent |
| 2 | I | **the dark wood** | entered off the plain "a pretty way"; **no path in and none out**; wandered right, left, back, forward; the Hercynian forest by name | a 70 × 22 m strip with a 5.4 m corridor cut through it |
| 3 | I | **the spring, and the stream** | *outside* the wood but its branches "ran **thorow** the desart wood"; torrents come down into the plain "from high and fertlesse mountaines"; high trees close over the water | a 1.1 m pool at the wood's edge |
| 4 | I | **the great oak, in a spacious green mead** | reached only after he loses the river chasing the song — so it is **separated from the water by a wandering**, not adjacent to it | absent |
| 5 | II | **the delicate valley and its rise** | a *second dream*: a low rise scattered with trees "growing distantly one from another", graded by the slope; then a **sandy, gravelly plain** with one date palm | absent |
| 6 | II | **the wolf** | on the **left hand**, in the pleasant place | at (4.2, 40.5) — in the dark wood, on the path |
| 7 | II | **first sight of the pyramid** | from the palm plain, "casting my eyes towards the **wooddie mountaines, which seemed to ioyne themselues together**, beeing looked vnto a **farre off**", he sees "the forme of a tower of an incredible heygth, with a spyre **vnperfectlie appearing**" | the portal stands 8 m from the wood station |
| 8 | III | **the approach** | *"by how much the more I approximated the same, by so much the more the excellencie of the woorke shewed it selfe"* — the mountains, small at first, "by comming neerer and neerer, **by little and little, to lift vp themselues more and more**" | no approach exists |
| 9 | III–IV | **the pyramid-portal** | **closes the valley wall to wall.** "the foresaid valley there had an end, that **no man could go further forward or backe againe**, but to enter in by this broade, large, and wide open porche" (Dall. p. 27). 10 paces of clearance to the cliff each side | free-standing on open ground; the valley does not exist |
| 10 | III | the winged horse | in the court, "in the passage towardes the Porche, some **ten paces**" | ✓ sited |
| 11 | III | the elephant | "not farre distant from the horse **straight forward**" | ✓ sited |
| 12 | III | the colossus | past the elephant; 89 m long, entered by the beard and down the throat | present, far under size |
| 13 | III | the Medusa door, and the stair | on the **right hand as he goes**, in the plinth; the descending stair opens "vpon my **right hand** against one of the collaterall and side-lying mountaines" | — |
| 14 | V | **the vaults** | *under* the pyramid, and they come out the **far side** | ✓ `VaultsScene` |
| 15 | VI | **the wooded country and the bridge** | beyond the vaults; a bridge whose spring **divides into two streams, right and left**; a wooded district **ringed by a tree-bearing mountain**; conifers on the slopes. The octagonal fountain-house is first seen **through the trees**, its roof-crest above the treetops | `fields` (meadow only) at (−40, 41) |
| 16 | VI–VII | the fountain and the bath, the five nymphs | at the octagonal building in that wood | `fountain` at (0, −10.5) |
| 17 | VIII–XI | **the Queen's palace** | approached down a **cypress avenue four stadia (740 m) long**, closed by a citron-orange-lemon hedge 6 ft thick with a gate in the middle; then a **60-pace (89 m) green enclosure** with the palace forming its fourth side | `court` at (−10.4, 23.8); avenue absent |
| 18 | XI | the chess ballet | in the court after the banquet | ✓ `chess` |
| 19 | XII–XIII | the gardens; **Polia's ivied garden** | a round garden ringed by **100 arches** — 444 m of circumference, **141 m across** — with the trigonal altar at its centre | `polia`, station radius 7 |
| 20 | XIII | **the three doors** | **hewn out of the living rock**, in "abrupt and wilesome hilly places, full of broken and nybled stones, mounting vppe into the ayre, as high as a man might looke to, and **without any greene grasse or hearbe**… in a very displeasant seate" (Dall. p. 192), reached across "a plentiful seate and pleasant Countrey" | a free-standing 29 m **wall** on the garden axis |
| 21 | XIV–XVI | the triumphs, Vertumnus and Pomona, the rite of Priapus | processional; they come *to* him | ✓ built |
| 22 | XVII–XVIII | the Temple of Venus Physizoa | a round temple, height = diameter, ten radial divisions | ✓ built |
| 23 | XIX | the Polyandrion | a **digression** — ruins, off the road, entered through a broken pier and a little door choked with ivy (p. 247) | ✓ built |
| 24 | XX | **the shore, and the crossing** | Cupid's six-oar; the crossing fills **a whole chapter** of song. No distance given — but the duration is the fact | 71 m of water |
| 25 | XXI–XXIV | **Cythera** | a perfect circle **1.4 km across**, three concentric rings each 246 m deep, twenty radial roads, the theatre at the centre | ~60 m across |
| 26 | XXIV | the Fountain and Sepulchre of Adonis | inside the island's inner ring | ✓ built |

---

## 4. The four explicit turns

The book gives left/right at exactly four moments that matter for siting. All four should be
true in the world, and two currently are not.

1. **The wolf is on the left hand** (Dall. p. 23), in the *second* dream's pleasant valley —
   not in the dark wood. In the world it stands at `x = +4.2` in the dark wood, on the path.
2. **The Medusa door is on the right hand as he goes** (Dall. p. 31) — that is, on the east
   side of the pyramid's façade under the frame adopted in §2.
3. **The descending stair opens on the right hand**, against the side mountain (Dall. p. 32).
4. **At the bridge beyond the vaults the water divides, one stream right and one left**
   (1499, l. 2793).

And one that is not a turn but a rule: at the Three Doors, **Mater Amoris is the middle**
(already correct in `HP_STATIONS`' door table), and Thelemia makes him see the *third* gate
before he may settle (Dall. p. 195) — so the middle door is chosen after both flanks are
tried, which means the doors need to be approachable in any order.

---

## 5. The shape of the dream: enclosures, not a corridor

Read as a plan, the itinerary is a chain of **closed spaces each of which opens onto the
next**, and the closure is always stated:

- the plain is bounded by nothing and full of nothing — *openness as emptiness*;
- the wood has no exit until prayer finds one;
- the valley is stopped dead by the pyramid — "**no man could go further forward or backe
  againe**";
- the vaults are a maze under it;
- the palace garden is a walled enclosure with one gate in a hedge;
- Polia's garden is a ring of a hundred arches;
- the three doors are cut in a bare rock wall with no way round;
- the island is ringed three times over — cypress and myrtle, then a citrus espalier eight
  paces high, then a colonnade — before the theatre at the centre.

**Nothing in this book is approached across open ground with the destination in view.** Every
monument is either glimpsed indistinctly at a great distance and resolved by walking
(the pyramid, ch. II–III), or hidden until you are through a wall (the palace, the island's
rings), or seen through trees (the octagonal fountain, ch. VI). The world's 100 m plain, on
which all twenty-three stations are simultaneously visible, inverts the book's fundamental
spatial device. **Restoring that device is worth more than any single re-scaling**, and it is
mostly a matter of screens — the valley walls, the hedge, the rock, the rings — not of size.

---

## 6. The build brief

*For `hp-builder`, or whoever takes the geometry pass. Each item names the source. None of it
is built. Do not treat this as sequenced work — it is a menu, and the first three are the
ones Ted actually asked for.*

### A. The wood (Ted's ask, directly)

- Raise the wood's trees to **25–35 m** with the crown base at 8–12 m, and close the canopy.
  Species: **oak (four kinds), holm oak, ash, elm-with-vine — no beech, no fir.**
  → `WOODS.md` §1.
- Kill the 5.4 m path corridor. Add surface roots and a bramble understorey.
- Make it dark enough that leaving it dazzles, and make sure the darkness is **cast shadow**,
  not just a darker floor plane. **`sun.shadow.camera` is ±58 with `far = 130`
  (`src/shaders/HPStyles.js:186`) — this is the blocker.** Nothing outside that box casts at
  all, so a bigger world silently loses the shadows Ted asked for. Fix the shadow frustum
  first; everything else in this brief is downstream of it.
- Add the **"keep the sun on one side"** mechanic: with the compass declared (§2), a walker in
  the wood who holds the sun at a constant bearing walks out of it. This is the book's own
  instruction, it is free, and it turns the wood from scenery into the dream's first puzzle.

### B. The plan (Ted's ask: "all the elements further apart")

- Adopt **one ground-plan scale** and record it in `DECISIONS.md` before moving any geometry.
  `DIMENSIONS.md` §5 recommends **1 : 8**, with the theatre exempt (already near-true) and all
  human-scale furniture at 1 : 1.
- Rebuild the approach of chapter II–III: the pyramid **seen far off and indistinct**, growing
  over a walk of hundreds of metres, with the "mountains that seemed to join" resolving into
  two cliffs and a building between them.
- Give the valley its **walls**, so the pyramid closes it. This is the single highest-value
  piece of geometry in the brief: it is stated in the text as an absolute, and without it the
  whole of chapters III–VI is a folly on a lawn.
- Restore the **cypress avenue** to something readable as a long approach (4 stadia = 740 m
  true; 92 m at 1 : 8), closed by the citrus hedge with its single gate.
- Widen Polia's garden toward its hundred arches.

### C. The corrections this pass turned up

| id | what | source |
|---|---|---|
| the wolf's position | it belongs in the second dream's open valley, on the **left**, not in the dark wood on the path | Dall. p. 23 |
| the wood's species | no beech, no fir; the fir comes from the proem's winter simile | 1499 ll. 555–563, 474–475 |
| the three doors | **cut in a bare rock face** in stony, grassless highland — not a free-standing wall | Dall. p. 192 |
| the third wood | the bridge with its divided stream, the ringing wooded mountain, conifers **on the slopes** | 1499 ll. 2793–2813 |
| the compass | declare it at the head of `HP_STATIONS` | §2 above |

---

## Sources

- Dallington 1592, `C:\Dev\hypnerotomachia polyphili\md\Hypnerotomachia_by_Francesco_Colonna.md`
  — pp. 11–48, 90–92, 123–124, 188–195.
- The 1499 Italian, `md/Francesco_Colonna_Rino_Avesani…Poz.md` — ll. 474–475 (the season),
  530–600 (the plain and the wood), 2793–2813 (the wooded country and the bridge).
- Our translation, `translation/en/page_NNN.md` — pp. 285–297 (the crossing and the island),
  311 (the island's proportions), 351 (the theatre).
- John Bury, "Chapter III of the *Hypnerotomachia*", *Word & Image* 14.1–2 (1998), Appendix —
  for the pyramid complex's parts in order and their measures.
- `src/scenes/HPWorldScene.js` (`HP_STATIONS`, `_buildWood`) and
  `src/shaders/HPStyles.js` (`setupLights`) — for the world as it stands.

Godwin (1999) is in copyright, is not in the corpus, and was not used.
