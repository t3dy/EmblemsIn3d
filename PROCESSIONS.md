# Processions and pageantry — research pass

> Read 2026-09-01 from `E:\pdf\hypnerotomachia polyphili` (Michael Leslie, "The
> *Hypnerotomachia Poliphili* and the Elizabethan landscape entertainments,"
> *Word & Image* 14.1–2, 1998, 130–45; A. Segre, "Untangling the knot," same
> volume), the woodcut catalogue in `hp.db`, and our own translation of the
> triumphs in `translation/en/`.

## 1. The book spends its images on the processions, and we do not

The woodcut catalogue in `hp.db` sorts 168 catalogued cuts into narrative
sections. Ranked:

| Section | Cuts | What we have built |
|---|---:|---|
| CYTHERA_GARDENS | **30** | a distant cone on the horizon |
| PROCESSION | **27** | four static cars in a ring |
| POLYANDRION | **27** | nothing |
| BOOK_II_POLIA | 17 | nothing |
| VENUS_TEMPLE | 15 | nothing |
| PYRAMID_RUINS | 11 | the Great Portal ✔ |
| JOURNEY_DOORS | 11 | the Three Doors ✔ |
| QUEEN_PALACE | 9 | the court ✔ |
| VENUS_FOUNTAIN | 7 | the fountain ✔✔ (rebuilt from ch. XXIII) |
| FIVE_SENSES | 5 | the five nymphs ✔ |
| DARK_FOREST | 4 | the wood ✔ |
| DRAGON_PORTAL | 3 | the dragon ✔ |
| CYTHERA_VOYAGE | 2 | Cupid's boat ✔ |

By subject rather than section, **PROCESSION is 29 of 168 cuts** — second only to
plain NARRATIVE. The book's own illustration budget says the processions are
roughly as important as the entire architecture of the first half. Ours are four
parked floats that breathe in place.

## 2. What a triumph actually is in this book

From our translation of chapter XVII (`translation/en/`, and the 1592 at
Gutenberg #18459), corrected in the v2 pass:

**The vehicle.** Not a cart. The first car has **four wheels of Scythian emerald**
and a body of **table diamonds set in fine gold**, six feet long and three high,
two perfect squares in plan. Four **inverted cornucopias** at the corners, mouths
up, spilling fruit and flowers cut from precious stones. A **harpy's foot** at each
corner of the plinth, with acanthus. A **five-leaved rose** where the axle ends.
Axles of solid gold.

**The team — six beasts, never two.**

| Triumph | Team | Detail |
|---|---|---|
| Europa | six **centaurs** | got of Ixion's fallen seed, crowned with ivy |
| Leda | six **white elephants** | coupled two and two, traces of blue silk twisted with gold and silver in true-love knots, gold poitrels set with pearl |
| the mystical car | six **leopards** | "spotted beasts of yealow shining colour," coupled with twined vine-withes in leaf and cluster; and it moves *"very leisurely"* |

**The riders, ranked by livery.** On every car, six nymphs ride the beasts, and
their dress is a hierarchy: **the two nearest the car in blue silk "like the collour
of a Peacockes necke," the middle two in bright crimson, the two foremost in emerald
green** — bearing respectively golden topaz censers streaming fragrant smoke, gold
trumpets with silk banners fastened in three places, and antique cornets. Dallington
gives them the line that should govern the whole scene:

> …singing so sweetly with little rounde mouthes, and playing vppon their
> instruments, within so celestiall a manner, as woulde keepe a man from euer dying.

**The reliefs argue.** The first car's panels are not ornament: the nymph crowning
bulls; the ride over the sea; Cupid shooting into the air among wounded nations; and
Mars before Jupiter showing the wound in his impenetrable breastplate and holding
the word **NEMO** — *no one* is exempt. The car states its own thesis on its sides.

## 2b. Two corrections from the plates (2026-09-05)

Checked the built procession against `hp.db.woodcut_catalog` rather than against
memory, and two of the four cars were wrong:

- **Danaë's car is drawn by UNICORNS, not horses.** Plate #57/#59: *"Third Triumph
  of Danae: unicorns"*. The world had horses. Fixed — and the beast-builder's
  silent fall-through to a horse, which would have hidden the correction, now
  logs a warning instead.
- **There is no "Triumph of Semele".** The fourth car is the **Festival of
  Bacchus** (#64–65), drawn by panthers, *"with Silenus on ass"*. Semele is
  Bacchus's mother and appears in that car's **reliefs** (#58, *Jupiter and
  Semele*) — she has no triumph of her own. The car had been named after a panel
  on its own side. Fixed, and Silenus now rides behind it.
  (Panther and leopard are the same beast in period usage, so the team stands;
  only the title was wrong.)

Also built in this pass, from the ranked list below: **the riders' instruments**.
The liveries were correctly ranked but carried nothing. Now the two nearest the
car in peacock blue swing golden **censers** that actually stream incense; the
middle two in crimson carry gold **trumpets** with the silk banner fastened in
three places; the two foremost in emerald green carry antique **cornets**.

**Still unbuilt from the plates:** the **Triumph of Vertumnus and Pomona** (#66)
is a fifth procession with satyrs and nymphs that does not exist in the world at
all; the **reliefs** on the car sides (ranked #3 below, NEMO among them) are
still not modelled; and the **Triumph of Cupid** on Cythera (#143–144) exists as
a standard rather than as a procession.

## 3. Processions are what the architecture is *for*

Segre's reconstruction of Cythera supplies the detail that reframes this. The
inner rings of the island climb in six terraces, each reached by a flight of seven
steps — **and the steps are deliberately interrupted at the crossroads, where
ornate gates let the triumphal chariots through.**

So the island's geometry is cut for processional traffic. The twenty radial roads
converging on Venus, the pergola-vaulted routes, the gates in the terracing: this
is a machine for moving pageants toward a centre. Our world has a processional
axis and no processions on it.

## 4. What the pageantry meant to a Renaissance reader — and to an English one

Leslie's essay is the reception history, and it is more useful as a caution than
as a source of imagery.

His central negative finding: despite the 1592 translation appearing at exactly
the right cultural moment — after the Armada, with *The Faerie Queene* in print
and English literary confidence rising — **there is almost no demonstrable direct
influence of the Hypnerotomachia on English art or letters.** Ben Jonson owned the
1545 Venice edition (now in the British Library, with pencil underlinings probably
his) and no securely traceable echo appears anywhere in his work, masques included.
Leslie dismantles A. W. Johnson's attempt to prove otherwise with the observation
that anything Vitruvian or Albertian in both authors "is much more readily available
in the common architectural texts of the period."

His positive move is to look instead at *translatio* — "not the literal meaning or
detail… but something much more of the quality of a metaphoric transfer" — and to
compare the book with the short entertainments staged for Elizabeth in real
landscapes. That is the right frame for us too: **our world is a translatio, not a
reconstruction**, and the honest comparison is to a landscape entertainment rather
than to a facsimile.

**On our own translator.** Leslie is very good on R. D.'s anxiety, which is worth
recording since Dallington is now a named voice in our Dream mode. He dedicates
the English volume to the memory of Sir Philip Sidney, dead six years, and then
begs his patron not to think him "amorous":

> …for I beeing restrained of my liberty, and helde in the grave of oblivion,
> where I as yet remaine, oppressed with Melancholie, and wearied with deeper
> studies, I was glad to beguile the time with these conceits…

Leslie's reading: the firewall collapses as he builds it. Poliphilo seeks a dead
beloved who stands for an irretrievable classical past; R. D. opens by mourning a
dead patron, and Italy is to England as antiquity is to Poliphilo. **The translator
is inside his own text.** That is a fact worth surfacing somewhere in the world,
because it is exactly the position our own translation puts us in.

## What to build, ranked

1. **Make the triumphs move.** They are the second-largest block of images in the
   book and they are currently parked. A slow circuit of the processional axis —
   six beasts, six riding musicians, the car following — costs one waypoint system
   we have already written for Dream mode (`DreamMode` walks a guide along a
   Catmull-Rom curve; a float can use the same). *This is the highest-value
   animation in the project.*
2. **Rank the riders' liveries correctly.** Done in the v2 pass (blue / crimson /
   emerald), but the *instruments* are not built: censers streaming smoke, gold
   trumpets with silk banners, antique cornets. Three small props, and the file
   already has a `ParticleStream` that will do the incense.
3. **Put the reliefs on the car sides.** NEMO on the hindmost panel of Europa's
   car is a legible, quotable, quest-able object of exactly the kind the
   Antiquarian's Eye layer wants.
4. **Cut the terraces for the chariots** when Cythera is built — the gates in the
   step-flights are the detail that makes the island's geometry make sense.
5. **A processional mode.** The strongest long-term idea this research suggests:
   the player can *join* a triumph and be carried along the axis, seeing the
   architecture the way the book's pageants see it — from a moving car, at a
   leisurely pace, with the music. That is the Elizabethan-entertainment reading of
   the book made playable, and it is a different experience from walking.
