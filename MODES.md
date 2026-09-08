# Modes — the five ways through the dream, and what every addition owes each of them

*Standing rule, 2026-09-08: nothing goes into the world without being thought through in
each of the five modes and against the commentary layers. Every subject brief written from
now on carries a **"How it plays"** section using the table below. This file defines the
columns so the briefs do not have to.*

---

## The five modes

| Mode | What the reader is | Entry | Where its script lives |
|---|---|---|---|
| **Walk** | Poliphilo, on foot, at eye height (1.7 m), with floor height since 2026-09-08 | *Walk Freely* card; digits 1–9 teleport to the wonders, 0 sails, 9 returns | `HP_STATIONS` in `HPWorldScene.js`; plaques and NPC labels in the world itself |
| **Tour** | A reader being read to, station by station, with the scholarship switched on by colour | *The Novel* card; `tours.json` (38 stops) | `src/data/tours.json` — `notes[]` typed by `NOTE_TYPES`; `src/data/poliphilo.json` for the narrator's own layer |
| **Dream** (the game) | Poliphilo as a temperament you author — at each wonder you choose *how* he meets it, in one of four moods | *Poliphilo's Dream* card; twelve stops | `src/data/hp_dream.js` (paths, beats, quotes) + `hp_reactions.js` (the choices) |
| **Fly** | The dragon of plate 16, over the whole dream at once | *Fly as the Dragon* card | `src/systems/DragonFlight.js`; digits fly to the wonders |
| **Roll** | The hermaphrodite — a ball with Sol on one face and Luna on the other — eating the garden up the ladder of the metals | *Roll Up the Dream* card | `src/systems/RollUp.js`, `Masonry.js`, `Litter.js`; the census in `HPWorldScene._census` |

(*The Vaults* is a sixth thing — a side-quest roguelike under the pyramid — with its own scene; it does not see the garden and the garden does not see it.)

## The commentary layers

Ten typed layers, each a colour, each switchable, all defined in `NOTE_TYPES` in `main.js`:
**Poliphilo speaking** (first, and runnable alone — "Poliphilo alone" walks the tour hearing
nothing but the narrator reacting), *From the book*, *Renaissance context*, *Architectural
theory*, *Neoplatonic aesthetics*, *Mythological allusion*, *Allegory & symbolism*,
*Literary art*, *A difficult word*, *Alchemical reading*.

A new station is not finished until it has (a) a `quotation` note that says what stands
there in the book's words, and (b) either a Poliphilo utterance or a recorded **silence** in
`poliphilo.json` — his silences are catalogued on purpose.

## The "How it plays" table

Every brief ends with this, filled in honestly — *"nothing"* is an acceptable cell if it is
true and deliberate:

| Mode | What the reader meets | What it owes / still owes |
|---|---|---|
| Walk | | |
| Tour | | |
| Dream | | |
| Fly | | |
| Roll | | |
| Layers | which of the ten speak here, and which are silent | |

## What each mode wants from a new thing

- **Walk** wants a station (or a place inside one), colliders that let you get close without
  walking through it, a plaque with the citation, and NPC labels where the book names people.
- **Tour** wants notes. At minimum a *quotation* in the source's own words; a *gloss* if the
  book coins a word; a *myth* or *allegory* note if the thing means something. And the
  narrator: an utterance if he speaks, a silence if he pointedly does not.
- **Dream** wants nothing automatically — its twelve stops are a chosen plot, not a gazetteer.
  But its **paths are waypoints the walker follows**, so a new collider on a path stalls the
  game. Check `hp_dream.js` paths against any collider you add near a stop. And if the new
  thing is *the* event of its chapter, it wants a reaction prompt in `hp_reactions.js`.
- **Fly** wants to be seen from above: a roof, a footprint, a colour that reads at forty
  metres. Interiors are invisible to it; a building is its roofline.
- **Roll** wants three things: **every object is one object** (`_rollGroup` — a table is not
  three legs and a cloth), a **name** on the mesh or material (`userData.roll`), and, for
  anything built, **stones** (`_column`, `_ashlar`, `_arch`) so it can be undermined rather
  than swallowed. A thing over six metres is invisible to Roll; `scene._monoliths` lists them.

## Briefs that follow this rule

[`BANQUET.md`](BANQUET.md) · [`CROSSING.md`](CROSSING.md) · [`ADONIS.md`](ADONIS.md) ·
[`MASONRY.md`](MASONRY.md) · [`LITTER.md`](LITTER.md) · [`ROLLMODE.md`](ROLLMODE.md) ·
[`CHESSBOARD.md`](CHESSBOARD.md) · [`DRAGONFLIGHT.md`](DRAGONFLIGHT.md) ·
[`MUSICIANS.md`](MUSICIANS.md) · [`HARPIES.md`](HARPIES.md)
