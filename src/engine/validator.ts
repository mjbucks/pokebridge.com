import { checkConnection } from './connection';
import { getPokemonById } from './dataset';
import type { ChainLink, ConnectionResult, Puzzle } from './types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  steps: ConnectionResult[];
}

/**
 * Independently recomputes an entire proposed solution chain from scratch.
 * Never trust client-displayed state alone — this is the single authority
 * for "did the player actually solve the puzzle".
 */
export function validateSolution(puzzle: Puzzle, chain: ChainLink[]): ValidationResult {
  const errors: string[] = [];
  const steps: ConnectionResult[] = [];

  if (chain.length === 0) {
    return { valid: false, errors: ['Chain is empty.'], steps };
  }
  if (chain[0].pokemonId !== puzzle.start) {
    errors.push('Chain does not start with the required starting Pokémon.');
  }
  if (chain[0].categoryId !== null) {
    errors.push('The starting link must not have a category.');
  }
  if (chain.length !== puzzle.required.length + 1) {
    errors.push(
      `Chain has ${chain.length} Pokémon, but ${puzzle.required.length + 1} are required for ${puzzle.required.length} categories.`,
    );
  }
  const last = chain[chain.length - 1];
  if (last.pokemonId !== puzzle.target) {
    errors.push('Chain does not end with the required target Pokémon.');
  }

  const seenPokemon = new Set<number>();
  for (const link of chain) {
    if (seenPokemon.has(link.pokemonId)) {
      errors.push(`Pokémon #${link.pokemonId} is used more than once in the chain.`);
    }
    seenPokemon.add(link.pokemonId);
  }

  const requiredIds = puzzle.required.map((slot) => slot.categoryId);
  const usedIds = chain.slice(1).map((link) => link.categoryId);
  const requiredCounts = new Map<string, number>();
  for (const id of requiredIds) requiredCounts.set(id, (requiredCounts.get(id) ?? 0) + 1);
  const usedCounts = new Map<string, number>();
  for (const id of usedIds) {
    if (id === null) {
      errors.push('Every non-starting link must specify which category was used.');
      continue;
    }
    usedCounts.set(id, (usedCounts.get(id) ?? 0) + 1);
  }
  for (const [id, count] of requiredCounts) {
    if ((usedCounts.get(id) ?? 0) !== count) {
      errors.push(`Category "${id}" must be used exactly ${count} time(s); got ${usedCounts.get(id) ?? 0}.`);
    }
  }
  for (const id of usedCounts.keys()) {
    if (!requiredCounts.has(id)) {
      errors.push(`Category "${id}" was used but is not part of this puzzle's required categories.`);
    }
  }

  // If structure is already broken, don't attempt to walk the chain for edge checks.
  if (errors.length === 0) {
    for (let i = 1; i < chain.length; i++) {
      const fromRecord = getPokemonById(chain[i - 1].pokemonId);
      const toRecord = getPokemonById(chain[i].pokemonId);
      const categoryId = chain[i].categoryId;
      if (!fromRecord || !toRecord || !categoryId) {
        errors.push(`Link ${i} references an unknown Pokémon or category.`);
        continue;
      }
      const slot = puzzle.required.find((s) => s.categoryId === categoryId);
      if (!slot) {
        errors.push(`Link ${i} uses category "${categoryId}", which is not required by this puzzle.`);
        continue;
      }
      const result = checkConnection(fromRecord, toRecord, slot);
      steps.push(result);
      if (!result.valid) {
        errors.push(`Link ${i} (${fromRecord.name} → ${toRecord.name}) is invalid: ${result.reason}`);
      }
    }
  }

  return { valid: errors.length === 0, errors, steps };
}
