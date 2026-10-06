import { describe, expect, it } from 'vitest';
import { searchPokemon } from '../../src/engine/search';

describe('searchPokemon', () => {
  it('finds an exact name match first', () => {
    const results = searchPokemon('pikachu');
    expect(results[0].name).toBe('Pikachu');
  });

  it('tolerates a minor typo', () => {
    const results = searchPokemon('pikachy');
    expect(results.some((p) => p.name === 'Pikachu')).toBe(true);
  });

  it('matches by prefix', () => {
    const results = searchPokemon('char');
    expect(results.some((p) => p.name === 'Charizard')).toBe(true);
    expect(results.some((p) => p.name === 'Charmander')).toBe(true);
  });

  it('returns nothing for an empty query', () => {
    expect(searchPokemon('')).toEqual([]);
  });

  it('never returns a Pokémon unrelated to the query', () => {
    const results = searchPokemon('zzqqxx');
    expect(results).toEqual([]);
  });
});
