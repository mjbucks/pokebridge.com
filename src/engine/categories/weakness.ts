import type { CategoryDef, CategoryValue, ConnectionResult, PokemonRecord, PokemonType } from '../types';
import { combinations } from '../combinatorics';

function sharedWeaknesses(a: PokemonRecord, b: PokemonRecord): PokemonType[] {
  return a.weaknesses.filter((t) => b.weaknesses.includes(t));
}

export function isWeaknessConnection(
  a: PokemonRecord,
  b: PokemonRecord,
  requiredTypes: PokemonType[],
): ConnectionResult {
  const shared = sharedWeaknesses(a, b);
  const valid = requiredTypes.length > 0 && requiredTypes.every((t) => shared.includes(t));
  return {
    valid,
    categoryId: 'weakness',
    sharedValues: valid ? requiredTypes : [],
    reason: valid
      ? `Both ${a.name} and ${b.name} are weak to ${requiredTypes.join(', ')}.`
      : `${a.name} and ${b.name} do not share a weakness to all of: ${requiredTypes.join(', ')}.`,
  };
}

export const weaknessCategory: CategoryDef = {
  id: 'weakness',
  name: 'Weakness',
  description: 'Both Pokémon are weak to the same specific set of attacking type(s).',
  difficulty: 4,
  possibleValues: (a, b) => {
    const shared = sharedWeaknesses(a, b);
    const maxSubsetSize = Math.min(3, shared.length);
    const values: CategoryValue[] = [];
    for (let size = 1; size <= maxSubsetSize; size++) {
      for (const subset of combinations(shared, size)) {
        values.push({ categoryId: 'weakness', types: subset });
      }
    }
    return values;
  },
  check: (a, b, value) => {
    if (value.categoryId !== 'weakness') throw new Error('weakness category received mismatched value');
    return isWeaknessConnection(a, b, value.types);
  },
  formatValue: (value) => {
    if (value.categoryId !== 'weakness') throw new Error('weakness category received mismatched value');
    return value.types.join(', ');
  },
};
