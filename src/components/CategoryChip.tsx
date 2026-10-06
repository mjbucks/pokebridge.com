import { getCategory } from '../engine/categories';
import { formatRequiredValue } from '../engine/connection';
import type { RequiredCategorySlot } from '../engine/types';

interface CategoryChipProps {
  slot: RequiredCategorySlot;
  state: 'unused' | 'selected' | 'used';
  onClick?: () => void;
}

export function CategoryChip({ slot, state, onClick }: CategoryChipProps) {
  const category = getCategory(slot.categoryId);
  const value = formatRequiredValue(slot);

  const base =
    'flex flex-col items-center gap-0.5 rounded-xl border-2 px-3 py-2 text-center transition-all min-w-[88px]';
  const styles =
    state === 'used'
      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 opacity-60 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
      : state === 'selected'
        ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm dark:border-brand-400 dark:bg-brand-900/40 dark:text-brand-200'
        : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-brand-500';

  return (
    <button
      type="button"
      disabled={state === 'used'}
      onClick={onClick}
      className={`${base} ${styles} ${state === 'used' ? 'cursor-default' : 'cursor-pointer'}`}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider">{category.name}</span>
      <span className="text-sm font-display font-bold">{value}</span>
      {state === 'used' && <span className="text-[10px]">✓ used</span>}
    </button>
  );
}
