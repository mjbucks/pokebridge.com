import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/engine/rng';
import { generateRandomPuzzle } from '../../src/engine/generator';
import { ALL_CATEGORY_IDS } from '../../src/engine/categories';
import { puzzleFromChallengeCode, puzzleToChallengeCode } from '../../src/engine/puzzle';
import { decodePuzzleCode, encodePuzzleCode } from '../../src/engine/puzzleCode';
import type { Puzzle } from '../../src/engine/types';

describe('puzzle challenge codes', () => {
  it('round-trips start, target, and required categories exactly', () => {
    const generated = generateRandomPuzzle({ categoryPool: ALL_CATEGORY_IDS, categoryCount: 7, rng: createRng(55) });
    const code = encodePuzzleCode(generated.start.id, generated.target.id, generated.required);
    const decoded = decodePuzzleCode(code);

    expect(decoded).not.toBeNull();
    expect(decoded?.start).toBe(generated.start.id);
    expect(decoded?.target).toBe(generated.target.id);
    expect(decoded?.required).toEqual(generated.required);
  });

  it('builds a playable Puzzle from a shared code', () => {
    const generated = generateRandomPuzzle({ categoryPool: ALL_CATEGORY_IDS, categoryCount: 6, rng: createRng(56) });
    const puzzle: Puzzle = {
      id: 'x',
      mode: 'solo',
      start: generated.start.id,
      target: generated.target.id,
      required: generated.required,
      difficulty: 'medium',
      createdAt: new Date().toISOString(),
    };
    const code = puzzleToChallengeCode(puzzle);
    const rebuilt = puzzleFromChallengeCode(code);

    expect(rebuilt).not.toBeNull();
    expect(rebuilt?.start).toBe(puzzle.start);
    expect(rebuilt?.target).toBe(puzzle.target);
    expect(rebuilt?.required).toEqual(puzzle.required);
  });

  it('rejects garbage codes', () => {
    expect(decodePuzzleCode('not-a-valid-code!!!')).toBeNull();
    expect(puzzleFromChallengeCode('not-a-valid-code!!!')).toBeNull();
  });
});
