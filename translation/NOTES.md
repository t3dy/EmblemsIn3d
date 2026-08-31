# Finishing the Hypnerotomachia — translation notes and method

> Begun 2026-08-31. The first English rendering of the ~59% of Colonna's 1499
> book that Robert Dallington never reached.

## Why this exists

Dallington's *Strife of Loue in a Dreame* (London, 1592) is the only
public-domain English Hypnerotomachia, and it stops dead partway through
chapter XVII — at the word *Mustulento*, facsimile page 193 of 467. Everything
after that has existed in English only under copyright. So the Dream Garden can
quote the book freely for its first half and then goes silent exactly where it
gets most spectacular: the temple rites, the ruined polyandrion, the whole of
Cythera with its circular gardens and the Fountain of Venus, the awakening, and
all of Book II in which Polia tells her own side.

This translation closes that gap.

## The four decisions (Ted, 2026-08-31)

| Question | Decision |
|---|---|
| **Scope** | The entire remainder — chapters XVII–XXXVIII, Book II, and the epitaphs. 275 pages, **90,646 words** of source. |
| **Register** | Modern but formal. Readable contemporary English that keeps the period's cadence without faking it, and which reads as visibly a *different, modern hand* from Dallington. We do not pastiche him; the seam between 1592 and now stays honest. |
| **Fidelity** | Verify suspect readings. The Wikisource transcription is unproofread (`pagequality level 1`), so where it looks corrupt we check the 1499 facsimile and the 1545 Aldine reprint before translating, rather than silently rendering a scanner error. |
| **Deliverable** | Selected passages become Dream mode quotations; the whole thing also becomes a parallel-text page under `research/`, Italian beside English, so any reader can check the work. |

## Rights

- **Source text**: the 1499 Aldine, public domain worldwide. The Wikisource
  transcription is a faithful reproduction of a public-domain work and carries
  no new copyright of its own. Index confirms the scan is the 1499 (Aldo
  Manuzio, Venezia, 1499), sourced from the MIT Press facsimile — *not* a
  modern critical edition, so no editor's rights are implicated.
- **Our translation**: a new work. Ted owns it and may license it however he
  likes, CC0 included.
- **Godwin (1999)** is in copyright. It is not consulted, quoted, or
  paraphrased at any point. Every English sentence here is made from the
  Italian in `translation/source/`.

## Method

1. `python scripts/fetch_hp_source.py` pulls the range and maintains
   `translation/manifest.json`. Safe to re-run; `--status` reports progress.
2. Translate one facsimile page at a time into `translation/en/page_NNN.md`,
   keeping the page boundary so the parallel-text page can align them.
3. Mark every doubtful reading inline as `[?word]` and explain it in the page's
   `Notes` section. Never guess silently.
4. Set the page's manifest status to `drafted`, then `verified` once its
   suspect readings have been checked against the facsimile.

**Recovery after any interruption is "read the manifest," never "re-derive
where we left off."**

## Register, concretely

The 1499 is deliberately the hardest prose in Italian: a macaronic hybrid that
invents Latinate vocabulary wholesale (*mordicula*, *lachrymule*, *repululescere*)
and buries its clauses. Two failure modes to avoid:

- **Flattening.** Translating *voluptico oblectamento* as "nice feeling" throws
  away the book. Keep the Latinity where English can carry it — "voluptuous
  delight" — and keep the long periods long.
- **Fake antiquity.** Writing "thou wert" and "hath" makes us a bad imitation
  of Dallington. Our English is modern; its formality comes from vocabulary and
  sentence shape, not from archaic morphology.

The test: a reader should be able to tell instantly which passages are 1592 and
which are ours, without being told.

### Recurring vocabulary

Colonna coins compulsively. Consistent choices so far:

| Italian | English | Note |
|---|---|---|
| *dolcecia* | sweetness | |
| *dilecto / delectamento* | delight | |
| *oblectamento* | delight, gratification | keep distinct from *dilecto* where both appear |
| *ochii / ocelli* | eyes / little eyes | the diminutive is affectionate, keep it |
| *cum* | with | Latin form of *con* throughout |
| *sencia* | without | |
| *diva* | divine, or "the goddess" | |
| *Nympha* | nymph | capitalised in source; lower-case in ours except as a title |
| *somno / somnio* | sleep / dream | the book puns on these; preserve the pair |

## Campaign map

| Chapter | Pages | Words | |
|---|---:|---:|---|
| XVII | 32 | 9,398 | Dallington stops on p.193, inside this chapter |
| XVIII | 17 | 5,732 | |
| XIX | 41 | 11,115 | longest chapter in the range |
| XX | 7 | 2,589 | |
| XXI | 36 | 12,389 | |
| XXII | 32 | 9,943 | |
| XXIII | 11 | 4,057 | |
| XXIV | 12 | 2,835 | the polyandrion |
| XXV–XXIX | 47 | 17,665 | Cythera, the Fountain of Venus |
| XXX–XXXVIII | 38 | 13,435 | **Book II — Polia's own narration** |
| Epitaphium Poliae | 1 | 80 | |
| Errori | 1 | 1,408 | the 1499 errata leaf; not narrative |

Total in range: **90,646 words**.

## Order of work

Out of order deliberately, so the Dream Garden gets its missing scenes early:

1. **XXXVIII + Epitaphium Poliae** — the awakening and Polia's epitaph. One
   page each, and they complete the story mode's final stop. ✔ drafted
2. **XXV–XXIX** — Cythera and the Fountain of Venus, the stops that currently
   have no English at all.
3. **XVII onward, in order** — the long grind, chapter by chapter.
4. **Book II last** — self-contained, and nothing in the world depends on it yet.
