// game/data.js — the content of "Poliphilo's Commonplace Book".
//
// Kept separate from the engine so encounters can be written without touching
// code, and so the 3-D world can later read the same station keys.
//
// Quotation rules follow TRANSLATIONDISPLAYCHOICES.md. Every `quote` carries a
// `voice`:
//   '1592'  Robert Dallington's English (London 1592) — public domain, verbatim
//   '1499'  the Aldine's own Latin/Greek
//   'ours'  our translation of the post-1592 remainder, made from the Italian in
//           translation/source/ (CC0). Never Godwin, who is in copyright.

export const LOCI = {
  architectura: { label: 'Architectura', gloss: 'measure, order, proportion' },
  hieroglyphica: { label: 'Hieroglyphica', gloss: 'inscriptions and picture-signs' },
  herbaria:     { label: 'Herbaria',      gloss: 'plants, grafting, the three natures' },
  antiquitas:   { label: 'Antiquitas',    gloss: 'ruins, fragments, tombs' },
  fabula:       { label: 'Fabula',        gloss: 'myth read in relief and triumph' },
  chymica:      { label: 'Chymica',       gloss: 'the alchemical reading' },
  amor:         { label: 'Amor',          gloss: 'courtesy, gesture, the senses' },
};

// The three doors of folio 119, lettered as the book letters them.
export const BRANCHES = {
  theodoxia: {
    greek: 'ΘΕΟΔΟΞΙΑ', latin: 'Gloria Dei', keeper: 'Thende',
    blurb: 'The steep ascent. Endurance, abstention, and the reading of sacred signs. '
         + 'Her gate is mossed over and her rock is hard to climb.',
    skills: [
      { id: 'patientia', name: 'Patientia',  cost: 1, text: 'Wait out what should overwhelm you. Wonder no longer stuns.' },
      { id: 'lectio',    name: 'Lectio Sacra', cost: 2, text: 'Read an inscription in a tongue you do not have.' },
      { id: 'ascensus',  name: 'Ascensus',   cost: 3, text: 'Climb what others decline. The summit views open.' },
    ],
  },
  erototrophos: {
    greek: 'ΕΡΩΤΟΤΡΟΦΟΣ', latin: 'Mater Amoris', keeper: 'Philtronia',
    blurb: 'The flowered gate, and the one Poliphilo takes. Courtesy, the senses, '
         + 'and being let in. Small herbs, all sorts of flowers, water over amber gravel.',
    skills: [
      { id: 'comitas',  name: 'Comitas',   cost: 1, text: 'Be welcome. Nymphs offer where they would withhold.' },
      { id: 'sensus',   name: 'Quinque Sensus', cost: 2, text: 'Know each of the five by what she carries.' },
      { id: 'audacia',  name: 'Audacia',   cost: 3, text: 'Reach for what is veiled — and answer for it.' },
    ],
  },
  cosmodoxia: {
    greek: 'ΚΟΣΜΟΔΟΞΙΑ', latin: 'Gloria Mundi', keeper: 'Euclelia',
    blurb: 'The glory of the world. Works, arms, measurement, and the confidence to '
         + 'lay hands on things. She lifts a naked sword with a crown and a palm crossed upon it.',
    skills: [
      { id: 'mensura',  name: 'Mensura',   cost: 1, text: 'Pace out a structure and know its numbers.' },
      { id: 'labor',    name: 'Labor',     cost: 2, text: 'Persist where the way is rough. New routes appear.' },
      { id: 'gloria',   name: 'Gloria',    cost: 3, text: 'Be recorded. The monuments answer you by name.' },
    ],
  },
};

// An encounter is: prose, an optional quotation, and choices.
// A choice may carry `need` (a locus threshold), `branch` (a skill id) or
// `axis` (-1 reason … +1 desire). `gain` enters excerpta in the notebook.
export const SCENES = [
  {
    id: 'wood', station: 'wood', title: 'The Dark Wood', act: 'I',
    body: [
      'Poliphilo has passed a night of sighs. Toward dawn sleep takes him, and in sleep '
      + 'the dream begins: a wide silent plain, and beyond it a wood so thick that neither '
      + 'light nor path survives beneath the crowns.',
      'He walks until walking loses its direction. Thorns take his clothes; roots take his feet.',
    ],
    quote: {
      text: '“At the sight whereof immediatly, my hayre stood right vp, and I would haue cryed '
          + 'out, but could not: and presently the Woolfe ranne away.”',
      source: 'R. D., The Strife of Loue in a Dreame, London 1592', voice: '1592',
    },
    choices: [
      { text: 'Press on into the dark, and mark the trees as you pass.',
        axis: -0.4, gain: { herbaria: 2 },
        result: 'You count them as you go — oak, ash, broad-leaved palm, holm, chestnut, poplar, '
              + 'wild olive. Naming a wood is the beginning of not being lost in it.' },
      { text: 'Stand still and let the fear pass through you.',
        axis: -0.2, gain: { amor: 1, antiquitas: 1 },
        result: 'The wolf is gone before you have decided to be afraid. What remains is the '
              + 'silence of a place that has been here far longer than you.' },
      { text: 'Run, and pray to Jupiter as you run.',
        axis: 0.5, gain: { fabula: 2 },
        result: 'You call him Diespiter, Maximus, Optimus — the titles come to you out of some '
              + 'schoolroom, and they steady you more than the running does.' },
    ],
  },

  {
    id: 'portal', station: 'portal', title: 'The Great Portal', act: 'I',
    body: [
      'The valley is closed by a work no human age could match: a stepped mountain of Parian '
      + 'marble, part pyramid, part gate, sealing the pass between two peaks. The book counts '
      + 'its courses at one thousand four hundred and ten.',
      'Poliphilo the lover is also Poliphilo the antiquarian. The fear leaves him and something '
      + 'worse takes its place: the desire to measure.',
    ],
    quote: {
      text: '“With what art inuented? with what power, humaine force, and incredible meanes, '
          + 'enuying (if I may speake it) the workmanship of the heauens, such and so mightie '
          + 'weights should be transported and carryed into the skyes?”',
      source: 'R. D., The Strife of Loue in a Dreame, London 1592', voice: '1592',
    },
    choices: [
      { text: 'Pace out the base and reckon the courses.',
        axis: -0.5, gain: { architectura: 3, antiquitas: 1 },
        result: 'Six furlongs to a side, and the perimeter twenty-four. The numbers are absurd '
              + 'and you write them down anyway. Absurdity, you begin to suspect, is the point: '
              + 'a thing this size is built to astonish, not to be believed.' },
      { text: 'Read the brass table on the obelisk’s plinth.',
        need: { hieroglyphica: 1 }, axis: -0.3, gain: { hieroglyphica: 3 },
        result: 'Latin, Greek and Arabic, and under them the architect’s own name in Greek '
              + 'letters: ΛΙΧΑΣ ΛΙΒΥΚΟΣ ΩΡΘΩΣΕΝ ΜΕ — Lichas the Libyan set me up. Even the '
              + 'unbuildable was built by somebody, and he signed it.',
        locked: 'You can see there is writing. You cannot yet see that it is writing in three tongues.' },
      { text: 'Look up at the figure turning on the point, and simply watch her.',
        axis: 0.4, gain: { fabula: 2, amor: 1 },
        result: 'A winged nymph on a copper pin, her robe blown abroad, her face turned back over '
              + 'her wings, a horn of plenty held mouth-downward so that nothing can fall out of it. '
              + 'She grinds as she turns and the whole mountain rings faintly with it.' },
      { text: 'Hurry through the passage. It is only a gate.',
        axis: 0.2, gain: {},
        result: 'You pass under the largest thing you will ever see and take nothing from it. '
              + 'The vault is cold. Somewhere behind you there is a sound like scales on stone.' },
    ],
  },

  {
    id: 'elephant', station: 'elephant', title: 'The Elephant and the Obelisk', act: 'II',
    body: [
      'Among the ruins stands a marvel he circles three times before believing: an elephant of '
      + 'stone blacker than obsidian and dusted over with gold, so polished it gives back whatever '
      + 'stands before it. It is saddled in brass, and carries not a rider but an obelisk of green '
      + 'Lacedaemonian stone.',
      'Seven steps climb the porphyry base. Beneath the saddle there is a little door.',
    ],
    quote: {
      text: 'CEREBRVM EST IN CAPITE\n\nthe brain is in the head',
      source: 'the breast-strap of the elephant, 1499 edition', voice: '1499',
    },
    choices: [
      { text: 'Read the frontlet over its face.',
        need: { hieroglyphica: 2 }, axis: -0.3, gain: { hieroglyphica: 2, chymica: 1 },
        result: 'ΠΟΝΟΣ ΚΑΙ ΕΥΦΥΙΑ — labour and native wit. A later hand has been here before you '
              + 'and written the sign of a metal beside it.',
        locked: 'There is a goldsmith’s plate over the beast’s face, lettered in Greek and '
              + 'in Arabic, and you have not the Greek.' },
      { text: 'Go in at the little door, into the body of the beast.',
        axis: 0.3, gain: { antiquitas: 3, hieroglyphica: 1 },
        result: 'A lamp that never goes out. Two sepulchres — a king and a queen of some perished '
              + 'age. The king’s shield says NVDVS ESSEM, BESTIA NI ME TEXISSET. QVAERE, ET '
              + 'INVENIES: naked I would be, had not the beast covered me. Seek, and thou shalt find. '
              + 'It is an instruction, and you have just obeyed it.' },
      { text: 'Consider what it means that the slowest beast carries the most heaven-pointed stone.',
        axis: -0.4, gain: { fabula: 2, chymica: 2 },
        result: 'Strength bearing wisdom; patience bearing the sky. The dream is teaching you its '
              + 'grammar — everything here means, and nothing explains.' },
    ],
  },

  {
    id: 'nymphs', station: 'court', title: 'The Five at the Bath', act: 'II',
    body: [
      'Five nymphs find him at a fountain’s lip and laugh his fear away. They are the five '
      + 'senses, and each is known by what she carries. One takes his hand.',
    ],
    quote: {
      text: '“Giue mee thy hand, thou art verie welcome. Thou seest at this present here, that we '
          + 'are fiue companions, and I am called Aphea, and she that carrieth the boxes and white '
          + 'cloathes Offressia. This other with the shining Glasse (our delightes) her name is '
          + 'Orassia. Shee that carrieth the sounding Harpe is called Achol, and shee that beareth '
          + 'the casting bottle of precious Lyquor, is called Genshra.”',
      source: 'R. D., The Strife of Loue in a Dreame, London 1592', voice: '1592',
    },
    choices: [
      { text: 'Name each of them by the thing she carries.',
        need: { amor: 2 }, axis: 0.2, gain: { amor: 3, herbaria: 1, fabula: 1 },
        result: 'Aphea who is Touch and carries nothing, because she is the one who offered her '
              + 'hand. Osfressia with the perfume caskets, who is Smell. Orassia with the glass, '
              + 'who is Sight. Achoe with the harp, who is Hearing. Geussia with the golden bottle, '
              + 'who is Taste. They are delighted. Nobody usually gets Aphea.',
        locked: 'They are five and they are laughing and you cannot tell one from another.' },
      { text: 'Accept the bath, and say nothing clever.',
        axis: 0.5, gain: { amor: 2 },
        result: 'The bath is eight-sided and roofed with crystal, and there is a boy of thin brass '
              + 'on its spire whose head is hollowed to a trumpet so the wind sounds him. You are '
              + 'thoroughly, comprehensively soaked by a device you should have seen coming.' },
      { text: 'Demur, and study the carving on the walls instead.',
        axis: -0.6, gain: { architectura: 2, antiquitas: 1 },
        result: 'Corinthian columns of jacinth, a frieze of naked children playing with '
              + 'water-monsters, a lion’s head in the cupola holding a ring in its jaws. '
              + '"Oftentimes my eyes would wander from the real and lively shapes, to looke vpon '
              + 'those feyned representations." The nymphs notice, and are not flattered.' },
    ],
  },

  {
    id: 'doors', station: 'three_doors', title: 'The Three Doors', act: 'III',
    final: true,
    body: [
      'Three doors are hewn out of the living rock, in a place so barren it carries no grass at '
      + 'all, and over each a name in Greek, Latin, Hebrew and Arabic. On his right the steep gate '
      + 'of God’s glory; on his left the world’s; and in the middle the gate that nurses love.',
      'Logistica argues for the hard road. She borrows Thelemia’s lute and sings for it.',
    ],
    quote: {
      text: '“O Poliphilus, be not wearie to take paynes in thys place, for when labour and trauell '
          + 'is ouer-come, there will be a tyme of rest.”',
      source: 'Logistica’s song — R. D., The Strife of Loue in a Dreame, London 1592', voice: '1592',
    },
    isDoorChoice: true,
  },
];

// Shown once the door is chosen — the book's own consequences.
export const DOOR_OUTCOMES = {
  theodoxia:
    'You knock, and the gate that is covered over with green moss opens. An old woman in rags, '
    + 'lean and pale, her eyes on the ground and her right arm bare and pointing at heaven. Six '
    + 'handmaids as poorly dressed as she is. Behind her a solitary rock, crumbling, with a mist '
    + 'over it and no easy way up. Logistica is delighted. Thelemia says nothing at all, which is '
    + 'worse. In the book, Poliphilo does not stay here.',
  cosmodoxia:
    'A brown woman with fierce rolling eyes lifts a naked glittering sword, and across the middle '
    + 'of it lie a crown of gold and a branch of palm. Her arms are Hercules’ arms. Six young '
    + 'women attend her, and the work looks hard and the rewards look real. Logistica takes up the '
    + 'lute and plays a Dorian tune for you here, and very nearly keeps you. In the book, Poliphilo '
    + 'does not stay here either.',
  erototrophos:
    'The ring of brass is struck and the third gate opens, and Philtronia comes to meet you — '
    + 'wanton, unconstant, and so pleasant at first sight that she takes you before you have '
    + 'decided anything. Small herbs, every sort of flower, water sliding over amber gravel and '
    + 'falling somewhere out of sight. Six young women, amorously adorned. Logistica speaks for a '
    + 'long time against it, and then throws her lute on the ground and breaks it, and goes. '
    + 'This is the door Poliphilo takes. You have taken it too, or you have not.',
};
