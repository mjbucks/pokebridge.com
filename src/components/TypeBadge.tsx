import type { PokemonType } from '../engine/types';

const TYPE_COLORS: Record<PokemonType, string> = {
  Normal: 'bg-neutral-400 text-white',
  Fire: 'bg-orange-500 text-white',
  Water: 'bg-blue-500 text-white',
  Electric: 'bg-yellow-400 text-slate-900',
  Grass: 'bg-green-500 text-white',
  Ice: 'bg-cyan-300 text-slate-900',
  Fighting: 'bg-red-700 text-white',
  Poison: 'bg-purple-600 text-white',
  Ground: 'bg-amber-600 text-white',
  Flying: 'bg-indigo-300 text-slate-900',
  Psychic: 'bg-pink-500 text-white',
  Bug: 'bg-lime-500 text-slate-900',
  Rock: 'bg-stone-500 text-white',
  Ghost: 'bg-violet-700 text-white',
  Dragon: 'bg-indigo-600 text-white',
  Dark: 'bg-neutral-800 text-white',
  Steel: 'bg-slate-400 text-slate-900',
  Fairy: 'bg-pink-300 text-slate-900',
};

export function TypeBadge({ type, className = '' }: { type: PokemonType; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${TYPE_COLORS[type]} ${className}`}
    >
      {type}
    </span>
  );
}
