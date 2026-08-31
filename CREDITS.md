# Credits and third-party material

Per LICENSECHOICES.md item 4: catalogued, not relicensed.

## Source texts

| Work | Status |
|---|---|
| Francesco Colonna, *Hypnerotomachia Poliphili*, Venice: Aldus Manutius, 1499 | Public domain by age. Italian text after the transcription at [it.wikisource.org](https://it.wikisource.org/wiki/Hypnerotomachia_Poliphili), made from the MIT Press facsimile. |
| Robert Dallington (as "R. D."), *Hypnerotomachia: The Strife of Loue in a Dreame*, London: Simon Waterson, 1592 | Public domain. Text from [Project Gutenberg #18459](https://www.gutenberg.org/ebooks/18459); also in EEBO/TCP under CC0. |
| Michael Maier, *Atalanta Fugiens*, Frankfurt 1617 — plates, mottoes, epigrams | Public domain by age. |
| The 172 woodcuts of the 1499 Aldine | Public domain by age. |

**Joscelyn Godwin's 1999 translation (Thames & Hudson) is in copyright. It has
not been consulted, quoted, or paraphrased anywhere in this project.** Every
English sentence of ours after Dallington's stopping point was made from the
Italian in `translation/source/`.

## Code

| Library | Licence | Note |
|---|---|---|
| [Three.js](https://threejs.org) r168 | MIT | loaded from jsDelivr via importmap |
| [Tone.js](https://tonejs.github.io) 14.7.77 | MIT | lazy-loaded from esm.sh on first gesture |
| [GSAP](https://gsap.com) 3.12.5 | **its own licence, not MIT** | ⚠️ **Verify current terms before any commercial use.** GSAP's licensing has changed in recent years and this project has not confirmed which terms apply to this version. Do not assume MIT-equivalent freedom. |
| [Three.js Awesome Graphics Agent Skills](https://github.com/scottstts/Threejs-Awesome-Graphics-Agent-Skills) | see repository | patterns studied and adapted, notably the stylized-meadow-grass approach behind `src/systems/Meadow.js`; no code copied verbatim |

## Images

The artworks reproduced on `research/nymphs.html` are public domain by age, but
**the photographs of them are not always**. Each is credited in place on that
page. One carries a live condition:

- *Nymph with a Vase*, Fontaine des Innocents, Jean Goujon, 1549 — sculpture
  public domain; **photograph © Jamie Mulherron, CC BY-SA 4.0, attribution
  required**.

That credit must survive any redesign of the page, and the page must not be
relicensed in a way that contradicts it. If the sourcebook is ever wanted under
one clean licence, this is the image to replace.

All other images on that page are served from Wikimedia Commons and credited to
their holding institutions in the captions.

## Data

`data/*.json` is exported by `export_for_3d.py` from two SQLite databases that
live outside this repository (`atalanta.db`, `hp.db`). The exported files are
committed; the databases are not.
