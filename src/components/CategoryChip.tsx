import { getCategory } from '../engine/categories';
import { formatRequiredValue } from '../engine/connection';
import type { RequiredCategorySlot, Specificity } from '../engine/types';

interface CategoryChipProps {
  slot: RequiredCategorySlot;
  state: 'unused' | 'selected' | 'used';
  specificity: Specificity;
  onClick?: () => void;
}

export function CategoryChip({ slot, state, specificity, onClick }: CategoryChipProps) {
  const category = getCategory(slot.categoryId);
  const value = specificity === 'hard' ? formatRequiredValue(slot) : 'any match';

  const base =
    'flex flex-col items-center gap-0.5 rounded-2xl border-2 px-3.5 py-2.5 text-center transition-all min-w-[96px] sm:min-w-[110px] sm:px-4 sm:py-3';
  const styles =
    state === 'used'
      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 opacity-60 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
      : state === 'selected'
        ? 'border-accent-500 bg-accent-50 text-accent-700 shadow-md shadow-accent-200/50 scale-105 dark:border-accent-400 dark:bg-accent-900/30 dark:text-accent-200'
        : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-brand-500';

  return (
    <button
      type="button"
      disabled={state === 'used'}
      onClick={onClick}
      className={`${base} ${styles} ${state === 'used' ? 'cursor-default' : 'cursor-pointer'}`}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider sm:text-xs">{category.name}</span>
      <span className="font-display text-sm font-bold sm:text-base">{value}</span>
      {state === 'used' && <span className="text-[10px]">✓ used</span>}
    </button>
  );
}
