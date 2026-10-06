import { useCallback, useMemo, useState } from 'react';
import { checkRequiredConnection, formatRequiredValue } from '../engine/connection';
import { getPokemonById } from '../engine/dataset';
import { buildHint, type HintResult } from '../engine/hints';
import { createRng } from '../engine/rng';
import { validateSolution } from '../engine/validator';
import type { CategoryId, ChainLink, ConnectionResult, Puzzle } from '../engine/types';

export interface FeedbackState {
  result: ConnectionResult;
  fromName: string;
  toName: string;
}

export function useGame(puzzle: Puzzle) {
  const [chain, setChain] = useState<ChainLink[]>([{ pokemonId: puzzle.start, categoryId: null }]);
  // Parallel to `chain` (index i describes the connection INTO chain[i]; index 0 is null for the start)
  // — kept purely for display, so the chain can show the *actual* shared value used, which matters in
  // Easy mode where the player might not have matched the puzzle's originally assigned value.
  const [linkResults, setLinkResults] = useState<(ConnectionResult | null)[]>([null]);
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
  const canUndo = chain.length > 1 && !isWon;

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

      const result = checkRequiredConnection(currentPokemon, candidate, slot, puzzle.specificity);
      setFeedback({ result, fromName: currentPokemon.name, toName: candidate.name });

      if (!result.valid) {
        setWrongGuesses((n) => n + 1);
        return;
      }

      const nextChain = [...chain, { pokemonId: candidate.id, categoryId: selectedCategoryId }];
      setChain(nextChain);
      setLinkResults((prev) => [...prev, result]);
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

  const undo = useCallback(() => {
    if (!canUndo) return;
    const removed = chain[chain.length - 1];
    setChain((prev) => prev.slice(0, -1));
    setLinkResults((prev) => prev.slice(0, -1));
    if (removed.categoryId) {
      setUsedCategories((prev) => {
        const next = new Set(prev);
        next.delete(removed.categoryId!);
        return next;
      });
    }
    setSelectedCategoryId(null);
    setFeedback(null);
  }, [canUndo, chain]);

  const requestHint = useCallback((): HintResult | null => {
    if (selectedCategoryId === null || isWon) return null;
    const slot = puzzle.required.find((s) => s.categoryId === selectedCategoryId);
    if (!slot) return null;
    const excludeIds = new Set(chain.map((link) => link.pokemonId));
    const target = getPokemonById(puzzle.target)!;
    const remainingAfterThis = unusedSlots.filter((s) => s.categoryId !== selectedCategoryId);
    const hint = buildHint(
      currentPokemon,
      slot,
      remainingAfterThis,
      target,
      excludeIds,
      puzzle.specificity,
      createRng(Date.now()),
    );
    setHintsUsed((n) => n + 1);
    return hint;
  }, [chain, currentPokemon, isWon, puzzle.required, puzzle.specificity, puzzle.target, selectedCategoryId, unusedSlots]);

  return {
    chain,
    linkResults,
    currentPokemon,
    unusedSlots,
    selectedCategoryId,
    selectCategory,
    attemptConnection,
    undo,
    canUndo,
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
