import { DATASET } from './dataset';
import type { PokemonRecord } from './types';

function normalize(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Classic edit distance, capped early for performance since queries are short. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const prev = new Array(b.length + 1).fill(0).map((_, i) => i);
  const curr = new Array(b.length + 1).fill(0);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      curr[j] =
        a[i - 1] === b[j - 1]
          ? prev[j - 1]
          : 1 + Math.min(prev[j - 1], prev[j], curr[j - 1]);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }

  return prev[b.length];
}

/**
 * Ranks Pokémon by how well their name matches the query. Supports minor
 * spelling mistakes via edit distance, but never returns a Pokémon that
 * wasn't already a canonical dataset entry — the player cannot type in an
 * arbitrary name and have it accepted.
 */
export function searchPokemon(query: string, limit = 8): PokemonRecord[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];

  const scored: { pokemon: PokemonRecord; score: number }[] = [];

  for (const pokemon of DATASET) {
    const normalizedName = normalize(pokemon.name);

    let score: number;
    if (normalizedName === normalizedQuery) score = 0;
    else if (normalizedName.startsWith(normalizedQuery)) score = 1;
    else if (normalizedName.includes(normalizedQuery)) score = 2;
    else {
      const distance = levenshtein(normalizedQuery, normalizedName.slice(0, normalizedQuery.length + 3));
      const maxAllowed = normalizedQuery.length <= 4 ? 1 : 2;
      if (distance > maxAllowed) continue;
      score = 3 + distance;
    }

    scored.push({ pokemon, score });
  }

  scored.sort((a, b) => a.score - b.score || a.pokemon.id - b.pokemon.id);
  return scored.slice(0, limit).map((s) => s.pokemon);
}
