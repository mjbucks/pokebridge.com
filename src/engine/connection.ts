import { getCategory } from './categories';
import type { ConnectionResult, PokemonRecord, RequiredCategorySlot } from './types';

/** Single source of truth for "does this edge satisfy this required category slot". */
export function checkConnection(
  from: PokemonRecord,
  to: PokemonRecord,
  slot: RequiredCategorySlot,
): ConnectionResult {
  const category = getCategory(slot.categoryId);
  return category.check(from, to, slot.value);
}

export function formatRequiredValue(slot: RequiredCategorySlot): string {
  const category = getCategory(slot.categoryId);
  return category.formatValue(slot.value);
}
