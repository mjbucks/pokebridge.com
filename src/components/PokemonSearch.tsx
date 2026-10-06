import { useMemo, useRef, useState } from 'react';
import { searchPokemon } from '../engine/search';
import { TypeBadge } from './TypeBadge';
import type { PokemonRecord } from '../engine/types';

interface PokemonSearchProps {
  onSelect: (pokemon: PokemonRecord) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function PokemonSearch({ onSelect, disabled, placeholder = 'Search for a Pokémon…' }: PokemonSearchProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => (query.trim() ? searchPokemon(query, 8) : []), [query]);

  const choose = (pokemon: PokemonRecord) => {
    onSelect(pokemon);
    setQuery('');
    setOpen(false);
    setActiveIndex(0);
  };

  return (
    <div className="relative w-full max-w-sm">
      <input
        ref={inputRef}
        type="text"
        value={query}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActiveIndex(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 100)}
        onKeyDown={(e) => {
          if (!results.length) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, results.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          } else if (e.key === 'Enter') {
            e.preventDefault();
            choose(results[activeIndex]);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-medium outline-none transition-colors focus:border-brand-400 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {results.map((pokemon, i) => (
            <li key={pokemon.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(pokemon)}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                  i === activeIndex ? 'bg-brand-50 dark:bg-brand-900/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <img src={pokemon.spriteUrl} alt="" className="h-10 w-10 object-contain" />
                <span className="flex-1 text-sm font-semibold">{pokemon.name}</span>
                <span className="flex gap-1">
                  {pokemon.types.map((t) => (
                    <TypeBadge key={t} type={t} />
                  ))}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
