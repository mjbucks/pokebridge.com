import { useState } from 'react';
import { createPortal } from 'react-dom';
import { computeScore } from '../engine/scoring';
import type { Puzzle } from '../engine/types';

interface ResultModalProps {
  puzzle: Puzzle;
  wrongGuesses: number;
  hintsUsed: number;
  elapsedSeconds: number;
  shareText?: string;
  onPlayAgain?: () => void;
}

export function ResultModal({ puzzle, wrongGuesses, hintsUsed, elapsedSeconds, shareText, onPlayAgain }: ResultModalProps) {
  const [copied, setCopied] = useState(false);
  const score = computeScore({
    timeSeconds: elapsedSeconds,
    wrongGuesses,
    hintsUsed,
    chainLength: puzzle.required.length,
  });

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  const copy = async () => {
    const text =
      shareText ??
      `PokéBridge ${puzzle.mode === 'daily' ? '(Daily)' : ''} — solved in ${minutes}m ${seconds}s, ${wrongGuesses} wrong guesses, ${hintsUsed} hints. Score: ${score}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — silently ignore, the stats are still on screen.
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl dark:bg-slate-900 sm:max-w-md sm:p-8">
        <div className="font-display text-3xl font-extrabold text-brand-600 dark:text-brand-300 sm:text-4xl">
          You solved it!
        </div>
        <div className="mt-1 font-display text-sm font-semibold uppercase tracking-wide text-accent-500">
          Score: {score}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:gap-4">
          <Stat label="Time" value={`${minutes}m ${seconds}s`} />
          <Stat label="Wrong guesses" value={String(wrongGuesses)} />
          <Stat label="Hints used" value={String(hintsUsed)} />
          <Stat label="Chain length" value={`${puzzle.required.length} links`} />
          <Stat label="Mode" value={puzzle.specificity === 'hard' ? 'Hard' : 'Easy'} />
          <Stat label="Length tier" value={puzzle.lengthTier} />
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={copy}
            className="rounded-xl bg-brand-600 py-3 font-display font-semibold text-white transition-colors hover:bg-brand-700"
          >
            {copied ? 'Copied!' : 'Copy results'}
          </button>
          {onPlayAgain && (
            <button
              onClick={onPlayAgain}
              className="rounded-xl border-2 border-slate-200 py-3 font-display font-semibold text-slate-700 transition-colors hover:border-accent-300 dark:border-slate-700 dark:text-slate-200"
            >
              Play again
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800">
      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="font-display font-bold capitalize text-slate-800 dark:text-slate-100">{value}</div>
    </div>
  );
}
