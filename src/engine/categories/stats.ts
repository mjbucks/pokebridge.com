import { STAT_CATEGORY_IDS, STAT_KEY_BY_CATEGORY } from '../types';
import type { CategoryDef, ConnectionResult, PokemonRecord, StatKey } from '../types';

const STAT_LABEL: Record<StatKey, string> = {
  hp: 'HP',
  atk: 'Attack',
  def: 'Defense',
  spa: 'Special Attack',
  spd: 'Special Defense',
  spe: 'Speed',
};

export function isStatConnection(
  statKey: StatKey,
  a: PokemonRecord,
  b: PokemonRecord,
  requiredAmount: number,
): ConnectionResult {
  const categoryId = STAT_CATEGORY_IDS.find((id) => STAT_KEY_BY_CATEGORY[id] === statKey)!;
  const valid = a.stats[statKey] === requiredAmount && b.stats[statKey] === requiredAmount;
  const label = STAT_LABEL[statKey];
  return {
    valid,
    categoryId,
    sharedValues: valid ? [String(requiredAmount)] : [],
    reason: valid
      ? `Both ${a.name} and ${b.name} have exactly ${requiredAmount} base ${label}.`
      : `${a.name} and ${b.name} do not both have exactly ${requiredAmount} base ${label}.`,
  };
}

export const isHPConnection = (a: PokemonRecord, b: PokemonRecord, amount: number) =>
  isStatConnection('hp', a, b, amount);
export const isAttackConnection = (a: PokemonRecord, b: PokemonRecord, amount: number) =>
  isStatConnection('atk', a, b, amount);
export const isDefenseConnection = (a: PokemonRecord, b: PokemonRecord, amount: number) =>
  isStatConnection('def', a, b, amount);
export const isSpAttackConnection = (a: PokemonRecord, b: PokemonRecord, amount: number) =>
  isStatConnection('spa', a, b, amount);
export const isSpDefenseConnection = (a: PokemonRecord, b: PokemonRecord, amount: number) =>
  isStatConnection('spd', a, b, amount);
export const isSpeedConnection = (a: PokemonRecord, b: PokemonRecord, amount: number) =>
  isStatConnection('spe', a, b, amount);

function makeStatCategory(categoryId: (typeof STAT_CATEGORY_IDS)[number]): CategoryDef {
  const statKey = STAT_KEY_BY_CATEGORY[categoryId];
  const label = STAT_LABEL[statKey];
  return {
    id: categoryId,
    name: label,
    description: `Both Pokémon have exactly the same base ${label}.`,
    difficulty: 3,
    possibleValues: (a, b) =>
      a.stats[statKey] === b.stats[statKey]
        ? [{ categoryId, amount: a.stats[statKey] }]
        : [],
    check: (a, b, value) => {
      if (value.categoryId !== categoryId) throw new Error(`${categoryId} category received mismatched value`);
      return isStatConnection(statKey, a, b, value.amount);
    },
    formatValue: (value) => {
      if (value.categoryId !== categoryId) throw new Error(`${categoryId} category received mismatched value`);
      return String(value.amount);
    },
  };
}

export const statCategories: Record<(typeof STAT_CATEGORY_IDS)[number], CategoryDef> = {
  hp: makeStatCategory('hp'),
  attack: makeStatCategory('attack'),
  defense: makeStatCategory('defense'),
  'special-attack': makeStatCategory('special-attack'),
  'special-defense': makeStatCategory('special-defense'),
  speed: makeStatCategory('speed'),
};
