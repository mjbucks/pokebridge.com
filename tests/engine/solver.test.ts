import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/engine/rng';
import { generateRandomPuzzle } from '../../src/engine/generator';
import { solvePuzzle } from '../../src/engine/solver';
import { validateSolution } from '../../src/engine/validator';
import { ALL_CATEGORY_IDS } from '../../src/engine/categories';
import type { Puzzle } from '../../src/engine/types';

describe('solvePuzzle', () => {
  it('finds at least the solution the generator already proved exists', () => {
    const rng = createRng(99);
    const generated = generateRandomPuzzle({ categoryPool: ALL_CATEGORY_IDS, categoryCount: 5, rng });
    const categoryIds = generated.required.map((r) => r.categoryId);

    const result = solvePuzzle(generated.start, generated.target, categoryIds, { maxSolutions: 10 });
    expect(result.solutions.length).toBeGreaterThan(0);
    expect(result.chainLength).toBe(categoryIds.length + 1);

    // Every reported solution must independently validate.
    for (const solved of result.solutions) {
      const puzzle: Puzzle = {
        id: 'solver-test',
        mode: 'admin',
        start: generated.start.id,
        target: generated.target.id,
        required: solved.required,
        difficulty: 'medium',
        createdAt: new Date().toISOString(),
      };
      expect(validateSolution(puzzle, solved.chain).valid).toBe(true);
    }
  });

  it('reports no solutions for an impossible category pairing', () => {
    const rng = createRng(123);
    const generated = generateRandomPuzzle({ categoryPool: ALL_CATEGORY_IDS, categoryCount: 5, rng });
    // Ask it to solve starting from target to itself with a bogus single category —
    // same start and target can never be reached in >=1 steps without reuse.
    const result = solvePuzzle(generated.start, generated.start, ['type'], { maxSolutions: 5 });
    expect(result.solutions).toHaveLength(0);
    expect(result.isUniquelySolvable).toBe(false);
  });
});
