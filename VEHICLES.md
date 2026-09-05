# Vehicles — the triumphal cars and the boat

*What moves through the world carrying people, what the book requires of it, and how it is
built.*

**Read first** (`SOURCES.md` asset map): **Nygren** on the triumphs and antiquarian
beholdership; `PROCESSIONS.md`, the project's own brief; `hp.db.woodcut_catalog` for the
procession plates. Lexicon entry: *Triumphal Procession*.

---

## 1. The four triumphal cars

The processional heart of the book: four cars crossing the garden, each celebrating one of
Jupiter's transformations in pursuit of a mortal woman. See `MYTHOLOGY.md` for what they
mean; this is how they are made.

| Triumph | Motif on the car | Team | Accent |
|---|---|---|---|
| Europa | the bull | six centaurs | gold |
| Leda | the swan | six elephants | pale blue |
| Danaë | the shower of gold | six horses | deep gold |
| Semele | the fire | six leopards | flame |

**Six beasts to a car, not a pair, and every beast carries a rider.** The book is specific
and an earlier build was not. Riders sit higher on the elephant team than on the others.

Each car is a wheeled platform with a decorated body, the motif worked on its side, and a
standard. They are placed at the four corners of the processional circuit
(`TRIUMPHS` in `HPWorldScene.js`, built by `_buildTriumphs()`).

The visual exemplar is **Mantegna's *Triumphs of Caesar*** (1484–92), in the project's
Gallery — the Renaissance's own attempt to reconstruct a Roman triumph from texts, which is
exactly what Colonna's designer is doing.

## 2. Cupid's boat

The crossing to Cythera. The dreamer does not row: the crossing is Cupid's to make, and
everything seaward of the shore is fenced so the walker cannot swim it.

- a hull with a mast and sail;
- **Cupid** at the helm;
- the **standard** lettered ΑΟΡΙΚΤΗΤΟΙ, with Cupid figured on the globe above it;
- the boat's own **rebus**, which Poliphilo reads on the stern — *Amor vincit omnia*.

Built in `Cast.props` and placed by `_buildCythera()`; the boat is registered so it moves.

## 3. The pier and the shore

A timber pier of four bays on paired piles runs out over the water from a sand strip, with
sea-rails to either side. The island keeps its own coast.

## 4. Known gaps

- **The teams do not walk.** The cars are placed and the beasts stand; nothing processes.
  The book's triumphs are *moving* — the procession is the event — and this is the largest
  single gap in the world's animation.
- **No riders' attributes.** The book gives the riders instruments, garlands and trophies;
  ours are plain figures.
- **The cars have had no detail pass.** Unlike the Palace and the Court they have not been
  rebuilt from the shared classical members, and the wheels, axles and body mouldings are
  simple. Open in `NEXTSTEPS.md`.
- **The Triumph of Cupid on Cythera** (`woodcut_catalog` #143) — nymphs, satyrs, dragons and
  captives — exists as a standard but not as a procession.
- The **chariots of Venus and Diana** (`woodcut_catalog`, ch. XXIX) are not built.

## 5. Where the code is

| | |
|---|---|
| The four cars and their teams | `src/scenes/HPWorldScene.js` — `TRIUMPHS`, `_buildTriumphs()` |
| The boat, pier and shore | `_buildCythera()` |
| Boat, cart and beast props | `src/systems/Cast.js` — `props.*`, `animals.*` |
| Brief | `PROCESSIONS.md` |
