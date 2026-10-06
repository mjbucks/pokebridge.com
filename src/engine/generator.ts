import { DATASET, INDEX } from './dataset';
import { getCategory } from './categories';
import { candidateEdgesFrom, type CandidateEdge } from './neighbors';
import { pickOne, shuffle, type RNG } from './rng';
import type { CategoryId, CategoryValue, ChainLink, PokemonRecord, RequiredCategorySlot } from './types';

export interface GenerateOptions {
  categoryPool: CategoryId[];
  categoryCount: number;
  rng: RNG;
  start?: PokemonRecord;
  target?: PokemonRecord;
  preferRare?: boolean;
  preferObscure?: boolean;
  /** Caps total neighbor-expansion work before giving up this attempt. */
  maxExpansions?: number;
}

export interface GeneratedPuzzle {
  start: PokemonRecord;
  target: PokemonRecord;
  required: RequiredCategorySlot[];
  /** The exact solution chain the generator discovered, including the start link. */
  solution: ChainLink[];
}

interface PathStep {
  to: PokemonRecord;
  categoryId: CategoryId;
  value: CategoryValue;
}

function edgePopularity(value: CategoryValue): number {
  switch (value.categoryId) {
    case 'type':
      return INDEX.byType.get(value.type)?.size ?? 0;
    case 'generation':
      return INDEX.byGeneration.get(value.generation)?.size ?? 0;
    case 'ability':
      return INDEX.byAbility.get(value.ability)?.size ?? 0;
    case 'color':
      return INDEX.byColor.get(value.color)?.size ?? 0;
    case 'classification':
      return INDEX.byClassification.get(value.classification)?.size ?? 0;
    default:
      return 0;
  }
}

function orderEdges(edges: CandidateEdge[], rng: RNG, options: GenerateOptions): CandidateEdge[] {
  let ordered = shuffle(edges, rng);
  if (options.preferRare) {
    ordered = [...ordered].sort((a, b) => {
      const aScore = a.to.classifications.length > 0 ? 0 : 1;
      const bScore = b.to.classifications.length > 0 ? 0 : 1;
      return aScore - bScore;
    });
  }
  if (options.preferObscure) {
    ordered = [...ordered].sort((a, b) => edgePopularity(a.value) - edgePopularity(b.value));
  }
  return ordered;
}

function pickCategories(pool: CategoryId[], count: number, rng: RNG): CategoryId[] {
  if (pool.length < count) {
    throw new Error(`Category pool has ${pool.length} entries but ${count} are required.`);
  }
  return shuffle(pool, rng).slice(0, count);
}

interface Budget {
  remaining: number;
}

function backtrackWalk(
  current: PokemonRecord,
  remaining: CategoryId[],
  visited: Set<number>,
  path: PathStep[],
  rng: RNG,
  options: GenerateOptions,
  requiredTarget: PokemonRecord | undefined,
  budget: Budget,
): PathStep[] | null {
  if (budget.remaining <= 0) return null;

  if (remaining.length === 0) {
    if (requiredTarget && current.id !== requiredTarget.id) return null;
    return path;
  }

  for (const categoryId of shuffle(remaining, rng)) {
    const rest = remaining.filter((c) => c !== categoryId);
    budget.remaining--;

    if (rest.length === 0 && requiredTarget) {
      const values = getCategory(categoryId).possibleValues(current, requiredTarget);
      if (values.length === 0) continue;
      const value = pickOne(values, rng);
      path.push({ to: requiredTarget, categoryId, value });
      return path;
    }

    const edges = orderEdges(candidateEdgesFrom(current, categoryId, visited), rng, options);
    for (const edge of edges) {
      if (budget.remaining <= 0) return null;
      budget.remaining--;
      visited.add(edge.to.id);
      path.push({ to: edge.to, categoryId, value: edge.value });
      const result = backtrackWalk(edge.to, rest, visited, path, rng, options, requiredTarget, budget);
      if (result) return result;
      path.pop();
      visited.delete(edge.to.id);
    }
  }

  return null;
}

function toGeneratedPuzzle(start: PokemonRecord, path: PathStep[]): GeneratedPuzzle {
  const target = path[path.length - 1].to;
  const required: RequiredCategorySlot[] = path.map((step) => ({
    categoryId: step.categoryId,
    value: step.value,
  }));
  const solution: ChainLink[] = [
    { pokemonId: start.id, categoryId: null },
    ...path.map((step) => ({ pokemonId: step.to.id, categoryId: step.categoryId })),
  ];
  return { start, target, required, solution };
}

/**
 * Builds a chain by random walk and derives start/target from its ends.
 * Always solvable by construction — used for Solo Random and Daily modes.
 */
export function generateRandomPuzzle(options: GenerateOptions): GeneratedPuzzle {
  const maxAttempts = 25;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const categories = pickCategories(options.categoryPool, options.categoryCount, options.rng);
    const start = options.start ?? pickOne(DATASET, options.rng);
    const visited = new Set<number>([start.id]);
    const budget: Budget = { remaining: options.maxExpansions ?? 20_000 };
    const path = backtrackWalk(start, categories, visited, [], options.rng, options, undefined, budget);
    if (path) return toGeneratedPuzzle(start, path);
  }
  throw new Error('Failed to generate a solvable puzzle after multiple attempts.');
}

/**
 * Best-effort point-to-point search for the admin tool, where both start and
 * target are fixed. Returns null if no solution is found within budget —
 * the admin should then adjust parameters and retry.
 */
export function generatePuzzleBetween(
  start: PokemonRecord,
  target: PokemonRecord,
  options: GenerateOptions,
): GeneratedPuzzle | null {
  if (start.id === target.id) return null;
  const maxAttempts = 40;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const categories = pickCategories(options.categoryPool, options.categoryCount, options.rng);
    const visited = new Set<number>([start.id, target.id]);
    const budget: Budget = { remaining: options.maxExpansions ?? 40_000 };
    const path = backtrackWalk(start, categories, visited, [], options.rng, options, target, budget);
    if (path) return toGeneratedPuzzle(start, path);
  }
  return null;
}
