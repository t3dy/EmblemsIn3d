#!/usr/bin/env python3
"""Fetch the 1499 Hypnerotomachia source text and maintain the translation manifest.

The Italian Wikisource transcription of the Aldine 1499 (scanned from the MIT
Press facsimile) lives one wiki page per facsimile page, in the Pagina:
namespace. This pulls the range Dallington never reached -- facsimile pages 193
to 467, chapters XVII through XXXVIII plus the epitaphs -- strips the wiki
furniture, and writes one plain-text file per page.

It is safe to re-run. Pages already fetched are left alone unless --refetch is
passed, and the manifest records per-page status so a translation campaign
spanning many sessions can always answer "what is done and what is next?"
without re-deriving it.

    python scripts/fetch_hp_source.py            # fetch missing pages
    python scripts/fetch_hp_source.py --status   # print progress, fetch nothing
"""

import argparse
import hashlib
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

API = "https://it.wikisource.org/w/api.php"
UA = "HPin3D-translation/1.0 (https://github.com/t3dy/EmblemsIn3d; ted.hand@gmail.com)"
DJVU = "Hypnerotomachia Poliphili.djvu"

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "translation" / "source"
MANIFEST = ROOT / "translation" / "manifest.json"

# Facsimile page on which each chapter opens, from the Wikisource index.
# Dallington's 1592 stops mid-XVII (the word "Mustulento", page 193).
CHAPTER_STARTS = [
    ("XVII", 189), ("XVIII", 225), ("XIX", 242), ("XX", 283), ("XXI", 290),
    ("XXII", 326), ("XXIII", 358), ("XXIV", 369), ("XXV", 381), ("XXVI", 387),
    ("XXVII", 398), ("XXVIII", 409), ("XXIX", 417), ("XXX", 428), ("XXXI", 432),
    ("XXXII", 436), ("XXXIII", 444), ("XXXIV", 448), ("XXXV", 455),
    ("XXXVI", 461), ("XXXVII", 462), ("XXXVIII", 465),
    ("Epitaphium Poliae", 466), ("Errori", 467),
]

FIRST_PAGE = 193   # where Dallington leaves off
LAST_PAGE = 467


def chapter_for(page: int) -> str:
    name = CHAPTER_STARTS[0][0]
    for chap, start in CHAPTER_STARTS:
        if page >= start:
            name = chap
        else:
            break
    return name


def clean(wikitext: str) -> str:
    """Strip wiki furniture, keep the Italian."""
    t = wikitext
    t = re.sub(r"<noinclude>.*?</noinclude>", "", t, flags=re.S)
    t = re.sub(r"<references\s*/>", "", t)
    # {{capolettera|[[File:...|110px|C]]|}} carries the dropped capital letter
    t = re.sub(r"\{\{capolettera\|\[\[File:[^|\]]*\|[^|\]]*\|([^\]|]*)\]\]\|?\}\}", r"\1", t)
    t = re.sub(r"\{\{Centrato\|(.*?)\}\}", r"\1", t, flags=re.S)
    t = re.sub(r"\{\{[Nn]op\}\}", "", t)
    t = re.sub(r"\{\{[^{}]*\}\}", "", t)          # any remaining simple template
    t = re.sub(r"</?poem>", "", t)
    t = re.sub(r"\[\[File:[^\]]*\]\]", "", t)
    t = re.sub(r"\[\[[^\]|]*\|([^\]]*)\]\]", r"\1", t)
    t = re.sub(r"\[\[([^\]]*)\]\]", r"\1", t)
    t = re.sub(r"</?[a-zA-Z][^>]*>", "", t)        # stray html
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip()


def fetch_batch(pages):
    """One API call for up to 50 facsimile pages."""
    titles = "|".join(f"Pagina:{DJVU}/{p}" for p in pages)
    params = {
        "action": "query", "prop": "revisions", "rvprop": "content",
        "rvslots": "main", "format": "json", "formatversion": "2",
        "titles": titles,
    }
    req = urllib.request.Request(
        API + "?" + urllib.parse.urlencode(params), headers={"User-Agent": UA}
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        data = json.loads(r.read().decode("utf-8"))
    out = {}
    for pg in data.get("query", {}).get("pages", []):
        title = pg.get("title", "")
        m = re.search(r"/(\d+)$", title)
        if not m:
            continue
        num = int(m.group(1))
        if pg.get("missing"):
            out[num] = None
            continue
        try:
            out[num] = pg["revisions"][0]["slots"]["main"]["content"]
        except (KeyError, IndexError):
            out[num] = None
    return out


def load_manifest():
    if MANIFEST.exists():
        return json.loads(MANIFEST.read_text(encoding="utf-8"))
    return {
        "work": "Hypnerotomachia Poliphili, Aldus Manutius, Venice 1499",
        "source": "it.wikisource.org, Pagina:Hypnerotomachia Poliphili.djvu (MIT Press facsimile)",
        "rights": "1499 original is public domain; a faithful transcription carries no new copyright. "
                  "Godwin 1999 is in copyright and is not consulted.",
        "range": {"first_page": FIRST_PAGE, "last_page": LAST_PAGE,
                  "why": "Dallington's 1592 English stops at page 193, mid-chapter XVII."},
        "status_values": ["unfetched", "fetched", "drafted", "verified"],
        "pages": {},
    }


def save_manifest(m):
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(m, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def summarise(m):
    counts = {}
    for rec in m["pages"].values():
        counts[rec["status"]] = counts.get(rec["status"], 0) + 1
    total = len(m["pages"])
    print(f"pages tracked: {total}")
    for k in m["status_values"]:
        if counts.get(k):
            print(f"  {k:10s} {counts[k]:4d}")
    by_chapter = {}
    for rec in m["pages"].values():
        c = by_chapter.setdefault(rec["chapter"], {"n": 0, "done": 0})
        c["n"] += 1
        if rec["status"] in ("drafted", "verified"):
            c["done"] += 1
    pending = [c for c, v in by_chapter.items() if v["done"] < v["n"]]
    if pending:
        print("chapters not yet fully drafted: " + ", ".join(pending))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--refetch", action="store_true", help="re-download pages already on disk")
    ap.add_argument("--status", action="store_true", help="report progress and exit")
    ap.add_argument("--limit", type=int, default=0, help="stop after N pages (for testing)")
    args = ap.parse_args()

    m = load_manifest()
    if args.status:
        summarise(m)
        return 0

    SRC_DIR.mkdir(parents=True, exist_ok=True)
    wanted = list(range(FIRST_PAGE, LAST_PAGE + 1))
    if args.limit:
        wanted = wanted[: args.limit]

    todo = []
    for p in wanted:
        path = SRC_DIR / f"page_{p:03d}.txt"
        if path.exists() and not args.refetch:
            rec = m["pages"].setdefault(str(p), {})
            rec.setdefault("chapter", chapter_for(p))
            rec.setdefault("status", "fetched")
            continue
        todo.append(p)

    print(f"{len(todo)} page(s) to fetch of {len(wanted)} in range")
    for i in range(0, len(todo), 50):
        batch = todo[i : i + 50]
        try:
            got = fetch_batch(batch)
        except Exception as e:                       # noqa: BLE001
            print(f"  batch {batch[0]}-{batch[-1]} FAILED: {e}")
            continue
        for p in batch:
            content = got.get(p)
            rec = m["pages"].setdefault(str(p), {})
            rec["chapter"] = chapter_for(p)
            if not content:
                rec["status"] = "unfetched"
                rec["note"] = "no transcription on Wikisource"
                continue
            text = clean(content)
            (SRC_DIR / f"page_{p:03d}.txt").write_text(text, encoding="utf-8")
            rec["status"] = "fetched"
            rec["words"] = len(text.split())
            rec["sha1"] = hashlib.sha1(text.encode("utf-8")).hexdigest()[:12]
            rec.pop("note", None)
        print(f"  fetched {batch[0]}-{batch[-1]}")
        time.sleep(0.5)                              # be a good citizen

    save_manifest(m)
    summarise(m)
    total_words = sum(r.get("words", 0) for r in m["pages"].values())
    print(f"source words in range: {total_words:,}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
