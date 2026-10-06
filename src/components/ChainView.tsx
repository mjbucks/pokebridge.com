import { getCategory } from '../engine/categories';
import { formatRequiredValue } from '../engine/connection';
import { getPokemonById } from '../engine/dataset';
import type { ChainLink, RequiredCategorySlot } from '../engine/types';
import { PokemonCard } from './PokemonCard';

interface ChainViewProps {
  chain: ChainLink[];
  required: RequiredCategorySlot[];
  targetId: number;
}

export function ChainView({ chain, required, targetId }: ChainViewProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      {chain.map((link, i) => {
        const pokemon = getPokemonById(link.pokemonId)!;
        const isStart = i === 0;
        const isTarget = link.pokemonId === targetId && i === chain.length - 1 && chain.length > 1;
        const slot = link.categoryId ? required.find((s) => s.categoryId === link.categoryId) : null;

        return (
          <div key={`${link.pokemonId}-${i}`} className="flex flex-col items-center gap-1">
            {slot && (
              <div className="flex flex-col items-center py-1 text-slate-400 dark:text-slate-500">
                <span className="text-lg leading-none">↓</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">
                  {getCategory(slot.categoryId).name}
                </span>
                <span className="text-xs font-semibold">{formatRequiredValue(slot)}</span>
              </div>
            )}
            <PokemonCard
              pokemon={pokemon}
              size="sm"
              highlight={isStart ? 'start' : isTarget ? 'target' : i === chain.length - 1 ? 'current' : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}
