import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { GamePage } from './GamePage';
import { puzzleFromChallengeCode } from '../engine/puzzle';

export function ChallengePage() {
  const { code } = useParams<{ code: string }>();
  const puzzle = useMemo(() => (code ? puzzleFromChallengeCode(code) : null), [code]);

  if (!puzzle) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4 px-4 pt-10 text-center">
        <h1 className="font-display text-2xl font-extrabold text-red-500">Invalid challenge link</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This link looks broken or incomplete. Ask your friend to re-share it, or start your own puzzle.
        </p>
        <Link to="/" className="rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white">
          Back home
        </Link>
      </div>
    );
  }

  return <GamePage puzzle={puzzle} title="Friend Challenge" />;
}
