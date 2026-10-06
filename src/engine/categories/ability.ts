import { allAbilities } from '../dataset';
import type { CategoryDef, ConnectionResult, PokemonRecord } from '../types';

function sharedAbilities(a: PokemonRecord, b: PokemonRecord): string[] {
  const bAbilities = new Set(allAbilities(b));
  return allAbilities(a).filter((ability) => bAbilities.has(ability));
}

export function isAbilityConnection(
  a: PokemonRecord,
  b: PokemonRecord,
  requiredAbility: string,
): ConnectionResult {
  const shared = sharedAbilities(a, b);
  const valid = shared.includes(requiredAbility);
  return {
    valid,
    categoryId: 'ability',
    sharedValues: valid ? [requiredAbility] : [],
    reason: valid
      ? `Both ${a.name} and ${b.name} can have ${requiredAbility}.`
      : `${a.name} and ${b.name} do not share the ability ${requiredAbility}.`,
  };
}

export const abilityCategory: CategoryDef = {
  id: 'ability',
  name: 'Ability',
  description: 'Both Pokémon can have a specific ability (normal or hidden).',
  difficulty: 2,
  possibleValues: (a, b) => sharedAbilities(a, b).map((ability) => ({ categoryId: 'ability', ability })),
  check: (a, b, value) => {
    if (value.categoryId !== 'ability') throw new Error('ability category received mismatched value');
    return isAbilityConnection(a, b, value.ability);
  },
  formatValue: (value) => {
    if (value.categoryId !== 'ability') throw new Error('ability category received mismatched value');
    return value.ability;
  },
};
