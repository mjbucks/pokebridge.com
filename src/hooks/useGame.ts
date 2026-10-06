import { useCallback, useMemo, useState } from 'react';
import { checkConnection, formatRequiredValue } from '../engine/connection';
import { getPokemonById } from '../engine/dataset';
import { findValidCandidates } from '../engine/hints';
import { validateSolution } from '../engine/validator';
import type { CategoryId, ChainLink, ConnectionResult, Puzzle } from '../engine/types';

export interface FeedbackState {
  result: ConnectionResult;
  fromName: string;
  toName: string;
}

export function useGame(puzzle: Puzzle) {
  const [chain, setChain] = useState<ChainLink[]>([{ pokemonId: puzzle.start, categoryId: null }]);
  const [usedCategories, setUsedCategories] = useState<Set<CategoryId>>(new Set());
  const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryId | null>(null);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [finishedAt, setFinishedAt] = useState<number | null>(null);

  const currentPokemon = useMemo(() => getPokemonById(chain[chain.length - 1].pokemonId)!, [chain]);

  const unusedSlots = useMemo(
    () => puzzle.required.filter((slot) => !usedCategories.has(slot.categoryId)),
    [puzzle.required, usedCategories],
  );

  const isWon = finishedAt !== null;

  const selectCategory = useCallback(
    (categoryId: CategoryId) => {
      if (usedCategories.has(categoryId)) return;
      setSelectedCategoryId((prev) => (prev === categoryId ? null : categoryId));
      setFeedback(null);
    },
    [usedCategories],
  );

  const attemptConnection = useCallback(
    (candidateId: number) => {
      if (isWon || selectedCategoryId === null) return;
      const slot = puzzle.required.find((s) => s.categoryId === selectedCategoryId);
      const candidate = getPokemonById(candidateId);
      if (!slot || !candidate) return;
      if (chain.some((link) => link.pokemonId === candidateId)) {
        setFeedback({
          result: {
            valid: false,
            categoryId: selectedCategoryId,
            sharedValues: [],
            reason: `${candidate.name} is already used in this chain.`,
          },
          fromName: currentPokemon.name,
          toName: candidate.name,
        });
        setWrongGuesses((n) => n + 1);
        return;
      }

      const result = checkConnection(currentPokemon, candidate, slot);
      setFeedback({ result, fromName: currentPokemon.name, toName: candidate.name });

      if (!result.valid) {
        setWrongGuesses((n) => n + 1);
        return;
      }

      const nextChain = [...chain, { pokemonId: candidate.id, categoryId: selectedCategoryId }];
      setChain(nextChain);
      setUsedCategories((prev) => new Set(prev).add(selectedCategoryId));
      setSelectedCategoryId(null);

      if (nextChain.length === puzzle.required.length + 1) {
        // Never trust client state alone — independently recompute before declaring victory.
        const final = validateSolution(puzzle, nextChain);
        if (final.valid) setFinishedAt(Date.now());
      }
    },
    [chain, currentPokemon, isWon, puzzle, selectedCategoryId],
  );

  const requestHint = useCallback(() => {
    if (selectedCategoryId === null || isWon) return null;
    const slot = puzzle.required.find((s) => s.categoryId === selectedCategoryId);
    if (!slot) return null;
    const excludeIds = new Set(chain.map((link) => link.pokemonId));
    const candidates = findValidCandidates(currentPokemon, slot, excludeIds);
    setHintsUsed((n) => n + 1);
    if (candidates.length === 0) return { count: 0, example: null };
    const example = candidates[Math.floor(Math.random() * candidates.length)];
    return { count: candidates.length, example };
  }, [chain, currentPokemon, isWon, puzzle.required, selectedCategoryId]);

  return {
    chain,
    currentPokemon,
    unusedSlots,
    selectedCategoryId,
    selectCategory,
    attemptConnection,
    requestHint,
    feedback,
    wrongGuesses,
    hintsUsed,
    isWon,
    startedAt,
    finishedAt,
    formatRequiredValue,
  };
}
