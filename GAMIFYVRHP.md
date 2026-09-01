# Gamifying the Hypnerotomachia — design

> Written 2026-09-01, after the research pass. A proposal for a third asset
> alongside the Dream Garden (the walkable world) and the Tours (the guided
> reading): **a visual novel in which Poliphilo is a character you build.**
> Prototype at [`game/index.html`](game/index.html).

---

## 1. The problem this solves

The Dream Garden lets you *walk* the book. Dream mode lets you *watch* it. Neither
lets you **be wrong**.

And being wrong is what Poliphilo does. He misjudges his route, he gawps at things
he cannot read, he is offered the ascetic gate and takes the flowered one, he tears
a veil off a goddess with a stolen arrow and only afterwards remembers what happened
to Actaeon. Hunt's reading — that the reader's job is to adjudicate what Poliphilo
cannot — is a description of a game that does not exist yet.

**The design goal: make the player do the adjudicating, and make the book's own
knowledge the thing they spend.**

---

## 2. What the book already is, mechanically

Three structures are sitting in the text waiting to be used, and none of them
needs inventing.

### The two guides are the two stats

Queen Eleuterylida assigns Poliphilo **Logistica** (Reason) and **Thelemia**
(Desire) as companions "for the road that no one may walk alone." They argue with
each other for the whole middle of the book, and at the third gate Logistica breaks
her lute and leaves.

> **RAGIONE ⟷ VOLUNTAS.** A single axis, not two bars. Every meaningful choice
> slides you toward one pole. Neither is correct: Logistica is right that the
> flowered gate is a trap, and Poliphilo goes through it anyway, and the book is
> not sorry. High Reason opens readings, measurements and warnings; high Desire
> opens gestures, boldness and the nymphs' favour. The axis position gates
> content, it does not score you.

### The three doors are the skill tree

The book hands us a three-branch tree with the branches already named, lettered in
four scripts, and each staffed with a keeper and six attendants
(see [ARCHITECTURE.md](ARCHITECTURE.md), [HP_SOURCEBOOK.md](docs/HP_SOURCEBOOK.md) §4):

| Branch | Gate | Keeper | What it buys |
|---|---|---|---|
| **ΘΕΟΔΟΞΙΑ** *Theodoxia* | Gloria Dei | Thende, in rags on a crumbling rock | endurance, abstention, reading sacred signs, surviving what should destroy you |
| **ΕΡΩΤΟΤΡΟΦΟΣ** *Erototrophos* | Mater Amoris | Philtronia, wanton, among flowers and amber gravel | courtesy, the senses, persuasion, being *let in* |
| **ΚΟΣΜΟΔΟΞΙΑ** *Cosmodoxia* | Gloria Mundi | Euclelia, sword raised with crown and palm crossed on it | works, arms, fame, measurement, the confidence to touch things |

Poliphilo takes the middle gate. **The player need not.** And because the book
tells us in detail what lies behind each door, the two roads not taken are already
written.

### The commonplace book is the character sheet

The Hypnerotomachia *is* a commonplace book — a compendium under headings, which is
exactly how a Renaissance reader kept knowledge. So the character sheet is not a
stat block; it is Poliphilo's own notebook, and experience is **excerpta** entered
under **loci**.

Seven headings, which is not an accident — the fountain has seven columns, and Hand
B inked a metal at each angle:

| Locus | Gained by | Spends on |
|---|---|---|
| **Architectura** | measuring, pacing out, noticing an order | reading structures; knowing where a passage must be |
| **Hieroglyphica** | reading inscriptions — Latin, Greek, Hebrew, Arabic, picture-signs | the epigraphy layer; Alberti's claim that these signs outlive their languages |
| **Herbaria** | naming plants, noticing what is grafted or clipped | the gardens; telling the silk rose from the grown one |
| **Antiquitas** | fragments, ruins, provenance, tombs | the polyandrion; dating what you find |
| **Fabula** | recognising a myth in a relief or a triumph | the processions; knowing what a car is arguing |
| **Chymica** | the alchemical reading — the marginalia layer | the hermaphrodite columns, the metals, the chess ballet |
| **Amor** | courtesy, gesture, reading a nymph's mood | everything with a person in it |

Filling a locus to a threshold yields a **skill point**, spent on one of the three
branches. The notebook is legible at all times and is, deliberately, a readable
scholarly artifact in its own right: a player who finishes has assembled a genuine
commonplace book of the Hypnerotomachia.

---

## 3. The loop

```
     encounter  ──▶  choices, gated by loci and by the Ragione/Voluntas axis
         ▲                          │
         │                          ▼
    skill points ◀── loci fill ── excerpta entered in the notebook
         │
         ▼
   three branches ──▶ new choices become visible in later encounters
```

**Nothing is failable.** The book has no losing state; Poliphilo blunders through
and arrives. What varies is *how much he understood on the way* — which is precisely
what a commonplace book records. A player with low Hieroglyphica still passes the
portal; they simply pass it without knowing what it said.

That is the design's one strong opinion: **the reward for skill is comprehension,
not access.** It matches the book, and it means no player is ever locked out of the
story.

---

## 4. Encounters, and what each tests

Drawn from what is actually in the text, in book order:

| Encounter | The choice | Tests | The interesting failure |
|---|---|---|---|
| **The dark wood** | press on / rest / pray to Jupiter | axis-setting; no gates | you meet the wolf either way — "my hayre stood right vp, and I would haue cryed out, but could not" |
| **The great portal** | measure it / read the frieze / hurry through | Architectura, Hieroglyphica | hurrying past the largest thing in the book, having learned nothing from it |
| **The Medusa door** | enter the mouth and climb / decline | Theodoxia (nerve) | the summit view exists and most players will never see it |
| **The dragon** | flee / stand / feint toward the vault | Voluntas | fleeing is canonical and correct |
| **The elephant** | read the breast-strap / go inside to the tombs | Hieroglyphica, Antiquitas | *QVAERE ET INVENIES* is on the door and means it |
| **The five nymphs at the bath** | accept / demur / name each by her attribute | Amor; **Herbaria and Fabula for the naming** | naming Achoe by her harp is a real, checkable act of reading |
| **The Queen's chess ballet** | watch / play / read it as distillation | Chymica | Hand E's three-rounds reading is invisible without Chymica |
| **The three doors** | the branch choice | — | **the one irreversible decision** |
| **The triumphs** | which car to follow, and how close | Fabula | NEMO on the hindmost panel |
| **Polia's torch** | take it / let her carry it | Amor, axis | |
| **The fountain, the curtain** | strike it / refuse, as Polia refuses | Voluntas vs Ragione | refusing is *available*, and no one else in five hundred years has taken it |
| **Cythera** | the concentric survey | everything | the one place the map is given |

**On the curtain.** The book's own scene has Cupid offer the arrow to Polia, who
*will not do it*, so it passes through Philedia to Poliphilo, who does. A player who
declines is doing something the text explicitly contemplates and its protagonist
does not. That single choice justifies the whole project.

---

## 5. How it relates to the other two assets

Separate deliverable, shared spine:

| | Dream Garden | Tours | **The novel** |
|---|---|---|---|
| verb | walk | watch | **choose** |
| state | none | linear | **persistent character** |
| entry | `src/#hp` | `src/#tours` | `game/` |

**Shared, not duplicated:**

- `src/data/hp_dream.js` — the twelve-scene narration and its four voices already
  exist and are already provenance-tagged. The novel reads the same file.
- `translation/en/` — as the translation lands, the novel quotes it under the same
  rules ([TRANSLATIONDISPLAYCHOICES.md](TRANSLATIONDISPLAYCHOICES.md)): tagged by
  voice, linked to the parallel text.
- `src/systems/Cast.js` — the nymphs the v2 pass rebuilt are the novel's portraits.
- `src/data/world_links.json` — the HP↔AF cross-references become Chymica excerpta.

**The combinable move.** We have no HP woodcut images locally. But we have the
world. So the novel's stage is **pluggable**: a painted CSS backdrop by default, and
— where the player has the 3-D world loaded — the actual `HPWorldScene` rendered
live behind the text, camera parked at the station the scene belongs to. Every
improvement to the Dream Garden then improves the novel for free, which is the
answer to "if that makes sense." It does; it is the best reason to build the two
things at once.

The prototype ships with the CSS stage and a documented mount point for the 3-D one.

---

## 6. What the prototype proves

`game/index.html`, single file, no build, matching the other games:

- the Ragione/Voluntas axis, moved by real choices;
- the seven loci, filling from *excerpta* the player actually collects;
- skill points and the three-branch tree, with branch-gated options appearing;
- five playable encounters (wood, portal, elephant, nymphs, doors) with the
  irreversible door choice at the end;
- the commonplace book as a readable artifact;
- `localStorage` persistence;
- quotations tagged 1592 / 1499 / ours, as the rest of the project does.

What it does **not** yet do: the 3-D stage mount, the full twelve encounters,
Cythera, or any art beyond type and rule.

---

## 7. Open questions

Gathered for Ted; my recommendation on each is in [the questions asked at the end
of this session's transcript]. In short: whether the axis should ever *lock* content
or only colour it; whether the door choice should be replayable; whether the novel
should assume the world is installed; and how far the notebook should go toward
being a real exportable commonplace book.
