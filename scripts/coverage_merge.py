#!/usr/bin/env python3
"""Merge research/incoming/<NUMERAL>.json into research/coverage.json.

Why this exists. `RECIPES/research-a-chapter.md` has the researcher edit
`research/coverage.json` directly, which is right when one chapter is being read
at a time. On 2026-09-17 twenty chapters were enumerated in one sweep by agents
running at once, and ORCHESTRATION.md's rule is one writer per file, always. So
each researcher writes its own `research/incoming/<NUMERAL>.json` and this script
is the single writer that folds them in.

An incoming file is:

    { "id": "XXII",
      "research": { "status": "enumerated", ... },
      "features": [ ... ],            # the ledger's own feature schema
      "measurements": [ ... ] }       # NEW: the chapter's stated sizes

`measurements` is not part of the ledger schema. It is split off into
`research/measurements.json`, which is the machine-readable half of
`DIMENSIONS.md` and the input to the true-scale ground plan (DECISIONS.md
2026-09-17, "The world is rebuilt at the book's own scale").

Merged files are moved to `research/incoming/merged/` so a second run cannot
double-apply them. Run `scripts/coverage_seed.py && scripts/coverage_report.py`
afterwards, as the recipe says.
"""

import json
import pathlib
import shutil
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
LEDGER = ROOT / 'research' / 'coverage.json'
MEASURES = ROOT / 'research' / 'measurements.json'
INCOMING = ROOT / 'research' / 'incoming'
DONE = INCOMING / 'merged'

FEATURE_KEYS = {'id', 'name', 'kind', 'plate', 'source', 'status', 'built_as', 'note', 'modes'}
STATUSES = {'built', 'partial', 'unbuilt', 'declined', 'unknown'}


def load(path, default=None):
    if not path.exists():
        return default
    with path.open(encoding='utf-8') as fh:
        return json.load(fh)


def save(path, data):
    with path.open('w', encoding='utf-8') as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
        fh.write('\n')


def check(incoming, path):
    """Return a list of problems. A file with problems is not merged."""
    bad = []
    if not incoming.get('id'):
        bad.append('no id')
    if incoming.get('research', {}).get('status') != 'enumerated':
        bad.append("research.status is not 'enumerated'")
    seen = set()
    for f in incoming.get('features', []):
        fid = f.get('id')
        if not fid:
            bad.append('a feature has no id')
            continue
        if fid in seen:
            bad.append(f'duplicate feature id {fid}')
        seen.add(fid)
        if not f.get('source'):
            bad.append(f'{fid}: no source')
        if f.get('status') not in STATUSES:
            bad.append(f'{fid}: status {f.get("status")!r}')
        extra = set(f) - FEATURE_KEYS
        if extra:
            bad.append(f'{fid}: unknown keys {sorted(extra)}')
    return bad


def main():
    ledger = load(LEDGER)
    if ledger is None:
        sys.exit(f'no ledger at {LEDGER}')
    by_id = {c['id']: c for c in ledger['chapters']}

    measures = load(MEASURES, {
        'note': ('Stated sizes, distances, counts and bearings, chapter by chapter, as the '
                 'researchers recorded them. The narrative half is DIMENSIONS.md; this is the '
                 'half a script can read. Written by scripts/coverage_merge.py.'),
        'units': {'foot': 0.296, 'palm': 0.074, 'cubit': 0.444, 'pace': 1.48,
                  'stadium': 185.0, 'mile': 1480.0},
        'chapters': {},
    })

    merged, skipped = [], []
    for path in sorted(INCOMING.glob('*.json')):
        incoming = load(path)
        problems = check(incoming, path)
        if problems:
            skipped.append((path.name, problems))
            continue
        cid = incoming['id']
        if cid not in by_id:
            skipped.append((path.name, [f'no chapter {cid} in the ledger']))
            continue
        chapter = by_id[cid]
        chapter['research'] = incoming['research']
        chapter['features'] = incoming['features']
        if incoming.get('measurements'):
            measures['chapters'][cid] = incoming['measurements']
        merged.append((cid, len(incoming['features']), len(incoming.get('measurements', []))))

    if merged:
        save(LEDGER, ledger)
        save(MEASURES, measures)
        DONE.mkdir(parents=True, exist_ok=True)
        for path in sorted(INCOMING.glob('*.json')):
            if load(path).get('id') in {m[0] for m in merged}:
                shutil.move(str(path), str(DONE / path.name))

    for cid, nf, nm in merged:
        print(f'  merged {cid}: {nf} features, {nm} measurements')
    for name, problems in skipped:
        print(f'  SKIPPED {name}: ' + '; '.join(problems))
    print(f'{len(merged)} merged, {len(skipped)} skipped')
    return 1 if skipped else 0


if __name__ == '__main__':
    sys.exit(main())
