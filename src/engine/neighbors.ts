import { allAbilities, getPokemonById, INDEX, intersectSets } from './dataset';
import { combinations } from './combinatorics';
import { checkConnection } from './connection';
import { STAT_CATEGORY_IDS, STAT_KEY_BY_CATEGORY } from './types';
import type { CategoryId, CategoryValue, PokemonRecord, RequiredCategorySlot } from './types';

export interface CandidateEdge {
  to: PokemonRecord;
  value: CategoryValue;
}

/**
 * Enumerates candidate neighbors of `current` for a given category, using the
 * precomputed inverted indices so we never have to scan the full dataset.
 * Every candidate is independently re-verified with checkConnection before
 * being returned, so a bug in index construction can never produce a false edge.
 */
export function candidateEdgesFrom(
  current: PokemonRecord,
  categoryId: CategoryId,
  excludeIds: ReadonlySet<number>,
): CandidateEdge[] {
  const edges: CandidateEdge[] = [];

  const pushFromSet = (ids: Set<number> | undefined, value: CategoryValue) => {
    if (!ids) return;
    for (const id of ids) {
      if (id === current.id || excludeIds.has(id)) continue;
      const to = getPokemonById(id);
      if (!to) continue;
      const slot: RequiredCategorySlot = { categoryId, value };
      const result = checkConnection(current, to, slot);
      if (result.valid) edges.push({ to, value });
    }
  };

  switch (categoryId) {
    case 'type':
      for (const t of current.types) pushFromSet(INDEX.byType.get(t), { categoryId: 'type', type: t });
      break;
    case 'generation':
      pushFromSet(INDEX.byGeneration.get(current.generation), {
        categoryId: 'generation',
        generation: current.generation,
      });
      break;
    case 'ability':
      for (const ability of allAbilities(current)) {
        pushFromSet(INDEX.byAbility.get(ability), { categoryId: 'ability', ability });
      }
      break;
    case 'hp':
    case 'attack':
    case 'defense':
    case 'special-attack':
    case 'special-defense':
    case 'speed': {
      const statKey = STAT_KEY_BY_CATEGORY[categoryId as (typeof STAT_CATEGORY_IDS)[number]];
      const amount = current.stats[statKey];
      pushFromSet(INDEX.byStat[statKey].get(amount), { categoryId, amount });
      break;
    }
    case 'bst': {
      const amount = current.bst;
      pushFromSet(INDEX.byBst.get(amount), { categoryId: 'bst', amount });
      break;
    }
    case 'height':
      pushFromSet(INDEX.byHeight.get(current.heightM), { categoryId: 'height', meters: current.heightM });
      break;
    case 'weight':
      pushFromSet(INDEX.byWeight.get(current.weightKg), { categoryId: 'weight', kg: current.weightKg });
      break;
    case 'color':
      pushFromSet(INDEX.byColor.get(current.color), { categoryId: 'color', color: current.color });
      break;
    case 'classification':
      for (const c of current.classifications) {
        pushFromSet(INDEX.byClassification.get(c), { categoryId: 'classification', classification: c });
      }
      break;
    case 'weakness': {
      const maxSize = Math.min(3, current.weaknesses.length);
      for (let size = 1; size <= maxSize; size++) {
        for (const subset of combinations(current.weaknesses, size)) {
          const sets = subset.map((t) => INDEX.byWeaknessType.get(t) ?? new Set<number>());
          pushFromSet(intersectSets(sets), { categoryId: 'weakness', types: subset });
        }
      }
      break;
    }
    case 'resistance': {
      const maxSize = Math.min(3, current.resistances.length);
      for (let size = 1; size <= maxSize; size++) {
        for (const subset of combinations(current.resistances, size)) {
          const sets = subset.map((t) => INDEX.byResistanceType.get(t) ?? new Set<number>());
          pushFromSet(intersectSets(sets), { categoryId: 'resistance', types: subset });
        }
      }
      break;
    }
  }

  return edges;
}
