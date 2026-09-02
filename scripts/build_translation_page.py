#!/usr/bin/env python3
"""Generate research/translation.html — the 1499 Italian beside our English.

The point of the page is checkability: every English paragraph sits next to the
Italian it was made from, with the facsimile page number, so a reader can audit
any sentence without taking our word for it. Pages not yet translated are listed
as such rather than hidden, so the page is an honest progress report too.

    python scripts/build_translation_page.py
"""

import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "translation" / "source"
EN = ROOT / "translation" / "en"
MANIFEST = ROOT / "translation" / "manifest.json"
OUT = ROOT / "research" / "translation.html"

READING_ORDER = [
    "XVII", "XVIII", "XIX", "XX", "XXI", "XXII", "XXIII", "XXIV", "XXV",
    "XXVI", "XXVII", "XXVIII", "XXIX", "XXX", "XXXI", "XXXII", "XXXIII",
    "XXXIV", "XXXV", "XXXVI", "XXXVII", "XXXVIII", "Epitaphium Poliae", "Errori",
]

CHAPTER_BLURB = {
    "XVII": "Where Dallington stops, mid-sentence, at the word <em>Mustulento</em>.",
    "XXIV": "The polyandrion — the ruined temple and its tombs.",
    "XXV": "Cythera: the circular island, ring within ring.",
    "XXVIII": "The amphitheatre and the Fountain of Venus.",
    "XXX": "Book II begins. Polia tells her own side.",
    "XXXVIII": "The awakening.",
    "Epitaphium Poliae": "Polia's epitaph, and the one in which Poliphilo speaks.",
    "Errori": "The 1499 errata leaf. Not narrative.",
}


def md_to_html(text: str) -> tuple[str, str]:
    """Split a translated page into (body_html, notes_html)."""
    parts = re.split(r"\n---\n", text, maxsplit=1)
    body, notes = parts[0], (parts[1] if len(parts) > 1 else "")
    body = re.sub(r"^#.*$", "", body, flags=re.M)          # drop the page heading
    notes = re.sub(r"^##\s*Notes\s*$", "", notes, flags=re.M)

    def inline(s):
        s = html.escape(s)
        s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
        s = re.sub(r"\*(.+?)\*", r"<em>\1</em>", s)
        s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
        s = re.sub(r"\[\?([^\]]*)\]", r'<span class="unsure" title="uncertain reading — awaiting the facsimile">[?\1]</span>', s)
        return s

    def block(chunk):
        out = []
        for para in re.split(r"\n\s*\n", chunk.strip()):
            para = para.strip()
            if not para:
                continue
            if para.startswith("## "):
                out.append(f"<h4>{inline(para[3:])}</h4>")
            elif all(l.lstrip().startswith(">") for l in para.splitlines()):
                q = "<br>".join(inline(l.lstrip()[1:].strip()) for l in para.splitlines())
                out.append(f"<blockquote>{q}</blockquote>")
            elif para.lstrip().startswith("- "):
                items = "".join(f"<li>{inline(l.lstrip()[2:])}</li>"
                                for l in para.splitlines() if l.lstrip().startswith("- "))
                out.append(f"<ul>{items}</ul>")
            else:
                # collapse the paragraph's internal line breaks first, so
                # emphasis spanning a wrapped line still matches
                out.append(f"<p>{inline(' '.join(para.split()))}</p>")
        return "\n".join(out)

    return block(body), block(notes)


def italian_html(text: str) -> str:
    paras = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    out = []
    for p in paras:
        esc = html.escape(p)
        # the running chapter arguments are set in full capitals in the original
        if len(p) > 24 and p == p.upper():
            out.append(f'<p class="argument">{esc}</p>')
        else:
            out.append(f"<p>{esc}</p>")
    return "\n".join(out)


def main():
    man = json.loads(MANIFEST.read_text(encoding="utf-8"))
    pages = man["pages"]
    total = len(pages)
    done = sum(1 for r in pages.values() if r["status"] in ("drafted", "verified"))
    src_words = sum(r.get("words", 0) for r in pages.values())
    done_words = sum(r.get("words", 0) for r in pages.values()
                     if r["status"] in ("drafted", "verified"))

    by_ch = {}
    for p, rec in pages.items():
        by_ch.setdefault(rec["chapter"], []).append(int(p))

    sections = []
    toc = []
    for chap in READING_ORDER:
        if chap not in by_ch:
            continue
        nums = sorted(by_ch[chap])
        ch_done = [n for n in nums if pages[str(n)]["status"] in ("drafted", "verified")]
        slug = "ch-" + chap.replace(" ", "-").lower()
        state = "done" if len(ch_done) == len(nums) else ("part" if ch_done else "todo")
        toc.append(f'<a href="#{slug}" class="{state}">{html.escape(chap)}'
                   f'<span>{len(ch_done)}/{len(nums)}</span></a>')

        blurb = CHAPTER_BLURB.get(chap, "")
        rows = []
        pending = []
        for n in nums:
            rec = pages[str(n)]
            if rec.get("status") == "blank":
                continue                     # a blank leaf, not a page to show
            en_file = EN / f"page_{n:03d}.md"
            if not en_file.exists():
                pending.append(n)
                continue
            it_file = SRC / f"page_{n:03d}.txt"
            it = italian_html(it_file.read_text(encoding="utf-8")) if it_file.exists() else ""
            body, notes = md_to_html(en_file.read_text(encoding="utf-8"))
            notes_html = f'<div class="notes"><h4>Notes</h4>{notes}</div>' if notes.strip() else ""
            badge = "verified" if rec["status"] == "verified" else "drafted"
            conf = rec.get("confidence", "unstated")
            conf_html = (
                f'<span class="conf conf-{conf}" title="'
                f'{html.escape(rec.get("confidence_note", ""))}">'
                f'confidence: {conf}</span>'
            )
            rows.append(
                f'<div class="spread" id="p{n}">'
                f'<div class="folio">p. {n}<span class="folio-r">{conf_html}'
                f'<span class="badge {badge}">{badge}</span></span></div>'
                f'<div class="cols"><div class="it" lang="it">{it}</div>'
                f'<div class="en">{body}{notes_html}</div></div></div>'
            )
        # Pages still to do are listed compactly rather than reproduced in full:
        # the Italian for them is a click away at Wikisource, and rendering all
        # 275 spreads makes a page no browser will paint.
        if pending:
            chips = " ".join(
                f'<a class="chip" href="https://it.wikisource.org/wiki/'
                f'Pagina:Hypnerotomachia_Poliphili.djvu/{n}">{n}</a>' for n in pending
            )
            rows.append(
                f'<div class="pending"><h4>{len(pending)} page'
                f'{"s" if len(pending) != 1 else ""} still to be englished</h4>'
                f'<div class="chips">{chips}</div></div>'
            )
        sections.append(
            f'<section id="{slug}"><div class="sec-head"><h2>Chapter {html.escape(chap)}</h2>'
            f'<p class="blurb">{blurb}</p>'
            f'<p class="count">{len(ch_done)} of {len(nums)} pages englished</p></div>'
            + "\n".join(rows) + "</section>"
        )

    pct = done / total * 100 if total else 0
    wpct = done_words / src_words * 100 if src_words else 0

    doc = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Finishing the Hypnerotomachia — a parallel text</title>
<style>
  *{{margin:0;padding:0;box-sizing:border-box}}
  :root{{--gold:#c8a878;--gold-dk:#8b4513;--dim:#8a7358;--bg:#0b0805;--panel:#120d08;
        --fg:#efe7d8;--rule:#241812}}
  body{{background:var(--bg);color:var(--fg);font-family:Georgia,'Times New Roman',serif;
       line-height:1.7;-webkit-font-smoothing:antialiased}}
  a{{color:var(--gold);text-decoration:none}}
  a:hover{{color:var(--fg)}}
  .masthead{{max-width:1180px;margin:0 auto;padding:4.5rem 2rem 1.5rem;text-align:center}}
  .kicker{{font-size:.62rem;letter-spacing:.32em;text-transform:uppercase;color:#6a5236}}
  .masthead h1{{font-weight:normal;letter-spacing:.05em;color:var(--gold);
               font-size:clamp(1.8rem,5vw,3rem);line-height:1.15;margin:1rem 0 .4rem}}
  .masthead h1 em{{color:var(--fg);font-style:italic}}
  .lede{{max-width:700px;margin:1.3rem auto 0;color:var(--dim);font-size:.95rem;line-height:1.9}}
  .progress{{max-width:700px;margin:2rem auto 0;padding:0 2rem}}
  .bar{{height:6px;background:#1d1510;border:1px solid var(--rule);overflow:hidden}}
  .bar i{{display:block;height:100%;background:linear-gradient(90deg,#8b4513,#c8a878);width:{pct:.2f}%}}
  .progress p{{font-size:.72rem;color:#7a6448;margin-top:.6rem;letter-spacing:.04em}}
  .method{{max-width:760px;margin:2.5rem auto 0;padding:0 2rem;font-size:.8rem;
          color:#7a6448;line-height:1.9}}
  .method strong{{color:var(--dim)}}
  .toc{{max-width:1000px;margin:2.5rem auto 0;padding:0 2rem;display:flex;flex-wrap:wrap;
       gap:.4rem;justify-content:center}}
  .toc a{{font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);
         border:1px solid var(--rule);padding:.35rem .7rem;display:flex;gap:.45rem;align-items:center}}
  .toc a span{{font-size:.6rem;color:#5a4632}}
  .toc a.done{{border-color:#4f6a3a;color:#9dbb82}}
  .toc a.part{{border-color:var(--gold-dk);color:var(--gold)}}
  .toc a:hover{{border-color:var(--gold);color:var(--fg)}}
  section{{max-width:1180px;margin:0 auto;padding:3.5rem 2rem 1rem}}
  .sec-head{{border-bottom:1px solid var(--rule);padding-bottom:1rem;margin-bottom:1.8rem}}
  .sec-head h2{{font-weight:normal;color:var(--gold);font-size:1.5rem;letter-spacing:.04em}}
  .sec-head .blurb{{color:var(--dim);font-size:.85rem;margin-top:.35rem}}
  .sec-head .count{{color:#5a4632;font-size:.68rem;letter-spacing:.1em;
                   text-transform:uppercase;margin-top:.5rem}}
  .spread{{border:1px solid var(--rule);margin-bottom:1.4rem;
          background:linear-gradient(180deg,rgba(255,255,255,.012),transparent)}}
  .spread.untranslated{{opacity:.55}}
  .folio{{display:flex;justify-content:space-between;align-items:center;
         padding:.5rem .9rem;border-bottom:1px solid var(--rule);
         font-size:.66rem;letter-spacing:.14em;text-transform:uppercase;color:#6a5236}}
  .folio-r{{display:flex;gap:.45rem;align-items:center}}
  .conf{{font-size:.58rem;padding:.15rem .5rem;border:1px solid;cursor:help}}
  .conf-high{{color:#9dbb82;border-color:#3f5a2e}}
  .conf-medium{{color:var(--gold);border-color:var(--gold-dk)}}
  .conf-low{{color:#d08a5a;border-color:#7a4a28}}
  .conf-unstated{{color:#5a4632;border-color:var(--rule)}}
  .badge{{font-size:.58rem;padding:.15rem .5rem;border:1px solid}}
  .badge.verified{{color:#9dbb82;border-color:#4f6a3a}}
  .badge.drafted{{color:var(--gold);border-color:var(--gold-dk)}}
  .badge.todo{{color:#5a4632;border-color:var(--rule)}}
  .cols{{display:grid;grid-template-columns:1fr 1fr;gap:0}}
  .it{{padding:1.2rem 1.4rem;border-right:1px solid var(--rule);color:#b7a184;
      font-size:.83rem;line-height:1.85}}
  .it p{{margin-bottom:.8rem}}
  .it .argument{{color:var(--gold);font-size:.72rem;letter-spacing:.06em;line-height:1.7}}
  .en{{padding:1.2rem 1.4rem;font-size:.9rem;line-height:1.85}}
  .en p{{margin-bottom:.85rem}}
  .en h4{{color:var(--gold);font-weight:normal;font-size:.9rem;margin:1rem 0 .5rem}}
  .en blockquote{{border-left:2px solid var(--gold-dk);padding-left:.9rem;margin:.8rem 0;
                 color:var(--gold);font-style:italic;font-size:.86rem}}
  .pending{{border:1px dashed var(--rule);padding:1rem 1.2rem;margin-bottom:1.4rem}}
  .pending h4{{font-size:.64rem;letter-spacing:.16em;text-transform:uppercase;
              color:#5a4632;font-weight:normal;margin-bottom:.7rem}}
  .chips{{display:flex;flex-wrap:wrap;gap:.3rem}}
  .chip{{font-size:.66rem;color:#6a5236;border:1px solid var(--rule);padding:.15rem .45rem}}
  .chip:hover{{border-color:var(--gold-dk);color:var(--gold)}}
  .unsure{{color:#d08a5a;border-bottom:1px dotted #d08a5a;cursor:help}}
  .notes{{margin-top:1.2rem;padding-top:.9rem;border-top:1px solid var(--rule);
         font-size:.76rem;color:#8a7358;line-height:1.75}}
  .notes h4{{font-size:.64rem;letter-spacing:.16em;text-transform:uppercase;color:#6a5236;margin:0 0 .5rem}}
  .notes ul{{padding-left:1.1rem}}
  .notes li{{margin-bottom:.45rem}}
  .notes code{{background:#1a1209;padding:.05rem .3rem;color:#c8b89a;font-size:.9em}}
  footer{{max-width:900px;margin:3rem auto 0;padding:2.5rem 2rem 5rem;
         border-top:1px solid var(--rule);color:#6a5236;font-size:.76rem;line-height:1.9}}
  footer h4{{color:var(--dim);font-weight:normal;letter-spacing:.1em;text-transform:uppercase;
            font-size:.64rem;margin-bottom:.7rem}}
  .backlink{{display:inline-block;margin-top:1.2rem;font-size:.7rem;letter-spacing:.1em;
            text-transform:uppercase}}
  @media(max-width:820px){{.cols{{grid-template-columns:1fr}}
    .it{{border-right:none;border-bottom:1px solid var(--rule)}}}}
</style>
</head>
<body>
<div class="masthead">
  <div class="kicker">Emblems in 3D · a working edition</div>
  <h1>Finishing the <em>Hypnerotomachia</em></h1>
  <p class="lede">Robert Dallington's Elizabethan English stops partway through
  chapter XVII, at the word <em>Mustulento</em> — facsimile page 193 of 467.
  Everything after it has existed in English only under copyright. This is a new
  translation of the remainder, made from the 1499 Aldine, set beside the Italian
  it came from so that any sentence can be checked.</p>
</div>

<div class="progress">
  <div class="bar"><i></i></div>
  <p>{done} of {total} pages englished · {done_words:,} of {src_words:,} source words
  ({wpct:.1f}%)</p>
</div>

<div class="method">
  <p><strong>Method.</strong> The Italian is the Wikisource transcription of the
  1499 Aldine (scanned from the MIT Press facsimile). That transcription is
  unproofread, so where it looks corrupt we check the facsimile and the 1545
  Aldine reprint before translating rather than rendering a scanner error into
  English. Readings still in doubt are marked
  <span class="unsure">[?like this]</span> and explained in the notes; a page is
  only <span class="badge verified">verified</span> once none remain.</p>
  <p style="margin-top:.9rem"><strong>Register.</strong> Modern but formal. We do
  not imitate Dallington — a reader should be able to tell at a glance which
  English is 1592 and which is ours. The formality comes from vocabulary and
  sentence shape, not from archaic grammar.</p>
  <p style="margin-top:.9rem"><strong>Rights.</strong> The 1499 original is
  public domain, and a faithful transcription of a public-domain work carries no
  new copyright. Joscelyn Godwin's 1999 translation is in copyright and has not
  been consulted, quoted, or paraphrased at any point; every English sentence
  here was made from the Italian in the left-hand column.</p>
</div>

<div class="toc">
{chr(10).join(toc)}
</div>

{chr(10).join(sections)}

<footer>
  <h4>Sources</h4>
  <p>Francesco Colonna, <em>Hypnerotomachia Poliphili</em>, Venice: Aldus
  Manutius, 1499. Italian text after the transcription at
  <a href="https://it.wikisource.org/wiki/Hypnerotomachia_Poliphili">it.wikisource.org</a>,
  from the MIT Press facsimile. Dallington's partial English,
  <em>Hypnerotomachia: The Strife of Loue in a Dreame</em> (London: Simon
  Waterson, 1592), is at
  <a href="https://www.gutenberg.org/ebooks/18459">Project Gutenberg</a> and in
  EEBO/TCP under CC0.</p>
  <p style="margin-top:.8rem">English translation of the post-1592 remainder ©
  the Emblems in 3D project. Generated by
  <code>scripts/build_translation_page.py</code>; method and decisions in
  <code>translation/NOTES.md</code>.</p>
  <a class="backlink" href="../index.html">← back to Emblems in 3D</a>
</footer>
</body>
</html>
"""
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(doc, encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} — {done}/{total} pages, {wpct:.1f}% of words")
    return 0


if __name__ == "__main__":
    sys.exit(main())
