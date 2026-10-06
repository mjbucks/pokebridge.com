import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDailyProgress } from '../hooks/useDailyProgress';
import { todayUtcDateString } from '../engine/puzzle';

export function HomePage() {
  const todayStr = useMemo(() => todayUtcDateString(), []);
  const { todayRecord, streak } = useDailyProgress(todayStr);
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const goToChallenge = () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    const match = trimmed.match(/\/play\/([^/?#]+)/);
    navigate(`/play/${match ? match[1] : trimmed}`);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-8 px-4 pt-6 text-center">
      <div>
        <h1 className="font-display text-4xl font-extrabold text-brand-600 dark:text-brand-300">PokéBridge</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Connect the Pokémon.</p>
      </div>

      <div className="w-full rounded-2xl border-2 border-brand-200 bg-white p-5 shadow-sm dark:border-brand-800 dark:bg-slate-900">
        <h2 className="font-display text-lg font-bold">Daily Puzzle</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {todayRecord?.completed ? `Solved today — streak: ${streak} day${streak === 1 ? '' : 's'}` : 'One shared puzzle, every day.'}
        </p>
        <Link
          to="/daily"
          className="mt-4 inline-block w-full rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {todayRecord?.completed ? 'View today’s result' : 'Play Daily'}
        </Link>
      </div>

      <div className="w-full rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="font-display text-lg font-bold">Solo Random</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">A fresh, unlimited puzzle every time.</p>
        <Link
          to="/solo"
          className="mt-4 inline-block w-full rounded-xl border-2 border-brand-500 px-4 py-2.5 font-semibold text-brand-600 transition-colors hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-900/30"
        >
          Play Solo Random
        </Link>
      </div>

      <div className="w-full rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="font-display text-lg font-bold">Have a challenge code?</h2>
        <div className="mt-3 flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && goToChallenge()}
            placeholder="Paste a code or link"
            className="flex-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-900"
          />
          <button
            onClick={goToChallenge}
            className="rounded-xl bg-slate-800 px-4 py-2 font-semibold text-white dark:bg-slate-700"
          >
            Go
          </button>
        </div>
      </div>

      <Link to="/admin" className="text-xs text-slate-400 underline-offset-2 hover:underline">
        Admin tools
      </Link>
    </div>
  );
}
