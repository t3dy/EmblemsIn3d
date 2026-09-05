# Add or edit a tour stop

## When to use this

Adding a stop to the Novel tour, rewriting a lede, or adding a commentary note anywhere in
`src/data/tours.json`.

## Before you start

- [`../SOURCES.md`](../SOURCES.md) — which scholar governs this material.
- [`../15scholars.md`](../15scholars.md) — what that scholar will and will not support.
- The chapter's own summary in `translation/summaries.json` (all 38 chapters, plus the
  closing matter).

**The Novel tour covers all 38 chapters as of 2026-09-05** (34 stops; several cover a pair).
If you are adding, you are refining coverage, not filling a gap — check first.

## The stop schema

```jsonc
{
  "station":  "cythera_theatre",     // MUST be a key in HP_STATIONS (see below)
  "title":    "The Fountain of Venus", // optional; overrides the station's own name
  "chapter":  "XXIII",               // roman numeral, or "XXII–XXIII" with an EN DASH
  "half":     "ours",                // "ours" = our translation (ch. XVII+); else "dallington"
  "lede":     "…",                   // 2–5 sentences. *italics* and **bold** render.
  "quote":    "…",                   // optional
  "quoteAttr":"ch. XXIII, folio 361 — our translation",
  "wc":       [ { "file": "woodcuts/x.jpg", "caption": "…" } ],  // optional; [] = show none
  "notes":    [ { "type": "myth", "text": "…" } ]
}
```

The nine note types, which are the colour-coded commentary lenses the reader toggles:

`quotation` · `context` · `architecture` · `neoplatonic` · `myth` · `allegory` ·
`literary` · `gloss` · `alchemical`

The thirteen valid `station` keys:

```bash
grep -o "key: '[a-z_]*', *name: '[^']*'" src/scenes/HPWorldScene.js
```

`wood · portal · court · three_doors · elephant · planetary_palace · quinta_essentia ·
fountain · cythera · triumphs · polyandrion · cythera_isle · cythera_theatre`

Book II has no geography of its own here. Stage its stops at the station of the dream whose
meaning they answer — and **say so in a note**, as the existing Book II stops do.

## Steps

1. **Read the chapter.** `translation/summaries.json` for the shape;
   `translation/en/page_NNN.md` for the words. Chapters XVII–XXXVIII are our own CC0
   translation and may be quoted freely. **Godwin (1999) is in copyright and is not in the
   corpus — never quote or paraphrase it.**
2. **Find the plates.** They are the book's own account of the scene and outrank any
   interpretation:
   ```sql
   SELECT catalog_number, page_seq, description
   FROM woodcut_catalog WHERE narrative_section = 'VENUS_TEMPLE'
   ORDER BY page_seq;
   ```
   Several descriptions carry mottoes verbatim (`PATIENTIA`, `Velocitatem sedendo`,
   `Medium tenuere beati`, `Quis evadet? / Nemo`) — those are safe quotes for the
   Dallington half, where we do not re-set Dallington's English.
3. **Write the lede.** What happens, concretely, in this scene. Not what it means — the
   notes do meaning.
4. **Write the notes**, one per lens that genuinely applies. Six to eight is the house
   length. Each note is one idea. Route each to its scholar:
   - `architecture` → Lefaivre; gardens → Hunt, Segre
   - `myth` / statuary → Nygren · hieroglyphs → Curran, Priki
   - Polia and the figures → Stewering · epitaphs → Griggs, Bury
   - `neoplatonic` → **Ficino's ladder of love generally** (Poncet is *Primavera*
     background, **not** an HP source)
   - `alchemical` → **Russell + `hp.db.alchemical_symbols`, always phrased as what those
     readers found, never as what the book means**
   - Dallington and the seam → Semler, Ure
5. **Attach the woodcut.** `wc: []` suppresses the button; omitting `wc` inherits the
   station's set from `tour.woodcuts`. **Filenames in `images/woodcuts/` are unreliable —
   open the image and go by what you see**, then write a caption that matches. See the
   re-identification table at the end of `SOURCES.md`.
6. **Edit `src/data/tours.json`** — via a script, not by hand; it is one long file and hand
   edits break the ordering.
7. **Bump the data version:** `const V` in `src/main.js` `loadData()` (~line 108).
   Data files are versioned by that one constant, not by the module chain.
8. **Validate**, then live-verify.

## Validating

```bash
python "<scratchpad>/check_tour.py"
```

That script (write it again if it has been cleaned up) asserts: every `station` exists in
`HP_STATIONS`; every note `type` exists in `NOTE_TYPES` in `main.js`; every `wc` file exists
on disk; every `half: "ours"` chapter resolves to an `id="ch-…"` anchor in
`research/translation.html`; no stop lacks a lede or notes; all 38 chapters are covered; the
other four tours survived the edit.

Then step the tour in the browser and read back every stop — see
[verify-live.md](verify-live.md):

```js
window.hpTour('novel');
// click "Check all" then "Begin the tour", then:
for (let i = 0; i < 34; i++) { /* capture .tp-badge/.tp-title/.tp-quote */ window.tourNext(); }
```

## You are done when

- [ ] the validator passes
- [ ] every new stop rendered in the browser with its badge, lede, quote and notes
- [ ] no element in `#tour-panel` reports `scrollWidth > clientWidth` (that is the
      text-clipping bug)
- [ ] the "Read this chapter in the parallel edition →" link scrolls to the right chapter
- [ ] `const V` bumped, and the site redeployed to **both** hosts

## What has gone wrong here before

- **Fabricated readings.** A note that asserts "the HP is an alchemical allegory" is false.
  Russell documents *readers*. Phrase it as reception, always.
- **Factual errors in the procession**, twice, both caught only by going back to
  `woodcut_catalog`: Danaë's car is drawn by **unicorns**, not horses (#57), and the fourth
  triumph is the **Festival of Bacchus** (#64–65), not a "Triumph of Semele" — Semele
  appears in that car's *reliefs* (#58). The lesson: check the plate before writing the label.
- **Text clipped mid-word.** Both `Cast.js label()` and `_plaqueTexture()` used fixed-width
  canvases; long titles were cut ("riumph of Europ"). Both now measure the text first. If
  you add a long `title`, check it on the plaque in-world as well as in the panel.
- **Wrong woodcut at a stop**, because the filename lied. Three files were re-identified on
  2026-09-05 (`three_doors.jpg`, `temple_venus.jpg`, `awakening.jpg`) and now sit at their
  true chapters. Go by the image, not the name.
