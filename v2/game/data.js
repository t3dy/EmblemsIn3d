// game/data.js — the content of "Poliphilo's Commonplace Book".
//
// Kept separate from the engine so encounters can be written without touching
// code, and so the 3-D world can later read the same `station` keys.
//
// Quotation rules follow TRANSLATIONDISPLAYCHOICES.md. Every `quote` carries a
// `voice`:
//   '1592'  Robert Dallington's English (London 1592) — public domain, verbatim
//   '1499'  the Aldine's own Latin/Greek
//   'ours'  our translation of the post-1592 remainder, made from the Italian in
//           translation/source/ (CC0). Never Godwin, who is in copyright.
//
// A choice may carry:
//   need   {locus: n}   excerpta required — gates comprehension, never the story
//   branch 'skillId'    requires a purchased skill; appears only after the doors
//   axis   -1 … +1      Logistica ⟷ Thelemia. Colours, never locks.
//   gain   {locus: n}   excerpta entered in the notebook

export const LOCI = {
  architectura: { label: 'Architectura', gloss: 'measure, order, proportion' },
  hieroglyphica: { label: 'Hieroglyphica', gloss: 'inscriptions and picture-signs' },
  herbaria:     { label: 'Herbaria',      gloss: 'plants, grafting, the three natures' },
  antiquitas:   { label: 'Antiquitas',    gloss: 'ruins, fragments, tombs' },
  fabula:       { label: 'Fabula',        gloss: 'myth read in relief and triumph' },
  chymica:      { label: 'Chymica',       gloss: 'the alchemical reading' },
  amor:         { label: 'Amor',          gloss: 'courtesy, gesture, the senses' },
};

export const BRANCHES = {
  theodoxia: {
    greek: 'ΘΕΟΔΟΞΙΑ', latin: 'Gloria Dei', keeper: 'Thende',
    blurb: 'The steep ascent. Endurance, abstention, and the reading of sacred signs. '
         + 'Her gate is mossed over and her rock is hard to climb.',
    skills: [
      { id: 'patientia', name: 'Patientia',    cost: 1, text: 'Wait out what should overwhelm you.' },
      { id: 'lectio',    name: 'Lectio Sacra', cost: 2, text: 'Read an inscription in a tongue you do not have.' },
      { id: 'ascensus',  name: 'Ascensus',     cost: 3, text: 'Climb what others decline. Summits open.' },
    ],
  },
  erototrophos: {
    greek: 'ΕΡΩΤΟΤΡΟΦΟΣ', latin: 'Mater Amoris', keeper: 'Philtronia',
    blurb: 'The flowered gate, and the one Poliphilo takes. Courtesy, the senses, '
         + 'and being let in. Small herbs, all sorts of flowers, water over amber gravel.',
    skills: [
      { id: 'comitas', name: 'Comitas',       cost: 1, text: 'Be welcome. Nymphs offer where they would withhold.' },
      { id: 'sensus',  name: 'Quinque Sensus', cost: 2, text: 'Know each of the five by what she carries.' },
      { id: 'audacia', name: 'Audacia',       cost: 3, text: 'Reach for what is veiled — and answer for it.' },
    ],
  },
  cosmodoxia: {
    greek: 'ΚΟΣΜΟΔΟΞΙΑ', latin: 'Gloria Mundi', keeper: 'Euclelia',
    blurb: 'The glory of the world. Works, arms, measurement, and the confidence to lay '
         + 'hands on things. She lifts a naked sword with a crown and a palm crossed upon it.',
    skills: [
      { id: 'mensura', name: 'Mensura', cost: 1, text: 'Pace out a structure and know its numbers.' },
      { id: 'labor',   name: 'Labor',   cost: 2, text: 'Persist where the way is rough. New routes appear.' },
      { id: 'gloria',  name: 'Gloria',  cost: 3, text: 'Be recorded. The monuments answer you by name.' },
    ],
  },
};

// The guides comment on every scene. They never remove a choice — they colour it.
// Keys: 'reason' (axis < -0.3), 'mid', 'desire' (axis > 0.3).
const G = (reason, mid, desire) => ({ reason, mid, desire });

export const SCENES = [
  {
    id: 'wood', station: 'wood', title: 'The Dark Wood', act: 'I',
    body: [
      'Poliphilo has passed a night of sighs. Toward dawn sleep takes him, and in sleep the '
      + 'dream begins: a wide silent plain, and beyond it a wood so thick that neither light '
      + 'nor path survives beneath the crowns.',
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
        result: 'The wolf is gone before you have decided to be afraid. What remains is the silence '
              + 'of a place that has been here far longer than you.' },
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
    guide: G(
      'Logistica: “Count it. A thing you have counted cannot frighten you twice.”',
      'Logistica reaches for her tablet. Thelemia is already looking at the sky.',
      'Thelemia: “You could stand here reckoning until the light goes. Look up instead.”'),
    choices: [
      { text: 'Pace out the base and reckon the courses.',
        axis: -0.5, gain: { architectura: 3, antiquitas: 1 },
        result: 'Six furlongs to a side, and the perimeter twenty-four. The numbers are absurd and '
              + 'you write them down anyway. Absurdity, you begin to suspect, is the point: a thing '
              + 'this size is built to astonish, not to be believed.' },
      { text: 'Read the brass table on the obelisk’s plinth.',
        need: { hieroglyphica: 1 }, axis: -0.3, gain: { hieroglyphica: 3 },
        result: 'Latin, Greek and Arabic, and under them the architect’s own name in Greek letters: '
              + 'ΛΙΧΑΣ ΛΙΒΥΚΟΣ ΩΡΘΩΣΕΝ ΜΕ — Lichas the Libyan set me up. Even the unbuildable was '
              + 'built by somebody, and he signed it.',
        locked: 'You can see there is writing. You cannot yet see that it is writing in three tongues.' },
      { text: 'Look up at the figure turning on the point, and simply watch her.',
        axis: 0.4, gain: { fabula: 2, amor: 1 },
        result: 'A winged nymph on a copper pin, her robe blown abroad, her face turned back over her '
              + 'wings, a horn of plenty held mouth-downward so that nothing can fall out of it. She '
              + 'grinds as she turns and the whole mountain rings faintly with it.' },
      { text: 'Hurry through the passage. It is only a gate.',
        axis: 0.2, gain: {},
        result: 'You pass under the largest thing you will ever see and take nothing from it. The '
              + 'vault is cold. Somewhere behind you there is a sound like scales on stone.' },
    ],
  },

  {
    id: 'dragon', station: 'portal', title: 'The Dragon in the Vault', act: 'I',
    body: [
      'Out of the dark of the passage comes a hiss, and the scrape of scales on cut stone. It is '
      + 'between you and the way you came.',
    ],
    guide: G(
      'Logistica: “It is an animal. Animals can be reasoned about, if not with.”',
      'Neither of them says anything. That is not encouraging.',
      'Thelemia: “Run. There is nothing on the other side of dignity.”'),
    choices: [
      { text: 'Flee into the black passages and run until the light finds you.',
        axis: 0.3, gain: { antiquitas: 1 },
        result: 'You run blind through the bowels of the mountain, and this is exactly what Poliphilo '
              + 'does, and it is exactly right. A thread of light shows you a way out into a country '
              + 'altogether gentler. Fleeing is canonical. Nobody will hold it against you.' },
      { text: 'Stand, and look at it properly, since you may not get another chance.',
        axis: -0.5, gain: { fabula: 3, antiquitas: 1 },
        result: 'You are afraid in a way that does not stop you looking. Crested, vast, and older than '
              + 'the building. You will be able to describe it afterwards, which is more than most '
              + 'people who meet a dragon can say.' },
      { text: 'Feint toward the vault and take the side passage while it turns.',
        axis: 0.1, gain: { architectura: 2 },
        result: 'You have been reading this building for an hour and your feet know it better than your '
              + 'fear does. The side passage is where the plan said it would be.' },
    ],
  },

  {
    id: 'elephant', station: 'elephant', title: 'The Elephant and the Obelisk', act: 'II',
    body: [
      'Among the ruins stands a marvel he circles three times before believing: an elephant of stone '
      + 'blacker than obsidian and dusted over with gold, so polished it gives back whatever stands '
      + 'before it. It is saddled in brass, and carries not a rider but an obelisk of green '
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
        result: 'ΠΟΝΟΣ ΚΑΙ ΕΥΦΥΙΑ — labour and native wit. A later hand has been here before you and '
              + 'inked the sign of a metal beside it, in the margin, in a brown ink.',
        locked: 'There is a goldsmith’s plate over the beast’s face, lettered in Greek and Arabic, '
              + 'and you have not the Greek.' },
      { text: 'Go in at the little door, into the body of the beast.',
        axis: 0.3, gain: { antiquitas: 3, hieroglyphica: 1 },
        result: 'A lamp that never goes out. Two sepulchres — a king and a queen of some perished age. '
              + 'The king’s shield says NVDVS ESSEM, BESTIA NI ME TEXISSET. QVAERE, ET INVENIES: '
              + 'naked I would be, had not the beast covered me. Seek, and thou shalt find. It is an '
              + 'instruction, and you have just obeyed it.' },
      { text: 'Consider what it means that the slowest beast carries the most heaven-pointed stone.',
        axis: -0.4, gain: { fabula: 2, chymica: 2 },
        result: 'Strength bearing wisdom; patience bearing the sky. The dream is teaching you its '
              + 'grammar — everything here means, and nothing explains.' },
    ],
  },

  {
    id: 'nymphs', station: 'court', title: 'The Five at the Bath', act: 'II',
    body: [
      'Five nymphs find him at a fountain’s lip and laugh his fear away. They are the five senses, '
      + 'and each is known by what she carries. One takes his hand.',
    ],
    quote: {
      text: '“Giue mee thy hand, thou art verie welcome. Thou seest at this present here, that we are '
          + 'fiue companions, and I am called Aphea, and she that carrieth the boxes and white '
          + 'cloathes Offressia. This other with the shining Glasse (our delightes) her name is '
          + 'Orassia. Shee that carrieth the sounding Harpe is called Achol, and shee that beareth '
          + 'the casting bottle of precious Lyquor, is called Genshra.”',
      source: 'R. D., The Strife of Loue in a Dreame, London 1592', voice: '1592',
    },
    choices: [
      { text: 'Name each of them by the thing she carries.',
        need: { amor: 2 }, axis: 0.2, gain: { amor: 3, herbaria: 1, fabula: 1 },
        result: 'Aphea who is Touch and carries nothing, because she is the one who offered her hand. '
              + 'Osfressia with the perfume caskets, who is Smell. Orassia with the glass, who is '
              + 'Sight. Achoe with the harp, who is Hearing. Geussia with the golden bottle, who is '
              + 'Taste. They are delighted. Nobody usually gets Aphea.',
        locked: 'They are five and they are laughing and you cannot tell one from another.' },
      { text: 'Accept the bath, and say nothing clever.',
        axis: 0.5, gain: { amor: 2 },
        result: 'The bath is eight-sided and roofed with crystal, and there is a boy of thin brass on '
              + 'its spire whose head is hollowed to a trumpet so the wind sounds him. You are '
              + 'thoroughly, comprehensively soaked by a device you should have seen coming.' },
      { text: 'Demur, and study the carving on the walls instead.',
        axis: -0.6, gain: { architectura: 2, antiquitas: 1 },
        result: 'Corinthian columns of jacinth, a frieze of naked children playing with water-monsters, '
              + 'a lion’s head in the cupola holding a ring in its jaws. “Oftentimes my eyes would '
              + 'wander from the real and lively shapes, to looke vpon those feyned representations.” '
              + 'The nymphs notice, and are not flattered.' },
    ],
  },

  {
    id: 'chess', station: 'court', title: 'The Queen’s Chess Ballet', act: 'II',
    body: [
      'Queen Eleuterylida — Free Will herself — keeps a court where the floor is a lesson in geometry. '
      + 'She feasts you from vessels that outdo kingdoms, and then the game begins: thirty-two maidens, '
      + 'sixteen in silver and sixteen in gold, dancing the moves on a checkered pavement to music.',
    ],
    guide: G(
      'Logistica: “Three rounds. Watch which colour takes each. It is not a game.”',
      'Thelemia has already joined the dancing. Logistica is counting.',
      'Thelemia: “You are invited. Nobody invites you twice.”'),
    choices: [
      { text: 'Watch all three rounds and record who wins each.',
        axis: -0.4, gain: { chymica: 2, architectura: 1 },
        result: 'Silver takes the first. A hand in the margin of the British Library copy wrote '
              + '“Argentum” here, with a crescent moon beside it, and read the three rounds as three '
              + 'iterations of distillation — silver yielding to gold, over and over, until something '
              + 'is refined that was not there at the start.' },
      { text: 'Read the ballet as an operation rather than an entertainment.',
        need: { chymica: 2 }, axis: -0.5, gain: { chymica: 3, fabula: 1 },
        result: 'Luna gives way to Sol; the coincidence of opposites is being danced in front of you '
              + 'by thirty-two women who may or may not know it. The book will show you a hermaphrodite '
              + 'later and you will already have seen the argument made with feet.',
        locked: 'It is a beautiful game and you can tell it is also something else, but not what.' },
      { text: 'Play. Take a place among the gold.',
        axis: 0.6, gain: { amor: 3 },
        result: 'You are a poor dancer and an appalling chess piece and the court is charmed by both '
              + 'facts. Eleuterylida watches you from the dais with the expression of a woman deciding '
              + 'something about you, favourably.' },
    ],
  },

  {
    id: 'doors', station: 'three_doors', title: 'The Three Doors', act: 'III',
    isDoorChoice: true,
    body: [
      'Three doors are hewn out of the living rock, in a place so barren it carries no grass at all, '
      + 'and over each a name in Greek, Latin, Hebrew and Arabic. On your right the steep gate of '
      + 'God’s glory; on your left the world’s; and in the middle the gate that nurses love.',
      'The Queen has given you two companions for this. Logistica argues for the hard road. She '
      + 'borrows Thelemia’s lute and sings for it.',
    ],
    quote: {
      text: '“O Poliphilus, be not wearie to take paynes in thys place, for when labour and trauell is '
          + 'ouer-come, there will be a tyme of rest.”',
      source: 'Logistica’s song — R. D., The Strife of Loue in a Dreame, London 1592', voice: '1592',
    },
  },

  {
    id: 'palace', station: 'planetary_palace', title: 'The Planetary Palace', act: 'III',
    body: [
      'Beyond the gate the dream turns encyclopaedic. A colonnade where the seven planets keep their '
      + 'metals on pedestals: Saturn’s dull lead rising rank by rank toward the sun’s incorruptible '
      + 'gold, then copper, quicksilver, silver. The heavens arranged as a cabinet.',
    ],
    choices: [
      { text: 'Handle each metal in turn and set down the order.',
        axis: -0.3, gain: { chymica: 3, architectura: 1 },
        result: 'Lead, tin, iron; gold at the centre of the order; copper, quicksilver, silver. The '
              + 'Chaldean sequence, and it is also the order of the planets by their speed, and it is '
              + 'also — a hand in the margin insists — the ladder of the Work.' },
      { text: 'Pace the colonnade and take its proportions.',
        branch: 'mensura', axis: -0.4, gain: { architectura: 3 },
        result: 'Bay by bay, and the intercolumniation holds to the last. Someone built this to '
              + 'Vitruvian rule and expected to be checked. You check it. It holds.',
        locked: 'You could pace this out if you had learned how.' },
      { text: 'Ask Thelemia what she thinks the gold is for.',
        axis: 0.4, gain: { amor: 2, fabula: 1 },
        result: '“For what everything is for,” she says, not looking at it. She has been hurrying you '
              + 'gently since the gate and you have only just noticed.' },
      { text: 'Look for the marginal hand you have started to recognise.',
        need: { chymica: 3 }, axis: -0.2, gain: { chymica: 2, hieroglyphica: 2 },
        result: 'It is here too. The same brown ink, the same habit of replacing a god’s name with a '
              + 'metal’s sign. Somebody read this book four hundred years ago with exactly your '
              + 'questions and left you their notes.',
        locked: 'There is writing in the margins of the world and you cannot yet see it as a hand.' },
    ],
  },

  {
    id: 'torch', station: 'polia', title: 'The Nymph with the Torch', act: 'IV',
    body: [
      'A nymph comes to meet you carrying a lit torch, dressed in white worked with gold. The dream '
      + 'will not yet say her name. She is courteous; she is amused; she is — you would swear it — '
      + 'the one you have been walking toward since the wood.',
    ],
    quote: {
      text: 'POLIAM FRATER FRANCISCVS COLVMNA PERAMAVIT\n\nBrother Francesco Colonna loved Polia utterly',
      source: 'the acrostic formed by the first letters of the thirty-eight chapters, 1499',
      voice: '1499',
    },
    guide: G(
      'Logistica: “Ask her name. A thing you cannot name will govern you.”',
      'Logistica draws breath to speak and, for once, does not.',
      'Thelemia: “Do not ask. Let her carry it a while longer.”'),
    choices: [
      { text: 'Beg her to say whether she is Polia.',
        axis: 0.5, gain: { amor: 3 },
        result: 'She only bids you follow. It is not a refusal and it is not an answer, and you walk '
              + 'behind her light for a long way learning the difference.' },
      { text: 'Take the torch and carry it for her.',
        branch: 'comitas', axis: 0.4, gain: { amor: 3, fabula: 1 },
        result: 'She lets you, which surprises both of you. The torch is the sign of the rites to come '
              + '— at the temple it will be quenched in the cistern, and by that quenching you will be '
              + 'bound — and she has just put it in your hand early.',
        locked: 'You would have to be more welcome than you are to be trusted with her fire.' },
      { text: 'Say nothing, and watch what she does with the light.',
        axis: -0.4, gain: { amor: 1, antiquitas: 2 },
        result: 'She holds it low, so that it shows the ground rather than her face. Whoever she is, '
              + 'she does not want to be looked at yet, and she does want you not to fall.' },
    ],
  },

  {
    id: 'triumphs', station: 'triumphs', title: 'The Four Triumphs', act: 'IV',
    body: [
      'Across the meadow roll four triumphal cars, each celebrating one of Jupiter’s loves. The first '
      + 'has wheels of Scythian emerald and a body of table diamonds set in gold, cornucopias at the '
      + 'corners and harpies’ feet beneath. Six centaurs draw it, crowned with ivy, and on every '
      + 'centaur rides a nymph with an instrument.',
    ],
    quote: {
      text: '“…singing so sweetly with little rounde mouthes, and playing vppon their instruments, '
          + 'within so celestiall a manner, as woulde keepe a man from euer dying.”',
      source: 'R. D., The Strife of Loue in a Dreame, London 1592', voice: '1592',
    },
    choices: [
      { text: 'Read the panels on the car’s sides.',
        need: { fabula: 3 }, axis: -0.3, gain: { fabula: 3, hieroglyphica: 1 },
        result: 'Europa crowning bulls; the ride over the sea; Cupid shooting into the air among '
              + 'wounded nations; and, on the hindmost panel, Mars before Jupiter showing the wound in '
              + 'his impenetrable breastplate and holding one word — NEMO. No one is exempt. The car '
              + 'is arguing with you as it passes.',
        locked: 'There are stories cut into the sides and they go by too fast to hold.' },
      { text: 'Count the teams and the liveries.',
        axis: -0.4, gain: { fabula: 2, architectura: 1 },
        result: 'Six centaurs for Europa; six white elephants coupled two and two for Leda, in blue '
              + 'silk twisted with gold; six leopards in vine-withes for the mystical car, and that one '
              + 'goes very leisurely. The riders are ranked by dress: the two nearest the car in the '
              + 'blue of a peacock’s neck, the middle two in crimson, the two foremost in emerald.' },
      { text: 'Fall in and walk with the procession.',
        axis: 0.5, gain: { amor: 2, fabula: 1 },
        result: 'The music does what the book says it does. You do not learn anything and you would '
              + 'not trade the hour.' },
      { text: 'Be recorded among them.',
        branch: 'gloria', axis: 0.2, gain: { fabula: 2, antiquitas: 2 },
        result: 'One of the nymphs asks your name, and writes it. It will be on a car in a dream in a '
              + 'book, which is a strange kind of immortality, and the only kind on offer here.',
        locked: 'They pass without asking who you are.' },
    ],
  },

  {
    id: 'rites', station: 'quinta_essentia', title: 'The Quenching of the Torch', act: 'V',
    body: [
      'At the round temple the high priestess meets you. Here the torch Polia carried is put out in '
      + 'the cistern of the goddess, and by that quenching you are joined — by rites older than any '
      + 'church that would have separated a friar from his beloved.',
      'Above the altar hangs the fifth essence, the quinta essentia, over the four elements the way '
      + 'the dodecahedron hangs over Plato’s other solids.',
    ],
    choices: [
      { text: 'Attend to the rite and let it be done to you.',
        axis: 0.3, gain: { amor: 3, chymica: 1 },
        result: 'Doves are offered; roses fall out of a clear sky onto the altar; wine and sea-water '
              + 'mingle in the cistern. When Polia turns from the rite her veil is drawn back at last, '
              + 'and the dream stops pretending: it is she, and she loves you.' },
      { text: 'Watch the quintessence over the elements and think about what is being claimed.',
        need: { chymica: 4 }, axis: -0.5, gain: { chymica: 3, fabula: 2 },
        result: 'Earth, water, air and fire ranged below, and above them the substance the heavens are '
              + 'made of. The marriage happening at the altar and the operation hanging over it are the '
              + 'same figure said twice, and the annotator in the brown ink knew it: he wrote the sign '
              + 'of the hermaphrodite here.',
        locked: 'It is a beautiful shape and you know it is an argument, and you cannot yet follow it.' },
      { text: 'Endure the fast and the vigil the priestess sets first.',
        branch: 'patientia', axis: -0.4, gain: { chymica: 2, antiquitas: 1, amor: 1 },
        result: 'You keep it. The priestess, who expected you not to, tells you what the roses mean, '
              + 'which she was not going to.',
        locked: 'There is a preparation asked of you that you have not the discipline for.' },
    ],
  },

  {
    id: 'fountain', station: 'fountain', title: 'The Fountain of Venus', act: 'V',
    final: true,
    body: [
      'At the heart of the theatre stands the fountain: a kerb of black stone, seven-sided without and '
      + 'round within, carrying seven columns of sapphire, emerald, turquoise, jasper and topaz under a '
      + 'cupola of veinless crystal. Between the sapphire and the emerald hangs a little curtain of '
      + 'sandalwood colour, embroidered ΥΜΗΝ in gold. Behind it is the goddess.',
      'Cupid gives the golden arrow to the nymph Synesia — Understanding — and signals that she should '
      + 'offer it to Polia, and that Polia should tear the veil. Polia will not. Cupid smiles, and '
      + 'passes it instead through Philedia, who is Love-of-Pleasure, into your hand.',
    ],
    quote: {
      text: 'ΩΣΠΕΡ ΣΠΙΝΘΗΡ ΚΗΛΗΘΜΟΣ\n\nas a spark, so enchantment',
      source: 'cut in silver on the fountain’s columns, 1499 edition', voice: '1499',
    },
    guide: G(
      'Logistica says nothing at all, which from her is an argument.',
      'Both of them are watching you and neither will say it.',
      'Thelemia: “It was put in your hand. Things are put in hands for a reason.”'),
    choices: [
      { text: 'Strike the curtain, as Poliphilo does.',
        axis: 0.5, gain: { amor: 3, fabula: 2 },
        result: 'Ringed about with a blind flame and not refusing, you strike it. As it splits you see '
              + 'Polia almost saddened, and the emerald column cracks as though it must shatter. And '
              + 'there she is in the salt water, and all beauty comes off her, and you remember one '
              + 'beat too late what happened to the son of Aristaeus in the vale of Gargaphie for '
              + 'seeing a goddess bathe. Nothing happens to you. That is somehow worse.' },
      { text: 'Refuse it, as Polia refused it.',
        axis: -0.6, gain: { amor: 2, chymica: 2, antiquitas: 1 },
        result: 'You hand the arrow back. Philedia does not understand; Synesia does. Cupid is amused '
              + 'rather than angry, and the veil stays where it is, and the goddess behind it stays a '
              + 'thing you were told about rather than a thing you took. Poliphilo does not do this. '
              + 'In five hundred years, as far as anyone can tell, nobody has.' },
      { text: 'Ask Polia first, and abide by what she says.',
        branch: 'sensus', axis: 0.1, gain: { amor: 4, chymica: 1 },
        result: 'She says: not by your hand, and not yet. And then she takes the arrow herself, having '
              + 'refused it once, and does it — which is a different thing entirely from either of you '
              + 'doing it alone, and is not in the book.',
        locked: 'She is beside you and you do not know her well enough to ask.' },
      { text: 'Look past the curtain at the seven columns instead, and read them.',
        need: { chymica: 5 }, axis: -0.5, gain: { chymica: 4, architectura: 2 },
        result: 'Boys set into the three right-hand columns, the female sex into the three left, and a '
              + 'hermaphrodite in the seventh, which stands alone and is hexagonal where the others are '
              + 'round. The coniunctio, built as architecture. The annotator inked a metal at each of '
              + 'the seven angles. The goddess can wait; this is what she is standing in.',
        locked: 'Seven columns of coloured stone, and something carved at the middle of each, and you '
              + 'cannot make it out.' },
    ],
  },
];

export const DOOR_OUTCOMES = {
  theodoxia:
    'You knock, and the gate covered over with green moss opens. An old woman in rags, lean and pale, '
    + 'her eyes on the ground and her right arm bare and pointing at heaven. Six handmaids as poorly '
    + 'dressed as she is. Behind her a solitary rock, crumbling, with a mist over it and no easy way '
    + 'up. Logistica is delighted. Thelemia says nothing at all, which is worse.',
  cosmodoxia:
    'A brown woman with fierce rolling eyes lifts a naked glittering sword, and across the middle of '
    + 'it lie a crown of gold and a branch of palm. Her arms are Hercules’ arms. Six young women '
    + 'attend her, and the work looks hard and the rewards look real. Logistica takes up the lute here '
    + 'and plays a Dorian tune, and very nearly keeps you.',
  erototrophos:
    'The ring of brass is struck and the third gate opens, and Philtronia comes to meet you — wanton, '
    + 'unconstant, and so pleasant at first sight that she takes you before you have decided anything. '
    + 'Small herbs, every sort of flower, water sliding over amber gravel. Six young women, amorously '
    + 'adorned. Logistica speaks for a long time against it, and then throws her lute on the ground '
    + 'and breaks it, and goes. This is the door Poliphilo takes.',
};
