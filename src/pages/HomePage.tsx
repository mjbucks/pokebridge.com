import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDailyProgress } from '../hooks/useDailyProgress';
import { todayUtcDateString } from '../engine/puzzle';

export function HomePage() {
  const todayStr = useMemo(() => todayUtcDateString(), []);
  const { todayRecord, streak } = useDailyProgress(todayStr, 'hard');
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const goToChallenge = () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    const match = trimmed.match(/\/play\/([^/?#]+)/);
    navigate(`/play/${match ? match[1] : trimmed}`);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-4 pb-16 pt-8 text-center sm:max-w-lg sm:gap-8 sm:pt-12 lg:max-w-xl">
      <div className="flex flex-col items-center">
        <img src="/logo.png" alt="PokéBridge" className="h-28 w-28 object-contain sm:h-36 sm:w-36" />
        <h1 className="mt-2 font-display text-4xl font-extrabold text-brand-600 dark:text-brand-300 sm:text-5xl">
          PokéBridge
        </h1>
        <p className="mt-2 text-base text-slate-500 dark:text-slate-400 sm:text-lg">
          Connect the Pokémon, one category at a time.
        </p>
      </div>

      <div className="w-full rounded-3xl border-2 border-brand-200 bg-white p-6 shadow-sm dark:border-brand-800 dark:bg-slate-900 sm:p-7">
        <h2 className="font-display text-xl font-bold sm:text-2xl">Daily Puzzle</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
          {todayRecord?.completed
            ? `Solved today (Hard) — streak: ${streak} day${streak === 1 ? '' : 's'}`
            : 'One shared puzzle, every day. Easy and Hard modes.'}
        </p>
        <Link
          to="/daily"
          className="mt-4 inline-block w-full rounded-xl bg-brand-600 px-4 py-3 font-display font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {todayRecord?.completed ? 'View today’s result' : 'Play Daily'}
        </Link>
      </div>

      <div className="w-full rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-7">
        <h2 className="font-display text-xl font-bold sm:text-2xl">Solo Random</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
          A fresh, unlimited puzzle every time — pick Easy or Hard.
        </p>
        <Link
          to="/solo"
          className="mt-4 inline-block w-full rounded-xl border-2 border-accent-500 px-4 py-3 font-display font-semibold text-accent-600 transition-colors hover:bg-accent-50 dark:text-accent-300 dark:hover:bg-accent-900/20"
        >
          Play Solo Random
        </Link>
      </div>

      <div className="w-full rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-7">
        <h2 className="font-display text-xl font-bold sm:text-2xl">Have a challenge code?</h2>
        <div className="mt-3 flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && goToChallenge()}
            placeholder="Paste a code or link"
            className="flex-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-900"
          />
          <button
            onClick={goToChallenge}
            className="rounded-xl bg-slate-800 px-5 py-2.5 font-display font-semibold text-white dark:bg-slate-700"
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
