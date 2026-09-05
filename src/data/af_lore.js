// af_lore.js — the scholarship of the emblems, made playable.
//
// Distilled from the discourse commentary in the project database (Maier's
// own discourses as read through H.M.E. de Jong's standard study, *Michael
// Maier's Atalanta Fugiens: Sources of an Alchemical Book of Emblems*), one
// entry per emblem:
//
//   setting — where the plate takes place (farm, laboratory, kitchen,
//             bleaching-field, seashore…), naming the location language of
//             the engravings;
//   quest   — the figure the player must find in the diorama, keyed to a
//             tagged object in the vignette;
//   figures — the visual elements and what the scholarship says they mean.
//
// The Theatrum uses this to run the Seeker's Work: walk to an emblem, find
// its key figure, and its meaning is revealed; fifty-one awakenings win the
// Stone.

export const AF_LORE = {
  0: {
    setting: 'The racecourse — the whole book in one image',
    quest: { key: 'atalanta', prompt: 'Find Atalanta, the fleeing one' },
    figures: [
      { key: 'atalanta', name: 'Atalanta', meaning: 'The fleeing maiden is volatile Mercury — and the fugue itself: Maier promises emblems for the eye, fugues for the ear, epigrams for the mind, three senses in pursuit of one secret.' },
      { key: 'hippomenes', name: 'Hippomenes', meaning: 'The pursuing suitor is the fixed principle — and the reader, who can only win the race by strategy, not speed.' },
      { key: 'apples', name: 'The golden apples', meaning: 'The three golden distractions that slow the volatile long enough to be caught: in the music, the steady cantus firmus around which the two voices race.' },
    ],
  },
  1: {
    setting: 'Open country under a great sky — the element of air',
    quest: { key: 'boreas', prompt: 'Find the Wind that carries the child in its belly' },
    figures: [
      { key: 'boreas', name: 'Boreas, the wind', meaning: 'The Emerald Tablet’s "the wind carried it in its belly": the philosophical substance is first conceived in air, as a volatile spirit, before any body can hold it.' },
      { key: 'embryo', name: 'The embryo', meaning: 'The Stone as unborn child — carried in the womb of the volatile until it can be delivered to its nurse, the earth.' },
    ],
  },
  2: {
    setting: 'A nurse’s hillock between farm and wilderness',
    quest: { key: 'earth', prompt: 'Find the Earth who gives suck' },
    figures: [
      { key: 'earth', name: 'The Earth-nurse', meaning: 'Earth is the nurse, not the mother: generation belongs to the wind, nourishment to the fixed body. Food must become the body it feeds — the earth must be assimilated into the growing Stone.' },
      { key: 'wolf', name: 'The she-wolf and the goat', meaning: 'Romulus nursed by the wolf, Jupiter by the goat Amalthea: Maier’s classical proofs that heroic natures take animal nurses — and the Stone an elemental one.' },
    ],
  },
  3: {
    setting: 'A wash-yard: tub, kettle-fire, and lines outside the walls',
    quest: { key: 'laundress', prompt: 'Find the woman who washes the sheets' },
    figures: [
      { key: 'laundress', name: 'The washerwoman', meaning: '"Do as she does": the whole albedo in homely dress. Earth-stains are lifted by water, and what water cleans, air and sun must dry — each element purified by the next.' },
      { key: 'sheets', name: 'The linens', meaning: 'The philosophical body as dirty cloth: whitened not once but by repeated washing — the circulating purifications of the work.' },
    ],
  },
  4: {
    setting: 'A garden of betrothal',
    quest: { key: 'cup', prompt: 'Find the cup of love' },
    figures: [
      { key: 'cup', name: 'The cup of love', meaning: 'The solvent that dissolves brother and sister into one new body — the coniunctio drunk rather than declared.' },
      { key: 'pair', name: 'Brother and sister', meaning: 'Masculine and feminine principles of one substance; Maier invokes Oedipus and Jocasta for the paradox of a union between natures that share one origin.' },
    ],
  },
  5: {
    setting: 'A bedchamber — the sickroom of the prima materia',
    quest: { key: 'toad', prompt: 'Find the toad set to the woman’s breast' },
    figures: [
      { key: 'toad', name: 'The toad', meaning: 'The poisonous, earthbound agent fed at the maternal breast: it drinks the nurse’s life and matures on it — the feeding kills the woman as the venom killed Cleopatra, and the work advances by that death.' },
      { key: 'woman', name: 'The nursing woman', meaning: 'The prima materia as mother: in Maier’s gendered account of the work, the feminine conceives, bears, nourishes — and is consumed.' },
    ],
  },
  6: {
    setting: 'A ploughed farm: white furrows ready for seed',
    quest: { key: 'sower', prompt: 'Find the farmer who sows gold' },
    figures: [
      { key: 'sower', name: 'The sower', meaning: 'The alchemist as farmer-physician (Maier borrows Plato’s division): he heals metals by cultivating them. The seed must be gold — nothing grows that was not sown.' },
      { key: 'gold', name: 'The golden seed', meaning: 'Sown into the "white foliated earth", a prepared mercurial soil: projection as agriculture, harvest as multiplication.' },
    ],
  },
  7: {
    setting: 'A nesting tree at the field’s edge',
    quest: { key: 'fledgling', prompt: 'Find the young bird that flies and falls back' },
    figures: [
      { key: 'fledgling', name: 'The fledgling', meaning: 'Sublimation and condensation: the volatile is driven up and falls home again, over and over, until it is mature enough to stay aloft. Nature works by cycles, not leaps.' },
      { key: 'nest', name: 'The nest-bird', meaning: 'The fixed body that holds the nest — the anchor to which every flight returns.' },
    ],
  },
  8: {
    setting: 'A laboratory-armoury: the table, the egg, the sword',
    quest: { key: 'egg', prompt: 'Find the philosophical egg' },
    figures: [
      { key: 'egg', name: 'The egg', meaning: 'The ovum philosophicum: shell as vessel, white as Mercury, yolk as Sulphur. All the work sealed in one shape — which is why the plates draw it knee-high.' },
      { key: 'sword', name: 'The fiery sword', meaning: 'Fire applied with a swordsman’s precision: the vessel must be opened to the flame without destroying what it hatches.' },
    ],
  },
  9: {
    setting: 'A walled orchard — the garden of dew',
    quest: { key: 'oldman', prompt: 'Find the old man shut in the garden' },
    figures: [
      { key: 'oldman', name: 'The old man', meaning: 'The aged, fixed body awaiting rejuvenation — Aeson made young by Medea. The tree holds him fast: fixation as a trellis for renewal.' },
      { key: 'dew', name: 'The falling dew', meaning: 'The celestial, volatile spirit descending on the fixed: gentle, repeated, and from above — the only medicine age accepts.' },
    ],
  },
  10: {
    setting: 'A furnace-room',
    quest: { key: 'furnace', prompt: 'Find the furnace that receives fire' },
    figures: [
      { key: 'furnace', name: 'The furnace', meaning: '"Give fire to fire, Mercury to Mercury": like joins like. The art fails when unlike natures are forced together; it succeeds when the common nature under different appearances is recognised.' },
      { key: 'mercury', name: 'Mercury', meaning: 'Saturn devouring his children, read chemically: metals dissolved back into their common mercurial matter — which is why Mercury must be fed only Mercury.' },
    ],
  },
  11: {
    setting: 'A bleaching-field in the sun',
    quest: { key: 'book', prompt: 'Find the books that must be torn' },
    figures: [
      { key: 'book', name: 'The torn books', meaning: 'Maier’s iconoclasm: when the whitening begins, abandon the library. The contradictory mass of authorities drives seekers to despair; the linen on the grass teaches more than the shelf.' },
      { key: 'linens', name: 'The whitening linens', meaning: 'Latona whitened: de Jong traces her name to laton, the dark alloy of Sol and Luna, bleached on the field like cloth — the albedo done in the open air.' },
    ],
  },
  12: {
    setting: 'A humble place made radiant',
    quest: { key: 'latona', prompt: 'Find Latona with her twins' },
    figures: [
      { key: 'latona', name: 'Latona', meaning: 'The impure body of mixed Sol and Luna, found in a humble place — even in dung — and made white. Mother of the sun-child and moon-child at once.' },
      { key: 'twins', name: 'Apollo and Diana', meaning: 'The twin luminaries born of one darkened mother: gold and silver latent in the same alloy, delivered by purification.' },
    ],
  },
  13: {
    setting: 'The river Jordan — a fording place with reeds',
    quest: { key: 'ore', prompt: 'Find the dropsical ore in the water' },
    figures: [
      { key: 'ore', name: 'The dropsical one', meaning: 'Naaman the leper, washed seven times: the swollen, watery stone cured by repeated immersion. Baptism and albedo read as one sevenfold washing.' },
    ],
  },
  14: {
    setting: 'A bare heath where the serpent circles',
    quest: { key: 'ouroboros', prompt: 'Find the dragon that devours its own tail' },
    figures: [
      { key: 'ouroboros', name: 'The ouroboros', meaning: 'Serpent eats serpent and becomes dragon: one substance dissolving its like, poison and medicine in a single body — the pharmakon closed into a circle.' },
    ],
  },
  15: {
    setting: 'A potter’s workshop',
    quest: { key: 'wheel', prompt: 'Find the potter’s wheel' },
    figures: [
      { key: 'wheel', name: 'The wheel', meaning: 'The whole opus in a craftsman’s hands: moisten, form, dry, fire. Nature gives the model; art must turn it. Of dry and wet the potter makes one vessel — so does the alchemist.' },
      { key: 'potter', name: 'The potter', meaning: 'The artisan as philosopher: Maier ranks honest handwork above book-learning, the sequence of the hands above the disputes of the schools.' },
    ],
  },
  16: {
    setting: 'A rocky pass between two natures',
    quest: { key: 'wingedlion', prompt: 'Find the lion that has wings' },
    figures: [
      { key: 'wingedlion', name: 'The winged lion', meaning: 'Philosophical Mercury: fugitive, aerial, unstable. It must be caught and married to its wingless brother — the feathers one has, the other must be given.' },
      { key: 'lion', name: 'The wingless lion', meaning: 'Philosophical Sulphur: earthy, fixed, enduring. Alone it is inert; joined to the winged, it holds flight still.' },
    ],
  },
  17: {
    setting: 'A laboratory hearth of four fires',
    quest: { key: 'hearth', prompt: 'Find the fourfold hearth' },
    figures: [
      { key: 'hearth', name: 'The four fires', meaning: 'Not one fire but four rule the work: the lamp’s outer flame, the slow warmth of the ash-bath, the moist heat of the water-bath, and the substance’s own inward fire.' },
    ],
  },
  18: {
    setting: 'A goldsmith’s trial room',
    quest: { key: 'gold', prompt: 'Find the gold that makes golden' },
    figures: [
      { key: 'gold', name: 'The gold', meaning: 'Fire makes things fiery — it cannot make them golden. Fire prepares and refines, but gold alone communicates its nature: the tincture must come from the thing itself.' },
    ],
  },
  19: {
    setting: 'A field of four brothers',
    quest: { key: 'fallen', prompt: 'Find the slain brother' },
    figures: [
      { key: 'fallen', name: 'The slain one', meaning: 'Kill one of the four and every body dies: the elements of the Stone are not four things but four aspects of one — Geryon’s triple body falling as one body.' },
    ],
  },
  20: {
    setting: 'A teaching grove',
    quest: { key: 'globe', prompt: 'Find the world that is the lesson' },
    figures: [
      { key: 'globe', name: 'The globe', meaning: 'Nature teaches, conquers, rules Nature: the art copies natural process, then accelerates and perfects it — Democritus’ maxim pushed one step past imitation.' },
    ],
  },
  21: {
    setting: 'A geometer’s chamber, the diagram chalked on the wall',
    quest: { key: 'compasses', prompt: 'Find the compasses that square the circle' },
    figures: [
      { key: 'compasses', name: 'The compasses', meaning: 'The Rosarium’s formula drawn in one figure: from man and woman a circle, from the circle a square (four elements), from the square a triangle (salt, sulphur, mercury), from the triangle the circle of the Stone.' },
      { key: 'philosopher', name: 'The geometer', meaning: 'The philosopher measures rather than preaches: the whole opus stated as construction, with the man and woman standing at the diagram’s secret centre.' },
    ],
  },
  22: {
    setting: 'A kitchen — the laboratory in disguise',
    quest: { key: 'pot', prompt: 'Find the pot on the fire' },
    figures: [
      { key: 'pot', name: 'The cooking pot', meaning: 'After the white lead, "women’s work": patient cooking. Steady heat, watched and tempered, matures the white body as cooking turns raw into nourishing.' },
    ],
  },
  23: {
    setting: 'Rhodes: a temple terrace under a gold shower',
    quest: { key: 'pallas', prompt: 'Find Pallas, born full-armed' },
    figures: [
      { key: 'pallas', name: 'Pallas Athena', meaning: 'Wisdom born whole from the god’s head: the Stone does not assemble by degrees but manifests complete when conditions are met — and the sky pays Rhodes in gold.' },
      { key: 'rain', name: 'The golden rain', meaning: 'The citrinitas precipitating: gold falling as weather, the yellowing stage arriving like a change of sky.' },
    ],
  },
  24: {
    setting: 'Execution ground and pyre — a two-act stage',
    quest: { key: 'wolf', prompt: 'Find the wolf that devoured the king' },
    figures: [
      { key: 'wolf', name: 'The grey wolf', meaning: 'Antimony: the voracious base substance that devours impure gold. Metallurgy in beast-fable — the assayer’s antimony purification worn as fur and teeth.' },
      { key: 'king', name: 'The king', meaning: 'Gold, noble but impure: eaten to be freed. When the wolf burns on the pyre, the king walks out of the fire renewed — dissolution then calcination, nigredo to rubedo.' },
    ],
  },
  25: {
    setting: 'The dragon’s ground before the fleece',
    quest: { key: 'dragon', prompt: 'Find the dragon that only kin can kill' },
    figures: [
      { key: 'dragon', name: 'The dragon', meaning: 'The unreformed prima materia, guarding its treasure like the dragon of the Fleece: no single agent kills it — only its own brother and sister, Sol and Luna together.' },
    ],
  },
  26: {
    setting: 'The garden of the wise',
    quest: { key: 'tree', prompt: 'Find the Tree of Life' },
    figures: [
      { key: 'tree', name: 'The Tree of Life', meaning: 'The fruit of human wisdom is the tree itself: Eden’s tree, the Hesperides’ tree, and the Stone read as one growth — reason’s highest cultivation of Nature.' },
    ],
  },
  27: {
    setting: 'The wall of the Rose-garden, gate locked',
    quest: { key: 'gate', prompt: 'Find the locked gate of the Rose-garden' },
    figures: [
      { key: 'gate', name: 'The locked gate', meaning: 'Entering without the key is walking without feet: the three inner "cookings" of digestion cannot be skipped, in the body or the vessel — no shortcut breaches the wall.' },
      { key: 'roses', name: 'The roses', meaning: 'The Rosarium’s roses over the wall: visible from outside, attainable only in sequence.' },
    ],
  },
  28: {
    setting: 'A bath-house: the sweat-cabinet of a king',
    quest: { key: 'king', prompt: 'Find King Duenech in his bath' },
    figures: [
      { key: 'king', name: 'King Duenech', meaning: 'From the Allegoria Merlini: gold sick with black bile, cured not by surgery but by gentle sustained steam — the nigredo sweated out, never cut out.' },
      { key: 'bath', name: 'The steam-bath', meaning: 'The vessel as sickroom: dissolution administered as therapy, with the fire kept low and the patient royal.' },
    ],
  },
  29: {
    setting: 'A fire-bed in open country',
    quest: { key: 'salamander', prompt: 'Find the salamander that lives in fire' },
    figures: [
      { key: 'salamander', name: 'The salamander', meaning: 'The fixed Stone proved: what is truly fixed is nourished by the flame that destroys everything else — fire as diet, not ordeal.' },
    ],
  },
  30: {
    setting: 'A farmyard under sun and moon',
    quest: { key: 'cock', prompt: 'Find the cock that is Sol' },
    figures: [
      { key: 'cock', name: 'The cock and hen', meaning: 'Sol needs Luna as the cock the hen: the plainest possible statement of the conjunction, posted in the farmyard where anyone may read it.' },
    ],
  },
  31: {
    setting: 'The open sea, a ship standing off',
    quest: { key: 'king', prompt: 'Find the king swimming in the sea' },
    figures: [
      { key: 'king', name: 'The swimming king', meaning: 'Gold dissolved in the mercurial sea, crying that his rescuer will be rewarded: fixation as rescue, multiplication as the promised reward.' },
    ],
  },
  32: {
    setting: 'A coral-fishery on the shore',
    quest: { key: 'coral', prompt: 'Find the coral beneath the water' },
    figures: [
      { key: 'coral', name: 'The coral', meaning: 'Soft as a plant under water, stone the moment it meets air: Nature’s public demonstration that a substance can change state without losing nature — fixation growing wild on the seabed.' },
    ],
  },
  33: {
    setting: 'A dark chamber with one fire',
    quest: { key: 'rebis', prompt: 'Find the Hermaphrodite lying in darkness' },
    figures: [
      { key: 'rebis', name: 'The Hermaphrodite', meaning: 'Joined but dormant: the united substance lies like a corpse until fire wakes it. The old double trial — through water, through flame — as calcination and baptism at once.' },
    ],
  },
  34: {
    setting: 'A bathing-pool under an arch',
    quest: { key: 'child', prompt: 'Find the child conceived in the bath' },
    figures: [
      { key: 'child', name: 'The bath-born child', meaning: 'Conceived in liquid, born into air, walking at last on water: the threefold progression of the substance — dissolved, volatilised, perfected.' },
    ],
  },
  35: {
    setting: 'A hearth-side nursery',
    quest: { key: 'child', prompt: 'Find the child tempered in the fire' },
    figures: [
      { key: 'child', name: 'Triptolemus', meaning: 'Ceres hardening the child in embers, Thetis dipping Achilles: fire-baptism as strengthening. What the flame does not kill, it fixes.' },
    ],
  },
  36: {
    setting: 'A mountain road',
    quest: { key: 'stone', prompt: 'Find the Stone thrown on the road' },
    figures: [
      { key: 'stone', name: 'The rejected stone', meaning: 'Cast on the earth, exalted on mountains, dwelling in air, feeding in the river: the quintessence in all four elements at once — the cornerstone the builders refused.' },
    ],
  },
  37: {
    setting: 'A workroom furnished with exactly three things',
    quest: { key: 'greenlion', prompt: 'Find the green lion' },
    figures: [
      { key: 'greenlion', name: 'The green lion', meaning: 'The raw ore of Hermes — vitriol, the unripe metallic green. With white smoke (volatile water) and the stinking water that dissolves metals, the art needs nothing else: foundation, walls, roof.' },
    ],
  },
  38: {
    setting: 'The saddle between the mounts of Mercury and Venus',
    quest: { key: 'rebis', prompt: 'Find the Rebis with square and compasses' },
    figures: [
      { key: 'rebis', name: 'The Rebis', meaning: 'The finished two-in-one, standing citizen of both domains as Socrates was citizen of the world: Mercury and Venus permanently married, geometry in each hand.' },
    ],
  },
  39: {
    setting: 'The rock before Thebes',
    quest: { key: 'sphinx', prompt: 'Find the Sphinx on her rock' },
    figures: [
      { key: 'sphinx', name: 'The Sphinx', meaning: 'The riddle of Nature. Solving her leads where Oedipus went: the father-metal destroyed, the mother-matter rewed — transgression as the normal grammar of transmutation.' },
    ],
  },
  40: {
    setting: 'A conduit where two waters meet',
    quest: { key: 'pool', prompt: 'Find the basin where two waters become one' },
    figures: [
      { key: 'pool', name: 'The mingling basin', meaning: 'The water of holiness: ascending volatile and descending fixed poured to a single menstruum — the caduceus’ two serpents run together.' },
    ],
  },
  41: {
    setting: 'A rose-brake at the wood’s edge',
    quest: { key: 'boar', prompt: 'Find the boar that killed Adonis' },
    figures: [
      { key: 'boar', name: 'The boar', meaning: 'The violent sulphurous agent of the final reddening: Adonis — the white stone, Venus’s beloved — must die by it, and his blood dyes the white roses red. Albedo bleeds into rubedo.' },
    ],
  },
  42: {
    setting: 'A night road out of town',
    quest: { key: 'lantern', prompt: 'Find the lantern of Experience' },
    figures: [
      { key: 'lantern', name: 'The lantern', meaning: 'Four guides and none sufficient alone: Nature the ground, Reason the map, Experience the lantern, Reading the report of earlier travellers. He who follows footprints in the dark carries all four.' },
      { key: 'nature', name: 'Nature walking ahead', meaning: 'The guide who never argues, only walks: her footprints are the method.' },
    ],
  },
  43: {
    setting: 'A fowler’s wood at dusk',
    quest: { key: 'owl', prompt: 'Find the screech-owl among the mobbing birds' },
    figures: [
      { key: 'owl', name: 'The screech-owl', meaning: 'Lunar, nocturnal Mercury whose call marks the true path; the evening birds shrieking around her are the false doctrines. Discernment is the whole lesson: listen past the flock.' },
    ],
  },
  44: {
    setting: 'Egypt: the scattering-field of Osiris',
    quest: { key: 'isis', prompt: 'Find Isis gathering the scattered limbs' },
    figures: [
      { key: 'isis', name: 'Isis', meaning: 'The whole opus as one myth: Typhon’s murder is the nigredo, the scattered limbs the separation, and Isis’s patient gathering the reconstitution that ends in resurrection.' },
      { key: 'osiris', name: 'Osiris', meaning: 'The archetypal philosophical body: destroyed, dispersed, and reunited more whole than before.' },
    ],
  },
  45: {
    setting: 'A surveyor’s field at low sun',
    quest: { key: 'shadow', prompt: 'Find the Sun’s shadow' },
    figures: [
      { key: 'shadow', name: 'The shadow', meaning: 'Sol and his shadow complete the work: the Stone needs the dark remainder as much as the light. Deny the nigredo’s residue and completion is impossible.' },
    ],
  },
  46: {
    setting: 'The world’s navel, marked by the omphalos',
    quest: { key: 'eagle', prompt: 'Find the eagles meeting from East and West' },
    figures: [
      { key: 'eagle', name: 'The two eagles', meaning: 'Zeus’s eagles loosed from the world’s ends meeting at Delphi: hot solar sulphur from the East, cool lunar mercury from the West, converging in mid-air where neither origin holds.' },
    ],
  },
  47: {
    setting: 'A bare field between East and West',
    quest: { key: 'wolf', prompt: 'Find the wolf out of the East' },
    figures: [
      { key: 'wolf', name: 'The wolf and the dog', meaning: 'The eagles’ meeting done again in flesh and fury: the same conjunction of opposites at the material register — corrosive mercury and fixed body at each other’s throats until neither remains unchanged.' },
    ],
  },
  48: {
    setting: 'A royal sickroom',
    quest: { key: 'flask', prompt: 'Find the physician’s flask' },
    figures: [
      { key: 'flask', name: 'The flask', meaning: 'Duenech’s last act: the king poisoned by foul waters (Xerxes drinking mud in the desert) is restored by physicians of successive schools — the elixir administered stage by stage, each tradition curing what the last could not.' },
      { key: 'king', name: 'The sick king', meaning: 'Gold contaminated by its own solvent, healed by the correct medicine rather than a stronger poison.' },
    ],
  },
  49: {
    setting: 'A threshold under sun, moon, and evening star',
    quest: { key: 'child', prompt: 'Find the child of three fathers' },
    figures: [
      { key: 'child', name: 'The philosophical child', meaning: 'Like Orion, begotten of three seeds: salt the body, sulphur the soul, mercury the spirit — three fatherings of one complete substance.' },
    ],
  },
  50: {
    setting: 'A churchyard: the open grave',
    quest: { key: 'dragon', prompt: 'Find the dragon in the grave' },
    figures: [
      { key: 'dragon', name: 'The dragon and the woman', meaning: 'The final double death: cave-dwelling volatile and air-dwelling fixed kill one another in the grave, and the Stone is born bathing in their commingled blood — the work complete because both parents are gone.' },
    ],
  },
};

export function loreFor(num) { return AF_LORE[num] || null; }
