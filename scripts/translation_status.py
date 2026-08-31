#!/usr/bin/env python3
"""Reconcile translation/manifest.json with what is actually on disk, and report.

Status is derived, never hand-maintained, so the manifest cannot drift from
reality:

    unfetched  no Italian source page
    fetched    source present, no English yet
    drafted    English present, but it still carries [?...] uncertain readings
    verified   English present with no uncertain readings left

    python scripts/translation_status.py           # reconcile + report
    python scripts/translation_status.py --next 5  # what to translate next
"""

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "translation" / "source"
EN = ROOT / "translation" / "en"
MANIFEST = ROOT / "translation" / "manifest.json"

# Chapters in reading order, with the working order we translate them in.
READING_ORDER = [
    "XVII", "XVIII", "XIX", "XX", "XXI", "XXII", "XXIII", "XXIV", "XXV",
    "XXVI", "XXVII", "XXVIII", "XXIX", "XXX", "XXXI", "XXXII", "XXXIII",
    "XXXIV", "XXXV", "XXXVI", "XXXVII", "XXXVIII", "Epitaphium Poliae", "Errori",
]
# Deliberately out of reading order: the Dream Garden's missing scenes first.
WORK_ORDER = (
    ["XXXVIII", "Epitaphium Poliae"]
    + ["XXV", "XXVI", "XXVII", "XXVIII", "XXIX"]
    + ["XVII", "XVIII", "XIX", "XX", "XXI", "XXII", "XXIII", "XXIV"]
    + ["XXX", "XXXI", "XXXII", "XXXIII", "XXXIV", "XXXV", "XXXVI", "XXXVII"]
    + ["Errori"]
)


def reconcile(man):
    for page, rec in man["pages"].items():
        src = SRC / f"page_{int(page):03d}.txt"
        en = EN / f"page_{int(page):03d}.md"
        if not src.exists():
            rec["status"] = "unfetched"
            continue
        if not en.exists():
            rec["status"] = "fetched"
            rec.pop("uncertain", None)
            continue
        text = en.read_text(encoding="utf-8")
        marks = re.findall(r"\[\?[^\]]*\]", text)
        rec["status"] = "drafted" if marks else "verified"
        rec["en_words"] = len(re.sub(r"\[\?[^\]]*\]", "", text).split())
        if marks:
            rec["uncertain"] = len(marks)
        else:
            rec.pop("uncertain", None)
    return man


def report(man, next_n=0):
    pages = man["pages"]
    counts = {}
    for rec in pages.values():
        counts[rec["status"]] = counts.get(rec["status"], 0) + 1
    total = len(pages)
    done = counts.get("drafted", 0) + counts.get("verified", 0)
    src_words = sum(r.get("words", 0) for r in pages.values())
    done_words = sum(r.get("words", 0) for r in pages.values()
                     if r["status"] in ("drafted", "verified"))

    print(f"HYPNEROTOMACHIA — finishing what Dallington left, from page "
          f"{man['range']['first_page']} to {man['range']['last_page']}")
    print()
    print(f"  pages   {done:4d} / {total:<4d} ({done / total * 100:5.1f}%)")
    print(f"  words   {done_words:,} / {src_words:,} source words "
          f"({done_words / src_words * 100:5.1f}%)")
    for k in ("unfetched", "fetched", "drafted", "verified"):
        if counts.get(k):
            print(f"    {k:10s} {counts[k]:4d}")
    unc = sum(r.get("uncertain", 0) for r in pages.values())
    if unc:
        drafted = [p for p, r in pages.items() if r.get("uncertain")]
        print(f"  {unc} uncertain reading(s) awaiting the facsimile, on "
              f"page(s) {', '.join(sorted(drafted, key=int))}")
    print()

    by_ch = {}
    for p, rec in pages.items():
        c = by_ch.setdefault(rec["chapter"], {"n": 0, "done": 0, "words": 0})
        c["n"] += 1
        c["words"] += rec.get("words", 0)
        if rec["status"] in ("drafted", "verified"):
            c["done"] += 1
    print(f"  {'chapter':18s} {'done':>9s} {'words':>7s}")
    for c in READING_ORDER:
        if c not in by_ch:
            continue
        v = by_ch[c]
        bar = "#" * round(v["done"] / v["n"] * 12)
        print(f"  {c:18s} {v['done']:3d}/{v['n']:<3d} {bar:<12s} {v['words']:6,d}")

    if next_n:
        print()
        todo = []
        for c in WORK_ORDER:
            ps = sorted((int(p) for p, r in pages.items()
                         if r["chapter"] == c and r["status"] == "fetched"))
            todo.extend(ps)
            if len(todo) >= next_n:
                break
        print(f"  next {next_n}: " + ", ".join(f"page_{p:03d}" for p in todo[:next_n]))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--next", type=int, default=0, help="also print the next N pages to translate")
    args = ap.parse_args()
    if not MANIFEST.exists():
        print("no manifest; run scripts/fetch_hp_source.py first", file=sys.stderr)
        return 1
    man = reconcile(json.loads(MANIFEST.read_text(encoding="utf-8")))
    MANIFEST.write_text(json.dumps(man, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    report(man, args.next)
    return 0


if __name__ == "__main__":
    sys.exit(main())
