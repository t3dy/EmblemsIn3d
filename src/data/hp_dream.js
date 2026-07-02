// hp_dream.js — the script of "Poliphilo's Dream": twelve stops that walk the
// player through the plot of the Hypnerotomachia Poliphili (Venice, 1499).
//
// Prose summaries are original, written to follow the book closely. Quoted
// matter is limited to public-domain sources: the Latin/Greek of the 1499
// edition itself (mottoes, inscriptions, the famous acrostic) and the title
// of the Elizabethan English version (R. D., London, 1592). Where the 1499
// hieroglyphs are "read", the reading is the book's own Latin gloss.
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
      { text: 'He walks until walking loses its direction. Thorns take his clothes; roots take his feet. Somewhere a wolf crosses his way, mouth full, eyes indifferent, and is gone — the first living thing the dream has shown him, and no comfort at all.' },
      { text: 'Parched and lost, he prays to Jupiter and stumbles free of the trees. A stream sings somewhere ahead — but each time he kneels to drink, a distant music draws the water from his mind. Exhausted, he sleeps again; and within the first dream a second opens, deeper, where the marvels wait.',
        quote: 'Hypnerotomachia: The Strife of Loue in a Dreame.',
        source: 'title of the English version, London 1592' },
    ],
  },
  {
    id: 'portal',
    title: 'The Great Portal',
    path: [[0, 36], [0, 32.5]],
    look: [0, 26],
    pitch: 0.2,
    beats: [
      { text: 'The second dream sets him down in a valley closed by a work no human age could match: a stepped mountain of stone, part pyramid, part gate, crowned with an obelisk that needles the sky. Poliphilo the lover is also Poliphilo the antiquarian — he forgets his fear and begins, helplessly, to measure it.' },
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
      { text: 'Among the ruins stands a marvel he circles three times before believing: an elephant of black stone, saddled not with a rider but with an obelisk, as if patience itself had been made to carry the sky. Within its flanks, the book says, lie two tombs — a king and a queen of some perished age.' },
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
      { text: 'Five nymphs find him trembling at a fountain’s lip and laugh his fear away. They are the five senses, and they bear the names of their offices in Greek: Aphea who is Touch, Osfressia who is Smell, Orassia who is Sight, Achoe who is Hearing, Geussia who is Taste. They bathe with him, anoint him, and lead him — teasing him all the way — to their mistress.' },
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
      { text: 'In the living rock stand three doors, and over each a name in Greek, Latin, Hebrew and Arabic. To the left, the steep gate of the ascetics; in the centre, the worldly gate of works and fame; to the right, a gate wreathed in flowers.',
        quote: 'Gloria Dei · Gloria Mundi · Mater Amoris',
        source: 'the inscriptions of the three doors, f.119' },
      { text: 'Logistica argues the left-hand door with all the force of Reason — the hard climb, the imperishable reward. She plays a hymn to it on her lyre. Behind the first door an old woman in rags waits on a barren crag; behind the second, crowned Labour with her sword. Poliphilo’s eyes keep sliding to the third.' },
      { text: 'At the flowered gate a company of nymphs looks out, and among them — he is almost sure — a face he knows. Thelemia smiles. Logistica, defeated, hurls down her lyre and departs without a word. Poliphilo, being Poliphilo, chooses the Mother of Love. The door closes behind him like water.' },
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
      { text: 'Across the meadow roll four triumphal cars, wheels of jasper, teams garlanded, each celebrating one of Jupiter’s loves. First Europa, borne over the sea on the white bull; the nymphs around her car sing the abduction as if it were a wedding.' },
      { text: 'Then Leda and the swan, drawn in state; then Danaë, whose tower could not keep out a god who came as golden rain. The dreamers of 1499 read these as love’s power over heaven itself — Jupiter transformed by desire into bull, swan, gold.' },
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
      { text: 'At the fountain of Venus, in the innermost ring of the innermost garden, Poliphilo at last takes Polia in his arms — and she dissolves. Like smoke, says the book; like a dream ending, because it is one. The nightingale is singing outside a window in Treviso, and it is the first of May, 1467, and the bed is cold.' },
      { text: 'Polia’s epitaph closes the book — for outside the dream she is dead, and the whole architecture of gardens and gates was built to house her. The book was printed by Aldus Manutius in Venice in 1499, and it remains the most beautiful book of its century; this garden is only its shadow.',
        quote: 'FELIX POLIA, QUAE SEPULTA VIVIS — happy Polia, who being buried, livest.',
        source: 'Polia’s epitaph, 1499' },
      { text: 'The title page had warned every reader what the dream would prove. Walk the garden as long as you like — the wolf, the Queen, the doors, the torch, the boat will keep their places. Everything here waits to be dreamed again.',
        quote: 'Ubi humana omnia non nisi somnium esse docet — where it teaches that all things human are but a dream.',
        source: 'title page of the 1499 edition' },
    ],
  },
];
