import type { CategoryDef, ConnectionResult, PokemonRecord } from '../types';

export function isGenerationConnection(
  a: PokemonRecord,
  b: PokemonRecord,
  requiredGeneration: number,
): ConnectionResult {
  const valid = a.generation === requiredGeneration && b.generation === requiredGeneration;
  return {
    valid,
    categoryId: 'generation',
    sharedValues: valid ? [String(requiredGeneration)] : [],
    reason: valid
      ? `Both ${a.name} and ${b.name} are from Generation ${requiredGeneration}.`
      : `${a.name} and ${b.name} are not both from Generation ${requiredGeneration}.`,
  };
}

export const generationCategory: CategoryDef = {
  id: 'generation',
  name: 'Generation',
  description: 'Both Pokémon were introduced in the same specific generation.',
  difficulty: 1,
  possibleValues: (a, b) =>
    a.generation === b.generation ? [{ categoryId: 'generation', generation: a.generation }] : [],
  check: (a, b, value) => {
    if (value.categoryId !== 'generation') throw new Error('generation category received mismatched value');
    return isGenerationConnection(a, b, value.generation);
  },
  formatValue: (value) => {
    if (value.categoryId !== 'generation') throw new Error('generation category received mismatched value');
    return `Gen ${value.generation}`;
  },
};
