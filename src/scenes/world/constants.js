// constants.js — the world's shared tables.
//
// Lifted out of HPWorldScene.js on 2026-09-09, ahead of splitting that file. It
// was 791 KB and ~194 000 tokens in one class, which meant no agent could read
// the world and, under ORCHESTRATION.md's one-writer-per-file rule, no two
// agents could ever work on it at once. See ENGINEERING.md §2c.
//
// Everything here is DATA. No function in this file touches the scene. The
// modules that will hold the builders import from here rather than from
// HPWorldScene.js, because a cycle back to the class would be fragile in this
// repo in a way it is not in most: every import carries a `?v=`, and two
// versions of one path are two modules with separate state.
//
// HPWorldScene keeps its `static get WOOD()` and friends, now returning these,
// so any outside caller is unaffected.

// (no three.js import: everything in this file is plain data. If a table ever
// needs a THREE type, import it here rather than reaching for the class.)

// pos/look are [x, z] on the ground plane; folio feeds the HUD and the research links.
// The first nine are reachable with digit keys 1–9 (journey order).
//
// ── THE COMPASS (declared 2026-09-08; DIRECTIONS.md §2) ────────────────────
// The book gives no bearing for the itinerary, but it does give the sun: dawn
// at the outset, "el meridionale aesto" in the wood, and a pyramid dedicated to
// the Sun whose stair takes light from the "Orientall Meridionall and
// Occidentall partes of the ayre". The world's key light has always sat at
// (16, 22, 10) — high, to +x and +z — so:
//
//        +z is SOUTH        −z is NORTH        +x is EAST        −x is WEST
//
// Poliphilo therefore walks NORTHWARD out of the wood, with the sun behind his
// right shoulder, and the Great Portal's façade faces south into it. His RIGHT
// HAND is +x and his LEFT is −x, which is what puts the wolf at −x (Dall. p. 23)
// and the Medusa door at +x (p. 31). This used to be implicit and every siting
// argument in this table leaned on it unstated.
export const HP_STATIONS = [
  // Moved 2026-09-08 from [0, 45] — eight metres from the Great Portal — into
  // the middle of the rebuilt wood, 190 m of Hercynian deep. See _buildWood.
  { key: 'wood',             name: 'The Dark Wood',          folio: 2,
    pos: [0, 340],    look: [0, 318],  radius: 16 },
  { key: 'portal',           name: 'The Great Portal',       folio: 13,
    pos: [0, 37],     look: [0, 26],   radius: 7, pitch: 0.2 },
  { key: 'court',            name: 'The Court of Queen Eleuterylida', folio: 62,
    pos: [-10.4, 23.8], look: [-23.5, 18.5], radius: 9 },
  { key: 'three_doors',      name: 'The Three Doors',        folio: 119,
    pos: [0, 21],     look: [0, 12],   radius: 6, pitch: 0.05 },
  // MOVED 2026-09-09 (DECISIONS.md call 51) out of the garden and into the
  // piazza, where chapter III puts it: *"non troppo distante dal magno caballo,
  // ad libella"* (1499 l. 1385), which Dallington renders "not farre distant
  // from the horse straight forward" (p. 46). It stood at [0, 6.5], PAST the
  // Great Portal, so the tour's own order crossed the gate three times.
  { key: 'elephant',         name: 'The Elephant & Obelisk', folio: 25,
    pos: [7, 49],     look: [7, 42],   radius: 6 },
  { key: 'planetary_palace', name: 'The Planetary Palace',   folio: 88,
    pos: [-11.5, 0],  look: [-20, 0],  radius: 9 },
  { key: 'quinta_essentia',  name: 'The Obelisk of the Trinity', folio: 119,
    pos: [13, 0],     look: [21, 0],   radius: 8 },
  { key: 'fountain',         name: 'Fountain of Venus',      folio: 80,
    pos: [0, -10.5],  look: [0, -20],  radius: 8, pitch: 0.16 },
  { key: 'cythera',          name: 'The Shore to Cythera',   folio: 193,
    pos: [0, -33],    look: [0, -46],  radius: 8 },
  // Discoverable, not on the digit row:
  // Chapters XVII–XVIII, fifteen plates. It stands west of the grove with the
  // sea and Cythera behind it, which is the direction the pilgrims leave in.
  { key: 'venus_temple',     name: 'The Temple of Venus',    folio: 205,
    pos: [-30, -12], look: [-30, -21], radius: 9 },
  { key: 'labyrinth',        name: 'The Water Labyrinth',    folio: 177,
    pos: [-29.2, 34], look: [-44, 34], radius: 12 },   // outside the basin, beside the viewing mount
  // MOVED AND TURNED 2026-09-09 (DECISIONS.md call 51). He used to lie EAST-WEST
  // at (36, 4), past the portal. He now lies ALONG the valley on the piazza's
  // west side, feet at z 72 and head at z 44 -- which is the book's own approach,
  // since Poliphilo meets "the feete thereof bare, and their soles hollowe" and
  // only "from thence" comes to the head (Dall. p. 44). The mouth opens north,
  // so the station stands between the porch and the mouth and looks back into it.
  { key: 'colossus',         name: 'The Colossus',           folio: 34,
    pos: [-19, 35],  look: [-19, 41],  radius: 10 },
  { key: 'priapus',          name: 'The Rite of Priapus',    folio: 185,
    pos: [44, -12],  look: [44, -6],   radius: 7 },
  { key: 'book_two',         name: "Book II — Treviso",      folio: 387,
    pos: [44, 32],   look: [44, 22],   radius: 12 },
  { key: 'polia',            name: "Polia's Garden",         folio: 143,
    pos: [14.5, 23.5], look: [19, 19.5], radius: 7 },
  { key: 'triumphs',         name: 'The Four Triumphs',      folio: 158,
    pos: [5.5, -4.5], look: [10.6, -9.4], radius: 5 },
  { key: 'polyandrion',      name: 'The Polyandrion',        folio: 242,
    pos: [23, -22], look: [30, -27], radius: 9 },
  // The island itself — reached by Cupid's boat (digit 0), returned from by 9:
  { key: 'cythera_isle',     name: 'The Gardens of Cythera', folio: 290,
    pos: [0, -104], look: [0, -150], radius: 13 },
  { key: 'cythera_theatre',  name: 'The Theatre of Venus',   folio: 358,
    pos: [0, -133.5], look: [0, -150], radius: 11, pitch: 0.05 },
  // The last station of Book I (ch. XXIV, our pp. 370-379). It has no woodcut,
  // which is why the tour's stop 25 pointed at the theatre's floor for months:
  // every coverage check ran off the plate catalogue. See ROUTER.md rule 6.
  { key: 'adonis',           name: 'The Fountain of Adonis', folio: 370,
    pos: [20.34, -122.01], look: [24.69, -116.02], radius: 8 },
  // Appended after the island so the digit keys 1-9 keep their journey order.
  // The chess ballet is at signature g8r-h1r, facsimile pages 111-113 — the
  // Queen's entertainment after the banquet, and the last thing that happens
  // at her palace before Logistica and Thelemia lead the dreamer away.
  { key: 'chess',            name: 'The Human Chess Match',  folio: 111,
    pos: [-32.5, 6], look: [-40, 6], radius: 8 },
  // The first monument of the piazza. MOVED 2026-09-09 (DECISIONS.md call 51)
  // from [10.5, 22.5], which was past the Great Portal. The 1499 sites him
  // exactly: *"Sopra di questa piacia, dal'initio intro verso la porta x passi,
  // vidi uno prodigioso caballo"* (l. 1255) -- upon this piazza, from its start
  // inward toward the gate, ten paces. The piazza runs z 70.4 -> 26, so ten
  // paces (14.8 m) in from its start is z 55.6.
  { key: 'horse',            name: 'The Winged Horse',       folio: 22,
    pos: [7, 62],      look: [7, 55.6],    radius: 6 },
  // Second nature (GARDENS.md 2), built 2026-09-07: the worked countryside
  // Poliphilo comes into after the vaults -- "a fayre and plentifull countrie,
  // fruitefull fieldes, and fertile groundes" (Dallington p. 90). It lies west
  // north-west of the dark wood, so that coming out of the wilderness you come
  // into worked land: first nature into second, which is Hunt's whole point.
  { key: 'fields',           name: 'The Fruitful Fields',    folio: 90,
    // Moved 2026-09-09. It stood at (-40, 41) facing north, which put the flank
    // of the valley mountain 2.4 m from the eye -- measured by raycast, after
    // seven sweeps missed it because they all discarded meshes over 200 m wide
    // and the mountain is 250. Half the view was dark rock.
    // The eastern edge was tried first and was worse in a different way: 28.5 m
    // of clear view, all of it the GLASS GARDEN, which overlaps the worked belt
    // from x -41.2 to -17.6. The belt is pinched between the mountain on the
    // west and the artificial garden on the east.
    // So it now stands just NORTH of the belt and looks south along it, which
    // is the only aspect where all three of south, south-west and south-east
    // hit worked ground and neither rock nor glass. Modest rather than grand:
    // about 7 m to the nearest furrow. See ticket bug-fields-dark-wedge.
    pos: [-24, 64],  look: [-24, 52],  radius: 12 },
  // The southern approach, built 2026-09-08 (DIRECTIONS.md §3). Appended, so
  // the digit keys 1–9 keep their journey order.
  { key: 'great_oak',        name: 'The Great Oak',          folio: 20,
    pos: [9, 178],   look: [9, 193],   radius: 14 },
  { key: 'palm_plain',       name: 'The Palm and the Wolf',  folio: 23,
    pos: [-6, 141],  look: [-9, 128],  radius: 13 },
  { key: 'valley',           name: 'The Valley of the Approach', folio: 24,
    pos: [0, 104],   look: [0, 60],    radius: 14, pitch: 0.04 },
  // Where the dream opens (Dall. p. 14), and where the player now wakes —
  // DECISIONS.md 2026-09-09 call 2: *"we need to be following the novel to the
  // letter."* Chapter I walks the plain FIRST and enters the wood off it; the
  // world had been waking the dreamer in the middle of the wood since it was
  // built, which was the convenient order and not the book's. He looks north,
  // the way he goes — *"I directed my course still forward"* — which is toward
  // the wood. See _buildSpaciousPlain.
  //
  // APPENDED, like the three approach stations above it, so that the digit keys
  // 1–9 keep the journey order they have always had. The first station in the
  // BOOK is deliberately not the first entry in this array; `wood` stays at
  // index 0 because `onDigit` maps HP_STATIONS[n-1] and a reader's muscle
  // memory for "1 is the dark wood" outranks the ledger's tidiness.
  //
  // Radius 26 because there is no landmark to stand at. That is the point of
  // the place: it is composed absence, and a 6 m trigger on an empty plain
  // would simply never fire.
  { key: 'plain',            name: 'The Spacious Plain',     folio: 14,
    pos: [0, 448],   look: [0, 424],   radius: 26 },
  // The gardens of glass and of silk (chs. XII–XIII), north-west of the court.
  // Built 2026-09-09 AGAINST Hunt's argument that they should not be — see
  // _buildArtificialGardens, and the note at this stop, which is not optional.
  // Moved with the gardens themselves on 2026-09-09: they stood inside the
  // piazza of chapter III. See _buildArtificialGardens for why this is a
  // holding position and not the right one.
  { key: 'artificial',       name: 'The Gardens of Glass and Silk', folio: 152,
    pos: [-21.5, 82],  look: [-30, 82],  radius: 9 },
];

// ── THE PIAZZA (chapter III; built 2026-09-09) ───────────────────────────
// Dallington p. 37: before the porch, "in the open ayre there was a fowre square
// court of thirtie paces by his Diameter, paued with pure fine marble, poynted
// fowre square, wrought checkerwise". Thirty paces is 44.4 m (DIMENSIONS.md),
// which is almost exactly the width of the valley's neck -- so the court fills
// the floor between the cliffs and stops dead against the porch at z = 26.
//
// Its outermost parts carry the two areostyle colonnades of Dall. p. 38,
// "beginning on both sides equall to the Lymbus or extreame part of the fronte
// of the porche" and running away toward the mountains, 15 paces (22.2 m)
// between pillar and pillar. The EAST row still stands; the WEST row is the
// "heape of ruinated, broken and downe-fallen marbles" Poliphilo climbs to
// reach the colossus (p. 44), which is why its drums lie where they lie.
export const PIAZZA = {
  z0: 26,          // flush with the front of the porch
  side: 44.4,      // thirty paces
  get z1() { return this.z0 + this.side; },        // 70.4, the court's mouth
  get halfX() { return this.side / 2; },           // 22.2
  intercol: 22.2,  // fifteen paces
  colX: 21,        // the rows, set just inside the outermost edge
};

export const EYE = 1.7;

export const METALS = [
  { name: 'Saturn',  metal: 'Lead',        glyph: '♄', color: 0x55555e, emissive: 0x111114, metalness: 0.5,  rough: 0.6 },
  { name: 'Jupiter', metal: 'Tin',         glyph: '♃', color: 0x9aa0a8, emissive: 0x1a1c20, metalness: 0.7,  rough: 0.4 },
  { name: 'Mars',    metal: 'Iron',        glyph: '♂', color: 0x9a3a28, emissive: 0x3a0a04, metalness: 0.6,  rough: 0.5 },
  { name: 'Sol',     metal: 'Gold',        glyph: '☉', color: 0xffd24a, emissive: 0x6a4a00, metalness: 1.0,  rough: 0.15 },
  { name: 'Venus',   metal: 'Copper',      glyph: '♀', color: 0xc06a3a, emissive: 0x2a1004, metalness: 0.8,  rough: 0.35 },
  { name: 'Mercury', metal: 'Quicksilver', glyph: '☿', color: 0xc8d2da, emissive: 0x202428, metalness: 1.0,  rough: 0.10 },
  { name: 'Luna',    metal: 'Silver',      glyph: '☽', color: 0xe2e2ea, emissive: 0x222228, metalness: 0.95, rough: 0.2 },
];

// The three gates as the book letters them (Dallington 1592; see
// docs/HP_SOURCEBOOK.md §4). Poliphilo's right hand carries Theodoxia, his left
// Cosmodoxia, "and the thirde, Erototrophos" — so MATER AMORIS is the middle
// door, and it is the one he chooses. Each is titled on the plate in Greek,
// Latin, Hebrew and Arabic; we give the Greek and the Latin.
export const DOORS = [
  { x: -4.6, w: 2.0, h: 3.3, title: 'Gloria Dei',   greek: 'ΘΕΟΔΟΞΙΑ',     sub: 'THEODOXIA · THE STEEP ASCENT',
    keeper: 'Thende',     color: 0x8ab0d8 },
  { x:  0.0, w: 2.4, h: 3.9, title: 'Mater Amoris', greek: 'ΕΡΩΤΟΤΡΟΦΟΣ',  sub: 'EROTOTROPHOS · THE CHOSEN GATE',
    keeper: 'Philtronia', color: 0xd86a5a },
  { x:  4.6, w: 2.0, h: 3.3, title: 'Gloria Mundi', greek: 'ΚΟΣΜΟΔΟΞΙΑ',   sub: 'COSMODOXIA · THE GLORY OF THE WORLD',
    keeper: 'Euclelia',   color: 0xb8a848 },
];

export const ELEMENTS = [
  { deg: 117, title: 'Earth', sub: 'TERRA', color: 0x6a7a3a },
  { deg: 159, title: 'Water', sub: 'AQUA',  color: 0x3a7ab0 },
  { deg: 201, title: 'Air',   sub: 'AER',   color: 0xc8cca0 },
  { deg: 243, title: 'Fire',  sub: 'IGNIS', color: 0xe06028 },
];

// The five nymphs of the senses who receive Poliphilo at the bath (their
// names are the Greek senses, as given in the book).
// Each carries the object by which the book identifies her: "she that carrieth
// the boxes and white cloathes Offressia. This other with the shining Glasse …
// Orassia. Shee that carrieth the sounding Harpe is called Achol, and shee that
// beareth the casting bottle of precious Lyquor … Genshra." Aphea, who is Touch,
// carries nothing — she is the one who says "giue mee thy hand."
// (Dallington 1592; docs/HP_SOURCEBOOK.md §3.)
export const SENSE_NYMPHS = [
  { name: 'Aphea',     sense: 'Touch',   robe: 0xc88a9a, attribute: null,     pose: 'offer' },
  { name: 'Osfressia', sense: 'Smell',   robe: 0x9ab08a, attribute: 'casket' },
  { name: 'Orassia',   sense: 'Sight',   robe: 0x8a9ac8, attribute: 'mirror' },
  { name: 'Achoe',     sense: 'Hearing', robe: 0xc8b06a, attribute: 'harp' },
  { name: 'Geussia',   sense: 'Taste',   robe: 0xb08ac0, attribute: 'flask' },
];

// Each car is drawn by SIX beasts, not a pair, and every beast carries a riding
// nymph musician: "the two next the Tryumph were apparelled in blewe silke, like
// the collour of a Peacockes necke. The middlemost in bright Crymosen: and the
// two formost in an Emerald greene." Europa's team is centaurs got of Ixion,
// Leda's six white elephants coupled two and two, and the mystical car goes
// "very leisurely" behind six leopards in vine-withes.
// (Dallington 1592; docs/HP_SOURCEBOOK.md §5.)
export const TRIUMPH_LIVERY = [0x2a5aa0, 0x2a5aa0, 0xc02840, 0xc02840, 0x1e8a54, 0x1e8a54];

// The four cars, corrected against the plates themselves (hp.db.woodcut_catalog
// #47-48, #52-53, #57/#59, #64-65). Two were wrong:
//
//   · Danaë's car is drawn by UNICORNS, not horses (#57, "Third Triumph of
//     Danae: unicorns").
//   · The fourth is not a "Triumph of Semele" at all. It is the FESTIVAL OF
//     BACCHUS (#64-65), drawn by panthers, with Silenus riding his ass behind.
//     Semele is Bacchus's mother and appears in that car's RELIEFS (#58,
//     "Jupiter and Semele") — she does not get a triumph of her own. The car
//     was named for a panel on its side.
//
// PROCESSIONS.md calls the fourth "the mystical car" with six leopards, "spotted
// beasts of yealow shining colour"; panther and leopard are the same beast in
// period usage, so the team stands and only the title was wrong.
// The panels on each car's four faces, from the plates themselves
// (hp.db.woodcut_catalog #44-46, #49-51, #54-56, #58/#60-62) and, for Europa,
// from PROCESSIONS.md §2 which reads them in order. The last of Europa's is the
// one that matters: Mars before Jupiter, showing the wound in his impenetrable
// breastplate and holding the word NEMO — no one is exempt.
export const TRIUMPH_RELIEFS = {
  europa: [
    { scene: 'The nymph crowning the bulls' },
    { scene: 'The ride over the sea' },
    { scene: 'Cupid shooting among the wounded nations' },
    { scene: 'Mars before Jupiter, showing the wound', word: 'NEMO' },
  ],
  leda: [
    { scene: 'Leda lying-in' },
    { scene: 'The eggs presented' },
    { scene: 'The king offering eggs at the Temple of Apollo' },
    { scene: 'The Judgment of Paris' },
  ],
  danae: [
    { scene: 'Acrisius, and the building of the tower' },
    { scene: 'Perseus with the mirror and the Medusa head' },
    { scene: 'Venus and Mars freed' },
    { scene: 'Jupiter comforts Cupid' },
  ],
  bacchus: [
    { scene: 'Jupiter and Semele' },
    { scene: 'Jupiter commits the infant Bacchus to Mercury' },
    { scene: 'Venus and Cupid before Jupiter' },
    { scene: 'Psyche with the lamp' },
  ],
  // The FOUR SEASONS (#67-70) sit immediately after Vertumnus and Pomona in the
  // plates, and they are that car's own iconography: Vertumnus is the god of the
  // turning year, Pomona of orchard fruit. The seasons belong on their car.
  vertumnus: [
    { scene: 'Spring — Venus and Cupid',      word: 'VER' },
    { scene: 'Summer — Ceres with the boy',   word: 'AESTAS' },
    { scene: 'Autumn — the Wine God with the ram', word: 'AVTVMNVS' },
    { scene: 'Winter — Jupiter Pluvius',      word: 'HIEMS' },
  ],
};

export const TRIUMPHS = [
  { key: 'europa',  title: 'Triumph of Europa',    motif: 'bull',  team: 'centaur',  pos: [10.6, -9.4],   color: 0xc8a040 },
  { key: 'leda',    title: 'Triumph of Leda',      motif: 'swan',  team: 'elephant', pos: [-10.6, -9.4],  color: 0xb0c0d8 },
  { key: 'danae',   title: 'Triumph of Danaë',     motif: 'gold',  team: 'unicorn',  pos: [-10.6, -30.6], color: 0xe0c060 },
  { key: 'bacchus', title: 'Festival of Bacchus',  motif: 'fire',  team: 'leopard',  pos: [10.6, -30.6],  color: 0xd86a3a },
  // The fifth procession (#66, "Triumph of Vertumnus and Pomona: satyrs,
  // nymphs"). It did not exist in the world at all. The plate names no draught
  // beast — this is the rustic triumph, ACCOMPANIED by satyrs and nymphs on
  // foot rather than drawn by exotic teams — so it walks with its company.
  { key: 'vertumnus', title: 'Triumph of Vertumnus and Pomona', motif: 'fruit',
    team: 'satyr', onFoot: true, pos: [0, -34.2], color: 0x8aa04a },
];

// Is `o` inside `root`? Used to keep the acting Poliphilo out of the roll-up
// census: he animates, so he is never merged, and a ball that swallowed him
// would be slicing vertices out of a lump he was never folded into.
export function isDescendantOf(o, root) {
  for (let p = o; p; p = p.parent) if (p === root) return true;
  return false;
}

  // ── Chapter I: the dark wood, and chapter II's approach ──────────────────
  //
  // Rebuilt 2026-09-08 from the research pass (WOODS.md §1, DIRECTIONS.md §3),
  // after Ted: *"the world of our virtual dream garden is too small … the trees
  // of the wood dark enough to tower over our hero and cast enough shadows to
  // make it dark."*
  //
  // What was here was a 70 × 22 m strip of 64 trees six to eleven metres tall,
  // with a 5.4 m path cut through it. Three things were wrong, and all three
  // are settled by the book's own words:
  //
  //   * THE SPECIES. The 1499 (ll. 555–563) names "el silvano fraxino ingrato
  //     alle vipere, ulmi ruvidi alle foecunde vite grati, corticosi subderi
  //     apto additamento muliebre, duri cerri, forti roburi et glandulose
  //     querce et ilice" — ash, elm, cork oak, Turkey oak, durmast, acorn-oak,
  //     holm oak. FIVE OF THE SEVEN ARE OAKS, and there is no beech and no fir.
  //     Dallington's "soft Beeche" and "browne Hasils" render *querce* and
  //     *ilice*; his "harde Ebony" renders *duri cerri*. The fir came from the
  //     proem's WINTER SIMILE (l. 475 — the winds that bend the fir "sotto gli
  //     corni di tauro lascivianti", under the horns of the wanton Bull, which
  //     is the zodiac sign and dates the dream to late April) and never
  //     belonged in the wood at all. Conifers are on the mountain slopes of
  //     ch. VI, where Colonna actually puts them.
  //   * THE CANOPY. "…che al roscido solo non permettevano gli radii del
  //     gratioso sole integramente pervenire, ma, come da CAMURATO CULMO di
  //     densante fronde coperto, non penetrava l'alma luce" — as if roofed by a
  //     VAULT of thickening foliage, the kindly light did not get through.
  //     Colonna uses the architectural word for a vault. So the crowns close
  //     overhead and the floor is in shadow; and on coming out, Poliphilo's
  //     eyes, "vsed to such obumbrated darkenes, could scarse abide to behould
  //     the light" (Dall. p. 17). The dazzle on leaving is the proof.
  //   * THE PATH. "could not finde any track or path, eyther to direct me
  //     forward, or lead me back againe" (Dall. p. 15). There is none now. The
  //     way out is the book's own instrument, the only navigational advice in
  //     the whole text: "the keeping of the sunne still vpon one side, to
  //     direct mee streight forwarde". The sun is at (16, 22, 10) — south-east
  //     under the compass frame this world now declares — so its shafts fall
  //     through the clearings toward the north-west, and a walker who keeps
  //     them on one shoulder leaves by the north edge. See _woodClearings.
  //
  // Poliphilo names the place: he begins "ragionevolmente suspicare et
  // crederme pervenuto nella VASTISSIMA HERCYNIA SILVA" (l. 563). Fabiani
  // Giannetto (Word & Image 31.2, 2015, p. 4) notes the Hercynian forest was
  // known to historians and geographers as "the largest and most impenetrable
  // of all forests in Europe". It is 200 × 195 m here — a region to be lost
  // inside, not a screen walked past.

  // The wood's own extent, so the duff, the trees, the clearance map and the
  // meadow all agree about where it is.
export const WOOD = { x0: -100, x1: 100, z0: 225, z1: 420 };

  // Five clearings where the canopy opens and the sun reaches the floor. These
  // are the wood's ONLY navigational information, and they are deliberate: with
  // no path and no sightline, the shafts are how a walker recovers the sun's
  // bearing and walks out of the Hercynian. Seeded, so the wood is the same
  // wood every time and can be learned.
export const WOOD_CLEARINGS = [[-58, 262, 13], [24, 296, 11], [-16, 340, 15], [62, 372, 12], [-44, 398, 10]];

  // ── POLIPHILO, ACTING ─────────────────────────────────────────────────────
  //
  // Ted, 2026-09-09: he wants the reader "looking at modeled versions of
  // everything described in the text, and seeing a Polyphilo figure acting out
  // his reactions."
  //
  // WHY A SECOND POLIPHILO IS NOT ODD. In free walk you are Poliphilo, so a
  // Poliphilo standing in front of you looks at first like a duplication. It is
  // the book's own convention: **the 1499 cuts draw Poliphilo inside almost
  // every scene**, usually at the edge, usually smaller than the wonder, always
  // looking at it. The plates do not show you what he saw; they show you him
  // seeing it. A figure at the edge of each station, posed to what he says
  // there, is the woodcut's staging and not a mistake.
  //
  // WHAT HE DOES. `src/data/poliphilo.json` already catalogues every utterance
  // in the book with its station, its kind, and — the useful part — its
  // OCCASION, the sentence saying what he was doing when he said it. Seventeen
  // stations have one. So the data for "what does he react to, and how" was
  // written months ago and has been sitting unused: this reads it and stands him
  // accordingly.
  //
  // HOW IT IS DONE, per HUMANOIDS.md §4: authored poses, non-linear easing, and
  // gaze — in that order of value, and no rig. A rig would let him move; what
  // makes a still figure read as alive is that its face is not square to its own
  // chest and that it arrives at a pose rather than snapping to it.
  //
  // He is deliberately absent from Roll Up (you are a ball), from Fly (you are a
  // dragon) and from the Dream (you are him, and the mode says so).

  // Each pose is: the two arm pivots as [rotation.z, rotation.x], then the lean
  // of the whole body, the head's tilt and its turn. Arms are mirrored in sign,
  // so a positive z on the left and a negative on the right both mean "away
  // from the body" — which is why every entry below looks asymmetrical and is
  // not. The asymmetry that matters is in `head` and `lean`.
export const WITNESS_POSES = {
  // Standing in the open with nothing in it, counting what is not there.
  lost:      { L: [0.34, 0.10], R: [-0.28, 0.05], lean: -0.03, tilt: 0.05, turn: 0.55 },
  // "my hast in getting foorth was much hyndered": one arm up against the
  // boughs, the other pushing them aside.
  warding:   { L: [1.95, -0.75], R: [-0.95, -0.35], lean: 0.10, tilt: -0.16, turn: -0.30 },
  // His own sigh comes back off the stone and he stops to hear it.
  listening: { L: [0.30, 0.06], R: [-1.62, -0.55], lean: -0.05, tilt: 0.14, turn: 0.42 },
  // Reading something written high up, or very small, or in Chaldean.
  reading:   { L: [0.55, -0.30], R: [-0.50, -0.28], lean: -0.14, tilt: -0.34, turn: 0.10 },
  // The four wonders of the piazza, all at once.
  wonder:    { L: [2.05, -0.35], R: [-2.05, -0.35], lean: -0.11, tilt: -0.26, turn: 0.18 },
  // Asking, with the palm open. He asks a great many questions.
  asking:    { L: [0.30, 0.05], R: [-1.05, -0.85], lean: 0.02, tilt: 0.03, turn: -0.36 },
  // Walking away and looking back, unable to stay and look any longer.
  reluctant: { L: [0.40, 0.12], R: [-0.30, 0.08], lean: 0.04, tilt: 0.10, turn: -1.15 },
  // Toward her, before he has recognised her.
  reaching:  { L: [1.30, -1.15], R: [-1.45, -1.25], lean: -0.13, tilt: -0.10, turn: 0.06 },
  // Castigating himself for wanting what he wants; and grief among tombs.
  shame:     { L: [0.14, 0.22], R: [-0.12, 0.20], lean: 0.16, tilt: 0.40, turn: -0.22 },
  // In the boat, to a god.
  prayer:    { L: [2.45, -0.95], R: [-2.45, -0.95], lean: -0.20, tilt: -0.42, turn: 0.0 },
  // Speaking to someone present.
  speaking:  { L: [0.32, 0.08], R: [-0.85, -0.55], lean: 0.0, tilt: 0.02, turn: -0.28 },
};

  // Which pose belongs to which station, read off the OCCASION recorded in
  // poliphilo.json rather than invented here. The comment on each line is the
  // occasion it answers, abbreviated; the full sentence is in the data.
export const WITNESS_AT = {
  plain:           'lost',       // alone on the plain, before the wood closes over him
  wood:            'warding',    // among the boughs and thorns, his haste much hindered
  horse:           'listening',  // his own sigh comes back to him as an echo off the stone
  colossus:        'reading',    // the anatomy written over the giant in three tongues
  elephant:        'asking',     // he asks Logistica what the inscription meant
  portal:          'wonder',     // having now seen all four wonders of the piazza
  fountain:        'wonder',     // first sight of the pleasant country beyond the pyramid
  quinta_essentia: 'reluctant',  // leaving, unable to stay and look any longer
  three_doors:     'asking',     // emboldened by two answers, he asks leave for a third
  polia:           'reaching',   // in the green arbour, before he has recognised her
  triumphs:        'wonder',     // among the cars, wishing he could stay in the dream
  priapus:         'speaking',   // the last thing he says before the 1592 breaks off
  venus_temple:    'shame',      // castigating himself for wanting what he wants
  polyandrion:     'shame',      // alone in the ruin, reading the tombs of those dead for love
  cythera:         'prayer',     // in the boat, with Cupid at the helm
  court:           'shame',      // Book II: dying at her feet in the temple of Diana
  book_two:        'reaching',   // the first thing he says on coming back to life
};

  // ── The hieroglyph vocabulary ──────────────────────────────────────────
  //
  // Which signs are ATTESTED, and where. Efthymia Priki names the signs on the
  // obelisk and on the statue base that Poliphilo reads: **the eye**, **the
  // vulture**, **two fish-hooks**, **two circles** (read as eternity), and a
  // cartouche. The **anchor and dolphin** are woodcut_catalog #18, the
  // PATIENTIA device that closes the dragon chapter and that Aldus took for his
  // press. The **bull's skull** is #24, the frieze ornament in the Queen's
  // palace. The **ant and the elephant** are the concord hieroglyph on the
  // obelisk of Caesar at the Polyandrion (#87).
  //
  // The rest — altar, ewer, rudder, grain, sun, palm — were first drawn as the
  // vocabulary of the sentence Poliphilo says he read, not as a transcription.
  // THEN THE TRANSCRIPTION WAS FOUND: Dallington 1592, pp. 53–54 (corpus
  // ll. 2149–2170) itemises the elephant's base sign by sign — "First, the
  // horned scalpe of an oxe, with two tooles of husbandry fastned to the
  // hornes. An altar standing vpon goates feete, with a burning fire aloft, on
  // the foreside whereof there was also an eie, and a vulture. After that a
  // bason and an ewre. A spindle ful of twind, an old vessel fashioned with
  // the mouth stopped and tied fast. A sole and an eye in the bale thereof and
  // two branches trauersed one of Oliue, an other of Palme tree. An Anchor and
  // a Goose. An olde lampe, and a hand holding of it. An ore of ancient forme
  // with a fruitefull Oliue branch fastned to the handle. Two grapling yrons
  // or hookes. A Dolphin and an Arke close shut." — and then the Latin he
  // makes of it. And p. 93 gives the bridge's right-hand table: "An auncient
  // Helmet crested with a Doggeshead. The bony scalpe of an oxe with two
  // green braunches … And an ould lampe" → PATIENTIA EST ORNAMENTVM CVSTODIA
  // ET PROTECTIO VITAE. The signs added for those two readings are helmet,
  // lamp, goose, basin, spindle, vessel, sole and ark; the oar is the rudder,
  // the grapples are the hooks, the branches are the palm.
export const SIGNS = ['eye', 'vulture', 'hook', 'circle', 'anchor', 'dolphin', 'skull',
        'ant', 'elephant', 'altar', 'ewer', 'rudder', 'grain', 'sun', 'palm',
        'helmet', 'lamp', 'goose', 'basin', 'spindle', 'vessel', 'sole', 'ark'];

  // ── The twenty divisions of Cythera (our translation p. 294) ─────────────
  //
  // Built 2026-09-08. The island had twelve wedges and no fences. The book has
  // twenty, and it does not merely assert them — it gives the CONSTRUCTION,
  // the classical golden-section way of inscribing a decagon in a circle:
  //
  //   "…divide by an equal half, with a prick. And from this point draw
  //    obliquely a straight line, toward the topmost summit of the
  //    half-diameter; and at this topmost point, upon this aforesaid line,
  //    mark off from the half-diameter as much as is a quarter part of a whole
  //    diameter. Then extend a line from the centre, cutting over the mark to
  //    the circumference: this will be the division of the ten-angled figure.
  //    **These twenty divisions** were, by most noble fences, diversely
  //    latticed with fitting and convenient marble openwork, two inches thick,
  //    between the measured placing of most polished little pilasters, of
  //    whitening marble, and the rest most lustrously reddening… In the middle
  //    of the fence there opened, level, in each, a gate — seven feet in the
  //    opening, nine high up to the arching of its topmost curve."
  //
  // Every number in that is built: twenty of them, openwork two inches thick
  // between little pilasters, white marble and red, a gate seven feet wide and
  // nine to the crown of its arch. Segre reads the same twenty as the bosco's
  // twenty compartments, each a different plantation, which is why each wedge
  // now carries one species and each fence one climber.
  //
  // And the climbers are the book's own list, in its own order — this is the
  // single most various sentence in the whole garden:
  //
  //   "Along these serpentined the periclymenon; others the jasmine; some of
  //    bindweed; some of hops; and some of black bryony, or black vine; others
  //    of convolvulus, with the lily-like half-azure bells; some all white;
  //    some of momordica — so each was varied. Some of Jove's flammula; of
  //    smilax… adorned with a white fragrant lily-flower, with a thorny and
  //    ivy-like leaf; of bittersweet…"
// name, flower, second (berry or bell), leaf species for the card
export const CYTHERA_CLIMBERS = [
  { name: 'PERICLYMENON',  gloss: 'honeysuckle',            flower: 0xf0e2b4, second: 0xd8a850, leaf: 'myrtle' },
  { name: 'IASMINVM',      gloss: 'jasmine',                flower: 0xf6f0e2, second: null,     leaf: 'myrtle' },
  { name: 'CONVOLVVLVS',   gloss: 'bindweed',               flower: 0xf4f2ea, second: null,     leaf: 'ivy' },
  { name: 'LVPVLVS',       gloss: 'hops',                   flower: 0xc2cf92, second: 0xa8bc78, leaf: 'plane' },
  { name: 'BRYONIA NIGRA', gloss: 'black bryony, black vine', flower: 0xd8dcc0, second: 0x2a1c22, leaf: 'ivy' },
  { name: 'CAMPANVLA',     gloss: 'convolvulus, the lily-like half-azure bells', flower: 0x9ab4dc, second: null, leaf: 'ivy' },
  { name: 'CAMPANVLA ALBA', gloss: 'the same, all white',   flower: 0xf8f6ee, second: null,     leaf: 'ivy' },
  { name: 'MOMORDICA',     gloss: 'balsam-apple',           flower: 0xe8d488, second: 0xd0501e, leaf: 'plane' },
  { name: 'FLAMMVLA IOVIS', gloss: "Jove's flammula, clematis", flower: 0xefeadc, second: null, leaf: 'myrtle' },
  { name: 'SMILAX',        gloss: 'who for love of Crocus made herself Autophoros', flower: 0xf6f4e6, second: 0xc03028, leaf: 'ivy' },
  { name: 'DVLCAMARA',     gloss: 'bittersweet',            flower: 0x8a5ac0, second: 0xd03020, leaf: 'myrtle' },
];

// form: blade | oval | spiky | serrated | feather | fern | rosette | reed
export const HERBS = {
  reed:         { form: 'reed',     green: '#6a7a3a', light: '#9aa650', flower: '#5a3a1e', fsize: 7, stems: 9,  h: 1.0 },
  rush:         { form: 'blade',    green: '#2e5a24', light: '#4a7a34', flower: '#7a5a2a', fsize: 3, stems: 14, h: 0.95 },
  arum:         { form: 'oval',     green: '#2c5a22', light: '#4a8a34', flower: '#f4f0e0', fsize: 14, stems: 4, h: 0.8, spathe: true },
  // The umbriphilous three of Dallington p. 92: "iagged Polypodie, and the
  // Trientall and foure inched Scolopendria, or Hartes toongue, Heleborous
  // Niger, or Melampodi ... and such other Vmbriphilous hearbes". Two ferns
  // and a shade flower; they grow in the shaded walk and nowhere else.
  polypody:     { form: 'fern',     green: '#2a4a20', light: '#48762e', flower: '#3a5a26', fsize: 2, stems: 7, h: 0.55 },
  hartstongue:  { form: 'blade',    green: '#28522a', light: '#4e8438', flower: '#2e5a2c', fsize: 2, stems: 8, h: 0.7 },
  hellebore:    { form: 'rosette',  green: '#1e3c1c', light: '#3a6030', flower: '#e8eae0', fsize: 9, stems: 5, h: 0.5, second: '#b8c0a8' },
  balm:         { form: 'serrated', green: '#3a6a2a', light: '#6a9a44', flower: '#f0eef4', fsize: 4, stems: 6, h: 0.75 },
  mint:         { form: 'serrated', green: '#2e5e2a', light: '#5a8e44', flower: '#c8a0d8', fsize: 5, stems: 7, h: 0.7 },
  waterflower:  { form: 'oval',     green: '#3c6a2c', light: '#6a9a4a', flower: '#f6f2d0', fsize: 7, stems: 6, h: 0.6, second: '#f0d040' },
  nettle:       { form: 'serrated', green: '#254a1c', light: '#3e6e2c', flower: '#8a9a6a', fsize: 3, stems: 6, h: 0.9 },
  // The two the dividing spring's banks are hung with (1499 ll. 2793-2800).
  // Both reuse forms the herb painter already draws, so they cost no new code:
  // maidenhair is a fine fern, cymbalaria a creeping rosette with a small
  // lilac flower -- ivy-leaved toadflax, the plant that grows out of wet wall.
  maidenhair:   { form: 'fern',     green: '#2f5a2c', light: '#63a04a', flower: '#3a5a2e', fsize: 2, stems: 9, h: 0.42 },
  cymbalaria:   { form: 'rosette',  green: '#33643a', light: '#5c9a5a', flower: '#b89ad0', fsize: 5, stems: 6, h: 0.3, second: '#e8e0f0' },
  thistle:      { form: 'spiky',    green: '#5a7a5a', light: '#8aa68a', flower: '#8a4aa8', fsize: 9, stems: 5, h: 0.95 },
  sowthistle:   { form: 'spiky',    green: '#3e6a30', light: '#6a9a4a', flower: '#f0d030', fsize: 7, stems: 5, h: 0.85 },
  goatsbeard:   { form: 'blade',    green: '#5a7a40', light: '#8aa860', flower: '#e8e2c0', fsize: 10, stems: 6, h: 0.9 },
  bur:          { form: 'oval',     green: '#4a6a2c', light: '#7a9a48', flower: '#6a5a30', fsize: 6, stems: 5, h: 0.7 },
  pellitory:    { form: 'oval',     green: '#7aa060', light: '#a8c88a', flower: '#b06a5a', fsize: 2, stems: 8, h: 0.6, stem: '#a04a3a' },
  aster:        { form: 'blade',    green: '#3e6a34', light: '#6a9a54', flower: '#f4f0f8', fsize: 7, stems: 6, h: 0.7, second: '#e8c040' },
  marjoram:     { form: 'oval',     green: '#6a8a5a', light: '#9ab48a', flower: '#d88ab0', fsize: 5, stems: 9, h: 0.7 },
  southernwood: { form: 'feather',  green: '#7a8a6a', light: '#a8b898', flower: '#c8c060', fsize: 2, stems: 9, h: 0.8 },
  groundpine:   { form: 'spiky',    green: '#6a8a2a', light: '#a0c040', flower: '#f0e050', fsize: 4, stems: 8, h: 0.55 },
  thyme:        { form: 'oval',     green: '#3a5a34', light: '#5a7a54', flower: '#b070c0', fsize: 3, stems: 11, h: 0.5 },
  rue:          { form: 'fern',     green: '#5a8a6a', light: '#8ab89a', flower: '#e8d040', fsize: 4, stems: 6, h: 0.7 },
};

  // ── Foliage as foliage ───────────────────────────────────
  //
  // Ted, 2026-09-06: "The gardens and trees don't look much like real plants.
  // You were supposed to read the scholarship and the novel itself and get the
  // actual names of the plants and trees and render them accordingly."
  //
  // The names, from the text (counts are word-hits in the 1592 and in our
  // translation of XVII–XXXVIII; PLANTS.md carries the table):
  //   the wood, ch. I (1592 l. 625): "towgh Elmes beloued of the fruitfull
  //     vines, harde Ebony, strong Okes, soft Beeche", and fir boughs;
  //   the way to the palace, ch. VII (1592 p. 123): "a waye set on either
  //     sides with Cyprus Trees", and the enclosure "altogither of Cytrons,
  //     Orenges and Lymonds";
  //   Cythera, ch. XXI–XXII (our pp. 311–330): the bosco enclosed by cypress
  //     with myrtle beneath and a bitter-orange espalier within; compartments
  //     of pine, juniper, olive, laurel, arbutus, palm, orange, plane; the
  //     prati with apples, pears, plums; conifers on the first terrace, box
  //     knots, then the spice wood of citron, terebinth, almond and juniper;
  //     myrtle — Venus's own — about the theatre.
  //
  // How they are built. A canopy of overlapping spheres reads as a blob at
  // any distance; a canopy of LEAF-SPRAY CARDS reads as foliage, because the
  // silhouette breaks into leaves and light comes through it. Each species
  // gets a drawn spray of its own leaf — scale, needle, lanceolate, ovate,
  // lobed, palmate, frond — in two tones, and a crown shape the cards are
  // scattered through. Fixed random orientations, not billboards: a card that
  // turns to face you is a sticker; a card that does not is a leaf.
//                 leaf        crown            trunk        bark      dark      light     cards  extras
export const SPECIES = {
  cypress:  { leaf: 'scale',   crown: [0.55, 2.4, 0.55], trunk: [0.9, 0.09], bark: 0x4a3a28, dark: 0x17300f, light: 0x2c4a18, n: 26, top: 0.62 },
  fir:      { leaf: 'needle',  crown: [1.1, 2.2, 1.1],   trunk: [1.0, 0.11], bark: 0x3e2e1e, dark: 0x16311a, light: 0x2a5228, n: 28, top: 0.64, cone: true },
  juniper:  { leaf: 'scale',   crown: [0.7, 1.7, 0.7],   trunk: [0.5, 0.08], bark: 0x5a4a34, dark: 0x274a3a, light: 0x4a7a5a, n: 20, top: 0.55 },
  pine:     { leaf: 'needle',  crown: [1.9, 0.9, 1.9],   trunk: [3.2, 0.13], bark: 0x5a3a24, dark: 0x1c3612, light: 0x3a5c22, n: 30, top: 1.0, boughs: 4 },
  laurel:   { leaf: 'lance',   crown: [1.2, 1.35, 1.2],  trunk: [1.3, 0.11], bark: 0x4a3a2a, dark: 0x1b3a13, light: 0x3f6a22, n: 26, top: 0.9, boughs: 3 },
  // Buxus: tiny, dark, glossy, and the commonest leaf in the whole world.
  // Here for _leafCardTexture('box') -- the hedges' fringe -- though
  // _tree(x, z, s, 'box') gives a clipped ball if one is ever wanted.
  box:      { leaf: 'ovate',   crown: [0.6, 0.55, 0.6],  trunk: [0.5, 0.06], bark: 0x4a3a28, dark: 0x16280e, light: 0x385a1e, n: 22, top: 0.55 },
  myrtle:   { leaf: 'ovate',   crown: [1.1, 1.0, 1.1],   trunk: [0.9, 0.09], bark: 0x5a4030, dark: 0x16300f, light: 0x2f5419, n: 24, top: 0.8, boughs: 3, bloom: 0xf4f0e6 },
  orange:   { leaf: 'ovate',   crown: [1.15, 1.15, 1.15],trunk: [1.3, 0.10], bark: 0x5a4a34, dark: 0x1f3d16, light: 0x3d6524, n: 26, top: 0.9, boughs: 3, fruit: 0xe08a1c },
  citron:   { leaf: 'ovate',   crown: [1.15, 1.2, 1.15], trunk: [1.3, 0.10], bark: 0x5a4a34, dark: 0x233f1a, light: 0x456a26, n: 26, top: 0.9, boughs: 3, fruit: 0xe8d24a, big: true },
  lemon:    { leaf: 'ovate',   crown: [1.05, 1.15, 1.05],trunk: [1.3, 0.10], bark: 0x5a4a34, dark: 0x1f3d16, light: 0x3f6a26, n: 24, top: 0.9, boughs: 3, fruit: 0xf0e060 },
  apple:    { leaf: 'ovate',   crown: [1.3, 1.1, 1.3],   trunk: [1.4, 0.11], bark: 0x5a4432, dark: 0x2a4a1c, light: 0x5a8a34, n: 26, top: 0.9, boughs: 4, fruit: 0xc83a3a },
  // Pear and plum join apple 2026-09-07 for the orchard of second nature.
  // Segre reads the three together at Cythera -- the prati carry apples in
  // the first order, pears in the second, plums with pistachios in the
  // third (GARDENS.md 5) -- so they belong in the worked country too. A
  // pear stands taller and narrower than an apple and a plum lower and
  // broader, which is the whole difference an orchard row needs.
  pear:     { leaf: 'ovate',   crown: [1.05, 1.5, 1.05], trunk: [1.7, 0.10], bark: 0x54402e, dark: 0x27441a, light: 0x527f30, n: 26, top: 0.95, boughs: 4, fruit: 0xc0b055 },
  plum:     { leaf: 'ovate',   crown: [1.4, 0.95, 1.4],  trunk: [1.2, 0.11], bark: 0x4e3b2c, dark: 0x25401c, light: 0x4c7a30, n: 26, top: 0.85, boughs: 4, fruit: 0x6a4a86 },
  olive:    { leaf: 'narrow',  crown: [1.35, 1.1, 1.35], trunk: [1.5, 0.16], bark: 0x6a5a48, dark: 0x4a5a3e, light: 0x8a9a74, n: 30, top: 0.9, boughs: 4, gnarled: true },
  // Ash, named with the plane in the shaded walk of Dallington p. 92. Its
  // leaf is pinnate -- a row of leaflets on a stalk -- so 'lance' is the
  // nearest of the drawn forms, and it stands taller and narrower than a
  // plane, which is the difference the walk needs.
  ash:      { leaf: 'lance',   crown: [1.7, 2.1, 1.7],   trunk: [3.2, 0.15], bark: 0x8a8274, dark: 0x2a4c1c, light: 0x5e8a34, n: 32, top: 0.95, boughs: 4 },
  // Ivy, for the climbers of Cythera's twenty fences (our p. 294) -- and
  // the book names it often enough elsewhere. Never planted as a tree;
  // this entry exists so _leafCardTexture('ivy') has a leaf to draw.
  ivy:      { leaf: 'lobed',   crown: [0.7, 0.6, 0.7],   trunk: [0.4, 0.05], bark: 0x4a3a26, dark: 0x16300f, light: 0x365c22, n: 20, top: 0.5 },
  plane:    { leaf: 'palmate', crown: [2.2, 1.9, 2.2],   trunk: [2.8, 0.17], bark: 0x9a8a6c, dark: 0x2c5a1c, light: 0x6a9a3a, n: 34, top: 0.95, boughs: 4, mottled: true },
  oak:      { leaf: 'lobed',   crown: [2.1, 1.8, 2.1],   trunk: [2.2, 0.20], bark: 0x3e2e1e, dark: 0x22421a, light: 0x4a7a2c, n: 34, top: 0.95, boughs: 5 },
  beech:    { leaf: 'ovate',   crown: [1.7, 2.1, 1.7],   trunk: [2.4, 0.14], bark: 0x8a8070, dark: 0x2a4c1a, light: 0x5c8c30, n: 30, top: 0.95, boughs: 3 },
  elm:      { leaf: 'ovate',   crown: [1.6, 2.4, 1.6],   trunk: [2.6, 0.14], bark: 0x4a3a2c, dark: 0x22441a, light: 0x4c7c2c, n: 30, top: 0.95, boughs: 3, vine: true },
  willow:   { leaf: 'narrow',  crown: [1.8, 1.9, 1.8],   trunk: [1.8, 0.14], bark: 0x5a4a38, dark: 0x3a5a2a, light: 0x7a9a58, n: 34, top: 0.9, boughs: 3, weeping: true },
  arbutus:  { leaf: 'lance',   crown: [1.2, 1.3, 1.2],   trunk: [1.2, 0.10], bark: 0x8a3a24, dark: 0x1c3a14, light: 0x3c6a22, n: 24, top: 0.9, boughs: 3, fruit: 0xd8402a },
  palm:     { leaf: 'frond',   crown: [1.6, 0.9, 1.6],   trunk: [3.4, 0.12], bark: 0x7a6a4a, dark: 0x2a5a24, light: 0x5c9a3c, n: 14, top: 1.0, fronds: true },
  // the aged wild fig rooted in the Polyandrion's wall (our p. 272; Rhizopoulou 2016 n1′ 'wild fig', Ficus sycomorus/carica)
  fig:      { leaf: 'lobed',   crown: [1.4, 1.0, 1.4],   trunk: [0.9, 0.13], bark: 0x9a8e7c, dark: 0x25461a, light: 0x578c2e, n: 22, top: 0.75, boughs: 3, gnarled: true },
  // 'thorny plants, sharp thistles and cedars are cited in the text as occurring among ancient monuments and historical ruins' (Rhizopoulou 2016, abstract; l8′, s8)
  cedar:    { leaf: 'needle',  crown: [2.6, 1.3, 2.6],   trunk: [2.4, 0.22], bark: 0x4a3a2a, dark: 0x1c3a24, light: 0x3a5e3c, n: 36, top: 1.0, boughs: 5 },
};
