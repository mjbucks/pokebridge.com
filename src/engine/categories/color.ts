import type { CategoryDef, ConnectionResult, PokedexColor, PokemonRecord } from '../types';

export function isColorConnection(
  a: PokemonRecord,
  b: PokemonRecord,
  requiredColor: PokedexColor,
): ConnectionResult {
  const valid = a.color === requiredColor && b.color === requiredColor;
  return {
    valid,
    categoryId: 'color',
    sharedValues: valid ? [requiredColor] : [],
    reason: valid
      ? `Both ${a.name} and ${b.name} are classified as ${requiredColor} Pokémon.`
      : `${a.name} and ${b.name} are not both classified as ${requiredColor}.`,
  };
}

export const colorCategory: CategoryDef = {
  id: 'color',
  name: 'Color',
  description: 'Both Pokémon share the same official Pokédex color classification.',
  difficulty: 2,
  possibleValues: (a, b) => (a.color === b.color ? [{ categoryId: 'color', color: a.color }] : []),
  check: (a, b, value) => {
    if (value.categoryId !== 'color') throw new Error('color category received mismatched value');
    return isColorConnection(a, b, value.color);
  },
  formatValue: (value) => {
    if (value.categoryId !== 'color') throw new Error('color category received mismatched value');
    return value.color;
  },
};
