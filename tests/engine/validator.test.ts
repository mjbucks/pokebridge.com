import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/engine/rng';
import { generateRandomPuzzle } from '../../src/engine/generator';
import { validateSolution } from '../../src/engine/validator';
import { ALL_CATEGORY_IDS } from '../../src/engine/categories';
import type { Puzzle } from '../../src/engine/types';

function makePuzzle(seed: number) {
  const rng = createRng(seed);
  const generated = generateRandomPuzzle({ categoryPool: ALL_CATEGORY_IDS, categoryCount: 6, rng });
  const puzzle: Puzzle = {
    id: 'test',
    mode: 'solo',
    start: generated.start.id,
    target: generated.target.id,
    required: generated.required,
    lengthTier: 'medium',
    specificity: 'hard',
    createdAt: new Date().toISOString(),
  };
  return { puzzle, generated };
}

describe('validateSolution', () => {
  it('accepts the generator-produced solution as complete and valid', () => {
    const { puzzle, generated } = makePuzzle(1);
    const result = validateSolution(puzzle, generated.solution);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('rejects a chain ending on the wrong Pokémon', () => {
    const { puzzle, generated } = makePuzzle(2);
    const broken = generated.solution.slice(0, -1); // drop the final link entirely
    const result = validateSolution(puzzle, broken);
    expect(result.valid).toBe(false);
  });

  it('rejects a chain missing a required category', () => {
    const { puzzle, generated } = makePuzzle(3);
    if (generated.solution.length < 3) return; // need at least one intermediate link to drop
    const withoutMiddleStep = [...generated.solution];
    withoutMiddleStep.splice(1, 1); // remove one intermediate link, leaving a category unused
    const result = validateSolution(puzzle, withoutMiddleStep);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('must be used exactly'))).toBe(true);
  });

  it('rejects a chain that reuses a Pokémon', () => {
    const { puzzle, generated } = makePuzzle(4);
    const duplicated = [...generated.solution];
    const lastIndex = duplicated.length - 1;
    duplicated[lastIndex] = { pokemonId: duplicated[0].pokemonId, categoryId: duplicated[lastIndex].categoryId };
    const result = validateSolution(puzzle, duplicated);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('more than once'))).toBe(true);
  });

  it('rejects a chain that reuses the same category twice', () => {
    const { puzzle, generated } = makePuzzle(5);
    if (generated.solution.length < 3) return;
    const reused = generated.solution.map((link, i) =>
      i === 2 ? { ...link, categoryId: generated.solution[1].categoryId } : link,
    );
    const result = validateSolution(puzzle, reused);
    expect(result.valid).toBe(false);
  });
});
