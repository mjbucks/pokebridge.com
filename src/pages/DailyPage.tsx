import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GamePage } from './GamePage';
import { useDailyProgress } from '../hooks/useDailyProgress';
import { buildDailyPuzzle, todayUtcDateString } from '../engine/puzzle';
import type { Specificity } from '../engine/types';

export function DailyPage() {
  const todayStr = useMemo(() => todayUtcDateString(), []);
  const [specificity, setSpecificity] = useState<Specificity>('hard');
  const { puzzle } = useMemo(() => buildDailyPuzzle(todayStr, specificity), [todayStr, specificity]);
  const { todayRecord, streak, recordCompletion } = useDailyProgress(todayStr, specificity);

  const modeToggle = (
    <div className="mt-4 flex gap-1 rounded-full border-2 border-slate-200 p-1 dark:border-slate-700">
      {(['easy', 'hard'] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => setSpecificity(mode)}
          className={`rounded-full px-4 py-1.5 font-display text-sm font-semibold capitalize transition-colors ${
            specificity === mode ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-brand-600 dark:text-slate-400'
          }`}
        >
          {mode}
        </button>
      ))}
    </div>
  );

  if (todayRecord?.completed) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4 px-4 pt-10 text-center">
        {modeToggle}
        <h1 className="font-display text-2xl font-extrabold text-brand-600 dark:text-brand-300">
          Already solved today's {specificity} puzzle!
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Score: {todayRecord.score} · {todayRecord.timeSeconds}s · {todayRecord.wrongGuesses} wrong ·{' '}
          {todayRecord.hintsUsed} hints
        </p>
        <p className="font-semibold text-slate-700 dark:text-slate-200">
          Current {specificity} streak: {streak} day{streak === 1 ? '' : 's'}
        </p>
        <Link to="/solo" className="mt-2 rounded-xl bg-brand-600 px-5 py-2.5 font-display font-semibold text-white">
          Play Solo Random instead
        </Link>
        <Link to="/" className="text-sm text-slate-400 underline-offset-2 hover:underline">
          Back home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {modeToggle}
      <GamePage
        key={puzzle.id}
        puzzle={puzzle}
        title={`Daily Puzzle — ${todayStr}`}
        shareText={`PokéBridge Daily (${specificity}) ${todayStr} — solved!`}
        onWin={(stats) =>
          recordCompletion({
            completed: true,
            score: stats.score,
            timeSeconds: stats.timeSeconds,
            wrongGuesses: stats.wrongGuesses,
            hintsUsed: stats.hintsUsed,
          })
        }
      />
    </div>
  );
}
