import type { CategoryDef, ConnectionResult, PokemonRecord } from '../types';

export function isHeightConnection(
  a: PokemonRecord,
  b: PokemonRecord,
  requiredMeters: number,
): ConnectionResult {
  const valid = a.heightM === requiredMeters && b.heightM === requiredMeters;
  return {
    valid,
    categoryId: 'height',
    sharedValues: valid ? [String(requiredMeters)] : [],
    reason: valid
      ? `Both ${a.name} and ${b.name} are exactly ${requiredMeters} m tall.`
      : `${a.name} and ${b.name} are not both exactly ${requiredMeters} m tall.`,
  };
}

export const heightCategory: CategoryDef = {
  id: 'height',
  name: 'Height',
  description: 'Both Pokémon have exactly the same Pokédex height.',
  difficulty: 2,
  possibleValues: (a, b) => (a.heightM === b.heightM ? [{ categoryId: 'height', meters: a.heightM }] : []),
  check: (a, b, value) => {
    if (value.categoryId !== 'height') throw new Error('height category received mismatched value');
    return isHeightConnection(a, b, value.meters);
  },
  formatValue: (value) => {
    if (value.categoryId !== 'height') throw new Error('height category received mismatched value');
    return `${value.meters} m`;
  },
};
