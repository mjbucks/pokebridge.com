import { DATASET, getPokemonById } from './dataset';
import { checkConnectionAny, checkRequiredConnection } from './connection';
import { shuffle, type RNG } from './rng';
import { solvePuzzle } from './solver';
import type { PokemonRecord, RequiredCategorySlot, Specificity } from './types';

/**
 * Brute-force (but infrequent — only called when a player requests a hint)
 * scan for every dataset Pokémon that would validly connect from `current`
 * for this required category slot, under the puzzle's current specificity.
 */
export function findValidCandidates(
  current: PokemonRecord,
  slot: RequiredCategorySlot,
  excludeIds: ReadonlySet<number>,
  specificity: Specificity,
): PokemonRecord[] {
  const candidates: PokemonRecord[] = [];
  for (const candidate of DATASET) {
    if (candidate.id === current.id || excludeIds.has(candidate.id)) continue;
    const result =
      specificity === 'hard'
        ? checkRequiredConnection(current, candidate, slot, 'hard')
        : checkConnectionAny(current, candidate, slot.categoryId);
    if (result.valid) candidates.push(candidate);
  }
  return candidates;
}

export interface HintResult {
  /** Total Pokémon that validly connect here at all. */
  totalCandidates: number;
  /** A specific recommended Pokémon, when one was found. */
  example: PokemonRecord | null;
  /**
   * True if `example` was verified (within a search budget) to still leave
   * the rest of the puzzle solvable — not just valid for this one step.
   * False means we couldn't verify it in time; it might be a dead end.
   */
  exampleIsSafe: boolean;
}

/**
 * Picks a hint. When this isn't the final required category, it tries a
 * bounded number of valid candidates and, for each, runs a capped solver
 * from that candidate to the target using the remaining categories — so the
 * suggestion (when verified) is guaranteed not to strand the player, rather
 * than just being locally valid for this one step.
 */
export function buildHint(
  current: PokemonRecord,
  slot: RequiredCategorySlot,
  remainingSlotsAfterThis: RequiredCategorySlot[],
  target: PokemonRecord,
  excludeIds: ReadonlySet<number>,
  specificity: Specificity,
  rng: RNG,
): HintResult {
  const candidates = findValidCandidates(current, slot, excludeIds, specificity);
  if (candidates.length === 0) {
    return { totalCandidates: 0, example: null, exampleIsSafe: false };
  }

  // Reaching the target directly: no further search exists to verify, the
  // candidate just has to literally be the target.
  if (remainingSlotsAfterThis.length === 0) {
    const example = candidates.find((c) => c.id === target.id) ?? null;
    return { totalCandidates: candidates.length, example, exampleIsSafe: example !== null };
  }

  const remainingCategoryIds = remainingSlotsAfterThis.map((s) => s.categoryId);
  const shuffled = shuffle(candidates, rng);
  const maxAttempts = Math.min(15, shuffled.length);

  for (let i = 0; i < maxAttempts; i++) {
    const candidate = shuffled[i];
    const result = solvePuzzle(candidate, target, remainingCategoryIds, {
      maxSolutions: 1,
      maxNodesExplored: 15_000,
    });
    if (result.solutions.length > 0) {
      return { totalCandidates: candidates.length, example: candidate, exampleIsSafe: true };
    }
  }

  // Couldn't verify any candidate in the budget — fall back to a plain example.
  return { totalCandidates: candidates.length, example: shuffled[0], exampleIsSafe: false };
}

export function resolveTarget(targetId: number): PokemonRecord {
  const target = getPokemonById(targetId);
  if (!target) throw new Error(`Unknown target Pokémon id ${targetId}`);
  return target;
}
