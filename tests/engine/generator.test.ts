import { describe, expect, it } from 'vitest';
import { createRng, randomInt } from '../../src/engine/rng';
import { generateRandomPuzzle, generatePuzzleBetween } from '../../src/engine/generator';
import { validateSolution } from '../../src/engine/validator';
import { ALL_CATEGORY_IDS } from '../../src/engine/categories';
import { DATASET } from '../../src/engine/dataset';
import type { Puzzle } from '../../src/engine/types';

describe('generateRandomPuzzle', () => {
  it('never produces an unsolvable puzzle (stress test over many seeds/sizes)', () => {
    const rng = createRng(0xc0ffee);
    const trials = 300;
    for (let i = 0; i < trials; i++) {
      const categoryCount = randomInt(5, 10, rng);
      const generated = generateRandomPuzzle({ categoryPool: ALL_CATEGORY_IDS, categoryCount, rng });

      expect(generated.start.id).not.toBe(generated.target.id);
      expect(generated.required).toHaveLength(categoryCount);
      expect(generated.solution).toHaveLength(categoryCount + 1);

      const categoryIds = new Set(generated.required.map((r) => r.categoryId));
      expect(categoryIds.size).toBe(categoryCount); // no duplicate categories

      const pokemonIds = new Set(generated.solution.map((l) => l.pokemonId));
      expect(pokemonIds.size).toBe(generated.solution.length); // no reused Pokémon

      const puzzle: Puzzle = {
        id: `stress-${i}`,
        mode: 'solo',
        start: generated.start.id,
        target: generated.target.id,
        required: generated.required,
        lengthTier: 'medium',
        specificity: 'hard',
        createdAt: new Date().toISOString(),
      };
      const result = validateSolution(puzzle, generated.solution);
      expect(result.valid).toBe(true);
    }
  });

  it('is deterministic for a fixed seed', () => {
    const genA = generateRandomPuzzle({ categoryPool: ALL_CATEGORY_IDS, categoryCount: 6, rng: createRng(42) });
    const genB = generateRandomPuzzle({ categoryPool: ALL_CATEGORY_IDS, categoryCount: 6, rng: createRng(42) });
    expect(genA.start.id).toBe(genB.start.id);
    expect(genA.target.id).toBe(genB.target.id);
    expect(genA.required).toEqual(genB.required);
  });
});

describe('generatePuzzleBetween', () => {
  it('finds a valid path between two arbitrary distinct Pokémon when one exists', () => {
    const rng = createRng(7);
    const start = DATASET.find((p) => p.name === 'Bulbasaur')!;
    const target = DATASET.find((p) => p.name === 'Pikachu')!;
    const generated = generatePuzzleBetween(start, target, {
      categoryPool: ALL_CATEGORY_IDS,
      categoryCount: 5,
      rng,
    });

    expect(generated).not.toBeNull();
    if (!generated) return;
    expect(generated.start.id).toBe(start.id);
    expect(generated.target.id).toBe(target.id);

    const puzzle: Puzzle = {
      id: 'p2p',
      mode: 'admin',
      start: start.id,
      target: target.id,
      required: generated.required,
      lengthTier: 'medium',
      specificity: 'hard',
      createdAt: new Date().toISOString(),
    };
    expect(validateSolution(puzzle, generated.solution).valid).toBe(true);
  });

  it('returns null for identical start and target', () => {
    const rng = createRng(1);
    const bulbasaur = DATASET.find((p) => p.name === 'Bulbasaur')!;
    expect(generatePuzzleBetween(bulbasaur, bulbasaur, { categoryPool: ALL_CATEGORY_IDS, categoryCount: 5, rng })).toBeNull();
  });
});
