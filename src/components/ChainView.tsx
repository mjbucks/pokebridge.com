import { getCategory } from '../engine/categories';
import { getPokemonById } from '../engine/dataset';
import type { ChainLink, ConnectionResult } from '../engine/types';
import { PokemonCard } from './PokemonCard';

interface ChainViewProps {
  chain: ChainLink[];
  linkResults: (ConnectionResult | null)[];
  targetId: number;
}

export function ChainView({ chain, linkResults, targetId }: ChainViewProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      {chain.map((link, i) => {
        const isStart = i === 0;
        const isTarget = link.pokemonId === targetId && i === chain.length - 1 && chain.length > 1;
        const result = linkResults[i];

        return (
          <div key={`${link.pokemonId}-${i}`} className="flex flex-col items-center gap-1">
            {link.categoryId && result && (
              <div className="flex flex-col items-center py-1.5 text-slate-400 dark:text-slate-500">
                <span className="text-xl leading-none sm:text-2xl">↓</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300 sm:text-xs">
                  {getCategory(link.categoryId).name}
                </span>
                <span className="text-sm font-semibold sm:text-base">{result.sharedValues.join(', ')}</span>
              </div>
            )}
            <PokemonCard
              pokemon={getPokemonById(link.pokemonId)!}
              size="sm"
              label={isStart ? 'Start' : undefined}
              highlight={isStart ? 'start' : isTarget ? 'target' : i === chain.length - 1 ? 'current' : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}
