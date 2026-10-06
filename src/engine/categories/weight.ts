import type { CategoryDef, ConnectionResult, PokemonRecord } from '../types';

export function isWeightConnection(
  a: PokemonRecord,
  b: PokemonRecord,
  requiredKg: number,
): ConnectionResult {
  const valid = a.weightKg === requiredKg && b.weightKg === requiredKg;
  return {
    valid,
    categoryId: 'weight',
    sharedValues: valid ? [String(requiredKg)] : [],
    reason: valid
      ? `Both ${a.name} and ${b.name} weigh exactly ${requiredKg} kg.`
      : `${a.name} and ${b.name} do not both weigh exactly ${requiredKg} kg.`,
  };
}

export const weightCategory: CategoryDef = {
  id: 'weight',
  name: 'Weight',
  description: 'Both Pokémon have exactly the same Pokédex weight.',
  difficulty: 2,
  possibleValues: (a, b) => (a.weightKg === b.weightKg ? [{ categoryId: 'weight', kg: a.weightKg }] : []),
  check: (a, b, value) => {
    if (value.categoryId !== 'weight') throw new Error('weight category received mismatched value');
    return isWeightConnection(a, b, value.kg);
  },
  formatValue: (value) => {
    if (value.categoryId !== 'weight') throw new Error('weight category received mismatched value');
    return `${value.kg} kg`;
  },
};
