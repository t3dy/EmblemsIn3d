#!/usr/bin/env python3
"""The true-scale ground plan: compute it, don't type it.

DECISIONS.md 2026-09-17 call 54 — *"spread everything out"* — chose true scale, staged, with
**the plan as data first** so that no precinct is ever moved twice. This is that table.

A PRECINCT is a piece of the dream with its own floor: the wood, the valley, the court before
the porch, the cypress avenue, the green enclosure, Cythera. Each has a depth (along the
itinerary), a width (across it), and a GAP of clear ground between its southern edge and the
precinct before it. Every one of those three numbers is either

  * `stated` — the book gives it, with a page; or
  * `ours`   — the book does not, and the note says what it is reasoned from.

**Two rules, and they exist to stop the discretionary half of this table from quietly becoming
the whole of it.**

1. **An unstated gap is one stadium of clear ground between precinct edges.** 185 m is the book's
   own unit of long distance, it is a walk of about 37 s and a run of 12, and using one figure
   everywhere means the world's spacing cannot drift into being an accident. Where the book
   insists on distance in words rather than numbers — *"a farre off"*, a wandering, a whole
   chapter of song — the gap is larger, in stadia, and the passage is cited.
2. **Every `ours` distance is written in STADIA, never in round metres.** The first draft of this
   table came out 16.2 km long, of which 12.7 km was invention — a ratio that makes the book's
   own measurements decoration. Forcing each guess to be *n stadia* makes it legible as a guess,
   comparable with the book's own figures, and arguable: "the valley is ten stadia" is a claim
   someone can dispute, where "the valley is 3 000 m" is just a number that got typed.

THE COMPASS (DIRECTIONS.md §2, declared 2026-09-08): +z is SOUTH, -z is NORTH, +x EAST, -x WEST.
Poliphilo walks NORTHWARD, so the itinerary runs from high z to low z and the precincts below
are in his order. **The anchor is the front of the porch**, z = 0 in plan coordinates: the book's
own hinge, where *"no man could go further forward or backe againe"* (Dall. p. 27).

Run: python scripts/plan_build.py    → research/plan.json, research/plan.md
"""

import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT_JSON = ROOT / 'research' / 'plan.json'
OUT_MD = ROOT / 'research' / 'plan.md'
CONSTANTS = ROOT / 'src' / 'scenes' / 'world' / 'constants.js'

STADIUM = 185.0          # the default unstated gap, and the unit every `ours` distance is in
PACE = 1.48


def st(n):
    """n stadia, in metres. Every discretionary distance in this table goes through here."""
    return round(n * STADIUM, 1)

# ── The precincts, in Poliphilo's order ──────────────────────────────────────
#
# gap    — clear ground between this precinct's south edge and the last one's north edge
# depth  — its extent along the itinerary (z)
# width  — its extent across it (x)
# x      — the centre-line offset east(+)/west(-) for anything that sits off the spine
# keys   — the HP_STATIONS entries that live in it
#
# `src` fields: 'stated' carries the page; 'ours' carries the reasoning.

PRECINCTS = [
    dict(key='plain', name='The Spacious Plain', chapter='I',
         gap=0, depth=st(4), width=st(6), x=0, keys=['plain'],
         gap_src=('ours', 'the dream opens here; nothing precedes it'),
         size_src=('ours', 'the book fixes no size, only a quality: "una spatiosa planitie, '
                   'tutta virente et di multiplici fiori", empty of every living thing. Composed '
                   'absence needs room to be absent in. FOUR STADIA deep and six across: far enough '
                   'that the far edge lies past the point where the eye resolves anything, '
                   'which is the whole effect')),

    dict(key='wood', name='The Dark Wood', chapter='I',
         gap=STADIUM, depth=st(3), width=st(4), x=0, keys=['wood'],
         gap_src=('ours', 'he enters it off the plain "a pretty way" (Dall. p. 14) — one stadium'),
         size_src=('ours', 'no path in and none out; he wanders right, left, back and forward, '
                   'and it is the Hercynian forest by name. THREE STADIA deep is two minutes of '
                   'walking to cross even going straight, which is the least that can carry '
                   '"could not finde any track or path" for a man who does not. WOODS.md §1')),

    dict(key='spring', name='The Spring and the Stream', chapter='I',
         gap=0, depth=120, width=st(2), x=-260, within='wood', keys=[],
         gap_src=('stated', 'its branches "ran thorow the desart wood" (Dall. p. 15) — it '
                  'touches the wood — so it is placed WITHIN it, at its west edge, and takes no '
                  'length off the itinerary'),
         size_src=('ours', 'high trees close over the water; torrents come down into the plain '
                   'from "high and fertlesse mountaines"')),

    dict(key='great_oak', name='The Great Oak in the Green Mead', chapter='I',
         gap=st(3), depth=st(2), width=st(2), x=90, keys=['great_oak'],
         gap_src=('ours', 'he reaches it only after LOSING the river while chasing the song, so '
                  'it is separated from the water by a wandering, not adjacent to it '
                  '(DIRECTIONS.md §3 #4). Three stadia — the one place before the valley where the '
                  'book insists on distance in words rather than numbers'),
         size_src=('ours', '"a spacious greene mead" — the oak wants a field to stand alone in')),

    dict(key='palm_plain', name='The Palm and the Wolf', chapter='II',
         gap=STADIUM, depth=st(2), width=st(3), x=-60, keys=['palm_plain'],
         gap_src=('ours', 'the second dream begins here; one stadium'),
         size_src=('ours', 'a low rise scattered with trees "growing distantly one from another", '
                   'then a sandy gravelly plain with ONE date palm. The wolf appears on the '
                   'RIGHT — 1499 p. 21, dextra, against Dallington\'s "left" (DIRECTIONS.md §4)')),

    dict(key='valley', name='The Valley of the Approach', chapter='II–III',
         gap=STADIUM, depth=st(10), width=1139.6, x=0, keys=['valley'],
         gap_src=('ours', 'one stadium'),
         size_src=('stated+ours', 'the WIDTH is stated: the valley span is the pyramid\'s base, '
                   '"passi vinti et stadii sei" = 1 139.6 m (1499 l. 905; DIMENSIONS.md §2). The '
                   'LENGTH is ours: the pyramid is ~785 m tall and must first appear as "the '
                   'forme of a tower of an incredible heygth, with a spyre vnperfectlie '
                   'appearing" and then grow "by little and little" over a walk. TEN STADIA: at '
                   '1 850 m an 865 m spire stands about 25° high and grows to fill the sky, '
                   'which is the effect the passage describes. It is the largest single guess '
                   'in this table and the one most worth arguing with')),

    dict(key='piazza', name='The Court before the Porch', chapter='III',
         gap=0, depth=44.4, width=1139.6, x=0, keys=['horse', 'elephant', 'colossus'],
         gap_src=('stated', 'the court stops dead against the porch (Dall. p. 37)'),
         size_src=('stated', '"a fowre square court of thirtie paces by his Diameter" = 44.4 m '
                   'deep (Dall. p. 37); it fills the valley floor cliff to cliff, and its '
                   'colonnades stand at 15 paces = 22.2 m intercolumniation (p. 38). The horse '
                   'is 10 paces in from the court\'s MOUTH (1499 l. 1255), the elephant straight '
                   'forward of him, the colossus 88.8 m long on the fallen west colonnade')),

    dict(key='pyramid', name='The Pyramid-Portal', chapter='III–IV',
         gap=0, depth=1139.6, width=1139.6, x=0, keys=['portal'],
         gap_src=('stated', 'the porch IS the court\'s north side'),
         size_src=('stated', 'base 6 stadia + 20 paces = 1 139.6 m wide; plinth 1 110 m wide and '
                   '20.7 high; the pyramid 1 110 m square and ~785 tall by Colonna\'s own '
                   'construction; 1 410 courses of 0.56 m; total to the nymph ~865 m. Square in '
                   'plan, so its depth is its width. Bury 1998 Appendix; DIMENSIONS.md §2. '
                   '10 paces = 14.8 m of clearance to the cliff on each side')),

    dict(key='wooded_country', name='The Wooded Country and the Bridge', chapter='VI',
         gap=STADIUM, depth=st(4), width=st(5), x=-120, keys=['fields'],
         gap_src=('ours', 'the vaults come out the far side of the pyramid; one stadium'),
         size_src=('ours', '"silvosa contrata circunclusa dall\'arborifera montagna" (1499 '
                   'll. 2800–2813): a wooded district RINGED by a tree-bearing mountain, with the '
                   'bridge whose spring divides right and left. A ring needs its diameter: five '
                   'stadia across and four deep')),

    dict(key='fountain_house', name='The Octagonal Fountain and the Bath', chapter='VI–VII',
         gap=0, depth=120, width=120, x=60, within='wooded_country', keys=['fountain'],
         gap_src=('stated', 'it stands INSIDE the wooded country — "mirai una fabrica marmorea '
                  'tra gli arbori apparendo" (1499 l. 2813), first seen through the trees — so it is '
                  'placed WITHIN that precinct and takes no length off the itinerary'),
         size_src=('ours', 'the book gives the building\'s ornament, not its span')),

    dict(key='cypress_avenue', name='The Cypress Avenue', chapter='VIII',
         gap=STADIUM, depth=740, width=40, x=0, keys=[],
         gap_src=('ours', 'one stadium'),
         size_src=('stated', 'FOUR STADIA = 740 m (Dall. pp. 123–124) — the longest stated '
                   'distance in Book I and the only explicit inter-station measurement in the '
                   'book. Periwinkle over the whole floor of it; closed by a citron-orange-lemon '
                   'hedge 6 ft = 1.78 m thick with a single gate in the middle')),

    dict(key='enclosure', name='The Green Enclosure', chapter='VIII',
         gap=0, depth=88.8, width=88.8, x=0, keys=[],
         gap_src=('stated', 'the avenue\'s hedge-gate opens straight into it (Dall. p. 124)'),
         size_src=('stated', '60 paces = 88.8 m on a side, walled on three sides by the citrus '
                   'fence, "of which the palace is the fourth" (Dall. p. 124)')),

    dict(key='palace', name="Queen Eleuterylida's Palace", chapter='VIII–XI',
         gap=0, depth=st(1.5), width=st(2.5), x=0,
         keys=['court', 'planetary_palace', 'chess', 'artificial', 'quinta_essentia'],
         gap_src=('stated', 'the palace closes the enclosure — it is its fourth side'),
         size_src=('stated+ours', 'stated within it: the queen\'s open court 28 paces = 41.4 m '
                   '(Dall. p. 135), the chessboard 7.1 m plus a 1.48 m border (p. 133), the glass '
                   'cypresses at 2 paces and the box at 1 (p. 175). Each artificial garden is '
                   '"as great as that where the majestic residence stood" (p. 124) — the palace '
                   'plot again, one on each flank, which is what sets the width. This is the '
                   'precinct that has no room today: tickets bug-court-has-no-room-left and '
                   'bug-artificial-gardens-wrong-side-of-portal are both this number')),

    dict(key='polia_garden', name="Polia's Ivied Garden", chapter='XII–XIII',
         gap=STADIUM, depth=141, width=141, x=0, keys=['polia'],
         gap_src=('ours', 'one stadium'),
         size_src=('stated', '100 arches of 3 paces round the garden (Dall. p. 182) = 444 m of '
                   'circumference, so **141 m across**, the arcade 5 paces = 7.4 m high. The '
                   'world gives this station a radius of 7. DIMENSIONS.md §3 calls that single '
                   'number the clearest measure of the compression')),

    dict(key='three_doors', name='The Three Doors', chapter='XIII',
         gap=st(2), depth=st(1), width=st(1.5), x=0, keys=['three_doors'],
         gap_src=('ours', 'reached across "a plentiful seate and pleasant Countrey" (Dall. '
                  'p. 192) — two stadia, because the country is named as a country'),
         size_src=('ours', 'the doors are HEWN OUT OF THE LIVING ROCK in "abrupt and wilesome '
                   'hilly places… without any greene grasse or hearbe" (Dall. p. 192), not a '
                   'free-standing wall. The precinct is the rock face and the stony highland '
                   'before it; Mater Amoris is the middle door and all three must be '
                   'approachable in any order (DIRECTIONS.md §4)')),

    dict(key='triumphs', name='The Four Triumphs', chapter='XIV',
         gap=STADIUM, depth=st(2), width=st(1.5), x=0, keys=['triumphs'],
         gap_src=('ours', 'one stadium'),
         size_src=('ours', 'processional — the cars come TO him, so the ground must be long '
                   'enough for a triumph to arrive along and pass. Each car is drawn by six '
                   'beasts with a riding nymph to each')),

    dict(key='vertumnus', name='Vertumnus, Pomona and the Rite of Priapus', chapter='XV–XVI',
         gap=STADIUM, depth=st(1), width=st(1.5), x=150, keys=['priapus'],
         gap_src=('ours', 'one stadium'),
         size_src=('stated+ours', 'the square enclosure with the palms is quickset 1 pace high '
                   '(Dall. p. 253); the orchard hedge of juniper and box is one pace (ch. XV, '
                   'enumerated 2026-09-17). The precinct itself is ours')),

    dict(key='venus_temple', name='The Temple of Venus Physizoa', chapter='XVII–XVIII',
         gap=STADIUM, depth=st(1), width=st(1), x=-200, keys=['venus_temple'],
         gap_src=('ours', 'one stadium'),
         size_src=('ours', 'the one building in the book given as a RULE rather than a size: a '
                   'circle in a square, height equal to diameter, ten radial divisions '
                   '(pp. 197–199, 204). Its absolute size is therefore a free choice, and one '
                   'stadium is chosen so that it sits between the green enclosure and the '
                   'theatre without outbuilding either')),

    dict(key='polyandrion', name='The Polyandrion', chapter='XIX',
         gap=STADIUM, depth=st(1), width=st(1), x=230, keys=['polyandrion'],
         gap_src=('ours', 'a DIGRESSION — ruins off the road (p. 247), so it sits aside from the '
                  'spine as well as along it'),
         size_src=('ours', 'entered through a broken pier and a little door choked with ivy')),

    dict(key='shore', name='The Shore, and Cupid\'s Boat', chapter='XX',
         gap=STADIUM, depth=st(0.5), width=st(4), x=0, keys=['cythera'],
         gap_src=('ours', 'one stadium'),
         size_src=('ours', 'the beach and the six-oar exeres. The gunwales are 2 ft above the '
                   'decking and the thwarts 1½ (p. 291); no length is given')),

    dict(key='crossing', name='The Crossing', chapter='XX',
         gap=0, depth=st(6), width=st(10), x=0, keys=[],
         gap_src=('stated', 'the water begins at the beach'),
         size_src=('ours', 'no distance is given — but the DURATION is the fact: the crossing '
                   'fills a whole chapter of song (DIRECTIONS.md §3 #24). SIX STADIA is about four '
                   'minutes under oars, which is a chapter')),

    dict(key='cythera', name='The Island of Cythera', chapter='XXI–XXIV',
         gap=0, depth=1400, width=1400, x=0,
         keys=['cythera_isle', 'cythera_theatre', 'adonis'],
         gap_src=('stated', 'the boat lands on it'),
         size_src=('stated', 'a perfect circle: circumference 3 miliaria = 4 440 m, diameter '
                   '≈ 1 400 m by Colonna\'s own π (pp. 292, 297). Three concentric rings of '
                   '166 paces 10 palms = 246.8 m each, twenty radial divisions, a citrus '
                   'espalier 8 paces = 11.8 m high dividing the rings. At its centre the '
                   'theatre: Area 47.4 m across inside a built ring 11.8 m thick (p. 351). '
                   'Adonis\'s hexagonal fountain, 53.3 m round, is in the inner ring')),

    # Off the spine entirely — Book II is a told place, and DECISIONS.md 55 makes it a real one.
    dict(key='treviso', name='Treviso — Polia\'s City', chapter='XXV–XXXVIII',
         gap=None, depth=st(4), width=st(4), x=1400, z=-600, keys=['book_two'],
         gap_src=('ours', 'NOT on the itinerary. Book II is Polia telling her own history, so '
                  'Treviso is not somewhere Poliphilo walks to — it is reached from the '
                  'book_two station and sits off the spine, east of the island'),
         size_src=('ours', 'the temple of Diana, Polia\'s bed-chamber and its window, the '
                   'streets, the plague, the river Sile — which IS her father, transformed '
                   '(ch. XXV, enumerated 2026-09-17). The book gives no measurement anywhere in '
                   'these fourteen chapters: chapters XXV, XXVIII and XXXII state none at all')),
]


def current_stations():
    """The world as it stands — parsed out of HP_STATIONS so the offsets are real."""
    import re
    src = CONSTANTS.read_text(encoding='utf-8')
    block = src[src.index('export const HP_STATIONS'):src.index('export const PIAZZA')]
    out = {}
    pat = re.compile(r"\{\s*key:\s*'([a-z_]+)'.*?pos:\s*\[\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\]", re.S)
    for m in pat.finditer(block):
        out[m.group(1)] = (float(m.group(2)), float(m.group(3)))
    return out


def build():
    stations = current_stations()
    # The anchor: the FRONT OF THE PORCH is z = 0. Walk the spine south from it to lay out
    # everything before the portal, then north from it for everything after.
    spine = [p for p in PRECINCTS if p.get('z') is None and not p.get('within')]
    i_anchor = next(i for i, p in enumerate(spine) if p['key'] == 'pyramid')

    # northward (after the porch): the pyramid's own base runs from z 0 to z -1139.6
    z = 0.0
    for p in spine[i_anchor:]:
        z -= p['gap'] or 0
        p['z_south'] = z
        z -= p['depth']
        p['z_north'] = z
        p['z'] = (p['z_south'] + p['z_north']) / 2

    # southward (before the porch), in reverse
    z = 0.0
    for p in reversed(spine[:i_anchor]):
        nxt_gap = spine[spine.index(p) + 1]['gap'] or 0
        z += nxt_gap
        p['z_north'] = z
        z += p['depth']
        p['z_south'] = z
        p['z'] = (p['z_south'] + p['z_north']) / 2

    # Precincts that sit INSIDE another -- the spring in the wood, the fountain-house in
    # the wooded country, because the book puts them there -- take their host's z and no
    # length of their own off the itinerary.
    hosts = {q['key']: q for q in PRECINCTS}
    for q in PRECINCTS:
        if q.get('within'):
            h = hosts[q['within']]
            q['z'] = h['z']
            q['z_south'] = h['z'] + q['depth'] / 2
            q['z_north'] = h['z'] - q['depth'] / 2

    out = {
        'note': ('The true-scale ground plan. Generated by scripts/plan_build.py — do not hand '
                 'edit; edit the PRECINCTS table there and re-run. DECISIONS.md 2026-09-17 '
                 'call 54.'),
        'anchor': ('the front of the porch of the Great Portal, z = 0 — the book\'s own hinge, '
                   'where "no man could go further forward or backe againe" (Dall. p. 27)'),
        'compass': '+z SOUTH, -z NORTH, +x EAST, -x WEST; Poliphilo walks northward',
        'default_gap_m': STADIUM,
        'default_gap_rule': ('one stadium of clear ground between precinct edges wherever the '
                            'book states no distance'),
        'precincts': [],
    }

    for p in PRECINCTS:
        rec = {
            'key': p['key'], 'name': p['name'], 'chapter': p['chapter'],
            'centre': [p['x'], round(p['z'], 1)],
            'depth_m': p['depth'], 'width_m': p['width'],
            'z_south': round(p['z_south'], 1) if 'z_south' in p else None,
            'z_north': round(p['z_north'], 1) if 'z_north' in p else None,
            'gap_m': p['gap'],
            'gap_source': {'kind': p['gap_src'][0], 'why': p['gap_src'][1]},
            'size_source': {'kind': p['size_src'][0], 'why': p['size_src'][1]},
            'within': p.get('within'),
            'stations': p['keys'],
            'offsets': {},
        }
        for k in p['keys']:
            if k in stations:
                ox, oz = stations[k]
                rec['offsets'][k] = {'from': [ox, oz], 'precinct_centre': rec['centre']}
        out['precincts'].append(rec)

    inside = {q['key'] for q in PRECINCTS if q.get('within')}
    spine_only = [p for p in out['precincts']
                  if p['z_south'] is not None and p['key'] not in inside]
    out['extent'] = {
        'z_south': max(p['z_south'] for p in spine_only),
        'z_north': min(p['z_north'] for p in spine_only),
        'width_max': max(p['width_m'] for p in out['precincts']),
    }
    out['extent']['length_m'] = round(out['extent']['z_south'] - out['extent']['z_north'], 1)

    OUT_JSON.write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    # ── the human-readable half ──
    L = []
    L.append('<!-- generated by scripts/plan_build.py — do not hand-edit -->')
    L.append('# The true-scale ground plan\n')
    L.append('*Generated from the PRECINCTS table in `scripts/plan_build.py`. '
             'DECISIONS.md 2026-09-17 call 54: the world is rebuilt at the book\'s own scale, '
             'and the plan is settled as data before any geometry moves, so that no precinct is '
             'moved twice.*\n')
    L.append(f'**Anchor:** {out["anchor"]}  ')
    L.append(f'**Compass:** {out["compass"]}  ')
    L.append(f'**The rule for an unstated gap:** {out["default_gap_rule"]} '
             f'({STADIUM:.0f} m).\n')
    L.append(f'**The world this produces:** {out["extent"]["length_m"]:,.0f} m along the '
             f'itinerary, {out["extent"]["width_max"]:,.0f} m at its widest. '
             f'Today the whole mainland is 77 × 105 m.\n')
    L.append('| ch. | precinct | gap before | depth | width | centre z | stated? |')
    L.append('|---|---|---:|---:|---:|---:|---|')
    for p in out['precincts']:
        gap = '—' if p['gap_m'] is None else f'{p["gap_m"]:,.0f}'
        z = '—' if p['z_south'] is None else f'{p["centre"][1]:,.0f}'
        L.append(f'| {p["chapter"]} | **{p["name"]}** | {gap} | {p["depth_m"]:,.0f} | '
                 f'{p["width_m"]:,.0f} | {z} | {p["size_source"]["kind"]} |')
    L.append('\n## Why each number is what it is\n')
    for p in out['precincts']:
        L.append(f'### {p["name"]} — ch. {p["chapter"]}\n')
        L.append(f'*{p["depth_m"]:,.0f} m deep, {p["width_m"]:,.0f} m wide.*\n')
        L.append(f'- **size ({p["size_source"]["kind"]})** — {p["size_source"]["why"]}')
        L.append(f'- **gap ({p["gap_source"]["kind"]})** — {p["gap_source"]["why"]}')
        if p['stations']:
            L.append(f'- **stations** — {", ".join("`" + s + "`" for s in p["stations"])}')
        L.append('')
    OUT_MD.write_text('\n'.join(L) + '\n', encoding='utf-8')

    print(f'wrote {OUT_JSON.relative_to(ROOT)} and {OUT_MD.relative_to(ROOT)}')
    print(f'  {len(out["precincts"])} precincts')
    print(f'  itinerary {out["extent"]["length_m"]:,.0f} m long, '
          f'{out["extent"]["width_max"]:,.0f} m at its widest')
    stated = sum(1 for p in out['precincts'] if 'stated' in p['size_source']['kind'])
    print(f'  {stated} of {len(out["precincts"])} precinct sizes come from the book')


if __name__ == '__main__':
    build()
