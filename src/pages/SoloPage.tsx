import { useCallback, useState } from 'react';
import { GamePage } from './GamePage';
import { buildSoloRandomPuzzle } from '../engine/puzzle';
import type { Specificity } from '../engine/types';

export function SoloPage() {
  const [specificity, setSpecificity] = useState<Specificity>('hard');
  const [session, setSession] = useState(() => buildSoloRandomPuzzle({ specificity: 'hard' }));

  const newPuzzle = useCallback(
    (mode: Specificity) => setSession(buildSoloRandomPuzzle({ specificity: mode })),
    [],
  );

  const changeMode = (mode: Specificity) => {
    setSpecificity(mode);
    newPuzzle(mode);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="mt-4 flex gap-1 rounded-full border-2 border-slate-200 p-1 dark:border-slate-700">
        {(['easy', 'hard'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => changeMode(mode)}
            className={`rounded-full px-4 py-1.5 font-display text-sm font-semibold capitalize transition-colors ${
              specificity === mode
                ? 'bg-brand-600 text-white'
                : 'text-slate-500 hover:text-brand-600 dark:text-slate-400'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>
      <GamePage
        key={session.puzzle.id}
        puzzle={session.puzzle}
        title="Solo Random"
        onPlayAgain={() => newPuzzle(specificity)}
      />
    </div>
  );
}
