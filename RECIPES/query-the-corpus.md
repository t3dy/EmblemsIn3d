# Find what the book and the scholarship actually say

## When to use this

Before writing any description, commentary note, or code comment that makes a claim — and
before modelling anything. The corpus almost always has the answer; inventing one is the
project's cardinal sin.

## Where everything is

| What | Path |
|---|---|
| The database (27 tables) | `C:\Dev\hypnerotomachia polyphili\db\hp.db` |
| Full-text markdown of every archived PDF (37) | `C:\Dev\hypnerotomachia polyphili\md\` |
| Per-scholar folders (`profile.md` + article) | `C:\Dev\hypnerotomachia polyphili\scholars\<slug>\` |
| RAG chunks, per document | `C:\Dev\hypnerotomachia polyphili\chunks\<doc>\` |
| Original PDFs | `E:\pdf\hypnerotomachia polyphili\` |
| **Our own translation** (Italian + English, ch. XVII–XXXVIII) | `translation/source/`, `translation/en/` |
| Chapter-by-chapter summaries, all 38 | `translation/summaries.json` |

**The corpus is a separate git repo. Treat it read-only from here.**
**Read the `.md` conversions directly** — you rarely need a PDF.

## The queries that get used

```sql
-- the plates for a scene, in page order  (the book's own account — outranks interpretation)
SELECT catalog_number, page_seq, description
FROM woodcut_catalog WHERE narrative_section = 'POLYANDRION' ORDER BY page_seq;

-- the fourteen narrative sections
SELECT narrative_section, COUNT(*), MIN(page_seq), MAX(page_seq)
FROM woodcut_catalog GROUP BY narrative_section ORDER BY MIN(page_seq);

-- the book's own description of a folio
SELECT signature_ref, title, description FROM folio_descriptions WHERE description LIKE '%fountain%';

-- the alchemical layer — the ONLY licensed basis for an `alchemical` note,
-- alongside Russell's reception evidence
SELECT * FROM alchemical_symbols;
SELECT * FROM symbol_occurrences;
SELECT hand_label, signature_ref, description, russell_page_ref
FROM folio_descriptions WHERE alchemical_process IS NOT NULL;

-- the marginalia
SELECT * FROM annotations LIMIT 20;
SELECT * FROM annotator_hands;

-- the lexicon (feeds research/lexicon.html and src/data/hp_lexicon.json)
SELECT term, definition FROM dictionary_terms WHERE term LIKE '%hort%';

-- who wrote what, and whether we hold it
SELECT s.name, b.year, b.title, b.collection_filename
FROM scholars s JOIN scholar_works w ON w.scholar_id = s.id
                JOIN bibliography  b ON b.id = w.bib_id
ORDER BY s.name, b.year;
```

`collection_filename IS NULL` means **catalogued but not on disk**. Cite it as
bibliography; do not pretend to have read it. See the ⚠ entries in
[`../15scholars.md`](../15scholars.md).

## Reading our own translation

```bash
# what happens in a chapter
python -c "import json,io;d=json.load(io.open('translation/summaries.json',encoding='utf-8'));
[print(c['roman'],'-',c['summary']) for p in d['parts'] for c in p['chapters']]"

# every page carries a Notes section opening with a confidence line —
# the fastest way to find the substance of a page
grep -A6 'Confidence:' translation/en/page_233.md
```

Chapters XVII–XXXVIII are ours (CC0) and quotable. Chapters I–XVI are Dallington's 1592
English — public domain, but this edition **links** to it rather than re-setting it; quote
the plates' own inscriptions instead. **Godwin (1999) is in copyright, is not in the corpus,
and is never consulted, quoted or paraphrased.**

## Searching the scholarship

```bash
grep -ril "parterre" "C:/Dev/hypnerotomachia polyphili/md/"
grep -n -C3 "knot" "C:/Dev/hypnerotomachia polyphili/scholars/a-segre/untangling-the-knot-garden-design-in.md"
```

Start from [`../SOURCES.md`](../SOURCES.md)'s asset table to get the right name, then
[`../15scholars.md`](../15scholars.md) for what that scholar will and will not support.

## The three rules of citing

1. **Plate before scholar.** `woodcut_catalog` and `folio_descriptions` are the book
   describing itself.
2. **Reception is not meaning.** Russell documents readers who read the HP as chemical
   allegory. "Readers such as Hand B read it that way, and marked it here" is supportable;
   "the HP is an alchemical allegory" is not.
3. **Name the argument when the field is divided.** Authorship above all: the acrostic
   POLIAM FRATER FRANCISCVS COLVMNA PERAMAVIT is a fact; *which* Francesco Colonna is not
   settled (Menegazzo/Billanovich vs Calvesi vs Lefaivre's Alberti).
