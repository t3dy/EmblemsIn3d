#!/usr/bin/env python3
"""Stage 2 of the true-scale plan: turn `research/plan.json` into a table the world can move by.

DECISIONS.md call 54 chose true scale, staged, *with the plan as data first*. Stage 1 (`SPREAD = 4`)
multiplied every station position by four and left the builders' own literals where they were.
That worked, and it is also exactly the trap HANDOVER.md §4.3 names — **hand-copied constants do
not move when the table they were copied from moves**. Stage 2 is thirteen kilometres of
itinerary; doing it the stage-1 way means finding and re-typing every coordinate in ten thousand
lines of scene code, once, correctly, with no way to check it.

So stage 2 does not move literals at all. It moves **precincts**, rigidly, each inside a
`_placeAt` group, and this file computes the shift for each one. A builder's interior keeps every
coordinate it has; the group underneath it carries the whole precinct — geometry, colliders,
floors, NPCs — onto the plan. Stage 3 and 4 re-run this script rather than editing anything.

    python scripts/plan_sites.py      -> src/scenes/world/plan_sites.js

## What a shift is

`plan.json` is written in PLAN coordinates, whose origin is the front of the porch. The world's
porch is at z = 104 (`PIAZZA.z0`), so a plan z becomes a world z by adding `ANCHOR`.

A precinct's shift is `plan centre - current centre`. The current centre is taken from the
stations that live in it — they are the one table that already moved with stage 1, so they are
the honest record of where the world puts each precinct now.

## Why z only, with four exceptions

Every spine precinct's plan `x` is 0, and the world's x layout inside the valley is already
argued from the compass (DIRECTIONS.md §2: the wolf at -x because Poliphilo walks north, the
Medusa door at +x). Shifting x by the few metres between "mean of the stations" and 0 would
disturb those sitings to no purpose. Four precincts DO carry a stated x and take it:
`spring` (-260), `wooded_country` (-120), `fountain_house` (+60) and `treviso` (+1400 — call 55,
Book II is a second place, and at x = 0 it would stand inside the pyramid).
"""

import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
PLAN = ROOT / 'research' / 'plan.json'
CONSTANTS = ROOT / 'src' / 'scenes' / 'world' / 'constants.js'
OUT = ROOT / 'src' / 'scenes' / 'world' / 'plan_sites.js'

# The world z of the plan's origin: the front of the porch. PIAZZA.z0 in constants.js.
ANCHOR = 104.0

# The precincts whose plan x is a claim rather than a rounding, and is therefore taken.
TAKE_X = {'spring', 'wooded_country', 'fountain_house', 'treviso'}

# Precincts the world does not build yet: they have no station to measure a current centre from,
# so they are sited at their plan centre outright and their builders work in world coordinates.
GREENFIELD = {'cypress_avenue', 'enclosure', 'crossing'}

# Two of plan.json's station assignments are wrong for the purpose of measuring a CURRENT centre,
# and both are the same mistake: a station whose name matches the precinct but whose geometry is
# somewhere else entirely.
#
#   fountain_house  the book's octagonal fountain and bath, ch. VI, in the wooded country.
#                   plan.json hangs the `fountain` station on it — but that station is folio 80's
#                   Fountain of Venus, which stands in the palace gardens and is built by
#                   `_buildGracesFountain`. Measuring the wooded country from it would drag the
#                   palace's own fountain a mile north.
# It is ONE precinct, not two: `wooded_country` hangs on `fields`, and that is correct — the
# Fruitful Fields and the water that divides right from left are the same chapter VI, and the
# world's own `_buildSecondNature` and `_buildDividingSpring` are built beside that station. The
# world merely has the whole group in the wrong place, south of the porch, which is exactly what
# a shift is for.
IGNORE_STATIONS = {'fountain_house'}

# ── Where a precinct is measured from ───────────────────────────────────────
#
# The default is the mean z of the stations inside it, which is honest for a precinct whose
# stations sit about its middle — the palace's five, spread over 95 m inside a 277.5 m precinct,
# are exactly that case. It is WRONG wherever plan.json's precinct is enormous beside the feature
# the station marks, and there it would move a thing that is already in the right place.
#
# Each entry is (anchor z in the world today, why). A `None` anchor means the precinct does not
# move at all: it is already on the plan's line and stage 2 changes its SIZE, not its position.
ANCHORED_ON = {
    # The plan's origin IS the front of the porch, and the world already puts it at z = 104. The
    # pyramid does not move north; it grows north, 1 139.6 m of it, from that face. Anchoring on
    # the `portal` station (z = 148, out in the court) and aiming at the centre of a 1 139.6 m
    # mass would drive the porch 614 m backwards into its own pyramid.
    'pyramid': (None, 'the porch front is the plan origin and is already at z = 104; '
                      'stage 2 grows this precinct northward rather than moving it'),
    # Thirty paces of court, stated, from the porch southward — z 104 to 148.4. That is what
    # PIAZZA already says. The mean of its three stations is 194.7 because the horse and the
    # colossus stand well south of the stated court; moving the court to fit them would be
    # moving the pavement to fit the furniture.
    'piazza': (None, 'PIAZZA.z0 = 104 and side = 44.4 are the book\'s own numbers and already hold'),
    # The valley's north end is the court's mouth at 148.4 and already is. Ten stadia of it run
    # SOUTH from there, which is a lengthening, not a move.
    'valley': (None, 'its north edge abuts the court at 148.4 already; stage 2 lengthens it south'),
    # The wood is a body, not a point: WOOD spans z 1192.5–1387.5. Its own centre, 1290, is what
    # should land in the middle of the plan's wood — the `wood` station at 1360 stands deliberately
    # deep in the northern half of it.
    'wood': (1290.0, 'the WOOD box centre (z0 1192.5, z1 1387.5), not the station inside it'),
    # The island is built around one centre, CZ = -600 in cythera.js, and everything on it is
    # radial from there. Its three stations are scattered over the parterres.
    'cythera': (-600.0, "the isle's own centre CZ in _buildCytheraIsle, which everything is radial from"),
}


def current_stations():
    """Where the world puts each station TODAY — parsed, never typed. plan_build.py does the same."""
    src = CONSTANTS.read_text(encoding='utf-8')
    block = src[src.index('export const HP_STATIONS'):src.index('export const PIAZZA')]
    pat = re.compile(r"\{\s*key:\s*'([a-z_]+)'.*?pos:\s*\[\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\]", re.S)
    return {m.group(1): (float(m.group(2)), float(m.group(3))) for m in pat.finditer(block)}


def build():
    plan = json.loads(PLAN.read_text(encoding='utf-8'))
    cur = current_stations()
    sites = []

    for p in plan['precincts']:
        key = p['key']
        px, pz = p['centre'][0], p['centre'][1] + ANCHOR
        keys = [] if key in IGNORE_STATIONS else [k for k in p['stations'] if k in cur]
        greenfield = key in GREENFIELD or not keys
        anchor, why = ANCHORED_ON.get(key, ('mean', ''))

        if greenfield:
            # Nothing exists to move, so the builder is written in the precinct's OWN
            # frame — origin at its centre, which is the natural way to write a new one —
            # and the shift carries it to the plan. `was` is [0, 0] because that is
            # literally where the geometry is authored.
            cx, cz = 0.0, 0.0
            dx, dz = px, pz
        elif anchor is None:
            cx, cz = px, pz          # already on the plan's line: stage 2 resizes, it does not move
            dx = dz = 0.0
        else:
            cx = sum(cur[k][0] for k in keys) / len(keys)
            cz = anchor if anchor != 'mean' else sum(cur[k][1] for k in keys) / len(keys)
            dz = pz - cz
            dx = (px - cx) if key in TAKE_X else 0.0

        sites.append({
            'key': key, 'name': p['name'], 'chapter': p['chapter'],
            'centre': [round(px, 1), round(pz, 1)],
            'was': [round(cx, 1), round(cz, 1)],
            'shift': [round(dx, 1), round(dz, 1)],
            'width': p['width_m'], 'depth': p['depth_m'],
            'zSouth': None if p['z_south'] is None else round(p['z_south'] + ANCHOR, 1),
            'zNorth': None if p['z_north'] is None else round(p['z_north'] + ANCHOR, 1),
            'greenfield': greenfield,
            'fixed': (not greenfield) and anchor is None,
            'why': why,
            'stations': keys,
            'sized': p['size_source']['kind'],
        })

    return sites, plan


def emit(sites, plan):
    ext = plan['extent']
    L = []
    L.append('// plan_sites.js — GENERATED by scripts/plan_sites.py. Do not hand edit.')
    L.append('//')
    L.append('// Stage 2 of the true-scale plan (DECISIONS.md call 54). Each entry says where a')
    L.append('// precinct stands today (`was`), where research/plan.json puts it (`centre`), and the')
    L.append('// rigid `shift` between the two. HPWorldScene wraps each precinct\'s builders in a')
    L.append('// `_placeAt(dx, dz, 0, ...)` using that shift, so no coordinate inside any builder')
    L.append('// has to move — which is the whole point, and the answer to HANDOVER.md §4.3.')
    L.append('//')
    L.append('// `greenfield` means the world had no such precinct until stage 2. Its builder is')
    L.append("// written in the precinct's OWN frame, origin at its centre, and the shift IS the")
    L.append('// plan centre — which is why `was` reads [0, 0] for those.')
    L.append('//')
    L.append(f'// The itinerary is {ext["length_m"]:,.0f} m long and {ext["width_max"]:,.0f} m at its widest.')
    L.append('')
    L.append('export const PLAN_ANCHOR = %.1f;   // world z of the front of the porch, the plan\'s origin' % ANCHOR)
    L.append('')
    L.append("// Stage 1's factor. It is not history: it is the frame every existing precinct's")
    L.append('// INTERIOR is authored in, because stage 1 multiplied the world by four and stage 2')
    L.append('// deliberately did not touch a single interior coordinate. Anything still written in')
    L.append("// the original cramped coordinates - the dream mode's paths, the meadow's clearance")
    L.append('// map - reaches the world through `toWorld`, which applies both moves in order.')
    L.append('export const SPREAD = 4;')
    L.append('')
    L.append('// A point written in the ORIGINAL (pre-2026-09-17) coordinates, in world metres.')
    L.append('// `key` is the precinct the point belongs to, and the two moves are x4 then shift.')
    L.append('export function toWorld(key, x, z) {')
    L.append('  const s = PLAN_SITES[key];')
    L.append('  if (!s) throw new Error(`toWorld: no precinct named \"${key}\"`);')
    L.append('  return [x * SPREAD + s.shift[0], z * SPREAD + s.shift[1]];')
    L.append('}')
    L.append('')
    L.append('export const PLAN_EXTENT = {')
    L.append('  zSouth: %.1f, zNorth: %.1f, widthMax: %.1f, length: %.1f,' % (
        ext['z_south'] + ANCHOR, ext['z_north'] + ANCHOR, ext['width_max'], ext['length_m']))
    L.append('};')
    L.append('')
    L.append('export const PLAN_SITES = {')
    for s in sites:
        how = ('greenfield' if s['greenfield']
               else 'FIXED — ' + s['why'] if s['fixed']
               else ('anchored on ' + s['why'] if s['why'] else 'from ' + ', '.join(s['stations'])))
        L.append('  // %s — %s (ch. %s)' % (
            s['key'], s['name'], s['chapter'].replace('â€“', '–')))
        L.append('  //   %s' % how)
        L.append('  %s: { centre: [%.1f, %.1f], was: [%.1f, %.1f], shift: [%.1f, %.1f],'
                 % (s['key'], *s['centre'], *s['was'], *s['shift']))
        zs = 'null' if s['zSouth'] is None else '%.1f' % s['zSouth']
        zn = 'null' if s['zNorth'] is None else '%.1f' % s['zNorth']
        L.append('    width: %.1f, depth: %.1f, zSouth: %s, zNorth: %s, greenfield: %s, fixed: %s, sized: %r },'
                 % (s['width'], s['depth'], zs, zn, 'true' if s['greenfield'] else 'false', 'true' if s['fixed'] else 'false', s['sized']))
    L.append('};')
    L.append('')
    L.append('// The shift for a precinct, as [dx, dz]. Unknown keys are a programming error and')
    L.append('// throw rather than silently returning zero — a precinct that quietly does not move')
    L.append('// is exactly the failure this whole file exists to prevent.')
    L.append('export function shiftOf(key) {')
    L.append('  const s = PLAN_SITES[key];')
    L.append('  if (!s) throw new Error(`plan_sites: no precinct named "${key}"`);')
    L.append('  return s.shift;')
    L.append('}')
    L.append('')
    OUT.write_text('\n'.join(L), encoding='utf-8')


if __name__ == '__main__':
    sites, plan = build()
    emit(sites, plan)
    print(f'{OUT.relative_to(ROOT)} — {len(sites)} precincts')
    print(f'{"precinct":16} {"was z":>9} {"plan z":>10} {"shift dz":>10} {"dx":>7}')
    for s in sites:
        print(f'{s["key"]:16} {s["was"][1]:9.1f} {s["centre"][1]:10.1f} '
              f'{s["shift"][1]:10.1f} {s["shift"][0]:7.1f}'
              + ('   greenfield' if s['greenfield'] else ''))
