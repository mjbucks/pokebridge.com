import { describe, expect, it } from 'vitest';
import { buildDailyPuzzle } from '../../src/engine/puzzle';
import { validateSolution } from '../../src/engine/validator';

describe('daily puzzle', () => {
  it('is deterministic for the same date', () => {
    const a = buildDailyPuzzle('2026-10-05');
    const b = buildDailyPuzzle('2026-10-05');
    expect(a.puzzle.start).toBe(b.puzzle.start);
    expect(a.puzzle.target).toBe(b.puzzle.target);
    expect(a.puzzle.required).toEqual(b.puzzle.required);
  });

  it('differs (virtually always) across different dates', () => {
    const a = buildDailyPuzzle('2026-10-05');
    const b = buildDailyPuzzle('2026-10-06');
    const same = a.puzzle.start === b.puzzle.start && a.puzzle.target === b.puzzle.target;
    expect(same).toBe(false);
  });

  it('is independently valid and solvable', () => {
    const { puzzle, generated } = buildDailyPuzzle('2026-01-01');
    expect(validateSolution(puzzle, generated.solution).valid).toBe(true);
  });
});
