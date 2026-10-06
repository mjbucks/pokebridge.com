import type { PokemonRecord } from '../engine/types';
import { TypeBadge } from './TypeBadge';

interface PokemonCardProps {
  pokemon: PokemonRecord;
  label?: string;
  size?: 'sm' | 'lg';
  highlight?: 'start' | 'target' | 'current';
}

const HIGHLIGHT_RING: Record<string, string> = {
  start: 'ring-brand-400',
  target: 'ring-accent-400',
  current: 'ring-emerald-400',
};

export function PokemonCard({ pokemon, label, size = 'lg', highlight }: PokemonCardProps) {
  const isLarge = size === 'lg';
  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3">
      {label && (
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 sm:text-sm">
          {label}
        </span>
      )}
      <div
        className={`flex items-center justify-center rounded-3xl bg-white shadow-md ring-4 dark:bg-slate-900 ${
          highlight ? HIGHLIGHT_RING[highlight] : 'ring-slate-200 dark:ring-slate-800'
        } ${isLarge ? 'h-40 w-40 sm:h-52 sm:w-52 lg:h-60 lg:w-60' : 'h-24 w-24 sm:h-28 sm:w-28'}`}
      >
        <img
          src={pokemon.spriteUrl}
          alt={pokemon.name}
          loading="lazy"
          className={isLarge ? 'h-32 w-32 object-contain sm:h-44 sm:w-44 lg:h-52 lg:w-52' : 'h-20 w-20 object-contain sm:h-24 sm:w-24'}
        />
      </div>
      <span className={`font-display font-bold ${isLarge ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'}`}>
        {pokemon.name}
      </span>
      {isLarge && (
        <div className="flex gap-1.5">
          {pokemon.types.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </div>
      )}
    </div>
  );
}
