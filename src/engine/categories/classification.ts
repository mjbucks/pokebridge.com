import type { CategoryDef, Classification, ConnectionResult, PokemonRecord } from '../types';

function sharedClassifications(a: PokemonRecord, b: PokemonRecord): Classification[] {
  return a.classifications.filter((c) => b.classifications.includes(c));
}

export function isClassificationConnection(
  a: PokemonRecord,
  b: PokemonRecord,
  requiredClassification: Classification,
): ConnectionResult {
  const shared = sharedClassifications(a, b);
  const valid = shared.includes(requiredClassification);
  return {
    valid,
    categoryId: 'classification',
    sharedValues: valid ? [requiredClassification] : [],
    reason: valid
      ? `Both ${a.name} and ${b.name} are classified as ${requiredClassification}.`
      : `${a.name} and ${b.name} are not both classified as ${requiredClassification}.`,
  };
}

export const classificationCategory: CategoryDef = {
  id: 'classification',
  name: 'Classification',
  description: 'Both Pokémon share a specific structured classification (e.g. Legendary, Starter).',
  difficulty: 3,
  possibleValues: (a, b) =>
    sharedClassifications(a, b).map((classification) => ({ categoryId: 'classification', classification })),
  check: (a, b, value) => {
    if (value.categoryId !== 'classification') throw new Error('classification category received mismatched value');
    return isClassificationConnection(a, b, value.classification);
  },
  formatValue: (value) => {
    if (value.categoryId !== 'classification') throw new Error('classification category received mismatched value');
    return value.classification;
  },
};
