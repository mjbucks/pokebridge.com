import { ALL_CATEGORY_IDS } from './categories';
import { getPokemonById } from './dataset';
import { createRng, hashString, randomInt, type RNG } from './rng';
import { generateRandomPuzzle, type GeneratedPuzzle } from './generator';
import { decodePuzzleCode, encodePuzzleCode } from './puzzleCode';
import type { CategoryId, Puzzle, Specificity } from './types';

function lengthTierFor(categoryCount: number): Puzzle['lengthTier'] {
  if (categoryCount <= 6) return 'easy';
  if (categoryCount <= 8) return 'medium';
  return 'hard';
}

function toPuzzle(id: string, mode: Puzzle['mode'], generated: GeneratedPuzzle, specificity: Specificity): Puzzle {
  return {
    id,
    mode,
    start: generated.start.id,
    target: generated.target.id,
    required: generated.required,
    lengthTier: lengthTierFor(generated.required.length),
    specificity,
    createdAt: new Date().toISOString(),
  };
}

export interface SoloPuzzleOptions {
  categoryPool?: CategoryId[];
  minCategories?: number;
  maxCategories?: number;
  preferRare?: boolean;
  preferObscure?: boolean;
  specificity?: Specificity;
  rng?: RNG;
}

export function buildSoloRandomPuzzle(options: SoloPuzzleOptions = {}): { puzzle: Puzzle; generated: GeneratedPuzzle } {
  const rng = options.rng ?? createRng(Date.now() ^ Math.floor(Math.random() * 0xffffffff));
  const min = options.minCategories ?? 5;
  const max = options.maxCategories ?? 10;
  const categoryCount = randomInt(min, max, rng);
  const generated = generateRandomPuzzle({
    categoryPool: options.categoryPool ?? ALL_CATEGORY_IDS,
    categoryCount,
    rng,
    preferRare: options.preferRare,
    preferObscure: options.preferObscure,
  });
  return {
    puzzle: toPuzzle(`solo-${Date.now()}`, 'solo', generated, options.specificity ?? 'hard'),
    generated,
  };
}

/** YYYY-MM-DD in UTC, so every player on a given calendar day gets the same puzzle. */
export function todayUtcDateString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function buildDailyPuzzle(
  dateStr: string,
  specificity: Specificity = 'hard',
  categoryPool: CategoryId[] = ALL_CATEGORY_IDS,
): { puzzle: Puzzle; generated: GeneratedPuzzle } {
  const seed = hashString(`pokebridge-daily-v1-${specificity}-${dateStr}`);
  const rng = createRng(seed);
  const categoryCount = randomInt(5, 10, rng);
  const generated = generateRandomPuzzle({ categoryPool, categoryCount, rng });
  return {
    puzzle: toPuzzle(`daily-${specificity}-${dateStr}`, 'daily', generated, specificity),
    generated,
  };
}

export function puzzleToChallengeCode(puzzle: Puzzle): string {
  return encodePuzzleCode(puzzle.start, puzzle.target, puzzle.required, puzzle.specificity);
}

export function puzzleFromChallengeCode(code: string): Puzzle | null {
  const decoded = decodePuzzleCode(code);
  if (!decoded) return null;
  if (!getPokemonById(decoded.start) || !getPokemonById(decoded.target)) return null;
  if (decoded.required.length === 0) return null;

  return {
    id: `challenge-${code.slice(0, 12)}`,
    mode: 'challenge',
    start: decoded.start,
    target: decoded.target,
    required: decoded.required,
    lengthTier: lengthTierFor(decoded.required.length),
    specificity: decoded.specificity,
    createdAt: new Date().toISOString(),
  };
}
