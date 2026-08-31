# How the translation is displayed

> Decided 2026-08-31, as the project acquired a third voice. Until now the Dream
> Garden had two kinds of text on screen: our prose summary, and quotation. That
> binary no longer holds.

## The problem: three provenances, one panel

There are now three distinct kinds of quoted matter, and they carry very
different authority:

| Voice | Age | Status | Example |
|---|---|---|---|
| **1592** | Elizabethan | a real historical translation, public domain | *"my hayre stood right vp, and I would haue cryed out, but could not"* |
| **1499** | the book itself | the original's own Latin and Greek | FESTINA LENTE · ΕΡΩΤΟΤΡΟΦΟΣ |
| **ours** | 2026 | a new translation, unreviewed | *"So unlooked-for a delight snatched away…"* |

All three currently render identically — gold italic behind a gold rule — and
are distinguished only by a small attribution line. That is not enough. A
visitor skimming will read our 2026 prose as though it carried the same
authority as Dallington's, which is a scholarly misrepresentation even though
every individual line is accurate.

**The governing principle: a reader should never have to work out which voice
they are hearing.** It should be visible before they read a word.

## Decisions

### 1. Provenance tags, not just attributions

Every quotation gets a small tag above it naming its voice: **1592 · DALLINGTON**,
**1499 · THE BOOK ITSELF**, or **TRANSLATED FOR THIS PROJECT**. The tag is the
first thing in the block, in small caps, before the quote is read rather than
after.

### 2. Each voice gets its own colour

- **1592** keeps the existing gold rule and gold italic. It is the established
  voice of the piece.
- **1499** gets a warmer, paler rule — this is epigraphy, and the inscriptions
  already render as centred lineated text rather than prose.
- **Ours** gets a distinctly *cooler* rule and a slightly lighter type colour.
  Cool against the world's warm palette reads as "modern intrusion," which is
  exactly right.

### 3. Our translation always offers its source

Any block tagged *translated for this project* carries a link to the parallel
text at that page — `research/translation.html#p465` — so the Italian it was
made from is one click away. Dallington and the 1499 inscriptions do not need
this; ours does, because ours is the only one a reader has any reason to doubt.

### 4. Draft status is shown, not hidden

A page still carrying uncertain readings is `drafted`, not `verified`, and the
parallel text says so on its badge. If a *quoted* passage comes from a drafted
page, the in-world tag reads **TRANSLATED FOR THIS PROJECT · DRAFT**. We do not
quietly promote unfinished work by omitting the qualifier.

### 5. Uncertain readings are visible in the English

`[?word]` survives into the rendered page as a marked span with a tooltip, in a
warm off-palette colour. It is tempting to hide these behind a "show editorial
marks" toggle; we are not going to, because the honest signal is worth more than
the tidier page. A translation that shows its seams is more trustworthy than one
that doesn't.

### 6. Page-level alignment, kept forever

The parallel text aligns on the *facsimile page*, not the chapter or paragraph.
Coarser alignment would read better; page alignment is what makes a claim
checkable against a specific leaf of a specific scan, and checkability is the
entire point of the page.

### 7. What the in-world panel does **not** do

- **No Italian in the 3-D world.** The garden is not a reading room. The Italian
  lives on the research page; the world shows English and links out.
- **No footnote apparatus in the panel.** Editorial notes belong to the parallel
  text. In-world we get one quotation and one attribution, and that is all.
- **No quotation longer than about sixty words on screen.** Beyond that the panel
  stops being a caption and becomes homework. Long passages get excerpted, with
  the full text on the research page.

### 8. Progress is reported honestly on the research page

The page shows a real completion bar and lists untranslated pages compactly as
chips linking to Wikisource, rather than hiding what is not done. A working
edition that admits it is 0.4% finished is more credible than one that presents
two pages as though they were an edition.

## What this rules out later

If the translation is ever finished, the temptation will be to drop the tags and
let everything read as one continuous text — the way a printed edition would.
**Resist it.** The seam between a 1592 translator and a 2026 one is a fact about
this artifact, and the project's whole claim to seriousness is that it does not
paper over facts like that.
