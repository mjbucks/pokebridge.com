import type { FeedbackState } from '../hooks/useGame';

export function FeedbackBanner({ feedback }: { feedback: FeedbackState | null }) {
  if (!feedback) return null;
  const { result } = feedback;

  return (
    <div
      role="status"
      className={`w-full max-w-sm rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${
        result.valid
          ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
          : 'border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-300'
      }`}
    >
      <div className="font-bold">{result.valid ? '✓ VALID CONNECTION' : '✕ INVALID CONNECTION'}</div>
      <div className="mt-0.5">{result.reason}</div>
    </div>
  );
}
