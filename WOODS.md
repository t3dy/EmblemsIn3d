<!-- tokens: ~3,886 · read for: the dark wood: species, density, light -->
# WOODS — the three woods of the dream, and why the first one must be dark

*A research brief. **Nothing here is built yet.** Written 2026-09-08 as part of the research
pass on the world's scale, after Ted asked for "the trees of the wood dark enough to tower
over our hero and cast enough shadows to make it dark". Companions:
[`DIMENSIONS.md`](DIMENSIONS.md) and [`DIRECTIONS.md`](DIRECTIONS.md). The species brief for
the gardens is [`PLANTS.md`](PLANTS.md); this file covers only wooded ground.*

**The finding in one line:** the book has **three** distinct woods and the world builds
roughly one of them, at the wrong species, the wrong height and the wrong light. The first is
the *silva oscura*, which Poliphilo names as the **Hercynian Forest** and which is defined by
a single fact — the sun does not reach the ground.

---

## 1. The dark wood — chapter I

### What the book actually says

Dallington p. 14 gives the species list; the 1499 Italian gives it better, and the two
disagree, so the Italian governs:

> *"nella dumosa silva appariano si non densi virgulti, pongente vepretto, el silvano fraxino
> ingrato alle vipere, ulmi ruvidi alle foecunde vite grati, corticosi subderi apto
> additamento muliebre, duri cerri, forti roburi et glandulose querce et ilice et di rami
> abondante, che al roscido solo non permettevano gli radii del gratioso sole integramente
> pervenire, ma, come da camurato culmo di densante fronde coperto, non penetrava l'alma
> luce : et in questo modo me ritrovai nella fresca umbra, humido aire et fosco nemorale."*
> — 1499, `md/Francesco_Colonna_Rino_Avesani…Poz.md` ll. 555–563

Which is: in the thorny wood appeared nothing but dense saplings, pricking bramble-brake, the
**woodland ash** hateful to vipers, **rough elms** dear to the fruitful vines, **thick-barked
cork oaks**, **hard Turkey oaks**, **strong durmast**, **acorn-bearing oaks** and **holm
oak**, abundant in branches — *which did not let the rays of the gracious sun reach the dewy
ground entire, but, as though covered by a **vaulted roof** of thickening foliage, the kindly
light did not penetrate; and in this way I found myself in cool shade, damp air, and woodland
murk.*

### Two corrections to the world

`HPWorldScene._buildWood()` plants `['oak','oak','beech','elm','fir','oak','beech','fir']`.

1. **There is no beech and no fir in this wood.** Dallington's "soft Beeche" and "browne
   Hasils" are his renderings of *querce* and *ilice*; his "harde Ebony" is *duri cerri*, the
   Turkey oak. The fir comes from somewhere else entirely — the proem's winter simile, where
   the north-east winds "breake downe the brittle Firre bowghes, **vnder the hornes of the
   lasciuious Bull**" (Dall. p. 11; It. l. 474–475, *"proclinare la fragile abiete, sotto gli
   corni di tauro lascivianti"*). That is a *seasonal* clause, not a botanical one, and the
   code comment on that line ("the fir whose boughs are hung on the horns of the sacrifice")
   misreads it: the Bull is the zodiac sign, and the sentence dates the dream. See §4.
2. **The wood is five parts oak.** Of the seven trees named, five are *Quercus* — cork oak,
   Turkey oak, durmast, acorn-oak, holm oak — with ash and elm the only others. The correct
   mix is overwhelmingly oak, with elms carrying vines (the Italian says so: *ulmi… alle
   foecunde vite grati*, the married elm-and-vine of Roman agriculture) and ash at the edges.

### What the wood must *do*

This is the part the current 70 × 22 m strip of 64 short trees cannot do, and it is what Ted
is asking for. Every item is textual:

| the book | the requirement |
|---|---|
| *"come da camurato culmo di densante fronde coperto"* — as if roofed by a **vault** of thickening foliage | a **closed canopy**. Not scattered trees with sky between them: an unbroken ceiling. *camurato* is the architectural word for a curved vault — Colonna is describing the wood as a building |
| *"non penetrava l'alma luce"* — the kindly light did not penetrate | direct sun on the wood floor should be near zero. Shafts, not illumination |
| *"fresca umbra, humido aire et fosco nemorale"* — cool shade, damp air, woodland **murk** | Dallington softens *fosco* to "solytarie thicket". It means dusky, murky, dim |
| Dall. p. 17: on getting out, *"My eyes before vsed to such **obumbrated darkenes**, could scarse abide to behould the light"* | the exit must **dazzle**. Whatever the wood's exposure is, the plain outside it has to be a jolt. This is the strongest single argument that the wood is genuinely dark: his eyes have dark-adapted |
| *"spesse fiate negli **radiconi da terra scoperti** cespitando"* — often stumbling on roots uncovered from the ground | surface roots on the floor, an obstacle, not decoration |
| *"non densi virgulti, pongente vepretto"* — dense saplings, pricking bramble | an understorey. Brambles that snag: he arrives out of it *"my clothes torne, my face and hands scratched and netteled"* (Dall. p. 18) |
| Dall. p. 15: *"could not finde any track or path, eyther to direct me forward, or lead me back againe"* | **no path.** The world keeps a 5.4 m corridor clear through the wood (`if (Math.abs(x) < 2.7) continue`). The book's wood has no corridor; that is its whole terror |
| Dall. p. 15: wandering *"sometime to the right hand, sometime to the left: nowe forwarde, then backe againe"* | it should be possible to get lost, and to have to work out the way |
| Dall. p. 15: *"without any helpe but onely the **keeping of the sunne still vpon one side**, to direct mee streight forwarde"* | the one navigational instrument the book gives, and a ready-made mechanic. See [`DIRECTIONS.md`](DIRECTIONS.md) §2 |
| It. l. 566: *"alle mie sospirante voce sola **Echo**… offerivase risponsiva"* | the wood answers. Echo is the only voice in it |
| Dall. p. 19: *"the fall of trees, through the force of a **whyrlewinde**, & noise of the broken bowghes, with a redoubled and hoarse sound a farre of"* | wind in the canopy, and the crack of falling timber at a distance |
| Dall. p. 15 / It. l. 566ff: boar, aurochs (Dall. "Beare"), hissing serpent, and **wolves in the plural** — *"da fremendi lupis incursanti"* | feared, and **never seen**. Fabiani Giannetto makes the point: "he does not even see any of the beasts he expects to see." The wood's threat is entirely anticipated |

### How big, and how tall

Poliphilo names it: he begins *"ragionevolmente suspicare et crederme pervenuto nella
**vastissima Hercynia silva**"* — reasonably to suspect he had come into the vast Hercynian
Forest (It. l. 563–564).

> The Hercynian forest "was described by historians and geographers as **the largest and most
> impenetrable of all forests in Europe** and it was thought to be inhabited by wild and
> dangerous animals."
> — Raffaella Fabiani Giannetto, "Not before either known or dreamt of", *Word & Image* 31.2
> (2015), p. 4 — corpus file `md/Word_Image_2015_apr_03_vol_31_iss_2_Fabiani_Giannetto…md`

That is the citation that sets the wood's scale. Caesar's Hercynia (*BG* VI.25) takes nine
days to cross at its narrowest and no one has found its eastern end. **The wood is not a
feature the dreamer passes; it is a region he is lost inside of**, and the plain, the spring,
the stream and the great oak are all *within or beyond* it, not beside it.

Heights, for the trees themselves: the world's `SPECIES` table gives oak a 2.2 m trunk with a
1.8 m crown, scaled ×1.15 and ×0.9–1.7 — a tree of roughly 6–11 m whose lowest foliage starts
at about 2.5 m. Mature European oak, ash, elm and holm oak stand **25–35 m** with the first
branch well above head height. To "tower over our hero and cast enough shadows to make it
dark", the wood's trees want to be **four to five times their present height**, with the crown
base at 8–12 m, so that the walker moves in a hall of trunks under a ceiling — which is
exactly the *camurato culmo* the book describes.

---

## 2. The second wood — the grove of the second dream, chapter II

When Poliphilo falls asleep *inside* the dream, under the great oak, he wakes into a
different landscape, and the contrast is the point. Dallington p. 23:

> *"a delicate valley, in the which did rise a small mounting of no great height, sprinkled
> heare and there with young Okes, Ashes, Palme trees broadleaued, Aesculies, Holme,
> Chestnut, Sugerchist, Poplars, wilde Oliue, and Oppies **disposed some hyer then other,
> according to the mounting or fall of the place**"*

and then, in the plain of the same valley, a thicket of medicinal simples "like little young
trees" — flowering broom, trefoil, shear-grass, honeysuckle, musked angelica, crowfoot,
ragwort — and beyond that *"a sandie or grauelly plaine, yet bespotted with greene tuffes"*
carrying a single **date palm** heavy with fruit, "an elect and chosen signe of victorie".

The defining phrase for the builder is: *"Thus walking solitarily betwixt the trees, **growing
distantly one from another**"*.

**Wood one is closed and dark; wood two is open and sunlit, its trees standing apart on a low
rise, graded by the slope.** The wolf appears here, on the **left hand**, in the pleasant
place — and the wooded mountains that will turn out to be the pyramid's valley are seen from
here, far off, apparently joined. This is the wood the world's current tree-scatter actually
resembles, and it belongs at the *second* stage of the journey, not the first.

---

## 3. The third wood — the wooded country beyond the vaults, chapter VI

After the crawl under the pyramid, Poliphilo comes out into worked and watered country. The
world builds its meadow half as `fields` (station `fields`, built 2026-09-07), but not its
wood. The Italian (ll. 2793–2813) is far richer than Dallington p. 92:

- an **ancient bridge**, under which "a large vein of clearest living water" gushes and
  **divides into two streams, one to the right and one to the left**;
- banks of stone and shade, *"nelle quale ripe apparevano discoperte le varicante radice"* —
  the straddling roots laid bare in the bank, hung with **maidenhair fern** and
  **cymbalaria**;
- *"il quale arboroso et fresco nemore era d'intuito piacevole… pieno di silvie avicule et
  montane"* — a fresh leafy grove, pleasant to look at, **full of woodland and mountain
  birds**; beyond the bridge a plain "resounding throughout with sweet chirping";
- **squirrels** leaping and **dormice**, and other harmless little animals;
- the whole a *"silvosa contrata circunclusa dall'arborifera montagna"* — a **wooded district
  ringed by a tree-bearing mountain**;
- brooks running down the feet of the mountains into the valley, edged with **flowering
  oleander**, osier, coltsfoot and loosestrife, shaded by **tall black and white poplars**,
  **riverside alder** and **manna-ash**;
- and on the mountains above: *"l'alto et unistirpio abiete et gli lachrymosi larigni et
  sapini"* — **tall single-stemmed fir, weeping larch and silver fir**.

Dallington's parallel list for the plain (p. 92) adds hazel, filbert, privet, plane and ash,
honeysuckle and hops — and one detail worth keeping: a tree "**beeing red towardes the north,
and white against the Southe**."

**Three build consequences.** First, **the conifers belong here, on the mountain slopes, and
nowhere else** — putting fir in the dark wood took them from the wrong passage. Second, the
water is a *divided* stream off a bridge, one branch each way, which is a legible piece of
geography the world can carry. Third, this wood is where the octagonal fountain-house is first
glimpsed *"tra gli arbori… et sopra le tenelle cime il suo fastigio"* — through the trees,
with its roof-crest above the tender treetops. **A building seen through a wood before it is
reached** is a sightline the world does not currently have anywhere, and it is the book's
standard way of introducing a monument.

---

## 4. When the dream happens, and what that does to the light

Two independent anchors, and they agree:

- **The sun is in Taurus.** The proem's winds bend the fir *"sotto gli corni di tauro
  lascivianti"* (It. l. 475) — under the horns of the wanton Bull. The sun passes through
  Taurus from roughly **20 April to 20 May**.
- **The day runs from dawn to past noon.** It opens with Phoebus rising out of the ocean waves
  and the moon unyoking her two horses (Dall. p. 11); the wood is walked in *"el meridionale
  aesto"*, the **midday heat** (It. l. 589); and the pyramid's stair windows are cut to the
  "**Orientall Meridionall and Occidentall** partes of the ayre, that euery houre of the day
  the sunne shined in" (Dall. p. 32).

So: a **high May sun**, arriving at the monuments near midday. That is a hard, bright,
short-shadowed light on the open ground — which is precisely what makes the wood's darkness
read. The contrast is the effect, not the absolute level: the wood is dark *because* the plain
outside it is glaring.

---

## 5. What each mode owes the woods

| mode | what it gets | what it owes |
|---|---|---|
| **Walk** | the only place in the world with no path and no sightline; the one place where the dreamer can genuinely lose his bearings, and the "sun on one side" heuristic to get out | it must be possible to get out. A wood you can be permanently lost in is a bug, not an adaptation — the book's answer is the prayer that ends it (Dall. p. 17), so an audible or visible relief after enough wandering |
| **Tour** | a stop whose *quotation* is already chosen: the vaulted-foliage sentence | the tour teleports past the getting-lost, so its wood stop must at least stand under the closed canopy and look up |
| **Dream** | the book's own opening beat, and the mood the other twelve stops are measured against | the reaction-choice here is the dream's first, and it should be about fear and disorientation, not about looking at a tree |
| **Fly** | from the air the wood is a canopy — a solid green roof, the only part of the world that reads as one surface | a canopy that holds up from 40 m, which leaf cards seen from directly above generally do not |
| **Roll** | fallen timber, roots, brambles, acorns — a dense field of small rollables, and trunks that are *not* rollable | the six-metre census cut-off will reject every proper 30 m trunk. `_monoliths` will fill with the wood unless the cut-off is raised with the scale |

---

## Sources

- The 1499 Italian, `C:\Dev\hypnerotomachia polyphili\md\Francesco_Colonna_Rino_Avesani…Poz.md`
  — the authority for the species lists, the vaulted canopy, the Hercynian naming and the
  Taurus dating. Line numbers as cited.
- Dallington 1592, `md/Hypnerotomachia_by_Francesco_Colonna.md`, pp. 11–24 and 90–92.
- Raffaella Fabiani Giannetto, "Not before either known or dreamt of: the *Hypnerotomachia
  Poliphili*", *Word & Image* 31.2 (2015) — for the Hercynian forest's standing as the largest
  and most impenetrable forest in Europe, and for the observation that Poliphilo never sees
  the beasts he fears.
- `PLANTS.md` for the garden species and the Rhizopoulou identifications; this file
  deliberately does not repeat them.

Godwin (1999) is in copyright, is not in the corpus, and was not used.
