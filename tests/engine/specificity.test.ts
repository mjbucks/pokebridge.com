import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/engine/rng';
import { generateRandomPuzzle } from '../../src/engine/generator';
import { validateSolution } from '../../src/engine/validator';
import { checkConnectionAny } from '../../src/engine/connection';
import { getPokemonByName } from '../../src/engine/dataset';
import { ALL_CATEGORY_IDS } from '../../src/engine/categories';
import type { Puzzle } from '../../src/engine/types';

describe('easy-mode specificity', () => {
  it('accepts any shared type, not just a pre-assigned one', () => {
    const charizard = getPokemonByName('Charizard')!; // Fire/Flying
    const dragonite = getPokemonByName('Dragonite')!; // Dragon/Flying
    const result = checkConnectionAny(charizard, dragonite, 'type');
    expect(result.valid).toBe(true);
    expect(result.sharedValues).toEqual(['Flying']);
  });

  it('rejects when there is truly no shared value', () => {
    // Neither Pikachu nor Snorlax carries any classification tag, so there is
    // nothing to share — a reliable, guaranteed-empty case.
    const pikachu = getPokemonByName('Pikachu')!;
    const snorlax = getPokemonByName('Snorlax')!;
    expect(pikachu.classifications).toEqual([]);
    expect(snorlax.classifications).toEqual([]);
    const result = checkConnectionAny(pikachu, snorlax, 'classification');
    expect(result.valid).toBe(false);
  });

  it('a hard-mode generated solution remains valid when re-checked in easy mode', () => {
    // The generator always picks ONE specific value per edge; that value is
    // necessarily among the "any shared value" options too, so the same
    // witness chain must validate under easy-mode's looser rule.
    const rng = createRng(2024);
    const generated = generateRandomPuzzle({ categoryPool: ALL_CATEGORY_IDS, categoryCount: 6, rng });

    const hardPuzzle: Puzzle = {
      id: 'hard',
      mode: 'solo',
      start: generated.start.id,
      target: generated.target.id,
      required: generated.required,
      lengthTier: 'medium',
      specificity: 'hard',
      createdAt: new Date().toISOString(),
    };
    const easyPuzzle: Puzzle = { ...hardPuzzle, id: 'easy', specificity: 'easy' };

    expect(validateSolution(hardPuzzle, generated.solution).valid).toBe(true);
    expect(validateSolution(easyPuzzle, generated.solution).valid).toBe(true);
  });
});
