import { useEffect, useRef, useState } from 'react';
import { useGame } from '../hooks/useGame';
import { ChainView } from '../components/ChainView';
import { CategoryChip } from '../components/CategoryChip';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { PokemonCard } from '../components/PokemonCard';
import { PokemonSearch } from '../components/PokemonSearch';
import { ResultModal } from '../components/ResultModal';
import { ShareChallengeButton } from '../components/ShareChallengeButton';
import { getPokemonById } from '../engine/dataset';
import { computeScore, type ScoreInput } from '../engine/scoring';
import type { Puzzle } from '../engine/types';

interface GamePageProps {
  puzzle: Puzzle;
  onPlayAgain?: () => void;
  onWin?: (stats: ScoreInput & { score: number }) => void;
  title?: string;
  shareText?: string;
}

export function GamePage({ puzzle, onPlayAgain, onWin, title, shareText }: GamePageProps) {
  const game = useGame(puzzle);
  const target = getPokemonById(puzzle.target)!;
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const hasReportedWin = useRef(false);

  useEffect(() => {
    if (!game.isWon || hasReportedWin.current || !onWin) return;
    hasReportedWin.current = true;
    const timeSeconds = Math.max(0, Math.round(((game.finishedAt ?? Date.now()) - game.startedAt) / 1000));
    const stats: ScoreInput = {
      timeSeconds,
      wrongGuesses: game.wrongGuesses,
      hintsUsed: game.hintsUsed,
      chainLength: puzzle.required.length,
    };
    onWin({ ...stats, score: computeScore(stats) });
  }, [game.finishedAt, game.hintsUsed, game.isWon, game.startedAt, game.wrongGuesses, onWin, puzzle.required.length]);

  const handleHint = () => {
    const hint = game.requestHint();
    if (!hint) {
      setHintMessage('Select a category first to get a hint for it.');
    } else if (hint.totalCandidates === 0) {
      setHintMessage('No remaining Pokémon can satisfy this category from here — try Undo and a different path.');
    } else if (hint.example && hint.exampleIsSafe) {
      setHintMessage(
        `Try ${hint.example.name} — verified to keep the rest of the puzzle solvable. (${hint.totalCandidates} valid option${hint.totalCandidates === 1 ? '' : 's'} total.)`,
      );
    } else if (hint.example) {
      setHintMessage(
        `${hint.totalCandidates} Pokémon could work here, e.g. ${hint.example.name} — but that one isn't verified to lead all the way to the target.`,
      );
    } else {
      setHintMessage(`${hint.totalCandidates} Pokémon could work here.`);
    }
  };

  const usedCount = puzzle.required.length - game.unusedSlots.length;

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 pb-24 pt-4 sm:gap-8 sm:px-8 sm:pt-8 lg:max-w-3xl">
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {title && <h1 className="font-display text-xl font-bold text-slate-700 dark:text-slate-200 sm:text-2xl">{title}</h1>}
          <span
            className={`rounded-full px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-wide sm:text-xs ${
              puzzle.specificity === 'hard'
                ? 'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
            }`}
          >
            {puzzle.specificity === 'hard' ? 'Hard Mode' : 'Easy Mode'}
          </span>
        </div>
        <ShareChallengeButton puzzle={puzzle} />
      </div>

      <div className="flex w-full flex-col items-center gap-1.5">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          {usedCount} / {puzzle.required.length} categories used
        </span>
        <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-300"
            style={{ width: `${(usedCount / puzzle.required.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex w-full flex-wrap justify-center gap-2 sm:gap-3">
        {puzzle.required.map((slot) => (
          <CategoryChip
            key={slot.categoryId}
            slot={slot}
            specificity={puzzle.specificity}
            state={
              game.unusedSlots.some((s) => s.categoryId === slot.categoryId)
                ? game.selectedCategoryId === slot.categoryId
                  ? 'selected'
                  : 'unused'
                : 'used'
            }
            onClick={() => game.selectCategory(slot.categoryId)}
          />
        ))}
      </div>

      <ChainView chain={game.chain} linkResults={game.linkResults} targetId={puzzle.target} />

      {!game.isWon && (
        <div className="flex w-full flex-col items-center gap-3 sm:gap-4">
          <div className="flex w-full max-w-sm items-center gap-2">
            <PokemonSearch
              disabled={game.selectedCategoryId === null}
              placeholder={
                game.selectedCategoryId === null ? 'Select a category above first…' : 'Search for the next Pokémon…'
              }
              onSelect={(p) => {
                game.attemptConnection(p.id);
                setHintMessage(null);
              }}
            />
            <button
              type="button"
              onClick={game.undo}
              disabled={!game.canUndo}
              title="Undo last connection"
              className="flex h-[46px] shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 px-3 text-sm font-bold uppercase tracking-wide text-slate-500 transition-colors enabled:hover:border-accent-400 enabled:hover:text-accent-600 disabled:opacity-30 dark:border-slate-700 dark:text-slate-400"
            >
              Undo
            </button>
          </div>
          <button
            type="button"
            onClick={handleHint}
            className="text-xs font-semibold uppercase tracking-wide text-slate-400 underline-offset-2 hover:text-accent-500 hover:underline sm:text-sm"
          >
            Need a hint? ({game.hintsUsed} used)
          </button>
          {hintMessage && (
            <p className="max-w-sm text-center text-sm text-slate-500 dark:text-slate-400">{hintMessage}</p>
          )}
          <FeedbackBanner feedback={game.feedback} />
        </div>
      )}

      <PokemonCard pokemon={target} label="Target" size="sm" highlight="target" />

      {game.isWon && (
        <ResultModal
          puzzle={puzzle}
          wrongGuesses={game.wrongGuesses}
          hintsUsed={game.hintsUsed}
          elapsedSeconds={Math.max(0, Math.round(((game.finishedAt ?? Date.now()) - game.startedAt) / 1000))}
          onPlayAgain={onPlayAgain}
          shareText={shareText}
        />
      )}
    </div>
  );
}
