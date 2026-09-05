# Architecture — research pass

> Read 2026-09-01 from `E:\pdf\hypnerotomachia polyphili`: John Bury, "Chapter III
> of the *Hypnerotomachia Poliphili* and the tomb of Mausolus" (*Word & Image*
> 14.1–2, 1998, 41–60) and Brian A. Curran, "The *Hypnerotomachia Poliphili* and
> Renaissance Egyptology" (same volume, 156–85); with the marginalia in `hp.db`
> and our own translation in `translation/en/`.

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
the Architectural Body in the Early Italian Renaissance* (MIT Press, 324 pp.)** is
the most important architectural study in the archive and is an image-only scan
with no extractable text. Nothing above rests on it. **It should be OCR'd before
the next architecture pass** — it is the one source likely to change the framing
rather than the details.
