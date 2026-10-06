import type { CategoryDef, ConnectionResult, PokemonRecord, PokemonType } from '../types';

function sharedTypes(a: PokemonRecord, b: PokemonRecord): PokemonType[] {
  return a.types.filter((t) => b.types.includes(t));
}

export function isTypeConnection(
  a: PokemonRecord,
  b: PokemonRecord,
  requiredType: PokemonType,
): ConnectionResult {
  const shared = sharedTypes(a, b);
  const valid = shared.includes(requiredType);
  return {
    valid,
    categoryId: 'type',
    sharedValues: valid ? [requiredType] : [],
    reason: valid
      ? `Both ${a.name} and ${b.name} are ${requiredType} type.`
      : `${a.name} and ${b.name} do not share the ${requiredType} type.`,
  };
}

export const typeCategory: CategoryDef = {
  id: 'type',
  name: 'Type',
  description: 'Both Pokémon share a specific type.',
  difficulty: 1,
  possibleValues: (a, b) => sharedTypes(a, b).map((type) => ({ categoryId: 'type', type })),
  check: (a, b, value) => {
    if (value.categoryId !== 'type') throw new Error('type category received mismatched value');
    return isTypeConnection(a, b, value.type);
  },
  formatValue: (value) => {
    if (value.categoryId !== 'type') throw new Error('type category received mismatched value');
    return value.type;
  },
};
