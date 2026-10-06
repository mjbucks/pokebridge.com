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
    } else if (hint.count === 0) {
      setHintMessage('No remaining Pokémon can satisfy this category from here.');
    } else {
      setHintMessage(`${hint.count} Pokémon could work here — for example, ${hint.example!.name}.`);
    }
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 px-4 pb-24 pt-2">
      {title && <h1 className="font-display text-xl font-bold text-slate-700 dark:text-slate-200">{title}</h1>}

      <ShareChallengeButton puzzle={puzzle} />

      <PokemonCard pokemon={target} label="Target" size="sm" highlight="target" />

      <div className="flex w-full flex-wrap justify-center gap-2">
        {puzzle.required.map((slot) => (
          <CategoryChip
            key={slot.categoryId}
            slot={slot}
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

      <ChainView chain={game.chain} required={puzzle.required} targetId={puzzle.target} />

      {!game.isWon && (
        <div className="flex w-full flex-col items-center gap-3">
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
            onClick={handleHint}
            className="text-xs font-semibold uppercase tracking-wide text-slate-400 underline-offset-2 hover:text-brand-500 hover:underline"
          >
            Need a hint? ({game.hintsUsed} used)
          </button>
          {hintMessage && <p className="text-center text-sm text-slate-500 dark:text-slate-400">{hintMessage}</p>}
          <FeedbackBanner feedback={game.feedback} />
        </div>
      )}

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
