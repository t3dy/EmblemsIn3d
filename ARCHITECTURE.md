# Architecture — research pass

> Read 2026-09-01 from `E:\pdf\hypnerotomachia polyphili`: John Bury, "Chapter III
> of the *Hypnerotomachia Poliphili* and the tomb of Mausolus" (*Word & Image*
> 14.1–2, 1998, 41–60) and Brian A. Curran, "The *Hypnerotomachia Poliphili* and
> Renaissance Egyptology" (same volume, 156–85); with the marginalia in `hp.db`
> and our own translation in `translation/en/`.

## 0. Lefaivre, read at last (2026-09-05)

This document was written believing that Liane Lefaivre's *Leon Battista Alberti's
Hypnerotomachia Poliphili: Re-Cognizing the Architectural Body in the Early Italian
Renaissance* (MIT Press, 1997) was an image-only scan, and it said she was the one
source likely to change a framing rather than a detail. **She is readable** —
`md\Liane_Lefaivre_…Re_Cognizing_th.md`, 15,878 lines — and she does change one.

### Her framing: the architecture is RECOMBINED, not invented and not copied

Lefaivre's core argument is that the *Hypnerotomachia*'s buildings are made the way
Alberti thought all creative work is made: by **recombining a thesaurus of studied
parts**, not by inventing forms from nothing and not by imitating one model. She
grounds it in the passage of *De pictura* where Alberti retells Cicero on Zeuxis, who
was commissioned for the temple of Lucina at Croton and

> "did not think all the qualities he was after to combine within a portrait of beauty
> could be found in one person"

— and so selected five women, because "complete beauties are never found in a single
body, but are rare and dispersed in many bodies." Alberti's innovation, she says, was
to make that "into a general principle applicable to all areas of creative thinking."
He had trained as a lawyer, and treated accumulated knowledge "as a thesaurus from
which to construct the present, unprecedented case… a knowledge base from which to
assemble new constructs" (pp. 184–86).

The literary half of the book works the same way: Pozzi and Ciapponi traced over 500
of its passages to Pliny, 445 to Apuleius, 223 to Ovid, 186 to Boccaccio, 134 to
Festus, 123 to Virgil, and on down. "The whole story of the Hypnerotomachia, one may
claim, is a composite of citations."

### What that licenses, and what it forbids

**It licenses what this repo already does, and gives it a name.** The shared classical
members in `HPWorldScene.js` — `_column(order)`, `_entablature()`, `_steps()`,
`_doorway()`, `_frieze(kind)` — composed into buildings, are not a shortcut around
modelling each structure individually. **They are the book's own compositional method.**
Nygren says the same of the triumphs: Colonna is assembling a procession out of studied
antique fragments. Build by recombining a member library, and you are building the way
the book was written.

**It forbids invention that is not recombination.** A part with no source is not a
recombination of anything. The rule stands: if the plates and the scholars do not
settle a detail, say so in the comment and keep the geometry modest.

### The correction it caught immediately

**The colossal horse is WINGED, and the first build had no wings.** Lefaivre describes
the plate as "a wild, unbridled, **winged** steed … charging headlong at full gallop,
ears drawn back, head twisted sideways, bucking the unlucky riders who try in vain to
cling to its back and mane," and says "the image might serve as an emblem for the whole
work" (pp. 79–80). Our own translation's summary of chapter III says "a winged horse"
too. Fixed the same day. **This is what a re-read is for.**

She also gives the pedestal in full — the fourteen dancers under AMISSIO, each masked
laughing in front and weeping behind; the flower-gatherers under TEMPVS; the GENEA on
the forehead; the *equus infoelicitatis* — and the whole monument was built from
pp. 256–57.

### The frame: why loving a building was a new thing to do

Her chapters 6–8 are the argument the *architecture* commentary lens should route
through, and they are not decoration on the technical material — they are the reason
the technical material is in a love story at all.

**Chapter 7, *The Dangerous Body*.** For roughly ten centuries it was **forbidden to
love architecture**. Petrus Cantor: the world is transient, so there is no point
building anything, and imitating the buildings of ancient Rome is specifically
condemned. Hildebert of Lavardin attacks Rome as the emblem of fleeting earthly
attachment. Alexander Neckam takes aim at height itself — "the towers rise up
threatening the stars" — and cries "O curiosity! o vanity! o vain curiosity! o curious
vanity!" Bernard calls sumptuous building not merely vain but insane. Savonarola, as
late as 1483, is still attacking prelates who "feed upon vanity" and fill churches with
gold. Architecture is filed under *vanitas*, *curiositas*, and the mercenary.

**Chapter 6, *Reconfiguring the Architectural Body*.** The Hypnerotomachia is the exact
inversion of that world: *amor mundi* translated into a militant **libido aedificandi**,
the desire to build. Lefaivre's terms are Lévi-Strauss's — "cold" thinking, constricted
and change-averse, giving way to "hot" thinking, committed to change and to *ingegno* —
and she argues **the human body was the main lever** in the change. The battle was for
beauty: "the aestheticizing, hedonizing, and… eroticizing of thinking."

**So Poliphilo's arousal in front of a building is not a quirk of the book, it is the
book's thesis.** When he is drawn to the arch by "the noble commotion arising from the
pleasing love that he feels for the solid body of the building," a thousand years of
prohibition is being answered. An `architecture` note that treats the erotic register as
an oddity to be excused has the argument backwards.

### The operative rule this gives us: precious material is CLOTHING, and it points

**Chapter 8, *The Marvelous Body*.** In the *mirabilia* register the building-as-body is
not stated outright — it is, in Lefaivre's Freudian borrowing, **"displaced" by the
architectural clothes that cover it**:

> "The clothes of the building take the literal form of cloths draped over parts of the
> building, but also are the accoutrements, the precious and dazzling materials — gold,
> gems, marbles, artworks — that serve to **attract attention to particular areas** of
> the building."

That is a placement rule, not a palette. Gold, gems and coloured marble in this world
should not be spread evenly as richness; **they mark where the eye is meant to go** —
a threshold, a throne, a door that matters, the one panel carrying the inscription.
Where the world already does this (the gold banding running to the throne in the court,
the gem columns at the fountain) it is right for the reason Lefaivre gives; where it
merely gilds a surface it is decoration, and should be moved to somewhere that means
something.

And the literal half of it — **cloths draped over the building** — the world does not
have at all. See `NEXTSTEPS.md`.

### The Colossus — researched, specified, and NOT built

`docs/HP_SOURCEBOOK.md` §5: "the ruins field before the elephant contains 'the horse,
the Colose, and the Elephant' as a set — we build only the elephant." The horse went up
on 2026-09-05. **The colossus was attempted the same day and reverted** (see below).
The research stands, and this is the brief for whoever tries again.

**What it is.** Lefaivre, pp. 52–53: a hybrid **sculpture/building**, "the colossus
supine in the sands." Poliphilo enters it **through the mouth** and finds the interior
"formed exactly like the inside of a human body. All the internal viscera, nerves,
bones, muscles, and flesh are there to be seen and visited. Above all the organs are
listed their names and the different sicknesses generated in them. Each organ has a
convenient entrance for visitors. Concealed light shafts brightly illuminate the
interiors of the chambers." There is a chamber **in the heart, "where love is born"**
(f. b6v), with its own list of cures — **written in Chaldean, and Poliphilo does not
divulge them.**

**The companion.** "Lying next to it is a female counterpart, which Poliphilo refuses to
enter." Priki reads her as the book's first figure of loss: the half-hidden female
colossus "hints at what is lost and which Poliphilo cannot yet pinpoint" — he has
forgotten Polia and does not know it yet. She should be more buried than him, and she
should have **no door**.

**Why it belongs to the argument and not to the curiosities.** Lefaivre: the colossus
and the elephant are "the first architectural structures to be conceived **organically**
— that is, to forsake the regular geometric outlines associated with the classical canon
in favor of the irregularly curved forms of a living organism." Nobody thinks this way
again until the twentieth century. **A building shaped like a body is the
architectural-body metaphor ceasing to be a metaphor**, which is the thesis of her
whole book.

**Why the first attempt failed, and what to do differently.** It was built as overlapping
ellipsoids half-sunk in sand, and it read as a row of green domes — a caterpillar, not a
man. Two causes, and the second is the important one:

1. It was placed at (−12, −11), **1.6 units from the Triumph of Leda's car**, because I
   did not read the `TRIUMPHS` table in the same file. Measure against `TRIUMPHS` and
   `HP_STATIONS` before choosing ground.
2. **A recumbent, half-buried figure has almost no silhouette**, and at this register the
   silhouette is the asset. This is the same failure as the rejected `massed` animal
   build, in the same session. The next attempt should either
   (a) **stand him up** — a fallen colossus is more legible broken and propped than lying
   flat — or (b) build him **as architecture rather than as anatomy**: a vaulted hall in
   the rough outline of a body, entered through a doorway framed as a mouth, which is
   what the book actually describes and what Lefaivre's "hybrid sculpture/building" means.
   **(b) is the better reading of the source and plays to what this toolkit is good at.**

### Still to mine

Chapter 9, *The Divine Body*, and chapter 10, *The Humanist Body* (from which the
colossal horse and the elephant descriptions above are drawn). Chapter 3, *The Code of
Recombination*, is summarised in §0.

---

## 1. The finding that changes how we treat every source image

**The 1499 woodcuts do not agree with the 1499 text.** Bury reconstructs the great
pyramid-portal of Chapter III from Colonna's own measurements and finds that

> the artist responsible for the famous full-page woodcut on folio b i verso
> produced an unforgettable image, but it is far from being a faithful
> illustration. The Corinthian order for example lacks textual authority and the
> artist took extraordinary liberties with the measurements given in the text…
> using them produces a structure considerably different in appearance from the
> woodcuts either of the original Italian edition of 1499 or of the French
> translations of 1546.

Bury's own figure 1a is captioned with "a correction of the steeple following the
measurement given in the text" — i.e. he redraws the woodcut to obey the prose.

**This matters to us more than to a book historian**, because we have two
authorities and have been treating them as one. Every station we build can follow
the picture or follow the numbers, and they diverge. A rule is needed, and it
should be: **follow the text, record the divergence, and let the woodcut mode be
where the picture wins.** That is a use for the two-rendering system nobody
anticipated — the lit world can be the text's building and the woodcut world the
engraver's, with the discrepancy itself becoming the exhibit.

## 2. The impossible measurements are deliberate

Bury also disposes of the temptation to treat Colonna's absurd numbers as errors:

> Of course these measurements included some irrational numbers, twenty or even
> sixty times greater than could be thought at all reasonable. However, these
> elevated figures provide the necessary fabulous elements to conform with
> Aristotle's precept that a work of fiction should excite *admiratio* or
> astonishment.

So the six-furlong base and the 1,410 steps are not a draughtsman's slip to be
tidied away; **they are a rhetorical device whose function is astonishment.** The
design goal is therefore not metric fidelity — which is unbuildable and would
produce an unwalkable world — but the *production of admiratio* by whatever means a
real-time renderer has. Our v2 Portal, which reads the 1,410 courses as many
shallow ones and lets the mass run out of frame, is defensible on exactly this
ground, and the reasoning should be recorded rather than left as a scale
compromise.

## 3. The portal's ancestor is the tomb of Mausolus

Huelsen proposed it in 1910 and Bury substantiates it. Pliny's Mausoleum, as Bury
reconstructs it from the 58 surviving manuscripts and Newton's 1856–8 excavation:

- north and south sides 63 feet, perimeter 440 feet, total height 140 feet;
- a **peristyle of 36 columns**, 37½ feet high;
- above it a **pyramid of 24 steps narrowing into a *meta*** — a spire or post;
- crowned by a **quadriga**, about 15 feet high;
- the pyramid-plus-*meta* equal in height to everything beneath it.

Bury's reconstruction gives a low podium (25 ft), against the tall massive podium
that Newton assumed and twenty later reconstructors copied. He supports it from
the two surviving Carian tombs that would have imitated the Mausoleum — the tomb
at **Mylasa** (podium, peristyle and pyramid intact) and the **Lion Tomb at
Cnidus** — and from Hadrian's tomb at Rome.

**For our build**: the shape to aim at is *low podium → tall colonnade → stepped
pyramid → spire → figure on top*, with the upper half equal to the lower. Our
Portal currently has piers, a lintel, and a long taper. Adding a real peristyle —
and keeping the finial group (cube, four harpies, obelisk, turning Fortuna) as the
*meta*-and-figure — would bring it into line with both Pliny and Colonna at once.

## 4. Hieroglyphs: the actual inscriptions, and what they were for

Curran supplies both the theory and the transcriptions.

**The theory.** Alberti proposed in *De re aedificatoria* (shown to Nicholas V in
1452) that hieroglyphs offered a **non-linguistic alternative to alphabetic
inscription**, immune to the death of a language — his example being Etruscan,
whose alphabet survived on tombs that no one could any longer read. Alberti's own
list: "a god was represented by an eye, nature by a vulture, a king by a bee, time
by a circle, peace by an ox." Colonna's hieroglyphs are an attempt at a script
that cannot become illegible.

**That is the strongest possible justification for the Antiquarian's Eye quest
layer** (SCHOLARSHIP §3): the book's own claim is that these signs are readable
across the death of languages, and a player who reads them is testing Alberti's
claim in the only way it can be tested.

**The inscriptions themselves**, from Curran's plates:

| Where | Text | Sense |
|---|---|---|
| Elephant-obelisk base | **PATIENTIA EST ORNAMENTUM CUSTODIA ET PROTECTIO VITAE** | patience is the ornament, guard and protection of life |
| The Trinitarian obelisk | **EX LABORE DEO NATURAE SACRIFICA LIBERALITER, PAULATIM REDUCES ANIMUM DEO SUBIECTUM. FIRMAM CUSTODIAM VITAE TUAE MISERICORDITER GUBERNANDO TENEBIT INCOLUMEMQUE SERVABIT** | out of labour sacrifice liberally to the god of nature, and little by little you will bring back a soul subject to God; he will hold the firm guardianship of your life, governing mercifully, and keep it unharmed |
| Obelisk of Caesar | **DIVO IVLIO CAESARI SEMP. AVG. TOTIVS ORB. GVBERNAT. OB ANIMI CLEMENT. ET LIBERALITATEM AEGYPTII COMMVNI AERE S. EREXERE** | the Egyptians erected this at common expense to divine Julius Caesar, ever august, governor of the whole world, for his clemency and liberality |
| Caesar obelisk, second face | **PACE AC CONCORDIA PARVAE RES CRESCVNT, DISCORDIA MAXIMAE DECRESCVNT** | by peace and concord small things grow; by discord the greatest are diminished |
| The bridge | **ΑΕΙ ΣΠΕΥΔΕ ΒΡΑΔΕΩΣ** (*aei speude bradeōs*) | always hasten slowly |

The second Caesar inscription has the best hieroglyph in the book: **an ant that
grows into an elephant, and an elephant that dwindles into an ant** — concord and
discord drawn as a single reversible creature. It is a gift for an animated
vignette and we are not using it.

Note also that **our bridge motto is right but our placement is wrong**: *always
hasten slowly* with its circle, anchor and dolphin belongs to **the bridge**, not
to the great portal, where our world currently puts FESTINA LENTE.

## 5. The heptagonal fountain was read as the seven metals — on the page

`hp.db`, `folio_descriptions` entry **y7r**, "Fons Heptagonis: The Seven Metals":

> The illustration of the heptagonal fountain — seven-sided, with seven angles —
> is labeled by Hand B with the alchemical sign of a different element at each
> angle. The seven metals correspond to the seven classical planets…

When the fountain was rebuilt from chapter XXIII, the translation note said "seven
columns for the seven planets is the obvious reading and Colonna does not make it,
so neither do we." **That was too cautious.** Colonna does not make it, but a
Renaissance reader with the book open in front of him did, in ink, on the page, one
sign per angle. The planetary assignment we built is not our invention imposed on
the text; it is a documented sixteenth-century reading of this exact woodcut, and
the world should say so.

Related marginalia worth mining, same table:

- **b6v** — the elephant and obelisk, "densely annotated by Hand B with alchemical
  ideograms embedded directly in the syntax of Latin sentences";
- **b7r** — at the elephant, under the motto *Ponos et Euphyia*, Hand E declares
  the Geberian framework for everything that follows;
- **b5r** — an epigram "D.AMBIG.DD," *dedicated to the ambiguous gods*, glossed
  "diis ambiguis id est metallis hermafroditis" — the ambiguous gods are
  hermaphrodite metals;
- **h1r** — the chess ballet of 32 maidens, 16 silver and 16 gold, read as **three
  rounds of distillation**, silver winning the first.

**BUILT 2026-09-05** as the station `chess`, west of the Planetary Palace.

One correction to the line that stood here: the chess ballet **is not illustrated**.
`page_concordance` records `has_woodcut = 0` for all three of its pages (g8r, g8v,
h1r) — the most theatrical scene in the book is the one the printer left unpictured,
which is exactly why the marginalia around it are so thick. The station is therefore
built from the text and from its readers, and from nothing else.

What it carries: a chequered pavement of sixty-four squares on a two-course
stylobate, thirty-two figures (sixteen silver, sixteen gold, **both queens in gold
and both kings in silver, as the book has them**), the Queen's canopy on the east
side facing her palace, three musicians, and the three rounds danced in a loop —
captures sealed with a kiss, the taken piece walking off to her own side's edge.
Hand E's Latin for each round is cut on three plaques along the west kerb.

## What to build, ranked

1. **Move FESTINA LENTE to a bridge.** It is the book's most famous device and we
   have it on the wrong monument. Build the bridge — it is also where the anchor,
   dolphin and circle belong, and it gives the processional axis a crossing.
2. **Give the Great Portal a peristyle.** Pliny's 36 columns under the stepped
   pyramid, low podium, upper half equal to lower. Brings the silhouette into line
   with the Mausoleum ancestry and with Colonna's numbers at once.
3. **Say that the seven metals are a historical reading**, not our conceit —
   one line in the fountain's HUD copy and in the translation note on p. 359.
4. **The ant-and-elephant hieroglyph** as an animated relief on the Caesar
   obelisk: concord grows the ant to an elephant, discord shrinks it back. One
   scaling animation, and the book's clearest single argument.
5. **The chess ballet** — 32 figures, 16 silver, 16 gold, on a checkered court in
   the Queen's palace, with the three-rounds-of-distillation reading in the
   annotation panel. A whole missing station with the scholarship already done.

## Not consulted

**Liane Lefaivre, *Leon Battista Alberti's Hypnerotomachia Poliphili: Re-Cognizing
the Architectural Body in the Early Italian Renaissance* (MIT Press, 324 pp.)** —
**CORRECTION, 2026-09-05: her text IS extractable.**
`md\Liane_Lefaivre_Leon_Battista_Alberti_s_Hypnerotomachia_Poliphili_Re_Cognizing_th.md`
is 15,878 lines of readable prose. The colossal horse was built from her pp. 256–257
(the GENEA on the forehead, the *equus infoelicitatis*, the fourteen two-masked
dancers under AMISSIO, the flower-gatherers under TEMPVS) and every detail checked
out. The note below is what stood here before and is now wrong; it is kept so the
next reader knows the gap is closed. ~~image-only scan with no extractable text;
should be OCR'd before the next architecture pass~~ — it is the one source likely to change the framing
rather than the details.
