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
  target: 'ring-amber-400',
  current: 'ring-emerald-400',
};

export function PokemonCard({ pokemon, label, size = 'lg', highlight }: PokemonCardProps) {
  const isLarge = size === 'lg';
  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {label}
        </span>
      )}
      <div
        className={`flex items-center justify-center rounded-2xl bg-white shadow-md ring-2 dark:bg-slate-900 ${
          highlight ? HIGHLIGHT_RING[highlight] : 'ring-slate-200 dark:ring-slate-800'
        } ${isLarge ? 'h-36 w-36 sm:h-44 sm:w-44' : 'h-20 w-20'}`}
      >
        <img
          src={pokemon.spriteUrl}
          alt={pokemon.name}
          loading="lazy"
          className={isLarge ? 'h-28 w-28 object-contain sm:h-36 sm:w-36' : 'h-16 w-16 object-contain'}
        />
      </div>
      <span className={`font-display font-bold ${isLarge ? 'text-lg' : 'text-sm'}`}>{pokemon.name}</span>
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
