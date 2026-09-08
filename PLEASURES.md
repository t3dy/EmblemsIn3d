# Pleasures — what a Renaissance garden was *for*, and how Poliphilo tells us

*A build brief in the book's own words. Every row starts from something Poliphilo says or
notices when a pleasure is delivered to him, because he is the most reliable instrument we
have: he tells us what he felt, in order, at the moment he felt it.*

**Read with** [`GARDENS.md`](GARDENS.md) (Hunt and Segre on the garden as a designed
sequence), [`PLANTS.md`](PLANTS.md) (what grows and how it is built), and
[`src/data/poliphilo.json`](src/data/poliphilo.json) (the 50 utterances, which this file
treats as the specification they are).

---

## 0. The book hands us the scheme: the five senses walk him round

At the bath, five nymphs take charge of him, and Dallington's own marginal gloss on the page
says what they are: **"These nimphs were his fiue sences."** Each carries her instrument.

> "…we are fiue companions, and I am called **Aphea**, and she that carrieth the boxes and
> white cloathes **Offressia**. This other with the shining Glasse (our delightes) her name
> is **Orassia**. Shee that carrieth the sounding Harpe is called **Achoe**, and shee that
> beareth the casting bottle of precious Lyquor, is called **Geusia**. And we are al now going
> togither to these temperate bathes, to refresh and delight our selues."
> — Dallington p. 109

Aphea, who is Touch, gives him her hand — *"giue mee thy hand, thou art verie welcome"* — and
that is the whole book in a gesture: the senses take the dreamer by the hand and lead him.

So this is not a list of decorations. **The garden's pleasures are organised by sense, the
book says so, and the five who say so are already standing in our world with their attributes
in their hands** (`SENSE_NYMPHS` in `HPWorldScene.js`). What follows is what each sense is
given to enjoy.

---

## 1. Shade and coolness — the pleasure the book names most often

This is the one. Count the mentions: it recurs more than any other sensation in the book, and
almost always in the same three-word shape — *coole shade*, *coole grasse*, *coole vmbrage*.

> "…Plane trees, Ashe trees, and such like, spredding and stretching out their braunches:
> fowlded and imbraced with the running of **Hunnisuckles or woodbines, and Hoppes, which made
> a pleasaunt and coole shade**." — p. 92
>
> "…**building a delightfull shadowe**, the trees full of small birdes and foules." — p. 94
>
> "…solacing and sporting themselues among the flowering hearbes and **fresh coole shadow**."
> — p. 102
>
> "…as they thus contentedly rested themselues a while, **vnder the coole vmbrage of the leafie
> Trees**." — p. 121
>
> "…**making the shadowed places vnder the leaffye Trees, coole and fresh**." — p. 196
>
> "…**the coole grasse with variable flowers like a painting**, remaining alwaies vnhurt." — p. 237
>
> "…solacing themselues vpon the greene grasse, **fresh shadowes**, and by the coole riuers and
> cleere fountaines." — p. 241
>
> "**A ground most healthfull, the grasse coole and sweet**." — p. 257

**The build instruction.** Shade is not a look, it is a *place you go to*. A garden with no
shade has no interior — every part of it is the same part, and this world had none.

→ **Built 2026-09-07, and it took two goes.**

*First:* make the canopies cast. Each was casting from six of its sixty leaf-cards and the
dark core of the crown cast nothing at all, so every tree stood in its own light like a
cut-out. The core now casts and about half of each canopy's cards do. **On the ground this
changed nothing visible** — over a 130-metre world with one 2048 shadow map, and an
environment light carrying most of the illumination, no pool appeared anywhere. The change is
kept because it is correct and it is what makes carved stone read.

*Second, and this is what you see:* **bake it.** The sun here is a single fixed key at
(16, 22, 10). There is no time of day and no season, so a tree's shadow never moves — which
means a baked shade map is not an approximation of a shadow, it *is* the shadow. One canvas
over the whole world, a soft pool dropped down-sun of every one of the 285 trees with torn
satellites round its rim, and it serves both the ground plane (a transparent overlay) and all
58 000 blades of the meadow (one texture lookup in the shader that already existed). It is
also art-directable, which a shadow map is not.

The shade is tinted **cool**, not black. What still reaches shaded grass is the sky, not the
sun, so shade that is merely dark reads as dirt.

→ **`_buildShadeMap()` in `HPWorldScene.js`; `sunMask()` in `Meadow.js`.**

---

## 2. Birdsong — a pleasure this site must show rather than sound

> "…the trees **full of small birdes and foules**." — p. 94
>
> "…the **sweet chirpings and quiet singing of Birds**, and the temperate and healthful ayre." — p. 101
>
> "…from the trees **resounded the sweete consents of small chirping birds**." — p. 257

**The site is silent by design** (`DECISIONS.md`, 2026-09-04: no music, anywhere). That looks
like a problem and is actually the book's own solution. At the fountain of the sleeping nymph
Colonna does not describe birds singing — he describes **birds carved as though they were
singing**, and marvels at the carving:

> "…and **prettye byrdes as yf they had beene chirping and singing of hir a sleep**… I wondered
> also at the woorking of the clothe coueringe as yf it had been wouen: and at the bowes,
> braunches, and leaues, and at the **little birdes, as if they had been singing and hopping
> vpp and downe vpon their pretie feet**." — p. 98

That is the rule for every pleasure we cannot deliver: **show it being represented.** The
book does this constantly and it is the same move as the silk flowers and the painted scent —
the *paragone* again.

→ **Built 2026-09-07:** birds in the canopies and wheeling over the garden, seen and not heard.

---

## 3. Scent — and the counterfeit of scent, which is the book's own trap

> "And there was **so sweete a smell as Arabia neuer yeelded the like**." — p. 115, in the bath
>
> "…their toppes, laden with the aboundance of their floure and fruites, **breathing forth a
> most sweet and delectable odoriferous smell**." — p. 101
>
> "…I annoynted my selfe therewithall, and **I founde great pleasure therein**, for besides the
> excellent smel and sweete sauour, it was verie good to comfort my bodie, legges, and armes,
> that had been so wearied." — p. 119, Offressia's box of ointment
>
> "…out of the which did ascend a **thicke smoake or fume, of an inestimable fragrancie**." — p. 224

And against those, the fake, in the silk garden:

> "**From the flowers did breath a sweet fragrancie by some cleare washing with oyle for that
> purpose.**" — p. 176

**The build instruction.** Smell cannot be shipped, but **smoke can be seen**, and the book
gives us smoke: censers, the fume of the sacrifice, the perfumed banquet. Scent enters the
world as *visible fume*, and only where the text puts a censer. Note that the counterfeit
scent belongs to the silk garden, which `GARDENS.md` §3 argues we should not model at all —
Hunt shows that illustrating it destroys it.

→ **Built 2026-09-07:** drifting fume above the censers.

---

## 4. Running water — sound, movement, and the surprise

> "Issuing and sending foorth in diuers places **small streames of water, pyppling and slyding
> downe vpon the Amber grauell in theyr crooking Channels** heere and there, by some **suddaine
> fall making a still continued noyse**, to great pleasure moystning the open fieldes, and
> making the shadowed places vnder the leaffye Trees, coole and fresh." — p. 196

That sentence contains the whole water programme of an Italian garden: the rill in its
channel, the gravel it runs over, the small fall that makes the noise, and the coolness it
throws off under the trees. And the garden's practical joke is already here and already
built — **ΓΕΛΟΙΑΣΤΟΣ**, the trick step at the bath that soaks whoever treads it, at which
Poliphilo, soaked, says:

> "**O you women, that are burners and destroyers, doo you vse mee thus?**" — p. 121

He is the butt of the joke and he laughs; that is the *giochi d'acqua* exactly as the Villa
d'Este or Pratolino meant them.

**Built:** the jets, the basins, the stream on its gravel bed, the trick step.

→ **The rills, built 2026-09-08** (`_buildRills`). Every clause of that sentence is a
specification and all of them are in the build. *Crooking channels* — they wind, and they are
**cut**, with a kerb, unlike the wild stream in the wood which merely lies on the ground.
*Amber gravel* — the bed is a warm ochre and it is what you actually see, because the water is
two inches deep. *A suddaine fall* — each has a lip in it, which is the only reason a rill this
small makes any sound at all; the site is silent, so the fall is built to be **seen** making
its noise (a white break and a splash), by the same rule as the birds. *Moystning the open
fieldes* — they cross open sward, not paving, and the bank is greener and wetter than the field
around it. The first siting ran them straight through the Three Doors wall, which occupies
z 10.6–13.4 clear across the world; they were moved to the open band south of the elephant
plaza.

---

## 5. Repose — the pleasure of being made to sit down

> "…**were constrained to rest our selues for want of breath, vpon the odoriferous floures &
> coole grasse**, by meanes whereof, I became somewhat oportunely to bee eased, my heate
> aswaging and relenting by little and little." — p. 121

The flowery bank you lie on is a real fifteenth-century garden object — the turf seat, the
*sedile* — and it is where the book puts its characters when it wants them to talk. Thelemia
sits down under an arbour to sing (p. 182); the nymphs rest on the flowers and the cool grass;
the Queen's court has settles of green velvet (already built).

→ **Built 2026-09-07:** turf seats — banks of raised, flowering ground — where the book rests
its people.

---

## 6. Fruit, and the taste of things

Geusia carries "the casting bottle of precious Lyquor," and she is the one who feeds him:

> "…**of these whiche I haue made choyse of take, and for my freedome taste**." — p. 122

Hunt's observation about Cythera is the key one: **the trees bear fruit whatever the season,
and the topiary is clipped every day.** The garden is not natural and does not pretend to be;
what it refuses is *counterfeiting*. Fruit must therefore be present, ripe, and reachable —
never out of season, never wax.

**Built:** fruit on apple, pear, plum, orange, citron, lemon and fig. The orchard of second
nature carries it at picking height.

---

## 7. Sight, and the pleasure of being deceived by art

This is Poliphilo's own favourite, and it produces the best sentence in the book about what a
garden is doing to you:

> "**Oh how exsquitely were the same Images cut, that oftentimes my eyes would wander from the
> real and liuely shapes, to looke vpon those feyned representations.**" — p. 114

He is in the bath. The carved nymphs of the frieze and the living nymphs in the water are
close enough that his eye keeps changing its mind about which is which. **That is a
composition instruction, not a modelling one**: the carved figures and the living figures have
to be at the same scale, in the same light, in the same view, or the sentence cannot happen.

And its companion, on the craft itself:

> "**Oh reuerend arthists of times past, what despite hath gotten the vpper hand of your
> cunning, that the same is buried with you, and none left for vs to inherite in this age?**"
> — p. 55

---

## 8. The pleasure of not wanting to leave

> "**O happie were hee that myght bee but a drudge or kitchin slaue in suche a Paradice.**"
> — p. 174, being led out of the Queen's palace
>
> "**Oh that I might be, if it were possible, a free man in such a place, for no sorrow shoulde
> greeue me, nor imminent danger should make me afraid.**" — p. 247

Both are said while he is being moved *on*. The pleasure the book keeps naming last is the
pleasure of a place you resent leaving — which is an argument for free walk being the primary
mode, and for the tour never dragging you off a station you have not finished with.

---

## 9. What must not be delivered

Two, and both matter.

- **Sound.** The site is silent, and staying silent is a standing decision. Every acoustic
  pleasure in the book — the harmony of p. 19, Achoe's harp, Thelemia's lute, the birds, the
  falling water — is staged as something *seen*. §2 above is the method.
- **The counterfeits.** The glass garden's balls "lyke pearles shining," the silk garden's
  pearled flowers, the fragrance washed on with oil. Hunt's argument (`GARDENS.md` §3) is that
  the 1499 and the 1592 both decline to illustrate these, that the 1546 French edition
  illustrated them and *damaged* them, and that the omission "forces readers to adjudicate
  these designs for themselves." **Withholding is the faithful move here.** It is the only
  place in this world where that is true.

---

## The ranked list

| | Pleasure | Status |
|---|---|---|
| 1 | **Shade** — a baked shade map over the whole world, cool-tinted, on ground and grass alike | **built 2026-09-07** |
| 2 | **Birds** — in the canopies and over the garden, seen not heard | **built 2026-09-07** |
| 3 | **Repose** — turf seats and flowery banks | **built 2026-09-07** |
| 4 | **Visible fragrance** — fume from the censers | **built 2026-09-07** |
| 5 | **Rills** — cut channels, amber gravel, a lip and a fall, p. 196 | **built 2026-09-08** |
| 5b | **The shaded walk of p. 92** — plane and ash laced with honeysuckle, woodbine and hop, over a floor of leaf litter, with the umbriphilous herbs the same sentence names | **built 2026-09-08** |
| 5c | **Hedges** — box with a leafy silhouette rather than a smooth green solid | **built 2026-09-08** |
| 6 | **The bath's paragone** — carved and living nymphs composed into one view | open; needs a camera study, not new geometry |
| 7 | **Seasonal and diurnal light** — the garden at one hour only, forever | open, large |


---

## 10. Addendum, 2026-09-08 — three more, and a fix

**The shaded walk (p. 92)** is now built, and it is the sentence that taught this document what
the book means by pleasure:

> "…**Plane trees, Ashe trees**, and such like, spredding and stretching out their braunches:
> **fowlded and imbraced with the running of Hunnisuckles or woodbines, and Hoppes, which made a
> pleasaunt and coole shade**. Vnder the which grewe … **iagged Polypodie**, and the Trientall and
> foure inched **Scolopendria, or Hartes toongue**, **Heleborous Niger**, or Melampodi … and such
> other **Vmbriphilous hearbes** and Woodde Flowers." — p. 92

Four things, and the book supplies all four: the trees, the climbers that lace them, the shade
they make, and the herbs that can live *only* in that shade. All four are built — `ash` joined
`SPECIES`, and `polypody`, `hartstongue` and `hellebore` joined `HERBS`. The walk registers
itself with the shade map as a **line** rather than a set of pools, because a walk of laced
trees throws continuous shade; that is what makes it a walk and not an avenue.

**Hedges got a silhouette.** Box was the commonest single material in the world and it was a
smooth green solid everywhere it appeared. A texture is not what makes a hedge read as a hedge
— what reads is the **edge**, the fuzzy rim of half-cut twigs the shears leave. `_hedgeFringe`
scatters box-leaf cards over a box that has already been built; `_hedgeFringeArc` does the same
round a circle, for the labyrinth's seven banks, Cythera's rampart, and its terrace kerbs.

**And the water stopped blowing out.** The fountains' mirror finish (Ted, 2026-09-06: "fountains
that look like real water") was very nearly a perfect mirror — roughness 0.06, ripples at
half depth — so at grazing angles, which is how you see water from a 1.7 m eye, the sun's
reflection became a solid white wash across the whole surface and spilled onto the bank. It
took four wrong guesses to find (bloom threshold, environment intensity, the meadow's
back-light, the particle streams) before a raycast into the bright pixels named it. **A real sun
path on water is not a sheet; it is broken by the ripples into glitter.** The ripples got twice
the depth and the finish a little tooth. It is still a mirror.
