# PokéBridge

A daily Pokémon connections puzzle: chain Pokémon from a **start** to a
**target**, using every **required category** exactly once. Each required
category carries a specific assigned value chosen at puzzle-generation time
(e.g. not just "Weakness" but "Weakness: Ground, Psychic", not just
"Generation" but "Generation 1") — you have to find a Pokémon that matches
that exact value, not just any shared trait.

Unofficial fan project — see [NOTICE.md](NOTICE.md).

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm test            # run the engine test suite once
npm run test:watch  # watch mode
npm run lint         # typecheck only
npm run build        # production build (runs tsc -b, then vite build)
npm run build:data   # regenerate src/data/pokemon.json from @pkmn/sim
```

Admin tools live at `/admin`, gated by a **soft, client-side-only** passcode
(`VITE_ADMIN_PASSCODE` env var, default `pokebridge-admin` — see
`.env.example`). This is not real auth; don't put anything sensitive behind
it.

## Architecture

```
scripts/build-data.mts   Build-time data pipeline (@pkmn/sim -> src/data/pokemon.json)
scripts/classifications.mts  Hand-curated Starter/Fossil/Pseudo-Legendary/Baby lists

src/engine/               Pure game logic. No React. This is the single
                           source of truth — UI, generator, solver, and
                           admin tools all call into it; nothing duplicates
                           connection logic.
  types.ts                 Core types: PokemonRecord, CategoryId, CategoryValue, Puzzle, ChainLink
  dataset.ts                Loads pokemon.json, builds inverted indices (by type, generation,
                             ability, each stat, bst, height, weight, color, classification,
                             weakness, resistance) for fast neighbor lookups
  categories/*.ts            One module per category (type, generation, ability, stats, bst,
                             height, weight, color, weakness, resistance, classification),
                             each exporting an isXConnection(a, b, value) function plus a
                             CategoryDef used by the generator/solver/UI
  connection.ts              checkConnection(from, to, slot) — dispatches to the registry
  neighbors.ts                Index-driven "who can `current` connect to via category X"
                             (used by both the generator and the exhaustive solver)
  generator.ts                Random-walk puzzle generation (solo/daily — always solvable by
                             construction) + best-effort point-to-point search (admin, fixed
                             start+target)
  solver.ts                  Exhaustive (budget-capped) solution enumeration for the admin
                             "Test Puzzle" tool
  validator.ts                validateSolution() independently recomputes an entire proposed
                             chain from scratch — this is the only authority on "did the
                             player actually solve it"; never trust client state alone
  puzzle.ts / puzzleCode.ts   Builds Puzzle objects for solo/daily/challenge modes; encodes/
                             decodes a puzzle into a URL-safe challenge code
  hints.ts, search.ts, scoring.ts, rng.ts, combinatorics.ts  Supporting utilities

src/hooks/useGame.ts       Play-time state machine: chain, used categories, wrong guesses,
                           hints, win detection (re-validates via validateSolution before
                           declaring victory)
src/pages/                 HomePage, DailyPage, SoloPage, ChallengePage (/play/:code), AdminPage
src/components/            Presentational pieces (PokemonCard, CategoryChip, ChainView, search, etc.)
```

### Why @pkmn/sim for data

The dataset is derived at build time from `@pkmn/sim` (the Pokémon Showdown
simulator's bundled data, MIT licensed) rather than hand-entered or fetched
live from PokeAPI. It gives typed, internally-consistent types/abilities/
stats/height/weight/color/generation and an authoritative type chart, so
weaknesses/resistances are *computed*, never hand-entered. Classifications
not present in that data (Starter, Fossil, Pseudo-Legendary, Baby) are
hand-curated in `scripts/classifications.mts`; Legendary/Mythical/Ultra
Beast/Paradox come straight from `@pkmn/sim`'s tags.

Current scope: **Gen 1–9, base forms only** (no mega evolutions, regional
forms, or Gigantamax) — 1025 Pokémon. Re-run `npm run build:data` any time
to regenerate; adjust `DEX_SCOPE_MIN`/`DEX_SCOPE_MAX` in
`scripts/build-data.mts` to change the range.

### Required-category values are fixed at generation time

This is the main design decision that isn't obvious from the spec text:
every required category slot in a `Puzzle` carries a specific
`CategoryValue` (e.g. `{ categoryId: 'weakness', types: ['Ground', 'Psychic'] }`),
not just a bare category name. The player picks an unused category, then
must find a next Pokémon for which `checkConnection(current, candidate, slot)`
is valid for *that exact value* — not any shared trait. This is what the
category chips show up front (e.g. "WEAKNESS — Ground, Psychic").

### Generator strategy

Finding a path between two *specific* arbitrary Pokémon that uses an exact
set of categories is a hard constrained-search problem. Rather than fighting
that for every mode, generation works two ways:

- **Solo/Daily** (`generateRandomPuzzle`): build a valid chain by random walk
  first, then derive start/target from its ends. Always solvable by
  construction — confirmed by a 300-puzzle stress test in
  `tests/engine/generator.test.ts`.
- **Admin, fixed start+target** (`generatePuzzleBetween`): best-effort
  backtracking search with a work budget; returns `null` if it can't find a
  path, so the admin adjusts parameters and retries.

The admin "Test Puzzle" button runs a separate exhaustive (budget-capped)
solver (`solver.ts`) to report solution count, uniqueness, and every
connection's reasoning — independent of whatever the generator found.

## Known v1 gaps

- Admin tool doesn't yet support manually hand-building a specific chain
  step-by-step (spec section 14) — only generate + test + save. Generate
  with a fixed start/target plus a chosen category pool gets you most of the
  way there.
- "Save Puzzle" exports JSON / copies a challenge link; there's no curated
  puzzle pack feeding the Daily mode yet — Daily is fully procedural
  (seeded by UTC date) rather than hand-picked.
- No backend, by design (per spec) — daily streaks and challenge codes are
  client-side only (`localStorage` / URL-encoded puzzle state).
- JS bundle is ~680KB un-gzipped (~124KB gzipped), mostly the 1025-entry
  Pokémon dataset. Fine for v1; worth revisiting with code-splitting if it
  becomes a problem.
