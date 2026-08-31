// hp_dream.js — the script of "Poliphilo's Dream": twelve stops that walk the
// player through the plot of the Hypnerotomachia Poliphili (Venice, 1499).
//
// Two voices, and the player can always tell which is which.
//
//   `text`  — our own prose summary, written to follow the book closely.
//             This carries the plot: nobody is going to read all 400 pages
//             of the Hypnerotomachia standing in a garden.
//   `quote` — the book's own words, verbatim, rendered in the panel as an
//             italic blockquote with a rule and an attribution line. Never
//             paraphrase into this field.
//
// Quoted matter is public domain throughout, and of two kinds:
//   · Robert Dallington's Elizabethan English — "Hypnerotomachia: The Strife
//     of Loue in a Dreame," London, 1592 — kept in its original spelling.
//     That translation breaks off partway through the first book (it ends at
//     the seaside temple), so the later stops have no English to quote and
//     run on summary and inscription alone.
//   · The Latin and Greek of the 1499 Aldine edition itself: the mottoes,
//     the door inscriptions, the hieroglyphs' own glosses, the acrostic and
//     Polia's epitaph.
//
// Joscelyn Godwin's 1999 translation is in copyright and is not used here in
// any form. See docs/HP_SOURCEBOOK.md for the rights note.
//
// Each stop: path (waypoints [x, z] continuing from wherever the player
// stands), look/pitch to settle the camera, an optional guide who walks
// ahead, and click-to-continue narration beats.

export const DREAM_STOPS = [
  {
    id: 'wood',
    title: 'The Dark Wood',
    path: [[0, 48], [0, 44], [0, 40.5]],
    look: [3.5, 39],
    beats: [
      { text: 'Poliphilo has passed a night of sighs. Polia — the name means "many things," and to him means one thing only — will not have him. Toward dawn, at last, sleep takes him. And in sleep the dream begins: he finds himself on a wide silent plain, and beyond it this wood, so thick that neither light nor path survives beneath the crowns.' },
      { text: 'He walks until walking loses its direction. Thorns take his clothes; roots take his feet. Then, on his left hand, a wolf — mouth full, eyes indifferent. It is the first living thing the dream has shown him, and no comfort at all.',
        quote: '“At the sight whereof immediatly, my hayre stood right vp, and I would haue cryed out, but could not: and presently the Woolfe ranne away.”',
        source: 'R. D., The Strife of Loue in a Dreame, London 1592' },
      { text: 'Parched and lost, he prays to Jupiter and stumbles free of the trees. A stream sings somewhere ahead — but each time he kneels to drink, a distant music draws the water from his mind. Exhausted, he sleeps again; and within the first dream a second opens, deeper, where the marvels wait.' },
    ],
  },
  {
    id: 'portal',
    title: 'The Great Portal',
    path: [[0, 36], [0, 32.5]],
    look: [0, 26],
    pitch: 0.2,
    beats: [
      { text: 'The second dream sets him down in a valley closed by a work no human age could match: a stepped mountain of Parian marble, part pyramid, part gate, sealing the valley between two peaks. The book counts its courses — one thousand four hundred and ten — and crowns it with a cube, four harpies of cast metal, and an obelisk. Poliphilo the lover is also Poliphilo the antiquarian: he forgets his fear and begins, helplessly, to measure it.',
        quote: '“With what art inuented? with what power, humaine force, and incredible meanes, enuying (if I may speake it) the workmanship of the heauens, such and so mightie weights should be transported and carryed into the skyes?”',
        source: 'R. D., The Strife of Loue in a Dreame, London 1592' },
      { text: 'On the point of the obelisk a winged nymph turns on a copper pin — her robe blown abroad, her face looking back over her wings, a horn of plenty stopped and held mouth-downward in her right hand. She grinds as she turns, and the whole mountain rings with it. On the pier to his right, the head of Medusa gapes: her mouth is the door, and the stair to the summit begins in it.' },
      { text: 'He reads the carved signs on the threshold as the ancients wrote them, in pictures: an anchor, a dolphin, a circle, an eye. The book spells out their sentence in Latin — the emperor’s old paradox of speed and patience.',
        quote: 'Semper festina tarde — always hasten slowly.',
        source: 'the hieroglyphs of the great portal, as the book glosses them' },
      { text: 'From the darkness of the vault behind him comes a hiss and the scrape of scales — a dragon, vast and sudden. Poliphilo flees into the black passages beneath the pyramid, running blind through the bowels of the mountain until a thread of light shows him a way out — and into a country altogether gentler.' },
    ],
  },
  {
    id: 'elephant',
    title: 'The Elephant & Obelisk',
    path: [[0, 27], [0, 22], [0, 16], [0, 7]],
    look: [0, 0],
    pitch: 0.12,
    beats: [
      { text: 'Among the ruins stands a marvel he circles three times before believing: an elephant of stone blacker than obsidian and dusted over with gold and silver, so polished it gives back whatever stands before it. It is saddled in brass, not with a rider but with an obelisk of green Lacedaemonian stone. Its breast-strap says CEREBRVM EST IN CAPITE — the brain is in the head; the frontlet over its face says, in Greek, labour and native wit.' },
      { text: 'Seven steps climb the porphyry base, and beneath the saddle a little door opens into the beast’s body. Inside, by the light of a lamp that never goes out, stand two sepulchres — a king and a queen of some perished age. The king’s shield carries a warning in Hebrew, Greek and Latin.',
        quote: 'NVDVS ESSEM, BESTIA NI ME TEXISSET.\nQVAERE, ET INVENIES.\n\nNaked I would be, had not the beast couered me.\nSeeke, and thou shalt finde.',
        source: 'inscription within the elephant, 1499 edition' },
      { text: 'Poliphilo reads the beast as he read the gate — as a sentence in things. Strength bearing wisdom; the slowest animal carrying the most heaven-pointed stone. The dream is teaching him its grammar: everything here means, and nothing explains.',
        quote: 'Patientia est ornamentum, custodia et protectio vitae.',
        source: 'hieroglyphic gloss of the 1499 edition — patience is the ornament, guard and protection of life' },
      { text: 'All around, the grass is full of broken splendour: a colossus that groans when the wind enters its bronze mouth, cornices, half-buried gods. He would stay an age among the fragments — but the country ahead is green, and something in it is singing.' },
    ],
  },
  {
    id: 'court',
    title: 'The Court of Queen Eleuterylida',
    path: [[0, 12.8], [0, 17], [-4, 20], [-11.5, 20]],
    look: [-20, 20],
    guide: { name: 'Achoe', sub: 'HEARING', robe: 0xc8b06a },
    beats: [
      { text: 'Five nymphs find him trembling at a fountain’s lip and laugh his fear away. They are the five senses, and each is known by what she carries. One of them takes his hand and introduces the company.',
        quote: '“Giue mee thy hand, thou art verie welcome. Thou seest at this present here, that we are fiue companions, and I am called Aphea, and she that carrieth the boxes and white cloathes Offressia. This other with the shining Glasse (our delightes) her name is Orassia. Shee that carrieth the sounding Harpe is called Achol, and shee that beareth the casting bottle of precious Lyquor, is called Genshra.”',
        source: 'R. D., The Strife of Loue in a Dreame, London 1592' },
      { text: 'Aphea is Touch, and carries nothing — she is the one who offers her hand. Osfressia is Smell, with her caskets of perfume and folded white silks; Orassia is Sight, with her glass; Achoe is Hearing, with her harp; Geussia is Taste, with her golden bottle. They bathe with him in an eight-sided bath roofed with crystal, anoint him, and lead him — teasing him all the way — to their mistress.' },
      { text: 'Queen Eleuterylida — Free Will herself — keeps a court where the very floor is a lesson in geometry. She feasts Poliphilo from vessels that outdo kingdoms: courses served in gold, in jasper, in emerald; a ballet danced as a living game of chess; wine that makes the memory of the wood seem another man’s misfortune.' },
      { text: 'The Queen hears his story, and appoints him two companions for the road that no one may walk alone: Logistica, who is Reason, and Thelemia, who is Desire. "They will bring you," she says, "to the three gates in the mountain, where every dreamer must choose."' },
    ],
  },
  {
    id: 'doors',
    title: 'The Three Doors',
    path: [[-8, 20], [-3, 20], [0, 18.5]],
    look: [0, 12],
    pitch: 0.06,
    guide: { name: 'Logistica', sub: 'REASON', robe: 0x7a90b8 },
    beats: [
      { text: 'Three doors are hewn out of the living rock, in a place so barren it carries no grass at all, and over each a name in Greek, Latin, Hebrew and Arabic. On his right the steep gate of God’s glory; on his left the world’s; and in the middle the gate that nurses love.',
        quote: 'ΘΕΟΔΟΞΙΑ · ΕΡΩΤΟΤΡΟΦΟΣ · ΚΟΣΜΟΔΟΞΙΑ\nGLORIA DEI · MATER AMORIS · GLORIA MVNDI',
        source: 'the inscriptions of the three doors, 1499 edition, f.119' },
      { text: 'Behind the first, an old woman in rags on a crumbling rock, her arm bare and pointing to heaven. Behind the second, a brown fierce-eyed woman lifting a naked sword with a gold crown and a palm branch crossed upon it. Logistica borrows Thelemia’s lute, strikes a Dorian tune, and sings for the hard road.',
        quote: '“O Poliphilus, be not wearie to take paynes in thys place, for when labour and trauell is ouer-come, there will be a tyme of rest.”',
        source: 'Logistica’s song — R. D., The Strife of Loue in a Dreame, London 1592' },
      { text: 'At the middle gate stands Philtronia, whose regards are wanton and whose ground is all small herbs and flowers and water sliding over amber gravel. A company of nymphs looks out, and among them — he is almost sure — a face he knows. Thelemia smiles. Logistica casts her lute on the ground and breaks it. Poliphilo, being Poliphilo, chooses the Mother of Love.' },
    ],
  },
  {
    id: 'palace',
    title: 'The Planetary Palace',
    path: [[4.6, 14], [4.6, 9], [0, 3], [-6, 0], [-11.5, 0]],
    look: [-20, 0],
    guide: { name: 'Thelemia', sub: 'DESIRE', robe: 0xc87a8a },
    beats: [
      { text: 'Beyond the gate of Love the dream grows encyclopaedic. Thelemia leads him down a colonnade where the seven planets keep their metals on pedestals, Saturn’s dull lead rising rank by rank toward the sun’s incorruptible gold — the same ladder the alchemists climb in the Atalanta Fugiens, a century and a wood-block away.' },
      { text: 'Lead for Saturn, tin for Jupiter, iron for Mars; gold for Sol at the centre of the order; copper for Venus, quicksilver for Mercury, silver for Luna. Poliphilo handles each in turn, and each is a planet made graspable — the heavens arranged as a cabinet.' },
      { text: 'Everything in this country is number and proportion: gardens of glass, gardens of silk, a labyrinth of water where the boats go always forward and never back. Thelemia watches him wonder, and hurries him — gently — toward the one who waits.' },
    ],
  },
  {
    id: 'polia',
    title: 'Polia Found',
    path: [[-6, 0], [0, 2], [4.6, 6], [4.6, 14], [8, 18], [13, 20]],
    look: [19, 20],
    guide: { name: 'Thelemia', sub: 'DESIRE', robe: 0xc87a8a },
    beats: [
      { text: 'A nymph comes to meet him carrying a lit torch, dressed in white worked with gold. The dream will not yet say her name. She is courteous; she is amused; she is — he would swear it — Polia, though when he begs her to say so she only bids him follow.' },
      { text: 'This is the very heart of the book, and its author hid a confession in it: read the first letter of each of the thirty-eight chapters in order, and they spell a Latin sentence naming a real man and a real love.',
        quote: 'POLIAM FRATER FRANCISCVS COLVMNA PERAMAVIT — Brother Francesco Colonna loved Polia utterly.',
        source: 'the acrostic of the 1499 edition' },
      { text: 'The torch she carries is the sign of the rites to come: at the temple it will be quenched in the cistern, and by that quenching the two of them will be bound. But first the meadows are filling with music — the god of love is abroad today, and all his pageants with him.' },
    ],
  },
  {
    id: 'triumphs',
    title: 'The Four Triumphs',
    path: [[10, 16], [4.6, 12], [4, 4], [7, -3], [8, -6.5]],
    look: [10.6, -9.4],
    guide: { name: 'Polia', sub: 'THE LONG-SOUGHT', robe: 0xe8ddc0 },
    beats: [
      { text: 'Across the meadow roll four triumphal cars, each celebrating one of Jupiter’s loves. The first has wheels of Scythian emerald and a body of table diamonds set in gold, cornucopias at its four corners and harpies’ feet beneath. On it rides Europa, half-naked on the white bull, holding him by the horns. Six centaurs draw it, crowned with ivy, and on each centaur rides a nymph with an instrument.',
        quote: '“…singing so sweetly with little rounde mouthes, and playing vppon their instruments, within so celestiall a manner, as woulde keepe a man from euer dying.”',
        source: 'R. D., The Strife of Loue in a Dreame, London 1592' },
      { text: 'Their liveries are ranked: the two nearest the car in blue silk the colour of a peacock’s neck, the middle two in crimson, the two foremost in emerald green — censers, then gold trumpets with silk banners, then antique cornets. Then Leda and the swan behind six white elephants coupled two and two; then Danaë, whose tower could not keep out a god who came as golden rain.' },
      { text: 'Last comes the car of Semele, who asked to see the god unveiled and was consumed — fire riding on jasper wheels. Glory, the pageant says, is dangerous to mortals; love is a splendour at the edge of burning. Polia watches Poliphilo watch the flames.' },
    ],
  },
  {
    id: 'quinta',
    title: 'The Temple Rites',
    path: [[8, -4], [10, 0], [13, 0]],
    look: [21, 0],
    guide: { name: 'Polia', sub: 'THE LONG-SOUGHT', robe: 0xe8ddc0 },
    beats: [
      { text: 'At the round temple the high priestess meets them. Here the torch Polia carried is put out in the cistern of the goddess, and the two lovers are joined by rites older than any church that would have separated a monk from his beloved — for outside the dream, the author wore a friar’s habit.' },
      { text: 'Above the altar the dream sets its most abstract jewel: the fifth essence, the quinta essentia, hanging over the four elements the way the dodecahedron hangs over Plato’s other solids — earth, water, air and fire ranged below, and above them the substance of the heavens.' },
      { text: 'Doves are offered; roses fall out of a clear sky onto the altar; wine and sea-water mingle in the cistern. When Polia turns from the rite her veil is drawn back at last, and the dream stops pretending: it is she, and she loves him.' },
    ],
  },
  {
    id: 'fountain',
    title: 'The Fountain of Venus',
    path: [[10, 2], [4, -2], [0, -6], [0, -10.5]],
    look: [0, -20],
    pitch: 0.16,
    guide: { name: 'Polia', sub: 'POLIA', robe: 0xe8ddc0 },
    beats: [
      { text: 'At the garden’s heart the waters rise in three bowls, and above them stands the lady of the place. In the isle of Cythera, where this fountain truly belongs, a curtain hangs before the goddess; Cupid himself will tear it, and the dreamer will see Venus rising naked from the water, too bright to look at and impossible to look away from.' },
      { text: 'The god of love dips an arrow in the fountain and touches the two of them with it. Where the water burns, the dream says, the wound and the healing are the same thing. Venus crowns them with myrtle; the nymphs sing; even the water keeps time.' },
      { text: 'Mars arrives in armour to claim the goddess’s attention, and the audience is over — but the two lovers are left possessing the whole garden, and each other, in the endless afternoon of the dream.' },
    ],
  },
  {
    id: 'cythera',
    title: 'The Shore to Cythera',
    path: [[3, -14], [6, -20], [4, -27], [0, -32], [0, -36], [0, -41]],
    look: [0, -47],
    guide: { name: 'Polia', sub: 'POLIA', robe: 0xe8ddc0 },
    beats: [
      { text: 'To reach the isle at all, the lovers were rowed by Cupid himself in a boat whose oars were manned by six nymphs, over a sea that flattened at the god’s approach. Dolphins ran before the prow; the sirens sang and, for once, meant no harm by it.' },
      { text: 'Cythera is a perfect circle: a ring of cedars, then a ring of meadows, then gardens in rings within rings, narrowing to the amphitheatre of alabaster at the centre — and at the centre of the amphitheatre, the fountain where the goddess stands. The whole island is a diagram of desire: every path leads inward.' },
      { text: 'In the second, shorter book of the Hypnerotomachia, Polia tells her own side: the plague that made her vow herself to Diana, the dream-visions that punished her coldness, the moment she relented and took the fainting Poliphilo in her arms. Two dreams, told toward each other — that is the whole machine of the book.' },
    ],
  },
  {
    id: 'awakening',
    title: 'The Awakening',
    path: [[0, -41.5]],
    look: [0, -58],
    pitch: 0.06,
    beats: [
      { text: 'At the fountain of Venus, in the innermost ring of the innermost garden, Poliphilo at last takes Polia in his arms — and she dissolves. The Sun comes up like an informer. Dallington’s Elizabethan English gave out long before this page, so what follows is our own rendering of the 1499 Italian.',
        quote: '“So unlooked-for a delight snatched away, that angelic spirit taken from my eyes, and the sweet and gentle sleeping drawn out of my drowsy limbs as I woke — in that instant, alas, ah me, amorous readers, I ached all over from the hard clasping of that blessed image, that happy presence, that venerable majesty, which left me and deserted me between wondrous sweetness and piercing bitterness.”',
        source: 'ch. XXXVIII — translated from the 1499 Aldine for this project' },
      { text: 'He blames the dawn like a man robbed. Why would the Sun not trade a little of his swiftness for a little sloth? Why was he not given the drugged sleep out of Psyche’s box? A nightingale is singing in the thorns before daybreak, and it is the first of May, 1467, and the bed is cold.',
        quote: '“Sighing, risen and released from the sweet sleep, I woke of a sudden into the small hours, saying: Farewell then, Polia.”\n\nAt Treviso, where wretched Poliphilo was held fast in the most comely little thongs of Polia’s love. 1467, on the Kalends of May.',
        source: 'ch. XXXVIII and the colophon — translated from the 1499 Aldine for this project' },
      { text: 'Polia’s epitaph closes the book — for outside the dream she is dead, and the whole architecture of gardens and gates was built to house her. Her tomb is called a perfume-shop, because what is kept in it is fragrance.',
        quote: 'FŒLIX POLIA, QVÆ SEPVLTA VIVIS\n\nHappy Polia, who being buried yet live: Poliphilo, resting from dear Mars, has now made you, who were lulled asleep, keep watch.',
        source: 'Polia’s epitaph, 1499 edition; English ours' },
      { text: 'The title page had warned every reader what the dream would prove. Walk the garden as long as you like — the wolf, the Queen, the doors, the torch, the boat will keep their places. Everything here waits to be dreamed again.',
        quote: 'Ubi humana omnia non nisi somnium esse docet — where it teaches that all things human are but a dream.',
        source: 'title page of the 1499 edition' },
    ],
  },
];
