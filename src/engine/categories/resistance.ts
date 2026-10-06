import type { CategoryDef, CategoryValue, ConnectionResult, PokemonRecord, PokemonType } from '../types';
import { combinations } from '../combinatorics';

function sharedResistances(a: PokemonRecord, b: PokemonRecord): PokemonType[] {
  return a.resistances.filter((t) => b.resistances.includes(t));
}

export function isResistanceConnection(
  a: PokemonRecord,
  b: PokemonRecord,
  requiredTypes: PokemonType[],
): ConnectionResult {
  const shared = sharedResistances(a, b);
  const valid = requiredTypes.length > 0 && requiredTypes.every((t) => shared.includes(t));
  return {
    valid,
    categoryId: 'resistance',
    sharedValues: valid ? requiredTypes : [],
    reason: valid
      ? `Both ${a.name} and ${b.name} resist ${requiredTypes.join(', ')}.`
      : `${a.name} and ${b.name} do not share a resistance to all of: ${requiredTypes.join(', ')}.`,
  };
}

export const resistanceCategory: CategoryDef = {
  id: 'resistance',
  name: 'Resistance',
  description: 'Both Pokémon resist the same specific set of attacking type(s).',
  difficulty: 4,
  possibleValues: (a, b) => {
    const shared = sharedResistances(a, b);
    const maxSubsetSize = Math.min(3, shared.length);
    const values: CategoryValue[] = [];
    for (let size = 1; size <= maxSubsetSize; size++) {
      for (const subset of combinations(shared, size)) {
        values.push({ categoryId: 'resistance', types: subset });
      }
    }
    return values;
  },
  check: (a, b, value) => {
    if (value.categoryId !== 'resistance') throw new Error('resistance category received mismatched value');
    return isResistanceConnection(a, b, value.types);
  },
  formatValue: (value) => {
    if (value.categoryId !== 'resistance') throw new Error('resistance category received mismatched value');
    return value.types.join(', ');
  },
};
