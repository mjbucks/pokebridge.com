import { getPokemonById } from './dataset';
import { candidateEdgesFrom } from './neighbors';
import type { CategoryId, ChainLink, PokemonRecord, RequiredCategorySlot } from './types';

export interface SolveOptions {
  maxSolutions?: number;
  maxNodesExplored?: number;
}

export interface SolvedChain {
  chain: ChainLink[];
  required: RequiredCategorySlot[];
}

export interface SolveResult {
  solutions: SolvedChain[];
  truncated: boolean;
  isUniquelySolvable: boolean;
  chainLength: number;
}

interface Step {
  to: PokemonRecord;
  categoryId: CategoryId;
  value: RequiredCategorySlot['value'];
}

/**
 * Exhaustively (within budget) enumerates every valid solution to a puzzle,
 * for the admin "Test Puzzle" tool. Unlike the generator, this never gives up
 * early on the first success — it is used to judge puzzle quality (branching,
 * uniqueness), not just to prove solvability.
 */
export function solvePuzzle(
  start: PokemonRecord,
  target: PokemonRecord,
  categoryIds: CategoryId[],
  options: SolveOptions = {},
): SolveResult {
  const maxSolutions = options.maxSolutions ?? 25;
  const maxNodesExplored = options.maxNodesExplored ?? 300_000;

  const solutions: SolvedChain[] = [];
  let nodesExplored = 0;
  let truncated = false;

  function record(path: Step[]) {
    const chain: ChainLink[] = [
      { pokemonId: start.id, categoryId: null },
      ...path.map((step) => ({ pokemonId: step.to.id, categoryId: step.categoryId })),
    ];
    const required: RequiredCategorySlot[] = path.map((step) => ({
      categoryId: step.categoryId,
      value: step.value,
    }));
    solutions.push({ chain, required });
  }

  function explore(current: PokemonRecord, remaining: CategoryId[], visited: Set<number>, path: Step[]) {
    if (solutions.length >= maxSolutions || truncated) return;
    if (nodesExplored++ > maxNodesExplored) {
      truncated = true;
      return;
    }

    if (remaining.length === 0) {
      if (current.id === target.id) record(path);
      return;
    }

    for (const categoryId of remaining) {
      const rest = remaining.filter((c) => c !== categoryId);

      if (rest.length === 0) {
        // Final edge: must land exactly on target. `visited` deliberately
        // excludes target (see below) so it remains a selectable candidate here.
        const edges = candidateEdgesFrom(current, categoryId, visited).filter((e) => e.to.id === target.id);
        for (const edge of edges) {
          path.push({ to: edge.to, categoryId, value: edge.value });
          record(path);
          path.pop();
          if (solutions.length >= maxSolutions) return;
        }
        continue;
      }

      const edges = candidateEdgesFrom(current, categoryId, visited).filter((e) => e.to.id !== target.id);
      for (const edge of edges) {
        if (solutions.length >= maxSolutions || truncated) return;
        visited.add(edge.to.id);
        path.push({ to: edge.to, categoryId, value: edge.value });
        explore(edge.to, rest, visited, path);
        path.pop();
        visited.delete(edge.to.id);
      }
    }
  }

  // `target` is intentionally excluded from the visited set: it must remain a
  // selectable candidate for the FINAL edge, while intermediate steps filter
  // it out explicitly so it's never used as a mid-chain stop.
  explore(start, categoryIds, new Set([start.id]), []);

  return {
    solutions,
    truncated,
    isUniquelySolvable: !truncated && solutions.length === 1,
    chainLength: categoryIds.length + 1,
  };
}

export function describeChain(chain: ChainLink[]): string {
  return chain
    .map((link) => {
      const pokemon = getPokemonById(link.pokemonId);
      return pokemon ? pokemon.name : `#${link.pokemonId}`;
    })
    .join(' → ');
}
