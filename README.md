# The Dream Garden of Poliphilo

**The *Hypnerotomachia Poliphili* (Venice, Aldus Manutius, 1499) as a walkable 3-D world,
a guided tour of the whole book, and a complete new English translation of everything the
1592 English never reached.**

**Live:** **[emblems-in-3d.vercel.app](https://emblems-in-3d.vercel.app)** (canonical)
· [t3dy.github.io/EmblemsIn3d](https://t3dy.github.io/EmblemsIn3d) (GitHub Pages mirror)
· **[Repository](https://github.com/t3dy/EmblemsIn3d)**

> **Contributing, or working on this with an AI agent? Start at [`ROUTER.md`](ROUTER.md).**
> It is the entry point to ~45 documents: five hard rules, a task→documents table, the code
> map, and a procedure in [`RECIPES/`](RECIPES/) for every task this project repeats.

---

## What it is

Francesco Colonna's *Hypnerotomachia Poliphili* — "Poliphilo's strife of love in a dream"
— is the strangest book of the Italian Renaissance: a man dreams that he walks through
classical antiquity looking for the woman he loves, and describes every building, garden,
statue, procession and inscription he passes, in exhaustive and technically competent
detail, in a private language mixing Italian, Latin, Greek, Hebrew and Arabic. Aldus
Manutius printed it in 1499 with 168 woodcuts. It has been called the most beautiful book
ever printed, and almost nobody finishes it.

This project does three things with it.

1. **Builds it.** Fifteen stations — the dark wood, the great portal, the queen's court,
   the three doors, the elephant and obelisk, the planetary palace, the Quinta Essentia,
   the fountain of Venus, the crossing to Cythera, Polia's garden, the triumphs, the
   Polyandrion, the gardens and theatre of Cythera, and the Queen's **human chess match** —
   as one continuous ground you walk, with the geometry sourced from the plates rather than
   imagined. Where there is no plate, as with the chess ballet, it is built from the text
   and from what the book's early readers wrote in the margins beside it.
2. **Reads it.** A 36-stop guided tour covering **all thirty-eight chapters and both
   parts**, from the dark wood to Polia's epitaph, with 239 typed commentary notes under
   nine colour-coded lenses the reader switches on and off. Every interpretive claim traces
   to a named scholar or to the annotators' own evidence.
3. **Finishes it.** Robert Dallington's *Strife of Loue in a Dreame* (London, 1592) is the
   only public-domain English the book has ever had, and it breaks off mid-sentence in
   chapter XVII. This project translated the remaining **275 facsimile pages** — chapters
   XVII–XXXVIII, the whole of Book II, and the closing matter — from the Italian of the
   1499 Aldine, and publishes it as a parallel text, CC0.

### Versions

| | Release | Where | What it is |
|---|---|---|---|
| **v3** | current | [`/`](https://emblems-in-3d.vercel.app) | The *Hypnerotomachia* alone: the whole-book tour, the Graphics menu, commentary that meets you as you walk, a dream loop that cannot hang, and a silent site. |
| **v2** | archived | [`/v2/`](https://emblems-in-3d.vercel.app/v2/) | The tour with its commentary lenses, the Gallery, Poliphilo's Dream as a game, mobile controls, and the first imported model. Also carried the *Atalanta Fugiens* worlds. |
| **v1** | archived | [`/v1/`](https://emblems-in-3d.vercel.app/v1/) | The original release: the emblem worlds, the games, and the first walkable Dream Garden. |

**On 2026-09-05 the *Atalanta Fugiens* side was removed from the site** — its worlds, its
four tours, its games and its cross-reference graph — so that everything here is the
*Hypnerotomachia*. Those releases are archived above, not maintained. See
[`DECISIONS.md`](DECISIONS.md). The repository and both URLs keep their existing names so
no link breaks; only the displayed title changed.

Both hosts serve the same `main` branch. See [`DEPLOY_STATE.md`](DEPLOY_STATE.md) before
touching deploy configuration — publishing to one host does **not** publish to the other.

---

## The three ways in

| Mode | What it is |
|---|---|
| **Walk Freely** | The whole world at your own pace. W A S D / arrows to walk, Shift to run, drag to look, digits to jump between stations. As you approach a wonder its commentary rises to meet you, filtered by the same lenses the tour uses. Named figures — the wolf, the Queen, the five sense-nymphs, Polia — keep their places. |
| **Poliphilo's Dream** | The plot in twelve scenes, narrated from the 1499 text, with a reaction-choice at each wonder — wonder, desire, melancholy or dread — that the scene answers in light. No commentary; this one is the game. The loop is hardened so it cannot hang: a travel watchdog, a direct arrival path, and a fallback for every missing beat. |
| **The Novel** | The guided tour: 36 stops across all 38 chapters, the 1499 woodcut at each stop that has one, and a deep link into the parallel edition at every chapter. Chapters I–XVI point to Dallington's 1592 English; chapter XVII onward is this project's own translation. |

### The nine commentary lenses

`From the book` · `Renaissance context` · `Architectural theory` ·
`Neoplatonic aesthetics` · `Mythological allusion` · `Allegory & symbolism` ·
`Literary art` · `A difficult word` · `Alchemical reading`

Each is independently toggled and the choice is sticky. They apply in the tour *and* in
free walk, so there is one body of commentary rather than two.

---

## The research pages

| Page | What it is |
|---|---|
| [`research/translation.html`](research/translation.html) | The parallel edition: Italian beside English, page by page, with a confidence line and a list of doubtful readings in the notes of every page, so a reader can check the work. |
| [`research/lexicon.html`](research/lexicon.html) | 101 of the book's own nouns — architecture, gardens, the parts of the soul that answer to beauty — grouped by topic and defined from the research database. |
| [`research/nymphs.html`](research/nymphs.html) | The figure sourcebook: what the nymphs, Polia and the other figures look like, and which Renaissance painting each modelling decision answers to. |
| [`game/index.html`](game/index.html) | *Poliphilo's Commonplace Book* — a visual novel assembled from the book's own materials. |

`HPTranslation.txt` at the repository root is the whole translation as a single plain-text
file.

---

## The translation

- **Scope:** the entire remainder Dallington never reached — chapters XVII–XXXVIII, Book II,
  and the epitaphs. 275 facsimile pages, ~90,000 words of source.
- **Register:** modern but formal. Readable contemporary English that keeps the period's
  cadence without faking it, and reads as a visibly *different, modern hand* from
  Dallington. The seam between 1592 and now stays honest.
- **Fidelity:** the Wikisource transcription of the 1499 is unproofread, so suspect readings
  are checked against the facsimile and the 1545 Aldine before translating, marked inline as
  `[?word]`, and explained in that page's notes. Every page opens its notes with a
  confidence line.
- **Rights:** the 1499 Aldine is public domain worldwide; the translation is a new work,
  released CC0. **Joscelyn Godwin's 1999 translation is in copyright, is not in the research
  corpus, and was never consulted, quoted or paraphrased.**

Method and decisions: [`translation/NOTES.md`](translation/NOTES.md).
Progress by page: [`translation/manifest.json`](translation/manifest.json).

---

## The scholarship

A research corpus of 37 full-text articles and monographs, 30 per-scholar folders and a
27-table SQLite database sits alongside this repository (read-only from here).

- [`SOURCES.md`](SOURCES.md) — the map, including a **"Modelling the 3-D assets"** table
  pairing each object in the world with the scholar to read before building it.
- [`15scholars.md`](15scholars.md) — the working fifteen by asset class, plus the
  historiographic frame: for each, what they settle, where their text is on disk, and
  **the claim their work will not support**.

The governing rule is **cite, don't invent**. An interpretive claim — in a tour stop, in a
commentary note, or in a code comment justifying the shape of a fountain — must trace to a
named scholar or to the annotators' evidence in the database. Where the sources do not
settle a detail, the comment says so and the geometry stays modest.

One distinction matters more than any other here: **reception is not meaning.** James
Russell's census of annotated copies shows early-modern readers interpreting the HP as
chemical allegory. "Readers such as the British Library's Hand B read it that way, and
marked it here" is supportable. "The HP *is* an alchemical allegory" is not, and no note in
this project says it.

---

## Tech

No build step, no bundler, no `npm install`. ES modules served as static files, Three.js
r168 from a CDN via importmap. The source in this repository is the source the browser runs.

```
index.html              the landing page
src/index.html          the app shell — ALL the CSS is inline here, and it is NOT cache-busted
src/main.js             UI, the tour, the three modes, data loading, the Graphics menu
src/scenes/
  HPWorldScene.js       the world — every station, every model
src/systems/
  Cast.js               figures, animals, props, labels
  AssetVariants.js      the swappable-variant registry
  Walker.js             free-walk movement and collision
  DreamMode.js          the narrative game loop
  EnvMap.js             the one shared PMREM environment
  Particles.js  Meadow.js  AlchemicalAudio.js (a deliberate no-op stub)
src/shaders/HPStyles.js the four aesthetic registers
src/data/               tours.json, gallery.json, the hp_* exports
research/  translation/  game/  scripts/
```

### Two facts about this layout that cause bugs

1. **All the CSS is inline in `src/index.html`, which no `?v=` covers.** A returning
   visitor can receive new JavaScript with old CSS. `vercel.json` forces HTML to
   revalidate; **GitHub Pages ignores that** and serves HTML with a fixed `max-age=600`.
   So: never fix a layout bug in CSS alone if the JS can enforce it too.
2. **A different `?v=` is a different module to the browser.** Importing a file as `?v=1`
   from one place and `?v=2` from another gives two module instances with separate state.
   Bump the whole chain or none of it. → [`RECIPES/bump-cache-versions.md`](RECIPES/bump-cache-versions.md)

### Graphics variants

No asset has a single hard-coded implementation. Trees, the elephant, the figures, the
statues, the water and the ornament each carry a registry of named variants — from the
founding primitives through painted panels to an imported CC0 marble scan — swappable at
runtime from the **Graphics** menu, reachable in every mode. The woodcut render style
prefers the simpler variants, because a photogrammetric scan does not read in flat ink.

### Sound

There is none, deliberately: no music and no ambient bed anywhere. No `AudioContext` is
ever constructed, so the page cannot make a sound. `AlchemicalAudio.js` is a no-op stub.
See `DECISIONS.md` before adding any.

---

## Running locally

```bash
git clone https://github.com/t3dy/EmblemsIn3d.git
cd EmblemsIn3d
python -m http.server 8000
```

Then open <http://localhost:8000>.

The data pipeline (`scripts/export_for_3d.py`) reads from
`C:\Dev\hypnerotomachia polyphili\db\hp.db`, which lives outside this repository. The
exported JSON is committed, so the pipeline only needs re-running if that database changes.

---

## Deploying

**Both hosts, every time.** `vercel --prod` does not push to GitHub; `git push` does not
deploy to Vercel.

```bash
vercel --prod --yes && git push origin main
```

Then verify, on both:

```bash
curl -s https://emblems-in-3d.vercel.app/src/index.html | grep -o 'main.js?v=[0-9]*'
```

Full procedure: [`RECIPES/ship-a-release.md`](RECIPES/ship-a-release.md). Host details and
the cache trap: [`DEPLOY_STATE.md`](DEPLOY_STATE.md).

---

## The source text

**Francesco Colonna, *Hypnerotomachia Poliphili*, Venice: Aldus Manutius, December 1499.**
A dream narrative in two books, illustrated with 168 woodcuts, famous for its typography
(Francesco Griffo's roman, the foundation of modern roman type), its hybrid language, and
its exhaustive description of classical architecture and garden design — the paper source
for a century of real Italian gardens.

The initial letters of its chapters spell **POLIAM FRATER FRANCISCVS COLVMNA PERAMAVIT**,
"Brother Francesco Colonna loved Polia greatly." Which Francesco Colonna that was — the
Venetian Dominican of Menegazzo and Billanovich, the Roman lord of Palestrina of Calvesi,
or Lefaivre's Alberti — is not settled, and this project never writes as though it were.

The British Library copy carries Renaissance annotations in several hands, including a
Hand B with systematic alchemical readings. Those annotations are the evidence base for
this project's alchemical commentary lens.

---

**Licence:** the 1499 text and its woodcuts are public domain. The translation, the code,
and the commentary in this repository are released CC0. Every imported asset's provenance
and licence is recorded in [`CREDITS.md`](CREDITS.md) and
[`IMPORTEXEMPLARS.md`](IMPORTEXEMPLARS.md).
