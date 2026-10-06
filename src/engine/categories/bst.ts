import type { CategoryDef, ConnectionResult, PokemonRecord } from '../types';

function computedBst(p: PokemonRecord): number {
  const s = p.stats;
  return s.hp + s.atk + s.def + s.spa + s.spd + s.spe;
}

export function isBSTConnection(
  a: PokemonRecord,
  b: PokemonRecord,
  requiredAmount: number,
): ConnectionResult {
  const valid = computedBst(a) === requiredAmount && computedBst(b) === requiredAmount;
  return {
    valid,
    categoryId: 'bst',
    sharedValues: valid ? [String(requiredAmount)] : [],
    reason: valid
      ? `Both ${a.name} and ${b.name} have a base stat total of ${requiredAmount}.`
      : `${a.name} and ${b.name} do not both have a base stat total of ${requiredAmount}.`,
  };
}

export const bstCategory: CategoryDef = {
  id: 'bst',
  name: 'Base Stat Total',
  description: 'Both Pokémon have exactly the same base stat total.',
  difficulty: 3,
  possibleValues: (a, b) =>
    computedBst(a) === computedBst(b) ? [{ categoryId: 'bst', amount: computedBst(a) }] : [],
  check: (a, b, value) => {
    if (value.categoryId !== 'bst') throw new Error('bst category received mismatched value');
    return isBSTConnection(a, b, value.amount);
  },
  formatValue: (value) => {
    if (value.categoryId !== 'bst') throw new Error('bst category received mismatched value');
    return String(value.amount);
  },
};
