import { getCategory } from './categories';
import type { CategoryId, CategoryValue, ConnectionResult, PokemonRecord, RequiredCategorySlot, Specificity } from './types';

/** Single source of truth for "does this edge satisfy this required category slot" (hard/exact mode). */
export function checkConnection(
  from: PokemonRecord,
  to: PokemonRecord,
  slot: RequiredCategorySlot,
): ConnectionResult {
  const category = getCategory(slot.categoryId);
  return category.check(from, to, slot.value);
}

function valueSize(value: CategoryValue): number {
  return (value.categoryId === 'weakness' || value.categoryId === 'resistance') ? value.types.length : 1;
}

/**
 * Easy-mode check: valid if ANY shared value exists for this category, not
 * just a specific pre-assigned one. Reports the simplest matching value for
 * a clean message (e.g. one shared type rather than every combination).
 */
export function checkConnectionAny(from: PokemonRecord, to: PokemonRecord, categoryId: CategoryId): ConnectionResult {
  const category = getCategory(categoryId);
  const values = category.possibleValues(from, to);
  if (values.length === 0) {
    return {
      valid: false,
      categoryId,
      sharedValues: [],
      reason: `${from.name} and ${to.name} do not share anything for ${category.name}.`,
    };
  }
  const simplest = values.reduce((best, v) => (valueSize(v) < valueSize(best) ? v : best));
  const label = category.formatValue(simplest);
  return {
    valid: true,
    categoryId,
    sharedValues: [label],
    reason: `Both ${from.name} and ${to.name} match on ${category.name} (${label}).`,
  };
}

/** Dispatches to exact (hard) or any-shared-value (easy) checking based on puzzle specificity. */
export function checkRequiredConnection(
  from: PokemonRecord,
  to: PokemonRecord,
  slot: RequiredCategorySlot,
  specificity: Specificity,
): ConnectionResult {
  return specificity === 'hard' ? checkConnection(from, to, slot) : checkConnectionAny(from, to, slot.categoryId);
}

export function formatRequiredValue(slot: RequiredCategorySlot): string {
  const category = getCategory(slot.categoryId);
  return category.formatValue(slot.value);
}
