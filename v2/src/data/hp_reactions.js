// hp_reactions.js — the reaction-choices of "Poliphilo's Dream" (the game).
//
// This is where the game diverges from the tour. The tour is descriptive; here,
// at each wonder, the player chooses HOW Poliphilo meets it — the response the
// book itself gives (marked `canonical`), or a variant in one of four moods,
// each written to stay inside Colonna's register. Choices are EXPRESSIVE, not
// branching (DESIGN.md): you author a temperament, the dream reaches the same
// shore. The tally becomes a self-portrait at the waking.
//
// Moods: 'wonder' (the antiquary's eye), 'eros' (desire), 'melancholy'
// (the ache of passing), 'dread' (the uncanny). One option per moment carries
// `canonical: true` — what Poliphilo actually feels there in the 1499 text.
// Keyed by the stop `id` in hp_dream.js.

export const DREAM_REACTIONS = {
  wood: {
    prompt: 'The wood closes overhead, and the wolf turns its indifferent eye. What rises in you?',
    options: [
      { mood: 'dread', canonical: true, text: 'My hair stands upright and the cry dies in my throat — I am lost, and the dark itself has teeth.' },
      { mood: 'wonder', text: 'Even lost, I cannot stop marking how the trunks are ranked like the columns of a ruined nave.' },
      { mood: 'eros', text: "It was Polia's coldness that set me wandering; I would sooner face this wood's terror than her refusal." },
      { mood: 'melancholy', text: 'So this is where longing leads — a man alone under trees that do not care whether he lives.' },
    ],
  },
  portal: {
    prompt: 'The marble mountain seals the valley; the obelisk pricks the sky, and Medusa’s mouth is the door. What do you do before it?',
    options: [
      { mood: 'wonder', canonical: true, text: 'I forget my fear and begin, helplessly, to measure it — with what art, what power, was such a weight lifted into the heavens?' },
      { mood: 'dread', text: 'The stair to the summit begins in the Gorgon’s throat; I do not think I should go in.' },
      { mood: 'eros', text: 'A work this vast, and still it moves me less than the thought of one glance from Polia.' },
      { mood: 'melancholy', text: 'The men who raised this are dust, their names gone — and I fret over a girl who will outlive my memory of her.' },
    ],
  },
  elephant: {
    prompt: 'The black elephant kneels under its needle of stone, its flank cut with signs. What holds you?',
    options: [
      { mood: 'wonder', canonical: true, text: 'I read the signs as the ancients wrote them, in pictures — an anchor, a dolphin — and the sentence they spell is wisdom itself.' },
      { mood: 'dread', text: 'A beast of stone with a stair in its belly; the whole ruin feels like a tomb not yet finished with the living.' },
      { mood: 'eros', text: 'Even the elephant bears its burden like a bride; everything here speaks to me only of union.' },
      { mood: 'melancholy', text: 'What is all this Egypt to me — obelisks for kings ten times forgotten — when my own small grief will have no monument.' },
    ],
  },
  court: {
    prompt: 'The five sense-nymphs bathe you and lead you to the Queen’s table, course after perfumed course. How do you take it?',
    options: [
      { mood: 'eros', canonical: true, text: 'I give myself to the nymphs’ hands and the sweetness of the table — every sense is a door, and each stands open.' },
      { mood: 'wonder', text: 'I would sooner study the gold plate and the water-organs than eat; such workmanship deserves attention, not appetite.' },
      { mood: 'dread', text: 'So much pleasure, so freely given — I keep waiting for the price of it to be named.' },
      { mood: 'melancholy', text: 'A feast for one who cannot taste it; every delight only measures how far I am from the single delight I want.' },
    ],
  },
  doors: {
    prompt: 'Three doors, three lives: the glory of God, the glory of the world, the mother of Love. Which pull do you feel?',
    options: [
      { mood: 'eros', canonical: true, text: 'There is no choosing — the door of Love is already open in me; I go through it though Reason breaks her lute behind me.' },
      { mood: 'wonder', text: 'I would linger at all three thresholds, reading their titles in four tongues, before I commit to any single life.' },
      { mood: 'melancholy', text: 'Whichever I choose, I close two lives forever; every door is also a small mourning.' },
      { mood: 'dread', text: 'Doors that read the heart and open of themselves — I mistrust a choice that has already been made for me.' },
    ],
  },
  palace: {
    prompt: 'The palace is laid out to the order of the planets, each hall a heaven. What do you feel walking it?',
    options: [
      { mood: 'wonder', canonical: true, text: 'The whole building is a diagram of the sky; to walk it is to walk the heavens in little, and I am giddy with the order of it.' },
      { mood: 'eros', text: 'Seven halls for seven planets, and Venus’s the brightest — I seek her hall and hurry through the rest.' },
      { mood: 'dread', text: 'A house built to the turning of the stars; I feel watched by the very machinery of fate.' },
      { mood: 'melancholy', text: 'The heavens are eternal and I am not; this splendour only reminds me how brief a guest I am beneath it.' },
    ],
  },
  polia: {
    prompt: 'The nymph who has led you lifts her face — and it is Polia. What breaks in you?',
    options: [
      { mood: 'eros', canonical: true, text: 'My whole soul goes out toward her; the fires I hid so long leap up, and I can scarcely stand for love.' },
      { mood: 'wonder', text: 'She is more perfectly made than any statue in this garden; I look at her as at a masterwork unveiled.' },
      { mood: 'melancholy', text: 'Even now I fear this is only the dream’s kindness, and that I will wake to her old refusal.' },
      { mood: 'dread', text: 'Is it truly she — or the dream wearing her face to undo me? I dare not trust so sudden a mercy.' },
    ],
  },
  triumphs: {
    prompt: 'Four chariots roll past — Europa, Leda, Danaë, Semele — gilded, garlanded, each drawn by six beasts. How do they strike you?',
    options: [
      { mood: 'wonder', canonical: true, text: 'I have never seen such art in motion; I try to hold every carved figure before the next car sweeps it away.' },
      { mood: 'eros', text: 'Every triumph is a triumph of love — even Jove is dragged by desire; I take heart, for so am I.' },
      { mood: 'melancholy', text: 'Each of these loves ended in grief or fire; the pageant is beautiful and doomed, as all loving is.' },
      { mood: 'dread', text: 'Gods coupling as bull and swan and golden rain — there is something monstrous under the gold, and it knows my name.' },
    ],
  },
  quinta: {
    prompt: 'In the round temple the priestess lights the sacred fire and prepares the rite. What fills you at the altar?',
    options: [
      { mood: 'eros', canonical: true, text: 'This is the rite my whole life bent toward — I burn to be joined, and the flame on the altar is the flame in me.' },
      { mood: 'wonder', text: 'Even here I mark the vine-cast dome and the door of lodestone; the temple is as worth reading as the rite is worth feeling.' },
      { mood: 'dread', text: 'Blood and fire and a door that opens itself — I cannot tell if I am the worshipper or the offering.' },
      { mood: 'melancholy', text: 'So sacred a joining, and I know already it cannot last; the incense-smoke is the shape of everything I love.' },
    ],
  },
  fountain: {
    prompt: 'The curtain is torn away and Venus stands revealed in her fountain, the doves bathing her. What do you do?',
    options: [
      { mood: 'wonder', canonical: true, text: 'I can only stand and look; the goddess is the sum of every beauty the garden has spelled, and words fail me utterly.' },
      { mood: 'eros', text: 'My desire finds its source and its end here — this is what love has been pointing to since the dark wood.' },
      { mood: 'dread', text: 'To see the goddess bare was death in the old stories; I look — and wait for the punishment of looking.' },
      { mood: 'melancholy', text: 'The most beautiful thing in the world, and already I grieve that one day I must look away from it.' },
    ],
  },
  cythera: {
    prompt: 'Cupid’s boat waits at the shore, its sail lettered “Love conquers all,” the nymphs at the oars. How do you embark?',
    options: [
      { mood: 'eros', canonical: true, text: 'I step aboard without a backward look; every mystery of love breathes in this boat, and I would cross any sea for her.' },
      { mood: 'wonder', text: 'I read the standard’s three signs before I board — a flaming vase, the globe, a binding withy: “Love conquers all.”' },
      { mood: 'melancholy', text: 'Islands of pleasure are the saddest places; I board knowing the far shore is where the dream must end.' },
      { mood: 'dread', text: 'A boat built prow-for-stern, that goes where it should not — I trust the god who steers it less than I ought.' },
    ],
  },
  awakening: {
    prompt: 'At the height of the embrace Polia dissolves into fragrant smoke — “Poliphilo, farewell” — and the nightingale sings the dawn. What is left in you?',
    options: [
      { mood: 'melancholy', canonical: true, text: 'She is gone into air, and I wake with my arms full of morning; the whole world is only the place where she is not.' },
      { mood: 'eros', text: 'I reach still for the smoke of her, and would go back to sleep forever if sleep would give her again.' },
      { mood: 'wonder', text: 'Even in grief I know what I was shown — a whole antiquity, a whole heaven; no waking man has read such a book.' },
      { mood: 'dread', text: 'Was any of it true, or did the dream only borrow her to wound me? I wake more haunted than consoled.' },
    ],
  },
};
