# Licence choices

> Decided 2026-08-31. This project mixes four kinds of material with four
> different rights positions, and until now none of them was stated anywhere.
> That is a liability the moment anyone academic looks at it, and a barrier to
> the translation being useful to the people most likely to want it.

## The shape of the problem

| Layer | Example | Who made it |
|---|---|---|
| Fifteenth- and sixteenth-century sources | the 1499 Italian, the 1592 Dallington, the AF plates | long dead, public domain |
| Third-party code | Three.js, GSAP, Tone.js | others, various licences |
| Third-party images | the Commons photographs on the nymph sourcebook | others, some with conditions |
| Our own work | the engine, the worlds, the editorial commentary, **the translation** | this project |

The mistake would be a single blanket licence across all four. Each wants a
different answer.

## Decisions

### 1. The translation → **CC0 1.0** (public domain dedication)

The new English of chapters XVII–XXXVIII goes into the public domain, with a
request (not a condition) that people cite it.

**Why CC0 rather than CC BY.** This translation's whole reason to exist is that
there is no freely reusable English for this material — Dallington stops at page
193 and everything after is under copyright. If our version carries even an
attribution condition, it cannot be absorbed into Wikisource, folded into a
future critical edition, or quoted without bookkeeping by exactly the scholars
who need it most. CC0 removes every obstacle. Attribution will happen anyway
through ordinary scholarly norms, and a stated request costs nothing; a licence
*condition* costs reuse.

**The trade we are accepting**: someone could publish our translation without
credit, or sell it. That is a real cost, and it is smaller than the cost of the
text being unusable in the places it belongs.

This applies to `translation/en/**`, the English in `research/translation.html`,
and any of it quoted inside the app.

### 2. The code → **MIT**

`src/`, `scripts/`, the games. Permissive, universally understood, and
consistent with the Three.js ecosystem this is built on. Nothing here is a
competitive asset; the value is in the scholarship and the design, not the
particular way a lathe profile is displaced into folds.

### 3. Everything else we authored → **CC BY 4.0**

The world designs, the scene compositions, the editorial commentary in
`world_links.json`, the Dream mode prose summaries, the sourcebooks under
`docs/` and `research/`, the improvement notes.

**Why BY here but CC0 for the translation.** Different jobs. The translation
wants maximum absorption into other people's editions. The commentary and design
are interpretive work whose value partly *is* their attribution — a claim about
these two books, made by this project, and worth being traceable to it. CC BY
keeps them freely reusable while keeping the argument attached to its author.

### 4. Third-party material → catalogued, not relicensed

Obviously, but it needs writing down because one item has a live condition:

- **Three.js** — MIT.
- **Tone.js** — MIT.
- **GSAP** — its own licence, not MIT. **Action: verify the current terms before
  any commercial use or before publishing a licence file that implies
  otherwise.** GSAP's terms have changed in recent years and I am not going to
  assert a version of them from memory.
- **The Atalanta Fugiens plates and Hypnerotomachia woodcuts** — public domain by
  age.
- **The nymph sourcebook images** — public domain artworks, but not all the
  *photographs* are. `research/nymphs.html` already carries one credited
  "photo © Jamie Mulherron, CC BY-SA 4.0 (attribution required)". That
  attribution must survive any redesign of the page, and the page must not be
  relicensed in a way that contradicts it. If we ever want the sourcebook under a
  single clean licence, that one image is the thing to replace.

### 5. What we will not do

- **No blanket "all rights reserved."** It would make the translation pointless.
- **No CC BY-NC anywhere.** Non-commercial clauses look protective and mostly
  just block libraries, Wikipedia, and print-on-demand scholarly reuse, which is
  precisely our audience.
- **No CC BY-SA on the translation.** Share-alike would force any edition that
  incorporates it to adopt our licence, which is the same absorption problem as
  attribution, only worse.

## Implementation

1. `LICENSE` at the repo root — MIT, covering the code, with a pointer to this
   file for everything else.
2. `translation/LICENSE` — the CC0 dedication, so the translation's status is
   unambiguous at the directory that holds it.
3. A short rights line in the footer of `research/translation.html` and on the
   landing page.
4. A `CREDITS.md` collecting the third-party catalogue above, including the GSAP
   item flagged for verification.

## Open question deliberately left open

**Whether Ted wants his name on the translation.** CC0 waives rights; it does not
require anonymity, and the "please cite" line needs to say *what* to cite. Left
blank until he says.
