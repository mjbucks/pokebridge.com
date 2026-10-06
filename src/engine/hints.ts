import { DATASET } from './dataset';
import { checkConnection } from './connection';
import type { PokemonRecord, RequiredCategorySlot } from './types';

/**
 * Brute-force (but infrequent — only called when a player requests a hint)
 * scan for every dataset Pokémon that would validly connect from `current`
 * for this exact required category slot.
 */
export function findValidCandidates(
  current: PokemonRecord,
  slot: RequiredCategorySlot,
  excludeIds: ReadonlySet<number>,
): PokemonRecord[] {
  const candidates: PokemonRecord[] = [];
  for (const candidate of DATASET) {
    if (candidate.id === current.id || excludeIds.has(candidate.id)) continue;
    if (checkConnection(current, candidate, slot).valid) candidates.push(candidate);
  }
  return candidates;
}
