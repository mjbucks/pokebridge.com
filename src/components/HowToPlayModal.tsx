import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface HowToPlayModalProps {
  onClose: () => void;
}

export function HowToPlayModal({ onClose }: HowToPlayModalProps) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl font-bold text-brand-700 dark:text-brand-300 sm:text-3xl">
            How to Play
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 text-lg font-bold text-slate-500 hover:border-accent-400 hover:text-accent-500 dark:border-slate-700"
          >
            ×
          </button>
        </div>

        <ol className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300 sm:text-base">
          <Step n={1} title="Start and target">
            You're given a <strong>start</strong> Pokémon (top) and a <strong>target</strong> Pokémon (bottom). Your
            job is to connect them.
          </Step>
          <Step n={2} title="Pick a category">
            Each puzzle lists several <strong>required categories</strong> — Type, Generation, Ability, a stat,
            Weakness, and so on. Tap one that hasn't been used yet.
          </Step>
          <Step n={3} title="Find a matching Pokémon">
            Search for a Pokémon that validly connects to your <em>current</em> Pokémon through that category. In
            <strong> Hard mode</strong> the category shows an exact value to match (e.g. "Generation 1" or "Weakness:
            Ground, Psychic"). In <strong>Easy mode</strong> any shared value for that category works.
          </Step>
          <Step n={4} title="Build the chain">
            Every valid pick joins the chain and consumes that category. Made a wrong turn? Use{' '}
            <strong>Undo</strong> to back up a step — nothing is final until you reach the target.
          </Step>
          <Step n={5} title="Reach the target">
            Solve it by using <em>every</em> required category exactly once and landing on the target Pokémon as your
            very last link.
          </Step>
          <Step n={6} title="Stuck?">
            Hints tell you how many Pokémon could work next — and when possible, suggest one that's guaranteed to
            keep the rest of the puzzle solvable, not just the next step.
          </Step>
        </ol>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-brand-600 py-3 font-display font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Let's play
        </button>
      </div>
    </div>,
    document.body,
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-500 font-display text-sm font-bold text-white">
        {n}
      </span>
      <div>
        <div className="font-display font-semibold text-slate-900 dark:text-slate-100">{title}</div>
        <div>{children}</div>
      </div>
    </li>
  );
}
