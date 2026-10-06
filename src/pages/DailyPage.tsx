import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { GamePage } from './GamePage';
import { useDailyProgress } from '../hooks/useDailyProgress';
import { buildDailyPuzzle, todayUtcDateString } from '../engine/puzzle';

export function DailyPage() {
  const todayStr = useMemo(() => todayUtcDateString(), []);
  const { puzzle } = useMemo(() => buildDailyPuzzle(todayStr), [todayStr]);
  const { todayRecord, streak, recordCompletion } = useDailyProgress(todayStr);

  if (todayRecord?.completed) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4 px-4 pt-10 text-center">
        <h1 className="font-display text-2xl font-extrabold text-brand-600 dark:text-brand-300">
          Already solved today!
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Score: {todayRecord.score} · {todayRecord.timeSeconds}s · {todayRecord.wrongGuesses} wrong ·{' '}
          {todayRecord.hintsUsed} hints
        </p>
        <p className="font-semibold text-slate-700 dark:text-slate-200">Current streak: {streak} day{streak === 1 ? '' : 's'}</p>
        <Link to="/solo" className="mt-2 rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white">
          Play Solo Random instead
        </Link>
        <Link to="/" className="text-sm text-slate-400 underline-offset-2 hover:underline">
          Back home
        </Link>
      </div>
    );
  }

  return (
    <GamePage
      puzzle={puzzle}
      title={`Daily Puzzle — ${todayStr}`}
      shareText={`PokéBridge Daily ${todayStr} — solved!`}
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
  );
}
