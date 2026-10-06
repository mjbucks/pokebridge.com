import { useState } from 'react';
import { puzzleToChallengeCode } from '../engine/puzzle';
import type { Puzzle } from '../engine/types';

export function ShareChallengeButton({ puzzle }: { puzzle: Puzzle }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const code = puzzleToChallengeCode(puzzle);
    const url = `${window.location.origin}/play/${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — nothing to fall back to in this context.
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      className="text-xs font-semibold uppercase tracking-wide text-slate-400 underline-offset-2 hover:text-brand-500 hover:underline"
    >
      {copied ? 'Link copied!' : 'Challenge a friend'}
    </button>
  );
}
