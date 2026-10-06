export interface ScoreInput {
  timeSeconds: number;
  wrongGuesses: number;
  hintsUsed: number;
  chainLength: number;
}

const BASE_SCORE = 1000;
const MAX_TIME_PENALTY = 400;
const TIME_PENALTY_PER_SECOND = 2;
const WRONG_GUESS_PENALTY = 50;
const HINT_PENALTY = 75;
const LENGTH_BONUS_PER_CATEGORY = 20;

/**
 * Correctness is always binary (solved or not) — this score is a secondary,
 * purely cosmetic measure of how cleanly the player solved it.
 */
export function computeScore(input: ScoreInput): number {
  const timePenalty = Math.min(MAX_TIME_PENALTY, Math.floor(input.timeSeconds * TIME_PENALTY_PER_SECOND));
  const wrongPenalty = input.wrongGuesses * WRONG_GUESS_PENALTY;
  const hintPenalty = input.hintsUsed * HINT_PENALTY;
  const lengthBonus = input.chainLength * LENGTH_BONUS_PER_CATEGORY;
  const score = BASE_SCORE - timePenalty - wrongPenalty - hintPenalty + lengthBonus;
  return Math.max(0, Math.round(score));
}
